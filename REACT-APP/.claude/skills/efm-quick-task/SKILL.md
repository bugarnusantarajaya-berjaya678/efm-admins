---
name: efm-quick-task
description: Short-form prompt patterns for common EFM V2 tasks. Maps terse trigger phrases to full implied workflows so the user doesn't need to spell out standard steps. Claude executes the complete workflow for each pattern — read → edit → build → push → PR — without asking for clarification on steps already covered here.
---

# EFM Quick Task Patterns

Konvensi prompt pendek untuk task yang sering muncul. Ketika prompt cocok dengan salah satu pola di bawah, Claude langsung jalankan workflow lengkapnya tanpa tanya langkah-langkah standar.

**Asumsi default untuk SEMUA pattern:**
- Baca file target sebelum edit (wajib)
- Jalankan `npm run build` sebelum lapor selesai
- Push ke branch aktif + buat PR draft jika belum ada
- Sertakan link PR dan Vercel preview di laporan akhir
- Tanya konfirmasi merge di akhir

---

## Pattern 1 — Clone Halaman

**Trigger:** `clone [Sumber] ke [target], route [/path/:id]`

**Contoh:**
```
clone PPInvoicePage ke Event, route /event/invoice/:id
clone B2BLeadDetailPage ke PP, route /pp/leads/:id
```

**Workflow yang dijalankan:**
1. Baca file sumber lengkap
2. Baca file data modul target (`*Data.js`)
3. Ganti semua referensi modul (prefix ID, route, label UI, nama field)
4. Daftarkan route baru di `App.jsx`
5. Tambahkan link navigasi dari list page ke detail page (jika relevan)
6. Build + push + PR

**Yang TIDAK perlu disebutkan di prompt:** langkah baca-dulu, format ID modul, pola Tailwind, cara daftarkan route — semua sudah di skill.

---

## Pattern 2 — Fix UI

**Trigger:** `fix: [deskripsi singkat masalah]`

**Contoh:**
```
fix: tombol Kembali di EventOrderDetail tidak navigate
fix: font total invoice terlalu besar
fix: tabel B2B leads tidak bisa scroll horizontal
```

**Workflow yang dijalankan:**
1. Identifikasi file yang terdampak dari deskripsi
2. Baca file tersebut
3. Edit minimal — hanya bagian yang rusak, tidak refactor sekitar
4. Build + push + PR

**Asumsi:** fix terfokus, blast radius minimal. Kalau ternyata butuh ubah > 2 file, Claude akan bilang sebelum mulai.

---

## Pattern 3 — Tambah Field

**Trigger:** `tambah field [namaField] ke [halaman/form]`

**Contoh:**
```
tambah field tanggalEvent ke EventOrderForm
tambah field npwp ke B2BLeadDetailPage, section Info Perusahaan
```

**Workflow yang dijalankan:**
1. Baca file target
2. Tambah field ke UI (label + input/display yang sesuai tipe data)
3. Tambah field ke dummy data di `*Data.js` jika belum ada
4. Build + push + PR

**Asumsi default tipe input:** text. Sebutkan jika berbeda: `tambah field tanggalMulai (date) ke ...`

---

## Pattern 4 — Update Format Data

**Trigger:** `update data: field [namaField] format baru "[format baru]"`

**Contoh:**
```
update data: field programLatihan format baru "Private Training — 12 Sesi - Pro"
update data: field status format baru "Lunas" (sebelumnya "lunas")
```

**Workflow yang dijalankan:**
1. Grep `namaField` di semua `*Data.js` yang relevan
2. Update SEMUA entri agar konsisten dengan format baru
3. Build + push + PR

**Catatan:** pattern ini khusus sinkronisasi format — tidak mengubah UI.

---

## Pattern 5 — Konversi ke Related Records Panel

**Trigger:** `RRP: section [nama section] di [halaman]`

**Contoh:**
```
RRP: section Agreement Klien di PPOrderDetailPage
RRP: section Riwayat Order di B2BLeadDetailPage
```

**Workflow yang dijalankan:** ikuti `related-records-panel` skill sepenuhnya.

---

## Pattern 6 — Match PP Standard

**Trigger:** `match PP: [komponen] di [halaman]`

**Contoh:**
```
match PP: header card di EventLeadDetailPage
match PP: edit form tahapan di B2BOrderDetail
```

**Workflow yang dijalankan:**
1. Baca PP equivalent (PP Lead Detail atau PP Order Detail)
2. Identifikasi perbedaan dengan target
3. Terapkan PP standard ke target — hanya section yang disebutkan
4. Build + push + PR

---

## Pattern 7 — Update Skill

**Trigger:** `update skill: [apa yang berubah]`

**Contoh:**
```
update skill: tambah pola baru untuk form tanggal range
update skill: catat keputusan tidak pakai Rp di header
```

**Workflow yang dijalankan:**
1. Identifikasi skill mana yang perlu diupdate (design-standards / component-patterns / prompt-pattern)
2. Tulis/tambah section yang tepat
3. Commit + push ke branch aktif

---

## Pattern 8 — Buat Halaman Baru (dari nol)

**Trigger:** `buat [NamaHalaman] untuk modul [PP/B2B/Event]`

**Contoh:**
```
buat halaman Leads untuk modul Event
buat halaman Receipt Detail untuk modul PP
```

**Workflow yang dijalankan:**
1. Cek apakah modul lain sudah punya halaman serupa (clone-first approach)
2. Kalau ada → jalankan Pattern 1 (clone)
3. Kalau tidak ada → tanya dulu sebelum desain dari nol (task besar, perlu scope konfirmasi)

---

## Cara Pakai yang Paling Efisien

**Prompt minimum yang cukup:**
```
clone PPReceiptPage ke Event, route /event/receipt/:id
```
↑ Claude tahu: baca file, adaptasi modul, daftarkan route, build, push, PR, tanya merge.

**Tambahkan hanya kalau berbeda dari default:**
```
clone PPReceiptPage ke Event, route /event/receipt/:id
— skip PR, langsung lapor saja
```

**Kombinasi pattern juga oke:**
```
match PP: header card di EventLeadDetailPage
+ tambah field koordinator ke section bawahnya
```

---

## Yang Masih Perlu Disebutkan Eksplisit

Hal-hal yang Claude tidak bisa asumsikan dan HARUS ada di prompt:

| Informasi | Kenapa perlu eksplisit |
|---|---|
| Route target (`/event/receipt/:id`) | Tidak ada konvensi yang bisa diautokan |
| Section spesifik dalam halaman (`section Info Perusahaan`) | Halaman bisa punya 5+ section |
| Tipe data field baru jika bukan text | Claude default ke text input |
| Apakah perlu skip PR / skip push | Asumsi default: selalu push + PR |
| Apakah task menyentuh >1 modul sekaligus | Perlu disebutkan agar tidak under-scope |
