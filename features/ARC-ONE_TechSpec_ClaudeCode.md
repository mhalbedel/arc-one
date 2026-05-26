# ARC-ONE — Technisches Spec-Dokument
> Für Claude Code · Version 1.0 · Mai 2026  
> Unikat-Manufaktur für Eukalyptus-Lichtarchitektur · Monchique, Portugal

---

## Inhaltsverzeichnis

1. [Projekt-Übersicht](#1-projekt-übersicht)
2. [Technischer Stack](#2-technischer-stack)
3. [Repository-Struktur](#3-repository-struktur)
4. [Datenmodelle](#4-datenmodelle)
5. [Routing & Seitenstruktur](#5-routing--seitenstruktur)
6. [Konfigurator-Logik](#6-konfigurator-logik)
7. [Preiskalkulation](#7-preiskalkulation)
8. [Admin-Backend](#8-admin-backend)
9. [Drop & Warteliste System](#9-drop--warteliste-system)
10. [B2B / Architekt-Portal](#10-b2b--architekt-portal)
11. [3D-Datenbank & Medien](#11-3d-datenbank--medien)
12. [API-Endpunkte](#12-api-endpunkte)
13. [E-Mail-System](#13-e-mail-system)
14. [Sicherheit & Zugangskontrolle](#14-sicherheit--zugangskontrolle)
15. [SEO & Robots](#15-seo--robots)
16. [Smart Home / Technische Produktdaten](#16-smart-home--technische-produktdaten)
17. [Entwicklungs-Commands](#17-entwicklungs-commands)
18. [Offene Entscheidungen](#18-offene-entscheidungen)
19. [Out of Scope (v1)](#19-out-of-scope-v1)

---

## 1. Projekt-Übersicht

ARC-ONE ist eine High-End-Manufaktur-Website für handgefertigte Eukalyptus-Leuchten. Jeder Leuchtschirm (ein **Arc**) ist ein physisches Unikat aus dem Eukalyptusforst bei Monchique, Algarve, Portugal.

### Kernfunktionen

| Bereich | Beschreibung |
|---|---|
| Unikat-Katalog | ~3.000 digitalisierte Arcs, einzeln browsebar, 3D-Scan, Fotos |
| Konfigurator | 5-Schritt-Konfigurator: Rohling → Befestigung → Finish → Licht → Pre-Order |
| Drop-System | Limitierte Releases mit E-Mail-Warteliste |
| B2B-Portal | Zugangsgeschützter Bereich für Architekten (CAD, Specs, Projekte) |
| Art Tier | Separate Galerie für Wurzelholz-Objekte (ab 10.000 €) |
| Admin-Backend | Verstecktes CMS unter nicht-öffentlicher URL (`/admin`) |

### Geschäftsregeln (kritisch)

- Jeder Arc existiert **genau einmal** — nach Kauf wird er als `sold` markiert und aus dem Katalog entfernt
- Kein Arc kann in mehrere Warenkörbe gleichzeitig gelegt werden (Reservierung bei Konfigurator-Start)
- Pre-Order: 30 % Anzahlung bei Bestellung, 70 % vor Versand
- Admin-URL ist nicht verlinkt, nicht indexiert, nicht erratbar

---

## 2. Technischer Stack

### Empfehlung

```
Frontend:   Next.js 15 (App Router)
Styling:    Tailwind CSS + CSS Modules für komplexe Komponenten
Datenbank:  PostgreSQL (via Prisma ORM)
Dateien:    Cloudflare R2 (S3-kompatibel) für Fotos, 3D-Scans
Auth:       NextAuth.js (Admin + B2B-Login)
Payments:   Stripe (Pre-Order mit 30 % / 70 % Split)
E-Mail:     Resend (Transaktions-E-Mails + Drop-Alerts)
3D-Viewer:  model-viewer Web Component (Google) oder Three.js
Hosting:    Vercel oder Cloudflare Pages
```

### Umgebungsvariablen (`.env.local`)

```bash
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# R2 / S3
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Resend
RESEND_API_KEY=
EMAIL_FROM=studio@arc-one.com

# Admin (nicht in Logs schreiben)
ADMIN_PATH_SEGMENT=   # z.B. "k7x9m2" → URL wird /k7x9m2
ADMIN_SETUP_SECRET=   # Einmalig für ersten Admin-User
```

---

## 3. Repository-Struktur

```
arc-one/
├── CLAUDE.md                    # Diese Datei (Hauptreferenz für Claude Code)
├── .claude/
│   ├── agents/
│   │   ├── configurator.md      # Agent-Spec für Konfigurator-Logik
│   │   ├── admin-cms.md         # Agent-Spec für Admin-Operationen
│   │   └── pricing.md           # Agent-Spec für Preiskalkulation
│   └── settings.json
├── features/
│   ├── data-models.md           # Detaillierte DB-Schema-Dokumentation
│   ├── api.md                   # API-Endpunkte Detail
│   └── email-templates.md       # E-Mail-Vorlagen
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (public)/            # Öffentliche Routen
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── manufaktur/
│   │   │   ├── katalog/
│   │   │   │   ├── page.tsx     # Arc-Browser
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Arc-Detail + Konfigurator-Einstieg
│   │   │   ├── konfigurator/
│   │   │   │   └── [arcId]/
│   │   │   │       └── page.tsx
│   │   │   ├── drops/
│   │   │   ├── kollektionen/
│   │   │   ├── art-tier/
│   │   │   └── b2b/
│   │   ├── [adminSegment]/      # Admin — Segment aus ENV-Variable
│   │   │   ├── layout.tsx       # Auth-Guard
│   │   │   ├── page.tsx         # Dashboard
│   │   │   ├── arcs/            # Arc-Verwaltung
│   │   │   ├── drops/           # Drop-Verwaltung
│   │   │   ├── orders/          # Bestellungen
│   │   │   ├── b2b/             # B2B-Accounts
│   │   │   └── content/         # CMS-Texte
│   │   └── api/
│   │       ├── arcs/
│   │       ├── configurator/
│   │       ├── orders/
│   │       ├── drops/
│   │       ├── waitlist/
│   │       ├── b2b/
│   │       └── webhooks/
│   ├── components/
│   │   ├── catalog/
│   │   ├── configurator/
│   │   ├── arc-viewer/          # 3D-Viewer Wrapper
│   │   ├── drops/
│   │   ├── admin/
│   │   └── ui/                  # Basis-Komponenten
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── pricing.ts           # Preiskalkulations-Engine
│   │   ├── availability.ts      # Arc-Reservierungs-Logik
│   │   ├── stripe.ts
│   │   ├── resend.ts
│   │   └── r2.ts
│   └── types/
│       └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── public/
```

---

## 4. Datenmodelle

### `Arc` (Rohling / Leuchtschirm)

```prisma
model Arc {
  id            String        @id @default(cuid())
  serialNumber  String        @unique  // z.B. "ARV-1847"
  
  // Physische Eigenschaften
  widthCm       Float
  heightCm      Float
  depthCm       Float
  weightGrams   Int
  
  // Herkunft
  harvestDate   DateTime?
  forestSection String?       // z.B. "Monchique Sektor 3"
  cutNumber     Int?
  
  // Charakter (Admin-Text, erscheint im Katalog)
  character     String        // Freitext-Beschreibung der Maserung, Wölbung etc.
  
  // Medien
  photoFrontUrl String?       // R2-URL Foto Seite A
  photoBackUrl  String?       // R2-URL Foto Seite B
  scan3dUrl     String?       // R2-URL .glb oder .usdz für model-viewer
  
  // Kompatibilität (Admin setzt diese Flags)
  compatOhne    Boolean       @default(true)
  compatWand    Boolean       @default(true)
  compatDecke   Boolean       @default(true)
  compatSpinne  Boolean       @default(false)  // nur bei geprüfter Statik
  maxSpinnePendants Int?      // null = nicht für Spinne freigegeben
  
  // Finish-Eignung
  compatOel     Boolean       @default(true)
  compatLack    Boolean       @default(true)
  compatSchellack Boolean     @default(true)
  
  // Status
  status        ArcStatus     @default(RAW)
  
  // Preisgestaltung
  basePrice     Int           // Grundpreis in Cent (z.B. 38000 = 380,00 €)
  
  // Drop-Zugehörigkeit
  dropId        String?
  drop          Drop?         @relation(fields: [dropId], references: [id])
  
  // Reservierung (temporär während Konfigurator-Session)
  reservedUntil DateTime?
  reservedBy    String?       // Session-ID
  
  // Bestellung
  orderId       String?       @unique
  order         Order?        @relation(fields: [orderId], references: [id])
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

enum ArcStatus {
  RAW           // Gefällt, noch nicht bearbeitet
  IN_PROGRESS   // In Bearbeitung
  READY         // Fertig, im Katalog verfügbar
  RESERVED      // Temporär reserviert (Konfigurator aktiv)
  ORDERED       // Pre-Order eingegangen
  IN_PRODUCTION // Wird gerade für Auftrag gefertigt
  SHIPPED       // Versandt
  SOLD          // Abgeschlossen
  ARCHIVED      // Ausgemustert
}
```

### `Order` (Bestellung / Pre-Order)

```prisma
model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique  // z.B. "ARC-2026-0042"
  
  // Arc (1:1)
  arc             Arc?
  
  // Konfiguration (snapshot zum Bestellzeitpunkt)
  config          Json          // { mounting, finish, light, spinneCount }
  
  // Preise (snapshot)
  basePrice       Int
  mountingPrice   Int
  finishPrice     Int
  lightPrice      Int
  shippingPrice   Int
  totalPrice      Int           // alles in Cent
  
  // Lieferzeit (Werktage ab Auftragsbestätigung)
  estimatedDays   Int
  
  // Kunde
  customerId      String?
  customer        Customer?     @relation(fields: [customerId], references: [id])
  
  // B2B
  b2bAccountId    String?
  b2bAccount      B2BAccount?   @relation(fields: [b2bAccountId], references: [id])
  
  // Zahlungen
  depositAmount   Int           // 30 %
  remainingAmount Int           // 70 %
  depositPaidAt   DateTime?
  remainingPaidAt DateTime?
  stripeDepositId String?
  stripeRemainId  String?
  
  // Status
  status          OrderStatus   @default(PENDING_CONFIRMATION)
  
  // Interne Notizen (Admin)
  adminNotes      String?
  
  // Kommunikation
  confirmedAt     DateTime?
  confirmedBy     String?       // Admin-User-ID
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

enum OrderStatus {
  PENDING_CONFIRMATION   // Warten auf Admin-Bestätigung (max. 24h)
  CONFIRMED              // Bestätigt, Anzahlung ausstehend
  DEPOSIT_PAID           // Anzahlung eingegangen, Produktion startet
  IN_PRODUCTION          // In Fertigung
  READY_TO_SHIP          // Fertig, Restbetrag ausstehend
  REMAINING_PAID         // Vollständig bezahlt
  SHIPPED                // Versandt
  DELIVERED              // Zugestellt
  CANCELLED              // Storniert
}
```

### `Drop`

```prisma
model Drop {
  id            String      @id @default(cuid())
  title         String      // z.B. "Drop #12 — Die weiten Bögen"
  slug          String      @unique
  
  // Zeitplanung
  scheduledAt   DateTime    // Wann der Drop live geht
  closesAt      DateTime?   // Optional: Ablaufdatum
  
  // Status
  status        DropStatus  @default(DRAFT)
  
  // Arcs in diesem Drop
  arcs          Arc[]
  
  // Wartelisten-Benachrichtigung
  alertSentAt   DateTime?
  alertCount    Int         @default(0)
  
  // Texte (optional, für Drop-Seite)
  description   String?
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum DropStatus {
  DRAFT
  SCHEDULED
  LIVE
  CLOSED
  ARCHIVED
}
```

### `WaitlistEntry`

```prisma
model WaitlistEntry {
  id          String    @id @default(cuid())
  email       String    @unique
  confirmedAt DateTime? // Double-Opt-In
  token       String    @unique @default(cuid())
  
  createdAt   DateTime  @default(now())
}
```

### `B2BAccount`

```prisma
model B2BAccount {
  id            String    @id @default(cuid())
  companyName   String
  contactName   String
  email         String    @unique
  phone         String?
  website       String?
  
  // Auth
  passwordHash  String
  
  // Freigabe
  approvedAt    DateTime?
  approvedBy    String?
  
  // Zugang
  canDownloadCAD     Boolean @default(false)
  canRequestProjects Boolean @default(false)
  
  orders        Order[]
  projects      Project[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### `Customer`

```prisma
model Customer {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  phone       String?
  address     Json?    // { street, city, zip, country }
  orders      Order[]
  createdAt   DateTime @default(now())
}
```

### `Project` (B2B-Projektanfrage)

```prisma
model Project {
  id           String        @id @default(cuid())
  b2bAccountId String
  b2bAccount   B2BAccount    @relation(fields: [b2bAccountId], references: [id])
  
  title        String
  description  String?
  arcCount     Int?           // Geplante Anzahl Arcs
  mountingType String?        // Mounting-Typ (Spinne, Decke etc.)
  budget       Int?           // Geschätztes Budget in Cent
  
  status       ProjectStatus @default(INQUIRY)
  adminNotes   String?
  
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

enum ProjectStatus {
  INQUIRY
  REVIEWING
  QUOTED
  ACCEPTED
  IN_PROGRESS
  COMPLETED
  REJECTED
}
```

### `AdminUser`

```prisma
model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  role         AdminRole @default(EDITOR)
  lastLoginAt  DateTime?
  createdAt    DateTime @default(now())
}

enum AdminRole {
  SUPER_ADMIN
  EDITOR
  VIEWER
}
```

---

## 5. Routing & Seitenstruktur

### Öffentliche Routen

| Route | Seite | Notes |
|---|---|---|
| `/` | Homepage | SSG, revalidate 1h |
| `/manufaktur` | Die Manufaktur | SSG |
| `/katalog` | Arc-Browser | SSR mit Filter-Params |
| `/katalog/[id]` | Arc-Detail + Konfigurator-Einstieg | SSR |
| `/konfigurator/[arcId]` | Konfigurator (5 Schritte) | Client-side, Arc reservieren bei Aufruf |
| `/konfigurator/[arcId]/bestaetigung` | Bestätigungsseite nach Pre-Order | |
| `/drops` | Drops-Übersicht | SSR |
| `/drops/[slug]` | Drop-Detail | SSR |
| `/warteliste/bestaetigung` | Double-Opt-In Landing | |
| `/kollektionen` | Serienprodukte | SSG |
| `/art-tier` | Galerie Wurzelholz | SSG |
| `/b2b` | B2B-Portal Landing | SSG |
| `/b2b/login` | Login | |
| `/b2b/portal` | Portal (auth-geschützt) | |
| `/b2b/portal/projekte` | Projektanfragen | |

### Admin-Routen (versteckt)

```
/[ADMIN_PATH_SEGMENT]/                  → Dashboard
/[ADMIN_PATH_SEGMENT]/arcs              → Arc-Liste
/[ADMIN_PATH_SEGMENT]/arcs/[id]         → Arc bearbeiten
/[ADMIN_PATH_SEGMENT]/arcs/neu          → Arc erfassen
/[ADMIN_PATH_SEGMENT]/drops             → Drop-Liste
/[ADMIN_PATH_SEGMENT]/drops/[id]        → Drop bearbeiten
/[ADMIN_PATH_SEGMENT]/orders            → Bestellungen
/[ADMIN_PATH_SEGMENT]/orders/[id]       → Bestellung bearbeiten
/[ADMIN_PATH_SEGMENT]/b2b               → B2B-Accounts
/[ADMIN_PATH_SEGMENT]/b2b/projekte      → Projektanfragen
/[ADMIN_PATH_SEGMENT]/content           → CMS-Texte
/[ADMIN_PATH_SEGMENT]/waitlist          → Warteliste verwalten
/[ADMIN_PATH_SEGMENT]/einstellungen     → System-Einstellungen
```

---

## 6. Konfigurator-Logik

### Zustandsmodell (Client-seitig, in URL-Params gespiegelt)

```typescript
interface ConfiguratorState {
  arcId: string           // Arc-ID aus DB
  step: 1 | 2 | 3 | 4 | 5
  mounting: MountingType | null
  spinneCount: number     // 3–12, nur wenn mounting === 'spinne'
  finish: FinishType | null
  light: LightType | null
}

type MountingType = 'ohne' | 'wand' | 'decke' | 'spinne'
type FinishType   = 'oel' | 'lack' | 'schellack'
type LightType    = 'standard' | 'led' | 'ultra'
```

### Arc-Reservierung

```typescript
// Bei Aufruf von /konfigurator/[arcId]:
// 1. Prüfen ob Arc status === 'READY' und nicht reservedUntil > now()
// 2. Wenn verfügbar: Arc reservieren für 30 Minuten
//    UPDATE arc SET status='RESERVED', reservedUntil=NOW()+30min, reservedBy=sessionId
// 3. Wenn nicht verfügbar: Redirect → /katalog mit Hinweis "Dieser Arc ist nicht mehr verfügbar"
// 4. Cron-Job alle 5 Minuten: abgelaufene Reservierungen zurücksetzen (RESERVED → READY)

// Timer im Frontend: sichtbarer Countdown (30 min), bei Ablauf Warnung
```

### Schritt-Validierung

```typescript
// Schritt 2 (Befestigung): nur kompatible Optionen zeigen
// - ohne:   arc.compatOhne === true
// - wand:   arc.compatWand === true
// - decke:  arc.compatDecke === true
// - spinne: arc.compatSpinne === true

// Spinne: spinneCount zwischen 3 und arc.maxSpinnePendants (default 12)

// Schritt 3 (Finish): nur kompatible Optionen zeigen
// Schritt 4 (Licht): alle Optionen immer verfügbar
```

### Pre-Order Submission

```typescript
// POST /api/orders/create
// Body: { arcId, config: ConfiguratorState, customerEmail, customerName, ... }
// 
// Server-seitig:
// 1. Arc-Verfügbarkeit final prüfen
// 2. Preis berechnen (server-side, nicht dem Client vertrauen)
// 3. Order erstellen (status: PENDING_CONFIRMATION)
// 4. Arc status → ORDERED
// 5. Stripe-Session für 30 % Deposit erstellen
// 6. E-Mail an Kunden: Bestellbestätigung + Deposit-Link
// 7. E-Mail an Admin: Neue Pre-Order zur Prüfung
// 8. Response: { orderId, stripeSessionUrl }
```

---

## 7. Preiskalkulation

**Wichtig: Preisberechnung IMMER server-seitig. Client-Preis ist nur Display.**

```typescript
// src/lib/pricing.ts

interface PricingConfig {
  mounting: {
    ohne:   number   // 0
    wand:   number   // 8500   (85 €)
    decke:  number   // 9500   (95 €)
    spinne: number   // 7500   (75 € pro Pendel)
  }
  finish: {
    oel:        number   // 0
    lack:       number   // 4500   (45 €)
    schellack:  number   // 18000  (180 €)
  }
  light: {
    standard:   number   // 0
    led:        number   // 6500   (65 €)
    ultra:      number   // 32000  (320 €)
  }
}

function calculatePrice(arc: Arc, config: ConfiguratorState): PriceBreakdown {
  const base = arc.basePrice
  
  let mounting = PRICING.mounting[config.mounting ?? 'ohne']
  if (config.mounting === 'spinne') {
    mounting = mounting * (config.spinneCount ?? 3)
  }
  
  const finish   = PRICING.finish[config.finish ?? 'oel']
  const light    = PRICING.light[config.light ?? 'standard']
  const subtotal = base + mounting + finish + light
  
  // Versandkosten: separat berechnet (Gewicht + Destination)
  // Lieferzeit
  let deliveryDays = 14
  if (config.finish === 'schellack') deliveryDays += 7
  if (config.finish === 'lack')      deliveryDays += 1
  if (config.mounting === 'spinne' && (config.spinneCount ?? 3) > 6) deliveryDays += 3
  
  return {
    base, mounting, finish, light,
    subtotal,
    deposit:   Math.ceil(subtotal * 0.30),
    remaining: subtotal - Math.ceil(subtotal * 0.30),
    deliveryDaysMin: deliveryDays,
    deliveryDaysMax: deliveryDays + 7
  }
}
```

---

## 8. Admin-Backend

### Zugang & Sicherheit

- URL: `/${process.env.ADMIN_PATH_SEGMENT}` (aus ENV, nie hartcodiert)
- Auth: NextAuth Credentials Provider (E-Mail + Passwort)
- Sessions: 8 Stunden, danach Re-Login
- Kein Link im Frontend, kein `<meta>` mit Admin-URL
- Rate-Limiting auf Login-Route: max. 5 Versuche / 15 min / IP

### Arc erfassen (Kernfunktion des Admins)

```
Felder im Admin-Formular:
  - Serial Number (auto-generiert: ARV-XXXX, überschreibbar)
  - Fotos: Upload Seite A + Seite B (direkt zu R2)
  - 3D-Scan: Upload .glb Datei (direkt zu R2)
  - Abmessungen: Breite, Höhe, Tiefe (cm), Gewicht (g)
  - Erntedatum, Waldsektor, Schnittnummer
  - Charakter-Text (Freitext, erscheint im Katalog)
  - Grundpreis (€)
  - Kompatibilitäts-Flags: Ohne / Wand / Decke / Spinne
  - Max. Spinne-Pendel
  - Finish-Kompatibilität: Öl / Lack / Schellack
  - Status: RAW / IN_PROGRESS / READY / ...
  - Drop zuweisen (optional)
```

### Status-Workflow

```
RAW → IN_PROGRESS → READY → (RESERVED) → ORDERED → IN_PRODUCTION → SHIPPED → SOLD
                                ↑                                              ↓
                                └────────────── bei Timeout ──────────────────┘
```

### Drop erstellen

```
1. Drop-Titel + Slug + Geplantes Datum
2. Arcs aus READY-Liste hinzufügen
3. Status → SCHEDULED
4. System: Warteliste-Alert manuell oder automatisch auslösen (scheduledAt)
5. Status → LIVE (manuell oder zum Zeitpunkt scheduledAt)
```

---

## 9. Drop & Warteliste System

### Warteliste (Double-Opt-In)

```
1. User gibt E-Mail ein → POST /api/waitlist
2. System: WaitlistEntry erstellen (unbestätigt)
3. E-Mail mit Bestätigungslink (Token-basiert)
4. User klickt Link → GET /api/waitlist/confirm?token=XXX
5. confirmedAt wird gesetzt
6. Bestätigungs-Seite: "Sie stehen auf der Liste."
```

### Drop-Alert senden

```typescript
// POST /api/admin/drops/[id]/send-alert  (nur Admin)
// 
// 1. Alle WaitlistEntry WHERE confirmedAt IS NOT NULL
// 2. Batch-E-Mails via Resend (max. 100/Batch, mit Delay)
// 3. Drop.alertSentAt = now(), alertCount = count
// 
// E-Mail-Inhalt: Drop-Titel, Datum, direkter Link zum Drop, Abmelde-Link
```

### Gleichzeitiger Zugriff bei Drop-Start

```
Problem: Viele User greifen gleichzeitig auf denselben Arc zu.
Lösung:  Datenbankebene — Arc-Reservierung mit SELECT FOR UPDATE + 30-min-Timeout.
         Arc kann nur von einem User gleichzeitig reserviert werden.
         Beim zweiten Versuch: sofortiger Redirect → "Dieser Arc ist nicht mehr verfügbar."
```

---

## 10. B2B / Architekt-Portal

### Zugangsflow

```
1. User klickt "Zugang beantragen" → Formular (Firma, Name, E-Mail, Website, Projektbeschreibung)
2. Admin: Review → Freigabe oder Ablehnung
3. Bei Freigabe: Automatische E-Mail mit temporärem Passwort
4. User setzt eigenes Passwort bei erstem Login
```

### Zugriff nach Login

```typescript
// Middleware: src/middleware.ts
// Alle Routen unter /b2b/portal/* prüfen auf B2BAccount-Session
// canDownloadCAD Flag: steuert Download-Sichtbarkeit
// canRequestProjects Flag: steuert Projektanfrage-Formular
```

### CAD-Download

```
- Dateien liegen in R2 unter /b2b/cad/
- Kein direkter Public-URL — signed URLs mit 1h Ablauf
- Download-Log: wer hat wann welche Datei heruntergeladen
```

### Projektanfrage

```
Felder:
  - Projektname
  - Beschreibung
  - Geplante Arc-Anzahl
  - Gewünschter Montagetyp
  - Budget (optional)
  - Lieferdatum (optional)
  - Anhänge (Grundrisse, Visualisierungen) → R2

Nach Submit:
  - Project erstellt (status: INQUIRY)
  - E-Mail an Admin
  - E-Mail an B2B-User: Bestätigung, Rückmeldung innerhalb 2 Werktage
```

---

## 11. 3D-Datenbank & Medien

### Dateiformat 3D-Scan

```
Format:   .glb (Binary glTF) — kompatibel mit <model-viewer>
Größe:    max. 15 MB pro Arc (komprimiert mit Draco)
Viewer:   <model-viewer> Web Component
          src="[signed-url]" 
          ar camera-controls 
          auto-rotate
```

### Foto-Spezifikation

```
- 2 Fotos pro Arc: Seite A (Vorderseite), Seite B (Rückseite)
- Auflösung: min. 2000 × 2000 px
- Format: JPEG, max. 3 MB nach Komprimierung
- Hintergrund: neutral weiß oder dunkelgrau (konsistent)
- In R2: /arcs/[id]/front.jpg und /arcs/[id]/back.jpg
```

### URL-Handling

```typescript
// Alle R2-URLs als signed URLs ausgeben (1h Gültigkeit)
// In Next.js: Route Handler /api/media/[...path] mit Auth-Check
// Keine direkten R2-Public-URLs im Frontend (Ausnahme: öffentliche Katalog-Fotos)
```

---

## 12. API-Endpunkte

### Öffentliche API

| Method | Endpoint | Beschreibung |
|---|---|---|
| `GET` | `/api/arcs` | Arc-Liste mit Filter (`?status=READY&minPrice=&maxPrice=&page=`) |
| `GET` | `/api/arcs/[id]` | Arc-Detail |
| `POST` | `/api/arcs/[id]/reserve` | Arc für 30 min reservieren (Session) |
| `DELETE` | `/api/arcs/[id]/reserve` | Reservierung freigeben |
| `POST` | `/api/configurator/price` | Preisberechnung (server-side) |
| `POST` | `/api/orders` | Pre-Order erstellen |
| `GET` | `/api/orders/[id]` | Bestellstatus (mit Token-Auth) |
| `POST` | `/api/waitlist` | Warteliste beitreten |
| `GET` | `/api/waitlist/confirm` | Double-Opt-In bestätigen |
| `DELETE` | `/api/waitlist/unsubscribe` | Abmelden |
| `GET` | `/api/drops` | Aktive Drops |
| `GET` | `/api/drops/[slug]` | Drop-Detail |
| `POST` | `/api/b2b/register` | B2B-Zugang beantragen |

### Webhooks

| Method | Endpoint | Beschreibung |
|---|---|---|
| `POST` | `/api/webhooks/stripe` | Stripe-Events (payment_intent.succeeded etc.) |

### Admin API (Auth-geschützt)

| Method | Endpoint | Beschreibung |
|---|---|---|
| `GET/POST` | `/api/admin/arcs` | Arc anlegen, listen |
| `PUT/DELETE` | `/api/admin/arcs/[id]` | Arc bearbeiten, löschen |
| `POST` | `/api/admin/arcs/[id]/upload` | Foto/3D-Upload → R2 |
| `GET/POST` | `/api/admin/drops` | Drop anlegen |
| `PUT` | `/api/admin/drops/[id]` | Drop bearbeiten |
| `POST` | `/api/admin/drops/[id]/send-alert` | Warteliste benachrichtigen |
| `GET` | `/api/admin/orders` | Alle Bestellungen |
| `PUT` | `/api/admin/orders/[id]` | Status, Notizen |
| `POST` | `/api/admin/orders/[id]/confirm` | Bestellung bestätigen |
| `GET/PUT` | `/api/admin/b2b/[id]` | B2B-Account freigeben |
| `GET` | `/api/admin/waitlist` | Warteliste anzeigen |

---

## 13. E-Mail-System

Alle E-Mails via **Resend**. React-E-Mail für Templates empfohlen.

| Trigger | Empfänger | Betreff | Inhalt |
|---|---|---|---|
| Warteliste-Eintrag | Neuer User | "Bitte bestätigen Sie Ihre E-Mail" | Double-Opt-In Link |
| Warteliste-Bestätigung | User | "Sie stehen auf der Liste." | Kurzbestätigung, Abmeldelink |
| Drop-Alert | Alle bestätigten Einträge | "Neuer Drop: [Titel]" | Arc-Vorschau, Link, Datum |
| Pre-Order eingegangen | Kunde | "Ihre ARC-ONE Bestellung" | Zusammenfassung, Deposit-Link |
| Pre-Order eingegangen | Admin | "Neue Pre-Order #[Nr.]" | Detail + Confirm-Link |
| Bestellung bestätigt | Kunde | "Bestellung bestätigt — Produktion startet" | Status-Update |
| Produktion abgeschlossen | Kunde | "Ihr Arc ist fertig — Restzahlung" | Restbetrag-Link |
| Versand | Kunde | "Ihr Arc ist unterwegs" | Tracking-Info |
| B2B-Zugang genehmigt | B2B-User | "Ihr ARC-ONE Architekten-Zugang" | Temporäres Passwort |

---

## 14. Sicherheit & Zugangskontrolle

### Admin-URL

```typescript
// NIEMALS hardcoded, IMMER aus ENV
const adminSegment = process.env.ADMIN_PATH_SEGMENT

// In next.config.ts: Rewrites für Admin-Routen
// Der Segment-Wert erscheint NICHT in:
// - Logs (masken)
// - Error-Messages
// - Client-seitigem JavaScript-Bundle
// - HTML-Quelle

// robots.txt EXPLIZIT Admin blockieren — aber URL-Pfad nicht verraten:
// User-agent: *
// Disallow: /k7x9m2/  ← NEIN! Verrät den Segment-Namen
// Stattdessen: Session-basierter Guard, kein robots.txt-Eintrag
```

### Rate Limiting

```typescript
// Admin-Login:     5 Versuche / 15 min / IP → 429
// Waitlist:        3 Einträge / Stunde / IP → 429
// Konfigurator:    Reservierung nur 1 aktive / Session
// API allgemein:   100 Req / min / IP
```

### Input-Validierung

```typescript
// Alle API-Inputs mit Zod validieren
// Preisberechnung IMMER server-seitig — Client-Wert nur für Display
// SQL-Injection: Prisma ORM verhindert dies nativ
// XSS: Next.js escaping, kein dangerouslySetInnerHTML ohne Sanitization
```

---

## 15. SEO & Robots

```
# public/robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /b2b/portal/

# Admin-URL NICHT in robots.txt — kein Hinweis auf Existenz
# Kein Link im HTML-Quellcode der öffentlichen Seiten
```

```typescript
// Sitemap: /sitemap.xml (auto-generiert durch Next.js)
// Enthält: alle READY Arcs, alle aktiven Drops, alle statischen Seiten
// Enthält NICHT: Admin-Routen, B2B-Portal

// Strukturierte Daten (JSON-LD) für:
// - Arc-Detail-Seiten: Product schema (Preis, Verfügbarkeit)
// - Homepage: Organization schema
// - Manufaktur: LocalBusiness schema (Monchique, Portugal)
```

---

## 16. Smart Home / Technische Produktdaten

Diese Daten werden im B2B-Portal als technische Spezifikation angezeigt.

```typescript
interface TechnicalSpec {
  // Alle Ultra High-End Systeme
  lightingProtocols: ['DALI', 'KNX']  // bei entsprechender Anfrage
  
  voltage: '230V AC 50Hz'
  lowVoltageOption: '24V DC (Trafo im Lieferumfang)'  // bei Ultra-System
  
  ipRating: {
    standard: 'IP20'
    outdoor: 'IP44'  // auf Anfrage, mit speziellem Finish
  }
  
  fireProtection: {
    standard: 'B1 (schwer entflammbar) auf Anfrage'
    certifier: 'MPA Dresden'  // Beispiel
  }
  
  ceConformity: true
  ean: null  // Unikate haben keine EAN
}

// CAD-Formate im B2B-Download:
// .dxf (AutoCAD)
// .step (universell)
// .pdf (Maßblatt)
// Dateien liegen in R2 unter /b2b/cad/[arcId]/
```

---

## 17. Entwicklungs-Commands

```bash
# Setup
npm install
npx prisma generate
npx prisma db push
npx prisma db seed         # Testdaten (10 Arcs, 1 Admin, 1 Drop)

# Development
npm run dev                # Next.js auf Port 3000
npm run db:studio          # Prisma Studio auf Port 5555

# Datenbank
npx prisma migrate dev --name [name]
npx prisma migrate reset   # VORSICHT: löscht alle Daten

# Tests
npm run test               # Unit Tests (Pricing, Availability)
npm run test:e2e           # Playwright E2E Tests
npm run test:ci            # Alle Tests für CI/CD

# Build
npm run build
npm run start

# Stripe Webhooks (lokal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Seed-Daten

```typescript
// prisma/seed.ts erstellt:
// - 1 AdminUser (email: admin@arc-one.com, pw: aus ENV)
// - 10 Arcs mit Status READY (realistische Daten)
// - 1 Drop (SCHEDULED, mit 3 Arcs)
// - 5 Waitlist-Einträge (bestätigt)
// - 1 B2BAccount (approved)
```

---

## 18. Offene Entscheidungen

Diese Punkte müssen vor Entwicklungsstart entschieden werden:

| # | Frage | Optionen | Impact |
|---|---|---|---|
| 1 | **Anzahlung** beim Pre-Order: wann wird Stripe-Session geöffnet? | Sofort nach Submit / nach Admin-Bestätigung | Zahlungsflow |
| 2 | **Konfigurator-URL**: Zustand in URL-Params oder Session-Storage? | URL (sharebar) / Session (privater) | UX + Tech |
| 3 | **3D-Viewer**: model-viewer vs. Three.js | model-viewer (einfach) / Three.js (flexibel) | Performance |
| 4 | **B2B-Login**: eigenes Auth-System oder Magic Link? | Passwort / Magic Link via E-Mail | Security + UX |
| 5 | **Spinne ab X Pendeln**: B2B-only oder immer im Webshop? | Ab 5 Pendeln → B2B-Anfrage / Webshop für alle | Business |
| 6 | **Zahlungsarten**: Stripe only, oder auch Überweisung? | Stripe Karte/SEPA / + manuelle Rechnung | Aufwand |
| 7 | **Mehrsprachigkeit**: Deutsch only oder DE + EN? | DE only v1 / DE+EN v1 | Scope |
| 8 | **Arc-Reservierungs-Timeout**: 30 oder 60 Minuten? | 30 min (aggressiver) / 60 min (komfortabler) | Business |

---

## 19. Out of Scope (v1)

Folgende Funktionen werden in v1 **nicht** gebaut:

```
✗ Kundenkonto / Login für Endkunden (nur Gast-Checkout)
✗ Produktempfehlungen / KI-gestützte Arc-Suche
✗ Mehrsprachigkeit (nur Deutsch in v1)
✗ Internationale Versandberechnung (nur DE/AT/CH in v1)
✗ App (iOS/Android)
✗ ERP-Integration
✗ Automatischer 3D-Scan-Import
✗ Virtuelle Raumplanung (AR)
✗ Live-Chat / Support-System
✗ Affiliate-Programm
```

---

## Anhang: Namenskonventionen

| Begriff | Technisch | Anzeige |
|---|---|---|
| Ein Leuchtschirm | `Arc` (Singular) | „Ihr Arc" |
| Mehrere Leuchtschirme | `Arcs` (Plural) | „drei Arcs" |
| Rohling (vor Bearbeitung) | `arc.status === 'RAW'` | intern |
| Cluster-Montage | `mounting: 'spinne'` | „Spinne" |
| Markenname | — | „ARC-ONE" (immer mit Bindestrich, Großbuchstaben) |

---

*ARC-ONE · TechSpec v1.0 · Mai 2026*  
*Für Rückfragen: studio@arc-one.com*
