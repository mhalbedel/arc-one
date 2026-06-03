import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe-server'
import { resolveCartItems, type ServerCartItem } from '@/lib/shop-server'
import { calcShipping } from '@/lib/shop'
import type { ShippingCountry } from '@/types'

/** Kurzzeit-Sperre, die einen parallelen Kauf desselben Unikats blockiert. */
const HOLD_MS = 15 * 60 * 1000

const bodySchema = z.object({
  refs: z
    .array(z.object({ source: z.enum(['product', 'arc']), code: z.string().min(1) }))
    .min(1)
    .max(50),
  contactData: z
    .object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      street: z.string().min(1),
      zip: z.string().regex(/^\d{4,5}$/),
      city: z.string().min(1),
      country: z.enum(['DE', 'AT', 'CH']),
    })
    .superRefine((data, ctx) => {
      const ok =
        data.country === 'DE' ? /^\d{5}$/.test(data.zip) : /^\d{4}$/.test(data.zip)
      if (!ok) {
        ctx.addIssue({
          code: 'custom',
          path: ['zip'],
          message: `Ungültige PLZ für ${data.country === 'DE' ? 'Deutschland (5 Ziffern)' : 'Österreich/Schweiz (4 Ziffern)'}`,
        })
      }
    }),
})

type Supa = ReturnType<typeof createAdminClient>

/**
 * Versucht, eine Position atomar zu sperren. Erfolg nur, wenn das Unikat
 * verfügbar und nicht bereits anderweitig gesperrt ist.
 */
async function tryHold(
  supabase: Supa,
  item: ServerCartItem,
  holdToken: string,
): Promise<boolean> {
  const nowIso = new Date().toISOString()
  const untilIso = new Date(Date.now() + HOLD_MS).toISOString()

  if (item.display.source === 'product') {
    const { data } = await supabase
      .from('products')
      .update({ held_until: untilIso } as unknown as never)
      .eq('id', item.id)
      .eq('status', 'AVAILABLE')
      .or(`held_until.is.null,held_until.lt.${nowIso}`)
      .select('id')
      .maybeSingle()
    return !!data
  }

  const { data } = await supabase
    .from('arcs')
    .update({ reserved_until: untilIso, reserved_by: holdToken } as unknown as never)
    .eq('id', item.id)
    .eq('status', 'FIXED')
    .is('order_id', null)
    .or(`reserved_until.is.null,reserved_until.lt.${nowIso}`)
    .select('id')
    .maybeSingle()
  return !!data
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const { refs, contactData } = parsed.data
  const country = contactData.country as ShippingCountry
  const supabase = createAdminClient()
  const holdToken = randomUUID()

  const resolved = await resolveCartItems(supabase, refs)

  // Verfügbarkeit serverseitig prüfen + atomar sperren
  const held: ServerCartItem[] = []
  const removed: { source: string; code: string; name: string }[] = []
  for (const item of resolved) {
    if (item.display.available && (await tryHold(supabase, item, holdToken))) {
      held.push(item)
    } else {
      removed.push({ source: item.display.source, code: item.display.code, name: item.display.name })
    }
  }

  if (held.length === 0) {
    return NextResponse.json(
      { error: 'Keines der Stücke ist mehr verfügbar.', removed },
      { status: 409 },
    )
  }

  // Verbindliche Beträge serverseitig berechnen
  const itemsForCalc = held.map((h) => ({ ...h.display, available: true }))
  const subtotal = itemsForCalc.reduce((s, i) => s + i.priceCents, 0)
  const shipping = calcShipping(itemsForCalc, country)
  const total = subtotal + shipping

  // Kunde anlegen/aktualisieren
  const deliveryAddress = {
    street: contactData.street,
    zip: contactData.zip,
    city: contactData.city,
    country: contactData.country,
  }
  const customerInsert = await supabase
    .from('customers')
    .upsert(
      {
        email: contactData.email,
        name: `${contactData.firstName} ${contactData.lastName}`,
        phone: contactData.phone || null,
        address: { delivery: deliveryAddress, billing: null },
      } as unknown as never,
      { onConflict: 'email' },
    )
    .select('id')
    .single()
  const customer = customerInsert.data as { id: string } | null
  if (customerInsert.error || !customer) {
    return NextResponse.json({ error: 'Kundendaten konnten nicht gespeichert werden.' }, { status: 500 })
  }

  // Order anlegen (Shop, 100 % Sofortzahlung über die Deposit-Felder abgebildet)
  const orderNumber = `SHOP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
  const orderInsert = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      order_type: 'SHOP',
      config: { items: held.map((h) => ({ source: h.display.source, code: h.display.code })) },
      base_price: subtotal,
      shipping_price: shipping,
      total_price: total,
      estimated_days: 14,
      customer_id: customer.id,
      deposit_amount: total,
      remaining_amount: 0,
      status: 'PENDING_CONFIRMATION',
    } as unknown as never)
    .select('id')
    .single()
  const order = orderInsert.data as { id: string } | null
  if (orderInsert.error || !order) {
    return NextResponse.json({ error: 'Bestellung konnte nicht angelegt werden.' }, { status: 500 })
  }

  // Positionen (Preis-/Name-Snapshot je Unikat)
  const { error: itemsError } = await supabase.from('order_items').insert(
    held.map((h) => ({
      order_id: order.id,
      product_id: h.display.source === 'product' ? h.id : null,
      arc_id: h.display.source === 'arc' ? h.id : null,
      name_snapshot: h.display.name,
      price_cents: h.display.priceCents,
    })) as unknown as never,
  )
  if (itemsError) {
    return NextResponse.json({ error: 'Bestellpositionen konnten nicht angelegt werden.' }, { status: 500 })
  }

  // Ein PaymentIntent über den vollen Betrag
  const paymentIntent = await getStripe().paymentIntents.create({
    amount: total,
    currency: 'eur',
    metadata: { orderId: order.id, orderType: 'SHOP' },
    automatic_payment_methods: { enabled: true },
  })

  await supabase
    .from('orders')
    .update({ stripe_deposit_id: paymentIntent.id } as unknown as never)
    .eq('id', order.id)

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    orderId: order.id,
    orderNumber,
    items: held.map((h) => h.display),
    removed,
    subtotal,
    shipping,
    total,
  })
}
