# EFM V2 — REACT-APP

Source code aplikasi React untuk EFM Admin Dashboard.

## Menjalankan Lokal

```bash
cd REACT-APP
npm install
npm run dev        # dev server (localhost:5173)
npm run build      # production build (validasi sebelum push)
```

## Struktur

```
src/
├── components/     — Shared components (Sidebar, Topbar, dll)
├── pages/          — Halaman per modul (pp/, b2b/, event/, ops/, laporan/)
├── data/           — Dummy data per modul
├── utils/          — Utilities (companySettings, formatters)
└── App.jsx         — Route definitions
```

## Modul

| Modul | Route | Keterangan |
|---|---|---|
| Private Program | `/pp` | Leads, Orders, Program DB |
| B2B Event | `/event` | Leads, Konsultasi, Orders, Kalender |
| B2B Management | `/b2b` | Leads, Survei, Orders, Kalender |
| Operasional | `/ops` | Pelatih, Mitra, Aset, Kontrak PKS |
| Laporan | `/laporan` | Revenue, Penjualan, Laba & Biaya |
| Pengaturan | `/settings` | Profil perusahaan, rekening bank |
