# E2E-Tests (Playwright)

Die E2E-Tests laufen gegen eine **separate Test-Supabase** (nicht die Prod-DB).
`globalSetup` setzt diese DB vor jedem Lauf zurück (Reset + Seed aus
`tests/fixtures/seed.ts`).

## Einmaliges Setup

1. **Test-Supabase-Projekt anlegen** (Supabase Free Tier reicht).
2. **Schema + Migrationen einspielen** (Supabase SQL-Editor):
   - `db/schema.sql`
   - alle `db/migrations/*.sql` der Reihe nach
3. **`.env.test` anlegen** (gitignored) mit den Keys des **Test**-Projekts:

   ```bash
   # Test-Supabase (eigenes Projekt — NICHT Prod!)
   NEXT_PUBLIC_SUPABASE_URL=https://DEIN-TEST-PROJEKT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-test-anon-key
   SUPABASE_SERVICE_ROLE_KEY=dein-test-service-role-key

   # Sicherheits-Schalter: muss exakt "true" sein, sonst bricht globalSetup ab
   E2E_ALLOW_DB_RESET=true

   # Stripe (Testmodus) — aus .env.local uebernehmen (fuer die Checkout-Seite)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Ausführen

```bash
npm run test:e2e
```

Der Test-Dev-Server startet auf **Port 3100** (eigener Port, `reuseExistingServer: false`),
sodass ein parallel laufender Dev-Server auf Port 3000 (Prod-Keys) nie wiederverwendet wird.

## Sicherheit

- `globalSetup` führt den destruktiven Reset **nur** aus, wenn `E2E_ALLOW_DB_RESET=true`.
- `NODE_ENV=test` sorgt dafür, dass `@next/env` `.env.test` lädt und **nicht** `.env.local`.
- Niemals die Prod-Keys in `.env.test` eintragen.

## Fixtures

`tests/fixtures/seed.ts` ist die Single Source of Truth: 10 READY-Arcs
(`ARV-0001`..`ARV-0010`) mit festen UUIDs + 1 reservierter Arc (`ARV-0011`)
für die Checkout-Tests.
