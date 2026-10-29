# DESAIN UI — EFM V2

> Dokumen untuk keperluan migrasi ke Google Apps Script (HtmlService).
> Data diambil dari kode aktual dan `.claude/skills/efm-design-standards/SKILL.md`.
> Bagian tidak pasti: [TIDAK PASTI]. Usulan: [USULAN].
> Terakhir diperbarui: Oktober 2026.

---

## 1. WARNA BRAND

| Nama | Hex | Dipakai untuk |
|---|---|---|
| Navy (primary) | `#1E1C43` | Sidebar bg, header, tombol primary, nilai penting, state aktif |
| Accent / Orange | `#E05945` | Menu aktif, tombol CTA, alert, total harga, border kiri aksen |
| Background page | `#F5F5F7` | Background halaman (luar kartu) |
| Surface / Card | `#FFFFFF` | Semua kartu, tabel, modal |

**Warna status / semantik (badge, alert):**
| Arti | Warna |
|---|---|
| Sukses / Lunas / Aktif | bg hijau muda, teks hijau gelap, border hijau |
| Peringatan / Pending / Draft | bg kuning muda, teks kuning gelap, border kuning |
| Error / Overdue / Gagal | bg merah muda, teks merah gelap, border merah |
| Info / Terkirim / Proses | bg biru muda, teks biru gelap, border biru |
| Netral / Inactive | bg abu muda, teks abu, border abu |

**Warna tombol (hierarki wajib):**
| Tipe | Hex | Dipakai untuk |
|---|---|---|
| Orange CTA | `#E05945` | 1 aksi bisnis utama per halaman/section: Buat Order, Konfirmasi Bayar, dll |
| Navy Primary | `#1E1C43` | Save/submit di form dan modal |
| Gray Secondary | `border-gray-300 text-gray-600` | Navigasi & pembatalan: **Kembali**, Batal, Reset |
| Red Danger | `bg-red-600` | Aksi destruktif: Hapus, Delete |

**Aturan tombol:**
- **Kembali** selalu gray secondary — tidak pernah orange atau navy
- Orange adalah CTA eksklusif — maksimal 1 per baris/section
- Tombol rounded: `rounded-lg` (bukan `rounded-xl`)

---

## 2. FONT

| Properti | Nilai |
|---|---|
| Family | **Poppins** (global, body) — tidak ada font lain di project ini |
| Weight `font-black` | HANYA untuk judul dokumen besar (header "INVOICE", "RECEIPT") |
| Weight `font-bold` | Judul section, angka KPI, nilai penting |
| Weight `font-semibold` | Data tabel, nama, nilai di info card |
| Weight `font-medium` | Tombol, badge |
| Normal | Body text, deskripsi |

---

## 3. UKURAN TEKS (aturan ketat — bug berulang jika tidak diikuti)

### Tabel List (halaman daftar)
| Elemen | Class |
|---|---|
| Header kolom `<th>` | `text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap` |
| Data biasa `<td>` | `text-xs text-gray-600` |
| Data nama/penting | `text-xs font-medium text-gray-900` |
| Kolom ID | `text-xs font-semibold text-[#1E1C43] whitespace-nowrap` |
| Angka/amount | `text-xs font-semibold text-gray-600` |

### Form / Halaman Detail
| Elemen | Class |
|---|---|
| Label field | `text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block` |
| Input editable | `text-sm border border-gray-200 rounded-lg px-3 py-2 focus:border-[#1E1C43]` |
| Input read-only | `text-sm border border-gray-100 rounded-lg px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed` |
| Nilai di info card | `text-sm font-semibold text-gray-800` |
| Label di info card | `text-xs text-gray-400 uppercase tracking-wide` |
| Container info card | `bg-gray-50 rounded-lg p-3` |

### KPI Card (halaman list)
| Elemen | Class |
|---|---|
| Angka besar | `text-2xl font-bold text-[#1E1C43]` |
| Label | `text-xs uppercase tracking-wide text-gray-400` |
| Container | `bg-white rounded-xl border border-gray-200 p-4` |

### Judul Section
`text-sm font-bold text-[#1E1C43]` — sering dengan `border-l-4 border-[#E05945] pl-3`

### Dokumen (Invoice/Receipt header)
`text-4xl font-black` — HANYA di sini, tidak di tempat lain mana pun.

### Badge Status
`text-xs font-medium px-2 py-1 rounded-full border` + warna status

**Dilarang:**
- `text-base`, `text-lg`, `text-xl` untuk data tabel atau label
- `text-[10px]` untuk badge atau tombol (hanya untuk label field dan `<th>`)
- `text-[13px]` (ganti ke `text-sm`)
- `py-[7px]` pada tombol (ganti ke `py-2`)

---

## 4. POLA KOMPONEN

### 4.1 Wrapper Tabel
```html
<div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
  <table style="min-width: 1000px; width: 100%">
    <thead>
      <tr class="border-b border-gray-200">
        <th class="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
          Nama Kolom
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition">
        <td class="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```
- `overflow-x-auto` wajib ada
- `min-width` menyesuaikan jumlah kolom (1000–1600px)
- Baris yang bisa diklik: `hover:bg-gray-50 cursor-pointer`

---

### 4.2 Filter Bar (standar baku semua modul)
```html
<div class="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
  <!-- Dropdown -->
  <select class="px-3 py-[7px] border-[1.5px] border-gray-200 rounded-lg text-xs text-[#1E1C43] bg-white outline-none focus:border-[#1E1C43] hover:border-[#1E1C43] transition-colors">
    <option value="">Semua Status</option>
  </select>

  <!-- Search Input dengan ikon -->
  <div class="flex items-center gap-2 flex-1 min-w-[200px] bg-[#F5F5F7] border-[1.5px] border-gray-200 rounded-lg px-3 py-[7px] focus-within:border-[#1E1C43] focus-within:bg-white transition-colors">
    <!-- ikon search size 14 -->
    <input type="text" placeholder="Cari..." class="border-none bg-transparent text-xs outline-none w-full text-[#1E1C43]" />
  </div>

  <!-- Tombol Reset -->
  <button class="px-3.5 py-[7px] bg-[#1E1C43] hover:bg-[#2D2B5A] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5">
    <!-- ikon RotateCcw size 12 --> Reset
  </button>
</div>
```
- Dropdown border: `border-[1.5px]` (1.5px, bukan 1px)
- Tombol Reset: navy filled dengan ikon RotateCcw
- Search: embedded icon dalam wrapper berborder

---

### 4.3 Modal
```html
<!-- Overlay -->
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <!-- Container -->
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
    <!-- Header: flex-shrink-0 -->
    <div class="flex-shrink-0 p-4 border-b border-gray-200 flex items-center justify-between">
      <h3 class="text-base font-bold text-[#1E1C43]">Judul Modal</h3>
      <button><!-- ikon X --></button>
    </div>
    <!-- Body: overflow-y-auto flex-1 -->
    <div class="overflow-y-auto flex-1 p-4">
      <!-- konten -->
    </div>
    <!-- Footer: flex-shrink-0, hanya jika ada tombol aksi -->
    <div class="flex-shrink-0 p-4 border-t border-gray-200 flex justify-end gap-2">
      <button>Batal</button>
      <button>Simpan</button>
    </div>
  </div>
</div>
```
- `max-h-[90vh]` wajib — tanpa ini konten panjang terpotong layar
- Klik overlay tutup modal; klik dalam modal tidak tutup (stopPropagation)
- `max-w-md` default; gunakan `max-w-lg` / `max-w-2xl` untuk konten lebar

---

### 4.4 Badge Status
```html
<span class="px-2 py-1 text-xs rounded-full font-medium border [warna sesuai status]">
  Label Status
</span>
```

Peta warna:
| Status | Class |
|---|---|
| Lunas / Aktif / Sukses | `bg-green-50 text-green-700 border-green-200` |
| Pending / Draft | `bg-yellow-50 text-yellow-700 border-yellow-200` |
| Overdue / Gagal | `bg-red-50 text-red-700 border-red-200` |
| Terkirim / Proses | `bg-blue-50 text-blue-700 border-blue-200` |
| Inactive / Netral | `bg-gray-50 text-gray-500 border-gray-200` |

---

### 4.5 KPI Card Row
```html
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <p class="text-xs uppercase tracking-wide text-gray-400">Label KPI</p>
    <p class="text-2xl font-bold text-[#1E1C43] mt-1">Nilai</p>
    <p class="text-xs text-gray-400 mt-1">Sub-info opsional</p>
  </div>
</div>
```

---

### 4.6 Activity Log
```html
<div class="flex gap-3 py-3 border-b border-gray-100">
  <div style="width:8px; height:8px; background:#E05945; border-radius:50%; margin-top:6px; flex-shrink:0;"></div>
  <div>
    <p class="text-sm text-gray-700">Deskripsi aksi</p>
    <p class="text-xs text-gray-400 mt-0.5">Nama User · Tanggal & Waktu</p>
  </div>
</div>
```
- **Satu log per halaman** — tidak boleh dipecah jadi log mini per kartu/section
- Semua aksi dari semua bagian halaman masuk ke satu log yang sama

---

### 4.7 Pipeline / Stage Progress
```
○──────●──────○──────○
New   Approach  Closing  Convert
```
- Selesai: bulat navy + tanda centang
- Aktif: bulat orange + nomor + label bold
- Mendatang: bulat abu + nomor + label abu
- Garis penghubung: navy jika stage sebelumnya selesai, abu jika belum
- Stage "CLOSED_LOST" bukan bagian pipeline linear — tampilkan sebagai badge merah terpisah

---

### 4.8 Tampilan Dokumen Invoice
Struktur (atas ke bawah):
1. **Header navy** — `bg-[#1E1C43]` — logo EFM kiri, "INVOICE" `text-4xl font-black` kanan, nomor invoice, tanggal, jatuh tempo, order ID, badge status
2. **Tagihan Kepada** — nama klien `text-lg font-bold`, info kontak, Order ID referensi
3. **Rincian Layanan** — tabel: Deskripsi | Harga/Sesi | Jumlah Sesi | Harga Paket | Diskon | Total
4. **Kalkulasi** — subtotal, diskon, total tagihan (kotak navy, amount `text-xl font-bold text-[#E05945]`)
5. **Catatan** — textarea di edit mode
6. **Syarat & Ketentuan** — list bernomor; di edit mode: tiap baris bisa diedit/dihapus
7. **Footer** — "Dokumen digenerate oleh sistem EFM V2"

---

## 5. STRUKTUR SIDEBAR

### 5.1 Sidebar Aktual (React — dari App.jsx)
```
Dashboard
├── Dashboard Admin   /dashboard
└── Dashboard Owner   /owner-dashboard

PP (Private Program)
├── Dashboard PP      /pp/dashboard
├── Leads             /pp/leads
├── Klien             /pp/klien
├── Screening         /pp/screening
├── Orders            /pp/orders
├── Program DB        /pp/program-db
├── Dokumen           /pp/documents
├── Invoice           /pp/invoice
├── Receipt           /pp/receipt
└── Promo             /pp/promo

B2B Management
├── Dashboard B2B     /b2b/dashboard
├── Leads             /b2b/leads
├── Survei            /b2b/survei
├── Orders            /b2b/orders
├── Kalender          /b2b/kalender
├── Invoice           /b2b/invoice
└── Receipt           /b2b/receipt

B2B Event
├── Dashboard Event   /event/dashboard
├── Leads             /event/leads
├── Konsultasi        /event/konsultasi
├── Quotation         /event/quotation
├── Orders            /event/orders
├── Kalender          /event/kalender
├── Invoice           /event/invoice
└── Receipt           /event/receipt

Operasional
├── Pelatih           /ops/pelatih
├── Kontrak Pelatih   /ops/pelatih/kontrak
├── Mitra             /ops/mitra
└── Assets            /ops/assets

Laporan
├── Revenue           /laporan/revenue
├── Penjualan         /laporan/penjualan
├── Laba              /laporan/laba
└── Export            /laporan/export

Settings              /settings
```

### 5.2 [USULAN] Sidebar di Google Apps Script (HtmlService)

**Prinsip desain sidebar Apps Script:**
- Sidebar **seragam** di semua project (EFM-PP, EFM-B2B-EVENT, EFM-B2B-MGMT)
- Kode sidebar yang sama diduplikat ke semua project (bukan di-import — Apps Script tidak support dynamic import CSS/HTML lintas project)
- Menu navigasi antar modul = link ke URL web app modul lain (buka di tab baru atau redirect)
- Penanda menu aktif: background navy (`#1E1C43`) + teks putih, atau border kiri orange (`#E05945`)

**[USULAN] Struktur sidebar per project Apps Script:**
```
[Logo EFM + Nama Modul]
─────────────────────────
Menu utama modul ini:
  • Dashboard
  • Leads
  • [menu lain sesuai modul]
  ...

─────────────────────────
Menu antar-modul (link ke web app lain):
  • 🔗 EFM PP          → [URL project EFM-PP]
  • 🔗 EFM B2B Event   → [URL project EFM-B2B-EVENT]
  • 🔗 EFM B2B Mgmt    → [URL project EFM-B2B-MGMT]
─────────────────────────
  • Pengaturan
  • Logout
```

**[USULAN] Cara menambah menu baru:**
1. Tambahkan item di array `SIDEBAR_MENU` di file `Config.gs` atau `Sidebar.html`
2. Item berbentuk: `{ label: "Nama Menu", icon: "ikon", route: "nama-halaman" }`
3. Router di `Code.gs` menangani render halaman sesuai `route`
4. Semua project Apps Script pakai pola yang sama → konsisten

**[USULAN] Cara menambah modul baru:**
1. Deploy project Apps Script baru untuk modul tersebut
2. Tambahkan link ke URL web app-nya di sidebar semua project yang sudah ada
3. Tidak perlu mengubah kode logic modul lain

---

## 6. WARNA DAN TOKEN CSS YANG TERSEDIA

Di React saat ini menggunakan Tailwind CSS dengan custom token:
| Token | Nilai |
|---|---|
| `bg-bg-surface` | #FFFFFF |
| `bg-bg-page` | #F5F5F7 |
| `border-border` | #E2E6EA |
| `text-text-primary` | #1E1C43 |
| `text-text-muted` | #6C757D |
| `bg-primary` | #1E1C43 |
| `hover:bg-primary-2` | #2D2B5A |

[USULAN] Di Apps Script (HtmlService): definisikan sebagai CSS custom properties di `<style>` global.
