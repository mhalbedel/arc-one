'use client'

import { useState } from 'react'
import { Wordmark } from '@/components/layout/wordmark'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

/**
 * PROJ-15: Logo als Zugang. Klick blendet ein 6-stelliges PIN-Feld ein; bei korrektem
 * PIN setzt die API ein Cookie und wir navigieren per Vollnavigation auf "/", damit der
 * Proxy mit dem neuen Cookie die echte Seite ausliefert.
 */
export function PinGate() {
  const [open, setOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(value: string) {
    setLoading(true)
    setError('')
    const res = await fetch('/api/gate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: value }),
    })
    if (res.ok) {
      window.location.href = '/'
      return
    }
    setError(res.status === 429 ? 'Zu viele Versuche.' : 'Falscher Code.')
    setPin('')
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Zugang"
        className="cursor-pointer"
      >
        <Wordmark />
      </button>

      {open && (
        <div className="flex flex-col items-center gap-3">
          <Input
            autoFocus
            inputMode="numeric"
            maxLength={6}
            value={pin}
            disabled={loading}
            placeholder="------"
            aria-label="6-stelliger Code"
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 6)
              setPin(v)
              if (v.length === 6) submit(v)
            }}
            className="w-44 text-center text-lg tracking-[0.5em]"
          />
          {error && <p className="text-xs text-accent">{error}</p>}
          <Button
            variant="outline"
            disabled={pin.length !== 6 || loading}
            onClick={() => submit(pin)}
            className="text-xs tracking-[0.15em] uppercase"
          >
            Eintreten
          </Button>
        </div>
      )}
    </div>
  )
}
