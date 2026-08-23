import { useState, useRef } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { getCompanySettings } from '../../utils/companySettings'
import { ArrowLeft, ChevronRight, Edit2, Save, X, Plus, Trash2, ChevronDown, ExternalLink, Printer, Eye, Download, CheckCircle, MapPin, Users, Calendar, ClipboardList, AlertTriangle, Activity, ImageIcon, FileText, Clock } from 'lucide-react'

/* ═══════════════════════════════════════
   Constants
═══════════════════════════════════════ */
const BULAN_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const PAY_TERMS_OPTS = ['Full Payment', '50% DP + Pelunasan', 'Custom']
const PAY_STATUS_OPTS = ['Belum Ditagih','Invoice Terkirim','Lunas','Jatuh Tempo']

const TAHAPAN_CLS = {
  'Quotation':     'bg-amber-100 text-amber-700',
  'LOI':           'bg-orange-100 text-orange-700',
  'MOU':           'bg-blue-100 text-blue-700',
  'Contract':      'bg-purple-100 text-purple-700',
  'Event Running': 'bg-green-100 text-green-700',
  'Event Selesai': 'bg-gray-100 text-gray-500',
}
const STATUS_CLS = {
  Aktif:   'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Selesai: 'bg-gray-100 text-gray-600',
  Batal:   'bg-red-100 text-red-600',
}
const PAY_STATUS_CLS = {
  'Belum Ditagih':   'bg-gray-100 text-gray-500',
  'Invoice Terkirim':'bg-blue-100 text-blue-700',
  'Lunas':           'bg-green-100 text-green-700',
  'Jatuh Tempo':     'bg-red-100 text-red-600',
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
   Master data (mirrors EventOrdersPage)
═══════════════════════════════════════ */
const dummyEventOrders = [
  {
    id: 'EV-26-0003',
    namaKlien:     'PT. Sinar Abadi',
    tipeKlien:     'Corporate',
    jenis:         'Corporate',
    namaEvent:     'Fun Run Jakarta 2026',
    jenisEvent:    'Fun Run',
    peranEFM:      'Main Organizer',
    lokasiEvent:   'GBK, Jakarta Selatan',
    tglEvent:      '2026-06-28',
    program:       'Main Organizer – Fun Run Jakarta 2026',
    nilaiNum:      85_000_000,
    periode:       'Jun 2026',
    tanggalMulai:  '2026-06-01',
    tanggalSelesai:'2026-06-28',
    tahapan:       'Event Running',
    status:        'Aktif',
    pic:           'Bagoes',
    contactPerson: 'Bapak Hendra',
    telepon:       '0812-3456-7890',
    catatan:       'Event skala besar 2.000 peserta. Venue GBK sudah confirmed.',
    konsultasiId:  'KNS-26-0001',
    payTerms:      '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0002',
    namaKlien:     'Komunitas Sehat ID',
    tipeKlien:     'Community',
    jenis:         'Community',
    namaEvent:     'Yoga Festival Senayan 2026',
    jenisEvent:    'Yoga Festival',
    peranEFM:      'Co-Organizer',
    lokasiEvent:   'Lapangan Senayan, Jakarta Pusat',
    tglEvent:      '2026-08-15',
    program:       'Co-Organizer – Yoga Festival Senayan 2026',
    nilaiNum:      30_000_000,
    periode:       'Agu 2026',
    tanggalMulai:  '2026-07-01',
    tanggalSelesai:'2026-08-15',
    tahapan:       'Contract',
    status:        'Aktif',
    pic:           'Emma',
    contactPerson: 'Ibu Sari',
    telepon:       '0821-9876-5432',
    catatan:       '',
    konsultasiId:  'KNS-26-0003',
    payTerms:      '50% DP + Pelunasan',
  },
]
const ORDERS_MAP = Object.fromEntries(dummyEventOrders.map(o => [o.id, o]))

/* ── Per-order line items ─────────────────────────────────────────────────── */
const LINE_ITEMS_MAP = {
  'EV-26-0003': [
    { id: 1, namaItem: 'Jasa Event Organizer & Koordinasi',   satuan: 'Paket', jumlah: 1, keterangan: 'Main organizer fitness segment' },
    { id: 2, namaItem: 'Instruktur & Tim Lapangan (5 orang)', satuan: 'Hari',  jumlah: 1, keterangan: '5 instruktur + 3 koordinator' },
    { id: 3, namaItem: 'Peralatan & Perlengkapan Fitness',    satuan: 'Paket', jumlah: 1, keterangan: 'Sewa peralatan event' },
  ],
}
function defaultLineItems(order) {
  return LINE_ITEMS_MAP[order?._key] || [
    { id: 1, namaItem: order?.program || '', satuan: 'Bulan', jumlah: 1, keterangan: '' },
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
const TAHAPAN_STEPS = ['Quotation', 'LOI', 'MOU', 'Contract', 'Event Running', 'Event Selesai']
const TAHAPAN_ORDER = { 'Quotation': 0, 'LOI': 1, 'MOU': 2, 'Contract': 3, 'Event Running': 4, 'Event Selesai': 5 }

/* ── Generate payment schedule ────────────────────────────────────────────── */
function generatePayRows(_startStr, _endStr, terms, nilaiNum) {
  if (terms === '50% DP + Pelunasan') {
    const dp = Math.round(nilaiNum * 0.5)
    return [
      { id: 0, periode: 'DP (50%)',        nominal: dp,            status: 'Belum Ditagih', tglBayar: '' },
      { id: 1, periode: 'Pelunasan (50%)', nominal: nilaiNum - dp, status: 'Belum Ditagih', tglBayar: '' },
    ]
  }
  if (terms === 'Full Payment') {
    return [{ id: 0, periode: 'Full Payment', nominal: nilaiNum, status: 'Belum Ditagih', tglBayar: '' }]
  }
  return []
}

/* ── Invoice / Receipt ID lookup maps ────────────────────────────────────── */
const INVOICE_ID_MAP = {
  'EV-26-0003|DP (50%)':        'INV-EV-26-0001',
  'EV-26-0003|Pelunasan (50%)': 'INV-EV-26-0002',
  'EV-26-0002|DP (50%)':        'INV-EV-26-0003',
  'EV-26-0002|Pelunasan (50%)': 'INV-EV-26-0004',
}
const RECEIPT_ID_MAP = {
  'EV-26-0003|DP (50%)': 'RCP-EV-26-0001',
  'EV-26-0002|DP (50%)': 'RCP-EV-26-0002',
}

/* ── EO-001 specific payment rows ─────────────────────────────────────────── */
const PAY_ROWS_EO001 = [
  { id: 0, periode: 'DP (50%)',        nominal: 42_500_000, status: 'Lunas',          tglBayar: '2026-06-05' },
  { id: 1, periode: 'Pelunasan (50%)', nominal: 42_500_000, status: 'Belum Ditagih',  tglBayar: '' },
]

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

function SectionCard({ title, editing, onEdit, onSave, onCancel, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-[#1E1C43]">{title}</h3>
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
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors"
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
export default function EventOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const settings = getCompanySettings()
  const isNew = !id || id === 'new'
  const fromState = location.state || {}

  const order = isNew
    ? {
        id: 'BARU',
        namaKlien: fromState?.namaPerusahaan || '',
        jenis: fromState?.tipe || 'Corporate',
        program: '',
        tanggalMulai: '',
        tanggalSelesai: '',
        pic: '',
        contactPerson: fromState?.picKlien || '',
        telepon: fromState?.noHP || '',
        catatan: fromState?.rekomendasi || '',
        status: 'Draft',
        tahapan: 'Quotation & LOI',
        nilaiNum: 0,
        nilai: 'Rp 0',
        periode: '',
        payTerms: '50% DP + Pelunasan',
      }
    : ORDERS_MAP[id]

  /* ── Section state ───────────────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState('keuangan')
  const [editingSection, setEditingSection] = useState(isNew ? 'infoDeal' : null)
  // null | 'infoDeal' | 'quotation' | 'paymentTerms' | 'profitSharing'

  /* Section 1 — Info Deal */
  const initInfo = order
    ? { namaKlien: order.namaKlien, jenis: order.jenis, program: order.program,
        tanggalMulai: order.tanggalMulai, tanggalSelesai: order.tanggalSelesai,
        pic: order.pic, contactPerson: order.contactPerson,
        telepon: order.telepon, catatan: order.catatan }
    : {}
  const [infoDeal, setInfoDeal] = useState(initInfo)
  const [infoDraft, setInfoDraft] = useState(initInfo)

  const initItems = order ? (LINE_ITEMS_MAP[id] || defaultLineItems({ ...order, _key: id })) : []
  const [lineItems, setLineItems] = useState(initItems)
  const [itemsDraft, setItemsDraft] = useState(initItems)

  /* Section Quotation */
  const initQuotationItems = id === 'EV-26-0003'
    ? [
        { id: 1, item: 'Jasa Event Organizer & Koordinasi',   satuan: 'Paket', jumlah: 1, rate: 50_000_000 },
        { id: 2, item: 'Instruktur & Tim Lapangan (5 orang)', satuan: 'Hari',  jumlah: 1, rate: 25_000_000 },
        { id: 3, item: 'Peralatan & Perlengkapan Fitness',    satuan: 'Paket', jumlah: 1, rate: 10_000_000 },
      ]
    : (order ? [{ id: 1, item: order.program, satuan: 'Paket', jumlah: 1, rate: order.nilaiNum }] : [])
  const [quotationData, setQuotationData] = useState({
    nomorQuotation: id === 'EV-26-0003' ? 'QUO-EVENT-001' : `QUO-${id}`,
    tanggal: order?.tanggalMulai || '',
    berlakuSampai: '2026-06-15',
    items: initQuotationItems,
    managementFee: { aktif: false, persen: 0 },
    pajakList: [{ id: 1, nama: 'PPN', persen: 11, aktif: true }],
    catatanSyarat: '',
    status: 'Terkirim',
  })
  const [quotationDraft, setQuotationDraft] = useState(null)

  /* Section 2 — Payment Terms */
  const initPayTerms = order?.payTerms || '50% DP + Pelunasan'
  const initPayRows  = id === 'EV-26-0003'
    ? PAY_ROWS_EO001
    : order ? generatePayRows(order.tanggalMulai, order.tanggalSelesai, order.payTerms, order.nilaiNum) : []
  const [payTerms, setPayTerms] = useState(initPayTerms)
  const [payRows,  setPayRows]  = useState(initPayRows)
  const [payTermsDraft, setPayTermsDraft] = useState(initPayTerms)
  const [payRowsDraft,  setPayRowsDraft]  = useState(initPayRows)

  /* Section 3 — Profit Sharing */
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

  const [qDoc, setQDoc] = useState({ status: 'Terkirim', signedFile: null, riwayat: [{ id:1, nama:'LOI-yayasan-kanker-indonesia.pdf', tanggal:'5 Jun 2026', status:'Terkirim' }] })
  const [mouDoc, setMouDoc] = useState({ status: 'Drafting', gdocsUrl: '', riwayat: [] })
  const [cDoc, setCDoc] = useState({ status: 'Signed', gdocsUrl: 'https://docs.google.com/document/d/xyz789', riwayat: [{ id:1, nama:'contract-yayasan-kanker-final.pdf', tgl:'10 Jun 2026', status:'Signed' }] })
  const [qDraft, setQDraft]   = useState(null)
  const [mouDraft, setMouDraft] = useState(null)
  const [cDraft, setCDraft]   = useState(null)
  const [showLOIPreview, setShowLOIPreview] = useState(false)

  /* ── Tab 2: Jadwal Kegiatan ──────────────────────────────────────────────── */
  const [editingJadwal, setEditingJadwal] = useState(null)
  const [showTambahKegiatan, setShowTambahKegiatan] = useState(false)
  const [kgForm, setKgForm] = useState({ nama:'', vendor:'', tglMulai:'', tglSelesai:'', status:'Terjadwal' })
  const [kegiatanList, setKegiatanList] = useState([
    { id:1, nama:'Technical Meeting dengan Klien',  vendor:'Bagoes',                 tglMulai:'15 Jun 2026', tglSelesai:'15 Jun 2026', status:'Selesai'    },
    { id:2, nama:'Survei Lokasi Venue GBK',          vendor:'Rudi Hartono',           tglMulai:'18 Jun 2026', tglSelesai:'18 Jun 2026', status:'Selesai'    },
    { id:3, nama:'Produksi Materi Promosi',          vendor:'CV. Event Decoration',   tglMulai:'20 Jun 2026', tglSelesai:'25 Jun 2026', status:'Berlangsung' },
    { id:4, nama:'Konfirmasi Sound System',          vendor:'PT. Sound System Pro',   tglMulai:'26 Jun 2026', tglSelesai:'26 Jun 2026', status:'Terjadwal'  },
    { id:5, nama:'Hari H Event',                     vendor:'Tim EFM',                tglMulai:'28 Jun 2026', tglSelesai:'28 Jun 2026', status:'Terjadwal'  },
  ])
  const [kegiatanDraft, setKegiatanDraft] = useState([])

  /* ── Tab 2: Laporan Kunjungan ────────────────────────────────────────────── */
  const [showFormLaporan, setShowFormLaporan] = useState(false)
  const [showPromptAI, setShowPromptAI] = useState(false)
  const [promptCopied, setPromptCopied] = useState(false)
  const [laporanList, setLaporanList] = useState([
    { id:1, tgl:'18 Jun 2026', pic:'Rudi Hartono', kondisi:'Baik',  jmlAlat:'Venue siap' },
    { id:2, tgl:'25 Jun 2026', pic:'Rudi Hartono', kondisi:'Baik',  jmlAlat:'Gladi bersih' },
  ])
  const initAlatRows = [
    { id:1, nama:'Stage / Panggung',      kondisi:'Baik',              rekomendasi:'-',                   vendor:'CV. Event Decoration'  },
    { id:2, nama:'Sound System',          kondisi:'Baik',              rekomendasi:'-',                   vendor:'PT. Sound System Pro'  },
    { id:3, nama:'Tenda & Shelter',       kondisi:'Baik',              rekomendasi:'-',                   vendor:'CV. Event Decoration'  },
    { id:4, nama:'Toilet Portable',       kondisi:'Perlu Pengecekan',  rekomendasi:'Tambah unit toilet',  vendor:'Vendor Toilet'         },
    { id:5, nama:'Meja & Kursi',          kondisi:'Baik',              rekomendasi:'-',                   vendor:'CV. Event Decoration'  },
    { id:6, nama:'Peralatan Fitness',     kondisi:'Baik',              rekomendasi:'-',                   vendor:'PT. Gym Equipment'     },
    { id:7, nama:'Parkir & Akses',        kondisi:'Baik',              rekomendasi:'-',                   vendor:'-'                     },
    { id:8, nama:'Listrik & Genset',      kondisi:'Baik',              rekomendasi:'-',                   vendor:'CV. Electric Pro'      },
  ]
  const [lForm, setLForm] = useState({ tgl:'', pic:'', kondisiUmum:'Baik', catatan:'', alat: initAlatRows, foto:[] })

  /* ── Tab 2: Laporan Insiden ──────────────────────────────────────────────── */
  const [showFormInsiden, setShowFormInsiden] = useState(false)
  const [insidenList, setInsidenList] = useState([
    { id:1, tglJam:'25 Jun 2026 14:00', kategori:'Koordinasi',  deskripsi:'Perubahan rundown dari klien H-3', status:'Selesai' },
  ])
  const [iForm, setIForm] = useState({ tgl:'', jam:'', kategori:'Kerusakan Alat', lokasi:'', dilaporkan:'', statusAwal:'Baru', deskripsi:'', tindakan:'', foto:[] })

  /* ── Tab 2: Log Aktivitas ────────────────────────────────────────────────── */
  const LOG_DATA = [
    { dot:'#F97316', teks:'Invoice INV-EV-26-0001 dikirim ke Yayasan Kanker Indonesia', waktu:'20 Jun 2026 08:00' },
    { dot:'#10B981', teks:'Laporan kunjungan venue GBK disimpan — Rudi Hartono',       waktu:'18 Jun 2026 15:30' },
    { dot:'#3B82F6', teks:'Status Contract diubah ke Signed',                          waktu:'10 Jun 2026 10:00' },
    { dot:'#10B981', teks:'Contract EV-26-0003 diupload: contract-yayasan-kanker-final.pdf', waktu:'10 Jun 2026 09:45' },
    { dot:'#F97316', teks:'DP 50% dikonfirmasi Lunas — Rp 42.500.000',                waktu:'5 Jun 2026 09:00' },
    { dot:'#3B82F6', teks:'Status Quotation diubah ke Signed',                         waktu:'2 Jun 2026 14:00' },
    { dot:'#10B981', teks:'Order #EV-26-0003 dibuat oleh Admin EFM',                   waktu:'1 Jun 2026 08:00' },
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
    { id: "MTR-E01", nama: "PT. Sound System Pro",    tipe: "Vendor",        peran: "Sound System & Stage",     wa: "0211234567",   status: "Aktif" },
    { id: "MTR-E02", nama: "CV. Event Decoration",    tipe: "Vendor",        peran: "Dekorasi, Tenda & Backdrop",wa: "082198765432", status: "Aktif" },
    { id: "MTR-E03", nama: "Creative Visual Studio",  tipe: "Vendor",        peran: "Foto & Videografi",        wa: "081234509876", status: "Aktif" },
    { id: "MTR-E04", nama: "Andi Presenter Pro",      tipe: "Mitra Pelatih", peran: "MC & Host Event",          wa: "087812345678", status: "Aktif" },
  ]

  const dummyKonsultasiRef = [
    {
      id: "KNS-26-0001",
      leadId: "LE-0001",
      namaEvent: "Fun Run Jakarta 2026",
      tanggal: "2026-05-20",
      lokasi: "GBK, Jakarta Selatan",
      jumlahPeserta: "2.000",
      peranEFM: "Main Organizer",
      programKegiatan: ["Fun Run / Walk", "Warm-up & Stretching", "Cool-down"],
    },
    {
      id: "KNS-26-0003",
      leadId: "LE-0003",
      namaEvent: "Yoga Festival Senayan 2026",
      tanggal: "2026-06-10",
      lokasi: "Lapangan Senayan, Jakarta Pusat",
      jumlahPeserta: "500",
      peranEFM: "Co-Organizer",
      programKegiatan: ["Yoga Outdoor", "Pilates", "Zumba"],
    },
  ]
  const konsultasiTerkait = order ? dummyKonsultasiRef.find((k) => k.id === order.konsultasiId) : null

  const [timLapangan, setTimLapangan] = useState([
    { id: "TL-001", sourceId: "PIC-001", sourceType: "PIC",   nama: "Rudi Hartono",       tipe: "PIC EFM", peran: "Event Coordinator",       wa: "081234567891", status: "Aktif" },
    { id: "TL-002", sourceId: "PIC-002", sourceType: "PIC",   nama: "Sari Dewi",          tipe: "PIC EFM", peran: "Fitness Stage Host",      wa: "081234567892", status: "Aktif" },
    { id: "TL-003", sourceId: "MTR-001", sourceType: "Mitra", nama: "PT. Sound System Pro", tipe: "Vendor", peran: "Sound System & Stage",   wa: "0211234567",   status: "Aktif" },
  ])

  const [jadwalOperasional, setJadwalOperasional] = useState([
    { id: "JDW-001", tanggal: "2026-06-15", jam: "10:00", kegiatan: "Technical Meeting & Briefing Tim",  pic: "Rudi Hartono", status: "Selesai"      },
    { id: "JDW-002", tanggal: "2026-06-27", jam: "07:00", kegiatan: "Gladi Bersih Event",               pic: "Rudi Hartono", status: "Dijadwalkan"  },
    { id: "JDW-003", tanggal: "2026-06-28", jam: "05:30", kegiatan: "Persiapan Event Hari H",           pic: "Sari Dewi",    status: "Dijadwalkan"  },
  ])

  const [laporanKunjungan, setLaporanKunjungan] = useState([
    { id: "LK-001", tanggal: "2026-06-18", picKunjungan: "Rudi Hartono", kondisiUmum: "Baik", temuan: "Venue GBK siap digunakan. Koordinasi dengan pengelola lancar.", foto: null, status: "Selesai" },
  ])

  const [laporanInsiden, setLaporanInsiden] = useState([
    { id: "INS-001", tanggal: "2026-06-25", jenis: "Koordinasi", severity: "Low", pic: "Rudi Hartono", status: "Resolved", deskripsi: "Perubahan minor pada rundown acara dari klien H-3", foto: null, fotoNama: null, logAktivitas: [
      { waktu: "2026-06-25 14:00", catatan: "Insiden dilaporkan oleh Rudi Hartono", tipe: "laporan" }
    ] },
  ])

  const [showTambahTim,     setShowTambahTim]     = useState(false)
  const [showTambahJadwal,  setShowTambahJadwal]  = useState(false)
  const [showTambahLaporan, setShowTambahLaporan] = useState(false)
  const [showTambahInsiden, setShowTambahInsiden] = useState(false)
  const [newJadwal,        setNewJadwal]        = useState({ tanggal: '', jam: '', kegiatan: '', pic: '', status: 'Dijadwalkan' })
  const [newLaporan,       setNewLaporan]       = useState({ tanggal: '', picKunjungan: '', kondisiUmum: 'Baik', temuan: '', status: 'Selesai', foto: null, fotoNama: null })
  const [newInsiden,       setNewInsiden]       = useState({ tanggal: '', jenis: 'Koordinasi', severity: 'Low', pic: '', deskripsi: '', status: 'Open', foto: null, fotoNama: null, logAktivitas: [] })
  const [editingInsiden,   setEditingInsiden]   = useState(null)
  const [editingLaporan,   setEditingLaporan]   = useState(null)
  const fotoInputRef = useRef(null)
  const fotoInsidenRef = useRef(null)
  const fotoLaporanBaruRef = useRef(null)
  const fotoInsidenBaruRef = useRef(null)
  const [previewFoto, setPreviewFoto] = useState(null)
  const [sumberTim,         setSumberTim]         = useState("PIC")
  const [selectedSource,    setSelectedSource]    = useState("")
  const [newTimPeran,       setNewTimPeran]       = useState("")
  const [newTimStatus,      setNewTimStatus]      = useState("Aktif")
  const [logFilter3,        setLogFilter3]        = useState("semua")

  /* ── 404 ─────────────────────────────────────────────────────────────────── */
  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400 text-sm mb-3">Order "{id}" tidak ditemukan.</p>
        <Link to="/event/orders" className="text-[#E05945] text-sm font-medium hover:underline">
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
  // konsultasiTerkait defined above in dummyKonsultasiRef lookup

  /* ── Edit handlers ───────────────────────────────────────────────────────── */
  function startEdit(section) {
    if (editingSection && editingSection !== section) return
    setEditingSection(section)
    if (section === 'infoDeal') {
      setInfoDraft({ ...infoDeal })
      setItemsDraft(lineItems.map(li => ({ ...li })))
    }
    if (section === 'quotation') {
      setQuotationDraft({
        ...quotationData,
        items: quotationData.items.map(it => ({ ...it })),
        managementFee: { ...quotationData.managementFee },
        pajakList: quotationData.pajakList.map(p => ({ ...p })),
      })
    }
    if (section === 'paymentTerms') {
      setPayTermsDraft(payTerms)
      setPayRowsDraft(payRows.map(r => ({ ...r })))
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

  function savePaymentTerms() {
    setPayTerms(payTermsDraft)
    setPayRows([...payRowsDraft])
    setEditingSection(null)
  }

  function saveProfitSharing() {
    setPsPersen(psPersenDraft)
    setPsRows([...psRowsDraft])
    setEditingSection(null)
  }

  function regenPayRows(terms) {
    const rows = generatePayRows(order.tanggalMulai, order.tanggalSelesai, terms, subtotal || order.nilaiNum)
    return rows.map((r, i) => ({ ...r, status: 'Belum Ditagih', tglBayar: '' }))
  }

  function updateItemDraft(idx, field, val) {
    setItemsDraft(p => p.map((li, i) => i === idx ? { ...li, [field]: val } : li))
  }
  function updatePayRowDraft(idx, field, val) {
    setPayRowsDraft(p => p.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }
  function updatePsRowDraft(idx, field, val) {
    setPsRowsDraft(p => p.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }
  function updateQItemDraft(idx, field, val) {
    setQuotationDraft(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) }))
  }

  function handleSimpanOrderBaru() {
    const newId = 'EO-00' + (dummyEventOrders.length + 1)
    navigate('/event/orders/' + newId)
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
    nomorQuotation: quotationData.nomorQuotation || 'QUO/EFM/EVENT/2026/001',
    totalPenawaran: qCalc.total            || 13_320_000,
    nomorLOI: (() => {
      const LOI_MAP = { 'EV-26-0001': 'LOI-EFM-EVENT-26-0001', 'EV-26-0002': 'LOI-EFM-EVENT-26-0002', 'EV-26-0003': 'LOI-EFM-EVENT-26-0003' }
      return LOI_MAP[id] || `LOI-EFM-EVENT-26-${(id || '').slice(-4)}`
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
      `CV. Bugar Nusantara Jaya (Essential Fitness Management / EFM) menyampaikan Letter of Intent untuk kerjasama penyelenggaraan event olahraga & kebugaran bersama ${loiData.namaKlien}.`,
      '',
      `Nama Event      : ${loiData.programLayanan}`,
      `Tanggal Event   : ${fmtDate(loiData.tanggalMulai)} s/d ${fmtDate(loiData.tanggalSelesai)}`,
      `Estimasi Nilai  : ${fmtRp(loiData.subtotal)}`,
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
    { id: 1, waktu: "2026-07-20 11:00", kategori: "kunjungan", nomorLaporan: "LK-001", teks: "Laporan kunjungan LK-001 dibuat oleh Rudi Hartono — Kondisi: Baik" },
    { id: 2, waktu: "2026-07-15 09:00", kategori: "tim",       nomorLaporan: null,     teks: "CV. Race Management Pro ditambahkan sebagai Vendor Race Organizer" },
    { id: 3, waktu: "2026-07-15 09:05", kategori: "tim",       nomorLaporan: null,     teks: "PT. Sound & Stage Indonesia ditambahkan sebagai Vendor Sound System" },
    { id: 4, waktu: "2026-07-01 14:00", kategori: "jadwal",    nomorLaporan: null,     teks: "Jadwal Technical Meeting ditambahkan: 10 Agustus 2026" },
    { id: 5, waktu: "2026-06-25 14:00", kategori: "insiden",   nomorLaporan: "INS-001", teks: "Insiden INS-001 dilaporkan: Koordinasi — Perubahan rundown dari klien H-3" },
  ])

  /* ── Render ──────────────────────────────────────────────────────────────── */
  const tipeLabel = order.jenis
  const TIPE_CLS_MAP = {
    Corporate: 'bg-[#1E1C43] text-white',
    Foundation: 'bg-orange-500 text-white',
    Government: 'bg-green-600 text-white',
    Brand: 'bg-purple-600 text-white',
    Community: 'bg-blue-500 text-white',
    Private: 'bg-pink-500 text-white',
    Individual: 'bg-gray-400 text-white',
  }
  const tipeCls = TIPE_CLS_MAP[order.jenis] ?? 'bg-blue-500 text-white'

  return (
    <div className="bg-[#F5F5F7] min-h-screen">
      <div className="px-6 py-6">

      {/* Banner: new order from survei */}
      {isNew && fromState?.fromKonsultasi && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-700 flex items-center gap-2">
            <span>📋</span>
            Order baru dari Konsultasi <span className="font-semibold">{fromState?.konsultasiId}</span> — Data klien sudah pre-filled
          </p>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">

        {/* Baris 1: Breadcrumb + Kembali */}
        <div className="flex items-center justify-between mb-5">
          <nav className="flex items-center gap-1 text-xs text-gray-400">
            <button onClick={() => navigate('/event/orders')} className="hover:text-[#1E1C43] transition-colors">Event Management</button>
            <ChevronRight size={12} className="text-gray-300" />
            <button onClick={() => navigate('/event/orders')} className="hover:text-[#1E1C43] transition-colors">Orders</button>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-[#1E1C43] font-medium">{isNew ? 'Order Baru' : (order.namaEvent || order.namaKlien)}</span>
          </nav>
          <button
            onClick={() => navigate('/event/orders')}
            className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={12} /> Kembali
          </button>
        </div>

        {/* Baris 2: Info + Total */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                {order.id}
              </span>
              <Badge cls={tipeCls}>{tipeLabel}</Badge>
              <Badge cls={STATUS_CLS[order.status] ?? 'bg-gray-100 text-gray-600'}>
                ● {order.status}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-[#1E1C43] leading-tight">{isNew ? 'Order Baru' : (order.namaEvent || order.namaKlien)}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {order.namaKlien} &nbsp;·&nbsp; {order.tipeKlien || order.jenis}
            </p>
            {/* Horizontal stepper */}
            <div className="flex items-center gap-1 mt-3 flex-wrap">
              {TAHAPAN_STEPS.map((step, i) => {
                const orderIdx   = TAHAPAN_ORDER[order.tahapan] ?? 0
                const stepIdx    = TAHAPAN_ORDER[step] ?? i
                const isActive   = stepIdx === orderIdx
                const isDone     = stepIdx < orderIdx
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
          <div className="text-right shrink-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Nilai Kontrak</p>
            <p className="text-2xl font-bold text-[#1E1C43]">{fmtRp(subtotal)}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">PIC: {order.pic}</p>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 mb-5">
        {[
          { key: 'keuangan',    label: 'Kontrak & Keuangan'   },
          { key: 'dokumen',     label: 'Dokumen Kerjasama'     },
          { key: 'operasional', label: 'Operasional Lapangan'  },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-[#1E1C43] text-[#1E1C43]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
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

          {/* ── Section 1: Info Deal + Rincian Layanan ───────────────────── */}
          <SectionCard
            title="Info Deal & Rincian Layanan"
            editing={editingSection === 'infoDeal'}
            onEdit={() => startEdit('infoDeal')}
            onSave={saveInfoDeal}
            onCancel={cancelEdit}
          >
            {editingSection === 'infoDeal' ? (
              /* ── EDIT MODE ── */
              <div className="space-y-5">

                {/* Sub-section: Data Klien (read-only) */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs font-semibold text-gray-700">Data Klien</p>
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                      Read-only · Edit dari Leads
                    </span>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg px-3.5 py-2.5 mb-3 flex items-center gap-2">
                    <span className="text-xs text-amber-800">Data klien dikelola di halaman Leads.</span>
                    <Link to="/event/leads" className="text-xs font-semibold text-[#E05945] hover:underline">→ Buka Leads</Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Nama Klien',    value: infoDraft.namaKlien },
                      { label: 'Jenis',          value: infoDraft.jenis },
                      { label: 'Contact Person', value: infoDraft.contactPerson },
                      { label: 'Telepon',        value: infoDraft.telepon },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</label>
                        <div className="h-9 px-3 flex items-center rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-600 select-none">
                          {value || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-section: Detail Order (editable) */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-3">Detail Order</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Program</label>
                      <input
                        value={infoDraft.program || ''}
                        onChange={e => setInfoDraft(p => ({ ...p, program: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tanggal Mulai</label>
                      <input
                        type="date"
                        value={infoDraft.tanggalMulai || ''}
                        onChange={e => setInfoDraft(p => ({ ...p, tanggalMulai: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tanggal Selesai</label>
                      <input
                        type="date"
                        value={infoDraft.tanggalSelesai || ''}
                        onChange={e => setInfoDraft(p => ({ ...p, tanggalSelesai: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">PIC Sales</label>
                      <input
                        value={infoDraft.pic || ''}
                        onChange={e => setInfoDraft(p => ({ ...p, pic: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Nilai Kontrak (dari Quotation)</label>
                      <div className="h-9 px-3 flex items-center rounded-lg bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-500 select-none">
                        {fmtRp(qCalc.total)}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Catatan</label>
                      <textarea
                        value={infoDraft.catatan || ''}
                        onChange={e => setInfoDraft(p => ({ ...p, catatan: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-section: Rincian Layanan (editable) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-700">Rincian Layanan</p>
                    <button
                      onClick={() => setItemsDraft(p => [...p, { id: Date.now(), namaItem: '', satuan: 'Bulan', jumlah: 1, keterangan: '' }])}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#1E1C43] hover:text-[#E05945] transition-colors"
                    >
                      <Plus size={11} /> Tambah Item
                    </button>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        {['Item Layanan','Satuan','Jumlah','Keterangan',''].map(h => (
                          <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {itemsDraft.map((li, i) => (
                        <tr key={li.id} className="border-b border-gray-100">
                          <td className="px-3 py-2">
                            <input value={li.namaItem} onChange={e => updateItemDraft(i, 'namaItem', e.target.value)}
                              className="w-full h-8 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                          </td>
                          <td className="px-3 py-2 w-24">
                            <input value={li.satuan} onChange={e => updateItemDraft(i, 'satuan', e.target.value)}
                              className="w-full h-8 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                          </td>
                          <td className="px-3 py-2 w-16">
                            <input type="number" min={1} value={li.jumlah} onChange={e => updateItemDraft(i, 'jumlah', Number(e.target.value))}
                              className="w-full h-8 px-2 rounded border border-gray-200 text-xs text-center outline-none focus:border-[#1E1C43]" />
                          </td>
                          <td className="px-3 py-2">
                            <input value={li.keterangan || ''} onChange={e => updateItemDraft(i, 'keterangan', e.target.value)}
                              className="w-full h-8 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                          </td>
                          <td className="px-3 py-2 w-8">
                            <button onClick={() => setItemsDraft(p => p.filter((_, j) => j !== i))}
                              className="text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* ── VIEW MODE ── */
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {[
                    ['Nama Klien',    order.namaKlien],
                    ['Tipe Klien',    order.tipeKlien || order.jenis],
                    ['Nama Event',    order.namaEvent],
                    ['Jenis Event',   order.jenisEvent],
                    ['Peran EFM',     order.peranEFM],
                    ['Lokasi Event',  order.lokasiEvent],
                    ['Tanggal Event', fmtDate(order.tglEvent)],
                    ['PIC Sales',     infoDeal.pic],
                    ['Contact Person',infoDeal.contactPerson],
                    ['Telepon',       infoDeal.telepon],
                    ['Tgl Mulai Kontrak', fmtDate(infoDeal.tanggalMulai)],
                    ['Tgl Selesai Kontrak',fmtDate(infoDeal.tanggalSelesai)],
                    ['Nilai Kontrak (dari Quotation)', fmtRp(qCalc.total)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{k}</p>
                      <p className={`text-sm text-gray-800 font-medium ${k.startsWith('Nilai Kontrak') ? 'text-[#1E1C43] text-base' : ''}`}>{v || '—'}</p>
                    </div>
                  ))}
                  {infoDeal.catatan && (
                    <div className="col-span-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Catatan</p>
                      <p className="text-sm text-gray-700 italic">{infoDeal.catatan}</p>
                    </div>
                  )}
                </div>

                {/* Line items read */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Rincian Layanan</p>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        {['No','Item Layanan','Satuan','Jumlah','Keterangan'].map(h => (
                          <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((li, i) => (
                        <tr key={li.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5">{i + 1}</td>
                          <td className="text-xs font-medium text-gray-800 px-3 py-2.5">{li.namaItem}</td>
                          <td className="text-xs text-gray-600 px-3 py-2.5">{li.satuan}</td>
                          <td className="text-xs text-gray-600 px-3 py-2.5 text-center">{li.jumlah}</td>
                          <td className="text-xs text-gray-600 px-3 py-2.5">{li.keterangan || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── Section Quotation ─────────────────────────────────────────── */}
          {(() => {
            const isEditing = editingSection === 'quotation'
            const qd = isEditing ? quotationDraft : quotationData
            const calc = isEditing ? qCalcDraft : qCalc
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
                <div className="px-5 py-3.5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-[#1E1C43]">Quotation</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Penawaran harga kepada klien — berdasarkan rincian layanan di atas</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge cls={QUOTATION_STATUS_CLS[quotationData.status] ?? 'bg-gray-100 text-gray-500'}>
                        {quotationData.status}
                      </Badge>
                      {isEditing ? (
                        <>
                          <button onClick={saveQuotation}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90">
                            <Save size={12} /> Simpan
                          </button>
                          <button onClick={cancelEdit}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                            <X size={12} /> Batal
                          </button>
                        </>
                      ) : (
                        <button onClick={() => startEdit('quotation')}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors">
                          <Edit2 size={12} /> Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  {/* Info baris */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {[
                      ['No. Quotation', qd.nomorQuotation],
                      ['Tanggal', isEditing
                        ? <input key="tgl" type="date" value={qd.tanggal} onChange={e => setQuotationDraft(p => ({...p, tanggal: e.target.value}))}
                            className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43] w-full" />
                        : fmtDate(qd.tanggal)],
                      ['Berlaku Sampai', isEditing
                        ? <input key="bls" type="date" value={qd.berlakuSampai} onChange={e => setQuotationDraft(p => ({...p, berlakuSampai: e.target.value}))}
                            className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43] w-full" />
                        : fmtDate(qd.berlakuSampai)],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{k}</p>
                        {typeof v === 'string' ? <p className="text-xs font-medium text-gray-700">{v}</p> : v}
                      </div>
                    ))}
                  </div>

                  {/* Tabel items */}
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          {['No','Item Layanan','Satuan','Jumlah','Rate/Unit','Total'].map(h => (
                            <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {qd.items.map((it, i) => (
                          <tr key={it.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5">{i + 1}</td>
                            <td className="text-xs font-medium text-gray-800 px-3 py-2.5">{it.item}</td>
                            <td className="text-xs text-gray-600 px-3 py-2.5">{it.satuan}</td>
                            <td className="text-xs text-gray-600 px-3 py-2.5 text-center">{it.jumlah}</td>
                            <td className="px-3 py-2.5">
                              {isEditing ? (
                                <input type="number" min={0} value={it.rate}
                                  onChange={e => updateQItemDraft(i, 'rate', Number(e.target.value))}
                                  className="w-32 h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                              ) : (
                                <span className="text-xs text-gray-600">{fmtRp(it.rate)}</span>
                              )}
                            </td>
                            <td className="text-xs font-semibold text-gray-800 px-3 py-2.5 whitespace-nowrap">
                              {fmtRp(it.jumlah * it.rate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Kalkulasi */}
                  <div className="flex justify-end">
                    <div className="w-80 space-y-2">
                      {/* Subtotal */}
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">{fmtRp(calc.sub)}</span>
                      </div>

                      {/* Management Fee */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ToggleSwitch
                            checked={qd.managementFee.aktif}
                            onChange={() => {
                              if (isEditing) setQuotationDraft(p => ({...p, managementFee: {...p.managementFee, aktif: !p.managementFee.aktif}}))
                              else setQuotationData(p => ({...p, managementFee: {...p.managementFee, aktif: !p.managementFee.aktif}}))
                            }}
                          />
                          <span className="text-xs text-gray-600">Management Fee</span>
                          {qd.managementFee.aktif && (
                            isEditing ? (
                              <div className="flex items-center gap-0.5">
                                <input type="number" min={0} max={100} value={qd.managementFee.persen}
                                  onChange={e => setQuotationDraft(p => ({...p, managementFee: {...p.managementFee, persen: Number(e.target.value)}}))}
                                  className="w-12 h-6 px-1 rounded border border-gray-200 text-xs text-center outline-none focus:border-[#1E1C43]" />
                                <span className="text-xs text-gray-500">%</span>
                              </div>
                            ) : (
                              <Badge cls="bg-gray-100 text-gray-600">{qd.managementFee.persen}%</Badge>
                            )
                          )}
                        </div>
                        {qd.managementFee.aktif && (
                          <span className="text-xs font-medium text-gray-700">
                            {fmtRp(Math.round(calc.sub * qd.managementFee.persen / 100))}
                          </span>
                        )}
                      </div>

                      {qd.managementFee.aktif && (
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Total stlh Mgmt Fee</span>
                          <span className="font-medium">{fmtRp(calc.after)}</span>
                        </div>
                      )}

                      {/* Pajak */}
                      <div className="space-y-1.5 pt-1">
                        {qd.pajakList.map((pj, pi) => (
                          <div key={pj.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" checked={pj.aktif}
                                onChange={e => {
                                  const toggle = (p) => ({...p, pajakList: p.pajakList.map((x,xi) => xi===pi ? {...x, aktif:e.target.checked} : x)})
                                  isEditing ? setQuotationDraft(toggle) : setQuotationData(toggle)
                                }}
                                className="accent-[#1E1C43] w-3 h-3" />
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <input value={pj.nama} onChange={e => setQuotationDraft(p => ({...p, pajakList: p.pajakList.map((x,xi) => xi===pi ? {...x, nama:e.target.value} : x)}))}
                                    className="w-20 h-6 px-1 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                                  <input type="number" value={pj.persen} onChange={e => setQuotationDraft(p => ({...p, pajakList: p.pajakList.map((x,xi) => xi===pi ? {...x, persen:Number(e.target.value)} : x)}))}
                                    className="w-12 h-6 px-1 rounded border border-gray-200 text-xs text-center outline-none focus:border-[#1E1C43]" />
                                  <span className="text-xs text-gray-400">%</span>
                                  <button onClick={() => setQuotationDraft(p => ({...p, pajakList: p.pajakList.filter((_,xi) => xi!==pi)}))}
                                    className="text-gray-300 hover:text-red-500"><Trash2 size={11} /></button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-600">{pj.nama} {pj.persen}%</span>
                              )}
                            </div>
                            <span className={`text-xs font-medium ${pj.aktif ? 'text-gray-700' : 'text-gray-400'}`}>
                              {fmtRp(Math.round(calc.after * pj.persen / 100))}
                            </span>
                          </div>
                        ))}
                        {isEditing && (
                          <button
                            onClick={() => setQuotationDraft(p => ({...p, pajakList: [...p.pajakList, {id:Date.now(), nama:'PPh', persen:2.5, aktif:true}]}))}
                            className="flex items-center gap-1 text-[11px] font-semibold text-[#1E1C43] hover:text-[#E05945] transition-colors"
                          >
                            <Plus size={11} /> Tambah Pajak
                          </button>
                        )}
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-center pt-2 border-t-2 border-gray-200">
                        <span className="text-sm font-bold text-gray-700">TOTAL PENAWARAN</span>
                        <span className="text-base font-bold text-[#E05945]">{fmtRp(calc.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Catatan / Syarat */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Catatan & Syarat</p>
                    {isEditing ? (
                      <textarea value={qd.catatanSyarat} onChange={e => setQuotationDraft(p => ({...p, catatanSyarat:e.target.value}))}
                        rows={2} placeholder="Harga sudah termasuk biaya operasional bulanan..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#1E1C43] resize-none" />
                    ) : (
                      <p className="text-xs text-gray-600">
                        {qd.catatanSyarat || 'Harga sudah termasuk biaya operasional bulanan. Pembayaran dilakukan di awal bulan.'}
                      </p>
                    )}
                  </div>

                  {/* Action row */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Status:</span>
                      <select
                        value={quotationData.status}
                        onChange={e => setQuotationData(p => ({...p, status: e.target.value}))}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E1C43]"
                      >
                        {['Draft','Terkirim','Disetujui','Ditolak','Revisi'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button className="inline-flex items-center gap-1.5 border border-[#1E1C43] text-[#1E1C43] text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50">
                        <Eye size={13} /> Preview
                      </button>
                      <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 bg-[#1E1C43] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90">
                        <Download size={13} /> Download PDF
                      </button>
                    </div>
                  </div>

                  {/* Approved banner */}
                  {quotationData.status === 'Disetujui' && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-600" />
                        <p className="text-xs text-green-700 font-medium">Quotation telah disetujui klien</p>
                      </div>
                      <button onClick={() => setActiveTab('dokumen')}
                        className="text-xs text-green-700 font-semibold hover:underline flex items-center gap-1">
                        Lanjut ke Dokumen Kerjasama →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* ── Section 2: Payment Terms & Tracking ──────────────────────── */}
          <SectionCard
            title="Payment Terms & Tracking"
            editing={editingSection === 'paymentTerms'}
            onEdit={() => startEdit('paymentTerms')}
            onSave={savePaymentTerms}
            onCancel={cancelEdit}
          >
            {/* Payment terms selector */}
            <div className="flex items-center gap-3 mb-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Metode Pembayaran</p>
              {editingSection === 'paymentTerms' ? (
                <select
                  value={payTermsDraft}
                  onChange={e => {
                    setPayTermsDraft(e.target.value)
                    if (e.target.value !== 'Custom') setPayRowsDraft(regenPayRows(e.target.value))
                  }}
                  className="h-8 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]"
                >
                  {PAY_TERMS_OPTS.map(t => <option key={t}>{t}</option>)}
                </select>
              ) : (
                <Badge cls="bg-[#1E1C43] text-white">{payTerms}</Badge>
              )}
            </div>

            {/* Note from quotation */}
            <p className="text-[10px] text-gray-400 mb-3">
              Nominal tagihan berdasarkan Total Penawaran Quotation:{' '}
              <span className="font-semibold text-[#1E1C43]">{fmtRp(qCalc.total)}/bulan</span>
            </p>

            {/* Payment table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {['No','Periode','Nominal','Status','Tgl Bayar','Aksi'].map(h => (
                      <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(editingSection === 'paymentTerms' ? payRowsDraft : payRows).map((r, i) => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="text-xs text-gray-400 px-3 py-2.5">{i + 1}</td>
                      <td className="text-xs text-gray-700 px-3 py-2.5 font-medium whitespace-nowrap">{r.periode}</td>
                      <td className="text-xs text-gray-700 px-3 py-2.5 whitespace-nowrap">{fmtRp(r.nominal)}</td>
                      <td className="px-3 py-2.5">
                        {editingSection === 'paymentTerms' ? (
                          <select
                            value={r.status}
                            onChange={e => updatePayRowDraft(i, 'status', e.target.value)}
                            className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]"
                          >
                            {PAY_STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                          </select>
                        ) : (
                          <Badge cls={PAY_STATUS_CLS[r.status] ?? 'bg-gray-100 text-gray-500'}>{r.status}</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {editingSection === 'paymentTerms' ? (
                          <input
                            type="date"
                            value={r.tglBayar}
                            onChange={e => updatePayRowDraft(i, 'tglBayar', e.target.value)}
                            className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]"
                          />
                        ) : (
                          <span className="text-xs text-gray-700">{r.tglBayar || '—'}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {editingSection !== 'paymentTerms' && (
                          <div className="flex items-center gap-1.5 flex-nowrap">
                            {r.status === 'Belum Ditagih' && (
                              <button
                                onClick={() => navigate('/event/invoice', {
                                  state: {
                                    action: 'create',
                                    orderId: id,
                                    namaKlien: order.namaKlien,
                                    jenis: order.jenis,
                                    program: order.program,
                                    periode: r.periode,
                                    nominal: r.nominal,
                                    rincianLayanan: quotationData.items.map(it => ({
                                      item: it.item, satuan: it.satuan, jumlah: it.jumlah,
                                      rate: it.rate, total: it.jumlah * it.rate
                                    }))
                                  }
                                })}
                                className="h-6 px-2.5 rounded text-[10px] font-semibold bg-[#1E1C43] text-white hover:opacity-90 whitespace-nowrap">
                                Buat Invoice
                              </button>
                            )}
                            {(r.status === 'Invoice Terkirim' || r.status === 'Lunas') && (
                              <button
                                onClick={() => navigate('/event/invoice', {
                                  state: {
                                    action: 'view',
                                    orderId: id,
                                    periode: r.periode,
                                    invoiceId: INVOICE_ID_MAP[`${id}|${r.periode}`]
                                  }
                                })}
                                className="h-6 px-2.5 rounded text-[10px] font-semibold border border-blue-300 text-blue-600 hover:bg-blue-50 whitespace-nowrap">
                                Lihat Invoice
                              </button>
                            )}
                            {r.status === 'Lunas' && (
                              <button
                                onClick={() => navigate('/event/receipt', {
                                  state: {
                                    action: 'view',
                                    orderId: id,
                                    periode: r.periode,
                                    receiptId: RECEIPT_ID_MAP[`${id}|${r.periode}`]
                                  }
                                })}
                                className="h-6 px-2.5 rounded text-[10px] font-semibold border border-green-300 text-green-600 hover:bg-green-50 whitespace-nowrap">
                                Lihat Receipt
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* ── Section 3: Profit Sharing ─────────────────────────────────── */}
          <SectionCard
            title="Profit Sharing"
            editing={editingSection === 'profitSharing'}
            onEdit={hasPS ? () => startEdit('profitSharing') : null}
            onSave={saveProfitSharing}
            onCancel={cancelEdit}
          >
            {/* Toggle */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-gray-600 font-medium">Ada Profit Sharing?</span>
              <ToggleSwitch
                checked={hasPS}
                onChange={() => { if (!editingSection) setHasPS(p => !p) }}
              />
              <span className="text-xs text-gray-400">{hasPS ? 'Aktif' : 'Tidak aktif'}</span>
            </div>

            {!hasPS && (
              <p className="text-sm text-gray-400 italic">Kontrak ini tidak menggunakan profit sharing.</p>
            )}

            {hasPS && (
              <>
                {/* % input */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-gray-600">% Hak EFM dari Total Profit Klien</span>
                  {editingSection === 'profitSharing' ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number" min={0} max={100}
                        value={psPersenDraft}
                        onChange={e => {
                          const p = Number(e.target.value)
                          setPsPersenDraft(p)
                          setPsRowsDraft(prev => prev.map(r => ({ ...r, persen: p })))
                        }}
                        className="w-16 h-8 px-2 rounded-lg border border-gray-200 text-sm text-center outline-none focus:border-[#1E1C43]"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  ) : (
                    <Badge cls="bg-purple-100 text-purple-700">{psPersen}%</Badge>
                  )}
                </div>

                {/* PS table */}
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      {['No','Periode','Total Profit Klien','%','Hak EFM','Status','Tgl Terima'].map(h => (
                        <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(editingSection === 'profitSharing' ? psRowsDraft : psRows).map((r, i) => (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="text-xs text-gray-400 px-3 py-2.5">{i + 1}</td>
                        <td className="px-3 py-2.5">
                          {editingSection === 'profitSharing' ? (
                            <input value={r.periode} onChange={e => updatePsRowDraft(i, 'periode', e.target.value)}
                              className="w-28 h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                          ) : (
                            <span className="text-xs text-gray-700 font-medium">{r.periode}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          {editingSection === 'profitSharing' ? (
                            <input type="number" value={r.totalProfit} onChange={e => updatePsRowDraft(i, 'totalProfit', Number(e.target.value))}
                              className="w-36 h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                          ) : (
                            <span className="text-xs text-gray-700">{fmtRp(r.totalProfit)}</span>
                          )}
                        </td>
                        <td className="text-xs text-gray-700 px-3 py-2.5">{r.persen}%</td>
                        <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">
                          {fmtRp(Math.round(r.totalProfit * r.persen / 100))}
                        </td>
                        <td className="px-3 py-2.5">
                          {editingSection === 'profitSharing' ? (
                            <select value={r.status} onChange={e => updatePsRowDraft(i, 'status', e.target.value)}
                              className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]">
                              {['Belum Diterima','Sudah Diterima'].map(s => <option key={s}>{s}</option>)}
                            </select>
                          ) : (
                            <Badge cls={r.status === 'Sudah Diterima' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                              {r.status}
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          {editingSection === 'profitSharing' ? (
                            <input type="date" value={r.tglTerima} onChange={e => updatePsRowDraft(i, 'tglTerima', e.target.value)}
                              className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                          ) : (
                            <span className="text-xs text-gray-700">{r.tglTerima || '—'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {editingSection === 'profitSharing' && (
                  <button
                    onClick={() => setPsRowsDraft(p => [...p, { id: Date.now(), periode: '', totalProfit: 0, persen: psPersenDraft, status: 'Belum Diterima', tglTerima: '' }])}
                    className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#1E1C43] hover:text-[#E05945] transition-colors"
                  >
                    <Plus size={12} /> Tambah Periode
                  </button>
                )}
              </>
            )}
          </SectionCard>

        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2 — Dokumen Kerjasama
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'dokumen' && (() => {
        const getStepStatus = (stepKey) => {
          const levelMap = { 'Quotation & LOI': 1, 'MOU': 2, 'Contract': 3, 'Event Running': 4, 'Aktif': 4, 'Selesai': 5 }
          const stepIdx  = { quotation: 0, loi: 1, mou: 2, contract: 3, active: 4 }
          const cur = levelMap[order?.tahapan] ?? 0
          const lvl = stepIdx[stepKey] ?? 0
          if (cur > lvl) return 'completed'
          if (cur === lvl) return 'current'
          return 'pending'
        }
        return (
        <div className="space-y-4">

          {/* ── Stepper: Pipeline Dokumen ──────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Progress Dokumen Kerjasama</p>
            <div className="flex items-center">
              {[
                { key: 'quotation', label: 'Quotation', icon: '📋' },
                { key: 'loi',       label: 'LOI',       icon: '📝' },
                { key: 'mou',       label: 'MOU',       icon: '🤝' },
                { key: 'contract',  label: 'Kontrak',   icon: '📄' },
                { key: 'active',    label: 'Aktif',     icon: '✅' },
              ].map((step, idx, arr) => {
                const s = getStepStatus(step.key)
                return (
                  <div key={step.key} className="flex items-center flex-1">
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

          {/* ── Section 1: LOI (Letter of Intent) ────────────────────────── */}
          {(() => {
            const DOC_STATUS_OPTS = ['Draft', 'Terkirim', 'Disetujui', 'Ditolak']
            const DOC_STATUS_CLS = {
              Draft:     'bg-gray-100 text-gray-600',
              Terkirim:  'bg-blue-100 text-blue-700',
              Disetujui: 'bg-green-100 text-green-700',
              Ditolak:   'bg-red-100 text-red-600',
            }
            const isEditing = editingDoc === 'loi'
            const doc = isEditing ? qDraft : qDoc
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#1E1C43]">LOI (Letter of Intent)</h3>
                    <Badge cls={DOC_STATUS_CLS[qDoc.status] ?? 'bg-gray-100 text-gray-500'}>{qDoc.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => { setQDoc({ ...qDraft }); setEditingDoc(null) }}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90">
                          <Save size={12} /> Simpan
                        </button>
                        <button onClick={() => setEditingDoc(null)}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                          <X size={12} /> Batal
                        </button>
                      </>
                    ) : (
                      <button onClick={() => { setQDraft({ ...qDoc }); setEditingDoc('loi') }}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors">
                        <Edit2 size={12} /> Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Generate LOI */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Template LOI tersedia</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Auto-filled dari data Info Deal &amp; Quotation</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLOIPreview(true)}
                      className="inline-flex items-center gap-2 bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                      📄 Generate LOI
                    </button>
                  </div>

                  {isEditing ? (
                    /* ── EDIT MODE ── */
                    <div className="space-y-4">
                      {/* Status */}
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Status LOI</label>
                        <select
                          value={qDraft.status || ''}
                          onChange={e => setQDraft(p => ({ ...p, status: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] bg-white"
                        >
                          <option value="">-- Pilih Status --</option>
                          {DOC_STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>

                      {/* Upload LOI Bertanda Tangan */}
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Upload LOI Bertanda Tangan</label>
                        <p className="text-[10px] text-gray-400 mb-2">Upload scan/foto LOI yang sudah ditandatangani oleh klien sebagai bukti persetujuan</p>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-[#1E1C43]/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                              <span className="text-lg">📎</span>
                            </div>
                            <div className="flex-1">
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                  onChange={e => {
                                    const file = e.target.files[0]
                                    if (file) {
                                      setQDraft(prev => ({
                                        ...prev,
                                        signedFile: {
                                          nama: file.name,
                                          tanggal: new Date().toLocaleDateString('id-ID'),
                                          status: 'TTD Klien',
                                        }
                                      }))
                                    }
                                  }}
                                />
                                <span className="text-xs text-[#1E1C43] font-semibold hover:underline cursor-pointer">
                                  Pilih file PDF atau gambar
                                </span>
                              </label>
                              <p className="text-[10px] text-gray-400 mt-0.5">PDF, JPG, PNG · Maks 5MB</p>
                            </div>
                          </div>
                          {qDraft.signedFile && (
                            <div className="mt-3 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600">✅</span>
                                <span className="text-xs text-green-700 font-medium">{qDraft.signedFile.nama}</span>
                              </div>
                              <button
                                onClick={() => setQDraft(prev => ({ ...prev, signedFile: null }))}
                                className="text-gray-400 hover:text-red-400 text-xs"
                              >
                                × Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Riwayat File — read-only di edit mode */}
                      {doc.riwayat && doc.riwayat.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Riwayat File</p>
                          <div className="space-y-1.5">
                            {doc.riwayat.map(r => (
                              <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                <span className="text-xs text-gray-600">{r.nama}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-gray-400">{r.tanggal}</span>
                                  <Badge cls={r.status === 'TTD Klien' ? 'bg-green-100 text-green-700' : (DOC_STATUS_CLS[r.status] ?? 'bg-gray-100 text-gray-500')}>{r.status}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ── VIEW MODE ── */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Status</p>
                          <Badge cls={DOC_STATUS_CLS[doc.status] ?? 'bg-gray-100 text-gray-500'}>{doc.status || '—'}</Badge>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">LOI Bertanda Tangan</p>
                          {doc.signedFile ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-green-600 font-semibold">✅ Sudah diupload</span>
                              <span className="text-[10px] text-gray-400">{doc.signedFile.tanggal}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Belum ada</span>
                          )}
                        </div>
                      </div>

                      {doc.riwayat && doc.riwayat.length > 0 && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Riwayat File</p>
                          <div className="space-y-1.5">
                            {doc.riwayat.map(r => (
                              <div key={r.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                                <span className="text-xs font-medium text-gray-700 flex-1">{r.nama}</span>
                                <span className="text-[10px] text-gray-400">{r.tanggal}</span>
                                <Badge cls={r.status === 'TTD Klien' ? 'bg-green-100 text-green-700' : (DOC_STATUS_CLS[r.status] ?? 'bg-gray-100 text-gray-500')}>{r.status}</Badge>
                                <button className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-[#1E1C43] transition-colors"><Download size={11} /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* ── Section 2: MOU ────────────────────────────────────────────── */}
          {(() => {
            const DOC_STATUS_OPTS = ['Drafting','On Review','Revision','Signed']
            const DOC_STATUS_CLS = { Signed:'bg-green-100 text-green-700', 'On Review':'bg-blue-100 text-blue-700', Drafting:'bg-gray-100 text-gray-500', Revision:'bg-yellow-100 text-yellow-700' }
            const isEditing = editingDoc === 'mou'
            const doc = isEditing ? mouDraft : mouDoc
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-[#1E1C43] min-w-[60px]">MOU</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Ada MOU?</span>
                      <ToggleSwitch
                        checked={adaMOU}
                        onChange={val => setAdaMOU(val)}
                      />
                    </div>
                    {adaMOU && <Badge cls={DOC_STATUS_CLS[mouDoc.status] ?? 'bg-gray-100 text-gray-500'}>{mouDoc.status}</Badge>}
                  </div>
                  {adaMOU && (
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={() => { setMouDoc({ ...mouDraft }); setEditingDoc(null) }}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90">
                            <Save size={12} /> Simpan
                          </button>
                          <button onClick={() => setEditingDoc(null)}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                            <X size={12} /> Batal
                          </button>
                        </>
                      ) : (
                        <button onClick={() => { setMouDraft({ ...mouDoc }); setEditingDoc('mou') }}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors">
                          <Edit2 size={12} /> Edit
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {adaMOU ? (
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Status</span>
                      {isEditing ? (
                        <select value={mouDraft.status} onChange={e => setMouDraft(p => ({ ...p, status: e.target.value }))}
                          className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]">
                          {DOC_STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      ) : (
                        <Badge cls={DOC_STATUS_CLS[doc.status] ?? 'bg-gray-100 text-gray-500'}>{doc.status}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Google Docs</span>
                      {isEditing ? (
                        <input value={mouDraft.gdocsUrl} onChange={e => setMouDraft(p => ({ ...p, gdocsUrl: e.target.value }))}
                          placeholder="https://docs.google.com/..."
                          className="flex-1 h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                      ) : doc.gdocsUrl ? (
                        <a href={doc.gdocsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                          Buka Google Docs <ExternalLink size={11} />
                        </a>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </div>
                    {isEditing && (
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Upload File</span>
                        <input type="file" accept=".pdf" className="text-xs text-gray-600" />
                        <span className="text-[10px] text-gray-400">PDF, maks 2MB</span>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Riwayat File</p>
                      {doc.riwayat.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Belum ada file diupload.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {doc.riwayat.map(r => (
                            <div key={r.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-xs font-medium text-gray-700 flex-1">{r.nama}</span>
                              <span className="text-[10px] text-gray-400">{r.tgl}</span>
                              <Badge cls={DOC_STATUS_CLS[r.status] ?? 'bg-gray-100 text-gray-500'}>{r.status}</Badge>
                              <button className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-[#1E1C43] transition-colors"><Download size={11} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })()}

          {/* ── Section 3: Contract ───────────────────────────────────────── */}
          {(() => {
            const DOC_STATUS_OPTS = ['Drafting','On Review','Revision','Signed']
            const DOC_STATUS_CLS = { Signed:'bg-green-100 text-green-700', 'On Review':'bg-blue-100 text-blue-700', Drafting:'bg-gray-100 text-gray-500', Revision:'bg-yellow-100 text-yellow-700' }
            const isEditing = editingDoc === 'contract'
            const doc = isEditing ? cDraft : cDoc
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#1E1C43]">Contract</h3>
                    <Badge cls={DOC_STATUS_CLS[cDoc.status] ?? 'bg-gray-100 text-gray-500'}>{cDoc.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => { setCDoc({ ...cDraft }); setEditingDoc(null) }}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90">
                          <Save size={12} /> Simpan
                        </button>
                        <button onClick={() => setEditingDoc(null)}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                          <X size={12} /> Batal
                        </button>
                      </>
                    ) : (
                      <button onClick={() => { setCDraft({ ...cDoc }); setEditingDoc('contract') }}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors">
                        <Edit2 size={12} /> Edit
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {cDoc.status === 'Signed' && !isEditing && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                      <p className="text-xs text-green-700 font-medium">Contract telah ditandatangani oleh kedua belah pihak</p>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Status</span>
                    {isEditing ? (
                      <select value={cDraft.status} onChange={e => setCDraft(p => ({ ...p, status: e.target.value }))}
                        className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]">
                        {DOC_STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    ) : (
                      <Badge cls={DOC_STATUS_CLS[doc.status] ?? 'bg-gray-100 text-gray-500'}>{doc.status}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Google Docs</span>
                    {isEditing ? (
                      <input value={cDraft.gdocsUrl} onChange={e => setCDraft(p => ({ ...p, gdocsUrl: e.target.value }))}
                        placeholder="https://docs.google.com/..."
                        className="flex-1 h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                    ) : doc.gdocsUrl ? (
                      <a href={doc.gdocsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        Buka Google Docs <ExternalLink size={11} />
                      </a>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Upload File</span>
                      <input type="file" accept=".pdf" className="text-xs text-gray-600" />
                      <span className="text-[10px] text-gray-400">PDF, maks 2MB</span>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Riwayat File</p>
                    {doc.riwayat.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Belum ada file diupload.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {doc.riwayat.map(r => (
                          <div key={r.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-xs font-medium text-gray-700 flex-1">{r.nama}</span>
                            <span className="text-[10px] text-gray-400">{r.tgl}</span>
                            <Badge cls={DOC_STATUS_CLS[r.status] ?? 'bg-gray-100 text-gray-500'}>{r.status}</Badge>
                            <button className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-[#1E1C43] transition-colors"><Download size={11} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}

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
          TAB 3 — Operasional Lapangan
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'operasional' && (
        <div>

          {/* ── SECTION 1: Referensi Konsultasi ── */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <MapPin size={15} className="text-[#1E1C43]" />
                Referensi Konsultasi
                <span className="ml-1 bg-[#1E1C43] text-white text-xs px-2 py-0.5 rounded-full">
                  {konsultasiTerkait ? "Terhubung" : "Belum Ada"}
                </span>
              </h3>
              {konsultasiTerkait && (
                <button
                  onClick={() => navigate(`/event/konsultasi/${order.konsultasiId}`)}
                  className="text-xs text-[#1E1C43] font-medium hover:underline flex items-center gap-1"
                >
                  Lihat Detail Konsultasi <ExternalLink size={12} />
                </button>
              )}
            </div>

            {konsultasiTerkait ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Nama Event</p>
                  <p className="text-sm font-semibold text-gray-800">{konsultasiTerkait.namaEvent}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Tanggal Konsultasi</p>
                  <p className="text-sm font-semibold text-gray-800">{fmtDate(konsultasiTerkait.tanggal)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Lokasi Event</p>
                  <p className="text-sm font-semibold text-gray-800">{konsultasiTerkait.lokasi}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Estimasi Peserta</p>
                  <p className="text-sm font-semibold text-gray-800">{konsultasiTerkait.jumlahPeserta} orang</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Peran EFM</p>
                  <p className="text-sm font-semibold text-[#1E1C43]">{konsultasiTerkait.peranEFM}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-2">Program Kegiatan</p>
                  <div className="flex flex-wrap gap-1">
                    {(konsultasiTerkait.programKegiatan || []).map((p) => (
                      <span key={p} className="bg-[#1E1C43]/10 text-[#1E1C43] text-xs px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <MapPin size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Belum ada konsultasi terkait order ini</p>
                <p className="text-xs mt-1">Konsultasi dapat dibuat dari halaman Leads</p>
              </div>
            )}
          </div>

          {/* ── SECTION 2: Tim Lapangan ── */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Users size={15} className="text-[#1E1C43]" />
                Tim Lapangan
                <span className="ml-1 bg-[#1E1C43] text-white text-xs px-2 py-0.5 rounded-full">{timLapangan.length}</span>
              </h3>
            </div>

            {/* Banner Insiden Aktif */}
            {insidenAktif.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-red-600" />
                  <p className="text-sm font-bold text-red-700">⚠️ Insiden Aktif — Quick Contact Tim</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {timLapangan.map((t) => (
                    <a
                      key={t.id}
                      href={`https://wa.me/${formatWA(t.wa)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 bg-white border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50 transition"
                    >
                      <span className="text-xs font-medium text-gray-800 flex-1">{t.nama}</span>
                      <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">WA</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tabel Tim */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4">Nama</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4">Tipe</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4">Peran</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {timLapangan.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-3 pr-4">
                        <p className="text-xs font-semibold text-gray-800">{t.nama}</p>
                        <p className="text-xs text-gray-400">{t.sourceType === "PIC" ? "PIC Database" : "Mitra Database"}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs bg-[#1E1C43]/10 text-[#1E1C43] px-2 py-0.5 rounded-full">{t.tipe}</span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-700">{t.peran}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === "Aktif" ? "bg-green-100 text-green-700" : t.status === "Standby" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${formatWA(t.wa)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition"
                          >
                            WA
                          </a>
                          <button
                            onClick={() => setTimLapangan(timLapangan.filter((x) => x.id !== t.id))}
                            className="text-red-400 hover:text-red-600 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowTambahTim(true)}
              className="mt-4 w-full border border-dashed border-gray-300 text-gray-500 hover:border-[#1E1C43] hover:text-[#1E1C43] rounded-xl py-2.5 text-xs font-medium transition flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Tambah Anggota Tim
            </button>
          </div>

          {/* ── SECTION 3: Jadwal Kegiatan Operasional ── */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Calendar size={15} className="text-[#1E1C43]" />
                Jadwal Kegiatan Operasional
                <span className="ml-1 bg-[#1E1C43] text-white text-xs px-2 py-0.5 rounded-full">{jadwalOperasional.length}</span>
              </h3>
              <button
                onClick={() => navigate("/event/kalender")}
                className="text-xs text-[#1E1C43] font-medium hover:underline flex items-center gap-1"
              >
                Lihat di Kalender <ExternalLink size={12} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">No</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">Tanggal</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">Jam</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">Kegiatan</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">PIC</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {jadwalOperasional.map((j, idx) => (
                    <tr key={j.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-3 pr-3 text-xs text-gray-400">{idx + 1}</td>
                      <td className="py-3 pr-3 text-xs text-gray-700">{j.tanggal}</td>
                      <td className="py-3 pr-3 text-xs text-gray-700">{j.jam}</td>
                      <td className="py-3 pr-3 text-xs font-medium text-gray-800">{j.kegiatan}</td>
                      <td className="py-3 pr-3 text-xs text-gray-600">{j.pic}</td>
                      <td className="py-3 pr-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusJadwalColor(j.status)}`}>{j.status}</span>
                      </td>
                      <td className="py-3">
                        <button onClick={() => setEditingJadwal({ ...j })} className="text-gray-400 hover:text-[#1E1C43] transition">
                          <Edit2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowTambahJadwal(true)}
              className="mt-4 w-full border border-dashed border-gray-300 text-gray-500 hover:border-[#1E1C43] hover:text-[#1E1C43] rounded-xl py-2.5 text-xs font-medium transition flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Tambah Jadwal
            </button>
          </div>

          {/* ── SECTION 4: Laporan Kunjungan & Kondisi Aset ── */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <ClipboardList size={15} className="text-[#1E1C43]" />
                Laporan Kunjungan & Kondisi Aset
                <span className="ml-1 bg-[#1E1C43] text-white text-xs px-2 py-0.5 rounded-full">{laporanKunjungan.length}</span>
              </h3>
            </div>

            <div className="space-y-3">
              {laporanKunjungan.map((lk) => (
                <div key={lk.id} className="border border-gray-100 rounded-xl p-4 hover:border-[#1E1C43]/30 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-bold text-gray-800">{lk.tanggal} — {lk.picKunjungan}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Kondisi Umum: <span className="text-green-600 font-medium">{lk.kondisiUmum}</span></p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lk.status === "Selesai" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {lk.status}
                    </span>
                  </div>
                  {lk.temuan && (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2.5 mt-2">
                      <p className="text-xs text-yellow-800"><span className="font-semibold">Temuan:</span> {lk.temuan}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    {lk.foto ? (
                      <button
                        onClick={() => setPreviewFoto({ src: lk.foto, nama: lk.fotoNama, dariNomor: lk.id })}
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition">
                        <ImageIcon size={12} />
                        Lihat Foto Dokumentasi
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <ImageIcon size={12} /> Belum ada foto
                      </span>
                    )}
                    <button onClick={() => setEditingLaporan({ ...lk })} className="ml-auto text-xs text-[#1E1C43] font-medium hover:underline flex items-center gap-1">
                      <Edit2 size={11} /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowTambahLaporan(true)}
              className="mt-4 w-full border border-dashed border-gray-300 text-gray-500 hover:border-[#1E1C43] hover:text-[#1E1C43] rounded-xl py-2.5 text-xs font-medium transition flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Buat Laporan Kunjungan
            </button>
          </div>

          {/* ── SECTION 5: Laporan Insiden ── */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle size={15} className="text-[#E05945]" />
                Laporan Insiden
                <span className="ml-1 bg-[#E05945] text-white text-xs px-2 py-0.5 rounded-full">{laporanInsiden.length}</span>
              </h3>
            </div>

            <div className="space-y-3">
              {laporanInsiden.map((ins) => (
                <div key={ins.id} className={`border rounded-xl p-4 ${ins.severity === "Critical" ? "border-red-300 bg-red-50" : ins.severity === "High" ? "border-orange-200 bg-orange-50" : "border-gray-100"}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-bold text-gray-800">{ins.tanggal} — {ins.jenis}</p>
                      <p className="text-xs text-gray-500 mt-0.5">PIC: {ins.pic}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${severityColor(ins.severity)}`}>{ins.severity}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ins.status === "Resolved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{ins.status}</span>
                    </div>
                  </div>
                  {ins.deskripsi && <p className="text-xs text-gray-600 mt-1">{ins.deskripsi}</p>}
                  {ins.foto && (
                    <button
                      onClick={() => setPreviewFoto({ src: ins.foto, nama: ins.fotoNama, dariNomor: ins.id })}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition mt-2">
                      <ImageIcon size={12} />
                      Lihat Foto Bukti
                    </button>
                  )}
                  <div className="flex items-center gap-2 mt-3 justify-end">
                    <button
                      onClick={() => setEditingInsiden({ ...ins })}
                      className="text-xs text-gray-500 hover:text-[#1E1C43] flex items-center gap-1 transition">
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => setLaporanInsiden(laporanInsiden.filter(x => x.id !== ins.id))}
                      className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition">
                      <Trash2 size={12} /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowTambahInsiden(true)}
              className="mt-4 w-full border border-dashed border-gray-300 text-gray-500 hover:border-[#E05945] hover:text-[#E05945] rounded-xl py-2.5 text-xs font-medium transition flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Laporkan Insiden
            </button>
          </div>

          {/* ── SECTION 6: Log Aktivitas Tab 3 ── */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Activity size={15} className="text-[#1E1C43]" />
                Log Aktivitas Operasional
              </h3>
              <div className="flex gap-1.5 flex-wrap">
                {["semua","jadwal","kunjungan","insiden","tim"].map((k) => (
                  <button
                    key={k}
                    onClick={() => setLogFilter3(k)}
                    className={`text-xs px-2.5 py-1 rounded-full capitalize transition ${logFilter3 === k ? "bg-[#1E1C43] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative pl-4">
              {logTab3
                .filter((l) => logFilter3 === "semua" || l.kategori === logFilter3)
                .map((l, idx, arr) => (
                  <div key={l.id} className="relative mb-4 last:mb-0">
                    <div className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-[#1E1C43]" />
                    {idx < arr.length - 1 && (
                      <div className="absolute -left-[13px] top-3 w-px h-full bg-gray-200" />
                    )}
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs text-gray-400">{l.waktu}</p>
                      {l.nomorLaporan && (
                        <span className="text-xs bg-[#1E1C43]/10 text-[#1E1C43] px-1.5 py-0.5 rounded font-mono">
                          {l.nomorLaporan}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700">{l.teks}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded mt-1 inline-block capitalize ${
                      l.kategori === "insiden"   ? "bg-red-50 text-red-600" :
                      l.kategori === "jadwal"    ? "bg-blue-50 text-blue-600" :
                      l.kategori === "kunjungan" ? "bg-yellow-50 text-yellow-700" :
                      l.kategori === "tim"       ? "bg-purple-50 text-purple-600" :
                      "bg-gray-50 text-gray-500"
                    }`}>{l.kategori}</span>
                  </div>
                ))}
            </div>
          </div>

        </div>
      )}

      {/* Footer — sticky dalam scroll, bukan fixed */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] px-6 py-3 mt-4 rounded-b-xl z-10">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {isNew ? (
              infoDeal.namaKlien ? (
                <span><span className="font-medium text-[#1E1C43]">{infoDeal.namaKlien}</span>{' · '}Order baru</span>
              ) : (
                <span className="text-gray-300">Isi data order di atas</span>
              )
            ) : (
              <span>
                <span className="font-medium text-[#1E1C43]">{order.namaKlien}</span>
                {' · '}{order.program}{' · '}
                <span className={
                  order.status === 'Aktif'   ? 'text-green-600 font-medium' :
                  order.status === 'Pending' ? 'text-yellow-600 font-medium' :
                                               'text-gray-500'
                }>
                  {order.status}
                </span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isNew ? (
              <>
                <button onClick={() => navigate('/event/orders')} className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <ArrowLeft size={13} /> Batal
                </button>
                <button onClick={handleSimpanOrderBaru} className="inline-flex items-center gap-2 bg-[#E05945] hover:bg-[#c94a38] text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                  💾 Simpan & Buka Order
                </button>
              </>
            ) : (
              <button onClick={() => navigate('/event/orders')} className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <ArrowLeft size={13} /> Kembali ke Orders
              </button>
            )}
          </div>
        </div>
      </div>

      </div>{/* end px-6 py-6 */}

      {/* ══ MODAL: Laporan Kunjungan ══════════════════════════════════════════ */}
      {showFormLaporan && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4" style={{ background:'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#1E1C43]">Buat Laporan Kunjungan — {order.namaKlien}</h2>
              <button onClick={() => setShowFormLaporan(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Section A */}
              <div>
                <p className="text-xs font-semibold text-[#1E1C43] mb-3">A. Info Kunjungan</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tanggal Kunjungan *</label>
                    <input type="date" value={lForm.tgl} onChange={e => setLForm(p => ({...p, tgl:e.target.value}))} required
                      className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">PIC yang Hadir *</label>
                    <input value={lForm.pic} onChange={e => setLForm(p => ({...p, pic:e.target.value}))} placeholder="Nama PIC"
                      className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Kondisi Umum Fasilitas</label>
                    <div className="flex gap-4">
                      {['Baik','Cukup','Perlu Perhatian'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="kondisiUmum" value={opt} checked={lForm.kondisiUmum === opt}
                            onChange={() => setLForm(p => ({...p, kondisiUmum:opt}))} className="accent-[#1E1C43]" />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Catatan Umum</label>
                    <textarea value={lForm.catatan} onChange={e => setLForm(p => ({...p, catatan:e.target.value}))} rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43] resize-none" />
                  </div>
                </div>
              </div>

              {/* Section B — Checklist Alat */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-[#1E1C43]">B. Kondisi Alat & Fasilitas</p>
                  <button onClick={() => setLForm(p => ({...p, alat:[...p.alat, {id:Date.now(), nama:'', kondisi:'Baik', rekomendasi:'-', vendor:'-'}]}))}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#1E1C43] hover:text-[#E05945] transition-colors">
                    <Plus size={11} /> Tambah Alat
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        {['No','Nama Alat','Kondisi','Rekomendasi','Vendor',''].map(h => (
                          <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lForm.alat.map((a, i) => {
                        const kondisiCls = a.kondisi === 'Baik' ? 'border-green-300 text-green-700' : a.kondisi === 'Perlu Servis Segera' ? 'border-red-300 text-red-700' : 'border-yellow-300 text-yellow-700'
                        return (
                          <tr key={a.id} className="border-b border-gray-100">
                            <td className="text-xs text-gray-400 px-2 py-2">{i+1}</td>
                            <td className="px-2 py-2">
                              <input value={a.nama} onChange={e => setLForm(p => ({...p, alat:p.alat.map((r,j)=>j===i?{...r,nama:e.target.value}:r)}))}
                                className="w-full h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                            </td>
                            <td className="px-2 py-2">
                              <select value={a.kondisi} onChange={e => setLForm(p => ({...p, alat:p.alat.map((r,j)=>j===i?{...r,kondisi:e.target.value}:r)}))}
                                className={`h-7 px-2 rounded border text-xs outline-none ${kondisiCls}`}>
                                {['Baik','Perlu Perhatian','Perlu Servis Segera'].map(s => <option key={s}>{s}</option>)}
                              </select>
                            </td>
                            <td className="px-2 py-2">
                              <input value={a.rekomendasi} onChange={e => setLForm(p => ({...p, alat:p.alat.map((r,j)=>j===i?{...r,rekomendasi:e.target.value}:r)}))}
                                className="w-full h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                            </td>
                            <td className="px-2 py-2">
                              <input value={a.vendor} onChange={e => setLForm(p => ({...p, alat:p.alat.map((r,j)=>j===i?{...r,vendor:e.target.value}:r)}))}
                                className="w-28 h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                            </td>
                            <td className="px-2 py-2">
                              <button onClick={() => setLForm(p => ({...p, alat:p.alat.filter((_,j)=>j!==i)}))}
                                className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section C — Foto */}
              <div>
                <p className="text-xs font-semibold text-[#1E1C43] mb-2">C. Upload Foto (opsional, maks 3 file, 2MB each)</p>
                <input type="file" accept=".jpg,.jpeg,.png" multiple
                  onChange={e => setLForm(p => ({...p, foto: Array.from(e.target.files).slice(0,3)}))}
                  className="text-xs text-gray-600" />
                {lForm.foto.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {lForm.foto.map((f,i) => (
                      <p key={i} className="text-[11px] text-gray-500">📎 {f.name}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Section D — Prompt AI */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setShowPromptAI(p => !p)}
                  className="flex items-center gap-2 text-xs text-[#1E1C43] font-medium w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                  🤖 Salin Prompt untuk Generate Laporan Profesional (Claude AI)
                  <ChevronDown size={14} className={`ml-auto transition-transform ${showPromptAI ? 'rotate-180' : ''}`} />
                </button>
                {showPromptAI && (() => {
                  const promptTemplate = `Kamu adalah konsultan fasilitas dan kebugaran profesional dari Essential Fitness Management (EFM). Berdasarkan data kunjungan berikut, buatkan laporan inspeksi fasilitas profesional dalam Bahasa Indonesia yang komprehensif.

DATA KUNJUNGAN:
Klien: ${order.namaKlien}
Tanggal Kunjungan: ${lForm.tgl || '[belum diisi]'}
PIC yang Hadir: ${lForm.pic || '[belum diisi]'}
Kondisi Umum: ${lForm.kondisiUmum}

KONDISI ALAT:
${lForm.alat.map(a => `- ${a.nama}: ${a.kondisi} — Rekomendasi: ${a.rekomendasi}`).join('\n')}

Catatan: ${lForm.catatan || '-'}

STRUKTUR LAPORAN YANG DIBUTUHKAN:
1. Executive Summary kondisi keseluruhan fasilitas
2. Detail Temuan per Alat/Area
3. Analisa Risiko (tinggi/sedang/rendah per temuan)
4. Rekomendasi Tindakan Prioritas (paling mendesak dulu)
5. Estimasi Dampak jika Tidak Ditangani
6. Kesimpulan & Saran Profesional untuk Manajemen

Format: Profesional, bahasa formal, siap dikirim ke Building Management atau HR Korporat.`
                  return (
                    <div className="bg-gray-50 border-t border-gray-200 p-4">
                      <p className="text-[10px] text-gray-500 mb-2">
                        Salin prompt ini → buka claude.ai → paste → dapatkan laporan profesional lengkap
                      </p>
                      <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs font-mono whitespace-pre-wrap text-gray-700 max-h-48 overflow-y-auto mb-3">
                        {promptTemplate}
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(promptTemplate).then(() => { setPromptCopied(true); setTimeout(() => setPromptCopied(false), 2000) })}
                        className={`flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-semibold transition-colors ${promptCopied ? 'bg-green-600 text-white' : 'bg-[#1E1C43] text-white hover:opacity-90'}`}
                      >
                        {promptCopied ? '✓ Tersalin!' : '📋 Salin Prompt'}
                      </button>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <button onClick={() => window.print()}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-[#1E1C43] text-[#1E1C43] text-xs font-semibold hover:bg-[#1E1C43] hover:text-white transition-colors">
                <Printer size={13} /> Export PDF
              </button>
              <div className="flex gap-2">
                <button onClick={() => setShowFormLaporan(false)}
                  className="h-9 px-4 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button onClick={() => {
                  if (!lForm.tgl || !lForm.pic) return
                  setLaporanList(p => [...p, { id: Date.now(), tgl: lForm.tgl, pic: lForm.pic, kondisi: lForm.kondisiUmum, jmlAlat: `${lForm.alat.length} alat` }])
                  setShowFormLaporan(false)
                  setLForm({ tgl:'', pic:'', kondisiUmum:'Baik', catatan:'', alat: initAlatRows, foto:[] })
                }}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90">
                  💾 Simpan Laporan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Laporan Insiden ════════════════════════════════════════════ */}
      {/* ══ MODAL: LOI Preview ═══════════════════════════════════════════════ */}
      {showLOIPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-[#1E1C43]">Preview LOI</h3>
                <p className="text-[10px] text-gray-400">{loiData.nomorLOI}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLOI}
                  className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50">
                  📋 Salin Teks
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 bg-[#E05945] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[#c94a38]">
                  ⬇️ Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowLOIPreview(false)}
                  className="text-gray-400 hover:text-gray-600 ml-1">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ISI DOKUMEN LOI */}
            <div
              id="loi-print-area"
              className="px-10 py-8 font-['Times_New_Roman',serif] text-gray-900 text-sm leading-relaxed">

              {/* Kop Surat */}
              <div className="text-center mb-6 pb-4 border-b-2 border-[#1E1C43]">
                <div className="flex items-center justify-center gap-4 mb-3">
                  {settings.logoPerusahaan ? (
                    <img src={settings.logoPerusahaan} alt="EFM Logo" className="w-16 h-16 object-contain" />
                  ) : (
                    <div className="w-16 h-16 bg-[#1E1C43] rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-lg">EFM</span>
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-base font-bold text-[#1E1C43] tracking-wide uppercase">
                      {settings.namaPerusahaan || 'Essential Fitness Management'}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {settings.namaLegal || 'CV. Bugar Nusantara Jaya'}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500">
                  {settings.alamat || "Jl. Terogong Raya No. 18, Hampton's Park Apartment, Tower A, Cilandak Barat, Jakarta Selatan"}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  📱 {settings.whatsapp || '+62 811-1992-0666'} &nbsp;|&nbsp; ✉️ {settings.email || 'essentialfitnessmanagement@gmail.com'} &nbsp;|&nbsp; 🌐 {settings.website || 'www.essentialfitnessmanagement.com'}
                </p>
              </div>

              {/* Info Surat */}
              <div className="mb-5">
                <table className="text-xs">
                  <tbody>
                    <tr>
                      <td className="pr-4 py-0.5 align-top w-32">No. Surat</td>
                      <td className="pr-2 align-top">:</td>
                      <td className="font-semibold">{loiData.nomorLOI}</td>
                    </tr>
                    <tr>
                      <td className="pr-4 py-0.5 align-top">Perihal</td>
                      <td className="pr-2 align-top">:</td>
                      <td className="font-semibold">Letter of Intent — Penawaran Layanan Fitness &amp; Wellness Management</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tujuan Surat */}
              <div className="mb-5 text-xs">
                <p className="font-semibold">Kepada YTH:</p>
                <p className="font-bold text-sm mt-1">{loiData.namaKlien}</p>
                <p>Up: {loiData.picKlien}</p>
                <p>Di Tempat</p>
              </div>

              {/* Salam */}
              <p className="mb-4 text-xs font-semibold">Dengan hormat,</p>

              {/* Paragraf 1 */}
              <p className="mb-4 text-xs text-justify">
                Kami, <strong>CV. Bugar Nusantara Jaya (Essential Fitness Management / EFM)</strong> adalah perusahaan yang bergerak di bidang manajemen kebugaran <em>(fitness)</em>, olahraga <em>(sport)</em>, dan penanganan kesehatan <em>(wellness)</em> untuk individu, perusahaan, dan penyelenggaraan acara. Berdiri sejak tahun 2017, EFM telah melayani lebih dari 200 klien personal serta berbagai perusahaan dan institusi, di antaranya OJK, TELKOM, TELIN, AIA Insurance, dan PT. Suri Nusantara Jaya.
              </p>

              {/* Paragraf 2 */}
              <p className="mb-4 text-xs text-justify">
                Menindaklanjuti hasil survei lapangan yang telah kami lakukan, dengan ini kami menyatakan niat dan kesanggupan untuk menjalin kerjasama dengan <strong>{loiData.namaKlien}</strong> dalam bidang layanan kebugaran dan wellness.
              </p>

              {/* Tabel Ringkasan */}
              <div className="mb-5">
                <p className="text-xs font-semibold mb-2">Ringkasan Penawaran:</p>
                <table className="w-full border-collapse text-xs">
                  <tbody>
                    {[
                      ['Klien',             loiData.namaKlien],
                      ['Jenis',             loiData.jenis],
                      ['Program / Layanan', loiData.programLayanan],
                      ['Rincian Layanan',   loiData.rincianLayanan.map(r => r.namaItem || r.item).join(', ')],
                      ['Periode Kontrak',   `${fmtDate(loiData.tanggalMulai)} s/d ${fmtDate(loiData.tanggalSelesai)} (${loiData.durasiKontrak} bulan)`],
                      ['Estimasi Nilai',    `${fmtRp(loiData.subtotal)} / bulan`],
                      ['Total Penawaran',   `${fmtRp(loiData.totalPenawaran)} (sudah termasuk pajak)`],
                      ['No. Quotation',     loiData.nomorQuotation],
                    ].map(([label, value]) => (
                      <tr key={label} className="border-b border-gray-100">
                        <td className="py-1.5 pr-4 font-medium text-gray-600 w-40 align-top">{label}</td>
                        <td className="py-1.5 pr-2 align-top w-4">:</td>
                        <td className="py-1.5 text-gray-800">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lampiran */}
              <p className="text-[11px] text-gray-500 italic mb-4">
                Detail lengkap rincian layanan, harga, dan program terlampir dalam: Quotation No. {loiData.nomorQuotation} dan Laporan Hasil Survei.
              </p>

              {/* Paragraf 3 */}
              <p className="mb-4 text-xs text-justify">
                Kami berkomitmen menghadirkan program kebugaran yang terstruktur, profesional, dan disesuaikan dengan kebutuhan <strong>{loiData.namaKlien}</strong>, guna mendukung produktivitas dan kesejahteraan{' '}
                {loiData.jenis === 'Corporate' || loiData.jenis === 'Corporate Event' ? 'karyawan' : 'penghuni'}.
              </p>

              {/* Paragraf 4 */}
              <p className="mb-6 text-xs text-justify">
                Sebagai langkah selanjutnya, kami mengundang Bapak/Ibu untuk mendiskusikan detail program dan menandatangani Perjanjian Kerjasama bersama kami.
              </p>

              {/* Penutup */}
              <p className="mb-6 text-xs">
                Demikian surat ini kami sampaikan. Atas perhatian dan kepercayaan Bapak/Ibu, kami ucapkan terima kasih.
              </p>

              {/* Kota & Tanggal */}
              <p className="text-xs mb-6">Jakarta, {loiData.tanggalLOI}</p>

              {/* Tanda Tangan */}
              <div className="text-xs">
                <p>Hormat kami,</p>
                <p className="font-semibold mt-0.5">{settings.namaLegal || 'CV. Bugar Nusantara Jaya'}</p>
                <p className="text-gray-500">{settings.namaPerusahaan || 'Essential Fitness Management'}</p>
                {settings.tandaTanganCEO ? (
                  <img src={settings.tandaTanganCEO} alt="Tanda Tangan" className="h-16 object-contain mt-2 mb-1" />
                ) : (
                  <div className="h-16 mt-2 mb-2" />
                )}
                <p className="font-bold underline">{settings.namaPenandatangan || 'Bagoes Soeharto'}</p>
                <p>{settings.jabatanPenandatangan || 'Owner & Co-Founder'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Tambah Anggota Tim ════════════════════════════════════════════ */}
      {showTambahTim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-800">Tambah Anggota Tim</h3>
              <button onClick={() => { setShowTambahTim(false); setSelectedSource(""); setNewTimPeran("") }} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Toggle PIC / Mitra */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                {["PIC", "Mitra"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSumberTim(s); setSelectedSource(""); setNewTimPeran("") }}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${sumberTim === s ? "bg-white text-[#1E1C43] shadow-sm" : "text-gray-500"}`}
                  >
                    {s === "PIC" ? "Dari PIC Database" : "Dari Mitra Database"}
                  </button>
                ))}
              </div>

              {/* Dropdown pilih */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  {sumberTim === "PIC" ? "Pilih PIC" : "Pilih Mitra"}
                </label>
                <select
                  value={selectedSource}
                  onChange={(e) => {
                    setSelectedSource(e.target.value)
                    const src = sumberTim === "PIC"
                      ? dummyPICs.find((p) => p.id === e.target.value)
                      : dummyMitras.find((m) => m.id === e.target.value)
                    if (src) setNewTimPeran(sumberTim === "PIC" ? src.spesialisasi : src.peran)
                  }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1E1C43]"
                >
                  <option value="">— Pilih {sumberTim} —</option>
                  {(sumberTim === "PIC" ? dummyPICs : dummyMitras).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama} — {sumberTim === "PIC" ? item.spesialisasi : item.peran}
                    </option>
                  ))}
                </select>
              </div>

              {/* Peran di project */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Peran di Project Ini</label>
                <input
                  type="text"
                  value={newTimPeran}
                  onChange={(e) => setNewTimPeran(e.target.value)}
                  placeholder="cth. Head Trainer, Supervisor Lapangan"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1E1C43]"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                <select
                  value={newTimStatus}
                  onChange={(e) => setNewTimStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#1E1C43]"
                >
                  <option>Aktif</option>
                  <option>Standby</option>
                  <option>Non-aktif</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => { setShowTambahTim(false); setSelectedSource(""); setNewTimPeran("") }}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!selectedSource || !newTimPeran) return
                  const src = sumberTim === "PIC"
                    ? dummyPICs.find((p) => p.id === selectedSource)
                    : dummyMitras.find((m) => m.id === selectedSource)
                  if (!src) return
                  const newMember = {
                    id: `TL-${Date.now()}`,
                    sourceId: src.id,
                    sourceType: sumberTim,
                    nama: src.nama,
                    tipe: sumberTim === "PIC" ? "PIC EFM" : src.tipe,
                    peran: newTimPeran,
                    wa: src.wa,
                    status: newTimStatus,
                  }
                  setTimLapangan([...timLapangan, newMember])
                  setShowTambahTim(false)
                  setSelectedSource("")
                  setNewTimPeran("")
                  setNewTimStatus("Aktif")
                }}
                disabled={!selectedSource || !newTimPeran}
                className="flex-1 bg-[#1E1C43] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#2d2b5e] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}

      {showFormInsiden && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4" style={{ background:'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#1E1C43]">Laporan Insiden — {order.namaKlien}</h2>
              <button onClick={() => setShowFormInsiden(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tanggal Kejadian *</label>
                  <input type="date" value={iForm.tgl} onChange={e => setIForm(p => ({...p, tgl:e.target.value}))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Jam Kejadian *</label>
                  <input type="time" value={iForm.jam} onChange={e => setIForm(p => ({...p, jam:e.target.value}))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Kategori *</label>
                  <select value={iForm.kategori} onChange={e => setIForm(p => ({...p, kategori:e.target.value}))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]">
                    {['Kerusakan Alat','Kecelakaan Pengguna','Gangguan Fasilitas','Keluhan Klien','Lainnya'].map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Lokasi di Fasilitas</label>
                  <input value={iForm.lokasi} onChange={e => setIForm(p => ({...p, lokasi:e.target.value}))} placeholder="Area gym lantai 2"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Dilaporkan Oleh</label>
                  <input value={iForm.dilaporkan} onChange={e => setIForm(p => ({...p, dilaporkan:e.target.value}))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Status Awal</label>
                  <select value={iForm.statusAwal} onChange={e => setIForm(p => ({...p, statusAwal:e.target.value}))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]">
                    {['Baru','Dalam Penanganan'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Deskripsi Kejadian *</label>
                <textarea value={iForm.deskripsi} onChange={e => setIForm(p => ({...p, deskripsi:e.target.value}))}
                  placeholder="Jelaskan kejadian secara detail..." rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43] resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tindakan Awal</label>
                <textarea value={iForm.tindakan} onChange={e => setIForm(p => ({...p, tindakan:e.target.value}))}
                  placeholder="Tindakan yang sudah diambil saat kejadian..." rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43] resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Upload Foto/Dokumentasi (maks 3 file)</label>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" multiple
                  onChange={e => setIForm(p => ({...p, foto: Array.from(e.target.files).slice(0,3)}))}
                  className="text-xs text-gray-600" />
                {iForm.foto.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {iForm.foto.map((f,i) => <p key={i} className="text-[11px] text-gray-500">📎 {f.name}</p>)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <button onClick={() => window.print()}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-[#1E1C43] text-[#1E1C43] text-xs font-semibold hover:bg-[#1E1C43] hover:text-white transition-colors">
                <Printer size={13} /> Export PDF
              </button>
              <div className="flex gap-2">
                <button onClick={() => setShowFormInsiden(false)}
                  className="h-9 px-4 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                  Batal
                </button>
                <button onClick={() => {
                  if (!iForm.tgl || !iForm.deskripsi) return
                  const tglJam = `${iForm.tgl} ${iForm.jam}`
                  setInsidenList(p => [...p, { id: Date.now(), tglJam, kategori: iForm.kategori, deskripsi: iForm.deskripsi, status: iForm.statusAwal }])
                  setShowFormInsiden(false)
                  setIForm({ tgl:'', jam:'', kategori:'Kerusakan Alat', lokasi:'', dilaporkan:'', statusAwal:'Baru', deskripsi:'', tindakan:'', foto:[] })
                }}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-red-600 text-white text-xs font-semibold hover:opacity-90">
                  💾 Simpan Laporan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Tambah Jadwal Operasional ════════════════════════════════════ */}
      {showTambahJadwal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-sm font-bold text-[#1E1C43] flex items-center gap-2">
                <Clock size={15} /> Tambah Jadwal Operasional
              </h2>
              <button onClick={() => setShowTambahJadwal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tanggal *</label>
                  <input type="date" value={newJadwal.tanggal} onChange={e => setNewJadwal(p => ({...p, tanggal: e.target.value}))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Jam</label>
                  <input type="time" value={newJadwal.jam} onChange={e => setNewJadwal(p => ({...p, jam: e.target.value}))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Nama Kegiatan *</label>
                <input value={newJadwal.kegiatan} onChange={e => setNewJadwal(p => ({...p, kegiatan: e.target.value}))} placeholder="Nama kegiatan"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">PIC</label>
                <input value={newJadwal.pic} onChange={e => setNewJadwal(p => ({...p, pic: e.target.value}))} placeholder="Nama PIC"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                <select value={newJadwal.status} onChange={e => setNewJadwal(p => ({...p, status: e.target.value}))}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43] bg-white">
                  {['Dijadwalkan', 'Selesai', 'Dibatalkan'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setShowTambahJadwal(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition">
                Batal
              </button>
              <button onClick={() => {
                if (!newJadwal.tanggal || !newJadwal.kegiatan) return
                setJadwalOperasional(p => [...p, {
                  id: `JDW-${String(Date.now()).slice(-4)}`,
                  tanggal: newJadwal.tanggal,
                  jam: newJadwal.jam || '00:00',
                  kegiatan: newJadwal.kegiatan,
                  pic: newJadwal.pic,
                  status: newJadwal.status,
                }])
                setShowTambahJadwal(false)
                setNewJadwal({ tanggal: '', jam: '', kegiatan: '', pic: '', status: 'Dijadwalkan' })
              }}
                disabled={!newJadwal.tanggal || !newJadwal.kegiatan}
                className="flex-1 bg-[#1E1C43] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#2d2b5e] transition disabled:opacity-50 disabled:cursor-not-allowed">
                Simpan Jadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Edit Jadwal Operasional ═══════════════════════════════════════ */}
      {editingJadwal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Edit2 size={15} className="text-[#1E1C43]" /> Edit Jadwal Kegiatan
              </h3>
              <button onClick={() => setEditingJadwal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tanggal *</label>
                  <input type="date" value={editingJadwal.tanggal}
                    onChange={e => setEditingJadwal({...editingJadwal, tanggal: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Jam</label>
                  <input type="time" value={editingJadwal.jam}
                    onChange={e => setEditingJadwal({...editingJadwal, jam: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nama Kegiatan *</label>
                <input type="text" value={editingJadwal.kegiatan}
                  onChange={e => setEditingJadwal({...editingJadwal, kegiatan: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">PIC</label>
                <input type="text" value={editingJadwal.pic}
                  onChange={e => setEditingJadwal({...editingJadwal, pic: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                <select value={editingJadwal.status}
                  onChange={e => setEditingJadwal({...editingJadwal, status: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                  <option>Dijadwalkan</option>
                  <option>Berlangsung</option>
                  <option>Selesai</option>
                  <option>Dibatalkan</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setEditingJadwal(null)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition">
                Batal
              </button>
              <button
                onClick={() => {
                  if (!editingJadwal.tanggal || !editingJadwal.kegiatan) return;
                  setJadwalOperasional(jadwalOperasional.map(x =>
                    x.id === editingJadwal.id ? { ...editingJadwal } : x
                  ));
                  setEditingJadwal(null);
                }}
                disabled={!editingJadwal.tanggal || !editingJadwal.kegiatan}
                className="flex-1 bg-[#1E1C43] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#2d2b5e] transition disabled:opacity-50 disabled:cursor-not-allowed">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Tambah Laporan Kunjungan (Tab 3) ══════════════════════════════ */}
      {showTambahLaporan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-800">Buat Laporan Kunjungan</h3>
              <button onClick={() => { setShowTambahLaporan(false); setNewLaporan({ tanggal: '', picKunjungan: '', kondisiUmum: 'Baik', temuan: '', status: 'Selesai', foto: null, fotoNama: null }) }}
                className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tanggal Kunjungan *</label>
                  <input type="date" value={newLaporan.tanggal}
                    onChange={e => setNewLaporan({...newLaporan, tanggal: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Kondisi Umum</label>
                  <select value={newLaporan.kondisiUmum}
                    onChange={e => setNewLaporan({...newLaporan, kondisiUmum: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                    <option>Baik</option>
                    <option>Cukup</option>
                    <option>Perlu Perhatian</option>
                    <option>Bermasalah</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">PIC Kunjungan *</label>
                <input type="text" value={newLaporan.picKunjungan}
                  onChange={e => setNewLaporan({...newLaporan, picKunjungan: e.target.value})}
                  placeholder="Nama PIC yang melakukan kunjungan"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Temuan / Catatan</label>
                <textarea value={newLaporan.temuan}
                  onChange={e => setNewLaporan({...newLaporan, temuan: e.target.value})}
                  placeholder="Deskripsikan temuan, kondisi venue, hal yang perlu ditindaklanjuti..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                <select value={newLaporan.status}
                  onChange={e => setNewLaporan({...newLaporan, status: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                  <option>Selesai</option>
                  <option>Draft</option>
                  <option>Perlu Tindak Lanjut</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Foto Dokumentasi</label>
                <input type="file" accept="image/*" ref={fotoLaporanBaruRef} className="hidden"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setNewLaporan({...newLaporan, foto: ev.target.result, fotoNama: file.name});
                    reader.readAsDataURL(file);
                  }} />
                {newLaporan.foto ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <img src={newLaporan.foto} alt="preview" className="w-full h-32 object-cover" />
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                      <p className="text-xs text-gray-500 truncate">{newLaporan.fotoNama}</p>
                      <button onClick={() => setNewLaporan({...newLaporan, foto: null, fotoNama: null})}
                        className="text-xs text-red-400 hover:text-red-600 ml-2 flex-shrink-0">Hapus</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => fotoLaporanBaruRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-xs text-gray-400 hover:border-[#1E1C43] hover:text-[#1E1C43] transition flex flex-col items-center gap-1">
                    <ImageIcon size={20} />
                    <span>Klik untuk upload foto</span>
                    <span className="text-gray-300">JPG, PNG, WEBP — maks 5MB</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => { setShowTambahLaporan(false); setNewLaporan({ tanggal: '', picKunjungan: '', kondisiUmum: 'Baik', temuan: '', status: 'Selesai', foto: null, fotoNama: null }) }}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition">
                Batal
              </button>
              <button
                onClick={() => {
                  if (!newLaporan.tanggal || !newLaporan.picKunjungan) return;
                  const newId = `LK-${Date.now()}`;
                  setLaporanKunjungan([...laporanKunjungan, { id: newId, ...newLaporan }]);
                  const waktuSekarang = new Date().toLocaleString('id-ID', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
                  setLogTab3(prev => [...prev, { id: Date.now(), waktu: waktuSekarang, kategori: 'kunjungan', nomorLaporan: newId, teks: `Laporan kunjungan ${newId} dibuat oleh ${newLaporan.picKunjungan} — Kondisi: ${newLaporan.kondisiUmum}` }]);
                  setShowTambahLaporan(false);
                  setNewLaporan({ tanggal: '', picKunjungan: '', kondisiUmum: 'Baik', temuan: '', status: 'Selesai', foto: null, fotoNama: null });
                }}
                disabled={!newLaporan.tanggal || !newLaporan.picKunjungan}
                className="flex-1 bg-[#1E1C43] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#2d2b5e] transition disabled:opacity-50 disabled:cursor-not-allowed">
                Simpan Laporan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Tambah Laporan Insiden (Tab 3) ════════════════════════════════ */}
      {showTambahInsiden && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-bold text-[#E05945] flex items-center gap-2">
                <AlertTriangle size={15} /> Laporkan Insiden
              </h3>
              <button onClick={() => setShowTambahInsiden(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tanggal *</label>
                  <input type="date" value={newInsiden.tanggal}
                    onChange={e => setNewInsiden({...newInsiden, tanggal: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E05945]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Jenis Insiden *</label>
                  <select value={newInsiden.jenis}
                    onChange={e => setNewInsiden({...newInsiden, jenis: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E05945]">
                    {['Koordinasi', 'Kerusakan Alat', 'Kecelakaan', 'Cuaca', 'Logistik', 'Lainnya'].map(j => <option key={j}>{j}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Severity</label>
                  <select value={newInsiden.severity}
                    onChange={e => setNewInsiden({...newInsiden, severity: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E05945]">
                    {['Low', 'Medium', 'High', 'Critical'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">PIC Pelapor</label>
                  <input value={newInsiden.pic}
                    onChange={e => setNewInsiden({...newInsiden, pic: e.target.value})}
                    placeholder="Nama pelapor"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E05945]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Deskripsi *</label>
                <textarea value={newInsiden.deskripsi}
                  onChange={e => setNewInsiden({...newInsiden, deskripsi: e.target.value})}
                  rows={3}
                  placeholder="Jelaskan detail insiden yang terjadi..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E05945] resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Foto Bukti / Dokumentasi</label>
                <input type="file" accept="image/*" ref={fotoInsidenBaruRef} className="hidden"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setNewInsiden({
                      ...newInsiden, foto: ev.target.result, fotoNama: file.name,
                      logAktivitas: [{ waktu: new Date().toLocaleString('id-ID', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}), catatan: `Foto "${file.name}" dilampirkan saat pelaporan`, tipe: 'foto' }]
                    });
                    reader.readAsDataURL(file);
                  }} />
                {newInsiden.foto ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <img src={newInsiden.foto} alt="preview foto insiden" className="w-full h-32 object-cover" />
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                      <p className="text-xs text-gray-500 truncate">{newInsiden.fotoNama}</p>
                      <button onClick={() => setNewInsiden({...newInsiden, foto: null, fotoNama: null})}
                        className="text-xs text-red-400 hover:text-red-600 ml-2 flex-shrink-0">Hapus</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => fotoInsidenBaruRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-xs text-gray-400 hover:border-[#E05945] hover:text-[#E05945] transition flex flex-col items-center gap-1">
                    <ImageIcon size={20} />
                    <span>Klik untuk upload foto bukti</span>
                    <span className="text-gray-300">JPG, PNG, WEBP</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setShowTambahInsiden(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition">
                Batal
              </button>
              <button
                onClick={() => {
                  if (!newInsiden.tanggal || !newInsiden.jenis || !newInsiden.deskripsi) return;
                  const newInsidenId = `INS-${Date.now()}`;
                  setLaporanInsiden([...laporanInsiden, { id: newInsidenId, ...newInsiden }]);
                  setLogTab3(prev => [...prev, { id: Date.now(), waktu: new Date().toLocaleString('id-ID', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}), kategori: 'insiden', nomorLaporan: newInsidenId, teks: `Insiden ${newInsidenId} dilaporkan: ${newInsiden.jenis} — ${newInsiden.deskripsi.substring(0, 60)}${newInsiden.deskripsi.length > 60 ? '...' : ''}` }]);
                  setShowTambahInsiden(false);
                  setNewInsiden({ tanggal: '', jenis: 'Koordinasi', severity: 'Low', pic: '', deskripsi: '', status: 'Open', foto: null, fotoNama: null, logAktivitas: [] });
                }}
                disabled={!newInsiden.tanggal || !newInsiden.jenis || !newInsiden.deskripsi}
                className="flex-1 bg-[#E05945] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#c94a38] transition disabled:opacity-50 disabled:cursor-not-allowed">
                Simpan Insiden
              </button>
            </div>
          </div>
        </div>
      )}

      {editingInsiden && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Edit2 size={15} className="text-[#1E1C43]" /> Edit Laporan Insiden
              </h3>
              <button onClick={() => setEditingInsiden(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tanggal</label>
                  <input type="date" value={editingInsiden.tanggal}
                    onChange={e => setEditingInsiden({...editingInsiden, tanggal: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Severity</label>
                  <select value={editingInsiden.severity}
                    onChange={e => setEditingInsiden({...editingInsiden, severity: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Jenis Insiden</label>
                <select value={editingInsiden.jenis}
                  onChange={e => setEditingInsiden({...editingInsiden, jenis: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                  <option>Kecelakaan Peserta</option>
                  <option>Kerusakan Peralatan</option>
                  <option>Perubahan Rundown</option>
                  <option>Kendala Cuaca</option>
                  <option>Konflik Tim</option>
                  <option>Masalah Teknis</option>
                  <option>Pembatalan Mendadak</option>
                  <option>Koordinasi</option>
                  <option>Lainnya</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">PIC Pelapor</label>
                <input type="text" value={editingInsiden.pic}
                  onChange={e => setEditingInsiden({...editingInsiden, pic: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Deskripsi</label>
                <textarea value={editingInsiden.deskripsi}
                  onChange={e => setEditingInsiden({...editingInsiden, deskripsi: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                <select value={editingInsiden.status}
                  onChange={e => setEditingInsiden({...editingInsiden, status: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Foto Bukti / Dokumentasi</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fotoInsidenRef}
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setEditingInsiden({
                      ...editingInsiden,
                      foto: ev.target.result,
                      fotoNama: file.name,
                      logAktivitas: [
                        ...(editingInsiden.logAktivitas || []),
                        {
                          waktu: new Date().toLocaleString('id-ID', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }),
                          catatan: `Foto "${file.name}" ditambahkan`,
                          tipe: "foto"
                        }
                      ]
                    });
                    reader.readAsDataURL(file);
                  }}
                />
                {editingInsiden.foto ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <img src={editingInsiden.foto} alt="preview foto insiden" className="w-full h-32 object-cover" />
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                      <p className="text-xs text-gray-500 truncate">{editingInsiden.fotoNama}</p>
                      <button
                        onClick={() => setEditingInsiden({
                          ...editingInsiden,
                          foto: null,
                          fotoNama: null,
                          logAktivitas: [
                            ...(editingInsiden.logAktivitas || []),
                            {
                              waktu: new Date().toLocaleString('id-ID', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }),
                              catatan: "Foto dihapus dari laporan insiden",
                              tipe: "foto"
                            }
                          ]
                        })}
                        className="text-xs text-red-400 hover:text-red-600 ml-2 flex-shrink-0">
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fotoInsidenRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-xs text-gray-400 hover:border-[#E05945] hover:text-[#E05945] transition flex flex-col items-center gap-1">
                    <ImageIcon size={20} />
                    <span>Klik untuk upload foto bukti</span>
                    <span className="text-gray-300">JPG, PNG, WEBP</span>
                  </button>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tambah Catatan Tindak Lanjut</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="catatanLogInsiden"
                    placeholder="cth. Barang ditemukan di lokasi parkir..."
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1E1C43]"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('catatanLogInsiden');
                      if (!input.value.trim()) return;
                      setEditingInsiden({
                        ...editingInsiden,
                        logAktivitas: [
                          ...(editingInsiden.logAktivitas || []),
                          {
                            waktu: new Date().toLocaleString('id-ID', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }),
                            catatan: input.value.trim(),
                            tipe: "catatan"
                          }
                        ]
                      });
                      input.value = '';
                    }}
                    className="px-3 py-2 bg-[#1E1C43] text-white rounded-xl text-xs font-semibold hover:bg-[#2d2b5e] transition flex-shrink-0">
                    + Tambah
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setEditingInsiden(null)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition">
                Batal
              </button>
              <button
                onClick={() => {
                  setLaporanInsiden(laporanInsiden.map(x =>
                    x.id === editingInsiden.id ? { ...editingInsiden } : x
                  ));
                  setEditingInsiden(null);
                }}
                className="flex-1 bg-[#1E1C43] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#2d2b5e] transition">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {editingLaporan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Edit2 size={15} className="text-[#1E1C43]" /> Edit Laporan Kunjungan
              </h3>
              <button onClick={() => setEditingLaporan(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tanggal Kunjungan</label>
                  <input type="date" value={editingLaporan.tanggal}
                    onChange={e => setEditingLaporan({...editingLaporan, tanggal: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Kondisi Umum</label>
                  <select value={editingLaporan.kondisiUmum}
                    onChange={e => setEditingLaporan({...editingLaporan, kondisiUmum: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                    <option>Baik</option>
                    <option>Cukup</option>
                    <option>Perlu Perhatian</option>
                    <option>Bermasalah</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">PIC Kunjungan</label>
                <input type="text" value={editingLaporan.picKunjungan}
                  onChange={e => setEditingLaporan({...editingLaporan, picKunjungan: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Temuan / Catatan</label>
                <textarea value={editingLaporan.temuan}
                  onChange={e => setEditingLaporan({...editingLaporan, temuan: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                <select value={editingLaporan.status}
                  onChange={e => setEditingLaporan({...editingLaporan, status: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                  <option>Selesai</option>
                  <option>Draft</option>
                  <option>Perlu Tindak Lanjut</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Foto Dokumentasi</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fotoInputRef}
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setEditingLaporan({
                      ...editingLaporan,
                      foto: ev.target.result,
                      fotoNama: file.name
                    });
                    reader.readAsDataURL(file);
                  }}
                />
                {editingLaporan.foto ? (
                  <div className="border border-gray-200 rounded-xl p-3">
                    <img src={editingLaporan.foto} alt="preview"
                      className="w-full h-32 object-cover rounded-lg mb-2" />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate">{editingLaporan.fotoNama}</p>
                      <button
                        onClick={() => setEditingLaporan({...editingLaporan, foto: null, fotoNama: null})}
                        className="text-xs text-red-400 hover:text-red-600 ml-2 flex-shrink-0">
                        Hapus Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fotoInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-xs text-gray-400 hover:border-[#1E1C43] hover:text-[#1E1C43] transition flex flex-col items-center gap-1">
                    <ImageIcon size={20} />
                    <span>Klik untuk upload foto</span>
                    <span className="text-gray-300">JPG, PNG, WEBP — maks 5MB</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setEditingLaporan(null)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition">
                Batal
              </button>
              <button
                onClick={() => {
                  setLaporanKunjungan(laporanKunjungan.map(x =>
                    x.id === editingLaporan.id ? { ...editingLaporan } : x
                  ));
                  setEditingLaporan(null);
                }}
                className="flex-1 bg-[#1E1C43] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#2d2b5e] transition">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {previewFoto && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          onClick={() => setPreviewFoto(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <p className="text-sm font-bold text-gray-800">Preview Foto</p>
                <p className="text-xs text-gray-400 mt-0.5">{previewFoto.dariNomor} — {previewFoto.nama}</p>
              </div>
              <button onClick={() => setPreviewFoto(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              <img src={previewFoto.src} alt={previewFoto.nama} className="w-full rounded-xl object-contain max-h-[60vh]" />
              <p className="text-xs text-gray-400 text-center mt-2">{previewFoto.nama}</p>
            </div>
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setPreviewFoto(null)}
                className="w-full border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
