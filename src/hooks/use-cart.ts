'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CartRef } from '@/types'

const STORAGE_KEY = 'arc-one-cart'
const CART_EVENT = 'arc-one-cart-change'

function readCart(): CartRef[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (r): r is CartRef =>
        r && (r.source === 'product' || r.source === 'arc') && typeof r.code === 'string',
    )
  } catch {
    return []
  }
}

function writeCart(refs: CartRef[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(refs))
  // Synchronisiert alle Hook-Instanzen im selben Tab (storage-Event feuert nur tab-übergreifend)
  window.dispatchEvent(new Event(CART_EVENT))
}

/**
 * Warenkorb-Zustand im localStorage. Hält nur Referenzen (Quelle + Code) —
 * Preise/Verfügbarkeit werden serverseitig aufgelöst. Jedes Unikat liegt
 * höchstens einmal im Warenkorb (Menge fix 1).
 */
export function useCart() {
  const [items, setItems] = useState<CartRef[]>([])

  useEffect(() => {
    const sync = () => setItems(readCart())
    sync()
    window.addEventListener(CART_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CART_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const has = useCallback(
    (source: CartRef['source'], code: string) =>
      items.some((r) => r.source === source && r.code === code),
    [items],
  )

  const add = useCallback((source: CartRef['source'], code: string) => {
    const next = readCart()
    if (next.some((r) => r.source === source && r.code === code)) return
    writeCart([...next, { source, code }])
  }, [])

  const remove = useCallback((source: CartRef['source'], code: string) => {
    writeCart(readCart().filter((r) => !(r.source === source && r.code === code)))
  }, [])

  const clear = useCallback(() => writeCart([]), [])

  return { items, count: items.length, has, add, remove, clear }
}
