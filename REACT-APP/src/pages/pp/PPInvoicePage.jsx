import { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Eye, Download, ArrowLeft, CheckCircle, Pencil, Trash2, Plus } from 'lucide-react'
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

/* ─── Receipt Modal ─── */
function ReceiptModal({ inv, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-start justify-center py-10 px-5 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-[560px] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <span className="text-sm font-bold text-text-primary">Receipt Pembayaran</span>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-text-primary hover:bg-bg-page">
              <Download size={12} /> Download PDF
            </button>
            <button onClick={onClose} className="w-8 h-8 border border-border rounded-lg flex items-center justify-center text-text-muted hover:bg-bg-page">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div>
          <div className="bg-primary px-7 py-6 flex items-center justify-between">
            <div>
              <div className="text-white font-extrabold text-sm tracking-wide">Essential Fitness Management</div>
              <div className="text-white/55 text-[11px] mt-1">CV. Bugar Nusantara Jaya · Jl. Terogong Raya No.18, Jakarta Selatan</div>
            </div>
            <span className="bg-[#27AE60] text-white text-[11px] font-bold px-3.5 py-1 rounded-full tracking-wide">✅ LUNAS</span>
          </div>
          <div className="px-7 py-6">
            <div className="flex justify-between items-start mb-5 pb-4 border-b border-border">
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Nomor Receipt</div>
                <div className="text-sm font-extrabold text-text-primary">{inv.invNo.replace('INV', 'RCP')}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Ref. Invoice</div>
                <div className="text-xs font-semibold text-text-primary">{inv.invNo}</div>
                <div className="text-[11px] text-text-muted">{inv.tanggal}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-3 mb-5 pb-4 border-b border-border">
              {[['Klien', inv.client], ['Order ID', '#' + inv.orderId], ['Tanggal Bayar', inv.paidDate || '—'],
                ['Metode', inv.payMethod || '—'], ['Program', inv.paket], ['PIC / Pelatih', inv.pic]].map(([l, v]) => (
                <div key={l}>
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">{l}</div>
                  <div className="text-[13px] font-semibold text-text-primary">{v}</div>
                </div>
              ))}
            </div>
            <div className="bg-bg-page rounded-xl p-5 text-center mb-5 border-[1.5px] border-border">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">Barcode Absensi Pelatih</div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-20 h-20 mx-auto text-primary">
                <rect x="2" y="2" width="9" height="9" rx="1"/><rect x="3.5" y="3.5" width="6" height="6" rx=".5" fill="currentColor" opacity=".15"/>
                <rect x="13" y="2" width="9" height="9" rx="1"/><rect x="14.5" y="3.5" width="6" height="6" rx=".5" fill="currentColor" opacity=".15"/>
                <rect x="2" y="13" width="9" height="9" rx="1"/><rect x="3.5" y="14.5" width="6" height="6" rx=".5" fill="currentColor" opacity=".15"/>
                <rect x="13" y="13" width="3" height="3"/><rect x="17" y="13" width="2" height="2"/><rect x="20" y="13" width="2" height="2"/>
                <rect x="13" y="17" width="2" height="2"/><rect x="16" y="16" width="3" height="3"/><rect x="20" y="17" width="2" height="4"/>
                <rect x="13" y="20" width="6" height="2"/>
              </svg>
              <div className="text-[11px] font-bold text-text-primary uppercase tracking-wider mt-2.5">Scan untuk validasi sesi</div>
              <div className="text-[11px] text-text-muted mt-1">Order: #{inv.orderId} · {inv.sesi} Sesi</div>
            </div>
            <div className="border border-border rounded-xl overflow-hidden mb-4">
              <table className="w-full text-xs" style={{ tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="bg-bg-page">
                    <th className="px-3.5 py-2.5 text-left text-[10px] font-bold text-text-muted uppercase tracking-wider">Deskripsi</th>
                    <th className="px-3.5 py-2.5 text-right text-[10px] font-bold text-text-muted uppercase tracking-wider">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-3.5 py-3">{inv.paket} Package<br/><span className="text-[11px] text-text-muted">{inv.namaLatihan} · PIC: {inv.pic}</span></td>
                    <td className="px-3.5 py-3 text-right font-semibold">{formatRp(inv.hargaPaket)}</td>
                  </tr>
                  {inv.biayaLain > 0 && (
                    <tr className="border-t border-border">
                      <td className="px-3.5 py-3">{inv.biayaLainKet || 'Biaya Lain'}</td>
                      <td className="px-3.5 py-3 text-right font-semibold">{formatRp(inv.biayaLain)}</td>
                    </tr>
                  )}
                  {inv.diskon > 0 && (
                    <tr className="border-t border-border">
                      <td className="px-3.5 py-3 text-[#27AE60]">Diskon {inv.promoKode && <span className="text-[10px] bg-[#EAFAF1] px-1.5 py-0.5 rounded-full font-bold">{inv.promoKode}</span>}</td>
                      <td className="px-3.5 py-3 text-right text-[#27AE60] font-semibold">- {formatRp(inv.diskon)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center px-3.5 py-3 bg-[#EAFAF1] rounded-xl font-bold text-text-primary">
              <span>Total Dibayar</span>
              <span className="text-[#27AE60] text-base">{formatRp(inv.total)}</span>
            </div>
            <div className="text-[11px] text-text-muted text-center mt-4 pt-4 border-t border-dashed border-border leading-relaxed">
              Terima kasih atas kepercayaan Anda kepada Essential Fitness Management.<br/>
              Receipt ini adalah bukti pembayaran sah. Simpan sebagai referensi Anda.<br/>
              <strong>Barcode di atas digunakan oleh pelatih untuk validasi sesi latihan.</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Mark Paid Modal ─── */
function MarkPaidModal({ inv, onConfirm, onClose }) {
  const [paidDate,  setPaidDate]  = useState('')
  const [payMethod, setPayMethod] = useState('Transfer Bank (BCA)')

  function handleConfirm() {
    if (!paidDate) { alert('Pilih tanggal pembayaran.'); return }
    onConfirm({ paidDate, payMethod })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-border">
          <h3 className="text-base font-bold text-text-primary">Konfirmasi Pembayaran</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted hover:bg-bg-page">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="px-7 py-6 space-y-4">
          <div className="bg-[#EAFAF1] rounded-xl px-4 py-3.5 border-l-[3px] border-[#27AE60]">
            <div className="text-xs font-bold text-[#27AE60] mb-1 uppercase tracking-wide">Konfirmasi Pembayaran</div>
            <div className="text-sm text-text-primary">{inv.invNo} — {inv.client}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">Tanggal Pembayaran</label>
            <input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)}
              className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">Metode Pembayaran</label>
            <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
              className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-white outline-none focus:border-primary">
              <option>Transfer Bank (BCA)</option>
              <option>Transfer Bank (Mandiri)</option>
              <option>Cash</option>
              <option>QRIS</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">Upload Bukti Transfer <span className="text-accent">*</span></label>
            <div className="border-2 border-dashed border-border rounded-xl p-5 text-center cursor-pointer hover:border-primary hover:bg-bg-page transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 mx-auto text-text-muted mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div className="text-sm font-semibold text-text-primary mb-0.5">Klik untuk upload bukti</div>
              <div className="text-[11px] text-text-muted">JPG, PNG, atau PDF (Maks. 5MB)</div>
            </div>
          </div>
        </div>
        <div className="px-7 pb-6 flex justify-end gap-2.5 border-t border-border pt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-muted border border-border rounded-lg hover:bg-bg-page">Batal</button>
          <button onClick={handleConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-[#27AE60] hover:bg-[#1E8449] rounded-lg flex items-center gap-1.5">
            <CheckCircle size={14} /> Konfirmasi Paid
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
const ROWS = 10

const validKodeDiskon = {
  HEMAT10:   { label: 'Voucher Hemat 10%',    tipe: 'persen',  nilai: 10    },
  HARBOLNAS: { label: 'Hari Belanja Nasional', tipe: 'persen',  nilai: 15    },
  FLAT50K:   { label: 'Flat Diskon Spesial',  tipe: 'nominal', nilai: 50000 },
}

export default function PPInvoicePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [invoices,        setInvoices]        = useState(INVOICES_INIT)
  const [selectedNo,      setSelectedNo]      = useState(null)
  const [fStatus,         setFStatus]         = useState('')
  const [fBulan,          setFBulan]          = useState('')
  const [fTahun,          setFTahun]          = useState('')
  const [fSearch,         setFSearch]         = useState(location.state?.filterSearch ?? '')
  const [page,            setPage]            = useState(1)
  const [modal,           setModal]           = useState(null)
  const [editMode,        setEditMode]        = useState(false)
  const [editData,        setEditData]        = useState({ tanggalInvoice: '', jatuhTempo: '', catatan: '' })
  const [pajakAktif,      setPajakAktif]      = useState(false)
  const [persenPajak,     setPersenPajak]     = useState(11)
  const [kodeDiskonInput, setKodeDiskonInput] = useState('')
  const [diskonApplied,   setDiskonApplied]   = useState(null)
  const [diskonError,     setDiskonError]     = useState(false)
  const [syaratList,      setSyaratList]      = useState([
    'Pembayaran dilakukan sesuai dengan jadwal yang telah disepakati.',
    'Sesi yang tidak dihadiri tanpa konfirmasi H-1 tidak dapat dijadwal ulang.',
    'Pembatalan program setelah sesi ke-3 tidak dapat direfund.',
    'Essential Fitness Management berhak mengganti trainer jika diperlukan.',
  ])

  const selected = invoices.find(i => i.invNo === selectedNo) || null

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

  function handleMarkPaid({ paidDate, payMethod }) {
    setInvoices(prev => prev.map(i => i.invNo === selectedNo ? { ...i, status: 'paid', paidDate, payMethod } : i))
    setModal(null)
  }

  /* ── Detail View ── */
  if (selected) {
    const subtotalBase  = (selected.hargaPaket || 0) - (selected.diskonPaket || 0) + (selected.biayaLain || 0)
    const diskonNominal = diskonApplied
      ? diskonApplied.tipe === 'persen' ? Math.round(subtotalBase * diskonApplied.nilai / 100) : diskonApplied.nilai
      : 0
    const pajakNominal  = pajakAktif ? Math.round((subtotalBase - diskonNominal) * persenPajak / 100) : 0
    const totalTagihan  = subtotalBase - diskonNominal + pajakNominal
    const minJatuhTempo = editData.tanggalInvoice
      ? new Date(new Date(editData.tanggalInvoice).getTime() + 2 * 86400000).toISOString().split('T')[0]
      : ''
    const jatuhTempoError  = !!(editData.jatuhTempo && minJatuhTempo && editData.jatuhTempo < minJatuhTempo)
    const statusBadgeCls   = { paid: 'bg-green-500', pending: 'bg-yellow-500', overdue: 'bg-red-500', draft: 'bg-gray-400' }[selected.status] || 'bg-gray-400'

    return (
      <div className="flex flex-col gap-4">

        {/* Toolbar */}
        <button
          onClick={() => { setSelectedNo(null); setEditMode(false); setDiskonApplied(null); setDiskonError(false) }}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors font-medium w-fit">
          <ArrowLeft size={16} /> Kembali ke Invoice
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Invoice #{selected.invNo}</h1>
            <p className="text-sm text-text-muted mt-1">Private Training — {selected.client}</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {editMode ? (
              <>
                <button
                  onClick={() => { setEditMode(false); setEditData({ tanggalInvoice: '', jatuhTempo: '', catatan: '' }) }}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
                  Batal
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1E1C43] text-white text-sm font-medium rounded-lg hover:bg-[#2d2b5e] transition">
                  Simpan
                </button>
              </>
            ) : (
              <button
                onClick={() => { setEditData({ tanggalInvoice: '', jatuhTempo: '', catatan: selected.catatan || '' }); setEditMode(true) }}
                className="flex items-center gap-2 border border-[#1E1C43] text-[#1E1C43] rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#1E1C43] hover:text-white transition">
                <Pencil size={14} /> Edit Invoice
              </button>
            )}
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2.5 border-[1.5px] border-primary text-primary text-sm font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors">
              <Download size={14} /> Download PDF
            </button>
            {selected.status === 'paid' && (
              <button
                onClick={() => navigate('/pp/receipt', { state: { filterSearch: selected.invNo } })}
                className="flex items-center gap-1.5 px-4 py-2.5 border-[1.5px] border-primary text-primary text-sm font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                Lihat Receipt
              </button>
            )}
            {(selected.status === 'pending' || selected.status === 'overdue') && (
              <button
                onClick={() => setModal('markPaid')}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#27AE60] hover:bg-[#1E8449] text-white text-sm font-semibold rounded-lg transition-colors">
                <CheckCircle size={14} /> Konfirmasi Pembayaran
              </button>
            )}
          </div>
        </div>

        {/* ── Template Invoice ── */}
        <div className="bg-white rounded-2xl shadow-lg max-w-4xl mx-auto w-full overflow-hidden">

          {/* BAGIAN 1: Header Navy */}
          <div className="bg-[#1E1C43] rounded-t-2xl p-8 flex justify-between items-start">
            {/* Kiri: info perusahaan */}
            <div className="flex items-center gap-3">
              <img src="/logo.png" className="w-16 h-16 rounded-full object-cover shrink-0" alt="EFM Logo" />
              <div>
                <div className="text-white font-bold text-sm leading-snug">Essential Fitness Management</div>
                <div className="text-white/60 text-[10.5px] mt-1 leading-relaxed">
                  CV. Bugar Nusantara Jaya<br/>
                  Jl. Terogong Raya No.18, Jakarta Selatan<br/>
                  essentialfitnessmanagement@gmail.com
                </div>
              </div>
            </div>

            {/* Kanan: judul + nomor + tanggal + status */}
            <div className="text-right">
              <div className="text-4xl font-black text-white tracking-widest uppercase">INVOICE</div>
              <div className="text-sm text-gray-300 mt-1">No: {selected.invNo}</div>
              <div className="border-t border-white/20 my-2" />

              {/* Tanggal Invoice */}
              <div className="flex justify-end items-center gap-2 mb-1">
                <span className="text-xs text-gray-400">Tanggal:</span>
                {editMode ? (
                  <input type="date" value={editData.tanggalInvoice}
                    onChange={e => setEditData(d => ({ ...d, tanggalInvoice: e.target.value }))}
                    className="bg-white/10 border border-white/30 rounded px-2 py-1 text-white text-sm focus:outline-none" />
                ) : (
                  <span className="text-white font-semibold text-sm">{selected.tanggal}</span>
                )}
              </div>

              {/* Jatuh Tempo */}
              <div className="flex justify-end items-start gap-2 mb-1">
                <span className="text-xs text-gray-400 mt-1">Jatuh Tempo:</span>
                <div>
                  {editMode ? (
                    <>
                      <input type="date" value={editData.jatuhTempo}
                        min={minJatuhTempo}
                        onChange={e => setEditData(d => ({ ...d, jatuhTempo: e.target.value }))}
                        className="bg-white/10 border border-white/30 rounded px-2 py-1 text-white text-sm focus:outline-none" />
                      {jatuhTempoError && <p className="text-red-300 text-xs mt-1">Minimal H+2 dari tanggal invoice</p>}
                    </>
                  ) : (
                    <span className="text-white font-semibold text-sm">{selected.due}</span>
                  )}
                </div>
              </div>

              {/* Order ID */}
              <div className="flex justify-end items-center gap-2">
                <span className="text-xs text-gray-400">Order ID:</span>
                <button
                  onClick={() => navigate('/pp/orders/' + selected.orderId)}
                  className="text-white font-semibold text-sm hover:underline">
                  #{selected.orderId}
                </button>
              </div>

              <div className="border-t border-white/20 my-2" />

              {/* Badge status */}
              <span className={`px-4 py-1 rounded-full text-white text-sm font-semibold inline-block mt-1 ${statusBadgeCls}`}>
                {STATUS_LABEL[selected.status]}
              </span>
            </div>
          </div>

          {/* BAGIAN 2: Tagihan Kepada */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2.5">Tagihan Kepada</div>
            <div className="text-[18px] font-bold text-text-primary mb-1.5">{selected.client}</div>
            <div className="text-[12px] text-text-muted leading-[1.8]">
              Order ID: #{selected.orderId}<br/>
              Private Training Program
            </div>
          </div>

          {/* BAGIAN 3: Tabel Rincian Layanan */}
          <div className="px-8 pt-6 pb-2">
            <table className="w-full text-xs" style={{ tableLayout: 'fixed', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="bg-[#f8fafc]">
                  {['Deskripsi','Harga Persesi','Jumlah Sesi','Harga Paket','Diskon Paket','Total'].map((h, i) => (
                    <th key={h}
                      className="px-2.5 py-3 text-[10px] font-semibold text-text-primary uppercase tracking-wide border-b border-border"
                      style={{ textAlign: i === 0 ? 'left' : i === 2 ? 'center' : 'right' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2.5 py-3 border-b border-border">
                    <div className="font-semibold text-text-primary">{selected.paket} Package</div>
                    <div className="text-[11px] text-text-muted">{selected.namaLatihan} · PIC: {selected.pic}</div>
                  </td>
                  <td className="px-2.5 py-3 border-b border-border text-right">{formatRp(selected.hargaPersesi)}</td>
                  <td className="px-2.5 py-3 border-b border-border text-center">{selected.sesi}</td>
                  <td className="px-2.5 py-3 border-b border-border text-right">{formatRp(selected.hargaPaket)}</td>
                  <td className="px-2.5 py-3 border-b border-border text-right text-[#27AE60]">
                    {selected.diskonPaket ? `- ${formatRp(selected.diskonPaket)}` : '—'}
                  </td>
                  <td className="px-2.5 py-3 border-b border-border text-right font-semibold">
                    {formatRp(selected.hargaPaket - (selected.diskonPaket || 0))}
                  </td>
                </tr>
                {selected.biayaLain > 0 && (
                  <tr>
                    <td className="px-2.5 py-3 border-b border-border">
                      <div className="font-semibold text-text-primary">Biaya Lain</div>
                      <div className="text-[11px] text-text-muted">{selected.biayaLainKet}</div>
                    </td>
                    <td className="px-2.5 py-3 border-b border-border text-right">—</td>
                    <td className="px-2.5 py-3 border-b border-border text-center">—</td>
                    <td className="px-2.5 py-3 border-b border-border text-right">—</td>
                    <td className="px-2.5 py-3 border-b border-border text-right">—</td>
                    <td className="px-2.5 py-3 border-b border-border text-right font-semibold">{formatRp(selected.biayaLain)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* BAGIAN 4: Kalkulasi */}
          <div className="px-8 py-6 border-t border-gray-100">
            {/* Subtotal */}
            <div className="flex justify-between items-center py-1.5 text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-800">{formatRp(subtotalBase)}</span>
            </div>

            {/* Edit mode — kode diskon + PPN toggle */}
            {editMode && (
              <div className="my-3 bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Kode Diskon</p>
                {diskonApplied ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="text-xs font-semibold text-green-700">{diskonApplied.label}</span>
                    <button onClick={() => { setDiskonApplied(null); setDiskonError(false) }}
                      className="text-gray-400 hover:text-red-500 transition ml-3">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" value={kodeDiskonInput}
                      onChange={e => { setKodeDiskonInput(e.target.value.toUpperCase()); setDiskonError(false) }}
                      placeholder="Masukkan kode diskon..."
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43] bg-white" />
                    <button
                      onClick={() => {
                        const v = validKodeDiskon[kodeDiskonInput]
                        if (v) { setDiskonApplied(v); setKodeDiskonInput(''); setDiskonError(false) }
                        else setDiskonError(true)
                      }}
                      className="px-4 py-2 bg-[#1E1C43] text-white text-sm font-semibold rounded-lg hover:bg-[#2d2b5e] transition">
                      Terapkan
                    </button>
                  </div>
                )}
                {diskonError && <p className="text-[11px] text-red-500">Kode diskon tidak ditemukan</p>}

                <div className="pt-2 border-t border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Aktifkan PPN</span>
                    <button onClick={() => setPajakAktif(v => !v)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors ${pajakAktif ? 'bg-[#1E1C43]' : 'bg-gray-300'}`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${pajakAktif ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  {pajakAktif && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Persentase:</span>
                      <input type="number" value={persenPajak} min={0} max={100}
                        onChange={e => setPersenPajak(Number(e.target.value))}
                        className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#1E1C43] bg-white" />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Diskon row — tampil di semua mode jika ada */}
            {diskonApplied && (
              <div className="flex justify-between items-center py-1.5 text-sm">
                <span className="text-green-600">Diskon: {diskonApplied.label}</span>
                <span className="text-green-600 font-medium">- {formatRp(diskonNominal)}</span>
              </div>
            )}

            {/* PPN row — tampil di semua mode jika aktif */}
            {pajakAktif && (
              <div className="flex justify-between items-center py-1.5 text-sm">
                <span className="text-gray-600">PPN {persenPajak}%</span>
                <span className="font-medium text-gray-800">+ {formatRp(pajakNominal)}</span>
              </div>
            )}

            {/* Total */}
            <div className="mt-4 bg-[#1E1C43] rounded-xl px-6 py-4 flex justify-between items-center">
              <span className="text-white font-bold text-lg">Total Tagihan</span>
              <span className="text-white font-bold text-lg">{formatRp(totalTagihan)}</span>
            </div>
          </div>

          {/* BAGIAN 5: Catatan Invoice */}
          <div className="px-8 py-4 border-t border-gray-100">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Catatan</div>
            {editMode ? (
              <textarea rows={3} value={editData.catatan}
                onChange={e => setEditData(d => ({ ...d, catatan: e.target.value }))}
                placeholder="Tambahkan catatan untuk klien..."
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
            ) : editData.catatan || selected.catatan ? (
              <p className="text-sm text-gray-600">{editData.catatan || selected.catatan}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Tidak ada catatan</p>
            )}
          </div>

          {/* BAGIAN 6: Syarat & Ketentuan */}
          <div className="px-8 py-6 border-t border-gray-100">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Syarat &amp; Ketentuan</div>
            {editMode ? (
              <div className="space-y-2">
                {syaratList.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input type="text" value={item}
                      onChange={e => setSyaratList(prev => prev.map((s, i) => i === idx ? e.target.value : s))}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]" />
                    <button onClick={() => setSyaratList(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-600 p-1 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button onClick={() => setSyaratList(prev => [...prev, ''])}
                  className="flex items-center gap-1.5 text-sm text-[#E05945] hover:text-[#c44a38] mt-3 font-medium">
                  <Plus size={14} /> Tambah Baris
                </button>
              </div>
            ) : (
              <ol className="list-decimal list-inside space-y-2">
                {syaratList.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600">{item}</li>
                ))}
              </ol>
            )}
          </div>

          {/* BAGIAN 7: Footer */}
          <div className="px-8 py-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">Dokumen ini digenerate oleh sistem EFM V2</p>
          </div>
        </div>

        {modal === 'markPaid' && (
          <MarkPaidModal inv={selected} onConfirm={handleMarkPaid} onClose={() => setModal(null)} />
        )}

      </div>
    )
  }

  /* ── List View ── */
  const start = (page - 1) * ROWS + 1
  const end   = Math.min(page * ROWS, filtered.length)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[22px] font-bold text-text-primary">Invoice Private Training</h1>
        <p className="text-sm text-text-muted mt-1">Semua tagihan klien program private</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
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
                <th style={{minWidth:'160px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">No. Invoice</th>
                <th style={{minWidth:'130px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                <th style={{minWidth:'140px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Nama Klien</th>
                <th style={{minWidth:'160px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Paket</th>
                <th style={{minWidth:'130px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">PIC Pelatih</th>
                <th style={{minWidth:'110px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                <th style={{minWidth:'130px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                <th style={{minWidth:'120px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th style={{minWidth:'100px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr><td colSpan={9} className="py-10 text-center text-sm text-text-muted">Tidak ada invoice yang sesuai filter</td></tr>
              ) : slice.map(inv => (
                <tr key={inv.invNo} onClick={() => setSelectedNo(inv.invNo)}
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
                    <button onClick={e => { e.stopPropagation(); setSelectedNo(inv.invNo) }}
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
