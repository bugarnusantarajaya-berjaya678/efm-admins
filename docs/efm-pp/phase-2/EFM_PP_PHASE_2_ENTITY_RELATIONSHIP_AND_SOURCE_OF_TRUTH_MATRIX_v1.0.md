# EFM PP — PHASE 2 ENTITY RELATIONSHIP AND SOURCE OF TRUTH MATRIX v1.0

**Document Type:** Architecture Reference Lock  
**Status:** LOCKED FOR PHASE 2 PLANNING — Pending Owner Review  
**Scope:** All PP entities across Phases 1–5, with Phase 2 (Batch 2A + Batch 2B) in primary focus  
**Companion Documents:**
- `EFM_PP_PHASE_2_BATCH_2A_COMMERCIAL_CORE_ARCHITECTURE_LOCK_v1.0.md`
- `EFM_PP_PHASE_2_BATCH_2B_PARTICIPANT_ASSESSMENT_ARCHITECTURE_LOCK_v1.0.md`
- `EFM_PP_PHASE_2_CROSS_BATCH_ARCHITECTURE_RECONCILIATION_v1.0.md`

---

## 1. Document Purpose

This matrix provides three things:

1. **Entity Relationship Map** — the complete set of PP entities and their foreign-key relationships, rendered in text form for clarity during pre-coding review
2. **Source of Truth Registry** — for every entity, the single authoritative source that owns it: which service creates it, which module owns its lifecycle, which other entities may reference it but never mutate it
3. **Field Classification Catalogue** — for every field in every Phase 2 entity, a classification that controls how that field may be set, updated, and read

This document is a REFERENCE artifact. It does not add new business decisions — it consolidates decisions already made in the authority chain documents and makes them navigable in one place.

---

## 2. Authority Chain (Inherited)

| Level | Document |
|-------|----------|
| 1 | EFM Core Governance |
| 2 | Master Agreement Architecture |
| 3 | Program Module System |
| 4 | PP Business Logic Master |
| 5 | PP Core Lock (Pre-Coding Lock) |
| 6 | PP Backend Data Contract |
| 7 | Technical Build Specification |
| 8 | Batch 1 Technical Documents |
| 9 | Phase 2 Batch Architecture Locks (2A, 2B, Cross-Batch Reconciliation) |
| 10 | Phase 1 Implemented Code (Phase 1 Foundation — done, merged) |

No field or relationship in this matrix may contradict Level 1–8 documents. This matrix does not resolve open decisions (see Section 10) — it uses placeholder notation `[OPEN-DECISION-ID]` where the owner must decide.

---

## 3. Complete PP Entity Relationship Map

### 3.1 Text Relationship Diagram

```
CATALOG LAYER (Phase 2A)
────────────────────────────────────────────────────────────────────────
programs
  └─< offerings                     (1 program → many offerings)
        └─< packages                (1 offering → many packages)
              └─< package_prices    (1 package → many prices, time-scoped)


LEAD / CLIENT LAYER (Phase 2A)
────────────────────────────────────────────────────────────────────────
leads_pp                             (lead: LP-xxxx)
  └─> clients_pp  [optional at lead] (1 lead → 0..1 client)
      [client becomes required once lead converts to Order]


COMMERCIAL LAYER (Phase 2A)
────────────────────────────────────────────────────────────────────────
orders_pp                            (order: PP-YY-xxxx)
  ├─> clients_pp.id                  (required FK: who is paying)
  ├─> leads_pp.id                    (optional FK: originating lead)
  ├─> packages.id                    (required FK: what was sold)
  ├─> package_prices.id              (required FK: price at time of sale)
  ├─[1:1] order_commercial_snapshots (IMMUTABLE price snapshot at order creation)
  ├─[1:1..N] invoices_pp             (1 order → 1..N invoices; typically 1)
  └─[1:1] agreements_pp              (Phase 3 — not Phase 2)

invoices_pp                          (invoice: INV-PP-YY-xxxx)
  ├─> orders_pp.id                   (required FK)
  ├─> clients_pp.id                  (denormalized for billing display)
  └─[1:N] payments_pp                (1 invoice → 1..N payment attempts)

payments_pp                          (no external ID — internal record)
  ├─> invoices_pp.id                 (required FK)
  └─[0..1:1] receipts_pp             (1 confirmed payment → 0..1 receipt)

receipts_pp                          (receipt: RCP-PP-YY-xxxx)
  ├─> payments_pp.id                 (required FK: the payment this receipt is for)
  ├─> invoices_pp.id                 (denormalized for display convenience)
  └─> orders_pp.id                   (denormalized for display convenience)


PARTICIPANT LAYER (Phase 2B)
────────────────────────────────────────────────────────────────────────
order_participants                   (join table: order ↔ participant)
  ├─> orders_pp.id                   (required FK)
  └─> participants_pp.id             (required FK)
      [participant_id format: OPEN-2B-02]

participants_pp                      (participant entity)
  └─> clients_pp.id  [optional]      (0..1: a client may also be the participant)

participant_histories_pp             (immutable audit: one row per change)
  └─> participants_pp.id             (required FK)

assessments_pp                       (assessment: SCR-YY-xxxx — GLOBAL bucket)
  ├─> participants_pp.id             (required FK — CHANGED from legacy orderId lookup)
  └─> orders_pp.id  [NULLABLE]       (optional FK: links assessment to a specific order)
      [CRITICAL: legacy always null here — Phase 2B adds this column]


PHASE 1 INFRASTRUCTURE LAYER (already implemented)
────────────────────────────────────────────────────────────────────────
id_sequences                         (counter per docType+module+year)
audit_events                         (append-only audit log — no FK constraints)
pic_master                           (PIC identity registry: PIC-YY-xxxx)
pic_contexts                         (PIC rate + module + role context)


PHASE 3 ENTITIES (not Phase 2 — listed for FK planning only)
────────────────────────────────────────────────────────────────────────
agreements_pp                        (AGR-PP-YY-xxxx)
  └─> orders_pp.id

health_and_safety_pp                 (HNA-PP-YY-xxxx)
  └─> participants_pp.id


PHASE 5 ENTITIES (not Phase 2 — listed for FK planning only)
────────────────────────────────────────────────────────────────────────
assignments_pp                       (ASG-PP-YY-xxxx)
  ├─> orders_pp.id
  └─> pic_master.id

sessions_pp                          (SES-PP-YY-xxxx)
  └─> assignments_pp.id

attendance_pp                        (ATT-PP-YY-xxxx)
  ├─> sessions_pp.id
  └─> participants_pp.id
```

### 3.2 Phase 2 Entity Count Summary

| Phase | Table(s) | Count |
|-------|----------|-------|
| Phase 1 (done) | id_sequences, audit_events, pic_master, pic_contexts | 4 |
| Phase 2A (Batch 2A) | programs, offerings, packages, package_prices, leads_pp, clients_pp, orders_pp, order_commercial_snapshots, invoices_pp, payments_pp, receipts_pp | 11 |
| Phase 2B (Batch 2B) | order_participants, participants_pp, participant_histories_pp, assessments_pp | 4 |
| Phase 3 (future) | agreements_pp, health_and_safety_pp | 2 |
| Phase 5 (future) | assignments_pp, sessions_pp, attendance_pp | 3 |
| **Total (all phases)** | | **24** |

---

## 4. Source of Truth Registry

For every entity: which service OWNS the lifecycle, which service(s) may READ freely, and which services MUST NOT write to it.

| Entity | Owner Service | May Read | Must Not Write | Notes |
|--------|--------------|----------|----------------|-------|
| `programs` | `catalog.service` | all | all others | Catalog is append-update; no hard deletes |
| `offerings` | `catalog.service` | all | all others | Owned by catalog |
| `packages` | `catalog.service` | all | all others | Owned by catalog |
| `package_prices` | `catalog.service` | all | all others | Time-scoped; new row = new price, old rows immutable |
| `leads_pp` | `lead.service` | all | all others | Lead lifecycle owned by lead service |
| `clients_pp` | `client.service` | all | all others | Client identity is immutable after creation |
| `orders_pp` | `order.service` | all | all others | Order is the commercial center |
| `order_commercial_snapshots` | `order.service` | all | NOBODY after creation | WRITE-ONCE — set on order creation, never updated |
| `invoices_pp` | `invoice.service` | all | all others | Invoice status may be updated by billing service |
| `payments_pp` | `billing.service` | all | all others | Created by billing service |
| `receipts_pp` | `billing.service` | all | all others | Created on payment confirmation |
| `participants_pp` | `participant.service` | all | all others | Participant identity is stable |
| `order_participants` | `participant.service` | all | all others | Membership managed by participant service |
| `participant_histories_pp` | `participant.service` | all | NOBODY after creation | APPEND-ONLY — never update or delete |
| `assessments_pp` | `assessment.service` | all | all others | Assessments are immutable historical records |
| `id_sequences` | `id.generator` | id.generator only | ALL application code (use nextId()) | Use the ID generator API, never direct SQL |
| `audit_events` | `audit.service` | audit.service only | ALL application code (use auditService.log()) | Use the audit service API, never direct SQL |
| `pic_master` | `pic.service` | all | all others | PIC identity managed by PIC service |
| `pic_contexts` | `pic.service` | all | all others | Cost/charge rates managed by PIC service |

### 4.1 Write-Once Entities (Critical)

These entities are written ONCE at creation and must never be updated by any code path:

| Entity | Reason | Enforcement |
|--------|--------|-------------|
| `order_commercial_snapshots` | Price snapshot captures what was agreed at order creation time; any later catalog price change must not retroactively alter this | No UPDATE route in order service; guard in agreement module |
| `participant_histories_pp` | Audit trail of participant changes; every modification creates a new row, never updates old rows | INSERT-only path in participant service |
| `assessments_pp` | Historical physical measurement records; cannot be altered after capture | No UPDATE route in assessment service |
| `audit_events` (Phase 1) | Append-only event log | INSERT-only path in audit service |

### 4.2 Immutability Rules After State Transition

| Entity | State Transition | Immutable After |
|--------|-----------------|-----------------|
| `orders_pp` | `status = 'ACTIVE'` | order line items, package ref, price ref become locked |
| `invoices_pp` | `status = 'PAID'` | total_amount, due_date become locked |
| `payments_pp` | `status = 'CONFIRMED'` | amount, method, reference become locked |
| `agreements_pp` (Phase 3) | `signed = true` | ALL fields immutable — separate snapshot is created |

---

## 5. Field Classification Legend

| Code | Meaning | Who Sets It | May Be Updated? |
|------|---------|------------|-----------------|
| `USR` | User Input | Admin user via API request | Yes, by admin (until locked) |
| `SYS` | System Generated | Service code, never user-supplied | No — overwriting is forbidden |
| `CALC` | Calculated | Derived from other fields at read or write time | Recalculated when inputs change; never user-supplied |
| `SNAP` | Snapshot | Copied from source entity at a point in time; source may change later | No — snapshot is immutable by definition |
| `REF` | Foreign Key Reference | Set at creation time; may be locked after | Only before entity is locked |
| `AUDIT` | Audit Timestamp | Set by system at row creation or state change | No |
| `ENUM` | Enumerated State | Set by service transition logic | Yes, via state machine transitions only |
| `OPEN` | Pending Owner Decision | — | — |

---

## 6. Field Classification by Entity

### 6.1 `programs`

| Field | Type | Classification | Notes |
|-------|------|---------------|-------|
| id | TEXT PK | SYS | e.g. `prog_001` or owner-decided format |
| module | TEXT | USR | PP, B2B, EVENT |
| name | TEXT | USR | e.g. "Private Training" |
| description | TEXT | USR | Optional |
| is_active | BOOLEAN | ENUM | Defaults true; admin can deactivate |
| created_at | TIMESTAMPTZ | AUDIT | System set |
| updated_at | TIMESTAMPTZ | AUDIT | System set |

### 6.2 `offerings`

| Field | Type | Classification | Notes |
|-------|------|---------------|-------|
| id | TEXT PK | SYS | |
| program_id | TEXT FK | REF | → programs.id |
| name | TEXT | USR | e.g. "Personal Training — 1 on 1" |
| delivery_mode | TEXT | USR | in_person, online, hybrid |
| is_active | BOOLEAN | ENUM | |
| created_at | TIMESTAMPTZ | AUDIT | |
| updated_at | TIMESTAMPTZ | AUDIT | |

### 6.3 `packages`

| Field | Type | Classification | Notes |
|-------|------|---------------|-------|
| id | TEXT PK | SYS | |
| offering_id | TEXT FK | REF | → offerings.id |
| name | TEXT | USR | e.g. "4 Sesi - Starter" |
| session_count | INTEGER | USR | Number of sessions included |
| is_active | BOOLEAN | ENUM | |
| created_at | TIMESTAMPTZ | AUDIT | |
| updated_at | TIMESTAMPTZ | AUDIT | |

### 6.4 `package_prices`

| Field | Type | Classification | Notes |
|-------|------|---------------|-------|
| id | TEXT PK | SYS | |
| package_id | TEXT FK | REF | → packages.id |
| price_per_session | NUMERIC(12,2) | USR | Cannot be changed — new row for new price |
| total_price | NUMERIC(12,2) | CALC | price_per_session × session_count; stored for query speed |
| effective_from | DATE | USR | Start of validity window |
| effective_to | DATE | USR | Nullable — null means currently active |
| created_at | TIMESTAMPTZ | AUDIT | |
| created_by | TEXT | SYS | Actor ID from request context |

Notes:
- Price changes create a NEW row; old rows must never be updated
- At any given date, exactly one price row per package should have `effective_to IS NULL` (the active price)

### 6.5 `leads_pp`

| Field | Type | Classification | Notes |
|-------|------|---------------|-------|
| id | TEXT PK | SYS | Format: `LP-xxxx` (permanent, no year) |
| client_id | TEXT FK | REF | → clients_pp.id — nullable until qualified |
| name | TEXT | USR | Prospect name |
| phone | TEXT | USR | |
| email | TEXT | USR | |
| source | TEXT | USR | How lead was acquired |
| status | TEXT | ENUM | new → approach → screening → invoicing → closing → convert → closed_lost |
| assigned_to | TEXT | USR | PIC assigned to follow this lead |
| notes | TEXT | USR | |
| converted_at | TIMESTAMPTZ | AUDIT | Set when status → convert |
| created_at | TIMESTAMPTZ | AUDIT | |
| updated_at | TIMESTAMPTZ | AUDIT | |

### 6.6 `clients_pp`

| Field | Type | Classification | Notes |
|-------|------|---------------|-------|
| id | TEXT PK | OPEN | Format: OPEN-2A-01 (LP-xxxx suffix, UUID, or separate CLT-xx-xxxx) |
| name | TEXT | USR | Full name |
| phone | TEXT | USR | |
| email | TEXT | USR | |
| address | TEXT | USR | |
| id_type | TEXT | USR | KTP, Passport, SIM |
| id_number | TEXT | USR | Identity document number |
| date_of_birth | DATE | USR | |
| created_at | TIMESTAMPTZ | AUDIT | |
| updated_at | TIMESTAMPTZ | AUDIT | |

Notes:
- Client identity fields (name, id_number) should be effectively immutable after an order is created on them
- A client may have multiple orders over time

### 6.7 `orders_pp`

| Field | Type | Classification | Notes |
|-------|------|---------------|-------|
| id | TEXT PK | SYS | Format: PP-YY-xxxx |
| client_id | TEXT FK | REF | → clients_pp.id — REQUIRED |
| lead_id | TEXT FK | REF | → leads_pp.id — NULLABLE |
| package_id | TEXT FK | REF | → packages.id — locked after ACTIVE |
| package_price_id | TEXT FK | REF | → package_prices.id — locked after ACTIVE |
| status | TEXT | ENUM | DRAFT → PENDING → ACTIVE → COMPLETED → CANCELLED |
| notes | TEXT | USR | |
| start_date | DATE | USR | Planned program start |
| end_date | DATE | CALC | start_date + session_count offset |
| created_at | TIMESTAMPTZ | AUDIT | |
| updated_at | TIMESTAMPTZ | AUDIT | |
| created_by | TEXT | SYS | Actor from request context |

### 6.8 `order_commercial_snapshots`

| Field | Type | Classification | Notes |
|-------|------|---------------|-------|
| id | SERIAL PK | SYS | Internal only |
| order_id | TEXT FK | REF | → orders_pp.id — UNIQUE (one snapshot per order) |
| package_name | TEXT | SNAP | Copied from packages.name at order creation |
| offering_name | TEXT | SNAP | Copied from offerings.name at order creation |
| program_name | TEXT | SNAP | Copied from programs.name at order creation |
| session_count | INTEGER | SNAP | Copied from packages.session_count at order creation |
| price_per_session | NUMERIC(12,2) | SNAP | Copied from package_prices.price_per_session at order creation |
| total_price | NUMERIC(12,2) | SNAP | Copied from package_prices.total_price at order creation |
| effective_price_date | DATE | SNAP | Date of the package_price record used |
| snapshotted_at | TIMESTAMPTZ | AUDIT | Exact timestamp of snapshot creation |

CRITICAL: NO UPDATE ever. This row must be created once on order creation and never touched again.

### 6.9 `invoices_pp`

| Field | Type | Classification | Notes |
|-------|------|---------------|-------|
| id | TEXT PK | SYS | Format: INV-PP-YY-xxxx |
| order_id | TEXT FK | REF | → orders_pp.id |
| client_id | TEXT FK | REF | → clients_pp.id (denormalized for billing display) |
| invoice_date | DATE | USR | Date invoice is issued |
| due_date | DATE | USR | Payment deadline |
| total_amount | NUMERIC(12,2) | SNAP | From order_commercial_snapshots.total_price — set at invoice creation |
| discount_amount | NUMERIC(12,2) | USR | Any discount applied; defaults 0 |
| final_amount | NUMERIC(12,2) | CALC | total_amount - discount_amount |
| status | TEXT | ENUM | DRAFT → SENT → PAID → OVERDUE → CANCELLED |
| notes | TEXT | USR | |
| created_at | TIMESTAMPTZ | AUDIT | |
| updated_at | TIMESTAMPTZ | AUDIT | |
| created_by | TEXT | SYS | |

Notes:
- `total_amount` is a SNAPSHOT of the order commercial snapshot at invoice creation time; not a live calculation
- Once `status = PAID`, total_amount and final_amount become locked

### 6.10 `payments_pp`

| Field | Type | Classification | Notes |
|-------|------|---------------|-------|
| id | TEXT PK | OPEN | Format: OPEN-2A-02 (PAY-PP-YY-xxxx or UUID internal) |
| invoice_id | TEXT FK | REF | → invoices_pp.id |
| amount | NUMERIC(12,2) | USR | Amount received for this payment |
| method | TEXT | USR | transfer, cash, qris, credit_card |
| reference | TEXT | USR | Bank transfer ref, QRIS transaction ID, etc. |
| payment_date | DATE | USR | Date payment was received |
| status | TEXT | ENUM | PENDING → CONFIRMED → REJECTED |
| confirmed_by | TEXT | SYS | Actor who confirmed this payment |
| confirmed_at | TIMESTAMPTZ | AUDIT | Set on confirmation |
| created_at | TIMESTAMPTZ | AUDIT | |

Notes:
- Partial payments: OPEN-2A-03 — whether multiple payments per invoice are allowed
- Once `status = CONFIRMED`, all fields are locked

### 6.11 `receipts_pp`

| Field | Type | Classification | Notes |
|-------|------|---------------|-------|
| id | TEXT PK | SYS | Format: RCP-PP-YY-xxxx |
| payment_id | TEXT FK | REF | → payments_pp.id — UNIQUE (1 receipt per confirmed payment) |
| invoice_id | TEXT FK | REF | → invoices_pp.id (denormalized) |
| order_id | TEXT FK | REF | → orders_pp.id (denormalized) |
| receipt_date | TIMESTAMPTZ | AUDIT | System-set on generation |
| amount | NUMERIC(12,2) | SNAP | Copied from payments_pp.amount at receipt creation |
| method | TEXT | SNAP | Copied from payments_pp.method at receipt creation |
| reference | TEXT | SNAP | Copied from payments_pp.reference at receipt creation |
| client_name | TEXT | SNAP | Copied from clients_pp.name at receipt creation |
| package_name | TEXT | SNAP | Copied from order_commercial_snapshots.package_name |
| created_at | TIMESTAMPTZ | AUDIT | |

Notes:
- Receipt is entirely system-generated; no user-supplied fields
- All value fields are snapshots — the receipt is a permanent record of what happened

### 6.12 `participants_pp`

| Field | Type | Classification | Notes |
|-------|------|---------------|-------|
| id | TEXT PK | OPEN | Format: OPEN-2B-02 — PTN-YY-xxxx or PTN-xxxx or reuse client id |
| client_id | TEXT FK | REF | → clients_pp.id — NULLABLE (participant may not be the paying client) |
| name | TEXT | USR | Full name of participant |
| phone | TEXT | USR | |
| email | TEXT | USR | |
| date_of_birth | DATE | USR | |
| gender | TEXT | USR | male, female |
| notes | TEXT | USR | |
| created_at | TIMESTAMPTZ | AUDIT | |
| updated_at | TIMESTAMPTZ | AUDIT | |

### 6.13 `order_participants`

| Field | Type | Classification | Notes |
|-------|------|---------------|-------|
| id | SERIAL PK | SYS | Internal join table ID |
| order_id | TEXT FK | REF | → orders_pp.id |
| participant_id | TEXT FK | REF | → participants_pp.id |
| role | TEXT | USR | primary, secondary, couple_partner |
| joined_at | TIMESTAMPTZ | AUDIT | When participant was added to this order |
| UNIQUE | (order_id, participant_id) | — | A participant appears once per order |

Notes:
- OPEN-2B-01: maximum participant count per order per package type
- One order may have 1..N participants (couple/group: OPEN-2B-01)

### 6.14 `participant_histories_pp`

| Field | Type | Classification | Notes |
|-------|------|---------------|-------|
| id | SERIAL PK | SYS | Internal |
| participant_id | TEXT FK | REF | → participants_pp.id |
| changed_by | TEXT | SYS | Actor from request context |
| changed_at | TIMESTAMPTZ | AUDIT | System timestamp |
| field_name | TEXT | SYS | Which field changed |
| old_value | TEXT | SYS | Previous value (serialized) |
| new_value | TEXT | SYS | New value (serialized) |
| change_reason | TEXT | USR | Optional admin note |

CRITICAL: APPEND-ONLY. No UPDATE, no DELETE.

### 6.15 `assessments_pp`

| Field | Type | Classification | Notes |
|-------|------|---------------|-------|
| id | TEXT PK | SYS | Format: SCR-YY-xxxx (GLOBAL bucket — same sequence as B2B assessments) |
| participant_id | TEXT FK | REF | → participants_pp.id — REQUIRED |
| order_id | TEXT FK | REF | → orders_pp.id — NULLABLE (links to specific order context) |
| assessed_by | TEXT | USR | PIC or admin conducting the assessment |
| assessed_at | TIMESTAMPTZ | USR | When assessment was performed |
| assessment_type | TEXT | USR | initial, progress, final |
| — TANITA BODY COMPOSITION — | | | |
| weight_kg | NUMERIC(5,2) | USR | |
| height_cm | NUMERIC(5,2) | USR | |
| bmi | NUMERIC(5,2) | CALC | weight / (height/100)² — stored for query |
| body_fat_pct | NUMERIC(5,2) | USR | From Tanita |
| muscle_mass_kg | NUMERIC(5,2) | USR | From Tanita |
| visceral_fat_level | INTEGER | USR | From Tanita |
| basal_metabolic_rate | INTEGER | USR | From Tanita (kcal/day) |
| — GIRTH MEASUREMENTS — | | | |
| chest_cm | NUMERIC(5,2) | USR | |
| waist_cm | NUMERIC(5,2) | USR | |
| hip_cm | NUMERIC(5,2) | USR | |
| left_arm_cm | NUMERIC(5,2) | USR | |
| right_arm_cm | NUMERIC(5,2) | USR | |
| left_thigh_cm | NUMERIC(5,2) | USR | |
| right_thigh_cm | NUMERIC(5,2) | USR | |
| — FITNESS TESTS — | | | |
| push_up_count | INTEGER | USR | |
| sit_up_count | INTEGER | USR | |
| flexibility_cm | NUMERIC(5,2) | USR | Sit-and-reach |
| vo2max_estimate | NUMERIC(5,2) | USR | |
| — ACTIVE AGING (PP-scoped) — | | | |
| active_aging_applicable | BOOLEAN | USR | Whether Active Aging protocol was applied |
| active_aging_screen_result | TEXT | USR | PASS, FLAGGED, REFERRED — if applicable |
| active_aging_notes | TEXT | USR | |
| — ADDITIONAL — | | | |
| goals | TEXT | USR | Free-text client goals |
| medical_notes | TEXT | USR | Contraindications, medical history flags |
| extra_data | JSONB | USR | OPEN-2B-03: optional JSONB extension for non-standard fields |
| created_at | TIMESTAMPTZ | AUDIT | System set on insertion |
| created_by | TEXT | SYS | Actor from request context |

CRITICAL: IMMUTABLE after creation. No UPDATE route. Errors require a new record.

Notes on Active Aging fields:
- Active Aging screening is PP-scoped only (never global)
- A FLAGGED or REFERRED result does NOT automatically block order activation — see OPEN-2B-04 and Gate 09
- These fields provide the screening record; the gate enforcement logic lives in the service layer

---

## 7. Phase Ownership Matrix

This matrix shows which development phase creates, owns, and may extend each entity.

| Entity | Creates In | Owned By | Phase 3 Extends | Phase 5 Extends | Notes |
|--------|-----------|----------|-----------------|-----------------|-------|
| `id_sequences` | Phase 1 ✅ | id.generator | — | Adds new docType rows | Never directly written by application |
| `audit_events` | Phase 1 ✅ | audit.service | — | — | Append-only forever |
| `pic_master` | Phase 1 ✅ | pic.service | — | Phase 5 uses for assignment | PIC identity established Phase 1 |
| `pic_contexts` | Phase 1 ✅ | pic.service | — | Phase 5 validates rates | Rate context established Phase 1 |
| `programs` | Phase 2A | catalog.service | — | — | |
| `offerings` | Phase 2A | catalog.service | — | — | |
| `packages` | Phase 2A | catalog.service | — | — | |
| `package_prices` | Phase 2A | catalog.service | — | — | Append-only for price changes |
| `leads_pp` | Phase 2A | lead.service | — | — | |
| `clients_pp` | Phase 2A | client.service | — | — | |
| `orders_pp` | Phase 2A | order.service | AGR FK added | ASG FK added | FK extensions only |
| `order_commercial_snapshots` | Phase 2A | order.service | — | — | Write-once, no extensions |
| `invoices_pp` | Phase 2A | invoice.service | — | — | |
| `payments_pp` | Phase 2A | billing.service | — | — | |
| `receipts_pp` | Phase 2A | billing.service | — | — | |
| `participants_pp` | Phase 2B | participant.service | — | attendance linked | |
| `order_participants` | Phase 2B | participant.service | — | — | |
| `participant_histories_pp` | Phase 2B | participant.service | — | — | Append-only forever |
| `assessments_pp` | Phase 2B | assessment.service | — | — | Immutable forever |
| `agreements_pp` | Phase 3 | agreement.service | — | — | Immutable once signed |
| `health_and_safety_pp` | Phase 3 | hns.service | — | — | |
| `assignments_pp` | Phase 5 | assignment.service | — | — | |
| `sessions_pp` | Phase 5 | session.service | — | — | |
| `attendance_pp` | Phase 5 | attendance.service | — | — | |

---

## 8. Foreign Key Cascade Policy

| Relationship | On Delete Parent | Rationale |
|-------------|-----------------|-----------|
| offerings → programs | RESTRICT | Cannot delete a program with offerings |
| packages → offerings | RESTRICT | Cannot delete an offering with packages |
| package_prices → packages | RESTRICT | Cannot delete a package with prices |
| orders_pp → clients_pp | RESTRICT | Cannot delete a client with orders |
| orders_pp → leads_pp | SET NULL | Lead deletion nullifies lead_id on order |
| orders_pp → packages | RESTRICT | Cannot delete a package with orders |
| orders_pp → package_prices | RESTRICT | Cannot delete a price with orders |
| order_commercial_snapshots → orders_pp | CASCADE | Snapshot follows order |
| invoices_pp → orders_pp | RESTRICT | Cannot delete an order with invoices |
| invoices_pp → clients_pp | RESTRICT | |
| payments_pp → invoices_pp | RESTRICT | Cannot delete an invoice with payments |
| receipts_pp → payments_pp | RESTRICT | Cannot delete a confirmed payment with receipts |
| receipts_pp → invoices_pp | RESTRICT | |
| receipts_pp → orders_pp | RESTRICT | |
| order_participants → orders_pp | RESTRICT | Cannot delete an order with participants |
| order_participants → participants_pp | RESTRICT | Cannot delete a participant enrolled in orders |
| participant_histories_pp → participants_pp | RESTRICT | History must outlive participant record |
| assessments_pp → participants_pp | RESTRICT | Assessments are permanent participant records |
| assessments_pp → orders_pp | SET NULL | If order is somehow removed, assessment retains but order_id → null |

---

## 9. Unique Constraint Summary

| Table | Unique Constraint | Business Rule |
|-------|------------------|---------------|
| `package_prices` | (package_id) WHERE effective_to IS NULL | Only one active price per package |
| `order_commercial_snapshots` | (order_id) | One snapshot per order |
| `invoices_pp` | (order_id) — SOFT: 1 active per order | Typically 1 invoice; business may allow re-invoice on CANCELLED |
| `receipts_pp` | (payment_id) | One receipt per confirmed payment |
| `order_participants` | (order_id, participant_id) | A participant appears once per order |
| `pic_master` | (email) | From Phase 1 implementation |
| `pic_contexts` | (pic_id, module, role, effective_from) | From Phase 1 implementation |
| `clients_pp` | (email) | OPEN-2A-01: confirm whether email uniqueness is required |

---

## 10. Open Decisions Register (All 9 — Consolidated)

These decisions were escalated to the owner in the Batch 2A, Batch 2B, and Cross-Batch Reconciliation documents. They are reproduced here for visibility. No Phase 2 coding may begin without resolution of CRITICAL items.

| Decision ID | Description | Criticality | Affects | Recommendation |
|-------------|-------------|-------------|---------|----------------|
| OPEN-2A-01 | Client ID format | MEDIUM | clients_pp.id, all FKs to it | Recommend CLT-YY-xxxx using id_sequences |
| OPEN-2A-02 | Payment ID format | LOW | payments_pp.id | Recommend UUID or PAY-PP-YY-xxxx |
| OPEN-2A-03 | Partial payments policy | HIGH | payments_pp, invoice status logic | Recommend: 1 confirmed payment per invoice; design for partial as future extension |
| OPEN-2A-04 | Promo/discount scope | MEDIUM | invoices_pp.discount_amount, potential discount_codes table | Recommend: store discount_code + discount_amount on invoice; no separate entity in Phase 2 |
| OPEN-2A-05 | Quotation entity | LOW | Optional pre-order entity | Recommend: defer quotation to Phase 3 or 6 |
| OPEN-2B-01 | Group participant count | MEDIUM | order_participants, capacity logic | Recommend: max per package_type configurable; default 1 for starter packages |
| OPEN-2B-02 | Participant ID format | MEDIUM | participants_pp.id, all FKs | Recommend PTN-YY-xxxx using id_sequences |
| OPEN-2B-03 | Assessment data structure | LOW | assessments_pp field design | Recommend Option C: structured columns + optional extra_data JSONB (already applied in Section 6.15) |
| **OPEN-2B-04** | **Assessment as pre-Order gate** | **CRITICAL** | **order.service, Gate 09 logic** | **MUST DECIDE before Phase 2A Order service coding. If YES: assessment service must exist before order service can be finalized.** |

### Decision OPEN-2B-04 Detail (Critical Cross-Batch Blocker)

The question: must at least one completed Assessment for the participant exist before an Order can be set to ACTIVE status?

- If **YES** (hard gate): The Phase 2A `order.service` ACTIVE transition must call into `assessment.service` to verify a completed assessment exists for at least one participant. This creates a runtime dependency from Phase 2A onto Phase 2B code at the service layer.
- If **NO** (soft recommendation): The Order may be ACTIVE without an assessment. The system records whether an assessment was done; operational reports flag orders without assessments; but the Order workflow is not blocked.
- If **DEFERRED GATE**: The gate is architecturally wired but defaulted to disabled in Phase 2; enabled in Phase 3 or via feature flag.

The recommended approach (from Cross-Batch Reconciliation document): **DEFERRED GATE** — wire the check point in order service, implement as feature flag defaulted OFF in Phase 2, enable in Phase 3 or 5 when full participant-assessment flow is operational.

Owner must confirm one of: YES / NO / DEFERRED GATE.

---

## 11. ID Routing Table

Every ID issued through `id.generator.js` routes to a specific (docType, module) pair. This table is the definitive reference.

| Business Entity | ID Format | docType Enum | Module Enum | Year Bucket | Issuing Phase |
|----------------|-----------|-------------|------------|-------------|--------------|
| PP Order | PP-YY-xxxx | ORDER | PP | Current year | Phase 2A |
| PP Invoice | INV-PP-YY-xxxx | INVOICE | PP | Current year | Phase 2A |
| PP Receipt | RCP-PP-YY-xxxx | RECEIPT | PP | Current year | Phase 2A |
| PP Lead | LP-xxxx | LEAD_PP | GLOBAL | year=0 (permanent) | Phase 2A |
| PP Assessment | SCR-YY-xxxx | ASSESSMENT | GLOBAL | Current year | Phase 2B |
| PP Agreement | AGR-PP-YY-xxxx | AGREEMENT | PP | Current year | Phase 3 |
| PP H&S | HNA-PP-YY-xxxx | HNS | PP | Current year | Phase 3 |
| PP Assignment | ASG-PP-YY-xxxx | ASSIGNMENT | PP | Current year | Phase 5 |
| PP Session | SES-PP-YY-xxxx | SESSION | PP | Current year | Phase 5 |
| PP Attendance | ATT-PP-YY-xxxx | ATTENDANCE | PP | Current year | Phase 5 |
| PIC | PIC-YY-xxxx | PIC | GLOBAL | Current year | Phase 1 ✅ |
| Client | [OPEN-2A-01] | — | — | — | Phase 2A |
| Participant | [OPEN-2B-02] | — | — | — | Phase 2B |
| Payment | [OPEN-2A-02] | — | — | — | Phase 2A |

Notes:
- ASSESSMENT uses MODULE.GLOBAL → shared sequence across all modules (PP, B2B, Event assessments share one counter)
- LEAD_PP, LEAD_B2B, LEAD_EVENT use year=0 bucket (permanent, no year rotation) — per Phase 1 implementation
- Client and Participant IDs require owner decision on format; if they use `id_sequences`, new DOCTYPE entries must be added

---

## 12. Migration Sequence Reference

From the Cross-Batch Reconciliation document — reproduced here for completeness.

| Migration File | Contents | Phase |
|---------------|----------|-------|
| `001_create_schema_foundation.sql` | id_sequences, audit_events, pic_master, pic_contexts | Phase 1 ✅ |
| `002_create_commercial_core.sql` | programs, offerings, packages, package_prices, leads_pp, clients_pp, orders_pp, order_commercial_snapshots, invoices_pp, payments_pp, receipts_pp | Phase 2A |
| `003_create_participant_assessment.sql` | participants_pp, order_participants, participant_histories_pp, assessments_pp | Phase 2B |
| `004_create_contract_safety.sql` | agreements_pp, health_and_safety_pp | Phase 3 |
| `005_create_operations.sql` | assignments_pp, sessions_pp, attendance_pp | Phase 5 |

Rules:
- No migration may break a previously run migration
- No migration may alter a table from a prior migration in a destructive way
- Every migration must be reversible (DOWN logic documented, even if not automated)
- Migrations 002 and 003 may be run in parallel IF OPEN-2B-04 resolves to NO or DEFERRED GATE; if YES, 003 must be deployed and tested before 002 order service code can be enabled

---

## 13. Service Architecture and Module Boundaries

Each service owns exactly one bounded context. Cross-service data access is via service API calls, not direct DB queries from another service's module.

| Service Module | Owns Table(s) | May Call | Must Not Call Directly |
|---------------|--------------|----------|----------------------|
| `catalog.service` | programs, offerings, packages, package_prices | id.generator, audit.service | — |
| `lead.service` | leads_pp | id.generator, audit.service, client.service (read) | order.service |
| `client.service` | clients_pp | id.generator, audit.service | — |
| `order.service` | orders_pp, order_commercial_snapshots | id.generator, audit.service, catalog.service, client.service, invoice.service (create), assessment.service (gate check: OPEN-2B-04) | billing.service |
| `invoice.service` | invoices_pp | id.generator, audit.service | billing.service |
| `billing.service` | payments_pp, receipts_pp | id.generator, audit.service, invoice.service (status update) | order.service |
| `participant.service` | participants_pp, order_participants, participant_histories_pp | id.generator, audit.service, client.service (read), order.service (validate order exists) | assessment.service |
| `assessment.service` | assessments_pp | id.generator, audit.service, participant.service (validate participant exists) | — |
| `pic.service` | pic_master, pic_contexts | id.generator, audit.service | — |

---

## 14. Architectural Non-Negotiables

These constraints apply across ALL Phase 2 implementation and cannot be relaxed without a new owner decision:

1. **No direct cross-service database access** — service A must not issue SQL against service B's table; use service API calls
2. **id.generator exclusively for all ID generation** — no manual ID construction, no UUID substitutes for business IDs
3. **audit.service for all business events** — no silent mutations (every create, update, state transition must generate an audit event)
4. **order_commercial_snapshots written exactly once** — on order creation, in the same DB transaction as the orders_pp row insertion
5. **No price recalculation from live catalog on existing orders** — always use order_commercial_snapshots for existing order financial display
6. **participant_histories_pp and assessments_pp are append-only** — no UPDATE or DELETE routes in their services
7. **Active Aging screening is PP-scoped only** — must not propagate to B2B or Event modules
8. **Legacy GAS data is not migrated** — legacy assessment records without order_id will not be backfilled; they remain in GAS as an archived reference
9. **No hardcoded prices or catalog data** — all price lookups through catalog.service
10. **Phase 2 does not implement Agreement, H&S, Assignment, Session, or Attendance** — those are Phase 3 and Phase 5; any FK reference from Phase 2 tables to Phase 3/5 tables is deferred until those migrations run

---

## 15. Readiness Verdict

This matrix documents the architecture for Phase 2 (Batch 2A + Batch 2B). It does not in itself block or unblock coding.

| Item | Status |
|------|--------|
| All Phase 1 foundation entities documented | COMPLETE |
| All Phase 2A entities documented with field classifications | COMPLETE |
| All Phase 2B entities documented with field classifications | COMPLETE |
| All foreign key relationships mapped | COMPLETE |
| All cascade policies decided | COMPLETE |
| All source-of-truth ownership assigned | COMPLETE |
| All ID formats documented (with open decisions flagged) | COMPLETE |
| Migration sequence confirmed | COMPLETE |
| Open decisions consolidated (9 total) | DOCUMENTED — PENDING OWNER RESOLUTION |
| CRITICAL cross-batch blocker (OPEN-2B-04) | PENDING OWNER DECISION |

**Architecture Lock Status:** LOCKED FOR REVIEW  
**Phase 2 Coding Start Condition:** All CRITICAL open decisions resolved; OPEN-2B-04 must be decided first

---

*EFM PP Phase 2 Entity Relationship and Source of Truth Matrix v1.0*  
*Prepared: 2026-09-29*  
*For Owner Review — Do Not Begin Phase 2 Implementation Until Reviewed*
