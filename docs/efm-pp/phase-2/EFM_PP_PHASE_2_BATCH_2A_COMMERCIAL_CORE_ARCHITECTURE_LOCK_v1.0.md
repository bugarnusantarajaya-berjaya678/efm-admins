# EFM PP — PHASE 2 BATCH 2A: COMMERCIAL CORE ARCHITECTURE LOCK v1.0

**Status:** ARCHITECTURE LOCK — ANALYSIS ONLY  
**Date:** 2026-09-29  
**Branch:** `claude/add-claude-md-instructions-7iqjvo`  
**Constraint:** NO CODE WRITTEN — documentation only  
**Phase:** 2, Batch 2A — Commercial Core  
**Prerequisite:** Phase 1 Foundation COMPLETE (commit `b9c7c5d` on main, 84/84 tests passing)

---

## 1. SCOPE OF BATCH 2A

Batch 2A implements the commercial transaction backbone of the PP module. It covers:

| Entity | ID Format | Phase 1 ID Token Available |
|---|---|---|
| Program | No ID sequence (catalog, admin-managed) | — |
| Offering | No ID sequence (catalog sub-type) | — |
| Package | No ID sequence (catalog grouping) | — |
| PackagePrice | No ID sequence (price point) | — |
| Lead | `LP-xxxx` (permanent, no year) | ✓ `nextId(LEAD_PP, PP)` |
| Client | `KL-xxxx` (proposed; see §4.6) | OPEN DECISION — see §10 |
| Order | `PP-YY-xxxx` | ✓ `nextId(ORDER, PP)` |
| CommercialSnapshot | embedded in Order | — |
| Invoice | `INV-PP-YY-xxxx` | ✓ `nextId(INVOICE, PP)` |
| Payment | No dedicated ID (see §4.9) | OPEN DECISION — see §10 |
| Receipt | `RCP-PP-YY-xxxx` | ✓ `nextId(RECEIPT, PP)` |

**Explicitly OUT of Batch 2A scope:**
- Agreement (Phase 3)
- H&S (Phase 3)
- Participant roster (Batch 2B)
- Assessment (Batch 2B)
- Assignment (Phase 5)
- Session, Attendance (Phase 5)

---

## 2. AUTHORITY CHAIN

Architecture decisions in this document are derived from the following sources in precedence order:

1. Locked Governance
2. Master Agreement Architecture
3. Program Module Documentation
4. PP Business Logic Master
5. PP Core Lock
6. PP Backend Data Contract
7. `EFM_PP_TECHNICAL_BUILD_SPECIFICATION_v1.0.md`
8. `01_EFM_PP_TECHNICAL_BUILD_QA_ARCHITECTURE_AUDIT_v1.0.md`
9. `02_EFM_PP_CLAUDE_CODE_MASTER_EXECUTION_BRIEF_v1.0.md`
10. `03_EFM_PP_BACKEND_CODING_PLAN_v1.0.md`
11. `04_EFM_PP_DATABASE_SCHEMA_MIGRATION_SPEC_v1.0.md`
12. `05_EFM_PP_API_ENDPOINT_SPECIFICATION_v1.0.md`
13. `06_EFM_PP_BACKEND_VALIDATION_GATE_SPEC_v1.0.md`
14. `01_EFM_PP_FINAL_BACKEND_PRE_CODING_LOCK_v1.0.md`
15. Phase 1 Foundation implementation (existing code)
16. Legacy React `*Data.js` / `*Store.js` files (reference only — NOT authority)

---

## 3. PHASE 1 FOUNDATION INHERITANCE

The following Phase 1 Foundation items are **available and must be used** in Batch 2A:

| Foundation Item | File | Used By |
|---|---|---|
| ID generator (`nextId`) | `backend/src/modules/id/id.generator.js` | Order, Invoice, Receipt, Lead |
| Error categories | `backend/src/shared/errors.js` | All service validation |
| Base repository | `backend/src/shared/baseRepository.js` | All Batch 2A repositories |
| Base service | `backend/src/shared/baseService.js` | All Batch 2A services |
| Audit service | `backend/src/modules/audit/audit.service.js` | All state transitions |
| PIC master (table) | `001_create_schema_foundation.sql` | Order commercial snapshot |
| Correlation ID middleware | `backend/src/middleware/correlationId.js` | All Batch 2A routes |
| Error handler middleware | `backend/src/middleware/errorHandler.js` | All Batch 2A routes |
| `withTransaction` / `query` | `backend/src/db/index.js` | All Batch 2A repositories |

**Non-negotiable:** Every Batch 2A service MUST use `nextId()` for all ID generation — never generate IDs independently or inline.

---

## 4. ENTITY SPECIFICATIONS

### 4.1 Program (Catalog Root)

**Source of truth:** admin-managed catalog. Not a transactional entity.

**Locked rules:**
- Program is the root of the hierarchy: `Program → Offering → Package → PackagePrice`
- A Program has one or more Offerings (e.g. "Private Training", "Semi-Private Training")
- Programs must exist in the catalog before an Order can reference them (Gate 01)
- No hardcoded catalog prices in UI — prices come from PackagePrice records

**Field specification:**

| Field | Type | Classification |
|---|---|---|
| `id` | TEXT (PK) | System-generated (no sequence — admin-assigned) |
| `name` | TEXT NOT NULL | User input (admin) |
| `category` | TEXT NOT NULL | User input (admin) |
| `description` | TEXT | User input (admin) |
| `status` | TEXT (active/inactive) | User input (admin) |
| `created_at` | TIMESTAMPTZ | System-generated |
| `updated_at` | TIMESTAMPTZ | System-generated |

**Database table:** `programs`

**Legacy reference:** `ppProgramDBData.js` flat records — shape is legacy, not authoritative. The new hierarchy requires Offering and Package layers that do not exist in legacy data.

---

### 4.2 Offering

**Source of truth:** catalog, child of Program.

**Locked rules:**
- An Offering represents a service variant within a Program (e.g. "Solo Training", "Couple Training")
- An Offering has one or more Packages

**Field specification:**

| Field | Type | Classification |
|---|---|---|
| `id` | TEXT (PK) | System-generated (admin-assigned) |
| `program_id` | TEXT NOT NULL FK → programs | System-generated |
| `name` | TEXT NOT NULL | User input (admin) |
| `type` | TEXT | User input (admin): `solo`, `couple`, `group` |
| `status` | TEXT (active/inactive) | User input (admin) |
| `created_at` | TIMESTAMPTZ | System-generated |
| `updated_at` | TIMESTAMPTZ | System-generated |

**Database table:** `offerings`

---

### 4.3 Package

**Source of truth:** catalog, child of Offering.

**Locked rules:**
- A Package specifies a session/unit count within an Offering
- Standard PP packages: 4 Sesi (Starter), 8 Sesi (Base), 12 Sesi (Pro), 24 Sesi (Elite)
- A Package has one or more PackagePrice records (for different price tiers, promotions, etc.)

**Field specification:**

| Field | Type | Classification |
|---|---|---|
| `id` | TEXT (PK) | System-generated (admin-assigned) |
| `offering_id` | TEXT NOT NULL FK → offerings | System-generated |
| `label` | TEXT NOT NULL | User input (admin): e.g. "4 Sesi - Starter" |
| `session_count` | INTEGER NOT NULL | User input (admin) |
| `program_period_weeks` | INTEGER | User input (admin) |
| `status` | TEXT (active/inactive) | User input (admin) |
| `created_at` | TIMESTAMPTZ | System-generated |
| `updated_at` | TIMESTAMPTZ | System-generated |

**Database table:** `packages`

---

### 4.4 PackagePrice

**Source of truth:** catalog, child of Package.

**Locked rules:**
- A PackagePrice is a specific price point for a Package at a point in time
- Multiple PackagePrice records can exist per Package (e.g. regular vs. promo pricing)
- The Order commercial snapshot captures the PackagePrice at Order creation — changes to the catalog do NOT affect existing Orders
- Authoritative standard prices (no deviation allowed): 4 Sesi = Rp 800.000, 8 Sesi = Rp 1.600.000, 12 Sesi = Rp 2.400.000, 24 Sesi = Rp 4.800.000 (Rp 200.000/sesi)

**Field specification:**

| Field | Type | Classification |
|---|---|---|
| `id` | TEXT (PK) | System-generated (admin-assigned) |
| `package_id` | TEXT NOT NULL FK → packages | System-generated |
| `price_total` | NUMERIC(12,2) NOT NULL | User input (admin) |
| `price_per_session` | NUMERIC(12,2) NOT NULL | Calculated from price_total / session_count |
| `currency` | TEXT NOT NULL DEFAULT 'IDR' | System default |
| `effective_from` | DATE NOT NULL | User input (admin) |
| `effective_to` | DATE | User input (admin) |
| `status` | TEXT (active/inactive/superseded) | System + admin |
| `created_at` | TIMESTAMPTZ | System-generated |

**Database table:** `package_prices`

---

### 4.5 Lead

**Source of truth:** `leads` table.

**Locked rules:**
- Lead ID format: `LP-xxxx` — permanent, never resets annually, never includes year
- Lead ID generation: `nextId(DOCTYPE.LEAD_PP, MODULE.PP)` → year=0 bucket
- Lead is the pipeline entry point; it is NOT the same as Client
- Lead progresses through stages: New → Approach → Screening → Invoicing → Closing → Convert
- A Lead becomes `closed-won` when an Order is created from it; `closed-lost` on Cancelled Order
- Duplicate lead check: same phone/email within 30 days → `CONFLICT` error
- Lead references the source channel (referral, social media, etc.)

**Field specification (complete):**

| Field | Type | Classification |
|---|---|---|
| `id` | TEXT (PK) | System-generated via `nextId(LEAD_PP, PP)` |
| `full_name` | TEXT NOT NULL | User input |
| `phone` | TEXT NOT NULL | User input |
| `email` | TEXT | User input |
| `source` | TEXT | User input |
| `interest` | TEXT | User input |
| `stage` | TEXT NOT NULL | System-maintained |
| `status` | TEXT NOT NULL | System-maintained: `active`, `closed-won`, `closed-lost` |
| `notes` | TEXT | User input |
| `assigned_to` | TEXT FK → pic_master(id) | User input (optional PIC assignment) |
| `created_at` | TIMESTAMPTZ | System-generated |
| `updated_at` | TIMESTAMPTZ | System-generated |

**Database table:** `leads`

**Legacy reference:** `ppLeadsData.js` — ID format `LP-xxxx` confirmed as correct. Stage values match. Behavior aligns. Legacy data should NOT be automatically migrated (DEC-07).

---

### 4.6 Client

**Source of truth:** `clients` table.

**Locked rules:**
- Client is the payer/registrant identity — separate from Participant (Batch 2B)
- In Solo program: Client IS also the Participant (still two separate records)
- In Couple/Group program: one Client (payer) may register multiple Participants
- Client profile is permanent and can span multiple Orders
- Client references Lead via `lead_id` (but a Client may exist without a Lead record — walk-in)

**Field specification (complete):**

| Field | Type | Classification |
|---|---|---|
| `id` | TEXT (PK) | OPEN DECISION §10 — see note below |
| `lead_id` | TEXT FK → leads(id) | System-generated (nullable — walk-in clients have no Lead) |
| `full_name` | TEXT NOT NULL | User input |
| `phone` | TEXT NOT NULL | User input |
| `email` | TEXT | User input |
| `birth_date` | DATE | User input |
| `gender` | TEXT | User input |
| `address` | TEXT | User input |
| `guardian_name` | TEXT | User input (required if age < 17) |
| `guardian_phone` | TEXT | User input (required if age < 17) |
| `guardian_relationship` | TEXT | User input (required if age < 17) |
| `created_at` | TIMESTAMPTZ | System-generated |
| `updated_at` | TIMESTAMPTZ | System-generated |

**OPEN DECISION §10.1:** Client ID format — `KL-xxxx` (legacy) vs new sequence format `CLT-YY-xxxx` vs permanent `KL-xxxx` (like Lead, permanent). Requires owner decision.

**Database table:** `clients`

**Legacy reference:** `ppKlienData.js` — uses `KL-xxxx` IDs. This is reference evidence; not authoritative for the backend schema.

---

### 4.7 Order

**Source of truth:** `orders` table + `order_commercial_snapshots` table.

**Locked rules (from spec — non-negotiable):**
- Order is the commercial transaction center
- Order is created from a Lead + Client context with a selected PackagePrice
- Order ID format: `PP-YY-xxxx` — generated via `nextId(ORDER, PP)`
- The commercial snapshot is FROZEN at Order creation time
- If the catalog changes after Order creation, the Order snapshot is NOT updated
- Renewal creates a NEW Order — never mutates an existing Order
- Order status lifecycle: `draft` → `active` → `completed` | `cancelled`
- An Order has one Invoice (per billing cycle / renewal)
- An Order has one Agreement (created after Order becomes active)
- The `tahapan` field tracks the furthest pipeline stage reached (not the current active stage)

**Field specification — orders table:**

| Field | Type | Classification |
|---|---|---|
| `id` | TEXT (PK) | System-generated via `nextId(ORDER, PP)` |
| `lead_id` | TEXT FK → leads(id) | User input / system-linked |
| `client_id` | TEXT FK → clients(id) | User input / system-linked |
| `package_price_id` | TEXT FK → package_prices(id) | User input (at Order creation) |
| `program_type` | TEXT NOT NULL | User input: `solo`, `couple`, `group` |
| `status` | TEXT NOT NULL DEFAULT 'draft' | System-maintained |
| `tahapan` | TEXT NOT NULL DEFAULT 'Order' | System-maintained (furthest stage) |
| `start_date` | DATE | User input |
| `end_date` | DATE | System-calculated |
| `notes` | TEXT | User input |
| `created_at` | TIMESTAMPTZ | System-generated |
| `updated_at` | TIMESTAMPTZ | System-generated |

**Field specification — order_commercial_snapshots table:**

| Field | Type | Classification |
|---|---|---|
| `id` | SERIAL (PK) | System-generated |
| `order_id` | TEXT NOT NULL FK → orders(id) UNIQUE | System-generated |
| `program_name` | TEXT NOT NULL | Snapshot: copied from program at Order creation |
| `offering_name` | TEXT NOT NULL | Snapshot: copied from offering at Order creation |
| `package_label` | TEXT NOT NULL | Snapshot: copied from package at Order creation |
| `session_count` | INTEGER NOT NULL | Snapshot: copied from package at Order creation |
| `price_per_session` | NUMERIC(12,2) NOT NULL | Snapshot: copied from package_price at Order creation |
| `price_total` | NUMERIC(12,2) NOT NULL | Snapshot: copied from package_price at Order creation |
| `currency` | TEXT NOT NULL | Snapshot: copied from package_price at Order creation |
| `promo_code` | TEXT | Snapshot: applied promo code if any |
| `discount_amount` | NUMERIC(12,2) NOT NULL DEFAULT 0 | Snapshot: discount applied |
| `final_amount` | NUMERIC(12,2) NOT NULL | Snapshot: price_total - discount_amount |
| `snapshot_at` | TIMESTAMPTZ NOT NULL DEFAULT NOW() | System-generated |

**Snapshot rule enforcement:** The `order_commercial_snapshots` table has no UPDATE path in the service layer. If modification is attempted after creation, the service must throw `CONFLICT` (matching Agreement guard pattern in Phase 1).

**Database tables:** `orders`, `order_commercial_snapshots`

**Legacy reference:** `ppOrdersData.js` — `PP-YY-xxxx` format confirmed correct. `tahapan` semantics confirmed (furthest stage, not current). `rincianLayanan` and `paymentTracking` arrays are legacy UI patterns that map to the new `order_commercial_snapshots` + `invoices` + `payments` tables.

---

### 4.8 Invoice

**Source of truth:** `invoices` table.

**Locked rules:**
- Invoice is a separate transaction record from Order
- One Invoice per Order per billing cycle (renewals generate a new Order which gets its own Invoice)
- Invoice ID format: `INV-PP-YY-xxxx` — generated via `nextId(INVOICE, PP)`
- Invoice status lifecycle: `draft` → `sent` → `paid` | `overdue` | `void`
- Invoice cannot be modified after status = `paid` or `void`
- Invoice contains a line item detail that references the Order commercial snapshot
- Invoice is created AFTER Order is active (Gate 02 must pass)

**Field specification:**

| Field | Type | Classification |
|---|---|---|
| `id` | TEXT (PK) | System-generated via `nextId(INVOICE, PP)` |
| `order_id` | TEXT NOT NULL FK → orders(id) | System-linked |
| `invoice_number` | TEXT NOT NULL | Same as `id` (display reference) |
| `status` | TEXT NOT NULL DEFAULT 'draft' | System-maintained |
| `issue_date` | DATE NOT NULL DEFAULT CURRENT_DATE | User input / system default |
| `due_date` | DATE NOT NULL | User input (min H+2 from issue_date) |
| `subtotal` | NUMERIC(12,2) NOT NULL | Calculated from snapshot |
| `discount_amount` | NUMERIC(12,2) NOT NULL DEFAULT 0 | From Order snapshot |
| `tax_amount` | NUMERIC(12,2) NOT NULL DEFAULT 0 | Calculated (if PPN applies) |
| `total_amount` | NUMERIC(12,2) NOT NULL | Calculated: subtotal - discount + tax |
| `currency` | TEXT NOT NULL DEFAULT 'IDR' | System default |
| `notes` | TEXT | User input |
| `terms` | TEXT | User input |
| `sent_at` | TIMESTAMPTZ | System-generated on `sent` transition |
| `paid_at` | TIMESTAMPTZ | System-generated on `paid` transition |
| `created_at` | TIMESTAMPTZ | System-generated |
| `updated_at` | TIMESTAMPTZ | System-generated |

**Database table:** `invoices`

**Legacy reference:** `ppInvoiceData.js` — `INV-PP-YY-xxxx` format confirmed correct. Status values (`draft`, `terkirim`, `lunas`, `overdue`) map to new `draft/sent/paid/overdue` but naming will be standardized to English in database; Indonesian labels are UI-layer concerns only.

---

### 4.9 Payment

**Source of truth:** `payments` table.

**Locked rules:**
- Payment is a separate transaction record (referenced in database spec but absent from legacy UI)
- A Payment records the act of money transfer from client to EFM
- Payment confirmation requires an authorized actor (Gate 03)
- Payment is linked to Invoice (one or more Payments may partially pay an Invoice — OPEN DECISION §10.3)
- Receipt can only be generated after a Payment is confirmed (Gate 04)

**Field specification:**

| Field | Type | Classification |
|---|---|---|
| `id` | TEXT (PK) | OPEN DECISION §10.2 — Payment ID format not specified in spec |
| `invoice_id` | TEXT NOT NULL FK → invoices(id) | System-linked |
| `amount` | NUMERIC(12,2) NOT NULL | User input (payment amount received) |
| `payment_method` | TEXT NOT NULL | User input: `transfer`, `cash`, `qr`, etc. |
| `payment_reference` | TEXT | User input (bank reference / bukti bayar) |
| `payment_date` | DATE NOT NULL | User input |
| `status` | TEXT NOT NULL DEFAULT 'pending' | System-maintained: `pending` → `confirmed` | `rejected` |
| `confirmed_by` | TEXT | System-recorded actor ID on confirmation |
| `confirmed_at` | TIMESTAMPTZ | System-generated |
| `upload_proof_url` | TEXT | User input (proof of payment file URL) |
| `notes` | TEXT | User input |
| `created_at` | TIMESTAMPTZ | System-generated |
| `updated_at` | TIMESTAMPTZ | System-generated |

**Database table:** `payments`

**OPEN DECISION §10.2:** Payment ID format. No ID sequence exists for Payment in Phase 1 foundation (`id.generator.js` does not have a PAYMENT doc type). Options: (A) use database SERIAL/UUID, (B) add PAY-PP-YY-xxxx sequence (requires migration). See §10 for decision record.

---

### 4.10 Receipt

**Source of truth:** `receipts` table.

**Locked rules:**
- Receipt follows confirmed Payment (Gate 04 — not just Invoice status)
- Receipt is a separate document from Invoice
- Receipt ID format: `RCP-PP-YY-xxxx` — generated via `nextId(RECEIPT, PP)`
- Receipt is immutable once created (it is a financial record of payment received)
- Receipt references exactly one confirmed Payment

**Field specification:**

| Field | Type | Classification |
|---|---|---|
| `id` | TEXT (PK) | System-generated via `nextId(RECEIPT, PP)` |
| `payment_id` | TEXT NOT NULL UNIQUE FK → payments(id) | System-linked (one receipt per payment) |
| `order_id` | TEXT NOT NULL FK → orders(id) | Denormalized for query convenience |
| `invoice_id` | TEXT NOT NULL FK → invoices(id) | System-linked |
| `receipt_number` | TEXT NOT NULL | Same as `id` (display reference) |
| `amount_received` | NUMERIC(12,2) NOT NULL | Snapshot: copied from payment.amount |
| `payment_method` | TEXT NOT NULL | Snapshot: copied from payment.payment_method |
| `payment_date` | DATE NOT NULL | Snapshot: copied from payment.payment_date |
| `issued_date` | DATE NOT NULL DEFAULT CURRENT_DATE | System-generated |
| `issued_by` | TEXT | Actor ID of staff issuing receipt |
| `notes` | TEXT | User input |
| `created_at` | TIMESTAMPTZ | System-generated |

**Immutability enforcement:** No UPDATE path in the service layer for receipts after creation. The repository must not expose an `update` method for Receipt.

**Database table:** `receipts`

**Legacy reference:** `ppReceiptData.js` — `RCP-PP-YY-xxxx` format confirmed correct.

---

## 5. VALIDATION GATES (BATCH 2A)

### Gate 01 — Catalog Validation

Before an Order can be created:
1. The referenced `program_id` must exist and have `status = 'active'`
2. The referenced `offering_id` must exist, belong to the program, and have `status = 'active'`
3. The referenced `package_id` must exist, belong to the offering, and have `status = 'active'`
4. A `package_price_id` must exist, belong to the package, have `status = 'active'`, and be within its `effective_from` / `effective_to` date range

Error if any of the above fails: `BUSINESS_RULE_VIOLATION` with code `CATALOG_INVALID`.

### Gate 02 — Order Validation

Before an Order can be created or transitioned to `active`:
1. Lead must exist and have status `active` or `closed-won`
2. Client must exist
3. Program type (`solo`/`couple`/`group`) must match the Offering type
4. Commercial snapshot must be created in the same transaction as the Order
5. All catalog references (Gate 01) must pass

Error type: `VALIDATION_ERROR` for missing fields, `BUSINESS_RULE_VIOLATION` for gate failures.

### Gate 03 — Payment Validation

Before a Payment can be confirmed:
1. Invoice must exist and have status `sent` (not `draft`, `paid`, `void`)
2. Order must be `active`
3. Payment amount must be > 0
4. `confirmed_by` actor must be provided
5. `payment_reference` is recommended but not required

Error type: `BUSINESS_RULE_VIOLATION` with code `PAYMENT_INVALID`.

### Gate 04 — Receipt Validation

Before a Receipt can be generated:
1. Payment must exist and have `status = 'confirmed'`
2. No receipt can already exist for this Payment (one receipt per payment)
3. Receipt must reference the exact `amount` from the confirmed Payment

Error type: `BUSINESS_RULE_VIOLATION` with code `RECEIPT_INVALID`.

---

## 6. API ENDPOINTS (BATCH 2A)

From `05_EFM_PP_API_ENDPOINT_SPECIFICATION_v1.0.md`, adapted for Phase 1 foundation conventions:

### Catalog (read-only for Phase 2; admin writes are out of scope)
```
GET  /api/pp/programs
GET  /api/pp/programs/:programId
GET  /api/pp/programs/:programId/offerings
GET  /api/pp/offerings/:offeringId/packages
GET  /api/pp/packages/:packageId/prices
```

### Lead
```
POST /api/pp/leads
GET  /api/pp/leads
GET  /api/pp/leads/:leadId
PATCH /api/pp/leads/:leadId
```

### Client
```
POST /api/pp/clients
GET  /api/pp/clients/:clientId
PATCH /api/pp/clients/:clientId
```

### Order
```
POST /api/pp/orders
GET  /api/pp/orders/:orderId
PATCH /api/pp/orders/:orderId
GET  /api/pp/orders/:orderId/history
GET  /api/pp/orders/:orderId/snapshot
```

### Billing
```
POST /api/pp/orders/:orderId/invoice
GET  /api/pp/invoices/:invoiceId
PATCH /api/pp/invoices/:invoiceId
POST /api/pp/invoices/:invoiceId/payments
POST /api/pp/payments/:paymentId/confirm
GET  /api/pp/payments/:paymentId
POST /api/pp/payments/:paymentId/receipt
GET  /api/pp/receipts/:receiptId
```

---

## 7. DATABASE MIGRATIONS REQUIRED (BATCH 2A)

The following tables must be created in a new migration (e.g. `002_create_commercial_core.sql`):

```
programs
offerings
packages
package_prices
leads
clients
orders
order_commercial_snapshots
invoices
payments
receipts
```

**Migration rules (from spec):**
1. Additive only — no existing Phase 1 tables may be altered
2. All tables use `TIMESTAMPTZ NOT NULL DEFAULT NOW()` for `created_at`
3. All mutable tables use `TIMESTAMPTZ NOT NULL DEFAULT NOW()` for `updated_at`
4. All FK relationships use `ON DELETE RESTRICT` unless explicitly specified otherwise
5. Immutable tables (order_commercial_snapshots, receipts) have no UPDATE path at the service layer
6. No legacy data is migrated in this migration

---

## 8. SERVICE ARCHITECTURE (BATCH 2A)

Each entity requires a module following the Phase 1 pattern:

```
backend/src/modules/
  catalog/
    catalog.repository.js   ← reads programs/offerings/packages/prices
    catalog.service.js
    catalog.router.js
  leads/
    lead.repository.js
    lead.service.js
    lead.router.js
  clients/
    client.repository.js
    client.service.js
    client.router.js
  orders/
    order.repository.js
    order.service.js        ← includes commercial snapshot creation (same transaction)
    order.router.js
  invoices/
    invoice.repository.js
    invoice.service.js
    invoice.router.js
  payments/
    payment.repository.js
    payment.service.js
    payment.router.js
  receipts/
    receipt.repository.js
    receipt.service.js
    receipt.router.js
```

**Mandatory pattern (from Phase 1):**
- Route → Service → Repository → Database
- All validation in Service layer (never in Route or Repository)
- All ID generation via `nextId()` (never inline)
- All state transitions emit Audit events via `audit.service.js`
- All errors use standard categories from `errors.js`
- All requests carry correlation ID from middleware

---

## 9. LEGACY COMPATIBILITY CONSTRAINTS

The following legacy items must NOT be modified or deleted during Batch 2A implementation:

| Legacy Item | Location | Constraint |
|---|---|---|
| `ppOrdersData.js` + `ppOrdersStore.js` | `REACT-APP/src/data/` | Must not be deleted or modified |
| `ppInvoiceData.js` + `ppInvoiceStore.js` | `REACT-APP/src/data/` | Must not be deleted or modified |
| `ppReceiptData.js` + `ppReceiptStore.js` | `REACT-APP/src/data/` | Must not be deleted or modified |
| `ppLeadsData.js` + `ppLeadsStore.js` | `REACT-APP/src/data/` | Must not be deleted or modified |
| `ppKlienData.js` + `ppKlienStore.js` | `REACT-APP/src/data/` | Must not be deleted or modified |
| `ppPromoData.js` + `ppPromoStore.js` | `REACT-APP/src/data/` | Must not be deleted or modified |
| `ppProgramDBData.js` + `ppProgramStore.js` | `REACT-APP/src/data/` | Must not be deleted or modified |
| `BACKEND/apps-script/program-db.gs` | `BACKEND/` | Must not be deleted; DEC-07 still open |

The React frontend continues to use in-memory stores until Phase 6 (UI/API Integration). Batch 2A backend work runs in parallel without touching the frontend.

---

## 10. OPEN OWNER DECISIONS

These decisions are genuinely unresolved from the authoritative documents. No decision will be invented. Each blocks specific implementation details.

### OPEN-2A-01: Client ID Format

**What:** The legacy `ppKlienData.js` uses `KL-xxxx` IDs (no year, permanent). The spec does not define a `CLIENT` doc type in the ID generator. This conflicts with the Phase 1 ID infrastructure which uses year-based sequences for most entities.

**Options:**
- A: Use permanent `KL-xxxx` format (like Lead `LP-xxxx`) — add `LEAD_CLIENT` to `GLOBAL_TYPES` in `id.generator.js`
- B: Use `CLT-YY-xxxx` format — add `CLIENT` doc type to id.generator.js + new migration
- C: Use database UUID / SERIAL (no custom format)

**Impact:** Adding a doc type requires a backend code change + migration. Using UUID has no legacy compatibility. Using `KL-xxxx` matches legacy but requires extending `LEAD_TYPES` logic.

**Decision Required From:** Owner

---

### OPEN-2A-02: Payment ID Format

**What:** The `id.generator.js` has no `PAYMENT` doc type. Payments need unique IDs for reference and audit.

**Options:**
- A: Use database `UUID` as primary key (no custom format)
- B: Use `PAY-PP-YY-xxxx` format — add `PAYMENT` doc type to id.generator.js + migration
- C: Use `SERIAL` integer (no human-readable ID)

**Impact:** Option A is simplest (UUID already used for audit_events); Option B adds a human-readable reference that appears on payment confirmations.

**Decision Required From:** Owner

---

### OPEN-2A-03: Partial Payments Policy

**What:** The spec and locked architecture state "Invoice → Payments (plural)" — implying an Invoice can have multiple partial Payments. The legacy frontend `ppInvoiceData.js` shows single-payment per invoice behavior. Partial payment handling affects the Gate 03 and Gate 04 logic significantly.

**Options:**
- A: One Invoice = one Payment only (simpler; matches legacy behavior)
- B: One Invoice = multiple partial Payments (more complex; requires accumulation logic before receipt is generated)

**Impact:** Option B requires a `SUM(confirmed payments) = invoice.total_amount` check in Gate 04. Option A uses simpler `payment.confirmed = true AND payment.amount = invoice.total_amount`.

**Decision Required From:** Owner

---

### OPEN-2A-04: Promo/Discount Entity Scope

**What:** `ppPromoData.js` + `ppPromoStore.js` exist in the legacy frontend with a discount code mechanism. The spec mentions "Kode Diskon" in the commercial snapshot (Gate 02) but does not define a full Promo entity with its own ID sequence or CRUD endpoints.

**Options:**
- A: Promo codes are admin-managed lookup records (simple table: code, description, discount_type, discount_value, valid_from, valid_to)
- B: Promo is a full entity with its own module, ID sequence, and audit trail
- C: Promo/discount is hardcoded at the admin level with no API management (discount_amount stored on snapshot, no promo entity)

**Impact:** Option C is simplest but limits flexibility. Option A adds a `promos` table and lookup endpoint. Option B is most complete but adds scope.

**Decision Required From:** Owner

---

### OPEN-2A-05: Quotation Entity

**What:** Legacy Order records contain `quotation.nomor` in slash format `QUO/EFM/PP/2027/0002`. The spec mentions a `QUO-PP-YY-xxxx` format but no Quotation entity is defined in the API endpoint specification, and Quotation is not listed as a Phase 2 entity in the coding plan.

**Options:**
- A: Quotation is a Phase 2 entity (add to Batch 2A scope — add `QUOTATION` doc type + table)
- B: Quotation is deferred to Phase 3 or later
- C: Quotation format is standardized in the Order record as a field (not a separate entity)

**Decision Required From:** Owner

---

## 11. NON-NEGOTIABLE CONSTRAINTS (from Master Execution Brief)

The following are absolute constraints that MUST NOT be violated during Batch 2A implementation:

1. **Do not redesign business logic during coding** — the Order-as-commercial-center is locked
2. **Do not globalize Active Aging rules** — Active Aging boundaries stay module-scoped
3. **Do not split the PIC Master by business module** — PIC is shared across PP, B2B, Event
4. **Do not mutate signed Agreements** — enforced by `agreement.guard.js` (Phase 1)
5. **Do not hardcode catalog prices into UI** — all prices come from PackagePrice records
6. **Do not rely on UI-only validation** — all Gates must be in service layer
7. **Do not use one giant lifecycle status** — Order, Invoice, Payment, Receipt each have own status
8. **Do not overwrite historical facts** — Order snapshot + Receipt are immutable
9. **Do not invent unresolved owner/legal decisions** — see §10 for open items
10. **Do not add B2B transaction logic** — this spec covers PP only

---

## 12. BATCH 2A PHASE 2 READINESS VERDICT

**Status:** CONDITIONAL LOCKED — ready for implementation once the following are resolved:

| Condition | Status |
|---|---|
| Phase 1 Foundation complete (84/84 tests) | ✓ CONFIRMED |
| All 10 Batch 2A entity specs defined | ✓ IN THIS DOCUMENT |
| Validation gates specified (01–04) | ✓ IN THIS DOCUMENT |
| API surface defined | ✓ IN THIS DOCUMENT |
| Migration strategy documented | ✓ IN THIS DOCUMENT |
| OPEN-2A-01 Client ID Format resolved | ⚠ OPEN OWNER DECISION |
| OPEN-2A-02 Payment ID Format resolved | ⚠ OPEN OWNER DECISION |
| OPEN-2A-03 Partial Payments Policy resolved | ⚠ OPEN OWNER DECISION |
| OPEN-2A-04 Promo/Discount Scope resolved | ⚠ OPEN OWNER DECISION |
| OPEN-2A-05 Quotation Entity resolved | ⚠ OPEN OWNER DECISION |

**Implementation may proceed on all entities except those blocked by open decisions above.** Specifically: Catalog (Programs/Offerings/Packages/Prices), Lead, Order core, Invoice, Receipt can be coded before the Client ID and Payment format decisions are made, as long as placeholder FK types are noted.

---

*Document created: 2026-09-29 | Mode: ANALYSIS ONLY — NO SOURCE FILES MODIFIED*
