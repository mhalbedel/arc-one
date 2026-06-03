'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ContactForm, type ContactFormValues } from '@/components/checkout/contact-form'
import { CartTotals } from '@/components/shop/cart-totals'
import { ShopPaymentForm } from '@/components/shop/shop-payment-form'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils'
import type { ResolvedCartItem, ShippingCountry } from '@/types'

type Phase = 'form' | 'payment'

type CheckoutResponse = {
  clientSecret: string
  items: ResolvedCartItem[]
  removed: { source: string; code: string; name: string }[]
  subtotal: number
  shipping: number
  total: number
}

export function ShopCheckoutClient() {
  const { items: refs, remove } = useCart()
  const [country, setCountry] = useState<ShippingCountry>('DE')
  const [preview, setPreview] = useState<{ items: ResolvedCartItem[]; subtotal: number; shipping: number | null; total: number | null } | null>(null)
  const [phase, setPhase] = useState<Phase>('form')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [payTotal, setPayTotal] = useState(0)
  const [removedNotice, setRemovedNotice] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Vorschau (Preise/Versand serverseitig) — nur in der Formular-Phase.
  useEffect(() => {
    if (phase !== 'form' || refs.length === 0) return
    let active = true
    fetch('/api/shop/cart/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refs, country }),
    })
      .then((r) => r.json())
      .then((d) => active && setPreview(d))
      .catch(() => active && setPreview(null))
    return () => {
      active = false
    }
  }, [refs, country, phase])

  const handleSubmit = useCallback(
    async (contactData: ContactFormValues) => {
      setError(null)
      setRemovedNotice([])
      setSubmitting(true)
      try {
        const res = await fetch('/api/shop/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refs, contactData }),
        })
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          // Alle Stücke vergriffen o. Ä.
          if (Array.isArray((data as { removed?: unknown }).removed)) {
            for (const r of (data as CheckoutResponse).removed) remove(r.source as 'product' | 'arc', r.code)
          }
          setError((data as { error?: string }).error ?? 'Checkout fehlgeschlagen.')
          return
        }

        const ok = data as CheckoutResponse
        // Zwischenzeitlich verkaufte Stücke aus dem lokalen Warenkorb entfernen + Hinweis
        if (ok.removed.length > 0) {
          setRemovedNotice(ok.removed.map((r) => r.name))
          for (const r of ok.removed) remove(r.source as 'product' | 'arc', r.code)
        }
        setPayTotal(ok.total)
        setClientSecret(ok.clientSecret)
        setPhase('payment')
      } finally {
        setSubmitting(false)
      }
    },
    [refs, remove],
  )

  if (refs.length === 0 && phase === 'form') {
    return (
      <div className="py-24 text-center space-y-4">
        <p className="text-muted-foreground">Ihr Warenkorb ist leer.</p>
        <Button asChild variant="outline" className="text-xs tracking-[0.15em] uppercase">
          <Link href="/shop">Zurück in den Shop</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-10 md:gap-14 lg:gap-20">
      {/* Zusammenfassung */}
      <div className="md:sticky md:top-24 md:self-start space-y-5">
        <h2 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Bestellübersicht</h2>
        <ul className="space-y-3">
          {(preview?.items ?? []).map((item) => (
            <li key={`${item.source}:${item.code}`} className="flex items-start justify-between gap-3 text-sm">
              <div className="space-y-0.5">
                <span className="font-serif">{item.name}</span>
                {!item.available && (
                  <Badge variant="secondary" className="block w-fit text-[10px] tracking-[0.12em] uppercase">
                    Nicht mehr verfügbar
                  </Badge>
                )}
              </div>
              <span className={`tabular-nums ${item.available ? '' : 'text-muted-foreground line-through'}`}>
                {formatPrice(item.priceCents)}
              </span>
            </li>
          ))}
        </ul>
        <Separator />
        <CartTotals
          subtotal={preview?.subtotal ?? 0}
          shipping={preview?.shipping ?? null}
          total={preview?.total ?? null}
        />
      </div>

      {/* Formular / Zahlung */}
      <div className="space-y-8">
        <div>
          <h1 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
            {phase === 'form' ? 'Ihre Daten' : 'Zahlung'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {phase === 'form'
              ? 'Bitte geben Sie Ihre Kontakt- und Lieferdaten ein.'
              : 'Bezahlen Sie den vollen Betrag. Versand nur DE/AT/CH.'}
          </p>
        </div>

        <Separator />

        {removedNotice.length > 0 && (
          <div className="bg-muted px-5 py-4 text-sm">
            <p className="font-medium">Einige Stücke wurden zwischenzeitlich verkauft:</p>
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {removedNotice.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <p className="mt-1 text-muted-foreground">Der Betrag wurde entsprechend angepasst.</p>
          </div>
        )}

        {phase === 'form' && (
          <>
            <ContactForm onSubmit={handleSubmit} onCountryChange={setCountry} submitting={submitting} />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </>
        )}

        {phase === 'payment' && clientSecret && (
          <ShopPaymentForm clientSecret={clientSecret} total={payTotal} />
        )}
      </div>
    </div>
  )
}
