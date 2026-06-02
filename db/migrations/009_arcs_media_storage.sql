-- Migration: PROJ-5 — Storage-Bucket fuer Arc-Medien
-- Das Admin-Backend laedt Fotos (Seite A/B) und optionale .glb-Scans direkt vom
-- Browser in den Bucket 'arcs-media'. Ohne Bucket + Policies schlaegt der Upload fehl.
-- Public read (Katalog zeigt Bilder); Schreibrechte nur fuer Admins (is_admin()).
-- Loest die auskommentierten Storage-Bloecke in db/schema.sql ab.

-- ── Bucket (oeffentlich lesbar) ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('arcs-media', 'arcs-media', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ── RLS-Policies auf storage.objects ───────────────────────────────────────
-- Oeffentlich lesen (Katalog + 3D-Viewer)
CREATE POLICY "Public read arcs-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'arcs-media');

-- Admins laden hoch (upsert: true im Arc-Formular braucht INSERT + UPDATE)
CREATE POLICY "Admins upload to arcs-media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'arcs-media' AND is_admin());

CREATE POLICY "Admins update arcs-media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'arcs-media' AND is_admin())
  WITH CHECK (bucket_id = 'arcs-media' AND is_admin());
