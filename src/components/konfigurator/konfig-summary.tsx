import { Separator } from '@/components/ui/separator'
import type { MountingType, FinishType, LightType } from '@/types'

const MOUNTING_LABELS: Record<MountingType, string> = {
  ohne: 'Ohne Befestigung',
  wand: 'Wandmontage',
  decke: 'Deckenmontage',
  spinne: 'Spinne',
}

const FINISH_LABELS: Record<FinishType, string> = {
  oel: 'Öl',
  lack: 'Lack',
  schellack: 'Schellack',
}

const LIGHT_LABELS: Record<LightType, string> = {
  porzellan: 'Porzellan Fassung',
  bg_led: 'Hintergrund LED',
  true_led: 'True Light LED',
}

type KonfigSummaryProps = {
  mounting: MountingType | null
  spinneCount: number
  finish: FinishType | null
  light: LightType | null
  isSanded: boolean
}

export function KonfigSummary({ mounting, spinneCount, finish, light, isSanded }: KonfigSummaryProps) {
  return (
    <div className="space-y-0">
      <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Konfiguration</p>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Oberfläche</dt>
          <dd>{isSanded ? 'Geschliffen' : 'Ungeschliffen – Rohling'}</dd>
        </div>
        <Separator />
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Befestigung</dt>
          <dd>
            {mounting ? (
              <>
                {MOUNTING_LABELS[mounting]}
                {mounting === 'spinne' && ` · ${spinneCount} Pendel`}
              </>
            ) : (
              <span className="text-muted-foreground/50">—</span>
            )}
          </dd>
        </div>
        {isSanded && (
          <>
            <Separator />
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Finish</dt>
              <dd>{finish ? FINISH_LABELS[finish] : <span className="text-muted-foreground/50">—</span>}</dd>
            </div>
          </>
        )}
        <Separator />
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Licht</dt>
          <dd>{light ? LIGHT_LABELS[light] : <span className="text-muted-foreground/50">—</span>}</dd>
        </div>
      </dl>
    </div>
  )
}
