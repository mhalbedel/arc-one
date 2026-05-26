import { formatPrice } from '@/lib/utils'

type PriceDisplayProps = {
  total: number
  hasFullConfig: boolean
}

export function PriceDisplay({ total, hasFullConfig }: PriceDisplayProps) {
  return (
    <div className="border-t border-border pt-4 mt-4">
      <div className="flex items-baseline justify-between">
        <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
          {hasFullConfig ? 'Gesamtpreis' : 'Ab'}
        </span>
        <span className="font-serif text-2xl tabular-nums">{formatPrice(total)}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        30 % Deposit · 70 % vor Versand
      </p>
    </div>
  )
}
