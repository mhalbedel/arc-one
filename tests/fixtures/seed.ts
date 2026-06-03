/**
 * Kanonische Seed-Daten für E2E-Tests (feste UUIDs = stabile Referenzen).
 * Single Source of Truth für globalSetup (Reset der Test-DB) und die Specs.
 *
 * 10 READY-Arcs (ARV-0001..0010) für Katalog/Konfigurator + 1 reservierter
 * Arc (ARV-0011) für die Checkout-Tests + 1 FIXED-Arc (ARV-0012) für den Shop
 * (PROJ-9). Browse filtert READY → zeigt 10 (RESERVED + FIXED ausgeschlossen).
 */

export const DROP = {
  id: 'a1000000-0000-0000-0000-000000000001',
  title: 'Drop #01 — Die ersten Bögen',
  slug: 'drop-01-die-ersten-boegen',
  scheduled_at: '2026-06-15 10:00:00+00',
  status: 'SCHEDULED',
  description: 'Die erste kuratierte Auswahl aus dem Frühjahrseinschlag 2026.',
}

type ArcSeed = {
  id: string
  serial_number: string
  width_cm: number
  height_cm: number
  depth_cm: number
  weight_grams: number
  harvest_date: string | null
  forest_section: string | null
  cut_number: number | null
  character: string
  status: string
  base_price: number
  is_sanded: boolean
  max_spinne_pendants: number | null
  blocked_options: string[]
  drop_id: string | null
  reserved_until: string | null
  reserved_by: string | null
}

const uuid = (n: number) => `a2000000-0000-0000-0000-0000000000${String(n).padStart(2, '0')}`

/** Defaults für nicht testrelevante Felder; pro Arc überschrieben. */
function arc(partial: Partial<ArcSeed> & Pick<ArcSeed, 'id' | 'serial_number' | 'base_price'>): ArcSeed {
  return {
    width_cm: 80,
    height_cm: 45,
    depth_cm: 22,
    weight_grams: 2000,
    harvest_date: '2026-02-12 00:00:00+00',
    forest_section: 'Monchique Sektor 1',
    cut_number: 1,
    character: 'Handgefertigter Eukalyptus-Bogen, Unikat.',
    status: 'READY',
    is_sanded: false,
    max_spinne_pendants: 5,
    blocked_options: [],
    drop_id: null,
    reserved_until: null,
    reserved_by: null,
    ...partial,
  }
}

export const ARCS: ArcSeed[] = [
  arc({
    id: uuid(1), serial_number: 'ARV-0001', base_price: 48000,
    width_cm: 78.5, height_cm: 42.0, depth_cm: 22.0, weight_grams: 1840,
    harvest_date: '2026-02-12 00:00:00+00', forest_section: 'Monchique Sektor 3', cut_number: 1,
    character: 'Weit geschwungener Bogen mit tiefer Maserung entlang der Wölbung.',
    max_spinne_pendants: null, drop_id: DROP.id, // bewusst null → Spinne ausgeblendet (negativer Test)
  }),
  arc({
    id: uuid(2), serial_number: 'ARV-0002', base_price: 62000,
    character: 'Langer flacher Bogen, fast symmetrisch.',
    max_spinne_pendants: 5, drop_id: DROP.id, // Spinne aktiviert (konsistent mit Prod)
  }),
  arc({ id: uuid(3), serial_number: 'ARV-0003', base_price: 71000, drop_id: DROP.id,
    character: 'Tiefer, fast schalenförmiger Arc mit starker Wölbung.' }),
  arc({ id: uuid(4), serial_number: 'ARV-0004', base_price: 53000,
    character: 'Klassischer Halbmond mit lebendiger Riffelung.' }), // drop_id null → kein Badge
  arc({ id: uuid(5), serial_number: 'ARV-0005', base_price: 58000,
    max_spinne_pendants: 5, // Spinne aktiviert (konsistent mit Prod)
    character: 'Breiter Bogen mit auffälliger Astnarbe in der Mitte.' }),
  arc({ id: uuid(6), serial_number: 'ARV-0006', base_price: 32000, // günstigster (320 €)
    character: 'Kleines, kompaktes Exemplar mit heller Rinde.' }),
  arc({ id: uuid(7), serial_number: 'ARV-0007', base_price: 66000,
    character: 'Langer, leicht gedrehter Bogen.' }),
  arc({ id: uuid(8), serial_number: 'ARV-0008', base_price: 79000, // teuerster
    character: 'Schwerer, massiver Bogen mit außergewöhnlicher Tiefe.' }),
  arc({ id: uuid(9), serial_number: 'ARV-0009', base_price: 44000,
    character: 'Gleichmäßiger Halbmond mit feiner Quermaserung.' }),
  arc({ id: uuid(10), serial_number: 'ARV-0010', base_price: 61000,
    character: 'Kräftiger Bogen mit dunkler Kernzone und hellem Außenrand.' }),
  // Reservierter Arc für Checkout-Tests (nicht READY → nicht im Browse-Grid)
  arc({
    id: uuid(11), serial_number: 'ARV-0011', base_price: 58000,
    character: 'Reservierter Test-Arc für den Checkout-Flow.',
    status: 'RESERVED',
    reserved_until: '2099-01-01 00:00:00+00',
    reserved_by: '00000000-0000-0000-0000-0000000000aa',
  }),
  // FIXED-Arc für den Shop (PROJ-9): erscheint im Shop, NICHT in Katalog/Konfigurator
  arc({
    id: uuid(12), serial_number: 'ARV-0012', base_price: 90000,
    character: 'Fertiger Arc — nur als-ist im Shop kaufbar.',
    status: 'FIXED',
  }),
]

/** Stabile Referenzen für die Specs. */
export const ARC = {
  ARV_0001: ARCS[0],
  ARV_0002: ARCS[1],
  ARV_0004: ARCS[3],
  ARV_0006: ARCS[5],
  ARV_0008: ARCS[7],
  ARV_0010: ARCS[9],
  RESERVED: ARCS[10], // ARV-0011
  FIXED: ARCS[11], // ARV-0012 (Shop)
}

export const NONEXISTENT_ID = '00000000-0000-0000-0000-000000000000'

// ── Shop-Produkte (PROJ-9) ────────────────────────────────────
// Nicht-Arc-Objekte. Fotos bewusst leer ([]), damit next/image keine
// externen Domains braucht (Storefront zeigt dann den "Kein Foto"-Platzhalter).

type ProductSeed = {
  id: string
  product_code: string
  name: string
  description: string
  category: 'leuchten' | 'schalen_accessoires' | 'tische_moebel'
  tier: 'standard' | 'premium_art'
  purchase_mode: 'direct' | 'inquiry'
  price_cents: number | null
  shipping_override_cents: number | null
  photos: string[]
  status: 'AVAILABLE' | 'SOLD' | 'ARCHIVED'
  is_published: boolean
}

const puuid = (n: number) => `a3000000-0000-0000-0000-0000000000${String(n).padStart(2, '0')}`

function product(
  p: Partial<ProductSeed> & Pick<ProductSeed, 'id' | 'product_code' | 'name' | 'category'>,
): ProductSeed {
  return {
    description: 'Fertiges Einzelstück aus der Manufaktur.',
    tier: 'standard',
    purchase_mode: 'direct',
    price_cents: 12000,
    shipping_override_cents: null,
    photos: [],
    status: 'AVAILABLE',
    is_published: true,
    ...p,
  }
}

export const PRODUCTS: ProductSeed[] = [
  product({ id: puuid(1), product_code: 'P-DIR001', name: 'Tischleuchte Eukalyptus', category: 'leuchten', price_cents: 12000 }),
  product({ id: puuid(2), product_code: 'P-DIR002', name: 'Schale Wurzelholz', category: 'schalen_accessoires', price_cents: 8000, shipping_override_cents: 15000 }),
  product({ id: puuid(3), product_code: 'P-SOLD01', name: 'Beistelltisch Olive', category: 'tische_moebel', price_cents: 30000, status: 'SOLD' }),
  product({ id: puuid(4), product_code: 'P-INQ001', name: 'Monumentale Tischplatte', category: 'tische_moebel', tier: 'premium_art', purchase_mode: 'inquiry', price_cents: null }),
  product({ id: puuid(5), product_code: 'P-HIDDEN', name: 'Versteckte Leuchte', category: 'leuchten', price_cents: 5000, is_published: false }),
  product({ id: puuid(6), product_code: 'P-ARCH01', name: 'Archivierte Schale', category: 'schalen_accessoires', price_cents: 5000, status: 'ARCHIVED' }),
  // Dedizierte Produkte für mutierende Checkout-Tests (Hold/Order) — je Test ein eigenes Stück,
  // damit parallele Tests sich nicht über dieselbe Sperre in die Quere kommen.
  product({ id: puuid(7), product_code: 'P-CHK01', name: 'Checkout Testleuchte 1', category: 'leuchten', price_cents: 20000 }),
  product({ id: puuid(8), product_code: 'P-CHK02', name: 'Checkout Testleuchte 2', category: 'leuchten', price_cents: 25000 }),
]

/** Stabile Produkt-Referenzen für die Specs. */
export const PRODUCT = {
  DIRECT: PRODUCTS[0], // P-DIR001 — Direktkauf, verfügbar
  OVERRIDE: PRODUCTS[1], // P-DIR002 — mit Versand-Override
  SOLD: PRODUCTS[2], // P-SOLD01 — verkauft
  INQUIRY: PRODUCTS[3], // P-INQ001 — Premium/Art, Anfrage
  HIDDEN: PRODUCTS[4], // P-HIDDEN — ausgeblendet
  ARCHIVED: PRODUCTS[5], // P-ARCH01 — archiviert
  CHK1: PRODUCTS[6], // P-CHK01 — Checkout-Mutationstest
  CHK2: PRODUCTS[7], // P-CHK02 — Checkout-Mutationstest
}

// ── Test-Admin (PROJ-5) ───────────────────────────────────────
// Wird von global-setup angelegt: auth.users mit app_metadata.role='admin'
// PLUS admin_profiles-Zeile. Beides ist noetig (RLS is_admin() + Gate-Lookup).
export const ADMIN = {
  email: 'qa-admin@arc-one.test',
  password: 'qa-admin-passwort-123',
  name: 'QA Admin',
}

// ── Preismatrix (PROJ-3a) ─────────────────────────────────────
// Spiegelt db/migrations/008_pricing_matrix.sql, damit E2E-Preis-Assertions
// deterministisch sind (in Cent). global-setup setzt diese Werte bei jedem Lauf.

export const PRICING_SETTINGS = {
  size_klein_max_cm2: 3000,
  size_mittel_max_cm2: 6000,
  weight_leicht_max_g: 2000,
  weight_mittel_max_g: 5000,
}

export const PRICING_RULES: { component: string; variant: string | null; tier: string; price_cents: number }[] = [
  { component: 'schliff', variant: null, tier: 'klein', price_cents: 8000 },
  { component: 'schliff', variant: null, tier: 'mittel', price_cents: 12000 },
  { component: 'schliff', variant: null, tier: 'gross', price_cents: 18000 },
  { component: 'finish', variant: 'oel', tier: 'klein', price_cents: 4000 },
  { component: 'finish', variant: 'oel', tier: 'mittel', price_cents: 6000 },
  { component: 'finish', variant: 'oel', tier: 'gross', price_cents: 8000 },
  { component: 'finish', variant: 'lack', tier: 'klein', price_cents: 5000 },
  { component: 'finish', variant: 'lack', tier: 'mittel', price_cents: 7500 },
  { component: 'finish', variant: 'lack', tier: 'gross', price_cents: 10000 },
  { component: 'finish', variant: 'schellack', tier: 'klein', price_cents: 6000 },
  { component: 'finish', variant: 'schellack', tier: 'mittel', price_cents: 9000 },
  { component: 'finish', variant: 'schellack', tier: 'gross', price_cents: 12000 },
  { component: 'mounting', variant: 'wand', tier: 'leicht', price_cents: 4000 },
  { component: 'mounting', variant: 'wand', tier: 'mittel', price_cents: 6000 },
  { component: 'mounting', variant: 'wand', tier: 'schwer', price_cents: 9000 },
  { component: 'mounting', variant: 'decke', tier: 'leicht', price_cents: 6000 },
  { component: 'mounting', variant: 'decke', tier: 'mittel', price_cents: 9000 },
  { component: 'mounting', variant: 'decke', tier: 'schwer', price_cents: 13000 },
  { component: 'mounting', variant: 'spinne', tier: 'leicht', price_cents: 2500 },
  { component: 'mounting', variant: 'spinne', tier: 'mittel', price_cents: 3500 },
  { component: 'mounting', variant: 'spinne', tier: 'schwer', price_cents: 5000 },
  { component: 'light', variant: 'porzellan', tier: 'klein', price_cents: 1000 },
  { component: 'light', variant: 'porzellan', tier: 'mittel', price_cents: 1500 },
  { component: 'light', variant: 'porzellan', tier: 'gross', price_cents: 2000 },
  { component: 'light', variant: 'bg_led', tier: 'klein', price_cents: 3000 },
  { component: 'light', variant: 'bg_led', tier: 'mittel', price_cents: 4500 },
  { component: 'light', variant: 'bg_led', tier: 'gross', price_cents: 6000 },
  { component: 'light', variant: 'true_led', tier: 'klein', price_cents: 5000 },
  { component: 'light', variant: 'true_led', tier: 'mittel', price_cents: 7500 },
  { component: 'light', variant: 'true_led', tier: 'gross', price_cents: 10000 },
]
