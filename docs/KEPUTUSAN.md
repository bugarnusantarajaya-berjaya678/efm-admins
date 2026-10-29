# KEPUTUSAN ARSITEKTUR & BISNIS — EFM V2

> Dokumen ini mencatat semua keputusan besar yang sudah dibuat, beserta alasannya.
> Untuk referensi migrasi ke Google Apps Script.
> Terakhir diperbarui: Oktober 2026.

---

## KEPUTUSAN LAMA

### K-01 — Stack Frontend: React + Vite + Tailwind + React Router
**Keputusan:** Frontend dibangun dengan React 18 + Vite sebagai build tool, Tailwind CSS v3 untuk styling, React Router v6 untuk navigasi.

**Alasan:** Stack modern, developer experience baik, ekosistem luas, Tailwind mempercepat styling konsisten.

**Status:** ✅ Aktif — dipakai di `REACT-APP/`

---

### K-02 — Stack Backend: Node.js + Express + PostgreSQL via Supabase
**Keputusan:** Backend dibangun dengan Node.js 20 + Express 4 (ESM), database PostgreSQL dikelola via Supabase (auth + storage + DB).

**Alasan:** Supabase menyederhanakan setup auth, storage, dan database; Express familiar dan ringan.

**Status:** ✅ Aktif di `backend/` — namun hanya skema PP yang lengkap; B2B dan Event belum punya migration.

---

### K-03 — Autentikasi: Supabase Auth + JWT HS256
**Keputusan:** Autentikasi menggunakan Supabase Auth sebagai identity provider. Token JWT HS256 dikirim di header `Authorization: Bearer <token>`, divalidasi middleware `requireAuth`.

**Alasan:** Supabase Auth out-of-the-box, mudah diintegrasikan dengan PostgreSQL Supabase.

**Status:** ✅ Aktif untuk backend PP.

---

### K-04 — Hosting: Vercel (frontend) + Railway (backend)
**Keputusan:** Frontend di-deploy ke Vercel (branch `main`). Backend di-deploy ke Railway dengan nixpacks builder, Node 20.

**Alasan:** Vercel optimal untuk SPA/React; Railway menyederhanakan deploy Node.js.

**Status:** Vercel aktif; Railway dikonfigurasi (`railway.toml`, `.nvmrc`) — status deploy [TIDAK PASTI].

---

### K-05 — Satu Repo (Monorepo)
**Keputusan:** Frontend dan backend dalam satu repository GitHub (`efm-admins`).

**Alasan:** Memudahkan koordinasi perubahan yang menyentuh keduanya.

**Status:** ✅ Aktif.

---

### K-06 — Format ID Dokumen: [DOCTYPE]-[MODULE]-[YY]-[SEQUENCE]
**Keputusan:** Semua dokumen menggunakan format standar `INV-PP-26-0001`. Lead ID permanent tanpa tahun (`LP-0001`). Sequence 4 digit, reset 1 Januari per kombinasi (doc_type, module, year).

**Alasan:** Konsisten, mudah dibaca, prefix modul memastikan tidak ada tabrakan antar modul.

**Status:** ✅ Berlaku untuk semua modul. Tidak boleh berubah.

---

### K-07 — EFM Belum PKP — Tanpa PPN di Invoice PP
**Keputusan:** Invoice PP tidak mencantumkan PPN. Field pajak ada di data model tetapi nilainya 0.

**Alasan:** EFM belum berstatus Pengusaha Kena Pajak (PKP).

**Status:** ✅ Berlaku. [TIDAK PASTI: apakah B2B Mgmt dan B2B Event juga sama?]

---

### K-08 — Agreement Immutability: Konten Dibekukan Setelah Issued
**Keputusan:** Setelah agreement di-issue, field `content_body` tidak bisa diubah. Setelah signed, void diblokir (403).

**Alasan:** Integritas dokumen hukum — konten yang sudah dikirim ke klien tidak boleh berubah diam-diam.

**Status:** ✅ Aktif di backend PP.

---

### K-09 — Database Schema: Snapshot Komersial Per Order
**Keputusan:** Saat order dibuat, data paket/harga yang berlaku saat itu disimpan ke `order_commercial_snapshots`. Ini terpisah dari tabel master `packages`/`package_prices`.

**Alasan:** Harga master bisa berubah di masa depan; harga yang sudah disepakati dalam order tidak boleh berubah retroaktif.

**Status:** ✅ Aktif.

---

### K-10 — UI-Only dengan Dummy Data untuk B2B dan Event
**Keputusan:** Modul B2B Management dan B2B Event dibangun sebagai UI dengan data dummy statis. Backend/database untuk kedua modul ini belum dibuat.

**Alasan:** Prioritas pertama adalah modul PP. B2B dan Event direncanakan menyusul.

**Status:** ⚠️ Belum selesai — dilewati karena keputusan migrasi K-11.

---

### K-11 — Pivot ke Google Apps Script (KEPUTUSAN BARU — Oktober 2026)
**Keputusan:** Sistem EFM dimigrasi **total** dari React + Vercel + Node.js backend + GitHub ke:
- **Google Apps Script** (logika bisnis + UI via HtmlService)
- **Google Sheets** (database)
- **Google Drive** (penyimpanan dokumen)

**Alasan:** Pengembangan backend Node.js + Supabase terlalu lambat. Sistem perlu segera berjalan dan bisa digunakan tim operasional. Google Apps Script + Sheets lebih mudah dikelola oleh tim non-teknis, tanpa infrastruktur server, dan terintegrasi langsung dengan tools yang sudah dipakai (Google Workspace).

**Implikasi:**
- Kode React dan Node.js menjadi **referensi dokumentasi**, bukan kode yang dikembangkan lebih lanjut
- Data dummy di React dikonversi menjadi isi awal Google Sheets
- API endpoint backend menjadi referensi untuk fungsi Apps Script yang perlu dibangun
- Supabase Auth digantikan oleh Google OAuth (bawaan Google Workspace)
- File storage (Supabase Storage) digantikan oleh Google Drive

**Status:** ✅ Ditetapkan. Implementasi dimulai setelah dokumentasi selesai.

---

### K-12 — Pemisahan Per Modul: Setiap Modul = Project Apps Script Sendiri (KEPUTUSAN BARU — Oktober 2026)
**Keputusan:** B2B Event dan B2B Management dinilai terlalu berat jika digabung dalam satu project. Setiap modul dipisah menjadi:
- **EFM-MASTER**: Spreadsheet data bersama (klien, pelatih, paket, user & role, penomoran dokumen, konfigurasi)
- **EFM-PP**: Project Apps Script + Spreadsheet transaksi PP
- **EFM-B2B-EVENT**: Project Apps Script + Spreadsheet transaksi B2B Event
- **EFM-B2B-MGMT**: Project Apps Script + Spreadsheet transaksi B2B Management

**Alasan:**
- Setiap modul punya alur bisnis dan data yang berbeda cukup signifikan
- Pemisahan memudahkan pengembangan paralel per modul
- Eksekusi Apps Script dibatasi ±6 menit — satu project monolith untuk semua modul berisiko timeout
- Tim yang berbeda bisa mengerjakan modul berbeda tanpa saling mengganggu

**Implikasi:**
- Data bersama (pelatih, paket, user) disimpan di EFM-MASTER dan dibaca oleh semua project
- Navigasi antar modul = link ke URL web app modul lain (bukan routing internal)
- Sidebar seragam diduplikasi di setiap project (bukan diimpor — Apps Script tidak support)

**Status:** ✅ Ditetapkan. Arsitektur detail ada di `RENCANA-MIGRASI-APPSCRIPT.md`.

---

### K-13 — Urutan Migrasi: EFM-PP Lebih Dulu
**Keputusan:** Migrasi dimulai dari EFM-MASTER (data bersama) → EFM-PP (prioritas operasional tertinggi) → EFM-B2B-EVENT → EFM-B2B-MGMT.

**Alasan:** PP adalah modul yang paling banyak dipakai sehari-hari dan paling lengkap skema datanya. B2B Event dan B2B Management belum punya data aktual (masih dummy), sehingga bisa dimigrasi belakangan.

**Status:** ✅ Ditetapkan.
