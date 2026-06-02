# Gap-Analyse: Sitemap v3 & Copywriting v1 vs. Specs

> **Stand:** 2026-06-02 · **Autor:** Claude Code (Analyse) · **Status:** Vorschlag zur Diskussion
> Dieses Dokument **ändert keine bestehenden Specs**. Es vergleicht den Soll-Zustand (Planning-Docs) mit dem Ist-Zustand (Specs + Code) und schlägt vor, was fehlt, ergänzt oder gestrichen werden sollte. Umsetzung erfolgt später über die normalen Skills (`/refine`, `/write-spec`).

---

## 1. Zweck & Quellen

Im Ordner `docs/planning/` liegen zwei neue Planungsartefakte, die den angestrebten Soll-Zustand der Website beschreiben:

| Quelle (Soll) | Inhalt |
|---------------|--------|
| `arco_one_sitemap_v3.html` | Vollständige Sitemap mit 4 Journeys (Sammler, Architekt, Drop, Admin), 8 Frontend- + 3 Admin-Sektionen, „neu"-Markern |
| `ARCO_ONE_Copywriting_v1_2.docx` | Vollständige deutsche Website-Texte (Tone of Voice, Home, Manufaktur, Katalog, Konfigurator, Drops, B2B, Art Tier, Service/Recht) |

Verglichen mit dem Ist-Zustand:

| Quelle (Ist) | Rolle |
|--------------|-------|
| `features/INDEX.md` | Feature-Status PROJ-1..10 |
| `features/PROJ-2-arc-katalog.md` | Home / Browse / Detail / Navigation (Status: In Progress) |
| `features/PROJ-3-konfigurator.md` | Konfigurator-Flow inkl. Befestigung (Status: Deployed) |
| `features/PROJ-3a-preisgestaltung.md` | Zentrale Größen-/Gewichts-Preismatrix (Status: Deployed) |
| `features/PROJ-4-pre-order-stripe.md` | Pre-Order & Stripe (Status: Deployed) |
| `features/PROJ-5-admin-backend.md` | Admin-Backend inkl. CMS-Texte, Preisregeln, B2B, Befestigungs-Kompatibilität (Status: Deployed) |
| `src/types/index.ts` | Ist-Taxonomie `MountingType` / `FinishType` / `LightType` |
| `src/app/**` (Routen) | Tatsächlich existierende Seiten |

---

## 2. Methodik

Soll = Sitemap + Copywriting. Ist = Specs + Roadmap + tatsächliche Routen.
Pro Sektion wird einer von vier Befunden vergeben:

- **Abgedeckt** — Spec existiert und deckt die Sektion ab.
- **Ergänzen** — Spec existiert, weicht aber inhaltlich vom Soll ab oder ist unvollständig.
- **Fehlt** — keine Spec, kein Roadmap-Eintrag, keine Route.
- **Streichen / obsolet** — Soll-Dokument ist hinter der Realität oder Inhalt nicht (mehr) gewünscht.

**Ist-Routen (geprüft):** `src/app/` enthält nur `admin`, `arcs`, `checkout`, `konfigurator`, `api` und die Home-Seite (`page.tsx`). Es gibt **keine** Routen für Manufaktur, Kollektionen, Service/Recht, Drops, B2B oder Art Tier.

---

## 3. Mapping-Tabelle: Sitemap-Sektion → Spec

### Frontend-Sektionen

| Sitemap-Sektion | Spec | Status | Route vorhanden? | Befund |
|-----------------|------|--------|------------------|--------|
| Home / Landing | PROJ-2 | In Progress | Ja (`/`) | **Ergänzen** — nur Hero+Story+Highlights; Brand Statement, USP-3-Säulen, Featured-Drop-Teaser, Manufaktur-Teaser fehlen |
| Die Manufaktur | — | — | Nein | **Fehlt** → Vorschlag PROJ-11 |
| Unikat-Katalog (Browser, Filter, Detail, 3D) | PROJ-2 | In Progress | Ja (`/arcs`) | **Abgedeckt** (Filter + 3D-Viewer in PROJ-2 als „Out of Scope/deferred" markiert) |
| Konfigurator (Befestigung/Finish/Licht/Kalkulation/Pre-Order) | PROJ-3 + PROJ-3a | Deployed | Ja (`/konfigurator`) | **Abgedeckt**, aber **Ergänzen** bei Optionen/Copy (siehe C1–C3) |
| Drops & Warteliste | PROJ-6 | Roadmap | Nein | **Fehlt (geplant)** — Copy + Sitemap als Vorlage |
| Kollektionen (Series) | — | — | Nein | **Fehlt** → Vorschlag PROJ-12 (oder bewusst streichen) |
| Art Tier (Wurzelholz) | PROJ-9 | Roadmap | Nein | **Fehlt (geplant)** — Copy vorhanden |
| B2B / Architekt-Portal | PROJ-8 | Roadmap | Nein | **Fehlt (geplant)** — Copy + Sitemap als Vorlage |
| Service & Rechtliches (FAQ, Versand, Kontakt, Impressum, Datenschutz) | — | — | Nein | **Fehlt** → Vorschlag PROJ-13 (Impressum/Datenschutz rechtlich verpflichtend) |

### Admin-Sektionen

| Sitemap-Sektion | Spec | Status | Befund |
|-----------------|------|--------|--------|
| Rohling-Verwaltung (Scan/Foto-Upload, Maße/Metadaten, Kategorie/Finish, **Befestigungs-Kompatibilität**, Status-Workflow, Drop zuweisen) | PROJ-5 | Deployed | **Abgedeckt** — „Befestigungs-Kompatibilität" ist als `blocked_options` bereits umgesetzt; Sitemap-„neu"-Marker obsolet |
| Drop & Auftragsmanagement | PROJ-5 (+ PROJ-6) | Deployed/Roadmap | **Teilweise** — Auftragsverwaltung in PROJ-5, Drop-Planung hängt an PROJ-6 |
| Content & System (CMS-Texte, Preis-Regeln, B2B-Accounts, CAD, Benutzer, Logs) | PROJ-5 (+ PROJ-3a/8) | Deployed/Roadmap | **Abgedeckt/Teilweise** — Preis-Regeln = PROJ-3a; B2B-Accounts = PROJ-8 |

---

## 4. Was FEHLT — Vorschlag neuer Feature-IDs

> Nächste freie ID laut `INDEX.md`: **PROJ-11**.

| Vorschlag | Sektion | Inhalt (aus Copy/Sitemap) | Priorität | Begründung |
|-----------|---------|---------------------------|-----------|------------|
| **PROJ-11** | Die Manufaktur | Geschichte & Herkunft (Monchique), Material (Eukalyptus), Prozess („Zwei Stunden Schliff"), Schellack („Concert Grade"), Werkstatt-Einblicke (Film) | Mittel | Markenkern & Vertrauenssignal; vollständiger Copy liegt vor, aber weder Spec noch Route. Liefert auch den Manufaktur-Teaser für die Home. |
| **PROJ-12** | Kollektionen / Showcase | Fertige Nicht-Arc-Objekte: Tischlampen-Produkt, Möbel, Tische, Schalen & Accessoires | Niedrig | **Showcase-/Anfrage-Seite** (kein Konfigurator, kein Stripe) für Objekte, die nicht aus der `arcs`-Tabelle stammen. Hält den Arc-Katalog/Konfigurator strikt Arc-only. *(präzisiert 2026-06-02, siehe 9.4)* |
| **PROJ-13** | Service & Rechtliches | FAQ & Pflege, Versand & Lieferzeit, Kontakt/Atelier, **Impressum & Datenschutz** | **Hoch** | **Impressum + Datenschutzerklärung sind in DE/AT rechtlich verpflichtend** für eine kommerzielle Website. Sollte vor Public-Launch existieren. FAQ-Copy liegt vollständig vor. |

> **Lampen-„Series" (Tischlampe/Hängeleuchte/Cluster)** sind hingegen nur Montage-Varianten konfigurierbarer Arcs (Standfuß/Decke/Spinne) → **Filter im Arc-Katalog (PROJ-2)**, nicht PROJ-12. Filter ist bewusst deferred.

**Querschnitt — Copy-/Content-Integration:** Das Copywriting-Dokument ist derzeit in keiner Spec als Textquelle referenziert. Empfehlung: das Copy-Deck als verbindliche Quelle verankern und klar trennen zwischen *statischen* Texten (Manufaktur, Service) und *CMS-gepflegten* Texten (PROJ-5 pflegt bereits „Homepage & CMS-Texte").

---

## 5. Was ERGÄNZT werden muss — bestehende deployte Specs

| # | Abweichung | Soll (Planning-Doc) | Ist (Spec/Code) | Entscheidung & Empfehlung |
|---|------------|---------------------|------------------|---------------------------|
| **C1** | **Lichtsystem-Taxonomie** | „Standard — CRI 80" / „Effizienz-LED — CRI 90" / „Ultra High-End — CRI 98" (3 Optionen) | `porzellan` / `bg_led` / `true_led` / `ohne` (4 Optionen) | **Gelöst (9.2): 4-Wege-Modell beibehalten.** Copy an die deployte Taxonomie anpassen; CRI-Stufen-Darstellung verwerfen. → `/refine` Copy, nicht Code. |
| **C2** | **Finish-Optionen** | „Öl/Wachs" / „Objekt-Lack" / „Schellack" — **ohne** „Unbehandelt", **ohne** Schliff | `unbehandelt` / `oel` / `lack` / `schellack` + Schliff-Schritt | **Gelöst (9.5): bestehende Lösung beibehalten.** Copy um „Unbehandelt" und Schliff-Logik ergänzen; Flow bleibt wie PROJ-3 deployt. |
| **C3** | **Feste Preise im Copy** | „+45 €" Lack, „+180 €" Schellack, „+65 €" LED, „+320 €" CRI 98 | PROJ-3a berechnet Aufpreise **dynamisch** aus Größen-/Gewichtsklasse | **Gelöst (9.3): gar keine Beträge im Copy.** Feste Beträge ersatzlos entfernen — keine „ab"-Werte. Preislogik bleibt PROJ-3a. |
| **C4** | **Markenname & Domain** | „ARCO ONE", `arco-one.de`, `studio@`/`press@arco-one.de` | Specs/Repo: „ARC-ONE" | **Gelöst (9.1): ARC-ONE gewinnt.** Copy + Sitemap auf ARC-ONE angleichen; Impressum/E-Mail/SEO darauf aufbauen. |
| **C5** | **Home-Sektionen** | Hero, Brand Statement, USP-3-Säulen, Featured-Drop-Teaser, Manufaktur-Teaser | PROJ-2: nur Hero + Markenstory + Highlight-Arcs | PROJ-2 (bzw. PROJ-11 für Manufaktur-Teaser) um die fehlenden Home-Sektionen erweitern. Featured-Drop-Teaser hängt an PROJ-6. *(keine offene Entscheidung)* |

---

## 6. Roadmap-Items mit Copy/Sitemap anreichern

Diese Features sind bereits als „Roadmap" geplant, haben aber noch keine Spec. Die Planning-Docs liefern reichhaltige Vorlagen für das spätere `/write-spec`:

| Feature | Verfügbares Material aus Planning-Docs |
|---------|----------------------------------------|
| **PROJ-6 Drop & Warteliste** | Sitemap (Aktuelle/Kommende Drops, Warteliste beitreten, Drop-Archiv) + vollständiger Copy (Warteliste-Formular, Bestätigungstext, Archiv-Intro) |
| **PROJ-7 E-Mail (Resend)** | Copy für Drop-Alert, Warteliste-Bestätigung, Pre-Order-Bestätigung (24-h-Zusage aus Konfigurator-Copy) |
| **PROJ-8 B2B-Portal** | Sitemap-Sektion + Copy: CAD `.dxf`/`.step`/`.pdf`, DALI/KNX, Brandschutz/CE, Projektanfrage ab 5 Pendeln, Zugangserklärung |
| **PROJ-9 Art Tier** | Copy: Wurzelholz-Ornamentik, monumentale Tischplatten, „Ab 10.000 €", Anfrage-Flow, Galerie-Intro |
| **PROJ-10 SEO & Performance** | Voraussetzung: Markenname-/Domain-Entscheidung (C4) muss vorher fallen |

---

## 7. Was GESTRICHEN / nicht nötig ist

| Punkt | Empfehlung |
|-------|------------|
| Sitemap-„neu"-Marker auf „Befestigung: Ohne/Wand/Decke/Spinne" (Konfigurator) und „Befestigungs-Kompatibilität" (Admin) | **Obsolet** — bereits in PROJ-3 (Deployed) und PROJ-5 (Deployed) umgesetzt. „neu"-Marker entfernen; kein Handlungsbedarf außer Doku-Korrektur. Die Sitemap ist hier **hinter** der Realität. |
| Feste Preisangaben im Copy (C3) | **Streichen (Entscheidung 9.3)** — ersatzlos, keine „ab"-Werte. Preise bleiben dynamisch über PROJ-3a. |
| CRI-Stufen-Lichtdarstellung im Copy (C1) | **Streichen (Entscheidung 9.2)** — durch 4-Wege-Modell (`porzellan`/`bg_led`/`true_led`/`ohne`) ersetzt. |
| „ARCO ONE" / `arco-one.de` (C4) | **Streichen (Entscheidung 9.1)** — überall durch ARC-ONE ersetzen. |
| „Kollektionen" als gemischte Sektion (Lampen + Möbel zusammen) | **Aufgeteilt (9.4):** Lampen-Varianten → Filter im Arc-Katalog (PROJ-2, deferred); fertige Nicht-Arc-Objekte → eigene Showcase-Seite PROJ-12. Die vermischte Sitemap-Sektion in dieser Form entfällt. |

---

## 8. Findings & Empfehlungen (konsolidiert)

| # | Abweichung | Soll (Doc) | Ist (Spec/Code) | Empfehlung | Betroffene Spec |
|---|------------|-----------|------------------|------------|-----------------|
| 1 | Manufaktur-Seiten fehlen | Volle Copy-Sektion | Keine Spec/Route | Neue Spec PROJ-11 | neu |
| 2 | Service/Recht fehlt | FAQ + Impressum + Datenschutz | Keine Spec/Route | Neue Spec PROJ-13 (hoch, rechtlich) | neu |
| 3 | Kollektionen fehlen | 4 Series | Keine Spec | **Gelöst (9.4, aufgeteilt):** Lampen → Filter PROJ-2 (deferred); Nicht-Arc-Objekte → Showcase PROJ-12 | PROJ-2 / PROJ-12 |
| 4 | Lichtsystem-Taxonomie | 3 CRI-Stufen | 4 Optionen (porzellan/bg_led/true_led/ohne) | **Gelöst (9.2):** 4-Wege-Modell, Copy angleichen | PROJ-3 / PROJ-3a (Copy) |
| 5 | Finish ohne „Unbehandelt"/Schliff | 3 Finishes | 4 + Schliff-Schritt | **Gelöst (9.5):** bestehende Lösung, Copy angleichen | PROJ-3 (Copy) |
| 6 | Feste Preise im Copy | +45/+180/+65/+320 € | Dynamische Matrix | **Gelöst (9.3):** Beträge ersatzlos entfernen | PROJ-3a |
| 7 | Markenname/Domain | ARCO ONE / arco-one.de | ARC-ONE | **Gelöst (9.1):** ARC-ONE überall | querschnitt |
| 8 | Home unvollständig | 5 Sektionen | 3 Sektionen | PROJ-2 erweitern | PROJ-2 |
| 9 | „neu"-Marker Befestigung | als neu markiert | bereits deployt | Marker entfernen | Sitemap (Doku) |
| 10 | Roadmap-Specs ohne Inhalt | Volle Copy/Sitemap | Nur Roadmap-Zeile | Beim `/write-spec` einfließen lassen | PROJ-6/7/8/9 |

---

## 9. Getroffene Entscheidungen (2026-06-02)

| # | Frage | Entscheidung | Konsequenz |
|---|-------|--------------|------------|
| 9.1 | Markenname & Domain | **ARC-ONE** (bestehende Repo-Schreibweise gewinnt) | Copy + Sitemap von „ARCO ONE" / `arco-one.de` auf **ARC-ONE** angleichen. Impressum/E-Mail/SEO auf ARC-ONE aufbauen. |
| 9.2 | Lichtsystem | **4-Wege-Modell beibehalten** (`porzellan` / `bg_led` / `true_led` / `ohne`) | Copy an die implementierte Taxonomie anpassen; CRI-Stufen-Darstellung des Copy wird verworfen. |
| 9.3 | Preisdarstellung im Copy | **Gar keine Beträge** (Preise sind dynamisch) | Feste Beträge (+45/+180/+65/+320 €) aus dem Copy entfernen — keine „ab"-Werte. Preislogik bleibt vollständig PROJ-3a. |
| 9.4 | Kollektionen / Series | **Aufgeteilt (präzisiert 2026-06-02):** Lampen-Varianten = Filter; fertige Nicht-Arc-Objekte = eigene Showcase-Seite | **Lampen-„Series" (Tischlampe/Hängeleuchte/Cluster)** sind nur Montage-Varianten konfigurierbarer Arcs → Filter im Arc-Katalog (PROJ-2), deferred. **Fertige Nicht-Arc-Objekte (Tischlampen-Produkt, Möbel, Tische, Schalen)** sind nicht konfigurierbar → **eigene Showcase-/Anfrage-Seite PROJ-12** (kein Konfigurator, kein Stripe). Begründung: Der Konfigurator lädt nur aus der `arcs`-Tabelle; Nicht-Arc-Produkte dürfen nicht in den Katalog/Konfigurator geraten. |
| 9.5 | Schliff im Konfigurator | **Bestehende Lösung beibehalten** | Schliff-Schritt (Rohling vs. geschliffen) + „Unbehandelt" bleiben wie in PROJ-3 deployt. Copy an den bestehenden Flow anpassen. |

> Diese Entscheidungen lösen die Findings C1–C5 (Abschnitt 5) auf. Die Tabellen in Abschnitt 4, 5, 7 und 8 sind unten entsprechend aktualisiert.

---

## 10. Vorgeschlagene nächste Schritte

> Entscheidungen 9.1–9.5 sind getroffen. Damit ergeben sich konkrete Umsetzungsschritte:

1. **Copy-Überarbeitung (auf Basis 9.1–9.5):** „ARCO ONE" → **ARC-ONE**, feste Preise entfernen, Lichtsystem auf 4-Wege-Modell, Finish um „Unbehandelt"/Schliff ergänzen. Betrifft das Copy-Deck, nicht den Code.
2. `/refine PROJ-2` für C5 (zusätzliche Home-Sektionen) **erledigt am 2026-06-02**; Series-/Montage-Filter dort bewusst **deferred** dokumentiert.
3. `/refine PROJ-3` / `/refine PROJ-3a` nur falls Spec-Texte die alte Licht-/Preisdarstellung erwähnen — **Code bleibt unverändert** (9.2/9.3/9.5 = bestehende Lösung).
4. `/write-spec` für **PROJ-13 (Service & Recht — hoch, rechtlich)**, **PROJ-11 (Manufaktur)** und **PROJ-12 (Kollektionen/Showcase)**.
5. Beim späteren `/write-spec` von PROJ-6/7/8/9 die vorhandenen Copy-/Sitemap-Vorlagen nutzen.
6. **Folgeaktion (erledigt 2026-06-02):** `INDEX.md` um **PROJ-11**, **PROJ-12** und **PROJ-13** ergänzt. Nächste freie ID: PROJ-14.

> Dieses Dokument ist eine Analyse-Vorlage. Es wurden **keine** Specs, kein Code und kein `INDEX.md` geändert.
