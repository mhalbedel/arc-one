-- Migration: PROJ-4 — Add sanding_price to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS sanding_price INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN orders.sanding_price IS
  'Sanding surcharge in cents charged for this order. Mirrors price_sanding from arcs.';
