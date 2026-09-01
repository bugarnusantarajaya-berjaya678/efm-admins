import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, Search, RotateCcw, ScrollText } from 'lucide-react'
import { initQuotations, getStoredQuotations, QUOTATIONS_INIT } from '../../data/eventQuotationsStore'

const ROWS_PER_PAGE = 10

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

function PBtn({ label, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={[
        'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors',
        active   ? 'bg-[#1E1C43] text-white border-[#1E1C43]' : '',
        disabled ? 'opacity-35 cursor-not-allowed border-gray-200 text-gray-400' : '',
        !active && !disabled ? 'border-gray-200 text-gray-600 hover:border-[#1E1C43] hover:text-[#1E1C43]' : '',
      ].join(' ')}>
      {label}
    </button>
  )
}

export default function EventQuotationPage() {
  const navigate = useNavigate()
  const [list] = useState(() => { initQuotations(QUOTATIONS_INIT); return getStoredQuotations() })
  const [fStatus, setFStatus] = useState('')
  const [fBulan,  setFBulan]  = useState('')
  const [fTahun,  setFTahun]  = useState('')
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(1)

  useEffect(() => { setPage(1) }, [fStatus, fBulan, fTahun, search])

  const filtered = list.filter(q => {
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
  })

  const kpiTotal     = list.length
  const kpiDraft     = list.filter(q => q.status === 'Draft').length
  const kpiTerkirim  = list.filter(q => q.status === 'Terkirim').length
  const kpiDisetujui = list.filter(q => q.status === 'Disetujui').length

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const pageRows   = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE)

  const BULAN_OPTS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

  return (
    <div className="space-y-4">

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
          <button
            onClick={() => navigate('/event/quotation/new')}
            className="inline-flex items-center gap-2 bg-[#E05945] hover:bg-[#c94a38] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            <Plus size={15} strokeWidth={2.5} /> Buat Quotation
          </button>
        </div>
      </div>

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
          <div className="relative flex-1 sm:flex-none">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari klien, event, atau ID..."
              className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] sm:min-w-[240px]" />
          </div>
          <button onClick={() => { setFStatus(''); setFBulan(''); setFTahun(''); setSearch('') }}
            className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs px-3 py-2 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors flex-shrink-0">
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 340px)', minHeight: '280px' }}>
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
              ) : pageRows.map(q => (
                <tr key={q.id}
                  onClick={() => navigate('/event/quotation/' + q.id)}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
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
            <PBtn label="‹" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <PBtn key={p} label={p} onClick={() => setPage(p)} active={p === safePage} />
            ))}
            <PBtn label="›" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} />
          </div>
        </div>
      </div>

    </div>
  )
}
