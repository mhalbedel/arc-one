import { createClient } from '@supabase/supabase-js'
import { ARCS, DROP, NONEXISTENT_ID, PRICING_RULES, PRICING_SETTINGS } from './fixtures/seed'

/**
 * Setzt die Test-Datenbank vor jedem E2E-Lauf auf einen bekannten Zustand zurück.
 *
 * SICHERHEIT: Läuft nur, wenn E2E_ALLOW_DB_RESET === 'true' (gesetzt in .env.test).
 * Das verhindert, dass dieser destruktive Reset versehentlich gegen die Prod-DB
 * läuft, falls die falschen Env-Vars geladen werden.
 */
export default async function globalSetup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (process.env.E2E_ALLOW_DB_RESET !== 'true') {
    throw new Error(
      'E2E abgebrochen: E2E_ALLOW_DB_RESET ist nicht "true". Setze es in .env.test ' +
      '(nur fuer die separate Test-Supabase) — niemals fuer die Prod-DB.',
    )
  }
  if (!url || !serviceKey) {
    throw new Error('E2E abgebrochen: NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt in .env.test.')
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

  // Reihenfolge wegen Foreign Keys: arcs ist Kind von drops (drop_id) und
  // orders (order_id) → arcs zuerst loeschen, dann die Eltern.
  await supabase.from('arcs').delete().neq('id', NONEXISTENT_ID)
  await supabase.from('orders').delete().neq('id', NONEXISTENT_ID)
  await supabase.from('drops').delete().neq('id', NONEXISTENT_ID)

  const { error: dropError } = await supabase.from('drops').insert(DROP)
  if (dropError) throw new Error(`Seed drops fehlgeschlagen: ${dropError.message}`)

  const { error: arcError } = await supabase.from('arcs').insert(ARCS)
  if (arcError) throw new Error(`Seed arcs fehlgeschlagen: ${arcError.message}`)

  // Preismatrix (PROJ-3a) deterministisch setzen
  await supabase.from('pricing_rules').delete().neq('id', NONEXISTENT_ID)
  await supabase.from('pricing_settings').delete().neq('id', NONEXISTENT_ID)
  const { error: settingsError } = await supabase.from('pricing_settings').insert(PRICING_SETTINGS)
  if (settingsError) throw new Error(`Seed pricing_settings fehlgeschlagen: ${settingsError.message}`)
  const { error: rulesError } = await supabase.from('pricing_rules').insert(PRICING_RULES)
  if (rulesError) throw new Error(`Seed pricing_rules fehlgeschlagen: ${rulesError.message}`)

  console.log(`[global-setup] Test-DB zurückgesetzt: ${ARCS.length} Arcs, 1 Drop, ${PRICING_RULES.length} Preisregeln.`)
}
