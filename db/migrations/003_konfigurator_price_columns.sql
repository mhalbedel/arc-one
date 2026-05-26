-- PROJ-3: Add konfigurator price columns to arcs table
-- Run in Supabase SQL Editor before deploying PROJ-3

ALTER TABLE arcs
  ADD COLUMN IF NOT EXISTS price_mounting_wall         INTEGER,
  ADD COLUMN IF NOT EXISTS price_mounting_ceiling      INTEGER,
  ADD COLUMN IF NOT EXISTS price_mounting_spinne_per   INTEGER,
  ADD COLUMN IF NOT EXISTS price_finish_oil            INTEGER,
  ADD COLUMN IF NOT EXISTS price_finish_lacquer        INTEGER,
  ADD COLUMN IF NOT EXISTS price_finish_shellac        INTEGER,
  ADD COLUMN IF NOT EXISTS price_light_porcelain       INTEGER,
  ADD COLUMN IF NOT EXISTS price_light_bg_led          INTEGER,
  ADD COLUMN IF NOT EXISTS price_light_true_led        INTEGER;
