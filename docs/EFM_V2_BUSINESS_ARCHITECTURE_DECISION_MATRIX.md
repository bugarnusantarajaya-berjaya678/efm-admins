# EFM V2 — Business Architecture Decision Matrix

**Type:** STRICT READ-ONLY AUDIT — Architecture Decisions Only  
**Date:** 18 Sep 2026  
**Auditor:** Claude Code (automated read-only analysis)  
**Status:** COMPLETE

> **MODE: STRICT READ-ONLY AUDIT.**  
> NO CODE CHANGES. NO REFACTOR. NO DATA MIGRATION. NO UI CHANGES. NO COMMIT. NO MERGE. NO PR UPDATE.
>
> **Core Principle:** CONSISTENT CORE, FLEXIBLE BUSINESS MODULE  
> Shared infrastructure must be consistent. Each module may differ by business character.  
> PP is reference (most mature) — not a mandatory template for B2B/Event.  
> B2B Management and B2B Event are still under construction — distinguish "unfinished" from "architecturally wrong".

---

**Status Markers Used Throughout This Document:**

| Marker | Meaning |
|---|---|
| `LOCKED` | Architecture decision is clear and agreed — no owner decision required |
| `CHANGE` | Current implementation must change to align with intended architecture |
| `OWNER DECISION` | Architecture choice requires explicit business owner decision |
| `NEEDS EVIDENCE` | Insufficient evidence to determine correct architecture |

---

**Source of Truth Hierarchy Applied:**

1. Existing documented EFM business logic / master architecture
2. `docs/EFM_V2_BUSINESS_LOGIC_MASTER_MAP.md`
3. `docs/EFM_V2_Agreement_Architecture_Review.md`
4. `docs/PP_Agreement_Struktur_Flow.md`
5. `docs/EFM_V2_REACT_MASTER_UI_ARCHITECTURE_RECONCILIATION.md`
6. `docs/EFM_V2_Business_Logic_Workflow_Reconstruction.md`
7. Actual React source implementation (evidence layer, not business truth)
8. Legacy FRONTEND implementation (historical reference only)

---

## Section 1 — Executive Architecture Map

### 1.1 Three-Module Business Overview

EFM (Essential Fitness Management) operates three distinct business divisions:

| Module | Business Character | Revenue Model | Contract Type |
|---|---|---|---|
| **PP (Private Program)** | Individual/small group fitness coaching | Per-package (4/8/12/24 sesi) | Per-order agreement |
| **B2B Management** | Recurring corporate/property fitness management | Monthly/annual retainer | Service contract |
| **B2B Event** | One-time or periodic group fitness events | Per-event project | LOI/event contract |

### 1.2 Architecture Principle Confirmed `LOCKED`

> **CONSISTENT CORE, FLEXIBLE BUSINESS MODULE**

All three modules share:
- The same lead capture + pipeline process (with module-specific stage names)
- Order as the core business entity (with module-specific fields)
- Invoice + Receipt as the standard payment pair
- A signed agreement/LOI as legal authorization before service delivery
- Attendance/session recording

Each module differs in:
- Pipeline stage names and count
- Order fields (trainer assignment vs company + PIC vs event-specific)
- Agreement type (PP Agreement vs B2B Contract vs Event LOI)
- Post-agreement workflow (PP: H&S + Assessment → Program; B2B: Schedule → Monthly cycle; Event: Class schedule → Attendance → Rekap)
- Pricing structure (per-session vs monthly vs per-event)

### 1.3 Module Maturity Assessment

| Module | Entity Coverage | State Machines | Business Gates | Assessment |
|---|---|---|---|---|
| PP | 8 entities fully modeled | 5 state machines present | 0 of 10 implemented | Most mature — use as reference |
| B2B Management | 4 entities partially modeled | Partial | 0 implemented | Under construction — not architecturally wrong |
| B2B Event | 4 entities (+ missing Order) | Partial | 0 implemented | Under construction — formally missing Order entity |

---

## Section 2 — Shared Core Identification

### 2.1 Confirmed Shared Core `LOCKED`

The following entities and patterns are confirmed shared across all three modules:

**Shared Entity Types:**
- **Lead** — entry point for all modules (LP-, LB-, LE- prefixes)
- **Order** — core business entity; PP has it fully; B2B and Event have routes but less formal definition
- **Invoice** — standard payment request
- **Receipt** — payment confirmation document
- **Agreement / LOI** — legal authorization before service delivery

**Shared Infrastructure:**
- ID format: `[DOCTYPE]-[MODULE]-[YY]-[SEQUENCE]` (LOCKED)
- Order IDs display with `#` prefix in UI; all other IDs do not (LOCKED)
- Status badge color system: green=success/lunas, yellow=pending, red=overdue/error, blue=info/process (LOCKED)
- Actor model: Admin (EFM staff) primary interface; Trainer has no portal; Client signs agreement but no portal (LOCKED)
- Sidebar navigation: 3 module pillars + cross-module OPS + Reports + Settings (LOCKED)

### 2.2 What Is NOT Shared (Module-Specific by Design) `LOCKED`

| Concept | PP | B2B Management | B2B Event |
|---|---|---|---|
| Pre-order consultation step | Screening (SCR-) | Survei (SVY-) | Konsultasi (KNS-) |
| Agreement document type | Agreement (AGR-PP-) | Contract (LOI-EFM-B2B-) | LOI (LOI-EFM-EVENT-) |
| Post-agreement health step | H&S Acknowledgement (target) | Not applicable | Not applicable |
| Client entity type | Lead (payer) + Klien (trainee) | Company + PIC | Event organizer |
| Post-delivery summary | Rekap Absensi | Monthly reporting | Rekap Kelas / Absensi |
| Trainer assignment | Individual PIC per order | Group of trainers | Event instructor team |

---

## Section 3 — Actor / Role Model

### 3.1 Actor Inventory `LOCKED`

| Actor | Evidence | Current Implementation |
|---|---|---|
| **Admin (EFM Staff)** | Primary user of entire dashboard | All operations via admin dashboard |
| **Owner** | Mentioned in RBAC doc; settings signatory | Not separately implemented; implicitly included in "Admin" |
| **Trainer / PIC** | `picOpsEFM`, `picList`, `PIC_DB` | No trainer-facing portal; trainers deliver sessions externally |
| **Lead / Pendaftar** | LP-xxxx; the payer who registers | No client portal; signs agreement via link (simulated) |
| **Klien** | KL-xxxx; the person who trains (may differ from Lead) | No Klien portal |
| **Wali / Guardian** | `pendaftarSamaDenganKlien: false`; signs on behalf of minor/elderly | Captured in agreement data; no dedicated flow |
| **Companion (Active Aging)** | AA-09/AA-10 mandatory companion; `companionInfo` proposed | Not implemented |

### 3.2 Role-Based Access Control (RBAC) `CHANGE`

**CURRENT IMPLEMENTATION:** No authentication. No RBAC. Any URL is accessible.

**DOCUMENTED INTENT:** Admin / Super Admin / Owner roles documented.

**VERDICT:** RBAC is a Phase 2 concern. The V2 UI is "admin dashboard only" by design. Phase 1 does not require RBAC implementation.

**Action Required (Phase 2):** Implement role-based access before production use with multiple staff members.

### 3.3 Dual Trainer Registry `CHANGE`

**EVIDENCE:** Two separate trainer registries with incompatible ID formats:
- `opsData.picList`: PIC-001 to PIC-008, rates 125k–175k/sesi
- `ppProgramDBData.PIC_DB`: EFM-PIC-001 to EFM-PIC-006, rates 70k–80k/sesi

**NEEDS EVIDENCE:** Is one registry for "employed trainers" and the other for "freelance/outsourced trainers"? Or is this purely an inconsistency? Rate difference (125k–175k vs 70k–80k) is too large to be accidental.

**OWNER DECISION REQUIRED:** Confirm which trainer registry is authoritative, what the two lists represent, and what the correct trainer rate structure is. This directly affects PKS contract values and assignment logic.

---

## Section 4 — Private Program Reference Model

### 4.1 PP Flow — Reconciled `LOCKED`

The following is the reconciled PP business flow, combining business logic master map, agreement architecture review, PP_Agreement_Struktur_Flow.md, and code evidence:

| Step | Stage Name | Document Created | Gate |
|---|---|---|---|
| 1 | Lead Capture | LP-xxxx | None (manual entry) |
| 2 | Approach | — | None |
| 3 | Screening / Health Survey | SCR-YY-xxxx (optional) | None |
| 4 | Order Created | PP-YY-xxxx, INV-PP-YY-xxxx | Lead must exist |
| 5 | Payment Confirmed | RCP-PP-YY-xxxx | Invoice paid |
| 6 | Agreement | AGR-PP-YY-xxxx | Receipt exists (target) |
| 7 | H&S Acknowledgement | HNA-PP-YY-xxxx (target) | Agreement signed |
| 8 | Assignment | — (implicit) | H&S complete (target) |
| 9 | Program Start | — | Assignment confirmed (target) |
| 10 | Sessions / Attendance | ABS-xxx | Order Aktif |
| 11 | Assessment (Post-Test) | SCR-YY-xxxx updated | sesiDone = sesiTotal |
| 12 | Program Complete | — | Post-Test Selesai |
| 13 | Renewal | New PP-YY-xxxx | Previous Post-Test Selesai |

### 4.2 PP tahapan Field Values — Reconciliation `CHANGE`

**CURRENT CODE:**
```
Invoice | Agreement | Program Berjalan | Program Selesai | Kontrak Dibatalkan
```

**TARGET (from Master Map + Agreement Architecture Review):**
```
Invoice | Agreement | H&S Acknowledgement | Assignment | Program Ready | Program Berjalan | Program Selesai | Kontrak Dibatalkan
```

**VERDICT:** The current `tahapan` field is architecturally incomplete. The 3 missing intermediate stages (`H&S Acknowledgement`, `Assignment`, `Program Ready`) represent real business workflow steps that exist in the target architecture but have no implementation.

**Note:** Adding these stages to `tahapan` is a non-breaking change to the data schema. It does not require modifying existing records.

### 4.3 PP Lead Status — Dual Status Inconsistency `CHANGE`

**EVIDENCE:** Two status systems for the same leads:
- `ppLeadsData.status`: `new | follow-up | closed-won | closed-lost` (4 values, simple CRM)
- `ppLeadsStore.statusPipeline`: `New | Approach | Screening | Invoicing | Closing | Convert | Lost` (7 stages, pipeline)

**VERDICT:** The 7-stage pipeline in `statusPipeline` is the intended business model. The 4-value `status` in `ppLeadsData` is a simplified list-view field. These can coexist if `status` is treated as a display filter (lead state), not a business state machine. However, they must be kept in sync.

**OWNER DECISION REQUIRED:** Should `ppLeadsData.status` be deprecated in favor of a computed value derived from `statusPipeline`? Or are they intentionally independent (display vs. pipeline state)?

### 4.4 PP Couple/Group Pricing `OWNER DECISION`

**EVIDENCE:**
- Individual: 200k/sesi × sesi = total
- Couple: 400k/sesi (agreement), 3.2M for 8 sesi, 4.8M for 12 sesi
- Group (6 pax Zumba): 175k/person/sesi, total 8.4M for 8 sesi

**ACTUAL CODE (confirmed from invoice data):** Couple price = 2 × 200k × sesi. 400k is the aggregate per-session cost for both persons combined, not a different per-person rate.

**VERDICT (partial evidence):** Couple pricing = 2 × individual rate. This is architecturally consistent.

**OWNER DECISION REQUIRED:** Is the Group Zumba rate (175k/person) intentionally lower than standard individual rate (200k/person)? If so, group programs have a separate pricing tier. If not, this is an error. Also: does the system need to support "group programs of arbitrary size" with different per-person rates?

---

## Section 5 — Active Aging as Program Module

### 5.1 Active Aging — Current Implementation `CHANGE`

**EVIDENCE:** Zero implementation. No file in `REACT-APP/src/` contains "Active Aging", "AA-01", or any age-specific program module reference.

**EVIDENCE (existing data):** AGR-PP-27-0003 has clients Suyitno (65, knee pain) and Sri Wahyuni (hypertension, Amlodipin), registered by their daughter Citra Anggraini. This record is effectively an Active Aging case — it is not classified as such in the data.

### 5.2 Active Aging Specification Supplied `LOCKED`

The owner has provided a 16-clause specification (AA-01 through AA-16). This specification exists in `EFM_V2_Agreement_Architecture_Review.md`, Section 13. It is not yet implemented anywhere.

**The following are LOCKED decisions from the Active Aging specification:**

| Clause | Status |
|---|---|
| AA-01: Program defined as 60+ clients | `LOCKED` |
| AA-08: Client health disclosure responsibility (proportional) | `LOCKED` |
| AA-09: Companion/family must be present at sessions | `LOCKED` |
| AA-10: Companion is primary emergency handler | `LOCKED` |
| AA-11: Trainer is backup (first aid), not primary responder | `LOCKED` |
| AA-16: Proportional liability — evidence of negligence required | `LOCKED` |

### 5.3 Companion Requirement Architecture `LOCKED`

Per owner specification:
- Active Aging programs require a companion present at every session
- Companion information must be captured in the agreement: nama, hubungan, noWa, kesediaanHadir
- This is a blocking gate: Active Aging agreement must not proceed to H&S without valid companion info

**Required new field in agreement data model:**
```js
companionInfo: {
  nama: string,       // required for Active Aging
  hubungan: string,   // 'Anak' | 'Pasangan' | 'Saudara' | 'Pengasuh'
  noWa: string,       // required for Active Aging
  kesediaanHadir: boolean  // companion agrees to attend sessions
}
```

### 5.4 programModuleType Field `CHANGE`

**CURRENT:** No `programModuleType` field anywhere in PP data.

**TARGET:** All PP agreements must have `programModuleType` field:
```
'standard' | 'active-aging' | 'therapy' | 'massage' | 'corporate' | 'event'
```

**CHANGE REQUIRED (Phase 2):** Add `programModuleType: 'standard'` to all existing agreement records as default. Reclassify AGR-PP-27-0003 as `'active-aging'`.

### 5.5 Therapy and Massage Module Specifications `NEEDS EVIDENCE`

Target architecture lists 6 program modules including Therapy, Massage, Corporate, and Event sub-modules. No specification has been supplied for these 4 types.

**NEEDS EVIDENCE:** Are Therapy and Massage programs currently active in EFM's operations? If yes, what are their specific agreement clauses?

---

## Section 6 — B2B Management Business Reconstruction

### 6.1 B2B Management Business Character `LOCKED`

| Characteristic | Value |
|---|---|
| Business type | Recurring monthly/annual service contract |
| Client type | Corporate (gym) or residential property (apartment) |
| Contract structure | Service period + monthly value + renewal at -30 days |
| Revenue recognition | Monthly billing cycle |
| Trainer model | Group of trainers (team) serving the facility |
| Invoice rhythm | Monthly invoice, not per-order |
| Konsultasi type | Survei (SVY-YY-xxxx) — site assessment |

### 6.2 B2B Management — Missing Formal Order Entity `CHANGE`

**EVIDENCE:** B2B Management has:
- Lead entity (BC-xxx, BA-xxx — incomplete ID format)
- Survei entity (route `/b2b/survei/:id`)
- Order route `/b2b/orders/:id` (EventOrderDetailPage imported for B2B orders)
- Invoice list `/b2b/invoice`
- Receipt list `/b2b/receipt`

**ACTUAL CODE:** No dedicated `b2bOrdersStore.js` or `b2bOrdersData.js` found. `b2bData.js` has lead data but no order records. B2BOrderDetailPage is used — but its data source is unclear.

**CHANGE REQUIRED:** A formal B2B Order entity must be defined with schema, store, and ID format (`B2B-YY-xxxx`). This is architecturally required before invoices can be properly linked.

### 6.3 B2B Lead ID Format `CHANGE`

**EVIDENCE:** `b2bData.js` uses `BC-xxx` (corporate leads) and `BA-xxx` (apartment leads). These deviate from the documented standard `LB-0001`.

**VERDICT:** Either:
1. B2B leads have module-specific subtypes (BC = Corporate, BA = Apartment) and the standard is wrong/incomplete, OR
2. The ID format is incorrect and should be `LB-xxxx` with a `tipe: 'corporate' | 'apartment'` field

**OWNER DECISION REQUIRED:** Is the B2B lead subtype distinction (corporate vs apartment) architecturally important enough to have separate ID prefixes? Or should all B2B leads use `LB-xxxx` with a type field?

### 6.4 B2B Contract Renewal Architecture `NEEDS EVIDENCE`

**DOCUMENTED INTENT:** Renewal alert at -30 days before contract end.

**CURRENT CODE:** `EXPIRING_CONTRACTS` in `b2bData.js` — static list showing contracts expiring soon. No automated renewal logic.

**NEEDS EVIDENCE:** What is the full renewal workflow? Does renewal create a new contract document? Does it reset to a new Order? Is there a formal renewal negotiation step?

---

## Section 7 — B2B Event Business Reconstruction

### 7.1 B2B Event Business Character `LOCKED`

| Characteristic | Value |
|---|---|
| Business type | Per-event project delivery |
| Client type | Event organizer / corporate wellness sponsor |
| Contract type | LOI (Letter of Intent) `LOI-EFM-EVENT-YY-xxxx` |
| Quotation | Standalone entity `QUO-EV-YY-xxxx` with structured items[] |
| Pricing | Per-event invoice with PPN 11%, PPh23 2%, PPh22 1.5% |
| EFM role | Main Organizer / Co-Organizer / Fitness Consultant / Vendor |
| Post-event | Kelas Jalan → Pelatih Absen → Rekap Kelas |

### 7.2 B2B Event — Missing Order Entity `CHANGE`

**EVIDENCE:**
- Route `/event/orders/:id` exists in App.jsx
- EventOrderDetailPage.jsx exists
- BUT: no `eventOrdersData.js` or `eventOrdersStore.js` found
- `eventData.js` contains LOI/contract documents only

**CRITICAL GAP:** B2B Event has Lead → Konsultasi → Quotation → [gap] → Invoice. The "Order" entity that should bridge Quotation approval and Invoice is architecturally missing in the data layer.

**CHANGE REQUIRED:** Define B2B Event Order entity schema (`EV-YY-xxxx`) and create `eventOrdersStore.js`. This is required for proper Invoice → Receipt → LOI linkage.

### 7.3 B2B Event Quotation — Most Advanced Quotation Model `LOCKED`

**EVIDENCE:** `eventData.quotation` has the most structured quotation model:
- `items[]` with description, qty, satuan, hargaSatuan, total
- `pajak[]` with directional types: `+` (additive) and `-` (deductive)
- PPN: 11% (additive), PPh23: 2% (deductive — client withholds), PPh22: 1.5% (deductive)

**VERDICT:** B2B Event quotation is the reference model for tax handling. PP and B2B Management have simpler quotation structures by business character — this is intentional, not a deficiency.

### 7.4 B2B Event Document ID Inconsistency `CHANGE`

**EVIDENCE:** `eventData.eventDocuments` uses `#EV-DOC-001` format. Per design standards:
- `#` prefix: only Order IDs
- LOI format: `LOI-EFM-EVENT-YY-xxxx`

**CHANGE REQUIRED:** Rename event document IDs from `#EV-DOC-001` to `LOI-EFM-EVENT-26-0001` format. Remove `#` prefix.

### 7.5 Event Konsultasi Missing from Sidebar Navigation `CHANGE`

**EVIDENCE (from UI Architecture Reconciliation doc):** Event Konsultasi is accessible via direct URL (`/event/konsultasi/:id`) but has no sidebar navigation entry. The sidebar links to `/event/leads` and `/event/quotation` but not to `/event/konsultasi`.

**CHANGE REQUIRED:** Add Konsultasi to B2B Event sidebar navigation.

---

## Section 8 — Order as Core Business Entity

### 8.1 Order — Universal Architecture `LOCKED`

Order is confirmed as the central business entity across all three modules. All downstream documents (Invoice, Receipt, Agreement/LOI, Assessment, Attendance) link back to an Order.

**Order ID formats:**
- PP: `PP-YY-xxxx` (displayed as `#PP-YY-xxxx`)
- B2B Management: `B2B-YY-xxxx` (displayed as `#B2B-YY-xxxx`)
- B2B Event: `EV-YY-xxxx` (displayed as `#EV-YY-xxxx`)

### 8.2 Shared Order Fields (Minimum Required) `LOCKED`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | Yes | Module-specific format |
| `leadId` | string | Yes | Links to Lead entity |
| `statusOrder` | enum | Yes | `Aktif | Completed | Cancelled` |
| `tahapan` | string | Yes | Module-specific values |
| `tanggalDibuat` | date | Yes | Order creation date |
| `nilaiKontrak` | number | Yes | Total contract value |
| `picSalesEFM` | string | Yes | Sales responsible person |
| `picOpsEFM` | string | Yes | Operations responsible person |

### 8.3 PP-Specific Order Fields `LOCKED`

Additional fields unique to PP:
- `paket`, `sesi`, `sesiDone`, `sesiTotal`, `harga`
- `programId` (links to Program Catalog)
- `tipeProgram` (`individual | couple | grup`)
- `klienIds[]` (for multi-person programs)
- `paymentTracking[]` (installment records)
- `tanggalMulai`, `tglMulaiAktual`
- `hariLatihan[]`, `jamLatihan`, `lokasiLatihan`
- `masaBerlaku`

### 8.4 Order Snapshot in Agreement `CHANGE`

**CURRENT:** Agreement records contain order data as string literals copied manually (not auto-captured at a point in time).

**TARGET (from Agreement Architecture Review):** When `statusTtd` transitions to `signed`:
1. Order snapshot is captured into `agreement.snapshot.orderData`
2. Company settings are captured into `agreement.snapshot.companySettings`
3. Pasal text is captured into `agreement.snapshot.pasalList`
4. Snapshot is immutable thereafter

**CHANGE REQUIRED (Phase 2):** Implement snapshot locking. Current `updateDoc()` has no guard against modifying signed agreements.

---

## Section 9 — Document Architecture

### 9.1 Document Type Inventory `LOCKED`

| Document | PP | B2B Management | B2B Event |
|---|---|---|---|
| Screening/Survey/Consultation | `SCR-YY-xxxx` | `SVY-YY-xxxx` | `KNS-YY-xxxx` |
| Quotation | Embedded in Order | `nilaiEst` string in Lead | `QUO-EV-YY-xxxx` |
| Order | `PP-YY-xxxx` | `B2B-YY-xxxx` | `EV-YY-xxxx` |
| Invoice | `INV-PP-YY-xxxx` | `INV-B2B-YY-xxxx` | `INV-EV-YY-xxxx` |
| Receipt | `RCP-PP-YY-xxxx` | `RCP-B2B-YY-xxxx` | `RCP-EV-YY-xxxx` |
| Agreement / LOI | `AGR-PP-YY-xxxx` | `LOI-EFM-B2B-YY-xxxx` | `LOI-EFM-EVENT-YY-xxxx` |
| Assessment | `SCR-YY-xxxx` (Fitness) | N/A | N/A |
| H&S Acknowledgement | `HNA-PP-YY-xxxx` (target) | N/A | N/A |

### 9.2 PP Agreement Structure `LOCKED`

Per `PP_Agreement_Struktur_Flow.md` and `EFM_V2_Agreement_Architecture_Review.md`:

**Core Agreement = Komparisi + 12 Pasal + Appendix A (Lampiran)**

The 12 Pasal structure is confirmed as the standard. The current REACT-APP implementation matches this structure (12 pasal in `DEFAULT_PASAL_DETAIL`) with one exception: Pasal 5 bullet 3 contains a blanket waiver (see Section 15 of Agreement Architecture Review).

### 9.3 Agreement Modular Architecture (Target) `CHANGE`

**CURRENT:** Single flat agreement with hardcoded clauses.

**TARGET:** `MASTER AGREEMENT = CORE_CLAUSES (12) + PROGRAM_MODULE + APPENDIX_A`

Program modules:
- `standard` — no additional clauses (default for all current records)
- `active-aging` — AA-01 through AA-16 (specification supplied)
- `therapy`, `massage`, `corporate`, `event` — specifications not yet supplied (`NEEDS EVIDENCE`)

**CHANGE REQUIRED (Phase 2):** Implement Program Module clause system. Phase 1: add `programModuleType` field to all agreement records.

### 9.4 Quotation Architecture `OWNER DECISION`

Three modules have three different quotation models:

| Module | Quotation Type | Structure |
|---|---|---|
| PP | Embedded in Order | `quotation: { nomor, status, tanggal, manajemenFee, pajak[], catatan }` |
| B2B Management | String estimate in Lead | `nilaiEst: 'Rp X per bulan'` (not structured) |
| B2B Event | Standalone entity | `QUO-EV-YY-xxxx` with `items[]` + `pajak[]` |

**OWNER DECISION REQUIRED:** Should B2B Management have a formal standalone Quotation entity (like B2B Event)? Or is an estimate in the Lead record sufficient given the recurring-contract business model?

### 9.5 B2B / Event Missing Document Detail Pages `CHANGE`

**EVIDENCE (from UI Architecture Reconciliation):**
- B2B Management: No Invoice detail page, no Receipt detail page
- B2B Event: No Invoice detail page, no Receipt detail page, no Agreement/LOI detail page
- PP: Full detail pages for all document types

**CHANGE REQUIRED:** Create Invoice detail and Receipt detail pages for B2B and Event modules. Create LOI detail page for B2B Event.

---

## Section 10 — State Machine

### 10.1 PP Order tahapan State Machine `CHANGE`

**CURRENT:**
```
(Order Created) → Invoice → Agreement → Program Berjalan → Program Selesai
                                                          → Kontrak Dibatalkan (any point)
```

**TARGET (to align with full business flow):**
```
(Order Created) → Invoice → Agreement → H&S Acknowledgement → Assignment → Program Ready
                → Program Berjalan → Program Selesai
               → Kontrak Dibatalkan (any point)
```

**CHANGE REQUIRED:** Add 3 new tahapan values. No existing records need modification (they are valid at their current stages).

### 10.2 Agreement statusTtd State Machine `LOCKED`

Current 4-state machine is confirmed correct for Phase 1:
```
pending → waiting-approval → signed
       ↘ expired (time limit exceeded)
```

Target adds 7 more states for full lifecycle tracking:
```
pending → waiting-approval → signed → hna-pending → hna-complete → assigned → program-ready → in-program → completed/cancelled
```

**Note:** The extended states are in `agreement.status`, not `statusTtd` which tracks signature status specifically. `NEEDS EVIDENCE` on whether to add a separate `lifecycleStatus` field or extend `statusTtd`.

### 10.3 Lead Pipeline State Machine `LOCKED`

PP leads use 7-stage pipeline: `New → Approach → Screening → Invoicing → Closing → Convert | Lost`

B2B leads use 6-stage pipeline: `New → Proposal → Presentasi → Closing → Gagal | Converted`

These differences are intentional — each module has module-specific pipeline stages. `LOCKED`.

### 10.4 Complete Status Inventory (Cross-Reference) `LOCKED`

| Entity | Field | Permitted Values |
|---|---|---|
| Lead (PP list view) | `status` | `new, follow-up, closed-won, closed-lost` |
| Lead (PP store) | `statusPipeline` | `New, Approach, Screening, Invoicing, Closing, Convert, Lost` |
| Lead (B2B) | `stage` | `New, Proposal, Presentasi, Closing, Gagal, Converted` |
| Order | `statusOrder` | `Aktif, Completed, Cancelled` |
| Order | `tahapan` | See Section 10.1 |
| Order | `contractStatus` | `Active, Completed, Terminated, N/A` |
| Invoice | `status` | `draft, pending, paid, overdue` |
| Receipt | `waStatus` | `sent, not-sent, failed` |
| Agreement | `statusTtd` | `pending, waiting-approval, signed, expired` |
| Assessment | `statusAssessment` | `Pre-Test Selesai, Post-Test Selesai` |
| B2B Event Document | `status` | `drafting, on_review, revision, signed` |
| Trainer | `status` | `aktif, cuti, nonaktif` |

---

## Section 11 — Business Gates

### 11.1 Business Gate Matrix — Complete `CHANGE`

All business gates are missing in the current V2 implementation. The following table documents the intended gate model:

| Gate | Action Blocked | Required Condition | Evidence Source | Priority |
|---|---|---|---|---|
| G-01 | Create Order | Lead exists with `statusPipeline: Convert` | Business logic master map | High |
| G-02 | Create Invoice | Order `statusOrder: Aktif` | Inferred from flow | High |
| G-03 | Confirm Payment | Invoice `status: pending` | Inferred from flow | High |
| G-04 | Create Receipt | Invoice `status: paid` | Inferred from flow | High |
| G-05 | Create Agreement | Receipt exists for order | PP_Agreement_Struktur_Flow.md | High |
| G-06 | H&S Acknowledgement | Agreement `statusTtd: signed` | Agreement Architecture Review | High |
| G-07 | Assignment | H&S `status: complete` | Agreement Architecture Review | High |
| G-08 | Program Ready | Assignment confirmed | Agreement Architecture Review | Medium |
| G-09 | Record Attendance | Order `statusOrder: Aktif`, `sesiDone < sesiTotal` | Business logic master map | High |
| G-10 | Complete Order | `sesiDone === sesiTotal` | Business logic master map | Medium |
| G-11 | Renew Order | Previous assessment `statusAssessment: Post-Test Selesai` | Assessment data comments | Medium |
| G-12 | Assign Expired Trainer | Trainer PKS not expired | Inferred (Elena Rodriguez case) | Medium |
| G-13 | Active Aging Agreement Proceed | `companionInfo` fully populated | Agreement Architecture Review | High |

### 11.2 Gate Implementation Approach `OWNER DECISION`

**OWNER DECISION REQUIRED:** Should gates be:
- (A) **Hard gates**: UI blocks the action entirely; admin cannot override
- (B) **Soft gates with override**: UI warns/requires confirmation but admin can override with a reason
- (C) **Audit gates only**: Action is permitted but violation is logged and flagged

For a V2 system with a small team and direct owner supervision, option B (soft gates with override) is recommended as the default pattern, with specific exceptions where hard gates are legally required (e.g., cannot confirm payment without invoice).

---

## Section 12 — UI Architecture Reconciliation

### 12.1 Critical UI Gaps (from Phase 3 Audit) `CHANGE`

The following gaps were confirmed in `EFM_V2_REACT_MASTER_UI_ARCHITECTURE_RECONCILIATION.md`:

| Gap | Module | Priority |
|---|---|---|
| Invoice detail page missing | B2B Management | High |
| Receipt detail page missing | B2B Management | High |
| Invoice detail page missing | B2B Event | High |
| Receipt detail page missing | B2B Event | High |
| LOI/Agreement detail page missing | B2B Event | High |
| Event Konsultasi not in sidebar | B2B Event | Medium |
| `getAssessmentByOrderId()` returns null always | PP | High (bug) |
| PP Assessment search filter does not filter | PP | Medium (bug) |
| `tahapan` mismatch between orders list and store | PP | Medium |
| Hardcoded `picOpsEFM` fallback in PPLeadDetailPage | PP | Low |

### 12.2 Dual `tahapan` Data Sources `CHANGE`

**EVIDENCE:** `ppOrdersData.ORDERS_INIT` (list view) and `ppOrdersStore._orders` (detail view) are initialized from different sources and are NOT synchronized. A mutation via `updateOrder()` in the store is NOT reflected in the simple data export used for list views.

**CHANGE REQUIRED:** All list pages should read from the store (single source of truth), or the list data should be derived from the store on every render.

### 12.3 B2B and Event Lack Detail Pages for Core Documents `CHANGE`

The pattern "list page exists, detail page missing" is consistent across B2B and Event for Invoice and Receipt. This is not an architectural error — it is an unfinished feature. Both modules are explicitly "under construction."

**CHANGE REQUIRED:** Priority 1 items when B2B and Event development resumes.

---

## Section 13 — PP vs B2B vs Event Comparison

### 13.1 Feature Parity Matrix

| Feature | PP | B2B Mgmt | B2B Event | Notes |
|---|---|---|---|---|
| Lead entity + pipeline | ✅ Full | ✅ Partial | ✅ Partial | |
| Lead detail page | ✅ | ✅ | ✅ | |
| Pre-order consultation | ✅ (Screening) | ✅ (Survei) | ⚠️ Not in sidebar | Navigation bug |
| Quotation entity | ⚠️ Embedded in Order | ❌ Only estimate string | ✅ Standalone QUO-EV- | |
| Formal Order entity | ✅ Full | ⚠️ Route exists, data thin | ⚠️ Route exists, data missing | |
| Order detail page | ✅ 3 tabs | ✅ 4 tabs | ✅ 5 tabs | |
| Invoice list page | ✅ | ✅ | ✅ | |
| Invoice detail page | ✅ | ❌ Missing | ❌ Missing | |
| Receipt list page | ✅ | ✅ | ✅ | |
| Receipt detail page | ✅ | ❌ Missing | ❌ Missing | |
| Agreement/LOI | ✅ Full (AGR-PP-) | ⚠️ Partial | ⚠️ Data only (LOI in eventData) | |
| Agreement detail page | ✅ | ❌ Missing | ❌ Missing | |
| Assessment | ✅ Full | ❌ Not applicable | ❌ Not applicable | PP-specific |
| H&S Acknowledgement | ❌ Target only | ❌ Not applicable | ❌ Not applicable | PP-specific |
| Attendance/Rekap | ✅ Full | ✅ Partial | ✅ Partial | |
| Program catalog | ✅ | ⚠️ Implicit | ⚠️ Implicit | |

### 13.2 Intentional Differences (Not Deficiencies) `LOCKED`

The following differences between modules are BY DESIGN — not gaps to be closed:

1. **PP has Assessment + H&S**: B2B and Event do not. Fitness assessment is a PP-specific service component.
2. **B2B Event has standalone Quotation**: PP embeds quotation in Order because PP paket selection happens at order creation. Event quotation is a separately negotiated document.
3. **B2B Management has monthly billing**: PP bills per-package. Event bills per-event. Different billing rhythms are business-correct.
4. **PP has 5 document types post-Lead**: B2B Event has fewer because event delivery is simpler. This is not a deficiency.
5. **B2B Event peranEFM field**: Main Organizer / Co-Organizer / Fitness Consultant / Vendor — specific to event context, not present in PP or B2B Management.

---

## Section 14 — Legacy Filter

### 14.1 FRONTEND vs REACT-APP `LOCKED`

| System | Status | Decision |
|---|---|---|
| `FRONTEND/` | Legacy HTML/PHP static files | Reference only — do not adopt in new development |
| `REACT-APP/` | Active development target | All new development here |

**EVIDENCE:** The two systems are incompatible in ID format, structure, and technology. FRONTEND uses `AGR-001`, `PP-8042`, `INV/EFM/PP/2026/0089`. REACT-APP uses `AGR-PP-26-0001`, `PP-26-0001`, `INV-PP-26-0001`.

**OWNER DECISION REQUIRED:** Is FRONTEND currently in active use by any EFM staff? If yes, a data migration mapping table is required before REACT-APP can serve as the system of record. If no, FRONTEND can be frozen as a historical reference.

### 14.2 FRONTEND Data — Do Not Migrate Without Decision `OWNER DECISION`

Any records in FRONTEND that represent real client data must be treated as:
- Reference only until the owner confirms FRONTEND is not live
- Candidates for migration only after the FRONTEND Status decision above

### 14.3 FRONTEND Blanket Waiver — Also Present in REACT-APP `CHANGE`

**CRITICAL:** The blanket waiver wording in Pasal 5 bullet 3 appears to originate from the FRONTEND system (FRONTEND/agreement.html). It was carried forward into REACT-APP's `DEFAULT_PASAL_DETAIL`. This is NOT a "legacy issue that only affects FRONTEND" — it is present in the current active system.

**CHANGE REQUIRED:** Rewrite Pasal 5 bullet 3 before production use. Exact replacement text must be approved by the business owner.

---

## Section 15 — Data Model Risks

### 15.1 High-Risk Data Issues

**RISK 1 — Blanket Waiver in Agreement (CRITICAL) `CHANGE`**

**File:** `PPAgreementDetailPage.jsx:200`  
**Issue:** Pasal 5 bullet 3: "PIHAK PERTAMA beserta seluruh manajemen, pelatih, dan terapis dibebaskan dari segala tuntutan hukum..."  
**Risk level:** Legal — this clause may not be enforceable and could expose EFM to full liability.  
**Target wording:** AA-16 proportional liability pattern.  
**Owner decision required:** Confirm exact replacement clause text before any production use.

---

**RISK 2 — Agreement Not Snapshot-Locked (HIGH) `CHANGE`**

**Evidence:** `ppDocumentsStore.updateDoc()` applies any patch to any document with no guard for `statusTtd === 'signed'`. Company settings are read from `localStorage` at render time (not captured at signing time). Agreement clauses come from `localStorage` (overridable after signing).

**Risk level:** Legal/operational — a signed agreement can be silently modified.  
**Change required (Phase 2):** Implement snapshot locking as specified in Agreement Architecture Review, Section 16c.

---

**RISK 3 — `getAssessmentByOrderId()` Always Returns null (HIGH) `CHANGE`**

**File:** `ppAssessmentsData.js:342`  
**Evidence:** Assessment records have `leadId` and `klienId` but not `orderId`. The function checks `a.orderId === orderId` which is always `undefined`.  
**Impact:** Any component calling this function to display assessment data on an Order Detail page shows nothing.  
**Change required:** Either add `orderId` to assessment records, or change the lookup to use `getAssessmentByLeadId()`.

---

**RISK 4 — Data Cross-Reference Errors in Seed Data `CHANGE`**

Three confirmed inconsistencies in seed data:

1. `AGR-PP-27-0004.klienList` names don't match `ppKlienData` names for LP-0021 (Grup Zumba)
2. `AGR-PP-27-0002.leadId = 'LP-0002'` is wrong — PP-27-0002 belongs to LP-0019 (per ORDER_TO_LEAD_ID)
3. `opsData.picList` trainer Elena Rodriguez has PKS expired June 2024 but is listed as `status: aktif` and assigned to orders

---

**RISK 5 — Dual Trainer Registry (MEDIUM) `NEEDS EVIDENCE`**

Two separate trainer ID systems with different rate structures. Cannot be resolved without owner clarification on registry purpose.

---

**RISK 6 — E-Signature Legal Sufficiency (MEDIUM) `OWNER DECISION`**

**Evidence:** `ttdMetadata` captures timestamp via `new Date()` (client browser, manipulable) and IP from client-side code (not server-verified).  
**Risk:** Per UU ITE No. 11/2008, this may be sufficient for operational use but would not withstand judicial scrutiny as a certified e-signature.  
**Owner decision:** What level of e-signature validity is required for EFM's operational context? Operational (current) vs. legally certified (server-side timestamp, certified hash).

---

**RISK 7 — sesiDone Consistency (LOW-MEDIUM) `CHANGE`**

**Evidence:** `ABSENSI_SEED` file comment requires `sesiDone` in orders to equal count of absensi entries. No code enforces this.  
**Risk:** Manual inconsistency if attendance is recorded without updating `sesiDone`.  
**Change required (Phase 2):** Derive `sesiDone` from `ABSENSI_SEED.length` rather than storing it separately.

---

### 15.2 Data Anomaly — Couple Pricing in Agreements

**EVIDENCE:** AGR-PP-27-0002 (couple, 8 sesi): `harga: Rp3.200.000`, `hargaPerSesi: Rp400.000` — exactly double the standard rate. AGR-PP-27-0003 (couple, 12 sesi): same pattern.

**CONFIRMED:** From invoice data, couple pricing = 2 × individual rate. This is architecturally consistent and correct. `hargaPerSesi` in the agreement shows the aggregate per-session cost for both persons.

**VERDICT:** Not an error — this is correct couple pricing behavior. The design-standards paket price table applies to individual programs only. `NEEDS EVIDENCE` on whether to add a "couple" variant to the price table explicitly.

---

## Section 16 — Owner Decision Matrix

### 16A — Decisions Required NOW (Before Any Production Use)

| # | Decision | Evidence | Options | Recommendation |
|---|---|---|---|---|
| D-A1 | **Pasal 5 Blanket Waiver** — Confirm exact replacement text | Agreement Architecture Review §15, §18a | Owner provides new clause text | Replace with AA-16 proportional liability pattern |
| D-A2 | **FRONTEND System Status** — Is FRONTEND actively used? | Legacy system, ID format incompatible | (A) Freeze — reference only; (B) Migrate — build mapping table | Recommend (A) unless owner confirms FRONTEND has live client data |
| D-A3 | **Dual Trainer Registry** — What do PIC-xxx vs EFM-PIC-xxx represent? | opsData (125k–175k) vs ppProgramDBData (70k–80k) | (A) Two tiers (employed vs freelance); (B) Error — consolidate to one | Cannot determine without owner input |

### 16B — Decisions Required BEFORE Phase 2 Development Starts

| # | Decision | Evidence | Options | Recommendation |
|---|---|---|---|---|
| D-B1 | **Lead Status Sync** — Deprecate `ppLeadsData.status` in favor of `statusPipeline`? | Dual status system in ppLeadsData vs ppLeadsStore | (A) Deprecate ppLeadsData.status; (B) Keep both as separate concerns | Recommend (A) — compute display status from statusPipeline |
| D-B2 | **Couple/Group Pricing** — Explicit pricing tier needed? | Couple = 2× individual confirmed; Group Zumba = 175k/person (below standard) | (A) Add couple/group to price table; (B) Price is free-form for group | Group pricing appears context-dependent — recommend (B) with owner note |
| D-B3 | **B2B Management Quotation** — Standalone entity or estimate string? | B2B Management only has `nilaiEst` string in lead | (A) Build standalone quotation entity `QUO-B2B-YY-xxxx`; (B) Keep estimate string | Depends on B2B Management sales cycle; recommend owner decision |
| D-B4 | **B2B Lead ID** — `LB-xxxx` unified or `BC-xxx/BA-xxx` subtype? | `b2bData.js` uses BC-xxx (corporate) and BA-xxx (apartment) | (A) Unify under LB-xxxx + tipe field; (B) Keep subtype prefixes | Recommend (A) for consistency with standard ID format |
| D-B5 | **H&S Acknowledgement Companion Signing** — Info required or physical signature required? | AA-09: companion must be present; H&S captures contact info | (A) Fill companion info fields; (B) Companion must physically sign H&S form | Recommend (A) for Phase 1, (B) consideration for Phase 2 |
| D-B6 | **E-Signature Level** — Operational vs. legally certified? | Pasal 10 cites UU ITE; current implementation is client-side | (A) Current is sufficient for operations; (B) Server-side verification needed | Phase 1 (A) acceptable if FRONTEND is not in use for actual clients |
| D-B7 | **Therapy/Massage/Event Module Specifications** — Are these needed in Phase 1? | 6 module types listed in target; only Standard and Active Aging have specs | (A) Phase 1 only Standard + Active Aging; (B) All 6 required | Recommend (A) — defer others to Phase 2 |
| D-B8 | **Business Gate Type** — Hard, Soft, or Audit-only? | All gates currently missing | See Section 11.2 | Recommend Soft gates (warn + override with reason) for Phase 2 |
| D-B9 | **Guardian (Wali) Legal Party** — Wali as Pihak Kedua or just contact? | `pendaftarSamaDenganKlien: false` exists; legal distinction unclear | (A) Wali is legal party (Pihak Kedua); (B) Wali is contact only, client is party | Active Aging (elderly parent): likely (A). Minor: likely (A). Clarify with owner. |
| D-B10 | **Agreement Renewal Chain** — New AGR or extend existing? | `prevAssessmentId` renewal chain exists for assessments; no equivalent for agreements | (A) New AGR per renewal; (B) Version/extend existing AGR | Recommend (A) — new AGR per order, same as new assessment per order |

### 16C — Engineering Decisions (No Owner Input Required)

| # | Decision | Verdict |
|---|---|---|
| E-C1 | REACT-APP is the active development target | `LOCKED` |
| E-C2 | FRONTEND format is legacy; REACT-APP format is authoritative | `LOCKED` |
| E-C3 | `getAssessmentByOrderId()` must be fixed (add `orderId` to assessment records) | `CHANGE` |
| E-C4 | Seed data cross-references (AGR-PP-27-0004 klienList, AGR-PP-27-0002 leadId) must be corrected | `CHANGE` |
| E-C5 | `sesiDone` should be derived from absensi count rather than stored separately (Phase 2) | `CHANGE` |
| E-C6 | `updateDoc()` must check `isLocked` before applying patches (Phase 2) | `CHANGE` |
| E-C7 | `#` prefix: only Order IDs in display. All other IDs: no `#`. | `LOCKED` |
| E-C8 | Poppins is the global font. No other font families. | `LOCKED` |
| E-C9 | Navy `#1E1C43` is primary. Accent `#E05945` is CTA/active. `#F5F5F7` is page bg. | `LOCKED` |
| E-C10 | B2B and Event must have Invoice/Receipt detail pages before Phase 2 launch | `CHANGE` |

### 16D — Business Logic Already Clear (No Decision Needed)

| # | Item | Status |
|---|---|---|
| BL-01 | PP paket pricing: 200k/sesi, 4/8/12/24 sesi | `LOCKED` |
| BL-02 | Couple pricing = 2 × individual rate | `LOCKED` |
| BL-03 | PP flow: Lead → Order → Invoice → Receipt → Agreement → Program | `LOCKED` |
| BL-04 | Agreement requires receipt before creation (target gate) | `LOCKED` |
| BL-05 | Active Aging: companion mandatory per session (AA-09) | `LOCKED` |
| BL-06 | Active Aging: proportional liability, not blanket waiver (AA-16) | `LOCKED` |
| BL-07 | Agreement validity period: 4 sesi=30d, 8 sesi=45d, 12 sesi=60d, 24 sesi=90d | `LOCKED` |
| BL-08 | Renewal: post-test values → new pre-test values in new assessment | `LOCKED` |
| BL-09 | B2B Event: LOI format `LOI-EFM-EVENT-YY-xxxx` | `LOCKED` |
| BL-10 | B2B Management: alert at -30 days before contract expiry | `LOCKED` |
| BL-11 | PP Lead has 7-stage pipeline (New→Approach→Screening→Invoicing→Closing→Convert|Lost) | `LOCKED` |
| BL-12 | Fitness Assessment ≠ H&S Acknowledgement — different documents, different purposes | `LOCKED` |
| BL-13 | No RBAC in Phase 1 — single admin role for all staff | `LOCKED` |
| BL-14 | WhatsApp notification on receipt creation is planned but not integrated in Phase 1 | `LOCKED` |

---

## Section 17 — Recommended Architecture

### 17.1 Phase 1 Targets (Immediate)

The following changes are recommended for Phase 1 completion — ordered by legal/operational risk:

**Priority 1 — Legal Risk**
1. Rewrite Pasal 5 bullet 3 (blanket waiver → proportional liability) — requires owner text approval
2. Decide FRONTEND status (frozen or migrate) — blocks production go-live decision

**Priority 2 — Critical Bugs**
3. Fix `getAssessmentByOrderId()` — add `orderId` to assessment records or change lookup method
4. Fix seed data cross-references (AGR-PP-27-0002 leadId, AGR-PP-27-0004 klienList names)

**Priority 3 — Data Completeness**
5. Add `programModuleType: 'standard'` to all PP agreement records
6. Reclassify AGR-PP-27-0003 as `programModuleType: 'active-aging'`
7. Add new `tahapan` values to supported list (H&S Acknowledgement, Assignment, Program Ready)

**Priority 4 — Navigation Bugs**
8. Add Event Konsultasi to B2B Event sidebar navigation
9. Fix B2B Event document IDs to use `LOI-EFM-EVENT-YY-xxxx` format (remove `#` prefix)

### 17.2 Phase 2 Targets (After Owner Decisions)

After owner decisions D-A1 through D-A3 and D-B1 through D-B10 are resolved:

**Architecture Completions:**
- Implement H&S Acknowledgement entity, data model, and UI flow (PP only)
- Implement Agreement snapshot locking
- Build Invoice/Receipt detail pages for B2B and B2B Event
- Implement Business Gates (soft gates with override log)
- Implement Active Aging program module (AA-01 through AA-16 clauses, companion info gate)
- Resolve dual trainer registry — consolidate to one authoritative source
- Define B2B Management formal Order entity schema

**Data Model Extensions:**
- Create `ppHnaData.js` / `ppHnaStore.js` (H&S Acknowledgement entity)
- Add `programModuleType` field to all agreement stores
- Add `companionInfo` field to Active Aging agreement records
- Consolidate `ppLeadsData.status` with `statusPipeline`

### 17.3 Phase 3 Targets (Backend / Production)

- Server-side PDF generation for agreements (Puppeteer/Playwright)
- Server-side timestamp and IP capture for legally valid e-signatures
- Clause template versioning system
- RBAC (Admin / Super Admin / Owner)
- WhatsApp API integration for receipt delivery
- Google Sheets / backend API connection

### 17.4 Guiding Architecture Principle — Repeated `LOCKED`

> **CONSISTENT CORE, FLEXIBLE BUSINESS MODULE**
>
> - The Order → Invoice → Receipt → Agreement chain is the shared core. It must be consistent across all three modules.
> - PP has additional steps (H&S, Assessment) that B2B and Event do not share. This is correct.
> - B2B Event has standalone Quotation. PP embeds quotation. This is correct.
> - B2B Management has monthly billing. Other modules bill per-order. This is correct.
> - Do not force uniformity where business character differs.

---

## Section 18 — Final Status Inventory

### 18.1 LOCKED Items (Architecture Decisions Confirmed)

1. Three-module structure: PP, B2B Management, B2B Event
2. CONSISTENT CORE, FLEXIBLE BUSINESS MODULE principle
3. REACT-APP as active development target
4. Order is the core business entity in all modules
5. All document IDs follow `[DOCTYPE]-[MODULE]-[YY]-[SEQUENCE]` format
6. `#` prefix ONLY for Order IDs; all other IDs display without `#`
7. PP paket pricing: 200k/sesi × sesi = total
8. Couple pricing = 2 × individual rate (confirmed from invoice data)
9. PP flow: Lead → Order → Invoice → Receipt → Agreement → H&S → Assignment → Program
10. Agreement validity periods by paket (30/45/60/90 days)
11. Active Aging: AA-09 companion mandatory; AA-16 proportional liability
12. Fitness Assessment (SCR-) ≠ H&S Acknowledgement (HNA-) — different documents
13. PP 7-stage lead pipeline is correct
14. Renewal: post-test values become new pre-test (renewal assessment copy)
15. FRONTEND system is legacy reference only (pending owner FRONTEND Status decision)
16. B2B Event Quotation (`QUO-EV-`) is the most advanced quotation model; it is a standalone entity
17. B2B Event has `peranEFM` field (Main Organizer / Co-Organizer / Fitness Consultant / Vendor)
18. No RBAC in Phase 1
19. Poppins font, navy/accent/bg color tokens confirmed
20. B2B Event LOI format: `LOI-EFM-EVENT-YY-xxxx`

**Total LOCKED: 20 items**

### 18.2 CHANGE Items (Must Change Before Production)

1. Pasal 5 bullet 3 — replace blanket waiver with proportional liability wording
2. B2B Event document IDs — change from `#EV-DOC-xxx` to `LOI-EFM-EVENT-YY-xxxx`
3. Event Konsultasi — add to sidebar navigation
4. `getAssessmentByOrderId()` — fix the lookup (always returns null)
5. Assessment cross-reference — AGR-PP-27-0002 has wrong leadId (LP-0002 should be LP-0019)
6. klienList names — AGR-PP-27-0004 klienList names don't match ppKlienData
7. PP Order tahapan — add 3 new values (H&S Acknowledgement, Assignment, Program Ready)
8. `programModuleType` — add to all PP agreement records
9. Dual `tahapan` data source — list pages should read from store (single source)
10. B2B and Event — create Invoice detail pages
11. B2B and Event — create Receipt detail pages
12. B2B Event — create LOI/Agreement detail page
13. Agreement snapshot locking — implement before production (Phase 2)
14. `updateDoc()` — add `isLocked` guard (Phase 2)
15. `sesiDone` — derive from absensi count rather than stored value (Phase 2)
16. Elena Rodriguez — PKS expired June 2024; status `aktif` is incorrect in seed data
17. B2B Management — define formal Order entity schema

**Total CHANGE: 17 items**

### 18.3 OWNER DECISION Items

1. D-A1: Pasal 5 replacement clause exact text
2. D-A2: FRONTEND system status (frozen vs migrate)
3. D-A3: Dual trainer registry — PIC-xxx vs EFM-PIC-xxx purpose and rates
4. D-B1: ppLeadsData.status — deprecate or keep alongside statusPipeline
5. D-B2: Group pricing tier — is Group Zumba rate (175k/person) intentional vs 200k standard?
6. D-B3: B2B Management Quotation — standalone entity or estimate string?
7. D-B4: B2B Lead ID — unified LB-xxxx or subtype BC-/BA-?
8. D-B5: H&S Companion — fill info fields only, or physical signature required?
9. D-B6: E-signature level — operational (current) or legally certified (server-side)?
10. D-B7: Therapy/Massage/Event module specifications — needed in Phase 1?
11. D-B8: Business gate type — hard, soft (with override), or audit-only?
12. D-B9: Guardian (Wali) — legal party (Pihak Kedua) or contact only?
13. D-B10: Agreement renewal — new AGR per renewal or version existing?

**Total OWNER DECISION: 13 items**

### 18.4 NEEDS EVIDENCE Items

1. Dual trainer registry — which registry serves which business purpose?
2. Group Zumba rate (175k/person) — intentional below-standard rate or error?
3. Therapy, Massage module specifications — owner has not supplied AA-equivalent specs
4. B2B Management contract renewal full workflow — limited evidence
5. Couple pricing — whether to add explicit couple variant to price table
6. B2B Event settlement/Rekap financial logic — no evidence of settlement entity
7. Extended Agreement state machine — separate `lifecycleStatus` field or extend `statusTtd`?

**Total NEEDS EVIDENCE: 7 items**

---

## Summary Statistics

| Category | Count |
|---|---|
| Total sections | 18 |
| LOCKED items | 20 |
| CHANGE items | 17 |
| OWNER DECISION items | 13 |
| NEEDS EVIDENCE items | 7 |
| **Total classified items** | **57** |

---

## 5–10 Most Important Architectural Findings

**Finding 1 — Blanket Waiver is a Critical Legal Risk (Pasal 5 bullet 3)**  
The current agreement in REACT-APP (and carried from FRONTEND) contains a blanket waiver that exempts EFM from *all* legal claims. This conflicts directly with the owner-supplied AA-16 proportional liability principle. This must be fixed before production use regardless of module maturity. No code change is needed until the owner confirms the exact replacement text.

**Finding 2 — Active Aging Module Has Zero Implementation Despite Complete Specification**  
The owner has supplied 16 clauses (AA-01 through AA-16) for Active Aging. One existing record (AGR-PP-27-0003) appears to be an Active Aging case. There is no `programModuleType` field, no companion info capture, and no module-specific clause rendering anywhere in REACT-APP. This is the largest gap between documented intent and implementation.

**Finding 3 — H&S Acknowledgement Is a Missing Structural Step**  
The target flow requires an H&S Acknowledgement step between Agreement signing and program assignment. This step doesn't exist as an entity, page, route, or data file. `ppAssessmentsData` (fitness testing) is not a substitute — it serves a different purpose. The 3 missing `tahapan` values (H&S Acknowledgement, Assignment, Program Ready) mean the order lifecycle cannot accurately represent where a program is.

**Finding 4 — B2B Event Has No Order Entity in the Data Layer**  
B2B Event has routes for orders (`/event/orders/:id`) but no `eventOrdersData.js` or `eventOrdersStore.js`. The critical chain — Quotation → Order → Invoice → Receipt → LOI — is broken in the data layer. This is the highest-priority structural gap for B2B Event module completion.

**Finding 5 — `getAssessmentByOrderId()` Always Returns null**  
This confirmed bug in `ppAssessmentsData.js:342` means that any component trying to display assessment data on an order detail page will always receive null. This is a silent failure — no error is thrown. Assessment data is effectively inaccessible via the intended API.

**Finding 6 — Agreement Is Not Snapshot-Locked After Signing**  
A signed agreement can be silently modified: `updateDoc()` has no `isLocked` guard, company settings are read from `localStorage` at render time, and clause templates are overridable via `localStorage`. A legally valid e-agreement must be immutable after the final party signs. This is a Phase 2 implementation requirement.

**Finding 7 — Dual Trainer Registry Has Irreconcilable Rate Difference**  
`opsData.picList` (PIC-001) shows trainer rates of 125k–175k/sesi. `ppProgramDBData.PIC_DB` (EFM-PIC-001) shows 70k–80k/sesi. This is not a minor rounding difference — it is a 2× discrepancy that cannot be resolved without owner clarification on what the two lists represent. Assignment logic, PKS contract values, and operational cost calculations all depend on this.

**Finding 8 — All 13 Business Gates Are Missing**  
No workflow gate is implemented in the V2 data layer. Any action can be taken in any order by a admin user. While acceptable for a UI prototype, this means there is no safety net before production: an invoice can be "confirmed paid" without a payment record, a program can be "started" before the agreement is signed, and a trainer with an expired PKS can be assigned. A soft gate layer should be part of Phase 2.

**Finding 9 — FRONTEND Status Is Unresolved and Blocks Production Decision**  
If FRONTEND contains real client data that is currently in use, REACT-APP cannot serve as the system of record until a migration map is built. If FRONTEND is already frozen, none of this is required. This single owner decision (D-A2) is the gate for the entire production timeline.

**Finding 10 — PP Is the Reference Architecture, Not a Mandatory Template**  
PP's maturity (8 entities, 12 pasal agreement, renewal chain, assessment, attendance) is the result of PP being EFM's oldest and most complex module. B2B Management and B2B Event are under construction and differ by business character — not by neglect. The recommendation is to reach feature parity on the shared core (Invoice/Receipt detail pages, Order entity formalization) before forcing further PP-pattern adoption on modules that have different business logic.

---

## Recommendation: Workshop or More Evidence?

**Immediate Recommendation: Proceed to Owner Decision Workshop**

The three most important decisions (D-A1, D-A2, D-A3) can be resolved in a single 60-minute working session with the owner. These three decisions unblock:

- D-A1 (Pasal 5 wording) → unblocks production use of PP module
- D-A2 (FRONTEND status) → unblocks production go-live timeline
- D-A3 (trainer registry) → unblocks assignment architecture and PKS contract values

Evidence is sufficient for all 20 LOCKED items and all 17 CHANGE items. No additional research is required to begin implementation of these changes.

The 13 OWNER DECISION items should be the agenda for the workshop — all 13 can be decided by the business owner without additional technical research.

The 7 NEEDS EVIDENCE items should be presented in the workshop as "here is what we found, does this match your understanding?" — most of them can be closed in the same session.

**Suggested Workshop Agenda:**
1. D-A1: Pasal 5 blanket waiver — owner provides replacement wording (10 min)
2. D-A2: FRONTEND status — frozen or migrate? (5 min)
3. D-A3: Dual trainer registry — what are the two lists? Correct rates? (10 min)
4. Group pricing tier and couple pricing confirmation (5 min)
5. B2B Management Quotation and Lead ID format (5 min)
6. Active Aging companion requirement and H&S signing level (5 min)
7. E-signature level for Phase 1 (5 min)
8. Business gate type selection (5 min)
9. NEEDS EVIDENCE items — cross-check with owner (10 min)

---

*This document is a read-only architecture audit. No code was modified. All findings reference source files with specific line numbers or file citations.*  
*Document generated: 18 Sep 2026 · EFM V2 Business Architecture Decision Matrix / Phase 4*
