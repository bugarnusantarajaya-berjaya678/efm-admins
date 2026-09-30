# EFM PP — OPEN-2A-03 Final Payment Policy Consolidation v1.0

**Document Class:** Architecture Consolidation — Analysis Only  
**Module:** PP (Private Program)  
**Decision ID:** OPEN-2A-03 (consolidated scope)  
**Phase:** Phase 2 — Pre-Coding Lock  
**Status:** PENDING OWNER DECISION  
**Created:** 2026-09-29  
**Supersedes (for consolidation purposes):**
- `EFM_PP_OPEN_2A_03_PARTIAL_PAYMENT_DECISION_ANALYSIS_v1.0.md`
- `EFM_PP_OPEN_2A_03_PARTIAL_PAYMENT_DECISION_ANALYSIS_v1.1.md`
- `EFM_PP_OPEN_2A_03_PAYMENT_TO_PROGRAM_READINESS_DECISION_v1.0.md`
- `EFM_PP_OPEN_2A_03_PAYMENT_DEADLINE_URGENT_ORDER_POLICY_ANALYSIS_v1.0.md`

**Important:** This document consolidates analysis from all four predecessor documents plus a cross-document consistency audit. Predecessor documents remain in place as traceable history. This document is the single authoritative source for the final OPEN-2A-03 decision set.

---

## OWNER DECISION STATUS

| Sub-Decision | ID | Status |
|---|---|---|
| PP uses full payment only | OPEN-2A-03-A | PROPOSED — owner business input received; formal APPROVE pending |
| Payment before Program Readiness | OPEN-2A-03-B | PROPOSED — derived from owner input; formal APPROVE pending |
| Normal payment deadline (H-value) | OPEN-2A-03-C | PENDING — no owner input received |
| H-1 / urgent order policy | OPEN-2A-03-D | PENDING — no owner input received |
| Urgent order approval authority | OPEN-2A-03-E | PENDING — no owner input received |
| Overdue / expiry behavior | OPEN-2A-03-F | PENDING — no owner input received |

**Formal APPROVE/REJECT sentences for all six sub-decisions are in Section 13.**

---

## Section 1 — Executive Summary

OPEN-2A-03 was originally scoped as the "partial payments policy" question. Through three successive analysis documents, the question evolved and expanded. This consolidation captures the full scope of what must be resolved under the OPEN-2A-03 umbrella before Phase 2 coding can begin.

### What has been established (owner business input received)

1. **PP uses full payment only.** The owner has stated that PP does not use DP, does not use installment payments, and that the standard PP model is full payment. This is recorded in `OPEN_2A_03_PARTIAL_PAYMENT_DECISION_ANALYSIS_v1.1.md`.

2. **Payment must be confirmed before formal Program Readiness.** The owner has stated: "EFM should not normally start delivering PP sessions while the invoice remains unpaid." This means `invoices_pp.status = PAID` is the gate for Program Readiness. Recorded in `OPEN_2A_03_PAYMENT_TO_PROGRAM_READINESS_DECISION_v1.0.md`.

3. **Billing Core vs Business Policy separation.** PP's full-payment rule is a business model policy enforced at the service layer (Gate 03A, Gate 03B), not a schema constraint. Future modules (B2B Event, B2B Management) can implement different payment patterns without touching PP architecture or schema.

### What remains unresolved

4. **When is payment due?** No specific H-value has been decided (H-2? H-3?). The uploaded analysis document establishes that a dynamic deadline model is needed and that H-1 / urgent orders must have their own workflow.

5. **How are urgent orders handled?** H-1 and sub-24-hour orders occur in the PP business. These must not be automatically rejected because the normal deadline has already passed. A dedicated urgent-order path is needed, but the exact policy (approval authority, payment window, operational confirmation) requires owner input.

6. **What happens when payment is not received by the deadline?** The behavior after overdue — auto-cancel, auto-expire, manual follow-up — has not been decided.

### Cross-document contradiction identified

The `EFM_PP_PHASE_2_FINAL_OWNER_DECISION_MATRIX_v1.0.md` (Section 4, OPEN-2A-03) recommends "Allow multiple payments per invoice" (Option B — partial payments). This recommendation was based on architecture analysis before the owner's business input was recorded. The owner's subsequent input in `v1.1` ("PP uses FULL PAYMENT, no DP, no installment as standard") directly contradicts Option B. The v1.1 document was created after the Decision Matrix and records actual owner business input — it therefore supersedes the Decision Matrix recommendation. **The Decision Matrix's OPEN-2A-03 recommendation is now outdated and must not be used as the current recommendation.** The updated recommendation for OPEN-2A-03-A is: PP = single full payment only. See Section 14 for the full contradiction register.

### OPEN-2A-03 lock readiness

OPEN-2A-03 is **NOT READY TO LOCK**. Sub-decisions A and B are close (owner business input received, formal stamp pending). Sub-decisions C through F are pending with no owner input.

---

## Section 2 — Established Decisions (Locked in Principle)

These decisions are based on explicit owner business input recorded in predecessor documents. They are "PROPOSED" rather than "LOCKED" only because the formal APPROVE stamp has not been given. The architecture is designed around them.

### 2.1 PP Full Payment Policy (OPEN-2A-03-A)

**Architecture:** PP accepts one payment per invoice. That payment must equal `invoices_pp.final_amount` within tolerance.

**Gate 03A (PP service layer):**
```
payment.amount = invoice.final_amount ± tolerance
```
If this condition is not met, the payment confirmation is rejected with a validation error. No partial amount is accepted.

**Gate 03B (PP service layer):**
```
invoices_pp must not already have a CONFIRMED payment
```
If a CONFIRMED payment record already exists for this invoice, a second payment confirmation is rejected. One confirmed payment per PP invoice, maximum.

**What this does NOT prohibit:**
- Multiple PENDING payment attempts (a client may submit payment information more than once; only the first confirmed counts)
- A REJECTED payment followed by a new PENDING payment (the client may retry)

**Schema impact:** None. Gate 03A and Gate 03B are service-layer validations. `invoices_pp.status` transitions are:
```
DRAFT → SENT → PAID (on single full confirmed payment)
                         ↳ OVERDUE (if due_date passes with no PAID)
                         ↳ CANCELLED (on order cancellation)
```
`PARTIALLY_PAID` status does NOT exist for PP invoices. It may exist for B2B Event (Phase 3) in the future, but it is not in the PP invoice status state machine.

**Owner business input (verbatim, from v1.1):**
> "PP / Personal Program: Standard payment is FULL PAYMENT. No DP. No installment payment as the standard PP commercial model."

---

### 2.2 Payment Before Program Readiness (OPEN-2A-03-B)

**Architecture:** `invoices_pp.status = PAID` is a mandatory gate for Program Readiness. No formal program operations can begin in the system until the invoice is paid.

**Program Readiness derivation rule (Phase 2):**
```
Program Readiness = ELIGIBLE
  WHEN orders_pp.status = ACTIVE
  AND  invoices_pp.status = PAID
```

**Program Readiness derivation rule (Phase 5 additions):**
```
Program Readiness = ELIGIBLE
  WHEN orders_pp.status = ACTIVE
  AND  invoices_pp.status = PAID
  AND  assignments_pp.status = CONFIRMED (at least one)
  AND  sessions_pp records exist for this order
```

**What is blocked until Invoice PAID:**
- Formal trainer assignment records (`assignments_pp`) — Phase 5
- Session records (`sessions_pp`) — Phase 5
- Session delivery and attendance recording — Phase 5

**What is NOT blocked by Invoice PAID:**
- Agreement generation and signing — follows Order ACTIVE, not Invoice PAID (Phase 3)
- Informal off-system coordination (admin discusses trainer options / proposes schedule with client before payment)

**Schema impact:** None. Program Readiness is derived, not stored.

**Owner business input (verbatim, from SUB-01 requirement):**
> "EFM should not normally start delivering PP sessions while the invoice remains unpaid."

---

### 2.3 Billing Core vs Business Policy Separation

This is an architectural invariant, not a decision pending approval.

```
BILLING CORE (capability)
     │
     ├── PP Policy:
     │     Gate 03A: single full payment
     │     Gate 03B: one confirmed payment per invoice
     │
     ├── B2B Event Policy (Phase 3, future):
     │     DP + settlement = multiple invoices per milestone
     │
     └── B2B Management Policy (Phase 4+, future):
           Contractual term payments = contract entity + scheduled invoices
```

PP gates are enforced at `billing.service` PP-specific validation. They are NOT global schema constraints. B2B modules will have their own service-layer policies without touching PP code.

---

### 2.4 OPEN-2B-04 Split Gate (APPROVED)

Order commercial activation (ACTIVE) and Program Readiness are independent concepts. Assessment is not a gate for Order ACTIVE. Commercial and operational lifecycles are separate.

This is already APPROVED — it is included here for completeness because it interacts with the Program Readiness gate.

---

## Section 3 — Payment Deadline Architecture

### 3.1 The Three Concepts

These three concepts are SEPARATE and must not be collapsed into a single rule:

| Concept | Question it answers | Who it gates |
|---|---|---|
| **Payment Due Date** | By when must payment be received for a normal order? | Invoice status → OVERDUE; Order → EXPIRED (if policy) |
| **Order Acceptance Cutoff** | How close to program start can an order still enter the normal workflow? | Whether the order is classified NORMAL, SHORT_LEAD, or URGENT |
| **Program Readiness Gate** | Has full payment been confirmed? | Formal assignment and session records (Phase 5) |

A client who places an order 1 hour before the program starts is still a valid order if payment is confirmed. The program readiness gate (Invoice PAID) still holds. The order is simply classified URGENT rather than going through the normal H-7 → invoice → H-3 payment → ACTIVE flow.

### 3.2 Order Timing Classification

Based on `order_lead_time = program_start_date - order_created_at`:

| Lead Time | Classification | Payment Deadline Behavior |
|---|---|---|
| ≥ H-5 (5 days or more) | NORMAL | Standard configurable payment deadline applies |
| H-4 to H-3 | SHORT_LEAD | Shortened payment window; standard deadline may not fit |
| H-2 | SHORT_LEAD | Near-immediate payment required; normal H-2/H-3 deadline is at the boundary |
| H-1 | URGENT | Immediate payment required; operational availability must be confirmed |
| < 24 hours (but > 0) | URGENT | Immediate payment + explicit operational confirmation |
| Same-day (≤ 2–3 hours) | URGENT (extreme) | Immediate payment + explicit admin confirmation that trainer is available |

**H = days before program start date.** H-1 means the order arrives on the day before the program is scheduled to begin. H-2 means two days before. "< 24 hours" refers to wall-clock time, not business days.

**These H-values are examples.** The exact threshold between NORMAL and SHORT_LEAD, and between SHORT_LEAD and URGENT, are owner decisions (OPEN-2A-03-C and OPEN-2A-03-D).

### 3.3 Dynamic Due Date Model

A fixed due date rule such as `due_date = start_date - 2 days` breaks when an order is placed at H-1. The system should compute `invoices_pp.due_date` dynamically at invoice creation time:

```
function computeDueDate(order):
  lead_time = order.start_date - NOW()
  
  if lead_time >= NORMAL_THRESHOLD:
    due_date = order.start_date - NORMAL_PAYMENT_DAYS   # e.g. H-2 or H-3
    
  elif lead_time >= SHORT_LEAD_THRESHOLD:
    due_date = NOW() + SHORT_LEAD_PAYMENT_WINDOW        # e.g. +4 hours or +12 hours
    
  else: # URGENT
    due_date = NOW() + URGENT_PAYMENT_WINDOW            # e.g. +1 hour or +30 min
```

The configurable values (`NORMAL_PAYMENT_DAYS`, `SHORT_LEAD_PAYMENT_WINDOW`, `URGENT_PAYMENT_WINDOW`) are stored as application configuration (not schema data). The `invoices_pp.due_date` field already exists — the dynamic calculation is a service-layer behavior.

**Schema impact of dynamic due date model:** None. `invoices_pp.due_date` already exists as a settable field. The computation logic is in `billing.service` or `invoice.service`.

### 3.4 Order Urgency Classification — Schema Analysis

**Question:** Does the system need a stored urgency classification field on `orders_pp`?

**Analysis:**

The urgency classification can be derived from `orders_pp.start_date` and `orders_pp.created_at` (or `invoices_pp.created_at`) at any time. No stored field is strictly necessary for runtime behavior.

However, for audit, reporting, and admin review purposes, a stored `urgency_classification` field provides:
- Clear indication of how the order was processed at the time of creation
- Ability to report: "X urgent orders in the last 30 days"
- Ability to enforce different admin workflows based on classification (e.g., require explicit confirmation for URGENT orders)

**Minimum viable approach (no schema change):**
- Urgency is derived at order creation and drives the `due_date` calculation
- No stored classification field
- Reporting on urgent orders requires computing lead time from existing dates
- Admin follows a manual urgent workflow (outside the system)

**Enhanced approach (minimal schema addition):**
- Add `urgency_classification` ENUM (NORMAL / SHORT_LEAD / URGENT) to `orders_pp`, set at order creation
- Add `urgent_reason` TEXT (nullable) for admin to record why the urgent order was accepted
- Add `urgent_approved_by` FK → `users.id` (nullable) if urgent approval is required
- This adds 2–3 nullable columns to an existing table — not a new entity

**Recommendation:** The minimum viable approach is sufficient if urgent approval is NOT required (admin can process urgent orders without explicit system-level approval). If OPEN-2A-03-E (urgent approval authority) is answered as "yes, approval is required," then at minimum `urgent_approved_by` should be added.

**The schema addition question is DEFERRED** to the owner decision on OPEN-2A-03-E (Section 13).

---

## Section 4 — Normal Order Policy

### 4.1 Definition

A NORMAL order is placed sufficiently ahead of the program start date that the standard payment deadline applies. The standard deadline gives the client reasonable time to arrange payment after receiving the invoice.

### 4.2 Proposed Normal Order Flow

```
Admin creates Order (DRAFT)
     │
     ▼
Invoice generated (DRAFT → SENT)
due_date computed: start_date − NORMAL_PAYMENT_DAYS
     │
     ▼
Client reviews and pays (payment.status: PENDING → CONFIRMED)
     │ [Gate 03A: full amount; Gate 03B: first confirmed payment]
     ▼
Invoice: SENT → PAID
Order: → ACTIVE
Receipt generated (automatic)
     │
     ▼
Program Readiness: ELIGIBLE (Order ACTIVE + Invoice PAID)
     │
     ▼
[Phase 5] Trainer assignment, session scheduling, session delivery
```

### 4.3 What "Normal Payment Days" Means

`NORMAL_PAYMENT_DAYS` is the number of days before program start by which payment should be received. This value needs to be decided by the owner (OPEN-2A-03-C).

| Candidate | Implication |
|---|---|
| H-3 (3 days before start) | Client has 3 days from invoice to pay; admin has 2 days for trainer confirmation before start |
| H-2 (2 days before start) | Client has less time; tighter but still workable for most normal orders |
| H-1 (1 day before start) | Very short normal window; effectively any order placed H-5 or later has only 1 day to pay |

**Recommendation:** H-3 for normal orders (allows admin 2 days of preparation buffer after payment). But this is owner's decision.

### 4.4 What Happens to a Normal Order After Due Date

If `invoices_pp.due_date` passes with `invoices_pp.status ≠ PAID`:
- Invoice status: SENT → OVERDUE
- Order status: behavior pending (see Section 8 — Overdue / Expiry Behavior)

---

## Section 5 — Short-Lead Order Policy

### 5.1 Definition

A SHORT_LEAD order is placed close enough to program start that the normal deadline is compressed or already past. The order is still commercially viable — the client wants the program and is expected to pay quickly.

### 5.2 Short-Lead Flow

```
Admin creates Order (DRAFT) — SHORT_LEAD classification
     │
     ▼
Invoice generated (DRAFT → SENT)
due_date computed: NOW + SHORT_LEAD_PAYMENT_WINDOW (hours, not days)
     │
     ▼
Client pays promptly
     │ [Gates 03A + 03B still apply — full payment required]
     ▼
Invoice: PAID → Order: ACTIVE → Program Readiness: ELIGIBLE
```

### 5.3 Key Rule for Short-Lead Orders

The payment rule (full payment required) does NOT change for short-lead orders. What changes is the **time window** given to the client to pay.

Short-lead orders may trigger:
- A shorter-format invoice (all fields pre-populated, sent immediately)
- Faster admin follow-up for payment confirmation
- A notification or flag to admin that payment confirmation is time-sensitive

None of these require schema changes. They are operational/UX considerations.

### 5.4 Boundary Between Short-Lead and Urgent

The exact H-value boundary is owner's decision. Suggested default:
- SHORT_LEAD: H-3 to H-2 (order placed 2–3 days before start)
- URGENT: H-1 or less

---

## Section 6 — Urgent Order Policy

### 6.1 Why Urgent Orders Must Not Be Automatically Rejected

A fixed normal due date (e.g. H-2) creates a hard edge:

```
❌ WRONG APPROACH:
normal due_date = start_date − 2 days
Order placed H-1
→ due_date is already in the past
→ System rejects or auto-expires order
→ Legitimate client lost
```

This is commercially unacceptable. PP clients may legitimately book same-day or next-day sessions (trainer availability permitting). The system must accommodate this.

### 6.2 Recommended Urgent Order Flow

```
Order placed H-1 (or < 24 hours before start)
     │
     ▼
URGENT classification (derived from lead_time)
     │
     ▼
Operational availability check
(Admin confirms trainer is available for the requested time)
     │
     ▼
Invoice generated (SENT) with URGENT due_date
(e.g. due_date = NOW + 1 hour, or same-day, owner decides)
     │
     ▼
Client pays (immediate / near-immediate)
     │ [Gates 03A + 03B — full payment still required]
     ▼
Invoice: PAID → Order: ACTIVE → Program Readiness: ELIGIBLE
     │
     ▼
[Phase 5] Assignment, session, delivery
```

### 6.3 Key Rule for Urgent Orders

**The program readiness gate (Invoice PAID) does NOT change for urgent orders.** An urgent order still requires full payment before formal program operations begin. What changes is the timeline — the urgency makes everything happen faster, but the payment gate is not bypassed.

### 6.4 Does Urgent Order Require Explicit Admin Approval?

This is OPEN-2A-03-E (Section 13). The two options:

**Option: No approval required.** Admin creates the urgent order at their own discretion. The URGENT classification is recorded (if stored) but no approval step is needed. Admin is responsible for confirming trainer availability informally.

**Option: Explicit approval required.** An URGENT order requires a second admin (supervisor) to approve before the invoice is sent. This is a compliance/governance choice.

**Recommendation:** For Phase 2, no system-level approval step is required. Admin discretion is sufficient. An `urgent_reason` text field (if OPEN-2A-03-E is answered as "approval not required but reason required") gives minimum auditability. Full approval workflow is deferred to Phase 3 or later.

### 6.5 Operational Availability for Urgent Orders

Before creating an urgent order, admin must confirm:
1. A trainer is available at the requested time
2. The facility is available (if relevant)
3. The client understands the payment is due immediately

This confirmation is an admin responsibility, not a system constraint in Phase 2. In Phase 5, when `assignments_pp` is created, the assignment will reflect the actual trainer — the Phase 5 availability check is the system-level enforcement.

---

## Section 7 — Payment Deadline vs Order Cutoff vs Program Readiness

### 7.1 Formal Separation

| Concept | Defined by | Applied at | Can be bypassed? |
|---|---|---|---|
| **Payment Due Date** | `invoices_pp.due_date` (set at invoice creation based on lead time) | When invoice transitions from SENT → OVERDUE | No — system-enforced transition |
| **Order Acceptance Cutoff** | Business policy: what is the minimum lead time to accept a normal order? | When admin decides whether to process an urgent order | Yes — admin can choose to process urgent orders |
| **Program Readiness Gate** | `invoices_pp.status = PAID` | When Phase 5 entities (`assignments_pp`, `sessions_pp`) are created | No — system-enforced gate |

### 7.2 The Critical Insight

The payment deadline controls **when payment must arrive for the standard flow to work cleanly**.
The order acceptance cutoff controls **whether the admin chooses to accept an order placed very close to start**.
The program readiness gate controls **whether the system permits formal session operations**.

These interact but they are NOT the same constraint:
- An order placed H-1 may still be accepted (no hard cutoff — admin discretion)
- The invoice's due_date will be set to NOW + short window
- If payment is confirmed → Invoice PAID → Program Readiness ELIGIBLE
- The program readiness gate is always satisfied by Invoice PAID, regardless of when the order was placed

### 7.3 What Happens If Due Date Passes Without Payment

```
Invoice(SENT) → due_date passes without payment
     │
     ▼
Invoice(OVERDUE)
     │
     ▼
Order: remains ACTIVE? remains PENDING_PAYMENT? auto-EXPIRED?
     ↑
     └── OWNER DECISION OPEN-2A-03-F (see Section 13)
```

The Program Readiness gate remains: Invoice must reach PAID for the gate to open. An OVERDUE invoice is not PAID. Program Readiness remains NOT_ELIGIBLE until payment is confirmed (even if overdue).

### 7.4 Sequence Diagram for All Three Concepts

```
Timeline for a NORMAL order:

H-7: Order placed → DRAFT
H-7: Invoice generated → SENT; due_date = H-3
H-6 to H-4: Client arranges payment
H-3: Payment confirmed → Invoice PAID → Order ACTIVE
       ↑
       Payment Due Date (successful path)

H-3: Program Readiness = ELIGIBLE
H-0: Program starts
       ↑
       Program Readiness Gate cleared (H-3, 3 days before start)

---

Timeline for an URGENT order:

H-1 (9am): Order placed → DRAFT (URGENT classification)
H-1 (9am): Invoice generated → SENT; due_date = H-1 by 11am
H-1 (10am): Client pays → Invoice PAID → Order ACTIVE
       ↑
       Payment Due Date (compressed: 1 hour window)

H-1 (10am): Program Readiness = ELIGIBLE
H-0 (8am next day): Program starts
       ↑
       Program Readiness Gate cleared (22 hours before start)
```

---

## Section 8 — Overdue / Expired Payment Behavior

### 8.1 States After Due Date Passes Without Payment

When `invoices_pp.due_date < NOW()` and `invoices_pp.status ≠ PAID`:

| Invoice Status | Expected Transition | Trigger |
|---|---|---|
| SENT (due date not yet passed) | No change | — |
| SENT → OVERDUE | Scheduled job or API check triggers this | due_date passes |

When the invoice is OVERDUE:
- The order is still commercially "open" — the client has not paid but also has not cancelled
- Program Readiness remains NOT_ELIGIBLE (invoice is not PAID)
- Admin sees the order as requiring follow-up

### 8.2 Options for Order Behavior After Invoice OVERDUE

**Option A — Order stays in current status:** Order remains PENDING_PAYMENT (or DRAFT if invoice not yet sent). Admin must manually cancel if needed. No automated action.

**Option B — Order transitions to EXPIRED:** After a configurable grace period (e.g. 24–48 hours after due date), the order auto-transitions to EXPIRED. A scheduled background job executes this. Invoice is also transitioned to CANCELLED (or left as OVERDUE — owner decides).

**Option C — Admin notification + grace period:** System sends an alert to admin. After a configurable grace period with no payment, order enters a HOLD state (not EXPIRED, not CANCELLED) requiring explicit admin action.

**Recommendation:** Option A for Phase 2 (simplest; no scheduled job needed). Option B can be introduced in Phase 5 when the operations layer is implemented. In Phase 2, "overdue but not cancelled" is a valid state requiring admin follow-up. This is OPEN-2A-03-F (owner decides).

### 8.3 Can an Overdue Order Be Paid Late?

**Yes.** If the invoice is OVERDUE and the client then pays (payment confirmed, Gate 03A satisfied):
- Invoice transitions: OVERDUE → PAID
- Order transitions to ACTIVE
- Program Readiness becomes ELIGIBLE
- A receipt is generated

The late payment is recorded as-is. The system does not automatically apply late fees (Phase 2 scope). Whether a late fee is charged is a T&C matter, not a system enforcement in Phase 2.

### 8.4 EXPIRED vs CANCELLED

| Status | Meaning | Who triggers it | Financial impact |
|---|---|---|---|
| EXPIRED | Order's start date passed with no payment AND no explicit cancellation | Scheduled job (Phase 5) or admin action | No payment was received; no refund needed |
| CANCELLED | Admin explicitly cancels the order | Admin action | If payment was received, refund may be needed (`refunds_pp` — OPEN-NEW-01) |

---

## Section 9 — Admin Override / Urgent Approval

### 9.1 What Constitutes an Override?

An "override" in PP payment policy terms is any case where normal flow is departed:
1. Urgent order (H-1 or less) accepted despite short lead time
2. Late payment accepted after due date (already analyzed in Section 8.3 — this requires no special override, the system just accepts the payment)
3. A cancelled order restored to ACTIVE (not supported in Phase 2 — new order required)

For Phase 2, only type 1 (urgent order acceptance) is a meaningful override scenario.

### 9.2 Audit Requirements for Urgent Orders

Minimum auditability needed for urgent orders in Phase 2:

| Field | Stored where | Type | Purpose |
|---|---|---|---|
| Order creation timestamp | `orders_pp.created_at` | AUDIT (existing) | Allows lead time to be computed at any time |
| Program start date | `orders_pp.start_date` | USR (existing) | Required for lead time calculation |
| Invoice due date | `invoices_pp.due_date` | USR (set by service) | Documents that a compressed deadline was applied |
| Urgent reason (optional) | Candidate: `orders_pp.urgent_reason` TEXT | New nullable column | Human-readable note from admin |

These represent the minimum. The existing `orders_pp.created_at` + `orders_pp.start_date` allow any audit to retroactively compute that this was an urgent order (lead time < threshold). No new entity is required for minimum audit trail.

### 9.3 When a New Field IS Justified

A stored `urgency_classification` field (NORMAL / SHORT_LEAD / URGENT enum) is justified if:
- Reporting requires filtering by urgency without recomputing lead times on every query
- Admin UI needs to display urgency classification prominently at order view time
- Urgent orders must follow a different UI workflow (different buttons, different validation messages)

This is a reasonable Phase 2 addition (1 nullable column, no new table). It is included in the schema change assessment in Section 14 as a LOW-impact optional addition.

### 9.4 Formal Approval Workflow Assessment

A formal approval workflow (supervisor must approve before urgent order invoice is sent) is:
- Operationally sound for governance
- Complex to implement (requires user roles, approval queue, notification system)
- Not required for Phase 2 to function correctly
- Can be deferred to Phase 3 admin workflow layer

**Phase 2 recommendation:** No system-enforced approval workflow for urgent orders. Admin discretion + audit trail (timestamp + optional reason field). Phase 3 can add approval queue.

---

## Section 10 — Agreement vs T&C vs System Logic

### 10.1 The Three-Layer Distinction

| Layer | Governs | Source of truth | Changes how? |
|---|---|---|---|
| **Agreement** | Legal obligations of a specific Order — what EFM and the client commit to for this purchase | `agreements_pp` record (Phase 3) | Immutable after signing |
| **T&C / Program Rules** | Operational policy — payment deadlines, cancellation notice periods, late fees, urgent order handling | Program documentation / T&C document (current scope: out of system) | Updated by EFM business decision; applies to new orders after update date |
| **System Logic** | What the system enforces in code — gate validation, status transitions, automated generation | Service layer (`billing.service`, `order.service`, etc.) | Code change / configuration change |

### 10.2 Categorization Matrix

| Rule | Agreement | T&C / Program Rules | System Logic |
|---|---|---|---|
| PP uses full payment | No (billing rule) | YES — payment terms section | YES — Gate 03A |
| No DP allowed | No | YES — payment terms section | YES — Gate 03A (rejects partial) |
| Invoice must be PAID before program starts | No | YES — operational policy | YES — Program Readiness gate |
| Normal payment deadline (e.g. H-3) | YES (payment obligation dates) | YES (policy for new clients) | YES — `due_date` computation |
| Urgent order policy | No (specific to each order's terms) | YES — urgent order T&C | Partial — urgency classification + due_date |
| Late payment acceptance | No | YES — grace period policy | Partial — system allows payment after OVERDUE |
| Late fee amount | YES — if applicable to this order | YES — standard late fee policy | No (Phase 2: no automated late fee) |
| Agreement generation trigger | N/A | N/A | YES — Order ACTIVE triggers generation (Phase 3) |
| Agreement signing | YES — Agreement body contains signing clause | N/A | YES — `agreement.guard.js` enforces immutability after signing |
| Order cancellation terms | YES — cancellation clause | YES — cancellation policy | YES — `order.service.cancelOrder()` |
| Refund on cancellation | YES — refund clause | YES — refund policy | YES — `refunds_pp` record (OPEN-NEW-01) |
| Urgent order approval authority | No | YES — who can approve urgent orders | Partial (Phase 2: admin discretion; Phase 3: approval queue) |

### 10.3 Key Principle: T&C Rules Must Not Become Global System Logic

Per the existing architecture (Active Aging audit, Cross-Batch Reconciliation), PP-specific rules stay in the PP module. T&C content (e.g. "payment must be received 3 days before the program starts") is a T&C rule AND reflected in system logic as a configurable value — it is NOT hard-coded as a global system constraint.

### 10.4 Agreement Impact on Payment (Re-confirmed)

Agreement generation is gated on Order ACTIVE. Agreement is NOT gated on Invoice PAID. This is established architecture (Phase 3). This consolidation document does not change it.

The Agreement captures the payment obligation (the client commits to pay). The payment event itself (Invoice PAID) is a separate later event. Neither depends on the other for generation — they are independent events on the same Order.

---

## Section 11 — 3–5 Year Architecture Compatibility

### 11.1 PP Rules Will Not Block B2B Event

B2B Event (Phase 3) uses DP + settlement model. This is implemented as:
- Multiple invoices per order (one invoice per payment milestone, not one invoice with partial payments)
- Each B2B Event invoice is a standalone billing document
- Gate 03A and Gate 03B are PP-specific service validators — they do NOT apply to `invoices_b2b` or `invoices_ev`
- `billing.service` for B2B Event is a separate module or a separate path in the billing service

**PP schema fields that are PP-only and do not pollute B2B Event:**
- `invoices_pp.status` enum (no PARTIALLY_PAID for PP — B2B Event will have its own invoice status enum)
- `orders_pp.status` enum — B2B Event will have `orders_ev.status`
- Gate 03A/03B are service code in the PP billing path, not global validators

**Verification: B2B Event's DP invoice would pass B2B Event billing rules, not PP billing rules. There is zero interference.**

### 11.2 PP Rules Will Not Block B2B Management

B2B Management (Phase 4+) uses contractual term payments:
- 1, 3, 6, 9, or 12-month payment schedules
- Each billing period generates a `invoices_b2b` record
- A `contracts_b2b` entity (Phase 4) schedules invoice generation
- No connection to `invoices_pp` or PP billing service

**Verification: Contractual term payments for B2B Management involve entirely separate tables (`orders_b2b`, `invoices_b2b`, `contracts_b2b`) with their own service layer. PP architecture has zero interference.**

### 11.3 Urgent Order Classification (If Schema Field Added) — B2B Compatibility

If an `urgency_classification` field is added to `orders_pp`, it is a PP-specific field. Future B2B modules will have their own `orders_b2b` and `orders_ev` tables. The field does not bleed into other modules.

### 11.4 Dynamic Due Date Engine — B2B Compatibility

The dynamic due date calculation logic (Section 3.3) is a PP-specific service behavior. When B2B Event or B2B Management implements invoicing, they will have their own due date calculation logic (e.g., DP due immediately, settlement due 14 days after event). No conflict.

### 11.5 Confirmation: PP Payment Policy Is Stable for 3–5 Years

The PP payment policy (full payment, one invoice per order, one receipt per payment, program readiness gated on PAID) is:
- Expressed as service-layer code, not schema constraints
- Scoped to the `_pp` table namespace
- Independent of B2B module implementation
- Extensible within PP if future sub-modules need different policies (via service-layer module config)

**This architecture is stable and non-interfering for the 3–5 year horizon.**

---

## Section 12 — Scenario Matrix

For each scenario, the following dimensions are tracked. Phase 5 columns (assignment, session) are shown with their expected behavior once Phase 5 is implemented.

**Status values used:**
- **Order:** DRAFT / PENDING_PAYMENT / ACTIVE / COMPLETED / CANCELLED / EXPIRED
- **Invoice:** DRAFT / SENT / PAID / OVERDUE / CANCELLED
- **Payment:** (none) / PENDING / CONFIRMED / REJECTED
- **Program Readiness:** NOT_ELIGIBLE / ELIGIBLE
- **Assignment (Phase 5):** BLOCKED / ALLOWED
- **Session (Phase 5):** BLOCKED / ALLOWED
- **Expiry behavior:** per OPEN-2A-03-F (owner decision pending)

---

### Scenario A — H-5 Normal Order, Payment On Time

| Dimension | State |
|---|---|
| Order status | ACTIVE (after payment confirmed) |
| Invoice status | PAID |
| Payment requirement | Full payment by H-3 (or applicable NORMAL_PAYMENT_DAYS) |
| Program Readiness | ELIGIBLE |
| Assignment (Ph5) | ALLOWED |
| Session (Ph5) | ALLOWED |
| Expiry behavior | N/A — order completed normally |

**Notes:** Standard happy path. Admin places order at H-5. Invoice sent with due_date = H-3. Client pays on time. Invoice → PAID. Order → ACTIVE. Program can start.

---

### Scenario B — H-3 Order, Payment On Time

| Dimension | State |
|---|---|
| Order status | ACTIVE (after payment confirmed) |
| Invoice status | PAID |
| Payment requirement | Full payment very shortly after invoice (SHORT_LEAD window, e.g. 12–24 hours) |
| Program Readiness | ELIGIBLE |
| Assignment (Ph5) | ALLOWED |
| Session (Ph5) | ALLOWED |
| Expiry behavior | N/A |

**Notes:** SHORT_LEAD order. Invoice sent immediately upon order creation. `due_date` computed as `NOW + SHORT_LEAD_PAYMENT_WINDOW`. Client must pay quickly. Same gates apply — full payment required.

---

### Scenario C — H-2 Order, Payment Confirmed Same Day

| Dimension | State |
|---|---|
| Order status | ACTIVE |
| Invoice status | PAID |
| Payment requirement | Full payment within hours of invoice |
| Program Readiness | ELIGIBLE |
| Assignment (Ph5) | ALLOWED |
| Session (Ph5) | ALLOWED |
| Expiry behavior | N/A |

**Notes:** Boundary SHORT_LEAD / URGENT depending on exact threshold decision (OPEN-2A-03-D). Due date is compressed. Operational availability should be confirmed before order creation.

---

### Scenario D — H-1 Urgent Order, Payment Confirmed Within 1 Hour

| Dimension | State |
|---|---|
| Order status | ACTIVE (URGENT classification) |
| Invoice status | PAID |
| Payment requirement | Full payment within urgent window (e.g. 30–60 minutes) |
| Program Readiness | ELIGIBLE |
| Assignment (Ph5) | ALLOWED |
| Session (Ph5) | ALLOWED |
| Expiry behavior | N/A — order will complete normally |

**Notes:** URGENT classification. Admin confirms operational availability before creating order. Invoice sent immediately. Client pays promptly. Normal gates still apply — Invoice PAID before program readiness.

---

### Scenario E — <24-Hour Order, Payment Confirmed Before Session

| Dimension | State |
|---|---|
| Order status | ACTIVE (URGENT) |
| Invoice status | PAID |
| Payment requirement | Full payment before program starts (could be 2–3 hours window) |
| Program Readiness | ELIGIBLE |
| Assignment (Ph5) | ALLOWED |
| Session (Ph5) | ALLOWED |
| Expiry behavior | N/A |

**Notes:** Same as Scenario D but even shorter lead. Admin must have high confidence in both client payment intent and trainer availability before creating this order.

---

### Scenario F — Same-Day Order (Program Starts in <3 Hours)

| Dimension | State |
|---|---|
| Order status | DRAFT / PENDING_PAYMENT (pre-payment) → ACTIVE (post-payment) |
| Invoice status | SENT → PAID (within 30–60 minutes) |
| Payment requirement | Immediate full payment |
| Program Readiness | NOT_ELIGIBLE until PAID; ELIGIBLE after |
| Assignment (Ph5) | BLOCKED until Invoice PAID; ALLOWED after |
| Session (Ph5) | BLOCKED until Invoice PAID; ALLOWED after |
| Expiry behavior | If payment not received before session time, Invoice → OVERDUE, Program Readiness remains NOT_ELIGIBLE; whether to cancel is OPEN-2A-03-F |

**Notes:** Admin must simultaneously confirm payment and trainer availability. The system does not block order creation (admin discretion) but DOES block formal session records until Invoice PAID.

---

### Scenario G — Normal Order, Payment NOT Received By Due Date

| Dimension | State |
|---|---|
| Order status | PENDING_PAYMENT (awaiting payment) |
| Invoice status | OVERDUE |
| Payment requirement | Still due — client has not paid |
| Program Readiness | NOT_ELIGIBLE |
| Assignment (Ph5) | BLOCKED |
| Session (Ph5) | BLOCKED |
| Expiry behavior | **OPEN-2A-03-F:** (A) stays OVERDUE indefinitely until admin acts; (B) auto-transitions to EXPIRED after grace period; (C) admin notification + HOLD state |

**Notes:** Program start date approaches. No payment received. Invoice is OVERDUE. Admin should follow up with client. Program cannot start (Program Readiness = NOT_ELIGIBLE). Whether the order auto-expires is owner's decision.

---

### Scenario H — Payment Received After Normal Due Date (But Before Program Start)

| Dimension | State |
|---|---|
| Order status | PENDING_PAYMENT → ACTIVE (when payment confirmed) |
| Invoice status | OVERDUE → PAID (when payment confirmed) |
| Payment requirement | Full payment received (late — after due_date, but Gates 03A/03B still apply) |
| Program Readiness | NOT_ELIGIBLE → ELIGIBLE (after payment confirmed) |
| Assignment (Ph5) | BLOCKED → ALLOWED (after payment confirmed) |
| Session (Ph5) | BLOCKED → ALLOWED (after payment confirmed) |
| Expiry behavior | N/A — order resumes normal lifecycle |

**Notes:** Client paid late but before program start. The system accepts the late payment (Gate 03A satisfied — full amount). Invoice transitions from OVERDUE → PAID. Order becomes ACTIVE. Program Readiness opens. Late fee (if any) is a T&C matter — not system-enforced in Phase 2.

---

### Scenario I — Urgent Order, Payment Completed, Program Delivered

| Dimension | State |
|---|---|
| Order status | ACTIVE (URGENT) |
| Invoice status | PAID |
| Payment requirement | Satisfied |
| Program Readiness | ELIGIBLE |
| Assignment (Ph5) | ALLOWED |
| Session (Ph5) | ALLOWED |
| Expiry behavior | Order → COMPLETED after all sessions delivered (Phase 5) |

**Notes:** Standard happy path for urgent orders. Everything flows normally after Invoice PAID — urgency only affects the pre-payment timeline, not the post-payment program lifecycle.

---

### Scenario J — Urgent Order, Payment NOT Completed Before Program Time

| Dimension | State |
|---|---|
| Order status | PENDING_PAYMENT (URGENT) |
| Invoice status | SENT → OVERDUE (due_date passes) |
| Payment requirement | Not satisfied |
| Program Readiness | NOT_ELIGIBLE |
| Assignment (Ph5) | BLOCKED |
| Session (Ph5) | BLOCKED |
| Expiry behavior | Admin must decide: cancel order (no financial impact — no payment received), hold for later, or reactivate if client pays |

**Notes:** Admin accepted an urgent order, but client did not pay in time. No formal program operations can begin. Admin must follow up. If the client never pays and no formal session occurred, admin cancels the order (no refund needed as no payment was made). If somehow an informal session occurred before payment (off-system), this is an admin error — the system did not permit formal records.

---

## Section 13 — Remaining Owner Decisions

### OPEN-2A-03-A: PP Full Payment Policy

**Decision sentence:**
> *"PP invoices require a single full payment equal to the invoice's `final_amount` (within tolerance); no partial payments, no DP, and no installment payments are accepted as standard PP workflow; Gate 03A (`payment.amount = invoice.final_amount ± tolerance`) and Gate 03B (one confirmed payment per invoice maximum) are enforced at the PP service layer."*

**Status:** PROPOSED — owner business input received in v1.1; formal APPROVE stamp pending.

**Why it matters:** This decision determines the invoice status state machine, the billing service validation logic, and whether `PARTIALLY_PAID` exists as an invoice status. All PP billing service code depends on this.

**Recommended option:** APPROVE as stated.

**Alternative:** Allow partial payments (Decision Matrix v1.0 original recommendation — Option B). This would require PARTIALLY_PAID status, running balance tracking, and multi-payment logic. The owner has verbally rejected this for PP.

**Impact if rejected:** Full rewrite of billing service design. `PARTIALLY_PAID` status must be added to `invoices_pp`. Running balance tracking required. Gate 03A and 03B must be replaced.

---

### OPEN-2A-03-B: Payment Before Program Readiness

**Decision sentence:**
> *"`invoices_pp.status = PAID` is a mandatory gate for Program Readiness in PP; no formal trainer assignment records (`assignments_pp`), session records (`sessions_pp`), or session delivery can be created in the system until the PP invoice is fully paid; informal off-system coordination before payment is not restricted."*

**Status:** PROPOSED — derived from owner business input; formal APPROVE stamp pending.

**Why it matters:** This gate is implemented in Phase 5 (`assignments_pp` and `sessions_pp` creation guards). If not decided before Phase 5, conflicting implementations will arise. For Phase 2, the decision is recorded as a design rule.

**Recommended option:** APPROVE as stated.

**Alternative:** Order ACTIVE alone is sufficient for program readiness (payment not required). This would allow sessions to be delivered without payment — commercially risky.

**Alternative B (split gate):** Assignments may be created before PAID (trainer blocking), but sessions cannot start until PAID. Operationally useful but adds complexity to the Phase 5 guard logic.

**Impact if rejected:** Program Readiness derivation rule changes; Phase 5 guards change; revenue risk increases.

---

### OPEN-2A-03-C: Normal Payment Deadline (H-value)

**Decision sentence (fill in the blank):**
> *"The standard PP payment deadline is `H-[X]` — payment must be confirmed by [X] days before the program start date for a NORMAL order; orders placed with less than [X + 2] days of lead time are classified as SHORT_LEAD or URGENT and use a compressed payment window."*

**Status:** PENDING — no owner input received.

**Why it matters:** The H-value directly determines `invoices_pp.due_date` calculation logic and the SHORT_LEAD / URGENT classification thresholds.

**Recommended option:** H-3 for normal orders (3 days before start). This provides:
- 2-day buffer for admin to prepare after payment
- Reasonable time for client to arrange payment after receiving invoice
- SHORT_LEAD threshold: H-3 to H-2

**Alternative:** H-2 (tighter but still workable).

**Impact if not decided before Phase 2A coding:** Due date calculation cannot be implemented. `invoices_pp.due_date` will be set to a placeholder or NULL in Phase 2A, requiring a later update.

---

### OPEN-2A-03-D: Urgent Order Classification Threshold

**Decision sentence:**
> *"PP orders placed with [X hours or less] of lead time before the requested program start are classified as URGENT and follow the urgent order workflow; orders placed with [Y–Z days] of lead time are classified as SHORT_LEAD."*

**Status:** PENDING — no owner input received.

**Why it matters:** This threshold determines when the URGENT workflow applies. It must be consistent with the H-value decided in OPEN-2A-03-C.

**Recommended option:** URGENT = H-1 or less (< 24 hours before start). SHORT_LEAD = H-2 to H-3.

**Impact if not decided:** Urgency classification cannot be implemented. System cannot automatically distinguish normal from urgent orders.

---

### OPEN-2A-03-E: Urgent Order Approval Authority

**Decision sentence (option A — no approval required):**
> *"Urgent PP orders (H-1 or less) do not require explicit system-level approval; any authorized admin may create an urgent order at their discretion; a `urgent_reason` text field captures the admin's reason; no approval queue or supervisor sign-off is required in Phase 2."*

**Decision sentence (option B — approval required):**
> *"Urgent PP orders (H-1 or less) require explicit supervisor approval recorded in the system; the order cannot proceed to invoicing until an authorized supervisor approves the urgent classification; this approval is recorded as `urgent_approved_by` (FK → `users`) and `urgent_approved_at`."*

**Status:** PENDING — no owner input received.

**Why it matters:**
- Option A: No schema change needed. Admin discretion. Minimum audit trail.
- Option B: Requires adding `urgent_approved_by` FK and `urgent_approved_at` timestamp to `orders_pp`, plus approval workflow in the admin service.

**Recommended option:** Option A for Phase 2. Approval workflow is Phase 3+.

**Impact if owner requires approval (Option B):** Schema addition required before Phase 2A coding of `orders_pp`. Two nullable columns + service logic for approval step.

---

### OPEN-2A-03-F: Overdue Payment Expiry Behavior

**Decision sentence (option A — no auto-expiry):**
> *"PP orders with OVERDUE invoices remain in their current status indefinitely until admin takes explicit action (cancellation or payment processing); no automatic order expiry or cancellation occurs based on payment deadline passage; admin is responsible for following up on overdue orders."*

**Decision sentence (option B — auto-expiry):**
> *"PP orders with OVERDUE invoices transition to EXPIRED status automatically after [N days] past the due_date if no payment is confirmed; the invoice transitions to CANCELLED; admin is notified; a new order must be created if the client wishes to restart."*

**Status:** PENDING — no owner input received.

**Why it matters:**
- Option A: No scheduled job needed in Phase 2. Simpler. Admin burden for follow-up.
- Option B: Requires a scheduled background job (`expired_order_scanner`). Adds Phase 2 operational complexity but reduces open-ended "zombie" orders.

**Recommended option:** Option A for Phase 2. Phase 5 can introduce auto-expiry as part of the operations layer.

**Impact if owner requires auto-expiry (Option B):** A scheduled job service must be implemented in Phase 2 (or Phase 5). EXPIRED must be confirmed as a valid `orders_pp.status` enum value (it is already in the Decision Matrix's proposed status list).

---

## Section 14 — Final OPEN-2A-03 Status Register

### 14.1 Decision Status Summary

| Sub-Decision | ID | Status | Blocks Coding? |
|---|---|---|---|
| PP full payment only | OPEN-2A-03-A | PROPOSED (owner input received; formal stamp pending) | YES — blocks billing.service |
| Payment before Program Readiness | OPEN-2A-03-B | PROPOSED (derived from owner input; formal stamp pending) | LOW — Phase 5 concern, not Phase 2A |
| Normal payment deadline (H-value) | OPEN-2A-03-C | PENDING | MEDIUM — blocks due_date calculation |
| Urgent order threshold | OPEN-2A-03-D | PENDING | LOW — can default to H-1 threshold |
| Urgent approval authority | OPEN-2A-03-E | PENDING | LOW — default to no-approval; schema addition only if Option B |
| Overdue expiry behavior | OPEN-2A-03-F | PENDING | LOW — default to no-auto-expiry |

### 14.2 Cross-Document Contradiction Register

| Contradiction | Documents in Conflict | Resolution |
|---|---|---|
| **OPEN-2A-03 recommendation: partial vs full payment** | Decision Matrix v1.0 (Section 4) recommends "allow multiple payments; Order ACTIVE when total = final_amount" vs. v1.1 records owner input "PP = full payment only, no DP, no installment" | **v1.1 supersedes.** Owner business input (v1.1) takes precedence over architecture recommendation (Decision Matrix). Decision Matrix Section 4's OPEN-2A-03 recommendation is now outdated. **Action needed:** annotate Decision Matrix Section 4 with a note pointing to v1.1. |
| **`orders_pp` status naming: PENDING vs PENDING_PAYMENT** | ER Matrix uses DRAFT → PENDING → ACTIVE. Decision Matrix uses DRAFT → PENDING_PAYMENT → ACTIVE → COMPLETED → CANCELLED → EXPIRED. | **Decision Matrix's naming is more explicit and preferred.** `PENDING_PAYMENT` communicates the reason for the pending state clearly. The ER Matrix's `PENDING` is likely a shorthand. **Action needed:** ER Matrix should be annotated to clarify `PENDING` = `PENDING_PAYMENT`. Engineering to implement `PENDING_PAYMENT` as the enum value. |
| **`invoices_pp.PARTIALLY_PAID` status exists or not** | Decision Matrix Section 5.2 includes `PARTIALLY_PAID` as an invoice status (conditional on OPEN-2A-03). v1.1 says PP does not use partial payments → `PARTIALLY_PAID` status does not exist for PP. | **v1.1 supersedes (for PP).** `PARTIALLY_PAID` is NOT an `invoices_pp` status value. The invoice status state machine for PP is: DRAFT → SENT → PAID | OVERDUE | CANCELLED. |
| **Program Readiness in Phase 2: assessed separately from Invoice PAID** | Decision Matrix Section 6.2 (Program Readiness) lists Commercial Gate = Order ACTIVE but does NOT list Invoice PAID as a gate. SUB-01 proposes Invoice PAID as a gate. | **SUB-01 extends the Program Readiness derivation rule** with owner business input. The Decision Matrix was written before the owner stated "sessions should not start while invoice is unpaid." SUB-01 formalizes this as an additional gate. **These documents are not contradictory — SUB-01 adds a new gate that the Decision Matrix did not analyze.** |
| **assessments_pp FK: client_id vs participant_id** | Batch 2B Lock text references `client_id`. ER Matrix Section 6.15 specifies `participant_id` as the REQUIRED FK. | **ER Matrix Section 6.15 is authoritative.** `participant_id → participants_pp.id` REQUIRED. Already resolved in Decision Matrix Section 7.3. Not new. |

### 14.3 Duplicate Authority Register

| Rule | Stated in multiple documents | Designated authority |
|---|---|---|
| PP uses full payment | v1.1 + this consolidation | v1.1 is origin; this consolidation references it |
| Invoice PAID before Program Readiness | SUB-01 + this consolidation | SUB-01 is origin; this consolidation references it |
| Split Gate (OPEN-2B-04) | Decision Matrix + multiple documents | Decision Matrix Section 2 + OPEN-2B-04 approval |
| One receipt per confirmed payment | ER Matrix + Decision Matrix + v1.0 | ER Matrix Section 6.x + Decision Matrix Section 9 |
| Agreement generation follows Order ACTIVE | SUB-01 Section 7 + Decision Matrix Section 9 | Established architecture; both documents consistent |

No material duplicate authority conflicts found — documents reference each other consistently.

---

## Section 15 — Final Recommendation: Is OPEN-2A-03 Ready to Lock?

### 15.1 Readiness Assessment

| Element | Status | Lock Condition |
|---|---|---|
| PP full payment policy | PROPOSED | Owner formal APPROVE of OPEN-2A-03-A |
| Payment before Program Readiness | PROPOSED | Owner formal APPROVE of OPEN-2A-03-B |
| Normal payment deadline | PENDING | Owner provides H-value (OPEN-2A-03-C) |
| Urgent order threshold | PENDING | Owner provides threshold (OPEN-2A-03-D) |
| Urgent approval authority | PENDING | Owner picks Option A or B (OPEN-2A-03-E) |
| Overdue expiry behavior | PENDING | Owner picks Option A or B (OPEN-2A-03-F) |

### 15.2 What Can Be Locked Now (Conditional)

If the owner approves OPEN-2A-03-A and OPEN-2A-03-B:
- The PP billing service design is unblocked: Gate 03A, Gate 03B, `PARTIALLY_PAID` excluded, one invoice per order
- The Program Readiness derivation rule is locked: `Order ACTIVE AND Invoice PAID`
- Phase 2A coding of the billing service can begin

Sub-decisions C through F affect configuration values and operational edge cases, but their non-resolution does not block the core billing service code. Phase 2A can proceed with placeholder values for due_date calculation (e.g. default H-3) while the owner decides.

### 15.3 What Is NOT Ready to Lock

- Urgent order schema additions (pending OPEN-2A-03-E outcome)
- Due date calculation config values (pending OPEN-2A-03-C)
- Expiry/cancellation automation (pending OPEN-2A-03-F)

### 15.4 Final Recommendation

**OPEN-2A-03 is PARTIALLY READY.**

- **OPEN-2A-03-A and -B: APPROVE THESE NOW.** The architecture is designed around them, owner business input is clear, and holding them up delays all Phase 2A billing service work.
- **OPEN-2A-03-C: DECIDE BEFORE Phase 2A billing service is coded.** The H-value is a configurable constant — once decided, it is a one-line config value. Do not block coding on this; decide in parallel.
- **OPEN-2A-03-D, -E, -F: CAN BE DECIDED AFTER Phase 2A coding begins.** These affect edge cases and operational policy. Default implementations (H-1 threshold, no approval required, no auto-expiry) can be applied as starting points.

### 15.5 Is Batch 2A Coding Authorized?

**NOT YET AUTHORIZED** — three decisions from the Decision Matrix remain:
- OPEN-2A-03-A (formal APPROVE)
- OPEN-2B-01 (group participant capacity) — unrelated to this document but still pending
- OPEN-NEW-01 (refund entity) — unrelated to this document but still pending

Once the owner approves OPEN-2A-03-A, OPEN-2B-01, and OPEN-NEW-01, **Phase 2A (Batch 2A) coding is authorized.**

OPEN-2A-03-B through OPEN-2A-03-F do not individually block Phase 2A coding start, as they affect due_date configuration and urgent edge cases that are not core to the commercial transaction entities.

---

*EFM PP — OPEN-2A-03 Final Payment Policy Consolidation v1.0*
*Created: 2026-09-29*
*Authority Level: Consolidation Analysis — PENDING OWNER APPROVAL*
*Next Action: Owner to review Section 13 and provide APPROVE/REJECT for OPEN-2A-03-A and -B; provide values for OPEN-2A-03-C through -F.*
*No coding, schema changes, migrations, API implementation, or frontend changes are authorized by this document.*
