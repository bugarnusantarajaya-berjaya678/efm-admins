# EFM V2 — Changelog

Catatan perubahan UI/fitur yang sudah diimplementasikan dan di-merge ke main.

---

## 2026-08-29

### PP: Integrasi Leads & Order pages ke live ppProgramStore / ppLeadsStore / ppJenisStore (PR #193 + PR #194)

**Latar belakang:** Setelah ppProgramStore dan ppJenisStore dijadikan sumber data utama (PR #191), beberapa halaman PP masih menggunakan hardcoded dummy data terpisah — menyebabkan inkonsistensi saat program baru ditambahkan.

**Perubahan PR #193 — PPOrderNewPage, PPOrderDetailPage, PPProgramFormPage:**
- `PPOrderNewPage`: Hapus `dummyPaketDB` (5 item hardcoded); ganti dengan `getStoredPrograms().filter(aktif).map(toPaket)` + helper `toPaket(p)` yang memetakan `ppProgramStore` shape ke paket shape
- `PPOrderDetailPage`: Hapus `dummyPPPrograms` (10 item, ~42 baris); ganti dengan `getStoredPrograms().map(toPaket)`
- `PPProgramFormPage`: Tambah proteksi hapus — cek `getAllOrders()` sebelum delete; jika ada order aktif yang terhubung, tampilkan alert dan batalkan hapus

**Perubahan PR #194 — ppLeadsStore, PPLeadsPage, PPLeadNewPage, PPLeadDetailPage, PPOrderNewPage:**
- `ppLeadsStore`: Pindahkan `LEADS_INIT` (14 record) ke dalam store; auto-initialize `_leads` sehingga `getStoredLeads()` langsung bekerja tanpa `initLeads()` — menghilangkan bug leads kosong di Order Baru jika user belum buka halaman Leads
- `PPLeadsPage`: Hapus 298 baris `LEADS_INIT` dead code; filter dropdown "Program" dari hardcoded array → `getStoredJenis()`
- `PPLeadNewPage`: Dropdown "Program Diminati" dari hardcoded `PROGRAM_OPTS` → `getStoredJenis().filter(aktif)` + opsi "Lainnya"
- `PPLeadDetailPage`: Sama — dropdown edit form "Program Diminati" → `getStoredJenis()`
- `PPOrderNewPage`: Hapus `dummyPPLeads` (7 item hardcoded); combobox pencarian pendaftar dari `getStoredLeads()` dengan mapping field `noHp` → `noHP`, `emailUmum` → `email`

**File yang diubah:**
- `REACT-APP/src/data/ppLeadsStore.js`
- `REACT-APP/src/pages/pp/PPLeadsPage.jsx`
- `REACT-APP/src/pages/pp/PPLeadNewPage.jsx`
- `REACT-APP/src/pages/pp/PPLeadDetailPage.jsx`
- `REACT-APP/src/pages/pp/PPOrderNewPage.jsx`
- `REACT-APP/src/pages/pp/PPOrderDetailPage.jsx`
- `REACT-APP/src/pages/pp/PPProgramFormPage.jsx`

---

## 2026-08-28

### Fix: Event propagation bug pada panel Jenis Program (PR #167)

**Bug:** Setelah user klik Edit atau Hapus di dalam panel Jenis Program, form sub-modal terbuka. Namun setelah aksi selesai (Simpan/Batal/Ya Hapus), panel Jenis Program ikut tertutup — kembali ke halaman utama Program DB.

**Root cause:** `JenisFormModal` dan `JenisDeleteDialog` di-render sebagai child dari outer overlay div `JenisPanelModal` yang punya `onClick={onClose}`. Klik pada tombol di sub-modal bubble up ke overlay parent → trigger `onClose` pada panel utama.

**Fix:** Tambah `onClick={e => e.stopPropagation()}` pada outer div kedua sub-modal — memutus event bubbling sebelum mencapai overlay `JenisPanelModal`.

---

### PP: Jenis Program dipindahkan ke Modal Panel di Program DB (PR #165)

**Perubahan struktur:**
- Halaman terpisah `/pp/program-db/jenis-program` dihapus
- Route, sidebar link, dan breadcrumb untuk halaman tersebut ikut dihapus
- Semua logik Jenis Program (data, CRUD) dipindahkan ke dalam `PPProgramDBPage.jsx`

**Flow baru:**
1. Buka halaman **Program DB** (`/pp/program-db`)
2. Di header kanan, ada 2 tombol: **Jenis Program** (outline) | **Tambah Program** (orange)
3. Klik tombol **Jenis Program** → modal panel terbuka (max-w-3xl)
4. Modal berisi: stats cards (Total / Aktif / Nonaktif) + tabel daftar jenis + CRUD (tambah/edit/hapus) tanpa pindah halaman

**File yang diubah:**
- `REACT-APP/src/pages/pp/PPProgramDBPage.jsx` — embed `JENIS_INIT`, `JenisFormModal`, `JenisDeleteDialog`, `JenisPanelModal`; tambah state `showJenisPanel` + `jenisList`
- `REACT-APP/src/components/layout/Sidebar.jsx` — hapus sub-item "Jenis Program" dari Program DB
- `REACT-APP/src/components/layout/Topbar.jsx` — hapus breadcrumb `/pp/program-db/jenis-program`
- `REACT-APP/src/App.jsx` — hapus route dan import `PPJenisProgramPage`

**Styling tombol Jenis Program:**
```
h-9 px-3 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50
```
Identik dengan pola tombol sekunder "Dokumen" di halaman Orders.

---

## 2026-08-27

### Audit & Perbaikan Tombol Orange `#E05945` (PR #164)

Ditemukan 13 inkonsistensi tombol orange di 8 file. Standar yang ditetapkan:
- Font: `font-semibold` (bukan `font-bold` atau `font-medium`)
- Border radius: `rounded-lg` (bukan `rounded-xl`)
- Font size CTA: `text-sm` / inline action: `text-xs`
- Hover: `hover:bg-[#c94a38]` (lowercase hex)

File yang diperbaiki: `PPLeadsPage`, `PPOrdersPage`, `PPOrderDetailPage`, `EventKonsultasiPage`, `EventOrdersPage`, `EventKonsultasiDetailPage`, `EventOrderDetailPage`, `EventInvoicePage`

---

### Multi-bank Rekening di Settings (PR #163)

**Sebelum:** Settings hanya bisa menyimpan 1 rekening bank (3 field tunggal).

**Sesudah:** Settings mendukung multiple rekening bank via `rekeningList: [{ bank, rek, an }]`.

- UI: list rekening yang bisa ditambah/hapus (min 1 entry, hapus dinonaktifkan jika tinggal 1)
- Backward compat: saat Save, field legacy (`namaBank`, `nomorRekening`, `atasNamaRekening`) disinkronkan dari entry pertama
- Invoice pages (Event, B2B, PP) diupdate: iterasi `rekeningList` dengan fallback ke field legacy
- Default data (`companySettings.js`): `rekeningList` sudah diisi 2 rekening contoh

---

### Centralisasi PIC_OPTS (PR #162)

`const PIC_OPTS` yang sebelumnya didefinisikan ulang secara lokal di 3 file dipindahkan ke satu sumber:

```js
// src/data/ppProgramDBData.js
export const PIC_OPTS = [...Object.values(PIC_DB).map(p => p.fullname), 'Admin EFM']
// ['Sarah Jenkins', 'Marcus Chen', 'Elena Rodriguez', 'David Kim', 'Admin EFM']
```

File yang diupdate: `PPLeadsPage`, `PPLeadDetailPage`, `PPLeadNewPage` — hapus definisi lokal, import dari `ppProgramDBData`.

---

### localStorage Persistence untuk Log & Catatan (PR #161)

State yang sebelumnya reset setiap refresh kini persisten via `localStorage`:

| State | Key | File |
|---|---|---|
| Log aktivitas lead | `lead-log-{id}` | `PPLeadDetailPage` |
| Catatan internal FC | `lead-catatan-{id}` | `PPLeadDetailPage` |
| Log operasional Tab 3 | `order-log3-{id}` | `PPOrderDetailPage` |

Pattern: lazy `useState` initializer (baca dari localStorage saat mount) + `useEffect` (tulis ke localStorage setiap state berubah). Semua read/write dibungkus `try/catch` agar aman di private window / storage disabled.

---

### Sync `getCompanySettings()` ke Invoice Pages (PR #160)

Invoice pages (PP, B2B, Event) sebelumnya menggunakan data perusahaan hardcoded. Sekarang membaca dari `getCompanySettings()` (sumber: `localStorage` key `efmCompanySettings`, dengan fallback ke default).

Sumber kebenaran tunggal: ubah di **Settings → Profil Perusahaan**, semua invoice langsung ikut.
