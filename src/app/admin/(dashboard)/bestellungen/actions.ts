'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types'

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: current } = await supabase
    .from('orders')
    .select('confirmed_at')
    .eq('id', id)
    .single()
  const confirmedAt = (current as { confirmed_at: string | null } | null)?.confirmed_at ?? null

  const patch: Record<string, unknown> = { status }
  // confirmedAt/By nur beim erstmaligen Wechsel auf CONFIRMED setzen
  if (status === 'CONFIRMED' && !confirmedAt) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    patch.confirmed_at = new Date().toISOString()
    patch.confirmed_by = user?.id ?? null
  }

  const { data, error } = await supabase
    .from('orders')
    .update(patch as never)
    .eq('id', id)
    .select('id')
  if (error) return { error: error.message }
  if (!data || data.length === 0) {
    return { error: 'Bestellung nicht gefunden oder kein Schreibzugriff.' }
  }

  revalidatePath('/admin/bestellungen')
  revalidatePath(`/admin/bestellungen/${id}`)
  return {}
}

export async function saveAdminNotes(id: string, notes: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .update({ admin_notes: notes.trim() || null } as never)
    .eq('id', id)
    .select('id')
  if (error) return { error: error.message }
  if (!data || data.length === 0) {
    return { error: 'Bestellung nicht gefunden oder kein Schreibzugriff.' }
  }

  revalidatePath(`/admin/bestellungen/${id}`)
  return {}
}
