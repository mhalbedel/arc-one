# PROJ-4: Pre-Order & Stripe

## Status: Planned
**Created:** 2026-05-27
**Last Updated:** 2026-05-27

## Dependencies
- PROJ-1 (Datenbank-Schema & Supabase-Setup) — `orders`- und `customers`-Tabelle
- PROJ-3 (Konfigurator) — Reservierung setzt `reserved_by` (Session-ID) und leitet zu `/checkout/[arc_id]`
- PROJ-7 (E-Mail-System) — Bestätigungsmail nach Deposit-Zahlung (out of scope hier)

## User Stories

- Als Endkunde möchte ich nach der Reservierung meine Konfiguration und den Gesamtpreis nochmal sehen, bevor ich meine Daten eingebe.
- Als Endkunde möchte ich meine Kontakt- und Lieferdaten eingeben, damit mein Arc an die richtige Adresse geliefert werden kann.
- Als Endkunde möchte ich angeben können, ob meine Rechnungsadresse von der Lieferadresse abweicht.
- Als Endkunde möchte ich sicher mit Kreditkarte oder SEPA per Stripe zahlen, damit ich meinen Arc verbindlich bestellen kann.
- Als Endkunde möchte ich nach erfolgreicher Zahlung eine Bestätigung mit meiner Bestellnummer sehen.
- Als Endkunde möchte ich informiert werden, wenn meine Reservierung abgelaufen ist, damit ich weiß, dass ich neu reservieren muss.

## Out of Scope

- **70%-Restbetrag-Zahlung** — PROJ-5 (Admin-Backend); hier nur das 30%-Deposit
- **Bestätigungsmail** — PROJ-7 (E-Mail-System); Checkout zeigt nur den Hinweis, dass eine Mail kommt
- **Kundenkonto / Login** — kein Auth für Endkunden in v1; reiner Gast-Checkout
- **Stripe-Webhooks & asynchrone Zahlungsverarbeitung** — PROJ-5; hier nur synchroner Payment-Intent-Flow
- **Versandkosten-Kalkulator** — kein Gewichtsbasierter Preis; Fixbeträge pro Land (DE/AT/CH)
- **Internationale Lieferung** — nur DE, AT, CH in v1
- **Gutscheine / Rabattcodes** — nicht in v1
- **Mehrere Arcs in einem Checkout** — kein Warenkorb; immer genau ein Arc
- **Arc-Konfiguration im Checkout ändern** — zurück zum Konfigurator über separaten Link möglich; kein Inline-Edit

## Acceptance Criteria

### Einstieg & Reservierungsprüfung

- [ ] Angenommen ein Nutzer ruft `/checkout/[arc_id]` auf und die Reservierung (`reserved_until`) ist noch gültig, dann wird die Checkout-Seite angezeigt.
- [ ] Angenommen ein Nutzer ruft `/checkout/[arc_id]` auf und die Reservierung ist abgelaufen oder nicht vorhanden, dann wird er zurück zum Konfigurator (`/konfigurator/[arc_id]`) geleitet mit der Meldung "Deine Reservierung ist abgelaufen."
- [ ] Angenommen ein Arc hat einen anderen Status als `RESERVED`, wenn `/checkout/[arc_id]` aufgerufen wird, dann wird eine Fehlerseite angezeigt.

### Konfigurationsübersicht

- [ ] Angenommen die Checkout-Seite wird geladen, dann wird die gewählte Konfiguration (Schliff, Befestigung, Finish, Licht) angezeigt.
- [ ] Angenommen die Checkout-Seite wird geladen, dann wird die vollständige Preisaufschlüsselung (Grundpreis, Aufpreise, Versand, Gesamt) angezeigt.
- [ ] Angenommen die Checkout-Seite wird geladen, dann ist der Deposit-Betrag (30% des Gesamtpreises inkl. Versand) klar ausgewiesen.

### Kontaktdaten-Formular

- [ ] Angenommen der Nutzer füllt das Formular aus, dann sind Vorname, Nachname, E-Mail und Lieferadresse (Straße, PLZ, Stadt, Land) Pflichtfelder.
- [ ] Angenommen der Nutzer füllt das Formular aus, dann ist Telefon ein optionales Feld.
- [ ] Angenommen der Nutzer lässt ein Pflichtfeld leer und klickt auf "Weiter zur Zahlung", dann wird eine Validierungsfehlermeldung pro Feld angezeigt.
- [ ] Angenommen der Nutzer gibt eine ungültige E-Mail-Adresse ein, dann wird eine Fehlermeldung angezeigt.
- [ ] Angenommen das Feld "Land" wird angezeigt, dann sind nur DE, AT und CH als Optionen verfügbar.
- [ ] Angenommen der Nutzer wählt das Land, dann wird der entsprechende Versandpreis automatisch in der Preisübersicht aktualisiert (DE: 29 €, AT: 49 €, CH: 49 €).
- [ ] Angenommen die Checkbox "Rechnungsadresse entspricht Lieferadresse" ist angehakt (Standard), dann wird kein separates Rechnungsadress-Formular angezeigt.
- [ ] Angenommen der Nutzer deaktiviert die Checkbox "Rechnungsadresse entspricht Lieferadresse", dann erscheint ein zweites Formular für die Rechnungsadresse mit denselben Pflichtfeldern.

### Stripe-Zahlung

- [ ] Angenommen der Nutzer hat alle Pflichtfelder korrekt ausgefüllt, wenn er auf "Jetzt zahlen (30% Deposit)" klickt, dann wird das Stripe Payment Element angezeigt.
- [ ] Angenommen der Nutzer schließt die Stripe-Zahlung erfolgreich ab, dann wird der Arc-Status auf `ORDERED` gesetzt und ein `orders`-Datensatz sowie ein `customers`-Datensatz werden angelegt.
- [ ] Angenommen die Stripe-Zahlung schlägt fehl (z.B. Karte abgelehnt), dann bleibt der Nutzer auf der Checkout-Seite, sieht eine Fehlermeldung ("Zahlung fehlgeschlagen — bitte eine andere Zahlungsmethode versuchen"), und die Reservierung bleibt aktiv.
- [ ] Angenommen die Zahlung erfolgreich ist, dann wird der Nutzer zur Bestätigungsseite `/checkout/[arc_id]/bestaetigung` weitergeleitet.

### Bestätigungsseite

- [ ] Angenommen der Nutzer wird auf die Bestätigungsseite weitergeleitet, dann wird die Bestellnummer angezeigt.
- [ ] Angenommen die Bestätigungsseite angezeigt wird, dann sieht der Nutzer eine Zusammenfassung seiner Bestellung (Arc, Konfiguration, gezahlter Deposit-Betrag, ausstehender Restbetrag).
- [ ] Angenommen die Bestätigungsseite angezeigt wird, dann wird der Hinweis angezeigt: "Eine Bestätigungsmail wurde an [E-Mail] gesendet."
- [ ] Angenommen die Bestätigungsseite direkt ohne vorherigen Checkout aufgerufen wird (kein gültiger Order), dann wird eine 404-Seite angezeigt.

## Edge Cases

- **Reservierung läuft während des Ausfüllens des Formulars ab**: Beim Absenden des Formulars (vor Stripe-Aufruf) prüfen ob die Reservierung noch gültig ist — wenn nicht, Fehlermeldung anzeigen.
- **Dopple-Submit**: Button nach dem ersten Klick deaktivieren, um doppelte Stripe-Charges zu verhindern.
- **Session-ID stimmt nicht überein**: Wenn `reserved_by` (Session-ID des Arcs) nicht mit der Session-ID des aktuellen Browsers übereinstimmt, wird die Checkout-Seite trotzdem angezeigt (Session-IDs sind nicht geheim; ein gestohlener Arc-Link ist kein Sicherheitsproblem — wer zuerst zahlt, bestellt).
- **Netzwerkfehler nach Stripe-Zahlung**: Wenn die Weiterleitung zur Bestätigungsseite fehlschlägt (Netzwerk), aber der Charge erfolgreich war, muss der Webhook (PROJ-5) den Order-Status setzen — für PROJ-4 zeigt Stripe selbst einen Erfolgshinweis.
- **Stripe Payment Intent bleibt hängen**: Timeout nach 30 Sekunden, Fehlermeldung mit Aufforderung es erneut zu versuchen.
- **Ungültige PLZ für gewähltes Land**: Validierung beim Absenden prüft PLZ-Format je nach Land (DE: 5 Ziffern, AT: 4 Ziffern, CH: 4 Ziffern).

## Technical Requirements

- Stripe Payment Element (neueste Stripe.js Version) — keine eigene Kreditkarten-Maske
- Kein Kundenkonto / kein Auth erforderlich
- Preisberechnungen ausschließlich server-seitig — kein Client-Trust
- HTTPS erforderlich (Vercel enforced)

## Open Questions

- [ ] Welche Stripe-Account-Währung? Vermutlich EUR — bestätigen bevor /architecture.
- [ ] Soll der Deposit exakt 30,00% sein oder auf den nächsten Cent gerundet werden?

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Checkout-Flow: Zusammenfassung → Kontaktdaten → Stripe | Nutzer sieht alles vor dem Commit; klar strukturierter Kaufprozess | 2026-05-27 |
| Lieferadresse + optionale separate Rechnungsadresse | Checkbox-Standard: gleiche Adresse; Formular nur bei expliziter Abweichung | 2026-05-27 |
| Versandpreis als Fixbetrag je Land (DE: 29€, AT/CH: 49€) | Einfach für Prototyp; exakte Kalkulation im späteren Admin-Backend | 2026-05-27 |
| 70%-Restbetrag-Zahlung → PROJ-5 | Für MVP reicht das Deposit; Admin-Abwicklung des Rests separat | 2026-05-27 |
| Gast-Checkout ohne Login | Kein Kundenkonto in v1 laut PRD; reduziert Conversion-Hürde | 2026-05-27 |
| Abgelaufene Reservierung → zurück zum Konfigurator | Klarer Weg für Nutzer; Konfigurator erlaubt neue Reservierung | 2026-05-27 |

### Technical Decisions
<!-- Added by /architecture -->

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
