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
   branch preview URL (format: 
   https://efm-admins-git-[nama-branch]-bugar-nusantara-jaya.vercel.app) 
   supaya pengguna bisa langsung buka dan lihat hasilnya secara 
   live di browser, tanpa perlu screenshot manual

3. Jangan gunakan URL immutable deployment (yang formatnya 
   efm-admins-[hash acak]-bugar-nusantara-jaya.vercel.app) sebagai 
   link yang dibagikan ke pengguna - itu snapshot statis, tidak 
   update otomatis

4. efm-admins.vercel.app (tanpa suffix branch) adalah production, 
   terhubung ke branch main - hanya update setelah PR di-merge

## Referensi Tambahan

Daftar lengkap semua halaman/file di project (untuk referensi saat 

prompting) ada di `docs/EFM_V2_Daftar_Halaman.md`.
