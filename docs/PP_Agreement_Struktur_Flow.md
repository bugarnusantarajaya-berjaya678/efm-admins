# PP Agreement — Struktur & Flow

> Alur Order → Agreement · Dokumen AGR-PP · Status TTD · 12 Pasal Perjanjian  
> EFM V2 — Private Program · CV. Bugar Nusantara Jaya

---

## Alur Order ke Agreement (12 Langkah)

### Fase 1 — Prospek & Onboarding

| Langkah | Nama | ID Dokumen |
|---------|------|------------|
| 1 | Lead Masuk | `LP-0001` |
| 2 | Screening / Konsultasi | `SCR-26-0001` |
| 3 | Pilih Paket | 4 / 8 / 12 / 24 Sesi |

### Fase 2 — Pembayaran

| Langkah | Nama | ID Dokumen |
|---------|------|------------|
| 4 | Invoice Dikirim ke Klien | `INV-PP-26-XXXX` |
| 5 | Bukti Bayar Diupload | oleh Klien |
| **6** ⭐ | **Pembayaran Dikonfirmasi** | **Order `#PP-26-XXXX` Aktif** |
| 7 | Receipt Diterbitkan | `RCP-PP-26-XXXX` |

### Fase 3 — Agreement

| Langkah | Nama | Status |
|---------|------|--------|
| 8 | Agreement Dibuat Admin | `AGR-PP-26-XXXX` · `pending` |
| 9 | Klien TTD Elektronik | via perangkat pelatih → `waiting-approval` |
| **10** ⭐ | **Admin Approve TTD** | status → `signed` |

### Fase 4 — Program Berjalan

| Langkah | Nama | Keterangan |
|---------|------|------------|
| 11 | Jadwal Ditetapkan | Hari · Jam · Lokasi |
| **12** ⭐ | **Sesi Pertama Berjalan** | Rekap Absensi dimulai |

---

## Struktur Dokumen Agreement (AGR-PP)

### Lampiran A — Data Paket & Klien

#### Identitas Dokumen

| Field | Sumber |
|-------|--------|
| No. Agreement | Auto |
| Tanggal Dibuat | Auto |
| Ref Order ID | Dari Order |
| Ref Invoice | Dari Order |
| No. Receipt | Dari Order |

#### Data Klien

| Field | Sumber |
|-------|--------|
| Nama Klien | Dari Order |
| Nama Panggilan | Manual |
| No. WhatsApp | Dari Order |
| Email | Manual |
| Alamat | Manual |
| Kontak Darurat | Manual |
| Pendaftar = Klien? | Manual |
| Data Wali (jika beda) | Manual |

#### Detail Paket

| Field | Sumber |
|-------|--------|
| Paket Dipilih | Dari Order |
| Total Harga Paket | Dari Order |
| Masa Berlaku | Auto |
| Harga Per Sesi | Auto |
| Durasi Per Sesi | Auto |
| Tipe Program | Dari Order |
| Daftar Klien (Grup) | Manual |

#### Jadwal & Pelatih

| Field | Sumber |
|-------|--------|
| Nama Pelatih | Dari Order |
| Hari Latihan | Manual |
| Jam Latihan | Manual |
| Lokasi Latihan | Manual |
| Peralatan Latihan | Manual |
| Catatan Khusus | Manual |
| Est. Mulai Program | Manual |
| Est. Berakhir Paket | Auto (kalkulasi) |

**Keterangan sumber:**
- `Auto` — sistem generate otomatis
- `Dari Order` — prefill dari data order
- `Manual` — diisi oleh admin

---

### Isi Kontrak — 12 Pasal Perjanjian

| No. | Pasal | Ringkasan |
|-----|-------|-----------|
| 1 | Ruang Lingkup Layanan | Definisi layanan, pelatih resmi EFM |
| 2 | Masa Berlaku Paket (Validity Period) | Mulai dari sesi pertama aktual, bukan estimasi |
| 3 | Kebijakan Pembatalan & Rescheduling | Min. 24 jam, darurat butuh bukti dokter |
| 4 | Pembayaran & Validasi Order | Via channel resmi EFM, final & non-refundable |
| 5 | Jaminan Data & Tanggung Jawab Kesehatan | Data jujur, risiko cedera tanggung jawab klien |
| 6 | Kerjasama & Etika Pelatih | Dilarang rekrut pelatih EFM di luar manajemen |
| 7 | Kerahasiaan & Perlindungan Data Pribadi | Sesuai UU PDP No. 27 Tahun 2022 |
| 8 | Force Majeure | Bencana alam, pandemi — sesi ditangguhkan, tidak hangus |
| 9 | Penyelesaian Perselisihan | Musyawarah 14 hari → BPSK / Pengadilan |
| 10 | Ketentuan Hukum yang Berlaku | Hukum Indonesia, TTD digital sah per UU ITE |
| 11 | Perubahan & Pemisahan Klausul | Perubahan hanya via kesepakatan tertulis |
| 12 | Pernyataan Kesadaran & Persetujuan | Klien menyatakan sadar & tanpa paksaan |

> Pasal dapat dikustomisasi per order via Template Agreement di pengaturan. Tabel di atas adalah template standar EFM V2.

---

## Status TTD Agreement

### Alur Status

```
pending  →  waiting-approval  →  signed
                              ╲
                               expired
```

### Penjelasan Status

| Status | Label | Kondisi |
|--------|-------|---------|
| `pending` | Menunggu TTD | Agreement dibuat admin, belum ada TTD klien. Klien perlu TTD via perangkat pelatih. |
| `waiting-approval` | Menunggu Persetujuan | Klien sudah TTD elektronik. Admin belum verifikasi & setujui. Metadata TTD tersimpan: timestamp, device, IP. |
| `signed` | Ditandatangani | Kedua pihak setuju. Agreement berlaku penuh. Order masuk fase Program Berjalan. Rekap Absensi bisa dimulai. |
| `expired` | Kadaluarsa | Batas waktu TTD lewat tanpa TTD klien. Dokumen perlu dibuat ulang oleh admin. |

---

## Bagian Tanda Tangan

### Pihak Pertama — EFM

| Field | Sumber |
|-------|--------|
| TTD EFM | Canvas / tanda tangan CEO |
| Nama Penandatangan | Company Settings |
| Jabatan | Company Settings |
| Nama Perusahaan | Company Settings |
| Nama Legal | Company Settings |

### Pihak Kedua — Klien

| Field | Sumber |
|-------|--------|
| TTD Klien | Canvas TTD (elektronik) |
| Waktu TTD | Auto (sistem) |
| Perangkat | Auto (sistem) |
| Alamat IP | Auto (sistem) |
| Disetujui oleh Admin | Admin action |

**Landasan hukum TTD elektronik:** UU No. 11 Tahun 2008 (UU ITE) — tanda tangan elektronik memiliki kekuatan hukum setara TTD basah. Metadata TTD (timestamp, device, IP) tersimpan dan dapat digunakan sebagai bukti verifikasi.

---

*EFM V2 — Private Program · AGR-PP Module Reference · CV. Bugar Nusantara Jaya*
