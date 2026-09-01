import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, MessageCircle, FileText, ChevronDown, ClipboardList } from 'lucide-react'
import { LEADS_INIT, initLeads, getStoredLeads } from '../../data/eventLeadsStore'

/* ═══════════════════════════════════════
   Constants
═══════════════════════════════════════ */
const BULAN_OPTIONS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const BULAN_IDX     = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const ROWS_PER_PAGE = 10


const TIPE_CLS = {
  Corporate:  'bg-[#1E1C43] text-white',
  Foundation: 'bg-orange-500 text-white',
  Government: 'bg-green-600 text-white',
  Brand:      'bg-purple-600 text-white',
  Community:  'bg-blue-500 text-white',
  Private:    'bg-pink-500 text-white',
  Individual: 'bg-gray-400 text-white',
}

const STAGE_CLS = {
  New:         'bg-gray-100 text-gray-600',
  Approach:    'bg-blue-100 text-blue-700',
  Konsultasi:  'bg-yellow-100 text-yellow-700',
  Quotation:   'bg-purple-100 text-purple-700',
  Closing:     'bg-orange-100 text-[#E05945]',
  Converted:   'bg-green-100 text-green-700',
  Lost:        'bg-red-100 text-red-600',
}


function formatTgl(iso) {
  if (!iso) return '-'
  try { return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return iso }
}

/* ═══════════════════════════════════════
   Helpers — Avatar & WA
═══════════════════════════════════════ */
const AVATAR_COLORS = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777','#0284C7']
function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
function getAvatarColor(name) {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFFFF
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function buildWANumber(raw = '') {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return '62' + digits.slice(1)
  return '62' + digits
}

function openLeadWA(lead, e) {
  e.stopPropagation()
  const name = lead.namaKoordinator || lead.namaKlien
  const msg = [
    `Halo *${name}*,`,
    '',
    `Saya dari *EFM (Essential Fitness Management)* 👋`,
    '',
    `Kami tertarik untuk mendiskusikan event *${lead.namaEvent || 'bersama kami'}*.`,
    '',
    `Boleh kami jadwalkan waktu untuk konsultasi lebih lanjut?`,
    '',
    `_EFM Event Management_`,
  ].join('\n')
  window.open(`https://wa.me/${buildWANumber(lead.waKoordinator)}?text=${encodeURIComponent(msg)}`, '_blank')
}

/* ═══════════════════════════════════════
   Small components
═══════════════════════════════════════ */
function TipeBadge({ tipe }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${TIPE_CLS[tipe] ?? 'bg-gray-100 text-gray-600'}`}>
      {tipe}
    </span>
  )
}

function StageBadge({ stage }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${STAGE_CLS[stage] ?? 'bg-gray-100 text-gray-600'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {stage}
    </span>
  )
}


function LeadsPageBtn({ label, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={[
        'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors',
        active   ? 'bg-[#1E1C43] text-white border-[#1E1C43]' : '',
        disabled ? 'opacity-35 cursor-not-allowed border-gray-200 text-gray-400' : '',
        !active && !disabled ? 'border-gray-200 text-gray-600 hover:border-[#1E1C43] hover:text-[#1E1C43]' : '',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
export default function EventLeadsPage() {
  const navigate = useNavigate()
  const docMenuRef = useRef(null)
  const [showDocMenu, setShowDocMenu] = useState(false)

  useEffect(() => {
    function handleClickOutside(e) {
      if (docMenuRef.current && !docMenuRef.current.contains(e.target)) setShowDocMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const [leads] = useState(() => { initLeads(LEADS_INIT); return getStoredLeads() })
  const [bulan,  setBulan]  = useState('')
  const [tahun,       setTahun]       = useState('')
  const [tipe,        setTipe]        = useState('')
  const [stage,       setStage]       = useState('')
  const [search,      setSearch]      = useState('')
  const [page,   setPage]   = useState(1)

  function handleReset() { setBulan(''); setTahun(''); setTipe(''); setStage(''); setSearch(''); setPage(1) }

  useEffect(() => { setPage(1) }, [bulan, tahun, tipe, stage, search])

  const filtered = useMemo(() => leads.filter(l => {
    if (bulan) {
      const m = BULAN_IDX[new Date(l.tanggal).getMonth()]
      if (m !== bulan) return false
    }
    if (tahun && String(new Date(l.tanggal).getFullYear()) !== tahun) return false
    if (tipe  && l.tipeKlien !== tipe)  return false
    if (stage && l.stage     !== stage) return false
    if (search && !l.namaKlien.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => parseInt(b.id.split('-')[1]) - parseInt(a.id.split('-')[1]))
  , [leads, bulan, tahun, tipe, stage, search])

  const kpiTotal     = leads.length
  const kpiHot       = leads.filter(l => l.stage === 'Quotation' || l.stage === 'Closing').length
  const kpiConverted = leads.filter(l => l.stage === 'Converted').length
  const kpiLost      = leads.filter(l => l.stage === 'Lost').length

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const pageRows   = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE)

  return (
    <>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold text-[#1E1C43]">Leads Event</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola prospek klien Event — Corporate, Foundation, Government &amp; lainnya</p>
          </div>
            <div className="flex items-center gap-2">
            {/* Dokumen dropdown */}
            <div className="relative" ref={docMenuRef}>
              <button
                onClick={() => setShowDocMenu(v => !v)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <FileText size={14} />
                Dokumen
                <ChevronDown size={13} className={`transition-transform duration-200 ${showDocMenu ? 'rotate-180' : ''}`} />
              </button>
              {showDocMenu && (
                <div className="absolute right-0 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[170px]">
                  {[
                    { icon: ClipboardList, label: 'Konsultasi', path: '/event/konsultasi' },
                    { icon: FileText,      label: 'Quotation',  path: '/event/quotation'  },
                  ].map(({ icon: Icon, label, path }) => (
                    <button
                      key={path}
                      onClick={() => { setShowDocMenu(false); navigate(path) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon size={14} className="text-gray-400" /> {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/event/leads/new')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#E05945] hover:bg-[#c94a38] transition-colors"
            >
              <Plus size={15} strokeWidth={2.5} /> Tambah Lead
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border-[1.5px] border-gray-200 px-4 py-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Leads</p>
            <p className="text-xl font-bold text-[#1E1C43]">{kpiTotal}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Semua pipeline</p>
          </div>
          <div className="bg-white rounded-xl border-[1.5px] border-[#E05945] px-4 py-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Hot Leads</p>
            <p className="text-xl font-bold text-[#E05945]">{kpiHot}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Proposal &amp; Closing</p>
          </div>
          <div className="bg-white rounded-xl border-[1.5px] border-green-500 px-4 py-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Converted</p>
            <p className="text-xl font-bold text-green-600">{kpiConverted}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Jadi klien aktif</p>
          </div>
          <div className="bg-white rounded-xl border-[1.5px] border-red-400 px-4 py-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Lost</p>
            <p className="text-xl font-bold text-red-500">{kpiLost}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Tidak closing</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
          <select value={bulan} onChange={e => setBulan(e.target.value)}
            className="px-3 py-[7px] border-[1.5px] border-gray-200 rounded-lg text-xs text-gray-700 bg-white outline-none focus:border-[#1E1C43] hover:border-gray-300 transition-colors">
            <option value="">Semua Bulan</option>
            {BULAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={tahun} onChange={e => setTahun(e.target.value)}
            className="px-3 py-[7px] border-[1.5px] border-gray-200 rounded-lg text-xs text-gray-700 bg-white outline-none focus:border-[#1E1C43] hover:border-gray-300 transition-colors">
            <option value="">Semua Tahun</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
          <select value={tipe} onChange={e => setTipe(e.target.value)}
            className="px-3 py-[7px] border-[1.5px] border-gray-200 rounded-lg text-xs text-gray-700 bg-white outline-none focus:border-[#1E1C43] hover:border-gray-300 transition-colors">
            <option value="">Semua Tipe</option>
            <option>Corporate</option><option>Foundation</option><option>Government</option>
            <option>Brand</option><option>Community</option><option>Private</option><option>Individual</option>
          </select>
          <select value={stage} onChange={e => setStage(e.target.value)}
            className="px-3 py-[7px] border-[1.5px] border-gray-200 rounded-lg text-xs text-gray-700 bg-white outline-none focus:border-[#1E1C43] hover:border-gray-300 transition-colors">
            <option value="">Semua Status</option>
            <option>New</option><option>Approach</option><option>Konsultasi</option>
            <option>Quotation</option><option>Closing</option><option>Converted</option><option>Lost</option>
          </select>
          <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-gray-50 border-[1.5px] border-gray-200 rounded-lg px-3 py-[7px] focus-within:border-[#1E1C43] focus-within:bg-white transition-colors">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              className="border-none bg-transparent text-xs outline-none w-full text-gray-700 placeholder:text-gray-400"
              placeholder="Cari nama perusahaan..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={handleReset} className="px-3.5 py-[7px] border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold rounded-lg transition-colors shrink-0">Reset</button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 420px)', minHeight: '280px' }}>
            <table className="w-full" style={{ minWidth: '1100px' }}>
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    ['ID', 110], ['Nama Klien', 170], ['Tipe', 110], ['Nama Event', 160],
                    ['Kota', 110], ['Sumber', 110], ['PIC EFM', 110], ['Stage', 120],
                    ['Koordinator', 140], ['No. WA', 150], ['Tanggal', 110],
                  ].map(([h, mw]) => (
                    <th key={h} style={{ minWidth: mw }} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr><td colSpan={11} className="px-4 py-10 text-center text-sm text-gray-400">Tidak ada data yang cocok dengan filter.</td></tr>
                ) : pageRows.map(lead => (
                  <tr
                    key={lead.id}
                    onClick={() => navigate('/event/leads/' + lead.id, { state: { lead } })}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  >
                    <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{lead.id}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background: getAvatarColor(lead.namaKlien) }}
                        >
                          {getInitials(lead.namaKlien)}
                        </div>
                        <span className="text-xs font-medium text-gray-900 whitespace-nowrap">{lead.namaKlien}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><TipeBadge tipe={lead.tipeKlien} /></td>
                    <td className="text-xs text-gray-700 px-3 py-2.5 max-w-[180px]">
                      <p className="truncate">{lead.namaEvent || '—'}</p>
                      <p className="text-[10px] text-gray-400 truncate">{lead.jenisEvent || ''}</p>
                    </td>
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{lead.kota}</td>
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{lead.sumberLead}</td>
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{lead.picSalesEFM}</td>
                    <td className="px-3 py-2.5"><StageBadge stage={lead.stage} /></td>
                    <td className="text-xs px-3 py-2.5 whitespace-nowrap">
                      {lead.namaKoordinator
                        ? <span className="text-gray-800">{lead.namaKoordinator}</span>
                        : <span className="text-gray-400 italic">Belum diisi</span>
                      }
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-600">{lead.waKoordinator || '-'}</span>
                        {lead.waKoordinator && (
                          <button
                            onClick={e => openLeadWA(lead, e)}
                            title="Kirim WA"
                            className="w-5 h-5 rounded-full bg-[#25D366] hover:bg-[#1DA851] flex items-center justify-center transition-colors shrink-0"
                          >
                            <MessageCircle size={10} className="text-white" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{formatTgl(lead.tanggal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Menampilkan {filtered.length === 0 ? 0 : (safePage - 1) * ROWS_PER_PAGE + 1}–{Math.min(safePage * ROWS_PER_PAGE, filtered.length)} dari {filtered.length} leads
            </p>
            <div className="flex items-center gap-1">
              <LeadsPageBtn label="‹" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <LeadsPageBtn key={p} label={p} onClick={() => setPage(p)} active={p === safePage} />
              ))}
              <LeadsPageBtn label="›" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} />
            </div>
          </div>
        </div>
      </div>

    </>
  )
}
