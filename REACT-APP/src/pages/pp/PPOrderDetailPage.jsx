import React, { useState, useRef } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { getCompanySettings } from '../../utils/companySettings'
import { ArrowLeft, ChevronRight, Edit2, Save, X, Plus, Trash2, ChevronDown, ExternalLink, FileText, Printer, Eye, Download, CheckCircle, MapPin, Users, Calendar, ClipboardList, AlertTriangle, Activity, ImageIcon } from 'lucide-react'

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

/* ═══════════════════════════════════════
   Master data PP Orders
═══════════════════════════════════════ */
const dummyPPOrders = [
  { id: "PP-26-0013", leadId: "LP-0001", programId: "PRG-PP-003", namaKlien: "James Wilson",
    paket: "12 Sesi - Pro", picSalesEFM: "Sarah Jenkins", picOpsEFM: "Sarah Jenkins",
    tanggalMulai: "2026-10-24", nilaiKontrak: 2400000,
    tahapan: "Program Berjalan", statusOrder: "Aktif",
    paymentTerms: "Per Paket", catatanOrder: "Klien target penurunan BB 5kg",
    noHP: "081234567890", email: "james@email.com", hubunganKlien: "Diri Sendiri",
    namaKlienLatihan: "James Wilson", noHPKlien: "081234567890",
    usiaKlien: 32, jenisKelaminKlien: "Laki-laki",
    hariLatihan: ["Senin", "Rabu", "Jumat"], jamLatihan: "07:00",
    lokasiLatihan: "Hampton's Park Tower A, Cilandak Barat",
    rincianLayanan: [{ id:1, namaItem:"Private Training 12 Sesi", satuan:"Paket", jumlah:1, total:2400000 }],
    paymentTracking: [{ id:"PT-001", periode:"Full Payment — Okt 2026", nominal:2400000, status:"Lunas", tglBayar:"2026-10-24", invoiceId:"INV-PP-26-0013" }],
    loiStatus:"N/A", mouAda:false, contractStatus:"Active",
    quotation:{ nomor:"QUO/EFM/PP/2026/0013", tanggal:"2026-10-20", manajemenFee:false, manajemenFeePersen:0, pajak:[{nama:"PPN 11%", persen:11, aktif:false}], status:"Approved", catatan:"" }
  },
  { id: "PP-26-0012", leadId: "LP-0006", programId: "PRG-PP-001", namaKlien: "Emily Chen",
    paket: "4 Sesi - Starter", picSalesEFM: "Marcus Chen", picOpsEFM: "Marcus Chen",
    tanggalMulai: "2026-10-22", nilaiKontrak: 600000,
    tahapan: "Program Selesai", statusOrder: "Completed",
    paymentTerms: "Per Paket", catatanOrder: "",
    noHP: "082345678901", email: "emily@email.com", hubunganKlien: "Diri Sendiri",
    namaKlienLatihan: "Emily Chen", noHPKlien: "082345678901",
    usiaKlien: 28, jenisKelaminKlien: "Perempuan",
    hariLatihan: ["Selasa", "Kamis"], jamLatihan: "09:00",
    lokasiLatihan: "Hampton's Park Tower C, Cilandak Barat",
    rincianLayanan: [{ id:1, namaItem:"Private Training 4 Sesi", satuan:"Paket", jumlah:1, total:600000 }],
    paymentTracking: [{ id:"PT-002", periode:"Full Payment — Okt 2026", nominal:600000, status:"Lunas", tglBayar:"2026-10-22", invoiceId:"INV-PP-26-0012" }],
    loiStatus:"N/A", mouAda:false, contractStatus:"Completed",
    quotation:{ nomor:"QUO/EFM/PP/2026/0012", tanggal:"2026-10-18", manajemenFee:false, manajemenFeePersen:0, pajak:[{nama:"PPN 11%", persen:11, aktif:false}], status:"Approved", catatan:"" }
  }
]

const dummyPPPrograms = [
  { id:"PRG-PP-001", namaLatihan:"Private Training", namaPaket:"4 Sesi - Starter",
    sesi:4, pertemuan:"2x seminggu", masaBerlaku:"30 hari",
    pic:"Marcus Chen", biayaPerSesi:150000, hargaPaket:600000 },
  { id:"PRG-PP-002", namaLatihan:"Private Training", namaPaket:"8 Sesi - Basic",
    sesi:8, pertemuan:"2x seminggu", masaBerlaku:"45 hari",
    pic:"Marcus Chen", biayaPerSesi:175000, hargaPaket:1400000 },
  { id:"PRG-PP-003", namaLatihan:"Private Training", namaPaket:"12 Sesi - Pro",
    sesi:12, pertemuan:"3x seminggu", masaBerlaku:"60 hari",
    pic:"Sarah Jenkins", biayaPerSesi:200000, hargaPaket:2400000 },
  { id:"PRG-PP-004", namaLatihan:"Private Training", namaPaket:"20 Sesi - Premium",
    sesi:20, pertemuan:"3x seminggu", masaBerlaku:"90 hari",
    pic:"Sarah Jenkins", biayaPerSesi:190000, hargaPaket:3800000 },
  { id:"PRG-PP-005", namaLatihan:"Yoga Private", namaPaket:"8 Sesi Yoga - Basic",
    sesi:8, pertemuan:"2x seminggu", masaBerlaku:"45 hari",
    pic:"Sari Dewi", biayaPerSesi:160000, hargaPaket:1280000 },
  { id:"PRG-PP-006", namaLatihan:"Yoga Private", namaPaket:"12 Sesi Yoga - Pro",
    sesi:12, pertemuan:"3x seminggu", masaBerlaku:"60 hari",
    pic:"Sari Dewi", biayaPerSesi:180000, hargaPaket:2160000 },
  { id:"PRG-PP-007", namaLatihan:"Pilates Private", namaPaket:"8 Sesi Pilates - Basic",
    sesi:8, pertemuan:"2x seminggu", masaBerlaku:"45 hari",
    pic:"Nia Rahayu", biayaPerSesi:170000, hargaPaket:1360000 },
  { id:"PRG-PP-008", namaLatihan:"Pilates Private", namaPaket:"12 Sesi Pilates - Pro",
    sesi:12, pertemuan:"3x seminggu", masaBerlaku:"60 hari",
    pic:"Nia Rahayu", biayaPerSesi:185000, hargaPaket:2220000 },
  { id:"PRG-PP-009", namaLatihan:"Zumba Private", namaPaket:"8 Sesi Zumba - Basic",
    sesi:8, pertemuan:"2x seminggu", masaBerlaku:"45 hari",
    pic:"Bima Prakoso", biayaPerSesi:155000, hargaPaket:1240000 },
  { id:"PRG-PP-010", namaLatihan:"Functional Training", namaPaket:"12 Sesi FT - Pro",
    sesi:12, pertemuan:"3x seminggu", masaBerlaku:"60 hari",
    pic:"Doni Kusuma", biayaPerSesi:195000, hargaPaket:2340000 },
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
    : dummyPPOrders.find(o => o.id === id)

  /* ── Section state ───────────────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState('keuangan')
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

  /* ── Agreement / PKS doc ─────────────────────────────────────────────────── */
  const [adaAgreement, setAdaAgreement] = useState(true)
  const [selectedScreeningId, setSelectedScreeningId] = useState(
    order?.id === 'PP-26-0013' ? 'SCR-26-0001' : order?.id === 'PP-26-0012' ? 'SCR-26-0002' : ''
  )
  const [agreementDoc, setAgreementDoc] = useState({
    status: 'Sudah TTD',
    tglTTD: '2026-10-21',
    gdocsUrl: '',
    uploadedFile: { nama: 'agreement-james-wilson.pdf', tanggal: '21 Okt 2026' },
    riwayat: [{ id: 1, nama: 'agreement-james-wilson.pdf', tanggal: '21 Okt 2026', status: 'Sudah TTD' }]
  })
  const [agreementDraft, setAgreementDraft] = useState(null)
  const [dokumenTambahan, setDokumenTambahan] = useState([
    { id: 1, nama: 'form-fisik-awal-james-wilson.pdf', tgl: '24 Okt 2026', keterangan: 'Hasil tes kebugaran awal' }
  ])
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

  /* ── Tab 2: Log Aktivitas ────────────────────────────────────────────────── */
  const LOG_DATA = [
    { dot:'#10B981', teks:'Pembayaran PP-26-0013 dikonfirmasi Lunas — Okt 2026',              waktu:'24 Okt 2026 09:00' },
    { dot:'#F97316', teks:'Invoice INV-PP-26-0013 dikirim ke James Wilson',                   waktu:'24 Okt 2026 08:00' },
    { dot:'#10B981', teks:'Agreement ditandatangani klien James Wilson',                       waktu:'21 Okt 2026 14:00' },
    { dot:'#3B82F6', teks:'Status Agreement diubah ke Sudah TTD',                             waktu:'21 Okt 2026 13:30' },
    { dot:'#3B82F6', teks:'Quotation QUO/EFM/PP/2026/0013 disetujui',                         waktu:'20 Okt 2026 10:00' },
    { dot:'#10B981', teks:'Order PP-26-0013 dibuat untuk James Wilson oleh Admin EFM',        waktu:'20 Okt 2026 07:30' },
  ]

  /* ── Tab 3: Operasional Lapangan ─────────────────────────────────────────── */
  const dummyPICs = [
    { id: "PIC-001", nama: "Rudi Hartono",  spesialisasi: "Personal Trainer",     wa: "081234567891", status: "Aktif" },
    { id: "PIC-002", nama: "Sari Dewi",     spesialisasi: "Yoga Instructor",       wa: "081234567892", status: "Aktif" },
    { id: "PIC-003", nama: "Bima Prakoso",  spesialisasi: "Zumba Instructor",      wa: "081234567893", status: "Aktif" },
    { id: "PIC-004", nama: "Nia Rahayu",    spesialisasi: "Pilates Instructor",    wa: "081234567894", status: "Aktif" },
    { id: "PIC-005", nama: "Doni Kusuma",   spesialisasi: "Functional Training",   wa: "081234567895", status: "Aktif" },
  ]

  const dummyMitras = [
    { id: "MTR-001", nama: "PT. Gym Equipment Indonesia", tipe: "Vendor",        peran: "Supplier Alat Gym",              wa: "0211234567",    status: "Aktif" },
    { id: "MTR-002", nama: "CV. Maintenance Pro",          tipe: "Vendor",        peran: "Maintenance Fasilitas",          wa: "082198765432",  status: "Aktif" },
    { id: "MTR-003", nama: "Studio Fit Partner",           tipe: "Mitra Pelatih", peran: "Partner Instruktur Freelance",   wa: "081345678901",  status: "Aktif" },
  ]

  const [timLapangan, setTimLapangan] = useState([
    { id: "TL-001", sourceId: "PIC-001", sourceType: "PIC",   nama: "Rudi Hartono",               tipe: "PIC EFM", peran: "Head Trainer",     wa: "081234567891", status: "Aktif" },
    { id: "TL-002", sourceId: "PIC-002", sourceType: "PIC",   nama: "Sari Dewi",                  tipe: "PIC EFM", peran: "Yoga Instructor",  wa: "081234567892", status: "Aktif" },
    { id: "TL-003", sourceId: "MTR-001", sourceType: "Mitra", nama: "PT. Gym Equipment Indonesia", tipe: "Vendor",  peran: "Supplier Alat Gym", wa: "0211234567",  status: "Aktif" },
  ])

  const [jadwalOperasional, setJadwalOperasional] = useState([
    { id: "JDW-001", tanggal: "2025-02-03", jam: "06:00", kegiatan: "Sesi Yoga Pagi",            pic: "Sari Dewi",    status: "Selesai"      },
    { id: "JDW-002", tanggal: "2025-02-10", jam: "07:00", kegiatan: "Sesi Functional Training",  pic: "Rudi Hartono", status: "Selesai"      },
    { id: "JDW-003", tanggal: "2025-03-03", jam: "06:00", kegiatan: "Sesi Yoga Pagi",            pic: "Sari Dewi",    status: "Dijadwalkan"  },
  ])

  const [laporanKunjungan, setLaporanKunjungan] = useState([
    { id: "LK-001", tanggal: "2025-02-05", picKunjungan: "Rudi Hartono", kondisiUmum: "Baik", temuan: "Treadmill unit 3 perlu servis ringan", foto: null, fotoNama: null, status: "Selesai" },
  ])

  const [laporanInsiden, setLaporanInsiden] = useState([
    { id: "INS-001", tanggal: "2025-02-08", jenis: "Kerusakan Peralatan", severity: "Medium", pic: "Rudi Hartono", status: "Resolved",
      deskripsi: "Treadmill unit 3 berhenti mendadak saat sesi",
      foto: null, fotoNama: null, logAktivitas: [
        { waktu: "2025-02-08 14:30", catatan: "Insiden dilaporkan oleh Rudi Hartono", tipe: "laporan" }
      ]},
  ])

  const [showTambahTim,     setShowTambahTim]     = useState(false)
  const [showTambahJadwal,  setShowTambahJadwal]  = useState(false)
  const [showTambahLaporan, setShowTambahLaporan] = useState(false)
  const [showTambahInsiden, setShowTambahInsiden] = useState(false)
  const [sumberTim,         setSumberTim]         = useState("PIC")
  const [selectedSource,    setSelectedSource]    = useState("")
  const [newTimPeran,       setNewTimPeran]       = useState("")
  const [newTimStatus,      setNewTimStatus]      = useState("Aktif")
  const [logFilter3,        setLogFilter3]        = useState("semua")
  const [editingLaporan,    setEditingLaporan]    = useState(null)
  const [editingInsiden,    setEditingInsiden]    = useState(null)
  const [previewFoto,       setPreviewFoto]       = useState(null)
  const [newLaporan, setNewLaporan] = useState({
    tanggal: '', picKunjungan: '', kondisiUmum: 'Baik',
    temuan: '', status: 'Selesai', foto: null, fotoNama: null
  })
  const [newInsiden, setNewInsiden] = useState({
    tanggal: '', jenis: '', severity: 'Low',
    pic: '', deskripsi: '', status: 'Open',
    foto: null, fotoNama: null, logAktivitas: []
  })

  /* ── Tab 3 PP: Sesi & Progres ────────────────────────────────────────────── */
  const [jadwalSesi, setJadwalSesi] = useState([
    { id:"JS-001", tanggal:"2026-10-27", jam:"07:00", lokasi:"Hampton's Park Tower A", pic:"Sarah Jenkins", status:"Selesai" },
    { id:"JS-002", tanggal:"2026-10-29", jam:"07:00", lokasi:"Hampton's Park Tower A", pic:"Sarah Jenkins", status:"Selesai" },
    { id:"JS-003", tanggal:"2026-10-31", jam:"07:00", lokasi:"Hampton's Park Tower A", pic:"Sarah Jenkins", status:"Terjadwal" },
  ])
  const [absensiSesi, setAbsensiSesi] = useState([
    { id:"ABS-001", tanggal:"2026-10-27", jam:"07:03", foto:null, catatanKoreksi:"" },
    { id:"ABS-002", tanggal:"2026-10-29", jam:"07:01", foto:null, catatanKoreksi:"" },
    { id:"ABS-003", tanggal:"2026-10-31", jam:"06:58", foto:null, catatanKoreksi:"" },
    { id:"ABS-004", tanggal:"2026-11-03", jam:"07:05", foto:null, catatanKoreksi:"" },
  ])
  const [catatanProgres, setCatatanProgres] = useState([
    { id:"CP-001", tanggal:"2026-10-29", catatan:"Klien menunjukkan peningkatan stamina. Push-up dari 8 rep ke 12 rep. Squat sudah lebih dalam.", pic:"Sarah Jenkins" },
    { id:"CP-002", tanggal:"2026-10-27", catatan:"Sesi pertama: assessment awal. BB 78kg, tinggi 170cm. Target turun 5kg dalam 2 bulan. Fokus cardio + strength.", pic:"Sarah Jenkins" },
  ])
  const [logTab3PP, setLogTab3PP] = useState([
    { id:1, waktu:"2026-10-31 07:00", kategori:"jadwal",  nomorLaporan:"JS-003",  teks:"Sesi JS-003 terjadwal: 31 Okt 2026 07:00 di Hampton's Park" },
    { id:2, waktu:"2026-10-29 07:01", kategori:"absensi", nomorLaporan:"ABS-002", teks:"Absensi ABS-002 tercatat: Sarah Jenkins hadir 07:01" },
    { id:3, waktu:"2026-10-29 09:00", kategori:"catatan", nomorLaporan:"CP-001",  teks:"Catatan progres CP-001 ditambahkan oleh Sarah Jenkins" },
    { id:4, waktu:"2026-10-27 07:03", kategori:"absensi", nomorLaporan:"ABS-001", teks:"Absensi ABS-001 tercatat: Sarah Jenkins hadir 07:03" },
  ])
  const [logFilter3PP,          setLogFilter3PP]          = useState("semua")
  const [newCatatan,            setNewCatatan]            = useState("")
  const [newCatatanTanggal,     setNewCatatanTanggal]     = useState(new Date().toISOString().split('T')[0])
  const [editingAbsensi,        setEditingAbsensi]        = useState(null)
  const [showTambahJadwalSesi,  setShowTambahJadwalSesi]  = useState(false)
  const [showTambahAbsensiManual, setShowTambahAbsensiManual] = useState(false)
  const [newJadwalSesi,         setNewJadwalSesi]         = useState({ tanggal:"", jam:"", lokasi:"", pic:"", status:"Terjadwal" })
  const [editingJadwalSesi,     setEditingJadwalSesi]     = useState(null)

  const [invoicePP, setInvoicePP] = useState({
    nomorInvoice: 'INV-PP-26-0013',
    tanggal: '2026-10-24',
    jatuhTempo: '2026-11-07',
    catatanInvoice: '',
    statusInvoice: 'Draft',
  })
  const [rincianDraft, setRincianDraft] = useState(order?.rincianLayanan || [])

  const subtotalPP = rincianDraft.reduce((s, i) => s + (i.total || 0), 0)
  const formatRpPP = (val) => 'Rp ' + Math.round(val || 0).toLocaleString('id-ID')

  const fotoLaporanBaruRef = useRef(null)
  const fotoInsidenBaruRef = useRef(null)
  const fotoInsidenRef     = useRef(null)
  const fotoInputRef       = useRef(null)

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

  const insidenAktif = laporanInsiden.filter(
    (ins) => (ins.severity === "Critical" || ins.severity === "High") && ins.status !== "Resolved"
  )
  const programTerkait = order ? dummyPPPrograms.find((s) => s.id === order.programId) : null
  const filteredPrograms = programSearch
    ? dummyPPPrograms.filter(p =>
        p.id.toLowerCase().includes(programSearch.toLowerCase()) ||
        p.namaPaket.toLowerCase().includes(programSearch.toLowerCase()) ||
        p.namaLatihan.toLowerCase().includes(programSearch.toLowerCase())
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
  }

  function cancelEdit() { setEditingSection(null); setQuotationDraft(null) }

  function saveInfoDeal() {
    setInfoDeal({ ...infoDraft })
    setLineItems([...itemsDraft])
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
    const newId = 'PP-26-' + String(dummyPPOrders.length + 1).padStart(4, '0')
    navigate('/pp/orders/' + newId, {
      state: infoDraft.leadId ? { fromLeadId: infoDraft.leadId } : undefined,
    })
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

  const [logTab3, setLogTab3] = useState([
    { id: 1, waktu: "2025-02-08 14:30", kategori: "insiden",   nomorLaporan: "INS-001", teks: "Insiden INS-001 dilaporkan: Kerusakan Treadmill unit 3" },
    { id: 2, waktu: "2025-02-08 16:00", kategori: "insiden",   nomorLaporan: "INS-001", teks: "Insiden INS-001 di-resolve oleh Rudi Hartono" },
    { id: 3, waktu: "2025-02-05 11:00", kategori: "kunjungan", nomorLaporan: "LK-001",  teks: "Laporan kunjungan LK-001 dibuat oleh Rudi Hartono — Kondisi: Baik" },
    { id: 4, waktu: "2025-02-03 06:45", kategori: "jadwal",    nomorLaporan: null,      teks: "Sesi Yoga Pagi JDW-001 selesai dilaksanakan" },
    { id: 5, waktu: "2025-01-20 09:00", kategori: "tim",       nomorLaporan: null,      teks: "Rudi Hartono ditambahkan sebagai Head Trainer" },
    { id: 6, waktu: "2025-01-20 09:05", kategori: "tim",       nomorLaporan: null,      teks: "PT. Gym Equipment Indonesia ditambahkan sebagai Vendor" },
  ])

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

      {/* Breadcrumb — outside card */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
        {fromState?.fromLeadId ? (
          <>
            <button onClick={() => navigate('/pp/leads')} className="hover:text-[#1E1C43] transition-colors">Leads PP</button>
            <ChevronRight size={12} className="text-gray-300" />
            <button onClick={() => navigate('/pp/leads/' + fromState.fromLeadId)} className="hover:text-[#1E1C43] transition-colors">{order.namaKlien} (Lead)</button>
            <ChevronRight size={12} className="text-gray-300" />
          </>
        ) : (
          <>
            <button onClick={() => navigate('/pp/orders')} className="hover:text-[#1E1C43] transition-colors">Private Program</button>
            <ChevronRight size={12} className="text-gray-300" />
            <button onClick={() => navigate('/pp/orders')} className="hover:text-[#1E1C43] transition-colors">Orders</button>
            <ChevronRight size={12} className="text-gray-300" />
          </>
        )}
        <span className="text-[#1E1C43] font-medium">{isNew ? 'Order Baru' : order.namaKlien}</span>
      </nav>

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
                <Badge cls={STATUS_CLS[order.statusOrder] ?? 'bg-gray-100 text-gray-600'}>
                  ● {order.statusOrder}
                </Badge>
                <Badge cls="bg-gray-100 text-gray-600">{order.tahapan}</Badge>
                <span className="text-[10px] text-gray-400">Mulai {order.tanggalMulai ? fmtDate(order.tanggalMulai) : '—'}</span>
              </div>
              <div className="flex items-center gap-1 mt-3 flex-wrap">
                {TAHAPAN_STEPS.map((step, i) => {
                  const orderIdx = TAHAPAN_ORDER[order.tahapan] ?? 0
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
              {!isNew && order.leadId && (
                <button
                  onClick={() => navigate('/pp/leads/' + order.leadId, { state: { fromOrderId: order.id } })}
                  className="inline-flex items-center gap-1.5 border border-[#1E1C43] text-[#1E1C43] text-xs px-3 py-1.5 rounded-lg hover:bg-[#1E1C43] hover:text-white transition-colors font-medium"
                >
                  Lihat Lead →
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
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl shadow-sm p-1 mb-5 w-fit">
        {[
          { key: 'keuangan',    label: 'Kontrak & Keuangan',  locked: false },
          { key: 'dokumen',     label: 'Dokumen Kerjasama',   locked: isNew },
          { key: 'operasional', label: 'Operasional Lapangan', locked: isNew },
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


          {/* Section 1 — Info Deal */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Info Deal & Detail Program</h3>
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

            {/* Data Pendaftar */}
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

            {/* Data Klien Latihan */}
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

            {/* Program & Rincian Biaya */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Program & Rincian Biaya</p>

              {/* Program combobox — only in edit mode */}
              {editingSection === 'infoDeal' && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Pilih Program & Paket</p>
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
                            }}
                            className={`w-full text-left px-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-blue-50 transition-colors flex items-center gap-2 ${
                              infoDraft.programId === prog.id ? 'bg-blue-50' : ''
                            }`}>
                            <span className="text-[10px] font-semibold text-[#1E1C43] bg-[#1E1C43]/10 px-1.5 py-0.5 rounded">{prog.id}</span>
                            <span className="text-xs text-gray-500">{prog.namaLatihan}</span>
                            <span className="text-gray-300">·</span>
                            <span className="text-xs font-medium text-gray-700 flex-1">{prog.namaPaket}</span>
                            <span className="text-xs font-semibold text-[#E05945] shrink-0">{fmtRp(prog.hargaPaket)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {infoDraft.programId && (
                    <p className="text-[10px] text-gray-400 mt-1">ID terpilih: <span className="font-semibold text-[#1E1C43]">{infoDraft.programId}</span></p>
                  )}
                </div>
              )}

              {/* Compact paket strip — live-previews the combobox selection in edit mode */}
              {(() => {
                const stripProg = editingSection === 'infoDeal'
                  ? (dummyPPPrograms.find(p => p.id === infoDraft.programId) || programTerkait)
                  : programTerkait
                return stripProg ? (
                  <div className="bg-gray-50 rounded-xl p-4 mb-3">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-mono mb-0.5">{stripProg.id}</p>
                        <p className="text-sm font-bold text-[#1E1C43]">
                          {stripProg.namaLatihan}
                          <span className="font-normal text-gray-500"> · {stripProg.namaPaket}</span>
                        </p>
                      </div>
                      <p className="text-base font-bold text-[#1E1C43] shrink-0">{formatRpPP(stripProg.hargaPaket)}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {[stripProg.sesi + ' sesi', stripProg.pertemuan, stripProg.masaBerlaku].map(v => (
                        <span key={v} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{v}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#1E1C43] text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
                        {stripProg.pic.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <p className="text-xs text-gray-600 flex-1">{stripProg.pic}</p>
                      <p className="text-xs text-[#E05945] font-medium shrink-0">{formatRpPP(stripProg.biayaPerSesi)}/sesi</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 mb-3 text-center text-xs text-gray-400 italic">
                    Data program tidak ditemukan
                  </div>
                )
              })()}

              {/* Biaya tambahan — view-only */}
              {rincianDraft.slice(1).length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {rincianDraft.slice(1).map((item, idx) => (
                    <div key={item.id || idx} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{item.namaItem || '—'}</p>
                      <p className="text-sm font-semibold text-gray-800">{formatRpPP(item.total)}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Nilai Order</span>
                <span className="text-base font-bold text-[#1E1C43]">{formatRpPP(subtotalPP)}</span>
              </div>
            </div>

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

          {/* ── Section: Invoice (compact link card) ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Invoice</h3>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                invoicePP.statusInvoice === 'Lunas'    ? 'bg-green-100 text-green-700' :
                invoicePP.statusInvoice === 'Terkirim' ? 'bg-blue-100 text-blue-700'  :
                'bg-gray-100 text-gray-600'
              }`}>{invoicePP.statusInvoice}</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3 mb-4">
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
              <button
                onClick={() => navigate(`/pp/invoice/${invoicePP.nomorInvoice}`)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1E1C43] text-white rounded-xl text-xs font-semibold hover:bg-[#2d2b5e] transition">
                <Eye size={13} /> Buka Invoice
              </button>
            </div>
          </div>



        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2 — Dokumen Kerjasama
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'dokumen' && (() => {
        const DOK_LEVEL = { 'Quotation': 0, 'Agreement': 1, 'Program Berjalan': 2, 'Program Selesai': 3 }
        const getDokStepStatus = (stepLevel) => {
          const cur = DOK_LEVEL[order?.tahapan] ?? 0
          if (cur > stepLevel) return 'completed'
          if (cur === stepLevel) return 'current'
          return 'pending'
        }
        return (
        <div className="space-y-4">

          {/* ── Stepper: Pipeline Dokumen ──────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Progress Dokumen Kerjasama</p>
            <div className="flex items-center">
              {[
                { level: 0, label: 'Quotation',       icon: '📋' },
                { level: 1, label: 'Agreement / PKS', icon: '📝' },
                { level: 2, label: 'Program Berjalan',icon: '🏃' },
                { level: 3, label: 'Program Selesai', icon: '✅' },
              ].map((step, idx, arr) => {
                const s = getDokStepStatus(step.level)
                return (
                  <div key={step.level} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                        s === 'completed' ? 'bg-green-500 border-green-500 text-white'
                          : s === 'current' ? 'bg-[#1E1C43] border-[#1E1C43] text-white'
                          : 'bg-white border-gray-200 text-gray-400'
                      }`}>
                        {s === 'completed' ? '✓' : step.icon}
                      </div>
                      <p className={`text-[10px] mt-1 font-semibold ${
                        s === 'completed' ? 'text-green-600'
                          : s === 'current' ? 'text-[#1E1C43]'
                          : 'text-gray-400'
                      }`}>{step.label}</p>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 ${s === 'completed' ? 'bg-green-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>


          {/* ── Section 1: Agreement / PKS Klien ─────────────────────────── */}
          {(() => {
            const AGR_STATUS_OPTS = ['Belum TTD', 'Menunggu Approval', 'Sudah TTD']
            const AGR_STATUS_CLS = {
              'Belum TTD':         'bg-gray-100 text-gray-500',
              'Menunggu Approval': 'bg-yellow-100 text-yellow-700',
              'Sudah TTD':         'bg-green-100 text-green-700',
            }
            const isEditing = editingDoc === 'agreement'
            const doc = isEditing ? (agreementDraft || agreementDoc) : agreementDoc
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-[#1E1C43]">Agreement / PKS Klien</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Ada Agreement?</span>
                      <ToggleSwitch checked={adaAgreement} onChange={setAdaAgreement} />
                    </div>
                    {adaAgreement && (
                      <Badge cls={AGR_STATUS_CLS[agreementDoc.status] ?? 'bg-gray-100 text-gray-500'}>
                        {agreementDoc.status}
                      </Badge>
                    )}
                  </div>
                  {adaAgreement && (
                    isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setAgreementDoc({ ...agreementDraft }); setEditingDoc(null); setAgreementDraft(null) }}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90"
                        >
                          <Save size={12} /> Simpan
                        </button>
                        <button
                          onClick={() => { setEditingDoc(null); setAgreementDraft(null) }}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50"
                        >
                          <X size={12} /> Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAgreementDraft({ ...agreementDoc }); setEditingDoc('agreement') }}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                    )
                  )}
                </div>

                {adaAgreement ? (
                  <div className="p-5 space-y-4">
                    {/* Status */}
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-32 shrink-0">Status</span>
                      {isEditing ? (
                        <select
                          value={doc.status}
                          onChange={e => setAgreementDraft(p => ({ ...p, status: e.target.value }))}
                          className="h-8 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]"
                        >
                          {AGR_STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      ) : (
                        <Badge cls={AGR_STATUS_CLS[doc.status] ?? 'bg-gray-100 text-gray-500'}>{doc.status}</Badge>
                      )}
                    </div>

                    {/* Tanggal TTD */}
                    {(isEditing || doc.status === 'Sudah TTD') && (
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-32 shrink-0">Tanggal TTD</span>
                        {isEditing && doc.status === 'Sudah TTD' ? (
                          <input
                            type="date"
                            value={doc.tglTTD || ''}
                            onChange={e => setAgreementDraft(p => ({ ...p, tglTTD: e.target.value }))}
                            className="h-8 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]"
                          />
                        ) : (
                          <span className="text-sm text-gray-700">{doc.tglTTD ? fmtDate(doc.tglTTD) : '—'}</span>
                        )}
                      </div>
                    )}

                    {/* URL Google Docs */}
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-32 shrink-0">Google Docs</span>
                      {isEditing ? (
                        <input
                          type="url"
                          value={doc.gdocsUrl || ''}
                          onChange={e => setAgreementDraft(p => ({ ...p, gdocsUrl: e.target.value }))}
                          placeholder="https://docs.google.com/..."
                          className="flex-1 h-8 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]"
                        />
                      ) : doc.gdocsUrl ? (
                        <a href={doc.gdocsUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          Buka Google Docs <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>

                    {/* Upload file */}
                    {isEditing && (
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Upload File Agreement</label>
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
                                  if (file) {
                                    setAgreementDraft(p => ({
                                      ...p,
                                      uploadedFile: { nama: file.name, tanggal: new Date().toLocaleDateString('id-ID') }
                                    }))
                                  }
                                }}
                              />
                              <span className="text-xs text-[#1E1C43] font-semibold hover:underline">
                                Pilih file PDF atau gambar
                              </span>
                              <p className="text-[10px] text-gray-400 mt-0.5">PDF, JPG, PNG · Maks 5MB</p>
                            </div>
                          </label>
                          {doc.uploadedFile && (
                            <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                              <CheckCircle size={13} className="text-green-600 shrink-0" />
                              <span className="text-xs text-green-700 font-medium">{doc.uploadedFile.nama}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Riwayat file */}
                    {doc.riwayat && doc.riwayat.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Riwayat File</p>
                        <div className="space-y-1.5">
                          {doc.riwayat.map(r => (
                            <div key={r.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-xs font-medium text-gray-700 flex-1">{r.nama}</span>
                              <span className="text-[10px] text-gray-400">{r.tanggal}</span>
                              <Badge cls={AGR_STATUS_CLS[r.status] ?? 'bg-gray-100 text-gray-500'}>{r.status}</Badge>
                              <button className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-[#1E1C43] transition-colors">
                                <Download size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tombol Lihat Agreement */}
                    {!isEditing && doc.uploadedFile && (
                      <div className="pt-2 border-t border-gray-100">
                        <button onClick={() => window.print()} className="inline-flex items-center gap-2 text-xs text-[#1E1C43] font-semibold hover:underline">
                          <Download size={13} /> Lihat Agreement
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-5 py-4">
                    <p className="text-sm text-gray-400 italic">Klien ini tidak memiliki Agreement / PKS.</p>
                  </div>
                )}
              </div>
            )
          })()}

          {/* ── Section 2: Dokumen Tambahan & Screening ──────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Dokumen Tambahan</h3>
            </div>
            <div className="p-5 space-y-5">

              {/* Riwayat Fitness Assessment */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Riwayat Fitness Assessment
                </p>
                {order.leadId && (
                  <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-blue-600">i</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-blue-700">Data kesehatan awal klien tersimpan di Lead</p>
                      <p className="text-xs text-blue-600 mt-0.5">Lihat tab Kesehatan di halaman Lead untuk riwayat screening & Fitness Assessment.</p>
                    </div>
                    <button
                      onClick={() => navigate('/pp/leads/' + order.leadId, { state: { defaultTab: 'kesehatan', fromOrderId: order.id } })}
                      className="shrink-0 text-[10px] font-semibold text-blue-700 hover:underline whitespace-nowrap">
                      Lihat →
                    </button>
                  </div>
                )}
                {(() => {
                  const dummyFARecords = [
                    { id: "SCR-26-0001", namaKlien: "James Wilson", tanggal: "2026-10-15", statusFA: "Selesai" },
                    { id: "SCR-26-0002", namaKlien: "Emily Chen", tanggal: "2026-10-18", statusFA: "Selesai" },
                    { id: "SCR-26-0003", namaKlien: "Rian Maulana", tanggal: "2026-10-20", statusFA: "Draft" },
                  ]
                  const linkedFA = dummyFARecords.find(s => s.id === selectedScreeningId)
                  return (
                    <div>
                      <div className="flex gap-3 mb-2">
                        <select
                          value={selectedScreeningId}
                          onChange={e => setSelectedScreeningId(e.target.value)}
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                          <option value="">— Pilih nomor Fitness Assessment —</option>
                          {dummyFARecords.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.id} · {s.namaKlien} · {s.tanggal}
                            </option>
                          ))}
                        </select>
                        {selectedScreeningId && (
                          <button
                            onClick={() => navigate('/pp/screening/' + selectedScreeningId, { state: { leadId: order.leadId, orderId: order.id } })}
                            className="px-3 py-2.5 bg-[#1E1C43] text-white rounded-xl text-xs font-semibold hover:bg-[#2d2b5e] transition flex items-center gap-1.5 flex-shrink-0">
                            <ExternalLink size={13} /> Lihat Detail
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => navigate('/pp/screening/new', { state: { namaKlien: order?.namaKlien || infoDeal.namaKlien, leadId: order?.leadId, orderId: order?.id } })}
                        className="text-xs text-[#E05945] font-semibold hover:underline flex items-center gap-1 mb-3">
                        <Plus size={12} /> Buat Fitness Assessment untuk klien ini
                      </button>
                      {linkedFA && (
                        <div className="bg-[#1E1C43]/5 border border-[#1E1C43]/10 rounded-xl p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-mono text-[#1E1C43] mb-0.5">{linkedFA.id}</p>
                              <p className="text-sm font-semibold text-gray-800">{linkedFA.namaKlien}</p>
                              <p className="text-xs text-gray-400">{linkedFA.tanggal}</p>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              linkedFA.statusFA === "Selesai"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {linkedFA.statusFA}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>

              {/* Upload Dokumen Tambahan */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Upload Dokumen Lain
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  Dokumen pendukung lainnya (surat dokter, hasil lab, foto progress, dll)
                </p>

                {/* Upload area */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-[#1E1C43]/30 transition-colors mb-3">
                  <label className="cursor-pointer flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        multiple
                        className="hidden"
                        onChange={e => {
                          const files = Array.from(e.target.files)
                          const newDocs = files.map((f, i) => ({
                            id: Date.now() + i,
                            nama: f.name,
                            tgl: new Date().toLocaleDateString('id-ID'),
                            keterangan: ''
                          }))
                          setDokumenTambahan(prev => [...prev, ...newDocs])
                        }}
                      />
                      <span className="text-xs text-[#1E1C43] font-semibold hover:underline">
                        Pilih file (multiple)
                      </span>
                      <p className="text-[10px] text-gray-400 mt-0.5">PDF, JPG, PNG, DOCX · Maks 10MB/file</p>
                    </div>
                  </label>
                </div>

                {/* List dokumen */}
                {dokumenTambahan.length > 0 ? (
                  <div className="space-y-2">
                    {dokumenTambahan.map(dok => (
                      <div key={dok.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                        <span className="text-sm">📄</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">{dok.nama}</p>
                          <p className="text-[10px] text-gray-400">{dok.tgl} · {dok.keterangan || 'Dokumen pendukung'}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-[#1E1C43] transition-colors">
                            <Download size={11} />
                          </button>
                          <button
                            onClick={() => setDokumenTambahan(prev => prev.filter(d => d.id !== dok.id))}
                            className="h-6 w-6 flex items-center justify-center rounded text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-2">Belum ada dokumen tambahan diupload.</p>
                )}
              </div>

            </div>
          </div>

          {/* ── Log Aktivitas ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-[#1E1C43]">Log Aktivitas</h3>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {LOG_DATA.map((l, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: l.dot }} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-700">{l.teks}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{l.waktu}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
        )
      })()}


      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3 — Operasional Sesi (PP)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'operasional' && (
        <div className="space-y-4">

          {/* ── Section 1: Referensi Program ── */}
          {(() => {
            const prog = dummyPPPrograms.find(p => p.id === order.programId)
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Referensi Program</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prog ? 'bg-[#1E1C43] text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {prog ? 'Terhubung' : 'Belum Ada'}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/pp/program-db')}
                    className="text-xs text-[#1E1C43] hover:underline flex items-center gap-1 font-medium"
                  >
                    Lihat Program DB <ChevronRight size={12} />
                  </button>
                </div>
                {prog ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Nama Latihan',       prog.namaLatihan],
                      ['Nama Paket',         prog.namaPaket],
                      ['Total Sesi',         prog.sesi + ' sesi'],
                      ['Frekuensi',          prog.pertemuan],
                      ['Masa Berlaku',       prog.masaBerlaku],
                      ['PIC Pelatih',        prog.pic],
                      ['Biaya / Sesi',       'Rp ' + prog.biayaPerSesi.toLocaleString('id-ID')],
                      ['Harga Paket',        'Rp ' + prog.hargaPaket.toLocaleString('id-ID')],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                        <p className="text-sm font-semibold text-gray-800">{val}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <ClipboardList size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Belum ada referensi program terhubung</p>
                    <p className="text-xs mt-1">Hubungkan program dari halaman Program DB</p>
                  </div>
                )}
              </div>
            )
          })()}

          {/* ── Section 2: Jadwal Sesi ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-base font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Jadwal Sesi</h3>
              <span className="bg-[#1E1C43] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {jadwalSesi.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['No', 'Tanggal', 'Jam', 'Lokasi', 'PIC Pelatih', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jadwalSesi.map((j, i) => (
                    <tr key={j.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{j.tanggal}</td>
                      <td className="px-4 py-3 text-sm text-blue-600 font-mono">{j.jam}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{j.lokasi}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{j.pic}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          j.status === 'Selesai'     ? 'bg-green-50 text-green-700' :
                          j.status === 'Berlangsung' ? 'bg-blue-50 text-blue-700'  :
                          j.status === 'Dibatalkan'  ? 'bg-red-50 text-red-600'    :
                          'bg-yellow-50 text-yellow-700'
                        }`}>{j.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setEditingJadwalSesi({ ...j })}
                          className="text-gray-400 hover:text-[#1E1C43] transition p-1"
                        >
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setShowTambahJadwalSesi(true)}
              className="mt-4 w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-[#1E1C43] hover:text-[#1E1C43] transition flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Tambah Jadwal Sesi
            </button>
          </div>

          {/* ── Section 3: Absensi Sesi ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Absensi Sesi</h3>
              <span className="bg-[#1E1C43] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {absensiSesi.length}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4 ml-3">Riwayat kehadiran berdasarkan scan barcode pelatih</p>

            {/* Progress bar */}
            {(() => {
              const prog = dummyPPPrograms.find(p => p.id === order.programId)
              const total = prog?.sesi || jadwalSesi.length || 12
              const hadir = absensiSesi.length
              const pct = Math.min(100, Math.round((hadir / total) * 100))
              return (
                <div className="mb-4 bg-gray-50 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-700">{hadir}/{total} sesi selesai</span>
                    <span className="text-xs text-gray-400">{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 50 ? 'bg-green-500' : 'bg-orange-400'}`}
                      style={{ width: pct + '%' }}
                    />
                  </div>
                </div>
              )
            })()}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['No', 'Tanggal', 'Jam', 'Foto Bukti', 'Aksi'].map(h => (
                      <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {absensiSesi.map((a, i) => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{a.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{a.tanggal}</td>
                      <td className="px-4 py-3 text-sm text-blue-600 font-mono">{a.jam}</td>
                      <td className="px-4 py-3">
                        {a.foto ? (
                          <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            <ImageIcon size={12} /> Lihat Foto
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setEditingAbsensi({ ...a })}
                          className="text-gray-400 hover:text-[#1E1C43] transition p-1 flex items-center gap-1 text-xs"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setShowTambahAbsensiManual(true)}
              className="mt-4 w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-[#1E1C43] hover:text-[#1E1C43] transition flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Tambah Entry Absensi Manual
            </button>
          </div>

          {/* ── Section 4: Catatan Progres Klien ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Catatan Progres Klien</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4 ml-3">Rekam perkembangan klien per sesi atau per periode</p>

            {/* Input baru */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
              <textarea
                value={newCatatan}
                onChange={e => setNewCatatan(e.target.value)}
                placeholder="Tambah catatan progres..."
                rows={3}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none mb-2"
              />
              <div className="flex items-center gap-2 justify-end">
                <input
                  type="date"
                  value={newCatatanTanggal}
                  onChange={e => setNewCatatanTanggal(e.target.value)}
                  className="border border-gray-200 bg-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]"
                />
                <button
                  onClick={() => {
                    if (!newCatatan.trim()) return
                    const newId = 'CP-' + Date.now()
                    setCatatanProgres(prev => [{
                      id: newId, tanggal: newCatatanTanggal,
                      catatan: newCatatan.trim(), pic: 'Admin'
                    }, ...prev])
                    setLogTab3PP(prev => [...prev, {
                      id: Date.now(), waktu: new Date().toLocaleString('id-ID'),
                      kategori: 'catatan', nomorLaporan: newId,
                      teks: 'Catatan progres baru ditambahkan'
                    }])
                    setNewCatatan('')
                  }}
                  disabled={!newCatatan.trim()}
                  className="bg-[#1E1C43] text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-[#2d2b5e] transition disabled:opacity-40"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>

            {/* List catatan */}
            <div className="space-y-3">
              {catatanProgres.map(cp => (
                <div key={cp.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-400">{cp.tanggal} · {cp.pic}</p>
                    <div className="flex gap-2">
                      <button className="text-xs text-gray-400 hover:text-[#1E1C43] transition">Edit</button>
                      <button
                        onClick={() => setCatatanProgres(prev => prev.filter(x => x.id !== cp.id))}
                        className="text-xs text-red-400 hover:text-red-600 transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{cp.catatan}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 5: Log Aktivitas Operasional ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-[#1E1C43]" />
                <h3 className="text-base font-bold text-[#1E1C43]">Log Aktivitas Operasional</h3>
              </div>
              <div className="flex gap-1">
                {['semua', 'jadwal', 'absensi', 'catatan'].map(k => (
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
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[10px] text-gray-400">{l.waktu}</p>
                    {l.nomorLaporan && (
                      <span className="text-[10px] bg-[#1E1C43]/10 text-[#1E1C43] px-1.5 py-0.5 rounded font-mono">
                        {l.nomorLaporan}
                      </span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      l.kategori === 'absensi' ? 'bg-blue-50 text-blue-600'   :
                      l.kategori === 'jadwal'  ? 'bg-green-50 text-green-600' :
                      l.kategori === 'catatan' ? 'bg-purple-50 text-purple-600' :
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
                  setAbsensiSesi(prev => prev.map(x => x.id === editingAbsensi.id ? { ...editingAbsensi } : x))
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

      {/* ── Modal Tambah Jadwal Sesi ──────────────────────────────────────────── */}
      {showTambahJadwalSesi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-base font-bold text-[#1E1C43]">Tambah Jadwal Sesi</h3>
              <button onClick={() => setShowTambahJadwalSesi(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tanggal *</label>
                  <input
                    type="date"
                    value={newJadwalSesi.tanggal}
                    onChange={e => setNewJadwalSesi({ ...newJadwalSesi, tanggal: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jam</label>
                  <input
                    type="time"
                    value={newJadwalSesi.jam}
                    onChange={e => setNewJadwalSesi({ ...newJadwalSesi, jam: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Lokasi</label>
                <input
                  type="text"
                  value={newJadwalSesi.lokasi}
                  onChange={e => setNewJadwalSesi({ ...newJadwalSesi, lokasi: e.target.value })}
                  placeholder="cth. Hampton's Park Tower A"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">PIC Pelatih</label>
                <input
                  type="text"
                  value={newJadwalSesi.pic}
                  onChange={e => setNewJadwalSesi({ ...newJadwalSesi, pic: e.target.value })}
                  placeholder="Nama pelatih"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                <select
                  value={newJadwalSesi.status}
                  onChange={e => setNewJadwalSesi({ ...newJadwalSesi, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]"
                >
                  <option>Terjadwal</option>
                  <option>Berlangsung</option>
                  <option>Selesai</option>
                  <option>Dibatalkan</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => { setShowTambahJadwalSesi(false); setNewJadwalSesi({ tanggal: '', jam: '', lokasi: '', pic: '', status: 'Terjadwal' }) }}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!newJadwalSesi.tanggal) return
                  const newId = 'JS-' + String(jadwalSesi.length + 1).padStart(3, '0')
                  setJadwalSesi(prev => [...prev, { id: newId, ...newJadwalSesi }])
                  setLogTab3PP(prev => [...prev, {
                    id: Date.now(), waktu: new Date().toLocaleString('id-ID'),
                    kategori: 'jadwal', nomorLaporan: newId,
                    teks: 'Jadwal sesi ' + newId + ' ditambahkan: ' + newJadwalSesi.tanggal + ' ' + newJadwalSesi.jam
                  }])
                  setShowTambahJadwalSesi(false)
                  setNewJadwalSesi({ tanggal: '', jam: '', lokasi: '', pic: '', status: 'Terjadwal' })
                }}
                disabled={!newJadwalSesi.tanggal}
                className="flex-1 bg-[#1E1C43] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#2d2b5e] transition disabled:opacity-50"
              >
                Simpan Jadwal
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
                  setLogTab3PP(prev => [...prev, {
                    id: Date.now(), waktu: new Date().toLocaleString('id-ID'),
                    kategori: 'absensi', nomorLaporan: newId,
                    teks: 'Absensi manual ' + newId + ' ditambahkan: ' + tgl + ' — ' + cat.substring(0, 40)
                  }])
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
    </>
  )
}

