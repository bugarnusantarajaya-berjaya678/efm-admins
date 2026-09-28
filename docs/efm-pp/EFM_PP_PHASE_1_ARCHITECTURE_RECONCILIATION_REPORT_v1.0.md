# EFM PP — PHASE 1 ARCHITECTURE RECONCILIATION REPORT v1.0

**Date:** 2026-09-28  
**Branch:** `claude/add-claude-md-instructions-7iqjvo`  
**Status:** ANALYSIS ONLY — NO CODE MODIFIED  
**Analyst:** Claude Code (automated inspection)  
**Prerequisite:** EFM PP Phase 0 Repository Discovery Report (committed `aaf790f`)

---

## 1. EXECUTIVE SUMMARY

This report reconciles the **intended PP backend architecture** (11 authoritative technical documents, Batches 1–2) against the **actual repository state** (React 19 SPA with in-memory dummy data, single Google Apps Script backend stub) as of commit `4e50de7`.

### Overall Verdict

**PHASE 1 FOUNDATION: NOT READY TO BEGIN CODING**

There are **4 CRITICAL blockers** and **6 HIGH-priority gaps** that must be resolved — by decision or by implementation — before Phase 1 Foundation coding can safely proceed. The largest structural gap is the near-total absence of any server-side infrastructure: the intended architecture calls for a proper backend (service layer, database, migration mechanism, validation framework, request tracking) while the current codebase is a React SPA backed only by browser memory with a single uncommitted GAS stub.

### Classification Summary

| Classification | Count |
|---|---|
| A — MATCH (intended = actual) | 14 |
| B — PARTIAL MATCH (intent partially satisfied) | 11 |
| C — GAP (required but absent) | 21 |
| D — CONFLICT (actual contradicts intent) | 8 |
| E — UNKNOWN (evidence insufficient) | 3 |
| **TOTAL** | **57** |

### Severity Summary

| Severity | Count |
|---|---|
| CRITICAL | 4 |
| HIGH | 16 |
| MEDIUM | 23 |
| LOW | 14 |

---

## 2. CURRENT REPOSITORY BASELINE

| Item | Current State |
|---|---|
| **Framework** | React 19.2.6 + Vite 8.0.12 + Tailwind CSS 3.4.19 |
| **Router** | React Router DOM 7.18.0 |
| **State management** | React `useState` + in-memory JS module stores |
| **Backend** | Single GAS file (`program-db.gs`) — undeployed, SS_ID placeholder |
| **Database** | None active. GAS stub references 5 initialised sheets; 10 transactional sheets absent |
| **Migration** | None |
| **Test framework** | None installed |
| **Environment config** | None — no `.env`, no config validation |
| **ID generation** | Per-store `getNextXxxId()` helpers scattered across 8+ store files |
| **Validation** | Inline JS conditionals per form; no shared framework |
| **Error handling** | No global boundary; no standardised error categories |
| **Auth** | Login UI with hardcoded credentials in source; localStorage role; no route guard |
| **Audit / logging** | UI-only activity-log arrays per Order/Lead detail page; no persistence |
| **Request/correlation IDs** | Absent |
| **Deployment** | Vercel (SPA config in `REACT-APP/vercel.json`) |
| **CLAUDE.md accuracy** | Incorrect — states React 18 / RR v6 |

**Phase 0 corrections confirmed in this session:**
- `vercel.json` EXISTS (Phase 0 said absent)
- `ppAbsensiData.js` EXISTS (Phase 0 said PP attendance files absent)
- `LoginPage.jsx` EXISTS (Phase 0 said auth entirely absent)

---

## 3. INTENDED PP ARCHITECTURE BASELINE

Source: the 9-level hierarchy defined in `01_EFM_PP_FINAL_BACKEND_PRE_CODING_LOCK_v1.0.md`.

| Level | Source |
|---|---|
| 1 | Locked Governance |
| 2 | Master Agreement Architecture |
| 3 | Program Module Documentation |
| 4 | PP Business Logic Master |
| 5 | PP Core Lock |
| 6 | PP Backend Data Contract |
| 7 | Technical Build Specification |
| 8 | Batch 1 Technical Documents |
| 9 | Existing Code / Legacy Behavior |

**Phase 1 Foundation scope** (`02_EFM_PP_PHASE_1_FOUNDATION_CODING_SPECIFICATION_v1.0.md`):

- Application foundation (config, env, module structure, error handling, request IDs, logging)
- Database foundation (connection, migration, base migration, timestamps, transactions)
- ID foundation (one authoritative generator for Order, Invoice, Receipt, Agreement, H&S, Assessment, Assignment, Session, Attendance)
- Audit foundation (id, eventType, entityType, entityId, actorId, timestamp, metadata, requestId)
- Validation foundation (VALIDATION_ERROR, NOT_FOUND, CONFLICT, UNAUTHORIZED, FORBIDDEN, INTERNAL_ERROR, BUSINESS_RULE_VIOLATION)
- Service architecture: `route/controller → service → repository/data access → database`

**Explicitly out of Phase 1:** Order workflow, Payment workflow, Agreement signing, Assignment eligibility, Program Ready calculation, Session workflow, Attendance workflow, Active Aging screening, B2B workflows.

---

## 4. RECONCILIATION MATRIX

| ID | Domain | Intended | Current | Class | Severity | Evidence | Impact |
|---|---|---|---|---|---|---|---|
| R-01 | Framework | Node.js backend or compatible server runtime | React SPA, no server runtime | C | CRITICAL | No `package.json` server dependencies; `program-db.gs` is GAS, not Node | Phase 1 Foundation cannot run without a server environment |
| R-02 | Database | Relational DB (PostgreSQL or compatible) with migration mechanism | None. GAS SpreadsheetApp stub, 10 sheets missing | C | CRITICAL | `program-db.gs` SS_ID placeholder; 0 migrations | All database-dependent Phase 1 tasks blocked |
| R-03 | Test framework | Jest or compatible; existing suite must pass before Phase 1 | None installed | C | CRITICAL | No test file, no jest config, no test script in `package.json` | H-checklist item "existing suite passes" cannot be met |
| R-04 | Env config | `.env` with validated env vars; missing required config fails explicitly | None | C | CRITICAL | No `.env`, no `.env.example`, no config validation module | Phase 1 config baseline unimplementable |
| R-05 | ID generation | ONE authoritative generator service for all document types | Per-store helpers: `getNextOrderId()`, `getNextInvoiceId()`, etc. in 8+ files | D | HIGH | `ppOrdersStore.js`, `ppInvoiceStore.js`, `ppReceiptStore.js`, `ppDocumentsStore.js` all have independent generators | Violates single-source requirement; uniqueness guarantee impossible without shared state |
| R-06 | Audit | Append-only audit events with actor, timestamp, entityId, requestId, persist | UI-only `logList` arrays in Order/Lead detail components; no persistence | C | HIGH | `PPOrderDetailPage.jsx` logList state; no `ppAuditStore.js` or server endpoint | Audit checklist items E-a through E-f all fail |
| R-07 | Validation | Shared error-category framework: 7 standard categories | Inline form conditionals per component; no shared module | C | HIGH | No `errors.js`, no `ValidationError` class, no error middleware | Validation checklist F-a through F-g all fail |
| R-08 | Service layer | route/controller → service → repository pattern | Direct store manipulation in page components | C | HIGH | Pages call `ppOrdersStore.addOrder()` directly; no service objects | Architecture checklist G-a fails; business logic leaks into UI |
| R-09 | Auth: route guard | Routes must reject unauthenticated access | AppShell has no auth check; all routes accessible without login | D | HIGH | `AppShell.jsx` — no `useEffect` redirect, no `PrivateRoute` wrapper | SECURITY: any user can access any route by URL |
| R-10 | Auth: credentials | Credentials must not be hardcoded in source | Real email addresses hardcoded as valid usernames; any password accepted | D | HIGH | `LoginPage.jsx` lines 18–28: `bugarnusantarajaya@gmail.com` hardcoded | SECURITY: credential bypass by entering any password |
| R-11 | Request/correlation ID | Every request carries traceable correlation ID through audit and logs | Absent | C | HIGH | No `uuid` or nanoid import; no middleware; no request context | Phase 1 acceptance item 8 (request/correlation ID traceable) fails |
| R-12 | PP Order IDs | `PP-YY-xxxx` format | `PP-YY-xxxx` format in use | A | — | `ppOrdersData.js`: `PP-26-0001` through `PP-27-0004` | ✓ |
| R-13 | Invoice IDs | `INV-PP-YY-xxxx` format | `INV-PP-YY-xxxx` format in use | A | — | `ppInvoiceData.js`: `INV-PP-26-0001` through `INV-PP-27-0004` | ✓ |
| R-14 | Receipt IDs | `RCP-PP-YY-xxxx` format | `RCP-PP-YY-xxxx` format in use | A | — | `ppReceiptData.js`: `RCP-PP-26-0001` etc. | ✓ |
| R-15 | Agreement IDs | `AGR-PP-YY-xxxx` format | `AGR-PP-YY-xxxx` format in use | A | — | `ppDocumentsData.js`: `AGR-PP-26-0001` etc. | ✓ |
| R-16 | H&S IDs | `HNA-PP-YY-xxxx` format | No dedicated H&S entity exists | C | MEDIUM | H&S appears as Agreement clause only | H&S as separate entity with own ID sequence not implementable without entity creation |
| R-17 | Session IDs | Dedicated Session entity with own ID sequence | No Session entity. Attendance records use `JS-xxxx-n` pattern | B | MEDIUM | `ppAbsensiData.js` has `jadwalId: 'JS-0001-1'` but no Session store | Session scheduling cannot be added without new entity |
| R-18 | Assessment IDs | `SCR-YY-xxxx` format; linked to Lead, Klien, Order | `SCR-26-xxxx` format used; linked to Lead/Klien but NOT Order | B | HIGH | `ppAssessmentsStore.getAssessmentByOrderId()` always returns null (`a.orderId` undefined) | Assessment↔Order link broken at data layer |
| R-19 | Agreement immutability | Signed Agreements are contractual snapshots; must not be mutated | `updateDoc()` applies any patch without checking `statusTtd` | D | HIGH | `ppDocumentsStore.js`: `export function updateDoc(id, patch) { _store = _store.map(d => d.id === id ? { ...d, ...patch } : d) }` | Signed Agreements can be silently overwritten |
| R-20 | Commercial snapshot | Order must store a frozen commercial snapshot at creation | Current Order is mutable in-memory object; no snapshot mechanism | C | HIGH | `ppOrdersStore.updateOrder()` applies unrestricted patches | Order mutation after Agreement signing contradicts lock |
| R-21 | Program Catalog hierarchy | Program → Offering → Package → Package Price | Flat program records in `ppProgramDBData.js`; no Offering/Package/Price hierarchy | C | MEDIUM | `ppProgramStore.js` CRUD over flat records | Catalog Gates 01 cannot validate Package/Price selection |
| R-22 | PIC single master | ONE PIC master across all business contexts | Two PIC registries: `EFM-PIC-xxx` (cost rates) in `ppProgramDBData` and `PIC-xxx` (charge rates) in `opsData` | D | HIGH | `ppProgramDBData.js` `picId: 'EFM-PIC-001'`; `opsData.js` `id: 'PIC-001'`; no join key | Violates single-master principle; coach cost and charge data siloed |
| R-23 | PIC PKS expiry | `status: 'aktif'` must reflect valid PKS | Elena Rodriguez `tglHabisPks: '2024-06-01'` (2 years ago) but `status: 'aktif'` | D | MEDIUM | `opsData.js` PIC record | Coach with expired PKS would be treated as active |
| R-24 | H&S as separate entity | H&S is a distinct entity, separate from Agreement | H&S exists only as a clause/section inside Agreement documents | C | MEDIUM | `ppDocumentsData.js` — H&S referenced in Agreement sections, not as separate records | Gate 06 (H&S required) cannot be implemented without separate entity |
| R-25 | Participant roster | Participant is separate from payer/registrant | No dedicated Participant store; participant data embedded in Order | C | MEDIUM | `ppOrdersData.js`: participant embedded as `namaPeserta`, no separate entity | Participant history, change audit impossible |
| R-26 | Assignment entity | Assignment is a separate operational relationship | No Assignment entity or store | C | MEDIUM | File list scan: no `ppAssignmentData.js` or `ppAssignmentStore.js` | Gate 08 (Assignment) entirely unimplementable |
| R-27 | Program Ready | Derived gate: ORDER_VALID AND AGREEMENT_GATE_PASS AND ... | No Program Ready calculation exists | C | MEDIUM | No `programReadyService.js` or gate evaluation logic | Gate 09 (Program Ready) entirely unimplementable |
| R-28 | API endpoints | ~40 REST endpoints across 7 resource groups | GAS stub has 5 partial sheet initializations; 0 transactional endpoints | C | HIGH | `program-db.gs` has `getKategoriList`, `getTrainerList`, `getProgramByKategori`, `getStudentList`, `addStudent` only | All Phase 2+ operations have no endpoint surface |
| R-29 | Migration | Additive-only, reversible migration mechanism | None | C | HIGH | No migration files, no migration tool | Phase 1 DB Foundation item "migration mechanism" unimplementable |
| R-30 | Quotation ID format | `QUO-PP-YY-xxxx` (dash format) | `QUO/EFM/PP/26/0001` (slash format) in event module | B | LOW | `eventQuotationsData.js` uses slash format | Cross-module inconsistency; PP quotations not yet created |
| R-31 | GAS casing inconsistency | Consistent status field casing | `getProgramByKategori` filters `status === 'aktif'`; `getKategoriList` filters `status === 'Aktif'` | D | MEDIUM | `program-db.gs` lines 34 vs 12 | Data filtered differently depending on which GAS function is called |
| R-32 | CLAUDE.md accuracy | Project docs match actual stack | CLAUDE.md states React 18 / React Router v6; actual is React 19 / RR v7 | D | LOW | `REACT-APP/package.json` vs `CLAUDE.md` | Risk of incorrect AI-generated code targeting wrong APIs |
| R-33 | Lead entity | Lead pipeline with stages | Exists: `ppLeadsData.js`, `ppLeadsStore.js`, pipeline stages | A | — | `ppLeadsData.js` has New/Approach/Screening/Invoicing/Closing/Convert | ✓ |
| R-34 | Client entity | Client separate from Lead | Exists: `ppKlienData.js` | A | — | `ppKlienData.js` with `klienId`, `orderId` | ✓ |
| R-35 | Invoice entity | Invoice separate from Order | Exists: `ppInvoiceData.js`, `ppInvoiceStore.js` | A | — | Invoice has own lifecycle, own IDs | ✓ |
| R-36 | Receipt entity | Receipt separate from Invoice | Exists: `ppReceiptData.js`, `ppReceiptStore.js` | A | — | Receipt has own lifecycle, own IDs | ✓ |
| R-37 | Agreement entity | Agreement as contractual snapshot | Entity exists with signature metadata | B | HIGH | `ppDocumentsData.js`: statusTtd, tglTtd fields exist — but `updateDoc()` has no immutability guard (R-19) | Structural intent partially met; immutability not enforced |
| R-38 | Dual-file store pattern | Not specified; existing pattern | `*Data.js` seed + `*Store.js` in-memory CRUD per entity | E | — | Pattern consistent across all PP modules | Pattern is legacy behavior; must not be deleted per lock |
| R-39 | Active Aging scope | Active Aging rules must remain module-scoped, not global gates | No Active Aging module found | A | — | No global Active Aging logic found anywhere | ✓ Boundary respected by absence |
| R-40 | B2B boundary | B2B logic must not bleed into PP | B2B/Event are structurally separate modules | A | — | Route structure, store files, data files all per-module | ✓ |
| R-41 | Legacy code deletion | Legacy code must not be deleted | No legacy deletion detected in commit history | A | — | `program-db.gs` unchanged | ✓ |
| R-42 | Destructive migration | No destructive migration authorized | No migrations exist; no risk present | A | — | No migration files | ✓ |
| R-43 | Promo/Discount entity | Not specified in Phase 1 | `ppPromoData.js`, `ppPromoStore.js` exist | E | LOW | These are legacy frontend additions | Must not be deleted; Phase 1 must not alter promo logic |
| R-44 | OPS/PIC pages | Not specified in Phase 1 | `OPSPICPage.jsx`, `PICDetail.jsx`, `OPSMitraPage.jsx` exist | E | LOW | Legacy operational UI | Must not be touched in Phase 1 |
| R-45 | Attendance seed | Session/Attendance data foundation | `ppAbsensiData.js` exists as seed fallback | B | MEDIUM | 11 orders × attendance records; no store CRUD, no Session entity | Seed exists but infrastructure layer missing |
| R-46 | PP Program DB | Catalog/Program entity | `ppProgramDBData.js` + `ppProgramStore.js` exist as flat records | B | MEDIUM | Missing Offering/Package/Price hierarchy (R-21) | Foundation exists but wrong shape for spec |
| R-47 | Error boundary | Global error boundary | None | C | MEDIUM | No `ErrorBoundary` component in src | Unhandled errors give blank screen |
| R-48 | Logging | Logging baseline (structured logs) | None | C | MEDIUM | No logger module, no console-structured logging | Phase 1 logging baseline unimplementable |
| R-49 | Timestamp convention | UTC, ISO 8601, consistent across all records | Mixed formats in dummy data: `'2026-06-15'`, `'15 Jun 2026'`, ISO strings | B | LOW | `ppOrdersData.js`, `ppLeadsData.js` mixed date formats | Will need normalization before database write |
| R-50 | Assessment orderId link | Assessment linked to Order | `getAssessmentByOrderId()` searches `a.orderId` which doesn't exist in any record | D | HIGH | `ppAssessmentsStore.js`: confirmed bug | Assessment-to-Order link silently fails |
| R-51 | Password validation | Auth must verify credentials securely | Password field exists in UI but is never checked | D | HIGH | `LoginPage.jsx`: password input renders but not referenced in submit handler | Any password grants access to any valid username |
| R-52 | Vercel deployment | SPA deployment config | `vercel.json` exists with correct Vite + SPA rewrite rules | A | — | `REACT-APP/vercel.json` confirmed | ✓ |
| R-53 | Correlation ID propagation | requestId must be traceable through audit and API calls | Absent at all layers | C | HIGH | No UUID library, no middleware, no request context passing | Phase 1 acceptance item 8 fails |
| R-54 | Transaction strategy | Documented transaction strategy for DB operations | None documented; no DB yet | C | LOW | No transaction wrapper, no rollback logic | Must be documented before Phase 2 |
| R-55 | Renewal creates new Order | Renewal must create a new Order, not mutate existing | Not implemented; no renewal flow | C | LOW | Out of Phase 1 scope | Phase 1 out-of-scope; note for Phase 2 |
| R-56 | Audit append-only | Audit log must be immutable (append-only) | UI logList allows arbitrary state mutation | D | MEDIUM | `setLogList(prev => [...prev])` — replaces full array on re-render | Not truly append-only; array can be replaced |
| R-57 | Security: no secrets in source | Secrets must not be hardcoded | Two real email addresses hardcoded as credentials | D | HIGH | `LoginPage.jsx` lines 18, 22 | Production credential exposure in source code |

---

## 5. DATABASE RECONCILIATION

### Intended (from `04_EFM_PP_DATABASE_SCHEMA_MIGRATION_SPEC_v1.0.md`)

Logical entities required:
- Program, Offering, Package, PackagePrice
- Lead, Client
- Order, CommercialSnapshot
- Invoice, Payment, Receipt
- Agreement (immutable after signing), HealthAndSafety
- Assessment
- PIC (single master)
- Assignment
- Session, Attendance
- AuditLog

Migration rules: never alter production blindly, reversible migrations, preserve legacy IDs.

### Actual

Google Apps Script stub (`program-db.gs`):
- 5 sheets defined but not initialized: KategoriProgram, TrainerList, ProgramList, StudentList, OrderList
- 10 transactional sheets completely absent: Invoice, Payment, Receipt, Agreement, HealthAndSafety, Assessment, Assignment, Session, Attendance, AuditLog
- SS_ID: `'1...'` (placeholder, never replaced)
- Status: **UNDEPLOYED**

### Gap Analysis

| Required Entity | GAS Sheet | Status |
|---|---|---|
| KategoriProgram | Defined | Not initialized |
| TrainerList | Defined | Not initialized |
| ProgramList | Defined | Not initialized |
| StudentList | Defined | Not initialized |
| OrderList | Defined | Not initialized |
| Invoice | — | ABSENT |
| Payment | — | ABSENT |
| Receipt | — | ABSENT |
| Agreement | — | ABSENT |
| HealthAndSafety | — | ABSENT |
| Assessment | — | ABSENT |
| Assignment | — | ABSENT |
| Session | — | ABSENT |
| Attendance | — | ABSENT |
| AuditLog | — | ABSENT |
| PICMaster | — | ABSENT |

**Decision required:** The specification assumes a relational database (PostgreSQL-compatible). The existing implementation uses Google Apps Script / Google Sheets. This is a fundamental technology mismatch that must be resolved at the architecture level before Phase 1 coding can begin.

---

## 6. PP COMMERCIAL CORE RECONCILIATION

| Aspect | Intended | Actual | Status |
|---|---|---|---|
| Order as commercial center | Order is the commercial transaction hub | `ppOrdersData.js` exists with correct ID format | B |
| Commercial snapshot | Frozen at Order creation, immutable | Order data is mutable in-memory object; no snapshot mechanism | C |
| Invoice separate from Order | Invoice is a separate transaction record | `ppInvoiceData.js` + `ppInvoiceStore.js` exist | A |
| Receipt follows confirmed payment | Receipt references confirmed Payment | `ppReceiptData.js` references Invoice, not Payment (no Payment entity) | B |
| Payment entity | Payment is a separate transaction record | No `ppPaymentData.js` or `ppPaymentStore.js` | C |
| Renewal creates new Order | Renewal = new Order, not mutation | No renewal mechanism | C |
| Promo/discount | Discount applies at Order level | `ppPromoData.js` + `ppPromoStore.js` exist; Gate 02 discount validation absent | B |

---

## 7. AGREEMENT / H&S RECONCILIATION

| Aspect | Intended | Actual | Status |
|---|---|---|---|
| Agreement as contractual snapshot | Immutable after signing | Entity exists; no immutability guard in `updateDoc()` | D |
| Agreement stores module/rules version | Version snapshot at signing | `versiModul` field present in `ppDocumentsData` records | A |
| H&S separate from Agreement | H&S is an independent entity | H&S exists only as Agreement sections | C |
| H&S not medical clearance | H&S ≠ medical clearance (per lock) | No H&S logic implemented to violate | A |
| Signature metadata | Recorded on signing | `statusTtd`, `tglTtd`, `ttdOleh` fields exist | A |
| Agreement read-only after signing | `updateDoc()` must check `statusTtd` | No check in `updateDoc()` | D |

**Critical finding:** The combination of "Agreement is a contractual snapshot" (architectural lock) and `updateDoc()` having no immutability guard (D conflict) means that a signed Agreement can be retroactively altered. This violates the Master Agreement Architecture at the highest source hierarchy level.

---

## 8. PARTICIPANT / ASSESSMENT RECONCILIATION

| Aspect | Intended | Actual | Status |
|---|---|---|---|
| Participant separate from payer | Participant is an independent entity | Participant data embedded in Order (`namaPeserta`, `jenisProgram`) | C |
| Participant history | Auditable change history | No participant store; no change tracking | C |
| Assessment independent | Assessment is an independent historical record | `ppAssessmentsData.js` + `ppAssessmentsStore.js` exist | B |
| Assessment linked to Lead | Assessment references Lead | `leadId` field present in assessment records | A |
| Assessment linked to Order | Assessment references Order | `orderId` field ABSENT in records; `getAssessmentByOrderId()` always null | D |
| Assessment append-only | Assessments are historical records | `updateAssessment()` exists in store — allows mutation | C |
| Assessment ID format | `SCR-YY-xxxx` | `SCR-26-0001` format confirmed | A |

---

## 9. PIC / COACH RECONCILIATION

| Aspect | Intended | Actual | Status |
|---|---|---|---|
| ONE PIC master | Single PIC registry across all business contexts | Two PIC registries: `EFM-PIC-xxx` (cost rates in ppProgramDBData) and `PIC-xxx` (charge rates in opsData) | D |
| PIC shared across B2B contexts | PIC master is module-agnostic | OPS PIC data has `b2b` type entries; PP program data has separate EFM-PIC entries | D |
| PKS expiry reflects current status | Active PKS = `status: 'aktif'` | Elena Rodriguez `tglHabisPks: '2024-06-01'` (expired 2 years ago) but `status: 'aktif'` | D |
| Cost vs charge separation | Not explicitly specified | Cost rates in `ppProgramDBData` (`biayaPelatih`), charge rates in `opsData` (`tarif`) — no join key | E |
| EFM-PIC vs PIC ID linkage | Single ID scheme | No join key between `EFM-PIC-001` and `PIC-001` | D |

**Decision required:** The two PIC registries serve different purposes (cost tracking vs charge/scheduling) but represent the same physical coaches. A join strategy or migration to a single master must be decided before Phase 1 adds PIC infrastructure.

---

## 10. ASSIGNMENT / PROGRAM READY RECONCILIATION

| Aspect | Intended | Actual | Status |
|---|---|---|---|
| Assignment as separate entity | Assignment is operational relationship: PIC ↔ Order/Participant | No Assignment entity, no `ppAssignmentData.js` | C |
| Assignment ID format | Not yet specified for Phase 1 | N/A | C |
| Assignment 8 failure codes | CAPABILITY_MISMATCH, SERVICE_MISMATCH, etc. | None implemented | C |
| Program Ready as derived gate | ORDER_VALID AND AGREEMENT_GATE_PASS AND ... | No Program Ready calculation | C |
| Gate 08–09 validation | Assignment eligibility engine | Absent | C |

**Note:** Assignment and Program Ready are explicitly **out of Phase 1 scope**. These gaps are expected at this stage and do not block Phase 1 Foundation. Recorded for Phase 2 planning.

---

## 11. SESSION / ATTENDANCE RECONCILIATION

| Aspect | Intended | Actual | Status |
|---|---|---|---|
| Session as independent entity | Session references Assignment | No Session entity | C |
| Session scheduling | Session has scheduled time/location | `ppAbsensiData.js` has `tanggal`, `jam`, `lokasi` per attendance record — but no Session entity | B |
| Attendance references Session + Participant | Attendance is an independent record | `ppAbsensiData.js` records keyed by Order ID with attendance facts | B |
| Attendance store CRUD | Full CRUD on Attendance | No `ppAttendanceStore.js`; `ppAbsensiData.js` is seed-only | C |
| Session/Attendance IDs | Dedicated ID sequences | `JS-xxxx-n` pattern in attendance seed; no formal ID generator | B |

**Note:** Session and Attendance workflows are **out of Phase 1 scope**. The `ppAbsensiData.js` seed file must not be deleted (legacy code constraint). Attendance CRUD store and Session entity are Phase 2 items.

---

## 12. API RECONCILIATION

### Intended API Surface (`05_EFM_PP_API_ENDPOINT_SPECIFICATION_v1.0.md`)

~40 endpoints across 7 resource groups:
- **Catalog**: GET /programs, GET /programs/:id, GET /programs/:id/packages, GET /packages/:id/prices
- **Lead/Client**: POST /leads, GET /leads, GET /leads/:id, PUT /leads/:id, POST /clients
- **Order**: POST /orders, GET /orders/:id, PUT /orders/:id, GET /orders/:id/status
- **Billing**: POST /invoices, GET /invoices/:id, POST /payments, POST /receipts, GET /receipts/:id
- **Agreement/H&S**: POST /agreements, GET /agreements/:id, POST /agreements/:id/sign, POST /hns
- **Assessment**: POST /assessments, GET /assessments/:id, GET /assessments?leadId=
- **Operations**: POST /assignments, GET /sessions, POST /sessions/:id/attendance

### Actual API Surface

GAS stub functions (never deployed):
- `getKategoriList()` — returns kategori from sheet
- `getTrainerList()` — returns trainers
- `getProgramByKategori(kategori)` — filters programs (casing bug: `'aktif'` lowercase)
- `getStudentList()` — returns students
- `addStudent(data)` — inserts to StudentList sheet

**Gap:** 0 of ~40 required endpoints exist. No server runtime to host them.

---

## 13. AUTHENTICATION / AUTHORIZATION RECONCILIATION

| Aspect | Intended | Actual | Status |
|---|---|---|---|
| Authentication required | Authenticated access to all protected routes | LoginPage exists | B |
| Credential security | Credentials not hardcoded | Two real email addresses hardcoded in source | D |
| Password verification | Password must be checked | Password field renders but is never validated in submit handler | D |
| Route guard | Unauthenticated users redirected to login | AppShell has no auth check; all routes accessible by direct URL | D |
| Role-based access | owner vs admin roles | `localStorage.setItem('efm_role', ...)` sets role; no route enforces it | B |
| Session management | Secure session token | localStorage string — no expiry, no token, no CSRF protection | C |

**Security impact:** The combination of hardcoded credentials + no password check + no route guard means the application's authentication provides no actual security boundary in its current form.

---

## 14. VALIDATION / ERROR HANDLING RECONCILIATION

| Aspect | Intended | Actual | Status |
|---|---|---|---|
| VALIDATION_ERROR category | Standard error type | Absent as shared module | C |
| NOT_FOUND category | Standard error type | Absent | C |
| CONFLICT category | Standard error type | Absent | C |
| UNAUTHORIZED category | Standard error type | Absent | C |
| FORBIDDEN category | Standard error type | Absent | C |
| INTERNAL_ERROR category | Standard error type | Absent | C |
| BUSINESS_RULE_VIOLATION category | Standard error type | Absent | C |
| Shared validation module | Validation logic reusable | Per-form inline conditionals | C |
| Global error boundary | Catches unhandled errors | None | C |
| Error response format | Standardised JSON error shape | No API server to format errors | C |

All 7 validation categories and all validation infrastructure items are absent. Phase 1 Foundation must implement all of these from scratch.

---

## 15. AUDIT / LOGGING RECONCILIATION

| Aspect | Intended | Actual | Status |
|---|---|---|---|
| Audit event: id | Required field | Absent | C |
| Audit event: eventType | Required field | In UI log: `action` string (free text) | B |
| Audit event: entityType | Required field | In UI log: inferred from context but not typed | B |
| Audit event: entityId | Required field | In UI log: not a separate field | C |
| Audit event: actorId | Required field | In UI log: `actor` string (name only, not ID) | B |
| Audit event: timestamp | Required field | In UI log: `timestamp` ISO string | A |
| Audit event: metadata | Required field | Absent | C |
| Audit event: requestId | Required field | Absent (no request ID infrastructure) | C |
| Audit persistence | Append-only durable store | UI-only React state; resets on page reload | C |
| Append-only guarantee | Events must not be deletable | `setLogList` replaces full array — events can disappear on re-render | D |
| Structured logging | Baseline logging module | None | C |

---

## 16. TESTING RECONCILIATION

| Aspect | Intended | Actual | Status |
|---|---|---|---|
| Test framework installed | Jest or compatible | Not in `package.json` | C |
| Existing suite passes | Must run before Phase 1 | No test files exist | C |
| Foundation tests | Must verify Phase 1 items | Cannot write until framework installed | C |
| Migration test | Verifies DB migration | No DB, no migration | C |
| ID uniqueness test | Verifies ID generator | No generator module to test | C |
| Audit event test | Creates and verifies audit event | No audit module to test | C |
| Validation/error test | Verifies all 7 categories | No validation module to test | C |
| Startup/config test | App starts cleanly with env | No env config module | C |

All 7 test checklist items (H-a through H-g) are in BLOCKED state awaiting foundation implementation.

---

## 17. LEGACY CODE RECONCILIATION

| Legacy Item | Present | Protected | Notes |
|---|---|---|---|
| `program-db.gs` | Yes | Must not be deleted | Only existing backend artifact |
| `ppAbsensiData.js` | Yes | Must not be deleted | Phase 0 missed this; attendance seed |
| `ppPromoData.js` / `ppPromoStore.js` | Yes | Must not be deleted | Promo/discount legacy frontend |
| `ppJenisProgramStore.js` | Yes | Must not be deleted | Program type registry |
| `attendanceData.js` | Yes | Must not be deleted | Generic attendance seed |
| `OPSPICPage.jsx`, `PICDetail.jsx` | Yes | Must not be touched in Phase 1 | Operational legacy UI |
| `OPSMitraPage.jsx` | Yes | Must not be touched in Phase 1 | Mitra/partner legacy UI |
| `ContractPage.jsx` | Yes | Must not be touched in Phase 1 | Contract legacy UI |
| `PaymentPage.jsx` | Yes | Must not be touched in Phase 1 | Payment legacy UI |

No legacy code deletion detected in commit history. Phase 1 implementation must add alongside existing code, not replace.

---

## 18. PP vs B2B BOUNDARY RECONCILIATION

| Boundary | Intended | Actual | Status |
|---|---|---|---|
| PP logic scoped to PP | PP business rules must not leak to B2B | PP stores/pages use `pp*` prefix; no shared business logic | A |
| B2B logic scoped to B2B | B2B logic must not bleed into PP | B2B stores/pages use `b2b*` prefix; separate route trees | A |
| Active Aging module-scoped | Active Aging rules must not become global gates | No Active Aging logic found in PP or B2B modules | A |
| PIC shared | PIC master is cross-module | Two PIC registries (PP-focused `EFM-PIC-xxx` and OPS `PIC-xxx`) — boundary not clean | D |
| B2B Event separate from B2B Management | CLAUDE.md clarifies these are different modules | Route structure: `/event/*` and `/b2b/*` are separate; code correctly separated | A |
| No B2B transaction logic in PP | PP must not implement B2B business flows | Not implemented | A |

---

## 19. CRITICAL BLOCKERS

These items **must be resolved** (by decision or implementation) before Phase 1 Foundation coding can begin. Proceeding without resolving these will either produce undeployable code or require destructive rework.

### BLOCKER-1: Database Technology Decision

**Why critical:** The spec assumes a relational database with a proper migration mechanism (PostgreSQL-compatible per `04_EFM_PP_DATABASE_SCHEMA_MIGRATION_SPEC_v1.0.md`). The existing implementation uses Google Sheets via GAS with no migration tool. Phase 1 Foundation requires: "database connection, migration mechanism, base migration, timestamp conventions, transaction handling." None of these are implementable in the current GAS-only approach.

**Decision required:** Choose backend technology:
- Option A: Full backend stack (Node.js + PostgreSQL or similar) as the spec intends
- Option B: Remain on GAS/Google Sheets and reinterpret "database foundation" as Sheets initialization + Apps Script patterns (functional compromise)
- Option C: Hybrid (React SPA stays; add a lightweight Node.js API layer for PP)

**Owner decision required.** Implementation cannot proceed until this is decided.

---

### BLOCKER-2: No Test Framework

**Why critical:** `03_EFM_PP_CLAUDE_CODE_PHASE_1_EXECUTION_INSTRUCTION_v1.0.md` Step 4 requires: "Run existing tests first where available, then Phase 1 tests." The QA checklist `04_EFM_PP_PHASE_1_ACCEPTANCE_QA_CHECKLIST_v1.0.md` Section H has 7 test items that must all pass before Phase 1 is READY. No test framework is installed; no test files exist.

**Decision required:** Choose test framework compatible with the backend technology decision (BLOCKER-1). If Option B (GAS), a unit-testable approach via clasp + jest must be evaluated. If Option A/C (Node), jest + supertest is standard.

---

### BLOCKER-3: Environment Configuration — None Exists

**Why critical:** Phase 1 requires "missing required configuration fails explicitly." There is no `.env`, no `.env.example`, no config validation module, and no environment variables in use. This is a prerequisite for all other Phase 1 items (database connection requires connection string, auth requires JWT_SECRET or equivalent, etc.).

**Dependency:** Blocked by BLOCKER-1 (tech choice determines which env vars are needed).

---

### BLOCKER-4: PIC Master Strategy

**Why critical:** The Pre-Coding Lock states "PIC uses one shared master across business contexts." Two incompatible PIC registries currently exist (`EFM-PIC-xxx` with cost data and `PIC-xxx` with charge/scheduling data). Phase 1 ID infrastructure must establish the authoritative ID scheme. If Phase 1 creates a third PIC ID sequence without resolving the existing two, the conflict deepens.

**Decision required:** Choose PIC master strategy:
- Option A: Unify under one ID scheme (migration plan required — which IDs win?)
- Option B: Keep separate registries but create an explicit join/mapping key
- Option C: Designate one registry as master and tombstone the other
- Option D: Defer to Phase 2 and exclude PIC from Phase 1 ID infrastructure

---

## 20. HIGH-PRIORITY GAPS

These gaps do not block Phase 1 from starting but must be implemented as part of Phase 1 Foundation.

### GAP-H1: No Service Layer

All business logic executes directly in React page components via store function calls. Phase 1 Foundation must establish the `route/controller → service → repository` pattern before any Phase 2 business logic is written. Without this structure, Phase 2 business logic will inevitably land in UI components.

### GAP-H2: No ID Generation Service

Eight or more stores each have their own `getNextXxxId()` helper. Phase 1 must replace these with one authoritative generator that guarantees uniqueness across all document types.

### GAP-H3: No Validation Framework

All 7 standard error categories (VALIDATION_ERROR, NOT_FOUND, CONFLICT, UNAUTHORIZED, FORBIDDEN, INTERNAL_ERROR, BUSINESS_RULE_VIOLATION) are absent. Phase 1 must implement these as a shared module.

### GAP-H4: No Audit Infrastructure

The audit event schema (8 fields including requestId) does not exist. Phase 1 must implement the `AuditEvent` entity with append-only guarantee.

### GAP-H5: No Request/Correlation ID

No UUID or request context infrastructure exists. Phase 1 must add correlation ID to every request and propagate it through audit events.

### GAP-H6: Agreement Immutability Not Enforced

`ppDocumentsStore.updateDoc()` applies any patch without checking `statusTtd`. This must be fixed as part of Phase 1 Foundation even though it requires modifying an existing store — because the architectural lock explicitly forbids Agreement mutation after signing. This is the one case where legacy code MUST be fixed in Phase 1.

**Note:** The fix is additive (add a guard check), not a rewrite or deletion of logic.

---

## 21. MEDIUM / LOW GAPS

### Medium

| ID | Gap | Notes |
|---|---|---|
| MED-01 | Participant as separate entity | Embedded in Order; must become independent entity in Phase 2 |
| MED-02 | H&S as separate entity | Only exists as Agreement section; Phase 2 item |
| MED-03 | Commercial snapshot on Order | Order is mutable; snapshot mechanism needed in Phase 2 |
| MED-04 | Session entity | Attendance seed exists; Session entity needs Phase 2 |
| MED-05 | Assessment → Order link | `getAssessmentByOrderId()` is broken; fix required before Phase 2 assessment features |
| MED-06 | Program Catalog hierarchy | Flat records, no Offering/Package/Price; Phase 2 item |
| MED-07 | Auth: route guard | No guard in AppShell; Security fix needed before any real deployment |
| MED-08 | Timestamp normalization | Mixed date formats in dummy data; normalize on first DB write |
| MED-09 | GAS status casing | `'aktif'` vs `'Aktif'` inconsistency in GAS functions |
| MED-10 | Error boundary | No global React error boundary |

### Low

| ID | Gap | Notes |
|---|---|---|
| LOW-01 | CLAUDE.md stack versions | States React 18 / RR v6; actual is React 19 / RR v7; update CLAUDE.md |
| LOW-02 | PKS expiry not enforced | Elena Rodriguez expired 2024, shown as aktif |
| LOW-03 | Quotation ID format | `QUO/EFM/PP/...` slash vs expected `QUO-PP-YY-xxxx` dash |
| LOW-04 | Promo entity spec | Promo/discount entity not in spec; exists in code; legacy behavior — preserve |
| LOW-05 | `attendanceData.js` vs `ppAbsensiData.js` overlap | Unknown if these serve different purposes or duplicate |
| LOW-06 | Renewal mechanism | Out of Phase 1; note for Phase 2 |
| LOW-07 | Transaction strategy doc | Not documented; needed before Phase 2 DB writes |

---

## 22. DECISION REGISTER

| ID | Decision | Why Needed | Affected Area | Proposed Options | Owner |
|---|---|---|---|---|---|
| DEC-01 | Backend Technology | Phase 1 Foundation requires database, migration, service layer, test framework — none compatible with GAS-only | All Phase 1 foundation items | A: Node.js + PostgreSQL per spec intent; B: GAS + Sheets (functional compromise); C: Hybrid SPA + lightweight Node API | Owner (architecture) |
| DEC-02 | PIC Master Strategy | Two PIC registries (`EFM-PIC-xxx` and `PIC-xxx`) conflict with single-master principle | ID infrastructure, Phase 2 Assignment, Phase 2 Operations | A: Unify under one ID; B: Add explicit join key; C: Designate one master + tombstone; D: Defer to Phase 2 | Owner (data) |
| DEC-03 | Test Framework | No tests installed; Phase 1 acceptance requires all H-checklist items to pass | Phase 1 QA acceptance | Depends on DEC-01. If Node: jest + supertest. If GAS: clasp + jest workaround | Owner (tech) |
| DEC-04 | Auth Security Model | Hardcoded credentials + no password check + no route guard is not production-viable | Auth, security, route access | A: Implement proper auth (JWT, hashed credentials) in Phase 1; B: Accept current state as dev-only, fix in Phase 3 | Owner (security posture) |
| DEC-05 | Agreement Immutability Fix | `updateDoc()` has no guard; signed Agreements can be overwritten — violates Master Agreement Architecture (Level 2 source) | ppDocumentsStore | Add `if (doc.statusTtd === 'signed') throw CONFLICT` guard in Phase 1 | Owner confirms: fix allowed in Phase 1 |
| DEC-06 | Assessment → Order link | `getAssessmentByOrderId()` always returns null; all Order-level assessment lookups silently fail | Assessment feature, Gate 07, Phase 2 | Add `orderId` field to assessment records + fix store lookup | Owner confirms: fix scope and timing |
| DEC-07 | GAS decommission timeline | If DEC-01 chooses Node backend, GAS stub becomes obsolete. When is `program-db.gs` decommissioned? | Legacy code, migration | Decommission after data migration to new DB; date TBD | Owner |
| DEC-08 | Production deployment target | Vercel is configured for React SPA. Where does the backend (if DEC-01 = A or C) deploy? | DevOps, environment config | Options: Railway, Render, Fly.io, GCP, VPS | Owner |

---

## 23. PHASE 1 FOUNDATION READINESS

### Verdict: CONDITIONAL READY

Phase 1 Foundation coding **may begin** only after the following conditions are met:

**Condition 1 — Resolve BLOCKER-1 (DEC-01):** The backend technology decision must be made and committed. Without this decision, it is impossible to implement the database connection, migration mechanism, or test framework that are the core deliverables of Phase 1 Foundation.

**Condition 2 — Resolve BLOCKER-2 (DEC-03):** The test framework must be chosen and installed. Phase 1 acceptance requires a passing test suite as a prerequisite.

**Condition 3 — Resolve BLOCKER-4 (DEC-02):** The PIC master strategy must be decided before Phase 1 establishes ID infrastructure, to avoid creating a third conflicting PIC ID sequence.

**Condition 4 — Owner authorization for Agreement immutability fix (DEC-05):** Phase 1 must fix `updateDoc()` to guard against signing-state mutation. This is the one case where modifying existing store code is required by the architectural lock. Owner must explicitly authorize this modification before coding begins.

Once the 4 CRITICAL blockers are resolved, Phase 1 can proceed to implement:
- [ ] Environment configuration module (validated, fails explicitly on missing vars)
- [ ] Database connection (technology per DEC-01)
- [ ] Base migration (technology per DEC-01)
- [ ] Single authoritative ID generator service
- [ ] Audit foundation (AuditEvent entity, append-only, 8 required fields)
- [ ] Validation/error framework (7 standard categories)
- [ ] Request/correlation ID middleware
- [ ] Service layer skeleton (route/controller → service → repository conventions)
- [ ] Test suite (technology per DEC-03)
- [ ] Agreement immutability guard in `updateDoc()` (authorized per DEC-05)

### Items confirmed safe to carry into Phase 1 as-is (no modification needed)

- PP Order IDs (`PP-YY-xxxx`) — format correct
- Invoice IDs (`INV-PP-YY-xxxx`) — format correct
- Receipt IDs (`RCP-PP-YY-xxxx`) — format correct
- Agreement IDs (`AGR-PP-YY-xxxx`) — format correct
- Lead entity structure — satisfactory for Phase 1
- Client entity structure — satisfactory for Phase 1
- Vercel SPA deployment config — present and correct
- Module separation (PP / B2B / Event) — correctly isolated
- Legacy files — all present; none deleted; protected going forward

### Items out of Phase 1 scope (do not implement)

- Order workflow, Payment workflow, Agreement signing workflow
- Assignment eligibility engine, Program Ready calculation
- Session workflow, Attendance workflow
- Active Aging screening, B2B workflows
- Participant entity (Phase 2)
- H&S as separate entity (Phase 2)
- Commercial snapshot mechanism (Phase 2)
- Program Catalog hierarchy: Offering/Package/Price (Phase 2)
- Renewal mechanism (Phase 2)

---

## 24. RECOMMENDED NEXT STEP

**DO NOT begin coding until the 4 CRITICAL blockers above are resolved.**

Recommended action sequence:

1. **Owner makes DEC-01 (Backend Technology)** — this is the highest-leverage decision. All other Phase 1 items are dependent on it. A clear technology choice unlocks all downstream planning.

2. **Owner makes DEC-02 (PIC Master Strategy)** — required before ID infrastructure is designed.

3. **Owner authorizes DEC-05 (Agreement fix)** — a simple confirm/deny; the fix is one guard check.

4. **Phase 1 planning session** — once DEC-01 is made, a concrete Phase 1 implementation plan can be drafted with specific files, packages, and test targets tailored to the chosen stack.

5. **Phase 1 Foundation Coding** — implement per `02_EFM_PP_PHASE_1_FOUNDATION_CODING_SPECIFICATION_v1.0.md` and validate against `04_EFM_PP_PHASE_1_ACCEPTANCE_QA_CHECKLIST_v1.0.md`.

No source code, database schema, or authoritative documents have been modified in the production of this report.

---

*Report generated: 2026-09-28 | Branch: `claude/add-claude-md-instructions-7iqjvo` | Session: ANALYSIS ONLY*
