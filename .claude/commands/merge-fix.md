# Merge Fix

Selesaikan merge conflict yang muncul akibat squash merge ke main — pola berulang di project ini.

## Konteks

$ARGUMENTS

## Mengapa conflict ini terjadi

Project ini menggunakan squash merge ke main. Setiap PR di-squash menjadi satu commit di main, sehingga branch kerja (`claude/...`) kehilangan "kesamaan riwayat" dengan main setelah merge. PR berikutnya yang push ke branch yang sama akan selalu conflict di file yang disentuh sebelumnya — terutama di blok import dan state declarations yang terus bertambah antar PR.

## Langkah Penyelesaian

### Langkah 1 — Fetch & merge main
```bash
git fetch origin main
git merge origin/main
```

Jika tidak ada conflict → lanjut ke Langkah 4.
Jika ada conflict → lanjut ke Langkah 2.

### Langkah 2 — Identifikasi semua conflict markers
```bash
grep -rn "<<<<<<\|=======\|>>>>>>>" REACT-APP/src/
```

Catat semua file yang conflict.

### Langkah 3 — Resolve tiap conflict: **selalu keep HEAD**

Aturan utama: **HEAD adalah versi yang benar** — itu adalah akumulasi semua perubahan PR-PR sebelumnya di branch ini yang sudah valid dan sudah di-build. `origin/main` adalah versi lama (snapshot sebelum PR terakhir).

Untuk setiap conflict marker:
```
<<<<<<< HEAD
[ini yang kita pertahankan]
=======
[ini yang dibuang]
>>>>>>> origin/main
```

**Pengecualian — tanya dulu sebelum memilih:**
- Jika conflict terjadi di logika bisnis (kalkulasi, kondisi if/else, handler function) yang berbeda secara substansial antara HEAD dan origin/main — jangan asal pilih HEAD. Tampilkan kedua versi dan tanya mana yang benar.
- Jika conflict di import block tapi origin/main punya import yang HEAD tidak punya dan tidak ada di file manapun — mungkin import itu memang dibutuhkan. Periksa dulu sebelum membuang.

**Kasus umum yang selalu keep HEAD:**
- Import block (lucide-react, komponen, utils)
- State declarations (`useState`, `useRef`, dll)
- JSX struktur yang sudah direstrukturisasi di PR sebelumnya
- Fungsi handler yang sudah diupdate

### Langkah 4 — Verifikasi tidak ada sisa markers
```bash
grep -rn "<<<<<<\|=======\|>>>>>>>" REACT-APP/src/
```
Output harus kosong. Jika masih ada — resolve dulu sebelum lanjut.

### Langkah 5 — Build
```bash
cd REACT-APP && npm run build
```

Jika build gagal — **jangan push**. Analisis error, perbaiki, build ulang sampai hijau.

### Langkah 6 — Commit & push
```bash
git add [file yang conflict]
git commit -m "chore: resolve merge conflict with main, keep [deskripsi singkat perubahan HEAD]"
git push -u origin [nama-branch]
```

### Langkah 7 — Retry merge PR
Setelah push berhasil, coba merge PR via GitHub. Jika masih conflict (jarang terjadi), ulangi dari Langkah 1.

## Laporan Akhir

Sebutkan:
- File mana saja yang conflict
- Berapa conflict marker yang diselesaikan
- Apakah ada keputusan non-trivial (bukan sekedar keep HEAD) yang perlu dikonfirmasi

Jika merge PR berhasil setelah fix ini — konfirmasi dan sertakan link production.
