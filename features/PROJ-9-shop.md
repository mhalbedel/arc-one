# PROJ-9: Shop (fertige Produkte)

## Status: Planned
**Created:** 2026-06-03
**Last Updated:** 2026-06-03

## Übersicht

Der Shop verkauft **fertige, nicht-konfigurierbare Produkte mit Festpreis**: fertige Leuchten,
**fertige Arcs** (nur als-ist kaufbar, nicht mehr konfigurierbar), Schalen, Tische und weitere
Objekte aus der Schreinerei. Premium-/Kunst-Objekte (z. B. Wurzelholz, monumentale Tischplatten)
werden hervorgehoben und laufen über einen **Anfrage-Flow** statt Direktkauf.

Der Shop zeigt eine **Vereinigung** zweier Datenquellen:
- **Fertige Arcs** bleiben in der `arcs`-Tabelle, erhalten aber einen neuen Status **`FIXED`**
  (verlässt Konfigurator + Arc-Katalog, erscheint im Shop).
- **Nicht-Arc-Objekte** liegen in einer neuen `products`-Tabelle.

Der Konfigurator (PROJ-3) und der Arc-Katalog (PROJ-2) laden weiterhin **ausschließlich
konfigurierbare** Arcs (Status `READY`).

## Dependencies
- **PROJ-1** (Datenbank-Schema) — `arcs`, `orders`, `customers`-Tabellen; neuer Arc-Status `FIXED`, neue Tabellen `products` + `product_inquiries`
- **PROJ-4** (Pre-Order & Stripe) — Direktkauf wiederverwendet den Single-Item-Stripe-Flow (Payment Element, Kontaktformular, `customers`/`orders`), vereinfacht auf 100 % Sofortzahlung ohne 30/70-Split
- **PROJ-5** (Admin-Backend) — Produktverwaltung und Anfragen-Liste reihen sich in die bestehende Admin-Shell ein; FIXED-Status-Umschaltung erweitert das bestehende Arc-Formular und den Status-Workflow
- **PROJ-2** (Arc-Katalog) — Hero-CTA „Shop" neben dem Arc-CTA; Konfigurator/Katalog dürfen keine `FIXED`-Arcs anzeigen
- **PROJ-7** (E-Mail-System) — Benachrichtigungen für neue Anfragen und Kaufbestätigungen (out of scope hier; nur Hinweistexte)

## User Stories

### Endkunde (B2C) — Käufer
- Als Endkunde möchte ich fertige Objekte (Leuchten, Schalen, Tische, fertige Arcs) im Shop durchstöbern und nach Kategorie filtern, damit ich sofort verfügbare Stücke finde.
- Als Endkunde möchte ich auf einer Produktdetailseite Fotos (Galerie), ggf. ein 3D-Modell, Maße, Beschreibung und den Festpreis sehen, damit ich eine Kaufentscheidung treffen kann.
- Als Endkunde möchte ich ein direkt-kaufbares Produkt mit Kreditkarte/SEPA über Stripe sofort vollständig bezahlen, damit ich es verbindlich erwerbe.
- Als Endkunde möchte ich erkennen, wenn ein Stück bereits verkauft ist, damit ich nicht versuche, ein nicht mehr verfügbares Unikat zu kaufen.

### Endkunde (B2C) — Interessent
- Als Interessent an einem Premium-/Kunst-Objekt möchte ich eine Anfrage mit meinen Kontaktdaten und einer Nachricht senden, damit das Atelier mich zu diesem Einzelstück berät.

### Admin
- Als Admin möchte ich Nicht-Arc-Produkte anlegen, bearbeiten und löschen (Kategorie, Tier, Preis, Kaufmodus, Fotos, 3D, Maße, Beschreibung), damit ich das Shop-Sortiment pflege.
- Als Admin möchte ich einen fertigen Arc per Status `FIXED` als-ist in den Shop stellen (mit eigenem Festpreis) und diesen Schritt rückgängig machen können, damit ich Einzelstücke flexibel zwischen Konfigurator und Shop verschieben kann.
- Als Admin möchte ich alle eingegangenen Anfragen in einer Liste sehen und ihren Status pflegen (NEU → KONTAKTIERT → ABGESCHLOSSEN), damit keine Anfrage verloren geht.
- Als Admin möchte ich Shop-Käufe in derselben Bestellübersicht wie Arc-Pre-Orders sehen, damit ich alle Bestellungen an einem Ort verwalte.

## Out of Scope

- **Warenkorb / Mehrere Artikel pro Checkout** — jedes Stück ist ein Unikat (Menge 1); Checkout immer genau ein Artikel. Kein Cart, keine kombinierte Versandberechnung.
- **30/70-Deposit-Split** — der Shop ist 100 % Sofortzahlung; der Split bleibt PROJ-4 (Arc-Pre-Order).
- **Konfigurierbare Produkte** — Konfiguration bleibt ausschließlich PROJ-3 (Arc-Konfigurator). Shop-Produkte sind nicht konfigurierbar.
- **Lampen-„Series" (Tisch/Hängeleuchte/Cluster)** — das sind Montage-Varianten konfigurierbarer Arcs → späterer **Filter im Arc-Katalog (PROJ-2, deferred)**, nicht Teil des Shops.
- **Bestandsmengen > 1 / Lagerverwaltung** — keine Stückzahlen; jedes Produkt ist Menge 1 (verkauft = nicht mehr verfügbar).
- **Admin-verwaltbare Kategorien (CRUD)** — Kategorien sind ein fester Enum im Code (siehe Produktentscheidungen). Neue Kategorie = kleine Code-Änderung.
- **Kategorie „Stühle"** — bewusst zum Start ausgelassen; später ergänzbar.
- **E-Mail-Versand** (Anfrage-Benachrichtigung an Admin, Kaufbestätigung an Kunde) — PROJ-7; hier nur Hinweistexte und DB-Persistenz.
- **B2B-spezifische Funktionen** (CAD-Downloads, Projektanfragen) — PROJ-8.
- **Gutscheine / Rabattcodes** — nicht in v1.
- **Internationale Lieferung** — nur DE/AT/CH (wie PROJ-4).
- **Preisanzeige bei Anfrage-Produkten** — bewusst „Preis auf Anfrage", keine Zahl (Entscheidung 9.3 / unten).

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Shop-Browse (`/shop`)

- [ ] Angenommen es existieren veröffentlichte Shop-Produkte und `FIXED`-Arcs, wenn ein Besucher `/shop` aufruft, dann sieht er eine Übersicht aller verfügbaren Objekte (Vereinigung aus `products` und `arcs` mit Status `FIXED`).
- [ ] Angenommen die Shop-Übersicht wird angezeigt, wenn der Besucher eine Kategorie (Leuchten / Schalen & Accessoires / Tische & Möbel) wählt, dann werden nur Objekte dieser Kategorie angezeigt.
- [ ] Angenommen ein Objekt hat das Tier „Premium/Art", wenn es in der Übersicht erscheint, dann wird es visuell hervorgehoben (Badge / hervorgehobene Platzierung).
- [ ] Angenommen ein Produkt ist im Kaufmodus „Direktkauf", wenn es in der Liste erscheint, dann wird sein Festpreis angezeigt.
- [ ] Angenommen ein Produkt ist im Kaufmodus „Anfrage", wenn es in der Liste erscheint, dann wird statt eines Preises „Preis auf Anfrage" angezeigt.
- [ ] Angenommen ein Produkt ist bereits verkauft, wenn die Übersicht angezeigt wird, dann bleibt es **sichtbar und als „Verkauft" markiert**, ist aber nicht kaufbar.
- [ ] Angenommen der Admin hat ein Objekt auf „ausgeblendet" gesetzt, wenn die Shop-Übersicht angezeigt wird, dann erscheint dieses Objekt nicht (unabhängig davon, ob verkauft oder verfügbar).
- [ ] Angenommen es existieren keine veröffentlichten Shop-Objekte, wenn ein Besucher `/shop` aufruft, dann sieht er einen Leerzustand mit Hinweistext statt einer leeren Seite.

### Produktdetail (`/shop/[slug]`)

- [ ] Angenommen ein Shop-Objekt existiert, wenn der Besucher die Detailseite aufruft, dann sieht er die Foto-Galerie, ggf. das 3D-Modell, Maße, Beschreibung und (bei Direktkauf) den Festpreis.
- [ ] Angenommen das Objekt ein fertiger Arc (`FIXED`) ist, wenn die Detailseite geladen wird, dann werden dessen vorhandene Front-/Rückfotos und der 3D-Scan angezeigt.
- [ ] Angenommen das Objekt im Direktkauf-Modus und verfügbar ist, wenn die Detailseite geladen wird, dann wird ein „Jetzt kaufen"-CTA angezeigt.
- [ ] Angenommen das Objekt im Anfrage-Modus ist, wenn die Detailseite geladen wird, dann wird statt „Jetzt kaufen" ein „Anfrage senden"-CTA und „Preis auf Anfrage" angezeigt.
- [ ] Angenommen das Objekt bereits verkauft ist, wenn die Detailseite geladen wird, dann ist der Kauf-CTA deaktiviert und der Status „Verkauft" sichtbar.
- [ ] Angenommen ein Slug zeigt auf kein existierendes/veröffentlichtes Objekt, wenn die Detailseite aufgerufen wird, dann wird eine 404-Seite angezeigt.

### Direktkauf (Stripe, 100 %)

- [ ] Angenommen ein verfügbares Direktkauf-Objekt, wenn der Besucher auf „Jetzt kaufen" klickt, dann gelangt er in einen Single-Item-Checkout mit Kontakt-/Lieferdaten-Formular (analog PROJ-4, ohne Konfigurationsübersicht).
- [ ] Angenommen der Besucher füllt das Checkout-Formular aus, dann sind Vorname, Nachname, E-Mail und Lieferadresse (Straße, PLZ, Stadt, Land) Pflichtfelder; nur DE/AT/CH wählbar.
- [ ] Angenommen der Besucher hat die Pflichtfelder korrekt ausgefüllt, wenn er die Zahlung startet, dann wird das Stripe Payment Element angezeigt und der **Gesamtbetrag = Festpreis + Versand** (nicht 30 %) belastet.
- [ ] Angenommen das Produkt hat einen festen Versand-Override (z. B. Spedition), wenn der Checkout den Gesamtbetrag berechnet, dann wird dieser Override-Betrag statt der landesabhängigen Standard-Versandkosten verwendet.
- [ ] Angenommen das Produkt hat keinen Versand-Override, wenn der Besucher das Lieferland wählt, dann gelten die festen Standard-Versandkosten je Land (DE 29 €, AT/CH 49 €).
- [ ] Angenommen die Zahlung erfolgreich ist, dann wird ein `orders`-Datensatz (Typ: Shop, voller Betrag bezahlt) und ggf. `customers`-Datensatz angelegt, und das Objekt wird als „verkauft" markiert (`products.status` bzw. Arc-Status → `SOLD`).
- [ ] Angenommen die Zahlung fehlschlägt, dann bleibt der Besucher im Checkout, sieht eine Fehlermeldung, und das Objekt bleibt verfügbar.
- [ ] Angenommen die Zahlung erfolgreich ist, dann sieht der Besucher eine Bestätigungsseite mit Bestellnummer und Zusammenfassung.

### Anfrage (Premium/Art)

- [ ] Angenommen ein Anfrage-Objekt, wenn der Besucher auf „Anfrage senden" klickt, dann erscheint ein Formular mit Name, E-Mail (Pflicht), optional Telefon, und einer Nachricht.
- [ ] Angenommen der Besucher sendet eine gültige Anfrage ab, dann wird ein `product_inquiries`-Datensatz (Status `NEU`, Produktreferenz) angelegt und eine Bestätigung „Wir melden uns bei dir" angezeigt.
- [ ] Angenommen der Besucher lässt ein Pflichtfeld leer oder gibt eine ungültige E-Mail ein, wenn er absendet, dann wird eine Validierungsfehlermeldung pro Feld angezeigt und die Eingabe bleibt erhalten.

### Fertiger Arc → Shop (`FIXED`)

- [ ] Angenommen ein Arc hat Status `READY`, wenn der Admin ihn auf `FIXED` setzt und einen Shop-Festpreis bestätigt (vorausgefüllt mit `basePrice`), dann erscheint der Arc im Shop und **verschwindet aus Konfigurator und Arc-Katalog**.
- [ ] Angenommen ein Arc hat Status `FIXED`, wenn ein Besucher den Arc-Katalog (`/arcs`) oder den Konfigurator aufruft, dann ist dieser Arc dort nicht enthalten.
- [ ] Angenommen ein Arc hat Status `FIXED`, wenn der Admin ihn zurück auf `READY` setzt, dann verschwindet er aus dem Shop und ist wieder im Konfigurator/Katalog verfügbar.

### Admin — Produktverwaltung

- [ ] Angenommen der Admin ist eingeloggt, wenn er die Produktverwaltung öffnet, dann sieht er eine Liste aller Nicht-Arc-Produkte mit Kategorie, Tier, Kaufmodus, Preis und Status.
- [ ] Angenommen der Admin legt ein neues Produkt an, dann sind Name, Kategorie, Tier, Kaufmodus, Beschreibung und mindestens ein Foto erforderlich; bei Direktkauf ist ein Preis Pflicht, bei Anfrage nicht.
- [ ] Angenommen der Admin legt/bearbeitet ein Direktkauf-Produkt, dann kann er optional einen **festen Versandpreis (Override)** eingeben (z. B. für sperrige Möbel/Tische per Spedition); ohne Eingabe gelten die Standard-Versandkosten je Land.
- [ ] Angenommen der Admin bearbeitet ein Objekt, dann kann er dessen **Sichtbarkeit** umschalten (veröffentlicht / ausgeblendet), unabhängig vom Verkaufsstatus.
- [ ] Angenommen der Admin bearbeitet ein Produkt, dann werden die Änderungen gespeichert und sind sofort im Shop sichtbar.
- [ ] Angenommen ein Produkt hat noch keine Bestellung/Anfrage, wenn der Admin es löscht, dann erscheint ein Bestätigungsdialog bevor es entfernt wird.
- [ ] Angenommen ein Produkt ist bereits verkauft (hat eine Order), wenn der Admin es zu löschen versucht, dann wird das Löschen verhindert oder das Produkt nur archiviert (Referenzintegrität bleibt erhalten).

### Admin — Anfragen

- [ ] Angenommen Anfragen existieren, wenn der Admin die Anfragen-Liste öffnet, dann sieht er alle Anfragen mit Produkt, Name, E-Mail, Nachricht, Datum und Status.
- [ ] Angenommen der Admin öffnet eine Anfrage, wenn er den Status ändert (NEU → KONTAKTIERT → ABGESCHLOSSEN), dann wird der neue Status gespeichert.

### Admin — Bestellungen (vereinheitlicht)

- [ ] Angenommen ein Shop-Kauf wurde abgeschlossen, wenn der Admin die bestehende Bestellübersicht öffnet, dann erscheint der Shop-Kauf dort neben den Arc-Pre-Orders, erkennbar als Shop-Bestellung.

## Edge Cases

- **Gleichzeitiger Kauf desselben Unikats:** Zwei Besucher starten parallel den Checkout für dasselbe Stück. Da es keinen Reservierungsschritt gibt, muss der Verkauf serverseitig atomar sein — der erste erfolgreiche Stripe-Charge markiert das Objekt als `SOLD`; der zweite Versuch wird vor/bei Zahlung mit „Dieses Stück wurde gerade verkauft" abgewiesen. Race-Condition serverseitig absichern (z. B. bedingtes Update auf Status).
- **Objekt wird während des Ausfüllens verkauft:** Beim Absenden des Checkouts (vor Stripe) Verfügbarkeit erneut prüfen; falls bereits verkauft → Fehlermeldung statt Charge.
- **Doppel-Submit / Doppel-Charge:** Kauf-/Anfrage-Button nach erstem Klick deaktivieren.
- **`FIXED`-Arc mit aktiver Reservierung/Bestellung:** Ein Arc, der `RESERVED`/`ORDERED` ist, darf nicht direkt auf `FIXED` gesetzt werden (nur aus `READY`). Admin-Aktion muss diesen Übergang verhindern.
- **Produkt löschen mit verknüpfter Order:** Löschen verhindern / nur Archivieren, damit Bestell-Historie und Referenzen erhalten bleiben.
- **Leere/Spam-Anfrage:** Pflichtfelder validieren; mehrfaches schnelles Absenden serverseitig begrenzen (Rate-Limit, analog offener Punkt aus PROJ-4).
- **Foto-Upload schlägt fehl:** Beim Anlegen/Bearbeiten eines Produkts klare Fehlermeldung; Produkt wird nicht ohne mindestens ein Foto veröffentlicht.
- **Anfrage-Produkt im Direktkauf-CTA:** Kaufmodus „Anfrage" darf niemals einen Stripe-Checkout starten (server- und clientseitig durchsetzen).

## Technical Requirements

- Single-Item-Checkout wiederverwendet die PROJ-4-Stripe-Komponenten (Payment Element, Kontaktformular), Betrag = 100 % (Festpreis + Versand).
- Preis- und Verfügbarkeitsprüfung ausschließlich serverseitig — kein Client-Trust.
- Verkauf eines Unikats muss atomar erfolgen (kein Doppelverkauf).
- Fotos im bestehenden Storage-Pattern (`arcs-media`-Bucket bzw. analoger Produkt-Pfad); 3D-Modelle als `.glb` via `model-viewer`.
- HTTPS (Vercel enforced).

## Open Questions

- [x] **Versandkosten für sperrige Möbel/Tische** → Gelöst (2026-06-03): Pro Produkt **optionaler fester Versand-Override** durch den Admin (insb. für große Tische/Möbel per Spedition). Ist kein Override gesetzt, gelten die festen PROJ-4-Beträge je Land (DE 29 €, AT/CH 49 €).
- [x] **Verkaufte Objekte in der Übersicht** → Gelöst (2026-06-03): Verkaufte Stücke bleiben **sichtbar und als „Verkauft" markiert**. Zusätzlich entscheidet der Admin pro Objekt über die **Sichtbarkeit** (veröffentlicht / ausgeblendet) — unabhängig vom Verkaufsstatus.
- [ ] Slug-Generierung für Produkte (aus Name) und für `FIXED`-Arcs (Seriennummer?) — Detail für `/architecture`.
- [ ] Soll der Admin pro Kauf eine manuelle Bestätigung/Statuspflege brauchen, oder ist der Shop-Kauf nach Zahlung sofort `SOLD`/abgeschlossen? (Vorschlag: nach Zahlung automatisch abgeschlossen.)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Scope = Storefront **+ volle Admin-Verwaltung** in einer Spec | Nutzerwunsch: gesamter Shop als eine Einheit; Spec strukturiert Storefront- und Admin-Hälfte je eigenständig testbar | 2026-06-03 |
| Kaufmodus per Produkt-Flag (`direct` \| `inquiry`), vom Admin gesetzt | Maximale Flexibilität — Premium-Stück kann trotzdem Direktkauf sein, Standard-Stück kann Anfrage sein; entkoppelt von Kategorie | 2026-06-03 |
| Anfragen in neuer `product_inquiries`-Tabelle + Admin-Liste (NEU → KONTAKTIERT → ABGESCHLOSSEN) | Nachverfolgbarkeit; B2B-`projects`-Tabelle ist semantisch unpassend für anonyme B2C-Anfragen; E-Mail-Versand erst PROJ-7 | 2026-06-03 |
| Alle Objekte sind Unikate (Menge 1), Single-Item-Checkout, **kein Warenkorb** | Konsistent mit Arc-Philosophie; verkauft = weg; wiederverwendet PROJ-4-Flow; minimale Komplexität | 2026-06-03 |
| Shop-Käufe in **vereinheitlichter `orders`-Tabelle** + bestehende Bestellübersicht | Admin verwaltet alle Bestellungen an einem Ort; Deposit-Felder ungenutzt, voller Betrag auf einmal | 2026-06-03 |
| Fertiger Arc = neuer **reversibler Status `FIXED`** (nicht Boolean-Flag) | Eine Quelle der Wahrheit (Status); passt zum bestehenden Status-Workflow in PROJ-5; verlässt Konfigurator/Katalog eindeutig | 2026-06-03 |
| Taxonomie = zwei Felder: `category` (Typ) + `tier` (Standard \| Premium/Art) | Kategorie zum Filtern/Gruppieren, Tier zum Hervorheben; unabhängig (eine Schale kann Premium sein) | 2026-06-03 |
| Kategorien als **fester Enum im Code** (kein CRUD) | Selten ändernde Liste; vermeidet Over-Engineering für kleines Team | 2026-06-03 |
| Start-Kategorien: **Leuchten · Schalen & Accessoires · Tische & Möbel** (Stühle später) | Aktuelles Sortiment laut Copy/Sitemap; Stühle bei Bedarf ergänzbar | 2026-06-03 |
| `FIXED`-Arc-Preis = **admin-gesetzter Festpreis** (vorausgefüllt mit `basePrice`) | Keine Konfigurations-Aufpreise mehr; Admin kann fertiges Stück abweichend bepreisen | 2026-06-03 |
| Anfrage-Produkte zeigen **„Preis auf Anfrage"** (keine Zahl, kein „ab") | High-End-/Kunst-Positionierung; deckt Entscheidung 9.3 (keine festen Preise im Copy) | 2026-06-03 |
| Produktmedien: **Foto-Galerie (1–N) + optionales `.glb`-3D**; `FIXED`-Arcs nutzen vorhandene Front/Rück + Scan | Konsistente Präsentation mit Arc-Detail; 3D optional für Schreinerei-Objekte | 2026-06-03 |
| Direktkauf = **100 % Sofortzahlung** (kein 30/70-Split) | Fertige Ware wird sofort bezahlt; 30/70 bleibt der Arc-Pre-Order vorbehalten | 2026-06-03 |
| **Optionaler fester Versand-Override** pro Produkt; sonst feste PROJ-4-Beträge je Land | Große Tische/Möbel gehen per Spedition mit individuellen Kosten; Standardfälle bleiben einfach | 2026-06-03 |
| Verkaufte Stücke bleiben **sichtbar als „Verkauft"** + zusätzlicher **Admin-Sichtbarkeits-Toggle** je Objekt | Verkaufte Unikate signalisieren Nachfrage/Authentizität; Admin behält volle Kontrolle, was im Shop erscheint | 2026-06-03 |

### Technical Decisions
_To be added by /architecture_

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
