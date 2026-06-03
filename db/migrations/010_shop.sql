-- Migration: PROJ-9 — Shop (fertige Produkte)
-- Fuegt die Shop-Datenstrukturen hinzu: Nicht-Arc-Produkte (`products`),
-- Anfragen (`product_inquiries`), Bestellpositionen (`order_items`) sowie den
-- neuen Arc-Status `FIXED` und `orders.order_type`.
--
-- HINWEIS: `ALTER TYPE ... ADD VALUE` darf in derselben Transaktion nicht
-- direkt als Enum-Literal verwendet werden ("unsafe use of new value"). Der
-- Supabase SQL-Editor fuehrt das Skript als EINE Transaktion aus — deshalb
-- vergleicht die FIXED-Policy unten `status::text = 'FIXED'` (Text-Literal,
-- kein Enum-Wert), sodass das Skript am Stueck laeuft.

-- ── Neuer Arc-Status: FIXED (fertiger Arc im Shop) ─────────────────────────
ALTER TYPE arc_status ADD VALUE IF NOT EXISTS 'FIXED';

-- Öffentlicher Lesezugriff auf FIXED-Arcs, damit der Shop sie anzeigen kann.
-- (Die bestehende Policy "Public can read READY arcs" deckt nur READY ab.)
-- Achtung: RLS-Policies werden ge-OR-t — der Arc-Katalog (/arcs) muss daher
-- explizit auf status = 'READY' filtern, um FIXED-Arcs auszuschließen.
-- `status::text` vermeidet die Nutzung des frisch hinzugefuegten Enum-Werts.
CREATE POLICY "Public can read FIXED arcs"
  ON arcs FOR SELECT
  USING (status::text = 'FIXED');

-- ── Shop-Enums ─────────────────────────────────────────────────────────────
CREATE TYPE product_category AS ENUM ('leuchten', 'schalen_accessoires', 'tische_moebel');
CREATE TYPE product_tier AS ENUM ('standard', 'premium_art');
CREATE TYPE purchase_mode AS ENUM ('direct', 'inquiry');
CREATE TYPE product_status AS ENUM ('AVAILABLE', 'SOLD', 'ARCHIVED');
CREATE TYPE inquiry_status AS ENUM ('NEU', 'KONTAKTIERT', 'ABGESCHLOSSEN');
CREATE TYPE order_type AS ENUM ('ARC_PREORDER', 'SHOP');

-- ── orders: Bestelltyp (Arc-Pre-Order vs. Shop-Direktkauf) ─────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_type order_type NOT NULL DEFAULT 'ARC_PREORDER';

CREATE INDEX idx_orders_order_type ON orders(order_type);

-- ============================================================
-- TABLE: products  (Nicht-Arc-Objekte: Leuchten, Schalen, Tische ...)
-- ============================================================
CREATE TABLE products (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Kurzer eindeutiger Code fuer die URL (z. B. P-7F3K2) -> /shop/[code]
  product_code            TEXT UNIQUE NOT NULL,
  name                    TEXT NOT NULL,
  description             TEXT NOT NULL DEFAULT '',
  category                product_category NOT NULL,
  tier                    product_tier NOT NULL DEFAULT 'standard',
  purchase_mode           purchase_mode NOT NULL DEFAULT 'direct',
  -- Festpreis in Cent; Pflicht bei Direktkauf, NULL bei Anfrage
  price_cents             INTEGER CHECK (price_cents IS NULL OR price_cents >= 0),
  -- Fester Versandpreis in Cent (Override, z. B. Spedition); NULL = Standard je Land
  shipping_override_cents INTEGER CHECK (shipping_override_cents IS NULL OR shipping_override_cents >= 0),
  photos                  TEXT[] NOT NULL DEFAULT '{}',
  model_3d_url            TEXT,
  width_cm                NUMERIC,
  height_cm               NUMERIC,
  depth_cm                NUMERIC,
  weight_grams            INTEGER,
  status                  product_status NOT NULL DEFAULT 'AVAILABLE',
  -- Sichtbarkeit im Shop, unabhaengig vom Verkaufsstatus
  is_published            BOOLEAN NOT NULL DEFAULT FALSE,
  -- Kurzzeit-Sperre fuer die atomare Kaufsicherung (Checkout)
  held_until              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Direktkauf braucht einen Preis; Anfrage nicht
  CONSTRAINT products_direct_needs_price
    CHECK (purchase_mode <> 'direct' OR price_cents IS NOT NULL)
);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Oeffentlich lesbar: nur veroeffentlichte, nicht archivierte Objekte
-- (verkaufte bleiben sichtbar -> kein Status-Filter auf SOLD).
CREATE POLICY "Public read published products"
  ON products FOR SELECT
  USING (is_published = TRUE AND status <> 'ARCHIVED');

CREATE POLICY "Admins have full access to products"
  ON products FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_published ON products(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_products_status ON products(status);

-- ============================================================
-- TABLE: product_inquiries  (Anfragen fuer Premium-/Art-Objekte)
-- ============================================================
CREATE TABLE product_inquiries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  message     TEXT NOT NULL,
  status      inquiry_status NOT NULL DEFAULT 'NEU',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE product_inquiries ENABLE ROW LEVEL SECURITY;

-- Anfragen werden ausschliesslich serverseitig (Service-Rolle) angelegt und
-- nur von Admins gelesen/gepflegt. Kein oeffentlicher Zugriff.
CREATE POLICY "Admins have full access to inquiries"
  ON product_inquiries FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE INDEX idx_inquiries_product_id ON product_inquiries(product_id);
CREATE INDEX idx_inquiries_status ON product_inquiries(status);
CREATE INDEX idx_inquiries_created_at ON product_inquiries(created_at DESC);

-- ============================================================
-- TABLE: order_items  (Positionen einer Shop-Bestellung; 1 Order -> N Stuecke)
-- Jede Zeile referenziert genau EINE Quelle: product_id ODER arc_id.
-- ============================================================
CREATE TABLE order_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     UUID REFERENCES products(id) ON DELETE SET NULL,
  arc_id         UUID REFERENCES arcs(id) ON DELETE SET NULL,
  -- Snapshot zum Kaufzeitpunkt (Bestellhistorie bleibt stabil)
  name_snapshot  TEXT NOT NULL,
  price_cents    INTEGER NOT NULL CHECK (price_cents >= 0),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT order_items_one_source CHECK (
    (product_id IS NOT NULL AND arc_id IS NULL) OR
    (product_id IS NULL AND arc_id IS NOT NULL)
  )
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to order_items"
  ON order_items FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_arc_id ON order_items(arc_id);
