# EFM PP Phase 2A — Commercial Core Implementation Report v1.0

**Date:** 2026-09-30  
**Branch:** `claude/add-claude-md-instructions-7iqjvo`  
**Status:** ✅ COMPLETE — 139/139 tests passing

---

## 1. Scope

Phase 2A implements the complete commercial transaction pipeline for the Private Program (PP) module:

- Database migration (12 new tables)
- ID generator extensions
- 8 service modules: catalog, lead, client, order, invoice, payment, receipt, refund
- Deadline engine (urgency classification)
- Program Readiness as derived state
- Full API surface under `/api/pp/`
- 55 new tests (all passing)

**Explicitly out of scope:** B2B Management, B2B Event, legacy GAS/Google Sheets, REACT-APP frontend, data migration.

---

## 2. Database Migration — `002_create_commercial_core.sql`

### Tables Created (12)

| Table | Purpose |
|---|---|
| `programs` | Top-level training program catalog entries |
| `offerings` | Program offerings (variants/tracks under a program) |
| `packages` | Session packages under an offering |
| `package_prices` | Price history for packages (current = latest effective_from) |
| `leads_pp` | PP module leads (prospect funnel) |
| `clients_pp` | Confirmed clients (converted from leads or direct) |
| `orders_pp` | PP orders with status machine and urgency flag |
| `order_commercial_snapshots` | Write-once price snapshot at order creation |
| `invoices_pp` | Invoices per order (one active invoice per order) |
| `payments_pp` | Payment submissions per invoice |
| `receipts_pp` | Auto-generated receipts on payment confirmation (1 per payment) |
| `refunds_pp` | Refund requests per confirmed payment (1 per payment, full amount only) |

### Key Constraints

- `order_commercial_snapshots.order_id` is PRIMARY KEY — enforces write-once
- `receipts_pp.payment_id UNIQUE` — 1 receipt per payment
- `refunds_pp.payment_id UNIQUE` — 1 refund per confirmed payment
- All tables have `created_at`, most have `updated_at`
- FK chain: `programs → offerings → packages → package_prices`, `clients_pp → orders_pp → invoices_pp → payments_pp → receipts_pp/refunds_pp`

---

## 3. ID Generator Extensions

Added to `src/modules/id/id.generator.js`:

| DOCTYPE | Format | Bucket |
|---|---|---|
| `CLIENT` | `KL-{seq}` | LEAD_TYPES (permanent, no year reset) |
| `PAYMENT` | `PAY-{module}-{yy}-{seq}` | GLOBAL_TYPES |
| `REFUND_PP` | `REF-{module}-{yy}-{seq}` | GLOBAL_TYPES |

---

## 4. Module Architecture

### 4.1 Catalog Module

Read-only API over seeded catalog data. No create/update endpoints (catalog managed via DB directly in Phase 2A).

**Endpoints:**
- `GET /api/pp/catalog/programs` — list all programs
- `GET /api/pp/catalog/programs/:id`
- `GET /api/pp/catalog/offerings?programId=`
- `GET /api/pp/catalog/offerings/:id`
- `GET /api/pp/catalog/packages?offeringId=`
- `GET /api/pp/catalog/packages/:id` — includes current price

### 4.2 Lead Module

**Endpoints:**
- `GET /api/pp/leads` — list with optional `?status=` filter
- `GET /api/pp/leads/:id`
- `POST /api/pp/leads` — creates with `LP-xxxx` ID (permanent)
- `PATCH /api/pp/leads/:id` — update contact/stage details
- `POST /api/pp/leads/:id/convert` — validates status, records audit

**Status values:** `new`, `contacted`, `qualified`, `converted`, `closed_lost`

### 4.3 Client Module

**Endpoints:**
- `GET /api/pp/clients` — list
- `GET /api/pp/clients/:id`
- `POST /api/pp/clients` — creates with `KL-xxxx` ID
- `PATCH /api/pp/clients/:id`

### 4.4 Order Module

**Endpoints:**
- `GET /api/pp/orders` — list
- `GET /api/pp/orders/:id` — includes commercial snapshot
- `POST /api/pp/orders` — creates order + snapshot + urgency flag in one transaction
- `POST /api/pp/orders/:id/status` — validated status transition
- `GET /api/pp/orders/:id/readiness` — derived program readiness

**Status machine:** `DRAFT → PENDING_PAYMENT → ACTIVE → COMPLETED | CANCELLED`

**Order ID format:** `PP-YY-xxxx`

**Commercial snapshot:** written once at creation from resolved package price; includes `base_amount`, `final_amount`, `discount_amount`, `unit_price`, `sessions_total`.

### 4.5 Deadline Engine — `src/modules/order/deadline.engine.js`

```
classifyUrgency(startDate, referenceDate?) → 'NORMAL' | 'URGENT'
daysUntilStart(startDate, referenceDate?) → number | null
```

- Threshold: `process.env.PP_URGENT_THRESHOLD_DAYS` (default `1`)
- Date comparison: midnight UTC, date-only (strips time component)
- `diffDays <= threshold` → URGENT; `diffDays > threshold` → NORMAL
- `null` startDate → NORMAL (no date = no urgency)
- Past date → URGENT (negative diffDays ≤ 1)

### 4.6 Invoice Module

**Endpoints:**
- `GET /api/pp/invoices` — list
- `GET /api/pp/invoices/:id`
- `POST /api/pp/invoices` — issue invoice (guards: order status, no active duplicate)
- `POST /api/pp/invoices/:id/send` — DRAFT → SENT
- `POST /api/pp/invoices/:id/cancel` — DRAFT → CANCELLED
- `POST /api/pp/invoices/overdue-check` — marks all past-due SENT invoices OVERDUE

**Invoice ID format:** `INV-PP-YY-xxxx`

**Duplicate guard:** rejects new invoice if an active (non-CANCELLED) invoice exists for the same order.

### 4.7 Payment Module

**Endpoints:**
- `POST /api/pp/payments` — submit payment (PENDING status)
- `POST /api/pp/payments/:id/confirm` — confirm with Gate 03A + Gate 03B
- `POST /api/pp/payments/:id/reject`
- `GET /api/pp/payments/:id`
- `GET /api/pp/invoices/:invoiceId/payments`

**Gate 03A (amount):** `|payment.amount - invoice.final_amount| > PAYMENT_TOLERANCE` → 422 `PAYMENT_AMOUNT_MISMATCH`. Default tolerance = 0 (exact match required).

**Gate 03B (duplicate):** On `submitPayment`, checks for existing confirmed payment BEFORE the invoice status check, ensuring 409 CONFLICT is returned even when invoice is already PAID.

**On confirmation (auto-cascade):**
1. Payment status → CONFIRMED
2. Invoice status → PAID (`markInvoicePaid`)
3. Order status → ACTIVE (if `PENDING_PAYMENT`)
4. Receipt auto-generated (`RCP-PP-YY-xxxx`)

### 4.8 Receipt Module

Auto-generated on payment confirmation. Not user-created.

**Endpoints:**
- `GET /api/pp/receipts/:id`
- `GET /api/pp/orders/:orderId/receipts`
- `GET /api/pp/payments/:paymentId/receipt`

**Receipt ID format:** `RCP-PP-YY-xxxx`

### 4.9 Refund Module

**Endpoints:**
- `POST /api/pp/refunds` — request refund (validated: confirmed payment, no existing refund)
- `POST /api/pp/refunds/:id/process` — PENDING → PROCESSED
- `POST /api/pp/refunds/:id/reject` — PENDING → REJECTED
- `GET /api/pp/refunds/:id`
- `GET /api/pp/orders/:orderId/refunds`

**Refund ID format:** `REF-PP-YY-xxxx`

**Business rules:**
- Only confirmed payments can be refunded
- 1 refund per payment (unique constraint + service-level check)
- Full amount only: refund.amount = payment.amount

---

## 5. Program Readiness

Derived state — never stored. Computed on demand:

```sql
SELECT o.status = 'ACTIVE' AND i.status = 'PAID'
FROM orders_pp o
JOIN invoices_pp i ON i.order_id = o.id
WHERE o.id = $1 AND i.status != 'CANCELLED'
```

Exposed at `GET /api/pp/orders/:id/readiness` → `{ programReady: boolean }`.

---

## 6. Error Types

| Type | HTTP | Used for |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Missing/invalid input |
| `NOT_FOUND` | 404 | Entity not found |
| `CONFLICT` | 409 | Duplicate (duplicate refund, duplicate confirmed payment) |
| `BUSINESS_RULE_VIOLATION` | 422 | Gate violations, invalid status transitions |

`BUSINESS_RULE_VIOLATION` carries rule code at `error.details.rule` (not `error.rule`).

---

## 7. Test Coverage

### Phase 2A Tests (55 total, all passing)

| File | Tests | Coverage |
|---|---|---|
| `tests/pp/deadline.test.js` | 13 | NORMAL/URGENT classification, injectable reference date, daysUntilStart |
| `tests/pp/lead.test.js` | 7 | CRUD, ID format, convert, audit |
| `tests/pp/client.test.js` | 5 | CRUD, ID format, duplicate email |
| `tests/pp/order.test.js` | 9 | Create, snapshot, urgency, status machine, audit |
| `tests/pp/invoice.test.js` | 7 | Issue, send, cancel, duplicate guard, audit |
| `tests/pp/payment.test.js` | 9 | Submit, confirm, Gate 03A, Gate 03B, order activation, readiness |
| `tests/pp/refund.test.js` | 5 | Create, duplicate guard, process, reject, audit |

### Full Suite

**139/139 tests passing** (84 foundation + 55 Phase 2A)

---

## 8. Acceptance Gate Checklist

- [x] Migration `002_create_commercial_core.sql` creates all 12 tables
- [x] DOWN section cleans up all 12 tables in FK-safe order
- [x] `KL-xxxx` client IDs are permanent (no year reset)
- [x] `PAY-PP-YY-xxxx` and `REF-PP-YY-xxxx` ID formats work via nextId
- [x] Order creation produces commercial snapshot in same transaction
- [x] Urgency flag written at order creation; H-1 and same-day = URGENT; H-2+ = NORMAL
- [x] Invoice duplicate guard: rejects 2nd active invoice for same order (409)
- [x] Gate 03A: under/over payment rejected at confirmation (422 PAYMENT_AMOUNT_MISMATCH)
- [x] Gate 03B: duplicate confirmed payment rejected at submission (409 CONFLICT)
- [x] Payment confirmation auto-cascades: invoice PAID, order ACTIVE, receipt created
- [x] Program readiness is derived state (not stored), correctly gated on ACTIVE + PAID
- [x] Refund: 1 per confirmed payment, full amount only
- [x] Audit events recorded for all major state transitions
- [x] All Phase 2A tests pass (55/55)
- [x] No regression in foundation tests (84/84)
- [x] No legacy data migration
- [x] No REACT-APP/src/data/ files modified
- [x] No B2B Event or B2B Management code added

---

## 9. Known Limitations / Future Work

- **Payment IDs in DB**: `payments_pp` uses UUID internally (from `uuidv4()` in repository). The `PAY-PP-YY-xxxx` ID format exists in the ID generator but is not yet wired to payment creation. This is acceptable for Phase 2A — the PAY format can be implemented in a follow-up pass.
- **Catalog is seeded-only**: No admin API for creating/updating programs, offerings, or packages. Planned for Phase 2C or admin tooling phase.
- **Overdue check**: `POST /api/pp/invoices/overdue-check` is a manual trigger. A scheduled job (cron) to run this nightly is planned for Phase 3.
- **Phase 2B** (participant/session tracking, assessment module) not yet implemented.
