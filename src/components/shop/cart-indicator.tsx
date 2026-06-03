'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'

/** Warenkorb-Link mit Positionsanzahl im Header. */
export function CartIndicator() {
  const { count } = useCart()

  return (
    <Link
      href="/warenkorb"
      aria-label={`Warenkorb (${count})`}
      className="relative text-muted-foreground hover:text-foreground transition-colors"
    >
      <ShoppingBag className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium tabular-nums text-background">
          {count}
        </span>
      )}
    </Link>
  )
}
