# PROJ-7: E-Mail-System (Resend)

## Status: Planned
**Created:** 2026-06-12
**Last Updated:** 2026-06-12

## Übersicht
Zentrale, projektweite Transaktions-E-Mail-Schicht. Liefert die Bestätigungs- und
Benachrichtigungsmails, auf die PROJ-4 (Pre-Order) und PROJ-9 (Shop) bereits verweisen —
heute zeigen die Bestätigungsseiten nur den Platzhaltertext "eine Mail wurde gesendet".
PROJ-7 macht diesen Versand real. Reine Transaktionsmails (kein Marketing).

## Dependencies
- **PROJ-4** (Pre-Order & Stripe) — liefert den Anzahlungs-Abschluss (30 %), der Mail #1 auslöst
- **PROJ-9** (Shop) — liefert Shop-Kaufabschluss (Mail #2) und Anfrage-Flow (Mails #3, #4)
- **PROJ-1** (DB-Schema) — `orders`, `customers`, `product_inquiries`; benötigt ein Versand-Flag (z. B. `confirmation_email_sent_at`)

## E-Mails im Scope (MVP)
| # | Auslöser | Empfänger | Quelle |
|---|----------|-----------|--------|
| 1 | Pre-Order Anzahlung (30 %) erfolgreich bezahlt | Kunde | PROJ-4 |
| 2 | Shop-Direktkauf (100 %) erfolgreich bezahlt | Kunde | PROJ-9 |
| 3 | Neue Produkt-Anfrage eingegangen | Atelier (`kontakt@arc-one.de`) | PROJ-9 |
| 4 | Anfrage-Eingangsbestätigung | Kunde | PROJ-9 |
| 5 | Neue Bestellung eingegangen (Pre-Order oder Shop-Kauf) | Atelier (`kontakt@arc-one.de`) | operativ (neu) |

**Adressierung:**
- Kundenmails (#1, #2, #4): From `ARC ONE <bestellung@arc-one.de>`, Reply-To `kontakt@arc-one.de`
- Atelier-Mails (#3, #5): To `kontakt@arc-one.de` (ein gemeinsamer Team-Posteingang)
- Sprache: ausschließlich Deutsch (v1)

## User Stories
- Als **Endkunde** möchte ich nach meiner Anzahlung eine Bestätigungsmail mit Bestellnummer, Konfiguration und dem noch offenen Restbetrag erhalten, damit ich einen Beleg habe und weiß, wie es weitergeht.
- Als **Shop-Käufer** möchte ich nach dem Kauf eine Bestätigungsmail mit allen gekauften Stücken und dem gezahlten Betrag erhalten, damit ich meinen Kauf dokumentiert habe.
- Als **Interessent** möchte ich nach dem Absenden einer Produkt-Anfrage eine kurze Eingangsbestätigung erhalten, damit ich weiß, dass meine Anfrage angekommen ist.
- Als **Atelier-Team** möchte ich bei jeder neuen Anfrage eine E-Mail mit allen Kontaktdaten und der Nachricht erhalten, damit keine Anfrage übersehen wird.
- Als **Atelier-Team** möchte ich bei jeder neuen Bestellung (Pre-Order oder Shop) eine interne Benachrichtigung erhalten, damit ich von einem Verkauf erfahre, ohne das Admin-Dashboard beobachten zu müssen.

## Out of Scope
- **Restbetrag-Zahlungsaufforderung (70 %)** — verschoben; der 70-%-Restbetrag-Flow selbst ist noch nicht gebaut, eine Mail ohne Auslöser ergibt keinen Sinn. Mail #1 enthält lediglich den Hinweis auf den später fälligen Restbetrag.
- **PDF-Rechnung / Belege als Anhang** — eigene spätere Feature; eine echte deutsche Rechnung (fortlaufende Nummer, USt./Kleinunternehmer) ist ein Buchhaltungsthema. Stripe versendet bei Bedarf seinen eigenen Zahlungsbeleg.
- **Automatischer Retry-Queue / Wiederholungslogik** — bewusst keine zusätzliche Infrastruktur im MVP; Fehlversand wird geloggt, manuelles Nachsenden genügt.
- **Marketing-/Newsletter-Mails, Double-Opt-In** — PROJ-7 ist rein transaktional.
- **Drop-/Warteliste-Benachrichtigungen** — PROJ-6.
- **B2B-spezifische Mails** (CAD-Freigaben o. Ä.) — PROJ-8.
- **Mehrsprachige E-Mails** — nur Deutsch in v1 (analog PRD).
- **Sichtbarer Fehlerhinweis** bei fehlgeschlagenem Versand (weder Kunde noch Team) — Fehler werden nur geloggt.

## E-Mail-Inhalte (Defaults)
- **#1 Anzahlungsbestätigung:** Anrede, Bestellnummer, Arc-Name + Konfiguration (Größe, Oberfläche etc.), gezahlte Anzahlung (30 %), noch offener Restbetrag (70 %) mit Hinweis "vor Versand fällig", Lieferadresse, Reply-To für Rückfragen.
- **#2 Shop-Kaufbestätigung:** Anrede, Bestellnummer, Liste aller gekauften Stücke, gezahlter Gesamtbetrag (100 %), Lieferadresse, Reply-To.
- **#3 Atelier — neue Anfrage:** Produktname, Kundenname, E-Mail, Telefon (falls angegeben), Nachricht, Datum.
- **#4 Anfrage-Eingangsbestätigung:** Bestätigung des Eingangs, betroffenes Produkt, persönlicher Hinweis "Wir melden uns persönlich bei dir" (ohne harte Frist-Zusage).
- **#5 Atelier — neue Bestellung:** Bestellnummer, Typ (Pre-Order / Shop-Kauf), Betrag, Kundenname + E-Mail, Datum.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Pre-Order Anzahlungsbestätigung (#1)
- [ ] Angenommen eine Pre-Order-Anzahlung wurde erfolgreich bezahlt, wenn die Bestellung serverseitig bestätigt wird, dann wird genau eine Bestätigungsmail an die E-Mail-Adresse des Kunden gesendet.
- [ ] Angenommen die Mail wird versendet, dann enthält sie Bestellnummer, Arc-Name samt Konfiguration, gezahlte Anzahlung, den offenen Restbetrag und die Lieferadresse.
- [ ] Angenommen die Mail wird versendet, dann ist der Absender `ARC ONE <bestellung@arc-one.de>` und der Reply-To `kontakt@arc-one.de`.

### Shop-Kaufbestätigung (#2)
- [ ] Angenommen ein Shop-Kauf wurde vollständig (100 %) bezahlt, wenn die Bestellung serverseitig bestätigt wird, dann wird genau eine Bestätigungsmail an den Kunden gesendet.
- [ ] Angenommen die Mail wird versendet, dann enthält sie Bestellnummer, alle gekauften Stücke, den gezahlten Gesamtbetrag und die Lieferadresse.

### Anfrage-Mails (#3, #4)
- [ ] Angenommen eine neue Produkt-Anfrage wurde gespeichert, wenn der Anfrage-Endpoint erfolgreich war, dann wird eine Benachrichtigung an `kontakt@arc-one.de` mit Produkt, Name, E-Mail, Telefon, Nachricht und Datum gesendet.
- [ ] Angenommen eine neue Produkt-Anfrage wurde gespeichert, wenn der Anfrage-Endpoint erfolgreich war, dann wird zusätzlich eine Eingangsbestätigung an den anfragenden Kunden gesendet.

### Interne Bestellbenachrichtigung (#5)
- [ ] Angenommen eine Pre-Order oder ein Shop-Kauf wurde abgeschlossen, wenn die Bestellung bestätigt wird, dann wird eine interne Benachrichtigung an `kontakt@arc-one.de` mit Bestellnummer, Typ, Betrag und Kundendaten gesendet.

### Zuverlässigkeit / Fehlerverhalten
- [ ] Angenommen der E-Mail-Versand schlägt fehl oder läuft in einen Timeout, wenn der Kunde gerade bezahlt hat, dann bleibt die Bestellung gültig, die Bestätigungsseite wird normal angezeigt und der Fehler wird geloggt (kein Rollback, kein sichtbarer Hinweis).
- [ ] Angenommen eine Bestätigungsseite wird mehrfach neu geladen oder ein Webhook wird wiederholt zugestellt, wenn die zugehörige Mail bereits gesendet wurde, dann wird keine weitere Mail für denselben Vorgang gesendet (Versand genau einmal).

## Edge Cases
- **Versand schlägt fehl (Resend nicht erreichbar / Timeout):** Bestellung/Anfrage bleibt erfolgreich, Bestätigungsseite rendert normal, Fehler wird geloggt — kein Rollback, kein automatischer Retry, kein sichtbarer Hinweis.
- **Mehrfaches Auslösen (Reload der idempotenten Bestätigungsseite, Webhook-Replay):** Versand-Flag (z. B. `confirmation_email_sent_at`) verhindert Doppelversand.
- **Ungültige/abgelehnte Empfängeradresse (Bounce):** Versand wird als fehlgeschlagen geloggt; keine weitere Aktion im MVP (Adresse wurde bereits beim Checkout/Anfrage per Zod validiert).
- **Anfrage ohne Telefonnummer:** Telefon ist optional — die Atelier-Mail lässt das Feld weg statt eine leere Zeile zu zeigen.
- **Mehrere Stücke im Shop-Warenkorb:** Kaufbestätigung listet alle Positionen mit kombiniertem Gesamtbetrag (eine Mail pro Bestellung, nicht pro Stück).
- **Anzahlungs- vs. Shop-Kauf-Mail:** #1 weist einen offenen Restbetrag aus, #2 nicht (100 % bezahlt) — die Vorlagen dürfen nicht verwechselt werden.

## Technical Requirements (optional)
- Versand erfolgt server-seitig (kein Client-seitiger API-Key).
- Best-Effort, nicht-blockierend: ein fehlgeschlagener Versand darf einen abgeschlossenen Zahlungs-/Bestellvorgang niemals blockieren oder zurückrollen.
- Versand-Idempotenz über ein Flag pro Vorgang (genau einmal).
- Produktiver Versand erfordert eine in Resend verifizierte Domain `arc-one.de`.

## Open Questions
- [ ] Soll Mail #4 (Anfrage-Eingangsbestätigung) eine konkrete Reaktionszeit nennen (z. B. "innerhalb von 2 Werktagen") oder bewusst ohne Frist bleiben? Default im Spec: ohne harte Frist-Zusage.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Scope = Transaktionsmails #1–#5; Restbetrag-Mail (#6) verschoben | Der 70-%-Restbetrag-Flow ist noch nicht gebaut — eine Mail ohne Auslöser ergibt keinen Sinn | 2026-06-12 |
| Interne Bestellbenachrichtigung (#5) inklusive | Geringer Aufwand, hoher operativer Wert für das 1–3-köpfige Atelier-Team | 2026-06-12 |
| From `bestellung@arc-one.de`, Reply-To `kontakt@arc-one.de` | Konsistente Markenidentität; Antworten landen in einem überwachten Team-Posteingang | 2026-06-12 |
| Ein gemeinsamer Atelier-Posteingang `kontakt@arc-one.de` für #3 + #5 | Kleines Team — einfacher, nichts geht verloren | 2026-06-12 |
| Versand best-effort, nicht-blockierend, nur geloggt | Eine fehlgeschlagene Mail darf eine bezahlte Bestellung nie gefährden; Kunde sieht immer seine Bestätigung | 2026-06-12 |
| Versand-Idempotenz via Flag (genau einmal) | Bestätigungsseiten sind idempotent und können neu geladen werden — verhindert Doppelversand | 2026-06-12 |
| Kein automatischer Retry-Queue im MVP | Bewusst keine zusätzliche Infrastruktur; manuelles Nachsenden genügt beim aktuellen Volumen | 2026-06-12 |
| Kein sichtbarer Fehlerhinweis (Kunde/Team) | Fehler werden geloggt; ein Hinweis würde Kunden verunsichern oder UI verkomplizieren | 2026-06-12 |
| Plain-HTML-Mails, keine PDF-Anhänge | Echte DE-Rechnung ist Buchhaltungsthema; Anzahlung ist ohnehin keine Schlussrechnung; Stripe-Beleg deckt Zahlungsnachweis | 2026-06-12 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Versand über Resend SDK; Vorlagen mit React Email | Projekt-Tech-Stack; React Email erlaubt komponierbare, getestete HTML-Mails statt String-Templates | 2026-06-12 |
| Zentrales Modul `src/lib/email/` (server-only): Versand-Wrapper + Vorlagen + Sender-Funktionen | Eine Quelle der Wahrheit; alle Aufrufer (Bestätigungsseiten, Anfrage-Endpoint) rufen nur eine Sender-Funktion auf | 2026-06-12 |
| Versand-Wrapper fängt Fehler ab und wirft nie zum Aufrufer | Erzwingt das nicht-blockierende Best-Effort-Verhalten direkt an der Quelle | 2026-06-12 |
| Send-once-Guard über neue Spalte `orders.confirmation_email_sent_at` (bedingtes Update NULL → Zeitstempel) | Race-sicher: beim Shop laufen zwei Abschluss-Pfade (Confirm-Route + Bestätigungsseite) gegen dieselbe Order — nur der erste Aufruf, der den Zeitstempel setzt, versendet | 2026-06-12 |
| Kein Guard-Flag für Anfragen (#3/#4) | Der Anfrage-Endpoint ist ein POST, der je Aufruf genau eine Zeile anlegt; Doppel-Submit ist bereits durch Button-Sperre + Rate-Limit abgedeckt — pro Insert genau ein Mail-Paar | 2026-06-12 |
| Mail #1 + #5 (Pre-Order) bzw. #2 + #5 (Shop) werden gemeinsam unter demselben Guard ausgelöst | Kunde- und Atelier-Mail gehören zu einem Vorgang; ein gemeinsamer Guard verhindert, dass eine ohne die andere doppelt versendet | 2026-06-12 |
| Absenderadressen als Konstanten im Code, nur `RESEND_API_KEY` als Secret-Env-Var | Adressen sind fix (`arc-one.de` verifiziert); kein Grund, sie zu konfigurieren — hält die Einrichtung einfach | 2026-06-12 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick
PROJ-7 ist eine reine Backend-/Versand-Schicht — **keine neuen Seiten, kein neues UI**.
Die Mails werden serverseitig genau dort ausgelöst, wo die bestehenden Abschluss-Flows
(PROJ-4 Pre-Order, PROJ-9 Shop, PROJ-9 Anfrage) heute schon laufen. Ein zentrales
E-Mail-Modul kapselt Versand und Vorlagen; die Aufrufer rufen nur eine Sender-Funktion auf.

### A) Struktur (E-Mail-Modul + Integrationspunkte)
```
src/lib/email/                (neu, server-only)
+-- client            Resend-Instanz + Versand-Wrapper (Best-Effort, loggt Fehler, wirft nie)
+-- config            Absender-/Reply-To-/Atelier-Adressen (Konstanten)
+-- senders           Eine Funktion je Anwendungsfall:
|     +-- Anzahlungsbestätigung (#1)
|     +-- Shop-Kaufbestätigung   (#2)
|     +-- Anfrage an Atelier     (#3)
|     +-- Anfrage-Eingangsbestätigung (#4)
|     +-- Interne Bestellbenachrichtigung (#5)
+-- templates         React-Email-Vorlagen (eine je Mail) + gemeinsames Marken-Layout

Auslöser (bestehende Dateien, je um einen Sender-Aufruf ergänzt):
+-- checkout/[arc_id]/bestaetigung/page.tsx   -> #1 + #5  (beim Übergang PENDING -> CONFIRMED)
+-- lib/shop-server.ts  (finalizeShopOrder)   -> #2 + #5  (nach Order-Abschluss)
+-- api/shop/inquiries/route.ts               -> #3 + #4  (nach erfolgreichem Insert)
```

### B) Datenmodell (Klartext)
Eine einzige Schema-Änderung:
```
Tabelle orders — neue Spalte:
- confirmation_email_sent_at  (Zeitstempel, anfangs leer)
  Wird beim ersten erfolgreichen Abschluss gesetzt und dient als „genau-einmal"-Sperre.
  Solange leer -> Mail darf raus; das Setzen geschieht als bedingtes Update
  (nur wenn noch leer), damit bei zwei parallelen Abschluss-Pfaden nur einer gewinnt.
```
- `product_inquiries` bekommt **keine** neue Spalte — jeder Anfrage-POST legt genau eine
  Zeile an und löst genau ein Mail-Paar aus; ein Reload kann den Versand nicht wiederholen.
- Mail-Inhalte werden zur Laufzeit aus den vorhandenen Daten (`orders`, `order_items`,
  `customers`, `arcs`/`products`, `product_inquiries`) gelesen — **nichts wird zusätzlich gespeichert**.

### C) Tech-Entscheidungen (für PM, das Warum)
- **Resend + React Email** — der projektweite Tech-Stack. React Email lässt die Vorlagen aus
  wiederverwendbaren Bausteinen zusammensetzen (gemeinsames Marken-Layout, getestet), statt
  HTML als rohen Text zusammenzukleben.
- **Ein zentrales Modul statt verstreutem Versand** — alle Aufrufer rufen genau eine
  Sender-Funktion auf. Absenderadressen, Marken-Layout und Fehlerbehandlung liegen an einer
  Stelle; spätere Mails (z. B. PROJ-6 Warteliste) docken hier an.
- **Versand kann nie etwas kaputt machen** — der Versand-Wrapper fängt jeden Fehler ab und
  meldet ihn nur ins Log. Eine bezahlte Bestellung bleibt bezahlt, die Bestätigungsseite lädt
  normal, auch wenn Resend ausfällt.
- **„Genau einmal" über einen Zeitstempel in der Bestellung** — der Shop schließt eine
  Bestellung über zwei mögliche Wege ab (Confirm-Aufruf des Browsers **und** die
  Bestätigungsseite). Der Zeitstempel sorgt dafür, dass nur der erste Weg die Mail auslöst —
  auch bei Reload oder wiederholter Zustellung.

### D) Dependencies (Pakete)
- `resend` — offizielles SDK für den Mailversand
- `react-email` (Dev/Tooling: Vorschau) und `@react-email/components` — Vorlagen-Bausteine

### E) Environment-Variablen
- `RESEND_API_KEY` — geheim, serverseitig; in `.env.local.example` mit Dummy dokumentieren.
- Produktiver Versand erfordert die in Resend verifizierte Domain `arc-one.de` (DNS/DKIM)
  — eine einmalige Einrichtung, kein Code.

### F) Was NICHT gebaut wird (Architektur-seitig)
- Keine neue Tabelle, kein Mail-Log in der DB (Fehler gehen ins Anwendungs-Log).
- Kein Hintergrund-Job / keine Queue / kein Retry.
- Keine neue API-Route allein für E-Mail — der Versand hängt sich in bestehende Flows ein.

## Implementation Notes

### Frontend (E-Mail-Vorlagen) — 2026-06-12
Status: **In Progress** (Vorlagen fertig; Versand-Verdrahtung + Migration folgen in `/backend`).

- Paket `@react-email/components@^1.0.12` installiert. (`resend` SDK kommt im Backend-Schritt; auf das optionale `react-email`-Preview-CLI bewusst verzichtet — schlanke Deps.)
- Alle Vorlagen unter `src/lib/email/templates/`:
  - `_layout.tsx` — Marken-Layout (Wortmarke `ARC·ONE` + Clay-Balken, Footer) und wiederverwendbare Bausteine (`Eyebrow`, `Heading`, `Paragraph`, `InfoRow`, `Panel`, `AddressBlock`). Markenfarben als feste Hex-Werte aus `globals.css` (Clay `#C4704F`), da E-Mail-Clients keine CSS-Variablen unterstützen.
  - `deposit-confirmation.tsx` (#1), `shop-purchase-confirmation.tsx` (#2), `inquiry-atelier.tsx` (#3), `inquiry-receipt.tsx` (#4), `new-order-atelier.tsx` (#5).
  - `index.ts` — Barrel-Export der Vorlagen + Props für die Sender.
- Vorlagen sind **reine Präsentation**: sie erhalten anzeige-fertige Props (vorformatierte Preise als Strings). Das DB→View-Mapping übernehmen die Sender im Backend-Schritt.
- `npx tsc --noEmit` ist für alle PROJ-7-Dateien fehlerfrei (verbleibende tsc-Fehler liegen in vorbestehenden Testdateien `shop.test.ts`/`index.test.ts` und sind unabhängig von diesem Feature).

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
