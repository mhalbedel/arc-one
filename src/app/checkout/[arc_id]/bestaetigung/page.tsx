import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { OrderConfirmation } from '@/components/checkout/order-confirmation'
import type { Arc, Order } from '@/types'

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

  return <OrderConfirmation arc={arc} order={order} />
}
