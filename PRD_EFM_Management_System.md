# PRD — Sistem Informasi Manajemen Internal EFM
**Essential Fitness Management | CV. Bugar Nusantara Jaya**
**Versi: 1.0 | Juni 2026**

---

## Daftar Isi
1. [Overview Proyek](#1-overview-proyek)
2. [Tech Stack](#2-tech-stack)
3. [Struktur Database](#3-struktur-database)
4. [Role & Hak Akses (RBAC)](#4-role--hak-akses-rbac)
5. [Modul & Fitur](#5-modul--fitur)
6. [Alur Pengguna (User Flow)](#6-alur-pengguna-user-flow)
7. [API Endpoints](#7-api-endpoints)
8. [Arsitektur Sistem](#8-arsitektur-sistem)
9. [Milestone & Timeline](#9-milestone--timeline)

---

## 1. Overview Proyek

### Latar Belakang
Essential Fitness Management (EFM) saat ini mengelola operasional dari 5 divisi bisnis secara terpisah menggunakan Google Spreadsheet manual. Kondisi ini menyebabkan:

- Data tersebar di banyak file tidak terpusat
- Tidak ada validasi input real-time
- Tidak ada kontrol akses per jabatan
- Rekap manual memakan waktu admin
- Owner tidak bisa monitor revenue lintas divisi secara real-time

### Solusi
Membangun **Sistem Informasi Manajemen Internal EFM** berbasis web yang:

- Terpusat dalam 1 website (`efm-admin.vercel.app`)
- Terhubung langsung ke Google Sheets sebagai database
- Memiliki kontrol akses berbasis jabatan (RBAC)
- Desktop-first, responsive untuk tablet & mobile
- Terintegrasi dengan sistem absensi pelatih yang sudah ada

### Tujuan Sistem
| Tujuan | Indikator Keberhasilan |
|--------|----------------------|
| Sentralisasi data | Semua divisi input via 1 website |
| Efisiensi admin | Rekap otomatis, tidak manual |
| Keamanan data | Login per jabatan, data terlindungi |
| Monitoring Owner | Dashboard revenue real-time |
| Invoice digital | Generate & download PDF langsung |

---

## 2. Tech Stack

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Frontend | HTML + CSS + JavaScript | Proven di sistem absensi, ringan, no framework |
| Styling | CSS Custom (brand EFM) | Navy #1E1C43 + Orange #E05945, font Poppins |
| Backend | Google Apps Script | Gratis, terintegrasi langsung ke Google Sheets |
| Database | Google Sheets (5 file) | Familiar, mudah diaudit, gratis |
| Storage | Google Drive | Foto, dokumen, invoice PDF |
| Auth | Username + Password + Cookie Session | Secure, role-based |
| Hosting | Vercel | Auto-deploy dari GitHub, HTTPS gratis |
| Code | GitHub (`efm-admin` repo) | Version control, backup online |
| Invoice | jsPDF (client-side) | Generate PDF langsung di browser |

### Hubungan dengan Sistem Absensi
```
efm-absensi.vercel.app   ←→   efm-admin.vercel.app
(Sistem Pelatih)               (Sistem Internal EFM)
      ↓                               ↓
Database Absensi          ←read—  Modul Private Training
(FILE 3: sheet terpisah)           (data absensi dibaca)
```

---

## 3. Struktur Database

### FILE 1: DATA OPERASIONAL EFM 2026
> Google Sheets ID: [diisi saat setup]

| Sheet Tab | Kolom Utama | Fungsi |
|-----------|-------------|--------|
| Database PIC | ID PIC, Nama, Kode PIC, Status, Spesialisasi, Bank, No. Rekening | Master data pelatih/terapis |
| Database Barang (Aset) | ID Barang, Nama, Kategori, Jumlah, Kondisi, Lokasi, Tanggal Masuk | Inventory aset gym & kantor |
| Database Mitra | ID Mitra, Nama, Jenis, PIC, Kontak, Status Kerja Sama | Data mitra & vendor |

### FILE 2: SISTEM ORDER PP 2026
> Google Sheets ID: [diisi saat setup]

| Sheet Tab | Kolom Utama | Fungsi |
|-----------|-------------|--------|
| Database Leads PP | ID Lead, Nama, Kontak, Sumber (Ads/Website/Referral), Status, Tanggal | Leads private program |
| Database Orderan | ID Order, ID Klien, ID PIC, Program, Paket, Sesi, Harga, Status | Transaksi order klien |
| Database Harga | ID Harga, Nama Paket, Jenis, Jumlah Sesi, Harga Normal, Harga Promo | Master harga paket |
| Database Klien (Private) | ID Klien, Nama, Kontak, Alamat, Tanggal Daftar, Status | Profil klien private |
| Database Promo Value | ID Promo, Nama Promo, Nilai, Berlaku Hingga, Syarat | Promo & value addition |
| Database Progress Fisik | ID Progress, ID Klien, Tanggal, BB, TB, Lemak, Catatan | Personal data fisik klien |
| Database PKS PIC | ID PKS, ID PIC, Tanggal Mulai, Tanggal Selesai, File URL | Kontrak kerja pelatih |
| Database Agreement Klien | ID Agreement, ID Klien, ID Order, Tanggal, File URL, Status TTD | Kontrak klien |

### FILE 3: DATABASE ABSENSI *(existing — read only dari sistem ini)*
> Google Sheets ID: 1OI-Wx3ytAbS59sWwZE-sEbNn_PGqZnZX3juwCeMaO5k

| Sheet Tab | Kolom Utama | Fungsi |
|-----------|-------------|--------|
| ABSENSI_V2 | Timestamp, ID Order, Kode PIC, Foto URL, Lat, Lng, Status | Log absensi pelatih |
| PAYMENT_REQUESTS | ID Request, Kode PIC, Periode, Total Sesi, Total Fee, Status | Pengajuan bayaran pelatih |
| SESSIONS_V2 | Token, Kode PIC, Created At, Expired At, Status | Session login pelatih |
| REKAP ABSENSI | Kode PIC, Bulan, Total Sesi, Total Fee, Status Bayar | Rekap per pelatih |

### FILE 4: DATABASE EFM FITNESS & SPORT MANAGEMENT
> Google Sheets ID: [diisi saat setup]

| Sheet Tab | Kolom Utama | Fungsi |
|-----------|-------------|--------|
| Database Leads Corporate | ID Lead, Nama Perusahaan, PIC, Kontak, Status Negosiasi, Tanggal | Leads korporat |
| Database Leads Apartment | ID Lead, Nama Apartemen, PIC, Kontak, Status Negosiasi, Tanggal | Leads apartemen |
| Report Penjualan | ID Report, Bulan, Nama Klien, Nilai Kontrak, Status Bayar | Revenue B2B bulanan |
| Pemberkasan | ID Berkas, Jenis (Kontrak/MOU/LOI), Nama Klien, Tanggal, File URL, Status TTD | Dokumen legal B2B |
| Database Klien Corporate | ID Klien, Nama Perusahaan, PIC, Kontak, Nilai Kontrak, Durasi, Status | Klien korporat aktif |
| Database Klien Apartment | ID Klien, Nama Apartemen, PIC, Kontak, Nilai Kontrak, Durasi, Status | Klien apartemen aktif |

### FILE 5: DATABASE EFM FITNESS & SPORT EVENT
> Google Sheets ID: [diisi saat setup]

| Sheet Tab | Kolom Utama | Fungsi |
|-----------|-------------|--------|
| Database Leads Event | ID Lead, Nama Brand/Instansi, PIC, Kontak, Jenis Event, Status, Tanggal | Leads event |
| Report Penjualan | ID Report, Nama Event, Tanggal, Nilai, Status Bayar, Laba/Rugi | Revenue event |
| Pemberkasan | ID Berkas, Jenis (Kontrak/MOU/LOI), Nama Klien, Tanggal, File URL, Status TTD | Dokumen legal event |
| Database Klien Event | ID Klien, Nama Brand, PIC, Kontak, Total Event, Last Event, Status | Klien event |

---

## 4. Role & Hak Akses (RBAC)

### Matriks Akses

| Modul | Admin | Super Admin | Owner |
|-------|-------|-------------|-------|
| Login & Dashboard | ✅ | ✅ | ✅ |
| Input Data (divisi sendiri) | ✅ | ✅ | ✅ |
| Edit/Koreksi Data | ❌ | ✅ | ✅ |
| Approval Payment Request | ❌ | ✅ | ✅ |
| Generate Invoice | ✅ | ✅ | ✅ |
| Download PDF | ✅ | ✅ | ✅ |
| Lihat Data Divisi Lain | ❌ | ✅ | ✅ |
| Dashboard Revenue Semua Divisi | ❌ | ❌ | ✅ |
| Dashboard Absensi Real-time | ❌ | ✅ | ✅ |
| Statistik Leads | ❌ | ✅ (divisi sendiri) | ✅ (semua) |
| Konfigurasi Sistem | ❌ | ❌ | ✅ |
| Tambah/Nonaktifkan User | ❌ | ❌ | ✅ |

### Detail Per Role

#### Admin
- Staff pelaksana divisi tertentu (PP, B2B, atau Event)
- Hanya bisa input & lihat data divisi sendiri
- Bisa generate invoice
- Tidak bisa approve payment atau edit data orang lain

#### Super Admin
- Manager atau Chief Divisi
- Bisa lihat & edit semua data dalam divisinya
- Bisa approve payment request pelatih
- Bisa lihat rekap absensi pelatih
- Bisa lihat statistik leads divisinya

#### Owner
- CEO / Direktur Utama
- Full access semua modul & divisi
- Dashboard revenue real-time lintas divisi
- Statistik leads semua divisi
- Konfigurasi global sistem

---

## 5. Modul & Fitur

### 5.1 Modul Autentikasi & Dashboard

#### Login
- Form username + password
- Session cookie (expire: 8 jam kerja)
- Auto-redirect ke dashboard sesuai role
- Logout manual

#### Dashboard per Role

**Dashboard Admin:**
```
┌─────────────────────────────────────┐
│  Selamat datang, [Nama]             │
│  Divisi: [Private Training/B2B/Event]│
├──────────┬──────────┬───────────────┤
│ Leads    │ Order    │ Dokumen       │
│ Bulan Ini│ Aktif    │ Pending TTD   │
├──────────┴──────────┴───────────────┤
│  Quick Input: + Order  + Lead       │
└─────────────────────────────────────┘
```

**Dashboard Super Admin:**
```
┌─────────────────────────────────────┐
│  Overview Divisi [nama divisi]      │
├──────────┬──────────┬───────────────┤
│ Revenue  │ Leads    │ Absensi Today │
│ Bulan Ini│ Pipeline │ [jumlah sesi] │
├──────────┴──────────┴───────────────┤
│  Payment Requests: [X pending]      │
│  Tabel: Aktivitas terbaru           │
└─────────────────────────────────────┘
```

**Dashboard Owner:**
```
┌─────────────────────────────────────────────┐
│  EFM Revenue Dashboard                      │
├────────────┬────────────┬────────────────────┤
│ PP Revenue │ B2B Revenue│ Event Revenue      │
│ Rp xxx     │ Rp xxx     │ Rp xxx             │
├────────────┴────────────┴────────────────────┤
│  Grafik: Revenue 12 bulan (line chart)      │
│  Grafik: Leads per divisi (bar chart)       │
│  Grafik: Absensi pelatih (heatmap)          │
├─────────────────────────────────────────────┤
│  Tabel: Top klien, Top pelatih, Leads baru  │
└─────────────────────────────────────────────┘
```

---

### 5.2 Modul Operasional General

#### Database PIC (Pelatih/Terapis)
- Lihat list semua PIC aktif/nonaktif
- Filter: spesialisasi, status, lokasi
- Detail PIC: profil, rekening bank, riwayat order

#### Database Barang (Aset)
- Input aset baru (nama, kategori, jumlah, kondisi, lokasi)
- Update kondisi aset
- Filter: kategori, lokasi, kondisi
- Export list aset ke PDF

#### Database Mitra
- Input mitra baru
- Update status kerja sama
- Filter: jenis mitra, status

---

### 5.3 Modul Private Training (PP)

#### Leads Management PP
- Input lead baru (nama, kontak, sumber: Ads/Website/Referral)
- Update status lead (New → Follow Up → Closing → Gagal)
- Filter: sumber, status, periode
- Grafik: konversi leads per bulan

#### Input Order / Pesanan Klien
- Pilih klien dari database (atau input klien baru)
- Pilih paket & harga dari database harga
- Assign PIC (pelatih)
- Input lokasi, hari, jam latihan
- Generate QR barcode otomatis (untuk sistem absensi)
- Status order: Active / Selesai / Cancelled

#### Invoice
- Generate invoice dari order aktif
- Include: detail klien, paket, sesi, harga, PIC
- Nomor invoice otomatis (INV/EFM/PP/YYYY/XXXX)
- **Download Invoice sebagai PDF**
- Status: Unpaid → Paid

#### Pemberkasan PP
- Upload & manage file PKS PIC (kontrak pelatih)
- Upload & manage Agreement Klien
- Status tanda tangan: Pending → Signed
- Preview dokumen online
- Download dokumen

#### Monitor Absensi (Read from FILE 3)
- Lihat absensi pelatih per order
- Filter: PIC, bulan, status
- Rekap sesi per pelatih
- Approval Payment Request pelatih (Super Admin only)

---

### 5.4 Modul Fitness & Sport Management (B2B)

#### Leads Management B2B
- Input leads corporate & apartment secara terpisah
- Progress negosiasi: New → Proposal → Presentasi → Closing → Gagal
- Catat: nilai kontrak estimasi, PIC klien, tanggal follow-up
- Grafik: pipeline per stage

#### Invoice B2B
- Generate invoice per klien per bulan
- Nomor invoice: INV/EFM/B2B/YYYY/XXXX
- **Download Invoice sebagai PDF**

#### Revenue Dashboard B2B
- Grafik revenue per klien per bulan
- Status pembayaran (Lunas / Cicilan / Telat)
- Sisa durasi kontrak
- Alert: kontrak yang akan habis dalam 30 hari

#### Pemberkasan B2B
- Upload & manage Kontrak, MOU, LOI
- Status TTD: Pending → Signed
- Filter: jenis dokumen, klien, status

#### Live Report
- Input kejadian/isu fasilitas gym harian
- Kategori: Kerusakan / Komplain / Laporan Rutin
- Status: Open → In Progress → Closed

---

### 5.5 Modul Fitness & Sport Event

#### Leads Management Event
- Input leads event (brand, instansi, pemerintah)
- Progress: New → Brief → Proposal → Presentasi → Closing → Gagal
- Catat: jenis event, estimasi nilai, tanggal event

#### Invoice Event
- Generate invoice per event
- Nomor invoice: INV/EFM/EVT/YYYY/XXXX
- **Download Invoice sebagai PDF**

#### Event Tracker
- Checklist dokumen per event:
  - [ ] LOA ditandatangani
  - [ ] DP diterima
  - [ ] Pelunasan diterima
  - [ ] Laporan event selesai
- Status event: Planning → Ongoing → Done

#### Revenue Event
- Laporan laba-rugi per event
- Grafik: revenue event per bulan
- Database klien event (brand/instansi yang pernah kerja sama)

---

## 6. Alur Pengguna (User Flow)

### Flow Login → Dashboard
```
[Buka efm-admin.vercel.app]
        ↓
[Halaman Login]
Username + Password
        ↓
[Google Apps Script validasi]
        ↓
  [Cek Role User]
  /      |      \
Admin  Super   Owner
        Admin
  ↓      ↓      ↓
[Dashboard sesuai role]
```

### Flow Input Order PP
```
[Dashboard Admin PP]
        ↓
[Klik "+ Order Baru"]
        ↓
[Pilih/Input Klien]
        ↓
[Pilih Paket & Harga]
        ↓
[Assign PIC (Pelatih)]
        ↓
[Input Lokasi, Hari, Jam]
        ↓
[Preview & Konfirmasi]
        ↓
[Simpan → Google Sheets]
        ↓
[QR Barcode di-generate otomatis]
        ↓
[Generate Invoice → Download PDF]
```

### Flow Lead → Order → Invoice
```
[Input Lead Baru]
        ↓
[Follow Up (update status pipeline)]
        ↓
[Klien pilih paket dari katalog EFM]
        ↓
[Update Status Lead: Closing]
        ↓
[Admin Create Order]
Pilih klien, paket, PIC, jadwal
        ↓
[Generate Invoice → Download PDF]
Kirim ke klien
        ↓
[Klien bayar → Status: Paid]
        ↓
[Order Active]
        ↓
[Pelatih absen via efm-absensi.vercel.app]
```

### Flow Approval Payment Request (Super Admin)
```
[Pelatih submit payment request]
(dari sistem efm-absensi.vercel.app)
        ↓
[Super Admin lihat notif di dashboard]
        ↓
[Review: cek rekap absensi & sesi]
        ↓
[Approve / Reject]
        ↓
[Status update di Google Sheets]
        ↓
[Pelatih lihat status di sistem absensi]
```

---

## 7. API Endpoints

Semua API via Google Apps Script Web App.

| Method | Action | Fungsi | Input | Output |
|--------|--------|--------|-------|--------|
| POST | login | Login user internal | username, password | token, role, nama |
| GET | validateToken | Validasi session | token | valid, role, nama |
| GET | getDashboardData | Data dashboard per role | token, role | stats, charts data |
| GET | getLeads | List leads per divisi | token, divisi, status | array leads |
| POST | saveLead | Simpan lead baru | token, data lead | success, id |
| PUT | updateLead | Update status lead | token, id, status | success |
| GET | getOrders | List order PP | token, filter | array orders |
| POST | saveOrder | Simpan order baru | token, data order | success, id, qr_url |
| GET | getOrderData | Detail order by ID | token, orderId | detail order |
| GET | getInvoiceData | Data untuk generate invoice | token, orderId | invoice data |
| GET | getAbsensiData | Data absensi (read FILE 3) | token, filter | array absensi |
| PUT | approvePayment | Approve payment request | token, requestId | success |
| GET | getRevenueData | Data revenue Owner dashboard | token | revenue per divisi |
| POST | saveDocument | Simpan metadata dokumen | token, data | success |
| POST | logout | Hapus session | token | success |

---

## 8. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│              efm-admin.vercel.app                   │
│         (HTML + CSS + JavaScript)                   │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Login   │  │Dashboard │  │  Modul-modul     │  │
│  │  Page    │  │per Role  │  │  PP/B2B/Event    │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│                    ↕ API calls (fetch/AJAX)          │
└────────────────────┼────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│         Google Apps Script (Web App)                │
│              (Backend API Layer)                    │
│                                                     │
│  Router.gs → Auth.gs → Handler per modul            │
│                                                     │
└──┬──────────┬──────────┬──────────┬─────────────────┘
   ↓          ↓          ↓          ↓
┌──────┐ ┌──────┐ ┌──────────┐ ┌──────────┐ ┌───────┐
│FILE 1│ │FILE 2│ │ FILE 3   │ │ FILE 4   │ │FILE 5 │
│Ops   │ │Order │ │Absensi   │ │B2B Mgmt  │ │Event  │
│EFM   │ │PP    │ │(existing)│ │          │ │       │
└──────┘ └──────┘ └──────────┘ └──────────┘ └───────┘
```

### Security Flow
```
Request dari Browser
        ↓
Apps Script: cek token valid?
        ↓
        YA → cek role user
        ↓
        Role sesuai? → proses request
        ↓
        Return data ke frontend
```

---

## 9. Milestone & Timeline

| Fase | Target | Deskripsi | Status |
|------|--------|-----------|--------|
| Fase 0 | Sekarang | PRD & Planning selesai | ✅ DONE |
| Fase 1 | Minggu 1 | Login + RBAC + Dashboard skeleton | 🔄 Next |
| Fase 2 | Minggu 2 | Modul PP: Leads, Order, Invoice | ⏳ |
| Fase 3 | Minggu 3 | Modul PP: Absensi integrasi, Pemberkasan | ⏳ |
| Fase 4 | Minggu 4 | Modul B2B: Leads, Kontrak, Invoice, Revenue | ⏳ |
| Fase 5 | Minggu 5 | Modul Event: Leads, Tracker, Invoice | ⏳ |
| Fase 6 | Minggu 6 | Modul Operasional: PIC, Aset, Mitra | ⏳ |
| Fase 7 | Minggu 7 | Owner Dashboard: Revenue + Statistik | ⏳ |
| Fase 8 | Minggu 8 | Testing, Bug fix, Deploy production | ⏳ |

---

## Catatan Teknis

### Brand & Design System
- **Warna Utama:** Port Gore `#1E1C43` (Navy)
- **Warna Aksen:** Orange Red `#E05945`
- **Font:** Poppins (heading & body)
- **Layout:** Desktop-first, responsive tablet & mobile
- **Tombol & Form:** Ukuran besar, mudah diklik

### Koneksi Sistem Absensi
- Sistem absensi (`efm-absensi.vercel.app`) tetap berjalan terpisah
- Sistem admin membaca data absensi dari FILE 3 (read-only)
- QR barcode di-generate saat order baru dibuat di sistem admin
- Payment request pelatih di-approve dari sistem admin

### Invoice PDF
- Generate client-side menggunakan `jsPDF`
- Template sesuai brand EFM (logo, warna, format)
- Nomor otomatis per divisi:
  - PP: `INV/EFM/PP/YYYY/XXXX`
  - B2B: `INV/EFM/B2B/YYYY/XXXX`
  - Event: `INV/EFM/EVT/YYYY/XXXX`


---

*Essential Fitness Management — #GetFitIn1Solution*
*PRD v1.0 — Juni 2026*
