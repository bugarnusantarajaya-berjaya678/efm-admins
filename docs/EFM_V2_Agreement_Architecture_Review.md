# EFM V2 — Agreement Architecture Review
**Phase 1 — Read-Only Analysis**
Prepared: 18 Sep 2026 · Branch: `claude/add-claude-md-instructions-7iqjvo`
Scope: PP Module (Primary), with notes on B2B/Event gaps

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Scope & Methodology](#2-scope--methodology)
3. [File Inventory — All Agreement-Related Files](#3-file-inventory--all-agreement-related-files)
4. [FRONTEND vs REACT-APP Reconciliation](#4-frontend-vs-react-app-reconciliation)
5. [Current vs Target Architecture Gap Analysis](#5-current-vs-target-architecture-gap-analysis)
6. [Agreement Entity Model Proposal](#6-agreement-entity-model-proposal)
7. [Agreement State Machine](#7-agreement-state-machine)
8. [Full Business Flow Reconstruction](#8-full-business-flow-reconstruction)
9. [Document Generation Model](#9-document-generation-model)
10. [UI / Dummy Data Requirements](#10-ui--dummy-data-requirements)
11. [Single Source of Truth](#11-single-source-of-truth)
12. [ID Format Audit & Recommendation](#12-id-format-audit--recommendation)
13. [Active Aging Program Module Specification](#13-active-aging-program-module-specification)
14. [H&S Acknowledgement Architecture](#14-hs-acknowledgement-architecture)
15. [Clause Compliance Audit — Blanket Waiver & Liability](#15-clause-compliance-audit--blanket-waiver--liability)
16. [Data Integrity & Snapshot Locking](#16-data-integrity--snapshot-locking)
17. [Conflicts & Open Questions](#17-conflicts--open-questions)
18. [Recommended Next Steps](#18-recommended-next-steps)

---

## 1. Executive Summary

This document is a Phase 1 read-only architecture review of the EFM V2 Agreement system. It covers all agreement-related files in both the legacy FRONTEND system and the modern REACT-APP system, compares them against the target architecture described by the business owner, and audits compliance with the supplied Active Aging Agreement v2.0 specification.

**Critical findings:**

1. **BLANKET WAIVER PRESENT (Legal Risk — High):** Pasal 5 of the current REACT-APP agreement contains the clause *"PIHAK PERTAMA beserta seluruh manajemen, pelatih, dan terapis dibebaskan dari segala tuntutan hukum atas risiko yang timbul akibat kelalaian PIHAK KEDUA atau adanya kondisi medis tersembunyi."* This is a blanket liability waiver and directly contradicts the target architecture's proportional liability principle.

2. **ACTIVE AGING MODULE DOES NOT EXIST:** Zero references to Active Aging, AA-01 through AA-16 clauses, or any age-specific program module in the entire REACT-APP codebase. The AA specification supplied by the business owner has no implementation whatsoever.

3. **H&S ACKNOWLEDGEMENT STEP MISSING:** The Health & Safety Acknowledgement stage does not exist in any data file, UI page, state machine, or flow in REACT-APP.

4. **NO SNAPSHOT LOCKING:** Agreement data can be patched via `updateDoc()` at any time after signing. Company settings are pulled dynamically from `localStorage` — they are not captured at signing time. The signed document is mutable.

5. **PROGRAM MODULE CONCEPT ABSENT:** The target architecture describes a three-part document (Core Clauses + Program Module + Appendix A). The current REACT-APP implements a single flat agreement with one fixed clause set and one Lampiran A — no modular document structure.

6. **DUMMY DATA PRICE ANOMALIES (2 records):** AGR-PP-27-0002 records `harga: Rp3.200.000` and `hargaPerSesi: Rp400.000` for the 8 Sesi - Base paket (authoritative: Rp1.600.000 / Rp200.000). AGR-PP-27-0003 records `harga: Rp4.800.000` and `hargaPerSesi: Rp400.000` for 12 Sesi - Pro (authoritative: Rp2.400.000 / Rp200.000). These are real inconsistencies, not bugs in the review.

7. **FRONTEND vs REACT-APP INCOMPATIBLE:** The two systems use different ID formats, different clause structures (7 vs 12 pasal), and different data schemas. They cannot be reconciled without a migration decision.

---

## 2. Scope & Methodology

**Read-only. No code was modified. No files were created in the codebase during this review.**

### Files read in this review session:

| File | System | Purpose |
|---|---|---|
| `BACKEND/apps-script/program-db.gs` | GAS Backend | Only backend module — program catalog only |
| `FRONTEND/pp-documents.html` | Legacy | Agreement list + management page |
| `FRONTEND/pp-orders.html` | Legacy | Order management with Agreement tab |
| `FRONTEND/template-agreement.html` | Legacy | Server-side agreement template |
| `REACT-APP/src/pages/pp/PPAgreementDetailPage.jsx` | Modern | Agreement viewer + signature UI |
| `REACT-APP/src/data/ppDocumentsData.js` | Modern | 15 agreement records + status enums |
| `REACT-APP/src/data/ppDocumentsStore.js` | Modern | In-memory store for agreement CRUD |
| `REACT-APP/src/data/ppOrdersData.js` | Modern | 17 order records |
| `REACT-APP/src/data/ppAssessmentsData.js` | Modern | Fitness assessment data |
| `REACT-APP/src/utils/companySettings.js` | Modern | EFM company info (localStorage-backed) |

### Supplied specifications used as normative reference:

- Target business lifecycle: CATALOG → ORDER → MASTER AGREEMENT + PROGRAM MODULE → H&S ACKNOWLEDGEMENT → ASSIGNMENT → PROGRAM READY → SCHEDULE → ATTENDANCE
- 12 Core Clauses specification (Identitas Para Pihak → Applicable Law & E-Signature)
- Active Aging Program Module: AA-01 through AA-16 clause specification
- Active Aging Safety Principle: proportional liability, companion as primary emergency handler, no blanket waiver

### Audit approach:

For every finding, evidence is cited with file + line number or field name. Where the repository contradicts the target specification, both are shown — not silently reconciled.

---

## 3. File Inventory — All Agreement-Related Files

### 3a. BACKEND (Google Apps Script)

**`BACKEND/apps-script/program-db.gs`** (356 lines)

- Only backend module in the repository.
- No agreement-related routes, actions, or sheet references.
- Sheet definitions: `PROGRAM_DB`, `KATEGORI_PROGRAM`, `PELATIH`, `VARIAN` — no `AGREEMENTS`, `ORDERS`, `CLIENTS`, `RECEIPTS`, or `SIGNATURES` sheets.
- `setupSheets()` function exists but has never been executed; it would create the above 4 sheets only.
- **Conclusion:** Backend has zero agreement infrastructure. Any agreement data would need to be stored in a new Google Sheet.

### 3b. FRONTEND (Legacy HTML/JS System)

| File | Role | Agreement Data |
|---|---|---|
| `FRONTEND/pp-documents.html` | Agreement list + detail | Hardcoded `AGREEMENT_DB` JS array, 7 pasal |
| `FRONTEND/pp-orders.html` | Order list, includes Agreement tab in drawer | Invoice/Agreement tab UI only |
| `FRONTEND/template-agreement.html` | Document template for server-side render | `{{placeholder}}` format, 7 pasal |

**FRONTEND agreement record schema** (from `pp-documents.html` `AGREEMENT_DB`):

```js
{
  berkas_id: 'AGR-001',          // No year, no module prefix
  display_id: '#AGR-001',        // # prefix on agreement ID (incorrect per target)
  nama_klien: 'James Wilson',
  avatar_initials: 'JW',
  avatar_color: '#2980B9',
  nama_lengkap_pendaftar: 'James Wilson',
  nama_panggilan: 'James',
  no_wa: '081234567890',
  email: 'james.wilson@email.com',
  alamat_lengkap: 'Jl. Sudirman No. 12, Jakarta Pusat',
  detail_pesanan: '12 Sesi Private Training - Paket Pro',
  order_id: 'PP-8042',           // Numeric format, no year
  paket: '12 Sesi - Pro',
  namaLatihan: 'Private Training',
  no_receipt: 'RCP/EFM/PP/2026/0089',   // Slash-separated
  ref_invoice: 'INV/EFM/PP/2026/0089',  // Slash-separated
  pic: 'Sarah Jenkins',
  tgl_dibuat: '24 Okt 2026',
  status_ttd: 'signed',
  tgl_ttd: '25 Okt 2026',
}
```

**FRONTEND agreement clauses** (7 pasal — from pp-documents.html render logic):
- Pasal 1: Ruang Lingkup Layanan
- Pasal 2: Masa Berlaku
- Pasal 3: Pembatalan dan Penjadwalan Ulang
- Pasal 4: Pembayaran
- Pasal 5: Jaminan Kesehatan dan Tanggung Jawab *(contains indemnity clause)*
- Pasal 6: Non-Compete Pelatih
- Pasal 7: Hukum yang Berlaku

**FRONTEND template placeholders** (from `template-agreement.html`):

| Placeholder | Source | Notes |
|---|---|---|
| `{{nomor_dokumen}}` | `AGR-{id}` | No module prefix, no year |
| `{{nama_klien}}` | `orders.client_name` | |
| `{{order_id}}` | `orders.order_id` | |
| `{{nama_program}}` | `programs.name` | |
| `{{total_sesi}}` | `orders.total_sessions` | |
| `{{tanggal_dibuat}}` | `agreements.created_at` | |
| `{{nomor_telepon}}` | `clients.phone` | |
| `{{email_klien}}` | `clients.email` | |
| `{{tanggal_mulai}}` | `orders.start_date` | |
| `{{tanggal_habis}}` | `orders.expiry_date` | |
| `{{tanda_tangan}}` | `agreements.signature_data_url` | base64 PNG |

> **Note:** The template comment says "Render: Server-side (Node.js / PHP str_replace / Twig / EJS)" — but no such server exists in this repository. This template has never been executed in production.

### 3c. REACT-APP (Modern System — Primary Target)

| File | Role |
|---|---|
| `src/pages/pp/PPAgreementDetailPage.jsx` | Agreement viewer, SignaturePad, approval flow |
| `src/data/ppDocumentsData.js` | 15 agreement records, STATUS_LABEL, STATUS_CLS, PAKET_OPTS |
| `src/data/ppDocumentsStore.js` | In-memory CRUD: getAllDocs, getDocById, updateDoc, addDoc, getNextAgreementNo |
| `src/pages/pp/PPDocumentsPage.jsx` | Agreement list page |
| `src/utils/companySettings.js` | EFM company info (localStorage-backed, not snapshotted) |
| `src/data/ppAssessmentsData.js` | Fitness assessment records (separate from agreement) |
| `src/pages/pp/PPFitnessAssessmentPage.jsx` | Assessment UI |
| `src/pages/pp/PPScreeningPage.jsx` | Screening/health form |

**No B2B or Event agreement equivalent exists.** `B2BDocumentsPage.jsx` and `EventDocumentsPage.jsx` exist as list pages but no corresponding detail/signature pages were found for those modules.

### 3d. REACT-APP Agreement Record Schema (Full)

From `ppDocumentsData.js` DOCS_INIT:

| Field | Type | Notes |
|---|---|---|
| `id` | string | `AGR-PP-YY-XXXX` |
| `displayId` | string | Same as `id` (no `#` prefix) |
| `leadId` | string | `LP-XXXX` — links to ppLeadsData |
| `namaKlien` | string | |
| `initials`, `color` | string | Avatar UI only |
| `namaPanggilan`, `sapaan` | string | Honorific prefix |
| `noWa`, `email`, `alamat` | string | Client contact |
| `orderId` | string | `PP-YY-XXXX` — links to ppOrdersData |
| `paket` | string | e.g. `12 Sesi - Pro` |
| `harga` | string | Formatted Rupiah string |
| `masaBerlaku` | string | e.g. `60 Hari` |
| `noReceipt` | string | `RCP-PP-YY-XXXX` |
| `refInvoice` | string | `INV-PP-YY-XXXX` |
| `pic` | string | Trainer name (not ID) |
| `tglMulai`, `tglBerakhir` | string | Formatted date strings |
| `hariLatihan`, `jamLatihan` | string | Schedule |
| `lokasiLatihan` | string | |
| `hargaPerSesi`, `durasiLatihan` | string | |
| `kontakDarurat` | string | Emergency contact |
| `peralatanLatihan` | string | |
| `catatanKhusus` | string | Special notes |
| `pendaftarSamaDenganKlien` | boolean | |
| `namaWali`, `hubunganWali`, `noWaWali` | string | Guardian if applicable |
| `tipeProgram` | string | `'couple'` or `'grup'` or undefined |
| `klienList` | array | `[{id, nama, sapaan, hubungan}]` — group/couple participants |
| `tglDibuat` | string | Document creation date |
| `statusTtd` | string | `pending` / `waiting-approval` / `signed` / `expired` |
| `tglTtd` | string | Date of signature |
| `ttdMetadata` | object | `{timestamp, device, ipAddress}` |
| `approvedBy` | string | Admin who approved |
| `approvalTimestamp` | string | Admin approval time |
| `efmSignatureData` | string? | base64 PNG of EFM signature canvas |

**Missing fields vs target architecture:**
- No `programModuleType` (e.g. `standard` / `active-aging` / `therapy` / `event`)
- No `agreementVersion` or `clauseSetVersion`
- No `snapshotCompanySettings` (company info captured at signing time)
- No `snapshotPasal` (clause text captured at signing time)
- No `hnaStatus` (H&S Acknowledgement status)
- No `assignmentStatus`

---

## 4. FRONTEND vs REACT-APP Reconciliation

### 4a. ID Format Comparison

| Document | FRONTEND Format | REACT-APP Format | Compatible? |
|---|---|---|---|
| Agreement | `AGR-001` | `AGR-PP-26-0001` | ❌ No |
| Order | `PP-8042` | `PP-26-0001` | ❌ No |
| Invoice | `INV/EFM/PP/2026/0089` | `INV-PP-26-0001` | ❌ No |
| Receipt | `RCP/EFM/PP/2026/0089` | `RCP-PP-26-0001` | ❌ No |

**Conflict:** These are entirely different numbering systems. FRONTEND uses numeric sequential IDs with no year or module prefix. REACT-APP uses `[DOCTYPE]-[MODULE]-[YY]-[SEQUENCE]`. A client who has a FRONTEND `AGR-001` cannot be directly cross-referenced to REACT-APP data.

### 4b. Clause Structure Comparison

| Attribute | FRONTEND | REACT-APP |
|---|---|---|
| Number of pasal | 7 | 12 |
| Pasal 5 name | "Jaminan Kesehatan dan Tanggung Jawab" | "Jaminan Data dan Tanggung Jawab Kesehatan Mandiri" |
| Pasal 5 content | Indemnity (exact text not read in this session) | Blanket waiver **present** (line 200 of PPAgreementDetailPage.jsx) |
| Data protection (UU PDP) | Not present | Pasal 7 (Kerahasiaan dan Perlindungan Data Pribadi) |
| Force Majeure | Not present | Pasal 8 |
| Dispute resolution | Pasal 7 (brief) | Pasal 9 (detailed, BPSK reference) |
| Amendment / Severability | Not present | Pasal 11 |
| Awareness declaration | Not present | Pasal 12 (Pernyataan Kesadaran dan Persetujuan) |
| Konsiderans section | Not present | Present |
| Komparisi section | Not present | Present |

**Conflict — Which version is authoritative?** The target architecture specifies 12 Core Clauses. REACT-APP's 12 pasal are closer to the target than FRONTEND's 7 pasal. However, neither system implements the modular structure (Core Clauses + Program Module). Neither has been formally approved for legal use.

### 4c. Signature Mechanism Comparison

| Attribute | FRONTEND | REACT-APP |
|---|---|---|
| Library | `signature_pad` v4 | Custom HTML5 Canvas (not signature_pad) |
| Storage | `signature_data_url` (base64 PNG) | `efmSignatureData` (base64 PNG) |
| Client-side rendered? | Yes | Yes |
| Integrity hash | Not present | Not present |
| Timestamp source | Not confirmed | `new Date()` — local browser time, manipulable |
| Device/IP capture | Not present | `ttdMetadata.device`, `ttdMetadata.ipAddress` — simulated in dummy data |

**Critical:** In REACT-APP, IP address in `ttdMetadata` is collected client-side (simulated in dummy data). In a real implementation, IP must be captured server-side for legal validity. Current approach is legally insufficient for audit-grade evidence.

### 4d. Approval Flow Comparison

| Step | FRONTEND | REACT-APP |
|---|---|---|
| Client signature | Via `signature_pad` canvas on trainer device | Via custom canvas on trainer device |
| Submission | Button triggers status change | `handleSimulasiTtd()` → `statusTtd: 'waiting-approval'` |
| Admin approval | `Approve Agreement` button (blue) | `handleApprove()` → `statusTtd: 'signed'` |
| EFM counter-signature | Separate `Kirim Agreement ke Klien` (green) | EFM signature pad + `Simpan TTD EFM` |
| WhatsApp notification | Not confirmed | UI says "Notifikasi WhatsApp telah dikirim" — not actually wired |

### 4e. Data Fields — FRONTEND Present, REACT-APP Missing

| Field | FRONTEND | REACT-APP Status |
|---|---|---|
| `nama_lengkap_pendaftar` | Present | Replaced by `namaWali` + `pendaftarSamaDenganKlien` |
| `detail_pesanan` | Present (text description) | Not present — reconstructed from `paket` |
| `namaLatihan` | Present (e.g. "Private Training") | Not present — inferred from order |

### 4f. Fields Present in REACT-APP, Missing in FRONTEND

| Field | REACT-APP | Notes |
|---|---|---|
| `klienList` | Present | Couple/group participant list |
| `tipeProgram` | Present | `couple` / `grup` |
| `ttdMetadata` | Present | `{timestamp, device, ipAddress}` |
| `approvedBy` | Present | Admin who approved |
| `kontakDarurat` | Present | Emergency contact |
| `hargaPerSesi` | Present | |
| `durasiLatihan` | Present | |
| `peralatanLatihan` | Present | |
| `catatanKhusus` | Present | |

---

## 5. Current vs Target Architecture Gap Analysis

### 5a. Target Architecture Summary (from business owner specification)

```
CATALOG → ORDER → MASTER AGREEMENT + PROGRAM MODULE → H&S ACKNOWLEDGEMENT
        → ASSIGNMENT → PROGRAM READY → SCHEDULE → ATTENDANCE
```

**Target document structure:**
```
MASTER AGREEMENT
├── CORE CLAUSES (12 standard clauses, applies to all programs)
├── PROGRAM MODULE (specific to program type: Standard/Active Aging/Therapy/Massage/Corporate/Event)
└── APPENDIX A — ORDER SNAPSHOT (transaction data, locked at signing)
```

### 5b. Gap Table

| Architecture Node | Target | Current REACT-APP | Gap |
|---|---|---|---|
| CATALOG | Program catalog page | `ppProgramDBData.js`, `PPProgramDBPage` exists | ✅ Partial — catalog exists but not connected to agreement |
| ORDER | Order with payment | `ppOrdersData.js`, `PPOrdersPage` exists | ✅ Present |
| MASTER AGREEMENT | Core Clauses + Program Module + Appendix A | Single flat agreement, 12 pasal + Lampiran A | ⚠️ Partial — no modularity |
| PROGRAM MODULE | 6 module types selectable per order | Not implemented | ❌ Missing |
| H&S ACKNOWLEDGEMENT | Separate step, separate data entity | Not implemented anywhere | ❌ Missing |
| ASSIGNMENT | Trainer assignment after H&S | Trainer name in order (`pic`) — no formal assignment step | ⚠️ Partial — no state transition |
| PROGRAM READY | Explicit ready state before scheduling | Not implemented — goes directly to scheduling | ❌ Missing |
| SCHEDULE | Session scheduling | `ppAbsensiData.js` exists — scheduling via absensi flow | ⚠️ Partial |
| ATTENDANCE | Session attendance tracking | `ppAbsensiData.js`, `PPRekapAbsensiDetailPage.jsx` exist | ✅ Present |

### 5c. Agreement Modularity Gap

**Current (flat):**
```
Agreement { 12 fixed pasal + Lampiran A }
```

**Target (modular):**
```
Agreement {
  CoreClauses [12],           // same for all programs
  ProgramModule {              // selected per order type
    type: 'active-aging'       // or standard/therapy/massage/corporate/event
    clauses: [AA-01..AA-16]   // module-specific clauses
  },
  AppendixA { order snapshot } // locked at signing
}
```

The current Lampiran A is structurally analogous to the target Appendix A, but lacks snapshot locking.

---

## 6. Agreement Entity Model Proposal

This section proposes the target entity model based on: (1) current REACT-APP fields, (2) target architecture, (3) Active Aging specification, (4) identified gaps. This is a proposal — it does not exist in the repository.

### 6a. Core Agreement Entity

```js
{
  // Identity
  id: 'AGR-PP-27-0001',           // dash format, module-qualified, year-sequenced
  displayId: 'AGR-PP-27-0001',    // no # prefix (only Order IDs use #)
  version: 1,                      // NEW: increments on re-issue
  isSuperseded: false,             // NEW: true if a renewal replaced this

  // Links
  orderId: 'PP-27-0001',
  leadId: 'LP-0001',
  klienId: 'KL-XXXX',             // link to ppKlienData

  // Program module type — NEW
  programModuleType: 'standard',   // 'standard' | 'active-aging' | 'therapy' | 'massage' | 'corporate' | 'event'

  // Client identity (captured at signing — snapshot)
  snapshot: {
    companySettings: { ... },      // NEW: full EFM company info at signing time
    pasalList: [ ... ],            // NEW: exact clause text at signing time
    orderData: {                   // snapshot of order fields that go into Lampiran A
      paket, harga, hargaPerSesi, masaBerlaku, pic, tglMulai, tglBerakhir,
      hariLatihan, jamLatihan, lokasiLatihan, durasiLatihan,
      noReceipt, refInvoice
    },
    clientData: {                  // snapshot of client fields
      namaKlien, sapaan, noWa, email, alamat, kontakDarurat,
      namaPanggilan, pendaftarSamaDenganKlien, namaWali, hubunganWali,
      klienList, tipeProgram
    }
  },

  // Status
  statusTtd: 'pending',           // 'pending' | 'waiting-approval' | 'signed' | 'expired'
  tglDibuat: '8 Jan 2027',
  tglTtd: null,
  tglExpiry: null,                // NEW: calculated from tglDibuat + 7 days (configurable)
  tglSigned: null,                // NEW: distinct from tglTtd (client sign date)

  // Client signature
  ttdMetadata: {
    timestamp: null,              // ISO 8601 from server (not client Date())
    device: null,                 // user-agent string
    ipAddress: null,              // server-captured (not client-side)
    signatureDataUrl: null        // base64 PNG
  },

  // EFM counter-signature
  efmSignature: {
    signatureDataUrl: null,       // base64 PNG
    approvedBy: null,             // admin name
    approvalTimestamp: null,      // ISO 8601
    approverIp: null              // NEW
  },

  // H&S Acknowledgement — NEW (separate step)
  hna: {
    status: 'pending',           // 'pending' | 'completed' | 'waived'
    tglKomplet: null,
    completedBy: null,
    notes: null
  },

  // Assignment — NEW
  assignment: {
    status: 'pending',           // 'pending' | 'assigned'
    trainerName: null,
    tglAssigned: null,
    assignedBy: null
  },

  // Renewal chain
  prevAgreementId: null,         // if renewal: previous AGR-PP-XX-XXXX
  renewedById: null              // if superseded: next AGR-PP-XX-XXXX
}
```

### 6b. H&S Acknowledgement Entity (New — does not currently exist)

```js
{
  id: 'HNA-PP-27-0001',          // NEW DOCTYPE prefix: HNA
  agreementId: 'AGR-PP-27-0001',
  orderId: 'PP-27-0001',
  leadId: 'LP-0001',

  programModuleType: 'active-aging',

  declarations: [
    { code: 'AA-08', label: 'Pernyataan kondisi kesehatan mandiri', accepted: true },
    { code: 'AA-09', label: 'Informasi medis telah disampaikan', accepted: true },
    // ... per module
  ],

  companionInfo: {               // Active Aging: wajib ada
    nama: null,
    hubungan: null,
    noWa: null
  },

  completedAt: null,
  device: null,
  ipAddress: null,
  signatureDataUrl: null
}
```

---

## 7. Agreement State Machine

### 7a. Current State Machine (REACT-APP)

```
[CREATED]
    │
    ▼
 pending  ────────────────────────────────► expired
    │                                         ↑
    │ Trainer shows to client                 │ (no action within expiry window)
    ▼                                         │
waiting-approval  ───────────────────────────┘
    │
    │ Admin clicks "Approve Agreement"
    ▼
  signed  (terminal — no further transitions)
```

**State transitions in code:**
- `pending` → `waiting-approval`: `handleSimulasiTtd()` in PPAgreementDetailPage.jsx:611
- `waiting-approval` → `signed`: `handleApprove()` in PPAgreementDetailPage.jsx:615
- `pending` → `expired`: Not automated — no cron/timer job. Must be manually set or inferred from date.

**Missing transitions:**
- `signed` → renewal flow (no state for "renewal in progress")
- `expired` → re-issue (no mechanism to create a replacement)
- No cancellation state

### 7b. Proposed State Machine (Target Architecture)

```
[CREATED]
    │
    ▼
 pending ─────────────────────────────────────► expired
    │                                              ↑
    │ Client signs (on trainer device)             │ expiry_date reached
    ▼                                              │
waiting-approval ─────────────────────────────────┘
    │
    │ Admin verifies + approves
    ▼
  signed
    │  ├─────────────────────────────────────────►  cancelled  (admin action)
    │
    │ H&S Acknowledgement triggered
    ▼
hna-pending
    │
    │ Client completes H&S form
    ▼
hna-complete
    │
    │ Admin assigns trainer
    ▼
  assigned
    │
    │ Admin marks program ready
    ▼
program-ready  ──────────────────────────────────► in-program (first session)
    │
    ▼
completed  (all sessions done)
    │
    ├─ renewal-pending  (client renews → new agreement created)
    └─ closed
```

**New states required:** `hna-pending`, `hna-complete`, `assigned`, `program-ready`, `in-program`, `completed`, `cancelled`

**Key rules:**
- `signed` → `hna-pending` is automatic (not manual)
- H&S step is mandatory for Active Aging; configurable for other modules
- `program-ready` is the gate before scheduling is possible
- `expired` is set by a scheduled job, not manually

---

## 8. Full Business Flow Reconstruction

### 8a. Current Flow (Reconstructed from REACT-APP)

```
1. CATALOG       ppProgramDBData.js — program options defined
                 (not connected to order creation)

2. ORDER         PPOrdersPage → create order → ppOrdersStore
                 tahapan: 'Invoice' (first stage)

3. INVOICE       PPInvoicePage — invoice created for order
                 statusInv: 'pending' → 'paid' (on payment confirmation)

4. AGREEMENT     PPDocumentsPage → PPAgreementDetailPage
                 statusTtd: 'pending' → 'waiting-approval' → 'signed'
                 (Lampiran A auto-populated from order data)
                 tahapan in order: 'Agreement'

5. PROGRAM       PPFitnessAssessmentPage (screening/assessment)
                 statusAssessment: 'Pre-Test' → 'Post-Test Selesai'
                 (separate from agreement, no formal gate)

6. ATTENDANCE    ppAbsensiData.js — session attendance
                 PPRekapAbsensiDetailPage — summary
```

**What is missing vs target:**
- No H&S Acknowledgement between Agreement and Program start
- No Assignment step
- No Program Ready gate
- Assessment (PPFitnessAssessmentPage) is separate from the agreement/H&S flow — no formal trigger

### 8b. Target Flow (Specification)

```
1. CATALOG          Admin selects program from PPProgramDBPage
                    → programModuleType determined (standard / active-aging / etc.)

2. ORDER            Order created with programModuleType
                    tahapan: 'Order Baru'

3. INVOICE          Invoice generated, payment confirmed
                    tahapan: 'Invoice'
                    statusInv: 'paid' (gate for next step)

4. MASTER AGREEMENT Generated: Core Clauses + Program Module + Order Snapshot
                    Client signs on trainer device
                    Admin approves
                    tahapan: 'Agreement'
                    statusTtd: 'signed' (gate for H&S)

5. H&S ACKNOWLEDGEMENT
                    Triggered automatically after agreement is signed
                    Module-specific declarations (e.g. Active Aging: companion info required)
                    Can be completed by client or guardian
                    tahapan: 'H&S Acknowledgement'
                    hnaStatus: 'complete' (gate for Assignment)

6. ASSIGNMENT       Admin formally assigns trainer to order
                    tahapan: 'Assignment'
                    assignmentStatus: 'assigned' (gate for Program Ready)

7. PROGRAM READY    Admin marks program as ready to begin
                    tahapan: 'Program Ready'
                    Schedules first session

8. SCHEDULE         Session schedule entered
                    ppAbsensiData records created

9. ATTENDANCE       Session-by-session attendance
                    sesiDone increments
                    tahapan: 'Program Berjalan' → 'Program Selesai'
```

### 8c. Gap: `tahapan` Field Values

Current `tahapan` values in `ppOrdersData.js`:
```
'Invoice' | 'Agreement' | 'Program Berjalan' | 'Program Selesai'
```

Missing `tahapan` values for target flow:
```
'H&S Acknowledgement' | 'Assignment' | 'Program Ready'
```

---

## 9. Document Generation Model

### 9a. Current Model

```
AgreementDoc component (PPAgreementDetailPage.jsx)
  ├── getTemplatePasal() → localStorage.getItem('efmAgreementTemplate')
  │     └── Falls back to DEFAULT_PASAL_DETAIL if localStorage empty
  ├── getCompanySettings() → localStorage.getItem('efmCompanySettings')
  │     └── Falls back to hardcoded defaults
  └── Renders inline HTML/JSX with doc.* fields
```

**Problems with current model:**
1. Template overridable from `localStorage` at any time — a signed agreement's clauses can change if localStorage is cleared or overwritten.
2. Company settings not snapshotted — if EFM changes their address, phone, or signatory name after an agreement is signed, the rendered document will show the new data, not the data at signing time.
3. No PDF generation server — `window.print()` is used for PDF (browser print dialog). Page layout is not guaranteed consistent across browsers/devices.

### 9b. Target Document Generation Model

```
MASTER AGREEMENT = CORE_CLAUSES + PROGRAM_MODULE + APPENDIX_A

Generation trigger: Invoice status changes to 'paid'

CORE_CLAUSES:
  - 12 standard clauses (same for all programs)
  - Stored in: new clauseTemplates data source (not localStorage)
  - Versioned: clauseVersion field — changing clauses creates a new version
  - Signed agreements reference a specific clauseVersion (snapshot)

PROGRAM_MODULE:
  - Selected by: programModuleType on the order
  - PP Standard: no additional module clauses
  - Active Aging: AA-01 through AA-16 (see Section 13)
  - Therapy / Massage / Corporate / Event: TBD

APPENDIX_A (ORDER SNAPSHOT):
  - Captured at agreement creation time from order data
  - Fields: paket, harga, hargaPerSesi, masaBerlaku, tglMulai, tglBerakhir,
            hariLatihan, jamLatihan, lokasiLatihan, durasiLatihan,
            noReceipt, refInvoice, pic, klienList
  - IMMUTABLE after agreement status becomes 'signed'
  - If order data changes after signing, Appendix A does NOT update

SNAPSHOT LOCKING RULE:
  When statusTtd transitions to 'signed':
  1. Copy current companySettings → agreement.snapshot.companySettings
  2. Copy rendered pasal list → agreement.snapshot.pasalList
  3. Copy order fields → agreement.snapshot.orderData
  4. Mark agreement as locked (isLocked: true)
  5. Any subsequent updateDoc() call that touches locked fields → rejected
```

### 9c. Print/PDF Architecture

Current: `window.print()` with `@media print` CSS (PPAgreementDetailPage.jsx:636–728).

The print CSS is well-structured:
- Hides admin chrome (`no-print` class)
- Forces `#agr-print-area` to absolute position
- Forces 2-column grid for header and Lampiran A
- Sets A4 page size with 5mm margins
- Inserts page-number counter via `@page` rule
- Forces page break before Lampiran A (`break-before: page`)

This is functional for a UI-only system. For production, a server-side PDF generator (Puppeteer/Playwright headless) would produce legally consistent documents regardless of browser. Target architecture should specify which approach is required.

---

## 10. UI / Dummy Data Requirements

### 10a. Fields to Add to ppDocumentsData.js Records

When Program Module concept is implemented, the following field must be added to every record:

```js
programModuleType: 'standard',  // or 'active-aging' depending on program
```

### 10b. Data Anomalies Found — CONFLICTS, Not Review Artifacts

The following two records contain prices that conflict with the authoritative paket price table:

| Record ID | Paket | Harga in Data | Authoritative Harga | Harga/Sesi in Data | Authoritative/Sesi |
|---|---|---|---|---|---|
| `AGR-PP-27-0002` | 8 Sesi - Base | Rp3.200.000 | **Rp1.600.000** | Rp400.000 | **Rp200.000** |
| `AGR-PP-27-0003` | 12 Sesi - Pro | Rp4.800.000 | **Rp2.400.000** | Rp400.000 | **Rp200.000** |

> **This is a real data conflict.** Both records have double the standard price. The corresponding ppOrdersData.js records also show non-standard prices: PP-27-0002 (`harga: 3200000`) and PP-27-0003 (`harga: 4800000`). This may represent intentional special pricing for couple/group programs, or an error. The business rule for couple/group pricing is not documented anywhere in the repository.

### 10c. Dummy Data Requirements for New Architecture Nodes

When H&S Acknowledgement and Assignment steps are implemented, dummy data should follow this format:

| New Document | ID Format | Example |
|---|---|---|
| H&S Acknowledgement | `HNA-PP-YY-XXXX` | `HNA-PP-27-0001` |
| Program Module (if separate doc) | `PMD-PP-YY-XXXX` | `PMD-PP-27-0001` |

### 10d. Active Aging Records Required

At least 2 dummy records with `programModuleType: 'active-aging'` are needed. These should use:
- `tipeProgram: 'couple'` (per AA spec — family program)
- Companion info in `klienList` or dedicated `companionInfo` field
- `catatanKhusus` reflecting age-specific conditions (e.g. hypertension, joint pain)
- H&S Acknowledgement record with companion contact

Reference: `AGR-PP-27-0003` already has appropriate `catatanKhusus` content:
```
"Klien 1 (Suyitno): lansia 65 tahun, nyeri lutut — hindari latihan high-impact.
 Klien 2 (Sri Wahyuni): hipertensi terkontrol, konsumsi Amlodipin — pantau tekanan darah."
```
This record should be reclassified as `programModuleType: 'active-aging'` when the module is implemented.

---

## 11. Single Source of Truth

### 11a. Current Data Dependencies (PP Module)

```
ppLeadsData.js        ← lead identity, source of LP-XXXX
    ↓
ppLeadsStore.js       ← ORDER_TO_LEAD_ID mapping (Order → Lead)
    ↓
ppOrdersData.js       ← order records, linked to lead via orderId
    ↓
ppInvoiceData.js      ← invoice per order
ppReceiptData.js      ← receipt per order (after payment)
ppDocumentsData.js    ← agreement per order (SHOULD link to receipt)
    ↓
ppAssessmentsData.js  ← assessment per lead/order
ppAbsensiData.js      ← attendance per order
ppKlienData.js        ← client profile
```

### 11b. Authority Table — Where Does Each Data Point Live?

| Data Point | Authoritative Source | Also Present In (must stay in sync) |
|---|---|---|
| Client name | `ppKlienData.js` | `ppLeadsData`, `ppOrdersData`, `ppDocumentsData`, `ppInvoiceData` |
| Order ID | `ppOrdersData.js` | `ppDocumentsData.orderId`, `ppInvoiceData`, `ppReceiptData` |
| Paket / harga | `ppOrdersData.js` | `ppDocumentsData.paket/harga`, `ppInvoiceData` |
| Trainer (PIC) | `ppOrdersData.js` | `ppDocumentsData.pic`, `ppAssessmentsData.namaPelatih` |
| Receipt number | `ppReceiptData.js` | `ppDocumentsData.noReceipt` |
| Invoice number | `ppInvoiceData.js` | `ppDocumentsData.refInvoice` |
| Agreement status | `ppDocumentsData.js` | `ppOrdersData.tahapan` (partially reflects) |
| Lead ID | `ppLeadsData.js` | `ppLeadsStore.ORDER_TO_LEAD_ID`, `ppDocumentsData.leadId` |
| Company settings | `localStorage (efmCompanySettings)` | Hardcoded defaults in `companySettings.js` |

### 11c. Sync Integrity Issues Found

**Issue 1: Agreement harga diverges from Order harga for PP-27-0002 and PP-27-0003**

```
ppOrdersData: PP-27-0002.harga = 3200000
ppDocumentsData: AGR-PP-27-0002.harga = "Rp3.200.000"   ← matches
ppDocumentsData: AGR-PP-27-0002.hargaPerSesi = "Rp400.000"  ← non-standard
```
These are internally consistent between orders and documents, but both deviate from the standard paket price table.

**Issue 2: No `tahapan` value for H&S/Assignment/Ready stages**

`ppOrdersData` `tahapan` field only goes up to `'Agreement'` or `'Program Berjalan'`. The business flow requires 3 additional intermediate stages. This means `tahapan` cannot accurately represent the full lifecycle until those values are added.

**Issue 3: companySettings is NOT snapshotted in any agreement record**

`PPAgreementDetailPage.jsx:240` calls `getCompanySettings()` at render time. The company name, address, phone, and signatory name shown on a signed agreement can change if `localStorage` is updated. This means the document is not a reliable historical record.

---

## 12. ID Format Audit & Recommendation

### 12a. Current ID Inventory

| System | Agreement | Order | Invoice | Receipt | Screening |
|---|---|---|---|---|---|
| FRONTEND | `AGR-001` | `PP-8042` | `INV/EFM/PP/2026/0089` | `RCP/EFM/PP/2026/0089` | Not found |
| REACT-APP | `AGR-PP-26-0001` | `PP-26-0001` | `INV-PP-26-0001` | `RCP-PP-26-0001` | `SCR-26-0001` |
| Target (design standards) | `AGR-PP-26-0001` | `PP-26-0001` | `INV-PP-26-0001` | `RCP-PP-26-0001` | `SCR-26-0001` |

### 12b. New Document Types — Recommended IDs

| Document | Proposed Format | Example | Notes |
|---|---|---|---|
| H&S Acknowledgement | `HNA-PP-YY-XXXX` | `HNA-PP-27-0001` | New DOCTYPE `HNA` |
| Program Module (if separate doc) | `PMD-PP-YY-XXXX` | `PMD-PP-27-0001` | New DOCTYPE `PMD` |
| Agreement (renewal) | Same as `AGR-PP-YY-XXXX` | `AGR-PP-27-0005` | Version field distinguishes re-issue |

### 12c. Recommendation

REACT-APP format is authoritative. FRONTEND format is legacy and should not be adopted in new development. Any migration from FRONTEND to REACT-APP requires a mapping table.

The `#` prefix rule applies only to Order IDs. Agreement IDs (`AGR-PP-YY-XXXX`) must never be displayed with `#` prefix.

---

## 13. Active Aging Program Module Specification

### 13a. Current Implementation

**Zero.** No file in `REACT-APP/src/` contains any reference to "Active Aging", "AA-01", or age-specific program modules. The specification supplied by the business owner has no implementation.

### 13b. AA-01 through AA-16 Clause Mapping (from supplied specification)

The following are the Active Aging module clauses as specified. These must be added as a `PROGRAM_MODULE_CLAUSES.active-aging` object when the module is implemented:

| Clause | Topic | Safety Priority |
|---|---|---|
| AA-01 | Program scope — Active Aging for clients 60+ | Definition |
| AA-02 | Trainer certification requirement (ACE/NASM senior specialist) | Safety |
| AA-03 | Pre-program medical clearance process | Medical |
| AA-04 | Session intensity adaptation protocol | Safety |
| AA-05 | Low-impact exercise principles | Safety |
| AA-06 | Balance and fall prevention protocol | Safety |
| AA-07 | Cardiovascular monitoring (RPE / Karvonen) | Medical |
| AA-08 | Client health disclosure responsibility (proportional) | **Liability** |
| AA-09 | Companion/family presence policy | **Safety** |
| AA-10 | Emergency response: companion as primary handler | **Safety** |
| AA-11 | Trainer role in emergency: first aid backup, not primary | **Liability** |
| AA-12 | Session cancellation for health deterioration | Safety |
| AA-13 | Equipment safety standards for senior clients | Safety |
| AA-14 | Hydration and rest protocol | Safety |
| AA-15 | Medical equipment recommendation (no mandate) | Medical |
| AA-16 | Proportional liability — evidence of negligence required | **Liability** |

### 13c. Critical Safety Principle — Must Be Preserved

**AA-09 / AA-10 / AA-11 (Emergency Handler Chain):**
- Primary emergency handler: **Companion/family member present during session**
- Secondary backup: **Trainer** (first aid trained, not primary medical responder)
- EFM is NOT liable for medical emergencies resulting from undisclosed conditions

**AA-16 (Proportional Liability):**
> Tanggung jawab EFM hanya dapat dituntut jika ada bukti kelalaian yang dapat dibuktikan (standard of care breach). EFM tidak dapat dituntut atas risiko inheren dari aktivitas fisik bagi lansia yang telah dideklarasikan oleh klien/wali.

This is **proportional liability** — not a blanket waiver. See Section 15 for conflict with current Pasal 5.

### 13d. Companion Requirement

Active Aging program requires mandatory companion info in the agreement:
```js
companionInfo: {
  nama: 'required',
  hubungan: 'required',    // 'Anak' | 'Pasangan' | 'Saudara' | 'Pengasuh'
  noWa: 'required',
  kesediaanHadir: true     // NEW: companion agrees to be present at sessions
}
```

This is a **blocking field** — an Active Aging agreement must not proceed to H&S Acknowledgement without valid companion info.

---

## 14. H&S Acknowledgement Architecture

### 14a. Current Implementation

**Zero.** No file in `REACT-APP/src/` implements an H&S Acknowledgement step, form, page, or data entity.

`ppAssessmentsData.js` contains a `ringkasan.riwayatCedera` field and a `healthScreening` toggle — this is a fitness assessment (pre/post test), not an H&S Acknowledgement. They are different documents serving different purposes:

| | Fitness Assessment (SCR-) | H&S Acknowledgement (HNA-) |
|---|---|---|
| Purpose | Measure physical metrics (Tanita, fitness tests) | Legal declaration of health status and safety consent |
| Who fills | Trainer (with client) | Client (or guardian) |
| When | Before program starts | After agreement is signed |
| Blocking gate | No formal gate | Gate before Assignment |
| Medical involvement | Tanita measurements, fitness tests | Health disclosure, conditions declared |

### 14b. Proposed H&S Architecture

**Trigger:** Automatically triggered when `statusTtd` transitions to `signed`.

**Flow:**
```
Agreement SIGNED
     │
     ▼
HNA Created (status: 'pending')
     │
     │ Trainer presents HNA form to client
     ▼
Client completes HNA (status: 'completed')
     │
     │ (For Active Aging: verify companion info filled)
     ▼
Admin reviews HNA
     │
     ▼
HNA Approved → Assignment step unlocked
```

**Data capture per program module:**

| Field | Standard | Active Aging | Therapy | Event |
|---|---|---|---|---|
| General health declaration | ✅ | ✅ | ✅ | ✅ |
| Known medical conditions | ✅ | ✅ | ✅ | ✅ |
| Current medications | ✅ | ✅ | ✅ | Optional |
| Injury history | ✅ | ✅ | ✅ | Optional |
| Companion info | ❌ | **Mandatory** | Optional | ❌ |
| Emergency contact verification | ✅ | ✅ | ✅ | ✅ |
| Trainer specialty consent | ❌ | ACE/NASM cert confirmation | PT cert | ❌ |

---

## 15. Clause Compliance Audit — Blanket Waiver & Liability

### 15a. Pasal 5 — BLANKET WAIVER FOUND

**File:** `REACT-APP/src/pages/pp/PPAgreementDetailPage.jsx`, line 200

**Current text (Pasal 5, bullet 3):**
```
"PIHAK PERTAMA beserta seluruh manajemen, pelatih, dan terapis dibebaskan dari 
segala tuntutan hukum atas risiko yang timbul akibat kelalaian PIHAK KEDUA atau 
adanya kondisi medis tersembunyi."
```

**Why this is a blanket waiver:**
The clause exempts EFM from *all* legal claims ("segala tuntutan hukum") arising from the client's negligence OR hidden medical conditions. The phrase "dibebaskan dari segala tuntutan" is legally equivalent to a full indemnity/waiver.

**Conflict with target architecture principle:**
> "Pastikan Agreement tidak menggunakan blanket waiver seperti: 'EFM bebas dari segala tuntutan hukum.' Gunakan prinsip tanggung jawab yang proporsional."

**What proportional liability looks like (AA-16 pattern):**
```
"EFM bertanggung jawab atas kerugian atau cidera yang disebabkan oleh kelalaian 
yang dapat dibuktikan dari pelatih atau manajemen EFM dalam pelaksanaan program. 
EFM tidak bertanggung jawab atas risiko inheren dari aktivitas fisik yang telah 
diketahui dan disetujui oleh PIHAK KEDUA, atau atas kondisi medis yang tidak 
diungkapkan secara jujur oleh PIHAK KEDUA sebelum program dimulai."
```

**Verdict:** Pasal 5, bullet 3 must be rewritten before this agreement is used in production. This is a legal risk.

### 15b. Full Pasal 5 Assessment

Pasal 5 consists of 3 bullets:

| Bullet | Content | Assessment |
|---|---|---|
| 1 | Client takes full responsibility for accuracy of personal/health data provided | ✅ Appropriate |
| 2 | Client acknowledges inherent risks of physical activity and is personally responsible for their own safety | ⚠️ Needs precision — "bertanggung jawab penuh atas keselamatan dirinya" could be interpreted as waiver |
| 3 | EFM and all staff are exempt from all legal claims arising from client negligence or hidden medical conditions | ❌ **Blanket waiver — must be rewritten** |

### 15c. Other Liability-Adjacent Clauses

**Pasal 2 (Masa Berlaku), bullet 3:**
> "maka sisa sesi akan dinyatakan hangus secara otomatis"

This is operationally standard (forfeiture policy) — not a liability waiver. Acceptable.

**Pasal 3 (Pembatalan), bullet 4:**
> "sesi tersebut hangus otomatis dari total kuota"

Same — forfeiture policy, not liability waiver. Acceptable.

**Pasal 10 (Ketentuan Hukum), bullet 2:**
> "Tanda tangan elektronik dalam Perjanjian ini memiliki kekuatan hukum yang sama dengan tanda tangan basah sesuai UU ITE No. 11/2008"

✅ Correct legal reference. However, the current implementation (custom HTML5 canvas, client-side timestamp, simulated IP) would not meet UU ITE's evidentiary standard for a certified electronic signature. Functionally valid for operational use, but cannot be used as legal evidence without server-side verification.

### 15d. Missing Clause vs Target 12 Core Clauses

The target architecture specifies a 12-clause structure. Current REACT-APP has 12 pasal, but the clause names differ. Mapping:

| Target Clause | Current Pasal | Notes |
|---|---|---|
| 1. Identitas Para Pihak | Komparisi section (outside pasal numbering) | Not numbered as Pasal |
| 2. Lingkup Layanan | Pasal 1 | ✅ Match |
| 3. Durasi & Masa Berlaku | Pasal 2 | ✅ Match |
| 4. Pembayaran & Validasi Order | Pasal 4 | ✅ Match |
| 5. Pembatalan & Penjadwalan | Pasal 3 | ✅ Match (different order) |
| 6. Tanggung Jawab Kesehatan | Pasal 5 | ⚠️ Contains blanket waiver |
| 7. Kerjasama & Etika Pelatih | Pasal 6 | ✅ Match |
| 8. Kerahasiaan & Perlindungan Data | Pasal 7 | ✅ Match |
| 9. Force Majeure | Pasal 8 | ✅ Match |
| 10. Penyelesaian Perselisihan | Pasal 9 | ✅ Match |
| 11. Applicable Law & E-Signature | Pasal 10 | ✅ Match |
| 12. Perubahan & Severability | Pasal 11 | ✅ Match |
| — | Pasal 12 (Pernyataan Kesadaran) | Not in target 12-clause list — may belong in H&S Acknowledgement |

---

## 16. Data Integrity & Snapshot Locking

### 16a. Current Locking Mechanism

**None.** The `updateDoc()` function in `ppDocumentsStore.js` applies any patch to any document at any time:

```js
export function updateDoc(id, patch) {
  _store = _store.map(d => d.id === id ? { ...d, ...patch } : d)
}
```

There is no check for `statusTtd === 'signed'` before applying the patch. A signed agreement can be modified.

### 16b. Mutable Data Sources in Rendered Agreement

| Data Source | Mutable After Signing? | Risk |
|---|---|---|
| `ppDocumentsData.js` record fields | Yes (via `updateDoc()`) | Agreement content can change |
| `getCompanySettings()` (localStorage) | Yes (at any time) | Company address/name can change |
| `getTemplatePasal()` (localStorage) | Yes (at any time) | All clauses can be replaced |
| `doc.pic` (trainer name) | Yes (via order update) | Assigned trainer name changes |
| `doc.noReceipt` | Yes | Financial reference changes |

### 16c. Required Snapshot Locking Behavior

A legally valid electronic agreement must be immutable after the final party signs. The following locking approach is recommended for the production system:

1. **Snapshot trigger:** When `statusTtd` transitions from `waiting-approval` → `signed`:
   - Capture `companySettings` → `agreement.snapshot.companySettings`
   - Capture rendered `pasalList` → `agreement.snapshot.pasalList`
   - Capture all Lampiran A fields from order → `agreement.snapshot.orderData`
   - Set `isLocked: true`

2. **Read behavior after locking:** The agreement detail page reads from `snapshot.*` fields, not from live order/settings data.

3. **Edit prevention:** `updateDoc()` should reject patches to locked fields when `isLocked === true`.

4. **Audit trail:** Any administrative change after signing (e.g., correcting a typo) must be recorded as a log entry, not a silent update.

### 16d. localStorage Template Risk

`getTemplatePasal()` reads from `localStorage.getItem('efmAgreementTemplate')`. This means:

- A trainer or admin could change the agreement template in localStorage on the device
- The next time a signed agreement is opened, it will render with the new clauses
- The original signed clause text is not preserved

This is not a hypothetical risk — it is a direct consequence of the current architecture.

---

## 17. Conflicts & Open Questions

The following are genuine conflicts where the repository, the target specification, or the supplied Active Aging spec cannot be simultaneously satisfied without a decision from the business owner.

### Conflict 1: Pasal 5 Blanket Waiver vs. Proportional Liability Principle

**Evidence A (repository):** PPAgreementDetailPage.jsx:200 — "dibebaskan dari segala tuntutan hukum"
**Evidence B (target spec):** "Gunakan prinsip tanggung jawab yang proporsional"
**Resolution required:** Business owner must decide on exact replacement clause text for Pasal 5 bullet 3.

### Conflict 2: Couple/Group Pricing (PP-27-0002 and PP-27-0003)

**Evidence A (repository):** AGR-PP-27-0002 has `harga: Rp3.200.000` and `hargaPerSesi: Rp400.000` for 8 Sesi - Base.
**Evidence B (design-standards):** Authoritative 8 Sesi - Base = Rp1.600.000 / Rp200.000.
**Evidence C:** These are couple/group programs — `tipeProgram: 'couple'`. The double price may be intentional (2 clients × standard rate).
**Resolution required:** Is couple/group pricing double the individual rate? If yes, the paket price table needs a `group` variant. If no, these records contain errors.

### Conflict 3: Agreement Identity (Pihak Kedua) — Individual vs. Wali

**Evidence A (repository):** `pendaftarSamaDenganKlien: false` with `namaWali` — guardian signs on behalf of client.
**Evidence B (target architecture):** No explicit handling of guardian-signed agreements in the 12 Core Clauses.
**Question:** For Active Aging clients signed by a family member/guardian: is the family member (wali) the legal party in the agreement, or the client? The current `AgreementDoc` component renders "Wali / Pendaftar" as Pihak Kedua when `pendaftarSamaDenganKlien === false`. This is a legal distinction that must be confirmed.

### Conflict 4: FRONTEND System Status

**Evidence A:** FRONTEND has 28 HTML files with a complete (but legacy) system.
**Evidence B:** REACT-APP is the active development target.
**Question:** Is FRONTEND in active use by EFM clients/staff? If yes, does the REACT-APP architecture need to be compatible with FRONTEND data (requiring migration)? If no, can FRONTEND be frozen as a reference only?

### Conflict 5: H&S Acknowledgement Blocking Behavior

**Evidence A (target spec):** H&S is a gate between Agreement and Assignment.
**Evidence B:** The Active Aging Safety Principle says companion must be physically present at sessions — but the H&S Acknowledgement only captures companion *contact info*.
**Question:** Does "companion info required" in H&S mean: (a) companion info field must be filled, or (b) companion must physically sign the H&S form?

### Conflict 6: Pasal 12 (Pernyataan Kesadaran) — Agreement vs. H&S

**Evidence A:** Pasal 12 ("Pernyataan Kesadaran dan Persetujuan") is currently in the main agreement body.
**Evidence B:** The target architecture adds a separate H&S Acknowledgement step.
**Question:** Should Pasal 12 stay in the main agreement, or be moved to the H&S form (where it is a more natural fit as a pre-program health declaration)?

### Conflict 7: Electronic Signature Legal Standard

**Evidence A:** Pasal 10 cites UU ITE No. 11/2008 as the basis for e-signature validity.
**Evidence B:** The current implementation captures timestamp from `new Date()` (client browser) and IP from client-side code — both manipulable.
**Question:** What level of e-signature validity is required for operations? Operational (current approach sufficient) vs. judicial-grade (requires server-side timestamp, certified hash)?

### Open Question 1: Therapy and Massage Program Modules

The target architecture lists 6 program module types: Standard, Active Aging, Therapy, Massage, Corporate, Event. No specification has been supplied for Therapy, Massage, Corporate, or Event module clauses. Are these required in Phase 1 implementation?

### Open Question 2: Agreement Renewal vs. New Order

When a client completes their program and orders again, should:
(a) A new agreement be created (new AGR-PP-XX-XXXX), or
(b) The previous agreement be extended/renewed?

The `ppAssessmentsData.js` has a `prevAssessmentId` renewal chain. No equivalent exists for agreements.

---

## 18. Recommended Next Steps

### Priority 1 — Legal Risk (before any production use)

**18a. Rewrite Pasal 5 bullet 3 — Remove blanket waiver**

Replace:
```
"PIHAK PERTAMA beserta seluruh manajemen, pelatih, dan terapis dibebaskan dari 
segala tuntutan hukum atas risiko yang timbul akibat kelalaian PIHAK KEDUA atau 
adanya kondisi medis tersembunyi."
```

With proportional liability wording (AA-16 pattern):
```
"EFM bertanggung jawab atas kerugian yang disebabkan oleh kelalaian yang dapat 
dibuktikan dari pelatih atau manajemen EFM. EFM tidak bertanggung jawab atas 
risiko inheren dari aktivitas fisik yang telah diketahui dan disetujui oleh 
PIHAK KEDUA, atau atas kondisi medis yang tidak diungkapkan secara jujur sebelum 
program dimulai."
```

This is a change to `DEFAULT_PASAL_DETAIL` in `PPAgreementDetailPage.jsx`. Confirm exact text with business owner before editing.

### Priority 2 — Data Integrity

**18b. Implement snapshot locking**

In `ppDocumentsStore.js`, add:
```js
export function updateDoc(id, patch) {
  _store = _store.map(d => {
    if (d.id !== id) return d
    if (d.isLocked && hasLockedFieldConflict(patch)) {
      console.warn(`updateDoc: rejected — ${id} is locked`)
      return d
    }
    return { ...d, ...patch }
  })
}
```

And on approval, snapshot company settings and clause list into `agreement.snapshot`.

**18c. Clarify couple/group pricing**

Confirm with business owner whether `AGR-PP-27-0002` and `AGR-PP-27-0003` pricing is correct (couple = double rate) or an error. Update authoritative paket price table in design standards if couple/group has separate pricing.

### Priority 3 — Architecture Completeness

**18d. Add `programModuleType` field to ppDocumentsData.js records**

All 15 current records should have `programModuleType: 'standard'` added.
`AGR-PP-27-0003` should be reviewed for potential reclassification to `'active-aging'`.

**18e. Add `tahapan` values for H&S, Assignment, and Program Ready**

In `ppOrdersData.js`, add the following `tahapan` values:
```
'H&S Acknowledgement' | 'Assignment' | 'Program Ready'
```

**18f. Implement H&S Acknowledgement data structure**

Create `ppHnaData.js` with HNA record structure. No UI implementation required in Phase 1 — data structure only.

### Priority 4 — Active Aging Module

**18g. Create Active Aging Program Module clauses**

Create `PROGRAM_MODULES.active-aging` constant with AA-01 through AA-16 clauses. No UI integration required in Phase 1 — data structure only.

**18h. Add companionInfo field to Active Aging agreements**

Add `companionInfo: { nama, hubungan, noWa, kesediaanHadir }` to the agreement schema. Populate in the 2 Active Aging dummy records.

### Priority 5 — FRONTEND Decision

**18i. Decide FRONTEND system status**

Choose one:
- **Freeze:** FRONTEND is read-only legacy reference. New development proceeds in REACT-APP only. No data migration needed.
- **Migrate:** FRONTEND data must be migrated to REACT-APP format. ID mapping table required.

This decision unblocks the ID format question for any shared data.

### Phase 2 Work (Out of Scope for This Review)

The following require a separate Phase 2 implementation task:
- Server-side timestamp and IP capture for legally valid e-signatures
- Agreement PDF generation via headless browser (Puppeteer/Playwright)
- Active Aging H&S Acknowledgement UI page
- Clause template versioning system
- Agreement renewal chain in UI
- Program Module selection during order creation

---

*This document is a read-only architecture review. No code was modified. All findings are based on repository evidence cited with file and line number.*

*Document generated: 18 Sep 2026 · Session: EFM V2 Agreement Architecture Review / Phase 1*
