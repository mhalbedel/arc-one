import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPricingData } from '@/lib/pricing-data'
import { KonfiguratorClient } from '@/components/konfigurator/konfigurator-client'
import { BlockedPage } from '@/components/konfigurator/blocked-page'
import type { Arc } from '@/types'

type KonfiguratorPageProps = {
  params: Promise<{ arc_id: string }>
  searchParams: Promise<{ expired?: string }>
}

export default async function KonfiguratorPage({ params, searchParams }: KonfiguratorPageProps) {
  const { arc_id } = await params
  const { expired } = await searchParams
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('arcs')
    .select('*')
    .eq('id', arc_id)
    .single()

  const arc = data as Arc | null

  if (!arc || (arc.status !== 'READY' && arc.status !== 'RESERVED')) {
    notFound()
  }

  if (arc.status === 'RESERVED' && arc.reserved_until && new Date(arc.reserved_until) > new Date()) {
    return <BlockedPage reservedUntil={arc.reserved_until} />
  }

  const pricing = await getPricingData(supabase)

  return <KonfiguratorClient arc={arc} pricing={pricing} expiredReservation={expired === '1'} />
}
