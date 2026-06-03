-- Migration: PROJ-9 SHOP-L2 — Wiederaufnehmbare Checkout-Sperre pro Käufer
--
-- Bisher setzte der Checkout nur `products.held_until` (ohne Eigentümer). Sendete
-- ein Käufer den Checkout erneut ab (z. B. Adresskorrektur, Zurück-Navigation),
-- schlug die erneute Sperre fehl und er war 15 min von seinem eigenen Warenkorb
-- ausgesperrt. `held_by` speichert — analog zu `arcs.reserved_by` — den Eigentümer
-- (Käufer-E-Mail), sodass dieselbe Person ihre eigene Sperre wieder aufnehmen kann.
ALTER TABLE products ADD COLUMN IF NOT EXISTS held_by TEXT;
