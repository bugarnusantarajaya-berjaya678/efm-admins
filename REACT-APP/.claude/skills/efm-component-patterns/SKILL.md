---
name: efm-component-patterns
description: Reusable, battle-tested UI component patterns for the EFM V2 (Essential Fitness Management) React admin dashboard project — covers the scrollable-body modal, photo preview popup, full invoice template structure, filterable activity log, pipeline/stage progress visual, and the official List Page Template (Header + KPI cards + Filter bar + Table with pagination). MUST be checked before building any modal, image preview, invoice page, activity/history log, leads pipeline visual, or list page in this project — these patterns have been built multiple times before, so reuse them exactly rather than reinventing a new structure. Always consult this skill even if the request only vaguely resembles one of these patterns (e.g. "add a popup", "show a log of changes", "add a status stepper", "add a new list page").
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

**Edit mode behavior**
- Toggled by "Edit Invoice" button
- Tanggal/Jatuh Tempo become date inputs (Jatuh Tempo minimum H+2 from Tanggal), Catatan becomes textarea, Syarat & Ketentuan becomes editable list, discount/tax fields become interactive
- Footer switches to "Batal" / "Simpan" buttons instead of the normal action row
- All calculation numbers update live as edits are made

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

```jsx
// Parent (misal PPLeadDetailPage.jsx)
navigate('/pp/screening/new', {
  state: {
    leadId: lead.id,
    namaKlien: lead.nama,
    picEfm: lead.picEfm,
  }
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

const isNew    = id === 'new'
const leadId   = state?.leadId || null
const namaKlien = state?.namaKlien || ''

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

### handleBack — navigasi balik dengan konteks

```jsx
const handleBack = () => {
  if (leadId) {
    navigate(`/pp/leads/${leadId}`, { state: { defaultTab: 'kesehatan' } })
  } else {
    navigate('/pp/screening')  // fallback jika dibuka langsung dari URL
  }
}
```

Gunakan `handleBack` di: tombol arrow back di header, tombol "Kembali" di footer.

### handleSave — simpan dan kirim data balik ke parent

```jsx
const handleSave = () => {
  if (isNew) {
    const newRecord = {
      id: 'SCR-26-' + String(Date.now()).slice(-4), // atau ID yang dihasilkan
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      namaKlien,
      statusScreening: 'Draft',
      picScreening: picEfm,
      orderId: null,
    }
    if (leadId) {
      navigate(`/pp/leads/${leadId}`, {
        state: { defaultTab: 'kesehatan', newScreening: newRecord }
      })
    } else {
      navigate('/pp/screening')
    }
  } else {
    // existing: simpan perubahan lokal, keluar dari edit mode
    setIsEditing(false)
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

