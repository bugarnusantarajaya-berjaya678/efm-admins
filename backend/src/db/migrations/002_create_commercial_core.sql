-- Migration: 002_create_commercial_core
-- Phase 2A Commercial Core: catalog, leads, clients, orders, invoices, payments, receipts, refunds

-- UP --

-- Catalog: programs
CREATE TABLE programs (
  id           TEXT PRIMARY KEY,
  module       TEXT NOT NULL CHECK (module IN ('PP','B2B','EVENT')),
  name         TEXT NOT NULL,
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catalog: offerings (top-level sellable unit, e.g. "Private Training")
CREATE TABLE offerings (
  id           TEXT PRIMARY KEY,
  program_id   TEXT NOT NULL REFERENCES programs(id),
  name         TEXT NOT NULL,
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catalog: packages (e.g. "12 Sesi - Pro")
CREATE TABLE packages (
  id           TEXT PRIMARY KEY,
  offering_id  TEXT NOT NULL REFERENCES offerings(id),
  name         TEXT NOT NULL,
  session_count INTEGER NOT NULL CHECK (session_count > 0),
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catalog: package_prices (effective price history)
CREATE TABLE package_prices (
  id            TEXT PRIMARY KEY,
  package_id    TEXT NOT NULL REFERENCES packages(id),
  price         NUMERIC(14,2) NOT NULL CHECK (price >= 0),
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leads for PP module
CREATE TABLE leads_pp (
  id           TEXT PRIMARY KEY,  -- LP-xxxx (permanent)
  full_name    TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  source       TEXT,
  status       TEXT NOT NULL DEFAULT 'NEW'
                CHECK (status IN ('NEW','APPROACH','SCREENING','INVOICING','CLOSING','CONVERTED','CLOSED_LOST')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clients (individuals who have at least one confirmed order)
CREATE TABLE clients_pp (
  id           TEXT PRIMARY KEY,  -- KL-xxxx (permanent)
  lead_id      TEXT REFERENCES leads_pp(id),
  full_name    TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  address      TEXT,
  notes        TEXT,
  status       TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders for PP module
CREATE TABLE orders_pp (
  id                  TEXT PRIMARY KEY,  -- PP-YY-xxxx
  client_id           TEXT NOT NULL REFERENCES clients_pp(id),
  lead_id             TEXT REFERENCES leads_pp(id),
  package_id          TEXT NOT NULL REFERENCES packages(id),
  pic_id              TEXT NOT NULL,     -- FK to pic_master
  status              TEXT NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','PENDING_PAYMENT','ACTIVE','COMPLETED','CANCELLED')),
  start_date          DATE,
  urgency_flag        TEXT NOT NULL DEFAULT 'NORMAL' CHECK (urgency_flag IN ('NORMAL','URGENT')),
  sessions_total      INTEGER NOT NULL CHECK (sessions_total > 0),
  sessions_completed  INTEGER NOT NULL DEFAULT 0,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Commercial snapshot (write-once at order creation)
CREATE TABLE order_commercial_snapshots (
  order_id         TEXT PRIMARY KEY REFERENCES orders_pp(id),
  package_name     TEXT NOT NULL,
  offering_name    TEXT NOT NULL,
  program_name     TEXT NOT NULL,
  sessions_total   INTEGER NOT NULL,
  unit_price       NUMERIC(14,2) NOT NULL,
  base_amount      NUMERIC(14,2) NOT NULL,
  discount_code    TEXT,
  discount_amount  NUMERIC(14,2) NOT NULL DEFAULT 0,
  final_amount     NUMERIC(14,2) NOT NULL,
  captured_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices for PP orders
CREATE TABLE invoices_pp (
  id           TEXT PRIMARY KEY,  -- INV-PP-YY-xxxx
  order_id     TEXT NOT NULL UNIQUE REFERENCES orders_pp(id),
  status       TEXT NOT NULL DEFAULT 'DRAFT'
                CHECK (status IN ('DRAFT','SENT','PAID','OVERDUE','CANCELLED')),
  issued_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date     DATE NOT NULL,
  final_amount NUMERIC(14,2) NOT NULL CHECK (final_amount >= 0),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments for PP invoices
CREATE TABLE payments_pp (
  id             TEXT PRIMARY KEY,  -- UUID
  invoice_id     TEXT NOT NULL REFERENCES invoices_pp(id),
  order_id       TEXT NOT NULL REFERENCES orders_pp(id),
  amount         NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  payment_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  status         TEXT NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING','CONFIRMED','REJECTED')),
  reference_no   TEXT,
  notes          TEXT,
  confirmed_at   TIMESTAMPTZ,
  confirmed_by   TEXT,
  rejected_at    TIMESTAMPTZ,
  rejected_by    TEXT,
  rejection_reason TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Receipts for confirmed payments
CREATE TABLE receipts_pp (
  id          TEXT PRIMARY KEY,  -- RCP-PP-YY-xxxx
  payment_id  TEXT NOT NULL UNIQUE REFERENCES payments_pp(id),
  order_id    TEXT NOT NULL REFERENCES orders_pp(id),
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount      NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Refunds (append-only, 1 per payment, full refund only)
CREATE TABLE refunds_pp (
  id             TEXT PRIMARY KEY,  -- REF-PP-YY-xxxx
  payment_id     TEXT NOT NULL UNIQUE REFERENCES payments_pp(id),
  order_id       TEXT NOT NULL REFERENCES orders_pp(id),
  amount         NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  reason         TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING','PROCESSED','REJECTED')),
  requested_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at   TIMESTAMPTZ,
  processed_by   TEXT,
  rejected_at    TIMESTAMPTZ,
  rejected_by    TEXT,
  rejection_reason TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common access patterns
CREATE INDEX idx_leads_pp_status ON leads_pp(status);
CREATE INDEX idx_orders_pp_client_id ON orders_pp(client_id);
CREATE INDEX idx_orders_pp_status ON orders_pp(status);
CREATE INDEX idx_orders_pp_start_date ON orders_pp(start_date);
CREATE INDEX idx_invoices_pp_order_id ON invoices_pp(order_id);
CREATE INDEX idx_invoices_pp_status ON invoices_pp(status);
CREATE INDEX idx_invoices_pp_due_date ON invoices_pp(due_date);
CREATE INDEX idx_payments_pp_invoice_id ON payments_pp(invoice_id);
CREATE INDEX idx_payments_pp_status ON payments_pp(status);
CREATE INDEX idx_receipts_pp_payment_id ON receipts_pp(payment_id);
CREATE INDEX idx_refunds_pp_payment_id ON refunds_pp(payment_id);

-- DOWN --

DROP INDEX IF EXISTS idx_refunds_pp_payment_id;
DROP INDEX IF EXISTS idx_receipts_pp_payment_id;
DROP INDEX IF EXISTS idx_payments_pp_status;
DROP INDEX IF EXISTS idx_payments_pp_invoice_id;
DROP INDEX IF EXISTS idx_invoices_pp_due_date;
DROP INDEX IF EXISTS idx_invoices_pp_status;
DROP INDEX IF EXISTS idx_invoices_pp_order_id;
DROP INDEX IF EXISTS idx_orders_pp_start_date;
DROP INDEX IF EXISTS idx_orders_pp_status;
DROP INDEX IF EXISTS idx_orders_pp_client_id;
DROP INDEX IF EXISTS idx_leads_pp_status;

DROP TABLE IF EXISTS refunds_pp;
DROP TABLE IF EXISTS receipts_pp;
DROP TABLE IF EXISTS payments_pp;
DROP TABLE IF EXISTS invoices_pp;
DROP TABLE IF EXISTS order_commercial_snapshots;
DROP TABLE IF EXISTS orders_pp;
DROP TABLE IF EXISTS clients_pp;
DROP TABLE IF EXISTS leads_pp;
DROP TABLE IF EXISTS package_prices;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS offerings;
DROP TABLE IF EXISTS programs;
