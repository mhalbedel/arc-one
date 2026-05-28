'use client'

import { useState, useEffect } from 'react'
import { Separator } from '@/components/ui/separator'
import { CheckoutSummary, calcPrices } from './checkout-summary'
import { ContactForm } from './contact-form'
import { StripePaymentForm } from './stripe-payment-form'
import type { Arc, CheckoutConfig, ShippingCountry } from '@/types'
import type { ContactFormValues } from './contact-form'

type Phase = 'form' | 'payment'

type CheckoutClientProps = {
  arc: Arc
}

export function CheckoutClient({ arc }: CheckoutClientProps) {
  const [config, setConfig] = useState<CheckoutConfig | null>(null)
  const [shippingCountry, setShippingCountry] = useState<ShippingCountry>('DE')
  const [phase, setPhase] = useState<Phase>('form')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(`arc_config_${arc.id}`)
    if (stored) {
      try {
        setConfig(JSON.parse(stored))
      } catch {
        // malformed — ignore
      }
    }
  }, [arc.id])

  async function handleFormSubmit(contactData: ContactFormValues) {
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arcId: arc.id, contactData, config }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as { error?: string }).error ?? 'Ein Fehler ist aufgetreten.')
        return
      }

      const data = await res.json()

      setClientSecret(data.clientSecret)
      setShippingCountry(contactData.country as ShippingCountry)
      setPhase('payment')
    } finally {
      setSubmitting(false)
    }
  }

  const prices = calcPrices(arc, config, shippingCountry)

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-10 md:gap-14 lg:gap-20">

        {/* Left: Summary */}
        <div className="md:sticky md:top-24 md:self-start">
          <CheckoutSummary arc={arc} config={config} shippingCountry={shippingCountry} />
        </div>

        {/* Right: Form / Payment */}
        <div className="space-y-8">
          <div>
            <h1 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
              {phase === 'form' ? 'Deine Daten' : 'Zahlung'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {phase === 'form'
                ? 'Bitte gib deine Kontakt- und Lieferdaten ein.'
                : 'Zahle jetzt den 30% Deposit. Kein Kauf ohne weitere Bestätigung.'}
            </p>
          </div>

          <Separator />

          {phase === 'form' && (
            <>
              {!config && (
                <div className="bg-muted px-5 py-4 text-sm text-muted-foreground">
                  Konfiguration nicht gefunden.{' '}
                  <a href={`/konfigurator/${arc.id}`} className="underline">
                    Zurück zum Konfigurator
                  </a>
                </div>
              )}
              <ContactForm
                onSubmit={handleFormSubmit}
                onCountryChange={setShippingCountry}
                submitting={submitting}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </>
          )}

          {phase === 'payment' && clientSecret && prices && (
            <StripePaymentForm
              clientSecret={clientSecret}
              arcId={arc.id}
              depositAmount={prices.deposit}
            />
          )}
        </div>
      </div>
    </div>
  )
}
