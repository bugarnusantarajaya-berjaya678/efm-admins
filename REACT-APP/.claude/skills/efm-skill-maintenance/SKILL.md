---
name: efm-skill-maintenance
description: Rules for keeping the 3 EFM skills (efm-design-standards, 
efm-prompt-pattern, efm-component-patterns) up to date as the project 
evolves. MUST be checked at the END of every coding task, after the 
build passes, to evaluate whether the work just done introduced a 
new reusable pattern that should be captured. This prevents skills 
from going stale while new conventions silently accumulate 
uncaptured in the codebase.
---

# EFM V2 Skill Maintenance

Dijalankan di AKHIR setiap task, setelah build berhasil dan sebelum 
melaporkan selesai ke pengguna.

## Kapan Perlu Update Skill

Setelah menyelesaikan sebuah task, evaluasi:

1. **Pola visual/styling baru** yang dipakai lebih dari 1 kali dalam 
   task ini, dan belum ada di efm-design-standards → kandidat update 
   efm-design-standards

2. **Pola komponen kompleks baru** (bukan sekadar styling, tapi 
   struktur/logic yang kemungkinan akan dipakai lagi di halaman lain 
   - misal: pola dropdown dengan autofill, pola upload file, pola 
   kalkulasi tertentu) → kandidat update efm-component-patterns

3. **Keputusan arsitektur/konvensi baru** dari pengguna selama task 
   ini (misal: aturan baru soal chunking, konvensi penamaan baru) 
   → kandidat update efm-prompt-pattern

4. **Koreksi terhadap skill yang sudah ada** - kalau selama 
   mengerjakan task ternyata pengguna mengoreksi sesuatu yang 
   bertentangan dengan isi skill saat ini → skill yang ada SALAH 
   dan perlu direvisi, bukan cuma ditambah

## Cara Melapor ke Pengguna

Setelah build sukses dan sebelum menutup laporan hasil kerja, 
tambahkan section singkat:

"**Skill check:** [salah satu dari berikut]
- Tidak ada pola baru yang perlu ditambahkan ke skill.
- Ditemukan pola baru: [jelaskan singkat]. Rekomendasi: tambahkan 
  ke [nama skill] sebagai [ringkasan]. Mau saya update sekarang?"

JANGAN langsung mengedit file skill tanpa konfirmasi pengguna 
terlebih dahulu - selalu tawarkan dulu, karena skill adalah 
dokumen standar yang harus disengaja perubahannya, bukan otomatis.

## Kriteria "Layak Ditambahkan" (Hindari Skill Membengkak)

Hanya usulkan update skill kalau pola tersebut:
- Kemungkinan besar akan dipakai lagi di modul/halaman lain 
  (bukan kasus one-off yang sangat spesifik untuk 1 halaman saja)
- Cukup konkret untuk dituliskan sebagai aturan/contoh kode, 
  bukan sekadar preferensi samar

Jangan usulkan update untuk hal yang terlalu spesifik/sekali pakai 
- ini akan membuat skill jadi bengkak dan kurang berguna sebagai 
referensi umum.

## Setelah Pengguna Setuju Update

Edit file SKILL.md yang relevan langsung (bukan buat skill baru), 
tambahkan section/contoh baru di bagian yang sesuai, pertahankan 
format dan gaya penulisan yang sudah ada di file tersebut.

Setelah selesai commit dan push seperti biasa.
