# PROJ-15: Coming-Soon-PIN-Tor (nur auf Vercel)

## Status: In Progress
**Created:** 2026-06-16
**Last Updated:** 2026-06-16

## Übersicht
Die Seite ist auf Vercel öffentlich erreichbar, hat aber noch keine echten Daten und ist
rechtlich nicht abgesichert. PROJ-15 verbirgt die Seite **nur auf Vercel** hinter einer
Coming-Soon-Seite (ARC-ONE-Logo + Untertitel „Exklusive Eukalyptus-Lichtarchitektur &
Unikat-Manufaktur" + „Coming soon"). Ein Klick auf das Logo öffnet eine 6-stellige
PIN-Eingabe; der korrekte PIN schaltet die echte Seite frei (Cookie). **Lokal** (dev)
bleibt die Seite voll offen zum Testen/Verifizieren.

## Aktivierung
- Tor aktiv, wenn `process.env.VERCEL` gesetzt ist (alle Vercel-Deploys, Preview + Prod)
  und nicht per Kill-Switch deaktiviert.
- Lokal ist `VERCEL` nicht gesetzt → Tor aus.
- Öffentlicher Launch später: `ARC_GATE_ENABLED=false` in Vercel + redeploy (kein Code).

## Entscheidungen
- **/admin bleibt ohne PIN erreichbar** (nur Supabase-Login) — auf Wunsch des Betreibers.
- **Cookie-Token statt PIN im Cookie:** der Cookie hält ein zufälliges Token
  (`ARC_GATE_TOKEN`), nie den PIN. Der PIN erreicht den Client nie (nur serverseitiger
  Vergleich). Token rotieren = alle aussperren, ohne PIN-Wechsel.
- **Rewrite statt Redirect:** URL bleibt erhalten; Deep-Links zeigen das Tor bis zum
  Freischalten.
- **Kein `input-otp`:** bestehendes shadcn `Input` (numerisch, 6 Stellen, Auto-Submit)
  genügt — keine neue Dependency.
- **Rate-Limit nur in der Node-API** (`/api/gate`), nicht im Edge-Proxy (kein geteilter
  Speicher dort). Reuse `src/lib/rate-limit.ts` (5 Versuche / IP / 10 min).

## Env-Variablen (vom Betreiber in Vercel zu setzen, Scope Production + Preview)
| Var | Secret | Zweck |
|-----|--------|-------|
| `ARC_GATE_PIN` | ja | 6-stelliger PIN, nur serverseitiger Vergleich (nie `NEXT_PUBLIC_`). |
| `ARC_GATE_TOKEN` | ja | Zufälliger Cookie-Wert; der Proxy vergleicht dagegen. |
| `ARC_GATE_ENABLED` | nein | Kill-Switch. Unset/`true` = Tor an (auf Vercel); `false` = offen. |

`process.env.VERCEL` wird von Vercel automatisch gesetzt. Lokal ist nichts nötig.

## Acceptance Criteria
- [ ] Angenommen die App läuft auf Vercel (gesetztes `VERCEL`), wenn ein nicht
      freigeschalteter Besucher eine beliebige Seite (außer Allowlist) öffnet, dann sieht
      er die Coming-Soon-Seite und die URL bleibt erhalten (Rewrite).
- [ ] Angenommen die App läuft lokal, wenn eine Seite geöffnet wird, dann erscheint kein
      Tor und die Seite verhält sich wie bisher.
- [ ] Angenommen der Besucher gibt den korrekten 6-stelligen PIN ein, dann wird ein
      httpOnly-Cookie gesetzt und die echte Seite ist erreichbar (auch nach Reload/Deep-Link).
- [ ] Angenommen der PIN ist falsch, dann antwortet `/api/gate` mit 401 und es wird kein
      Cookie gesetzt.
- [ ] Angenommen mehr als 5 Versuche pro IP in 10 min, dann antwortet `/api/gate` mit 429.
- [ ] Angenommen das Tor ist aktiv, dann bleiben `/admin`, `/api/gate`, `/coming-soon`,
      `/_next/*` und statische Assets erreichbar.
- [ ] Angenommen `ARC_GATE_ENABLED=false`, dann ist die Seite auf Vercel offen.

## Out of Scope
- Mehrere PINs / Benutzerverwaltung, Ablauf einzelner Tokens, Logging der Versuche.
- Rechtliche Seiten (Impressum/Datenschutz) — PROJ-13.

## Dateien
- `src/lib/gate.ts` (neu) — `GATE_COOKIE`, `isGateEnabled()`, `gatePathAllowed()` (Edge-sicher).
- `src/app/api/gate/route.ts` (neu) — POST-Unlock (Rate-Limit, Zod, PIN-Vergleich, Cookie).
- `src/app/coming-soon/page.tsx` (neu) — Coming-Soon-Seite.
- `src/components/gate/pin-gate.tsx` (neu) — Logo-Trigger + PIN-Eingabe (Client).
- `src/proxy.ts` — Tor-Block vor der Supabase-Logik (Rewrite auf `/coming-soon`).
- `src/components/layout/site-header.tsx` — Header auf `/coming-soon` ausgeblendet.

## Implementation Notes
### 2026-06-16
- Tor in den bestehenden Proxy (`src/proxy.ts`) integriert; läuft vor der
  Supabase-Session-/Admin-Logik und kurzschließt per `NextResponse.rewrite`. Matcher
  unverändert (`/api/gate` läuft durch den Proxy, wird per `gatePathAllowed` durchgelassen).
- PIN-UI: shadcn `Input` (numerisch, Auto-Submit bei 6 Stellen) + `Button`; Logo
  (`Wordmark`) als Trigger. Kein neues Paket.
- Verifikation: siehe Plan — lokal `VERCEL=1 ARC_GATE_PIN=… ARC_GATE_TOKEN=… npm run dev`.
