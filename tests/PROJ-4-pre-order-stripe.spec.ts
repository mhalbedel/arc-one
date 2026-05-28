import { test, expect } from '@playwright/test'

// ARV-0005 UUID — used for checkout tests (must be RESERVED or READY in the DB)
const ARC_ID = '95416a37-cca2-479d-850b-2d63774aa22d'
// ARV-0010 UUID — a READY arc (not reserved)
const READY_ARC_ID = '16757ea9-2f68-4738-8604-885c2cce3575'

// ── Entry & Reservation Check ─────────────────────────────────

test('Checkout: non-existent arc_id returns 404', async ({ page }) => {
  await page.goto('/checkout/00000000-0000-0000-0000-000000000000')
  await expect(page).toHaveTitle(/404/)
})

test('Checkout: READY arc (not reserved) returns 404', async ({ page }) => {
  await page.goto(`/checkout/${READY_ARC_ID}`)
  await expect(page).toHaveTitle(/404/)
})

test('Confirmation: no payment_intent param returns 404', async ({ page }) => {
  await page.goto(`/checkout/${ARC_ID}/bestaetigung`)
  await expect(page).toHaveTitle(/404/)
})

test('Confirmation: fake payment_intent with redirect_status=succeeded returns 404', async ({ page }) => {
  await page.goto(`/checkout/${ARC_ID}/bestaetigung?payment_intent=pi_fake123&redirect_status=succeeded`)
  await expect(page).toHaveTitle(/404/)
})

// ── Checkout Page — Summary & Form ───────────────────────────

// Seed localStorage with a config so the checkout summary renders prices
async function seedConfig(page: import('@playwright/test').Page) {
  await page.goto(`/checkout/${ARC_ID}`)
  await page.evaluate((arcId) => {
    localStorage.setItem(`arc_config_${arcId}`, JSON.stringify({
      sandingChoice: 'schleifen',
      mounting: 'ohne',
      finish: 'oel',
      light: 'porzellan',
    }))
  }, ARC_ID)
  await page.reload()
}

test('Checkout: shows arc, config, and price breakdown for reserved arc', async ({ page }) => {
  await seedConfig(page)
  await expect(page.getByText('ARV-0005')).toBeVisible()
  await expect(page.getByText('Konfiguration')).toBeVisible()
  await expect(page.getByText('Preisaufschlüsselung')).toBeVisible()
  await expect(page.getByText('Jetzt fällig (30% Deposit)')).toBeVisible()
  await expect(page.getByText('Restbetrag (vor Versand)')).toBeVisible()
})

test('Checkout: shows required form fields with correct required/optional markers', async ({ page }) => {
  await page.goto(`/checkout/${ARC_ID}`)
  await expect(page.getByLabel('Vorname *')).toBeVisible()
  await expect(page.getByLabel('Nachname *')).toBeVisible()
  await expect(page.getByLabel('E-Mail *')).toBeVisible()
  await expect(page.getByLabel('Telefon')).toBeVisible()
  await expect(page.getByLabel('Straße & Hausnummer *')).toBeVisible()
  await expect(page.getByLabel('PLZ *')).toBeVisible()
  await expect(page.getByLabel('Stadt *')).toBeVisible()
})

test('Checkout: land select only offers DE, AT, CH', async ({ page }) => {
  await page.goto(`/checkout/${ARC_ID}`)
  await page.getByRole('combobox').click()
  await expect(page.getByRole('option', { name: 'Deutschland' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'Österreich' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'Schweiz' })).toBeVisible()
  await expect(page.getByRole('listbox').getByRole('option')).toHaveCount(3)
})

test('Checkout: selecting AT updates shipping price to 49 €', async ({ page }) => {
  await seedConfig(page)
  await expect(page.getByText('29 €')).toBeVisible()
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: 'Österreich' }).click()
  await expect(page.getByText('49 €')).toBeVisible()
})

test('Checkout: required field validation shown when submitting empty form', async ({ page }) => {
  await page.goto(`/checkout/${ARC_ID}`)
  await page.getByRole('button', { name: 'Weiter zur Zahlung' }).click()
  await expect(page.getByText('Pflichtfeld').first()).toBeVisible()
  await expect(page.getByText('Ungültige E-Mail-Adresse')).toBeVisible()
})

// Note: E2E test for invalid email validation is skipped because the contact form lacks
// `noValidate` — browser-native `type="email"` validation blocks the submit event before
// RHF/Zod fires. This is documented as Bug #6 (Low). Unit/Zod schema validation covers it.

test('Checkout: billing address form hidden by default, shown when checkbox unchecked', async ({ page }) => {
  await page.goto(`/checkout/${ARC_ID}`)
  await expect(page.getByRole('heading', { name: 'Rechnungsadresse' })).not.toBeVisible()
  await page.getByRole('checkbox', { name: 'Rechnungsadresse entspricht' }).click()
  await expect(page.getByRole('heading', { name: 'Rechnungsadresse' })).toBeVisible()
})

// ── API Route Input Validation ────────────────────────────────

test('API: rejects empty body with 400', async ({ request }) => {
  const res = await request.post('/api/checkout/create-payment-intent', {
    data: {},
  })
  expect(res.status()).toBe(400)
  const body = await res.json()
  expect(body.error).toBe('Ungültige Anfrage.')
})

test('API: rejects invalid country (US) with 400', async ({ request }) => {
  const res = await request.post('/api/checkout/create-payment-intent', {
    data: {
      arcId: ARC_ID,
      config: { sandingChoice: 'rohling', mounting: 'ohne', finish: null, light: 'porzellan' },
      contactData: {
        firstName: 'Max', lastName: 'Test', email: 'test@test.com',
        street: 'Str 1', zip: '12345', city: 'Berlin',
        country: 'US', sameAsBilling: true,
      },
    },
  })
  expect(res.status()).toBe(400)
})

test('API: rejects non-UUID arcId with 400', async ({ request }) => {
  const res = await request.post('/api/checkout/create-payment-intent', {
    data: {
      arcId: '../../../etc/passwd',
      config: { sandingChoice: 'rohling', mounting: 'ohne', finish: null, light: 'porzellan' },
      contactData: {
        firstName: 'Max', lastName: 'Test', email: 'test@test.com',
        street: 'Str 1', zip: '12345', city: 'Berlin',
        country: 'DE', sameAsBilling: true,
      },
    },
  })
  expect(res.status()).toBe(400)
})
