# EFM PP Phase 2 — Final Implementation Report v1.0

**Date:** 2026-09-30  
**Branch:** `claude/add-claude-md-instructions-7iqjvo`  
**Scope:** Phase 2A (Commercial Core) + Phase 2B (Participants & Assessments)  
**Status:** ✅ COMPLETE — All bugs fixed, all business rules verified, live DB verification passed

---

## 1. Scope Summary

Phase 2 implements the full PP (Private Program) backend covering:

- **Phase 2A**: Catalog, Leads, Clients, Orders, Invoices, Payments, Receipts, Refunds
- **Phase 2B**: Participants, Assessments

All modules are PP-scoped with no B2B dependencies (D-12).

---

## 2. Database Migrations

### Migration 001 — Foundation (Phase 1)
- `id_sequences` — UNIQUE(doc_type, module, year) sequence table with atomic upsert
- `audit_events` — append-only, UUID PK
- `pic_master`, `pic_contexts`

### Migration 002 — Commercial Core (Phase 2A)
- `programs`, `offerings`, `packages`, `package_prices` — catalog hierarchy
- `leads_pp` — LP-xxxx format (permanent, no year reset)
- `clients_pp` — KL-xxxx format (permanent)
- `orders_pp` — PP-YY-xxxx format, urgency_flag, status FSM
- `order_commercial_snapshots` — write-once at creation, PK = order_id
- `invoices_pp` — INV-PP-YY-xxxx, UNIQUE(order_id)
- `payments_pp` — UUID PK (per Decision Lock §16.3)
- `receipts_pp` — RCP-PP-YY-xxxx, UNIQUE(payment_id)
- `refunds_pp` — REF-PP-YY-xxxx, UNIQUE(payment_id) — enforces 1-per-payment

### Migration 003 — Participants & Assessments (Phase 2B)
- `participants_pp` — PTR-PP-YY-xxxx, UNIQUE(order_id) — enforces 1-per-order (D-08)
- `assessments_pp` — SCR-YY-xxxx (module-independent GLOBAL bucket), FK→participants_pp.id

Migration direction: 001→002→003 (UP), 003→002→001 (DOWN). FK dependencies respected throughout.

---

## 3. Business Rule Verification

| Rule | Description | Status | Location |
|------|-------------|--------|----------|
| D-01 | PP Full Payment Only — no DP/installment/partial | ✅ | `payment.service.js` Gate 03A: exact amount match |
| D-02 | Invoice PAID is mandatory gate for Program Readiness | ✅ | `order.service.js:isOrderProgramReady` |
| D-03 | Normal payment deadline H-3, configurable via env | ✅ | `deadline.engine.js`: `PP_URGENT_THRESHOLD_DAYS` |
| D-04 | URGENT = H-1 or <24h — no auto-reject, admin handling | ✅ | `deadline.engine.js:classifyUrgency`; urgency_flag set, no rejection |
| D-05 | Same-day order technically allowed, classified URGENT | ✅ | `classifyUrgency`: diffDays ≤ threshold → URGENT |
| D-06 | OVERDUE — SENT→OVERDUE if due_date passed, no auto-cancel | ✅ | `invoice.service.js:runOverdueCheck` — only transitions to OVERDUE |
| D-07 | Refund — append-only, full refund only, 1 per confirmed payment | ✅ | `refund.service.js`: UNIQUE on payment_id, amount=payment.amount |
| D-08 | ONE participant per PP order, DB enforced | ✅ | `participants_pp.order_id UNIQUE`; app-level guard in participant.service.js |
| D-09 | Program Readiness = Order ACTIVE AND Invoice PAID — derived, never stored | ✅ | `order.service.js:isOrderProgramReady` — computed on demand |
| D-10 | Assignment/session/attendance full implementation is next scope | ✅ | Not implemented |
| D-11 | No PARTIALLY_PAID for PP | ✅ | Payment statuses: PENDING, CONFIRMED, REJECTED only |
| D-12 | PP code remains PP-scoped, no B2B dependency | ✅ | No B2B imports in any PP module |
| OPEN-2B-04 | Order ACTIVE ≠ Program Readiness | ✅ | Readiness requires ACTIVE + PAID invoice |

---

## 4. Bugs Found and Fixed

### BUG-1 (CRITICAL): Dynamic import in `isOrderProgramReady`
- **File**: `src/modules/order/order.service.js`
- **Issue**: Used `await import('../../db/index.js').then(m => m.query(...))` — dynamic import inside a synchronous-style function. This is semantically wrong (dynamic imports cache module by URL, not harmful here, but architecturally incorrect and harder to trace in errors).
- **Fix**: Added `query` to the static import at the top: `import { withTransaction, query } from '../../db/index.js'`; replaced dynamic call with direct `query()` call.

### BUG-2 (MEDIUM): Commercial snapshot stored FK IDs instead of resolved names
- **File**: `src/modules/order/order.service.js:createOrder`
- **Issue**: `offeringName: pkg.offering_id` stored the FK string (e.g. `"OFF-TEST-01"`), not the offering name. `programName: ''` was always empty string. The snapshot is a write-once historical record — it must store names so the record remains meaningful if catalog entities are later renamed.
- **Fix**: Before the transaction, fetch `offering = await getOffering(pkg.offering_id)` and `program = await getProgram(offering.program_id)`; use `offering.name` and `program.name` in the snapshot.

### BUG-3 (CRITICAL): `transitionOrderStatus` called outside `withTransaction` in `confirmPayment`
- **File**: `src/modules/payment/payment.service.js:confirmPayment`
- **Issue**: The order status transition (PENDING_PAYMENT → ACTIVE) was called outside the main `withTransaction` block, wrapped in a silent `try/catch`. If order activation failed after the invoice was marked PAID and the receipt was created, the system would be in an inconsistent state: invoice=PAID, receipt=created, but order=PENDING_PAYMENT. This violated atomicity.
- **Fix**: 
  1. Refactored `transitionOrderStatus` in `order.service.js` to accept an optional `txClient` parameter. When provided, it runs within that transaction; otherwise it opens its own (backwards-compatible).
  2. Made `transitionOrderStatus` idempotent: if the order is already in the target state, it returns gracefully without error. This handles the case where an order was manually activated externally.
  3. The order read is now inside the transaction (using `findOrderById(id, client)`) — prevents race conditions.
  4. In `confirmPayment`, replaced the try/catch with a direct call passing `client`: `await transitionOrderStatus(invoice.order_id, 'ACTIVE', requestId, client)`. Now payment confirmation, invoice payment, order activation, and receipt creation are all atomic.

---

## 5. ID Format Registry

| Entity | Format | Scope | Year Reset |
|--------|--------|-------|------------|
| Lead (PP) | `LP-xxxx` | Permanent | Never |
| Client | `KL-xxxx` | Permanent | Never |
| Order | `PP-YY-xxxx` | PP | Annual |
| Invoice | `INV-PP-YY-xxxx` | PP | Annual |
| Payment | UUID | Global | N/A |
| Receipt | `RCP-PP-YY-xxxx` | PP | Annual |
| Refund | `REF-PP-YY-xxxx` | PP | Annual |
| Participant | `PTR-PP-YY-xxxx` | PP | Annual |
| Assessment | `SCR-YY-xxxx` | GLOBAL | Annual |

Assessment uses `DOCTYPE.ASSESSMENT, MODULE.GLOBAL` — module-independent bucket to prevent ID collisions if assessments are ever shared across modules.

---

## 6. API Endpoints

### Phase 2A — Commercial Core (`/api/pp/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/programs` | List programs |
| GET | `/offerings` | List offerings |
| GET | `/packages` | List packages |
| GET | `/leads` | List leads |
| POST | `/leads` | Create lead |
| GET | `/leads/:id` | Get lead |
| PATCH | `/leads/:id` | Update lead |
| GET | `/clients` | List clients |
| POST | `/clients` | Create client |
| GET | `/clients/:id` | Get client |
| GET | `/orders` | List orders |
| POST | `/orders` | Create order |
| GET | `/orders/:id` | Get order with snapshot |
| POST | `/orders/:id/status` | Transition order status |
| GET | `/orders/:id/readiness` | Check Program Readiness (D-09) |
| GET | `/invoices` | List invoices |
| POST | `/invoices` | Issue invoice |
| GET | `/invoices/:id` | Get invoice |
| POST | `/invoices/:id/send` | Send invoice (DRAFT→SENT) |
| POST | `/invoices/:id/cancel` | Cancel invoice |
| POST | `/invoices/overdue` | Run overdue check |
| GET | `/payments/:id` | Get payment |
| GET | `/invoices/:invoiceId/payments` | List payments by invoice |
| POST | `/payments` | Submit payment |
| POST | `/payments/:id/confirm` | Confirm payment (→ ACTIVE order, receipt) |
| POST | `/payments/:id/reject` | Reject payment |
| GET | `/receipts/:id` | Get receipt |
| GET | `/orders/:orderId/receipts` | List receipts by order |
| GET | `/refunds/:id` | Get refund |
| GET | `/orders/:orderId/refunds` | List refunds by order |
| POST | `/refunds` | Request refund |
| POST | `/refunds/:id/process` | Process refund |
| POST | `/refunds/:id/reject` | Reject refund |

### Phase 2B — Participants & Assessments (`/api/pp/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/participants/:id` | Get participant |
| GET | `/orders/:orderId/participant` | Get participant by order |
| GET | `/clients/:clientId/participants` | List participants by client |
| POST | `/participants` | Create participant (order_id derived) |
| PATCH | `/participants/:id` | Update participant |
| GET | `/assessments/:id` | Get assessment |
| GET | `/participants/:participantId/assessments` | List assessments by participant |
| GET | `/orders/:orderId/assessments` | List assessments by order |
| POST | `/assessments` | Create assessment (order_id derived from participant) |
| PATCH | `/assessments/:id` | Update assessment (status guard: ARCHIVED→422) |

### Foundation (`/api/v1/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/audit/entity/:entityType/:entityId` | Get audit trail for entity |
| GET/POST | `/pics` | PIC management |
| GET | `/health` | Health check with DB connectivity |

---

## 7. Transaction Boundaries

All write operations use `withTransaction`. Key patterns:

- **Single-entity creates**: `nextId + insert + recordAuditEvent` — all in one TX
- **Payment confirmation**: `updatePaymentStatus + recordAuditEvent + markInvoicePaid + transitionOrderStatus + createReceipt` — all in ONE TX (post BUG-3 fix)
- **Functions with optional txClient**: `markInvoicePaid`, `createReceipt`, `transitionOrderStatus` — can be embedded in a parent TX or run standalone
- **Immutable entities**: `order_commercial_snapshots` (write-once at order creation), `receipts_pp` (write-once at payment confirmation), `refunds_pp` (append-only, 1-per-payment)

---

## 8. Security Audit

- **SQL injection**: All queries use parameterized form (`$1, $2, ...`). No string interpolation in SQL. ✅
- **Error leakage**: `AppError.toJSON()` exposes type, message, and details (rule name). No stack traces. ✅
- **Input validation**: All service layer functions validate inputs before DB calls. ✅
- **Immutability guards**: Commercial snapshot, receipts, and refunds are write-once. ✅
- **Business rule enforcement**: Duplicate payment guard (Gate 03B) checked before status validation to ensure 409 beats 422. ✅

---

## 9. Test Coverage — Live DB Verified

**Total: 18 test suites, 161 tests — all PASS on PostgreSQL 16**

### Unit tests
- `tests/pp/deadline.test.js` — 13 tests: NORMAL/URGENT classification, same-day, past, no startDate, configurable threshold ✅
- `tests/foundation/errors.test.js` — AppError, validationError, notFound, conflict, businessRuleViolation ✅
- `tests/foundation/config.test.js` — env config ✅
- `tests/foundation/correlationId.test.js` — middleware ✅
- `tests/foundation/agreement.guard.test.js` — business rule guard ✅

### Integration tests (verified live against PostgreSQL 16)
- `tests/foundation/regression.test.js` — foundational regression ✅
- `tests/foundation/id.test.js` — ID generation, sequence, year reset ✅
- `tests/foundation/db.test.js` — DB connectivity, transaction helper ✅
- `tests/foundation/pic.test.js` — PIC master and contexts ✅
- `tests/foundation/audit.test.js` — audit event recording and retrieval ✅
- `tests/pp/lead.test.js` — lead lifecycle ✅
- `tests/pp/client.test.js` — client creation and deduplication ✅
- `tests/pp/order.test.js` — order creation, snapshot with resolved names, urgency flag, status transitions ✅
- `tests/pp/invoice.test.js` — invoice issue, send, cancel, duplicate guard, DRAFT order allowed ✅
- `tests/pp/payment.test.js` — Gate 03A/03B, confirm→ACTIVE+receipt (atomic), duplicate confirmation 409 ✅
- `tests/pp/refund.test.js` — refund lifecycle, 1-per-payment guard ✅
- `tests/pp/participant.test.js` — create, 1-per-order guard (UNIQUE DB + app), get by order/ID, update, audit ✅
- `tests/pp/assessment.test.js` — create (SCR-YY-xxxx, GLOBAL bucket), order_id derived from participant, archived guard (422), audit ✅

### BUG-4 (found during live DB verification)
- **File**: `src/modules/assessment/assessment.repository.js`
- **Issue**: `assessmentDate ?? null` — when test/caller omits `assessmentDate`, the explicit NULL in the INSERT overrides `DEFAULT CURRENT_DATE` on the column. PostgreSQL applies DEFAULT only when a column is omitted, not when NULL is passed explicitly.
- **Fix**: Changed to `assessmentDate ?? new Date().toISOString().split('T')[0]` — defaults to today's date when caller provides no date.

---

## 10. Files Modified / Created

### Phase 2A bug fixes (this hardening pass)
- `src/modules/order/order.service.js` — BUG-1 (static import), BUG-2 (snapshot names), BUG-3 (transitionOrderStatus refactor)
- `src/modules/payment/payment.service.js` — BUG-3 (remove silent try/catch, pass txClient)

### Phase 2B implementation (previous commit)
- `src/db/migrations/003_create_participants_assessments.sql`
- `src/modules/id/id.generator.js` — added PARTICIPANT doctype
- `src/modules/audit/audit.service.js` — added PARTICIPANT_CREATED, PARTICIPANT_UPDATED, ASSESSMENT_CREATED, ASSESSMENT_UPDATED, ASSESSMENT_COMPLETED events
- `src/modules/participant/participant.repository.js`
- `src/modules/participant/participant.service.js`
- `src/modules/participant/participant.router.js`
- `src/modules/assessment/assessment.repository.js`
- `src/modules/assessment/assessment.service.js`
- `src/modules/assessment/assessment.router.js`
- `src/app.js` — registered participant and assessment routers
- `tests/helpers/db.js` — added assessments_pp, participants_pp to TRUNCATE list
- `tests/pp/participant.test.js`
- `tests/pp/assessment.test.js`
- `tests/pp/invoice.test.js` — TEST-1 weak assertion fixed

---

## 11. Known Limitations (Not Bugs)

- **D-10 Assignment/Session/Attendance**: Intentionally not implemented. Next scope.
- **Payment UUID**: Payments use UUID PK (not nextId format) per Decision Lock §16.3. This is intentional and accepted.
- **`runOverdueCheck`**: Requires a scheduler/cron to be called periodically. Not wired to any scheduler in Phase 2 scope.

## 12. Live Database Verification Results

**PostgreSQL version:** 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

**Migration result:**
- Clean DB: 001→002→003 applied successfully (19 tables created)
- All FKs, UNIQUE constraints, CHECK constraints, indexes verified
- Repeatability: DOWN (003→002→001) then UP (001→002→003) — all 161 tests pass after re-migration

**Test result:**
- 18 test suites, 161 tests — all PASS
- Run time: ~11s

**E2E PP flow (covered by integration test suite):**
- Catalog → Lead → Client → Order (with urgency) → Invoice (SENT) → Payment submit → Confirm payment → Invoice PAID + Order ACTIVE + Receipt auto-generated (atomic TX) → Program Readiness TRUE → Participant (1-per-order) → Assessment (SCR format, date default) → Status transitions → Refund (1-per-payment) → Audit trail ✅

**Negative scenarios (verified by test suite):**
- Underpayment (Gate 03A) → 422 ✅
- Duplicate payment submit when confirmed (Gate 03B) → 409 ✅
- Duplicate participant for same order → 409 ✅
- Invalid order status transition → 422 ✅
- Update on ARCHIVED assessment → 422 ✅
- Invoice in wrong status for payment → 422 ✅
- Assessment without date — defaults to CURRENT_DATE ✅

**Final commit after live verification:** see git log for SHA starting from this report update.
