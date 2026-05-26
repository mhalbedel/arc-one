# ARC-ONE

> High-End-Manufaktur-Website für handgefertigte Eukalyptus-Leuchten (Unikate). Jeder Arc ist ein physisches Unikat aus dem Eukalyptusforst bei Monchique, Portugal.

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (copy-paste components)
- **Datenbank:** Supabase (PostgreSQL) mit Row Level Security
- **Auth:** Supabase Auth — Email+Password für Admin und B2B (kein NextAuth.js)
- **Storage:** Supabase Storage — Fotos, 3D-Scans, CAD-Dateien (kein Cloudflare R2)
- **Email:** Resend + React Email
- **Payments:** Stripe (30 % Deposit + 70 % Restbetrag)
- **3D-Viewer:** model-viewer Web Component
- **Deployment:** Vercel
- **Validation:** Zod + react-hook-form
- **State:** React useState / Context API

> **Hinweis:** Die TechSpec (`features/ARC-ONE_TechSpec_ClaudeCode.md`) beschreibt Prisma ORM, NextAuth.js und Cloudflare R2 — das Projekt verwendet stattdessen Supabase-first (DB + Auth + Storage in einem Stack).

## Project Structure

```
src/
  app/              Pages (Next.js App Router)
  components/
    ui/             shadcn/ui components (NEVER recreate these)
  hooks/            Custom React hooks
  lib/              Utilities (supabase.ts, utils.ts)
features/           Feature specifications (PROJ-X-name.md)
  INDEX.md          Feature status overview
docs/
  PRD.md            Product Requirements Document
  production/       Production guides (Sentry, security, performance)
```

## Development Workflow

1. `/init` - Initialize the project: PRD + feature map (run once at the start)
2. `/write-spec` - Create a full feature spec for one feature
3. `/architecture` - Design tech architecture (PM-friendly, no code)
4. `/frontend` - Build UI components (shadcn/ui first!)
5. `/backend` - Build APIs, database, RLS policies
6. `/qa` - Test against acceptance criteria + security audit
7. `/deploy` - Deploy to Vercel + production-ready checks

Use `/refine PROJ-X` at any point to revisit and improve an existing feature spec.

## Feature Tracking

All features tracked in `features/INDEX.md`. Every skill reads it at start and updates it when done. Feature specs live in `features/PROJ-X-name.md`.

## Key Conventions

- **Feature IDs:** PROJ-1, PROJ-2, etc. (sequential)
- **Commits:** `feat(PROJ-X): description`, `fix(PROJ-X): description`
- **Single Responsibility:** One feature per spec file
- **shadcn/ui first:** NEVER create custom versions of installed shadcn components
- **Human-in-the-loop:** All workflows have user approval checkpoints
- **Tests:** Unit tests co-located next to source files (`useHook.test.ts` next to `useHook.ts`). E2E tests in `tests/`.

## Build & Test Commands

```bash
npm run dev          # Development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run start        # Production server
npm test             # Vitest unit/integration tests
npm run test:e2e     # Playwright E2E tests
npm run test:all     # Both test suites
```

## Product Context

@docs/PRD.md

## Feature Overview

@features/INDEX.md
