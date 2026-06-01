-- ============================================================
-- ARC-ONE — Supabase Schema
-- Run this in the Supabase SQL Editor (once, on a fresh project)
-- ============================================================


-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE arc_status AS ENUM (
  'RAW', 'IN_PROGRESS', 'READY', 'RESERVED',
  'ORDERED', 'IN_PRODUCTION', 'SHIPPED', 'SOLD', 'ARCHIVED'
);

CREATE TYPE order_status AS ENUM (
  'PENDING_CONFIRMATION', 'CONFIRMED', 'DEPOSIT_PAID',
  'IN_PRODUCTION', 'READY_TO_SHIP', 'REMAINING_PAID',
  'SHIPPED', 'DELIVERED', 'CANCELLED'
);

CREATE TYPE drop_status AS ENUM (
  'DRAFT', 'SCHEDULED', 'LIVE', 'CLOSED', 'ARCHIVED'
);

CREATE TYPE project_status AS ENUM (
  'INQUIRY', 'REVIEWING', 'QUOTED', 'ACCEPTED',
  'IN_PROGRESS', 'COMPLETED', 'REJECTED'
);

CREATE TYPE admin_role AS ENUM (
  'SUPER_ADMIN', 'EDITOR', 'VIEWER'
);


-- ============================================================
-- HELPER: updated_at trigger function
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- HELPER: role check functions (used in RLS policies)
-- Role is stored in Supabase Auth app_metadata.role
-- Set via Dashboard or Admin API when creating/approving users
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    FALSE
  )
$$;

CREATE OR REPLACE FUNCTION is_b2b()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'b2b',
    FALSE
  )
$$;


-- ============================================================
-- TABLE: customers
-- Guest checkout — no login required, created at order time
-- ============================================================

CREATE TABLE customers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT UNIQUE NOT NULL,
  name         TEXT,
  phone        TEXT,
  address      JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to customers"
  ON customers FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());


-- ============================================================
-- TABLE: b2b_accounts
-- Architect/designer accounts, linked to Supabase Auth users
-- ============================================================

CREATE TABLE b2b_accounts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id         UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name         TEXT NOT NULL,
  contact_name         TEXT NOT NULL,
  email                TEXT UNIQUE NOT NULL,
  phone                TEXT,
  website              TEXT,
  approved_at          TIMESTAMPTZ,
  approved_by          TEXT,
  can_download_cad     BOOLEAN DEFAULT FALSE,
  can_request_projects BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE b2b_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "B2B users can read own account"
  ON b2b_accounts FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins have full access to b2b_accounts"
  ON b2b_accounts FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE TRIGGER set_b2b_accounts_updated_at
  BEFORE UPDATE ON b2b_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_b2b_accounts_auth_user_id ON b2b_accounts(auth_user_id);


-- ============================================================
-- TABLE: drops
-- Limited Arc releases with scheduled publish date
-- ============================================================

CREATE TABLE drops (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  closes_at    TIMESTAMPTZ,
  status       drop_status DEFAULT 'DRAFT',
  alert_sent_at TIMESTAMPTZ,
  alert_count  INTEGER DEFAULT 0,
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE drops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read LIVE and SCHEDULED drops"
  ON drops FOR SELECT
  USING (status IN ('LIVE', 'SCHEDULED'));

CREATE POLICY "Admins have full access to drops"
  ON drops FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE TRIGGER set_drops_updated_at
  BEFORE UPDATE ON drops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_drops_status ON drops(status);
CREATE INDEX idx_drops_scheduled_at ON drops(scheduled_at);


-- ============================================================
-- TABLE: orders
-- Pre-orders — one order covers exactly one Arc (1:1 via arcs.order_id)
-- ============================================================

CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      TEXT UNIQUE NOT NULL,
  config            JSONB NOT NULL,
  base_price        INTEGER NOT NULL,
  mounting_price    INTEGER NOT NULL DEFAULT 0,
  finish_price      INTEGER NOT NULL DEFAULT 0,
  light_price       INTEGER NOT NULL DEFAULT 0,
  sanding_price     INTEGER NOT NULL DEFAULT 0,
  shipping_price    INTEGER NOT NULL DEFAULT 0,
  total_price       INTEGER NOT NULL,
  estimated_days    INTEGER NOT NULL,
  customer_id       UUID REFERENCES customers(id) ON DELETE SET NULL,
  b2b_account_id    UUID REFERENCES b2b_accounts(id) ON DELETE SET NULL,
  deposit_amount    INTEGER NOT NULL,
  remaining_amount  INTEGER NOT NULL,
  deposit_paid_at   TIMESTAMPTZ,
  remaining_paid_at TIMESTAMPTZ,
  stripe_deposit_id TEXT,
  stripe_remain_id  TEXT,
  status            order_status DEFAULT 'PENDING_CONFIRMATION',
  admin_notes       TEXT,
  confirmed_at      TIMESTAMPTZ,
  confirmed_by      TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "B2B users can read own orders"
  ON orders FOR SELECT
  USING (
    is_b2b() AND
    b2b_account_id = (
      SELECT id FROM b2b_accounts WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins have full access to orders"
  ON orders FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_b2b_account_id ON orders(b2b_account_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);


-- ============================================================
-- TABLE: arcs
-- Core entity — each row is one physical, unique light shade
-- ============================================================

CREATE TABLE arcs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number       TEXT UNIQUE NOT NULL,

  -- Physical dimensions
  width_cm            FLOAT NOT NULL,
  height_cm           FLOAT NOT NULL,
  depth_cm            FLOAT NOT NULL,
  weight_grams        INTEGER NOT NULL,

  -- Origin
  harvest_date        TIMESTAMPTZ,
  forest_section      TEXT,
  cut_number          INTEGER,

  -- Catalog text
  character           TEXT NOT NULL,

  -- Media (Supabase Storage URLs)
  photo_front_url     TEXT,
  photo_back_url      TEXT,
  scan_3d_url         TEXT,

  -- Mounting compatibility flags
  compat_ohne         BOOLEAN DEFAULT TRUE,
  compat_wand         BOOLEAN DEFAULT TRUE,
  compat_decke        BOOLEAN DEFAULT TRUE,
  compat_spinne       BOOLEAN DEFAULT FALSE,
  max_spinne_pendants INTEGER,

  -- Finish compatibility flags (DEPRECATED — ersetzt durch blocked_options, siehe unten)
  compat_oel          BOOLEAN DEFAULT TRUE,
  compat_lack         BOOLEAN DEFAULT TRUE,
  compat_schellack    BOOLEAN DEFAULT TRUE,

  -- Gesperrte Konfigurations-Optionen (Opt-out). Leeres Array = alles verfügbar.
  -- Namespaced Keys: 'schliff:<v>' | 'mounting:<v>' | 'finish:<v>' | 'light:<v>'
  blocked_options     TEXT[] NOT NULL DEFAULT '{}',

  status              arc_status DEFAULT 'RAW',
  base_price          INTEGER NOT NULL,

  -- Konfigurator Aufpreise in Cent (NULL = Option nicht verfügbar/nicht kalkuliert)
  price_mounting_wall         INTEGER,
  price_mounting_ceiling      INTEGER,
  price_mounting_spinne_per   INTEGER,
  price_finish_oil            INTEGER,
  price_finish_lacquer        INTEGER,
  price_finish_shellac        INTEGER,
  price_light_porcelain       INTEGER,
  price_light_bg_led          INTEGER,
  price_light_true_led        INTEGER,
  price_sanding               INTEGER,  -- Schliff-Aufpreis in Cent (NULL = nicht kalkuliert)

  -- Geschliffen-Status: TRUE = bereits geschliffen, FALSE = Rohling (base_price bezieht sich auf Rohling)
  is_sanded           BOOLEAN NOT NULL DEFAULT FALSE,

  -- Featured on homepage (set by admin in PROJ-5)
  is_featured         BOOLEAN DEFAULT FALSE,

  -- Drop assignment (optional)
  drop_id             UUID REFERENCES drops(id) ON DELETE SET NULL,

  -- Temporary reservation (24h window during configurator)
  reserved_until      TIMESTAMPTZ,
  reserved_by         TEXT,

  -- Order (1:1, unique — one arc per order)
  order_id            UUID UNIQUE REFERENCES orders(id) ON DELETE SET NULL,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE arcs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read READY arcs"
  ON arcs FOR SELECT
  USING (status = 'READY');

CREATE POLICY "Admins have full access to arcs"
  ON arcs FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE TRIGGER set_arcs_updated_at
  BEFORE UPDATE ON arcs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_arcs_status ON arcs(status);
CREATE INDEX idx_arcs_drop_id ON arcs(drop_id);
CREATE INDEX idx_arcs_base_price ON arcs(base_price);


-- ============================================================
-- TABLE: waitlist_entries
-- Drop alert list — double opt-in via email confirmation
-- Reads/updates via API routes using service role (bypasses RLS)
-- ============================================================

CREATE TABLE waitlist_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT UNIQUE NOT NULL,
  confirmed_at TIMESTAMPTZ,
  token        UUID UNIQUE DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join the waitlist"
  ON waitlist_entries FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins have full access to waitlist"
  ON waitlist_entries FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE INDEX idx_waitlist_email ON waitlist_entries(email);
CREATE INDEX idx_waitlist_token ON waitlist_entries(token);


-- ============================================================
-- TABLE: projects
-- B2B project requests
-- ============================================================

CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  b2b_account_id  UUID NOT NULL REFERENCES b2b_accounts(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  arc_count       INTEGER,
  mounting_type   TEXT,
  budget          INTEGER,
  status          project_status DEFAULT 'INQUIRY',
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "B2B users can read own projects"
  ON projects FOR SELECT
  USING (
    is_b2b() AND
    b2b_account_id = (
      SELECT id FROM b2b_accounts WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "B2B users can create own projects"
  ON projects FOR INSERT
  WITH CHECK (
    is_b2b() AND
    b2b_account_id = (
      SELECT id FROM b2b_accounts WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins have full access to projects"
  ON projects FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_projects_b2b_account_id ON projects(b2b_account_id);
CREATE INDEX idx_projects_status ON projects(status);


-- ============================================================
-- TABLE: admin_profiles
-- Admin user metadata — linked to Supabase Auth users
-- The auth user must have app_metadata.role = 'admin' set via
-- Supabase Dashboard or Admin API for RLS to work
-- ============================================================

CREATE TABLE admin_profiles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  role         admin_role DEFAULT 'EDITOR',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to admin_profiles"
  ON admin_profiles FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE INDEX idx_admin_profiles_auth_user_id ON admin_profiles(auth_user_id);


-- ============================================================
-- STORAGE BUCKETS
-- Run these separately in Supabase Dashboard → Storage → New bucket
-- Or uncomment and run via SQL if storage extension is enabled:
-- ============================================================

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('arcs-media', 'arcs-media', TRUE);

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('b2b-cad', 'b2b-cad', FALSE);

-- Storage RLS for arcs-media (public read):
-- CREATE POLICY "Public read arcs-media"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'arcs-media');

-- CREATE POLICY "Admins upload to arcs-media"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'arcs-media' AND is_admin());

-- Storage RLS for b2b-cad (signed URLs only, no direct public access):
-- CREATE POLICY "Admins upload to b2b-cad"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'b2b-cad' AND is_admin());
