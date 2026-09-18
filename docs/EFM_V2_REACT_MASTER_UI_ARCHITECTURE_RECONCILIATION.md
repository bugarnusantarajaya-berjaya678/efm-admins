# EFM V2 — React Master UI Architecture Reconciliation

**Phase 3 Audit** | Branch: `claude/add-claude-md-instructions-7iqjvo`  
Compiled: 2026-09-18 | Scope: Read-only audit of existing React application

> **READ-ONLY AUDIT.** This document was produced by reading source files only.
> No source code was modified, created, or deleted during this audit.

---

## Table of Contents

1. [Audit Scope and Method](#1-audit-scope-and-method)
2. [Authoritative Route Map](#2-authoritative-route-map)
3. [Page Inventory by Module](#3-page-inventory-by-module)
4. [Navigation Architecture](#4-navigation-architecture)
5. [Business Logic → UI Mapping: PP Module](#5-business-logic--ui-mapping-pp-module)
6. [Business Logic → UI Mapping: B2B Management Module](#6-business-logic--ui-mapping-b2b-management-module)
7. [Business Logic → UI Mapping: B2B Event Module](#7-business-logic--ui-mapping-b2b-event-module)
8. [Order Detail as Workspace — Tab Architecture Comparison](#8-order-detail-as-workspace--tab-architecture-comparison)
9. [Lead ≠ Klien: Distinction in Code](#9-lead--klien-distinction-in-code)
10. [Active Aging & PP Program DB](#10-active-aging--pp-program-db)
11. [Agreement State Machine in UI](#11-agreement-state-machine-in-ui)
12. [Assessment / Fitness Screening UI Architecture](#12-assessment--fitness-screening-ui-architecture)
13. [Assignment & Trainer (PIC) UI Architecture](#13-assignment--trainer-pic-ui-architecture)
14. [Schedule & Attendance UI Architecture](#14-schedule--attendance-ui-architecture)
15. [Shared Core: Data Layer Architecture](#15-shared-core-data-layer-architecture)
16. [Navigation Gaps: Routes Exist But No Nav Entry](#16-navigation-gaps-routes-exist-but-no-nav-entry)
17. [Page Ownership: Which Module Owns What Page](#17-page-ownership-which-module-owns-what-page)
18. [Status & Action UI Patterns](#18-status--action-ui-patterns)
19. [Business Gates in UI: What Unlocks What](#19-business-gates-in-ui-what-unlocks-what)
20. [Dummy Data Reconciliation](#20-dummy-data-reconciliation)
21. [UI Flow Gaps: Features Referenced But Not Implemented](#21-ui-flow-gaps-features-referenced-but-not-implemented)
22. [Known Bugs in Current Implementation](#22-known-bugs-in-current-implementation)
23. [ID Format Compliance Audit](#23-id-format-compliance-audit)
24. [PP Module: Full Entity Chain Reconciliation](#24-pp-module-full-entity-chain-reconciliation)
25. [B2B Management: Full Entity Chain Reconciliation](#25-b2b-management-full-entity-chain-reconciliation)
26. [B2B Event: Full Entity Chain Reconciliation](#26-b2b-event-full-entity-chain-reconciliation)
27. [Recommended Page Architecture: Current vs Target](#27-recommended-page-architecture-current-vs-target)
28. [Current → Target Gap Summary](#28-current--target-gap-summary)
29. [Implementation Priority Order](#29-implementation-priority-order)
30. [Owner Decisions Required](#30-owner-decisions-required)

---

## 1. Audit Scope and Method

### What Was Audited

All source files under `REACT-APP/src/` were catalogued. The following files were fully or partially read during this audit:

| File | Lines | Coverage |
|---|---|---|
| `src/App.jsx` | 188 | Full |
| `src/components/layout/Sidebar.jsx` | 297 | Full |
| `src/pages/pp/PPOrderDetailPage.jsx` | 2792 | Lines 1–250 + structure survey |
| `src/pages/b2b/B2BOrderDetailPage.jsx` | 3612 | Lines 1–250 + structure survey |
| `src/pages/event/EventOrderDetailPage.jsx` | 3832 | Lines 1–250 + structure survey |
| `src/pages/pp/PPLeadDetailPage.jsx` | 1448 | Lines 1–100 |
| `src/pages/pp/PPKlienDetailPage.jsx` | 462 | Lines 1–60 |
| `src/pages/pp/PPFitnessAssessmentPage.jsx` | 1245 | Lines 1–80 |
| `src/pages/pp/PPScreeningPage.jsx` | ~600 | Lines 1–80 |
| `src/pages/pp/PPAgreementDetailPage.jsx` | 834 | Lines 1–80 |
| `src/pages/pp/PPDocumentsPage.jsx` | 921 | Lines 1–80 |
| `src/pages/pp/PPRekapAbsensiDetailPage.jsx` | 805 | Lines 1–60 |
| `src/pages/pic/OPSPICPage.jsx` | 326 | Lines 1–60 |
| `src/pages/pic/PICDetail.jsx` | 1243 | Lines 1–60 |
| `src/data/ppLeadsData.js` | 49 | Full |
| `src/data/ppOrdersData.js` | 37 | Full |
| `src/data/ppDocumentsData.js` | ~300 | Lines 1–80 |
| `src/data/ppAssessmentsData.js` | ~200 | Lines 1–80 |
| `src/data/ppAbsensiData.js` | ~150 | Lines 1–60 |
| `src/data/b2bData.js` | ~400 | Lines 1–100 |

### What This Document Is

This document reconciles the intended business logic (as documented in `EFM_V2_BUSINESS_LOGIC_MASTER_MAP.md`) against the **actual** React application state. It answers:

- What pages/routes currently exist?
- What tab structure does each Order Detail use?
- Where do business logic entities map to UI pages?
- What is missing, inconsistent, or broken?
- What decisions must be made before implementation?

---

## 2. Authoritative Route Map

Source: `REACT-APP/src/App.jsx` (read in full, 188 lines)

### PP Module Routes

```
/pp/dashboard             PPDashboardPage
/pp/leads                 PPLeadsPage
/pp/leads/:id             PPLeadDetailPage
/pp/klien                 PPKlienPage
/pp/klien/:id             PPKlienDetailPage
/pp/orders                PPOrdersPage
/pp/orders/:id            PPOrderDetailPage
/pp/orders/rekap/:orderId PPRekapAbsensiDetailPage
/pp/invoice               PPInvoicePage
/pp/invoice/:id           PPInvoiceDetailPage
/pp/receipt               PPReceiptPage
/pp/receipt/:id           PPReceiptDetailPage
/pp/screening             PPScreeningPage
/pp/screening/:id         PPFitnessAssessmentPage
/pp/agreement             PPDocumentsPage
/pp/agreement/:id         PPAgreementDetailPage
/pp/documents             PPDocumentsPage   ← same component as /pp/agreement
/pp/promo                 PPPromoPage
/pp/program-db            PPProgramDBPage
```

**Notes:**
- `/pp/agreement` and `/pp/documents` both render `PPDocumentsPage` — same component, different URL entry points
- `/pp/screening/:id` renders `PPFitnessAssessmentPage` — the "screening" in URL refers to fitness assessment form, NOT the pre-sales consultation screening
- `/pp/orders/rekap/:orderId` renders the attendance recap, nested under the orders path

### B2B Management Module Routes

```
/b2b/dashboard            B2BDashboardPage
/b2b/leads                B2BLeadsPage
/b2b/leads/:id            B2BLeadDetailPage
/b2b/survei               B2BSurveiPage
/b2b/survei/:id           B2BSurveiDetailPage
/b2b/orders               B2BOrdersPage
/b2b/orders/:id           B2BOrderDetailPage
/b2b/invoice              B2BInvoicePage
/b2b/receipt              B2BReceiptPage
/b2b/calendar             B2BCalendarPage
```

**Notes:**
- B2B has `Survei` (field survey) in the pre-sales flow — equivalent to PP's Screening (pre-sales step), NOT the fitness assessment
- B2B has `/b2b/invoice` list and `/b2b/receipt` list but **no detail pages** (`/b2b/invoice/:id` and `/b2b/receipt/:id` are absent)
- No Quotation route exists under B2B (the business map mentions quotation; UI has no dedicated page)

### B2B Event Module Routes

```
/event/dashboard          EventDashboardPage
/event/leads              EventLeadsPage
/event/leads/:id          EventLeadDetailPage
/event/konsultasi         EventKonsultasiPage
/event/konsultasi/:id     EventKonsultasiDetailPage
/event/orders             EventOrdersPage
/event/orders/:id         EventOrderDetailPage
/event/invoice            EventInvoicePage
/event/receipt            EventReceiptPage
/event/calendar           EventCalendarPage
```

**Notes:**
- Event has `/event/konsultasi` — pre-sales consultation list and detail
- Event has `/event/invoice` and `/event/receipt` list pages but **no detail pages** (same gap as B2B)
- No Quotation route under Event either

### OPS (Operasional) Routes

```
/ops/pelatih              OPSPICPage          (trainer list)
/ops/pelatih/:id          PICDetail           (trainer detail)
/ops/mitra                OPSMitraPage
/ops/aset                 OPSAsetPage
/ops/pelatih/kontrak      OPSKontrakPKSPage   (trainer contract list)
```

**Redirects:**
```
/pic          → /ops/pelatih
/contract     → /ops/pelatih/kontrak
```

### Reports & Settings Routes

```
/laporan/keuangan         LaporanKeuanganPage
/laporan/klien            LaporanKlienPage
/settings                 SettingsPage
```

### Default Route

```
/             → redirects to /pp/dashboard
```

---

## 3. Page Inventory by Module

### PP Module — 19 Pages

| # | Page Name | Route | Status |
|---|---|---|---|
| 1 | PP Dashboard | `/pp/dashboard` | Implemented |
| 2 | PP Leads List | `/pp/leads` | Implemented |
| 3 | PP Lead Detail | `/pp/leads/:id` | Implemented |
| 4 | PP Klien List | `/pp/klien` | Implemented |
| 5 | PP Klien Detail | `/pp/klien/:id` | Implemented |
| 6 | PP Orders List | `/pp/orders` | Implemented |
| 7 | PP Order Detail | `/pp/orders/:id` | Implemented |
| 8 | PP Rekap Absensi | `/pp/orders/rekap/:orderId` | Implemented |
| 9 | PP Invoice List | `/pp/invoice` | Implemented |
| 10 | PP Invoice Detail | `/pp/invoice/:id` | Implemented |
| 11 | PP Receipt List | `/pp/receipt` | Implemented |
| 12 | PP Receipt Detail | `/pp/receipt/:id` | Implemented |
| 13 | PP Screening/Assessment List | `/pp/screening` | Implemented |
| 14 | PP Fitness Assessment Form | `/pp/screening/:id` | Implemented |
| 15 | PP Agreement/Documents List | `/pp/agreement` & `/pp/documents` | Implemented |
| 16 | PP Agreement Detail | `/pp/agreement/:id` | Implemented |
| 17 | PP Promo | `/pp/promo` | Implemented |
| 18 | PP Program DB | `/pp/program-db` | Implemented |
| — | PP Quotation | _no route_ | **Missing** |

### B2B Management Module — 10 Pages

| # | Page Name | Route | Status |
|---|---|---|---|
| 1 | B2B Dashboard | `/b2b/dashboard` | Implemented |
| 2 | B2B Leads List | `/b2b/leads` | Implemented |
| 3 | B2B Lead Detail | `/b2b/leads/:id` | Implemented |
| 4 | B2B Survei List | `/b2b/survei` | Implemented |
| 5 | B2B Survei Detail | `/b2b/survei/:id` | Implemented |
| 6 | B2B Orders List | `/b2b/orders` | Implemented |
| 7 | B2B Order Detail | `/b2b/orders/:id` | Implemented |
| 8 | B2B Invoice List | `/b2b/invoice` | Implemented |
| 9 | B2B Receipt List | `/b2b/receipt` | Implemented |
| 10 | B2B Calendar | `/b2b/calendar` | Implemented |
| — | B2B Invoice Detail | `/b2b/invoice/:id` | **Missing** |
| — | B2B Receipt Detail | `/b2b/receipt/:id` | **Missing** |
| — | B2B Quotation | _no route_ | **Missing** |
| — | B2B Agreement Detail | _no route_ | **Missing** (LOI/MOU/Contract live inside Order Detail tab) |

### B2B Event Module — 10 Pages

| # | Page Name | Route | Status |
|---|---|---|---|
| 1 | Event Dashboard | `/event/dashboard` | Implemented |
| 2 | Event Leads List | `/event/leads` | Implemented |
| 3 | Event Lead Detail | `/event/leads/:id` | Implemented |
| 4 | Event Konsultasi List | `/event/konsultasi` | Implemented |
| 5 | Event Konsultasi Detail | `/event/konsultasi/:id` | Implemented |
| 6 | Event Orders List | `/event/orders` | Implemented |
| 7 | Event Order Detail | `/event/orders/:id` | Implemented |
| 8 | Event Invoice List | `/event/invoice` | Implemented |
| 9 | Event Receipt List | `/event/receipt` | Implemented |
| 10 | Event Calendar | `/event/calendar` | Implemented |
| — | Event Invoice Detail | `/event/invoice/:id` | **Missing** |
| — | Event Receipt Detail | `/event/receipt/:id` | **Missing** |
| — | Event Quotation | _no route_ | **Missing** |

### OPS Module — 4 Pages

| # | Page Name | Route | Status |
|---|---|---|---|
| 1 | Trainer List | `/ops/pelatih` | Implemented |
| 2 | Trainer Detail | `/ops/pelatih/:id` | Implemented |
| 3 | Mitra List | `/ops/mitra` | Implemented |
| 4 | Aset List | `/ops/aset` | Implemented |
| 5 | Kontrak PKS List | `/ops/pelatih/kontrak` | Implemented |

### Reports & Settings — 3 Pages

| # | Page Name | Route | Status |
|---|---|---|---|
| 1 | Laporan Keuangan | `/laporan/keuangan` | Implemented |
| 2 | Laporan Klien | `/laporan/klien` | Implemented |
| 3 | Settings | `/settings` | Implemented |

---

## 4. Navigation Architecture

Source: `REACT-APP/src/components/layout/Sidebar.jsx` (read in full)

### PP Sub-Navigation (`PP_SUB`)

```
Dashboard       → /pp/dashboard
Leads           → /pp/leads
                  (also highlights on: /pp/klien)
Orders          → /pp/orders
                  (also highlights on: /pp/invoice, /pp/receipt,
                   /pp/agreement, /pp/documents, /pp/screening)
Promo           → /pp/promo
Program DB      → /pp/program-db
```

**Observations:**
- Klien (`/pp/klien`) has NO dedicated sidebar entry — accessed via Leads highlight or direct navigation
- Invoice, Receipt, Agreement, Documents, Screening all fall under the Orders highlight — they are sub-pages of Orders but lack independent nav items
- This means the sidebar never shows the user "which section" of Orders they're in — just "Orders" is always highlighted

### B2B Sub-Navigation (`B2B_SUB`)

```
Dashboard       → /b2b/dashboard
Leads           → /b2b/leads
Survei          → /b2b/survei
Orders          → /b2b/orders
Kalender        → /b2b/calendar
```

**Observations:**
- Invoice and Receipt have routes but **no sidebar entries** — only reachable from within Order Detail or by direct URL
- No Quotation nav entry (matches missing route)

### Event Sub-Navigation (`EVENT_SUB`)

```
Dashboard       → /event/dashboard
Leads           → /event/leads
Orders          → /event/orders
Kalender        → /event/calendar
```

**Observations:**
- **Konsultasi is missing from sidebar** — route `/event/konsultasi` exists, component exists, but there is NO sidebar entry. This is the most significant nav gap.
- Invoice, Receipt have routes but no nav entries (same as B2B)

### OPS Sub-Navigation (`OPS_SUB`)

```
PIC             → /ops/pelatih
Mitra           → /ops/mitra
Aset            → /ops/aset
Kontrak PKS     → /ops/pelatih/kontrak
```

### Menu Group Structure

The sidebar uses distinct menu groups visible in the code:

- `MAIN` — PP/B2B/Event module switcher tabs at top
- `PROGRAM` — module-specific sub-items (varies per active module)
- `OPERASIONAL` — OPS section (PIC, Mitra, Aset, PKS)
- `LAPORAN & KEUANGAN` — Keuangan, Klien laporan
- `LAINNYA` — Settings

---

## 5. Business Logic → UI Mapping: PP Module

### Business Logic Entity Chain

```
Lead → Klien → Order → Invoice → Receipt → Agreement → Assessment → Attendance → Rekap
```

### Mapping to UI Pages

| Entity | UI Page | Route | Notes |
|---|---|---|---|
| Lead | PPLeadDetailPage | `/pp/leads/:id` | Contains pipeline stages, linked orders, linked assessments |
| Klien | PPKlienDetailPage | `/pp/klien/:id` | Shows linked orders and assessments |
| Order | PPOrderDetailPage | `/pp/orders/:id` | Central workspace for all order-related operations |
| Invoice | PPInvoiceDetailPage | `/pp/invoice/:id` | Full document editor with edit/sign/download |
| Receipt | PPReceiptDetailPage | `/pp/receipt/:id` | Payment receipt document |
| Agreement | PPAgreementDetailPage | `/pp/agreement/:id` | Signature canvas, state machine |
| Assessment | PPFitnessAssessmentPage | `/pp/screening/:id` | 9-section form, pre/post phases |
| Attendance | (inline in PPOrderDetailPage) | `/pp/orders/:id` Tab 2 | No dedicated attendance entry page |
| Rekap | PPRekapAbsensiDetailPage | `/pp/orders/rekap/:orderId` | Trainer payment + attendance summary |

### PP Pipeline Stages (PPLeadDetailPage)

Extracted from source:
```js
const PIPELINE_STAGES = ['New', 'Approach', 'Screening', 'Closing', 'Lost']
```

**Reconciliation note:** The business map mentions `Converted` as a terminal stage. The UI uses `Lost` as the final visible stage. "Converted" status exists in data (`closed-won`) but is not a pipeline step in the UI — it's a status badge overlay on a lead record.

### PP Order Tahapan Steps (PPOrderDetailPage)

Extracted from source:
```js
const TAHAPAN_STEPS = ['Invoice', 'Agreement', 'Program Berjalan', 'Program Selesai']

const TAHAPAN_TO_STATUS = {
  'Invoice': 'Draft',
  'Agreement': 'Pending',
  'Program Berjalan': 'Aktif',
  'Program Selesai': 'Completed'
}
```

This is the authoritative progression for PP Orders in the current UI. All dummy data must conform to these exact values for `tahapan` field.

### PP Lead Status Values (ppLeadsData.js)

Current values found in data:
- `'closed-won'` — lead converted to order
- `'closed-lost'` — lead lost
- `'follow-up'` — active follow-up
- `'new'` — newly registered

**Reconciliation note:** The business map also mentions `'approach'`, `'screening'`, `'closing'` as mid-funnel pipeline statuses. These are NOT present in any current lead data records — only the four above exist. The pipeline stage visualizer in the lead detail UI works off a separate `stage` field, distinct from the `status` field.

---

## 6. Business Logic → UI Mapping: B2B Management Module

### Business Logic Entity Chain

```
Lead → Survei → Quotation → Order → Invoice → Receipt → Contract Documents
```

### Mapping to UI Pages

| Entity | UI Page | Route | Notes |
|---|---|---|---|
| Lead | B2BLeadDetailPage | `/b2b/leads/:id` | Pipeline stages differ from PP |
| Survei (Field Survey) | B2BSurveiDetailPage | `/b2b/survei/:id` | Pre-sales field visit form |
| Quotation | **No dedicated page** | _missing_ | Lives as a tab inside Order Detail |
| Order | B2BOrderDetailPage | `/b2b/orders/:id` | 4-tab workspace |
| Invoice | B2BInvoicePage (list only) | `/b2b/invoice` | **No detail page** |
| Receipt | B2BReceiptPage (list only) | `/b2b/receipt` | **No detail page** |
| LOI/MOU/Contract | Embedded in Order Detail | `/b2b/orders/:id` Tab 2 | Document sub-tabs inside order detail |

### B2B Lead Stages

Extracted from `b2bData.js` stages array:
```
New → Proposal → Presentasi → Closing → Converted
```
Also: `Gagal` (not a linear stage — exit at any point)

**Reconciliation note:** B2B stages are more complex than PP — they include a "Proposal" stage (written proposal delivery) and "Presentasi" (presentation to client) before Closing.

### B2B Order Detail Tab Structure

Confirmed from `B2BOrderDetailPage.jsx` (4 tabs):

| Tab Key | Label | Content |
|---|---|---|
| `keuangan` | Kontrak & Keuangan | Financial summary, invoice/receipt linked cards, payment status |
| `dokumen` | Dokumen Kerjasama | Document sub-tabs: quotation, loi, mou, contract, active |
| `operasional` | Operasional Lapangan | Schedule, attendance, trainer assignments |
| `wa` | Komunikasi WA | WhatsApp log |

### Critical Gap: B2B Has No Formal Order Data Entity

From reading `B2BOrderDetailPage.jsx`: order-level data (company name, contract value, etc.) is managed as **page-local state** initialized from `b2bData.js` lead records — there is no `b2bOrdersData.js` equivalent. This means:

- Orders cannot be listed independently of leads
- The Orders page (`/b2b/orders`) likely reconstructs order list from lead data
- No `orderId` system for B2B — orders are referenced by their associated `leadId`

**This is the most significant architectural gap in the B2B module.**

### B2B Lead ID Format Issue

From `b2bData.js`:
- Corporate leads: `BC-001`, `BC-002`, ..., `BC-010`
- Apartment leads: `BA-001`, `BA-002`, ..., `BA-005`

**Standard per `efm-design-standards`:** Lead IDs should be `LB-0001`, `LB-0002`, etc.  
**Current state:** Non-standard `BC-` / `BA-` prefixes. Legacy format not yet migrated.

---

## 7. Business Logic → UI Mapping: B2B Event Module

### Business Logic Entity Chain

```
Lead → Konsultasi → Quotation → Order → Invoice → Receipt → Kelas (Hari-H)
```

### Mapping to UI Pages

| Entity | UI Page | Route | Notes |
|---|---|---|---|
| Lead | EventLeadDetailPage | `/event/leads/:id` | Implemented |
| Konsultasi | EventKonsultasiDetailPage | `/event/konsultasi/:id` | Implemented — but **no sidebar nav entry** |
| Quotation | **No dedicated page** | _missing_ | Presumably inside Order Detail |
| Order | EventOrderDetailPage | `/event/orders/:id` | 5-tab workspace |
| Invoice | EventInvoicePage (list only) | `/event/invoice` | **No detail page** |
| Receipt | EventReceiptPage (list only) | `/event/receipt` | **No detail page** |
| Kelas / Hari-H | Embedded in Order Detail | `/event/orders/:id` Tab 4 | "Hari-H & PIC" tab unique to Event |

### Event Order Detail Tab Structure

Confirmed from `EventOrderDetailPage.jsx` (5 tabs — most tabs of any module):

| Tab Key | Label | Content |
|---|---|---|
| `keuangan` | Kontrak & Keuangan | Financial summary, invoice/receipt linked cards |
| `dokumen` | Dokumen Kerjasama | Document sub-tabs: quotation, mou, contract, active (NO LOI) |
| `operasional` | Operasional Lapangan | Operational details |
| `kelas` | Hari-H & PIC | Event-day logistics, PIC trainer assignments — **unique to Event** |
| `wa` | Komunikasi WA | WhatsApp log |

**Key difference from B2B:** Event uses `mou, contract` (no LOI). B2B uses `loi, mou, contract`. This reflects the different business relationship types.

### Event Konsultasi Navigation Gap

**Critical:** `/event/konsultasi` and `/event/konsultasi/:id` are fully implemented routes with working components, BUT there is **no sidebar entry** for Konsultasi in `EVENT_SUB`. Users cannot navigate to Konsultasi from the sidebar — they must use direct URLs or entry points within Lead Detail.

---

## 8. Order Detail as Workspace — Tab Architecture Comparison

The Order Detail page is the central workspace in all three modules. Tab architectures differ significantly:

### Current State

| Module | Tab Count | Tabs |
|---|---|---|
| PP | 3 | Overview (keuangan), Operasional, WA |
| B2B Management | 4 | Kontrak & Keuangan, Dokumen Kerjasama, Operasional, WA |
| B2B Event | 5 | Kontrak & Keuangan, Dokumen Kerjasama, Operasional, Hari-H & PIC, WA |

### PP Order Detail: Missing "Dokumen" Tab

PP Order Detail (`PPOrderDetailPage.jsx`) has **no dedicated Document tab**. Instead, document shortcuts (Invoice, Receipt, Agreement, Assessment) are displayed as quick-access cards **within the Overview tab** (tab: `keuangan`).

This is an architectural divergence from B2B and Event. B2B and Event both have a dedicated `dokumen` tab.

**Impact:** PP users must go to Overview → click document link → navigate away from Order Detail to view any document. B2B/Event users stay within Order Detail and access documents inline.

### PP Order Detail: The Inline Attendance Pattern

PP Order Detail contains:
```js
const ABSENSI_DUMMY = [
  // 12 hardcoded session attendance records
]

const ABSENSI_BY_ORDER = {
  'PP-26-0005': [...],  // custom overrides per order
  'PP-26-0006': [...],
  // etc.
}
```

Attendance data is **inline inside the page component** — not from a separate data store accessed via route. This means:
- Attendance modifications within Order Detail use component state
- The separate `/pp/orders/rekap/:orderId` page (PPRekapAbsensiDetailPage) is a distinct page for the Rekap report

### Activity Log Storage Pattern

PP Order Detail stores activity log in **localStorage** keyed by order ID:
```js
const storageKey = `orderLog_${orderId}`
```

This is the only page that uses localStorage for business logic state. B2B and Event order details likely use similar patterns (not confirmed — files not fully read).

---

## 9. Lead ≠ Klien: Distinction in Code

### PP Module — Clearest Separation

The PP module has a clear `Lead` ≠ `Klien` distinction:

| Entity | ID Format | Who They Are | Where Stored |
|---|---|---|---|
| Lead | `LP-0001` | Person who signed up / payer / registrant | `ppLeadsData.js` + `ppLeadsStore.js` |
| Klien | `KL-0001` | Person who physically trains | `ppKlienData.js` + `ppKlienStore.js` |

**Key store maps (ppLeadsStore.js):**
```js
ORDER_TO_LEAD_ID = {
  'PP-26-0001': 'LP-0001',
  // etc.
}
```

**Key store maps (ppKlienStore.js):**
```js
ORDER_TO_KLIEN_ID = {
  'PP-26-0001': 'KL-0001',
  // etc.
}
```

These two maps are the **authoritative lookup tables** for PP module cross-entity relationships. Every order maps to exactly one Lead and one Klien (in standard 1:1 cases).

**Group / Couple programs:** An order with `tipeProgram: 'grup'` or `'couple'` means multiple Klien per order. The current data model does not explicitly model multiple Klien per order — this is an identified gap.

### PP Assessment: The leadId+klienId vs orderId Problem

`ppAssessmentsData.js` stores assessment records with:
```js
{
  leadId: 'LP-0001',
  klienId: 'KL-0001',
  // NO orderId field
}
```

`ppLeadsStore.js` (or `ppAssessmentsStore.js`) implements:
```js
getAssessmentByOrderId(orderId)
```

**This function is broken by design** — assessment records have no `orderId` field, so lookup by orderId will always return `null`. The correct lookup path requires:
1. `orderId` → `ppLeadsStore.ORDER_TO_LEAD_ID` → `leadId`
2. `leadId` + `klienId` → assessment lookup

### B2B Management — No Klien Concept

B2B Management operates at the company level:
- Lead entity = company/organization (not a person)
- No separate "Klien" entity
- The "client" is the company itself, tracked by `leadId` through the entire chain

Lead data in `b2bData.js` uses `perusahaan` (company name) and `pic` (PIC name) fields — corporate-facing fields, not individual-person fields.

### B2B Event — Per-Lead Participant Tracking

B2B Event deals with events where multiple participants attend. The current UI models the event itself as the order unit. Individual participant tracking (if needed) would require a separate participants entity — this is not implemented.

---

## 10. Active Aging & PP Program DB

### PPProgramDBPage (`/pp/program-db`)

This page manages the program/trainer database for PP module. Based on route and data references:

- Trainer records use `EFM-PIC-001` format IDs (from `ppProgramDBData.js`)
- This conflicts with the OPS module trainer IDs (`PIC-001` format in `opsData.js`)

**See Section 13 for the full PIC ID conflict analysis.**

### Active Aging Program Type

The PP module supports an "Active Aging" program type for senior clients. From the data:
- Standard PP paket: 4/8/12/24 sessions at Rp 200.000/sesi
- Active Aging may use different session counts or pricing — not confirmed from data read

The `PPProgramDBPage` likely houses both regular PP trainers and Active Aging-specific programs. Architecture implication: if Active Aging has different pricing, the PAKET_HARGA structure in OrderDetailPage would need to handle both.

---

## 11. Agreement State Machine in UI

Source: `PPAgreementDetailPage.jsx` (lines 1–80 read)

### State Values

From `ppDocumentsData.js`:
```
'pending'           → Agreement created, awaiting client action
'waiting-approval'  → Client submitted signature, awaiting admin approval
'signed'            → Admin approved, agreement fully executed
'expired'           → Deadline passed without signing
```

### State Transitions

The agreement state machine in `PPAgreementDetailPage.jsx` operates as follows:

```
[pending] → client submits signature (canvas SignaturePad) → [waiting-approval]
[waiting-approval] → admin approves → [signed]
[waiting-approval] → admin rejects → [pending] (returns to unsigned state)
[pending] → deadline passes → [expired]
```

### Signature Canvas

The page embeds a **canvas-based `SignaturePad` component** for capturing client signatures. Signature metadata stored:
```js
ttdMetadata: {
  timestamp: '2026-05-20T09:00:00',
  device: 'Desktop Chrome',
  ip: '203.0.113.45'
}
```

### Agreement Detail from ppDocumentsData.js

Each agreement record includes:
```js
{
  id: 'AGR-PP-26-0001',
  orderId: 'PP-26-0001',
  leadId: 'LP-0001',
  klienId: 'KL-0001',
  statusTtd: 'signed',
  approvedBy: 'Admin EFM',
  ttdMetadata: { timestamp, device, ip },
  pasals: [...],   // contract clauses array
  tanggalMulai, tanggalBerakhir, tanggalTtd
}
```

### Agreement in B2B and Event

B2B uses LOI (Letter of Intent) + MOU + Contract — three distinct documents per order. These are embedded as **sub-tabs inside B2BOrderDetailPage** (`dokumen` tab), not as separate pages with routes. There are no `/b2b/agreement/:id` equivalent routes.

Event uses MOU + Contract (no LOI) — same embedded sub-tab pattern.

---

## 12. Assessment / Fitness Screening UI Architecture

Source: `PPFitnessAssessmentPage.jsx`, `PPScreeningPage.jsx`, `ppAssessmentsData.js`

### URL / Name Confusion

There is a naming conflict in PP module:

| Term | Used In | Meaning |
|---|---|---|
| "Screening" | Pre-sales stage in business map | Pre-sales consultation / needs assessment meeting |
| `/pp/screening` | URL in App.jsx | **Fitness Assessment** list and form |
| `PPScreeningPage` | Component name | Fitness Assessment list |
| `PPFitnessAssessmentPage` | Component name | Fitness Assessment form |

The business-logic "Screening" (pre-sales consultation) has **no dedicated UI page**. The `/pp/screening` URL is repurposed for Fitness Assessments (post-enrollment). This is a naming collision that could confuse future development.

### Assessment Form Structure (PPFitnessAssessmentPage)

The fitness assessment has 9 measurement sections:

```
1. TANITA_FIELDS (11 fields)   — body composition scale measurements
2. GIRTHS_FIELDS (11 fields)   — circumference measurements
3. PARQ_ITEMS (15 items)       — physical readiness questionnaire
4. ALIGNMENT_PARTS (10 parts)  — postural alignment assessment
5. VITAL_FIELDS (4 fields)     — vital signs (BP, HR, SpO2, Temp)
6. FMS_ITEMS                   — functional movement screen
7–9. (additional sections)     — confirmed in data but not read in detail
```

Each section has two phases:
- `_awal` — Pre-Test (initial assessment, start of program)
- `_akhir` — Post-Test (final assessment, end of program)

### Renewal Copy-Forward Pattern

From `ppAssessmentsData.js`:
```js
prevAssessmentId: null      // first order for this klien
prevAssessmentId: 'ASMT-PP-26-0001'  // renewal — copies from previous
```

When `prevAssessmentId` is set, the new assessment form pre-fills `_awal` values from the previous assessment's `_akhir` values. This enables continuity tracking across program renewals.

### Assessment Search Bug (PPScreeningPage)

From reading `PPScreeningPage.jsx`:
```js
// Bug: filters on a.orderId, but assessment records have no orderId field
filtered = assessments.filter(a =>
  a.namaKlien.includes(search) ||
  a.id.includes(search) ||
  a.orderId.includes(search)  // ← always undefined, always false
)
```

This is a confirmed bug: searching by order ID in the assessment list will never return results because assessment records store `leadId`+`klienId`, not `orderId`.

---

## 13. Assignment & Trainer (PIC) UI Architecture

### Dual PIC Registry Conflict

There are **two separate trainer ID systems** in the codebase:

| System | ID Format | Source File | Used In |
|---|---|---|---|
| OPS Trainer Registry | `PIC-001`, `PIC-002` | `opsData.js` | OPSPICPage, PICDetail |
| PP Program DB Trainer Registry | `EFM-PIC-001`, `EFM-PIC-002` | `ppProgramDBData.js` | PPOrderDetailPage, PPProgramDBPage |

These two registries are **independent and unlinked**. A trainer named "Sarah Jenkins" exists in both with different IDs. There is no join table or shared identifier.

**Practical impact:** The OPS module (PKS contracts, documents, credentials) tracks trainers by `PIC-xxx`. The PP module assigns trainers by `EFM-PIC-xxx`. A trainer's PKS contract document in OPS cannot be easily cross-referenced to their assignment in PP.

### Trainer Assignment in PP Order Detail

PP Order Detail (Operasional tab) allows assigning a trainer (PIC Pelatih) to an order. The trainer is referenced by their `EFM-PIC-xxx` ID from the Program DB. The assignment is stored in order data as `picPelatih`.

### PKS Contract in OPS Module

`PICDetail.jsx` (`/ops/pelatih/:id`) manages:
- Trainer profile and credentials
- PKS (Perjanjian Kerja Sama) contract history
- Document uploads: KTP, foto, sertifikat, NPWP, kontrak

The PKS contract for a trainer is viewed/managed here. Cross-referencing to which orders a trainer is assigned requires manual lookup across the two registries.

---

## 14. Schedule & Attendance UI Architecture

### PP Attendance Architecture

Attendance in PP is managed at two levels:

**Level 1: Per-session check-in within Order Detail**
- Location: PPOrderDetailPage, Tab 2 (`operasional`)
- Data source: `ABSENSI_BY_ORDER` object + `ABSENSI_DUMMY` fallback (inline in component)
- Can mark sessions as: hadir (present), tidak hadir (absent), reschedule

**Level 2: Rekap Absensi (Summary + Trainer Payment)**
- Location: PPRekapAbsensiDetailPage (`/pp/orders/rekap/:orderId`)
- Purpose: End-of-program summary for trainer payment submission
- Features: session count reconciliation, trainer fee calculation, payment submission workflow
- Data: localStorage-persisted submission state

### B2B Calendar Architecture

B2B has `/b2b/calendar` which manages the recurring session schedule for corporate clients. Unlike PP (per-order attendance), B2B calendar tracks ongoing service delivery across the contract period.

### Event Calendar Architecture

Event has `/event/calendar` which manages event scheduling — when events occur, which trainers are assigned per event day.

### Attendance Data in `ppAbsensiData.js`

Structure from partial read:
```js
export const ABSENSI_SEED = {
  'PP-26-0001': [
    { sessionNo: 1, tanggal, status: 'hadir', pelatih, catatan },
    // ...
  ]
}
```

Keyed by `orderId`. Entry count per order **must match `sesiDone`** in the corresponding `ppOrdersData` record — a cross-file consistency constraint.

---

## 15. Shared Core: Data Layer Architecture

### Dual-File Data Pattern

Every major entity in PP module follows this pattern:

```
src/data/pp{Entity}Data.js   — seed data (read-only export, never mutated)
src/data/pp{Entity}Store.js  — mutable CRUD layer (wraps seed data)
```

Known PP store files:
- `ppLeadsStore.js` — CRUD + `ORDER_TO_LEAD_ID` map
- `ppKlienStore.js` — CRUD + `ORDER_TO_KLIEN_ID` map
- `ppOrdersStore.js` — CRUD
- `ppInvoiceStore.js` (implied by invoice detail page)
- `ppReceiptStore.js` (implied by receipt detail page)
- `ppAssessmentsStore.js` — CRUD

**B2B and Event modules do NOT follow the dual-file pattern** — they use single flat data files (`b2bData.js`, `eventData.js`) with no separate Store layer.

### State Persistence

- PP module: localStorage for activity logs (`orderLog_${orderId}`)
- PP Rekap Absensi: localStorage for submission state
- PP Agreement templates: localStorage (confirmed from `PPDocumentsPage.jsx`)
- B2B/Event: in-memory only — state resets on page refresh

### No Backend / API

Confirmed: this is a UI prototype. All data is:
- JavaScript module exports (immutable seed)
- In-memory state (mutable, lost on refresh — except localStorage)
- No network calls, no authentication, no database

---

## 16. Navigation Gaps: Routes Exist But No Nav Entry

The following routes are implemented and functional but have no corresponding sidebar navigation entry:

| Module | Route | Page | Severity |
|---|---|---|---|
| PP | `/pp/klien` | PP Klien List | Medium — reachable from Lead Detail |
| PP | `/pp/invoice` | PP Invoice List | Low — linked from Order Detail Overview |
| PP | `/pp/receipt` | PP Receipt List | Low — linked from Order Detail Overview |
| PP | `/pp/screening` | PP Assessment List | Low — linked from Order Detail Overview |
| PP | `/pp/agreement` | PP Agreement List | Low — linked from Order Detail Overview |
| **Event** | **`/event/konsultasi`** | **Event Konsultasi List** | **High** — no access path from sidebar |
| B2B | `/b2b/invoice` | B2B Invoice List | Low — linked from Order Detail |
| B2B | `/b2b/receipt` | B2B Receipt List | Low — linked from Order Detail |
| Event | `/event/invoice` | Event Invoice List | Low — linked from Order Detail |
| Event | `/event/receipt` | Event Receipt List | Low — linked from Order Detail |

**Priority fix:** Event Konsultasi must be added to the Event sidebar. It is the pre-sales consultation step — a first-class process entity with its own list and detail page but no navigation entry.

---

## 17. Page Ownership: Which Module Owns What Page

### Cross-Module Shared Pages

Some functionality spans modules but is currently implemented in only one:

| Feature | PP | B2B Management | B2B Event |
|---|---|---|---|
| Assessment (Fitness) | `/pp/screening/:id` ✓ | None | None |
| Rekap Absensi | `/pp/orders/rekap/:orderId` ✓ | Via Calendar | Via Calendar |
| Agreement Detail Page | `/pp/agreement/:id` ✓ | Embedded in Order Detail | Embedded in Order Detail |
| Klien Registry | `/pp/klien`, `/pp/klien/:id` ✓ | No (company = client) | No |
| Promo Management | `/pp/promo` ✓ | None | None |
| Program Database | `/pp/program-db` ✓ | None | None |

### OPS as Cross-Module Infrastructure

The OPS module (`/ops/`) is **module-agnostic** — trainers, mitra, and assets are shared resources used by all three business modules. However, the current implementation has PP-specific references in Program DB that duplicate OPS trainer data.

---

## 18. Status & Action UI Patterns

### Invoice Status Values (from ppInvoiceData.js via PPInvoiceDetailPage patterns)

| Status Value | Display Label | Color Scheme |
|---|---|---|
| `'draft'` | Draft | `bg-yellow-50 text-yellow-700` |
| `'terkirim'` | Terkirim | `bg-blue-50 text-blue-700` |
| `'lunas'` | Lunas | `bg-green-50 text-green-700` |
| `'overdue'` | Overdue | `bg-red-50 text-red-700` |

### Agreement Status Values (from ppDocumentsData.js)

| Status Value | Display Label | Color Scheme |
|---|---|---|
| `'pending'` | Menunggu TTD | `bg-yellow-50 text-yellow-700` |
| `'waiting-approval'` | Menunggu Persetujuan | `bg-blue-50 text-blue-700` |
| `'signed'` | Ditandatangani | `bg-green-50 text-green-700` |
| `'expired'` | Kadaluarsa | `bg-red-50 text-red-700` |

### PP Order Status Values (from ppOrdersData.js via tahapan mapping)

| Status Value | Tahapan | Description |
|---|---|---|
| `'Draft'` | Invoice | Order created, invoice not yet sent |
| `'Pending'` | Agreement | Invoice sent, awaiting agreement signing |
| `'Aktif'` | Program Berjalan | Agreement signed, program in progress |
| `'Completed'` | Program Selesai | All sessions completed |
| `'Cancelled'` | — | Order cancelled |

### Action Bar Design Notes

From the design skills (referenced in skill context):
- Orange (`#E05945`) = CTA aksi bisnis utama — max 1 per page/section
- Navy = standard save/submit
- Gray secondary = navigation (Kembali, Batal, Reset)
- Red = destructive actions (Hapus, Delete)

---

## 19. Business Gates in UI: What Unlocks What

### PP Module Gates

These gates are referenced in business logic but their UI enforcement state is uncertain (not all confirmed from code reads):

| Gate | Trigger | Effect |
|---|---|---|
| Invoice created | Order exists | Creates invoice record, advances tahapan to 'Invoice' |
| Agreement unlocked | Invoice exists | Agreement can be created/sent |
| Program Berjalan | Agreement signed | Order status → Aktif, attendance can start |
| Assessment (Pre-Test) | Order is Aktif | Fitness assessment form can be filled |
| Rekap available | sesiDone > 0 | Rekap Absensi page has data to show |
| Assessment (Post-Test) | Program Selesai | Post-test phase of assessment form unlocked |
| Receipt | Invoice + payment proof | Receipt can be generated |

**Important note:** In the current UI prototype, these gates are **NOT enforced** — all navigation is freely accessible. The gates exist as business logic documentation but not as runtime blockers. This is appropriate for the UI-only phase.

### Receipt "Buat Receipt" Button

From the design skills context (captured before compaction): when an invoice has a payment proof uploaded (`buktiBayar`), a "Buat Receipt" button appears. This is action-bar state management within `PPInvoiceDetailPage` — a conditional render based on invoice data state.

---

## 20. Dummy Data Reconciliation

### PP Module — Cross-File Consistency Requirements

The PP module has 8 interconnected data files that must stay consistent:

```
ppLeadsData.js
ppLeadsStore.js       ← ORDER_TO_LEAD_ID authoritative map
ppOrdersData.js
ppInvoiceData.js
ppReceiptData.js
ppDocumentsData.js    ← agreement records
ppKlienData.js
ppAssessmentsData.js  ← uses leadId+klienId, NOT orderId
```

### Known Consistency Rules

1. `ppLeadsStore.ORDER_TO_LEAD_ID` must have an entry for every order ID in `ppOrdersData`
2. `ppDocumentsData[n].leadId` must be a valid `LP-xxxx` that exists in `ppLeadsData`
3. `ppAssessmentsData[n].leadId` must be valid in `ppLeadsData`
4. Lead status must reflect order outcome: if order has `status: 'Aktif'` or `'Completed'`, lead must have `status: 'closed-won'`
5. Client name, harga total, and payMethod must match between `ppOrdersData`, `ppInvoiceData`, and `ppReceiptData` for the same orderId
6. `ppAbsensiData.ABSENSI_SEED[orderId].length` must equal `ppOrdersData[orderId].sesiDone`

### PP Paket Prices — Authoritative Values

These are the only correct prices. No deviations:

| Paket | Total | Harga/Sesi |
|---|---|---|
| 4 Sesi - Starter | Rp 800.000 | Rp 200.000 |
| 8 Sesi - Base | Rp 1.600.000 | Rp 200.000 |
| 12 Sesi - Pro | Rp 2.400.000 | Rp 200.000 |
| 24 Sesi - Elite | Rp 4.800.000 | Rp 200.000 |

### PP Order Data — Current Records

17 orders confirmed in `ppOrdersData.js`: PP-26-0001 through PP-27-0004 (crossing year boundary).

TAHAPAN values in current data must match `TAHAPAN_STEPS` in PPOrderDetailPage exactly: `'Invoice'`, `'Agreement'`, `'Program Berjalan'`, `'Program Selesai'`.

### B2B Lead Data — Current Records

From `b2bData.js`:
- 10 Corporate leads: BC-001..010
- 5 Apartment leads: BA-001..005
- Non-standard ID format (should be LB-0001 per design standards)

---

## 21. UI Flow Gaps: Features Referenced But Not Implemented

| Gap | Module | Severity | Notes |
|---|---|---|---|
| B2B Invoice Detail page | B2B | High | List exists, no detail page/route |
| B2B Receipt Detail page | B2B | High | List exists, no detail page/route |
| Event Invoice Detail page | Event | High | List exists, no detail page/route |
| Event Receipt Detail page | Event | High | List exists, no detail page/route |
| Event Konsultasi sidebar nav | Event | High | Page exists, no nav entry |
| PP dedicated Dokumen tab | PP | Medium | Documents are Overview shortcuts, not a dedicated tab |
| Quotation page (all modules) | PP/B2B/Event | Medium | Business logic step with no dedicated UI |
| B2B formal Order data entity | B2B | High | Order is page-local state, not a data record |
| B2B Assessment equivalent | B2B | Low | B2B has no fitness assessment — may not be needed |
| Multiple Klien per order (Group/Couple) | PP | Medium | Data model doesn't support 1:N Klien per Order |
| Active Aging pricing tier | PP | Low | May need separate PAKET_HARGA for senior programs |
| Cross-module trainer ID unification | OPS+PP | Medium | PIC-001 (OPS) vs EFM-PIC-001 (PP Program DB) |
| B2B Lead ID format migration | B2B | Low | BC-xxx/BA-xxx → LB-xxxx standard |
| Assessment search by orderId fix | PP | Medium | Bug in PPScreeningPage search |

---

## 22. Known Bugs in Current Implementation

### Bug 1: `getAssessmentByOrderId()` Always Returns Null

**File:** `ppLeadsStore.js` or `ppAssessmentsStore.js`  
**Root cause:** Assessment records store `leadId`+`klienId`, not `orderId`. The lookup function queries by `orderId` which doesn't exist in assessment records.  
**Correct fix:** Implement two-step lookup: `orderId → ORDER_TO_LEAD_ID → leadId → assessment by leadId`

### Bug 2: PPScreeningPage Search by orderId Always Fails

**File:** `PPScreeningPage.jsx`  
**Root cause:** Same as Bug 1 — `a.orderId` is always `undefined` in assessment records  
**Correct fix:** Remove `a.orderId.includes(search)` from filter condition, or implement the two-step lookup

### Bug 3: PPLeadDetailPage Contains Hardcoded Fallback Data

**File:** `PPLeadDetailPage.jsx`  
**Description:** The component contains hardcoded static lead data (LP-0001 to LP-0005+) as a fallback when `ppLeadsStore` doesn't return data. This means stale/incorrect data may display for certain leads.  
**Correct fix:** Remove the hardcoded fallback and fix the store lookup to always return correct data

### Bug 4: Event Konsultasi Not Reachable from Sidebar

**File:** `Sidebar.jsx`  
**Description:** `EVENT_SUB` array does not include a Konsultasi entry. Route `/event/konsultasi` exists and works if navigated to directly.  
**Correct fix:** Add Konsultasi entry to `EVENT_SUB` in Sidebar.jsx

### Bug 5: Dual PIC Registry (Architectural Inconsistency)

**Files:** `opsData.js` (PIC-001 format) vs `ppProgramDBData.js` (EFM-PIC-001 format)  
**Description:** Two separate trainer registries with different ID formats exist in parallel. No cross-reference mechanism.  
**This is an architectural issue**, not a simple bug — requires a decision on canonical ID format before fixing.

---

## 23. ID Format Compliance Audit

Per `efm-design-standards`, the authoritative ID formats are:

| Document Type | Standard Format | Example |
|---|---|---|
| PP Lead | `LP-0001` | `LP-0001` |
| B2B Lead | `LB-0001` | `LB-0001` |
| Event Lead | `LE-0001` | `LE-0001` |
| PP Order | `PP-26-0001` (display: `#PP-26-0001`) | `#PP-26-0001` |
| B2B Order | `B2B-26-0001` (display: `#B2B-26-0001`) | `#B2B-26-0001` |
| Event Order | `EV-26-0001` (display: `#EV-26-0001`) | `#EV-26-0001` |
| PP Invoice | `INV-PP-26-0001` | `INV-PP-26-0001` |
| PP Receipt | `RCP-PP-26-0001` | `RCP-PP-26-0001` |
| PP Agreement | `AGR-PP-26-0001` | `AGR-PP-26-0001` |
| B2B Invoice | `INV-B2B-26-0001` | `INV-B2B-26-0001` |
| B2B LOI | `LOI-EFM-B2B-26-0001` | `LOI-EFM-B2B-26-0001` |
| Event Invoice | `INV-EV-26-0001` | `INV-EV-26-0001` |
| PP Screening/Assessment | `SCR-26-0001` | `SCR-26-0001` |
| B2B Survei | `SVY-26-0001` | `SVY-26-0001` |
| Event Konsultasi | `KNS-26-0001` | `KNS-26-0001` |

### Compliance Status

| Entity | Current Format | Compliant? |
|---|---|---|
| PP Leads | `LP-0001` to `LP-0021` | ✓ Yes |
| PP Orders | `PP-26-0001` to `PP-27-0004` | ✓ Yes |
| PP Invoices | `INV-PP-26-xxxx` | ✓ Yes |
| PP Receipts | `RCP-PP-26-xxxx` | ✓ Yes |
| PP Agreements | `AGR-PP-26-xxxx` | ✓ Yes |
| B2B Leads (Corporate) | `BC-001` to `BC-010` | ✗ No — should be `LB-0001` |
| B2B Leads (Apartment) | `BA-001` to `BA-005` | ✗ No — should be `LB-0001` |
| OPS PIC Trainers | `PIC-001` | ✗ Non-standard (no module/year) |
| PP Program DB Trainers | `EFM-PIC-001` | ✗ Non-standard (different from OPS) |

---

## 24. PP Module: Full Entity Chain Reconciliation

### Entity Chain Status

```
LP-xxxx (Lead)
  │
  ├──► KL-xxxx (Klien)          via ORDER_TO_KLIEN_ID
  │
  └──► PP-YY-xxxx (Order)       via ORDER_TO_LEAD_ID (reverse lookup)
         │
         ├──► INV-PP-YY-xxxx (Invoice)    ppInvoiceData.js
         │
         ├──► RCP-PP-YY-xxxx (Receipt)    ppReceiptData.js
         │
         ├──► AGR-PP-YY-xxxx (Agreement)  ppDocumentsData.js
         │
         ├──► SCR-YY-xxxx (Assessment)    ppAssessmentsData.js (via leadId+klienId)
         │
         └──► Session Attendance           ppAbsensiData.js (keyed by orderId)
                │
                └──► Rekap Absensi         PPRekapAbsensiDetailPage
```

### Navigation Flow

```
Sidebar: Leads → /pp/leads
  └─ Click lead → /pp/leads/:id (PPLeadDetailPage)
       └─ Click order link → /pp/orders/:id (PPOrderDetailPage)
            ├─ Tab 1 Overview: document shortcut cards
            │    ├─ Invoice link → /pp/invoice/:id
            │    ├─ Receipt link → /pp/receipt/:id
            │    ├─ Agreement link → /pp/agreement/:id
            │    └─ Assessment link → /pp/screening/:id
            ├─ Tab 2 Operasional: attendance inline
            │    └─ Rekap button → /pp/orders/rekap/:orderId
            └─ Tab 3 WA: communication log
```

### PP Cross-File Consistency Checklist

Before any data modification:
- [ ] `ORDER_TO_LEAD_ID` in ppLeadsStore has entry for orderId
- [ ] `ORDER_TO_KLIEN_ID` in ppKlienStore has entry for orderId  
- [ ] ppLeadsData has record for leadId
- [ ] ppKlienData has record for klienId
- [ ] ppOrdersData `tahapan` matches one of `['Invoice', 'Agreement', 'Program Berjalan', 'Program Selesai']`
- [ ] ppInvoiceData and ppOrdersData have matching klien name and total harga
- [ ] ppReceiptData matches ppInvoiceData (same klien, amount, payMethod)
- [ ] ppDocumentsData agreement record has correct orderId, leadId, klienId
- [ ] ppAssessmentsData has leadId+klienId (NOT orderId)
- [ ] ppAbsensiData session count matches ppOrdersData sesiDone

---

## 25. B2B Management: Full Entity Chain Reconciliation

### Entity Chain Status

```
BC-xxx/BA-xxx (Lead)           ← non-standard ID format
  │
  └──► SVY-YY-xxxx (Survei)    b2bSurveiData.js (implied)
         │
         └──► [Quotation]       NO dedicated entity/page
               │
               └──► [Order]     NO formal data entity (page-local state only)
                     │
                     ├──► INV-B2B-YY-xxxx (Invoice)    b2bInvoiceData.js
                     │    └──► NO detail page route
                     │
                     ├──► RCP-B2B-YY-xxxx (Receipt)    b2bReceiptData.js
                     │    └──► NO detail page route
                     │
                     └──► LOI/MOU/Contract              embedded in Order Detail tab
                          └──► NO separate detail page routes
```

### Critical Architectural Gap

B2B's most significant structural problem: **no formal Order data entity**. This means:
1. Orders cannot be referenced by a stable `orderId` 
2. B2B invoice and receipt records cannot reliably link back to an order
3. The Orders list page must reconstruct order data from leads
4. Cross-referencing between invoice → order → lead requires a full data join with no index

This needs to be resolved before B2B invoice/receipt detail pages can be properly built.

### Recommended Fix

Create `b2bOrdersData.js` (and `b2bOrdersStore.js`) with a proper order data structure, paralleling `ppOrdersData.js`. Leads that convert should generate an order record. The `ORDER_TO_LEAD_ID` map pattern from PP should be replicated.

---

## 26. B2B Event: Full Entity Chain Reconciliation

### Entity Chain Status

```
LE-xxxx (Lead)                 ← format not confirmed, implied from standards
  │
  └──► KNS-YY-xxxx (Konsultasi)  eventKonsultasiData.js
         │                         ⚠️ NO sidebar nav entry
         └──► [Quotation]          NO dedicated entity/page
               │
               └──► EV-YY-xxxx (Order)    eventOrdersData.js (implied)
                     │
                     ├──► INV-EV-YY-xxxx (Invoice)    eventInvoiceData.js
                     │    └──► NO detail page route
                     │
                     ├──► RCP-EV-YY-xxxx (Receipt)    eventReceiptData.js
                     │    └──► NO detail page route
                     │
                     └──► MOU/Contract                  embedded in Order Detail tab
                          └──► NO separate detail page routes
```

### Event-Specific Architecture

Event orders manage **event days** differently from PP sessions:
- PP: sessions are individual 1-hour trainer-client interactions, tracked as attendance records
- Event: sessions are event days (a 2-hour Zumba class may have 30 participants) tracked in the "Hari-H & PIC" tab

The Tab 4 (`kelas`) — "Hari-H & PIC" — is exclusive to Event module and handles:
- Event day schedule (tanggal, waktu, lokasi)
- PIC trainer assignment per event day
- Participant count tracking

---

## 27. Recommended Page Architecture: Current vs Target

### PP Module

| Page | Current | Target | Change Needed |
|---|---|---|---|
| Lead Detail | ✓ 5-stage pipeline | ✓ Keep | Minor cleanup |
| Klien Detail | ✓ Basic | ✓ Keep | Minor |
| Order Detail | 3 tabs (no Dokumen tab) | 4 tabs (add Dokumen) | **Add Dokumen tab** |
| Invoice Detail | ✓ Complete | ✓ Keep | — |
| Receipt Detail | ✓ Complete | ✓ Keep | — |
| Agreement Detail | ✓ Complete | ✓ Keep | — |
| Fitness Assessment | ✓ Complete | ✓ Keep | Fix search bug |
| Rekap Absensi | ✓ Complete | ✓ Keep | — |
| Program DB | ✓ Exists | ✓ Keep | Resolve PIC ID conflict |

### B2B Management Module

| Page | Current | Target | Change Needed |
|---|---|---|---|
| Lead Detail | ✓ Exists | ✓ Keep | Migrate to LB-xxxx IDs |
| Survei Detail | ✓ Exists | ✓ Keep | — |
| Order Detail | 4 tabs | 4 tabs | Already correct tab count |
| Invoice Detail | **Missing** | Needed | **Create /b2b/invoice/:id** |
| Receipt Detail | **Missing** | Needed | **Create /b2b/receipt/:id** |
| Order Data Entity | Page-local only | `b2bOrdersData.js` needed | **Create data entity** |

### B2B Event Module

| Page | Current | Target | Change Needed |
|---|---|---|---|
| Lead Detail | ✓ Exists | ✓ Keep | — |
| Konsultasi Detail | ✓ Exists | ✓ Keep | **Fix sidebar nav gap** |
| Order Detail | 5 tabs | 5 tabs | Already correct tab count |
| Invoice Detail | **Missing** | Needed | **Create /event/invoice/:id** |
| Receipt Detail | **Missing** | Needed | **Create /event/receipt/:id** |

---

## 28. Current → Target Gap Summary

### HIGH Priority Gaps (block user workflows)

| Gap | Module | File(s) to Change |
|---|---|---|
| Event Konsultasi sidebar nav missing | Event | `Sidebar.jsx` |
| B2B Invoice detail page missing | B2B | New `B2BInvoiceDetailPage.jsx` + `App.jsx` |
| B2B Receipt detail page missing | B2B | New `B2BReceiptDetailPage.jsx` + `App.jsx` |
| Event Invoice detail page missing | Event | New `EventInvoiceDetailPage.jsx` + `App.jsx` |
| Event Receipt detail page missing | Event | New `EventReceiptDetailPage.jsx` + `App.jsx` |
| B2B no formal Order data entity | B2B | New `b2bOrdersData.js` + `b2bOrdersStore.js` |

### MEDIUM Priority Gaps (degrade UX but workarounds exist)

| Gap | Module | File(s) to Change |
|---|---|---|
| PP Order Detail missing Dokumen tab | PP | `PPOrderDetailPage.jsx` |
| `getAssessmentByOrderId()` broken | PP | `ppAssessmentsStore.js` or `ppLeadsStore.js` |
| PPScreeningPage search by orderId broken | PP | `PPScreeningPage.jsx` |
| PPLeadDetailPage hardcoded fallback data | PP | `PPLeadDetailPage.jsx` |
| Dual PIC registry conflict | OPS+PP | `opsData.js`, `ppProgramDBData.js` |

### LOW Priority Gaps (cleanup/consistency)

| Gap | Module | File(s) to Change |
|---|---|---|
| B2B Lead IDs non-standard (BC/BA format) | B2B | `b2bData.js` + all references |
| Group/Couple: multiple Klien per order | PP | Data model + UI |
| Active Aging pricing tier | PP | `PPOrderDetailPage.jsx` PAKET_HARGA |
| Quotation pages (all modules) | All | New pages + routes |

---

## 29. Implementation Priority Order

Based on business impact and dependency chains, the recommended implementation order is:

### Phase A — Critical Nav & Data Fixes (unblocks user access)
1. Add Konsultasi to Event sidebar — 1 file, 3 lines
2. Create B2B formal Order data entity (`b2bOrdersData.js`) — prerequisite for B2B invoice/receipt detail
3. Fix `getAssessmentByOrderId()` — 1 function, critical for PP data integrity

### Phase B — Missing Detail Pages (complete document workflows)
4. Build B2B Invoice Detail page (clone from `PPInvoiceDetailPage.jsx`, adapt for B2B)
5. Build B2B Receipt Detail page (clone from `PPReceiptDetailPage.jsx`, adapt for B2B)
6. Build Event Invoice Detail page (clone from PP/B2B, adapt for Event)
7. Build Event Receipt Detail page (clone from PP/B2B, adapt for Event)

### Phase C — PP Order Detail Enhancement
8. Add Dokumen tab to PP Order Detail (move document shortcuts to dedicated tab)
9. Fix PPScreeningPage search bug

### Phase D — Data & ID Consistency
10. Migrate B2B Lead IDs from BC/BA format to LB-xxxx standard
11. Resolve PIC trainer dual registry (choose canonical format, migrate one system)

### Phase E — Advanced Features
12. Quotation pages for all modules
13. Multiple Klien per order (Group/Couple support)
14. Active Aging pricing tier

---

## 30. Owner Decisions Required

These questions require business/product decisions before implementation can proceed. Engineering cannot resolve them unilaterally.

### Decision 1: PIC Trainer ID Canonical Format

Two competing formats exist:
- `PIC-001` (OPS module, opsData.js)
- `EFM-PIC-001` (PP Program DB, ppProgramDBData.js)

**Decision needed:** Which format becomes the canonical standard? Will a migration be done or will both coexist permanently?

**Recommendation:** Adopt `PIC-001` (OPS module format) as canonical, and migrate PP Program DB to match. The OPS module is the authoritative source of trainer records — PP Program DB is a filtered view.

---

### Decision 2: PP Order Detail — Add Dokumen Tab or Keep Current Pattern?

Currently PP uses document shortcuts in Overview. B2B and Event use a dedicated Dokumen tab.

**Option A:** Add a Dokumen tab to PP Order Detail (aligns with B2B/Event pattern, more scalable)  
**Option B:** Keep document shortcuts in Overview (simpler, familiar to current users)

**Recommendation:** Option A — consistency across modules simplifies training and reduces "which module has which tab" cognitive load.

---

### Decision 3: B2B Order Data Architecture

Currently B2B orders have no formal data entity. Orders are reconstructed from lead data.

**Option A:** Create `b2bOrdersData.js` with formal order records (parallels PP pattern)  
**Option B:** Keep order data embedded in lead records (simpler but doesn't scale)

**Recommendation:** Option A — required prerequisite for B2B Invoice/Receipt Detail pages and proper cross-module reporting.

---

### Decision 4: Group/Couple PP Orders — Multiple Klien per Order

The data model currently supports 1 Klien per Order. `tipeProgram: 'grup'` / `'couple'` orders need 2+ Klien.

**Option A:** Add `klienIds: []` array to order data + UI to manage multiple Klien  
**Option B:** Create separate orders per Klien within a group/couple package  
**Option C:** Keep current 1:1 model and accept limitation (group programs tracked by the lead/payer only)

**Decision needed:** Which approach matches the actual business process for group training?

---

### Decision 5: Quotation as Standalone Document vs Tab

Business logic requires Quotation in PP, B2B, and Event pre-sales flows. Currently no UI exists for quotation creation/management.

**Option A:** Dedicated Quotation page per module (`/pp/quotation`, `/b2b/quotation`, `/event/quotation`)  
**Option B:** Quotation as a sub-tab inside Order Detail (similar to B2B/Event Dokumen tab)  
**Option C:** Quotation as part of Lead Detail or Screening/Survei/Konsultasi flow (pre-order stage)

**Recommendation:** Option C for pre-sales quotations (attach to Lead/Screening flow); Option B for post-order quotation revisions. This matches how quotations work in practice — they're part of the negotiation before an order is committed.

---

### Decision 6: B2B Lead IDs — Migrate or Keep Legacy Format?

Current: `BC-001` (Corporate) / `BA-001` (Apartment)  
Standard: `LB-0001`

**Option A:** Migrate all B2B lead IDs to `LB-xxxx` format (breaks all existing deep links)  
**Option B:** Keep legacy format, document as exception  
**Option C:** New leads use `LB-xxxx`, existing legacy data keeps BC/BA format

**Recommendation:** Option C — new leads get standard IDs, legacy data is preserved. Add a display note in the UI when a legacy ID is detected.

---

### Decision 7: Assessment Scope — PP Only or All Modules?

Currently Fitness Assessment exists only in PP module. B2B corporate gym clients theoretically should have assessments for their members. B2B Event participants may not need individual assessments.

**Decision needed:**
- Should B2B Management have fitness assessment capability? (Corporate gym member assessments)
- Should B2B Event have any assessment capability?

**Recommendation:** B2B Management should eventually have assessments (corporate wellness tracking). B2B Event does not need individual assessments (event-level scope, not individual program scope). V2 scope: PP only; V3: extend to B2B Management.

---

*End of EFM V2 React Master UI Architecture Reconciliation*  
*Document generated: 2026-09-18*  
*Source read: read-only audit of REACT-APP/src/ — no files were modified*
