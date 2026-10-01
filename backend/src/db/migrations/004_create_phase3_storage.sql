-- Migration: 004_create_phase3_storage
-- Phase 3 Storage Foundation: agreements_pp, attendance_pp, file path columns

-- UP --

-- Agreements for PP orders (AGR-PP-YY-xxxx)
-- Content is frozen (immutable) once status transitions to 'issued'.
-- Signature data is stored on signing; the agreement PDF is generated at issuance.
CREATE TABLE agreements_pp (
  id               TEXT PRIMARY KEY,  -- AGR-PP-YY-xxxx
  order_id         TEXT NOT NULL UNIQUE REFERENCES orders_pp(id),
  status           TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'issued', 'signed', 'voided')),

  -- Content snapshot — frozen at issuance
  client_name      TEXT NOT NULL,
  client_email     TEXT,
  package_name     TEXT NOT NULL,
  sessions_total   INTEGER NOT NULL,
  final_amount     NUMERIC(14,2) NOT NULL,
  content_body     TEXT,           -- Markdown/text agreement body (editable in draft)

  -- PDF stored in Supabase Storage bucket 'agreements'
  pdf_path         TEXT,           -- agreements/{order_id}/{id}.pdf

  -- Lifecycle timestamps
  issued_at        TIMESTAMPTZ,
  signed_at        TIMESTAMPTZ,
  signed_by_name   TEXT,           -- signer's name as entered at signing
  signed_by_ip     TEXT,           -- IP at signing (stored, not served back)
  signed_by_ua     TEXT,           -- User-agent at signing
  signature_data   TEXT,           -- base64-encoded signature PNG (compact, max 200KB)
  voided_at        TIMESTAMPTZ,
  voided_by        TEXT,
  void_reason      TEXT,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attendance records for PP orders (ATT-PP-YY-xxxx)
-- One record per training session; photos uploaded separately.
CREATE TABLE attendance_pp (
  id                TEXT PRIMARY KEY,  -- ATT-PP-YY-xxxx
  order_id          TEXT NOT NULL REFERENCES orders_pp(id),
  session_number    INTEGER NOT NULL CHECK (session_number > 0),
  session_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  trainer_id        TEXT,              -- FK to pic_master.id (nullable, assigned later)
  notes             TEXT,
  client_present    BOOLEAN NOT NULL DEFAULT TRUE,
  trainer_present   BOOLEAN NOT NULL DEFAULT TRUE,

  -- Photos stored in Supabase Storage
  -- Raw original:    attendance-raw/{order_id}/{id}_raw.jpg
  -- Compressed:      attendance/{order_id}/{id}.jpg
  -- Thumbnail:       attendance/{order_id}/{id}_thumb.jpg
  photo_raw_path    TEXT,
  photo_path        TEXT,
  photo_thumb_path  TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(order_id, session_number)
);

-- Add proof_path to payments_pp: path in Supabase bucket 'payment-proofs'
ALTER TABLE payments_pp ADD COLUMN IF NOT EXISTS proof_path TEXT;

-- Add proof_uploaded_at for audit purposes
ALTER TABLE payments_pp ADD COLUMN IF NOT EXISTS proof_uploaded_at TIMESTAMPTZ;

-- Add pdf_path to invoices_pp: path in Supabase bucket 'invoices'
ALTER TABLE invoices_pp ADD COLUMN IF NOT EXISTS pdf_path TEXT;

-- Add pdf_path to receipts_pp: path in Supabase bucket 'receipts'
ALTER TABLE receipts_pp ADD COLUMN IF NOT EXISTS pdf_path TEXT;

-- Indexes
CREATE INDEX idx_agreements_pp_order_id  ON agreements_pp(order_id);
CREATE INDEX idx_agreements_pp_status    ON agreements_pp(status);
CREATE INDEX idx_attendance_pp_order_id  ON attendance_pp(order_id);
CREATE INDEX idx_attendance_pp_date      ON attendance_pp(session_date);
CREATE INDEX idx_attendance_pp_trainer   ON attendance_pp(trainer_id);

-- DOWN --

DROP INDEX IF EXISTS idx_attendance_pp_trainer;
DROP INDEX IF EXISTS idx_attendance_pp_date;
DROP INDEX IF EXISTS idx_attendance_pp_order_id;
DROP INDEX IF EXISTS idx_agreements_pp_status;
DROP INDEX IF EXISTS idx_agreements_pp_order_id;

DROP TABLE IF EXISTS attendance_pp;
DROP TABLE IF EXISTS agreements_pp;

ALTER TABLE receipts_pp  DROP COLUMN IF EXISTS pdf_path;
ALTER TABLE invoices_pp  DROP COLUMN IF EXISTS pdf_path;
ALTER TABLE payments_pp  DROP COLUMN IF EXISTS proof_uploaded_at;
ALTER TABLE payments_pp  DROP COLUMN IF EXISTS proof_path;
