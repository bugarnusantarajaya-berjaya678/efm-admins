export const PROMO_INIT = [
  // Tipe: diskon — mempengaruhi harga (potongan)
  { kode: 'HEMAT10',    label: 'Voucher Hemat 10%',       tipe: 'diskon', subTipe: 'persen',  nilai: 10,    aktif: true,  keterangan: 'Diskon 10% dari total harga paket' },
  { kode: 'HARBOLNAS',  label: 'Hari Belanja Nasional',   tipe: 'diskon', subTipe: 'persen',  nilai: 15,    aktif: true,  keterangan: 'Promo spesial Harbolnas 12.12' },
  { kode: 'FLAT50K',    label: 'Flat Diskon Spesial',     tipe: 'diskon', subTipe: 'nominal', nilai: 50000, aktif: true,  keterangan: 'Potongan langsung Rp 50.000' },
  { kode: 'NEWYEAR25',  label: 'New Year 2027 Promo',     tipe: 'diskon', subTipe: 'persen',  nilai: 20,    aktif: false, keterangan: 'Promo tahun baru, berlaku Jan 2027' },
  // Tipe: bonus — tidak mempengaruhi harga (benefit tambahan)
  { kode: 'FREEMASSAGE',  label: 'Free 1x Sport Massage',   tipe: 'bonus', subTipe: 'treatment', nilai: 0, aktif: true,  keterangan: 'Berlaku 1x selama program berjalan' },
  { kode: 'FREELATIHAN',  label: 'Free 1x Sesi Latihan',    tipe: 'bonus', subTipe: 'latihan',   nilai: 0, aktif: true,  keterangan: 'Dapat digunakan kapan saja selama program' },
  { kode: 'FREEPROTEIN',  label: 'Free 1 Sachet Protein',   tipe: 'bonus', subTipe: 'produk',    nilai: 0, aktif: true,  keterangan: 'Protein shake satu rasa pilihan' },
  { kode: 'FREEBLENDER',  label: 'Free Blender Bottle',     tipe: 'bonus', subTipe: 'produk',    nilai: 0, aktif: false, keterangan: 'Merchandise EFM edisi terbatas' },
]

export const TIPE_LABEL    = { diskon: 'Diskon', bonus: 'Bonus / Free' }
export const SUBTIPE_LABEL = {
  persen: '% Persen', nominal: 'Nominal (Rp)',
  treatment: 'Free Treatment', latihan: 'Free Sesi', produk: 'Free Produk',
}

export const SUBTIPE_OPTS_DISKON = ['persen', 'nominal']
export const SUBTIPE_OPTS_BONUS  = ['treatment', 'latihan', 'produk']
