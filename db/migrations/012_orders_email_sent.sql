-- Migration: PROJ-7 E-Mail-System — "Genau-einmal"-Sperre fuer Bestaetigungsmails
--
-- Die Bestaetigungsseiten (PROJ-4 Pre-Order, PROJ-9 Shop) sind idempotent und
-- koennen neu geladen werden; der Shop schliesst eine Order ausserdem ueber zwei
-- Pfade ab (Confirm-Route + Bestaetigungsseite). Damit pro Order genau eine
-- Kunden- und Atelier-Mail rausgeht, wird der Versand ueber ein bedingtes Update
-- dieser Spalte (NULL -> Zeitstempel) beansprucht: nur der erste Aufruf gewinnt.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMPTZ;
