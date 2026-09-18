# EFM V2 — Business Logic & Workflow Reconstruction Audit

**Type:** READ-ONLY Audit  
**Date:** 18 Sep 2026 (system date)  
**Auditor:** Claude Code (automated read-only analysis)  
**Status:** COMPLETE  

> **Strict constraints applied throughout this document:**
> - ACTUAL CODE = logic directly found in source files
> - DOCUMENTED INTENT = stated in comments, data shape, or design docs
> - INFERENCE = deduced from data patterns without explicit code
> - MISSING = no evidence found anywhere

---

## Part 1 — Source of Truth / Material Review

### Files Directly Examined

| File | Lines | Purpose |
|---|---|---|
| `REACT-APP/src/App.jsx` | 188 | Route definitions + app entry |
| `REACT-APP/src/data/ppOrdersData.js` | 37 | PP orders list-view data |
| `REACT-APP/src/data/ppOrdersStore.js` | 294 | PP orders full detail store |
| `REACT-APP/src/data/ppLeadsData.js` | 49 | PP leads list-view data |
| `REACT-APP/src/data/ppLeadsStore.js` | 188 | PP leads full store + health data |
| `REACT-APP/src/data/ppInvoiceData.js` | 239 | PP invoice records |
| `REACT-APP/src/data/ppReceiptData.js` | 119 | PP receipt records |
| `REACT-APP/src/data/ppKlienData.js` | 699 | PP client (Klien) database |
| `REACT-APP/src/data/ppAssessmentsData.js` | 347 | PP fitness assessment records |
| `REACT-APP/src/data/ppAbsensiData.js` | 156 | PP attendance (absensi) seed data |
| `REACT-APP/src/data/ppDocumentsData.js` | 371 | PP agreement documents |
| `REACT-APP/src/data/ppProgramDBData.js` | 27 | PP program catalog + trainer DB |
| `REACT-APP/src/data/ppJenisStore.js` | ~50 | PP service type registry |
| `REACT-APP/src/data/b2bData.js` | ~100 | B2B dashboard stats + leads |
| `REACT-APP/src/data/opsData.js` | 55 | OPS trainer/vendor/asset/payment data |
| `REACT-APP/src/data/eventData.js` | 60 | B2B Event document records |
| `docs/EFM_V2_Agreement_Architecture_Review.md` | 1237 | Phase 1 agreement architecture audit |

### Files Known to Exist but NOT Fully Read

| File | Notes |
|---|---|
| `ppInvoiceStore.js` | Invoice CRUD store; assumed parallel to ppOrdersStore |
| `ppReceiptStore.js` | Receipt CRUD store |
| `ppKlienStore.js` | Klien CRUD store |
| `ppDocumentsStore.js` | Agreement CRUD store |
| `ppAssessmentsStore.js` | Assessment CRUD store |
| `ppPromoData.js` / `ppPromoStore.js` | Promo/discount catalog |
| `ppProgramStore.js` | Program catalog store (CRUD) |
| `attendanceData.js` | Attendance/rekap data |
| `dashboardData.js` | Dashboard KPI data |
| `eventLeadsStore.js` | B2B Event leads store |
| `eventKonsultasiStore.js` | B2B Event consultation store |
| `eventQuotationsStore.js` | B2B Event quotation store |
| All `pages/**/*.jsx` | UI components with business logic |

### Known Documentation

- `docs/EFM_V2_Agreement_Architecture_Review.md` — agreement architecture, Phase 1 audit
- `docs/EFM_V2_Daftar_Halaman.md` — page inventory
- `REACT-APP/.claude/skills/efm-design-standards/SKILL.md` — ID format, pricing standards
- `REACT-APP/.claude/skills/efm-component-patterns/SKILL.md` — UI patterns
- `CLAUDE.md` — project overview and rules

### Architecture Classification

**ACTUAL CODE:** React 18 + Vite + Tailwind CSS v3 + React Router v6, all in `REACT-APP/src/`. All data is static JavaScript module-level arrays/objects initialized at module load. No backend, no API calls, no database. All mutations are in-memory only and are lost on page refresh.

**INFERENCE:** The system is explicitly described in CLAUDE.md as "UI-only dengan dummy data. Belum terhubung ke backend/Google Sheets API (fase depan)."

---

## Part 2 — Business Domain Inventory

### 2.1 Dashboard Module

**ACTUAL CODE:** `b2bData.js` exports `B2B_STATS`, `KLIEN_AKTIF`, `EXPIRING_CONTRACTS`, `LEADS_PIPELINE_DASH`, `REVENUE_CHART`. `dashboardData.js` exists but was not fully read.

**DOCUMENTED INTENT:** Dashboard shows KPI summary of B2B module (kontrak aktif, revenue, leads pipeline). PP dashboard presumably similar.

**MISSING:** PP dashboard data file contents unknown. Dashboard does not aggregate from actual order/invoice data — it reads from separate static snapshot objects.

### 2.2 CRM — Leads Module (PP)

**ACTUAL CODE:**
- `ppLeadsData.js`: 21 leads in simple list format. Fields: id (LP-xxxx), sapaan, nama, noHp, sumber, sumberIcon, program, status, tanggal, email, catatan, tipeProgram (optional).
- `ppLeadsStore.js`: Full leads data with statusPipeline, logAktivitas[], tipe (Personal/Couple/Group), klienIds[], hubunganDenganKlien.
- `ORDER_TO_LEAD_ID` mapping in `ppLeadsStore.js` — maps PP Order ID to Lead ID (17 entries).
- Lead statuses: `new`, `follow-up`, `closed-won`, `closed-lost` (ppLeadsData) vs `New`, `Approach`, `Screening`, `Invoicing`, `Closing`, `Convert`, `Lost` (ppLeadsStore.statusPipeline).

**INCONSISTENCY:** Two separate status systems for the same leads:
- ppLeadsData.status: `new | follow-up | closed-won | closed-lost` (4 values, simple CRM states)
- ppLeadsStore.statusPipeline: `New | Approach | Screening | Invoicing | Closing | Convert | Lost` (7 stages, pipeline funnel)

These are not synchronized programmatically in any observed code. They exist as separate fields.

### 2.3 Clients Module (Klien — PP)

**ACTUAL CODE:** `ppKlienData.js` has 29 Klien records (KL-0001 to KL-0029). Key distinction documented in file header:

> "Klien (KL-xxxx) adalah orang yang benar-benar berlatih bersama EFM. Berbeda dari Lead (LP-xxxx) yang merupakan pendaftar/payer. 1 Lead dapat memiliki 1 atau lebih Klien (misal: couple, orang tua mendaftarkan anak)."

Fields per Klien: id, nama, sapaan, jenisKelamin, tanggalLahir, noHp, email, alamat, leadId, assessmentIds[], orderIds[], infoKesehatan{}.

### 2.4 Companies Module (B2B Management)

**ACTUAL CODE:** `b2bData.js` has `CORP_LEADS_INIT` (corporate leads, BC-xxx IDs) and `APT_LEADS_INIT` (apartment leads, BA-xxx IDs). Both use non-standard ID formats (see Part 21, Inconsistencies).

**DOCUMENTED INTENT:** B2B Management handles recurring monthly/annual contracts for corporate gyms and apartment fitness centers.

**MISSING:** Full B2B order/contract store not read. B2BOrderDetailPage.jsx not read.

### 2.5 PP (Private Program) Module

**ACTUAL CODE (full trace):** Lead → Screening/Assessment → Order → Invoice → Receipt → Agreement → Program Berjalan (Absensi) → Program Selesai.

Confirmed from data files: all 8 data entities have records for PP module.

### 2.6 B2B Event Module

**ACTUAL CODE:** `eventData.js` only contains `eventDocuments` (contract/LOI records). Files `eventLeadsStore.js`, `eventKonsultasiStore.js`, `eventQuotationsStore.js` exist but were not fully read.

**DOCUMENTED INTENT (CLAUDE.md):** B2B Event flow: Leads → Konsultasi → Quotation → Order → Invoice → Kelas Jalan → Pelatih Absen → Rekap.

**ACTUAL CODE (App.jsx routes):** `/event/leads/:id`, `/event/konsultasi/:id`, `/event/quotation/:id`, `/event/orders/:id`, `/event/invoice`, `/event/receipt`, `/event/kalender`. No documents or agreement detail route for Event.

### 2.7 B2B Management Module

**ACTUAL CODE (App.jsx routes):** `/b2b/leads`, `/b2b/survei/:id`, `/b2b/orders/:id`, `/b2b/kalender`, `/b2b/invoice`, `/b2b/receipt`. No documents or agreement detail route.

**INFERENCE:** B2B Management and B2B Event share very similar route structure. Both lack dedicated agreement/document detail pages routed in App.jsx.

### 2.8 Program Catalog Module

**ACTUAL CODE:** `ppProgramDBData.js` has `PROGRAMS_INIT` (7 programs). `ppJenisStore.js` has 10 service type definitions (ppJenisStore CRUD: getStoredJenis, addStoredJenis, updateStoredJenis, deleteStoredJenis). Program IDs: PRG-PP-xxx (PP programs), PRG-TH-xxx (therapy programs).

### 2.9 Package & Pricing Module

**ACTUAL CODE:**
- Standard PP individual packages: 4/8/12/24 Sesi at Rp200,000/sesi (200k × sesi = total)
- Grup Zumba: Rp175,000/sesi × 6 persons × 8 sesi = Rp8,400,000 total
- Couple pricing: same per-sesi rate × 2 persons (hargaPaket = 2 × sesi × 200k)
- `ppProgramDBData.PROGRAMS_INIT` row PRG-PP-003 (12 Sesi Pro): diskonPaket = 200000; PRG-PP-004 (24 Sesi Elite): diskonPaket = 500000

**NOTE:** In live invoice data, the standard packages show no discount applied (hargaPaket = sesi × hargaPersesi directly). The `diskonPaket` field in program catalog records "available discount" not "applied discount."

### 2.10 Orders Module

**ACTUAL CODE:** See Part 5 (Trace Order Logic).

### 2.11 Payment Module

**ACTUAL CODE:** See Part 6 (Trace Payment Logic).

### 2.12 Agreement Module

**ACTUAL CODE:** See Part 7 (Trace Agreement Logic). Also covered in `docs/EFM_V2_Agreement_Architecture_Review.md`.

### 2.13 Health & Safety Module

**ACTUAL CODE:** `ppLeadsStore._healthStore` holds per-lead health data (kondisiSaatIni, riwayatCedera, obatanRutin, etc.). `ppKlienData[n].infoKesehatan` holds same data per Klien. PAR-Q in assessments: boolean yes/no per condition. These are data stores only; no enforcement logic exists.

**MISSING:** No automated screening blockers. No "this client cannot train" gate. See Part 10.

### 2.14 Assessment Module

**ACTUAL CODE:** `ppAssessmentsData.PP_ASSESSMENTS` — object keyed by SCR-YY-XXXX ID. 3 records exist. Assessment structure: pre-test (_awal) + post-test (_akhir) for Tanita body composition, Girths, PAR-Q, Alignment, VitalSigns, FMS, Cardio, Strength, Endurance. statusAssessment: 'Pre-Test Selesai' | 'Post-Test Selesai'.

### 2.15 Trainer / PIC Module

**ACTUAL CODE:** `opsData.picList` (8 entries, PIC-001 to PIC-008). `ppProgramDBData.PIC_DB` (6 entries, EFM-PIC-001 to EFM-PIC-006). These are TWO separate trainer registries. OPS list uses PIC-xxx IDs; Program DB uses EFM-PIC-xxx IDs.

### 2.16 Assignment Module

**ACTUAL CODE:** `ppOrdersStore.picOpsEFM` links a trainer name (string, not ID) to an order. `ppProgramDBData.PROGRAMS_INIT[n].picId` links a program template to a trainer EFM-PIC-ID. No formal "assignment" entity/store observed.

**INFERENCE:** Assignment is implicit — trainer name in order = assignment. No assignment history, no conflict checking, no capacity tracking (live).

### 2.17 Schedule Module

**ACTUAL CODE:** `ppOrdersStore.hariLatihan[]` (array of days) + `ppOrdersStore.jamLatihan` (time string) + `ppOrdersStore.lokasiLatihan`. `ppAbsensiData.ABSENSI_SEED` contains per-session records with jadwalId (JS-xxxx-n format). No dedicated schedule entity.

### 2.18 Attendance Module

**ACTUAL CODE:** `ppAbsensiData.ABSENSI_SEED` — keyed by Order ID. Each entry: { id, jadwalId, tanggal, jam, lokasi, device, fotoUrl, catatanKoreksi }. `fotoUrl` is a dummy Google Drive URL. File comment: "Jumlah entry per order HARUS sama dengan sesiDone di ppOrdersData.js."

### 2.19 Invoice Module

**ACTUAL CODE:** `ppInvoiceData.js` — 17 records. Includes pricing fields, promo/discount fields, tax fields. See Part 6.

### 2.20 Receipt Module

**ACTUAL CODE:** `ppReceiptData.js` — 15 records (2 cancelled orders have no receipts). waStatus: 'sent' | 'not-sent' | 'failed'.

### 2.21 Documents Module

**ACTUAL CODE:** `ppDocumentsData.js` — 13 agreement records (AGR-PP-xxx). statusTtd: 'signed' | 'pending' | 'expired' | 'waiting-approval'. ttdMetadata stores device, IP, timestamp of digital signature.

### 2.22 Reports Module

**ACTUAL CODE (App.jsx):** `/laporan/` route exists. Contents of LaporanPage.jsx not read.

### 2.23 Settings Module

**ACTUAL CODE (App.jsx):** `/settings/` routes exist. `ppJenisStore.js` provides CRUD for service types. Other settings pages not read.

---

## Part 3 — Actor & Role Model

### 3.1 Admin (EFM Staff)

**ACTUAL CODE:** "Bagoes Santoso" appears as `approvedBy` in every signed agreement in `ppDocumentsData.js`. `picSalesEFM` and `picOpsEFM` fields in `ppOrdersStore.js` imply separate admin roles (sales vs ops). `picList` in opsData includes both Trainers and Instructors.

**DOCUMENTED INTENT:** The admin dashboard is the primary interface. All operations (creating orders, confirming payments, approving agreements) are performed by EFM admin staff.

**MISSING:** No authentication system. No role-based access control. Any page is accessible to any user at any URL.

### 3.2 PIC / Trainer

**ACTUAL CODE:** Named trainers: Sarah Jenkins, Marcus Chen, Elena Rodriguez, Dian Kartika (from order data). They appear as `picOpsEFM`, `pic` in invoices/receipts, `namaPelatih` in assessments. 

**Role:** Trainer delivers sessions, takes attendance (fotoUrl in absensi), performs pre/post assessments.

**INFERENCE:** Trainers do NOT have login access to the admin dashboard. There is no trainer-facing interface visible in the codebase.

### 3.3 Client (Klien / Lead)

**ACTUAL CODE:** Lead (LP-xxxx) = the person who registers and pays. Klien (KL-xxxx) = the person who actually trains (may differ from Lead in couple/guardian scenarios). Digital signature via `statusTtd: 'waiting-approval'` in agreement implies client signs via a web link.

**MISSING:** No client portal observed. Digital signature link/flow not implemented.

### 3.4 Participant

**ACTUAL CODE (INFERENCE):** In group programs (Grup Zumba, couple), multiple Klien IDs are stored in `klienIds[]` in order store and `klienList[]` in agreement. These are the "participants." No separate Participant entity.

### 3.5 Wali / Guardian

**ACTUAL CODE:** `ppDocumentsData.pendaftarSamaDenganKlien: false` + `namaWali`, `hubunganWali`, `noWaWali` fields exist. Example: Citra Anggraini registered parents (Suyitno & Sri Wahyuni) for PP-27-0003.

### 3.6 Companion / Emergency Contact

**ACTUAL CODE:** `ppDocumentsData.kontakDarurat` — a string like "Margaret Wilson (+62 812 3456 7891)". Not a separate entity. One emergency contact per agreement.

---

## Part 4 — Entity / Object Model

### 4.1 Primary Entities

```
Lead (LP-xxxx)
  ├── created by: EFM admin during lead capture
  ├── has: statusPipeline (New → Approach → Screening → Invoicing → Closing → Convert | Lost)
  ├── has: _healthStore entry (kondisiSaatIni, riwayatCedera, etc.)
  ├── linked to: 0..N Klien records (via klienIds[])
  └── linked to: 0..1 Order (via ORDER_TO_LEAD_ID mapping)

Klien (KL-xxxx)
  ├── is: the actual person training
  ├── has: infoKesehatan{}
  ├── has: assessmentIds[] → SCR-YY-xxxx
  ├── has: orderIds[] → PP-YY-xxxx
  └── linked to: 1 Lead (via leadId)

Order (PP-YY-xxxx)
  ├── has: tahapan (Invoice | Agreement | Program Berjalan | Program Selesai | Kontrak Dibatalkan)
  ├── has: statusOrder (Aktif | Completed | Cancelled)
  ├── has: paymentTracking[] (payment installment records)
  ├── has: contractStatus (Active | Completed | Terminated | N/A)
  ├── has: quotation{} (nomor, tanggal, manajemenFee, pajak[], status, catatan)
  ├── linked to: 1 Lead (via leadId)
  ├── linked to: 1 Invoice (INV-PP-YY-xxxx) [inferred, not stored in order]
  └── linked to: 1..N Klien (via klienIds[])

Invoice (INV-PP-YY-xxxx)
  ├── has: status (paid | pending | overdue | draft)
  ├── has: pricing (hargaPersesi, sesi, hargaPaket, diskonPaket, promoKode, pajak, total)
  ├── has: paidDate, payMethod
  └── linked to: 1 Order (via orderId)

Receipt (RCP-PP-YY-xxxx)
  ├── has: waStatus (sent | not-sent | failed)
  ├── has: metode (payment method)
  └── linked to: 1 Invoice (via invNo) and 1 Order (via orderId)

Agreement (AGR-PP-YY-xxxx)
  ├── has: statusTtd (signed | pending | expired | waiting-approval)
  ├── has: ttdMetadata{} (device, IP, timestamp — only when signed/waiting-approval)
  ├── has: approvedBy + approvalTimestamp (only when signed)
  ├── has: klienList[] (for couple/group programs)
  └── linked to: 1 Order (via orderId)

Assessment (SCR-YY-xxxx)
  ├── has: statusAssessment (Pre-Test Selesai | Post-Test Selesai)
  ├── has: prevAssessmentId (for renewal chain)
  ├── has: toggles{} (which sections are active: bodyMeasurement, healthScreening, fitnessTest)
  ├── has: TANITA, Girths, PAR-Q, Alignment, VitalSigns, FMS, Cardio, Strength, Endurance sections
  └── linked to: 1 Lead (via leadId) + 1 Klien (via klienId)

AbsensiRecord (ABS-xxx)
  ├── has: jadwalId, tanggal, jam, lokasi, device, fotoUrl
  └── keyed under: Order ID in ABSENSI_SEED
```

### 4.2 Relationship Map

```
Lead (LP) ──1:1──> Order (PP)         [via ORDER_TO_LEAD_ID + orderId in order store]
Lead (LP) ──1:N──> Klien (KL)         [via klienIds[] in lead store]
Lead (LP) ──1:N──> Assessment (SCR)   [via leadId in assessment]
Klien (KL) ──1:N──> Assessment (SCR) [via assessmentIds[] in klien]
Klien (KL) ──1:N──> Order (PP)        [via orderIds[] in klien — for renewals]
Order (PP) ──1:1──> Invoice (INV-PP)  [orderId in invoice]
Invoice (INV-PP) ──1:1──> Receipt (RCP-PP) [invNo in receipt]
Order (PP) ──1:1──> Agreement (AGR-PP) [orderId in agreement]
Order (PP) ──1:N──> AbsensiRecord      [keyed by orderId in ABSENSI_SEED]
```

### 4.3 Known Data Cross-Reference Issues

**INCONSISTENCY #1:** `getAssessmentByOrderId(orderId)` in `ppAssessmentsData.js` (line 342) checks `a.orderId === orderId`, but the assessment schema has NO `orderId` field — only `leadId` and `klienId`. This function will always return null.

**INCONSISTENCY #2:** `ppDocumentsData.DOCS_INIT['AGR-PP-27-0004'].klienList` names: Nadia Lestari, Putri Handayani, Lia Permata, Tio Wahyudi, Bambang Sutrisno — but `ppKlienData.KLIEN_INIT` for same Lead LP-0021 has: Rini Hartati, Sandra Permatasari, Dian Novita, Tari Wulandari, Lisna Oktavia. The names do NOT match between documents and klien records.

**INCONSISTENCY #3:** `ppDocumentsData.DOCS_INIT['AGR-PP-27-0002'].leadId = 'LP-0002'` but Order PP-27-0002 is for Reza Putra (LP-0019 per ORDER_TO_LEAD_ID). AGR-PP-27-0002 references LP-0002 (Emily Chen) — wrong leadId.

**INCONSISTENCY #4:** Assessment `SCR-26-0001` and `SCR-27-0001` both set `leadId: 'LP-0001'` correctly (James Wilson). `SCR-26-0002` correctly uses `leadId: 'LP-0018'`. However, `getAssessmentByOrderId()` cannot function (see #1 above).

---

## Part 5 — Trace Order Logic

### 5.1 Order Creation

**ACTUAL CODE:** `ppOrdersStore.getNextOrderId()` — generates `PP-${yy}-${seq}` where `yy` = current 2-digit year, seq = max existing seq + 1 from the current year's orders. No duplicate check beyond max+1.

**ACTUAL CODE:** `ppOrdersStore.updateOrder(id, changes)` — accepts any id + any partial object, merges into existing record. No validation, no type checking, no status guards.

**ACTUAL CODE (ppOrdersData):** The `ORDERS_INIT` array with `export const` is the source for list views. The `ppOrdersStore` (`_orders` mutable array initialized from `ORDERS_INIT` deep copy) is the source for detail pages.

**NOTE:** These two data sources are independent. Mutations to the store are not reflected in the simple data export and vice versa. On page reload, both reset to initial seed data.

### 5.2 Order Fields

Key fields per order (ppOrdersStore):

| Field | Type | Notes |
|---|---|---|
| `id` | string | PP-YY-xxxx |
| `leadId` | string | LP-xxxx — links to ppLeadsStore |
| `programId` | string | PRG-PP-xxx — links to ppProgramDBData |
| `namaKlien` | string | Paying client's name |
| `sapaan` | string | Honorific (Pak/Kak/Mas/Bu) |
| `paket` | string | "8 Sesi - Base" etc. |
| `picSalesEFM` | string | Sales PIC name |
| `picOpsEFM` | string | Operations/trainer PIC name |
| `tanggalMulai` | string | Planned start date |
| `tglMulaiAktual` | string\|null | Actual start date (null until program begins) |
| `nilaiKontrak` | number | Contract value in IDR |
| `tahapan` | string | Current pipeline stage |
| `statusOrder` | string | Aktif \| Completed \| Cancelled |
| `paymentTerms` | string | "Full Payment" \| "Cicilan" etc. |
| `paymentTracking[]` | array | Payment installment records |
| `loiStatus` | string | LOI/agreement status |
| `mouAda` | boolean | MOU document exists flag |
| `contractStatus` | string | Active \| Completed \| Terminated \| N/A |
| `quotation{}` | object | Quotation record (status: "Approved" for all existing) |
| `rincianLayanan[]` | array | Service line items |
| `tipeProgram` | string | "couple" \| "grup" (optional — absent = individual) |
| `klienIds[]` | array | Klien IDs for multi-person programs |

### 5.3 Order Tahapan / Status State Machine

**ACTUAL CODE (observed in ppOrdersData + ppOrdersStore):**

Tahapan values observed:
- `Invoice` — order created, invoice sent, awaiting payment
- `Agreement` — payment received, agreement pending/signed, program not yet started
- `Program Berjalan` — program active, sessions in progress
- `Program Selesai` — all sessions completed
- `Kontrak Dibatalkan` — order cancelled (for statusOrder: 'Cancelled')

StatusOrder values:
- `Aktif` — order active
- `Completed` — all sessions done
- `Cancelled` — order cancelled

**INFERENCE (from data patterns):**

```
Lead Convert → Order Created (tahapan: Invoice)
                    ↓
               Invoice Paid (tahapan: Agreement)
                    ↓
         Agreement Signed (tahapan: Agreement → Program Berjalan on start)
                    ↓
            Program Running (sesiDone increments)
                    ↓
        All Sessions Done (tahapan: Program Selesai, statusOrder: Completed)

At any point: Cancelled (tahapan: Kontrak Dibatalkan, statusOrder: Cancelled)
```

**NOTE:** PP-27-0001 (James Wilson) has `tahapan: 'Agreement'` with `sesiDone: 0` and `tglMulaiAktual: null`. This represents "agreement signed but program not yet started" — distinguished from "Invoice" stage by payment status.

**MISSING:** No code-enforced state transitions. `updateOrder()` accepts any tahapan value. No validation prevents setting `tahapan: 'Program Selesai'` while `sesiDone < sesiTotal`.

### 5.4 Order Editing

**ACTUAL CODE:** `updateOrder(id, changes)` — line ~280 in ppOrdersStore.js. Accepts any partial object. No guards.

**MISSING:** No audit trail of who changed what when. Changes are lost on page reload.

### 5.5 Order Cancellation

**ACTUAL CODE (ppOrdersStore):** PP-26-0010 (Anita Suryani) and PP-26-0003 (Fiona Santika) have `statusOrder: 'Cancelled'` and `tahapan: 'Kontrak Dibatalkan'`. Both have `statusInv: 'overdue'` in ppOrdersData and no receipt records.

**MISSING:** No refund logic. No cancellation fee calculation. Cancellation = manual field update only.

### 5.6 Order Renewal

**ACTUAL CODE (ppAssessmentsData):** James Wilson has orders PP-26-0013 (first) and PP-27-0001 (renewal). Assessment SCR-27-0001 has `prevAssessmentId: 'SCR-26-0001'` and all `_awal` values are copied from `_akhir` of SCR-26-0001.

**DOCUMENTED INTENT (ppAssessmentsData comment):** "Saat order baru dibuat untuk klien yang sudah punya assessment ber-status 'Post-Test Selesai', semua nilai _akhir dari assessment lama disalin menjadi _awal assessment baru."

**INFERENCE:** Renewal means creating a new Order with a new Assessment, copying post-test values as new pre-test values. The mechanism is described but no code was observed that actually performs this copy automatically — the data is pre-seeded showing the expected result.

### 5.7 Order Completion

**ACTUAL CODE:** PP-26-0002, PP-26-0005, PP-26-0007, PP-26-0012 have `statusOrder: 'Completed'` and `tahapan: 'Program Selesai'` with `sesiDone === sesiTotal`.

**MISSING:** No auto-complete trigger. No notification. No renewal prompt.

---

## Part 6 — Trace Payment Logic

### 6.1 Invoice Creation

**ACTUAL CODE:** `ppInvoiceData.ORDERS_INIT` — 17 static invoice records. Fields include: invNo, orderId, client details, pricing breakdown, promoKode, promoType, promoVal, pajak, total, bulan, status.

Status values: `paid | pending | overdue | draft`

**ACTUAL CODE (pricing structure):**
```
hargaPersesi × sesi = hargaPaket (before any discount)
hargaPaket - diskonPaket - (promoVal if promoType=fixed) = subtotal
subtotal × (1 + pajak/100) = total
```

For couple programs:
- `hargaPersesi = 200000` (per person per session)
- `sesi = package_sessions` (e.g., 8)
- `hargaPaket = 2 × sesi × hargaPersesi` (e.g., 3,200,000 for 8-sesi couple)

For Grup Zumba (6 persons):
- `hargaPersesi = 175000` (per person per session — different rate)
- `sesi = 8`
- `hargaPaket = 6 × 8 × 175000 = 8,400,000`

### 6.2 Payment Proof Upload

**ACTUAL CODE:** `ppInvoiceData` includes `paidDate` and `payMethod` fields. For paid invoices these are populated. For overdue invoices, they are null.

**INFERENCE:** Upload mechanism exists in UI (PPInvoiceDetailPage.jsx, not read). Receipt creation trigger is tied to payment confirmation.

**DOCUMENTED INTENT (design docs):** After uploading payment proof, a "Buat Receipt" button appears on the invoice page.

### 6.3 Payment Verification & Confirmation

**MISSING:** No payment verification workflow in data files. The transition from `status: 'pending'` to `status: 'paid'` is a manual admin action.

### 6.4 Receipt Creation

**ACTUAL CODE:** `ppReceiptData.RECEIPTS_INIT` — 15 records. Receipt is created after payment confirmed. Fields: rcpNo, invNo, orderId, client details, paket, pic, tglBayar, metode, total, waStatus.

**NOTE:** Receipt total matches invoice total exactly in all observed records.

### 6.5 WhatsApp Notification

**ACTUAL CODE:** `ppReceiptData.waStatus: 'sent' | 'not-sent' | 'failed'`. `waTgl` = date sent.

**MISSING:** No actual WhatsApp API integration. waStatus is a manual field.

### 6.6 Order Activation After Payment

**INFERENCE (from data patterns):** Payment received → `statusInv: 'paid'` → Receipt created → tahapan moves toward 'Agreement' → program can begin. No enforcement code observed.

### 6.7 Refund / Cancellation

**MISSING:** No refund logic observed anywhere. Cancelled orders (PP-26-0010, PP-26-0003) have no receipt and `statusInv: 'overdue'`.

### 6.8 Overdue Logic

**ACTUAL CODE:** `ppInvoiceData.due` — 14-day due date after `tanggal`. Status `overdue` is manually set (not computed from due date in observed data).

**MISSING:** No auto-overdue logic. No scheduled check. Status is static seed data.

---

## Part 7 — Trace Agreement Logic

### 7.1 Agreement Creation

**ACTUAL CODE:** `ppDocumentsData.DOCS_INIT` — 13 agreement records. Each tied to an Order via `orderId`.

**ACTUAL CODE:** Agreement contains: client info, training schedule (hariLatihan, jamLatihan, lokasiLatihan), package/pricing (paket, harga, hargaPerSesi, masaBerlaku), validity dates (tglMulai, tglBerakhir), equipment list, special notes, emergency contact, guardian info (if applicable).

### 7.2 Agreement State Machine

**ACTUAL CODE (statusTtd values):**

| Status | Meaning | ttdMetadata | approvedBy |
|---|---|---|---|
| `pending` | Awaiting client signature | null | null |
| `waiting-approval` | Client signed, awaiting admin approval | present (device/IP/timestamp) | null |
| `signed` | Admin approved, agreement active | present | present |
| `expired` | Time limit exceeded, not signed | null | null |

**Observed counts:** 9 signed, 2 pending, 2 expired, 1 waiting-approval.

**INFERENCE (state transitions):**
```
(created) → pending
    ↓ (client signs via link)
waiting-approval
    ↓ (admin approves)
signed
    
pending → expired (after time limit, not implemented as auto-logic)
```

### 7.3 Agreement Document Construction

**ACTUAL CODE:** All agreement data fields are stored as string literals. There is no template rendering engine. The document shows dynamic data directly from DOCS_INIT records.

**MISSING:** No Handlebars/Mustache/template engine. No PDF generation. No Google Docs integration. All content is static data.

### 7.4 Agreement Snapshot / Locking

**MISSING (critical):** No snapshot mechanism observed. Agreement fields in DOCS_INIT are NOT copies taken at a moment in time — they are live data. If an order is edited, the agreement record is separate and would show stale data.

**INFERENCE:** The design intent may be that agreement fields are independent copies, but there is no automated sync or lock. Fields like `hargaPerSesi: 'Rp200.000'` vs couple `hargaPerSesi: 'Rp400.000'` appear to be manually entered.

### 7.5 Digital Signature

**ACTUAL CODE:** `ttdMetadata: { timestamp, device, ipAddress }` — collected at signature time. `waiting-approval` status = client has signed but admin has not approved.

**ACTUAL CODE (AGR-PP-27-0004):** `statusTtd: 'waiting-approval', tglTtd: '19 Jan 2027 14:22'` — shows the signature timestamp before admin approval.

**MISSING:** No actual digital signature link, no QR code, no certificate. The metadata is dummy data that simulates what would be collected.

### 7.6 Agreement Audit Trail

**ACTUAL CODE:** `approvedBy: 'Bagoes Santoso'` + `approvalTimestamp` in all signed agreements. `ttdMetadata.timestamp` captures when the client signed.

**MISSING:** No change log. No version history. No way to reconstruct what the agreement said at signing time (no snapshot). Bagoes Santoso is hardcoded as the sole approver in all records.

### 7.7 Agreement for Couple/Group Programs

**ACTUAL CODE:** `tipeProgram: 'couple' | 'grup'` + `klienList[]` in agreement. Couple `hargaPerSesi: 'Rp400.000'` (total for 2 persons per session). Group `hargaPerSesi: 'Rp1.400.000'` (total for 6 persons × 8 sesi from INV perspective is Rp1,400,000/sesi × 6 = Rp8,400,000).

---

## Part 8 — Agreement Document Construction (Deep)

### 8.1 Template Source

**MISSING:** No template file found. No `.hbs`, `.ejs`, `.html` template for agreements. All agreement data is pre-rendered as static string values in `ppDocumentsData.DOCS_INIT`.

### 8.2 Dynamic Data Dependency Map

For an agreement to be generated, these source records must exist:

| Agreement Field | Source |
|---|---|
| namaKlien, sapaan, noWa, email, alamat | Klien record (KL-xxxx) OR Lead record (LP-xxxx) |
| orderId, paket, harga | Order (PP-YY-xxxx) |
| noReceipt | Receipt (RCP-PP-YY-xxxx) — may be '—' for unconfirmed |
| refInvoice | Invoice (INV-PP-YY-xxxx) |
| pic | picOpsEFM in Order |
| tglMulai, hariLatihan, jamLatihan, lokasiLatihan | Order fields |
| hargaPerSesi | Calculated (see Part 9) |
| masaBerlaku, tglBerakhir | Package definition + start date |
| kontakDarurat | From lead/klien record |
| namaWali, hubunganWali, noWaWali | Populated if `pendaftarSamaDenganKlien: false` |
| klienList[] | Klien records linked to Order |

### 8.3 Pricing Anomaly in Agreements

**ACTUAL CODE:**
- AGR-PP-27-0002 (couple, 8 sesi): `harga: 'Rp3.200.000'`, `hargaPerSesi: 'Rp400.000'`
- AGR-PP-27-0003 (couple, 12 sesi): `harga: 'Rp4.800.000'`, `hargaPerSesi: 'Rp400.000'`
- Standard individual 12 sesi: `harga: 'Rp2.400.000'`, `hargaPerSesi: 'Rp200.000'`

**INFERENCE:** For couple programs, `hargaPerSesi` in agreement = total cost per session for both persons combined. This is consistent with invoice data (hargaPaket = 2 × sesi × 200k).

---

## Part 9 — Hidden Agreement Logic

### 9.1 Guardian (Wali) Bifurcation

**ACTUAL CODE:** `pendaftarSamaDenganKlien: false` triggers use of `namaWali/hubunganWali/noWaWali` fields instead of (or alongside) the client's own contact info. Example: PP-27-0003 (Citra Anggraini registering her parents Suyitno & Sri Wahyuni).

**HIDDEN RULE:** When `pendaftarSamaDenganKlien: false`, the agreement is between EFM and the guardian/payer (namaWali), not the person training. This is a distinct legal arrangement.

### 9.2 Couple/Group Session Rate Calculation

**HIDDEN RULE (from data):**
- Couple: `hargaPerSesi (agreement) = standard_rate × 2` because 1 session = 1 trainer × 2 clients
- Group (6 pax): `hargaPerSesi (agreement) = 175,000 × 6 = 1,050,000` but agreement shows `Rp1.400.000/sesi` — this may represent a bundled rate including overhead

**NOTE:** The per-session rate for agreements differs from the per-person calculation used in invoices. The agreement shows the aggregate per-session cost; the invoice shows per-person breakdown.

### 9.3 Agreement Validity Period vs Program Duration

**ACTUAL CODE:** `masaBerlaku` values:
- 4 Sesi Starter: 30 hari
- 8 Sesi Base: 45 hari
- 12 Sesi Pro: 60 hari
- 24 Sesi Elite: 90 hari

These calendar windows define when sessions must be completed. `tglBerakhir = tglMulai + masaBerlaku`. This creates a contractual deadline distinct from "number of sessions."

### 9.4 Waiting-Approval State

**ACTUAL CODE (AGR-PP-27-0004):** `waiting-approval` = client has signed (ttdMetadata populated) but `approvedBy: null`. Admin must review and approve.

**MISSING:** No escalation. No expiry for waiting-approval state. No notification to admin.

---

## Part 10 — Health & Safety Logic

### 10.1 Health Data Collection

**ACTUAL CODE:** Two parallel health data stores:
1. `ppLeadsStore._healthStore` — per Lead, filled during sales/screening process
2. `ppKlienData.infoKesehatan{}` — per Klien, more detailed record

**ACTUAL CODE (PAR-Q):** `ppAssessmentsData.parq{}` — boolean yes/no per health condition (masalahJantung, rekomendasiDokter, nyeriDada, sakitLutut, tekananDarahTinggi, obatSuplemen) at both pre-test and post-test.

### 10.2 High-Risk Client Flags

**ACTUAL CODE (from data):**
- Sri Wahyuni (KL-0023): `obatanRutin: 'Amlodipin 5mg (hipertensi)'` — agreement catatanKhusus: "hipertensi terkontrol, konsumsi Amlodipin — pantau tekanan darah selama latihan"
- Hendra Wijaya: `kondisiSaatIni: 'nyeri punggung bawah ringan'`
- Robert Taylor: `riwayatCedera: 'Pernah cedera pergelangan kaki kiri (2023)'`

**MISSING:** These flags exist as text strings only. There are no automated alerts, no training restrictions, no mandatory doctor clearance check before order activation.

### 10.3 Doctor Clearance Documents

**ACTUAL CODE:** `ppKlienData.infoKesehatan.dokumenKesehatan[]` — array of health document records. Example: `{ id: 'DOK-001', nama: 'Surat Dokter - Budi Santoso.pdf', tipe: 'Surat Dokter', tanggal: '5 Okt 2026' }`.

**MISSING:** No enforcement that a doctor clearance document must be uploaded before program starts. It is a data field, not a gate.

### 10.4 Emergency Contact

**ACTUAL CODE:** `ppDocumentsData.kontakDarurat` — stored as a string. Not linked to any person entity. Cannot be called/notified from the system.

---

## Part 11 — Assessment Logic

### 11.1 Assessment Sections

**ACTUAL CODE:** Each assessment has 9 toggleable sections:
1. **Tanita** (body composition): 11 metrics with awal/akhir values
2. **Girths** (body measurements): 5 measurements
3. **PAR-Q** (health questionnaire): 6 yes/no conditions
4. **Alignment** (posture): empty in all observed records
5. **VitalSigns**: pulse, temperature, respiration, blood pressure
6. **FMS** (Functional Movement Screen): overhead squat, in-line lunge, toe touch
7. **Cardio**: empty in all observed records
8. **Strength**: empty in all observed records
9. **Endurance**: empty in all observed records

`toggles: { bodyMeasurement, healthScreening, fitnessTest }` — only 3 toggle categories, not 9. The mapping is implied (not explicit in code).

### 11.2 Assessment Status Flow

**ACTUAL CODE:**
- `statusAssessment: 'Pre-Test Selesai'` — pre-test data filled, post-test empty
- `statusAssessment: 'Post-Test Selesai'` — both pre-test and post-test filled

**MISSING:** No intermediate states like "In Progress." No validation that all sections are filled before marking complete.

### 11.3 Renewal Auto-Copy Mechanism

**DOCUMENTED INTENT (ppAssessmentsData.js header comment):** When a new order is created for a client with a completed assessment, all `_akhir` values are auto-copied to `_awal` of the new assessment. `prevAssessmentId` records the source.

**ACTUAL CODE:** SCR-27-0001 pre-test values are identical to SCR-26-0001 post-test values, with `_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001'` annotations.

**INFERENCE:** The copy mechanism is described but not implemented in any observable function. The pre-seeded data demonstrates the expected result. No `copyAssessmentForRenewal()` function was observed.

### 11.4 getAssessmentByOrderId() Bug

**ACTUAL CODE (ppAssessmentsData.js, lines 341-346):**
```js
export function getAssessmentByOrderId(orderId) {
  return Object.entries(PP_ASSESSMENTS).find(([, a]) => a.orderId === orderId)
    ? { id: ..., ...PP_ASSESSMENTS[...] }
    : null
}
```

**BUG:** The assessment records have NO `orderId` field. They have `leadId` and `klienId`. `a.orderId` will always be `undefined`. This function will always return `null`.

**IMPACT:** Any page component that calls `getAssessmentByOrderId()` to display assessment data on an order detail page will receive null and show no assessment.

---

## Part 12 — Assignment Logic

### 12.1 Trainer Assignment

**ACTUAL CODE:** `ppOrdersStore[n].picOpsEFM` = trainer name string. Assignment is storing a name, not an ID linked to a trainer entity.

**ACTUAL CODE:** `ppProgramDBData.PROGRAMS_INIT[n].picId = 'EFM-PIC-xxx'` = trainer ID in program template.

**INCONSISTENCY:** Order uses trainer name; program uses trainer ID. No join logic observed.

### 12.2 Assignment Tracking

**MISSING:** No formal "assignment" record. No date of assignment. No reassignment history. No capacity check (how many clients a trainer currently has).

**ACTUAL CODE:** `opsData.picList[n].klienAktif` = static count in OPS data (not computed from actual orders).

### 12.3 Trainer Contract Status

**ACTUAL CODE (opsData):** `tglMulaiPks` (PKS = Perjanjian Kerja Sama start), `tglHabisPks` (PKS end). Some PKS contracts are expired relative to system date (Elena Rodriguez: expired Jun 2024 but still active in orders).

**INFERENCE:** Expired PKS does not prevent trainer assignment. No enforcement.

---

## Part 13 — Schedule & Attendance Logic

### 13.1 Schedule Representation

**ACTUAL CODE:** Schedule is stored as:
- `hariLatihan: ['Senin', 'Rabu']` — days of week
- `jamLatihan: '07:00 WIB'` — time string
- `lokasiLatihan: '...'` — location string

No calendar entity. No session-by-session schedule. No conflict detection.

### 13.2 Attendance Records

**ACTUAL CODE (ppAbsensiData.ABSENSI_SEED):** Object keyed by Order ID. Each entry = one completed session:

```js
{
  id: 'ABS-001',
  jadwalId: 'JS-0001-1',    // schedule slot ID
  tanggal: '2026-09-01',    // actual session date
  jam: '07:02',              // check-in time
  lokasi: 'Studio Yoga...',  // actual location
  device: 'iPhone 15 Pro',   // device used for check-in
  fotoUrl: 'https://drive.google.com/...',  // dummy Google Drive URL
  catatanKoreksi: '',        // correction notes
}
```

### 13.3 sesiDone / sesiTotal Relationship

**ACTUAL CODE:** `ppOrdersData.sesiDone` must equal the count of entries in `ABSENSI_SEED[orderId]`. File comment explicitly states this constraint:

> "Jumlah entry per order HARUS sama dengan sesiDone di ppOrdersData.js"

**MISSING:** No code enforces this constraint. It is a data consistency comment, not a programmatic check.

### 13.4 Photo Proof of Attendance

**ACTUAL CODE:** `fotoUrl` in absensi record is a Google Drive URL. All URLs in seed data are dummy/placeholder.

**MISSING:** No file upload integration. No actual photo storage.

### 13.5 Session Correction (Koreksi)

**ACTUAL CODE:** `catatanKoreksi: ''` — field exists but is empty in all seed records. Implies correction workflow is designed but not yet populated.

---

## Part 14 — Business Gates

Gates = conditions that should block an action if not met.

| Action | Required Condition | Source Code | Current Behavior |
|---|---|---|---|
| Create Order | Lead must exist and be converted | No enforcement | MISSING |
| Send Invoice | Order must be active | No enforcement | MISSING |
| Confirm Payment | Invoice must be in correct status | No enforcement | MISSING |
| Create Receipt | Invoice must be paid | No enforcement | MISSING |
| Activate Program | Receipt exists + Agreement signed | No enforcement | MISSING |
| Record Attendance | Order must be Aktif, sesiDone < sesiTotal | No enforcement | MISSING |
| Complete Order | sesiDone === sesiTotal | No enforcement | MISSING |
| Cancel Order | Manual only | No enforcement | MISSING |
| Renew Order | Previous assessment Post-Test Selesai | No enforcement | MISSING |
| Doctor clearance required | Sri Wahyuni (hypertension), Hendra (back pain) | No enforcement | MISSING |

**Summary:** No business gates are implemented in the observed data layer. All workflow constraints are conceptual / documented intent only.

---

## Part 15 — Status / State Machine Consolidation

### 15.1 Complete Status Inventory

| Entity | Field | Values |
|---|---|---|
| Lead (ppLeadsData) | status | new, follow-up, closed-won, closed-lost |
| Lead (ppLeadsStore) | statusPipeline | New, Approach, Screening, Invoicing, Closing, Convert, Lost |
| Order | statusOrder | Aktif, Completed, Cancelled |
| Order | tahapan | Invoice, Agreement, Program Berjalan, Program Selesai, Kontrak Dibatalkan |
| Order | contractStatus | Active, Completed, Terminated, N/A |
| Invoice | status | paid, pending, overdue, draft |
| Receipt | waStatus | sent, not-sent, failed |
| Agreement | statusTtd | signed, pending, expired, waiting-approval |
| Assessment | statusAssessment | Pre-Test Selesai, Post-Test Selesai |
| B2B Lead | stage | New, Proposal, Presentasi, Closing, Gagal, Converted |
| B2B Event Document | status | drafting, on_review, revision, signed |
| Trainer (OPS) | status | aktif, cuti, nonaktif |
| Trainer PKS | (computed from dates) | active/expired |
| Program (catalog) | status | aktif, nonaktif |
| Service Type (Jenis) | status | aktif, nonaktif |
| Asset | kondisi | baik, servis, rusak |
| Trainer Payment | status | sudah_bayar, belum_bayar, proses |

### 15.2 Cross-Entity Consistency Rules (Observed in Dummy Data)

- Order `statusOrder: 'Cancelled'` → `tahapan: 'Kontrak Dibatalkan'` → Invoice `statusInv: 'overdue'` → No Receipt
- Order `statusOrder: 'Completed'` → `tahapan: 'Program Selesai'` → Invoice `statusInv: 'paid'` → Receipt exists → Agreement `statusTtd: 'signed'`
- Order `statusOrder: 'Aktif'`, `tahapan: 'Agreement'` → Invoice `statusInv: 'paid'` → Receipt exists → Agreement `statusTtd: 'signed'` OR `statusTtd: 'pending'`

**NOTE:** These are observed patterns in seed data, not enforced rules.

---

## Part 16 — Exception / Edge Case Logic

### 16.1 Expired Agreement

**ACTUAL CODE:** 2 expired agreements: AGR-PP-26-0004 (Anita Suryani) and AGR-PP-26-0011 (Fiona Santika). Both have `statusTtd: 'expired'`, `tglTtd: null`, `ttdMetadata: null`. Corresponding orders are Cancelled with overdue invoices.

**MISSING:** No expiry calculation. No auto-expiry trigger. Expiry is manually set.

### 16.2 Couple Program — Only One Klien Has Health Data

**ACTUAL CODE:** In couple programs, typically only the "lead/primary" client has `sudahDiisi: true` while the second person has empty health data. Example: LP-0019 (Reza Putra couple): KL-0020 (Reza) has health data, KL-0021 (Yanti) has empty infoKesehatan.

**MISSING:** No requirement for both Klien to complete health screening before program starts.

### 16.3 Group Program — 5 of 6 Klien Have No Health Data

**ACTUAL CODE:** LP-0021 Grup Zumba: KL-0024 (Mega, coordinator) has health data. KL-0025 through KL-0029 all have empty `infoKesehatan`.

**MISSING:** No enforcement for group participants to complete health screening.

### 16.4 Senior Client with Medical Condition

**ACTUAL CODE:** Sri Wahyuni (KL-0023) on Amlodipin for hypertension. Doctor clearance documents present in `dokumenKesehatan[]`. Agreement notes hypertension monitoring requirement.

**ACTUAL CODE (PAR-Q):** Field `tekananDarahTinggi_awalYa` would be `true` for Sri Wahyuni — but no assessment record exists for her (only for James Wilson and Sari Dewi).

**MISSING:** No clinical clearance gate. No mandatory physician letter requirement before program activation.

### 16.5 Trainer Contract Expired

**ACTUAL CODE:** Elena Rodriguez `tglHabisPks: '2024-06-01'` — expired over 2 years ago (system date Sep 2026). She is still `status: 'aktif'` and assigned to active orders.

**MISSING:** No PKS expiry check. No block on assigning expired-PKS trainers.

### 16.6 Same Klien in Multiple Orders (Renewal)

**ACTUAL CODE:** James Wilson (KL-0001) has `orderIds: ['PP-26-0013', 'PP-27-0001']`. Both orders are active (one Completed, one current).

**ACTUAL CODE:** Two assessments (SCR-26-0001, SCR-27-0001) with prevAssessmentId chain. Assessment history works correctly for this case.

### 16.7 Missing Receipts for Cancelled Orders

**ACTUAL CODE:** PP-26-0010 and PP-26-0003 (Cancelled) have no entries in `ppReceiptData.RECEIPTS_INIT`. This is consistent with never-paid logic.

---

## Part 17 — Private Program (Full Trace: Lead → Attendance → Renewal)

### 17.1 Complete PP Workflow (ACTUAL CODE)

**Step 1: Lead Capture**
- Admin creates Lead (LP-xxxx) in ppLeadsStore
- Fields: nama, noHp, sumber, tipe (Personal/Couple/Group), program
- statusPipeline: 'New'

**Step 2: Approach & Follow-up**
- statusPipeline: 'Approach'
- logAktivitas entries added

**Step 3: Health Screening / Consultation**
- `_healthStore` entry created for lead
- `sudahDiisi: true` when completed
- statusPipeline: 'Screening'

**Step 4: Invoicing**
- Order created (PP-YY-xxxx)
- Invoice created (INV-PP-YY-xxxx) with status: 'pending'
- statusPipeline: 'Invoicing'
- Order tahapan: 'Invoice'

**Step 5: Payment & Receipt**
- Client pays → invoice `status: 'paid'`
- Receipt created (RCP-PP-YY-xxxx)
- waStatus: 'sent' (WhatsApp confirmation)
- statusPipeline: 'Closing'

**Step 6: Agreement**
- Agreement created (AGR-PP-YY-xxxx) with statusTtd: 'pending'
- Client signs (statusTtd: 'waiting-approval')
- Admin approves (statusTtd: 'signed')
- Order tahapan: 'Agreement'
- statusPipeline: 'Convert'

**Step 7: Assessment (Pre-Test)**
- Assessment created (SCR-YY-xxxx)
- Pre-test data filled: Tanita, Girths, PAR-Q, VitalSigns, FMS
- statusAssessment: 'Pre-Test Selesai'
- tglMulaiAktual set on Order

**Step 8: Program Running**
- Order tahapan: 'Program Berjalan'
- Sessions delivered by trainer
- Attendance recorded (ABS-xxx per session)
- sesiDone increments

**Step 9: Post-Test**
- All sessions completed (sesiDone = sesiTotal)
- Post-test data filled in Assessment
- statusAssessment: 'Post-Test Selesai'
- Order tahapan: 'Program Selesai', statusOrder: 'Completed'

**Step 10: Renewal**
- New Order created
- New Assessment created with prevAssessmentId = old assessment
- Post-test values copied to new pre-test (INFERENCE — not implemented in observed code)
- New Invoice, Receipt, Agreement created

### 17.2 Gaps in Observed Implementation

| Step | Gap |
|---|---|
| Lead → Klien creation | No automated Klien record creation on Lead convert |
| Invoice → Agreement | No gate preventing agreement creation before invoice paid |
| Assessment linkage | `getAssessmentByOrderId()` is broken — cannot retrieve assessment by order |
| sesiDone update | No function observed that increments sesiDone on attendance record |
| Order completion | No auto-complete when sesiDone = sesiTotal |
| Renewal auto-copy | Described in comments, not implemented as a function |

---

## Part 18 — B2B Event (Full Trace: Lead → Settlement)

### 18.1 B2B Event Workflow (DOCUMENTED INTENT)

Per CLAUDE.md: "Leads → Konsultasi → Quotation → Order → Invoice → Kelas Jalan → Pelatih Absen → Rekap"

### 18.2 Routes Available (ACTUAL CODE from App.jsx)

```
/event/leads/:id          → EventLeadDetailPage
/event/konsultasi/:id     → EventKonsultasiDetailPage
/event/quotation/:id      → EventQuotationDetailPage
/event/orders/:id         → EventOrderDetailPage
/event/invoice            → EventInvoicePage (list)
/event/receipt            → EventReceiptPage (list)
/event/kalender           → EventKalenderPage
```

**MISSING ROUTES:** No `/event/agreement/:id`. No `/event/documents` route despite B2BDocumentsPage and EventDocumentsPage being imported in App.jsx. These pages are unreachable.

### 18.3 Event Document Data

**ACTUAL CODE (eventData.js):** `eventDocuments` — 6 records. IDs use `#EV-DOC-xxx` format (wrong per design standards — should not have `#` prefix for non-Order documents). Document types: Kontrak, MOU, LOI. Status: drafting, on_review, revision, signed.

**INCONSISTENCY:** ID format `#EV-DOC-001` should be `LOI-EFM-EVENT-YY-xxxx` per design standards.

### 18.4 B2B Event Leads Data

**ACTUAL CODE (stores exist, not fully read):** `eventLeadsStore.js` exists. From App.jsx routes, Event leads have individual detail pages with IDs (`:id` in route).

### 18.5 Settlement Logic

**MISSING:** No settlement/reconciliation data observed. No "Rekap" financial settlement entity seen in event data files.

---

## Part 19 — B2B Management (Full Trace: Lead → Renewal)

### 19.1 B2B Management Workflow (DOCUMENTED INTENT)

Per CLAUDE.md: "Leads → Survei → Quotation → Order → Invoice → Kontrak"

### 19.2 Routes Available (ACTUAL CODE from App.jsx)

```
/b2b/leads           → B2BLeadsPage (list)
/b2b/survei/:id      → B2BSurveiDetailPage
/b2b/orders/:id      → B2BOrderDetailPage
/b2b/kalender        → B2BKalenderPage
/b2b/invoice         → B2BInvoicePage (list)
/b2b/receipt         → B2BReceiptPage (list)
```

**MISSING ROUTES:** No `/b2b/quotation/:id`. No `/b2b/agreement/:id`. No `/b2b/documents`.

### 19.3 B2B Lead IDs

**ACTUAL CODE:** `b2bData.CORP_LEADS_INIT` uses IDs like `BC-001`, `BC-002`. `APT_LEADS_INIT` uses `BA-001`, `BA-002`.

**INCONSISTENCY:** Per design standards, B2B Management leads should use `LB-xxxx` format. BC-/BA- are non-standard and were apparently created before the standard was established.

### 19.4 B2B Contract Renewal

**MISSING:** No contract renewal logic observed. `EXPIRING_CONTRACTS` is static display data only.

---

## Part 20 — Shared vs Business-Specific Logic Matrix

| Logic | PP | B2B Management | B2B Event | Notes |
|---|---|---|---|---|
| Lead capture | ✅ Full store | ✅ Partial (list only) | ✅ Store exists | |
| Health screening | ✅ Full (PAR-Q + docs) | ❌ Not observed | ❌ Not observed | PP-only |
| Fitness assessment | ✅ Full (9 sections) | ❌ Not observed | ❌ Not observed | PP-only |
| Invoice creation | ✅ Full | ✅ (not read) | ✅ (not read) | All modules |
| Receipt creation | ✅ Full | ✅ (not read) | ✅ (not read) | All modules |
| Agreement/Contract | ✅ AGR-PP, digital TTD | ❌ No route | ❌ No route | PP only has working flow |
| Attendance tracking | ✅ Per-session absensi | ❌ Not observed | ✅ (designed) | PP + B2B Event |
| Program renewal | ✅ Assessment copy chain | ❌ Not observed | N/A (one-time events) | |
| Promo/discount codes | ✅ (ppPromoData) | ❌ Not observed | ❌ Not observed | |
| Trainer assignment | ✅ picOpsEFM field | ✅ (assumed) | ✅ (assumed) | |
| WhatsApp notification | ✅ waStatus field | ❌ Not observed | ❌ Not observed | |
| Digital signature | ✅ waiting-approval flow | ❌ Not observed | ❌ Not observed | PP only |
| Document versioning | ❌ Not observed | ❌ Not observed | ✅ revisions[] in eventDocuments | Event only |

---

## Part 21 — Legacy / Obsolete / Duplicate Logic

### 21.1 Dual Lead Status Systems

**ACTUAL CODE:** `ppLeadsData.status` (4 values: new/follow-up/closed-won/closed-lost) AND `ppLeadsStore.statusPipeline` (7 values: New/Approach/Screening/Invoicing/Closing/Convert/Lost) exist for the same leads.

**ASSESSMENT:** Possible legacy — simple status for list display, full pipeline for detail page. But they are not synchronized.

### 21.2 Two Trainer Registries

**ACTUAL CODE:** `opsData.picList` (8 trainers, PIC-xxx IDs) AND `ppProgramDBData.PIC_DB` (6 trainers, EFM-PIC-xxx IDs). The same physical trainers appear in both with different IDs and different data.

**ASSESSMENT:** Likely legacy — PIC_DB may have been created before OPS module. Duplicate data with no sync.

### 21.3 Non-Standard B2B Lead IDs

**ACTUAL CODE:** `b2bData.BC-xxx` and `b2bData.BA-xxx` IDs. Design standard specifies `LB-xxxx`.

**ASSESSMENT:** Legacy IDs that predate the ID format standard.

### 21.4 Non-Standard Event Document IDs

**ACTUAL CODE:** `eventData.#EV-DOC-xxx`. Design standard specifies `LOI-EFM-EVENT-YY-xxxx`.

**ASSESSMENT:** Legacy format. `#` prefix should not appear on non-Order documents.

### 21.5 Duplicate formatRp Functions

**ACTUAL CODE:** `formatRp()` is defined in multiple data files: `ppOrdersData.js`, `ppReceiptData.js`, `b2bData.js`, `ppProgramDBData.js`. Each file has its own copy.

**ASSESSMENT:** Technical debt — shared utilities should be extracted once. Not a business logic issue but indicates rapid parallel development without DRY refactoring.

### 21.6 Two Separate Data Files Per Entity (List + Store)

**ACTUAL CODE:** For each PP entity, there are two files:
- `ppXxxData.js` — simple export array (for list page state initialization)
- `ppXxxStore.js` — mutable array with CRUD functions (for detail page)

**ASSESSMENT:** This is intentional architecture (described in efm-prompt-pattern skill). Not legacy — it's the design pattern.

---

## Part 22 — Intended Business Logic vs Current Code Matrix

| Business Requirement | Documented Intent | Current Code Status | Gap |
|---|---|---|---|
| Lead pipeline tracking | 7-stage pipeline | Field exists, manual update only | No auto-advance |
| Health screening gate | H&S must be completed before program | Data field only | No enforcement |
| Doctor clearance for at-risk clients | Clear from notes (Sri Wahyuni, Hendra) | Document field only | No gate |
| Invoice generation from order | Create invoice when order confirmed | Data exists; no generation function | No auto-create |
| Payment confirmation → receipt | Payment proof → admin confirm → receipt | Data exists; no automation | No trigger |
| Agreement digital signature | Client signs via link → admin approves | Status flow designed; no link mechanism | No signing link |
| Agreement snapshot on signing | Freeze document data at signature | No snapshot observed | No snapshot |
| Attendance check-in with photo | Trainer submits GPS + photo proof | Field exists; dummy URL; no upload | No upload |
| sesiDone increment on attendance | Auto-increment when session recorded | Seed data consistent; no function | No increment function |
| Auto-complete order | Order complete when sesiDone = sesiTotal | No auto-complete observed | No trigger |
| Assessment renewal auto-copy | Post-test → Pre-test on renewal | Described in comment; seed data shows result | No function implemented |
| getAssessmentByOrderId() | Find assessment for an order | Function exists but broken (orderId field missing) | Bug |
| Promo code validation | Apply discount with code | promoKode field in invoice; ppPromoData exists | Logic not traced |
| PKS expiry check | Block expired trainer assignment | No check observed | No enforcement |
| Contract renewal reminder | Alert when B2B contract expires | EXPIRING_CONTRACTS static list | No alert |
| WhatsApp receipt notification | Auto-send WA after payment | waStatus field; no API | No API |

---

## Part 23 — WHY / Rationale Reconstruction

### 23.1 Why Lead ≠ Klien?

**RATIONALE (from data comments and structure):** EFM's business model includes couple programs (husband/wife, parent/child) and group programs (6-person Zumba). The paying party (Lead/payer) is often different from the people training (Klien). A parent paying for their elderly parents to train, or a couple paying together, requires this separation.

### 23.2 Why Two Data Files Per Entity?

**RATIONALE (from efm-prompt-pattern skill):** List pages need lightweight data to render quickly. Detail pages need full schema with all editable fields. Keeping them separate allows the list to stay fast without loading all detail data.

### 23.3 Why Is All Data In-Memory?

**RATIONALE (CLAUDE.md):** "Status: UI-only dengan dummy data. Belum terhubung ke backend/Google Sheets API (fase depan)." This is explicitly a prototype/demo phase. Production persistence via Google Sheets API is planned.

### 23.4 Why Does Agreement Have 'waiting-approval' State?

**RATIONALE:** Digital signature workflow — client signs remotely (via link/QR code), but admin must verify the signature is genuine before activating the agreement. This two-step approval prevents fraudulent signatures.

### 23.5 Why Does Pre-Test Copy Post-Test on Renewal?

**RATIONALE (assessment comments):** Fitness metrics change gradually. When a client renews, there's no need to re-measure from scratch — the final state of the previous program is the starting state of the new one. This maintains continuity in the progress record.

### 23.6 Why Is hargaPerSesi Different in Agreement vs Invoice?

**RATIONALE:** Invoice shows per-person cost. Agreement shows total cost per training session (for the trainer to charge). Couple: per-session cost to EFM = 1 trainer × 1 hour, but 2 clients pay. Agreement `hargaPerSesi = 400k` = 200k × 2 people, which is the session revenue EFM earns.

### 23.7 Why Is the Group Zumba Rate Different (175k vs 200k/sesi)?

**RATIONALE (INFERENCE from data):** Group programs likely have a lower per-person rate because the trainer delivers to 6 people in one session (higher revenue per trainer hour for EFM). Pricing is 175k/person vs 200k/person for individual — a volume discount.

### 23.8 Why Are B2B Documents Unreachable?

**RATIONALE (INFERENCE):** `B2BDocumentsPage` and `EventDocumentsPage` were built/imported but their route definitions were never added to App.jsx. This is likely an incomplete feature that was UI-built but not yet wired.

---

## Part 24 — Final Business Logic Map

### 24.1 Currently Implemented (ACTUAL CODE)

| Area | Implementation Level |
|---|---|
| PP Lead capture | Full data model, manual update |
| PP Lead pipeline stages | Full status enum, manual only |
| PP Health data collection | Full data model |
| PP Order full schema | Full (ppOrdersStore) |
| PP Invoice full schema | Full (ppInvoiceData) |
| PP Receipt full schema | Full (ppReceiptData) |
| PP Agreement full schema | Full (ppDocumentsData) |
| PP Assessment pre+post test | Full data model (2 of many expected records) |
| PP Attendance per-session | Full seed data structure |
| PP Renewal chain (data) | Seeded correctly; function broken |
| PP Promo/discount fields | Fields exist; validation logic not traced |
| B2B Management leads | Partial data model |
| B2B Event leads/konsultasi/quotation | Data stores exist (not fully read) |
| OPS trainer/vendor/asset/payment | Full data model |
| Program catalog | Full (7 programs) |
| Service type registry (Jenis) | Full with CRUD functions |

### 24.2 Documented Intent (Not Yet Implemented)

| Area | Gap Severity |
|---|---|
| Business gates / workflow enforcement | HIGH — no gate blocks any action |
| Auto-state-transition triggers | HIGH — all transitions are manual |
| Agreement digital signature link | HIGH — no URL/QR generation |
| Agreement snapshot on signing | HIGH — data will diverge on edit |
| Assessment auto-copy on renewal | MEDIUM — described, not coded |
| sesiDone auto-increment | MEDIUM — no increment function |
| getAssessmentByOrderId() fix | MEDIUM — broken function |
| Google Sheets API backend | HIGH — entire persistence layer |
| WhatsApp API | MEDIUM — receipt notification |
| PDF generation (invoice/agreement/receipt) | HIGH — download button likely placeholder |
| B2B documents page routing | LOW — pages built, routes missing |
| Promo code validation logic | MEDIUM — fields exist, logic unknown |
| PKS expiry enforcement | LOW — trainer management |
| Contract renewal reminder | MEDIUM — B2B management |
| Lead → Klien auto-creation | MEDIUM — manual currently |

### 24.3 Known Code Bugs

| Bug | Location | Severity | Description |
|---|---|---|---|
| `getAssessmentByOrderId()` always returns null | ppAssessmentsData.js:342 | HIGH | Checks `a.orderId` but field doesn't exist |
| AGR-PP-27-0002 wrong leadId | ppDocumentsData.js (AGR-PP-27-0002) | MEDIUM | leadId: 'LP-0002' should be 'LP-0019' |
| AGR-PP-27-0004 klienList names mismatch | ppDocumentsData.js vs ppKlienData.js | MEDIUM | 5 of 6 client names differ between data files |
| B2B leads use non-standard IDs | b2bData.js | LOW | BC-xxx/BA-xxx should be LB-xxxx |
| Event documents use non-standard IDs | eventData.js | LOW | #EV-DOC-xxx should be LOI-EFM-EVENT-xx-xxxx |
| Elena Rodriguez PKS expired | opsData.js | LOW | tglHabisPks: '2024-06-01' but still active |
| Dual lead status not synchronized | ppLeadsData + ppLeadsStore | MEDIUM | status vs statusPipeline may disagree |

---

## Part 25 — Decisions Required from EFM Owner

The following questions require business decisions before technical implementation can proceed:

### 25.1 Agreement Architecture
1. **Snapshot vs Live Data**: Should the agreement document freeze all data at the moment of signing (creating a PDF snapshot), or remain linked to live order data? If snapshot: what fields are frozen and what can still change?
2. **Digital Signature**: What is the signing mechanism? Link sent via WhatsApp? QR code on paper? Third-party e-sign service (DocuSign, PrivyID)? This determines the entire signing flow.
3. **Who can approve agreements?** Currently hardcoded as "Bagoes Santoso." Should there be a role-based approval system?

### 25.2 Health & Safety Gates
4. **Is H&S screening a hard gate?** Can a program start without health data? Can a hypertensive client (like Sri Wahyuni) train without doctor clearance uploaded?
5. **What happens if PAR-Q answers indicate risk?** Currently no logic. Should there be a mandatory referral step?

### 25.3 Pricing
6. **Couple/Group rate rule**: Is the per-person rate for couples always the same as individual (200k/sesi)? Or can it differ? Is the group Zumba rate (175k/person) a special case or a general rule for group programs?
7. **Promo code rules**: What conditions make a promo code valid? One-time use? Date expiry? Minimum package size?

### 25.4 Workflow Automation
8. **What should trigger automatic state transitions?** E.g., when all sessions are done → should the system automatically mark order Completed? Or does admin confirm?
9. **Renewal**: Should the post-test → pre-test copy happen automatically when a new order is created, or is it a manual admin action?

### 25.5 Business Entity Scope
10. **Klien creation**: When does a Lead become a Klien? At order creation? At agreement signing? At first session?
11. **Group program participants**: For Grup Zumba, must all 6 participants complete health screening before the program starts?

### 25.6 B2B Module
12. **B2B Documents routing**: Should B2BDocumentsPage and EventDocumentsPage be added as routes? Or are they replaced by a different approach?
13. **B2B Agreement**: Is the agreement flow for B2B the same as PP (digital signature + admin approval)? Or is it a traditional PDF/hard copy process?

### 25.7 Operations
14. **Trainer capacity limits**: Should there be a maximum number of clients per trainer enforced by the system?
15. **PKS expiry**: Should an expired PKS block a trainer from being assigned to new orders?

---

## Part 26 — Final Summary

### Overview

EFM V2 is a React-based admin dashboard prototype for a fitness management company operating three business modules: Private Program (PP), B2B Management (corporate gym contracts), and B2B Event (fitness events). The system is UI-only with in-memory JavaScript data; no backend exists.

### What Has Been Built (High Completeness)

The **PP module** has the most complete data model in the codebase:
- Full entity chain: Lead → Klien → Order → Invoice → Receipt → Agreement → Assessment → Attendance
- All data schemas are well-designed with appropriate relationships
- The dual Lead/Klien distinction (payer vs. trainer) is properly modeled
- Couple and group program pricing is correctly implemented in data
- Agreement state machine (pending → waiting-approval → signed | expired) is well-designed
- Fitness assessment pre/post test structure with renewal copy chain is properly designed
- Attendance seed data is consistent with session counts

### What Is Incomplete (Significant Gaps)

1. **No workflow enforcement**: Zero business gates. Any admin can set any status at any time without conditions being met.
2. **No automation**: No triggers, no auto-state-transitions, no computations on data changes.
3. **Broken assessment linkage**: `getAssessmentByOrderId()` is broken and always returns null.
4. **No backend persistence**: All data resets on page reload.
5. **Agreement snapshot missing**: No mechanism to freeze agreement data at signing.
6. **Digital signature not implemented**: Status exists; actual signing link/flow does not.
7. **B2B modules underdeveloped**: B2B Management and Event have much thinner data models than PP.
8. **Data inconsistencies**: Several cross-file mismatches in dummy data.

### Risk Areas

1. **Health & Safety**: Medical conditions are recorded but not enforced. A high-risk client (hypertension, post-injury) could technically be assigned to any program without the system flagging it.
2. **Agreement integrity**: Without snapshot locking, a signed agreement's terms can be altered after signing — creating potential contractual disputes.
3. **Audit trail**: No immutable log of state changes. Agreement approval is hardcoded to one name. Assessment correction notes field is empty in all records.
4. **Trainer PKS tracking**: Expired contracts (Elena Rodriguez) are not flagged.

### Architecture Recommendations (INFERENCE — for owner decision)

These are architectural observations, not implementation directives:

1. The Lead → Klien → Order chain is well-designed and should be preserved.
2. The dual-file pattern (Data + Store) is intentional and working.
3. Assessment renewal chain (prevAssessmentId) is an elegant solution worth preserving.
4. The agreement `waiting-approval` state creates a proper two-party digital signature flow once the signing link is implemented.
5. The `paymentTracking[]` array in Orders suggests installment payment support is intended but not yet surfaced in UI.

---

## End Report

**AUDIT COMPLETE**  
**FILES CHANGED: 1 documentation file only**  
**CODE CHANGED: 0**  
**FEATURES CHANGED: 0**

Files examined: 17 source files  
Data records analyzed: ~200+ across all entities  
Business logic gaps identified: 22  
Code bugs identified: 7  
Decisions pending from EFM owner: 15  

---

*This document was produced by automated read-only analysis of the EFM V2 codebase. All findings are based on actual code and data files. Nothing was changed in the codebase. All conclusions labeled as INFERENCE represent the auditor's interpretation of patterns in the data; they should be verified against the business owner's actual intent.*
