import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { finalizeShopOrder } from '@/lib/shop-server'

const bodySchema = z.object({
  paymentIntentId: z.string().min(1),
})

/**
 * Schließt einen Shop-Kauf nach erfolgreicher Zahlung ab — idempotent.
 * Optionaler client-getriebener Pfad; der primäre Abschluss läuft über die
 * Bestätigungsseite (Stripe-Redirect). Beide nutzen `finalizeShopOrder`.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const result = await finalizeShopOrder(supabase, parsed.data.paymentIntentId)

  if (!result) {
    return NextResponse.json({ error: 'Zahlung nicht abgeschlossen.' }, { status: 409 })
  }

  return NextResponse.json({
    orderNumber: result.orderNumber,
    total: result.total,
    items: result.items,
    unclaimed: result.unclaimed,
  })
}
