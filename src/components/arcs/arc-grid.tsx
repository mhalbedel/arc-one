import { ArcCard } from './arc-card'
import type { ArcWithDrop } from '@/types'

type ArcGridProps = {
  arcs: ArcWithDrop[]
}

export function ArcGrid({ arcs }: ArcGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
      {arcs.map((arc) => (
        <ArcCard key={arc.id} arc={arc} />
      ))}
    </div>
  )
}
