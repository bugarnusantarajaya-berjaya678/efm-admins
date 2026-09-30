# EFM PP — OPEN-2A-03: Partial Payment Policy
## Deep Dive Decision Analysis

**Document ID:** EFM_PP_OPEN_2A_03_PARTIAL_PAYMENT_DECISION_ANALYSIS_v1.0  
**Status:** OWNER DECISION = PENDING  
**Created:** 2026-09-29  
**Author:** Architecture Analysis — Phase 2 Pre-Coding Lock  
**Supersedes:** Final Owner Decision Matrix §5 (partial, for payment architecture depth)  
**Must be resolved before:** Any Phase 2 coding begins  
**Do NOT merge PR #534 until owner decision is recorded**

---

## DECISION SUMMARY (READ FIRST)

| Item | Value |
|---|---|
| Open Decision ID | OPEN-2A-03 |
| Decision Question | May one Invoice have multiple Payment records (partial payments), or must each Invoice be settled by exactly one Payment? |
| Owner Decision | **PENDING — awaiting owner answer** |
| Coding Impact | BLOCKS all Phase 2 billing service implementation |
| Schema Impact | Affects `invoices_pp`, `payments_pp`, `receipts_pp` structure |
| Service Impact | Affects `billing.service`, `invoice.service` gate logic |

---

## 1. CURRENT ARCHITECTURE

### 1.1 What Exists (Phase 1, commit b9c7c5d — 84/84 tests passing)

Phase 1 established the ID infrastructure and core order management. The following entities are **already implemented** and **must not be changed**:

- `orders_pp` — order lifecycle management
- `order_commercial_snapshots` — WRITE-ONCE snapshot created in same transaction as Order
- `id.generator.js` — provides `nextId(ORDER, PP)`, `nextId(INVOICE, PP)`, `nextId(RECEIPT, PP)`

**Phase 1 does NOT include:** `invoices_pp`, `payments_pp`, `receipts_pp` tables. These are Phase 2 additions.

### 1.2 Phase 2 Batch 2A Proposed Schema (Locked Except for OPEN Items)

**`invoices_pp` (from Batch 2A Architecture Lock):**
```
id               → INV-PP-YY-xxxx (via id.generator.js)
order_id         → FK → orders_pp.id
status           → ENUM: draft | sent | paid | overdue | void
subtotal         → NUMERIC (from order_commercial_snapshot)
discount_amount  → NUMERIC
tax_amount       → NUMERIC
total_amount     → NUMERIC (SNAP — immutable after creation)
```

**Critical gap:** `invoices_pp` has NO `amount_paid` field and NO `remaining_balance` field. Under partial payment, these must either be derived (CALC) or added (stored field with maintenance logic).

**`payments_pp` (from Batch 2A Architecture Lock):**
```
id               → OPEN-2A-02 (docType pending id.generator.js addition)
invoice_id       → FK → invoices_pp.id
amount           → NUMERIC (user-supplied payment amount)
payment_method   → ENUM
payment_reference→ TEXT
payment_date     → DATE
status           → ENUM: pending | confirmed | rejected
confirmed_by     → FK → users.id (admin who confirmed)
confirmed_at     → TIMESTAMP
upload_proof_url → TEXT
```

**`receipts_pp` (from Batch 2A Architecture Lock + ER Matrix):**
```
id               → RCP-PP-YY-xxxx (via id.generator.js)
payment_id       → UNIQUE FK → payments_pp.id  ← ENFORCED AT SCHEMA LEVEL
order_id         → FK → orders_pp.id
invoice_id       → FK → invoices_pp.id
amount_received  → NUMERIC (SNAP — exact payment amount at confirmation)
```

**The UNIQUE constraint on `receipts_pp.payment_id` means: exactly one receipt per confirmed payment.** This is already architecturally decided in the ER Matrix and Batch 2A. This document does NOT re-open that sub-decision.

### 1.3 Gates Governing Payment Confirmation (Batch 2A Lock)

- **Gate 02:** Invoice can only be created for an Order in `active` status
- **Gate 03 (Payment Confirmation):** Invoice MUST be `sent`; Order MUST be `active`; `amount > 0`; `confirmed_by` required
- **Gate 04 (Receipt Generation):** Payment MUST be `confirmed`; no existing receipt for this payment; receipt references exact `payment.amount`

### 1.4 What OPEN-2A-03 Controls

The Batch 2A spec states explicitly in §10.3:

> "One or more Payments may partially pay an Invoice — OPEN DECISION §10.3"

This single decision controls whether:
1. A payment record can have `amount < invoice.total_amount`
2. Multiple payment records can reference the same `invoice_id`
3. Invoice status transitions to `paid` only when `SUM(confirmed payments) >= total_amount`
4. Or: Invoice status transitions to `paid` after exactly ONE confirmed payment

### 1.5 Architectural Non-Negotiables (Must Not Be Violated)

From the ER Matrix Section 14 and Batch 2A Non-Negotiables:

- **NN-7:** Do NOT use one giant lifecycle status. Order, Invoice, Payment, Receipt each maintain independent status.
- **NN-14:** `receipts_pp.payment_id` is UNIQUE — one receipt per confirmed payment, always.
- **Service boundary:** `billing.service` owns `payments_pp` and `receipts_pp`. `invoice.service` owns `invoices_pp`. `order.service` must NOT call `billing.service`.

---

## 2. PAYMENT SCENARIOS

The following 10 scenarios are analyzed under BOTH models (single payment vs. partial payment) to expose which model handles each scenario gracefully and which requires workarounds.

---

### Scenario A: 100% Full Payment Before Activation

**Description:** Client pays the full invoice amount in a single transfer before any sessions begin.

**Under Single Payment Model (one payment = one invoice):**
- Admin creates Invoice → sends to client
- Client pays full amount → admin uploads proof → confirms payment
- Invoice transitions: `sent` → `paid`
- Receipt generated automatically: `amount_received = total_amount`
- Order transitions: depends on activation option (see Section 4)
- **Result: Perfectly handled. No friction.**

**Under Partial Payment Model:**
- Identical flow to single payment model for this scenario
- System allows partial, but client chooses to pay full — no behavioral difference
- **Result: Perfectly handled. No friction.**

**Verdict:** Both models handle this scenario identically. No differentiator.

---

### Scenario B: 50% Down Payment + 50% Balance

**Description:** Client pays Rp 1.200.000 upfront on a Rp 2.400.000 (12 Sesi - Pro) invoice, then pays remaining Rp 1.200.000 before or during the program.

**Under Single Payment Model:**
- Admin creates Invoice for Rp 2.400.000 → sends to client
- Client pays Rp 1.200.000 → admin uploads proof → **CANNOT confirm** partial amount
- **No pathway to record the down payment without voiding the invoice and creating two separate invoices**
- Workaround: Create two invoices (Invoice 1: Rp 1.200.000 DP, Invoice 2: Rp 1.200.000 Balance)
- **Problem:** Two invoice numbers for one order creates reconciliation complexity. Client receives two separate documents. Billing report shows two open invoices per order.

**Under Partial Payment Model:**
- Admin creates Invoice for Rp 2.400.000 → sends to client
- Client pays Rp 1.200.000 → admin uploads proof → confirms Payment 1 (amount = 1.200.000)
- Receipt 1 generated: `amount_received = 1.200.000`, references Invoice INV-PP-26-0001
- Invoice status remains `sent` (unpaid portion outstanding)
- Client pays Rp 1.200.000 → admin uploads proof → confirms Payment 2
- Receipt 2 generated: `amount_received = 1.200.000`, references same Invoice INV-PP-26-0001
- Invoice status transitions: `sent` → `paid` (SUM confirmed = total_amount)
- **Result: Clean flow. One invoice, two payment records, two receipts. Audit trail complete.**

**Verdict:** Partial payment model handles this cleanly. Single payment model requires two-invoice workaround.

---

### Scenario C: Multiple Installments (3+ payments)

**Description:** Client negotiates 3 payments of Rp 533.333 each on a Rp 1.600.000 (8 Sesi - Base) invoice (or realistic: Rp 600.000 + Rp 600.000 + Rp 400.000 installments).

**Under Single Payment Model:**
- Must create 3 separate invoices at different amounts
- Each invoice gets its own INV- number
- Admin must manually coordinate "this is installment 2 of 3 for the same order"
- No systemic link between the three invoices; no way to see combined total vs. paid
- **Problem:** Installment tracking is entirely manual. System cannot report "client has paid 2 of 3 installments on Order #PP-26-0001."

**Under Partial Payment Model:**
- One invoice, three payment records, three receipts
- System can derive: `SUM(confirmed payments for INV-PP-26-0001) / invoice.total_amount = payment_progress`
- Invoice transitions to `paid` only when sum reaches `total_amount`
- **Result: Single source of truth for one order's payment status.**

**Verdict:** Partial payment model is significantly superior for installment scenarios.

---

### Scenario D: Partial Payment After Program Starts

**Description:** Order is `active`, sessions have already begun, and a confirmed partial payment exists. Client has not yet paid the remaining balance.

**This scenario's behavior depends on the activation option chosen (see Section 4).**

**Under Option A (full payment before activation):**
- Partial payment cannot trigger Order ACTIVE
- Sessions cannot start until full payment is confirmed
- This scenario cannot occur by design

**Under Option B (first confirmed payment activates Order):**
- Rp 600.000 confirmed on Rp 1.600.000 invoice → Order transitions to ACTIVE
- Program begins, sessions run
- Client owes Rp 1.000.000 remaining balance
- System tracks: Invoice `sent` (unpaid balance outstanding), Program `active`
- Admin must follow up for remaining balance
- **Risk:** Client attends sessions without paying full amount. EFM absorbs risk.

**Under Option C (Order ACTIVE independent of payment):**
- Program starts based on agreement/readiness, not payment
- Payment tracking is independent
- Outstanding balance tracked on Invoice, not on Order status
- **EFM must have separate collections process — system does not enforce payment before program start**

**Verdict:** This scenario is a business risk question, not a technical one. The system can model any scenario correctly if the activation option is chosen. The key architectural point: if partial payments are allowed, the Invoice serves as the ledger for the outstanding balance.

---

### Scenario E: Underpayment (Client Pays Less Than Agreed)

**Description:** Client pays Rp 2.000.000 on a Rp 2.400.000 invoice (not a negotiated installment — client simply pays less and goes quiet).

**Under Single Payment Model:**
- Admin must choose: reject the payment (and confirm nothing), or create a corrected invoice for Rp 2.000.000
- Rejecting: proof uploaded, payment rejected, no record of the Rp 2.000.000 attempt
- Correcting invoice: changes the contract value, which is impermissible (SNAP type)
- **No clean path. Admin is stuck.**

**Under Partial Payment Model:**
- Admin confirms Payment of Rp 2.000.000
- Invoice status: `sent` (still outstanding — balance = Rp 400.000)
- Receipt 1 generated: `amount_received = 2.000.000`
- Admin can follow up for Rp 400.000 shortfall
- If shortfall paid: Payment 2 (Rp 400.000) confirmed, Invoice transitions to `paid`
- If shortfall never paid: Invoice remains in `sent` status, escalates to `overdue` by date
- **Result: Clean audit trail of what was paid and what remains outstanding.**

**Verdict:** Partial payment model handles underpayment gracefully. Single model has no clean path.

---

### Scenario F: Overpayment (Client Pays More Than Invoice Total)

**Description:** Client pays Rp 2.500.000 on a Rp 2.400.000 invoice. Rp 100.000 overpaid.

**Under Single Payment Model:**
- Admin confirms payment of Rp 2.400.000 (correct amount)
- Overpayment of Rp 100.000 is outside system tracking
- Must be handled manually (credit note, refund, or offset to next invoice)
- **Acceptable if overflow is rare and amounts are small.**

**Under Partial Payment Model:**
- Same issue: system has no `overpayment` concept
- Admin confirms payment of Rp 2.400.000 (exact invoice total), notes Rp 100.000 separately
- OR admin confirms Rp 2.500.000, triggering `amount_received > total_amount` check
- If latter: system must decide whether to allow `amount_received > invoice.total_amount`
- **Architectural note:** Receipt `amount_received` is SNAP from `payment.amount`. If admin confirms Rp 2.500.000, the receipt will show Rp 2.500.000. This requires validation logic: should Gate 04 reject `amount > invoice.total_amount`?

**Verdict:** Both models have identical gaps on overpayment. Neither handles it natively. Overpayment is an edge case that requires explicit policy: (a) reject overpayment at confirmation, (b) allow it and track manually, or (c) surface it as a warning. **This does not require an additional OPEN decision — it is a Gate 04 enhancement implementable in either model.**

---

### Scenario G: Failed Payment (Proof Uploaded, Payment Rejected)

**Description:** Client uploads transfer proof. Admin reviews and rejects it (wrong account, wrong amount, fraudulent proof).

**Under Single Payment Model:**
- Payment status: `pending` → `rejected`
- Invoice remains `sent` (unpaid)
- No receipt generated (Gate 04: payment must be `confirmed`)
- Admin may create a new payment record for the client to retry
- **Result: Clean. The rejected payment record serves as an audit log entry.**

**Under Partial Payment Model:**
- Identical behavior to single payment model
- Rejected payment leaves no receipt, leaves invoice `sent`
- **Result: Identical. No behavioral difference.**

**Verdict:** Both models handle failed payment identically. No differentiator.

---

### Scenario H: Cancelled Order (Mid-Payment)

**Description:** Order is cancelled after one partial payment has been confirmed (e.g., Rp 600.000 paid on Rp 1.600.000 invoice). What happens to the paid amount?

**Under Single Payment Model:**
- If using two-invoice workaround: Invoice 1 (Rp 600.000 DP) is `paid`; Invoice 2 (Rp 1.000.000 balance) is `sent` or `draft`
- Cancellation: void Invoice 2; Invoice 1 is paid (question: refund or forfeit?)
- **Refund determination:** outside system scope unless `refunds_pp` entity exists

**Under Partial Payment Model:**
- Invoice Rp 1.600.000: one confirmed payment of Rp 600.000, invoice still `sent`
- Order cancelled: all active invoices should transition to `void` or `cancelled`
- Receipt for Rp 600.000 exists and is immutable (correct — receipt is an audit record)
- **Question: Does cancellation trigger a refund of Rp 600.000?**
- **Gap: OPEN-NEW-01 — `refunds_pp` entity does not exist in Phase 2 architecture.**

**Verdict:** Both models surface the same gap: OPEN-NEW-01 (refund entity). The partial payment model makes the gap MORE visible (the system clearly shows how much was paid and what is outstanding), which is an advantage from an audit perspective. The gap itself is not created by the partial payment model — it exists regardless.

---

### Scenario I: Refund

**Description:** Client requests a refund for all or part of the confirmed payment amount.

**Architecture Gap (OPEN-NEW-01):** There is NO `refunds_pp` table in the current Phase 2 schema. A refund cannot be recorded as a reversal of a payment record (payments are `confirmed` — there is no `refunded` status in the current spec). A refund cannot reduce `receipt.amount_received` (receipts are immutable SNAP records).

**Under Single Payment Model:**
- No refund entity → refund is entirely manual, outside system
- System shows Invoice as `paid`; no way to record money returned to client
- **Problem: System state is permanently incorrect after a refund.**

**Under Partial Payment Model:**
- Same gap: no `refunds_pp` table
- However, the partial payment model makes the payment ledger more granular — a future `refunds_pp` entity can reference specific `payment_id` values
- Refund records could specify: `refund_amount`, `original_payment_id`, `reason`, `refunded_by`, `refunded_at`
- This is ADDITIVE to the partial payment model — does not require re-architecting the payment model

**Verdict:** Both models share the OPEN-NEW-01 gap. The partial payment model is MORE compatible with a future `refunds_pp` entity because payments are individually identified (by payment_id + receipt_id). The single payment model could also add a `refunds_pp` table, but loses the granularity of knowing which specific payment installment was refunded.

**This analysis recommends raising OPEN-NEW-01 as a separate Phase 2 decision required before coding the billing service.**

---

### Scenario J: Payment Correction / Reversal

**Description:** Admin confirms a payment (Rp 1.200.000) but discovers the bank transfer was actually for Rp 1.100.000. Admin needs to correct the confirmed payment amount.

**Under Current Architecture (both models):**
- Payment transitions: `pending` → `confirmed` (one-way, no reversal path in current spec)
- Receipt is SNAP and immutable after creation
- **No correction path exists in the current architecture.**

**Possible approaches:**
1. **Reject and re-enter:** Administratively, reject the original payment (add `rejected` status to confirmed payments — requires schema change), void the receipt (requires receipt void status — currently not in spec), create new payment with correct amount. **This requires SCHEMA CHANGES not currently planned.**
2. **Audit-note only:** Allow an `admin_notes` field on `payments_pp` to record corrections. System amount stays as confirmed (Rp 1.200.000), but note records actual receipt (Rp 1.100.000). **This is NOT an accounting-accurate approach.**
3. **No correction, refund for delta:** Accept the Rp 1.200.000 confirmation as-is; create a refund of Rp 100.000 via a future `refunds_pp` entity. **Requires OPEN-NEW-01 resolution.**

**Verdict:** Payment correction is a known operational gap in the current Phase 2 architecture regardless of which payment model is chosen. It compounds with OPEN-NEW-01. For Phase 2, the pragmatic answer is: admin must get confirmation amounts correct before confirming. A correction workflow is Phase 3+ scope.

---

## 3. STATUS MODEL

### 3.1 Four Independent Status Dimensions (Non-Negotiable NN-7)

The following four status dimensions are INDEPENDENT and must never be collapsed:

```
DIMENSION 1: Order Status
  draft → active → completed | cancelled | expired

DIMENSION 2: Invoice Status  
  draft → sent → paid | overdue | void

DIMENSION 3: Payment Status
  pending → confirmed | rejected

DIMENSION 4: Program Readiness (DERIVED — not stored on orders_pp)
  derived from: Order ACTIVE + Assessment complete + Trainer assigned + Schedule confirmed
```

### 3.2 Invoice Status Transition Logic Under OPEN-2A-03

**Option: Single Payment Model (one payment settles invoice)**
```
Invoice draft → Invoice sent
  → Payment confirmed (amount must equal total_amount? or any amount?)
  → Invoice paid
     → Receipt generated (amount_received = payment.amount)
```
*Problem:* If admin confirms Rp 1.200.000 on a Rp 2.400.000 invoice, should invoice immediately transition to `paid`? Under strict single payment model: YES, but this means the invoice is marked paid at only 50% of its value. This is financially incorrect.

**Resolution for single payment model:** The system must validate `payment.amount = invoice.total_amount` at Gate 03 if using single payment model. This validation is NOT in the current Batch 2A spec. Adding it requires a schema/API change.

**Option: Partial Payment Model (multiple payments may settle invoice)**
```
Invoice draft → Invoice sent
  → Payment 1 confirmed (partial amount)
  → Invoice remains sent (SUM(confirmed) < total_amount)
  → Payment N confirmed (cumulative sum reaches total_amount)
  → Invoice transitions to paid
     → Receipt N generated
```
*The invoice `paid` transition is driven by: `SUM(payments WHERE invoice_id=X AND status='confirmed') >= invoice.total_amount`*

### 3.3 `amount_paid` Field Decision

The current `invoices_pp` schema does NOT include `amount_paid`. Under partial payment model, this value must be derived:

```sql
SELECT SUM(amount) FROM payments_pp 
WHERE invoice_id = :invoiceId AND status = 'confirmed'
```

**Option A (Derived):** Compute `amount_paid` on every read. No stored field. Consistent with current SNAP architecture philosophy. Requires no schema change. Performance: acceptable for low-volume PP module.

**Option B (Stored):** Add `amount_paid NUMERIC DEFAULT 0` to `invoices_pp`. Maintained by billing service on each payment confirmation. Provides instant read access. Requires: (1) schema addition, (2) maintenance logic in `billing.service`, (3) risk of inconsistency if payment service fails mid-update.

**Recommendation:** Option A (Derived). The PP module's transaction volume does not justify the added complexity of a maintained stored field. The billing service's `getInvoiceStatus()` function should compute `amount_paid` on demand.

---

## 4. THREE ACTIVATION OPTIONS

### 4.1 Background: The Gate 02/03 Circular Dependency

The Batch 2A spec states:
- Gate 02: Invoice can only be created for an Order in `active` status
- Gate 03: Payment confirmation requires Invoice in `sent` status AND Order in `active` status

This creates a potential question: if Order must be `active` before an Invoice can be created, but payment is what makes an Order `active` — how does the first invoice get created?

**Resolution:** "Order ACTIVE" in the commercial sense means "the order has been reviewed and opened for billing by an admin" — it is an administrative status transition, not a payment outcome. The flow is:

```
Admin creates Order (DRAFT)
Admin reviews and opens Order → Order transitions to ACTIVE (admin action, no payment required)
  → This enables: Invoice creation (Gate 02 satisfied)
Admin creates Invoice → Invoice DRAFT → Invoice SENT (sent to client)
  → This enables: Payment upload + confirmation (Gate 03 satisfied)
Payment confirmed → triggers Order ACTIVE transition? (Only under Options A and B)
```

Under Option C: Order becomes ACTIVE as an admin decision. Under Options A and B: Order ACTIVE is triggered by payment confirmation. The semantic of "ACTIVE" differs by option.

---

### 4.2 Option A: Order ACTIVE Only After FULL Payment

**Rule:** `orders_pp.status` transitions from `draft` to `active` ONLY when `SUM(confirmed payments for all invoices of this order) >= order_commercial_snapshot.final_amount`.

**Implications:**
- Admin must create Invoice BEFORE Order can become ACTIVE — but Gate 02 requires Order ACTIVE to create Invoice. **Circular dependency.** This option requires resolving the circle by adding an intermediate state: `draft → invoice_ready → active`.
- Alternatively: Invoice is created in Order `draft` state (Gate 02 relaxed), and payment confirmation is what triggers `draft → active`.
- Sessions/program cannot begin until full payment confirmed.
- Matches traditional prepayment model.

**Advantages:**
- EFM has no financial exposure — no program delivery without full payment
- Invoice lifecycle is simple: one invoice = one expected payment = paid when settled

**Disadvantages:**
- Blocks clients who want to start with a deposit (common in fitness industry)
- If Option A + single payment model: admin cannot accept DP
- If Option A + partial payment model: client can pay in installments, but program starts only when last installment is confirmed — may conflict with scheduled session dates
- Requires resolving Gate 02 circular dependency (intermediate status or Gate 02 relaxation)

**Architecture compatibility:** REQUIRES either (a) adding an intermediate Order status, or (b) relaxing Gate 02 to allow Invoice creation in Order `draft` state. The current Batch 2A spec does not include this intermediate state. **This is a schema/API change not currently planned.**

---

### 4.3 Option B: Order ACTIVE After FIRST Confirmed Payment

**Rule:** `orders_pp.status` transitions from `draft` to `active` when ANY payment on ANY invoice for this order reaches `confirmed` status, regardless of amount.

**Implications:**
- Even a partial first payment (Rp 100.000 on a Rp 2.400.000 invoice) triggers Order ACTIVE
- Program can begin immediately after first payment confirmed
- Remaining balance tracked by Invoice status (still `sent`)
- Cleanly resolves Gate 02: Order created in `draft`, Invoice created in `draft`, Invoice sent, payment confirmed → Order becomes ACTIVE

**Advantages:**
- Accepts deposit/DP model naturally
- Clients can start early sessions after commitment (first payment proves intent)
- Compatible with partial payment model seamlessly
- No circular dependency on gates

**Disadvantages:**
- EFM bears financial risk if client defaults on remaining balance after sessions have started
- Invoice may remain `sent` (outstanding) while Order is `active` and sessions are running
- Operationally complex: admin must track outstanding invoices separately from Order status
- A client paying Rp 1.000 "partial payment" on a Rp 2.400.000 invoice would incorrectly trigger Order ACTIVE under this rule — requires minimum threshold policy

**Recommendation note:** If Option B is selected, a minimum first payment threshold should be defined (e.g., minimum 50% of `invoice.total_amount`) to prevent trivially small partial payments from triggering program start. This threshold is a policy parameter, not an architecture change.

---

### 4.4 Option C: Order ACTIVE Independent From Payment

**Rule:** `orders_pp.status` transitions from `draft` to `active` based on an admin action — not any payment event. Payment completion is tracked entirely on the Invoice dimension, separately.

**Implications:**
- Admin decides when to open an order for program delivery (may be before, during, or after payment)
- Invoice tracks payment lifecycle independently
- Program can start even if Invoice is still `draft` or `sent`
- Maximum flexibility for EFM operations

**This is the architecture implied by the current Batch 2A spec:** Gate 02 says "Invoice can be created for an Order in `active` status" — implying Order is already ACTIVE when billing begins, not that billing makes it ACTIVE.

**Advantages:**
- Cleanest separation of concerns between commercial and operational status
- Compatible with all payment scenarios (A–J)
- No circular dependency issues
- Order status reflects operational reality; Invoice status reflects financial reality

**Disadvantages:**
- No payment enforcement: admin could activate an order and run sessions for a client who has never paid
- Requires stronger admin discipline and separate collections workflow
- Billing reports must be checked independently of Order status to identify payment defaulters

**Note:** OPEN-2B-04 (APPROVED = Scenario C / Split Gate) already establishes that **commercial activation and program readiness are independent**. Option C for OPEN-2A-03 extends this principle to also decouple payment from activation.

---

### 4.5 Comparison Matrix

| Criterion | Option A (Full payment first) | Option B (First payment triggers) | Option C (Independent) |
|---|---|---|---|
| Handles DP/installments | No (requires schema change) | Yes | Yes |
| EFM financial exposure | None | Moderate | High (admin-dependent) |
| Gate 02 compatibility | Requires fix | Compatible | Compatible |
| Partial payment model compatibility | Yes (with constraints) | Yes | Yes |
| Single payment model compatibility | Yes (natural fit) | Yes | Yes |
| Operational complexity | Low | Medium | Medium |
| Audit trail clarity | High | High | High |
| Collections automation possibility | High (system enforces) | Medium | Low |

---

## 5. RECEIPT ARCHITECTURE

### 5.1 The Already-Decided Rule (Not Re-Opened Here)

The ER Matrix and Batch 2A Architecture Lock have already established:

> **`receipts_pp.payment_id` is a UNIQUE FK to `payments_pp.id`**  
> One receipt per confirmed payment. Always.

This is an architectural non-negotiable (NN-14) and is NOT subject to OPEN-2A-03.

### 5.2 What This Means For Partial Payments

If partial payment is approved:
- Client pays Rp 600.000 → admin confirms → Receipt 1 generated (RCP-PP-26-0001, `amount_received = 600.000`)
- Client pays Rp 1.000.000 → admin confirms → Receipt 2 generated (RCP-PP-26-0002, `amount_received = 1.000.000`)
- Both receipts reference the same Invoice (`invoice_id = INV-PP-26-0001`) and same Order
- Both receipts reference different Payment records (`payment_id = PAY-PP-26-0001` and `payment_id = PAY-PP-26-0002`)
- **Together they total Rp 1.600.000 = full invoice amount**

### 5.3 Receipt as Audit Document vs. Settlement Certificate

**Receipt per payment:** Each receipt documents "we received Rp X at time T via method M." It is an audit record of a cash receipt event.

**Receipt per settlement:** A single receipt would document "the invoice of Rp X is now fully paid." It would be generated only once, at full payment.

**Current architecture chooses:** Receipt per payment. This is already decided (UNIQUE FK).

**Implications for partial payment:**
- If partial payment approved: multiple receipts per invoice are possible and expected
- Receipt's `amount_received` will be less than `invoice.total_amount` for partial receipts
- The receipt is NOT a settlement certificate — it is a cash receipt acknowledgement
- A separate concept (Invoice status = `paid`) serves as the settlement confirmation

**Client-facing consideration:** If EFM sends physical/digital receipts to clients, clients receiving partial receipts will see `amount_received = 600.000` on a receipt for an invoice of `2.400.000`. EFM must communicate this clearly. The receipt template should show: "Amount Received This Payment" (not "Total Invoice Amount").

### 5.4 Payment Record vs. Receipt Document — Distinction

| | `payments_pp` (Payment Record) | `receipts_pp` (Receipt Document) |
|---|---|---|
| Created when | Admin confirms payment | Automatically after payment confirmed |
| Purpose | Track payment status lifecycle | Issue official receipt to client |
| Mutable | Status changes (pending→confirmed) | IMMUTABLE after creation |
| Contains | Status, method, proof URL, confirmed_by | Snap of amount, dates, both entity IDs |
| One-to-one? | One payment → one receipt (UNIQUE FK) | Yes |
| Used for | Internal billing workflow | Client-facing document, audit trail |

---

## 6. AGREEMENT IMPACT

### 6.1 Agreement Timeline (Phase 3 Architecture)

From the Phase 1/2 Pre-Coding Lock and Phase 2 documents:

- Agreement is generated **AFTER** Order ACTIVE
- Agreement references Order (by Order ID)
- Agreement is immutable after signing
- Payment follows the Order lifecycle, NOT the Agreement

**Sequence:**
```
Order DRAFT → Order ACTIVE
  → Agreement DRAFT generated (references Order)
  → Agreement signed → Agreement IMMUTABLE
    → Invoice created (references Order)
    → Payment confirmed
    → Receipt generated
```

### 6.2 Impact of Activation Option on Agreement Timing

**Option A (full payment before activation):**
- Order cannot become ACTIVE until fully paid
- Agreement cannot be generated until Order is ACTIVE
- Agreement is generated AFTER full payment
- **Problem:** Client wants to review and sign agreement BEFORE paying. Under Option A, this is impossible — they must pay before they can even see the agreement. This is operationally backwards for most fitness contracts.

**Option B (first payment triggers activation):**
- Client pays deposit → Order ACTIVE → Agreement generated → client signs
- Remaining balance tracked by Invoice
- Agreement signing can happen after commitment (deposit paid) but before full payment
- **Acceptable for most scenarios**

**Option C (independent activation):**
- Admin opens Order → Agreement generated → client reviews and signs → Invoice sent → client pays
- The standard contractual flow: agreement first, then payment
- **Most compatible with standard contract law expectations**

### 6.3 Agreement Content and Payment References

The Agreement document references the Order. It does NOT reference individual payment records. The Agreement specifies:
- Total contract value (`order_commercial_snapshot.final_amount`)
- Payment terms (payment schedule, method) — if applicable

**The Agreement does NOT become invalid if:**
- The client pays in installments (Agreement specifies total value, not payment schedule)
- Multiple receipts are issued
- Invoice is partially paid

**The Agreement BECOMES invalid if:**
- The `order_commercial_snapshot.final_amount` changes — but this is SNAP (immutable), so it cannot change
- The Order is cancelled — Agreement should transition to void status in this case

**Verdict:** Agreement architecture is not significantly impacted by partial payment policy. Both models are compatible with the Agreement lifecycle as specified.

---

## 7. REFUND AND CANCELLATION IMPACT

### 7.1 OPEN-NEW-01: The Refund Entity Gap

**Current Phase 2 architecture does NOT include `refunds_pp`.** This gap was surfaced in the Owner Decision Review Pack and recorded in the Final Owner Decision Matrix.

A refund cannot be processed using existing entities:
- `payments_pp.status` has no `refunded` state
- `receipts_pp` is immutable (cannot mark as reversed)
- `invoices_pp` has no `credit_amount` or `refund_applied` field

### 7.2 Cancellation Scenarios

**Scenario: Order cancelled, no payment made**
- Invoice void → Order cancelled
- No financial impact
- Clean in both models

**Scenario: Order cancelled, full payment made (and invoice already `paid`)**
- Invoice is `paid`, receipt exists and is immutable
- Cancellation should void Invoice (but Invoice is already `paid` — should `paid → void` transition be allowed?)
- The current spec does NOT include `paid → void` as a valid transition
- **Gap:** Phase 2 needs a policy on whether `paid` invoices can be voided

**Scenario: Order cancelled, partial payment made (partial payment model only)**
- Invoice is `sent` (partial payment confirmed, remainder outstanding)
- Cancellation: Invoice should transition to `void`
- One or more receipts exist and are immutable
- **Question: Do the confirmed partial payments get refunded?**
- **Gap: OPEN-NEW-01 must be resolved.**

### 7.3 Recommendation on OPEN-NEW-01

OPEN-NEW-01 is NOT a consequence of adopting partial payments — it exists regardless of which payment model is chosen. However, partial payments make it MORE LIKELY that a refund involves a partial amount, which requires a more granular refund entity.

**Minimum viable `refunds_pp` schema (for Phase 3 planning):**
```
id                → REFUND-PP-YY-xxxx
payment_id        → FK → payments_pp.id (which payment is being refunded?)
order_id          → FK → orders_pp.id
invoice_id        → FK → invoices_pp.id
refund_amount     → NUMERIC
refund_reason     → TEXT
refund_method     → ENUM
refunded_by       → FK → users.id
refunded_at       → TIMESTAMP
```

**This is ADDITIVE to the Phase 2 schema and does not require changes to existing Phase 2 entities.**

---

## 8. 3–5 YEAR SCALABILITY

### 8.1 Current PP Module Volume Context

The PP module (Private Program) handles individual client training packages. Current expected volume:
- ~50–200 active orders per year (realistic for a growing fitness management operation)
- ~50–200 invoices per year
- ~50–400 payments per year (1–2x per invoice, higher if partial payments adopted)

At this volume, both single payment and partial payment models perform identically. There is no scalability concern at PP module volumes.

### 8.2 Three-Year Projection

If EFM grows to 10× current volume (500–2000 orders/year), the following scalability considerations apply:

**Single Payment Model at scale:**
- Simple queries: `payments WHERE invoice_id = X LIMIT 1`
- Invoice status always reflects single payment outcome
- Collections workflow: straightforward — any invoice not `paid` within due date = follow up
- **No scalability concerns**

**Partial Payment Model at scale:**
- More payment records per invoice (2–4 on average)
- Payment totals require aggregate queries: `SUM(payments WHERE invoice_id = X AND status = 'confirmed')`
- This aggregate runs on every Invoice status read — at high volume, should be indexed or cached
- **Performance mitigation:** Index `(invoice_id, status)` on `payments_pp` — this is a standard index and does not require architecture changes
- Collections workflow: more complex — need to track partial progress per invoice, not just paid/unpaid

**Verdict:** Partial payment model has marginally higher query complexity at scale but is fully manageable with standard indexing. No architectural re-design needed at projected 3–5 year volumes for PP module.

### 8.3 Future Module Expansion

If the partial payment model is adopted for PP, the same pattern can be applied consistently to B2B Management and B2B Event modules. Consistency across modules is an architectural advantage.

If the single payment model is adopted for PP but B2B requires installments (common for corporate contracts), a divergence in payment architecture across modules creates maintenance burden and cognitive overhead.

**Long-term recommendation:** Choose the model that works for the most complex use case (PP installment payments) and apply it consistently across all three modules.

### 8.4 Integration With Future Financial Reporting

A future financial reporting layer (Phase 4+) will need:
- Total revenue collected per period
- Outstanding receivables by order/client
- Payment collection rate (invoices paid on time)
- Average days to payment

**Partial payment model provides richer data:**
- Payment velocity (how long between installments)
- First payment date vs. final payment date
- Partial payment frequency by client segment

**Single payment model is simpler to report but loses installment granularity.**

---

## 9. RECOMMENDATION

### 9.1 Recommended Payment Model: Partial Payment (Multiple Payments per Invoice)

**Rationale:**

1. **Scenario coverage:** Partial payment model handles 9/10 scenarios (A–J) cleanly. Single payment model handles 5/10 cleanly (A, C-workaround, G, F-partial, J-gap shared).

2. **Fitness industry norm:** Installment payments and deposit arrangements are standard in the personal training industry. Requiring full upfront payment creates client friction and competitive disadvantage.

3. **Schema compatibility:** The current Batch 2A schema already supports partial payments structurally — `payments_pp.amount` is a field that can hold any positive value. The UNIQUE FK on `receipts_pp.payment_id` is already compatible. No schema changes required to support partial payments.

4. **Audit trail superiority:** Multiple payment records per invoice provide granular cash flow history. Single payment model collapses this into a single event.

5. **Future refund compatibility:** When OPEN-NEW-01 is resolved with a `refunds_pp` entity, partial payment model enables per-installment refund tracking.

6. **Consistency across modules:** B2B corporate contracts almost certainly require installments. Adopting partial payments for PP now establishes a consistent pattern.

### 9.2 Recommended Activation Option: Option C (Independent from Payment)

**Rationale:**

1. **Gate compatibility:** Option C requires no changes to current Batch 2A gate definitions. Gates 02, 03, 04 all work as specified.

2. **Agreement timing compatibility:** Clients can sign Agreement before paying, which is the standard contractual expectation.

3. **Alignment with OPEN-2B-04 (APPROVED):** OPEN-2B-04 established that "commercial activation and program readiness are separate." Option C extends this principle to also separate payment completion from commercial activation.

4. **Options A and B require schema changes:** Option A requires an intermediate Order status. Option B requires a minimum-threshold validation rule not in current spec. Option C requires no changes.

5. **EFM operational maturity:** With a proper admin dashboard, EFM can track payment status separately from program status. The system surfacing outstanding invoices is more effective than blocking program activation — it encourages proactive collection rather than passive enforcement.

**Caveats if Option C is selected:**
- EFM admin team must review outstanding invoice reports regularly
- Program activation in Option C is an admin action — it should require an admin role check (already in Batch 2A)
- Consider adding a UI warning (not a block) when admin tries to activate an Order with no confirmed payment — warning does not prevent activation, but surfaces the financial state

### 9.3 Recommended Receipt Rule (Already Decided, Confirming)

**One receipt per confirmed payment.** This is already architecturally decided (UNIQUE FK in ER Matrix). Confirming alignment with partial payment recommendation: multiple receipts per invoice are expected, each referencing a distinct confirmed payment.

### 9.4 Open Sub-Issues Requiring Phase 2 Resolution

| Issue | Status | Impact |
|---|---|---|
| OPEN-2A-02: Payment ID docType in id.generator.js | Sub-decision, not owner-level | Must add `PAY` docType to id.generator.js before billing service implementation |
| OPEN-NEW-01: `refunds_pp` entity | Phase 3+ design required | Does not block Phase 2 billing service implementation; refunds can be "manual + note" in Phase 2 |
| Overpayment handling (Gate 04) | Engineering decision | Add validation: `payment.amount > invoice.total_amount` → reject or warn; no owner decision needed |
| `paid → void` Invoice transition | Engineering decision | Define whether a paid invoice can be cancelled (Order cancellation scenario); no owner decision needed |
| Minimum DP threshold (if Option B chosen) | Policy parameter | If owner selects Option B, define minimum first payment percentage |

---

## 10. EXACT OWNER DECISION

### OPEN-2A-03 — Partial Payment Policy

**The owner must answer the following question:**

> **"May one Invoice in the PP module have multiple confirmed Payment records (partial installment payments), or must each Invoice be settled by exactly one full Payment?"**

---

**OWNER DECISION: PENDING**

---

### Decision Options (choose exactly one):

**OPTION B-APPROVED (Recommended):**
> "I APPROVE partial payments for the PP module. One Invoice may have multiple confirmed Payment records. Invoice status transitions to `paid` when the sum of confirmed payments equals or exceeds the invoice total amount. Additionally, I APPROVE activation Option C: Order status is an independent admin action, separate from payment completion. The billing service may implement partial payment logic as described in OPEN-2A-03 analysis."

**OPTION B-ALTERNATIVE:**
> "I APPROVE partial payments for the PP module (one Invoice may have multiple Payments), but I SELECT activation Option B: Order ACTIVE is triggered by the first confirmed payment. A minimum first payment threshold of [___]% of invoice total is required."

**OPTION A-APPROVED (Restrictive):**
> "I REJECT partial payments for the PP module. Each Invoice must be settled by exactly one full Payment. I APPROVE activation Option A: Order ACTIVE only after full payment is confirmed. The engineering team must define an intermediate Order status to resolve the Gate 02 circular dependency."

---

**Pending:** Owner has not yet reviewed or answered this question.

**Consequence of not deciding:** Phase 2 billing service (`billing.service`) cannot be implemented. The `invoices_pp`, `payments_pp`, and `receipts_pp` table creation scripts cannot be finalized. Phase 2 is blocked on this decision.

---

## 11. CONSEQUENCES OF APPROVAL (Partial Payment — Recommended Option)

If the owner selects **OPTION B-APPROVED** (partial payments + Option C activation), the following architectural consequences take effect:

### 11.1 Schema Consequences

- `invoices_pp` schema as specified in Batch 2A is used AS-IS (no `amount_paid` field added; computed on demand)
- `payments_pp` allows multiple records per `invoice_id` — no UNIQUE constraint on `invoice_id` in `payments_pp`
- `receipts_pp` retains UNIQUE FK on `payment_id` — one receipt per confirmed payment (unchanged)
- `orders_pp.status` transitions remain as Batch 2A spec: admin action triggers `draft → active`
- **No schema changes required beyond what is already in Phase 2 plan**

### 11.2 Service Consequences

**billing.service must implement:**
- `sumConfirmedPayments(invoiceId)` — aggregate query returning SUM of confirmed payment amounts
- Invoice `paid` transition trigger: runs after each payment confirmation, checks if sum >= total_amount
- Gate 04 validation: `payment.amount <= (total_amount - sumConfirmedPayments(invoiceId))` — prevent overpayment
- Or: allow overpayment with warning (policy decision, not blocking)

**order.service must implement:**
- Admin-triggered `draft → active` transition (already in Batch 2A spec)
- Optional: surface a UI warning (not block) when activating an order with zero confirmed payments

### 11.3 API Consequences

- `POST /api/pp/payments` — creates payment record (no change from Batch 2A)
- `POST /api/pp/payments/:paymentId/confirm` — confirms payment, triggers Invoice paid check (no change)
- `POST /api/pp/payments/:paymentId/receipt` — generates receipt after confirmation (no change)
- `GET /api/pp/invoices/:invoiceId/payment-summary` — NEW endpoint: returns `total_amount`, `amount_paid`, `remaining_balance`, list of confirmed payments

**The `payment-summary` endpoint is the ONLY new API addition required.** All other endpoints are already in the Batch 2A spec.

### 11.4 Frontend Consequences

- Invoice detail page: show payment progress bar (amount paid / total amount)
- Invoice detail page: show list of all payment records (not just one)
- Receipt section: show all receipts (RCP-PP-26-0001, RCP-PP-26-0002, etc.) linked to invoice
- Order detail page: show Invoice payment status independently of Order status
- **These are frontend implementation details — no impact on Phase 2 backend schema decisions**

### 11.5 Business Process Consequences

- EFM admin team can accept installment payments without creating multiple invoices
- Collections workflow: admin reviews `invoices WHERE status = 'sent' AND due_date < NOW()` for overdue follow-up
- Clients receive multiple receipts if they pay in installments — receipt template must show per-payment amounts

### 11.6 Risks

- Admin risk: accepts small partial payment, program starts (Option C), client never pays balance. Mitigation: collections workflow + outstanding invoice report.
- Data risk: `amount_paid` drift if billing service fails mid-update. Mitigation: compute from `payments_pp` directly, no stored field to maintain.
- Client confusion: multiple receipts for one invoice. Mitigation: clear receipt document design (show "Payment 1 of X" context).

---

## 12. CONSEQUENCES OF REJECTION (Single Payment — Alternative)

If the owner selects **OPTION A-APPROVED** (full payment required), the following consequences take effect:

### 12.1 Schema Consequences

- `payments_pp.amount` requires validation: MUST equal `invoice.total_amount` (within tolerance for bank fees)
- Alternatively: add UNIQUE constraint on `payments_pp.invoice_id` — only one payment per invoice allowed
- `orders_pp` needs an intermediate status to resolve Gate 02 circular dependency:
  - Current: `draft → active`
  - Required: `draft → billing_ready → active` (or similar)
  - OR: Relax Gate 02 to allow Invoice creation in `draft` Order state
- **These are schema/API changes not currently in the Phase 2 plan — adds engineering scope**

### 12.2 Service Consequences

**billing.service must add:**
- Payment amount validation: `payment.amount = invoice.total_amount` (strict equality check, or with tolerance for bank fees)
- OR: UNIQUE constraint enforcement at database level on `payments_pp.invoice_id`

**order.service must add:**
- New intermediate status `billing_ready` OR relax Gate 02 — both require spec revision and API changes

### 12.3 Operational Constraints

- EFM CANNOT accept DP payments — clients must pay full amount before starting
- If a client wants installments: admin must create two separate invoices at specific amounts, then track them manually as "installment 1 of 2" and "installment 2 of 2"
- No systemic link between multiple invoices — collections management becomes manual
- If client pays wrong amount (Scenario E underpayment): no clean path — admin must reject and ask client to re-send correct amount

### 12.4 Architecture Debt Incurred

- Gate 02 circular dependency is not resolved — engineering team must define resolution and add to Batch 2A spec
- Two-invoice installment workaround creates untracked manual process
- Future migration to partial payments (which may be necessary as EFM grows) becomes more complex — data and API patterns would need to change

### 12.5 When Single Payment Model Is Appropriate

Single payment is the right choice if:
- EFM policy strictly requires full upfront payment (no exceptions)
- Installment arrangements are handled entirely outside the system (by separate agreement, bank transfer schedule, etc.)
- The billing service is intended to be a settlement-only ledger, not an installment tracker

If these conditions hold, the single payment model is simpler and lower risk. The engineering team should note: **Gate 02 resolution is still required** even under this model, as the circular dependency exists regardless of payment policy.

---

## APPENDIX A: Decision Dependency Map

```
OPEN-2A-03 (this document) — Partial Payment Policy
  ├── Blocks: billing.service implementation
  ├── Blocks: invoices_pp finalized schema
  ├── Blocks: payments_pp finalized schema  
  ├── Affects: Order activation trigger logic
  ├── Affects: invoice.service paid transition logic
  └── Surfaces: OPEN-NEW-01 (refund entity) — independent, Phase 3 scope

OPEN-2A-02 — Payment ID format in id.generator.js
  └── Sub-dependency of OPEN-2A-03 (needed regardless of which option chosen)
      → Add PAY docType to id.generator.js

OPEN-NEW-01 — Refunds entity
  └── Does NOT block Phase 2 billing service
  └── Phase 2 position: "refunds are manual + admin note, no system entity"
  └── Phase 3: design refunds_pp schema
```

---

## APPENDIX B: Scenario Matrix Summary

| Scenario | Single Payment | Partial Payment | Winner |
|---|---|---|---|
| A: Full payment upfront | Clean | Clean | Tie |
| B: 50% DP + 50% balance | Requires 2 invoices | One invoice, 2 payments | Partial |
| C: Multiple installments | Requires N invoices, manual | One invoice, N payments | Partial |
| D: Partial payment, program running | N/A (blocked by Option A) | Handled if Option B/C | Partial |
| E: Underpayment | No clean path | Tracked as partial | Partial |
| F: Overpayment | Same gap | Same gap | Tie |
| G: Failed/rejected payment | Clean | Clean | Tie |
| H: Cancelled order with payment | Clean (2-invoice) | Receipt immutable, gap on refund | Tie |
| I: Refund | OPEN-NEW-01 gap | OPEN-NEW-01 gap (better granularity) | Partial slight |
| J: Payment correction | Shared gap | Shared gap | Tie |

**Summary: Partial 4–5 wins, Tie 5–6, Single 0 wins**

---

*Document end. OWNER DECISION = PENDING. Do not begin Phase 2 coding until owner records decision on OPEN-2A-03.*
