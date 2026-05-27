'use client'

import { cn } from '@/lib/utils'

type StepIndicatorProps = {
  steps: string[]
  currentIndex: number
  furthestIndex: number
  onStepClick: (index: number) => void
}

export function StepIndicator({ steps, currentIndex, furthestIndex, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const isActive = i === currentIndex
        const isDone = i < currentIndex
        const isClickable = i <= furthestIndex

        return (
          <div key={label} className="flex items-center">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(i)}
              className={cn(
                'flex flex-col items-center gap-1.5 px-3 py-2 transition-colors',
                isActive && 'text-foreground',
                isDone && isClickable && 'text-muted-foreground hover:text-foreground cursor-pointer',
                !isDone && !isActive && 'text-muted-foreground/40 cursor-default'
              )}
            >
              <span className={cn(
                'flex h-6 w-6 items-center justify-center text-xs border',
                isActive && 'border-foreground bg-foreground text-background',
                isDone && 'border-muted-foreground text-muted-foreground',
                !isDone && !isActive && 'border-border text-muted-foreground/40'
              )}>
                {isDone ? '✓' : i + 1}
              </span>
              <span className="hidden sm:block text-[10px] tracking-[0.1em] uppercase whitespace-nowrap">
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className={cn(
                'h-px w-4 sm:w-6',
                i < currentIndex ? 'bg-muted-foreground' : 'bg-border'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
