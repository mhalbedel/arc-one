'use client'

import { cn } from '@/lib/utils'

type OptionCardProps = {
  label: string
  description?: string
  selected: boolean
  onSelect: () => void
}

export function OptionCard({ label, description, selected, onSelect }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left px-5 py-4 border transition-colors',
        selected
          ? 'border-foreground bg-foreground text-background'
          : 'border-border hover:border-foreground/50'
      )}
    >
      <span className="block text-sm font-medium">{label}</span>
      {description && (
        <span className={cn('block text-xs mt-0.5', selected ? 'text-background/70' : 'text-muted-foreground')}>
          {description}
        </span>
      )}
    </button>
  )
}
