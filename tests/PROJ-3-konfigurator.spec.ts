import { test, expect } from '@playwright/test'

// Arc IDs from seed data
const ARC_ID_ARV_0001 = 'd837b8f1-d073-4e42-b730-b820e52449a1' // compat: ohne, wand, decke (no spinne)

// ── Einstieg ──────────────────────────────────────────────────

test('Konfigurator: READY arc lädt mit Schritt 1 (Befestigung)', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await expect(page.getByRole('heading', { name: 'BEFESTIGUNG' })).toBeVisible()
  await expect(page.getByText('ARV-0001')).toBeVisible()
})

test('Konfigurator: Unbekannte arc_id → 404', async ({ page }) => {
  await page.goto('/konfigurator/00000000-0000-0000-0000-000000000000')
  await expect(page).toHaveTitle(/404/)
})

// ── Schritt 1: Befestigung ────────────────────────────────────

test('Schritt 1: Nur kompatible Befestigungsoptionen sichtbar (ohne Spinne bei ARV-0001)', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await expect(page.getByRole('button', { name: 'Ohne Befestigung' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Wandmontage' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Deckenmontage' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Spinne' })).not.toBeVisible()
})

test('Schritt 1: Weiter-Button disabled solange keine Auswahl', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await expect(page.getByRole('button', { name: 'Weiter' })).toBeDisabled()
})

test('Schritt 1: Weiter-Button aktiv nach Auswahl', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await expect(page.getByRole('button', { name: 'Weiter' })).toBeEnabled()
})

test('Schritt 1: Weiter-Button führt zu Schritt 2 (Finish)', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await expect(page.getByRole('heading', { name: 'FINISH' })).toBeVisible()
})

// ── Schritt 2: Finish ─────────────────────────────────────────

test('Schritt 2: Alle kompatiblen Finish-Optionen sichtbar', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await expect(page.getByRole('button', { name: 'Öl', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Lack', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Schellack', exact: true })).toBeVisible()
})

test('Schritt 2: Zurück-Button führt zu Schritt 1 mit erhaltener Auswahl', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'Zurück' }).click()
  await expect(page.getByRole('heading', { name: 'BEFESTIGUNG' })).toBeVisible()
  // Wandmontage still selected (dark background class)
  const wand = page.getByRole('button', { name: 'Wandmontage' })
  await expect(wand).toHaveClass(/bg-foreground/)
})

// ── Schritt 3: Licht ──────────────────────────────────────────

test('Schritt 3: Alle 3 Lichtoptionen immer sichtbar', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'Öl' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await expect(page.getByRole('button', { name: 'Porzellan Fassung' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Hintergrund LED' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'True Light LED' })).toBeVisible()
})

// ── Schritt 4: Zusammenfassung ────────────────────────────────

test('Schritt 4: Konfiguration und Preisaufschlüsselung korrekt', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'Öl' }).click()
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

test('Schritt 4: Preisaufschlüsselung blendet 0€-Zeilen aus', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'Öl' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'True Light LED' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  // Befestigung: Wandmontage, price=null → +0€ → ausgeblendet
  await expect(page.getByText('Befestigung: Wandmontage')).not.toBeVisible()
})

// ── Schritt 5: Reservierung ───────────────────────────────────

test('Schritt 5: Reservierungs-Zusammenfassung und Button sichtbar', async ({ page }) => {
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'Öl' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: 'True Light LED' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: /Reservieren/ }).click()
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
  await page.goto(`/konfigurator/${ARC_ID_ARV_0001}`)
  await page.getByRole('button', { name: 'Wandmontage' }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  // Now on step 2, click step 1 indicator (shows ✓)
  const stepButtons = page.locator('.flex.items-center.gap-0 button')
  await stepButtons.first().click()
  await expect(page.getByRole('heading', { name: 'BEFESTIGUNG' })).toBeVisible()
})

// ── Edge Cases ────────────────────────────────────────────────

test('Edge Case: Spinne ausgeblendet wenn max_spinne_pendants null', async ({ page }) => {
  // ARV-0002 has compat_spinne=true but max_spinne_pendants=null
  await page.goto('/konfigurator/55c8dcaa-25cf-4fae-b989-dfd9e6fd2dc7')
  await expect(page.getByRole('button', { name: 'Spinne' })).not.toBeVisible()
})

test('Edge Case: Reserve API lehnt fehlende arcId ab (400)', async ({ request }) => {
  const response = await request.post('/api/konfigurator/reserve', {
    data: { sessionId: 'test-session' },
  })
  expect(response.status()).toBe(400)
})

test('Edge Case: Reserve API lehnt fehlende sessionId ab (400)', async ({ request }) => {
  const response = await request.post('/api/konfigurator/reserve', {
    data: { arcId: ARC_ID_ARV_0001 },
  })
  expect(response.status()).toBe(400)
})

test('Edge Case: Reserve API lehnt nicht-existierende arcId ab (409)', async ({ request }) => {
  const response = await request.post('/api/konfigurator/reserve', {
    data: { arcId: '00000000-0000-0000-0000-000000000000', sessionId: 'test' },
  })
  expect(response.status()).toBe(409)
})
