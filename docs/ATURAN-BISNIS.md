# ATURAN BISNIS — EFM V2

> Dokumen untuk keperluan migrasi ke Google Apps Script.
> Data diambil dari kode aktual + migration SQL. Bagian tidak pasti: [TIDAK PASTI]. Usulan: [USULAN].
> Terakhir diperbarui: Oktober 2026.

---

## 1. MODUL PP (Private Program)

### 1.1 Alur Status Lead PP

```
NEW → APPROACH → SCREENING → INVOICING → CLOSING → CONVERTED
  └──────────────────────────────────────────────────→ CLOSED_LOST
```

| Status | Keterangan | Trigger |
|---|---|---|
| `NEW` | Baru masuk, belum dihubungi | Default saat dibuat |
| `APPROACH` | Sudah dihubungi, sedang dijajaki | Manual update |
| `SCREENING` | Sedang proses fitness assessment | Manual update |
| `INVOICING` | Invoice sudah dikirim ke prospek | Manual update |
| `CLOSING` | Negosiasi akhir | Manual update |
| `CONVERTED` | Lead berhasil jadi klien | Otomatis saat order dibuat |
| `CLOSED_LOST` | Lead tidak jadi | Manual update kapan saja |

**Sumber lead PP yang diketahui dari data:** Instagram, Referral, WhatsApp, Walk-in [TIDAK PASTI: daftar lengkapnya]

---

### 1.2 Alur Status Order PP

```
DRAFT → PENDING_PAYMENT → ACTIVE → COMPLETED
                    └──────────────→ CANCELLED
```

| Status | Keterangan |
|---|---|
| `DRAFT` | Order dibuat, belum ada invoice |
| `PENDING_PAYMENT` | Invoice dikirim, menunggu pembayaran |
| `ACTIVE` | Pembayaran dikonfirmasi, program berjalan |
| `COMPLETED` | Semua sesi selesai |
| `CANCELLED` | Order dibatalkan |

**Readiness check** (`GET /orders/:id/readiness`): cek syarat sebelum order bisa diaktifkan [TIDAK PASTI: syarat lengkapnya].

---

### 1.3 Alur Status Invoice PP

```
DRAFT → SENT → PAID
           ├──→ OVERDUE    (via batch check / cron)
           └──→ CANCELLED
```

| Status | Keterangan |
|---|---|
| `DRAFT` | Invoice dibuat, belum dikirim |
| `SENT` | Invoice dikirim ke klien |
| `PAID` | Pembayaran dikonfirmasi |
| `OVERDUE` | Melewati due_date tanpa pembayaran |
| `CANCELLED` | Invoice dibatalkan |

**Aturan overdue:** endpoint `POST /invoices/overdue-check` memeriksa semua invoice SENT yang due_date-nya sudah lewat → ubah status ke OVERDUE. [TIDAK PASTI: apakah ini dijalankan otomatis (cron) atau manual?]

---

### 1.4 Alur Status Pembayaran PP

```
PENDING → CONFIRMED
    └──→ REJECTED
```

**Upload bukti bayar:** `POST /payments/:id/proof` — file multipart.
**Konfirmasi:** admin review bukti → `POST /payments/:id/confirm`.
**Tolak:** admin → `POST /payments/:id/reject` dengan `rejection_reason`.
**Efek konfirmasi:** status invoice → PAID, status order → ACTIVE [TIDAK PASTI: apakah otomatis atau manual?].

---

### 1.5 Alur Status Receipt PP
Receipt dibuat **setelah** payment CONFIRMED. 1 payment = 1 receipt (relasi 1:1).
Receipt `pdf_path` diisi setelah PDF di-generate via `POST /receipts/:id/pdf`.

---

### 1.6 Alur Status Agreement PP

```
draft → issued → signed
  └──────────────→ voided  (signed → voided: DIBLOKIR 403)
```

| Status | Aturan |
|---|---|
| `draft` | Dapat diedit (`PATCH /agreements/:id`) |
| `issued` | **Konten dibekukan** — tidak bisa diedit lagi |
| `signed` | Tanda tangan digital tercatat; void diblokir (403) |
| `voided` | Hanya bisa void saat status `issued` atau `draft` [TIDAK PASTI] |

**Immutability rule:** sekali `issued`, field `content_body` tidak boleh berubah. Backend harus enforce ini.

---

### 1.7 Alur Status Fitness Assessment PP

```
DRAFT → COMPLETED → ARCHIVED
```

Assessment dibuat per participant, satu participant bisa punya banyak assessment (PRE, MID, POST).
Nilai `fitness_score`: 0–100.

---

### 1.8 Harga & Paket PP

**Paket standar (authoritative — tidak boleh berbeda di mana pun):**
| Paket | Sesi | Total | Harga/Sesi |
|---|---|---|---|
| 4 Sesi - Starter | 4 | Rp 800.000 | Rp 200.000 |
| 8 Sesi - Base | 8 | Rp 1.600.000 | Rp 200.000 |
| 12 Sesi - Pro | 12 | Rp 2.400.000 | Rp 200.000 |
| 24 Sesi - Elite | 24 | Rp 4.800.000 | Rp 200.000 |

**Aturan diskon/promo:**
- Kode promo diinput di invoice, bukan di order
- Tipe promo: nominal tetap atau persentase [TIDAK PASTI: detail implementasi promoType]
- Diskon diterapkan ke `base_amount` untuk menghasilkan `final_amount`
- Snapshot diskon disimpan di `order_commercial_snapshots`

---

### 1.9 Aturan Invoice PP

- **EFM belum PKP** → **TIDAK ADA PPN** di invoice PP
- 1 order = 1 invoice (relasi UNIQUE)
- Invoice dibuat setelah order DRAFT
- `final_amount` di invoice harus sama dengan `final_amount` di `order_commercial_snapshots`
- [TIDAK PASTI: apakah invoice bisa dibuat ulang jika dibatalkan?]

**Komponen kalkulasi invoice PP (dari data dummy):**
| Field | Keterangan |
|---|---|
| `hargaPersesi` | Harga per sesi |
| `sesi` | Jumlah sesi |
| `hargaPaket` | = hargaPersesi × sesi |
| `diskonPaket` | Diskon dari paket |
| `biayaLain` | Biaya tambahan lain |
| `diskon` | Diskon kode promo |
| `pajak` | Pajak (saat ini 0 — EFM belum PKP) |
| `total` | = hargaPaket - diskonPaket + biayaLain - diskon + pajak |

---

### 1.10 Role PP
[TIDAK PASTI: implementasi role di level kode belum terkonfirmasi]

| Role | Akses PP |
|---|---|
| Admin | Semua fitur PP |
| Finance | Invoice, pembayaran, receipt |
| PP | Leads, order, klien |
| Coach | Jadwal sesi sendiri, input absensi |
| Operations | Jadwal, penugasan pelatih |

---

## 2. MODUL B2B MANAGEMENT

### 2.1 Alur Bisnis
Lead → Survei Lokasi → Quotation → Order (kontrak) → Invoice bulanan → Pembayaran

**Karakteristik khusus B2B Mgmt:**
- Kontrak bersifat **recurring** (bulanan/tahunan)
- Invoice diterbitkan **berulang** setiap bulan (atau sesuai periode kontrak)
- Klien terdiri dari korporat (perusahaan) dan properti (apartemen)
- Nilai kontrak per bulan bervariasi: dari data dummy, rentang Rp 6–15 juta/bulan
- Ada tracking `sisaHari` kontrak dan notifikasi `EXPIRING_CONTRACTS`

### 2.2 Status Kontrak B2B [TIDAK PASTI: implementasi aktual]
- Dari data dummy: `payStatus`: `lunas`, `cicilan`, `telat`
- [TIDAK PASTI: status order/kontrak B2B]

### 2.3 Jenis Klien B2B (dari data dummy)
| Jenis | Keterangan |
|---|---|
| `Corporate` | Perusahaan (PT, CV) |
| `Apartment` | Properti/apartemen |

### 2.4 Invoice B2B [TIDAK PASTI]
- [TIDAK PASTI: apakah B2B juga EFM belum PKP? Atau sudah PKP untuk B2B?]
- Invoice diterbitkan per periode kontrak
- [TIDAK PASTI: aturan kalkulasi invoice B2B]

---

## 3. MODUL B2B EVENT

### 3.1 Alur Bisnis
Lead → Konsultasi → Quotation → Order → Invoice → Kelas Berjalan → Absensi Pelatih → Rekap

**Karakteristik khusus B2B Event:**
- Event bersifat **satu kali atau periodik** (bukan recurring bulanan)
- Jenis event: Zumba, wellness event, fitness challenge, dll
- Quotation berisi banyak item (jenis kelas, jumlah sesi, harga/sesi)
- Dokumen event tersimpan di Google Drive (dari data dummy: `googleDocsUrl`)
- Status dokumen: `drafting`, `on_review`, `revision`, `signed`

### 3.2 Status Dokumen Event (dari data dummy)
| Status | Keterangan |
|---|---|
| `drafting` | Sedang ditulis |
| `on_review` | Sedang direview klien |
| `revision` | Ada permintaan revisi |
| `signed` | Sudah ditandatangani |

### 3.3 Invoice B2B Event [TIDAK PASTI]
- [TIDAK PASTI: apakah ada PPN untuk B2B Event?]
- [TIDAK PASTI: aturan kalkulasi invoice Event]

---

## 4. ATURAN PENOMORAN DOKUMEN (semua modul)

### Format Umum
```
[DOCTYPE]-[MODULE]-[YY]-[SEQUENCE]
Contoh: INV-PP-26-0001
```

| Bagian | Aturan |
|---|---|
| `DOCTYPE` | Kode tipe dokumen (INV, RCP, AGR, ATT, dll) |
| `MODULE` | PP, B2B, EVENT, atau gabungan (EFM-B2B, EFM-EVENT) |
| `YY` | 2 digit tahun (26 = 2026) |
| `SEQUENCE` | 4 digit zero-padded, mulai 0001 |

### Aturan Reset
- Sequence **reset ke 0001 setiap 1 Januari** per kombinasi (doc_type, module, year)
- Lead ID **tidak pernah reset** — permanent: `LP-0001`, `LB-0001`, `LE-0001`

### Aturan Tidak Bentrok Antar Modul
Prefix berbeda per modul memastikan tidak ada tabrakan:
- PP: `PP-`, `INV-PP-`, `RCP-PP-`, `AGR-PP-`, `ATT-PP-`, `REF-PP-`
- B2B Mgmt: `B2B-`, `INV-B2B-`, `RCP-B2B-`, `LOI-EFM-B2B-`
- B2B Event: `EV-`, `INV-EV-`, `RCP-EV-`, `LOI-EFM-EVENT-`
- Shared: `PIC-`, `SCR-`, `SVY-`, `KNS-`, `PTR-PP-`

### Tampilan di UI
- Order ID **selalu pakai `#` prefix** di UI: `#PP-26-0001`, `#B2B-26-0001`, `#EV-26-0001`
- Dokumen lain (INV, RCP, AGR, dll) **tidak pakai `#`** — ditampilkan apa adanya
- [USULAN] Di Apps Script: generator nomor disimpan di sheet `ID_Sequences` di spreadsheet EFM-MASTER

---

## 5. ATURAN VALIDASI UMUM

### Validasi Input
- Email harus unik per PIC (`email UNIQUE` di `pic_master`)
- Sesi per order: `session_number` harus unik per order
- Agreement hanya bisa diedit saat status `draft`
- Void agreement hanya bisa saat bukan `signed` (coba void saat signed → 403)
- `fitness_score` antara 0–100
- `assessment_type` hanya `PRE`, `MID`, atau `POST`
- `gender` hanya `M`, `F`, atau `O`

### Validasi Bisnis
- 1 order hanya bisa punya 1 invoice, 1 agreement, 1 participant (relasi UNIQUE)
- Payment baru hanya bisa dibuat jika invoice statusnya SENT atau PAID [TIDAK PASTI]
- Receipt hanya dibuat setelah payment CONFIRMED
- Agreement konten dibekukan setelah `issued`

---

## 6. ATURAN FILE / STORAGE

| Jenis File | Endpoint | Storage Bucket |
|---|---|---|
| Bukti bayar | `POST /payments/:id/proof` | [TIDAK PASTI: nama bucket] |
| Foto sesi | `POST /attendance/:id/photo` | [TIDAK PASTI: nama bucket] |
| PDF invoice | `POST /invoices/:id/pdf` | [TIDAK PASTI: nama bucket] |
| PDF receipt | `POST /receipts/:id/pdf` | [TIDAK PASTI: nama bucket] |
| PDF agreement | [TIDAK PASTI: endpoint] | [TIDAK PASTI: nama bucket] |

Supabase Storage memiliki 9 bucket: 8 private + 1 public (`company-assets`).
Nama 8 bucket private: [TIDAK PASTI — perlu cek Supabase dashboard]
