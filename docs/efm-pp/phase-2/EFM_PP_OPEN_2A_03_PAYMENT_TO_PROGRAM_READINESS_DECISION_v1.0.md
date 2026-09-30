# EFM PP — OPEN-2A-03 Sub-Decision: Payment → Program Readiness
## Decision Document v1.0

**Module:** PP (Private Program)
**Document ID:** OPEN-2A-03-SUB-01
**Parent Decision:** OPEN-2A-03 (Partial Payment Policy — resolved in v1.1 as Full Payment Only)
**Phase:** Phase 2 — Batch 2A (Commercial Core)
**Status:** OPEN — OWNER DECISION PENDING
**Created:** 2026-09-29
**Author:** Architecture Review

---

## OWNER DECISION

**PENDING** — This document must be reviewed and approved by the owner before implementation.

The decision sentence that requires an APPROVE or REJECT is in **Section 11**.

---

## Section 1 — Decision Context

### What is being decided

Following the resolution of OPEN-2A-03 v1.1 (PP uses Full Payment Only; Billing Core capability is separate from per-module payment policy), a sub-question was surfaced that was not answered by the partial payment decision:

> **Must the PP Invoice reach `PAID` status before the program can begin — before sessions can be scheduled, assigned, and delivered?**

The owner's stated business position is:

> *"EFM should not normally start delivering PP sessions while the invoice remains unpaid."*

This position constrains the answer but does not resolve the exact architectural implementation. Three options exist for how the system should operationalize this rule, and the distinction matters for both Phase 2 (Program Readiness) and Phase 5 (Scheduling, Assignment, Session delivery).

### Why this decision is needed now (Phase 2)

Phase 2 introduces the commercial core of the PP module:
- Orders, Invoices, Payments, Receipts
- The concept of **Program Readiness** (a derived concept — not a stored field)

Phase 5 (future) introduces the operational layer:
- `assignments_pp`, `sessions_pp`, `attendance_pp`
- Scheduling, trainer assignment, session tracking

The gate between payment and program operations must be defined in Phase 2 **as a derivation rule**, so that Phase 5 inherits a consistent, pre-decided constraint. If this rule is left undefined in Phase 2, Phase 5 will make conflicting assumptions.

### What this decision is NOT

- This is NOT a revision of the PP Full Payment rule (Gate 03A + Gate 03B — already decided in v1.1, PENDING owner approval)
- This is NOT a decision about B2B Event or B2B Management payment gates
- This is NOT about Agreement generation (Agreement follows Order ACTIVE — this is already established architecture)
- This is NOT about creating a new stored field on `orders_pp`

### Relationship to prior decisions

| Prior Decision | Status | Relevance |
|---|---|---|
| OPEN-2B-04 (Assessment as gate) | APPROVED — Scenario C (Split Gate) | Commercial activation and program readiness are independent. Assessment is NOT a universal gate for Order ACTIVE. |
| OPEN-2A-03 v1.1 (PP Full Payment) | PENDING | PP uses full payment only. Gate 03A: `payment.amount = invoice.total_amount ± tolerance`. Gate 03B: no second confirmed payment on same invoice. |
| ER Matrix — `orders_pp.status` | Non-negotiable | DRAFT → PENDING → ACTIVE → COMPLETED → CANCELLED. No `PROGRAM_READY` status field. Program Readiness is derived. |
| Architectural invariant NN-7 | Non-negotiable | Six status dimensions are independent and must not be collapsed: Order Status, Invoice Status, Payment Status, Program Readiness, Scheduling Status, Session Status. |

---

## Section 2 — Owner Business Rule

The owner has stated the following business rules that constrain this decision:

**Verbatim owner input:**
> "PP / Personal Program: Standard payment = FULL PAYMENT. No DP as standard. No installment as standard. EFM should not normally start delivering PP sessions while the invoice remains unpaid."

**Interpretation:**

1. The business default is that sessions should not start until payment is complete.
2. "Not normally" implies there may be edge cases (e.g., goodwill sessions for a known client), but these are exceptions — not the standard workflow. The system should enforce the standard rule; exceptions are handled by override or manual admin action.
3. The constraint applies to **starting** and **delivering** sessions — not necessarily to **preparing** or **scheduling** sessions.
4. The full payment rule (OPEN-2A-03 v1.1) means "paid" in the PP context = Invoice fully paid (one payment, full amount) = `invoices_pp.status = PAID`.

**Business model alignment:**

| Business action | Should require Invoice PAID? |
|---|---|
| Generate Invoice | No — Invoice generation is a commercial step, not gated by payment |
| Sign Agreement | No — Agreement follows Order ACTIVE (see Section 7) |
| Prepare/propose schedule internally | To be decided |
| Create trainer assignment (`assignments_pp`) | To be decided |
| Confirm session dates with client | To be decided |
| Start first session / deliver program | Yes — owner has stated this clearly |
| Record attendance | Yes — inherits the session gate |
| Issue Receipt | Yes — Receipt follows confirmed payment |

---

## Section 3 — Option A Analysis: Payment First

### Definition

**OPTION A — PAYMENT FIRST**

```
Invoice (DRAFT) → Invoice (SENT) → Full Payment Confirmed → Invoice (PAID) →
Program Readiness = ELIGIBLE → Assignment → Scheduling → Session → Delivery
```

Under Option A, Invoice `PAID` is a **hard gate** before any downstream program activity. No scheduling preparation, no trainer assignment, no session creation until the invoice is confirmed paid.

### Strengths

**Commercial control:**
- The clearest financial gate. No ambiguity about when program operations can begin.
- Admin always knows: if Invoice = PAID → proceed. If Invoice ≠ PAID → block.
- Revenue is secured before any service is delivered — zero risk of session delivery without payment.

**Operational simplicity:**
- One trigger signal (`invoices_pp.status = PAID`) unlocks all downstream operations.
- Phase 5 entities (`assignments_pp`, `sessions_pp`) are never created for unpaid orders.
- Reporting is clean: "program not started" unambiguously maps to "invoice not paid."

**Audit trail:**
- Every program that has started has a corresponding PAID invoice.
- No edge cases of "sessions ran but payment was never collected."

**Alignment with owner statement:**
- Directly matches "EFM should not normally start delivering PP sessions while the invoice remains unpaid."

### Weaknesses

**Operational friction in real-world PP workflow:**
- In practice, PP admin often identifies a trainer and proposes a schedule before payment is finalized. The client may need to see a proposed schedule before confirming payment.
- Under strict Option A, admin cannot do ANY preparatory work (assign trainer, block schedule slots) until payment is fully confirmed.
- This may delay program start by 1–3 business days after payment, because admin must do all preparation work only after receiving payment confirmation.

**Trainer scheduling delay:**
- If trainer assignment is gated behind Invoice PAID, trainers cannot be pre-allocated. This creates inefficiency if trainer availability needs to be confirmed before payment.

**Client experience:**
- A client may not feel comfortable paying in full without knowing their trainer and schedule.
- The standard sales flow in fitness management often includes: trainer is introduced → schedule is proposed → client pays → program begins.
- Option A forces payment before the client knows their trainer and schedule.

### Verdict on Option A

Option A provides the strongest financial control but creates friction in the natural PP sales/onboarding flow. It is the correct default for the **session start gate** but may be overly restrictive as the **scheduling preparation gate**.

---

## Section 4 — Option B Analysis: Scheduling Before Payment

### Definition

**OPTION B — SCHEDULING BEFORE PAYMENT**

```
Invoice (SENT) → Scheduling begins → Assignment created → Sessions created →
Payment (later) → Program starts
```

Under Option B, scheduling and trainer assignment can happen independently of payment status. The program may even start before payment is fully confirmed.

### Strengths

**Operational flexibility:**
- Admin can assign trainers and schedule sessions immediately after Order ACTIVE.
- Client knows their trainer and schedule before paying — smoother sales/onboarding experience.
- Matches a "trust-based" or "relationship-based" sales culture common in fitness management.

**Trainer allocation efficiency:**
- Trainers can be assigned and their calendars blocked in advance, regardless of invoice payment status.

### Weaknesses

**Revenue risk:**
- Sessions may be delivered without payment being confirmed. If payment fails or client cancels after sessions have started, EFM has delivered service without compensation.
- The system has no mechanism to halt a running program when payment doesn't arrive.

**Reconciliation complexity:**
- "Sessions ran but invoice is unpaid" becomes a valid system state. Admin must manually track and chase outstanding payments.
- Reporting becomes ambiguous: a session log does not guarantee a corresponding payment.

**Cancellation exposure:**
- If a client cancels after sessions have started but before paying (or after partial delivery), the invoice may be disputed.
- No clean cancellation boundary exists.

**Contradiction with owner statement:**
- Directly contradicts "EFM should not normally start delivering PP sessions while the invoice remains unpaid."
- Option B would permit session delivery without payment as a system-supported state, not an exception.

### Verdict on Option B

Option B is incompatible with the owner's stated business rule. It introduces revenue risk, reconciliation complexity, and audit trail gaps that are not acceptable for the PP module. **Option B is eliminated from recommendation.**

---

## Section 5 — Option C Analysis: Conditional Scheduling

### Definition

**OPTION C — CONDITIONAL SCHEDULING**

```
Order (ACTIVE) →
  [Preparation phase — no Invoice PAID required]:
    - Invoice generated (DRAFT → SENT)
    - Agreement generated and signed
    - Trainer internally identified (not yet assigned in system)
    - Schedule proposed to client informally
  
  [Gate: Invoice = PAID]:
    - Program Readiness = ELIGIBLE
    - Formal trainer assignment created in system (`assignments_pp`)
    - Session records created (`sessions_pp`)
    - Client schedule confirmed
    - Session delivery begins
```

Under Option C, there is a meaningful distinction between **preparation activities** (informal, system-optional) and **formal program activation** (system-enforced, requires Invoice PAID).

### The key distinction in Option C

Option C acknowledges that in real-world PP operations, some preparatory steps happen before payment:
- Admin identifies a suitable trainer based on client preferences
- Admin proposes dates based on client and trainer availability
- This is informal coordination — it does not create formal records in the system

But the **system-enforced gates** still require Invoice PAID before:
- A formal trainer assignment record exists in `assignments_pp`
- Session records exist in `sessions_pp`
- The first session can be marked as started/delivered
- Attendance can be recorded

### Why Option C works architecturally

- **Phase 2 impact:** `assignments_pp` and `sessions_pp` do not exist in Phase 2 (Phase 5 entities). The Phase 2 question is solely whether Invoice PAID gates Program Readiness eligibility. Option C answers: YES, Invoice PAID is a gate for Program Readiness.
- **Phase 5 impact:** When `assignments_pp` is created, the guard must check: is the parent Order's Invoice PAID? If no → reject. This is a single gate check at the service layer.
- **No new status field required:** Program Readiness remains a derived concept. The derivation rule becomes: `Order.status = ACTIVE AND Invoice.status = PAID → Program Readiness = ELIGIBLE`.
- **Informal preparation is out-of-system:** Admin can communicate with trainers and clients about proposed schedules informally (email, phone, etc.) without this creating system records. The system only formalizes when payment is confirmed.

### Option C vs. Option A: the practical difference

| Activity | Option A gate | Option C gate |
|---|---|---|
| Generate Invoice | Order ACTIVE | Order ACTIVE |
| Sign Agreement | Order ACTIVE | Order ACTIVE |
| Informal trainer identification (off-system) | N/A — not in system | N/A — not in system |
| Create `assignments_pp` record | Invoice PAID | Invoice PAID |
| Create `sessions_pp` records | Invoice PAID | Invoice PAID |
| Start first session | Invoice PAID | Invoice PAID |

Under both Option A and Option C, the **system-enforced gates are identical**. The difference is conceptual: Option C explicitly names the preparation phase as out-of-system, while Option A implicitly treats all pre-payment coordination as "not started."

For the purpose of Phase 2 architecture, Option A and Option C are **functionally equivalent** at the system gate level. Option C is preferred because it accurately describes real PP operations without creating a contradiction between the system rule and admin behavior.

### Strengths of Option C

- Matches real-world PP onboarding flow (informal coordination before formal system records)
- No system-enforced preparation records means no ambiguous state (unlike partial scheduling records that exist without payment)
- Invoice PAID is still the single gate for all formal program operations
- Clean audit trail: every formal assignment, session, and attendance record has a corresponding PAID invoice
- Admin has flexibility to do preparatory coordination informally without needing a system workaround

### Weaknesses / limitations

- "Informal preparation" is invisible to the system — no tracking of pre-payment trainer discussions or proposed schedules
- If admin wants to formally track trainer proposals before payment, a future "proposal" or "draft assignment" entity would be needed (not in scope for Phase 2 or Phase 5 as currently defined)
- Relies on admin discipline to not "pre-confirm" schedules with clients before payment

### Verdict on Option C

Option C is the correct recommendation. It is functionally equivalent to Option A at the system gate level, but more accurately models real PP operations. The critical rule — **Invoice PAID is required before any formal system program record** — is preserved under both, but Option C explicitly acknowledges out-of-system informal coordination without creating a system exception.

---

## Section 6 — Status Separation (Six Dimensions)

Per architectural invariant NN-7, the six status dimensions must not be collapsed into a single field. Each dimension tracks a different aspect of the PP lifecycle.

### Dimension definitions and relationships

#### 1. Order Status (`orders_pp.status`)

**Values:** DRAFT → PENDING → ACTIVE → COMPLETED → CANCELLED
**Stored:** Yes — `orders_pp.status` column
**Owner:** Commercial workflow

Order Status tracks the **commercial agreement status** — whether the business relationship between EFM and the client is active. Order ACTIVE means the business terms are agreed; the client is committed.

**Relationship to other dimensions:**
- Order ACTIVE is a prerequisite for Invoice creation (Gate 02)
- Order ACTIVE is a prerequisite for Agreement generation (Phase 3)
- Order ACTIVE does NOT imply Invoice PAID
- Order ACTIVE does NOT imply Program Readiness (per OPEN-2B-04 Scenario C)

#### 2. Invoice Status (`invoices_pp.status`)

**Values:** DRAFT → SENT → PAID → OVERDUE → CANCELLED
**Stored:** Yes — `invoices_pp.status` column
**Owner:** Billing workflow

Invoice Status tracks the **billing document status** — whether the client has been billed and whether payment has been received.

**Relationship to other dimensions:**
- Invoice status is independent of Order status changes after creation (Order ACTIVE is the gate for Invoice creation)
- Invoice PAID is the gate for Program Readiness (this decision)
- Invoice PAID triggers Gate 04 (Receipt generation)
- Invoice OVERDUE is a derived status based on `due_date` and payment confirmation date

**Note on `final_amount`:** `invoices_pp.final_amount` is a CALC field (`total_amount - discount_amount`). The `total_amount` field is SNAP (snapshot at creation). Gate 03A checks `payment.amount` against `invoices_pp.final_amount`.

#### 3. Payment Status (`payments_pp.status`)

**Values:** PENDING → CONFIRMED | REJECTED
**Stored:** Yes — `payments_pp.status` column
**Owner:** Payment confirmation workflow

Payment Status tracks **individual payment record status** — whether a specific payment submission has been verified and confirmed.

**Relationship to other dimensions:**
- Payment CONFIRMED triggers `invoices_pp.status` transition to PAID (for full-amount payment, per Gate 03A)
- Payment CONFIRMED triggers Gate 04 (Receipt generation eligibility)
- A REJECTED payment does not change Invoice status
- There is exactly ONE CONFIRMED payment per PP Invoice (Gate 03B)

**Note on Payment ID format:** OPEN-2A-02 (Payment ID format) remains open as a sub-decision and does not affect this document.

#### 4. Program Readiness (derived concept)

**Values:** NOT_ELIGIBLE, ELIGIBLE
**Stored:** No — derived at service layer
**Owner:** Program operations

Program Readiness tracks whether all prerequisites have been met for program delivery to begin. It is **not stored as a column on `orders_pp`** — it is computed on-demand from the state of related entities.

**Phase 2 derivation rule (this decision):**

```
Program Readiness = ELIGIBLE
  IF orders_pp.status = ACTIVE
  AND invoices_pp.status = PAID
  [AND assessments_pp gates — per OPEN-2B-04 Scenario C: assessment is NOT a universal gate]
```

**Phase 5 additions to derivation rule (future):**
```
Program Readiness = ELIGIBLE
  IF orders_pp.status = ACTIVE
  AND invoices_pp.status = PAID
  AND assignments_pp.status = CONFIRMED (trainer assigned and confirmed)
  AND sessions_pp records exist and are scheduled
```

**Relationship to other dimensions:**
- Program Readiness ELIGIBLE does not change Order status
- Program Readiness ELIGIBLE does not change Invoice status
- Program Readiness ELIGIBLE is required before the first session can be delivered (Phase 5)
- Program Readiness ELIGIBLE is not a stored transition — it is re-derived each time it is checked

#### 5. Scheduling Status (Phase 5 — future)

**Values:** NOT_SCHEDULED, SCHEDULED, PARTIALLY_COMPLETED, COMPLETED
**Stored:** Derived from `sessions_pp` records in Phase 5
**Owner:** Program operations

Scheduling Status tracks whether the program's sessions have been formally scheduled in the system. This dimension does not exist in Phase 2.

**Relationship to other dimensions (Phase 5):**
- Scheduling Status NOT_SCHEDULED is only valid when Program Readiness = NOT_ELIGIBLE or = ELIGIBLE but no assignments yet created
- Scheduling Status SCHEDULED requires Program Readiness = ELIGIBLE (Invoice PAID must be satisfied)
- `assignments_pp` creation is gated on Invoice PAID (see Section 10)

#### 6. Session Status (Phase 5 — future)

**Values:** Per individual `sessions_pp.status` record — SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED
**Stored:** `sessions_pp.status` column in Phase 5
**Owner:** Program delivery

Session Status tracks individual session delivery. This dimension does not exist in Phase 2.

**Relationship to other dimensions (Phase 5):**
- A session record cannot be created unless the parent Order's Invoice is PAID
- Session COMPLETED records are the basis for attendance tracking in `attendance_pp`
- Session CANCELLED does not change Invoice or Payment status

### Status relationship summary

```
Order ACTIVE
    │
    ├──► Invoice (DRAFT → SENT)
    │        │
    │        ├──► Payment submission (PENDING → CONFIRMED)
    │        │        │
    │        │        └──► Invoice (PAID)  ←── GATE FOR PROGRAM READINESS
    │        │                  │
    │        │                  └──► Receipt (Gate 04)
    │        │
    │        └──► Invoice (OVERDUE) ─ if due_date passed, no CONFIRMED payment
    │
    ├──► Agreement (Phase 3) ─ gated on Order ACTIVE, NOT Invoice PAID
    │
    └──► [Invoice PAID] ──► Program Readiness = ELIGIBLE
                                │
                                └──► [Phase 5] Assignments → Sessions → Attendance
```

### Non-negotiable constraints (NN-7)

The six dimensions are **independent tracking planes**. The following collapsings are prohibited:

| Prohibited collapse | Why |
|---|---|
| Storing Program Readiness on `orders_pp.status` | Order status is commercial; Program Readiness is operational. A "program-ready" order status would conflate billing completion with program eligibility. |
| Deriving Invoice status from Order status | Invoice and Order are separate entities with separate lifecycles. An ACTIVE order may have a DRAFT, SENT, PAID, or OVERDUE invoice at different points. |
| Treating Payment CONFIRMED = Invoice PAID | Payment CONFIRMED is the record of a submitted payment. Invoice PAID is the aggregate status of the billing document. For PP (full payment), one CONFIRMED payment transitions the Invoice to PAID. These are still separate events on separate entities. |
| Using Session status as a proxy for Invoice status | Sessions may exist (Phase 5) and may be completed; Invoice PAID is a prerequisite for session creation, but Invoice status does not change as sessions are completed. |

---

## Section 7 — Agreement Impact

### Existing Agreement Architecture

The `agreements_pp` entity is scoped to **Phase 3** of the EFM V2 backend. The following is the established (non-negotiable) architecture from the Cross-Batch Reconciliation document and ER Matrix:

1. **Agreement generation trigger:** Order reaches `ACTIVE` status → Agreement is generated
2. **Agreement signing:** Separate workflow — Agreement is signed by client and EFM
3. **Agreement activation:** Agreement becomes legally binding after signing
4. **Agreement immutability:** Agreement is immutable after signing — `agreement.guard.js` enforces this
5. **Agreement FK:** `agreements_pp.order_id → orders_pp.id`

### Does Agreement generation depend on Invoice PAID?

**No.** The Agreement is a legal document formalizing the terms of the private program. It is generated when the Order is ACTIVE — meaning both parties have agreed to the commercial terms. The Agreement captures:
- Program parameters (sessions, trainer type, schedule framework)
- Payment terms (total amount, payment method, due date)
- Cancellation policy

The Agreement must be available **before or alongside** invoice payment, because the payment terms are recorded in the Agreement. Gating Agreement generation on Invoice PAID would create a circular dependency: the client needs to see and sign the Agreement to understand their payment obligation, but payment is required before the Agreement is generated.

**This is already established architecture.** This decision document does not change it.

### Does Agreement signing depend on Invoice PAID?

**No.** Agreement signing is a legal formality. The client signs to confirm acceptance of program terms, including the payment terms. The signature commits the client to payment — it does not confirm that payment has occurred. Agreement signing may precede, accompany, or follow invoice payment in practice, but it is not architecturally gated on Invoice PAID.

### Does Agreement activation (becoming legally enforceable) depend on Invoice PAID?

**No — same reasoning as above.** Agreement activation (after signing) confirms the legal binding of both parties. Payment is the client's fulfillment of one obligation under the Agreement. The Agreement's enforceability does not depend on payment being completed first.

### Does Agreement creation or status change when Invoice PAID?

**No.** Invoice PAID does not trigger any Agreement state change. Agreement and Invoice are independent documents tracking different aspects of the Order.

### Summary: Agreement × Payment interaction

| Agreement lifecycle event | Gate | Triggered by |
|---|---|---|
| Agreement generation | Order ACTIVE | `orders_pp.status = ACTIVE` |
| Agreement signing | None (manual admin action) | Admin/client workflow |
| Agreement activation | Agreement signed | Signing event |
| Agreement archival/cancellation | Order CANCELLED | `orders_pp.status = CANCELLED` |

**Invoice PAID has no role in Agreement lifecycle.** This is the existing architecture and this decision does not modify it.

---

## Section 8 — Operational Impact

### Impact on Phase 2 implementation

Phase 2 introduces the commercial core: Orders, Invoices, Payments, Receipts. The Program Readiness gate is expressed as a **derivation rule** at the service layer — no schema change required.

**Service layer change required (Phase 2):**

The Program Readiness derivation logic is added to the `order_readiness.service.js` (or equivalent service module) as a computed property:

```
function isProgramReady(orderId):
  order = orders_pp.findById(orderId)
  if order.status != ACTIVE → return false
  invoice = invoices_pp.findByOrderId(orderId)
  if invoice == null → return false
  if invoice.status != PAID → return false
  return true
```

This is the Phase 2 expression. Phase 5 will add assignment and session checks.

**No stored column, no migration, no schema change.**

### Impact on admin workflow

**What admin can do before Invoice PAID:**
- Create and manage the Order
- Generate and send the Invoice
- Record and process payments (pending → confirmed)
- Generate and manage the Agreement (Phase 3)
- Informally communicate trainer options and proposed schedules with clients (off-system)

**What admin cannot do before Invoice PAID:**
- Mark the Order as "program-ready" in any system-meaningful way
- Create formal trainer assignment records (`assignments_pp` — Phase 5)
- Create session records (`sessions_pp` — Phase 5)
- Record attendance (`attendance_pp` — Phase 5)

**Operational efficiency note:** The prohibition on formal scheduling records before payment does not prevent admin from using external tools (calendar, spreadsheet, phone) for informal coordination. The system simply does not create formal records until payment is confirmed. This is the intended behavior under Option C.

### Impact on edge cases

**Edge case 1: Client pays late (after sessions have informally started)**
This is an exception, not a standard flow. If a client informally begins sessions before their invoice is paid (due to admin error or special arrangement), the system will not have session records for those sessions. Admin would need to retroactively create the invoice payment and then create session records in Phase 5. This should be rare and is treated as an admin override, not a supported automated flow.

**Edge case 2: Invoice OVERDUE — program already in progress (Phase 5)**
In Phase 5, if sessions have already started (Invoice was PAID, sessions were created), and the order's invoice somehow becomes OVERDUE (this should not occur under Gate 03A and Gate 03B, but may occur in edge cases), the running program is not automatically halted. Halting a running program mid-course is a business decision requiring admin intervention — not an automated system action. The system records the OVERDUE status but does not automatically cancel sessions.

**Edge case 3: Invoice cancelled after payment**
`invoices_pp.status = CANCELLED` is a state for invoices that were not paid. An invoice that has been PAID cannot be cancelled (immutability rule). If a refund is needed after payment, this is handled by `refunds_pp` (Phase 3 scope). The running program is not automatically affected by a refund workflow.

**Edge case 4: PP order with multiple clients (participant ≠ paying client)**
`participants_pp.client_id` is NULLABLE — the participant may not be the paying client (e.g., a corporate client paying for an employee's PP). The Invoice PAID gate applies to the Invoice on the Order, regardless of who the participant is. The Program Readiness rule does not change.

---

## Section 9 — 3–5 Year Architecture: Non-Interference Guarantee

### PP rule scope

The PP payment → program readiness rule is expressed as:
- `invoices_pp.status = PAID` is required before Program Readiness = ELIGIBLE
- This rule is enforced at the PP module's service layer
- It is NOT a global billing engine rule
- It is NOT applied to `invoices_b2b` or `invoices_event`

This is consistent with the Billing Core vs. Business Policy distinction established in OPEN-2A-03 v1.1.

### B2B Event (Phase 3) — will NOT be constrained

B2B Event uses a DP + settlement payment model (multiple invoices per order, one per milestone). The Program Readiness concept for B2B Event is different: an event has a confirmed date, setup requirements, and trainer deployment — none of which map to the PP program readiness model.

The PP Program Readiness derivation rule references `invoices_pp` — it does not touch B2B Event invoice entities. B2B Event will define its own "event readiness" concept independently in Phase 3. **There is zero risk of PP rules bleeding into B2B Event.**

### B2B Management (Phase 4+) — will NOT be constrained

B2B Management uses contractual term payments (1, 3, 6, 9, 12-month contracts). The payment → service delivery relationship in B2B Management involves recurring invoice generation tied to contract terms — a fundamentally different model than PP's single-invoice, single-program structure.

B2B Management will define its own delivery gate rules (likely: contract active + current period invoice paid → service delivery authorized for this period). The PP rule does not apply. **There is zero risk of PP rules bleeding into B2B Management.**

### Future PP sub-modules (Active Aging, Group PP, etc.)

Per architectural invariant #8, Active Aging rules do not bleed into global gates. If Active Aging or other PP sub-modules have different payment-to-readiness requirements (e.g., group PP may require a minimum enrollment before program starts, regardless of individual payment status), those rules are expressed as additional service-layer conditions on the relevant sub-module, not as modifications to the base PP rule.

**The base rule — Invoice PAID for Program Readiness — is the PP module minimum standard.** Sub-modules may add stricter or more complex conditions; they cannot remove the Invoice PAID requirement.

### Architectural stability assessment

The Payment → Program Readiness rule as defined in this document:
- References only `orders_pp.status` and `invoices_pp.status`
- Is expressed as a derived computation (no stored field)
- Is enforced at the service layer (not schema/database constraint)
- Is scoped strictly to the PP module service layer

This is the minimum-footprint implementation. The rule can be modified in future phases without schema changes. The rule does not constrain any other module. **The rule is architecturally stable and non-interfering for a 3–5 year horizon.**

---

## Section 10 — Recommended PP Rule

Based on the option analysis (Sections 3–5), status separation analysis (Section 6), agreement impact analysis (Section 7), and 3–5 year architecture assessment (Section 9), the recommended PP rule is:

### Recommended Option: Option C — Conditional Scheduling

The recommended PP rule is Option C (Conditional Scheduling), which is functionally equivalent to Option A at the system gate level but more accurately describes real PP operations.

### Five specific questions — recommended answers

**Q1: Can scheduling be created (formal `assignments_pp` record) before payment is confirmed?**

**NO.** A formal trainer assignment record in `assignments_pp` requires Invoice PAID. Informal coordination off-system is allowed, but no system record of a trainer assignment exists before the invoice is paid.

*Rationale:* Creating a system record for an assignment on an unpaid order creates ambiguity — the assignment record implies the program has started, which it hasn't. Gate: `invoices_pp.status = PAID`.

---

**Q2: Can a session be started (first `sessions_pp` record created or first session marked delivered) before payment is confirmed?**

**NO.** Session records cannot be created until `invoices_pp.status = PAID`. No session can be delivered and recorded in the system for an unpaid order.

*Rationale:* This is the direct enforcement of the owner's stated rule: "EFM should not normally start delivering PP sessions while the invoice remains unpaid." Gate: `invoices_pp.status = PAID`.

---

**Q3: When does Program Readiness become ELIGIBLE?**

**Program Readiness = ELIGIBLE when ALL of the following are satisfied:**

For Phase 2:
1. `orders_pp.status = ACTIVE`
2. `invoices_pp.status = PAID` (the invoice on this Order)

For Phase 5 (additional conditions):
3. At least one `assignments_pp` record exists for this Order with status = CONFIRMED
4. At least one `sessions_pp` record exists for this Order

*Note:* In Phase 2, conditions 3 and 4 do not exist yet. Program Readiness ELIGIBLE in Phase 2 means: "the commercial prerequisites are satisfied; the program can begin once Phase 5 entities are created."

---

**Q4: What Invoice status is required for Program Readiness?**

**`invoices_pp.status = PAID`** — specifically PAID, not SENT, not OVERDUE.

- DRAFT: Not eligiblr — invoice not yet presented to client
- SENT: Not eligible — invoice presented but payment not confirmed
- PAID: ELIGIBLE — full payment confirmed per Gate 03A
- OVERDUE: Not eligible — payment deadline passed without confirmed payment
- CANCELLED: Not eligible — invoice voided

---

**Q5: What happens if payment is still outstanding when the client expects the program to start?**

**The system blocks formal program initiation. Admin workflow:**

1. Invoice remains in SENT or OVERDUE status
2. Program Readiness = NOT_ELIGIBLE
3. In Phase 5: `assignments_pp` creation is blocked with error: "Invoice must be PAID before trainer assignment can be created"
4. In Phase 5: `sessions_pp` creation is blocked with error: "Invoice must be PAID before session records can be created"
5. Admin may continue to follow up with the client for payment using standard CRM/communication tools (off-system in current EFM V2 scope)
6. Once payment is confirmed and Invoice transitions to PAID, Program Readiness becomes ELIGIBLE and all downstream Phase 5 operations are unblocked

**There is no automatic notification or escalation rule** — this is out of scope for Phase 2 and Phase 5. Admin is responsible for monitoring outstanding invoices.

### Summary of recommended rules

| Rule | Value |
|---|---|
| Invoice PAID required for Program Readiness | YES |
| Invoice PAID required for `assignments_pp` creation (Phase 5) | YES |
| Invoice PAID required for `sessions_pp` creation (Phase 5) | YES |
| Invoice PAID required for Agreement generation | NO — Agreement follows Order ACTIVE |
| Informal off-system coordination allowed before payment | YES — not a system concern |
| Gate expression | `orders_pp.status = ACTIVE AND invoices_pp.status = PAID` |
| Gate location | Service layer (not schema constraint) |
| Schema change required | NO |

---

## Section 11 — Exact Owner Decision

### Decision sentence

> **"For PP (Private Program), the system shall require `invoices_pp.status = PAID` as a mandatory gate for Program Readiness, meaning no formal trainer assignment records (`assignments_pp`), session records (`sessions_pp`), or session delivery can occur in the system until the PP invoice is fully paid; informal off-system coordination (trainer identification, schedule proposals) is not gated."**

### OWNER DECISION: **PENDING**

**Instructions for owner review:**

- **APPROVE** if: PP program operations (assignments, sessions, delivery) should be blocked in the system until the invoice is fully paid; the gate `invoices_pp.status = PAID → Program Readiness ELIGIBLE` is correct.
- **REJECT** if: The system should allow some form of formal scheduling or session creation before invoice payment, and a different rule (e.g., Order ACTIVE alone is sufficient gate, or scheduling is allowed before payment but delivery is not).

### What this decision enables (if APPROVED)

- Phase 2 implementation: `isProgramReady(orderId)` service function returns `true` only when `order.status = ACTIVE AND invoice.status = PAID`
- Phase 5 guard: `assignments_pp` creation service checks `isProgramReady()` — rejects with 409 if NOT_ELIGIBLE
- Phase 5 guard: `sessions_pp` creation service checks `isProgramReady()` — rejects with 409 if NOT_ELIGIBLE
- No schema changes, no migration, no stored status field

### What this decision does NOT decide

- The exact format of Payment ID (OPEN-2A-02 — still open)
- Whether refunds exist as an entity (`refunds_pp` — Phase 3 scope, OPEN-NEW-01)
- How B2B Event handles payment-to-event-readiness (Phase 3 — separate decision)
- How B2B Management handles payment-to-service-delivery gates (Phase 4+ — separate decision)
- Whether there are PP-specific exceptions for known/trusted clients (admin override — future feature scope)

---

## Section 12 — Consequences

### If APPROVED — consequences

**Immediate (Phase 2):**
- `isProgramReady()` service function uses `orders_pp.status = ACTIVE AND invoices_pp.status = PAID`
- This derivation rule is documented in the service layer and referenced by future Phase 5 guards
- No code changes required immediately — the derivation rule is a design decision that Phase 5 will implement

**Phase 5 consequences:**
- `assignments_pp` service: pre-creation guard checks `isProgramReady()` → 409 if not eligible
- `sessions_pp` service: pre-creation guard checks `isProgramReady()` → 409 if not eligible
- API documentation: `assignments_pp` and `sessions_pp` endpoints document the Invoice PAID prerequisite
- Admin UI: "Create Assignment" and "Create Session" buttons are disabled/grayed when Invoice is not PAID, with tooltip explaining the gate

**Reporting consequences:**
- "Program not started" dashboards can unambiguously use `invoices_pp.status = PAID` as the filter
- Outstanding payment reports can include: "X orders with ACTIVE status and unpaid invoices — program start blocked"

**Potential friction:**
- Admin must explicitly confirm payment before they can formally assign a trainer in the system
- Trainer availability must be tracked informally until payment is confirmed
- For time-sensitive programs (e.g., client wants to start in 3 days), admin must ensure payment confirmation happens quickly after invoicing

### If REJECTED — what changes

If the owner rejects this decision and approves a less restrictive gate:

**Option: Order ACTIVE alone is sufficient for program readiness**
- `isProgramReady()` = `orders_pp.status = ACTIVE`
- Invoice PAID is no longer a program gate — revenue risk is accepted
- Admin can create assignments and sessions before payment is confirmed
- Sessions may be delivered without confirmed payment

**Option: Assignments allowed before payment, but sessions blocked**
- `assignments_pp` creation gate: `orders_pp.status = ACTIVE`
- `sessions_pp` creation gate: `invoices_pp.status = PAID`
- This is a split gate: trainer can be formally assigned in the system before payment, but no session can start until paid
- Slightly more complex derivation logic but still no schema change

### If PENDING (decision deferred past Phase 2 start)

If Phase 2 implementation begins before this decision is resolved:
- The conservative default is applied: `invoices_pp.status = PAID` is required for Program Readiness
- This is the safer starting point — it can be relaxed in Phase 5 without breaking existing data
- A relaxation (making the gate less restrictive) is a service-layer change and does not require migration
- A tightening (making the gate more restrictive) after sessions have already been created could create data integrity issues — this is why the conservative default is preferred

### Decision deadline

This decision should be resolved before Phase 5 development begins (assignments, sessions, attendance entities). Phase 2 itself (commercial core) does not implement session or assignment guards, so Phase 2 can proceed with this decision PENDING as long as the derivation rule is documented and the Phase 5 guard specification is held.

---

## Appendix: Decision Tree Summary

```
Invoice generated (DRAFT → SENT)
     │
     ▼
Client pays (payment.status = PENDING)
     │
     ▼
Payment confirmed (Gate 03A: full amount)
(Gate 03B: no prior confirmed payment on this invoice)
     │
     ▼
invoices_pp.status → PAID
     │
     ├──► Gate 04: Receipt generation (one receipt per confirmed payment)
     │
     └──► [PROPOSED GATE — pending owner decision]
          Program Readiness = ELIGIBLE
               │
               ▼
          [Phase 5] assignments_pp creation (trainer formally assigned)
               │
               ▼
          [Phase 5] sessions_pp creation (sessions scheduled)
               │
               ▼
          [Phase 5] Session delivery begins
               │
               ▼
          [Phase 5] attendance_pp records created
               │
               ▼
          Order → COMPLETED (after all sessions delivered)
```

```
Order ACTIVE (commercial gate)
     │
     └──► Agreement generation (Phase 3)
          [Agreement does NOT wait for Invoice PAID]
          [Agreement follows Order ACTIVE]
```

---

*End of Document — OPEN-2A-03-SUB-01 v1.0*

*OWNER DECISION = PENDING — Do not implement until approved.*
