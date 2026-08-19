import { useState, useRef } from 'react'
import { Eye, Download, Search } from 'lucide-react'

/* ─── Constants ───────────────────────── */
const BULAN_OPTS = ['Semua Bulan', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const TAHUN_OPTS = ['Semua Tahun', '2026', '2025']
const TERMIN_OPTS = ['Semua Termin', 'DP 50%', 'Pelunasan', 'Full Payment']

/* ─── Helpers ─────────────────────────── */
function formatRp(n) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0)
}

/* ─── Dummy data ──────────────────────── */
const RECEIPT_INIT = [
  {
    noReceipt:    'RCP-EV-001',
    orderId:      '#EO-001',
    namaEvent:    'Fun Run Jakarta 2026',
    jenisTermin:  'DP 50%',
    total:        23_870_000,
    tglBayar:     '01 Jun 2026',
    tglBayarFull: '01 Juni 2026',
    metode:       'Transfer Bank (BCA)',
    namaKlien:    'Komunitas Lari Jakarta',
    picKlien:     'Bapak Rizky',
    tanggalEvent: '20 Juli 2026',
    lokasiEvent:  'GBK, Senayan, Jakarta',
    noRef:        'TRF-20260601-001',
    lineItems: [
      { ket: 'Koordinasi & Manajemen Event', total: 20_000_000 },
      { ket: 'Instruktur Fitness (5 orang)', total: 15_000_000 },
      { ket: 'Peralatan & Perlengkapan',     total: 5_000_000  },
    ],
    subtotal:    40_000_000,
    mgmtFee:     4_000_000,
    ppn:         4_840_000,
    pph:         1_100_000,
    totalInvoice: 47_740_000,
    dpAmount:    23_870_000,
  },
  {
    noReceipt:    'RCP-EV-002',
    orderId:      '#EO-002',
    namaEvent:    'Yoga Festival Senayan',
    jenisTermin:  'DP 50%',
    total:        14_000_000,
    tglBayar:     '05 Jun 2026',
    tglBayarFull: '05 Juni 2026',
    metode:       'Transfer Bank (Mandiri)',
    namaKlien:    'Yayasan Sehat Indonesia',
    picKlien:     'Ibu Sari',
    tanggalEvent: '20 Juni 2026',
    lokasiEvent:  'GOR Senayan, Jakarta',
    noRef:        'TRF-20260605-002',
    lineItems: [
      { ket: 'Koordinasi & Manajemen Event', total: 12_000_000 },
      { ket: 'Instruktur Yoga (3 orang)',    total: 9_000_000  },
      { ket: 'Peralatan & Perlengkapan',     total: 3_000_000  },
    ],
    subtotal:    24_000_000,
    mgmtFee:     2_400_000,
    ppn:         2_904_000,
    pph:         660_000,
    totalInvoice: 28_644_000,
    dpAmount:    14_000_000,
  },
  {
    noReceipt:    'RCP-EV-003',
    orderId:      '#EO-006',
    namaEvent:    'Private Fitness Retreat',
    jenisTermin:  'Full Payment',
    total:        15_000_000,
    tglBayar:     '28 Jun 2026',
    tglBayarFull: '28 Juni 2026',
    metode:       'Cash',
    namaKlien:    'PT. Selaras Bersama',
    picKlien:     'Ibu Kirana',
    tanggalEvent: '5 Juli 2026',
    lokasiEvent:  'Bali Retreat Center, Ubud',
    noRef:        'CASH-20260628-003',
    lineItems: [
      { ket: 'Koordinasi & Manajemen Retreat', total: 8_000_000  },
      { ket: 'Instruktur Fitness (2 orang)',   total: 4_000_000  },
      { ket: 'Akomodasi & Konsumsi',           total: 3_000_000  },
    ],
    subtotal:    15_000_000,
    mgmtFee:     1_500_000,
    ppn:         1_815_000,
    pph:         412_500,
    totalInvoice: 15_000_000,
    dpAmount:    null,
  },
]

/* ─── Jenis Termin badge ──────────────── */
function TerminBadge({ termin }) {
  const cls =
    termin === 'DP 50%'       ? 'bg-amber-100 text-amber-700' :
    termin === 'Pelunasan'    ? 'bg-blue-100 text-blue-700'   :
    'bg-green-100 text-green-700'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${cls}`}>
      {termin}
    </span>
  )
}

/* ─── Metode badge ────────────────────── */
function MetodeBadge({ metode }) {
  const cls =
    metode.startsWith('Transfer Bank') ? 'bg-blue-100 text-blue-700'  :
    metode === 'Cash'                  ? 'bg-green-100 text-green-700' :
    'bg-purple-100 text-purple-700'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${cls}`}>
      {metode}
    </span>
  )
}

/* ─── Receipt Modal ───────────────────── */
function ReceiptModal({ rec, onClose }) {
  const printRef = useRef(null)

  function handlePrint() {
    const el = printRef.current
    if (!el) return
    const win = window.open('', '_blank', 'width=700,height=950')
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt ${rec.noReceipt}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: sans-serif; font-size: 13px; color: #111; }
          </style>
        </head>
        <body>${el.innerHTML}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
  }

  const isDP = rec.jenisTermin === 'DP 50%' && rec.dpAmount

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl my-6 shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Receipt body (printable) ── */}
        <div ref={printRef}>

          {/* Header navy */}
          <div className="bg-[#1E1C43] px-7 py-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="EFM" className="w-10 h-10 rounded-full object-cover" onError={e => { e.target.style.display = 'none' }} />
              </div>
              <div>
                <p className="text-white font-bold text-[14px] leading-tight">Essential Fitness Management</p>
                <p className="text-white/60 text-[11px]">CV. Bugar Nusantara Jaya</p>
                <p className="text-white/55 text-[10px]">Jl. Terogong Raya No.18, Jakarta Selatan</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-white font-bold text-[15px] tracking-wide leading-tight">RECEIPT</p>
              <p className="text-white/70 text-[10px] tracking-wider mb-2">BUKTI PEMBAYARAN</p>
              <p className="text-white/55 text-[11px]">No: <span className="text-white font-semibold">{rec.noReceipt}</span></p>
              <p className="text-white/55 text-[11px]">Tanggal: <span className="text-white font-semibold">{rec.tglBayarFull}</span></p>
            </div>
          </div>

          {/* Body */}
          <div className="px-7 py-6">

            {/* Info 2 kolom */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-5">
              <div className="space-y-1.5">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Kepada</p>
                  <p className="text-[14px] font-bold text-[#1E1C43]">{rec.namaKlien}</p>
                </div>
                <Row label="PIC"      val={rec.picKlien} />
                <Row label="Order ID" val={rec.orderId}  />
              </div>
              <div className="space-y-1.5">
                <Row label="Metode Pembayaran" val={rec.metode}       />
                <Row label="No Ref / Bukti"    val={rec.noRef}        />
                <Row label="Tanggal Bayar"     val={rec.tglBayarFull} />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-200 mb-4" />

            {/* Event detail */}
            <div className="mb-4 space-y-1">
              <div className="flex gap-2">
                <span className="text-[12px] text-gray-400 w-36 shrink-0">Nama Event</span>
                <span className="text-[12px] font-semibold text-gray-800">{rec.namaEvent}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[12px] text-gray-400 w-36 shrink-0">Tanggal Event</span>
                <span className="text-[12px] text-gray-700">{rec.tanggalEvent}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[12px] text-gray-400 w-36 shrink-0">Lokasi</span>
                <span className="text-[12px] text-gray-700">{rec.lokasiEvent}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[12px] text-gray-400 w-36 shrink-0">Jenis Pembayaran</span>
                <span className="text-[12px] font-semibold text-gray-800">{rec.jenisTermin}</span>
              </div>
            </div>

            {/* Tabel rincian event */}
            <div className="rounded-xl overflow-hidden border border-gray-100 mb-5">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rec.lineItems.map((li, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="px-4 py-2.5 text-[13px] text-gray-700">{li.ket}</td>
                      <td className="px-4 py-2.5 text-[13px] text-gray-700 text-right whitespace-nowrap">{formatRp(li.total)}</td>
                    </tr>
                  ))}

                  {/* Subtotal */}
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <td className="px-4 py-2.5 text-[13px] font-semibold text-gray-700">Subtotal</td>
                    <td className="px-4 py-2.5 text-[13px] font-semibold text-gray-700 text-right whitespace-nowrap">{formatRp(rec.subtotal)}</td>
                  </tr>

                  {/* Management Fee */}
                  <tr className="border-b border-gray-50">
                    <td className="px-4 py-2.5 text-[13px] text-gray-600">Management Fee 10%</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-600 text-right whitespace-nowrap">{formatRp(rec.mgmtFee)}</td>
                  </tr>

                  {/* PPN */}
                  <tr className="border-b border-gray-50">
                    <td className="px-4 py-2.5 text-[13px] text-gray-600">PPN 11%</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-600 text-right whitespace-nowrap">{formatRp(rec.ppn)}</td>
                  </tr>

                  {/* PPh */}
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-2.5 text-[13px] text-gray-600">PPh Final 2,5%</td>
                    <td className="px-4 py-2.5 text-[13px] text-red-500 text-right whitespace-nowrap">-{formatRp(rec.pph)}</td>
                  </tr>

                  {/* Total Invoice */}
                  <tr className={`border-t-2 border-[#1E1C43] ${isDP ? '' : 'bg-[#1E1C43]/5'}`}>
                    <td className="px-3 py-2.5 text-[13px] font-bold text-[#1E1C43] uppercase tracking-wide">Total Invoice</td>
                    <td className={`px-3 py-2.5 text-right whitespace-nowrap ${isDP ? 'text-[14px] font-semibold text-gray-700' : 'text-[15px] font-bold text-[#E05945]'}`}>
                      {formatRp(rec.totalInvoice)}
                    </td>
                  </tr>

                  {/* DP 50% row — only when applicable */}
                  {isDP && (
                    <tr className="bg-[#1E1C43]/5">
                      <td className="px-3 py-2.5 text-[13px] font-bold text-[#1E1C43] uppercase tracking-wide">
                        DP 50% (Pembayaran Ini)
                      </td>
                      <td className="px-3 py-2.5 text-[15px] font-bold text-[#E05945] text-right whitespace-nowrap">
                        {formatRp(rec.dpAmount)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Stamp LUNAS */}
            <div className="flex justify-center mb-5">
              <div
                className="border-4 border-green-500 text-green-600 font-bold text-3xl px-6 py-2 rounded-lg opacity-90 select-none"
                style={{ transform: 'rotate(-12deg)', letterSpacing: '0.05em' }}
              >
                ✓ LUNAS
              </div>
            </div>

            {/* Footer */}
            <div className="text-center space-y-1 pt-4 border-t border-gray-100">
              <p className="text-[12px] text-gray-500 font-medium">
                Terima kasih atas kepercayaan Anda kepada Essential Fitness Management
              </p>
              <p className="text-[11px] text-gray-400">
                Dokumen ini adalah bukti pembayaran yang sah
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                📞 +62 21 7891 2345 &nbsp;|&nbsp; ✉ info@efm.co.id &nbsp;|&nbsp; 🌐 www.efm.co.id
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-7 py-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#1E1C43] hover:bg-[#2d2b5a] transition-colors"
          >
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, val }) {
  return (
    <div className="flex gap-1.5 items-baseline">
      <span className="text-[11px] text-gray-400 w-28 shrink-0">{label}</span>
      <span className="text-[12px] font-medium text-gray-800">{val || '—'}</span>
    </div>
  )
}

/* ─── Main Page ───────────────────────── */
export default function EventReceiptPage() {
  const [bulan,   setBulan]   = useState('Semua Bulan')
  const [tahun,   setTahun]   = useState('Semua Tahun')
  const [terminF, setTerminF] = useState('Semua Termin')
  const [search,  setSearch]  = useState('')
  const [preview, setPreview] = useState(null)

  const filtered = RECEIPT_INIT.filter(r => {
    if (bulan   !== 'Semua Bulan'  && !r.tglBayar.includes(bulan))  return false
    if (tahun   !== 'Semua Tahun'  && !r.tglBayar.includes(tahun))  return false
    if (terminF !== 'Semua Termin' && r.jenisTermin !== terminF)     return false
    const q = search.toLowerCase()
    if (q && !r.namaEvent.toLowerCase().includes(q)
          && !r.noReceipt.toLowerCase().includes(q)
          && !r.orderId.toLowerCase().includes(q)
          && !r.namaKlien.toLowerCase().includes(q)) return false
    return true
  })

  const selectCls   = 'h-9 px-3 pr-7 rounded-lg border border-gray-200 bg-white text-[13px] outline-none appearance-none cursor-pointer hover:border-gray-300 focus:border-[#1E1C43] transition-colors'
  const selectStyle = { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }

  return (
    <>
      <div className="p-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Receipt Event</h1>
            <p className="text-sm text-text-muted mt-1">Bukti pembayaran lunas klien Event</p>
          </div>
        </div>

        {/* KPI mini */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Total Receipt</p>
            <p className="text-[28px] font-bold text-[#1E1C43] leading-none">{RECEIPT_INIT.length}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Pembayaran terkonfirmasi</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">DP Diterima</p>
            <p className="text-[28px] font-bold text-amber-600 leading-none">{RECEIPT_INIT.filter(r => r.jenisTermin === 'DP 50%').length}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Pembayaran pertama</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Full / Lunas</p>
            <p className="text-[28px] font-bold text-green-600 leading-none">{RECEIPT_INIT.filter(r => r.jenisTermin === 'Full Payment' || r.jenisTermin === 'Pelunasan').length}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Pembayaran selesai</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5 flex flex-wrap items-center gap-3">
          <select value={bulan}   onChange={e => setBulan(e.target.value)}   className={selectCls} style={selectStyle}>{BULAN_OPTS.map(o => <option key={o}>{o}</option>)}</select>
          <select value={tahun}   onChange={e => setTahun(e.target.value)}   className={selectCls} style={selectStyle}>{TAHUN_OPTS.map(o => <option key={o}>{o}</option>)}</select>
          <select value={terminF} onChange={e => setTerminF(e.target.value)} className={selectCls} style={selectStyle}>{TERMIN_OPTS.map(o => <option key={o}>{o}</option>)}</select>
          <button
            onClick={() => { setBulan('Semua Bulan'); setTahun('Semua Tahun'); setTerminF('Semua Termin'); setSearch('') }}
            className="h-9 px-3 rounded-lg border border-[#1E1C43] text-[13px] font-semibold text-[#1E1C43] hover:bg-[#1E1C43] hover:text-white transition-colors"
          >
            Reset
          </button>
          <div className="relative ml-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari event, No Receipt, Order ID..."
              className="h-9 pl-8 pr-4 rounded-lg border border-gray-200 bg-white text-[13px] outline-none w-64 focus:border-[#1E1C43] transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm" style={{ minWidth: '1000px' }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['No Receipt', 'Order ID', 'Nama Event', 'Jenis Termin', 'Total', 'Tanggal Bayar', 'Metode', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">Tidak ada receipt yang cocok dengan filter.</td></tr>
                ) : filtered.map(r => (
                  <tr key={r.noReceipt} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-3 py-2.5 text-xs font-semibold text-[#1E1C43] whitespace-nowrap">{r.noReceipt}</td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600">{r.orderId}</td>
                    <td className="px-3 py-2.5 text-xs font-medium text-gray-900 whitespace-nowrap">{r.namaEvent}</td>
                    <td className="px-3 py-2.5"><TerminBadge termin={r.jenisTermin} /></td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-600 whitespace-nowrap">{formatRp(r.total)}</td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600 whitespace-nowrap">{r.tglBayar}</td>
                    <td className="px-3 py-2.5"><MetodeBadge metode={r.metode} /></td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPreview(r)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-[#1E1C43] hover:text-white transition-colors"
                          title="Lihat Receipt"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                          title="Download PDF"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <p className="text-[12px] text-text-muted">
              Menampilkan <span className="font-semibold text-text-primary">{filtered.length}</span> dari{' '}
              <span className="font-semibold text-text-primary">{RECEIPT_INIT.length}</span> receipt
            </p>
          </div>
        </div>
      </div>

      {preview && (
        <ReceiptModal rec={preview} onClose={() => setPreview(null)} />
      )}
    </>
  )
}
