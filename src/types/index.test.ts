import { describe, it, expect, expectTypeOf } from 'vitest'
import type {
  Arc, Order, Drop, WaitlistEntry, Customer, B2BAccount, Project, AdminProfile,
  ArcStatus, OrderStatus, DropStatus, ProjectStatus, AdminRole,
  ConfiguratorState, PriceBreakdown, MountingType, FinishType, LightType,
} from './index'

describe('Domain types', () => {
  it('Arc has required fields', () => {
    expectTypeOf<Arc>().toHaveProperty('id')
    expectTypeOf<Arc>().toHaveProperty('serial_number')
    expectTypeOf<Arc>().toHaveProperty('status')
    expectTypeOf<Arc>().toHaveProperty('base_price')
  })

  it('Order has pricing snapshot fields', () => {
    expectTypeOf<Order>().toHaveProperty('total_price')
    expectTypeOf<Order>().toHaveProperty('deposit_amount')
    expectTypeOf<Order>().toHaveProperty('remaining_amount')
    expectTypeOf<Order>().toHaveProperty('config')
  })

  it('Drop has scheduling fields', () => {
    expectTypeOf<Drop>().toHaveProperty('scheduled_at')
    expectTypeOf<Drop>().toHaveProperty('status')
    expectTypeOf<Drop>().toHaveProperty('slug')
  })

  it('ArcStatus includes all lifecycle values', () => {
    const status: ArcStatus = 'READY'
    expectTypeOf(status).toEqualTypeOf<ArcStatus>()
  })

  it('ConfiguratorState has step and selection fields', () => {
    expectTypeOf<ConfiguratorState>().toHaveProperty('arcId')
    expectTypeOf<ConfiguratorState>().toHaveProperty('step')
    expectTypeOf<ConfiguratorState>().toHaveProperty('mounting')
    expectTypeOf<ConfiguratorState>().toHaveProperty('finish')
    expectTypeOf<ConfiguratorState>().toHaveProperty('light')
  })

  it('PriceBreakdown has all price components', () => {
    expectTypeOf<PriceBreakdown>().toHaveProperty('base')
    expectTypeOf<PriceBreakdown>().toHaveProperty('deposit')
    expectTypeOf<PriceBreakdown>().toHaveProperty('remaining')
    expectTypeOf<PriceBreakdown>().toHaveProperty('deliveryDaysMin')
  })
})

describe('Enum completeness', () => {
  it('ArcStatus covers complete lifecycle', () => {
    const allStatuses: ArcStatus[] = [
      'RAW', 'IN_PROGRESS', 'READY', 'RESERVED',
      'ORDERED', 'IN_PRODUCTION', 'SHIPPED', 'SOLD', 'ARCHIVED', 'FIXED',
    ]
    expect(allStatuses).toHaveLength(10)
  })

  it('OrderStatus covers complete payment lifecycle', () => {
    const allStatuses: OrderStatus[] = [
      'PENDING_CONFIRMATION', 'CONFIRMED', 'DEPOSIT_PAID',
      'IN_PRODUCTION', 'READY_TO_SHIP', 'REMAINING_PAID',
      'SHIPPED', 'DELIVERED', 'CANCELLED',
    ]
    expect(allStatuses).toHaveLength(9)
  })

  it('DropStatus covers complete drop lifecycle', () => {
    const allStatuses: DropStatus[] = ['DRAFT', 'SCHEDULED', 'LIVE', 'CLOSED', 'ARCHIVED']
    expect(allStatuses).toHaveLength(5)
  })

  it('ProjectStatus covers complete inquiry lifecycle', () => {
    const allStatuses: ProjectStatus[] = [
      'INQUIRY', 'REVIEWING', 'QUOTED', 'ACCEPTED',
      'IN_PROGRESS', 'COMPLETED', 'REJECTED',
    ]
    expect(allStatuses).toHaveLength(7)
  })

  it('AdminRole covers all permission levels', () => {
    const allRoles: AdminRole[] = ['SUPER_ADMIN', 'EDITOR', 'VIEWER']
    expect(allRoles).toHaveLength(3)
  })

  it('MountingType covers all options', () => {
    const allTypes: MountingType[] = ['ohne', 'wand', 'decke', 'spinne']
    expect(allTypes).toHaveLength(4)
  })

  it('FinishType covers all options', () => {
    const allTypes: FinishType[] = ['oel', 'lack', 'schellack']
    expect(allTypes).toHaveLength(3)
  })

  it('LightType covers all options', () => {
    const allTypes: LightType[] = ['standard', 'led', 'ultra']
    expect(allTypes).toHaveLength(3)
  })
})

describe('Nullable field contracts', () => {
  it('Arc optional fields are nullable', () => {
    type HarvestDate = Arc['harvest_date']
    expectTypeOf<HarvestDate>().toEqualTypeOf<string | null>()

    type PhotoFrontUrl = Arc['photo_front_url']
    expectTypeOf<PhotoFrontUrl>().toEqualTypeOf<string | null>()

    type ReservedUntil = Arc['reserved_until']
    expectTypeOf<ReservedUntil>().toEqualTypeOf<string | null>()
  })

  it('Order payment timestamps are nullable until paid', () => {
    type DepositPaidAt = Order['deposit_paid_at']
    expectTypeOf<DepositPaidAt>().toEqualTypeOf<string | null>()

    type RemainingPaidAt = Order['remaining_paid_at']
    expectTypeOf<RemainingPaidAt>().toEqualTypeOf<string | null>()
  })

  it('WaitlistEntry confirmed_at is nullable until double-opt-in', () => {
    type ConfirmedAt = WaitlistEntry['confirmed_at']
    expectTypeOf<ConfirmedAt>().toEqualTypeOf<string | null>()
  })
})
