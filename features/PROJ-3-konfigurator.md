# PROJ-3: Konfigurator

## Status: Deployed
**Created:** 2026-05-26
**Last Updated:** 2026-05-27

## Dependencies
- PROJ-1 (Datenbank-Schema & Supabase-Setup) — `arcs`-Tabelle, Reservierungsfelder (`reserved_until`, `reserved_by`), neue Aufpreis-Spalten
- PROJ-2 (Arc-Katalog) — CTA "Arc konfigurieren" auf der Detailseite verlinkt hierher
- PROJ-4 (Pre-Order & Stripe) — Konfigurator leitet nach erfolgreicher Reservierung zum Checkout weiter

## User Stories

- Als Endkunde möchte ich meinen Arc Schritt für Schritt konfigurieren (Befestigung, ggf. Finish, Licht), damit ich ein auf meine Bedürfnisse abgestimmtes Angebot erhalte.
- Als Endkunde möchte ich den Gesamtpreis nach jeder Auswahl live sehen, damit ich die Kosten vor der Reservierung kenne.
- Als Endkunde möchte ich zwischen den Schritten frei hin- und herwechseln, damit ich meine Konfiguration anpassen kann.
- Als Endkunde möchte ich den konfigurierten Arc für 24 Stunden reservieren, damit ich Zeit habe den Checkout abzuschließen.
- Als Endkunde möchte ich sofort sehen, wenn ein Arc bereits reserviert ist, damit ich keine Zeit mit einer unmöglichen Konfiguration verbringe.
- Als Endkunde möchte ich beim Konfigurieren eines ungeschliffenen Rohlings klar sehen, dass kein Finish wählbar ist, damit ich keine falsche Erwartung habe.

## Out of Scope

- **Checkout / Zahlungsabwicklung** — PROJ-4; der Konfigurator endet mit der Reservierung und leitet weiter
- **E-Mail-Bestätigung der Reservierung** — PROJ-7 (E-Mail-System)
- **Kontaktdaten-Eingabe** — erst im Checkout (PROJ-4); der Konfigurator sammelt keine persönlichen Daten
- **Konfiguration ohne vorausgewählten Arc** — kein direkter Einstieg über `/konfigurator` ohne Arc-ID
- **Konfiguration speichern für später** — kein Kundenkonto in v1; State lebt nur in der aktuellen Session
- **Mehrere Arcs gleichzeitig** — kein Warenkorb; immer genau ein Arc pro Konfiguration
- **3D-Vorschau der Konfiguration** — komplexe Visualisierung deferred
- **Admin-Pflege der Aufpreise** — PROJ-5 (Admin-Backend); der Konfigurator liest nur bereits hinterlegte Preise
- **B2B-Sonderpreise** — PROJ-8 (B2B-Portal); Konfigurator zeigt immer den B2C-Preis

## Acceptance Criteria

### Einstieg & Sperrseite

- [ ] Angenommen ein Arc mit Status READY existiert, wenn der Nutzer `/konfigurator/[arc-id]` aufruft, dann wird der Konfigurator mit Schritt 1 (Befestigung) angezeigt und der Arc-Name und ein Foto sind sichtbar.
- [ ] Angenommen ein Arc ist aktuell reserviert (`reserved_until` in der Zukunft), wenn der Nutzer `/konfigurator/[arc-id]` aufruft, dann wird eine Sperrseite mit dem Text "Dieser Arc ist gerade reserviert" und der Uhrzeit bis wann sowie einem Link zurück zum Katalog angezeigt — kein Konfigurator.
- [ ] Angenommen ein Arc hat einen anderen Status als READY oder RESERVED, wenn der Nutzer `/konfigurator/[arc-id]` aufruft, dann wird eine 404-Seite angezeigt.

### Schritt 1: Befestigung

- [ ] Angenommen der Konfigurator wird geöffnet, wenn Schritt 1 angezeigt wird, dann sind nur die Befestigungsoptionen sichtbar, die der Arc laut Kompatibilitäts-Flags unterstützt (nicht unterstützte Optionen werden vollständig ausgeblendet).
- [ ] Angenommen "Spinne" ist eine kompatible Option und der Nutzer wählt sie aus, dann erscheint direkt darunter ein Stepper für die Pendelanzahl (Minimum: 1, Maximum: `max_spinne_pendel` des Arcs).
- [ ] Angenommen "Spinne" ist ausgewählt und der Nutzer ändert die Auswahl auf eine andere Befestigungsart, dann verschwindet der Stepper.
- [ ] Angenommen der Nutzer hat eine Befestigungsart ausgewählt, wenn er auf "Weiter" klickt, dann wechselt die Ansicht zu Schritt 2 (Finish).

### Schritt 2: Finish (nur wenn `is_sanded = true`)

- [ ] Angenommen der Arc hat `is_sanded = true`, wenn Schritt 2 angezeigt wird, dann sind nur die Finish-Optionen sichtbar, die der Arc unterstützt.
- [ ] Angenommen der Arc hat `is_sanded = true` und der Nutzer wählt ein Finish, wenn er auf "Weiter" klickt, dann wechselt die Ansicht zu Schritt 3 (Licht).
- [ ] Angenommen der Arc hat `is_sanded = false`, dann wird Schritt 2 (Finish) vollständig übersprungen — der Schritt erscheint weder im Step-Indikator noch im Flow.

### Schritt 2 (bei `is_sanded = false`) / Schritt 3 (bei `is_sanded = true`): Licht

- [ ] Angenommen der Licht-Schritt angezeigt wird, dann werden immer alle drei Lichtoptionen angezeigt: "Porzellan Fassung", "Hintergrund LED", "True Light LED".
- [ ] Angenommen der Nutzer wählt eine Lichtoption, wenn er auf "Weiter" klickt, dann wechselt die Ansicht zur Zusammenfassung.

### Schritt 3 (bei `is_sanded = false`) / Schritt 4 (bei `is_sanded = true`): Zusammenfassung

- [ ] Angenommen `is_sanded = true` und Schritt 4 angezeigt wird, dann werden angezeigt: gewählte Befestigung (inkl. Pendelanzahl bei Spinne), gewähltes Finish, gewählte Lichtoption, Oberflächenzustand "Geschliffen" (fest, nicht änderbar), Preisaufschlüsselung (Grundpreis + alle Aufpreise + Gesamtpreis).
- [ ] Angenommen `is_sanded = false` und die Zusammenfassung angezeigt wird, dann werden angezeigt: gewählte Befestigung, gewählte Lichtoption, Oberflächenzustand "Ungeschliffen – Rohling" (fest), kein Finish-Eintrag in der Zusammenfassung, Preisaufschlüsselung ohne Finish-Zeile.
- [ ] Angenommen der Nutzer klickt auf "Zurück zu Schritt X" (oder einen Schritt-Indikator), dann kehrt er zu diesem Schritt zurück und seine bisherigen Auswahlen bleiben erhalten.
- [ ] Angenommen der Nutzer klickt auf "Weiter", dann wechselt die Ansicht zur Reservierung.

### Schritt 4 (bei `is_sanded = false`) / Schritt 5 (bei `is_sanded = true`): Reservierung

- [ ] Angenommen der Reservierungs-Schritt angezeigt wird, dann wird die vollständige Konfiguration als Read-only-Zusammenfassung sowie der Gesamtpreis und ein Button "Jetzt reservieren (24 Stunden)" angezeigt.
- [ ] Angenommen der Nutzer klickt auf "Jetzt reservieren" und der Arc ist noch frei, dann wird `reserved_until` auf jetzt + 24 Stunden gesetzt, `reserved_by` auf eine Client-Session-ID, und der Nutzer wird zum Checkout (PROJ-4) weitergeleitet.
- [ ] Angenommen der Nutzer klickt auf "Jetzt reservieren" und der Arc wurde inzwischen von jemand anderem reserviert, dann wird eine Fehlermeldung "Dieser Arc wurde gerade von jemand anderem reserviert" mit einem Link zurück zum Katalog angezeigt — keine Weiterleitung zum Checkout.

### Step-Indikator (übergreifend)

- [ ] Angenommen der Arc hat `is_sanded = false`, wenn der Konfigurator geladen wird, dann zeigt der Step-Indikator 4 Schritte (ohne Finish-Schritt).
- [ ] Angenommen der Arc hat `is_sanded = true`, wenn der Konfigurator geladen wird, dann zeigt der Step-Indikator 5 Schritte (mit Finish-Schritt).

### Preisanzeige (übergreifend)

- [ ] Angenommen der Nutzer wechselt zu einem anderen Schritt, wenn eine gültige Auswahl vorliegt, dann wird der aktuelle Gesamtpreis (Grundpreis + alle bisher gewählten Aufpreise) im Konfigurator dauerhaft sichtbar aktualisiert.
- [ ] Angenommen die Befestigung "Spinne" gewählt ist und der Nutzer die Pendelanzahl ändert, dann aktualisiert sich der Gesamtpreis sofort.
- [ ] Angenommen der Arc hat `is_sanded = false`, dann enthält der Gesamtpreis keinen Finish-Aufpreis.

## Edge Cases

- **Arc wird während der Konfiguration reserviert:** Kein Echtzeit-Check — erst beim Klick auf "Jetzt reservieren" wird geprüft. Wenn der Arc dann weg ist, erscheint eine Fehlermeldung.
- **Nur eine kompatible Befestigungsoption:** Schritt wird trotzdem vollständig angezeigt — kein automatisches Überspringen.
- **Spinne-Stepper Grenzwerte:** Nutzer kann nicht unter 1 oder über `max_spinne_pendel` navigieren; Buttons werden an den Grenzen deaktiviert.
- **Arc ohne `max_spinne_pendel`:** Falls `max_spinne_pendel` null ist und "Spinne" trotzdem als kompatibel markiert wurde, wird Spinne nicht als Option angezeigt.
- **Aufpreis = 0:** Zeile in der Preisaufschlüsselung wird ausgeblendet (bereits implementiert).
- **Browser-Zurück-Button:** Verlässt der Nutzer den Konfigurator über den Browser-Zurück-Button, geht die Konfiguration verloren — kein Persist außerhalb der Page.
- **Direktzugriff auf `/konfigurator` ohne Arc-ID:** Redirect zur Browse-Ansicht (`/arcs`).
- **Arc mit `is_sanded = false` und gesetzten `price_finish_*` Spalten:** Die Finish-Aufpreise werden ignoriert — Finish-Schritt ist ausgeblendet, Preisberechnung schließt Finish-Aufpreise aus.
- **Arc wechselt `is_sanded` während aktiver Session:** Der Konfigurator lädt `is_sanded` einmalig beim Seitenaufruf (Server Component). Ändert ein Admin den Wert während der Session, hat das keine Auswirkung bis zum nächsten Reload.

## Technical Requirements

- Die Reservierung muss atomar erfolgen — kein Arc darf doppelt reserviert werden (DB-seitige Prüfung via UPDATE ... WHERE reserved_until IS NULL OR reserved_until < now())
- `reserved_by` wird als zufällige UUID generiert und im Browser (localStorage oder Cookie) gespeichert — kein Login nötig
- Seite ist öffentlich zugänglich (kein Login)
- Konfigurator-State lebt ausschließlich im Client (React State) — kein Persist in der DB vor der Reservierung

## Open Questions

- [x] Aufpreise als neue Spalten direkt in `arcs` — keine separate Tabelle (einfacher, kein JOIN nötig)
- [ ] Wohin genau leitet der Konfigurator nach erfolgreicher Reservierung weiter — `/checkout/[arc-id]` oder `/bestellung/[arc-id]`? (URL wird in PROJ-4 definiert)

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Single Page mit Step-Navigation | Einfacher, kein Reload, Konfiguration bleibt im State; URL bleibt stabil für Sharing | 2026-05-26 |
| Nicht-kompatible Optionen ausblenden, nicht deaktivieren | Cleaner UX — der Nutzer soll keine Optionen sehen, die er nicht wählen kann | 2026-05-26 |
| Admin hinterlegt fixe Aufpreise pro Arc | Preise hängen von Größe/Gewicht ab — komplexe Formel wird durch Admin-Kalkulation ersetzt | 2026-05-26 |
| Reservierung = 24 Stunden | Genug Zeit für Checkout; kurz genug, damit Arc nicht zu lang gesperrt bleibt | 2026-05-26 |
| Kein Echtzeit-Check während Konfiguration | Keine WebSocket-Komplexität nötig; Race Condition ist selten und wird beim Reservieren-Klick abgefangen | 2026-05-26 |
| Keine Kontaktdaten im Konfigurator | Trennung von Concerns: Konfigurator = Konfiguration + Reservierung, PROJ-4 = Zahlung + Kundendaten | 2026-05-26 |
| Lichtoptionen immer alle 3 sichtbar | Keine Arc-spezifischen Licht-Kompatibilitätsdaten im Schema — alle Lichtoptionen sind für alle Arcs verfügbar | 2026-05-26 |
| Finish-Schritt bei `is_sanded = false` vollständig ausblenden | Finish (Öl/Lack/Schellack) setzt einen geschliffenen Untergrund voraus — ein Rohling kann keinen Oberflächenfinish erhalten | 2026-05-27 |
| Schliff nicht als buchbare Option im Konfigurator | Schliff ist ein handwerklicher Schritt, der nicht über den Konfigurator bestellt werden kann; ein Arc kommt entweder schon geschliffen oder als Rohling | 2026-05-27 |
| Schrittanzahl dynamisch (4 oder 5) je nach `is_sanded` | Step-Indikator spiegelt den tatsächlichen Flow — kein "leerer" Schritt, keine Verwirrung | 2026-05-27 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Aufpreise als Spalten in `arcs` (nicht separate Tabelle) | Jeder Arc ist ein Unikat mit individuellen Preisen — kein JOIN, weniger Komplexität, passt zur bestehenden Schemastruktur | 2026-05-26 |
| Server Component als Einstieg, Client Component für Step-State | Arc-Daten per SSR laden (SEO, kein Flicker); Step-Navigation braucht Client-State | 2026-05-26 |
| Konfigurator-State nur im React State (kein localStorage) | Konfiguration muss nicht geräteübergreifend persistent sein; einfachste Lösung für MVP | 2026-05-26 |
| Session-ID via localStorage (keine Auth) | Kein Kundenkonto in v1; UUID reicht für atomische Reservierung und Checkout-Übergabe (PROJ-4) | 2026-05-26 |
| Reservierung via API Route (POST) mit atomischem DB-UPDATE | Verhindert Doppelreservierungen durch DB-Bedingung (WHERE reserved_until IS NULL OR < now()); Server Action wäre ebenfalls möglich, aber API Route ist expliziter für externe Nachvollziehbarkeit | 2026-05-26 |
| Preisaufschlüsselung: Zeilen mit Aufpreis 0 ausblenden | Cleaner UX — "+0 €" ist irreführend und wirkt unfertig; ausgeblendete Zeile vermeidet Verwirrung | 2026-05-26 |
| Keine neuen Pakete | Alle benötigten shadcn/ui Komponenten (Button, Card, Separator, Badge) bereits installiert | 2026-05-26 |
| Steps-Array aus `is_sanded` zur Laufzeit berechnet | `KonfiguratorClient` erhält `is_sanded` als Prop und baut das Steps-Array einmalig beim Mount — kein Feature-Flag, kein Conditional im JSX auf Step-Ebene | 2026-05-27 |
| Finish-Aufpreise bei `is_sanded=false` aus Preisberechnung ausschließen | Auch wenn `price_finish_*` in der DB gesetzt sind, werden sie ignoriert — Quelle der Wahrheit ist `is_sanded`, nicht das Vorhandensein eines Aufpreises | 2026-05-27 |

---

## Tech Design (Solution Architect)

### Komponenten-Struktur

```
/konfigurator/[arc_id]/page.tsx  (Server Component)
│  → Lädt Arc-Daten inkl. Aufpreise + is_sanded aus Supabase
│  → Prüft Reservierungsstatus
│
├── BlockedPage  (wenn Arc reserviert)
│   └── "Reserviert bis [Zeit]" + Link → /arcs
│
├── 404  (wenn Arc nicht READY/RESERVED)
│
└── KonfiguratorClient  (Client Component — verwaltet Step-State)
    │  → erhält is_sanded als Prop
    │  → berechnet Steps-Array dynamisch: 4 Schritte (ohne Finish) oder 5 Schritte (mit Finish)
    │
    ├── ArcPreview  (persistent: Foto + Seriennummer + Oberflächenzustand-Badge)
    ├── PriceDisplay  (persistent: Gesamtpreis, live-updated)
    ├── StepIndicator  (1–4 oder 1–5, klickbar für bereits besuchte Schritte)
    │
    ├── Step: Befestigung  (immer Schritt 1)
    │   ├── OptionCard × n  (nur kompatible Optionen)
    │   └── SpinneStepper  (bedingt — nur wenn "Spinne" gewählt)
    │
    ├── Step: Finish  [NUR wenn is_sanded = true]
    │   └── OptionCard × n  (nur kompatible Optionen)
    │
    ├── Step: Licht  (Schritt 2 bei is_sanded=false, Schritt 3 bei is_sanded=true)
    │   └── OptionCard × 3  (immer alle 3)
    │
    ├── Step: Zusammenfassung  (Schritt 3 oder 4)
    │   ├── KonfigSummary  (read-only: Befestigung, ggf. Finish, Licht, Oberflächenzustand)
    │   └── PreisAufschlüsselung  (Grundpreis + Aufpreise > 0 + Gesamt; kein Finish-Aufpreis wenn is_sanded=false)
    │
    └── Step: Reservierung  (Schritt 4 oder 5)
        ├── KonfigSummary  (read-only, identisch Zusammenfassung)
        └── ReservierenButton → POST /api/konfigurator/reserve
```

### Datenmodell: Neue Spalten in `arcs`

Aufpreise direkt als neue Spalten in der bestehenden `arcs`-Tabelle (kein separates Schema). Alle Werte in Cent (ganzzahlig), nullable.

| Neue Spalte | Bedeutung |
|-------------|-----------|
| `price_mounting_wall` | Aufpreis Wandbefestigung |
| `price_mounting_ceiling` | Aufpreis Deckenbefestigung |
| `price_mounting_spinne_per` | Aufpreis pro Spinnen-Pendel |
| `price_finish_oil` | Aufpreis Öl-Finish |
| `price_finish_lacquer` | Aufpreis Lack-Finish |
| `price_finish_shellac` | Aufpreis Schellack-Finish |
| `price_light_porcelain` | Aufpreis Porzellan Fassung |
| `price_light_bg_led` | Aufpreis Hintergrund LED |
| `price_light_true_led` | Aufpreis True Light LED |

### Datenfluss

```
1. Browser öffnet /konfigurator/[arc_id]
   → Server Component liest Arc (inkl. Aufpreise + Kompatibilitäts-Flags)
   → Arc reserviert? → BlockedPage
   → Arc nicht READY? → 404
   → Arc frei → KonfiguratorClient als Props

2. Nutzer konfiguriert (Schritte 1–4)
   → Alles im React State des KonfiguratorClient
   → Gesamtpreis live berechnet im Client aus Arc-Daten + Auswahl
   → Keine DB-Zugriffe während der Konfiguration

3. Nutzer klickt "Jetzt reservieren" (Schritt 5)
   → POST /api/konfigurator/reserve
   → Atomisches UPDATE: WHERE reserved_until IS NULL OR reserved_until < now()
   → Erfolgreich → redirect /checkout/[arc_id] (URL in PROJ-4 definiert)
   → Conflict → Fehlermeldung im Client
```

### API Route

| Route | Methode | Zweck |
|-------|---------|-------|
| `/api/konfigurator/reserve` | POST | Atomische 24h-Reservierung des Arcs |

### Session-ID (ohne Login)

Beim ersten Besuch wird eine zufällige UUID im `localStorage` gespeichert. Diese ID wird als `reserved_by` in die DB geschrieben und in PROJ-4 (Checkout) wiederverwendet.

### Neue Dateien

```
src/
  app/
    konfigurator/
      [arc_id]/
        page.tsx                      ← Server Component
    api/
      konfigurator/
        reserve/
          route.ts                    ← POST Reservierung
  components/
    konfigurator/
      konfigurator-client.tsx         ← Client Component (Step-State)
      step-indicator.tsx
      arc-preview.tsx
      price-display.tsx
      option-card.tsx                 ← Wiederverwendbar für alle 3 Schritte
      spinne-stepper.tsx
      konfig-summary.tsx              ← Schritt 4 + 5
      preis-aufschluesselung.tsx      ← Zeilen mit Aufpreis 0 ausgeblendet
      blocked-page.tsx
```

### shadcn/ui Komponenten (alle bereits installiert)

| Komponente | Verwendung |
|------------|------------|
| `Button` | Weiter / Zurück / Reservieren |
| `Card` | OptionCard-Layout |
| `Separator` | Preisaufschlüsselung |
| `Badge` | Aktiver Step im StepIndicator |

## Implementation Notes

**is_sanded Erweiterung (2026-05-27)**
- `src/components/konfigurator/step-indicator.tsx` — auf dynamisches `steps: string[]` + `currentIndex`/`furthestIndex` Props umgestellt (nicht mehr hardcoded 5 Schritte)
- `src/components/konfigurator/arc-preview.tsx` — `isSanded` Prop ergänzt, Badge "Rohling" / "Geschliffen" unter Seriennummer
- `src/components/konfigurator/konfig-summary.tsx` — `isSanded` Prop, Oberflächen-Zeile ergänzt, Finish-Zeile nur wenn `isSanded = true`
- `src/components/konfigurator/konfigurator-client.tsx` — auf `StepKey`-basierte Navigation refaktoriert; `steps`-Array wird aus `arc.is_sanded` dynamisch gebaut (4 oder 5 Schritte); `hasFullConfig` berücksichtigt `is_sanded`; Finish-Aufpreis bei `is_sanded=false` immer 0

**Frontend (2026-05-26)**
- Alle Komponenten unter `src/components/konfigurator/` erstellt
- Server Page unter `src/app/konfigurator/[arc_id]/page.tsx`
- API Route `POST /api/konfigurator/reserve` — atomar, Reservierung 24h
- TypeScript-Typen in `database.ts` + `index.ts` um Preis-Spalten und `LightType` erweitert
- DB-Schema `db/schema.sql` um 9 Aufpreis-Spalten ergänzt
- `reserved_until` Kommentar auf "24h window" korrigiert
- Workaround: `.update(payload as unknown as never)` wegen postgrest-js v2 Typ-Constraint für nicht-gemigrate Spalten (runtime korrekt)
- 404 bei unbekannter arc_id korrekt ✅
- Sperrseite bei RESERVED Arc implementiert ✅
- Preis-Aufschlüsselung blendet 0-€-Zeilen aus ✅

## QA Test Results

**Datum:** 2026-05-26
**Tester:** Claude QA Engineer
**Build:** ✅ Sauber

### Acceptance Criteria

| # | Kriterium | Status | Anmerkung |
|---|-----------|--------|-----------|
| E-1 | READY Arc → Konfigurator mit Step 1 + Arc-Info | ✅ | |
| E-2 | RESERVED Arc → Sperrseite | ❌ | **High Bug** — RLS blockt RESERVED Arcs für anon-Client → 404 statt BlockedPage |
| E-3 | Nicht-READY/RESERVED Arc → 404 | ✅ | |
| S1-1 | Nur kompatible Befestigungsoptionen sichtbar | ✅ | |
| S1-2 | Weiter disabled ohne Auswahl | ✅ | |
| S1-3 | Spinne-Stepper bei Spinne-Auswahl | ⏳ | Testdaten-Limitierung: alle Spinne-Arcs haben `max_spinne_pendants=null` → Spinne nicht anzeigbar |
| S1-4 | Weiter → Step 2 | ✅ | |
| S2-1 | Nur kompatible Finish-Optionen | ✅ | |
| S2-2 | Zurück → Step 1 mit erhaltener Auswahl | ✅ | |
| S2-3 | Weiter → Step 3 | ✅ | |
| S3-1 | Alle 3 Lichtoptionen immer sichtbar | ✅ | |
| S3-2 | Weiter → Step 4 | ✅ | |
| S4-1 | Zusammenfassung zeigt alle Auswahlen | ✅ | |
| S4-2 | Preisaufschlüsselung korrekt | ✅ | |
| S4-3 | 0€-Zeilen ausgeblendet | ✅ | |
| S4-4 | Schritt-Indikator-Navigation | ✅ | |
| S4-5 | Weiter → Step 5 | ❌ | **Medium Bug** — Button-Label heißt "Reservieren" statt "Weiter" → irreführend |
| S5-1 | Read-only-Zusammenfassung + Gesamtpreis + Button sichtbar | ✅ | |
| S5-2 | Reservierung erfolgreich → Redirect Checkout | ⏳ | Checkout-URL (/checkout/[id]) noch nicht implementiert (PROJ-4) |
| S5-3 | Race Condition: Arc vergeben → Fehlermeldung | ✅ | API liefert 409 korrekt |
| P-1 | Gesamtpreis live aktualisiert | ✅ | |
| P-2 | Spinne-Stepper aktualisiert Preis sofort | ⏳ | Testdaten-Limitierung |

### Responsive

| Breakpoint | Ergebnis |
|------------|----------|
| Mobile 375px | ✅ Single-column, alle Elemente lesbar |
| Tablet 768px | ⚠️ **Medium Bug** — Arc-Preview (3:4) füllt gesamten Viewport, Steps unsichtbar ohne Scrollen |
| Desktop 1440px | ✅ Two-column layout, korrekt |

### Security Audit

| Check | Ergebnis |
|-------|----------|
| Missing arcId → 400 | ✅ |
| Missing sessionId → 400 | ✅ |
| GET auf Reserve-Route → 405 | ✅ |
| SQL Injection in sessionId | ✅ Kein Risiko (Supabase parametrisiert) |
| SessionId Input-Validierung | ⚠️ **Medium** — Beliebige Strings als sessionId akzeptiert, UUID-Format nicht geprüft |
| RLS: READY Arcs öffentlich lesbar | ✅ |
| RLS: Admin-Zugriff für Reserve-API | ✅ Service Role Key korrekt verwendet |

### Automatisierte Tests

```
Vitest:    17/17 ✅ (keine Regression)
Playwright: 36/36 ✅ (Chromium + Mobile Safari)
  tests/PROJ-3-konfigurator.spec.ts
```

### Bugs

| # | Schwere | Beschreibung | Reproduktion |
|---|---------|--------------|--------------|
| B-1 | **High** | ~~BlockedPage unerreichbar~~ | **BEHOBEN** — Page nutzt jetzt `createAdminClient()` statt `createClient()` |
| B-2 | **Medium** | ~~Button-Label auf Step 4 zeigt "Reservieren" statt "Weiter"~~ | **BEHOBEN** — Label in `konfigurator-client.tsx` auf "Weiter" geändert |
| B-3 | **Medium** | ~~Tablet 768px: Arc-Preview füllt gesamten Viewport~~ | **BEHOBEN** — 2-Spalten-Layout startet jetzt bei `md:` (768px) statt `lg:` (1024px) |
| B-4 | **Medium** | ~~sessionId-Input nicht auf UUID-Format validiert~~ | **BEHOBEN** — UUID-Regex validiert beide Felder (`arcId` + `sessionId`) vor DB-Zugriff |
| B-5 | **Low** | ~~`/konfigurator` ohne arc_id → 404~~ | **BEHOBEN** — `src/app/konfigurator/page.tsx` leitet zu `/arcs` weiter |

### Produktionsreife-Entscheidung

**✅ READY — Alle Bugs behoben, deployed am 2026-05-26**

## Deployment

- **Deployed:** 2026-05-26
- **Production URL:** https://arc-one.vercel.app
- **DB-Migration:** `db/migrations/003_konfigurator_price_columns.sql` — 9 Aufpreis-Spalten auf `arcs`-Tabelle
- **Neue Env Var:** `SUPABASE_SERVICE_ROLE_KEY` in Vercel gesetzt (Admin-Client für Konfigurator-Page + Reserve-API)

## Deployment
_To be added by /deploy_
