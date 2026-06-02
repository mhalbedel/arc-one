import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ArcStatus } from '@/types'

const STATUS_STYLES: Record<ArcStatus, string> = {
  RAW: 'bg-muted text-muted-foreground',
  IN_PROGRESS: 'bg-amber-100 text-amber-900',
  READY: 'bg-emerald-100 text-emerald-900',
  RESERVED: 'bg-blue-100 text-blue-900',
  ORDERED: 'bg-indigo-100 text-indigo-900',
  IN_PRODUCTION: 'bg-amber-100 text-amber-900',
  SHIPPED: 'bg-cyan-100 text-cyan-900',
  SOLD: 'bg-stone-200 text-stone-700',
  ARCHIVED: 'bg-stone-200 text-stone-500',
}

export function ArcStatusBadge({ status }: { status: ArcStatus }) {
  return (
    <Badge variant="secondary" className={cn('font-medium', STATUS_STYLES[status])}>
      {status}
    </Badge>
  )
}
