import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe-server'
import { calcCheckoutPrices } from '@/lib/pricing'
import type { Arc } from '@/types'

const bodySchema = z.object({
  arcId: z.string().uuid(),
  config: z.object({
    sandingChoice: z.enum(['schleifen', 'rohling', 'geschliffen']),
    mounting: z.enum(['ohne', 'wand', 'decke', 'spinne']),
    spinneCount: z.number().int().min(1).optional(),
    finish: z.enum(['oel', 'lack', 'schellack']).nullable(),
    light: z.enum(['porzellan', 'bg_led', 'true_led']),
  }),
  contactData: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    street: z.string().min(1),
    zip: z.string().regex(/^\d{4,5}$/),
    city: z.string().min(1),
    country: z.enum(['DE', 'AT', 'CH']),
    sameAsBilling: z.boolean(),
    billingStreet: z.string().optional(),
    billingZip: z.string().optional(),
    billingCity: z.string().optional(),
    billingCountry: z.enum(['DE', 'AT', 'CH']).optional(),
  }).superRefine((data, ctx) => {
    const zipForCountry = (zip: string, country: 'DE' | 'AT' | 'CH') => {
      if (country === 'DE' && !/^\d{5}$/.test(zip)) return false
      if ((country === 'AT' || country === 'CH') && !/^\d{4}$/.test(zip)) return false
      return true
    }
    if (!zipForCountry(data.zip, data.country)) {
      ctx.addIssue({ code: 'custom', path: ['zip'], message: `Ungültige PLZ für ${data.country === 'DE' ? 'Deutschland (5 Ziffern)' : 'Österreich/Schweiz (4 Ziffern)'}` })
    }
    if (!data.sameAsBilling && data.billingZip && data.billingCountry) {
      if (!zipForCountry(data.billingZip, data.billingCountry)) {
        ctx.addIssue({ code: 'custom', path: ['billingZip'], message: `Ungültige PLZ für ${data.billingCountry === 'DE' ? 'Deutschland (5 Ziffern)' : 'Österreich/Schweiz (4 Ziffern)'}` })
      }
    }
  }),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const { arcId, config, contactData } = parsed.data
  const supabase = createAdminClient()

  // Load arc and verify reservation
  const { data: arcData } = await supabase
    .from('arcs')
    .select('*')
    .eq('id', arcId)
    .single()

  const arc = arcData as Arc | null

  if (!arc || arc.status !== 'RESERVED') {
    return NextResponse.json({ error: 'Arc nicht reserviert.' }, { status: 409 })
  }

  if (!arc.reserved_until || new Date(arc.reserved_until) <= new Date()) {
    return NextResponse.json({ error: 'Reservierung ist abgelaufen.' }, { status: 409 })
  }

  // Calculate prices server-side
  const prices = calcCheckoutPrices(arc, config, contactData.country)

  // Build customer address
  const deliveryAddress = {
    street: contactData.street,
    zip: contactData.zip,
    city: contactData.city,
    country: contactData.country,
  }
  const billingAddress = contactData.sameAsBilling
    ? null
    : {
        street: contactData.billingStreet!,
        zip: contactData.billingZip!,
        city: contactData.billingCity!,
        country: contactData.billingCountry!,
      }

  // Upsert customer — reuse existing record if email already exists
  const customerInsert = await supabase
    .from('customers')
    .upsert(
      {
        email: contactData.email,
        name: `${contactData.firstName} ${contactData.lastName}`,
        phone: contactData.phone || null,
        address: { delivery: deliveryAddress, billing: billingAddress },
      } as unknown as never,
      { onConflict: 'email' },
    )
    .select('id')
    .single()
  const customer = customerInsert.data as { id: string } | null
  const customerError = customerInsert.error

  if (customerError || !customer) {
    return NextResponse.json({ error: 'Kundendaten konnten nicht gespeichert werden.' }, { status: 500 })
  }

  // Generate order number
  const orderNumber = `ARC-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

  // Create order record (PENDING_CONFIRMATION)
  const orderInsert = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      config: config as Record<string, unknown>,
      base_price: arc.base_price,
      sanding_price: prices.sandingPrice,
      mounting_price: prices.mountingPrice,
      finish_price: prices.finishPrice,
      light_price: prices.lightPrice,
      shipping_price: prices.shippingPrice,
      total_price: prices.total,
      estimated_days: 90,
      customer_id: customer!.id,
      deposit_amount: prices.deposit,
      remaining_amount: prices.remaining,
      status: 'PENDING_CONFIRMATION',
    } as unknown as never)
    .select('id')
    .single()
  const order = orderInsert.data as { id: string } | null
  const orderError = orderInsert.error

  if (orderError || !order) {
    return NextResponse.json({ error: 'Bestellung konnte nicht angelegt werden.' }, { status: 500 })
  }

  // Link arc to order
  await supabase
    .from('arcs')
    .update({ order_id: order!.id } as unknown as never)
    .eq('id', arcId)

  // Create Stripe PaymentIntent
  const paymentIntent = await getStripe().paymentIntents.create({
    amount: prices.deposit,
    currency: 'eur',
    metadata: { arcId, orderId: order.id },
    automatic_payment_methods: { enabled: true },
  })

  // Store stripe_deposit_id on order
  await supabase
    .from('orders')
    .update({ stripe_deposit_id: paymentIntent.id } as unknown as never)
    .eq('id', order!.id)

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
