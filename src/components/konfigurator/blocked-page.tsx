import Link from 'next/link'
import { Button } from '@/components/ui/button'

type BlockedPageProps = {
  reservedUntil: string
}

export function BlockedPage({ reservedUntil: reservedUntilStr }: BlockedPageProps) {
  const until = new Date(reservedUntilStr)
  const timeStr = until.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  const dateStr = until.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <main className="mx-auto max-w-6xl px-6 py-32 text-center space-y-8">
      <div className="space-y-3">
        <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">Nicht verfügbar</p>
        <h1 className="font-serif text-3xl md:text-4xl font-normal">
          Dieser Arc ist gerade reserviert
        </h1>
        <p className="text-sm text-muted-foreground">
          Reserviert bis {dateStr}, {timeStr} Uhr
        </p>
      </div>
      <Button asChild variant="outline" className="text-xs tracking-[0.15em] uppercase">
        <Link href="/arcs">Andere Arcs entdecken →</Link>
      </Button>
    </main>
  )
}
