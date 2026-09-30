# EFM PP — OPEN-2A-03: Partial Payment Policy
## Revised Decision Analysis — Owner Business Model Input

**Document ID:** EFM_PP_OPEN_2A_03_PARTIAL_PAYMENT_DECISION_ANALYSIS_v1.1  
**Status:** OWNER DECISION = PENDING  
**Supersedes:** v1.0 (2026-09-29) — kept unchanged; this document revises the framing  
**Created:** 2026-09-29  
**Author:** Architecture Analysis — Phase 2 Pre-Coding Lock  
**Revision basis:** Owner business model clarification received after v1.0  
**Must be resolved before:** Any Phase 2 billing service coding begins  
**Do NOT merge PR #534 until owner decision is recorded**

---

## DECISION SUMMARY (READ FIRST)

| Item | Value |
|---|---|
| Open Decision ID | OPEN-2A-03 |
| Decision Question (revised) | What is the PP-specific payment policy, and how does the Billing Core architecture accommodate different payment policies per business module without coupling them? |
| Owner Decision | **PENDING — awaiting owner answer** |
| Coding Impact | BLOCKS Phase 2 billing service implementation for PP module |
| Schema Impact | Affects `invoices_pp`, `payments_pp` gate logic and validation rules |
| Service Impact | Affects `billing.service` payment policy enforcement layer |

### What Changed From v1.0

v1.0 asked: *"Should PP allow partial payments?"*  
v1.1 asks the correct question: *"What is the PP payment policy, and how does the billing architecture separate payment engine capability from per-module payment policy?"*

The owner's business input clarified that EFM has three distinct commercial models, each with a different payment pattern. v1.0 analyzed PP in isolation and recommended partial payments. **This was architecturally premature** — it missed the layer distinction between what the billing engine CAN do and what each business model IS ALLOWED to do.

---

## 1. OWNER BUSINESS INPUT

The following business model input was provided by the owner as the basis for this revision.

### 1.1 EFM Has Three Distinct Commercial Models

EFM CV. Bugar Nusantara Jaya operates three business divisions with fundamentally different commercial structures:

**PP — Personal Program (Private Training)**
- One client, one trainer, structured package (4/8/12/24 sessions)
- Standard package prices: Rp 800k (4 sesi), Rp 1.6M (8 sesi), Rp 2.4M (12 sesi), Rp 4.8M (24 sesi)
- **Standard payment model: FULL PAYMENT**
- No down payment (DP) as standard PP commercial practice
- No installment payment as standard PP commercial practice
- PP is a retail-level transaction; payment is expected upfront before service delivery

**B2B Event — Corporate/Group Fitness Events**
- Group events for corporate clients (Zumba, wellness challenge, fitness day, etc.)
- Event-based, may require planning and resource commitment before execution
- **Payment model: DP + Final Payment / Settlement**
- Down payment to secure the event date; final payment after event completion or before execution
- DP + settlement is a standard B2B event contract structure in the Indonesian market

**B2B Management — Corporate Recurring Program**
- Recurring fitness services for corporate clients (gym management, apartment fitness, etc.)
- Long-term contracts: 1, 3, 6, 9, or 12 months
- **Payment model: Contractual Term Payment**
- Payment schedule tied to the contracted term (monthly, quarterly, semi-annual, annual)
- Each term payment is a separately invoiced amount per the contract

### 1.2 The Core Business Rule From Owner Input

> **"DO NOT create a universal EFM rule that all invoices must support the same payment behavior."**

This is the foundational architectural constraint that v1.1 resolves:
- PP payment policy is PP-specific
- B2B Event payment policy is B2B Event-specific
- B2B Management payment policy is B2B Management-specific
- The billing engine must SUPPORT all models without ENFORCING one model on all

### 1.3 PP-Specific Owner Statement

> "Invoice PP should normally be settled by FULL PAYMENT. Do not treat partial payment/installment as a normal PP workflow. If partial payment capability exists in the generic billing engine, it must NOT automatically mean that PP allows partial payment. PP payment policy should be explicit."

---

## 2. PP PAYMENT POLICY

### 2.1 The PP Standard: Full Payment

PP is a retail-level personal training package. The standard commercial model is:

1. Admin creates Order (client selects package)
2. Admin creates Invoice (total amount = package price)
3. Invoice sent to client
4. Client pays FULL AMOUNT in one transfer
5. Admin confirms payment
6. Receipt generated (amount_received = total_amount)
7. Invoice status → `paid`

**One invoice. One payment. One receipt.** This is the PP standard.

### 2.2 What PP Full Payment Policy Means for the Schema

Under a full payment policy for PP, the billing service MUST enforce:

```
Gate 03A (PP-specific): payment.amount MUST equal invoice.total_amount
  (within a defined tolerance for bank transfer fees, e.g. ±0.1%)

Gate 03B (PP-specific): if SUM(existing confirmed payments for invoice_id) > 0,
  reject additional payment confirmation — invoice already being paid
```

These gates are ADDITIONAL to the generic billing engine gates (Gate 02, Gate 03, Gate 04 from Batch 2A). They are PP module-specific validation rules, not universal billing rules.

### 2.3 What PP Full Payment Policy Does NOT Mean

- It does NOT mean `payments_pp` can only have one row per `invoice_id` at the schema/database level. The database table may allow multiple rows; the application layer enforces the policy.
- It does NOT mean `invoices_pp.status` logic must change. The `paid` transition still fires when `SUM(confirmed) >= total_amount`. For PP, this happens after exactly one confirmed payment.
- It does NOT mean the billing engine is structurally incapable of partial payments. The engine capability and the PP policy are separate layers.

### 2.4 PP Edge Cases (Not Standard, Require Explicit Admin Action)

The following are NOT standard PP flows but may occur in exceptional circumstances:

**Exception A: Client underpays (Rp 2.300.000 on Rp 2.400.000 invoice)**
- Under strict full payment policy: reject the payment confirmation
- Admin must ask client to re-transfer the correct amount, or issue a corrected invoice
- The system enforces Gate 03A; admin cannot bypass it without a role-based override
- *Recommended:* Gate 03A enforces full payment; override requires admin supervisor role

**Exception B: Payment entered with wrong amount by admin data entry error**
- Not a client decision, an admin mistake
- Under strict policy: the only resolution is (1) reject the pending payment record, (2) create a new correct one
- Payment records in `pending` status can be updated (amount correction before confirmation)
- Payment records in `confirmed` status are immutable — error resolution path is OPEN-NEW-01 (refund entity, Phase 3)

**Exception C: Client requests installment arrangement (non-standard)**
- This is a commercial exception, not a standard PP flow
- It must be handled at the contract/order level (modified pricing, split order, etc.), not at the billing engine level
- Phase 2 does not need to accommodate this exception in the PP billing service

### 2.5 PP Payment Policy Summary

| Rule | Value |
|---|---|
| Standard payment | FULL PAYMENT |
| DP supported as standard | NO |
| Installment supported as standard | NO |
| Number of confirmed payments per invoice | EXACTLY ONE (enforced at application layer) |
| Gate 03A enforcement | `payment.amount = invoice.total_amount` (±tolerance) |
| Partial payment override | NOT AVAILABLE in Phase 2 |

---

## 3. B2B EVENT PAYMENT POLICY

### 3.1 Policy Statement (Phase 3 Scope)

B2B Event payment policy is **NOT implemented in Phase 2**. It is documented here to ensure the PP Phase 2 architecture does not foreclose the B2B Event billing model.

**B2B Event standard payment model:**
- Invoice 1: Down Payment (DP) — typically 50% of event contract value, due at booking
- Invoice 2: Final Payment / Settlement — remaining balance, due before or after event execution
- Each invoice has its own `INV-EV-YY-xxxx` ID
- Each invoice receives its own payment record and receipt
- The EVENT ORDER links both invoices

**Key structural difference from PP:**
- B2B Event uses MULTIPLE INVOICES per order (one per billing milestone: DP, settlement)
- This is NOT the same as partial payment on a SINGLE invoice
- Each B2B Event invoice IS expected to be settled by full payment of THAT INVOICE'S amount
- The DP invoice is fully paid; the settlement invoice is fully paid; together they cover the contract

**Implication for architecture:** B2B Event does NOT require partial payment support on a single invoice. It requires multi-invoice support per order (which the Batch 2A schema already allows — `invoices_pp.order_id FK` permits multiple invoices per order).

### 3.2 What B2B Event Needs From the Billing Core

- `invoices_[module]` supports multiple invoice records per order (already supported)
- Each invoice is independently paid (full payment per invoice)
- Invoice sequence/type (DP vs. final payment) can be indicated by an `invoice_type` field or by naming convention
- No partial payment on a single invoice required

**B2B Event does NOT require changes to the PP billing model.**

---

## 4. B2B MANAGEMENT PAYMENT POLICY

### 4.1 Policy Statement (Phase 3+ Scope)

B2B Management payment policy is **NOT implemented in Phase 2 or 3**. It is documented here to ensure PP Phase 2 architecture does not prevent this model.

**B2B Management standard payment model:**
- Long-term recurring contract: 1, 3, 6, 9, or 12 months
- Each contracted term is invoiced separately: one invoice per billing period
- Monthly contract: 12 invoices per year
- Quarterly contract: 4 invoices per year
- Annual contract: 1 invoice per year (or split as agreed)
- Each period invoice is expected to be settled by full payment of that period's amount

**Key structural difference from PP and B2B Event:**
- B2B Management requires a CONTRACT entity with defined billing schedule
- The billing schedule generates SCHEDULED INVOICES automatically (or on demand) per term
- This is a fundamentally different commercial lifecycle from PP (retail) or B2B Event (one-off)

### 4.2 What B2B Management Needs From the Billing Core

- Contract entity with billing frequency and per-term amount
- Auto-generation (or admin-triggered generation) of invoices per billing cycle
- Invoice-per-period model (not partial payment on a single invoice)
- Each period invoice is independently paid

**B2B Management does NOT require partial payment on a single invoice. It requires a contract + scheduled invoice generator — a separate Phase 4+ architectural component.**

### 4.3 Architectural Non-Interference Rule

PP Phase 2 architecture must not:
- Hardcode assumptions that EVERY business module uses the same invoice structure
- Create tables or constraints that prevent B2B Management from having a separate invoice lifecycle
- Name things in ways that imply PP-only usage (e.g., column names like `pp_specific_flag`)

PP Phase 2 architecture MUST:
- Use module-scoped table names (`invoices_pp`, `payments_pp`) — already the case
- Use module-scoped ID prefixes (`INV-PP-`, `RCP-PP-`) — already the case
- Not create cross-module joins or shared billing tables in Phase 2

---

## 5. BILLING CORE VS. BUSINESS POLICY

### 5.1 The Fundamental Distinction

The owner's business input surfaces a critical architectural layer distinction:

```
BILLING ENGINE CAPABILITY
│
│  What the payment infrastructure CAN do:
│  - Create a payment record
│  - Confirm a payment
│  - Generate a receipt
│  - Associate a payment with an invoice
│  - Check if an invoice is fully paid
│  - Support multiple payments on one invoice (technical capability)
│
└── BUSINESS MODEL PAYMENT POLICY
      │
      │  What each module IS ALLOWED to do:
      │
      ├── PP Policy
      │     One invoice per order batch
      │     Full payment required (one payment = invoice total)
      │     Gate 03A: payment.amount = invoice.total_amount
      │     No DP, no installments as standard
      │
      ├── B2B Event Policy (Phase 3)
      │     Multiple invoices per order (DP invoice + settlement invoice)
      │     Each invoice: full payment of that invoice's amount
      │     Invoice type field: DP | FINAL
      │     No partial payments on individual invoices
      │
      └── B2B Management Policy (Phase 4+)
            Contract-driven invoice schedule
            One invoice per billing period
            Each period invoice: full payment
            Auto-generated per billing frequency
```

### 5.2 Why This Distinction Matters

**Without this distinction:** A single payment model decision for PP inadvertently becomes a constraint on B2B. If PP says "no partial payments," and the billing engine is built to enforce this universally, B2B Event cannot do DP + settlement without restructuring the engine.

**With this distinction:** The billing engine is built to SUPPORT payment records and reconciliation generically. PP adds a POLICY LAYER on top that enforces full payment. B2B Event adds a DIFFERENT POLICY LAYER that allows multi-invoice patterns. Neither policy is baked into the engine's data model.

### 5.3 What Lives in the Billing Engine vs. Policy Layer

**Billing Engine (module-independent logic):**
- Payment record CRUD
- Payment status lifecycle: `pending → confirmed | rejected`
- Receipt generation (UNIQUE FK: one receipt per confirmed payment)
- Invoice paid determination: `SUM(confirmed payments) >= invoice.total_amount`
- Gate 04: Receipt requires confirmed payment (universal)

**PP Policy Layer (PP-specific enforcement, NOT universal):**
- Gate 03A: `payment.amount = invoice.total_amount` (within tolerance)
- Gate 03B: Reject second payment if invoice already has a confirmed payment
- These gates are checked in `billing.service` only when `module = 'PP'`

**B2B Event Policy Layer (Phase 3, separate from PP):**
- Invoice type validation (DP before FINAL)
- DP amount rules (e.g., minimum 50%)
- Settlement invoice may only be created after DP invoice is paid
- These gates would live in `billing.service.b2b_event` — separate from PP gates

**B2B Management Policy Layer (Phase 4+, separate):**
- Contract billing schedule engine
- Invoice auto-generation per term
- Contract status (active, expired, renewed) separate from individual invoice status

### 5.4 Schema Implication: Policy Flags vs. Separate Tables

Two approaches to implementing payment policy per module:

**Option 1: Policy flag on invoice**
```sql
invoices_pp.payment_policy = ENUM('full_payment', 'multi_invoice', 'scheduled')
```
- Allows per-invoice policy variation
- More flexible but adds complexity to gate logic

**Option 2: Policy enforced entirely in service layer**
```sql
-- No policy flag in schema
-- billing.service.pp checks Gate 03A + 03B for all PP invoices
-- billing.service.b2b_event checks different gates for all B2B Event invoices
```
- Schema stays clean
- Policy is entirely in application code
- Module identity is already clear from table prefix (`invoices_pp` vs future `invoices_b2b_event`)

**Recommendation for Phase 2:** Option 2 — policy enforced in service layer, no schema flag. The PP billing service enforces full payment gates. No schema changes required.

### 5.5 The Correct Question OPEN-2A-03 Now Answers

v1.0 question: *"Should PP support partial payments?"*

v1.1 correct question: *"What gates does the PP billing service enforce to implement the PP full-payment policy, and does the billing engine architecture allow future business modules to apply different policies without structural changes?"*

---

## 6. ORDER, INVOICE, AND PAYMENT STATUS

### 6.1 Four Independent Status Dimensions (Unchanged from v1.0)

The following four status dimensions remain independent. This is non-negotiable (NN-7):

```
DIMENSION 1: Order Status
  draft → active → completed | cancelled | expired

DIMENSION 2: Invoice Status
  draft → sent → paid | overdue | void

DIMENSION 3: Payment Status
  pending → confirmed | rejected

DIMENSION 4: Program Readiness (DERIVED — not stored)
  gates: Order ACTIVE + Assessment + Trainer + Schedule
```

### 6.2 PP-Specific Order Activation Rule

Given the PP full payment policy, the order activation question (from v1.0 Sections 4.2–4.4) must be revisited:

**Option A (Order ACTIVE only after full payment):**
Under PP full payment policy, this is logical — if full payment is required, order activation can be tied to payment confirmation. However, this creates the Gate 02 circular dependency (Invoice requires Order ACTIVE, but Order ACTIVE requires Invoice confirmation).

**Option B (Order ACTIVE after first payment):**
Under PP full payment policy: "first payment" = full payment (Gate 03A enforces this). So Option B collapses into Option A for PP. The distinction between B and A is only meaningful if partial payments are allowed.

**Option C (Order ACTIVE independent of payment):**
Admin activates Order as a separate decision from payment collection. Payment is tracked on Invoice dimension independently.

**Revised Assessment for PP Full Payment Policy:**

Option C remains architecturally cleanest because:
1. It resolves the Gate 02 circular dependency without requiring a new intermediate Order status
2. Under PP full payment policy, "Order ACTIVE" signals "admin has reviewed and opened the order for billing" — a commercial readiness state
3. Invoice status (`paid`) signals "client has settled the invoice" — a financial completeness state
4. Program readiness (DERIVED) signals "program can begin" — an operational state
5. These three signals are independent even under full payment policy — an order can be commercially open before payment and before scheduling

**PP Activation Rule (Recommendation):**

> Order `draft → active` = admin action (commercial approval)  
> Invoice `sent → paid` = payment confirmation (financial settlement)  
> Program Readiness = derived from all gates (operational)  

Under PP full payment policy:
- Order ACTIVE does not require payment
- Invoice PAID requires one confirmed full payment (Gate 03A)
- Program Readiness gate includes Invoice PAID as one of its conditions (if the owner decides payment must precede program start)
- OR Program Readiness gate does NOT include Invoice PAID (if the owner decides scheduling can happen in parallel with payment)

**This is a PP-specific policy question for the owner:** Does EFM require payment to be confirmed BEFORE a PP program begins (sessions scheduled), or can sessions be scheduled while awaiting payment?

### 6.3 Invoice Status Under PP Full Payment Policy

Invoice lifecycle under full payment policy (simpler than partial payment model):

```
Invoice DRAFT
  ↓ (admin sends to client)
Invoice SENT
  ↓ (client pays full amount → admin confirms)
Payment PENDING → Payment CONFIRMED
  ↓ (Gate 03A: amount = total_amount; Gate 03B: no prior confirmed payment)
Invoice PAID
  ↓ (Gate 04: receipt generated automatically)
Receipt generated: RCP-PP-YY-xxxx
```

The `overdue` transition fires independently: if Invoice remains `sent` past `due_date`, a scheduled job transitions it to `overdue`. This is unaffected by payment policy.

### 6.4 What Happens If Admin Accidentally Confirms Wrong Amount

Under Gate 03A, admin cannot confirm a payment with `amount ≠ invoice.total_amount`. The system rejects the confirmation with a clear error message. Admin must:
1. Correct the pending payment record's amount (update while in `pending` status), then confirm
2. OR reject the payment record and create a new one with the correct amount

**Gate 03A is a business rule enforcement gate, not a workaround — it protects data integrity.**

---

## 7. FUTURE 3–5 YEAR ARCHITECTURE

### 7.1 The Billing Core Architecture That Supports All Three Models

The long-term architecture positions a BILLING CORE that is policy-neutral at the engine level, with per-module policy layers:

```
BILLING CORE (shared, policy-neutral)
│
│  Tables: payments_[module], receipts_[module]
│  Engine: payment lifecycle, receipt generation, invoice paid determination
│  Rules: Gate 04 (receipt per confirmed payment — universal)
│
├── PP BILLING POLICY (Phase 2 — implemented now)
│     invoices_pp, payments_pp, receipts_pp
│     Gate 03A: full payment enforcement
│     Gate 03B: one payment per invoice enforcement
│
├── B2B EVENT BILLING POLICY (Phase 3)
│     invoices_b2b_event, payments_b2b_event, receipts_b2b_event
│     Multi-invoice per order (DP + FINAL)
│     Each invoice: full payment (Gate 03A-style per invoice)
│     Invoice type: DP | FINAL | SUPPLEMENTAL
│
└── B2B MANAGEMENT BILLING POLICY (Phase 4+)
      contract_b2b_mgmt (new entity: contract schedule)
      invoices_b2b_mgmt, payments_b2b_mgmt, receipts_b2b_mgmt
      Billing schedule engine (generates invoices per term)
      Each period invoice: full payment
```

### 7.2 What Phase 2 Must NOT Do (To Preserve Future Extensibility)

1. **Must NOT create `invoices_pp` with a column named `is_partial_allowed`** — this is a policy concern, not a schema concern. Policy belongs in the service layer.

2. **Must NOT add a FK between `invoices_pp` and a hypothetical `billing_policies` table** — over-engineering for Phase 2. Policy is module-scoped service logic.

3. **Must NOT name `billing.service` as `billing_pp.service`** — the billing service handles PP in Phase 2, but should be structured to accept a `module` parameter for future B2B extensions without a separate service file per module.

4. **Must NOT assume `invoice.order_id` is one-to-one** — B2B Event will need multiple invoices per order. The `invoices_pp` schema already uses FK (allowing many invoices per order), so this is satisfied.

5. **Must NOT encode "one invoice per order" as a database UNIQUE constraint** — the PP standard is one invoice per batch, but this is a business policy, not a schema constraint.

### 7.3 What Phase 2 PP Architecture SHOULD Establish

1. **Module-scoped tables** (`invoices_pp`, `payments_pp`, `receipts_pp`) — already in plan
2. **Service layer enforces PP gates** (`billing.service` with PP-specific gate validation)
3. **Gate 03A/03B as named, documented PP-specific rules** — not generic billing engine rules
4. **Clear naming conventions** that future B2B modules can follow (e.g., `invoices_b2b_event` mirrors `invoices_pp` structure, with its own policy gates)
5. **No cross-module billing** — PP billing service does not touch B2B tables

### 7.4 Volume Projection

PP at scale (5-year horizon: 500–2000 orders/year):
- ~1 invoice per order (full payment model — simple)
- ~1 payment per invoice (confirmed once)
- ~1 receipt per invoice (generated automatically)
- Query complexity: trivial — no aggregation needed for payment totals

B2B at scale would generate more transactions, but the architecture above handles this through module separation, not through a shared complex billing engine.

---

## 8. OWNER DECISION

### 8.1 OPEN-2A-03 — Revised Decision Statement

The revised decision the owner must answer is in two parts:

**Part 1 — PP Payment Policy:**
> "For the PP module, is the standard payment model FULL PAYMENT ONLY, meaning one confirmed payment must equal the full invoice amount before the invoice is considered paid?"

**Part 2 — Architecture Boundary:**
> "Does the billing architecture establish a clear separation between engine capability (what the system CAN do) and module policy (what PP IS ALLOWED to do), such that future B2B modules can implement different payment patterns (DP + settlement, term payments) without requiring PP architecture changes?"

---

**OWNER DECISION: PENDING**

---

### 8.2 Decision Options

**OPTION APPROVED (Recommended):**
> "I APPROVE the following PP payment policy: PP invoices must be settled by FULL PAYMENT. One invoice, one confirmed payment equal to the invoice total amount. No DP. No installments. The billing service enforces Gate 03A (payment.amount = invoice.total_amount) and Gate 03B (no second payment confirmation on a paid invoice). The Billing Core architecture remains capability-neutral; PP policy is enforced at the service layer only. B2B Event and B2B Management will implement separate payment policies in future phases. PP Phase 2 architecture must not prevent these future B2B payment patterns."

**OPTION MODIFIED — Full Payment With Defined Exception Path:**
> "I APPROVE full payment as the PP standard. Additionally, I authorize a supervisor-role override that allows confirming a payment amount within [X]% of the invoice total (to handle minor bank fee discrepancies). All other terms above apply."

**OPTION DEFERRED — Further Discussion Needed:**
> "I want to discuss one specific scenario before deciding: [owner specifies scenario]. All other parts of the decision above can proceed."

---

## 9. RECOMMENDATION

### 9.1 Summary Recommendation

**Recommended: OPTION APPROVED** — PP Full Payment Policy with policy-neutral Billing Core.

This recommendation is based on:

1. **Business model alignment:** The owner's input explicitly states PP = full payment, no DP, no installments. The architecture must reflect the actual business model, not a hypothetical more flexible one.

2. **Simplicity for Phase 2 implementation:** Full payment policy requires fewer gates than partial payment. Gate 03A and Gate 03B are straightforward validations. The billing service is simpler to implement and test.

3. **No loss of future flexibility:** By separating policy from engine capability, B2B Event (DP + settlement) and B2B Management (term payments) can be added in Phases 3 and 4 without restructuring the PP billing service or schema.

4. **Schema remains compatible:** `invoices_pp`, `payments_pp`, and `receipts_pp` as specified in Batch 2A work for both full payment policy (PP) and multi-invoice policy (future B2B Event). No schema changes required.

5. **Receipt architecture confirmed:** One receipt per confirmed payment (UNIQUE FK) is consistent with full payment policy — PP will generate exactly one receipt per invoice, which is the expected client-facing document.

### 9.2 Engineering Implications of Recommendation

**Additions to Batch 2A Billing Service Spec (PP-specific, service layer only):**
- Gate 03A: `payment.amount` must be within tolerance of `invoice.total_amount`
- Gate 03B: Invoice with an existing `confirmed` payment rejects new payment confirmation attempts
- Tolerance parameter: configurable (e.g., `PP_PAYMENT_TOLERANCE_PERCENT = 0.1%`) — handles minor bank fees
- Error messages: PP-specific ("PP invoices require full payment. Expected: Rp X, received: Rp Y.")

**No schema changes required.** Gates are application-layer validation, not database constraints.

### 9.3 What This Decision Does NOT Resolve

| Item | Status | Next Step |
|---|---|---|
| OPEN-2A-02: Payment ID format in id.generator.js | Still open | Engineering sub-decision: add `PAY` docType to id.generator.js |
| OPEN-NEW-01: Refunds entity | Phase 3 scope | Not needed for Phase 2 PP billing implementation |
| Program Readiness gate: does it require Invoice PAID? | Sub-question in Section 6.2 | Owner must answer: "Must PP invoice be paid before program sessions are scheduled?" |
| Bank fee tolerance for Gate 03A | Engineering parameter | Default 0.1% unless owner specifies |

### 9.4 The Sub-Question for Owner (Program Readiness and Payment)

The following sub-question is surfaced in this analysis and should be answered alongside OPEN-2A-03:

> **"For PP: must the invoice be confirmed PAID before sessions can be scheduled and the program begins, or can scheduling proceed while awaiting payment?"**

- If YES (payment required before scheduling): Invoice PAID is a gate for Program Readiness
- If NO (scheduling can proceed in parallel): Invoice PAID is tracked separately; scheduling has its own gates

This is a business policy question, not an architecture question. The architecture supports both answers.

---

## 10. EXACT DECISION SENTENCE

The owner must record one of the following exact statements to unblock Phase 2 billing service implementation:

---

**DECISION STATEMENT A (Recommended):**

> "For the PP module, the standard payment policy is FULL PAYMENT: one invoice per program batch, settled by one confirmed payment equal to the full invoice amount. Down payment (DP) is not standard PP practice. Installment payment is not standard PP practice. The billing service must enforce this policy at the application layer (Gate 03A: payment amount equals invoice total; Gate 03B: no second payment confirmation on an invoice with an existing confirmed payment). The Billing Core architecture separates engine capability from business policy; the PP full payment policy does not prevent B2B Event (DP + settlement) or B2B Management (term payments) from implementing different payment policies in future phases. B2B payment policies are entirely outside Phase 2 scope and will not be designed or implemented in Phase 2."

---

**OWNER DECISION: PENDING**

---

*Do not begin Phase 2 billing service coding until the owner records a decision on OPEN-2A-03.*

*v1.0 of this document (2026-09-29) is kept unchanged. This v1.1 supersedes v1.0's recommendation and reframes the decision question based on owner business model clarification.*

*DO NOT MERGE PR #534.*
