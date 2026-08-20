import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Plus, Search } from 'lucide-react'

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
const PIC_OPTS       = ['Sarah Jenkins','Marcus Chen','Admin EFM']
const PROGRAM_OPTS   = ['12 Sesi - Pro','Tennis','Couple','Tennis Group','Fatloss & Bodyshape','Lainnya']
const PIPELINE_STAGES = ['New','Approach','Screening','Invoicing','Closing','Convert','Lost']

const emptyLeadForm = {
  nama: '', tipe: 'Personal', noHp: '', emailUmum: '',
  sumberLead: '', picEfm: 'Sarah Jenkins', programDiminati: '', catatanAwal: '',
}

/* ═══════════════════════════════════════
   Dummy Data
═══════════════════════════════════════ */
const LEADS_INIT = [
  {
    id: 'LP-0001',
    nama: 'James Wilson',
    tipe: 'Personal',
    noHp: '081234567890',
    sumberLead: 'Website',
    picEfm: 'Sarah Jenkins',
    programDiminati: '12 Sesi - Pro',
    emailUmum: 'james.wilson@email.com',
    catatanAwal: 'Tertarik program fatloss, sudah follow up 2x',
    statusPipeline: 'Convert',
    orderId: 'PP-26-0013',
    tanggalMasuk: '20 Okt 2026',
    tanggalFollowUp: null,
    catatan: 'Sudah convert ke Order PP-26-0013',
    logAktivitas: [
      { status: 'Convert',   oleh: 'Sarah Jenkins', tanggal: '20 Okt 2026', catatan: 'Order berhasil dibuat, PP-26-0013' },
      { status: 'Closing',   oleh: 'Sarah Jenkins', tanggal: '18 Okt 2026', catatan: 'Klien setuju paket 12 sesi' },
      { status: 'Invoicing', oleh: 'Sarah Jenkins', tanggal: '16 Okt 2026', catatan: 'Invoice dikirim, menunggu pembayaran' },
      { status: 'Screening', oleh: 'Sarah Jenkins', tanggal: '14 Okt 2026', catatan: 'Screening kesehatan selesai, BMI normal' },
      { status: 'Approach',  oleh: 'Sarah Jenkins', tanggal: '12 Okt 2026', catatan: 'Follow up via WhatsApp, klien tertarik' },
      { status: 'New',       oleh: 'Sarah Jenkins', tanggal: '10 Okt 2026', catatan: 'Lead masuk dari form website' },
    ],
  },
  {
    id: 'LP-0002',
    nama: 'Dewi Ayu',
    tipe: 'Personal',
    noHp: '087766554433',
    sumberLead: 'Referral',
    picEfm: 'Marcus Chen',
    programDiminati: 'Tennis',
    emailUmum: 'dewi.ayu@email.com',
    catatanAwal: 'Direferensikan oleh klien lama',
    statusPipeline: 'Approach',
    tanggalMasuk: '7 Jun 2026',
    tanggalFollowUp: '2026-07-03',
    catatan: 'Belum respon follow up terakhir',
    logAktivitas: [
      { status: 'Approach', oleh: 'Marcus Chen', tanggal: '1 Jul 2026', catatan: 'Follow up kedua, belum ada respon' },
      { status: 'New',      oleh: 'Marcus Chen', tanggal: '7 Jun 2026', catatan: 'Lead masuk dari referral' },
    ],
  },
  {
    id: 'LP-0003',
    nama: 'Budi & Rina Santoso',
    tipe: 'Couple',
    noHp: '085678901234',
    sumberLead: 'Walk-in',
    picEfm: 'Sarah Jenkins',
    programDiminati: '12 Sesi - Pro',
    emailUmum: 'budi.santoso@email.com',
    catatanAwal: 'Datang langsung ke lokasi, tertarik program couple',
    statusPipeline: 'Screening',
    tanggalMasuk: '6 Okt 2026',
    tanggalFollowUp: '2026-07-05',
    catatan: 'Menunggu jadwal screening kesehatan',
    logAktivitas: [
      { status: 'Screening', oleh: 'Sarah Jenkins', tanggal: '6 Okt 2026', catatan: 'Dijadwalkan screening minggu depan' },
      { status: 'New',       oleh: 'Sarah Jenkins', tanggal: '6 Okt 2026', catatan: 'Walk-in langsung ke lokasi' },
    ],
  },
  {
    id: 'LP-0004',
    nama: 'Rian Maulana (Group Tennis)',
    tipe: 'Group',
    noHp: '087712345678',
    sumberLead: 'Meta Ads',
    picEfm: 'Sarah Jenkins',
    programDiminati: 'Tennis Group',
    emailUmum: 'rian.maulana@email.com',
    catatanAwal: 'Mau daftar grup 4 orang untuk tennis',
    statusPipeline: 'New',
    tanggalMasuk: '15 Jun 2026',
    tanggalFollowUp: '2026-07-02',
    catatan: 'Baru masuk, belum dihubungi',
    logAktivitas: [
      { status: 'New', oleh: 'Sarah Jenkins', tanggal: '15 Jun 2026', catatan: 'Lead masuk dari iklan Meta Ads' },
    ],
  },
  {
    id: 'LP-0005',
    nama: 'Anita Kumar',
    tipe: 'Personal',
    noHp: '081298765432',
    sumberLead: 'Meta Ads',
    picEfm: 'Sarah Jenkins',
    programDiminati: 'Fatloss & Bodyshape',
    emailUmum: 'anita.kumar@email.com',
    catatanAwal: 'Tertarik program fatloss',
    statusPipeline: 'Lost',
    tanggalMasuk: '15 Jun 2026',
    tanggalFollowUp: null,
    catatan: 'Tidak melanjutkan karena budget',
    logAktivitas: [
      { status: 'Lost',     oleh: 'Sarah Jenkins', tanggal: '20 Jun 2026', catatan: 'Klien menyatakan budget tidak sesuai' },
      { status: 'Approach', oleh: 'Sarah Jenkins', tanggal: '16 Jun 2026', catatan: 'Sudah follow up, masih pertimbangan' },
      { status: 'New',      oleh: 'Sarah Jenkins', tanggal: '15 Jun 2026', catatan: 'Lead masuk dari iklan' },
    ],
  },
]

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
  if (!dateStr) return 'Tidak ada jadwal'
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
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

const STAGE_BORDER = {
  Convert:   'border-green-400',
  Lost:      'border-red-400',
  Closing:   'border-orange-400',
  Invoicing: 'border-yellow-400',
  Screening: 'border-purple-400',
  Approach:  'border-blue-400',
  New:       'border-gray-300',
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

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
export default function PPLeadsPage() {
  const navigate = useNavigate()

  const [leads,           setLeads]           = useState(LEADS_INIT)
  const [showAddLead,     setShowAddLead]     = useState(false)
  const [leadForm,        setLeadForm]        = useState({ ...emptyLeadForm })
  const [formErrors,      setFormErrors]      = useState({})
  const [selectedLead,    setSelectedLead]    = useState(null)
  const [showLeadModal,   setShowLeadModal]   = useState(false)
  const [editingPipeline, setEditingPipeline] = useState(false)
  const [newStage,        setNewStage]        = useState('')
  const [newStageTanggal, setNewStageTanggal] = useState('')
  const [newStageCatatan, setNewStageCatatan] = useState('')
  const [bulan,           setBulan]           = useState('')
  const [tahun,           setTahun]           = useState('')
  const [tipe,            setTipe]            = useState('')
  const [stage,           setStage]           = useState('')
  const [search,          setSearch]          = useState('')
  const [toast,           setToast]           = useState(null)
  const [isEditMode,      setIsEditMode]      = useState(false)
  const [editForm,        setEditForm]        = useState({})

  function showToastMsg(msg) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  function handleReset() { setBulan(''); setTahun(''); setTipe(''); setStage(''); setSearch('') }

  function handleOpenDetail(lead) {
    setSelectedLead(lead)
    setShowLeadModal(true)
    setEditingPipeline(false)
    setIsEditMode(false)
    setEditForm({})
    setNewStage(lead.statusPipeline)
    setNewStageTanggal(new Date().toISOString().split('T')[0])
    setNewStageCatatan('')
  }

  function handleCloseModal() {
    setShowLeadModal(false)
    setEditingPipeline(false)
    setIsEditMode(false)
    setEditForm({})
  }

  function handleStartEdit(lead) { setEditForm({ ...lead }); setIsEditMode(true) }
  function handleCancelEdit()    { setIsEditMode(false); setEditForm({}) }
  function handleEditChange(field, value) { setEditForm(prev => ({ ...prev, [field]: value })) }

  function handleSaveEdit() {
    if (!editForm.nama || !editForm.tipe || !editForm.noHp) {
      alert('Nama, tipe, dan no HP wajib diisi.')
      return
    }
    setLeads(prev => prev.map(l => l.id === editForm.id ? { ...editForm } : l))
    setSelectedLead({ ...editForm })
    setIsEditMode(false)
    setEditForm({})
    showToastMsg('✓ Data lead berhasil diperbarui')
  }

  function handleUpdatePipeline() {
    if (!newStageTanggal) { alert('Tanggal wajib diisi'); return }
    const updatedLead = {
      ...selectedLead,
      statusPipeline: newStage,
      logAktivitas: [
        ...(selectedLead.logAktivitas || []),
        { tanggal: newStageTanggal, status: newStage, catatan: newStageCatatan || 'Status diperbarui', oleh: selectedLead.picEfm || '' },
      ],
    }
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? updatedLead : l))
    setSelectedLead(updatedLead)
    setEditingPipeline(false)
    setNewStage(''); setNewStageTanggal(''); setNewStageCatatan('')
    showToastMsg('✓ Status pipeline diperbarui')
  }

  function handleSaveLead() {
    const errors = {}
    if (!leadForm.nama.trim())          errors.nama            = 'Wajib diisi'
    if (!leadForm.noHp.trim())          errors.noHp            = 'Wajib diisi'
    if (!leadForm.emailUmum.trim())     errors.emailUmum       = 'Wajib diisi'
    if (!leadForm.sumberLead)           errors.sumberLead      = 'Wajib dipilih'
    if (!leadForm.programDiminati)      errors.programDiminati = 'Wajib dipilih'
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    const newId = 'LP-' + String(leads.length + 1).padStart(4, '0')
    setLeads(prev => [...prev, {
      ...leadForm,
      id: newId,
      statusPipeline: 'New',
      tanggalMasuk: today,
      tanggalFollowUp: null,
      catatan: '',
      logAktivitas: [{ tanggal: today, status: 'New', catatan: leadForm.catatanAwal || 'Lead baru ditambahkan', oleh: leadForm.picEfm }],
    }])
    setShowAddLead(false)
    setLeadForm({ ...emptyLeadForm })
    setFormErrors({})
    showToastMsg('✓ Lead baru berhasil ditambahkan')
  }

  const filtered = useMemo(() => leads.filter(l => {
    if (bulan  && !(l.tanggalMasuk || '').includes(bulan))  return false
    if (tahun  && !(l.tanggalMasuk || '').includes(tahun))  return false
    if (tipe   && l.tipe           !== tipe)                 return false
    if (stage  && l.statusPipeline !== stage)                return false
    if (search && !l.nama.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [leads, bulan, tahun, tipe, stage, search])

  const kpiTotal     = leads.length
  const kpiHot       = leads.filter(l => l.statusPipeline === 'Screening' || l.statusPipeline === 'Invoicing').length
  const kpiConverted = leads.filter(l => l.statusPipeline === 'Convert').length
  const kpiLost      = leads.filter(l => l.statusPipeline === 'Lost').length

  function fieldCls(key) {
    return `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43] ${formErrors[key] ? 'border-red-400' : 'border-gray-200'}`
  }

  return (
    <>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Leads Private Program</h1>
            <p className="text-sm text-text-muted mt-1">Kelola prospek klien Private Program</p>
          </div>
          <button
            onClick={() => { setLeadForm({ ...emptyLeadForm }); setFormErrors({}); setShowAddLead(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-[#E05945] hover:bg-[#C94A38] transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> Tambah Lead
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
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
          <button onClick={handleReset} className="px-3.5 py-[7px] bg-primary hover:bg-primary-2 text-white text-xs font-semibold rounded-lg transition-colors shrink-0">Reset</button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full" style={{ minWidth: '1270px' }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    ['Leads ID',100],['Nama',160],['Tipe',100],['No HP',140],
                    ['Program Diminati',160],['Sumber',120],['PIC EFM',130],
                    ['Status Pipeline',130],['Tanggal Masuk',120],['Aksi',110],
                  ].map(([h, mw]) => (
                    <th key={h} style={{minWidth:mw}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-gray-400">Tidak ada data yang cocok dengan filter.</td></tr>
                ) : filtered.map(lead => (
                  <tr key={lead.id} onClick={() => handleOpenDetail(lead)}
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
                    <td className="px-3 py-2.5"><TipeBadge tipe={lead.tipe} /></td>
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{lead.noHp}</td>
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{lead.programDiminati}</td>
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{lead.sumberLead}</td>
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{lead.picEfm}</td>
                    <td className="px-3 py-2.5"><StageBadge stage={lead.statusPipeline} /></td>
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{lead.tanggalMasuk}</td>
                    <td className="px-3 py-2.5">
                      <button onClick={e => { e.stopPropagation(); handleOpenDetail(lead) }}
                        className="text-xs text-[#1E1C43] font-medium hover:underline whitespace-nowrap">
                        Detail →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <p className="text-[12px] text-text-muted">
              Menampilkan <span className="font-semibold text-text-primary">{filtered.length}</span> dari{' '}
              <span className="font-semibold text-text-primary">{leads.length}</span> leads
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          MODAL: TAMBAH LEAD BARU
      ═══════════════════════════════════════ */}
      {showAddLead && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#1E1C43]">Tambah Lead Baru</h2>
              <button onClick={() => { setShowAddLead(false); setLeadForm({ ...emptyLeadForm }); setFormErrors({}) }}
                className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Nama Klien <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={leadForm.nama}
                    onChange={e => { setLeadForm(p => ({ ...p, nama: e.target.value })); setFormErrors(p => ({ ...p, nama: '' })) }}
                    placeholder="Nama lengkap klien"
                    className={fieldCls('nama')}
                  />
                  {formErrors.nama && <p className="text-red-500 text-[10px] mt-1">{formErrors.nama}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Tipe <span className="text-red-500">*</span>
                  </label>
                  <select value={leadForm.tipe} onChange={e => setLeadForm(p => ({ ...p, tipe: e.target.value }))}
                    className={fieldCls('tipe')}>
                    <option>Personal</option><option>Group</option><option>Couple</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Sumber Lead <span className="text-red-500">*</span>
                  </label>
                  <select value={leadForm.sumberLead}
                    onChange={e => { setLeadForm(p => ({ ...p, sumberLead: e.target.value })); setFormErrors(p => ({ ...p, sumberLead: '' })) }}
                    className={fieldCls('sumberLead')}>
                    <option value="">Pilih Sumber...</option>
                    {SUMBER_OPTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  {formErrors.sumberLead && <p className="text-red-500 text-[10px] mt-1">{formErrors.sumberLead}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    No HP / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={leadForm.noHp}
                    onChange={e => { setLeadForm(p => ({ ...p, noHp: e.target.value })); setFormErrors(p => ({ ...p, noHp: '' })) }}
                    placeholder="08xx-xxxx-xxxx"
                    className={fieldCls('noHp')}
                  />
                  {formErrors.noHp && <p className="text-red-500 text-[10px] mt-1">{formErrors.noHp}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Email Umum <span className="text-red-500">*</span>
                  </label>
                  <input type="email" value={leadForm.emailUmum}
                    onChange={e => { setLeadForm(p => ({ ...p, emailUmum: e.target.value })); setFormErrors(p => ({ ...p, emailUmum: '' })) }}
                    placeholder="email@example.com"
                    className={fieldCls('emailUmum')}
                  />
                  {formErrors.emailUmum && <p className="text-red-500 text-[10px] mt-1">{formErrors.emailUmum}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Program Diminati <span className="text-red-500">*</span>
                  </label>
                  <select value={leadForm.programDiminati}
                    onChange={e => { setLeadForm(p => ({ ...p, programDiminati: e.target.value })); setFormErrors(p => ({ ...p, programDiminati: '' })) }}
                    className={fieldCls('programDiminati')}>
                    <option value="">Pilih Program...</option>
                    {PROGRAM_OPTS.map(p => <option key={p}>{p}</option>)}
                  </select>
                  {formErrors.programDiminati && <p className="text-red-500 text-[10px] mt-1">{formErrors.programDiminati}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">PIC EFM</label>
                  <select value={leadForm.picEfm} onChange={e => setLeadForm(p => ({ ...p, picEfm: e.target.value }))}
                    className={fieldCls('picEfm')}>
                    {PIC_OPTS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Catatan Awal</label>
                  <textarea value={leadForm.catatanAwal} onChange={e => setLeadForm(p => ({ ...p, catatanAwal: e.target.value }))}
                    rows={3} placeholder="Sumber lead, konteks awal, atau catatan penting..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43] resize-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setShowAddLead(false); setLeadForm({ ...emptyLeadForm }); setFormErrors({}) }}
                className="border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleSaveLead}
                className="bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">Simpan Lead</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          MODAL: DETAIL / EDIT LEAD
      ═══════════════════════════════════════ */}
      {showLeadModal && selectedLead && (
        <div
          className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) handleCloseModal() }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-[10px] text-gray-400 mb-0.5">{selectedLead.id}</p>
                <h2 className="text-base font-bold text-[#1E1C43]">{selectedLead.nama}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <TipeBadge tipe={selectedLead.tipe} />
                  <StageBadge stage={selectedLead.statusPipeline} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditMode ? (
                  <button onClick={() => handleStartEdit(selectedLead)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#1E1C43] text-[#1E1C43] rounded-lg hover:bg-[#1E1C43] hover:text-white transition-colors">
                    ✏️ Edit Data
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                    ✏️ Mode Edit
                  </span>
                )}
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 max-h-[65vh] overflow-y-auto">

              {/* ── VIEW MODE ── */}
              {!isEditMode && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">No HP / WhatsApp</p>
                      <a href={`https://wa.me/62${selectedLead.noHp.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-[#1E1C43] hover:underline">{selectedLead.noHp}</a>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Sumber Lead</p>
                      <p className="text-sm text-gray-800">{selectedLead.sumberLead || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Program Diminati</p>
                      <p className="text-sm text-gray-800">{selectedLead.programDiminati || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">PIC EFM</p>
                      <p className="text-sm text-gray-800">{selectedLead.picEfm || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Umum</p>
                      {selectedLead.emailUmum
                        ? <a href={`mailto:${selectedLead.emailUmum}`} className="text-sm text-[#1E1C43] hover:underline">{selectedLead.emailUmum}</a>
                        : <p className="text-sm text-gray-400 italic">—</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tanggal Masuk</p>
                      <p className="text-sm text-gray-800">{selectedLead.tanggalMasuk || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tanggal Follow Up Berikutnya</p>
                      <p className={`text-sm ${selectedLead.tanggalFollowUp ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                        {formatFollowUp(selectedLead.tanggalFollowUp)}
                      </p>
                    </div>
                    <div />
                    {selectedLead.catatanAwal && (
                      <div className="col-span-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Catatan Awal</p>
                        <p className="text-sm text-gray-700">{selectedLead.catatanAwal}</p>
                      </div>
                    )}
                    {selectedLead.catatan && (
                      <div className="col-span-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Catatan</p>
                        <p className="text-sm text-gray-700">{selectedLead.catatan}</p>
                      </div>
                    )}
                    {selectedLead.statusPipeline === 'Convert' && selectedLead.orderId && (
                      <div className="col-span-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Order Terkait</p>
                        <button
                          onClick={() => { setShowLeadModal(false); navigate('/pp/orders/' + selectedLead.orderId) }}
                          className="text-sm font-semibold text-[#1E1C43] hover:underline flex items-center gap-1.5">
                          #{selectedLead.orderId} →
                        </button>
                      </div>
                    )}
                  </div>

                  <hr className="border-gray-100" />

                  {/* Status Pipeline */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status Pipeline</p>
                      <button
                        onClick={() => {
                          const next = !editingPipeline
                          setEditingPipeline(next)
                          if (next) {
                            setNewStage(selectedLead.statusPipeline)
                            setNewStageTanggal(new Date().toISOString().split('T')[0])
                            setNewStageCatatan('')
                          }
                        }}
                        className="text-xs text-[#1E1C43] hover:underline font-medium"
                      >
                        {editingPipeline ? 'Batal' : '✏️ Update Status'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <StageBadge stage={selectedLead.statusPipeline} />
                      <span className="text-xs text-gray-400">sejak {selectedLead.tanggalMasuk}</span>
                    </div>
                    {editingPipeline && (
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Status Baru</label>
                          <select value={newStage} onChange={e => setNewStage(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43]">
                            {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Tanggal</label>
                          <input type="date" value={newStageTanggal} onChange={e => setNewStageTanggal(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43]" />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Catatan</label>
                          <input type="text" value={newStageCatatan} onChange={e => setNewStageCatatan(e.target.value)}
                            placeholder="Catatan perubahan status..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43]" />
                        </div>
                        <button onClick={handleUpdatePipeline}
                          className="w-full bg-[#1E1C43] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#2d2b5e] transition-colors">
                          ✓ Simpan Perubahan Status
                        </button>
                      </div>
                    )}
                  </div>

                  <hr className="border-gray-100" />

                  {/* Log Aktivitas */}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Log Aktivitas</p>
                    <div className="space-y-0">
                      {[...(selectedLead.logAktivitas || [])].reverse().map((log, i, arr) => (
                        <div key={i} className={`pl-4 pb-4 border-l-2 ${STAGE_BORDER[log.status] ?? 'border-gray-300'} ${i === arr.length - 1 ? 'border-transparent' : ''}`}>
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${STAGE_CLS[log.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                {log.status}
                              </span>
                              {log.oleh && <span className="text-[10px] text-gray-400">— {log.oleh}</span>}
                            </div>
                            <span className="text-[10px] text-gray-400">{log.tanggal}</span>
                          </div>
                          <p className="text-xs text-gray-600">{log.catatan}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── EDIT MODE ── */}
              {isEditMode && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-[#1E1C43] uppercase tracking-wide mb-3">Data Klien</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Nama Klien <span className="text-red-500">*</span>
                      </label>
                      <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.nama || ''} onChange={e => handleEditChange('nama', e.target.value)} placeholder="Nama lengkap klien" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tipe <span className="text-red-500">*</span></label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.tipe || ''} onChange={e => handleEditChange('tipe', e.target.value)}>
                        <option>Personal</option><option>Group</option><option>Couple</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">No HP <span className="text-red-500">*</span></label>
                      <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.noHp || ''} onChange={e => handleEditChange('noHp', e.target.value)} placeholder="08xx-xxxx-xxxx" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Umum</label>
                      <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.emailUmum || ''} onChange={e => handleEditChange('emailUmum', e.target.value)} placeholder="email@example.com" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Sumber Lead</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.sumberLead || ''} onChange={e => handleEditChange('sumberLead', e.target.value)}>
                        <option value="">Pilih Sumber...</option>
                        {SUMBER_OPTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Program Diminati</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.programDiminati || ''} onChange={e => handleEditChange('programDiminati', e.target.value)}>
                        <option value="">Pilih Program...</option>
                        {PROGRAM_OPTS.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">PIC EFM</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.picEfm || ''} onChange={e => handleEditChange('picEfm', e.target.value)}>
                        {PIC_OPTS.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tanggal Follow Up</label>
                      <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.tanggalFollowUp || ''} onChange={e => handleEditChange('tanggalFollowUp', e.target.value || null)} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Catatan Awal</label>
                      <textarea rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] resize-none"
                        value={editForm.catatanAwal || ''} onChange={e => handleEditChange('catatanAwal', e.target.value)}
                        placeholder="Catatan awal tentang lead..." />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer VIEW mode */}
            {!isEditMode && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <button onClick={handleCloseModal}
                  className="border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
                  Tutup
                </button>
                {selectedLead.statusPipeline !== 'Lost' && (
                  <button
                    onClick={() => { handleCloseModal(); navigate('/pp/orders/new', { state: { namaKlien: selectedLead.nama, paket: selectedLead.programDiminati, leadId: selectedLead.id } }) }}
                    className="inline-flex items-center gap-2 bg-[#E05945] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#c94a38] transition-colors"
                  >
                    Buat Order →
                  </button>
                )}
              </div>
            )}

            {/* Footer EDIT mode */}
            {isEditMode && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
                <button onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  ✕ Batal
                </button>
                <button onClick={handleSaveEdit}
                  className="px-5 py-2 text-sm font-semibold bg-[#1E1C43] text-white rounded-lg hover:bg-[#2d2b5e] transition-colors">
                  💾 Simpan Perubahan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
