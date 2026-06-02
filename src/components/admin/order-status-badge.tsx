import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_CONFIRMATION: 'Wartet auf Bestaetigung',
  CONFIRMED: 'Bestaetigt',
  DEPOSIT_PAID: 'Anzahlung bezahlt',
  IN_PRODUCTION: 'In Produktion',
  READY_TO_SHIP: 'Versandbereit',
  REMAINING_PAID: 'Restbetrag bezahlt',
  SHIPPED: 'Versendet',
  DELIVERED: 'Geliefert',
  CANCELLED: 'Storniert',
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING_CONFIRMATION: 'bg-amber-100 text-amber-900',
  CONFIRMED: 'bg-blue-100 text-blue-900',
  DEPOSIT_PAID: 'bg-emerald-100 text-emerald-900',
  IN_PRODUCTION: 'bg-indigo-100 text-indigo-900',
  READY_TO_SHIP: 'bg-cyan-100 text-cyan-900',
  REMAINING_PAID: 'bg-emerald-100 text-emerald-900',
  SHIPPED: 'bg-teal-100 text-teal-900',
  DELIVERED: 'bg-stone-200 text-stone-700',
  CANCELLED: 'bg-destructive/10 text-destructive',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="secondary" className={cn('font-medium', STATUS_STYLES[status])}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  )
}
