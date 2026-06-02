# Product Requirements Document — ARC-ONE

## Vision

ARC-ONE ist eine High-End-Manufaktur-Website für handgefertigte Eukalyptus-Leuchten. Jeder Leuchtschirm (ein **Arc**) ist ein physisches Unikat aus dem Eukalyptusforst bei Monchique, Algarve, Portugal. Die Website digitalisiert den gesamten Manufaktur-Prozess: von der Erfassung jedes einzelnen Arcs über einen interaktiven Konfigurator bis hin zur Pre-Order-Abwicklung und dem Versand.

## Target Users

**Endkunden (B2C)**
Architektur-affine Käufer in DE/AT/CH, die individuelle Wohnaccessoires schätzen und bereit sind, für Handwerksqualität und Unikate einen Premiumpreis zu zahlen. Kaufentscheidung dauert Tage bis Wochen.

**Architekten & Innendesigner (B2B)**
Planer, die ARC-ONE Leuchten in Projekten einsetzen. Benötigen CAD-Daten, technische Spezifikationen und ein direktes Bestellkanals. Reagieren auf Vertrauenssignale und professionelle Kommunikation.

**Admin / Manufaktur-Team**
Kleines Team (1-3 Personen), das Arcs erfasst, Bestellungen verwaltet, Drops plant und den B2B-Zugang verwaltet. Kein technisches Vorwissen vorauszusetzen.

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | Datenbank-Schema & Supabase-Setup | Approved |
| P0 (MVP) | Arc-Katalog (Homepage + Browse + Detail) | Deployed |
| P0 (MVP) | Konfigurator (5 Schritte + Reservierung) | Deployed |
| P0 (MVP) | Preisgestaltung (zentrale Preismatrix, PROJ-3a) | Deployed |
| P0 (MVP) | Pre-Order & Stripe (30%/70%-Split) | Deployed |
| P0 (MVP) | Admin-Backend (verstecktes CMS — inkl. Pflege Preismatrix PROJ-3a) | Roadmap |
| P1 | Drop & Warteliste | Roadmap |
| P1 | E-Mail-System (Resend) | Roadmap |
| P2 | B2B-Portal (Architekten) | Roadmap |
| P2 | Art Tier (Wurzelholz-Galerie) | Roadmap |
| P2 | SEO & Performance | Roadmap |

## Success Metrics

- Erstes Pre-Order innerhalb der ersten 4 Wochen nach Launch
- Konversionsrate Katalog → Konfigurator-Start: > 5 %
- Konfigurator-Abschlussrate (Start → Pre-Order): > 30 %
- Warteliste: > 200 bestätigte Einträge vor erstem Drop
- Admin kann neuen Arc in < 10 Minuten erfassen und veröffentlichen

## Constraints

- Kleines Team: Entwicklung durch 1 Person + Claude Code
- Alle Arcs sind Unikate — kein Warenkorb, kein Bestandsmanagement im klassischen Sinne
- Nur Deutsch in v1 (Mehrsprachigkeit later)
- Versand nur DE/AT/CH in v1
- Kein Kundenkonto (Gast-Checkout)

## Non-Goals (v1)

- Kundenkonto / Login für Endkunden
- Produktempfehlungen oder KI-gestützte Arc-Suche
- Mehrsprachigkeit
- Internationale Versandberechnung (außer DE/AT/CH)
- Mobile App (iOS/Android)
- ERP-Integration
- Automatischer 3D-Scan-Import
- Virtuelle Raumplanung (AR)
- Live-Chat / Support-System
- Affiliate-Programm
