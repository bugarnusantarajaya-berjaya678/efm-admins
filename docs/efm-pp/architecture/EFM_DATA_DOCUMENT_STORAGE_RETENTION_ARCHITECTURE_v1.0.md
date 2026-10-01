# EFM V2 — Data, Document & Storage Retention Architecture v1.0

**Date:** 2026-10-01  
**Branch:** `claude/add-claude-md-instructions-7iqjvo`  
**Scope:** PP + B2B Management + B2B Event (cross-module unified)  
**Status:** AUDIT COMPLETE — Architecture Standard Documented, Coding Phase NOT YET STARTED  
**Author:** Claude Code — EFM V2 Architecture Audit

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Audit Methodology](#2-audit-methodology)
3. [Complete Backend File Inventory](#3-complete-backend-file-inventory)
4. [Complete Frontend File Inventory — Document & Storage Pages](#4-complete-frontend-file-inventory)
5. [Current Storage Architecture State (Verified)](#5-current-storage-architecture-state-verified)
6. [Document Type Registry — All Three Modules](#6-document-type-registry)
7. [File Upload Inventory — All Upload Points](#7-file-upload-inventory)
8. [Version Policy Analysis](#8-version-policy-analysis)
9. [PDF Architecture Analysis](#9-pdf-architecture-analysis)
10. [Image Optimization Strategy — Attendance Photos](#10-image-optimization-strategy)
11. [Payment Proof Retention — Module Comparison](#11-payment-proof-retention)
12. [Reporting & Export Architecture](#12-reporting--export-architecture)
13. [Yearly Archive Strategy](#13-yearly-archive-strategy)
14. [Retention Policy Matrix](#14-retention-policy-matrix)
15. [Supabase Storage Bucket Architecture](#15-supabase-storage-bucket-architecture)
16. [Database vs Storage Strategy](#16-database-vs-storage-strategy)
17. [Storage Cost Simulation](#17-storage-cost-simulation)
18. [Elimination Analysis — What to Cut](#18-elimination-analysis)
19. [PP Final Recommendation — Full Lifecycle Document Map](#19-pp-final-recommendation)
20. [B2B Future Recommendation (DO NOT CODE NOW)](#20-b2b-future-recommendation)
21. [Security Audit — Storage & Document Layer](#21-security-audit)
22. [Agreement Module Critical Gap Analysis](#22-agreement-module-critical-gap-analysis)
23. [Implementation Roadmap — Phase 3 Storage Layer](#23-implementation-roadmap)
24. [Owner Decisions Required](#24-owner-decisions-required)
25. [Final Recommendation Summary](#25-final-recommendation-summary)

---

## 1. Executive Summary

This document is the result of a complete repository audit conducted on 2026-10-01 across the EFM V2 system (backend + frontend + all documentation). Its purpose is to establish a unified, cross-module standard for **data retention, document generation, file storage, and lifecycle management** — covering PP (Private Program), B2B Management, and B2B Event.

### Critical Finding: Storage Layer Does Not Exist

**The single most important finding of this audit:** the EFM V2 system has **zero file storage implementation** anywhere in the codebase. There are no:
- Supabase Storage buckets or SDK calls
- Google Drive API integrations
- S3/GCS bucket connections
- File upload backend endpoints (no multer, no busboy)
- Binary file columns in any PostgreSQL table
- Persistent URLs for any uploaded files

This is not a bug. It is the correct state for Phase 2, which is PP Commercial Core only. However, every file upload touchpoint in the frontend (payment proof, attendance photos, agreement signatures, KTP/NPWP, contract PDFs) is **UI-only** — inputs exist, files are selected, but nothing is transmitted or stored.

This document defines what the storage layer must become when Phase 3 begins.

### Implementation Status Summary

| Layer | PP | B2B Management | B2B Event |
|---|---|---|---|
| Backend API | ✅ 43 endpoints, Phase 2 complete | ❌ Not started | ❌ Not started |
| Database schema | ✅ 19 tables (migrations 001–003) | ❌ None | ❌ None |
| File storage | ❌ Zero implementation | ❌ Zero | ❌ Zero |
| PDF generation | ❌ Zero implementation | ❌ Zero | ❌ Zero |
| Export/Reporting | ❌ Zero backend | ❌ Zero | ❌ Zero |
| Frontend UI | ✅ Full UI with dummy data | ✅ Full UI | ✅ Full UI |
| Agreement signatures | ❌ Canvas only, not persisted | ❌ None | ❌ None |

---

## 2. Audit Methodology

### Sources Read

**Backend:**
- `backend/package.json` — dependency manifest
- `backend/src/modules/` — all 15 module directories
- `backend/src/db/migrations/001_create_schema_foundation.sql`
- `backend/src/db/migrations/002_create_commercial_core.sql`
- `backend/src/db/migrations/003_create_participants_assessments.sql`
- `backend/src/app.js` — router registration
- All `*.service.js`, `*.repository.js`, `*.router.js` files

**Frontend:**
- `REACT-APP/src/pages/` — all 59 pages (pp/, b2b/, event/, laporan/, settings/)
- `REACT-APP/src/data/` — all 28 data files
- `REACT-APP/package.json` — frontend dependency manifest

**Documentation:**
- `docs/PRD_EFM_Management_System.md`
- `docs/EFM_Backend_Architecture_Audit.md`
- `docs/EFM_V2_BUSINESS_LOGIC_MASTER_MAP.md`
- `docs/EFM_V2_BUSINESS_ARCHITECTURE_DECISION_MATRIX.md`
- `docs/EFM_V2_REACT_MASTER_UI_ARCHITECTURE_RECONCILIATION.md`
- `docs/EFM_V2_Agreement_Architecture_Review.md`
- `docs/PP_Agreement_Struktur_Flow.md`
- `docs/efm-pp/phase-2/` — all 12 architecture lock files
- `backend/docs/efm-pp/phase-2/EFM_PP_PHASE_2_FINAL_IMPLEMENTATION_REPORT_v1.0.md`

### Audit Scope

All findings in this document are based on the **actual repository state** as of commit `bd2c92c` (post Phase 2 live DB verification), merged to `main` as squash commit `c7ff22f`. No assumptions were made about planned future implementations.

---

## 3. Complete Backend File Inventory

### 3.1 Module Structure

```
backend/src/
├── app.js                          — Express app, router registration
├── server.js                       — HTTP server entry
├── db/
│   ├── index.js                    — pg Pool, withTransaction, query helpers
│   └── migrations/
│       ├── 001_create_schema_foundation.sql   — id_sequences, audit_events, pic_master, pic_contexts
│       ├── 002_create_commercial_core.sql     — programs, offerings, packages, leads_pp, clients_pp, orders_pp, snapshots, invoices_pp, payments_pp, receipts_pp, refunds_pp
│       └── 003_create_participants_assessments.sql  — participants_pp, assessments_pp
├── modules/
│   ├── agreement/
│   │   └── agreement.guard.js      — GUARD ONLY — no router, no service, no DB table
│   ├── assessment/
│   │   ├── assessment.repository.js
│   │   ├── assessment.service.js
│   │   └── assessment.router.js
│   ├── audit/
│   │   ├── audit.service.js
│   │   └── audit.router.js
│   ├── catalog/
│   │   ├── catalog.service.js
│   │   └── catalog.router.js
│   ├── client/
│   │   ├── client.repository.js
│   │   ├── client.service.js
│   │   └── client.router.js
│   ├── health/
│   │   └── health.router.js
│   ├── id/
│   │   └── id.generator.js         — nextId(), sequence management
│   ├── invoice/
│   │   ├── invoice.repository.js
│   │   ├── invoice.service.js
│   │   └── invoice.router.js
│   ├── lead/
│   │   ├── lead.repository.js
│   │   ├── lead.service.js
│   │   └── lead.router.js
│   ├── order/
│   │   ├── order.repository.js
│   │   ├── order.service.js
│   │   └── order.router.js
│   ├── participant/
│   │   ├── participant.repository.js
│   │   ├── participant.service.js
│   │   └── participant.router.js
│   ├── payment/
│   │   ├── payment.repository.js
│   │   ├── payment.service.js
│   │   └── payment.router.js
│   ├── pic/
│   │   ├── pic.repository.js
│   │   ├── pic.service.js
│   │   └── pic.router.js
│   ├── receipt/
│   │   ├── receipt.repository.js
│   │   ├── receipt.service.js
│   │   └── receipt.router.js
│   └── refund/
│       ├── refund.repository.js
│       ├── refund.service.js
│       └── refund.router.js
└── shared/
    ├── errors.js                   — AppError, businessRuleViolation, etc.
    ├── config.js                   — env config
    ├── correlationId.js            — request correlation middleware
    └── deadlineEngine.js           — PP deadline/urgency classification
```

### 3.2 Backend Dependencies (package.json — verified)

| Package | Version | Purpose |
|---|---|---|
| `express` | ^4.19.2 | HTTP server |
| `pg` | ^8.12.0 | PostgreSQL client |
| `uuid` | ^10.0.0 | UUID generation (payment IDs) |
| `dotenv` | ^16.4.5 | Environment config |
| `jest` | ^29.7.0 | (dev) Test runner |
| `supertest` | ^7.0.0 | (dev) HTTP integration tests |

**ABSENT (confirmed zero):** multer, busboy, formidable (only in node_modules as transitive dep of superagent/supertest — NOT used in app code), supabase, @aws-sdk, googleapis, pdf-lib, pdfkit, puppeteer, jsPDF, exceljs, xlsx, fs-extra

### 3.3 Database Tables — Complete List

| Table | Module | Rows | Notes |
|---|---|---|---|
| `id_sequences` | Foundation | — | Atomic sequence generation |
| `audit_events` | Foundation | — | Append-only, UUID PK |
| `pic_master` | Foundation | — | Personal trainers |
| `pic_contexts` | Foundation | — | PIC availability per module/program |
| `programs` | PP Catalog | — | Program hierarchy level 1 |
| `offerings` | PP Catalog | — | Program hierarchy level 2 |
| `packages` | PP Catalog | — | Program hierarchy level 3 |
| `package_prices` | PP Catalog | — | Price per package |
| `leads_pp` | PP | — | LP-xxxx, permanent |
| `clients_pp` | PP | — | KL-xxxx, permanent |
| `orders_pp` | PP | — | PP-YY-xxxx, annual reset |
| `order_commercial_snapshots` | PP | — | Write-once, FK=order_id |
| `invoices_pp` | PP | — | INV-PP-YY-xxxx, UNIQUE(order_id) |
| `payments_pp` | PP | — | UUID PK |
| `receipts_pp` | PP | — | RCP-PP-YY-xxxx, UNIQUE(payment_id) |
| `refunds_pp` | PP | — | REF-PP-YY-xxxx, UNIQUE(payment_id) |
| `participants_pp` | PP | — | PTR-PP-YY-xxxx, UNIQUE(order_id) |
| `assessments_pp` | PP | — | SCR-YY-xxxx, GLOBAL bucket |

**Total: 19 tables.** No file storage columns exist in any table. No `file_url`, `photo_url`, `payment_proof_url`, `agreement_url`, `signature_data` columns anywhere.

---

## 4. Complete Frontend File Inventory

### 4.1 PP Module Pages

| File | Purpose | Storage Touches |
|---|---|---|
| `PPDashboard.jsx` | PP module dashboard with KPIs | None |
| `PPLeadsPage.jsx` | Lead list + pipeline view | None |
| `PPLeadDetailPage.jsx` | Lead detail, edit, PIC assignment | KTP/NPWP upload UI (not wired) |
| `PPLeadNewPage.jsx` | Create new lead | None |
| `PPKlienListPage.jsx` | Client list | None |
| `PPKlienDetailPage.jsx` | Client detail, health card | None |
| `PPOrdersPage.jsx` | Order list with status filters | None |
| `PPOrderDetailPage.jsx` | Order detail, tabs, agreement link | File input (not wired) |
| `PPOrderNewPage.jsx` | Create new order with package selection | None |
| `PPInvoicePage.jsx` | Invoice list | None |
| `PPInvoiceDetailPage.jsx` | Invoice detail + payment proof upload | `<input type="file">` — UI only |
| `PPReceiptPage.jsx` | Receipt list | None |
| `PPReceiptDetailPage.jsx` | Receipt detail, download button | Download button — no backend |
| `PPDocumentsPage.jsx` | Agreement list | None |
| `PPAgreementDetailPage.jsx` | Agreement detail + canvas signature | Canvas signature — not persisted |
| `PPRekapAbsensiDetailPage.jsx` | Attendance recap, honorarium proof | `<input type="file">` — UI only |
| `PPFitnessAssessmentPage.jsx` | Assessment list/detail | None |
| `PPScreeningPage.jsx` | Health screening | None |
| `PPProgramDBPage.jsx` | Program catalog | None |
| `PPProgramFormPage.jsx` | Create/edit program | None |
| `PPJenisProgramPage.jsx` | Jenis (type) management | None |
| `PPPromoPage.jsx` | Promo list | None |
| `PPPromoFormPage.jsx` | Create/edit promo | None |

### 4.2 B2B Management Pages

| File | Purpose | Storage Touches |
|---|---|---|
| `B2BDashboardPage.jsx` | B2B dashboard | None |
| `B2BLeadsPage.jsx` | B2B lead list | None |
| `B2BOrdersPage.jsx` | Order list | File input (survey docs) — UI only |
| `B2BOrderDetailPage.jsx` | Order detail | File input — UI only |
| `B2BOrderNewPage.jsx` | Create new B2B order | None |
| `B2BInvoicePage.jsx` | Invoice list | File input (payment proof) — UI only |
| `B2BReceiptPage.jsx` | Receipt list | None |
| `B2BDocumentsPage.jsx` | Contract PDF upload/list | `<input type="file">` + `googleDocsUrl` — both UI only |
| `B2BSurveyPage.jsx` | Survey list | None |
| `B2BSurveiDetailPage.jsx` | Survey detail with attachments | File input — UI only |
| `B2BKalenderPage.jsx` | Calendar view | None |

### 4.3 B2B Event Pages

| File | Purpose | Storage Touches |
|---|---|---|
| `EventDashboardPage.jsx` | Event dashboard | None |
| `EventLeadsPage.jsx` | Event lead list | None |
| `EventLeadDetailPage.jsx` | Event lead detail | None |
| `EventLeadNewPage.jsx` | Create lead | None |
| `EventOrdersPage.jsx` | Order list | None |
| `EventOrderDetailPage.jsx` | Order detail | File input — UI only |
| `EventOrderDetailHeader.jsx` | Order detail header component | None |
| `EventOrderNewPage.jsx` | Create order | None |
| `EventQuotationPage.jsx` | Quotation list | None |
| `EventQuotationDetailPage.jsx` | Quotation detail | None |
| `EventInvoicePage.jsx` | Invoice list | None |
| `EventReceiptPage.jsx` | Receipt list | None |
| `EventDocumentsPage.jsx` | LOI/contract PDF upload | `<input type="file">` + `googleDocsUrl` — UI only |
| `EventKonsultasiPage.jsx` | Consultation list | None |
| `EventKonsultasiDetailPage.jsx` | Consultation detail | None |
| `EventKalenderPage.jsx` | Calendar | None |

### 4.4 Reporting / Export Pages

| File | Purpose | Backend Wired? |
|---|---|---|
| `LaporanExportPage.jsx` | Full export UI: period, module, format (PDF/Excel), history | ❌ Simulated entirely |
| `LaporanRevenuePage.jsx` | Revenue dashboard with charts | ❌ Static dummy data |
| `LaporanPenjualanPage.jsx` | Sales report | ❌ Static dummy data |
| `LaporanLabaPage.jsx` | Profit/loss report | ❌ Static dummy data |

### 4.5 Settings Page

| File | Purpose | Storage Touches |
|---|---|---|
| `SettingsPage.jsx` | Company logo, CEO signature upload, branding | `<input type="file">` — both UI only |

### 4.6 Frontend Data Files — Storage-Relevant Fields

| File | Key Storage Fields | Type |
|---|---|---|
| `ppAbsensiData.js` | `fotoUrl` (Google Drive URL pattern) | `string` — dummy URL |
| `ppDocumentsData.js` | `statusTtd`, `ttdMetadata` (device/IP/timestamp) | `object` — in-memory |
| `b2bData.js` | `googleDocsUrl` (Google Docs URL strings) | `string` — dummy URL |
| `eventData.js` | `googleDocsUrl` (Google Docs URL strings) | `string` — dummy URL |

---

## 5. Current Storage Architecture State (Verified)

### 5.1 What Exists

```
STORAGE LAYER STATE AS OF 2026-10-01
─────────────────────────────────────────────
Layer                    Status      Evidence
─────────────────────────────────────────────
Supabase Storage         ❌ ZERO     No SDK in any package.json
Google Drive API         ❌ ZERO     No googleapis package, no OAuth
AWS S3                   ❌ ZERO     No @aws-sdk package
File upload middleware    ❌ ZERO     No multer/busboy in app code
File URL DB columns      ❌ ZERO     All migrations audited
PDF generation           ❌ ZERO     No pdfkit/puppeteer/jsPDF
XLSX/CSV backend         ❌ ZERO     No exceljs/xlsx
Cron/scheduler           ❌ ZERO     No cron package
Auth middleware           ❌ ZERO     All endpoints are open
─────────────────────────────────────────────
```

### 5.2 What the Frontend Believes Exists (vs Reality)

| UI Element | What UI Shows | What Actually Happens |
|---|---|---|
| Payment proof upload (PPInvoiceDetailPage) | File picker, preview, "Konfirmasi" button | File stays in browser memory. Never sent anywhere. |
| Attendance photo (ppAbsensiData) | Rendered `fotoUrl` as `<img>` | Points to dummy `drive.google.com` URLs that 404 |
| Agreement signature (PPAgreementDetailPage) | Canvas signature pad with save | Base64 data stored in React state. Lost on page reload. |
| Honorarium proof (PPRekapAbsensiDetailPage) | File picker, upload button | UI only. Nothing sent. |
| Contract PDF (B2BDocumentsPage, EventDocumentsPage) | File picker + `googleDocsUrl` display | Stored in JS array only. Lost on reload. |
| Company logo (SettingsPage) | Image upload, preview | Stored in `localStorage` or component state only. |
| CEO signature (SettingsPage) | Image upload, preview | Same — state/localStorage only. |
| Export (LaporanExportPage) | Full export UI with "progress" animation | Fake progress. No file generated. No download. |

### 5.3 Reference Architecture (PRD — Not Yet Implemented)

From `docs/PRD_EFM_Management_System.md`:
- **Original storage target:** Google Drive for all documents/photos
- **Original PDF target:** jsPDF (client-side) for invoice/agreement generation
- **Original data target:** Google Sheets as operational database

The PRD is from the GAS (Google Apps Script) era and is **superseded** by the Node.js + PostgreSQL architecture. The storage design must be re-derived from scratch for the new backend.

---

## 6. Document Type Registry

### 6.1 PP Module Documents

| Doc Type | ID Format | Backend Table | Generated Where? | Storage Target |
|---|---|---|---|---|
| Order | `PP-YY-xxxx` | `orders_pp` | Backend (DB record) | DB only |
| Order Snapshot | — | `order_commercial_snapshots` | Backend (write-once) | DB only |
| Invoice | `INV-PP-YY-xxxx` | `invoices_pp` | Backend (DB record) | DB only — **PDF not yet generated** |
| Receipt | `RCP-PP-YY-xxxx` | `receipts_pp` | Backend (auto on payment confirm) | DB only — **PDF not yet generated** |
| Refund | `REF-PP-YY-xxxx` | `refunds_pp` | Backend (DB record) | DB only |
| Participant | `PTR-PP-YY-xxxx` | `participants_pp` | Backend (DB record) | DB only |
| Assessment | `SCR-YY-xxxx` | `assessments_pp` | Backend (DB record) | DB only |
| Agreement | `AGR-PP-YY-xxxx` | ❌ **NO TABLE** | Frontend (React render) | ❌ **NOT PERSISTED** |
| Attendance Photo | — | ❌ **NO TABLE** | External (trainers take photo) | ❌ **Not wired** |
| Payment Proof | — | ❌ **NO TABLE** | Client uploads | ❌ **Not wired** |

### 6.2 B2B Management Documents

| Doc Type | ID Format | Backend Table | Status |
|---|---|---|---|
| Lead | `LB-xxxx` | ❌ NOT BUILT | Frontend dummy only |
| Order | `B2B-YY-xxxx` | ❌ NOT BUILT | Frontend dummy only |
| Invoice | `INV-B2B-YY-xxxx` | ❌ NOT BUILT | Frontend dummy only |
| Receipt | `RCP-B2B-YY-xxxx` | ❌ NOT BUILT | Frontend dummy only |
| LOI/Agreement | `LOI-EFM-B2B-YY-xxxx` | ❌ NOT BUILT | Frontend + Google Docs URL string |
| Survey Report | — | ❌ NOT BUILT | Frontend + Google Docs URL string |

### 6.3 B2B Event Documents

| Doc Type | ID Format | Backend Table | Status |
|---|---|---|---|
| Lead | `LE-xxxx` | ❌ NOT BUILT | Frontend dummy only |
| Order | `EV-YY-xxxx` | ❌ NOT BUILT | Frontend dummy only |
| Quotation | — | ❌ NOT BUILT | Frontend dummy only |
| Invoice | `INV-EV-YY-xxxx` | ❌ NOT BUILT | Frontend dummy only |
| Receipt | `RCP-EV-YY-xxxx` | ❌ NOT BUILT | Frontend dummy only |
| LOI/Agreement | `LOI-EFM-EVENT-YY-xxxx` | ❌ NOT BUILT | Frontend + Google Docs URL string |
| Consultation Notes | — | ❌ NOT BUILT | Frontend dummy only |

---

## 7. File Upload Inventory

### 7.1 All Upload Points (Complete — No Exceptions)

| Page | Upload Type | Format | Current State | Priority for Phase 3 |
|---|---|---|---|---|
| `PPInvoiceDetailPage.jsx` | Payment proof (bukti transfer) | Image/PDF | UI only | **HIGH** — blocks payment confirmation flow |
| `PPRekapAbsensiDetailPage.jsx` | Trainer honorarium proof | Image/PDF | UI only | MEDIUM |
| `PPAgreementDetailPage.jsx` | Client signature (canvas → base64) | PNG/SVG | Canvas only, lost on reload | **CRITICAL** — legal record |
| `PPLeadDetailPage.jsx` | KTP/NPWP scan (implicit) | Image/PDF | UI only | LOW |
| `PPOrderDetailPage.jsx` | Supporting documents | Any | UI only | LOW |
| `B2BInvoicePage.jsx` | Payment proof | Image/PDF | UI only | MEDIUM |
| `B2BOrderDetailPage.jsx` | Survey attachments | PDF/Image | UI only | MEDIUM |
| `B2BSurveiDetailPage.jsx` | Site survey photos + report | Image/PDF | UI only | MEDIUM |
| `B2BDocumentsPage.jsx` | Contract PDF | PDF | UI only + Google Docs URL | LOW (B2B not in scope) |
| `EventDocumentsPage.jsx` | LOI/contract PDF | PDF | UI only + Google Docs URL | LOW (Event not in scope) |
| `EventOrderDetailPage.jsx` | Supporting documents | Any | UI only | LOW |
| `SettingsPage.jsx` | Company logo | PNG/SVG | localStorage only | MEDIUM |
| `SettingsPage.jsx` | CEO signature | PNG/JPG | localStorage only | MEDIUM |

### 7.2 Attendance Photo — Special Case

Attendance photos are a unique category:

- **Current state:** `ppAbsensiData.js` generates `fotoUrl` as template strings pointing to `drive.google.com/file/d/...` — these are **fake URLs** that do not resolve.
- **Who creates them:** PP trainers take photos during sessions, typically on mobile
- **Volume:** 1 photo per session × avg 2 sessions/week × number of active orders
- **Required flow:** Trainer uploads photo (mobile) → stored in Supabase Storage → URL saved to attendance record DB → displayed in `PPRekapAbsensiDetailPage`
- **No backend table exists** for attendance sessions — this is entire functionality yet to be built.

---

## 8. Version Policy Analysis

### 8.1 Document Versioning — Current State

No document versioning exists in any part of the system:
- No `_v1`, `_v2` suffix on any DB record
- No `version` column in any table
- Agreement data in frontend has no version history
- Invoice data has no audit trail for edits (the `audit_events` table records state transitions only)

### 8.2 Recommended Version Policy

| Document Type | Version Policy | Rationale |
|---|---|---|
| Invoice | **Immutable after SENT** — amendments create new invoice | Financial audit trail requirement |
| Agreement | **Snapshot on signing** — store signed PDF binary, lock content | Legal binding document |
| Receipt | **Immutable always** — write-once at payment confirmation | Financial record |
| Refund | **Immutable always** — write-once at creation | Financial record |
| Assessment | **DRAFT editable → COMPLETED locked → ARCHIVED (final)** | Clinical record |
| Attendance photo | **Single version** — no versioning needed | Operational record |
| Payment proof | **Single version** — cannot be replaced after confirmation | Anti-fraud |

### 8.3 Agreement Snapshot Rule (CRITICAL)

The `PPAgreementDetailPage.jsx` currently allows editing of agreement content at any time. **This violates the principle that a signed agreement is a legal document.** 

Design rule: once `statusTtd = 'signed'`, the agreement content must be frozen. The signed version must be stored as a binary PDF snapshot with the signature embedded, with a separate metadata record containing signing timestamp, device, and IP address. No edits are possible after signing.

This is a **critical gap** identified in `docs/EFM_V2_Agreement_Architecture_Review.md` and must be addressed in Phase 3.

---

## 9. PDF Architecture Analysis

### 9.1 Current State

**Zero PDF generation** exists in either the backend or frontend:
- `LaporanExportPage.jsx` shows an export UI that simulates a download progress animation — no actual file is generated
- `PPAgreementDetailPage.jsx` renders the agreement as React JSX — no PDF is generated on "Download" button click
- `PPInvoiceDetailPage.jsx` has a "Download PDF" button — no PDF is generated
- `PPReceiptDetailPage.jsx` has a "Download" button — no PDF is generated

### 9.2 PDF Generation Strategy — Recommended

Two approaches exist. The correct choice depends on business requirements:

#### Option A: Client-Side PDF (jsPDF + html2canvas)
- **How:** Frontend renders the document to canvas, captures as PDF
- **Pros:** No backend dependency, fast, works offline
- **Cons:** No server-side PDF copy; PDF only exists in browser; cannot attach to email or store persistently; subject to browser rendering differences
- **Suitable for:** Receipt, simple invoice (print quality acceptable, no permanent storage needed)
- **NOT suitable for:** Agreement (must be stored permanently with signature)

#### Option B: Server-Side PDF (puppeteer or pdf-lib)
- **How:** Backend renders a Puppeteer headless browser or builds PDF programmatically
- **Pros:** Consistent output; PDF stored in Supabase Storage; URL persisted in DB; can be emailed, re-accessed anytime
- **Cons:** Higher backend resource usage; requires Puppeteer in Node.js environment
- **Suitable for:** Agreement (with embedded signature), Invoice (permanent record)
- **NOT suitable for:** On-the-fly simple receipts (overkill)

#### Recommended Hybrid:
| Document | Generation | Storage |
|---|---|---|
| Invoice PDF | Server-side (puppeteer) | Supabase Storage `invoices/` bucket |
| Receipt PDF | Client-side (jsPDF) | Optional Supabase upload |
| Agreement PDF | Server-side (puppeteer) | Supabase Storage `agreements/` bucket — **PERMANENT** |
| Export Reports | Server-side (puppeteer or exceljs) | Supabase Storage `exports/` — 30-day TTL |

### 9.3 Target PDF Sizes

| Document | Target Size | Notes |
|---|---|---|
| Invoice PDF (A4, text-only) | 80–150 KB | No embedded photos |
| Receipt PDF (A4, text-only) | 40–80 KB | Minimal layout |
| Agreement PDF (A4, with embedded signature) | 150–400 KB | Signature as PNG embedded |
| Export Report — Monthly Revenue (PDF) | 200 KB–1 MB | Charts as PNG |
| Export Report — Excel (.xlsx) | 50–300 KB | Depends on row count |

---

## 10. Image Optimization Strategy

### 10.1 Attendance Photo Volume & Characteristics

**Current state:** Photos are referenced as Google Drive URLs in `ppAbsensiData.js` (fake/dummy). No real photos exist.

**Expected characteristics in production:**
- Source: Trainer smartphone camera (rear camera, auto-HDR)
- Raw size: 2–8 MB (HEIC/JPG from modern phones)
- Content: Training session proof photo, 1 per session
- Volume: ~2 photos per order per week × active orders

### 10.2 Optimization Pipeline (Recommended)

```
Trainer mobile upload
     │
     ▼
Supabase Storage ingest (raw) → /attendance-raw/{year}/{month}/{orderId}/{sessionId}.jpg
     │
     ▼
Processing trigger (Supabase Edge Function or backend endpoint)
     │
     ├─ Compressed version: max 1200px wide, 80% quality JPEG → 200–500 KB
     │  Stored at: /attendance/{year}/{month}/{orderId}/{sessionId}.jpg
     │
     └─ Thumbnail: 300×300 crop, 60% quality JPEG → 20–50 KB
        Stored at: /attendance-thumb/{year}/{month}/{orderId}/{sessionId}.jpg
```

### 10.3 Target Sizes

| Variant | Max Dimension | Quality | Target Size |
|---|---|---|---|
| Raw (preserve original) | Original | 100% | 2–8 MB (DELETE after 30 days) |
| Compressed (operational) | 1200px wide | 80% | 200–500 KB |
| Thumbnail (list view) | 300×300 crop | 60% | 20–50 KB |

### 10.4 Raw File Retention

Raw files (2–8 MB) should be deleted after 30 days — they are kept only in case reprocessing is needed. Compressed versions are retained per retention policy (see Section 14). Thumbnails are retained same as compressed.

### 10.5 Other Image Types

| Image Type | Source | Target Size | Notes |
|---|---|---|---|
| Company logo (Settings) | Admin upload | < 100 KB (PNG/SVG) | Resize on upload |
| CEO signature (Settings) | Admin upload | < 30 KB (PNG transparent) | Preserve transparency |
| KTP/NPWP scan (Lead/Client) | Staff upload | < 500 KB | PII — special retention rules |

---

## 11. Payment Proof Retention

### 11.1 Per-Module Payment Proof Policy

#### PP (Private Program)
- **Policy:** Full payment only (D-01). One payment per invoice. One proof per payment.
- **Retention:** PERMANENT — financial compliance record
- **Volume:** 1 proof per order
- **Format:** Bank transfer screenshot (JPG/PNG) or transfer receipt (PDF)
- **Target size after compression:** 200–500 KB

#### B2B Management (Future)
- **Policy:** DP + installments + settlement (contractual basis)
- **Retention:** PERMANENT — financial compliance record
- **Volume:** 2–5 proofs per contract (DP + installment schedule)
- **Note:** Do not implement now. Audit only.

#### B2B Event (Future)
- **Policy:** DP + settlement (standard: 50% DP on order, 50% settlement after event)
- **Retention:** PERMANENT — financial compliance record
- **Volume:** 2 proofs per event order
- **Note:** Do not implement now. Audit only.

### 11.2 Anti-Fraud Controls (Required for Phase 3)

When payment proof upload is implemented:
1. File must be uploaded before payment status can transition to CONFIRMED
2. Upload timestamp must be recorded separately from confirmation timestamp
3. File URL must be stored in `payments_pp.proof_url` (column to be added in migration 004)
4. Once CONFIRMED, proof URL is immutable — no replacement allowed
5. Staff who confirmed payment is recorded (requires auth implementation)

### 11.3 DB Schema Change Required (Phase 3)

Add to `payments_pp` table (migration 004):
```sql
proof_url         TEXT,                          -- Supabase Storage URL, nullable until uploaded
proof_uploaded_at TIMESTAMPTZ,
confirmed_by      TEXT,                          -- PIC ID (requires auth)
```

---

## 12. Reporting & Export Architecture

### 12.1 Current State (Fully Verified)

`LaporanExportPage.jsx` is **100% simulated**:
- Selecting period and module → UI state only
- Clicking "Export PDF" or "Export Excel" → setTimeout triggers a fake "processing" animation
- After 2 seconds → shows "File ready to download" message
- No actual file is generated, no download occurs, no backend call is made
- Export history list is in-memory, resets on page reload

The three other report pages (`LaporanRevenuePage`, `LaporanPenjualanPage`, `LaporanLabaPage`) render charts from hardcoded `dashboardData.js` values.

### 12.2 Recommended Export Architecture

#### Approach: Generate on Demand (DO NOT pre-generate)

Pre-generating reports (e.g. nightly cron) is wasteful and increases storage. Generate on demand when the export button is clicked, deliver via signed URL with 1-hour expiry.

```
User requests export (period, module, format)
     │
     ▼
POST /api/exports/generate
{
  "period": "2026-10",
  "module": "PP",
  "format": "xlsx" | "pdf",
  "report_type": "revenue" | "orders" | "profit"
}
     │
     ▼
Backend queries live DB
     │
     ▼
Generates file (exceljs for xlsx, puppeteer for PDF)
     │
     ▼
Uploads to Supabase Storage: /exports/{userId}/{timestamp}_{report}.xlsx
     │
     ▼
Returns signed URL (1-hour expiry)
     │
     ▼
Frontend triggers download via signed URL
     │
     ▼
File expires from storage after 24 hours (Supabase lifecycle policy)
```

#### Why Not Permanent Storage for Exports?
- Reports can always be regenerated from the live DB
- Storage cost grows unbounded if exports are permanent
- Export files are personal and operational — not legal records
- 24-hour window is sufficient: user downloads immediately after generating

### 12.3 Report Types Required

| Report | Module | Format | Data Source |
|---|---|---|---|
| Revenue by period | PP, B2B, Event | XLSX + PDF | `invoices_pp.amount_due`, `payments_pp` |
| Order volume by period | PP, B2B, Event | XLSX + PDF | `orders_pp` |
| Profit/loss summary | Cross-module | XLSX + PDF | Revenue minus PIC honorarium |
| Client list | PP | XLSX | `clients_pp` |
| Assessment summary | PP | XLSX + PDF | `assessments_pp` |
| Attendance recap | PP | XLSX + PDF | Attendance table (Phase 3) |
| PIC honorarium | PP | XLSX | Attendance × session rate |

---

## 13. Yearly Archive Strategy

### 13.1 ID Sequence Reset Policy

From the ID format registry (implementation confirmed in `id_sequences` table):

| ID Type | Reset Policy | Implication |
|---|---|---|
| `PP-YY-xxxx` | Annual (Jan 1) | PP-26-9999 → PP-27-0001 |
| `INV-PP-YY-xxxx` | Annual | Same |
| `RCP-PP-YY-xxxx` | Annual | Same |
| `REF-PP-YY-xxxx` | Annual | Same |
| `PTR-PP-YY-xxxx` | Annual | Same |
| `SCR-YY-xxxx` | Annual | Same |
| `LP-xxxx` | NEVER | Permanent across years |
| `KL-xxxx` | NEVER | Permanent across years |
| Payment (UUID) | N/A | Global unique |

The sequence reset is handled atomically by `id_sequences.upsert` — no manual intervention needed.

### 13.2 Data Archive Strategy

**Recommended: No data deletion from primary DB, archive to read-only schema.**

```
active_schema (primary)  → current year + 2 prior years
archive_schema (created Jan 1 each year)  → all records older than 2 years
```

Alternatively, use row-level partitioning by year for large tables.

For PP specifically:
- `orders_pp`, `invoices_pp`, `payments_pp`, `receipts_pp`: keep FOREVER in primary DB (financial records)
- `assessments_pp`: keep FOREVER (clinical records)
- `leads_pp`, `clients_pp`: keep FOREVER (permanent IDs)
- `audit_events`: archive to cold storage after 2 years, keep 7 years

### 13.3 File Archive Strategy (Phase 3)

| File Type | Active Storage | Archive to Cold | Delete |
|---|---|---|---|
| Agreement PDF (signed) | Supabase (always hot) | Never archive | Never delete |
| Invoice PDF | Supabase 2 years hot | After 2 years, move to cold | After 7 years |
| Receipt PDF | Supabase 2 years hot | After 2 years, move to cold | After 7 years |
| Payment proof | Supabase 2 years hot | After 2 years | After 7 years |
| Attendance photos | Supabase 1 year hot | After 1 year | After 3 years |
| Assessment data | DB — never delete | — | Never |
| Export reports | Supabase 24-hour TTL | Never — regenerate | Auto-delete after 24h |
| Raw attendance photos | Supabase 30-day TTL | Never | Auto-delete after 30 days |

---

## 14. Retention Policy Matrix

### 14.1 Master Retention Matrix

| Entity/File | Classification | Retention Period | Deletion Policy | Legal Basis |
|---|---|---|---|---|
| `orders_pp` (DB record) | PERMANENT | Forever | Never delete | Financial record |
| `order_commercial_snapshots` | PERMANENT | Forever | Never delete | Immutable business record |
| `invoices_pp` (DB record) | PERMANENT | Forever | Never delete | Financial record |
| `payments_pp` (DB record) | PERMANENT | Forever | Never delete | Financial record |
| `receipts_pp` (DB record) | PERMANENT | Forever | Never delete | Financial record |
| `refunds_pp` (DB record) | PERMANENT | Forever | Never delete | Financial record |
| Agreement PDF (signed) | PERMANENT | Forever | Never delete | Legal contract |
| Invoice PDF (generated) | ACTIVE RETENTION | 7 years | After 7 years | Tax law (Indonesia) |
| Receipt PDF (generated) | ACTIVE RETENTION | 7 years | After 7 years | Tax law |
| Payment proof image | ACTIVE RETENTION | 7 years | After 7 years | Audit compliance |
| `participants_pp` (DB record) | ACTIVE RETENTION | Duration of service + 5 years | After 5 years post-inactive | Client data |
| `assessments_pp` (DB record) | ACTIVE RETENTION | Duration of service + 5 years | After 5 years | Clinical record |
| Attendance photos (compressed) | ARCHIVE | 3 years | After 3 years | Operational |
| Attendance photos (raw) | TEMPORARY | 30 days | Auto-delete | Processing artifact |
| KTP/NPWP scans | ACTIVE RETENTION | Duration of contract + 2 years | After 2 years post-inactive | PII — minimize retention |
| `leads_pp` (DB record) | PERMANENT | Forever | Never delete | Permanent ID |
| `clients_pp` (DB record) | PERMANENT | Forever | Never delete | Permanent ID |
| Export reports | TEMPORARY | 24 hours | Auto-delete | Ephemeral |
| `audit_events` (DB) | ARCHIVE | 7 years (2 hot, 5 cold) | After 7 years | Compliance |

### 14.2 PII Classification

Special handling required for PII data (Indonesian UU PDP compliance):
- KTP number: stored in DB — **minimize retention**, delete when client is inactive 2+ years
- NPWP number: same policy
- KTP/NPWP photo scans: store in separate isolated Supabase bucket with stricter access
- Phone numbers, email addresses: retain as long as client is active
- Health notes / fitness data: client data, retain per agreement terms

---

## 15. Supabase Storage Bucket Architecture

### 15.1 Recommended Bucket Structure

```
Supabase Project: efm-production
│
├── agreements/
│   ├── pp/{year}/{agrId}/signed.pdf           — PERMANENT, private
│   └── pp/{year}/{agrId}/metadata.json        — signing metadata
│
├── invoices/
│   ├── pp/{year}/{invId}/invoice.pdf          — 7-year retention, private
│   └── b2b/{year}/{invId}/invoice.pdf
│
├── receipts/
│   ├── pp/{year}/{rcpId}/receipt.pdf          — 7-year retention, private
│   └── b2b/{year}/{rcpId}/receipt.pdf
│
├── payment-proofs/
│   ├── pp/{year}/{paymentId}/proof.jpg        — 7-year retention, private
│   └── b2b/{year}/{paymentId}/proof.jpg
│
├── attendance/
│   ├── {year}/{month}/{orderId}/{sessionId}.jpg   — 3-year retention, private
│   └── thumbnails/{year}/{month}/{orderId}/{sessionId}_thumb.jpg
│
├── attendance-raw/
│   └── {year}/{month}/{orderId}/{sessionId}_raw.jpg  — 30-day TTL, private
│
├── pii-documents/
│   └── clients/{clientId}/ktp.jpg              — STRICT ACCESS — separate bucket ACL
│   └── clients/{clientId}/npwp.jpg
│
├── company-assets/
│   ├── logo.png                                — PUBLIC, CDN-cached
│   └── signature-ceo.png                      — PRIVATE (used in PDF generation only)
│
└── exports/
    └── {userId}/{timestamp}_{report}.xlsx      — 24-hour TTL, user-scoped
```

### 15.2 Access Control Policy

| Bucket | Read | Write | Notes |
|---|---|---|---|
| `agreements/` | Admin, authenticated staff | Backend only (server-side) | Client never reads raw PDF URL |
| `invoices/` | Admin, authenticated staff, client (via signed URL) | Backend only | Signed URL for client download |
| `receipts/` | Admin, client (via signed URL) | Backend only | |
| `payment-proofs/` | Admin, authenticated staff | Staff (authenticated) | |
| `attendance/` | Admin, authenticated staff | Backend (after trainer upload) | Trainer uploads directly to signed URL |
| `attendance-raw/` | Backend only | Trainer (signed URL) | 30-day auto-delete |
| `pii-documents/` | Admin only (strict) | Staff (authenticated) | Separate ACL, no public access ever |
| `company-assets/` | logo: PUBLIC; signature: PRIVATE | Admin only | |
| `exports/` | User who generated (scoped signed URL) | Backend only | 24-hour expiry |

### 15.3 Signed URL Policy

All file access from the frontend must go through signed URLs generated by the backend — **never expose Supabase storage URLs directly** in DB records. DB stores file paths (`agreements/pp/26/AGR-PP-26-0001/signed.pdf`) not full URLs. The backend generates signed URLs on demand with configurable expiry.

```
GET /api/pp/agreements/:id/download
→ Backend generates Supabase signed URL (1-hour expiry)
→ Returns { url: "https://supabase.../signed-url..." }
→ Frontend redirects to URL for download
```

---

## 16. Database vs Storage Strategy

### 16.1 What Belongs in the Database (PostgreSQL)

| Data Type | Store in DB | Reason |
|---|---|---|
| All entity IDs and relationships | ✅ Yes | Referential integrity |
| Business status fields (DRAFT/SENT/PAID) | ✅ Yes | FSM enforcement |
| Financial amounts, dates | ✅ Yes | Queryable, indexed |
| Audit events (who did what when) | ✅ Yes | Compliance |
| Text data (names, addresses, notes) | ✅ Yes | Searchable |
| Signing metadata (timestamp, device, IP) | ✅ Yes | Legal evidence |
| File paths/keys (not full URLs) | ✅ Yes | Dereferenced by backend |
| Binary files (PDFs, images) | ❌ No | Use Supabase Storage |
| Large text blobs (agreement HTML) | ❌ No | Store as file or in JSONB with limit |

### 16.2 What Belongs in Storage (Supabase)

| Data Type | Store in Storage | Reason |
|---|---|---|
| Agreement PDFs | ✅ Yes | Binary, 150–400 KB each |
| Invoice PDFs | ✅ Yes | Binary |
| Receipt PDFs | ✅ Yes | Binary |
| Payment proof images | ✅ Yes | Binary, variable size |
| Attendance photos | ✅ Yes | Binary, 200 KB–3 MB |
| KTP/NPWP scans | ✅ Yes | Binary, PII |
| Export reports | ✅ Yes | Binary, temporary |
| Company logo | ✅ Yes | Binary, rarely changes |

### 16.3 Agreement Content Storage — Special Rule

The agreement body (clauses, terms, party details) should be stored as:
- **In DB:** `agreement_snapshot` JSONB column — contains all structured fields at the time of signing (client name, trainer, package, dates, terms as array)
- **In Storage:** Signed PDF — the rendered/visual representation with embedded signature

This ensures the legal content is both queryable (DB) and visually provable (PDF with signature image).

---

## 17. Storage Cost Simulation

### 17.1 Assumptions

| Parameter | Value | Basis |
|---|---|---|
| Average order duration | 4 weeks (4 Sesi) to 12 weeks (24 Sesi) | PP package structure |
| Average sessions per order | 8 sessions | Midpoint of package range |
| Photos per session | 1 | Training proof |
| Attendance photo (compressed) | 350 KB avg | After optimization |
| Attendance photo (thumbnail) | 35 KB avg | |
| Agreement PDF | 250 KB | Text + embedded signature |
| Invoice PDF | 100 KB | A4 text layout |
| Receipt PDF | 60 KB | A4 minimal layout |
| Payment proof | 400 KB | Avg bank transfer screenshot |

### 17.2 Cost Per Order (PP)

| File | Size | Count | Total |
|---|---|---|---|
| Attendance compressed | 350 KB | 8 | 2,800 KB (2.8 MB) |
| Attendance thumbnails | 35 KB | 8 | 280 KB |
| Agreement PDF | 250 KB | 1 | 250 KB |
| Invoice PDF | 100 KB | 1 | 100 KB |
| Receipt PDF | 60 KB | 1 | 60 KB |
| Payment proof | 400 KB | 1 | 400 KB |
| **Total per order** | | | **~3.9 MB** |

### 17.3 Cumulative Storage at Scale

| Orders/Year | Storage per Year | 3-Year Retention | 7-Year Retention |
|---|---|---|---|
| 100 orders | ~390 MB | ~1.2 GB | ~2.7 GB |
| 500 orders | ~1.9 GB | ~5.8 GB | ~13 GB |
| 1,000 orders | ~3.9 GB | ~11.7 GB | ~27 GB |
| 5,000 orders | ~19.5 GB | ~58 GB | ~136 GB |
| 10,000 orders | ~39 GB | ~117 GB | ~273 GB |

### 17.4 Supabase Free Tier Limits

| Resource | Free Tier | Paid (Pro) |
|---|---|---|
| Storage | 1 GB | 100 GB |
| Bandwidth | 2 GB/month | 200 GB/month |
| File size limit | 50 MB per file | 50 MB (configurable) |

**Practical implication:** Free tier supports ~250 orders. Above 250 orders/year, upgrade to Pro ($25/month for 100 GB) is required.

### 17.5 Cost Optimization Levers

1. **Delete raw attendance photos after 30 days** — saves 5–8× compared to keeping originals
2. **Archive old attendance to cold storage after 1 year** — Supabase does not yet offer cold storage tiers; use a separate cheaper storage bucket (Wasabi, R2) for archives
3. **Generate PDFs on demand, don't pre-cache** — invoices/receipts can be regenerated, saving permanent storage for rarely-accessed documents
4. **Compress aggressively** — 80% JPEG quality vs 100% saves 60–70% size with minimal visual loss

---

## 18. Elimination Analysis

### 18.1 Files/Data to Eliminate (After Backend Integration)

| What | Why | When |
|---|---|---|
| `ppAbsensiData.js` Google Drive fake URLs | Replaced by real Supabase URLs in DB | Phase 3 attendance module build |
| `b2bData.js` `googleDocsUrl` values | B2B not built yet; these are placeholders | When B2B backend is built |
| `eventData.js` `googleDocsUrl` values | Same | When Event backend is built |
| `ppDocumentsData.js` hardcoded agreement data | Replaced by real backend data | When agreement backend is built |
| All `*Data.js` and `*Store.js` files | Replaced by backend API calls | Phase by phase as each module backend ships |

### 18.2 Backend Modules Missing (Must Be Added)

| Module | What's Missing | Priority |
|---|---|---|
| Agreement | Router + service + DB table + PDF generation + Supabase upload | **CRITICAL** — Phase 3 |
| Upload middleware | multer or Supabase direct upload | HIGH — Phase 3 |
| Attendance | DB table, trainer upload endpoint, photo processing | HIGH — Phase 3 |
| PDF generation | puppeteer endpoint or service | HIGH — Phase 3 |
| Export | Report generation service + XLSX/PDF output | MEDIUM — Phase 3 |
| Auth | JWT middleware for all endpoints | CRITICAL — Phase 3 |

### 18.3 What Is NOT Redundant (Must Keep)

- All 19 DB tables — foundation for everything
- All 43 API routes — fully tested, production-ready
- `agreement.guard.js` — business rule guard, will be used by agreement service
- All test files — 161 tests, all green
- `id_sequences` mechanism — correct architecture for all future modules

---

## 19. PP Final Recommendation — Full Lifecycle Document Map

### 19.1 Complete PP Document Lifecycle

```
PP Order Lifecycle with Full Storage Architecture
══════════════════════════════════════════════════

[1] LEAD CREATED
    DB: leads_pp (LP-xxxx)
    Storage: none
    Action: optional KTP scan → pii-documents/{clientId}/ktp.jpg

[2] ORDER CREATED
    DB: orders_pp (PP-YY-xxxx) + order_commercial_snapshots
    Storage: none
    Action: none at this stage

[3] INVOICE ISSUED
    DB: invoices_pp (INV-PP-YY-xxxx), status=DRAFT
    Storage: none yet

[4] INVOICE SENT (DRAFT → SENT)
    DB: invoice status → SENT
    Storage: invoice PDF generated → invoices/pp/{year}/{invId}/invoice.pdf
    Action: backend generates PDF, uploads to Supabase, stores file_path in invoices_pp

[5] PAYMENT SUBMITTED (Client pays)
    DB: payments_pp (UUID), status=PENDING
    Storage: payment proof uploaded by staff → payment-proofs/pp/{year}/{paymentId}/proof.jpg
    Required: proof_url + proof_uploaded_at stored in payments_pp BEFORE confirmation

[6] PAYMENT CONFIRMED (→ Invoice PAID, Order ACTIVE, Receipt created)
    DB: payments_pp → CONFIRMED, invoices_pp → PAID, orders_pp → ACTIVE, receipts_pp created
    Storage: receipt PDF generated → receipts/pp/{year}/{rcpId}/receipt.pdf
    Action: All in one atomic transaction (BUG-3 pattern)

[7] AGREEMENT SIGNED
    DB: agreements_pp (AGR-PP-YY-xxxx) — NEW TABLE NEEDED
    Storage: signed agreement PDF → agreements/pp/{year}/{agrId}/signed.pdf
    Critical: agreement content FROZEN on signing, signature embedded in PDF
    Metadata: signing timestamp, device fingerprint, IP → DB record

[8] PARTICIPANT REGISTERED
    DB: participants_pp (PTR-PP-YY-xxxx)
    Storage: none

[9] ASSESSMENT CONDUCTED
    DB: assessments_pp (SCR-YY-xxxx)
    Storage: optional assessment report PDF

[10] TRAINING SESSIONS (Attendance)
    DB: attendance_pp table (NEW — Phase 3)
    Storage: trainer uploads photo → attendance/raw/{...} (auto-processed → attendance/{...})

[11] REFUND (if issued)
    DB: refunds_pp (REF-PP-YY-xxxx)
    Storage: none (refund record only; original payment proof kept)
```

### 19.2 New DB Tables Required for Phase 3 (PP)

```sql
-- Phase 3 Migration: 004_pp_storage_and_agreements.sql

-- 1. Agreements (legal contracts)
CREATE TABLE agreements_pp (
  id               TEXT PRIMARY KEY,  -- AGR-PP-YY-xxxx
  order_id         TEXT NOT NULL REFERENCES orders_pp(id),
  client_id        TEXT NOT NULL REFERENCES clients_pp(id),
  pic_id           TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_SIGN', 'SIGNED', 'EXPIRED')),
  content_snapshot JSONB NOT NULL,    -- full agreement content at time of signing
  signed_pdf_path  TEXT,              -- Supabase Storage path (NOT full URL)
  signed_at        TIMESTAMPTZ,
  signed_by_name   TEXT,              -- client display name
  signing_device   TEXT,              -- device fingerprint
  signing_ip       TEXT,
  approved_by      TEXT,              -- PIC who approved (requires auth)
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Payments: add proof columns
ALTER TABLE payments_pp
  ADD COLUMN proof_path         TEXT,        -- Supabase Storage path
  ADD COLUMN proof_uploaded_at  TIMESTAMPTZ;

-- 3. Invoices: add PDF path
ALTER TABLE invoices_pp
  ADD COLUMN pdf_path TEXT;

-- 4. Receipts: add PDF path
ALTER TABLE receipts_pp
  ADD COLUMN pdf_path TEXT;

-- 5. Attendance sessions (Phase 3 scope)
CREATE TABLE attendance_pp (
  id              TEXT PRIMARY KEY,  -- ATT-PP-YY-xxxx
  order_id        TEXT NOT NULL REFERENCES orders_pp(id),
  participant_id  TEXT NOT NULL REFERENCES participants_pp(id),
  pic_id          TEXT NOT NULL,
  session_date    DATE NOT NULL,
  session_number  INTEGER NOT NULL CHECK (session_number > 0),
  status          TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'ABSENT')),
  photo_path      TEXT,              -- Supabase Storage path (compressed version)
  thumb_path      TEXT,              -- Supabase Storage path (thumbnail)
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 20. B2B Future Recommendation (DO NOT CODE NOW)

### 20.1 B2B Management — Architecture Principles (Document Only)

> ⚠️ **INSTRUCTION: DO NOT IMPLEMENT. This section is audit + planning only.**

**Business differences from PP:**
- Recurring monthly/annual contracts
- Multiple PICs per contract
- LOI (Letter of Intent) instead of Agreement
- Survei (site survey) required before order
- Installment payments (DP + monthly)
- Multiple trainers per gym/property
- BA (Berita Acara) for session completion

**Storage requirements (future):**
- LOI PDF → `agreements/b2b/{year}/{loiId}/loi.pdf`
- Survey report PDF → `surveys/{year}/{surveyId}/report.pdf`
- Survey photos → `surveys/{year}/{surveyId}/photos/`
- Payment proofs (multiple per order) → `payment-proofs/b2b/{year}/{paymentId}/proof.jpg`
- BAST (handover certificate) → `documents/b2b/{year}/{orderId}/bast.pdf`

**DB tables needed (future):** `leads_b2b`, `clients_b2b`, `orders_b2b`, `invoices_b2b`, `payments_b2b`, `receipts_b2b`, `surveys_b2b`, `agreements_b2b`, `attendance_b2b`

### 20.2 B2B Event — Architecture Principles (Document Only)

> ⚠️ **INSTRUCTION: DO NOT IMPLEMENT. This section is audit + planning only.**

**Business differences from PP:**
- One-time events (Zumba, wellness challenge, fitness day)
- Quotation required before order
- LOI instead of Agreement
- Consulation notes before quotation
- Multi-trainer event execution
- Event attendance tracking (headcount, not per-client)
- Post-event recap/BA

**Storage requirements (future):**
- LOI PDF → `agreements/event/{year}/{loiId}/loi.pdf`
- Quotation PDF → `quotations/{year}/{quotId}/quotation.pdf`
- Event execution photos → `events/{year}/{orderId}/photos/`
- Post-event BA → `documents/event/{year}/{orderId}/ba.pdf`

---

## 21. Security Audit — Storage & Document Layer

### 21.1 Current Security State

| Concern | Current State | Risk | Recommendation |
|---|---|---|---|
| Auth middleware | ❌ ZERO — all endpoints open | CRITICAL | Implement JWT auth before any production deployment |
| Storage ACL | N/A — no storage | — | Use Supabase RLS on all buckets |
| File type validation | N/A — no uploads | — | Whitelist: JPG, PNG, PDF, HEIC only |
| File size limit | N/A — no uploads | — | Max 10 MB per file on upload endpoint |
| SQL injection | ✅ All queries parameterized | None | Continue current pattern |
| PII exposure | ❌ KTP/NPWP handled via UI only | MEDIUM | Isolated bucket with strict ACL when implemented |
| PDF injection | N/A — no PDF generation | — | Sanitize all user input before PDF render |
| Signed URL leakage | N/A — no storage | — | Short expiry (1 hour max), no URL in DB |

### 21.2 Auth Requirement Before Storage

**Storage without auth is a critical vulnerability.** The current state of zero auth middleware means that if storage is added before auth, any HTTP client could:
- Upload arbitrary files to any path
- Retrieve any file by guessing paths
- Overwrite existing files

**Rule: Auth middleware must be implemented BEFORE any storage endpoint.**

### 21.3 KTP/NPWP Special Handling

KTP and NPWP scans are PII under Indonesian UU PDP (Undang-Undang Perlindungan Data Pribadi No. 27/2022). Required protections:
- Store in isolated bucket (`pii-documents/`) with no public access, ever
- Access only via signed URLs, logged to audit trail
- Retention minimization: delete 2 years after client becomes inactive
- Encryption at rest: Supabase encrypts at rest by default — confirm this is enabled

---

## 22. Agreement Module Critical Gap Analysis

### 22.1 Gap Summary (from `docs/EFM_V2_Agreement_Architecture_Review.md`)

The `PPAgreementDetailPage.jsx` currently has:
- Canvas signature pad that captures client signature
- Signature stored in React state as base64 PNG
- On page reload: signature is **lost** (no persistence)
- "Approved" button updates in-memory array only
- No PDF generation — agreement is displayed as HTML/JSX

**Critical gaps identified:**
1. **No agreement table in DB** — `backend/src/modules/agreement/` contains only `agreement.guard.js` (a business rule guard) — zero service, zero router, zero DB table
2. **No signature persistence** — canvas drawing is lost on reload
3. **No content locking** — signed agreements can be edited in the UI
4. **No PDF snapshot** — no legal-quality document with embedded signature
5. **Agreement data stored in `ppDocumentsData.js`** — in-memory JS array, resets on server restart
6. **Active Aging program not included** — referenced in `docs/EFM_V2_Agreement_Architecture_Review.md` as a known gap

### 22.2 Required Implementation (Phase 3, High Priority)

The agreement system requires building from scratch:

```
Phase 3A — Agreement Backend
1. Create migration 004 (see Section 19.2 above)
2. Build agreement.repository.js, agreement.service.js, agreement.router.js
3. Build PDF generation endpoint (POST /api/pp/agreements/:id/generate-pdf)
   - Renders agreement template with data
   - Embeds base64 signature image in PDF
   - Uploads to Supabase Storage
   - Returns file_path, stores in agreements_pp.signed_pdf_path
4. Add content freeze guard: once status = 'SIGNED', reject any content mutation

Phase 3B — Agreement Frontend
1. Rework PPAgreementDetailPage to call backend API
2. Remove in-memory ppDocumentsData state
3. Signature pad: on submit, POST signature to backend → triggers PDF generation
4. Download button → calls GET /api/pp/agreements/:id/pdf → returns signed URL
```

---

## 23. Implementation Roadmap — Phase 3 Storage Layer

### 23.1 Recommended Phase 3 Build Order

Phase 3 must be built in this order to avoid partial states and data inconsistency:

```
PHASE 3A — Foundation (Prerequisite for all storage)
───────────────────────────────────────────────────
□ Auth middleware (JWT + session, all endpoints)
□ Supabase project setup + bucket creation
□ Upload middleware (multer or Supabase direct upload SDK)
□ Signed URL generator service

PHASE 3B — Payment Proof (Highest business impact)
───────────────────────────────────────────────────
□ Migration 004: add proof_path to payments_pp
□ POST /api/pp/payments/:id/upload-proof endpoint
□ Integrate with PPInvoiceDetailPage → replace UI-only with real upload
□ Guard: confirmPayment() requires proof_path before allowing CONFIRMED

PHASE 3C — Agreement Module (Highest legal/compliance impact)
──────────────────────────────────────────────────────────────
□ Migration 004: create agreements_pp table
□ Agreement service + router
□ PDF generation service (puppeteer)
□ Supabase upload integration
□ PPAgreementDetailPage: replace dummy data with API calls

PHASE 3D — Invoice & Receipt PDFs
───────────────────────────────────
□ Migration 004: add pdf_path to invoices_pp, receipts_pp
□ PDF generation triggered on SENT (invoice) and CONFIRMED (receipt)
□ Download endpoints returning signed URLs
□ PPInvoiceDetailPage, PPReceiptDetailPage: replace "Download" buttons with API calls

PHASE 3E — Attendance Module
──────────────────────────────
□ Migration 004: create attendance_pp table
□ Trainer upload endpoint (signed URL flow for direct-to-Supabase upload)
□ Photo processing (compression + thumbnail generation)
□ PPRekapAbsensiDetailPage: replace ppAbsensiData.js with API calls

PHASE 3F — Export & Reporting
───────────────────────────────
□ Report generation service (exceljs + puppeteer)
□ POST /api/exports/generate endpoint
□ LaporanExportPage: replace simulated export with real API call
□ Report history: store in DB (temporary, 24-hour TTL on Storage)
```

### 23.2 What NOT to Build in Phase 3

- B2B Management backend — separate future phase
- B2B Event backend — separate future phase  
- Complex analytics / BI dashboard — separate future phase
- Mobile app for trainer photo upload — web upload sufficient for now
- WhatsApp/email integration — separate future phase

---

## 24. Owner Decisions Required

The following decisions cannot be made by the development team — they require explicit owner input before implementation:

| # | Decision | Options | Impact |
|---|---|---|---|
| D-S-01 | Agreement: ink signature vs digital signature standard | (A) Canvas signature (current UI) / (B) OTP-verified e-signature / (C) Third-party e-sign (DocuSign, Privy) | Legal enforceability, cost |
| D-S-02 | Payment proof: who confirms — admin only or any staff? | (A) Admin only / (B) Any authenticated PIC | Auth role design |
| D-S-03 | Attendance photo: required or optional per session? | (A) Required — session not counted without photo / (B) Optional but tracked | Data completeness |
| D-S-04 | KTP/NPWP: collect at what stage? | (A) Required at client creation / (B) Required before agreement signing / (C) Optional | PII exposure timing |
| D-S-05 | Export reports: permanent storage or generate on demand? | (A) Generate on demand, 24h TTL (recommended) / (B) Permanent storage per export | Storage cost, regeneration capability |
| D-S-06 | Agreement template: multiple templates by package? | (A) Single template for all PP packages / (B) Per-package templates | Flexibility vs complexity |
| D-S-07 | Retention for KTP/NPWP scans | (A) Delete 2 years after client inactive / (B) Keep indefinitely | UU PDP compliance |
| D-S-08 | Supabase tier: when to upgrade from free? | (A) Upgrade at 250 orders / (B) Stay on free as long as possible | Cost vs reliability |
| D-S-09 | Active Aging program: same agreement template as PP? | (A) Same / (B) Separate template | Agreement module design |
| D-S-10 | Certificate of completion: generate automatically or on demand? | (A) Auto on program completion / (B) Admin manually generates | Automation scope |

---

## 25. Final Recommendation Summary

### 25.1 Architecture Verdict

The EFM V2 backend (Phase 2) is **production-ready for its scope**: the PP commercial core (orders, invoices, payments, receipts, refunds, participants, assessments) is fully implemented, tested against live PostgreSQL, and all 161 tests pass.

**The storage layer, agreement module, attendance module, PDF generation, and reporting are all Phase 3 work.** None of these gaps are defects in Phase 2 — they are defined out-of-scope features.

### 25.2 Phase 3 Immediate Priorities

Ordered by business impact:

1. **Auth middleware** — CRITICAL prerequisite. Nothing else in Phase 3 should start before this. All 43 existing endpoints are unprotected.
2. **Agreement backend + PDF** — CRITICAL for legal compliance. Signed agreements currently live only in browser state.
3. **Payment proof upload** — HIGH. Closes the last gap in the PP commercial cycle. Without it, payment confirmation is based on trust, not evidence.
4. **Invoice + Receipt PDFs** — HIGH. Clients need downloadable PDFs for accounting purposes.
5. **Attendance module** — MEDIUM. Required for trainer honorarium calculation.
6. **Export/Reporting backend** — MEDIUM. Required for management reporting.

### 25.3 DO NOT IMPLEMENT NOW

- B2B Management backend
- B2B Event backend
- Any migration of old GAS/Google Sheets data
- Any import of legacy clients, orders, or PIC data
- Complex analytics / BI features

### 25.4 Architecture Invariants (Must Not Change)

These decisions are locked from Phase 2 and must be preserved in all Phase 3 work:

- Payment IDs are UUID (not nextId format) — per Decision Lock §16.3
- One payment per PP invoice (full payment only — D-01)
- One receipt per payment (auto-created, write-once)
- One refund per payment (1-per-payment UNIQUE constraint)
- One participant per PP order (UNIQUE(order_id))
- All writes use `withTransaction()` with atomic multi-step operations
- ID sequences use `id_sequences` table with UNIQUE(doc_type, module, year) — no separate sequence objects
- Assessment IDs use `GLOBAL` bucket (module-independent) — prevents ID collision if assessments span modules in future

### 25.5 Storage Architecture Invariants (Phase 3)

These must be established as hard rules before first storage endpoint goes live:

- Auth before storage — no exceptions
- DB stores file paths, not full URLs — backend generates signed URLs on demand
- Raw files deleted after 30 days (attendance) — automated Supabase lifecycle policy
- Signed agreements are immutable — no editing after `statusTtd = 'signed'`
- Payment proof cannot be replaced after CONFIRMED — one-write-only
- PII documents (KTP/NPWP) in isolated bucket with audit-logged access

---

*Document end. Version 1.0 — 2026-10-01*  
*All findings based on repository state: branch `claude/add-claude-md-instructions-7iqjvo`, post-merge commit `c7ff22f` (PR #534)*
