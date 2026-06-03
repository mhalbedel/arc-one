import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PhotoSection } from '@/components/arcs/photo-section'
import { DropBadge } from '@/components/arcs/drop-badge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { ArcWithDrop } from '@/types'

type ArcDetailPageProps = {
  params: Promise<{ serial_number: string }>
}

const MOUNTING_LABELS: Record<string, string> = {
  ohne: 'Ohne Befestigung',
  wand: 'Wandmontage',
  decke: 'Deckenmontage',
  spinne: 'Spinne',
}

const FINISH_LABELS: Record<string, string> = {
  unbehandelt: 'Unbehandelt',
  oel: 'Öl',
  lack: 'Lack',
  schellack: 'Schellack',
}

const ALL_MOUNTING = ['wand', 'decke', 'spinne', 'ohne'] as const
const ALL_FINISH = ['unbehandelt', 'oel', 'lack', 'schellack'] as const

export default async function ArcDetailPage({ params }: ArcDetailPageProps) {
  const { serial_number } = await params
  const supabase = await createClient()

  const { data: arc } = await supabase
    .from('arcs')
    .select('*, drops(id, title, status)')
    .eq('serial_number', serial_number)
    .eq('status', 'READY') // FIXED-Arcs haben ihre Detailseite im Shop (PROJ-9)
    .single()

  if (!arc) notFound()

  const typedArc = arc as ArcWithDrop

  // Opt-out-Modell: alle Optionen verfügbar, außer in blocked_options gesperrt
  const blocked = typedArc.blocked_options ?? []
  const mountingOptions = ALL_MOUNTING.filter((m) => {
    if (blocked.includes(`mounting:${m}`)) return false
    if (m === 'spinne') return typedArc.max_spinne_pendants != null
    return true
  })
  const finishOptions = ALL_FINISH.filter((f) => !blocked.includes(`finish:${f}`))

  const showDropBadge =
    typedArc.drops?.status === 'SCHEDULED' || typedArc.drops?.status === 'LIVE'

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20">
        {/* Photos */}
        <div>
          <PhotoSection
            serialNumber={typedArc.serial_number}
            frontUrl={typedArc.photo_front_url}
            backUrl={typedArc.photo_back_url}
          />
        </div>

        {/* Info */}
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <p className="font-serif text-xs tracking-[0.2em] uppercase text-muted-foreground">
                {typedArc.serial_number}
              </p>
              {showDropBadge && typedArc.drops && (
                <DropBadge status={typedArc.drops.status} title={typedArc.drops.title} />
              )}
            </div>
            <p className="font-medium text-2xl tabular-nums">
              {formatPrice(typedArc.base_price)}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={typedArc.is_sanded ? 'secondary' : 'outline'}>
                {typedArc.is_sanded ? 'Geschliffen' : 'Ungeschliffen – Rohling'}
              </Badge>
            </div>
            {!typedArc.is_sanded && (
              <p className="text-xs text-muted-foreground">
                Der Grundpreis bezieht sich auf den ungeschliffenen Rohling. Schliff und Finish werden im Konfigurator gewählt.
              </p>
            )}
          </div>

          <Separator />

          {/* Character */}
          <div>
            <p className="text-base leading-relaxed font-serif">
              {typedArc.character}
            </p>
          </div>

          <Separator />

          {/* Dimensions */}
          <div className="space-y-4">
            <h2 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
              Abmessungen
            </h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Breite</dt>
              <dd className="tabular-nums">{typedArc.width_cm} cm</dd>
              <dt className="text-muted-foreground">Höhe</dt>
              <dd className="tabular-nums">{typedArc.height_cm} cm</dd>
              <dt className="text-muted-foreground">Tiefe</dt>
              <dd className="tabular-nums">{typedArc.depth_cm} cm</dd>
              <dt className="text-muted-foreground">Gewicht</dt>
              <dd className="tabular-nums">{(typedArc.weight_grams / 1000).toFixed(1)} kg</dd>
            </dl>
          </div>

          {/* Origin */}
          {(typedArc.harvest_date || typedArc.forest_section || typedArc.cut_number) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h2 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
                  Herkunft
                </h2>
                <dl className="grid grid-cols-2 gap-y-2 text-sm">
                  {typedArc.harvest_date && (
                    <>
                      <dt className="text-muted-foreground">Erntedatum</dt>
                      <dd>{formatDate(typedArc.harvest_date)}</dd>
                    </>
                  )}
                  {typedArc.forest_section && (
                    <>
                      <dt className="text-muted-foreground">Waldsektor</dt>
                      <dd>{typedArc.forest_section}</dd>
                    </>
                  )}
                  {typedArc.cut_number != null && (
                    <>
                      <dt className="text-muted-foreground">Schnittnummer</dt>
                      <dd className="tabular-nums">#{typedArc.cut_number}</dd>
                    </>
                  )}
                </dl>
              </div>
            </>
          )}

          <Separator />

          {/* Compatibility */}
          <div className="space-y-4">
            <h2 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
              Kompatibilität
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground mr-2">Befestigung</span>
                {mountingOptions.map((m) => MOUNTING_LABELS[m]).join(', ')}
                {mountingOptions.includes('spinne') && typedArc.max_spinne_pendants != null && (
                  <span className="text-muted-foreground ml-1">
                    (max. {typedArc.max_spinne_pendants} Pendel)
                  </span>
                )}
              </div>
              <div>
                <span className="text-muted-foreground mr-2">Finish</span>
                {finishOptions.map((f) => FINISH_LABELS[f]).join(', ')}
              </div>
            </div>
          </div>

          <Separator />

          {/* CTA */}
          <div className="pt-2">
            <Button asChild size="lg" className="w-full text-xs tracking-[0.15em] uppercase">
              <Link href={`/konfigurator/${typedArc.id}`}>
                Arc konfigurieren
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              30 % Deposit · 70 % vor Versand · nur DE/AT/CH
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
