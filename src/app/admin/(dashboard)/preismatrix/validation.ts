export interface PricingRuleInput {
  id?: string
  component: string
  variant: string | null
  tier: string
  price_cents: number
}

export interface PricingSettingsInput {
  id?: string
  size_klein_max_cm2: number
  size_mittel_max_cm2: number
  weight_leicht_max_g: number
  weight_mittel_max_g: number
}

/**
 * Prueft Preismatrix-Eingaben. Gibt eine Fehlermeldung zurueck oder null, wenn gueltig.
 * Grenzwerte muessen > 0 und konsistent gestaffelt sein; Preise nicht-negative Ganzzahlen (Cent).
 */
export function validatePricing(
  rules: PricingRuleInput[],
  s: PricingSettingsInput,
): string | null {
  if (
    s.size_klein_max_cm2 <= 0 ||
    s.size_mittel_max_cm2 <= 0 ||
    s.weight_leicht_max_g <= 0 ||
    s.weight_mittel_max_g <= 0
  ) {
    return 'Alle Grenzwerte muessen groesser als 0 sein.'
  }
  if (s.size_klein_max_cm2 >= s.size_mittel_max_cm2) {
    return 'Groesse: klein-max muss kleiner als mittel-max sein.'
  }
  if (s.weight_leicht_max_g >= s.weight_mittel_max_g) {
    return 'Gewicht: leicht-max muss kleiner als mittel-max sein.'
  }
  for (const r of rules) {
    if (!Number.isFinite(r.price_cents) || !Number.isInteger(r.price_cents) || r.price_cents < 0) {
      return 'Preise muessen 0 oder groesser sein.'
    }
  }
  return null
}
