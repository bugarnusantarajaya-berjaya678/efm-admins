# STATUS PENGERJAAN — EFM V2

> Status per modul per Oktober 2026.
> Terakhir diperbarui: Oktober 2026.

---

## RINGKASAN EKSEKUTIF

| Modul | UI React | Backend/DB | Status |
|---|---|---|---|
| PP (Private Program) | ✅ Lengkap | ✅ Skema lengkap (4 migration) | UI: bisa demo; Backend: belum terhubung ke UI |
| B2B Management | ⚠️ Sebagian | ❌ Belum ada | UI dummy saja |
| B2B Event | ⚠️ Sebagian | ❌ Belum ada | UI dummy saja |
| Operasional (OPS) | ⚠️ Sebagian | ⚠️ PIC endpoint ada | UI dan backend terpisah |
| Laporan | ⚠️ Halaman ada | ❌ Belum ada | UI dummy saja |
| Auth & Dashboard | ✅ Ada | ⚠️ JWT ada, role belum | Login ada, role belum enforce |

---

## DETAIL PER MODUL

### PP (Private Program)

**UI React (REACT-APP/):**
| Halaman | Status | Catatan |
|---|---|---|
| Dashboard PP | ✅ Selesai | Data dummy |
| Leads List | ✅ Selesai | Filter, pipeline, dummy data |
| Lead Detail | ✅ Selesai | Form, log aktivitas, status |
| Lead Baru | ✅ Selesai | Form tambah lead |
| Klien List | ✅ Selesai | Dummy data |
| Klien Detail | ✅ Selesai | Riwayat order |
| Screening List | ✅ Selesai | Dummy data |
| Screening Detail | ✅ Selesai | PRE/MID/POST assessment |
| Orders List | ✅ Selesai | Filter status, paket, PIC |
| Order Baru | ✅ Selesai | Form pilih klien, paket, pelatih |
| Order Detail | ✅ Selesai | 3 tab: Kontrak, Dokumen, Operasional |
| Rekap Absensi | ✅ Selesai | Tabel sesi, kehadiran |
| Program DB | ✅ Selesai | Daftar program/paket |
| Dokumen PP | ✅ Selesai | Dummy data |
| Invoice List | ✅ Selesai | Filter, KPI card |
| Invoice Detail | ✅ Selesai | Edit mode, kalkulasi, konfirmasi bayar, buat receipt |
| Receipt List | ✅ Selesai | Dummy data |
| Receipt Detail | ✅ Selesai | Detail + WhatsApp |
| Promo | ✅ Selesai | CRUD kode promo |
| Agreement Detail | ✅ Selesai | Status lifecycle, tanda tangan |

**Backend PP:**
| Komponen | Status | Catatan |
|---|---|---|
| Migration SQL (4 file) | ✅ Selesai | Skema lengkap PP |
| Router Leads | ✅ Selesai | CRUD + convert |
| Router Clients | ✅ Selesai | CRUD |
| Router Orders | ✅ Selesai | CRUD + status + readiness |
| Router Invoices | ✅ Selesai | CRUD + send + cancel + overdue + PDF |
| Router Payments | ✅ Selesai | CRUD + confirm + reject + proof upload |
| Router Receipts | ✅ Selesai | Read + PDF |
| Router Refunds | ✅ Selesai | CRUD + process + reject |
| Router Participants | ✅ Selesai | CRUD |
| Router Assessments | ✅ Selesai | CRUD |
| Router Agreements | ✅ Selesai | CRUD + issue + sign + void |
| Router Attendance | ✅ Selesai | CRUD + photo upload |
| Router Catalog | ✅ Selesai | Programs, offerings, packages |
| Router PIC | ✅ Selesai | CRUD + contexts |
| Router Audit | ✅ Selesai | Read by entity & request |
| Koneksi UI → Backend | ❌ Belum | UI masih pakai dummy data |

---

### B2B Management

**UI React:**
| Halaman | Status | Catatan |
|---|---|---|
| Dashboard B2B | ✅ Ada | Data dummy: stats, klien aktif, expiring |
| Leads B2B | ✅ Ada | Pipeline dummy |
| Survei List | ✅ Ada | Dummy data |
| Survei Detail | ✅ Ada | Form + detail |
| Orders List | ✅ Ada | Dummy data |
| Order Baru | ✅ Ada | Form dummy |
| Order Detail | ✅ Ada | Detail + invoice + receipt |
| Kalender | ✅ Ada | Kalender jadwal |
| Invoice List | ✅ Ada | Dummy data |
| Receipt List | ✅ Ada | Dummy data |
| Dokumen B2B | ✅ Ada (`B2BDocumentsPage.jsx`) | [TIDAK PASTI: route aktif?] |

**Backend B2B:** ❌ Tidak ada — belum ada migration SQL, belum ada router.

**Data dummy B2B:** `b2bData.js` — hanya stats, klien aktif, expiring contracts, leads pipeline, revenue chart.

---

### B2B Event

**UI React:**
| Halaman | Status | Catatan |
|---|---|---|
| Dashboard Event | ✅ Ada | Data dummy |
| Leads Event | ✅ Ada | Pipeline, store-based |
| Lead Baru | ✅ Ada | Form |
| Lead Detail | ✅ Ada | Detail + aktivitas |
| Konsultasi List | ✅ Ada | Store-based |
| Konsultasi Detail | ✅ Ada | Form + detail |
| Quotation List | ✅ Ada | Store-based |
| Quotation Detail | ✅ Ada | Form + item-item harga |
| Orders List | ✅ Ada | Dummy data |
| Order Baru | ✅ Ada | Form |
| Order Detail | ✅ Ada | Detail + jadwal kelas |
| Kalender | ✅ Ada | Kalender event |
| Invoice List | ✅ Ada | Dummy data |
| Receipt List | ✅ Ada | Dummy data |
| Dokumen Event | ✅ Ada (`EventDocumentsPage.jsx`) | Google Drive link |

**Backend Event:** ❌ Tidak ada — belum ada migration SQL, belum ada router.

**Data dummy Event:** `eventData.js`, `eventLeadsStore.js`, `eventKonsultasiStore.js`, `eventQuotationsStore.js`.

---

### Operasional (OPS)

**UI React:**
| Halaman | Status | Catatan |
|---|---|---|
| Pelatih List | ✅ Ada | Data dari backend PIC |
| Pelatih Detail | ✅ Ada | Profil, konteks, tarif |
| Kontrak Pelatih | ✅ Ada | PKS management |
| Mitra | ✅ Ada | [TIDAK PASTI: detail fitur] |
| Assets | ✅ Ada | [TIDAK PASTI: detail fitur] |

**Backend OPS:** ✅ Router PIC ada (`/api/v1/pics`). PIC adalah data bersama antar modul.

---

### Laporan

**UI React:** 4 halaman ada (Revenue, Penjualan, Laba, Export). [TIDAK PASTI: apakah sudah ada data di dalamnya atau halaman kosong]

**Backend:** ❌ Tidak ada endpoint laporan.

---

### Auth & Dashboard

**UI React:** Login page ada. Dashboard Admin dan Dashboard Owner ada.

**Backend:** Middleware `requireAuth` ada (JWT validation). Role belum enforce di level kode [TIDAK PASTI].

---

## DEPLOYMENT

| Lingkungan | URL | Status |
|---|---|---|
| Frontend Production | https://efm-admins.vercel.app | ✅ Aktif (branch main) |
| Frontend Preview | https://efm-admins-git-[branch]-bugar-nusantara-jaya.vercel.app | ✅ Per PR |
| Backend | [URL Railway] | [TIDAK PASTI: sudah deploy atau belum] |
| Database (Supabase) | [di Supabase dashboard] | ✅ Aktif |

---

## BUG / MASALAH TERBUKA

| # | Deskripsi | Modul | Status |
|---|---|---|---|
| 1 | UI tidak terhubung ke backend — semua data masih dummy | Semua | Open |
| 2 | Tidak ada sistem login nyata — auth page ada tapi tidak enforce | Auth | Open |
| 3 | Backend B2B dan Event belum dibuat | B2B, Event | Open (dilewati — migrasi ke Apps Script) |
| 4 | Railway deployment belum terverifikasi aktif | Backend | Open |
| 5 | Role-based access control belum diimplementasi di UI | Semua | Open (dilewati — migrasi) |

---

## RIWAYAT VERSI

| Versi | Tanggal | Keterangan |
|---|---|---|
| Pivot ke Apps Script | Oktober 2026 | Keputusan migrasi total dari React+Node.js ke Google Apps Script |
| Backend PP selesai | [TIDAK PASTI] | 14 router, 4 migration — skema PP lengkap |
| UI PP selesai | [TIDAK PASTI] | Semua halaman PP dengan dummy data |
| UI B2B + Event | [TIDAK PASTI] | Halaman ada, data dummy saja |
| Inisiasi project | [TIDAK PASTI] | — |
