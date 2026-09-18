# EFM Backend — Architecture Audit

> Read-Only Technical Audit Report  
> Tanggal: 18 September 2026  
> Scope: `BACKEND/` + `FRONTEND/` + `REACT-APP/`  
> Pilot Target: Active Aging  
> CV. Bugar Nusantara Jaya — EFM V2

> ⚠ **READ-ONLY AUDIT** — Dokumen ini murni observasi. Tidak ada perubahan kode, migrasi, atau fitur baru.

---

## Daftar Isi

1. [Project Architecture](#1-project-architecture)
2. [Database Schema](#2-database-schema)
3. [Order Lifecycle](#3-order-lifecycle)
4. [Agreement System](#4-agreement-system)
5. [Health & Safety](#5-health--safety)
6. [Assignment](#6-assignment)
7. [Attendance](#7-attendance)
8. [Business Rules](#8-business-rules)
9. [Status Enums](#9-status-enums)
10. [Gap Analysis](#10-gap-analysis)
11. [Active Aging Readiness](#11-active-aging-readiness)
12. [Final Summary](#12-final-summary)

---

## 1. Project Architecture

EFM terdiri dari **tiga sistem terpisah** yang hidup berdampingan di satu repository:

| Layer | Path | Stack | Status | Data |
|---|---|---|---|---|
| **Old Frontend** | `FRONTEND/` | Vanilla HTML + CSS + JS, served via Google Apps Script HTML Service | Aktif (Legacy) | Hardcoded dummy di dalam file HTML |
| **Backend** | `BACKEND/apps-script/` | Google Apps Script (.gs) → Web App → Google Sheets | Partial (Program DB only) | Google Sheets (SS_ID = placeholder, belum terhubung) |
| **New Frontend** | `REACT-APP/` | React 18 + Vite + Tailwind CSS v3 + React Router v6 | Aktif (Development) | Dummy data di `src/data/*Data.js` |

### Topology Saat Ini

Backend hanya ada satu file: `program-db.gs`. Ini adalah Google Apps Script Web App yang expose endpoint GET dengan parameter `action=...`. **Tidak ada server tradisional (Node.js/PHP/Python)**. Semua logika order, agreement, invoice, receipt, attendance, dan assignment saat ini **tidak ada di backend** — mereka hanya sebagai UI dummy data.

### File Inventory

| Path | Jumlah File | Keterangan |
|---|---|---|
| `BACKEND/apps-script/program-db.gs` | 1 file .gs | Satu-satunya backend. 356 baris. |
| `FRONTEND/*.html` | 28 file HTML | Old system: dashboard, pp-\*, b2b-\*, event-\*, ops-\*, settings, template-agreement |
| `FRONTEND/assets/css/` | 3 file CSS | import-engine.css, responsive.css, table-standard.css |
| `FRONTEND/assets/js/` | 2 file JS | import-engine.js, mobile.js |
| `REACT-APP/src/` | ~80+ file JSX/JS | New admin dashboard |

> 📌 **Temuan kritis:** `SS_ID = 'PASTE_SPREADSHEET_ID_DISINI'` dan `ADMIN_TOKEN = 'GANTI_TOKEN_RAHASIA_ADMIN'` — backend belum pernah di-deploy ke Spreadsheet nyata. Seluruh backend masih dalam kondisi template/placeholder.

---

## 2. Database Schema

Satu-satunya schema yang terdefinisi secara eksplisit adalah di `program-db.gs` melalui column map constants. Total 5 sheet:

### Sheet: PROGRAM_DB (existing — extended)

Kolom 0–12 (original):
`id`, `namaLatihan`, `namaPaket`, `sesi`, `pertemuan`, `partisipan`, `masa`, `picId`, `biayaSesiPIC`, `harga`, `hargaPersesi`, `diskonPaket`, `status`

Kolom 13–24 (baru dari Phase 0 catalog extension):
`kategori_program`, `pakai_ratecard_efm`, `deskripsi_program`, `batas_minggu`, `pertemuan_per_minggu`, `durasi_menit`, `kapasitas_min`, `kapasitas_max`, `level_kelas`, `item_tidak_termasuk`, `benefits`, `terms_condition`

### Sheet: KATEGORI_PROGRAM (new)
`id_kategori`, `nama_kategori`, `urutan_tampil`, `status`

### Sheet: PROFIL_PELATIH_PUBLIC (new)
`kode_pic`, `nama_lengkap`, `nama_panggilan`, `sertifikat`, `foto_url`, `status`

### Sheet: PROGRAM_VARIAN_HARGA (new)
`id_varian`, `id_program`, `label_varian`, `harga_sebelum_diskon`, `harga_akhir`, `diskon_persen`, `harga_per_unit`

### Sheet: CONFIG (new)
`key`, `value` — saat ini hanya satu entry: `terms_condition_global`

### Sheet yang BELUM Ada di Backend

Sheet yang perlu dibuat untuk arsitektur baru:
`ORDER`, `INVOICE`, `RECEIPT`, `AGREEMENT`, `HEALTH_ASSESSMENT`, `ASSIGNMENT`, `ATTENDANCE`, `LEAD`, `CLIENT`, `PROGRAM_MODULE`

---

## 3. Order Lifecycle

### Status Order (dari UI)

```
New Order → Active → Completed
Active → Cancelled
```

### Field Order yang Terlihat di FRONTEND

| Field | Contoh Nilai | Keterangan |
|---|---|---|
| `order_id` | PP-8042 | Format lama (bukan PP-26-XXXX dari REACT-APP) |
| `nama_klien` | James Wilson | |
| `namaLatihan` | Private Training | |
| `paket` | 12 Sesi - Pro | |
| `pic` | Sarah Jenkins | Pelatih yang ditugaskan |
| `sesiDone / sesiTotal` | 4/12 | Progress sesi (UI bar) |
| `tanggal` | 24 Okt 2026 | Tanggal order dibuat |
| `statusOrder` | active / completed / cancelled | |
| `statusInvoice` | paid / pending / overdue | |

### Create Order Flow (5 Steps dari Modal)

Modal "Buat Order Baru" di `pp-orders.html` menampilkan 5 langkah: **Klien → Program → Logistik → Biaya → Review**. Step 1 memiliki pencarian dari "Database Leads" (dropdown autocomplete). Ini adalah form UI-only — tidak ada endpoint backend yang menerima data ini.

> ⚠ **Order ID format mismatch:** FRONTEND menggunakan format `PP-8042` (numerik urut sederhana), sementara REACT-APP menggunakan `PP-26-0001` (YY + 4-digit sequence). Invoice format di FRONTEND: `INV/EFM/PP/2026/0089` vs REACT-APP: `INV-PP-26-0001`. Agreement: `AGR-001` vs `AGR-PP-26-0001`. Dua sistem belum konsisten.

---

## 4. Agreement System

### FRONTEND — AGREEMENT_DB (JavaScript array, in-memory)

File `pp-documents.html` mendefinisikan `const AGREEMENT_DB` secara hardcoded.

| Field | Keterangan |
|---|---|
| `berkas_id, display_id` | AGR-001, #AGR-001 |
| `nama_klien, avatar_initials, avatar_color` | UI display |
| `nama_lengkap_pendaftar, nama_panggilan` | Data klien |
| `no_wa, email, alamat_lengkap` | Kontak |
| `detail_pesanan, order_id, paket, namaLatihan` | Ref order |
| `no_receipt, ref_invoice, pic` | Ref dokumen keuangan + pelatih |
| `tgl_dibuat, status_ttd, tgl_ttd` | Status TTD |

### REACT-APP — ppDocumentsData.js (extended)

REACT-APP menambahkan field: `ttdMetadata` (timestamp, device, ipAddress), `approvedBy`, `approvalTimestamp`, `masaBerlaku`, `hariLatihan`, `jamLatihan`, `lokasiLatihan`. Juga 12 pasal (vs 7 pasal di FRONTEND).

### Signature Flow

```
pending → [klien TTD via signature_pad] → waiting-approval → [Admin Approve] → signed
pending → [timeout] → expired
```

### Pasal Perjanjian

| Sistem | Jumlah Pasal | Catatan |
|---|---|---|
| FRONTEND `template-agreement.html` | 7 pasal | Pasal 1–7 |
| REACT-APP `PPAgreementDetailPage.jsx` | 12 pasal | Menambahkan: Force Majeure, Penyelesaian Perselisihan, Ketentuan Hukum, Perubahan Klausul, Pernyataan Kesadaran |

> ⚠ **Tidak ada persistence:** Signature data (base64 PNG), TTD metadata, dan approval status semuanya hanya hidup di browser memory / localStorage. Tidak ada endpoint backend untuk menyimpan agreement yang sudah ditandatangani.

---

## 5. Health & Safety

### Kondisi Saat Ini

Health & Safety tidak memiliki modul backend maupun form terpisah. Seluruh health declaration ditangani melalui **Pasal 5 Agreement** (Jaminan Data dan Tanggung Jawab Kesehatan Mandiri):

- Klien menyatakan data fisik, riwayat cedera, dan catatan medis adalah benar dan akurat
- Klien bertanggung jawab penuh atas keselamatan dirinya
- EFM dibebaskan dari tuntutan atas kondisi medis tersembunyi

Ini adalah **pendekatan indemnity clause**, bukan health screening yang terstruktur.

### REACT-APP — ppAssessmentsData.js

REACT-APP memiliki data dummy untuk assessment (health intake form) dengan field yang lebih terstruktur, tapi ini UI-only tanpa backend.

### Gap terhadap Target Arsitektur

Target mensyaratkan **Health & Safety Acknowledgement** sebagai langkah terpisah dalam alur: *Master Agreement + Program Module → **Health & Safety Acknowledgement** → Assignment*. Saat ini ini belum exist sebagai entitas terpisah di backend manapun.

---

## 6. Assignment

Assignment pelatih ke klien/order saat ini direpresentasikan sebagai satu field: `pic` (nama pelatih) atau `picId` (kode pelatih) di dalam data order. Tidak ada entitas Assignment yang terpisah.

| Layer | Implementasi Assignment |
|---|---|
| BACKEND `program-db.gs` | Field `picId` di PROGRAM_DB (menunjuk ke pelatih yang handle program tertentu). `PROFIL_PELATIH_PUBLIC` sheet untuk master data pelatih. |
| FRONTEND `pp-orders.html` | Field `pic` berisi nama pelatih langsung (string). Tidak ada Assignment ID. |
| REACT-APP | Field `pic` di ppOrdersData. Pelatih dipilih saat buat order. |

Tidak ada: Assignment ID, tanggal mulai assignment, status assignment, riwayat pergantian pelatih, atau multi-pelatih per klien.

---

## 7. Attendance

Tidak ditemukan file attendance/rekap absensi di `BACKEND/` maupun di `FRONTEND/`. Di REACT-APP ada halaman rekap absensi, tapi data-nya berasal dari dummy data, tidak ada backend endpoint.

### Yang Ada di REACT-APP (UI Only)

- Progress sesi (sesiDone/sesiTotal) ditampilkan di halaman order sebagai progress bar
- Rekap Absensi dimulai setelah Sesi Pertama berjalan (Langkah 12 dari flow agreement)
- Tidak ada schema sheet ATTENDANCE di Google Sheets

### Gap

Tanpa attendance backend, tidak bisa: mencatat sesi yang sudah jalan, memverifikasi jumlah sesi tersisa, trigger hangus otomatis saat validity period habis (yang disebut di Pasal 2).

---

## 8. Business Rules

### Business Rules yang Terimplementasi di Backend

- Filter program aktif: `status === 'aktif'` (PROGRAM_DB)
- Filter kategori aktif: `status === 'Aktif'` (KATEGORI_PROGRAM) — **case berbeda!**
- Program ratecard EFM vs program custom PIC: dipisah via `pakai_ratecard_efm` boolean
- Admin auth: token string comparison (`params.token === ADMIN_TOKEN`)
- Varian harga: replace-all strategy — saat save varian, semua baris lama dihapus dan diganti baru

### Business Rules di Kontrak (Belum Punya Enforcement Backend)

- Sesi hangus otomatis saat masa berlaku habis (Pasal 2) — tidak ada cron/scheduler
- Pembatalan min. 24 jam sebelum sesi (Pasal 3) — tidak ada validasi timestamp
- Sesi hangus jika pembatalan kurang dari 24 jam tanpa alasan darurat (Pasal 3)
- Payment final dan non-refundable (Pasal 4) — tidak ada payment state machine
- Larangan rekrut pelatih di luar EFM (Pasal 6) — tidak bisa dienforce sistem

### Bug Konsistensi

Di `program-db.gs`: PROGRAM_DB menggunakan `status === 'aktif'` (lowercase), sementara KATEGORI_PROGRAM menggunakan `status === 'Aktif'` (Title Case). Ini akan menyebabkan behavior berbeda jika status diisi tidak konsisten di Spreadsheet.

---

## 9. Status Enums

| Entitas | Status Values | Sumber |
|---|---|---|
| Program | `aktif` (lowercase) | PROGRAM_DB sheet, program-db.gs |
| Kategori Program | `Aktif` (Title Case) | KATEGORI_PROGRAM sheet, program-db.gs |
| Profil Pelatih | `Aktif` (Title Case) | PROFIL_PELATIH_PUBLIC sheet |
| Agreement TTD | `pending` `waiting-approval` `signed` `expired` | pp-documents.html, ppDocumentsData.js |
| Order | `active` `completed` `cancelled` | FRONTEND/pp-orders.html, ppOrdersData.js |
| Invoice | `paid` `pending` `overdue` | FRONTEND/pp-orders.html, ppInvoiceData.js |
| Lead | `new` `approach` `screening` `invoicing` `closing` `convert` `closed-won` `closed-lost` | ppLeadsData.js (REACT-APP) |

> ⚠ **Inkonsistensi case:** program DB pakai `aktif`, kategori & pelatih pakai `Aktif`. Perlu diseragamkan sebelum backend digunakan di production.

---

## 10. Gap Analysis

### Target Alur Arsitektur Baru

```
Program Catalog (⚠partial) → Order (❌) → Master Agreement (❌) → Program Module (❌) 
→ H&S Acknowledgement (❌) → Assignment (❌) → Program Ready (❌) → Attendance (❌)
```

### Gap Cards

#### 🔴 CRITICAL — Tidak ada persistence layer untuk Order, Agreement, Invoice, Receipt

Semua data keuangan dan kontrak hanya hidup di browser sebagai JavaScript dummy data. Refresh halaman = data hilang. Tidak ada Google Sheets sheet untuk entitas-entitas ini.

#### 🔴 CRITICAL — Backend belum terhubung ke Spreadsheet nyata

`SS_ID = 'PASTE_SPREADSHEET_ID_DISINI'` — backend Program Catalog belum pernah dijalankan di lingkungan production. `setupSheets()` belum pernah dieksekusi.

#### 🔴 CRITICAL — Tidak ada Authentication & Authorization yang proper

Hanya ada satu string token (ADMIN_TOKEN) yang di-hardcode. Tidak ada user session, role management, atau multi-user auth. Siapapun yang tahu token bisa melakukan semua operasi write.

#### 🟡 HIGH — ID Format Mismatch antara FRONTEND dan REACT-APP

FRONTEND: `PP-8042`, `INV/EFM/PP/2026/0089`, `AGR-001`
REACT-APP: `PP-26-0001`, `INV-PP-26-0001`, `AGR-PP-26-0001`
Harus diseragamkan sebelum integrasi.

#### 🟡 HIGH — Tidak ada Health & Safety module terpisah

H&S hanya sebagai klausa kontrak (Pasal 5). Target arsitektur membutuhkan ini sebagai entitas terpisah dengan schema, status, dan flow sendiri.

#### 🟡 HIGH — Tidak ada Attendance backend

Tanpa attendance backend, tidak bisa: menghitung sesi tersisa, trigger hangus otomatis, atau audit rekap per periode.

#### 🔵 MEDIUM — Inkonsistensi status case (aktif vs Aktif)

PROGRAM_DB: lowercase `aktif`. KATEGORI_PROGRAM & PROFIL_PELATIH_PUBLIC: Title Case `Aktif`. Akan menyebabkan bug filter jika tidak diseragamkan.

#### 🔵 MEDIUM — Tidak ada Master Agreement + Program Module separation

Target arsitektur memisahkan Master Agreement (entity-level, berlaku untuk semua program klien) dari Program Module (per-program agreement). Saat ini agreement langsung tied ke satu order.

---

## 11. Active Aging Readiness

Tidak ditemukan referensi "Active Aging" di file manapun di repository. Tidak ada kategori program, schema health, atau konfigurasi spesifik untuk Active Aging.

### Kesiapan per Kebutuhan

| Kebutuhan | Status | Gap |
|---|---|---|
| Kategori "Active Aging" di KATEGORI_PROGRAM | ⚠️ Partial | Sheet ada, tapi belum ada entry (SS_ID belum terhubung) |
| Program katalog dengan kapasitas_min/max, durasi_menit, level_kelas | ⚠️ Partial | Kolom sudah ada di schema, tapi belum ada data Active Aging |
| Health Profile khusus lansia (riwayat penyakit, mobilitas, kontraindikasi) | ❌ Tidak ada | Perlu sheet/form Health Assessment baru dengan field spesifik Active Aging |
| H&S Acknowledgement sebagai entitas terpisah | ❌ Tidak ada | Lihat Gap Analysis Section 10 |
| Modified T&C untuk klien lansia | ⚠️ Partial | REACT-APP punya template pasal yang bisa dikustomisasi via localStorage, tapi belum ada preset "Active Aging" |
| Pelatih dengan sertifikat khusus Active Aging | ⚠️ Partial | Field `sertifikat` ada di PROFIL_PELATIH_PUBLIC, tapi belum ada filtering berdasarkan sertifikat saat assign |
| Session parameter: durasi pendek, intensitas rendah | ⚠️ Partial | Field `durasi_menit`, `level_kelas` sudah ada di PROGRAM_DB schema — perlu entry data saja |

### Rekomendasi Pilot Active Aging (Minimal Viable)

1. Hubungkan SS_ID ke Spreadsheet nyata dan jalankan `setupSheets()`
2. Buat entry Kategori "Active Aging" di KATEGORI_PROGRAM
3. Buat 2–3 program Active Aging di PROGRAM_DB dengan parameter sesuai (durasi pendek, level rendah, kapasitas kecil)
4. Tambahkan Health Assessment sheet baru dengan field spesifik lansia
5. Pilot bisa berjalan untuk tahap Program Catalog → pilih program, tapi alur Order → Agreement → Attendance masih akan manual/UI-only

---

## 12. Final Summary

### Scorecard

| Metrik | Nilai |
|---|---|
| Sheet belum ada | **7** (ORDER, INVOICE, RECEIPT, AGREEMENT, HEALTH_ASSESSMENT, ASSIGNMENT, ATTENDANCE) |
| Critical gaps | **3** |
| High gaps | **3** |
| Modul backend yang fungsional | **1** (Program Catalog) |

### Status per Node Target Arsitektur

| Node | Backend | REACT-APP UI | Prioritas |
|---|---|---|---|
| Program Catalog | ⚠️ Partial (belum live) | ✅ Ada | Selesaikan koneksi SS_ID |
| Order | ❌ Tidak Ada | ✅ Ada (dummy) | Prioritas tinggi |
| Master Agreement | ❌ Tidak Ada | ✅ Ada (dummy, 12 pasal) | Prioritas tinggi |
| Program Module | ❌ Tidak Ada | ❌ Tidak Ada | Desain baru |
| H&S Acknowledgement | ❌ Tidak Ada | ⚠️ Partial (Assessment form) | Kritis untuk Active Aging |
| Assignment | ❌ Tidak Ada | ⚠️ Partial (field pic saja) | Medium |
| Program Ready | ❌ Tidak Ada | ❌ Tidak Ada | Desain baru |
| Attendance | ❌ Tidak Ada | ⚠️ Partial (progress bar saja) | Prioritas tinggi |

### Kesimpulan

EFM saat ini memiliki **satu modul backend yang fungsional: Program Catalog** (via `program-db.gs`), tapi belum terhubung ke Spreadsheet nyata. Semua modul lain (Order, Agreement, Invoice, Receipt, Health, Assignment, Attendance) hanya exist sebagai UI dummy data di dua frontend terpisah yang belum terhubung satu sama lain.

Untuk pilot Active Aging, langkah minimal adalah: (1) hubungkan backend Program Catalog ke Spreadsheet, (2) tambahkan kategori & data program Active Aging, (3) desain Health Assessment schema baru. Alur penuh Order → Attendance membutuhkan pembangunan backend baru yang cukup substansial.

---

*READ-ONLY AUDIT — Tidak ada perubahan kode atau database yang dibuat.*  
*Berdasarkan implementasi aktual di repository per 18 September 2026.*  
*EFM V2 Architecture Planning — CV. Bugar Nusantara Jaya*
