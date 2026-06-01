'use client'

import { cn, formatPrice } from '@/lib/utils'

type OptionCardProps = {
  label: string
  description?: string
  selected: boolean
  onSelect: () => void
  /** Aufpreis in Cent. 0 wird als "inklusive" dargestellt. undefined = kein Preis anzeigen. */
  price?: number
  /** Optionaler Zusatz hinter dem Preis, z.B. "/ Pendel". */
  priceSuffix?: string
}

export function OptionCard({ label, description, selected, onSelect, price, priceSuffix }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left px-5 py-4 border transition-colors flex items-start justify-between gap-4',
        selected
          ? 'border-foreground bg-foreground text-background'
          : 'border-border hover:border-foreground/50'
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {description && (
          <span className={cn('block text-xs mt-0.5', selected ? 'text-background/70' : 'text-muted-foreground')}>
            {description}
          </span>
        )}
      </span>
      {price !== undefined && (
        <span
          className={cn(
            'shrink-0 text-sm tabular-nums',
            price > 0 ? '' : selected ? 'text-background/70' : 'text-muted-foreground'
          )}
        >
          {price > 0 ? `+ ${formatPrice(price)}${priceSuffix ? ` ${priceSuffix}` : ''}` : 'inklusive'}
        </span>
      )}
    </button>
  )
}
