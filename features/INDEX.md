# Feature Index

> Central tracking for all features. Updated by skills automatically.

## Status Legend
- **Roadmap** - `/init` done, feature identified in feature map, no spec file yet
- **Planned** - `/write-spec` done, full spec written, architecture not yet designed
- **Architected** - `/architecture` done, tech design approved, ready to build
- **In Progress** - `/frontend` or `/backend` active or completed, not yet in QA
- **In Review** - `/qa` active, testing in progress
- **Approved** - `/qa` passed, no critical/high bugs, ready to deploy
- **Deployed** - `/deploy` done, live in production

## Features

| ID | Feature | Status | Spec | Created |
|----|---------|--------|------|---------|
| PROJ-1 | Datenbank-Schema & Supabase-Setup | Approved | [PROJ-1](PROJ-1-datenbank-supabase-setup.md) | 2026-05-26 |
| PROJ-2 | Arc-Katalog | Deployed | [PROJ-2](PROJ-2-arc-katalog.md) | 2026-05-26 |
| PROJ-3 | Konfigurator | Deployed | [PROJ-3](PROJ-3-konfigurator.md) | 2026-05-26 |
| PROJ-3a | Preisgestaltung (Konfigurator) | Deployed | [PROJ-3a](PROJ-3a-preisgestaltung.md) | 2026-06-01 |
| PROJ-4 | Pre-Order & Stripe | Deployed | [PROJ-4](PROJ-4-pre-order-stripe.md) | 2026-05-26 |
| PROJ-5 | Admin-Backend | Deployed | [PROJ-5](PROJ-5-admin-backend.md) | 2026-05-26 |
| PROJ-6 | Drop & Warteliste | Roadmap | — | 2026-05-26 |
| PROJ-7 | E-Mail-System (Resend) | Deployed | [PROJ-7](PROJ-7-email-system.md) | 2026-05-26 |
| PROJ-8 | B2B-Portal | Roadmap | — | 2026-05-26 |
| PROJ-9 | Shop (fertige Produkte) | Deployed | [PROJ-9](PROJ-9-shop.md) | 2026-05-26 |
| PROJ-10 | SEO & Performance | Roadmap | — | 2026-05-26 |
| PROJ-11 | Die Manufaktur (Content-Seiten) | Roadmap | — | 2026-06-02 |
| PROJ-12 | Kollektionen / Showcase → **Merged in PROJ-9** | Merged | — | 2026-06-02 |
| PROJ-13 | Service & Rechtliches (FAQ, Versand, Kontakt, Impressum, Datenschutz) | Roadmap | — | 2026-06-02 |
| PROJ-14 | Brand Logo (Arc Initial) & Clay Favicon | Deployed | [PROJ-14](PROJ-14-brand-logo-favicon.md) | 2026-06-12 |
| PROJ-15 | Coming-Soon-PIN-Tor (nur auf Vercel) | In Progress | [PROJ-15](PROJ-15-coming-soon-gate.md) | 2026-06-16 |

<!-- Add features above this line -->

> Hinweis: **PROJ-9 ist der Shop** für *fertige, nicht-konfigurierbare Produkte mit Festpreis* — fertige Lampen, **fertige Arcs** (nur als-ist kaufbar, nicht mehr konfigurierbar), Schalen, Tische, Stühle u. a. aus der Schreinerei; teils auch auf Anfrage. **Datenmodell (Union):** fertige Arcs bleiben in der `arcs`-Tabelle (Flag/Status „finished/fixed"), Nicht-Arc-Objekte in eigener `products`-Tabelle — der Shop zeigt eine **Vereinigung** beider. Konfigurator/Arc-Katalog laden weiterhin nur **konfigurierbare** Arcs. **Dual-Kaufmodus:** Direktkauf via Stripe (100 %, abgeleitet aus PROJ-4) bzw. **Anfrage-Flow** für Premium-/Art-Objekte. Kategorien/Tiers heben Premium-/Kunst-Objekte hervor (ersetzt die frühere „Art Tier"-Idee). Direkter Shop-CTA auf der Hero-Seite neben dem Arc-CTA. PROJ-12 (Showcase/Anfrage) ist hierin aufgegangen.
>
> Lampen-„Series" (Tisch/Decke/Cluster) bleiben dagegen Montage-Varianten konfigurierbarer Arcs und werden später als Filter im Arc-Katalog (PROJ-2) abgebildet.

## Next Available ID: PROJ-16
