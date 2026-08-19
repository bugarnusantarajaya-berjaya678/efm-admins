export const INVOICES_INIT = [
  {
    invNo: 'INV-PP-26-0013', orderId: 'PP-26-0013',
    client: 'James Wilson',  initials: 'JW', color: '#2980B9',
    paket: '12 Sesi - Pro',  namaLatihan: 'Private Training',
    pic: 'Sarah Jenkins',   tanggal: '10 Jun 2026', due: '24 Jun 2026',
    status: 'paid',
    hargaPersesi: 125000, sesi: 12, hargaPaket: 1500000, diskonPaket: 0,
    biayaLain: 50000, biayaLainKet: 'Biaya Peralatan Khusus',
    diskon: 0, promoKode: '', promoType: '', promoVal: 0, pajak: 0, total: 1550000,
    bulan: 'jun 2026',
    paidDate: '10 Jun 2026', payMethod: 'Transfer Bank (BCA)',
  },
  {
    invNo: 'INV-PP-26-0011', orderId: 'PP-26-0011',
    client: 'Robert Taylor', initials: 'RT', color: '#E05945',
    paket: '24 Sesi - Elite', namaLatihan: 'Private Training',
    pic: 'Elena Rodriguez', tanggal: '8 Jun 2026', due: '22 Jun 2026',
    status: 'pending',
    hargaPersesi: 125000, sesi: 24, hargaPaket: 2800000, diskonPaket: 200000,
    biayaLain: 0, biayaLainKet: '',
    diskon: 280000, promoKode: 'PROMO10', promoType: 'diskon_persen', promoVal: 10, pajak: 0, total: 2520000,
    bulan: 'jun 2026',
    paidDate: null, payMethod: null,
  },
  {
    invNo: 'INV-PP-26-0012', orderId: 'PP-26-0012',
    client: 'Emily Chen',    initials: 'EC', color: '#27AE60',
    paket: '4 Sesi - Starter', namaLatihan: 'Private Training',
    pic: 'Marcus Chen',     tanggal: '5 Jun 2026', due: '19 Jun 2026',
    status: 'paid',
    hargaPersesi: 150000, sesi: 4, hargaPaket: 600000, diskonPaket: 0,
    biayaLain: 0, biayaLainKet: '',
    diskon: 0, promoKode: '', promoType: '', promoVal: 0, pajak: 0, total: 600000,
    bulan: 'jun 2026',
    paidDate: '5 Jun 2026', payMethod: 'Transfer Bank (BCA)',
  },
  {
    invNo: 'INV-PP-26-0010', orderId: 'PP-26-0010',
    client: 'James Wilson',  initials: 'JW', color: '#8E44AD',
    paket: '8 Sesi - Base',  namaLatihan: 'Private Training',
    pic: 'Sarah Jenkins',   tanggal: '1 Jun 2026', due: '15 Jun 2026',
    status: 'overdue',
    hargaPersesi: 137500, sesi: 8, hargaPaket: 1100000, diskonPaket: 0,
    biayaLain: 75000, biayaLainKet: 'Biaya Transportasi',
    diskon: 0, promoKode: '', promoType: '', promoVal: 0, pajak: 0, total: 1175000,
    bulan: 'jun 2026',
    paidDate: null, payMethod: null,
  },
  {
    invNo: 'INV-PP-26-0009', orderId: 'PP-26-0009',
    client: 'Anita Kumar',   initials: 'AK', color: '#F39C12',
    paket: '12 Sesi - Pro',  namaLatihan: 'Private Training',
    pic: 'David Kim',       tanggal: '28 Mei 2026', due: '11 Jun 2026',
    status: 'paid',
    hargaPersesi: 125000, sesi: 12, hargaPaket: 1500000, diskonPaket: 0,
    biayaLain: 0, biayaLainKet: '',
    diskon: 0, promoKode: '', promoType: '', promoVal: 0, pajak: 0, total: 1500000,
    bulan: 'mei 2026',
    paidDate: '28 Mei 2026', payMethod: 'Transfer Bank (Mandiri)',
  },
]

export const STATUS_LABEL = {
  paid: 'Paid', pending: 'Awaiting Payment', overdue: 'Overdue', draft: 'Draft',
}

export const BULAN_OPTS = [
  { value: 'jun 2026', label: 'Juni 2026' },
  { value: 'mei 2026', label: 'Mei 2026' },
  { value: 'apr 2026', label: 'April 2026' },
]

export function formatRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}
