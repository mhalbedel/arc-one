'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  validatePricing,
  type PricingRuleInput,
  type PricingSettingsInput,
} from './validation'

export type { PricingRuleInput, PricingSettingsInput }

export async function savePricing(
  rules: PricingRuleInput[],
  settings: PricingSettingsInput,
): Promise<{ error?: string }> {
  const validationError = validatePricing(rules, settings)
  if (validationError) return { error: validationError }

  const supabase = await createClient()

  const settingsValues = {
    size_klein_max_cm2: settings.size_klein_max_cm2,
    size_mittel_max_cm2: settings.size_mittel_max_cm2,
    weight_leicht_max_g: settings.weight_leicht_max_g,
    weight_mittel_max_g: settings.weight_mittel_max_g,
  }
  const settingsRes = settings.id
    ? await supabase.from('pricing_settings').update(settingsValues as never).eq('id', settings.id)
    : await supabase.from('pricing_settings').insert(settingsValues as never)
  if (settingsRes.error) return { error: settingsRes.error.message }

  // Bestehende Regeln per id aktualisieren, fehlende neu anlegen
  // (Unique-Index nutzt COALESCE(variant,'') -> kein onConflict-Upsert moeglich)
  for (const r of rules.filter((x) => x.id)) {
    const { error } = await supabase
      .from('pricing_rules')
      .update({ price_cents: r.price_cents } as never)
      .eq('id', r.id!)
    if (error) return { error: error.message }
  }

  const inserts = rules
    .filter((x) => !x.id)
    .map((r) => ({
      component: r.component,
      variant: r.variant,
      tier: r.tier,
      price_cents: r.price_cents,
    }))
  if (inserts.length > 0) {
    const { error } = await supabase.from('pricing_rules').insert(inserts as never)
    if (error) return { error: error.message }
  }

  revalidatePath('/admin/preismatrix')
  return {}
}
