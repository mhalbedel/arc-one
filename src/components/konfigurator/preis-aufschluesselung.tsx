import { formatPrice } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

type PreisAufschluessselungProps = {
  base: number
  sandingPrice: number
  mountingLabel: string
  mountingPrice: number
  finishLabel: string
  finishPrice: number
  lightLabel: string
  lightPrice: number
  total: number
  totalLabel?: string
}

export function PreisAufschluesselung({
  base,
  sandingPrice,
  mountingLabel,
  mountingPrice,
  finishLabel,
  finishPrice,
  lightLabel,
  lightPrice,
  total,
  totalLabel = 'Gesamt',
}: PreisAufschluessselungProps) {
  const rows = [
    { label: 'Rohling (Grundpreis)', price: base, always: true },
    { label: 'Schliff', price: sandingPrice, always: false },
    { label: `Befestigung: ${mountingLabel}`, price: mountingPrice, always: false },
    { label: `Finish: ${finishLabel}`, price: finishPrice, always: false },
    { label: `Licht: ${lightLabel}`, price: lightPrice, always: false },
  ]

  return (
    <div className="space-y-2">
      <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Preisaufschlüsselung</p>
      {rows.map(({ label, price, always }) => {
        if (!always && price === 0) return null
        return (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="tabular-nums">{formatPrice(price)}</span>
          </div>
        )
      })}
      <Separator />
      <div className="flex justify-between text-sm font-medium">
        <span>{totalLabel}</span>
        <span className="tabular-nums">{formatPrice(total)}</span>
      </div>
    </div>
  )
}
