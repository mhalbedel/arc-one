import type {
  Arc,
  CheckoutConfig,
  FinishType,
  LightType,
  MountingType,
  PricingData,
  PricingRules,
  PricingSettings,
  ShippingCountry,
  SizeClass,
  WeightClass,
} from '@/types'
import { SHIPPING_PRICES } from '@/types'

/** Fallback, falls (noch) kein pricing_settings-Datensatz existiert. */
export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  size_klein_max_cm2: 3000,
  size_mittel_max_cm2: 6000,
  weight_leicht_max_g: 2000,
  weight_mittel_max_g: 5000,
}

/** Baut den Lookup-Key. Bei schliff (variant null) ohne Varianten-Segment. */
export function ruleKey(component: string, variant: string | null, tier: string): string {
  return variant ? `${component}:${variant}:${tier}` : `${component}:${tier}`
}

/** Groessenklasse aus Flaeche (Hoehe x Breite). Fehlende Masse -> kleinste Klasse. */
export function sizeClass(arc: Arc, settings: PricingSettings): SizeClass {
  const area = (arc.width_cm ?? 0) * (arc.height_cm ?? 0)
  if (area <= settings.size_klein_max_cm2) return 'klein'
  if (area <= settings.size_mittel_max_cm2) return 'mittel'
  return 'gross'
}

/** Gewichtsklasse aus weight_grams. Fehlendes Gewicht -> kleinste Klasse. */
export function weightClass(arc: Arc, settings: PricingSettings): WeightClass {
  const g = arc.weight_grams ?? 0
  if (g <= settings.weight_leicht_max_g) return 'leicht'
  if (g <= settings.weight_mittel_max_g) return 'mittel'
  return 'schwer'
}

function lookup(rules: PricingRules, key: string): number {
  return rules[key] ?? 0
}

/** Schliff-Aufpreis nach Groessenklasse. */
export function sandingPriceFor(arc: Arc, pricing: PricingData): number {
  return lookup(pricing.rules, ruleKey('schliff', null, sizeClass(arc, pricing.settings)))
}

/** Finish-Aufpreis nach Typ x Groesse. "unbehandelt"/null = 0. */
export function finishPriceFor(arc: Arc, finish: FinishType | null, pricing: PricingData): number {
  if (!finish || finish === 'unbehandelt') return 0
  return lookup(pricing.rules, ruleKey('finish', finish, sizeClass(arc, pricing.settings)))
}

/** Licht-Aufpreis nach Typ x Groesse. "ohne"/null = 0. */
export function lightPriceFor(arc: Arc, light: LightType | null, pricing: PricingData): number {
  if (!light || light === 'ohne') return 0
  return lookup(pricing.rules, ruleKey('light', light, sizeClass(arc, pricing.settings)))
}

/** Spinne-Preis pro Pendel nach Gewichtsklasse. */
export function spinnePerPendantFor(arc: Arc, pricing: PricingData): number {
  return lookup(pricing.rules, ruleKey('mounting', 'spinne', weightClass(arc, pricing.settings)))
}

/** Befestigungs-Aufpreis nach Typ x Gewicht. Spinne = pro Pendel x Anzahl. "ohne"/null = 0. */
export function mountingPriceFor(
  arc: Arc,
  mounting: MountingType | null,
  spinneCount: number | undefined,
  pricing: PricingData,
): number {
  if (!mounting || mounting === 'ohne') return 0
  if (mounting === 'spinne') return spinnePerPendantFor(arc, pricing) * (spinneCount ?? 1)
  return lookup(pricing.rules, ruleKey('mounting', mounting, weightClass(arc, pricing.settings)))
}

/**
 * Verbindliche Preisberechnung fuer Konfigurator (Live-Anzeige) und Checkout
 * (server-seitig massgeblich). Quelle: zentrale Preismatrix.
 */
export function calcCheckoutPrices(
  arc: Arc,
  config: CheckoutConfig,
  shippingCountry: ShippingCountry,
  pricing: PricingData,
) {
  const sandingPrice = config.sandingChoice === 'schleifen' ? sandingPriceFor(arc, pricing) : 0
  const mountingPrice = mountingPriceFor(arc, config.mounting, config.spinneCount, pricing)
  const finishPrice = finishPriceFor(arc, config.finish, pricing)
  const lightPrice = lightPriceFor(arc, config.light, pricing)

  const shippingPrice = SHIPPING_PRICES[shippingCountry]
  const subtotal = arc.base_price + sandingPrice + mountingPrice + finishPrice + lightPrice
  const total = subtotal + shippingPrice
  const deposit = Math.round(total * 0.3)
  const remaining = total - deposit

  return { sandingPrice, mountingPrice, finishPrice, lightPrice, shippingPrice, subtotal, total, deposit, remaining }
}
