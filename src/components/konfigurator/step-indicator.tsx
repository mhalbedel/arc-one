'use client'

import { cn } from '@/lib/utils'

const STEP_LABELS = ['Befestigung', 'Finish', 'Licht', 'Zusammenfassung', 'Reservierung']

type StepIndicatorProps = {
  currentStep: number
  completedUpTo: number
  onStepClick: (step: number) => void
}

export function StepIndicator({ currentStep, completedUpTo, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1
        const isActive = step === currentStep
        const isDone = step < currentStep
        const isClickable = step <= completedUpTo

        return (
          <div key={step} className="flex items-center">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step)}
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
                {isDone ? '✓' : step}
              </span>
              <span className="hidden sm:block text-[10px] tracking-[0.1em] uppercase whitespace-nowrap">
                {label}
              </span>
            </button>
            {step < 5 && (
              <div className={cn(
                'h-px w-4 sm:w-6',
                step < currentStep ? 'bg-muted-foreground' : 'bg-border'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
