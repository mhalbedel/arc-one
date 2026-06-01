import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, PricingRuleRow, PricingSettingsRow } from '@/types/database'
import type { PricingData, PricingRules, PricingSettings } from '@/types'
import { DEFAULT_PRICING_SETTINGS, ruleKey } from '@/lib/pricing'

/**
 * Laedt die zentrale Preismatrix + Klassen-Grenzwerte einmal serverseitig.
 * Wird an Konfigurator-/Checkout-Clients durchgereicht und in der Checkout-Route
 * fuer die verbindliche Preisberechnung verwendet.
 */
export async function getPricingData(
  supabase: SupabaseClient<Database>,
): Promise<PricingData> {
  const [rulesRes, settingsRes] = await Promise.all([
    supabase.from('pricing_rules').select('*'),
    supabase.from('pricing_settings').select('*').limit(1).maybeSingle(),
  ])

  const ruleRows = (rulesRes.data ?? []) as PricingRuleRow[]
  const rules: PricingRules = {}
  for (const row of ruleRows) {
    rules[ruleKey(row.component, row.variant, row.tier)] = row.price_cents
  }

  const s = settingsRes.data as PricingSettingsRow | null
  const settings: PricingSettings = s
    ? {
        size_klein_max_cm2: s.size_klein_max_cm2,
        size_mittel_max_cm2: s.size_mittel_max_cm2,
        weight_leicht_max_g: s.weight_leicht_max_g,
        weight_mittel_max_g: s.weight_mittel_max_g,
      }
    : DEFAULT_PRICING_SETTINGS

  return { rules, settings }
}
