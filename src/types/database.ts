export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ── Enum Types ─────────────────────────────────────────────

export type ArcStatus =
  | 'RAW'
  | 'IN_PROGRESS'
  | 'READY'
  | 'RESERVED'
  | 'ORDERED'
  | 'IN_PRODUCTION'
  | 'SHIPPED'
  | 'SOLD'
  | 'ARCHIVED'

export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'DEPOSIT_PAID'
  | 'IN_PRODUCTION'
  | 'READY_TO_SHIP'
  | 'REMAINING_PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export type DropStatus = 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'CLOSED' | 'ARCHIVED'

export type ProjectStatus =
  | 'INQUIRY'
  | 'REVIEWING'
  | 'QUOTED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'

export type AdminRole = 'SUPER_ADMIN' | 'EDITOR' | 'VIEWER'

// ── Row Types ──────────────────────────────────────────────

export interface ArcRow {
  id: string
  serial_number: string
  width_cm: number
  height_cm: number
  depth_cm: number
  weight_grams: number
  harvest_date: string | null
  forest_section: string | null
  cut_number: number | null
  character: string
  photo_front_url: string | null
  photo_back_url: string | null
  scan_3d_url: string | null
  compat_ohne: boolean
  compat_wand: boolean
  compat_decke: boolean
  compat_spinne: boolean
  max_spinne_pendants: number | null
  compat_oel: boolean
  compat_lack: boolean
  compat_schellack: boolean
  is_featured: boolean
  is_sanded: boolean
  status: ArcStatus
  base_price: number
  price_mounting_wall: number | null
  price_mounting_ceiling: number | null
  price_mounting_spinne_per: number | null
  price_finish_oil: number | null
  price_finish_lacquer: number | null
  price_finish_shellac: number | null
  price_sanding: number | null
  price_light_porcelain: number | null
  price_light_bg_led: number | null
  price_light_true_led: number | null
  drop_id: string | null
  reserved_until: string | null
  reserved_by: string | null
  order_id: string | null
  created_at: string
  updated_at: string
}

export interface OrderRow {
  id: string
  order_number: string
  config: Json
  base_price: number
  mounting_price: number
  finish_price: number
  light_price: number
  shipping_price: number
  total_price: number
  estimated_days: number
  customer_id: string | null
  b2b_account_id: string | null
  deposit_amount: number
  remaining_amount: number
  deposit_paid_at: string | null
  remaining_paid_at: string | null
  stripe_deposit_id: string | null
  stripe_remain_id: string | null
  status: OrderStatus
  admin_notes: string | null
  confirmed_at: string | null
  confirmed_by: string | null
  created_at: string
  updated_at: string
}

export interface DropRow {
  id: string
  title: string
  slug: string
  scheduled_at: string
  closes_at: string | null
  status: DropStatus
  alert_sent_at: string | null
  alert_count: number
  description: string | null
  created_at: string
  updated_at: string
}

export interface WaitlistEntryRow {
  id: string
  email: string
  confirmed_at: string | null
  token: string
  created_at: string
}

export interface CustomerRow {
  id: string
  email: string
  name: string | null
  phone: string | null
  address: Json | null
  created_at: string
}

export interface B2BAccountRow {
  id: string
  auth_user_id: string | null
  company_name: string
  contact_name: string
  email: string
  phone: string | null
  website: string | null
  approved_at: string | null
  approved_by: string | null
  can_download_cad: boolean
  can_request_projects: boolean
  created_at: string
  updated_at: string
}

export interface ProjectRow {
  id: string
  b2b_account_id: string
  title: string
  description: string | null
  arc_count: number | null
  mounting_type: string | null
  budget: number | null
  status: ProjectStatus
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface AdminProfileRow {
  id: string
  auth_user_id: string
  name: string
  role: AdminRole
  created_at: string
}

// ── Database Type (for Supabase client) ───────────────────

export interface Database {
  public: {
    Tables: {
      arcs: {
        Row: ArcRow
        Insert: Omit<ArcRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          is_featured?: boolean
          is_sanded?: boolean
          compat_ohne?: boolean
          compat_wand?: boolean
          compat_decke?: boolean
          compat_spinne?: boolean
          compat_oel?: boolean
          compat_lack?: boolean
          compat_schellack?: boolean
          status?: ArcStatus
          created_at?: string
          updated_at?: string
          price_mounting_wall?: number | null
          price_mounting_ceiling?: number | null
          price_mounting_spinne_per?: number | null
          price_finish_oil?: number | null
          price_finish_lacquer?: number | null
          price_finish_shellac?: number | null
          price_sanding?: number | null
          price_light_porcelain?: number | null
          price_light_bg_led?: number | null
          price_light_true_led?: number | null
        }
        Update: Partial<ArcRow>
      }
      orders: {
        Row: OrderRow
        Insert: Omit<OrderRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          mounting_price?: number
          finish_price?: number
          light_price?: number
          shipping_price?: number
          status?: OrderStatus
          created_at?: string
          updated_at?: string
        }
        Update: Partial<OrderRow>
      }
      drops: {
        Row: DropRow
        Insert: Omit<DropRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          status?: DropStatus
          alert_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<DropRow>
      }
      waitlist_entries: {
        Row: WaitlistEntryRow
        Insert: Omit<WaitlistEntryRow, 'id' | 'created_at'> & {
          id?: string
          confirmed_at?: string | null
          token?: string
          created_at?: string
        }
        Update: Partial<WaitlistEntryRow>
      }
      customers: {
        Row: CustomerRow
        Insert: Omit<CustomerRow, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<CustomerRow>
      }
      b2b_accounts: {
        Row: B2BAccountRow
        Insert: Omit<B2BAccountRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          can_download_cad?: boolean
          can_request_projects?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<B2BAccountRow>
      }
      projects: {
        Row: ProjectRow
        Insert: Omit<ProjectRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          status?: ProjectStatus
          created_at?: string
          updated_at?: string
        }
        Update: Partial<ProjectRow>
      }
      admin_profiles: {
        Row: AdminProfileRow
        Insert: Omit<AdminProfileRow, 'id' | 'created_at'> & {
          id?: string
          role?: AdminRole
          created_at?: string
        }
        Update: Partial<AdminProfileRow>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      arc_status: ArcStatus
      order_status: OrderStatus
      drop_status: DropStatus
      project_status: ProjectStatus
      admin_role: AdminRole
    }
    CompositeTypes: Record<string, never>
  }
}
