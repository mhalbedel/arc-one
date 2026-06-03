# PROJ-9: Shop (fertige Produkte)

## Status: In Progress
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
- **PROJ-4** (Pre-Order & Stripe) — Direktkauf wiederverwendet den Stripe-Flow (Payment Element, Kontaktformular, `customers`/`orders`), vereinfacht auf 100 % Sofortzahlung ohne 30/70-Split; **erweitert auf Mehr-Artikel-Checkout (Warenkorb)** mit kombinierter Versandberechnung
- **PROJ-5** (Admin-Backend) — Produktverwaltung und Anfragen-Liste reihen sich in die bestehende Admin-Shell ein; FIXED-Status-Umschaltung erweitert das bestehende Arc-Formular und den Status-Workflow
- **PROJ-2** (Arc-Katalog) — Hero-CTA „Shop" neben dem Arc-CTA; Konfigurator/Katalog dürfen keine `FIXED`-Arcs anzeigen
- **PROJ-7** (E-Mail-System) — Benachrichtigungen für neue Anfragen und Kaufbestätigungen (out of scope hier; nur Hinweistexte)

## User Stories

### Endkunde (B2C) — Käufer
- Als Endkunde möchte ich fertige Objekte (Leuchten, Schalen, Tische, fertige Arcs) im Shop durchstöbern und nach Kategorie filtern, damit ich sofort verfügbare Stücke finde.
- Als Endkunde möchte ich auf einer Produktdetailseite Fotos (Galerie), ggf. ein 3D-Modell, Maße, Beschreibung und den Festpreis sehen, damit ich eine Kaufentscheidung treffen kann.
- Als Endkunde möchte ich mehrere direkt-kaufbare Unikate in einen Warenkorb legen, damit ich sie in einem gemeinsamen Checkout zusammen kaufe.
- Als Endkunde möchte ich im Warenkorb alle gewählten Stücke, Einzelpreise, die kombinierten Versandkosten und den Gesamtbetrag sehen und einzelne Stücke wieder entfernen, damit ich meine Bestellung überblicke und anpasse.
- Als Endkunde möchte ich den gesamten Warenkorb mit Kreditkarte/SEPA über Stripe in einem Schritt vollständig bezahlen, damit ich alle Stücke verbindlich erwerbe.
- Als Endkunde möchte ich erkennen, wenn ein Stück bereits verkauft ist, damit ich nicht versuche, ein nicht mehr verfügbares Unikat zu kaufen.

### Endkunde (B2C) — Interessent
- Als Interessent an einem Premium-/Kunst-Objekt möchte ich eine Anfrage mit meinen Kontaktdaten und einer Nachricht senden, damit das Atelier mich zu diesem Einzelstück berät.

### Admin
- Als Admin möchte ich Nicht-Arc-Produkte anlegen, bearbeiten und löschen (Kategorie, Tier, Preis, Kaufmodus, Fotos, 3D, Maße, Beschreibung), damit ich das Shop-Sortiment pflege.
- Als Admin möchte ich einen fertigen Arc per Status `FIXED` als-ist in den Shop stellen (mit eigenem Festpreis) und diesen Schritt rückgängig machen können, damit ich Einzelstücke flexibel zwischen Konfigurator und Shop verschieben kann.
- Als Admin möchte ich alle eingegangenen Anfragen in einer Liste sehen und ihren Status pflegen (NEU → KONTAKTIERT → ABGESCHLOSSEN), damit keine Anfrage verloren geht.
- Als Admin möchte ich Shop-Käufe in derselben Bestellübersicht wie Arc-Pre-Orders sehen, damit ich alle Bestellungen an einem Ort verwalte.

## Out of Scope

- **30/70-Deposit-Split** — der Shop ist 100 % Sofortzahlung; der Split bleibt PROJ-4 (Arc-Pre-Order).
- **Bestellmengen > 1 pro Artikel** — jedes Stück ist ein Unikat (Menge fix 1). Der Warenkorb kann **mehrere verschiedene Unikate** enthalten, aber kein Stück mehrfach.
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

### Warenkorb (`/warenkorb`)

- [ ] Angenommen ein verfügbares Direktkauf-Objekt, wenn der Besucher auf „In den Warenkorb" klickt, dann wird das Stück dem Warenkorb hinzugefügt und die Warenkorb-Anzeige (Header-Indikator) aktualisiert sich.
- [ ] Angenommen ein Stück liegt bereits im Warenkorb, wenn der Besucher es erneut hinzuzufügen versucht, dann bleibt die Menge bei 1 (Unikat — kein doppeltes Hinzufügen, kein Mengen-Stepper).
- [ ] Angenommen der Warenkorb enthält Stücke, wenn der Besucher `/warenkorb` öffnet, dann sieht er alle enthaltenen Stücke mit Foto, Name, Einzelpreis, die **kombinierten Versandkosten** und den Gesamtbetrag.
- [ ] Angenommen der Warenkorb enthält Stücke, wenn der Besucher ein Stück entfernt, dann verschwindet es aus dem Warenkorb und der Gesamtbetrag (inkl. Versand) wird neu berechnet.
- [ ] Angenommen der Warenkorb ist leer, wenn der Besucher `/warenkorb` öffnet, dann sieht er einen Leerzustand mit Link zurück in den Shop.
- [ ] Angenommen nur Anfrage-Produkte (Premium/Art) existieren, wenn der Besucher deren Detailseite öffnet, dann gibt es **keinen** „In den Warenkorb"-Button (Anfrage-Produkte sind nicht warenkorbfähig).
- [ ] Angenommen ein Stück im Warenkorb wurde inzwischen verkauft, wenn der Warenkorb oder Checkout geladen wird, dann wird es als „nicht mehr verfügbar" markiert und vom Gesamtbetrag ausgenommen (blockiert den Checkout der übrigen Stücke nicht).

### Direktkauf / Checkout (Stripe, 100 %)

- [ ] Angenommen der Warenkorb enthält mindestens ein verfügbares Stück, wenn der Besucher auf „Zur Kasse" klickt, dann gelangt er in einen Mehr-Artikel-Checkout mit Kontakt-/Lieferdaten-Formular (analog PROJ-4) und einer Übersicht aller Warenkorb-Positionen.
- [ ] Angenommen der Besucher füllt das Checkout-Formular aus, dann sind Vorname, Nachname, E-Mail und Lieferadresse (Straße, PLZ, Stadt, Land) Pflichtfelder; nur DE/AT/CH wählbar.
- [ ] Angenommen der Besucher hat die Pflichtfelder korrekt ausgefüllt, wenn er die Zahlung startet, dann wird das Stripe Payment Element angezeigt und der **Gesamtbetrag = Summe aller Festpreise + kombinierter Versand** (nicht 30 %) in einem einzigen PaymentIntent belastet.
- [ ] Angenommen der Warenkorb enthält Stücke, wenn der Checkout den Versand berechnet, dann gilt: **Standard-Landpauschale einmal pro Bestellung** (DE 29 €, AT/CH 49 €) **plus die Summe aller produktspezifischen Versand-Overrides** der enthaltenen Stücke.
- [ ] Angenommen alle Warenkorb-Stücke haben keinen Override, wenn der Checkout den Versand berechnet, dann wird genau eine Landpauschale berechnet (nicht pro Stück).
- [ ] Angenommen die Zahlung erfolgreich ist, dann wird **ein** `orders`-Datensatz (Typ: Shop, voller Betrag bezahlt) mit **je einer `order_items`-Position pro Stück** und ggf. ein `customers`-Datensatz angelegt, und **jedes** gekaufte Objekt wird als „verkauft" markiert (`products.status → SOLD` bzw. FIXED-Arc `order_id` gesetzt).
- [ ] Angenommen die Zahlung fehlschlägt, dann bleibt der Besucher im Checkout, sieht eine Fehlermeldung, und **kein** Objekt wird als verkauft markiert (alle bleiben verfügbar).
- [ ] Angenommen mindestens ein Warenkorb-Stück wurde während des Checkouts von einem anderen Käufer verkauft, wenn der Besucher die Zahlung startet, dann wird er vor dem Charge informiert, das betroffene Stück wird entfernt und der Gesamtbetrag neu berechnet (kein Charge für nicht mehr verfügbare Stücke).
- [ ] Angenommen die Zahlung erfolgreich ist, dann sieht der Besucher eine Bestätigungsseite mit Bestellnummer und einer Zusammenfassung aller gekauften Stücke; der Warenkorb wird geleert.

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

- **Gleichzeitiger Kauf desselben Unikats:** Zwei Besucher haben dasselbe Stück im Warenkorb und starten parallel den Checkout. Da es keinen Reservierungsschritt gibt, muss der Verkauf serverseitig atomar sein — der erste erfolgreiche Stripe-Charge markiert das Objekt als `SOLD`; der zweite Versuch wird vor/bei Zahlung mit „Dieses Stück wurde gerade verkauft" abgewiesen. Race-Condition serverseitig absichern (bedingtes Update auf Status pro Position).
- **Teil-Verfügbarkeit im Warenkorb:** Ein von mehreren Warenkorb-Stücken ist beim Checkout bereits verkauft. Der Checkout darf nicht komplett scheitern: betroffenes Stück entfernen, Gesamtbetrag/Versand neu berechnen, Besucher informieren, übrige Stücke weiter kaufbar. Verfügbarkeit aller Positionen vor PaymentIntent-Erstellung serverseitig prüfen.
- **Atomarität über mehrere Positionen:** Bei erfolgreicher Zahlung müssen alle Positionen gemeinsam als verkauft markiert und an die Order gehängt werden; schlägt die Zahlung fehl, bleibt kein Stück verkauft.
- **Objekt wird während des Ausfüllens verkauft:** Beim Absenden des Checkouts (vor Stripe) Verfügbarkeit aller Positionen erneut prüfen; betroffene Stücke → Hinweis statt Charge.
- **Veraltete Warenkorb-Einträge:** Im Warenkorb (localStorage) liegende Stücke können zwischenzeitlich verkauft, ausgeblendet oder gelöscht worden sein. Warenkorb-/Checkout-Ansicht prüft Live-Verfügbarkeit und blendet nicht mehr kaufbare Positionen klar markiert aus.
- **Doppel-Submit / Doppel-Charge:** Kauf-/Anfrage-Button nach erstem Klick deaktivieren.
- **`FIXED`-Arc mit aktiver Reservierung/Bestellung:** Ein Arc, der `RESERVED`/`ORDERED` ist, darf nicht direkt auf `FIXED` gesetzt werden (nur aus `READY`). Admin-Aktion muss diesen Übergang verhindern.
- **Produkt löschen mit verknüpfter Order:** Löschen verhindern / nur Archivieren, damit Bestell-Historie und Referenzen erhalten bleiben.
- **Leere/Spam-Anfrage:** Pflichtfelder validieren; mehrfaches schnelles Absenden serverseitig begrenzen (Rate-Limit, analog offener Punkt aus PROJ-4).
- **Foto-Upload schlägt fehl:** Beim Anlegen/Bearbeiten eines Produkts klare Fehlermeldung; Produkt wird nicht ohne mindestens ein Foto veröffentlicht.
- **Anfrage-Produkt im Direktkauf-CTA:** Kaufmodus „Anfrage" darf niemals einen Stripe-Checkout starten (server- und clientseitig durchsetzen).

## Technical Requirements

- Mehr-Artikel-Checkout wiederverwendet die PROJ-4-Stripe-Komponenten (Payment Element, Kontaktformular), Betrag = 100 % (Summe Festpreise + kombinierter Versand) in einem PaymentIntent.
- Warenkorb wird clientseitig in `localStorage` gehalten (keine Kundenkonten); speichert nur Referenzen (Quelle + Code), Preise/Verfügbarkeit werden serverseitig aufgelöst.
- Preis-, Versand- und Verfügbarkeitsprüfung ausschließlich serverseitig — kein Client-Trust; der Client-Warenkorb ist nur eine Auswahl.
- Versandformel: **eine** Standard-Landpauschale pro Bestellung + Summe der produktspezifischen Overrides.
- Verkauf der Unikate muss positionsweise atomar erfolgen (kein Doppelverkauf), bei Zahlungserfolg gemeinsam, bei Fehlschlag gar nicht.
- Fotos im bestehenden Storage-Pattern (`arcs-media`-Bucket bzw. analoger Produkt-Pfad); 3D-Modelle als `.glb` via `model-viewer`.
- HTTPS (Vercel enforced).

## Open Questions

- [x] **Versandkosten für sperrige Möbel/Tische** → Gelöst (2026-06-03): Pro Produkt **optionaler fester Versand-Override** durch den Admin (insb. für große Tische/Möbel per Spedition). Ist kein Override gesetzt, gelten die festen PROJ-4-Beträge je Land (DE 29 €, AT/CH 49 €).
- [x] **Verkaufte Objekte in der Übersicht** → Gelöst (2026-06-03): Verkaufte Stücke bleiben **sichtbar und als „Verkauft" markiert**. Zusätzlich entscheidet der Admin pro Objekt über die **Sichtbarkeit** (veröffentlicht / ausgeblendet) — unabhängig vom Verkaufsstatus.
- [x] **Slug-Generierung** → Gelöst (2026-06-03, /architecture): **Serial/Code-only**. `FIXED`-Arcs nutzen ihre vorhandene `serial_number` als URL-Segment (`/shop/<serial_number>`). Nicht-Arc-Produkte erhalten beim Anlegen einen kurzen, eindeutigen **Produktcode** (z. B. `P-7F3K2`) als URL-Segment. Kein Name in der URL, keine manuelle Slug-Pflege.
- [x] **Auto-Abschluss nach Zahlung** → Gelöst (2026-06-03, /architecture): Shop-Kauf wird **nach erfolgreicher Zahlung automatisch abgeschlossen** (analog PROJ-4-Bestätigungsseite, idempotent). Das Objekt wird atomar als `SOLD` markiert, die Order als vollständig bezahlt gespeichert. Kein manueller Admin-Bestätigungsschritt; der Admin sieht den Kauf in der vereinheitlichten Bestellübersicht.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Scope = Storefront **+ volle Admin-Verwaltung** in einer Spec | Nutzerwunsch: gesamter Shop als eine Einheit; Spec strukturiert Storefront- und Admin-Hälfte je eigenständig testbar | 2026-06-03 |
| Kaufmodus per Produkt-Flag (`direct` \| `inquiry`), vom Admin gesetzt | Maximale Flexibilität — Premium-Stück kann trotzdem Direktkauf sein, Standard-Stück kann Anfrage sein; entkoppelt von Kategorie | 2026-06-03 |
| Anfragen in neuer `product_inquiries`-Tabelle + Admin-Liste (NEU → KONTAKTIERT → ABGESCHLOSSEN) | Nachverfolgbarkeit; B2B-`projects`-Tabelle ist semantisch unpassend für anonyme B2C-Anfragen; E-Mail-Versand erst PROJ-7 | 2026-06-03 |
| ~~Alle Objekte sind Unikate (Menge 1), Single-Item-Checkout, **kein Warenkorb**~~ → **ÜBERHOLT** (2026-06-03, /refine) | Ursprünglich für minimale Komplexität; vom Nutzer revidiert — mehrere Unikate sollen gemeinsam kaufbar sein | 2026-06-03 |
| **Warenkorb mit mehreren Unikaten** (Menge je Stück fix 1) + Mehr-Artikel-Checkout | Nutzerwunsch: mehrere Einzelstücke in einer Bestellung mit kombiniertem Versand kaufen; weiterhin keine Mengen > 1 (Unikate) | 2026-06-03 |
| Warenkorb client-seitig in **`localStorage`** (nur Referenzen), Auflösung serverseitig | Kein Kundenkonto (PRD); Preise/Verfügbarkeit dürfen nicht aus dem Client stammen | 2026-06-03 |
| **Anfrage-Produkte sind nicht warenkorbfähig** — bleiben im separaten Anfrage-Flow | Anfrage-Stücke haben keinen Preis und werden nicht über Stripe verkauft; Mischung im Cart wäre inkonsistent | 2026-06-03 |
| Kombinierter Versand: **eine Landpauschale pro Bestellung + Summe aller Produkt-Overrides** | Nutzer-Entscheidung (2026-06-03): normale Stücke teilen sich den Landversand, sperrige Override-Stücke (Spedition) gehen separat und addieren ihren Override | 2026-06-03 |
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
| Decision | Rationale | Date |
|----------|-----------|------|
| Neue Tabelle `products` für Nicht-Arc-Objekte; `FIXED`-Arcs bleiben in `arcs` | Arcs und Schreinerei-Objekte haben verschiedene Felder; Union wird im Code gebildet (zwei Abfragen, gemeinsame Anzeige-Form) statt einer überladenen Tabelle | 2026-06-03 |
| Shop-Browse/Detail als **Server-Component-Union** (zwei Queries, im Code gemerged), kein DB-View | Einfach, gut typisierbar, kein zusätzliches DB-Objekt; Datenmengen klein (Unikate) | 2026-06-03 |
| `products.status` = `AVAILABLE \| SOLD \| ARCHIVED` **plus** separates `is_published` (Sichtbarkeit) | Verkaufsstatus und Sichtbarkeit sind laut Spec unabhängig; zwei klare Felder statt eines überladenen Status | 2026-06-03 |
| Arc-Festpreis bei `FIXED` = vorhandene `base_price` (Admin überschreibt beim Umschalten), **keine neue Spalte** | Vermeidet Redundanz; `base_price` ist beim fertigen Stück der einzige relevante Preis (keine Konfig-Aufpreise mehr) | 2026-06-03 |
| ~~Orders erhalten `order_type` + nullable `product_id`~~ → **ANGEPASST** (2026-06-03, /refine): nur noch `order_type` an `orders`; statt `product_id` eine neue **`order_items`**-Tabelle (1 Order → N Positionen) | Mehr-Artikel-Checkout: eine Order referenziert mehrere Unikate; ein einzelnes `product_id` reicht nicht mehr. `arcs.order_id` (FIXED-Arc → Order) bleibt zusätzlich bestehen | 2026-06-03 |
| Neue Tabelle **`order_items`**: je Zeile eine Position (`order_id` + Referenz auf `product_id` **oder** `arc_id`, plus Preis-Snapshot) | Saubere 1:N-Modellierung; Preis-Snapshot je Position für Bestellhistorie; eine Position referenziert genau eine der beiden Quellen | 2026-06-03 |
| Versandberechnung serverseitig im Checkout-Endpoint: `landpauschale(country) + Σ overrides` | Versand hängt vom kompletten Warenkorb ab, nicht vom Einzelprodukt; muss serverseitig verbindlich berechnet werden | 2026-06-03 |
| Shop-Order nutzt bestehende `OrderStatus`-Werte: nach Zahlung `CONFIRMED` mit `deposit_paid_at` **und** `remaining_paid_at` gesetzt, `deposit_amount = total`, `remaining_amount = 0` | Kein neuer Status nötig; 100 %-Zahlung wird über die vorhandenen Felder abgebildet | 2026-06-03 |
| Atomare Verkaufssicherung über **bedingte Sperre** (`held_until`/`reserved_until`) beim Start des Checkouts, gesetzt nur wenn Objekt `AVAILABLE` | Serialisiert konkurrierende Käufe ohne Reservierungs-UI; wiederverwendet das `reserved_until`-Muster aus PROJ-3/4; finale `SOLD`-Markierung als bedingtes Update (`WHERE status = AVAILABLE`) | 2026-06-03 |
| Zahlungsabschluss wie PROJ-4 über die **Bestätigungsseite** (Stripe-Redirect, serverseitig idempotent), **kein neuer Webhook** | Konsistent mit bestehendem Pre-Order-Flow; vermeidet zusätzliche Infrastruktur | 2026-06-03 |
| Produkt-Slug = generierter **Produktcode** (`P-XXXXX`); FIXED-Arc-Slug = `serial_number` | Beschluss Open Question; keine Slug-Pflege, kollisionssicher, eine Route `/shop/[code]` für beide | 2026-06-03 |
| Produktmedien im **bestehenden `arcs-media`-Bucket** unter `products/`-Pfad | Kein neues Storage-Objekt; gleiche Upload-/Anzeige-Logik wie Arc-Fotos | 2026-06-03 |
| Kategorien als TypeScript-Enum (`leuchten` \| `schalen_accessoires` \| `tische_moebel`) | Spec-Entscheidung „fester Enum, kein CRUD"; FIXED-Arcs werden in `leuchten` einsortiert | 2026-06-03 |
| Anfrage-Endpoint mit einfacher **Rate-Limit-Begrenzung** (pro IP/Zeitfenster) | Spam-Schutz laut Edge Case; bewusst leichtgewichtig (kein externes Service) | 2026-06-03 |

---

## Tech Design (Solution Architect)

### Überblick (in einem Satz)
Der Shop ist eine zweite Storefront, die fertige Stücke aus zwei Quellen (neue `products`-Tabelle + Arcs im neuen Status `FIXED`) zu einer Ansicht vereint, einen vereinfachten 100-%-Stripe-Direktkauf (wiederverwendet aus PROJ-4) sowie einen Anfrage-Flow für Premium-/Kunst-Objekte bietet und sich in die bestehende Admin-Shell einreiht.

### A) Komponentenstruktur

**Öffentliche Storefront**
```
Homepage (bestehend)
+-- Hero — neuer zweiter CTA "Zum Shop" neben "Arc konfigurieren"

Header (bestehend) — neuer Warenkorb-Indikator (Anzahl Positionen) neben "Shop"

/shop  (Shop-Übersicht, Server Component)
+-- Kategorie-Filter (Leuchten · Schalen & Accessoires · Tische & Möbel)
+-- Shop-Grid
|   +-- Shop-Karte  (pro Objekt, Arc oder Produkt — einheitliche Anzeige)
|       +-- Foto, Name, Kategorie
|       +-- Preis  ODER  "Preis auf Anfrage"
|       +-- Badge "Premium/Art"   (bei Tier premium_art)
|       +-- Badge "Verkauft"      (bei Status SOLD)
+-- Leerzustand (kein Objekt veröffentlicht)

/shop/[code]  (Produktdetail, Server Component)
+-- Foto-Galerie  (1–N Bilder; FIXED-Arc: Front/Rück)
+-- 3D-Viewer (model-viewer, optional .glb / Arc-Scan)
+-- Maße, Beschreibung
+-- Preisblock
+-- CTA:  "In den Warenkorb"  (Direktkauf, verfügbar; bereits im Cart → "Im Warenkorb")
|         "Anfrage senden"    (Anfrage-Modus — NICHT warenkorbfähig)
|         deaktiviert + "Verkauft" (Status SOLD)
+-- Anfrage-Dialog (Name, E-Mail*, Telefon, Nachricht)

/warenkorb  (Warenkorb, Client — localStorage; Verfügbarkeit/Preise serverseitig aufgelöst)
+-- Positions-Liste (Foto, Name, Einzelpreis, Entfernen)
|   +-- nicht mehr verfügbare Position klar markiert + ausgenommen
+-- Versand (kombiniert) + Gesamtbetrag
+-- CTA "Zur Kasse"
+-- Leerzustand (Link zurück in den Shop)

/shop/checkout  (Mehr-Artikel-Checkout — wiederverwendet PROJ-4-Bausteine; liest Warenkorb)
+-- Kontakt-/Lieferdatenformular   (contact-form, bestehend)
+-- Bestellzusammenfassung          (alle Positionen + kombinierter Versand)
+-- Stripe Payment Element          (stripe-payment-form, bestehend)
/shop/checkout/bestaetigung  (Bestätigung — analog PROJ-4; Warenkorb wird geleert)
```

**Admin (in bestehende Admin-Shell eingereiht)**
```
Sidebar (bestehend) — zwei neue Einträge: "Shop" und "Anfragen"

/admin/shop          Produktliste (Tabelle: Name, Kategorie, Tier, Modus, Preis, Status, Sichtbar)
/admin/shop/neu      Produkt anlegen
/admin/shop/[id]     Produkt bearbeiten
+-- Produkt-Formular: Name, Kategorie, Tier, Kaufmodus, Beschreibung,
|   Preis (Pflicht bei Direktkauf), Versand-Override (optional),
|   Foto-Upload (>=1 Pflicht), optionales 3D, Maße, Sichtbarkeits-Toggle
+-- Löschen mit Bestätigungsdialog (nur wenn keine Order/Anfrage verknüpft)

/admin/anfragen      Anfragen-Liste (Produkt, Name, E-Mail, Nachricht, Datum, Status)
+-- Status-Umschaltung NEU → KONTAKTIERT → ABGESCHLOSSEN

Arc-Formular (bestehend) — Erweiterung:
+-- Status FIXED setzen (Festpreis-Bestätigung, vorausgefüllt mit base_price)
|   nur aus READY erlaubt; aus RESERVED/ORDERED gesperrt
+-- FIXED → READY zurücksetzen (zurück in Konfigurator/Katalog)

Bestellübersicht (bestehend) — Erweiterung:
+-- Shop-Käufe erscheinen mit Kennzeichnung "Shop" (order_type)
```

### B) Datenmodell (in Worten)

**Neue Tabelle `products`** (Nicht-Arc-Objekte)
- Eindeutige ID + kurzer **Produktcode** (für die URL, z. B. `P-7F3K2`)
- Name, Beschreibung
- Kategorie (eine von: Leuchten · Schalen & Accessoires · Tische & Möbel)
- Tier (Standard oder Premium/Art)
- Kaufmodus (Direktkauf oder Anfrage)
- Festpreis in Cent (Pflicht bei Direktkauf, leer bei Anfrage)
- Versand-Override in Cent (optional; sonst gelten die festen Beträge je Land)
- Fotos (Liste von Bild-URLs, mindestens eines), optionale 3D-Modell-URL
- Maße (Breite/Höhe/Tiefe in cm, Gewicht)
- Verkaufsstatus (`AVAILABLE` / `SOLD` / `ARCHIVED`)
- Sichtbarkeit (`is_published`: veröffentlicht / ausgeblendet) — unabhängig vom Verkaufsstatus
- Kurzzeit-Sperre (`held_until`) für die atomare Kaufsicherung
- Zeitstempel

**Neue Tabelle `product_inquiries`** (Anfragen)
- Eindeutige ID, Referenz auf das Produkt
- Name, E-Mail (Pflicht), Telefon (optional), Nachricht
- Status (`NEU` / `KONTAKTIERT` / `ABGESCHLOSSEN`)
- Zeitstempel

**Erweiterung `arcs`**
- Neuer Status-Wert **`FIXED`** (fertiger Arc, nur als-ist im Shop; verlässt Konfigurator + Katalog)
- Der Shop-Festpreis ist die vorhandene `base_price` (Admin setzt sie beim Umschalten)
- Vorhandene `reserved_until`/`reserved_by` werden für die Kaufsicherung wiederverwendet

**Erweiterung `orders`**
- Neues Feld **`order_type`** (`ARC_PREORDER` Standard / `SHOP`)
- 100-%-Zahlung wird über die vorhandenen Felder abgebildet: `deposit_amount` = Gesamtbetrag, `remaining_amount` = 0, nach Zahlung beide `*_paid_at` gesetzt, Status `CONFIRMED`
- `total_price` = Summe aller Positionen + kombinierter Versand; `shipping_price` = kombinierter Versand

**Neue Tabelle `order_items`** (Positionen einer Shop-Bestellung — 1 Order → N Stücke)
- Eindeutige ID, Referenz auf die `order_id`
- Genau **eine** Quellreferenz pro Position: `product_id` (Shop-Produkt) **oder** `arc_id` (FIXED-Arc)
- Preis-Snapshot in Cent (Festpreis zum Kaufzeitpunkt) + Name-Snapshot
- Jede Position = ein Unikat (Menge implizit 1)
- FIXED-Arc-Käufe setzen zusätzlich weiterhin `arcs.order_id` (Verknüpfung zur Order bleibt wie bei Pre-Orders)

**Gespeichert in:** Supabase (PostgreSQL) mit Row Level Security — öffentlich lesbar nur veröffentlichte/verkaufte Objekte; Schreibzugriff nur Admin; Anfragen/Orders über serverseitige Endpunkte (Service-Rolle), nicht direkt vom Client.

### C) Wie die wichtigsten Abläufe funktionieren

**Vereinte Shop-Übersicht.** Zwei Server-Abfragen — veröffentlichte `products` und Arcs mit Status `FIXED` — werden im Code in eine gemeinsame Anzeige-Form übersetzt und zusammen dargestellt. Arc-Katalog und Konfigurator filtern künftig explizit auf konfigurierbare Arcs (`READY` etc.) und schließen `FIXED` aus.

**Warenkorb.** „In den Warenkorb" legt eine Referenz (Quelle + Code) in `localStorage`. Der Header zeigt die Positionsanzahl. Die Warenkorb-Seite löst die Referenzen serverseitig auf (aktueller Preis, Verfügbarkeit, Versand-Override) und zeigt Positionen, kombinierten Versand und Gesamtbetrag; bereits verkaufte/ausgeblendete Positionen werden markiert und ausgenommen. Jedes Unikat kann nur einmal im Warenkorb liegen (Menge fix 1). Anfrage-Produkte sind nicht warenkorbfähig.

**Mehr-Artikel-Checkout (100 %).** „Zur Kasse" führt in den Checkout (Kontaktformular wie PROJ-4 + Positionsübersicht). Der Checkout-Endpoint prüft serverseitig die Verfügbarkeit **aller** Positionen und sperrt sie atomar kurz (`held_until`/`reserved_until`, nur wenn `AVAILABLE`); ist eine Position bereits weg, wird sie entfernt, der Betrag neu berechnet und der Kunde informiert (kein Charge dafür). **Versand = eine Landpauschale (DE 29 € / AT-CH 49 €) + Summe aller Produkt-Overrides** der enthaltenen Stücke. Es wird **ein** PaymentIntent über Summe der Festpreise + kombinierten Versand erstellt. Nach erfolgreicher Zahlung markiert die Bestätigungsseite idempotent **alle** Positionen als verkauft (`products.status → SOLD` bzw. FIXED-Arc `order_id` gesetzt), legt die Order mit ihren `order_items` an und leert den Warenkorb. Schlägt die Zahlung fehl, bleibt kein Stück verkauft.

**Anfrage (Premium/Art).** „Anfrage senden" öffnet ein kleines Formular; das Absenden legt über einen serverseitigen Endpunkt einen `product_inquiries`-Eintrag (Status `NEU`) an und zeigt eine Bestätigung. Ein einfaches Rate-Limit bremst Spam. Kaufmodus „Anfrage" startet niemals einen Stripe-Checkout (server- und clientseitig erzwungen).

**Fertiger Arc in den Shop.** Im Arc-Formular setzt der Admin einen `READY`-Arc auf `FIXED` und bestätigt den Festpreis (vorausgefüllt mit `base_price`). Der Arc verschwindet aus Konfigurator/Katalog und erscheint im Shop. Der Schritt ist reversibel (`FIXED` → `READY`). Aus `RESERVED`/`ORDERED` ist der Übergang gesperrt.

### D) Tech-Entscheidungen (warum, kurz)
- **Zwei Tabellen statt einer:** Arcs und Schreinerei-Objekte unterscheiden sich stark in ihren Feldern. Die Vereinigung im Code (zwei Abfragen) ist einfacher und sauberer als eine überladene Mischtabelle oder ein DB-View.
- **Verkaufsstatus und Sichtbarkeit getrennt:** Zwei klare Felder, weil ein verkauftes Stück sichtbar bleiben kann und ein verfügbares ausgeblendet werden kann.
- **Wiederverwendung des PROJ-4-Checkouts:** Spart Aufwand und hält den Bezahlfluss konsistent; nur Betragslogik (100 % statt 30 %) und Item-Quelle ändern sich.
- **Kein neuer Webhook:** Der bestehende Abschluss über die Stripe-Redirect-Bestätigungsseite genügt und vermeidet zusätzliche Infrastruktur.
- **Atomare Sperre statt Reservierungs-UI:** Bedingtes Update sichert Unikate gegen Doppelverkauf, ohne dem Kunden einen Reservierungsschritt zuzumuten.

### E) Abhängigkeiten (Pakete)
- Keine neuen npm-Pakete nötig. Wiederverwendet werden: Stripe (PROJ-4), `model-viewer` (3D, bereits im Einsatz), Zod + react-hook-form (Validierung), bestehende shadcn/ui-Komponenten (Tabs, Dialog, Table, Badge, Form, Select). Foto-Upload nutzt das bestehende Supabase-Storage-Muster.

## Implementation Notes

### Frontend — Storefront (Increment 1, 2026-06-03)
Erste, eigenständig lauffähige Hälfte: die kundenseitige Storefront. Build + Unit-Tests grün.

**Typen / Foundation**
- `src/types/database.ts`: neuer Arc-Status `FIXED`; neue Enums `ProductCategory`, `ProductTier`, `PurchaseMode`, `ProductStatus`, `InquiryStatus`, `OrderType`; neue Row-Typen `ProductRow`, `ProductInquiryRow`; `OrderRow` um `order_type` + `product_id` erweitert; `products` & `product_inquiries` im `Database`-Typ registriert.
- `src/types/index.ts`: Re-Exports + normalisierte Anzeige-Form `ShopItem`, `PRODUCT_CATEGORIES`, `PRODUCT_CATEGORY_LABELS`.
- `src/lib/shop.ts`: `productToShopItem` / `fixedArcToShopItem` (Union-Mapping). **Konvention:** verkaufter FIXED-Arc bleibt im Status `FIXED`, „verkauft" = gesetzte `order_id` (kollidiert nicht mit Pre-Order-`SOLD`).

**Komponenten** (`src/components/shop/`): `shop-card`, `shop-grid`, `category-filter` (Links, Aktiv-State serverseitig), `product-gallery` (Foto-Galerie + optionaler `model-viewer`-3D-Tab via CDN-Script), `inquiry-form` (Dialog, react-hook-form + Zod, POST an `/api/shop/inquiries`).

**Seiten**: `/shop` (Union aus `products` + FIXED-Arcs, Kategoriefilter, Premium-zuerst-Sortierung, Verkauft sichtbar, Leerzustand) und `/shop/[code]` (Detail; lädt Produkt per `product_code` oder FIXED-Arc per `serial_number`; Galerie, Maße, Preis/„Preis auf Anfrage", CTA „Jetzt kaufen" / „Anfrage senden" / „Verkauft", 404 via `notFound()`).

**Navigation**: zweiter Hero-CTA „Zum Shop" + Header-Link „Shop".

**Bewusst auf Increment 2 (nach `/backend`) verschoben — hängt an Tabellen/Endpunkten:**
- Warenkorb (`/warenkorb`) + Header-Indikator + Cart-State (`localStorage`-Hook) — **neu durch /refine 2026-06-03**.
- Mehr-Artikel-Checkout `/shop/checkout` (+ Bestätigungsseite) — Wiederverwendung der PROJ-4-Stripe-Bausteine, 100 %, kombinierter Versand.
- Admin-UI: Produktverwaltung (`/admin/shop` Liste/Formular), Anfragen-Liste (`/admin/anfragen`), `FIXED`-Umschaltung im Arc-Formular, Shop-Kennzeichnung in der Bestellübersicht, Sidebar-Einträge.

Detail- und Browse-Seiten rendern bereits gegen die echten Queries; bis `/backend` die Tabellen anlegt, liefern sie den Leerzustand bzw. 404 (kein Crash).

### Änderung durch /refine (2026-06-03) — Warenkorb statt Single-Item
Kernentscheidung revidiert: Shop bekommt einen **Warenkorb** (mehrere Unikate, kombinierter Versand). Auswirkungen auf bereits gebauten Increment-1-Code (anzupassen in Increment 2):
- `src/app/shop/[code]/page.tsx`: Direktkauf-CTA „Jetzt kaufen" (Link `/shop/checkout/[code]`) → **„In den Warenkorb"** (Cart-Aktion); Checkout wird warenkorb- statt einzelproduktbasiert.
- `src/types/database.ts`: `orders.product_id` wird **nicht** umgesetzt; stattdessen neue **`order_items`**-Tabelle (1 Order → N Positionen). `order_type` bleibt. Typ entsprechend anpassen, bevor `/backend` die Migration schreibt.
- Neu nötig: Cart-Zustand (`localStorage`), `ShopItem` ggf. um `shippingOverrideCents` ergänzen für die Warenkorb-Versandberechnung (Anzeige), verbindliche Berechnung bleibt serverseitig.
- Storefront-Browse/Detail (Increment 1) bleiben ansonsten gültig.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
