import type { Arc, Product, ResolvedCartItem, ShopItem, ShippingCountry } from '@/types'
import { SHIPPING_PRICES } from '@/types'

/**
 * Mapping der beiden Shop-Quellen auf die vereinheitlichte Anzeige-Form.
 *
 * Konvention für FIXED-Arcs: Der Arc bleibt im Status `FIXED`, auch wenn er
 * verkauft wurde — „verkauft" wird über eine gesetzte `order_id` erkannt.
 * So bleiben verkaufte Shop-Arcs sichtbar, ohne mit Pre-Order-`SOLD`-Arcs zu
 * kollidieren. (Backend: Shop-Browse lädt Arcs mit Status `FIXED`.)
 */
export function productToShopItem(product: Product): ShopItem {
  return {
    source: 'product',
    code: product.product_code,
    name: product.name,
    category: product.category,
    tier: product.tier,
    purchaseMode: product.purchase_mode,
    priceCents: product.price_cents,
    imageUrl: product.photos[0] ?? null,
    isSold: product.status === 'SOLD',
  }
}

export function fixedArcToShopItem(arc: Arc): ShopItem {
  return {
    source: 'arc',
    code: arc.serial_number,
    name: `Arc ${arc.serial_number}`,
    category: 'leuchten',
    tier: 'standard',
    purchaseMode: 'direct',
    priceCents: arc.base_price,
    imageUrl: arc.photo_front_url,
    isSold: arc.order_id != null,
  }
}

/**
 * Kombinierter Versand: **eine** Landpauschale pro Bestellung (DE 29 € / AT-CH 49 €)
 * plus die Summe aller produktspezifischen Versand-Overrides.
 *
 * Nur verfügbare Positionen zählen. Ist keine verfügbar, ist der Versand 0.
 * Die Landpauschale fällt unabhängig von Overrides genau einmal an.
 */
export function calcShipping(
  items: Pick<ResolvedCartItem, 'shippingOverrideCents' | 'available'>[],
  country: ShippingCountry,
): number {
  const available = items.filter((i) => i.available)
  if (available.length === 0) return 0
  const overrides = available.reduce((sum, i) => sum + (i.shippingOverrideCents ?? 0), 0)
  return SHIPPING_PRICES[country] + overrides
}

/** Zwischensumme der verfügbaren Positionen (ohne Versand). */
export function calcSubtotal(items: Pick<ResolvedCartItem, 'priceCents' | 'available'>[]): number {
  return items.filter((i) => i.available).reduce((sum, i) => sum + i.priceCents, 0)
}
