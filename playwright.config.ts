import { defineConfig, devices } from '@playwright/test'
import { loadEnvConfig } from '@next/env'

// E2E laeuft gegen die SEPARATE Test-Supabase. Mit NODE_ENV=test laedt @next/env
// .env.test (und NICHT .env.local) — dadurch sind die Prod-Keys ausgeschlossen.
;(process.env as Record<string, string>).NODE_ENV = 'test'
loadEnvConfig(process.cwd())

const PORT = 3100

// Env-Vars fuer den Dev-Server (Kindprozess). Explizit gesetzt, damit sie
// Vorrang vor evtl. vorhandenen .env.local-Werten haben.
const serverEnv = {
  NODE_ENV: 'development',
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? '',
}

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: serverEnv,
  },
})
