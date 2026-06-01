import { describe, it, expect } from 'vitest'
import {
  calcCheckoutPrices,
  sizeClass,
  weightClass,
  ruleKey,
  DEFAULT_PRICING_SETTINGS,
} from './pricing'
import type { Arc, PricingData } from '@/types'

// Arc: 90 x 50 = 4500 cm2 -> "mittel"; 2000 g -> "leicht"
const baseArc: Arc = {
  id: 'test-id',
  serial_number: 'ARV-TEST',
  width_cm: 90,
  height_cm: 50,
  depth_cm: 20,
  weight_grams: 2000,
  harvest_date: null,
  forest_section: null,
  cut_number: null,
  character: 'Test arc',
  photo_front_url: null,
  photo_back_url: null,
  scan_3d_url: null,
  compat_ohne: true,
  compat_wand: true,
  compat_decke: true,
  compat_spinne: true,
  max_spinne_pendants: 3,
  compat_oel: true,
  compat_lack: true,
  compat_schellack: true,
  blocked_options: [],
  is_featured: false,
  is_sanded: false,
  status: 'READY',
  base_price: 60000, // 600 EUR in cents
  price_mounting_wall: null,
  price_mounting_ceiling: null,
  price_mounting_spinne_per: null,
  price_finish_oil: null,
  price_finish_lacquer: null,
  price_finish_shellac: null,
  price_sanding: null,
  price_light_porcelain: null,
  price_light_bg_led: null,
  price_light_true_led: null,
  drop_id: null,
  reserved_until: null,
  reserved_by: null,
  order_id: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const pricing: PricingData = {
  settings: DEFAULT_PRICING_SETTINGS,
  rules: {
    [ruleKey('schliff', null, 'klein')]: 8000,
    [ruleKey('schliff', null, 'mittel')]: 12000,
    [ruleKey('schliff', null, 'gross')]: 18000,
    [ruleKey('finish', 'oel', 'mittel')]: 6000,
    [ruleKey('mounting', 'wand', 'leicht')]: 4000,
    [ruleKey('mounting', 'wand', 'schwer')]: 9000,
    [ruleKey('mounting', 'spinne', 'leicht')]: 2500,
    [ruleKey('light', 'porzellan', 'mittel')]: 1500,
  },
}

describe('size/weight classification', () => {
  it('classifies size from height x width with admin thresholds', () => {
    expect(sizeClass({ ...baseArc, width_cm: 50, height_cm: 50 }, pricing.settings)).toBe('klein') // 2500
    expect(sizeClass(baseArc, pricing.settings)).toBe('mittel') // 4500
    expect(sizeClass({ ...baseArc, width_cm: 100, height_cm: 61 }, pricing.settings)).toBe('gross') // 6100
  })

  it('lower boundary belongs to the higher class (3000 -> klein, 3001 -> mittel)', () => {
    expect(sizeClass({ ...baseArc, width_cm: 100, height_cm: 30 }, pricing.settings)).toBe('klein') // 3000
    expect(sizeClass({ ...baseArc, width_cm: 100, height_cm: 30.01 }, pricing.settings)).toBe('mittel') // 3001
  })

  it('classifies weight with admin thresholds', () => {
    expect(weightClass({ ...baseArc, weight_grams: 2000 }, pricing.settings)).toBe('leicht')
    expect(weightClass({ ...baseArc, weight_grams: 2001 }, pricing.settings)).toBe('mittel')
    expect(weightClass({ ...baseArc, weight_grams: 5001 }, pricing.settings)).toBe('schwer')
  })

  it('falls back to smallest class when dimensions/weight are missing', () => {
    const noDims = { ...baseArc, width_cm: 0, height_cm: 0, weight_grams: 0 }
    expect(sizeClass(noDims, pricing.settings)).toBe('klein')
    expect(weightClass(noDims, pricing.settings)).toBe('leicht')
  })
})

describe('calcCheckoutPrices (matrix-based)', () => {
  it('rohling (no sanding): only base + light(porzellan, mittel) + shipping', () => {
    const prices = calcCheckoutPrices(
      baseArc,
      { sandingChoice: 'rohling', mounting: 'ohne', finish: null, light: 'porzellan' },
      'DE',
      pricing,
    )
    expect(prices.sandingPrice).toBe(0)
    expect(prices.mountingPrice).toBe(0)
    expect(prices.finishPrice).toBe(0)
    expect(prices.lightPrice).toBe(1500)
    expect(prices.shippingPrice).toBe(2900)
    expect(prices.subtotal).toBe(61500)
    expect(prices.total).toBe(64400)
    expect(prices.deposit).toBe(Math.round(64400 * 0.3))
    expect(prices.deposit + prices.remaining).toBe(prices.total)
  })

  it('applies sanding price (size class) only when sandingChoice is schleifen', () => {
    const withSanding = calcCheckoutPrices(
      baseArc,
      { sandingChoice: 'schleifen', mounting: 'ohne', finish: 'oel', light: 'porzellan' },
      'DE',
      pricing,
    )
    expect(withSanding.sandingPrice).toBe(12000) // schliff:mittel
    expect(withSanding.finishPrice).toBe(6000) // finish:oel:mittel

    const geschliffen = calcCheckoutPrices(
      baseArc,
      { sandingChoice: 'geschliffen', mounting: 'ohne', finish: null, light: 'porzellan' },
      'DE',
      pricing,
    )
    expect(geschliffen.sandingPrice).toBe(0)
  })

  it('mounting price uses weight class; heavier arc costs more', () => {
    const leicht = calcCheckoutPrices(
      baseArc,
      { sandingChoice: 'rohling', mounting: 'wand', finish: null, light: 'porzellan' },
      'DE',
      pricing,
    )
    expect(leicht.mountingPrice).toBe(4000) // wand:leicht

    const schwer = calcCheckoutPrices(
      { ...baseArc, weight_grams: 6000 },
      { sandingChoice: 'rohling', mounting: 'wand', finish: null, light: 'porzellan' },
      'DE',
      pricing,
    )
    expect(schwer.mountingPrice).toBe(9000) // wand:schwer
    expect(schwer.mountingPrice).toBeGreaterThan(leicht.mountingPrice)
  })

  it('spinne = per-pendant price of weight class x count', () => {
    const prices = calcCheckoutPrices(
      baseArc,
      { sandingChoice: 'rohling', mounting: 'spinne', spinneCount: 3, finish: null, light: 'porzellan' },
      'DE',
      pricing,
    )
    expect(prices.mountingPrice).toBe(7500) // 2500 (spinne:leicht) x 3
  })

  it('charges 0 for opt-out options (mounting ohne, finish unbehandelt, light ohne)', () => {
    const prices = calcCheckoutPrices(
      baseArc,
      { sandingChoice: 'schleifen', mounting: 'ohne', finish: 'unbehandelt', light: 'ohne' },
      'DE',
      pricing,
    )
    expect(prices.mountingPrice).toBe(0)
    expect(prices.finishPrice).toBe(0)
    expect(prices.lightPrice).toBe(0)
    expect(prices.subtotal).toBe(baseArc.base_price + 12000) // nur Grundpreis + Schliff
  })

  it('uses AT/CH shipping price of 4900', () => {
    const at = calcCheckoutPrices(
      baseArc,
      { sandingChoice: 'rohling', mounting: 'ohne', finish: null, light: 'porzellan' },
      'AT',
      pricing,
    )
    expect(at.shippingPrice).toBe(4900)
  })

  it('missing rule defaults to 0 (no crash)', () => {
    const prices = calcCheckoutPrices(
      baseArc,
      // finish:lack:mittel und mounting:decke:leicht fehlen im Fixture -> 0
      { sandingChoice: 'schleifen', mounting: 'decke', finish: 'lack', light: 'porzellan' },
      'DE',
      pricing,
    )
    expect(prices.finishPrice).toBe(0)
    expect(prices.mountingPrice).toBe(0)
  })
})
