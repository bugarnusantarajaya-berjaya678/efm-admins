# EFM V2 — BUSINESS LOGIC MASTER MAP
**Phase 1D — Business Logic Consolidation & Workflow Definition**
**CV. Bugar Nusantara Jaya — Essential Fitness Management**
**Disusun: September 2026 | Status: READ-ONLY DOCUMENTATION**

---

> **IMPORTANT**: Dokumen ini adalah formalisasi hasil audit, bukan spesifikasi implementasi.
> Setiap temuan diklasifikasikan: **[BUSINESS RULE]** / **[OPERATIONAL RULE]** / **[DOCUMENT RULE]** /
> **[SYSTEM/UI RULE]** / **[CURRENT IMPL]** / **[LEGACY]** / **[INFERENCE]** / **[MISSING]**
> Do NOT modify source code based on this document alone. Owner decisions are required first.

---

## SOURCES USED

| Priority | Source | Files |
|---|---|---|
| P1 | Skills & Project Architecture | REACT-APP/.claude/skills/*, CLAUDE.md |
| P2 | Current Code (primary) | REACT-APP/src/data/*.js, App.jsx |
| P3 | Business Documentation | docs/EFM_V2_Business_Logic_Workflow_Reconstruction.md, docs/EFM_V2_Agreement_Architecture_Review.md, docs/PRD_EFM_Management_System.md |
| P4 | Legacy (reference only) | PRD_EFM_Management_System.md (original system) |

**Files read for this document:**
- ppOrdersStore.js (294 lines) — full order schema + 17 orders
- ppLeadsStore.js (188 lines) — leads, ORDER_TO_LEAD_ID map, health store
- ppLeadsData.js (49 lines) — 21 lead records
- ppOrdersData.js — list view data
- ppInvoiceData.js (239 lines) — 17 invoice records
- ppReceiptData.js (119 lines) — 15 receipt records
- ppKlienData.js (699 lines) — 29 klien records
- ppKlienStore.js (75 lines) — ORDER_TO_KLIEN_ID map, CRUD
- ppAssessmentsData.js (347 lines) — 3 assessment records
- ppAssessmentsStore.js (53 lines) — assessment CRUD
- ppDocumentsData.js (371 lines) — 13 agreement records
- ppDocumentsStore.js (35 lines) — agreement CRUD
- ppAbsensiData.js (156 lines) — attendance seed
- ppProgramDBData.js (27 lines) — 6 PICs, 7 programs
- ppProgramStore.js — program CRUD
- ppPromoData.js (117 lines) — 9 promo records (diskon + bonus)
- ppJenisStore.js — 10 service type definitions
- ppInvoiceStore.js — invoice CRUD
- ppReceiptStore.js — receipt CRUD
- attendanceData.js (39 lines) — trainer payment requests & legacy session list
- opsData.js (55 lines) — PIC list, mitra, asset, trainer payment records
- b2bData.js (230 lines) — B2B leads, clients, docs, invoices
- eventLeadsStore.js (119 lines) — 6 event leads
- eventKonsultasiStore.js (77 lines) — 5 konsultasi records
- eventQuotationsStore.js (485 lines) — 20 quotation records
- eventData.js — event docs (EV-DOC-xxx)
- dashboardData.js — dashboard aggregates
- App.jsx (188 lines) — all routes
- docs/PRD_EFM_Management_System.md — original PRD (1.0, Jun 2026)

---

## PART 1 — EFM BUSINESS ARCHITECTURE

### 1.1 Company Structure

**[BUSINESS RULE]** EFM (CV. Bugar Nusantara Jaya) operates three distinct business divisions:

```
EFM (CV. Bugar Nusantara Jaya)
├── PRIVATE PROGRAM (PP)
│   Individual/small-group fitness training
│   Customer: individual, couple, or small group (≤6)
│   Transaction: per-session package, one-time or renewable
│
├── B2B MANAGEMENT
│   Recurring gym/fitness management for corporate & apartments
│   Customer: company or apartment building (institution)
│   Transaction: monthly recurring contract
│
└── B2B EVENT
    One-off or periodic fitness events for brands/institutions
    Customer: brand, company, government, NGO, community
    Transaction: per-event project, quoted and contracted separately
```

**[BUSINESS RULE]** The three divisions are NOT interchangeable. They serve different customers, use different commercial models, require different documents, and follow different workflows.

### 1.2 Shared Core Infrastructure

**[CURRENT IMPL]** The following are shared across all modules:
- Brand identity (EFM/CV. Bugar Nusantara Jaya)
- Trainer pool (PIC — same trainers deployed across PP, B2B, and Event)
- Asset inventory (gym equipment)
- Vendor/mitra registry
- Operations payroll (trainer honorarium, submitted per trainer per period)
- Admin dashboard and authentication (single web app)

**[MISSING]** Whether there is formal shared infrastructure for client CRM across modules (e.g. if a company is both a B2B Management client AND hosts events). Current implementation treats modules fully independently.

---

## PART 2 — ACTOR / ROLE MODEL

### 2.1 EFM Internal Actors

| Actor | Who | Privileges | Owns |
|---|---|---|---|
| **Admin** | Staff pelaksana per divisi (PP, B2B, Event) | Input & view own division, generate invoice, download PDF | Cannot approve payments, cannot edit others' data, cannot see other divisions |
| **Super Admin** | Manager / Chief Divisi | All of Admin + edit/correct data in own division, approve trainer payment requests, view absensi rekap, view division statistics | Cannot configure system, cannot add/deactivate users |
| **Owner** | CEO / Direktur Utama | Full access all modules, revenue dashboard cross-division, all leads statistics, system configuration, user management | — |

**Source:** `docs/PRD_EFM_Management_System.md` section 4 (RBAC table)

**[CURRENT IMPL]** V2 React prototype has no authentication — all pages are accessible. RBAC is a documented requirement, not a built feature.

### 2.2 External Actors (PP Module)

| Actor | Who | Distinction |
|---|---|---|
| **Lead (LP-xxxx)** | Person who registers and pays for the program | May not be the person who trains. File header: "Lead (LP-xxxx) adalah pendaftar/payer." |
| **Klien (KL-xxxx)** | Person who actually trains with EFM | May be the lead, or a different person (e.g. parent pays for child) |
| **Payer** | The person financially responsible | Explicitly the Lead (LP-xxxx) in all PP transactions |
| **Participant** | The person receiving the service | The Klien (KL-xxxx) |
| **Emergency Contact** | Person to contact in emergency | Stored in ppKlienData.infoKesehatan — field not separately typed in current schema |

**[BUSINESS RULE]** Lead ≠ Klien. This is explicitly stated in code comments (ppKlienData.js header, ppKlienStore.js header). A Lead registers; a Klien trains.

**[CURRENT IMPL]** The Lead and Klien distinction is implemented in PP module. For couple/group programs, one Lead (LP-xxxx) can map to multiple Klien (KL-xxxx) — evidenced by:
- LP-0019 (Reza Putra, couple) → KL-0020 + KL-0021
- LP-0020 (Citra Anggraini, senior couple) → KL-0022 + KL-0023
- LP-0021 (Mega Wulandari, group) → KL-0024 through KL-0029 (6 klien)

**[INFERENCE]** In couple programs, the `namaKlien` in the Order and Invoice refers to the payer (Lead), while `namaKlienLatihan` and `klienIds` refer to the actual participants.

**[MISSING — OWNER DECISION REQUIRED]** Explicit role of "Guardian/Wali" — not formally modeled. PP-27-0003 (Citra Anggraini paying for parents Suyitno & Sri Wahyuni) uses `hubunganKlien: "Orang Tua"` which implies a wali scenario, but no separate Wali entity exists. `hubunganKlien` field values in data: "Diri Sendiri", "Orang Tua" — there may be others.

**[MISSING]** "Companion" as a separate entity is not implemented in current V2 code. Relevant to Active Aging programs but has no explicit schema.

### 2.3 External Actors (B2B Management)

| Actor | Who |
|---|---|
| **Company/Institution** | The contracting organization (corporate or apartment) |
| **PIC Klien** | Named contact person from the client organization |
| **Contract Signatory** | Authorized representative who signs the contract |

**[CURRENT IMPL]** B2B leads store contact as `pic` (name) + `noHp` fields — no separate entity for PIC vs signatory.

### 2.4 External Actors (B2B Event)

| Actor | Who |
|---|---|
| **Klien/Brand/Instansi** | The organization commissioning the event |
| **Koordinator** | Named event PIC from client side (`namaKoordinator`, `jabatanKoordinator`, `waKoordinator`) |
| **Authorized Representative** | Person who signs LOI/MOU/Contract |

**[CURRENT IMPL]** eventLeadsStore.js has `namaKoordinator`, `jabatanKoordinator`, `waKoordinator`, `emailKoordinator` fields on each lead.

### 2.5 Operational Actors

| Actor | Who | Evidence |
|---|---|---|
| **Trainer / PIC** | Freelance trainer assigned to a program | opsData.picList (PIC-001..PIC-008) + ppProgramDBData.PIC_DB (EFM-PIC-001..006) |
| **Sales PIC EFM** | EFM staff handling the sales relationship | `picSalesEFM` field in order — person name, not ID |
| **Ops PIC EFM** | EFM staff overseeing operational delivery | `picOpsEFM` field in order — sometimes same as Sales PIC |

**[CURRENT IMPL — KNOWN INCONSISTENCY]** Two parallel trainer registries exist:
1. `opsData.picList` — 8 trainers, IDs PIC-001..PIC-008, rate 125k-175k/sesi
2. `ppProgramDBData.PIC_DB` — 6 trainers, IDs EFM-PIC-001..006, biayaSesi 70k-80k/sesi

Same trainers appear in both with different IDs and different rate figures. This is a data duplication, not two distinct trainer populations. Rate discrepancy (70k-80k vs 125k-175k) requires owner clarification.

**[MISSING — OWNER DECISION REQUIRED]** Single authoritative trainer registry and rate structure.

---

## PART 3 — CORE ENTITY MODEL

### 3.1 Lead

**Purpose:** Initial interest record — a prospective customer who has made contact with EFM.

| Field | Source |
|---|---|
| `id` | LP-xxxx (PP), LB-xxxx (B2B Mgmt, current code: BC-xxx/BA-xxx — NON-STANDARD), LE-xxxx (B2B Event) |
| `stage` | Pipeline stage: New → Approach → Screening / Konsultasi → Quotation / Closing → Converted / Lost |
| `leadId` | Permanent, no year component |
| `klienIds[]` | PP only — link to Klien records created after closing |
| `orderIds[]` | Link to orders created from this lead |
| `screeningId` / `konsultasiId` | Link to qualification record |
| `logAktivitas[]` | Activity log (array of stage transitions + catatan) |

**[CURRENT IMPL]** `ppLeadsStore.ORDER_TO_LEAD_ID` is the authoritative mapping `{ orderId → leadId }` for PP module. ppDocumentsData and ppAssessmentsData must use leadIds from this map.

**[CURRENT IMPL]** Lead status must reflect outcome: Aktif/Completed order → `closed-won`; Cancelled order → `closed-lost`.

**[BUSINESS RULE — INFERENCE]** Lead ID is permanent and never resets. No year component. Evidenced by design standards rule: "Lead IDs are permanent — no year, never reset."

**Lifecycle:** New → Approach → Screening/Konsultasi → Quotation → Closing → **Converted** (→ creates Order) OR **Lost** (terminal).

### 3.2 Klien (PP-only concept)

**Purpose:** The person who actually trains. Distinct from the payer (Lead). A Lead can have 1-6 Klien.

| Field | Source |
|---|---|
| `id` | KL-xxxx (permanent, no year) |
| `leadId` | FK → Lead (LP-xxxx) |
| `orderIds[]` | All orders this klien is linked to (enables renewal history) |
| `assessmentIds[]` | All assessments for this klien |
| `infoKesehatan{}` | Health profile: kondisiSaatIni, riwayatCedera, tujuanProgram, obatanRutin, catatanCs, dokumenKesehatan[], sudahDiisi |

**[BUSINESS RULE]** Klien is not recreated on renewal. The same KL-xxxx carries health history, assessment history, and all order history. Renewal adds a new order to `klienIds`.

**[BUSINESS RULE — INFERENCE]** `infoKesehatan.sudahDiisi` is a completeness flag — H&S screening completeness indicator for this klien.

### 3.3 Company / Institution (B2B)

**Purpose:** The contracting organization in B2B transactions.

**[CURRENT IMPL — INFERENCE]** Not implemented as a standalone entity. Client data is stored inline within B2B lead and order records. No `Company` entity with a permanent ID exists in current V2 code.

**[MISSING — FUTURE REQUIREMENT]** A Company/Institution entity would allow tracking multiple contracts, multiple contacts, contract history, and consolidated billing across a single organization.

### 3.4 Program

**Purpose:** EFM's service offerings — the catalog of available training programs.

| Entity | Schema | Key Fields |
|---|---|---|
| Program type | ppJenisStore.JENIS_INIT | 10 service types (PP, SP, GP, FT, YT, PC, SC, NC, KF, EF) |
| Program package | ppProgramDBData.PROGRAMS_INIT | id, namaLatihan, namaPaket, sesi, pertemuan, partisipan, masa, picId, biayaSesiPIC, harga, hargaPersesi, diskonPaket, status |

**[BUSINESS RULE]** Standard PP pricing (authoritative per design standards):
- 4 Sesi Starter: Rp 800.000 (200k/sesi)
- 8 Sesi Base: Rp 1.600.000 (200k/sesi)
- 12 Sesi Pro: Rp 2.400.000 (200k/sesi)
- 24 Sesi Elite: Rp 4.800.000 (200k/sesi)

**[BUSINESS RULE]** Grup Zumba exception: 8 sesi, 6 partisipan, harga Rp 8.400.000 (175k/sesi/person × 6 = 1.050.000/sesi total), PRG-PP-005.

**[CURRENT IMPL]** Programs have a `diskonPaket` field (PRG-PP-003: 200k, PRG-PP-004: 500k) representing potential package discount. This discount is available but not automatically applied — not all invoice data reflects it.

**[BUSINESS RULE — INFERENCE]** `masa` field (30/45/60/90 hari) is the intended program duration, not a hard enforcement deadline. Current code does not enforce expiry.

### 3.5 Order

**Purpose:** The central commercial and operational object. Represents a confirmed purchase of a program package. See Part 7 for detailed analysis.

**Unique Identity:** PP-YY-XXXX | B2B-YY-XXXX | EV-YY-XXXX

**[BUSINESS RULE]** Order ID is the primary reference for all downstream operations. All other entities reference back to the Order.

### 3.6 Quotation

**Purpose:** A formal price proposal sent to the client before order confirmation.

**[CURRENT IMPL — PP]** Quotation exists as an embedded object inside Order (`order.quotation`), not as a standalone entity. Fields: `nomor` (QUO/EFM/PP/YYYY/XXXX), `tanggal`, `manajemenFee`, `manajemenFeePersen`, `pajak[]`, `status` (Approved/Pending), `catatan`.

**[CURRENT IMPL — B2B Event]** Quotation IS a standalone entity (eventQuotationsStore.js) with:
- `id`: QUO-EV-YY-XXXX
- `leadId`, `konsultasiId` links
- `items[]`: line items with qty, satuan, harga
- `pajak[]`: array of tax adjustments with `tipe` (+/-) to handle PPh deductions
- `nilaiSubtotal`, `nilaiTotal`
- `status`: Draft / Terkirim / Disetujui / Revisi / Ditolak

**[BUSINESS RULE — B2B Event]** B2B Event quotation is a proper commercial document, distinct from PP's inline quotation. It supports multiple tax types (PPN 11%, PPh 23 2%, PPh 22 1.5%) as additions (+) or deductions (-).

**[MISSING — B2B Management]** No explicit quotation entity found for B2B Management. Pricing is inline in the lead record as `nilaiEst` (estimate string, not structured).

### 3.7 Invoice

**Purpose:** Formal billing document requesting payment.

| Module | ID Format | Notes |
|---|---|---|
| PP | INV-PP-YY-XXXX | Correct per design standards |
| B2B Mgmt | INV/EFM/B2B/YYYY/XXXX | NON-STANDARD format (slash-separated, no module code abbreviation) |
| B2B Event | Not found in data | MISSING |

**[BUSINESS RULE]** Invoice is generated after order is confirmed. One invoice per order (PP), one invoice per billing period (B2B Management monthly).

**[CURRENT IMPL — PP]** Invoice fields include: `buktiPembayaran` (upload URL), `confirmedBy`, `confirmedAt`, and `status`: 'draft' | 'terkirim' | 'lunas' | 'overdue'.

### 3.8 Payment

**Purpose:** Records the actual receipt of money.

**[CURRENT IMPL — PP]** Payment tracking is embedded in Order via `paymentTracking[]` array, each entry: `{ id, periode, nominal, status, tglBayar, invoiceId }`. Status values: 'Lunas' | 'Belum' | 'Cicilan'.

**[BUSINESS RULE — INFERENCE]** Full payment is the standard for PP. Installment (cicilan) is possible — evidenced by `paymentTerms: "Per Paket"` in all current orders and `status: "Cicilan"` as a valid value in schema.

**[MISSING]** No formal record of partial payment amounts, installment schedules, or overdue calculation logic.

### 3.9 Receipt

**Purpose:** Proof of payment confirmation document.

**Unique Identity:** RCP-PP-YY-XXXX

**[CURRENT IMPL]** Receipt is generated AFTER invoice payment is confirmed. Fields include: `waStatus` (sent/not-sent/failed) — indicates WhatsApp delivery of receipt. Receipt can only exist if invoice is paid.

**[BUSINESS RULE — INFERENCE]** Receipt = confirmation that EFM has verified and accepted payment. Triggers: invoice status changed to 'lunas' → receipt can be generated.

### 3.10 Agreement (PP)

**Purpose:** Legal contract between EFM and the client for the program.

**Unique Identity:** AGR-PP-YY-XXXX

**[CURRENT IMPL]** Agreement architecture defined in docs/EFM_V2_Agreement_Architecture_Review.md. See Part 9 (Agreement Master Logic) for full details.

### 3.11 Assessment / Screening (SCR-YY-XXXX)

**Purpose:** Physical and health assessment document used for fitness baseline and progress measurement.

**[CURRENT IMPL]** Keyed by assessment ID (SCR-YY-XXXX), linked to `leadId` + `klienId`. Contains 9 measurement sections with `_awal` (pre-test) and `_akhir` (post-test) pairs.

**[CURRENT IMPL — BUG]** `getAssessmentByOrderId()` in both ppAssessmentsData.js and ppAssessmentsStore.js always returns null — assessment records have no `orderId` field. The function checks `a.orderId` which does not exist.

### 3.12 Trainer / PIC

**Purpose:** Freelance fitness trainer contracted by EFM for session delivery.

**[CURRENT IMPL — INCONSISTENCY]** Two parallel registries (see Part 2.5). PIC_DB (EFM-PIC-xxx) is used for program assignment; opsData.picList (PIC-xxx) is used for operational management.

### 3.13 Schedule, Session, Attendance

**[CURRENT IMPL]** No explicit Schedule or Session entity in PP module. Schedule is stored as order fields: `hariLatihan[]`, `jamLatihan`, `lokasiLatihan`. Attendance records are in `ppAbsensiData.ABSENSI_SEED` keyed by orderId.

See Part 14 for detailed analysis.

### 3.14 Promo

**Purpose:** Discount codes and bonus benefits applicable to PP orders.

**[CURRENT IMPL]** Two types:
1. `diskon`: reduces invoice amount — subtypes `persen` (%) or `nominal` (Rp)
2. `bonus`: non-price benefit — subtypes `treatment` (free massage), `latihan` (free session), `produk` (merchandise)

Fields: `kode`, `aktif`, `maxPemakaian`, `jumlahPemakaian`, `tanggalMulai/Berakhir`, `tema{}`, `benefitBonus`.

**[BUSINESS RULE — INFERENCE]** Promo is optional on an order. Current invoice data shows most orders have no promo applied.

---

## PART 4 — PRIVATE PROGRAM — FULL BUSINESS FLOW

### 4.1 Flow Overview

```
LEAD REGISTRATION
      ↓
  LP-xxxx created
  stage: New
      ↓
  APPROACH
  stage: Approach
      ↓
  SCREENING / CONSULTATION
  stage: Screening
  (health data, program recommendation)
      ↓
  PROGRAM & PACKAGE SELECTION
  stage: Closing
      ↓
  ORDER CREATED (PP-YY-XXXX)
  statusOrder: Aktif
  tahapan: Invoice
      ↓
  INVOICE GENERATED (INV-PP-YY-XXXX)
  status: draft → terkirim
      ↓
  PAYMENT RECEIVED + UPLOAD BUKTI BAYAR
  invoice status: terkirim → lunas
  paymentTracking[]: status → Lunas
      ↓
  RECEIPT GENERATED (RCP-PP-YY-XXXX)
  tahapan: Agreement
      ↓
  AGREEMENT GENERATED (AGR-PP-YY-XXXX)
  statusTtd: pending
      ↓
  CLIENT SIGNS AGREEMENT
  statusTtd: waiting-approval
      ↓
  EFM ADMIN APPROVES
  statusTtd: signed
  tahapan: H&S / Assessment
      ↓
  KLIEN HEALTH DATA FILLED
  infoKesehatan.sudahDiisi: true
      ↓
  ASSESSMENT PRE-TEST (SCR-YY-XXXX)
  statusAssessment: Pre-Test Selesai
  tahapan: Program Berjalan
      ↓
  TRAINER ASSIGNMENT (picOpsEFM in order)
  schedule set: hariLatihan, jamLatihan, lokasiLatihan
      ↓
  PROGRAM RUNNING
  attendance recorded (ABSENSI_SEED[orderId])
  sesiDone increments
      ↓
  ASSESSMENT POST-TEST
  statusAssessment: Post-Test Selesai
      ↓
  PROGRAM COMPLETE
  statusOrder: Completed
  tahapan: Selesai
      ↓
  RENEWAL OFFER
      ↓ (if accepted)
  NEW ORDER created (PP-YY-XXXX, new sequence)
  prevAssessmentId links old → new assessment
```

### 4.2 Step-by-Step Analysis

#### Step 1: Lead Registration
- **WHO:** EFM Admin (Sales)
- **WHAT triggers it:** Client inquiry (walk-in, referral, social media, ads)
- **WHAT is created:** Lead record (LP-xxxx), stage: 'New'
- **WHAT must already exist:** Nothing
- **STATUS CHANGE:** Lead.stage = 'New'
- **NEXT STEP:** Approach

#### Step 2: Approach
- **WHO:** EFM Admin (Sales)
- **WHAT:** Contact attempt, send company profile, initial needs discussion
- **WHAT is created:** Activity log entry in `logAktivitas[]`
- **STATUS CHANGE:** Lead.stage = 'Approach'

#### Step 3: Screening / Consultation
- **WHO:** EFM Admin or Sales
- **WHAT:** Deeper needs assessment, health discussion, program recommendation
- **WHAT is created:** Optional — health info may be pre-collected here and stored in infoKesehatan
- **STATUS CHANGE:** Lead.stage = 'Screening' (PP uses 'Screening'; B2B Event uses 'Konsultasi' stage)

#### Step 4: Program & Package Selection
- **WHO:** EFM Admin / Sales
- **WHAT:** Client selects program (Private Training, Yoga, etc.) and package (4/8/12/24 sesi)
- **STATUS CHANGE:** Lead.stage = 'Closing'

#### Step 5: Order Creation
- **WHO:** EFM Admin
- **WHAT triggers it:** Lead status 'Closing' with confirmed program selection
- **PRECONDITION:** Lead exists and is at Closing stage
- **WHAT is created:** Order (PP-YY-XXXX) with statusOrder: 'Aktif', tahapan: 'Invoice'
- **KEY FIELDS SET:** programId, namaKlien, paket, picSalesEFM, picOpsEFM, nilaiKontrak, paymentTerms, quotation{}
- **STATUS CHANGE:** Lead.stage → 'Converted', Lead.status → 'closed-won', Lead.orderIds[] += new orderId
- **[CURRENT IMPL — NO GATE]** No gate checks programId validity, PIC availability, or lead stage before order creation.

#### Step 6: Invoice Generation
- **WHO:** EFM Admin
- **WHAT triggers it:** Order created
- **PRECONDITION:** Order exists with statusOrder: 'Aktif'
- **WHAT is created:** Invoice (INV-PP-YY-XXXX) with status: 'draft' or 'terkirim'
- **KEY FIELDS:** invNo, orderId, namaKlien, paket, total, kodePromo (optional), appliedDiscount (optional)
- **[CURRENT IMPL — NO GATE]** No gate enforces that invoice can only be created once per order.

#### Step 7: Payment Receipt & Confirmation
- **WHO:** Client uploads bukti bayar; EFM Admin confirms
- **WHAT:** Client sends payment proof → EFM verifies → marks invoice as 'lunas'
- **INVOICE STATUS CHANGE:** 'terkirim' → 'lunas'
- **ORDER CHANGE:** paymentTracking[].status → 'Lunas', tglBayar set, invoiceId linked
- **[CURRENT IMPL — NO GATE]** No validation of payment amount matching invoice total.
- **[MISSING]** Partial payment / installment flow not defined.

#### Step 8: Receipt Generation
- **WHO:** EFM Admin
- **WHAT triggers it:** Invoice confirmed as 'lunas'
- **PRECONDITION:** Invoice.status === 'lunas'
- **WHAT is created:** Receipt (RCP-PP-YY-XXXX)
- **FIELDS:** rcpNo, invNo, orderId, client info, paket, tglBayar, metode, total, waStatus
- **[CURRENT IMPL]** No hard gate — receipt creation is a manual admin action after payment confirmed.
- **tahapan CHANGE:** 'Invoice' → 'Agreement'

#### Step 9: Agreement Generation
- **WHO:** EFM Admin
- **WHAT triggers it:** Order paid (receipt exists)
- **PRECONDITION — [INFERENCE]:** Receipt exists for this order
- **WHAT is created:** Agreement (AGR-PP-YY-XXXX) with statusTtd: 'pending'
- **KEY SNAPSHOT DATA:** Captured at creation — see Part 9 for immutability rules.
- **[CURRENT IMPL — NO HARD GATE]** Agreement can be created without checking receipt existence.

#### Step 10: Agreement Signing & Approval
- **WHO:** Client signs (statusTtd: 'waiting-approval'); EFM Admin approves (statusTtd: 'signed')
- **PRECONDITION:** Agreement generated
- **APPROVAL ACTOR:** 'Bagoes Santoso' (hardcoded in all signed agreements)
- **ttdMetadata set at waiting-approval:** { timestamp, device, ipAddress }
- **[CURRENT IMPL — NO GATE]** No enforcement that signing must happen before program starts.

#### Step 11: Health & Safety Data Collection
- **WHO:** EFM Admin collects from client; stored in Klien.infoKesehatan
- **WHAT:** kondisiSaatIni, riwayatCedera, tujuanProgram, obatanRutin, catatanCs, dokumenKesehatan[]
- **COMPLETENESS INDICATOR:** infoKesehatan.sudahDiisi = true
- **[CURRENT IMPL — SOFT WARNING ONLY]** UI may display a warning if H&S incomplete, but no hard block on program start.
- **[MISSING — OWNER DECISION REQUIRED]** Is H&S a hard gate before assessment? Before first session?

#### Step 12: Assessment Pre-Test
- **WHO:** EFM Trainer or Admin
- **WHAT:** Physical measurement baseline — 9 sections (Tanita, Girths, PAR-Q, Alignment, VitalSigns, FMS, Cardio, Strength, Endurance)
- **WHAT is created:** Assessment record (SCR-YY-XXXX) with statusAssessment: 'Pre-Test Selesai'
- **LINKS:** assessmentId → leadId + klienId (NOT orderId — see Part 12)
- **tahapan CHANGE:** 'Agreement' → 'Program Berjalan'

#### Step 13: Trainer Assignment & Schedule
- **WHO:** EFM Admin (Ops)
- **WHAT:** picOpsEFM field in order set to trainer name; hariLatihan[], jamLatihan, lokasiLatihan set
- **[CURRENT IMPL]** Assignment stored as fields on Order, not as separate Assignment entity.
- **[MISSING]** No trainer availability check, capacity check, or conflict detection.

#### Step 14: Program Running — Attendance Recording
- **WHO:** Trainer (via EFM absensi system — efm-absensi.vercel.app)
- **WHAT:** Each session: trainer clocks in with photo proof, location, device
- **WHAT is created:** ABSENSI_SEED entry { id, jadwalId, tanggal, jam, lokasi, device, fotoUrl, catatanKoreksi }
- **sesiDone** in order increments (conceptually — see Part 14 for implementation details)
- **[LEGACY]** PRD_EFM_Management_System.md section "Monitor Absensi" states absensi is read from FILE 3 (existing efm-absensi system, Google Sheets). EFM V2 consumes this data read-only.

#### Step 15: Post-Test Assessment
- **WHO:** EFM Trainer or Admin
- **WHAT:** All 9 sections measured again as `_akhir` values
- **STATUS CHANGE:** Assessment.statusAssessment = 'Post-Test Selesai'

#### Step 16: Program Completion
- **WHO:** System / Admin
- **WHAT triggers it:** sesiDone === total sesi in package
- **STATUS CHANGE:** Order.statusOrder → 'Completed', Order.tahapan → 'Selesai'
- **[CURRENT IMPL — NO AUTOMATION]** Status change is manual in current V2. No automation.

#### Step 17: Renewal
- **WHO:** EFM Admin (Sales) initiates renewal offer; client accepts
- **WHAT:** New Order created (PP-YY-XXXX with new sequence number, same year or new year)
- **NEW ASSESSMENT:** New SCR record created with `prevAssessmentId` pointing to completed assessment
- **[BUSINESS RULE]** Post-test values from old assessment are copied as pre-test values for new assessment
- **[BUSINESS RULE — INFERENCE]** Renewal creates an entirely new commercial transaction. New invoice, new receipt, new agreement. Old agreement is NOT extended.
- **[CURRENT IMPL]** Only evidence: SCR-27-0001.prevAssessmentId = 'SCR-26-0001', indicating this is a renewed program.

---

## PART 5 — PP LEAD PIPELINE STAGES

```
New → Approach → Screening → Closing → Converted
                                     ↘ Lost (can exit from any stage)
```

**[CURRENT IMPL — ppLeadsData.js]** Stage values observed: 'New', 'Approach', 'Screening', 'Closing', 'Converted', 'Lost', 'closed-won', 'closed-lost'.

**[CURRENT IMPL — INCONSISTENCY]** Two different status representations co-exist:
- `stage` field (UI pipeline): 'New' | 'Approach' | 'Screening' | 'Closing' | 'Converted' | 'Lost'
- `status` field (inferred from leads): 'closed-won' | 'closed-lost'

Whether these are the same concept or separate fields requires verification.

---

## PART 6 — ORDER AS CENTRAL TRANSACTION OBJECT

### 6.1 Order Identity and Creation

**[BUSINESS RULE]** Order is the commercial anchor — all downstream documents (invoice, receipt, agreement, attendance) reference the order.

**[CURRENT IMPL]** Order schema (ppOrdersStore.js) key fields:

| Field | Purpose | Type |
|---|---|---|
| `id` | PP-YY-XXXX | string |
| `leadId` | Parent lead | string |
| `programId` | Program catalog link | string |
| `statusOrder` | Order lifecycle state | 'Aktif' / 'Completed' / 'Cancelled' |
| `tahapan` | Current workflow stage | string (see below) |
| `nilaiKontrak` | Contract value | number |
| `paymentTerms` | 'Per Paket' or other | string |
| `paymentTracking[]` | Embedded payment records | array |
| `contractStatus` | Agreement legal status | 'Active' / 'Terminated' |
| `loiStatus` | LOI status | 'N/A' or other |
| `mouAda` | Whether MOU exists | boolean |
| `quotation{}` | Embedded quotation | object |
| `tipeProgram` | 'solo' / 'couple' / 'grup' | string |
| `klienIds[]` | Participating klien IDs | array |
| `sesiDone` | Sessions completed | number |
| `tglMulaiAktual` | Actual start date | string |

### 6.2 tahapan Field Values

**[CURRENT IMPL]** `tahapan` reflects the furthest workflow stage reached:

```
'Invoice'           → Order created, invoice pending
'Agreement'         → Payment done, awaiting agreement
'H&S / Assessment'  → Agreement signed, pre-test pending
'Program Berjalan'  → Program actively running
'Selesai'           → All sessions complete
```

**[BUSINESS RULE]** `tahapan` is a workflow progression indicator, NOT the current active step. A future-start order with signed agreement uses `tahapan: 'Agreement'` not `'Program Berjalan'`, because agreement is the furthest stage reached.

### 6.3 statusOrder vs tahapan

| Field | Meaning | Values |
|---|---|---|
| `statusOrder` | Commercial lifecycle | 'Aktif' / 'Completed' / 'Cancelled' |
| `tahapan` | Workflow progression stage | 'Invoice' / 'Agreement' / 'Program Berjalan' / 'Selesai' |
| `contractStatus` | Legal contract state | 'Active' / 'Terminated' |

**[CURRENT IMPL]** These three fields are complementary, not redundant. An order can be `statusOrder: 'Aktif'` while `tahapan: 'Invoice'` (payment not yet received) — a valid state. An order can be `statusOrder: 'Aktif'` while `contractStatus: 'Active'` — agreement is signed.

### 6.4 loiStatus and mouAda

**[CURRENT IMPL]** In PP orders, `loiStatus: 'N/A'` and `mouAda: false` for all current records. These fields appear to be inherited from a B2B template.

**[INFERENCE]** LOI and MOU may be relevant for large PP group contracts or institutional PP programs, but are not currently used.

### 6.5 Quotation as Embedded Object

**[CURRENT IMPL]** PP quotation is embedded in order, not standalone:
```js
quotation: {
  nomor: 'QUO/EFM/PP/YYYY/XXXX',
  tanggal: string,
  manajemenFee: boolean,
  manajemenFeePersen: number,
  pajak: [{ nama, persen, aktif }],
  status: 'Approved',
  catatan: string
}
```

**[INFERENCE]** The quotation is treated as a snapshot of pricing terms agreed before the order. Status 'Approved' on all current records suggests quotation approval precedes or is simultaneous with order creation.

---

## PART 7 — PAYMENT / COMMERCIAL FLOW

### 7.1 PP Payment Flow

```
Order Created
    ↓
Invoice Generated (INV-PP-YY-XXXX)
status: 'draft'
    ↓
Invoice Sent to Client
status: 'terkirim'
    ↓
Client Pays & Uploads Proof (buktiPembayaran URL)
    ↓
EFM Admin Confirms Payment
invoice.status: 'lunas'
invoice.confirmedBy: admin name
invoice.confirmedAt: timestamp
order.paymentTracking[].status: 'Lunas'
order.paymentTracking[].tglBayar: date
    ↓
Receipt Generated (RCP-PP-YY-XXXX)
    ↓
WhatsApp Receipt Sent (waStatus: 'sent')
```

### 7.2 Payment Terms

**[CURRENT IMPL]** All current PP orders use `paymentTerms: "Per Paket"` — full upfront payment for the entire package.

**[MISSING — OWNER DECISION REQUIRED]** Whether installment payments are officially supported, and if so, what the installment schedule rules are.

### 7.3 Invoice Status Machine

```
draft
  → terkirim (invoice sent to client)
    → lunas (payment confirmed)
    → overdue (payment not received by due date)
```

**[CURRENT IMPL]** 'overdue' state is listed in design standards status colors but not observed in data. No automatic transition to 'overdue' — manual only.

**[MISSING]** Overdue calculation logic (due date + grace period → overdue flag). No evidence of implementation.

### 7.4 Promo / Discount Application

**[CURRENT IMPL]** Invoice fields: `kodePromo` (code string) + `appliedDiscount` (amount Rp).
- Diskon persen: appliedDiscount = total × (nilai/100)
- Diskon nominal: appliedDiscount = nilai
- Bonus types: no effect on invoice total; separate benefit tracking

**[MISSING]** How bonus-type promos are tracked and fulfilled (free massage, free session scheduling). No evidence in current implementation.

### 7.5 B2B Management Payment Flow

**[CURRENT IMPL]** B2B Management billing is monthly per contract. Invoice generated monthly per client per period. No receipt entity observed in B2B Management code.

Invoice status: 'lunas' / 'pending' / 'telat'

**[MISSING]** Formal receipt issuance for B2B Management payments. Whether receipts are required.

### 7.6 B2B Event Payment Flow

**[CURRENT IMPL — INFERENCE]** Event follows project-based payment. Evidence from quotation data: "Pembayaran 50% di muka" (QUO-EV-26-0002 catatan) and "DP 50% sudah diterima" (QUO-EV-26-0013 catatan).

**[INFERENCE]** B2B Event payment likely follows: DP (down payment) → delivery → final payment (pelunasan). Referenced in PRD Event Tracker checklist: "DP diterima" → "Pelunasan diterima".

**[MISSING]** Formal B2B Event invoice entity in current V2 data files. eventData.js has document records but no invoice schema.

---

## PART 8 — AGREEMENT MASTER LOGIC

*Full detail: `docs/EFM_V2_Agreement_Architecture_Review.md`*

### 8.1 EFM Master Agreement Architecture (Agreed Design)

```
EFM MASTER AGREEMENT
├── CORE CLAUSES
│   ├── Parties (EFM + Client)
│   ├── Definitions
│   ├── General Terms
│   └── Governing Law
└── PROGRAM MODULE (module-specific attachment)
    ├── Standard Fitness (default PP)
    ├── Active Aging
    ├── Therapy / Rehab
    ├── Massage
    ├── Corporate (B2B)
    └── Event
        +
APPENDIX A — Dynamic Order Data (snapshot)
```

**Source:** docs/EFM_V2_Agreement_Architecture_Review.md (full architecture)

### 8.2 Agreement State Machine (PP)

```
pending
  → waiting-approval (client signs)
  → signed (EFM admin approves)
  → expired (validity period passed without signing)
  
(from any state)
  → (no explicit 'terminated' state in current data — MISSING)
```

**[CURRENT IMPL]** Status values: 'pending' | 'waiting-approval' | 'signed' | 'expired'

**[CURRENT IMPL]** ttdMetadata (timestamp, device, ipAddress) is populated at `waiting-approval` state — representing the digital signature event.

**[CURRENT IMPL]** `approvedBy: 'Bagoes Santoso'` is hardcoded in all 9 signed agreements. This is a dummy placeholder, not dynamic.

### 8.3 Agreement Creation Gate

**[INFERENCE]** Agreement should only be created when:
1. Order exists
2. Payment received (receipt exists)

**[CURRENT IMPL — NO GATE]** No code gate enforces this. Agreement can be created on any order.

### 8.4 Agreement Data — Live vs Snapshot

**[BUSINESS RULE]** Agreement data must be immutable once signed. Key fields that represent the snapshot:
- `namaKlien`, `sapaan`, `noHp`, `email`
- `paket`, `totalSesi`, `hargaPerSesi`, `hargaTotal`
- `tanggalMulai`, `durasiProgram`
- `picOpsEFM`
- `lokasiLatihan`
- `klienList[]` (for couple/group)

**[BUSINESS RULE]** Appendix A in the Agreement contains the order snapshot. Changes to the live order after signing must NOT retroactively modify the agreement.

**[CURRENT IMPL — NOT ENFORCED]** No snapshot mechanism in V2. Agreement data is stored as fields in ppDocumentsData, not derived from order at generation time. Consistency between agreement and order data is maintained manually through data authorship discipline.

### 8.5 Couple and Group Agreements

**[CURRENT IMPL]** Couple agreement: `klienList[]` with 2 entries; `hargaPerSesi` may reflect combined rate.
- AGR-PP-27-0002: hargaPerSesi = 'Rp400.000' (2 persons × 200k)
- AGR-PP-27-0004: statusTtd = 'waiting-approval', hargaPerSesi = 'Rp1.400.000' (group rate for 6)

**[CURRENT IMPL — INCONSISTENCY]** AGR-PP-27-0002.leadId = 'LP-0002' — this is wrong; should be 'LP-0019' (Reza Putra). Data error, not a business logic error.

**[CURRENT IMPL — INCONSISTENCY]** AGR-PP-27-0004.klienList names don't match ppKlienData LP-0021 klien names. Both are dummy data authored at different times.

---

## PART 9 — HEALTH & SAFETY LOGIC

### 9.1 H&S Data Structure

**[CURRENT IMPL]** H&S data is stored in `Klien.infoKesehatan{}`:
```js
{
  kondisiSaatIni: string,     // current health condition
  riwayatCedera: string,      // injury history
  tujuanProgram: string,      // program goals
  obatanRutin: string,        // regular medications
  catatanCs: string,          // customer service notes
  sudahDiisi: boolean,        // completeness flag
  dokumenKesehatan: []        // attached health documents (Google Drive URLs)
}
```

### 9.2 H&S vs Administrative Completeness

**[BUSINESS RULE — INFERENCE]** `sudahDiisi: true` represents **administrative completeness** (all required fields filled by admin/CS), not **medical clearance** (doctor-approved for exercise).

**[MISSING — OWNER DECISION REQUIRED]** The distinction between:
1. **Administrative completeness** — has the form been filled?
2. **Medical clearance** — has a doctor cleared the client for exercise?
3. **Trainer safety decision** — has the trainer acknowledged health risks and modified program?

These three layers are conceptually separate but currently conflated under a single `sudahDiisi` flag.

### 9.3 H&S as Gate

**[CURRENT IMPL — SOFT WARNING]** `sudahDiisi` flag is present but there is no enforced code gate blocking program start if H&S is incomplete.

**[MISSING — OWNER DECISION REQUIRED]** Should H&S completion be:
- A **hard gate** (cannot proceed to assessment without it)?
- A **soft warning** (admin sees alert but can proceed)?
- A **conditional gate** (mandatory only for Active Aging / health risk cases)?

### 9.4 PAR-Q (Physical Activity Readiness Questionnaire)

**[CURRENT IMPL]** PAR-Q is one of the 9 assessment sections (Screening record), not part of H&S/infoKesehatan. Fields: `parQ_awal{}` and `parQ_akhir{}`.

**[INFERENCE]** PAR-Q serves as the formal risk identification tool within the assessment, while `infoKesehatan` is the ongoing health profile maintained by admin/CS.

### 9.5 Risk Flags

**[MISSING]** No explicit risk flag system. No coded field for "high risk", "requires doctor clearance", or "program modification required". Risk notes are free-text in `catatanCs` only.

---

## PART 10 — ACTIVE AGING LOGIC

**[CURRENT IMPL]** Active Aging is evidenced by one order (PP-27-0003, "senior wellness couple"):
- `catatanOrder`: explicitly mentions lansia 65 tahun, nyeri lutut, hipertensi
- Trainer notes: "hindari high-impact", "pantau tekanan darah"
- `hubunganKlien: "Orang Tua"` — daughter pays for parents
- tipeProgram: 'couple', klienIds: ['KL-0022', 'KL-0023']

**[INFERENCE]** Active Aging is treated as a program variant within Private Program, not a separate platform. The distinction is in the content/approach of training and health risk management, not in the commercial or document architecture.

**[CURRENT IMPL — NO FORMAL MODULE]** No Active Aging-specific entity, agreement module, or data schema exists in current V2 code. Active Aging is handled by:
1. Using the standard PP workflow
2. Writing health notes in `catatanOrder` and `catatanCs`
3. Selecting appropriate program type

**[MISSING — OWNER DECISION REQUIRED]**  Whether Active Aging requires:
- A dedicated H&S module with mandatory companion/wali field
- A separate agreement module (Active Aging Module in Master Agreement)
- A formal emergency contact entity with healthcare facility field
- Special trainer certification requirement
- Modified PAR-Q for elderly clients

**[BUSINESS RULE — INFERENCE]** The concept of "mandatory companion" for Active Aging clients is referenced in prior documentation but not implemented in V2. Whether this is a hard requirement or a recommendation is an owner decision.

---

## PART 11 — ASSESSMENT LOGIC

### 11.1 Assessment Identity

**[CURRENT IMPL]** Assessment ID format: SCR-YY-XXXX (not screaming, but labeled "screening").

**[BUSINESS RULE]** Assessment links to both `leadId` AND `klienId`. It does NOT link to `orderId`.

### 11.2 Assessment Sections

**[CURRENT IMPL]** 9 mandatory sections, each with `_awal` (pre-test) and `_akhir` (post-test) sub-objects:
1. `tanita` — body composition (Tanita scale)
2. `lingkarTubuh` — girth measurements
3. `parQ` — PAR-Q questionnaire
4. `posturAlignment` — postural assessment
5. `vitalSigns` — heart rate, blood pressure, SpO2
6. `fms` — Functional Movement Screen
7. `kardio` — cardiovascular fitness test
8. `kekuatan` — strength test
9. `endurance` — endurance test

### 11.3 Assessment Status Machine

```
(new)
  → Pre-Test Selesai (all _awal sections completed)
    → Post-Test Selesai (all _akhir sections completed)
```

**[CURRENT IMPL]** Only two states. No intermediate "partial pre-test" state.

### 11.4 Renewal Chain

**[CURRENT IMPL]** `prevAssessmentId` field on assessment points to the previous completed assessment.
- SCR-27-0001.prevAssessmentId = 'SCR-26-0001'

**[BUSINESS RULE]** On renewal, post-test values from previous assessment are copied into new assessment's pre-test fields.

**[MISSING]** Copy-forward mechanism is not implemented in code — it's only evidenced by the data matching between SCR-26-0001 _akhir and SCR-27-0001 _awal.

### 11.5 getAssessmentByOrderId() Bug

**[CODE BUG — CRITICAL]**

File: `ppAssessmentsData.js` lines 341-346 AND `ppAssessmentsStore.js` lines 14-17.

Both functions check `a.orderId` which does not exist on any assessment record. Assessment records have `leadId` and `klienId` only.

**Business implication:** Any page that tries to look up an assessment by order ID will silently receive null. The function exists to serve the PP assessment page when opened from an order context. Currently that page likely fails to load assessment data correctly.

**[INFERENCE]** The conceptually correct lookup is:
- Given orderId → find klienId via `ORDER_TO_KLIEN_ID` → find assessments via `getAssessmentsByKlienId()`
- OR: given orderId → find leadId via `ORDER_TO_LEAD_ID` → find assessments via `getAssessmentsByLeadId()`

Whether `orderId` should ever be added to the assessment record is an architectural decision that must be made before fixing the bug.

### 11.6 Is getAssessmentByOrderId() a Real Business Requirement?

**[INFERENCE]** Yes, with clarification: the business need is "given an order, find the associated assessment(s)." This is a valid requirement for the assessment detail page accessed from order context. The current function attempts to serve this need but is broken because assessment records don't store orderId.

**[BUSINESS RULE — INFERENCE]** The correct relationship is: one klien → many assessments (one per program cycle). An orderId is relevant only insofar as it identifies the klien and the program cycle.

---

## PART 12 — ASSIGNMENT LOGIC

### 12.1 Current Implementation

**[CURRENT IMPL]** Trainer assignment is stored as `picOpsEFM` field on the Order — a name string, not a formal Assignment entity.

**[CURRENT IMPL]** `picSalesEFM` and `picOpsEFM` are often the same person but can differ. Example: PP-26-0021 has `picSalesEFM: "Dian Kartika"` and `picOpsEFM: "Rizky Firmansyah"` — different people.

### 12.2 Is Assignment a Real Entity?

**[INFERENCE]** In the current PP module, assignment is an embedded field on Order. This is sufficient for single-trainer, single-order scenarios.

**[MISSING — OWNER DECISION REQUIRED]** Whether Assignment needs to be a standalone entity depends on:
- Do orders ever have multiple trainers? (Current data: no evidence)
- Does a trainer's assignment need its own lifecycle (accepted/declined/completed)?
- Does assignment need to trigger trainer contract (PKS) checking?
- Does assignment history need to be tracked separately from order history?

### 12.3 Trainer Contract (PKS)

**[CURRENT IMPL — INCONSISTENCY]** PRD_EFM_Management_System.md lists "Database PKS PIC" as a planned data table. opsData.picList has `tglHabisPks` field. Elena Rodriguez: `tglHabisPks: '2024-06-01'` (expired) but `status: 'aktif'` — inconsistency.

**[MISSING — OWNER DECISION REQUIRED]** Whether expired PKS should block new assignments. Currently no enforcement.

---

## PART 13 — SCHEDULE / SESSION / ATTENDANCE

### 13.1 Conceptual Distinctions

| Concept | Definition | Evidence |
|---|---|---|
| **Schedule** | The recurring training plan (days, time, location) | `hariLatihan[]`, `jamLatihan`, `lokasiLatihan` fields in Order |
| **Session** | One planned occurrence of training | Conceptually: each entry in ABSENSI_SEED has a `jadwalId` (JS-XXXX-n) |
| **Attendance** | The actual recording of a completed session | ABSENSI_SEED entries — the physical act of trainer clocking in |

**[CURRENT IMPL]** Schedule is NOT a standalone entity. It is stored as fields on the Order. No Session entity exists. Attendance records are the ABSENSI_SEED array.

**[INFERENCE]** `jadwalId` (format: JS-XXXX-n) in ABSENSI_SEED suggests each session is numbered sequentially (1, 2, 3...) within an order (JS-0001-1, JS-0001-2 for order PP-26-0001).

### 13.2 sesiDone Field

**[CURRENT IMPL]** `sesiDone` field on Order is a stored integer, not derived from ABSENSI_SEED count.

**[BUSINESS RULE — CURRENT IMPL]** The data comment in ppAbsensiData.js states: "Jumlah entry per order HARUS sama dengan sesiDone di ppOrdersData.js" — confirming these two must be kept manually in sync.

**[MISSING]** Whether `sesiDone` should be:
- **Stored value** (written when admin manually marks a session done) — current behavior
- **Derived value** (computed from ABSENSI_SEED.length at runtime)
- **Cached derived** (recomputed on attendance save, stored for performance)

### 13.3 Attendance Record Fields

**[CURRENT IMPL]** Each attendance record:
```js
{
  id: 'ABS-NNN',
  jadwalId: 'JS-XXXX-N',    // session sequence within order
  tanggal: '2026-09-01',
  jam: '07:02',
  lokasi: 'Studio Yoga EFM — Senopati, Jakarta Selatan',
  device: 'iPhone 15 Pro - Safari',
  fotoUrl: 'https://drive.google.com/...',    // photo proof (dummy URL)
  catatanKoreksi: ''                          // correction note (empty default)
}
```

**[LEGACY / INFERENCE]** The attendance system (`efm-absensi.vercel.app`) is a separate existing system. V2 reads attendance data from it. This is confirmed by PRD section "Monitor Absensi (Read from FILE 3)."

### 13.4 Session Cancellation / Reschedule

**[MISSING]** No session cancellation or reschedule mechanism in current V2. `catatanKoreksi` field exists for corrections but there is no formal reschedule entity or process.

---

## PART 14 — COMPLETION / RENEWAL

### 14.1 Completion Conditions

**[CURRENT IMPL — NO FORMAL GATE]** Program completion requires:
1. `sesiDone` = total sessions in package (**primary condition** — evidenced by order data)
2. Manual admin action to change `statusOrder → 'Completed'` and `tahapan → 'Selesai'`

**[MISSING]** Whether ALL of these are required before completion:
- sesiDone = total sesi?
- Post-test assessment done?
- All invoices paid?
- Agreement signed?
- Outstanding issues resolved?

### 14.2 Renewal as New Transaction

**[BUSINESS RULE — INFERENCE]** Renewal is a completely new commercial transaction:
- New Order ID (PP-YY-XXXX, new sequence, same year or new year)
- New Invoice (INV-PP-YY-XXXX)
- New Receipt (RCP-PP-YY-XXXX)
- New Agreement (AGR-PP-YY-XXXX)
- New Assessment (SCR-YY-XXXX, with prevAssessmentId)

**[BUSINESS RULE]** Old Agreement is NOT extended or amended. A new contract is issued.

**[CURRENT IMPL]** Renewal is evidenced only by: the same `leadId` appearing in multiple orders (LP-0001 → PP-26-0013 and PP-27-0001) and SCR-27-0001.prevAssessmentId = 'SCR-26-0001'.

**[MISSING]** No formal "renewal offer" workflow step. No automated linking between completed order and new order.

---

## PART 15 — B2B EVENT MODULE

### 15.1 Flow

```
LEAD (LE-xxxx)
  stage: New → Approach → Konsultasi → Quotation → Closing → Converted / Lost
      ↓
KONSULTASI (KNS-YY-XXXX)
  hasil: 'lanjut' / 'pending' / 'tidak_lanjut'
  Fields: nama, namaEvent, jenisEvent, estimasiPeserta, lokasi,
          hasil, peranEFM, temuan, rekomendasi, keputusan, leadId
      ↓
QUOTATION (QUO-EV-YY-XXXX)
  status: Draft → Terkirim → Disetujui / Revisi / Ditolak
  Fields: items[], pajak[], nilaiSubtotal, nilaiTotal
      ↓
ORDER (EV-YY-XXXX)
  [MISSING — no eventOrdersData.js found]
      ↓
INVOICE (INV-EV-YY-XXXX or INV-EFM-EVT-YYYY/XXXX)
  [MISSING — no event invoice data found]
      ↓
PAYMENT — DP + Pelunasan
  [MISSING — no payment tracking]
      ↓
AGREEMENT / LOI / MOU / CONTRACT (EV-DOC-xxx — NON-STANDARD)
  status: drafting → on_review → revision → signed
  document types: Kontrak / MOU / LOI
      ↓
EVENT PREPARATION
  [MISSING — no checklist entity]
      ↓
STAFF ASSIGNMENT
  [MISSING — no assignment entity]
      ↓
EVENT EXECUTION + ATTENDANCE
  [MISSING — no event attendance data]
      ↓
EVENT REPORT
  [MISSING — no report entity]
      ↓
SETTLEMENT / INVOICE CLOSING
  [MISSING]
```

### 15.2 What Exists in Code

**[CURRENT IMPL]** The following are implemented for B2B Event:
- `eventLeadsStore.js` — 6 leads (LE-xxxx), with stages, activity log, konsultasiId, orderIds[]
- `eventKonsultasiStore.js` — 5 konsultasi records (KNS-26-xxxx), with findings, recommendation, decision
- `eventQuotationsStore.js` — 20 quotation records (QUO-EV-26-xxxx), with structured items[], pajak[] (+/- types), nilaiTotal
- `eventData.js` — 6 document records (EV-DOC-xxx — NON-STANDARD) with revisions[]

### 15.3 What is Missing

**[MISSING]** No event Order entity/store. Lead.orderIds[] exists but no orders to reference.
**[MISSING]** No event Invoice entity/store.
**[MISSING]** No event Receipt entity.
**[MISSING]** No event Attendance/Execution tracking.
**[MISSING]** No event Report entity.
**[MISSING]** No event Settlement flow.

### 15.4 Quotation Tax Model

**[CURRENT IMPL — B2B EVENT SPECIFIC]** B2B Event quotation supports multiple simultaneous tax types with directional application:
```js
pajak: [
  { id: 1, nama: 'PPN', persentase: 11, tipe: '+' },    // adds to total
  { id: 2, nama: 'PPh 23', persentase: 2, tipe: '-' },  // deducts from total
]
```

Tax types observed: PPN (11%), PPh 23 (2%), PPh 22 (1.5%).

**[BUSINESS RULE — INFERENCE]** PPh 23 is a withholding tax deducted by the client before payment, reducing the amount EFM receives. PPh 22 is applicable for government contracts.

### 15.5 Event Document IDs

**[CURRENT IMPL — NON-STANDARD]** Event documents use EV-DOC-xxx IDs. Per design standards, they should be LOI-EFM-EVENT-YY-XXXX. The `#` prefix should not appear on document IDs.

### 15.6 EFM Role in Events

**[CURRENT IMPL — INFERENCE]** EFM can serve multiple roles in events, evidenced by `peranEFM` field in konsultasi:
- 'Main Organizer' — EFM leads the entire event
- 'Co-Organizer' — EFM handles fitness/wellness segment
- 'Fitness Consultant' — advisory role
- 'Vendor' — supplies trainer/equipment only

**[BUSINESS RULE — INFERENCE]** EFM's role determines the scope, pricing, and document type for each event.

---

## PART 16 — B2B MANAGEMENT MODULE

### 16.1 Flow

```
LEAD (BC-xxx / BA-xxx — NON-STANDARD)
  stage: New → Presentasi → Proposal → Converted / Gagal
      ↓
SURVEY / NEEDS ASSESSMENT
  [MISSING — no formal survei entity found in V2]
      ↓
PROPOSAL / QUOTATION
  nilaiEst field in lead (string, not structured)
      ↓
CONTRACT (Kontrak / MOU / LOI)
  B2B_DOCS_INIT in b2bData.js
  id: B2B-001..B2B-008 (NON-STANDARD — should be LOI-EFM-B2B-YY-XXXX)
  status: drafting / on_review / revision / signed
  Fields: tglDibuat, tglBerlaku, nilaiKontrak, jenisDoc, revisions[]
      ↓
MONTHLY OPERATIONS (recurring)
  Trainers deploy to gym/apartment per contract terms
      ↓
MONTHLY INVOICE (INV/EFM/B2B/YYYY/XXXX — NON-STANDARD format)
  per billing period (Jun/Mei/Apr 2026)
  status: lunas / pending / telat
      ↓
PAYMENT RECEIVED
      ↓
RENEWAL (at contract expiry — tglBerlaku)
```

### 16.2 What Exists in Code

**[CURRENT IMPL]** Implemented for B2B Management:
- `b2bData.js`: CORP_LEADS_INIT (BC-xxx), APT_LEADS_INIT (BA-xxx), KLIEN_AKTIF, EXPIRING_CONTRACTS
- `b2bData.js`: B2B_DOCS_INIT — 8 document records (B2B-001..008)
- `b2bData.js`: B2B_INVOICES_INIT — 9 invoice records (INV/EFM/B2B/YYYY/XXXX)
- `b2bData.js`: REVENUE_MONTHLY, REVENUE_BY_CLIENT

### 16.3 B2B Management Contract Types

**[CURRENT IMPL]** Three document types: Kontrak, MOU, LOI.

**[INFERENCE]** These likely serve different purposes:
- **Kontrak** — full service agreement, most binding
- **MOU** — Memorandum of Understanding, preliminary or framework
- **LOI** — Letter of Intent, early-stage commitment

**[MISSING — OWNER DECISION REQUIRED]** Formal distinction between when Kontrak vs MOU vs LOI is used for B2B Management clients.

### 16.4 Recurring Nature

**[BUSINESS RULE]** B2B Management is a recurring monthly service. The contract defines:
- Monthly service value (`nilaiKontrak`)
- Duration (`tglBerlaku`)
- Alert threshold: contracts expiring within 30 days require renewal action (evidenced by `EXPIRING_CONTRACTS` in dashboardData)

**[MISSING]** Formal renewal workflow for B2B Management contracts. No renewal request entity observed.

---

## PART 17 — SHARED CORE vs MODULE-SPECIFIC MATRIX

| Entity / Logic | Shared | PP | B2B Event | B2B Management |
|---|---|---|---|---|
| **Lead** | Concept shared | LP-xxxx, pipeline: New→Approach→Screening→Converted | LE-xxxx, pipeline: New→Approach→Konsultasi→Quotation→Converted | BC/BA-xxx (non-standard), pipeline: New→Presentasi→Proposal→Converted |
| **Client / Klien** | Concept shared | KL-xxxx (distinct from Lead, person who trains) | Organization/Brand (inline in lead, no separate entity) | Organization (inline in lead, no separate entity) |
| **Order** | Concept shared | PP-YY-XXXX (rich schema, program-specific) | EV-YY-XXXX (MISSING in V2) | B2B-YY-XXXX (MISSING formal schema) |
| **Quotation** | Concept shared | Embedded in Order | Standalone (QUO-EV-YY-XXXX, structured) | Inline string in lead (nilaiEst) |
| **Invoice** | Concept shared | INV-PP-YY-XXXX | MISSING | INV/EFM/B2B/YYYY/XXXX (non-standard) |
| **Receipt** | PP-specific | RCP-PP-YY-XXXX | MISSING | MISSING |
| **Agreement** | Concept shared | AGR-PP-YY-XXXX | EV-DOC-xxx (non-standard), types: Kontrak/MOU/LOI | B2B-xxx (non-standard), types: Kontrak/MOU/LOI |
| **H&S / Health** | PP-specific | infoKesehatan in Klien | N/A | N/A |
| **Assessment** | PP-specific | SCR-YY-XXXX, 9 sections | N/A | N/A |
| **Assignment** | Concept shared | picOpsEFM field in Order | MISSING | Trainer deploy per contract (MISSING formal) |
| **Schedule** | Concept shared | hariLatihan/jamLatihan/lokasiLatihan in Order | MISSING | MISSING |
| **Session** | Concept shared | ABSENSI_SEED entries | MISSING | MISSING |
| **Attendance** | Concept shared | ABSENSI_SEED keyed by orderId | MISSING | MISSING |
| **Report** | Concept | Not explicit (post-test assessment serves as progress report) | MISSING | Live Report (issue tracking — separate feature) |
| **Renewal** | Concept shared | Implemented (prevAssessmentId chain) | N/A (per-event, no renewal concept) | At contract expiry (MISSING formal flow) |
| **Promo** | PP-specific | ppPromoData (diskon + bonus) | N/A | N/A |
| **Trainer / PIC** | Shared (same trainer pool) | picOpsEFM in Order | Staff assignment (MISSING) | Trainer deployment (MISSING) |
| **Documents** | Concept shared | AGR-PP-YY-XXXX (agreement) | EV-DOC-xxx (contract/MOU/LOI) | B2B-xxx (contract/MOU/LOI) |

---

## PART 18 — STATE MACHINE CONSOLIDATION

### 18.1 Lead State Machine

```
PP:     New → Approach → Screening → Closing → Converted | Lost
Event:  New → Approach → Konsultasi → Quotation → Closing → Converted | Lost
B2B:    New → Presentasi → Proposal → Converted | Gagal
```

**[INFERENCE]** 'Converted' is terminal success; 'Lost'/'Gagal' is terminal failure. Conversion triggers Order creation.

### 18.2 Order State Machine (PP)

```
Created (statusOrder: 'Aktif', tahapan: 'Invoice')
  → Invoice Created (tahapan: 'Invoice')
    → Payment Received (tahapan: 'Agreement')
      → Agreement Signed (tahapan: 'Program Berjalan')
        → Program Running (statusOrder: 'Aktif', sesiDone increments)
          → Completed (statusOrder: 'Completed', tahapan: 'Selesai')
          
  From any state:
  → Cancelled (statusOrder: 'Cancelled')
```

### 18.3 Invoice State Machine (PP)

```
draft
  → terkirim (sent to client)
    → lunas (payment confirmed by admin)
    → overdue (past due date — MISSING automation)
```

### 18.4 Receipt State Machine (PP)

```
(created when invoice is 'lunas')
  → waStatus: 'not-sent'
    → 'sent' (WhatsApp delivery success)
    → 'failed' (WhatsApp delivery failed)
```

### 18.5 Agreement State Machine (PP)

```
pending (agreement generated, awaiting client signature)
  → waiting-approval (client has signed digitally)
    → signed (EFM admin approves)
  → expired (time limit passed without signing)
  
  [MISSING] terminated state
```

### 18.6 Assessment State Machine

```
(created as Pre-Test context)
  statusAssessment: 'Pre-Test Selesai' (all _awal sections done)
    → 'Post-Test Selesai' (all _akhir sections done)
```

### 18.7 B2B Event Quotation State Machine

```
Draft
  → Terkirim (sent to client)
    → Disetujui (client approves)
    → Revisi (client requests changes)
    → Ditolak (client declines)
    
Revisi → Terkirim (resubmit after revision)
```

### 18.8 B2B Document (Agreement) State Machine

```
drafting
  → on_review (sent for review)
    → revision (changes requested)
    → signed (approved and signed)
    
revision → on_review (resubmit)
```

---

## PART 19 — BUSINESS GATE MATRIX

| Action | Required Preconditions | Gate Type | Actor | Evidence | Status |
|---|---|---|---|---|---|
| Create Lead | None | None | Admin | Code: addStoredLead() | IMPLEMENTED — no gate |
| Create Order | Lead exists, stage ≥ Closing | INFERENCE | Admin | No gate code found | MISSING GATE |
| Create Invoice | Order exists, statusOrder: Aktif | INFERENCE | Admin | getInvoiceByOrderId() checks exist | MISSING HARD GATE |
| Create 2nd Invoice | Invoice already exists for order | HARD BLOCK (?) | Admin | addInvoice() no duplicate check | MISSING |
| Confirm Payment | Invoice exists, buktiPembayaran uploaded | SOFT (admin action) | Admin | updateInvoice() with no validation | MISSING GATE |
| Create Receipt | Invoice status === 'lunas' | INFERENCE (soft) | Admin | addReceipt() has duplicate check only | MISSING STATUS CHECK |
| Create Agreement | Order exists, (receipt exists?) | INFERENCE | Admin | addDoc() no checks | MISSING GATE |
| Sign Agreement | Agreement status === 'pending' | INFERENCE | Client | updateDoc() no state validation | MISSING |
| Approve Agreement | Agreement status === 'waiting-approval' | INFERENCE | Admin (Bagoes) | updateDoc() no state validation | MISSING |
| Fill H&S | Klien exists | None | Admin/CS | updateKlienHealth() | IMPLEMENTED — no gate |
| Create Assessment (Pre-Test) | Klien exists, H&S filled (?) | INFERENCE | Admin/Trainer | addAssessment() no checks | MISSING GATE |
| Start Post-Test | Pre-Test complete | INFERENCE | Admin/Trainer | updateAssessment() no state check | MISSING |
| Record Attendance | Order Aktif, Assignment exists | INFERENCE | Trainer (external) | ABSENSI_SEED (read-only from external system) | EXTERNAL SYSTEM |
| Complete Program | sesiDone = total sesi | INFERENCE | Admin | updateOrder() no auto-completion | MISSING AUTOMATION |
| Renew Program | Previous order Completed | INFERENCE | Admin | No renewal-specific code found | MISSING |
| Cancel Order | statusOrder: Aktif | Admin decision | Admin | updateOrder() no validation | SOFT — no gate |

**Legend:**
- HARD GATE = System prevents action
- SOFT = Warning shown but can proceed
- INFERENCE = Business logic inferred, not confirmed
- MISSING = No gate implemented or documented

---

## PART 20 — DOCUMENT DEPENDENCY MAP

```
Lead (LP-xxxx)
  │
  ├── Konsultasi / Screening (KNS/SCR ID)
  │     ↓ informs
  ├── Quotation (QUO-PP/EV/B2B)
  │     ↓ approved → creates
  ├── ORDER (PP/EV/B2B-YY-XXXX) ◄── CENTRAL ANCHOR
  │     │
  │     ├── INVOICE (INV-PP-YY-XXXX)
  │     │     │ status: lunas
  │     │     ↓
  │     ├── RECEIPT (RCP-PP-YY-XXXX)
  │     │
  │     ├── AGREEMENT (AGR-PP-YY-XXXX)
  │     │     snapshot of: order data, client data, program data
  │     │     immutable once: signed
  │     │
  │     ├── ASSESSMENT (SCR-YY-XXXX)
  │     │     linked to: Klien (KL-xxxx) + Lead (LP-xxxx)
  │     │     NOT directly to Order (see Part 11.5 bug)
  │     │
  │     └── ATTENDANCE (ABSENSI_SEED[orderId])
  │           from external system (efm-absensi)
  │
  └── Klien (KL-xxxx)
        ├── infoKesehatan{}
        ├── assessmentIds[]
        └── orderIds[]
```

### Document Immutability Requirements

| Document | Mutable Fields | Immutable Once | Reason |
|---|---|---|---|
| Invoice | catatan, buktiPembayaran, confirmedBy/At, status | After 'lunas' confirmed | Legal payment record |
| Receipt | waStatus | After creation | Payment confirmation record |
| Agreement | statusTtd, ttdMetadata, approvedBy | After 'signed' | Legal contract |
| Assessment | _akhir fields can be updated until Post-Test complete | After 'Post-Test Selesai' | Baseline fitness record |
| Order | Most fields | After Completed/Cancelled | Commercial history |
| Quotation (Event) | items[], pajak[], catatan | After 'Disetujui' | Price agreement |

---

## PART 21 — DATA SNAPSHOT / IMMUTABILITY REQUIREMENTS

### 21.1 The Core Problem

**[BUSINESS RULE]** When EFM changes prices, programs, or templates, historical transactions must remain accurate.

**[CURRENT IMPL — NOT ENFORCED]** No snapshot mechanism. Agreement data, invoice data, and receipt data are stored as their own records (not derived live from order). This provides passive immutability — as long as nobody updates the document records, they remain accurate.

### 21.2 What Must Be Snapshotted

| Trigger | Data to Snapshot | Where | Risk if Not Snapshotted |
|---|---|---|---|
| Agreement signed | Order data (program, price, trainer, schedule, client info) | Agreement record (Appendix A) | Future order edits would misrepresent signed contract |
| Invoice sent ('terkirim') | Pricing terms, program details, discount applied | Invoice record | Future program/price changes would corrupt invoice |
| Receipt created | Payment amount, payment date, method | Receipt record | Could be changed to falsify payment |
| Quotation approved (Event) | All items[], pajak[], nilaiTotal | Quotation record | Post-approval changes would corrupt agreed price |

### 21.3 Current Implementation State

**[CURRENT IMPL]** Passive immutability only — data is stored once at creation, no code prevents later edits via `updateInvoice()`, `updateDoc()`, `updateOrder()`. These update functions accept any patch without state checks.

**[MISSING — PHASE C REQUIREMENT]** Active immutability enforcement (read-only flags, edit prevention) belongs to backend phase.

---

## PART 22 — EDGE CASES

### 22.1 Cancelled Order
- **Normal flow:** Order created → payment fails → Admin manually cancels
- **Business consequence:** Lead status → 'closed-lost'. No receipt issued. Agreement may exist as 'expired'.
- **Document consequence:** Invoice may remain 'terkirim' (not paid)
- **[CURRENT IMPL]** `statusOrder: 'Cancelled'` observed in ppOrdersData for 2 orders (PP-26-0009, PP-26-0010 based on no receipt records). No automated lead status update.

### 22.2 Expired Agreement
- **Normal flow:** Agreement generated → client does not sign within validity period → expires
- **Business consequence:** Program cannot start. New agreement may need to be generated.
- **[CURRENT IMPL]** `statusTtd: 'expired'` state exists. No automated expiry trigger.

### 22.3 Overdue Invoice
- **Normal flow:** Invoice sent → payment due date passes → no payment received
- **Business consequence:** Invoice marked 'overdue'. Follow-up required.
- **[CURRENT IMPL — MISSING]** No overdue detection logic. No automated state transition.
- **[MISSING]** Grace period definition (e.g., Net 7, Net 14).

### 22.4 Couple Program
- **Normal flow:** 1 Lead (payer) → 2 Klien (participants). Same schedule, same trainer.
- **Pricing:** 2 × standard rate × sessions. Example: PP-27-0002 = 2 × 200k × 8 = 3.2M
- **Agreement:** `klienList[]` contains 2 entries; `hargaPerSesi` = combined 2-person rate (400k)
- **[CURRENT IMPL]** `tipeProgram: 'couple'`, `klienIds: [KL-0020, KL-0021]`

### 22.5 Group Program
- **Normal flow:** 1 Lead (coordinator) → up to 6 Klien. Group rate per session.
- **Pricing:** 6 × 175k × 8 = 8.4M (Grup Zumba)
- **[CURRENT IMPL]** `tipeProgram: 'grup'`, `klienIds: [KL-0024..KL-0029]` (6 IDs)
- **[MISSING]** Maximum group size rule. Whether group size can change mid-program.

### 22.6 Guardian / Wali as Payer
- **Example:** PP-27-0003 — Citra Anggraini pays for parents Suyitno & Sri Wahyuni
- **[CURRENT IMPL]** `hubunganKlien: "Orang Tua"`, `namaKlienLatihan: "Suyitno & Sri Wahyuni"`, `tipeProgram: 'couple'`
- **[INFERENCE]** Lead is the daughter (payer). Klien are the parents (participants).
- **[MISSING]** Whether guardian's emergency contact / legal authority to make health decisions is tracked.

### 22.7 Renewal
- **Normal flow:** Completed order → admin initiates renewal → new order created with same Klien
- **[CURRENT IMPL]** Only evidence: same leadId in multiple orders + prevAssessmentId chain.
- **[MISSING]** Formal renewal workflow UI, renewal discount policy, whether same trainer is guaranteed.

### 22.8 Trainer PKS Expired
- **[CURRENT IMPL — INCONSISTENCY]** Elena Rodriguez `tglHabisPks: '2024-06-01'` but `status: 'aktif'`. No assignment block.
- **[MISSING — OWNER DECISION REQUIRED]** Whether expired PKS blocks new assignments.

### 22.9 H&S Incomplete
- **[CURRENT IMPL — SOFT ONLY]** `sudahDiisi: false` flag exists but no hard gate in V2 code.
- **[MISSING — OWNER DECISION REQUIRED]** Hard gate or soft warning?

### 22.10 Partial Attendance
- **Scenario:** Program ends before all sessions complete (client stops, force majeure)
- **[MISSING]** No defined business rule for partial program completion refund or session credit.

### 22.11 Participant Added/Removed (Group)
- **Scenario:** Group starts with 6, one person drops out after session 3
- **[MISSING]** No mid-program participant change mechanism in current V2.

---

## PART 23 — CURRENT CODE vs TARGET BUSINESS LOGIC

### Reconciliation Matrix

| Area | Current Code State | Intended Business Logic | Gap | Type | Phase |
|---|---|---|---|---|---|
| Lead pipeline (PP) | stages: New/Approach/Screening/Closing/Converted/Lost | Defined in skills | Duplicate fields (stage + status) | CURRENT IMPL | Phase B |
| Lead IDs (B2B) | BC-xxx, BA-xxx | Should be LB-xxxx | Non-standard format | CURRENT IMPL | Phase B |
| Event document IDs | EV-DOC-xxx | LOI-EFM-EVENT-YY-XXXX | Non-standard format | CURRENT IMPL | Phase B |
| B2B invoice IDs | INV/EFM/B2B/YYYY/XXXX | INV-B2B-YY-XXXX | Non-standard format | CURRENT IMPL | Phase B |
| Invoice → Receipt gate | No gate | Invoice must be 'lunas' first | Gate missing | MISSING | Phase B |
| Agreement creation gate | No gate | Receipt must exist | Gate missing | MISSING | Phase B |
| Agreement → Program Start gate | No gate | Agreement must be signed | Gate missing | MISSING | Phase B |
| H&S → Assessment gate | No gate | H&S should be complete | Gate missing (decision needed) | MISSING | Phase B |
| sesiDone tracking | Stored integer, manual | Should count ABSENSI_SEED length or be auto-updated | Manual sync required | CURRENT IMPL | Phase B/C |
| getAssessmentByOrderId() | Always returns null (a.orderId missing) | Should look up via klienId | Code bug | CODE BUG | Phase A fix |
| Trainer registry (dual) | Two registries (PIC-xxx + EFM-PIC-xxx) | Single authoritative registry | Duplication | CURRENT IMPL | Phase B |
| Trainer rate (dual) | 70k-80k (PIC_DB) vs 125k-175k (opsData) | Single rate per trainer | Inconsistency | CURRENT IMPL | Owner decision |
| AGR-PP-27-0002 leadId | LP-0002 (wrong) | LP-0019 | Data error | CODE BUG | Phase A fix |
| AGR-PP-27-0004 klienList names | Wrong names | Should match ppKlienData LP-0021 | Data error | CODE BUG | Phase A fix |
| Promo bonus fulfillment | No tracking | Should track when bonus is redeemed | MISSING | MISSING | Phase C |
| Event Order entity | Does not exist | Should be EV-YY-XXXX | MISSING | MISSING | Phase B |
| Event Invoice entity | Does not exist | Should be INV-EV-YY-XXXX | MISSING | MISSING | Phase B |
| B2B Management quotation | nilaiEst string in lead | Should be structured quotation | MISSING | MISSING | Phase B |
| Data snapshot/immutability | Passive only | Active immutability for signed docs | MISSING | MISSING | Phase C |
| RBAC | Not implemented | 3 roles (Admin/Super Admin/Owner) | MISSING | MISSING | Phase C |

**Phase legend:**
- Phase A = UI / current dummy flow fix
- Phase B = Business logic implementation
- Phase C = Backend / authentication
- Phase D = Integration (Google Sheets, absensi system)
- Phase E = Future enhancement

---

## PART 24 — LEGACY FILTER

### 24.1 Legacy System Components

| Component | Status | Recommendation | Reason |
|---|---|---|---|
| FRONTEND/ (old HTML+JS) | LEGACY | PARK (reference only) | Architecture decisions from V1 may inform V2 |
| BACKEND/ (GAS — Google Apps Script) | LEGACY | PARK (will be referenced in Phase D) | GAS is planned backend in PRD v1.0 |
| Old invoice numbering (INV/EFM/PP/YYYY/XXXX) | LEGACY | REWORK to INV-PP-YY-XXXX | V2 design standards are new |
| B2B invoice numbering (INV/EFM/B2B/YYYY/XXXX) | CURRENT IMPL (non-standard) | REWORK to INV-B2B-YY-XXXX | Non-standard per design rules |
| BC-xxx / BA-xxx lead IDs | CURRENT IMPL (non-standard) | REWORK to LB-xxxx | Non-standard per design rules |
| EV-DOC-xxx document IDs | CURRENT IMPL (non-standard) | REWORK to LOI-EFM-EVENT-YY-XXXX | Non-standard |
| Duplicate trainer registry (PIC-xxx + EFM-PIC-xxx) | CURRENT IMPL | REWORK — consolidate | Creates rate inconsistency |
| attendanceData.js sesiList / rekapPIC | CURRENT IMPL (legacy aggregates) | PARK — used by dashboard, remove when dashboard connected to real data | Legacy dashboard data |
| PRD v1.0 (PRD_EFM_Management_System.md) | DOCUMENTATION | KEEP — historical reference for business logic decisions | Documents original intent |
| Quotation format QUO/EFM/PP/YYYY/XXXX (embedded in order) | CURRENT IMPL | REWORK to QUO-PP-YY-XXXX | Inconsistent with other ID formats |

---

## PART 25 — OWNER DECISIONS REQUIRED

The following cannot be determined from code, data, or existing documentation. Grouped by category.

---

### A. Business Decisions

**A1. Installment Payment Policy**
- **Question:** Is installment payment officially supported for PP orders? If yes, what are the rules?
- **Why it matters:** Affects invoice status machine, payment tracking schema, and receipt timing.
- **Current evidence:** `paymentTerms` field exists; `status: 'Cicilan'` is a valid enum value; but all current records show 'Per Paket' (full payment).
- **Unknown:** Installment schedule, minimum deposit, late installment handling.
- **System impact:** Invoice, Receipt, paymentTracking[] schema; overdue logic.

**A2. Renewal Policy**
- **Question:** What defines a valid renewal opportunity? Is there a discount policy for renewing clients?
- **Why it matters:** Determines whether renewal is treated as a new sales process or a simplified fast-track.
- **Current evidence:** Renewal evidenced only by leadId reuse and prevAssessmentId chain.
- **Unknown:** Whether same trainer is guaranteed on renewal; whether renewal requires new H&S; minimum gap between old and new program.
- **System impact:** Order creation flow, assessment copy-forward logic.

**A3. Group Size Rules**
- **Question:** Is 6 participants the maximum for group programs? Can size change mid-program?
- **Why it matters:** Affects pricing, agreement, attendance recording, and klienIds[] management.
- **Current evidence:** PRG-PP-005 has `partisipan: 6`.
- **Unknown:** Policy for participant dropout; policy for adding new participant mid-program.
- **System impact:** Order schema, attendance, invoice.

**A4. Promo Bonus Fulfillment**
- **Question:** How are bonus-type promos (free massage, free session) tracked and fulfilled?
- **Why it matters:** Without tracking, bonuses can be applied multiple times or forgotten.
- **Current evidence:** ppPromoData defines bonus types. No fulfillment tracking exists.
- **Unknown:** Who authorizes bonus fulfillment; where to record redemption.
- **System impact:** New entity needed or extension to receipt/assessment system.

---

### B. Legal Decisions

**B1. Agreement Module for Active Aging**
- **Question:** Does Active Aging require a separate agreement module with enhanced H&S and companion clauses?
- **Why it matters:** Active Aging involves elderly clients with greater health risk. Standard fitness agreement may be legally insufficient.
- **Current evidence:** docs/EFM_V2_Agreement_Architecture_Review.md references an Active Aging module. PP-27-0003 shows an elderly couple program with detailed health notes.
- **Unknown:** Whether companion is legally mandatory; whether doctor clearance is required.
- **System impact:** Agreement module selection logic; H&S schema additions for Active Aging.

**B2. Contract Type for B2B Management**
- **Question:** When is Kontrak vs MOU vs LOI used for B2B Management clients?
- **Why it matters:** Different document types have different legal implications. Consistency in use matters.
- **Current evidence:** All three types observed in B2B_DOCS_INIT.
- **Unknown:** Criteria for choosing each type; who decides.
- **System impact:** Document creation workflow, document status machine.

---

### C. Operational Decisions

**C1. H&S as Hard Gate**
- **Question:** Is health & safety completion a hard gate before assessment, or a soft warning?
- **Why it matters:** Determines whether the system blocks program start without H&S, or just warns.
- **Current evidence:** `sudahDiisi` flag exists. No gate code found.
- **Unknown:** Whether doctor clearance is ever required, or only for Active Aging/high-risk.
- **System impact:** Assessment creation logic, program start logic.

**C2. Trainer Rate Discrepancy**
- **Question:** What is the authoritative trainer pay rate — 70k-80k/sesi (PIC_DB) or 125k-175k/sesi (opsData)?
- **Why it matters:** Two registries show different rates for the same trainers. Payroll calculations use one or the other.
- **Current evidence:** PIC_DB.biayaSesiPIC: 70k-80k; opsData.paymentList: 125k-175k.
- **Unknown:** Whether these represent different service types (PP-specific vs general rate) or a data error.
- **System impact:** Trainer cost calculation, profit margin computation.

**C3. Expired PKS (Trainer Contract) Policy**
- **Question:** Should expired trainer PKS block new assignments?
- **Why it matters:** A trainer without a current PKS may not be legally contracted to EFM.
- **Current evidence:** Elena Rodriguez tglHabisPks: '2024-06-01' (2 years expired) but status: 'aktif'.
- **Unknown:** Whether EFM renews PKS automatically or manually; grace period.
- **System impact:** Assignment gate logic.

---

### D. Pricing Decisions

**D1. Couple / Group Pricing Formula**
- **Question:** What is the official pricing formula for couple and group programs?
- **Why it matters:** Current data shows: couple = 2 × 200k/sesi; group = 175k/person/sesi. But PP-27-0003 (senior couple, 12 sesi Pro) = 4.8M total — which implies different pricing than standard individual rate (which would be 2.4M for 12 sesi × 1 person).
- **Current evidence:** PP-27-0003 nilaiKontrak: 4.8M for 12 sesi couple (400k/sesi × 12); PP-27-0002 nilaiKontrak: 3.2M for 8 sesi couple (400k/sesi × 8). Consistent: couple = 2× individual rate.
- **Unknown:** Whether couple discount is ever offered (e.g., buy-2-get-10%-off).
- **System impact:** Invoice calculation, program catalog pricing.

**D2. Active Aging Premium**
- **Question:** Is there a pricing premium for Active Aging / senior programs vs standard Private Training?
- **Why it matters:** PP-27-0003 uses PRG-PP-003 (standard 12 Sesi Pro) but the program is explicitly for elderly clients with higher care requirements.
- **Current evidence:** No premium found — same 200k/sesi rate.
- **Unknown:** Whether Active Aging warrants premium pricing given specialized trainer requirements.
- **System impact:** Program catalog, pricing rules.

---

### E. UX / System Decisions

**E1. Single vs Multiple Assessments per Order**
- **Question:** Can an order have multiple assessment records? (e.g., if the program renews mid-cycle, or if a pre-test is redone?)
- **Why it matters:** Assessment lookup is currently by klienId/leadId, not orderId. Multiple assessments per klien are supported, but the relationship to specific orders is ambiguous.
- **Current evidence:** Currently 1 assessment per program cycle per klien. No evidence of multiple assessments per single order.
- **Unknown:** Whether partial pre-test can be saved and resumed; whether post-test can be revised.
- **System impact:** Assessment lookup logic, UI for assessment detail page.

**E2. WhatsApp Delivery (waStatus)**
- **Question:** Is WhatsApp delivery of receipts (waStatus tracking) a core business requirement or a nice-to-have?
- **Why it matters:** `waStatus` field exists on receipts and is tracked (sent/not-sent/failed). Implies integration with WhatsApp API is planned.
- **Current evidence:** waStatus field + waDate (waTgl) field in receipt records.
- **Unknown:** Whether this is automated via WhatsApp Business API or manual send with status log.
- **System impact:** Phase D integration requirement or manual tracking UX.

---

## PART 26 — FINAL CANONICAL BUSINESS ARCHITECTURE

### 26.1 EFM V2 Canonical Structure

```
EFM V2 (CV. Bugar Nusantara Jaya)
│
├── SHARED CORE
│   ├── Identity: Company brand, EFM name
│   ├── Trainer Registry: Single authoritative PIC entity
│   ├── Asset Registry: Equipment, venue resources
│   ├── Vendor/Mitra Registry: External vendors
│   ├── Operations Payroll: Trainer fee submissions, approval, payment
│   └── User/Auth: Admin, Super Admin, Owner roles
│
├── PRIVATE PROGRAM (PP)
│   ├── CRM: Lead (LP-xxxx) → Klien (KL-xxxx)
│   ├── Catalog: Program + Package (PRG-PP-xxx)
│   ├── Commercial: Order → Invoice → Receipt → Promo
│   ├── Legal: Agreement (AGR-PP-YY-XXXX) with Program Module
│   ├── Health: H&S (infoKesehatan) → Assessment (SCR-YY-XXXX)
│   └── Operations: Assignment (picOpsEFM) → Schedule → Attendance (ABSENSI_SEED)
│
├── B2B EVENT
│   ├── CRM: Lead (LE-xxxx) → Konsultasi (KNS-YY-XXXX)
│   ├── Commercial: Quotation (QUO-EV-YY-XXXX) → Order → Invoice → Payment (DP + Pelunasan)
│   ├── Legal: LOI/MOU/Contract (LOI-EFM-EVENT-YY-XXXX)
│   └── Operations: Staff Assignment → Event Execution → Attendance → Report
│
└── B2B MANAGEMENT
    ├── CRM: Lead (LB-YY-XXXX) — REWORK from BC-xxx/BA-xxx
    ├── Commercial: Contract → Monthly Invoice (INV-B2B-YY-XXXX) — REWORK from INV/EFM/B2B
    ├── Legal: Kontrak/MOU/LOI (LOI-EFM-B2B-YY-XXXX) — REWORK from B2B-xxx
    └── Operations: Monthly trainer deployment → Attendance (MISSING) → Renewal
```

### 26.2 Master Entity Map

| Entity | PP | B2B Event | B2B Management |
|---|---|---|---|
| Lead | LP-xxxx | LE-xxxx | LB-xxxx (target) / BC/BA-xxx (current) |
| Klien | KL-xxxx (individual) | Organization (no separate entity) | Organization (no separate entity) |
| Program | PRG-PP-xxx | Event brief (in konsultasi) | Service scope (in contract) |
| Order | PP-YY-XXXX | EV-YY-XXXX (MISSING) | B2B-YY-XXXX (MISSING) |
| Invoice | INV-PP-YY-XXXX | INV-EV-YY-XXXX (MISSING) | INV-B2B-YY-XXXX (rework) |
| Receipt | RCP-PP-YY-XXXX | MISSING | MISSING |
| Agreement | AGR-PP-YY-XXXX | LOI-EFM-EVENT-YY-XXXX (rework) | LOI-EFM-B2B-YY-XXXX (rework) |
| Assessment | SCR-YY-XXXX | N/A | N/A |
| Attendance | ABSENSI[orderId] | MISSING | MISSING |
| Quotation | Embedded in Order | QUO-EV-YY-XXXX (standalone) | nilaiEst string (rework) |

### 26.3 Master State Map Summary

| Entity | States |
|---|---|
| Lead (PP) | New → Approach → Screening → Closing → Converted / Lost |
| Lead (Event) | New → Approach → Konsultasi → Quotation → Closing → Converted / Lost |
| Lead (B2B) | New → Presentasi → Proposal → Converted / Gagal |
| Order (PP) | Aktif → Completed / Cancelled (via tahapan: Invoice → Agreement → Program Berjalan → Selesai) |
| Invoice (PP) | draft → terkirim → lunas / overdue |
| Receipt (PP) | created → waStatus: not-sent → sent / failed |
| Agreement (PP) | pending → waiting-approval → signed / expired |
| Assessment | Pre-Test Selesai → Post-Test Selesai |
| Quotation (Event) | Draft → Terkirim → Disetujui / Revisi / Ditolak |
| B2B Document | drafting → on_review → revision → signed |

### 26.4 Master Business Gate Map

All gates listed in Part 19. Summary:
- **Implemented (no gate):** Lead creation, invoice creation, receipt creation, assessment creation, health update, agreement creation, trainer assignment — ALL lack enforcement gates
- **Required gates (by business logic):** Invoice creation requires active order; receipt requires paid invoice; agreement requires receipt; assessment requires H&S (decision needed); program start requires signed agreement (decision needed)
- **External gate:** Attendance is controlled by efm-absensi.vercel.app (external system)

### 26.5 Master Document Map

```
For PP transaction:
Lead → Klien → Order → Invoice → Receipt → Agreement → Assessment → Attendance

For B2B Event transaction:
Lead → Konsultasi → Quotation → Order → Invoice → Agreement/LOI/MOU → Report

For B2B Management transaction:
Lead → Contract/MOU/LOI → Monthly Invoice cycle → Renewal
```

### 26.6 Master Actor Map

| Actor | PP | B2B Event | B2B Management |
|---|---|---|---|
| Admin (EFM Staff) | Creates leads, orders, invoices, agreements; fills H&S | Creates leads, konsultasi, quotations, orders | Creates leads, contracts, invoices |
| Super Admin | All admin + approve payments, edit/correct, view stats | All admin + approve, view stats | All admin + approve |
| Owner | Full access, revenue dashboard | Full access, revenue dashboard | Full access, revenue dashboard |
| Client/Lead | Pays, signs agreement | Signs LOI/contract, pays | Signs contract, pays monthly |
| Klien | Trains (PP only) | Participates in event | N/A |
| Trainer (PIC) | Delivers sessions, records attendance (via efm-absensi) | Delivers event sessions | Manages gym/fitness at client location |

### 26.7 Module-Specific Differences

| Dimension | PP | B2B Event | B2B Management |
|---|---|---|---|
| Client type | Individual / couple / small group | Brand / company / government / NGO | Company / apartment building |
| Transaction model | Per-package, renewable | Per-event project | Monthly recurring contract |
| Complexity | High (full individual lifecycle) | Medium (event project lifecycle) | Medium (recurring billing cycle) |
| Document set | Invoice + Receipt + Agreement + Assessment | LOI/MOU/Contract + Quotation | Contract/MOU/LOI + Monthly Invoice |
| Health requirements | Yes (infoKesehatan + Assessment) | No | No |
| Attendance tracking | Yes (per-session, photo proof) | Yes (event execution — MISSING) | Yes (monthly service delivery — MISSING) |
| Pricing structure | Fixed per-session rate | Custom quoted per event | Fixed monthly contract value |
| Renewal | Program renewal with new contract | N/A (per-event) | Contract renewal at expiry |

### 26.8 Owner Decisions Summary (8 pending — see Part 25 for details)

| # | Category | Decision |
|---|---|---|
| A1 | Business | Installment payment policy |
| A2 | Business | Renewal policy and discount rules |
| A3 | Business | Group size limits and mid-program changes |
| A4 | Business | Promo bonus fulfillment tracking |
| B1 | Legal | Active Aging agreement module requirements |
| B2 | Legal | B2B Management document type criteria |
| C1 | Operational | H&S as hard gate vs soft warning |
| C2 | Operational | Authoritative trainer rate (70k-80k vs 125k-175k) |
| C3 | Operational | Expired PKS enforcement policy |
| D1 | Pricing | Couple/group pricing formula confirmation |
| D2 | Pricing | Active Aging premium pricing |
| E1 | UX/System | Multiple assessments per order policy |
| E2 | UX/System | WhatsApp delivery — automated vs manual |

---

## FINAL REPORT

```
AUDIT PHASE: 1D — Business Logic Consolidation & Workflow Definition
FILES CHANGED: 1 documentation file only (docs/EFM_V2_BUSINESS_LOGIC_MASTER_MAP.md)
CODE CHANGED: 0
FEATURES CHANGED: 0
DATA CHANGED: 0

SOURCES READ: 30+ data/store/page files + 3 documentation files
SECTIONS COMPLETED: 26 (per specification) + Canonical Flow (Part 26)
BUSINESS RULES DOCUMENTED: ~85
CODE BUGS IDENTIFIED (not fixed): 3 (getAssessmentByOrderId, AGR-PP-27-0002 leadId, AGR-PP-27-0004 klienList)
OWNER DECISIONS REQUIRED: 13
MISSING ENTITIES: Event Order, Event Invoice, B2B Event attendance, B2B Management formal quotation
LEGACY ITEMS FOR REWORK: 5 (B2B lead IDs, B2B invoice format, Event doc IDs, B2B doc IDs, dual trainer registry)
```
