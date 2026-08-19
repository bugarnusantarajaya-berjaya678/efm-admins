import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, MapPin, Users, ClipboardList, AlertTriangle,
  Activity, ExternalLink, Trash2, Plus, Edit2, X, ImageIcon,
  CheckCircle, Save, Download, FileText, ChevronRight,
} from 'lucide-react'

/* ─── helpers ─────────────────────────────────────────────────── */
function formatRp(n) { return 'Rp ' + (n || 0).toLocaleString('id-ID') }
function formatWA(wa) { return wa.replace(/^0/, '62').replace(/\D/g, '') }
function fmtDate(str) {
  if (!str) return '—'
  const d = new Date(str)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
function severityColor(s) {
  if (s === 'Critical') return 'bg-red-100 text-red-700'
  if (s === 'High')     return 'bg-orange-100 text-orange-700'
  if (s === 'Medium')   return 'bg-yellow-100 text-yellow-700'
  return 'bg-blue-100 text-blue-700'
}
function statusJadwalColor(s) {
  if (s === 'Selesai')     return 'bg-green-100 text-green-700'
  if (s === 'Berlangsung') return 'bg-blue-100 text-blue-700'
  if (s === 'Dibatalkan')  return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-600'
}

/* ─── constants ───────────────────────────────────────────────── */
const PAY_TERMS_EVENT = ['Full Payment', '50% DP + Pelunasan', 'Custom']
const PAY_STATUS_CLS = {
  'Belum Ditagih':    'bg-gray-100 text-gray-500',
  'Invoice Terkirim': 'bg-blue-100 text-blue-700',
  'Lunas':            'bg-green-100 text-green-700',
}
const TAHAPAN_CLS = {
  'Quotation':     'bg-gray-100 text-gray-600',
  'LOI':           'bg-amber-100 text-amber-700',
  'MOU':           'bg-blue-100 text-blue-700',
  'Contract':      'bg-purple-100 text-purple-700',
  'Event Running': 'bg-green-100 text-green-700',
  'Event Selesai': 'bg-gray-100 text-gray-500',
}
const STATUS_CLS = {
  'Aktif':   'bg-green-100 text-green-700',
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Selesai': 'bg-gray-100 text-gray-600',
  'Batal':   'bg-red-100 text-red-600',
}
const STEPPER_STEPS = ['Quotation', 'LOI', 'MOU', 'Contract', 'Event Running', 'Event Selesai']
const STEP_IDX = { 'Quotation': 0, 'LOI': 1, 'MOU': 2, 'Contract': 3, 'Event Running': 4, 'Event Selesai': 5 }
const DOC_OPTS  = ['Drafting', 'On Review', 'Revision', 'Signed']
const DOC_CLS   = { Signed: 'bg-green-100 text-green-700', 'On Review': 'bg-blue-100 text-blue-700', Drafting: 'bg-gray-100 text-gray-500', Revision: 'bg-yellow-100 text-yellow-700' }

/* ─── dummy data ──────────────────────────────────────────────── */
const dummyKonsultasiEvent = [
  { id: 'KNS-001', namaEvent: 'Fun Run Jakarta 2026', jenisEvent: 'Corporate Event', tanggalEvent: '2026-08-17', lokasi: 'GBK Senayan, Jakarta', jumlahPeserta: 500, peranEFM: 'Full EO', programKegiatan: ['Fun Run', 'Senam Massal', 'Pembicara Kesehatan'], catatan: 'Klien minta EFM handle full dari konsep sampai hari H' },
  { id: 'KNS-002', namaEvent: 'Yoga Festival Senayan', jenisEvent: 'Community Event', tanggalEvent: '2026-09-05', lokasi: 'Senayan Park, Jakarta', jumlahPeserta: 300, peranEFM: 'Provider Pengisi Acara', programKegiatan: ['Yoga', 'Host/MC'], catatan: '' },
]

const dummyEventOrders = [
  {
    id: 'EO-001',
    konsultasiId: 'KNS-001',
    namaKlien: 'PT. Sinar Nusantara',
    tipeKlien: 'Corporate',
    namaEvent: 'Fun Run Jakarta 2026',
    jenisEvent: 'Corporate Event',
    tanggalEvent: '2026-08-17',
    lokasiEvent: 'GBK Senayan, Jakarta',
    jumlahPeserta: 500,
    peranEFM: 'Full EO',
    picSalesEFM: 'Ahmad Pratama',
    picOpsEFM: 'Rudi Hartono',
    nilaiKontrak: 85000000,
    tahapan: 'Contract',
    statusOrder: 'Aktif',
    catatanOrder: 'Event nasional, perlu koordinasi intensif H-30',
    rincianLayanan: [
      { id: 1, item: 'Koordinasi & Manajemen Event', satuan: 'Paket', jumlah: 1, total: 30000000 },
      { id: 2, item: 'Tim Instruktur Senam Massal',  satuan: 'Orang', jumlah: 5, total: 25000000 },
      { id: 3, item: 'Fun Run Race Management',      satuan: 'Paket', jumlah: 1, total: 20000000 },
      { id: 4, item: 'Pembicara Kesehatan',           satuan: 'Sesi',  jumlah: 2, total: 10000000 },
    ],
    paymentTerms: '50% DP + Pelunasan',
    paymentTracking: [
      { id: 'PT-001', periode: 'DP 50% — Juli 2026',         nominal: 42500000, status: 'Lunas',            tglBayar: '2026-07-01', invoiceId: 'INV-EO-001' },
      { id: 'PT-002', periode: 'Pelunasan — Agustus 2026',   nominal: 42500000, status: 'Invoice Terkirim', tglBayar: null,          invoiceId: 'INV-EO-002' },
    ],
    profitSharing: { ada: false, persen: 0, realisasi: [] },
    quotation: { nomor: 'QUO/EFM/EV/2026/001', tanggal: '2026-06-15', manajemenFee: false, manajemenFeePersen: 0, pajak: [{ id: 1, nama: 'PPN 11%', persen: 11, aktif: true }], status: 'Approved', catatan: '' },
    loiStatus: 'Signed',
    mouAda: false,
    contractStatus: 'Signed',
  },
  {
    id: 'EO-002',
    konsultasiId: 'KNS-002',
    namaKlien: 'Komunitas Sehat ID',
    tipeKlien: 'Community',
    namaEvent: 'Yoga Festival Senayan',
    jenisEvent: 'Community Event',
    tanggalEvent: '2026-09-05',
    lokasiEvent: 'Senayan Park, Jakarta',
    jumlahPeserta: 300,
    peranEFM: 'Provider Pengisi Acara',
    picSalesEFM: 'Rina Indah',
    picOpsEFM: 'Sari Dewi',
    nilaiKontrak: 35000000,
    tahapan: 'LOI',
    statusOrder: 'Aktif',
    catatanOrder: '',
    rincianLayanan: [
      { id: 1, item: 'Tim Instruktur Yoga', satuan: 'Orang', jumlah: 3, total: 21000000 },
      { id: 2, item: 'Host/MC Event',        satuan: 'Orang', jumlah: 1, total: 5000000  },
      { id: 3, item: 'Koordinasi Teknis',    satuan: 'Paket', jumlah: 1, total: 9000000  },
    ],
    paymentTerms: 'Full Payment',
    paymentTracking: [
      { id: 'PT-003', periode: 'Full Payment — September 2026', nominal: 35000000, status: 'Belum Ditagih', tglBayar: null, invoiceId: null },
    ],
    profitSharing: { ada: false, persen: 0, realisasi: [] },
    quotation: { nomor: 'QUO/EFM/EV/2026/002', tanggal: '2026-07-01', manajemenFee: false, manajemenFeePersen: 0, pajak: [{ id: 1, nama: 'PPN 11%', persen: 11, aktif: true }], status: 'Draft', catatan: '' },
    loiStatus: 'Draft',
    mouAda: false,
    contractStatus: 'Drafting',
  },
]

const dummyEventPICs = [
  { id: 'PIC-001', nama: 'Rudi Hartono', spesialisasi: 'Personal Trainer',  wa: '081234567891', status: 'Aktif' },
  { id: 'PIC-002', nama: 'Sari Dewi',    spesialisasi: 'Yoga Instructor',    wa: '081234567892', status: 'Aktif' },
  { id: 'PIC-003', nama: 'Bima Prakoso', spesialisasi: 'Zumba Instructor',   wa: '081234567893', status: 'Aktif' },
]
const dummyEventMitras = [
  { id: 'MTR-E01', nama: 'CV. Race Management Pro',      tipe: 'Vendor',       peran: 'Race Organizer & Timing System', wa: '081111222333', status: 'Aktif' },
  { id: 'MTR-E02', nama: 'PT. Sound & Stage Indonesia',  tipe: 'Vendor',       peran: 'Sound System & Panggung',         wa: '081222333444', status: 'Aktif' },
  { id: 'MTR-E03', nama: 'Studio Foto Kenangan',          tipe: 'Vendor',       peran: 'Photobooth & Dokumentasi',        wa: '081333444555', status: 'Aktif' },
  { id: 'MTR-E04', nama: 'Emma Warokka MC',               tipe: 'Mitra Pelatih', peran: 'Host/MC Event',                 wa: '081444555666', status: 'Aktif' },
]

/* ─── small components ────────────────────────────────────────── */
function Badge({ children, cls = 'bg-gray-100 text-gray-600' }) {
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
              <button onClick={onSave} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90">
                <Save size={12} /> Simpan
              </button>
              <button onClick={onCancel} className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs hover:bg-gray-50">
                <X size={12} /> Batal
              </button>
            </>
          ) : onEdit ? (
            <button onClick={onEdit} className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors">
              <Edit2 size={12} /> Edit
            </button>
          ) : null}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${checked ? 'bg-[#1E1C43]' : 'bg-gray-200'}`}>
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Main Page
═══════════════════════════════════════════════════════════════ */
export default function EventOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const order = dummyEventOrders.find(o => o.id === id) || dummyEventOrders[0]
  const konsultasiTerkait = dummyKonsultasiEvent.find(k => k.id === order.konsultasiId)

  /* ── Tab state ───────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState('kontrak')

  /* ── Tab 1: Info Deal ────────────────────────────────────────── */
  const [editingSection, setEditingSection] = useState(null)
  const initInfo = { namaKlien: order.namaKlien, tipeKlien: order.tipeKlien, namaEvent: order.namaEvent, jenisEvent: order.jenisEvent, tanggalEvent: order.tanggalEvent, lokasiEvent: order.lokasiEvent, jumlahPeserta: order.jumlahPeserta, peranEFM: order.peranEFM, picSalesEFM: order.picSalesEFM, picOpsEFM: order.picOpsEFM, catatanOrder: order.catatanOrder }
  const [infoDeal, setInfoDeal] = useState(initInfo)
  const [infoDraft, setInfoDraft] = useState(initInfo)
  const [rincianLayanan, setRincianLayanan] = useState(order.rincianLayanan)
  const [rincianDraft, setRincianDraft] = useState(order.rincianLayanan)

  /* ── Tab 1: Quotation ────────────────────────────────────────── */
  const [qData, setQData] = useState({
    nomor: order.quotation.nomor,
    tanggal: order.quotation.tanggal,
    manajemenFee: { aktif: order.quotation.manajemenFee, persen: order.quotation.manajemenFeePersen },
    pajakList: order.quotation.pajak.map(p => ({ ...p })),
    status: order.quotation.status,
    catatan: order.quotation.catatan,
  })

  /* ── Tab 1: Payment Terms ────────────────────────────────────── */
  const [payTerms, setPayTerms] = useState(order.paymentTerms)
  const [payRows, setPayRows]   = useState(order.paymentTracking.map(r => ({ ...r })))

  function generatePayRows(terms, total) {
    if (terms === 'Full Payment') return [{ id: Date.now(), periode: 'Full Payment', nominal: total, status: 'Belum Ditagih', tglBayar: null, invoiceId: null }]
    if (terms === '50% DP + Pelunasan') {
      const dp = Math.round(total * 0.5)
      return [
        { id: Date.now(),     periode: 'DP 50%',    nominal: dp,        status: 'Belum Ditagih', tglBayar: null, invoiceId: null },
        { id: Date.now() + 1, periode: 'Pelunasan', nominal: total - dp, status: 'Belum Ditagih', tglBayar: null, invoiceId: null },
      ]
    }
    return [{ id: Date.now(), periode: 'Termin 1', nominal: total, status: 'Belum Ditagih', tglBayar: null, invoiceId: null }]
  }

  /* ── Tab 1: Profit Sharing ───────────────────────────────────── */
  const [hasPS,      setHasPS]      = useState(order.profitSharing.ada)
  const [psPersen,   setPsPersen]   = useState(order.profitSharing.persen || 15)
  const [psRows,     setPsRows]     = useState(order.profitSharing.realisasi || [])
  const [psDraft,    setPsDraft]    = useState(null)
  const [psPersenDraft, setPsPersenDraft] = useState(15)

  /* ── Tab 2: Documents ────────────────────────────────────────── */
  const [editingDoc, setEditingDoc] = useState(null)
  const [loiDoc, setLoiDoc] = useState({ status: order.loiStatus, gdocsUrl: '', riwayat: order.loiStatus === 'Signed' ? [{ id: 1, nama: 'loi-event-signed.pdf', tgl: '2026-07-01', status: 'Signed' }] : [] })
  const [loiDraft, setLoiDraft] = useState(null)
  const [adaMOU, setAdaMOU]     = useState(order.mouAda)
  const [mouDoc, setMouDoc]     = useState({ status: 'Drafting', gdocsUrl: '', riwayat: [] })
  const [mouDraft, setMouDraft] = useState(null)
  const [cDoc, setCDoc]         = useState({ status: order.contractStatus, gdocsUrl: '', riwayat: order.contractStatus === 'Signed' || order.contractStatus === 'Active' ? [{ id: 1, nama: 'contract-event-final.pdf', tgl: '2026-07-15', status: 'Signed' }] : [] })
  const [cDraft, setCDraft]     = useState(null)

  const logTab2 = [
    { dot: '#10B981', teks: `Contract diupload: contract-${order.id.toLowerCase()}-final.pdf`, waktu: '15 Jul 2026 10:00' },
    { dot: '#3B82F6', teks: `LOI ditandatangani klien ${order.namaKlien}`,                   waktu: '1 Jul 2026 09:00' },
    { dot: '#F97316', teks: 'Pembayaran DP 50% dikonfirmasi Lunas',                           waktu: '1 Jul 2026 08:00' },
    { dot: '#10B981', teks: `Order ${order.id} dibuat oleh Admin EFM`,                        waktu: '15 Jun 2026 09:00' },
  ]

  /* ── Tab 3: Operasional ──────────────────────────────────────── */
  const [timLapangan, setTimLapangan] = useState([
    { id: 'TL-001', sourceId: 'PIC-001', sourceType: 'PIC',   nama: 'Rudi Hartono',              tipe: 'PIC EFM', peran: 'Koordinator Lapangan', wa: '081234567891', status: 'Aktif' },
    { id: 'TL-002', sourceId: 'MTR-E01', sourceType: 'Mitra', nama: 'CV. Race Management Pro',   tipe: 'Vendor',  peran: 'Race Organizer',        wa: '081111222333', status: 'Aktif' },
    { id: 'TL-003', sourceId: 'MTR-E02', sourceType: 'Mitra', nama: 'PT. Sound & Stage Indonesia',tipe: 'Vendor',  peran: 'Sound System',          wa: '081222333444', status: 'Aktif' },
  ])
  const [jadwalOperasional, setJadwalOperasional] = useState([
    { id: 'JDW-001', tanggal: '2026-08-10', jam: '10:00', kegiatan: 'Technical Meeting & Briefing Tim',  pic: 'Rudi Hartono', status: 'Dijadwalkan' },
    { id: 'JDW-002', tanggal: '2026-08-16', jam: '08:00', kegiatan: 'Gladi Bersih & Cek Venue',          pic: 'Rudi Hartono', status: 'Dijadwalkan' },
    { id: 'JDW-003', tanggal: '2026-08-17', jam: '05:30', kegiatan: `Hari H — ${order.namaEvent}`,       pic: 'Rudi Hartono', status: 'Dijadwalkan' },
  ])
  const [laporanKunjungan, setLaporanKunjungan] = useState([
    { id: 'LK-001', tanggal: '2026-07-20', picKunjungan: 'Rudi Hartono', kondisiUmum: 'Baik', temuan: 'Area parkir perlu koordinasi tambahan dengan pihak GBK', foto: null, status: 'Selesai' },
  ])
  const [laporanInsiden, setLaporanInsiden] = useState([])
  const [showTambahTim,     setShowTambahTim]     = useState(false)
  const [showTambahJadwal,  setShowTambahJadwal]  = useState(false)
  const [showTambahLaporan, setShowTambahLaporan] = useState(false)
  const [showTambahInsiden, setShowTambahInsiden] = useState(false)
  const [sumberTim,         setSumberTim]         = useState('PIC')
  const [selectedSource,    setSelectedSource]    = useState('')
  const [newTimPeran,       setNewTimPeran]       = useState('')
  const [newTimStatus,      setNewTimStatus]      = useState('Aktif')
  const [logFilter3,        setLogFilter3]        = useState('semua')

  const logTab3Event = [
    { id: 1, waktu: '2026-07-20 11:00', kategori: 'kunjungan', teks: 'Laporan kunjungan venue GBK dibuat oleh Rudi Hartono' },
    { id: 2, waktu: '2026-07-15 09:00', kategori: 'vendor',    teks: 'CV. Race Management Pro ditambahkan sebagai Vendor Race Organizer' },
    { id: 3, waktu: '2026-07-15 09:05', kategori: 'vendor',    teks: 'PT. Sound & Stage Indonesia ditambahkan sebagai Vendor Sound System' },
    { id: 4, waktu: '2026-07-01 14:00', kategori: 'jadwal',    teks: 'Jadwal Technical Meeting ditambahkan: 10 Agustus 2026' },
    { id: 5, waktu: '2026-06-20 10:00', kategori: 'tim',       teks: 'Rudi Hartono ditambahkan sebagai Koordinator Lapangan' },
  ]

  /* ── computed ────────────────────────────────────────────────── */
  const subtotal     = rincianLayanan.reduce((s, r) => s + r.total, 0)
  const mgmtFeeAmt   = qData.manajemenFee.aktif ? Math.round(subtotal * qData.manajemenFee.persen / 100) : 0
  const afterMgmt    = subtotal + mgmtFeeAmt
  const pajakAmt     = qData.pajakList.filter(p => p.aktif).reduce((s, p) => s + Math.round(afterMgmt * p.persen / 100), 0)
  const totalTagihan = afterMgmt + pajakAmt
  const insidenAktif = laporanInsiden.filter(ins => (ins.severity === 'Critical' || ins.severity === 'High') && ins.status !== 'Resolved')

  /* ── edit handlers ───────────────────────────────────────────── */
  function startEdit(section) {
    setEditingSection(section)
    if (section === 'infoDeal') {
      setInfoDraft({ ...infoDeal })
      setRincianDraft(rincianLayanan.map(r => ({ ...r })))
    }
    if (section === 'profitSharing') {
      setPsPersenDraft(psPersen)
      setPsDraft(psRows.map(r => ({ ...r })))
    }
  }
  function cancelEdit() { setEditingSection(null) }
  function saveInfoDeal() {
    setInfoDeal({ ...infoDraft })
    setRincianLayanan([...rincianDraft])
    setEditingSection(null)
  }
  function saveProfitSharing() {
    setPsPersen(psPersenDraft)
    setPsRows([...psDraft])
    setEditingSection(null)
  }
  function handleTambahTim() {
    if (!selectedSource) return
    const isPIC = sumberTim === 'PIC'
    const src   = isPIC ? dummyEventPICs.find(p => p.id === selectedSource) : dummyEventMitras.find(m => m.id === selectedSource)
    if (!src) return
    const newEntry = {
      id: 'TL-' + Date.now(),
      sourceId:   src.id,
      sourceType: sumberTim,
      nama:   src.nama,
      tipe:   isPIC ? 'PIC EFM' : src.tipe,
      peran:  newTimPeran || src.peran || '',
      wa:     src.wa,
      status: newTimStatus,
    }
    setTimLapangan(prev => [...prev, newEntry])
    setShowTambahTim(false)
    setSelectedSource('')
    setNewTimPeran('')
    setNewTimStatus('Aktif')
  }

  /* ── render ──────────────────────────────────────────────────── */
  const currentStepIdx = STEP_IDX[order.tahapan] ?? 0

  return (
    <div className="bg-[#F5F5F7] min-h-screen pb-20">
      <div className="px-6 py-6">

        {/* ── HEADER CARD ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
          {/* Breadcrumb + Kembali */}
          <div className="flex items-center justify-between mb-4">
            <nav className="flex items-center gap-1 text-xs text-gray-400">
              <button onClick={() => navigate('/event')} className="hover:text-[#1E1C43] transition-colors">Event Management</button>
              <ChevronRight size={12} className="text-gray-300" />
              <button onClick={() => navigate('/event/orders')} className="hover:text-[#1E1C43] transition-colors">Orders</button>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="text-[#1E1C43] font-medium">{order.namaEvent}</span>
            </nav>
            <button onClick={() => navigate('/event/orders')}
              className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowLeft size={12} /> Kembali
            </button>
          </div>

          {/* Judul */}
          <h1 className="text-xl font-bold text-[#1E1C43] mb-0.5">{order.namaEvent}</h1>
          <p className="text-sm text-gray-500 mb-3">{order.namaKlien} · {order.tipeKlien}</p>

          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1E1C43] text-white">{order.jenisEvent}</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{order.peranEFM}</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
              <Calendar size={10} /> {fmtDate(order.tanggalEvent)}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              <MapPin size={10} /> {order.lokasiEvent}
            </span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TAHAPAN_CLS[order.tahapan] ?? 'bg-gray-100 text-gray-500'}`}>{order.tahapan}</span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_CLS[order.statusOrder] ?? 'bg-gray-100 text-gray-500'}`}>● {order.statusOrder}</span>
            <span className="ml-auto text-xs text-gray-400 font-mono">{order.id}</span>
          </div>
        </div>

        {/* ── TAB BAR ── */}
        <div className="flex border-b border-gray-200 mb-5 bg-white rounded-t-xl">
          {[
            { key: 'kontrak',     label: 'Kontrak & Keuangan'  },
            { key: 'dokumen',     label: 'Dokumen Kerjasama'    },
            { key: 'operasional', label: 'Operasional Lapangan' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.key ? 'border-[#E05945] text-[#E05945]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════
            TAB 1 — Kontrak & Keuangan
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'kontrak' && (
          <>
            {/* ── Section 1: Info Deal + Rincian Layanan ── */}
            <SectionCard
              title="Info Deal & Rincian Layanan"
              editing={editingSection === 'infoDeal'}
              onEdit={() => startEdit('infoDeal')}
              onSave={saveInfoDeal}
              onCancel={cancelEdit}
            >
              {editingSection === 'infoDeal' ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ['Nama Klien',  'namaKlien'],
                      ['Tipe Klien',  'tipeKlien'],
                      ['Nama Event',  'namaEvent'],
                      ['Jenis Event', 'jenisEvent'],
                      ['Lokasi Event','lokasiEvent'],
                      ['Peran EFM',   'peranEFM'],
                      ['PIC Sales EFM','picSalesEFM'],
                      ['PIC Ops EFM', 'picOpsEFM'],
                    ].map(([lbl, key]) => (
                      <div key={key}>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{lbl}</label>
                        <input value={infoDraft[key] || ''} onChange={e => setInfoDraft(p => ({ ...p, [key]: e.target.value }))}
                          className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tanggal Event</label>
                      <input type="date" value={infoDraft.tanggalEvent || ''} onChange={e => setInfoDraft(p => ({ ...p, tanggalEvent: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Jumlah Peserta</label>
                      <input type="number" value={infoDraft.jumlahPeserta || ''} onChange={e => setInfoDraft(p => ({ ...p, jumlahPeserta: Number(e.target.value) }))}
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Nilai Kontrak (dari Quotation)</label>
                      <div className="h-9 px-3 flex items-center rounded-lg bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-500 select-none">{formatRp(totalTagihan)}</div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Catatan</label>
                      <textarea value={infoDraft.catatanOrder || ''} onChange={e => setInfoDraft(p => ({ ...p, catatanOrder: e.target.value }))}
                        rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43] resize-none" />
                    </div>
                  </div>
                  {/* Rincian Layanan edit */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-700">Rincian Layanan</p>
                      <button onClick={() => setRincianDraft(p => [...p, { id: Date.now(), item: '', satuan: 'Paket', jumlah: 1, total: 0 }])}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#1E1C43] hover:text-[#E05945]">
                        <Plus size={11} /> Tambah Item
                      </button>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          {['Item Layanan', 'Satuan', 'Jumlah', 'Total', ''].map(h => (
                            <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rincianDraft.map((r, i) => (
                          <tr key={r.id} className="border-b border-gray-100">
                            <td className="px-3 py-2">
                              <input value={r.item} onChange={e => setRincianDraft(p => p.map((x, j) => j === i ? { ...x, item: e.target.value } : x))}
                                className="w-full h-8 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                            </td>
                            <td className="px-3 py-2 w-24">
                              <input value={r.satuan} onChange={e => setRincianDraft(p => p.map((x, j) => j === i ? { ...x, satuan: e.target.value } : x))}
                                className="w-full h-8 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                            </td>
                            <td className="px-3 py-2 w-16">
                              <input type="number" min={1} value={r.jumlah} onChange={e => setRincianDraft(p => p.map((x, j) => j === i ? { ...x, jumlah: Number(e.target.value) } : x))}
                                className="w-full h-8 px-2 rounded border border-gray-200 text-xs text-center outline-none focus:border-[#1E1C43]" />
                            </td>
                            <td className="px-3 py-2 w-32">
                              <input type="number" min={0} value={r.total} onChange={e => setRincianDraft(p => p.map((x, j) => j === i ? { ...x, total: Number(e.target.value) } : x))}
                                className="w-full h-8 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                            </td>
                            <td className="px-3 py-2 w-8">
                              <button onClick={() => setRincianDraft(p => p.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500 transition-colors">
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
                /* view mode */
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    {[
                      ['Nama Klien',    infoDeal.namaKlien],
                      ['Tipe Klien',    infoDeal.tipeKlien],
                      ['Nama Event',    infoDeal.namaEvent],
                      ['Jenis Event',   infoDeal.jenisEvent],
                      ['Tanggal Event', fmtDate(infoDeal.tanggalEvent)],
                      ['Lokasi Event',  infoDeal.lokasiEvent],
                      ['Jumlah Peserta',infoDeal.jumlahPeserta + ' orang'],
                      ['Peran EFM',     infoDeal.peranEFM],
                      ['PIC Sales EFM', infoDeal.picSalesEFM],
                      ['PIC Ops EFM',   infoDeal.picOpsEFM],
                      ['Nilai Kontrak', formatRp(totalTagihan)],
                      ['Status Order',  order.statusOrder],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{k}</p>
                        <p className={`text-sm font-medium ${k === 'Nilai Kontrak' ? 'text-[#1E1C43] text-base font-bold' : 'text-gray-800'}`}>{v || '—'}</p>
                      </div>
                    ))}
                    {infoDeal.catatanOrder && (
                      <div className="col-span-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Catatan</p>
                        <p className="text-sm text-gray-700 italic">{infoDeal.catatanOrder}</p>
                      </div>
                    )}
                  </div>
                  {/* Rincian Layanan view */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Rincian Layanan</p>
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          {['No', 'Item Layanan', 'Satuan', 'Jumlah', 'Total'].map(h => (
                            <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rincianLayanan.map((r, i) => (
                          <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5">{i + 1}</td>
                            <td className="text-xs font-medium text-gray-800 px-3 py-2.5">{r.item}</td>
                            <td className="text-xs text-gray-600 px-3 py-2.5">{r.satuan}</td>
                            <td className="text-xs text-gray-600 px-3 py-2.5 text-center">{r.jumlah}</td>
                            <td className="text-xs font-semibold text-gray-800 px-3 py-2.5">{formatRp(r.total)}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-gray-200">
                          <td colSpan={4} className="px-3 py-2.5 text-xs font-bold text-gray-700 text-right">Subtotal</td>
                          <td className="px-3 py-2.5 text-sm font-bold text-[#1E1C43]">{formatRp(subtotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* ── Section 2: Quotation ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-semibold text-[#1E1C43]">Quotation</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Penawaran harga kepada klien — berdasarkan rincian layanan di atas</p>
                </div>
                <Badge cls={qData.status === 'Approved' ? 'bg-green-100 text-green-700' : qData.status === 'Draft' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}>
                  {qData.status}
                </Badge>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[['No. Quotation', qData.nomor], ['Tanggal', fmtDate(qData.tanggal)]].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{k}</p>
                      <p className="text-xs font-medium text-gray-700">{v}</p>
                    </div>
                  ))}
                </div>

                {/* Rincian items in quotation */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        {['No', 'Item Layanan', 'Satuan', 'Jumlah', 'Harga Satuan', 'Total'].map(h => (
                          <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rincianLayanan.map((r, i) => (
                        <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5">{i + 1}</td>
                          <td className="text-xs font-medium text-gray-800 px-3 py-2.5">{r.item}</td>
                          <td className="text-xs text-gray-600 px-3 py-2.5">{r.satuan}</td>
                          <td className="text-xs text-gray-600 px-3 py-2.5 text-center">{r.jumlah}</td>
                          <td className="text-xs text-gray-600 px-3 py-2.5">{formatRp(Math.round(r.total / (r.jumlah || 1)))}</td>
                          <td className="text-xs font-semibold text-gray-800 px-3 py-2.5">{formatRp(r.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Kalkulasi */}
                <div className="flex justify-end">
                  <div className="w-80 space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">{formatRp(subtotal)}</span>
                    </div>
                    {/* Management Fee */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ToggleSwitch
                          checked={qData.manajemenFee.aktif}
                          onChange={() => setQData(p => ({ ...p, manajemenFee: { ...p.manajemenFee, aktif: !p.manajemenFee.aktif } }))}
                        />
                        <span className="text-xs text-gray-600">Management Fee</span>
                        {qData.manajemenFee.aktif && (
                          <div className="flex items-center gap-0.5">
                            <input type="number" min={0} max={100} value={qData.manajemenFee.persen}
                              onChange={e => setQData(p => ({ ...p, manajemenFee: { ...p.manajemenFee, persen: Number(e.target.value) } }))}
                              className="w-12 h-6 px-1 rounded border border-gray-200 text-xs text-center outline-none focus:border-[#1E1C43]" />
                            <span className="text-xs text-gray-500">%</span>
                          </div>
                        )}
                      </div>
                      {qData.manajemenFee.aktif && <span className="text-xs font-medium text-gray-700">{formatRp(mgmtFeeAmt)}</span>}
                    </div>
                    {qData.manajemenFee.aktif && (
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Total stlh Mgmt Fee</span>
                        <span className="font-medium">{formatRp(afterMgmt)}</span>
                      </div>
                    )}
                    {/* Pajak */}
                    <div className="space-y-1.5 pt-1">
                      {qData.pajakList.map((pj, pi) => (
                        <div key={pj.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={pj.aktif}
                              onChange={e => setQData(p => ({ ...p, pajakList: p.pajakList.map((x, xi) => xi === pi ? { ...x, aktif: e.target.checked } : x) }))}
                              className="accent-[#1E1C43] w-3 h-3" />
                            <span className="text-xs text-gray-600">{pj.nama}</span>
                          </div>
                          <span className={`text-xs font-medium ${pj.aktif ? 'text-gray-700' : 'text-gray-400'}`}>{formatRp(Math.round(afterMgmt * pj.persen / 100))}</span>
                        </div>
                      ))}
                      <button
                        onClick={() => setQData(p => ({ ...p, pajakList: [...p.pajakList, { id: Date.now(), nama: 'PPh 2.5%', persen: 2.5, aktif: true }] }))}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#1E1C43] hover:text-[#E05945] transition-colors">
                        <Plus size={11} /> Tambah Pajak
                      </button>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t-2 border-gray-200">
                      <span className="text-sm font-bold text-gray-700">TOTAL TAGIHAN</span>
                      <span className="text-base font-bold text-[#E05945]">{formatRp(totalTagihan)}</span>
                    </div>
                  </div>
                </div>

                {/* Catatan & status */}
                {qData.catatan && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">{qData.catatan}</p>
                  </div>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Status:</span>
                    <select value={qData.status} onChange={e => setQData(p => ({ ...p, status: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E1C43]">
                      {['Draft', 'Terkirim', 'Approved', 'Ditolak', 'Revisi'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <button className="inline-flex items-center gap-1.5 bg-[#1E1C43] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90">
                    <Download size={13} /> Download PDF
                  </button>
                </div>
              </div>
            </div>

            {/* ── Section 3: Payment Terms & Tracking ── */}
            <SectionCard title="Payment Terms & Tracking">
              <div className="flex items-center gap-3 mb-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Metode Pembayaran</p>
                <Badge cls="bg-[#1E1C43] text-white">{payTerms}</Badge>
                <select value={payTerms} onChange={e => { setPayTerms(e.target.value); setPayRows(generatePayRows(e.target.value, totalTagihan)) }}
                  className="h-8 px-3 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#1E1C43]">
                  {PAY_TERMS_EVENT.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <p className="text-[10px] text-gray-400 mb-3">
                Nominal tagihan berdasarkan Total Tagihan Quotation:{' '}
                <span className="font-semibold text-[#1E1C43]">{formatRp(totalTagihan)}</span>
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      {['No', 'Keterangan Periode', 'Nominal', 'Status', 'Tgl Bayar', 'Aksi'].map(h => (
                        <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payRows.map((pt, i) => (
                      <tr key={pt.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="text-xs text-gray-400 px-3 py-2.5">{i + 1}</td>
                        <td className="text-xs text-gray-700 px-3 py-2.5 font-medium whitespace-nowrap">{pt.periode}</td>
                        <td className="text-xs text-gray-700 px-3 py-2.5 whitespace-nowrap">{formatRp(pt.nominal)}</td>
                        <td className="px-3 py-2.5">
                          <Badge cls={PAY_STATUS_CLS[pt.status] ?? 'bg-gray-100 text-gray-500'}>{pt.status}</Badge>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-700">{pt.tglBayar || '—'}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5 flex-nowrap">
                            {pt.status === 'Belum Ditagih' && (
                              <button onClick={() => navigate(`/event/invoice?order=${order.id}&periode=${encodeURIComponent(pt.periode)}&action=create`)}
                                className="h-6 px-2.5 rounded text-[10px] font-semibold bg-[#1E1C43] text-white hover:opacity-90 whitespace-nowrap">
                                Buat Invoice
                              </button>
                            )}
                            {(pt.status === 'Invoice Terkirim' || pt.status === 'Lunas') && (
                              <button onClick={() => navigate(`/event/invoice?order=${order.id}&periode=${encodeURIComponent(pt.periode)}`)}
                                className="h-6 px-2.5 rounded text-[10px] font-semibold border border-blue-300 text-blue-600 hover:bg-blue-50 whitespace-nowrap">
                                Lihat Invoice
                              </button>
                            )}
                            {pt.status === 'Lunas' && (
                              <button onClick={() => navigate(`/event/receipt?order=${order.id}&periode=${encodeURIComponent(pt.periode)}`)}
                                className="h-6 px-2.5 rounded text-[10px] font-semibold border border-green-300 text-green-600 hover:bg-green-50 whitespace-nowrap">
                                Lihat Receipt
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {/* ── Section 4: Profit Sharing ── */}
            <SectionCard
              title="Profit Sharing"
              editing={editingSection === 'profitSharing'}
              onEdit={hasPS ? () => startEdit('profitSharing') : null}
              onSave={saveProfitSharing}
              onCancel={cancelEdit}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs text-gray-600 font-medium">Ada Profit Sharing?</span>
                <ToggleSwitch checked={hasPS} onChange={() => { if (!editingSection) setHasPS(p => !p) }} />
                <span className="text-xs text-gray-400">{hasPS ? 'Aktif' : 'Tidak aktif'}</span>
              </div>
              {!hasPS && <p className="text-sm text-gray-400 italic">Kontrak ini tidak menggunakan profit sharing.</p>}
              {hasPS && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs text-gray-600">% Hak EFM dari Total Profit Klien</span>
                    {editingSection === 'profitSharing' ? (
                      <div className="flex items-center gap-1">
                        <input type="number" min={0} max={100} value={psPersenDraft}
                          onChange={e => { setPsPersenDraft(Number(e.target.value)); setPsDraft(prev => prev.map(r => ({ ...r, persen: Number(e.target.value) }))) }}
                          className="w-16 h-8 px-2 rounded-lg border border-gray-200 text-sm text-center outline-none focus:border-[#1E1C43]" />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    ) : (
                      <Badge cls="bg-purple-100 text-purple-700">{psPersen}%</Badge>
                    )}
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        {['No', 'Periode', 'Total Profit Klien', '%', 'Hak EFM', 'Status', 'Tgl Terima'].map(h => (
                          <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(editingSection === 'profitSharing' ? psDraft : psRows).map((r, i) => (
                        <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="text-xs text-gray-400 px-3 py-2.5">{i + 1}</td>
                          <td className="px-3 py-2.5">
                            {editingSection === 'profitSharing' ? (
                              <input value={r.periode} onChange={e => setPsDraft(p => p.map((x, j) => j === i ? { ...x, periode: e.target.value } : x))}
                                className="w-28 h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                            ) : <span className="text-xs text-gray-700 font-medium">{r.periode}</span>}
                          </td>
                          <td className="px-3 py-2.5">
                            {editingSection === 'profitSharing' ? (
                              <input type="number" value={r.totalProfit} onChange={e => setPsDraft(p => p.map((x, j) => j === i ? { ...x, totalProfit: Number(e.target.value) } : x))}
                                className="w-36 h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                            ) : <span className="text-xs text-gray-700">{formatRp(r.totalProfit)}</span>}
                          </td>
                          <td className="text-xs text-gray-700 px-3 py-2.5">{(editingSection === 'profitSharing' ? psPersenDraft : psPersen)}%</td>
                          <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">
                            {formatRp(Math.round(r.totalProfit * (editingSection === 'profitSharing' ? psPersenDraft : psPersen) / 100))}
                          </td>
                          <td className="px-3 py-2.5">
                            {editingSection === 'profitSharing' ? (
                              <select value={r.status} onChange={e => setPsDraft(p => p.map((x, j) => j === i ? { ...x, status: e.target.value } : x))}
                                className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]">
                                <option>Belum Diterima</option><option>Sudah Diterima</option>
                              </select>
                            ) : (
                              <Badge cls={r.status === 'Sudah Diterima' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>{r.status}</Badge>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-gray-700">{r.tglTerima || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {editingSection === 'profitSharing' && (
                    <button onClick={() => setPsDraft(p => [...p, { id: Date.now(), periode: '', totalProfit: 0, persen: psPersenDraft, status: 'Belum Diterima', tglTerima: '' }])}
                      className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#1E1C43] hover:text-[#E05945] transition-colors">
                      <Plus size={12} /> Tambah Periode
                    </button>
                  )}
                </>
              )}
            </SectionCard>
          </>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 2 — Dokumen Kerjasama
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'dokumen' && (
          <div className="space-y-4">

            {/* ── Stepper ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Progress Dokumen Kerjasama</p>
              <div className="flex items-center">
                {STEPPER_STEPS.map((step, idx) => {
                  const s = idx < currentStepIdx ? 'completed' : idx === currentStepIdx ? 'current' : 'pending'
                  const icons = ['📋', '📝', '🤝', '📄', '🏃', '✅']
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${s === 'completed' ? 'bg-green-500 border-green-500 text-white' : s === 'current' ? 'bg-[#1E1C43] border-[#1E1C43] text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                          {s === 'completed' ? '✓' : icons[idx]}
                        </div>
                        <p className={`text-[9px] mt-1 font-semibold whitespace-nowrap ${s === 'completed' ? 'text-green-600' : s === 'current' ? 'text-[#1E1C43]' : 'text-gray-400'}`}>{step}</p>
                      </div>
                      {idx < STEPPER_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 mb-4 ${s === 'completed' ? 'bg-green-400' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── LOI ── */}
            {(() => {
              const isEditing = editingDoc === 'loi'
              const doc = isEditing ? loiDraft : loiDoc
              return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#1E1C43]">LOI (Letter of Intent)</h3>
                      <Badge cls={DOC_CLS[loiDoc.status] ?? 'bg-gray-100 text-gray-500'}>{loiDoc.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={() => { setLoiDoc({ ...loiDraft }); setEditingDoc(null) }}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90">
                            <Save size={12} /> Simpan
                          </button>
                          <button onClick={() => setEditingDoc(null)}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                            <X size={12} /> Batal
                          </button>
                        </>
                      ) : (
                        <button onClick={() => { setLoiDraft({ ...loiDoc }); setEditingDoc('loi') }}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors">
                          <Edit2 size={12} /> Edit
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Status LOI</label>
                          <select value={loiDraft.status} onChange={e => setLoiDraft(p => ({ ...p, status: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] bg-white">
                            {DOC_OPTS.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Upload File</label>
                          <input type="file" accept=".pdf,.jpg,.png" className="text-xs text-gray-600" />
                          <p className="text-[10px] text-gray-400 mt-1">PDF, JPG, PNG · Maks 5MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Status</p>
                            <Badge cls={DOC_CLS[doc.status] ?? 'bg-gray-100 text-gray-500'}>{doc.status || '—'}</Badge>
                          </div>
                        </div>
                        {doc.riwayat && doc.riwayat.length > 0 && (
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Riwayat File</p>
                            <div className="space-y-1.5">
                              {doc.riwayat.map(r => (
                                <div key={r.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                                  <span className="text-xs font-medium text-gray-700 flex-1">{r.nama}</span>
                                  <span className="text-[10px] text-gray-400">{r.tgl}</span>
                                  <Badge cls={DOC_CLS[r.status] ?? 'bg-gray-100 text-gray-500'}>{r.status}</Badge>
                                  <button className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-[#1E1C43]"><Download size={11} /></button>
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

            {/* ── MOU ── */}
            {(() => {
              const isEditing = editingDoc === 'mou'
              const doc = isEditing ? mouDraft : mouDoc
              return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-[#1E1C43]">MOU</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Ada MOU?</span>
                        <ToggleSwitch checked={adaMOU} onChange={val => setAdaMOU(val)} />
                      </div>
                      {adaMOU && <Badge cls={DOC_CLS[mouDoc.status] ?? 'bg-gray-100 text-gray-500'}>{mouDoc.status}</Badge>}
                    </div>
                    {adaMOU && (isEditing ? (
                      <div className="flex gap-2">
                        <button onClick={() => { setMouDoc({ ...mouDraft }); setEditingDoc(null) }}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90">
                          <Save size={12} /> Simpan
                        </button>
                        <button onClick={() => setEditingDoc(null)}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                          <X size={12} /> Batal
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setMouDraft({ ...mouDoc }); setEditingDoc('mou') }}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors">
                        <Edit2 size={12} /> Edit
                      </button>
                    ))}
                  </div>
                  {adaMOU && (
                    <div className="p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Status</span>
                        {isEditing ? (
                          <select value={mouDraft.status} onChange={e => setMouDraft(p => ({ ...p, status: e.target.value }))}
                            className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]">
                            {DOC_OPTS.map(s => <option key={s}>{s}</option>)}
                          </select>
                        ) : <Badge cls={DOC_CLS[doc.status] ?? 'bg-gray-100 text-gray-500'}>{doc.status}</Badge>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Google Docs</span>
                        {isEditing ? (
                          <input value={mouDraft.gdocsUrl} onChange={e => setMouDraft(p => ({ ...p, gdocsUrl: e.target.value }))}
                            placeholder="https://docs.google.com/..."
                            className="flex-1 h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                        ) : doc.gdocsUrl ? (
                          <a href={doc.gdocsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">Buka Google Docs <ExternalLink size={11} /></a>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </div>
                      {isEditing && (
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Upload File</span>
                          <input type="file" accept=".pdf" className="text-xs text-gray-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Riwayat File</p>
                        {doc.riwayat.length === 0 ? <p className="text-xs text-gray-400 italic">Belum ada file diupload.</p> : (
                          <div className="space-y-1.5">
                            {doc.riwayat.map(r => (
                              <div key={r.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                                <span className="text-xs font-medium text-gray-700 flex-1">{r.nama}</span>
                                <span className="text-[10px] text-gray-400">{r.tgl}</span>
                                <Badge cls={DOC_CLS[r.status] ?? 'bg-gray-100 text-gray-500'}>{r.status}</Badge>
                                <button className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-[#1E1C43]"><Download size={11} /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* ── Contract ── */}
            {(() => {
              const isEditing = editingDoc === 'contract'
              const doc = isEditing ? cDraft : cDoc
              return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#1E1C43]">Contract</h3>
                      <Badge cls={DOC_CLS[cDoc.status] ?? 'bg-gray-100 text-gray-500'}>{cDoc.status}</Badge>
                    </div>
                    <div className="flex gap-2">
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
                          {DOC_OPTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      ) : <Badge cls={DOC_CLS[doc.status] ?? 'bg-gray-100 text-gray-500'}>{doc.status}</Badge>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Google Docs</span>
                      {isEditing ? (
                        <input value={cDraft.gdocsUrl} onChange={e => setCDraft(p => ({ ...p, gdocsUrl: e.target.value }))}
                          placeholder="https://docs.google.com/..." className="flex-1 h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                      ) : doc.gdocsUrl ? (
                        <a href={doc.gdocsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">Buka Google Docs <ExternalLink size={11} /></a>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </div>
                    {isEditing && (
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Upload File</span>
                        <input type="file" accept=".pdf" className="text-xs text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Riwayat File</p>
                      {doc.riwayat.length === 0 ? <p className="text-xs text-gray-400 italic">Belum ada file diupload.</p> : (
                        <div className="space-y-1.5">
                          {doc.riwayat.map(r => (
                            <div key={r.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-xs font-medium text-gray-700 flex-1">{r.nama}</span>
                              <span className="text-[10px] text-gray-400">{r.tgl}</span>
                              <Badge cls={DOC_CLS[r.status] ?? 'bg-gray-100 text-gray-500'}>{r.status}</Badge>
                              <button className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-[#1E1C43]"><Download size={11} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* ── Log Aktivitas Tab 2 ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-[#1E1C43]">Log Aktivitas</h3>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {logTab2.map((l, i) => (
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
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 3 — Operasional Lapangan
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'operasional' && (
          <div>

            {/* ── SECTION 1: Referensi Konsultasi ── */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <FileText size={15} className="text-[#1E1C43]" />
                  Referensi Konsultasi
                  <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${konsultasiTerkait ? 'bg-[#1E1C43] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {konsultasiTerkait ? 'Terhubung' : 'Belum Ada'}
                  </span>
                </h3>
                {konsultasiTerkait && (
                  <button onClick={() => navigate(`/event/konsultasi/${order.konsultasiId}`)}
                    className="text-xs text-[#1E1C43] font-medium hover:underline flex items-center gap-1">
                    Lihat Detail Konsultasi <ExternalLink size={12} />
                  </button>
                )}
              </div>
              {konsultasiTerkait ? (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Nama Event',      konsultasiTerkait.namaEvent],
                    ['Tanggal Event',   fmtDate(konsultasiTerkait.tanggalEvent)],
                    ['Lokasi',          konsultasiTerkait.lokasi],
                    ['Jumlah Peserta',  konsultasiTerkait.jumlahPeserta + ' orang'],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className="text-sm font-semibold text-gray-800">{val}</p>
                    </div>
                  ))}
                  <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Peran EFM</p>
                    <p className="text-sm font-semibold text-gray-800">{konsultasiTerkait.peranEFM}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-gray-500 mb-2">Program Kegiatan</p>
                    <div className="flex flex-wrap gap-1">
                      {konsultasiTerkait.programKegiatan.map(prog => (
                        <span key={prog} className="bg-[#1E1C43]/10 text-[#1E1C43] text-xs px-2 py-0.5 rounded-full">{prog}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Belum ada konsultasi terkait order ini</p>
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

              {insidenAktif.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="text-red-600" />
                    <p className="text-sm font-bold text-red-700">⚠️ Insiden Aktif — Quick Contact Tim</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {timLapangan.map(t => (
                      <a key={t.id} href={`https://wa.me/${formatWA(t.wa)}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 bg-white border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50 transition">
                        <span className="text-xs font-medium text-gray-800 flex-1">{t.nama}</span>
                        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">WA</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Nama', 'Tipe', 'Peran', 'Status', 'Aksi'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timLapangan.map(t => (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="py-3 pr-4">
                          <p className="text-xs font-semibold text-gray-800">{t.nama}</p>
                          <p className="text-xs text-gray-400">{t.sourceType === 'PIC' ? 'PIC Database' : 'Mitra Database'}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs bg-[#1E1C43]/10 text-[#1E1C43] px-2 py-0.5 rounded-full">{t.tipe}</span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-gray-700">{t.peran}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{t.status}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <a href={`https://wa.me/${formatWA(t.wa)}`} target="_blank" rel="noreferrer"
                              className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition">WA</a>
                            <button onClick={() => setTimLapangan(prev => prev.filter(x => x.id !== t.id))} className="text-red-400 hover:text-red-600 transition">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => setShowTambahTim(true)}
                className="mt-4 w-full border border-dashed border-gray-300 text-gray-500 hover:border-[#1E1C43] hover:text-[#1E1C43] rounded-xl py-2.5 text-xs font-medium transition flex items-center justify-center gap-2">
                <Plus size={14} /> Tambah Anggota Tim
              </button>
            </div>

            {/* ── SECTION 3: Jadwal Kegiatan ── */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Calendar size={15} className="text-[#1E1C43]" />
                  Jadwal Kegiatan Operasional
                  <span className="ml-1 bg-[#1E1C43] text-white text-xs px-2 py-0.5 rounded-full">{jadwalOperasional.length}</span>
                </h3>
                <button onClick={() => navigate('/event/kalender')}
                  className="text-xs text-[#1E1C43] font-medium hover:underline flex items-center gap-1">
                  Lihat di Kalender <ExternalLink size={12} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['No', 'Tanggal', 'Jam', 'Kegiatan', 'PIC', 'Status', 'Aksi'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">{h}</th>
                      ))}
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
                          <button className="text-gray-400 hover:text-[#1E1C43] transition"><Edit2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={() => setShowTambahJadwal(true)}
                className="mt-4 w-full border border-dashed border-gray-300 text-gray-500 hover:border-[#1E1C43] hover:text-[#1E1C43] rounded-xl py-2.5 text-xs font-medium transition flex items-center justify-center gap-2">
                <Plus size={14} /> Tambah Jadwal
              </button>
            </div>

            {/* ── SECTION 4: Laporan Kunjungan & Persiapan ── */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <ClipboardList size={15} className="text-[#1E1C43]" />
                  Laporan Kunjungan & Persiapan
                  <span className="ml-1 bg-[#1E1C43] text-white text-xs px-2 py-0.5 rounded-full">{laporanKunjungan.length}</span>
                </h3>
              </div>
              <div className="space-y-3">
                {laporanKunjungan.map(lk => (
                  <div key={lk.id} className="border border-gray-100 rounded-xl p-4 hover:border-[#1E1C43]/30 transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-bold text-gray-800">{lk.tanggal} — {lk.picKunjungan}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Kondisi Umum: <span className="text-green-600 font-medium">{lk.kondisiUmum}</span></p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lk.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{lk.status}</span>
                    </div>
                    {lk.temuan && (
                      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2.5 mt-2">
                        <p className="text-xs text-yellow-800"><span className="font-semibold">Temuan:</span> {lk.temuan}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      {lk.foto ? (
                        <span className="text-xs text-blue-600 flex items-center gap-1"><ImageIcon size={12} /> Foto tersedia</span>
                      ) : (
                        <span className="text-xs text-gray-400 flex items-center gap-1"><ImageIcon size={12} /> Belum ada foto</span>
                      )}
                      <button className="ml-auto text-xs text-[#1E1C43] font-medium hover:underline flex items-center gap-1"><Edit2 size={11} /> Edit</button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowTambahLaporan(true)}
                className="mt-4 w-full border border-dashed border-gray-300 text-gray-500 hover:border-[#1E1C43] hover:text-[#1E1C43] rounded-xl py-2.5 text-xs font-medium transition flex items-center justify-center gap-2">
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
                {laporanInsiden.map(ins => (
                  <div key={ins.id} className={`border rounded-xl p-4 ${ins.severity === 'Critical' ? 'border-red-300 bg-red-50' : ins.severity === 'High' ? 'border-orange-200 bg-orange-50' : 'border-gray-100'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-bold text-gray-800">{ins.tanggal} — {ins.jenis}</p>
                        <p className="text-xs text-gray-500 mt-0.5">PIC: {ins.pic}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${severityColor(ins.severity)}`}>{ins.severity}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ins.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{ins.status}</span>
                      </div>
                    </div>
                    {ins.deskripsi && <p className="text-xs text-gray-600 mt-1">{ins.deskripsi}</p>}
                  </div>
                ))}
                {laporanInsiden.length === 0 && (
                  <div className="text-center py-6 text-gray-400">
                    <AlertTriangle size={24} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Tidak ada insiden tercatat</p>
                  </div>
                )}
              </div>
              <button onClick={() => setShowTambahInsiden(true)}
                className="mt-4 w-full border border-dashed border-gray-300 text-gray-500 hover:border-[#E05945] hover:text-[#E05945] rounded-xl py-2.5 text-xs font-medium transition flex items-center justify-center gap-2">
                <Plus size={14} /> Laporkan Insiden
              </button>
            </div>

            {/* ── SECTION 6: Log Aktivitas ── */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Activity size={15} className="text-[#1E1C43]" />
                  Log Aktivitas Operasional
                </h3>
                <div className="flex gap-1.5 flex-wrap">
                  {['semua', 'jadwal', 'kunjungan', 'insiden', 'tim', 'vendor'].map(k => (
                    <button key={k} onClick={() => setLogFilter3(k)}
                      className={`text-xs px-2.5 py-1 rounded-full capitalize transition ${logFilter3 === k ? 'bg-[#1E1C43] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {k}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative pl-4">
                {logTab3Event
                  .filter(l => logFilter3 === 'semua' || l.kategori === logFilter3)
                  .map((l, idx, arr) => (
                    <div key={l.id} className="relative mb-4 last:mb-0">
                      <div className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-[#1E1C43]" />
                      {idx < arr.length - 1 && <div className="absolute -left-[13px] top-3 w-px h-full bg-gray-200" />}
                      <p className="text-xs text-gray-400 mb-0.5">{l.waktu}</p>
                      <p className="text-xs text-gray-700">{l.teks}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded mt-1 inline-block capitalize ${
                        l.kategori === 'insiden'   ? 'bg-red-50 text-red-600' :
                        l.kategori === 'jadwal'    ? 'bg-blue-50 text-blue-600' :
                        l.kategori === 'kunjungan' ? 'bg-yellow-50 text-yellow-700' :
                        l.kategori === 'vendor'    ? 'bg-purple-50 text-purple-600' :
                        'bg-gray-50 text-gray-500'
                      }`}>{l.kategori}</span>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}

        {/* ── STICKY FOOTER ── */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] px-6 py-3 mt-4 rounded-b-xl z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              <span className="font-medium text-[#1E1C43]">{order.namaEvent}</span>{' · '}
              <span className={order.statusOrder === 'Aktif' ? 'text-green-600 font-medium' : 'text-gray-500'}>{order.statusOrder}</span>
            </span>
            <button onClick={() => navigate('/event/orders')}
              className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowLeft size={13} /> Kembali ke Orders
            </button>
          </div>
        </div>

      </div>{/* end px-6 py-6 */}

      {/* ══ MODAL: Tambah Anggota Tim ══════════════════════════════ */}
      {showTambahTim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowTambahTim(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#1E1C43]">Tambah Anggota Tim</h2>
              <button onClick={() => setShowTambahTim(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Toggle PIC / Mitra */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Sumber</p>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {['PIC', 'Mitra'].map(s => (
                    <button key={s} onClick={() => { setSumberTim(s); setSelectedSource('') }}
                      className={`flex-1 py-2 text-xs font-semibold transition ${sumberTim === s ? 'bg-[#1E1C43] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {/* Dropdown sumber */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{sumberTim === 'PIC' ? 'Pilih PIC' : 'Pilih Mitra'}</p>
                <select value={selectedSource} onChange={e => setSelectedSource(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]">
                  <option value="">-- Pilih --</option>
                  {(sumberTim === 'PIC' ? dummyEventPICs : dummyEventMitras).map(item => (
                    <option key={item.id} value={item.id}>{item.nama} — {sumberTim === 'PIC' ? item.spesialisasi : item.tipe}</option>
                  ))}
                </select>
              </div>
              {/* Peran */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Peran dalam Event</p>
                <input value={newTimPeran} onChange={e => setNewTimPeran(e.target.value)} placeholder="Contoh: Koordinator Lapangan"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
              </div>
              {/* Status */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</p>
                <select value={newTimStatus} onChange={e => setNewTimStatus(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]">
                  <option>Aktif</option><option>Standby</option><option>Tidak Aktif</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowTambahTim(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleTambahTim}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#1E1C43] text-white hover:bg-[#2d2b5e] transition">Tambah</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
