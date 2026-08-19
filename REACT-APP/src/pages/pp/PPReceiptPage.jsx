import { useState, useMemo } from 'react'
import { Search, Eye, Download, ArrowLeft, MessageCircle } from 'lucide-react'
import { RECEIPTS_INIT, WA_LABEL, formatRp, sesiCount } from '../../data/ppReceiptData'

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

/* ─── QR placeholder SVG ─── */
function QRPlaceholder({ label }) {
  return (
    <div className="bg-bg-page rounded-xl px-5 pt-5 pb-4 text-center border-[1.5px] border-border mb-5">
      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">Barcode Absensi Pelatih</div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-[120px] h-[120px] mx-auto text-primary">
        <rect x="2" y="2" width="9" height="9" rx="1"/><rect x="3.5" y="3.5" width="6" height="6" rx=".5" fill="currentColor" opacity=".15"/>
        <rect x="13" y="2" width="9" height="9" rx="1"/><rect x="14.5" y="3.5" width="6" height="6" rx=".5" fill="currentColor" opacity=".15"/>
        <rect x="2" y="13" width="9" height="9" rx="1"/><rect x="3.5" y="14.5" width="6" height="6" rx=".5" fill="currentColor" opacity=".15"/>
        <rect x="13" y="13" width="3" height="3"/><rect x="17" y="13" width="2" height="2"/><rect x="20" y="13" width="2" height="2"/>
        <rect x="13" y="17" width="2" height="2"/><rect x="16" y="16" width="3" height="3"/><rect x="20" y="17" width="2" height="4"/>
        <rect x="13" y="20" width="6" height="2"/>
      </svg>
      <div className="text-[11px] font-bold text-text-primary uppercase tracking-wider mt-3">{label}</div>
      <div className="text-[11px] text-text-muted mt-1">Scan untuk verifikasi pembayaran</div>
    </div>
  )
}

/* ─── Receipt Card ─── */
function ReceiptCard({ rcp }) {
  const sesi = sesiCount(rcp.paket)
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden max-w-[560px] w-full">
      {/* Navy header */}
      <div className="bg-primary px-7 py-6 flex items-center justify-between">
        <div>
          <div className="text-white font-extrabold text-sm tracking-wide">Essential Fitness Management</div>
          <div className="text-white/55 text-[11px] mt-1">Order ID: #{rcp.orderId}</div>
        </div>
        <span className="bg-[#27AE60] text-white text-[11px] font-bold px-3.5 py-1 rounded-full tracking-wide">LUNAS</span>
      </div>

      {/* Body */}
      <div className="px-7 py-6">
        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-3 mb-5 pb-5 border-b border-border">
          {[
            ['No. Receipt',     rcp.rcpNo],
            ['Ref. Invoice',    rcp.invNo],
            ['Nama Klien',      rcp.client],
            ['Tgl Pembayaran',  rcp.tglBayar],
            ['Metode Bayar',    rcp.metode],
            ['PIC Pelatih',     rcp.pic],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">{l}</div>
              <div className="text-[13px] font-semibold text-text-primary break-all">{v}</div>
            </div>
          ))}
        </div>

        {/* QR */}
        <QRPlaceholder label={rcp.rcpNo} />

        {/* Items */}
        <div className="border border-border rounded-xl overflow-hidden mb-4">
          <table className="w-full text-xs" style={{ tableLayout: 'fixed', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-bg-page">
                <th className="px-3.5 py-2.5 text-left text-[10px] font-bold text-text-muted uppercase tracking-wider" style={{ width: '55%' }}>Program / Layanan</th>
                <th className="px-3.5 py-2.5 text-right text-[10px] font-bold text-text-muted uppercase tracking-wider" style={{ width: '20%' }}>Sesi</th>
                <th className="px-3.5 py-2.5 text-right text-[10px] font-bold text-text-muted uppercase tracking-wider" style={{ width: '25%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3.5 py-3">
                  <strong>{rcp.paket}</strong>
                  <br/><span className="text-text-muted text-[10px]">Sesi Personal Training EFM</span>
                </td>
                <td className="px-3.5 py-3 text-right">{sesi}</td>
                <td className="px-3.5 py-3 text-right font-semibold">{formatRp(rcp.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center px-3.5 py-3 bg-[#EAFAF1] rounded-xl font-bold text-text-primary">
          <span>Total Pembayaran</span>
          <span className="text-[#27AE60] text-base">{formatRp(rcp.total)}</span>
        </div>

        {/* Footer */}
        <div className="text-[11px] text-text-muted text-center mt-4 pt-4 border-t border-dashed border-border leading-[1.7]">
          Terima kasih telah mempercayakan program fitness Anda kepada kami.<br/>
          Simpan receipt ini sebagai bukti pembayaran yang sah.<br/>
          <strong>Essential Fitness Management</strong> — Profesional &amp; Terpercaya
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
const ROWS = 10

export default function PPReceiptPage() {
  const [receipts,    setReceipts]   = useState(RECEIPTS_INIT)
  const [selectedNo,  setSelectedNo] = useState(null)
  const [fBulan,      setFBulan]     = useState('')
  const [fTahun,      setFTahun]     = useState('')
  const [fWA,         setFWA]        = useState('')
  const [fSearch,     setFSearch]    = useState('')
  const [page,        setPage]       = useState(1)

  const selected = receipts.find(r => r.rcpNo === selectedNo) || null

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

  /* ── Detail View ── */
  if (selected) {
    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => setSelectedNo(null)}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors font-medium w-fit">
          <ArrowLeft size={16} /> Kembali ke Daftar Receipt
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary">{selected.rcpNo}</h1>
            <p className="text-sm text-text-muted mt-1">Receipt pembayaran · {selected.client}</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleResendWA(selected.rcpNo)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <MessageCircle size={14} /> Resend WA
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors">
              <Download size={14} /> Download PDF
            </button>
          </div>
        </div>

        <ReceiptCard rcp={selected} />
      </div>
    )
  }

  /* ── List View ── */
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[22px] font-bold text-text-primary">Receipt &amp; Barcode</h1>
        <p className="text-sm text-text-muted mt-1">Kelola receipt pembayaran dan status pengiriman WhatsApp</p>
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
                <th style={{minWidth:'160px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">No. Invoice</th>
                <th style={{minWidth:'130px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                <th style={{minWidth:'140px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Nama Klien</th>
                <th style={{minWidth:'140px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Program</th>
                <th style={{minWidth:'120px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">PIC</th>
                <th style={{minWidth:'110px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tgl Bayar</th>
                <th style={{minWidth:'130px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                <th style={{minWidth:'110px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status WA</th>
                <th style={{minWidth:'100px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr><td colSpan={10} className="py-10 text-center text-sm text-text-muted">Tidak ada data receipt ditemukan</td></tr>
              ) : slice.map(rcp => (
                <tr key={rcp.rcpNo} onClick={() => setSelectedNo(rcp.rcpNo)}
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
                        onClick={e => { e.stopPropagation(); setSelectedNo(rcp.rcpNo) }}
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
    </div>
  )
}
