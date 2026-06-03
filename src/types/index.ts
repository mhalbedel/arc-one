// Domain types — re-exported from database types for use across the app
export type {
  Json,
  ArcStatus,
  OrderStatus,
  DropStatus,
  ProjectStatus,
  AdminRole,
  ProductCategory,
  ProductTier,
  PurchaseMode,
  ProductStatus,
  InquiryStatus,
  OrderType,
  ArcRow as Arc,
  OrderRow as Order,
  DropRow as Drop,
  WaitlistEntryRow as WaitlistEntry,
  CustomerRow as Customer,
  B2BAccountRow as B2BAccount,
  ProjectRow as Project,
  AdminProfileRow as AdminProfile,
  ProductRow as Product,
  ProductInquiryRow as ProductInquiry,
  Database,
} from './database'

import type { ArcRow, DropRow } from './database'

export type ArcWithDrop = ArcRow & {
  drops: Pick<DropRow, 'id' | 'title' | 'status'> | null
}

// ── Configurator Types ─────────────────────────────────────

export type MountingType = 'ohne' | 'wand' | 'decke' | 'spinne'
export type FinishType = 'unbehandelt' | 'oel' | 'lack' | 'schellack'
export type LightType = 'porzellan' | 'bg_led' | 'true_led' | 'ohne'

export interface ConfiguratorState {
  arcId: string
  step: 1 | 2 | 3 | 4 | 5
  mounting: MountingType | null
  spinneCount: number
  finish: FinishType | null
  light: LightType | null
}

// ── Pricing Types ──────────────────────────────────────────

export type { PricingRuleRow, PricingSettingsRow } from './database'

export type SizeClass = 'klein' | 'mittel' | 'gross'
export type WeightClass = 'leicht' | 'mittel' | 'schwer'

/** Klassen-Grenzwerte; vom Admin pflegbar (PROJ-5). */
export interface PricingSettings {
  size_klein_max_cm2: number
  size_mittel_max_cm2: number
  weight_leicht_max_g: number
  weight_mittel_max_g: number
}

/** Preisliste als Lookup. Key: `${component}:${variant}:${tier}` bzw. `${component}:${tier}` (schliff). Wert in Cent. */
export type PricingRules = Record<string, number>

/** Gebuendelte Preisdaten, einmal serverseitig geladen und an den Client durchgereicht. */
export interface PricingData {
  rules: PricingRules
  settings: PricingSettings
}

export interface PriceBreakdown {
  base: number
  mounting: number
  finish: number
  light: number
  shipping: number
  subtotal: number
  deposit: number
  remaining: number
  deliveryDaysMin: number
  deliveryDaysMax: number
}

// ── Address Type ───────────────────────────────────────────

export interface Address {
  street: string
  city: string
  zip: string
  country: string
}

// ── Checkout Config (persisted to localStorage) ────────────

export type SandingChoice = 'schleifen' | 'rohling' | 'geschliffen'

export interface CheckoutConfig {
  sandingChoice: SandingChoice
  mounting: MountingType
  spinneCount?: number
  finish: FinishType | null
  light: LightType
}

export type ShippingCountry = 'DE' | 'AT' | 'CH'

export const SHIPPING_PRICES: Record<ShippingCountry, number> = {
  DE: 2900,
  AT: 4900,
  CH: 4900,
}

// ── Shop (PROJ-9) ──────────────────────────────────────────

import type { ProductCategory, ProductTier, PurchaseMode } from './database'

/** Reihenfolge + Anzeigenamen der festen Shop-Kategorien (kein Admin-CRUD). */
export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'leuchten', label: 'Leuchten' },
  { value: 'schalen_accessoires', label: 'Schalen & Accessoires' },
  { value: 'tische_moebel', label: 'Tische & Möbel' },
]

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  leuchten: 'Leuchten',
  schalen_accessoires: 'Schalen & Accessoires',
  tische_moebel: 'Tische & Möbel',
}

/**
 * Vereinheitlichte Anzeige-Form für die Shop-Übersicht und -Detailseite.
 * Bildet sowohl `products`-Zeilen als auch `FIXED`-Arcs auf eine gemeinsame Form ab.
 */
export interface ShopItem {
  /** Herkunft der Zeile — bestimmt Checkout-/Detail-Logik */
  source: 'product' | 'arc'
  /** URL-Segment: product_code bzw. serial_number → /shop/[code] */
  code: string
  name: string
  category: ProductCategory
  tier: ProductTier
  purchaseMode: PurchaseMode
  /** Festpreis in Cent; null bei Anfrage-Produkten */
  priceCents: number | null
  /** Vorschaubild für die Karte */
  imageUrl: string | null
  /** true = verkauft (sichtbar, nicht kaufbar) */
  isSold: boolean
}
