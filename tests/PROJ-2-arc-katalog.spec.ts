import { test, expect } from '@playwright/test'

// ── Homepage (/): Hero & Navigation ──────────────────────────

test('Homepage: Hero section with headline and CTA is visible', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('EveryArc')
  await expect(page.getByRole('link', { name: 'Alle Arcs entdecken' })).toBeVisible()
})

test('Homepage: CTA "Alle Arcs entdecken" navigates to /arcs', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Alle Arcs entdecken' }).click()
  await expect(page).toHaveURL('/arcs')
})

test('Homepage: No highlight section when no featured arcs', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Ausgewählte Arcs')).not.toBeVisible()
})

// ── Browse (/arcs): Grid, Badge, Sort, Leerstand ─────────────

test('Browse: All READY arcs shown in grid with serial number, dimensions, price', async ({ page }) => {
  await page.goto('/arcs')
  await expect(page.getByRole('heading', { name: 'Alle Arcs' })).toBeVisible()
  const cards = page.getByRole('article')
  await expect(cards).toHaveCount(10)
  await expect(page.getByText('ARV-0001')).toBeVisible()
  await expect(page.getByText('320 €')).toBeVisible()
})

test('Browse: Drop badge shown on arcs belonging to SCHEDULED/LIVE drop', async ({ page }) => {
  await page.goto('/arcs')
  const badges = page.getByText('DROP #01 — DIE ERSTEN BÖGEN')
  await expect(badges.first()).toBeVisible()
})

test('Browse: Sort "Preis aufsteigend" shows cheapest arc first', async ({ page }) => {
  await page.goto('/arcs?sort=price_asc')
  const links = page.getByRole('link').filter({ hasText: /ARV/ })
  const firstHref = await links.first().getAttribute('href')
  expect(firstHref).toContain('ARV-0006')
})

test('Browse: Sort "Preis absteigend" shows most expensive arc first', async ({ page }) => {
  await page.goto('/arcs?sort=price_desc')
  const links = page.getByRole('link').filter({ hasText: /ARV/ })
  const firstHref = await links.first().getAttribute('href')
  expect(firstHref).toContain('ARV-0008')
})

test('Browse: Clicking arc card navigates to detail page', async ({ page }) => {
  await page.goto('/arcs')
  await page.getByRole('link').filter({ hasText: /ARV-0006/ }).first().click()
  await expect(page).toHaveURL('/arcs/ARV-0006')
})

// ── Detail (/arcs/[serial_number]) ───────────────────────────

test('Detail: Shows all required fields for a READY arc', async ({ page }) => {
  await page.goto('/arcs/ARV-0001')
  await expect(page.getByText('ARV-0001')).toBeVisible()
  await expect(page.getByText('480 €')).toBeVisible()
  await expect(page.getByText(/Weit geschwungener Bogen/)).toBeVisible()
  await expect(page.getByText('78.5 cm')).toBeVisible()
  await expect(page.getByText('42 cm')).toBeVisible()
  await expect(page.getByText('1.8 kg')).toBeVisible()
  await expect(page.getByText('Monchique Sektor 3')).toBeVisible()
  await expect(page.getByText('12. Februar 2026')).toBeVisible()
})

test('Detail: Drop badge shown for arc in SCHEDULED drop', async ({ page }) => {
  await page.goto('/arcs/ARV-0001')
  await expect(page.getByText('DROP #01 — DIE ERSTEN BÖGEN')).toBeVisible()
})

test('Detail: No drop badge for arc not in a drop', async ({ page }) => {
  await page.goto('/arcs/ARV-0004')
  await expect(page.getByText(/DROP/)).not.toBeVisible()
})

test('Detail: Placeholder shown when arc has no photo', async ({ page }) => {
  await page.goto('/arcs/ARV-0001')
  await expect(page.getByText(/Kein Foto/i)).toBeVisible()
})

test('Detail: CTA "Arc konfigurieren" links to /konfigurator/[id]', async ({ page }) => {
  await page.goto('/arcs/ARV-0001')
  const href = await page.getByRole('link', { name: 'Arc konfigurieren' }).getAttribute('href')
  expect(href).toMatch(/^\/konfigurator\/[0-9a-f-]+$/)
})

test('Detail: Unknown serial number returns 404', async ({ page }) => {
  await page.goto('/arcs/ARV-UNBEKANNT-9999')
  await expect(page).toHaveTitle(/404/)
})

// ── Navigation ────────────────────────────────────────────────

test('Navigation: Logo click navigates to homepage', async ({ page }) => {
  await page.goto('/arcs')
  await page.getByRole('link', { name: 'ARC-ONE' }).click()
  await expect(page).toHaveURL('/')
})

test('Navigation: "Arcs" link navigates to /arcs', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Arcs', exact: true }).click()
  await expect(page).toHaveURL('/arcs')
})

// ── Security ─────────────────────────────────────────────────

test('Security: Public pages load without authentication', async ({ page }) => {
  await page.goto('/')
  await expect(page).not.toHaveURL(/login/)
  await page.goto('/arcs')
  await expect(page).not.toHaveURL(/login/)
  await page.goto('/arcs/ARV-0001')
  await expect(page).not.toHaveURL(/login/)
})
