import { describe, it, expect } from 'vitest'
import { calcCheckoutPrices } from './pricing'
import type { Arc } from '@/types'

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
  price_mounting_wall: 5000,
  price_mounting_ceiling: 7000,
  price_mounting_spinne_per: 3000,
  price_finish_oil: 4000,
  price_finish_lacquer: 5000,
  price_finish_shellac: 6000,
  price_sanding: 2000,
  price_light_porcelain: 1000,
  price_light_bg_led: 2000,
  price_light_true_led: 3000,
  drop_id: null,
  reserved_until: null,
  reserved_by: null,
  order_id: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('calcCheckoutPrices', () => {
  it('calculates correct prices for rohling (no sanding) with DE shipping', () => {
    const prices = calcCheckoutPrices(
      baseArc,
      { sandingChoice: 'rohling', mounting: 'ohne', finish: null, light: 'porzellan' },
      'DE',
    )
    expect(prices.sandingPrice).toBe(0)
    expect(prices.mountingPrice).toBe(0)
    expect(prices.finishPrice).toBe(0)
    expect(prices.lightPrice).toBe(1000)
    expect(prices.shippingPrice).toBe(2900)
    expect(prices.subtotal).toBe(61000)
    expect(prices.total).toBe(63900)
    expect(prices.deposit).toBe(Math.round(63900 * 0.3)) // 19170
    expect(prices.remaining).toBe(63900 - Math.round(63900 * 0.3))
  })

  it('applies sanding price only when sandingChoice is schleifen', () => {
    const withSanding = calcCheckoutPrices(
      baseArc,
      { sandingChoice: 'schleifen', mounting: 'ohne', finish: null, light: 'porzellan' },
      'DE',
    )
    expect(withSanding.sandingPrice).toBe(2000)

    const rohling = calcCheckoutPrices(
      baseArc,
      { sandingChoice: 'rohling', mounting: 'ohne', finish: null, light: 'porzellan' },
      'DE',
    )
    expect(rohling.sandingPrice).toBe(0)

    const geschliffen = calcCheckoutPrices(
      baseArc,
      { sandingChoice: 'geschliffen', mounting: 'ohne', finish: null, light: 'porzellan' },
      'DE',
    )
    expect(geschliffen.sandingPrice).toBe(0)
  })

  it('charges 0 for the opt-out options (mounting ohne, finish unbehandelt, light ohne)', () => {
    const prices = calcCheckoutPrices(
      baseArc,
      { sandingChoice: 'schleifen', mounting: 'ohne', finish: 'unbehandelt', light: 'ohne' },
      'DE',
    )
    expect(prices.mountingPrice).toBe(0)
    expect(prices.finishPrice).toBe(0)
    expect(prices.lightPrice).toBe(0)
    // nur Grundpreis + Schliff + Versand
    expect(prices.subtotal).toBe(baseArc.base_price + 2000)
  })

  it('calculates spinne mounting price by count', () => {
    const prices = calcCheckoutPrices(
      baseArc,
      { sandingChoice: 'rohling', mounting: 'spinne', spinneCount: 3, finish: null, light: 'porzellan' },
      'DE',
    )
    expect(prices.mountingPrice).toBe(9000) // 3 × 3000
  })

  it('uses AT/CH shipping price of 4900', () => {
    const at = calcCheckoutPrices(
      baseArc,
      { sandingChoice: 'rohling', mounting: 'ohne', finish: null, light: 'porzellan' },
      'AT',
    )
    expect(at.shippingPrice).toBe(4900)

    const ch = calcCheckoutPrices(
      baseArc,
      { sandingChoice: 'rohling', mounting: 'ohne', finish: null, light: 'porzellan' },
      'CH',
    )
    expect(ch.shippingPrice).toBe(4900)
  })

  it('rounds deposit to nearest cent (30%)', () => {
    // total = 60000 + 2900 = 62900; 30% = 18870.0 → 18870
    const prices = calcCheckoutPrices(
      baseArc,
      { sandingChoice: 'rohling', mounting: 'ohne', finish: null, light: 'porzellan' },
      'DE',
    )
    expect(prices.deposit).toBe(Math.round(prices.total * 0.3))
    expect(prices.deposit + prices.remaining).toBe(prices.total)
  })

  it('handles null price fields on arc gracefully (defaults to 0)', () => {
    const arcNoOptions: Arc = { ...baseArc, price_sanding: null, price_mounting_wall: null }
    const prices = calcCheckoutPrices(
      arcNoOptions,
      { sandingChoice: 'schleifen', mounting: 'wand', finish: null, light: 'porzellan' },
      'DE',
    )
    expect(prices.sandingPrice).toBe(0)
    expect(prices.mountingPrice).toBe(0)
  })
})
