export const ORDERS_INIT = [
  { id:'PP-27-0001', klien:'James Wilson',       sapaan:'Pak',  pic:'Sarah Jenkins',   paket:'12 Sesi - Pro',    harga:2400000, sesiDone:0,  sesiTotal:12, tglMulai:'8 Jan 2027',   statusOrder:'active',    statusInv:'paid',    invNo:'INV-PP-27-0001', tahapan:'Agreement'       },
  { id:'PP-26-0021', klien:'Sari Dewi Lestari',  sapaan:'Kak',  pic:'Dian Kartika',    paket:'8 Sesi - Base',    harga:1600000, sesiDone:3,  sesiTotal:8,  tglMulai:'2 Nov 2026',   statusOrder:'active',    statusInv:'paid',    invNo:'INV-PP-26-0021', tahapan:'Program Berjalan' },
  { id:'PP-26-0013', klien:'James Wilson',        sapaan:'Pak',  pic:'Sarah Jenkins',   paket:'12 Sesi - Pro',    harga:2400000, sesiDone:4,  sesiTotal:12, tglMulai:'24 Okt 2026',  statusOrder:'active',    statusInv:'paid',    invNo:'INV-PP-26-0013', tahapan:'Program Berjalan' },
  { id:'PP-26-0012', klien:'Emily Chen',          sapaan:'Kak',  pic:'Marcus Chen',     paket:'4 Sesi - Starter', harga:600000,  sesiDone:4,  sesiTotal:4,  tglMulai:'22 Okt 2026',  statusOrder:'completed', statusInv:'paid',    invNo:'INV-PP-26-0012', tahapan:'Program Selesai'  },
  { id:'PP-26-0011', klien:'Robert Taylor',       sapaan:'Pak',  pic:'Elena Rodriguez', paket:'24 Sesi - Elite',  harga:4800000, sesiDone:12, sesiTotal:24, tglMulai:'18 Okt 2026',  statusOrder:'active',    statusInv:'pending', invNo:'INV-PP-26-0011', tahapan:'Program Berjalan' },
  { id:'PP-26-0010', klien:'Anita Suryani',        sapaan:'Kak',  pic:'Sarah Jenkins',   paket:'8 Sesi - Base',    harga:1600000, sesiDone:2,  sesiTotal:8,  tglMulai:'15 Okt 2026',  statusOrder:'cancelled', statusInv:'overdue', invNo:'INV-PP-26-0010', tahapan:'Invoice'          },
  { id:'PP-26-0008', klien:'Budi Santoso',        sapaan:'Pak',  pic:'Marcus Chen',     paket:'12 Sesi - Pro',    harga:2400000, sesiDone:7,  sesiTotal:12, tglMulai:'10 Okt 2026',  statusOrder:'active',    statusInv:'paid',    invNo:'INV-PP-26-0008', tahapan:'Program Berjalan' },
  { id:'PP-26-0007', klien:'Rina Kusuma',         sapaan:'Kak',  pic:'Elena Rodriguez', paket:'4 Sesi - Starter', harga:800000,  sesiDone:4,  sesiTotal:4,  tglMulai:'5 Okt 2026',   statusOrder:'completed', statusInv:'paid',    invNo:'INV-PP-26-0007', tahapan:'Program Selesai'  },
  { id:'PP-26-0006', klien:'Hendra Wijaya',       sapaan:'Mas',  pic:'Sarah Jenkins',   paket:'24 Sesi - Elite',  harga:4800000, sesiDone:3,  sesiTotal:24, tglMulai:'1 Okt 2026',   statusOrder:'active',    statusInv:'pending', invNo:'INV-PP-26-0006', tahapan:'Program Berjalan' },
  { id:'PP-26-0005', klien:'Dewi Rahayu',          sapaan:'Kak',  pic:'Marcus Chen',     paket:'8 Sesi - Base',    harga:1600000, sesiDone:8,  sesiTotal:8,  tglMulai:'25 Sep 2026',  statusOrder:'completed', statusInv:'paid',    invNo:'INV-PP-26-0005', tahapan:'Program Selesai'  },
  { id:'PP-26-0004', klien:'Kevin Hartanto',      sapaan:'Mas',  pic:'Elena Rodriguez', paket:'12 Sesi - Pro',    harga:2400000, sesiDone:10, sesiTotal:12, tglMulai:'20 Sep 2026',  statusOrder:'active',    statusInv:'paid',    invNo:'INV-PP-26-0004', tahapan:'Program Berjalan' },
  { id:'PP-26-0003', klien:'Fiona Santika',       sapaan:'Kak',  pic:'Sarah Jenkins',   paket:'4 Sesi - Starter', harga:800000,  sesiDone:0,  sesiTotal:4,  tglMulai:'15 Sep 2026',  statusOrder:'cancelled', statusInv:'overdue', invNo:'INV-PP-26-0003', tahapan:'Invoice'          },
  { id:'PP-26-0002', klien:'Ahmad Fauzi',         sapaan:'Pak',  pic:'Marcus Chen',     paket:'24 Sesi - Elite',  harga:4800000, sesiDone:24, sesiTotal:24, tglMulai:'10 Sep 2026',  statusOrder:'completed', statusInv:'paid',    invNo:'INV-PP-26-0002', tahapan:'Program Selesai'  },
  { id:'PP-26-0001', klien:'Natasha Putri',       sapaan:'Kak',  pic:'Elena Rodriguez', paket:'8 Sesi - Base',    harga:1600000, sesiDone:5,  sesiTotal:8,  tglMulai:'1 Sep 2026',   statusOrder:'active',    statusInv:'paid',    invNo:'INV-PP-26-0001', tahapan:'Program Berjalan' },
]

export const STATUS_ORDER_LABEL = { active:'Active', completed:'Completed', cancelled:'Cancelled' }
export const STATUS_INV_LABEL   = { paid:'Paid', pending:'Awaiting Payment', overdue:'Overdue' }

export const PIC_OPTS   = ['Sarah Jenkins','Marcus Chen','Elena Rodriguez','Dian Kartika','Rizky Firmansyah']
export const PAKET_OPTS = ['4 Sesi - Starter','8 Sesi - Base','12 Sesi - Pro','24 Sesi - Elite']

export const PAKET_HARGA = {
  '4 Sesi - Starter': 800000,
  '8 Sesi - Base':    1600000,
  '12 Sesi - Pro':    2400000,
  '24 Sesi - Elite':  4800000,
}

export function formatRp(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}
