import { describe, it, expect } from 'vitest'
import { validatePricing, type PricingSettingsInput } from './validation'

const validSettings: PricingSettingsInput = {
  size_klein_max_cm2: 3000,
  size_mittel_max_cm2: 6000,
  weight_leicht_max_g: 1500,
  weight_mittel_max_g: 3000,
}

describe('validatePricing', () => {
  it('accepts consistent bounds and non-negative integer prices', () => {
    const rules = [{ component: 'finish', variant: 'oel', tier: 'klein', price_cents: 5000 }]
    expect(validatePricing(rules, validSettings)).toBeNull()
  })

  it('accepts a price of 0', () => {
    const rules = [{ component: 'schliff', variant: null, tier: 'klein', price_cents: 0 }]
    expect(validatePricing(rules, validSettings)).toBeNull()
  })

  it('rejects non-positive bounds', () => {
    expect(validatePricing([], { ...validSettings, size_klein_max_cm2: 0 })).toMatch(/groesser als 0/)
  })

  it('rejects size klein-max >= mittel-max', () => {
    expect(validatePricing([], { ...validSettings, size_klein_max_cm2: 6000 })).toMatch(/klein-max/)
  })

  it('rejects weight leicht-max >= mittel-max', () => {
    expect(validatePricing([], { ...validSettings, weight_leicht_max_g: 3000 })).toMatch(/leicht-max/)
  })

  it('rejects a negative price', () => {
    const rules = [{ component: 'light', variant: 'bg_led', tier: 'mittel', price_cents: -1 }]
    expect(validatePricing(rules, validSettings)).toMatch(/0 oder groesser/)
  })

  it('rejects a non-integer price', () => {
    const rules = [{ component: 'light', variant: 'bg_led', tier: 'mittel', price_cents: 12.5 }]
    expect(validatePricing(rules, validSettings)).toMatch(/0 oder groesser/)
  })
})
