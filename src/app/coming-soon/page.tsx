import type { Metadata } from 'next'
import { PinGate } from '@/components/gate/pin-gate'

export const metadata: Metadata = {
  title: 'ARC-ONE — Coming soon',
}

/** PROJ-15: Coming-Soon-Seite (nur auf Vercel sichtbar, bis der PIN eingegeben ist). */
export default function ComingSoonPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-10 px-6 text-center">
      <PinGate />
      <div className="flex flex-col items-center gap-4">
        <p className="max-w-md text-[12px] tracking-[0.12em] uppercase text-muted-foreground">
          Exklusive Eukalyptus-Lichtarchitektur &amp; Unikat-Manufaktur
        </p>
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
          Coming soon
        </p>
      </div>
    </main>
  )
}
