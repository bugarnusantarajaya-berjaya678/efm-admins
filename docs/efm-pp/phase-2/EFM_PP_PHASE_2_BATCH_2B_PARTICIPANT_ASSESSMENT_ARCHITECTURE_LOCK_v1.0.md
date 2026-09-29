# EFM PP — PHASE 2 BATCH 2B: PARTICIPANT & ASSESSMENT ARCHITECTURE LOCK v1.0

**Status:** ARCHITECTURE LOCK — ANALYSIS ONLY  
**Date:** 2026-09-29  
**Branch:** `claude/add-claude-md-instructions-7iqjvo`  
**Constraint:** NO CODE WRITTEN — documentation only  
**Phase:** 2, Batch 2B — Participant & Assessment  
**Prerequisite:** Phase 1 Foundation COMPLETE; Batch 2A entities must be defined (Order, Client) before Participant can be implemented

---

## 1. SCOPE OF BATCH 2B

Batch 2B implements the participant roster management and assessment history for the PP module. It covers:

| Entity | ID Format | Phase 1 ID Token Available |
|---|---|---|
| Participant | No dedicated ID sequence (see §4.1) | OPEN DECISION — see §9 |
| ParticipantHistory | System-generated (audit pattern) | — |
| Assessment | `SCR-YY-xxxx` | ✓ `nextId(ASSESSMENT, PP)` → GLOBAL bucket |

**Explicitly OUT of Batch 2B scope:**
- Agreement (Phase 3)
- H&S acknowledgement (Phase 3) — though H&S references participants
- Assignment (Phase 5)
- Session, Attendance (Phase 5)
- Client entity (Batch 2A — Client is the payer/registrant, Participant is the training subject)
- Active Aging module-specific rules (remain module-scoped, not implemented as global gates)

**Relationship to Batch 2A:**
- Every Participant belongs to an Order (Batch 2A)
- Every Assessment is linked to a Client/Lead (Batch 2A) AND may be linked to an Order (Batch 2A)
- Batch 2B cannot be implemented without Batch 2A Order and Client entities

---

## 2. AUTHORITY CHAIN

Same as Batch 2A — see Batch 2A document §2. Key sources for Batch 2B specifically:
- `EFM_PP_TECHNICAL_BUILD_SPECIFICATION_v1.0.md` §§ on Participant, Assessment field classifications
- `04_EFM_PP_DATABASE_SCHEMA_MIGRATION_SPEC_v1.0.md` — `order_participants`, `assessments`, participant change history
- `03_EFM_PP_BACKEND_CODING_PLAN_v1.0.md` Phase 4 scope
- `06_EFM_PP_BACKEND_VALIDATION_GATE_SPEC_v1.0.md` Gates 07 (Participant)
- `EFM_PP_PHASE_1_ARCHITECTURE_RECONCILIATION_REPORT_v1.0.md` §8 (Participant/Assessment gaps)
- `EFM_PP_PHASE_0_REPOSITORY_DISCOVERY_REPORT.md` §10 (Assessment architecture, confirmed bugs)

---

## 3. PHASE 1 FOUNDATION INHERITANCE

The following Phase 1 items are directly relevant to Batch 2B:

| Foundation Item | Used By |
|---|---|
| `nextId(ASSESSMENT, PP)` → `SCR-YY-xxxx` (GLOBAL bucket) | Assessment ID generation |
| `audit.service.js` | Participant history events; Assessment creation audit |
| `errors.js` standard categories | Participant and Assessment validation errors |
| `withTransaction` | Participant creation within Order transaction |
| Correlation ID middleware | All Batch 2B routes |

---

## 4. ENTITY SPECIFICATIONS

### 4.1 Participant (`order_participants` table)

**Source of truth:** `order_participants` table.

**Locked rules (from spec — non-negotiable):**
- Participant is SEPARATE from payer/registrant (Client)
- In a Solo program: Client IS the Participant — but two separate records must still exist
- In a Couple program: one Client (payer), two Participants
- In a Group program: one Client (payer), N Participants (N = package session_count / group_size — OPEN DECISION §9.1)
- Participant identity: the person who physically participates in training sessions
- Participant changes are append-only history (a change to a Participant's identity fields creates a new ParticipantHistory record, not a mutation of the original)
- Wali (guardian) is required for Participants under 17 years of age
- A Participant may be reused across multiple Orders if the same person re-enrolls

**Field specification — order_participants table:**

| Field | Type | Classification |
|---|---|---|
| `id` | TEXT (PK) | OPEN DECISION §9.2 — format TBD |
| `order_id` | TEXT NOT NULL FK → orders(id) | System-linked (set at creation) |
| `client_id` | TEXT FK → clients(id) | System-linked (nullable: group participants may not be pre-registered clients) |
| `full_name` | TEXT NOT NULL | User input |
| `phone` | TEXT | User input |
| `email` | TEXT | User input |
| `birth_date` | DATE | User input |
| `gender` | TEXT | User input |
| `slot_number` | INTEGER NOT NULL | System-assigned: 1 (solo), 1–2 (couple), 1–N (group) |
| `status` | TEXT NOT NULL DEFAULT 'active' | System-maintained: `active` | `substituted` | `removed` |
| `notes` | TEXT | User input |
| `created_at` | TIMESTAMPTZ | System-generated |
| `updated_at` | TIMESTAMPTZ | System-generated |

**Constraint:** `UNIQUE (order_id, slot_number)` — prevents duplicate slot assignments.

**Constraint:** Per Gate 07 — participant count must match the `program_type` of the Order:
- `solo` → exactly 1 participant
- `couple` → exactly 2 participants (OPEN DECISION §9.1 on couple pricing policy)
- `group` → N participants per capacity rules

**Database table:** `order_participants`

**Legacy reference:** `ppOrdersData.js` embeds `namaPeserta`, `jenisProgram`, `klienIds` arrays in Order records. These are legacy patterns — in the backend, participants are separate records in `order_participants`.

---

### 4.2 ParticipantHistory (`participant_history` table)

**Source of truth:** `participant_history` table (append-only).

**Locked rules:**
- Participant identity changes must be audited, not silently overwritten
- Whenever a Participant's identity fields change (name, phone, birth_date, etc.), a ParticipantHistory record is created before the change is applied
- ParticipantHistory is append-only: no UPDATE or DELETE allowed on this table
- This table uses the Audit pattern (not the Audit Event pattern — it is domain-specific history, not a system event log)

**Field specification — participant_history table:**

| Field | Type | Classification |
|---|---|---|
| `id` | SERIAL (PK) | System-generated |
| `participant_id` | TEXT NOT NULL FK → order_participants(id) | System-linked |
| `changed_at` | TIMESTAMPTZ NOT NULL DEFAULT NOW() | System-generated |
| `changed_by` | TEXT | Actor ID (staff member) |
| `previous_values` | JSONB NOT NULL | Snapshot: all identity fields before the change |
| `change_reason` | TEXT | User input (reason for participant change) |

**Append-only guarantee:** The service layer must not expose an `update` method for `participant_history`. The repository must not implement `UPDATE` on this table.

**Database table:** `participant_history`

---

### 4.3 Assessment (`assessments` table)

**Source of truth:** `assessments` table.

**Locked rules (from spec — non-negotiable):**
- Assessment is an INDEPENDENT historical record
- Assessment is NOT overwritten — each assessment round creates a new record
- Assessment ID format: `SCR-YY-xxxx` — generated via `nextId(ASSESSMENT, PP)` which uses the GLOBAL module bucket (Phase 1 confirmed: `GLOBAL_TYPES = new Set([DOCTYPE.ASSESSMENT, ...])`)
- Assessment is linked to a Client/Lead (primary link)
- Assessment MAY be linked to an Order (secondary link — the Assessment done pre-Order for screening)
- Multiple Assessments can exist for the same Client/Lead over time (pre-test, post-test, periodic re-assessment)
- `prevAssessmentId` links to the preceding Assessment for this client (nullable for first assessment)
- Assessment is NOT medical clearance — it captures fitness and health baseline data only
- Active Aging-specific assessment rules (companion, medical referral, etc.) are module-scoped and must NOT be applied as universal PP Assessment gates

**Field specification (complete):**

| Field | Type | Classification |
|---|---|---|
| `id` | TEXT (PK) | System-generated via `nextId(ASSESSMENT, PP)` → `SCR-YY-xxxx` |
| `lead_id` | TEXT FK → leads(id) | User input / system-linked (nullable if walk-in) |
| `client_id` | TEXT FK → clients(id) | System-linked (required — who was assessed) |
| `order_id` | TEXT FK → orders(id) | System-linked (nullable — pre-order screening may have no Order yet) |
| `prev_assessment_id` | TEXT FK → assessments(id) | System-linked (nullable for first assessment) |
| `assessment_type` | TEXT NOT NULL | User input: `pre-test`, `post-test`, `periodic` |
| `assessment_status` | TEXT NOT NULL DEFAULT 'draft' | System-maintained: `draft` | `completed` |
| `assessed_by` | TEXT FK → pic_master(id) | System-linked (PIC who conducted assessment) |
| `assessment_date` | DATE NOT NULL | User input |
| `notes` | TEXT | User input |
| `created_at` | TIMESTAMPTZ | System-generated |

**Tanita Body Composition fields (from legacy `ppAssessmentsData.js`):**

| Field | Type | Classification |
|---|---|---|
| `weight_kg` | NUMERIC(5,2) | User input |
| `height_cm` | NUMERIC(5,1) | User input |
| `bmi` | NUMERIC(4,2) | Calculated: weight / (height/100)² |
| `body_fat_pct` | NUMERIC(4,2) | User input (from Tanita) |
| `visceral_fat` | NUMERIC(4,1) | User input (from Tanita) |
| `muscle_mass_kg` | NUMERIC(5,2) | User input (from Tanita) |
| `body_age` | INTEGER | User input (from Tanita) |
| `bone_mass_kg` | NUMERIC(4,2) | User input (from Tanita) |
| `bmr_kcal` | INTEGER | User input (from Tanita) |
| `tbw_pct` | NUMERIC(4,2) | User input (from Tanita) |

**Girth measurements:**

| Field | Type | Classification |
|---|---|---|
| `girth_chest_cm` | NUMERIC(5,1) | User input |
| `girth_waist_cm` | NUMERIC(5,1) | User input |
| `girth_hips_cm` | NUMERIC(5,1) | User input |
| `girth_thigh_cm` | NUMERIC(5,1) | User input |
| `girth_arm_cm` | NUMERIC(5,1) | User input |

**Fitness test fields (from legacy):**

| Field | Type | Classification |
|---|---|---|
| `fitness_test_data` | JSONB | User input (flexible structure per fitness test protocol) |

**Design note on fitness test data:** The legacy `ppAssessmentsData.js` shows many specific fitness test fields (push-up count, sit-up count, plank duration, etc.). Using `JSONB` for this section allows flexibility as fitness test protocols evolve without requiring schema migrations. The JSONB keys must follow a documented standard.

**OPEN DECISION §9.3:** Whether to use strict columns for Tanita/girth data or JSONB for the full assessment. This affects how assessments are queried and compared across time periods.

**Database table:** `assessments`

**Critical legacy bug (confirmed in Phase 0 and Phase 1 Reconciliation):**

The legacy `getAssessmentByOrderId()` function in `ppAssessmentsStore.js` ALWAYS returns null because no assessment record contains an `orderId` field. This is fixed in the new schema by explicitly including `order_id` as a nullable foreign key on the `assessments` table. The backend implementation must correctly populate `order_id` when an assessment is conducted for an existing Order.

**Legacy reference:** `ppAssessmentsData.js` — ID format `SCR-YY-xxxx` confirmed correct. `leadId` and `klienId` linkage patterns confirmed. `prevAssessmentId` chain confirmed. `orderId` field was MISSING from legacy (confirmed bug — now fixed in this schema).

---

## 5. VALIDATION GATES (BATCH 2B)

### Gate 07 — Participant Validation

Before a Participant can be added to an Order:
1. Order must exist and have `status = 'active'` or `status = 'draft'`
2. Participant slot_number must not already be occupied for this Order
3. For `solo` orders: no more than 1 participant allowed
4. For `couple` orders: no more than 2 participants allowed
5. If `birth_date` indicates age < 17: `guardian_name` and `guardian_phone` must be provided
6. If a `client_id` is provided: the Client must exist

Error type: `BUSINESS_RULE_VIOLATION` with relevant participant failure codes.

**Participant change audit requirement:** Before changing any of `full_name`, `phone`, `email`, `birth_date`, `gender`, a `participant_history` record must be created in the SAME transaction. If the history insert fails, the change must be rolled back.

### Assessment Pre-conditions (not a numbered gate, but a precondition)

Before an Assessment can be created:
1. `client_id` must exist
2. If `order_id` is provided: Order must exist
3. `assessment_date` must not be in the future
4. `assessment_type` must be a valid enum value

Assessment creation does NOT require a prior Assessment to exist (first assessment has `prev_assessment_id = null`).

---

## 6. API ENDPOINTS (BATCH 2B)

### Participants
```
POST   /api/pp/orders/:orderId/participants
GET    /api/pp/orders/:orderId/participants
GET    /api/pp/participants/:participantId
PATCH  /api/pp/participants/:participantId
DELETE /api/pp/orders/:orderId/participants/:participantId
GET    /api/pp/participants/:participantId/history
```

Note on DELETE: Participant removal from Order does not delete the record — it sets `status = 'removed'` and creates a ParticipantHistory entry. Hard delete is not permitted.

### Assessments
```
POST /api/pp/clients/:clientId/assessments
GET  /api/pp/clients/:clientId/assessments
GET  /api/pp/assessments/:assessmentId
```

Note: Assessment is tied to Client, not directly to Order. The Order-linked assessments are retrieved via `GET /api/pp/clients/:clientId/assessments?orderId=:orderId`.

---

## 7. DATABASE MIGRATIONS REQUIRED (BATCH 2B)

The following tables must be created (in the same migration as Batch 2A or a separate `003_create_participant_assessment.sql`):

```
order_participants
participant_history
assessments
```

**Migration dependency:** `order_participants` requires `orders` (Batch 2A) and `clients` (Batch 2A) to exist. `assessments` requires `clients` (Batch 2A), `leads` (Batch 2A), and optionally `orders` (Batch 2A).

**Migration rules:**
1. Additive only — no Phase 1 tables altered
2. `participant_history`: no UPDATE or DELETE path in service layer
3. `assessments`: no UPDATE on completed assessments (append-only historical records)

---

## 8. SERVICE ARCHITECTURE (BATCH 2B)

```
backend/src/modules/
  participants/
    participant.repository.js
    participant.service.js     ← includes participant history creation in same transaction
    participant.router.js
  assessments/
    assessment.repository.js
    assessment.service.js
    assessment.router.js
```

**Key service rules:**
- `participant.service.js` must create ParticipantHistory in the same `withTransaction` call as any Participant update
- `assessment.service.js` must use `nextId(DOCTYPE.ASSESSMENT, MODULE.PP)` for all Assessment IDs
- Assessment service must emit Audit events for creation and status changes
- Assessment service must correctly link `order_id` when an Order context is provided

---

## 9. OPEN OWNER DECISIONS

### OPEN-2B-01: Group Program Participant Count

**What:** The spec supports `couple` and `group` program types. Couple = 2 participants. Group participant count is not explicitly specified: is it fixed per package, or variable up to a capacity_max?

**Options:**
- A: Group capacity is fixed per Package (stored in `packages.max_participants`)
- B: Group capacity is set per Order at creation time (stored in `orders.group_capacity`)
- C: Group capacity follows the legacy `kapasitas_min` / `kapasitas_max` fields from `ppProgramDBData.js`

**Impact:** Affects Gate 07 validation (how many participants can be added to a Group order).

**Decision Required From:** Owner

---

### OPEN-2B-02: Participant ID Format

**What:** The spec does not define a dedicated Participant ID format. The Phase 1 `id.generator.js` has no `PARTICIPANT` doc type.

**Options:**
- A: Use database `SERIAL` + `PAX-PP-YY-xxxx` format (add to id.generator.js)
- B: Use database `UUID` (no custom format, no sequence needed)
- C: Use the same `KL-xxxx` client ID for the solo case; no separate Participant ID for couple/group (embedding into Order)

**Impact:** Option C would mean solo participants are just referenced by their `client_id`, which simplifies the solo case but complicates uniform participant handling. Options A or B maintain consistent participant identity across program types.

**Decision Required From:** Owner

---

### OPEN-2B-03: Assessment Data Structure — Column vs JSONB

**What:** The assessment body contains Tanita composition data (10 fields) and girth measurements (5 fields) — these are regular enough to warrant fixed columns. Fitness test data varies more across assessment protocols.

**Options:**
- A: Full strict columns for all assessment data (enables SQL range queries by field; rigid schema)
- B: JSONB for all body composition and test data (flexible; harder to query specific fields)
- C: Strict columns for Tanita/girth (the 15 fixed fields); JSONB for fitness test data (the variable portion)

**Recommendation (from spec analysis):** Option C. Tanita and girth data is stable and frequently compared across assessments. Fitness test protocols evolve. This is consistent with the `metadata JSONB` pattern already used in `audit_events`.

**Decision Required From:** Owner confirmation of Option C, or alternative choice

---

### OPEN-2B-04: Assessment as Pre-Order Gate

**What:** From the legacy phase 0 report, Gate 07 requires "Assessment must exist before Order can be created" (business gate currently not implemented). However, the Technical Build Specification classifies Assessment as an independent historical record that MAY exist before, during, or after an Order.

**Clarification needed:** Is the pre-Order Assessment (screening) a HARD gate (Order cannot be created without it) or a SOFT recommendation?

**Options:**
- A: Hard gate — Order creation fails if no Assessment exists for the Client/Lead
- B: Soft gate — Order creation warns but proceeds if no Assessment exists
- C: No gate — Assessment creation and Order creation are independent workflows

**Impact:** Significant impact on Gate 02 (Order Validation) in Batch 2A. If Option A, Batch 2A Order service must call Assessment service to check existence.

**Decision Required From:** Owner

---

## 10. LEGACY COMPATIBILITY CONSTRAINTS

The following legacy items must NOT be modified or deleted during Batch 2B implementation:

| Legacy Item | Location | Constraint |
|---|---|---|
| `ppAssessmentsData.js` + `ppAssessmentsStore.js` | `REACT-APP/src/data/` | Must not be deleted or modified |
| `ppKlienData.js` + `ppKlienStore.js` | `REACT-APP/src/data/` | Must not be deleted or modified |
| `ppAbsensiData.js` | `REACT-APP/src/data/` | Must not be deleted or modified (attendance seed) |

**Known bug in legacy (do not replicate in new code):**  
`ppAssessmentsStore.getAssessmentByOrderId()` always returns null because no legacy assessment record contains an `orderId` field. The new backend correctly includes `order_id` in the `assessments` table. Do NOT replicate the missing `order_id` bug in new code.

---

## 11. NON-NEGOTIABLE CONSTRAINTS (BATCH 2B SPECIFIC)

1. **Participant is separate from Client** — never merge these two entities
2. **Assessment is independent historical record** — never update an existing assessment; always create a new one
3. **Assessment is NOT medical clearance** — do not add medical clearance gating logic
4. **Active Aging rules are module-scoped** — no Active Aging companion, medical referral, or other Active Aging rules in the Batch 2B global Participant/Assessment gates
5. **Participant changes must be audited** — ParticipantHistory is required, not optional
6. **Assessment linked to GLOBAL sequence** — `nextId(ASSESSMENT, PP)` uses the GLOBAL bucket, not PP-specific; this is intentional and was a Phase 1 deliberate decision to prevent SCR ID collisions across modules

---

## 12. BATCH 2B PHASE 2 READINESS VERDICT

**Status:** CONDITIONAL LOCKED — blocked on Batch 2A completion and the following open decisions:

| Condition | Status |
|---|---|
| Phase 1 Foundation complete | ✓ CONFIRMED |
| Batch 2A Order + Client entities ready | ⚠ DEPENDS ON BATCH 2A |
| Participant entity specification | ✓ IN THIS DOCUMENT |
| ParticipantHistory specification | ✓ IN THIS DOCUMENT |
| Assessment entity specification | ✓ IN THIS DOCUMENT |
| Assessment `order_id` bug fixed (known legacy bug) | ✓ ADDRESSED IN SCHEMA |
| OPEN-2B-01 Group Participant Count | ⚠ OPEN OWNER DECISION |
| OPEN-2B-02 Participant ID Format | ⚠ OPEN OWNER DECISION |
| OPEN-2B-03 Assessment Data Structure | ⚠ OPEN OWNER DECISION (Option C recommended) |
| OPEN-2B-04 Assessment as Pre-Order Gate | ⚠ OPEN OWNER DECISION (cross-batch impact) |

---

*Document created: 2026-09-29 | Mode: ANALYSIS ONLY — NO SOURCE FILES MODIFIED*
