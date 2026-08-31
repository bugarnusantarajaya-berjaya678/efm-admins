# Clone Page

Buat halaman baru di satu modul dengan mengkloning halaman yang sudah ada dari modul lain, lalu adaptasikan ke modul target.

## Target

$ARGUMENTS

## Prinsip Clone-First

Project EFM V2 punya 3 modul paralel (PP, B2B, Event) dengan struktur yang sengaja dibuat mirip. Selalu klon dari modul yang sudah punya halaman yang dibutuhkan, jangan desain dari awal. Klon lebih cepat, lebih konsisten, dan menghindari perbedaan pola yang tidak disengaja.

**Urutan preferensi sumber klon:**
1. Modul yang paling mirip secara alur bisnis dengan target
2. Modul yang file-nya paling lengkap/matang
3. Biasanya: B2B → PP → Event (atau sesuaikan dengan kondisi aktual)

## Eksekusi

### Langkah 1 — Identifikasi dari $ARGUMENTS

$ARGUMENTS harus menyebutkan:
- **File sumber** (modul asal + nama halaman, misal: `PPInvoiceDetailPage.jsx`)
- **File target** (modul tujuan + nama halaman baru, misal: `B2BInvoiceDetailPage.jsx`)
- **Route target** (misal: `/b2b/invoice/:id`)
- **Data store/file data** yang akan dipakai di modul target

Jika salah satu tidak disebutkan, tanya dulu.

### Langkah 2 — Baca file sumber secara penuh

Baca file sumber yang akan diklon. Identifikasi:
- Import apa saja yang dipakai
- State apa saja yang ada
- Komponen/fungsi helper di dalam file
- Data fields yang digunakan (nama field, format nilai)
- Route navigate yang dipakai
- ID/dokumen format (misal: `INV-PP-` vs `INV-B2B-`)

### Langkah 3 — Baca file data target

Baca file data modul target (`*Data.js`, `*Store.js`) untuk memahami:
- Nama field yang tersedia (bisa berbeda dari modul sumber)
- Format ID dokumen modul target (ikuti `efm-design-standards`)
- Status/label yang dipakai di modul target

### Langkah 4 — Adaptasi saat mengklon

Yang **dipertahankan** dari sumber:
- Struktur komponen dan layout keseluruhan
- Pola state management
- Pola navigasi (navigate, useParams, useLocation)
- Styling dan class Tailwind

Yang **diganti** di target:
- Semua referensi modul (PP → B2B, atau sebaliknya):
  - Nama import dan file data
  - Prefix ID dokumen (`INV-PP-` → `INV-B2B-`)
  - Label UI ("Invoice Private Training" → "Invoice B2B")
  - Route paths (`/pp/invoice` → `/b2b/invoice`)
  - Nama field jika berbeda antar modul
- Kolom tabel yang berbeda (PP: Harga Persesi/Jumlah Sesi; B2B: Jumlah/Satuan/Harga Satuan)
- Terminology bisnis (PP: "Klien", "PIC Pelatih"; B2B: "Perusahaan", "PIC", "NPWP")

### Langkah 5 — Daftarkan route baru

Cek file routing (`App.jsx` atau `router.jsx`):
```bash
grep -n "Route\|route" REACT-APP/src/App.jsx
```

Tambahkan route baru untuk halaman yang diklon. Ikuti pola route modul target yang sudah ada.

### Langkah 6 — Tambahkan link navigasi (jika perlu)

Cek apakah ada halaman list atau detail lain di modul target yang seharusnya navigate ke halaman baru ini. Tambahkan link/navigate jika relevan.

### Langkah 7 — Verifikasi & push

1. `npm run build` — harus hijau
2. Pastikan tidak ada referensi modul sumber yang tertinggal di file target (grep nama modul sumber)
3. Commit: `feat: add [NamaHalaman] untuk modul [target]`
4. Push ke branch kerja aktif
5. Buat PR draft jika belum ada PR open
6. Sertakan Vercel preview URL di laporan
7. Tanya konfirmasi merge

## Format ID Dokumen per Modul (referensi cepat)

| Dokumen | PP | B2B | Event |
|---|---|---|---|
| Order | `PP-26-0001` | `B2B-26-0001` | `EV-26-0001` |
| Invoice | `INV-PP-26-0001` | `INV-B2B-26-0001` | `INV-EV-26-0001` |
| Receipt | `RCP-PP-26-0001` | `RCP-B2B-26-0001` | `RCP-EV-26-0001` |
| Lead | `LP-0001` | `LB-0001` | `LE-0001` |
