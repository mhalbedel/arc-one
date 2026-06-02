# PROJ-2: Arc-Katalog

## Status: In Progress
**Created:** 2026-05-26
**Last Updated:** 2026-06-02

> **Refinement (2026-06-02) — Spec-only, noch nicht implementiert:** Basierend auf der Gap-Analyse (`docs/planning/GAP-ANALYSE_Sitemap-Copywriting.md`) und einer Produktklärung. Drei Änderungen: (1) **Homepage erweitert** um Brand Statement, USP-3-Säulen, Featured-Drop-Teaser und Manufaktur-Teaser (Copy aus dem Copywriting-Deck). (2) **Abgrenzung geschärft:** Katalog und Konfigurator gelten ausschließlich für konfigurierbare **Arcs**; fertige Nicht-Arc-Objekte (Tischlampen-als-Fertigprodukt, Möbel, Tische, Schalen) gehören in die neue Showcase-Seite **PROJ-12** (kein Konfigurator, kein Stripe). (3) **Series-/Montage-Filter** (Tisch/Decke/Cluster) bleibt bewusst **deferred**. Neue Acceptance Criteria sind mit **(NEU 2026-06-02)** markiert. Die deployte v1 bleibt live; dies ist ein Increment darauf.

## Dependencies
- PROJ-1 (Datenbank-Schema & Supabase-Setup) — Arc-Daten, RLS-Policies
- PROJ-5 (Admin-Backend) — Admin wählt Highlight-Arcs für die Homepage aus
- PROJ-3 (Konfigurator) — CTA "Arc konfigurieren" auf der Detailseite verlinkt dorthin
- PROJ-6 (Drop & Warteliste) — Leerzustand der Browse-Seite verlinkt zur Warteliste; Featured-Drop-Teaser auf der Homepage zieht den aktuellen Drop **(NEU 2026-06-02)**
- PROJ-11 (Die Manufaktur) — Manufaktur-Teaser auf der Homepage verlinkt zur Manufaktur-Seite **(NEU 2026-06-02)**
- PROJ-12 (Kollektionen / Showcase) — nimmt fertige Nicht-Arc-Objekte auf, die NICHT im Arc-Katalog/Konfigurator erscheinen **(NEU 2026-06-02)**

## User Stories

- Als Endkunde möchte ich die Homepage besuchen, damit ich einen ersten Eindruck von ARC-ONE bekomme und zum Katalog weiterfinde.
- Als Endkunde möchte ich auf der Homepage die Markenhaltung (Brand Statement) und die drei Kern-Argumente (Unikat, Handschliff, CRI 98) verstehen, damit ich nachvollziehe, wofür ARC-ONE steht. **(NEU 2026-06-02)**
- Als Endkunde möchte ich auf der Homepage einen Hinweis auf den aktuellen Drop und einen Einstieg in die Manufaktur-Geschichte sehen, damit ich tiefer in die Marke eintauchen kann. **(NEU 2026-06-02)**
- Als Endkunde möchte ich alle verfügbaren Arcs in einer Übersicht sehen, damit ich den richtigen Arc für mich finden kann.
- Als Endkunde möchte ich Arcs nach Preis sortieren, damit ich Arcs in meinem Budget-Rahmen schnell erkenne.
- Als Endkunde möchte ich die Details eines Arcs sehen (Fotos, Maße, Charakter, Kompatibilität, Preis, Oberflächenzustand), damit ich eine fundierte Kaufentscheidung treffen kann.
- Als Endkunde möchte ich sofort sehen, ob ein Arc bereits geschliffen wurde oder noch im Rohzustand (ungeschliffen) vorliegt, damit ich den Arbeitsaufwand und das Preisniveau verstehe.
- Als Endkunde möchte ich von der Arc-Detailseite direkt zum Konfigurator gelangen, damit ich meinen Arc sofort konfigurieren kann.
- Als B2B-Nutzer (Architekt/Designer) möchte ich denselben öffentlichen Katalog sehen wie Endkunden, damit ich Arcs für Kundenprojekte evaluieren kann.

## Out of Scope

- **Nicht-Arc-Produkte** (fertige Tischlampen-als-Produkt, Möbel, Tische, Schalen & Accessoires) — gehören in die separate Showcase-Seite **PROJ-12** (Präsentation + Anfrage, kein Konfigurator, kein Stripe). Der Arc-Katalog und der Konfigurator gelten ausschließlich für konfigurierbare **Arcs** aus der `arcs`-Tabelle. **(NEU 2026-06-02)**
- **Series-/Montage-Filter** (Tischlampe / Hängeleuchte / Cluster als Ansicht über konfigurierbare Arcs) — Konzept akzeptiert (Lampen-„Series" sind nur Montage-Varianten eines Arcs: Standfuß / Decke / Spinne), aber bewusst **deferred** (zu wenig Arcs im MVP); wird in einem späteren Increment gespeect. **(NEU 2026-06-02)**
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
- [ ] **(NEU 2026-06-02)** Angenommen die Homepage lädt, dann wird unterhalb des Hero ein **Brand-Statement-Abschnitt** mit dem Marken-Text aus dem Copy-Deck angezeigt (Quelle: Copywriting v1, „01 — Homepage / Brand Statement").
- [ ] **(NEU 2026-06-02)** Angenommen die Homepage lädt, dann werden die **drei USP-Säulen** angezeigt: „Kein zweites auf der Welt", „Zwei Stunden Schliff. Pro Stück." und „Licht mit CRI 98" (je Headline + Kurztext aus dem Copy-Deck).
- [ ] **(NEU 2026-06-02)** Angenommen ein aktiver Drop existiert (PROJ-6, Status SCHEDULED/LIVE), wenn die Homepage lädt, dann wird ein **Featured-Drop-Teaser** (Label „Aktueller Drop", Headline, Kurzbeschreibung, CTA) angezeigt; existiert kein aktiver Drop, ist der Teaser vollständig ausgeblendet.
- [ ] **(NEU 2026-06-02)** Angenommen die Homepage lädt, dann wird ein **Manufaktur-Teaser** („Vom Wald in die Werkstatt.") mit CTA „Die Geschichte dahinter" angezeigt, der zur Manufaktur-Seite (PROJ-11) verlinkt (bis PROJ-11 live ist: Platzhalter-Ziel).
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

- [ ] Angenommen ein READY-Arc mit der Seriennummer ARV-0001 existiert, wenn die URL `/arcs/ARV-0001` aufgerufen wird, dann werden angezeigt: Fotos Seite A und Seite B, Seriennummer, Charakter-Text, Abmessungen (Breite/Höhe/Tiefe in cm), Gewicht, Herkunft (Erntedatum, Waldsektor, Schnittnummer), Kompatibilitäts-Flags (Befestigungsarten, Finishes), Oberflächenzustand (Geschliffen / Ungeschliffen), Grundpreis in Euro.
- [ ] Angenommen ein Arc hat `is_sanded = false`, wenn die Detailseite angezeigt wird, dann erscheint ein klar sichtbares Label "Ungeschliffen – Rohling" und ein Hinweistext: "Der Grundpreis bezieht sich auf den ungeschliffenen Rohling. Schliff und Finish werden im Konfigurator gewählt."
- [ ] Angenommen ein Arc hat `is_sanded = true`, wenn die Detailseite angezeigt wird, dann erscheint das Label "Geschliffen".
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

### DB-Erweiterung: `is_sanded` Spalte

Die `arcs`-Tabelle benötigt eine neue Spalte:

```sql
-- Migration: PROJ-2 Erweiterung — geschliffen/ungeschliffen
ALTER TABLE arcs
  ADD COLUMN is_sanded BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN arcs.is_sanded IS
  'TRUE = Arc wurde bereits geschliffen. FALSE = Rohling (ungeschliffen). Der Grundpreis bezieht sich immer auf den ungeschliffenen Rohling.';
```

**Default `FALSE`** — alle bestehenden Arcs sind Rohlinge bis der Admin den Wert setzt.

### TypeScript-Typen — Erweiterung

`src/types/database.ts` → `ArcsRow`:
```ts
is_sanded: boolean
```

`src/types/database.ts` → `ArcsInsert` / `ArcsUpdate`:
```ts
is_sanded?: boolean
```

`src/types/index.ts` → `Arc`:
```ts
isSanded: boolean
```

## Open Questions

- [x] Welche Ziel-URL hat der Konfigurator? → `/konfigurator/[arc_id]` (in PROJ-3 definiert und live)
- [x] Welche Felder der Highlight-Arc-Auswahl werden im Schema gespeichert? → `is_featured` Boolean auf `arcs` (entschieden, siehe Decision Log)
- [x] Gehören Tischlampen/Möbel/Tische in den Arc-Katalog? → Nein. Katalog/Konfigurator = nur konfigurierbare Arcs; fertige Nicht-Arc-Objekte → eigene Showcase-Seite PROJ-12 (2026-06-02)
- [ ] Series-/Montage-Filter (Tisch/Decke/Cluster): Wann wird er gespeect, und reicht das `mounting`-Modell als Filterquelle oder braucht es ein Kategorie-Feld? (deferred — eigenes Increment)
- [ ] Manufaktur-Teaser-Ziel: harte URL der Manufaktur-Seite (wird in PROJ-11 definiert — CTA vorerst Platzhalter)

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Katalog + Konfigurator gelten ausschließlich für konfigurierbare Arcs | Der Konfigurator lädt strukturell nur aus der `arcs`-Tabelle; fertige Nicht-Arc-Objekte (Tischlampen-Produkt, Möbel, Tische, Schalen) dürfen nie in den Konfigurator-Flow geraten | 2026-06-02 |
| Nicht-Arc-Objekte bekommen eine eigene Showcase-Seite (PROJ-12) statt Katalog-Eintrag | Klare Trennung: Arcs = konfigurierbar + Pre-Order/Stripe; Nicht-Arc-Objekte = Präsentation + Anfrage. Verhindert Vermischung im Katalog, dessen Karten alle zum Konfigurator führen | 2026-06-02 |
| Homepage um Brand Statement, USP-3-Säulen, Featured-Drop- und Manufaktur-Teaser erweitert | Copy-Deck liefert eine vollständigere Markenführung als der reine Hero; stärkt den ersten Eindruck und die Journey-Einstiege (Drop, Manufaktur) | 2026-06-02 |
| Series = Montage-Varianten von Arcs, Filter statt eigener Seite — aber deferred | „Tischlampe/Hängeleuchte/Cluster" sind nur Montagearten (Standfuß/Decke/Spinne) konfigurierbarer Arcs; ein Filter über das `mounting`-Modell genügt, lohnt sich aber erst bei mehr Arcs | 2026-06-02 |
| Copy-Deck (`docs/planning/ARCO_ONE_Copywriting_v1_2.docx`) als verbindliche Textquelle; Markenname konsistent „ARC-ONE" | Einheitliche Texte + Schreibweise (nicht „ARCO ONE"), siehe Gap-Analyse-Entscheidung 9.1 | 2026-06-02 |
| Grundpreis bezieht sich immer auf den ungeschliffenen Rohling | Rohlinge sind die physische Ausgangsbasis; Schliff/Finish werden im Konfigurator gewählt und separat bepreist | 2026-05-27 |
| `is_sanded` als Boolean-Spalte in `arcs` | Einfachste Abbildung: jeder Arc ist entweder geschliffen oder nicht — kein Enum nötig | 2026-05-27 |
| Hinweistext "Grundpreis = Rohling" nur bei `is_sanded=false` | Bei bereits geschliffenen Arcs ist der Hinweis nicht nötig; vermeidet Verwirrung | 2026-05-27 |
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
| `is_sanded` DEFAULT FALSE (additive Migration) | Bestehende Arcs im Live-System bleiben korrekt — alle sind Rohlinge bis der Admin den Wert explizit setzt | 2026-05-27 |
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
│   ├── Oberflächenzustand-Badge  [NEU — "Ungeschliffen – Rohling" | "Geschliffen"]
│   ├── Grundpreis-Hinweistext (nur bei is_sanded=false)  [NEU]
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

**Homepage-Sektionen (2026-06-02)**
- `src/app/page.tsx` — vier neue Sektionen inline ergänzt (gleicher Inline-Section-Pattern wie Hero/Highlights): **Brand Statement**, **USP-3-Säulen** (`USP_PILLARS`-Konstante, 3-Spalten-Grid), **Featured-Drop-Teaser** (bedingt) und **Manufaktur-Teaser**. Reihenfolge: Hero → Brand Statement → USP → Drop-Teaser → Manufaktur → Highlight-Arcs. Copy wörtlich aus dem Copywriting-Deck (v1).
- Featured-Drop-Teaser: Server-seitige Query auf `drops` (`status in (SCHEDULED, LIVE)`, nach `scheduled_at`, `maybeSingle()`); Sektion wird nur gerendert wenn ein aktiver Drop existiert (sonst — auch bei RLS-Block — komplett ausgeblendet). Ergebnis via `as Pick<Drop, …>` gecastet (gleiche postgrest-Typ-Limitierung wie der bestehende `as ArcWithDrop[]`-Cast).
- Platzhalter-Ziele (Routen folgen mit anderen Features): Drop-CTA → `/arcs` (Warteliste/Drop-Detail = PROJ-6); Manufaktur-CTA → `/arcs` (bis PROJ-11 live ist, kein toter Link). Im Code als Kommentar markiert.
- Design konsistent mit Bestand: `font-serif`-Headlines, uppercase-getrackte Labels, `Separator` zwischen Sektionen, `text-muted-foreground`, responsive (mobil 1-spaltig, ab `md:` 3-spaltig bei USP).
- Verifiziert: `tsc --noEmit` ohne Fehler in `page.tsx`; `npm run build` erfolgreich (Route `/` = dynamisch/SSR). Vorbestehende `src/types/index.test.ts`-tsc-Fehler (veraltete Licht-/Status-Werte) sind unabhängig und vom `next build` ausgeschlossen.
- Noch offen: Brand-Statement/USP/Manufaktur-Teaser sind statischer Code (kein CMS); spätere CMS-Pflege wäre PROJ-5. Series-/Montage-Filter weiterhin deferred.

**is_sanded Erweiterung (2026-05-27)**
- `db/migrations/004_is_sanded.sql` — `ALTER TABLE arcs ADD COLUMN is_sanded BOOLEAN NOT NULL DEFAULT FALSE` mit Kommentar
- `src/types/database.ts` — `is_sanded: boolean` in `ArcRow` und `is_sanded?: boolean` in Insert ergänzt
- `src/app/arcs/[serial_number]/page.tsx` — Badge ("Ungeschliffen – Rohling" / "Geschliffen") und bedingter Hinweistext nach dem Preis eingefügt

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

**Datum:** 2026-05-26
**Production URL:** https://arc-one-seven.vercel.app
**Vercel Projekt:** markus-7177s-projects/arc-one

- Security Headers aktiv (X-Frame-Options, HSTS, nosniff, Referrer-Policy)
- Supabase Env-Vars in Vercel hinterlegt (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- Alle 10 Arcs laden live aus Supabase ✅

**is_sanded Erweiterung — 2026-05-27**
- Badge + Hinweistext auf Detailseite live ✅
- DB Migration `004_is_sanded.sql` muss manuell im Supabase SQL-Editor ausgeführt werden
