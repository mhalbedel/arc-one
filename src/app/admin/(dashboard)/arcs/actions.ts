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

  // FIXED (Shop) ist nur aus READY (oder bereits FIXED) erreichbar — nie aus
  // RESERVED/ORDERED o. Ä. (PROJ-9 Edge Case: aktive Reservierung/Bestellung).
  if (id && fields.status === 'FIXED') {
    const { data: current } = await supabase.from('arcs').select('status').eq('id', id).maybeSingle()
    const status = (current as { status: ArcStatus } | null)?.status
    if (status && status !== 'READY' && status !== 'FIXED') {
      return { error: 'Auf FIXED nur aus dem Status READY umstellbar.' }
    }
  }

  if (id) {
    const { data, error } = await supabase
      .from('arcs')
      .update(fields as never)
      .eq('id', id)
      .select('id')
    if (error) return { error: mapArcError(error) }
    if (!data || data.length === 0) {
      return { error: 'Arc nicht gefunden oder kein Schreibzugriff.' }
    }
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
  const { data, error } = await supabase
    .from('arcs')
    .update({ status } as never)
    .eq('id', id)
    .select('id')
  if (error) return { error: error.message }
  if (!data || data.length === 0) {
    return { error: 'Arc nicht gefunden oder kein Schreibzugriff.' }
  }
  revalidatePath('/admin/arcs')
  revalidatePath(`/admin/arcs/${id}`)
  return {}
}
