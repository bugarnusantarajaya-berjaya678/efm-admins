---
name: efm-design-standards
description: Design and coding standards for the EFM V2 (Essential Fitness Management) React admin dashboard project — brand colors, fonts, document/ID numbering formats (PP, B2B, Event modules), font size rules for tables/labels/KPI cards, and standard component patterns (table wrapper, filter bar, modal, status badge, KPI card). MUST be checked FIRST before writing or editing ANY UI code in this project — styling, new components, tables, KPI cards, badges, filter bars, modals, invoice/document numbering, or dummy/placeholder data. Always consult this skill even for small UI tweaks or "just fix this component" requests, since inconsistent font sizes and ad-hoc ID formats are recurring bugs in this project.
---

# EFM V2 Design Standards

Reference rules + ready-to-use code patterns for the EFM V2 admin dashboard. Always check this skill before writing or editing any UI code, generating dummy data, or creating document/ID numbers in this project.

## 1. Brand Colors & Fonts

**Primary Colors**
| Color | Hex | Usage | Tailwind |
|---|---|---|---|
| Navy (primary/dark) | `#1E1C43` | sidebar bg, headers, primary buttons, bold important values, active states | `bg-[#1E1C43]`, `text-[#1E1C43]` |
| Accent/Orange | `#E05945` | active menu highlight, CTA buttons, alerts, price/total emphasis, left border accent (`border-l-4`) | `bg-[#E05945]`, `text-[#E05945]` |
| Background | `#F5F5F7` | page background (outside cards) | `bg-[#F5F5F7]` |
| Surface/Card | `#FFFFFF` | all cards, tables, modals | `bg-white` |

**Status/Semantic Colors** (badges, alerts)
| Meaning | Tailwind |
|---|---|
| Success / Lunas / Aktif | `bg-green-50 text-green-700 border-green-200` |
| Warning / Pending / Draft | `bg-yellow-50 text-yellow-700 border-yellow-200` |
| Error / Overdue / Gagal | `bg-red-50 text-red-700 border-red-200` |
| Info / Terkirim / Proses | `bg-blue-50 text-blue-700 border-blue-200` |
| Neutral / Inactive | `bg-gray-50 text-gray-500 border-gray-200` |

Badge base pattern: `px-2 py-1 text-xs rounded-full font-medium` + color combo above.

**Font**
- Family: **Poppins** globally (body). No other font families anywhere in the project.

**Font Weight Usage**
| Weight | Where |
|---|---|
| `font-black` | ONLY large document titles (e.g. "INVOICE" header) |
| `font-bold` | section titles, KPI numbers, important values |
| `font-semibold` | table data, names, values in info cards |
| `font-medium` | buttons, badges |
| normal | body text, descriptions |

---

## 2. ID / Document Numbering Format

General pattern: `[DOCTYPE]-[MODULE]-[YY]-[SEQUENCE]` (e.g. `INV-PP-26-0001`)
- `YY` = 2-digit year, sequence resets to `0001` every Jan 1
- `SEQUENCE` = 4-digit zero-padded, increments per doc type per module per year
- **Exception:** Lead IDs are permanent — no year, never reset

| Doc | PP | B2B | Event |
|---|---|---|---|
| Lead | `LP-0001` | `LB-0001` | `LE-0001` |
| Screening/Survei/Konsultasi | `SCR-26-0001` | `SVY-26-0001` | `KNS-26-0001` |
| Order | `PP-26-0001` (`#PP-26-0001`) | `B2B-26-0001` (`#B2B-26-0001`) | `EV-26-0001` (`#EV-26-0001`) |
| Invoice | `INV-PP-26-0001` | `INV-B2B-26-0001` | `INV-EV-26-0001` |
| Receipt | `RCP-PP-26-0001` | `RCP-B2B-26-0001` | `RCP-EV-26-0001` |
| Agreement/LOI | `AGR-PP-26-0001` | `LOI-EFM-B2B-26-0001` | `LOI-EFM-EVENT-26-0001` |

**Display rules**
- Order IDs always shown with `#` prefix in UI headers/titles and when referenced inside other documents (e.g. "Invoice #INV-PP-26-0011")
- Table cells: no `#` prefix in general, EXCEPT the Order ID column, which does use `#`
- All ID values in tables: `font-semibold text-[#1E1C43] whitespace-nowrap` — JANGAN `font-medium` atau `font-normal`, selalu semibold navy

**Dummy/placeholder data:** always follow this exact format. Never generic IDs like `ORD-001` or `INV-001` without module code and year.

---

## 3. Font Sizes (Tables, Labels, KPI Cards)

⚠️ Recurring bug in this project: fonts too large/inconsistent. Follow exactly.

**Info card fields**
- Label: `text-xs text-gray-400 uppercase tracking-wide`
- Value: `text-sm font-semibold text-gray-800`
- Container: `bg-gray-50 rounded-lg p-3`

**Form input fields** (detail/form pages — bukan tabel list)
- Normal (editable): `w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1E1C43] bg-white`
- Read-only / auto-filled (locked): `w-full text-sm border border-gray-100 rounded-lg px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed`
- Label form: `text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block`
- Gunakan per-field locking (Section 11 di `efm-component-patterns`) untuk field auto-fill dari order, bukan wrapper `pointer-events-none`

**Section titles**
- `text-sm font-bold text-[#1E1C43]`, often with `border-l-4 border-[#E05945] pl-3`

**Table**
- Header: `text-xs font-semibold text-gray-400 uppercase tracking-wide`
- Body/data: `text-xs text-gray-600` (list pages pakai `text-xs`, bukan `text-sm`)
- Names/important data: `text-xs font-medium text-gray-900`
- ID columns: `text-xs font-semibold text-[#1E1C43] whitespace-nowrap` — WAJIB semibold navy, berlaku untuk SEMUA kolom ID: No. Invoice, No. Receipt, No. Agreement, Order ID, Lead ID, dsb.
- Amount/angka: `text-xs font-semibold text-gray-600`

**KPI cards**
- Big number: `text-2xl font-bold text-[#1E1C43]`
- Label: `text-xs uppercase tracking-wide text-gray-400`
- Container: `bg-white rounded-xl border border-gray-200 p-4`

**Document headers** (Invoice/Receipt titles)
- `text-4xl font-black` — ONLY place this scale/weight is used, ever

**Badges:** `text-xs font-medium`, `px-2 py-1 rounded-full`

**Buttons — Warna & Ukuran**

### Aturan Warna Tombol (FINAL — berlaku semua modul PP, B2B, Event)

| Warna | Hex | Gunakan untuk | Contoh |
|---|---|---|---|
| **Orange (CTA)** | `#E05945` | Aksi bisnis utama yang menggerakkan workflow — maks 1 per halaman/section | Buat Order Baru, Konfirmasi Pembayaran, Kirim Invoice, Tambah Lead |
| **Navy (Primary)** | `#1E1C43` | Save/submit standard di form dan modal | Simpan, Lanjut, Terapkan |
| **Gray secondary** | `border-gray-300 text-gray-600` | Navigasi & pembatalan | **Kembali**, Batal, Reset, Download PDF |
| **Red** | `bg-red-600` | Aksi destruktif | Hapus, Delete |

⚠️ **Kembali SELALU gray secondary** — BUKAN orange, BUKAN navy. Berlaku di semua modul dan semua page.
⚠️ **Orange adalah CTA eksklusif** — jika 2+ tombol orange ada di 1 baris, salah satunya salah; ganti yang bukan CTA utama ke navy atau gray.
⚠️ **Dilarang:** `text-[13px]` (ganti ke `text-sm`), `py-[7px]` (ganti ke `py-2`), `rounded-xl` pada tombol (standar `rounded-lg`).

### Aturan Ukuran Tombol per Konteks

| Konteks | Class dasar (tambahkan warna sesuai tipe) |
|---|---|
| **Header page** — action row di kanan atas halaman | `flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-colors` |
| **List page** — tombol Buat/Tambah Baru | `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors` |
| **Modal footer** — Batal / Simpan | `px-4 py-2 rounded-lg text-sm font-semibold transition-colors` |
| **Section CTA standalone** — Konfirmasi, Kirim | `flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors` |
| **Inline kecil** — Edit/Lihat di dalam baris tabel | `px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors` |

**Common mistake to avoid:** never use `text-base`, `text-lg`, or `text-xl` for field values, table data, or labels. `text-sm` is correct for form inputs and section titles in detail/form pages — but NOT for table body cells in list pages (use `text-xs` there). `text-[10px]` is standard for all field labels (both form pages and list-page table headers).

---

## 3b. Full-Page Form / Sub-page — Header Card Standard

> **Tiga varian header card** ada di project ini — pilih berdasarkan tipe halaman:
> - **List page** (Invoice list, Receipt list, Screening list, Documents list, dll): gunakan pola **Section 3c** — `flex-col sm:flex-row`, tanpa eyebrow label.
> - **Form / sub-page** (Assessment Detail, Screening Detail, Konsultasi Detail, Order New, dll): gunakan **ikon bulat navy** — pola di section ini (3b).
> - **Entity detail page** (Lead Detail, Order Detail): gunakan **initials avatar berwarna** — lihat `efm-component-patterns` Section 15.

⚠️ **Jangan gunakan pola 3b (eyebrow + `flex items-start`) untuk list page** — list page pakai pola 3c.

Header card untuk semua sub-page forms (Assessment Detail, Screening Detail, Konsultasi Detail, Order New, dll). Ini adalah struktur WAJIB — jangan improvisasi dengan `flex-col sm:flex-row` atau variasi lain.

```jsx
{/* Header Card — selalu full-bleed tanpa outer horizontal padding */}
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
  <div className="flex items-start justify-between gap-4 flex-wrap">

    {/* Kiri: ikon bulat + judul + sub-info */}
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
        <IconName size={22} className="text-white" />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
          Module — Sub-context
        </p>
        <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">
          Judul Halaman / ID Record
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Sub-info opsional (nama klien, status, dll)
        </p>
      </div>
    </div>

    {/* Kanan: tombol Kembali (dan tombol lain jika perlu) */}
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft size={12} /> Kembali
      </button>
    </div>

  </div>
</div>
```

**Aturan wajib:**
- Outer wrapper: `flex items-start justify-between gap-4 flex-wrap` — JANGAN `flex-col sm:flex-row sm:items-center sm:justify-between`
- `items-start` (bukan `items-center`): ikon dan teks di-align top, tombol Kembali di top-right — tidak bergeser ke tengah saat tinggi berbeda
- Tombol kanan: selalu dalam wrapper `flex items-center gap-2 flex-shrink-0` agar tidak shrink saat ruang sempit
- Tombol Kembali: selalu gray secondary (`border border-gray-300 text-gray-600 hover:bg-gray-50`), BUKAN orange atau navy
- `flex-wrap` pada outer: tombol turun ke baris baru di mobile, tidak menimpa judul
- Ikon: `w-12 h-12 rounded-full bg-[#1E1C43] shrink-0` — lingkaran navy, JANGAN shrink

---

## 3c. List Page — Header Card Standard

Pola untuk semua halaman **list** (Invoice, Receipt, Agreement, Screening, Orders, Leads, dll). Berbeda dari 3b: tidak ada eyebrow label, tombol pakai `flex-col sm:flex-row` bukan `flex-shrink-0`.

```jsx
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

    {/* Kiri: ikon bulat + judul + subtitle */}
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
        <IconName size={20} className="text-white" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">Judul Halaman</h1>
        <p className="text-sm text-text-muted mt-0.5">Deskripsi singkat konten halaman</p>
      </div>
    </div>

    {/* Kanan: tombol aksi (CTA + Kembali) */}
    <div className="flex flex-col sm:flex-row gap-2">
      <button className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
        <Plus size={13} /> Buat Baru
      </button>
      <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">
        <ArrowLeft size={12} /> Kembali ke ...
      </button>
    </div>

  </div>
</div>
```

**Aturan wajib:**
- Outer wrapper: `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3` — JANGAN `flex items-start justify-between gap-4 flex-wrap`
- **Tidak ada eyebrow label** (`<p className="text-[10px]...">`) di atas judul — eyebrow hanya di pola 3b
- Subtitle: `text-sm text-text-muted mt-0.5` — bukan `text-xs text-gray-400`
- Tombol kanan: `flex flex-col sm:flex-row gap-2` — di mobile tombol susun vertikal, di desktop horizontal
- Ikon tetap: `w-12 h-12 rounded-full bg-[#1E1C43] shrink-0`
- Tombol Kembali: selalu gray secondary, BUKAN orange
- Jika ada tombol toggle (Template Invoice/Agreement), gunakan navy outline bukan orange

---

## 3a. Standard Column Minimum Widths (Table)

Gunakan nilai ini sebagai acuan `style={{minWidth:'Xpx'}}` per `<th>` di semua halaman list.
Ini mencegah kolom "Nama Klien" di Invoice berbeda lebar dengan "Nama Klien" di Orders, yang menyebabkan wrap berbeda.

| Tipe Kolom | minWidth |
|---|---|
| No. Invoice / No. Receipt / No. Agreement | 160–175px |
| Lead ID | 110px |
| Order ID | 130px |
| Nama Klien / Nama Perusahaan | 160px |
| Paket / Program / Layanan / Nama Event | 160px |
| PIC EFM / Pelatih / Koordinator | 130px |
| Tanggal / Tgl Bayar / Jatuh Tempo / Tgl Event | 120px |
| Kota / Tipe / Jenis | 110px |
| Stage / Tahapan | 120px |
| Status | 120px |
| No. HP / No. WA | 130px |
| Nilai Kontrak / Total | 130px |
| Aksi | 100px |

**Cara terapkan di `<th>`:**
```jsx
<th style={{minWidth:'160px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
  Nama Klien
</th>
```

**Cara terapkan dengan loop `[h, mw]` (dipakai di halaman dengan banyak kolom):**
```jsx
{[['No Invoice',165],['Order ID',130],['Nama Klien',160],['Status',120],['Aksi',100]].map(([h, mw]) => (
  <th key={h} style={{minWidth:mw}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
    {h}
  </th>
))}
```

---

## 4. Component Patterns

### Table Wrapper (always use this structure)
```jsx
<div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
  <table className="w-full" style={{ minWidth: '1000px' }}>
    <thead>
      <tr className="border-b border-gray-200">
        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
          Column Name
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition">
        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
          Data
        </td>
      </tr>
    </tbody>
  </table>
</div>
```
- `minWidth` scales with column count/content, typical 1000px–1600px
- ID columns: `whitespace-nowrap text-sm font-medium text-[#1E1C43]`
- Name/important columns: `text-sm font-semibold text-gray-800`
- Regular data: `text-sm text-gray-700`
- Every clickable row: `hover:bg-gray-50 cursor-pointer transition`
- Never omit the `overflow-x-auto` wrapper

### Filter Bar
```jsx
<div className="bg-white rounded-xl shadow-sm p-4 mb-4">
  <div className="flex gap-3 mb-3">
    <select className="flex-1 ...">...</select>
    <select className="flex-1 ...">...</select>
    <div style={{ width: '72px' }}></div>
  </div>
  <div className="flex gap-3">
    <input className="flex-1 ..." placeholder="Cari..." />
    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">Reset</button>
  </div>
</div>
```

### Modal
- Outer: `fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`
- Inner: `bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]`
- Header: `flex-shrink-0`
- Body: `overflow-y-auto flex-1`
- Footer: `flex-shrink-0`

### KPI Card Row
```jsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <p className="text-xs uppercase tracking-wide text-gray-400">Label</p>
    <p className="text-2xl font-bold text-[#1E1C43] mt-1">Value</p>
  </div>
</div>
```

### Status Badge
```jsx
const statusColors = {
  draft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  terkirim: 'bg-blue-50 text-blue-700 border-blue-200',
  lunas: 'bg-green-50 text-green-700 border-green-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
}

<span className={`px-2 py-1 text-xs rounded-full font-medium border ${statusColors[status]}`}>
  {statusLabel}
</span>
```

---

## 5. Invoice & Receipt Document Standards

### 5a. Status Label — WAJIB Bahasa Indonesia (PP, B2B, Event)

Semua status invoice/receipt di seluruh modul harus konsisten berbahasa Indonesia. Sumber kebenaran di `ppInvoiceData.js` (`STATUS_LABEL`), pastikan filter dropdown, badge, dan label di semua halaman menggunakan mapping yang sama.

| Key | Label UI |
|---|---|
| `paid` | `Lunas` |
| `pending` | `Menunggu Pembayaran` |
| `overdue` | `Jatuh Tempo` |
| `draft` | `Draft` |

⚠️ **Dilarang:** `'Paid'`, `'Awaiting Payment'`, `'Overdue'` (Inggris) — selalu ganti ke label Indonesia di atas.

⚠️ **Penulisan `Lunas`**: selalu *title case* (`Lunas`), BUKAN all-caps (`LUNAS`) — berlaku di badge document header, teks konfirmasi, label field, dan semua UI. All-caps `LUNAS` adalah pola lama yang sudah dihapus.

### 5b. Invoice/Receipt — Navy Header (kiri: info perusahaan)

```jsx
<div className="bg-[#1E1C43] rounded-t-2xl px-6 py-5 sm:px-8 sm:py-6 grid grid-cols-2 gap-4 text-white">
  {/* Kiri — logo + info perusahaan */}
  <div className="flex items-start gap-3">
    {cs.logoPerusahaan ? (
      <img src={cs.logoPerusahaan} alt="EFM Logo"
        className="w-20 h-20 rounded-full object-contain shrink-0" />
    ) : (
      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center shrink-0">
        <span className="text-white font-black text-base">EFM</span>
      </div>
    )}
    <div className="min-w-0">
      <p className="text-base font-bold leading-snug">{cs.namaPerusahaan}</p>
      <p className="text-xs text-white/70 mt-0.5">{cs.namaLegal}</p>
      <p className="text-xs text-white/70 mt-0.5 leading-relaxed max-w-xs">{cs.alamat}</p>
      <p className="text-xs text-white/70 mt-0.5">{cs.email}</p>
      <p className="text-xs text-white/70 mt-0.5">{cs.telepon}</p>
    </div>
  </div>
  {/* Kanan — lihat 5c/5d */}
</div>
```

**Aturan wajib:**
- Logo: `w-20 h-20 rounded-full object-contain shrink-0`
- `namaPerusahaan`: `text-base font-bold` (bukan `text-sm`)
- Sub-info: `text-xs text-white/70` (bukan `text-white/60`)
- Selalu tampilkan: `namaPerusahaan`, `namaLegal`, `alamat`, `email`, `telepon`

### 5c. Invoice — Header Kanan

```jsx
<div className="text-right">
  <div className="text-4xl font-black tracking-widest uppercase">INVOICE</div>
  <div className="text-sm text-gray-300 mt-0.5">{invoice.invNo}</div>

  <div className="flex justify-end items-center gap-2 mb-0.5 mt-0.5">
    <span className="text-xs text-gray-400">Tanggal:</span>
    <span className="font-semibold text-sm">{invoice.tanggal}</span>
  </div>
  <div className="flex justify-end items-center gap-2 mb-0.5">
    <span className="text-xs text-gray-400">Jatuh Tempo:</span>
    <span className="font-semibold text-sm">{invoice.due}</span>
  </div>

  <span className={`px-4 py-1 rounded-full text-white text-sm font-semibold inline-block mt-0.5 ${statusBadgeCls}`}>
    {STATUS_LABEL[invoice.status]}
  </span>
</div>
```

### 5d. Receipt — Header Kanan

```jsx
<div className="text-right">
  <div className="text-4xl font-black tracking-widest uppercase">RECEIPT</div>
  <div className="text-sm text-gray-300 mt-0.5">{rcp.rcpNo}</div>

  <div className="flex justify-end items-center gap-2 mb-0.5 mt-0.5">
    <span className="text-xs text-gray-400">Ref. Invoice</span>
    <button onClick={() => onGoToInvoice(rcp.invNo)}
      className="font-semibold text-sm hover:underline">{rcp.invNo}</button>
  </div>
  <div className="flex justify-end items-center gap-2 mb-0.5">
    <span className="text-xs text-gray-400">Order ID</span>
    <button onClick={() => onGoToOrder(rcp.orderId)}
      className="font-semibold text-sm hover:underline">#{rcp.orderId}</button>
  </div>

  <span className="px-4 py-1 rounded-full text-white text-sm font-semibold inline-block mt-0.5 bg-green-500">
    Lunas
  </span>
</div>
```

**Aturan wajib (berlaku Invoice & Receipt):**
- Nomor dokumen di bawah judul: `text-sm text-gray-300` (bukan `text-xs`)
- Meta rows (Tanggal, Ref. Invoice, dll): label `text-xs text-gray-400`, value `font-semibold text-sm`
- Status badge di header navy: `px-4 py-1 rounded-full text-white text-sm font-semibold` — lebih besar dari badge tabel biasa
- Page header `h1`: `Receipt #RCP-PP-27-0001` / `Invoice #INV-PP-27-0001` — selalu prefix `#` di judul page

### 5e. Invoice/Receipt — Section Body (Divider Pattern)

Body dokumen TIDAK menggunakan satu wrapper `space-y-5`. Setiap section adalah **full-bleed** dengan padding dan border sendiri:

```jsx
{/* Tiap section */}
<div className="px-6 sm:px-8 py-4 border-b border-gray-100">
  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
    Nama Section
  </p>
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
    {/* isi */}
  </div>
</div>

{/* Footer — section terakhir tanpa border-b */}
<div className="px-6 sm:px-8 py-4 text-center space-y-1">
  {/* footer */}
</div>
```

⚠️ **Jangan** gunakan `<div className="px-6 sm:px-8 py-6 space-y-5">` sebagai wrapper body — ini pola lama yang tidak punya divider antar section.

### 5f. Total Strip di Dalam Card (Invoice & Receipt)

```jsx
<div className="bg-[#1E1C43] px-4 py-2.5 flex items-center justify-between">
  <span className="text-xs font-bold text-white uppercase tracking-wide">Total Tagihan</span>
  <span className="text-base font-black text-white">{formatRp(total)}</span>
</div>
```

**Aturan:**
- Label: `text-xs font-bold text-white uppercase tracking-wide`
- Angka: `text-base font-black text-white` — bukan orange, bukan `text-xl`
- Padding: `py-2.5` (bukan `py-4`)

### 5g. Invoice & Receipt — Footer Copywriting

Footer dokumen selalu **2 baris**: satu kalimat kontekstual + satu baris brand.

**Invoice footer:**
```jsx
<div className="px-6 sm:px-8 py-4 border-t border-gray-100 text-center space-y-1">
  <p className="text-xs text-gray-400">Terima kasih atas kepercayaan Anda. Harap selesaikan pembayaran sesuai tenggat waktu yang tertera.</p>
  <p className="text-xs font-semibold text-gray-500">Powered by {cs.namaPerusahaan}&nbsp;&nbsp;|&nbsp;&nbsp;{cs.namaLegal}</p>
</div>
```

**Receipt footer:**
```jsx
<div className="px-6 sm:px-8 py-4 text-center space-y-1">
  <p className="text-xs text-gray-400">Terima kasih atas kepercayaan Anda. Simpan receipt ini sebagai bukti pembayaran yang sah.</p>
  <p className="text-xs font-semibold text-gray-500">Powered by {cs.namaPerusahaan}&nbsp;&nbsp;|&nbsp;&nbsp;{cs.namaLegal}</p>
</div>
```

**Aturan:**
- Selalu 2 baris — satu kalimat pesan + satu baris `Powered by`
- Brand + legal digabung satu baris: `Powered by {cs.namaPerusahaan}&nbsp;&nbsp;|&nbsp;&nbsp;{cs.namaLegal}` — BUKAN 2 baris terpisah
- BUKAN "program fitness Anda" — cukup "kepercayaan Anda" (EFM bukan hanya fitness)
- HAPUS: "Dokumen ini digenerate oleh sistem EFM V2" — tidak perlu ditampilkan ke klien

### 5h. Receipt — Barcode Absensi Sesi

Barcode di receipt digunakan untuk **absensi pelatih/terapis per sesi**, bukan verifikasi pembayaran.

- Judul section: `Barcode Absensi Sesi` — BUKAN "Kode Verifikasi Pembayaran"
- Label di bawah QR: hanya nomor receipt (`{rcp.rcpNo}`) — `text-[10px] font-semibold text-[#1E1C43] mt-1.5 text-center tracking-wide`
- TIDAK ADA sub-label "Tunjukkan setiap sesi" di bawah nomor — redundant, sudah ada deskripsi di section
- Deskripsi di dalam card: "Tunjukkan barcode ini kepada pelatih / terapis di setiap sesi pertemuan berlangsung"
- Size QR di section dedicated: `size={160}` (bukan default 72)

### 5i. Receipt — Sections yang Ada (Urutan Wajib)

Receipt body berisi section-section berikut (urutan ini wajib, jangan tambah section baru tanpa konfirmasi):

1. **Tagihan Kepada** — info klien
2. **Rincian Program** — paket, sesi, harga
3. **Total strip** (navy bar di dalam card Rincian Program)
4. **Detail Pembayaran** — tanggal bayar, metode
5. **Barcode Absensi Sesi** — QR/barcode untuk absensi
6. **Footer** — 2 baris (lihat 5g)

⚠️ **TIDAK ADA section "Catatan"** di receipt — section ini sudah dihapus. Jika perlu catatan, tampilkan di Invoice bukan Receipt.
