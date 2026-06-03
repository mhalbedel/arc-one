'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { CartIndicator } from '@/components/shop/cart-indicator'

export function SiteHeader() {
  const pathname = usePathname()

  // Verstecktes Admin-CMS: keine oeffentliche Navigation im /admin-Bereich
  if (pathname?.startsWith('/admin')) return null

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-baseline gap-4">
          <span className="font-serif text-lg tracking-[0.18em] font-medium uppercase">
            ARC-ONE
          </span>
          <span className="hidden sm:block text-[12px] tracking-[0.12em] uppercase text-muted-foreground">
            Exklusive Eukalyptus-Lichtarchitektur & Unikat-Manufaktur
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/arcs"
            className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Arcs
          </Link>
          <Link
            href="/shop"
            className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Shop
          </Link>
          <CartIndicator />
        </nav>
      </div>
      <Separator />
    </header>
  )
}
