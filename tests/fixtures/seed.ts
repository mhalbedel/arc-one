/**
 * Kanonische Seed-Daten für E2E-Tests (feste UUIDs = stabile Referenzen).
 * Single Source of Truth für globalSetup (Reset der Test-DB) und die Specs.
 *
 * 10 READY-Arcs (ARV-0001..0010) für Katalog/Konfigurator + 1 reservierter
 * Arc (ARV-0011) für die Checkout-Tests. Browse filtert READY → zeigt 10.
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
    max_spinne_pendants: null, drop_id: DROP.id,
  }),
  arc({
    id: uuid(2), serial_number: 'ARV-0002', base_price: 62000,
    character: 'Langer flacher Bogen, fast symmetrisch.',
    max_spinne_pendants: null, drop_id: DROP.id, // max null → Spinne ausgeblendet (PROJ-3 Edge Case)
  }),
  arc({ id: uuid(3), serial_number: 'ARV-0003', base_price: 71000, drop_id: DROP.id,
    character: 'Tiefer, fast schalenförmiger Arc mit starker Wölbung.' }),
  arc({ id: uuid(4), serial_number: 'ARV-0004', base_price: 53000,
    character: 'Klassischer Halbmond mit lebendiger Riffelung.' }), // drop_id null → kein Badge
  arc({ id: uuid(5), serial_number: 'ARV-0005', base_price: 58000,
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
}

export const NONEXISTENT_ID = '00000000-0000-0000-0000-000000000000'
