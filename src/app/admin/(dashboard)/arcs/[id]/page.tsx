import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArcForm } from '@/components/admin/arc-form'
import type { Arc } from '@/types'

export default async function EditArcPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('arcs').select('*').eq('id', id).maybeSingle()
  const arc = data as Arc | null
  if (!arc) notFound()
  return <ArcForm arc={arc} />
}
