// Module-level quotation store for B2B Event — cross-page state sharing
// Mirrors the pattern in eventKonsultasiStore.js

const QUOTATIONS_INIT = [
  {
    id: 'QUO-EV-26-0001',
    leadId: 'LE-0001',
    konsultasiId: 'KNS-26-0001',
    namaKlien: 'Yayasan Kanker Indonesia',
    namaEvent: 'Health Run for Hope 2026',
    tanggalDibuat: '2026-06-10',
    tanggalBerlaku: '2026-06-24',
    status: 'Terkirim',
    picEFM: 'Bagoes',
    catatan: 'Harga sudah termasuk mobilisasi tim dan peralatan fitness. Estimasi peserta 2.000 orang.',
    items: [
      { id: 1, deskripsi: 'Koordinasi & Manajemen Event (Main Organizer)', qty: 1, satuan: 'Paket', harga: 30000000 },
      { id: 2, deskripsi: 'Instruktur Fitness (5 orang × 2 shift)', qty: 10, satuan: 'Shift', harga: 2000000 },
      { id: 3, deskripsi: 'Koordinator Lapangan (3 orang)', qty: 3, satuan: 'Hari', harga: 1500000 },
      { id: 4, deskripsi: 'Peralatan & Perlengkapan Fitness', qty: 1, satuan: 'Paket', harga: 8000000 },
      { id: 5, deskripsi: 'Sound System & Stage Setup', qty: 1, satuan: 'Paket', harga: 12000000 },
    ],
    pajak: [
      { id: 1, nama: 'PPN', persentase: 11, tipe: '+' },
    ],
    nilaiSubtotal: 75500000,
    nilaiTotal: 83805000,
  },
  {
    id: 'QUO-EV-26-0002',
    leadId: 'LE-0002',
    konsultasiId: 'KNS-26-0002',
    namaKlien: 'PT. Garuda Nusa Tbk',
    namaEvent: 'Corporate Fun Run 2026',
    tanggalDibuat: '2026-06-14',
    tanggalBerlaku: '2026-06-28',
    status: 'Disetujui',
    picEFM: 'Emma',
    catatan: 'Harga sudah disepakati setelah negosiasi. Pembayaran 50% di muka.',
    items: [
      { id: 1, deskripsi: 'Co-Organizer Fitness & Wellness Segment', qty: 1, satuan: 'Paket', harga: 20000000 },
      { id: 2, deskripsi: 'Instruktur Fitness (3 orang)', qty: 3, satuan: 'Hari', harga: 2000000 },
      { id: 3, deskripsi: 'Peralatan & Perlengkapan Fitness', qty: 1, satuan: 'Paket', harga: 5000000 },
    ],
    pajak: [
      { id: 1, nama: 'PPN', persentase: 11, tipe: '+' },
      { id: 2, nama: 'PPh 23', persentase: 2, tipe: '-' },
    ],
    nilaiSubtotal: 31000000,
    nilaiTotal: 33790000,
  },
  {
    id: 'QUO-EV-26-0003',
    leadId: 'LE-0005',
    konsultasiId: 'KNS-26-0005',
    namaKlien: 'Dinas Pemuda & Olahraga DKI',
    namaEvent: 'Hari Olahraga Nasional DKI',
    tanggalDibuat: '2026-06-22',
    tanggalBerlaku: '2026-07-06',
    status: 'Draft',
    picEFM: 'Bagoes',
    catatan: 'Masih dalam proses penyesuaian dengan persyaratan tender pemerintah.',
    items: [
      { id: 1, deskripsi: 'Main Organizer Mass Event (1.500 peserta)', qty: 1, satuan: 'Paket', harga: 50000000 },
      { id: 2, deskripsi: 'Instruktur Fitness (8 orang)', qty: 8, satuan: 'Hari', harga: 1800000 },
      { id: 3, deskripsi: 'Koordinator Lapangan (4 orang)', qty: 4, satuan: 'Hari', harga: 1500000 },
      { id: 4, deskripsi: 'Peralatan Massal & Sound System', qty: 1, satuan: 'Paket', harga: 18000000 },
    ],
    pajak: [
      { id: 1, nama: 'PPN', persentase: 11, tipe: '+' },
      { id: 2, nama: 'PPh 22', persentase: 1.5, tipe: '-' },
    ],
    nilaiSubtotal: 96400000,
    nilaiTotal: 106915000,
  },
]

let _quotations = null

export function initQuotations(seed) {
  if (_quotations === null) _quotations = [...seed]
}

export function getStoredQuotations() {
  return _quotations ? [..._quotations] : []
}

export function addStoredQuotation(item) {
  if (!_quotations) _quotations = []
  _quotations = [..._quotations, item]
}

export function updateStoredQuotation(id, updates) {
  if (!_quotations) return
  _quotations = _quotations.map(q => q.id === id ? { ...q, ...updates } : q)
}

export function getNextQuotationId() {
  const n = _quotations ? _quotations.length + 1 : 1
  return 'QUO-EV-26-' + String(n).padStart(4, '0')
}

export { QUOTATIONS_INIT }
