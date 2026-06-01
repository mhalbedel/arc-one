import { test, expect } from '@playwright/test'
import { ARC, NONEXISTENT_ID } from './fixtures/seed'

// Arc IDs aus den Fixtures (is_sanded = false → Flow startet auf dem Schliff-Schritt)
const ARC_ID_ARV_0001 = ARC.ARV_0001.id // blocked_options leer, max_spinne_pendants null
const ARC_ID_ARV_0002 = ARC.ARV_0002.id // max_spinne_pendants null

/**
 * ARV-0001 ist ein Rohling (is_sanded = false) und öffnet auf dem Schliff-Schritt.
 * Helper wählt "Schleifen lassen" (damit der Finish-Schritt im Flow erscheint) und
 * navigiert zum Befestigungs-Schritt.
 */
async function goToBefestigung(page: import('@playwright/test').Page) {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await page.getByRole('button', { name: 'Schleifen lassen', exact: true }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await expect(page.getByRole('heading', { name: 'BEFESTIGUNG' })).toBeVisible()
}

// ── Einstieg ──────────────────────────────────────────────────

test('Konfigurator: READY Rohling lädt mit Schritt 1 (Schliff)', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await expect(page.getByRole('heading', { name: 'SCHLIFF' })).toBeVisible()
  await expect(page.getByText('ARV-0001')).toBeVisible()
})

test('Konfigurator: Unbekannte arc_id → 404', async ({ page }) => {
  await page.goto(`/konfigurator/${NONEXISTENT_ID}`)
  await expect(page).toHaveTitle(/404/)
})

// ── Schritt Schliff (Opt-out default) ─────────────────────────

test('Schliff: Beide Schliff-Optionen sichtbar', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await expect(page.getByRole('button', { name: 'Schleifen lassen', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /Ungeschliffen belassen/ })).toBeVisible()
})

test('Schliff: Ungeschliffen belassen überspringt den Finish-Schritt', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await page.getByRole('button', { name: /Ungeschliffen belassen/ }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  // Kein Finish bei Rohling → direkt Licht
  await expect(page.getByRole('heading', { name: 'LICHT' })).toBeVisible()
})

// ── Schritt Befestigung (Opt-out default = alle sichtbar) ──────

test('Befestigung: Alle Optionen sichtbar (Opt-out), inkl. Ohne Befestigung; Spinne aus (max null)', async ({ page }) => {
  await goToBefestigung(page)
  await expect(page.getByRole('button', { name: 'Wandmontage' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Deckenmontage' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ohne Befestigung' })).toBeVisible()
  // Spinne nicht darstellbar, weil max_spinne_pendants null
  await expect(page.getByRole('button', { name: 'Spinne' })).not.toBeVisible()
})

test('Befestigung: Weiter-Button disabled solange keine Auswahl', async ({ page }) => {
  await goToBefestigung(page)
  await expect(page.getByRole('button', { name: 'Weiter' })).toBeDisabled()
})

test('Befestigung: Ohne Befestigung wählbar → kein Spinne-Stepper, Weiter aktiv', async ({ page }) => {
  await goToBefestigung(page)
  await page.getByRole('button', { name: 'Ohne Befestigung' }).click()
  await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled()
})

test('Befestigung: Weiter führt zu Finish (bei Schleifen)', async ({ page }) => {
  await goToBefestigung(page)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await expect(page.getByRole('heading', { name: 'FINISH' })).toBeVisible()
})

// ── Schritt Finish (inkl. neue Option Unbehandelt) ────────────

test('Finish: Alle Optionen sichtbar inkl. Unbehandelt', async ({ page }) => {
  await goToBefestigung(page)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await expect(page.getByRole('button', { name: 'Unbehandelt', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Öl', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Lack', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Schellack', exact: true })).toBeVisible()
})

test('Finish: Unbehandelt wählbar → Weiter führt zu Licht', async ({ page }) => {
  await goToBefestigung(page)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'Unbehandelt', exact: true }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await expect(page.getByRole('heading', { name: 'LICHT' })).toBeVisible()
})

test('Finish: Zurück-Button führt zu Befestigung mit erhaltener Auswahl', async ({ page }) => {
  await goToBefestigung(page)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'Zurück' }).click()
  await expect(page.getByRole('heading', { name: 'BEFESTIGUNG' })).toBeVisible()
  const wand = page.getByRole('button', { name: 'Wandmontage' })
  await expect(wand).toHaveClass(/bg-foreground/)
})

// ── Schritt Licht (inkl. neue Option Ohne Licht) ──────────────

test('Licht: Alle 4 Optionen sichtbar inkl. Ohne Licht', async ({ page }) => {
  await goToBefestigung(page)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'Öl', exact: true }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await expect(page.getByRole('button', { name: 'Porzellan Fassung' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Hintergrund LED' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'True Light LED' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ohne Licht' })).toBeVisible()
})

// ── Schritt Zusammenfassung ───────────────────────────────────

test('Zusammenfassung: Konfiguration und Preisaufschlüsselung korrekt', async ({ page }) => {
  await goToBefestigung(page)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'Öl', exact: true }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'True Light LED' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await expect(page.getByText('Wandmontage')).toBeVisible()
  await expect(page.getByText('Öl')).toBeVisible()
  await expect(page.getByText('True Light LED')).toBeVisible()
  await expect(page.getByText('PREISAUFSCHLÜSSELUNG')).toBeVisible()
  await expect(page.getByText('Rohling (Grundpreis)')).toBeVisible()
  await expect(page.getByText('Gesamt', { exact: true })).toBeVisible()
})

test('Zusammenfassung: Preisaufschlüsselung blendet 0€-Zeilen aus', async ({ page }) => {
  await goToBefestigung(page)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'Öl', exact: true }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'True Light LED' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  // Befestigung: Wandmontage, price=null → +0€ → ausgeblendet
  await expect(page.getByText('Befestigung: Wandmontage')).not.toBeVisible()
})

test('Zusammenfassung: Ohne Befestigung + Unbehandelt + Ohne Licht ist gültig und wird angezeigt', async ({ page }) => {
  await goToBefestigung(page)
  await page.getByRole('button', { name: 'Ohne Befestigung' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'Unbehandelt', exact: true }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'Ohne Licht' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await expect(page.getByText('Ohne Befestigung')).toBeVisible()
  await expect(page.getByText('Unbehandelt')).toBeVisible()
  await expect(page.getByText('Ohne Licht')).toBeVisible()
  // Keine 0€-Aufpreiszeilen für diese Optionen
  await expect(page.getByText('Befestigung: Ohne Befestigung')).not.toBeVisible()
  await expect(page.getByText('Licht: Ohne Licht')).not.toBeVisible()
})

// ── Schritt Reservierung ──────────────────────────────────────

test('Reservierung: Zusammenfassung und Button sichtbar', async ({ page }) => {
  await goToBefestigung(page)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'Öl', exact: true }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'True Light LED' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: /^Weiter$/ }).click()
  await expect(page.getByText('Reservierung für 24 Stunden')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Jetzt reservieren (24 Std.)' })).toBeVisible()
})

// ── Preisanzeige ──────────────────────────────────────────────

test('Preisanzeige: Grundpreis als "Ab X€" vor vollständiger Konfiguration sichtbar', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await expect(page.getByText('AB')).toBeVisible()
  await expect(page.getByText('480 €')).toBeVisible()
})

// ── Step-Indikator Navigation ─────────────────────────────────

test('Step-Indikator: Klick auf abgeschlossenen Schritt wechselt zurück', async ({ page }) => {
  await goToBefestigung(page)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  // Now on Finish, click an earlier step indicator
  const stepButtons = page.locator('.flex.items-center.gap-0 button')
  await stepButtons.first().click()
  await expect(page.getByRole('heading', { name: 'SCHLIFF' })).toBeVisible()
})

// ── Edge Cases ────────────────────────────────────────────────

test('Edge Case: Spinne ausgeblendet wenn max_spinne_pendants null', async ({ page }) => {
  // ARV-0002 hat max_spinne_pendants=null → Spinne im Befestigungs-Schritt nicht darstellbar
  await page.goto(`/konfigurator/${ARC_ID_ARV_0002}`)
  await page.getByRole('button', { name: 'Schleifen lassen', exact: true }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await expect(page.getByRole('heading', { name: 'BEFESTIGUNG' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Spinne' })).not.toBeVisible()
})

test('Edge Case: Reserve API lehnt fehlende arcId ab (400)', async ({ request }) => {
  const response = await request.post('/api/konfigurator/reserve', {
    data: { sessionId: '00000000-0000-0000-0000-000000000001' },
  })
  expect(response.status()).toBe(400)
})

test('Edge Case: Reserve API lehnt nicht-UUID sessionId ab (400)', async ({ request }) => {
  const response = await request.post('/api/konfigurator/reserve', {
    data: { arcId: ARC_ID_ARV_0001, sessionId: 'test' },
  })
  expect(response.status()).toBe(400)
})

test('Edge Case: Reserve API lehnt nicht-existierende arcId ab (409)', async ({ request }) => {
  const response = await request.post('/api/konfigurator/reserve', {
    data: {
      arcId: NONEXISTENT_ID,
      sessionId: '00000000-0000-0000-0000-000000000001',
    },
  })
  expect(response.status()).toBe(409)
})
