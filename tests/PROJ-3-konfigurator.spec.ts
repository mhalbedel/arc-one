import { test, expect } from '@playwright/test'
import { ARC, NONEXISTENT_ID } from './fixtures/seed'

// Arc IDs aus den Fixtures (is_sanded = false → Flow startet auf dem Schliff-Schritt)
const ARC_ID_ARV_0001 = ARC.ARV_0001.id // blocked_options leer, max_spinne_pendants null
const ARC_ID_ARV_0002 = ARC.ARV_0002.id // max_spinne_pendants = 5 → Spinne verfügbar

/**
 * ARV-0001 ist ein Rohling (is_sanded = false) und öffnet auf dem Schliff-Schritt.
 * Helper wählt "Schleifen lassen" (damit der Finish-Schritt im Flow erscheint) und
 * navigiert zum Befestigungs-Schritt.
 */
async function goToBefestigung(page: import('@playwright/test').Page) {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await page.getByRole('button', { name: /^Schleifen lassen/ }).click()
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
  await expect(page.getByRole('button', { name: /^Schleifen lassen/ })).toBeVisible()
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
  await expect(page.getByRole('button', { name: /^Unbehandelt/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Öl/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Lack/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Schellack/ })).toBeVisible()
})

test('Finish: Unbehandelt wählbar → Weiter führt zu Licht', async ({ page }) => {
  await goToBefestigung(page)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: /^Unbehandelt/ }).click()
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
  await page.getByRole('button', { name: /^Öl/ }).click()
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
  await page.getByRole('button', { name: /^Öl/ }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'True Light LED' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  // exact: true → trifft die Konfig-Zusammenfassung (dd), nicht die Aufschlüsselungs-Zeilen ("Befestigung: Wandmontage" etc.)
  await expect(page.getByText('Wandmontage', { exact: true })).toBeVisible()
  await expect(page.getByText('Öl', { exact: true })).toBeVisible()
  await expect(page.getByText('True Light LED', { exact: true })).toBeVisible()
  await expect(page.getByText('PREISAUFSCHLÜSSELUNG')).toBeVisible()
  await expect(page.getByText('Rohling (Grundpreis)')).toBeVisible()
  await expect(page.getByText('Gesamt', { exact: true })).toBeVisible()
})

test('Zusammenfassung: Aufpreis-Zeilen aus der Matrix erscheinen (Befestigung/Finish/Licht)', async ({ page }) => {
  await goToBefestigung(page)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: /^Öl/ }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'True Light LED' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  // ARV-0001 = mittel/leicht → Wandmontage 40 €, Öl 60 €, True Light LED 75 € (alle > 0 → sichtbar)
  await expect(page.getByText('Befestigung: Wandmontage')).toBeVisible()
  await expect(page.getByText('Finish: Öl')).toBeVisible()
  await expect(page.getByText('Licht: True Light LED')).toBeVisible()
})

test('Zusammenfassung: Ohne Befestigung + Unbehandelt + Ohne Licht ist gültig und wird angezeigt', async ({ page }) => {
  await goToBefestigung(page)
  await page.getByRole('button', { name: 'Ohne Befestigung' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: /^Unbehandelt/ }).click()
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
  await page.getByRole('button', { name: /^Öl/ }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'True Light LED' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: /^Weiter$/ }).click()
  await expect(page.getByText('Reservierung für 24 Stunden')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Jetzt reservieren (24 Std.)' })).toBeVisible()
})

// ── Preisanzeige ──────────────────────────────────────────────

test('Preisanzeige: durchgehende Aufschlüsselung mit Grundpreis + Zwischensumme', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  // Linkes Panel ist in jedem Schritt sichtbar; vor vollständiger Konfig "Zwischensumme"
  await expect(page.getByText('PREISAUFSCHLÜSSELUNG')).toBeVisible()
  await expect(page.getByText('Rohling (Grundpreis)')).toBeVisible()
  await expect(page.getByText('Zwischensumme')).toBeVisible()
})

test('Preisanzeige: Aufpreis je Optionskarte sichtbar; 0 € als "inklusive"', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  // ARV-0001 (mittel) → Schliff 120 €
  await expect(page.getByRole('button', { name: /Schleifen lassen/ })).toContainText('+ 120 €')
  // "Ungeschliffen belassen (Rohling)" kostet nichts → inklusive
  await expect(page.getByRole('button', { name: /Ungeschliffen belassen/ })).toContainText('inklusive')
})

test('Preisanzeige: Spinne-Gesamt aktualisiert sich mit der Pendelanzahl', async ({ page }) => {
  // ARV-0002 (mittel/leicht, max_spinne_pendants=5) → Spinne 25 € / Pendel
  await page.goto(`/konfigurator/${ARC_ID_ARV_0002}`)
  await page.getByRole('button', { name: /Schleifen lassen/ }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'Spinne' }).click()
  await expect(page.getByText('Spinne gesamt')).toBeVisible()
  await expect(page.getByText('+ 25 €', { exact: true })).toBeVisible()
  // Eine Pendel-Stufe hoch → 50 €
  await page.getByRole('button', { name: '+', exact: true }).click()
  await expect(page.getByText('+ 50 €', { exact: true })).toBeVisible()
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

test('Befestigung: Spinne wählbar bei gesetztem max_spinne_pendants (ARV-0002, max=5)', async ({ page }) => {
  // ARV-0002 hat max_spinne_pendants=5 → Spinne ist verfügbar inkl. Pendel-Stepper
  await page.goto(`/konfigurator/${ARC_ID_ARV_0002}`)
  await page.getByRole('button', { name: /^Schleifen lassen/ }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await expect(page.getByRole('heading', { name: 'BEFESTIGUNG' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Spinne' })).toBeVisible()
  await page.getByRole('button', { name: 'Spinne' }).click()
  // Pendel-Stepper erscheint nach Auswahl (exact: trennt vom Karten-Suffix "/ Pendel")
  await expect(page.getByText('Pendel', { exact: true })).toBeVisible()
  await expect(page.getByText('max. 5')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled()
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
