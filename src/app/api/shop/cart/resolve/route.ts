import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveCartItems } from '@/lib/shop-server'
import { calcShipping, calcSubtotal } from '@/lib/shop'
import type { ShippingCountry } from '@/types'

const bodySchema = z.object({
  refs: z
    .array(
      z.object({
        source: z.enum(['product', 'arc']),
        code: z.string().min(1),
      }),
    )
    .max(50),
  country: z.enum(['DE', 'AT', 'CH']).optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const { refs, country } = parsed.data
  const supabase = createAdminClient()

  const resolved = await resolveCartItems(supabase, refs)
  const items = resolved.map((r) => r.display)

  // Versand braucht ein Land; ohne Auswahl nur die Zwischensumme zurückgeben.
  const shippingCountry = (country ?? 'DE') as ShippingCountry
  const subtotal = calcSubtotal(items)
  const shipping = country ? calcShipping(items, shippingCountry) : null
  const total = shipping == null ? null : subtotal + shipping

  return NextResponse.json({ items, subtotal, shipping, total })
}
