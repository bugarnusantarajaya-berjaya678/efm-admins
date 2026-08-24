import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { getCompanySettings } from '../../utils/companySettings'
import { ArrowLeft, ChevronRight, Edit2, Save, X, Plus, Trash2, ChevronDown, ExternalLink, FileText, Printer, Eye, Download, CheckCircle, MapPin, Users, Calendar, ClipboardList, AlertTriangle, Activity, ImageIcon, Info, XCircle, RotateCcw, Upload, Paperclip, Lock } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { getAssessmentByOrderId } from '../../data/ppAssessmentsStore'
import { getOrderById, addOrder, getNextOrderId } from '../../data/ppOrdersStore'
import { getDocByOrderId, updateDoc as updateAgrDoc } from '../../data/ppDocumentsStore'
import { addReceipt } from '../../data/ppReceiptStore'

/* ═══════════════════════════════════════
   Constants
═══════════════════════════════════════ */
const BULAN_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

const TAHAPAN_CLS = {
  'Quotation & LOI':   'bg-amber-100 text-amber-700',
  'MOU':               'bg-blue-100 text-blue-700',
  'Contract':          'bg-purple-100 text-purple-700',
  'Program Berjalan': 'bg-green-100 text-green-700',
  'Selesai':           'bg-gray-100 text-gray-500',
}
const STATUS_CLS = {
  Aktif:     'bg-green-100 text-green-700',
  Completed: 'bg-blue-100 text-blue-700',
  Pending:   'bg-yellow-100 text-yellow-700',
  Selesai:   'bg-gray-100 text-gray-600',
  Batal:     'bg-red-100 text-red-600',
  Draft:     'bg-gray-100 text-gray-500',
}

function fmtRp(n) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n)
}
function fmtDate(str) {
  if (!str) return '—'
  const d = new Date(str)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
function fmtLogWaktu(d = new Date()) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ', ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const dummyPPPrograms = [
  { id:"PRG-PP-001", namaProgram:"Private Training", namaPaket:"4 Sesi - Starter",
    totalSesi:4, frekuensi:"2x seminggu", masaBerlaku:"30 hari", hargaPaket:600000,
    pic:{ nama:"Marcus Chen", spesialisasi:"Personal Trainer", rate:"Rp 150.000/sesi" },
    keterangan:"Cocok untuk pemula yang baru memulai latihan" },
  { id:"PRG-PP-002", namaProgram:"Private Training", namaPaket:"8 Sesi - Basic",
    totalSesi:8, frekuensi:"2x seminggu", masaBerlaku:"45 hari", hargaPaket:1400000,
    pic:{ nama:"Marcus Chen", spesialisasi:"Personal Trainer", rate:"Rp 175.000/sesi" },
    keterangan:"Include evaluasi fisik di sesi pertama" },
  { id:"PRG-PP-003", namaProgram:"Private Training", namaPaket:"12 Sesi - Pro",
    totalSesi:12, frekuensi:"3x seminggu", masaBerlaku:"60 hari", hargaPaket:2400000,
    pic:{ nama:"Sarah Jenkins", spesialisasi:"Personal Trainer", rate:"Rp 200.000/sesi" },
    keterangan:"Include program latihan harian dan evaluasi mingguan" },
  { id:"PRG-PP-004", namaProgram:"Private Training", namaPaket:"20 Sesi - Premium",
    totalSesi:20, frekuensi:"3x seminggu", masaBerlaku:"90 hari", hargaPaket:3800000,
    pic:{ nama:"Sarah Jenkins", spesialisasi:"Personal Trainer", rate:"Rp 190.000/sesi" },
    keterangan:"Include video analisis gerakan dan meal plan" },
  { id:"PRG-PP-005", namaProgram:"Yoga Private", namaPaket:"8 Sesi Yoga - Basic",
    totalSesi:8, frekuensi:"2x seminggu", masaBerlaku:"45 hari", hargaPaket:1280000,
    pic:{ nama:"Sari Dewi", spesialisasi:"Yoga Instructor", rate:"Rp 160.000/sesi" },
    keterangan:"Include matras yoga premium" },
  { id:"PRG-PP-006", namaProgram:"Yoga Private", namaPaket:"12 Sesi Yoga - Pro",
    totalSesi:12, frekuensi:"3x seminggu", masaBerlaku:"60 hari", hargaPaket:2160000,
    pic:{ nama:"Sari Dewi", spesialisasi:"Yoga Instructor", rate:"Rp 180.000/sesi" },
    keterangan:"Include sesi meditasi dan breathing exercise" },
  { id:"PRG-PP-007", namaProgram:"Pilates Private", namaPaket:"8 Sesi Pilates - Basic",
    totalSesi:8, frekuensi:"2x seminggu", masaBerlaku:"45 hari", hargaPaket:1360000,
    pic:{ nama:"Nia Rahayu", spesialisasi:"Pilates Instructor", rate:"Rp 170.000/sesi" },
    keterangan:"Include assessment postur di sesi pertama" },
  { id:"PRG-PP-008", namaProgram:"Pilates Private", namaPaket:"12 Sesi Pilates - Pro",
    totalSesi:12, frekuensi:"3x seminggu", masaBerlaku:"60 hari", hargaPaket:2220000,
    pic:{ nama:"Nia Rahayu", spesialisasi:"Pilates Instructor", rate:"Rp 185.000/sesi" },
    keterangan:"Include program rehabilitasi khusus" },
  { id:"PRG-PP-009", namaProgram:"Zumba Private", namaPaket:"8 Sesi Zumba - Basic",
    totalSesi:8, frekuensi:"2x seminggu", masaBerlaku:"45 hari", hargaPaket:1240000,
    pic:{ nama:"Bima Prakoso", spesialisasi:"Zumba Instructor", rate:"Rp 155.000/sesi" },
    keterangan:"Include akses playlist Zumba eksklusif" },
  { id:"PRG-PP-010", namaProgram:"Functional Training", namaPaket:"12 Sesi FT - Pro",
    totalSesi:12, frekuensi:"3x seminggu", masaBerlaku:"60 hari", hargaPaket:2340000,
    pic:{ nama:"Doni Kusuma", spesialisasi:"Functional Trainer", rate:"Rp 195.000/sesi" },
    keterangan:"Include functional movement screening" },
]

/* ── Per-order line items ─────────────────────────────────────────────────── */
function defaultLineItems(order) {
  return order?.rincianLayanan || [
    { id: 1, namaItem: order?.paket || '', satuan: 'Paket', jumlah: 1, keterangan: '' },
  ]
}

/* ── Quotation status styles ──────────────────────────────────────────────── */
const QUOTATION_STATUS_CLS = {
  'Draft':     'bg-gray-100 text-gray-600',
  'Terkirim':  'bg-blue-100 text-blue-700',
  'Disetujui': 'bg-green-100 text-green-700',
  'Ditolak':   'bg-red-100 text-red-600',
  'Revisi':    'bg-yellow-100 text-yellow-700',
}

/* ── Tahapan stepper ─────────────────────────────────────────────────────── */
const TAHAPAN_STEPS = ['Quotation', 'Agreement', 'Program Berjalan', 'Program Selesai']
const TAHAPAN_ORDER = { 'Quotation': 0, 'Agreement': 1, 'Program Berjalan': 2, 'Program Selesai': 3 }
const TAHAPAN_TO_STATUS = { 'Quotation': 'Draft', 'Agreement': 'Pending', 'Program Berjalan': 'Aktif', 'Program Selesai': 'Completed' }

/* ── Generate payment schedule ────────────────────────────────────────────── */
function generatePayRows(startStr, endStr, terms, nilaiNum) {
  if (!startStr || !endStr) return []
  let step = 1
  if (terms === '3 Months Terms')  step = 3
  else if (terms === '6 Months Terms') step = 6
  else if (terms === 'Annually')   step = 12

  const rows = []
  const cur  = new Date(startStr)
  cur.setDate(1)
  const endD = new Date(endStr)
  endD.setDate(1)
  let i = 0

  while (cur < endD && i < 24) {
    let label
    if (step === 1) {
      label = `${BULAN_ID[cur.getMonth()]} ${cur.getFullYear()}`
    } else {
      const pe = new Date(cur.getFullYear(), cur.getMonth() + step - 1, 1)
      label = `${BULAN_ID[cur.getMonth()]} ${cur.getFullYear()} – ${BULAN_ID[pe.getMonth()]} ${pe.getFullYear()}`
    }
    rows.push({ id: i, periode: label, nominal: nilaiNum * step, status: 'Belum Ditagih', tglBayar: '' })
    cur.setMonth(cur.getMonth() + step)
    i++
  }
  return rows
}


/* ═══════════════════════════════════════
   Small reusable components
═══════════════════════════════════════ */
function Badge({ children, cls }) {
  return (
    <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {children}
    </span>
  )
}

const AVATAR_COLORS = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777','#0284C7']
function getInitials(name) { return (name || '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() }
function getAvatarColor(name) {
  let hash = 0
  for (const c of (name || '')) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFFFF
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function SectionCard({ title, editing, onEdit, onSave, onCancel, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">{title}</h3>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={onSave}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Save size={12} /> Simpan
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                <X size={12} /> Batal
              </button>
            </>
          ) : (
            onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E05945] text-white text-xs font-semibold hover:bg-[#c94a38] transition-colors"
              >
                <Edit2 size={12} /> Edit
              </button>
            )
          )}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#1E1C43]' : 'bg-gray-200'}`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
export default function PPOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const settings = getCompanySettings()
  const isNew = !id || id === 'new'
  const fromState = location.state || {}
  const { setCrumbs } = useBreadcrumb()

  const order = isNew
    ? {
        id: 'BARU',
        namaKlien: fromState?.namaKlien || '',
        paket: fromState?.paket || '',
        tanggalMulai: '',
        picSalesEFM: '',
        picOpsEFM: '',
        catatanOrder: fromState?.rekomendasi || '',
        statusOrder: 'Draft',
        tahapan: 'Quotation & LOI',
        nilaiKontrak: 0,
        paymentTerms: 'Per Paket',
        rincianLayanan: [],
        paymentTracking: [],
      }
    : getOrderById(id)

  const agrDoc = getDocByOrderId(order?.id)
  const agrNomor = agrDoc?.id || (order?.id ? 'AGR-' + order.id : 'AGR-PP')

  /* ── Section state ───────────────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState(fromState?.defaultTab || 'keuangan')
  const [editingSection, setEditingSection] = useState(isNew ? 'infoDeal' : null)
  // null | 'infoDeal' | 'quotation' | 'paymentTerms' | 'profitSharing'

  /* Section 1 — Info Deal */
  const initInfo = order
    ? {
        namaKlien:         order.namaKlien         || '',
        paket:             order.paket             || '',
        tanggalMulai:      order.tanggalMulai      || '',
        tanggalSelesai:    order.tanggalSelesai    || '',
        pic:               order.picSalesEFM       || '',
        picOps:            order.picOpsEFM         || '',
        catatan:           order.catatanOrder      || '',
        noHP:              order.noHP              || '',
        email:             order.email             || '',
        hubunganKlien:     order.hubunganKlien     || 'Diri Sendiri',
        namaKlienLatihan:  order.namaKlienLatihan  || order.namaKlien || '',
        noHPKlien:         order.noHPKlien         || order.noHP || '',
        usiaKlien:         order.usiaKlien         || '',
        jenisKelaminKlien: order.jenisKelaminKlien || '',
        hariLatihan:       order.hariLatihan       || [],
        jamLatihan:        order.jamLatihan        || '',
        lokasiLatihan:     order.lokasiLatihan     || '',
        leadId:            order.leadId            || fromState?.leadId    || '',
        programId:         order.programId         || fromState?.programId || '',
      }
    : {}
  const [infoDeal, setInfoDeal] = useState(initInfo)
  const [infoDraft, setInfoDraft] = useState(initInfo)

  const initProgram = dummyPPPrograms.find(p => p.id === (order?.programId || ''))
  const [programSearch, setProgramSearch] = useState(
    initProgram ? `${initProgram.id} — ${initProgram.namaPaket}` : ''
  )
  const [programDropdownOpen, setProgramDropdownOpen] = useState(false)
  const [showGantiPaket, setShowGantiPaket] = useState(false)

  const initItems = order ? defaultLineItems(order) : []
  const [lineItems, setLineItems] = useState(initItems)
  const [itemsDraft, setItemsDraft] = useState(initItems)

  /* Section Quotation */
  const initQuotationItems = order?.rincianLayanan?.map((rl, i) => ({
    id: i + 1, item: rl.namaItem, satuan: rl.satuan, jumlah: rl.jumlah, rate: rl.total / (rl.jumlah || 1)
  })) || (order ? [{ id: 1, item: order.paket || '', satuan: 'Paket', jumlah: 1, rate: order.nilaiKontrak || 0 }] : [])
  const [quotationData, setQuotationData] = useState({
    nomorQuotation: order?.quotation?.nomor || `QUO/EFM/PP/2026/${id}`,
    tanggal: order?.quotation?.tanggal || order?.tanggalMulai || '',
    berlakuSampai: order?.tanggalMulai || '',
    items: initQuotationItems,
    managementFee: { aktif: order?.quotation?.manajemenFee || false, persen: order?.quotation?.manajemenFeePersen || 0 },
    pajakList: order?.quotation?.pajak?.map((p, i) => ({ id: i + 1, nama: p.nama, persen: p.persen, aktif: p.aktif })) || [{ id: 1, nama: 'PPN', persen: 11, aktif: false }],
    catatanSyarat: order?.quotation?.catatan || '',
    status: order?.quotation?.status || 'Draft',
  })
  const [quotationDraft, setQuotationDraft] = useState(null)


  /* Section — Profit Sharing (unused, kept to avoid errors) */
  const [hasPS, setHasPS] = useState(false)
  const initPS = [
    { id: 1, periode: 'Jun 2026', totalProfit: 12_000_000, persen: 15, status: 'Lunas',         tglTerima: '2026-06-10' },
    { id: 2, periode: 'Jul 2026', totalProfit: 12_000_000, persen: 15, status: 'Belum Diterima', tglTerima: '' },
  ]
  const [psRows,      setPsRows]      = useState(initPS)
  const [psRowsDraft, setPsRowsDraft] = useState(initPS)
  const [psPersen, setPsPersen]       = useState(15)
  const [psPersenDraft, setPsPersenDraft] = useState(15)

  /* ── Tab 2: Dokumen ─────────────────────────────────────────────────────── */
  const [expandQ,   setExpandQ]   = useState(true)
  const [expandMOU, setExpandMOU] = useState(false)
  const [expandC,   setExpandC]   = useState(true)
  const [adaMOU,    setAdaMOU]    = useState(false)
  const [editingDoc, setEditingDoc] = useState(null) // null|'quotation'|'mou'|'contract'

  /* ── Agreement Klien ─────────────────────────────────────────────────────── */
  const [agreementFlowStatus,    setAgreementFlowStatus]    = useState(() => {
    const doc = getDocByOrderId(order?.id)
    if (!doc) return 'menunggu_ttd'
    return doc.statusTtd === 'signed' ? 'disetujui'
      : doc.statusTtd === 'waiting_approval' ? 'pengajuan_masuk'
      : 'menunggu_ttd'
  })
  const [agreementCatatanTolak,  setAgreementCatatanTolak]  = useState('')
  const [showAgreementTolakForm, setShowAgreementTolakForm] = useState(false)
  const [qDoc, setQDoc] = useState({ status: 'Terkirim', signedFile: null, riwayat: [{ id:1, nama:'LOI-pt-maju-bersama.pdf', tanggal:'8 Jun 2026', status:'Terkirim' }] })
  const [mouDoc, setMouDoc] = useState({ status: 'Drafting', gdocsUrl: '', riwayat: [] })
  const [cDoc, setCDoc] = useState({ status: 'Signed', gdocsUrl: 'https://docs.google.com/document/d/xyz789', riwayat: [{ id:1, nama:'contract-pt-maju-final.pdf', tgl:'1 Jun 2026', status:'Signed' }] })
  const [qDraft, setQDraft]   = useState(null)
  const [mouDraft, setMouDraft] = useState(null)
  const [cDraft, setCDraft]   = useState(null)
  const [showLOIPreview, setShowLOIPreview] = useState(false)

  /* ── Tab 2: Jadwal Kegiatan ──────────────────────────────────────────────── */
  const [editingJadwal, setEditingJadwal] = useState(false)
  const [showTambahKegiatan, setShowTambahKegiatan] = useState(false)
  const [kgForm, setKgForm] = useState({ nama:'', vendor:'', tglMulai:'', tglSelesai:'', status:'Terjadwal' })
  const [kegiatanList, setKegiatanList] = useState([
    { id:1, nama:'Kunjungan Supervisor Bulanan',  vendor:'Ahmad Pratama',          tglMulai:'05 Jul 2026', tglSelesai:'05 Jul 2026', status:'Terjadwal' },
    { id:2, nama:'Perbaikan Treadmill & Alat',    vendor:'TechFix Service Center',  tglMulai:'10 Jul 2026', tglSelesai:'11 Jul 2026', status:'Terjadwal' },
    { id:3, nama:'Penagihan Invoice Jul 2026',    vendor:'Admin EFM',               tglMulai:'01 Jul 2026', tglSelesai:'01 Jul 2026', status:'Selesai'   },
    { id:4, nama:'Evaluasi Program Bulanan',      vendor:'Sarah Jenkins',           tglMulai:'28 Jun 2026', tglSelesai:'28 Jun 2026', status:'Selesai'   },
    { id:5, nama:'Pengadaan Seragam',             vendor:'CV. Sportwear Jakarta',   tglMulai:'15 Jul 2026', tglSelesai:'20 Jul 2026', status:'Terjadwal' },
  ])
  const [kegiatanDraft, setKegiatanDraft] = useState([])

  /* ── Tab 2: Laporan Kunjungan ────────────────────────────────────────────── */
  const [showFormLaporan, setShowFormLaporan] = useState(false)
  const [showPromptAI, setShowPromptAI] = useState(false)
  const [promptCopied, setPromptCopied] = useState(false)
  const [laporanList, setLaporanList] = useState([
    { id:1, tgl:'28 Jun 2026', pic:'Ahmad Pratama', kondisi:'Baik',  jmlAlat:'8 alat' },
    { id:2, tgl:'28 Mei 2026', pic:'Ahmad Pratama', kondisi:'Cukup', jmlAlat:'8 alat' },
  ])
  const initAlatRows = [
    { id:1, nama:'Treadmill #1',   kondisi:'Baik',                rekomendasi:'-',                   vendor:'-' },
    { id:2, nama:'Treadmill #2',   kondisi:'Perlu Servis Segera', rekomendasi:'Ganti belt segera',   vendor:'TechFix Service' },
    { id:3, nama:'Dumbbell Set',   kondisi:'Baik',                rekomendasi:'-',                   vendor:'-' },
    { id:4, nama:'Rowing Machine', kondisi:'Perlu Perhatian',     rekomendasi:'Kencangkan baut',     vendor:'Internal' },
    { id:5, nama:'Matras Yoga',    kondisi:'Baik',                rekomendasi:'-',                   vendor:'-' },
    { id:6, nama:'Barbell + Plates',kondisi:'Baik',               rekomendasi:'-',                   vendor:'-' },
    { id:7, nama:'Kolam Renang',   kondisi:'Cukup',               rekomendasi:'Cek kadar klorin',    vendor:'Internal' },
    { id:8, nama:'AC Ruangan',     kondisi:'Baik',                rekomendasi:'-',                   vendor:'-' },
  ]
  const [lForm, setLForm] = useState({ tgl:'', pic:'', kondisiUmum:'Baik', catatan:'', alat: initAlatRows, foto:[] })

  /* ── Tab 2: Laporan Insiden ──────────────────────────────────────────────── */
  const [showFormInsiden, setShowFormInsiden] = useState(false)
  const [insidenList, setInsidenList] = useState([
    { id:1, tglJam:'15 Jun 2026 09:30', kategori:'Kerusakan Alat',   deskripsi:'Treadmill #2 mati mendadak',    status:'Selesai' },
    { id:2, tglJam:'20 Jun 2026 14:00', kategori:'Keluhan Klien',    deskripsi:'AC ruangan tidak dingin',        status:'Dalam Penanganan' },
  ])
  const [iForm, setIForm] = useState({ tgl:'', jam:'', kategori:'Kerusakan Alat', lokasi:'', dilaporkan:'', statusAwal:'Baru', deskripsi:'', tindakan:'', foto:[] })

  /* ── Tab 3: Operasional Sesi (PP) ───────────────────────────────────────── */

  const [absensiSesi, setAbsensiSesi] = useState([
    { id:"ABS-001", jadwalId:"JS-001", tanggal:"2026-10-27", jam:"07:03", lokasi:"Hampton's Park Tower A, Lt. 12", device:"iPhone 14 - Safari",          foto:true,  catatanKoreksi:"" },
    { id:"ABS-002", jadwalId:"JS-002", tanggal:"2026-10-29", jam:"07:01", lokasi:"Hampton's Park Tower A, Lt. 12", device:"Samsung Galaxy S24 - Chrome",  foto:true,  catatanKoreksi:"" },
    { id:"ABS-003", jadwalId:"JS-003", tanggal:"2026-10-31", jam:"06:58", lokasi:"Hampton's Park Tower A, Lt. 12", device:"iPhone 14 - Safari",          foto:true,  catatanKoreksi:"" },
    { id:"ABS-004", jadwalId:"JS-004", tanggal:"2026-11-03", jam:"07:05", lokasi:"Hampton's Park Tower A, Lt. 12", device:"iPhone 13 - Safari",          foto:false, catatanKoreksi:"" },
  ])
  const [logTab3PP, setLogTab3PP] = useState([
    { id:1,  waktu:"3 Nov 2026, 07:05",  actor:"Sarah Jenkins", kategori:"absensi",   nomorLaporan:"ABS-004",              teks:"Absensi ABS-004 tercatat: Sarah Jenkins hadir 07:05" },
    { id:2,  waktu:"3 Nov 2026, 07:00",  actor:"Admin EFM",     kategori:"jadwal",    nomorLaporan:"JS-004",               teks:"Sesi JS-004 terjadwal: 3 Nov 2026 07:00 di Hampton's Park" },
    { id:3,  waktu:"31 Okt 2026, 07:00", actor:"Admin EFM",     kategori:"jadwal",    nomorLaporan:"JS-003",               teks:"Sesi JS-003 terjadwal: 31 Okt 2026 07:00 di Hampton's Park" },
    { id:4,  waktu:"29 Okt 2026, 07:01", actor:"Sarah Jenkins", kategori:"absensi",   nomorLaporan:"ABS-002",              teks:"Absensi ABS-002 tercatat: Sarah Jenkins hadir 07:01" },
    { id:5,  waktu:"27 Okt 2026, 07:03", actor:"Sarah Jenkins", kategori:"absensi",   nomorLaporan:"ABS-001",              teks:"Absensi ABS-001 tercatat: Sarah Jenkins hadir 07:03" },
    { id:6,  waktu:"24 Okt 2026, 09:00", actor:"Admin EFM",     kategori:"keuangan",  nomorLaporan:"INV-PP-26-0013",       teks:"Pembayaran INV-PP-26-0013 dikonfirmasi Lunas — Transfer · 24 Okt 2026" },
    { id:7,  waktu:"24 Okt 2026, 08:00", actor:"Admin EFM",     kategori:"keuangan",  nomorLaporan:"INV-PP-26-0013",       teks:"Invoice INV-PP-26-0013 dikirim ke James Wilson" },
    { id:8,  waktu:"21 Okt 2026, 14:00", actor:"Admin EFM",     kategori:"agreement", nomorLaporan:"AGR-PP-26-0013",       teks:"Agreement disetujui — dokumen TTD klien James Wilson diterima & dikonfirmasi" },
    { id:9,  waktu:"21 Okt 2026, 13:30", actor:"James Wilson",  kategori:"agreement", nomorLaporan:"AGR-PP-26-0013",       teks:"Agreement ditandatangani klien James Wilson — pengajuan masuk" },
    { id:10, waktu:"20 Okt 2026, 10:00", actor:"Admin EFM",     kategori:"keuangan",  nomorLaporan:"QUO/EFM/PP/2026/0013", teks:"Quotation QUO/EFM/PP/2026/0013 disetujui" },
    { id:11, waktu:"20 Okt 2026, 07:30", actor:"Admin EFM",     kategori:"keuangan",  nomorLaporan:"PP-26-0013",           teks:"Order PP-26-0013 dibuat untuk James Wilson oleh Admin EFM" },
  ])
  const [logFilter3PP,          setLogFilter3PP]          = useState("semua")
  const [editingAbsensi,        setEditingAbsensi]        = useState(null)
  const [showTambahAbsensiManual, setShowTambahAbsensiManual] = useState(false)
  const [tahapanState,          setTahapanState]          = useState(order?.tahapan || 'Quotation')
  const [statusOrderState,      setStatusOrderState]      = useState(order?.statusOrder || 'Aktif')
  const [showTahapanModal,      setShowTahapanModal]      = useState(false)
  const [pendingTahapan,        setPendingTahapan]        = useState(null)
  const [rekapStatus,           setRekapStatus]           = useState('belum_diajukan')
  const [rekapCatatanTolak,     setRekapCatatanTolak]     = useState('')
  const [showTolakModal,        setShowTolakModal]        = useState(false)
  const [honorariumBayarStatus,  setHonorariumBayarStatus]  = useState('menunggu_bayar')
  const [honorariumBuktiBayar,   setHonorariumBuktiBayar]   = useState(null)
  const [invoicePayStatus,        setInvoicePayStatus]        = useState(() => {
    const pt = order?.paymentTracking?.[0]
    if (!pt) return 'belum_bayar'
    return pt.status === 'Lunas' ? 'sudah_bayar' : pt.status === 'Terlambat' ? 'overdue' : 'belum_bayar'
  })
  const [showKonfirmasiPayModal,  setShowKonfirmasiPayModal]  = useState(false)
  const [konfirmasiPayForm,       setKonfirmasiPayForm]       = useState(() => {
    const pt = order?.paymentTracking?.[0]
    if (pt?.status === 'Lunas' && pt.tglBayar) {
      return { tglBayar: pt.tglBayar, metode: 'Transfer Bank', namaBukti: '' }
    }
    return { tglBayar: '', metode: 'Transfer Bank', namaBukti: '' }
  })

  const [invoicePP, setInvoicePP] = useState(() => {
    const pt = order?.paymentTracking?.[0]
    const invId = pt?.invoiceId || (order?.id && order.id !== 'BARU' ? `INV-${order.id}` : '')
    const tgl = order?.tanggalMulai || ''
    const jatuhTempo = tgl
      ? new Date(new Date(tgl).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : ''
    return {
      nomorInvoice: invId,
      tanggal: tgl,
      jatuhTempo,
      catatanInvoice: '',
      statusInvoice: pt?.status === 'Lunas' ? 'Lunas' : 'Draft',
    }
  })
  const [rincianDraft, setRincianDraft] = useState(order?.rincianLayanan || [])

  const subtotalPP = rincianDraft.reduce((s, i) => s + (i.total || 0), 0)
  const formatRpPP = (val) => 'Rp ' + Math.round(val || 0).toLocaleString('id-ID')


  useEffect(() => {
    const label = isNew ? 'Order Baru' : (order?.namaKlien || id)
    setCrumbs(['Private Program', 'Orders', label])
    return () => setCrumbs(null)
  }, [isNew, order?.namaKlien, id])

  /* ── 404 ─────────────────────────────────────────────────────────────────── */
  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400 text-sm mb-3">Order "{id}" tidak ditemukan.</p>
        <Link to="/pp/orders" className="text-[#E05945] text-sm font-medium hover:underline">
          ← Kembali ke daftar order
        </Link>
      </div>
    )
  }

  /* ── Computed values ─────────────────────────────────────────────────────── */
  function calcQuotationTotal(qData) {
    const sub = qData.items.reduce((s, it) => s + it.jumlah * it.rate, 0)
    let after = sub
    if (qData.managementFee.aktif) after = after + Math.round(sub * qData.managementFee.persen / 100)
    const pajak = qData.pajakList.filter(p => p.aktif).reduce((s, p) => s + Math.round(after * p.persen / 100), 0)
    return { sub, after, pajak, total: after + pajak }
  }
  const qCalc      = calcQuotationTotal(quotationData)
  const qCalcDraft = quotationDraft ? calcQuotationTotal(quotationDraft) : qCalc
  const subtotal   = qCalc.total   // "Nilai Kontrak (dari Quotation)"

  const programTerkait = order ? dummyPPPrograms.find((s) => s.id === order.programId) : null
  const filteredPrograms = programSearch
    ? dummyPPPrograms.filter(p =>
        p.id.toLowerCase().includes(programSearch.toLowerCase()) ||
        p.namaPaket.toLowerCase().includes(programSearch.toLowerCase()) ||
        p.namaProgram.toLowerCase().includes(programSearch.toLowerCase())
      )
    : dummyPPPrograms

  /* ── Edit handlers ───────────────────────────────────────────────────────── */
  function startEdit(section) {
    if (editingSection && editingSection !== section) return
    setEditingSection(section)
    if (section === 'infoDeal') {
      setInfoDraft({ ...infoDeal })
      setItemsDraft(lineItems.map(li => ({ ...li })))
      const prog = dummyPPPrograms.find(p => p.id === infoDeal.programId)
      setProgramSearch(prog ? `${prog.id} — ${prog.namaPaket}` : '')
      setShowGantiPaket(false)
    }
    if (section === 'quotation') {
      setQuotationDraft({
        ...quotationData,
        items: quotationData.items.map(it => ({ ...it })),
        managementFee: { ...quotationData.managementFee },
        pajakList: quotationData.pajakList.map(p => ({ ...p })),
      })
    }
    if (section === 'profitSharing') {
      setPsPersenDraft(psPersen)
      setPsRowsDraft(psRows.map(r => ({ ...r })))
    }
    if (section === 'dataKlienTambahan') {
      setInfoDraft({ ...infoDeal })
    }
  }

  function cancelEdit() { setEditingSection(null); setQuotationDraft(null); setShowGantiPaket(false) }

  function saveInfoDeal() {
    setInfoDeal({ ...infoDraft })
    setLineItems([...itemsDraft])
    const prog = dummyPPPrograms.find(p => p.id === infoDraft.programId)
    if (prog) {
      setRincianDraft(prev => [
        { id: 1, namaItem: `${prog.namaProgram} ${prog.namaPaket}`, satuan: 'Paket', jumlah: 1, total: prog.hargaPaket },
        ...prev.slice(1)
      ])
    }
    setEditingSection(null)
  }

  function saveDataKlienTambahan() {
    setInfoDeal({ ...infoDraft })
    setEditingSection(null)
  }

  function saveQuotation() {
    setQuotationData({ ...quotationDraft })
    setQuotationDraft(null)
    setEditingSection(null)
  }

  function saveProfitSharing() {
    setPsPersen(psPersenDraft)
    setPsRows([...psRowsDraft])
    setEditingSection(null)
  }

  function updateItemDraft(idx, field, val) {
    setItemsDraft(p => p.map((li, i) => i === idx ? { ...li, [field]: val } : li))
  }
  function updatePsRowDraft(idx, field, val) {
    setPsRowsDraft(p => p.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }
  function updateQItemDraft(idx, field, val) {
    setQuotationDraft(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) }))
  }

  function handleSimpanOrderBaru() {
    const newId = getNextOrderId()
    const newOrder = {
      id: newId,
      ...infoDraft,
      statusOrder: infoDraft.statusOrder || 'Aktif',
      tahapan: infoDraft.tahapan || 'Program Berjalan',
      nilaiKontrak: lineItems.reduce((s, i) => s + (i.total || 0), 0),
      rincianLayanan: lineItems,
      paymentTracking: [],
      loiStatus: 'N/A', mouAda: false, contractStatus: 'Active',
      quotation: { manajemenFee: false, manajemenFeePersen: 0, pajak: [{ nama: 'PPN 11%', persen: 11, aktif: false }], status: 'Draft', catatan: '' },
    }
    addOrder(newOrder)
    navigate('/pp/orders/' + newId)
  }

  /* ── LOI data ────────────────────────────────────────────────────────────── */
  const loiData = {
    namaKlien:      infoDeal.namaKlien      || 'PT. Maju Bersama',
    jenis:          infoDeal.jenis          || 'Corporate',
    programLayanan: infoDeal.program        || 'Corporate Wellness',
    picKlien:       infoDeal.pic            || 'Admin EFM',
    tanggalMulai:   infoDeal.tanggalMulai   || '2026-06-01',
    tanggalSelesai: infoDeal.tanggalSelesai || '2027-06-01',
    durasiKontrak: (() => {
      if (!infoDeal.tanggalMulai || !infoDeal.tanggalSelesai) return '12'
      const mulai   = new Date(infoDeal.tanggalMulai)
      const selesai = new Date(infoDeal.tanggalSelesai)
      return String(Math.round((selesai - mulai) / (1000 * 60 * 60 * 24 * 30)))
    })(),
    rincianLayanan: lineItems.length > 0 ? lineItems : [
      { namaItem: 'Jasa Fitness Management Bulanan',  satuan: 'Bulan', jumlah: 1, rate: 11_280_000 },
      { namaItem: 'Biaya Operasional & Transportasi', satuan: 'Bulan', jumlah: 1, rate:    720_000 },
    ],
    subtotal:       qCalc.sub              || 12_000_000,
    nomorQuotation: quotationData.nomorQuotation || 'QUO/EFM/PP/2026/001',
    totalPenawaran: qCalc.total            || 2_400_000,
    nomorLOI: (() => {
      const tahun   = new Date().getFullYear()
      const orderId = (id || 'PP-001').replace('#', '').replace('PP-', '')
      return `LOI/EFM/PP/${tahun}/${orderId}`
    })(),
    tanggalLOI: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
  }

  function handleCopyLOI() {
    const lines = [
      loiData.nomorLOI,
      '',
      'Kepada YTH:',
      loiData.namaKlien,
      `Up: ${loiData.picKlien}`,
      '',
      'Dengan hormat,',
      '',
      `CV. Bugar Nusantara Jaya (Essential Fitness Management / EFM) menyampaikan Letter of Intent untuk kerjasama layanan kebugaran dan wellness dengan ${loiData.namaKlien}.`,
      '',
      `Program         : ${loiData.programLayanan}`,
      `Periode         : ${fmtDate(loiData.tanggalMulai)} s/d ${fmtDate(loiData.tanggalSelesai)} (${loiData.durasiKontrak} bulan)`,
      `Estimasi Nilai  : ${fmtRp(loiData.subtotal)}/bulan`,
      `Total Penawaran : ${fmtRp(loiData.totalPenawaran)} (sudah termasuk pajak)`,
      `No. Quotation   : ${loiData.nomorQuotation}`,
      '',
      `Jakarta, ${loiData.tanggalLOI}`,
      '',
      'Hormat kami,',
      'CV. Bugar Nusantara Jaya',
      'Essential Fitness Management',
      '',
      'Bagoes Soeharto',
      'Owner & Co-Founder',
    ]
    navigator.clipboard.writeText(lines.join('\n'))
  }

  /* ── Tab 3 helpers ───────────────────────────────────────────────────────── */
  const formatWA = (wa) => wa.replace(/^0/, "62").replace(/\D/g, "")

  const severityColor = (s) => {
    if (s === "Critical") return "bg-red-100 text-red-700"
    if (s === "High")     return "bg-orange-100 text-orange-700"
    if (s === "Medium")   return "bg-yellow-100 text-yellow-700"
    return "bg-blue-100 text-blue-700"
  }

  const statusJadwalColor = (s) => {
    if (s === "Selesai")     return "bg-green-100 text-green-700"
    if (s === "Berlangsung") return "bg-blue-100 text-blue-700"
    if (s === "Dibatalkan")  return "bg-red-100 text-red-700"
    return "bg-gray-100 text-gray-600"
  }


  /* ── Render ──────────────────────────────────────────────────────────────── */

  return (
    <>
      <div className="space-y-5">

      {/* Banner: new order from survei */}
      {isNew && fromState?.fromProgram && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-700 flex items-center gap-2">
            <span>📋</span>
            Order baru dari Program <span className="font-semibold">{fromState?.programId}</span> — Data klien sudah pre-filled
          </p>
        </div>
      )}


      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

        {/* Single row: Avatar+Info LEFT, Buttons+NilaiKontrak RIGHT — matches Lead Detail pattern */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-1">
            {/* Avatar circle */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
              style={{ background: getAvatarColor(order.namaKlien) }}
            >
              {getInitials(order.namaKlien)}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{isNew ? 'PP-DRAFT' : order.id}</p>
              <h1 className="text-xl font-bold text-[#1E1C43] leading-tight">{isNew ? 'Order Baru' : order.namaKlien}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <Badge cls="bg-purple-100 text-purple-700">{order.paket || '—'}</Badge>
                <Badge cls={STATUS_CLS[statusOrderState] ?? 'bg-gray-100 text-gray-600'}>● {statusOrderState}</Badge>
                <span className="text-[10px] text-gray-400">Mulai {order.tanggalMulai ? fmtDate(order.tanggalMulai) : '—'}</span>
              </div>
              <div className="flex items-center gap-1 mt-3 flex-wrap">
                {TAHAPAN_STEPS.map((step, i) => {
                  const orderIdx = TAHAPAN_ORDER[tahapanState] ?? 0
                  const stepIdx  = TAHAPAN_ORDER[step] ?? i
                  const isActive = stepIdx === orderIdx
                  const isDone   = stepIdx < orderIdx
                  return (
                    <div key={step} className="flex items-center gap-1">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-[#E05945] text-white' : isDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {step}
                      </span>
                      {i < TAHAPAN_STEPS.length - 1 && <div className="w-4 h-px bg-gray-300" />}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          {/* Right: action buttons atas, Nilai Kontrak bawah */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="flex items-center gap-2">
              {!isNew && (
                <button
                  onClick={() => setShowTahapanModal(true)}
                  className="inline-flex items-center gap-1.5 bg-[#E05945] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#c94a38] transition-colors font-medium"
                >
                  Ubah Tahapan
                </button>
              )}
              <button
                onClick={() => fromState?.fromLeadId ? navigate('/pp/leads/' + fromState.fromLeadId) : navigate('/pp/orders')}
                className="inline-flex items-center gap-1.5 bg-[#E05945] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#c94a38] transition-colors font-medium"
              >
                <ArrowLeft size={12} /> Kembali
              </button>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Nilai Kontrak</p>
              <p className="text-xl font-bold text-[#1E1C43]">
                {fmtRp(order.nilaiKontrak || subtotal)}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">PIC: {order.picOpsEFM}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl shadow-sm p-1 mb-5 overflow-x-auto">
        {[
          { key: 'keuangan',    label: 'Kontrak & Keuangan',   locked: false },
          { key: 'agreement',   label: 'Agreement Klien',       locked: isNew },
          { key: 'operasional', label: 'Operasional Lapangan', locked: isNew },
          { key: 'log',         label: 'Log & Histori',         locked: isNew },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => !tab.locked && setActiveTab(tab.key)}
            title={tab.locked ? 'Simpan order terlebih dahulu' : undefined}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              tab.locked
                ? 'text-gray-300 cursor-not-allowed'
                : activeTab === tab.key
                  ? 'bg-[#1E1C43] text-white'
                  : 'text-gray-500 hover:text-[#1E1C43]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1 — Kontrak & Keuangan
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'keuangan' && (
        <>


          {/* ── Card: Data Klien ── */}
          {!isNew && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Data Klien</h3>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                    <Lock size={9} /> Nama &amp; Kontak dari Leads
                  </span>
                </div>
                {editingSection === 'dataKlienTambahan' ? (
                  <div className="flex gap-2">
                    <button onClick={cancelEdit} className="h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50">Batal</button>
                    <button onClick={saveDataKlienTambahan} className="h-8 px-3 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold">Simpan</button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit('dataKlienTambahan')}
                    disabled={!!editingSection && editingSection !== 'dataKlienTambahan'}
                    className="h-8 px-3 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Edit Info Tambahan
                  </button>
                )}
              </div>
              <div className="p-5">
                {/* Pendaftar */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pendaftar</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Nama Pendaftar', val: infoDeal.namaKlien },
                      { label: 'No. HP',         val: infoDeal.noHP      },
                      { label: 'Email',          val: infoDeal.email     },
                    ].map(({ label, val }) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Lock size={9} className="text-gray-300" /> {label}
                        </p>
                        <p className="text-sm font-semibold text-gray-800">{val || '—'}</p>
                      </div>
                    ))}
                    {/* Editable: Hub. dengan Klien */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Hub. dengan Klien</p>
                      {editingSection === 'dataKlienTambahan' ? (
                        <select
                          value={infoDraft?.hubunganKlien || ''}
                          onChange={e => setInfoDraft(d => ({ ...d, hubunganKlien: e.target.value }))}
                          className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#1E1C43] bg-white"
                        >
                          {['Diri Sendiri','Orang Tua','Pasangan','Anak','Saudara','Lainnya'].map(o => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-gray-800">{infoDeal.hubunganKlien || '—'}</p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Klien Latihan */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Klien Latihan</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Nama Klien',   val: infoDeal.namaKlienLatihan },
                      { label: 'No. HP Klien', val: infoDeal.noHPKlien        },
                    ].map(({ label, val }) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Lock size={9} className="text-gray-300" /> {label}
                        </p>
                        <p className="text-sm font-semibold text-gray-800">{val || '—'}</p>
                      </div>
                    ))}
                    {/* Editable: Usia */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Usia</p>
                      {editingSection === 'dataKlienTambahan' ? (
                        <input
                          type="number" min="1" max="99"
                          value={infoDraft?.usiaKlien || ''}
                          onChange={e => setInfoDraft(d => ({ ...d, usiaKlien: e.target.value }))}
                          className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#1E1C43] bg-white"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-gray-800">{infoDeal.usiaKlien ? infoDeal.usiaKlien + ' tahun' : '—'}</p>
                      )}
                    </div>
                    {/* Editable: Jenis Kelamin */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Jenis Kelamin</p>
                      {editingSection === 'dataKlienTambahan' ? (
                        <select
                          value={infoDraft?.jenisKelaminKlien || ''}
                          onChange={e => setInfoDraft(d => ({ ...d, jenisKelaminKlien: e.target.value }))}
                          className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#1E1C43] bg-white"
                        >
                          {['Laki-laki','Perempuan'].map(o => <option key={o}>{o}</option>)}
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-gray-800">{infoDeal.jenisKelaminKlien || '—'}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
                  <Info size={11} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700">Nama, No. HP, dan Email dikunci karena bersumber dari data Leads. Hubungan dengan Klien, Usia, dan Jenis Kelamin dapat diubah jika ada kesalahan input.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Section: Detail Program & Operasional ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">{isNew ? 'Info Deal & Detail Program' : 'Detail Program & Operasional'}</h3>
              {editingSection === 'infoDeal' ? (
                <div className="flex gap-2">
                  <button
                    onClick={isNew ? handleSimpanOrderBaru : saveInfoDeal}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                    <Save size={12} /> {isNew ? 'Buat Order' : 'Simpan'}
                  </button>
                  {!isNew && (
                    <button onClick={cancelEdit} className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                      <X size={12} /> Batal
                    </button>
                  )}
                </div>
              ) : (
                <button onClick={() => startEdit('infoDeal')} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E05945] text-white text-xs font-semibold hover:bg-[#c94a38] transition-colors">
                  <Edit2 size={12} /> Edit
                </button>
              )}
            </div>
            <div className="p-5">

            {/* Data Pendaftar + Data Klien Latihan — only shown on new order form */}
            {isNew && (
              <>
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Data Pendaftar</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: 'Nama Pendaftar',          field: 'namaKlien',     type: 'text' },
                    { label: 'No. HP',                  field: 'noHP',          type: 'tel'  },
                    { label: 'Email',                   field: 'email',         type: 'email'},
                  ].map(({ label, field, type }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                      {editingSection === 'infoDeal' ? (
                        <input type={type} value={infoDraft[field] || ''} placeholder={`Isi ${label.toLowerCase()}`}
                          onChange={e => setInfoDraft(p => ({...p, [field]: e.target.value}))}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#1E1C43] bg-white" />
                      ) : (
                        <p className="text-sm font-semibold text-gray-800">{infoDeal[field] || '—'}</p>
                      )}
                    </div>
                  ))}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Hubungan dengan Klien</p>
                    {editingSection === 'infoDeal' ? (
                      <select value={infoDraft.hubunganKlien || 'Diri Sendiri'} onChange={e => setInfoDraft(p => ({...p, hubunganKlien: e.target.value}))}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#1E1C43] bg-white">
                        {['Diri Sendiri','Pasangan','Anak','Orang Tua','Keluarga Lain','Lainnya'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-gray-800">{infoDeal.hubunganKlien || '—'}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Data Klien Latihan</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: 'Nama Klien Latihan', field: 'namaKlienLatihan', type: 'text' },
                    { label: 'No. HP Klien',       field: 'noHPKlien',        type: 'tel'  },
                  ].map(({ label, field, type }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                      {editingSection === 'infoDeal' ? (
                        <input type={type} value={infoDraft[field] || ''} placeholder={`Isi ${label.toLowerCase()}`}
                          onChange={e => setInfoDraft(p => ({...p, [field]: e.target.value}))}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#1E1C43] bg-white" />
                      ) : (
                        <p className="text-sm font-semibold text-gray-800">{infoDeal[field] || '—'}</p>
                      )}
                    </div>
                  ))}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Usia</p>
                    {editingSection === 'infoDeal' ? (
                      <div className="flex items-center gap-1.5">
                        <input type="number" min="1" max="99" value={infoDraft.usiaKlien || ''} placeholder="0"
                          onChange={e => setInfoDraft(p => ({...p, usiaKlien: e.target.value}))}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#1E1C43] bg-white" />
                        <span className="text-xs text-gray-400 whitespace-nowrap">tahun</span>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-gray-800">{infoDeal.usiaKlien ? infoDeal.usiaKlien + ' tahun' : '—'}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Jenis Kelamin</p>
                    {editingSection === 'infoDeal' ? (
                      <select value={infoDraft.jenisKelaminKlien || ''} onChange={e => setInfoDraft(p => ({...p, jenisKelaminKlien: e.target.value}))}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#1E1C43] bg-white">
                        <option value="">-- Pilih --</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-gray-800">{infoDeal.jenisKelaminKlien || '—'}</p>
                    )}
                  </div>
                </div>
              </div>
              </>
            )}

            {/* Program & Rincian Biaya */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Program & Rincian Biaya</p>

              {/* Combobox — shown only when Ganti Paket is triggered in edit mode */}
              {editingSection === 'infoDeal' && showGantiPaket && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pilih Program & Paket</p>
                    <button onClick={() => setShowGantiPaket(false)}
                      className="text-xs text-gray-400 hover:text-gray-600 transition">Batal</button>
                  </div>
                  <div className="relative">
                    <input type="text" value={programSearch}
                      onChange={e => { setProgramSearch(e.target.value); setProgramDropdownOpen(true) }}
                      onFocus={() => { setProgramSearch(''); setProgramDropdownOpen(true) }}
                      onBlur={() => setTimeout(() => {
                        setProgramDropdownOpen(false)
                        const prog = dummyPPPrograms.find(p => p.id === infoDraft.programId)
                        if (prog) setProgramSearch(`${prog.id} — ${prog.namaPaket}`)
                      }, 150)}
                      placeholder="Ketik ID program atau nama paket..."
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#1E1C43] bg-white pr-8" />
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    {programDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-52 overflow-y-auto">
                        {filteredPrograms.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-3">Tidak ada paket ditemukan</p>
                        ) : filteredPrograms.map(prog => (
                          <button key={prog.id} type="button"
                            onMouseDown={() => {
                              setInfoDraft(p => ({ ...p, programId: prog.id, paket: prog.namaPaket }))
                              setProgramSearch(`${prog.id} — ${prog.namaPaket}`)
                              setProgramDropdownOpen(false)
                              setShowGantiPaket(false)
                            }}
                            className={`w-full text-left px-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-blue-50 transition-colors flex items-center gap-2 ${
                              infoDraft.programId === prog.id ? 'bg-blue-50' : ''
                            }`}>
                            <span className="text-[10px] font-semibold text-[#1E1C43] bg-[#1E1C43]/10 px-1.5 py-0.5 rounded">{prog.id}</span>
                            <span className="text-xs text-gray-500">{prog.namaProgram}</span>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs font-medium text-gray-700 flex-1">{prog.namaPaket}</span>
                            <span className="text-xs font-semibold text-[#E05945] shrink-0">{formatRpPP(prog.hargaPaket)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Compact paket strip — shown always (unless ganti paket combobox is active) */}
              {!(editingSection === 'infoDeal' && showGantiPaket) && (() => {
                const stripProg = editingSection === 'infoDeal'
                  ? (dummyPPPrograms.find(p => p.id === infoDraft.programId) || programTerkait)
                  : programTerkait
                return stripProg ? (
                  <div className="bg-gray-50 rounded-xl p-4 mb-3">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-mono mb-0.5">{stripProg.id}</p>
                        <p className="text-sm font-bold text-[#1E1C43]">
                          {stripProg.namaProgram}
                          <span className="font-normal text-gray-500"> · {stripProg.namaPaket}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="text-base font-bold text-[#1E1C43]">{formatRpPP(stripProg.hargaPaket)}</p>
                        {editingSection === 'infoDeal' && (
                          <button onClick={() => setShowGantiPaket(true)}
                            className="text-xs border border-gray-200 text-gray-500 bg-white rounded-lg px-3 py-1 hover:bg-gray-100 transition whitespace-nowrap">
                            Ganti Paket
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {[stripProg.totalSesi + ' sesi', stripProg.frekuensi, stripProg.masaBerlaku].map(v => (
                        <span key={v} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{v}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#1E1C43] text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
                        {getInitials(stripProg.pic.nama)}
                      </div>
                      <p className="text-xs text-gray-600 flex-1">{stripProg.pic.nama} · {stripProg.pic.spesialisasi}</p>
                      <p className="text-xs text-[#E05945] font-medium shrink-0">{stripProg.pic.rate}</p>
                    </div>
                    {stripProg.keterangan && (
                      <p className="text-xs text-gray-400 italic mt-2">{stripProg.keterangan}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 mb-3 text-center text-xs text-gray-400 italic">
                    Data program tidak ditemukan
                  </div>
                )
              })()}

              {/* Biaya tambahan */}
              {editingSection === 'infoDeal' ? (
                <div className="space-y-2 mb-3">
                  {rincianDraft.slice(1).map((item, idx) => (
                    <div key={item.id || idx} className="border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Biaya Tambahan</span>
                        <button
                          onClick={() => setRincianDraft(prev => prev.filter((_, i) => i !== idx + 1))}
                          className="ml-auto text-gray-300 hover:text-red-500 transition">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="col-span-2">
                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Nama Item</label>
                          <input type="text" value={item.namaItem || ''}
                            onChange={e => setRincianDraft(prev => prev.map((it, i) =>
                              i === idx + 1 ? { ...it, namaItem: e.target.value } : it
                            ))}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#1E1C43]" />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Jumlah</label>
                          <input type="number" value={item.jumlah ?? 1} min="1"
                            onChange={e => setRincianDraft(prev => prev.map((it, i) => {
                              if (i !== idx + 1) return it
                              const jml = Number(e.target.value)
                              const harga = it.harga ?? (it.total / Math.max(1, it.jumlah || 1))
                              return { ...it, jumlah: jml, total: jml * harga }
                            }))}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#1E1C43]" />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Harga (Rp)</label>
                          <input type="number" value={item.harga ?? (item.total / Math.max(1, item.jumlah || 1))} min="0"
                            onChange={e => setRincianDraft(prev => prev.map((it, i) => {
                              if (i !== idx + 1) return it
                              const harga = Number(e.target.value)
                              return { ...it, harga, total: (it.jumlah ?? 1) * harga }
                            }))}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#1E1C43]" />
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="text-xs text-gray-400">Subtotal: </span>
                        <span className="text-sm font-bold text-[#1E1C43]">{formatRpPP(item.total)}</span>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setRincianDraft(prev => [...prev, { id: Date.now(), namaItem: '', jumlah: 1, harga: 0, total: 0 }])}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-xs text-gray-400 hover:border-[#1E1C43] hover:text-[#1E1C43] transition flex items-center justify-center gap-2">
                    <Plus size={14} /> Tambah Biaya Lain (Transport, Sewa Alat, dll)
                  </button>
                </div>
              ) : (
                rincianDraft.slice(1).length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {rincianDraft.slice(1).map((item, idx) => (
                      <div key={item.id || idx} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{item.namaItem || '—'}</p>
                        <p className="text-sm font-semibold text-gray-800">{formatRpPP(item.total)}</p>
                      </div>
                    ))}
                  </div>
                )
              )}

              <div className="bg-[#1E1C43] rounded-xl px-4 py-3 flex justify-between items-center mt-3">
                <span className="text-sm font-medium text-white/80">Total Nilai Order</span>
                <span className="text-base font-bold text-white">{formatRpPP(subtotalPP)}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 my-5" />

            {/* Jadwal Latihan */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Jadwal Latihan</p>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Hari Latihan</p>
                  {editingSection === 'infoDeal' ? (
                    <div className="flex flex-wrap gap-1">
                      {["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"].map(h => {
                        const selected = (infoDraft.hariLatihan || []).includes(h)
                        return (
                          <button key={h} type="button"
                            onClick={() => setInfoDraft(p => ({
                              ...p,
                              hariLatihan: selected
                                ? (p.hariLatihan || []).filter(x => x !== h)
                                : [...(p.hariLatihan || []), h]
                            }))}
                            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                              selected ? 'bg-[#1E1C43] text-white border-[#1E1C43]' : 'bg-white text-gray-500 border-gray-300 hover:border-[#1E1C43]'
                            }`}>
                            {h}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {(infoDeal.hariLatihan?.length ? infoDeal.hariLatihan : order.hariLatihan || []).map(h => (
                        <span key={h} className="bg-[#1E1C43] text-white text-xs px-2 py-0.5 rounded-full">{h}</span>
                      ))}
                      {!(infoDeal.hariLatihan?.length || order.hariLatihan?.length) && <span className="text-sm font-semibold text-gray-800">—</span>}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Jam Latihan</p>
                    {editingSection === 'infoDeal' ? (
                      <input type="time" value={infoDraft.jamLatihan || ''} onChange={e => setInfoDraft(p => ({...p, jamLatihan: e.target.value}))}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#1E1C43] bg-white" />
                    ) : (
                      <p className="text-sm font-semibold text-gray-800">{infoDeal.jamLatihan || order.jamLatihan || '—'}{(infoDeal.jamLatihan || order.jamLatihan) ? ' WIB' : ''}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tanggal Mulai</p>
                    {editingSection === 'infoDeal' ? (
                      <input type="date" value={infoDraft.tanggalMulai || ''} onChange={e => setInfoDraft(p => ({...p, tanggalMulai: e.target.value}))}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#1E1C43] bg-white" />
                    ) : (
                      <p className="text-sm font-semibold text-gray-800">{infoDeal.tanggalMulai || order.tanggalMulai || '—'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 my-5" />

            {/* Lokasi Latihan */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Lokasi Latihan</p>
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Nama / Alamat Lokasi</p>
                  {editingSection === 'infoDeal' ? (
                    <input type="text" value={infoDraft.lokasiLatihan || ''} placeholder="cth. Hampton's Park Tower A, Lt. 3 — Gym Area"
                      onChange={e => setInfoDraft(p => ({...p, lokasiLatihan: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#1E1C43] bg-white" />
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">{infoDeal.lokasiLatihan || order.lokasiLatihan || '—'}</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Link Google Maps</p>
                  {editingSection === 'infoDeal' ? (
                    <input type="text" value={infoDraft.linkMaps || ''} placeholder="https://maps.google.com/..."
                      onChange={e => setInfoDraft(p => ({...p, linkMaps: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#1E1C43] bg-white" />
                  ) : (
                    infoDeal.linkMaps || order.linkMaps ? (
                      <a href={infoDeal.linkMaps || order.linkMaps} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-semibold text-blue-600 hover:underline truncate block">
                        {infoDeal.linkMaps || order.linkMaps}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-gray-800">—</p>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Catatan Order */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Catatan / Target Klien</p>
              {editingSection === 'infoDeal' ? (
                <textarea value={infoDraft.catatan || ''} onChange={e => setInfoDraft(p => ({...p, catatan: e.target.value}))}
                  rows={3} placeholder="Target klien, catatan khusus, kondisi kesehatan yang perlu diperhatikan, dll..."
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#1E1C43] resize-none bg-white" />
              ) : (
                <p className="text-sm font-semibold text-gray-800">{infoDeal.catatan || order.catatanOrder || '—'}</p>
              )}
            </div>
            </div>
          </div>

          {/* ── Section: Invoice & Pembayaran Klien ── */}
          {(() => {
            const isOverdue = invoicePP.jatuhTempo && new Date(invoicePP.jatuhTempo) < new Date() && invoicePayStatus !== 'sudah_bayar'
            const daysLeft = invoicePP.jatuhTempo ? Math.ceil((new Date(invoicePP.jatuhTempo) - new Date()) / (1000*60*60*24)) : null
            const receiptId = invoicePP.nomorInvoice.replace('INV-', 'RCP-')
            return (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Invoice & Pembayaran Klien</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    invoicePayStatus === 'sudah_bayar' ? 'bg-green-100 text-green-700' :
                    isOverdue ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {invoicePayStatus === 'sudah_bayar' ? '✓ Lunas' : isOverdue ? '⚠ Overdue' : 'Belum Bayar'}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/pp/invoice/${invoicePP.nomorInvoice}`, { state: { fromOrderId: order.id, fromOrderName: order.namaKlien } })}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">
                      <Eye size={12} /> Buka Invoice
                    </button>
                    {invoicePayStatus !== 'sudah_bayar' && (
                      <button
                        onClick={() => setShowKonfirmasiPayModal(true)}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90 transition-colors">
                        <CheckCircle size={12} /> Konfirmasi Pembayaran
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {/* Info grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      ['No. Invoice',   invoicePP.nomorInvoice],
                      ['Jatuh Tempo',   fmtDate(invoicePP.jatuhTempo)],
                      ['Total Tagihan', formatRpPP(subtotalPP)],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-sm font-semibold text-gray-800">{val || '—'}</p>
                      </div>
                    ))}
                  </div>

                  {/* Overdue warning */}
                  {isOverdue && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 font-medium">
                        Invoice telah melewati jatuh tempo ({fmtDate(invoicePP.jatuhTempo)}) — segera hubungi klien untuk konfirmasi pembayaran.
                      </p>
                    </div>
                  )}
                  {!isOverdue && daysLeft !== null && daysLeft <= 3 && invoicePayStatus !== 'sudah_bayar' && (
                    <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                      <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-700 font-medium">Jatuh tempo dalam {daysLeft} hari ({fmtDate(invoicePP.jatuhTempo)})</p>
                    </div>
                  )}

                  {/* Lunas state: bukti + receipt */}
                  {invoicePayStatus === 'sudah_bayar' && (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
                        <CheckCircle size={15} className="text-green-600 shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-green-800">Pembayaran Terkonfirmasi</p>
                          {konfirmasiPayForm.namaBukti && (
                            <p className="text-xs text-green-700 mt-0.5">{konfirmasiPayForm.namaBukti} · {konfirmasiPayForm.tglBayar ? fmtDate(konfirmasiPayForm.tglBayar) : ''} · {konfirmasiPayForm.metode}</p>
                          )}
                        </div>
                        <button className="text-xs text-green-700 font-semibold flex items-center gap-1 hover:underline shrink-0">
                          <Download size={12} /> Bukti
                        </button>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Receipt</p>
                          <p className="text-sm font-semibold text-[#1E1C43]">{receiptId}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/pp/receipt/${receiptId}`, { state: { fromOrderId: order.id } })}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E05945] text-white text-xs font-semibold hover:bg-[#c94a38] transition-colors"
                        >
                          <FileText size={12} /> Buka Receipt
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}



        </>
      )}



      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2 — Agreement Klien
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'agreement' && (
        <div className="space-y-4">

          {/* ── Section: Agreement Klien ── */}
          {(() => {
            const prog = dummyPPPrograms.find(p => p.id === order.programId)
            const masaBerlakuDays = prog ? parseInt(prog.masaBerlaku.replace(/[^0-9]/g, ''), 10) : 0
            const tglBerakhir = prog && order.tanggalMulai
              ? new Date(new Date(order.tanggalMulai).getTime() + masaBerlakuDays * 24 * 60 * 60 * 1000)
                  .toISOString().split('T')[0]
              : ''
            const FLOW_STATUS_CLS = {
              menunggu_ttd:    'bg-gray-100 text-gray-600',
              pengajuan_masuk: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
              disetujui:       'bg-green-50 text-green-700 border border-green-200',
              ditolak:         'bg-red-50 text-red-700 border border-red-200',
            }
            const FLOW_STATUS_LABEL = {
              menunggu_ttd:    'Menunggu TTD',
              pengajuan_masuk: 'Pengajuan Masuk',
              disetujui:       'Disetujui',
              ditolak:         'Ditolak',
            }
            const clientFileSlug = (order.namaKlien || '').toLowerCase().replace(/\s+/g, '-')
            const hasSignedFile = agreementFlowStatus === 'pengajuan_masuk' || agreementFlowStatus === 'disetujui' || agreementFlowStatus === 'ditolak'

            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Agreement Klien</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${FLOW_STATUS_CLS[agreementFlowStatus]}`}>
                      {FLOW_STATUS_LABEL[agreementFlowStatus]}
                    </span>
                    {agrDoc && (
                      <button
                        onClick={() => navigate('/pp/agreement/' + agrDoc.id, { state: { fromOrderId: order.id } })}
                        className="flex items-center gap-1 text-xs text-[#1E1C43] font-medium hover:text-[#E05945] transition"
                      >
                        <ExternalLink size={11} /> Lihat Agreement
                      </button>
                    )}
                  </div>
                  {agreementFlowStatus === 'pengajuan_masuk' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAgreementTolakForm(v => !v)}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-red-300 text-red-600 text-xs font-semibold hover:bg-red-50 transition"
                      >
                        <X size={12} /> Tolak
                      </button>
                      <button
                        onClick={() => {
                          setAgreementFlowStatus('disetujui')
                          setShowAgreementTolakForm(false)
                          if (agrDoc) updateAgrDoc(agrDoc.id, { statusTtd: 'signed', tglTtd: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) })
                          setLogTab3PP(prev => [{ id: Date.now(), waktu: fmtLogWaktu(), actor: 'Admin EFM', kategori: 'agreement', nomorLaporan: agrNomor, teks: 'Agreement disetujui — dokumen TTD klien diterima & dikonfirmasi' }, ...prev])
                        }}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90 transition"
                      >
                        <CheckCircle size={12} /> Setujui Agreement
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  {/* Info banner — hanya saat proses berlangsung */}
                  {(agreementFlowStatus === 'menunggu_ttd' || agreementFlowStatus === 'pengajuan_masuk') && (
                    <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                      <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-blue-700">
                        Absensi dapat tetap berjalan selama proses persetujuan agreement berlangsung.
                      </p>
                    </div>
                  )}

                  {/* Two-column: Template | File TTD */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* ── Kolom kiri: Template Agreement ── */}
                    <div className="flex flex-col">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Template Agreement</p>
                      <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                        {/* Mock thumbnail */}
                        <div className="bg-gray-50 flex-1 flex flex-col items-center justify-center py-5 px-4 cursor-pointer hover:bg-gray-100 transition group"
                          onClick={() => agrDoc && navigate('/pp/agreement/' + agrDoc.id, { state: { fromOrderId: order.id } })}>
                          <div className="w-16 h-20 bg-white border border-gray-200 rounded shadow-sm flex flex-col items-center justify-center mb-2 group-hover:shadow-md transition">
                            <div className="w-8 h-1.5 bg-[#1E1C43]/20 rounded mb-1" />
                            <div className="w-10 h-1 bg-gray-200 rounded mb-0.5" />
                            <div className="w-10 h-1 bg-gray-200 rounded mb-0.5" />
                            <div className="w-7 h-1 bg-gray-200 rounded mb-1.5" />
                            <div className="w-10 h-1 bg-gray-100 rounded mb-0.5" />
                            <div className="w-10 h-1 bg-gray-100 rounded mb-0.5" />
                            <div className="w-8 h-1 bg-gray-100 rounded" />
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium">Klik untuk preview</p>
                        </div>
                        <div className="px-3 py-2.5 border-t border-gray-200 bg-white">
                          <p className="text-xs font-semibold text-[#1E1C43] leading-tight mb-0.5">Agreement Private Training EFM</p>
                          <p className="text-[10px] text-gray-400 mb-2">Template Global · Versi terbaru</p>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => agrDoc && navigate('/pp/agreement/' + agrDoc.id, { state: { fromOrderId: order.id } })}
                              className="flex-1 h-7 rounded-lg bg-[#1E1C43] text-white text-[10px] font-semibold hover:opacity-90 transition flex items-center justify-center gap-1"
                            >
                              <Eye size={10} /> Preview
                            </button>
                            <button className="h-7 w-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition flex items-center justify-center">
                              <ExternalLink size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Kolom kanan: File TTD Klien ── */}
                    <div className="flex flex-col">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">File TTD Klien</p>
                      <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                        {!hasSignedFile ? (
                          /* Menunggu TTD — empty state */
                          <div className="flex-1 flex flex-col items-center justify-center py-6 px-4 bg-gray-50 text-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                              <FileText size={18} className="text-gray-300" />
                            </div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">Belum Ada File</p>
                            <p className="text-[10px] text-gray-400 leading-relaxed mb-4">Pelatih akan mengunggah file agreement yang telah ditandatangani klien</p>
                            <button
                              onClick={() => {
                                setAgreementFlowStatus('pengajuan_masuk')
                                setLogTab3PP(prev => [{ id: Date.now(), waktu: fmtLogWaktu(), actor: 'Admin EFM', kategori: 'agreement', nomorLaporan: agrNomor, teks: 'File TTD klien diunggah — pengajuan masuk untuk review' }, ...prev])
                              }}
                              className="h-7 px-3 rounded-lg bg-[#1E1C43] text-white text-[10px] font-semibold hover:opacity-90 transition flex items-center gap-1.5"
                            >
                              <Upload size={10} /> Tandai File TTD Diterima
                            </button>
                          </div>
                        ) : (
                          /* Has signed file */
                          <>
                            <div
                              className={`bg-gray-50 flex-1 flex flex-col items-center justify-center py-5 px-4 cursor-pointer hover:bg-gray-100 transition group relative ${
                                agreementFlowStatus === 'disetujui' ? 'hover:bg-green-50' :
                                agreementFlowStatus === 'ditolak'   ? 'hover:bg-red-50'   : ''
                              }`}
                              onClick={() => agrDoc && navigate('/pp/agreement/' + agrDoc.id, { state: { fromOrderId: order.id } })}
                            >
                              {/* Status badge overlay */}
                              {agreementFlowStatus === 'disetujui' && (
                                <span className="absolute top-2 right-2 text-[9px] font-semibold bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full">✓ Disetujui</span>
                              )}
                              {agreementFlowStatus === 'ditolak' && (
                                <span className="absolute top-2 right-2 text-[9px] font-semibold bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full">✗ Ditolak</span>
                              )}
                              {agreementFlowStatus === 'pengajuan_masuk' && (
                                <span className="absolute top-2 right-2 text-[9px] font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded-full">✓ Sudah TTD</span>
                              )}
                              <div className={`w-16 h-20 bg-white border rounded shadow-sm flex flex-col items-center justify-center mb-2 group-hover:shadow-md transition relative ${
                                agreementFlowStatus === 'disetujui' ? 'border-green-300' :
                                agreementFlowStatus === 'ditolak'   ? 'border-red-300'   :
                                'border-yellow-300'
                              }`}>
                                <div className="w-8 h-1.5 bg-[#1E1C43]/20 rounded mb-1" />
                                <div className="w-10 h-1 bg-gray-200 rounded mb-0.5" />
                                <div className="w-10 h-1 bg-gray-200 rounded mb-0.5" />
                                <div className="w-7 h-1 bg-gray-200 rounded mb-1.5" />
                                <div className="w-10 h-1 bg-gray-100 rounded mb-0.5" />
                                <div className="w-10 h-1 bg-gray-100 rounded mb-0.5" />
                                <div className="w-8 h-1 bg-gray-100 rounded" />
                                {/* Signature indicator */}
                                <div className="absolute bottom-1.5 left-1 right-1 flex gap-1">
                                  <div className={`flex-1 border-t ${agreementFlowStatus === 'ditolak' ? 'border-red-300' : 'border-gray-400'}`} />
                                  <div className={`flex-1 border-t ${agreementFlowStatus === 'ditolak' ? 'border-red-300' : 'border-gray-400'}`} />
                                </div>
                              </div>
                              <p className="text-[10px] text-gray-500 font-medium">Klik untuk preview</p>
                            </div>
                            <div className="px-3 py-2.5 border-t border-gray-200 bg-white">
                              <p className="text-xs font-semibold text-gray-800 leading-tight mb-0.5 truncate">agreement-{clientFileSlug}.pdf</p>
                              <p className="text-[10px] text-gray-400 mb-2">
                                {agreementFlowStatus === 'disetujui' ? `Disetujui ${agrDoc?.tglTtd || '—'}` :
                                 agreementFlowStatus === 'ditolak'   ? 'Ditolak · perlu TTD ulang' :
                                 `Dikirim ${agrDoc?.tglDibuat || '—'} · Menunggu review`}
                              </p>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => agrDoc && navigate('/pp/agreement/' + agrDoc.id, { state: { fromOrderId: order.id } })}
                                  className={`flex-1 h-7 rounded-lg text-white text-[10px] font-semibold transition flex items-center justify-center gap-1 ${
                                    agreementFlowStatus === 'disetujui' ? 'bg-green-600 hover:bg-green-700' :
                                    agreementFlowStatus === 'ditolak'   ? 'bg-red-500 hover:bg-red-600' :
                                    'bg-yellow-500 hover:bg-yellow-600'
                                  }`}
                                >
                                  <Eye size={10} /> Preview
                                </button>
                                <button className="h-7 w-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition flex items-center justify-center">
                                  <Download size={10} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Aksi Review (pengajuan_masuk only) ── */}
                  {agreementFlowStatus === 'pengajuan_masuk' && (
                    <div className="space-y-3">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
                        <AlertTriangle size={14} className="text-yellow-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-yellow-800 mb-0.5">Perlu Keputusan</p>
                          <p className="text-xs text-yellow-700">Tinjau file TTD klien di atas, lalu setujui atau tolak agreement.</p>
                        </div>
                      </div>
                      {showAgreementTolakForm && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                          <p className="text-xs font-semibold text-red-700">Catatan Penolakan</p>
                          <textarea
                            value={agreementCatatanTolak}
                            onChange={e => setAgreementCatatanTolak(e.target.value)}
                            placeholder="Jelaskan alasan penolakan atau perbaikan yang diperlukan..."
                            rows={3}
                            className="w-full text-xs rounded-lg border border-red-200 px-3 py-2 outline-none focus:border-red-400 bg-white resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setShowAgreementTolakForm(false)}
                              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 font-semibold hover:bg-gray-50 transition"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => {
                                setAgreementFlowStatus('ditolak')
                                setShowAgreementTolakForm(false)
                                setLogTab3PP(prev => [{ id: Date.now(), waktu: fmtLogWaktu(), actor: 'Admin EFM', kategori: 'agreement', nomorLaporan: agrNomor, teks: `Agreement ditolak — ${agreementCatatanTolak || 'tanpa catatan'}` }, ...prev])
                              }}
                              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
                            >
                              Konfirmasi Tolak
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Status Result: disetujui ── */}
                  {agreementFlowStatus === 'disetujui' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
                      <CheckCircle size={16} className="text-green-600 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-green-800">Agreement Disetujui</p>
                        <p className="text-xs text-green-700">Berlaku efektif mulai {order.tanggalMulai ? fmtDate(order.tanggalMulai) : '—'}.</p>
                      </div>
                    </div>
                  )}

                  {/* ── Status Result: ditolak ── */}
                  {agreementFlowStatus === 'ditolak' && (
                    <div className="space-y-3">
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle size={16} className="text-red-600 shrink-0" />
                          <p className="text-xs font-semibold text-red-800">Agreement Ditolak — Perlu TTD Ulang</p>
                        </div>
                        {agreementCatatanTolak && (
                          <div className="bg-white border border-red-100 rounded-lg px-3 py-2 mt-2">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Catatan Penolakan</p>
                            <p className="text-xs text-gray-700">{agreementCatatanTolak}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => { setAgreementFlowStatus('menunggu_ttd'); setAgreementCatatanTolak('') }}
                        className="w-full h-9 rounded-lg border border-[#1E1C43] text-[#1E1C43] text-xs font-semibold hover:bg-[#1E1C43] hover:text-white transition flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw size={13} /> Kirim Ulang untuk TTD
                      </button>
                    </div>
                  )}
                </div>
              </div>

            )
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3 — Operasional Sesi (PP)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'operasional' && (
        <div className="space-y-4">

          {/* ── Section 3: Monitoring Sesi (read-only, dari backend) ── */}
          {(() => {
            const prog = dummyPPPrograms.find(p => p.id === order.programId)
            const totalPaket = prog?.totalSesi || 12
            const totalHadir = absensiSesi.length
            const sesiTersisa = Math.max(0, totalPaket - totalHadir)
            const pctHadir = Math.min(100, Math.round((totalHadir / totalPaket) * 100))
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Monitoring Sesi</h3>
                    <p className="text-xs text-gray-400 mt-1 ml-3">Absensi dicatat otomatis oleh sistem backend pelatih</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      <CheckCircle size={11} /> {totalHadir} Hadir
                    </span>
                    <span className="bg-yellow-50 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {sesiTersisa} Tersisa
                    </span>
                    <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {totalPaket} Total
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-gray-600 font-medium">{totalHadir}/{totalPaket} sesi terlaksana</span>
                    <span className="text-xs font-semibold text-gray-700">{pctHadir}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pctHadir >= 80 ? 'bg-[#E05945]' : 'bg-[#1E1C43]'}`}
                      style={{ width: pctHadir + '%' }}
                    />
                  </div>
                  {prog?.masaBerlaku && (
                    <p className="text-[10px] text-gray-400 mt-1.5">Masa berlaku paket: <span className="font-semibold text-gray-600">{prog.masaBerlaku}</span></p>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full" style={{ minWidth: '780px' }}>
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['No', 'Tanggal', 'Jam Masuk', 'Lokasi', 'Device', 'Foto Bukti'].map(h => (
                          <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {absensiSesi.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">Belum ada sesi terlaksana</td></tr>
                      )}
                      {absensiSesi.map((a, i) => (
                        <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{a.tanggal}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-[#1E1C43] font-mono whitespace-nowrap">{a.jam}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{a.lokasi || '—'}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{a.device || '—'}</td>
                          <td className="px-4 py-3">
                            {a.foto ? (
                              <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
                                <CheckCircle size={12} /> Ada
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })()}

          {/* ── Section 4: Pengajuan Rekap Absensi ── */}
          {(() => {
            const REKAP_LABEL = {
              belum_diajukan:  { label: 'Belum Diajukan',   cls: 'bg-gray-100 text-gray-500'    },
              pengajuan_masuk: { label: 'Pengajuan Masuk',  cls: 'bg-yellow-100 text-yellow-700' },
              dikonfirmasi:    { label: 'Dikonfirmasi',     cls: 'bg-green-100 text-green-700'   },
              ditolak:         { label: 'Ditolak',          cls: 'bg-red-100 text-red-700'       },
            }
            const cur = REKAP_LABEL[rekapStatus] || REKAP_LABEL.belum_diajukan
            const prog = dummyPPPrograms.find(p => p.id === order.programId)
            const ratePerSesi = prog ? Math.round(prog.hargaPaket / prog.totalSesi) : 0
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
                  <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Pengajuan Rekap Absensi</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${cur.cls}`}>{cur.label}</span>
                </div>

                <div className="p-5">
                  {rekapStatus === 'belum_diajukan' && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ClipboardList size={22} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Menunggu Pengajuan dari Pelatih</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Pelatih akan mengajukan rekap setelah seluruh sesi selesai dan menandatangani file rekap digital dari aplikasi pelatih.</p>
                    </div>
                  )}

                  {rekapStatus === 'pengajuan_masuk' && (
                    <div className="space-y-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-yellow-200 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-yellow-700">!</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-yellow-800">Rekap Masuk — Perlu Review Admin</p>
                          <p className="text-xs text-yellow-700 mt-0.5">Pelatih telah mengajukan rekap absensi dan menandatangani file. Cek TTD dan verifikasi data sebelum konfirmasi.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          ['Diajukan oleh',      'Sarah Jenkins'],
                          ['Tgl Pengajuan',      '5 Nov 2026'],
                          ['Total Sesi Rekap',   `${absensiSesi.length} sesi`],
                          ['Total Honorarium',   'Rp ' + (absensiSesi.length * ratePerSesi).toLocaleString('id-ID')],
                        ].map(([label, val]) => (
                          <div key={label} className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                            <p className="text-sm font-semibold text-gray-800">{val}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                        <CheckCircle size={16} className="text-green-600 shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-green-800">TTD Digital Pelatih Terverifikasi</p>
                          <p className="text-xs text-green-700 mt-0.5">rekap-absensi-PP-26-0013-nov2026.pdf · 5 Nov 2026 14:32</p>
                        </div>
                        <button className="text-xs text-green-700 font-semibold flex items-center gap-1 hover:underline shrink-0">
                          <Download size={12} /> Lihat File
                        </button>
                      </div>

                      {!showTolakModal && (
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setShowTolakModal(true)}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition"
                          >
                            Tolak
                          </button>
                          <button
                            onClick={() => {
                              setRekapStatus('dikonfirmasi')
                              setLogTab3PP(prev => [{
                                id: Date.now(), waktu: fmtLogWaktu(), actor: 'Admin EFM',
                                kategori: 'honorarium', nomorLaporan: order.id,
                                teks: `Rekap absensi dikonfirmasi — ${absensiSesi.length} sesi · Rp ${(absensiSesi.length * ratePerSesi).toLocaleString('id-ID')}`
                              }, ...prev])
                            }}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90 transition"
                          >
                            Konfirmasi Rekap
                          </button>
                        </div>
                      )}

                      {showTolakModal && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                          <p className="text-xs font-semibold text-red-700">Catatan Penolakan</p>
                          <textarea
                            value={rekapCatatanTolak}
                            onChange={e => setRekapCatatanTolak(e.target.value)}
                            placeholder="Jelaskan alasan penolakan..."
                            rows={3}
                            className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-red-400 resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setShowTolakModal(false)}
                              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => { setRekapStatus('ditolak'); setShowTolakModal(false) }}
                              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
                            >
                              Kirim Penolakan
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {rekapStatus === 'dikonfirmasi' && (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
                        <CheckCircle size={16} className="text-green-600 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-green-800">Rekap Dikonfirmasi oleh Admin</p>
                          <p className="text-xs text-green-700 mt-0.5">5 Nov 2026 · {absensiSesi.length} sesi terkonfirmasi</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          ['Total Sesi Terkonfirmasi', `${absensiSesi.length} sesi`],
                          ['Total Honorarium',         'Rp ' + (absensiSesi.length * ratePerSesi).toLocaleString('id-ID')],
                        ].map(([label, val]) => (
                          <div key={label} className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                            <p className="text-sm font-semibold text-gray-800">{val}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 text-center">Lanjut ke bagian <span className="font-semibold text-[#1E1C43]">Honorarium Pelatih</span> di bawah untuk proses pembayaran.</p>
                    </div>
                  )}

                  {rekapStatus === 'ditolak' && (
                    <div className="space-y-3">
                      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                        <X size={16} className="text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-red-700">Rekap Ditolak</p>
                          {rekapCatatanTolak && <p className="text-xs text-red-600 mt-0.5">{rekapCatatanTolak}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => { setRekapStatus('pengajuan_masuk'); setRekapCatatanTolak('') }}
                        className="text-xs text-[#1E1C43] font-semibold hover:underline"
                      >
                        Kembalikan ke Review →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* ── Section 5: Honorarium Pelatih ── */}
          {(() => {
            const prog = dummyPPPrograms.find(p => p.id === order.programId)
            const ratePerSesi = prog ? Math.round(prog.hargaPaket / prog.totalSesi) : 0
            const totalHonorariumDue = absensiSesi.length * ratePerSesi
            const isUnlocked = rekapStatus === 'dikonfirmasi'
            return (
              <div className={`bg-white rounded-xl shadow-sm border ${isUnlocked ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Honorarium Pelatih</h3>
                    {isUnlocked && (
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        honorariumBayarStatus === 'sudah_bayar' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {honorariumBayarStatus === 'sudah_bayar' ? '✓ Sudah Dibayar' : 'Menunggu Bayar'}
                      </span>
                    )}
                    {!isUnlocked && (
                      <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-gray-100 text-gray-400">Terkunci</span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  {!isUnlocked ? (
                    <div className="text-center py-6">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ClipboardList size={18} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Rekap belum dikonfirmasi</p>
                      <p className="text-xs text-gray-400 mt-1">Proses honorarium tersedia setelah rekap absensi disetujui admin.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Kalkulasi otomatis */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          ['Sesi Terkonfirmasi',  `${absensiSesi.length} sesi`],
                          ['Rate / Sesi',         'Rp ' + ratePerSesi.toLocaleString('id-ID')],
                          ['Total Honorarium',    'Rp ' + totalHonorariumDue.toLocaleString('id-ID')],
                        ].map(([label, val]) => (
                          <div key={label} className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                            <p className={`text-sm font-semibold ${label === 'Total Honorarium' ? 'text-[#1E1C43]' : 'text-gray-800'}`}>{val}</p>
                          </div>
                        ))}
                      </div>

                      {honorariumBayarStatus === 'menunggu_bayar' ? (
                        <div className="space-y-3">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-start gap-3">
                            <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-700">Rekap telah dikonfirmasi. Transfer honorarium ke rekening pelatih, lalu upload bukti pembayaran.</p>
                          </div>
                          {/* Upload bukti bayar */}
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-[#1E1C43]/30 transition-colors">
                            <label className="cursor-pointer flex items-center gap-3">
                              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-lg">📎</span>
                              </div>
                              <div className="flex-1">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                  onChange={e => {
                                    const file = e.target.files[0]
                                    if (!file) return
                                    setHonorariumBuktiBayar({ nama: file.name, tanggal: new Date().toLocaleDateString('id-ID') })
                                    setHonorariumBayarStatus('sudah_bayar')
                                    setLogTab3PP(prev => [{
                                      id: Date.now(), waktu: fmtLogWaktu(), actor: 'Admin EFM',
                                      kategori: 'honorarium', nomorLaporan: order.id,
                                      teks: `Honorarium Rp ${totalHonorariumDue.toLocaleString('id-ID')} sudah dibayar — bukti: ${file.name}`
                                    }, ...prev])
                                  }}
                                />
                                <span className="text-xs text-[#1E1C43] font-semibold hover:underline">Upload Bukti Pembayaran Honorarium</span>
                                <p className="text-[10px] text-gray-400 mt-0.5">PDF, JPG, PNG · Maks 5MB</p>
                              </div>
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
                            <CheckCircle size={15} className="text-green-600 shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-green-800">Honorarium Sudah Dibayar</p>
                              {honorariumBuktiBayar && (
                                <p className="text-xs text-green-700 mt-0.5">{honorariumBuktiBayar.nama} · {honorariumBuktiBayar.tanggal}</p>
                              )}
                            </div>
                            <button className="text-xs text-green-700 font-semibold flex items-center gap-1 hover:underline shrink-0">
                              <Download size={12} /> Lihat Bukti
                            </button>
                          </div>
                          <div className="flex justify-between items-center bg-[#1E1C43]/5 border border-[#1E1C43]/10 rounded-xl px-4 py-3">
                            <p className="text-sm font-bold text-[#1E1C43]">Total Dibayarkan</p>
                            <p className="text-base font-bold text-[#E05945]">Rp {totalHonorariumDue.toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* ── Section 6: Fitness Assessment ── */}
          {(() => {
            const assessment = getAssessmentByOrderId(order.id)
            if (!assessment) return (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-3">Fitness Assessment</h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400 italic">Belum ada data fitness assessment untuk order ini.</p>
                  <button
                    onClick={() => navigate('/pp/screening/new', { state: { fromOrderId: order.id, leadId: order.leadId, namaKlien: order.namaKlien } })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E1C43] text-white rounded-lg text-xs font-semibold hover:bg-[#2d2b5e] transition"
                  >
                    <Plus size={13} /> Buat Assessment
                  </button>
                </div>
              </div>
            )
            const preTestDate = assessment.tanggalPreTest
              ? new Date(assessment.tanggalPreTest).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'
            const statusColor = assessment.statusAssessment === 'Post-Test Selesai'
              ? 'bg-green-100 text-green-700'
              : assessment.statusAssessment === 'Pre-Test Selesai'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-yellow-100 text-yellow-700'
            return (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Fitness Assessment</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${statusColor}`}>{assessment.statusAssessment}</span>
                    {assessment.prevAssessmentId && (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-purple-100 text-purple-700">
                        Renewal · Pre-Test dari #{assessment.prevAssessmentId}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => navigate('/pp/screening/' + assessment.id, { state: { fromOrderId: order.id } })}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition shrink-0"
                  >
                    <Eye size={12} /> Lihat Detail
                  </button>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-4">
                    {[
                      ['ID Screening', assessment.id],
                      ['Tanggal Pre-Test', preTestDate],
                      ['FC / Screener', assessment.namaFC],
                      ['Tinggi Badan', (assessment.tanita?.tinggiBadan_awal || '—') + (assessment.tanita?.tinggiBadan_awal ? ' cm' : '')],
                      ['Berat Badan', (assessment.tanita?.totalBodyWeight_awal || '—') + (assessment.tanita?.totalBodyWeight_awal ? ' kg' : '')],
                      ['BMI', assessment.tanita?.bodyMassIndex_awal || '—'],
                    ].map(([lbl, val]) => (
                      <div key={lbl} className="bg-gray-50 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{lbl}</p>
                        <p className="text-sm font-semibold text-[#1E1C43]">{val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-0">
                    {[
                      ['Target Program',    assessment.detailGoals],
                      ['Kondisi Fisik Awal',assessment.ringkasan?.kondisiFisik],
                      ['Riwayat Cedera',    assessment.ringkasan?.riwayatCedera],
                      ['Obat-obatan Rutin', assessment.ringkasan?.obatanRutin],
                    ].map(([lbl, val]) => (
                      <div key={lbl} className="flex gap-3 py-2.5 border-b border-gray-100 last:border-0">
                        <p className="text-xs text-gray-400 w-36 shrink-0">{lbl}</p>
                        <p className="text-xs font-medium text-gray-700">{val || '—'}</p>
                      </div>
                    ))}
                  </div>
                  {assessment.ringkasan?.catatanScreening && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1">Catatan Screening</p>
                      <p className="text-xs text-blue-800 leading-relaxed">{assessment.ringkasan.catatanScreening}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* ── Section 7: Catatan Progres Pelatih ── */}
          {(() => {
            const prog = dummyPPPrograms.find(p => p.id === order.programId)
            const catatanProgres = [
              { tanggal: '20 Nov 2026', catatan: 'Klien menunjukkan progress signifikan pada endurance. Berat turun 2 kg sejak sesi ke-4. Disarankan meningkatkan intensitas kardio minggu depan.' },
              { tanggal: '5 Nov 2026',  catatan: 'Sesi ke-4 selesai. Fokus compound movement. Klien mulai konsisten dengan teknik squat dan deadlift, form sudah membaik.' },
              { tanggal: '27 Okt 2026', catatan: 'Sesi perdana berjalan lancar. Klien antusias dan kooperatif. Program fatloss 3 hari/minggu dirancang sesuai kondisi awal.' },
            ]
            const pelatihNama = prog?.pic?.nama || 'Pelatih'
            return (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-5 py-3.5 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Catatan Progres Pelatih</h3>
                  <p className="text-xs text-gray-400 pl-4 mt-0.5">Diisi oleh {pelatihNama} — read only, sumber dari sistem pelatih</p>
                </div>
                <div className="p-5">
                  {catatanProgres.length === 0 ? (
                    <p className="text-sm text-gray-400 italic text-center py-4">Belum ada catatan progres dari pelatih.</p>
                  ) : (
                    <div className="space-y-3">
                      {catatanProgres.map((item, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-[#1E1C43]">{pelatihNama}</span>
                            <span className="text-[10px] text-gray-400">{item.tanggal}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{item.catatan}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4 — Log & Histori
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'log' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-[#1E1C43]" />
              <h3 className="text-base font-bold text-[#1E1C43]">Log & Histori</h3>
              <span className="text-xs text-gray-400">
                ({logTab3PP.filter(l => logFilter3PP === 'semua' || l.kategori === logFilter3PP).length} aktivitas)
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {['semua', 'status', 'keuangan', 'agreement', 'jadwal', 'absensi', 'honorarium'].map(k => (
                <button
                  key={k}
                  onClick={() => setLogFilter3PP(k)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    logFilter3PP === k ? 'bg-[#1E1C43] text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3 pl-4 relative">
            {logTab3PP
              .filter(l => logFilter3PP === 'semua' || l.kategori === logFilter3PP)
              .map((l, idx, arr) => (
              <div key={l.id} className="relative mb-3 last:mb-0">
                <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-[#1E1C43]" />
                {idx < arr.length - 1 && (
                  <div className="absolute -left-[13px] top-3 w-px bottom-[-12px] bg-gray-200" />
                )}
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="text-[10px] text-gray-400">{l.waktu}</p>
                  {l.actor && <p className="text-[10px] text-gray-500 font-medium">{l.actor}</p>}
                  {l.nomorLaporan && (
                    <span className="text-[10px] bg-[#1E1C43]/10 text-[#1E1C43] px-1.5 py-0.5 rounded font-mono">
                      {l.nomorLaporan}
                    </span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    l.kategori === 'absensi'    ? 'bg-blue-50 text-blue-600'     :
                    l.kategori === 'jadwal'     ? 'bg-green-50 text-green-600'   :
                    l.kategori === 'keuangan'   ? 'bg-teal-50 text-teal-600'     :
                    l.kategori === 'honorarium' ? 'bg-orange-50 text-orange-600' :
                    l.kategori === 'agreement'  ? 'bg-indigo-50 text-indigo-600' :
                    l.kategori === 'status'     ? 'bg-purple-50 text-purple-600' :
                    'bg-gray-50 text-gray-500'
                  }`}>{l.kategori}</span>
                </div>
                <p className="text-xs text-gray-700">{l.teks}</p>
              </div>
            ))}
            {logTab3PP.filter(l => logFilter3PP === 'semua' || l.kategori === logFilter3PP).length === 0 && (
              <p className="text-xs text-gray-400 italic pl-1">Belum ada log untuk filter ini.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Modal Edit Absensi ─────────────────────────────────────────────────── */}
      {editingAbsensi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Edit2 size={14} className="text-[#1E1C43]" /> Edit Data Absensi
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Koreksi tanggal/jam jika pelatih lupa scan di sesi sebelumnya</p>
              </div>
              <button onClick={() => setEditingAbsensi(null)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tanggal</label>
                  <input
                    type="date"
                    value={editingAbsensi.tanggal}
                    onChange={e => setEditingAbsensi({ ...editingAbsensi, tanggal: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jam</label>
                  <input
                    type="time"
                    value={editingAbsensi.jam}
                    onChange={e => setEditingAbsensi({ ...editingAbsensi, jam: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Catatan Koreksi *</label>
                <textarea
                  value={editingAbsensi.catatanKoreksi}
                  onChange={e => setEditingAbsensi({ ...editingAbsensi, catatanKoreksi: e.target.value })}
                  placeholder="Alasan koreksi: pelatih lupa scan di sesi sebelumnya..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => setEditingAbsensi(null)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!editingAbsensi.id) {
                    const newAbsId = 'ABS-' + String(absensiSesi.length + 1).padStart(3, '0')
                    setAbsensiSesi(prev => [...prev, { ...editingAbsensi, id: newAbsId }])
                    setLogTab3PP(prev => [{
                      id: Date.now(), waktu: fmtLogWaktu(), actor: 'Admin EFM',
                      kategori: 'absensi', nomorLaporan: newAbsId,
                      teks: `Absensi ${newAbsId} ditambahkan manual: ${editingAbsensi.tanggal}`
                    }, ...prev])
                  } else {
                    setAbsensiSesi(prev => prev.map(x => x.id === editingAbsensi.id ? { ...editingAbsensi } : x))
                  }
                  setEditingAbsensi(null)
                }}
                className="flex-1 bg-[#1E1C43] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#2d2b5e] transition"
              >
                Simpan Koreksi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Konfirmasi Pembayaran Klien ────────────────────────────────── */}
      {showKonfirmasiPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowKonfirmasiPayModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold text-[#1E1C43]">Konfirmasi Pembayaran Klien</h3>
                <p className="text-xs text-gray-400 mt-0.5">Upload bukti transfer / struk pembayaran dari klien</p>
              </div>
              <button onClick={() => setShowKonfirmasiPayModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center">
                <p className="text-xs text-gray-500">Total Tagihan</p>
                <p className="text-base font-bold text-[#1E1C43]">{formatRpPP(subtotalPP)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tanggal Bayar *</label>
                  <input
                    type="date"
                    value={konfirmasiPayForm.tglBayar}
                    onChange={e => setKonfirmasiPayForm(p => ({ ...p, tglBayar: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Metode Pembayaran</label>
                  <select
                    value={konfirmasiPayForm.metode}
                    onChange={e => setKonfirmasiPayForm(p => ({ ...p, metode: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]"
                  >
                    {['Transfer Bank', 'Cash', 'QRIS', 'Kartu Debit', 'Kartu Kredit'].map(m => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Upload Bukti Pembayaran</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-[#1E1C43]/30 transition-colors">
                  <label className="cursor-pointer flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-lg">📎</span>
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files[0]
                          if (file) setKonfirmasiPayForm(p => ({ ...p, namaBukti: file.name }))
                        }}
                      />
                      <span className="text-xs text-[#1E1C43] font-semibold hover:underline">
                        {konfirmasiPayForm.namaBukti || 'Pilih file PDF atau gambar'}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-0.5">PDF, JPG, PNG · Maks 5MB</p>
                    </div>
                  </label>
                  {konfirmasiPayForm.namaBukti && (
                    <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <CheckCircle size={13} className="text-green-600 shrink-0" />
                      <span className="text-xs text-green-700 font-medium">{konfirmasiPayForm.namaBukti}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => setShowKonfirmasiPayModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                disabled={!konfirmasiPayForm.tglBayar}
                onClick={() => {
                  setInvoicePayStatus('sudah_bayar')
                  setInvoicePP(p => ({ ...p, statusInvoice: 'Lunas' }))
                  setShowKonfirmasiPayModal(false)
                  const rcpNo = invoicePP.nomorInvoice.replace('INV-', 'RCP-')
                  addReceipt({
                    rcpNo,
                    invNo: invoicePP.nomorInvoice,
                    orderId: order.id,
                    client: order.namaKlien,
                    initials: (order.namaKlien || '').split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join(''),
                    color: '#2980B9',
                    paket: order.paket,
                    pic: order.picOpsEFM,
                    tglBayar: fmtDate(konfirmasiPayForm.tglBayar),
                    metode: konfirmasiPayForm.metode,
                    total: subtotalPP,
                    waStatus: 'not-sent',
                    waTgl: null,
                  })
                  setLogTab3PP(prev => [{
                    id: Date.now(), waktu: fmtLogWaktu(), actor: 'Admin EFM',
                    kategori: 'keuangan', nomorLaporan: invoicePP.nomorInvoice,
                    teks: `Pembayaran klien ${invoicePP.nomorInvoice} dikonfirmasi Lunas — ${konfirmasiPayForm.metode} · ${fmtDate(konfirmasiPayForm.tglBayar)}`
                  }, ...prev])
                }}
                className="flex-1 bg-[#1E1C43] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#2d2b5e] transition disabled:opacity-40"
              >
                Konfirmasi Lunas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Tambah Absensi Manual ───────────────────────────────────────── */}
      {showTambahAbsensiManual && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-[#1E1C43]">Tambah Absensi Manual</h3>
                <p className="text-xs text-gray-400 mt-0.5">Untuk kasus pelatih sama sekali tidak scan barcode</p>
              </div>
              <button onClick={() => setShowTambahAbsensiManual(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <p className="text-xs text-yellow-700">⚠️ Entry manual memerlukan catatan alasan yang jelas untuk audit trail</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tanggal *</label>
                  <input
                    type="date"
                    id="manualAbsensiTanggal"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jam *</label>
                  <input
                    type="time"
                    id="manualAbsensiJam"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Catatan Alasan * (wajib isi)</label>
                <textarea
                  id="manualAbsensiCatatan"
                  placeholder="Alasan kenapa entry manual: pelatih lupa bawa HP, HP mati, dll"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => setShowTambahAbsensiManual(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const tgl = document.getElementById('manualAbsensiTanggal').value
                  const jam = document.getElementById('manualAbsensiJam').value
                  const cat = document.getElementById('manualAbsensiCatatan').value
                  if (!tgl || !cat.trim()) return
                  const newId = 'ABS-M' + (absensiSesi.length + 1)
                  setAbsensiSesi(prev => [...prev, { id: newId, tanggal: tgl, jam: jam || '—', foto: null, catatanKoreksi: '[MANUAL] ' + cat }])
                  setLogTab3PP(prev => [{
                    id: Date.now(), waktu: fmtLogWaktu(), actor: 'Admin EFM',
                    kategori: 'absensi', nomorLaporan: newId,
                    teks: 'Absensi manual ' + newId + ' ditambahkan: ' + tgl + ' — ' + cat.substring(0, 40)
                  }, ...prev])
                  setShowTambahAbsensiManual(false)
                }}
                className="flex-1 bg-[#E05945] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#c94a38] transition"
              >
                Tambah Manual
              </button>
            </div>
          </div>
        </div>
      )}


      </div>

      {/* ── Modal Ubah Tahapan ──────────────────────────────────────────────────── */}
      {showTahapanModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => { setShowTahapanModal(false); setPendingTahapan(null) }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#1E1C43]">Ubah Tahapan Order</h3>
              <button
                onClick={() => { setShowTahapanModal(false); setPendingTahapan(null) }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-2">
              <p className="text-xs text-gray-500 mb-3">Pilih tahapan baru untuk order ini:</p>
              {TAHAPAN_STEPS.map(step => {
                const isCurrent  = step === tahapanState
                const isSelected = step === pendingTahapan
                const stepIdx    = TAHAPAN_ORDER[step] ?? 0
                const currIdx    = TAHAPAN_ORDER[tahapanState] ?? 0
                const isPast     = stepIdx < currIdx
                return (
                  <button
                    key={step}
                    onClick={() => !isCurrent && setPendingTahapan(isSelected ? null : step)}
                    disabled={isCurrent}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      isCurrent
                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#1E1C43] border-[#1E1C43] text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-[#1E1C43]'
                    }`}
                  >
                    <span>{step}</span>
                    {isCurrent  && <span className="text-[10px] font-semibold bg-[#E05945] text-white px-2 py-0.5 rounded-full">Saat ini</span>}
                    {isSelected && !isCurrent && <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">Dipilih</span>}
                    {isPast && !isCurrent && !isSelected && <span className="text-[10px] text-gray-400">Sudah dilalui</span>}
                  </button>
                )
              })}
              {pendingTahapan && (
                <div className="mt-1 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700">
                  Status order akan otomatis berubah ke <span className="font-bold">{TAHAPAN_TO_STATUS[pendingTahapan]}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => { setShowTahapanModal(false); setPendingTahapan(null) }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                disabled={!pendingTahapan}
                onClick={() => {
                  if (!pendingTahapan) return
                  const newStatus = TAHAPAN_TO_STATUS[pendingTahapan] || statusOrderState
                  const prevTahapan = tahapanState
                  setTahapanState(pendingTahapan)
                  setStatusOrderState(newStatus)
                  setLogTab3PP(prev => [{
                    id: Date.now(),
                    waktu: fmtLogWaktu(),
                    actor: 'Admin EFM',
                    kategori: 'status',
                    nomorLaporan: order.id,
                    teks: `Tahapan order diubah: ${prevTahapan} → ${pendingTahapan} · Status: ${newStatus}`
                  }, ...prev])
                  setPendingTahapan(null)
                  setShowTahapanModal(false)
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#1E1C43] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Konfirmasi Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

