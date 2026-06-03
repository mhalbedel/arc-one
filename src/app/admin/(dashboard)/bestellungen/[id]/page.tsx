import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { OrderEditor } from '@/components/admin/order-editor'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import type { OrderStatus, OrderType } from '@/types'

interface OrderDetail {
  id: string
  order_number: string
  order_type: OrderType
  config: Record<string, unknown> | null
  base_price: number
  sanding_price: number
  mounting_price: number
  finish_price: number
  light_price: number
  shipping_price: number
  total_price: number
  deposit_amount: number
  remaining_amount: number
  deposit_paid_at: string | null
  remaining_paid_at: string | null
  estimated_days: number
  status: OrderStatus
  admin_notes: string | null
  confirmed_at: string | null
  created_at: string
  customers: {
    name: string | null
    email: string
    phone: string | null
    address: { delivery?: Address; billing?: Address | null } | null
  } | null
  arcs: { serial_number: string }[] | null
  order_items: { id: string; name_snapshot: string; price_cents: number }[] | null
}

interface Address {
  street: string
  zip: string
  city: string
  country: string
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
const LIGHT_LABELS: Record<string, string> = {
  porzellan: 'Porzellan Fassung',
  bg_led: 'Hintergrund LED',
  true_led: 'True Light LED',
  ohne: 'Ohne Licht',
}
const SANDING_LABELS: Record<string, string> = {
  schleifen: 'Schleifen lassen',
  rohling: 'Rohling (ungeschliffen)',
  geschliffen: 'Bereits geschliffen',
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

function PriceRow({ label, cents }: { label: string; cents: number }) {
  if (!cents) return null
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{formatPrice(cents)}</span>
    </div>
  )
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select(
      'id, order_number, order_type, config, base_price, sanding_price, mounting_price, finish_price, light_price, shipping_price, total_price, deposit_amount, remaining_amount, deposit_paid_at, remaining_paid_at, estimated_days, status, admin_notes, confirmed_at, created_at, customers(name, email, phone, address), arcs(serial_number), order_items(id, name_snapshot, price_cents)',
    )
    .eq('id', id)
    .maybeSingle()

  const order = data as unknown as OrderDetail | null
  if (!order) notFound()

  const isShop = order.order_type === 'SHOP'
  const config = order.config ?? {}
  const delivery = order.customers?.address?.delivery
  const sanding = String(config.sandingChoice ?? '')
  const mounting = String(config.mounting ?? '')
  const finish = config.finish ? String(config.finish) : null
  const light = String(config.light ?? '')
  const spinneCount = typeof config.spinneCount === 'number' ? config.spinneCount : null

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/bestellungen"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Bestellungen
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{order.order_number}</h1>
          <OrderStatusBadge status={order.status} />
          <Badge
            variant={isShop ? 'default' : 'outline'}
            className="text-[10px] uppercase tracking-[0.1em]"
          >
            {isShop ? 'Shop' : 'Pre-Order'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Eingegangen am {formatDate(order.created_at)}
          {order.arcs?.[0] && <> · Arc {order.arcs[0].serial_number}</>}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Kunde */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kunde</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row label="Name" value={order.customers?.name ?? '—'} />
              <Row label="E-Mail" value={order.customers?.email ?? '—'} />
              <Row label="Telefon" value={order.customers?.phone ?? '—'} />
              {delivery && (
                <>
                  <Separator className="my-2" />
                  <Row
                    label="Lieferadresse"
                    value={
                      <span className="whitespace-pre-line">
                        {delivery.street}
                        {'\n'}
                        {delivery.zip} {delivery.city}
                        {'\n'}
                        {delivery.country}
                      </span>
                    }
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Konfiguration (Arc-Pre-Order) bzw. Artikel (Shop) */}
          {isShop ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Artikel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(order.order_items ?? []).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name_snapshot}</span>
                    <span className="tabular-nums">{formatPrice(item.price_cents)}</span>
                  </div>
                ))}
                {(order.order_items?.length ?? 0) === 0 && (
                  <p className="text-sm text-muted-foreground">Keine Positionen.</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Konfiguration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sanding && <Row label="Schliff" value={SANDING_LABELS[sanding] ?? sanding} />}
                {mounting && (
                  <Row
                    label="Befestigung"
                    value={
                      <>
                        {MOUNTING_LABELS[mounting] ?? mounting}
                        {mounting === 'spinne' && spinneCount ? ` (${spinneCount} Pendel)` : ''}
                      </>
                    }
                  />
                )}
                <Row label="Finish" value={finish ? (FINISH_LABELS[finish] ?? finish) : '—'} />
                {light && <Row label="Licht" value={LIGHT_LABELS[light] ?? light} />}
              </CardContent>
            </Card>
          )}

          {/* Preis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preis-Aufschluesselung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <PriceRow label="Basispreis" cents={order.base_price} />
              <PriceRow label="Schliff" cents={order.sanding_price} />
              <PriceRow label="Befestigung" cents={order.mounting_price} />
              <PriceRow label="Finish" cents={order.finish_price} />
              <PriceRow label="Licht" cents={order.light_price} />
              <PriceRow label="Versand" cents={order.shipping_price} />
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Gesamt</span>
                <span className="tabular-nums">{formatPrice(order.total_price)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Zahlungsstatus (read-only, aus Stripe) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zahlung (Stripe)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isShop ? (
                <Row
                  label="Vollzahlung (100%)"
                  value={
                    order.deposit_paid_at ? (
                      <span className="text-emerald-700">
                        {formatPrice(order.total_price)} · {formatDate(order.deposit_paid_at)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{formatPrice(order.total_price)} · offen</span>
                    )
                  }
                />
              ) : (
                <>
                  <Row
                    label="Anzahlung (30%)"
                    value={
                      order.deposit_paid_at ? (
                        <span className="text-emerald-700">
                          {formatPrice(order.deposit_amount)} · {formatDate(order.deposit_paid_at)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{formatPrice(order.deposit_amount)} · offen</span>
                      )
                    }
                  />
                  <Row
                    label="Restbetrag (70%)"
                    value={
                      order.remaining_paid_at ? (
                        <span className="text-emerald-700">
                          {formatPrice(order.remaining_amount)} · {formatDate(order.remaining_paid_at)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{formatPrice(order.remaining_amount)} · offen</span>
                      )
                    }
                  />
                </>
              )}
              <p className="pt-1 text-xs text-muted-foreground">
                Zahlungsstatus wird automatisch durch Stripe gesetzt (nur Referenz).
              </p>
            </CardContent>
          </Card>

          {/* Verwaltung */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verwaltung</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderEditor
                orderId={order.id}
                initialStatus={order.status}
                initialNotes={order.admin_notes}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
