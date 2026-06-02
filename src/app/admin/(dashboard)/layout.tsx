import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminShell } from '@/components/admin/admin-shell'

/**
 * Geschuetztes Admin-Layout. Zweite Schutzebene nach der Middleware:
 * prueft die Mitgliedschaft in admin_profiles. Ein eingeloggter Nicht-Admin
 * (z.B. B2B-Konto) wird abgewiesen.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data } = await supabase
    .from('admin_profiles')
    .select('name')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const profile = data as { name: string } | null
  if (!profile) redirect('/admin/login?denied=1')

  return <AdminShell adminName={profile.name}>{children}</AdminShell>
}
