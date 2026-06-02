'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ArcStatus } from '@/types'

export interface ArcInput {
  id?: string
  serial_number: string
  base_price: number // Cent
  width_cm: number
  height_cm: number
  depth_cm: number
  weight_grams: number
  character: string
  harvest_date: string | null
  forest_section: string | null
  cut_number: number | null
  status: ArcStatus
  is_sanded: boolean
  is_featured: boolean
  max_spinne_pendants: number | null
  blocked_options: string[]
  photo_front_url: string | null
  photo_back_url: string | null
  scan_3d_url: string | null
}

function mapArcError(error: { code?: string; message: string }): string {
  if (error.code === '23505') return 'Diese Seriennummer existiert bereits.'
  return error.message || 'Speichern fehlgeschlagen.'
}

export async function saveArc(input: ArcInput): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient()
  const { id, ...fields } = input

  if (id) {
    const { error } = await supabase
      .from('arcs')
      .update(fields as never)
      .eq('id', id)
    if (error) return { error: mapArcError(error) }
    revalidatePath('/admin/arcs')
    revalidatePath(`/admin/arcs/${id}`)
    return { id }
  }

  const { data, error } = await supabase
    .from('arcs')
    .insert(fields as never)
    .select('id')
    .single()
  if (error) return { error: mapArcError(error) }
  revalidatePath('/admin/arcs')
  return { id: (data as { id: string }).id }
}

export async function archiveArc(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const status: ArcStatus = 'ARCHIVED'
  const { error } = await supabase
    .from('arcs')
    .update({ status } as never)
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/arcs')
  revalidatePath(`/admin/arcs/${id}`)
  return {}
}
