// Domain types — re-exported from database types for use across the app
export type {
  Json,
  ArcStatus,
  OrderStatus,
  DropStatus,
  ProjectStatus,
  AdminRole,
  ArcRow as Arc,
  OrderRow as Order,
  DropRow as Drop,
  WaitlistEntryRow as WaitlistEntry,
  CustomerRow as Customer,
  B2BAccountRow as B2BAccount,
  ProjectRow as Project,
  AdminProfileRow as AdminProfile,
  Database,
} from './database'

import type { ArcRow, DropRow } from './database'

export type ArcWithDrop = ArcRow & {
  drops: Pick<DropRow, 'id' | 'title' | 'status'> | null
}

// ── Configurator Types ─────────────────────────────────────

export type MountingType = 'ohne' | 'wand' | 'decke' | 'spinne'
export type FinishType = 'oel' | 'lack' | 'schellack'
export type LightType = 'porzellan' | 'bg_led' | 'true_led'

export interface ConfiguratorState {
  arcId: string
  step: 1 | 2 | 3 | 4 | 5
  mounting: MountingType | null
  spinneCount: number
  finish: FinishType | null
  light: LightType | null
}

// ── Pricing Types ──────────────────────────────────────────

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
