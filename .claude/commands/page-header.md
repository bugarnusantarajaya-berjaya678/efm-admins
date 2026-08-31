# Page Header Restructure

Restrukturisasi header halaman detail ke pola standar EFM V2 — single-row compact dengan identity di kiri dan action buttons + back button di kanan.

## Target

$ARGUMENTS

## Pola Standar EFM Page Header

Header halaman detail (Invoice, Receipt, Order, Lead, dll) menggunakan struktur ini:

```jsx
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
  <div className="flex items-center gap-2 flex-wrap">

    {/* Icon bulat — warna sesuai modul */}
    <div className="w-10 h-10 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
      <IconName size={16} className="text-white" />
    </div>

    {/* Identity — flex-1 agar mengisi ruang tersisa */}
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Subtitle / Label Modul</p>
      <h1 className="text-base font-bold text-[#1E1C43] leading-snug truncate">Judul Utama</h1>
      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
        <span className="text-xs text-gray-500">Info sekunder</span>
        <span className="text-gray-300 text-xs">·</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white {statusColor}">
          STATUS
        </span>
      </div>
    </div>

    {/* Action buttons — shrink-0, tersembunyi saat editing jika ada edit mode */}
    {!editing && (
      <>
        {/* Primary CTA — tombol hijau, paling kiri dari grup action */}
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#27AE60] hover:bg-[#1E8449] text-white text-xs font-semibold rounded-lg transition-colors shrink-0">
          <Icon size={13} /> Label
        </button>

        {/* Secondary actions — border style */}
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors shrink-0">
          <Icon size={13} /> Label
        </button>
      </>
    )}

    {/* Back button — selalu terlihat, paling kanan */}
    <button
      onClick={() => navigate('/path/back')}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors shrink-0">
      <ArrowLeft size={13} /> Label Kembali
    </button>

  </div>
</div>
```

## Aturan Pola Ini

**Layout:**
- Satu baris flex (`flex items-center gap-2 flex-wrap`) — tidak ada Row 1 / Row 2 terpisah
- `flex-wrap` memastikan tampilan mobile tetap benar tanpa horizontal scroll
- Identity section pakai `min-w-0 flex-1` agar menyusut saat ruang sempit
- Semua tombol pakai `shrink-0` agar tidak ikut menyusut

**Urutan elemen (kiri ke kanan):**
1. Icon bulat `w-10 h-10`
2. Identity section (subtitle + judul + status badge)
3. Action buttons (primary CTA → secondary actions)
4. Back button — **selalu paling kanan**

**Jika ada edit mode:**
- Action buttons disembunyikan saat `editing === true` (wrap dalam `{!editing && (...)}`
- Edit/Simpan/Batal TIDAK ada di header — itu tugas sticky footer (lihat `/sticky-footer`)
- Back button tetap selalu tampil meski sedang editing

**Status badge colors:**
```js
{ paid: 'bg-green-500', pending: 'bg-yellow-500', overdue: 'bg-red-500', draft: 'bg-gray-400', active: 'bg-blue-500' }
```

**Back button label:**
- Jika navigate ke Order Detail: `Order #${orderId}`
- Jika navigate ke list page: `Invoice` / `Receipt` / `Leads` dll (tanpa #)
- Selalu cek apakah ada `state?.fromOrderId` atau fallback ke list page

**WA dropdown (jika ada):**
```jsx
<div className="relative shrink-0">
  <button onClick={() => setShowWAMenu(p => !p)} className="... bg-[#25D366] ...">
    <MessageCircle size={13} /> Kirim WA <ChevronDown size={11} />
  </button>
  {showWAMenu && (
    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[160px]">
      {/* menu items */}
    </div>
  )}
</div>
```
Dropdown `absolute right-0` (bukan `left-0`) agar tidak keluar layar.

## Eksekusi

### Langkah 1 — Baca file target
Baca file yang disebutkan di $ARGUMENTS secara penuh sebelum menulis kode apapun.

### Langkah 2 — Identifikasi struktur header saat ini
- Berapa row yang ada sekarang?
- Tombol apa saja yang ada dan di mana posisinya?
- Apakah ada edit mode? Jika ya, apakah Simpan/Batal sudah di sticky footer atau masih di header?
- Back button navigate ke mana?

### Langkah 3 — Terapkan pola
Ganti seluruh blok header dengan struktur single-row di atas. Pertahankan semua logika tombol yang sudah ada (onClick, kondisi tampil, dll) — hanya ubah layout dan class-nya.

### Langkah 4 — Verifikasi & push
1. Jalankan `npm run build` di `REACT-APP/` — jangan laporkan selesai sebelum build hijau
2. Commit dengan pesan deskriptif
3. Push ke branch kerja aktif
4. Buat PR draft jika belum ada PR open untuk branch ini
5. Ambil Vercel preview URL dari komentar bot di PR, sertakan di laporan akhir
6. Tanya konfirmasi merge di akhir laporan
