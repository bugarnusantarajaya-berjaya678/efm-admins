export const picList = [
  { id: 'PIC-001', inisial: 'SJ', nama: 'Sarah Jenkins',   warna: '#E05945', jenis: 'Trainer',     spesialis: 'PT. Pelatih Bersertifikat',  status: 'aktif',    area: 'Jakarta Selatan', klienAktif: 8,  totalSesi: 124, tglMulaiPks: '2024-01-15', tglHabisPks: '2025-01-15', noHp: '0812-1111-0001', catatan: 'Spesialis functional training, ISSA certified' },
  { id: 'PIC-002', inisial: 'MC', nama: 'Marcus Chen',     warna: '#2980B9', jenis: 'Trainer',     spesialis: 'PT. Bersertifikat FISAF',    status: 'aktif',    area: 'Jakarta Barat',   klienAktif: 6,  totalSesi: 98,  tglMulaiPks: '2024-03-01', tglHabisPks: '2025-03-01', noHp: '0813-2222-0002', catatan: 'Ahli strength & conditioning' },
  { id: 'PIC-003', inisial: 'ER', nama: 'Elena Rodriguez', warna: '#27AE60', jenis: 'Trainer',     spesialis: 'PT. Senior Trainer',         status: 'aktif',    area: 'Jakarta Pusat',   klienAktif: 10, totalSesi: 210, tglMulaiPks: '2023-06-01', tglHabisPks: '2024-06-01', noHp: '0814-3333-0003', catatan: 'Pengalaman 8 tahun, spesialis senior fitness' },
  { id: 'PIC-004', inisial: 'DK', nama: 'David Kim',       warna: '#8E44AD', jenis: 'Trainer',     spesialis: 'Strength & Conditioning',    status: 'cuti',     area: 'Jakarta Utara',   klienAktif: 0,  totalSesi: 76,  tglMulaiPks: '2024-02-01', tglHabisPks: '2025-02-01', noHp: '0815-4444-0004', catatan: 'Cuti melahirkan s/d Juli 2026' },
  { id: 'PIC-005', inisial: 'AP', nama: 'Ahmad Pratama',   warna: '#E67E22', jenis: 'Instruktur',  spesialis: 'Yoga & Pilates',             status: 'aktif',    area: 'Jakarta Selatan', klienAktif: 7,  totalSesi: 143, tglMulaiPks: '2024-04-01', tglHabisPks: '2025-04-01', noHp: '0816-5555-0005', catatan: 'RYT-200 certified, spesialis prenatal yoga' },
  { id: 'PIC-006', inisial: 'RI', nama: 'Rina Indah',      warna: '#16A085', jenis: 'Instruktur',  spesialis: 'Cardio & Zumba',             status: 'aktif',    area: 'Jakarta Barat',   klienAktif: 5,  totalSesi: 89,  tglMulaiPks: '2024-05-01', tglHabisPks: '2025-05-01', noHp: '0817-6666-0006', catatan: 'Zumba instructor lisensi internasional' },
  { id: 'PIC-007', inisial: 'BW', nama: 'Budi Wijaya',     warna: '#C0392B', jenis: 'Trainer',     spesialis: 'Functional Training',        status: 'aktif',    area: 'Jakarta Timur',   klienAktif: 9,  totalSesi: 167, tglMulaiPks: '2023-09-01', tglHabisPks: '2024-09-01', noHp: '0818-7777-0007', catatan: 'PKS akan habis Sept 2024' },
  { id: 'PIC-008', inisial: 'ND', nama: 'Nadia Dewi',      warna: '#2C3E50', jenis: 'Trainer',     spesialis: 'Therapeutic Exercise',       status: 'nonaktif', area: 'Jakarta Selatan', klienAktif: 0,  totalSesi: 45,  tglMulaiPks: '2023-01-01', tglHabisPks: '2024-01-01', noHp: '0819-8888-0008', catatan: 'Kontrak berakhir Januari 2024' },
]

export const picStats = { aktif: 12, cuti: 2, totalKlien: 87, pksHabis: 3 }

export const mitraList = [
  { id: 'MTR-001', emoji: '🏋️', nama: 'PT. Fitness Equipment Indonesia', kategori: 'Vendor Alat Fitness',        status: 'aktif',    noHp: '+62 21-1234-5678', email: 'info@fitnessequip.co.id',     kota: 'Jakarta Pusat',   catatan: 'Suplier utama treadmill, dumbell, barbell' },
  { id: 'MTR-002', emoji: '👕', nama: 'CV. Sportwear Jakarta',            kategori: 'Vendor Pakaian & Aksesoris', status: 'aktif',    noHp: '+62 812-9876-5432', email: 'order@sportwearjkt.com',     kota: 'Jakarta Barat',   catatan: 'Kaos event dan aksesoris olahraga branded' },
  { id: 'MTR-003', emoji: '🔧', nama: 'TechFix Service Center',           kategori: 'Jasa Servis Alat',           status: 'aktif',    noHp: '+62 21-9876-5432',  email: 'service@techfix.co.id',      kota: 'Jakarta Selatan', catatan: 'Servis treadmill, eliptical, sound system' },
  { id: 'MTR-004', emoji: '📸', nama: 'Studio Foto & Video Kreasi',       kategori: 'Media & Dokumentasi',        status: 'aktif',    noHp: '+62 815-1234-5678', email: 'hello@studiokreasi.com',     kota: 'Jakarta Selatan', catatan: 'Dokumentasi event dan konten marketing' },
  { id: 'MTR-005', emoji: '🍎', nama: 'NutriCo Supplement Store',         kategori: 'Vendor Nutrisi',             status: 'aktif',    noHp: '+62 812-5555-6666', email: 'sales@nutrico.co.id',        kota: 'Jakarta Pusat',   catatan: 'Suplemen protein, vitamin, minuman energi' },
  { id: 'MTR-006', emoji: '🖨️', nama: 'PrintMaster Jakarta',              kategori: 'Media & Promosi',            status: 'nonaktif', noHp: '+62 21-7654-3210',  email: 'order@printmaster.co.id',    kota: 'Jakarta Utara',   catatan: 'Banner, flyer, x-banner promosi' },
]

export const mitraStats = { mitraAktif: 14, vendorAlat: 6, total: 18 }

export const assetList = [
  { kode: 'AST-001', nama: 'Treadmill Commercial',    kategori: 'Alat Fitness',  jumlah: '3 unit', lokasi: 'Dipinjam ke Klien', kondisi: 'baik',    tglBeli: 'Jan 2024' },
  { kode: 'AST-002', nama: 'Dumbell Set (5-30kg)',    kategori: 'Alat Fitness',  jumlah: '5 set',  lokasi: 'Gudang Utama',      kondisi: 'baik',    tglBeli: 'Mar 2024' },
  { kode: 'AST-003', nama: 'Yoga Mat (6mm)',          kategori: 'Perlengkapan',  jumlah: '20 pcs', lokasi: 'Dipinjam ke Klien', kondisi: 'baik',    tglBeli: 'Jun 2024' },
  { kode: 'AST-004', nama: 'Sound System Portable',   kategori: 'Elektronik',    jumlah: '2 unit', lokasi: 'Dalam Servis',      kondisi: 'servis',  tglBeli: 'Agu 2023' },
  { kode: 'AST-005', nama: 'Barbell Olympic Set',     kategori: 'Alat Fitness',  jumlah: '1 set',  lokasi: 'Gudang Utama',      kondisi: 'rusak',   tglBeli: 'Jan 2023' },
  { kode: 'AST-006', nama: 'Resistance Band Set',     kategori: 'Perlengkapan',  jumlah: '15 pcs', lokasi: 'Gudang Utama',      kondisi: 'baik',    tglBeli: 'Sep 2024' },
  { kode: 'AST-007', nama: 'Elliptical Trainer',      kategori: 'Alat Fitness',  jumlah: '2 unit', lokasi: 'Dipinjam ke Klien', kondisi: 'baik',    tglBeli: 'Feb 2024' },
  { kode: 'AST-008', nama: 'Proyektor Portable',      kategori: 'Elektronik',    jumlah: '1 unit', lokasi: 'Gudang Utama',      kondisi: 'baik',    tglBeli: 'Apr 2024' },
]

export const assetStats = { baik: 42, servis: 5, rusak: 2, total: 49 }

export const paymentList = [
  { id: 'PAY-001', pic: 'Sarah Jenkins',   inisial: 'SJ', warna: '#E05945', periode: 'Juni 2026', totalSesi: 30, rate: 150000, total: 4500000,  status: 'sudah_bayar', tglBayar: '5 Jun 2026'  },
  { id: 'PAY-002', pic: 'Marcus Chen',     inisial: 'MC', warna: '#2980B9', periode: 'Juni 2026', totalSesi: 22, rate: 150000, total: 3300000,  status: 'sudah_bayar', tglBayar: '5 Jun 2026'  },
  { id: 'PAY-003', pic: 'Elena Rodriguez', inisial: 'ER', warna: '#27AE60', periode: 'Juni 2026', totalSesi: 48, rate: 175000, total: 8400000,  status: 'sudah_bayar', tglBayar: '4 Jun 2026'  },
  { id: 'PAY-004', pic: 'David Kim',       inisial: 'DK', warna: '#8E44AD', periode: 'Juni 2026', totalSesi: 0,  rate: 0,      total: 0,        status: 'proses',      tglBayar: '—'           },
  { id: 'PAY-005', pic: 'Ahmad Pratama',   inisial: 'AP', warna: '#E67E22', periode: 'Juni 2026', totalSesi: 35, rate: 150000, total: 5250000,  status: 'sudah_bayar', tglBayar: '4 Jun 2026'  },
  { id: 'PAY-006', pic: 'Rina Indah',      inisial: 'RI', warna: '#16A085', periode: 'Juni 2026', totalSesi: 18, rate: 125000, total: 2250000,  status: 'belum_bayar', tglBayar: '—'           },
  { id: 'PAY-007', pic: 'Budi Wijaya',     inisial: 'BW', warna: '#C0392B', periode: 'Juni 2026', totalSesi: 40, rate: 150000, total: 6000000,  status: 'belum_bayar', tglBayar: '—'           },
  { id: 'PAY-008', pic: 'Nadia Dewi',      inisial: 'ND', warna: '#2C3E50', periode: 'Juni 2026', totalSesi: 0,  rate: 0,      total: 0,        status: 'proses',      tglBayar: '—'           },
]

export const paymentStats = {
  menunggu:   2,
  sudahBayar: 4,
  totalBayar: 21450000,
  rataRata:   5362500,
}
