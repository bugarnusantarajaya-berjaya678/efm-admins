# EFM V2 — Project Instructions for Claude Code

## Tentang Project Ini

EFM V2 adalah admin dashboard untuk CV. Bugar Nusantara Jaya (Essential 

Fitness Management) — mengelola 3 pilar bisnis: Private Program (PP), 

B2B Management (Corporate & Property), dan B2B Event.

## Penamaan Modul — PENTING

- Modul ketiga bernama resmi **"B2B Event"** (bukan "Event Management" atau 
  hanya "Event"). Ini adalah divisi B2B khusus event fitness (Zumba, wellness 
  event, dll), berbeda dari B2B Management yang mengelola gym/fitness center 
  korporat dan apartemen secara recurring.
- Kode/route di codebase menggunakan prefix `/event/` dan nama file `Event*` —
  ini tetap dipertahankan untuk konsistensi teknis, tapi label UI dan komunikasi
  ke pengguna harus menyebut "B2B Event", bukan "Event" saja.
- Perbedaan B2B Management vs B2B Event:
  - **B2B Management**: kontrak recurring bulanan/tahunan, gym corporat, 
    apartemen; alur: Leads → Survei → Quotation → Order → Invoice → Kontrak
  - **B2B Event**: event satu kali atau periodik (Zumba, fitness challenge, dll);
    alur: Leads → Konsultasi → Quotation → Order → Invoice → Kelas Jalan → 
    Pelatih Absen → Rekap

- Stack: React 18 + Vite + Tailwind CSS v3 + React Router v6

- Lokasi kode: `REACT-APP/`

- Status: UI-only dengan dummy data. Belum terhubung ke backend/Google 

  Sheets API (fase depan).

## WAJIB DIBACA SEBELUM MENGERJAKAN APAPUN

Project ini punya 3 skill di `REACT-APP/.claude/skills/` yang HARUS 

selalu dicek sebelum menulis atau mengedit kode:

1. **efm-prompt-pattern** — disiplin workflow: kapan harus chunk task, 

   wajib baca file sebelum edit, konfirmasi scope, checklist sebelum 

   & sesudah build. Cek skill ini PALING PERTAMA, sebelum yang lain.

2. **efm-design-standards** — warna, font, format ID dokumen (PP/B2B/

   Event), ukuran font tabel/label/KPI card, pola komponen dasar.

3. **efm-component-patterns** — pola UI kompleks yang berulang: modal 

   scrollable, photo preview popup, invoice template, activity log, 

   pipeline/stage progress visual, detail page header (Section 15).

4. **efm-quick-task** — pattern prompt pendek untuk task berulang (clone 

   halaman, fix UI, tambah field, update data, RRP, match PP standard). 

   Cek skill ini ketika prompt terlihat singkat/terse — mapping ke 

   workflow lengkap sudah ada di sana.

Jangan menulis kode apapun di project ini tanpa mengecek ketiga skill 

di atas terlebih dahulu.

## Aturan Umum Project

- Selalu kerja di dalam folder `REACT-APP/` untuk kode aplikasi.

- Setelah membuat perubahan, jalankan `npm run build` di dalam 

  `REACT-APP/` untuk verifikasi tidak ada error sebelum melaporkan 

  selesai.

- Belum ada deploy ke Vercel/production — semua perubahan cukup 

  divalidasi lewat `npm run dev` (localhost) dan build check.

- Jangan push ke GitHub kecuali diminta eksplisit oleh pengguna.

## Live Preview Workflow

Setiap kali menyelesaikan sebuah task/perubahan kode:

1. Pastikan perubahan sudah di-push ke branch kerja (bukan main)

2. Sertakan di akhir laporan: **link PR** saja. Jangan fetch Vercel
   preview URL via API (get_comments) — pengguna tidak memakainya
   dan ini memboroskan GitHub API quota. Pengguna akan refresh
   efm-admins.vercel.app setelah PR di-merge.

3. efm-admins.vercel.app (tanpa suffix branch) adalah production,
   terhubung ke branch main - hanya update setelah PR di-merge

## Pull Request Otomatis

Setiap kali menyelesaikan task dan sudah push ke branch:

1. Cek dulu apakah branch ini SUDAH punya PR yang masih open.
   Kalau belum ada PR untuk branch/commit ini, BUAT PR baru
   secara otomatis menggunakan GitHub CLI (gh pr create) -
   jangan hanya push dan berhenti di situ.

2. Kalau branch ini sebelumnya sudah pernah di-merge lewat PR
   lain, dan sekarang ada commit baru menumpuk di branch yang
   sama, BUAT PR BARU (branch baru kalau perlu) - jangan
   mengandalkan PR lama yang sudah merged.

3. Selalu sertakan nomor PR yang BENAR dan URL yang valid di
   laporan akhir - verifikasi dulu PR itu benar dalam status
   "Open" sebelum melaporkan ke pengguna, jangan asumsi atau
   sebut nomor dari memori/sesi sebelumnya.

4. **Batch perubahan ke satu PR.** Perubahan kecil yang berkaitan
   (misalnya: beberapa fix UI di modul yang sama, atau dokumentasi
   skill + implementasinya) digabung ke satu branch dan satu PR —
   bukan PR terpisah per perubahan. Ini menghemat GitHub API quota
   dan mengurangi risiko rate limit.

## Konfirmasi Merge

Setelah menyelesaikan task, build sukses, dan PR sudah dibuat
(sesuai section Pull Request Otomatis):

1. JANGAN langsung merge PR secara otomatis.

2. Di akhir laporan, setelah link PR, tambahkan pertanyaan
   eksplisit: "Sudah oke untuk di-merge ke main? (ya/tidak)"

3. Kalau pengguna menjawab "ya" / "oke" / "lanjut" / "merge"
   atau kalimat senada yang menyatakan setuju - jalankan merge
   PR menggunakan gh pr merge (pilih metode merge standar/default
   project), lalu konfirmasi hasilnya dan berikan link production
   (efm-admins.vercel.app).

4. Kalau pengguna menjawab "tidak" / minta revisi - JANGAN merge,
   tunggu instruksi perbaikan lebih lanjut dari pengguna. PR
   tetap terbuka menunggu.

5. Pengguna juga tetap bisa merge manual sendiri lewat GitHub
   kapan saja tanpa menunggu ditanya - alur tanya ini hanya
   mempercepat, bukan satu-satunya cara.

## Referensi Tambahan

Daftar lengkap semua halaman/file di project (untuk referensi saat 

prompting) ada di `docs/EFM_V2_Daftar_Halaman.md`.
