# PROJ-3: Konfigurator

## Status: Deployed
**Created:** 2026-05-26
**Last Updated:** 2026-06-01

> **Refinement (2026-06-01) — Planned, noch nicht implementiert:** Neue Optionen "Ohne Befestigung" und "Ohne Licht". Betroffene Acceptance Criteria sind mit **(NEU 2026-06-01)** markiert. Nächster Schritt: `/frontend`.

## Dependencies
- PROJ-1 (Datenbank-Schema & Supabase-Setup) — `arcs`-Tabelle, Reservierungsfelder (`reserved_until`, `reserved_by`), neue Aufpreis-Spalten
- PROJ-2 (Arc-Katalog) — CTA "Arc konfigurieren" auf der Detailseite verlinkt hierher
- PROJ-4 (Pre-Order & Stripe) — Konfigurator leitet nach erfolgreicher Reservierung zum Checkout weiter

## User Stories

- Als Endkunde möchte ich meinen Arc Schritt für Schritt konfigurieren (ggf. Schliff, Befestigung, ggf. Finish, Licht), damit ich ein auf meine Bedürfnisse abgestimmtes Angebot erhalte.
- Als Endkunde möchte ich bei einem Rohling wählen können, ob er geschliffen werden soll, damit ich den Oberflächenzustand meines Arcs bestimme.
- Als Endkunde möchte ich meinen Arc auch **ohne Befestigung** konfigurieren können, damit ich den Arc selbst montiere oder anderweitig verwende. **(NEU 2026-06-01)**
- Als Endkunde möchte ich meinen Arc auch **ohne Licht** konfigurieren können, damit ich ihn als reines Objekt ohne Leuchtmittel erhalte. **(NEU 2026-06-01)**
- Als Endkunde möchte ich klar sehen, wenn ein Arc bereits geschliffen ist und diese Eigenschaft nicht mehr geändert werden kann.
- Als Endkunde möchte ich den Gesamtpreis nach jeder Auswahl live sehen, damit ich die Kosten vor der Reservierung kenne.
- Als Endkunde möchte ich zwischen den Schritten frei hin- und herwechseln, damit ich meine Konfiguration anpassen kann.
- Als Endkunde möchte ich den konfigurierten Arc für 24 Stunden reservieren, damit ich Zeit habe den Checkout abzuschließen.
- Als Endkunde möchte ich sofort sehen, wenn ein Arc bereits reserviert ist, damit ich keine Zeit mit einer unmöglichen Konfiguration verbringe.

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

- [ ] Angenommen ein Arc mit `is_sanded = false` und Status READY existiert, wenn der Nutzer `/konfigurator/[arc-id]` aufruft, dann wird der Konfigurator mit Schritt 1 (Schliff) geöffnet.
- [ ] Angenommen ein Arc mit `is_sanded = true` und Status READY existiert, wenn der Nutzer `/konfigurator/[arc-id]` aufruft, dann wird der Konfigurator direkt mit Schritt 1 (Befestigung) geöffnet — kein Schliff-Schritt.
- [ ] Angenommen ein Arc ist aktuell reserviert (`reserved_until` in der Zukunft), wenn der Nutzer `/konfigurator/[arc-id]` aufruft, dann wird eine Sperrseite angezeigt — kein Konfigurator.
- [ ] Angenommen ein Arc hat einen anderen Status als READY oder RESERVED, dann wird eine 404-Seite angezeigt.

### Schritt 1 (nur bei `is_sanded = false`): Schliff

- [ ] Angenommen der Arc hat `is_sanded = false`, wenn Schritt 1 angezeigt wird, dann werden genau zwei Optionen angezeigt: "Schleifen lassen" und "Ungeschliffen belassen (Rohling)".
- [ ] Angenommen der Nutzer wählt "Schleifen lassen", wenn er auf "Weiter" klickt, dann erscheint in den Folgeschritten auch der Finish-Schritt.
- [ ] Angenommen der Nutzer wählt "Ungeschliffen belassen", wenn er auf "Weiter" klickt, dann wird der Finish-Schritt übersprungen.
- [ ] Angenommen der Nutzer kehrt auf Schritt 1 zurück und ändert die Schliff-Auswahl, dann werden alle nachfolgenden Auswahlen (Befestigung, Finish, Licht) zurückgesetzt.

### Schritt 1 (bei `is_sanded = true`) / Schritt 2 (bei `is_sanded = false`): Befestigung

- [ ] Angenommen der Befestigungs-Schritt angezeigt wird, dann sind nur die Befestigungsoptionen sichtbar, die der Arc laut Kompatibilitäts-Flags unterstützt.
- [ ] **(NEU 2026-06-01)** Angenommen der Befestigungs-Schritt angezeigt wird, dann erscheint zusätzlich zu den kompatiblen Optionen immer eine Karte "Ohne Befestigung" — unabhängig von den Kompatibilitäts-Flags des Arcs.
- [ ] **(NEU 2026-06-01)** Angenommen der Nutzer wählt "Ohne Befestigung", wenn er auf "Weiter" klickt, dann wechselt die Ansicht zum nächsten Schritt; es wird kein Befestigungs-Aufpreis berechnet (0 €) und kein Spinne-Stepper angezeigt.
- [ ] Angenommen "Spinne" ist eine kompatible Option und der Nutzer wählt sie aus, dann erscheint direkt darunter ein Stepper für die Pendelanzahl (Minimum: 1, Maximum: `max_spinne_pendants`).
- [ ] Angenommen "Spinne" ist ausgewählt und der Nutzer ändert die Auswahl, dann verschwindet der Stepper.
- [ ] Angenommen der Nutzer hat eine Befestigungsart ausgewählt, wenn er auf "Weiter" klickt, dann wechselt die Ansicht zum nächsten Schritt.

### Finish-Schritt (nur wenn `is_sanded = true` ODER Schliff-Wahl = "Schleifen lassen")

- [ ] Angenommen der Finish-Schritt angezeigt wird, dann sind nur die Finish-Optionen sichtbar, die der Arc unterstützt.
- [ ] Angenommen der Nutzer wählt ein Finish, wenn er auf "Weiter" klickt, dann wechselt die Ansicht zum Licht-Schritt.

### Licht-Schritt

- [ ] Angenommen der Licht-Schritt angezeigt wird, dann werden immer alle drei Lichtoptionen angezeigt: "Porzellan Fassung", "Hintergrund LED", "True Light LED".
- [ ] **(NEU 2026-06-01)** Angenommen der Licht-Schritt angezeigt wird, dann erscheint zusätzlich immer eine vierte Karte "Ohne Licht".
- [ ] **(NEU 2026-06-01)** Angenommen der Nutzer wählt "Ohne Licht", wenn er auf "Weiter" klickt, dann wechselt die Ansicht zur Zusammenfassung; es wird kein Licht-Aufpreis berechnet (0 €).
- [ ] Angenommen der Nutzer wählt eine Lichtoption, wenn er auf "Weiter" klickt, dann wechselt die Ansicht zur Zusammenfassung.

### Zusammenfassung

- [ ] Angenommen die Zusammenfassung angezeigt wird, dann sind alle gewählten Optionen (Oberfläche, Befestigung, ggf. Finish, Licht) und die Preisaufschlüsselung sichtbar.
- [ ] **(NEU 2026-06-01)** Angenommen "Ohne Befestigung" gewählt wurde, dann zeigt die Befestigungs-Zeile "Ohne Befestigung" und es gibt keine Befestigungs-Aufpreiszeile.
- [ ] **(NEU 2026-06-01)** Angenommen "Ohne Licht" gewählt wurde, dann zeigt die Licht-Zeile "Ohne Licht" und es gibt keine Licht-Aufpreiszeile.
- [ ] Angenommen `is_sanded = true`, dann zeigt die Oberflächen-Zeile "Geschliffen" (fest, nicht klickbar).
- [ ] Angenommen Schliff-Wahl = "Schleifen lassen", dann zeigt die Oberflächen-Zeile "Wird geschliffen".
- [ ] Angenommen Schliff-Wahl = "Ungeschliffen belassen", dann zeigt die Oberflächen-Zeile "Ungeschliffen – Rohling" und es gibt keine Finish-Zeile.
- [ ] Angenommen der Nutzer klickt auf "Weiter", dann wechselt die Ansicht zur Reservierung.

### Reservierung

- [ ] Angenommen der Reservierungs-Schritt angezeigt wird, dann wird die vollständige Konfiguration als Read-only-Zusammenfassung sowie der Gesamtpreis und ein Button "Jetzt reservieren (24 Stunden)" angezeigt.
- [ ] Angenommen der Nutzer klickt auf "Jetzt reservieren" und der Arc ist noch frei, dann wird `reserved_until` auf jetzt + 24 Stunden gesetzt und der Nutzer zum Checkout weitergeleitet.
- [ ] Angenommen der Arc wurde inzwischen von jemand anderem reserviert, dann erscheint eine Fehlermeldung — keine Weiterleitung.

### Step-Indikator (übergreifend)

- [ ] Angenommen der Arc hat `is_sanded = true`, dann zeigt der Step-Indikator 5 Schritte (Befestigung, Finish, Licht, Zusammenfassung, Reservierung).
- [ ] Angenommen der Arc hat `is_sanded = false` und die Schliff-Wahl ist noch nicht getroffen, dann zeigt der Step-Indikator 5 Schritte (Schliff, Befestigung, Licht, Zusammenfassung, Reservierung).
- [ ] Angenommen der Nutzer wählt "Schleifen lassen", dann aktualisiert sich der Step-Indikator auf 6 Schritte (Schliff, Befestigung, Finish, Licht, Zusammenfassung, Reservierung).

### Preisanzeige (übergreifend)

- [ ] Angenommen der Nutzer wechselt zu einem anderen Schritt, wenn eine gültige Auswahl vorliegt, dann wird der aktuelle Gesamtpreis (Grundpreis + alle bisher gewählten Aufpreise) im Konfigurator dauerhaft sichtbar aktualisiert.
- [ ] Angenommen die Befestigung "Spinne" gewählt ist und der Nutzer die Pendelanzahl ändert, dann aktualisiert sich der Gesamtpreis sofort.
- [ ] Angenommen Schliff-Wahl = "Schleifen lassen" und `price_sanding` ist gesetzt, dann erscheint eine "Schliff"-Zeile in der Preisaufschlüsselung.
- [ ] Angenommen Schliff-Wahl = "Ungeschliffen belassen", dann enthält der Gesamtpreis weder einen Schliff- noch einen Finish-Aufpreis.

## Edge Cases

- **Arc wird während der Konfiguration reserviert:** Kein Echtzeit-Check — erst beim Klick auf "Jetzt reservieren" wird geprüft. Wenn der Arc dann weg ist, erscheint eine Fehlermeldung.
- **Nur eine kompatible Befestigungsoption:** Schritt wird trotzdem vollständig angezeigt — kein automatisches Überspringen.
- **Spinne-Stepper Grenzwerte:** Nutzer kann nicht unter 1 oder über `max_spinne_pendel` navigieren; Buttons werden an den Grenzen deaktiviert.
- **Arc ohne `max_spinne_pendel`:** Falls `max_spinne_pendel` null ist und "Spinne" trotzdem als kompatibel markiert wurde, wird Spinne nicht als Option angezeigt.
- **Aufpreis = 0:** Zeile in der Preisaufschlüsselung wird ausgeblendet (bereits implementiert).
- **Browser-Zurück-Button:** Verlässt der Nutzer den Konfigurator über den Browser-Zurück-Button, geht die Konfiguration verloren — kein Persist außerhalb der Page.
- **Direktzugriff auf `/konfigurator` ohne Arc-ID:** Redirect zur Browse-Ansicht (`/arcs`).
- **Schliff-Wahl ändern nach Vorscrollen:** Geht der Nutzer via Step-Indikator zurück auf Schritt 1 (Schliff) und ändert die Wahl, werden Befestigung, Finish und Licht zurückgesetzt. Nur die neue Schliff-Wahl bleibt erhalten.
- **Arc mit `is_sanded = false` und gesetzten `price_finish_*` Spalten:** Finish-Aufpreise werden nur berücksichtigt, wenn Schliff-Wahl = "Schleifen lassen".
- **Arc wechselt `is_sanded` während aktiver Session:** Der Konfigurator lädt `is_sanded` einmalig beim Seitenaufruf. Ändert ein Admin den Wert während der Session, hat das keine Auswirkung bis zum Reload.
- **`price_sanding = null`:** Der Schliff-Schritt wird trotzdem angeboten; in der Preisaufschlüsselung erscheint keine Schliff-Zeile (Preis = 0, wie andere Aufpreise ohne Wert).
- **"Ohne Befestigung" + "Ohne Licht" zusammen (NEU 2026-06-01):** Gültige Konfiguration — ein Arc kann sowohl ohne Befestigung als auch ohne Licht reserviert werden (Arc als reines Objekt). Beide Schritte bleiben im Flow, nur die jeweilige "Ohne ..."-Karte ist gewählt.
- **Arc ohne kompatible Befestigungsoption (NEU 2026-06-01):** Der Befestigungs-Schritt zeigt mindestens die Karte "Ohne Befestigung" — der Schritt ist nie leer.
- **"Ohne Befestigung" gewählt, danach zu Spinne gewechselt (NEU 2026-06-01):** Wechselt der Nutzer von "Ohne Befestigung" zu "Spinne", erscheint der Spinne-Stepper wie gewohnt; wechselt er zurück zu "Ohne Befestigung", verschwindet der Stepper.

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
| Schliff als erster konfigurierbarer Schritt (für Rohlinge) | Kunden können entscheiden, ob sie ihren Rohling schleifen lassen wollen; das bestimmt ob Finish verfügbar ist | 2026-05-27 |
| `is_sanded = true` → kein Schliff-Schritt, direkt Befestigung | Geschliffene Arcs können nicht "ungeschliffen" werden — irreversibel; kein sinnloser Schritt | 2026-05-27 |
| Schliff-Wahl ändert → alle nachfolgenden Selections zurücksetzen | Schliff-Entscheid ist fundamental (bestimmt ob Finish verfügbar ist); inkonsistente Downstream-Auswahlen wären schlimmer als ein Reset | 2026-05-27 |
| Schrittanzahl dynamisch (5 oder 6) je nach Schliff-Wahl | Step-Indikator spiegelt den tatsächlichen Flow — erst nach der Schliff-Wahl wird klar ob Finish erscheint | 2026-05-27 |
| `price_sanding` als nullable Spalte in `arcs` | Konsistentes Muster mit anderen Aufpreisen; Admin füllt den Preis aus wenn er ihn kalkuliert hat | 2026-05-27 |
| "Ohne Befestigung" & "Ohne Licht" immer für jeden Arc wählbar (kein Admin-Flag) | Einfachste Umsetzung, konsistent mit "Lichtoptionen immer alle sichtbar"; kein neues Schema, keine Admin-Pflege (PROJ-5) nötig | 2026-06-01 |
| "Ohne ..."-Optionen als zusätzliche Auswahl-Karte (kein Schritt-Skip) | Konsistent mit dem bestehenden Card-Pattern; Schritt-Indikator bleibt stabil; bewusste, explizite Nutzerwahl statt impliziter Skip | 2026-06-01 |
| Aufpreis für "Ohne Befestigung"/"Ohne Licht" = 0 € (keine neue Preis-Spalte) | Wegfall einer Komponente kostet nichts; 0-€-Zeilen werden ohnehin in der Preisaufschlüsselung ausgeblendet | 2026-06-01 |

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
| "Ohne Befestigung"/"Ohne Licht" als Client-State-Wert `'none'`, kein neues DB-Schema | `MountingType` und `LightType` erhalten jeweils den Wert `'none'`; Preisbeitrag fix 0 — keine Migration, keine neuen Spalten | 2026-06-01 |
| "Ohne Befestigung"-Karte unabhängig von Kompatibilitäts-Flags rendern | Die Option ist nie inkompatibel (Weglassen ist immer möglich) — sie wird im Befestigungs-Schritt fest angehängt, nicht aus den Flags abgeleitet | 2026-06-01 |

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
    │   ├── OptionCard "Ohne Befestigung"  (immer angehängt, mountingType='none')
    │   └── SpinneStepper  (bedingt — nur wenn "Spinne" gewählt)
    │
    ├── Step: Finish  [NUR wenn is_sanded = true]
    │   └── OptionCard × n  (nur kompatible Optionen)
    │
    ├── Step: Licht  (Schritt 2 bei is_sanded=false, Schritt 3 bei is_sanded=true)
    │   └── OptionCard × 4  (3 Lichtoptionen + "Ohne Licht", lightType='none')
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
- **Production URL:** https://arc-one-seven.vercel.app
- **DB-Migration:** `db/migrations/003_konfigurator_price_columns.sql` — 9 Aufpreis-Spalten auf `arcs`-Tabelle
- **Neue Env Var:** `SUPABASE_SERVICE_ROLE_KEY` in Vercel gesetzt (Admin-Client für Konfigurator-Page + Reserve-API)

**is_sanded Erweiterung — 2026-05-27**
- 4-Schritt-Flow für Rohlinge live ✅
- DB Migration `004_is_sanded.sql` muss manuell im Supabase SQL-Editor ausgeführt werden
