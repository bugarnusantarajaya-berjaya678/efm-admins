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

Kalau ditemukan pola baru yang layak masuk skill (sesuai kriteria
yang sudah ada di skill ini), LANGSUNG update file skill terkait
sebagai bagian dari task yang sama - tidak perlu bertanya/
menunggu persetujuan dulu. Ini supaya skill selalu ikut
berkembang otomatis setiap ada pola baru, tanpa pengguna perlu
meminta secara eksplisit.

Setelah update skill dilakukan, tetap laporkan secara singkat di
akhir hasil kerja: "Skill diperbarui: [nama skill] -
[ringkasan perubahan]" - supaya pengguna tetap tahu apa yang
berubah, tapi TIDAK perlu approval sebelum perubahan itu di-commit.

Pengecualian: kalau perubahan yang diusulkan BERTENTANGAN dengan
skill yang sudah ada (bukan cuma nambah, tapi mengoreksi aturan
lama), tetap tanya dulu ke pengguna - karena ini berarti ada
keputusan lama yang mungkin perlu didiskusikan ulang, bukan
sekadar penambahan.

Kalau tidak ada pola baru yang ditemukan, cukup tulis di akhir
laporan: "**Skill check:** Tidak ada pola baru yang perlu
ditambahkan."

## Kriteria "Layak Ditambahkan" (Hindari Skill Membengkak)

Hanya update skill kalau pola tersebut:
- Kemungkinan besar akan dipakai lagi di modul/halaman lain 
  (bukan kasus one-off yang sangat spesifik untuk 1 halaman saja)
- Cukup konkret untuk dituliskan sebagai aturan/contoh kode, 
  bukan sekadar preferensi samar

Jangan update untuk hal yang terlalu spesifik/sekali pakai 
- ini akan membuat skill jadi bengkak dan kurang berguna sebagai 
referensi umum.

## Cara Melakukan Update

Edit file SKILL.md yang relevan langsung (bukan buat skill baru), 
tambahkan section/contoh baru di bagian yang sesuai, pertahankan 
format dan gaya penulisan yang sudah ada di file tersebut.

Setelah selesai commit dan push seperti biasa.
