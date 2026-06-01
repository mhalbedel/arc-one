# PROJ-3a: Preisgestaltung (Konfigurator)

## Status: Planned
**Created:** 2026-06-01
**Last Updated:** 2026-06-01

> **Sub-Feature von PROJ-3 (Konfigurator).** Ersetzt das bisherige per-Arc-Aufpreismodell durch eine zentrale, vom Admin gepflegte **Preismatrix**. Die Aufpreise werden aus **Größenklasse** (cm²) und **Gewichtsklasse** (g) des jeweiligen Arcs abgeleitet. Der Basispreis (Rohling) bleibt pro Arc. Die Pflege-Oberfläche der Matrix gehört in PROJ-5 (Admin-Backend).

## Dependencies
- **PROJ-1** (Datenbank-Schema) — `arcs`-Tabelle mit `base_price`, `width_cm`, `height_cm`, `weight_g`
- **PROJ-3** (Konfigurator) — liest die berechneten Aufpreise für die Live-Preisanzeige; nutzt `pricing.ts`
- **PROJ-4** (Pre-Order & Stripe) — Checkout berechnet den finalen Preis server-seitig über dieselbe `pricing.ts`
- **PROJ-5** (Admin-Backend) — UI zum Pflegen der Preismatrix und der Gewichtsklassen-Grenzwerte; bis dahin werden Werte per SQL gesetzt

## User Stories

- Als **Admin** möchte ich die Aufpreise für Schliff, Finish, Befestigung und Licht zentral an einer Stelle pflegen, damit ich nicht für jeden einzelnen Arc Preise eintragen muss.
- Als **Admin** möchte ich die Grenzwerte für die Größenklassen (cm²) und die Gewichtsklassen (g) selbst festlegen, damit ich die Klassifizierung an reale Arc-Maße und -Gewichte anpassen kann.
- Als **Endkunde** möchte ich, dass sich der Aufpreis automatisch aus Größe und Gewicht meines Arcs ergibt, damit der angezeigte Preis korrekt und nachvollziehbar ist.
- Als **Endkunde** möchte ich nach jeder Auswahl den korrekt berechneten Gesamtpreis sehen (Basispreis + alle Aufpreise), damit ich vor der Reservierung Klarheit über die Kosten habe.
- Als **Endkunde** möchte ich schon **während** der Konfiguration sehen, was jede einzelne Option kostet (Aufpreis pro Karte) und wie sich Basispreis + meine bisherigen Auswahlen zum Gesamtpreis summieren, damit ich Optionen bewusst nach Preis wählen kann — so wie der Spinne-Stepper den Preis sofort mitführt.
- Als **Manufaktur-Team** möchte ich eine konsistente Preisbildung über alle Arcs hinweg, damit gleich große/schwere Arcs denselben Aufpreis pro Komponente haben.

## Preismodell (fachlich)

### Basispreis
Bleibt pro Arc (`arcs.base_price`, in Cent). Stellt den ungeschliffenen Rohling ohne Komponenten dar.

### Größenklasse (aus Fläche = Höhe × Breite in cm²) — Admin-pflegbare Grenzen
| Klasse | cm² (Default) |
|--------|---------------|
| klein | 0 – 3000 |
| mittel | 3001 – 6000 |
| groß | ab 6001 |

Die Grenzwerte (klein-max = 3000, mittel-max = 6000) sind vom Admin konfigurierbar (PROJ-5); die genannten Werte sind die Defaults.

### Gewichtsklasse (aus `weight_g`) — Admin-pflegbare Grenzen
| Klasse | Gewicht |
|--------|---------|
| leicht | bis Grenzwert A |
| mittel | Grenzwert A+1 bis Grenzwert B |
| schwer | ab Grenzwert B+1 |

Grenzwerte A und B sind vom Admin konfigurierbar (PROJ-5).

### Aufpreis-Matrix (zentral, vom Admin gepflegt, alle Werte in Cent)

| Komponente | Variante | Staffelung | Anzahl Werte |
|------------|----------|------------|--------------|
| **Schliff** | – | Größenklasse (klein/mittel/groß) | 3 |
| **Finish** | Öl / Lack / Schellack | Finish-Typ × Größenklasse | 9 |
| **Befestigung** | Wand / Decke | Typ × Gewichtsklasse | 6 |
| **Befestigung** | Spinne (pro Pendel) | Gewichtsklasse, × Pendelanzahl | 3 |
| **Licht** | Porzellan / LED / High-LED | Licht-Typ × Größenklasse | 9 |

> **Licht-Typ-Zuordnung:** „LED" = Hintergrund-LED (`bg_led`), „High-LED" = True Light LED (`true_led`); dazu Porzellan-Fassung (`porzellan`).

### Nullpreis-Optionen
„Ohne Befestigung", „Ohne Licht" und Finish „Unbehandelt" kosten 0 € und stehen nicht in der Matrix (analog zur heutigen Logik; 0-€-Zeilen werden in der Aufschlüsselung ausgeblendet).

### Spinne-Berechnung
Spinne-Aufpreis = (Pendel-Preis der Gewichtsklasse des Arcs) × (gewählte Pendelanzahl).

## Out of Scope

- **Admin-UI zur Pflege der Preismatrix und Gewichtsgrenzen** — PROJ-5 (Admin-Backend); PROJ-3a liefert nur Datenmodell + Berechnungslogik + Default-Werte. Bis PROJ-5 werden Preise per SQL gesetzt.
- **Konfigurator-UI / Step-Flow (Struktur)** — PROJ-3; Schritte, Navigation und Reservierung bleiben unverändert. PROJ-3a ändert die Preis-**Quelle** und ergänzt die **Preisanzeige** (Aufpreis je Optionskarte + durchgehende Aufschlüsselung), nicht den Schritt-Aufbau.
- **Checkout-/Stripe-Logik** — PROJ-4; nutzt dieselbe `pricing.ts`, aber Zahlungsabwicklung bleibt unverändert.
- **B2B-Sonderpreise / Rabatte** — PROJ-8 (B2B-Portal).
- **Versandkosten** — bereits in PROJ-4 geregelt (`SHIPPING_PRICES`); kein Teil dieser Matrix.
- **Mengenrabatte / Drop-spezifische Preise** — nicht in v1.
- **Preishistorie / Versionierung** — keine Nachverfolgung alter Preisstände in v1; eine Bestellung speichert weiterhin einen Preis-Snapshot (`orders`).
- **Zerstörendes Entfernen der alten `price_*`-Spalten** — die Spalten bleiben deprecated im Schema (kein Drop), werden aber nicht mehr gelesen.

## Acceptance Criteria

### Größen- und Gewichtsklassifizierung

- [ ] Angenommen die Größengrenzen sind klein-max=3000 und mittel-max=6000 cm², wenn ein Arc 2500 cm² hat, dann ist er „klein"; wenn 3001 cm², dann „mittel" (untere Grenze inklusive); wenn 6001 cm², dann „groß".
- [ ] Angenommen der Admin ändert die Größengrenzen, wenn ein Arc klassifiziert wird, dann gelten die neuen Grenzwerte.
- [ ] Angenommen die Gewichtsgrenzen sind A=2000 g und B=5000 g, wenn ein Arc 2000 g wiegt, dann ist er „leicht"; wenn er 2001 g wiegt, dann „mittel"; wenn er 5001 g wiegt, dann „schwer".

### Schliff-Preis

- [ ] Angenommen Schliff-Wahl = „Schleifen lassen" und der Arc ist „mittel", wenn der Preis berechnet wird, dann wird der Schliff-Preis der Größenklasse „mittel" aus der Matrix verwendet.
- [ ] Angenommen Schliff-Wahl = „Ungeschliffen belassen", wenn der Preis berechnet wird, dann fällt kein Schliff-Preis an (0 €).

### Finish-Preis

- [ ] Angenommen Finish = „Öl" und der Arc ist „groß", wenn der Preis berechnet wird, dann wird der Öl-Preis für „groß" aus der Matrix verwendet.
- [ ] Angenommen Finish = „Unbehandelt", wenn der Preis berechnet wird, dann fällt kein Finish-Preis an (0 €).

### Befestigungs-Preis

- [ ] Angenommen Befestigung = „Wand" und der Arc ist „schwer", wenn der Preis berechnet wird, dann wird der Wand-Preis für „schwer" verwendet.
- [ ] Angenommen Befestigung = „Decke" und derselbe Arc wäre „leicht", dann ist der Befestigungspreis niedriger als bei „schwer" (je schwerer, desto teurer).
- [ ] Angenommen Befestigung = „Spinne", der Arc ist „mittel" und es sind 4 Pendel gewählt, wenn der Preis berechnet wird, dann ist der Befestigungspreis = Pendel-Preis(„mittel") × 4.
- [ ] Angenommen Befestigung = „Ohne Befestigung", wenn der Preis berechnet wird, dann fällt kein Befestigungspreis an (0 €).

### Licht-Preis

- [ ] Angenommen Licht = „High-LED" und der Arc ist „klein", wenn der Preis berechnet wird, dann wird der True-Light-LED-Preis für „klein" verwendet.
- [ ] Angenommen derselbe Lichttyp bei „klein" vs. „groß", dann ist der Aufpreis bei „groß" höher (größer = teurer).
- [ ] Angenommen Licht = „Ohne Licht", wenn der Preis berechnet wird, dann fällt kein Lichtpreis an (0 €).

### Preisanzeige im Konfigurator (während der Konfiguration)

- [ ] Angenommen ein Optionsschritt (Schliff/Finish/Befestigung/Licht) wird angezeigt, wenn die Optionskarten gerendert werden, dann zeigt jede Karte den für diesen Arc berechneten Aufpreis (z.B. „+ 120 €") basierend auf seiner Größen- bzw. Gewichtsklasse.
- [ ] Angenommen eine Option hat den Aufpreis 0 € (z.B. „Ohne Befestigung", „Ohne Licht", „Unbehandelt"), wenn ihre Karte angezeigt wird, dann wird sie als „inklusive" / „+ 0 €" gekennzeichnet (kein leerer Preis).
- [ ] Angenommen die Befestigung „Spinne" ist ausgewählt, wenn der Nutzer die Pendelanzahl ändert, dann zeigt die Spinne-Auswahl den Pendel-Preis und den daraus resultierenden Spinne-Gesamtaufpreis sofort aktualisiert an (bestehendes Spinne-Verhalten, jetzt aus der Preismatrix gespeist).
- [ ] Angenommen der Nutzer befindet sich in irgendeinem Konfigurationsschritt, dann ist durchgehend eine Preisübersicht sichtbar, die mindestens den Basispreis und den aktuellen Gesamtpreis zeigt.
- [ ] Angenommen der Nutzer hat eine oder mehrere Komponenten gewählt, wenn die Preisübersicht angezeigt wird, dann sind der Basispreis und die Aufpreise der bereits gewählten Komponenten als einzelne Zeilen aufgeschlüsselt (Zeilen mit 0 € ausgeblendet).
- [ ] Angenommen der Nutzer trifft oder ändert eine Auswahl, wenn die Auswahl gültig ist, dann aktualisieren sich Karten-Aufpreise (falls klassenabhängig), Aufschlüsselung und Gesamtpreis sofort ohne Seiten-Reload.

### Gesamtpreis & Konsistenz

- [ ] Angenommen ein Arc mit allen Komponenten ist konfiguriert, wenn der Gesamtpreis berechnet wird, dann gilt: Gesamt = Basispreis + Schliff + Finish + Befestigung + Licht (+ Versand im Checkout).
- [ ] Angenommen der Nutzer ändert eine Auswahl im Konfigurator, wenn die neue Auswahl gültig ist, dann aktualisiert sich der angezeigte Gesamtpreis sofort und korrekt.
- [ ] Angenommen ein Kunde konfiguriert im Konfigurator, wenn er denselben Arc im Checkout abschließt, dann ist der server-seitig berechnete Preis identisch zum im Konfigurator angezeigten Preis (gleiche `pricing.ts`-Quelle).
- [ ] Angenommen der Admin ändert einen Matrix-Wert, wenn ein neuer Konfigurator geladen wird, dann verwendet die Berechnung den neuen Wert.

### Admin-Pflege (Datenseite; UI in PROJ-5)

- [ ] Angenommen die Preismatrix ist über das Admin-Backend pflegbar, wenn der Admin einen Preis für eine Komponente/Variante/Klasse setzt, dann wird dieser Wert bei der nächsten Berechnung verwendet.
- [ ] Angenommen der Admin setzt die Größengrenzen (cm²) und Gewichtsgrenzen (g), wenn ein Arc klassifiziert wird, dann gelten die neuen Grenzwerte.

## Edge Cases

- **Fehlender Matrix-Wert (null/nicht gesetzt):** Ist ein Preis für eine Kombination nicht hinterlegt, wird er als 0 € behandelt (kein Crash, keine fehlerhafte Reservierung) — konsistent mit der heutigen „fehlender Preis = 0"-Logik.
- **Arc ohne Maße (`width_cm`/`height_cm` null):** Größenklasse fällt auf „klein" zurück (kleinste/günstigste Klasse), damit kein Preis fehlt. Datenpflege liegt beim Admin.
- **Arc ohne Gewicht (`weight_g` null):** Gewichtsklasse fällt auf „leicht" zurück (kleinste/günstigste Klasse).
- **Klassengrenzen inkonsistent (klein-max ≥ mittel-max bzw. A ≥ B):** Ungültige Admin-Eingabe; wird in der Admin-UI (PROJ-5) validiert. Berechnungslogik klassifiziert deterministisch (kleinste/größte Klasse), die mittlere Klasse kann dabei leer sein.
- **cm² genau auf Grenze (3000 vs. 3001):** Untere Grenze gehört zur höheren Klasse (3001 = mittel). Grenzen sind eindeutig, keine Überlappung.
- **Negative oder 0-Maße:** cm² = 0 → „klein". Keine negativen Werte erwartet (DB-Constraint/Admin-Pflege).
- **Migration bestehender Arcs:** Bestehende per-Arc `price_*`-Werte werden nicht mehr gelesen; alle Arcs nutzen ab Deploy die globale Matrix. Bestehende Orders behalten ihren Preis-Snapshot (keine Rückwirkung).
- **Spinne ohne Pendelanzahl:** Pendelanzahl-Minimum ist 1 (PROJ-3); fehlt der Wert, wird mit 1 gerechnet.

## Technical Requirements

- **Preisberechnung bleibt eine reine Funktion** in `src/lib/pricing.ts` — sie erhält die geladenen Preisregeln + Gewichtsgrenzen als Eingabe (kein DB-Zugriff in der Funktion selbst), damit Konfigurator (Client) und Checkout (Server) dieselbe Quelle nutzen.
- **Alle Preise in Cent** (ganzzahlig), konsistent mit bestehendem Schema.
- **Server-seitige Preisberechnung im Checkout** bleibt maßgeblich (kein Vertrauen auf Client-Preis) — Schutz gegen Manipulation.
- **Die Matrix wird einmalig pro Seitenaufruf geladen** (analog `blocked_options`/`is_sanded`); Änderungen während einer Session wirken erst nach Reload.
- Keine neuen npm-Pakete erwartet.

## Open Questions

- [ ] Genaue Default-Werte der Matrix sowie der Größen- (Default 3000/6000 cm²) und Gewichtsgrenzen (A, B) — wird vom Admin/Manufaktur-Team mit realen Kalkulationen befüllt; für Seed/Tests werden Platzhalterwerte gesetzt. (Architektur-/Seed-Detail, kein Blocker.)
- [ ] Exakter Tabellenname/Struktur der Preismatrix (`pricing_rules` o.ä.) — wird in `/architecture` festgelegt.

## Decision Log

### Product Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Schliff-Preis nach Größenklasse | Aufwand des Schleifens skaliert mit der Fläche; konsistent mit Licht-Staffelung | 2026-06-01 |
| Finish-Preis nach Finish-Typ × Größe | Materialverbrauch hängt sowohl von der Behandlungsart als auch von der Fläche ab | 2026-06-01 |
| Befestigung nach Typ × Gewichtsklasse | Schwerere Arcs brauchen aufwändigere/teurere Befestigung; explizite Vorgabe „je schwerer, desto teurer" | 2026-06-01 |
| Licht nach Typ × Größe | Größere Leuchten benötigen mehr/aufwändigere Leuchtmittel; explizite Vorgabe | 2026-06-01 |
| Größen- und Gewichts-Grenzen admin-pflegbar | Reale Arc-Maße und -Gewichte variieren; Manufaktur soll beide Klassifizierungen selbst justieren können. Defaults: Größe 3000/6000 cm², Gewicht A/B | 2026-06-01 |
| Globale Preismatrix ersetzt per-Arc `price_*`-Spalten komplett | Admin pflegt Preise einmal zentral statt pro Unikat; konsistente Preisbildung; deutlich weniger Pflegeaufwand | 2026-06-01 |
| `base_price` bleibt pro Arc | Jeder Rohling ist ein Unikat mit individuellem Grundpreis | 2026-06-01 |
| Spinne = Pendel-Preis(Gewichtsklasse) × Pendelanzahl | Erhält die heutige Pendel-Ökonomie und fügt sie ins Gewichtsklassen-Modell ein | 2026-06-01 |
| „Ohne …"/„Unbehandelt" = 0 €, nicht in der Matrix | Wegfall einer Komponente kostet nichts; konsistent mit PROJ-3 | 2026-06-01 |
| Aufpreis je Optionskarte sichtbar + durchgehende Aufschlüsselung (Basispreis + gewählte Aufpreise) in jedem Schritt | Transparente, bewusste Preisauswahl während der Konfiguration — Kunde sieht Kosten je Option, nicht erst in der Zusammenfassung; Vorbild ist der live mitlaufende Spinne-Preis | 2026-06-01 |
| Fehlender Matrix-Wert = 0 € | Robustheit; kein Crash bei unvollständiger Pflege; gleiche Semantik wie heute | 2026-06-01 |
| Alte `price_*`-Spalten deprecated statt gedroppt | Kein destruktiver Migrationsschritt; Cleanup als spätere separate Migration | 2026-06-01 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Globale Preise in zwei neuen Supabase-Tabellen (`pricing_rules` + `pricing_settings`) statt localStorage | Preise gelten für alle Besucher gleich, werden vom Admin gepflegt und müssen zwischen Konfigurator (Client) und Checkout (Server) identisch sein — das verlangt eine zentrale Quelle in der DB | 2026-06-01 |
| `pricing_rules` als schmale Zeilen-Tabelle (Komponente, Variante, Klasse, Preis) statt vieler Spalten | ~30 Werte; neue Varianten/Klassen lassen sich ohne Schemaänderung ergänzen; eine Zeile = ein pflegbarer Preis (ideal für die spätere Admin-UI) | 2026-06-01 |
| `pricing_settings` als Einzel-Datensatz mit vier Grenzwerten (Größe klein-max/mittel-max in cm², Gewicht leicht-max/mittel-max in g) | Genau ein gültiger Satz Grenzwerte zur Zeit; klar getrennt von den Preisen; einfach im Admin pflegbar | 2026-06-01 |
| RLS: öffentlich lesbar, nur Admin schreibbar | Preise sind nicht geheim und werden im Konfigurator gebraucht; geändert werden sie nur vom Admin — gleiches Muster wie `arcs`/`drops` | 2026-06-01 |
| `pricing.ts` bleibt reine Funktion und bekommt Preisregeln + Grenzwerte als Eingabe | Eine einzige Berechnungsquelle für Live-Anzeige (Client) und verbindlichen Checkout-Preis (Server); verhindert Preis-Drift; keine DB-Zugriffe in der Funktion | 2026-06-01 |
| Regeln + Grenzwerte einmal pro Seitenaufruf serverseitig laden und an den Client durchreichen | Konsistent mit dem Lade-Muster von `blocked_options`/`is_sanded`; kein zusätzlicher Client-DB-Zugriff | 2026-06-01 |
| Größen-/Gewichtsklassifizierung als kleine Helfer in `pricing.ts` (Fläche = Höhe × Breite) | Eine Stelle für die Klasseneinteilung, von Konfigurator und Checkout gemeinsam genutzt | 2026-06-01 |
| Alte per-Arc `price_*`-Spalten deprecated, nicht gedroppt | Kein destruktiver Migrationsschritt (gleiches Vorgehen wie bei `compat_*`); Cleanup als spätere separate Migration | 2026-06-01 |
| Fehlender Preis → 0; fehlende Maße/Gewicht → kleinste Klasse | Robustheit bei unvollständiger Pflege; kein Crash, keine fehlerhafte Reservierung | 2026-06-01 |
| Neue Migration `008_pricing_matrix.sql` + Seed mit Platzhalterpreisen | Sequentiell nach `007`; Seed macht Konfigurator/Checkout/Tests sofort lauffähig, bevor reale Preise gepflegt sind | 2026-06-01 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick — was sich ändert

PROJ-3a ist überwiegend eine **Logik- und Daten-Änderung**, keine neue Oberfläche. Der Konfigurator-Flow (PROJ-3) und der Checkout (PROJ-4) bleiben optisch unverändert — sie beziehen ihre Aufpreise nur aus einer neuen Quelle. Statt für jeden Arc einzeln eingetragene Preise gibt es ab jetzt **eine zentrale Preisliste**, aus der die Aufpreise anhand von Größe und Gewicht des Arcs berechnet werden.

Die Pflege-Oberfläche für diese Preisliste wird in **PROJ-5 (Admin-Backend)** gebaut. Bis dahin werden die Preise per Datenbank-Skript (Seed) gesetzt.

### Datenmodell (in einfacher Sprache)

**1. Preisliste (`pricing_rules`)** — die zentrale Tabelle mit allen Aufpreisen. Jede Zeile ist genau ein Preis:

```
Jede Preis-Zeile hat:
- Komponente   (Schliff | Finish | Befestigung | Licht)
- Variante     (z.B. Öl/Lack/Schellack, Wand/Decke/Spinne, Porzellan/LED/High-LED;
                bei Schliff: keine Variante)
- Klasse       (Größenklasse klein/mittel/groß  ODER  Gewichtsklasse leicht/mittel/schwer)
- Preis        (in Cent)
```

Insgesamt rund **30 Zeilen**:

```
Schliff       3   (klein, mittel, groß)
Finish        9   (Öl/Lack/Schellack × klein/mittel/groß)
Befestigung   9   (Wand × leicht/mittel/schwer)
                  (Decke × leicht/mittel/schwer)
                  (Spinne pro Pendel × leicht/mittel/schwer)
Licht         9   (Porzellan/LED/High-LED × klein/mittel/groß)
```

**2. Klassen-Grenzwerte (`pricing_settings`)** — ein einzelner Datensatz mit den vier vom Admin pflegbaren Schwellen:

```
- Größe: Grenze klein→mittel   (Default 3000 cm²)
- Größe: Grenze mittel→groß    (Default 6000 cm²)
- Gewicht: Grenze leicht→mittel (Default vom Team festzulegen)
- Gewicht: Grenze mittel→schwer (Default vom Team festzulegen)
```

**Was bleibt:** Der Basispreis bleibt pro Arc (`arcs.base_price`). Maße (`width_cm`, `height_cm`) und Gewicht (`weight_grams`) liegen bereits in `arcs`.

**Was wegfällt:** Die zehn per-Arc-Preisspalten (`price_mounting_*`, `price_finish_*`, `price_sanding`, `price_light_*`) werden nicht mehr gelesen. Sie bleiben vorerst im Schema (deprecated), werden aber in einer späteren Migration entfernt.

**Speicherort:** Beide Tabellen in Supabase. Öffentlich lesbar (der Konfigurator braucht die Preise), nur vom Admin änderbar — gleiches Zugriffsmuster wie bei `arcs`.

### So wird ein Preis berechnet (Datenfluss)

```
1. Konfigurator-Seite (Server) lädt:
   - den Arc (inkl. Maße, Gewicht, base_price)
   - die Preisliste + die Klassen-Grenzwerte
   → reicht beides an die Konfigurator-Oberfläche (Client) weiter

2. Im Browser, bei jeder Auswahl:
   - aus Höhe × Breite wird die Größenklasse bestimmt
   - aus dem Gewicht wird die Gewichtsklasse bestimmt
   - JEDE Option des aktuellen Schritts bekommt ihren Aufpreis aus der Liste
     berechnet → Anzeige direkt auf der Optionskarte (z.B. „+ 120 €")
   - für jede GEWÄHLTE Komponente wird der Aufpreis in die Aufschlüsselung
     übernommen (Spinne: Pendel-Preis der Gewichtsklasse × Pendelanzahl)
   - Gesamtpreis = Basispreis + Schliff + Finish + Befestigung + Licht
   → Karten-Aufpreise, Aufschlüsselung und Gesamtpreis aktualisieren sich sofort,
     in jedem Schritt sichtbar

3. Im Checkout (Server) wird der verbindliche Preis mit
   exakt derselben Berechnung neu ermittelt (kein Vertrauen auf den Client-Preis)
   und als Snapshot in der Bestellung gespeichert.
```

Die Berechnung lebt an **einer einzigen Stelle** (`src/lib/pricing.ts`) und wird von Konfigurator und Checkout gemeinsam genutzt. Das garantiert: der live angezeigte Preis und der berechnete Bestellpreis sind immer identisch.

### Komponenten- und Datei-Struktur

```
Geändert:
  src/lib/pricing.ts            ← Berechnung auf Preisliste + Klassen umgestellt;
                                   Helfer für Größen-/Gewichtsklasse
  src/types/index.ts            ← Typen für Preisregeln, Klassen, Grenzwerte
  src/types/database.ts         ← neue Tabellen pricing_rules + pricing_settings
  src/app/konfigurator/[arc_id]/page.tsx
                                ← lädt Preisliste + Grenzwerte und reicht sie durch
  src/components/konfigurator/konfigurator-client.tsx
                                ← berechnet pro Optionskarte den klassenabhängigen
                                   Aufpreis und gibt ihn an die Karten weiter
  src/components/konfigurator/option-card.tsx
                                ← zeigt den Aufpreis je Option (z.B. „+ 120 €",
                                   0 € als „inklusive")
  src/components/konfigurator/spinne-stepper.tsx
                                ← Pendel-Preis + Spinne-Gesamtaufpreis aus der Matrix
  src/components/konfigurator/price-display.tsx
  src/components/konfigurator/preis-aufschluesselung.tsx
                                ← durchgehende Anzeige: Basispreis + gewählte
                                   Aufpreise als Zeilen + Gesamtpreis, in jedem Schritt
  src/app/api/checkout/create-payment-intent/route.ts
  src/components/checkout/checkout-*.tsx
                                ← verbindliche Preisberechnung über dieselbe Quelle

Neu:
  db/migrations/008_pricing_matrix.sql
                                ← Tabellen pricing_rules + pricing_settings, RLS,
                                   Seed mit Platzhalterpreisen + Default-Grenzwerten

Unverändert (Oberfläche/Flow):
  Step-Indikator, Option-Karten, Reservierung — keine UX-Änderung
```

Die **Admin-Pflege-Oberfläche** (Liste bearbeiten, Grenzwerte setzen) ist **nicht** Teil von PROJ-3a — sie gehört in PROJ-5 und liest/schreibt dieselben zwei Tabellen.

### Tech-Entscheidungen (kurz begründet)

- **Datenbank statt localStorage:** Preise sind global und admin-gepflegt; sie müssen für alle Besucher gleich sein und zwischen Browser-Anzeige und Server-Checkout übereinstimmen.
- **Schmale Zeilen-Tabelle statt vieler Spalten:** ~30 Preise als Zeilen sind leichter erweiterbar und ideal für eine spätere Tabellen-Pflege-UI — eine Zeile = ein Preis.
- **Eine gemeinsame Berechnungsfunktion:** verhindert, dass Konfigurator und Checkout unterschiedliche Preise zeigen.
- **Alte Preisspalten nur deprecaten, nicht löschen:** kein riskanter, destruktiver Migrationsschritt — gleiches Vorgehen wie zuvor bei den `compat_*`-Spalten.
- **Robuste Defaults:** fehlt ein Preis, zählt 0 €; fehlen Maße/Gewicht, gilt die kleinste (günstigste) Klasse — der Konfigurator bleibt immer funktionsfähig.

### Abhängigkeiten (neue Pakete)

Keine. Alle benötigten Bausteine (Supabase-Client, Typen, bestehende Konfigurator-/Checkout-Komponenten) sind vorhanden.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
