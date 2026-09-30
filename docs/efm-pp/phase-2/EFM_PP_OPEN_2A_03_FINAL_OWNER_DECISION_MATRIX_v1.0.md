# EFM PP — OPEN-2A-03 Final Owner Decision Matrix v1.0

**Document ID:** EFM_PP_OPEN_2A_03_FINAL_OWNER_DECISION_MATRIX_v1.0  
**Status:** OWNER APPROVAL REQUIRED — OPEN-2A-03-A through F  
**Scope:** PP / Private Program — Payment Policy, Payment Deadline, Program Readiness  
**Supersedes (as authoritative register):** All OPEN-2A-03 sub-analyses below remain as historical record; this document is the single authoritative decision register  
**Historical documents preserved unchanged:**
- EFM_PP_OPEN_2A_03_PARTIAL_PAYMENT_DECISION_ANALYSIS_v1.0
- EFM_PP_OPEN_2A_03_PARTIAL_PAYMENT_DECISION_ANALYSIS_v1.1
- EFM_PP_OPEN_2A_03_PAYMENT_TO_PROGRAM_READINESS_DECISION_v1.0
- EFM_PP_OPEN_2A_03_PAYMENT_DEADLINE_URGENT_ORDER_POLICY_ANALYSIS_v1.0
- EFM_PP_OPEN_2A_03_FINAL_PAYMENT_POLICY_CONSOLIDATION_v1.0

**Coding Authorization:** NOT GRANTED — owner approval of OPEN-2A-03-A and OPEN-2A-03-B required before Phase 2A billing service coding begins  
**Do NOT merge PR #534 until owner approvals are recorded**

---

## 1. Executive Summary

OPEN-2A-03 spans the full PP payment policy chain: what kind of payment is accepted, when it must be received relative to program start, how overdue orders are handled, and whether urgent orders can be processed. Five sub-analyses have been completed. This document is the single authoritative decision register.

### What Has Been Established Through Analysis

| Item | Status | Source |
|---|---|---|
| PP uses full payment only — no DP, no installments | PROPOSED | v1.1 owner business input |
| `PARTIALLY_PAID` invoice state does not exist for PP | PROPOSED | v1.1 superseding v1.0 |
| Invoice PAID must gate Program Readiness | PROPOSED | SUB-01 analysis |
| Billing Core vs. Business Policy separation (PP gates are PP-only) | PROPOSED | v1.1 Section 5 |
| Three concepts must remain separate: Payment Due Date / Order Cutoff / Program Readiness Gate | PROPOSED | Deadline analysis Section 3 |
| H-1 / <24h orders must NOT be automatically rejected | PROPOSED | Deadline analysis Section 7 |
| OPEN-2B-04 Split Gate: Order ACTIVE ≠ Program Readiness | **LOCKED** | Owner approved before this document |

### What Remains Unresolved

| Decision | Item | Status |
|---|---|---|
| OPEN-2A-03-A | PP full payment policy | PROPOSED — awaiting owner approval |
| OPEN-2A-03-B | Invoice PAID before Program Readiness | PROPOSED — awaiting owner approval |
| OPEN-2A-03-C | Normal payment deadline H-value | PENDING — recommended H-3, configurable |
| OPEN-2A-03-D | Urgent order threshold | PENDING — recommended H-1 or <24h |
| OPEN-2A-03-E | Urgent authorization authority | PENDING — recommended admin discretion |
| OPEN-2A-03-F | Overdue/extension/cancellation | PENDING — recommended no auto-cancel |

### Cross-Document Contradiction Summary

One significant contradiction was identified and resolved across the OPEN-2A-03 document chain. See Section 13 for full register.

---

## 2. Decision History

The OPEN-2A-03 decision chain unfolded across five documents. Understanding the history explains why some recommendations in earlier documents have been superseded.

### 2.1 v1.0 — Original Partial Payment Analysis (2026-09-29)

**Question asked:** "Should PP support partial payments?"

**Recommendation in v1.0:** Option B — partial payments allowed. The document analyzed scenarios A–J where PP clients might pay in multiple tranches.

**Status:** **SUPERSEDED** by v1.1. The recommendation in v1.0 was based on a generic billing analysis before the owner's business model input was received. v1.0 is preserved unchanged as a historical record but its recommendation must not be acted upon.

### 2.2 v1.1 — Owner Business Model Clarification (2026-09-29)

**Trigger:** Owner provided explicit business model input after v1.0.

**Owner statement (verbatim):** "Invoice PP should normally be settled by FULL PAYMENT. Do not treat partial payment/installment as a normal PP workflow."

**Architectural clarification introduced:** The distinction between Billing Engine Capability (what the system CAN do) and Business Model Payment Policy (what PP IS ALLOWED to do). PP gates are PP-specific service-layer rules; they do not propagate to B2B modules.

**PP gates introduced:** Gate 03A (`payment.amount = invoice.total_amount ± tolerance`), Gate 03B (no second payment confirmation on an invoice with an existing confirmed payment).

**Status:** **Authoritative for PP full payment policy direction.** OWNER DECISION on the formal approval sentence = PENDING.

### 2.3 SUB-01 — Payment → Program Readiness Decision (2026-09-29)

**Question asked:** "Must Invoice PAID gate Program Readiness for PP?"

**Three options analyzed:**
- Option A (Payment First): Invoice PAID → Program Readiness ELIGIBLE. Formal `assignments_pp`, `sessions_pp` blocked until PAID.
- Option B (Scheduling Before Payment): ELIMINATED — directly contradicts owner statement, creates revenue risk.
- Option C (Conditional Scheduling — Recommended): Informal off-system coordination allowed; formal system records blocked until PAID. Functionally identical to Option A at system level.

**Phase 2 Program Readiness derivation:** `orders_pp.status = ACTIVE AND invoices_pp.status = PAID`

**Agreement impact confirmed:** `agreements_pp` is generated after Order ACTIVE, NOT gated by Invoice PAID. This is established Phase 3 architecture and is not changed by this decision.

**Status:** **PROPOSED — awaiting formal owner approval sentence.**

### 2.4 Deadline/Urgent Order Analysis (2026-09-29)

**Question asked:** "When is payment due, and how are H-1 / <24h orders handled?"

**Key findings:**
- A fixed H-2 rule applied universally would silently reject legitimate H-1 orders. This must not occur.
- Three concepts must not be collapsed: Payment Due Date, Order Acceptance Cutoff, Program Readiness Gate.
- Dynamic due-date model recommended: classify orders as NORMAL / SHORT_LEAD / URGENT; compute due date based on classification.
- URGENT orders require payment before Program Readiness but must NOT be auto-rejected due to deadline expiry.

**Status:** PENDING owner decisions on H-values and urgency thresholds.

### 2.5 Final Consolidation (2026-09-29)

Consolidated all sub-analyses into a 15-section document with scenario matrix A–J and contradiction register. Introduced the six-decision register OPEN-2A-03-A through F. This document (the Final Owner Decision Matrix) is the authoritative successor to the consolidation as the formal approval register.

---

## 3. Final PP Payment Model

### 3.1 PP Payment Standard

PP (Private Program) is a retail personal training package product. The EFM commercial standard for PP is:

```
1. Admin creates Order (client selects package: 4/8/12/24 sessions)
2. Admin creates Invoice (total_amount = package price)
3. Invoice sent to client
4. Client transfers FULL AMOUNT in one payment
5. Admin confirms payment in system
6. Gate 03A checks: payment.amount = invoice.total_amount (± tolerance)
7. Gate 03B checks: no prior confirmed payment on this invoice
8. Invoice transitions: SENT → PAID
9. Receipt generated automatically: RCP-PP-YY-xxxx
10. Program Readiness becomes ELIGIBLE (when Order also ACTIVE)
```

One invoice. One confirmed payment. One receipt. This is the PP standard.

### 3.2 What PP Full Payment Policy Means

| Rule | Value |
|---|---|
| Payment standard | FULL PAYMENT |
| Down payment (DP) as standard | NOT APPLICABLE to PP |
| Installment payment as standard | NOT APPLICABLE to PP |
| `PARTIALLY_PAID` invoice status | DOES NOT EXIST for PP |
| Confirmed payments per invoice | EXACTLY ONE (enforced by Gate 03B at service layer) |
| Gate 03A | `payment.amount = invoice.total_amount ± tolerance` |
| Gate 03B | Reject second payment confirmation attempt on an invoice with existing confirmed payment |

### 3.3 What PP Full Payment Policy Does NOT Mean

- It does not mean the database schema is physically incapable of multiple payment rows per invoice. The service layer enforces the policy; the schema reflects general capability.
- It does not mean B2B Event (DP + settlement) or B2B Management (term payments) must use the same model. They will not — they implement separate policies in separate service-layer modules.
- It does not mean partial payment handling is impossible if an exception arises. It means partial payment is NOT STANDARD PP WORKFLOW and the system enforces this unless explicitly overridden by an authorized supervisor role.

### 3.4 PP Standard Package Prices (Authoritative)

| Package | Sessions | Price |
|---|---|---|
| Starter | 4 sesi | Rp 800.000 |
| Base | 8 sesi | Rp 1.600.000 |
| Pro | 12 sesi | Rp 2.400.000 |
| Elite | 24 sesi | Rp 4.800.000 |

All packages: Rp 200.000/session, no discount in base data.

### 3.5 B2B Modules — Policy Separation

| Module | Payment Model | Phase | Relationship to PP |
|---|---|---|---|
| PP | Full payment per invoice | Phase 2 | Baseline — this document |
| B2B Event | Multiple invoices per order (DP + settlement), each fully paid | Phase 3 | SEPARATE service-layer policy |
| B2B Management | Scheduled invoices per contract term, each fully paid | Phase 4+ | SEPARATE service-layer policy |

No PP payment rule applies to B2B modules. No B2B payment rule applies to PP.

---

## 4. Payment → Program Readiness Flow

### 4.1 The Gate

Program Readiness for PP is a DERIVED concept, not a stored status field. It is evaluated by the service layer on demand and is not persisted in the database.

**Phase 2 Program Readiness formula:**

```
Program Readiness = ELIGIBLE
  when:
    orders_pp.status = ACTIVE
    AND invoices_pp.status = PAID
```

If either condition is not met, Program Readiness = NOT_ELIGIBLE.

**Phase 5 additions (when assignments and sessions are implemented):**

```
Program Readiness = ELIGIBLE
  when:
    orders_pp.status = ACTIVE
    AND invoices_pp.status = PAID
    AND assignments_pp.status = CONFIRMED  (Phase 5)
    AND sessions_pp records exist           (Phase 5)
```

Phase 5 additions extend the gate; they do not replace the Phase 2 gate.

### 4.2 The Flow

```
Order Created (status: DRAFT)
     ↓
Admin reviews and opens order (status: PENDING_PAYMENT)
     ↓
Invoice created (status: DRAFT → SENT)
     ↓
Client pays full amount
     ↓
Admin confirms payment
     ├── Gate 03A: payment.amount = invoice.total_amount ± tolerance?
     │     NO → Reject. Admin must correct amount.
     └── Gate 03B: existing confirmed payment on this invoice?
           YES → Reject. Invoice already paid.
           NO → Continue
     ↓
Invoice: SENT → PAID
Receipt generated automatically
Order: PENDING_PAYMENT → ACTIVE
     ↓
Program Readiness = ELIGIBLE
(Order ACTIVE + Invoice PAID — both conditions now met)
     ↓
Phase 5: Formal assignment, session scheduling, delivery
```

### 4.3 What Is NOT Gated by Invoice PAID

**`agreements_pp` (Phase 3):** Generated after Order ACTIVE — NOT gated by Invoice PAID. This is established Phase 3 architecture and is unaffected by this decision.

**Off-system coordination:** Informal trainer identification, schedule proposals, and preliminary coordination before payment are not system-gated. The system does not prevent these activities; it prevents FORMAL SYSTEM RECORDS (assignments, sessions) until PAID.

### 4.4 Six Status Dimensions — Non-Negotiable Separation

The following six dimensions must never be collapsed into a single status field or used interchangeably:

| Dimension | Where Stored | Phase 2 States |
|---|---|---|
| Order Status | `orders_pp.status` | DRAFT → PENDING_PAYMENT → ACTIVE → COMPLETED → CANCELLED → EXPIRED |
| Invoice Status | `invoices_pp.status` | DRAFT → SENT → PAID \| OVERDUE \| CANCELLED |
| Payment Status | `payments_pp.status` | PENDING → CONFIRMED \| REJECTED |
| Program Readiness | Derived (not stored) | NOT_ELIGIBLE / ELIGIBLE |
| Scheduling Status | `assignments_pp` (Phase 5) | Phase 5 scope |
| Session Status | `sessions_pp` (Phase 5) | Phase 5 scope |

---

## 5. Payment Deadline vs Order Cutoff vs Program Readiness

These three concepts MUST remain separate. Collapsing any two of them produces incorrect system behavior.

### 5.1 Concept Definitions

**Payment Due Date**

The date by which payment is expected for a given invoice. If this date passes without payment, the invoice transitions SENT → OVERDUE. Calculated dynamically based on order timing and classification (see Section 6).

Answers: "By when must payment be received?"

**Order Acceptance Cutoff**

How close to program start an order can still enter the normal workflow. This is NOT a system-enforced hard block in Phase 2; it is an operational guideline that admin uses when deciding whether to accept a late-arriving order.

Answers: "Can this order still be accepted given how close we are to the program start?"

**Program Readiness Gate**

The system gate that must be cleared before formal assignment records and session delivery can proceed. For PP: Invoice PAID AND Order ACTIVE. This gate is ALWAYS required regardless of order timing or deadline status.

Answers: "Has this order met all conditions required for formal program delivery to begin?"

### 5.2 Interaction Matrix

| Scenario | Payment Due Date | Order Cutoff | Program Readiness Gate |
|---|---|---|---|
| Normal order (H-7), paid on time | Deadline = H-3 | Accepted normally | ELIGIBLE when paid |
| Normal order, paid late but before start | Deadline passed → OVERDUE → late payment accepted → PAID | Already accepted | ELIGIBLE when paid |
| H-1 urgent order | Deadline = immediate (urgent path) | Admin discretion — NOT auto-rejected | ELIGIBLE when paid (urgency doesn't bypass the gate) |
| <24h same-day order | Deadline = immediate | Admin + operational availability | ELIGIBLE when paid |
| Order accepted, never paid | Deadline passes → OVERDUE | Already accepted | NOT ELIGIBLE until paid |

---

## 6. Normal Order Scenario Matrix

**Classification:** An order with sufficient lead time to follow the standard PP payment workflow.

**Recommended threshold:** NORMAL = H-5 or more before requested program start.

**Normal due date formula (recommended):**

```
If lead_time >= NORMAL_THRESHOLD (H-5):
  due_date = program_start_date − NORMAL_PAYMENT_DAYS (recommended: 3 days = H-3)
```

| Scenario | Order Timing | Classification | Due Date | Invoice Status Sequence | Program Readiness |
|---|---|---|---|---|---|
| A | H-7 | NORMAL | H-3 | DRAFT → SENT → PAID (on time) | ELIGIBLE after PAID |
| B | H-5 | NORMAL | H-3 or same due-date formula | DRAFT → SENT → PAID (on time) | ELIGIBLE after PAID |
| C | H-4 | NORMAL (edge) | H-3 → 1-day window | DRAFT → SENT → PAID (tight) | ELIGIBLE after PAID |
| D | H-3 | SHORT_LEAD boundary | Due immediately or same-day | DRAFT → SENT → immediate PAID required | ELIGIBLE after PAID |

**Notes:**
- At H-4 the standard H-3 deadline gives only 24 hours. This is the upper boundary of SHORT_LEAD classification.
- Scenario C (H-4) may be classified as either NORMAL (tight window) or SHORT_LEAD depending on the configured threshold. The threshold is a configurable parameter, not a hard-coded value.
- For all normal scenarios, Program Readiness is gated by Invoice PAID regardless of whether the deadline was met comfortably or at the last moment.

---

## 7. Short-Lead Scenario Matrix

**Classification:** An order that arrives close enough to program start that the normal deadline window is insufficient or already expired. Requires shortened payment window or immediate payment.

**Recommended threshold:** SHORT_LEAD = H-2 to H-1; URGENT = H-1 or less / <24 hours.

| Scenario | Order Timing | Classification | Payment Requirement | Operational Check | Program Readiness |
|---|---|---|---|---|---|
| E | H-2 | SHORT_LEAD | Payment required within hours (shortened window) | Admin confirms trainer availability | ELIGIBLE after PAID |
| F | H-1 | URGENT | Immediate / same-session payment required | Admin + operational availability confirmation | ELIGIBLE after PAID |
| G | <24 hours | URGENT | Immediate payment required | Admin + operational availability confirmation | ELIGIBLE after PAID |
| H | Same-day | URGENT | Immediate payment required before ANY session delivery | Explicit operational confirmation | ELIGIBLE ONLY after PAID |

**Critical rule for all short-lead / urgent scenarios:**

The system MUST NOT automatically reject an order merely because the normal payment deadline (H-3) has already passed at the time of order creation. H-1 or same-day orders should follow the URGENT path, not trigger automatic rejection.

**Incorrect behavior (must be avoided):**

```
Normal deadline = H-3
Order arrives at H-1
System evaluates: deadline (H-3) is already past
System result: automatic rejection
```

**Correct behavior:**

```
Order arrives at H-1
System classifies: URGENT
System response: immediate payment required; operational availability check
Admin confirms: payment received + availability confirmed
System result: Invoice PAID → Program Readiness ELIGIBLE → delivery proceeds
```

---

## 8. Overdue / Extension / Cancellation

### 8.1 OVERDUE Behavior

When an invoice's `due_date` passes without a confirmed payment:

```
Invoice status: SENT → OVERDUE
(automated transition via scheduled job or service check)
```

**OVERDUE does NOT mean:**
- The order is cancelled
- Payment is no longer accepted
- Program Readiness is further restricted (it remains NOT_ELIGIBLE because Invoice is not PAID, but no additional blocking occurs)

**OVERDUE means:**
- The payment deadline has passed without confirmation
- Admin should follow up
- Late payment is still accepted if confirmed (OVERDUE → PAID is a valid transition)

### 8.2 Late Payment After Deadline

A client who pays after the due date but before the program start can still have the payment confirmed by admin:

```
Invoice: OVERDUE
Client pays (late)
Admin confirms payment
Gate 03A + 03B still checked
Invoice: OVERDUE → PAID
Order: PENDING_PAYMENT → ACTIVE
Program Readiness: → ELIGIBLE
```

Late payment does not permanently block the order. Whether to accept it is an admin operational decision, not a system block.

### 8.3 Admin Actions on Overdue Orders

An authorized admin may take the following actions on an OVERDUE order (subject to audit):

| Action | Condition | Audit Required |
|---|---|---|
| Follow up with client | Always available | No system action required |
| Extend payment deadline | Admin authorization + documented reason | YES — who extended, when, new deadline, reason |
| Cancel order | Admin authorization | YES — who cancelled, when, reason, client notification |
| Accept late payment | Client pays; admin confirms via normal flow | Standard payment confirmation audit trail |

### 8.4 Order Expiry (OPEN-2A-03-F — PENDING)

Whether an OVERDUE order eventually transitions to EXPIRED automatically (e.g., after program start passes with no payment) is a business policy decision.

**Recommended default (Phase 2):** No automatic expiry. Admin follows up and decides. This is Option A from the consolidation analysis.

**Rationale:** Automatic expiry without human review risks incorrectly closing orders where the client intends to pay but had a temporary delay. For Phase 2 volume (low-to-medium), manual admin follow-up is operationally feasible.

---

## 9. Urgent Authorization

### 9.1 Minimum Requirements for Urgent Order Processing

An URGENT order (H-1 / <24h / same-day) requires all of the following before formal program delivery:

1. **Operational availability confirmed** — a trainer is available and the session slot exists
2. **Full payment** — same Gate 03A and Gate 03B as normal orders; no payment reduction for urgency
3. **Invoice PAID** — same Program Readiness gate as normal orders; urgency does not bypass it
4. **Audit trail** — order creation timestamp, start date/time, and who processed it are inherently captured; optional explicit `urgent_reason` field

### 9.2 Authorization Model (OPEN-2A-03-E — PENDING)

**Phase 2 recommended default:** No additional system-level approval required for URGENT classification. Any authorized EFM admin may process an urgent order subject to:
- Operational availability confirmed (admin verification, not system-enforced in Phase 2)
- All standard payment gates enforced
- Audit trail through existing fields (`created_at`, `start_date`, `created_by`)

**Phase 3 optional enhancement:** Formal urgent approval workflow with `urgent_approved_by` and `urgent_approved_at` fields. This is a system governance enhancement, not a Phase 2 requirement.

### 9.3 Audit Fields

**Phase 2 minimum (derived from existing schema):**
- `orders_pp.created_at` — when order was created
- `orders_pp.start_date` — requested program start
- Computed: `start_date - created_at` = lead time; urgency classification derivable
- `orders_pp.created_by` — who created the order

**Phase 2 optional (1 column, 0 required schema changes if deferred):**
- `orders_pp.urgent_reason` — TEXT, nullable — captures admin note for urgent orders

**No new entity required.** Urgent order support does not require a new table or migration.

---

## 10. Full Scenario Matrix

All thirteen scenarios cover the complete PP payment lifecycle.

| ID | Label | Lead Time | Classification | Order Status | Invoice Status | Payment Req. | Readiness | Assignment | Session | Expiry/Cancel Behavior |
|---|---|---|---|---|---|---|---|---|---|---|
| A | Normal — early | H-7 | NORMAL | ACTIVE after payment | PAID | Full, by H-3 | ELIGIBLE | ALLOWED | ALLOWED | N/A — paid on time |
| B | Normal — standard | H-5 | NORMAL | ACTIVE after payment | PAID | Full, by H-3 | ELIGIBLE | ALLOWED | ALLOWED | N/A — paid on time |
| C | Normal — tight | H-4 | NORMAL/SHORT_LEAD boundary | ACTIVE after payment | PAID | Full, by H-3 (24h window) | ELIGIBLE | ALLOWED | ALLOWED | N/A — paid in window |
| D | Short lead | H-3 | SHORT_LEAD | ACTIVE after payment | PAID | Full, immediate/same-day | ELIGIBLE | ALLOWED | ALLOWED | N/A — paid immediately |
| E | Short lead — tight | H-2 | SHORT_LEAD | ACTIVE after payment | PAID | Full, within hours | ELIGIBLE | ALLOWED | ALLOWED | N/A — paid in window |
| F | Urgent | H-1 | URGENT | PENDING_PAYMENT until paid | SENT until paid | Full, immediate | ELIGIBLE after PAID | ALLOWED | ALLOWED | PENDING_PAYMENT → ACTIVE on payment |
| G | Urgent — very short | <24h | URGENT | PENDING_PAYMENT until paid | SENT until paid | Full, immediate | ELIGIBLE after PAID | ALLOWED | ALLOWED | PENDING_PAYMENT → ACTIVE on payment |
| H | Same-day | Same-day | URGENT | PENDING_PAYMENT until paid | SENT until paid | Full, before session | ELIGIBLE after PAID | ALLOWED only after PAID | ALLOWED only after PAID | Blocked until PAID |
| I | Normal — unpaid by deadline | H-5 + deadline passed | NORMAL | PENDING_PAYMENT | OVERDUE | Full (late) | NOT ELIGIBLE | BLOCKED | BLOCKED | Admin: follow up / extend / cancel. No auto-cancel. |
| J | Late payment accepted | H-5, paid after deadline | NORMAL | ACTIVE (after late payment confirmed) | OVERDUE → PAID | Full (confirmed late) | ELIGIBLE after PAID | ALLOWED | ALLOWED | Late payment accepted; OVERDUE → PAID valid transition |
| K | Urgent + payment confirmed | H-1, paid immediately | URGENT | ACTIVE | PAID | Full, immediate | ELIGIBLE | ALLOWED | ALLOWED | Normal; URGENT path completed successfully |
| L | Urgent + payment not confirmed | H-1, not paid | URGENT | PENDING_PAYMENT | SENT → OVERDUE | Full required | NOT ELIGIBLE | BLOCKED | BLOCKED | Admin: follow up. No auto-cancel. OVERDUE → PAID still possible if client pays. |
| M | Urgent + availability unavailable | H-1, operational check fails | URGENT | Remains PENDING_PAYMENT | Not yet issued or SENT | Full required | NOT ELIGIBLE (no availability) | BLOCKED | BLOCKED | Admin must resolve availability before proceeding. Order not auto-cancelled. |

---

## 11. Agreement vs T&C vs System Logic

### 11.1 Three Layers of Rule Authority

PP payment policy exists in three distinct layers. Collapsing them produces ambiguity about where rules live and how they can be changed.

| Layer | What It Contains | Can It Be Changed Without Code? |
|---|---|---|
| **Agreement** | Finalized commercial/legal commitment for the specific order: parties, package, price, payment reference | NO — immutable after signing (write-once) |
| **T&C / Program Guide** | Operational policy: payment deadline window, urgent order procedure, cutoff guidance, cancellation terms | YES — policy document update |
| **System Logic** | Enforced rules: Gate 03A, Gate 03B, Invoice PAID gate, OVERDUE transition | NO — requires code change |

### 11.2 Rule-to-Layer Mapping

| Rule | Agreement | T&C/Program Guide | System Logic |
|---|---|---|---|
| PP full payment (Gate 03A) | NO | YES | YES — service-layer gate |
| One payment per invoice (Gate 03B) | NO | NO | YES — service-layer gate |
| Invoice PAID before Program Readiness | NO | YES | YES — Program Readiness gate |
| Normal payment deadline (H-3) | Payment dates referenced | YES — operational deadline | YES — due_date computation |
| Urgent order procedure | NO | YES — procedure description | Partial — classification only |
| OVERDUE transition trigger | NO | YES — consequences stated | YES — scheduled job or service |
| Admin deadline extension | NO | YES — authorization described | NO (Phase 2) |
| Agreement generation trigger | N/A | NO | YES — Order ACTIVE (Phase 3) |

### 11.3 What the Agreement Does NOT Gate

**The `agreements_pp` entity (Phase 3)** is generated after Order ACTIVE. It is NOT gated by Invoice PAID. This is established Phase 3 architecture.

If Invoice PAID has not occurred when Order becomes ACTIVE, the Agreement can still be generated. The Agreement documents the commercial terms. Payment remains a separate obligation tracked on the Invoice dimension.

---

## 12. 3–5 Year Compatibility

### 12.1 PP Gates Are PP-Only

Gate 03A and Gate 03B are checked ONLY in the PP billing service path. Future modules implement their own gates:

```
billing.service
     ↓
module = 'PP'
     ├── Gate 03A: payment.amount = invoice.total_amount ± tolerance
     ├── Gate 03B: no prior confirmed payment
     └── Gate 04: receipt per confirmed payment (universal)

module = 'B2B_EVENT' (Phase 3)
     ├── Invoice type check: DP before FINAL
     ├── DP minimum amount check
     └── Gate 04: receipt per confirmed payment (universal)

module = 'B2B_MGMT' (Phase 4+)
     ├── Contract billing schedule engine
     ├── Invoice-per-term validation
     └── Gate 04: receipt per confirmed payment (universal)
```

**Gate 04 (receipt per confirmed payment) is universal.** Gates 03A and 03B are PP-only.

### 12.2 No Cross-Contamination Rules

| Rule | PP | B2B Event | B2B Management |
|---|---|---|---|
| Full payment per invoice | YES | YES (per milestone invoice) | YES (per term invoice) |
| DP on single invoice | NO | NOT APPLICABLE — multiple invoices used instead | NOT APPLICABLE |
| PARTIALLY_PAID status | DOES NOT EXIST | DOES NOT EXIST | DOES NOT EXIST |
| Invoice type field | Not needed | DP / FINAL / SUPPLEMENTAL | Per-term reference |
| Multiple invoices per order | Not standard (1 invoice) | YES — by design | YES — by billing schedule |

B2B Event achieves DP + settlement through MULTIPLE FULL-PAID INVOICES per order — not through partial payment on a single invoice. This is an important architectural distinction confirmed in v1.1 Section 3.

### 12.3 Module-Scoped Naming (Already in Plan)

All PP Phase 2 entities use PP-scoped naming: `orders_pp`, `invoices_pp`, `payments_pp`, `receipts_pp`. Future B2B modules use their own scoped tables. No shared billing tables exist in Phase 2.

This naming convention ensures PP policy changes in service code are isolated to the PP billing service and cannot accidentally affect B2B modules.

---

## 13. Contradiction Resolution

Five contradictions were identified across the OPEN-2A-03 document chain. All five are resolved here.

### C-01 — CRITICAL: Partial Payment Recommendation vs Full Payment Owner Direction

**Source A:** EFM_PP_OPEN_2A_03_PARTIAL_PAYMENT_DECISION_ANALYSIS_v1.0 — Section 4 recommended partial payments (Option B) as the PP policy.

**Source B:** EFM_PP_OPEN_2A_03_PARTIAL_PAYMENT_DECISION_ANALYSIS_v1.1 — Owner business input: PP = full payment only. No DP, no installments.

**Resolution:** **v1.1 supersedes v1.0.** v1.0 analyzed PP without the owner's business model input. v1.1 was created explicitly to revise v1.0 after that input was received. v1.0 is preserved as a historical document; its recommendation must not be acted upon.

**Impact:** `PARTIALLY_PAID` does NOT exist as a valid invoice status for PP. Gate 03A enforces full payment. Gate 03B enforces one payment per invoice.

### C-02 — Order Status Naming

**Source A:** Phase 2 ER Matrix uses `PENDING` as an intermediate order status.

**Source B:** Phase 2 Decision Matrix and subsequent documents use `PENDING_PAYMENT` for the same status.

**Resolution:** **`PENDING_PAYMENT` is preferred.** It is semantically unambiguous — it explicitly signals that the order is waiting for payment rather than waiting for some other condition. All Phase 2 coding must use `PENDING_PAYMENT`.

### C-03 — PARTIALLY_PAID Invoice Status Existence

**Source A:** Phase 2 Batch 2A Commercial Core document conditionally included `PARTIALLY_PAID` in the invoices status enum, noting it was "to be confirmed."

**Source B:** v1.1 analysis states clearly that PP does not use `PARTIALLY_PAID`.

**Resolution:** **`PARTIALLY_PAID` does NOT exist for PP.** The `invoices_pp.status` enum is: `DRAFT`, `SENT`, `PAID`, `OVERDUE`, `CANCELLED`. No `PARTIALLY_PAID` state.

### C-04 — Program Readiness Gate Scope

**Source A:** Phase 2 Decision Matrix Section 6.2 listed only `Order ACTIVE` as the commercial gate for Program Readiness.

**Source B:** SUB-01 (Payment → Program Readiness analysis) added `Invoice PAID` as a mandatory gate alongside `Order ACTIVE`.

**Resolution:** **Not a true contradiction — SUB-01 extended the rule.** The Decision Matrix was written before the payment/readiness sub-analysis was completed. SUB-01 adds `Invoice PAID` as a required condition. Both conditions apply: `Order ACTIVE AND Invoice PAID`. The Decision Matrix's listing was incomplete, not incorrect.

### C-05 — assessments_pp FK Reference

**Source A:** Phase 2 Batch 2B text used `client_id` as the FK reference for `assessments_pp`.

**Source B:** Phase 2 ER Matrix Section 6.15 uses `participant_id` as the FK reference for `assessments_pp`.

**Resolution:** **`participant_id` is authoritative.** This was resolved in the Phase 2 Decision Matrix Section 7.3. `assessments_pp.participant_id` is the correct foreign key. This is a Batch 2B text error, not an architectural conflict.

---

## 14. Final Decision Register

| ID | Decision | Status | Coding Blocker |
|---|---|---|---|
| OPEN-2A-03-A | PP Full Payment Policy | **PROPOSED** — owner approval required | YES — blocks billing service Gate 03A/03B |
| OPEN-2A-03-B | Invoice PAID before Program Readiness | **PROPOSED** — owner approval required | YES — blocks Program Readiness service logic |
| OPEN-2A-03-C | Normal payment deadline H-value | **PENDING** — recommended H-3, configurable | YES — must confirm before billing service coding |
| OPEN-2A-03-D | Urgent order threshold | **PENDING** — recommended H-1 or <24h | No (can use recommended default) |
| OPEN-2A-03-E | Urgent authorization authority | **PENDING** — recommended admin discretion | No (can use recommended default) |
| OPEN-2A-03-F | Overdue/extension/cancellation | **PENDING** — recommended no auto-cancel | No (can use recommended default) |

**PROPOSED** = analysis complete; recommendation made; awaiting formal owner approval sentence.

**PENDING** = analysis complete; recommended default available; formal decision deferred; default can be used for Phase 2 coding if owner confirms default is acceptable.

**No decision in this register is LOCKED.** OPEN-2B-04 (Split Gate, separately approved) is LOCKED and is not re-opened here.

---

## 15. Final Owner Approval Section

The following sentences are proposed for formal owner approval. Each sentence, when approved, locks the corresponding decision for Phase 2 implementation.

Each sentence is labeled **PROPOSED FOR OWNER APPROVAL** until the owner provides a formal response.

---

### OPEN-2A-03-A — PP Full Payment Policy

**PROPOSED FOR OWNER APPROVAL:**

> "PP orders shall use full payment only. Down payment (DP), installment payment, and PARTIALLY_PAID invoice states shall not apply to PP. The billing service enforces Gate 03A (payment.amount must equal the invoice's total amount within tolerance) and Gate 03B (a second payment confirmation on an invoice with an existing confirmed payment must be rejected). These gates apply to PP only and do not constrain B2B Event or B2B Management payment policies."

**If approved:** OPEN-2A-03-A → LOCKED. Phase 2 billing service may implement Gate 03A and Gate 03B.

---

### OPEN-2A-03-B — Invoice PAID before Program Readiness

**PROPOSED FOR OWNER APPROVAL:**

> "A PP invoice must have status PAID before the PP order can enter formal Program Readiness. No formal trainer assignment records, session records, or session delivery shall be created in the system until the PP invoice is fully paid. Informal off-system coordination (trainer identification, schedule proposals) before payment is not system-gated."

**If approved:** OPEN-2A-03-B → LOCKED. Program Readiness derivation = `Order ACTIVE AND Invoice PAID`.

---

### OPEN-2A-03-C — Normal Payment Deadline

**PROPOSED FOR OWNER APPROVAL:**

> "The default normal PP payment deadline shall be H-3 before the requested program start, meaning the invoice is due three days before the program's first session. This deadline shall be implemented as a configurable policy parameter rather than a hard-coded universal rule, so that individual orders or future policy updates can adjust the deadline without system code changes."

**If approved:** OPEN-2A-03-C → LOCKED. Billing service computes `due_date = start_date − 3 days` for NORMAL orders, using a configurable parameter.

---

### OPEN-2A-03-D — Urgent Order Threshold

**PROPOSED FOR OWNER APPROVAL:**

> "PP orders placed H-1 or less than 24 hours before the requested program start shall be classified as URGENT and shall not be automatically rejected solely because the normal payment deadline has already passed. URGENT orders shall require immediate full payment, operational availability confirmation, and completion of all standard payment gates before formal program delivery."

**If approved:** OPEN-2A-03-D → LOCKED. Service classifies orders with lead time < 24 hours as URGENT. No auto-rejection path.

---

### OPEN-2A-03-E — Urgent Authorization Authority

**PROPOSED FOR OWNER APPROVAL:**

> "Urgent PP orders may be processed by any authorized EFM administrator without requiring a separate approval step in the system, provided that operational availability is confirmed, full payment is received, all standard payment gates pass, and the processing is recorded in the standard audit trail through existing fields. A formal urgent approval workflow with dedicated database fields may be added in a future phase if operational volume warrants it."

**If approved:** OPEN-2A-03-E → LOCKED. No new approval entity or table required for Phase 2.

---

### OPEN-2A-03-F — Overdue / Extension / Cancellation

**PROPOSED FOR OWNER APPROVAL:**

> "An unpaid PP order that passes its payment deadline shall have its invoice status transition to OVERDUE rather than automatically cancelling the order or blocking further admin action. Authorized administrators may follow up with the client, extend the payment deadline, or cancel the order, subject to audit trail requirements. Late payment confirmation is accepted if the client pays after the deadline; the invoice transitions from OVERDUE to PAID upon confirmed full payment. No automatic order cancellation or expiry shall occur due to payment deadline passage in Phase 2."

**If approved:** OPEN-2A-03-F → LOCKED. No auto-cancel logic in Phase 2. OVERDUE → PAID is a valid transition.

---

## 16. Final Readiness Verdict

### Is OPEN-2A-03 Fully Locked?

**NO.** As of this document, no decision in OPEN-2A-03-A through F is formally LOCKED. All are PROPOSED or PENDING, awaiting owner formal approval.

### Which A–F Remain Pending?

| Decision | Can Coding Begin With Recommended Default? | Priority |
|---|---|---|
| A — PP full payment | NO — this is the foundational billing policy; must be formally approved | Critical |
| B — Invoice PAID before Program Readiness | NO — this determines the Program Readiness gate formula | Critical |
| C — Normal deadline H-value | NO — this determines the due_date computation in billing service | Must confirm before billing service coding |
| D — Urgent threshold | YES (use H-1 / <24h as default) | Confirm before or shortly after coding begins |
| E — Urgent authorization | YES (use admin discretion as default) | Confirm before or shortly after coding begins |
| F — Overdue behavior | YES (use no-auto-cancel as default) | Confirm before or shortly after coding begins |

### What Blocks Batch 2A?

Batch 2A billing service coding requires the following decisions to be formally approved before the first line of billing service code is written:

1. **OPEN-2A-03-A** — formal owner approval of PP full payment policy
2. **OPEN-2A-03-B** — formal owner approval of Invoice PAID as Program Readiness gate
3. **OPEN-2A-03-C** — formal confirmation of H-3 as the normal deadline (or owner specifies alternative)
4. **OPEN-2B-01** — participant model (separate decision, critical for Batch 2B; Batch 2A may begin independently if OPEN-2B-01 is resolved separately)
5. **OPEN-NEW-01** — refund entity scope (confirm whether Phase 2 or Phase 3)

### Is OPEN-2B-01 the Next Major Blocker?

**YES.** OPEN-2B-01 (group participant capacity model) blocks Batch 2B coding. It does not block Batch 2A billing service coding if OPEN-2A-03 is approved first. The two batches can be developed in sequence: Batch 2A (after OPEN-2A-03 approval) → Batch 2B (after OPEN-2B-01 approval).

### Is OPEN-NEW-01 Still Blocking?

**CONDITIONALLY.** OPEN-NEW-01 (refund entity) determines whether a `refunds_pp` table is included in Phase 2 schema. If deferred to Phase 3, Batch 2A coding can proceed without it. The recommendation from Phase 2 analysis is to include a minimal `refunds_pp` entity in Phase 2 to avoid schema migration in Phase 3. If the owner defers it, Batch 2A proceeds without it. This is a medium-priority blocker.

### Exactly What Must Be Approved Before Coding?

**Minimum required approvals to unblock Phase 2A billing service coding:**

| # | Decision | Action Required |
|---|---|---|
| 1 | OPEN-2A-03-A | Owner approves full payment sentence (Section 15) |
| 2 | OPEN-2A-03-B | Owner approves Invoice PAID gate sentence (Section 15) |
| 3 | OPEN-2A-03-C | Owner confirms H-3 or specifies alternative H-value |
| 4 | OPEN-NEW-01 | Owner confirms: include `refunds_pp` in Phase 2, or defer to Phase 3 |

**After these four approvals, Phase 2A billing service coding is authorized.**

OPEN-2A-03-D, E, F can be finalized during or shortly after Phase 2A coding begins, using the recommended defaults documented in Section 15. They do not gate the start of coding.

---

*This document is the final authoritative decision register for OPEN-2A-03. Historical sub-analysis documents are preserved unchanged as the decision chain record.*

*NO APPLICATION CODE. NO MIGRATION. NO DATABASE CHANGE. NO API. NO FRONTEND.*

*Do NOT merge PR #534 until owner approvals are formally recorded and coding is authorized.*
