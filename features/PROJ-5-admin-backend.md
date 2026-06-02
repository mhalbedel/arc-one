# PROJ-5: Admin-Backend (verstecktes CMS)

## Status: In Progress
**Created:** 2026-06-02
**Last Updated:** 2026-06-02

> Verstecktes CMS unter `/admin` fuer das Manufaktur-Team (1-3 Personen). MVP-Kern: Auth-Gate + Arc-Verwaltung + Bestellverwaltung + Pflege der zentralen Preismatrix (Uebergabe aus PROJ-3a). Drop-/Warteliste- und B2B-Verwaltung kommen mit ihren eigenen Features (PROJ-6/7/8).

## Dependencies
- **PROJ-1** — Supabase Auth, `admin_profiles`, `arcs`-Tabelle, `arcs-media` Bucket, RLS (Admin-Schreibrechte)
- **PROJ-2** — Arc-Katalog (zeigt `READY`-Arcs, die der Admin veroeffentlicht)
- **PROJ-3** — Konfigurator (setzt `RESERVED`)
- **PROJ-3a** — Preismatrix (`pricing_rules` + `pricing_settings`) — PROJ-5 baut deren Pflege-UI
- **PROJ-4** — Pre-Order & Stripe (Bestellungen, die der Admin verwaltet)

## User Stories
- Als Admin moechte ich mich ueber E-Mail+Passwort am versteckten `/admin`-Bereich anmelden, damit nur das Manufaktur-Team Zugriff hat.
- Als Admin moechte ich einen neuen Arc inkl. Fotos in unter 10 Minuten erfassen und veroeffentlichen, damit er im Katalog erscheint.
- Als Admin moechte ich bestehende Arcs bearbeiten (Eigenschaften, Kompatibilitaet, Status, Medien), damit ich Korrekturen vornehmen kann.
- Als Admin moechte ich nicht mehr benoetigte Arcs archivieren, damit sie aus dem Katalog verschwinden, ohne die Bestell-Historie zu verlieren.
- Als Admin moechte ich alle Bestellungen einsehen und ihren Status pflegen (bestaetigen, Produktion, Versand, stornieren) sowie Notizen hinterlegen, damit ich Pre-Orders durch den Manufaktur-Prozess fuehren kann.
- Als Admin moechte ich die zentrale Preismatrix und die Groessen-/Gewichtsgrenzen pflegen, damit die Aufpreise im Konfigurator korrekt berechnet werden.

## Out of Scope
- **Rollen-Gating** (VIEWER/EDITOR/SUPER_ADMIN mit unterschiedlichen Rechten) — v1: voller Zugriff fuer alle eingeloggten Admins; Gating als spaetere Erweiterung. Rollen bleiben im Datenmodell (PROJ-1).
- **Direkte Stripe-Aktionen** (Refund ausloesen, Restzahlung per API anfordern) — laufen in v1 ueber das Stripe-Dashboard; spaetere Automatisierung ggf. PROJ-7. Zahlungs-Status (Deposit/Rest) kommen weiterhin aus den Stripe-Webhooks (PROJ-4).
- **Drop- & Warteliste-Verwaltung** — PROJ-6.
- **E-Mail-Versand bei Admin-Aktionen** (z.B. Bestaetigungsmail) — PROJ-7.
- **B2B-Account-Freigabe, Projekt-Verwaltung, CAD-Upload (`b2b-cad`)** — PROJ-8.
- **Hartes Loeschen von Arcs** — nur Archivieren (Status `ARCHIVED`).
- **Admin-Benutzerverwaltung in der UI** (neue Admins anlegen) — via Supabase Dashboard (PROJ-1-Muster).
- **2FA / erweiterte Login-Sicherheit** — v1 nur E-Mail+Passwort.
- **Analytics-/Reporting-Dashboard** — v1 nur Navigation + grobe Zaehlungen.
- **Preishistorie / Versionierung** — nicht v1 (analog PROJ-3a); Bestellungen behalten ihren Preis-Snapshot.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Authentifizierung & Zugriff
- [ ] Angenommen ein nicht eingeloggter Besucher, wenn er `/admin` oder eine Unterseite aufruft, dann wird er zur Login-Seite umgeleitet und sieht keine Admin-Inhalte.
- [ ] Angenommen ein Admin gibt korrekte E-Mail+Passwort ein, wenn er sich anmeldet, dann gelangt er zum Admin-Dashboard.
- [ ] Angenommen falsche Zugangsdaten, wenn der Admin sich anmeldet, dann erscheint eine Fehlermeldung und kein Zugriff wird gewaehrt.
- [ ] Angenommen ein eingeloggter Nutzer ohne Admin-Rolle (z.B. B2B), wenn er `/admin` aufruft, dann wird der Zugriff verweigert.
- [ ] Angenommen ein eingeloggter Admin, wenn er auf "Abmelden" klickt, dann wird die Session beendet und er landet auf der Login-Seite.
- [ ] Angenommen kein oeffentlicher Link verweist auf `/admin`, wenn ein Endkunde die Website nutzt, dann findet er keinen sichtbaren Einstieg ins Backend.

### Dashboard / Startseite
- [ ] Angenommen der Admin ist eingeloggt, wenn er das Dashboard oeffnet, dann sieht er die Navigation zu Arcs, Bestellungen und Preismatrix sowie grobe Zaehlungen (z.B. Anzahl `READY`-Arcs, offene Bestellungen).

### Arc-Verwaltung
- [ ] Angenommen der Admin ist eingeloggt, wenn er die Arc-Liste oeffnet, dann sieht er alle Arcs (jeden Status) mit Seriennummer, Status und Vorschaubild.
- [ ] Angenommen der Admin fuellt alle Pflichtfelder (Seriennummer, Basispreis, Maße) aus und laedt zwei Fotos hoch, wenn er speichert, dann wird ein neuer Arc angelegt und erscheint in der Liste.
- [ ] Angenommen ein Pflichtfeld fehlt, wenn der Admin speichert, dann wird pro fehlendem Feld eine Validierungsmeldung angezeigt und nichts gespeichert.
- [ ] Angenommen die Seriennummer existiert bereits, wenn der Admin speichert, dann wird der Vorgang mit einer eindeutigen Fehlermeldung abgelehnt (Unique-Constraint).
- [ ] Angenommen der Admin bearbeitet einen bestehenden Arc, wenn er speichert, dann werden die neuen Werte uebernommen und sind sofort sichtbar.
- [ ] Angenommen der Admin setzt den Status eines Arcs auf `READY`, wenn er speichert, dann ist der Arc im oeffentlichen Katalog sichtbar.
- [ ] Angenommen das Status-Dropdown bietet alle 9 Status, wenn der Admin einen beliebigen Wert waehlt und speichert, dann wird dieser Status uebernommen.
- [ ] Angenommen der Admin archiviert einen Arc, wenn er bestaetigt, dann erhaelt der Arc Status `ARCHIVED`, verschwindet aus dem Katalog, bleibt aber in der DB und fuer verknuepfte Bestellungen erhalten.

### Medien-Upload
- [ ] Angenommen der Admin waehlt Foto Seite A und Seite B, wenn er hochlaedt, dann landen die Dateien im `arcs-media` Bucket und die Bild-URLs werden am Arc gespeichert.
- [ ] Angenommen der Admin laedt eine optionale `.glb`-Datei hoch, wenn der Upload erfolgreich ist, dann wird die Scan-URL gespeichert und im 3D-Viewer nutzbar.
- [ ] Angenommen ein Upload schlaegt fehl (Netzwerk/ungueltiges Format), wenn der Admin speichert, dann erscheint eine Fehlermeldung und die uebrigen Eingaben bleiben erhalten.
- [ ] Angenommen ein bestehendes Foto wird durch ein neues ersetzt, wenn der Admin speichert, dann zeigt der Arc das neue Bild.

### Bestellverwaltung
- [ ] Angenommen der Admin ist eingeloggt, wenn er die Bestell-Liste oeffnet, dann sieht er alle Bestellungen mit Bestellnummer, Kunde, Arc, Gesamtpreis, Status und Zahlungsstatus.
- [ ] Angenommen eine Bestellung existiert, wenn der Admin sie oeffnet, dann sieht er die vollstaendigen Details: Kunde + Adresse, Konfigurations-Snapshot, Preis-Aufschluesselung, Zahlungsstatus (Deposit/Rest) und Zeitstempel.
- [ ] Angenommen es gibt noch keine Bestellungen, wenn der Admin die Liste oeffnet, dann sieht er einen aussagekraeftigen Leerzustand statt einer leeren Tabelle.
- [ ] Angenommen der Admin aendert den Bestellstatus (z.B. `CONFIRMED`, `IN_PRODUCTION`, `READY_TO_SHIP`, `SHIPPED`, `DELIVERED`, `CANCELLED`), wenn er speichert, dann wird der neue Status uebernommen und ist in Liste und Detail sichtbar.
- [ ] Angenommen der Admin setzt den Status erstmals auf `CONFIRMED`, wenn er speichert, dann werden `confirmedAt` und `confirmedBy` (Admin-User-ID) gesetzt.
- [ ] Angenommen der Admin schreibt eine Admin-Notiz zu einer Bestellung, wenn er speichert, dann bleibt die Notiz an der Bestellung erhalten und ist beim erneuten Oeffnen sichtbar.

### Preismatrix-Pflege
- [ ] Angenommen der Admin oeffnet die Preismatrix, wenn die Seite laedt, dann sieht er alle ~30 Aufpreise (Schliff/Finish/Befestigung/Licht je Klasse) in Euro sowie die vier Grenzwerte (Groesse klein-max/mittel-max in cm2, Gewicht leicht-max/mittel-max in g).
- [ ] Angenommen der Admin aendert einen Aufpreis und speichert, wenn anschliessend ein Konfigurator geladen wird, dann verwendet die Berechnung den neuen Wert (gleiche `pricing_rules`-Tabelle).
- [ ] Angenommen der Admin setzt die Groessen-/Gewichtsgrenzen, wenn er speichert, dann gelten die neuen Grenzwerte bei der naechsten Klassifizierung.
- [ ] Angenommen der Admin gibt inkonsistente Grenzwerte ein (klein-max >= mittel-max oder leicht-max >= mittel-max), wenn er speichert, dann wird eine Validierungsmeldung angezeigt und nichts gespeichert.
- [ ] Angenommen der Admin gibt einen negativen oder nicht-numerischen Preis ein, wenn er speichert, dann wird die Eingabe abgelehnt.

## Edge Cases
- **Gleichzeitige Bearbeitung:** Zwei Admins bearbeiten denselben Arc bzw. dieselbe Bestellung — letzter Speichervorgang gewinnt (last-write-wins; kein optimistic locking in v1).
- **Manueller System-Status (Arc):** Admin setzt per freiem Dropdown `RESERVED`/`ORDERED`, obwohl keine/eine aktive Reservierung existiert — bewusst erlaubt (vertrautes Team); die UI kennzeichnet diese Status mit einem Hinweis.
- **Bestell-Status vs. Stripe:** Zahlungs-Status (`DEPOSIT_PAID`, `REMAINING_PAID`) werden vom Stripe-Webhook gesetzt. Eine manuelle Statusaenderung kann mit dem Zahlungsstand kollidieren — der Admin sieht den Zahlungsstatus separat als Referenz; bewusst akzeptiert (vertrautes Team).
- **Session-Ablauf waehrend Bearbeitung:** Beim Speichern Redirect zur Login-Seite mit klarer Meldung.
- **Ungueltige/zu grosse Datei:** Typ- und Groessenpruefung vor dem Upload, klare Fehlermeldung.
- **Arc ohne Maße/Gewicht:** Speichern erlaubt, aber Hinweis, dass die Preisklassifizierung auf die kleinste Klasse faellt (PROJ-3a-Fallback).
- **Leere Listen:** Arcs/Bestellungen leer → Empty States statt leerer Tabellen.
- **Unvollstaendige Preismatrix:** Fehlender Wert zaehlt als 0 EUR (PROJ-3a); UI zeigt leere Felder als "nicht gesetzt".
- **Netzwerkfehler beim Speichern:** Fehlermeldung, Formularinhalt bleibt erhalten.

## Technical Requirements
- Auth ueber Supabase Auth (E-Mail+Passwort); alle `/admin`-Routen serverseitig geschuetzt; Rolle aus JWT (`app_metadata.role = 'admin'`).
- Schreibzugriff auf `arcs`, `orders`, `pricing_rules`, `pricing_settings` und den `arcs-media` Bucket nur mit Admin-Session (RLS aus PROJ-1/3a deckt das ab).
- Alle Preise in Cent gespeichert, in Euro angezeigt/eingegeben.
- Keine oeffentlichen Links zum Backend (verstecktes CMS).
- Listen laden < 1 s bei kleinem Datenbestand.

## Open Questions
_Alle Fragen resolved._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| MVP-Scope = Login + Arcs + Bestellungen + Preismatrix; Drops/Warteliste/B2B separat | Single-Responsibility; nur aktuell live-relevante Entitaeten, Rest kommt mit den jeweiligen Features | 2026-06-02 |
| Voller Zugriff fuer alle Admins, Rollen nicht erzwungen | Team 1-3 vertraute Personen; Gating waere Mehraufwand ohne v1-Nutzen | 2026-06-02 |
| Direkter Medien-Upload in der UI | PRD-Ziel "Arc in < 10 Min erfassen"; URL-Einfuegen waere umstaendlich | 2026-06-02 |
| Freies Status-Dropdown fuer Arcs (alle 9 Werte) | Maximale Flexibilitaet fuer vertrautes Team; einfacher als gefuehrte Uebergaenge | 2026-06-02 |
| Bestellungen voll verwaltbar (Status, Notizen, Bestaetigen), aber keine direkten Stripe-Aktionen | Admin fuehrt Pre-Orders durch den Manufaktur-Prozess; Refund/Restzahlung bleiben im Stripe-Dashboard, Zahlungsstatus kommt aus Webhooks (PROJ-4) | 2026-06-02 |
| Arcs archivieren statt loeschen | Schuetzt Bestell-Historie (FK); kein destruktiver Datenverlust | 2026-06-02 |
| Verstecktes CMS ohne oeffentliche Links | PRD: "verstecktes CMS"; Zugang nur ueber direkte URL + Auth | 2026-06-02 |
| Keine Admin-User-Verwaltung in der UI | Neue Admins via Supabase Dashboard (PROJ-1-Muster) | 2026-06-02 |
| Dashboard = Navigation + grobe Zaehlungen, kein Analytics | Kleines Team, MVP; Reporting ist kein v1-Bedarf | 2026-06-02 |
| Arc-Pflichtfelder: Seriennummer, Basispreis, Maße; Rest optional | Maße werden fuer die Preisklassifizierung gebraucht; Herkunfts-/Charakterfelder sind kuratierend und duerfen spaeter folgen | 2026-06-02 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Admin-Gating ueber Mitgliedschaft in `admin_profiles` (Lookup per `auth_user_id`), nicht ueber JWT-`app_metadata.role` | Tabelle existiert bereits (PROJ-1); kein Auth-Hook/Custom-Claims-Setup noetig (einfacher). Ersetzt die `app_metadata.role`-Formulierung aus den Technical Requirements der Spec. | 2026-06-02 |
| Schutz zweistufig: `middleware.ts` (Session-Refresh + Redirect unauth → Login) + Admin-Layout (Server Component prueft `admin_profiles`) | Standard-Supabase-SSR-Muster; das in `server.ts` bereits erwartete Middleware existiert noch nicht und wird hier eingefuehrt | 2026-06-02 |
| Medien-Upload direkt vom Browser in den `arcs-media` Bucket (authentifizierter Supabase-Client), nicht durch eine API-Route | Vermeidet das Durchschleusen grosser Dateien durch Serverless-Funktionen; erfuellt PRD-Ziel "Arc in < 10 Min"; RLS aus PROJ-1 erlaubt Admin-Schreibrechte | 2026-06-02 |
| Schreib-/Leseoperationen ueber den cookie-gebundenen Server-Client + Server Actions, NICHT ueber den Service-Role-Client | RLS bleibt die Sicherheitsgrenze; Service-Role wuerde RLS umgehen. Service-Role bleibt reserviert fuer den Stripe-Webhook (PROJ-4-Uebergang) | 2026-06-02 |
| Preismatrix-Bearbeitung als Upsert auf bestehende `pricing_rules`/`pricing_settings` (gleiche Tabellen wie PROJ-3a) | Konfigurator liest dieselben Tabellen; keine zweite Quelle der Wahrheit | 2026-06-02 |
| Eingabe/Anzeige aller Preise in Euro, Speicherung in Cent (Konvertierung in der UI-Schicht) | Konsistent mit PROJ-3a/PROJ-4 (`price_cents`, `base_price` in Cent) | 2026-06-02 |
| Keine neuen npm-Pakete | Alle benoetigten shadcn-Komponenten (table, form, dialog, alert-dialog, select, tabs, sonner) sind installiert; Supabase-JS deckt Upload ab | 2026-06-02 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Ueberblick
PROJ-5 baut die Bedienoberflaeche fuer ein Datenmodell, das **bereits vollstaendig existiert** (PROJ-1/3a/4). Es wird kein neues DB-Schema angelegt — die Arbeit ist (1) ein Auth-Tor, (2) Verwaltungs-Oberflaechen fuer Arcs, Bestellungen und Preismatrix. Es ist die erste Funktion mit echtem Login.

### A) Seiten- & Komponentenstruktur

```
/admin  (geschuetzter Bereich — verstecktes CMS, keine oeffentlichen Links)
+-- /admin/login                 Login-Formular (E-Mail + Passwort)
|
+-- Admin-Layout (Server)        prueft Admin-Mitgliedschaft, sonst Redirect
|   +-- Seitennavigation         Arcs · Bestellungen · Preismatrix · Abmelden
|
+-- /admin  (Dashboard)
|   +-- Zaehl-Karten             z.B. "READY-Arcs", "offene Bestellungen"
|   +-- Navigations-Kacheln      Einstieg in die drei Bereiche
|
+-- /admin/arcs  (Arc-Verwaltung)
|   +-- Arc-Tabelle              alle Status; Seriennr. · Status-Badge · Vorschaubild
|   +-- "Neuer Arc"-Button
|   +-- /admin/arcs/neu          Arc-Formular (anlegen)
|   +-- /admin/arcs/[id]         Arc-Formular (bearbeiten)
|       +-- Stammdaten           Seriennummer, Maße, Gewicht, Charakter, Herkunft
|       +-- Status-Dropdown      alle 9 Status (mit Hinweis bei RESERVED/ORDERED)
|       +-- Kompatibilitaet      Befestigung/Finish-Schalter, max. Spinnen-Pendants
|       +-- Medien-Upload        Foto A · Foto B · optional .glb (3D-Scan)
|       +-- Basispreis (EUR)
|       +-- Archivieren-Aktion   Bestaetigungsdialog → Status ARCHIVED
|
+-- /admin/bestellungen  (Bestellverwaltung)
|   +-- Bestell-Tabelle          Nr. · Kunde · Arc · Gesamtpreis · Status · Zahlung
|   +-- Leerzustand              aussagekraeftige Meldung statt leerer Tabelle
|   +-- /admin/bestellungen/[id] Bestell-Detail
|       +-- Kunde + Adresse
|       +-- Konfigurations-Snapshot (read-only)
|       +-- Preis-Aufschluesselung
|       +-- Zahlungsstatus       Deposit/Rest — read-only Referenz (aus Stripe)
|       +-- Status-Dropdown      Bestellstatus aendern (setzt confirmedAt/By)
|       +-- Admin-Notiz          Freitextfeld, gespeichert an der Bestellung
|
+-- /admin/preismatrix  (Preismatrix-Pflege)
    +-- Aufpreis-Tabelle         ~30 Werte (Schliff/Finish/Befestigung/Licht je Klasse), EUR
    +-- Grenzwert-Felder         Groesse klein-/mittel-max (cm2), Gewicht leicht-/mittel-max (g)
    +-- Speichern                Validierung (konsistente Grenzwerte, keine negativen Preise)
```

Wiederverwendete shadcn-Bausteine (alle bereits installiert): `table`, `form`, `input`, `textarea`, `select`, `dialog`, `alert-dialog`, `tabs`, `badge`, `button`, `sonner` (Toasts). Keine neuen UI-Komponenten von Grund auf.

### B) Datenmodell (Klartext — existiert bereits, PROJ-5 schreibt nur)

```
Arc (Tabelle arcs)            — wird von der Arc-Verwaltung gepflegt
  Pflicht: Seriennummer (eindeutig), Basispreis (Cent), Maße (B/H/T), Gewicht
  Optional: Charakter-Text, Herkunft (Datum/Waldabschnitt/Schnittnr.),
            3 Medien-URLs (Foto A, Foto B, 3D-Scan)
  Schalter: Kompatibilitaet (Befestigung/Finish), max. Spinnen-Pendants
  Status: einer von 9 Werten (RAW … READY … ARCHIVED)

Bestellung (Tabelle orders)   — Status + Notiz + Bestaetigung pflegbar; Rest read-only
  Lesefelder: Bestellnr., Konfig-Snapshot (JSON), Preis-Aufschluesselung,
              Zahlungs-Zeitstempel (deposit_paid_at / remaining_paid_at)
  Schreibfelder (Admin): status, admin_notes, confirmed_at, confirmed_by
  Verknuepft: customer (Kunde + Adresse als JSON)

Preismatrix (Tabellen pricing_rules + pricing_settings) — dieselben wie PROJ-3a
  pricing_rules: je (Komponente, Variante, Klasse) ein Aufpreis in Cent
  pricing_settings: 4 Grenzwerte (Groesse/Gewicht) fuer die Klassifizierung

Admin (Tabelle admin_profiles) — nur gelesen fuers Gating (auth_user_id → Mitglied?)

Medien: Supabase Storage Bucket arcs-media (Fotos + .glb)
```

Speicherort: durchgehend Supabase (PostgreSQL + Storage). Kein localStorage, keine zweite Datenquelle.

### C) Auth & Schutz (WAS und WARUM)

- **Login:** Supabase Auth mit E-Mail + Passwort auf `/admin/login`. Admins werden vorab im Supabase-Dashboard angelegt (kein Self-Signup, keine User-Verwaltung in der UI).
- **Wer ist Admin?** Statt einer JWT-Rolle pruefen wir die **Mitgliedschaft in `admin_profiles`** (Zeile mit passender `auth_user_id`). Grund: Die Tabelle existiert bereits; das spart das Einrichten von Custom-JWT-Claims (einfacher, weniger bewegliche Teile). Dies ersetzt die `app_metadata.role`-Formulierung in den Technical Requirements der Spec.
- **Zwei Schutzebenen:**
  1. `middleware.ts` (neu) frischt die Supabase-Session bei jedem Request auf und leitet nicht eingeloggte Besucher von `/admin/*` zur Login-Seite um. (Diese Middleware wird von `server.ts` bereits erwartet, fehlte aber.)
  2. Das **Admin-Layout** (Server Component) prueft die `admin_profiles`-Mitgliedschaft — ein eingeloggter Nicht-Admin (z.B. spaeteres B2B-Konto) wird abgewiesen.
- **Schreibrechte:** Alle Schreibvorgaenge laufen ueber den **cookie-gebundenen Server-Client** (Server Actions), damit die **RLS aus PROJ-1/3a die Sicherheitsgrenze bleibt**. Der Service-Role-Client (RLS-Bypass) wird hier bewusst NICHT verwendet.
- **Versteckt:** Keine oeffentlichen Links auf `/admin`; Zugang nur ueber direkte URL + Login.

### D) Server-Aktionen (Was passiert, keine Implementierung)

| Aktion | Ergebnis |
|--------|----------|
| Anmelden / Abmelden | Supabase-Session setzen/beenden |
| Arc anlegen / bearbeiten | Upsert in `arcs`; Eindeutigkeit der Seriennummer durch DB-Constraint |
| Arc archivieren | Status → `ARCHIVED` (kein Loeschen, FK-Schutz fuer Bestellungen) |
| Medien hochladen | Datei → `arcs-media` Bucket; resultierende URL am Arc speichern |
| Bestellstatus aendern | `orders.status` setzen; bei erstem `CONFIRMED` → `confirmed_at` + `confirmed_by` |
| Admin-Notiz speichern | `orders.admin_notes` aktualisieren |
| Preismatrix speichern | Upsert `pricing_rules`/`pricing_settings` nach Validierung |

### E) Abhaengigkeiten (Pakete)
**Keine neuen Pakete.** Alle shadcn-Komponenten sind installiert; `@supabase/ssr` und `@supabase/supabase-js` (inkl. Storage-Upload) sind vorhanden.

### Offene Punkte aus dieser Design-Phase
- Spec-Formulierung "Rolle aus JWT (`app_metadata.role = 'admin'`)" in den Technical Requirements ist durch die `admin_profiles`-Mitgliedschaftspruefung ersetzt (siehe Technical Decisions). Keine Aenderung am Datenmodell noetig.

## Implementation Notes (Frontend — /frontend)

**Status:** Frontend komplett gebaut, Build gruen (`npm run build` ok). Backend-/QA-Schritt steht noch aus.

### Gebaute Dateien
- **Auth-Gate:** `src/proxy.ts` (erweitert — Next.js 16 nutzt die `proxy`-Konvention statt `middleware`; Redirect unauth `/admin/*` → `/admin/login`). `src/app/admin/login/page.tsx` (E-Mail+Passwort, Browser-Client). `src/app/admin/(dashboard)/layout.tsx` (Server-Gate: prueft `admin_profiles`-Mitgliedschaft, sonst Redirect `?denied=1`).
- **Shell + Dashboard:** `src/components/admin/admin-shell.tsx` (shadcn-Sidebar, sans-serif/dicht, mountet sonner-`Toaster`). `src/app/admin/(dashboard)/page.tsx` (Zaehl-Karten READY/Reserviert/offene Bestellungen + Nav-Kacheln).
- **Arcs:** `arcs/page.tsx` (Tabelle), `arcs/neu` + `arcs/[id]` (Formular), `arcs/actions.ts` (`saveArc`/`archiveArc`), `components/admin/arc-form.tsx`, `components/admin/arc-status-badge.tsx`.
- **Bestellungen:** `bestellungen/page.tsx` (Tabelle + Leerzustand), `bestellungen/[id]/page.tsx` (Detail), `bestellungen/actions.ts` (`updateOrderStatus`/`saveAdminNotes`), `components/admin/order-editor.tsx`, `components/admin/order-status-badge.tsx`.
- **Preismatrix:** `preismatrix/page.tsx`, `preismatrix/actions.ts` (`savePricing`), `components/admin/pricing-editor.tsx`.
- **Sonstiges:** `site-header.tsx` versteckt die oeffentliche Navigation auf `/admin/*`.

### Abweichungen / wichtige Entscheidungen
- **`proxy.ts` statt neuer `middleware.ts`:** Das Projekt hatte unter Next.js 16 bereits `src/proxy.ts` (Session-Refresh). Der Admin-Redirect wurde dort ergaenzt; der urspruenglich angelegte `middleware.ts`-Entwurf wurde wieder entfernt (Konvention-Konflikt).
- **Kompatibilitaet = `blocked_options` (Opt-out), nicht `compat_*`:** Das Arc-Formular pflegt `blocked_options` — die Spalte, die der Konfigurator tatsaechlich liest. Die `compat_*`-Flags sind deprecated und ohne Wirkung; sie zu editieren waere ein stiller No-op gewesen.
- **Arc-Pflichtfelder folgen den DB-`NOT NULL`-Spalten:** Seriennummer, Basispreis, Breite/Hoehe/Tiefe, Gewicht. `character` ist im UI optional (wird als `''` gesendet). Der Spec-Edge-Case „Speichern ohne Maße/Gewicht" ist durch die DB-`NOT NULL`-Constraints faktisch ausgeschlossen.
- **Order-Status-Dropdown** bietet alle 9 `order_status`-Werte (deutsche Labels). `confirmed_at`/`confirmed_by` (= `auth.users`-ID) werden nur beim erstmaligen `CONFIRMED` gesetzt. Zahlungsstatus bleibt read-only (Stripe-Webhook).
- **Preismatrix-Speichern:** Update-by-id fuer bestehende Regeln + Insert fuer fehlende (kein `onConflict`-Upsert, da der Unique-Index `COALESCE(variant,'')` nutzt). Gleiche `pricing_rules`/`pricing_settings`-Tabellen wie PROJ-3a.
- **Denied-Feedback:** Eingeloggter Nicht-Admin wird mit sichtbarer Meldung „Dieses Konto hat keinen Admin-Zugriff." abgewiesen (statt stiller Redirect-Schleife).

### Voraussetzungen fuers Funktionieren (Setup, nicht Code) — fuer /backend zu verifizieren
1. **Admin-User:** `auth.users` mit `app_metadata.role = 'admin'` **und** passende `admin_profiles`-Zeile (`auth_user_id`). Die RLS auf `admin_profiles` erlaubt SELECT nur via `is_admin()` (JWT-Rolle) — d.h. die JWT-Rolle ist Pflicht, sowohl fuers Gate als auch fuer alle Schreibvorgaenge (arcs/orders/pricing nutzen alle `is_admin()`). Ersetzt die offene Frage aus der Design-Phase: Gate via `admin_profiles` funktioniert nur **zusammen** mit gesetzter JWT-Rolle.
2. **Storage:** Bucket `arcs-media` (public) + Policies (`select` public, `insert`/`update` mit `is_admin()`) — in `db/schema.sql` noch auskommentiert; muss in Supabase angelegt werden, sonst schlaegt der Medien-Upload fehl.

### Offen / Handoff
- **Backend:** RLS/Setup gemaess obiger Voraussetzungen verifizieren (JWT-Rolle, Storage-Policies). Schreibpfade laufen ueber den cookie-gebundenen Server-Client (Server Actions), RLS bleibt Sicherheitsgrenze — kein Service-Role.
- **QA:** E2E gegen die Test-Supabase erfordert, dass `tests/global-setup.ts` einen Test-Admin (User + `app_metadata.role` + `admin_profiles`) seedet; ggf. `arcs-media`-Bucket. Keine neuen Env-Vars noetig.

## Implementation Notes (Backend — /backend)

**Status:** Datenschicht verifiziert, Build gruen (`npm run build`), Validierungs-Tests gruen (7/7). Naechster Schritt: `/qa`.

### Befund: kein neues Schema, kein API-Layer noetig
Das Datenmodell existiert vollstaendig (PROJ-1/3a/4). Alle Admin-Mutationen laufen
wie in der Tech-Design-Phase entschieden ueber **Server Actions** mit dem
cookie-gebundenen Server-Client — keine `/api`-Routen. RLS bleibt die
Sicherheitsgrenze. Verifizierte Pfade: `arcs/actions.ts` (`saveArc`/`archiveArc`),
`bestellungen/actions.ts` (`updateOrderStatus`/`saveAdminNotes`),
`preismatrix/actions.ts` (`savePricing`).

### RLS verifiziert (db/schema.sql)
`arcs`, `orders`, `pricing_rules`, `pricing_settings`, `admin_profiles` haben je
eine `FOR ALL USING (is_admin()) WITH CHECK (is_admin())`-Policy. `is_admin()`
liest `auth.jwt() -> app_metadata ->> role = 'admin'`. Public-Read-Policies
(READY-Arcs, pricing_*) bleiben unveraendert. Keine RLS-Aenderung noetig.

### Geschlossene Luecke: Storage-Bucket `arcs-media`
Bucket + Policies lagen in `schema.sql` nur auskommentiert vor — Medien-Upload
haette in jeder frischen DB fehlgeschlagen. Neu: **`db/migrations/009_arcs_media_storage.sql`**
legt den public Bucket an und setzt `storage.objects`-Policies: public SELECT,
`is_admin()` fuer INSERT **und** UPDATE (das Arc-Formular nutzt `upsert: true`).
`schema.sql` verweist jetzt auf die Migration. **Aktion fuer Deploy/QA:** Migration 009
in Supabase ausfuehren, sonst schlaegt der Upload fehl.

### Bestaetigt: Admin-Gate braucht BEIDES (JWT-Rolle + Profil-Zeile)
Das Layout gated ueber eine `admin_profiles`-SELECT — die RLS dort verlangt aber
selbst `is_admin()` (JWT-Rolle). Korrekt sicher: ein eingeloggter Nicht-Admin
bekommt keine Zeile und wird mit `?denied=1` abgewiesen. Operativ heisst das: ein
Admin-User braucht `app_metadata.role='admin'` **und** eine `admin_profiles`-Zeile
(`auth_user_id`). `db/seed.sql` dokumentiert beide Schritte bereits. Die
Tech-Design-Annahme "Gate ohne JWT-Claims" trifft damit nicht zu — keine
Sicherheitsluecke, nur ein Setup-Hinweis (kein RLS-Change ohne Freigabe).

### Validierung getestet
`preismatrix`-Validierung (Grenzwert-Konsistenz, nicht-negative Ganzzahl-Preise)
aus dem `'use server'`-File in `preismatrix/validation.ts` extrahiert (dort nur
async Exports erlaubt) und mit `validation.test.ts` abgedeckt: konsistente Grenzen,
Preis 0, Grenzwert <= 0, klein-max >= mittel-max, leicht-max >= mittel-max,
negativer/nicht-ganzzahliger Preis. 7/7 gruen. Types werden aus `actions.ts`
re-exportiert (kein Aufruferwechsel noetig).

### Abweichungen / Hinweise
- Keine neuen npm-Pakete (wie geplant).
- Keine Server-Action-Integrationstests: die Mutationen brauchen eine live
  authentifizierte Supabase-Session + RLS; das deckt `/qa` per E2E mit
  geseedetem Test-Admin ab (siehe Frontend-Handoff). Unit-getestet wurde die
  pure Logik (Preis-Validierung).

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
