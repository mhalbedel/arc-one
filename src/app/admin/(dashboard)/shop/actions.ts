'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ProductCategory, ProductTier, PurchaseMode, ProductStatus } from '@/types'

export interface ProductInput {
  id?: string
  name: string
  description: string
  category: ProductCategory
  tier: ProductTier
  purchase_mode: PurchaseMode
  price_cents: number | null
  shipping_override_cents: number | null
  photos: string[]
  model_3d_url: string | null
  width_cm: number | null
  height_cm: number | null
  depth_cm: number | null
  weight_grams: number | null
  is_published: boolean
}

/** Kurzer, eindeutiger Produktcode für die URL, z. B. P-7F3K2. */
function generateProductCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // ohne 0/O/1/I
  let code = ''
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `P-${code}`
}

function mapError(error: { code?: string; message: string }): string {
  if (error.code === '23505') return 'Produktcode-Kollision — bitte erneut speichern.'
  if (error.code === '23514') return 'Direktkauf-Produkte benötigen einen Preis.'
  return error.message || 'Speichern fehlgeschlagen.'
}

export async function saveProduct(input: ProductInput): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient()
  const { id, ...fields } = input

  if (id) {
    const { data, error } = await supabase
      .from('products')
      .update(fields as never)
      .eq('id', id)
      .select('id')
    if (error) return { error: mapError(error) }
    if (!data || data.length === 0) return { error: 'Produkt nicht gefunden oder kein Schreibzugriff.' }
    revalidatePath('/admin/shop')
    revalidatePath(`/admin/shop/${id}`)
    revalidatePath('/shop')
    return { id }
  }

  const { data, error } = await supabase
    .from('products')
    .insert({ ...fields, product_code: generateProductCode() } as never)
    .select('id')
    .single()
  if (error) return { error: mapError(error) }
  revalidatePath('/admin/shop')
  revalidatePath('/shop')
  return { id: (data as { id: string }).id }
}

/**
 * Löscht ein Produkt — nur wenn keine Bestellposition oder Anfrage verknüpft ist.
 * Andernfalls Hinweis, das Produkt stattdessen zu archivieren (Referenzintegrität).
 */
export async function deleteProduct(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const [{ count: orderCount }, { count: inquiryCount }] = await Promise.all([
    supabase.from('order_items').select('id', { count: 'exact', head: true }).eq('product_id', id),
    supabase.from('product_inquiries').select('id', { count: 'exact', head: true }).eq('product_id', id),
  ])

  if ((orderCount ?? 0) > 0 || (inquiryCount ?? 0) > 0) {
    return { error: 'Produkt hat verknüpfte Bestellungen/Anfragen — bitte archivieren statt löschen.' }
  }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/shop')
  revalidatePath('/shop')
  return {}
}

/** Setzt den Verkaufsstatus (z. B. ARCHIVED), unabhängig von der Sichtbarkeit. */
export async function setProductStatus(id: string, status: ProductStatus): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .update({ status } as never)
    .eq('id', id)
    .select('id')
  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: 'Produkt nicht gefunden.' }
  revalidatePath('/admin/shop')
  revalidatePath('/shop')
  return {}
}
