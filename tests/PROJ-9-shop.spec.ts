import { test, expect, type Page } from '@playwright/test'
import { ARC, PRODUCT } from './fixtures/seed'
import { deleteOrder } from './fixtures/db'

// PROJ-9 Shop — Storefront (Browse/Detail/Cart), Checkout-/Anfrage-Endpunkte,
// FIXED-Arc-Trennung Shop ↔ Katalog. Stripe-Zahlung selbst wird (wie PROJ-4)
// nicht durch das Card-iframe getrieben; der Checkout-Endpunkt wird direkt
// gegen Stripe-Test-Mode geprüft (Order/Hold/Positionen + PaymentIntent).

const CONTACT = {
  firstName: 'Mara',
  lastName: 'Shop',
  email: 'qa-shop@arc-one.test',
  street: 'Waldweg 7',
  zip: '10115',
  city: 'Berlin',
  country: 'DE',
}

/** Legt einen Warenkorb (localStorage) auf der Origin an. */
async function seedCart(page: Page, refs: { source: 'product' | 'arc'; code: string }[]) {
  await page.goto('/shop')
  await page.evaluate((r) => localStorage.setItem('arc-one-cart', JSON.stringify(r)), refs)
}

// ── Shop-Browse (/shop) ───────────────────────────────────────

test('Browse: union of products and FIXED arcs is shown', async ({ page }) => {
  await page.goto('/shop')
  await expect(page.getByText('Tischleuchte Eukalyptus')).toBeVisible()
  await expect(page.getByText(`Arc ${ARC.FIXED.serial_number}`)).toBeVisible()
})

test('Browse: category filter narrows to the chosen category', async ({ page }) => {
  await page.goto('/shop?kategorie=schalen_accessoires')
  await expect(page.getByText('Schale Wurzelholz')).toBeVisible()
  await expect(page.getByText('Tischleuchte Eukalyptus')).not.toBeVisible()
  await expect(page.getByText('Beistelltisch Olive')).not.toBeVisible()
})

test('Browse: premium tier shows a Premium/Art badge', async ({ page }) => {
  await page.goto('/shop')
  await expect(page.getByText('Premium / Art').first()).toBeVisible()
})

test('Browse: direct-buy product shows its fixed price', async ({ page }) => {
  await page.goto('/shop')
  await expect(page.getByText('120 €')).toBeVisible()
})

test('Browse: inquiry product shows "Preis auf Anfrage" instead of a price', async ({ page }) => {
  await page.goto('/shop')
  await expect(page.getByText('Preis auf Anfrage').first()).toBeVisible()
})

test('Browse: sold product stays visible with a Verkauft badge', async ({ page }) => {
  await page.goto('/shop')
  await expect(page.getByText('Beistelltisch Olive')).toBeVisible()
  await expect(page.getByText('Verkauft').first()).toBeVisible()
})

test('Browse: hidden and archived products are not shown', async ({ page }) => {
  await page.goto('/shop')
  await expect(page.getByText('Versteckte Leuchte')).not.toBeVisible()
  await expect(page.getByText('Archivierte Schale')).not.toBeVisible()
})

// ── Produktdetail (/shop/[code]) ──────────────────────────────

test('Detail: direct product shows price and an add-to-cart CTA', async ({ page }) => {
  await page.goto(`/shop/${PRODUCT.DIRECT.product_code}`)
  await expect(page.getByRole('heading', { name: 'Tischleuchte Eukalyptus' })).toBeVisible()
  await expect(page.getByText('120 €')).toBeVisible()
  await expect(page.getByRole('button', { name: 'In den Warenkorb' })).toBeVisible()
})

test('Detail: FIXED arc renders its own detail page in the shop', async ({ page }) => {
  await page.goto(`/shop/${ARC.FIXED.serial_number}`)
  await expect(page.getByRole('heading', { name: `Arc ${ARC.FIXED.serial_number}` })).toBeVisible()
  await expect(page.getByText('900 €')).toBeVisible()
  await expect(page.getByRole('button', { name: 'In den Warenkorb' })).toBeVisible()
})

test('Detail: inquiry product shows "Anfrage senden" and no add-to-cart', async ({ page }) => {
  await page.goto(`/shop/${PRODUCT.INQUIRY.product_code}`)
  await expect(page.getByText('Preis auf Anfrage')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Anfrage senden' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'In den Warenkorb' })).not.toBeVisible()
})

test('Detail: sold product disables the CTA and shows Verkauft', async ({ page }) => {
  await page.goto(`/shop/${PRODUCT.SOLD.product_code}`)
  await expect(page.getByRole('button', { name: 'Verkauft' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'In den Warenkorb' })).not.toBeVisible()
})

test('Detail: unknown code returns 404', async ({ page }) => {
  await page.goto('/shop/P-NOPE9')
  await expect(page).toHaveTitle(/404/)
})

test('Detail: inquiry dialog opens with the message field', async ({ page }) => {
  await page.goto(`/shop/${PRODUCT.INQUIRY.product_code}`)
  await page.getByRole('button', { name: 'Anfrage senden' }).click()
  await expect(page.getByLabel('Nachricht *')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Anfrage absenden' })).toBeVisible()
})

// ── FIXED-Arc: Shop ↔ Katalog/Konfigurator getrennt ──────────

test('FIXED arc is excluded from the arc catalog', async ({ page }) => {
  await page.goto('/arcs')
  await expect(page.getByText(ARC.ARV_0001.serial_number)).toBeVisible()
  await expect(page.getByText(ARC.FIXED.serial_number)).not.toBeVisible()
})

test('FIXED arc detail under /arcs returns 404 (it lives in the shop)', async ({ page }) => {
  await page.goto(`/arcs/${ARC.FIXED.serial_number}`)
  await expect(page).toHaveTitle(/404/)
})

// ── Warenkorb (/warenkorb) ────────────────────────────────────

test('Cart: empty cart shows empty state with a link back to the shop', async ({ page }) => {
  await page.goto('/warenkorb')
  await expect(page.getByText('Ihr Warenkorb ist leer.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Zurück in den Shop' })).toBeVisible()
})

test('Cart: adding an item updates the header indicator and lists it once', async ({ page }) => {
  await page.goto(`/shop/${PRODUCT.DIRECT.product_code}`)
  await page.getByRole('button', { name: 'In den Warenkorb' }).click()
  // Header-Indikator zeigt 1; CTA wechselt zu "Im Warenkorb" (kein Doppel-Add → Menge 1)
  await expect(page.getByLabel('Warenkorb (1)')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Im Warenkorb · zur Kasse' })).toBeVisible()
  await page.goto('/warenkorb')
  await expect(page.getByText('Tischleuchte Eukalyptus')).toHaveCount(1)
})

test('Cart: shows item price, combined shipping and total (DE)', async ({ page }) => {
  await seedCart(page, [{ source: 'product', code: PRODUCT.DIRECT.product_code }])
  await page.goto('/warenkorb')
  await expect(page.getByText('Tischleuchte Eukalyptus')).toBeVisible()
  await expect(page.getByText('29 €')).toBeVisible() // DE-Landpauschale
  await expect(page.getByText('149 €')).toBeVisible() // 120 € + 29 € Versand
})

test('Cart: removing an item empties the cart', async ({ page }) => {
  await seedCart(page, [{ source: 'product', code: PRODUCT.DIRECT.product_code }])
  await page.goto('/warenkorb')
  await page.getByRole('button', { name: 'Entfernen' }).click()
  await expect(page.getByText('Ihr Warenkorb ist leer.')).toBeVisible()
})

test('Cart: a meanwhile-sold item is marked unavailable and excluded', async ({ page }) => {
  await seedCart(page, [
    { source: 'product', code: PRODUCT.DIRECT.product_code },
    { source: 'product', code: PRODUCT.SOLD.product_code },
  ])
  await page.goto('/warenkorb')
  await expect(page.getByText('Nicht mehr verfügbar')).toBeVisible()
  // Gesamt = nur das verfügbare Stück (120 €) + Versand 29 € = 149 €
  await expect(page.getByText('149 €')).toBeVisible()
})

// ── Checkout (Formular + Übersicht) ──────────────────────────

test('Checkout: shows contact form and order summary for the cart', async ({ page }) => {
  await seedCart(page, [{ source: 'product', code: PRODUCT.DIRECT.product_code }])
  await page.goto('/shop/checkout')
  await expect(page.getByText('Tischleuchte Eukalyptus')).toBeVisible()
  await expect(page.getByText('120 €').first()).toBeVisible()
  await expect(page.getByText('149 €')).toBeVisible() // Gesamt (120 € + 29 € Versand)
  await expect(page.getByLabel('Vorname *')).toBeVisible()
  await expect(page.getByLabel('E-Mail *')).toBeVisible()
})

// ── Cart-Resolve-Endpunkt (serverseitige Preise/Versand) ─────

test('API resolve: direct product returns subtotal + DE flat shipping', async ({ request }) => {
  const res = await request.post('/api/shop/cart/resolve', {
    data: { refs: [{ source: 'product', code: PRODUCT.DIRECT.product_code }], country: 'DE' },
  })
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.subtotal).toBe(12000) // P-DIR001 = 120 €
  expect(body.shipping).toBe(2900)
  expect(body.total).toBe(14900)
  expect(body.items[0].available).toBe(true)
})

test('API resolve: product with shipping override adds it on top of the flat rate', async ({ request }) => {
  const res = await request.post('/api/shop/cart/resolve', {
    data: { refs: [{ source: 'product', code: PRODUCT.OVERRIDE.product_code }], country: 'DE' },
  })
  const body = await res.json()
  expect(body.subtotal).toBe(8000)
  expect(body.shipping).toBe(2900 + 15000) // Landpauschale + Override
  expect(body.total).toBe(25900)
})

test('API resolve: a FIXED arc resolves with its base price', async ({ request }) => {
  const res = await request.post('/api/shop/cart/resolve', {
    data: { refs: [{ source: 'arc', code: ARC.FIXED.serial_number }], country: 'DE' },
  })
  const body = await res.json()
  expect(body.subtotal).toBe(90000)
  expect(body.total).toBe(92900)
})

test('API resolve: sold product is returned as unavailable and excluded from totals', async ({ request }) => {
  const res = await request.post('/api/shop/cart/resolve', {
    data: { refs: [{ source: 'product', code: PRODUCT.SOLD.product_code }], country: 'DE' },
  })
  const body = await res.json()
  expect(body.items[0].available).toBe(false)
  expect(body.subtotal).toBe(0)
  expect(body.shipping).toBe(0)
})

test('API resolve: hidden and archived refs are dropped', async ({ request }) => {
  const res = await request.post('/api/shop/cart/resolve', {
    data: {
      refs: [
        { source: 'product', code: PRODUCT.HIDDEN.product_code },
        { source: 'product', code: PRODUCT.ARCHIVED.product_code },
      ],
      country: 'DE',
    },
  })
  const body = await res.json()
  expect(body.items).toHaveLength(0)
})

// ── Checkout-Endpunkt (Order/Hold/Positionen + PaymentIntent) ─

test('API checkout: creates order + PaymentIntent, drops the sold item, charges the rest', async ({ request }) => {
  // Teilverfügbarer Warenkorb: P-SOLD01 (verkauft) + P-CHK01 (verfügbar).
  const res = await request.post('/api/shop/checkout', {
    data: {
      refs: [
        { source: 'product', code: PRODUCT.SOLD.product_code },
        { source: 'product', code: PRODUCT.CHK1.product_code },
      ],
      contactData: CONTACT,
    },
  })
  expect(res.status()).toBe(200)
  const body = await res.json()
  // Live Stripe-Test-Mode PaymentIntent
  expect(typeof body.clientSecret).toBe('string')
  expect(body.clientSecret).toContain('_secret_')
  expect(body.orderId).toBeTruthy()
  // Verkauftes Stück entfernt, nur das verfügbare wird belastet
  expect(body.removed.map((r: { code: string }) => r.code)).toContain(PRODUCT.SOLD.product_code)
  expect(body.items).toHaveLength(1)
  expect(body.total).toBe(20000 + 2900) // P-CHK01 (200 €) + DE-Versand

  // Aufräumen: die erzeugte Order wieder entfernen, damit der geteilte
  // orders-Bestand (PROJ-5 Leerzustand-Test) nicht verschmutzt wird.
  await deleteOrder(body.orderId)
})

test('API checkout: all-sold cart is rejected with 409 (no order created)', async ({ request }) => {
  const res = await request.post('/api/shop/checkout', {
    data: { refs: [{ source: 'product', code: PRODUCT.SOLD.product_code }], contactData: CONTACT },
  })
  expect(res.status()).toBe(409)
  const body = await res.json()
  expect(body.removed.map((r: { code: string }) => r.code)).toContain(PRODUCT.SOLD.product_code)
})

test('API checkout: empty body is rejected with 400', async ({ request }) => {
  const res = await request.post('/api/shop/checkout', { data: { refs: [] } })
  expect(res.status()).toBe(400)
})

test('API checkout: invalid country (US) is rejected with 400', async ({ request }) => {
  const res = await request.post('/api/shop/checkout', {
    data: {
      refs: [{ source: 'product', code: PRODUCT.CHK1.product_code }],
      contactData: { ...CONTACT, country: 'US' },
    },
  })
  expect(res.status()).toBe(400)
})

test('API confirm: fake payment intent returns 409', async ({ request }) => {
  const res = await request.post('/api/shop/checkout/confirm', {
    data: { paymentIntentId: 'pi_fake_proj9' },
  })
  expect(res.status()).toBe(409)
})

// ── Anfrage-Endpunkt (/api/shop/inquiries) ────────────────────
// Rate-Limit 5/10 min pro IP. Jeder Test sendet ein eigenes x-forwarded-for,
// damit er einen eigenen Bucket bekommt (kein Übergreifen über Tests/Projekte).

test('API inquiry: valid inquiry for an inquiry product succeeds', async ({ request }) => {
  const res = await request.post('/api/shop/inquiries', {
    headers: { 'x-forwarded-for': '198.51.100.10' },
    data: {
      productCode: PRODUCT.INQUIRY.product_code,
      name: 'Interessent',
      email: 'interessent@arc-one.test',
      message: 'Ich interessiere mich für dieses Einzelstück.',
    },
  })
  expect(res.status()).toBe(200)
  expect((await res.json()).success).toBe(true)
})

test('API inquiry: a direct-buy product is not inquiry-eligible (409)', async ({ request }) => {
  const res = await request.post('/api/shop/inquiries', {
    headers: { 'x-forwarded-for': '198.51.100.11' },
    data: { productCode: PRODUCT.DIRECT.product_code, name: 'X', email: 'x@arc-one.test', message: 'Hallo' },
  })
  expect(res.status()).toBe(409)
})

test('API inquiry: a hidden product returns 404 (SHOP-L1)', async ({ request }) => {
  const res = await request.post('/api/shop/inquiries', {
    headers: { 'x-forwarded-for': '198.51.100.12' },
    data: { productCode: PRODUCT.HIDDEN.product_code, name: 'X', email: 'x@arc-one.test', message: 'Hallo' },
  })
  expect(res.status()).toBe(404)
})

test('API inquiry: invalid email is rejected with 400', async ({ request }) => {
  const res = await request.post('/api/shop/inquiries', {
    headers: { 'x-forwarded-for': '198.51.100.13' },
    data: { productCode: PRODUCT.INQUIRY.product_code, name: 'X', email: 'not-an-email', message: 'Hallo' },
  })
  expect(res.status()).toBe(400)
})
