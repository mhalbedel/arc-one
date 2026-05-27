-- Migration: PROJ-2 / PROJ-3 — geschliffen/ungeschliffen
-- The base_price always refers to the unsanded blank (Rohling).
-- When is_sanded = false the Konfigurator skips the Finish step entirely.

ALTER TABLE arcs
  ADD COLUMN is_sanded BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN arcs.is_sanded IS
  'TRUE = arc has already been sanded. FALSE = raw blank (Rohling). The base_price always refers to the unsanded blank. When false, no finish can be applied via the Konfigurator.';
