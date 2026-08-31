# Sync Data Format

Sinkronisasi format field di semua file data (`*Data.js`, `*Store.js`) setelah ada perubahan format nilai suatu field.

## Target

$ARGUMENTS

## Kapan Command Ini Dipakai

Ketika format nilai sebuah field berubah — misalnya:
- `paket: "12 Sesi - Pro"` → `paket: "Private Training — 12 Sesi - Pro"`
- `status: "paid"` → `status: "lunas"`
- Field baru ditambahkan ke semua record (dengan nilai default)
- Field dihapus dari semua record

Jika tidak disinkronkan, record lama akan tampil berbeda dari record baru — inkonsistensi visual di tabel dan halaman detail.

## Eksekusi

### Langkah 1 — Identifikasi scope dari $ARGUMENTS

$ARGUMENTS harus menyebutkan:
- Nama field yang berubah (misal: `paket`, `namaLatihan`, `status`)
- Format lama → format baru
- Modul yang terdampak (PP / B2B / Event / semua)

Jika salah satu tidak disebutkan, tanya dulu sebelum lanjut.

### Langkah 2 — Temukan semua file data yang relevan

```bash
grep -rln "[nama-field]" REACT-APP/src/data/
```

File data yang perlu dicek (sesuai modul):
- PP: `ppInvoiceData.js`, `ppReceiptData.js`, `ppOrderData.js`, `ppLeadData.js`, `ppReceiptStore.js`, `ppInvoiceStore.js`
- B2B: `b2bInvoiceData.js`, `b2bOrderData.js`, `b2bLeadData.js`, dll
- Event: `eventInvoiceData.js`, `eventOrderData.js`, dll

### Langkah 3 — Baca setiap file yang terdampak

Baca penuh setiap file sebelum mengedit. Hitung berapa record yang perlu diupdate.

### Langkah 4 — Update semua record

Gunakan replace_all jika formatnya seragam dan bisa di-replace dengan string substitution.
Gunakan edit per-record jika formatnya bervariasi antar record (misal: nama klien yang berbeda masuk ke dalam nilai field).

**Setelah update, verifikasi tidak ada record yang terlewat:**
```bash
grep -rn "[format-lama]" REACT-APP/src/data/
```
Output harus kosong (tidak ada sisa format lama).

### Langkah 5 — Cek komponen yang membaca field ini

```bash
grep -rn "[nama-field]" REACT-APP/src/pages/ REACT-APP/src/components/
```

Jika ada komponen yang memformat atau mem-parse nilai field ini secara hardcoded (misal: split/replace/match pada nilai lama), update juga komponen tersebut agar sesuai format baru.

### Langkah 6 — Build & verifikasi
```bash
cd REACT-APP && npm run build
```

Build harus hijau. Jika ada error terkait field yang diubah — perbaiki sebelum lanjut.

### Langkah 7 — Push & PR
1. Commit dengan pesan: `fix: sync [nama-field] format across all [modul] data records`
2. Push ke branch kerja aktif
3. Buat PR draft jika belum ada PR open
4. Sertakan di laporan: berapa file diupdate, berapa record diubah
5. Tanya konfirmasi merge
