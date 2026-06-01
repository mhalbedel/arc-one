'use client'

import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import type { Arc } from '@/types'
import type { CheckoutConfig, ShippingCountry } from '@/types'
import { calcCheckoutPrices } from '@/lib/pricing'

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

const LIGHT_LABELS: Record<string, string> = {
  porzellan: 'Porzellan Fassung',
  bg_led: 'Hintergrund LED',
  true_led: 'True Light LED',
  ohne: 'Ohne Licht',
}

const SANDING_LABELS: Record<string, string> = {
  schleifen: 'Wird geschliffen',
  rohling: 'Ungeschliffen – Rohling',
  geschliffen: 'Geschliffen',
}

type CheckoutSummaryProps = {
  arc: Arc
  config: CheckoutConfig | null
  shippingCountry: ShippingCountry
}

export function calcPrices(arc: Arc, config: CheckoutConfig | null, shippingCountry: ShippingCountry) {
  if (!config) return null
  return calcCheckoutPrices(arc, config, shippingCountry)
}

export function CheckoutSummary({ arc, config, shippingCountry }: CheckoutSummaryProps) {
  const prices = calcPrices(arc, config, shippingCountry)

  return (
    <div className="space-y-8">
      {/* Arc info */}
      <div>
        <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Arc</p>
        <p className="font-medium">{arc.serial_number}</p>
        <p className="text-sm text-muted-foreground">{arc.width_cm} × {arc.height_cm} cm</p>
      </div>

      {/* Config summary */}
      {config && (
        <>
          <Separator />
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Konfiguration</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Oberfläche</dt>
                <dd>{SANDING_LABELS[config.sandingChoice]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Befestigung</dt>
                <dd>
                  {MOUNTING_LABELS[config.mounting]}
                  {config.mounting === 'spinne' && ` · ${config.spinneCount ?? 1} Pendel`}
                </dd>
              </div>
              {config.finish && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Finish</dt>
                  <dd>{FINISH_LABELS[config.finish]}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Licht</dt>
                <dd>{LIGHT_LABELS[config.light]}</dd>
              </div>
            </dl>
          </div>
        </>
      )}

      {/* Price breakdown */}
      {prices && (
        <>
          <Separator />
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Preisaufschlüsselung</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rohling (Grundpreis)</span>
                <span className="tabular-nums">{formatPrice(arc.base_price)}</span>
              </div>
              {prices.sandingPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Schliff</span>
                  <span className="tabular-nums">{formatPrice(prices.sandingPrice)}</span>
                </div>
              )}
              {prices.mountingPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Befestigung</span>
                  <span className="tabular-nums">{formatPrice(prices.mountingPrice)}</span>
                </div>
              )}
              {prices.finishPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Finish</span>
                  <span className="tabular-nums">{formatPrice(prices.finishPrice)}</span>
                </div>
              )}
              {prices.lightPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Licht</span>
                  <span className="tabular-nums">{formatPrice(prices.lightPrice)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Versand</span>
                <span className="tabular-nums">{formatPrice(prices.shippingPrice)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Gesamt</span>
                <span className="tabular-nums">{formatPrice(prices.total)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Jetzt fällig (30% Deposit)</span>
                <span className="tabular-nums font-medium">{formatPrice(prices.deposit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Restbetrag (vor Versand)</span>
                <span className="tabular-nums">{formatPrice(prices.remaining)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
