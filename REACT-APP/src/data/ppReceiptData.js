export const RECEIPTS_INIT = [
  {
    rcpNo: 'RCP-PP-26-0013', invNo: 'INV-PP-26-0013',
    orderId: 'PP-26-0013', client: 'James Wilson',  initials: 'JW', color: '#2980B9',
    paket: '12 Sesi - Pro', pic: 'Sarah Jenkins',
    tglBayar: '10 Jun 2026', metode: 'Transfer Bank (BCA)', total: 1500000,
    waStatus: 'not-sent', waTgl: null,
  },
  {
    rcpNo: 'RCP-PP-26-0012', invNo: 'INV-PP-26-0012',
    orderId: 'PP-26-0012', client: 'Emily Chen',    initials: 'EC', color: '#27AE60',
    paket: '4 Sesi - Starter', pic: 'Marcus Chen',
    tglBayar: '15 Jun 2026', metode: 'QRIS', total: 600000,
    waStatus: 'sent', waTgl: '15 Jun 2026',
  },
  {
    rcpNo: 'RCP-PP-26-0008', invNo: 'INV-PP-26-0008',
    orderId: 'PP-26-0008', client: 'Budi Santoso',  initials: 'BS', color: '#16A085',
    paket: '12 Sesi - Pro', pic: 'Marcus Chen',
    tglBayar: '2 Jun 2026', metode: 'Transfer Bank (Mandiri)', total: 1500000,
    waStatus: 'sent', waTgl: '2 Jun 2026',
  },
  {
    rcpNo: 'RCP-PP-26-0007', invNo: 'INV-PP-26-0007',
    orderId: 'PP-26-0007', client: 'Rina Kusuma',   initials: 'RK', color: '#D35400',
    paket: '4 Sesi - Starter', pic: 'Elena Rodriguez',
    tglBayar: '28 Mei 2026', metode: 'Cash', total: 600000,
    waStatus: 'sent', waTgl: '28 Mei 2026',
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
