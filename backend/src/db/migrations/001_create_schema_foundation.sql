-- UP --

-- ================================================================
-- EFM PP Phase 1 Foundation — Base Schema
-- Additive only. No destructive changes authorized.
-- ================================================================

-- ID sequences: one per document type, per year.
-- Format: PP-YY-xxxx, INV-PP-YY-xxxx, RCP-PP-YY-xxxx, etc.
-- The authoritative ID generator uses these sequences.
CREATE TABLE IF NOT EXISTS id_sequences (
  id           SERIAL PRIMARY KEY,
  doc_type     TEXT        NOT NULL,  -- e.g. 'ORDER', 'INVOICE', 'RECEIPT'
  module       TEXT        NOT NULL,  -- e.g. 'PP', 'B2B', 'EVENT'
  year         SMALLINT    NOT NULL,
  last_seq     INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (doc_type, module, year)
);

-- Audit log: append-only. No UPDATE or DELETE authorized on this table.
CREATE TABLE IF NOT EXISTS audit_events (
  id           UUID        PRIMARY KEY,
  event_type   TEXT        NOT NULL,
  entity_type  TEXT        NOT NULL,
  entity_id    TEXT        NOT NULL,
  actor_id     TEXT,
  metadata     JSONB       NOT NULL DEFAULT '{}',
  request_id   UUID,
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for audit queries by entity
CREATE INDEX IF NOT EXISTS idx_audit_entity
  ON audit_events (entity_type, entity_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_request
  ON audit_events (request_id)
  WHERE request_id IS NOT NULL;

-- PIC Master: single authoritative registry across all business contexts.
-- DEC-02: one PIC master, multiple business contexts via pic_contexts join.
CREATE TABLE IF NOT EXISTS pic_master (
  id              TEXT        PRIMARY KEY,  -- format: PIC-YY-xxxx
  full_name       TEXT        NOT NULL,
  email           TEXT        UNIQUE,
  phone           TEXT,
  status          TEXT        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'inactive', 'suspended')),
  pks_expiry_date DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PIC business context: maps one PIC to multiple modules/roles
CREATE TABLE IF NOT EXISTS pic_contexts (
  id           SERIAL      PRIMARY KEY,
  pic_id       TEXT        NOT NULL REFERENCES pic_master(id),
  module       TEXT        NOT NULL,  -- 'PP', 'B2B', 'EVENT', 'OPS'
  role         TEXT        NOT NULL,  -- 'trainer', 'coordinator', 'admin'
  cost_rate    NUMERIC(12,2),         -- internal cost per session/unit
  charge_rate  NUMERIC(12,2),         -- rate charged to client
  effective_from DATE       NOT NULL DEFAULT CURRENT_DATE,
  effective_to   DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pic_id, module, role, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_pic_contexts_pic
  ON pic_contexts (pic_id, module);

-- DOWN --

DROP INDEX IF EXISTS idx_pic_contexts_pic;
DROP TABLE IF EXISTS pic_contexts;
DROP TABLE IF EXISTS pic_master;
DROP INDEX IF EXISTS idx_audit_request;
DROP INDEX IF EXISTS idx_audit_entity;
DROP TABLE IF EXISTS audit_events;
DROP TABLE IF EXISTS id_sequences;
