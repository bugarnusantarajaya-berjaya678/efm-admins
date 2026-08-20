# EFM V2 — Project Instructions for Claude Code

## Tentang Project Ini

EFM V2 adalah admin dashboard untuk CV. Bugar Nusantara Jaya (Essential 

Fitness Management) — mengelola 3 pilar bisnis: Private Program (PP), 

B2B Corporate & Property, dan Event Management.

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

   pipeline/stage progress visual.

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

2. Selalu sertakan di akhir laporan: link PR DAN link Vercel
   branch preview URL. JANGAN konstruksi URL preview secara manual
   dari nama branch — branch panjang di-truncate Vercel dan URL
   yang dikonstruksi tidak bisa dibuka. Selalu ambil URL preview
   yang benar dengan memanggil mcp__github__pull_request_read
   (method: get_comments) setelah PR dibuat, lalu baca field
   previewUrl dari komentar Vercel bot di PR tersebut.

3. Jangan gunakan URL immutable deployment (yang formatnya 
   efm-admins-[hash acak]-bugar-nusantara-jaya.vercel.app) sebagai 
   link yang dibagikan ke pengguna - itu snapshot statis, tidak 
   update otomatis

4. efm-admins.vercel.app (tanpa suffix branch) adalah production, 
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

## Konfirmasi Merge

Setelah menyelesaikan task, build sukses, dan PR sudah dibuat
(sesuai section Pull Request Otomatis):

1. JANGAN langsung merge PR secara otomatis.

2. Di akhir laporan, setelah link PR dan Vercel preview,
   tambahkan pertanyaan eksplisit: "Sudah oke untuk di-merge ke
   main? (ya/tidak)"

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
