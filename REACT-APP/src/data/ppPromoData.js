export const PROMO_INIT = [
  // ── Tipe: diskon — mempengaruhi harga (potongan) ──────────────────────────
  {
    kode: 'HEMAT10', label: 'Voucher Hemat 10%',
    tipe: 'diskon', subTipe: 'persen', nilai: 10, aktif: true,
    keterangan: 'Diskon 10% dari total harga paket',
    tema: null, benefitBonus: null,
    programIds: null,
    tanggalMulai: null, tanggalBerakhir: null,
    maxPemakaian: null, jumlahPemakaian: 7,
  },
  {
    kode: 'HARBOLNAS', label: 'Hari Belanja Nasional',
    tipe: 'diskon', subTipe: 'persen', nilai: 15, aktif: true,
    keterangan: 'Promo spesial Harbolnas 12.12',
    tema: { nama: 'Harbolnas', icon: '🛍️', warna: 'orange', berlakuHingga: '2026-12-12' },
    benefitBonus: 'Free Shaker Bottle EFM',
    programIds: null,
    tanggalMulai: '2026-12-01', tanggalBerakhir: '2026-12-12',
    maxPemakaian: 50, jumlahPemakaian: 23,
  },
  {
    kode: 'FLAT50K', label: 'Flat Diskon Spesial',
    tipe: 'diskon', subTipe: 'nominal', nilai: 50000, aktif: true,
    keterangan: 'Potongan langsung Rp 50.000',
    tema: null, benefitBonus: null,
    programIds: null,
    tanggalMulai: null, tanggalBerakhir: null,
    maxPemakaian: 100, jumlahPemakaian: 45,
  },
  {
    kode: 'NEWYEAR27', label: 'New Year 2027 Promo',
    tipe: 'diskon', subTipe: 'persen', nilai: 20, aktif: false,
    keterangan: 'Promo tahun baru, berlaku Jan 2027',
    tema: { nama: 'Tahun Baru', icon: '🎆', warna: 'blue', berlakuHingga: '2027-01-31' },
    benefitBonus: null,
    programIds: null,
    tanggalMulai: '2027-01-01', tanggalBerakhir: '2027-01-31',
    maxPemakaian: null, jumlahPemakaian: 0,
  },
  {
    kode: 'MERDEKA17', label: 'Promo Kemerdekaan RI ke-81',
    tipe: 'diskon', subTipe: 'persen', nilai: 17, aktif: true,
    keterangan: 'Diskon 17% dalam rangka HUT RI ke-81. Berlaku 10–17 Agustus 2026.',
    tema: { nama: 'Kemerdekaan', icon: '🇮🇩', warna: 'red', berlakuHingga: '2026-08-17' },
    benefitBonus: 'Free Sticker Pack EFM x RI81',
    programIds: null,
    tanggalMulai: '2026-08-10', tanggalBerakhir: '2026-08-17',
    maxPemakaian: 81, jumlahPemakaian: 34,
  },
  // ── Tipe: bonus — tidak mempengaruhi harga (benefit tambahan) ─────────────
  {
    kode: 'FREEMASSAGE', label: 'Free 1x Sport Massage',
    tipe: 'bonus', subTipe: 'treatment', nilai: 0, aktif: true,
    keterangan: 'Berlaku 1x selama program berjalan. Hubungi admin untuk penjadwalan.',
    tema: null, benefitBonus: null,
    programIds: null,
    tanggalMulai: null, tanggalBerakhir: null,
    maxPemakaian: null, jumlahPemakaian: 8,
  },
  {
    kode: 'FREELATIHAN', label: 'Free 1x Sesi Latihan',
    tipe: 'bonus', subTipe: 'latihan', nilai: 0, aktif: true,
    keterangan: 'Dapat digunakan kapan saja selama program berlangsung.',
    tema: null, benefitBonus: null,
    programIds: null,
    tanggalMulai: null, tanggalBerakhir: null,
    maxPemakaian: null, jumlahPemakaian: 12,
  },
  {
    kode: 'FREEPROTEIN', label: 'Free 1 Sachet Protein',
    tipe: 'bonus', subTipe: 'produk', nilai: 0, aktif: true,
    keterangan: 'Protein shake satu rasa pilihan, diambil di kantor EFM.',
    tema: null, benefitBonus: null,
    programIds: null,
    tanggalMulai: null, tanggalBerakhir: null,
    maxPemakaian: 30, jumlahPemakaian: 20,
  },
  {
    kode: 'FREEBLENDER', label: 'Free Blender Bottle',
    tipe: 'bonus', subTipe: 'produk', nilai: 0, aktif: false,
    keterangan: 'Merchandise EFM edisi terbatas — stok habis.',
    tema: null, benefitBonus: null,
    programIds: null,
    tanggalMulai: null, tanggalBerakhir: null,
    maxPemakaian: 20, jumlahPemakaian: 20,
  },
]

export const TIPE_LABEL    = { diskon: 'Diskon', bonus: 'Bonus / Free' }
export const SUBTIPE_LABEL = {
  persen: '% Persen', nominal: 'Nominal (Rp)',
  treatment: 'Free Treatment', latihan: 'Free Sesi', produk: 'Free Produk',
}

export const SUBTIPE_OPTS_DISKON = ['persen', 'nominal']
export const SUBTIPE_OPTS_BONUS  = ['treatment', 'latihan', 'produk']

export const TEMA_QUICK_OPTS = [
  { nama: 'Natal',           icon: '🎄', warna: 'red'    },
  { nama: 'Tahun Baru',      icon: '🎆', warna: 'blue'   },
  { nama: 'Kemerdekaan',     icon: '🇮🇩', warna: 'red'    },
  { nama: 'Lebaran',         icon: '🌙', warna: 'green'  },
  { nama: 'Valentine',       icon: '❤️',  warna: 'red'    },
  { nama: 'Harbolnas',       icon: '🛍️', warna: 'orange' },
  { nama: 'Ulang Tahun EFM', icon: '🎂', warna: 'purple' },
]

export const TEMA_WARNA_CLS = {
  red:    'bg-red-50 text-red-600 border-red-200',
  blue:   'bg-blue-50 text-blue-600 border-blue-200',
  green:  'bg-green-50 text-green-600 border-green-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
}
