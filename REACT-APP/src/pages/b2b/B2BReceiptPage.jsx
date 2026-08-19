import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Download, Search, X, RotateCcw } from 'lucide-react'

/* ─── Constants ───────────────────────── */
const BULAN_OPTS  = ['Semua Bulan', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const TAHUN_OPTS  = ['Semua Tahun', '2026', '2025']
const JENIS_OPTS  = ['Semua', 'Corporate', 'Apartment']

/* ─── Helpers ─────────────────────────── */
function formatRp(n) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0)
}

/* ─── Dummy data ──────────────────────── */
const RECEIPT_INIT = [
  {
    noReceipt:    'RCP-B2B-26-0001',
    orderId:      '#B2B-26-0001',
    namaKlien:    'PT. Maju Bersama',
    jenis:        'Corporate',
    periode:      'Jun 2026',
    periodeFull:  'Juni 2026',
    total:        12_000_000,
    tglBayar:     '05 Jun 2026',
    tglBayarFull: '05 Juni 2026',
    metode:       'Transfer Bank (BCA)',
    metodeLabel:  'Transfer Bank',
    picKlien:     'Budi Santoso',
    program:      'Corporate Wellness',
    noRef:        'TRF-20260605-001',
    deskripsi:    'Invoice bulanan — Jasa Fitness Management',
    lineItems: [
      { ket: 'Jasa Fitness Management Bulanan', total: 11_280_000 },
      { ket: 'Biaya Operasional',               total: 720_000    },
    ],
    subtotal:  12_000_000,
    ppn:       1_320_000,
    grandTotal: 13_320_000,
  },
  {
    noReceipt:    'RCP-B2B-26-0002',
    orderId:      '#B2B-26-0002',
    namaKlien:    'Apartemen Green Lake',
    jenis:        'Apartment',
    periode:      'Jan 2026',
    periodeFull:  'Januari 2026',
    total:        8_500_000,
    tglBayar:     '03 Jan 2026',
    tglBayarFull: '03 Januari 2026',
    metode:       'Transfer Bank (Mandiri)',
    metodeLabel:  'Transfer Bank',
    picKlien:     'Dewi Kusuma',
    program:      'Apartment Wellness',
    noRef:        'TRF-20260103-002',
    deskripsi:    'Invoice bulanan — Jasa Fitness Management',
    lineItems: [
      { ket: 'Jasa Fitness Management Bulanan', total: 7_990_000 },
      { ket: 'Biaya Operasional',               total: 510_000   },
    ],
    subtotal:  8_500_000,
    ppn:       935_000,
    grandTotal: 9_435_000,
  },
  {
    noReceipt:    'RCP-B2B-26-0003',
    orderId:      '#B2B-26-0004',
    namaKlien:    'PT. Sinar Abadi',
    jenis:        'Corporate',
    periode:      'Feb 2026',
    periodeFull:  'Februari 2026',
    total:        15_000_000,
    tglBayar:     '02 Feb 2026',
    tglBayarFull: '02 Februari 2026',
    metode:       'Transfer Bank (BCA)',
    metodeLabel:  'Transfer Bank',
    picKlien:     'Bapak Hendra',
    program:      'Corporate Wellness',
    noRef:        'TRF-20260202-003',
    deskripsi:    'Invoice bulanan — Jasa Fitness Management',
    lineItems: [
      { ket: 'Jasa Fitness Management Bulanan', total: 14_100_000 },
      { ket: 'Biaya Operasional',               total: 900_000    },
    ],
    subtotal:  15_000_000,
    ppn:       1_650_000,
    grandTotal: 16_650_000,
  },
  {
    noReceipt:    'RCP-B2B-26-0004',
    orderId:      '#B2B-26-0006',
    namaKlien:    'Apartemen The Residence',
    jenis:        'Apartment',
    periode:      'Mei 2026',
    periodeFull:  'Mei 2026',
    total:        7_500_000,
    tglBayar:     '01 Mei 2026',
    tglBayarFull: '01 Mei 2026',
    metode:       'Cash',
    metodeLabel:  'Cash',
    picKlien:     'Ibu Ratna',
    program:      'Apartment Wellness',
    noRef:        'CASH-20260501-004',
    deskripsi:    'Invoice bulanan — Jasa Fitness Management',
    lineItems: [
      { ket: 'Jasa Fitness Management Bulanan', total: 7_050_000 },
      { ket: 'Biaya Operasional',               total: 450_000   },
    ],
    subtotal:  7_500_000,
    ppn:       825_000,
    grandTotal: 8_325_000,
  },
]

/* ─── Metode badge ────────────────────── */
function MetodeBadge({ metode }) {
  const label = metode
  const cls =
    metode.startsWith('Transfer Bank') ? 'bg-blue-100 text-blue-700' :
    metode === 'Cash'                  ? 'bg-green-100 text-green-700' :
    'bg-purple-100 text-purple-700'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${cls}`}>
      {label}
    </span>
  )
}

/* ─── Receipt Modal ───────────────────── */
function ReceiptModal({ rec, onClose }) {
  const printRef = useRef(null)

  function handlePrint() {
    const el = printRef.current
    if (!el) return
    const win = window.open('', '_blank', 'width=700,height=900')
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
                <Row label="Program"  val={rec.program}  />
              </div>
              <div className="space-y-1.5">
                <Row label="Metode Pembayaran"  val={rec.metode}       />
                <Row label="No Ref / Bukti"     val={rec.noRef}        />
                <Row label="Tanggal Bayar"      val={rec.tglBayarFull} />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-200 mb-4" />

            {/* Periode & Deskripsi */}
            <div className="mb-4 space-y-1">
              <div className="flex gap-2">
                <span className="text-[12px] text-gray-400 w-36 shrink-0">Periode Layanan</span>
                <span className="text-[12px] font-semibold text-gray-800">{rec.periodeFull}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[12px] text-gray-400 w-36 shrink-0">Deskripsi</span>
                <span className="text-[12px] text-gray-700">{rec.deskripsi}</span>
              </div>
            </div>

            {/* Tabel ringkas */}
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
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <td className="px-4 py-2.5 text-[13px] font-semibold text-gray-700">Subtotal</td>
                    <td className="px-4 py-2.5 text-[13px] font-semibold text-gray-700 text-right whitespace-nowrap">{formatRp(rec.subtotal)}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-2.5 text-[13px] text-gray-600">PPN 11%</td>
                    <td className="px-4 py-2.5 text-[13px] text-gray-600 text-right whitespace-nowrap">{formatRp(rec.ppn)}</td>
                  </tr>
                  <tr className="border-t-2 border-[#1E1C43] bg-[#1E1C43]/5">
                    <td className="px-3 py-2.5 text-[13px] font-bold text-[#1E1C43] uppercase tracking-wide">Total Diterima</td>
                    <td className="px-3 py-2.5 text-[15px] font-bold text-[#E05945] text-right whitespace-nowrap">{formatRp(rec.grandTotal)}</td>
                  </tr>
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

        {/* Modal action buttons — hidden on print */}
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
export default function B2BReceiptPage() {
  const navigate        = useNavigate()
  const location        = useLocation()
  const incomingState   = location.state

  const [bulan,         setBulan]         = useState('')
  const [tahun,         setTahun]         = useState('')
  const [jenis,         setJenis]         = useState('')
  const [filterMetode,  setFilterMetode]  = useState('')
  const [search,        setSearch]        = useState('')
  const [preview,       setPreview]       = useState(null)
  const [filterOrderId, setFilterOrderId] = useState(null)
  const [showBanner,    setShowBanner]    = useState(false)

  useEffect(() => {
    if (!incomingState) return
    if (incomingState.action === 'view') {
      const target = RECEIPT_INIT.find(
        rcp => rcp.noReceipt === incomingState.receiptId ||
        (rcp.orderId === '#' + incomingState.orderId && rcp.periode === incomingState.periode)
      )
      if (target) setPreview(target)
    }
    if (incomingState.orderId) {
      setFilterOrderId(incomingState.orderId)
      setShowBanner(true)
    }
  }, [incomingState]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleReset() {
    setBulan(''); setTahun(''); setJenis(''); setFilterMetode(''); setSearch('')
  }

  const filtered = RECEIPT_INIT.filter(r => {
    if (filterOrderId && r.orderId !== '#' + filterOrderId) return false
    if (bulan        && !r.periode.startsWith(bulan))        return false
    if (tahun        && !r.tglBayar.includes(tahun))         return false
    if (jenis        && r.jenis !== jenis)                   return false
    if (filterMetode && r.metodeLabel !== filterMetode)      return false
    const q = search.toLowerCase()
    if (q && !r.namaKlien.toLowerCase().includes(q)
          && !r.noReceipt.toLowerCase().includes(q)
          && !r.orderId.toLowerCase().includes(q)) return false
    return true
  })

  const selectCls   = 'h-9 px-3 pr-7 rounded-lg border border-gray-200 bg-white text-[13px] outline-none appearance-none cursor-pointer hover:border-gray-300 focus:border-[#1E1C43] transition-colors'
  const selectStyle = { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }

  return (
    <>
      <div className="p-6 space-y-5">

        {/* Back to Order button */}
        {incomingState?.orderId && (
          <button
            onClick={() => navigate('/b2b/orders/' + incomingState.orderId)}
            className="inline-flex items-center gap-1.5 text-xs text-[#1E1C43] hover:underline no-print"
          >
            ← Kembali ke Order {incomingState.orderId}
          </button>
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Receipt B2B</h1>
            <p className="text-sm text-text-muted mt-1">Bukti pembayaran lunas klien B2B</p>
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
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Corporate</p>
            <p className="text-[28px] font-bold text-blue-600 leading-none">{RECEIPT_INIT.filter(r => r.jenis === 'Corporate').length}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Klien korporat</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Apartment</p>
            <p className="text-[28px] font-bold text-purple-600 leading-none">{RECEIPT_INIT.filter(r => r.jenis === 'Apartment').length}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Klien apartemen</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <select value={bulan} onChange={e => setBulan(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
              <option value="">Semua Bulan</option>
              {BULAN_OPTS.slice(1).map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={tahun} onChange={e => setTahun(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
              <option value="">Semua Tahun</option>
              {TAHUN_OPTS.slice(1).map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={jenis} onChange={e => setJenis(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
              <option value="">Semua Jenis</option>
              <option>Corporate</option><option>Apartment</option>
            </select>
            <select value={filterMetode} onChange={e => setFilterMetode(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[150px] cursor-pointer">
              <option value="">Semua Metode</option>
              <option>Transfer Bank</option><option>Cash</option>
            </select>
            <div className="flex items-center gap-3 ml-auto">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari klien, No Receipt, Order ID..."
                  className="pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[220px]" />
              </div>
              <button onClick={handleReset}
                className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs px-3 py-2 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors">
                <RotateCcw size={12} />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Order filter banner */}
        {showBanner && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between no-print">
            <p className="text-xs text-green-700">
              Menampilkan receipt untuk order:{' '}
              <span className="font-semibold">{incomingState?.orderId}</span>
            </p>
            <button
              onClick={() => {
                setShowBanner(false)
                setFilterOrderId(null)
                navigate('/b2b/receipt', { replace: true })
              }}
              className="text-xs text-green-600 hover:underline"
            >
              Lihat Semua Receipt
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm" style={{ minWidth: '1100px' }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[['No. Receipt',170],['Order ID',130],['Nama Klien',170],['Periode',110],['Total',130],['Tanggal Bayar',110],['Metode',120],['Aksi',100]].map(([h,mw]) => (
                    <th key={h} style={{minWidth:mw}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">Tidak ada receipt yang cocok dengan filter.</td></tr>
                ) : filtered.map(r => (
                  <tr key={r.noReceipt} onClick={() => setPreview(r)} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer">
                    <td className="px-3 py-2.5 text-xs font-semibold text-[#1E1C43] whitespace-nowrap">{r.noReceipt}</td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600">{r.orderId}</td>
                    <td className="px-3 py-2.5 text-xs font-medium text-gray-900 whitespace-nowrap">{r.namaKlien}</td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600">{r.periode}</td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-[#1E1C43] whitespace-nowrap">{formatRp(r.total)}</td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600 whitespace-nowrap">{r.tglBayar}</td>
                    <td className="px-3 py-2.5"><MetodeBadge metode={r.metode} /></td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={e => e.stopPropagation()}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                        title="Download PDF"
                      >
                        <Download size={14} />
                      </button>
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
