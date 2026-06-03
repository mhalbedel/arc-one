'use client'

import { useEffect } from 'react'
import { useCart } from '@/hooks/use-cart'

/** Leert den Warenkorb beim Mounten — auf der Bestätigungsseite eingesetzt. */
export function ClearCart() {
  const { clear } = useCart()
  useEffect(() => {
    clear()
  }, [clear])
  return null
}
