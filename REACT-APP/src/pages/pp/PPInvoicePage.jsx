import { useState, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, ArrowLeft, ScrollText, Settings, ChevronDown, GripVertical, Save, RotateCcw, Plus, Trash2, Pencil, X } from 'lucide-react'
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

/* ─── Template Invoice Editor ─── */
const DEFAULT_INV_SYARAT = [
  'Pembayaran dilakukan paling lambat 3 hari setelah invoice diterima.',
  'Program dimulai setelah konfirmasi pembayaran dari Essential Fitness Management.',
  'Sesi yang tidak dihadiri tanpa konfirmasi H-1 tidak dapat dijadwal ulang.',
  'Pembatalan program setelah sesi ke-3 tidak dapat direfund.',
  'Essential Fitness Management berhak mengganti pelatih jika diperlukan dengan pemberitahuan terlebih dahulu.',
  'Untuk pertanyaan terkait invoice, hubungi: essentialfitnessmanagement@gmail.com',
]

function TemplateInvoiceEditor({ onClose }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('efmInvoiceTemplate')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed.items) && parsed.items.length > 0) return parsed.items
      }
    } catch {}
    return [...DEFAULT_INV_SYARAT]
  })
  const [dirty,       setDirty]       = useState(false)
  const [savedOk,     setSavedOk]     = useState(false)
  const [editMode,    setEditMode]    = useState(false)
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const dragIdx       = useRef(null)
  const editSnapshot  = useRef(null)

  const mutate = fn => { setItems(prev => fn([...prev])); setDirty(true); setSavedOk(false) }

  const handleSave = () => {
    try { localStorage.setItem('efmInvoiceTemplate', JSON.stringify({ items })) } catch {}
    setDirty(false); setSavedOk(true); setEditMode(false)
    setTimeout(() => setSavedOk(false), 2500)
  }

  const handleReset = () => {
    if (!window.confirm('Reset ke template default? Semua perubahan akan hilang.')) return
    setItems([...DEFAULT_INV_SYARAT])
    try { localStorage.removeItem('efmInvoiceTemplate') } catch {}
    setDirty(false); setSavedOk(false)
  }

  const enterEdit = () => { editSnapshot.current = [...items]; setEditMode(true) }
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
            <ScrollText size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1E1C43]">Template Syarat &amp; Ketentuan Invoice</h2>
            <p className="text-[11px] text-text-muted mt-0.5">Berlaku untuk semua invoice Private Training</p>
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
          <span className="font-semibold">Info:</span> Syarat &amp; Ketentuan ini akan tampil di semua invoice Private Training yang dicetak atau di-download. Perubahan tidak mempengaruhi invoice yang sudah dikirim sebelumnya.
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

/* ─── Main Page ─── */
const ROWS = 10

export default function PPInvoicePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [invoices,     setInvoices]     = useState(INVOICES_INIT)
  const [fStatus,      setFStatus]      = useState('')
  const [fBulan,       setFBulan]       = useState('')
  const [fTahun,       setFTahun]       = useState('')
  const [fSearch,      setFSearch]      = useState(location.state?.filterSearch ?? '')
  const [page,         setPage]         = useState(1)
  const [showTemplate, setShowTemplate] = useState(false)

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
      {/* Header */}
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
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => setShowTemplate(v => !v)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                showTemplate
                  ? 'bg-[#1E1C43] text-white border-[#1E1C43]'
                  : 'border-[#1E1C43] text-[#1E1C43] hover:bg-[#1E1C43] hover:text-white'
              }`}
            >
              <Settings size={12} /> Template Invoice <ChevronDown size={12} className={`transition-transform ${showTemplate ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/pp/orders')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft size={12} /> Kembali ke PP Orders
            </button>
          </div>
        </div>
      </div>

      {showTemplate ? (
        <TemplateInvoiceEditor onClose={() => setShowTemplate(false)} />
      ) : (
        <>
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
                  </tr>
                </thead>
                <tbody>
                  {slice.length === 0 ? (
                    <tr><td colSpan={8} className="py-10 text-center text-sm text-text-muted">Tidak ada invoice yang sesuai filter</td></tr>
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
        </>
      )}
    </div>
  )
}
