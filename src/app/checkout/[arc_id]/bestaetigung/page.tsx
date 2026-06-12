import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe-server'
import { OrderConfirmation } from '@/components/checkout/order-confirmation'
import { claimOrderEmail } from '@/lib/email/guard'
import { sendPreOrderEmails } from '@/lib/email/senders'
import type { Address, Arc, Order, Customer } from '@/types'

type BestaetigungPageProps = {
  params: Promise<{ arc_id: string }>
  searchParams: Promise<{ payment_intent?: string; redirect_status?: string }>
}

export default async function BestaetigungPage({ params, searchParams }: BestaetigungPageProps) {
  const { arc_id } = await params
  const { payment_intent, redirect_status } = await searchParams

  if (!payment_intent || redirect_status !== 'succeeded') {
    notFound()
  }

  const supabase = createAdminClient()

  const { data: arcData } = await supabase
    .from('arcs')
    .select('*')
    .eq('id', arc_id)
    .single()

  const arc = arcData as Arc | null

  if (!arc || !arc.order_id) {
    notFound()
  }

  const { data: orderData } = await supabase
    .from('orders')
    .select('*')
    .eq('id', arc.order_id)
    .single()

  const order = orderData as Order | null

  if (!order || order.stripe_deposit_id !== payment_intent) {
    notFound()
  }

  // Fetch customer for confirmation display + E-Mail-Versand
  let customer: Pick<Customer, 'name' | 'email' | 'address'> | null = null
  if (order.customer_id) {
    const { data: customerData } = await supabase
      .from('customers')
      .select('name, email, address')
      .eq('id', order.customer_id)
      .single()
    customer = (customerData as Pick<Customer, 'name' | 'email' | 'address'> | null) ?? null
  }
  const customerEmail = customer?.email ?? null

  // Verify with Stripe and update statuses (idempotent)
  if (order.status === 'PENDING_CONFIRMATION') {
    const paymentIntent = await getStripe().paymentIntents.retrieve(payment_intent)

    if (paymentIntent.status === 'succeeded') {
      await Promise.all([
        supabase
          .from('orders')
          .update({ status: 'CONFIRMED', deposit_paid_at: new Date().toISOString() } as unknown as never)
          .eq('id', order.id),
        supabase
          .from('arcs')
          .update({ status: 'ORDERED' } as unknown as never)
          .eq('id', arc_id),
      ])

      // Reflect updated values in the rendered page
      order.status = 'CONFIRMED'
      order.deposit_paid_at = new Date().toISOString()

      // Bestaetigungsmails (Kunde #1 + Atelier #5) — genau einmal, nicht-blockierend.
      if (customerEmail && (await claimOrderEmail(supabase, order.id))) {
        await sendPreOrderEmails(order, arc, {
          email: customerEmail,
          name: customer?.name,
          address: customer?.address as Address | null,
        })
      }
    }
  }

  return <OrderConfirmation arc={arc} order={order} customerEmail={customerEmail} />
}
