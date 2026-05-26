-- ============================================================
-- ARC-ONE — Seed Data (Development)
-- Run in Supabase SQL Editor AFTER schema.sql
--
-- BEFORE RUNNING:
-- 1. Create admin user in Supabase Dashboard → Auth → Users
--    Email: admin@arc-one.com  |  Password: choose a strong one
--    Then set app_metadata: { "role": "admin" } via Dashboard
--    Copy the UUID and replace YOUR_ADMIN_AUTH_USER_ID below
--
-- 2. Create B2B test user in Supabase Dashboard → Auth → Users
--    Email: architekt@studio-test.de  |  Password: choose one
--    Then set app_metadata: { "role": "b2b" }
--    Copy the UUID and replace YOUR_B2B_AUTH_USER_ID below
-- ============================================================


-- ============================================================
-- PART 1: Drops (reference needed for arcs)
-- ============================================================

INSERT INTO drops (id, title, slug, scheduled_at, status, description) VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'Drop #01 — Die ersten Bögen',
    'drop-01-die-ersten-boegen',
    '2026-06-15 10:00:00+00',
    'SCHEDULED',
    'Die erste kuratierte Auswahl aus dem Frühjahrseinschlag 2026. Zehn Arcs, drei davon in diesem Drop.'
  );


-- ============================================================
-- PART 2: Arcs (10 READY arcs, 3 assigned to the drop)
-- ============================================================

INSERT INTO arcs (
  serial_number, width_cm, height_cm, depth_cm, weight_grams,
  harvest_date, forest_section, cut_number,
  character, status, base_price,
  compat_ohne, compat_wand, compat_decke, compat_spinne,
  compat_oel, compat_lack, compat_schellack,
  drop_id
) VALUES
  (
    'ARV-0001', 78.5, 42.0, 22.0, 1840,
    '2026-02-12 00:00:00+00', 'Monchique Sektor 3', 1,
    'Weit geschwungener Bogen mit tiefer Maserung entlang der Wölbung. Die Rinde zeigt ein feines Flechtmuster in Terrakotta und Silbergrau.',
    'READY', 48000,
    TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE,
    'a1000000-0000-0000-0000-000000000001'
  ),
  (
    'ARV-0002', 112.0, 38.0, 18.5, 2210,
    '2026-02-12 00:00:00+00', 'Monchique Sektor 3', 2,
    'Langer flacher Bogen, fast symmetrisch. Sehr gleichmäßige Textur, ideal für minimalistische Räume.',
    'READY', 62000,
    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE,
    'a1000000-0000-0000-0000-000000000001'
  ),
  (
    'ARV-0003', 65.0, 55.0, 31.0, 2640,
    '2026-02-14 00:00:00+00', 'Monchique Sektor 1', 1,
    'Tiefer, fast schalenförmiger Arc mit starker Wölbung. Die Innenrinde hat eine samtige, helle Textur.',
    'READY', 71000,
    TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, TRUE,
    'a1000000-0000-0000-0000-000000000001'
  ),
  (
    'ARV-0004', 88.0, 46.0, 24.0, 1980,
    '2026-02-18 00:00:00+00', 'Monchique Sektor 2', 3,
    'Klassischer Halbmond. Unregelmäßige Riffelung entlang der Kante gibt dem Stück einen lebendigen Charakter.',
    'READY', 53000,
    TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE,
    NULL
  ),
  (
    'ARV-0005', 93.5, 51.0, 27.5, 2350,
    '2026-02-18 00:00:00+00', 'Monchique Sektor 2', 4,
    'Breiter Bogen mit auffälliger Astnarbe in der Mitte. Die Narbe ist vollständig verheilt und verleiht dem Stück Tiefe.',
    'READY', 58000,
    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE,
    NULL
  ),
  (
    'ARV-0006', 57.0, 39.0, 19.0, 1320,
    '2026-02-20 00:00:00+00', 'Monchique Sektor 4', 1,
    'Kleines, kompaktes Exemplar mit ungewöhnlich heller Rinde. Eignet sich besonders für niedrige Decken.',
    'READY', 32000,
    TRUE, TRUE, FALSE, FALSE, TRUE, TRUE, FALSE,
    NULL
  ),
  (
    'ARV-0007', 104.0, 44.0, 23.0, 2080,
    '2026-02-22 00:00:00+00', 'Monchique Sektor 3', 5,
    'Langer, leicht gedrehter Bogen. Die Drehung entsteht aus dem spiralförmigen Wachstum des Baumes.',
    'READY', 66000,
    TRUE, TRUE, TRUE, FALSE, FALSE, TRUE, TRUE,
    NULL
  ),
  (
    'ARV-0008', 82.0, 60.0, 35.0, 3120,
    '2026-02-25 00:00:00+00', 'Monchique Sektor 1', 2,
    'Schwerer, massiver Bogen mit außergewöhnlicher Tiefe. Eines der selteneren Exemplare mit fast kugelförmiger Wölbung.',
    'READY', 79000,
    TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, TRUE,
    NULL
  ),
  (
    'ARV-0009', 71.0, 43.0, 21.0, 1690,
    '2026-02-28 00:00:00+00', 'Monchique Sektor 2', 6,
    'Gleichmäßiger Halbmond mit feiner Quermaserung. Die Oberfläche ist besonders glatt und zeigt kaum Riffelungen.',
    'READY', 44000,
    TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE,
    NULL
  ),
  (
    'ARV-0010', 96.0, 48.0, 26.0, 2190,
    '2026-03-01 00:00:00+00', 'Monchique Sektor 4', 2,
    'Kräftiger Bogen mit dunkler Kernzone und hellem Außenrand. Der Kontrast ist natürlich entstanden und besonders ausgeprägt.',
    'READY', 61000,
    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE,
    NULL
  );


-- ============================================================
-- PART 3: Waitlist (5 confirmed entries)
-- ============================================================

INSERT INTO waitlist_entries (email, confirmed_at, token) VALUES
  ('elena.weber@gmail.com',       NOW() - INTERVAL '15 days', gen_random_uuid()),
  ('thomas.mller@outlook.de',    NOW() - INTERVAL '12 days', gen_random_uuid()),
  ('sarah.hoffmann@web.de',      NOW() - INTERVAL '9 days',  gen_random_uuid()),
  ('markus.braun@gmx.de',        NOW() - INTERVAL '6 days',  gen_random_uuid()),
  ('anna.schneider@icloud.com',  NOW() - INTERVAL '2 days',  gen_random_uuid());


-- ============================================================
-- PART 4: Admin Profile
-- Replace YOUR_ADMIN_AUTH_USER_ID with real UUID from Auth Dashboard
-- ============================================================

-- INSERT INTO admin_profiles (auth_user_id, name, role) VALUES
--   ('YOUR_ADMIN_AUTH_USER_ID', 'Admin', 'SUPER_ADMIN');


-- ============================================================
-- PART 5: B2B Account
-- Replace YOUR_B2B_AUTH_USER_ID with real UUID from Auth Dashboard
-- ============================================================

-- INSERT INTO b2b_accounts (
--   auth_user_id, company_name, contact_name, email,
--   approved_at, can_download_cad, can_request_projects
-- ) VALUES (
--   'YOUR_B2B_AUTH_USER_ID',
--   'Studio Architekt GmbH',
--   'Max Mustermann',
--   'architekt@studio-test.de',
--   NOW(),
--   TRUE,
--   TRUE
-- );
