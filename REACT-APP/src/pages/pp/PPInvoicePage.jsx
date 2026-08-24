import { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Eye, ArrowLeft, ScrollText } from 'lucide-react'
import { INVOICES_INIT, STATUS_LABEL, formatRp } from '../../data/ppInvoiceData'

/* ─── Status badge ─── */
const INV_STYLE = {
  paid:    { cls: 'bg-[#EAFAF1] text-[#27AE60]', dot: '#27AE60' },
  pending: { cls: 'bg-[#FEF9E7] text-[#F39C12]', dot: '#F39C12' },
  overdue: { cls: 'bg-[#FDEDEC] text-[#E74C3C]', dot: '#E74C3C' },
  draft:   { cls: 'bg-[#F2F3F4] text-[#7F8C8D]', dot: '#7F8C8D' },
}

function InvBadge({ status }) {
  const s = INV_STYLE[status] || INV_STYLE.draft
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
      {STATUS_LABEL[status] || status}
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
  const bCls = { orange: 'border-accent', green: 'border-success', red: 'border-danger', yellow: 'border-warning' }[accent] || 'border-border'
  const vCls = { orange: 'text-accent', green: 'text-success', red: 'text-danger', yellow: 'text-warning' }[accent] || 'text-text-primary'
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

export default function PPInvoicePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState(INVOICES_INIT)
  const [fStatus,  setFStatus]  = useState('')
  const [fBulan,   setFBulan]   = useState('')
  const [fTahun,   setFTahun]   = useState('')
  const [fSearch,  setFSearch]  = useState(location.state?.filterSearch ?? '')
  const [page,     setPage]     = useState(1)

  const BSHORT = { Januari:'Jan',Februari:'Feb',Maret:'Mar',April:'Apr',Mei:'Mei',Juni:'Jun',Juli:'Jul',Agustus:'Agu',September:'Sep',Oktober:'Okt',November:'Nov',Desember:'Des' }
  const filtered = useMemo(() => {
    const q = fSearch.trim().toLowerCase()
    return invoices.filter(inv => {
      if (fStatus && inv.status !== fStatus) return false
      if (fBulan  && !(inv.bulan ?? '').toLowerCase().includes((BSHORT[fBulan] ?? fBulan).toLowerCase())) return false
      if (fTahun  && !(inv.bulan ?? '').includes(fTahun)) return false
      if (q && !`${inv.invNo} ${inv.client}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [invoices, fStatus, fBulan, fTahun, fSearch])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS))
  const slice      = filtered.slice((page - 1) * ROWS, page * ROWS)

  const paidCount    = invoices.filter(i => i.status === 'paid').length
  const pendingCount = invoices.filter(i => i.status === 'pending').length
  const overdueCount = invoices.filter(i => i.status === 'overdue').length

  function reset() { setFStatus(''); setFBulan(''); setFTahun(''); setFSearch(''); setPage(1) }

  const start = (page - 1) * ROWS + 1
  const end   = Math.min(page * ROWS, filtered.length)

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
              <ScrollText size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">Invoice Private Training</h1>
              <p className="text-sm text-text-muted mt-0.5">Semua tagihan klien program private</p>
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatMini label="Total Invoice"  value={invoices.length} sub="Bulan ini" />
        <StatMini label="Belum Dibayar"  value={pendingCount}    sub="Perlu follow up"      accent="orange" />
        <StatMini label="Paid"           value={paidCount}       sub="✅ Terbayar"           accent="green" />
        <StatMini label="Overdue"        value={overdueCount}    sub="⚠️ Lewat Jatuh Tempo"  accent="red" />
      </div>

      <div className="bg-bg-surface border border-border rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
        <select className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors" value={fBulan} onChange={e => { setFBulan(e.target.value); setPage(1) }}>
          <option value="">Semua Bulan</option>
          {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map(b => <option key={b}>{b}</option>)}
        </select>
        <select className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors" value={fTahun} onChange={e => { setFTahun(e.target.value); setPage(1) }}>
          <option value="">Semua Tahun</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
        <select className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors" value={fStatus} onChange={e => { setFStatus(e.target.value); setPage(1) }}>
          <option value="">Semua Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Awaiting Payment</option>
          <option value="overdue">Overdue</option>
          <option value="draft">Draft</option>
        </select>
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-bg-page border-[1.5px] border-border rounded-lg px-3 py-[7px] focus-within:border-primary focus-within:bg-white transition-colors">
          <Search size={14} className="text-text-muted shrink-0" />
          <input className="border-none bg-transparent text-xs outline-none w-full text-text-primary placeholder:text-text-muted"
            placeholder="Cari nomor invoice atau nama klien..."
            value={fSearch} onChange={e => { setFSearch(e.target.value); setPage(1) }} />
        </div>
        <button onClick={reset} className="px-3.5 py-[7px] bg-primary hover:bg-primary-2 text-white text-xs font-semibold rounded-lg transition-colors shrink-0">Reset</button>
      </div>

      <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: '1100px' }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th style={{minWidth:'165px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">No. Invoice</th>
                <th style={{minWidth:'130px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                <th style={{minWidth:'160px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Nama Klien</th>
                <th style={{minWidth:'160px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Paket</th>
                <th style={{minWidth:'130px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">PIC Pelatih</th>
                <th style={{minWidth:'120px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                <th style={{minWidth:'130px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                <th style={{minWidth:'120px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th style={{minWidth:'100px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr><td colSpan={9} className="py-10 text-center text-sm text-text-muted">Tidak ada invoice yang sesuai filter</td></tr>
              ) : slice.map(inv => (
                <tr key={inv.invNo} onClick={() => navigate('/pp/invoice/' + inv.invNo, { state: { invoice: inv } })}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
                  <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{inv.invNo}</td>
                  <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">#{inv.orderId}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <AvatarSm initials={inv.initials} color={inv.color} />
                      <span className="text-xs font-medium text-gray-900">{inv.client}</span>
                    </div>
                  </td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5">{inv.paket}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5">{inv.pic}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{inv.tanggal}</td>
                  <td className="text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap">{formatRp(inv.total)}</td>
                  <td className="px-3 py-2.5"><InvBadge status={inv.status} /></td>
                  <td className="px-3 py-2.5">
                    <button onClick={e => { e.stopPropagation(); navigate('/pp/invoice/' + inv.invNo, { state: { invoice: inv } }) }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#2980B9] border border-[#2980B9] bg-[#EBF5FB] hover:bg-[#2980B9] hover:text-white transition-colors"
                      title="Lihat Invoice">
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {filtered.length === 0 ? 'Tidak ada invoice ditemukan' : `Menampilkan ${start}–${end} dari ${filtered.length} invoice`}
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
    </div>
  )
}
