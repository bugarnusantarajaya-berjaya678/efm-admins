-- EFM V2 — Row Level Security Policies (Phase 3)
-- Apply to the Supabase project after running migrations.
-- Run as the postgres superuser or through the Supabase dashboard SQL editor.
--
-- IMPORTANT: These policies grant access to authenticated users based on their
-- app_metadata.role claim set in Supabase Auth.
-- Roles: Admin | Finance | Operations | Coach | PP | B2B | Event
--
-- Strategy:
--   - All tables: ENABLE ROW LEVEL SECURITY
--   - Backend service_role bypasses RLS automatically (Supabase behaviour)
--   - Direct Supabase client access (from frontend) is blocked for all PP tables
--     since the frontend uses the backend API exclusively
--   - Storage buckets: private by default, no public read except company-assets

-- ─── Enable RLS on all PP tables ──────────────────────────────────────────────

ALTER TABLE leads_pp               ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients_pp             ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_pp              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_commercial_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices_pp            ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments_pp            ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts_pp            ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds_pp             ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants_pp        ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments_pp         ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreements_pp          ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_pp          ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE pic_master             ENABLE ROW LEVEL SECURITY;
ALTER TABLE pic_contexts           ENABLE ROW LEVEL SECURITY;

-- ─── Helper: extract role from JWT claim ──────────────────────────────────────
-- Supabase stores custom roles in app_metadata.role
-- auth.jwt() returns the decoded JWT; app_metadata is a JSONB column
-- Usage in policies: (auth.jwt() -> 'app_metadata' ->> 'role')

-- ─── PP Data Tables — Admin / Finance / Operations see all; Coach sees own ────

-- leads_pp
CREATE POLICY leads_pp_all_admin ON leads_pp
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance', 'Operations', 'PP')
  );

-- clients_pp
CREATE POLICY clients_pp_all_admin ON clients_pp
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance', 'Operations', 'PP')
  );

-- orders_pp
CREATE POLICY orders_pp_all_admin ON orders_pp
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance', 'Operations', 'PP')
  );

CREATE POLICY orders_pp_coach_own ON orders_pp
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Coach'
    AND pic_id = (auth.jwt() ->> 'sub')
  );

-- order_commercial_snapshots
CREATE POLICY ocs_all_admin ON order_commercial_snapshots
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance', 'Operations', 'PP')
  );

-- invoices_pp
CREATE POLICY invoices_pp_all_admin ON invoices_pp
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance', 'Operations', 'PP')
  );

-- payments_pp
CREATE POLICY payments_pp_all_admin ON payments_pp
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance', 'Operations', 'PP')
  );

-- receipts_pp
CREATE POLICY receipts_pp_all_admin ON receipts_pp
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance', 'Operations', 'PP')
  );

-- refunds_pp
CREATE POLICY refunds_pp_all_admin ON refunds_pp
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance', 'Operations', 'PP')
  );

-- participants_pp
CREATE POLICY participants_pp_all_admin ON participants_pp
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance', 'Operations', 'PP')
  );

CREATE POLICY participants_pp_coach_select ON participants_pp
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Coach'
    AND EXISTS (
      SELECT 1 FROM orders_pp o
      WHERE o.id = order_id
        AND o.pic_id = (auth.jwt() ->> 'sub')
    )
  );

-- assessments_pp
CREATE POLICY assessments_pp_all_admin ON assessments_pp
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance', 'Operations', 'PP')
  );

CREATE POLICY assessments_pp_coach_select ON assessments_pp
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Coach'
    AND EXISTS (
      SELECT 1 FROM orders_pp o
      WHERE o.id = order_id
        AND o.pic_id = (auth.jwt() ->> 'sub')
    )
  );

-- agreements_pp
CREATE POLICY agreements_pp_all_admin ON agreements_pp
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance', 'Operations', 'PP')
  );

-- attendance_pp
CREATE POLICY attendance_pp_all_admin ON attendance_pp
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance', 'Operations', 'PP')
  );

CREATE POLICY attendance_pp_coach_all ON attendance_pp
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Coach'
    AND EXISTS (
      SELECT 1 FROM orders_pp o
      WHERE o.id = order_id
        AND o.pic_id = (auth.jwt() ->> 'sub')
    )
  );

-- audit_events — read-only for Admin/Finance
CREATE POLICY audit_events_admin_read ON audit_events
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance')
  );

-- pic_master — Admin can manage; others read-only
CREATE POLICY pic_master_admin_all ON pic_master
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Admin'
  );

CREATE POLICY pic_master_read_all ON pic_master
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY pic_contexts_admin_all ON pic_contexts
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'Admin'
  );

CREATE POLICY pic_contexts_read_all ON pic_contexts
  FOR SELECT TO authenticated
  USING (true);

-- ─── Storage Bucket Policies ──────────────────────────────────────────────────
-- Buckets: agreements, invoices, receipts, payment-proofs,
--          attendance, attendance-raw, pii-documents, company-assets, exports
--
-- All buckets are PRIVATE (no public access) except company-assets.
-- The backend (service_role) bypasses these policies — it controls all uploads.
-- The anon/authenticated policies below apply when using the JS SDK directly
-- (e.g., for future client uploads, if ever enabled).

-- agreements: Admin/Finance read; no direct client write
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('agreements',     'agreements',     false, 10485760,  ARRAY['application/pdf']),
  ('invoices',       'invoices',       false, 10485760,  ARRAY['application/pdf']),
  ('receipts',       'receipts',       false, 10485760,  ARRAY['application/pdf']),
  ('payment-proofs', 'payment-proofs', false, 10485760,  ARRAY['image/jpeg','image/png','application/pdf']),
  ('attendance',     'attendance',     false, 5242880,   ARRAY['image/jpeg']),
  ('attendance-raw', 'attendance-raw', false, 20971520,  ARRAY['image/jpeg','image/png']),
  ('pii-documents',  'pii-documents',  false, 10485760,  ARRAY['application/pdf','image/jpeg','image/png']),
  ('company-assets', 'company-assets', true,  5242880,   ARRAY['image/jpeg','image/png','image/svg+xml']),
  ('exports',        'exports',        false, 104857600, ARRAY['application/zip','text/csv','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- agreements: authenticated Admin/Finance can read
CREATE POLICY "agreements: admin read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'agreements'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance', 'Operations', 'PP')
  );

-- invoices: authenticated Admin/Finance can read
CREATE POLICY "invoices: admin read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'invoices'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance', 'Operations', 'PP')
  );

-- receipts: authenticated Admin/Finance can read
CREATE POLICY "receipts: admin read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance', 'Operations', 'PP')
  );

-- payment-proofs: Admin/Finance can read; clients cannot directly upload via SDK
CREATE POLICY "payment-proofs: admin read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance', 'Operations', 'PP')
  );

-- attendance: Admin/Operations/Coach can read
CREATE POLICY "attendance: read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'attendance'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Operations', 'PP', 'Coach')
  );

-- attendance-raw: Admin/Operations only (raw uncompressed originals)
CREATE POLICY "attendance-raw: admin read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'attendance-raw'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Operations')
  );

-- pii-documents: Admin/Finance only
CREATE POLICY "pii-documents: admin read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'pii-documents'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance')
  );

-- exports: Admin/Finance can read own exports
CREATE POLICY "exports: admin read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'exports'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Finance')
  );
