# EFM PP — PHASE 0 REPOSITORY DISCOVERY REPORT

**Status:** COMPLETE  
**Phase:** 0 — Repository Discovery  
**Mode:** READ-ONLY  
**Purpose:** Document the actual repository architecture before any PP backend implementation.  
**Generated:** 2026-09-28  
**Branch:** `claude/add-claude-md-instructions-7iqjvo`  
**Constraint:** READ-ONLY — no files created, modified, or deleted during this phase.

---

## 1. Executive Summary

The EFM V2 repository contains three coexisting systems in fundamentally different states of readiness:

- **BACKEND** (`/BACKEND/apps-script/`): One Google Apps Script file, 356 lines, covering only the Program Catalog and Coach Profile domain. Spreadsheet ID and admin token are placeholder strings — **the backend has never been deployed to a real Spreadsheet**. All transactional entities (Order, Invoice, Receipt, Agreement, Attendance, Assessment) have **zero backend coverage**.
- **FRONTEND** (`/FRONTEND/`): Legacy static HTML prototype. ID formats, terminology, and data models are incompatible with the active React app. No longer under active development.
- **REACT-APP** (`/REACT-APP/`): Active development. React 19 + Vite 8 + Tailwind CSS 3 + React Router v7. All PP module data lives exclusively in browser memory via `*Data.js` / `*Store.js` pattern. No network calls, no persistence.

**Critical prerequisite unmet:** The three authoritative specification documents referenced in this Phase 0 task (`EFM_PP_TECHNICAL_BUILD_SPECIFICATION_v1.0.md`, BATCH_1 documents 01–06, BATCH_2 documents 01–04) **do not exist in the repository**. Phase 0 discovery was conducted against existing repository files and the `docs/` folder only. Any gap analysis against those external documents must be deferred until they are committed to the repository.

**Phase 1 readiness verdict: NOT READY.** The backend has never been connected to storage. No sheet exists for any transactional entity. Four critical bugs are confirmed in existing code. No authentication or business gate logic is implemented.

---

## 2. Repository Architecture Map

```
efm-admins/
├── BACKEND/
│   └── apps-script/
│       └── program-db.gs          ← ONLY backend file (356 lines)
│           ├── setupSheets()       ← must be run manually; never executed
│           ├── doGet()             ← 13 action routes
│           ├── PROGRAM_DB          ← Sheets: defined, not deployed
│           ├── KATEGORI_PROGRAM
│           ├── PROFIL_PELATIH_PUBLIC
│           ├── PROGRAM_VARIAN_HARGA
│           └── CONFIG
│
├── FRONTEND/
│   └── [legacy HTML prototypes]   ← incompatible ID formats; not active
│
├── REACT-APP/
│   ├── package.json               ← React 19, RR v7, Vite 8, Tailwind 3
│   ├── src/
│   │   ├── App.jsx                ← React Router route definitions
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── pp/                ← PP module pages
│   │   │   ├── b2b/               ← B2B Management pages
│   │   │   └── event/             ← B2B Event pages
│   │   └── data/
│   │       ├── ppLeadsData.js + ppLeadsStore.js
│   │       ├── ppOrdersData.js + ppOrdersStore.js
│   │       ├── ppInvoiceData.js + ppInvoiceStore.js
│   │       ├── ppReceiptData.js + ppReceiptStore.js
│   │       ├── ppDocumentsData.js + ppDocumentsStore.js   ← Agreement
│   │       ├── ppAssessmentsData.js + ppAssessmentsStore.js
│   │       ├── ppKlienData.js + ppKlienStore.js
│   │       ├── ppProgramDBData.js                         ← PIC registry #1
│   │       ├── opsData.js                                 ← PIC registry #2
│   │       └── [b2b*, event* equivalents]
│   └── .claude/skills/            ← project skill files
│
├── MOCKUPS/
│   └── [static design assets]     ← visual reference only
│
└── docs/
    ├── EFM_Backend_Architecture_Audit.md    ← prior audit (18 Sep 2026)
    ├── EFM_V2_BUSINESS_ARCHITECTURE_DECISION_MATRIX.md
    ├── EFM_V2_OWNER_DECISION_RECONCILIATION.md
    └── EFM_V2_Daftar_Halaman.md
```

**Authoritative spec documents referenced in Phase 0 task — STATUS: NOT FOUND IN REPOSITORY**

- `EFM_PP_TECHNICAL_BUILD_SPECIFICATION_v1.0.md` — not present
- `EFM_PP_BATCH_1_TECHNICAL/01` through `06` — not present
- `EFM_PP_BATCH_2_PRE_CODING_LOCK/01` through `04` — not present

---

## 3. Technology Stack

### Actual Stack (verified from `REACT-APP/package.json`)

| Layer | Actual | As Documented in CLAUDE.md |
|---|---|---|
| UI Framework | React **19**.2.6 | React **18** |
| Router | React Router DOM **7**.18.0 | React Router **v6** |
| Build Tool | Vite **8**.0.12 | Vite (version unspecified) |
| CSS | Tailwind CSS **3**.4.19 | Tailwind CSS v3 ✓ |
| Icons | lucide-react 1.21.0 | ✓ |
| Testing | **NONE INSTALLED** | — |
| Backend SDK | **NONE** | — |
| State Management | Module-level `let _store` variables | — |

**npm scripts defined:**
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```
No `"test"` script is defined.

**Version conflict note:** CLAUDE.md states "React 18 + Vite + Tailwind CSS v3 + React Router v6". Actual installed versions are React 19 + React Router DOM 7. React Router v7 has API changes not yet present in the codebase (e.g., data router, Remix-style loaders) but no compatibility errors were observed during discovery.

---

## 4. Database Architecture

### Designed (Google Sheets via Google Apps Script)

| Sheet Name | Status | Purpose |
|---|---|---|
| `PROGRAM_DB` | Defined in GAS, **not deployed** | Program catalog entries |
| `KATEGORI_PROGRAM` | Defined in GAS, **not deployed** | Program categories |
| `PROFIL_PELATIH_PUBLIC` | Defined in GAS, **not deployed** | Coach profiles (public) |
| `PROGRAM_VARIAN_HARGA` | Defined in GAS, **not deployed** | Program price variants |
| `CONFIG` | Defined in GAS, **not deployed** | System configuration |

Root cause of non-deployment: `setupSheets()` in `BACKEND/apps-script/program-db.gs` must be run manually to initialize the Spreadsheet. It has never been executed because:

```javascript
const SS_ID = 'PASTE_SPREADSHEET_ID_DISINI'; // placeholder — never replaced
```

### Missing — No Sheet Defined Anywhere

| Entity | Where Data Lives Today | Sheet Required for Persistence |
|---|---|---|
| Order | `ppOrdersData.js` in-memory | `ORDER` |
| Invoice | `ppInvoiceData.js` in-memory | `INVOICE` |
| Receipt | `ppReceiptData.js` in-memory | `RECEIPT` |
| Agreement | `ppDocumentsData.js` in-memory | `AGREEMENT` |
| Health Assessment | `ppAssessmentsData.js` in-memory | `HEALTH_ASSESSMENT` |
| Assignment (PIC↔Order) | `opsData.js` in-memory | `ASSIGNMENT` |
| Attendance | `opsData.js` in-memory | `ATTENDANCE` |
| Lead | `ppLeadsData.js` in-memory | `LEAD` |
| Client | `ppKlienData.js` in-memory | `CLIENT` |
| Program Module | not in GAS at all | `PROGRAM_MODULE` |

### GAS Column Maps (from `BACKEND/apps-script/program-db.gs`)

```javascript
COL_PROGRAM (25 columns):
  id, namaLatihan, namaPaket, sesi, pertemuan, partisipan, masa,
  picId, biayaSesiPIC, harga, hargaPersesi, diskonPaket, status,
  kategori_program, pakai_ratecard_efm, deskripsi_program,
  batas_minggu, pertemuan_per_minggu, durasi_menit,
  kapasitas_min, kapasitas_max, level_kelas,
  item_tidak_termasuk, benefits, terms_condition

COL_KATEGORI (4 columns):
  id_kategori, nama_kategori, urutan_tampil, status

COL_PELATIH (6 columns):
  kode_pic, nama_lengkap, nama_panggilan, sertifikat, foto_url, status

COL_VARIAN (7 columns):
  id_varian, id_program, label_varian, harga_sebelum_diskon,
  harga_akhir, diskon_persen, harga_per_unit
```

---

## 5. Backend Architecture

### File: `BACKEND/apps-script/program-db.gs`

**Status: Placeholder / Template — Never Deployed**

```javascript
const SS_ID      = 'PASTE_SPREADSHEET_ID_DISINI';  // unset placeholder
const ADMIN_TOKEN = 'GANTI_TOKEN_RAHASIA_ADMIN';    // unset placeholder
```

`setupSheets()` initializes 5 sheets. It must be run once manually. It has never been executed because `SS_ID` is a placeholder.

### Routing (`doGet` dispatcher)

All routes are HTTP GET with `?action=` parameter. No POST, no REST-style endpoints.

**Public endpoints (no token required):**

| Action | Description |
|---|---|
| `getKategoriList` | Returns KATEGORI_PROGRAM where `status='Aktif'` (Title Case) |
| `getProgramByKategori` | Filter by kategori + `status='aktif'` (lowercase — case mismatch with above) |
| `getProgramByCoachKategori` | Filter by coach + kategori |
| `getProgramDetail` | By program id |
| `getTermsConditionGlobal` | From CONFIG sheet |

**Admin endpoints (token required):**

| Action | Description |
|---|---|
| `createKategori` | Create category |
| `updateKategori` | Update category |
| `setStatusKategori` | Toggle category status |
| `createProfilPelatih` | Create coach profile |
| `updateProfilPelatih` | Update coach profile |
| `setStatusProfilPelatih` | Toggle coach profile status |
| `updateProgramKatalog` | Update program catalog entry |
| `saveVarianHarga` | Save price variant |

### What the Backend Does NOT Cover

- Order creation, reading, updating
- Invoice generation and payment tracking
- Receipt creation
- Agreement creation, signature capture, approval workflow
- Health/fitness assessment storage
- Lead management
- Client management
- Session scheduling
- Attendance recording
- Any authentication beyond a single static `ADMIN_TOKEN` string

---

## 6. API Architecture

### Existing API Surface

- **Endpoint:** Google Apps Script Web App URL — not set; `SS_ID` is placeholder, so no deployment URL exists
- **Protocol:** HTTP GET only
- **Auth:** Single shared static `ADMIN_TOKEN` in query parameter — no per-user auth, no JWT, no session
- **Response format:** `{ status: 'success' | 'error', data: [...] }`

### API Gaps vs. Required PP Module Operations

| Required Operation | API Exists | Notes |
|---|---|---|
| Get program catalog | Defined (not deployed) | `getProgramByKategori` |
| Create/update order | ❌ MISSING | No sheet, no handler |
| Generate invoice | ❌ MISSING | No sheet, no handler |
| Confirm payment | ❌ MISSING | No sheet, no handler |
| Generate receipt | ❌ MISSING | No sheet, no handler |
| Create agreement | ❌ MISSING | No sheet, no handler |
| Capture e-signature | ❌ MISSING | No sheet, no handler |
| Store assessment | ❌ MISSING | No sheet, no handler |
| Record attendance | ❌ MISSING | No sheet, no handler |
| Lead CRUD | ❌ MISSING | No sheet, no handler |
| Client CRUD | ❌ MISSING | No sheet, no handler |

---

## 7. Existing PP Architecture

### PP Data Layer (React — `REACT-APP/src/data/`)

The PP module follows a consistent dual-file pattern for every entity:

| File Pair | Entity | Status |
|---|---|---|
| `ppLeadsData.js` + `ppLeadsStore.js` | Lead CRUD, pipeline stage | Active |
| `ppOrdersData.js` + `ppOrdersStore.js` | Order CRUD, status, tahapan | Active |
| `ppInvoiceData.js` + `ppInvoiceStore.js` | Invoice CRUD, payment status | Active |
| `ppReceiptData.js` + `ppReceiptStore.js` | Receipt CRUD | Active |
| `ppDocumentsData.js` + `ppDocumentsStore.js` | Agreement/LOI | Active |
| `ppAssessmentsData.js` + `ppAssessmentsStore.js` | Health assessment | Active |
| `ppKlienData.js` + `ppKlienStore.js` | Client profiles | Active |
| `ppProgramDBData.js` (no store) | Program catalog — read-only seed | Active |

### Active / Apparently Used

**Order Data Structure (from `ppOrdersStore.js`):**
```javascript
{
  id: "PP-27-0001",           // format: PP-YY-xxxx
  leadId: "LP-0001",
  programId: "PRG-PP-003",
  namaKlien: "James Wilson",
  paket: "12 Sesi - Pro",
  picSalesEFM: "Sarah Jenkins",
  picOpsEFM: "Sarah Jenkins",
  tahapan: "Program Berjalan",   // furthest stage reached (not current active)
  statusOrder: "Aktif",
  tipeProgram: "solo" | "couple" | "grup",
  klienIds: ["KL-0020", "KL-0021"],
  rincianLayanan: [{ id, namaItem, satuan, jumlah, total }],
  paymentTracking: [{ id, status, invoiceId }],
  quotation: { nomor: "QUO/EFM/PP/2027/0002", tanggal, status }
}
```

**Note on `tahapan`:** Reflects the furthest pipeline stage reached, not the current active stage. A future-start order with `sesiDone: 0` but a signed agreement correctly uses `tahapan: 'Agreement'`, not `'Program Berjalan'`.

### Business Gates

All business gates are **missing from the implementation**:

| Gate | Status |
|---|---|
| Assessment must exist before Order can be created | ❌ NOT IMPLEMENTED |
| Invoice must be "Lunas" before Receipt can be generated | ❌ NOT IMPLEMENTED |
| Agreement must be "signed" before Program can start | ❌ NOT IMPLEMENTED |
| H&S Acknowledgement required before first session | ❌ NOT IMPLEMENTED |
| PIC assignment required before scheduling | ❌ NOT IMPLEMENTED |
| Payment verification required before Receipt | ❌ NOT IMPLEMENTED |
| Lead stage gate (cannot skip pipeline stages) | ❌ NOT IMPLEMENTED |
| Kapasitas_min must be met before group session proceeds | ❌ NOT IMPLEMENTED |
| PKS/contract validity check for PIC assignment | ❌ NOT IMPLEMENTED |
| Program period not expired before adding sessions | ❌ NOT IMPLEMENTED |
| Order status must be "Aktif" before attendance recording | ❌ NOT IMPLEMENTED |
| Wali required for klien under 17 years old | ❌ NOT IMPLEMENTED |
| Duplicate lead check (same phone/email within 30 days) | ❌ NOT IMPLEMENTED |

### Legacy / Apparently Deprecated

The `/FRONTEND/` directory contains the legacy static HTML prototype. It is no longer under active development. ID formats, terminology, and data models are incompatible with the active React app (see Section 17).

### Unclear / Requires Verification

- **Quotation ID format:** Existing Order records contain `quotation.nomor` in format `"QUO/EFM/PP/2027/0002"` (slash-based). The `efm-design-standards` skill specifies dash-based IDs (`QUO-PP-YY-xxxx`). The full extent of this inconsistency across `ppOrdersData.js` was not verified during Phase 0 (see Section 18, CONFLICT-2).

---

## 8. PIC / Coach Architecture

### Current State: Two Separate Registries

**Registry 1: `REACT-APP/src/data/ppProgramDBData.js → PIC_DB`**

Used by: PP program assignments, order creation, invoice PIC references.

| ID Format | ID | Name | Specialty | Cost Rate (biayaSesi) |
|---|---|---|---|---|
| EFM-PIC-xxx | EFM-PIC-001 | Sarah Jenkins | Strength & Conditioning | Rp 75.000/sesi |
| EFM-PIC-xxx | EFM-PIC-002 | Marcus Chen | Functional Training | Rp 75.000/sesi |
| EFM-PIC-xxx | EFM-PIC-003 | Elena Rodriguez | Yoga & Flexibility | Rp 70.000/sesi |
| EFM-PIC-xxx | EFM-PIC-004 | David Kim | Sports Rehabilitation | Rp 80.000/sesi |
| EFM-PIC-xxx | EFM-PIC-005 | Dian Kartika | Zumba & Aerobics | Rp 75.000/sesi |
| EFM-PIC-xxx | EFM-PIC-006 | Rizky Firmansyah | HIIT & Cardio | Rp 75.000/sesi |

**Registry 2: `REACT-APP/src/data/opsData.js → picList` + `paymentList`**

Used by: Operations module, attendance, payment records.

| ID Format | ID | Name | Charge Rate (paymentList) |
|---|---|---|---|
| PIC-xxx | PIC-001 | Sarah Jenkins | Rp 150.000/sesi |
| PIC-xxx | PIC-003 | Elena Rodriguez | Rp 175.000/sesi |
| PIC-xxx | (others) | various | Rp 125.000–175.000/sesi |

**Rate discrepancy confirmed:** `ppProgramDBData.PIC_DB` records cost rates (70–80k/sesi, what EFM pays coaches). `opsData.paymentList` records charge rates (125–175k/sesi, what EFM charges clients). There is no shared canonical ID between the two registries — `EFM-PIC-xxx` and `PIC-xxx` cannot be joined without manual mapping.

**PKS expiry data error:** In `opsData.js`, Elena Rodriguez (`PIC-003`) has `tglHabisPks: '2024-06-01'` (expired June 2024) but `status: 'aktif'`. No automated expiry check exists.

**B2B / Event PIC usage:** Not separately audited during Phase 0. `opsData.js` appears to serve the Operations module shared across modules, but cross-module PIC mapping was not traced.

---

## 9. Agreement Architecture

### Agreement Data Structure (`REACT-APP/src/data/ppDocumentsData.js`)

```javascript
{
  id: 'AGR-PP-26-0001',
  displayId: 'AGR-PP-26-0001',
  leadId: 'LP-0001',
  orderId: 'PP-26-0013',
  statusTtd: 'signed',          // pending | waiting-approval | signed | expired
  ttdMetadata: {
    timestamp: '2026-01-20T10:15:00',
    device: 'iPhone 14',
    ipAddress: '...'
  },
  approvedBy: 'Bagoes Santoso',
  approvalTimestamp: '...',
  pendaftarSamaDenganKlien: true,
  namaWali: null,
  hubunganWali: null,
  noWaWali: null,
}
```

### Agreement Store (`REACT-APP/src/data/ppDocumentsStore.js`)

Auto-increment logic:
```javascript
export function getNextAgreementNo() {
  const yy = String(new Date().getFullYear()).slice(-2)
  const prefix = `AGR-PP-${yy}-`
  // auto-increments from stored data
}
```

**Critical gap — no snapshot lock on signed agreement:**
```javascript
export function updateDoc(id, patch) {
  _store = _store.map(d => d.id === id ? { ...d, ...patch } : d)
  // NO isLocked check — signed agreements can be silently modified
}
```

### H&S Acknowledgement Gap

The Health & Safety Acknowledgement exists **only as Pasal 5** (clause) within the Agreement document. It is not a separate entity:
- No dedicated H&S acknowledgement data file
- No separate signature capture for H&S
- No enforcement gate requiring H&S sign-off before first session proceeds

### Agreement Versioning / Audit Trail

- No version history mechanism exists
- `ttdMetadata` captures initial signature metadata (timestamp, device, IP)
- No change log for post-creation modifications
- All data is in-memory; lost on page refresh

---

## 10. Participant / Assessment Architecture

### Assessment Data Structure (`REACT-APP/src/data/ppAssessmentsData.js`)

```javascript
'SCR-26-0001': {
  leadId: 'LP-0001',       // links to lead
  klienId: 'KL-0001',      // links to client
  // NO orderId field
  prevAssessmentId: null,
  statusAssessment: 'Post-Test Selesai',
  tanita: {
    weight, height, bmi, bodyFat, visceralFat, muscleMass,
    bodyAge, boneMass, bmr, tbw
  },
  girths: { chest, waist, hips, thigh, arm },
  // ... fitness test fields
}
```

### Critical Bug: `getAssessmentByOrderId()` Always Returns Null

From `REACT-APP/src/data/ppAssessmentsStore.js`:
```javascript
export function getAssessmentByOrderId(orderId) {
  const entry = Object.entries(_store).find(([, a]) => a.orderId === orderId)
  return entry ? { id: entry[0], ...entry[1] } : null
}
```

**Bug:** No assessment record contains an `orderId` field. The function searches `a.orderId === orderId`, which evaluates as `undefined === orderId` → always `false` → always returns `null`.

### Participant (Client) Structure (`REACT-APP/src/data/ppKlienData.js`)

Client profiles (`KL-xxxx` IDs) are linked to orders via `klienIds: [...]` array on the order record. Client records include health profile fields; the depth of fields was not fully audited during Phase 0.

---

## 11. Session / Attendance Architecture

### Current State

No dedicated PP session or attendance data files exist:

| Expected File | Status |
|---|---|
| `ppSessionsData.js` | ❌ DOES NOT EXIST |
| `ppSessionsStore.js` | ❌ DOES NOT EXIST |
| `ppAttendanceData.js` | ❌ DOES NOT EXIST |
| `ppAttendanceStore.js` | ❌ DOES NOT EXIST |

Attendance-related data exists only in `opsData.js` (Operations module) as generic records (`picList`, `paymentList`). These are not linked to specific PP orders or sessions.

### Gap Assessment

| Required Feature | Status |
|---|---|
| Per-order session schedule | ❌ NOT IMPLEMENTED |
| Per-session attendance record (PIC present/absent) | ❌ NOT IMPLEMENTED |
| Per-session attendance record (client present/absent) | ❌ NOT IMPLEMENTED |
| `sesiDone` counter update on attendance mark | ❌ NOT IMPLEMENTED |
| Remaining session calculation | ❌ NOT IMPLEMENTED |
| Session reschedule with reason log | ❌ NOT IMPLEMENTED |
| B2B Event: PIC recap per event session | ❌ NOT IMPLEMENTED |

---

## 12. Authentication & Authorization

### Documented Design

Three roles per `docs/EFM_V2_BUSINESS_ARCHITECTURE_DECISION_MATRIX.md`: **Admin**, **Super Admin**, **Owner** — with differentiated data access scope, financial visibility, and approval authority.

### Current Implementation

| Component | Status |
|---|---|
| RBAC | ❌ NOT IMPLEMENTED |
| Login / logout | ❌ NOT IMPLEMENTED |
| Session token | ❌ NOT IMPLEMENTED |
| Route protection | ❌ NOT IMPLEMENTED |
| Per-role data filtering | ❌ NOT IMPLEMENTED |

**Backend auth:** Single static string `ADMIN_TOKEN = 'GANTI_TOKEN_RAHASIA_ADMIN'` in plaintext GAS source. This is a placeholder value that has never been changed. Any request with this token gets full admin access to all 8 write endpoints.

*Secret values are not reproduced in this report.*

---

## 13. Validation & Error Handling

### Validation

| Layer | Status |
|---|---|
| Schema validation library (Zod, Yup, etc.) | ❌ NOT INSTALLED — not in `package.json` |
| React UI-level required field checks | ✓ Present (HTML `required` + simple `if (!field)` guards) |
| Business rule validation (gate checks) | ❌ NOT IMPLEMENTED |
| Server-side input validation (GAS) | ❌ NOT IMPLEMENTED — GAS write endpoints apply no validation |

### Error Handling

| Component | Status |
|---|---|
| Global React error boundary | ❌ NOT PRESENT |
| Store functions on miss | Return `null` (not thrown errors) — callers may silently ignore |
| GAS error response | Returns `{ status: 'error', message: '...' }` JSON on exception |
| React layer to handle GAS errors | ❌ NOT PRESENT (no network calls exist yet) |

---

## 14. Audit / Logging

### Current State

An activity log UI component exists in several detail pages (Order Detail, Lead Detail) as React state:

```javascript
const [logList, setLogList] = useState([...seedLogs])
// Appended during the session via setLogList
// Lost on page refresh
```

**No persistence exists** for any audit trail:

| Audit Element | Status |
|---|---|
| `ppActivityLogData.js` or equivalent | ❌ DOES NOT EXIST |
| GAS endpoint for logging | ❌ DOES NOT EXIST |
| Append-to-sheet on financial action | ❌ DOES NOT EXIST |
| Append-to-sheet on agreement signature | ❌ DOES NOT EXIST |
| Append-to-sheet on attendance mark | ❌ DOES NOT EXIST |
| Actor tracking on writes | ❌ NOT IMPLEMENTED |
| Correlation/request IDs | ❌ NOT IMPLEMENTED |

---

## 15. Testing Architecture

### Current State

```
Test framework installed:     NONE
Test files present:           NONE
npm test script defined:      NONE
Unit tests:                   NONE
Integration tests:            NONE
E2E tests:                    NONE (Playwright is installed as devDependency
                              but no test files or playwright.config.js exist)
Existing PP tests:            NONE
Test coverage information:    Not available — no tests run
```

`package.json` devDependencies includes `"playwright": "^1.62.1"` but no test configuration or spec files were found in the repository. No `test` script is defined in `package.json`.

---

## 16. Deployment Architecture

### Local Development

```
Command: npm run dev (Vite dev server)
Location: REACT-APP/
Build verification: npm run build
```

### Production / Hosting

Per `CLAUDE.md`: "Belum ada deploy ke Vercel/production — semua perubahan cukup divalidasi lewat `npm run dev` (localhost) dan build check."

| Component | Status |
|---|---|
| `vercel.json` | ❌ NOT PRESENT in repository |
| `.env` / `.env.example` | ❌ NOT PRESENT |
| Environment variable configuration | ❌ NOT CONFIGURED |
| CI/CD pipeline | ❌ NOT CONFIGURED |
| GitHub Actions | ❌ NOT PRESENT |
| Docker | ❌ NOT PRESENT |

The domain `efm-admins.vercel.app` is referenced in `CLAUDE.md` as production but no deployment configuration file exists in the repository. Auto-deploy appears to be handled via Vercel's GitHub integration directly, but this cannot be confirmed from repository files alone.

### Backend Deployment (GAS)

Steps required but not yet performed:
1. Replace `SS_ID` with a real Google Spreadsheet ID
2. Run `setupSheets()` once to initialize sheet structure
3. Deploy as Web App via Google Apps Script IDE

None of these steps have been performed.

*No secret values are reproduced in this report.*

---

## 17. Legacy / Deprecated Components

| Component | Path | Evidence | Current Status | Risk |
|---|---|---|---|---|
| Legacy HTML prototype | `/FRONTEND/` | Static HTML files with incompatible ID formats | Deprecated — not under active development | Incompatible ID formats (`AGR-001`, `PP-8042`, `INV/EFM/PP/2026/0089`) could cause confusion if referenced during integration planning |
| Legacy Agreement ID format | `/FRONTEND/` | `AGR-001` vs `AGR-PP-26-0001` in React app | Deprecated — legacy format only | Referencing legacy IDs in any migration script would produce non-matching records |
| Legacy Invoice ID format | `/FRONTEND/` | `INV/EFM/PP/2026/0089` vs `INV-PP-26-0001` in React app | Deprecated — slash format only in legacy | Same risk as above |
| Legacy Order ID format | `/FRONTEND/` | `PP-8042` vs `PP-26-0001` in React app | Deprecated | No year/sequence alignment |

---

## 18. Architecture Conflicts

| ID | Area | Current Implementation | Expected / Locked Architecture | Evidence | Impact |
|---|---|---|---|---|---|
| CONFLICT-1 | Technology Stack | React 19.2.6 + React Router DOM 7.18.0 | CLAUDE.md documents React 18 + React Router v6 | `REACT-APP/package.json` | LOW currently; medium risk when adding v6-only third-party libraries. Documentation is out of date. |
| CONFLICT-2 | Quotation ID Format | `quotation.nomor = "QUO/EFM/PP/2027/0002"` (slash-separated) | `efm-design-standards` specifies `QUO-PP-YY-xxxx` (dash-separated) | `ppOrdersData.js` sample records | MEDIUM. Cross-referencing quotations to orders will fail if IDs are not normalized before backend integration. |
| CONFLICT-3 | Dual PIC Registry | Two registries: `EFM-PIC-xxx` (70–80k cost rates in `ppProgramDBData.js`) and `PIC-xxx` (125–175k charge rates in `opsData.js`) | Single authoritative coach registry with canonical ID, cost rate, and charge rate | `ppProgramDBData.js`, `opsData.js` | HIGH. No join key exists between the two registries. Assignment, attendance, financial reporting, and invoice line items all need the same PIC reference. |
| CONFLICT-4 | Assessment-Order Linkage | `getAssessmentByOrderId()` searches for `a.orderId`; no assessment record has an `orderId` field | Order detail pages must display linked assessment results | `ppAssessmentsStore.js`, `ppAssessmentsData.js` | HIGH. Function always returns null. Any component calling this displays empty data. |
| CONFLICT-5 | Agreement Snapshot Immutability | `updateDoc()` applies any patch to any document regardless of `statusTtd` value | Signed agreements must be immutable; mutations must be rejected or require re-signature | `ppDocumentsStore.js` | CRITICAL. A signed legal agreement can be silently overwritten with no audit trail, invalidating signature legal standing. |
| CONFLICT-6 | GAS Status Case | `getProgramByKategori` filters `p.status === 'aktif'` (lowercase); `getKategoriList` filters `k.status === 'Aktif'` (Title Case) | One canonical casing for status values | `BACKEND/apps-script/program-db.gs` | MEDIUM. Programs with `status='Aktif'` are silently excluded from `getProgramByKategori`. Categories with `status='aktif'` are silently excluded from `getKategoriList`. |
| CONFLICT-7 | Authoritative Spec Documents | `EFM_PP_TECHNICAL_BUILD_SPECIFICATION_v1.0.md`, BATCH_1 (01–06), BATCH_2 (01–04) are not in the repository | All authoritative spec documents should be version-controlled alongside the codebase | Absence confirmed during Phase 0 discovery scan | HIGH. Gap analysis cannot be performed. Implementation correctness against spec cannot be verified. |

---

## 19. Missing Components

| Area | Missing Component | Evidence | Impact |
|---|---|---|---|
| Backend — Spreadsheet Connection | `SS_ID` set to real Spreadsheet ID | `program-db.gs` line 1: placeholder string | CRITICAL — blocks all backend operations |
| Backend — Sheet Initialization | `setupSheets()` executed | Function exists but never run | CRITICAL — no sheets exist |
| Backend — Transactional Sheets | ORDER, INVOICE, RECEIPT, AGREEMENT, HEALTH_ASSESSMENT, ASSIGNMENT, ATTENDANCE, LEAD, CLIENT, PROGRAM_MODULE sheets | Absent from `setupSheets()` | CRITICAL — no persistence possible for any PP transaction |
| Backend — Transactional GAS Endpoints | Order CRUD, Invoice CRUD, Receipt CRUD, Agreement CRUD, Assessment CRUD, Attendance CRUD, Lead CRUD, Client CRUD | 0 of ~40 required endpoints exist | CRITICAL — no integration path for PP module |
| Authentication | Login / logout, session management, JWT or token auth | Nothing in `package.json` or any page file | CRITICAL for production |
| Authorization / RBAC | Role-based route guards, per-role data filtering | Nothing in `App.jsx` or any page | CRITICAL for production |
| Business Gates | All 13 workflow gates | None enforced anywhere in the codebase | HIGH — invalid workflow progressions possible |
| Agreement Snapshot Lock | `isLocked` guard in `updateDoc()` | Absent from `ppDocumentsStore.js` | HIGH — signed agreements mutable |
| Assessment orderId field | `orderId` in assessment records | Field not present in `ppAssessmentsData.js` | HIGH — `getAssessmentByOrderId()` always returns null |
| Unified PIC Registry | Single canonical coach registry | Dual registry with incompatible IDs | HIGH — financial and operational data cannot be joined |
| PP Session / Attendance Layer | `ppSessionsData.js`, `ppSessionsStore.js`, `ppAttendanceData.js`, `ppAttendanceStore.js` | Files do not exist | HIGH — no session tracking for PP orders |
| H&S Acknowledgement Entity | Separate H&S acknowledgement record | Only exists as contract clause Pasal 5 | MEDIUM |
| Activity Log Persistence | `ppActivityLogData.js` or GAS log endpoint | Only in-memory React state | MEDIUM |
| PKS Expiry Enforcement | Automated PKS expiry check | No check anywhere; Elena Rodriguez expired June 2024 | MEDIUM |
| Input Validation Library | Zod, Yup, or equivalent | Not in `package.json` | MEDIUM |
| Environment Variable Config | `.env` / `.env.example` | Not present in repository | MEDIUM |
| Testing Framework | Vitest or Jest | Not in `package.json` | LOW |
| Deployment Config | `vercel.json` | Not present in repository | LOW |
| Authoritative Spec Documents | `EFM_PP_TECHNICAL_BUILD_SPECIFICATION_v1.0.md`, BATCH_1, BATCH_2 | Not committed to repository | HIGH — implementation cannot be verified against spec |

---

## 20. Risks

### Confirmed Risks

| # | Risk | Severity | Notes |
|---|---|---|---|
| R-01 | `SS_ID` never set — backend completely non-functional | CRITICAL | Blocks all Phase 1 backend work |
| R-02 | 10 transactional sheets entirely missing from GAS | CRITICAL | Must be built before backend integration can begin |
| R-03 | Signed agreements can be silently modified (`updateDoc()` no guard) | CRITICAL | Legal/compliance risk; invalidates e-signature standing |
| R-04 | `getAssessmentByOrderId()` always returns null | HIGH | Any component using this shows empty data; assessment-order linkage is broken |
| R-05 | No authentication or authorization | HIGH | All data exposed if app is deployed publicly; currently not a risk in localhost-only state |
| R-06 | Dual PIC registry — financial calculation errors impossible to prevent | HIGH | Coach cost and client charge rates are in separate systems with no join key |
| R-07 | All PP data lost on page refresh | HIGH | Not a bug in current dev-only phase; critical before any real user handles data |
| R-08 | No business gates — invalid workflow progressions possible | HIGH | E.g., receipt can be generated before payment confirmed |
| R-09 | Authoritative spec documents not in repository | HIGH | Gap analysis and spec conformance cannot be verified |

### Potential Risks

| # | Risk | Severity | Notes |
|---|---|---|---|
| R-10 | GAS status case inconsistency (`aktif` vs `Aktif`) | MEDIUM | Programs/categories silently hidden if backend deployed as-is |
| R-11 | Elena Rodriguez PKS expired June 2024, status still `aktif` | MEDIUM | Could be assigned to new orders without warning; legal/compliance risk |
| R-12 | Quotation ID format inconsistency (slash vs dash) | MEDIUM | Cross-referencing quotations to orders fails if not normalized before integration |
| R-13 | React 19 + RR v7 vs documented v18/v6 | LOW | Risk increases when adding RR data loaders or third-party libraries with v6 peer dependency |
| R-14 | No error boundary in React app | MEDIUM | Unhandled exceptions crash entire page without user-facing error |
| R-15 | Activity log in-memory only | MEDIUM | Any audit trail requirement (financial, legal, operational) cannot be met |

### Unknown / Requires Verification

| # | Area | What Requires Verification |
|---|---|---|
| RU-01 | `ppOrdersData.js` full dataset | Full extent of quotation ID format inconsistency (`QUO/EFM/PP/...` vs `QUO-PP-YY-xxxx`) across all order records |
| RU-02 | All callers of `getAssessmentByOrderId()` | Current UI behavior when null is returned (silent empty state vs. visible error) |
| RU-03 | B2B / Event PIC cross-references | Whether `opsData.js` PIC-xxx IDs are used in B2B/Event module pages and how they relate to EFM-PIC-xxx |
| RU-04 | Vercel deployment configuration | Whether auto-deploy is configured via Vercel dashboard integration (not visible in repository files) |
| RU-05 | FRONTEND directory status | Whether any FRONTEND files are actively referenced from outside the FRONTEND directory |

---

## 21. Phase 1 Readiness Assessment

| Domain | Verdict | Factual Basis from Phase 0 |
|---|---|---|
| Backend deployment | **NOT READY** | `SS_ID` is placeholder string; `setupSheets()` never executed; backend has zero transactional sheet coverage |
| Data persistence | **NOT READY** | 10 of 15 required sheets do not exist in GAS; all PP data is browser-only |
| PP module CRUD (UI layer) | **CONDITIONAL READY** | UI and store layer exist and function; blocked on backend integration and bug fixes |
| PIC / Coach layer | **CONDITIONAL READY** | Dual registry must be resolved before backend write; charge rate and cost rate not joinable |
| Agreement / e-signature | **CONDITIONAL READY** | UI and store exist; `isLocked` guard must be added; no backend; no persistence |
| Assessment | **NOT READY** | `getAssessmentByOrderId()` is broken (always null); no `orderId` in assessment records; no backend |
| Session / Attendance | **NOT READY** | No PP-specific session or attendance data layer exists anywhere in the repository |
| Authentication | **NOT READY** | Entirely absent from the repository |
| Business gate enforcement | **NOT READY** | All 13 identified gates are missing from the implementation |
| Authoritative spec alignment | **NOT READY** | Spec documents not in repository; conformance cannot be verified |

### Overall Phase 1 Readiness: **NOT READY**

**Minimum remediation required before Phase 1 can begin:**

1. Commit all authoritative spec documents to `docs/` (BATCH_1, BATCH_2, Technical Build Spec v1.0)
2. Set `SS_ID` to a real Google Spreadsheet ID in `program-db.gs`
3. Extend `setupSheets()` to include all 10 missing transactional sheets
4. Write GAS endpoints for Order, Invoice, Receipt, Agreement, Assessment, Attendance
5. Fix `getAssessmentByOrderId()` — add `orderId` to assessment records in `ppAssessmentsData.js` and update the store lookup
6. Add `isLocked` guard to `updateDoc()` for signed agreements in `ppDocumentsStore.js`
7. Resolve dual PIC registry into a single canonical registry
8. Standardize GAS status casing to lowercase `aktif` throughout `program-db.gs`

---

## 22. Recommended Next Step

Do not begin Phase 1 coding until the following three actions are complete:

**Action 1 — Commit Specification Documents**  
Commit `EFM_PP_TECHNICAL_BUILD_SPECIFICATION_v1.0.md`, BATCH_1 (01–06), and BATCH_2 (01–04) to `docs/`. Without these, no gap analysis is possible and implementation correctness against the locked architecture cannot be verified.

**Action 2 — Owner Decision on Architecture Blockers**  
Three decisions are required from the business owner before any code is written:
- **PIC registry:** merge dual registry into one canonical structure — what is the canonical ID format (`EFM-PIC-xxx` or `PIC-xxx`)? Are cost rate and charge rate both stored per-PIC record?
- **Assessment-order linkage:** add `orderId` to assessment records, or use Lead→Order mapping as the join, or design a separate `ORDER_ASSESSMENT` join structure?
- **Authentication:** confirm target auth provider (Google OAuth via GAS service account, Firebase Auth, or custom token system)?

**Action 3 — Backend Foundation Sprint**  
Before any PP feature work, one dedicated sprint to:
1. Create the real Google Spreadsheet
2. Set `SS_ID` in `program-db.gs`
3. Run `setupSheets()` to initialize the 5 existing sheets
4. Add the 10 missing sheet definitions to `setupSheets()`
5. Write and test the minimum GAS endpoint set (Order CRUD, Invoice CRUD, Lead CRUD as the first three)
6. Fix the status casing inconsistency in `program-db.gs`

Only after all three actions are complete should Phase 1 feature development begin.

---

# PHASE 0 COMPLETION RECORD

**PHASE 0 COMPLETE — NO SOURCE FILES MODIFIED.**

| Field | Value |
|---|---|
| Report creation date | 2026-09-28 |
| Report path | `docs/efm-pp/EFM_PP_PHASE_0_REPOSITORY_DISCOVERY_REPORT.md` |
| Phase 0 status | COMPLETE |
| Source files modified | NONE |
| Application files created | NONE |
| Application files deleted | NONE |
| Commits during discovery | NONE |
| Phase 1 started | NO |

*Files inspected during Phase 0 (read-only):*
- `BACKEND/apps-script/program-db.gs`
- `REACT-APP/package.json`
- `REACT-APP/src/data/ppProgramDBData.js`
- `REACT-APP/src/data/ppOrdersData.js`
- `REACT-APP/src/data/ppOrdersStore.js`
- `REACT-APP/src/data/ppDocumentsData.js`
- `REACT-APP/src/data/ppDocumentsStore.js`
- `REACT-APP/src/data/ppAssessmentsData.js`
- `REACT-APP/src/data/ppAssessmentsStore.js`
- `REACT-APP/src/data/opsData.js`
- `docs/EFM_Backend_Architecture_Audit.md`
- `docs/EFM_V2_BUSINESS_ARCHITECTURE_DECISION_MATRIX.md`
- `docs/EFM_V2_OWNER_DECISION_RECONCILIATION.md`
