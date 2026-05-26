import Link from 'next/link'
import Image from 'next/image'
import { DropBadge } from './drop-badge'
import { formatPrice } from '@/lib/utils'
import type { ArcWithDrop } from '@/types'

type ArcCardProps = {
  arc: ArcWithDrop
}

export function ArcCard({ arc }: ArcCardProps) {
  const showDropBadge =
    arc.drops?.status === 'SCHEDULED' || arc.drops?.status === 'LIVE'

  return (
    <Link href={`/arcs/${arc.serial_number}`} className="group block">
      <article>
        <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4">
          {arc.photo_front_url ? (
            <Image
              src={arc.photo_front_url}
              alt={`Arc ${arc.serial_number}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-muted-foreground tracking-widest uppercase">
                Kein Foto
              </span>
            </div>
          )}
          {showDropBadge && arc.drops && (
            <div className="absolute top-3 left-3">
              <DropBadge status={arc.drops.status} title={arc.drops.title} />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-serif text-xs tracking-[0.12em] uppercase text-muted-foreground">
              {arc.serial_number}
            </span>
            <span className="text-sm font-medium tabular-nums">
              {formatPrice(arc.base_price)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {arc.width_cm} × {arc.height_cm} cm
          </p>
          <p className="text-xs tracking-[0.12em] uppercase pt-1 group-hover:underline underline-offset-4">
            Arc entdecken →
          </p>
        </div>
      </article>
    </Link>
  )
}
