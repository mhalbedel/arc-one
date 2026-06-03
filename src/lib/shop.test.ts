import { describe, it, expect } from 'vitest'
import { calcShipping, calcSubtotal, productToShopItem, fixedArcToShopItem } from './shop'
import type { Arc, Product, ResolvedCartItem } from '@/types'

function product(partial: Partial<Product> = {}): Product {
  return {
    id: 'id-1',
    product_code: 'P-ABCDE',
    name: 'Schale Eukalyptus',
    description: 'desc',
    category: 'schalen_accessoires',
    tier: 'standard',
    purchase_mode: 'direct',
    price_cents: 25000,
    shipping_override_cents: null,
    photos: ['https://example.test/a.jpg', 'https://example.test/b.jpg'],
    model_3d_url: null,
    width_cm: null,
    height_cm: null,
    depth_cm: null,
    weight_grams: null,
    status: 'AVAILABLE',
    is_published: true,
    held_until: null,
    created_at: '2026-06-03T00:00:00Z',
    updated_at: '2026-06-03T00:00:00Z',
    ...partial,
  }
}

function arc(partial: Partial<Arc> = {}): Arc {
  return {
    id: 'arc-1',
    serial_number: 'ARC-0042',
    base_price: 180000,
    photo_front_url: 'https://example.test/front.jpg',
    status: 'FIXED',
    order_id: null,
    // restliche Felder sind für das Mapping irrelevant
    ...partial,
  } as unknown as Arc
}

function item(partial: Partial<ResolvedCartItem>): ResolvedCartItem {
  return {
    source: 'product',
    code: 'P-1',
    name: 'Test',
    priceCents: 10000,
    imageUrl: null,
    shippingOverrideCents: null,
    available: true,
    ...partial,
  }
}

describe('calcShipping', () => {
  it('charges one country flat rate when no overrides (not per item)', () => {
    const items = [item({}), item({ code: 'P-2' }), item({ code: 'P-3' })]
    expect(calcShipping(items, 'DE')).toBe(2900)
    expect(calcShipping(items, 'AT')).toBe(4900)
    expect(calcShipping(items, 'CH')).toBe(4900)
  })

  it('adds product overrides on top of the single country flat rate', () => {
    const items = [item({}), item({ code: 'P-2', shippingOverrideCents: 12000 })]
    // DE flat 2900 + override 12000
    expect(calcShipping(items, 'DE')).toBe(14900)
  })

  it('sums multiple overrides', () => {
    const items = [
      item({ shippingOverrideCents: 5000 }),
      item({ code: 'P-2', shippingOverrideCents: 7000 }),
    ]
    expect(calcShipping(items, 'DE')).toBe(2900 + 5000 + 7000)
  })

  it('ignores unavailable items', () => {
    const items = [item({}), item({ code: 'P-2', available: false, shippingOverrideCents: 9000 })]
    expect(calcShipping(items, 'DE')).toBe(2900)
  })

  it('is 0 when nothing is available', () => {
    const items = [item({ available: false })]
    expect(calcShipping(items, 'DE')).toBe(0)
  })
})

describe('calcSubtotal', () => {
  it('sums only available items', () => {
    const items = [
      item({ priceCents: 10000 }),
      item({ code: 'P-2', priceCents: 25000 }),
      item({ code: 'P-3', priceCents: 99999, available: false }),
    ]
    expect(calcSubtotal(items)).toBe(35000)
  })
})

describe('productToShopItem', () => {
  it('maps a product to the unified shop item with first photo as image', () => {
    const result = productToShopItem(product())
    expect(result).toMatchObject({
      source: 'product',
      code: 'P-ABCDE',
      name: 'Schale Eukalyptus',
      category: 'schalen_accessoires',
      tier: 'standard',
      purchaseMode: 'direct',
      priceCents: 25000,
      imageUrl: 'https://example.test/a.jpg',
      isSold: false,
    })
  })

  it('marks SOLD products as sold', () => {
    expect(productToShopItem(product({ status: 'SOLD' })).isSold).toBe(true)
  })

  it('falls back to null image when there are no photos', () => {
    expect(productToShopItem(product({ photos: [] })).imageUrl).toBeNull()
  })

  it('carries inquiry products with null price', () => {
    const result = productToShopItem(product({ purchase_mode: 'inquiry', price_cents: null }))
    expect(result.purchaseMode).toBe('inquiry')
    expect(result.priceCents).toBeNull()
  })
})

describe('fixedArcToShopItem', () => {
  it('maps a FIXED arc into the leuchten category as a direct-buy standard item', () => {
    const result = fixedArcToShopItem(arc())
    expect(result).toMatchObject({
      source: 'arc',
      code: 'ARC-0042',
      name: 'Arc ARC-0042',
      category: 'leuchten',
      tier: 'standard',
      purchaseMode: 'direct',
      priceCents: 180000,
      imageUrl: 'https://example.test/front.jpg',
      isSold: false,
    })
  })

  it('treats a set order_id as sold (FIXED arcs stay FIXED even when sold)', () => {
    expect(fixedArcToShopItem(arc({ order_id: 'order-9' })).isSold).toBe(true)
  })
})
