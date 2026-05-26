import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { KonfiguratorClient } from '@/components/konfigurator/konfigurator-client'
import { BlockedPage } from '@/components/konfigurator/blocked-page'
import type { Arc } from '@/types'

type KonfiguratorPageProps = {
  params: Promise<{ arc_id: string }>
}

export default async function KonfiguratorPage({ params }: KonfiguratorPageProps) {
  const { arc_id } = await params
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

  return <KonfiguratorClient arc={arc} />
}
