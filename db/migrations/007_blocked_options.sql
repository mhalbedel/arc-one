-- Migration: PROJ-3 — Opt-out-Verfügbarkeitsmodell
-- Standardmäßig sind alle Konfigurations-Optionen verfügbar. Der Admin sperrt
-- unmögliche Optionen pro Arc über blocked_options (loest die compat_*-Whitelist ab).

ALTER TABLE arcs
  ADD COLUMN blocked_options TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN arcs.blocked_options IS
  'Gesperrte Konfigurations-Optionen (Opt-out). Leeres Array = alles verfuegbar. Namespaced Keys: schliff:<v> | mounting:<v> | finish:<v> | light:<v>. Ersetzt die compat_*-Flags (die vorerst deprecated bestehen bleiben).';
