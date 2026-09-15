import { useState, useMemo, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, CheckCircle, X, ArrowLeft, Receipt, RotateCcw, Save, GripVertical, Trash2, Pencil, Settings, ChevronDown, ScrollText, Plus } from 'lucide-react'
import { WA_LABEL, formatRp } from '../../data/ppReceiptData'
import { getAllReceipts, addReceipt, getNextReceiptNo } from '../../data/ppReceiptStore'
import { getDocByOrderId, updateDoc } from '../../data/ppDocumentsStore'

/* ─── Template Receipt Catatan ─── */
function getDefaultRcpCatatan() {
  return [
    'Tunjukkan barcode ini kepada pelatih / terapis di setiap sesi pertemuan berlangsung.',
    'Simpan receipt ini sebagai bukti pembayaran yang sah.',
    'Barcode tidak dapat dipindahtangankan — hanya berlaku untuk klien yang bersangkutan.',
  ]
}

function TemplateReceiptEditor({ onClose }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('efmReceiptTemplate')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed.items) && parsed.items.length > 0) return parsed.items
      }
    } catch {}
    return [...getDefaultRcpCatatan()]
  })
  const [dirty,       setDirty]       = useState(false)
  const [savedOk,     setSavedOk]     = useState(false)
  const [editMode,    setEditMode]    = useState(false)
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const dragIdx      = useRef(null)
  const editSnapshot = useRef(null)

  const mutate = fn => { setItems(prev => fn([...prev])); setDirty(true); setSavedOk(false) }

  const handleSave = () => {
    try { localStorage.setItem('efmReceiptTemplate', JSON.stringify({ items })) } catch {}
    setDirty(false); setSavedOk(true); setEditMode(false)
    setTimeout(() => setSavedOk(false), 2500)
  }

  const handleReset = () => {
    if (!window.confirm('Reset ke template default? Semua perubahan akan hilang.')) return
    setItems([...getDefaultRcpCatatan()])
    try { localStorage.removeItem('efmReceiptTemplate') } catch {}
    setDirty(false); setSavedOk(false)
  }

  const enterEdit  = () => { editSnapshot.current = [...items]; setEditMode(true) }
  const cancelEdit = () => {
    if (editSnapshot.current) { setItems(editSnapshot.current); setDirty(false) }
    setEditMode(false); setSavedOk(false)
  }

  return (
    <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Editor header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1E1C43] flex items-center justify-center shrink-0">
            <Receipt size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1E1C43]">Template Catatan Receipt</h2>
            <p className="text-[11px] text-text-muted mt-0.5">Berlaku untuk semua receipt Private Training</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {editMode ? (
            <>
              <button onClick={handleReset}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">
                <RotateCcw size={12} /> Reset Default
              </button>
              <button onClick={cancelEdit}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">
                <X size={12} /> Batal
              </button>
              <button onClick={handleSave} disabled={!dirty}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-xs font-semibold disabled:opacity-40 transition-colors ${savedOk ? 'bg-green-500' : 'bg-[#1E1C43] hover:bg-[#2d2b5c]'}`}>
                <Save size={12} /> {savedOk ? 'Tersimpan!' : 'Simpan Template'}
              </button>
            </>
          ) : (
            <>
              {savedOk && (
                <span className="text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded-lg">✓ Tersimpan</span>
              )}
              <button onClick={enterEdit}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E1C43] hover:bg-[#2d2b5c] text-white text-xs font-semibold transition-colors">
                <Pencil size={12} /> Edit Template
              </button>
            </>
          )}
          <button onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
            <X size={12} /> Tutup
          </button>
        </div>
      </div>

      {/* Info hint */}
      <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
        <p className="text-[11px] text-blue-700">
          <span className="font-semibold">Info:</span> Catatan ini akan tampil di semua receipt Private Training yang dicetak atau di-download. Perubahan tidak mempengaruhi receipt yang sudah dikirim sebelumnya.
        </p>
      </div>

      {/* View mode hint */}
      {!editMode && (
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-[11px] text-gray-500">Mode tampilan — klik <strong className="text-[#1E1C43]">Edit Template</strong> untuk mulai mengedit baris.</p>
        </div>
      )}

      {/* Dirty warning */}
      {editMode && dirty && (
        <div className="px-5 py-3 bg-yellow-50 border-b border-yellow-100">
          <p className="text-[11px] text-yellow-700 font-medium">Ada perubahan yang belum disimpan — klik <strong>Simpan Template</strong> untuk menyimpan.</p>
        </div>
      )}

      {/* Drag hint */}
      {editMode && (
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <GripVertical size={13} className="text-gray-400" />
          <p className="text-[11px] text-gray-500">Drag handle untuk mengubah urutan baris.</p>
        </div>
      )}

      {/* Items list */}
      <div className="p-5 space-y-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            draggable={editMode}
            onDragStart={() => { dragIdx.current = idx }}
            onDragOver={e => { e.preventDefault(); setDragOverIdx(idx) }}
            onDrop={() => {
              if (dragIdx.current === null || dragIdx.current === idx) { setDragOverIdx(null); return }
              mutate(arr => {
                const [moved] = arr.splice(dragIdx.current, 1)
                arr.splice(idx, 0, moved)
                return arr
              })
              setDragOverIdx(null)
            }}
            onDragEnd={() => { dragIdx.current = null; setDragOverIdx(null) }}
            className={`flex items-start gap-3 rounded-xl p-3 border transition-colors ${
              dragOverIdx === idx ? 'border-[#1E1C43] bg-blue-50' : 'border-gray-100 bg-gray-50'
            } ${editMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
          >
            <div className="flex items-center gap-2 shrink-0 mt-0.5">
              {editMode && <GripVertical size={14} className="text-gray-300" />}
              <span className="w-5 h-5 rounded-full bg-[#1E1C43] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
            </div>
            {editMode ? (
              <input
                type="text"
                value={item}
                onChange={e => mutate(arr => { arr[idx] = e.target.value; return arr })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1E1C43] bg-white"
              />
            ) : (
              <span className="flex-1 text-sm text-gray-700 leading-relaxed">{item}</span>
            )}
            {editMode && (
              <button onClick={() => mutate(arr => { arr.splice(idx, 1); return arr })}
                className="text-gray-300 hover:text-red-500 transition-colors mt-0.5 shrink-0">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}

        {editMode && (
          <button onClick={() => mutate(arr => { arr.push(''); return arr })}
            className="flex items-center gap-2 text-sm text-[#E05945] hover:text-[#c94a38] font-medium mt-2 transition-colors">
            <Plus size={14} /> Tambah Baris
          </button>
        )}
      </div>
    </div>
  )
}

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
  const [showTemplate,   setShowTemplate]   = useState(false)
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
    const newRcpNo = getNextReceiptNo()
    const getInits = n => (n || '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    const tglFormatted = new Date(createForm.tglBayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    const newReceipt = {
      rcpNo: newRcpNo, invNo: prefill.invNo || '', orderId: prefill.orderId || '',
      client: prefill.client || '', sapaan: prefill.sapaan || '',
      initials: getInits(prefill.client || ''),
      color: COLORS[getAllReceipts().length % COLORS.length],
      paket: prefill.paket || '', pic: prefill.pic || '',
      tglBayar: tglFormatted, metode: createForm.metode,
      total: prefill.total || 0, waStatus: 'not-sent', waTgl: null,
    }
    addReceipt(newReceipt)
    // Sync noReceipt ke agreement yang terkait order ini
    const linkedAgr = getDocByOrderId(newReceipt.orderId)
    if (linkedAgr) updateDoc(linkedAgr.id, { noReceipt: newRcpNo })
    setReceipts(getAllReceipts())
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

  const start = (page - 1) * ROWS + 1
  const end   = Math.min(page * ROWS, filtered.length)

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
              <Receipt size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">Receipt &amp; Barcode</h1>
              <p className="text-sm text-text-muted mt-0.5">Kelola receipt pembayaran dan status pengiriman WhatsApp</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowTemplate(v => !v)}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors border w-full sm:w-auto ${
                showTemplate
                  ? 'bg-[#1E1C43] text-white border-[#1E1C43]'
                  : 'border-[#1E1C43] text-[#1E1C43] hover:bg-[#1E1C43] hover:text-white'
              }`}
            >
              <Settings size={12} /> Template Receipt <ChevronDown size={12} className={`transition-transform ${showTemplate ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/pp/orders')}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={12} /> Kembali ke PP Orders
            </button>
          </div>
        </div>
      </div>

      {showTemplate ? (
        <TemplateReceiptEditor onClose={() => setShowTemplate(false)} />
      ) : (
      <>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatMini label="Total Receipt"   value={receipts.length} sub="Semua receipt" />
        <StatMini label="WA Terkirim"    value={sentCount}       sub="Notifikasi berhasil" accent="green" />
        <StatMini label="Belum Dikirim"  value={notSentCount}    sub="Belum dikirim"       accent="yellow" />
        <StatMini label="Kirim Gagal"    value={failedCount}     sub="Perlu kirim ulang"   accent="red" />
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
          <option value="sent">Terkirim</option>
          <option value="not-sent">Belum Dikirim</option>
          <option value="failed">Gagal</option>
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
        <button onClick={reset} className="px-3.5 py-[7px] bg-primary hover:bg-primary-2 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5"><RotateCcw size={12} /> Reset</button>
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
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr><td colSpan={9} className="py-10 text-center text-sm text-text-muted">Tidak ada data receipt ditemukan</td></tr>
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
      </>
      )}
    </div>
  )
}
