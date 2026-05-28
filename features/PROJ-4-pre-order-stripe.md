# PROJ-4: Pre-Order & Stripe

## Status: In Review

### Backend Implementation Notes
- API: `POST /api/checkout/create-payment-intent` — validates reservation, calculates prices server-side, creates customer + order records, creates Stripe PaymentIntent, returns `clientSecret`
- Confirmation page verifies Stripe PaymentIntent on load, updates order → CONFIRMED + arc → ORDERED (idempotent)
- DB migration 006 required: `sanding_price INTEGER DEFAULT 0` on `orders` table
- Required env vars: `STRIPE_SECRET_KEY` (server-only), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client)
**Created:** 2026-05-27
**Last Updated:** 2026-05-28

### Bug Fixes (2026-05-28)
- Bug #1: Customer upsert on email conflict — `route.ts` now uses `.upsert()` with `onConflict: 'email'`
- Bug #2: Billing country RHF state — added `billingCountry: 'DE'` to `defaultValues`, made Select controlled
- Bug #3: Customer email on confirmation — `bestaetigung/page.tsx` fetches customer by `order.customer_id`
- Bug #4: Per-country ZIP validation — `superRefine` added to API Zod schema
- Bug #7: Sanding choice in order confirmation — `order-confirmation.tsx` now shows Oberfläche
- Bug #8: `noValidate` on form — prevents browser native email validation from blocking RHF
- Bug #9: Safe `res.json()` — checks `res.ok` first, `.catch(() => ({}))` prevents silent failure

## Dependencies
- PROJ-1 (Datenbank-Schema & Supabase-Setup) — `orders`- und `customers`-Tabelle
- PROJ-3 (Konfigurator) — Reservierung setzt `reserved_by` (Session-ID) und leitet zu `/checkout/[arc_id]`
- PROJ-7 (E-Mail-System) — Bestätigungsmail nach Deposit-Zahlung (out of scope hier)

## User Stories

- Als Endkunde möchte ich nach der Reservierung meine Konfiguration und den Gesamtpreis nochmal sehen, bevor ich meine Daten eingebe.
- Als Endkunde möchte ich meine Kontakt- und Lieferdaten eingeben, damit mein Arc an die richtige Adresse geliefert werden kann.
- Als Endkunde möchte ich angeben können, ob meine Rechnungsadresse von der Lieferadresse abweicht.
- Als Endkunde möchte ich sicher mit Kreditkarte oder SEPA per Stripe zahlen, damit ich meinen Arc verbindlich bestellen kann.
- Als Endkunde möchte ich nach erfolgreicher Zahlung eine Bestätigung mit meiner Bestellnummer sehen.
- Als Endkunde möchte ich informiert werden, wenn meine Reservierung abgelaufen ist, damit ich weiß, dass ich neu reservieren muss.

## Out of Scope

- **70%-Restbetrag-Zahlung** — PROJ-5 (Admin-Backend); hier nur das 30%-Deposit
- **Bestätigungsmail** — PROJ-7 (E-Mail-System); Checkout zeigt nur den Hinweis, dass eine Mail kommt
- **Kundenkonto / Login** — kein Auth für Endkunden in v1; reiner Gast-Checkout
- **Stripe-Webhooks & asynchrone Zahlungsverarbeitung** — PROJ-5; hier nur synchroner Payment-Intent-Flow
- **Versandkosten-Kalkulator** — kein Gewichtsbasierter Preis; Fixbeträge pro Land (DE/AT/CH)
- **Internationale Lieferung** — nur DE, AT, CH in v1
- **Gutscheine / Rabattcodes** — nicht in v1
- **Mehrere Arcs in einem Checkout** — kein Warenkorb; immer genau ein Arc
- **Arc-Konfiguration im Checkout ändern** — zurück zum Konfigurator über separaten Link möglich; kein Inline-Edit

## Acceptance Criteria

### Einstieg & Reservierungsprüfung

- [ ] Angenommen ein Nutzer ruft `/checkout/[arc_id]` auf und die Reservierung (`reserved_until`) ist noch gültig, dann wird die Checkout-Seite angezeigt.
- [ ] Angenommen ein Nutzer ruft `/checkout/[arc_id]` auf und die Reservierung ist abgelaufen oder nicht vorhanden, dann wird er zurück zum Konfigurator (`/konfigurator/[arc_id]`) geleitet mit der Meldung "Deine Reservierung ist abgelaufen."
- [ ] Angenommen ein Arc hat einen anderen Status als `RESERVED`, wenn `/checkout/[arc_id]` aufgerufen wird, dann wird eine Fehlerseite angezeigt.

### Konfigurationsübersicht

- [ ] Angenommen die Checkout-Seite wird geladen, dann wird die gewählte Konfiguration (Schliff, Befestigung, Finish, Licht) angezeigt.
- [ ] Angenommen die Checkout-Seite wird geladen, dann wird die vollständige Preisaufschlüsselung (Grundpreis, Aufpreise, Versand, Gesamt) angezeigt.
- [ ] Angenommen die Checkout-Seite wird geladen, dann ist der Deposit-Betrag (30% des Gesamtpreises inkl. Versand) klar ausgewiesen.

### Kontaktdaten-Formular

- [ ] Angenommen der Nutzer füllt das Formular aus, dann sind Vorname, Nachname, E-Mail und Lieferadresse (Straße, PLZ, Stadt, Land) Pflichtfelder.
- [ ] Angenommen der Nutzer füllt das Formular aus, dann ist Telefon ein optionales Feld.
- [ ] Angenommen der Nutzer lässt ein Pflichtfeld leer und klickt auf "Weiter zur Zahlung", dann wird eine Validierungsfehlermeldung pro Feld angezeigt.
- [ ] Angenommen der Nutzer gibt eine ungültige E-Mail-Adresse ein, dann wird eine Fehlermeldung angezeigt.
- [ ] Angenommen das Feld "Land" wird angezeigt, dann sind nur DE, AT und CH als Optionen verfügbar.
- [ ] Angenommen der Nutzer wählt das Land, dann wird der entsprechende Versandpreis automatisch in der Preisübersicht aktualisiert (DE: 29 €, AT: 49 €, CH: 49 €).
- [ ] Angenommen die Checkbox "Rechnungsadresse entspricht Lieferadresse" ist angehakt (Standard), dann wird kein separates Rechnungsadress-Formular angezeigt.
- [ ] Angenommen der Nutzer deaktiviert die Checkbox "Rechnungsadresse entspricht Lieferadresse", dann erscheint ein zweites Formular für die Rechnungsadresse mit denselben Pflichtfeldern.

### Stripe-Zahlung

- [ ] Angenommen der Nutzer hat alle Pflichtfelder korrekt ausgefüllt, wenn er auf "Jetzt zahlen (30% Deposit)" klickt, dann wird das Stripe Payment Element angezeigt.
- [ ] Angenommen der Nutzer schließt die Stripe-Zahlung erfolgreich ab, dann wird der Arc-Status auf `ORDERED` gesetzt und ein `orders`-Datensatz sowie ein `customers`-Datensatz werden angelegt.
- [ ] Angenommen die Stripe-Zahlung schlägt fehl (z.B. Karte abgelehnt), dann bleibt der Nutzer auf der Checkout-Seite, sieht eine Fehlermeldung ("Zahlung fehlgeschlagen — bitte eine andere Zahlungsmethode versuchen"), und die Reservierung bleibt aktiv.
- [ ] Angenommen die Zahlung erfolgreich ist, dann wird der Nutzer zur Bestätigungsseite `/checkout/[arc_id]/bestaetigung` weitergeleitet.

### Bestätigungsseite

- [ ] Angenommen der Nutzer wird auf die Bestätigungsseite weitergeleitet, dann wird die Bestellnummer angezeigt.
- [ ] Angenommen die Bestätigungsseite angezeigt wird, dann sieht der Nutzer eine Zusammenfassung seiner Bestellung (Arc, Konfiguration, gezahlter Deposit-Betrag, ausstehender Restbetrag).
- [ ] Angenommen die Bestätigungsseite angezeigt wird, dann wird der Hinweis angezeigt: "Eine Bestätigungsmail wurde an [E-Mail] gesendet."
- [ ] Angenommen die Bestätigungsseite direkt ohne vorherigen Checkout aufgerufen wird (kein gültiger Order), dann wird eine 404-Seite angezeigt.

## Edge Cases

- **Reservierung läuft während des Ausfüllens des Formulars ab**: Beim Absenden des Formulars (vor Stripe-Aufruf) prüfen ob die Reservierung noch gültig ist — wenn nicht, Fehlermeldung anzeigen.
- **Dopple-Submit**: Button nach dem ersten Klick deaktivieren, um doppelte Stripe-Charges zu verhindern.
- **Session-ID stimmt nicht überein**: Wenn `reserved_by` (Session-ID des Arcs) nicht mit der Session-ID des aktuellen Browsers übereinstimmt, wird die Checkout-Seite trotzdem angezeigt (Session-IDs sind nicht geheim; ein gestohlener Arc-Link ist kein Sicherheitsproblem — wer zuerst zahlt, bestellt).
- **Netzwerkfehler nach Stripe-Zahlung**: Wenn die Weiterleitung zur Bestätigungsseite fehlschlägt (Netzwerk), aber der Charge erfolgreich war, muss der Webhook (PROJ-5) den Order-Status setzen — für PROJ-4 zeigt Stripe selbst einen Erfolgshinweis.
- **Stripe Payment Intent bleibt hängen**: Timeout nach 30 Sekunden, Fehlermeldung mit Aufforderung es erneut zu versuchen.
- **Ungültige PLZ für gewähltes Land**: Validierung beim Absenden prüft PLZ-Format je nach Land (DE: 5 Ziffern, AT: 4 Ziffern, CH: 4 Ziffern).

## Technical Requirements

- Stripe Payment Element (neueste Stripe.js Version) — keine eigene Kreditkarten-Maske
- Kein Kundenkonto / kein Auth erforderlich
- Preisberechnungen ausschließlich server-seitig — kein Client-Trust
- HTTPS erforderlich (Vercel enforced)

## Open Questions

- [x] Welche Stripe-Account-Währung? → EUR (2026-05-27)
- [x] Soll der Deposit exakt 30,00% sein oder auf den nächsten Cent gerundet werden? → Auf den nächsten Cent (2026-05-27)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Checkout-Flow: Zusammenfassung → Kontaktdaten → Stripe | Nutzer sieht alles vor dem Commit; klar strukturierter Kaufprozess | 2026-05-27 |
| Lieferadresse + optionale separate Rechnungsadresse | Checkbox-Standard: gleiche Adresse; Formular nur bei expliziter Abweichung | 2026-05-27 |
| Versandpreis als Fixbetrag je Land (DE: 29€, AT/CH: 49€) | Einfach für Prototyp; exakte Kalkulation im späteren Admin-Backend | 2026-05-27 |
| 70%-Restbetrag-Zahlung → PROJ-5 | Für MVP reicht das Deposit; Admin-Abwicklung des Rests separat | 2026-05-27 |
| Gast-Checkout ohne Login | Kein Kundenkonto in v1 laut PRD; reduziert Conversion-Hürde | 2026-05-27 |
| Abgelaufene Reservierung → zurück zum Konfigurator | Klarer Weg für Nutzer; Konfigurator erlaubt neue Reservierung | 2026-05-27 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Stripe Payment Element statt Custom Card Form | Offiziell von Stripe empfohlen; PCI-konform out-of-the-box; unterstützt Karte + SEPA + weitere Methoden | 2026-05-27 |
| PaymentIntent-Erstellung + DB-Einträge in einem API-Call | Atomare Verknüpfung: stripe_deposit_id wird sofort in der Order gespeichert; kein Daten-Verlust bei Redirect | 2026-05-27 |
| Bestätigungsseite als Server Component mit Stripe-Verifikation | Einfach für MVP; Stripe-Zahlung wird server-seitig verifiziert bevor Arc auf ORDERED gesetzt wird | 2026-05-27 |
| Stripe Webhook → PROJ-5 | Robustere Verarbeitung für Edge Cases (Netzwerkfehler nach Redirect); nicht kritisch für MVP | 2026-05-27 |
| Kein neues DB-Schema außer sanding_price in orders | Alle anderen Felder bereits in orders/customers vorhanden; minimale Migration | 2026-05-27 |
| Versandpreis als Konstante im Code (DE: 29€, AT/CH: 49€) | Einfachste Lösung für Prototyp; konfigurierbar über Admin-Backend in PROJ-5 | 2026-05-27 |
| Deposit = Math.round(total_cents × 0.30) | Auf den nächsten Cent gerundet; Währung EUR; Stripe erwartet Betrag in Cent | 2026-05-27 |

---

## Tech Design (Solution Architect)

### Seitenstruktur

```
/checkout/[arc_id]/                     (Server Component)
  — lädt Arc aus DB, prüft Reservierung
  — abgelaufen? → redirect /konfigurator/[arc_id]
  +-- CheckoutClient                    (Client Component)
      +-- CheckoutSummary
      |   +-- KonfigSummaryReadonly     (Wiederverwendung aus Konfigurator)
      |   +-- PreisAufschluesselung     (+ Versand + Deposit-Zeile)
      +-- ContactForm
      |   +-- Persönliche Daten         (Vorname, Nachname, E-Mail, Telefon)
      |   +-- Lieferadresse             (Straße, PLZ, Stadt, Land)
      |   +-- "Rechnungsadr. = Lieferadr." Checkbox
      |   +-- Rechnungsadresse          (optional, eingeblendet bei Checkbox off)
      +-- StripePaymentForm             (eingeblendet nach Formular-Submit)
          +-- Stripe Payment Element
          +-- "Jetzt zahlen (30% Deposit)" Button

/checkout/[arc_id]/bestaetigung/        (Server Component)
  — lädt Arc + Bestellung, verifiziert Stripe-Zahlung
  — ungültig/nicht gefunden? → 404
  — Zahlungsbestätigung anzeigen
```

### Datenfluss

```
[Nutzer füllt Formular aus]
        ↓
POST /api/checkout/create-payment-intent
  • Reservierung prüfen (server-seitig)
  • Gesamtpreis berechnen (Konfig + Versand)
  • Deposit = Math.round(Gesamt_in_Cent × 0,30)
  • Customer-Datensatz anlegen
  • Order-Datensatz anlegen (Status: PENDING_CONFIRMATION)
  • Arc.order_id setzen
  • Stripe PaymentIntent erstellen (Betrag in Cent, EUR)
  • Order.stripe_deposit_id = paymentIntent.id
  → gibt client_secret zurück

[Stripe Payment Element zeigt sich]
        ↓
[Nutzer zahlt → Stripe leitet weiter]
        ↓
/checkout/[arc_id]/bestaetigung?payment_intent=pi_xxx
  • Server verifiziert bei Stripe: payment_intent.status === "succeeded"
  • Order-Status → CONFIRMED, deposit_paid_at setzen
  • Arc-Status → ORDERED
  • Bestätigungsseite rendern
```

### Datenbank

Kein neues Schema nötig außer einer Erweiterung:

| Tabelle | Neue/genutzte Felder |
|---------|----------------------|
| `customers` | name, email, phone, address (JSON: Liefer- + ggf. Rechnungsadresse) |
| `orders` | config, base_price, mounting_price, finish_price, light_price, **sanding_price** (neu), shipping_price, total_price, deposit_amount, remaining_amount, stripe_deposit_id, customer_id, status |
| `arcs` | order_id (Verweis auf neue Bestellung), status → ORDERED |

**Migration 006:** `sanding_price INTEGER` zu `orders` hinzufügen.

### API-Route

| Route | Methode | Zweck |
|-------|---------|-------|
| `/api/checkout/create-payment-intent` | POST | Preisberechnung, DB-Einträge, Stripe PaymentIntent erstellen |

### Neue Pakete

| Paket | Zweck |
|-------|-------|
| `stripe` | Stripe Node.js SDK (server-seitig) |
| `@stripe/stripe-js` | Stripe.js (browser) |
| `@stripe/react-stripe-js` | React-Hooks für Stripe Elements |

### Umgebungsvariablen

| Variable | Scope | Zweck |
|----------|-------|-------|
| `STRIPE_SECRET_KEY` | Server only | PaymentIntent erstellen, Zahlung verifizieren |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | Stripe.js initialisieren |

## QA Test Results

**QA Date:** 2026-05-28  
**Tester:** /qa skill  
**Status: NOT READY FOR PRODUCTION — 2 High bugs must be fixed first**

### Acceptance Criteria Results

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Valid reservation → Checkout page shown | ✅ PASS |
| 2 | Expired/no reservation → redirect to Konfigurator with message | ✅ PASS (code verified, not E2E testable without DB manipulation) |
| 3 | Arc not RESERVED → 404 | ✅ PASS |
| 4 | Config shown (Schliff, Befestigung, Finish, Licht) | ✅ PASS |
| 5 | Price breakdown shown (Grundpreis, Versand, Gesamt) | ✅ PASS |
| 6 | Deposit (30%) clearly shown | ✅ PASS |
| 7 | Required fields validated (Vorname, Nachname, E-Mail, Adresse) | ✅ PASS |
| 8 | Telefon is optional | ✅ PASS |
| 9 | Empty required field → error per field | ✅ PASS |
| 10 | Invalid E-Mail → error shown | ⚠️ PARTIAL — Zod schema correct, but `<form>` lacks `noValidate` so browser native validation blocks RHF for empty-form submit (Bug #6) |
| 11 | Only DE/AT/CH in Land select | ✅ PASS |
| 12 | Country change updates shipping price (DE: 29€, AT/CH: 49€) | ✅ PASS |
| 13 | sameAsBilling checkbox default checked, billing form hidden | ✅ PASS |
| 14 | Unchecking sameAsBilling shows billing form | ✅ PASS |
| 15 | Stripe Payment Element shown after valid form submit | ❌ FAIL — Bug #1 (customer upsert) blocks payment in retry scenarios |
| 16 | Successful payment → arc ORDERED + order CONFIRMED | ⚠️ NOT TESTED — Stripe test payment not verified end-to-end |
| 17 | Failed payment → error shown, reservation stays active | ⚠️ NOT TESTED |
| 18 | Success → redirect to /bestaetigung | ⚠️ NOT TESTED |
| 19 | Confirmation: order number shown | ⚠️ NOT TESTED |
| 20 | Confirmation: order summary shown | ⚠️ NOT TESTED |
| 21 | Confirmation: "Bestätigungsmail an [E-Mail] gesendet" | ❌ FAIL — Bug #3: shows generic text, not actual customer email |
| 22 | Confirmation page without valid order → 404 | ✅ PASS |

### Bugs Found

#### High

**Bug #1: Customer INSERT fails for repeat email — checkout broken on retry**
- **Steps:** Submit checkout form with any previously used email address
- **Expected:** New customer created or existing customer reused
- **Actual:** 500 error "Kundendaten konnten nicht gespeichert werden" because `customers.email` is `UNIQUE NOT NULL`
- **Root cause:** `route.ts:81` uses `.insert()` — duplicate email causes a unique constraint violation
- **Fix:** Replace `.insert()` with Supabase upsert on conflict: `email`, then retrieve the customer ID; or `SELECT id FROM customers WHERE email = $1` first
- **File:** `src/app/api/checkout/create-payment-intent/route.ts:81`

**Bug #2: Billing country RHF state not initialized — billing form blocks submit**
- **Steps:** Uncheck "Rechnungsadresse entspricht Lieferadresse" → billing form appears with "Deutschland" pre-selected → submit without touching country dropdown
- **Expected:** Germany accepted as billing country
- **Actual:** Validation shows "Bitte wählen" because `billingCountry` is `undefined` in RHF state (shadcn Select uses `defaultValue` but doesn't call `setValue` on mount)
- **Fix:** Add `setValue('billingCountry', 'DE')` when the billing section mounts, or use `value={watch('billingCountry') ?? 'DE'}` and initialize with `defaultValues`
- **File:** `src/components/checkout/contact-form.tsx:172`

#### Medium

**Bug #3: Customer email not shown on confirmation page**
- **Steps:** Complete a checkout → view confirmation page
- **Expected:** "Eine Bestätigungsmail wurde an max@example.com gesendet."
- **Actual:** "Eine Bestätigungsmail wurde an deine E-Mail-Adresse gesendet." (no actual email)
- **Fix:** In `bestaetigung/page.tsx`, join `customers` by `order.customer_id` and pass email to `OrderConfirmation`
- **File:** `src/app/checkout/[arc_id]/bestaetigung/page.tsx` + `src/components/checkout/order-confirmation.tsx`

**Bug #4: Per-country ZIP validation not implemented**
- **Steps:** Select Austria as country, enter a 5-digit German ZIP (e.g. 10115) → form accepts it
- **Expected:** Error "Ungültige PLZ für Österreich (4 Ziffern)"
- **Actual:** Passes validation (regex `/^\d{4,5}$/` accepts both)
- **Spec edge case:** "DE: 5 Ziffern, AT: 4 Ziffern, CH: 4 Ziffern"
- **Fix:** Add per-country zip validation in `contactSchema` superRefine, and in API Zod schema
- **Files:** `src/components/checkout/contact-form.tsx:16`, `src/app/api/checkout/create-payment-intent/route.ts:22`

**Bug #5: No rate limiting on create-payment-intent API**
- **Steps:** Send rapid repeated POST requests to `/api/checkout/create-payment-intent`
- **Expected:** Rate limiting after N requests
- **Actual:** Each request creates a new customer + order + Stripe PaymentIntent (orphan records)
- **Fix:** Add IP-based rate limiting (e.g. via Next.js middleware or Vercel rate limiting)

**Bug #6 (was "Medium via vitest config"): vitest config picks up Playwright tests — `npm test` showed PROJ-2/PROJ-3 spec failures**  
- **Status:** ✅ FIXED — Added `include: ['src/**/*.{test,spec}.{ts,tsx}']` to `vitest.config.ts`

#### Low

**Bug #7: Sanding choice missing from order confirmation summary**
- The `OrderConfirmation` component shows Befestigung, Finish, Licht but not Schliff/Oberfläche
- **File:** `src/components/checkout/order-confirmation.tsx:37`

**Bug #8: `<form>` lacks `noValidate` — browser native email validation conflicts with RHF**
- Native HTML5 email validation on `type="email"` blocks form submit before RHF fires
- Causes inconsistent UX: empty email shows "Ungültige E-Mail-Adresse" (browser tooltip), not a React inline error
- **Fix:** Add `noValidate` to the `<form>` element
- **File:** `src/components/checkout/contact-form.tsx:68`

**Bug #9: `res.json()` called before `res.ok` check in checkout-client — silent failure on non-JSON 500 errors**
- If the API returns a 500 with a non-JSON body (e.g. unhandled Stripe error), `res.json()` throws and there is no catch block, so the user sees no error message
- **Fix:** Wrap `res.json()` in try/catch or check `res.ok` first before parsing JSON
- **File:** `src/components/checkout/checkout-client.tsx:46`

### Test Artifacts
- Unit tests: `src/lib/pricing.test.ts` (6 tests — all pass)
- E2E tests: `tests/PROJ-4-pre-order-stripe.spec.ts` (13 tests — all pass)
- Fixed regression: `vitest.config.ts` now has `include` pattern to exclude Playwright tests

## Deployment
_To be added by /deploy_
