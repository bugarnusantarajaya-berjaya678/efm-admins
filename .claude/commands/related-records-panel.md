# Related Records Panel

Ubah sebuah section di halaman detail menjadi **Related Records Panel** — tampilan ringkas berupa kartu-kartu linked record yang dapat diklik, menggantikan tabel atau section inline yang terlalu besar.

## Target

$ARGUMENTS

## Apa itu Related Records Panel

Pola ini digunakan ketika sebuah halaman detail menampilkan entitas terkait (invoice, receipt, order, dll) yang sudah punya halaman detailnya sendiri. Daripada menampilkan semua datanya inline (memakan ruang), cukup tampilkan kartu ringkas yang bisa diklik untuk navigate ke halaman detail masing-masing entitas.

**Kapan pakai pola ini:**
- Section menampilkan satu atau beberapa record terkait yang sudah punya dedicated detail page
- Field yang ditampilkan sudah tersedia di halaman tujuan — tidak perlu duplikat semua info di sini
- Section terasa "terlalu besar" relatif terhadap fungsinya

## Eksekusi

### Langkah 1 — Baca file target
Baca file halaman yang akan diubah secara penuh sebelum menulis kode apapun. Jika $ARGUMENTS menyebut file referensi/pattern, baca juga file itu.

### Langkah 2 — Identifikasi section
Tentukan dengan tepat:
- Section mana yang akan dikonversi (berdasarkan $ARGUMENTS atau tebak dari konteks)
- Data apa yang sudah tersedia (state, props, atau data store)
- Route navigate ke halaman detail record terkait (cek React Router config jika perlu)
- Apa yang harus dipertahankan di luar section ini

### Langkah 3 — Terapkan pola Related Records Panel

Struktur dasar satu kartu:

```jsx
<div
  onClick={() => navigate('/path/to/' + record.id, { state: { record } })}
  className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group"
>
  <div className="flex items-center gap-3 min-w-0">
    {/* Icon bulat kecil */}
    <div className="w-8 h-8 rounded-full bg-[#1E1C43]/10 flex items-center justify-center shrink-0">
      <IconName size={14} className="text-[#1E1C43]" />
    </div>
    {/* ID + info sekunder */}
    <div className="min-w-0">
      <p className="text-xs font-semibold text-[#1E1C43] truncate">{record.id}</p>
      <p className="text-[10px] text-gray-400 truncate">{record.infoSekunder}</p>
    </div>
  </div>
  <div className="flex items-center gap-2 shrink-0">
    {/* Status badge */}
    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border {statusColors}">
      {statusLabel}
    </span>
    <ExternalLink size={13} className="text-gray-300 group-hover:text-[#1E1C43] transition-colors" />
  </div>
</div>
```

**Wrapper section panel:**

```jsx
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
  {/* Section header */}
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-bold text-[#1E1C43] flex items-center gap-2">
      <IconName size={14} /> Label Section
    </h3>
    {/* Optional: tombol aksi (misal: Buat Invoice, Buat Receipt) */}
  </div>

  {/* Daftar kartu */}
  <div className="flex flex-col gap-2">
    {records.length === 0 ? (
      <p className="text-xs text-gray-400 text-center py-4">Belum ada record.</p>
    ) : (
      records.map(r => (
        <div key={r.id} onClick={...} className="...">
          {/* kartu per record */}
        </div>
      ))
    )}
  </div>
</div>
```

**Status color map (ikuti efm-design-standards):**
```js
const statusColors = {
  paid:    'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
  draft:   'bg-gray-50 text-gray-500 border-gray-200',
  active:  'bg-blue-50 text-blue-700 border-blue-200',
}
```

### Langkah 4 — Aturan tambahan

- Import `ExternalLink` dari lucide-react jika belum ada
- Jangan hapus state atau fungsi yang mungkin dipakai di tempat lain — cek referensinya dulu
- Jangan ubah section lain di luar target yang disebutkan di $ARGUMENTS
- Jika record terkait bisa lebih dari satu (misal: beberapa invoice per order), tampilkan semua dalam list; jika hanya satu, satu kartu saja sudah cukup
- Judul section gunakan `text-sm font-bold text-[#1E1C43]` dengan border-l-4 border-[#E05945] jika berada di dalam card yang lebih besar; tanpa border jika sudah dalam card tersendiri

### Langkah 5 — Verifikasi & push

1. Jalankan `npm run build` di dalam `REACT-APP/` — jangan laporkan selesai sebelum build hijau
2. Commit dengan pesan deskriptif
3. Push ke branch kerja aktif
4. Buat PR draft jika belum ada PR open untuk branch ini
5. Ambil Vercel preview URL dari komentar bot di PR, sertakan di laporan akhir
6. Tanya konfirmasi merge di akhir laporan
