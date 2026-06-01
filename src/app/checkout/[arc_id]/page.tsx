import { redirect, notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPricingData } from '@/lib/pricing-data'
import { CheckoutClient } from '@/components/checkout/checkout-client'
import type { Arc } from '@/types'

type CheckoutPageProps = {
  params: Promise<{ arc_id: string }>
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { arc_id } = await params
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('arcs')
    .select('*')
    .eq('id', arc_id)
    .single()

  const arc = data as Arc | null

  if (!arc || arc.status !== 'RESERVED') {
    notFound()
  }

  if (!arc.reserved_until || new Date(arc.reserved_until) <= new Date()) {
    redirect(`/konfigurator/${arc_id}?expired=1`)
  }

  const pricing = await getPricingData(supabase)

  return <CheckoutClient arc={arc} pricing={pricing} />
}
