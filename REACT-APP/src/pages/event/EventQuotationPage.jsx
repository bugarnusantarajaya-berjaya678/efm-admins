import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Search, RotateCcw, ScrollText, ArrowLeft, Settings, ChevronDown, ChevronLeft, ChevronRight, GripVertical, Save, Trash2, Pencil, X, Plus } from 'lucide-react'
import { initQuotations, getStoredQuotations, QUOTATIONS_INIT } from '../../data/eventQuotationsStore'
import { getCompanySettings } from '../../utils/companySettings'

const ROWS_PER_PAGE = 8

const STATUS_CFG = {
  Draft:      { cls: 'bg-gray-100 text-gray-600 border-gray-200'        },
  Terkirim:   { cls: 'bg-blue-50 text-blue-700 border-blue-200'          },
  Disetujui:  { cls: 'bg-green-50 text-green-700 border-green-200'       },
  Revisi:     { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200'    },
  Ditolak:    { cls: 'bg-red-50 text-red-700 border-red-200'             },
}

function fmtRp(n) {
  if (!n && n !== 0) return '—'
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return iso }
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { cls: 'bg-gray-100 text-gray-500 border-gray-200' }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {status}
    </span>
  )
}

function PBtn({ onClick, disabled, active, children }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={[
        'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors',
        active   ? 'bg-[#1E1C43] text-white border-[#1E1C43]' : '',
        disabled ? 'opacity-35 cursor-not-allowed border-gray-200 text-gray-400' : '',
        !active && !disabled ? 'border-gray-200 text-gray-600 hover:border-[#1E1C43] hover:text-[#1E1C43]' : '',
      ].join(' ')}>
      {children}
    </button>
  )
}

/* ─── Template Quotation Editor ─── */
function getDefaultQSyarat() {
  const cs = getCompanySettings()
  return [
    'Quotation ini berlaku selama 14 hari sejak tanggal terbit.',
    'Harga yang tercantum belum termasuk PPN 11% kecuali disebutkan secara eksplisit.',
    'Konfirmasi order dilakukan dengan menandatangani Surat Perjanjian atau melakukan DP minimum 50%.',
    'Pembatalan setelah konfirmasi order dikenakan biaya pembatalan 25% dari total nilai quotation.',
    `${cs.namaPerusahaan} berhak menyesuaikan jadwal instruktur dengan pemberitahuan H-3.`,
    `Untuk pertanyaan terkait quotation ini, hubungi: ${cs.email}`,
  ]
}

function TemplateQuotationEditor({ onClose }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('efmQuotationTemplate')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed.items) && parsed.items.length > 0) return parsed.items
      }
    } catch {}
    return [...getDefaultQSyarat()]
  })
  const [dirty,       setDirty]       = useState(false)
  const [savedOk,     setSavedOk]     = useState(false)
  const [editMode,    setEditMode]    = useState(false)
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const dragIdx      = useRef(null)
  const editSnapshot = useRef(null)

  const mutate = fn => { setItems(prev => fn([...prev])); setDirty(true); setSavedOk(false) }

  const handleSave = () => {
    try { localStorage.setItem('efmQuotationTemplate', JSON.stringify({ items })) } catch {}
    setDirty(false); setSavedOk(true); setEditMode(false)
    setTimeout(() => setSavedOk(false), 2500)
  }

  const handleReset = () => {
    if (!window.confirm('Reset ke template default? Semua perubahan akan hilang.')) return
    setItems([...getDefaultQSyarat()])
    try { localStorage.removeItem('efmQuotationTemplate') } catch {}
    setDirty(false); setSavedOk(false)
  }

  const enterEdit = () => { editSnapshot.current = [...items]; setEditMode(true) }
  const cancelEdit = () => {
    if (editSnapshot.current) { setItems(editSnapshot.current); setDirty(false) }
    setEditMode(false); setSavedOk(false)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Editor header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1E1C43] flex items-center justify-center shrink-0">
            <ScrollText size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1E1C43]">Template Syarat &amp; Ketentuan Quotation</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Berlaku untuk semua quotation B2B Event</p>
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
          <span className="font-semibold">Info:</span> Syarat &amp; Ketentuan ini akan tampil di semua quotation B2B Event. Perubahan tidak mempengaruhi quotation yang sudah dikirim sebelumnya.
        </p>
      </div>

      {!editMode && (
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-[11px] text-gray-500">Mode tampilan — klik <strong className="text-[#1E1C43]">Edit Template</strong> untuk mulai mengedit baris.</p>
        </div>
      )}

      {editMode && dirty && (
        <div className="px-5 py-3 bg-yellow-50 border-b border-yellow-100">
          <p className="text-[11px] text-yellow-700 font-medium">Ada perubahan yang belum disimpan — klik <strong>Simpan Template</strong> untuk menyimpan.</p>
        </div>
      )}

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
export default function EventQuotationPage() {
  const navigate = useNavigate()
  const [list] = useState(() => { initQuotations(QUOTATIONS_INIT); return getStoredQuotations() })
  const [fStatus,      setFStatus]      = useState('')
  const [fBulan,       setFBulan]       = useState('')
  const [fTahun,       setFTahun]       = useState('')
  const [search,       setSearch]       = useState('')
  const [page,         setPage]         = useState(1)
  const [showTemplate, setShowTemplate] = useState(false)

  useEffect(() => { setPage(1) }, [fStatus, fBulan, fTahun, search])

  const filtered = useMemo(() => list.filter(q => {
    if (fStatus && q.status !== fStatus) return false
    if (fBulan) {
      try {
        const bulanIdx = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'].indexOf(fBulan)
        if (bulanIdx >= 0 && new Date(q.tanggalDibuat).getMonth() !== bulanIdx) return false
      } catch { /* skip */ }
    }
    if (fTahun && !(q.tanggalDibuat || '').startsWith(fTahun)) return false
    if (search) {
      const q_lower = search.toLowerCase()
      if (!q.namaKlien?.toLowerCase().includes(q_lower) &&
          !q.namaEvent?.toLowerCase().includes(q_lower) &&
          !q.id?.toLowerCase().includes(q_lower)) return false
    }
    return true
  }), [list, fStatus, fBulan, fTahun, search])

  const kpiTotal     = list.length
  const kpiDraft     = list.filter(q => q.status === 'Draft').length
  const kpiTerkirim  = list.filter(q => q.status === 'Terkirim').length
  const kpiDisetujui = list.filter(q => q.status === 'Disetujui').length

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const pageRows   = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE)

  const BULAN_OPTS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
              <ScrollText size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">Quotation B2B Event</h1>
              <p className="text-sm text-gray-500 mt-0.5">Database seluruh penawaran harga B2B Event</p>
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
              <Settings size={12} /> Template Quotation <ChevronDown size={12} className={`transition-transform ${showTemplate ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/event/leads')}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={12} /> Kembali ke B2B Event Leads
            </button>
          </div>
        </div>
      </div>

      {showTemplate ? (
        <TemplateQuotationEditor onClose={() => setShowTemplate(false)} />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border-[1.5px] border-gray-200 px-4 py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Quotation</p>
              <p className="text-xl font-bold text-[#1E1C43]">{kpiTotal}</p>
            </div>
            <div className="bg-white rounded-xl border-[1.5px] border-gray-300 px-4 py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Draft</p>
              <p className="text-xl font-bold text-gray-500">{kpiDraft}</p>
            </div>
            <div className="bg-white rounded-xl border-[1.5px] border-blue-400 px-4 py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Terkirim</p>
              <p className="text-xl font-bold text-blue-600">{kpiTerkirim}</p>
            </div>
            <div className="bg-white rounded-xl border-[1.5px] border-green-500 px-4 py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Disetujui</p>
              <p className="text-xl font-bold text-green-600">{kpiDisetujui}</p>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
            <select value={fStatus} onChange={e => setFStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
              <option value="">Semua Status</option>
              <option>Draft</option>
              <option>Terkirim</option>
              <option>Disetujui</option>
              <option>Revisi</option>
              <option>Ditolak</option>
            </select>
            <select value={fBulan} onChange={e => setFBulan(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
              <option value="">Semua Bulan</option>
              {BULAN_OPTS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={fTahun} onChange={e => setFTahun(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
              <option value="">Semua Tahun</option>
              <option>2026</option>
              <option>2025</option>
            </select>
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-gray-50 border-[1.5px] border-gray-200 rounded-lg px-3 py-[7px] focus-within:border-[#1E1C43] focus-within:bg-white transition-colors">
                <Search size={13} className="text-gray-400 shrink-0" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari klien, event, atau ID..."
                  className="border-none bg-transparent text-xs outline-none w-full text-gray-700 placeholder:text-gray-400 sm:min-w-[200px]" />
              </div>
              <button onClick={() => { setFStatus(''); setFBulan(''); setFTahun(''); setSearch('') }}
                className="inline-flex items-center gap-1.5 bg-[#1E1C43] text-white text-xs px-3 py-2 rounded-lg hover:bg-[#2d2b5c] transition-colors flex-shrink-0">
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 360px)', minHeight: '280px' }}>
              <table className="w-full text-sm" style={{ minWidth: '960px' }}>
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['No. Quotation','Klien','Nama Event','Lead','Konsultasi Asal','Tgl Dibuat','Berlaku s/d','Nilai Total','Status','PIC'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-10 text-center text-sm text-gray-400">Tidak ada data quotation.</td>
                    </tr>
                  ) : pageRows.map((q, idx) => (
                    <tr key={q.id}
                      onClick={() => navigate('/event/quotation/' + q.id)}
                      className={`border-b border-gray-100 hover:bg-blue-50/40 transition-colors duration-150 cursor-pointer ${idx % 2 === 1 ? 'bg-[#FAFAFA]' : ''}`}>
                      <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <FileText size={12} className="text-gray-400 shrink-0" />
                          {q.id}
                        </div>
                      </td>
                      <td className="text-xs font-medium text-gray-900 px-3 py-2.5 whitespace-nowrap">{q.namaKlien}</td>
                      <td className="text-xs text-gray-700 px-3 py-2.5 max-w-[200px] truncate">{q.namaEvent || '—'}</td>
                      <td className="text-xs font-medium text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">
                        {q.leadId ? (
                          <button
                            onClick={e => { e.stopPropagation(); navigate('/event/leads/' + q.leadId) }}
                            className="text-[#1E1C43] hover:underline underline-offset-2">
                            {q.leadId}
                          </button>
                        ) : '—'}
                      </td>
                      <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{q.konsultasiId || '—'}</td>
                      <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{fmtDate(q.tanggalDibuat)}</td>
                      <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{fmtDate(q.tanggalBerlaku)}</td>
                      <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">
                        {fmtRp(q.nilaiTotal)}
                      </td>
                      <td className="px-3 py-2.5"><StatusBadge status={q.status} /></td>
                      <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{q.picEFM || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Menampilkan {filtered.length === 0 ? 0 : (safePage - 1) * ROWS_PER_PAGE + 1}–{Math.min(safePage * ROWS_PER_PAGE, filtered.length)} dari {filtered.length} quotation
              </p>
              <div className="flex items-center gap-1">
                <PBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
                  <ChevronLeft size={14} />
                </PBtn>
                {(() => {
                  const pages = []
                  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <PBtn key={p} onClick={() => setPage(p)} active={p === safePage}>{p}</PBtn>
                  ))
                  pages.push(1)
                  if (safePage > 3) pages.push('...')
                  for (let p = Math.max(2, safePage - 1); p <= Math.min(totalPages - 1, safePage + 1); p++) pages.push(p)
                  if (safePage < totalPages - 2) pages.push('...')
                  pages.push(totalPages)
                  return pages.map((p, i) => p === '...' ? (
                    <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
                  ) : (
                    <PBtn key={p} onClick={() => setPage(p)} active={p === safePage}>{p}</PBtn>
                  ))
                })()}
                <PBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                  <ChevronRight size={14} />
                </PBtn>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  )
}
