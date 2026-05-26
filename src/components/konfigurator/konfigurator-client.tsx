'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { OptionCard } from './option-card'
import { SpinneStepper } from './spinne-stepper'
import { StepIndicator } from './step-indicator'
import { ArcPreview } from './arc-preview'
import { PriceDisplay } from './price-display'
import { KonfigSummary } from './konfig-summary'
import { PreisAufschluesselung } from './preis-aufschluesselung'
import type { MountingType, FinishType, LightType } from '@/types'
import type { Arc } from '@/types'

const MOUNTING_OPTIONS: { value: MountingType; label: string; compatKey: keyof Arc }[] = [
  { value: 'ohne', label: 'Ohne Befestigung', compatKey: 'compat_ohne' },
  { value: 'wand', label: 'Wandmontage', compatKey: 'compat_wand' },
  { value: 'decke', label: 'Deckenmontage', compatKey: 'compat_decke' },
  { value: 'spinne', label: 'Spinne', compatKey: 'compat_spinne' },
]

const FINISH_OPTIONS: { value: FinishType; label: string; compatKey: keyof Arc }[] = [
  { value: 'oel', label: 'Öl', compatKey: 'compat_oel' },
  { value: 'lack', label: 'Lack', compatKey: 'compat_lack' },
  { value: 'schellack', label: 'Schellack', compatKey: 'compat_schellack' },
]

const LIGHT_OPTIONS: { value: LightType; label: string }[] = [
  { value: 'porzellan', label: 'Porzellan Fassung' },
  { value: 'bg_led', label: 'Hintergrund LED' },
  { value: 'true_led', label: 'True Light LED' },
]

type KonfiguratorClientProps = {
  arc: Arc
}

function getMountingPrice(arc: Arc, mounting: MountingType | null, spinneCount: number): number {
  if (!mounting || mounting === 'ohne') return 0
  if (mounting === 'wand') return arc.price_mounting_wall ?? 0
  if (mounting === 'decke') return arc.price_mounting_ceiling ?? 0
  if (mounting === 'spinne') return (arc.price_mounting_spinne_per ?? 0) * spinneCount
  return 0
}

function getFinishPrice(arc: Arc, finish: FinishType | null): number {
  if (!finish) return 0
  if (finish === 'oel') return arc.price_finish_oil ?? 0
  if (finish === 'lack') return arc.price_finish_lacquer ?? 0
  if (finish === 'schellack') return arc.price_finish_shellac ?? 0
  return 0
}

function getLightPrice(arc: Arc, light: LightType | null): number {
  if (!light) return 0
  if (light === 'porzellan') return arc.price_light_porcelain ?? 0
  if (light === 'bg_led') return arc.price_light_bg_led ?? 0
  if (light === 'true_led') return arc.price_light_true_led ?? 0
  return 0
}

export function KonfiguratorClient({ arc }: KonfiguratorClientProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [furthestStep, setFurthestStep] = useState<number>(1)
  const [mounting, setMounting] = useState<MountingType | null>(null)
  const [spinneCount, setSpinneCount] = useState(1)
  const [finish, setFinish] = useState<FinishType | null>(null)
  const [light, setLight] = useState<LightType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reserving, setReserving] = useState(false)

  const mountingPrice = getMountingPrice(arc, mounting, spinneCount)
  const finishPrice = getFinishPrice(arc, finish)
  const lightPrice = getLightPrice(arc, light)
  const total = arc.base_price + mountingPrice + finishPrice + lightPrice
  const hasFullConfig = mounting !== null && finish !== null && light !== null

  const availableMounting = MOUNTING_OPTIONS.filter((o) => {
    if (o.value === 'spinne') return arc.compat_spinne && arc.max_spinne_pendants != null
    return arc[o.compatKey] === true
  })

  const availableFinish = FINISH_OPTIONS.filter((o) => arc[o.compatKey] === true)

  const mountingLabel = mounting
    ? (MOUNTING_OPTIONS.find((o) => o.value === mounting)?.label ?? '')
    : ''
  const finishLabel = finish
    ? (FINISH_OPTIONS.find((o) => o.value === finish)?.label ?? '')
    : ''
  const lightLabel = light
    ? (LIGHT_OPTIONS.find((o) => o.value === light)?.label ?? '')
    : ''

  function goTo(s: 1 | 2 | 3 | 4 | 5) {
    setStep(s)
    if (s > furthestStep) setFurthestStep(s)
  }

  function next() {
    const ns = (step + 1) as 1 | 2 | 3 | 4 | 5
    goTo(ns)
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
          config: { mounting, spinneCount: mounting === 'spinne' ? spinneCount : undefined, finish, light },
        }),
      })

      if (res.ok) {
        window.location.href = `/checkout/${arc.id}`
      } else {
        const data = await res.json()
        setError(data.error ?? 'Reservierung fehlgeschlagen.')
      }
    } finally {
      setReserving(false)
    }
  }

  const canProceedStep1 = mounting !== null
  const canProceedStep2 = finish !== null
  const canProceedStep3 = light !== null

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-14 lg:gap-20">

        {/* Left: Arc Preview + Price */}
        <div className="lg:sticky lg:top-24 lg:self-start space-y-0">
          <ArcPreview serialNumber={arc.serial_number} photoUrl={arc.photo_front_url} />
          <PriceDisplay total={total} hasFullConfig={hasFullConfig} />
        </div>

        {/* Right: Steps */}
        <div className="space-y-10">
          {/* Step Indicator */}
          <div className="overflow-x-auto -mx-6 px-6">
            <StepIndicator
              currentStep={step}
              completedUpTo={furthestStep}
              onStepClick={(s) => setStep(s as 1 | 2 | 3 | 4 | 5)}
            />
          </div>

          <Separator />

          {/* Step 1: Befestigung */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Befestigung</h2>
              <div className="space-y-2">
                {availableMounting.map((opt) => (
                  <div key={opt.value}>
                    <OptionCard
                      label={opt.label}
                      selected={mounting === opt.value}
                      onSelect={() => setMounting(opt.value)}
                    />
                    {opt.value === 'spinne' && mounting === 'spinne' && (
                      <SpinneStepper
                        value={spinneCount}
                        min={1}
                        max={arc.max_spinne_pendants ?? 1}
                        onChange={setSpinneCount}
                      />
                    )}
                  </div>
                ))}
              </div>
              <Button
                onClick={next}
                disabled={!canProceedStep1}
                className="w-full text-xs tracking-[0.15em] uppercase"
                size="lg"
              >
                Weiter
              </Button>
            </div>
          )}

          {/* Step 2: Finish */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Finish</h2>
              <div className="space-y-2">
                {availableFinish.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={finish === opt.value}
                    onSelect={() => setFinish(opt.value)}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 text-xs tracking-[0.15em] uppercase"
                  size="lg"
                >
                  Zurück
                </Button>
                <Button
                  onClick={next}
                  disabled={!canProceedStep2}
                  className="flex-1 text-xs tracking-[0.15em] uppercase"
                  size="lg"
                >
                  Weiter
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Licht */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Licht</h2>
              <div className="space-y-2">
                {LIGHT_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    selected={light === opt.value}
                    onSelect={() => setLight(opt.value)}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 text-xs tracking-[0.15em] uppercase"
                  size="lg"
                >
                  Zurück
                </Button>
                <Button
                  onClick={next}
                  disabled={!canProceedStep3}
                  className="flex-1 text-xs tracking-[0.15em] uppercase"
                  size="lg"
                >
                  Weiter
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Zusammenfassung */}
          {step === 4 && (
            <div className="space-y-8">
              <KonfigSummary
                mounting={mounting}
                spinneCount={spinneCount}
                finish={finish}
                light={light}
              />
              <Separator />
              <PreisAufschluesselung
                base={arc.base_price}
                mountingLabel={mountingLabel}
                mountingPrice={mountingPrice}
                finishLabel={finishLabel}
                finishPrice={finishPrice}
                lightLabel={lightLabel}
                lightPrice={lightPrice}
                total={total}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="flex-1 text-xs tracking-[0.15em] uppercase"
                  size="lg"
                >
                  Zurück
                </Button>
                <Button
                  onClick={() => goTo(5)}
                  className="flex-1 text-xs tracking-[0.15em] uppercase"
                  size="lg"
                >
                  Weiter
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Reservierung */}
          {step === 5 && (
            <div className="space-y-8">
              <KonfigSummary
                mounting={mounting}
                spinneCount={spinneCount}
                finish={finish}
                light={light}
              />
              <Separator />
              <PreisAufschluesselung
                base={arc.base_price}
                mountingLabel={mountingLabel}
                mountingPrice={mountingPrice}
                finishLabel={finishLabel}
                finishPrice={finishPrice}
                lightLabel={lightLabel}
                lightPrice={lightPrice}
                total={total}
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
                  onClick={() => setStep(4)}
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
