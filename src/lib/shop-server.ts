import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe-server'
import { claimOrderEmail } from '@/lib/email/guard'
import { sendShopOrderEmails, type EmailCustomer } from '@/lib/email/senders'
import type { CartRef, Database, Product, Arc, Order, OrderItem, ResolvedCartItem, Address } from '@/types'

type Db = SupabaseClient<Database>

/**
 * Serverseitig aufgelöste Position inkl. der für den Checkout nötigen Roh-Referenz
 * (id + Status) für die atomare Kaufsicherung. Der Client bekommt nur `display`.
 */
export interface ServerCartItem {
  ref: CartRef
  id: string
  display: ResolvedCartItem
}

/**
 * Löst Warenkorb-Referenzen (Quelle + Code) gegen die echten Daten auf.
 * Preise, Verfügbarkeit und Versand-Override stammen ausschließlich vom Server.
 *
 * - Nicht-Arc-Produkte: nur veröffentlichte, nicht archivierte erscheinen;
 *   verkaufte bleiben sichtbar mit `available=false`.
 * - FIXED-Arcs: `available=false`, sobald eine `order_id` gesetzt ist.
 * - Gelöschte/ausgeblendete/nicht-Direktkauf-Referenzen entfallen (nicht enthalten).
 *
 * Reihenfolge folgt der Eingabe; Duplikate (gleiche Quelle+Code) werden entfernt.
 */
export async function resolveCartItems(supabase: Db, refs: CartRef[]): Promise<ServerCartItem[]> {
  const seen = new Set<string>()
  const unique = refs.filter((r) => {
    const key = `${r.source}:${r.code}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const productCodes = unique.filter((r) => r.source === 'product').map((r) => r.code)
  const arcCodes = unique.filter((r) => r.source === 'arc').map((r) => r.code)

  const [productsRes, arcsRes] = await Promise.all([
    productCodes.length
      ? supabase.from('products').select('*').in('product_code', productCodes)
      : Promise.resolve({ data: [] as Product[] }),
    arcCodes.length
      ? supabase.from('arcs').select('*').in('serial_number', arcCodes).eq('status', 'FIXED')
      : Promise.resolve({ data: [] as Arc[] }),
  ])

  const products = new Map((productsRes.data as Product[] | null ?? []).map((p) => [p.product_code, p]))
  const arcs = new Map((arcsRes.data as Arc[] | null ?? []).map((a) => [a.serial_number, a]))

  const items: ServerCartItem[] = []
  for (const ref of unique) {
    if (ref.source === 'product') {
      const p = products.get(ref.code)
      // Nur veröffentlichte, nicht archivierte, direkt-kaufbare Produkte
      if (!p || !p.is_published || p.status === 'ARCHIVED' || p.purchase_mode !== 'direct') continue
      items.push({
        ref,
        id: p.id,
        display: {
          source: 'product',
          code: p.product_code,
          name: p.name,
          priceCents: p.price_cents ?? 0,
          imageUrl: p.photos[0] ?? null,
          shippingOverrideCents: p.shipping_override_cents,
          available: p.status === 'AVAILABLE',
        },
      })
    } else {
      const a = arcs.get(ref.code)
      if (!a) continue
      items.push({
        ref,
        id: a.id,
        display: {
          source: 'arc',
          code: a.serial_number,
          name: `Arc ${a.serial_number}`,
          priceCents: a.base_price,
          imageUrl: a.photo_front_url,
          shippingOverrideCents: null,
          available: a.order_id == null,
        },
      })
    }
  }
  return items
}

export interface FinalizeResult {
  orderNumber: string
  total: number
  shipping: number
  items: OrderItem[]
  customerEmail: string | null
  /**
   * Positionen, die zum Zahlungszeitpunkt nicht mehr beansprucht werden konnten
   * (Sperre abgelaufen + zwischenzeitlich anderweitig verkauft). Sie wurden mit
   * der Zahlung belastet und müssen erstattet werden — der Order werden sie per
   * `admin_notes` markiert. Nur beim ersten (abschließenden) Aufruf gefüllt.
   */
  unclaimed: OrderItem[]
}

/**
 * Schließt einen Shop-Kauf nach erfolgreicher Zahlung ab — **idempotent**.
 * Verifiziert den PaymentIntent bei Stripe, markiert alle Positionen atomar als
 * verkauft (bedingtes Update) und setzt die Order auf `CONFIRMED` (100 % bezahlt).
 *
 * Rückgabe `null`, wenn keine Order zum PaymentIntent existiert oder die Zahlung
 * (noch) nicht erfolgreich ist. Mehrfachaufrufe liefern dasselbe Ergebnis.
 */
export async function finalizeShopOrder(
  supabase: Db,
  paymentIntentId: string,
): Promise<FinalizeResult | null> {
  const { data: orderData } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_deposit_id', paymentIntentId)
    .eq('order_type', 'SHOP')
    .maybeSingle()
  const order = orderData as Order | null
  if (!order) return null

  const { data: itemsData } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)
  const items = (itemsData as OrderItem[] | null) ?? []

  const customer = await loadCustomer(supabase, order.customer_id)
  const customerEmail = customer?.email ?? null

  // Bereits abgeschlossen → idempotent dieselbe Zusammenfassung.
  if (order.status !== 'PENDING_CONFIRMATION') {
    return { orderNumber: order.order_number, total: order.total_price, shipping: order.shipping_price, items, customerEmail, unclaimed: [] }
  }

  const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId)
  if (paymentIntent.status !== 'succeeded') return null

  // Positionen atomar beanspruchen. Das bedingte Update kann 0 Zeilen treffen,
  // wenn die Kurzzeit-Sperre während der Zahlung ablief und das Unikat
  // zwischenzeitlich anderweitig verkauft wurde — solche Positionen sind bezahlt,
  // aber nicht lieferbar und müssen erstattet werden (SHOP-M1).
  const now = new Date().toISOString()
  const unclaimed: OrderItem[] = []
  for (const item of items) {
    let claimed = false
    if (item.product_id) {
      const { data } = await supabase
        .from('products')
        .update({ status: 'SOLD', held_until: null, held_by: null } as unknown as never)
        .eq('id', item.product_id)
        .eq('status', 'AVAILABLE')
        .select('id')
        .maybeSingle()
      claimed = !!data
    } else if (item.arc_id) {
      const { data } = await supabase
        .from('arcs')
        .update({ order_id: order.id, reserved_until: null, reserved_by: null } as unknown as never)
        .eq('id', item.arc_id)
        .eq('status', 'FIXED')
        .is('order_id', null)
        .select('id')
        .maybeSingle()
      claimed = !!data
    }
    if (!claimed) unclaimed.push(item)
  }

  // Order abschließen (Zahlung erfolgte) — bei nicht beanspruchten Positionen
  // zusätzlich klar für die Admin-Rückerstattung markieren.
  const adminNote =
    unclaimed.length > 0
      ? `[ACHTUNG] ${unclaimed.length} Position(en) bei Zahlung nicht mehr verfügbar — Rückerstattung prüfen: ${unclaimed
          .map((i) => i.name_snapshot)
          .join(', ')}.`
      : null
  await supabase
    .from('orders')
    .update({
      status: 'CONFIRMED',
      deposit_paid_at: now,
      remaining_paid_at: now,
      ...(adminNote ? { admin_notes: adminNote } : {}),
    } as unknown as never)
    .eq('id', order.id)

  // Bestaetigungsmails (Kunde #2 + Atelier #5) — genau einmal, nicht-blockierend.
  if (customer && (await claimOrderEmail(supabase, order.id))) {
    const confirmed: Order = { ...order, status: 'CONFIRMED', deposit_paid_at: now, remaining_paid_at: now }
    await sendShopOrderEmails(confirmed, items, customer)
  }

  return { orderNumber: order.order_number, total: order.total_price, shipping: order.shipping_price, items, customerEmail, unclaimed }
}

async function loadCustomer(supabase: Db, customerId: string | null): Promise<EmailCustomer | null> {
  if (!customerId) return null
  const { data } = await supabase
    .from('customers')
    .select('name, email, address')
    .eq('id', customerId)
    .maybeSingle()
  const row = data as { name: string | null; email: string; address: unknown } | null
  if (!row) return null
  return { email: row.email, name: row.name, address: row.address as Address | null }
}
