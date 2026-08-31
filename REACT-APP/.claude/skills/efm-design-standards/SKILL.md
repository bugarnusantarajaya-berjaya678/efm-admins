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

> **Dua varian header card** ada di project ini — pilih berdasarkan tipe halaman:
> - **Form / sub-page** (Fitness Assessment, Screening, Konsultasi Detail, Order New, dll): gunakan **ikon bulat navy** — pola di section ini.
> - **Entity detail page** (Lead Detail, Order Detail): gunakan **initials avatar berwarna** — lihat `efm-component-patterns` Section 15.

Header card untuk semua sub-page forms (Fitness Assessment, Screening, Konsultasi Detail, Order New, dll). Ini adalah struktur WAJIB — jangan improvisasi dengan `flex-col sm:flex-row` atau variasi lain.

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
