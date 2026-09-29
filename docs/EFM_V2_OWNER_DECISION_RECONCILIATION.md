# EFM V2 — Owner Decision Reconciliation

> Re-evaluation of all 13 OWNER DECISION + 7 NEEDS EVIDENCE items from the  
> Business Architecture Decision Matrix (Phase 4). Guiding principle:  
> **BUSINESS LOGIC FIRST. ARCHITECTURE SECOND. IMPLEMENTATION THIRD.**  
> Do not ask owner to decide engineering details when business logic determines the answer.

EFM V2 — Phase 5 · CV. Bugar Nusantara Jaya · 18 Sep 2026  
Mode: STRICT READ-ONLY — no code changes, no refactor, no migration, no commit, no PR.

---

## How to Read This Document

Each item is evaluated against one question:

> **"Can the correct answer be derived from EFM business rules without owner input?"**

If YES → the item is re-classified as **DERIVABLE** and the derived answer is stated.  
If the decision concerns a factual state unknown from the codebase → **NEEDS EVIDENCE** (ask once).  
If it genuinely requires the owner's risk tolerance, legal preference, or operational policy → **TRUE OWNER DECISION**.  
If existing documentation already settles it → **ALREADY DECIDED**.

---

## Part 1 — Re-Evaluation of 13 OWNER DECISION Items

---

### D-A1 — Pasal 5 Replacement Clause Exact Text

| Field | Detail |
|---|---|
| **Issue** | Pasal 5 bullet 3 contains a blanket waiver exempting EFM from all legal claims. Must be replaced with proportional liability wording. |
| **Existing Evidence** | AA-16 (Active Aging clause 16) explicitly defines proportional liability: EFM bears responsibility only for harms attributable to EFM's own negligence. Wording at `PPAgreementDetailPage.jsx:200`. |
| **Business Logic** | The DIRECTION is settled by AA-16: blanket waiver → proportional liability. The exact legal phrase is not derivable from a design document — it requires legal drafting or owner authorship. |
| **Dependencies** | None — does not block any other decision. Can be resolved independently. |
| **Can Business Logic Determine It?** | PARTIALLY — direction YES; exact text NO. |
| **Classification** | **SPLIT** |
| **Reason** | Direction is ALREADY DECIDED by AA-16. Exact replacement sentence is a TRUE OWNER DECISION (legal wording, owner must review or sign off). |
| **Consequence** | Once owner provides the replacement text, the CHANGE in `PPAgreementDetailPage.jsx:200` is a one-line edit. Unblocks PP module for production use. |

---

### D-A2 — FRONTEND System Status

| Field | Detail |
|---|---|
| **Issue** | Is the legacy FRONTEND system currently active with real client data? If so, REACT-APP cannot be the system of record without a migration map. |
| **Existing Evidence** | FRONTEND uses incompatible ID formats: `AGR-001`, `PP-8042`, `INV/EFM/PP/2026/0089`. No evidence from codebase whether FRONTEND is frozen, in use, or deprecated. |
| **Business Logic** | This is a factual question about current operations — not an architecture question. No code or document can answer it. |
| **Dependencies** | Blocks: production go-live timeline, decision to build a migration map. |
| **Can Business Logic Determine It?** | **NO** — factual operational question. |
| **Classification** | **NEEDS EVIDENCE** |
| **Reason** | Reclassified from OWNER DECISION to NEEDS EVIDENCE: this is not a preference question ("which do you want?") — it is a factual question ("what is currently happening?"). Owner states the fact; architecture follows. |
| **Consequence** | If FRONTEND is frozen → REACT-APP proceeds as system of record, no migration needed. If FRONTEND is live → migration map required before any client-facing production launch. |

---

### D-A3 — Dual Trainer Registry

| Field | Detail |
|---|---|
| **Issue** | `opsData.picList` (PIC-001 prefix, rates 125k–175k/sesi) vs `ppProgramDBData.PIC_DB` (EFM-PIC-001 prefix, rates 70k–80k/sesi). 2× rate discrepancy. |
| **Existing Evidence** | Business Logic Master Map explicitly labels this "data duplication, not two distinct trainer populations." However, the 2× rate difference suggests they may represent two different financial measurements of the same person (cost rate vs charge rate), not true duplication. |
| **Business Logic** | If PIC_DB (70–80k) = what EFM pays the trainer per session (PKS contracted rate), and picList (125–175k) = what EFM charges the client per session — then BOTH registries are correct and BOTH are needed for different functions. This interpretation is consistent with a healthy margin model but cannot be confirmed without owner input. |
| **Dependencies** | Blocks: assignment architecture, PKS contract values, invoice line item source. |
| **Can Business Logic Determine It?** | **NO** — the rate function (cost vs charge) is a factual question about EFM's financial model. |
| **Classification** | **NEEDS EVIDENCE** |
| **Reason** | Reclassified from OWNER DECISION to NEEDS EVIDENCE: the question is "what does each rate represent?" — not "which architecture do you prefer?" Owner explains the rate structure; architecture is then derivable. |
| **Consequence** | If cost+charge model confirmed → keep both registries, add explicit `costRate`/`chargeRate` field labels, sync by trainer entity. If true duplication confirmed → consolidate to one registry with correct rates. |

---

### D-B1 — ppLeadsData.status vs statusPipeline

| Field | Detail |
|---|---|
| **Issue** | `ppLeadsData` records have both a `.status` field (free-text strings) and a `.statusPipeline` field (standardized 7-stage enum). Two fields track the same concept. |
| **Existing Evidence** | All 7 pipeline stage values are in `statusPipeline`. `.status` values are inconsistent strings that partially overlap with pipeline stages. The leads list page uses `statusPipeline` for filtering logic. |
| **Business Logic** | Having two fields for the same concept with inconsistent values is a data integrity defect, not a design choice. `statusPipeline` is the authoritative source (enum, drives filter logic). `.status` is legacy and creates maintenance risk. No business rule requires `.status` to exist separately. |
| **Dependencies** | None — internal data layer change only. |
| **Can Business Logic Determine It?** | **YES** |
| **Classification** | **DERIVABLE FROM BUSINESS LOGIC** |
| **Reason** | `statusPipeline` is the single source of truth. `.status` should be deprecated and removed. This is an engineering correctness decision, not a business preference. |
| **Consequence** | Remove `.status` field from all `ppLeadsData` records. Update any component reading `.status` to use `.statusPipeline`. Zero functional change — only data cleanliness improvement. |

---

### D-B2 — Group Pricing Tier (175k/person)

| Field | Detail |
|---|---|
| **Issue** | A Zumba group session record shows 175k/person — below the 200k/sesi PP standard. Is this intentional or an error? |
| **Existing Evidence** | Zumba is a B2B Event product, not a PP product. B2B Event has its own pricing model via `eventQuotationsStore.js`. PP paket pricing (200k/sesi × sessions) is LOCKED in the Decision Matrix. |
| **Business Logic** | If the 175k record is a B2B Event session: it is a different pricing model and 175k/person for a group event is standard industry practice (volume discount). If the record is misclassified under PP: it is an error. The distinction depends on which module the record belongs to. |
| **Dependencies** | Requires identifying which module the specific record belongs to. |
| **Can Business Logic Determine It?** | **YES** — after module verification |
| **Classification** | **DERIVABLE FROM BUSINESS LOGIC** |
| **Reason** | Two scenarios, both derivable: (1) B2B Event record → 175k correct, no change needed. (2) PP record → 175k is an error, should be 200k. Verify module assignment; rate then follows from module pricing rules. |
| **Consequence** | Audit the record: if `moduleType: 'b2b-event'`, close this item. If `moduleType: 'pp'`, correct to 200k and update the Decision Matrix CHANGE list. |

---

### D-B3 — B2B Management Quotation Entity

| Field | Detail |
|---|---|
| **Issue** | B2B Management uses only `nilaiEst: 'Rp X/bln'` string. Should it have a structured Quotation entity like B2B Event (`QUO-EV-YY-xxxx`)? |
| **Existing Evidence** | Business Logic Master Map lists B2B Management flow as: Lead → Survei → **Quotation** → Order → Invoice → Kontrak. A Quotation step is in the documented flow but has no data entity. B2B Event standalone Quotation (`eventQuotationsStore.js`) is the most mature quotation model. |
| **Business Logic** | If Quotation is in the B2B Management flow, the entity must exist eventually. Whether it needs to be in Phase 1 or can remain as an estimate string depends on whether B2B clients require a formal quote document before contract. |
| **Dependencies** | B2B Management Order entity must be defined first before Quotation can reference it. |
| **Can Business Logic Determine It?** | **NO** — depends on client procurement process (do corporate clients require formal quotation documents?). |
| **Classification** | **NEEDS EVIDENCE** |
| **Reason** | The business flow requires it eventually. Phase 1 priority depends on whether current B2B clients require a formal document. Owner confirms this operational requirement. |
| **Consequence** | If clients require formal quote → add `b2bQuotationsStore.js` with `QUO-B2B-YY-xxxx` in Phase 2. If estimate string is sufficient for now → leave as `nilaiEst`, upgrade later. |

---

### D-B4 — B2B Lead ID Format

| Field | Detail |
|---|---|
| **Issue** | Current code uses `BC-xxx` (corporate) and `BA-xxx` (apartment). Design standards specify `LB-xxxx` for all B2B leads. |
| **Existing Evidence** | `efm-design-standards` skill: "Lead | B2B | `LB-0001`". `b2bData.js` has `CORP_LEADS_INIT` with `BC-001`–`BC-010` and `APT_LEADS_INIT` with `BA-001`–`BA-008`. |
| **Business Logic** | Corporate client and apartment property client are both B2B leads — they differ in client type (tipe), not entity type. ID prefix encodes entity class, not subtype. Subtypes are attributes (fields), not ID modifiers. The correct pattern is `LB-xxxx` with a `tipe: 'corporate' | 'apartment'` field. This is how PP works: all PP leads use `LP-xxxx` regardless of paket or program type. |
| **Dependencies** | None — data migration from BC/BA to LB format; update all cross-references. |
| **Can Business Logic Determine It?** | **YES** |
| **Classification** | **DERIVABLE FROM BUSINESS LOGIC** |
| **Reason** | Same entity class = same ID prefix. `tipe` field distinguishes corporate vs apartment. The current BC/BA format violates the established ID convention without any business justification. |
| **Consequence** | Migrate B2B leads to `LB-xxxx` format. Add `tipe: 'corporate' | 'apartment'` field. Update all references, filters, and displays. This is a CHANGE item. |

---

### D-B5 — H&S Companion Requirement

| Field | Detail |
|---|---|
| **Issue** | Active Aging clients require a companion (AA-09). Does the companion need to SIGN the agreement or only have their information filled in? |
| **Existing Evidence** | AA-09: companion information is required. AA-10: companion must physically accompany client to sessions. No AA clause specifies companion signature. The current agreement has one signature block (Pihak Kedua = klien/wali). |
| **Business Logic** | If a companion is not a party to the agreement, they have no contractual obligations and EFM has no recourse if they fail to accompany. If they are an information contact only, the obligation to accompany falls solely on the client/wali. Whether the companion needs legal liability is a risk architecture decision. |
| **Dependencies** | Affects agreement form design (number of signature blocks), companion data fields, and legal party count. |
| **Can Business Logic Determine It?** | **NO** — this is a legal risk architecture question. |
| **Classification** | **TRUE OWNER DECISION** |
| **Reason** | AA-09 says fill companion info; it does not say companion signs. Whether EFM wants the companion to be a contractually bound party requires the owner's explicit decision. A sports lawyer's opinion would be valuable. |
| **Consequence** | If companion signs → add third signature block to Active Aging agreement. If info only → current single Pihak Kedua block is sufficient, add companion info fields to Lampiran A. |

---

### D-B6 — E-Signature Level

| Field | Detail |
|---|---|
| **Issue** | Current implementation captures canvas TTD with client-side timestamp, device info, and IP. Indonesian UU ITE recognizes e-signatures, but a higher legal standard requires server-side certification. |
| **Existing Evidence** | Pasal 10 of standard agreement explicitly states TTD is valid per UU ITE. Phase 3 architecture plan includes "server-side PDF generation with legally valid e-signatures." |
| **Business Logic** | Phase 1 is UI-only with dummy data. Phase 3 is the planned production backend phase. The question is not WHETHER to upgrade — it's already planned — but WHEN and at WHAT LEVEL for Phase 1 operational use. |
| **Dependencies** | Phase 3 technical architecture (Puppeteer/Playwright, server-side timestamp). |
| **Can Business Logic Determine It?** | **NO** — depends on owner's tolerance for legal risk during Phase 1 operations. |
| **Classification** | **TRUE OWNER DECISION** |
| **Reason** | The technical path is clear (Phase 3 server-side). The risk question is: during Phase 1 operations (before Phase 3 is built), if a dispute arises, is client-side metadata sufficient? This is a legal risk appetite call. |
| **Consequence** | If Phase 1 operational level is acceptable → proceed with current implementation; ensure metadata is logged. If higher level needed from day 1 → must build server-side signing before any production use of PP module. |

---

### D-B7 — Therapy / Massage Module Specifications

| Field | Detail |
|---|---|
| **Issue** | No specifications have been supplied for Therapy or Massage modules. Are they needed in Phase 1? |
| **Existing Evidence** | None. No mention in any architectural document. Phase 1 scope in all documents covers PP, B2B Management, B2B Event. |
| **Business Logic** | Phase 1 scope is explicitly PP + B2B Management + B2B Event. Therapy and Massage are not in any scoping document. Following standard project management: undefined scope is out of scope. |
| **Dependencies** | None — blocking nothing. |
| **Can Business Logic Determine It?** | **YES** |
| **Classification** | **DERIVABLE FROM BUSINESS LOGIC** |
| **Reason** | Out of Phase 1 scope. No specification = no implementation. Owner can add in Phase 2/3 with a spec similar to PP's Active Aging specification. |
| **Consequence** | Close this item for Phase 1. Owner opens a new spec document when ready to add these modules. |

---

### D-B8 — Business Gate Type

| Field | Detail |
|---|---|
| **Issue** | All 13 business gates are missing. What type should they be: hard (blocking), soft (override with log), or audit-only? |
| **Existing Evidence** | EFM is a small operations team (Admin / Super Admin / Owner). No RBAC in Phase 1. All 13 gates are currently absent. |
| **Business Logic** | Hard gates in a small team create workflow friction and emergencies require "workarounds" that bypass the system entirely (worse than soft gates). Audit-only gates provide no safety benefit. Soft gates with override logging are the standard pattern for small-team operations software: they enforce process awareness without breaking emergency flexibility, and the override log creates accountability. This is a well-established pattern in fitness/service business software. |
| **Dependencies** | Gate type determines whether gate violations generate errors (hard) or log entries (soft). Affects UI/UX design of override flow. |
| **Can Business Logic Determine It?** | **YES** |
| **Classification** | **DERIVABLE FROM BUSINESS LOGIC** |
| **Reason** | Small team + operational flexibility requirement + accountability need → soft gates with override log. This is not a preference question — it's a consequence of team size and operational reality. |
| **Consequence** | Implement 13 soft gates: check condition → if not met, show warning + "Override dengan alasan" input → log override with actor, timestamp, reason. |

---

### D-B9 — Guardian (Wali) Role

| Field | Detail |
|---|---|
| **Issue** | When a minor or incapacitated person is the klien, the wali may sign the agreement. Is the wali Pihak Kedua (legal party) or only a representative/contact? |
| **Existing Evidence** | PP Agreement Struktur Flow: "Pendaftar = Klien?" flag and "Data Wali (jika beda)" section in Lampiran A. Pihak Kedua block is labeled as "Klien." The wali architecture is referenced but not legally defined. |
| **Business Logic** | Indonesian contract law (KUHPerdata Pasal 1320–1330): a valid contract requires parties with legal capacity (kecakapan bertindak). A person under 18 (minor) does not have full legal capacity. Their wali is the legal representative and is the actual contracting party. Therefore: when `pendaftarSama = false` and klien is a minor → wali is Pihak Kedua; when klien is an adult → klien is Pihak Kedua. This is not ambiguous under Indonesian law. |
| **Dependencies** | Affects agreement form layout, signature block assignment, and Lampiran A field design. |
| **Can Business Logic Determine It?** | **YES** |
| **Classification** | **DERIVABLE FROM BUSINESS LOGIC** |
| **Reason** | Indonesian law is clear on legal capacity. The wali is Pihak Kedua when the klien is a minor. The klien is Pihak Kedua when an adult. Implementation: add `klienUsia` field to determine minor status; bifurcate signature block assignment accordingly. |
| **Consequence** | In agreement form: `if (klienIsMinor) Pihak Kedua = wali, else Pihak Kedua = klien`. Data model: `klienIsMinor: boolean` derived from klien `tanggalLahir`. No owner decision needed. |

---

### D-B10 — Agreement Renewal Architecture

| Field | Detail |
|---|---|
| **Issue** | When a client renews their program, should a new AGR document be created or should the existing agreement be versioned? |
| **Existing Evidence** | Renewal chain in REACT-APP: new Order → new Invoice → new Receipt → new Agreement. Assessment renewal uses `prevAssessmentId` chain for continuity. Both patterns point to new-document-with-back-reference. |
| **Business Logic** | Each renewal is a new commercial transaction: new consideration (payment), new offer (new paket/terms), new acceptance (new signing). Under Indonesian contract law, a new agreement is the legally clean approach — versioning an existing contract creates ambiguity about which version governs during disputes. The `prevAssessmentId` chain already establishes the correct pattern for continuity while maintaining separate entities. |
| **Dependencies** | B2B Management contract renewal may differ (see NE-4 below). For PP, this is settled. |
| **Can Business Logic Determine It?** | **YES** (for PP) |
| **Classification** | **DERIVABLE FROM BUSINESS LOGIC** |
| **Reason** | New transaction = new AGR. `prevAgreementId` back-reference provides continuity without muddying legal clarity. Same proven pattern as `prevAssessmentId`. |
| **Consequence** | Add `prevAgreementId: string | null` field to agreement schema. Renewal flow creates new AGR with `prevAgreementId` pointing to the completed AGR. AGR history chain is traversable. |

---

## Part 2 — Re-Evaluation of 7 NEEDS EVIDENCE Items

---

### NE-1 — Dual Trainer Registry Business Purpose

| Field | Detail |
|---|---|
| **Issue** | `opsData.picList` (125k–175k/sesi) and `ppProgramDBData.PIC_DB` (70k–80k/sesi) appear to track the same trainers at very different rates. |
| **Business Logic Hypothesis** | Rate spread suggests two different financial measurements of the same trainer: `PIC_DB` rate = what EFM pays the trainer (PKS contracted rate); `picList` rate = what EFM charges the client per session (billable rate including margin). This is a standard cost-vs-revenue split in service businesses and would mean BOTH registries are correct and necessary. |
| **Can Business Logic Determine It?** | **NO** — hypothesis is architecturally plausible but needs owner confirmation of what each rate represents. |
| **Re-Classification** | **NEEDS EVIDENCE** (confirmed; re-label as factual question not design question) |
| **What to Ask** | "Does PIC_DB rate (70–80k) represent what EFM pays the trainer, and picList rate (125–175k) represent what EFM charges the client?" |
| **Consequence** | If cost+revenue model confirmed → rename fields for clarity (`costRatePerSesi`, `chargeRatePerSesi`), keep both registries, sync by trainer ID. If single rate → consolidate to one registry. |

---

### NE-2 — Group Zumba Rate (175k/person)

| Field | Detail |
|---|---|
| **Issue** | One record shows 175k/person for a Zumba session vs 200k/sesi PP standard. |
| **Business Logic Analysis** | Zumba is a B2B Event product. B2B Event has its own pricing model. If this is a B2B Event record, 175k/person for a group Zumba (with, say, 20–30 participants) represents a completely different revenue structure from individual PP training. The 200k standard applies only to PP individual training. |
| **Can Business Logic Determine It?** | **YES** — after module verification. |
| **Re-Classification** | **DERIVABLE FROM BUSINESS LOGIC** |
| **Reason** | Verify the record's module type. If `moduleType: 'b2b-event'` → 175k is correct B2B Event group pricing, close the item. If `moduleType: 'pp'` → data error, correct to 200k. |
| **Action** | Audit one record; classification follows automatically. |

---

### NE-3 — Therapy / Massage Module Specifications

| Field | Detail |
|---|---|
| **Issue** | Owner has not supplied specifications for Therapy or Massage modules. |
| **Business Logic Analysis** | Not in Phase 1 scope. No document references them. |
| **Can Business Logic Determine It?** | **YES** — out of scope. |
| **Re-Classification** | **DERIVABLE FROM BUSINESS LOGIC** |
| **Reason** | Phase 1 scope is PP + B2B Management + B2B Event. Undefined = out of scope. Close for Phase 1. |
| **Action** | None for Phase 1. Owner creates spec for Phase 2+ addition. |

---

### NE-4 — B2B Management Contract Renewal Workflow

| Field | Detail |
|---|---|
| **Issue** | Recurring monthly contract renewal — does it auto-renew, require annual renegotiation, or something else? |
| **Business Logic Analysis** | B2B Management is fundamentally different from PP renewal. PP renewal is client's choice to buy another paket. B2B renewal is typically a contractual term — annual contract with auto-renew clause or explicit renegotiation. This depends on what the B2B contracts actually say. |
| **Can Business Logic Determine It?** | **NO** — depends on terms in actual B2B service contracts with corporate clients. |
| **Re-Classification** | **TRUE OWNER DECISION** |
| **Reason** | Reclassified from NEEDS EVIDENCE to TRUE OWNER DECISION: the evidence that is "needed" is inside the actual B2B contracts, which the owner holds. Owner describes the renewal process from current practice. |
| **Consequence** | If auto-renew → system generates new monthly invoice automatically; Kontrak amendment if terms change. If explicit renewal → triggers a new Quotation → Order → Kontrak cycle annually. |

---

### NE-5 — Couple Pricing Explicit Table Entry

| Field | Detail |
|---|---|
| **Issue** | Should the paket price table include an explicit "couple" variant with its own price display? |
| **Existing Evidence** | Couple pricing = 2 × individual rate is LOCKED (confirmed from invoice data). Standard table: 4/8/12/24 sesi at 200k/sesi per person. |
| **Business Logic Analysis** | Since couple = 2 × individual, no new pricing logic is needed. An explicit table entry adds client clarity but doesn't change any calculation. This is a presentation decision, not a business logic decision. |
| **Can Business Logic Determine It?** | **YES** — UX decision with no business impact. |
| **Re-Classification** | **DERIVABLE FROM BUSINESS LOGIC** |
| **Reason** | Couple pricing is correctly defined. Whether to show a pre-calculated couple total in the price table is a UX choice — implement as convenience display. No owner decision required. |
| **Action** | Optionally add couple row to price display table showing 2× the individual total. Backend calculation unchanged. |

---

### NE-6 — B2B Event Settlement / Rekap Financial Logic

| Field | Detail |
|---|---|
| **Issue** | B2B Event has Rekap Kehadiran (attendance). How does financial settlement work after an event? Is there a settlement entity? |
| **Existing Evidence** | No settlement entity exists in `eventQuotationsStore.js` or any B2B Event data file. Rekap absensi logic is described but not financial reconciliation. |
| **Business Logic Analysis** | B2B Event financial settlement depends on billing model: (a) flat fee per event = one invoice, no settlement; (b) per-session billing = invoice generated from Rekap; (c) advance payment with reconciliation = settlement entity needed. |
| **Can Business Logic Determine It?** | **NO** — depends on EFM's B2B Event billing model. |
| **Re-Classification** | **TRUE OWNER DECISION** |
| **Reason** | Reclassified from NEEDS EVIDENCE to TRUE OWNER DECISION: the answer depends on EFM's contractual model with B2B Event clients, which only the owner knows. |
| **What to Ask** | "For B2B Events: is the client billed a flat fee upfront, per session after attendance, or advance + reconciliation after the event?" |
| **Consequence** | Flat fee → no settlement entity; Invoice is final. Per-session → Invoice generated from attendance Rekap after event. Advance + reconciliation → settlement entity needed (`settlementsStore.js`). |

---

### NE-7 — Extended Agreement State Machine

| Field | Detail |
|---|---|
| **Issue** | `statusTtd` has 4 values (pending / waiting-approval / signed / expired). The full agreement lifecycle needs more states (active program, program complete, superseded). Should these be a separate `lifecycleStatus` field or extend `statusTtd`? |
| **Business Logic Analysis** | `statusTtd` tracks the SIGNING CEREMONY — who has signed and at what stage. `lifecycleStatus` tracks the OPERATIONAL PHASE — is the program currently running? These are orthogonal concerns. A signed agreement (statusTtd = signed) can be in multiple lifecycle phases over time (program active → program complete → superseded by renewal). Mixing them in one field forces artificial state combinations. |
| **Can Business Logic Determine It?** | **YES** — two distinct concepts require two distinct fields. |
| **Re-Classification** | **DERIVABLE FROM BUSINESS LOGIC** |
| **Reason** | Signing ceremony status and operational lifecycle are orthogonal. Separate fields is the architecturally correct answer regardless of owner preference. |
| **Architecture Decision** | Add `lifecycleStatus: 'pre-program' | 'active' | 'completed' | 'superseded' | 'cancelled'` field alongside `statusTtd`. `lifecycleStatus` transitions independently of `statusTtd` after signing. |

---

## Part 3 — Hidden Decisions Discovery

The following decisions were **not identified** in the original Decision Matrix but are architecturally significant.

---

### H-01 — PP Quotation Nomor Format Non-Standard

| Field | Detail |
|---|---|
| **Hidden Decision** | PP Quotation uses `nomor: "QUO/EFM/PP/YYYY/xxxx"` (slash-separated, year-full) — different from the established standard `QUO-PP-YY-xxxx`. |
| **Evidence** | `ppOrdersStore.js`: `quotation: { nomor: "QUO/EFM/PP/2026/0001", ... }`. Design standards: all IDs use `[DOCTYPE]-[MODULE]-[YY]-[SEQUENCE]`. |
| **Classification** | **DERIVABLE** — standardize to `QUO-PP-YY-xxxx`. Non-standard format is a data inconsistency, not a design choice. |
| **Action** | Update all PP quotation nomor values in seed data to `QUO-PP-26-xxxx` format. Add to CHANGE list. |

---

### H-02 — Klien ID Creation Timing

| Field | Detail |
|---|---|
| **Hidden Decision** | When is the `KL-xxxx` record and ID assigned? At lead registration (potential client), at order confirmation (committed client), or at agreement signing (contracted client)? |
| **Evidence** | `ppKlienData.js` exists as a separate store. `ppOrdersData` references klien by name. `ORDER_TO_KLIEN_ID` mapping in store. |
| **Business Logic** | A Klien (the person who trains) is definitively known at Order time — the order specifies the program and who will participate. The `KL-xxxx` ID should be assigned at Order confirmation when the commercial relationship is established. Lead stage: prospect, no Klien ID yet. Order confirmed: Klien record created. |
| **Classification** | **DERIVABLE** — Klien ID assigned at Order confirmation. |
| **Action** | Document this in the data model: `ppLeadsData` has no Klien ID; `ppOrdersData` has klienId reference; `ppKlienData` record created at order confirmation. |

---

### H-03 — Couple Agreement Signing Authority

| Field | Detail |
|---|---|
| **Hidden Decision** | For a couple program (Lead = payer, 2 Klien = both partners): who signs as Pihak Kedua? Both partners? Only the payer? |
| **Evidence** | Invoice data confirms couple = 2 × individual rate under one order. Agreement has one Pihak Kedua block. No couple-specific signature logic exists. |
| **Business Logic** | One order = one commercial transaction = one Pihak Kedua. The payer/pendaftar is the contracting party. The non-signing partner is a program participant (klien) listed in Lampiran A klienList but not a signing party. The payer bears responsibility for both participants under the one agreement. |
| **Classification** | **DERIVABLE** — payer/pendaftar is Pihak Kedua; partner is listed in klienList but does not sign. |
| **Action** | No new signature block needed for couple programs. Ensure klienList in Lampiran A clearly lists both participants. |

---

### H-04 — B2B Event: LOI vs MOU vs Kontrak Selection

| Field | Detail |
|---|---|
| **Hidden Decision** | B2B Event has `LOI-EFM-EVENT-YY-xxxx` format defined. But when does EFM use an LOI vs a full Kontrak vs an MOU for events? |
| **Evidence** | No document specifies the selection criteria. B2B Event `peranEFM` field has 4 values: Main Organizer / Co-Organizer / Fitness Consultant / Vendor. |
| **Business Logic** | Document type typically depends on EFM's role and event scope: Vendor/Fitness Consultant (supporting role) → LOI or simple agreement. Co-Organizer (shared production) → MOU. Main Organizer (lead) → full Kontrak. But this is a business policy decision. |
| **Classification** | **NEEDS EVIDENCE** — depends on EFM's event contracting practice per role type. |
| **What to Ask** | "For B2B Events: which document type do you use by EFM role — LOI, MOU, or Kontrak for each of Main Organizer / Co-Organizer / Fitness Consultant / Vendor?" |

---

### H-05 — B2B Management Service Contract as Order Equivalent

| Field | Detail |
|---|---|
| **Hidden Decision** | B2B Management's service contract (Kontrak Layanan) is undefined as a data entity. Is the service contract equivalent to the PP Order entity? |
| **Evidence** | B2B Management documented flow: Lead → Survei → Quotation → Order → Invoice → Kontrak. The Order entity is in the flow but has no `b2bOrdersStore.js`. |
| **Business Logic** | The service contract IS the commercial transaction entity — equivalent to PP's Order. It should have: Order ID (`B2B-YY-xxxx`), contract period, monthly service scope, trainer assignments, billing schedule. The monthly Invoice is generated FROM this contract Order. |
| **Classification** | **DERIVABLE** — service contract = B2B Order entity. Define `b2bOrdersStore.js` with monthly billing attributes. |
| **Action** | Add to CHANGE list: create B2B Management Order entity and store. |

---

### H-06 — Agreement Approval Authority

| Field | Detail |
|---|---|
| **Hidden Decision** | Who at EFM can approve a client's electronic signature (the `waiting-approval` → `signed` transition)? Currently: any Admin. |
| **Evidence** | RBAC (Admin / Super Admin / Owner) is documented but NOT implemented in Phase 1. No role-based gate on agreement approval. |
| **Business Logic** | Phase 1 has no RBAC. Any Admin user can approve. In Phase 3 RBAC, high-value B2B contracts may require Super Admin or Owner approval. For Phase 1: Admin approval is sufficient. |
| **Classification** | **DERIVABLE (Phase 1)** — any Admin can approve in Phase 1. RBAC approval tiers deferred to Phase 3. |
| **Action** | No change for Phase 1. Document Phase 3 requirement: approval role gate for agreements above a value threshold. |

---

### H-07 — Assessment Trigger Timing

| Field | Detail |
|---|---|
| **Hidden Decision** | Does the fitness assessment happen before or after agreement signing? The target flow shows: Agreement → H&S → Assessment → Program Start. |
| **Evidence** | Assessment creates a pre-test baseline which is used to design the program. Agreement signing commits the client to the program. H&S Acknowledgement is a health risk disclosure. |
| **Business Logic** | Logical sequence: client must commit (Agreement) before investing time in assessment (which generates the program design). H&S Acknowledgement follows agreement (client discloses health conditions after committing to program). Assessment follows H&S (trainer has health info, then designs program). First session follows assessment. This sequence is internally consistent. |
| **Classification** | **DERIVABLE** — Assessment happens after Agreement + H&S, before first session. |
| **Action** | Confirms the target 9-step flow in the Decision Matrix. |

---

### H-08 — Payment Channel List

| Field | Detail |
|---|---|
| **Hidden Decision** | Is the payment method field a closed enum or free-text? |
| **Evidence** | `ppInvoiceData.js` has `payMethod: 'BCA Transfer'` and similar strings. Inconsistent casing and spelling across records likely exists. |
| **Business Logic** | Free-text payment method breaks payment reporting (cannot aggregate by channel), creates data entry errors, and makes reconciliation harder. A closed list of authorized payment channels is standard for financial record-keeping. |
| **Classification** | **TRUE OWNER DECISION** — owner must specify which payment channels are authorized (e.g., BCA Transfer, Mandiri Transfer, QRIS, COD, Cash). |
| **What to Ask** | "What are EFM's authorized payment channels? (List all that clients use to pay.)" |
| **Consequence** | Convert `payMethod` to enum with owner-specified values. Add "Lainnya (sebutkan)" escape hatch for edge cases. |

---

### H-09 — Invoice Due Date Standard

| Field | Detail |
|---|---|
| **Hidden Decision** | Is invoice due date (Jatuh Tempo) calculated as a standard number of days from invoice date, or manually set per invoice? |
| **Evidence** | Invoice template edit mode allows Jatuh Tempo to be set as a date input (minimum H+2). No standard payment term is enforced. |
| **Business Logic** | PP clients (individual, one-time payment): standard H+3 (urgent payment, prevent delay). B2B clients (corporate, negotiated terms): configurable per contract (H+14 to H+30 is standard B2B). A sensible default per module reduces manual entry errors. |
| **Classification** | **DERIVABLE (default)** — PP default: H+3; B2B default: H+14; admin can override. |
| **Action** | Set module-specific default Jatuh Tempo in invoice creation: PP auto-fills H+3, B2B auto-fills H+14. Both remain overridable by admin. |

---

### H-10 — Agreement Snapshot Embedding Timing

| Field | Detail |
|---|---|
| **Hidden Decision** | Company settings (name, logo, legal name, signatory) are read from `localStorage` at render time. This means a signed agreement can display different company info if settings change. When should company data be embedded into the agreement record? |
| **Evidence** | `updateDoc()` has no `isLocked` guard. `localStorage` template risk identified in Agreement Architecture Review Section 16. |
| **Business Logic** | A legally valid agreement is a snapshot at the time of signing. Post-signing company name changes, signatory changes, or logo changes must not alter what was agreed. The correct pattern: at `statusTtd = signed`, embed a snapshot of company settings into the agreement record. Thereafter, display the embedded snapshot rather than live `localStorage` values. |
| **Classification** | **DERIVABLE** — embed company settings at signing time. Standard contract law requirement; no owner decision needed. |
| **Action** | Add `companySnapshot: { namaPerusahaan, namaLegal, namaHukum, jabatan, tandaTangan }` field to agreement schema. Populate at signing event. Display from `companySnapshot` when `statusTtd = signed`. Add `isLocked` guard to `updateDoc()`. |

---

## Part 4 — Reclassification Summary

### All 13 OWNER DECISION Items

| ID | Original | Re-Classification | Final |
|---|---|---|---|
| D-A1 | OWNER DECISION | SPLIT: direction ALREADY DECIDED (AA-16); text TRUE OWNER DECISION | TRUE OWNER DECISION |
| D-A2 | OWNER DECISION | Factual question about operations, not a preference | NEEDS EVIDENCE |
| D-A3 | OWNER DECISION | Factual question about rate model, not a design choice | NEEDS EVIDENCE |
| D-B1 | OWNER DECISION | Engineering correctness; `statusPipeline` is authoritative | DERIVABLE |
| D-B2 | OWNER DECISION | Module-dependent; B2B Event rate model differs from PP | DERIVABLE |
| D-B3 | OWNER DECISION | Depends on B2B client procurement requirements | NEEDS EVIDENCE |
| D-B4 | OWNER DECISION | Same entity class = same ID prefix; tipe is a field | DERIVABLE |
| D-B5 | OWNER DECISION | AA clauses do not specify companion signing | TRUE OWNER DECISION |
| D-B6 | OWNER DECISION | Legal risk appetite for Phase 1 operations | TRUE OWNER DECISION |
| D-B7 | OWNER DECISION | Out of Phase 1 scope; no spec supplied | DERIVABLE |
| D-B8 | OWNER DECISION | Small team + flexibility requirement → soft gates | DERIVABLE |
| D-B9 | OWNER DECISION | Indonesian contract law determines this | DERIVABLE |
| D-B10 | OWNER DECISION | New transaction = new agreement; same as assessment chain | DERIVABLE |

### All 7 NEEDS EVIDENCE Items

| ID | Original | Re-Classification | Final |
|---|---|---|---|
| NE-1 | NEEDS EVIDENCE | Rate function unclear; needs owner confirmation | NEEDS EVIDENCE |
| NE-2 | NEEDS EVIDENCE | Module type verification resolves it | DERIVABLE |
| NE-3 | NEEDS EVIDENCE | Out of Phase 1 scope | DERIVABLE |
| NE-4 | NEEDS EVIDENCE | B2B contract terms = TRUE OWNER DECISION | TRUE OWNER DECISION |
| NE-5 | NEEDS EVIDENCE | UX display only; no business impact | DERIVABLE |
| NE-6 | NEEDS EVIDENCE | Depends on EFM's B2B Event billing model | TRUE OWNER DECISION |
| NE-7 | NEEDS EVIDENCE | Two distinct concepts require two fields | DERIVABLE |

### 10 Hidden Decisions (New)

| ID | Description | Classification |
|---|---|---|
| H-01 | PP Quotation nomor format | DERIVABLE (standardize to `QUO-PP-YY-xxxx`) |
| H-02 | Klien ID creation timing | DERIVABLE (at Order confirmation) |
| H-03 | Couple agreement signing authority | DERIVABLE (payer/pendaftar only) |
| H-04 | B2B Event: LOI vs MOU vs Kontrak by role | NEEDS EVIDENCE |
| H-05 | B2B Management service contract = Order entity | DERIVABLE |
| H-06 | Agreement approval authority | DERIVABLE (Admin in Phase 1) |
| H-07 | Assessment trigger timing | DERIVABLE (after Agreement + H&S) |
| H-08 | Payment channel list (open vs closed) | TRUE OWNER DECISION |
| H-09 | Invoice due date standard | DERIVABLE (PP: H+3, B2B: H+14) |
| H-10 | Agreement snapshot embedding timing | DERIVABLE (embed at signing) |

---

## Part 5 — Final Statistics

| Metric | Count |
|---|---|
| **Original OWNER DECISION items** | 13 |
| **Original NEEDS EVIDENCE items** | 7 |
| **Total items re-evaluated** | 20 |
| — | — |
| **ALREADY DECIDED** (direction only; D-A1 partially) | 1 (partial) |
| **DERIVABLE FROM BUSINESS LOGIC** | 8 |
| **TRUE OWNER DECISION** (genuinely requires owner) | 5 |
| **NEEDS EVIDENCE** (factual question → owner states fact) | 7 |
| — | — |
| **Hidden decisions discovered** | 10 |
| — Hidden: DERIVABLE | 7 |
| — Hidden: TRUE OWNER DECISION | 1 (H-08) |
| — Hidden: NEEDS EVIDENCE | 2 (H-04) |

**Original 20 items → only 5 require a genuine owner preference decision.**  
The remaining 15 were misclassified as design choices when business logic, law, or factual state already determines the answer.

---

## Part 6 — Decisions That Block UI Architecture

These items cannot be resolved without owner input AND affect UI structure — implementing before deciding will require rework:

| Item | Blocker | Impact |
|---|---|---|
| **D-A1** (Pasal 5 text) | Owner must provide replacement wording | Single field in `PPAgreementDetailPage.jsx:200`. Low structural impact; high legal urgency. |
| **D-A2** (FRONTEND status) | Owner confirms operational state | If FRONTEND is live: migration map required before production launch. Blocks go-live timeline entirely. |
| **D-A3** (Trainer rate model) | Owner confirms cost vs charge model | If confirmed: rename fields, update invoice line item logic, PKS contract values. Affects `opsData.picList` + `PIC_DB` + Assignment UI. |
| **D-B5** (Companion signing) | Owner decides if companion is a signing party | If companion signs: add third signature block to Active Aging agreement form. Structural change to agreement UI. |
| **NE-4** (B2B renewal model) | Owner describes current practice | Determines whether B2B system needs auto-invoice generation vs manual renewal cycle. |
| **NE-6** (B2B Event settlement) | Owner describes billing model | Determines whether a settlement entity/page is needed in B2B Event module. |
| **H-04** (B2B Event document type by role) | Owner specifies per-role policy | Determines which document type the LOI Detail page must handle for each `peranEFM` value. |
| **H-08** (Payment channel list) | Owner lists authorized channels | Determines enum values for `payMethod` field across all modules. |

**Total UI-blocking decisions requiring owner input: 8**

---

## Part 7 — Decisions That Can Be Safely Postponed

These items do not block any current implementation — they can be resolved in Phase 2 or Phase 3 without creating rework:

| Item | Why Postponable |
|---|---|
| **D-B6** (E-signature level) | Phase 1 is UI-only; Phase 3 backend will handle server-side signing. Decide in Phase 3 planning. |
| **D-B7** (Therapy/Massage scope) | Not in Phase 1 scope. Owner opens spec when ready. |
| **H-06** (Agreement approval authority) | Phase 1 has no RBAC; any Admin can approve. RBAC tiers designed in Phase 3. |
| **H-09** (Invoice due date defaults) | Defaults (PP: H+3, B2B: H+14) can be implemented now; configurability can be added in Phase 2. |

---

## Part 8 — Owner Decision Workshop Agenda (Revised)

Based on this reconciliation, the owner needs to answer **13 questions** — down from the original 20 items. All can be resolved in a single 90-minute session.

### Critical Path (must resolve before production): 45 min

1. **D-A1** (10 min): Provide replacement text for Pasal 5 bullet 3. Reference: AA-16 proportional liability principle. EFM is liable only for EFM's own negligence.
2. **D-A2** (5 min): Is FRONTEND currently in active use with real client data, or is it frozen?
3. **D-A3** (10 min): In `picList` (125–175k/sesi) and `PIC_DB` (70–80k/sesi): does one represent what EFM pays the trainer and the other what EFM charges the client?
4. **D-B5** (10 min): For Active Aging clients: does the companion need to sign the agreement, or only have their information recorded?
5. **H-08** (10 min): What payment channels does EFM accept from clients? (List all authorized methods.)

### Important but not blocking (can do in same session): 25 min

6. **D-B3** (5 min): Do B2B Management corporate clients require a formal Quotation document, or is a verbal/email estimate sufficient before the Kontrak?
7. **NE-4** (5 min): For B2B Management contracts: does EFM auto-renew annually or renegotiate each year?
8. **NE-6** (10 min): For B2B Events: is the client billed a flat fee before the event, per-attendance after, or advance + reconciliation?
9. **H-04** (5 min): For B2B Events by EFM role — Main Organizer / Co-Organizer / Fitness Consultant / Vendor: which uses LOI, which uses MOU, which uses full Kontrak?

### Confirmation questions (factual, 5 min each): 20 min

10. **NE-1** (5 min): For trainers: does `PIC_DB` rate (70–80k) represent EFM's contracted cost, and `picList` rate (125–175k) represent what clients are charged?
11. **NE-2** (5 min): The 175k/person Zumba record — is this a B2B Event session or a PP group session?
12. **D-B6** (5 min): Is the current client-side e-signature (with timestamp/device/IP metadata) acceptable for Phase 1 operations, or must server-side certification be in place before any real client data is handled?
13. **D-B2** (5 min): [Only if NE-2 confirmed as PP] Is a group discount rate for PP group sessions intentional policy?

---

## Decision Scorecard — Before and After

| Category | Before Reconciliation | After Reconciliation |
|---|---|---|
| OWNER DECISION (13 original) | 13 | 5 confirmed + 3 reclassified to NEEDS EVIDENCE + 5 reclassified to DERIVABLE |
| NEEDS EVIDENCE (7 original) | 7 | 3 confirmed + 2 reclassified to DERIVABLE + 2 reclassified to TRUE OWNER DECISION |
| Hidden OWNER DECISION | 0 | 1 new (H-08) |
| Hidden NEEDS EVIDENCE | 0 | 2 new (H-04 × 2 items) |
| Total requiring owner input | 20 | 13 |
| Total resolved without owner | 0 | 7 DERIVABLE from original + 7 DERIVABLE hidden |

**Net result: 35% reduction in owner decisions required (20 → 13).  
7 original items were misclassified as design choices when business logic already determined the answer.**

---

## Sources

This document draws exclusively from existing project artifacts. No code was modified.

| Source | Used For |
|---|---|
| `docs/EFM_V2_BUSINESS_ARCHITECTURE_DECISION_MATRIX.md` | Original decision items (Section 18.3, 18.4) |
| `docs/EFM_V2_Business_Logic_Workflow_Reconstruction.md` | Business flow, trainer rates, pricing data |
| `docs/EFM_V2_BUSINESS_LOGIC_MASTER_MAP.md` | Dual trainer registry note, actor model, entity model |
| `docs/EFM_V2_Agreement_Architecture_Review.md` | Pasal 5, AA clauses, signature logic |
| `docs/PP_Agreement_Struktur_Flow.md` | Pihak Kedua definition, wali fields |
| `REACT-APP/src/data/ppOrdersStore.js` | PP quotation nomor format evidence |
| `REACT-APP/src/data/b2bData.js` | B2B Lead ID (BC/BA) format evidence |
| `REACT-APP/src/data/eventQuotationsStore.js` | B2B Event quotation standard format |
| KUHPerdata Pasal 1320–1330 | Wali as Pihak Kedua (Indonesian contract law) |
| UU ITE No. 11/2008 | E-signature legal basis |

---

*This document is a read-only reconciliation audit. No source files were modified.*  
*Companion to: EFM V2 Business Architecture Decision Matrix (Phase 4)*  
*Document generated: 18 Sep 2026 · EFM V2 Owner Decision Reconciliation / Phase 5*
