import { createClient } from '@supabase/supabase-js'
import { NONEXISTENT_ID } from './seed'

/**
 * Service-Rolle-Client für Test-Aufräumarbeiten (gleiche Env wie global-setup).
 * Nur in E2E gegen die Test-Supabase verwenden.
 */
export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Test-DB-Env fehlt (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).')
  return createClient(url, key, { auth: { persistSession: false } })
}

/** Entfernt alle Bestellungen (+ order_items via Cascade) — Precondition-Isolation. */
export async function clearOrders() {
  const db = serviceClient()
  await db.from('order_items').delete().neq('id', NONEXISTENT_ID)
  await db.from('orders').delete().neq('id', NONEXISTENT_ID)
}

/** Löscht eine einzelne Bestellung (order_items cascaden). */
export async function deleteOrder(id: string) {
  await serviceClient().from('orders').delete().eq('id', id)
}
