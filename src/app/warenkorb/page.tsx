'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CartTotals } from '@/components/shop/cart-totals'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils'
import type { ResolvedCartItem, ShippingCountry } from '@/types'

type ResolveResponse = {
  items: ResolvedCartItem[]
  subtotal: number
  shipping: number | null
  total: number | null
}

export default function WarenkorbPage() {
  const { items: refs, remove } = useCart()
  const [country, setCountry] = useState<ShippingCountry>('DE')
  const [data, setData] = useState<ResolveResponse | null>(null)
  const [loading, setLoading] = useState(true)

  // Live-Auflösung: Preise/Verfügbarkeit/Versand serverseitig (kein Client-Trust).
  useEffect(() => {
    let active = true
    if (refs.length === 0) {
      setData({ items: [], subtotal: 0, shipping: 0, total: 0 })
      setLoading(false)
      return
    }
    setLoading(true)
    fetch('/api/shop/cart/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refs, country }),
    })
      .then((r) => r.json())
      .then((d: ResolveResponse) => {
        if (active) setData(d)
      })
      .catch(() => active && setData(null))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [refs, country])

  const hasAvailable = (data?.items ?? []).some((i) => i.available)

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="font-serif text-3xl md:text-4xl font-normal mb-8">Warenkorb</h1>

      {refs.length === 0 || (data && data.items.length === 0) ? (
        <div className="py-24 text-center space-y-4">
          <p className="text-muted-foreground">Ihr Warenkorb ist leer.</p>
          <Button asChild variant="outline" className="text-xs tracking-[0.15em] uppercase">
            <Link href="/shop">Zurück in den Shop</Link>
          </Button>
        </div>
      ) : loading && !data ? (
        <p className="text-sm text-muted-foreground">Wird geladen …</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12">
          {/* Positionen */}
          <ul className="divide-y">
            {(data?.items ?? []).map((item) => (
              <li key={`${item.source}:${item.code}`} className="flex gap-4 py-5">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-muted">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <Link href={`/shop/${item.code}`} className="font-serif text-sm hover:underline">
                        {item.name}
                      </Link>
                      {!item.available && (
                        <Badge variant="secondary" className="ml-0 block w-fit text-[10px] tracking-[0.12em] uppercase">
                          Nicht mehr verfügbar
                        </Badge>
                      )}
                    </div>
                    <span className={`text-sm tabular-nums ${item.available ? '' : 'text-muted-foreground line-through'}`}>
                      {formatPrice(item.priceCents)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.source, item.code)}
                    className="self-start text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Entfernen
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Zusammenfassung */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div className="space-y-2">
              <label className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Lieferland</label>
              <Select value={country} onValueChange={(v) => setCountry(v as ShippingCountry)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DE">Deutschland</SelectItem>
                  <SelectItem value="AT">Österreich</SelectItem>
                  <SelectItem value="CH">Schweiz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <CartTotals
              subtotal={data?.subtotal ?? 0}
              shipping={data?.shipping ?? null}
              total={data?.total ?? null}
            />

            <Button
              asChild={hasAvailable}
              disabled={!hasAvailable}
              size="lg"
              className="w-full text-xs tracking-[0.15em] uppercase"
            >
              {hasAvailable ? <Link href="/shop/checkout">Zur Kasse</Link> : <span>Zur Kasse</span>}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Versand nur DE/AT/CH · Versandkosten werden im Checkout final berechnet.
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
