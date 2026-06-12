# PROJ-14 — Brand Logo (Arc Initial) & Clay Favicon

| Feld | Wert |
|------|------|
| **ID** | PROJ-14 |
| **Status** | In Progress |
| **Erstellt** | 2026-06-12 |
| **Quelle** | Design-Handoff-Bundle "ARC-ONE Design System" (Claude Design, claude.ai/design) |

## Ziel

Die offizielle Wortmarke **"05 · Arc Initial · Lowered"** und das passende **Clay-Favicon** aus dem
Design-Handoff in die Produktion bringen. Es ist die einzige wirklich neue Design-Entscheidung des
Bundles — Farbpalette, Spacing, Zero-Radius und Komponenten wurden aus diesem Repo abgeleitet und
sind bereits live (`globals.css`: `--accent: 17 50% 54%` = Clay, Paper, Espresso).

## Scope

**In Scope**
- Wortmarke mit Arc Initial: Clay-Bogen sitzt auf der Grundlinie und schwingt ueber das "A" von
  ARC-ONE. Im Site-Header (einzige Vorkommen der Wortmarke als Logo).
- Favicon (`src/app/icon.svg`): Espresso-Kachel (`#29201A`) + Clay-Bogen (`#C56B47`). Vorher:
  Stone-Kachel (`#1c1917`) + weisser Bogen.

**Out of Scope (bewusst)**
- Fonts (Spectral + Hanken Grotesk) — vom Design selbst als nicht-verbindliche Substitution markiert.
  Moeglicher Folgeschritt (PROJ-14b). Site bleibt bei System-Font-Fallback.
- Farben / Spacing / Komponenten — bereits deckungsgleich mit dem Design in Produktion.

## Akzeptanzkriterien

1. Der Clay-Bogen sitzt mittig ueber dem "A"; die Wortmarke bleibt einzeilig, der Descriptor-Text
   daneben bleibt korrekt ausgerichtet.
2. Bogen-Geometrie exakt aus dem Design (`d="M8 40 A 22 22 0 0 1 40 12"`, strokeWidth 4, round cap),
   Farbe themebar ueber `hsl(var(--accent))`.
3. Favicon zeigt Espresso-Kachel + Clay-Bogen, skaliert sauber bis 16px.
4. `/admin` blendet den Header weiterhin aus (bestehender Guard unveraendert).
5. Responsive sauber bei 375 / 768 / 1440px.

## Implementierungsnotizen

- Neue Komponente `src/components/layout/wordmark.tsx` — praesentationell, Tailwind (uebersetzt aus
  der Inline-Style-Version `ui_kits/website/SiteHeader.jsx` des Bundles). Bogen als Inline-SVG,
  `aria-hidden`; lesbarer Name bleibt "ARC-ONE". Als eigene Komponente fuer spaetere Wiederverwendung
  (z. B. Footer) ausgelagert.
- **Korrektur (2026-06-12):** Bogen-Proportionen an die verbindliche `brand-logo.card.html`
  angepasst (Ratio Bogenbreite/Schriftgroesse = 100/30 = 3,33; bottom -3px/30px). Bei text-lg (18px):
  Breite 60px, Hoehe 43px, bottom -1.8px. Vorher (Ratio 1,55) war der Bogen zu klein und ueberlappte
  das "A"; jetzt schwingt er — 22px Ueberhang je Seite, mittig ueber dem "A" — sauber darueber.
  Verifiziert via Browser-Messung: arcWidth 60, A_width 15, overhang L/R je 22, center 48=48.
- `site-header.tsx`: Text-Wortmarke durch `<Wordmark />` ersetzt; umgebender `Link` unveraendert.
- `src/app/icon.svg`: nur die zwei Farben angepasst (Geometrie war bereits identisch).
