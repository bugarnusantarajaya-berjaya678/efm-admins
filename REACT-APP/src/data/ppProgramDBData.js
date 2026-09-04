export const PIC_DB = {
  'EFM-PIC-001': { fullname: 'Sarah Jenkins',   spesialis: 'Strength & Conditioning', hp: '+62 812-1111-0001', biayaSesi: 75000 },
  'EFM-PIC-002': { fullname: 'Marcus Chen',     spesialis: 'Functional Training',      hp: '+62 812-1111-0002', biayaSesi: 75000 },
  'EFM-PIC-003': { fullname: 'Elena Rodriguez', spesialis: 'Yoga & Flexibility',       hp: '+62 812-1111-0003', biayaSesi: 70000 },
  'EFM-PIC-004': { fullname: 'David Kim',       spesialis: 'Sports Rehabilitation',    hp: '+62 812-1111-0004', biayaSesi: 80000 },
}

export const PROGRAMS_INIT = [
  { id: 'PRG-PP-001', namaLatihan: 'Private Training',  namaPaket: '4 Sesi - Starter',  sesi: 4,  pertemuan: 2, partisipan: 1, masa: '30 hari', picId: 'EFM-PIC-001', biayaSesiPIC: 75000,  harga: 800000,  hargaPersesi: 200000, diskonPaket: 0, status: 'aktif' },
  { id: 'PRG-PP-002', namaLatihan: 'Private Training',  namaPaket: '8 Sesi - Base',     sesi: 8,  pertemuan: 2, partisipan: 1, masa: '45 hari', picId: 'EFM-PIC-002', biayaSesiPIC: 75000,  harga: 1600000, hargaPersesi: 200000, diskonPaket: 0, status: 'aktif' },
  { id: 'PRG-PP-003', namaLatihan: 'Private Training',  namaPaket: '12 Sesi - Pro',     sesi: 12, pertemuan: 3, partisipan: 1, masa: '60 hari', picId: 'EFM-PIC-001', biayaSesiPIC: 75000,  harga: 2400000, hargaPersesi: 200000, diskonPaket: 0, status: 'aktif' },
  { id: 'PRG-PP-004', namaLatihan: 'Private Training',  namaPaket: '24 Sesi - Elite',   sesi: 24, pertemuan: 5, partisipan: 1, masa: '90 hari', picId: 'EFM-PIC-003', biayaSesiPIC: 70000,  harga: 4800000, hargaPersesi: 200000, diskonPaket: 0, status: 'aktif' },
  { id: 'PRG-TH-001', namaLatihan: 'Yoga & Stretching', namaPaket: '8 Sesi - Basic',   sesi: 8,  pertemuan: 2, partisipan: 2, masa: '45 hari', picId: 'EFM-PIC-003', biayaSesiPIC: 70000,  harga: 900000,  hargaPersesi: 112500, diskonPaket: 0,      status: 'aktif' },
  { id: 'PRG-TH-002', namaLatihan: 'Sports Rehab',      namaPaket: '12 Sesi - Rehab',  sesi: 12, pertemuan: 3, partisipan: 1, masa: '60 hari', picId: 'EFM-PIC-004', biayaSesiPIC: 80000,  harga: 1800000, hargaPersesi: 150000, diskonPaket: 0,      status: 'aktif' },
]

export const JENIS_OPTS = ['Private Training', 'Yoga & Stretching', 'Sports Rehab']
export const PIC_OPTS_DB = Object.entries(PIC_DB).map(([id, p]) => ({ id, label: `${id} — ${p.fullname}` }))
export const PIC_OPTS    = [...Object.values(PIC_DB).map(p => p.fullname), 'Admin EFM']

export function formatRp(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}
