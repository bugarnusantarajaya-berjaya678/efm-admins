# EFM_PP_TECHNICAL_BUILD_SPECIFICATION_v1.0

**Project:** Essential Fitness Management (EFM)  
**Module:** Private Program (PP)  
**Document Type:** Technical Build Specification / Coding Architecture  
**Status:** BUILD BASELINE  
**Version:** 1.0  
**Primary Use:** Claude Code / Backend / API / Database / UI implementation

---

## 0. EXECUTION DIRECTIVE

This document translates the locked PP business and architecture baseline into an implementation specification.

### Mandatory principles

1. **Business Logic First → Architecture Second → Implementation Third.**
2. Do not derive business rules from legacy Google Sheets / GAS / old UI merely because they exist.
3. Do not silently change a locked business rule for implementation convenience.
4. Do not build B2B Management or B2B Event using PP-specific transaction logic.
5. Use shared EFM core infrastructure where appropriate, while preserving module-specific business rules.
6. Signed contractual records are immutable historical snapshots.
7. UI is not the source of truth for critical business validation.
8. Backend/service-layer validation must enforce critical gates.
9. Material changes must be auditable.
10. If a required decision is marked `OWNER DECISION` or `NEEDS EVIDENCE`, do not invent an answer.

---

# 1. SOURCE & AUTHORITY

## 1.1 Primary business authority

`EFM_PP_BUSINESS_LOGIC_MASTER`

Status: **LOCKED BUSINESS LOGIC BASELINE**

It is the authoritative PP business-logic baseline before UI, functional dummy flow, and backend implementation.

## 1.2 Architecture authority

Use the PP Core Lock Record and approved architecture decisions.

PP Core is locked. This is a business/document-control lock, not legal approval.

## 1.3 Backend contract authority

`EFM_PP_ACTIVE_AGING_BACKEND_DATA_CONTRACT_v1.0`

This provides the technical data-contract baseline for Order, Participant, Payment, Agreement, H&S, Assignment, Session, Attendance, and Program Ready.

## 1.4 Cross-module architecture principle

**CONSISTENT CORE, FLEXIBLE BUSINESS MODULE**

PP is the mature reference architecture. B2B Management and B2B Event may share core infrastructure but retain their own business logic, transaction flow, agreement type, pricing model, and operational workflow.

---

# 2. SCOPE

## 2.1 In scope

- Lead
- Client
- Program
- Offering
- Package
- Package Price
- Order
- Participant
- Invoice
- Payment
- Receipt
- Agreement
- H&S
- Assessment
- PIC reference
- Assignment
- Program Ready
- Session
- Attendance
- Audit/history
- Snapshot/versioning
- API/service boundaries
- validation gates
- exception handling

## 2.2 Out of scope

Do not implement as PP core:
- B2B Management transaction logic
- B2B Event transaction logic
- unresolved legal wording
- migration of legacy production data unless separately authorized
- Active Aging-only requirements as global PP gates
- unresolved production e-signature decisions
- unverified legacy operational assumptions

---

# 3. PP BUSINESS MODEL

Private Program is an individual / small-group fitness coaching service managed by EFM.

**Commercial unit:** Package / Order.

The payer/registrant may be different from the participant.

Coach = Trainer / PIC appointed by EFM.

---

# 4. MASTER PP LIFECYCLE

PP is not a single linear funnel because Consultation / Screening and Assessment are conditional and independent.

```text
LEAD
  ↓
PROGRAM / PACKAGE SELECTION
  ↓
ORDER
  ↓
INVOICE
  ↓
PAYMENT CONFIRMED
  ↓
RECEIPT
  ↓
AGREEMENT + applicable H&S
  ↓
ASSIGNMENT
  ↓
PROGRAM READY
  ↓
SESSION
  ↓
ATTENDANCE
```

Independent activities:
- Sales Consultation / Screening
- Assessment

These may occur before or after Order depending on program and process.

---

# 5. SYSTEM OF RECORD

EFM System is the system of record.

WhatsApp is a communication/distribution channel only.

Do not use WhatsApp message state as transactional truth.

---

# 6. ENTITY MODEL

## 6.1 Core entities

```text
Lead
Client
Program
Offering
Package
PackagePrice
Order
Participant
Invoice
Payment
Receipt
Agreement
HS
Assessment
PIC
Assignment
Session
Attendance
```

## 6.2 Relationship

```text
PROGRAM
  ↓
OFFERING
  ↓
PACKAGE
  ↓
PACKAGE PRICE
  ↓
ORDER
  ├── PARTICIPANT(S)
  ├── INVOICE
  ├── PAYMENT(S)
  └── AGREEMENT
        ↓
       H&S
        ↓
    ASSIGNMENT
        ↓
   PROGRAM READY
        ↓
      SESSION
        ↓
    ATTENDANCE
```

Assessment is an independent historical record and is not structurally owned by the Order.

---

# 7. FIELD CLASSIFICATION

Every field must be classified.

## 7.1 User input

Examples:
- contact data
- participant data
- selected program/package
- delivery mode
- location
- schedule
- payment proof
- H&S responses
- assessment observations

## 7.2 System generated

Examples:
- leadId
- clientId
- orderId
- invoiceId
- paymentId
- receiptId
- agreementId
- assignmentId
- sessionId
- attendanceId
- createdAt
- updatedAt

## 7.3 Calculated / derived

Examples:
- subtotal
- discount
- tax
- final price
- sessions completed
- sessions remaining
- program progress
- Program Ready

## 7.4 Snapshot fields

Order snapshot may include:
- Program
- Offering
- Package
- Package price
- participant policy
- commercial terms
- applicable Guide/T&C version
- applicable module version
- schedule/location/trainer where applicable

## 7.5 Read-only

Examples:
- generated IDs
- confirmed timestamps
- signed timestamp
- receipt reference
- current progress
- immutable agreement identifiers

## 7.6 System-only

Examples:
- version
- audit log
- createdBy
- updatedBy
- supersededBy
- validation result
- exception log
- source version

---

# 8. ORDER DATA CONTRACT

Minimum conceptual structure:

```text
Order
├── id
├── leadId
├── programId
├── offeringId
├── packageId
├── status
├── commercialSnapshot
├── participantData
├── schedule
├── location
├── createdAt
├── updatedAt
└── audit metadata
```

Order is the commercial source of truth.

---

# 9. PARTICIPANT DATA CONTRACT

```text
participantData: {
  format: "SOLO" | "COUPLE" | "GROUP",

  initialKlienIds: [],

  currentKlienIds: [],

  participantPolicySnapshot: {
    minParticipants,
    maxParticipants,
    allowAddition,
    allowReplacement,
    allowWithdrawal,
    allowChangeAfterStart,
    requireScreeningForNewParticipant,
    requireHSAcknowledgementForNewParticipant
  },

  participantChangeHistory: []
}
```

## 9.1 Participant events

```text
PARTICIPANT_ADDED
PARTICIPANT_REPLACED
PARTICIPANT_WITHDRAWN
```

Each event retains participant ID, effective date, reason, actor, timestamp, and H&S/screening status where applicable.

Participant changes must not rewrite historical commercial facts.

---

# 10. LEAD / CLIENT RULE

Lead is a prospect record.

Client is the customer/participant identity used in operational context.

Payer/Registrant may differ from participant.

Do not create a separate payer/contributor database solely for participant cost-sharing.

Internal participant cost-sharing is outside EFM transaction records.

---

# 11. PROGRAM / OFFERING / PACKAGE

**Program:** service/program identity.

**Offering:** delivery configuration.

Examples may include SOLO, COUPLE, GROUP, HOME VISIT, or other approved configurations.

**Package:** commercial/session structure.

**Package Price:** price applicable to the package/version/context.

Do not hardcode commercial price into UI components.

---

# 12. PRICE & COMMERCIAL SNAPSHOT

At Order creation/confirmation:

```text
Catalog Master
     ↓
Selected Package
     ↓
Current Price
     ↓
Commercial Snapshot
     ↓
Order
```

Future Catalog price changes must not mutate an existing Order snapshot.

---

# 13. INVOICE

Baseline:
- one PP Invoice per Order
- Invoice derives from confirmed Order commercial data
- Invoice is not the source of package truth
- Invoice status is independent from Order status

Conceptual fields:

```text
Invoice
├── id
├── orderId
├── leadId
├── total
├── dueDate
├── status
├── issuedAt
└── audit metadata
```

---

# 14. PAYMENT

One Order may have multiple Payment records.

Use cases:
- full payment
- installment
- partial payment
- payment retries

Conceptual fields:

```text
Payment
├── id
├── invoiceId
├── orderId
├── nominal
├── method
├── proofUrl
├── status
├── confirmedBy
├── confirmedAt
└── audit metadata
```

No separate payerId is required solely for internal cost-sharing.

---

# 15. RECEIPT

Receipt represents confirmed payment proof.

```text
Receipt
├── id
├── invoiceId
├── orderId
├── amountReceived
├── paymentReference
├── status
├── issuedAt
└── audit metadata
```

Do not issue a confirmed receipt while payment remains unverified.

---

# 16. AGREEMENT ENGINE

Agreement is a contractual snapshot.

Inputs:
- Confirmed Order
- Lead / commercial party
- Initial participant roster
- Program Module + version
- Template/content/clause versions
- Applicable Guide/T&C version
- Applicable H&S requirement/reference
- Commercial snapshot
- Schedule/location/trainer if applicable

Agreement should retain:
- agreement ID
- order ID
- module version
- rules version
- snapshot
- status
- final PDF
- generated timestamp
- signed timestamp
- approval/e-signature metadata where applicable
- version/superseded relationship

---

# 17. AGREEMENT IMMUTABILITY

Once signed:

```text
SIGNED AGREEMENT
       ↓
IMMUTABLE HISTORICAL SNAPSHOT
```

Changing the current Order must not mutate the signed Agreement.

Material contractual changes require a new Agreement version plus supersedes relationship.

Participant operational changes are recorded in Order history/current roster.

---

# 18. H&S ARCHITECTURE

H&S is a supporting modular document/data record, not a second Agreement.

H&S may be participant-level where applicable.

```text
HS
├── id
├── orderId
├── klienId
├── companion
├── emergency
├── health
├── status
├── version
└── audit metadata
```

H&S verification is not medical clearance.

---

# 19. ASSESSMENT ARCHITECTURE

Assessment is:
- independent
- repeatable
- historical
- not automatically mandatory for every Order
- not structurally limited to PRE/POST

Assessment may occur during Lead/sales, before Order, after Order, during program, or before renewal.

Do not automatically create reassessment merely because a Lead becomes a Client or an Order is created.

---

# 20. PIC MASTER

Principle:

**ONE PIC MASTER — MULTIPLE BUSINESS CONTEXT**

The same PIC entity may later serve PP, B2B Event, and B2B Management.

Each module retains its own capability requirements, assignment rules, commercial context, contract context, and operational logic.

Do not create separate PIC master entities merely because business contexts differ.

---

# 21. ASSIGNMENT ENGINE

```text
Order
 ↓
Required Program / Service
 ↓
Participant Format
 ↓
Delivery
 ↓
PIC Capability
 ↓
Coverage
 ↓
Availability
 ↓
Contract
 ↓
Capacity
 ↓
Assignment
```

Possible failure reasons:

```text
CAPABILITY_MISMATCH
SERVICE_MISMATCH
FORMAT_MISMATCH
DELIVERY_MISMATCH
COVERAGE_MISMATCH
AVAILABILITY_CONFLICT
CONTRACT_INVALID
CAPACITY_FULL
```

Assignment must not rely solely on trainer-name text.

---

# 22. PROGRAM READY

Program Ready is a derived operational state.

```text
PROGRAM READY =
  Order valid
  AND Agreement condition satisfied
  AND required H&S verified
  AND participant requirements satisfied
  AND Assignment active
  AND capacity valid
  AND module-specific gates satisfied
```

Exact gate requirements remain module-specific.

Do not globally hardcode Active Aging-only requirements into PP Core.

---

# 23. SESSION

Session is the scheduled/delivered execution unit.

```text
Session
├── id
├── orderId
├── assignmentId
├── dateTime
├── status
└── audit metadata
```

Session must reference a valid active Assignment.

---

# 24. ATTENDANCE

Attendance belongs to a Session and participant.

```text
Attendance
├── id
├── sessionId
├── klienId
├── status
├── recordedAt
└── audit metadata
```

Attendance uses the current operational roster.

Historical attendance must remain auditable.

---

# 25. STATE ARCHITECTURE

Do not use one giant lifecycle status.

Separate state domains:

```text
Order
Invoice
Payment
Agreement
H&S
Assignment
Program Ready
Session
Attendance
```

Examples:

```text
Agreement:
PENDING → SIGNED

Assignment:
PENDING → ACTIVE → COMPLETED/CANCELLED

Session:
SCHEDULED → DELIVERED/CANCELLED

Attendance:
PENDING → RECORDED
```

Do not infer Agreement Signed merely from Order Active.

Do not infer Program Ready merely from Payment Confirmed.

---

# 26. VALIDATION GATES

Critical gates must be enforced by service/backend logic.

### Order gate
Validate program, offering, package, price, participant format, and package policy.

### Payment gate
Validate invoice, amount/reference, and authorized confirmation actor.

### Agreement gate
Validate confirmed Order, snapshot, module/version, rules/version, and H&S reference where applicable.

### Assignment gate
Validate capability, service, format, delivery, coverage, availability, contract, and capacity.

### Program Ready gate
Validate all applicable prerequisites.

---

# 27. EXCEPTION HANDLING

Never silently bypass a blocked gate.

```text
EXCEPTION
 ↓
REASON
 ↓
ACTOR
 ↓
TIMESTAMP
 ↓
APPROVAL (if required)
 ↓
AUDIT LOG
```

Exception must not mutate the original rule.

---

# 28. RENEWAL

Renewal creates a new Order.

```text
OLD ORDER
   ↓
HISTORICAL

NEW ORDER
   ↓
NEW COMMERCIAL SNAPSHOT
   ↓
NEW AGREEMENT
```

Do not overwrite old Order or signed Agreement.

Assessment may be performed for renewal when business/program rules require it; renewal alone does not automatically force reassessment.

---

# 29. COMPLETION

Completion must not rely only on a legacy UI field.

Target:

```text
ALL REQUIRED SESSIONS DELIVERED
        ↓
COMPLETION ELIGIBILITY
        ↓
ORDER / PROGRAM COMPLETED
```

Additional completion requirements may be module-specific.

---

# 30. API / SERVICE ARCHITECTURE

Recommended service boundaries:

```text
LeadService
ClientService

ProgramService
OfferingService
PackageService
PricingService

OrderService
InvoiceService
PaymentService
ReceiptService

AgreementService
HSService
AssessmentService

PICService
AssignmentService
ProgramReadyService

SessionService
AttendanceService

AuditService
```

Framework choice may differ, but service responsibilities must remain separated.

---

# 31. API RULE

UI must not directly mutate business-critical state without service validation.

Example:

```text
POST /orders
```

must conceptually execute:

```text
validateProgram()
validateOffering()
validatePackage()
validatePrice()
validateParticipant()
createOrder()
createCommercialSnapshot()
writeAudit()
```

Similarly, creating an active Assignment must execute eligibility checks.

---

# 32. UI → BACKEND OWNERSHIP

| Module | UI Responsibility | Backend Responsibility |
|---|---|---|
| Lead | Input/edit | Validation/persistence |
| Client | Input/edit | Identity/relationship |
| Catalog | Select/display | Source of truth |
| Order | Create/edit | Commercial validation |
| Invoice | View/request | Generate/validate |
| Payment | Submit proof | Confirm/record |
| Receipt | View | Generate |
| Agreement | Review/sign | Snapshot/version/freeze |
| H&S | Fill/submit | Validate requirement |
| Assessment | Record/view | Historical persistence |
| Assignment | Request/view | Eligibility engine |
| Program Ready | Display | Derived state |
| Session | Schedule/update | Assignment validation |
| Attendance | Record | Session/roster validation |

---

# 33. ID ARCHITECTURE

Approved conceptual PP formats:

```text
ORDER       PP-YY-xxxx
INVOICE     INV-PP-YY-xxxx
RECEIPT     RCP-PP-YY-xxxx
AGREEMENT   AGR-PP-YY-xxxx
H&S         HNA-PP-YY-xxxx
```

Implementation must use one authoritative generator.

Do not retain multiple competing legacy formats as active generation rules.

Legacy IDs remain historical references unless a migration decision is separately approved.

---

# 34. SNAPSHOT / VERSIONING

Snapshot required for:
- commercial Order state
- Agreement
- applicable program module version
- rules version
- Guide/T&C version
- clause/content version

When source content changes:

```text
OLD VERSION
   ↓
RETAINED

NEW VERSION
   ↓
USED FOR NEW TRANSACTIONS
```

Do not mutate historical signed records.

---

# 35. AUDIT TRAIL

Audit material events:

```text
ORDER_CREATED
ORDER_UPDATED
PARTICIPANT_ADDED
PARTICIPANT_REPLACED
PARTICIPANT_WITHDRAWN

INVOICE_CREATED
PAYMENT_SUBMITTED
PAYMENT_CONFIRMED
RECEIPT_ISSUED

AGREEMENT_GENERATED
AGREEMENT_SIGNED
AGREEMENT_SUPERSEDED

HS_SUBMITTED
HS_VERIFIED

ASSIGNMENT_CREATED
ASSIGNMENT_CHANGED
ASSIGNMENT_CANCELLED

SESSION_SCHEDULED
SESSION_DELIVERED
SESSION_CANCELLED

ATTENDANCE_RECORDED

EXCEPTION_CREATED
EXCEPTION_APPROVED
```

Material events should retain actor and timestamp, plus reason where applicable.

---

# 36. ACTIVE AGING MODULE BOUNDARY

Active Aging is a Program Module.

It may add:
- screening requirements
- health disclosure
- companion information
- emergency information
- medical referral rules
- package validity
- reassessment
- specific operational rules
- agreement module
- H&S requirements

These must not automatically become global PP Core gates.

---

# 37. B2B BOUNDARY

Do not implement B2B by copying PP transaction flow.

Shared:
- EFM Core infrastructure
- PIC Master
- common identity concepts
- common payment infrastructure where appropriate
- common agreement/document architecture where appropriate

Different:
- business flow
- Order fields
- agreement type
- pricing
- delivery
- operational cycle
- reporting

PP is reference architecture, not a mandatory template for B2B.

---

# 38. LEGACY TREATMENT

Legacy systems are historical/reference inputs.

Do not delete, rename, migrate, or overwrite legacy assets as part of this specification.

Legacy implementation may be used as evidence for current fields, current UI behavior, historical data, and integration requirements.

When legacy conflicts with locked business logic, the locked business logic wins.

---

# 39. DEPRECATED PATTERNS

Do not reproduce:

```text
❌ UI-only business validation
❌ hardcoded package prices
❌ trainer name as primary assignment relationship
❌ one giant lifecycle status
❌ mutable signed Agreement
❌ PRE/POST as Assessment database structure
❌ Active Aging rules as universal PP gates
❌ hidden business logic inside display components
❌ competing ID generators
❌ WhatsApp as transaction system of record
```

---

# 40. CLAUDE CODE — MAY BUILD

Claude Code may implement:
- PP database schema
- migrations
- ID generators
- audit infrastructure
- repositories
- service layer
- API routes
- validation
- state logic
- Program Catalog
- Order
- Participant roster
- Invoice
- Payment
- Receipt
- Agreement
- H&S
- Assessment
- PIC reference
- Assignment
- Program Ready
- Session
- Attendance
- audit/history
- snapshot/versioning
- tests
- UI/API integration

provided implementation follows this specification and the locked business logic.

---

# 41. CLAUDE CODE — MUST NOT CHANGE

Claude Code must not independently change:
1. PP business model.
2. PP lifecycle.
3. Participant model.
4. Agreement boundary.
5. H&S boundary.
6. Assessment independence.
7. Assignment concept.
8. Program Ready concept.
9. Snapshot/immutability rules.
10. ID architecture.
11. Active Aging module boundary.
12. shared PIC master principle.
13. source-of-truth hierarchy.

If implementation appears to require a change, stop at the architectural conflict and report it instead of silently changing the rule.

---

# 42. OWNER DECISION / OPEN ITEMS

Do not fabricate answers for unresolved items.

Known categories requiring separate owner/legal/operational confirmation include:
- exact legal wording for unresolved Agreement clauses
- actual current status of legacy FRONTEND production usage
- dual trainer registry/rate interpretation
- final couple/group pricing policy where not locked
- Active Aging companion/signing authority details where still open
- Phase 1 e-signature level
- final business gate implementation approach where owner choice remains

These must remain explicitly pending until decided.

---

# 43. IMPLEMENTATION PHASES

## Phase 1 — Foundation
- database schema
- ID generators
- audit infrastructure
- base entities
- repositories

## Phase 2 — Commercial Core
- Program
- Offering
- Package
- Pricing
- Order
- Invoice
- Payment
- Receipt

## Phase 3 — Contract & Safety
- Agreement
- H&S
- snapshot/versioning
- signature metadata

## Phase 4 — Participant & Assessment
- participant roster
- change history
- Assessment
- screening references

## Phase 5 — Operations
- PIC
- Assignment
- Program Ready
- Session
- Attendance

## Phase 6 — UI/API Integration
- API routes
- forms
- dashboards
- validation feedback
- document generation

## Phase 7 — Testing
- unit tests
- service tests
- API tests
- integration tests
- end-to-end scenarios
- exception tests

Do not jump directly to an uncontrolled full-system rewrite.

---

# 44. ACCEPTANCE TESTS

Minimum scenarios:

### Solo
Create Order → payment → Agreement → H&S if applicable → Assignment → Program Ready → Session → Attendance → completion.

### Couple
One Order → two Participants → individual H&S/screening where required → shared execution → different adaptation → participant change history.

### Group
One Order → N Participants → additions → replacement → withdrawal → current roster → historical attendance.

### Payment
Partial payment → multiple payments → confirmation → receipt.

### Agreement
Generate snapshot → sign → mutate current Order → verify signed Agreement unchanged → material change creates new version.

### Assignment
Capability failure → coverage failure → availability conflict → contract invalid → capacity full.

### Renewal
New Order → preserve old Order → preserve old Agreement → new Agreement.

### Active Aging
Module-specific screening → H&S → companion/emergency data where applicable → module-specific gate → verify no Active Aging-only gate leaks into generic PP.

---

# 45. IMPLEMENTATION STOP CONDITIONS

Claude Code must stop and report when:
- a locked rule conflicts with current code
- required field semantics are ambiguous
- two authoritative sources conflict
- an owner decision is required
- migration could alter historical data
- a signed Agreement could be mutated
- a new global gate is being proposed
- a B2B rule is being introduced into PP Core
- an ID format conflict cannot be resolved from locked architecture

Do not resolve these by guessing.

---

# 46. DEFINITION OF DONE

PP technical implementation is architecturally compliant only when:
- schema matches data contract
- IDs are generated consistently
- business-critical validation occurs server/service side
- commercial snapshots are preserved
- signed Agreements are immutable
- participant history is preserved
- Assignment eligibility is enforced
- Program Ready is derived correctly
- Session requires valid Assignment
- Attendance references valid Session + participant
- audit events are recorded
- Active Aging rules remain module-scoped
- legacy behavior is not silently treated as business truth
- acceptance tests pass
- unresolved owner decisions remain explicitly unresolved

---

# 47. FINAL BUILD AUTHORITY

```text
EFM CORE GOVERNANCE
        ↓
EFM MASTER AGREEMENT ARCHITECTURE
        ↓
PROGRAM MODULE SYSTEM
        ↓
EFM PP BUSINESS LOGIC MASTER
        ↓
PP CORE LOCK
        ↓
PP BACKEND DATA CONTRACT
        ↓
THIS TECHNICAL BUILD SPECIFICATION
        ↓
CLAUDE CODE IMPLEMENTATION
```

This document translates the locked architecture. It does not replace the Business Logic Master, Agreement Architecture, or Program Module documentation system.

---

# 48. VERSION CONTROL

**Document:** `EFM_PP_TECHNICAL_BUILD_SPECIFICATION_v1.0.md`  
**Status:** BUILD BASELINE

Any material change requires:
- version increment
- change description
- source/decision reference
- affected modules
- reconciliation with PP Core Lock

No silent changes.

---

## END OF SPECIFICATION
