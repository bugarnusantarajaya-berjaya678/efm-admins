# EFM PP — PHASE 2 CROSS-BATCH ARCHITECTURE RECONCILIATION v1.0

**Status:** ARCHITECTURE LOCK — ANALYSIS ONLY  
**Date:** 2026-09-29  
**Branch:** `claude/add-claude-md-instructions-7iqjvo`  
**Constraint:** NO CODE WRITTEN — documentation only  
**Phase:** 2 — Cross-Batch Reconciliation (2A + 2B)

---

## 1. PURPOSE

This document reconciles the architecture across Phase 2 Batch 2A (Commercial Core) and Batch 2B (Participant & Assessment) to identify:

1. Cross-batch dependencies that impose a coding sequence constraint
2. Conflicts between Batch 2A and Batch 2B specifications
3. Open decisions whose resolution affects BOTH batches
4. Integration points between the Phase 1 Foundation and Phase 2 entities
5. Gaps between the current Phase 1 implementation and Phase 2 requirements

---

## 2. CROSS-BATCH DEPENDENCY CHAIN

The following dependency chain governs implementation order within Phase 2:

```
Phase 1 Foundation (COMPLETE — commit b9c7c5d)
    │
    ▼
[Batch 2A must precede Batch 2B]
    │
    ├── programs / offerings / packages / package_prices
    │       (no dependencies — can start immediately)
    │
    ├── leads
    │       (no dependencies — can start immediately)
    │
    ├── clients
    │       (depends on: leads)
    │
    ├── orders + order_commercial_snapshots
    │       (depends on: leads, clients, packages, package_prices)
    │
    ├── invoices
    │       (depends on: orders)
    │
    ├── payments
    │       (depends on: invoices)
    │
    ├── receipts
    │       (depends on: payments)
    │
    ▼
[Batch 2B: start after orders + clients exist]
    │
    ├── order_participants
    │       (depends on: orders, clients)
    │
    ├── participant_history
    │       (depends on: order_participants)
    │
    └── assessments
            (depends on: clients, leads; optionally orders)
```

**Minimum Batch 2A deliverable before Batch 2B can start:**
- `orders` table and Order service must exist (Participant belongs to Order)
- `clients` table must exist (Participant may reference Client)
- `leads` table must exist (Assessment references Lead)

Assessment can begin implementation concurrently with Participant once `clients` and `leads` are ready, since `assessments.order_id` is nullable.

---

## 3. INTER-ENTITY FIELD DEPENDENCIES

### 3.1 Assessment → Order Link (Critical Fix from Phase 0/1)

**The problem (confirmed Phase 0 + Phase 1 Reconciliation):**  
The legacy `getAssessmentByOrderId()` ALWAYS returns null because no legacy assessment record had an `orderId` field. This is a confirmed data model bug.

**The fix (locked in Batch 2B schema):**  
The `assessments` table includes `order_id TEXT FK → orders(id)` as a NULLABLE column. When an assessment is conducted for a known Order context, `order_id` is populated. When an assessment is done pre-Order (screening stage), `order_id` is null.

**Cross-batch impact:**  
- Batch 2A Order service does NOT need to know about assessments
- Batch 2B Assessment service DOES need to know about Orders (for the FK)
- The API endpoint `GET /api/pp/clients/:clientId/assessments?orderId=:orderId` is in Batch 2B

**OPEN-2B-04 (Assessment as Pre-Order Gate) would affect Batch 2A if Option A is chosen:**  
If assessment is a hard gate on Order creation, Batch 2A's `order.service.js` must call the Assessment repository to verify an assessment exists for the client. This creates a dependency from Batch 2A code on Batch 2B data. The owner must resolve this before Batch 2A Order service is finalized.

---

### 3.2 Participant → Client Identity

**Batch 2A:** `clients` table stores the payer/registrant identity (Client)  
**Batch 2B:** `order_participants` table stores the training subject identity (Participant)

**For Solo programs:** Both records will often have the same personal data. The service layer for creating a Solo Order should optionally copy Client fields to the Participant record at creation time — but they remain separate records.

**For Couple/Group programs:** The Client is the payer only. Participants may have different identities from the Client.

**Cross-batch constraint:** The `client_id` FK in `order_participants` is NULLABLE — a Participant may or may not be a pre-registered Client. This allows group participants to be added without requiring full Client registration for each group member.

---

### 3.3 Commercial Snapshot → Assessment Historical Comparison

**Batch 2A:** `order_commercial_snapshots` stores the Package and price at Order creation  
**Batch 2B:** `assessments` may be linked to an Order via `order_id`

**For post-test assessments:** An Assessment conducted at Order completion needs to reference the same Order that the pre-test was linked to. The `prev_assessment_id` chain in `assessments` enables tracking: pre-test Assessment → linked to Order → post-test Assessment → same Order.

**No schema conflict** — this is additive information. The `order_id` FK in `assessments` resolves this.

---

## 4. CONFLICTS BETWEEN BATCH 2A AND BATCH 2B

| Conflict ID | Area | Batch 2A Position | Batch 2B Position | Resolution |
|---|---|---|---|---|
| XBATCH-C1 | Assessment as Order Gate | Gate 02 (Order) does not currently require a prior Assessment | Gate 07 (Participant) and OPEN-2B-04 suggest Assessment may be a pre-condition | OPEN OWNER DECISION (OPEN-2B-04) — must resolve before Batch 2A Order service is coded |
| XBATCH-C2 | Solo Participant Identity | Client is the payer in Batch 2A | Participant is the training subject in Batch 2B | RESOLVED: Both records exist; Client → Participant link via `client_id` FK |
| XBATCH-C3 | Assessment `client_id` Requirement | Client must exist (Batch 2A) before Assessment can be created | Assessment is described as independent (can exist pre-Order) | RESOLVED: `assessments.client_id` is required (not nullable); Client registration must precede Assessment. Walk-in assessments require creating a Client record first. |
| XBATCH-C4 | Participant ID format choice | Does not affect Batch 2A | OPEN-2B-02 is unresolved | OPEN OWNER DECISION — does not block Batch 2A but must resolve before Batch 2B starts |

---

## 5. PHASE 1 → PHASE 2 GAP ANALYSIS

### 5.1 What Phase 1 Provides to Phase 2

| Phase 1 Deliverable | Phase 2 Consumption | Status |
|---|---|---|
| `id_sequences` table | Used by `nextId()` for all Phase 2 ID generation | ✓ Available |
| `audit_events` table | Receives audit events from all Phase 2 state transitions | ✓ Available |
| `pic_master` table | Referenced by `orders.assigned_pic`, `assessments.assessed_by` | ✓ Available |
| `pic_contexts` table | Module-context lookup for PIC assignment | ✓ Available |
| `nextId(ORDER, PP)` → `PP-YY-xxxx` | Order ID generation | ✓ Available |
| `nextId(INVOICE, PP)` → `INV-PP-YY-xxxx` | Invoice ID generation | ✓ Available |
| `nextId(RECEIPT, PP)` → `RCP-PP-YY-xxxx` | Receipt ID generation | ✓ Available |
| `nextId(LEAD_PP, PP)` → `LP-xxxx` | Lead ID generation | ✓ Available |
| `nextId(ASSESSMENT, PP)` → `SCR-YY-xxxx` | Assessment ID generation (GLOBAL bucket) | ✓ Available |
| `nextId(HNS, PP)` → `HNA-PP-YY-xxxx` | H&S ID generation (Phase 3, future use) | ✓ Available |
| `nextId(ASSIGNMENT, PP)` → `ASG-PP-YY-xxxx` | Assignment ID generation (Phase 5, future use) | ✓ Available |
| `nextId(SESSION, PP)` → `SES-PP-YY-xxxx` | Session ID generation (Phase 5, future use) | ✓ Available |
| `nextId(ATTENDANCE, PP)` → `ATT-PP-YY-xxxx` | Attendance ID generation (Phase 5, future use) | ✓ Available |
| `errors.js` (7 categories) | All Phase 2 service validation | ✓ Available |
| `baseRepository.js` | All Phase 2 repositories extend this | ✓ Available |
| `baseService.js` | All Phase 2 services extend this | ✓ Available |
| `audit.service.js` | Phase 2 state transitions emit audit events | ✓ Available |
| `correlationId` middleware | All Phase 2 routes carry correlation ID | ✓ Available |
| `errorHandler` middleware | All Phase 2 routes use this | ✓ Available |
| `withTransaction` / `query` | All Phase 2 repositories use these | ✓ Available |
| Migration mechanism (`migrate.js`) | Phase 2 adds migration `002_...sql` | ✓ Available |
| `agreement.guard.js` | Used in Phase 3; not needed in Phase 2 | Available for Phase 3 |

### 5.2 What Phase 1 Does NOT Provide (Phase 2 Must Add)

| Gap | What Phase 2 Must Add | Batch |
|---|---|---|
| No `programs`, `offerings`, `packages`, `package_prices` tables | Create in migration 002 | 2A |
| No `leads` table | Create in migration 002 | 2A |
| No `clients` table | Create in migration 002 | 2A |
| No `orders` table | Create in migration 002 | 2A |
| No `order_commercial_snapshots` table | Create in migration 002 | 2A |
| No `invoices` table | Create in migration 002 | 2A |
| No `payments` table | Create in migration 002 | 2A |
| No `receipts` table | Create in migration 002 | 2A |
| No `order_participants` table | Create in migration 003 (or 002) | 2B |
| No `participant_history` table | Create in migration 003 (or 002) | 2B |
| No `assessments` table | Create in migration 003 (or 002) | 2B |
| No PAYMENT doc type in `id.generator.js` | OPEN-2A-02 decision required | 2A |
| No CLIENT doc type in `id.generator.js` | OPEN-2A-01 decision required | 2A |
| No PARTICIPANT doc type in `id.generator.js` | OPEN-2B-02 decision required | 2B |
| No catalog module | Add `backend/src/modules/catalog/` | 2A |
| No lead module | Add `backend/src/modules/leads/` | 2A |
| No client module | Add `backend/src/modules/clients/` | 2A |
| No order module | Add `backend/src/modules/orders/` | 2A |
| No invoice module | Add `backend/src/modules/invoices/` | 2A |
| No payment module | Add `backend/src/modules/payments/` | 2A |
| No receipt module | Add `backend/src/modules/receipts/` | 2A |
| No participant module | Add `backend/src/modules/participants/` | 2B |
| No assessment module | Add `backend/src/modules/assessments/` | 2B |

### 5.3 Phase 1 Items That Were ALREADY FIXED and Benefit Phase 2

| Phase 1 Fix | Phase 2 Benefit |
|---|---|
| Finding #1: `findAllPics` JOIN fix | Phase 2 Order/Assignment services that look up PIC by module will get correct data |
| Finding #2: `withTransaction` error preservation | Phase 2 complex multi-table transactions (Order + snapshot) will correctly propagate errors |
| Finding #3: `GLOBAL_TYPES` for ASSESSMENT | Assessment IDs (`SCR-YY-xxxx`) are globally unique — Phase 2 assessments won't collide across PP/B2B/Event |
| Finding #4: `updatePic` null-clear | Phase 2 PIC management correctly handles clearing fields |
| Finding #5: env.js quote stripping | Phase 2 DB connection will correctly use env var values |
| Finding #6: updatePicDetails TOCTOU 404 | Phase 2 PIC-related services benefit from correct 404 behavior |
| Finding #7: addPicContext FK 23503→404 | Phase 2 Assignment services that create PIC contexts will return correct errors |
| Finding #8: BaseRepository ALLOWED_TABLES | Phase 2 repositories that use BaseRepository are protected against table injection |

---

## 6. MIGRATION SEQUENCE PLAN

| Migration File | Scope | Dependencies |
|---|---|---|
| `001_create_schema_foundation.sql` | Phase 1: id_sequences, audit_events, pic_master, pic_contexts, schema_migrations | None — COMPLETE |
| `002_create_commercial_core.sql` | Phase 2A: programs, offerings, packages, package_prices, leads, clients, orders, order_commercial_snapshots, invoices, payments, receipts | 001 must be applied |
| `003_create_participant_assessment.sql` | Phase 2B: order_participants, participant_history, assessments | 002 must be applied |
| `004_create_agreement_hns.sql` | Phase 3: agreements, hns (future) | 002 must be applied |
| `005_create_operations.sql` | Phase 5: assignments, sessions, attendance (future) | 002, 004 must be applied |

**Note:** Migrations 003–005 are proposed sequencing, not yet locked. Only migrations 002 and 003 are in Phase 2 scope.

---

## 7. API ROUTE REGISTRATION PLAN

Phase 2 adds the following route registrations to `backend/src/app.js`:

**Batch 2A routes to register:**
```javascript
import catalogRouter from './modules/catalog/catalog.router.js'
import leadRouter    from './modules/leads/lead.router.js'
import clientRouter  from './modules/clients/client.router.js'
import orderRouter   from './modules/orders/order.router.js'
import invoiceRouter from './modules/invoices/invoice.router.js'
import paymentRouter from './modules/payments/payment.router.js'
import receiptRouter from './modules/receipts/receipt.router.js'

app.use('/api/pp', catalogRouter)
app.use('/api/pp', leadRouter)
app.use('/api/pp', clientRouter)
app.use('/api/pp', orderRouter)
app.use('/api/pp', invoiceRouter)
app.use('/api/pp', paymentRouter)
app.use('/api/pp', receiptRouter)
```

**Batch 2B routes to register:**
```javascript
import participantRouter from './modules/participants/participant.router.js'
import assessmentRouter  from './modules/assessments/assessment.router.js'

app.use('/api/pp', participantRouter)
app.use('/api/pp', assessmentRouter)
```

---

## 8. OPEN DECISIONS CONSOLIDATED — PHASE 2 DECISION REGISTER

All open decisions from Batch 2A and Batch 2B are consolidated here for owner review.

| Decision ID | Area | What Must Be Decided | Blocking | Recommendation |
|---|---|---|---|---|
| OPEN-2A-01 | Client ID Format | `KL-xxxx` (permanent, like Lead) vs `CLT-YY-xxxx` vs UUID | Batch 2A `clients` table + id.generator.js | Use `KL-xxxx` permanent format (matches legacy; add `CLIENT` to LEAD_TYPES in id.generator.js) |
| OPEN-2A-02 | Payment ID Format | `PAY-PP-YY-xxxx` vs UUID vs SERIAL | Batch 2A `payments` table + id.generator.js | Use UUID (simplest; payment IDs are internal references only) |
| OPEN-2A-03 | Partial Payments Policy | One payment per invoice vs multiple partial payments | Gate 03/04 logic in Batch 2A | One payment per invoice (matches legacy; simpler Gate 04) |
| OPEN-2A-04 | Promo/Discount Entity | Simple lookup table vs full entity vs hardcoded | Batch 2A `order_commercial_snapshots.promo_code` logic | Simple lookup table (code → discount_value) |
| OPEN-2A-05 | Quotation Entity | Scope + timing | Batch 2A scope boundary | Defer to Phase 3 (Quotation is pre-Order, not a commercial transaction) |
| OPEN-2B-01 | Group Participant Count | Fixed per Package vs per Order vs capacity_min/max | Gate 07 in Batch 2B | Add `max_participants` to `packages` table (Option A) |
| OPEN-2B-02 | Participant ID Format | `PAX-PP-YY-xxxx` vs UUID | Batch 2B `order_participants` table | Use UUID (participants are Order-scoped, not cross-module) |
| OPEN-2B-03 | Assessment Data Structure | Strict columns vs JSONB vs hybrid | Batch 2B `assessments` table schema | Hybrid: Tanita/girth in columns, fitness test in JSONB (Option C) |
| OPEN-2B-04 | Assessment as Pre-Order Gate | Hard gate vs soft gate vs no gate | Batch 2A Gate 02 (Order creation) | **CRITICAL cross-batch dependency** — must resolve before Batch 2A Order service is coded |

---

## 9. ARCHITECTURAL INVARIANTS (MUST HOLD ACROSS BOTH BATCHES)

These invariants are derived from the highest-level locked sources and cannot be overridden by implementation convenience:

1. **Order is the commercial center.** All billing (Invoice, Payment, Receipt) flows through Order. No billing entity exists without a parent Order.

2. **Commercial snapshot is immutable.** `order_commercial_snapshots` has no UPDATE path at the service layer. Once created, the snapshot survives all catalog changes.

3. **Participant is independent of Client.** They are separate tables, separate entities, separate lifecycle concerns. Never merge or alias them.

4. **Assessment is an independent historical record.** No `updateAssessment()` method exists in the service layer. New assessments are created, never existing ones mutated.

5. **Assessment `order_id` is nullable.** A pre-Order screening assessment has no Order yet. The FK exists but must be nullable.

6. **`nextId()` is the only ID source.** No inline ID generation anywhere in Phase 2 code.

7. **All state transitions emit Audit events.** Order status change, Invoice sent/paid, Payment confirmed, Receipt created, Participant added/changed/removed, Assessment created — all emit via `audit.service.js`.

8. **Active Aging rules do not bleed into global gates.** Gates 01–04 and Gate 07 apply to all PP programs. Active Aging-specific rules are handled at the Active Aging module scope only.

9. **No B2B logic in Phase 2 PP code.** All Batch 2A and 2B entities are PP-module scoped.

10. **Legacy code is untouched.** No `REACT-APP/src/data/` files modified during Phase 2 backend work.

---

## 10. TEST REQUIREMENTS — PHASE 2

Phase 2 must add tests for all new entities, following the Phase 1 test pattern in `backend/tests/`.

**Minimum test coverage per Batch 2A entity:**
- Repository: CRUD operations, FK constraint tests
- Service: Gate validation (positive and negative cases for each gate)
- ID generation: `nextId()` called correctly for each entity type
- Audit: state transitions emit correct event_type and entity_type
- Error types: correct `AppError` type returned for each failure case

**Minimum test coverage for Batch 2B:**
- `order_participants`: slot constraint tests, guardian requirement for <17
- `participant_history`: append-only guarantee (no UPDATE)
- `assessments`: `order_id` nullable, `prev_assessment_id` chain, `nextId(ASSESSMENT, PP)` → GLOBAL bucket, no UPDATE after `completed`

**Test database:** Same `efm_test_db` on `localhost:5432` used for Phase 1 (84/84 pass). Phase 2 tests run after `002` and `003` migrations are applied to `efm_test_db`.

---

## 11. PHASE 2 IMPLEMENTATION SEQUENCE RECOMMENDATION

Given the dependencies and open decisions, the recommended implementation sequence is:

**Step 1 — Resolve critical open decisions (owner):**
- OPEN-2B-04 (Assessment as Pre-Order Gate) — blocks Order service design
- OPEN-2A-01 (Client ID) — blocks Client table creation
- OPEN-2A-03 (Partial Payments) — blocks Gate 03/04 logic

**Step 2 — Migration 002 (Batch 2A tables):**
- Create all Batch 2A tables in `002_create_commercial_core.sql`
- Validate with `npm run migrate` against `efm_test_db`

**Step 3 — Batch 2A services (in dependency order):**
1. `catalog` module (read-only for Phase 2; no write endpoints for catalog admin yet)
2. `leads` module
3. `clients` module
4. `orders` module (including `order_commercial_snapshots` in same transaction)
5. `invoices` module
6. `payments` module
7. `receipts` module

**Step 4 — Migration 003 (Batch 2B tables):**
- Create `order_participants`, `participant_history`, `assessments`

**Step 5 — Batch 2B services:**
1. `assessments` module (can run in parallel with Batch 2A step 4 once clients + leads exist)
2. `participants` module (requires orders to exist)

**Step 6 — Tests:**
- All Phase 2 tests pass against `efm_test_db`

**Step 7 — Commit and push:**
- Commit Phase 2 work to branch `claude/add-claude-md-instructions-7iqjvo`
- Do NOT merge without owner review

---

*Document created: 2026-09-29 | Mode: ANALYSIS ONLY — NO SOURCE FILES MODIFIED*
