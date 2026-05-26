'use client'

import { Button } from '@/components/ui/button'

type SpinneStepperProps = {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

export function SpinneStepper({ value, min, max, onChange }: SpinneStepperProps) {
  return (
    <div className="flex items-center gap-4 mt-3 ml-5">
      <span className="text-xs text-muted-foreground tracking-[0.12em] uppercase">Pendel</span>
      <div className="flex items-center border border-border">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-9 w-9 p-0 rounded-none hover:bg-muted"
        >
          −
        </Button>
        <span className="w-10 text-center text-sm tabular-nums select-none">{value}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-9 w-9 p-0 rounded-none hover:bg-muted"
        >
          +
        </Button>
      </div>
      <span className="text-xs text-muted-foreground">max. {max}</span>
    </div>
  )
}
