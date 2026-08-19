import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Plus, RotateCcw, Search, ExternalLink } from 'lucide-react'

/* ═══════════════════════════════════════
   Constants
═══════════════════════════════════════ */
const BULAN_OPTIONS = ['Semua Bulan', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const TAHUN_OPTIONS = ['Semua Tahun', '2026', '2025']
const BULAN_IDX     = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

const LEADS_INIT = [
  {
    id: 'EL-001', namaKlien: 'Yayasan Kanker Indonesia', tipeKlien: 'Foundation', kota: 'Jakarta Selatan',
    namaEvent: 'Health Run for Hope 2026', jenisEvent: 'Charity Run',
    emailUmum: 'info@yayasankanker.or.id', sumberLead: 'Referral', picSalesEFM: 'Bagoes',
    stage: 'Converted', tanggal: '2026-05-01', catatanAwal: 'Referral dari jaringan nonprofit kesehatan',
    teleponUmum: '021-3334567', alamatLengkap: 'Jl. Gatot Subroto No. 55, Jakarta Selatan',
    linkGoogleMaps: '', namaKoordinator: 'Ibu Ratna', jabatanKoordinator: 'Program Director',
    waKoordinator: '081234567890', emailKoordinator: 'ratna@yayasankanker.or.id',
    logAktivitas: [
      { tanggal: '2026-05-01', stage: 'New',      catatan: 'Lead masuk via referral komunitas kesehatan', picEFM: 'Bagoes' },
      { tanggal: '2026-05-10', stage: 'Approach', catatan: 'Kirim company profile event organizer',       picEFM: 'Bagoes' },
      { tanggal: '2026-05-20', stage: 'Closing',  catatan: 'Proposal diterima, jadwalkan konsultasi',     picEFM: 'Bagoes' },
      { tanggal: '2026-06-01', stage: 'Converted', catatan: 'Deal ditandatangani, order dibuat',          picEFM: 'Bagoes' },
    ],
    konsultasiId: 'KNS-001', orderId: 'EO-001',
  },
  {
    id: 'EL-002', namaKlien: 'PT. Garuda Nusa Tbk', tipeKlien: 'Corporate', kota: 'Jakarta Pusat',
    namaEvent: 'Corporate Fun Run 2026', jenisEvent: 'Fun Run',
    emailUmum: 'hrd@garudanusa.co.id', sumberLead: 'Cold Email', picSalesEFM: 'Emma',
    stage: 'Converted', tanggal: '2026-05-15', catatanAwal: 'Cold email ke divisi HRD, dibalas GM HR',
    teleponUmum: '021-5557890', alamatLengkap: 'Jl. Jend. Sudirman Kav. 56, Jakarta Pusat',
    linkGoogleMaps: '', namaKoordinator: 'Bpk. Hendra', jabatanKoordinator: 'HR Director',
    waKoordinator: '082112345678', emailKoordinator: 'hendra.hr@garudanusa.co.id',
    logAktivitas: [
      { tanggal: '2026-05-15', stage: 'New',          catatan: 'Cold email ke HRD Garuda Nusa',            picEFM: 'Emma' },
      { tanggal: '2026-05-22', stage: 'Approach',     catatan: 'Presentasi online ke HR Director',         picEFM: 'Emma' },
      { tanggal: '2026-06-01', stage: 'Converted',    catatan: 'Proposal disetujui, kontrak ditandatangani', picEFM: 'Emma' },
    ],
    konsultasiId: 'KNS-002', orderId: 'EO-002',
  },
  {
    id: 'EL-003', namaKlien: 'Brand Tropicana Slim', tipeKlien: 'Brand', kota: 'Tangerang Selatan',
    namaEvent: 'Healthy Living Expo', jenisEvent: 'Exhibition',
    emailUmum: 'marketing@tropicanaslim.co.id', sumberLead: 'LinkedIn', picSalesEFM: 'Bagoes',
    stage: 'Proposal', tanggal: '2026-06-05', catatanAwal: 'Kontak via LinkedIn dari Brand Manager',
    teleponUmum: '021-6667890', alamatLengkap: 'Kawasan ICE BSD City, Tangerang Selatan',
    linkGoogleMaps: '', namaKoordinator: 'Bpk. Dani', jabatanKoordinator: 'Brand Manager',
    waKoordinator: '081398765432', emailKoordinator: 'dani@tropicanaslim.co.id',
    logAktivitas: [
      { tanggal: '2026-06-05', stage: 'New',      catatan: 'Kontak masuk dari LinkedIn',           picEFM: 'Bagoes' },
      { tanggal: '2026-06-10', stage: 'Proposal', catatan: 'Konsultasi selesai, kirim proposal EFM', picEFM: 'Bagoes' },
    ],
    konsultasiId: 'KNS-003', orderId: null,
  },
  {
    id: 'EL-004', namaKlien: 'Komunitas Pelari Jakarta', tipeKlien: 'Community', kota: 'Jakarta Pusat',
    namaEvent: 'Jakarta Night Run 2026', jenisEvent: 'Night Run',
    emailUmum: 'info@komunitas-pelari.id', sumberLead: 'Instagram', picSalesEFM: 'Emma',
    stage: 'Lost', tanggal: '2026-06-08', catatanAwal: 'DM Instagram dari ketua komunitas',
    teleponUmum: '', alamatLengkap: 'Monas, Jakarta Pusat', linkGoogleMaps: '',
    namaKoordinator: 'Bpk. Fajar', jabatanKoordinator: 'Ketua Komunitas',
    waKoordinator: '085678901234', emailKoordinator: '',
    logAktivitas: [
      { tanggal: '2026-06-08', stage: 'New',      catatan: 'DM Instagram, budget sangat terbatas',  picEFM: 'Emma' },
      { tanggal: '2026-06-14', stage: 'Lost',     catatan: 'Tidak lanjut — margin tidak memenuhi threshold', picEFM: 'Emma' },
    ],
    konsultasiId: 'KNS-004', orderId: null,
  },
  {
    id: 'EL-005', namaKlien: 'Dinas Pemuda & Olahraga DKI', tipeKlien: 'Government', kota: 'Jakarta Pusat',
    namaEvent: 'Hari Olahraga Nasional DKI', jenisEvent: 'Mass Event',
    emailUmum: 'info@dinpora.jakarta.go.id', sumberLead: 'Referral', picSalesEFM: 'Bagoes',
    stage: 'Closing', tanggal: '2026-06-10', catatanAwal: 'Referral dari koneksi pemerintah daerah',
    teleponUmum: '021-3451234', alamatLengkap: 'Jl. Medan Merdeka Utara No. 14, Jakarta Pusat',
    linkGoogleMaps: '', namaKoordinator: 'Bpk. Eko Prasetyo', jabatanKoordinator: 'Kepala Bidang Olahraga',
    waKoordinator: '087865432100', emailKoordinator: 'eko.prasetyo@dinpora.jakarta.go.id',
    logAktivitas: [
      { tanggal: '2026-06-10', stage: 'New',          catatan: 'Lead masuk via referral pemerintah',         picEFM: 'Bagoes' },
      { tanggal: '2026-06-15', stage: 'Presentation', catatan: 'Presentasi resmi ke Kepala Bidang Olahraga', picEFM: 'Bagoes' },
      { tanggal: '2026-06-18', stage: 'Closing',      catatan: 'Konsultasi selesai, masuk proses tender',    picEFM: 'Bagoes' },
    ],
    konsultasiId: 'KNS-005', orderId: 'EO-003',
  },
  {
    id: 'EL-006', namaKlien: 'PT. Telkom Indonesia', tipeKlien: 'Corporate', kota: 'Jakarta Selatan',
    namaEvent: 'Telkom SportFest 2026', jenisEvent: 'Corporate Sports Day',
    emailUmum: 'hrd@telkom.co.id', sumberLead: 'Cold Email', picSalesEFM: 'Bagoes',
    stage: 'Approach', tanggal: '2026-06-20', catatanAwal: 'Cold email ke tim HRD Telkom, direspons positif',
    teleponUmum: '021-1234567', alamatLengkap: 'Jl. Japati No. 1, Jakarta Selatan', linkGoogleMaps: '',
    namaKoordinator: '', jabatanKoordinator: '', waKoordinator: '', emailKoordinator: '',
    logAktivitas: [
      { tanggal: '2026-06-20', stage: 'New',      catatan: 'Cold email ke HRD Telkom Indonesia',  picEFM: 'Bagoes' },
      { tanggal: '2026-06-25', stage: 'Approach', catatan: 'Balas email — minta meeting awal',    picEFM: 'Bagoes' },
    ],
    konsultasiId: null, orderId: null,
  },
]

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
  New:          'bg-gray-100 text-gray-600',
  Approach:     'bg-blue-100 text-blue-700',
  Presentation: 'bg-yellow-100 text-yellow-700',
  Proposal:     'bg-purple-100 text-purple-700',
  Closing:      'bg-orange-100 text-[#E05945]',
  Converted:    'bg-green-100 text-green-700',
  Lost:         'bg-red-100 text-red-600',
}

const STAGE_DOT = {
  New:             'bg-gray-400',
  Approach:        'bg-blue-500',
  Presentation:    'bg-yellow-500',
  Proposal:        'bg-purple-500',
  Closing:         'bg-[#E05945]',
  Converted:       'bg-green-500',
  Lost:            'bg-red-400',
  'Existing Client':'bg-gray-400',
}

const emptyLeadForm = {
  namaKlien: '', tipeKlien: 'Corporate', kota: '', emailUmum: '',
  namaEvent: '', jenisEvent: '',
  sumberLead: 'Referral', picSalesEFM: 'Bagoes', catatanAwal: '',
  teleponUmum: '', alamatLengkap: '', linkGoogleMaps: '',
  namaKoordinator: '', jabatanKoordinator: '', waKoordinator: '', emailKoordinator: '',
}

function formatTgl(iso) {
  if (!iso) return '-'
  try { return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return iso }
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

function Toast({ message, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg bg-green-600 text-white text-[13px] font-medium">
      {message}
      <button onClick={onClose} className="ml-1 text-white/70 hover:text-white"><X size={13} /></button>
    </div>
  )
}

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
export default function EventLeadsPage() {
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

  function handleReset() {
    setBulan(''); setTahun(''); setTipe(''); setStage(''); setSearch('')
  }

  function handleOpenDetail(lead) {
    setSelectedLead(lead)
    setShowLeadModal(true)
    setEditingPipeline(false)
    setIsEditMode(false)
    setEditForm({})
    setNewStage(lead.stage)
    setNewStageTanggal(new Date().toISOString().split('T')[0])
    setNewStageCatatan('')
  }

  function handleCloseModal() { setShowLeadModal(false); setEditingPipeline(false); setIsEditMode(false); setEditForm({}) }

  function handleStartEdit(lead) {
    setEditForm({ ...lead })
    setIsEditMode(true)
    setTimeout(() => {
      const el = document.querySelector('.modal-scrollable-content')
      if (el) el.scrollTop = 0
    }, 50)
  }

  function handleCancelEdit() {
    setIsEditMode(false)
    setEditForm({})
  }

  function handleSaveEdit() {
    if (!editForm.namaKlien || !editForm.tipeKlien || !editForm.kota || !editForm.emailUmum) {
      alert('Nama klien, tipe klien, kota, dan email umum wajib diisi.')
      return
    }
    setLeads(prev => prev.map(l => l.id === editForm.id ? { ...editForm } : l))
    setSelectedLead({ ...editForm })
    setIsEditMode(false)
    setEditForm({})
    showToastMsg('✓ Data lead berhasil diperbarui')
  }

  function handleEditChange(field, value) {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  function handleUpdatePipeline() {
    if (!newStageTanggal) { alert('Tanggal wajib diisi'); return }
    const updatedLead = {
      ...selectedLead,
      stage: newStage,
      tanggal: newStageTanggal,
      logAktivitas: [
        ...(selectedLead.logAktivitas || []),
        { tanggal: newStageTanggal, stage: newStage, catatan: newStageCatatan || 'Status diperbarui', picEFM: selectedLead.picSalesEFM || '' },
      ],
    }
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? updatedLead : l))
    setSelectedLead(updatedLead)
    setEditingPipeline(false)
    setNewStage(''); setNewStageTanggal(''); setNewStageCatatan('')
  }

  function validateForm(form) {
    const errors = {}
    if (!form.namaKlien.trim())   errors.namaKlien   = 'Wajib diisi'
    if (!form.tipeKlien)          errors.tipeKlien   = 'Wajib dipilih'
    if (!form.kota.trim())        errors.kota        = 'Wajib diisi'
    if (!form.emailUmum.trim())   errors.emailUmum   = 'Wajib diisi'
    if (!form.sumberLead)         errors.sumberLead  = 'Wajib dipilih'
    if (!form.picSalesEFM)        errors.picSalesEFM = 'Wajib dipilih'
    return errors
  }

  function handleSaveLead() {
    const errors = validateForm(leadForm)
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    const today = new Date().toISOString().split('T')[0]
    const newId = 'EL-' + String(leads.length + 1).padStart(3, '0')
    setLeads(prev => [...prev, {
      ...leadForm,
      id: newId,
      stage: 'New',
      tanggal: today,
      konsultasiId: null,
      orderId: null,
      logAktivitas: [{
        tanggal: today,
        stage: 'New',
        catatan: leadForm.catatanAwal || 'Lead baru ditambahkan',
        picEFM: leadForm.picSalesEFM,
      }],
    }])
    setShowAddLead(false)
    setLeadForm({ ...emptyLeadForm })
    setFormErrors({})
    showToastMsg('✓ Lead baru berhasil ditambahkan')
  }

  const filtered = useMemo(() => leads.filter(l => {
    if (bulan) {
      const m = BULAN_IDX[new Date(l.tanggal).getMonth()]
      if (m !== bulan) return false
    }
    if (tahun) {
      if (String(new Date(l.tanggal).getFullYear()) !== tahun) return false
    }
    if (tipe  && l.tipeKlien !== tipe)  return false
    if (stage && l.stage     !== stage) return false
    if (search && !l.namaKlien.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [leads, bulan, tahun, tipe, stage, search])

  const kpiTotal     = leads.length
  const kpiHot       = leads.filter(l => l.stage === 'Proposal' || l.stage === 'Closing').length
  const kpiConverted = leads.filter(l => l.stage === 'Converted').length
  const kpiLost      = leads.filter(l => l.stage === 'Lost').length

  function fieldCls(key) {
    return `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43] ${formErrors[key] ? 'border-red-400' : 'border-gray-200'}`
  }

  return (
    <>
      <div className="p-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Leads Event</h1>
            <p className="text-sm text-text-muted mt-1">Kelola prospek klien Event — Corporate, Foundation, Government &amp; lainnya</p>
          </div>
          <button
            onClick={() => { setLeadForm({ ...emptyLeadForm }); setFormErrors({}); setShowAddLead(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-[#E05945] hover:bg-[#C94A38] transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> Tambah Lead
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Total Leads</p>
            <p className="text-[28px] font-bold text-text-primary leading-none">{kpiTotal}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Semua pipeline</p>
          </div>
          <div className="bg-white rounded-2xl border-2 border-[#E05945] px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Hot Leads</p>
            <p className="text-[28px] font-bold text-[#E05945] leading-none">{kpiHot}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Proposal &amp; Closing</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Converted</p>
            <p className="text-[28px] font-bold text-green-600 leading-none">{kpiConverted}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Jadi klien aktif</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Lost</p>
            <p className="text-[28px] font-bold text-red-500 leading-none">{kpiLost}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Tidak closing</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <select value={bulan} onChange={e => setBulan(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
              <option value="">Semua Bulan</option>
              {BULAN_OPTIONS.slice(1).map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={tahun} onChange={e => setTahun(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
              <option value="">Semua Tahun</option>
              {TAHUN_OPTIONS.slice(1).map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={tipe} onChange={e => setTipe(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
              <option value="">Semua Tipe</option>
              <option>Corporate</option><option>Foundation</option><option>Government</option>
              <option>Brand</option><option>Community</option><option>Private</option><option>Individual</option>
            </select>
            <select value={stage} onChange={e => setStage(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
              <option value="">Semua Status</option>
              <option>New</option><option>Approach</option><option>Presentation</option>
              <option>Proposal</option><option>Closing</option><option>Converted</option><option>Lost</option>
            </select>
            <div className="flex items-center gap-3 ml-auto">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari nama perusahaan..."
                  className="pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[220px]" />
              </div>
              <button onClick={handleReset}
                className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs px-3 py-2 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors">
                <RotateCcw size={12} />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full rounded-xl">
            <table className="w-full" style={{ minWidth: '1200px' }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['ID', 'Nama Klien', 'Tipe', 'Nama Event', 'Kota', 'Sumber', 'PIC EFM', 'Stage', 'Koordinator', 'No. WA', 'Tanggal', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={12} className="px-4 py-10 text-center text-sm text-gray-400">Tidak ada data yang cocok dengan filter.</td></tr>
                ) : filtered.map(lead => (
                  <tr key={lead.id} onClick={() => handleOpenDetail(lead)}
                    className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer">
                    <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{lead.id}</td>
                    <td className="text-xs font-medium text-gray-900 px-3 py-2.5 whitespace-nowrap">{lead.namaKlien}</td>
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
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">
                      {lead.waKoordinator || '-'}
                    </td>
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{formatTgl(lead.tanggal)}</td>
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

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#1E1C43]">Tambah Lead Baru</h2>
              <button onClick={() => { setShowAddLead(false); setLeadForm({ ...emptyLeadForm }); setFormErrors({}) }}
                className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* SECTION A — DATA PERUSAHAAN */}
              <div className="mb-5">
                <p className="text-xs font-bold text-[#1E1C43] uppercase tracking-wide mb-3">
                  Data Perusahaan
                </p>
                <div className="grid grid-cols-2 gap-4">

                  {/* Nama Klien — full width */}
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                      Nama Klien / Penyelenggara <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={leadForm.namaKlien}
                      onChange={e => { setLeadForm(p => ({ ...p, namaKlien: e.target.value })); setFormErrors(p => ({ ...p, namaKlien: '' })) }}
                      placeholder="PT. / Yayasan / Komunitas / Dinas..."
                      className={fieldCls('namaKlien')}
                    />
                    {formErrors.namaKlien && <p className="text-red-500 text-[10px] mt-1">{formErrors.namaKlien}</p>}
                  </div>

                  {/* Tipe Klien | Sumber Lead */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                      Tipe Klien <span className="text-red-500">*</span>
                    </label>
                    <select value={leadForm.tipeKlien}
                      onChange={e => { setLeadForm(p => ({ ...p, tipeKlien: e.target.value })); setFormErrors(p => ({ ...p, tipeKlien: '' })) }}
                      className={fieldCls('tipeKlien')}>
                      <option>Corporate</option><option>Foundation</option><option>Government</option>
                      <option>Brand</option><option>Community</option><option>Private</option><option>Individual</option>
                    </select>
                    {formErrors.tipeKlien && <p className="text-red-500 text-[10px] mt-1">{formErrors.tipeKlien}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                      Sumber Lead <span className="text-red-500">*</span>
                    </label>
                    <select value={leadForm.sumberLead}
                      onChange={e => { setLeadForm(p => ({ ...p, sumberLead: e.target.value })); setFormErrors(p => ({ ...p, sumberLead: '' })) }}
                      className={fieldCls('sumberLead')}>
                      <option>Referral</option><option>Cold Email</option><option>Google / Web</option>
                      <option>LinkedIn</option><option>Instagram</option><option>Walk-in</option>
                      <option>Existing Client</option><option>Lainnya</option>
                    </select>
                    {formErrors.sumberLead && <p className="text-red-500 text-[10px] mt-1">{formErrors.sumberLead}</p>}
                  </div>

                  {/* Kota / Area | PIC Sales EFM */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                      Kota / Area <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={leadForm.kota}
                      onChange={e => { setLeadForm(p => ({ ...p, kota: e.target.value })); setFormErrors(p => ({ ...p, kota: '' })) }}
                      placeholder="Jakarta Selatan"
                      className={fieldCls('kota')}
                    />
                    {formErrors.kota && <p className="text-red-500 text-[10px] mt-1">{formErrors.kota}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                      PIC Sales EFM <span className="text-red-500">*</span>
                    </label>
                    <select value={leadForm.picSalesEFM}
                      onChange={e => { setLeadForm(p => ({ ...p, picSalesEFM: e.target.value })); setFormErrors(p => ({ ...p, picSalesEFM: '' })) }}
                      className={fieldCls('picSalesEFM')}>
                      <option>Bagoes</option><option>Emma</option><option>Lainnya</option>
                    </select>
                    {formErrors.picSalesEFM && <p className="text-red-500 text-[10px] mt-1">{formErrors.picSalesEFM}</p>}
                  </div>

                  {/* Email Umum — full width */}
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                      Email Umum <span className="text-red-500">*</span>
                      <span className="ml-2 text-gray-400 normal-case font-normal">Email untuk kirim compro/proposal</span>
                    </label>
                    <input type="email" value={leadForm.emailUmum}
                      onChange={e => { setLeadForm(p => ({ ...p, emailUmum: e.target.value })); setFormErrors(p => ({ ...p, emailUmum: '' })) }}
                      placeholder="info@perusahaan.co.id"
                      className={fieldCls('emailUmum')}
                    />
                    {formErrors.emailUmum && <p className="text-red-500 text-[10px] mt-1">{formErrors.emailUmum}</p>}
                  </div>

                  {/* Catatan Awal — full width */}
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Catatan Awal</label>
                    <textarea value={leadForm.catatanAwal}
                      onChange={e => setLeadForm(p => ({ ...p, catatanAwal: e.target.value }))}
                      rows={3}
                      placeholder="Sumber lead, konteks awal, atau catatan penting..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43] resize-none"
                    />
                  </div>

                  {/* No. Telepon Umum | Alamat Lengkap */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">No. Telepon Umum</label>
                    <input type="text" value={leadForm.teleponUmum}
                      onChange={e => setLeadForm(p => ({ ...p, teleponUmum: e.target.value }))}
                      placeholder="021-xxxx"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Alamat Lengkap</label>
                    <input type="text" value={leadForm.alamatLengkap}
                      onChange={e => setLeadForm(p => ({ ...p, alamatLengkap: e.target.value }))}
                      placeholder="Jl. Nama Jalan No. XX"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43]"
                    />
                  </div>

                  {/* Link Google Maps — full width */}
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Link Google Maps</label>
                    <input type="url" value={leadForm.linkGoogleMaps}
                      onChange={e => setLeadForm(p => ({ ...p, linkGoogleMaps: e.target.value }))}
                      placeholder="https://maps.google.com/..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43]"
                    />
                  </div>

                </div>
              </div>

              {/* SECTION B — KONTAK KOORDINATOR KLIEN */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs font-bold text-[#1E1C43] uppercase tracking-wide">Kontak Koordinator Klien</p>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Opsional — dapat diisi nanti</span>
                </div>
                <div className="grid grid-cols-2 gap-4">

                  {/* Nama Koordinator | Jabatan */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Nama Koordinator / PIC Klien</label>
                    <input type="text" value={leadForm.namaKoordinator}
                      onChange={e => setLeadForm(p => ({ ...p, namaKoordinator: e.target.value }))}
                      placeholder="Nama lengkap"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Jabatan Koordinator</label>
                    <input type="text" value={leadForm.jabatanKoordinator}
                      onChange={e => setLeadForm(p => ({ ...p, jabatanKoordinator: e.target.value }))}
                      placeholder="HR Manager, Facility Manager..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43]"
                    />
                  </div>

                  {/* No. WA | Email Koordinator */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">No. WA Koordinator</label>
                    <input type="text" value={leadForm.waKoordinator}
                      onChange={e => setLeadForm(p => ({ ...p, waKoordinator: e.target.value }))}
                      placeholder="08xx-xxxx-xxxx"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Email Koordinator</label>
                    <input type="email" value={leadForm.emailKoordinator}
                      onChange={e => setLeadForm(p => ({ ...p, emailKoordinator: e.target.value }))}
                      placeholder="koordinator@perusahaan.co.id"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43]"
                    />
                  </div>

                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setShowAddLead(false); setLeadForm({ ...emptyLeadForm }); setFormErrors({}) }}
                className="border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleSaveLead}
                className="bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                Simpan Lead
              </button>
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
                <h2 className="text-base font-bold text-[#1E1C43]">{selectedLead.namaKlien}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <TipeBadge tipe={selectedLead.tipeKlien} />
                  <StageBadge stage={selectedLead.stage} />
                  <span className="text-xs text-gray-500">📍 {selectedLead.kota}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditMode ? (
                  <button
                    onClick={() => handleStartEdit(selectedLead)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#1E1C43] text-[#1E1C43] rounded-lg hover:bg-[#1E1C43] hover:text-white transition-colors"
                  >
                    ✏️ Edit Data
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                    ✏️ Mode Edit
                  </span>
                )}
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body — shared scrollable container */}
            <div className="modal-scrollable-content px-6 py-5 max-h-[65vh] overflow-y-auto">

              {/* ── VIEW MODE ── */}
              {!isEditMode && (
                <div className="space-y-5">

                  {/* Info Umum */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Sumber Lead</p>
                      <p className="text-sm text-gray-800">{selectedLead.sumberLead || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">PIC Sales EFM</p>
                      <p className="text-sm text-gray-800">{selectedLead.picSalesEFM || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Umum</p>
                      {selectedLead.emailUmum
                        ? <a href={`mailto:${selectedLead.emailUmum}`} className="text-sm text-[#1E1C43] hover:underline">{selectedLead.emailUmum}</a>
                        : <p className="text-sm text-gray-400 italic">—</p>
                      }
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Telepon Umum</p>
                      <p className="text-sm text-gray-800">{selectedLead.teleponUmum || '-'}</p>
                    </div>
                    {selectedLead.catatanAwal && (
                      <div className="col-span-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Catatan Awal</p>
                        <p className="text-sm text-gray-700">{selectedLead.catatanAwal}</p>
                      </div>
                    )}
                    {selectedLead.alamatLengkap && (
                      <div className="col-span-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Alamat</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm text-gray-800">{selectedLead.alamatLengkap}</p>
                          {selectedLead.linkGoogleMaps && (
                            <a href={selectedLead.linkGoogleMaps} target="_blank" rel="noopener noreferrer"
                              className="text-gray-400 hover:text-[#1E1C43]">
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Koordinator */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Kontak Koordinator Klien</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Nama</p>
                        <p className="text-sm text-gray-800">{selectedLead.namaKoordinator || <span className="italic text-gray-400">Belum diisi</span>}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Jabatan</p>
                        <p className="text-sm text-gray-800">{selectedLead.jabatanKoordinator || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">No. WA</p>
                        {selectedLead.waKoordinator
                          ? <a href={`https://wa.me/62${selectedLead.waKoordinator.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer"
                              className="text-sm text-[#1E1C43] hover:underline">{selectedLead.waKoordinator}</a>
                          : <p className="text-sm text-gray-400">-</p>
                        }
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Email</p>
                        {selectedLead.emailKoordinator
                          ? <a href={`mailto:${selectedLead.emailKoordinator}`} className="text-sm text-[#1E1C43] hover:underline">{selectedLead.emailKoordinator}</a>
                          : <p className="text-sm text-gray-400">-</p>
                        }
                      </div>
                    </div>
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
                            setNewStage(selectedLead.stage)
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
                      <StageBadge stage={selectedLead.stage} />
                      <span className="text-xs text-gray-400">sejak {formatTgl(selectedLead.tanggal)}</span>
                    </div>
                    {editingPipeline && (
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Status Baru</label>
                          <select value={newStage} onChange={e => setNewStage(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43]">
                            {['New','Approach','Presentation','Proposal','Closing','Converted','Lost'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
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
                    <div className="space-y-2">
                      {[...(selectedLead.logAktivitas || [])].reverse().map((log, i, arr) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex flex-col items-center mt-1">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STAGE_DOT[log.stage] || 'bg-gray-400'}`} />
                            {i < arr.length - 1 && <div className="w-px h-4 bg-gray-200 mt-1" />}
                          </div>
                          <div className="flex-1 pb-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-semibold ${
                                  log.stage === 'Converted' ? 'text-green-600' :
                                  log.stage === 'Lost'      ? 'text-red-500'   : 'text-[#1E1C43]'
                                }`}>{log.stage}</span>
                                {log.picEFM && <span className="text-[10px] text-gray-400">— {log.picEFM}</span>}
                              </div>
                              <span className="text-[10px] text-gray-400">{formatTgl(log.tanggal)}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">{log.catatan}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── EDIT MODE ── */}
              {isEditMode && (
                <div className="space-y-4">

                  {/* Section A: Data Perusahaan */}
                  <p className="text-xs font-bold text-[#1E1C43] uppercase tracking-wide mb-3">Data Perusahaan</p>
                  <div className="grid grid-cols-2 gap-4">

                    {/* Baris 1: Nama — full width */}
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Nama Klien / Penyelenggara <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43]/20"
                        value={editForm.namaKlien || ''}
                        onChange={e => handleEditChange('namaKlien', e.target.value)}
                        placeholder="PT. / Yayasan / Komunitas..."
                      />
                    </div>

                    {/* Baris 2: Tipe + Kota */}
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Tipe Klien <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.tipeKlien || ''}
                        onChange={e => handleEditChange('tipeKlien', e.target.value)}
                      >
                        <option>Corporate</option><option>Foundation</option><option>Government</option>
                        <option>Brand</option><option>Community</option><option>Private</option><option>Individual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Kota / Area <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43]/20"
                        value={editForm.kota || ''}
                        onChange={e => handleEditChange('kota', e.target.value)}
                        placeholder="Jakarta Selatan"
                      />
                    </div>

                    {/* Baris 3: Email + Telepon */}
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Email Umum <span className="text-red-500">*</span>
                        <span className="ml-1.5 font-normal normal-case text-gray-400">Untuk kirim compro/proposal</span>
                      </label>
                      <input type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43]/20"
                        value={editForm.emailUmum || ''}
                        onChange={e => handleEditChange('emailUmum', e.target.value)}
                        placeholder="info@perusahaan.co.id"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">No. Telepon Umum</label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43]/20"
                        value={editForm.teleponUmum || ''}
                        onChange={e => handleEditChange('teleponUmum', e.target.value)}
                        placeholder="021-xxxx"
                      />
                    </div>

                    {/* Baris 4: Alamat — full width */}
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Alamat Lengkap</label>
                      <textarea rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43]/20 resize-none"
                        value={editForm.alamatLengkap || ''}
                        onChange={e => handleEditChange('alamatLengkap', e.target.value)}
                        placeholder="Jl. Nama Jalan No. XX"
                      />
                    </div>

                    {/* Baris 5: Link Maps — full width */}
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Link Google Maps</label>
                      <input type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43]/20"
                        value={editForm.linkGoogleMaps || ''}
                        onChange={e => handleEditChange('linkGoogleMaps', e.target.value)}
                        placeholder="https://maps.google.com/..."
                      />
                    </div>

                    {/* Baris 6: Sumber + PIC EFM */}
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Sumber Lead</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.sumberLead || ''}
                        onChange={e => handleEditChange('sumberLead', e.target.value)}
                      >
                        <option>Referral</option><option>Cold Email</option><option>Google / Web</option>
                        <option>LinkedIn</option><option>Instagram</option><option>Walk-in</option>
                        <option>Existing Client</option><option>Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">PIC Sales EFM</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.picSalesEFM || ''}
                        onChange={e => handleEditChange('picSalesEFM', e.target.value)}
                      >
                        <option>Bagoes</option><option>Emma</option><option>Lainnya</option>
                      </select>
                    </div>

                    {/* Baris 7: Catatan Awal — full width */}
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Catatan Awal</label>
                      <textarea rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43]/20 resize-none"
                        value={editForm.catatanAwal || ''}
                        onChange={e => handleEditChange('catatanAwal', e.target.value)}
                        placeholder="Sumber lead, konteks awal, atau catatan penting..."
                      />
                    </div>

                    {/* Section B: Koordinator */}
                    <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                      <div className="flex items-center gap-2 mb-3">
                        <p className="text-xs font-bold text-[#1E1C43] uppercase tracking-wide">Kontak Koordinator Klien</p>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Opsional</span>
                      </div>
                    </div>

                    {/* Nama + Jabatan */}
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Nama Koordinator / PIC Klien</label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43]/20"
                        value={editForm.namaKoordinator || ''}
                        onChange={e => handleEditChange('namaKoordinator', e.target.value)}
                        placeholder="Nama lengkap"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Jabatan Koordinator</label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43]/20"
                        value={editForm.jabatanKoordinator || ''}
                        onChange={e => handleEditChange('jabatanKoordinator', e.target.value)}
                        placeholder="HR Manager, Facility Manager..."
                      />
                    </div>

                    {/* WA + Email Koordinator */}
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">No. WA Koordinator</label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43]/20"
                        value={editForm.waKoordinator || ''}
                        onChange={e => handleEditChange('waKoordinator', e.target.value)}
                        placeholder="08xx-xxxx-xxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Koordinator</label>
                      <input type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43]/20"
                        value={editForm.emailKoordinator || ''}
                        onChange={e => handleEditChange('emailKoordinator', e.target.value)}
                        placeholder="koordinator@perusahaan.co.id"
                      />
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
                <div className="flex gap-2">
                  {(selectedLead.stage === 'Presentation' || selectedLead.stage === 'Closing') &&
                    !selectedLead.konsultasiId && (
                    <button
                      onClick={() => {
                        handleCloseModal()
                        navigate(`/event/konsultasi/new?leadId=${selectedLead.id}`, {
                          state: {
                            fromLead: true,
                            leadId: selectedLead.id,
                            namaKlien: selectedLead.namaKlien,
                            tipeKlien: selectedLead.tipeKlien,
                            namaEvent: selectedLead.namaEvent || '',
                            jenisEvent: selectedLead.jenisEvent || '',
                            picKlien: selectedLead.namaKoordinator,
                            noHP: selectedLead.waKoordinator,
                            email: selectedLead.emailUmum,
                            kota: selectedLead.kota,
                          },
                        })
                      }}
                      className="inline-flex items-center gap-2 bg-[#1E1C43] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#2d2b5e] transition-colors"
                    >
                      Jadwalkan Konsultasi →
                    </button>
                  )}
                  {selectedLead.konsultasiId && (
                    <button
                      onClick={() => { handleCloseModal(); navigate('/event/konsultasi/' + selectedLead.konsultasiId) }}
                      className="inline-flex items-center gap-2 border border-[#1E1C43] text-[#1E1C43] text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1E1C43] hover:text-white transition-colors"
                    >
                      Lihat Konsultasi #{selectedLead.konsultasiId} →
                    </button>
                  )}
                  {selectedLead.orderId && (
                    <button
                      onClick={() => { handleCloseModal(); navigate('/event/orders/' + selectedLead.orderId) }}
                      className="inline-flex items-center gap-2 bg-[#E05945] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#c94a38] transition-colors"
                    >
                      Lihat Order →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Footer EDIT mode */}
            {isEditMode && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
                <button onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  ✕ Batal
                </button>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-400 italic">Perubahan akan memperbarui data di semua form terkait</p>
                  <button onClick={handleSaveEdit}
                    className="px-5 py-2 text-sm font-semibold bg-[#1E1C43] text-white rounded-lg hover:bg-[#2d2b5e] transition-colors">
                    💾 Simpan Perubahan
                  </button>
                </div>
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
