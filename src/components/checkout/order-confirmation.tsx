import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import type { Arc, Order } from '@/types'

type OrderConfirmationProps = {
  arc: Arc
  order: Order
  customerEmail: string | null
}

export function OrderConfirmation({ arc, order, customerEmail }: OrderConfirmationProps) {
  const config = order.config as Record<string, string | null> | null

  return (
    <div className="mx-auto max-w-2xl px-6 py-14 space-y-10">
      <div className="space-y-2">
        <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Bestellung bestätigt</p>
        <h1 className="text-2xl font-medium">Bestellnummer {order.order_number}</h1>
        <p className="text-sm text-muted-foreground">
          Eine Bestätigungsmail wurde an {customerEmail ?? 'deine E-Mail-Adresse'} gesendet.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Arc</p>
        <p className="font-medium">{arc.serial_number}</p>
        <p className="text-sm text-muted-foreground">{arc.width_cm} × {arc.height_cm} cm</p>
      </div>

      {config && (
        <>
          <Separator />
          <div className="space-y-3">
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Konfiguration</p>
            <dl className="space-y-2 text-sm">
              {config.sandingChoice && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Oberfläche</dt>
                  <dd>{String(config.sandingChoice)}</dd>
                </div>
              )}
              {config.mounting && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Befestigung</dt>
                  <dd>{String(config.mounting)}</dd>
                </div>
              )}
              {config.finish && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Finish</dt>
                  <dd>{String(config.finish)}</dd>
                </div>
              )}
              {config.light && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Licht</dt>
                  <dd>{String(config.light)}</dd>
                </div>
              )}
            </dl>
          </div>
        </>
      )}

      <Separator />

      <div className="space-y-3">
        <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Zahlung</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gesamtpreis</span>
            <span className="tabular-nums">{formatPrice(order.total_price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bezahlt (30% Deposit)</span>
            <span className="tabular-nums font-medium">{formatPrice(order.deposit_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ausstehend (vor Versand)</span>
            <span className="tabular-nums">{formatPrice(order.remaining_amount)}</span>
          </div>
        </div>
      </div>

      <div className="bg-muted px-5 py-4 text-sm space-y-1">
        <p className="font-medium">Wie geht es weiter?</p>
        <p className="text-muted-foreground text-xs">
          Wir melden uns innerhalb von 2–3 Werktagen mit einer Auftragsbestätigung und dem geplanten Produktionszeitraum.
          Den Restbetrag ({formatPrice(order.remaining_amount)}) zahlst du vor dem Versand.
        </p>
      </div>
    </div>
  )
}
