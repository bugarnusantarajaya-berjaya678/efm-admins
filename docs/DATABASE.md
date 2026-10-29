# DATABASE — EFM V2

> Dokumen untuk keperluan migrasi ke Google Apps Script + Google Sheets.
> Klasifikasi tabel: [MASTER-BERSAMA] = dipakai lintas modul, [PP] / [B2B-EVENT] / [B2B-MGMT] = per modul.
> Bagian tidak pasti: [TIDAK PASTI]. Usulan: [USULAN].
> Terakhir diperbarui: Oktober 2026.

---

## 1. SUMBER DATA SAAT INI

| Sumber | Teknologi | Dipakai Untuk |
|---|---|---|
| PostgreSQL | Supabase managed DB | Data transaksi + master data |
| Supabase Auth | Identity provider | User login & session |
| Supabase Storage | File storage | Bukti bayar, foto sesi, PDF, aset |
| File JS di `src/data/` | Dummy data statis | UI frontend (belum terhubung backend nyata) |

**Catatan penting:** Skema database backend (migrations) hanya ada untuk modul PP.
B2B Management dan B2B Event belum punya migrasi database → datanya masih 100% dummy.

---

## 2. TABEL DATABASE (dari migrasi aktual)

### 2.1 [MASTER-BERSAMA] `id_sequences` — Generator Nomor Dokumen
| Kolom | Tipe | Keterangan |
|---|---|---|
| `doc_type` | TEXT | Tipe dokumen: INV, RCP, AGR, ATT, dll |
| `module` | TEXT | PP / B2B / EVENT |
| `year` | INTEGER | 2-digit tahun (26, 27, dst) |
| `last_seq` | INTEGER | Sequence terakhir yang dipakai |

**Primary Key:** `(doc_type, module, year)`
**Aturan:** Reset ke 0 setiap 1 Januari; digunakan untuk semua dokumen semua modul.

---

### 2.2 [MASTER-BERSAMA] `audit_events` — Log Audit
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID PK | ID unik event |
| `event_type` | TEXT | CREATE, UPDATE, STATUS_CHANGE, dll |
| `entity_type` | TEXT | Jenis entitas yang diubah |
| `entity_id` | TEXT | ID entitas |
| `actor_id` | UUID | User yang melakukan aksi |
| `metadata` | JSONB | Data detail event |
| `request_id` | UUID | ID request HTTP |
| `occurred_at` | TIMESTAMPTZ | Waktu kejadian |

---

### 2.3 [MASTER-BERSAMA] `pic_master` — Data Pelatih / Instruktur
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | TEXT PK | Format: `PIC-YY-xxxx` |
| `full_name` | TEXT | Nama lengkap |
| `email` | TEXT UNIQUE | Email |
| `phone` | TEXT | Nomor HP |
| `status` | TEXT | `active` / `inactive` / `suspended` |
| `pks_expiry_date` | DATE | Tanggal kadaluarsa PKS |

---

### 2.4 [MASTER-BERSAMA] `pic_contexts` — Konteks Pelatih per Modul
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID PK | [TIDAK PASTI] |
| `pic_id` | TEXT → `pic_master` | FK ke PIC |
| `module` | TEXT | `PP` / `B2B` / `EVENT` / `OPS` |
| `role` | TEXT | `trainer` / `coordinator` / `admin` |
| `cost_rate` | NUMERIC | Tarif cost per sesi (biaya EFM) |
| `charge_rate` | NUMERIC | Tarif charge ke klien per sesi |
| `effective_from` | DATE | Berlaku mulai |
| `effective_to` | DATE | Berlaku sampai (null = masih berlaku) |

---

### 2.5 [MASTER-BERSAMA] `programs` — Master Program Fitness
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID PK | — |
| `module` | TEXT | `PP` / `B2B` / `EVENT` |
| `name` | TEXT | Nama program |
| `is_active` | BOOLEAN | Status aktif |

---

### 2.6 [MASTER-BERSAMA] `offerings` — Offering dalam Program
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID PK | — |
| `program_id` | UUID → `programs` | FK ke program |
| `name` | TEXT | Nama offering |
| `is_active` | BOOLEAN | Status aktif |

---

### 2.7 [MASTER-BERSAMA] `packages` — Paket dalam Offering
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID PK | — |
| `offering_id` | UUID → `offerings` | FK ke offering |
| `name` | TEXT | Nama paket |
| `session_count` | INTEGER | Jumlah sesi |
| `is_active` | BOOLEAN | Status aktif |

**Paket PP standar:**
| Nama | Sesi | Harga |
|---|---|---|
| 4 Sesi - Starter | 4 | Rp 800.000 |
| 8 Sesi - Base | 8 | Rp 1.600.000 |
| 12 Sesi - Pro | 12 | Rp 2.400.000 |
| 24 Sesi - Elite | 24 | Rp 4.800.000 |

---

### 2.8 [MASTER-BERSAMA] `package_prices` — Harga Paket Historis
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID PK | — |
| `package_id` | UUID → `packages` | FK ke paket |
| `price` | NUMERIC | Harga |
| `effective_from` | DATE | Berlaku mulai |
| `effective_to` | DATE | Berlaku sampai (null = masih aktif) |

---

### 2.9 [PP] `leads_pp` — Lead Private Program
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | TEXT PK | Format: `LP-xxxx` (permanent, tanpa tahun) |
| `full_name` | TEXT | Nama prospek |
| `email` | TEXT | Email |
| `phone` | TEXT | Nomor HP |
| `source` | TEXT | Sumber lead |
| `status` | TEXT | `NEW`/`APPROACH`/`SCREENING`/`INVOICING`/`CLOSING`/`CONVERTED`/`CLOSED_LOST` |
| `notes` | TEXT | Catatan |

---

### 2.10 [PP] `clients_pp` — Klien Private Program
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | TEXT PK | Format: `KL-xxxx` |
| `lead_id` | TEXT → `leads_pp` | FK ke lead asal |
| `full_name` | TEXT | Nama lengkap |
| `email` | TEXT | Email |
| `phone` | TEXT | Nomor HP |
| `address` | TEXT | Alamat |
| `notes` | TEXT | Catatan |
| `status` | TEXT | `ACTIVE` / `INACTIVE` |

---

### 2.11 [PP] `orders_pp` — Order Private Program
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | TEXT PK | Format: `PP-YY-xxxx` |
| `client_id` | TEXT → `clients_pp` | FK ke klien |
| `lead_id` | TEXT | Referensi lead asal |
| `package_id` | UUID → `packages` | FK ke paket |
| `pic_id` | TEXT → `pic_master` | FK ke pelatih |
| `status` | TEXT | `DRAFT`/`PENDING_PAYMENT`/`ACTIVE`/`COMPLETED`/`CANCELLED` |
| `start_date` | DATE | Tanggal mulai |
| `urgency_flag` | TEXT | `NORMAL` / `URGENT` |
| `sessions_total` | INTEGER | Total sesi |
| `sessions_completed` | INTEGER | Sesi yang selesai |

---

### 2.12 [PP] `order_commercial_snapshots` — Snapshot Harga saat Order Dibuat
| Kolom | Tipe | Keterangan |
|---|---|---|
| `order_id` | TEXT PK → `orders_pp` | 1:1 dengan order |
| `package_name` | TEXT | Nama paket (snapshot) |
| `offering_name` | TEXT | Nama offering (snapshot) |
| `program_name` | TEXT | Nama program (snapshot) |
| `sessions_total` | INTEGER | Total sesi |
| `unit_price` | NUMERIC | Harga per sesi |
| `base_amount` | NUMERIC | Harga sebelum diskon |
| `discount_code` | TEXT | Kode diskon yang dipakai |
| `discount_amount` | NUMERIC | Nilai diskon |
| `final_amount` | NUMERIC | Harga akhir |

---

### 2.13 [PP] `invoices_pp` — Invoice PP
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | TEXT PK | Format: `INV-PP-YY-xxxx` |
| `order_id` | TEXT UNIQUE → `orders_pp` | 1:1 dengan order |
| `status` | TEXT | `DRAFT`/`SENT`/`PAID`/`OVERDUE`/`CANCELLED` |
| `issued_date` | DATE | Tanggal terbit |
| `due_date` | DATE | Jatuh tempo |
| `final_amount` | NUMERIC | Total tagihan |
| `notes` | TEXT | Catatan |
| `pdf_path` | TEXT | Path PDF di Supabase Storage |

---

### 2.14 [PP] `payments_pp` — Pembayaran
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID PK | — |
| `invoice_id` | TEXT → `invoices_pp` | FK ke invoice |
| `order_id` | TEXT → `orders_pp` | FK ke order |
| `amount` | NUMERIC | Jumlah bayar |
| `payment_method` | TEXT | Metode bayar |
| `payment_date` | DATE | Tanggal bayar |
| `status` | TEXT | `PENDING`/`CONFIRMED`/`REJECTED` |
| `reference_no` | TEXT | Nomor referensi transfer |
| `notes` | TEXT | Catatan |
| `confirmed_at` | TIMESTAMPTZ | Waktu konfirmasi |
| `confirmed_by` | UUID | User yang konfirmasi |
| `rejected_at` | TIMESTAMPTZ | Waktu penolakan |
| `rejected_by` | UUID | User yang menolak |
| `rejection_reason` | TEXT | Alasan penolakan |
| `proof_path` | TEXT | Path bukti bayar di Storage |
| `proof_uploaded_at` | TIMESTAMPTZ | Waktu upload bukti |

---

### 2.15 [PP] `receipts_pp` — Receipt / Kwitansi PP
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | TEXT PK | Format: `RCP-PP-YY-xxxx` |
| `payment_id` | TEXT UNIQUE → `payments_pp` | 1:1 dengan payment |
| `order_id` | TEXT → `orders_pp` | FK ke order |
| `issued_date` | DATE | Tanggal terbit |
| `amount` | NUMERIC | Jumlah |
| `notes` | TEXT | Catatan |
| `pdf_path` | TEXT | Path PDF di Storage |

---

### 2.16 [PP] `refunds_pp` — Refund PP
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | TEXT PK | Format: `REF-PP-YY-xxxx` |
| `payment_id` | TEXT UNIQUE → `payments_pp` | 1:1 dengan payment |
| `order_id` | TEXT → `orders_pp` | FK ke order |
| `amount` | NUMERIC | Jumlah refund |
| `reason` | TEXT | Alasan |
| `status` | TEXT | `PENDING`/`PROCESSED`/`REJECTED` |

---

### 2.17 [PP] `participants_pp` — Peserta / Data Fisik Klien
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | TEXT PK | Format: `PTR-PP-YY-xxxx` |
| `order_id` | TEXT UNIQUE → `orders_pp` | 1:1 dengan order |
| `client_id` | TEXT → `clients_pp` | FK ke klien |
| `full_name` | TEXT | Nama peserta |
| `date_of_birth` | DATE | Tanggal lahir |
| `gender` | TEXT | `M` / `F` / `O` |
| `initial_fitness_level` | TEXT | `BEGINNER`/`INTERMEDIATE`/`ADVANCED` |
| `fitness_goals` | TEXT | Target fitness |
| `health_notes` | TEXT | Catatan kesehatan |
| `trainer_notes` | TEXT | Catatan dari pelatih |
| `status` | TEXT | `ACTIVE` / `INACTIVE` |

---

### 2.18 [PP] `assessments_pp` — Fitness Screening / Assessment
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | TEXT PK | Format: `SCR-YY-xxxx` |
| `participant_id` | TEXT → `participants_pp` | FK ke peserta |
| `order_id` | TEXT → `orders_pp` | FK ke order |
| `assessor_id` | UUID | User yang asesmen |
| `assessment_date` | DATE | Tanggal |
| `assessment_type` | TEXT | `PRE` / `MID` / `POST` |
| `height_cm` | NUMERIC(5,2) | Tinggi badan |
| `weight_kg` | NUMERIC(5,2) | Berat badan |
| `body_fat_pct` | NUMERIC | % lemak tubuh |
| `fitness_score` | NUMERIC | Skor 0–100 |
| `status` | TEXT | `DRAFT`/`COMPLETED`/`ARCHIVED` |

---

### 2.19 [PP] `agreements_pp` — Surat Perjanjian
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | TEXT PK | Format: `AGR-PP-YY-xxxx` |
| `order_id` | TEXT UNIQUE → `orders_pp` | 1:1 dengan order |
| `status` | TEXT | `draft`/`issued`/`signed`/`voided` |
| `client_name` | TEXT | Nama klien (snapshot) |
| `client_email` | TEXT | Email klien (snapshot) |
| `package_name` | TEXT | Nama paket (snapshot) |
| `sessions_total` | INTEGER | Total sesi (snapshot) |
| `final_amount` | NUMERIC | Nilai kontrak (snapshot) |
| `content_body` | TEXT | Isi dokumen (dibekukan saat issued) |
| `pdf_path` | TEXT | Path PDF di Storage |
| `issued_at` | TIMESTAMPTZ | Waktu diterbitkan |
| `signed_at` | TIMESTAMPTZ | Waktu ditandatangani |
| `signed_by_name` | TEXT | Nama penandatangan |
| `signed_by_ip` | TEXT | IP penandatangan |
| `signed_by_ua` | TEXT | User-agent penandatangan |
| `signature_data` | TEXT | Data tanda tangan digital |
| `voided_at` | TIMESTAMPTZ | Waktu void |
| `voided_by` | UUID | User yang void |
| `void_reason` | TEXT | Alasan void |

---

### 2.20 [PP] `attendance_pp` — Absensi / Sesi
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | TEXT PK | Format: `ATT-PP-YY-xxxx` |
| `order_id` | TEXT → `orders_pp` | FK ke order |
| `session_number` | INTEGER | Nomor urut sesi (UNIQUE per order) |
| `session_date` | DATE | Tanggal sesi |
| `trainer_id` | TEXT nullable → `pic_master` | FK ke pelatih |
| `trainer_name` | TEXT | Nama pelatih (snapshot) |
| `notes` | TEXT | Catatan sesi |
| `client_present` | BOOLEAN | Klien hadir? |
| `trainer_present` | BOOLEAN | Pelatih hadir? |
| `photo_raw_path` | TEXT | Path foto original di Storage |
| `photo_path` | TEXT | Path foto processed di Storage |
| `photo_thumb_path` | TEXT | Path thumbnail di Storage |

---

### 2.21 [B2B-MGMT] Tabel B2B Management
**[TIDAK PASTI]** — Belum ada migration database. Data dummy di `b2bData.js` mengandung:
- `KLIEN_AKTIF`: nama klien, jenis (Apartment/Corporate), nilai kontrak/bulan, sisa hari kontrak, status bayar
- `EXPIRING_CONTRACTS`: klien hampir habis kontrak, tanggal habis, sisa hari
- `LEADS_PIPELINE_DASH`: lead + stage
- `REVENUE_CHART`: data revenue [TIDAK PASTI: field lengkapnya]
- `B2B_STATS`: kontrakAktif, revenueBulanIni, revenueGrowth, leadsPipeline, hotLeads, kontrakHabis

**[USULAN] Tabel yang dibutuhkan B2B Mgmt:**
- `leads_b2b` — leads korporat/apartemen
- `clients_b2b` — klien B2B (perusahaan/properti)
- `surveys_b2b` — hasil survei lokasi
- `orders_b2b` — kontrak recurring
- `invoices_b2b` — invoice bulanan
- `payments_b2b` — pembayaran invoice
- `receipts_b2b` — kwitansi

---

### 2.22 [B2B-EVENT] Tabel B2B Event
**[TIDAK PASTI]** — Belum ada migration database. Store file ada: `eventLeadsStore.js`, `eventKonsultasiStore.js`, `eventQuotationsStore.js`. Data dummy `eventData.js` mengandung:
- `eventDocuments`: id, klien, jenis (Kontrak/MOU/LOI), tglUpload, berlakuHingga, status (drafting/on_review/revision/signed), revisions[], googleDocsUrl

**[USULAN] Tabel yang dibutuhkan B2B Event:**
- `leads_event` — leads event
- `clients_event` — klien event
- `consultations_event` — konsultasi pre-event
- `quotations_event` — penawaran harga
- `orders_event` — order event
- `invoices_event` — invoice event
- `payments_event` — pembayaran
- `receipts_event` — kwitansi
- `attendance_event` — absensi kelas event

---

## 3. RELASI ANTAR TABEL

```
leads_pp (LP-xxxx)
  └── clients_pp (KL-xxxx)
        └── orders_pp (PP-YY-xxxx)
              ├── order_commercial_snapshots (1:1)
              ├── participants_pp (PTR-PP-YY-xxxx, 1:1)
              │     └── assessments_pp (SCR-YY-xxxx, banyak)
              ├── invoices_pp (INV-PP-YY-xxxx, 1:1)
              │     └── payments_pp (UUID, bisa banyak)
              │           ├── receipts_pp (RCP-PP-YY-xxxx, 1:1)
              │           └── refunds_pp (REF-PP-YY-xxxx, 1:1)
              ├── agreements_pp (AGR-PP-YY-xxxx, 1:1)
              └── attendance_pp (ATT-PP-YY-xxxx, banyak)

pic_master (PIC-YY-xxxx)   ← dipakai oleh PP, B2B, Event
  └── pic_contexts (banyak — satu per modul/periode)

programs → offerings → packages → package_prices   ← dipakai oleh PP, B2B, Event
id_sequences   ← dipakai oleh semua modul
audit_events   ← mencatat semua aksi semua modul
```

---

## 4. FORMAT ID DOKUMEN

| Dokumen | Format | Contoh | Reset? |
|---|---|---|---|
| Lead PP | `LP-xxxx` | `LP-0001` | **Tidak pernah reset** |
| Lead B2B | `LB-xxxx` | `LB-0001` | **Tidak pernah reset** |
| Lead Event | `LE-xxxx` | `LE-0001` | **Tidak pernah reset** |
| Klien PP | `KL-xxxx` | `KL-0001` | [TIDAK PASTI] |
| PIC/Pelatih | `PIC-YY-xxxx` | `PIC-26-0001` | Ya, per tahun |
| Screening | `SCR-YY-xxxx` | `SCR-26-0001` | Ya, per tahun |
| Survei B2B | `SVY-YY-xxxx` | `SVY-26-0001` | Ya, per tahun |
| Konsultasi Event | `KNS-YY-xxxx` | `KNS-26-0001` | Ya, per tahun |
| Peserta PP | `PTR-PP-YY-xxxx` | `PTR-PP-26-0001` | Ya, per tahun |
| Order PP | `PP-YY-xxxx` | `PP-26-0001` | Ya, per tahun |
| Order B2B | `B2B-YY-xxxx` | `B2B-26-0001` | Ya, per tahun |
| Order Event | `EV-YY-xxxx` | `EV-26-0001` | Ya, per tahun |
| Invoice PP | `INV-PP-YY-xxxx` | `INV-PP-26-0001` | Ya, per tahun |
| Invoice B2B | `INV-B2B-YY-xxxx` | `INV-B2B-26-0001` | Ya, per tahun |
| Invoice Event | `INV-EV-YY-xxxx` | `INV-EV-26-0001` | Ya, per tahun |
| Receipt PP | `RCP-PP-YY-xxxx` | `RCP-PP-26-0001` | Ya, per tahun |
| Receipt B2B | `RCP-B2B-YY-xxxx` | `RCP-B2B-26-0001` | Ya, per tahun |
| Receipt Event | `RCP-EV-YY-xxxx` | `RCP-EV-26-0001` | Ya, per tahun |
| Refund PP | `REF-PP-YY-xxxx` | `REF-PP-26-0001` | Ya, per tahun |
| Agreement PP | `AGR-PP-YY-xxxx` | `AGR-PP-26-0001` | Ya, per tahun |
| LOI B2B | `LOI-EFM-B2B-YY-xxxx` | `LOI-EFM-B2B-26-0001` | Ya, per tahun |
| LOI Event | `LOI-EFM-EVENT-YY-xxxx` | `LOI-EFM-EVENT-26-0001` | Ya, per tahun |
| Absensi PP | `ATT-PP-YY-xxxx` | `ATT-PP-26-0001` | Ya, per tahun |

---

## 5. DATA YANG DIPAKAI LINTAS MODUL

| Data | Tabel / Sheet | Dipakai oleh |
|---|---|---|
| Data pelatih / instruktur | `pic_master`, `pic_contexts` | PP, B2B, Event, OPS |
| Program, offering, paket, harga | `programs`, `offerings`, `packages`, `package_prices` | PP, B2B, Event |
| Generator nomor dokumen | `id_sequences` | PP, B2B, Event — semua tipe dokumen |
| Audit log | `audit_events` | Semua modul |
| User & role | Supabase Auth | Semua modul |

---

## 6. [USULAN] STRUKTUR GOOGLE SHEETS UNTUK MIGRASI

### Spreadsheet: `EFM-MASTER`
Berisi semua data yang dipakai lintas modul:

| Sheet | Isi | Dari Tabel |
|---|---|---|
| `Config` | URL spreadsheet modul, pengaturan sistem, jam operasional | (baru) |
| `Users` | Daftar user dan role | Supabase Auth |
| `ID_Sequences` | Nomor dokumen terakhir per (doc_type, module, year) | `id_sequences` |
| `PIC_Master` | Data pelatih: ID, nama, email, HP, status, PKS | `pic_master` |
| `PIC_Contexts` | Konteks pelatih per modul: tarif, periode | `pic_contexts` |
| `Programs` | Master program | `programs` |
| `Offerings` | Offering per program | `offerings` |
| `Packages` | Paket per offering | `packages` |
| `Package_Prices` | Harga paket historis | `package_prices` |
| `Audit_Log` | Log semua aktivitas | `audit_events` |

### Spreadsheet: `EFM-PP`
| Sheet | Isi | Dari Tabel |
|---|---|---|
| `Leads_PP` | Pipeline lead PP | `leads_pp` |
| `Clients_PP` | Klien aktif PP | `clients_pp` |
| `Orders_PP` | Order/program aktif | `orders_pp` |
| `Order_Snapshots` | Snapshot harga saat order | `order_commercial_snapshots` |
| `Invoices_PP` | Invoice + status | `invoices_pp` |
| `Payments_PP` | Pembayaran + konfirmasi | `payments_pp` |
| `Receipts_PP` | Kwitansi | `receipts_pp` |
| `Refunds_PP` | Refund | `refunds_pp` |
| `Participants_PP` | Data fisik peserta | `participants_pp` |
| `Assessments_PP` | Fitness assessment | `assessments_pp` |
| `Agreements_PP` | Surat perjanjian | `agreements_pp` |
| `Attendance_PP` | Absensi sesi | `attendance_pp` |
| `Promos_PP` | Kode promo | `ppPromoData` |

### Spreadsheet: `EFM-B2B-EVENT`
| Sheet | Isi |
|---|---|
| `Leads_Event` | Pipeline lead event |
| `Clients_Event` | Klien event |
| `Consultations` | Konsultasi pre-event |
| `Quotations` | Penawaran harga |
| `Orders_Event` | Order event |
| `Invoices_Event` | Invoice event |
| `Payments_Event` | Pembayaran |
| `Receipts_Event` | Kwitansi |
| `Attendance_Event` | Absensi kelas event |

### Spreadsheet: `EFM-B2B-MGMT`
| Sheet | Isi |
|---|---|
| `Leads_B2B` | Pipeline lead korporat |
| `Clients_B2B` | Klien B2B (perusahaan/properti) |
| `Surveys` | Survei lokasi |
| `Orders_B2B` | Kontrak recurring |
| `Invoices_B2B` | Invoice bulanan |
| `Payments_B2B` | Pembayaran |
| `Receipts_B2B` | Kwitansi |
