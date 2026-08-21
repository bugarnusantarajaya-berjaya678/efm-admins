import { useState, useMemo } from 'react'
import { Search, Eye, Download, ArrowLeft, CheckCircle, Pencil, Trash2, Plus } from 'lucide-react'

/* ─── Helpers ─── */
function formatRp(n) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0)
}

/* ─── Status badge ─── */
const INV_STYLE = {
  'Lunas':            { cls: 'bg-[#EAFAF1] text-[#27AE60]',  dot: '#27AE60' },
  'Awaiting Payment': { cls: 'bg-[#FEF9E7] text-[#F39C12]',  dot: '#F39C12' },
  'Sebagian':         { cls: 'bg-[#FEF3E2] text-[#E67E22]',  dot: '#E67E22' },
  'Overdue':          { cls: 'bg-[#FDEDEC] text-[#E74C3C]',  dot: '#E74C3C' },
}

function InvBadge({ status }) {
  const s = INV_STYLE[status] || { cls: 'bg-gray-100 text-gray-500', dot: '#9CA3AF' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
      {status}
    </span>
  )
}

function StatMini({ label, value, sub, accent }) {
  const bCls = { green: 'border-green-200', orange: 'border-orange-200', yellow: 'border-yellow-200', red: 'border-red-200' }[accent] || 'border-gray-200'
  const vCls = { green: 'text-green-600', orange: 'text-orange-500', yellow: 'text-yellow-600', red: 'text-red-500' }[accent] || 'text-gray-800'
  return (
    <div className={`bg-white rounded-xl border-[1.5px] ${bCls} px-4 py-3`}>
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${vCls}`}>{value}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function PBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center border transition-colors
      ${active ? 'bg-[#1E1C43] text-white border-[#1E1C43]' : 'bg-white text-gray-400 border-gray-200 hover:border-[#1E1C43] hover:text-[#1E1C43]'}`}>
      {children}
    </button>
  )
}

/* ─── Dummy Data ─── */
const INVOICES_INIT = [
  {
    id: 'INV-B2B-26-0001',
    orderId: 'B2B-26-0001',
    perusahaan: 'PT. Suri Nusantara Jaya',
    npwp: '01.234.567.8-901.000',
    picNama: 'Bapak Andi Wijaya',
    picJabatan: 'HR Manager',
    program: 'Corporate Wellness Program',
    tanggal: '01 Jun 2026',
    jatuhTempo: '15 Jun 2026',
    status: 'Awaiting Payment',
    items: [
      { deskripsi: 'Sesi Personal Training Karyawan', jumlah: 20, satuan: 'Sesi',     hargaSatuan: 1250000, total: 25000000 },
      { deskripsi: 'Group Fitness Class',             jumlah: 8,  satuan: 'Sesi',     hargaSatuan: 1500000, total: 12000000 },
      { deskripsi: 'Health Consultation',             jumlah: 4,  satuan: 'Sesi',     hargaSatuan: 500000,  total: 2000000  },
    ],
    initials: 'SN', color: '#2980B9',
  },
  {
    id: 'INV-B2B-26-0002',
    orderId: 'B2B-26-0002',
    perusahaan: 'TELKOM Indonesia',
    npwp: '02.345.678.9-012.000',
    picNama: 'Ibu Sari Dewi',
    picJabatan: 'Wellness Coordinator',
    program: 'Employee Health Program',
    tanggal: '05 Jun 2026',
    jatuhTempo: '19 Jun 2026',
    status: 'Lunas',
    paidDate: '10 Jun 2026',
    payMethod: 'Transfer Bank (BCA)',
    items: [
      { deskripsi: 'Yoga & Mindfulness Session', jumlah: 12, satuan: 'Sesi',     hargaSatuan: 1200000, total: 14400000 },
      { deskripsi: 'Nutritional Workshop',       jumlah: 3,  satuan: 'Workshop', hargaSatuan: 2500000, total: 7500000  },
      { deskripsi: 'Fitness Assessment',         jumlah: 30, satuan: 'Orang',    hargaSatuan: 220000,  total: 6600000  },
    ],
    initials: 'TI', color: '#E05945',
  },
  {
    id: 'INV-B2B-26-0003',
    orderId: 'B2B-26-0003',
    perusahaan: 'AIA Insurance',
    npwp: '03.456.789.0-123.000',
    picNama: 'Bapak Rizal Hakim',
    picJabatan: 'HR Director',
    program: 'Annual Wellness Package',
    tanggal: '10 Jun 2026',
    jatuhTempo: '24 Jun 2026',
    status: 'Sebagian',
    items: [
      { deskripsi: 'Personal Trainer - Monthly', jumlah: 6, satuan: 'Bulan', hargaSatuan: 8000000, total: 48000000 },
      { deskripsi: 'Group Class - Monthly',      jumlah: 6, satuan: 'Bulan', hargaSatuan: 3500000, total: 21000000 },
      { deskripsi: 'Program Management Fee',     jumlah: 1, satuan: 'Paket', hargaSatuan: 3000000, total: 3000000  },
    ],
    initials: 'AI', color: '#8E44AD',
  },
]

/* ─── Receipt Modal ─── */
function ReceiptModal({ inv, onClose }) {
  const subtotal = inv.items.reduce((s, i) => s + i.total, 0)
  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-start justify-center py-10 px-5 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-[560px] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-800">Receipt Pembayaran B2B</span>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50">
              <Download size={12} /> Download PDF
            </button>
            <button onClick={onClose} className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div>
          <div className="bg-[#1E1C43] px-7 py-6 flex items-center justify-between">
            <div>
              <div className="text-white font-extrabold text-sm tracking-wide">Essential Fitness Management</div>
              <div className="text-white/55 text-[11px] mt-1">CV. Bugar Nusantara Jaya · Jl. Terogong Raya No.18, Jakarta Selatan</div>
            </div>
            <span className="bg-green-500 text-white text-[11px] font-bold px-3.5 py-1 rounded-full tracking-wide">✅ LUNAS</span>
          </div>
          <div className="px-7 py-6">
            <div className="flex justify-between items-start mb-5 pb-4 border-b border-gray-100">
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nomor Receipt</div>
                <div className="text-sm font-extrabold text-gray-800">{inv.id.replace('INV', 'RCP')}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ref. Invoice</div>
                <div className="text-xs font-semibold text-gray-800">{inv.id}</div>
                <div className="text-[11px] text-gray-500">{inv.tanggal}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-3 mb-5 pb-4 border-b border-gray-100">
              {[['Perusahaan', inv.perusahaan], ['Order ID', inv.orderId], ['Program', inv.program],
                ['PIC', inv.picNama], ['Tanggal Bayar', inv.paidDate || '—'], ['Metode', inv.payMethod || '—']].map(([l, v]) => (
                <div key={l}>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{l}</div>
                  <div className="text-[13px] font-semibold text-gray-800">{v}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center px-4 py-3.5 bg-green-50 border border-green-200 rounded-xl font-bold text-gray-800">
              <span>Total Dibayar</span>
              <span className="text-green-600 text-base">{formatRp(subtotal)}</span>
            </div>
            <div className="text-[11px] text-gray-400 text-center mt-4 pt-4 border-t border-dashed border-gray-100 leading-relaxed">
              Terima kasih atas kepercayaan {inv.perusahaan} kepada Essential Fitness Management.<br/>
              Receipt ini adalah bukti pembayaran sah B2B Corporate.
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
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800">Konfirmasi Pembayaran</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="px-7 py-6 space-y-4">
          <div className="bg-green-50 rounded-xl px-4 py-3.5 border-l-[3px] border-green-500">
            <div className="text-xs font-bold text-green-600 mb-1 uppercase tracking-wide">Konfirmasi Pelunasan B2B</div>
            <div className="text-sm text-gray-800">{inv.id} — {inv.perusahaan}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Pembayaran</label>
            <input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-[#1E1C43]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Metode Pembayaran</label>
            <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white outline-none focus:border-[#1E1C43]">
              <option>Transfer Bank (BCA)</option>
              <option>Transfer Bank (Mandiri)</option>
              <option>Transfer Bank (BNI)</option>
              <option>Cek / Giro</option>
              <option>Virtual Account</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Upload Bukti Transfer</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-[#1E1C43] hover:bg-gray-50 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 mx-auto text-gray-400 mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div className="text-sm font-semibold text-gray-700 mb-0.5">Klik untuk upload bukti</div>
              <div className="text-xs text-gray-400">JPG, PNG, atau PDF (Maks. 5MB)</div>
            </div>
          </div>
        </div>
        <div className="px-7 pb-6 flex justify-end gap-2.5 border-t border-gray-100 pt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
          <button onClick={handleConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#27AE60] hover:bg-[#1E8449] rounded-lg flex items-center gap-1.5">
            <CheckCircle size={14} /> Konfirmasi Lunas
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
const ROWS = 10

export default function B2BInvoicePage() {
  const [invoices,      setInvoices]      = useState(INVOICES_INIT)
  const [selectedId,    setSelectedId]    = useState(null)
  const [fStatus,       setFStatus]       = useState('')
  const [fSearch,       setFSearch]       = useState('')
  const [page,          setPage]          = useState(1)
  const [modal,         setModal]         = useState(null)
  const [editMode,      setEditMode]      = useState(false)
  const [editData,      setEditData]      = useState({ tanggalInvoice: '', jatuhTempo: '', catatan: '' })
  const [mgmtFeeAktif,  setMgmtFeeAktif]  = useState(false)
  const [persenMgmtFee, setPersenMgmtFee] = useState(10)
  const [pajakList,     setPajakList]     = useState([
    { id: 1, nama: 'PPN', persen: 11, aktif: false, tipe: 'tambah' },
  ])
  const [syaratList,    setSyaratList]    = useState([
    'Pembayaran dilakukan dalam 14 hari kalender sejak invoice diterbitkan.',
    'Keterlambatan pembayaran dikenakan denda 2% per bulan.',
    'Pembatalan program wajib dikonfirmasi 7 hari kerja sebelumnya.',
    'Essential Fitness Management berhak menghentikan layanan jika pembayaran terlambat lebih dari 30 hari.',
    'Invoice ini sah tanpa tanda tangan basah sesuai kesepakatan para pihak.',
  ])

  const selected = invoices.find(i => i.id === selectedId) || null

  const filtered = useMemo(() => {
    const q = fSearch.trim().toLowerCase()
    return invoices.filter(inv => {
      if (fStatus && inv.status !== fStatus) return false
      if (q && !`${inv.id} ${inv.perusahaan} ${inv.program} ${inv.orderId}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [invoices, fStatus, fSearch])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ROWS))
  const slice       = filtered.slice((page - 1) * ROWS, page * ROWS)

  const lunasCount   = invoices.filter(i => i.status === 'Lunas').length
  const waitingCount = invoices.filter(i => i.status === 'Awaiting Payment').length
  const sebagianCount = invoices.filter(i => i.status === 'Sebagian').length
  const overdueCount = invoices.filter(i => i.status === 'Overdue').length

  function reset() { setFStatus(''); setFSearch(''); setPage(1) }

  function handleMarkPaid({ paidDate, payMethod }) {
    setInvoices(prev => prev.map(i => i.id === selectedId ? { ...i, status: 'Lunas', paidDate, payMethod } : i))
    setModal(null)
  }

  /* ── Detail View ── */
  if (selected) {
    const subtotal         = selected.items.reduce((s, i) => s + i.total, 0)
    const nominalMgmt      = mgmtFeeAktif ? Math.round(subtotal * persenMgmtFee / 100) : 0
    const totalSetelahMgmt = subtotal + nominalMgmt
    const totalPajakNet    = pajakList.filter(p => p.aktif).reduce((s, p) => {
      const nominal = Math.round(totalSetelahMgmt * p.persen / 100)
      return p.tipe === 'tambah' ? s + nominal : s - nominal
    }, 0)
    const totalTagihan     = totalSetelahMgmt + totalPajakNet
    const minJatuhTempo    = editData.tanggalInvoice
      ? new Date(new Date(editData.tanggalInvoice).getTime() + 2 * 86400000).toISOString().split('T')[0]
      : ''
    const jatuhTempoError  = !!(editData.jatuhTempo && minJatuhTempo && editData.jatuhTempo < minJatuhTempo)
    const statusBadgeCls   = {
      'Lunas': 'bg-green-500', 'Awaiting Payment': 'bg-yellow-500',
      'Sebagian': 'bg-orange-500', 'Overdue': 'bg-red-500',
    }[selected.status] || 'bg-gray-400'

    return (
      <div className="flex flex-col gap-4">

        {/* Toolbar */}
        <button
          onClick={() => { setSelectedId(null); setEditMode(false); setMgmtFeeAktif(false); setPajakList([{ id: 1, nama: 'PPN', persen: 11, aktif: false, tipe: 'tambah' }]) }}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors font-medium w-fit">
          <ArrowLeft size={16} /> Kembali ke Invoice B2B
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Invoice #{selected.id}</h1>
            <p className="text-sm text-gray-500 mt-1">B2B Corporate — {selected.perusahaan}</p>
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
            <button className="flex items-center gap-1.5 px-4 py-2.5 border-[1.5px] border-[#1E1C43] text-[#1E1C43] text-sm font-semibold rounded-lg hover:bg-[#1E1C43] hover:text-white transition-colors">
              <Download size={14} /> Download PDF
            </button>
            {selected.status === 'Lunas' && (
              <button
                onClick={() => setModal('receipt')}
                className="flex items-center gap-1.5 px-4 py-2.5 border-[1.5px] border-[#1E1C43] text-[#1E1C43] text-sm font-semibold rounded-lg hover:bg-[#1E1C43] hover:text-white transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                Lihat Receipt
              </button>
            )}
            {(selected.status === 'Awaiting Payment' || selected.status === 'Sebagian') && (
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

            <div className="text-right">
              <div className="text-4xl font-black text-white tracking-widest uppercase">INVOICE</div>
              <div className="text-sm text-gray-300 mt-1">No: {selected.id}</div>
              <div className="border-t border-white/20 my-2" />

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
                    <span className="text-white font-semibold text-sm">{selected.jatuhTempo}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end items-center gap-2">
                <span className="text-xs text-gray-400">Order ID:</span>
                <span className="text-white font-semibold text-sm">{selected.orderId}</span>
              </div>

              <div className="border-t border-white/20 my-2" />
              <span className={`px-4 py-1 rounded-full text-white text-sm font-semibold inline-block mt-1 ${statusBadgeCls}`}>
                {selected.status}
              </span>
            </div>
          </div>

          {/* BAGIAN 2: Tagihan Kepada */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Tagihan Kepada</div>
            <div className="text-[20px] font-bold text-gray-800 mb-2">{selected.perusahaan}</div>
            <div className="text-[13px] text-gray-500 leading-[2]">
              NPWP: {selected.npwp}<br/>
              PIC: {selected.picNama} — {selected.picJabatan}<br/>
              Order ID: #{selected.orderId}<br/>
              Program: {selected.program}
            </div>
          </div>

          {/* BAGIAN 3: Tabel Rincian Layanan */}
          <div className="px-8 pt-6 pb-2">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Deskripsi</th>
                  <th className="text-center pb-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide w-16">Jumlah</th>
                  <th className="text-center pb-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide w-20">Satuan</th>
                  <th className="text-right pb-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide w-32">Harga Satuan</th>
                  <th className="text-right pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-4 pr-4 font-medium text-gray-800">{item.deskripsi}</td>
                    <td className="py-4 px-2 text-center text-gray-600">{item.jumlah}</td>
                    <td className="py-4 px-2 text-center text-gray-600">{item.satuan}</td>
                    <td className="py-4 px-2 text-right text-gray-600">{formatRp(item.hargaSatuan)}</td>
                    <td className="py-4 text-right font-semibold text-gray-800">{formatRp(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BAGIAN 4: Kalkulasi */}
          <div className="px-8 py-6 border-t border-gray-100">

            {/* Subtotal */}
            <div className="flex justify-between items-center py-1.5 text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-800">{formatRp(subtotal)}</span>
            </div>

            {/* Edit mode: Management Fee + Pajak controls */}
            {editMode && (
              <div className="my-3 bg-gray-50 rounded-xl p-4 space-y-4">
                {/* Management Fee */}
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Management Fee</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={() => setMgmtFeeAktif(v => !v)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors ${mgmtFeeAktif ? 'bg-[#1E1C43]' : 'bg-gray-300'}`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${mgmtFeeAktif ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                    <span className="text-sm text-gray-700">Management Fee</span>
                    {mgmtFeeAktif && (
                      <div className="flex items-center gap-1.5">
                        <input type="number" value={persenMgmtFee} min={0} max={100}
                          onChange={e => setPersenMgmtFee(Number(e.target.value))}
                          className="w-14 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#1E1C43] bg-white" />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    )}
                    {mgmtFeeAktif && (
                      <span className="ml-auto text-sm font-medium text-gray-700">+ {formatRp(nominalMgmt)}</span>
                    )}
                  </div>
                </div>

                {/* Pajak list */}
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Pajak / Potongan</p>
                  {pajakList.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-2 flex-wrap">
                      <input type="text" value={p.nama}
                        onChange={e => setPajakList(prev => prev.map((x, i) => i === idx ? { ...x, nama: e.target.value } : x))}
                        className="w-24 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#1E1C43] bg-white" />
                      <input type="number" value={p.persen} min={0} max={100}
                        onChange={e => setPajakList(prev => prev.map((x, i) => i === idx ? { ...x, persen: Number(e.target.value) } : x))}
                        className="w-14 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#1E1C43] bg-white" />
                      <span className="text-sm text-gray-500">%</span>
                      <button
                        onClick={() => setPajakList(prev => prev.map((x, i) => i === idx ? { ...x, tipe: x.tipe === 'tambah' ? 'potong' : 'tambah' } : x))}
                        className={`px-2 py-1 rounded text-xs font-bold ${p.tipe === 'tambah' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                        {p.tipe === 'tambah' ? '+' : '−'}
                      </button>
                      <button
                        onClick={() => setPajakList(prev => prev.map((x, i) => i === idx ? { ...x, aktif: !x.aktif } : x))}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors ${p.aktif ? 'bg-[#1E1C43]' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${p.aktif ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                      <button onClick={() => setPajakList(prev => prev.filter((_, i) => i !== idx))}
                        className="text-gray-300 hover:text-red-400 transition ml-auto">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setPajakList(prev => [...prev, { id: Date.now(), nama: 'Pajak Baru', persen: 0, aktif: true, tipe: 'tambah' }])}
                    className="flex items-center gap-1 text-sm text-[#E05945] hover:text-[#c44a38] mt-2 font-medium">
                    <Plus size={14} /> Tambah Pajak
                  </button>
                </div>
              </div>
            )}

            {/* Management Fee display row (both modes when aktif) */}
            {mgmtFeeAktif && (
              <>
                <div className="flex justify-between items-center py-1.5 text-sm">
                  <span className="text-gray-600">Management Fee {persenMgmtFee}%</span>
                  <span className="font-medium text-gray-800">+ {formatRp(nominalMgmt)}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm font-medium border-t border-gray-100">
                  <span className="text-gray-700">Total setelah Management Fee</span>
                  <span className="text-gray-800">{formatRp(totalSetelahMgmt)}</span>
                </div>
                <div className="border-t border-gray-100 my-1" />
              </>
            )}

            {/* Pajak rows (both modes when aktif) */}
            {pajakList.filter(p => p.aktif).map(p => {
              const nominal = Math.round(totalSetelahMgmt * p.persen / 100)
              return (
                <div key={p.id} className="flex justify-between items-center py-1.5 text-sm">
                  <span className={p.tipe === 'tambah' ? 'text-gray-600' : 'text-red-500'}>{p.nama} {p.persen}%</span>
                  <span className={`font-medium ${p.tipe === 'tambah' ? 'text-gray-800' : 'text-red-500'}`}>
                    {p.tipe === 'tambah' ? '+ ' : '− '}{formatRp(nominal)}
                  </span>
                </div>
              )
            })}

            {/* Total Tagihan */}
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
        {modal === 'receipt' && (
          <ReceiptModal inv={selected} onClose={() => setModal(null)} />
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
        <h1 className="text-2xl font-bold text-gray-800">Invoice B2B Corporate</h1>
        <p className="text-sm text-gray-500 mt-1">Semua tagihan klien korporat EFM</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatMini label="Lunas"            value={lunasCount}    sub="Pembayaran diterima"   accent="green" />
        <StatMini label="Awaiting Payment" value={waitingCount}  sub="Menunggu pelunasan"    accent="yellow" />
        <StatMini label="Sebagian"         value={sebagianCount} sub="Pembayaran sebagian"   accent="orange" />
        <StatMini label="Overdue"          value={overdueCount}  sub="⚠️ Lewat jatuh tempo"  accent="red" />
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
        <select className="px-3 py-[7px] border border-gray-200 rounded-lg text-xs text-gray-700 bg-white outline-none focus:border-[#1E1C43] hover:border-gray-300 transition-colors"
          value={fStatus} onChange={e => { setFStatus(e.target.value); setPage(1) }}>
          <option value="">Semua Status</option>
          <option value="Lunas">Lunas</option>
          <option value="Awaiting Payment">Awaiting Payment</option>
          <option value="Sebagian">Sebagian</option>
          <option value="Overdue">Overdue</option>
        </select>
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-[7px] focus-within:border-[#1E1C43] focus-within:bg-white transition-colors">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input className="border-none bg-transparent text-xs outline-none w-full text-gray-700 placeholder:text-gray-400"
            placeholder="Cari invoice, perusahaan, program..."
            value={fSearch} onChange={e => { setFSearch(e.target.value); setPage(1) }} />
        </div>
        <button onClick={reset} className="px-3.5 py-[7px] bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-xs font-semibold rounded-lg transition-colors shrink-0">Reset</button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: '1300px' }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[['No. Invoice',165],['Order ID',130],['Perusahaan',170],['Program',160],['Tgl Invoice',120],['Jatuh Tempo',120],['Total',130],['Status',120],['Aksi',100]].map(([h,mw]) => (
                  <th key={h} style={{minWidth:mw}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr><td colSpan={9} className="py-10 text-center text-sm text-gray-400">Tidak ada invoice yang sesuai filter</td></tr>
              ) : slice.map(inv => (
                <tr key={inv.id} onClick={() => setSelectedId(inv.id)}
                  className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer">
                  <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{inv.id}</td>
                  <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{inv.orderId}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: inv.color }}>
                        {inv.initials}
                      </div>
                      <span className="text-xs font-medium text-gray-800 whitespace-nowrap">{inv.perusahaan}</span>
                    </div>
                  </td>
                  <td className="text-xs text-gray-600 px-3 py-2.5 max-w-[160px] truncate">{inv.program}</td>
                  <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{inv.tanggal}</td>
                  <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{inv.jatuhTempo}</td>
                  <td className="text-xs font-semibold text-gray-800 px-3 py-2.5 whitespace-nowrap">
                    {formatRp(inv.items.reduce((s, i) => s + i.total, 0))}
                  </td>
                  <td className="px-3 py-2.5"><InvBadge status={inv.status} /></td>
                  <td className="px-3 py-2.5">
                    <button onClick={e => { e.stopPropagation(); setSelectedId(inv.id) }}
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
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
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
