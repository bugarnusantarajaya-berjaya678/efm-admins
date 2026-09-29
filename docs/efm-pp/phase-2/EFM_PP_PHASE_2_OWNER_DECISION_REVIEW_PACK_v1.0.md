# EFM PP Phase 2 — Owner Decision Review Pack
**Version:** 1.0  
**Status:** PENDING OWNER REVIEW  
**Date:** 2026-09-29  
**Prepared by:** Architecture Review Process  
**Source Documents:**
- `EFM_PP_PHASE_2_BATCH_2A_COMMERCIAL_CORE_ARCHITECTURE_LOCK_v1.0.md`
- `EFM_PP_PHASE_2_BATCH_2B_PARTICIPANT_ASSESSMENT_ARCHITECTURE_LOCK_v1.0.md`
- `EFM_PP_PHASE_2_CROSS_BATCH_ARCHITECTURE_RECONCILIATION_v1.0.md`
- `EFM_PP_PHASE_2_ENTITY_RELATIONSHIP_AND_SOURCE_OF_TRUTH_MATRIX_v1.0.md`

> **IMPORTANT NOTICE:** All items marked `RECOMMENDATION` in this document are proposals for owner consideration — they are NOT locked architectural decisions. Recommendations become locked decisions ONLY upon explicit owner approval. No coding may begin on any open decision until that decision is locked.

---

## 1. Executive Summary

Phase 2 of EFM V2 establishes the commercial core (orders, invoices, payments, receipts) and participant/assessment subsystem for the Private Program (PP) module. Four architecture documents have been written and locked for technical structure. However, **9 decisions remain open** that cannot be resolved by the architecture team alone — they require business judgment from the owner.

**Overall Phase 2 Readiness: BLOCKED on 2 critical decisions**

| Dimension | Status |
|---|---|
| Technical architecture | ✅ LOCKED — all 15 entities fully specified |
| Database schema structure | ✅ LOCKED — migration files 001–005 sequenced |
| API endpoint design | ✅ LOCKED — all service modules mapped |
| Business rule decisions | ⛔ BLOCKED — 9 open decisions, 2 are CRITICAL |
| Coding authorization | ⛔ BLOCKED — cannot start until critical decisions locked |

**The 2 critical blockers:**

1. **OPEN-2B-04 (Assessment Gate)** — Must the client complete a health/fitness assessment BEFORE an Order can be created? This single decision changes the Order creation service from a 4-step to a 6-step process, changes the validation gate logic, and determines whether the `assessments` table is linked at order-entry time or post-order. This is a **pure business decision** about EFM's training philosophy and risk management, not a technical question.

2. **OPEN-2A-03 (Partial Payments)** — Can a client pay an invoice in multiple installments, or is each invoice always settled by a single payment? This decision changes the `payments` table cardinality from one-to-one to one-to-many, changes the receipt generation trigger (receipt per invoice vs. receipt per payment), and affects the financial reporting model. The current architecture spec anticipates multiple payments per invoice but the legacy behavior shows single-payment.

**All other 7 decisions are HIGH/MEDIUM/LOW impact** and can be locked in a 30-minute owner consultation. They do not individually block coding start, but must be resolved before their respective service modules can be implemented.

**Recommendation: Schedule a 60-minute owner review session covering decisions in this order:**
1. OPEN-2B-04 (Assessment Gate) — 15 min
2. OPEN-2A-03 (Partial Payments) — 15 min
3. OPEN-2A-01 + OPEN-2B-01 + OPEN-2B-02 (IDs + participant capacity) — 15 min
4. OPEN-2A-04 + OPEN-2A-05 + OPEN-2B-03 (secondary decisions) — 10 min
5. OPEN-2A-02 (payment ID format, lowest impact) — 5 min

---

## 2. Complete Open Decision Register

All 9 open decisions extracted from Phase 2 architecture documents, with source references.

| # | Decision ID | Short Title | Source Doc | Impact | Blocks Coding Of | Business or Technical |
|---|---|---|---|---|---|---|
| 1 | OPEN-2B-04 | Assessment as Pre-Order Gate | Batch 2B | **CRITICAL** | Order service, Validation Gate 03 | **BUSINESS** |
| 2 | OPEN-2A-03 | Partial Payments Policy | Batch 2A | **HIGH** | Payment service, Receipt trigger | **BUSINESS** |
| 3 | OPEN-2A-01 | Client ID Format | Batch 2A | MEDIUM | Client service, ID generator | TECHNICAL |
| 4 | OPEN-2B-01 | Group Participant Capacity Source | Batch 2B | MEDIUM | Order validation, Participant service | **BUSINESS** |
| 5 | OPEN-2B-02 | Participant ID Format | Batch 2B | MEDIUM | Participant service, ID generator | TECHNICAL |
| 6 | OPEN-2A-04 | Promo/Discount Entity Scope | Batch 2A | MEDIUM | Order service, Discount logic | **BUSINESS** |
| 7 | OPEN-2A-05 | Quotation Entity Phase | Batch 2A | LOW | Quotation service (separate from Order) | TECHNICAL |
| 8 | OPEN-2B-03 | Assessment Data Structure | Batch 2B | LOW | Assessment service implementation | TECHNICAL |
| 9 | OPEN-2A-02 | Payment ID Format | Batch 2A | LOW | ID generator config only | TECHNICAL |

**Decision classification key:**
- **BUSINESS** = requires owner judgment about EFM's operating model, client experience, or financial policy
- **TECHNICAL** = architecture team can recommend; owner confirms or delegates

---

## 3. Priority Classification

### CRITICAL (Must lock before any Phase 2 coding begins)

#### OPEN-2B-04 — Assessment as Pre-Order Gate
**Why CRITICAL:** This is a foundational architectural question that determines the shape of the Order creation flow. If assessment is required before Order, the entire Order service must check assessment existence/validity before allowing creation. This changes 4 files, 2 validation gates, and the UX flow. Getting this wrong and changing it mid-implementation would require refactoring across the entire Order module.

**The core question:** Is EFM's training philosophy "assessment first, then commit to program" or "commit to program first, then assess during onboarding"?

**Current spec (locked):** The assessment entity exists and is linked to both the client AND optionally to an order. The OPEN decision is whether the order creation endpoint MUST verify a recent assessment before proceeding.

---

#### OPEN-2A-03 — Partial Payments Policy
**Why CRITICAL (HIGH):** The payments table is currently spec'd as `one payment → one invoice`, but the cross-batch document acknowledges the real-world scenario where clients pay 50% upfront and 50% at month 3. If this is allowed, the architecture must support:
- Multiple payment records per invoice
- Invoice status derived from sum of payments vs. invoice total
- Receipt generated per payment (not per invoice)
- Balance-due field on invoice

If this is NOT allowed (each invoice = single payment), the architecture is simpler and the existing spec is sufficient. This decision directly determines whether the Payment service is 200 lines of code or 600 lines of code.

---

### HIGH (Lock within first development sprint — blocks specific service modules)

#### OPEN-2A-04 — Promo/Discount Entity Scope
**Why HIGH:** Discounts appear in the commercial snapshot (write-once at order creation). If the discount entity is a full lookup table, it must exist in the database before order creation can reference it. If discounts are handled as free-text fields on the order (no FK), they can be coded later without blocking order creation.

**Impact:** The `order_commercial_snapshots` table currently has a `promo_code TEXT` column. The question is whether there's a `promos` lookup table with validation, or just a free-text field.

---

#### OPEN-2B-01 — Group Participant Capacity Source
**Why HIGH (MEDIUM, but blocks participant validation):** For group PP programs (where multiple participants share a trainer session), what is the maximum participant count?
- Option A: Fixed per Package (`pp_packages.max_participants`)
- Option B: Per Order (admin sets capacity when creating the order)
- Option C: Legacy `kapasitas` field inherited from old system

If Option A, the Order validation gate must check `package.max_participants`. If Option B, the Order creation form needs a capacity input field. This affects Validation Gate 07 (participant count check) directly.

---

### MEDIUM (Can be locked in parallel with early sprint coding — do not block start)

#### OPEN-2A-01 — Client ID Format
Three options are in scope:
- **Option A: `KL-xxxx`** — matches legacy Bahasa prefix pattern, but non-standard (no year, no module)
- **Option B: `CLT-PP-YY-xxxx`** — follows EFM ID format convention (module + year + sequence)
- **Option C: UUID** — no human-readable format, but no ID generator needed

The decision affects the ID generator configuration (one line in `id.generator.js`), client-facing documents (proposals, agreements), and the legacy compatibility lookup. This is low-effort to change even after initial implementation.

**Note:** Client IDs appear on Agreements and potentially on client-facing documents. The owner may have a preference about what clients see.

---

#### OPEN-2B-02 — Participant ID Format
Three options:
- **Option A: `PAX-PP-YY-xxxx`** — new entity, new ID pattern
- **Option B: UUID** — no human-readable ID, simplest implementation
- **Option C: Reuse Client ID** — participant IS client (no separate ID), linked via `client_id` FK

Option C is architecturally risky. A participant record captures a client's state within a specific order at a specific time. Using the client ID as the participant ID would prevent the same client from appearing in two orders simultaneously. Option C is strongly discouraged.

---

### LOW (Can be deferred to the specific sprint that implements that feature)

#### OPEN-2A-05 — Quotation Entity Phase
Does Phase 2 include a formal Quotation entity (the pre-invoice commercial offer), or is this deferred to a later phase? Current Phase 2 spec has Order → Invoice without a Quotation step. The PP legacy flow does include quotation-style documents.

**Impact:** If added in Phase 2, it's a new entity, new migration, new service. If deferred, it can be added as Phase 3 without touching Phase 2 code (invoices don't depend on quotations in the current spec).

---

#### OPEN-2B-03 — Assessment Data Structure
Three options for storing body composition, girth, and fitness data:
- **Option A: Strict columns** — 20+ separate columns for every measurement
- **Option B: JSONB blob** — all measurements in one flexible JSON column
- **Option C: Hybrid** — core Tanita fields as columns (most queried), additional measurements as JSONB

The architecture documents already lean toward Option C (Hybrid) as a RECOMMENDATION. This is a technical decision with modest business input needed — the owner should confirm whether Tanita measurements need to be individually queryable/sortable in reports.

---

#### OPEN-2A-02 — Payment ID Format
Two options:
- **Option A: `PAY-PP-YY-xxxx`** — follows EFM ID convention
- **Option B: UUID** — simpler, no generator needed

Payment IDs appear on receipts. If receipts are client-facing, a human-readable ID (`PAY-PP-26-0001`) is more professional. This is a cosmetic decision with negligible technical impact.

---

## 4. Dependency Map

Understanding which decisions must precede others is critical for planning the owner review session.

```
DECISION DEPENDENCY GRAPH — Phase 2

OPEN-2B-04 (Assessment Gate)
  └─► Validation Gate 03 (Order creation gate)
  └─► Order service implementation (step count: 4 vs 6)
  └─► Assessment service link-on-creation vs link-post-creation
  └─► OPEN-2B-01 (participant capacity) — parallel, no dependency

OPEN-2A-03 (Partial Payments)
  └─► Payment service architecture (simple vs complex)
  └─► Receipt generation trigger (per invoice vs per payment)
  └─► Invoice status logic (direct vs derived from sum of payments)
  └─► OPEN-2A-02 (Payment ID format) — downstream, inherits this decision

OPEN-2A-01 (Client ID)
  └─► ID generator config (one file, minimal code)
  └─► OPEN-2B-02 (Participant ID) — same pattern decision, can be resolved together

OPEN-2A-04 (Promo/Discount Scope)
  └─► Order service (promo validation vs free-text)
  └─► Commercial snapshot structure (FK vs text field)
  └─► OPEN-2A-05 (Quotation) — independent, no dependency

OPEN-2B-03 (Assessment Data)
  └─► Migration 003 column definitions
  └─► Assessment service field mapping
  └─► Independent from all other decisions
```

**Decisions that can be locked in any order:**
- OPEN-2A-01 and OPEN-2B-02 (ID formats — batch together)
- OPEN-2A-04 and OPEN-2A-05 (commercial scope additions — batch together)
- OPEN-2B-03 (completely isolated, can be async with everything else)
- OPEN-2A-02 (cosmetic, lock last)

**Hard ordering required:**
1. OPEN-2B-04 MUST be locked before Order service coding begins
2. OPEN-2A-03 MUST be locked before Payment service design is finalized
3. OPEN-2A-04 MUST be locked before Order service coding begins (promo validation is part of order creation)
4. OPEN-2B-01 MUST be locked before Participant service validation is coded

---

## 5. Critical Decision Analysis

### 5A. Deep Analysis — OPEN-2B-04: Assessment as Pre-Order Gate

#### The Decision in Plain Language
Before EFM can create a new Private Program order for a client, must that client have a completed health/fitness assessment on file? Or can admin create the order first, and assessment happens during the initial sessions?

#### Three Scenarios

**Scenario A: No Gate — Assessment is Optional at Order Time**
- Order creation has NO check for assessment existence
- Assessment can happen anytime: before first session, at month 3 check-in, or never
- The `order_id FK` on the assessments table exists but is populated after the fact
- Assessment is linked to the Order retrospectively (by order service writing back to assessment record, OR by assessment service including `order_id` when creating the assessment)

*Operational reality:* Admin creates Order on day 1. Trainer conducts first session. Assessment happens at session 2 or whenever trainer decides. Result: some clients accumulate orders with zero assessments.

*Risk:* No baseline for measuring program effectiveness. If a client has a health event during training, EFM has no pre-program health screening on record.

*Who chooses this:* Owners who view assessment as operational convenience, not a commercial requirement.

---

**Scenario B: Hard Gate — Assessment Required Before Order**
- Order service Validation Gate 03 checks: does client have an assessment dated within the last 6 months (or some configured window)?
- If no valid assessment: order creation is REJECTED with error `ASSESSMENT_REQUIRED_BEFORE_ORDER`
- Admin must create the assessment record first, then retry order creation
- The assessment automatically gets `order_id` populated when the order is created

*Operational reality:* Two-step admin flow. First: intake session with assessment. Second: order creation (which now proceeds because assessment exists). More paperwork but a complete health record.

*Risk:* Friction in the sales process. A client who wants to start "right now" faces an extra step. For impulsive buyers, this may reduce conversion.

*Who chooses this:* Owners who view assessment as a non-negotiable professional standard, risk management, and EFM brand differentiator.

---

**Scenario C: Split Gate — Commercial Active ≠ Program Ready (RECOMMENDED)**
This is the architecturally most sophisticated option and the one the architecture documents lean toward.

The key insight: **Order ACTIVE (commercial event) and Program Ready (operational gate) are different states.**

- **Order ACTIVE** means: invoice paid, commercial commitment confirmed, scheduling can proceed
- **Program Ready** means: assessment completed, initial health screen done, trainer assigned, operational kickoff cleared

Under Scenario C:
- Order can be created WITHOUT assessment → Order enters state `PENDING_ASSESSMENT`
- Client pays invoice → Order enters state `ACTIVE` (commercial confirmed)
- Assessment is completed → Order transitions to `PROGRAM_READY` (operational gate cleared)
- Sessions can only be logged after `PROGRAM_READY`

This models EFM's actual operational flow:
1. Client signs up and pays (commercial commitment)
2. Intake/assessment session happens (operational readiness)
3. Regular training sessions begin

*Operational reality:* Admin creates order → sends invoice → client pays → triggers assessment appointment → assessment done → training starts. Clean separation of commercial and operational lifecycle.

*Risk:* More complex state machine. Order has 3+ states instead of 2. Requires additional logic in session-logging service to check `PROGRAM_READY` status.

*Who chooses this:* Owners who want both flexibility (don't block invoicing/payment on assessment) AND rigor (don't allow session logging until assessment exists).

---

#### Commercial vs. Program Readiness — The Critical Architectural Distinction

This distinction is the core conceptual question of OPEN-2B-04. The architecture documents explicitly call it out as unresolved.

| Dimension | Commercial Readiness | Program Readiness |
|---|---|---|
| What it means | Client has committed financially | Client is operationally ready to train |
| Triggered by | Invoice paid / Order active | Assessment completed + trainer assigned |
| Blocks what | Nothing (commercial is the gate itself) | Session logging, progress tracking |
| Lives in | `orders.status = ACTIVE` | `orders.status = PROGRAM_READY` or separate flag |
| Who cares | Finance, admin, management | Trainer, operations |
| Impact if missing | Revenue recognition issue | Professional liability, no baseline data |

**Owner Decision Question:** Does EFM treat "assessment before training" as a commercial requirement (blocks payment/order) or an operational requirement (blocks session logging but not payment)?

If COMMERCIAL: Use Scenario B (hard gate before Order creation, or at minimum before invoice generation)  
If OPERATIONAL: Use Scenario C (gate before session logging, not before Order/Invoice)  
If NEITHER: Use Scenario A (assessment is optional documentation, not a gate)

---

#### Impact on Implementation

| Scenario | Order service lines | Validation gates | State machine | Receipt/session impact |
|---|---|---|---|---|
| A (no gate) | ~200 lines | Gates 01, 02, 04 only | 3 states | No change |
| B (hard gate) | ~280 lines | Gates 01–04 (Gate 03 added) | 3 states | No change |
| C (split gate) | ~350 lines | Gates 01–04 + post-payment check | 5 states | Session service adds PROGRAM_READY check |

---

### 5B. Deep Analysis — OPEN-2A-03: Partial Payments Policy

#### The Decision in Plain Language
When a client receives an invoice for Rp 2,400,000 (12 Sesi Pro package), can they pay it in multiple transactions (e.g. Rp 1,200,000 now + Rp 1,200,000 at week 6), or must each invoice be settled in one payment?

#### Current Architecture Assumption (in the spec)
The `payments` table is: `payment_id, invoice_id FK, amount, method, date, evidence_url, status`
The `invoices` table has: `amount_paid, remaining_balance, status (UNPAID/PARTIAL/PAID)`

This structure ALREADY supports partial payments at the data model level (you can insert multiple payment rows pointing to the same invoice_id, and the invoice `amount_paid` is the sum). However, the behavior — whether the system ALLOWS this — is the open decision.

#### Scenario Analysis Against 9 Payment Situations

**Scenario 1: Full Payment (single transaction)**
- Client pays Rp 2,400,000 in one transaction
- **Both models handle this identically.** No difference.
- Status: invoice → PAID, receipt generated, order activated

---

**Scenario 2: 50% Down Payment (DP) + 50% Later**
- Client pays Rp 1,200,000 today, Rp 1,200,000 at week 6
- **Single-payment model:** Admin must create 2 invoices (Invoice 1: Rp 1,200,000 for DP; Invoice 2: Rp 1,200,000 for balance). Each invoice generates one receipt. This creates 2 invoice/receipt document pairs for one program order.
- **Partial payment model:** One invoice for Rp 2,400,000. Two payment records. Invoice status: PARTIAL → PAID. Receipt generated after each payment (or only after final payment — sub-decision needed). Cleaner document trail.
- **Owner judgment needed:** Which models EFM's preferred client experience?

---

**Scenario 3: True Installment (3 payments over 3 months)**
- Client pays Rp 800,000 × 3 months for a 24-session program
- **Single-payment model:** Admin creates 3 invoices of Rp 800,000 each. 3 receipt documents. Administrative overhead: 3× create-invoice operations.
- **Partial payment model:** One invoice for Rp 2,400,000. Three payment records over 3 months. One clean document set.
- **Note:** Monthly invoicing could be a third model (invoice per month, one payment per invoice) which is a hybrid of both approaches.

---

**Scenario 4: Post-Service Payment (client pays after completing sessions)**
- Program runs first, client pays after completion
- **Both models handle this.** Invoice is created upfront (or at program end, depending on billing timing — separate decision). Single payment at end.
- No structural difference between models.

---

**Scenario 5: Overpayment (client pays more than invoice amount)**
- Client sends Rp 2,500,000 for a Rp 2,400,000 invoice
- **Single-payment model:** Admin manually adjusts invoice amount, or creates a credit memo. No system support for overpayment credit.
- **Partial payment model:** Can record payment of Rp 2,500,000 against invoice of Rp 2,400,000. System shows Rp 100,000 overpayment. Needs `over_payment` handling logic.
- **Both models require additional logic.** This is an edge case EFM should define a policy for regardless of payment model.

---

**Scenario 6: Underpayment (client pays less than invoice, no further payment)**
- Client pays Rp 2,000,000 and does not complete payment, program runs anyway
- **Single-payment model:** Invoice remains UNPAID. No receipt. No formal record of partial collection.
- **Partial payment model:** Invoice is PARTIAL. Payment record exists. No receipt until fully paid (or admin overrides). Better audit trail.
- **Owner judgment:** Does EFM run sessions for clients with outstanding balances? If yes, the system needs to allow Program Ready even with PARTIAL invoice status. This connects to OPEN-2B-04.

---

**Scenario 7: Refund (program cancelled after partial completion)**
- Client paid Rp 2,400,000, completed 4 of 12 sessions, program cancelled
- Refund amount: Rp 1,600,000 (8 remaining sessions × Rp 200,000)
- **Both models** need a refund/credit mechanism. The current spec does not include a `refunds` entity. This may need to be added as an explicit entity in both cases.
- **Note:** The architecture documents do not address refund handling. This is a gap that may require a new OPEN decision.

---

**Scenario 8: Cancelled Program (no sessions completed, full refund)**
- Order cancelled before first session. Full refund of invoice amount.
- Same as Scenario 7 but full amount. Refund entity gap applies.

---

**Scenario 9: Multi-Invoice Order (client pays by invoice batch)**
- For a 24-session program, admin creates one invoice per 8-session batch
- Invoice 1: Rp 1,600,000 (8 sesi), Invoice 2: Rp 1,600,000 (8 sesi), Invoice 3: Rp 1,600,000 (8 sesi)
- Each invoice has one payment and one receipt
- **This is already supported by the current architecture** regardless of partial payment decision, because multiple invoices per order is already in the spec
- The partial payment question is specifically about one invoice having multiple payments

---

#### Architectural Impact Summary

| Factor | Single-payment model | Partial payment model |
|---|---|---|
| Payment service complexity | ~200 lines | ~400 lines |
| Invoice status logic | Simple (UNPAID → PAID) | Derived (SUM of payments vs total) |
| Receipt trigger | 1 receipt per payment (=1 per invoice) | Receipt per payment OR per final payment |
| Admin overhead for installments | Create multiple invoices | Record multiple payments to one invoice |
| Document count per order | Can multiply (1 invoice per installment) | Fixed (1 invoice, multiple payments) |
| Audit trail clarity | Invoice = cleanest billing unit | Payment records show exact cash flow |
| Refund handling | Reverse invoice | Reverse specific payment record |

**RECOMMENDATION:** Partial payment model (one invoice, multiple payments) aligns better with real-world cash flow tracking and reduces admin document overhead for installment arrangements. However, the single-payment model is acceptable if EFM's policy is "issue separate invoices per payment period."

---

## 6. Payment Architecture Analysis

Full scenario matrix against the 9 EFM payment types identified above, tested against both architectural options.

### Payment Flow Comparison Matrix

| Scenario | Single-payment model outcome | Partial-payment model outcome | Preferred |
|---|---|---|---|
| 1. Full payment | Invoice UNPAID → PAID, 1 receipt | Invoice UNPAID → PAID, 1 receipt | Tie |
| 2. 50% DP + balance | 2 invoices, 2 receipts, 2 documents | 1 invoice, 2 payments, 1 receipt | Partial |
| 3. Installments (3×) | 3 invoices, 3 receipts, 3 sets | 1 invoice, 3 payments, 1 receipt | Partial |
| 4. Post-service | 1 invoice, 1 payment, 1 receipt | Same | Tie |
| 5. Overpayment | No system support, manual fix | Over-pay flag, admin credit action | Partial |
| 6. Underpayment | Invoice stays UNPAID, no record | Invoice PARTIAL, payment exists | Partial |
| 7. Partial refund | Separate refund process needed | Reverse specific payment, same | Tie |
| 8. Full refund | Reverse entire invoice | Reverse all payments against invoice | Tie |
| 9. Multi-invoice | Fully supported natively | Each invoice still single payment option | Single |

**Score: Partial model preferred in 5 scenarios, tie in 4, single preferred in 0.**

### Receipt Generation Sub-Decision (if partial payments chosen)

If partial payments are adopted, a sub-decision is needed: when does EFM generate a receipt?

| Option | Behavior | Pros | Cons |
|---|---|---|---|
| Receipt per payment | Generate receipt for each payment record | Cash flow document per transaction | Client receives multiple receipts for one program |
| Receipt at full payment | Receipt only when invoice fully paid | Clean: 1 receipt per invoice | Partial payers have no payment acknowledgment until fully paid |
| Both (admin chooses) | Admin generates receipt manually or system auto-generates | Maximum flexibility | Complexity, inconsistency risk |

**RECOMMENDATION:** Receipt per payment (Option 1). EFM's clients deserve a payment acknowledgment for every cash transaction, regardless of whether the full invoice is settled. This matches standard professional service billing. The receipt should clearly show: partial payment amount, remaining balance, and invoice reference.

---

### Refund Entity Gap

Neither the single-payment nor partial-payment model currently addresses refunds in the spec. This is a gap that should be acknowledged:

**Current spec state:** No `refunds` or `credit_memos` entity exists in Phase 2 architecture.

**Impact of gap:** If a client cancels and deserves a refund, the admin has no system entity to record it. The only option is to manually adjust invoice/payment amounts — which violates the write-once constraint on `order_commercial_snapshots` and creates audit issues.

**RECOMMENDATION:** Add a `refunds` entity to Phase 2 scope, or explicitly defer it to Phase 3 with documentation that refund handling is manual until then.

| `refunds` table proposal | |
|---|---|
| `refund_id` | Primary key, `RFD-PP-YY-xxxx` |
| `order_id FK → orders` | Which order is being refunded |
| `original_payment_id FK → payments` | Which payment is being reversed |
| `refund_amount NUMERIC` | Amount refunded |
| `refund_reason TEXT` | Free text reason |
| `refund_date DATE` | When refund was processed |
| `refund_method TEXT` | Transfer/cash/etc. |
| `processed_by FK → users` | Admin who processed |

This is a **new open decision** surfaced by this analysis: **OPEN-NEW-01: Refund Entity in Phase 2 Scope?**

---

## 7. Assessment Gate Analysis

### Context: What Is an Assessment in EFM PP Context?

An assessment is a health and fitness baseline record collected at the start of a client's program, typically including:
- **Tanita body composition:** weight, body fat %, visceral fat, BMR, metabolic age, body water %, muscle mass, bone mass, physique rating, BMI
- **Girth measurements:** chest, waist, hips, thigh, arm
- **Fitness test data:** flexibility, endurance, strength (stored as JSONB for flexibility)
- **Trainer notes**
- **Assessment date**

The assessment is linked to a client (`client_id FK`) and optionally to an order (`order_id FK NULLABLE`).

### Three Gate Scenarios — Full Analysis

**Scenario A: No Gate (Assessment is documentation only)**

Assessment can be created at any time. Order creation does not check for assessment. The `order_id` on the assessment is populated when an assessment is linked to an order, but this linkage is voluntary and can happen at any point.

*Order creation flow (Scenario A):*
```
1. Validate client exists
2. Validate package/offering exists
3. Validate no conflicting active order
4. Create order (PENDING state)
5. Create commercial snapshot (write-once)
6. Return order_id
```

*Who needs assessment data:* Trainer (for program design), progress tracking service (for before/after comparison). Neither blocks order creation.

*Risk assessment:*
- Professional risk: EFM trains clients without knowing their health baseline
- Documentation risk: No pre-program record if a client claims an injury during training
- Operational risk: Trainer begins sessions without understanding client's physical condition
- Business risk: Low — reduces friction, maximizes conversions

---

**Scenario B: Hard Gate (Assessment required before Order)**

Order service Validation Gate 03 checks:
- Does the client have an assessment?
- Is the most recent assessment within the validity window? (e.g., 6 months)

If check fails: `HTTP 422 UNPROCESSABLE_ENTITY` with error code `ASSESSMENT_REQUIRED`

*Order creation flow (Scenario B):*
```
1. Validate client exists
2. Validate package/offering exists
3. [Gate 03] Validate: client has assessment dated within validity_window
4. Validate no conflicting active order
5. Create order (PENDING state)
6. Create commercial snapshot (write-once)
7. Link assessment.order_id ← new order_id
8. Return order_id
```

*Who benefits:* Trainers (always have baseline data), EFM management (professional standard), clients (feel properly assessed before committing).

*Who is burdened:* Admin (must complete assessment before order creation), sales flow (extra step slows conversion), clients who want to start immediately.

*Assessment validity window question:* How long is an assessment valid? 3 months? 6 months? 1 year? If a returning client has an assessment from 8 months ago, must they reassess before a new program order?

*This generates a sub-decision: **OPEN-NEW-02: Assessment Validity Window**.*

---

**Scenario C: Split Gate — Commercial ACTIVE ≠ Program Ready (RECOMMENDED)**

The key insight (repeated from Section 5A because it's the most architecturally significant point in this review):

EFM has two distinct operational events that should not be conflated:
1. **Commercial commitment event** — client signs up, invoice issued, payment received → Order is ACTIVE
2. **Operational readiness event** — assessment done, trainer assigned, program structure confirmed → Order is PROGRAM_READY

Under Scenario C, the order state machine has these states:
```
DRAFT → PENDING_PAYMENT → ACTIVE → PENDING_ASSESSMENT → PROGRAM_READY → IN_PROGRESS → COMPLETED
                                                          ↑
                          (assessment and trainer assignment happen here, after commercial confirmation)
```

*Order creation flow (Scenario C):*
```
1. Validate client exists
2. Validate package/offering exists
3. Validate no conflicting active order
4. Create order (PENDING_PAYMENT state)
5. Create commercial snapshot (write-once)
6. Return order_id
[... invoice/payment flow happens ...]
7. After invoice paid: order → ACTIVE → PENDING_ASSESSMENT
8. Admin triggers assessment creation, links to order
9. After assessment + trainer assignment: order → PROGRAM_READY
10. Sessions can now be logged
```

Session logging service check:
```
if order.status !== 'PROGRAM_READY' and order.status !== 'IN_PROGRESS':
    raise PROGRAM_NOT_READY_ERROR
```

*Why this is the best option:*
- Never blocks invoicing/payment (commercial velocity preserved)
- Guarantees assessment before first session (professional standard enforced)
- Clearly separates what finance cares about (paid?) from what ops cares about (ready?)
- Creates a natural "intake" workflow moment between payment confirmation and session start

*Risk:* More states to manage. Client can be ACTIVE (invoice paid) but not PROGRAM_READY (no sessions yet). This is operationally accurate but requires admin discipline to complete the assessment step.

---

### Assessment Gate Comparison Matrix

| Criterion | Scenario A (no gate) | Scenario B (hard gate) | Scenario C (split gate) |
|---|---|---|---|
| Friction for admin | None | High (assessment before Order) | Medium (assessment after payment) |
| Professional standard | Not enforced | Fully enforced | Enforced at session start |
| Conversion friction | None | High | Low |
| Session safety | No guarantee | Guaranteed | Guaranteed |
| Financial blocking | None | Invoice depends on assessment | Invoice independent of assessment |
| State machine complexity | Simple | Simple | Complex |
| Audit trail quality | Low | High (assessment pre-dates order) | High (assessment between payment and sessions) |
| EFM brand positioning | "Informal trainer" | "Clinical standard" | "Professional program" |

**RECOMMENDATION: Scenario C (Split Gate).**

Scenario C is the most professionally defensible option that preserves commercial agility. EFM positions itself as a professional training service. Scenario A has too much professional risk. Scenario B creates unnecessary friction in the sales process. Scenario C threads the needle: no gate on money, full gate on training.

---

## 8. Future Program Impact Analysis

The Phase 2 architecture was designed for PP (Private Program). This section analyzes how the 9 open decisions affect EFM's future program types.

### Active Aging Program

**Characteristics:** Older clients (55+), joint-friendly exercises, higher health risk profile, lower intensity. Group or 1-on-1 format.

**Assessment Gate impact:** Active Aging clients have higher health risk than standard PP clients. Scenario A (no gate) would be particularly inappropriate here — this population strongly benefits from pre-program health screening. If EFM plans Active Aging, **Scenario C (Split Gate) with mandatory assessment becomes non-negotiable.**

**Partial Payments impact:** Older, fixed-income clients may need more flexible payment terms. Partial payment model is strongly preferred for this segment.

**Participant capacity:** If Active Aging is offered as a group class (3-5 participants), the participant capacity decision (OPEN-2B-01) directly affects session management. Recommend: capacity per Order (admin sets it for each group enrollment).

---

### Corrective Exercise Program

**Characteristics:** Injury rehabilitation, postural correction, typically 1-on-1, higher liability. May require doctor's clearance documentation.

**Assessment Gate impact:** This program type has the highest liability profile. An assessment gate is not just professionally appropriate — it may be legally necessary (documentation of pre-existing condition vs. program-induced injury). Scenario B (hard gate before Order) or Scenario C with mandatory assessment are both appropriate. **Scenario A is not acceptable for Corrective Exercise.**

**Assessment data structure:** The standard Tanita/girth assessment may be insufficient for Corrective Exercise. A movement screening (FMS, postural assessment) adds fields not in the current assessment schema. The JSONB `fitness_test_data` field in Option C (hybrid) of OPEN-2B-03 can accommodate this if it's designed with sufficient flexibility. **OPEN-2B-03 Option C is required for Corrective Exercise compatibility.**

---

### Fatloss & Body Shaping Program

**Characteristics:** Goal-oriented (weight/fat loss), typically 12-24 sessions, before/after photos common, client motivation varies.

**Assessment Gate impact:** This program type benefits most from the pre/post comparison that a structured assessment enables. Without a pre-program assessment, EFM cannot demonstrate client results quantitatively. **The assessment gate is a commercial differentiator here, not just a liability protection tool.** Scenario B or C recommended.

**Progress assessments:** Unlike other programs, Fatloss clients often want mid-program assessments (after 4 weeks, after 8 weeks). The current schema supports this (assessment.order_id allows multiple assessments per order). **No architecture change needed, but this use case should be documented.**

---

### Sport-Specific Training (Athlete Performance)

**Characteristics:** Performance-focused, sport-specific metrics, VO2 max, agility tests. Could be individual or team.

**Assessment data structure:** Standard Tanita/girth measurements are insufficient. VO2 max, speed, agility, power outputs require different measurement categories. The JSONB `fitness_test_data` field needs to be explicitly designed to accommodate sport-specific metrics, not just general fitness tests. **OPEN-2B-03 Option C with well-documented JSONB schema for fitness_test_data is required.**

---

### B2B Event Programs (Zumba, Corporate Wellness Events)

**Characteristics:** One-time or periodic events, multiple participants (20-200+), flat fee per event, no individual progress tracking.

**Architecture mismatch:** The current Phase 2 architecture is built around individual clients with 1-on-1 or small-group programs and detailed participant assessment. B2B Events have a fundamentally different commercial model:
- Client is a corporate entity, not an individual
- "Participants" are event attendees, not enrolled program clients
- No individual assessments (or minimal health screening at group event level)
- Billing is per-event, not per-session or per-package

**Impact assessment:** B2B Event programs should NOT reuse the PP order/participant/assessment architecture directly. The Phase 2 architecture is suitable only for PP. B2B Event needs its own order structure when it reaches Phase 2 of that module.

**Decision relevance:** OPEN-2B-04 (assessment gate) and OPEN-2B-02 (participant ID) decisions made for PP do NOT apply to B2B Event. The modules must maintain separate implementations for participant management.

---

### B2B Management Programs (Corporate Gym, Apartment Fitness Center)

**Characteristics:** Recurring monthly/annual contracts, multiple trainers, facility-based, B2B clients (companies/apartments), not individual clients.

**Architecture mismatch:** Similar to B2B Event, B2B Management's commercial model (recurring contracts, subscription-style billing, multi-location) is fundamentally different from PP's per-order package model.

**Decision relevance:** OPEN-2A-03 (partial payments) and OPEN-2A-04 (discount scope) decisions made for PP may need to be revisited for B2B Management, where discount structures can be complex (volume discounts, loyalty pricing, multi-year contract pricing). Do not assume PP decisions are automatically portable.

---

### Architecture Future-Proofing Assessment

| Future program | Assessment gate (2B-04) | Partial payments (2A-03) | Participant capacity (2B-01) | Assessment data (2B-03) |
|---|---|---|---|---|
| Active Aging | Scenario C required | Partial preferred | Per Order recommended | Standard schema OK |
| Corrective Exercise | Scenario B or C required | Either model | Individual (no group) | JSONB extension needed |
| Fatloss & Body Shaping | Scenario C recommended | Either model | Individual or small group | Standard schema OK |
| Sport-Specific Training | Scenario C recommended | Either model | Individual | JSONB extension needed |
| B2B Event | NOT APPLICABLE | Separate model | Not applicable | Not applicable |
| B2B Management | NOT APPLICABLE | Separate model | Not applicable | Not applicable |

---

## 9. Recommended Owner Decisions

> **IMPORTANT:** All items in this section are marked RECOMMENDATION. They are proposals for owner review and approval — NOT locked decisions. The architecture team cannot lock these decisions unilaterally. Owner must explicitly approve each one before it is treated as a locked architectural decision.

| Decision ID | RECOMMENDATION | Rationale | Override impact if owner disagrees |
|---|---|---|---|
| OPEN-2B-04 | Scenario C (Split Gate) | Balances commercial agility with professional safety | Scenario A: accept professional risk; Scenario B: accept sales friction |
| OPEN-2A-03 | Partial Payments (one invoice, multiple payments) | Better cash flow tracking, less admin document overhead | Single payment: create multiple invoices per installment |
| OPEN-2A-01 | `CLT-PP-YY-xxxx` format | Consistent with EFM ID convention, module-specific, year-bounded | `KL-xxxx`: legacy-compatible but inconsistent; UUID: no human-readable ID |
| OPEN-2B-01 | Per Package (fixed capacity in `pp_packages`) | Simpler implementation; owner can control capacity at the offering level | Per Order: more flexible but adds admin input at order creation time |
| OPEN-2B-02 | `PAX-PP-YY-xxxx` format | Consistent with EFM ID convention; participant identity separate from client identity | UUID: simpler but no human-readable participant tracking |
| OPEN-2A-04 | Full promo entity (`promos` table) | Allows audit trail of applied discounts, reporting on promo usage | Free-text field: simpler but no historical discount reporting |
| OPEN-2A-05 | Defer Quotation to Phase 3 | Phase 2 scope is already large; quotation is nice-to-have, not blocking | Include in Phase 2: adds ~2 weeks of development |
| OPEN-2B-03 | Option C (Hybrid: core columns + JSONB) | Core Tanita fields queryable; extensible for future program types via JSONB | Option A (all columns): rigid, migration-heavy for new assessment types |
| OPEN-2A-02 | `PAY-PP-YY-xxxx` format | Human-readable on receipts (client-facing); consistent with EFM convention | UUID: simpler implementation, no client impact |

### Newly Surfaced Recommendations (from this analysis)

These decisions were not in the original 4 architecture documents but emerged from this deep analysis:

| Decision ID | Subject | RECOMMENDATION | Priority |
|---|---|---|---|
| OPEN-NEW-01 | Refund entity in Phase 2 | Add `refunds` table to Batch 2A scope | HIGH |
| OPEN-NEW-02 | Assessment validity window | 6 months validity for PP programs | MEDIUM |
| OPEN-NEW-03 | Receipt generation trigger (if partial payments) | Receipt per payment (not per invoice settlement) | MEDIUM |

---

## 10. Decisions That Can Be Deferred

These decisions will not block Phase 2 coding start and can be resolved during implementation rather than before it.

| Decision ID | Why deferrable | Latest point to decide |
|---|---|---|
| OPEN-2A-02 | Payment ID format is a 1-line config change | Before payment service test-deploy |
| OPEN-2A-05 | Quotation entity is additive; not referenced by order/invoice | Before Phase 3 scoping |
| OPEN-2B-03 | Assessment schema is isolated module; JSONB vs columns doesn't affect other tables | Before Assessment service migration |
| OPEN-NEW-02 | Assessment validity window is a config value, not a schema change | Before Gate 03 coding (if Scenario B or C chosen) |

---

## 11. Decisions That Must Be Locked Before Coding Begins

The following decisions MUST be locked before the Phase 2 coding sprint starts. Starting coding with these unresolved will result in mid-sprint refactoring, wasted work, or inconsistent data models.

### Tier 1 — Lock Before Any Phase 2 Code Is Written

| Decision ID | If not locked | Consequence |
|---|---|---|
| **OPEN-2B-04** | Order service has wrong validation flow | Refactor Order service (biggest module) mid-sprint |
| **OPEN-2A-03** | Payment service has wrong cardinality | Refactor Payment service + Invoice status logic + Receipt trigger |
| **OPEN-2A-04** | Order service promo validation built wrong | Refactor Order service discount logic |

### Tier 2 — Lock Before That Specific Service Is Coded

| Decision ID | Must be locked before |
|---|---|
| OPEN-2A-01 | Client service implementation starts |
| OPEN-2B-01 | Participant service validation is coded |
| OPEN-2B-02 | Participant service ID generator configured |
| OPEN-NEW-01 | Phase 2A migration finalized (either add refunds table or explicitly exclude) |

### Tier 3 — Can Resolve During That Service's Sprint

| Decision ID | Lock by |
|---|---|
| OPEN-2B-03 | Assessment service sprint start |
| OPEN-2A-05 | Phase 3 scoping session |
| OPEN-2A-02 | Payment service sprint start |
| OPEN-NEW-02 | Gate 03 implementation (if applicable) |
| OPEN-NEW-03 | Receipt service sprint start |

---

## 12. Final Phase 2 Readiness Assessment

### Pre-Coding Checklist

| # | Item | Status | Blocker |
|---|---|---|---|
| 1 | Phase 2A architecture document | ✅ COMPLETE | — |
| 2 | Phase 2B architecture document | ✅ COMPLETE | — |
| 3 | Cross-batch reconciliation document | ✅ COMPLETE | — |
| 4 | Entity Relationship + Source of Truth Matrix | ✅ COMPLETE | — |
| 5 | Owner Decision Review Pack (this document) | ✅ COMPLETE | — |
| 6 | **OPEN-2B-04 locked by owner** | ⛔ PENDING | CRITICAL BLOCKER |
| 7 | **OPEN-2A-03 locked by owner** | ⛔ PENDING | CRITICAL BLOCKER |
| 8 | **OPEN-2A-04 locked by owner** | ⛔ PENDING | HIGH PRIORITY |
| 9 | OPEN-2B-01 locked by owner | ⚠️ PENDING | Medium |
| 10 | OPEN-2A-01 locked by owner | ⚠️ PENDING | Medium |
| 11 | OPEN-2B-02 locked by owner | ⚠️ PENDING | Medium |
| 12 | OPEN-NEW-01 scope decision | ⚠️ PENDING | High (affects migration) |
| 13 | Migration 002 finalized and reviewed | ⏳ Awaiting decisions | — |
| 14 | Migration 003 finalized and reviewed | ⏳ Awaiting decisions | — |
| 15 | Sprint plan aligned with architecture | ⏳ Awaiting decisions | — |

### Summary Status

**Current state:** All 4 architecture documents are complete and represent the most thorough pre-coding specification EFM has ever produced for a Phase 2 feature set. The technical architecture is locked. The entity model is precise. The migration sequence is clear. The API surface is mapped.

**What is missing:** 3 critical business decisions that only the owner can make.

**Time to unblock:** A focused 60-minute owner review session (using this document as the agenda) can resolve all Tier 1 and Tier 2 decisions and grant full authorization to begin Phase 2 coding.

**Estimated impact of each blocker on total development timeline:**

| If unresolved | Development impact |
|---|---|
| OPEN-2B-04 | Order service must be written twice (or written wrong first time) — 3+ day loss |
| OPEN-2A-03 | Payment service wrong architecture — 2-3 day loss |
| OPEN-2A-04 | Order service discount handling wrong — 1 day loss |
| OPEN-2B-01 | Participant validation logic wrong — 0.5 day loss |

**Recommendation to proceed:**

> Phase 2 coding sprint is READY TO BEGIN the moment OPEN-2B-04, OPEN-2A-03, and OPEN-2A-04 are locked by the owner. All other decisions can be resolved on-the-fly during their respective service sprints. The architecture team recommends the owner schedule a decision lock session as the immediate next step.

---

### Owner Sign-Off Section

*To be completed by CV. Bugar Nusantara Jaya owner/management upon review:*

| Decision ID | Owner Decision | Date | Notes |
|---|---|---|---|
| OPEN-2B-04 (Assessment Gate) | | | |
| OPEN-2A-03 (Partial Payments) | | | |
| OPEN-2A-04 (Promo/Discount) | | | |
| OPEN-2B-01 (Group Capacity) | | | |
| OPEN-2A-01 (Client ID Format) | | | |
| OPEN-2B-02 (Participant ID) | | | |
| OPEN-NEW-01 (Refund Entity) | | | |
| OPEN-NEW-02 (Assessment Validity) | | | |
| OPEN-2B-03 (Assessment Data) | | | |
| OPEN-NEW-03 (Receipt Trigger) | | | |
| OPEN-2A-05 (Quotation Phase) | | | |
| OPEN-2A-02 (Payment ID Format) | | | |

*Once all Tier 1 decisions above are signed, the Phase 2 coding sprint is formally authorized to begin.*

---

*Document prepared for owner review — not for distribution outside EFM management. Phase 2 coding authorization is contingent on explicit owner sign-off of Tier 1 decisions.*
