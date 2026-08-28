import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Plus, Search, MessageCircle } from 'lucide-react'

/* ═══════════════════════════════════════
   Constants
═══════════════════════════════════════ */
const BULAN_OPTIONS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const BULAN_IDX     = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const ROWS_PER_PAGE = 10

const LEADS_INIT = [
  {
    id: 'LE-0001', namaKlien: 'Yayasan Kanker Indonesia', tipeKlien: 'Foundation', kota: 'Jakarta Selatan',
    namaEvent: 'Health Run for Hope 2026', jenisEvent: 'Charity Run',
    emailUmum: 'info@yayasankanker.or.id', sumberLead: 'Referral', picSalesEFM: 'Bagoes',
    stage: 'Converted', tanggal: '2026-05-01', catatanAwal: 'Referral dari jaringan nonprofit kesehatan',
    teleponUmum: '021-3334567', alamatLengkap: 'Jl. Gatot Subroto No. 55, Jakarta Selatan',
    linkGoogleMaps: '', namaKoordinator: 'Ibu Ratna', jabatanKoordinator: 'Program Director',
    waKoordinator: '081234567890', emailKoordinator: 'ratna@yayasankanker.or.id',
    logAktivitas: [
      { tanggal: '2026-05-01', stage: 'New',       catatan: 'Lead masuk via referral komunitas kesehatan', picEFM: 'Bagoes' },
      { tanggal: '2026-05-10', stage: 'Approach',  catatan: 'Kirim company profile event organizer',       picEFM: 'Bagoes' },
      { tanggal: '2026-05-20', stage: 'Closing',   catatan: 'Proposal diterima, jadwalkan konsultasi',     picEFM: 'Bagoes' },
      { tanggal: '2026-06-01', stage: 'Converted', catatan: 'Deal ditandatangani, order dibuat',           picEFM: 'Bagoes' },
    ],
    konsultasiId: 'KNS-26-0001', orderId: 'EV-26-0001',
  },
  {
    id: 'LE-0002', namaKlien: 'PT. Garuda Nusa Tbk', tipeKlien: 'Corporate', kota: 'Jakarta Pusat',
    namaEvent: 'Corporate Fun Run 2026', jenisEvent: 'Fun Run',
    emailUmum: 'hrd@garudanusa.co.id', sumberLead: 'Cold Email', picSalesEFM: 'Emma',
    stage: 'Converted', tanggal: '2026-05-15', catatanAwal: 'Cold email ke divisi HRD, dibalas GM HR',
    teleponUmum: '021-5557890', alamatLengkap: 'Jl. Jend. Sudirman Kav. 56, Jakarta Pusat',
    linkGoogleMaps: '', namaKoordinator: 'Bpk. Hendra', jabatanKoordinator: 'HR Director',
    waKoordinator: '082112345678', emailKoordinator: 'hendra.hr@garudanusa.co.id',
    logAktivitas: [
      { tanggal: '2026-05-15', stage: 'New',       catatan: 'Cold email ke HRD Garuda Nusa',              picEFM: 'Emma' },
      { tanggal: '2026-05-22', stage: 'Approach',  catatan: 'Presentasi online ke HR Director',           picEFM: 'Emma' },
      { tanggal: '2026-06-01', stage: 'Converted', catatan: 'Proposal disetujui, kontrak ditandatangani', picEFM: 'Emma' },
    ],
    konsultasiId: 'KNS-26-0002', orderId: 'EV-26-0002',
  },
  {
    id: 'LE-0003', namaKlien: 'Brand Tropicana Slim', tipeKlien: 'Brand', kota: 'Tangerang Selatan',
    namaEvent: 'Healthy Living Expo', jenisEvent: 'Exhibition',
    emailUmum: 'marketing@tropicanaslim.co.id', sumberLead: 'LinkedIn', picSalesEFM: 'Bagoes',
    stage: 'Proposal', tanggal: '2026-06-05', catatanAwal: 'Kontak via LinkedIn dari Brand Manager',
    teleponUmum: '021-6667890', alamatLengkap: 'Kawasan ICE BSD City, Tangerang Selatan',
    linkGoogleMaps: '', namaKoordinator: 'Bpk. Dani', jabatanKoordinator: 'Brand Manager',
    waKoordinator: '081398765432', emailKoordinator: 'dani@tropicanaslim.co.id',
    logAktivitas: [
      { tanggal: '2026-06-05', stage: 'New',      catatan: 'Kontak masuk dari LinkedIn',            picEFM: 'Bagoes' },
      { tanggal: '2026-06-10', stage: 'Proposal', catatan: 'Konsultasi selesai, kirim proposal EFM', picEFM: 'Bagoes' },
    ],
    konsultasiId: 'KNS-26-0003', orderId: null,
  },
  {
    id: 'LE-0004', namaKlien: 'Komunitas Pelari Jakarta', tipeKlien: 'Community', kota: 'Jakarta Pusat',
    namaEvent: 'Jakarta Night Run 2026', jenisEvent: 'Night Run',
    emailUmum: 'info@komunitas-pelari.id', sumberLead: 'Instagram', picSalesEFM: 'Emma',
    stage: 'Lost', tanggal: '2026-06-08', catatanAwal: 'DM Instagram dari ketua komunitas',
    teleponUmum: '', alamatLengkap: 'Monas, Jakarta Pusat', linkGoogleMaps: '',
    namaKoordinator: 'Bpk. Fajar', jabatanKoordinator: 'Ketua Komunitas',
    waKoordinator: '085678901234', emailKoordinator: '',
    logAktivitas: [
      { tanggal: '2026-06-08', stage: 'New',  catatan: 'DM Instagram, budget sangat terbatas',              picEFM: 'Emma' },
      { tanggal: '2026-06-14', stage: 'Lost', catatan: 'Tidak lanjut — margin tidak memenuhi threshold',    picEFM: 'Emma' },
    ],
    konsultasiId: 'KNS-26-0004', orderId: null,
  },
  {
    id: 'LE-0005', namaKlien: 'Dinas Pemuda & Olahraga DKI', tipeKlien: 'Government', kota: 'Jakarta Pusat',
    namaEvent: 'Hari Olahraga Nasional DKI', jenisEvent: 'Mass Event',
    emailUmum: 'info@dinpora.jakarta.go.id', sumberLead: 'Referral', picSalesEFM: 'Bagoes',
    stage: 'Closing', tanggal: '2026-06-10', catatanAwal: 'Referral dari koneksi pemerintah daerah',
    teleponUmum: '021-3451234', alamatLengkap: 'Jl. Medan Merdeka Utara No. 14, Jakarta Pusat',
    linkGoogleMaps: '', namaKoordinator: 'Bpk. Eko Prasetyo', jabatanKoordinator: 'Kepala Bidang Olahraga',
    waKoordinator: '087865432100', emailKoordinator: 'eko.prasetyo@dinpora.jakarta.go.id',
    logAktivitas: [
      { tanggal: '2026-06-10', stage: 'New',          catatan: 'Lead masuk via referral pemerintah',          picEFM: 'Bagoes' },
      { tanggal: '2026-06-15', stage: 'Presentation', catatan: 'Presentasi resmi ke Kepala Bidang Olahraga',  picEFM: 'Bagoes' },
      { tanggal: '2026-06-18', stage: 'Closing',      catatan: 'Konsultasi selesai, masuk proses tender',     picEFM: 'Bagoes' },
    ],
    konsultasiId: 'KNS-26-0005', orderId: 'EV-26-0003',
  },
  {
    id: 'LE-0006', namaKlien: 'PT. Telkom Indonesia', tipeKlien: 'Corporate', kota: 'Jakarta Selatan',
    namaEvent: 'Telkom SportFest 2026', jenisEvent: 'Corporate Sports Day',
    emailUmum: 'hrd@telkom.co.id', sumberLead: 'Cold Email', picSalesEFM: 'Bagoes',
    stage: 'Approach', tanggal: '2026-06-20', catatanAwal: 'Cold email ke tim HRD Telkom, direspons positif',
    teleponUmum: '021-1234567', alamatLengkap: 'Jl. Japati No. 1, Jakarta Selatan', linkGoogleMaps: '',
    namaKoordinator: '', jabatanKoordinator: '', waKoordinator: '', emailKoordinator: '',
    logAktivitas: [
      { tanggal: '2026-06-20', stage: 'New',      catatan: 'Cold email ke HRD Telkom Indonesia', picEFM: 'Bagoes' },
      { tanggal: '2026-06-25', stage: 'Approach', catatan: 'Balas email — minta meeting awal',   picEFM: 'Bagoes' },
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

function Toast({ message, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg bg-green-600 text-white text-[13px] font-medium">
      {message}
      <button onClick={onClose} className="ml-1 text-white/70 hover:text-white"><X size={13} /></button>
    </div>
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

  const [leads,       setLeads]       = useState(LEADS_INIT)
  const [showAddLead, setShowAddLead] = useState(false)
  const [leadForm,    setLeadForm]    = useState({ ...emptyLeadForm })
  const [formErrors,  setFormErrors]  = useState({})
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
    const newId = 'LE-' + String(leads.length + 1).padStart(4, '0')
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

  function fieldCls(key) {
    return `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43] ${formErrors[key] ? 'border-red-400' : 'border-gray-200'}`
  }

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
  }), [leads, bulan, tahun, tipe, stage, search])

  const kpiTotal     = leads.length
  const kpiHot       = leads.filter(l => l.stage === 'Proposal' || l.stage === 'Closing').length
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
          <button
            onClick={() => { setLeadForm({ ...emptyLeadForm }); setFormErrors({}); setShowAddLead(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#E05945] hover:bg-[#c94a38] transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> Tambah Lead
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Leads</p>
            <p className="text-xl font-bold text-[#1E1C43]">{kpiTotal}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Semua pipeline</p>
          </div>
          <div className="bg-white rounded-xl border-[1.5px] border-[#E05945] px-4 py-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Hot Leads</p>
            <p className="text-xl font-bold text-[#E05945]">{kpiHot}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Proposal &amp; Closing</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Converted</p>
            <p className="text-xl font-bold text-green-600">{kpiConverted}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Jadi klien aktif</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
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
            <option>New</option><option>Approach</option><option>Presentation</option>
            <option>Proposal</option><option>Closing</option><option>Converted</option><option>Lost</option>
          </select>
          <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-gray-50 border-[1.5px] border-gray-200 rounded-lg px-3 py-[7px] focus-within:border-[#1E1C43] focus-within:bg-white transition-colors">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              className="border-none bg-transparent text-xs outline-none w-full text-gray-700 placeholder:text-gray-400"
              placeholder="Cari nama perusahaan..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={handleReset} className="px-3.5 py-[7px] bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-xs font-semibold rounded-lg transition-colors shrink-0">Reset</button>
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
                    className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer"
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
                <p className="text-xs font-bold text-[#1E1C43] uppercase tracking-wide mb-3">Data Perusahaan</p>
                <div className="grid grid-cols-2 gap-4">

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

                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Catatan Awal</label>
                    <textarea value={leadForm.catatanAwal}
                      onChange={e => setLeadForm(p => ({ ...p, catatanAwal: e.target.value }))}
                      rows={3}
                      placeholder="Sumber lead, konteks awal, atau catatan penting..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E1C43] resize-none"
                    />
                  </div>

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

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
