export const RECEIPTS_INIT = [
  {
    rcpNo: 'RCP-PP-27-0001', invNo: 'INV-PP-27-0001',
    orderId: 'PP-27-0001', client: 'James Wilson', initials: 'JW', color: '#2980B9',
    paket: '12 Sesi - Pro', pic: 'Sarah Jenkins',
    tglBayar: '8 Jan 2027', metode: 'Transfer Bank (BCA)', total: 2400000,
    waStatus: 'not-sent', waTgl: null,
  },
  {
    rcpNo: 'RCP-PP-26-0021', invNo: 'INV-PP-26-0021',
    orderId: 'PP-26-0021', client: 'Sari Dewi Lestari', initials: 'SD', color: '#8E44AD',
    paket: '8 Sesi - Basic', pic: 'Dian Kartika',
    tglBayar: '2 Nov 2026', metode: 'Transfer Bank (Mandiri)', total: 1400000,
    waStatus: 'sent', waTgl: '2 Nov 2026',
  },
  {
    rcpNo: 'RCP-PP-26-0013', invNo: 'INV-PP-26-0013',
    orderId: 'PP-26-0013', client: 'James Wilson', initials: 'JW', color: '#2980B9',
    paket: '12 Sesi - Pro', pic: 'Sarah Jenkins',
    tglBayar: '24 Okt 2026', metode: 'Transfer Bank (BCA)', total: 2400000,
    waStatus: 'not-sent', waTgl: null,
  },
  {
    rcpNo: 'RCP-PP-26-0012', invNo: 'INV-PP-26-0012',
    orderId: 'PP-26-0012', client: 'Emily Chen', initials: 'EC', color: '#27AE60',
    paket: '4 Sesi - Starter', pic: 'Marcus Chen',
    tglBayar: '22 Okt 2026', metode: 'QRIS', total: 600000,
    waStatus: 'sent', waTgl: '22 Okt 2026',
  },
  {
    rcpNo: 'RCP-PP-26-0008', invNo: 'INV-PP-26-0008',
    orderId: 'PP-26-0008', client: 'Budi Santoso', initials: 'BS', color: '#16A085',
    paket: '12 Sesi - Pro', pic: 'Marcus Chen',
    tglBayar: '10 Okt 2026', metode: 'Transfer Bank (Mandiri)', total: 2400000,
    waStatus: 'sent', waTgl: '10 Okt 2026',
  },
  {
    rcpNo: 'RCP-PP-26-0007', invNo: 'INV-PP-26-0007',
    orderId: 'PP-26-0007', client: 'Rina Kusuma', initials: 'RK', color: '#D35400',
    paket: '4 Sesi - Starter', pic: 'Elena Rodriguez',
    tglBayar: '5 Okt 2026', metode: 'Cash', total: 800000,
    waStatus: 'sent', waTgl: '5 Okt 2026',
  },
  {
    rcpNo: 'RCP-PP-26-0005', invNo: 'INV-PP-26-0005',
    orderId: 'PP-26-0005', client: 'Dewi Anggraini', initials: 'DA', color: '#2ECC71',
    paket: '8 Sesi - Base', pic: 'Marcus Chen',
    tglBayar: '25 Sep 2026', metode: 'Transfer Bank (BCA)', total: 1600000,
    waStatus: 'sent', waTgl: '25 Sep 2026',
  },
  {
    rcpNo: 'RCP-PP-26-0004', invNo: 'INV-PP-26-0004',
    orderId: 'PP-26-0004', client: 'Kevin Hartanto', initials: 'KH', color: '#3498DB',
    paket: '12 Sesi - Pro', pic: 'Elena Rodriguez',
    tglBayar: '20 Sep 2026', metode: 'Transfer Bank (BCA)', total: 2400000,
    waStatus: 'sent', waTgl: '20 Sep 2026',
  },
  {
    rcpNo: 'RCP-PP-26-0002', invNo: 'INV-PP-26-0002',
    orderId: 'PP-26-0002', client: 'Ahmad Fauzi', initials: 'AF', color: '#9B59B6',
    paket: '24 Sesi - Elite', pic: 'Marcus Chen',
    tglBayar: '10 Sep 2026', metode: 'Transfer Bank (BCA)', total: 4800000,
    waStatus: 'sent', waTgl: '10 Sep 2026',
  },
  {
    rcpNo: 'RCP-PP-26-0001', invNo: 'INV-PP-26-0001',
    orderId: 'PP-26-0001', client: 'Natasha Putri', initials: 'NP', color: '#E67E22',
    paket: '8 Sesi - Base', pic: 'Elena Rodriguez',
    tglBayar: '1 Sep 2026', metode: 'Transfer Bank (BCA)', total: 1600000,
    waStatus: 'sent', waTgl: '1 Sep 2026',
  },
]

export const WA_LABEL = { sent: 'Sent', 'not-sent': 'Not Sent', failed: 'Failed' }

export function formatRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}

export function sesiCount(paket) {
  const m = paket.match(/(\d+)\s*sesi/i)
  return m ? m[1] : '1'
}
