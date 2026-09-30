-- Migration: 003_create_participants_assessments
-- Phase 2B: Participants and Assessments for PP module

-- UP --

-- Participants: one training profile per PP order
CREATE TABLE participants_pp (
  id                    TEXT PRIMARY KEY,  -- PTR-PP-YY-xxxx
  order_id              TEXT NOT NULL UNIQUE REFERENCES orders_pp(id),
  client_id             TEXT NOT NULL REFERENCES clients_pp(id),
  full_name             TEXT NOT NULL,
  date_of_birth         DATE,
  gender                TEXT CHECK (gender IN ('M', 'F', 'O')),
  initial_fitness_level TEXT CHECK (initial_fitness_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  fitness_goals         TEXT,
  health_notes          TEXT,
  trainer_notes         TEXT,
  status                TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assessments: linked to participants_pp (NOT directly to clients_pp)
CREATE TABLE assessments_pp (
  id               TEXT PRIMARY KEY,  -- SCR-YY-xxxx (module-independent via GLOBAL bucket)
  participant_id   TEXT NOT NULL REFERENCES participants_pp(id),
  order_id         TEXT NOT NULL REFERENCES orders_pp(id),
  assessor_id      TEXT,
  assessment_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  assessment_type  TEXT NOT NULL CHECK (assessment_type IN ('PRE', 'MID', 'POST')),
  height_cm        NUMERIC(5, 2) CHECK (height_cm > 0),
  weight_kg        NUMERIC(5, 2) CHECK (weight_kg > 0),
  body_fat_pct     NUMERIC(5, 2),
  fitness_score    INTEGER CHECK (fitness_score BETWEEN 0 AND 100),
  notes            TEXT,
  status           TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'COMPLETED', 'ARCHIVED')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_participants_pp_order_id  ON participants_pp(order_id);
CREATE INDEX idx_participants_pp_client_id ON participants_pp(client_id);
CREATE INDEX idx_assessments_pp_participant_id ON assessments_pp(participant_id);
CREATE INDEX idx_assessments_pp_order_id       ON assessments_pp(order_id);
CREATE INDEX idx_assessments_pp_status         ON assessments_pp(status);

-- DOWN --

DROP INDEX IF EXISTS idx_assessments_pp_status;
DROP INDEX IF EXISTS idx_assessments_pp_order_id;
DROP INDEX IF EXISTS idx_assessments_pp_participant_id;
DROP INDEX IF EXISTS idx_participants_pp_client_id;
DROP INDEX IF EXISTS idx_participants_pp_order_id;

DROP TABLE IF EXISTS assessments_pp;
DROP TABLE IF EXISTS participants_pp;
