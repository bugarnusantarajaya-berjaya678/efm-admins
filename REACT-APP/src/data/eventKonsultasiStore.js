// Module-level konsultasi store for Event — cross-page state sharing
// Mirrors the pattern in eventLeadsStore.js

const KONSULTASI_INIT = [
  {
    id: 'KNS-26-0001', nama: 'Yayasan Kanker Indonesia', jenis: 'Foundation',
    namaEvent: 'Health Run for Hope 2026', jenisEvent: 'Charity Run',
    tanggal: '5 Jun 2026', pic: 'Bagoes', estimasiPeserta: '2.000',
    lokasi: 'GBK, Jakarta Selatan', hasil: 'lanjut', peranEFM: 'Main Organizer',
    temuan: 'Event skala besar, estimasi 2.000 peserta. Venue GBK sudah dikonfirmasi. Panitia sangat kooperatif.',
    rekomendasi: 'EFM sebagai main organizer fitness segment. Perlu 5 instruktur dan 3 koordinator lapangan.',
    keputusan: 'Setuju lanjut ke tahap penawaran. Nilai estimasi Rp 85jt all-in.',
    leadId: 'LE-0001',
  },
  {
    id: 'KNS-26-0002', nama: 'PT. Garuda Nusa Tbk', jenis: 'Corporate',
    namaEvent: 'Corporate Fun Run 2026', jenisEvent: 'Fun Run',
    tanggal: '8 Jun 2026', pic: 'Emma', estimasiPeserta: '500',
    lokasi: 'Sudirman Park, Jakarta Pusat', hasil: 'lanjut', peranEFM: 'Co-Organizer',
    temuan: 'Event internal perusahaan untuk 500 karyawan. Budget sudah disetujui direksi. HR sangat antusias.',
    rekomendasi: 'Co-organizer untuk fitness & wellness segment. Perlu 3 instruktur.',
    keputusan: 'Lanjut ke quotation. Estimasi nilai Rp 40jt.',
    leadId: 'LE-0002',
  },
  {
    id: 'KNS-26-0003', nama: 'Brand Tropicana Slim', jenis: 'Brand',
    namaEvent: 'Healthy Living Expo', jenisEvent: 'Exhibition',
    tanggal: '10 Jun 2026', pic: 'Bagoes', estimasiPeserta: '300',
    lokasi: 'ICE BSD, Tangerang', hasil: 'pending', peranEFM: 'Fitness Consultant',
    temuan: 'Expo 3 hari, stand fitness demo dibutuhkan. Masih menunggu approval anggaran brand.',
    rekomendasi: 'EFM sebagai konsultan fitness, sediakan demo area dan instruktur showcase.',
    keputusan: 'Menunggu konfirmasi anggaran dari brand manager.',
    leadId: 'LE-0003',
  },
  {
    id: 'KNS-26-0004', nama: 'Komunitas Pelari Jakarta', jenis: 'Community',
    namaEvent: 'Jakarta Night Run 2026', jenisEvent: 'Night Run',
    tanggal: '14 Jun 2026', pic: 'Emma', estimasiPeserta: '200',
    lokasi: 'Monas, Jakarta Pusat', hasil: 'tidak_lanjut', peranEFM: 'Vendor',
    temuan: 'Budget komunitas sangat terbatas. Panitia lebih memilih vendor yang lebih murah.',
    rekomendasi: 'Tidak disarankan. Margin terlalu kecil untuk operasional EFM.',
    keputusan: 'Ditunda. Arahkan ke komunitas yang lebih besar di Q4 2026.',
    leadId: 'LE-0004',
  },
  {
    id: 'KNS-26-0005', nama: 'Dinas Pemuda & Olahraga DKI', jenis: 'Government',
    namaEvent: 'Hari Olahraga Nasional DKI', jenisEvent: 'Mass Event',
    tanggal: '18 Jun 2026', pic: 'Bagoes', estimasiPeserta: '1.500',
    lokasi: 'Lapangan Banteng, Jakarta', hasil: 'lanjut', peranEFM: 'Main Organizer',
    temuan: 'Event resmi pemerintah provinsi, peserta ribuan orang. Anggaran APBD. Proses tender.',
    rekomendasi: 'Ikut tender resmi. Persiapkan dokumen perusahaan dan portofolio event.',
    keputusan: 'Lanjut proses tender. Submit dokumen sebelum 30 Jun 2026.',
    leadId: 'LE-0005',
  },
]

let _konsultasi = null

export function initKonsultasi(seed) {
  if (_konsultasi === null) _konsultasi = [...seed]
}

export function getStoredKonsultasi() {
  return _konsultasi ? [..._konsultasi] : []
}

export function addStoredKonsultasi(item) {
  if (!_konsultasi) _konsultasi = []
  _konsultasi = [..._konsultasi, item]
}

export function getNextKonsultasiId() {
  const n = _konsultasi ? _konsultasi.length + 1 : 1
  return 'KNS-26-' + String(n).padStart(4, '0')
}

export { KONSULTASI_INIT }
