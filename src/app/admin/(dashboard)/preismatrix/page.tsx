import { createClient } from '@/lib/supabase/server'
import { PricingEditor, type ExistingRule, type ExistingSettings } from '@/components/admin/pricing-editor'

export default async function PreismatrixPage() {
  const supabase = await createClient()
  const [rulesRes, settingsRes] = await Promise.all([
    supabase.from('pricing_rules').select('id, component, variant, tier, price_cents'),
    supabase.from('pricing_settings').select('*').limit(1).maybeSingle(),
  ])

  const rules = (rulesRes.data ?? []) as ExistingRule[]
  const settings = (settingsRes.data ?? null) as ExistingSettings | null

  return <PricingEditor rules={rules} settings={settings} />
}
