import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { finalizeShopOrder } from '@/lib/shop-server'
import { ClearCart } from '@/components/shop/clear-cart'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'

type BestaetigungPageProps = {
  searchParams: Promise<{ payment_intent?: string; redirect_status?: string }>
}

export default async function ShopBestaetigungPage({ searchParams }: BestaetigungPageProps) {
  const { payment_intent, redirect_status } = await searchParams
  if (!payment_intent || redirect_status !== 'succeeded') notFound()

  const supabase = createAdminClient()
  const result = await finalizeShopOrder(supabase, payment_intent)
  if (!result) notFound()

  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <ClearCart />
      <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Vielen Dank</p>
      <h1 className="font-serif text-3xl md:text-4xl font-normal mt-3">Ihr Kauf ist bestätigt</h1>
      <p className="text-muted-foreground mt-4">
        Bestellnummer <span className="font-medium text-foreground">{result.orderNumber}</span>
        {result.customerEmail && (
          <>
            {' '}· Bestätigung an <span className="text-foreground">{result.customerEmail}</span>
          </>
        )}
      </p>

      {result.unclaimed.length > 0 && (
        <div className="mt-8 text-left border border-amber-300 bg-amber-50 rounded-md p-5 text-sm">
          <p className="font-medium">Ein Hinweis zu Ihrer Bestellung</p>
          <p className="mt-1 text-muted-foreground">
            {result.unclaimed.length === 1 ? 'Folgendes Stück war' : 'Folgende Stücke waren'} zum
            Zahlungszeitpunkt leider bereits vergeben:
          </p>
          <ul className="mt-1 list-disc pl-5">
            {result.unclaimed.map((item) => (
              <li key={item.id}>{item.name_snapshot}</li>
            ))}
          </ul>
          <p className="mt-2 text-muted-foreground">
            Den entsprechenden Betrag erstatten wir Ihnen zurück und melden uns persönlich.
          </p>
        </div>
      )}

      <div className="mt-10 text-left border rounded-md p-6 space-y-4">
        <h2 className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Ihre Stücke</h2>
        <ul className="space-y-2">
          {result.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="font-serif">{item.name_snapshot}</span>
              <span className="tabular-nums">{formatPrice(item.price_cents)}</span>
            </li>
          ))}
        </ul>
        <Separator />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Versand (kombiniert)</span>
          <span className="tabular-nums">{formatPrice(result.shipping)}</span>
        </div>
        <div className="flex justify-between text-base font-medium">
          <span>Gesamt bezahlt</span>
          <span className="tabular-nums">{formatPrice(result.total)}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-8">
        Wir bereiten den Versand vor und melden uns mit den Versanddetails. Versand nur DE/AT/CH.
      </p>

      <Button asChild className="mt-8 text-xs tracking-[0.15em] uppercase">
        <Link href="/shop">Weiter im Shop</Link>
      </Button>
    </main>
  )
}
