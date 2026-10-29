# RENCANA MIGRASI KE GOOGLE APPS SCRIPT

> Seluruh isi dokumen ini adalah [USULAN] kecuali yang disebutkan sebagai fakta.
> Terakhir diperbarui: Oktober 2026.

---

## 1. ARSITEKTUR TARGET

### Empat Project Utama

```
EFM-MASTER (Spreadsheet saja, bukan project Apps Script)
  └── Sheets: Config, Users, ID_Sequences, PIC_Master, PIC_Contexts,
              Programs, Offerings, Packages, Package_Prices, Audit_Log

EFM-PP (Apps Script project + Spreadsheet)
  ├── Project Apps Script: logika bisnis PP + UI HtmlService
  ├── Spreadsheet: Leads_PP, Clients_PP, Orders_PP, Invoices_PP,
  │               Payments_PP, Receipts_PP, Refunds_PP, Participants_PP,
  │               Assessments_PP, Agreements_PP, Attendance_PP, Promos_PP
  └── Google Drive folder: PDF invoice, receipt, agreement PP

EFM-B2B-EVENT (Apps Script project + Spreadsheet)
  ├── Project Apps Script: logika bisnis B2B Event + UI HtmlService
  ├── Spreadsheet: Leads_Event, Clients_Event, Consultations,
  │               Quotations, Orders_Event, Invoices_Event,
  │               Payments_Event, Receipts_Event, Attendance_Event
  └── Google Drive folder: dokumen event (Kontrak, MOU, LOI)

EFM-B2B-MGMT (Apps Script project + Spreadsheet)
  ├── Project Apps Script: logika bisnis B2B Mgmt + UI HtmlService
  ├── Spreadsheet: Leads_B2B, Clients_B2B, Surveys, Orders_B2B,
  │               Invoices_B2B, Payments_B2B, Receipts_B2B
  └── Google Drive folder: dokumen B2B
```

### Cara Akses Data Bersama
- Setiap project Apps Script membaca/menulis ke EFM-MASTER via `SpreadsheetApp.openById(MASTER_SPREADSHEET_ID)`
- `MASTER_SPREADSHEET_ID` disimpan sebagai Script Property di setiap project (bukan hardcode)
- Tidak ada API endpoint antar project — semua akses melalui Google Sheets API (SpreadsheetApp)

---

## 2. DAFTAR FILE .GS DAN .HTML PER PROJECT

### 2.1 EFM-PP (contoh — paling lengkap, dijadikan template untuk project lain)

**File konfigurasi & utilitas:**
| File | Tanggung Jawab |
|---|---|
| `Config.gs` | ID spreadsheet (MASTER + PP), nama sheet, konstanta global |
| `Utils.gs` | Format tanggal, format Rupiah, generate ID dokumen, validasi |
| `Auth.gs` | Cek session user, verifikasi role, redirect jika tidak punya akses |
| `AuditLog.gs` | Tulis ke sheet Audit_Log di EFM-MASTER |

**File logika bisnis (layer data):**
| File | Tanggung Jawab |
|---|---|
| `LeadService.gs` | CRUD leads, ubah status pipeline |
| `ClientService.gs` | CRUD klien |
| `OrderService.gs` | CRUD order, ubah status, readiness check |
| `InvoiceService.gs` | CRUD invoice, kalkulasi, generate PDF, overdue check |
| `PaymentService.gs` | CRUD payment, konfirmasi, tolak |
| `ReceiptService.gs` | Buat receipt, generate PDF |
| `RefundService.gs` | CRUD refund, proses, tolak |
| `AssessmentService.gs` | CRUD fitness assessment |
| `AgreementService.gs` | CRUD agreement, issue, sign, void, immutability |
| `AttendanceService.gs` | CRUD sesi/absensi |
| `PromoService.gs` | CRUD kode promo, validasi promo |
| `MasterService.gs` | Baca data dari EFM-MASTER: PIC, paket, program |
| `IdGenerator.gs` | Generate nomor dokumen dari sheet ID_Sequences |

**File handler (layer routing/controller):**
| File | Tanggung Jawab |
|---|---|
| `Code.gs` | `doGet()` — entry point, routing halaman |
| `ApiHandler.gs` | `doPost()` — handle form submit, aksi, API call dari UI |

**File template HTML:**
| File | Halaman |
|---|---|
| `Index.html` | Layout utama + sidebar |
| `Sidebar.html` | Komponen sidebar (include di Index.html) |
| `Dashboard.html` | Dashboard PP |
| `Leads.html` | Daftar leads + filter |
| `LeadDetail.html` | Detail lead |
| `Clients.html` | Daftar klien |
| `ClientDetail.html` | Detail klien |
| `Orders.html` | Daftar order |
| `OrderNew.html` | Form order baru |
| `OrderDetail.html` | Detail order (3 tab) |
| `Screening.html` | Daftar + detail assessment |
| `Invoice.html` | Daftar invoice |
| `InvoiceDetail.html` | Detail invoice + edit mode |
| `Receipt.html` | Daftar receipt |
| `ReceiptDetail.html` | Detail receipt |
| `Promo.html` | Daftar + form promo |
| `Agreement.html` | Detail agreement |
| `Styles.html` | CSS global (include di setiap halaman) |
| `Scripts.html` | JS shared (include di setiap halaman) |

---

### 2.2 EFM-B2B-EVENT

**File .gs:**
| File | Tanggung Jawab |
|---|---|
| `Config.gs` | ID spreadsheet, konstanta |
| `Utils.gs` | (sama dengan PP, diduplikat) |
| `Auth.gs` | (sama dengan PP, diduplikat) |
| `AuditLog.gs` | (sama dengan PP, diduplikat) |
| `LeadService.gs` | CRUD leads event |
| `ConsultationService.gs` | CRUD konsultasi pre-event |
| `QuotationService.gs` | CRUD quotation + item harga |
| `OrderService.gs` | CRUD order event |
| `InvoiceService.gs` | CRUD invoice event |
| `PaymentService.gs` | CRUD payment |
| `ReceiptService.gs` | Buat receipt |
| `AttendanceService.gs` | Absensi kelas event |
| `DocumentService.gs` | Manajemen dokumen di Google Drive |
| `MasterService.gs` | Baca data dari EFM-MASTER |
| `IdGenerator.gs` | (sama dengan PP) |
| `Code.gs` | Entry point + routing |
| `ApiHandler.gs` | Handle form submit + aksi |

**File HTML:** Dashboard, Leads, LeadDetail, Konsultasi, KonsultasiDetail, Quotation, QuotationDetail, Orders, OrderDetail, Kalender, Invoice, Receipt, Dokumen, + Sidebar/Styles/Scripts.

---

### 2.3 EFM-B2B-MGMT

**File .gs:**
| File | Tanggung Jawab |
|---|---|
| `Config.gs` | ID spreadsheet, konstanta |
| `Utils.gs` | (diduplikat) |
| `Auth.gs` | (diduplikat) |
| `AuditLog.gs` | (diduplikat) |
| `LeadService.gs` | CRUD leads korporat |
| `SurveyService.gs` | CRUD survei lokasi |
| `ClientService.gs` | CRUD klien B2B (perusahaan/properti) |
| `OrderService.gs` | CRUD kontrak recurring |
| `InvoiceService.gs` | Invoice bulanan, auto-generate |
| `PaymentService.gs` | CRUD payment |
| `ReceiptService.gs` | Buat receipt |
| `ContractRenewalService.gs` | Notifikasi kontrak hampir habis |
| `MasterService.gs` | Baca data dari EFM-MASTER |
| `IdGenerator.gs` | (diduplikat) |
| `Code.gs` | Entry point + routing |
| `ApiHandler.gs` | Handle form submit + aksi |

**File HTML:** Dashboard, Leads, Survei, Clients, Orders, OrderDetail, Kalender, Invoice, Receipt, + Sidebar/Styles/Scripts.

---

## 3. CARA BERBAGI KODE BERSAMA

### Opsi A — Apps Script Library
**Cara kerja:** Buat satu project "EFM-Shared" berisi `Utils.gs`, `Auth.gs`, `AuditLog.gs`, `IdGenerator.gs`. Publish sebagai Library. Project lain mengimpor dengan `Library ID`.

| Keuntungan | Kekurangan |
|---|---|
| Satu sumber kode untuk utilitas bersama | Eksekusi lebih lambat (overhead cross-project call) |
| Update di satu tempat, berlaku ke semua project | Library di Apps Script terbatas — tidak bisa share HTML |
| Tidak perlu duplikasi file yang sama | Debug lebih sulit (error di library sulit di-trace) |
| | Perlu mengelola versi Library secara manual |

### Opsi B — Duplikasi File Identik per Project (Recommended)
**Cara kerja:** Copy file `Utils.gs`, `Auth.gs`, `AuditLog.gs`, `IdGenerator.gs` ke setiap project. Tandai di baris pertama versi: `// EFM-Shared v1.2 — sync manually`.

| Keuntungan | Kekurangan |
|---|---|
| Tidak ada overhead, eksekusi cepat | Perlu update manual di 3+ project jika ada perubahan |
| Debug mudah — semua kode ada di satu project | Risiko drift (satu project lupa diupdate) |
| HTML juga bisa disertakan (Styles.html, Scripts.html) | |
| Tidak ada dependency antar project | |

**Rekomendasi:** Pakai **Opsi B** (duplikasi) untuk EFM dengan 3 project. Overhead Library tidak sebanding. Buat checklist update saat ada perubahan shared code.

---

## 4. LOGIN LINTAS MODUL TANPA LOGIN ULANG

### Opsi A — Google OAuth Shared (Recommended)
**Cara kerja:** Setiap project Apps Script men-deploy sebagai web app dengan "Execute as: Me" dan "Access: Anyone with Google account". User login Google sekali → semua web app bisa diakses tanpa login ulang (karena Google session sudah ada).

| Keuntungan | Kekurangan |
|---|---|
| Tidak ada implementasi custom session | Hanya bekerja jika user punya Google account |
| Tidak perlu token/cookie management | Tidak ada kontrol detail siapa yang bisa akses (semua Google user) |
| Zero login di setiap modul | Tidak bisa enforce role per modul tanpa logika tambahan |

### Opsi B — Role Check di Setiap Project
**Cara kerja:** Setiap project `Auth.gs` membaca sheet `Users` di EFM-MASTER. Jika `Session.getActiveUser().getEmail()` ada di sheet Users dan punya role yang cukup → akses diberikan. Jika tidak → redirect ke halaman "Akses Ditolak".

| Keuntungan | Kekurangan |
|---|---|
| Kontrol akses per email per modul | Perlu maintain sheet Users di EFM-MASTER |
| Bisa set role berbeda per modul | User harus login Google (tapi tidak perlu password EFM) |
| Mudah tambah/hapus user | Tidak ada session token — cek di setiap request |

**Rekomendasi:** Kombinasi Opsi A + B. Pakai Google OAuth (Opsi A) untuk authentication, tambah role check via sheet Users (Opsi B) untuk authorization.

---

## 5. PEMETAAN FITUR LAMA → PROJECT BARU

### Modul PP
| Fitur Lama (React) | File Baru (Apps Script) |
|---|---|
| `/pp/leads` | `Leads.html` + `LeadService.gs` |
| `/pp/leads/:id` | `LeadDetail.html` + `LeadService.gs` |
| `/pp/klien` | `Clients.html` + `ClientService.gs` |
| `/pp/screening` | `Screening.html` + `AssessmentService.gs` |
| `/pp/orders` | `Orders.html` + `OrderService.gs` |
| `/pp/orders/:id` (Tab 1: Kontrak) | `OrderDetail.html` + `OrderService.gs` + `InvoiceService.gs` |
| `/pp/orders/:id` (Tab 2: Dokumen) | `OrderDetail.html` + `AgreementService.gs` |
| `/pp/orders/:id` (Tab 3: Operasional) | `OrderDetail.html` + `AttendanceService.gs` |
| `/pp/orders/rekap/:id` | `OrderDetail.html` (section rekap) + `AttendanceService.gs` |
| `/pp/invoice` | `Invoice.html` + `InvoiceService.gs` |
| `/pp/invoice/:id` | `InvoiceDetail.html` + `InvoiceService.gs` + `PaymentService.gs` |
| `/pp/receipt` | `Receipt.html` + `ReceiptService.gs` |
| `/pp/receipt/:id` | `ReceiptDetail.html` + `ReceiptService.gs` |
| `/pp/promo` | `Promo.html` + `PromoService.gs` |
| `/pp/agreement/:id` | `Agreement.html` + `AgreementService.gs` |
| `/pp/program-db` | Pindah ke EFM-MASTER (data bersama) |
| `/pp/screening` | `Screening.html` + `AssessmentService.gs` |

### Data Bersama (ke EFM-MASTER)
| Fitur Lama | Lokasi Baru |
|---|---|
| `/ops/pelatih` (PIC) | Sheet `PIC_Master` di EFM-MASTER; UI di semua project |
| `/ops/pelatih/kontrak` | Sheet `PIC_Master` (kolom pks_expiry_date) |
| `/pp/program-db` | Sheet `Programs`, `Offerings`, `Packages` di EFM-MASTER |
| Nomor dokumen | Sheet `ID_Sequences` di EFM-MASTER |
| Audit log | Sheet `Audit_Log` di EFM-MASTER |
| User & role | Sheet `Users` di EFM-MASTER |

### Modul B2B Event
| Fitur Lama | File Baru |
|---|---|
| `/event/leads` | `Leads.html` + `LeadService.gs` |
| `/event/konsultasi` | `Konsultasi.html` + `ConsultationService.gs` |
| `/event/quotation` | `Quotation.html` + `QuotationService.gs` |
| `/event/orders` | `Orders.html` + `OrderService.gs` |
| `/event/invoice` | `Invoice.html` + `InvoiceService.gs` |
| `/event/receipt` | `Receipt.html` + `ReceiptService.gs` |
| `/event/kalender` | `Kalender.html` + data dari sheet Orders_Event |
| Dokumen event (Google Drive) | `DocumentService.gs` + Google Drive API |

### Modul B2B Management
| Fitur Lama | File Baru |
|---|---|
| `/b2b/leads` | `Leads.html` + `LeadService.gs` |
| `/b2b/survei` | `Survei.html` + `SurveyService.gs` |
| `/b2b/orders` | `Orders.html` + `OrderService.gs` |
| `/b2b/invoice` | `Invoice.html` + `InvoiceService.gs` |
| `/b2b/receipt` | `Receipt.html` + `ReceiptService.gs` |
| `/b2b/kalender` | `Kalender.html` |
| Notifikasi kontrak hampir habis | `ContractRenewalService.gs` + trigger waktu |

### Fitur Tidak Dimigrasi
| Fitur | Alasan |
|---|---|
| `/laporan/revenue`, `/laporan/penjualan`, dll | Laporan bisa dibuat langsung di Google Sheets (pivot table, chart) tanpa halaman khusus |
| Download PDF via backend | Ganti dengan Google Docs template atau `PdfService` di Apps Script |
| Supabase Storage (upload foto, PDF) | Ganti dengan Google Drive |
| Real-time overdue check (cron) | Ganti dengan Apps Script Time-based Trigger |

---

## 6. FITUR TERKENDALA BATASAN APPS SCRIPT

### 6.1 Batas Waktu Eksekusi ±6 Menit
**Masalah:** Apps Script membatasi eksekusi 6 menit per request. Operasi yang membaca/menulis banyak baris sekaligus bisa timeout.

**Mitigasi:**
- Baca/tulis data dalam batch kecil
- Hindari loop besar dalam satu eksekusi
- Untuk operasi panjang (generate laporan semua data): gunakan `ContinuationToken` atau pecah ke beberapa trigger
- Pagination di UI — jangan load semua data sekaligus

### 6.2 Tidak Ada npm / Build Tooling
**Masalah:** Tidak bisa menggunakan library npm (React, Tailwind CLI, bundler). CSS harus ditulis manual.

**Mitigasi:**
- CSS manual dengan variabel global (custom properties)
- Bisa pakai CDN untuk library JS ringan (mis. vanilla JS, Chart.js, Flatpickr untuk date picker)
- Template HTML dipisah per halaman (bukan single-page app)
- Gunakan `HtmlService.createTemplateFromFile()` untuk include sidebar dan style dari file terpisah

### 6.3 Kuota Layanan Google
**Masalah:** Ada kuota harian untuk operasi Sheets, Drive, Gmail, dll.
| Layanan | Kuota (akun personal) | Kuota (Google Workspace) |
|---|---|---|
| Spreadsheet reads | 20.000/hari | 20.000/hari |
| Spreadsheet writes | 20.000/hari | 20.000/hari |
| Gmail kirim | 100/hari | 1.500/hari |
| URL Fetch (API eksternal) | 20.000/hari | 20.000/hari |

**Mitigasi:**
- Cache data yang sering dibaca dengan `CacheService` (max 6 jam)
- Batch write (tulis banyak baris dalam satu call `setValues()`, bukan satu-satu)
- Hindari membaca seluruh sheet hanya untuk satu baris — gunakan index atau cari dengan filter

### 6.4 Tidak Ada Database Relasional (JOIN)
**Masalah:** Google Sheets tidak punya JOIN. Untuk menampilkan data dari beberapa sheet sekaligus harus dilakukan di Apps Script (lookup manual).

**Mitigasi:**
- Simpan data denormalisasi (snapshot) seperti yang sudah dilakukan di `order_commercial_snapshots`
- Untuk lookup PIC/paket: baca sheet master sekali, simpan di variabel, lakukan lookup di memori
- Buat fungsi helper `findRowById(sheet, id)` yang dipakai di semua service

### 6.5 Tidak Ada Real-time Push / WebSocket
**Masalah:** HtmlService tidak bisa menerima update real-time. User harus refresh halaman untuk melihat data terbaru.

**Mitigasi:**
- Tambahkan tombol "Refresh" di UI
- Gunakan `google.script.run` untuk fetch data terbaru tanpa full page reload
- Untuk notifikasi: kirim email via `MailApp` saat ada event penting (pembayaran masuk, kontrak hampir habis)

### 6.6 Tidak Ada File Upload Langsung
**Masalah:** HtmlService tidak bisa stream file upload besar ke server langsung.

**Mitigasi:**
- Upload bukti bayar: konversi ke base64 di browser (JS), kirim sebagai string ke `doPost()`, simpan ke Drive
- Batasi ukuran file maksimal (mis. 5MB) untuk menghindari timeout
- Alternatif: minta user upload manual ke Google Drive folder, lalu paste link di form

---

## 7. URUTAN MIGRASI

### Fase 1 — EFM-MASTER (fondasi)
1. Buat Spreadsheet `EFM-MASTER` dengan semua sheet master
2. Isi sheet: `Users` (user + role), `PIC_Master`, `Programs`, `Offerings`, `Packages`, `Package_Prices`
3. Setup sheet `ID_Sequences` dengan format (doc_type, module, year, last_seq)
4. Setup sheet `Audit_Log`
5. Setup sheet `Config` (URL web app per modul, pengaturan)

**Output Fase 1:** Spreadsheet master siap, bisa diakses oleh semua project selanjutnya.

---

### Fase 2 — EFM-PP (prioritas operasional tertinggi)
1. Buat project Apps Script baru "EFM-PP"
2. Buat Spreadsheet `EFM-PP` dengan semua sheet transaksi PP
3. **Impor data dummy** dari `ppLeadsData.js`, `ppOrdersData.js`, `ppInvoiceData.js`, dll ke Sheets
4. Kembangkan file .gs layer demi layer:
   - `Config.gs` + `Utils.gs` + `IdGenerator.gs`
   - `MasterService.gs` (baca EFM-MASTER)
   - `LeadService.gs` → test CRUD lead
   - `ClientService.gs` → test CRUD klien
   - `OrderService.gs` → test CRUD order
   - `InvoiceService.gs` → test invoice, kalkulasi, PDF
   - `PaymentService.gs` → test upload bukti, konfirmasi
   - `ReceiptService.gs` → test generate receipt
   - `AgreementService.gs` → test lifecycle (draft→issued→signed)
   - `AttendanceService.gs` → test absensi sesi
5. Kembangkan UI halaman per halaman (HTML + CSS):
   - `Dashboard.html` → `Leads.html` → `Orders.html` → `Invoice.html` → `Receipt.html`
6. Deploy sebagai web app
7. Test end-to-end alur PP: Lead → Order → Invoice → Bayar → Receipt → Agreement → Sesi

**Output Fase 2:** EFM-PP live, tim PP bisa mulai pakai.

---

### Fase 3 — EFM-B2B-EVENT
1. Clone struktur EFM-PP, adaptasi untuk modul Event
2. Buat Spreadsheet `EFM-B2B-EVENT`
3. Kembangkan service: Lead, Consultation, Quotation, Order, Invoice, Payment, Receipt, Attendance, Document (Drive)
4. Deploy dan test
5. Alur: Lead → Konsultasi → Quotation → Order → Invoice → Bayar → Receipt

**Output Fase 3:** EFM-B2B-EVENT live.

---

### Fase 4 — EFM-B2B-MGMT
1. Clone struktur EFM-PP, adaptasi untuk modul B2B Mgmt
2. Buat Spreadsheet `EFM-B2B-MGMT`
3. Kembangkan service: Lead, Survey, Client, Order (recurring), Invoice bulanan, Payment, Receipt, ContractRenewal
4. Setup Time-based Trigger untuk auto-generate invoice bulanan dan notifikasi expiring kontrak
5. Deploy dan test

**Output Fase 4:** EFM-B2B-MGMT live.

---

## 8. RISIKO DAN MITIGASI

| Risiko | Kemungkinan | Dampak | Mitigasi |
|---|---|---|---|
| Timeout 6 menit saat generate laporan besar | Sedang | Sedang | Pecah operasi, batasi range data |
| Kuota Sheets terpakai habis | Rendah | Tinggi | Monitor kuota, pakai CacheService |
| User tidak punya Google account | Rendah | Sedang | Semua user EFM sudah pakai Google Workspace |
| Data race (2 user edit baris sama sekaligus) | Sedang | Sedang | `LockService.getScriptLock()` sebelum tulis kritis |
| File bukti bayar terlalu besar (>5MB) | Sedang | Rendah | Validasi ukuran di browser sebelum upload |
| Migration data dari dummy ke Sheets tidak akurat | Sedang | Tinggi | Review manual setiap sheet setelah impor |
| Perubahan kode shared (Utils.gs) tidak tersinkron | Sedang | Sedang | Checklist update + versi di komentar file |
| PDF generation lambat (Docs API) | Sedang | Rendah | Generate async, notif email saat selesai |
| Navigasi antar modul membingungkan (buka tab baru) | Sedang | Rendah | Sidebar jelas, label modul aktif terlihat |
