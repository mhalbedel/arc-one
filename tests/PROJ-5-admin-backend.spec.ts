import { test, expect, type Page } from '@playwright/test'
import { ADMIN, ARC } from './fixtures/seed'
import { clearOrders } from './fixtures/db'

// next dev kompiliert Admin-Routen beim ersten Aufruf (langsam) → groesseres Limit.
test.setTimeout(60_000)

/**
 * E2E fuer PROJ-5 Admin-Backend. Der Test-Admin wird von global-setup geseedet
 * (auth.users mit app_metadata.role='admin' + admin_profiles-Zeile).
 *
 * Hinweis zu Locators: Die Admin-Formulare verbinden <Label> nicht via htmlFor
 * mit ihren Inputs (Accessibility-Befund im QA-Report). Felder werden daher
 * strukturell (Label-Geschwister) bzw. ueber Placeholder lokalisiert.
 */

async function login(page: Page) {
  await page.goto('/admin/login')
  await page.locator('#email').fill(ADMIN.email)
  await page.locator('#password').fill(ADMIN.password)
  await page.getByRole('button', { name: 'Anmelden' }).click()
  try {
    await page.waitForURL('**/admin', { timeout: 15_000 })
  } catch {
    // WebKit auf localhost-http: der Redirect nach signInWithPassword kommt
    // gelegentlich nicht an → erneut ausloesen.
    await page.getByRole('button', { name: 'Anmelden' }).click().catch(() => {})
    await page.waitForURL('**/admin', { timeout: 15_000 })
  }
}

/** Input neben einem Label-Text im Arc-Formular (Field = div mit Label + Input). */
function arcField(page: Page, labelText: string) {
  return page
    .locator('div.space-y-1\\.5', { has: page.getByText(labelText, { exact: true }) })
    .getByRole('spinbutton')
}

async function fillRequiredArc(page: Page, serial: string) {
  await page.getByPlaceholder('z.B. ARC-001').fill(serial)
  await arcField(page, 'Basispreis (EUR) *').fill('500')
  await arcField(page, 'Breite (cm) *').fill('80')
  await arcField(page, 'Hoehe (cm) *').fill('45')
  await arcField(page, 'Tiefe (cm) *').fill('22')
  await arcField(page, 'Gewicht (g) *').fill('2000')
}

const uniqueSerial = () => `QA-${Date.now()}-${Math.floor(Math.random() * 10000)}`

// ── Authentifizierung & Zugriff ──────────────────────────────

test('unauthenticated visit to /admin redirects to login', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login/)
})

test('unauthenticated visit to a subpage redirects to login', async ({ page }) => {
  await page.goto('/admin/arcs')
  await expect(page).toHaveURL(/\/admin\/login/)
  await expect(page.getByText('Anmeldung fuer das Manufaktur-Team')).toBeVisible()
})

test('wrong credentials show an error and grant no access', async ({ page }) => {
  await page.goto('/admin/login')
  await page.locator('#email').fill('nobody@arc-one.test')
  await page.locator('#password').fill('falsch-falsch')
  await page.getByRole('button', { name: 'Anmelden' }).click()
  await expect(page.getByText('E-Mail oder Passwort ist falsch.')).toBeVisible()
  await expect(page).toHaveURL(/\/admin\/login/)
})

test('denied query param shows no-access message', async ({ page }) => {
  await page.goto('/admin/login?denied=1')
  await expect(page.getByText('Dieses Konto hat keinen Admin-Zugriff.')).toBeVisible()
})

test('homepage exposes no public link to /admin', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('a[href^="/admin"]')).toHaveCount(0)
})

test('correct credentials reach the dashboard', async ({ page }) => {
  await login(page)
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})

test('admin can sign out and lands on the login page', async ({ page }) => {
  await login(page)
  const logout = page.getByRole('button', { name: 'Abmelden' })
  if (!(await logout.isVisible())) {
    await page.getByRole('button', { name: /toggle sidebar/i }).click()
  }
  await logout.click()
  await expect(page).toHaveURL(/\/admin\/login/)
})

// ── Dashboard ────────────────────────────────────────────────

test('dashboard shows navigation tiles and count cards', async ({ page }) => {
  await login(page)
  await expect(page.getByText('READY-Arcs')).toBeVisible()
  await expect(page.getByText('Offene Bestellungen')).toBeVisible()
  await expect(page.getByText('Arcs verwalten')).toBeVisible()
  await expect(page.getByText('Aufpreise und Klassen-Grenzwerte pflegen')).toBeVisible()
})

// ── Arc-Verwaltung ───────────────────────────────────────────

test('arc list shows seeded arcs with serial and status', async ({ page }) => {
  await login(page)
  await page.goto('/admin/arcs')
  await expect(page.getByRole('link', { name: ARC.ARV_0001.serial_number })).toBeVisible()
  await expect(page.getByRole('link', { name: ARC.RESERVED.serial_number })).toBeVisible()
})

test('creating an arc with all required fields adds it to the list', async ({ page }) => {
  await login(page)
  await page.goto('/admin/arcs/neu')
  const serial = uniqueSerial()
  await fillRequiredArc(page, serial)
  await page.getByRole('button', { name: 'Arc anlegen' }).click()
  await page.waitForURL('**/admin/arcs')
  await expect(page.getByRole('link', { name: serial })).toBeVisible()
})

test('missing required field blocks save and shows validation messages', async ({ page }) => {
  await login(page)
  await page.goto('/admin/arcs/neu')
  await page.getByRole('button', { name: 'Arc anlegen' }).click()
  await expect(page.getByText('Seriennummer ist erforderlich.')).toBeVisible()
  await expect(page).toHaveURL(/\/admin\/arcs\/neu/)
})

test('duplicate serial number is rejected with a clear error', async ({ page }) => {
  await login(page)
  await page.goto('/admin/arcs/neu')
  await fillRequiredArc(page, ARC.ARV_0001.serial_number)
  await page.getByRole('button', { name: 'Arc anlegen' }).click()
  // Meldung erscheint inline UND als Toast → erstes Vorkommen genuegt
  await expect(page.getByText('Diese Seriennummer existiert bereits.').first()).toBeVisible()
})

test('a READY arc becomes visible in the public catalog', async ({ page }) => {
  await login(page)
  await page.goto('/admin/arcs/neu')
  const serial = uniqueSerial()
  await fillRequiredArc(page, serial)
  // Status-Default ist RAW → auf READY setzen
  await page.locator('div.space-y-1\\.5', { has: page.getByText('Status', { exact: true }) })
    .getByRole('combobox')
    .click()
  await page.getByRole('option', { name: 'READY' }).click()
  await page.getByRole('button', { name: 'Arc anlegen' }).click()
  await page.waitForURL('**/admin/arcs')

  const res = await page.goto(`/arcs/${serial}`)
  expect(res?.status()).toBe(200)
})

// ── Bestellverwaltung ────────────────────────────────────────

test('orders list shows an empty state when there are no orders', async ({ page }) => {
  // Precondition-Isolation: andere Specs (PROJ-9 Shop-Checkout) können parallel
  // Orders anlegen. Direkt vor der Navigation auf 0 Orders stellen (kleines Fenster).
  await login(page)
  await clearOrders()
  await page.goto('/admin/bestellungen')
  await expect(page.getByText('Noch keine Bestellungen eingegangen.')).toBeVisible()
})

// ── Preismatrix-Pflege ───────────────────────────────────────

test('pricing matrix loads all surcharge groups and bounds', async ({ page }) => {
  await login(page)
  await page.goto('/admin/preismatrix')
  await expect(page.getByText('Schliff (nach Größe)')).toBeVisible()
  await expect(page.getByText('Finish (nach Größe)')).toBeVisible()
  await expect(page.getByText('Befestigung (nach Gewicht)')).toBeVisible()
  await expect(page.getByText('Klassen-Grenzwerte')).toBeVisible()
})

test('inconsistent size bounds are rejected on save', async ({ page }) => {
  await login(page)
  await page.goto('/admin/preismatrix')
  const klein = page.locator('div.space-y-1\\.5', { has: page.getByText('Klein bis max. (cm²)', { exact: true }) }).getByRole('spinbutton')
  const mittel = page.locator('div.space-y-1\\.5', { has: page.getByText('Mittel bis max. (cm²)', { exact: true }) }).getByRole('spinbutton')
  await klein.fill('9000')
  await mittel.fill('6000')
  await page.getByRole('button', { name: 'Preismatrix speichern' }).click()
  await expect(page.getByText('klein-max muss kleiner als mittel-max sein.').first()).toBeVisible()
})
