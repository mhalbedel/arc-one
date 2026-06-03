'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import type { CartRef } from '@/types'

type AddToCartButtonProps = {
  source: CartRef['source']
  code: string
}

/** Direktkauf-CTA: legt das Unikat in den Warenkorb bzw. verlinkt dorthin. */
export function AddToCartButton({ source, code }: AddToCartButtonProps) {
  const { has, add } = useCart()
  const inCart = has(source, code)

  if (inCart) {
    return (
      <Button asChild size="lg" variant="outline" className="w-full text-xs tracking-[0.15em] uppercase">
        <Link href="/warenkorb">Im Warenkorb · zur Kasse</Link>
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      className="w-full text-xs tracking-[0.15em] uppercase"
      onClick={() => add(source, code)}
    >
      In den Warenkorb
    </Button>
  )
}
