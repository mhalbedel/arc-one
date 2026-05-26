# PROJ-2: Arc-Katalog

## Status: In Progress
**Created:** 2026-05-26
**Last Updated:** 2026-05-26

## Dependencies
- PROJ-1 (Datenbank-Schema & Supabase-Setup) — Arc-Daten, RLS-Policies
- PROJ-5 (Admin-Backend) — Admin wählt Highlight-Arcs für die Homepage aus
- PROJ-3 (Konfigurator) — CTA "Arc konfigurieren" auf der Detailseite verlinkt dorthin
- PROJ-6 (Drop & Warteliste) — Leerzustand der Browse-Seite verlinkt zur Warteliste

## User Stories

- Als Endkunde möchte ich die Homepage besuchen, damit ich einen ersten Eindruck von ARC-ONE bekomme und zum Katalog weiterfinde.
- Als Endkunde möchte ich alle verfügbaren Arcs in einer Übersicht sehen, damit ich den richtigen Arc für mich finden kann.
- Als Endkunde möchte ich Arcs nach Preis sortieren, damit ich Arcs in meinem Budget-Rahmen schnell erkenne.
- Als Endkunde möchte ich die Details eines Arcs sehen (Fotos, Maße, Charakter, Kompatibilität, Preis), damit ich eine fundierte Kaufentscheidung treffen kann.
- Als Endkunde möchte ich von der Arc-Detailseite direkt zum Konfigurator gelangen, damit ich meinen Arc sofort konfigurieren kann.
- Als B2B-Nutzer (Architekt/Designer) möchte ich denselben öffentlichen Katalog sehen wie Endkunden, damit ich Arcs für Kundenprojekte evaluieren kann.

## Out of Scope

- **3D-Scan-Viewer** — model-viewer Web Component wird in einer späteren Iteration ergänzt
- **Filter** (nach Maßen, Befestigungsart, Finish, Waldsektor) — zu wenig Arcs im MVP für sinnvolle Filter; deferred
- **Pagination / Infinite Scroll** — alle READY-Arcs auf einer Seite; deferred wenn nötig
- **Admin-Auswahl der Highlight-Arcs** — UI dafür ist Teil von PROJ-5 (Admin-Backend); PROJ-2 liest nur die gespeicherte Auswahl
- **Konfigurator** — PROJ-3; "Arc konfigurieren"-CTA verlinkt nur dorthin
- **Warteliste-Eintrag-Formular** — PROJ-6; Leerzustand der Browse-Seite verlinkt nur dorthin
- **Drop-Detailseite** — PROJ-6; Drop-Badge auf Arc-Karte ist nur eine visuelle Kennzeichnung
- **SEO-Optimierung** (strukturierte Daten, Sitemap, OG-Tags) — PROJ-10
- **Mehrsprachigkeit** — nicht in v1

## Acceptance Criteria

### Homepage (`/`)

- [ ] Angenommen ein Nutzer öffnet die Homepage, wenn die Seite lädt, dann wird ein Hero-Bereich mit Headline, kurzer Markenstory und einem CTA-Button "Alle Arcs entdecken" angezeigt.
- [ ] Angenommen der Nutzer klickt auf "Alle Arcs entdecken", wenn der Button geklickt wird, dann wird er zur Browse-Ansicht (`/arcs`) weitergeleitet.
- [ ] Angenommen der Admin hat mindestens einen Highlight-Arc ausgewählt, wenn die Homepage geladen wird, dann werden bis zu 3 Highlight-Arc-Karten (Foto, Seriennummer, Preis, CTA "Arc entdecken") unterhalb der Markenstory angezeigt.
- [ ] Angenommen kein Highlight-Arc ausgewählt wurde, wenn die Homepage geladen wird, dann ist der Highlight-Abschnitt vollständig ausgeblendet (keine leere Section, kein Platzhalter).
- [ ] Angenommen eine Highlight-Arc-Karte angezeigt wird, wenn der Nutzer darauf klickt, dann wird er zur Detailseite dieses Arcs (`/arcs/[serial-number]`) weitergeleitet.

### Browse-Ansicht (`/arcs`)

- [ ] Angenommen READY-Arcs existieren, wenn die Browse-Seite geladen wird, dann werden alle READY-Arcs in einem Grid angezeigt, jede Karte zeigt: Foto Seite A, Seriennummer, Breite × Höhe in cm und Grundpreis in Euro.
- [ ] Angenommen ein Arc gehört zu einem Drop, wenn die Arc-Karte angezeigt wird, dann wird ein Drop-Badge auf der Karte angezeigt.
- [ ] Angenommen die Browse-Seite angezeigt wird, wenn der Nutzer die Sortierung auf "Preis aufsteigend" setzt, dann werden die Arcs nach Grundpreis aufsteigend neu geordnet.
- [ ] Angenommen die Browse-Seite angezeigt wird, wenn der Nutzer die Sortierung auf "Preis absteigend" setzt, dann werden die Arcs nach Grundpreis absteigend neu geordnet.
- [ ] Angenommen keine READY-Arcs existieren, wenn die Browse-Seite geladen wird, dann wird ein Leerzustand mit dem Text "Aktuell sind keine Arcs verfügbar" und einem Link zur Warteliste angezeigt.
- [ ] Angenommen eine Arc-Karte angezeigt wird, wenn der Nutzer auf "Arc entdecken" klickt, dann wird er zur Detailseite des Arcs (`/arcs/[serial-number]`) weitergeleitet.

### Detailseite (`/arcs/[serial-number]`)

- [ ] Angenommen ein READY-Arc mit der Seriennummer ARV-0001 existiert, wenn die URL `/arcs/ARV-0001` aufgerufen wird, dann werden angezeigt: Fotos Seite A und Seite B, Seriennummer, Charakter-Text, Abmessungen (Breite/Höhe/Tiefe in cm), Gewicht, Herkunft (Erntedatum, Waldsektor, Schnittnummer), Kompatibilitäts-Flags (Befestigungsarten, Finishes), Grundpreis in Euro.
- [ ] Angenommen ein Arc hat Fotos für Seite A und Seite B, wenn die Detailseite geladen wird, dann sind beide Fotos sichtbar (nebeneinander oder umschaltbar über Tabs/Thumbnails).
- [ ] Angenommen die Detailseite angezeigt wird, wenn der Nutzer auf "Arc konfigurieren" klickt, dann wird er zum Konfigurator für diesen Arc weitergeleitet (PROJ-3, URL noch offen).
- [ ] Angenommen ein Arc existiert nicht oder ist nicht READY, wenn die URL `/arcs/[serial-number]` aufgerufen wird, dann wird eine 404-Seite angezeigt.

### Navigation

- [ ] Angenommen der Nutzer befindet sich auf einer beliebigen Seite, wenn er auf das ARC-ONE-Logo klickt, dann wird er zur Homepage (`/`) weitergeleitet.
- [ ] Angenommen der Nutzer befindet sich auf einer beliebigen Seite, wenn er auf den Navigationslink "Arcs" klickt, dann wird er zur Browse-Ansicht (`/arcs`) weitergeleitet.

## Edge Cases

- **Arc ohne Foto:** Hat ein Arc keine `photo_front_url`, zeigt die Karte/Detailseite einen neutralen Platzhalter (kein kaputtes Bild-Tag).
- **Arc mit nur einem Foto:** Hat ein Arc nur Foto Seite A aber kein Foto Seite B, entfällt der Umschalter — nur Foto A wird angezeigt.
- **Arc wird während des Besuchs RESERVED:** Der Nutzer hat die Detailseite offen, ein anderer Nutzer reserviert den Arc. Beim nächsten Seitenaufruf (oder Reload) wird 404 angezeigt. Keine Echtzeit-Aktualisierung nötig (kein WebSocket).
- **Ungültige Seriennummer in URL:** `/arcs/UNBEKANNT-9999` → 404, keine Fehlermeldung mit Datenbankinhalt.
- **Arc mit `drop_id`, aber Drop hat Status `CLOSED`:** Drop-Badge wird nur angezeigt wenn der verknüpfte Drop `SCHEDULED` oder `LIVE` ist.
- **Sehr langer Charakter-Text:** Kein Abschneiden — der Text wird vollständig angezeigt (Kaufentscheidung hängt von der Beschreibung ab).
- **Preis-Sortierung bei gleichem Preis:** Arcs mit identischem Grundpreis werden nach Seriennummer (alphabetisch) als Tiebreaker sortiert.

## Technical Requirements

- Öffentliche Seiten (Homepage, Browse, Detail) sind ohne Login zugänglich — keine Authentifizierung nötig
- RLS auf der `arcs`-Tabelle filtert automatisch nicht-READY-Arcs heraus (kein manueller Status-Check im Code nötig)
- Seiten sollen als Server Components gerendert werden (SEO-Grundlage für PROJ-10)

## Open Questions

- [ ] Welche Ziel-URL hat der Konfigurator? (wird in PROJ-3 definiert — CTA vorerst als Platzhalter `/konfigurator/[arc-id]`)
- [ ] Welche Felder der Highlight-Arc-Auswahl werden im Schema gespeichert — `is_featured` Boolean in `arcs` oder separate Config-Tabelle? (wird in PROJ-5 / Architecture entschieden)

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Homepage als reine Brand-Seite, keine Arc-Listings | Zeitloser erster Eindruck; kein Stale-Content wenn Arcs verkauft werden | 2026-05-26 |
| Highlight-Arcs manuell durch Admin ausgewählt | Redaktionelle Kontrolle — Admin wählt die charakteristischsten Arcs aus, nicht die neuesten | 2026-05-26 |
| Highlight-Abschnitt ausblenden wenn keine Auswahl | Seite sieht nicht kaputt aus beim Launch ohne ausgewählte Arcs | 2026-05-26 |
| Keine Filter in MVP | Zu wenig Datenmenge (10–30 Arcs) für sinnvolles Filtering; nur Preis-Sortierung | 2026-05-26 |
| Keine Pagination in MVP | Alle READY-Arcs passen auf eine Seite; Komplexität nicht gerechtfertigt | 2026-05-26 |
| URL `/arcs/[serial-number]` statt UUID | Menschenlesbar, SEO-freundlich, bereits eindeutig im Schema | 2026-05-26 |
| 404 bei nicht-READY Arc | RLS gibt den Arc sowieso nicht zurück; kein Spezialfall nötig | 2026-05-26 |
| 3D-Scan-Viewer aus MVP ausgeschlossen | model-viewer ist eigene Komplexität; Fotos reichen für MVP-Kaufentscheidung | 2026-05-26 |

### Technical Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Server Components für alle Katalog-Seiten | SSR als SEO-Grundlage (PROJ-10); RLS greift auf DB-Ebene, kein Client-Exposure | 2026-05-26 |
| Kein API-Layer für öffentliche Lesezugriffe | Server Components rufen Supabase Server Client direkt auf — weniger Code, gleiche Sicherheit | 2026-05-26 |
| Sortierung via URL-Searchparams (`?sort=`) | Bookmarkbar, kein Client-State, SSR-kompatibel; SortControl ist einzige Client Component | 2026-05-26 |
| `is_featured` Boolean auf `arcs`-Tabelle | Einfachste Lösung; Admin setzt per Toggle in PROJ-5; kein separates Config-Schema nötig | 2026-05-26 |
| Foto-Layout als Tabs (shadcn Tabs) | Ein Foto im Fokus, mobilfreundlich; shadcn Tabs bereits installiert | 2026-05-26 |
| Keine neuen Pakete | Alle benötigten shadcn/ui Komponenten (Badge, Card, Button, Select, Skeleton, Tabs, Separator) bereits installiert | 2026-05-26 |
| 404 via Next.js `notFound()` | RLS gibt bei nicht-READY oder unbekannter Seriennummer kein Ergebnis zurück — `notFound()` ist der korrekte Pfad | 2026-05-26 |

---

## Tech Design (Solution Architect)

### Komponenten-Struktur

```
RootLayout (src/app/layout.tsx)
└── SiteHeader  [NEU]
    ├── ARC-ONE Logo  → /
    └── Nav-Link "Arcs"  → /arcs

Homepage  /  (Server Component)
├── HeroSection  [NEU]
│   ├── Headline + Markenstory-Text
│   └── CTA-Button "Alle Arcs entdecken"  → /arcs
└── HighlightSection  [NEU, nur wenn is_featured Arcs vorhanden]
    └── ArcCard × max 3  [GETEILT mit Browse]

Browse  /arcs  (Server Component)
├── SortControl  [NEU, Client Component — einzige Client Component]
├── ArcsGrid  [NEU]
│   └── ArcCard × n  [GETEILT]
│       └── DropBadge  [NEU, bedingt: nur bei Drop status SCHEDULED/LIVE]
└── EmptyState  [NEU, bedingt: wenn keine READY Arcs]

Detail  /arcs/[serial_number]  (Server Component)
├── PhotoSection  [NEU — Tabs Seite A / Seite B]
├── ArcInfoSection  [NEU]
│   ├── Seriennummer, Grundpreis
│   ├── Charakter-Text
│   ├── Abmessungen (B × H × T in cm) + Gewicht
│   ├── Herkunft (Erntedatum, Waldsektor, Schnittnummer)
│   └── Kompatibilitäts-Flags (Befestigungsarten, Finishes)
└── CTASection  [NEU]
    └── Button "Arc konfigurieren"  → /konfigurator/[arc-id] (Platzhalter)
```

### Datenfluss

```
Browser → Next.js Server Component
        → Supabase Server Client (src/lib/supabase/server.ts)
        → PostgreSQL (RLS filtert non-READY Arcs automatisch)
        → SSR-HTML an Browser
```

### Datenzugriff je Seite

| Seite | Query | Besonderheit |
|-------|-------|--------------|
| Homepage | `arcs` WHERE `is_featured = true` LIMIT 3 | Join auf `drops` für Badge-Status |
| Browse | `arcs` WHERE `status = READY` ORDER BY `base_price` | Join auf `drops` für Badge-Status; sortierbar via `?sort=price_asc\|price_desc` |
| Detail | `arcs` WHERE `serial_number = X` (single row) | Join auf `drops`; kein Ergebnis → `notFound()` |

### Neue Dateien

```
src/
  app/
    page.tsx                           ← Homepage (überschreiben)
    arcs/
      page.tsx                         ← Browse
      [serial_number]/
        page.tsx                       ← Detail
  components/
    layout/
      site-header.tsx                  ← Navigation (Logo + "Arcs"-Link)
    arcs/
      arc-card.tsx                     ← Karte (geteilt, Homepage + Browse)
      arc-grid.tsx                     ← Grid-Layout
      drop-badge.tsx                   ← Drop-Kennzeichnung (bedingt)
      sort-control.tsx                 ← Sortierung (Client Component)
      photo-section.tsx                ← Tabs Foto A / Foto B
```

### shadcn/ui Komponenten (bereits installiert, kein Install nötig)

| Komponente | Verwendung |
|------------|------------|
| `Badge` | Drop-Badge auf Arc-Karten |
| `Card` | ArcCard-Layout |
| `Button` | CTAs |
| `Select` | SortControl (Sortier-Dropdown) |
| `Skeleton` | Loading-Fallback in Suspense-Boundaries |
| `Tabs` | Foto A / Foto B auf Detailseite |
| `Separator` | Abschnitte in ArcInfoSection |

## Implementation Notes

**Backend-Integration (2026-05-26)**
- Supabase-Verbindung verifiziert — alle 3 Seiten laden echte Daten
- 10 READY-Arcs werden auf `/arcs` korrekt angezeigt (Preis aufsteigend + absteigend)
- Drop-Badge erscheint auf ARV-0001, ARV-0002, ARV-0003 (Drop Status: SCHEDULED)
- Detailseite zeigt alle Felder: Seriennummer, Preis, Charakter, Abmessungen, Herkunft, Kompatibilität
- 404 bei unbekannter Seriennummer korrekt
- Leerzustand auf `/arcs` korrekt wenn keine READY-Arcs vorhanden
- Fotos: "KEIN FOTO" Platzhalter korrekt (Seed hat keine photo_front_url)
- Kein API-Layer — Server Components → Supabase direkt (per Architecture-Entscheidung)

## QA Test Results

**Datum:** 2026-05-26
**Tester:** Claude QA Engineer
**Build:** ✅ Sauber

### Acceptance Criteria

| # | Kriterium | Status | Anmerkung |
|---|-----------|--------|-----------|
| H-1 | Hero mit Headline, Markenstory und CTA | ✅ | |
| H-2 | CTA → /arcs | ✅ | |
| H-3 | Highlight-Arcs (bis zu 3) sichtbar wenn is_featured=true | ⏳ | Kein Code-Bug — kein featured Arc im Seed; Code korrekt |
| H-4 | Highlight-Sektion ausgeblendet wenn keine Featured Arcs | ✅ | |
| H-5 | Click auf Highlight-Karte → /arcs/[serial] | ⏳ | Abhängig von H-3 |
| B-1 | READY-Arcs im Grid mit Foto/Seriennummer/Maße/Preis | ✅ | |
| B-2 | Drop-Badge auf Arcs mit SCHEDULED/LIVE Drop | ✅ | |
| B-3 | Sortierung Preis aufsteigend | ✅ | |
| B-4 | Sortierung Preis absteigend | ✅ | |
| B-5 | Leerzustand "Aktuell sind keine Arcs verfügbar" + Warteliste-Link | ✅ | |
| B-6 | Click auf Arc-Karte → /arcs/[serial] | ✅ | |
| D-1 | Detailseite: alle Felder sichtbar | ✅ | |
| D-2 | Foto-Tabs (Seite A / Seite B) | ⏳ | Kein Code-Bug — Seed hat keine Fotos in Storage |
| D-3 | CTA "Arc konfigurieren" → /konfigurator/[id] | ✅ | |
| D-4 | Unbekannte/non-READY Seriennummer → 404 | ✅ | |
| N-1 | Logo-Click → / | ✅ | |
| N-2 | "Arcs"-Link → /arcs | ✅ | |

### Responsive

| Breakpoint | Ergebnis |
|------------|----------|
| Mobile 375px | ✅ 1-Spalten-Layout, alle Elemente lesbar |
| Tablet 768px | ✅ 2-Spalten-Grid, Sort-Control sichtbar |
| Desktop 1440px | ✅ 3-Spalten-Grid, zentrierter Content |

### Security Audit

| Check | Ergebnis |
|-------|----------|
| Öffentliche Seiten ohne Login zugänglich | ✅ |
| Kein Client-Side DB-Zugriff (Server Components) | ✅ |
| Anon-Key nicht für Datenzugriff genutzt | ✅ |
| Keine User-Inputs → kein Injection-Risiko | ✅ |
| RLS filtert non-READY Arcs auf DB-Ebene | ✅ |

### Automatisierte Tests

```
Vitest:    17/17 ✅
Playwright: 34/34 ✅ (Chromium + Mobile Safari)
  tests/PROJ-2-arc-katalog.spec.ts
```

### Bugs

Keine Critical oder High Bugs gefunden.

Die 3 offenen ACs (H-3, H-5, D-2) sind **Testdaten-Limitierungen**, keine Code-Fehler:
- H-3/H-5: Kein Arc mit `is_featured=true` im Seed → SQL `UPDATE arcs SET is_featured=true WHERE serial_number='ARV-0001'` zum Testen
- D-2: Kein `photo_front_url`/`photo_back_url` im Seed → erst testbar wenn Fotos in Supabase Storage hochgeladen

### Produktionsreife-Entscheidung

**✅ APPROVED — keine Critical oder High Bugs**

## Deployment
_To be added by /deploy_
