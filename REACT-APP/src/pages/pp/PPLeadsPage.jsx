import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Plus, Search, MessageCircle } from 'lucide-react'
import { getStoredLeads } from '../../data/ppLeadsStore'
import { getStoredJenis } from '../../data/ppJenisStore'
import { getCompanySettings } from '../../utils/companySettings'
import { PIC_OPTS } from '../../data/ppProgramDBData'


/* ═══════════════════════════════════════
   Constants
═══════════════════════════════════════ */
const BULAN_OPTIONS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

const TIPE_CLS = {
  Personal: 'bg-blue-100 text-blue-700',
  Group:    'bg-purple-100 text-purple-700',
  Couple:   'bg-pink-100 text-pink-700',
}

const STAGE_CLS = {
  New:       'bg-gray-100 text-gray-600',
  Approach:  'bg-blue-100 text-blue-600',
  Screening: 'bg-purple-100 text-purple-600',
  Invoicing: 'bg-yellow-100 text-yellow-700',
  Closing:   'bg-orange-100 text-orange-600',
  Convert:   'bg-green-100 text-green-700',
  Lost:      'bg-red-100 text-red-600',
}

const SUMBER_OPTS    = ['Website','Referral','Meta Ads','Google Ads','Walk-in','Instagram','LinkedIn','Lainnya']
const PIPELINE_STAGES = ['New','Approach','Screening','Invoicing','Closing','Convert','Lost']
const ROWS_PER_PAGE   = 10


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

function Toast({ message, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg bg-green-600 text-white text-[13px] font-medium">
      {message}
      <button onClick={onClose} className="ml-1 text-white/70 hover:text-white"><X size={13} /></button>
    </div>
  )
}

function formatFollowUp(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`
}

function buildWANumber(raw = '') {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return '62' + digits.slice(1)
  return '62' + digits
}

function openLeadWA(lead, e) {
  e.stopPropagation()
  const cs = getCompanySettings()
  const msg = [
    `Halo *${lead.sapaan} ${lead.nama}*,`,
    '',
    `Saya dari *${cs.namaPerusahaan}* 👋`,
    '',
    `Kami melihat Anda tertarik dengan program *${lead.programDiminati}* bersama kami.`,
    '',
    `Boleh kami jadwalkan sesi konsultasi gratis untuk mengenal program kami lebih lanjut? 🏋️`,
    '',
    `_${cs.namaPerusahaan}_`,
  ].join('\n')
  const waNum = buildWANumber(lead.noHp)
  window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank')
}

const AVATAR_COLORS = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777','#0284C7']
function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
function getAvatarColor(name) {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFFFF
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/* ═══════════════════════════════════════
   StatMini
═══════════════════════════════════════ */
function StatMini({ label, value, sub, accent }) {
  const bCls = { orange:'border-accent', green:'border-success', red:'border-danger', yellow:'border-warning', blue:'border-blue-400' }[accent] || 'border-border'
  const vCls = { orange:'text-accent', green:'text-success', red:'text-danger', yellow:'text-warning', blue:'text-blue-600' }[accent] || 'text-text-primary'
  return (
    <div className={`bg-bg-surface rounded-xl border-[1.5px] ${bCls} px-4 py-3`}>
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${vCls}`}>{value}</div>
      {sub && <div className="text-[11px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  )
}

function LeadsPageBtn({ label, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={[
        'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors',
        active   ? 'bg-[#1E1C43] text-white border-[#1E1C43]'           : '',
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
export default function PPLeadsPage() {
  const navigate = useNavigate()

  const [leads] = useState(() => getStoredLeads())
  const [bulan,       setBulan]       = useState('')
  const [tahun,       setTahun]       = useState('')
  const [tipe,        setTipe]        = useState('')
  const [stage,       setStage]       = useState('')
  const [search,      setSearch]      = useState('')
  const [page,        setPage]        = useState(1)
  const [toast,       setToast]       = useState(null)

  function showToastMsg(msg) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  function handleReset() { setBulan(''); setTahun(''); setTipe(''); setStage(''); setSearch(''); setPage(1) }

  useEffect(() => { setPage(1) }, [bulan, tahun, tipe, stage, search])

  const filtered = useMemo(() => leads
    .filter(l => {
      if (bulan  && !(l.tanggalMasuk || '').includes(bulan))  return false
      if (tahun  && !(l.tanggalMasuk || '').includes(tahun))  return false
      if (tipe   && l.tipe           !== tipe)                 return false
      if (stage  && l.statusPipeline !== stage)                return false
      if (search && !l.nama.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => parseInt(b.id.split('-')[1]) - parseInt(a.id.split('-')[1]))
  , [leads, bulan, tahun, tipe, stage, search])

  const kpiTotal     = leads.length
  const kpiHot       = leads.filter(l => l.statusPipeline === 'Screening' || l.statusPipeline === 'Invoicing').length
  const kpiConverted = leads.filter(l => l.statusPipeline === 'Convert').length
  const kpiLost      = leads.filter(l => l.statusPipeline === 'Lost').length

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const pageRows   = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE)

  return (
    <>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Leads Private Program</h1>
            <p className="text-sm text-text-muted mt-1">Kelola prospek klien Private Program</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/pp/leads/new')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#E05945] hover:bg-[#c94a38] transition-colors"
            >
              <Plus size={15} strokeWidth={2.5} /> Tambah Lead
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatMini label="Total Leads" value={kpiTotal} sub="Semua pipeline" />
          <StatMini label="Hot Leads" value={kpiHot} sub="Screening & Invoicing" accent="orange" />
          <StatMini label="Converted" value={kpiConverted} sub="Jadi klien aktif" accent="green" />
          <StatMini label="Lost" value={kpiLost} sub="Tidak convert" accent="red" />
        </div>

        {/* Filter Bar */}
        <div className="bg-bg-surface border border-border rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
          <select value={bulan} onChange={e => setBulan(e.target.value)}
            className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
            <option value="">Semua Bulan</option>
            {BULAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={tahun} onChange={e => setTahun(e.target.value)}
            className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
            <option value="">Semua Tahun</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
          <select value={tipe} onChange={e => setTipe(e.target.value)}
            className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
            <option value="">Semua Tipe</option>
            <option>Personal</option><option>Group</option><option>Couple</option>
          </select>
          <select value={stage} onChange={e => setStage(e.target.value)}
            className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
            <option value="">Semua Status</option>
            {PIPELINE_STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-bg-page border-[1.5px] border-border rounded-lg px-3 py-[7px] focus-within:border-primary focus-within:bg-white transition-colors">
            <Search size={14} className="text-text-muted shrink-0" />
            <input className="border-none bg-transparent text-xs outline-none w-full text-text-primary placeholder:text-text-muted"
              placeholder="Cari nama klien..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={handleReset} className="px-3.5 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors shrink-0">Reset</button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 420px)', minHeight: '280px' }}>
            <table className="w-full" style={{ minWidth: '1320px' }}>
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    ['Leads ID',110],['Nama',160],['Status Pipeline',120],['Tipe',110],
                    ['Program Diminati',160],['Sumber',120],['Tgl. Follow Up',130],
                    ['PIC',130],['No HP',130],['Tanggal Masuk',120],
                  ].map(([h, mw]) => (
                    <th key={h} style={{minWidth:mw}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-gray-400">Tidak ada data yang cocok dengan filter.</td></tr>
                ) : pageRows.map(lead => (
                  <tr key={lead.id} onClick={() => navigate('/pp/leads/' + lead.id, { state: { lead } })}
                    className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer">
                    <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{lead.id}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background: getAvatarColor(lead.nama) }}>
                          {getInitials(lead.nama)}
                        </div>
                        <span className="text-xs font-medium text-gray-900 whitespace-nowrap">{lead.nama}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><StageBadge stage={lead.statusPipeline} /></td>
                    <td className="px-3 py-2.5"><TipeBadge tipe={lead.tipe} /></td>
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{lead.programDiminati}</td>
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{lead.sumberLead}</td>
                    <td className={`text-xs px-3 py-2.5 whitespace-nowrap ${lead.tanggalFollowUp ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                      {formatFollowUp(lead.tanggalFollowUp)}
                    </td>
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{lead.picEfm}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-600">{lead.noHp}</span>
                        <button
                          onClick={e => openLeadWA(lead, e)}
                          title="Kirim WA"
                          className="w-5 h-5 rounded-full bg-[#25D366] hover:bg-[#1DA851] flex items-center justify-center transition-colors shrink-0">
                          <MessageCircle size={10} className="text-white" />
                        </button>
                      </div>
                    </td>
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{lead.tanggalMasuk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-text-muted">
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

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
