# Sticky Footer

Tambahkan sticky footer dengan tombol Edit / Simpan Perubahan / Batal ke halaman yang memiliki edit mode.

## Target

$ARGUMENTS

## Pola Sticky Footer EFM

Sticky footer selalu `fixed` di bawah layar, di atas konten, mengikuti lebar layout dengan offset sidebar.

```jsx
{/* Sticky footer — Edit / Simpan / Batal */}
<div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 z-40">
  {editing ? (
    <>
      <button
        onClick={() => setEditing(false)}
        className="border border-gray-300 text-gray-600 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors">
        Batal
      </button>
      <button
        onClick={saveEdit}
        className="inline-flex items-center gap-1.5 bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors">
        <CheckCircle size={14} /> Simpan Perubahan
      </button>
    </>
  ) : (
    <button
      onClick={startEdit}
      className="inline-flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors">
      <Edit size={14} /> Edit [Nama Entitas]
    </button>
  )}
</div>
```

**Variasi dengan konteks info di kiri (untuk form panjang):**
```jsx
<div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-200 px-6 py-4 z-40">
  <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
    {/* Info konteks kiri — opsional */}
    <div className="hidden sm:block min-w-0">
      <p className="text-sm text-gray-700 font-semibold truncate">{judul}</p>
      <p className="text-xs text-gray-400 mt-0.5">Total: {formatRp(total)}</p>
    </div>
    {/* Tombol kanan */}
    <div className="flex items-center gap-3 ml-auto">
      <button onClick={() => setEditing(false)} className="border ...">Batal</button>
      <button onClick={saveEdit} className="bg-[#1E1C43] ...">Simpan Perubahan</button>
    </div>
  </div>
</div>
```
Gunakan variasi dengan konteks jika halaman memiliki total / ringkasan yang perlu ditampilkan saat scroll.

## Aturan

**Posisi dalam JSX:** letakkan sticky footer tepat sebelum `</div>` penutup return statement utama — setelah semua konten halaman, sebelum modal.

**Padding bawah wajib:** tambahkan `pb-24` ke wrapper div terluar (`<div className="flex flex-col gap-4 pb-24">`) agar konten tidak tertutup footer saat di-scroll ke bawah.

**Import yang dibutuhkan:** `CheckCircle`, `Edit` dari lucide-react — tambahkan ke import jika belum ada.

**State yang dibutuhkan:**
```js
const [editing, setEditing] = useState(false)
```
Jika belum ada, tambahkan. Jika sudah ada di halaman (dari edit mode yang sudah partial), pakai state yang sama — jangan buat duplikat.

**Tombol Edit di header:** jika sebelumnya ada tombol Edit di header/Row 2, hapus dari sana — sudah dipindah ke footer. Pastikan tidak ada duplikat.

**`md:left-64`:** ini adalah offset lebar sidebar EFM (256px = 64 * 4px). Jangan ubah nilai ini.

**z-index:** `z-40` — di bawah modal (`z-50`) tapi di atas semua konten halaman.

## Eksekusi

### Langkah 1 — Baca file target
Baca file yang disebutkan di $ARGUMENTS secara penuh. Identifikasi:
- Apakah sudah ada `editing` state? Jika ya, di mana?
- Apakah ada fungsi `startEdit()` dan `saveEdit()`? Jika belum, perlu dibuat.
- Apakah tombol Edit/Simpan/Batal sudah ada di tempat lain (header, Row 2)?
- Apakah wrapper div sudah punya `pb-24`?

### Langkah 2 — Terapkan
1. Tambah `pb-24` ke wrapper div terluar jika belum ada
2. Hapus tombol Edit/Simpan/Batal dari header/Row 2 jika ada di sana
3. Tambahkan sticky footer di akhir return statement
4. Pastikan import `CheckCircle` dan `Edit` tersedia

### Langkah 3 — Verifikasi & push
1. `npm run build` di `REACT-APP/` — build harus hijau sebelum lanjut
2. Commit + push ke branch kerja aktif
3. Buat PR draft jika belum ada PR open untuk branch ini
4. Ambil Vercel preview URL dari komentar bot di PR
5. Tanya konfirmasi merge di akhir laporan
