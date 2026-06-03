import type { Arc, Product, ShopItem } from '@/types'

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
