import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import type { Product } from '@/types'

const bodySchema = z.object({
  productCode: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
})

export async function POST(req: NextRequest) {
  // Spam-Schutz: max. 5 Anfragen pro IP in 10 Minuten
  if (!rateLimit(`inquiry:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' },
      { status: 429 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const { productCode, name, email, phone, message } = parsed.data
  const supabase = createAdminClient()

  // Produkt auflösen — nur Anfrage-Produkte sind anfragefähig
  const { data: productData } = await supabase
    .from('products')
    .select('id, purchase_mode')
    .eq('product_code', productCode)
    .maybeSingle()

  const product = productData as Pick<Product, 'id' | 'purchase_mode'> | null
  if (!product) {
    return NextResponse.json({ error: 'Produkt nicht gefunden.' }, { status: 404 })
  }
  if (product.purchase_mode !== 'inquiry') {
    return NextResponse.json({ error: 'Dieses Produkt ist nicht anfragefähig.' }, { status: 409 })
  }

  const { error } = await supabase.from('product_inquiries').insert({
    product_id: product.id,
    name,
    email,
    phone: phone || null,
    message,
    status: 'NEU',
  } as unknown as never)

  if (error) {
    return NextResponse.json({ error: 'Anfrage konnte nicht gespeichert werden.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
