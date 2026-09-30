# EFM PP Phase 2 — Final Owner Decision Matrix v1.0

**Status:** OWNER REVIEW REQUIRED  
**Prepared:** 2026-09-29  
**Branch:** `claude/add-claude-md-instructions-7iqjvo`  
**Depends On:** EFM_PP_PHASE_2_OWNER_DECISION_REVIEW_PACK_v1.0 (2026-09-29)

---

## 1. Executive Summary

This document is the final synthesis of all Phase 2 architecture analysis. It consolidates:

- **5 source documents** read in full: Batch 2A Commercial Core Lock, Batch 2B Participant & Assessment Lock, Cross-Batch Architecture Reconciliation, Entity Relationship & Source of Truth Matrix, Owner Decision Review Pack
- **1 approved owner decision** (OPEN-2B-04 = Split Gate, confirmed prior to this document)
- **11 remaining open decisions** requiring owner input before Phase 2 coding begins
- **3 new decisions** surfaced during deep analysis (OPEN-NEW-01, -02, -03) that were not in the original batch documents

### Overall Phase 2 Readiness: NOT READY TO CODE

Phase 2 coding must not begin until all CRITICAL open decisions are resolved. As of this document:
- 1 CRITICAL decision is APPROVED (OPEN-2B-04)
- 3 CRITICAL decisions remain PENDING (OPEN-2A-03, OPEN-2B-01, OPEN-NEW-01)
- 5 HIGH/MEDIUM decisions remain PENDING (OPEN-2A-01, -02, -04, -05, OPEN-2B-02, -03, OPEN-NEW-02, -03)

### Key Architectural Facts Confirmed

1. Phase 1 backend (Node.js + Express + PostgreSQL 16) is complete at commit `b9c7c5d`, 84/84 tests passing — this is the foundation.
2. Phase 2 consists of 15 tables: 11 in Batch 2A (commercial core) + 4 in Batch 2B (participant/assessment).
3. The ER Matrix already models `invoices_pp → payments_pp` as 1:N — the schema physically supports partial payments. Whether the **business policy** allows them is OPEN-2A-03.
4. `order_commercial_snapshots` is WRITE-ONCE with no UPDATE path — this is non-negotiable.
5. `assessments_pp` and `participant_histories_pp` are APPEND-ONLY — no UPDATE, no DELETE — this is non-negotiable.
6. Order ACTIVE ≠ Program Ready — these are separate lifecycle concepts (APPROVED: OPEN-2B-04).
7. Active Aging rules are PP-scoped only — they must never propagate to EFM Core, B2B, or Event.
8. Legacy GAS/Google Sheets data is NOT migrated (DEC-07) — the EFM V2 system starts with a fresh commercial catalog.

---

## 2. Approved Decisions

### OPEN-2B-04 — Assessment Gate Architecture
**Status: OWNER APPROVED — SCENARIO C (SPLIT GATE)**  
**Approved Before This Document**

**Approved Architecture — verbatim:**
```
ORDER
│
├── Commercial Lifecycle → ACTIVE
│
└── Program Readiness
       │
       └── Program Module Assessment Gate
               │
          ┌────┴────┐
         PASS      BLOCK
          │
      PROGRAM READY → ASSIGNMENT → SESSION
```

**Binding Rules from Approval:**
- Assessment is NOT a universal prerequisite for Order ACTIVE
- Commercial activation and Program Readiness are SEPARATE concepts
- Program Module determines whether assessment/screening is required (configurable per module)
- Active Aging-specific assessment gate rules stay within the Active Aging module scope — they do NOT become universal PP Core rules
- This decision is LOCKED and must not be reopened

**Architectural Impact:**
- `order.service` transitions Order to ACTIVE when commercial/payment conditions are met — NO assessment check required
- `program_readiness` is a derived state evaluated separately after Order is ACTIVE
- Gate 09 (Program Readiness Gate) exists as a service-layer check but does NOT block the Order ACTIVE transition
- The Program Module configuration determines whether assessment must PASS before the program readiness flag is set

---

## 3. Remaining Open Decisions

All 11 decisions below are PENDING. Only OPEN-2B-04 is approved.

| Decision ID | Subject | Criticality | Classification |
|-------------|---------|-------------|----------------|
| OPEN-2A-01 | Client ID format | MEDIUM | Owner Should Decide Before Schema Lock |
| OPEN-2A-02 | Payment ID format | LOW | Engineering Can Decide |
| OPEN-2A-03 | Partial payments policy | HIGH | **Owner Must Decide Before Coding** |
| OPEN-2A-04 | Promo/discount entity scope | MEDIUM | Owner Should Decide Before Schema Lock |
| OPEN-2A-05 | Quotation entity phase | LOW | Can Be Deferred |
| OPEN-2B-01 | Group participant capacity | HIGH | **Owner Must Decide Before Coding** |
| OPEN-2B-02 | Participant ID format | MEDIUM | Owner Should Decide Before Schema Lock |
| OPEN-2B-03 | Assessment data structure | LOW | Engineering Can Decide (recommendation already applied) |
| OPEN-NEW-01 | Refund entity in Phase 2 | HIGH | **Owner Must Decide Before Coding** |
| OPEN-NEW-02 | Assessment validity window | MEDIUM | Owner Should Decide Before Schema Lock |
| OPEN-NEW-03 | Receipt generation trigger | MEDIUM | Owner Should Decide Before Schema Lock |

---

## 4. Critical Decisions

The following decisions are CRITICAL — Phase 2 coding cannot begin without them.

### OPEN-2A-03 — Partial Payments Policy

**The Question:** When a client pays Rp 800,000 against a Rp 2,400,000 invoice, what happens?

**Option A — Single Full Payment Only:**  
The system accepts only one payment per invoice, and that payment must equal `final_amount`. Partial payment is rejected at the API level with a validation error. ACTIVE status requires full payment.

**Option B — Partial Payments Allowed:**  
The system accepts multiple payments per invoice. `invoices_pp` tracks `amount_paid` and `remaining_balance`. Order transitions to ACTIVE when first payment is confirmed (allowing program to start before full settlement). Invoice status becomes `PARTIALLY_PAID` until all payments sum to `final_amount`.

**Option C — Partial Payments Structured (DP + Balance):**  
Same as Option B but with a fixed deposit/balance structure: DP payment record, then balance payment record. Order ACTIVE may require DP confirmation only; full payment required before program completion.

**Analysis:**
- The existing schema (`payments_pp` with `invoice_id FK`, `UNIQUE receipts_pp.payment_id`) already physically supports multiple payments per invoice
- The ER Matrix explicitly notes: "Partial payments: OPEN-2A-03 — whether multiple payments per invoice are allowed"
- The Pre-Coding Lock states: "Do not use one giant lifecycle status — Order, Invoice, Payment, Receipt each have own status"
- Accepting partial payments requires `invoices_pp` to track a running `amount_paid` CALC field and a `remaining_balance` CALC field — these do not require a schema change (fields can be CALC from SUM of confirmed payments)
- One receipt per confirmed payment is already enforced (UNIQUE FK) — this works correctly for both single and multiple payment models
- The service architecture impact: if partial, `billing.service` must update `invoices_pp.status` to `PARTIALLY_PAID` after each confirmation; if full payment or final payment reaches `final_amount`, status → `PAID` and Order may transition to ACTIVE

**Consequence of each option for Order status:**
- Option A: Order → ACTIVE immediately upon single full payment confirmation
- Option B: Policy choice — owner decides whether Order → ACTIVE on first confirmed payment or only on full payment
- Option C: Order → ACTIVE on DP confirmation; Order → COMPLETED allowed only after full balance settled

**Recommendation:** Option B, with Order ACTIVE triggered only when `amount_paid = final_amount` (no partial-activation business logic needed in Phase 2; partial acceptance reduces friction without creating operational complexity).

**Exact owner decision sentence:**  
*"Approve / reject: Partial payments are allowed — multiple confirmed payments may be recorded against one invoice; Order transitions to ACTIVE only when total confirmed payments equal the full invoice final_amount; a receipt is issued for each confirmed payment."*

---

### OPEN-2B-01 — Group Participant Capacity

**The Question:** For couple and group packages, how many participants can be linked to one order?

**Current Schema:** `order_participants` with UNIQUE(order_id, participant_id) — supports any number of participants per order. No capacity enforcement exists in the schema.

**Option A — Fixed Per Package Type:**  
Solo packages: max 1. Couple packages: max 2. Group packages: max defined capacity (6, 8, 10 — owner decides). Enforced at the service layer via `order.service` validation.

**Option B — Configurable Per Package:**  
A `max_participants` field on the `packages` table. Each package defines its own capacity. Service validates against this field. Requires schema addition.

**Option C — Soft Limit with Warning:**  
No hard enforcement. Admin can add more participants than the package intends. System records all participants; reports flag over-capacity orders.

**Analysis:**
- The current PP package catalog (4 Sesi Starter, 8 Sesi Base, 12 Sesi Pro, 24 Sesi Elite) does not have explicit "couple" or "group" variants — this suggests the capacity question may need catalog design to be answered first
- If PP in Phase 2 only supports solo training (1 participant per order), this decision is deferred — Phase 2 codes for 1, Phase 3+ extends for couple/group
- The Active Aging module may have different group dynamics (small group fitness for older adults) — this is a Program Module concern, not PP Core

**Recommendation:** Phase 2 supports exactly 1 participant per PP order (solo training only). Couple and group participant linking is deferred to Phase 3 when the program catalog is extended. The schema already supports N participants — enforcement defaults to 1.

**Exact owner decision sentence:**  
*"Approve / reject: Phase 2 PP orders support exactly 1 participant per order; the service validates max 1 participant at order creation; couple and group participant linking is deferred to Phase 3."*

---

### OPEN-NEW-01 — Refund Entity in Phase 2

**The Question:** When an order is cancelled after payment, where does the refund record live?

**Current Gap:** There is no `refunds_pp` table in the Phase 2 architecture. Receipts are immutable snapshot records of confirmed payments. If a payment is confirmed and a receipt issued, there is no mechanism to reverse or offset it.

**Option A — No Refund Entity in Phase 2:**  
Cancellation is recorded on the Order (status → CANCELLED) and Invoice (status → CANCELLED). The receipt remains as historical evidence. The physical refund is handled outside the system (bank transfer, cash return). A `notes` field on the order captures what happened. Phase 3 introduces a `refunds_pp` entity.

**Option B — Refund Entity in Phase 2:**  
`refunds_pp` table: id, payment_id FK, amount, reason, refunded_by, refunded_at, reference (bank transaction). One refund per payment (UNIQUE FK). Must be created by a confirmed payment actor. This adds schema complexity to Phase 2 but provides a full audit trail.

**Option C — Partial Refund Support (Phase 2):**  
Same as Option B but allows partial refunds (refund_amount < payment_amount). This enables scenarios like: client cancelled after 2 sessions of a 12-session package — refund 10 sessions' worth. Requires coordination with `sessions_pp` (Phase 5) to calculate sessions consumed.

**Analysis:**
- Option C is out of scope for Phase 2 because `sessions_pp` does not exist until Phase 5
- Option A is the minimum viable approach — but creates an auditing gap if the system records payment but not the corresponding outgoing refund
- Option B adds one simple table to Phase 2B and provides a complete financial audit trail
- The Pre-Coding Lock states assessments and agreements are immutable after creation — this principle should extend to refund records: a refund row should be WRITE-ONCE
- If partial payments (OPEN-2A-03 Option B) are adopted, the refund question becomes more complex — the system would need to track which payment(s) are being refunded

**Recommendation:** Option B — add `refunds_pp` to Phase 2B schema (alongside `participants_pp` and `assessments_pp`). Simple table, append-only, one refund per confirmed payment in Phase 2. Phase 3 can extend to partial refunds when session tracking exists.

**Exact owner decision sentence:**  
*"Approve / reject: A `refunds_pp` table is included in Phase 2B with fields: id, payment_id (unique FK), refund_amount, reason, refunded_by, refunded_at, reference; the table is append-only and records one refund per confirmed payment; partial refunds (where refund_amount < payment_amount) are deferred to Phase 3."*

---

## 5. Payment Architecture

### 5.1 Recommended Payment Architecture

The recommended architecture for Phase 2 payment processing:

```
ORDER (status: DRAFT → PENDING_PAYMENT → ACTIVE → COMPLETED | CANCELLED)
  │
  └── INVOICE (status: DRAFT → SENT → PARTIALLY_PAID → PAID | OVERDUE | CANCELLED)
        │
        ├── PAYMENT attempt 1 (status: PENDING → CONFIRMED | REJECTED)
        │     └── RECEIPT (generated on confirmation)
        │
        └── PAYMENT attempt 2 (if partial payments approved)
              └── RECEIPT (generated on confirmation)
```

### 5.2 Status Independence — Non-Negotiable

Per the Pre-Coding Lock: "Do not use one giant lifecycle status." Each entity has its own independent status:

| Entity | Status Field | States | Who Controls |
|--------|-------------|--------|-------------|
| `orders_pp` | `status` | DRAFT, PENDING_PAYMENT, ACTIVE, COMPLETED, CANCELLED, EXPIRED | order.service state machine |
| `invoices_pp` | `status` | DRAFT, SENT, PARTIALLY_PAID (if approved), PAID, OVERDUE, CANCELLED | invoice.service, updated by billing.service |
| `payments_pp` | `status` | PENDING, CONFIRMED, REJECTED | billing.service |
| Program Readiness | derived flag | NOT_READY, ASSESSMENT_PENDING, PROGRAM_READY | assessment.service + order.service (separate from order status) |

**Invoice status PARTIALLY_PAID** exists only if OPEN-2A-03 approves partial payments. If single-payment-only is adopted, PARTIALLY_PAID is removed from the state machine.

### 5.3 Eleven Payment Scenario Analysis

| # | Scenario | Order Status | Invoice Status | Payment Status | Receipt | Notes |
|---|---------|-------------|---------------|----------------|---------|-------|
| 1 | Full payment, one shot | ACTIVE | PAID | CONFIRMED | Issued | Happy path |
| 2 | DP + balance (if approved) | ACTIVE after full | PARTIALLY_PAID → PAID | 2× CONFIRMED | 2× Receipts | Requires OPEN-2A-03 Option B or C |
| 3 | Multiple installments | ACTIVE after full | PARTIALLY_PAID × N → PAID | N× CONFIRMED | N× Receipts | Same as #2 |
| 4 | Payment after service begins | ACTIVE (if partial approved) | PARTIALLY_PAID | CONFIRMED (1st) | 1 Receipt | Only if OPEN-2A-03 B/C; operational risk for program readiness |
| 5 | Underpayment | PENDING_PAYMENT | SENT / PARTIALLY_PAID | CONFIRMED (partial) | Receipt for partial | Invoice remains open; order not ACTIVE (if full-payment required) |
| 6 | Overpayment | ACTIVE | PAID | CONFIRMED | Receipt for full amount | Overpayment recorded in payment.reference; refund process manual |
| 7 | Refund after cancel | CANCELLED | CANCELLED | CONFIRMED (original) | Receipt (immutable) + Refund record (OPEN-NEW-01) | Original receipt never deleted |
| 8 | Cancellation before payment | CANCELLED | CANCELLED | None or REJECTED | None | Order and Invoice both cancelled |
| 9 | Payment failure | PENDING_PAYMENT | SENT | REJECTED | None | New payment attempt can be made |
| 10 | Payment confirmation | PENDING_PAYMENT → ACTIVE | SENT → PAID | PENDING → CONFIRMED | Issued on confirm | Actor (confirmed_by) required |
| 11 | Receipt generation | N/A | N/A | CONFIRMED | Receipt created | Auto-generated by billing.service; no user input; all fields are SNAP |

### 5.4 Payment Allocation Entity Assessment

A separate `payment_allocations` table (allocating one payment across multiple invoices) is **NOT required** in Phase 2. The current model is one invoice per order — there is no multi-invoice scenario where allocation across invoices is needed. If the business model ever requires one payment split across multiple invoices (e.g. group billing), this would be added in a future phase. For Phase 2, `payments_pp.invoice_id` provides the direct link and no allocation table is needed.

### 5.5 What Happens When Order=ACTIVE But Invoice=PARTIALLY_PAID

This state is only possible if OPEN-2A-03 Option B/C is approved. If Order ACTIVE requires full payment (Option A or stricter Option B), this state cannot arise.

If allowed:
- Order ACTIVE means the commercial commitment exists and program activation may proceed
- Invoice PARTIALLY_PAID means the client has an open balance
- The system must track `amount_paid`, `remaining_balance` on the invoice
- Program Readiness is unaffected by partial payment status — the SPLIT GATE (OPEN-2B-04) governs program readiness, not invoice status
- The admin dashboard must clearly display the open balance; overdue logic applies to the remaining balance

---

## 6. Order Lifecycle

### 6.1 Order Commercial Lifecycle States

```
DRAFT
  │
  ▼
PENDING_PAYMENT  ← (Invoice issued, awaiting payment)
  │
  ▼ (Payment confirmed, full amount OR per OPEN-2A-03 policy)
ACTIVE
  │
  ├──▶ COMPLETED  (All sessions concluded; Phase 5)
  │
  ├──▶ CANCELLED  (Admin cancels; reason recorded)
  │
  └──▶ EXPIRED    (Start date passed with no activity; Phase 5 triggers)
```

**State transition rules:**
- DRAFT → PENDING_PAYMENT: Invoice is created and sent to client
- PENDING_PAYMENT → ACTIVE: Payment confirmed per OPEN-2A-03 policy (full payment or approved partial threshold)
- ACTIVE → COMPLETED: All sessions in the package have been attended (Phase 5 trigger)
- ACTIVE → CANCELLED: Admin action with cancellation reason; triggers refund flow if payment was received
- DRAFT → CANCELLED: Order cancelled before invoice; no financial impact
- PENDING_PAYMENT → CANCELLED: Order cancelled after invoice but before payment

**Note on EXPIRED:** `orders_pp` schema includes `start_date` and `end_date` (CALC). If a PENDING_PAYMENT order's start date passes with no payment, the system may auto-transition to EXPIRED. This requires a scheduled job (Phase 5 concern). In Phase 2, EXPIRED is a valid state enum but may not be auto-triggered.

### 6.2 Program Readiness (Separate from Order Commercial Status)

Program Readiness is a DERIVED concept, not a standalone status field on orders_pp. It is calculated from:

```
Commercial Gate:  orders_pp.status = ACTIVE                            ✓ required
Legal Gate:       agreements_pp signed                                  Phase 3
Safety Gate:      health_and_safety_pp acknowledged                    Phase 3
Operational Gate: assessment PASS (per Program Module config) + assignment exists  Phase 2B/5
```

In Phase 2, only the Commercial Gate and Operational Assessment Gate are relevant. The Legal and Safety gates are placeholders until Phase 3.

**Program Readiness States (per Program Module, not stored on orders_pp):**
- NOT_READY: Commercial gate not cleared, or assessment required but not done/passed
- ASSESSMENT_PENDING: Order is ACTIVE; assessment not yet recorded
- PROGRAM_READY: All gates cleared; assignment may proceed (Phase 5)

### 6.3 The SPLIT GATE In Operation (APPROVED)

Per the approved OPEN-2B-04 decision:

1. Admin creates Order → DRAFT
2. Invoice generated → Order to PENDING_PAYMENT
3. Client pays → Admin confirms payment → Order to ACTIVE *(commercial lifecycle complete)*
4. SEPARATELY: Assessment is scheduled and conducted (may happen before or after Order ACTIVE)
5. Assessment result fed through Program Module Assessment Gate
6. If PASS (or if program module does not require assessment) → PROGRAM READY
7. PROGRAM READY → Assignment can be made (Phase 5) → Sessions can begin

Step 3 and steps 4–7 are INDEPENDENT. Order does not wait for assessment to become ACTIVE. Assessment does not wait for Order to be ACTIVE before being recorded.

---

## 7. Participant / Roster Architecture

### 7.1 Entity Model

```
clients_pp ──────────────────────────────────────────────┐
    │                                                     │
    │ 0..1 client_id (nullable)                           │
    ▼                                                     │
participants_pp                                           │
    │                                    orders_pp ───────┘
    │                                        │
    └── order_participants ──────────────────┘
              (join table: order_id, participant_id, role)
                                             │
                                    assessments_pp
                                    (participant_id FK — required)
                                    (order_id FK — nullable)
```

**Key design decisions embedded in this model:**
- A `participant` is the physical person who trains. A `client` is the person who pays (and may be the same person).
- `participants_pp.client_id` is NULLABLE — a participant may not be the paying client (gift purchase, corporate sponsor, child).
- `order_participants.role` distinguishes primary, secondary, couple_partner, etc.
- Assessments belong to participants (via `participant_id`), not to clients — because assessments track physical data about the person training.

### 7.2 Ten Participant Scenario Test

| # | Scenario | Architecture Response | Resolution |
|---|---------|----------------------|------------|
| 1 | Solo — client = participant | 1 client, 1 participant, client_id linked | Fully supported |
| 2 | Couple — 2 participants, 1 order | 1 order, 2 participants in order_participants | Supported IF OPEN-2B-01 allows max ≥ 2 |
| 3 | Group — N participants, 1 order | 1 order, N participants in order_participants | Supported IF OPEN-2B-01 defines capacity |
| 4 | One payer → multiple participants | client pays, participants added separately | participants_pp.client_id → payer's client; order_participants links participants |
| 5 | One participant → multiple Orders | participant_id appears in multiple order_participants rows | Fully supported (no unique constraint on participant_id alone) |
| 6 | Repeat purchase (same client, new order) | New order created; same client_id, new order_id; existing participant record reused | Fully supported |
| 7 | Renewal (extend an active order) | Current design: new Order, new Invoice, new commercial snapshot. No "extend" mutation on existing order | Supported as new order; old order → COMPLETED |
| 8 | Different programs (same client) | Multiple orders with different package_id; same client_id | Fully supported |
| 9 | Participant history | participant_histories_pp append-only log of field changes | Fully supported |
| 10 | Payer ≠ participant | client_id on order, different participant_id in order_participants | Fully supported by nullable client_id on participants_pp |

### 7.3 ER Matrix Discrepancy — assessments_pp Primary FK

**Discrepancy identified and flagged:**

| Source | Field | Classification |
|--------|-------|---------------|
| ER Matrix Section 3.1 (high-level ER diagram) | assessments_pp links to participants_pp.id | Implied required FK |
| Batch 2B Section 4.3 text spec | assessments_pp.client_id FK → clients(id) | Required FK per text |
| ER Matrix Section 6.15 field table | participant_id FK → participants_pp.id | REQUIRED |

**Resolution:** The ER Matrix Section 6.15 field classification table is the most authoritative (detailed, explicitly classified). The assessment primary FK is `participant_id` (→ `participants_pp.id`), NOT `client_id`. The Batch 2B text spec reference to `client_id` was a documentation inconsistency.

**Consequence:** When recording an assessment, a Participant record must exist first. You cannot record an assessment for a client directly — you must create a participant record for them first (even if the participant IS the client). This is architecturally clean: assessments track physical data about the training person, not the billing person.

**Engineering action required:** The Phase 2B migration `003_create_participant_assessment.sql` must reflect `assessments_pp.participant_id FK → participants_pp.id` (required, not nullable) and `assessments_pp.order_id FK → orders_pp.id` (nullable). Any service code referencing `client_id` as the assessment FK must be corrected.

---

## 8. Assessment Gate Architecture

### 8.1 Approved Architecture (OPEN-2B-04 = SCENARIO C)

See Section 2 for the full approved architecture. Key points for implementation:

- `order.service.activateOrder()` must NOT call `assessment.service.checkAssessmentExists()` — the gate is bypassed
- A separate `programReadiness.service.evaluate(orderId)` function computes readiness independently
- Program Module configuration determines whether assessment is required for readiness — this config lives in the `programs` table or a future `program_module_config` table (Phase 3)
- In Phase 2, the Program Module Assessment Gate defaults to: "assessment recommended, not required" for all PP programs EXCEPT modules where the Active Aging config explicitly requires a PASS result

### 8.2 Active Aging Module Boundary

**Non-negotiable architectural boundary:**
```
EFM CORE → PP CORE → PROGRAM MODULE → ACTIVE AGING
```

Active Aging rules that must NOT leak into PP Core:
- `active_aging_screen_result` (PASS / FLAGGED / REFERRED) logic must only execute when `programs.module = 'ACTIVE_AGING'` or when the order's package belongs to an Active Aging program
- A FLAGGED or REFERRED result from Active Aging screening does NOT automatically block any action at the PP Core layer — the blocking rule is an Active Aging Module rule enforced in the service layer via module config
- Active Aging assessment fields (`active_aging_applicable`, `active_aging_screen_result`, `active_aging_notes`) are stored in `assessments_pp` (Phase 2B) but evaluated only when the module context is Active Aging

### 8.3 Assessment Validity Window (OPEN-NEW-02)

**The Question:** If a client was assessed 6 months ago, does a new assessment need to be conducted before a new order?

**Current State:** No validity window is defined in any Phase 2 document. The schema has no `valid_until` or `expires_at` field on assessments_pp.

**Recommendation:** Deferred to Phase 3. In Phase 2, the system records assessments and tracks them per participant. Whether the most recent assessment is "current enough" to satisfy the Program Module Assessment Gate is a business rules question that requires Program Module configuration — which is Phase 3 work. In Phase 2, any completed assessment counts; validity enforcement is a Phase 3 feature flag.

**Exact owner decision sentence:**  
*"Approve / reject: Assessment validity window enforcement (limiting how old an assessment can be before requiring a new one) is deferred to Phase 3; in Phase 2, any recorded assessment satisfies the assessment gate if the Program Module Assessment Gate is configured to require one."*

---

## 9. Agreement / H&S Reconciliation

### 9.1 Gate Sequence

```
1. COMMERCIAL GATE   (Phase 2): Invoice paid → Order ACTIVE
2. LEGAL GATE        (Phase 3): Agreement signed → Legal commitment recorded
3. SAFETY GATE       (Phase 3): H&S acknowledged → Safety documentation on file
4. OPERATIONAL GATE  (Phase 2B/5): Assessment PASS (per module) + Assignment made → Program Ready → Sessions begin
```

Phase 2 implements Gate 1 (commercial) and the operational assessment sub-gate. Gates 2 and 3 are Phase 3 work.

### 9.2 Agreement Architecture (Phase 3 Reference)

From the Active Aging Agreement Architecture and the Pre-Coding Lock:
- Order is the transaction source — the Agreement references the Order
- Agreement is a contractual snapshot: immutable after signing
- `agreements_pp` FK → `orders_pp.id` (Phase 3 adds this FK to the orders_pp table as an extension)
- Payment status follows Order — paying an invoice advances the Order, not the Agreement
- Receipt is proof of a specific payment (per confirmed payment per OPEN-NEW-03)
- Agreement and onboarding documents follow the applicable transaction/payment stage — this means Agreement generation may be triggered after Order is ACTIVE (commercial gate cleared)

### 9.3 Receipt Generation Trigger (OPEN-NEW-03)

**The Question:** When exactly is a receipt generated — automatically upon payment confirmation, or manually by admin?

**Option A — Automatic:** `billing.service` generates the receipt immediately upon setting `payments_pp.status = CONFIRMED`. No human step. Receipt is guaranteed for every confirmed payment.

**Option B — Manual:** Admin explicitly triggers receipt generation after payment confirmation. Allows admin to review before issuing. Receipt may be delayed.

**Option C — Auto with Override:** System auto-generates receipt; admin may regenerate (new record with a note linking to original) if correction is needed. Original receipt remains immutable.

**Analysis:**
- The ER Matrix states: `receipts_pp.receipt_date` = `AUDIT` (system-set on generation) — this implies automatic generation
- All `receipts_pp` value fields are `SNAP` type — they copy from the confirmed payment at generation time; there are no user-supplied fields
- If receipt is automatic, the service flow is: confirm payment → update invoice status → generate receipt → emit audit event (single transaction)
- Manual receipt leaves a window where payment is confirmed but no receipt exists — this is an auditing gap

**Recommendation:** Option A — automatic receipt generation upon payment confirmation, within the same database transaction as the payment status update.

**Exact owner decision sentence:**  
*"Approve / reject: Receipt generation is automatic — billing.service generates the receipt record within the same transaction as payment confirmation; no manual receipt trigger is required; the receipt is system-generated and all fields are immutable snapshots."*

---

## 10. Commercial Snapshot Architecture

### 10.1 Snapshot Immutability

`order_commercial_snapshots` is WRITE-ONCE. This is a non-negotiable architectural constraint. The snapshot captures, at order creation time:

| Snapshot Field | Source | Why Immutable |
|---------------|--------|---------------|
| package_name | packages.name | Package name may be renamed later; Order must reflect name at purchase time |
| offering_name | offerings.name | Same |
| program_name | programs.name | Same |
| session_count | packages.session_count | Package may be restructured; Order locks in what was purchased |
| price_per_session | package_prices.price_per_session | Price may change; historical Order reflects purchase price |
| total_price | package_prices.total_price | Same |
| effective_price_date | package_prices.effective_from | Audit trail of which price version was used |

### 10.2 Package/Price Hierarchy

```
programs (1..N) → offerings (1..N) → packages (1..N) → package_prices
```

- `package_prices` is append-only: a price change creates a new row, never updates the old one
- At any moment, exactly one `package_prices` row per package should have `effective_to IS NULL` (the active price)
- The UNIQUE partial index enforces: UNIQUE(package_id) WHERE effective_to IS NULL

### 10.3 PP Standard Packages (Authoritative — Phase 2 Catalog Seed Data)

| Package | session_count | price_per_session | total_price |
|---------|--------------|-------------------|-------------|
| 4 Sesi - Starter | 4 | Rp 200,000 | Rp 800,000 |
| 8 Sesi - Base | 8 | Rp 200,000 | Rp 1,600,000 |
| 12 Sesi - Pro | 12 | Rp 200,000 | Rp 2,400,000 |
| 24 Sesi - Elite | 24 | Rp 200,000 | Rp 4,800,000 |

These prices are the Phase 2 seed data. No legacy price data is imported. The catalog starts fresh.

### 10.4 Discount/Promo Architecture (OPEN-2A-04)

**Current Schema:** `invoices_pp` has `discount_amount` (USR field) and by extension would benefit from a `discount_code` field for traceability.

**Option A — Simple Discount Field:** Store discount_code (text) and discount_amount on the invoice. No separate `discount_codes` or `promotions` table in Phase 2. Admin manually enters the discount amount. Promo tracking is manual.

**Option B — Discount Code Table:** `discount_codes_pp` table with code, percentage or fixed amount, valid_from, valid_to, usage_limit. Invoice records `applied_discount_code_id FK`. Promo management via admin UI.

**Recommendation:** Option A for Phase 2. The Phase 2 invoice already has `discount_amount`. Add a `discount_code` (text, nullable, USR) field to `invoices_pp` to capture what code was used. A full promo entity is Phase 3 or Phase 6 work.

**Exact owner decision sentence:**  
*"Approve / reject: Phase 2 invoice discount handling stores discount_amount and discount_code (text) directly on the invoice; no separate discount_codes table is created in Phase 2; promo entity management is deferred to Phase 3."*

---

## 11. Future Program Compatibility

### 11.1 PP Core Must Remain Generic

The following PP Core architectural decisions must remain valid for ALL current and future PP program modules:

| Program Module | Assessment Required? | Group Training? | Couple Training? | Active Aging Gate? |
|----------------|---------------------|-----------------|-----------------|-------------------|
| Private Training (general) | Recommended, not required | No | No | No |
| Active Aging | Required (PASS gate) | Small group possible | No | YES |
| Corrective Exercise | Required | No | No | No |
| Fatloss & BodyShape | Recommended | No | No | No |
| Sport Training | Optional | No | No | No |

### 11.2 PP Core Invariants

These rules must hold for all program modules — they are PP Core, not module-specific:

1. One Order → One Commercial Snapshot (WRITE-ONCE)
2. One Invoice per Order (soft rule; re-invoice on CANCELLED is policy)
3. One Receipt per Confirmed Payment
4. Assessment is independent of Order ACTIVE (APPROVED SPLIT GATE)
5. Order status, Invoice status, Payment status, Program Readiness are all separate dimensions

### 11.3 B2B Event and B2B Management Compatibility

Phase 2 architecture documents are explicitly PP-scoped. The entity naming (`_pp` suffix), ID formats (`PP-YY-xxxx`), and service modules (`order.service` for PP) do not conflict with future B2B implementation because each module will have its own tables and services.

The architectural patterns established in Phase 2 PP become templates for:
- B2B Management: `orders_b2b`, `invoices_b2b`, `payments_b2b` — same pattern, different module context
- B2B Event: `orders_ev`, `invoices_ev`, `payments_ev` — same pattern

The `programs`, `offerings`, `packages`, `package_prices` tables are designed as MODULE-AGNOSTIC catalog tables (not PP-suffixed) — they will hold PP, B2B, and Event offerings when those modules are implemented.

---

## 12. Owner Decision Matrix

Complete matrix of all 12 decisions with recommended resolutions.

| Decision ID | Subject | Proposed Resolution | Owner Status | Classification |
|-------------|---------|---------------------|-------------|----------------|
| **OPEN-2B-04** | **Assessment Gate (Split Gate)** | **Scenario C: Commercial ACTIVE independent of Program Readiness** | **APPROVED** | E. Already Approved |
| OPEN-2A-01 | Client ID format | `CLT-YY-xxxx` via `id_sequences` (new DOCTYPE: CLIENT, module: PP) | PENDING | B. Owner Should Decide Before Schema Lock |
| OPEN-2A-02 | Payment ID format | `PAY-PP-YY-xxxx` via `id_sequences` (new DOCTYPE: PAYMENT, module: PP) | PENDING | C. Engineering Can Decide |
| OPEN-2A-03 | Partial payments policy | Allow multiple payments per invoice; Order ACTIVE only when total paid = final_amount | PENDING | A. Owner Must Decide Before Coding |
| OPEN-2A-04 | Promo/discount entity scope | Add `discount_code` text field to invoice; no separate table in Phase 2 | PENDING | B. Owner Should Decide Before Schema Lock |
| OPEN-2A-05 | Quotation entity phase | Defer to Phase 3 or Phase 6; not needed for Phase 2 | PENDING | D. Can Be Deferred |
| OPEN-2B-01 | Group participant capacity | Phase 2: max 1 participant per PP order (solo only); couple/group deferred to Phase 3 | PENDING | A. Owner Must Decide Before Coding |
| OPEN-2B-02 | Participant ID format | `PTN-YY-xxxx` via `id_sequences` (new DOCTYPE: PARTICIPANT, module: PP) | PENDING | B. Owner Should Decide Before Schema Lock |
| OPEN-2B-03 | Assessment data structure | Option C: structured columns + optional `extra_data` JSONB (already applied in ER Matrix 6.15) | PENDING | C. Engineering Can Decide |
| OPEN-NEW-01 | Refund entity in Phase 2 | Include `refunds_pp` in Phase 2B; append-only; one refund per payment | PENDING | A. Owner Must Decide Before Coding |
| OPEN-NEW-02 | Assessment validity window | Defer to Phase 3; any recorded assessment counts in Phase 2 | PENDING | D. Can Be Deferred |
| OPEN-NEW-03 | Receipt generation trigger | Automatic on payment confirmation (same transaction) | PENDING | B. Owner Should Decide Before Schema Lock |

---

## 13. Engineering Decisions

The following decisions do not require owner input — engineering can decide based on existing architecture constraints and Phase 1 patterns.

### OPEN-2A-02 — Payment ID Format

**Recommendation:** `PAY-PP-YY-xxxx` using the existing `id.generator.js` infrastructure. This requires adding a new docType entry: `PAYMENT` with module `PP`. This is consistent with all other PP document IDs and provides a human-readable audit trail.

**Alternative:** UUID (internal only). This avoids adding to `id_sequences` but produces non-human-readable IDs that make debugging harder.

**Engineering decision:** `PAY-PP-YY-xxxx`. Consistent with project pattern. Add `PAYMENT` docType to `id.generator.js` during Phase 2A implementation.

### OPEN-2B-03 — Assessment Data Structure

**Recommendation:** Option C (already reflected in ER Matrix Section 6.15): structured columns for all known measurement types (Tanita body composition, girth measurements, fitness tests) + `extra_data JSONB` for module-specific or non-standard fields. Active Aging fields (`active_aging_applicable`, `active_aging_screen_result`, `active_aging_notes`) are stored as nullable columns but only populated when the Program Module is Active Aging.

**Engineering decision:** Implement exactly as documented in ER Matrix Section 6.15. No further design needed.

### assessments_pp Primary FK Discrepancy

**Engineering decision:** As resolved in Section 7.3 — `assessments_pp.participant_id FK → participants_pp.id` (REQUIRED). The Batch 2B text reference to `client_id` as the assessment FK is a documentation error. Implementation must use `participant_id`. Any code or migration referencing `client_id` as the assessment FK must be corrected before Phase 2B implementation begins.

### id_sequences Additions Required

To support the recommended ID formats, three new docType entries must be added to `id_sequences` (and to `id.generator.js`):

| New DocType | Module | Format | Phase |
|-------------|--------|--------|-------|
| CLIENT | PP | CLT-YY-xxxx | 2A (if OPEN-2A-01 approved) |
| PAYMENT | PP | PAY-PP-YY-xxxx | 2A |
| PARTICIPANT | PP | PTN-YY-xxxx | 2B (if OPEN-2B-02 approved) |

These are schema additions only, not application logic changes.

---

## 14. Deferred Decisions

The following decisions can be safely deferred beyond Phase 2 without blocking Phase 2 coding.

| Decision | Rationale for Deferral | Deferred To |
|---------|------------------------|-------------|
| OPEN-2A-05: Quotation entity | No quotation required in current PP workflow; leads go straight to order creation | Phase 3 or 6 |
| OPEN-NEW-02: Assessment validity window | Requires Program Module configuration framework (Phase 3); in Phase 2 any assessment counts | Phase 3 |
| Agreement immutability enforcement | `agreements_pp` table not created until Phase 3 | Phase 3 |
| H&S gate enforcement | `health_and_safety_pp` table not created until Phase 3 | Phase 3 |
| Session attendance tracking | `sessions_pp` and `attendance_pp` not created until Phase 5 | Phase 5 |
| Couple/Group capacity enforcement (if OPEN-2B-01 deferred) | Schema supports N participants; capacity enforcement deferred to Phase 3 catalog extension | Phase 3 |
| Partial refund calculation (OPEN-NEW-01 Option C) | Requires session attendance data (Phase 5) to calculate sessions consumed | Phase 5 |
| Assessment validity enforcement (OPEN-NEW-02) | Requires Program Module config framework | Phase 3 |

---

## 15. True Coding Blockers

The following items are TRUE BLOCKERS — Phase 2 coding cannot begin until these are resolved. All other open decisions can be made in parallel with early implementation work but must be locked before the affected service is coded.

### BLOCKER 1: OPEN-2A-03 (Partial Payments Policy)

**Blocks:** `billing.service`, `invoice.service` (status machine), `payments_pp` validation logic, `invoices_pp` status transition logic

**Why:** The service layer must know at design time whether to implement PARTIALLY_PAID status, running balance tracking, and multi-payment-per-invoice logic. If this is not decided before billing.service is coded, the implementation will be wrong and require a rewrite.

**Resolution:** Owner approves or rejects partial payments (recommend Option B). This decision informs the entire billing service design.

---

### BLOCKER 2: OPEN-2B-01 (Group Participant Capacity)

**Blocks:** `order.service` (participant validation at order creation), `participant.service` (add-participant-to-order endpoint)

**Why:** The capacity enforcement logic runs during participant registration on an order. If the answer is "Phase 2 = solo only (max 1)", the service code is simpler and validated earlier. If the answer is "Phase 2 supports couple/group", the validation logic, error messages, and schema capacity fields must be added before coding begins.

**Resolution:** Owner confirms whether Phase 2 PP supports solo-only (recommended) or couple/group.

---

### BLOCKER 3: OPEN-NEW-01 (Refund Entity)

**Blocks:** `billing.service` (cancellation flow), `order.service` (cancellation transition), cancellation API endpoint

**Why:** When `order.service.cancelOrder()` is implemented, it must know whether to create a refund record, and if so, which table/entity handles it. If `refunds_pp` is not in scope, the cancel flow must document that refunds are handled outside the system. If it IS in scope, the migration must include the table and the service must implement the refund record creation.

**Resolution:** Owner approves or rejects inclusion of `refunds_pp` in Phase 2B (recommend Option B — include it).

---

### BLOCKER 4: assessments_pp FK Discrepancy (Engineering Blocker — No Owner Decision Needed)

**Blocks:** Phase 2B migration `003_create_participant_assessment.sql`, `assessment.service` implementation

**Why:** The ER Matrix has an internal inconsistency on the primary FK of `assessments_pp`. This document resolves it (Section 7.3): `participant_id FK → participants_pp.id` is REQUIRED. But this resolution must be formally acknowledged and reflected in a corrected architecture document or a migration comment before Phase 2B coding begins.

**Resolution:** Engineering confirms the ER Matrix Section 6.15 field table takes precedence over the Batch 2B text spec reference. The Batch 2B Lock document should be annotated with an erratum noting: "`assessments_pp` primary FK is `participant_id → participants_pp.id` (not `client_id → clients.id`). See ER Matrix v1.0 Section 6.15 for the authoritative field spec."

---

### NON-BLOCKERS (Decisions Needed But Not Day-1 Blockers)

These decisions must be made before the affected entity's service is coded, but do not block Phase 2A from beginning:

| Decision | Can Code Until... | Affected Service |
|---------|------------------|-----------------|
| OPEN-2A-01 (Client ID) | Before client.service is implemented | client.service |
| OPEN-2A-04 (Discount scope) | Before invoice.service handles discounts | invoice.service |
| OPEN-NEW-03 (Receipt trigger) | Before billing.service receipt generation | billing.service |
| OPEN-2B-02 (Participant ID) | Before participant.service is implemented | participant.service |

---

## 16. Final Phase 2 Readiness Assessment

### Architecture Lock Status

| Document | Status |
|---------|--------|
| Batch 2A Commercial Core Lock v1.0 | LOCKED FOR REVIEW |
| Batch 2B Participant Assessment Lock v1.0 | LOCKED FOR REVIEW |
| Cross-Batch Architecture Reconciliation v1.0 | LOCKED FOR REVIEW |
| Entity Relationship & Source of Truth Matrix v1.0 | LOCKED FOR REVIEW |
| Owner Decision Review Pack v1.0 | PENDING OWNER REVIEW |
| **Final Owner Decision Matrix v1.0 (this document)** | **PENDING OWNER REVIEW** |

### Decision Resolution Status

| Category | Count | Status |
|---------|-------|--------|
| Owner-Approved Decisions | 1 | OPEN-2B-04 ✅ |
| Critical Blockers (must resolve before any coding) | 3 | OPEN-2A-03, OPEN-2B-01, OPEN-NEW-01 |
| Engineering-Resolvable Blockers | 1 | assessments_pp FK discrepancy |
| Owner-Should-Decide (before schema lock) | 5 | OPEN-2A-01, OPEN-2A-04, OPEN-NEW-02, OPEN-NEW-03, OPEN-2B-02 |
| Engineering-Can-Decide | 2 | OPEN-2A-02, OPEN-2B-03 |
| Deferred | 2 | OPEN-2A-05, OPEN-NEW-02 |

### Phase 2 Coding Start Condition

**Phase 2 coding may begin ONLY when:**

1. ✅ OPEN-2B-04 resolved (DONE — Split Gate approved)
2. ⬜ OPEN-2A-03 resolved (Partial payments policy — owner decision)
3. ⬜ OPEN-2B-01 resolved (Group participant capacity — owner decision)
4. ⬜ OPEN-NEW-01 resolved (Refund entity — owner decision)
5. ⬜ assessments_pp FK discrepancy acknowledged in writing (engineering action)
6. ⬜ OPEN-2A-01, OPEN-2A-02, OPEN-2B-02 resolved (ID formats — can be resolved quickly)

**Estimated time to unblock (if owner is available):** All 3 owner decisions above can be made in a single review session. They are presented with clear options and recommendations in Sections 4 and 12.

### Three Questions for the Owner

The owner needs to answer exactly three questions to unblock Phase 2:

> **Q1 (OPEN-2A-03 — Partial Payments):**  
> "Approve / reject: Partial payments are allowed — multiple confirmed payments may be recorded against one invoice; Order transitions to ACTIVE only when total confirmed payments equal the full invoice final_amount; a receipt is issued for each confirmed payment."

> **Q2 (OPEN-2B-01 — Group Participant Capacity):**  
> "Approve / reject: Phase 2 PP orders support exactly 1 participant per order; the service validates max 1 participant at order creation; couple and group participant linking is deferred to Phase 3."

> **Q3 (OPEN-NEW-01 — Refund Entity):**  
> "Approve / reject: A `refunds_pp` table is included in Phase 2B with fields: id, payment_id (unique FK), refund_amount, reason, refunded_by, refunded_at, reference; the table is append-only and records one refund per confirmed payment; partial refunds are deferred to Phase 3."

### What This Document Does NOT Unlock

This document is analysis and decision synthesis ONLY. It does NOT:
- Modify any application source code
- Create any database migration
- Modify the PostgreSQL schema
- Create any API implementation
- Create any frontend implementation

Phase 2 coding begins ONLY after the owner resolves the three questions above and those resolutions are recorded in an updated version of this document.

---

*EFM PP Phase 2 — Final Owner Decision Matrix v1.0*  
*Prepared: 2026-09-29*  
*Authority Level: Analysis Document — PENDING OWNER APPROVAL*  
*Source Documents: 5 Phase 2 Architecture documents, Pre-Coding Lock v1.0*  
*Next Action: Owner to answer three questions in Section 16; Phase 2 coding conditional on answers*
