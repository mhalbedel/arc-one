# PROJ-5: Admin-Backend (verstecktes CMS)

## Status: Planned
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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
