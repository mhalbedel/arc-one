'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { OptionCard } from './option-card'
import { SpinneStepper } from './spinne-stepper'
import { StepIndicator } from './step-indicator'
import { ArcPreview } from './arc-preview'
import { KonfigSummary } from './konfig-summary'
import { PreisAufschluesselung } from './preis-aufschluesselung'
import type { MountingType, FinishType, LightType, PricingData } from '@/types'
import type { Arc } from '@/types'
import {
  sandingPriceFor,
  mountingPriceFor,
  finishPriceFor,
  lightPriceFor,
  spinnePerPendantFor,
} from '@/lib/pricing'

type StepKey = 'schliff' | 'befestigung' | 'finish' | 'licht' | 'zusammenfassung' | 'reservierung'
type SandingChoice = 'schleifen' | 'rohling'

const STEP_LABELS: Record<StepKey, string> = {
  schliff: 'Schliff',
  befestigung: 'Befestigung',
  finish: 'Finish',
  licht: 'Licht',
  zusammenfassung: 'Zusammenfassung',
  reservierung: 'Reservierung',
}

const SANDING_OPTIONS: { value: SandingChoice; label: string }[] = [
  { value: 'schleifen', label: 'Schleifen lassen' },
  { value: 'rohling', label: 'Ungeschliffen belassen (Rohling)' },
]

const MOUNTING_OPTIONS: { value: MountingType; label: string }[] = [
  { value: 'wand', label: 'Wandmontage' },
  { value: 'decke', label: 'Deckenmontage' },
  { value: 'spinne', label: 'Spinne' },
  { value: 'ohne', label: 'Ohne Befestigung' },
]

const FINISH_OPTIONS: { value: FinishType; label: string }[] = [
  { value: 'unbehandelt', label: 'Unbehandelt' },
  { value: 'oel', label: 'Öl' },
  { value: 'lack', label: 'Lack' },
  { value: 'schellack', label: 'Schellack' },
]

const LIGHT_OPTIONS: { value: LightType; label: string }[] = [
  { value: 'porzellan', label: 'Porzellan Fassung' },
  { value: 'bg_led', label: 'Hintergrund LED' },
  { value: 'true_led', label: 'True Light LED' },
  { value: 'ohne', label: 'Ohne Licht' },
]

/** Eine Option ist verfügbar, solange ihr namespaced Key nicht in arc.blocked_options steht. */
function isBlocked(arc: Arc, key: string): boolean {
  return arc.blocked_options?.includes(key) ?? false
}

type KonfiguratorClientProps = {
  arc: Arc
  pricing: PricingData
  expiredReservation?: boolean
}

export function KonfiguratorClient({ arc, pricing, expiredReservation }: KonfiguratorClientProps) {
  const [sandingChoice, setSandingChoice] = useState<SandingChoice | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [furthestIndex, setFurthestIndex] = useState(0)
  const [mounting, setMounting] = useState<MountingType | null>(null)
  const [spinneCount, setSpinneCount] = useState(1)
  const [finish, setFinish] = useState<FinishType | null>(null)
  const [light, setLight] = useState<LightType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reserving, setReserving] = useState(false)

  // Arc is already sanded — no sanding step needed
  const willBeSanded = arc.is_sanded || sandingChoice === 'schleifen'

  const steps = useMemo((): StepKey[] => {
    if (arc.is_sanded) {
      return ['befestigung', 'finish', 'licht', 'zusammenfassung', 'reservierung']
    }
    if (sandingChoice === 'schleifen') {
      return ['schliff', 'befestigung', 'finish', 'licht', 'zusammenfassung', 'reservierung']
    }
    // rohling or not yet chosen: show without finish
    return ['schliff', 'befestigung', 'licht', 'zusammenfassung', 'reservierung']
  }, [arc.is_sanded, sandingChoice])

  const currentStep = steps[stepIndex]

  const sandingPrice = sandingChoice === 'schleifen' ? sandingPriceFor(arc, pricing) : 0
  const mountingPrice = mountingPriceFor(arc, mounting, spinneCount, pricing)
  const finishPrice = willBeSanded ? finishPriceFor(arc, finish, pricing) : 0
  const lightPrice = lightPriceFor(arc, light, pricing)
  const total = arc.base_price + sandingPrice + mountingPrice + finishPrice + lightPrice

  // Aufpreis je Option (klassenabhaengig) fuer die Karten-Anzeige
  const sandingOptionPrice = sandingPriceFor(arc, pricing)
  const spinnePerPendant = spinnePerPendantFor(arc, pricing)
  const mountingOptionPrice = (m: MountingType): number =>
    m === 'spinne' ? spinnePerPendant : mountingPriceFor(arc, m, 1, pricing)

  const hasFullConfig =
    mounting !== null &&
    light !== null &&
    (!arc.is_sanded ? sandingChoice !== null : true) &&
    (willBeSanded ? finish !== null : true)

  // Opt-out-Modell: Standardmäßig alle Optionen verfügbar, Admin sperrt einzelne via blocked_options
  const availableSanding = SANDING_OPTIONS.filter((o) => !isBlocked(arc, `schliff:${o.value}`))

  const availableMounting = MOUNTING_OPTIONS.filter((o) => {
    if (isBlocked(arc, `mounting:${o.value}`)) return false
    // Spinne braucht eine gesetzte Pendelanzahl, sonst ist der Stepper nicht darstellbar
    if (o.value === 'spinne') return arc.max_spinne_pendants != null
    return true
  })

  const availableFinish = FINISH_OPTIONS.filter((o) => !isBlocked(arc, `finish:${o.value}`))

  const availableLight = LIGHT_OPTIONS.filter((o) => !isBlocked(arc, `light:${o.value}`))

  const mountingLabel = mounting ? (MOUNTING_OPTIONS.find((o) => o.value === mounting)?.label ?? '') : ''
  const finishLabel = finish ? (FINISH_OPTIONS.find((o) => o.value === finish)?.label ?? '') : ''
  const lightLabel = light ? (LIGHT_OPTIONS.find((o) => o.value === light)?.label ?? '') : ''

  function goTo(index: number) {
    setStepIndex(index)
    if (index > furthestIndex) setFurthestIndex(index)
  }

  function next() {
    goTo(stepIndex + 1)
  }

  function back() {
    setStepIndex(stepIndex - 1)
  }

  function handleSandingChoice(choice: SandingChoice) {
    if (choice === sandingChoice) return
    setSandingChoice(choice)
    // Reset all downstream selections when sanding choice changes
    setMounting(null)
    setFinish(null)
    setLight(null)
    setSpinneCount(1)
    setFurthestIndex(0)
  }

  async function reserve() {
    setError(null)
    setReserving(true)
    try {
      let sessionId = typeof window !== 'undefined' ? localStorage.getItem('arc_session_id') : null
      if (!sessionId) {
        sessionId = crypto.randomUUID()
        localStorage.setItem('arc_session_id', sessionId)
      }

      const res = await fetch('/api/konfigurator/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arcId: arc.id,
          sessionId,
          config: {
            sandingChoice: arc.is_sanded ? 'geschliffen' : sandingChoice,
            mounting,
            spinneCount: mounting === 'spinne' ? spinneCount : undefined,
            finish: willBeSanded ? finish : null,
            light,
          },
        }),
      })

      if (res.ok) {
        localStorage.setItem(`arc_config_${arc.id}`, JSON.stringify({
          sandingChoice: arc.is_sanded ? 'geschliffen' : sandingChoice,
          mounting,
          spinneCount: mounting === 'spinne' ? spinneCount : undefined,
          finish: willBeSanded ? finish : null,
          light,
        }))
        window.location.href = `/checkout/${arc.id}`
      } else {
        const data = await res.json()
        setError(data.error ?? 'Reservierung fehlgeschlagen.')
      }
    } finally {
      setReserving(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      {expiredReservation && (
        <div className="mb-8 bg-destructive/10 border border-destructive/20 px-5 py-4 text-sm text-destructive">
          Deine Reservierung ist abgelaufen. Bitte konfiguriere den Arc erneut und reserviere ihn.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-10 md:gap-14 lg:gap-20">

        {/* Left: Arc Preview + durchgehende Preisaufschlüsselung */}
        <div className="md:sticky md:top-24 md:self-start space-y-0">
          <ArcPreview
            serialNumber={arc.serial_number}
            photoUrl={arc.photo_front_url}
            isSanded={arc.is_sanded}
          />
          <div className="border-t border-border pt-4 mt-4 space-y-3">
            <PreisAufschluesselung
              base={arc.base_price}
              sandingPrice={sandingPrice}
              mountingLabel={mountingLabel}
              mountingPrice={mountingPrice}
              finishLabel={finishLabel}
              finishPrice={finishPrice}
              lightLabel={lightLabel}
              lightPrice={lightPrice}
              total={total}
              totalLabel={hasFullConfig ? 'Gesamt' : 'Zwischensumme'}
            />
            <p className="text-xs text-muted-foreground">30 % Deposit · 70 % vor Versand</p>
          </div>
        </div>

        {/* Right: Steps */}
        <div className="space-y-10">
          <div className="overflow-x-auto -mx-6 px-6">
            <StepIndicator
              steps={steps.map((k) => STEP_LABELS[k])}
              currentIndex={stepIndex}
              furthestIndex={furthestIndex}
              onStepClick={goTo}
            />
          </div>

          <Separator />

          {/* Schliff — only for is_sanded = false arcs */}
          {currentStep === 'schliff' && (
            <div className="space-y-6">
              <h2 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Schliff</h2>
              <div className="space-y-2">
                {availableSanding.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={sandingChoice === opt.value}
                    onSelect={() => handleSandingChoice(opt.value)}
                    price={opt.value === 'schleifen' ? sandingOptionPrice : 0}
                  />
                ))}
              </div>
              <Button
                onClick={next}
                disabled={sandingChoice === null}
                className="w-full text-xs tracking-[0.15em] uppercase"
                size="lg"
              >
                Weiter
              </Button>
            </div>
          )}

          {/* Befestigung */}
          {currentStep === 'befestigung' && (
            <div className="space-y-6">
              <h2 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Befestigung</h2>
              <div className="space-y-2">
                {availableMounting.map((opt) => (
                  <div key={opt.value}>
                    <OptionCard
                      label={opt.label}
                      selected={mounting === opt.value}
                      onSelect={() => setMounting(opt.value)}
                      price={mountingOptionPrice(opt.value)}
                      priceSuffix={opt.value === 'spinne' ? '/ Pendel' : undefined}
                    />
                    {opt.value === 'spinne' && mounting === 'spinne' && (
                      <div className="space-y-2">
                        <SpinneStepper
                          value={spinneCount}
                          min={1}
                          max={arc.max_spinne_pendants ?? 1}
                          onChange={setSpinneCount}
                        />
                        {spinnePerPendant > 0 && (
                          <div className="ml-5 flex justify-between text-sm">
                            <span className="text-muted-foreground">Spinne gesamt</span>
                            <span className="tabular-nums">+ {formatPrice(spinnePerPendant * spinneCount)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                {!arc.is_sanded && (
                  <Button
                    variant="outline"
                    onClick={back}
                    className="flex-1 text-xs tracking-[0.15em] uppercase"
                    size="lg"
                  >
                    Zurück
                  </Button>
                )}
                <Button
                  onClick={next}
                  disabled={mounting === null}
                  className={arc.is_sanded ? 'w-full text-xs tracking-[0.15em] uppercase' : 'flex-1 text-xs tracking-[0.15em] uppercase'}
                  size="lg"
                >
                  Weiter
                </Button>
              </div>
            </div>
          )}

          {/* Finish — shown when arc is already sanded OR user chose "schleifen" */}
          {currentStep === 'finish' && (
            <div className="space-y-6">
              <h2 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Finish</h2>
              <div className="space-y-2">
                {availableFinish.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={finish === opt.value}
                    onSelect={() => setFinish(opt.value)}
                    price={finishPriceFor(arc, opt.value, pricing)}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={back}
                  className="flex-1 text-xs tracking-[0.15em] uppercase"
                  size="lg"
                >
                  Zurück
                </Button>
                <Button
                  onClick={next}
                  disabled={finish === null}
                  className="flex-1 text-xs tracking-[0.15em] uppercase"
                  size="lg"
                >
                  Weiter
                </Button>
              </div>
            </div>
          )}

          {/* Licht */}
          {currentStep === 'licht' && (
            <div className="space-y-6">
              <h2 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Licht</h2>
              <div className="space-y-2">
                {availableLight.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={light === opt.value}
                    onSelect={() => setLight(opt.value)}
                    price={lightPriceFor(arc, opt.value, pricing)}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={back}
                  className="flex-1 text-xs tracking-[0.15em] uppercase"
                  size="lg"
                >
                  Zurück
                </Button>
                <Button
                  onClick={next}
                  disabled={light === null}
                  className="flex-1 text-xs tracking-[0.15em] uppercase"
                  size="lg"
                >
                  Weiter
                </Button>
              </div>
            </div>
          )}

          {/* Zusammenfassung */}
          {currentStep === 'zusammenfassung' && (
            <div className="space-y-8">
              <KonfigSummary
                mounting={mounting}
                spinneCount={spinneCount}
                finish={finish}
                light={light}
                isSanded={arc.is_sanded}
                sandingChoice={sandingChoice}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={back}
                  className="flex-1 text-xs tracking-[0.15em] uppercase"
                  size="lg"
                >
                  Zurück
                </Button>
                <Button
                  onClick={next}
                  className="flex-1 text-xs tracking-[0.15em] uppercase"
                  size="lg"
                >
                  Weiter
                </Button>
              </div>
            </div>
          )}

          {/* Reservierung */}
          {currentStep === 'reservierung' && (
            <div className="space-y-8">
              <KonfigSummary
                mounting={mounting}
                spinneCount={spinneCount}
                finish={finish}
                light={light}
                isSanded={arc.is_sanded}
                sandingChoice={sandingChoice}
              />
              <div className="bg-muted px-5 py-4 text-sm space-y-1">
                <p className="font-medium">Reservierung für 24 Stunden</p>
                <p className="text-muted-foreground text-xs">
                  Nach der Reservierung kannst du deine Bestellung im nächsten Schritt abschließen.
                  Kein Kauf ohne weitere Bestätigung.
                </p>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={back}
                  disabled={reserving}
                  className="flex-1 text-xs tracking-[0.15em] uppercase"
                  size="lg"
                >
                  Zurück
                </Button>
                <Button
                  onClick={reserve}
                  disabled={reserving || !hasFullConfig}
                  className="flex-1 text-xs tracking-[0.15em] uppercase"
                  size="lg"
                >
                  {reserving ? 'Wird reserviert …' : 'Jetzt reservieren (24 Std.)'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
