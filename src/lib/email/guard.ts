import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types'

/**
 * Beansprucht den einmaligen Mailversand fuer eine Order via bedingtem Update
 * (`confirmation_email_sent_at` NULL -> jetzt). Gibt `true` nur fuer den ersten
 * erfolgreichen Aufruf zurueck — alle weiteren (Reload, zweiter Abschluss-Pfad,
 * Webhook-Replay) erhalten `false` und versenden nicht.
 */
export async function claimOrderEmail(
  supabase: SupabaseClient<Database>,
  orderId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('orders')
    .update({ confirmation_email_sent_at: new Date().toISOString() } as unknown as never)
    .eq('id', orderId)
    .is('confirmation_email_sent_at', null)
    .select('id')
    .maybeSingle()
  return !!data
}
