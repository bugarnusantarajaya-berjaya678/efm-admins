---
name: efm-component-patterns
description: Reusable, battle-tested UI component patterns for the EFM V2 (Essential Fitness Management) React admin dashboard project — covers the scrollable-body modal, photo preview popup, full invoice template structure, filterable activity log, pipeline/stage progress visual, the official List Page Template (Header + KPI cards + Filter bar + Table with pagination), the localStorage-backed Template Editor Container (Invoice + Agreement), and the Full-Page Form Pattern (Add/Edit) with its companion Module Store. MUST be checked before building any modal, image preview, invoice page, activity/history log, leads pipeline visual, list page, template editor, or add/edit form in this project — these patterns have been built multiple times before, so reuse them exactly rather than reinventing a new structure. Always consult this skill even if the request only vaguely resembles one of these patterns (e.g. "add a popup", "show a log of changes", "add a status stepper", "add a new list page", "add a template editor", "form untuk tambah/edit data").
---

# EFM V2 Component Patterns

Complex, recurring UI patterns for the EFM V2 project. Use these exact structures instead of designing new ones. Pairs with `efm-design-standards` (colors/fonts/sizes) and `efm-prompt-pattern` (workflow discipline) — check all three when relevant.

## 1. Modal with Scrollable Body

Used for: any detail modal where content may be long (leads detail, incident report detail, activity log detail, etc.)

```jsx
<div
  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  onClick={onClose}
>
  <div
    className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Header - fixed, never scrolls */}
    <div className="flex-shrink-0 p-4 border-b border-gray-200 flex items-center justify-between">
      <h3 className="text-base font-bold text-[#1E1C43]">Title</h3>
      <button onClick={onClose}><X size={20} /></button>
    </div>

    {/* Body - scrollable */}
    <div className="overflow-y-auto flex-1 p-4">
      {/* content here */}
    </div>

    {/* Footer - fixed, only if modal has action buttons */}
    <div className="flex-shrink-0 p-4 border-t border-gray-200 flex justify-end gap-2">
      <button>Batal</button>
      <button>Simpan</button>
    </div>
  </div>
</div>
```

**Rules**
- `max-w-md` is default; use `max-w-lg` or `max-w-2xl` for wider content (e.g. modals containing tables)
- `max-h-[90vh]` must never be removed — without it, tall content pushes the modal off-screen
- Clicking the outer overlay closes the modal; `e.stopPropagation()` on the inner container prevents accidental close when clicking inside
- Close via X button always in header, top-right

---

## 2. Photo Preview Popup

Used for: enlarging thumbnail photos (incident report photos, visit report photos, document scans). Separate from the modal pattern above — specifically for images.

**State (in parent component)**
```js
const [previewFoto, setPreviewFoto] = useState(null)
// shape: { src: string, nama: string, dariNomor?: string } | null
```

**Trigger (thumbnail click)**
```jsx
<img
  src={foto.src}
  onClick={() => setPreviewFoto(foto)}
  className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
/>
```

**Popup render (conditional, at root level of component)**
```jsx
{previewFoto && (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
    onClick={() => setPreviewFoto(null)}
  >
    <div className="relative max-w-3xl max-h-[90vh]">
      <img
        src={previewFoto.src}
        alt={previewFoto.nama}
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={() => setPreviewFoto(null)}
        className="absolute top-2 right-2 bg-black/50 rounded-full p-2 text-white hover:bg-black/70"
      >
        <X size={20} />
      </button>
      {previewFoto.nama && (
        <p className="text-white text-sm text-center mt-2">{previewFoto.nama}</p>
      )}
    </div>
  </div>
)}
```

**Rules**
- Always `z-[60]`, higher than the standard modal's `z-50`, since photo preview often opens from within a modal
- Click anywhere outside the image closes it; click ON the image does NOT close it (`stopPropagation`)
- Keep `previewFoto` as separate state — never nest it inside the underlying modal's own state, so it persists correctly even if the modal changes

---

## 3. Invoice Template Structure

Used for: full invoice pages (PPInvoicePage, B2BInvoicePage, EventInvoicePage) — the complete document layout.

**Structure (top to bottom)**

1. **Header bar** (page-level, not part of the document) — breadcrumb (e.g. "PP > Invoice"), title "Invoice #INV-PP-26-0011", subtitle (program/module + client name), action row: Edit Invoice | Download PDF | Konfirmasi Pembayaran (or status-appropriate action)

2. **Document header** (navy card): `bg-[#1E1C43] rounded-xl p-6 text-white grid grid-cols-2`
   - Left: EFM logo + company name + address + email
   - Right: "INVOICE" in `text-4xl font-black`, invoice number, Tanggal, Jatuh Tempo, Order ID (`#` prefix), status badge — use lighter variants on the dark bg for contrast (e.g. `bg-yellow-400 text-yellow-900`)

3. **Tagihan Kepada** (billing info) — client/company name (`text-lg font-bold`); B2B adds NPWP + PIC name/jabatan; PP shows client name + program name; Order ID reference

4. **Rincian Layanan** (line items table), columns vary by module:
   - PP: Deskripsi | Harga Per Sesi | Jumlah Sesi | Harga Paket | Diskon Paket | Total
   - B2B/Event: Deskripsi | Jumlah | Satuan | Harga Satuan | Total
   - Plain table, no heavy styling, `border-b` between rows

5. **Kalkulasi** (calculation section)
   - Subtotal
   - Kode Diskon (PP only — input + apply button in edit mode, shows applied discount name/amount in read mode)
   - Management Fee toggle (B2B only — percentage input)
   - Custom Pajak list (B2B only — add/remove rows, each with name, percentage, +/- type for additions vs deductions like PPh23)
   - PPN toggle (all modules — checkbox + percentage, default 11%)
   - TOTAL TAGIHAN — navy box, large bold, right-aligned amount in accent orange or white depending on background

6. **Catatan** — label + text (textarea in edit mode); shows "Tidak ada catatan" italic gray if empty

7. **Syarat & Ketentuan** — numbered list (read mode); edit mode: each line becomes an input with a remove (X) button, plus "+ Tambah Baris" at the bottom; default starter terms vary slightly by module (payment deadline days, late fee %, cancellation notice period)

8. **Footer** — centered gray text: "Dokumen ini digenerate oleh sistem EFM V2"

**Document header (navy) — 2-column layout fix**
- Gunakan `display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'` TANPA `flexWrap: 'wrap'`
- Sisi kiri (logo + info perusahaan): `flex: 1, minWidth: 0` agar bisa shrink saat alamat panjang
- Text content di dalam sisi kiri: tambah `minWidth: 0` agar teks bisa wrap, tidak overflow
- Sisi kanan (No. Dokumen / label): `flexShrink: 0, paddingLeft: 16, textAlign: 'right'`
- Font No. Dokumen: `fontSize: 11` (bukan 13 — teks dokumen panjang seperti `AGR-PP-26-0008/EFM/IX/2026` membutuhkan ukuran lebih kecil)
- JANGAN gunakan `flexWrap: 'wrap'` — menyebabkan blok kanan turun ke baris baru di container sempit

```jsx
// Correct pattern — navy header 2-column
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
    {/* logo */}
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{cs.namaPerusahaan}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)' }}>{cs.namaLegal}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)' }}>{cs.alamat}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)' }}>{cs.email}</div>
    </div>
  </div>
  <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 16 }}>
    <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>No. Dokumen</div>
    <div style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{docNomor(...)}</div>
  </div>
</div>
```

**Agreement TTD (Tanda Tangan Para Pihak) section**
- Layout: `grid grid-cols-2 gap-5` — 2 kolom berdampingan
- Setiap kolom: `text-center`
- Label role dibuat 2 baris terpisah (tanpa em-dash): baris 1 = "Pihak Pertama" (muted uppercase), baris 2 = "EFM" atau "Klien" (navy bold)
- Judul seksi "Tanda Tangan Para Pihak": `text-center` wajib, `uppercase tracking-wide`
- Isi poin pasal (legal body text): gunakan `text-justify` agar teks rata kiri kanan, sisi kanan tidak menggantung

```jsx
// Correct pattern — TTD section
<div className="text-[11px] font-bold text-[#1E1C43] uppercase tracking-wide mb-4 text-center">Tanda Tangan Para Pihak</div>
<div className="grid grid-cols-2 gap-5">
  <div className="text-center">
    <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-0.5">Pihak Pertama</div>
    <div className="text-[10px] font-bold text-[#1E1C43] mb-2">EFM</div>
    {/* signature box */}
    <div className="text-[11px] text-[#1E1C43] font-semibold">{namaPenandatangan}</div>
    <div className="text-[10px] text-text-muted">{jabatan}</div>
  </div>
  <div className="text-center">
    <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-0.5">Pihak Kedua</div>
    <div className="text-[10px] font-bold text-[#1E1C43] mb-2">Klien</div>
    {/* ClientSig component */}
    <div className="text-[11px] text-[#1E1C43] font-semibold">{namaKlien}</div>
  </div>
</div>
```

**Edit mode behavior (PP module — di Order Detail, bukan di Invoice Detail)**
- PP Invoice Detail adalah **read-only** — tidak ada tombol "Edit Invoice" di halaman detail invoice
- Edit fields (Tanggal Invoice, Jatuh Tempo, Kode Diskon, Catatan) ada di tab "Kontrak & Keuangan" di PPOrderDetailPage, dalam section "Invoice & Pembayaran Klien"
- Klik "Edit Invoice" di Order Detail → fields jadi editable (date input, textarea, kode diskon input)
- Jatuh Tempo: minimum H+2 dari Tanggal Invoice, default auto-set T+14 saat Tanggal berubah
- Syarat & Ketentuan di Invoice Detail dibaca dari localStorage (`efmInvoiceTemplate`) — dikelola via Template Editor di PPInvoicePage (lihat Section 12)
- B2B/Event: Invoice Detail masih punya edit mode lengkap (termasuk PPN, pajak kustom, management fee)

---

**Body section card container (PP Invoice Detail — aturan wajib)**

Setiap section body Invoice Detail (Tagihan Kepada, Rincian Layanan, Catatan, Syarat & Ketentuan, Cara Pembayaran) **harus dibungkus card container**:

```jsx
<div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
  {/* konten section */}
</div>
```

Section label di atas card container:
```jsx
<p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Nama Section</p>
```

Jangan biarkan konten section float tanpa container — semua section pakai pattern ini, bukan border-t biasa.

---

**Cara Pembayaran — aturan font wajib**

⚠️ DILARANG `font-mono` di seluruh project ini — semua teks wajib Poppins.

| Elemen | Class wajib |
|---|---|
| Label bank (`Transfer BCA`) | `text-[10px] font-semibold text-gray-400 uppercase tracking-wide` |
| Nomor rekening | `text-sm font-semibold text-[#1E1C43]` — BUKAN font-mono, BUKAN font-bold |
| Nama pemilik (`a.n. ...`) | `text-xs text-gray-500` — BUKAN text-[11px] |

```jsx
<p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Transfer {bank}</p>
<p className="text-sm font-semibold text-[#1E1C43]">{noRek}</p>
<p className="text-xs text-gray-500 mt-0.5">a.n. {namaRek}</p>
```

---

**Rincian Layanan table — kolom proporsional dengan tuple array**

Gunakan array `[label, width]` (bukan array string biasa) agar lebar kolom bisa di-set per-header tanpa inline style terpisah. Tambahkan `tableLayout: 'fixed'` pada `<table>` supaya width persen benar-benar diterapkan:

```jsx
// PP: Deskripsi lebih lebar (32%), kolom angka lebih kecil
{[
  ['Deskripsi',    '32%'],
  ['Harga Persesi','15%'],
  ['Jumlah Sesi',  '10%'],
  ['Harga Paket',  '16%'],
  ['Diskon Paket', '14%'],
  ['Total',        '13%'],
].map(([h, w], i) => (
  <th
    key={h}
    style={{ textAlign: i === 0 ? 'left' : 'right', width: w }}
    className="px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"
  >
    {h}
  </th>
))}
```

```jsx
<table className="w-full" style={{ tableLayout: 'fixed' }}>
```

Aturan: Deskripsi selalu `text-left`, kolom angka `text-right`. Jangan biarkan Deskripsi terlalu sempit — alokasikan minimal 30–32% lebar tabel.

---

**Promo / Kode sistem — dua tipe berbeda**

PP Invoice Detail mendukung dua tipe promo yang BERBEDA secara fundamental:

| Tipe | `tipe` field | Effect harga | Visual (edit mode) | Visual (read mode) |
|---|---|---|---|---|
| **Diskon** | `'diskon'` | subTipe `persen` atau `nominal` → potong harga | Bubble hijau + nilai potongan | Baris di kalkulasi: `- Rp X.XXX` |
| **Bonus** | `'bonus'` | Selalu Rp 0 (tidak mempengaruhi harga) | Bubble biru + keterangan | Gift icon di bawah subtotal |

**Store:** `ppPromoStore.js` — `getPromoByKode(kode)` mengembalikan record promo. Field kunci: `{ kode, label, tipe, subTipe, nilai, aktif, keterangan }`.

**Fungsi kalkulasi (wajib):**
```js
function calcDiskonVal(applied, base) {
  if (!applied || applied.tipe !== 'diskon') return 0  // bonus selalu 0
  return applied.subTipe === 'persen'
    ? Math.round(base * applied.nilai / 100)
    : applied.nilai
}
```

**Edit mode — bubble diskon (hijau):**
```jsx
<div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
  <div>
    <span className="text-xs font-semibold text-green-700">{kode}</span>
    <span className="text-xs text-green-600 ml-2">— {label}</span>
    <span className="text-xs font-bold text-green-700 ml-2">- {formatRp(diskonVal)}</span>
  </div>
  <button onClick={removeKode}><X size={14} className="text-green-500" /></button>
</div>
```

**Edit mode — bubble bonus (biru):**
```jsx
<div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
  <div>
    <span className="text-xs font-semibold text-blue-700">{kode}</span>
    <span className="text-xs text-blue-600 ml-2">— {label}</span>
    {keterangan && <p className="text-[10px] text-blue-500 mt-0.5">{keterangan}</p>}
  </div>
  <button onClick={removeKode}><X size={14} className="text-blue-400" /></button>
</div>
```

**Read mode — bonus display (di bawah subtotal, bukan di baris kalkulasi):**
```jsx
{invoice.promoKode && ['treatment','latihan','produk'].includes(invoice.promoType) && (() => {
  const p = getPromoByKode(invoice.promoKode)
  return (
    <div className="flex items-start gap-2 py-2 border-t border-gray-100 mt-1">
      <Gift size={13} className="text-blue-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-blue-700">{p?.label || invoice.promoKode}</p>
        {p?.keterangan && <p className="text-[10px] text-blue-500 mt-0.5">{p.keterangan}</p>}
      </div>
    </div>
  )
})()}
```

**Input kode (default state saat belum ada kode):**
```jsx
<div className="flex gap-2">
  <input
    placeholder="Masukkan kode voucher atau bonus"
    className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1E1C43]"
  />
  <button className="px-3 py-2 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold">
    Terapkan
  </button>
</div>
```

---

## 4. Activity Log Pattern (Filterable, Appendable)

Used for: Log Aktivitas sections (Order detail, Leads detail, Operasional Lapangan)

**State**
```js
const [logList, setLogList] = useState([
  {
    id: 'LOG-0001',
    timestamp: '2026-06-15T09:30:00',
    actor: 'Bagoes S.',
    action: 'Mengubah status order menjadi Aktif',
    category: 'status' // status | payment | schedule | note | incident
  },
])
```

**Filter bar** (above the log list): dropdown or pill toggles for category — "Semua | Status | Pembayaran | Jadwal | Catatan"

**Log item render**
```jsx
<div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
  <div className="w-2 h-2 rounded-full bg-[#E05945] mt-1.5 flex-shrink-0" />
  <div className="flex-1">
    <p className="text-sm text-gray-700">{log.action}</p>
    <p className="text-xs text-gray-400 mt-0.5">
      {log.actor} · {formatDate(log.timestamp)}
    </p>
  </div>
</div>
```

**Appending new log entries**
- When an action happens elsewhere on the same page (status change, payment confirmation, schedule edit), append to the SAME `logList` via `setLogList(prev => [...prev, newEntry])` — never create a separate mini-log per section/card
- `logList` state must live at the page/component level (not nested inside a specific card) so any part of the page can push to it
- Entries are appended; the list displays newest-first by sorting on render, not by `unshift`

**Rule learned from this project:** do NOT create a mini activity log per individual card/item (e.g. a separate small log inside each incident report card) — always consolidate into ONE shared log per page, filterable by category. Multiple mini-logs fragment the audit trail and were removed in a past revision.

**In-page action integration pattern (append dari aksi lain di halaman yang sama)**

Ketika sebuah tombol "Simpan" di luar section Log Aktivitas menyimpan perubahan data, tambahkan juga append ke `logAktivitas` di dalam handler yang sama — JANGAN hanya `showToast`:

```js
// Di dalam handleSimpan / onClick Simpan:
const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
setLead(prev => ({
  ...prev,
  // ...perubahan data lainnya,
  logAktivitas: [
    ...(prev.logAktivitas || []),
    {
      status: 'Edit Data',
      tanggal: today,
      oleh: lead.picEfm || 'Admin EFM',
      catatan: 'Deskripsi aksi yang dilakukan (mis. "Profil klien Ahmad diperbarui")'
    }
  ]
}))
```

**Aksi yang WAJIB terintegrasi ke logAktivitas:**
- Edit Profil Klien → simpan → append `"Profil klien [nama] diperbarui"`
- Edit Informasi Kesehatan → simpan → append `"Informasi kesehatan klien [nama] diperbarui"`
- Tambah Klien (modal) → simpan → append `"Klien baru ditambahkan: [nama]"`
- Update status pipeline → sudah otomatis via `handleUpdatePipeline`

**Catatan penting:** `waLog` (Tab WA) adalah state TERPISAH dari `logAktivitas` (Tab Riwayat Aktivitas) — jangan merge keduanya. WA log hanya mencatat pesan WA yang dikirim, bukan aksi edit data.

---

## 5. Pipeline / Stage Progress Visual

Used for: Leads pipeline visualization (PP, B2B, Event leads pages and dashboards)

```jsx
const stages = ['New', 'Approach', 'Screening', 'Invoicing', 'Closing', 'Convert'] // PP example - stages differ per module

<div className="flex items-center">
  {stages.map((stage, idx) => {
    const isCompleted = idx < currentStageIndex
    const isCurrent = idx === currentStageIndex
    return (
      <div key={stage} className="flex items-center flex-1">
        <div className="flex flex-col items-center flex-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
            ${isCompleted ? 'bg-[#1E1C43] text-white' :
              isCurrent ? 'bg-[#E05945] text-white' :
              'bg-gray-200 text-gray-400'}`}>
            {isCompleted ? '✓' : idx + 1}
          </div>
          <p className={`text-xs mt-1 text-center
            ${isCurrent ? 'font-semibold text-[#1E1C43]' : 'text-gray-400'}`}>
            {stage}
          </p>
        </div>
        {idx < stages.length - 1 && (
          <div className={`h-0.5 flex-1 -mt-4
            ${isCompleted ? 'bg-[#1E1C43]' : 'bg-gray-200'}`} />
        )}
      </div>
    )
  })}
</div>
```

**Rules**
- Completed stages: navy filled circle with checkmark
- Current stage: accent orange filled circle with number, bold label
- Upcoming stages: gray outline circle with number, gray label
- Connecting line: navy if the stage before it is completed, gray otherwise
- "Lost" stage (if applicable) is NOT part of the linear pipeline — render separately as a red badge/indicator, since a lead can exit the pipeline at any stage rather than progressing linearly to Lost

---

## 6. List Page Template (Header + KPI + Filter + Table)

> **⚠️ WAJIB DIIKUTI: SEMUA halaman list (Leads, Screening, Orders, Invoice, Receipt, Agreement — di modul PP, B2B, maupun Event) HARUS mengikuti struktur ini persis. Jangan improvisasi struktur baru untuk halaman list.**

Sumber resmi: `PPInvoicePage.jsx` dan `PPReceiptPage.jsx` — keduanya telah dikonfirmasi sebagai standar tampilan List Page seluruh project (verified 2026-08-19).

---

### Struktur keseluruhan (urutan wajib)

```jsx
<div className="flex flex-col gap-4">
  {/* 1. Page Header */}
  {/* 2. KPI Card Row */}
  {/* 3. Filter Bar */}
  {/* 4. Table */}
</div>
```

---

### 1. Page Header

Tanpa action button (halaman yang hanya menampilkan list):
```jsx
<div>
  <h1 className="text-2xl font-bold text-text-primary">Judul Halaman</h1>
  <p className="text-sm text-text-muted mt-1">Deskripsi singkat halaman</p>
</div>
```

Dengan action button di kanan atas (misalnya "Tambah" atau "Buat Baru"):
```jsx
<div className="flex items-start justify-between">
  <div>
    <h1 className="text-2xl font-bold text-text-primary">Judul Halaman</h1>
    <p className="text-sm text-text-muted mt-1">Deskripsi singkat halaman</p>
  </div>
  <div className="flex items-center gap-2.5 shrink-0">
    {/* Tombol aksi utama (navy) */}
    <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-[#1E1C43] hover:bg-[#2d2b5e] transition-colors">
      <Plus size={15} strokeWidth={2.5} /> Tambah Data
    </button>
  </div>
</div>
```

**Catatan breadcrumb:** Breadcrumb ("Private Program > Invoice") ditampilkan oleh Topbar secara otomatis — JANGAN tambahkan breadcrumb manual di dalam page content.

---

### 2. KPI Card Row

Grid wrapper:
```jsx
<div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
  <StatMini label="Total Invoice"  value={invoices.length} sub="Bulan ini" />
  <StatMini label="Belum Dibayar"  value={pendingCount}    sub="Perlu follow up"     accent="orange" />
  <StatMini label="Paid"           value={paidCount}       sub="Terbayar"            accent="green" />
  <StatMini label="Overdue"        value={overdueCount}    sub="Lewat jatuh tempo"   accent="red" />
</div>
```

Komponen `StatMini` (definisikan di atas component utama, copy persis):
```jsx
function StatMini({ label, value, sub, accent }) {
  const bCls = {
    orange: 'border-accent',
    green:  'border-success',
    red:    'border-danger',
    yellow: 'border-warning',
    blue:   'border-blue-400',
  }[accent] || 'border-border'
  const vCls = {
    orange: 'text-accent',
    green:  'text-success',
    red:    'text-danger',
    yellow: 'text-warning',
    blue:   'text-blue-600',
  }[accent] || 'text-text-primary'
  return (
    <div className={`bg-bg-surface rounded-xl border-[1.5px] ${bCls} px-4 py-3`}>
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${vCls}`}>{value}</div>
      {sub && <div className="text-[11px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  )
}
```

**Aturan KPI card:**
- Container: `bg-bg-surface rounded-xl border-[1.5px] [border-token] px-4 py-3` — border penuh semua sisi, bukan hanya border-t
- Label: `text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1` (di ATAS angka)
- Angka: `text-xl font-bold [text-token]` — BUKAN `text-2xl` atau `text-[28px]`
- Card pertama (Total/netral): tidak ada prop `accent` → border dan angka menggunakan token netral (`border-border`, `text-text-primary`)
- Mapping warna: `orange` → accent (merah-oranye EFM), `green` → success, `red` → danger, `yellow` → warning, `blue` → `border-blue-400 text-blue-600`

---

### 3. Filter Bar

```jsx
<div className="bg-bg-surface border border-border rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
  {/* Dropdown 1 — misal: Bulan */}
  <select
    className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors"
    value={fBulan} onChange={e => { setFBulan(e.target.value); setPage(1) }}
  >
    <option value="">Semua Bulan</option>
    {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map(b => <option key={b}>{b}</option>)}
  </select>

  {/* Dropdown 2 — misal: Tahun */}
  <select
    className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors"
    value={fTahun} onChange={e => { setFTahun(e.target.value); setPage(1) }}
  >
    <option value="">Semua Tahun</option>
    <option value="2025">2025</option>
    <option value="2026">2026</option>
  </select>

  {/* Dropdown 3 — misal: Status */}
  <select
    className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors"
    value={fStatus} onChange={e => { setFStatus(e.target.value); setPage(1) }}
  >
    <option value="">Semua Status</option>
    <option value="paid">Paid</option>
    <option value="pending">Awaiting Payment</option>
  </select>

  {/* Search — selalu paling kanan sebelum Reset, mengambil sisa lebar */}
  <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-bg-page border-[1.5px] border-border rounded-lg px-3 py-[7px] focus-within:border-primary focus-within:bg-white transition-colors">
    <Search size={14} className="text-text-muted shrink-0" />
    <input
      className="border-none bg-transparent text-xs outline-none w-full text-text-primary placeholder:text-text-muted"
      placeholder="Cari nama klien atau nomor dokumen..."
      value={fSearch}
      onChange={e => { setFSearch(e.target.value); setPage(1) }}
    />
  </div>

  {/* Reset — NAVY SOLID, bukan abu-abu, bukan merah */}
  <button
    onClick={reset}
    className="px-3.5 py-[7px] bg-primary hover:bg-primary-2 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
  >
    Reset
  </button>
</div>
```

**Aturan Filter Bar:**
- Container: `bg-bg-surface border border-border rounded-xl` — BUKAN `bg-white shadow-sm`
- Urutan elemen: [dropdown 1] [dropdown 2] [dropdown 3 (opsional)] [search] [reset]
- Semua dropdown: `border-[1.5px] border-border`, bukan `border border-gray-200`
- Search container: mengambil sisa lebar dengan `flex-1`; pada fokus, border berubah ke `border-primary` dan background ke `bg-white`
- Reset button: **WAJIB navy solid** (`bg-primary text-white`). Jangan gunakan `border border-gray-300 text-gray-600` (abu-abu) atau warna lain

---

### 4. Table

```jsx
<div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-sm" style={{ minWidth: '1100px' }}>
      <thead>
        <tr className="bg-gray-50 border-b border-gray-100">
          <th style={{minWidth:'160px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
            No. Dokumen
          </th>
          <th style={{minWidth:'140px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
            Nama Klien
          </th>
          {/* kolom lain... */}
          <th style={{minWidth:'100px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
            Aksi
          </th>
        </tr>
      </thead>
      <tbody>
        {slice.map(item => (
          <tr key={item.id} onClick={() => handleOpenDetail(item)}
            className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer">

            {/* ID column */}
            <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">
              {item.id}
            </td>

            {/* Nama column — dengan avatar */}
            <td className="px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: item.color }}
                >
                  {item.initials}
                </div>
                <span className="text-xs font-medium text-gray-900">{item.nama}</span>
              </div>
            </td>

            {/* Data teks biasa */}
            <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">
              {item.paket}
            </td>

            {/* Data angka/amount */}
            <td className="text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap">
              {formatRp(item.total)}
            </td>

            {/* Badge */}
            <td className="px-3 py-2.5">
              <StatusBadge status={item.status} />
            </td>

            {/* Kolom Aksi */}
            <td className="px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                {/* Tombol Lihat Detail (biru) */}
                <button
                  onClick={e => { e.stopPropagation(); handleOpenDetail(item) }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#2980B9] border border-[#2980B9] bg-[#EBF5FB] hover:bg-[#2980B9] hover:text-white transition-colors"
                  title="Lihat Detail"
                >
                  <Eye size={13} />
                </button>
                {/* Tombol aksi kedua (misal kirim WA, hijau) — opsional */}
                <button
                  onClick={e => { e.stopPropagation(); handleSecondaryAction(item) }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#27AE60] border border-[#27AE60] bg-[#EAFAF1] hover:bg-[#27AE60] hover:text-white transition-colors"
                  title="Aksi Kedua"
                >
                  <SomeIcon size={13} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Table footer: count + pagination */}
  <div className="px-4 py-3 border-t border-border flex items-center justify-between">
    <span className="text-xs text-text-muted">
      Menampilkan {start}–{end} dari {filtered.length} data
    </span>
    <div className="flex items-center gap-1.5">
      <PBtn onClick={() => setPage(p => Math.max(1, p - 1))}>‹</PBtn>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
        <PBtn key={n} active={n === page} onClick={() => setPage(n)}>{n}</PBtn>
      ))}
      <PBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</PBtn>
    </div>
  </div>
</div>
```

Komponen `PBtn` untuk pagination (definisikan bersama StatMini):
```jsx
function PBtn({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center border transition-colors
        ${active
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-text-muted border-border hover:border-primary hover:text-primary'
        }`}
    >
      {children}
    </button>
  )
}
```

**Aturan Table:**
- Outer wrapper: `bg-bg-surface border border-border rounded-xl overflow-hidden` — BUKAN `bg-white rounded-2xl shadow-sm`
- Semua padding cell (header & body): `px-3 py-2.5` — BUKAN `px-4 py-3`
- Header: semua `text-left`, ukuran `text-[10px] font-semibold text-gray-500 uppercase tracking-wider`
- ID column: `text-xs font-semibold text-[#1E1C43] whitespace-nowrap` — SEMUA kolom ID wajib semibold navy (No. Invoice, No. Receipt, No. Agreement, Order ID, Lead ID, dll). Jangan `font-normal` atau `font-medium`
- Avatar: `w-7 h-7 rounded-full`, font `text-[10px] font-bold` — BUKAN `w-8 h-8` atau font lebih besar
- Nama di samping avatar: `text-xs font-medium text-gray-900`
- Data teks biasa: `text-xs font-normal text-gray-600`
- Angka/amount: `text-xs font-semibold text-gray-600`
- Tombol aksi: ukuran `w-7 h-7`, icon `size={13}` — bukan `size={14}` atau lebih besar
- Selalu `e.stopPropagation()` pada tombol aksi untuk mencegah trigger klik baris
- Footer pagination: `px-4 py-3 border-t border-border`
- Lebar kolom minimum: lihat tabel standar di `efm-design-standards` Section 3a — wajib ikuti nilai yang sudah ditetapkan supaya lebar Nama Klien/Tanggal/PIC konsisten antar halaman

---

### Sort Newest-First (Wajib di semua halaman list)

Semua halaman list harus menampilkan data **terbaru di atas** (ID terbesar = paling baru). Terapkan `.sort()` di dalam `useMemo`, dirantai setelah `.filter()`:

```js
const filtered = useMemo(() => {
  return data
    .filter(item => { /* filter logic */ })
    .sort((a, b) => parseInt(b.id.split('-')[N]) - parseInt(a.id.split('-')[N]))
}, [data, ...deps])
```

**Index `N` sesuai format ID:**

| Format ID | Contoh | Split index N |
|---|---|---|
| `LP-0001` (Lead PP) | `LP-0001` | `[1]` |
| `LB-0001` (Lead B2B) | `LB-0001` | `[1]` |
| `LE-0001` (Lead Event) | `LE-0001` | `[1]` |
| `SCR-26-0001` (Screening) | `SCR-26-0001` | `[2]` |
| `SVY-26-0001` (Survey B2B) | `SVY-26-0001` | `[2]` |
| `KNS-26-0001` (Konsultasi Event) | `KNS-26-0001` | `[2]` |
| `PP-26-0001` (Order PP) | `PP-26-0001` | `[2]` |
| `B2B-26-0001` (Order B2B) | `B2B-26-0001` | `[2]` |
| `EV-26-0001` (Order Event) | `EV-26-0001` | `[2]` |
| `INV-PP-26-0001` (Invoice PP) | `INV-PP-26-0001` | `[3]` |
| `INV-B2B-26-0001` (Invoice B2B) | `INV-B2B-26-0001` | `[3]` |
| `INV-EV-26-0001` (Invoice Event) | `INV-EV-26-0001` | `[3]` |
| `RCP-PP-26-0001` (Receipt PP) | `RCP-PP-26-0001` | `[3]` |
| `AGR-PP-26-0001` (Agreement PP) | `AGR-PP-26-0001` | `[3]` |
| Variasi lain (segment terakhir) | `PRG-PP-001` | `.pop()` |

**Untuk format non-standar**, gunakan `.split('-').pop()` sebagai fallback aman:
```js
.sort((a, b) => parseInt(b.id.split('-').pop()) - parseInt(a.id.split('-').pop()))
```

---

## 7. Tab / Card Header Action Button Pattern

Used for: tombol aksi utama (Tambah, Buat, Edit, Update) di dalam tab atau card — berlaku di semua halaman detail (Lead Detail, Order Detail, dll.)

### Aturan posisi

**Tombol aksi utama selalu di header kanan atas** tab/card, bukan di dalam body atau hanya di empty state. Ini memastikan tombol selalu terlihat terlepas dari kondisi list (kosong maupun sudah ada data).

```jsx
{/* Header dengan action button */}
<div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
  <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Judul Section</h3>
  {!isEditingState && (
    <button
      onClick={handleAction}
      className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
      <Plus size={13} /> Label Tombol
    </button>
  )}
</div>
```

### Style wajib untuk tombol aksi di header

| Tipe | Kelas Tailwind |
|---|---|
| Primary action (Buat, Tambah, Update) | `h-8 px-3 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors` |
| Edit mode (Simpan) | `h-8 px-3 rounded-lg bg-[#1E1C43] hover:opacity-90 text-white text-xs font-semibold transition-opacity` |
| Edit mode (Batal) | `h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors` |

### Aturan conditional

- Saat `editingState` aktif → **sembunyikan** tombol primary; tampilkan Simpan + Batal sebagai gantinya
- Empty state (list kosong) → **jangan** taruh tombol di dalam empty state container jika tombol sudah ada di header; cukup tampilkan teks informatif saja
- Saat state berubah (misal selesai save) → sembunyikan form inline dan kembalikan tombol primary di header

```jsx
{/* Empty state — tanpa tombol jika tombol sudah di header */}
{items.length === 0 && (
  <div className="flex flex-col items-center justify-center py-10 gap-3">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
      <ClipboardList size={22} className="text-gray-400" />
    </div>
    <p className="text-sm text-gray-500 font-medium">Belum ada data</p>
    <p className="text-xs text-gray-400">Klik tombol di atas untuk menambahkan</p>
  </div>
)}
```

**Contoh implementasi nyata:** Tab Kesehatan dan tab Pipeline di `PPLeadDetailPage.jsx`

---

## 8. Sub-page Navigation dengan State Passing

Used for: halaman form panjang/kompleks yang dibuka dari parent detail page (contoh: Fitness Assessment dari Lead Detail, Order Detail dari list). Pola ini menggantikan modal ketika konten terlalu panjang untuk popup.

### Kapan pakai sub-page (bukan modal)

- Form memiliki lebih dari ~3 section besar ATAU estimasi output >2 scroll panjang
- Ada TES AWAL / TES AKHIR columns, tabel, atau konten yang butuh banyak ruang horizontal
- User perlu melihat semua bagian form sekaligus tanpa scroll di dalam modal

### Navigasi ke sub-page (dari parent)

Sub-page bisa dibuka dari 2 konteks: Lead Detail atau Order Detail. Keduanya memakai state berbeda.

```jsx
// Dari Lead Detail
navigate('/pp/screening/new', {
  state: { leadId: lead.id, namaKlien: lead.nama, picEfm: lead.picEfm }
})

// Dari Order Detail (untuk form yang terhubung ke order — auto-fill + lock fields)
navigate('/pp/screening/new', {
  state: { fromOrderId: order.id }
})

// Klik item existing — WAJIB pass leadId dalam state supaya handleBack di sub-page
// bisa kembali ke tab yang benar, bukan ke list umum:
navigate('/pp/screening/' + scr.id, { state: { leadId: lead.id } })
```

### Sub-page: baca context dari state

```jsx
// Sub-page (misal PPFitnessAssessmentPage.jsx)
const { id } = useParams()
const { state } = useLocation()

const isNew       = id === 'new'
const leadId      = state?.leadId || null
const fromOrderId = state?.fromOrderId || null  // dibuka dari order detail
const namaKlien   = state?.namaKlien || ''

const [isEditing, setIsEditing] = useState(isNew)
// isNew → langsung edit mode; existing record → read-only dulu
```

### Read-only mode (existing records)

Bungkus seluruh konten form (antara header dan footer) dengan wrapper yang disable semua interaksi saat tidak dalam mode edit:

```jsx
<div className={!isEditing ? 'pointer-events-none select-none opacity-80' : ''}>
  {/* semua field form di sini */}
</div>
```

- `pointer-events-none` → semua click/focus diabaikan
- `select-none` → teks tidak bisa di-highlight
- `opacity-80` → visual cue bahwa ini read-only mode
- Jangan tambahkan `disabled` satu per satu ke tiap field — gunakan wrapper ini sebagai gantinya
- **Pengecualian:** jika form punya field auto-fill dari order yang harus dikunci BAHKAN saat editing, gunakan Section 11 (per-field locking) BUKAN wrapper ini

### handleBack — navigasi balik dengan konteks

```jsx
const handleBack = () => {
  if (fromOrderId) {
    navigate(`/pp/orders/${fromOrderId}`, { state: { defaultTab: 'operasional' } })
  } else if (leadId) {
    navigate(`/pp/leads/${leadId}`, { state: { defaultTab: 'kesehatan' } })
  } else {
    navigate('/pp/screening')  // fallback jika dibuka langsung dari URL
  }
}
```

Gunakan `handleBack` di: tombol arrow back di header, tombol "Kembali" di footer.

### handleSave — redirect priority chain

Saat menyimpan record baru, redirect ke parent yang paling relevan. Urutan prioritas:

```jsx
const handleSave = () => {
  if (isNew) {
    const newId = getNextAssessmentId()
    addAssessment(newId, payload)
    // Priority: fromOrderId > pickerOrderId > leadId > fallback list
    if (fromOrderId) {
      navigate(`/pp/orders/${fromOrderId}`, { state: { defaultTab: 'operasional' } })
    } else if (pickerOrderId) {
      navigate(`/pp/orders/${pickerOrderId}`, { state: { defaultTab: 'operasional' } })
    } else if (leadId) {
      navigate(`/pp/leads/${leadId}`, { state: { defaultTab: 'kesehatan' } })
    } else {
      navigate('/pp/screening')
    }
  } else {
    setIsEditing(false)
  }
}
```

### Auto-fill dari fromOrderId saat form dibuka

Ketika form dibuka dengan `fromOrderId`, jalankan auto-fill sekali saat mount:

```jsx
useEffect(() => {
  if (isNew && fromOrderId) handleOrderPick(fromOrderId)
}, []) // eslint-disable-line
```

### handleOrderPick — cross-data lookup

Pattern untuk auto-fill dari order termasuk lookup trainer ke `PIC_DB`:

```jsx
function handleOrderPick(orderId) {
  setPickerOrderId(orderId)
  if (!orderId) { setPickerLeadHealth(null); return }
  const o = ORDERS_INIT.find(x => x.id === orderId)
  if (!o) return
  setNamaKlien(o.klien)
  setNamaFC(o.pic)
  // Lookup trainer: PROGRAMS_INIT (match by namaPaket) → PIC_DB (fullname)
  const prog = PROGRAMS_INIT.find(p => p.namaPaket === o.paket)
  const trainerName = prog ? (PIC_DB[prog.picId]?.fullname || o.pic) : o.pic
  setNamaPelatih(trainerName)
  // Format: "namaLatihan — namaPaket" (em-dash dengan spasi di kedua sisi)
  setProgramLatihan(prog ? `${prog.namaLatihan} — ${o.paket}` : o.paket)
  // Auto-fill health data dari leads jika ada
  const health = getLeadHealthByOrderId(orderId)
  setPickerLeadHealth(health)
  if (health?.sudahDiisi) {
    setDetailGoals(health.tujuanProgram || '')
    // ... field kesehatan lainnya
  }
}
```

### Parent: terima data baru dari sub-page

```jsx
// Parent (PPLeadDetailPage.jsx)
const { state } = useLocation()
const [extraScreenings, setExtraScreenings] = useState([])

useEffect(() => {
  if (state?.newScreening) {
    setExtraScreenings(prev => [state.newScreening, ...prev])
  }
}, []) // hanya jalankan sekali saat mount

// Gabungkan data dummy + data baru dari navigasi:
const screenings = [
  ...SCREENING_SUMMARY.filter(s => s.namaKlien === lead.nama),
  ...extraScreenings,
]
```

**Catatan:** Pola ini cocok untuk prototype UI-only. Ketika backend sudah terhubung, ganti dengan API call dan invalidate cache — struktur navigasi dan state tetap sama.

### Context Reference Banner (Info Banner di Sub-page)

Gunakan ketika sub-page butuh mengingatkan user bahwa ada data terkait di parent page yang bisa dijadikan referensi saat mengisi form. Tampilkan hanya kalau `leadId` (atau parent context) tersedia.

```jsx
{leadId && (
  <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
      <span className="text-[10px] font-bold text-blue-600">i</span>
    </div>
    <div className="flex-1">
      <p className="text-xs font-semibold text-blue-700">Judul info (misal: Informasi Kesehatan Awal sudah direkam di Lead)</p>
      <p className="text-xs text-blue-600 mt-0.5">Gunakan sebagai referensi saat mengisi form ini.</p>
    </div>
    <button
      onClick={() => navigate(`/pp/leads/${leadId}`, { state: { defaultTab: 'kesehatan' } })}
      className="shrink-0 text-[10px] font-semibold text-blue-700 hover:underline whitespace-nowrap">
      Lihat →
    </button>
  </div>
)}
```

**Aturan:**
- Hanya tampil kalau `leadId` ada (dibuka dari context parent, bukan langsung dari URL)
- Posisi: langsung di atas section pertama form yang relevan (sebelum "Data Klien & Program", bukan di header page)
- Tombol "Lihat →" buka parent page di tab yang relevan — pakai `{ state: { defaultTab: 'namatab' } }`
- Implementasi nyata: `PPFitnessAssessmentPage.jsx` banner di atas section Data Klien & Program

---

### Helper: avatar color dari nama

```jsx
const AVATAR_COLORS = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777','#0284C7']

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function getAvatarColor(name) {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFFFF
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
```

Atau jika data dari data file sudah menyertakan `initials` dan `color` pre-computed, langsung pakai `item.initials` dan `item.color` tanpa helper.

---

## 9. Bidirectional Navigation (Order ↔ Lead Detail)

Used for: navigasi bolak-balik antara halaman detail yang saling terkait (Order Detail ↔ Lead Detail, atau halaman sub-detail lainnya).

**Prinsip:** Setiap navigate ke halaman terkait harus menyertakan state yang memungkinkan halaman tujuan mengetahui dari mana user datang, agar tombol back/breadcrumb bisa kembali ke halaman asal — bukan selalu ke list.

### State convention

| Navigasi dari | State yang di-pass | Dideteksi di |
|---|---|---|
| Order Detail → Lead Detail | `{ fromOrderId: order.id }` | PPLeadDetailPage: `state?.fromOrderId` |
| Lead Detail → Order Detail | `{ fromLeadId: lead.id }` | PPOrderDetailPage: `fromState?.fromLeadId` |
| Order Detail → FA page (via Context Banner) | `{ defaultTab: 'kesehatan', fromOrderId: order.id }` | PPLeadDetailPage |
| Klien Detail → halaman terkait | `{ fromKlienId: klien.id }` | Halaman tujuan: `state?.fromKlienId` |

### Tombol di Order Detail header

```jsx
{/* "Lihat Lead" button — muncul kalau order.leadId ada */}
{!isNew && order.leadId && (
  <button
    onClick={() => navigate('/pp/leads/' + order.leadId, { state: { fromOrderId: order.id } })}
    className="inline-flex items-center gap-1.5 border border-[#1E1C43] text-[#1E1C43] text-xs px-3 py-1.5 rounded-lg hover:bg-[#1E1C43] hover:text-white transition-colors"
  >
    Lihat Lead →
  </button>
)}

{/* Kembali — balik ke Lead jika datang dari Lead, ke Orders jika tidak */}
<button
  onClick={() => fromState?.fromLeadId ? navigate('/pp/leads/' + fromState.fromLeadId) : navigate('/pp/orders')}
  className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
>
  <ArrowLeft size={12} /> Kembali
</button>
```

### Breadcrumb di Order Detail (context-aware)

```jsx
{fromState?.fromLeadId ? (
  <>
    <button onClick={() => navigate('/pp/leads')} className="hover:text-[#1E1C43] transition-colors">Leads PP</button>
    <ChevronRight size={12} className="text-gray-300" />
    <button onClick={() => navigate('/pp/leads/' + fromState.fromLeadId)} className="hover:text-[#1E1C43] transition-colors">{order.namaKlien} (Lead)</button>
    <ChevronRight size={12} className="text-gray-300" />
  </>
) : (
  <>
    <button onClick={() => navigate('/pp/orders')} className="hover:text-[#1E1C43] transition-colors">Private Program</button>
    <ChevronRight size={12} className="text-gray-300" />
    <button onClick={() => navigate('/pp/orders')} className="hover:text-[#1E1C43] transition-colors">Orders</button>
    <ChevronRight size={12} className="text-gray-300" />
  </>
)}
<span className="text-[#1E1C43] font-medium">{order.namaKlien}</span>
```

### Breadcrumb + back button di Lead Detail (context-aware)

```jsx
{/* Breadcrumb */}
{state?.fromOrderId ? (
  <>
    <button onClick={() => navigate('/pp/orders')} className="hover:text-[#1E1C43] transition-colors">Orders</button>
    <ChevronRight size={12} />
    <button onClick={() => navigate('/pp/orders/' + state.fromOrderId)} className="hover:text-[#1E1C43] transition-colors">#{state.fromOrderId}</button>
    <ChevronRight size={12} />
    <span className="text-gray-600 font-medium">{lead.nama} (Lead)</span>
  </>
) : (
  <>
    <Link to="/pp/leads" className="hover:text-[#1E1C43] transition-colors">Leads PP</Link>
    <ChevronRight size={12} />
    <span className="text-gray-600 font-medium">{lead.nama}</span>
  </>
)}

{/* Back button (ArrowLeft icon) */}
<button
  onClick={() => state?.fromOrderId ? navigate('/pp/orders/' + state.fromOrderId) : navigate('/pp/leads')}
  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors shrink-0">
  <ArrowLeft size={15} />
</button>
```

### "Lihat Order" button di Lead Detail

```jsx
{lead.statusPipeline === 'Convert' && lead.orderId && (
  <button
    onClick={() => navigate('/pp/orders/' + lead.orderId, { state: { fromLeadId: lead.id } })}
    className="...">
    Lihat Order #{lead.orderId}
  </button>
)}
```

**Rules**
- Selalu pass `fromOrderId` / `fromLeadId` di navigate state — jangan pakai `navigate(-1)` karena tidak reliable di semua entry path
- Dummy data orders WAJIB punya field `leadId` yang merujuk ke ID yang benar-benar ada di `LEADS_FALLBACK` — mismatch menyebabkan "Lead tidak ditemukan"
- Pola ini perlu diterapkan konsisten di B2B dan Event ketika module tersebut punya halaman Order Detail dan Lead Detail yang setara

---

## 10. Connection Banner (Order/Lead Link Indicator)

Used for: menampilkan status koneksi form ke Order atau Lead — muncul di atas section form utama. Berlaku untuk form baru maupun existing record.

### Kapan ditampilkan

- **Existing record** yang punya `orderId`: tampilkan dengan tombol "Lihat Order →"
- **Form baru** dengan `fromOrderId` (dibuka dari order detail): tampilkan info auto-fill dikunci
- **Form baru** dengan `pickerOrderId` (user pilih order lewat picker): opsional untuk konfirmasi

### Template

```jsx
import { Link2 } from 'lucide-react'

{/* Existing record — connected to an order */}
{!isNew && existing?.orderId && (
  <div className="mb-4 flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-green-50 border border-green-100">
    <Link2 size={13} className="text-green-600 shrink-0" />
    <p className="text-[11px] font-medium text-green-700 flex-1">
      Terhubung ke Order <span className="font-bold">#{existing.orderId}</span>
      {orderLocked ? ' — data klien dikunci.' : '.'}
    </p>
    <button
      onClick={() => navigate(`/pp/orders/${existing.orderId}`, { state: { defaultTab: 'operasional' } })}
      className="text-[11px] font-semibold text-green-700 hover:underline shrink-0"
    >
      Lihat Order →
    </button>
  </div>
)}

{/* New form opened from order detail */}
{isNew && fromOrderId && (
  <div className="mb-4 flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-green-50 border border-green-100">
    <Link2 size={13} className="text-green-600 shrink-0" />
    <p className="text-[11px] font-medium text-green-700">
      Terhubung ke Order <span className="font-bold">#{fromOrderId}</span> — Nama Klien, FC, Pelatih & Program Latihan sudah di-auto-fill dan dikunci.
    </p>
  </div>
)}
```

**Rules:**
- Warna: selalu `bg-green-50 border border-green-100` — hijau untuk koneksi positif (konfirmasi), biru untuk info referensi saja (lihat Context Reference Banner di Section 8)
- Font: `text-[11px]` supaya banner compact — jangan pakai `text-xs` (terlalu besar untuk notif inline)
- Posisi: tepat di atas form fields, setelah header card dan sebelum section pertama
- "Lihat Order →" hanya untuk existing record — form baru belum disimpan, belum ada navigasi valid ke order

---

## 11. Per-field Order-linked Locking

Used for: mengunci field individual yang di-auto-fill dari order — berbeda dari read-only wrapper (`pointer-events-none`) karena lebih granular: field tertentu dikunci, field lain tetap editable, bahkan dalam edit mode.

### Kapan pakai per-field locking (bukan wrapper)

- Form punya campuran: sebagian field auto-fill dari order (harus dikunci), sebagian diisi user (harus tetap editable)
- Kondisi lock berlaku bahkan saat user sedang edit (bukan hanya view mode)
- Existing record yang terhubung ke order harus tetap dikunci juga (tidak hanya form baru)

### CSS classes

```jsx
// Definisikan di atas return statement, bersama konstanta form lainnya
const inputCls    = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1E1C43] bg-white"
const readOnlyCls = "w-full text-sm border border-gray-100 rounded-lg px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
const labelCls    = "text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block"
```

### orderLocked boolean

```jsx
// Berlaku untuk new DAN existing record — derive dari data yang benar-benar ada di store
const linkedOrderId = isNew ? (pickerOrderId || fromOrderId) : (existing?.orderId || '')
const orderInStore  = linkedOrderId ? ORDERS_INIT.find(o => o.id === linkedOrderId) : null
const orderLocked   = !!orderInStore  // false jika ID tidak valid
```

**Penting:** derive dari `ORDERS_INIT.find(...)`, bukan hanya keberadaan string ID — supaya lock tidak aktif untuk ID yang tidak valid.

### Field render

```jsx
<input
  className={orderLocked ? readOnlyCls : inputCls}
  readOnly={orderLocked}
  value={namaKlien}
  onChange={e => setNamaKlien(e.target.value)}
/>
```

### Field mana yang dikunci vs tidak

**Dikunci** (auto-fill dari order/program):
- Nama Klien (`order.klien`)
- ID Program / No Order (`order.id`)
- Nama FC / PIC (`order.pic`)
- Nama Pelatih (dari `PROGRAMS_INIT` → `PIC_DB`)
- Program Latihan (format `"namaLatihan — namaPaket"`)

**Tidak dikunci** (tetap editable meski order terhubung):
- Tanggal assessment, catatan, goals
- Data tes fisik (berat, tinggi, lingkar badan, dll.)
- Riwayat cedera, obatan-obatan, kondisi saat ini

---

## 12. Template Editor Container (localStorage, Drag-reorder)

Used for: panel editor Syarat & Ketentuan yang dapat dikustomisasi dan disimpan di localStorage — Invoice (flat string list) dan Agreement (nested pasal/poin). Kedua editor berbagi struktur container yang **identik** — selalu gunakan pola ini, jangan improvisasi struktur baru.

### Struktur container (wajib)

```jsx
<div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
  {/* Header */}
  <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3 flex-wrap">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#1E1C43] flex items-center justify-center shrink-0">
        <ScrollText size={16} className="text-white" /> {/* atau FileText */}
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#1E1C43]">Template Syarat &amp; Ketentuan ...</h2>
        <p className="text-[11px] text-gray-500 mt-0.5">Berlaku untuk semua ... Private Training</p>
      </div>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      {editMode ? (
        <>
          <button onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">
            <RotateCcw size={12} /> Reset Default
          </button>
          <button onClick={cancelEdit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">
            <X size={12} /> Batal
          </button>
          <button onClick={handleSave}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-xs font-semibold transition-colors ${savedOk ? 'bg-green-500' : 'bg-[#1E1C43] hover:bg-[#2d2b5c]'}`}>
            <Save size={12} /> {savedOk ? 'Tersimpan!' : 'Simpan'}
          </button>
        </>
      ) : (
        <>
          {savedOk && (
            <span className="text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded-lg">✓ Tersimpan</span>
          )}
          <button onClick={enterEdit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E1C43] hover:bg-[#2d2b5c] text-white text-xs font-semibold transition-colors">
            <Pencil size={12} /> Edit Template
          </button>
        </>
      )}
      <button onClick={onClose}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
        <X size={12} /> Tutup
      </button>
    </div>
  </div>

  {/* Info banner — selalu visible */}
  <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
    <p className="text-[11px] text-blue-700">
      <span className="font-semibold">Info:</span> Perubahan tidak mempengaruhi dokumen yang sudah ada.
    </p>
  </div>

  {/* View mode hint — hanya saat tidak edit */}
  {!editMode && (
    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
      <p className="text-[11px] text-gray-500">
        Mode tampilan — klik <strong className="text-[#1E1C43]">Edit Template</strong> untuk mulai mengedit.
      </p>
    </div>
  )}

  {/* Dirty warning — hanya saat edit + ada unsaved changes */}
  {editMode && dirty && (
    <div className="px-5 py-3 bg-yellow-50 border-b border-yellow-100">
      <p className="text-[11px] text-yellow-700 font-medium">
        Ada perubahan yang belum disimpan — klik <strong>Simpan</strong> untuk menyimpan.
      </p>
    </div>
  )}

  {/* Drag hint — hanya saat edit mode */}
  {editMode && (
    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
      <GripVertical size={13} className="text-gray-400" />
      <p className="text-[11px] text-gray-500">Drag handle untuk mengubah urutan.</p>
    </div>
  )}

  {/* Content area */}
  <div className="p-5 flex flex-col gap-4">
    {/* item rows (Invoice) atau pasal cards (Agreement) */}
  </div>
</div>
```

### Button hierarchy (wajib, semua `px-3.5 py-2 text-xs font-semibold rounded-lg`)

| Mode | Tombol | Style |
|---|---|---|
| Read mode | Edit Template | `bg-[#1E1C43] hover:bg-[#2d2b5c] text-white` — navy **solid** |
| Read mode | Tutup | `bg-[#E05945] hover:bg-[#c94a38] text-white` — accent orange |
| Edit mode | Reset Default | `border border-gray-300 text-gray-600 hover:bg-gray-50` — gray outline |
| Edit mode | Batal | `border border-gray-300 text-gray-600 hover:bg-gray-50` — gray outline |
| Edit mode | Simpan | `bg-[#1E1C43] hover:bg-[#2d2b5c] text-white` / `bg-green-500` jika savedOk |
| Edit mode | Tutup | `bg-[#E05945] hover:bg-[#c94a38] text-white` — **selalu visible** |

Jangan pakai `h-8 px-3` — semua button template editor wajib `px-3.5 py-2`.

### Header toggle button (di page header)

Tombol yang membuka/menutup editor dari halaman list — conditional style berdasarkan `showTemplate`:

```jsx
<button
  onClick={() => setShowTemplate(v => !v)}
  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors border ${
    showTemplate
      ? 'bg-[#1E1C43] text-white border-[#1E1C43]'
      : 'border-[#1E1C43] text-[#1E1C43] hover:bg-[#1E1C43] hover:text-white'
  }`}
>
  <Settings size={12} /> Template Invoice
  <ChevronDown size={12} className={`transition-transform ${showTemplate ? 'rotate-180' : ''}`} />
</button>
```

Active (editor terbuka): navy solid. Inactive: navy outline. Icon rotate-180 saat active.

### State wajib di dalam editor

```js
const [dirty,       setDirty]       = useState(false)
const [savedOk,     setSavedOk]     = useState(false)
const [editMode,    setEditMode]    = useState(false)
const [dragOverIdx, setDragOverIdx] = useState(null)
const dragIdx      = useRef(null)
const editSnapshot = useRef(null)
```

### cancelEdit — restore snapshot

```js
const enterEdit  = () => { editSnapshot.current = [...items]; setEditMode(true) }
const cancelEdit = () => {
  if (editSnapshot.current) { setItems(editSnapshot.current); setDirty(false) }
  setEditMode(false); setSavedOk(false)
}
```

### localStorage — dua format berbeda

**Invoice** (flat string list):
```js
// Key: 'efmInvoiceTemplate'  |  Shape: { items: string[] }
const [items, setItems] = useState(() => {
  try {
    const saved = localStorage.getItem('efmInvoiceTemplate')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed.items) && parsed.items.length > 0) return parsed.items
    }
  } catch {}
  return [...DEFAULT_INV_SYARAT]
})
// Save: localStorage.setItem('efmInvoiceTemplate', JSON.stringify({ items }))
// Reset: localStorage.removeItem('efmInvoiceTemplate')
```

**Agreement** (nested pasal/poin):
```js
// Key: 'efmAgreementTemplate'  |  Shape: { pasal: [{ id, judul, poin: string[] }] }
const [pasal, setPasal] = useState(() => {
  try {
    const saved = localStorage.getItem('efmAgreementTemplate')
    if (saved) return JSON.parse(saved).pasal
  } catch {}
  return DEFAULT_PASAL.map(p => ({ ...p, poin: [...p.poin] }))
})
```

**Invoice Detail** membaca template saat render (bukan saat edit):
```js
function getSyaratList() {
  try {
    const saved = localStorage.getItem('efmInvoiceTemplate')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed.items) && parsed.items.length > 0) return parsed.items
    }
  } catch {}
  return DEFAULT_SYARAT
}
const syaratList = getSyaratList()
```

### Render pattern di parent

Editor menggantikan konten utama halaman list (bukan modal/sidebar):

```jsx
{showTemplate ? (
  <TemplateEditor onClose={() => setShowTemplate(false)} />
) : (
  <>
    {/* stats + filter + table */}
  </>
)}
```

**Implementasi:** `PPInvoicePage.jsx` (`TemplateInvoiceEditor`) dan `PPDocumentsPage.jsx` (`TemplateEditor`).

---

## 8. Full-Page Form Pattern (Add/Edit) + Module Store

Digunakan untuk: form tambah/edit data yang sebelumnya menggunakan modal — ketika form memiliki banyak field (>6), multi-section, atau perlu UX yang lebih luas dari modal.

**Kapan pakai page-form vs modal:**
- **Page-form** → form dengan 3+ section, banyak field, ada relasi antar-field (auto-calc, auto-populate), atau ketika tombol "Hapus" juga ada di form yang sama
- **Modal** → aksi cepat, field sedikit (<5), atau konfirmasi sederhana (contoh: ubah status, input satu field)

### Struktur Route

```
/[module]/[resource]/new              → mode tambah baru
/[module]/[resource]/:itemId/edit     → mode edit (itemId = ID record)
```

Contoh aktual: `/pp/program-db/new` dan `/pp/program-db/:progId/edit`

**Aturan routing:** pastikan route `/new` dideklarasikan di App.jsx SEBELUM route `/:itemId/edit` agar segment `new` tidak ter-parse sebagai itemId.

### Module Store (data persistence lintas navigasi)

Ketika form ada di halaman terpisah dari list, data WAJIB disimpan di module-level store (bukan di `useState` lokal list page). Alasannya: React Router unmount/remount component saat navigasi, sehingga useState list page di-reset setiap kali pengguna kembali.

```js
// src/data/[module]Store.js
import { DATA_INIT } from './[module]Data'

let _items = null

function init() {
  if (!_items) _items = DATA_INIT.map(item => ({ ...item }))
}

export function getStoredItems()         { init(); return _items }
export function getItemById(id)          { init(); return _items.find(i => i.id === id) || null }
export function addStoredItem(item)      { init(); _items = [..._items, item] }
export function updateStoredItem(id, u)  { init(); _items = _items.map(i => i.id === id ? { ...i, ...u } : i) }
export function deleteStoredItem(id)     { init(); _items = _items.filter(i => i.id !== id) }
export function getExistingIds()         { init(); return _items.map(i => i.id) }
```

**List page** membaca dari store saat mount:
```js
const [items] = useState(() => getStoredItems())
```
Karena component di-remount setiap kali user navigasi kembali ke list page, data terbaru dari store otomatis terbaca.

### Layout Page-Form

```jsx
export default function [Module]FormPage() {
  const navigate = useNavigate()
  const { itemId } = useParams()          // undefined untuk mode tambah
  const isEdit = !!itemId
  const existing = isEdit ? getItemById(itemId) : null

  useBreadcrumb([
    { label: 'Module Name' },
    { label: 'Resource', to: '/module/resource' },
    { label: isEdit ? `Edit — ${itemId}` : 'Tambah Baru' },
  ])

  return (
    <div className="bg-[#F5F5F7] min-h-screen pb-24">

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
              <IconName size={22} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Module — Sub</p>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">
                {isEdit ? `Edit — ${itemId}` : 'Tambah Baru'}
              </h1>
              <p className="text-xs text-gray-400 mt-1">Deskripsi singkat tujuan form</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/module/resource')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft size={12} /> Kembali
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Section Card (repeat per group of fields) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Nama Section</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* fields here */}
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white border-t border-gray-100 px-6 py-4 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            {isEdit && (
              <button onClick={handleHapus} className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                Hapus
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/module/resource')} className="border border-gray-200 text-gray-600 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button onClick={handleSimpan} className="bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors">
              {isEdit ? 'Simpan Perubahan' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
```

**Aturan wajib:**
- `pb-24` pada outer wrapper agar konten tidak tertutup fixed footer
- Footer: `md:left-64` untuk clear sidebar (256px) — JANGAN pakai `md:left-[224px]` atau nilai lain
- ID field: `disabled` + `bg-gray-50 text-gray-400 cursor-not-allowed` saat mode edit (ID tidak boleh diubah)
- Hapus: konfirmasi via `confirm()` sebelum delete, redirect ke list page setelah hapus
- Validasi: gunakan inline error (`errors` state + `border-red-400 bg-red-50` pada input) bukan `alert()`
- Auto-calc field: `readOnly` + `bg-gray-50 text-gray-500 cursor-not-allowed`

### Input & Label styling

```js
// Label
const label = 'text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block'

// Input (base)
const inputCls = (key) =>
  `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] transition-colors ${
    errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-200'
  }`
```

**Implementasi aktual:** `PPProgramFormPage.jsx` (store: `ppProgramStore.js`) — routes `/pp/program-db/new` dan `/pp/program-db/:progId/edit`.

---

## 13. Toggle-in-Header Section Pattern

Used for: optional sections in a detail/form page where the user can enable or disable an entire block of fields (e.g. Pengukuran Tubuh, Health Screening, Fitness Test in PPFitnessAssessmentPage). Replaces the old pattern of standalone SectionToggleCard rows above sections.

### Prinsip

- Card always visible — tidak disembunyikan sama sekali ketika toggle off
- Toggle switch berada di header card (kanan atas), bukan sebagai baris terpisah di atas card
- Konten (fields) hanya muncul saat toggle ON — tersembunyi saat toggle OFF
- Default: `false` (off) — user harus aktifkan secara eksplisit
- Saat toggle ON: tampilkan field grid di bawah header divider
- Saat toggle OFF: hanya header yang terlihat (compact, tidak ada konten di bawah)

### State

```jsx
const [toggles, setToggles] = useState({
  bodyMeasurement: false,
  healthScreening: false,
  fitnessTest: false,
})
```

### Section card struktur

```jsx
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
  {/* Header — selalu visible */}
  <div className="flex items-center justify-between px-5 py-4">
    <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">
      Nama Section
    </h3>
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <span className="text-xs text-gray-500">
        {toggles.sectionKey ? 'Aktif' : 'Nonaktif'}
      </span>
      <div
        onClick={() => setToggles(t => ({ ...t, sectionKey: !t.sectionKey }))}
        className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
          toggles.sectionKey ? 'bg-[#1E1C43]' : 'bg-gray-300'
        }`}
      >
        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
          toggles.sectionKey ? 'left-5' : 'left-0.5'
        }`} />
      </div>
    </label>
  </div>

  {/* Konten — hanya visible saat toggle ON */}
  {toggles.sectionKey && (
    <div className="px-5 pb-5 border-t border-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        {/* field inputs */}
      </div>
    </div>
  )}
</div>
```

### Aturan wajib

- Jangan buat baris `SectionToggleCard` tersendiri di atas card — toggle selalu berada DI DALAM header card
- `overflow-hidden` pada card container wajib agar border-radius tidak pecah saat konten muncul
- Label "Aktif" / "Nonaktif" di samping toggle untuk kejelasan visual
- Default semua toggle `false` — user memilih sendiri section mana yang ingin diisi
- Saat form dalam read-only mode (existing record, `!isEditing`), toggle tetap bisa diklik hanya jika ada nilai tersimpan — atau sembunyikan toggle dan tampilkan konten saja (bergantung UX halaman). Untuk form prototype dummy, wrapper `pointer-events-none` pada outer form sudah cukup
- **Implementasi aktual:** `PPFitnessAssessmentPage.jsx` — sections Pengukuran Tubuh, Health Screening, dan Fitness Test (diimplementasi 2026-08-29)

---

## 14. Related Records Panel (Style B — Standar)

Used for: menampilkan daftar entitas terkait (order, invoice, receipt, agreement, assessment) di dalam halaman detail — sebagai kartu ringkas yang bisa diklik untuk navigate ke halaman detail masing-masing record. Pola ini menggantikan tabel inline atau list button yang terlalu besar.

**Kapan pakai:**
- Section menampilkan satu atau beberapa record terkait yang sudah punya dedicated detail page
- Field yang dibutuhkan sudah tersedia di halaman tujuan — tidak perlu duplikat semua info di sini
- Section terasa "terlalu besar" relatif terhadap fungsinya

### Wrapper panel

```jsx
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
  {/* Section header */}
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-bold text-[#1E1C43] flex items-center gap-2">
      <IconName size={14} /> Label Section
    </h3>
    {/* Optional: tombol aksi (misal: Buat Order, Buat Invoice) */}
    <button
      onClick={handleAction}
      className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-[10px] font-semibold transition-colors"
    >
      <Plus size={10} /> Label
    </button>
  </div>

  {/* Daftar kartu */}
  <div className="flex flex-col gap-2">
    {records.length === 0 ? (
      <p className="text-xs text-gray-400 text-center py-6">Belum ada record.</p>
    ) : (
      records.map(r => (
        <div key={r.id} onClick={...} className="...">
          {/* kartu per record — lihat Style B di bawah */}
        </div>
      ))
    )}
  </div>
</div>
```

### Style B — Satu kartu (template resmi)

```jsx
<div
  onClick={() => navigate('/path/to/' + record.id, { state: { record } })}
  className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group"
>
  {/* Sisi kiri: icon + ID + info sekunder */}
  <div className="flex items-center gap-3 min-w-0">
    <div className="w-8 h-8 rounded-full bg-[#1E1C43]/10 flex items-center justify-center shrink-0">
      <IconName size={14} className="text-[#1E1C43]" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-[#1E1C43] truncate">#{record.id}</p>
      <p className="text-[10px] text-gray-400 truncate">{infoSekunder}</p>
    </div>
  </div>

  {/* Sisi kanan: nilai opsional + status badge + ExternalLink */}
  <div className="flex items-center gap-2 shrink-0">
    {/* Nilai moneter (opsional, jika relevan) */}
    <span className="text-xs font-semibold text-[#1E1C43]">Rp {record.nilai.toLocaleString('id-ID')}</span>
    {/* Status badge */}
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusCls}`}>
      {statusLabel}
    </span>
    <ExternalLink size={13} className="text-gray-300 group-hover:text-[#1E1C43] transition-colors" />
  </div>
</div>
```

### Status color map

```js
// Gunakan sesuai kebutuhan per entitas
const statusColors = {
  // Order PP
  'Aktif':     'bg-green-50 text-green-700 border-green-200',
  'Completed': 'bg-blue-50 text-blue-700 border-blue-200',
  'Cancelled': 'bg-red-50 text-red-700 border-red-200',
  // Invoice/Receipt
  'Lunas':     'bg-green-50 text-green-700 border-green-200',
  'Pending':   'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Overdue':   'bg-red-50 text-red-700 border-red-200',
  'Draft':     'bg-gray-50 text-gray-500 border-gray-200',
  // Agreement
  'Aktif':     'bg-green-50 text-green-700 border-green-200',
  'Pengajuan': 'bg-yellow-50 text-yellow-700 border-yellow-200',
}
```

### Contoh info sekunder (baris kedua kartu)

- **Order**: `"{paket} · Mulai {formatDate(tanggalMulai)}"`
- **Invoice**: `"Jatuh tempo {formatDate(jatuhTempo)}"`
- **Receipt**: `"{tanggal} · {metode}"`
- **Agreement**: `"Berlaku {tanggalMulai} s/d {tanggalBerakhir}"`
- **Fitness Assessment**: gabungkan data pengukuran singkat, misalnya `"BB {bb}kg · TB {tb}cm · {tanggal}"`

### Aturan wajib

- Selalu gunakan `div` + `onClick` — **jangan** `button` (Style A yang lama)
- Padding kartu: `px-4 py-3` — **bukan** `p-3` atau `p-3.5`
- Icon circle: `w-8 h-8 rounded-full bg-[#1E1C43]/10` — wajib ada, selalu di kiri
- ID: `text-xs font-semibold text-[#1E1C43] truncate` — tampilkan dengan `#` prefix
- Info sekunder: `text-[10px] text-gray-400 truncate`
- Status badge: posisi kanan, sebelum ExternalLink — `text-[10px]`
- ExternalLink: `size={13}`, default `text-gray-300`, hover `text-[#1E1C43]` via `group-hover`
- Import `ExternalLink` dari `lucide-react` jika belum ada
- **Jangan tampilkan chip/badge ID dokumen terkait di dalam panel ini** (misal: INV-PP-26-0007, RCP-PP-26-0007 di Riwayat Order) — arahkan admin ke detail page record terkait untuk melihat dokumen tersebut
- Jika record terkait hanya satu: satu kartu sudah cukup, tidak perlu loop
- Jika record terkait bisa lebih dari satu: loop semua dalam list `flex flex-col gap-2`
- `border-l-4 border-yellow-400` pada wrapper panel (di luar `bg-white rounded-2xl`) sebagai visual cue ketika ada aksi pending (contoh: agreement dalam status pengajuan_masuk)
- Jika section RRP menjadi terlalu kecil untuk tab tersendiri setelah konversi: gabungkan ke tab Overview/Kontrak sebagai card tersendiri — jangan pertahankan tab kosong hanya untuk satu kartu

### Implementasi aktual

| Halaman | Section | File |
|---|---|---|
| PP Order Detail | Agreement Klien | `PPOrderDetailPage.jsx` |
| PP Order Detail | Invoice | `PPOrderDetailPage.jsx` |
| PP Order Detail | Receipt | `PPOrderDetailPage.jsx` |
| PP Order Detail | Fitness Assessment | `PPOrderDetailPage.jsx` |
| PP Lead Detail | Riwayat Order (Tab 3) | `PPLeadDetailPage.jsx` |

---

## 15. Detail Page Header Pattern (Lead / Order Detail)

Digunakan di semua halaman **entity detail** (Lead Detail, Order Detail) untuk semua modul (PP, B2B, Event). Berbeda dari Section 3b di `efm-design-standards` yang memakai ikon navy — di sini avatar menampilkan **initials berwarna** yang unik per entitas.

> Panduan memilih pola: detail form/sub-page → Section 3b (navy icon); entity detail page (Lead/Order) → Section 15 ini (colored initials).

### Avatar: Colored Initials

```js
const AVATAR_COLORS = [
  '#E05945', '#1E1C43', '#2563EB', '#7C3AED',
  '#0891B2', '#059669', '#D97706', '#DC2626',
]

function getAvatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}
```

```jsx
<div
  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
  style={{ background: getAvatarColor(avatarName) }}
>
  {isNew ? 'XX' : getInitials(avatarName)}
</div>
```

- `avatarName` = nama klien atau nama entitas utama (bukan nama event — prefer nama klien)
- Mode `isNew`: tampilkan singkatan modul (misal `'EV'`, `'PP'`) sebagai fallback

### Struktur Lengkap Header Card

```jsx
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
  <div className="flex items-start justify-between gap-4 flex-wrap">

    {/* KIRI: Avatar + Info */}
    <div className="flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
        style={{ background: getAvatarColor(avatarName) }}
      >
        {isNew ? 'EV' : getInitials(avatarName)}
      </div>
      <div>
        {/* Eyebrow: ID dokumen saja — TANPA label modul atau status */}
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
          {isNew ? 'EV-DRAFT' : order.id}
        </p>
        {/* Judul: nama event/lead/entitas — text-lg, bukan text-xl atau text-base */}
        <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">
          {isNew ? 'Order Baru' : (order.namaEvent || order.namaKlien)}
        </h1>
        {/* Info row: badge + teks pendek — TANPA angka Rp */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Badge cls={tipeCls}>{order.jenis}</Badge>
          <Badge cls={STATUS_CLS[order.status]}>● {order.status}</Badge>
          <span className="text-[10px] text-gray-400">{order.namaKlien}</span>
          {order.pic && (
            <span className="text-[10px] text-gray-400">PIC: {order.pic}</span>
          )}
        </div>
      </div>
    </div>

    {/* KANAN: Tombol aksi */}
    <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
      {/* Tombol aksi utama: navy border dengan hover fill */}
      {!isNew && (
        <button
          onClick={handleAction}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#1E1C43] text-[#1E1C43] text-xs font-semibold hover:bg-[#1E1C43] hover:text-white transition-colors"
        >
          <Edit2 size={12} /> Update Tahapan
        </button>
      )}
      {/* Tombol Kembali: selalu gray secondary */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft size={12} /> Kembali
      </button>
    </div>
  </div>

  {/* Stepper + optional edit form — di bawah divider */}
  <div className="mt-4 pt-4 border-t border-gray-100">
    {/* <StageStepper currentStage={...} /> */}
    {/* edit form inline (opsional) */}
  </div>
</div>
```

### Inline Edit Form — Tahapan / Pipeline Update

Form 3 field yang muncul di bawah stepper saat tombol "Update Tahapan" diklik:

```jsx
{editingTahapan && (
  <div className="border-t border-gray-100 pt-4 mt-3">
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      {/* Field 1 + 2: grid 2 kolom */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tahapan Baru</label>
          <select value={newTahapanVal} onChange={e => setNewTahapanVal(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]">
            {TAHAPAN_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tanggal</label>
          <input type="date" value={newTahapanTanggal} onChange={e => setNewTahapanTanggal(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]" />
        </div>
      </div>
      {/* Field 3: full-width */}
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Catatan</label>
        <input type="text" value={newTahapanCatatan} onChange={e => setNewTahapanCatatan(e.target.value)}
          placeholder="Catatan perubahan tahapan..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]" />
      </div>
      {/* Buttons */}
      <div className="flex gap-2 justify-end pt-1">
        <button onClick={handleBatal}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
          <X size={12} /> Batal
        </button>
        <button onClick={handleSimpan}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
          <Save size={12} /> Simpan
        </button>
      </div>
    </div>
  </div>
)}
```

**State yang dibutuhkan:**
```js
const [editingTahapan,    setEditingTahapan]    = useState(false)
const [newTahapanVal,     setNewTahapanVal]     = useState(tahapanState)
const [newTahapanTanggal, setNewTahapanTanggal] = useState('')
const [newTahapanCatatan, setNewTahapanCatatan] = useState('')
```

### Aturan Wajib

- Info row header: **JANGAN tampilkan angka Rp subtotal** — finansial ditampilkan di list page dan section keuangan di dalam detail page, bukan di header
- Eyebrow: ID dokumen saja (`order.id` / `lead.id`) — tanpa label "Order" atau "B2B Event"
- Judul: `text-lg font-bold text-[#1E1C43]` — bukan `text-xl` atau `text-base`
- Padding card: `p-5` — bukan `p-4` atau `p-6`
- Tombol aksi utama: navy outline → navy filled on hover (`border border-[#1E1C43]` + `hover:bg-[#1E1C43] hover:text-white`) — BUKAN `bg-[#1E1C43]` langsung
- Tombol Kembali: selalu gray secondary, `font-semibold`
- Edit form batal: reset semua field form (tanggal, catatan) — bukan hanya close

### Implementasi Aktual

| Halaman | File |
|---|---|
| B2B Event Order Detail | `EventOrderDetailHeader.jsx` |
| PP Order Detail | `PPOrderDetailPage.jsx` (inline, belum diekstrak) |
| PP Lead Detail | `PPLeadDetailPage.jsx` (inline, belum diekstrak) |

---

## 14. Toggle Status Entity — Aktif / Nonaktif

Pola standar untuk menampilkan dan mengubah status **aktif/nonaktif** sebuah entitas. Berlaku untuk semua halaman list yang memiliki kolom status biner (aktif ↔ nonaktif).

### Dua jenis toggle di project ini — JANGAN tertukar

| Jenis | Komponen | Dipakai untuk | File contoh |
|---|---|---|---|
| **Toggle Status Entitas** | `ToggleLeft`/`ToggleRight` dari lucide-react | Flip status data master (aktif ↔ nonaktif) — ada badge teks di samping | `PPPromoPage`, `PPProgramDBPage`, `OPSMitraPage` |
| **Toggle Section Form** | Custom `ToggleSwitch` (pill HTML) | Show/hide section form — expand/collapse UI, bukan perubahan data status | `PPFitnessAssessmentPage` |

⚠️ **Jangan gunakan lucide ToggleLeft/ToggleRight untuk expand/collapse section form** — itu fungsi UI, bukan status data.
⚠️ **Jangan gunakan custom pill toggle untuk status entitas** — tidak ada badge teks, tidak konsisten dengan halaman lain.


### Dua konteks pemakaian

| Konteks | Kapan dipakai | Ukuran toggle |
|---|---|---|
| **Inline table row** | Kolom status di tabel list — klik langsung flip status | `size={18}` |
| **Modal / form** | Field status di dalam modal add/edit | `size={28}` |

### Pattern A — Inline table row (STANDAR UTAMA)

```jsx
// Import yang dibutuhkan
import { ToggleLeft, ToggleRight } from 'lucide-react'

// Di dalam <td> kolom status:
<td className="px-3 py-2.5">
  <button
    onClick={() => handleToggleAktif(item.id)}
    className="flex items-center gap-1.5 group"
    title={item.aktif ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
  >
    {item.aktif
      ? <ToggleRight size={18} className="text-[#1E1C43] shrink-0" />
      : <ToggleLeft  size={18} className="text-gray-300 shrink-0"  />}
    <span className={`text-xs font-medium border px-1.5 py-0.5 rounded-full whitespace-nowrap ${
      item.aktif
        ? 'bg-green-50 text-green-700 border-green-200'
        : 'bg-gray-50 text-gray-500 border-gray-200'
    }`}>
      {item.aktif ? 'Aktif' : 'Nonaktif'}
    </span>
  </button>
</td>
```

**Handler (ubah status di store):**
```js
function handleToggleAktif(id) {
  updateStoredItem(id, { aktif: !list.find(x => x.id === id).aktif })
  setList(getStoredItems()) // refresh dari store
}
```

### Pattern B — Modal / form field

```jsx
<div className="flex items-center gap-3">
  <button
    onClick={() => setForm(f => ({ ...f, aktif: !f.aktif }))}
    className="shrink-0"
  >
    {form.aktif
      ? <ToggleRight size={28} className="text-[#1E1C43]" />
      : <ToggleLeft  size={28} className="text-gray-300"  />}
  </button>
  <div>
    <p className="text-xs font-semibold text-gray-700">
      {form.aktif ? 'Aktif' : 'Nonaktif'}
    </p>
    <p className="text-[10px] text-gray-400 mt-0.5">
      {form.aktif ? 'Dapat digunakan' : 'Tidak aktif — tidak bisa dipakai'}
    </p>
  </div>
</div>
```

### Aturan wajib

- **Import**: `ToggleLeft, ToggleRight` dari `lucide-react` — SELALU keduanya sekaligus
- **Warna aktif**: `text-[#1E1C43]` (navy) — BUKAN hijau, BUKAN orange
- **Warna nonaktif**: `text-gray-300`
- **Badge warna** — ikuti persis, jangan improvisasi:
  - Aktif → `bg-green-50 text-green-700 border-green-200`
  - Nonaktif → `bg-gray-50 text-gray-500 border-gray-200` — BUKAN `bg-gray-100 text-gray-400` (lebih gelap, tidak sesuai standar)
- **Label teks** — WAJIB tanpa tanda hubung:
  - ✓ `'Aktif'` dan `'Nonaktif'`
  - ✗ `'Non-Aktif'` — dilarang, tidak konsisten
- **DILARANG** menampilkan status hanya sebagai plain badge tanpa toggle di halaman yang memiliki entitas config/master data (Program, Promo, Jenis, dll)
- **Pengecualian**: entity operasional yang status-nya berubah melalui workflow bisnis (Order, Lead, Invoice) → gunakan badge saja, ubah status melalui tombol aksi eksplisit atau modal

### Halaman yang sudah pakai standar ini

| Halaman | Status |
|---|---|
| `PPPromoPage.jsx` | ✓ Sudah — inline toggle + badge |
| `PPProgramDBPage.jsx` | ✓ Sudah — inline toggle + badge (field `status`: `'aktif'` / `'inactive'`) |
| `OPSMitraPage.jsx` | ✓ Sudah — toggle di card grid (bukan tabel), local state dari `mitraList` |
| `OPSPICPage.jsx` | ⚠️ SKIP — status 3-pilihan (aktif/cuti/nonaktif), binary toggle tidak berlaku |

**Catatan OPSMitraPage (card grid):** karena layout card bukan tabel, toggle dipasang di dalam card komponen dan aksi `e.stopPropagation()` diperlukan agar klik toggle tidak bubble ke handler card parent. Pola toggle tetap sama secara visual.

---

## 19. Promo & Diskon System (PP Module)

Sistem promo PP diimplementasikan di 4 layer: data model, store/validator, form input, dan tampilan di order detail + invoice.

### Data Model (`ppPromoData.js`)

Setiap entry promo memiliki field berikut:

```js
{
  id: 'PROMO-001',
  kode: 'RAMADAN26',
  nama: 'Promo Ramadan 2026',
  tipe: 'diskon',        // 'diskon' | 'bonus'
  subTipe: 'persen',     // diskon: 'persen' | 'nominal'; bonus: 'treatment' | 'latihan' | 'produk'
  nilai: 20,             // angka: persen (%) atau nominal (Rp)
  status: 'aktif',       // 'aktif' | 'nonaktif'
  programIds: null,      // null = berlaku semua; array string = hanya program tertentu
  tanggalMulai: '2026-03-01',   // null = tanpa batas awal
  tanggalBerakhir: '2026-03-31', // null = tidak expired
  maxPemakaian: 100,     // null = tidak terbatas
  jumlahPemakaian: 0,    // counter usage
  benefitBonus: 'Sesi stretching gratis 30 mnt',  // null untuk tipe diskon
  keterangan: '...',
  tema: {                // null jika bukan promo tematik
    nama: 'Ramadan Kareem',
    icon: '🌙',
    warna: 'green',      // key ke TEMA_WARNA_CLS
    berlakuHingga: '31 Mar 2026',
  }
}
```

**`TEMA_WARNA_CLS`** — color map untuk banner tematik:
```js
export const TEMA_WARNA_CLS = {
  red:    'bg-red-50 text-red-600 border-red-200',
  blue:   'bg-blue-50 text-blue-600 border-blue-200',
  green:  'bg-green-50 text-green-600 border-green-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
}
```

### Validator (`ppPromoStore.js`)

Selalu gunakan `validatePromo()` — JANGAN lookup manual ke array. Fungsi ini melakukan 5-layer validation:

```js
import { validatePromo, incrementPemakaian } from '../../data/ppPromoStore'
import { TEMA_WARNA_CLS } from '../../data/ppPromoData'

// Signature:
const result = validatePromo(kode, { programId: null, tanggal: null })
// result.valid === true  → result.promo = objek promo lengkap
// result.valid === false → result.error = pesan error bahasa Indonesia spesifik

// 5 layer (urutan):
// 1. kode tidak ditemukan
// 2. status nonaktif
// 3. tanggalBerakhir sudah lewat (kadaluarsa)
// 4. tanggalMulai belum tercapai (belum mulai)
// 5. programIds restriction (kalau programId diberikan)
// 6. maxPemakaian habis (kuota_habis)
```

Setelah order berhasil dibuat/dipakai:
```js
incrementPemakaian(kode)  // tambah jumlahPemakaian +1
```

### Section Kode Promo di Form Order Baru

State yang dibutuhkan:
```js
const [promoKodeInput, setPromoKodeInput] = useState('')
const [promoApplied, setPromoApplied] = useState(null)
const [promoError, setPromoError] = useState('')
```

Computed values:
```js
const nilaiDiskon = (() => {
  if (!promoApplied || promoApplied.tipe !== 'diskon') return 0
  if (promoApplied.subTipe === 'persen') return Math.round(totalNilai * promoApplied.nilai / 100)
  return Math.min(promoApplied.nilai, totalNilai)
})()
const totalSetelahPromo = totalNilai - nilaiDiskon
```

Handler apply/clear:
```js
const handleApplyPromo = () => {
  const kode = promoKodeInput.trim()
  if (!kode) return
  const result = validatePromo(kode, { programId: selectedPaket?.id || null })
  if (result.valid) { setPromoApplied(result.promo); setPromoError('') }
  else { setPromoApplied(null); setPromoError(result.error) }
}
const handleClearPromo = () => { setPromoApplied(null); setPromoKodeInput(''); setPromoError('') }
```

Data yang disimpan saat `handleSimpanOrder`:
```js
nilaiKontrak: totalSetelahPromo,
nilaiDiskon,
promoKode: promoApplied?.kode || null,
promoTipe: promoApplied?.tipe || null,
promoBenefitBonus: promoApplied?.tipe === 'bonus' ? (promoApplied.keterangan || promoApplied.benefitBonus || null) : null,
promoTema: promoApplied?.tema || null,
```

### Tampilan Promo di Order Detail Page

Letakkan blok ini **antara biaya tambahan dan navy total box**:

```jsx
{/* Tema promo banner */}
{order.promoTema && (() => {
  const t = order.promoTema
  const cls = TEMA_WARNA_CLS[t.warna] || 'bg-gray-50 text-gray-600 border-gray-200'
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border mt-3 ${cls}`}>
      <Sparkles size={13} className="shrink-0" />
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold">{t.icon} Promo Tematik: {t.nama}</span>
        {t.berlakuHingga && <span className="text-[10px] opacity-70">· berlaku s/d {t.berlakuHingga}</span>}
      </div>
    </div>
  )
})()}

{/* Baris subtotal + diskon */}
{order.nilaiDiskon > 0 && (
  <div className="border border-gray-100 rounded-xl px-3 py-2.5 mt-3 space-y-1.5">
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-500">Subtotal</span>
      <span className="text-xs font-semibold text-gray-700">{formatRp(subtotalRaw)}</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="flex items-center gap-1.5 text-xs text-green-700">
        <Tag size={11} />
        Diskon Promo
        {order.promoKode && <span className="bg-green-100 px-1.5 py-0.5 rounded font-mono font-semibold">{order.promoKode}</span>}
      </span>
      <span className="text-xs font-semibold text-green-700">−{formatRp(order.nilaiDiskon)}</span>
    </div>
  </div>
)}

{/* Bonus promo (tipe bonus, tanpa potongan harga) */}
{order.promoBenefitBonus && !order.nilaiDiskon && (
  <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-3">
    <Tag size={12} className="text-green-600 shrink-0 mt-0.5" />
    <div>
      <p className="text-xs font-semibold text-green-700">
        Promo Bonus{order.promoKode && <span className="font-mono ml-1">({order.promoKode})</span>}
      </p>
      <p className="text-[10px] text-green-600 mt-0.5">{order.promoBenefitBonus}</p>
    </div>
  </div>
)}

{/* Navy total box — label + value berubah jika ada promo diskon */}
<div className="bg-[#1E1C43] rounded-xl px-4 py-3 flex justify-between items-center mt-3">
  <span className="text-sm font-medium text-white/80">
    {order.nilaiDiskon > 0 ? 'Total Setelah Promo' : 'Total Nilai Order'}
  </span>
  <span className="text-sm font-bold text-white">
    {formatRp(order.nilaiDiskon > 0 ? (order.nilaiKontrak ?? subtotalRaw - order.nilaiDiskon) : subtotalRaw)}
  </span>
</div>
```

**Aturan:**
- Import `Sparkles, Tag` dari `lucide-react`; import `TEMA_WARNA_CLS` dari `../../data/ppPromoData`
- `subtotalRaw` = sum dari rincian items (sebelum promo) — tampilkan sebagai subtotal hanya jika ada diskon
- Backward compatible: order lama tanpa `promoKode`/`nilaiDiskon` tidak menampilkan promo block sama sekali

### Thematic Banner di Invoice Document

Di PPInvoiceDetailPage, banner tema promo ditempatkan **antara navy header card dan section Tagihan Kepada**:

```jsx
{invoice.promoTema && (() => {
  const t = invoice.promoTema
  const cls = TEMA_WARNA_CLS[t.warna] || 'bg-gray-50 text-gray-600 border-gray-200'
  return (
    <div className={`flex items-center gap-3 px-6 sm:px-8 py-3 border-b ${cls}`}>
      <Sparkles size={14} className="shrink-0" />
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold">{t.icon} Promo Tematik: {t.nama}</span>
        {t.berlakuHingga && <span className="text-[10px] opacity-70">· berlaku s/d {t.berlakuHingga}</span>}
      </div>
    </div>
  )
})()}
```

### Perbedaan Tipe Promo

| | `tipe: 'diskon'` | `tipe: 'bonus'` |
|---|---|---|
| Effect ke harga | Ya — kurangi `nilaiKontrak` | Tidak — harga tetap |
| `nilaiDiskon` | > 0 | 0 atau undefined |
| `promoBenefitBonus` | null | string deskripsi benefit |
| Display | Baris subtotal + diskon hijau | Kartu hijau info bonus |
| `subTipe` | `'persen'` / `'nominal'` | `'treatment'` / `'latihan'` / `'produk'` |

