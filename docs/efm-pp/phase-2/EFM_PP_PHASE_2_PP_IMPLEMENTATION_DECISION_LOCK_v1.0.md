# EFM PP — PHASE 2 PP IMPLEMENTATION DECISION LOCK v1.0

**Document Type:** Final Architecture Lock — Implementation Authorization  
**Status:** LOCKED FOR PHASE 2 IMPLEMENTATION  
**Date:** 2026-09-30  
**Branch:** `claude/add-claude-md-instructions-7iqjvo`  
**Constraint:** ANALYSIS ONLY — NO SOURCE FILES MODIFIED — NO DATABASE MIGRATIONS — NO API IMPLEMENTATION — NO FRONTEND CHANGES  
**Authority:** Owner Decision (final), supersedes all OPEN/PENDING items in prior Phase 2 documents for the scope defined herein  

**Predecessor Documents (all superseded by this lock for closed items):**
- `EFM_PP_OPEN_2A_03_PARTIAL_PAYMENT_DECISION_ANALYSIS_v1.1.md`
- `EFM_PP_OPEN_2A_03_PAYMENT_TO_PROGRAM_READINESS_DECISION_v1.0.md`
- `EFM_PP_OPEN_2A_03_FINAL_PAYMENT_POLICY_CONSOLIDATION_v1.0.md`
- `EFM_PP_OPEN_2A_03_FINAL_OWNER_DECISION_MATRIX_v1.0.md`
- `EFM_PP_PHASE_2_BATCH_2A_COMMERCIAL_CORE_ARCHITECTURE_LOCK_v1.0.md`
- `EFM_PP_PHASE_2_BATCH_2B_PARTICIPANT_ASSESSMENT_ARCHITECTURE_LOCK_v1.0.md`
- `EFM_PP_PHASE_2_ENTITY_RELATIONSHIP_AND_SOURCE_OF_TRUTH_MATRIX_v1.0.md`
- `EFM_PP_PHASE_2_CROSS_BATCH_ARCHITECTURE_RECONCILIATION_v1.0.md`
- `EFM_PP_PHASE_2_FINAL_OWNER_DECISION_MATRIX_v1.0.md`

**Labels used in this document:**
- `LOCKED BY CURRENT OWNER DIRECTION` — an irrevocable decision for Phase 2; no further analysis needed
- `DEFAULT FOR PHASE 2` — the adopted behavior in Phase 2; may be revisited in Phase 3+
- `DEFERRED` — explicitly out of Phase 2 scope; to be addressed in a named future phase
- `ENGINEERING VALIDATION` — a detail whose final value is determined by the engineering team during implementation, within the bounds set here

---

## 1. PP MODULE SCOPE

### 1.1 Module Identification

**LOCKED BY CURRENT OWNER DIRECTION**

Phase 2 of the PP backend covers the following business domain:

> **Private Program (PP):** One-on-one personal training delivered by an EFM-certified trainer. The client pays for a training package (4, 8, 12, or 24 sessions). Sessions are conducted at a venue agreed between client and trainer. Each order is for one participant only (Phase 2 scope; couple/group deferred).

### 1.2 Phase Boundary

**LOCKED BY CURRENT OWNER DIRECTION**

| Phase | Scope | Status |
|-------|-------|--------|
| Phase 1 | ID generator, audit log, PIC master/context, shared middleware (84/84 tests passing, commit `b9c7c5d`) | **COMPLETE** |
| **Phase 2A** | **Catalog, Leads, Clients, Orders, Invoices, Payments, Receipts, Refunds** | **AUTHORIZED** |
| **Phase 2B** | **Participants, Participant History, Assessments** | **AUTHORIZED (after 2A Orders + Clients exist)** |
| Phase 3 | Agreements, Health & Safety screening | DEFERRED |
| Phase 5 | Assignments, Sessions, Attendance | DEFERRED |

### 1.3 Module Isolation

**LOCKED BY CURRENT OWNER DIRECTION**

Phase 2 PP entities are PP-module scoped only. No B2B, Event, or cross-module entities are introduced in Phase 2. B2B extensibility is provided via architecture separation (see Section 14), not shared tables.

---

## 2. PP PAYMENT MODEL

### 2.1 Full Payment Only

**LOCKED BY CURRENT OWNER DIRECTION**

PP uses **FULL PAYMENT ONLY** for Phase 2.

- `invoice.total_amount` = the full confirmed payment amount for the order
- One confirmed payment per invoice
- One receipt per confirmed payment
- `invoice.status` transitions: `DRAFT → SENT → PAID | OVERDUE | CANCELLED`
- The status value `PARTIALLY_PAID` **does NOT exist** for PP invoices, for any reason, in any Phase 2 code path
- There is no DP (down payment), no installment schedule, no partial payment, no multi-payment workflow for PP

### 2.2 Gate 03 — Payment Validation (PP-Specific Service Layer Rules)

**LOCKED BY CURRENT OWNER DIRECTION**

These are PP-specific service-layer gates, not schema constraints. They must NOT be propagated to B2B modules.

**Gate 03A — Amount Match:**  
`payment.amount MUST equal invoice.final_amount ± configurable tolerance`  
- Default tolerance: 0 (exact match)  
- Tolerance is `ENGINEERING VALIDATION` — the exact tolerance value and its configuration mechanism are determined during implementation, within the bound that the default is zero  
- Payment is rejected if amount does not match within tolerance

**Gate 03B — Duplicate Payment Rejection:**  
A second `CONFIRMED` payment for the same invoice **must be rejected** with an explicit error  
- The service layer must check: `SELECT 1 FROM payments_pp WHERE invoice_id = $1 AND status = 'CONFIRMED'` before confirming  
- This is a service-layer guard, not a database unique constraint (though a database constraint may also be added as defense-in-depth — `ENGINEERING VALIDATION`)

### 2.3 Billing Core vs. Business Policy Separation

**LOCKED BY CURRENT OWNER DIRECTION**

- Gates 03A and 03B are **PP-specific business policy**, enforced in `payment.service.js` for the PP module only
- The Billing Core (shared infrastructure: `invoices`, `payments`, `receipts` table schemas) **must remain extensible** to accommodate B2B payment models (partial payment, installment) without schema changes to the PP tables
- Separation is enforced at the service layer: B2B will have its own `billing_b2b.service.js` with different gate logic

---

## 3. PAYMENT DEADLINE POLICY

### 3.1 Normal Deadline

**LOCKED BY CURRENT OWNER DIRECTION**

- Normal payment deadline = **H-3** (3 days before program start date)
- This is the **default** value
- The deadline is **configurable** — it is not hard-coded in business logic
- Configuration mechanism is `ENGINEERING VALIDATION` (system config table, environment variable, or per-order override — engineering decides within the constraint that it must be changeable without code redeployment for the H-3 default, and overridable per-order for URGENT cases)

### 3.2 Due Date on Invoice

**DEFAULT FOR PHASE 2**

The `invoices_pp.due_date` field stores the computed payment deadline. The computation:

```
due_date = order.start_date - configurable_deadline_days
```

Where `configurable_deadline_days` defaults to 3 (H-3).

---

## 4. URGENT ORDER POLICY

### 4.1 Urgent Classification

**LOCKED BY CURRENT OWNER DIRECTION**

An order is classified as **URGENT** when the order creation date is H-1 or less before the program start date, OR when there are fewer than 24 hours between order creation and program start.

Formal definition: `order.start_date - CURRENT_DATE <= 1` OR `order.start_date - CURRENT_TIMESTAMP < INTERVAL '24 hours'`

`ENGINEERING VALIDATION`: the exact timestamp-based condition is determined during implementation; the bound is that H-1 or <24h triggers URGENT.

### 4.2 Urgent Does NOT Auto-Reject

**LOCKED BY CURRENT OWNER DIRECTION**

An URGENT classification **does not automatically reject the order**. The system:

1. Classifies the order as URGENT (flag or derived status — `ENGINEERING VALIDATION` for storage mechanism)
2. Triggers an operational availability check by an authorized EFM admin
3. If operationally available: order proceeds to full payment → `PAID` → Program Readiness → Assignment → Session
4. If NOT operationally available: admin explicitly cancels with audit trail

An URGENT order that meets all gates (full payment + operational clearance) is a valid, deliverable order.

### 4.3 Urgent Flow (Normative)

**LOCKED BY CURRENT OWNER DIRECTION**

```
Order Created (URGENT classification)
    │
    ▼
Operational Availability Check (authorized admin)
    │
    ├── NOT available → Admin cancels → CANCELLED + Audit
    │
    └── Available →
            │
            ▼
        Full Payment (Gate 03A + 03B)
            │
            ▼
        Invoice: PAID
            │
            ▼
        Program Readiness (derived — see Section 9)
            │
            ▼
        Trainer Assignment (Phase 5)
            │
            ▼
        Session Delivery (Phase 5)
```

### 4.4 Urgent Authorization

**DEFAULT FOR PHASE 2**

- Urgent authorization is performed by: **authorized EFM admin**
- Phase 2 model: simplest possible — no multi-level approval, no separate approval table
- Every URGENT authorization action must generate an **audit trail** via `audit.service.js`
- Specific admin role check implementation is `ENGINEERING VALIDATION`

---

## 5. SAME-DAY ORDER POLICY

### 5.1 Same-Day Orders Are Technically Allowed

**LOCKED BY CURRENT OWNER DIRECTION**

A same-day order (order created on the same date as the program start date) is **technically allowed** in Phase 2, subject to:

1. Operational availability confirmed by authorized admin
2. Full payment received and confirmed (`Invoice: PAID`)
3. Program Readiness gate passed (see Section 9)

### 5.2 Same-Day = URGENT

**LOCKED BY CURRENT OWNER DIRECTION**

A same-day order is automatically classified as **URGENT**. The system does not reject it for violating the H-3 normal deadline.

**No "minimum lead time" hard rejection exists in Phase 2.**

The only grounds for rejection are:
- Operational unavailability (admin-driven)
- Payment failure (Gate 03A/03B)
- Gate validation failure (Gates 01, 02, 07)

---

## 6. OVERDUE POLICY

### 6.1 Invoice OVERDUE Classification

**LOCKED BY CURRENT OWNER DIRECTION**

When a `SENT` invoice passes its `due_date` without a confirmed payment:

```
invoices_pp.status: SENT → OVERDUE
```

This transition is triggered by:
- A scheduled job (e.g. daily cron) — `ENGINEERING VALIDATION` for implementation mechanism
- OR checked on-demand when invoice is fetched

### 6.2 No Auto-Cancel

**LOCKED BY CURRENT OWNER DIRECTION**

An OVERDUE invoice **does NOT auto-cancel**. Auto-cancellation is forbidden in Phase 2.

Authorized admin actions on an OVERDUE invoice:
- **Follow up** with client (external action — no system state change)
- **Extend the due date** — admin may update `due_date` on the invoice → status returns to `SENT` (or stays `OVERDUE` if still past the new date — `ENGINEERING VALIDATION` for exact recomputation logic)
- **Cancel the invoice** — admin explicitly cancels → `OVERDUE → CANCELLED`
- **Confirm payment** — if payment is eventually received → `OVERDUE → PAID` (via normal payment confirmation path)

Every admin action on an OVERDUE invoice must generate an audit event via `audit.service.js`.

### 6.3 Order Status on Invoice OVERDUE

**DEFAULT FOR PHASE 2**

The order status corresponding to an OVERDUE invoice:

```
orders_pp.status: PENDING_PAYMENT (unchanged — does not auto-advance or auto-cancel)
```

The order remains in `PENDING_PAYMENT` while its invoice is `OVERDUE`. The order only advances to `ACTIVE` when the invoice reaches `PAID`. The order is cancelled only via explicit admin action.

---

## 7. REFUND SCOPE

### 7.1 Minimal `refunds_pp` in Phase 2

**LOCKED BY CURRENT OWNER DIRECTION**

Phase 2 includes a minimal `refunds_pp` entity. This resolves OPEN-NEW-01.

**Scope:**
- One refund per payment (1:1 with `payments_pp`)
- **Full refund only** for Phase 2 — `refund_amount = original payment amount`
- Entity is append-only — no UPDATE, no DELETE
- Refund creates an audit trail entry via `audit.service.js`

### 7.2 `refunds_pp` Field Specification

**DEFAULT FOR PHASE 2**

| Field | Type | Classification | Notes |
|-------|------|----------------|-------|
| id | TEXT PK | SYS | `REF-PP-YY-xxxx` — `ENGINEERING VALIDATION` for exact format; must use `nextId()` |
| payment_id | TEXT FK | REF | → payments_pp.id — UNIQUE (1 refund per payment) |
| invoice_id | TEXT FK | REF | → invoices_pp.id (denormalized for display) |
| order_id | TEXT FK | REF | → orders_pp.id (denormalized for display) |
| refund_amount | NUMERIC(12,2) | SNAP | Copied from payments_pp.amount at refund creation |
| refund_date | DATE | USR | Date refund was processed |
| reason | TEXT | USR | Admin-entered reason — required |
| status | TEXT | ENUM | PENDING → PROCESSED → REJECTED |
| created_by | TEXT | SYS | Actor from request context |
| created_at | TIMESTAMPTZ | AUDIT | System set |

### 7.3 DEFERRED Refund Features

**DEFERRED** (to Phase 4 or later):
- Partial refund
- Multi-step refund approval workflow
- Accounting system integration
- Automated refund reversal to payment method
- Refund policy rules engine

---

## 8. PARTICIPANT MODEL

### 8.1 One Participant Per PP Order — Phase 2

**LOCKED BY CURRENT OWNER DIRECTION**

For Phase 2: **ONE PARTICIPANT PER PP ORDER**. This resolves OPEN-2B-01 for Phase 2.

- `order_participants` enforces a maximum of 1 participant per order via service-layer gate (Gate 07 slot check)
- `participants_pp` is the source of truth for participant identity
- `assessments_pp.participant_id → participants_pp.id` is the authoritative FK (not `client_id` — this was a Batch 2B text error, corrected in the ER Matrix Section 6.15)

### 8.2 Participant vs. Client Distinction

**LOCKED BY CURRENT OWNER DIRECTION**

| Concept | Table | Role |
|---------|-------|------|
| Client | `clients_pp` | Payer / registrant (commercial identity) |
| Participant | `participants_pp` | Training subject (operational identity) |

These are separate tables, separate entities, separate lifecycle concerns. They are never merged or aliased. For solo PP, the Client and Participant will often be the same person — but separate records must still exist.

### 8.3 DEFERRED Participant Features

**DEFERRED** (to Phase 4 or later):
- Couple orders (2 participants per order)
- Group orders (N participants per order)
- `max_participants` per package type
- Capacity management / waitlist

### 8.4 Architecture Extensibility for Future Group Orders

**DEFAULT FOR PHASE 2**

The `order_participants` table is designed as a **join table (many-to-many between orders and participants)**. The schema does not prevent future addition of multiple participants per order. The service-layer slot check (max 1 for Phase 2) is a policy check, not a schema constraint.

Adding couple/group support in Phase 4+ requires only:
1. Updating the slot check policy (no schema change to `order_participants`)
2. Adding a `max_participants` field to `packages` (additive schema change)
3. Updating Gate 07 in the service layer

---

## 9. PROGRAM READINESS GATE

### 9.1 Program Readiness Is a Derived State

**LOCKED BY CURRENT OWNER DIRECTION**

**Program Readiness** is NOT a stored column. It is a **derived boolean** computed on-the-fly:

```
Program Readiness = TRUE  iff  orders_pp.status = 'ACTIVE'
                             AND invoices_pp.status = 'PAID'
```

If either condition is false, Program Readiness = FALSE.

### 9.2 Mandatory Sequence: Invoice PAID Before Program Readiness

**LOCKED BY CURRENT OWNER DIRECTION**

Invoice `PAID` is a **mandatory prerequisite** for Program Readiness. There is no workaround or override path.

- Formal program logistics (trainer assignment, session scheduling) require Program Readiness
- Program Readiness requires Invoice `PAID`
- Therefore: formal program logistics require Invoice `PAID`

### 9.3 Order ACTIVE Does Not Equal Program Readiness

**LOCKED BY CURRENT OWNER DIRECTION** (resolving OPEN-2B-04)

`Order ACTIVE` alone does NOT constitute Program Readiness. These are **separate concepts** that happen to be simultaneously required:

- `Order ACTIVE` = commercial activation (package + price confirmed, order accepted)
- `Invoice PAID` = financial clearance (client payment confirmed)
- **Program Readiness** = the conjunction of both

### 9.4 Informal Coordination Is NOT Blocked

**DEFAULT FOR PHASE 2**

The system does NOT prevent informal communication between admin and trainer before Program Readiness. Phase 2 has no "pre-assignment communication lock." Only formal system actions (creating an `assignments_pp` record, creating `sessions_pp` records) require Program Readiness. These formal actions are in Phase 5 scope.

---

## 10. ASSIGNMENT AND SESSION GATE

### 10.1 Formal Assignment Requires Program Readiness

**LOCKED BY CURRENT OWNER DIRECTION**

Creating an `assignments_pp` record (Phase 5) requires Program Readiness:

```
Program Readiness = TRUE  →  Assignment may be created
Program Readiness = FALSE →  Assignment creation is rejected
```

### 10.2 Session Creation Requires Assignment

**LOCKED BY CURRENT OWNER DIRECTION** (architectural constraint from Phase 5 design)

Creating a `sessions_pp` record requires a valid `assignments_pp.id`. Sessions cannot exist without a prior assignment.

### 10.3 Phase 2 Does Not Implement These Gates

**DEFAULT FOR PHASE 2**

`assignments_pp` and `sessions_pp` are Phase 5 entities. Phase 2 does not implement the assignment gate or session gate. Phase 2 only establishes and validates Program Readiness as a derived state from Phase 2A + 2B data.

The gate logic will be wired in Phase 5, at which point Program Readiness will be evaluated as a prerequisite check before `assignments_pp` creation.

---

## 11. STATUS NORMALIZATION

### 11.1 Order Status

**LOCKED BY CURRENT OWNER DIRECTION**

| Status | Meaning |
|--------|---------|
| `DRAFT` | Order created, not yet submitted for payment |
| `PENDING_PAYMENT` | Order submitted; awaiting invoice payment |
| `ACTIVE` | Invoice paid; order commercially activated |
| `COMPLETED` | All sessions delivered (Phase 5 transition) |
| `CANCELLED` | Admin-cancelled; no further actions allowed |
| `OVERDUE` | (Optional: if the order-level OVERDUE concept is adopted — see below) |

**Note on `OVERDUE` at the order level:** The primary OVERDUE state lives on `invoices_pp`. Whether to mirror it at `orders_pp.status` is `ENGINEERING VALIDATION` — engineering may use the `OVERDUE` status at the order level as a derived/denormalized convenience, or may keep the order in `PENDING_PAYMENT` and derive OVERDUE from the linked invoice. Either approach is acceptable for Phase 2.

**`PENDING` (without suffix) is disallowed.** The canonical status is `PENDING_PAYMENT`.

### 11.2 Invoice Status

**LOCKED BY CURRENT OWNER DIRECTION**

| Status | Meaning |
|--------|---------|
| `DRAFT` | Invoice created but not yet sent to client |
| `SENT` | Invoice issued; awaiting payment |
| `PAID` | Full payment confirmed |
| `OVERDUE` | Past due_date without confirmed payment |
| `CANCELLED` | Admin-cancelled or order cancelled |

**`PARTIALLY_PAID` does NOT exist for PP.** Any code path that would set this status for a PP invoice is a bug.

### 11.3 Payment Status

**LOCKED BY CURRENT OWNER DIRECTION**

| Status | Meaning |
|--------|---------|
| `PENDING` | Payment record created; awaiting confirmation |
| `CONFIRMED` | Admin-confirmed full payment received |
| `REJECTED` | Admin-rejected (incorrect amount, bounced, etc.) |

### 11.4 Refund Status

**DEFAULT FOR PHASE 2**

| Status | Meaning |
|--------|---------|
| `PENDING` | Refund initiated; awaiting processing |
| `PROCESSED` | Refund completed |
| `REJECTED` | Refund rejected (with reason) |

---

## 12. AUDIT REQUIREMENTS

### 12.1 Audit Is Mandatory for All State Transitions

**LOCKED BY CURRENT OWNER DIRECTION**

Every state transition in every Phase 2 entity **must emit an audit event** via `audit.service.js` (Phase 1 foundation — already implemented, 84/84 tests passing).

### 12.2 Minimum Auditable Events

**LOCKED BY CURRENT OWNER DIRECTION**

| Entity | Events That Must Be Audited |
|--------|----------------------------|
| `orders_pp` | Created, `DRAFT → PENDING_PAYMENT`, `PENDING_PAYMENT → ACTIVE`, `ACTIVE → COMPLETED`, `→ CANCELLED`, `→ OVERDUE` (if applicable) |
| `invoices_pp` | Created, `DRAFT → SENT`, `SENT → PAID`, `SENT → OVERDUE`, `OVERDUE → PAID`, `OVERDUE → CANCELLED`, due_date extended |
| `payments_pp` | Created, `PENDING → CONFIRMED`, `PENDING → REJECTED` |
| `receipts_pp` | Created |
| `refunds_pp` | Created, `PENDING → PROCESSED`, `PENDING → REJECTED` |
| `participants_pp` | Created, any field update |
| `order_participants` | Participant added to order, participant removed from order |
| `assessments_pp` | Created |
| URGENT orders | Operational availability check performed, outcome (cleared/cancelled) |
| Admin override | Due-date extension on OVERDUE invoice, admin cancellation, admin payment confirmation |

### 12.3 Audit Event Must Include

**DEFAULT FOR PHASE 2**

Each audit event emitted by `audit.service.js` must include:
- `entity_type` (e.g. `ORDER_PP`, `INVOICE_PP`, `PAYMENT_PP`)
- `entity_id` (the ID of the affected record)
- `event_type` (e.g. `ORDER_ACTIVATED`, `INVOICE_PAID`, `PAYMENT_CONFIRMED`)
- `actor` (from request context — who performed the action)
- `correlation_id` (from request middleware — Phase 1 foundation already provides this)
- `occurred_at` (system timestamp)
- Relevant `metadata` JSONB (e.g. previous status, new status, amount, reason)

---

## 13. DEFERRED FEATURES

The following features are explicitly out of Phase 2 scope. They must NOT be implemented as part of Phase 2A or 2B, even as stubs or partial implementations.

| Feature | Deferred To | Reason |
|---------|------------|--------|
| DP (down payment) | Phase 4+ | Requires `PARTIALLY_PAID` flow, not in PP Phase 2 model |
| Installment payment | Phase 4+ | Multi-payment workflow not in PP Phase 2 model |
| Partial payment | Phase 4+ | Full payment only for PP |
| Couple orders (2 participants) | Phase 4 | Slot logic and capacity gates not needed Phase 2 |
| Group orders (N participants) | Phase 4 | Same as couple |
| Partial refund | Phase 4+ | Full refund only for PP Phase 2 |
| Refund approval workflow | Phase 4+ | Simple admin action for Phase 2 |
| Accounting integration | Phase 4+ | Out of Phase 2 backend scope |
| Agreements (`agreements_pp`) | Phase 3 | Generated after Order ACTIVE; separate phase |
| Health & Safety screening (`health_and_safety_pp`) | Phase 3 | Not in Phase 2 scope |
| Formal assignment (`assignments_pp`) | Phase 5 | Operational layer, after Phase 2 commercial layer |
| Session management (`sessions_pp`) | Phase 5 | Same as assignment |
| Attendance tracking (`attendance_pp`) | Phase 5 | Same as assignment |
| Quotation entity | Phase 3/6 | Pre-order; not a commercial transaction |
| Promo/discount code entity | Phase 3 | `discount_amount` stored on invoice suffices for Phase 2 |
| Multi-level urgent approval | Phase 4+ | Single admin authorization sufficient for Phase 2 |
| Assessment as hard Order gate | Phase 3 | OPEN-2B-04: gate wired but defaults OFF; enable in Phase 3 |
| B2B payment models | Phase 2 B2B | Separate module, separate service layer |
| Legacy GAS/Google Sheets migration | NEVER (DEC-07) | Legacy remains separate, no synchronization |
| Legacy data import | NEVER (DEC-07) | No legacy PIC, price, order, or client data imported |

---

## 14. B2B MODULE SEPARATION

### 14.1 PP Phase 2 Code Is PP-Only

**LOCKED BY CURRENT OWNER DIRECTION**

No Phase 2 PP code is shared with, visible to, or reused by B2B Management or B2B Event modules.

The following are PP-scoped:
- All `*_pp` tables
- All `pp.*` service layer modules
- All `/api/pp/*` routes
- Gates 03A and 03B (full-payment enforcement)

### 14.2 Billing Core Extensibility for B2B

**DEFAULT FOR PHASE 2**

The Billing Core tables (`invoices_pp`, `payments_pp`, `receipts_pp`) are designed to be extensible to B2B without schema changes to the PP tables. B2B will use parallel tables (`invoices_b2b`, `payments_b2b`, `receipts_b2b`) with the same structural pattern but different service-layer gate logic (which may allow partial payment, installment, management fee, etc.).

Specifically: the `invoices_pp.status` enum does NOT include `PARTIALLY_PAID` — this is a PP design choice, not a global schema constraint. B2B schemas may define their own status enum values.

### 14.3 Shared Infrastructure

The following Phase 1 infrastructure is **shared across all modules** and is not PP-specific:

- `id_sequences` table and `nextId()` generator
- `audit_events` table and `audit.service.js`
- `pic_master` and `pic_contexts` tables
- `errors.js`, `baseRepository.js`, `baseService.js`
- Correlation ID middleware
- `withTransaction` / `query` from `db/index.js`
- Migration mechanism (`migrate.js`)

---

## 15. THREE TO FIVE YEAR EXTENSIBILITY

### 15.1 Designed-In Extensibility Points

**DEFAULT FOR PHASE 2**

The Phase 2 architecture is explicitly designed to accommodate the following without schema rewrites:

| Future Requirement | Extensibility Path |
|----|-----|
| Couple/group orders | `order_participants` is a join table; slot limit is a service-layer policy check (not a schema UNIQUE constraint) |
| Multiple participants | Add `max_participants` to `packages`; update Gate 07 policy |
| Installment payment for B2B | B2B uses its own billing service with different Gate 03 logic |
| New catalog structures | `programs → offerings → packages → package_prices` hierarchy is a general catalog; adding new offering types or package variants requires only catalog admin API, no schema changes |
| Price history | `package_prices` is append-only with `effective_from`/`effective_to` dates; historical price queries are already supported |
| Commercial snapshot replay | `order_commercial_snapshots` is write-once and immutable; agreement generation (Phase 3) and audit replay already consume it |
| Assessment data evolution | `assessments_pp.extra_data JSONB` accommodates new measurement types without schema migration |
| Active Aging gate enforcement | OPEN-2B-04 gate point is wired in Order service but defaults to OFF; enable in Phase 3 without code restructuring |
| Multiple PIC assignments | `assignments_pp` (Phase 5) is a separate table, not a column on `orders_pp`; multiple assignments are structurally supported |
| Receipt template changes | Receipt stores snapshot fields (client_name, package_name, etc.) — template changes are presentation layer only |

### 15.2 Non-Extensible by Design (Intentional Hard Constraints)

**LOCKED BY CURRENT OWNER DIRECTION**

| Constraint | Why Intentionally Hard |
|----|----|
| `order_commercial_snapshots` is write-once | Financial integrity — snapshot of what was agreed at order creation must be immutable |
| `assessments_pp` is immutable after creation | Medical/physical record integrity |
| `participant_histories_pp` is append-only | Audit trail integrity |
| `audit_events` is append-only | Regulatory and operational audit integrity |
| `receipts_pp` is system-generated, immutable | Receipt is a legal financial document |
| PP full-payment-only for Phase 2 | Owner direction — partial payment is explicitly out of PP scope |

---

## 16. FINAL CODING AUTHORIZATION CHECKLIST

### 16.1 Architecture Consistency Check

The following checks were performed against the existing Phase 1 foundation and Phase 2 architecture documents:

| Check | Source | Finding | Classification |
|-------|--------|---------|----------------|
| Phase 1 foundation (commit `b9c7c5d`, 84/84 tests) | Cross-Batch Reconciliation Section 5.1 | All Phase 2 required infrastructure is available: `nextId()`, `audit.service`, `baseRepository`, `baseService`, `withTransaction`, correlation ID, `errorHandler` | NON-BLOCKING |
| `nextId()` doc types for Phase 2A entities | Cross-Batch Reconciliation Section 5.1 | ORDER(`PP`), INVOICE(`PP`), RECEIPT(`PP`), LEAD_PP(`PP`), ASSESSMENT(`PP`) all registered and working | NON-BLOCKING |
| CLIENT doc type in `id.generator.js` | Cross-Batch Reconciliation Section 5.2 | Not yet added — Phase 2A must add `CLIENT` (or chosen format per OPEN-2A-01) | ENGINEERING VALIDATION (non-blocking, resolved at implementation) |
| PAYMENT doc type in `id.generator.js` | Cross-Batch Reconciliation Section 5.2 | Not yet added — Phase 2A must add `PAYMENT` (or use UUID per OPEN-2A-02) | ENGINEERING VALIDATION (non-blocking) |
| PARTICIPANT doc type in `id.generator.js` | Cross-Batch Reconciliation Section 5.2 | Not yet added — Phase 2B must add when participant ID format is decided | ENGINEERING VALIDATION (non-blocking, does not block 2A) |
| REFUND doc type in `id.generator.js` | This document (Section 7.2) | Not yet added — Phase 2A must add `REFUND_PP` | ENGINEERING VALIDATION (non-blocking) |
| `agreement.guard.js` | Cross-Batch Reconciliation Section 5.1 | Available but not needed in Phase 2 (agreements are Phase 3) | NON-BLOCKING |
| Migration 001 (`001_create_schema_foundation.sql`) | Cross-Batch Reconciliation Section 6 | Applied and complete | NON-BLOCKING |
| Migration 002 (`002_create_commercial_core.sql`) | Cross-Batch Reconciliation Section 6 | Not yet created — Phase 2A creates this | ENGINEERING VALIDATION (expected — Phase 2A deliverable) |
| Migration 003 (`003_create_participant_assessment.sql`) | Cross-Batch Reconciliation Section 6 | Not yet created — Phase 2B creates this | ENGINEERING VALIDATION (expected — Phase 2B deliverable) |
| `PARTIALLY_PAID` status absent from ER Matrix | ER Matrix Section 6.9 | `invoices_pp.status` enum shows `DRAFT, SENT, PAID, OVERDUE, CANCELLED` — `PARTIALLY_PAID` is absent | NON-BLOCKING (consistent with this decision lock) |
| `order_commercial_snapshots` write-once enforcement | ER Matrix Section 4.1 | Confirmed: no UPDATE route exists in order service design | NON-BLOCKING |
| `assessments_pp.participant_id` FK authority | ER Matrix Section 6.15 | `participant_id` is the authoritative FK (not `client_id` — the Batch 2B text error was corrected in ER Matrix) | NON-BLOCKING |
| OPEN-2B-04 Assessment Gate cross-batch dependency | Cross-Batch Reconciliation Section 3.1, 8, ER Matrix Section 10 | Resolved: Gate wired but defaults OFF (DEFERRED GATE) — Phase 2A Order service does NOT require Assessment service at runtime | NON-BLOCKING |
| `refunds_pp` not in current Batch 2A schema | Batch 2A Lock, ER Matrix | `refunds_pp` was not in the original Batch 2A documents (OPEN-NEW-01 was unresolved) — now resolved, must be added to migration 002 | ENGINEERING VALIDATION (additive) |
| PIC master compatibility | Cross-Batch Reconciliation Section 5.1 | `pic_master` available; Phase 2 uses it for `assessments_pp.assessed_by` and (Phase 5) `assignments_pp` | NON-BLOCKING |
| Audit service compatibility | Phase 1 (all entities emit audit events) | `audit.service.js` is append-only, tested, available | NON-BLOCKING |
| Legacy code isolation (REACT-APP) | DEC-07 | No `REACT-APP/src/data/` files referenced or modified by Phase 2 backend | NON-BLOCKING |

### 16.2 Identified Blockers

**THERE ARE NO ARCHITECTURAL BLOCKERS.**

All items in the consistency check are classified as NON-BLOCKING or ENGINEERING VALIDATION (implementation details resolvable by the engineering team within the bounds set by this document).

The three previously identified CRITICAL blocking open decisions have been resolved:

| Formerly Critical Decision | Resolution in This Document |
|---|---|
| OPEN-2A-03 (Partial Payment Policy) | Section 2: FULL PAYMENT ONLY — `PARTIALLY_PAID` does not exist for PP |
| OPEN-2B-04 (Assessment as Pre-Order Gate) | Section 9.3: `Order ACTIVE ≠ Program Readiness`; assessment gate wires but defaults OFF |
| OPEN-2B-01 (Group Participant Count) | Section 8: ONE PARTICIPANT PER ORDER for Phase 2 |

### 16.3 ENGINEERING VALIDATION Items (Non-Blocking)

The following items are left to engineering judgment, within the bounds specified in this document:

| Item | Bound / Constraint |
|------|-------------------|
| Refund ID format (`REF-PP-YY-xxxx` or similar) | Must use `nextId()` — internal format is engineering decision |
| Client ID format (OPEN-2A-01) | Must use `nextId()` — format options: `KL-xxxx` or `CLT-YY-xxxx` |
| Payment ID format (OPEN-2A-02) | Options: UUID (simplest), `PAY-PP-YY-xxxx`, or SERIAL |
| Participant ID format (OPEN-2B-02, Batch 2B) | Does not block 2A; options: `PTN-YY-xxxx` or UUID |
| Gate 03A tolerance configuration | Default is 0 (exact match); mechanism is engineer's choice |
| Gate 03B as DB constraint | Service-layer check is mandatory; DB UNIQUE constraint is optional defense-in-depth |
| URGENT classification storage | Flag on order, derived status, or separate field — engineer's choice |
| Due-date extension logic (OVERDUE → back to SENT) | Exact recomputation logic is engineer's choice |
| `orders_pp.status = OVERDUE` | May mirror invoice OVERDUE at order level or keep order in `PENDING_PAYMENT` — engineer's choice |
| Assessment gate feature flag mechanism | Config table, env var, or hardcoded-OFF comment — engineer's choice |
| Daily cron for OVERDUE transition | Implementation mechanism — engineer's choice (cron job, event listener, on-demand check) |

### 16.4 Deferred Decisions (Not Needed for Phase 2)

The following open decisions from prior documents are deferred and do NOT block Phase 2:

- OPEN-2A-04: Promo/discount entity — store `discount_amount` on invoice, no separate table in Phase 2
- OPEN-2A-05: Quotation entity — deferred to Phase 3/6
- OPEN-2B-02: Participant ID format — deferred to Phase 2B start
- OPEN-2B-03: Assessment data structure — already resolved in ER Matrix (Option C: columns + JSONB)

### 16.5 FINAL AUTHORIZATION

> **PP Phase 2 is now architecturally ready for implementation, subject only to engineering validation against the existing Phase 1 foundation.**
>
> No architectural blocker remains. All owner-level decisions required for Phase 2 coding have been locked. ENGINEERING VALIDATION items are bounded and do not require owner input before implementation begins.

**PP CODING AUTHORIZED.**

### 16.6 Next Coding Batch: Batch 2A — Commercial Core

**Exact scope of next coding deliverable:**

**Batch 2A — Commercial Core (PP)**

Implement in this sequence (within Batch 2A):

1. **Migration `002_create_commercial_core.sql`** — all Batch 2A tables: `programs`, `offerings`, `packages`, `package_prices`, `leads_pp`, `clients_pp`, `orders_pp`, `order_commercial_snapshots`, `invoices_pp`, `payments_pp`, `receipts_pp`, `refunds_pp`

2. **ID generator update** — add doc types for CLIENT, PAYMENT, REFUND_PP to `id.generator.js`

3. **Service modules (in dependency order):**
   - `catalog.service.js` (programs, offerings, packages, package_prices)
   - `lead.service.js`
   - `client.service.js`
   - `order.service.js` (including `order_commercial_snapshots` in same transaction; assessment gate wired but defaulted OFF)
   - `invoice.service.js`
   - `payment.service.js` (including Gate 03A + Gate 03B)
   - `receipt.service.js`
   - `refund.service.js`

4. **Router modules** — one per service, registered in `app.js` under `/api/pp/*`

5. **Tests** — minimum: repository CRUD, service gate validation, ID generation, audit emission, error type checks (following Phase 1 test pattern)

6. **Batch 2B follows** (after `orders_pp` and `clients_pp` exist): `participants_pp`, `order_participants`, `participant_histories_pp`, `assessments_pp`

**Coding constraints that remain in force during Batch 2A:**
- DO NOT modify `REACT-APP/src/data/` files
- DO NOT create production schema migrations (use `efm_test_db` for development)
- DO NOT merge PR #534 without owner review
- DO NOT pop `stash@{0}` (PPRekapAbsensiDetailPage UI fix) during Phase 2 backend work

---

*Document created: 2026-09-30 | Mode: ANALYSIS ONLY — NO SOURCE FILES MODIFIED*  
*Authority: Owner direction as documented in `EFM_PP_OPEN_2A_03_FINAL_OWNER_DECISION_MATRIX_v1.0.md` and direct session instruction*  
*Prepared for: Phase 2 coding team handoff*
