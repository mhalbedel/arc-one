import { Badge } from '@/components/ui/badge'
import type { DropStatus } from '@/types'

type DropBadgeProps = {
  status: DropStatus
  title?: string
}

export function DropBadge({ status, title }: DropBadgeProps) {
  const label = status === 'LIVE' ? 'Drop Live' : title ?? 'Drop'

  return (
    <Badge
      variant="default"
      className="text-[10px] tracking-widest uppercase px-2 py-0.5"
    >
      {label}
    </Badge>
  )
}
