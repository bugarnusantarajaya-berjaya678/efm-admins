import { useState, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Eye, MessageCircle, CheckCircle, X, ArrowLeft, Receipt } from 'lucide-react'
import { WA_LABEL, formatRp } from '../../data/ppReceiptData'
import { getAllReceipts } from '../../data/ppReceiptStore'

/* ─── WA status badge ─── */
const WA_STYLE = {
  'sent':     { cls: 'bg-[#EAFAF1] text-[#27AE60]',  dot: '#27AE60' },
  'not-sent': { cls: 'bg-[#FEF9E7] text-[#F39C12]',  dot: '#F39C12' },
  'failed':   { cls: 'bg-[#FDEDEC] text-[#E74C3C]',  dot: '#E74C3C' },
}

function WABadge({ status }) {
  const s = WA_STYLE[status] || WA_STYLE['not-sent']
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
      {WA_LABEL[status] || status}
    </span>
  )
}

function AvatarSm({ initials, color }) {
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: color }}>
      {initials}
    </div>
  )
}

function StatMini({ label, value, sub, accent }) {
  const bCls = { green: 'border-success', yellow: 'border-warning', red: 'border-danger' }[accent] || 'border-border'
  const vCls = { green: 'text-success', yellow: 'text-warning', red: 'text-danger' }[accent] || 'text-text-primary'
  return (
    <div className={`bg-bg-surface rounded-xl border-[1.5px] ${bCls} px-4 py-3`}>
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${vCls}`}>{value}</div>
      {sub && <div className="text-[11px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  )
}

function PBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center border transition-colors
      ${active ? 'bg-primary text-white border-primary' : 'bg-white text-text-muted border-border hover:border-primary hover:text-primary'}`}>
      {children}
    </button>
  )
}

/* ─── Main Page ─── */
const ROWS = 10

export default function PPReceiptPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [receipts,       setReceipts]      = useState(() => getAllReceipts())
  const [fBulan,         setFBulan]        = useState('')
  const [fTahun,         setFTahun]        = useState('')
  const [fWA,            setFWA]           = useState('')
  const [fSearch,        setFSearch]       = useState('')
  const [page,           setPage]          = useState(1)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createPrefill,  setCreatePrefill]  = useState(null)
  const [createForm,     setCreateForm]     = useState({ tglBayar: '', metode: 'Transfer Bank (BCA)' })

  useEffect(() => {
    const q = location.state?.filterSearch
    if (q) setFSearch(q)
    if (location.state?.createNew) {
      setCreatePrefill(location.state.prefill || {})
      setShowCreateForm(true)
    }
  }, [])

  function handleCreateReceipt() {
    if (!createForm.tglBayar) { alert('Pilih tanggal pembayaran.'); return }
    const prefill = createPrefill || {}
    const COLORS = ['#2980B9', '#27AE60', '#16A085', '#D35400', '#8E44AD']
    const newRcpNo = 'RCP-PP-26-' + String(receipts.length + 5).padStart(4, '0')
    const getInits = n => (n || '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    const tglFormatted = new Date(createForm.tglBayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    const newReceipt = {
      rcpNo: newRcpNo, invNo: prefill.invNo || '', orderId: prefill.orderId || '',
      client: prefill.client || '', initials: getInits(prefill.client || ''),
      color: COLORS[receipts.length % COLORS.length],
      paket: prefill.paket || '', pic: prefill.pic || '',
      tglBayar: tglFormatted, metode: createForm.metode,
      total: prefill.total || 0, waStatus: 'not-sent', waTgl: null,
    }
    setReceipts(prev => [newReceipt, ...prev])
    setShowCreateForm(false)
    setCreatePrefill(null)
    setCreateForm({ tglBayar: '', metode: 'Transfer Bank (BCA)' })
    navigate('/pp/receipt/' + newRcpNo, { state: { receipt: newReceipt } })
  }

  const BSHORT = {Januari:'Jan',Februari:'Feb',Maret:'Mar',April:'Apr',Mei:'Mei',Juni:'Jun',Juli:'Jul',Agustus:'Agu',September:'Sep',Oktober:'Okt',November:'Nov',Desember:'Des'}
  const filtered = useMemo(() => {
    const q = fSearch.trim().toLowerCase()
    return receipts.filter(r => {
      if (fBulan && !(r.tglBayar ?? '').includes(BSHORT[fBulan] ?? fBulan)) return false
      if (fTahun && !(r.tglBayar ?? '').includes(fTahun)) return false
      if (fWA && r.waStatus !== fWA) return false
      if (q && !`${r.client} ${r.rcpNo} ${r.invNo} ${r.orderId}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [receipts, fBulan, fTahun, fWA, fSearch])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS))
  const slice      = filtered.slice((page - 1) * ROWS, page * ROWS)

  const sentCount   = receipts.filter(r => r.waStatus === 'sent').length
  const notSentCount = receipts.filter(r => r.waStatus === 'not-sent').length
  const failedCount = receipts.filter(r => r.waStatus === 'failed').length

  function reset() { setFBulan(''); setFTahun(''); setFWA(''); setFSearch(''); setPage(1) }

  function handleResendWA(rcpNo) {
    setReceipts(prev => prev.map(r => r.rcpNo === rcpNo
      ? { ...r, waStatus: 'sent', waTgl: new Date().toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) }
      : r
    ))
    alert(`Receipt ${rcpNo} berhasil dikirim via WhatsApp!`)
  }

  const start = (page - 1) * ROWS + 1
  const end   = Math.min(page * ROWS, filtered.length)

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
              <Receipt size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">Receipt &amp; Barcode</h1>
              <p className="text-sm text-text-muted mt-0.5">Kelola receipt pembayaran dan status pengiriman WhatsApp</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/pp/orders')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors shrink-0"
          >
            <ArrowLeft size={12} /> Kembali ke PP Orders
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatMini label="Total Receipt" value={receipts.length} sub="Semua receipt" />
        <StatMini label="WA Sent"       value={sentCount}     sub="Notifikasi berhasil" accent="green" />
        <StatMini label="Not Sent"      value={notSentCount}  sub="Belum dikirim"       accent="yellow" />
        <StatMini label="Failed"        value={failedCount}   sub="Kirim ulang WA"      accent="red" />
      </div>

      {/* Filters */}
      <div className="bg-bg-surface border border-border rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
        <select className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors"
          value={fBulan} onChange={e => { setFBulan(e.target.value); setPage(1) }}>
          <option value="">Semua Bulan</option>
          {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map(b => <option key={b}>{b}</option>)}
        </select>
        <select className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors"
          value={fTahun} onChange={e => { setFTahun(e.target.value); setPage(1) }}>
          <option value="">Semua Tahun</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
        <select className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors"
          value={fWA} onChange={e => { setFWA(e.target.value); setPage(1) }}>
          <option value="">Semua Status WA</option>
          <option value="sent">Sent</option>
          <option value="not-sent">Not Sent</option>
          <option value="failed">Failed</option>
        </select>
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-bg-page border-[1.5px] border-border rounded-lg px-3 py-[7px] focus-within:border-primary focus-within:bg-white transition-colors">
          <Search size={14} className="text-text-muted shrink-0" />
          <input
            className="border-none bg-transparent text-xs outline-none w-full text-text-primary placeholder:text-text-muted"
            placeholder="Cari nama klien, no. receipt..."
            value={fSearch}
            onChange={e => { setFSearch(e.target.value); setPage(1) }}
          />
        </div>
        <button onClick={reset} className="px-3.5 py-[7px] bg-primary hover:bg-primary-2 text-white text-xs font-semibold rounded-lg transition-colors shrink-0">Reset</button>
      </div>

      {/* Table */}
      <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: '1250px' }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th style={{minWidth:'175px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">No. Receipt</th>
                <th style={{minWidth:'165px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">No. Invoice</th>
                <th style={{minWidth:'130px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                <th style={{minWidth:'160px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Nama Klien</th>
                <th style={{minWidth:'160px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Program</th>
                <th style={{minWidth:'130px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">PIC</th>
                <th style={{minWidth:'120px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tgl Bayar</th>
                <th style={{minWidth:'130px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                <th style={{minWidth:'120px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status WA</th>
                <th style={{minWidth:'100px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr><td colSpan={10} className="py-10 text-center text-sm text-text-muted">Tidak ada data receipt ditemukan</td></tr>
              ) : slice.map(rcp => (
                <tr key={rcp.rcpNo} onClick={() => navigate('/pp/receipt/' + rcp.rcpNo, { state: { receipt: rcp } })}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
                  <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{rcp.rcpNo}</td>
                  <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{rcp.invNo}</td>
                  <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">#{rcp.orderId}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <AvatarSm initials={rcp.initials} color={rcp.color} />
                      <span className="text-xs font-medium text-gray-900">{rcp.client}</span>
                    </div>
                  </td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5">{rcp.paket}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{rcp.pic}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{rcp.tglBayar}</td>
                  <td className="text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap">{formatRp(rcp.total)}</td>
                  <td className="px-3 py-2.5"><WABadge status={rcp.waStatus} /></td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={e => { e.stopPropagation(); navigate('/pp/receipt/' + rcp.rcpNo, { state: { receipt: rcp } }) }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#2980B9] border border-[#2980B9] bg-[#EBF5FB] hover:bg-[#2980B9] hover:text-white transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleResendWA(rcp.rcpNo) }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#27AE60] border border-[#27AE60] bg-[#EAFAF1] hover:bg-[#27AE60] hover:text-white transition-colors"
                        title="Kirim WA"
                      >
                        <MessageCircle size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {filtered.length === 0 ? 'Tidak ada data receipt ditemukan' : `Menampilkan ${start}–${end} dari ${filtered.length} data`}
          </span>
          <div className="flex items-center gap-1.5">
            <PBtn onClick={() => setPage(p => Math.max(1, p - 1))}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </PBtn>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <PBtn key={n} active={n === page} onClick={() => setPage(n)}>{n}</PBtn>
            ))}
            <PBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </PBtn>
          </div>
        </div>
      </div>

      {/* Modal Buat Receipt */}
      {showCreateForm && createPrefill && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5" onClick={() => setShowCreateForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-border">
              <h3 className="text-base font-bold text-text-primary">Buat Receipt Pembayaran</h3>
              <button onClick={() => setShowCreateForm(false)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted hover:bg-bg-page">
                <X size={16} />
              </button>
            </div>
            <div className="px-7 py-6 space-y-4">
              <div className="bg-[#EAFAF1] rounded-xl px-4 py-3.5 border-l-[3px] border-[#27AE60]">
                <div className="text-xs font-bold text-[#27AE60] mb-1 uppercase tracking-wide">Data Pembayaran</div>
                <div className="text-sm font-semibold text-text-primary">{createPrefill.client}</div>
                <div className="text-xs text-text-muted">{createPrefill.invNo} · {createPrefill.paket}</div>
                <div className="text-sm font-bold text-text-primary mt-1">{formatRp(createPrefill.total || 0)}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Tanggal Pembayaran</label>
                <input type="date" value={createForm.tglBayar} onChange={e => setCreateForm(f => ({ ...f, tglBayar: e.target.value }))}
                  className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">Metode Pembayaran</label>
                <select value={createForm.metode} onChange={e => setCreateForm(f => ({ ...f, metode: e.target.value }))}
                  className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-sm bg-white outline-none focus:border-primary">
                  <option>Transfer Bank (BCA)</option>
                  <option>Transfer Bank (Mandiri)</option>
                  <option>Cash</option>
                  <option>QRIS</option>
                </select>
              </div>
            </div>
            <div className="px-7 pb-6 flex justify-end gap-2.5 border-t border-border pt-4">
              <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-sm font-semibold text-text-muted border border-border rounded-lg hover:bg-bg-page">Batal</button>
              <button onClick={handleCreateReceipt} className="px-4 py-2 text-sm font-semibold text-white bg-[#27AE60] hover:bg-[#1E8449] rounded-lg flex items-center gap-1.5">
                <CheckCircle size={14} /> Simpan Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
