# INVENTARIS SISTEM LAMA — EFM V2

> Dokumen untuk keperluan migrasi ke Google Apps Script.
> Data diambil dari kode aktual. Bagian tidak pasti: [TIDAK PASTI]. Usulan: [USULAN].
> Terakhir diperbarui: Oktober 2026.

---

## 1. STACK TEKNOLOGI

| Lapisan | Teknologi | Detail |
|---|---|---|
| Frontend | React 18 + Vite | Tailwind CSS v3, React Router v6 |
| Backend | Node.js 20 + Express 4 | ESM (`type: module`), 14 router |
| Database | PostgreSQL via Supabase | Library `pg`, skema 4 migration file |
| Auth | Supabase Auth + JWT HS256 | `audience: authenticated` |
| File Storage | Supabase Storage | 9 bucket (8 private + 1 public: `company-assets`) |
| Frontend hosting | Vercel | Branch: main |
| Backend hosting | Railway | nixpacks builder, Node 20 |
| Source control | GitHub | Repo tunggal: `bugarnusantarajaya-berjaya678/efm-admins` |

---

## 2. STRUKTUR FOLDER REPOSITORY

Hanya satu repo: `efm-admins`. Tidak ditemukan repo terpisah `efm-absensi` atau sejenisnya.

```
efm-admins/
├── REACT-APP/                    ← Frontend (kode aktif)
│   ├── src/
│   │   ├── App.jsx               ← Router utama (60+ route)
│   │   ├── components/           ← Komponen shared
│   │   ├── data/                 ← Dummy data statis (28+ file .js)
│   │   └── pages/
│   │       ├── auth/
│   │       ├── dashboard/
│   │       ├── pp/               ← Module PP (13+ halaman)
│   │       ├── b2b/              ← Module B2B Management (11 halaman)
│   │       ├── event/            ← Module B2B Event (16 halaman)
│   │       ├── ops/              ← Operasional (5 halaman)
│   │       ├── laporan/          ← Laporan (4 halaman)
│   │       ├── payment/
│   │       ├── contract/
│   │       ├── assignment/
│   │       └── settings/
├── backend/                      ← Backend Express (kode aktif)
│   ├── src/
│   │   ├── app.js                ← Registrasi semua route
│   │   ├── routes/               ← 14 file router
│   │   └── db/migrations/        ← 4 file SQL (skema PP penuh; B2B+Event: belum)
│   ├── railway.toml              ← Config Railway deploy
│   └── .nvmrc                    ← Node 20
├── FRONTEND/                     ← [TIDAK PASTI: versi lama atau backup?]
├── BACKEND/                      ← [TIDAK PASTI: versi lama atau backup?]
├── MOCKUPS/                      ← File desain/mockup UI
└── docs/                         ← Dokumentasi (folder ini)
```

---

## 3. MODUL DAN HALAMAN

### 3.1 Shared / Auth
| Halaman | Route | Keterangan |
|---|---|---|
| Login | `/login` | Email + password, JWT auth |
| Dashboard Admin | `/dashboard` | KPI global semua modul |
| Dashboard Owner | `/owner-dashboard` | View khusus owner |
| Settings | `/settings` | Pengaturan [TIDAK PASTI: detail fitur] |

---

### 3.2 Modul PP (Private Program)
**Alur bisnis:** Lead → Screening → Order → Program Berjalan → Invoice → Pembayaran → Receipt → Agreement

| Halaman | Route | Fitur Utama |
|---|---|---|
| PP Dashboard | `/pp/dashboard` | KPI PP, statistik |
| Leads List | `/pp/leads` | Pipeline lead, filter status |
| Lead Baru | `/pp/leads/new` | Form tambah lead |
| Lead Detail | `/pp/leads/:id` | Update data, ubah status, log aktivitas |
| Klien List | `/pp/klien` | Daftar klien aktif |
| Klien Detail | `/pp/klien/:id` | Detail klien, riwayat order |
| Screening List | `/pp/screening` | Daftar fitness assessment |
| Screening Detail | `/pp/screening/:id` | Isi data PRE/MID/POST assessment |
| Orders List | `/pp/orders` | Daftar order, filter status/paket/PIC |
| Order Baru | `/pp/orders/new` | Pilih klien, paket, pelatih, tanggal |
| Order Detail | `/pp/orders/:id` | Tab 1: Kontrak & Keuangan; Tab 2: Dokumen; Tab 3: Operasional |
| Rekap Absensi | `/pp/orders/rekap/:orderId` | Tabel sesi, kehadiran klien & pelatih |
| Program DB | `/pp/program-db` | Daftar program/paket |
| Jenis Program | `/pp/program-db/jenis` | Kelola jenis program |
| Program Form | `/pp/program-db/new` | Tambah/edit program |
| Dokumen PP | `/pp/documents` | Dokumen terkait order PP |
| Invoice List | `/pp/invoice` | Daftar invoice PP, filter status |
| Invoice Detail | `/pp/invoice/:id` | Detail, edit, konfirmasi bayar, buat receipt, download PDF |
| Receipt List | `/pp/receipt` | Daftar receipt PP |
| Receipt Detail | `/pp/receipt/:id` | Detail receipt, kirim WhatsApp |
| Promo List | `/pp/promo` | Kelola kode promo/diskon |
| Promo Baru/Edit | `/pp/promo/new`, `/pp/promo/:kode` | Form kode promo |
| Agreement Detail | `/pp/agreement/:id` | Detail perjanjian, tanda tangan digital |

**Detail fitur kritis PP:**
- **Order Detail Tab 1**: info paket, harga, status bayar, upload bukti bayar, konfirmasi/tolak bayar, link ke invoice/receipt/agreement
- **Order Detail Tab 2**: surat perjanjian dengan lifecycle (draft→issued→signed→voided), freeze konten saat issued
- **Order Detail Tab 3**: jadwal sesi, absensi pelatih & klien per sesi, upload foto sesi
- **Invoice**: mode edit (tanggal, jatuh tempo, catatan, syarat & ketentuan), kode promo, kalkulasi otomatis, PDF generation
- **Agreement**: tanda tangan digital, content immutable setelah issued, void hanya sebelum signed

---

### 3.3 Modul B2B Management
**Alur bisnis:** Lead → Survei Lokasi → Quotation → Order (kontrak recurring) → Invoice bulanan → Pembayaran
**⚠️ Mengapa berat:** Kontrak recurring (bulanan/tahunan) dengan invoice berulang otomatis; manajemen banyak klien korporat & apartemen sekaligus; kalender jadwal pelatih kompleks; track sisaHari kontrak + notifikasi expiring. Belum ada skema database backend untuk B2B.

| Halaman | Route | Fitur Utama |
|---|---|---|
| B2B Dashboard | `/b2b/dashboard` | KPI B2B, klien aktif, kontrak hampir habis, pipeline |
| B2B Leads | `/b2b/leads` | Pipeline lead korporat |
| Survei List | `/b2b/survei` | Daftar survei lokasi |
| Survei Baru/Detail | `/b2b/survei/new`, `/b2b/survei/:id` | Form + detail survei |
| Orders List | `/b2b/orders` | Daftar kontrak B2B aktif |
| Order Baru | `/b2b/orders/new` | Buat kontrak baru |
| Order Detail | `/b2b/orders/:id` | Detail kontrak, jadwal, invoice |
| Kalender | `/b2b/kalender` | Kalender jadwal pelatih semua klien B2B |
| Invoice List | `/b2b/invoice` | Daftar invoice B2B |
| Receipt List | `/b2b/receipt` | Daftar receipt B2B |
| Dokumen B2B | [TIDAK PASTI] | Dokumen B2B (ada halaman `B2BDocumentsPage.jsx`) |

---

### 3.4 Modul B2B Event
**Alur bisnis:** Lead → Konsultasi → Quotation → Order → Invoice → Kelas Berjalan → Absensi Pelatih → Rekap
**⚠️ Mengapa berat:** Event satu kali atau periodik dengan banyak variabel (venue, peserta, jenis kelas, jumlah sesi); alur multi-step dari leads sampai rekap; quotation dengan banyak item; belum ada skema database backend untuk Event.

| Halaman | Route | Fitur Utama |
|---|---|---|
| Event Dashboard | `/event/dashboard` | KPI event |
| Event Leads | `/event/leads` | Pipeline lead event |
| Lead Baru/Detail | `/event/leads/new`, `/event/leads/:id` | Form + detail lead |
| Konsultasi List | `/event/konsultasi` | Daftar sesi konsultasi |
| Konsultasi Baru/Detail | `/event/konsultasi/new`, `/event/konsultasi/:id` | Form + detail |
| Quotation List | `/event/quotation` | Daftar penawaran harga |
| Quotation Baru/Detail | `/event/quotation/new`, `/event/quotation/:id` | Form + detail |
| Orders List | `/event/orders` | Daftar order event |
| Order Baru | `/event/orders/new` | Form order event |
| Order Detail | `/event/orders/:id` | Detail order, jadwal kelas |
| Kalender | `/event/kalender` | Kalender event |
| Invoice List | `/event/invoice` | Daftar invoice event |
| Receipt List | `/event/receipt` | Daftar receipt event |
| Dokumen Event | [TIDAK PASTI] | Dokumen event (ada `EventDocumentsPage.jsx`) |

---

### 3.5 Modul Operasional (OPS) — Data Bersama
| Halaman | Route | Fitur Utama |
|---|---|---|
| Pelatih List | `/ops/pelatih` | Daftar PIC/pelatih semua modul |
| Pelatih Detail | `/ops/pelatih/:id` | Profil, konteks modul, tarif cost/charge |
| Kontrak Pelatih | `/ops/pelatih/kontrak` | Manajemen PKS, tanggal kadaluarsa |
| Mitra | `/ops/mitra` | [TIDAK PASTI: detail fitur] |
| Assets | `/ops/assets` | [TIDAK PASTI: detail fitur] |

### 3.6 Laporan
| Halaman | Route |
|---|---|
| Laporan Revenue | `/laporan/revenue` |
| Laporan Penjualan | `/laporan/penjualan` |
| Laporan Laba | `/laporan/laba` |
| Laporan Export | `/laporan/export` |

---

## 4. API ENDPOINTS BACKEND

**Base URL:** `https://[railway-host]/api/v1`
**Auth:** semua endpoint kecuali `/health` wajib `Authorization: Bearer <JWT>`
**Catatan:** Semua endpoint yang ada hanya untuk modul PP. B2B dan Event belum punya backend.

### PIC / Pelatih
| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/api/v1/pics` | query: `status`, `module` | Array PIC |
| POST | `/api/v1/pics` | `full_name, email, phone, status, pks_expiry_date` | PIC baru |
| GET | `/api/v1/pics/:id` | — | Detail PIC |
| PATCH | `/api/v1/pics/:id` | Fields yang diubah | PIC updated |
| POST | `/api/v1/pics/:id/contexts` | `module, role, cost_rate, charge_rate, effective_from, effective_to` | Context baru |

### Audit Log
| Method | Path | Output |
|---|---|---|
| GET | `/api/v1/audit/entity/:entityType/:entityId` | Array audit events |
| GET | `/api/v1/audit/request/:requestId` | Array audit events |

### Catalog (Program/Paket)
| Method | Path | Output |
|---|---|---|
| GET | `/catalog/programs` | Array program |
| GET | `/catalog/programs/:id` | Detail program |
| GET | `/catalog/offerings` | Array offering |
| GET | `/catalog/packages` | Array paket |
| GET | `/catalog/packages/:id` | Detail + harga aktif |

### Leads PP
| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/leads` | `status, search` | Array leads |
| POST | `/leads` | `full_name, email, phone, source, notes` | Lead baru `LP-xxxx` |
| GET | `/leads/:id` | — | Detail lead |
| PATCH | `/leads/:id` | Fields yang diubah | Updated |
| POST | `/leads/:id/convert` | Data klien | Convert → klien baru |

### Clients PP
| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/clients` | `status, search` | Array klien |
| POST | `/clients` | `lead_id, full_name, email, phone, address` | Klien baru `KL-xxxx` |
| GET | `/clients/:id` | — | Detail klien |
| PATCH | `/clients/:id` | Fields yang diubah | Updated |

### Orders PP
| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/orders` | `status, search` | Array order |
| POST | `/orders` | `client_id, lead_id, package_id, pic_id, start_date, urgency_flag` | Order baru `PP-YY-xxxx` |
| GET | `/orders/:id` | — | Detail order |
| POST | `/orders/:id/status` | `status, reason` | Status updated |
| GET | `/orders/:id/readiness` | — | Cek syarat aktivasi |

### Invoices PP
| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/invoices` | `status, order_id` | Array invoice |
| POST | `/invoices` | `order_id, issued_date, due_date, notes` | Invoice baru `INV-PP-YY-xxxx` |
| GET | `/invoices/:id` | — | Detail invoice |
| POST | `/invoices/:id/send` | — | Status → SENT |
| POST | `/invoices/:id/cancel` | `reason` | Status → CANCELLED |
| POST | `/invoices/overdue-check` | — | Batch update overdue |
| POST | `/invoices/:id/pdf` | — | Generate + simpan PDF |

### Payments PP
| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/payments` | `status, invoice_id` | Array payment |
| POST | `/payments` | `invoice_id, order_id, amount, payment_method, payment_date, reference_no` | Payment baru |
| GET | `/invoices/:id/payments` | — | Payments per invoice |
| POST | `/payments/:id/confirm` | `notes` | Status → CONFIRMED |
| POST | `/payments/:id/reject` | `rejection_reason` | Status → REJECTED |
| POST | `/payments/:id/proof` | multipart: file | Upload + simpan bukti bayar |

### Receipts PP
| Method | Path | Output |
|---|---|---|
| GET | `/receipts/:id` | Detail receipt |
| GET | `/orders/:id/receipts` | Receipts per order |
| GET | `/payments/:id/receipt` | Receipt per payment |
| POST | `/receipts/:id/pdf` | Generate + simpan PDF |

### Refunds PP
| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/refunds` | `status, order_id` | Array refund |
| POST | `/refunds` | `payment_id, order_id, amount, reason` | Refund baru `REF-PP-YY-xxxx` |
| GET | `/orders/:id/refunds` | — | Refunds per order |
| POST | `/refunds/:id/process` | `notes` | Status → PROCESSED |
| POST | `/refunds/:id/reject` | `reason` | Status → REJECTED |

### Participants PP
| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/participants` | — | Array participant |
| POST | `/participants` | `order_id, client_id, full_name, date_of_birth, gender, initial_fitness_level, fitness_goals, health_notes` | Participant baru `PTR-PP-YY-xxxx` |
| GET | `/orders/:id/participant` | — | Participant per order |
| GET | `/clients/:id/participants` | — | Participants per klien |
| PATCH | `/participants/:id` | Fields | Updated |

### Assessments PP (Screening)
| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/assessments` | — | Array assessment |
| POST | `/assessments` | `participant_id, order_id, assessor_id, assessment_date, assessment_type, height_cm, weight_kg, body_fat_pct, fitness_score` | Assessment baru `SCR-YY-xxxx` |
| GET | `/participants/:id/assessments` | — | Per participant |
| GET | `/orders/:id/assessments` | — | Per order |
| PATCH | `/assessments/:id` | Fields | Updated |

### Agreements PP
| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/agreements` | `order_id, status` | Array agreement |
| GET | `/agreements/:id` | — | Detail |
| GET | `/orders/:orderId/agreement` | — | Agreement per order |
| POST | `/agreements` | `order_id, client_name, client_email, package_name, sessions_total, final_amount, content_body` | Baru `AGR-PP-YY-xxxx` |
| PATCH | `/agreements/:id` | `content_body` (hanya saat draft) | Updated |
| POST | `/agreements/:id/issue` | — | draft → issued, konten dibekukan |
| POST | `/agreements/:id/sign` | `signed_by_name, signature_data` | issued → signed |
| POST | `/agreements/:id/void` | `void_reason` | signed → void: **DIBLOKIR 403** |

### Attendance PP (Absensi)
| Method | Path | Input | Output |
|---|---|---|---|
| GET | `/orders/:id/attendance` | — | Array sesi |
| GET | `/attendance/:id` | — | Detail sesi |
| POST | `/orders/:id/attendance` | `session_date, trainer_id, notes, client_present, trainer_present` | Sesi baru `ATT-PP-YY-xxxx` |
| PATCH | `/attendance/:id` | Fields | Updated |
| POST | `/attendance/:id/photo` | multipart: file | Upload foto sesi |

### Health Check
| Method | Path | Auth | Output |
|---|---|---|---|
| GET | `/health` | Tidak perlu | `{"status":"ok"}` |

---

## 5. AUTENTIKASI & ROLE

| Role | Deskripsi |
|---|---|
| Admin | Akses penuh semua modul |
| Finance | Invoice, receipt, pembayaran |
| Operations | Jadwal, absensi, PIC |
| PP | Modul Private Program |
| Coach | Jadwal sendiri, absensi sesi |
| B2B | Modul B2B Management |
| Event | Modul B2B Event |

**Mekanisme:** Supabase Auth → JWT HS256 → middleware `requireAuth` di semua endpoint PP.
[TIDAK PASTI: implementasi role-based access control di level code — sudah dipakai atau hanya rencana?]

---

## 6. VARIABEL ENVIRONMENT (nama saja, tanpa nilai)

### Backend
```
DATABASE_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
PORT
NODE_ENV
```

### Frontend (REACT-APP)
```
VITE_API_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```
[TIDAK PASTI: nama env var frontend aktual — perlu cek `.env.example`]

---

## 7. INTEGRASI EKSTERNAL

| Integrasi | Fungsi | Status |
|---|---|---|
| Supabase | Auth, PostgreSQL, Storage file | Aktif di backend |
| Vercel | Hosting frontend | Aktif |
| Railway | Hosting backend | Dikonfigurasi [TIDAK PASTI: sudah deployed?] |
| GitHub | Source control, CI/CD | Aktif |
| WhatsApp | Kirim receipt ke klien | [TIDAK PASTI: integrasi langsung atau link manual?] |
| Google Drive | Simpan dokumen event | [TIDAK PASTI: dipakai di data dummy event, belum jelas backend-nya] |

---

## 8. FILE DUMMY DATA (Frontend — kode UI)

| File | Isi | Modul |
|---|---|---|
| `ppOrdersData.js` | Order: id, klien, PIC, paket, harga, status | PP |
| `ppLeadsData.js` | Lead: id, nama, HP, sumber, status pipeline | PP |
| `ppInvoiceData.js` | Invoice: kalkulasi, diskon, promo, total | PP |
| `ppReceiptData.js` | Receipt: nomor, tanggal, metode, WhatsApp status | PP |
| `ppKlienData.js` | Data klien aktif | PP |
| `ppAssessmentsData.js` | Fitness assessment PRE/MID/POST | PP |
| `ppDocumentsData.js` | Dokumen order | PP |
| `ppAbsensiData.js` | Absensi sesi | PP |
| `ppProgramDBData.js` | Database program | PP |
| `ppPromoData.js` | Kode promo | PP |
| `ppLeadsStore.js` | Store lead + mapping OrderID→LeadID | PP |
| `ppOrdersStore.js` | Store order | PP |
| `ppInvoiceStore.js` | Store invoice | PP |
| `ppReceiptStore.js` | Store receipt | PP |
| `ppKlienStore.js` | Store klien | PP |
| `ppAssessmentsStore.js` | Store assessment | PP |
| `ppDocumentsStore.js` | Store dokumen | PP |
| `ppProgramStore.js` | Store program | PP |
| `ppPromoStore.js` | Store promo | PP |
| `ppJenisStore.js` | Store jenis program | PP |
| `b2bData.js` | Stats, klien aktif, expiring, leads, revenue | B2B |
| `eventData.js` | Dokumen event, status Google Drive | Event |
| `eventLeadsStore.js` | Store lead event | Event |
| `eventKonsultasiStore.js` | Store konsultasi event | Event |
| `eventQuotationsStore.js` | Store quotation event | Event |
| `opsData.js` | Data PIC/pelatih | OPS |
| `dashboardData.js` | Data dashboard global | Shared |
| `attendanceData.js` | Data absensi lintas modul | Shared |
