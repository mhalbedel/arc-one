-- Migration: PROJ-3a — Zentrale Preisgestaltung (Preismatrix)
-- Loest die per-Arc price_*-Spalten ab. Aufpreise werden global gepflegt und
-- aus Groessenklasse (cm2) bzw. Gewichtsklasse (g) des Arcs abgeleitet.
-- Die per-Arc price_*-Spalten bleiben vorerst deprecated im Schema (kein Drop).

-- ── Preisliste: eine Zeile = ein Aufpreis ──────────────────────────────────
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Komponente: schliff | finish | mounting | light
  component TEXT NOT NULL CHECK (component IN ('schliff', 'finish', 'mounting', 'light')),
  -- Variante: bei finish (oel/lack/schellack), mounting (wand/decke/spinne),
  -- light (porzellan/bg_led/true_led). Bei schliff NULL.
  variant TEXT,
  -- Klasse: Groessenklasse (klein/mittel/gross) ODER Gewichtsklasse (leicht/mittel/schwer)
  tier TEXT NOT NULL CHECK (tier IN ('klein', 'mittel', 'gross', 'leicht', 'schwer')),
  -- Aufpreis in Cent. Bei mounting:spinne = Preis pro Pendel.
  price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Eindeutigkeit (variant kann NULL sein -> COALESCE fuer schliff-Zeilen)
CREATE UNIQUE INDEX idx_pricing_rules_unique
  ON pricing_rules (component, COALESCE(variant, ''), tier);

CREATE TRIGGER trg_pricing_rules_updated_at
  BEFORE UPDATE ON pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read pricing_rules" ON pricing_rules
  FOR SELECT USING (true);

CREATE POLICY "Admins have full access to pricing_rules" ON pricing_rules
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── Klassen-Grenzwerte: einzelner, vom Admin pflegbarer Datensatz ──────────
CREATE TABLE pricing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Groessen-Grenzen (Flaeche = Hoehe x Breite in cm2)
  size_klein_max_cm2 INTEGER NOT NULL DEFAULT 3000 CHECK (size_klein_max_cm2 > 0),
  size_mittel_max_cm2 INTEGER NOT NULL DEFAULT 6000 CHECK (size_mittel_max_cm2 > 0),
  -- Gewichts-Grenzen (in Gramm)
  weight_leicht_max_g INTEGER NOT NULL DEFAULT 2000 CHECK (weight_leicht_max_g > 0),
  weight_mittel_max_g INTEGER NOT NULL DEFAULT 5000 CHECK (weight_mittel_max_g > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_pricing_settings_updated_at
  BEFORE UPDATE ON pricing_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE pricing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read pricing_settings" ON pricing_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins have full access to pricing_settings" ON pricing_settings
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── Seed: Platzhalterpreise (vom Manufaktur-Team zu kalibrieren) ───────────
INSERT INTO pricing_settings DEFAULT VALUES;

INSERT INTO pricing_rules (component, variant, tier, price_cents) VALUES
  -- Schliff (nach Groesse)
  ('schliff', NULL, 'klein',  8000),
  ('schliff', NULL, 'mittel', 12000),
  ('schliff', NULL, 'gross',  18000),
  -- Finish (Typ x Groesse)
  ('finish', 'oel',       'klein',  4000),
  ('finish', 'oel',       'mittel', 6000),
  ('finish', 'oel',       'gross',  8000),
  ('finish', 'lack',      'klein',  5000),
  ('finish', 'lack',      'mittel', 7500),
  ('finish', 'lack',      'gross',  10000),
  ('finish', 'schellack', 'klein',  6000),
  ('finish', 'schellack', 'mittel', 9000),
  ('finish', 'schellack', 'gross',  12000),
  -- Befestigung (Typ x Gewichtsklasse); spinne = pro Pendel
  ('mounting', 'wand',   'leicht', 4000),
  ('mounting', 'wand',   'mittel', 6000),
  ('mounting', 'wand',   'schwer', 9000),
  ('mounting', 'decke',  'leicht', 6000),
  ('mounting', 'decke',  'mittel', 9000),
  ('mounting', 'decke',  'schwer', 13000),
  ('mounting', 'spinne', 'leicht', 2500),
  ('mounting', 'spinne', 'mittel', 3500),
  ('mounting', 'spinne', 'schwer', 5000),
  -- Licht (Typ x Groesse)
  ('light', 'porzellan', 'klein',  1000),
  ('light', 'porzellan', 'mittel', 1500),
  ('light', 'porzellan', 'gross',  2000),
  ('light', 'bg_led',    'klein',  3000),
  ('light', 'bg_led',    'mittel', 4500),
  ('light', 'bg_led',    'gross',  6000),
  ('light', 'true_led',  'klein',  5000),
  ('light', 'true_led',  'mittel', 7500),
  ('light', 'true_led',  'gross',  10000);
