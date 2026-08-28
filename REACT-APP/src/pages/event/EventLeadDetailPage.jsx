import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Edit2, Save, X, Plus, ExternalLink, Phone, Mail } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { initKonsultasi, getStoredKonsultasi, KONSULTASI_INIT } from '../../data/eventKonsultasiStore'

/* ═══════════════════════════════════════
   Constants
═══════════════════════════════════════ */
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
  New:          'bg-gray-400',
  Approach:     'bg-blue-500',
  Presentation: 'bg-yellow-500',
  Proposal:     'bg-purple-500',
  Closing:      'bg-[#E05945]',
  Converted:    'bg-green-500',
  Lost:         'bg-red-400',
}

const PIPELINE_LINEAR = ['New', 'Approach', 'Presentation', 'Proposal', 'Closing', 'Converted']
const PIPELINE_STAGES = [...PIPELINE_LINEAR, 'Lost']

const SUMBER_OPTS    = ['Referral', 'Cold Email', 'LinkedIn', 'Instagram', 'Website', 'Walk-in', 'Lainnya']
const JENIS_EVENT    = ['Fun Run', 'Charity Run', 'Night Run', 'Corporate Sports Day', 'Exhibition', 'Mass Event', 'Lainnya']
const TIPE_OPTS      = ['Corporate', 'Foundation', 'Government', 'Brand', 'Community', 'Private', 'Individual']
const PIC_EFM_OPTS   = ['Bagoes', 'Emma']

/* ── Fallback static data (for direct URL access) ── */
const LEADS_FALLBACK = [
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
      { tanggal: '2026-05-15', stage: 'New',       catatan: 'Cold email ke HRD Garuda Nusa',               picEFM: 'Emma' },
      { tanggal: '2026-05-22', stage: 'Approach',  catatan: 'Presentasi online ke HR Director',            picEFM: 'Emma' },
      { tanggal: '2026-06-01', stage: 'Converted', catatan: 'Proposal disetujui, kontrak ditandatangani',  picEFM: 'Emma' },
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
      { tanggal: '2026-06-05', stage: 'New',      catatan: 'Kontak masuk dari LinkedIn',             picEFM: 'Bagoes' },
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
      { tanggal: '2026-06-08', stage: 'New',  catatan: 'DM Instagram, budget sangat terbatas',             picEFM: 'Emma' },
      { tanggal: '2026-06-14', stage: 'Lost', catatan: 'Tidak lanjut — margin tidak memenuhi threshold',   picEFM: 'Emma' },
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


/* ═══════════════════════════════════════
   Helpers
═══════════════════════════════════════ */
function formatTgl(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return iso }
}

function getInitials(name) {
  return (name || '').split(/[\s.&]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

const AVATAR_COLORS = ['#1E1C43', '#0891B2', '#059669', '#D97706', '#7C3AED', '#DB2777', '#DC2626', '#0284C7']
function getAvatarColor(name) {
  let hash = 0
  for (const c of (name || '')) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFFFF
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/* ═══════════════════════════════════════
   Sub-components
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

function InfoField({ label, children }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 overflow-hidden min-w-0">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="text-sm font-semibold text-gray-800 break-words">{children}</div>
    </div>
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

/* ── Pipeline Stepper ── */
function PipelineStepper({ currentStage }) {
  const isLost     = currentStage === 'Lost'
  const currentIdx = PIPELINE_LINEAR.indexOf(currentStage)
  return (
    <div className="mb-4">
      <div className="flex items-start">
        {PIPELINE_LINEAR.map((stage, idx) => {
          const isCompleted = !isLost && idx < currentIdx
          const isCurrent   = !isLost && idx === currentIdx
          return (
            <div key={stage} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${isCompleted ? 'bg-[#1E1C43] text-white' : isCurrent ? 'bg-[#E05945] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <p className={`text-[9px] mt-1 text-center leading-tight
                  ${isCurrent ? 'font-bold text-[#E05945]' : isCompleted ? 'font-medium text-[#1E1C43]' : 'text-gray-400'}`}>
                  {stage}
                </p>
              </div>
              {idx < PIPELINE_LINEAR.length - 1 && (
                <div className={`h-0.5 flex-1 -mt-4 ${isCompleted ? 'bg-[#1E1C43]' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
      {isLost && (
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <span className="text-xs font-semibold text-red-600">Lead ditandai Lost — keluar dari pipeline</span>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
export default function EventLeadDetailPage() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const { state }     = useLocation()
  const { setCrumbs } = useBreadcrumb()

  const [lead, setLead] = useState(() => {
    const initial = state?.lead || LEADS_FALLBACK.find(l => l.id === id) || null
    if (!initial) return null
    try {
      const savedLog = localStorage.getItem(`event-lead-log-${id}`)
      if (savedLog) return { ...initial, logAktivitas: JSON.parse(savedLog) }
    } catch {}
    return initial
  })

  const [activeTab,        setActiveTab]        = useState('info')
  const [isEditMode,       setIsEditMode]       = useState(false)
  const [editForm,         setEditForm]         = useState({})
  const [editingPipeline,  setEditingPipeline]  = useState(false)
  const [newStage,         setNewStage]         = useState(lead?.stage || '')
  const [newStageTanggal,  setNewStageTanggal]  = useState(new Date().toISOString().split('T')[0])
  const [newStageCatatan,  setNewStageCatatan]  = useState('')
  const [toast,            setToast]            = useState(null)
  const [catatanList,      setCatatanList]      = useState(() => {
    try {
      const saved = localStorage.getItem(`event-lead-catatan-${id}`)
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })
  const [newCatatan, setNewCatatan] = useState('')

  useEffect(() => {
    if (lead) setCrumbs(['B2B Event', 'Leads', lead.namaKlien])
    return () => setCrumbs(null)
  }, [lead?.namaKlien])

  useEffect(() => {
    if (lead?.logAktivitas) {
      try { localStorage.setItem(`event-lead-log-${id}`, JSON.stringify(lead.logAktivitas)) } catch {}
    }
  }, [lead?.logAktivitas, id])

  useEffect(() => {
    try { localStorage.setItem(`event-lead-catatan-${id}`, JSON.stringify(catatanList)) } catch {}
  }, [catatanList, id])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <p className="text-gray-500 text-sm">Lead tidak ditemukan.</p>
        <button onClick={() => navigate('/event/leads')}
          className="flex items-center gap-2 text-sm font-medium text-[#1E1C43] hover:underline">
          <ArrowLeft size={14} /> Kembali ke Leads
        </button>
      </div>
    )
  }

  /* ── Edit handlers ── */
  function handleStartEdit() { setEditForm({ ...lead }); setIsEditMode(true) }
  function handleCancelEdit() { setIsEditMode(false); setEditForm({}) }
  function handleSaveEdit() {
    if (!editForm.namaKlien || !editForm.tipeKlien || !editForm.kota) {
      alert('Nama klien, tipe klien, dan kota wajib diisi.'); return
    }
    const fieldLabels = {
      namaKlien: 'Nama Klien', tipeKlien: 'Tipe Klien', kota: 'Kota / Area',
      emailUmum: 'Email Umum', teleponUmum: 'Telepon Umum', sumberLead: 'Sumber Lead',
      picSalesEFM: 'PIC Sales EFM', namaEvent: 'Nama Event', jenisEvent: 'Jenis Event',
      namaKoordinator: 'Nama Koordinator', jabatanKoordinator: 'Jabatan', catatanAwal: 'Catatan Awal',
    }
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    const newLogEntries = Object.entries(fieldLabels)
      .filter(([key]) => (editForm[key] || '') !== (lead[key] || ''))
      .map(([key, label]) => ({
        tanggal: today, stage: 'Edit Data',
        catatan: `${label} diubah menjadi "${editForm[key] || '—'}"`,
        picEFM: lead.picSalesEFM || 'Admin EFM',
      }))
    setLead({ ...editForm, logAktivitas: [...(lead.logAktivitas || []), ...newLogEntries] })
    setIsEditMode(false); setEditForm({})
    showToast('✓ Data lead berhasil diperbarui')
  }

  /* ── Pipeline update ── */
  function handleUpdatePipeline() {
    if (!newStageTanggal) { alert('Tanggal wajib diisi'); return }
    const updated = {
      ...lead,
      stage: newStage,
      tanggal: newStageTanggal,
      logAktivitas: [
        ...(lead.logAktivitas || []),
        { tanggal: newStageTanggal, stage: newStage, catatan: newStageCatatan || 'Status diperbarui', picEFM: lead.picSalesEFM || '' },
      ],
    }
    setLead(updated)
    setEditingPipeline(false)
    setNewStage(updated.stage)
    setNewStageTanggal(new Date().toISOString().split('T')[0])
    setNewStageCatatan('')
    showToast('✓ Status pipeline diperbarui')
  }

  /* ── Catatan ── */
  function addCatatan() {
    const text = newCatatan.trim()
    if (!text) return
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    setCatatanList(prev => [
      { id: 'EVC-' + String(prev.length + 1).padStart(3, '0'), tanggal: today, oleh: lead.picSalesEFM || 'Admin EFM', catatan: text },
      ...prev,
    ])
    setNewCatatan('')
    showToast('✓ Catatan berhasil ditambahkan')
  }

  const TABS = [
    { key: 'info',       label: 'Info Klien'   },
    { key: 'konsultasi', label: 'Konsultasi'   },
    { key: 'riwayat',    label: 'Riwayat'      },
    { key: 'log',        label: 'Log & Histori' },
  ]

  initKonsultasi(KONSULTASI_INIT)
  const leadKonsultasi = getStoredKonsultasi().filter(k => k.leadId === lead.id)

  return (
    <>
      <div className="space-y-5">

        {/* ── Header card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
                style={{ background: getAvatarColor(lead.namaKlien) }}>
                {getInitials(lead.namaKlien)}
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{lead.id}</p>
                <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">{lead.namaKlien}</h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <TipeBadge tipe={lead.tipeKlien} />
                  <StageBadge stage={lead.stage} />
                  {lead.kota && <span className="text-[10px] text-gray-400">📍 {lead.kota}</span>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {lead.stage !== 'Lost' && (
                <button
                  onClick={() => navigate('/event/orders/new', { state: { namaKlien: lead.namaKlien, leadId: lead.id } })}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
                  <Plus size={13} /> Buat Order
                </button>
              )}
              <button
                onClick={() => navigate('/event/leads')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors">
                <ArrowLeft size={12} /> Kembali
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl shadow-sm p-1 w-fit overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === t.key ? 'bg-[#1E1C43] text-white' : 'text-gray-500 hover:text-[#1E1C43]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════
            TAB 1: INFO KLIEN + Pipeline
        ════════════════════════════════ */}
        {activeTab === 'info' && (
          <div className="space-y-4">

            {/* Status Pipeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Status Pipeline</h3>
                <div className="flex gap-2">
                  {editingPipeline ? (
                    <>
                      <button onClick={handleUpdatePipeline}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                        <Save size={12} /> Simpan
                      </button>
                      <button onClick={() => setEditingPipeline(false)}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                        <X size={12} /> Batal
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { setEditingPipeline(true); setNewStage(lead.stage) }}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
                      <Edit2 size={12} /> Update Pipeline
                    </button>
                  )}
                </div>
              </div>
              <div className="px-5 py-5">
                <PipelineStepper currentStage={lead.stage} />
                {editingPipeline && (
                  <div className="border-t border-gray-100 pt-4 mt-2">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Status Baru</label>
                          <select value={newStage} onChange={e => setNewStage(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]">
                            {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tanggal</label>
                          <input type="date" value={newStageTanggal} onChange={e => setNewStageTanggal(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Catatan</label>
                        <input type="text" value={newStageCatatan} onChange={e => setNewStageCatatan(e.target.value)}
                          placeholder="Catatan perubahan status..."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info Klien */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Info Klien</h3>
                {!isEditMode ? (
                  <button onClick={handleStartEdit}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
                    <Edit2 size={12} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                      <Save size={12} /> Simpan
                    </button>
                    <button onClick={handleCancelEdit}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                      <X size={12} /> Batal
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5">
                {!isEditMode ? (
                  <div className="space-y-4">
                    {/* Identitas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <InfoField label="Nama Klien">{lead.namaKlien || '—'}</InfoField>
                      <InfoField label="Tipe Klien">{lead.tipeKlien || '—'}</InfoField>
                      <InfoField label="Kota / Area">{lead.kota || '—'}</InfoField>
                      <InfoField label="Email Umum">
                        {lead.emailUmum
                          ? <a href={`mailto:${lead.emailUmum}`} className="text-[#1E1C43] hover:underline">{lead.emailUmum}</a>
                          : <span className="text-gray-400 italic">—</span>}
                      </InfoField>
                      <InfoField label="Telepon Umum">
                        {lead.teleponUmum || <span className="text-gray-400 italic">—</span>}
                      </InfoField>
                      <InfoField label="Sumber Lead">{lead.sumberLead || '—'}</InfoField>
                      <InfoField label="PIC Sales EFM">{lead.picSalesEFM || '—'}</InfoField>
                      <InfoField label="Tanggal Masuk">{formatTgl(lead.tanggal)}</InfoField>
                      <InfoField label="Nama Event">{lead.namaEvent || '—'}</InfoField>
                      <InfoField label="Jenis Event">{lead.jenisEvent || '—'}</InfoField>
                    </div>

                    {lead.alamatLengkap && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Alamat</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-800">{lead.alamatLengkap}</p>
                          {lead.linkGoogleMaps && (
                            <a href={lead.linkGoogleMaps} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1E1C43] shrink-0">
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {lead.catatanAwal && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Catatan Awal</p>
                        <p className="text-sm text-gray-700">{lead.catatanAwal}</p>
                      </div>
                    )}

                    {/* Koordinator */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Kontak Koordinator Klien</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoField label="Nama Koordinator">
                          {lead.namaKoordinator || <span className="text-gray-400 italic">Belum diisi</span>}
                        </InfoField>
                        <InfoField label="Jabatan">{lead.jabatanKoordinator || '—'}</InfoField>
                        <InfoField label="No. WhatsApp">
                          {lead.waKoordinator
                            ? <a href={`https://wa.me/62${lead.waKoordinator.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[#1E1C43] hover:underline">
                                <Phone size={11} /> {lead.waKoordinator}
                              </a>
                            : <span className="text-gray-400 italic">—</span>}
                        </InfoField>
                        <InfoField label="Email Koordinator">
                          {lead.emailKoordinator
                            ? <a href={`mailto:${lead.emailKoordinator}`} className="flex items-center gap-1 text-[#1E1C43] hover:underline">
                                <Mail size={11} /> {lead.emailKoordinator}
                              </a>
                            : <span className="text-gray-400 italic">—</span>}
                        </InfoField>
                      </div>
                    </div>

                    {/* Linked records */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {lead.konsultasiId && (
                        <button
                          onClick={() => navigate(`/event/konsultasi/${lead.konsultasiId}`)}
                          className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors text-left">
                          <div>
                            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">Konsultasi</p>
                            <p className="text-sm font-bold text-[#1E1C43]">{lead.konsultasiId}</p>
                          </div>
                          <ExternalLink size={14} className="text-blue-500" />
                        </button>
                      )}
                      {lead.orderId && (
                        <button
                          onClick={() => navigate(`/event/orders/${lead.orderId}`)}
                          className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors text-left">
                          <div>
                            <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide">Order</p>
                            <p className="text-sm font-bold text-[#1E1C43]">#{lead.orderId}</p>
                          </div>
                          <ExternalLink size={14} className="text-green-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Edit form */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-full">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Nama Klien / Penyelenggara <span className="text-red-500">*</span>
                      </label>
                      <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.namaKlien || ''} onChange={e => setEditForm(p => ({ ...p, namaKlien: e.target.value }))}
                        placeholder="PT. / Yayasan / Komunitas..." />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Tipe Klien <span className="text-red-500">*</span>
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.tipeKlien || ''} onChange={e => setEditForm(p => ({ ...p, tipeKlien: e.target.value }))}>
                        {TIPE_OPTS.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Kota / Area <span className="text-red-500">*</span>
                      </label>
                      <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.kota || ''} onChange={e => setEditForm(p => ({ ...p, kota: e.target.value }))}
                        placeholder="Jakarta Selatan" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Umum</label>
                      <input type="email" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.emailUmum || ''} onChange={e => setEditForm(p => ({ ...p, emailUmum: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Telepon Umum</label>
                      <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.teleponUmum || ''} onChange={e => setEditForm(p => ({ ...p, teleponUmum: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Sumber Lead</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.sumberLead || ''} onChange={e => setEditForm(p => ({ ...p, sumberLead: e.target.value }))}>
                        <option value="">Pilih Sumber...</option>
                        {SUMBER_OPTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">PIC Sales EFM</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.picSalesEFM || ''} onChange={e => setEditForm(p => ({ ...p, picSalesEFM: e.target.value }))}>
                        {PIC_EFM_OPTS.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Nama Event</label>
                      <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.namaEvent || ''} onChange={e => setEditForm(p => ({ ...p, namaEvent: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Jenis Event</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.jenisEvent || ''} onChange={e => setEditForm(p => ({ ...p, jenisEvent: e.target.value }))}>
                        <option value="">Pilih Jenis...</option>
                        {JENIS_EVENT.map(j => <option key={j}>{j}</option>)}
                      </select>
                    </div>
                    <div className="col-span-full">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Alamat Lengkap</label>
                      <textarea rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] resize-none"
                        value={editForm.alamatLengkap || ''} onChange={e => setEditForm(p => ({ ...p, alamatLengkap: e.target.value }))} />
                    </div>
                    <div className="col-span-full border-t border-gray-100 pt-4">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Kontak Koordinator</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Nama Koordinator</label>
                      <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.namaKoordinator || ''} onChange={e => setEditForm(p => ({ ...p, namaKoordinator: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Jabatan</label>
                      <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.jabatanKoordinator || ''} onChange={e => setEditForm(p => ({ ...p, jabatanKoordinator: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">No. WhatsApp</label>
                      <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.waKoordinator || ''} onChange={e => setEditForm(p => ({ ...p, waKoordinator: e.target.value }))} placeholder="08xx-xxxx-xxxx" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Koordinator</label>
                      <input type="email" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.emailKoordinator || ''} onChange={e => setEditForm(p => ({ ...p, emailKoordinator: e.target.value }))} />
                    </div>
                    <div className="col-span-full">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Catatan Awal</label>
                      <textarea rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] resize-none"
                        value={editForm.catatanAwal || ''} onChange={e => setEditForm(p => ({ ...p, catatanAwal: e.target.value }))} />
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ════════════════════════════════
            TAB 2: KONSULTASI
        ════════════════════════════════ */}
        {activeTab === 'konsultasi' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Riwayat Konsultasi</h3>
                <p className="text-xs text-gray-400 pl-4 mt-0.5">Semua sesi konsultasi yang terhubung dengan lead ini</p>
              </div>
              <button
                onClick={() => navigate('/event/konsultasi/new', { state: { fromLead: true, leadId: lead.id, namaKlien: lead.namaKlien, namaEvent: lead.namaEvent, jenisEvent: lead.jenisEvent } })}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
                <Plus size={12} /> Buat Konsultasi
              </button>
            </div>
            <div className="p-5">
              {leadKonsultasi.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-8">Belum ada konsultasi untuk lead ini.</p>
              ) : (
                <div className="space-y-2">
                  {leadKonsultasi.map(k => {
                    const hasilCls = k.hasil === 'lanjut'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : k.hasil === 'pending'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                    const hasilLabel = k.hasil === 'lanjut' ? 'Lanjut' : k.hasil === 'pending' ? 'Pending' : 'Tidak Lanjut'
                    return (
                      <button key={k.id}
                        onClick={() => navigate(`/event/konsultasi/${k.id}`)}
                        className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-[#1E1C43] transition-colors text-left group">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-bold text-[#1E1C43]">{k.id}</span>
                            {k.hasil && (
                              <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${hasilCls}`}>{hasilLabel}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{k.tanggal}</p>
                          {k.namaEvent && <p className="text-xs text-gray-600 mt-0.5">{k.namaEvent}</p>}
                          {k.rekomendasi && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{k.rekomendasi}</p>}
                        </div>
                        <ExternalLink size={14} className="text-gray-400 group-hover:text-[#1E1C43] transition-colors ml-3 shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            TAB 3: RIWAYAT
        ════════════════════════════════ */}
        {activeTab === 'riwayat' && (
          <div className="space-y-4">

            {/* Order terhubung */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Order Terhubung</h3>
              </div>
              <div className="p-5">
                {!lead.orderId ? (
                  <div className="flex flex-col items-center py-8 gap-2">
                    <p className="text-sm text-gray-500 font-medium">Belum ada order dari lead ini</p>
                    <p className="text-xs text-gray-400 text-center">Order akan muncul di sini setelah lead Convert</p>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(`/event/orders/${lead.orderId}`)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-[#1E1C43] transition-colors text-left group">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Order B2B Event</p>
                      <p className="text-sm font-bold text-[#1E1C43]">#{lead.orderId}</p>
                    </div>
                    <ExternalLink size={14} className="text-gray-400 group-hover:text-[#1E1C43] transition-colors shrink-0" />
                  </button>
                )}
              </div>
            </div>

            {/* Catatan internal */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Catatan Internal</h3>
                <p className="text-xs text-gray-400 pl-4 mt-0.5">Tidak terlihat oleh klien</p>
              </div>
              <div className="p-5 space-y-3">
                {catatanList.length > 0 && (
                  <div className="space-y-2">
                    {catatanList.map(c => (
                      <div key={c.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-[#1E1C43]">{c.oleh}</span>
                          <span className="text-[10px] text-gray-400 shrink-0">{c.tanggal}</span>
                        </div>
                        <p className="text-sm text-gray-700">{c.catatan}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={newCatatan}
                    onChange={e => setNewCatatan(e.target.value)}
                    placeholder="Tulis catatan internal..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] resize-none"
                  />
                  <button
                    onClick={addCatatan}
                    className="px-3 py-2 bg-[#1E1C43] text-white text-xs font-semibold rounded-lg hover:bg-[#2d2b5e] transition-colors self-end shrink-0">
                    Simpan
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ════════════════════════════════
            TAB 4: LOG AKTIVITAS
        ════════════════════════════════ */}
        {activeTab === 'log' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Log & Histori</h3>
              <span className="text-xs text-gray-400">{(lead.logAktivitas || []).length} aktivitas tercatat</span>
            </div>
            <p className="text-xs text-gray-400 pl-4 mb-4">Semua update aktivitas dan perubahan pipeline lead</p>
            {(lead.logAktivitas || []).length === 0 ? (
              <p className="text-sm text-gray-400 italic">Belum ada aktivitas.</p>
            ) : (
              <div className="space-y-0 pl-4 relative">
                {[...(lead.logAktivitas || [])].reverse().map((log, i, arr) => (
                  <div key={i} className="relative pb-4 last:pb-0">
                    <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-[#E05945]" />
                    {i < arr.length - 1 && (
                      <div className="absolute -left-[13px] top-3 w-px bottom-0 bg-gray-200" />
                    )}
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${STAGE_CLS[log.stage] ?? 'bg-gray-100 text-gray-600'}`}>
                        {log.stage}
                      </span>
                      {log.picEFM && <span className="text-[10px] text-gray-500 font-medium">· {log.picEFM}</span>}
                      <span className="text-[10px] text-gray-400">· {formatTgl(log.tanggal)}</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed break-words">{log.catatan}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
