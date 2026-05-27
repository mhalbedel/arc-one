-- Migration: PROJ-3 — Schliff als konfigurierbarer Schritt
-- Allows the admin to set a sanding surcharge per arc.
-- NULL = not yet calculated; 0 = no surcharge; > 0 = surcharge in cents.

ALTER TABLE arcs
  ADD COLUMN price_sanding INTEGER;

COMMENT ON COLUMN arcs.price_sanding IS
  'Sanding surcharge in cents. NULL = not yet calculated. 0 = no extra charge. Only relevant when is_sanded = false.';
