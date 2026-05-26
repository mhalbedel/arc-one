import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-16">
        <Link
          href="/"
          className="font-serif text-lg tracking-[0.18em] font-medium uppercase"
        >
          ARC-ONE
        </Link>
        <nav>
          <Link
            href="/arcs"
            className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Arcs
          </Link>
        </nav>
      </div>
      <Separator />
    </header>
  )
}
