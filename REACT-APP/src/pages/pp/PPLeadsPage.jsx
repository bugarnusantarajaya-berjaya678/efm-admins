import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Plus, Search, MessageCircle } from 'lucide-react'
import { initLeads, getStoredLeads } from '../../data/ppLeadsStore'
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
const PROGRAM_OPTS   = ['12 Sesi - Pro','Tennis','Couple','Tennis Group','Fatloss & Bodyshape','Lainnya']
const PIPELINE_STAGES = ['New','Approach','Screening','Invoicing','Closing','Convert','Lost']
const ROWS_PER_PAGE   = 10

/* ═══════════════════════════════════════
   Dummy Data
═══════════════════════════════════════ */
const LEADS_INIT = [
  {
    id: 'LP-0001',
    nama: 'James Wilson',
    sapaan: 'Pak',
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
    sapaan: 'Kak',
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
    sapaan: 'Kak',
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
    sapaan: 'Mas',
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
    sapaan: 'Kak',
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
  {
    id: 'LP-0006',
    nama: 'Emily Chen',
    sapaan: 'Kak',
    tipe: 'Personal',
    noHp: '082345678901',
    sumberLead: 'Meta Ads',
    picEfm: 'Sarah Jenkins',
    programDiminati: 'Fatloss & Bodyshape',
    emailUmum: 'emily.chen@email.com',
    catatanAwal: 'Tertarik fatloss program, butuh jadwal fleksibel',
    statusPipeline: 'Convert',
    orderId: 'PP-26-0012',
    tanggalMasuk: '12 Mar 2026',
    tanggalFollowUp: null,
    catatan: 'Sudah convert ke Order PP-26-0012',
    logAktivitas: [
      { status: 'Convert',   oleh: 'Sarah Jenkins', tanggal: '20 Mar 2026', catatan: 'Order berhasil dibuat' },
      { status: 'Closing',   oleh: 'Sarah Jenkins', tanggal: '18 Mar 2026', catatan: 'Klien setuju paket' },
      { status: 'New',       oleh: 'Sarah Jenkins', tanggal: '12 Mar 2026', catatan: 'Lead masuk dari Meta Ads' },
    ],
  },
  {
    id: 'LP-0007',
    nama: 'Kevin Hartanto',
    sapaan: 'Mas',
    tipe: 'Personal',
    noHp: '081345678901',
    sumberLead: 'Referral',
    picEfm: 'Marcus Chen',
    programDiminati: '12 Sesi - Pro',
    emailUmum: 'kevin.hartanto@email.com',
    catatanAwal: 'Direferensikan oleh James Wilson',
    statusPipeline: 'Convert',
    orderId: 'PP-26-0004',
    tanggalMasuk: '18 Apr 2026',
    tanggalFollowUp: null,
    catatan: 'Sudah convert ke Order PP-26-0004',
    logAktivitas: [
      { status: 'Convert',   oleh: 'Marcus Chen', tanggal: '25 Apr 2026', catatan: 'Order berhasil dibuat' },
      { status: 'Screening', oleh: 'Marcus Chen', tanggal: '22 Apr 2026', catatan: 'Screening kesehatan selesai' },
      { status: 'New',       oleh: 'Marcus Chen', tanggal: '18 Apr 2026', catatan: 'Lead masuk dari referral' },
    ],
  },
  {
    id: 'LP-0008',
    nama: 'Natasha Putri',
    sapaan: 'Kak',
    tipe: 'Personal',
    noHp: '087811223344',
    sumberLead: 'Instagram',
    picEfm: 'Sarah Jenkins',
    programDiminati: 'Tennis',
    emailUmum: 'natasha.putri@email.com',
    catatanAwal: 'Menemukan EFM dari Instagram, mau coba tennis',
    statusPipeline: 'Convert',
    orderId: 'PP-26-0001',
    tanggalMasuk: '22 Apr 2026',
    tanggalFollowUp: null,
    catatan: 'Sudah convert ke Order PP-26-0001',
    logAktivitas: [
      { status: 'Convert', oleh: 'Sarah Jenkins', tanggal: '30 Apr 2026', catatan: 'Order berhasil dibuat' },
      { status: 'New',     oleh: 'Sarah Jenkins', tanggal: '22 Apr 2026', catatan: 'Lead masuk dari Instagram DM' },
    ],
  },
  {
    id: 'LP-0009',
    nama: 'Ahmad Fauzi',
    sapaan: 'Pak',
    tipe: 'Personal',
    noHp: '081122334455',
    sumberLead: 'Walk-in',
    picEfm: 'Marcus Chen',
    programDiminati: '12 Sesi - Pro',
    emailUmum: 'ahmad.fauzi@email.com',
    catatanAwal: 'Datang langsung, sudah komitmen mulai bulan depan',
    statusPipeline: 'Convert',
    orderId: 'PP-26-0002',
    tanggalMasuk: '5 Mei 2026',
    tanggalFollowUp: null,
    catatan: 'Sudah convert ke Order PP-26-0002',
    logAktivitas: [
      { status: 'Convert', oleh: 'Marcus Chen', tanggal: '10 Mei 2026', catatan: 'Order berhasil dibuat' },
      { status: 'New',     oleh: 'Marcus Chen', tanggal: '5 Mei 2026',  catatan: 'Walk-in langsung ke lokasi' },
    ],
  },
  {
    id: 'LP-0010',
    nama: 'Yoga Pratama',
    sapaan: 'Mas',
    tipe: 'Group',
    noHp: '087700112233',
    sumberLead: 'Google Ads',
    picEfm: 'Sarah Jenkins',
    programDiminati: 'Tennis Group',
    emailUmum: 'yoga.pratama@email.com',
    catatanAwal: 'Ingin daftar grup 3 orang, jadwal weekend',
    statusPipeline: 'Invoicing',
    tanggalMasuk: '2 Jul 2026',
    tanggalFollowUp: '2026-07-20',
    catatan: 'Invoice sudah dikirim, menunggu konfirmasi pembayaran',
    logAktivitas: [
      { status: 'Invoicing', oleh: 'Sarah Jenkins', tanggal: '12 Jul 2026', catatan: 'Invoice dikirim via WhatsApp' },
      { status: 'Screening', oleh: 'Sarah Jenkins', tanggal: '8 Jul 2026',  catatan: 'Screening group selesai' },
      { status: 'New',       oleh: 'Sarah Jenkins', tanggal: '2 Jul 2026',  catatan: 'Lead masuk dari Google Ads' },
    ],
  },
  {
    id: 'LP-0011',
    nama: 'Maya Indriati',
    sapaan: 'Kak',
    tipe: 'Personal',
    noHp: '082233445566',
    sumberLead: 'Website',
    picEfm: 'Marcus Chen',
    programDiminati: 'Fatloss & Bodyshape',
    emailUmum: 'maya.indriati@email.com',
    catatanAwal: 'Submit form website, tertarik program 8 sesi',
    statusPipeline: 'Closing',
    tanggalMasuk: '10 Jul 2026',
    tanggalFollowUp: '2026-07-25',
    catatan: 'Negosiasi harga, hampir deal',
    logAktivitas: [
      { status: 'Closing',   oleh: 'Marcus Chen', tanggal: '18 Jul 2026', catatan: 'Diskusi paket, hampir sepakat' },
      { status: 'Invoicing', oleh: 'Marcus Chen', tanggal: '15 Jul 2026', catatan: 'Draft invoice dikirim' },
      { status: 'Screening', oleh: 'Marcus Chen', tanggal: '13 Jul 2026', catatan: 'Screening selesai, hasil baik' },
      { status: 'New',       oleh: 'Marcus Chen', tanggal: '10 Jul 2026', catatan: 'Lead dari form website' },
    ],
  },
  {
    id: 'LP-0012',
    nama: 'Fiona Santika',
    sapaan: 'Kak',
    tipe: 'Personal',
    noHp: '081988776655',
    sumberLead: 'Referral',
    picEfm: 'Sarah Jenkins',
    programDiminati: 'Tennis',
    emailUmum: 'fiona.santika@email.com',
    catatanAwal: 'Referral dari teman, minat yoga dan tenis',
    statusPipeline: 'Convert',
    orderId: 'PP-26-0003',
    tanggalMasuk: '15 Agu 2026',
    tanggalFollowUp: null,
    catatan: 'Sudah convert ke Order PP-26-0003',
    logAktivitas: [
      { status: 'Convert', oleh: 'Sarah Jenkins', tanggal: '22 Agu 2026', catatan: 'Order berhasil dibuat' },
      { status: 'New',     oleh: 'Sarah Jenkins', tanggal: '15 Agu 2026', catatan: 'Lead masuk dari referral' },
    ],
  },
  {
    id: 'LP-0013',
    nama: 'Robert Taylor',
    sapaan: 'Pak',
    tipe: 'Personal',
    noHp: '081567890123',
    sumberLead: 'Website',
    picEfm: 'Marcus Chen',
    programDiminati: '12 Sesi - Pro',
    emailUmum: 'robert.taylor@email.com',
    catatanAwal: 'Expat, mencari personal trainer profesional',
    statusPipeline: 'Convert',
    orderId: 'PP-26-0011',
    tanggalMasuk: '22 Sep 2026',
    tanggalFollowUp: null,
    catatan: 'Sudah convert ke Order PP-26-0011',
    logAktivitas: [
      { status: 'Convert', oleh: 'Marcus Chen', tanggal: '28 Sep 2026', catatan: 'Order berhasil dibuat' },
      { status: 'New',     oleh: 'Marcus Chen', tanggal: '22 Sep 2026', catatan: 'Lead dari form website' },
    ],
  },
  {
    id: 'LP-0014',
    nama: 'Anita Suryani',
    sapaan: 'Kak',
    tipe: 'Personal',
    noHp: '085599887766',
    sumberLead: 'Meta Ads',
    picEfm: 'Sarah Jenkins',
    programDiminati: 'Fatloss & Bodyshape',
    emailUmum: 'anita.suryani@email.com',
    catatanAwal: 'Tertarik fatloss, target 5 kg dalam 2 bulan',
    statusPipeline: 'Convert',
    orderId: 'PP-26-0010',
    tanggalMasuk: '1 Okt 2026',
    tanggalFollowUp: null,
    catatan: 'Sudah convert ke Order PP-26-0010',
    logAktivitas: [
      { status: 'Convert', oleh: 'Sarah Jenkins', tanggal: '8 Okt 2026', catatan: 'Order berhasil dibuat' },
      { status: 'New',     oleh: 'Sarah Jenkins', tanggal: '1 Okt 2026', catatan: 'Lead masuk dari Meta Ads' },
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

  const [leads] = useState(() => { initLeads(LEADS_INIT); return getStoredLeads() })
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
          <button onClick={handleReset} className="px-3.5 py-[7px] bg-primary hover:bg-primary-2 text-white text-xs font-semibold rounded-lg transition-colors shrink-0">Reset</button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 420px)', minHeight: '280px' }}>
            <table className="w-full" style={{ minWidth: '1170px' }}>
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    ['Leads ID',110],['Nama',160],['Tipe',110],['No HP',130],
                    ['Program Diminati',160],['Sumber',120],['PIC EFM',130],
                    ['Status Pipeline',120],['Tanggal Masuk',120],
                  ].map(([h, mw]) => (
                    <th key={h} style={{minWidth:mw}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">Tidak ada data yang cocok dengan filter.</td></tr>
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
                    <td className="px-3 py-2.5"><TipeBadge tipe={lead.tipe} /></td>
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
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{lead.programDiminati}</td>
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{lead.sumberLead}</td>
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">{lead.picEfm}</td>
                    <td className="px-3 py-2.5"><StageBadge stage={lead.statusPipeline} /></td>
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
