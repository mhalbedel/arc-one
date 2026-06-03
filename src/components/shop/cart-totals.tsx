import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'

type CartTotalsProps = {
  subtotal: number
  shipping: number | null
  total: number | null
}

/** Beträge-Block: Zwischensumme, kombinierter Versand, Gesamt. */
export function CartTotals({ subtotal, shipping, total }: CartTotalsProps) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Zwischensumme</span>
        <span className="tabular-nums">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Versand (kombiniert)</span>
        <span className="tabular-nums">{shipping == null ? '—' : formatPrice(shipping)}</span>
      </div>
      <Separator className="my-2" />
      <div className="flex justify-between text-base font-medium">
        <span>Gesamt</span>
        <span className="tabular-nums">{total == null ? '—' : formatPrice(total)}</span>
      </div>
    </div>
  )
}
