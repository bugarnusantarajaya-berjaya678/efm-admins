import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { getCompanySettings } from '../../utils/companySettings'
import { ArrowLeft, ChevronRight, Edit2, Save, X, Plus, Trash2, ChevronDown, ExternalLink, FileText, Printer, Eye, Download, CheckCircle, MapPin, Users, Calendar, ClipboardList, AlertTriangle, ImageIcon, Info, Upload, Paperclip, Lock, MessageCircle, Sparkles, Tag } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { getOrderById, addOrder, getNextOrderId } from '../../data/ppOrdersStore'
import { getKlienById, getKlienByOrderId } from '../../data/ppKlienStore'
import { getLeadById } from '../../data/ppLeadsStore'
import { getDocByOrderId } from '../../data/ppDocumentsStore'
import { TEMA_WARNA_CLS } from '../../data/ppPromoData'
import { getReceiptByOrderId } from '../../data/ppReceiptStore'
import { getAllInvoices } from '../../data/ppInvoiceStore'
import { getStoredPrograms } from '../../data/ppProgramStore'
import { PIC_DB } from '../../data/ppProgramDBData'

/* ═══════════════════════════════════════
   Constants
═══════════════════════════════════════ */
const BULAN_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

const STATUS_CLS = {
  Aktif:     'bg-green-100 text-green-700',
  Completed: 'bg-blue-100 text-blue-700',
  Pending:   'bg-yellow-100 text-yellow-700',
  Selesai:   'bg-gray-100 text-gray-600',
  Batal:     'bg-red-100 text-red-600',
  Cancelled: 'bg-red-100 text-red-600',
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

function toPaket(p) {
  const pic = PIC_DB[p.picId] || {}
  return {
    id: p.id,
    namaProgram: p.namaLatihan,
    namaPaket: p.namaPaket,
    totalSesi: p.sesi,
    frekuensi: `${p.pertemuan}x seminggu`,
    masaBerlaku: p.masa,
    hargaPaket: p.harga,
    biayaSesiPIC: p.biayaSesiPIC || 0,
    pic: {
      nama: pic.fullname || '—',
      spesialisasi: pic.spesialis || '—',
      rate: 'Rp ' + (p.biayaSesiPIC || 0).toLocaleString('id-ID') + '/sesi',
    },
    keterangan: '',
  }
}

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
const TAHAPAN_STEPS = ['Invoice', 'Agreement', 'Program Berjalan', 'Program Selesai']
const TAHAPAN_ORDER = { 'Invoice': 0, 'Agreement': 1, 'Program Berjalan': 2, 'Program Selesai': 3 }
const TAHAPAN_TO_STATUS = { 'Invoice': 'Draft', 'Agreement': 'Pending', 'Program Berjalan': 'Aktif', 'Program Selesai': 'Completed' }


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
   WA Templates — Order Context
═══════════════════════════════════════ */
const ORDER_WA_TEMPLATES = {
  'Invoice': [
    {
      id: 'owt-inv-1', tahapan: 'Invoice', judul: 'Info Invoice Program',
      teks: (o) => `Halo ${o.sapaan || ''} ${o.namaKlien},\n\nTerima kasih telah memilih program *${o.paket}* bersama EFM.\n\nInvoice untuk program Anda sudah kami siapkan. Mohon lakukan pembayaran sesuai nominal dan batas waktu yang tertera di invoice.\n\nJika ada pertanyaan mengenai tagihan atau metode pembayaran, silakan hubungi kami.\n\nTerima kasih 🙏`,
    },
    {
      id: 'owt-inv-2', tahapan: 'Invoice', judul: 'Follow-up Pembayaran',
      teks: (o) => `Halo ${o.sapaan || ''} ${o.namaKlien},\n\nKami ingin mengingatkan bahwa invoice untuk program *${o.paket}* Anda masih menunggu pembayaran.\n\nMohon segera lakukan pembayaran agar program dapat segera dijadwalkan.\n\nAda yang bisa kami bantu? 😊`,
    },
  ],
  'Agreement': [
    {
      id: 'owt-agr-1', tahapan: 'Agreement', judul: 'Konfirmasi Pembayaran Diterima',
      teks: (o) => `Halo ${o.sapaan || ''} ${o.namaKlien},\n\nPembayaran Anda untuk program *${o.paket}* telah kami terima dan dikonfirmasi ✅\n\nLangkah berikutnya adalah penandatanganan agreement program. Kami akan segera mengirimkan dokumen untuk ditandatangani.\n\nTerima kasih 🙏`,
    },
    {
      id: 'owt-agr-2', tahapan: 'Agreement', judul: 'Reminder Tanda Tangan Agreement',
      teks: (o) => `Halo ${o.sapaan || ''} ${o.namaKlien},\n\nKami mengingatkan bahwa dokumen agreement program *${o.paket}* sudah siap untuk ditandatangani.\n\nMohon luangkan waktu untuk menyelesaikan proses ini agar program latihan dapat segera dimulai 💪\n\nSilakan hubungi kami untuk jadwal penandatanganan. Terima kasih!`,
    },
    {
      id: 'owt-agr-3', tahapan: 'Agreement', judul: 'Kirim Agreement — Dokumen Ditandatangani',
      teks: (o) => `Halo ${o.sapaan || ''} ${o.namaKlien}! 🎉\n\nAgreement program *${o.paket}* Anda sudah resmi ditandatangani dan berlaku.\n\nSimpan dokumen agreement ini sebagai bukti perjanjian resmi bersama EFM. Tim kami akan segera menghubungi untuk pengaturan jadwal perdana.\n\nSelamat berlatih dan semangat mencapai target! 💪\n— Tim EFM`,
    },
  ],
  'Program Berjalan': [
    {
      id: 'owt-prg-1', tahapan: 'Program Berjalan', judul: 'Konfirmasi Jadwal Latihan',
      teks: (o) => `Halo ${o.sapaan || ''} ${o.namaKlien},\n\nSaya ${o.pic || 'tim EFM'} dari Essential Fitness Management.\n\nKami ingin mengkonfirmasi jadwal sesi latihan pribadi Anda dalam program *${o.paket}*.\n\nBisa kami minta konfirmasi jadwal yang paling nyaman untuk Anda minggu ini?\n\nTerima kasih 🙏`,
    },
    {
      id: 'owt-prg-2', tahapan: 'Program Berjalan', judul: 'Reminder Sesi Besok',
      teks: (o) => `Halo ${o.sapaan || ''} ${o.namaKlien} 👋\n\nPengingatnya — sesi latihan Anda *besok* akan segera dimulai sesuai jadwal yang telah disepakati.\n\nMohon pastikan kondisi Anda fit dan siap. Jika ada perubahan, mohon konfirmasi sesegera mungkin ya.\n\nSampai jumpa besok! 💪`,
    },
    {
      id: 'owt-prg-3', tahapan: 'Program Berjalan', judul: 'Reminder Setelah Absen',
      teks: (o) => `Halo ${o.sapaan || ''} ${o.namaKlien},\n\nKami perhatikan Anda melewatkan sesi latihan terakhir. Semoga semuanya baik-baik saja 😊\n\nYuk, segera jadwalkan ulang sesi Anda agar program *${o.paket}* tetap berjalan optimal.\n\nHubungi kami kapan saja untuk reschedule ya!`,
    },
    {
      id: 'owt-prg-4', tahapan: 'Program Berjalan', judul: 'Minta Feedback Progress',
      teks: (o) => `Halo ${o.sapaan || ''} ${o.namaKlien} 👋\n\nSudah beberapa waktu berjalan bersama program *${o.paket}*, kami ingin mendengar langsung dari Anda:\n\n• Bagaimana perkembangan yang dirasakan?\n• Ada hal yang ingin disesuaikan dari sesi latihan?\n• Apakah target Anda sudah mulai tercapai?\n\nFeedback Anda sangat berarti bagi kami. Terima kasih! 🙏`,
    },
  ],
  'Program Selesai': [
    {
      id: 'owt-sel-1', tahapan: 'Program Selesai', judul: 'Kirim Receipt — Bukti Pembayaran',
      teks: (o) => `Halo ${o.sapaan || ''} ${o.namaKlien}! 🎉\n\nProgram *${o.paket}* Anda telah selesai sepenuhnya.\n\nBerikut dokumen resmi Anda:\n📄 Agreement: ${o.noAgreement || '[No. Agreement]'}\n🧾 Receipt: ${o.noReceipt || '[No. Receipt]'}\n\nSimpan dokumen ini sebagai bukti perjanjian dan pembayaran yang sah bersama EFM.\n\nTerima kasih atas kepercayaan Anda. Semoga hasil latihan memberikan manfaat jangka panjang! 💪\n— Tim EFM`,
    },
    {
      id: 'owt-sel-2', tahapan: 'Program Selesai', judul: 'Selamat Program Selesai',
      teks: (o) => `Halo ${o.sapaan || ''} ${o.namaKlien}! 🎉\n\nSelamat — program *${o.paket}* Anda telah selesai! Kami bangga bisa menemani perjalanan fitness Anda.\n\nSemoga hasil latihan Anda terasa nyata dan memberikan manfaat jangka panjang 💪\n\nSampai jumpa di program berikutnya!`,
    },
    {
      id: 'owt-sel-3', tahapan: 'Program Selesai', judul: 'Kepuasan Layanan EFM',
      teks: (o) => `Halo ${o.sapaan || ''} ${o.namaKlien},\n\nTerima kasih telah mempercayakan program fitness Anda kepada Essential Fitness Management 💪\n\nKami ingin memastikan Anda puas dengan layanan yang diberikan. Apakah ada masukan atau saran yang bisa kami perbaiki?\n\nKepuasan Anda adalah prioritas utama kami. Salam sehat! 🙏`,
    },
    {
      id: 'owt-sel-4', tahapan: 'Program Selesai', judul: 'Tawaran Perpanjangan Program',
      teks: (o) => `Halo ${o.sapaan || ''} ${o.namaKlien},\n\nProgram *${o.paket}* Anda sudah selesai — semoga hasilnya memuaskan! 🙏\n\nJika ${o.sapaan || ''} ${o.namaKlien} tertarik untuk melanjutkan atau mencoba program lainnya, kami siap membantu menyiapkan pilihan yang sesuai.\n\nSilakan hubungi kami untuk konsultasi lebih lanjut. Terima kasih!`,
    },
  ],
}

const TAHAPAN_WA_CLS = {
  'Invoice':          'bg-amber-100 text-amber-700',
  'Agreement':        'bg-blue-100 text-blue-700',
  'Program Berjalan': 'bg-green-100 text-green-700',
  'Program Selesai':  'bg-gray-100 text-gray-500',
}

/* ═══════════════════════════════════════
   Small reusable components
═══════════════════════════════════════ */
function Badge({ children, cls }) {
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
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
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
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

function TahapanStepper({ currentTahapan }) {
  const currentIdx = TAHAPAN_ORDER[currentTahapan] ?? 0
  return (
    <div className="flex items-start">
      {TAHAPAN_STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx
        const isCurrent   = idx === currentIdx
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${isCompleted ? 'bg-[#1E1C43] text-white' : isCurrent ? 'bg-[#E05945] text-white' : 'bg-gray-100 text-gray-400'}`}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <p className={`text-xs mt-1 text-center leading-tight
                ${isCurrent ? 'font-bold text-[#E05945]' : isCompleted ? 'font-medium text-[#1E1C43]' : 'text-gray-400'}`}>
                {step}
              </p>
            </div>
            {idx < TAHAPAN_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 -mt-4 ${isCompleted ? 'bg-[#1E1C43]' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function OrderTemplateCard({ template, orderCtx, onKirim }) {
  const [showPreview, setShowPreview] = useState(false)
  const teks = template.teks(orderCtx)
  return (
    <div className="border border-gray-100 rounded-xl p-3.5 hover:border-gray-200 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{template.judul}</p>
          {showPreview
            ? <p className="text-xs text-gray-500 mt-1.5 whitespace-pre-line leading-relaxed">{teks}</p>
            : <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{teks.substring(0, 70)}…</p>
          }
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <button
            onClick={() => setShowPreview(p => !p)}
            className="h-7 px-2.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {showPreview ? 'Tutup' : 'Preview'}
          </button>
          <button
            onClick={() => onKirim(template)}
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#25D366] hover:bg-[#1DA851] text-white text-xs font-medium transition-colors"
          >
            <MessageCircle size={11} /> Kirim WA
          </button>
        </div>
      </div>
    </div>
  )
}

function TahapanBadge({ tahapan }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TAHAPAN_WA_CLS[tahapan] ?? 'bg-gray-100 text-gray-600'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {tahapan}
    </span>
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
  const linkedInv = !isNew ? (getAllInvoices().find(i => i.orderId === order?.id) ?? null) : null
  const linkedRcp = !isNew ? (getReceiptByOrderId(order?.id) ?? null) : null

  /* ── Section state ───────────────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState(fromState?.defaultTab || 'keuangan')
  const [editingSection, setEditingSection] = useState(isNew ? 'infoDeal' : null)
  // null | 'infoDeal' | 'quotation' | 'paymentTerms' | 'profitSharing'

  /* Section 1 — Info Deal */
  const initInfo = order
    ? {
        namaKlien:         order.namaKlien         || '',
        sapaan:            order.sapaan            || '',
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

  const ppPrograms = getStoredPrograms().map(toPaket)

  // Integrated klien data — lookup via ORDER_TO_KLIEN_ID map, fallback ke klienIds field
  const _klienFromMap = getKlienByOrderId(id)
  const resolvedKlienList = _klienFromMap
    ? [_klienFromMap]
    : (order?.klienIds || []).map(kId => getKlienById(kId)).filter(Boolean)
  const hasKlienIds = resolvedKlienList.length > 0
  const liveLead = order?.leadId ? getLeadById(order.leadId) : null
  const liveHubungan = liveLead?.hubunganDenganKlien || infoDeal.hubunganKlien || 'Diri Sendiri'

  const initProgram = ppPrograms.find(p => p.id === (order?.programId || ''))
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
    { id:"ABS-001", jadwalId:"JS-001", tanggal:"2026-10-13", jam:"07:02", lokasi:"Hampton's Park Tower A, Lt. 12", device:"iPhone 14 - Safari",         fotoUrl:"https://drive.google.com/file/d/1A2Bk9XRA5nFMdKvBdBZjgm001ptlbs/view?usp=drive_link", catatanKoreksi:"" },
    { id:"ABS-002", jadwalId:"JS-002", tanggal:"2026-10-15", jam:"06:59", lokasi:"Hampton's Park Tower A, Lt. 12", device:"Samsung Galaxy S24 - Chrome", fotoUrl:"https://drive.google.com/file/d/1A2Bk9XRA5nFMdKvBdBZjgm002ptlbs/view?usp=drive_link", catatanKoreksi:"" },
    { id:"ABS-003", jadwalId:"JS-003", tanggal:"2026-10-17", jam:"07:04", lokasi:"Hampton's Park Tower A, Lt. 12", device:"iPhone 14 - Safari",         fotoUrl:"https://drive.google.com/file/d/1A2Bk9XRA5nFMdKvBdBZjgm003ptlbs/view?usp=drive_link", catatanKoreksi:"" },
    { id:"ABS-004", jadwalId:"JS-004", tanggal:"2026-10-20", jam:"07:01", lokasi:"Hampton's Park Tower A, Lt. 12", device:"iPhone 14 - Safari",         fotoUrl:"https://drive.google.com/file/d/1A2Bk9XRA5nFMdKvBdBZjgm004ptlbs/view?usp=drive_link", catatanKoreksi:"" },
    { id:"ABS-005", jadwalId:"JS-005", tanggal:"2026-10-22", jam:"07:00", lokasi:"Hampton's Park Tower A, Lt. 12", device:"Samsung Galaxy S24 - Chrome", fotoUrl:"https://drive.google.com/file/d/1A2Bk9XRA5nFMdKvBdBZjgm005ptlbs/view?usp=drive_link", catatanKoreksi:"" },
    { id:"ABS-006", jadwalId:"JS-006", tanggal:"2026-10-24", jam:"07:03", lokasi:"Hampton's Park Tower A, Lt. 12", device:"iPhone 13 - Safari",         fotoUrl:"https://drive.google.com/file/d/1A2Bk9XRA5nFMdKvBdBZjgm006ptlbs/view?usp=drive_link", catatanKoreksi:"" },
    { id:"ABS-007", jadwalId:"JS-007", tanggal:"2026-10-27", jam:"07:03", lokasi:"Hampton's Park Tower A, Lt. 12", device:"iPhone 14 - Safari",         fotoUrl:"https://drive.google.com/file/d/1A2Bk9XRA5nFMdKvBdBZjgm007ptlbs/view?usp=drive_link", catatanKoreksi:"" },
    { id:"ABS-008", jadwalId:"JS-008", tanggal:"2026-10-29", jam:"07:01", lokasi:"Hampton's Park Tower A, Lt. 12", device:"Samsung Galaxy S24 - Chrome", fotoUrl:"https://drive.google.com/file/d/1A2Bk9XRA5nFMdKvBdBZjgm008ptlbs/view?usp=drive_link", catatanKoreksi:"" },
    { id:"ABS-009", jadwalId:"JS-009", tanggal:"2026-10-31", jam:"06:58", lokasi:"Hampton's Park Tower A, Lt. 12", device:"iPhone 14 - Safari",         fotoUrl:"https://drive.google.com/file/d/1A2Bk9XRA5nFMdKvBdBZjgm009ptlbs/view?usp=drive_link", catatanKoreksi:"" },
    { id:"ABS-010", jadwalId:"JS-010", tanggal:"2026-11-03", jam:"07:05", lokasi:"Hampton's Park Tower A, Lt. 12", device:"iPhone 13 - Safari",         fotoUrl:null,                                                                                       catatanKoreksi:"" },
    { id:"ABS-011", jadwalId:"JS-011", tanggal:"2026-11-05", jam:"07:02", lokasi:"Hampton's Park Tower A, Lt. 12", device:"iPhone 14 - Safari",         fotoUrl:"https://drive.google.com/file/d/1A2Bk9XRA5nFMdKvBdBZjgm011ptlbs/view?usp=drive_link", catatanKoreksi:"" },
    { id:"ABS-012", jadwalId:"JS-012", tanggal:"2026-11-07", jam:"07:00", lokasi:"Hampton's Park Tower A, Lt. 12", device:"Samsung Galaxy S24 - Chrome", fotoUrl:"https://drive.google.com/file/d/1A2Bk9XRA5nFMdKvBdBZjgm012ptlbs/view?usp=drive_link", catatanKoreksi:"" },
  ])
  const [logTab3PP, setLogTab3PP] = useState(() => {
    try {
      const saved = localStorage.getItem(`order-log3-${id}`)
      if (saved) return JSON.parse(saved)
    } catch {}
    const namaKlien = order?.namaKlien || 'Klien'
    const picNama   = order?.picSalesEFM || 'Admin EFM'
    const invId     = 'INV-' + id
    const agrId     = 'AGR-' + id
    const quoNomor  = order?.quotation?.nomor || ('QUO/EFM/PP/2026/' + id.split('-').pop())
    return [
      { id:1,  waktu:"7 Nov 2026, 07:00",   actor:picNama,     kategori:"absensi",   nomorLaporan:"ABS-012",  teks:`Absensi ABS-012 tercatat: ${picNama} hadir 07:00` },
      { id:2,  waktu:"5 Nov 2026, 07:02",   actor:picNama,     kategori:"absensi",   nomorLaporan:"ABS-011",  teks:`Absensi ABS-011 tercatat: ${picNama} hadir 07:02` },
      { id:3,  waktu:"3 Nov 2026, 07:05",   actor:picNama,     kategori:"absensi",   nomorLaporan:"ABS-010",  teks:`Absensi ABS-010 tercatat: ${picNama} — no foto, perlu verifikasi` },
      { id:4,  waktu:"31 Okt 2026, 06:58",  actor:picNama,     kategori:"absensi",   nomorLaporan:"ABS-009",  teks:`Absensi ABS-009 tercatat: ${picNama} hadir 06:58` },
      { id:5,  waktu:"29 Okt 2026, 07:01",  actor:picNama,     kategori:"absensi",   nomorLaporan:"ABS-008",  teks:`Absensi ABS-008 tercatat: ${picNama} hadir 07:01` },
      { id:6,  waktu:"27 Okt 2026, 07:03",  actor:picNama,     kategori:"absensi",   nomorLaporan:"ABS-007",  teks:`Absensi ABS-007 tercatat: ${picNama} hadir 07:03` },
      { id:7,  waktu:"24 Okt 2026, 07:03",  actor:picNama,     kategori:"absensi",   nomorLaporan:"ABS-006",  teks:`Absensi ABS-006 tercatat: ${picNama} hadir 07:03` },
      { id:8,  waktu:"22 Okt 2026, 07:00",  actor:picNama,     kategori:"absensi",   nomorLaporan:"ABS-005",  teks:`Absensi ABS-005 tercatat: ${picNama} hadir 07:00` },
      { id:9,  waktu:"20 Okt 2026, 07:01",  actor:picNama,     kategori:"absensi",   nomorLaporan:"ABS-004",  teks:`Absensi ABS-004 tercatat: ${picNama} hadir 07:01` },
      { id:10, waktu:"17 Okt 2026, 07:04",  actor:picNama,     kategori:"absensi",   nomorLaporan:"ABS-003",  teks:`Absensi ABS-003 tercatat: ${picNama} hadir 07:04` },
      { id:11, waktu:"15 Okt 2026, 06:59",  actor:picNama,     kategori:"absensi",   nomorLaporan:"ABS-002",  teks:`Absensi ABS-002 tercatat: ${picNama} hadir 06:59` },
      { id:12, waktu:"13 Okt 2026, 07:02",  actor:picNama,     kategori:"absensi",   nomorLaporan:"ABS-001",  teks:`Absensi ABS-001 tercatat: ${picNama} hadir 07:02` },
      { id:13, waktu:"12 Okt 2026, 09:00",  actor:"Admin EFM", kategori:"keuangan",  nomorLaporan:invId,      teks:`Pembayaran ${invId} dikonfirmasi Lunas — Transfer · 12 Okt 2026` },
      { id:14, waktu:"12 Okt 2026, 08:00",  actor:"Admin EFM", kategori:"keuangan",  nomorLaporan:invId,      teks:`Invoice ${invId} dikirim ke ${namaKlien}` },
      { id:15, waktu:"9 Okt 2026, 14:00",   actor:"Admin EFM", kategori:"agreement", nomorLaporan:agrId,      teks:`Agreement disetujui — dokumen TTD klien ${namaKlien} diterima & dikonfirmasi` },
      { id:16, waktu:"9 Okt 2026, 13:30",   actor:namaKlien,   kategori:"agreement", nomorLaporan:agrId,      teks:`Agreement ditandatangani klien ${namaKlien} — pengajuan masuk` },
      { id:17, waktu:"7 Okt 2026, 10:00",   actor:"Admin EFM", kategori:"keuangan",  nomorLaporan:quoNomor,   teks:`Quotation ${quoNomor} disetujui` },
      { id:18, waktu:"7 Okt 2026, 07:30",   actor:"Admin EFM", kategori:"keuangan",  nomorLaporan:id,         teks:`Order ${id} dibuat untuk ${namaKlien} oleh Admin EFM` },
    ]
  })
  const [editingAbsensi,        setEditingAbsensi]        = useState(null)
  const [showTambahAbsensiManual, setShowTambahAbsensiManual] = useState(false)
  const [tahapanState,          setTahapanState]          = useState(order?.tahapan || 'Invoice')
  const [statusOrderState,      setStatusOrderState]      = useState(order?.statusOrder || 'Aktif')
  const [editingTahapan,        setEditingTahapan]        = useState(false)
  const [newTahapanVal,         setNewTahapanVal]         = useState(tahapanState)
  const [newTahapanTanggal,     setNewTahapanTanggal]     = useState('')
  const [newTahapanCatatan,     setNewTahapanCatatan]     = useState('')


  const [rincianDraft,          setRincianDraft]          = useState(order?.rincianLayanan || [])

  const subtotalPP = rincianDraft.reduce((s, i) => s + (i.total || 0), 0)
  const formatRpPP = (val) => 'Rp ' + Math.round(val || 0).toLocaleString('id-ID')

  /* ── WA Komunikasi ───────────────────────────────────────────────────────── */
  const [waLog,              setWaLog]              = useState(() => {
    try {
      const saved = localStorage.getItem(`order-wa-log-${id}`)
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })
  const [showAllWaTemplates, setShowAllWaTemplates] = useState(false)
  const [logFilter, setLogFilter] = useState('semua')
  const [showUploadHon, setShowUploadHon] = useState(false)
  const [honFile, setHonFile] = useState(null)
  const [honPreview, setHonPreview] = useState(null)
  const [honTglBayar, setHonTglBayar] = useState('')
  const honFileRef = useRef(null)

  const orderCtx = {
    namaKlien:   infoDeal.namaKlien || '',
    sapaan:      infoDeal.sapaan    || '',
    paket:       infoDeal.paket     || order?.paket || '',
    pic:         infoDeal.pic       || order?.picSalesEFM || '',
    noHP:        infoDeal.noHP      || infoDeal.noHPKlien || '',
    tahapan:     tahapanState,
    noAgreement: agrDoc?.id          || '',
    noReceipt:   linkedRcp?.rcpNo    || '',
  }

  useEffect(() => {
    try { localStorage.setItem(`order-wa-log-${id}`, JSON.stringify(waLog)) } catch {}
  }, [waLog, id])

  function handleKirimWA(template) {
    const teks = template.teks(orderCtx)
    const nomorBersih = (orderCtx.noHP || '').replace(/^0/, '').replace(/\D/g, '')
    window.open(`https://wa.me/62${nomorBersih}?text=${encodeURIComponent(teks)}`, '_blank')
    const now = new Date()
    const timestamp = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    setWaLog(prev => [...prev, {
      id: `WAL-${String(prev.length + 1).padStart(3, '0')}`,
      timestamp,
      judul: template.judul,
      tahapan: template.tahapan,
      kirimOleh: orderCtx.pic || 'Admin EFM',
      nomorTujuan: orderCtx.noHP,
    }])
  }

  useEffect(() => {
    const label = isNew ? 'Order Baru' : (order?.namaKlien || id)
    setCrumbs(['Private Program', 'Orders', label])
    return () => setCrumbs(null)
  }, [isNew, order?.namaKlien, id])

  useEffect(() => {
    try { localStorage.setItem(`order-log3-${id}`, JSON.stringify(logTab3PP)) } catch {}
  }, [logTab3PP, id])

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

  const programTerkait = order ? ppPrograms.find((s) => s.id === order.programId) : null
  const filteredPrograms = programSearch
    ? ppPrograms.filter(p =>
        p.id.toLowerCase().includes(programSearch.toLowerCase()) ||
        p.namaPaket.toLowerCase().includes(programSearch.toLowerCase()) ||
        p.namaProgram.toLowerCase().includes(programSearch.toLowerCase())
      )
    : ppPrograms

  /* ── Edit handlers ───────────────────────────────────────────────────────── */
  function startEdit(section) {
    if (editingSection && editingSection !== section) return
    setEditingSection(section)
    if (section === 'infoDeal') {
      setInfoDraft({ ...infoDeal })
      setItemsDraft(lineItems.map(li => ({ ...li })))
      const prog = ppPrograms.find(p => p.id === infoDeal.programId)
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
    const prog = ppPrograms.find(p => p.id === infoDraft.programId)
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
      statusOrder: infoDraft.statusOrder || 'Draft',
      tahapan: infoDraft.tahapan || 'Invoice',
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
        <div className="flex items-start justify-between gap-4 flex-wrap">

          {/* LEFT: Avatar + Info */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
              style={{ background: getAvatarColor(order.namaKlien) }}
            >
              {getInitials(order.namaKlien)}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{isNew ? 'PP-DRAFT' : order.id}</p>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">{isNew ? 'Order Baru' : order.namaKlien}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge cls="bg-purple-100 text-purple-700">{order.paket || '—'}</Badge>
                <Badge cls={STATUS_CLS[statusOrderState] ?? 'bg-gray-100 text-gray-600'}>● {statusOrderState}</Badge>
                <span className="text-xs text-gray-400">Mulai {order.tanggalMulai ? fmtDate(order.tanggalMulai) : '—'}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Action buttons only */}
          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            {!isNew && (
              <button
                onClick={() => { setEditingTahapan(p => !p); setNewTahapanVal(tahapanState) }}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#1E1C43] text-[#1E1C43] text-xs font-semibold hover:bg-[#1E1C43] hover:text-white transition-colors"
              >
                <Edit2 size={12} /> Update Tahapan
              </button>
            )}
            <button
              onClick={() =>
                fromState?.fromLeadId ? navigate('/pp/leads/' + fromState.fromLeadId) :
                fromState?.fromKlienId ? navigate('/pp/klien/' + fromState.fromKlienId) :
                navigate('/pp/orders')
              }
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={12} /> {fromState?.fromLeadId ? 'Kembali ke Lead' : fromState?.fromKlienId ? 'Kembali ke Klien' : 'Kembali'}
            </button>
          </div>
        </div>

        {/* Tahapan Stepper — full width below divider */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <TahapanStepper currentTahapan={tahapanState} />

          {/* Inline edit form */}
          {editingTahapan && (
            <div className="border-t border-gray-100 pt-4 mt-3">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tahapan Baru</label>
                    <select value={newTahapanVal} onChange={e => setNewTahapanVal(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]">
                      {TAHAPAN_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tanggal</label>
                    <input type="date" value={newTahapanTanggal} onChange={e => setNewTahapanTanggal(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Catatan</label>
                  <input type="text" value={newTahapanCatatan} onChange={e => setNewTahapanCatatan(e.target.value)}
                    placeholder="Catatan perubahan tahapan, kondisi deal, penawaran khusus..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]" />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => setEditingTahapan(false)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                    <X size={12} /> Batal
                  </button>
                  <button
                    onClick={() => {
                      if (!newTahapanVal || newTahapanVal === tahapanState) { setEditingTahapan(false); return }
                      const prevTahapan = tahapanState
                      const newStatus   = TAHAPAN_TO_STATUS[newTahapanVal] || statusOrderState
                      setTahapanState(newTahapanVal)
                      setStatusOrderState(newStatus)
                      setLogTab3PP(prev => [{
                        id: Date.now(),
                        waktu: fmtLogWaktu(),
                        actor: 'Admin EFM',
                        kategori: 'status',
                        nomorLaporan: order.id,
                        teks: `Tahapan diubah: ${prevTahapan} → ${newTahapanVal} · Status: ${newStatus}${newTahapanCatatan ? ' — ' + newTahapanCatatan : ''}`
                      }, ...prev])
                      setEditingTahapan(false)
                      setNewTahapanCatatan('')
                      setNewTahapanTanggal('')
                    }}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                    <Save size={12} /> Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl shadow-sm p-1 mb-5 overflow-x-auto">
        {[
          { key: 'keuangan',    label: 'Overview',               locked: false },
          { key: 'operasional', label: 'Operasional Lapangan', locked: isNew },
          { key: 'wa',          label: 'Komunikasi WA',         locked: isNew },
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


          {/* ── Dokumen & Tahapan Shortcuts ── */}
          {!isNew && (() => {
            const INV_STATUS = { paid: { label: 'Lunas', cls: 'bg-green-50 text-green-700 border-green-200' }, pending: { label: 'Menunggu', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' }, overdue: { label: 'Jatuh Tempo', cls: 'bg-red-50 text-red-700 border-red-200' } }
            const AGR_STATUS = { pending: { label: 'Pending TTD', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' }, signed: { label: 'Ditandatangani', cls: 'bg-green-50 text-green-700 border-green-200' }, 'waiting-approval': { label: 'Menunggu Approval', cls: 'bg-blue-50 text-blue-700 border-blue-200' }, expired: { label: 'Kadaluarsa', cls: 'bg-gray-50 text-gray-500 border-gray-200' } }
            const tahapan = [
              {
                step: 1, label: 'Invoice',
                docId: linkedInv?.invNo ?? null,
                badge: linkedInv ? (INV_STATUS[linkedInv.status] ?? { label: linkedInv.status, cls: 'bg-gray-50 text-gray-500 border-gray-200' }) : null,
                onClick: linkedInv ? () => navigate('/pp/invoice/' + linkedInv.invNo, { state: { fromOrderId: order.id } }) : null,
              },
              {
                step: 2, label: 'Receipt',
                docId: linkedRcp?.rcpNo ?? null,
                badge: linkedRcp ? { label: 'Lunas', cls: 'bg-green-50 text-green-700 border-green-200' } : null,
                onClick: linkedRcp ? () => navigate('/pp/receipt/' + linkedRcp.rcpNo, { state: { fromOrderId: order.id } }) : null,
              },
              {
                step: 3, label: 'Agreement',
                docId: agrDoc?.id ?? null,
                badge: agrDoc ? (AGR_STATUS[agrDoc.statusTtd] ?? { label: agrDoc.statusTtd, cls: 'bg-gray-50 text-gray-500 border-gray-200' }) : null,
                onClick: agrDoc ? () => navigate('/pp/agreement/' + agrDoc.id, { state: { fromOrderId: order.id } }) : null,
              },
            ]
            return (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Dokumen & Tahapan</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {tahapan.map(({ step, label, docId, badge, onClick }) => (
                    <div
                      key={step}
                      onClick={onClick ?? undefined}
                      className={`flex flex-col gap-2 p-3 rounded-xl border transition-colors
                        ${onClick ? 'border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer group' : 'border-dashed border-gray-200 bg-white'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                          ${docId ? 'bg-[#1E1C43] text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {step}
                        </div>
                        {onClick && <ExternalLink size={11} className="text-gray-300 group-hover:text-[#1E1C43] transition-colors shrink-0" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                        <p className={`text-xs font-semibold truncate leading-tight ${docId ? 'text-[#1E1C43]' : 'text-gray-300'}`}>
                          {docId ?? '—'}
                        </p>
                      </div>
                      {badge
                        ? <span className={`self-start px-2 py-0.5 rounded-full text-xs font-medium border ${badge.cls}`}>{badge.label}</span>
                        : <span className="self-start text-xs text-gray-300 italic">Belum tersedia</span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* ── Card: Data Klien ── */}
          {!isNew && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Data Klien</h3>
                  <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                    <Lock size={9} /> {hasKlienIds ? 'Data dari Klien Store' : 'Nama & Kontak dari Leads'}
                  </span>
                </div>
                {/* Edit button hanya untuk order lama (tanpa klienIds) */}
                {!hasKlienIds && (
                  editingSection === 'dataKlienTambahan' ? (
                    <div className="flex gap-2">
                      <button onClick={cancelEdit} className="h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50">Batal</button>
                      <button onClick={saveDataKlienTambahan} className="h-8 px-3 rounded-lg bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-xs font-semibold">Simpan</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit('dataKlienTambahan')}
                      disabled={!!editingSection && editingSection !== 'dataKlienTambahan'}
                      className="h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Edit Info Tambahan
                    </button>
                  )
                )}
              </div>
              <div className="p-5">
                {/* Pendaftar — RRP card → Lead Detail */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pendaftar</p>
                  {order?.leadId ? (
                    <div
                      onClick={() => navigate('/pp/leads/' + order.leadId)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#1E1C43]/10 flex items-center justify-center shrink-0">
                          <Users size={14} className="text-[#1E1C43]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1E1C43] truncate">{order.leadId} — {infoDeal.namaKlien}</p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {[infoDeal.noHP, infoDeal.email].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>
                      <ExternalLink size={13} className="text-gray-300 group-hover:text-[#1E1C43] transition-colors shrink-0" />
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Data lead tidak tersedia.</p>
                  )}
                </div>

                {/* Klien Latihan */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Klien Latihan</p>

                  {hasKlienIds ? (
                    /* ── RRP: kartu per-klien, klik → Lead Detail ── */
                    <div className="flex flex-col gap-2">
                      {resolvedKlienList.length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-4">Data klien tidak ditemukan di store.</p>
                      ) : (
                        resolvedKlienList.map(k => {
                          const usiaTahun = k.tanggalLahir ? (() => {
                            const d = new Date(k.tanggalLahir)
                            const today = new Date()
                            return today.getFullYear() - d.getFullYear() - (today < new Date(today.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0)
                          })() : null
                          return (
                            <div
                              key={k.id}
                              onClick={() => navigate('/pp/leads/' + k.leadId)}
                              className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-[#1E1C43]/10 flex items-center justify-center shrink-0">
                                  <Users size={14} className="text-[#1E1C43]" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-[#1E1C43] truncate">{k.id} — {k.nama}</p>
                                  <p className="text-[10px] text-gray-400 truncate">
                                    {[k.jenisKelamin, usiaTahun !== null ? usiaTahun + ' tahun' : null, k.noHp].filter(Boolean).join(' · ')}
                                  </p>
                                </div>
                              </div>
                              <ExternalLink size={13} className="text-gray-300 group-hover:text-[#1E1C43] transition-colors shrink-0" />
                            </div>
                          )
                        })
                      )}
                    </div>
                  ) : (
                    /* ── Legacy view: flat fields dari order (order lama) ── */
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Nama Klien',   val: infoDeal.namaKlienLatihan || infoDeal.namaKlien },
                        { label: 'No. HP Klien', val: infoDeal.noHPKlien        || infoDeal.noHP      },
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
                            className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#1E1C43] bg-white"
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
                            className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#1E1C43] bg-white"
                          >
                            {['Laki-laki','Perempuan'].map(o => <option key={o}>{o}</option>)}
                          </select>
                        ) : (
                          <p className="text-sm font-semibold text-gray-800">{infoDeal.jenisKelaminKlien || '—'}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-start gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
                  <Info size={11} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700">
                    {hasKlienIds
                      ? 'Data klien diambil langsung dari Klien Store — untuk mengubah, edit melalui halaman Lead / Klien.'
                      : 'Sapaan, Nama, No. HP, dan Email dikunci karena bersumber dari data Leads. Hubungan dengan Klien, Usia, dan Jenis Kelamin dapat diubah jika ada kesalahan input.'
                    }
                  </p>
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
                <button onClick={() => startEdit('infoDeal')} className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">
                  <Edit2 size={12} /> Edit
                </button>
              )}
            </div>
            <div className="p-5">

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
                        const prog = ppPrograms.find(p => p.id === infoDraft.programId)
                        if (prog) setProgramSearch(`${prog.id} — ${prog.namaPaket}`)
                      }, 150)}
                      placeholder="Ketik ID program atau nama paket..."
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#1E1C43] bg-white pr-8" />
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
                            <span className="text-xs font-semibold text-[#1E1C43] bg-[#1E1C43]/10 px-1.5 py-0.5 rounded">{prog.id}</span>
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
                  ? (ppPrograms.find(p => p.id === infoDraft.programId) || programTerkait)
                  : programTerkait
                return stripProg ? (
                  <div className="bg-gray-50 rounded-xl p-4 mb-3">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 font-mono mb-0.5">{stripProg.id}</p>
                        <p className="text-sm font-bold text-[#1E1C43]">
                          {stripProg.namaProgram}
                          <span className="font-normal text-gray-500"> · {stripProg.namaPaket}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="text-sm font-bold text-[#1E1C43]">{formatRpPP(stripProg.hargaPaket)}</p>
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
                      <div className="w-6 h-6 rounded-full bg-[#1E1C43] text-white text-xs font-semibold flex items-center justify-center shrink-0">
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
                            className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#1E1C43]" />
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
                            className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#1E1C43]" />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Harga (Rp)</label>
                          <input type="number" value={item.harga ?? (item.total / Math.max(1, item.jumlah || 1))} min="0"
                            onChange={e => setRincianDraft(prev => prev.map((it, i) => {
                              if (i !== idx + 1) return it
                              const harga = Number(e.target.value)
                              return { ...it, harga, total: (it.jumlah ?? 1) * harga }
                            }))}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#1E1C43]" />
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

              {/* Tema promo banner */}
              {order.promoTema && (() => {
                const t = order.promoTema
                const cls = TEMA_WARNA_CLS[t.warna] || 'bg-gray-50 text-gray-600 border-gray-200'
                return (
                  <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border mt-3 ${cls}`}>
                    <Sparkles size={13} className="shrink-0" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold">{t.icon} Promo Tematik: {t.nama}</span>
                      {t.berlakuHingga && <span className="text-[10px] opacity-70">· berlaku s/d {t.berlakuHingga}</span>}
                    </div>
                  </div>
                )
              })()}

              {/* Promo kode + diskon rows */}
              {order.nilaiDiskon > 0 && (
                <div className="border border-gray-100 rounded-xl px-3 py-2.5 mt-3 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Subtotal</span>
                    <span className="text-xs font-semibold text-gray-700">{formatRpPP(subtotalPP)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-xs text-green-700">
                      <Tag size={11} />
                      Diskon Promo
                      {order.promoKode && <span className="bg-green-100 px-1.5 py-0.5 rounded font-mono font-semibold">{order.promoKode}</span>}
                    </span>
                    <span className="text-xs font-semibold text-green-700">−{formatRpPP(order.nilaiDiskon)}</span>
                  </div>
                </div>
              )}

              {/* Bonus promo info */}
              {order.promoBenefitBonus && !order.nilaiDiskon && (
                <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-3">
                  <Tag size={12} className="text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-green-700">
                      Promo Bonus
                      {order.promoKode && <span className="font-mono ml-1">({order.promoKode})</span>}
                    </p>
                    <p className="text-[10px] text-green-600 mt-0.5">{order.promoBenefitBonus}</p>
                  </div>
                </div>
              )}

              <div className="bg-[#1E1C43] rounded-xl px-4 py-3 flex justify-between items-center mt-3">
                <span className="text-sm font-medium text-white/80">
                  {order.nilaiDiskon > 0 ? 'Total Setelah Promo' : 'Total Nilai Order'}
                </span>
                <span className="text-sm font-bold text-white">
                  {formatRpPP(order.nilaiDiskon > 0 ? (order.nilaiKontrak ?? subtotalPP - order.nilaiDiskon) : subtotalPP)}
                </span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Jam Latihan</p>
                    {editingSection === 'infoDeal' ? (
                      <input type="time" value={infoDraft.jamLatihan || ''} onChange={e => setInfoDraft(p => ({...p, jamLatihan: e.target.value}))}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#1E1C43] bg-white" />
                    ) : (
                      <p className="text-sm font-semibold text-gray-800">{infoDeal.jamLatihan || order.jamLatihan || '—'}{(infoDeal.jamLatihan || order.jamLatihan) ? ' WIB' : ''}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tanggal Mulai</p>
                    {editingSection === 'infoDeal' ? (
                      <input type="date" value={infoDraft.tanggalMulai || ''} onChange={e => setInfoDraft(p => ({...p, tanggalMulai: e.target.value}))}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#1E1C43] bg-white" />
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
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#1E1C43] bg-white" />
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">{infoDeal.lokasiLatihan || order.lokasiLatihan || '—'}</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Link Google Maps</p>
                  {editingSection === 'infoDeal' ? (
                    <input type="text" value={infoDraft.linkMaps || ''} placeholder="https://maps.google.com/..."
                      onChange={e => setInfoDraft(p => ({...p, linkMaps: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#1E1C43] bg-white" />
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



        {(() => {
          const LOG_FILTERS = [
            { key: 'semua',     label: 'Semua' },
            { key: 'status',    label: 'Status' },
            { key: 'keuangan',  label: 'Keuangan' },
            { key: 'agreement', label: 'Agreement' },
            { key: 'jadwal',    label: 'Jadwal' },
            { key: 'absensi',   label: 'Absensi' },
          ]
          const logs = logFilter === 'semua'
            ? logTab3PP
            : logTab3PP.filter(l => l.kategori === logFilter)
          return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Riwayat Aktivitas</h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {LOG_FILTERS.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setLogFilter(f.key)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors border ${
                        logFilter === f.key
                          ? 'bg-[#1E1C43] text-white border-[#1E1C43]'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                  <span className="text-xs text-gray-400 ml-1">{logs.length} entri</span>
                </div>
              </div>
              <div className="p-5">
                {logs.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-4">Belum ada riwayat.</p>
                ) : (
                  <div className="space-y-0 pl-4 relative">
                    {logs.map((l, idx, arr) => (
                      <div key={l.id} className="relative pb-4 last:pb-0">
                        <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-[#E05945]" />
                        {idx < arr.length - 1 && <div className="absolute -left-[13px] top-3 w-px bottom-0 bg-gray-200" />}
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <p className="text-xs text-gray-400">{l.waktu}</p>
                          {l.actor && <p className="text-xs text-gray-500 font-medium">· {l.actor}</p>}
                          {l.nomorLaporan && (
                            <span className="text-xs bg-[#1E1C43]/10 text-[#1E1C43] px-1.5 py-0.5 rounded font-mono">
                              {l.nomorLaporan}
                            </span>
                          )}
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            l.kategori === 'keuangan'  ? 'bg-teal-50 text-teal-600'    :
                            l.kategori === 'status'    ? 'bg-purple-50 text-purple-600' :
                            l.kategori === 'agreement' ? 'bg-indigo-50 text-indigo-600' :
                            'bg-gray-50 text-gray-500'
                          }`}>{l.kategori}</span>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed">{l.teks}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        </>
      )}



      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2 — Operasional Sesi (PP)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'operasional' && (
        <div className="space-y-4">

          {/* ── Section: Dokumen Operasional ── */}
          {(() => {
            const stored = (() => { try { return JSON.parse(localStorage.getItem(`rekap-pp-${id}`)) || {} } catch { return {} } })()
            const rStt = stored.status || 'belum_diajukan'
            const isUnlocked = rStt === 'dikonfirmasi'
            const hasBukti = !!stored.buktiBayarNama
            const REKAP_CLS = {
              belum_diajukan:  'bg-gray-50 text-gray-500 border-gray-200',
              pengajuan_masuk: 'bg-yellow-50 text-yellow-700 border-yellow-200',
              dikonfirmasi:    'bg-green-50 text-green-700 border-green-200',
              ditolak:         'bg-red-50 text-red-700 border-red-200',
            }
            const REKAP_LABEL = { belum_diajukan: 'Belum Diajukan', pengajuan_masuk: 'Pengajuan Masuk', dikonfirmasi: 'Dikonfirmasi', ditolak: 'Ditolak' }
            const rekapId = 'RKP-' + id
            return (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Dokumen Operasional</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Card 1: Rekap Absensi */}
                  <div
                    onClick={() => navigate('/pp/orders/rekap/' + id, { state: { absensiSesi, orderId: id } })}
                    className="flex flex-col gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#1E1C43] text-white shrink-0">1</div>
                      <ExternalLink size={11} className="text-gray-300 group-hover:text-[#1E1C43] transition-colors shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Rekap Absensi</p>
                      <p className="text-xs font-semibold text-[#1E1C43] truncate leading-tight">{rekapId}</p>
                    </div>
                    <span className={`self-start px-2 py-0.5 rounded-full text-xs font-medium border ${REKAP_CLS[rStt] || REKAP_CLS.belum_diajukan}`}>
                      {REKAP_LABEL[rStt] || 'Belum Diajukan'}
                    </span>
                  </div>

                  {/* Card 2: Bukti Honorarium */}
                  {isUnlocked ? (
                    hasBukti ? (
                      <div
                        onClick={() => navigate('/pp/orders/rekap/' + id, { state: { absensiSesi, orderId: id } })}
                        className="flex flex-col gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#1E1C43] text-white shrink-0">2</div>
                          <ExternalLink size={11} className="text-gray-300 group-hover:text-[#1E1C43] transition-colors shrink-0" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Bukti Honorarium</p>
                          <p className="text-xs font-semibold text-[#1E1C43] truncate leading-tight">{stored.buktiBayarNama}</p>
                          {stored.tglBayar && <p className="text-[10px] text-gray-400 mt-0.5">{stored.tglBayar}</p>}
                        </div>
                        <span className="self-start px-2 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">Sudah Dibayar</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 p-3 rounded-xl border border-dashed border-gray-200 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100 text-gray-400 shrink-0">2</div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Bukti Honorarium</p>
                          <p className="text-xs text-gray-300 italic leading-tight">Belum ada bukti</p>
                        </div>
                        <button
                          onClick={() => setShowUploadHon(true)}
                          className="self-start flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#1E1C43] text-white hover:bg-[#2d2b5e] transition-colors"
                        >
                          <Plus size={11} /> Upload Bukti
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col gap-2 p-3 rounded-xl border border-dashed border-gray-200 bg-white opacity-50">
                      <div className="flex items-center justify-between">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100 text-gray-400 shrink-0">2</div>
                        <Lock size={11} className="text-gray-300 shrink-0" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Bukti Honorarium</p>
                        <p className="text-xs text-gray-300 italic leading-tight">Tersedia setelah rekap dikonfirmasi</p>
                      </div>
                      <span className="self-start px-2 py-0.5 rounded-full text-xs font-medium border bg-gray-50 text-gray-400 border-gray-200">Terkunci</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* ── Section 3: Monitoring Sesi (read-only, dari backend) ── */}
          {(() => {
            const prog = ppPrograms.find(p => p.id === order.programId)
            const totalPaket = prog?.totalSesi || 12
            const totalHadir = absensiSesi.length
            const sesiTersisa = Math.max(0, totalPaket - totalHadir)
            const pctHadir = Math.min(100, Math.round((totalHadir / totalPaket) * 100))
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                  <div>
                    <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Monitoring Sesi</h3>
                    <p className="text-xs text-gray-400 mt-1 ml-3">Absensi dicatat otomatis oleh sistem backend pelatih</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap ml-3 sm:ml-0">
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
                    <p className="text-xs text-gray-400 mt-1.5">Masa berlaku paket: <span className="font-semibold text-gray-600">{prog.masaBerlaku}</span></p>
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
                            {a.fotoUrl ? (
                              <a href={a.fotoUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
                                <ExternalLink size={11} /> Lihat Foto
                              </a>
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

          {/* ── Section 7: Catatan Progres Pelatih ── */}
          {(() => {
            const prog = ppPrograms.find(p => p.id === order.programId)
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
                            <span className="text-xs text-gray-400">{item.tanggal}</span>
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

          {(() => {
            const logs = logTab3PP.filter(l => ['absensi','jadwal','honorarium'].includes(l.kategori))
            return (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Riwayat Aktivitas</h3>
                  <span className="text-xs text-gray-400">{logs.length} entri</span>
                </div>
                <div className="p-5">
                  {logs.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-4">Belum ada riwayat.</p>
                  ) : (
                    <div className="space-y-0 pl-4 relative">
                      {logs.map((l, idx, arr) => (
                        <div key={l.id} className="relative pb-4 last:pb-0">
                          <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-[#E05945]" />
                          {idx < arr.length - 1 && <div className="absolute -left-[13px] top-3 w-px bottom-0 bg-gray-200" />}
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <p className="text-xs text-gray-400">{l.waktu}</p>
                            {l.actor && <p className="text-xs text-gray-500 font-medium">· {l.actor}</p>}
                            {l.nomorLaporan && (
                              <span className="text-xs bg-[#1E1C43]/10 text-[#1E1C43] px-1.5 py-0.5 rounded font-mono">
                                {l.nomorLaporan}
                              </span>
                            )}
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              l.kategori === 'absensi'    ? 'bg-blue-50 text-blue-600'     :
                              l.kategori === 'jadwal'     ? 'bg-green-50 text-green-600'   :
                              l.kategori === 'honorarium' ? 'bg-orange-50 text-orange-600' :
                              'bg-gray-50 text-gray-500'
                            }`}>{l.kategori}</span>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed">{l.teks}</p>
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
          TAB 5 — Komunikasi WA
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'wa' && (
        <div className="space-y-4">

          {/* Template Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Komunikasi WhatsApp</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Tahapan:</span>
                <TahapanBadge tahapan={tahapanState} />
              </div>
            </div>

            {/* Nomor tujuan */}
            {orderCtx.noHP ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-5">
                <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                  <MessageCircle size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Nomor Tujuan</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {orderCtx.sapaan ? orderCtx.sapaan + ' ' : ''}{orderCtx.namaKlien} · {orderCtx.noHP}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-5">
                <p className="text-xs text-yellow-700">Nomor HP klien belum tercatat. Lengkapi di tab Kontrak & Keuangan → Info Deal.</p>
              </div>
            )}

            {/* Template untuk tahapan saat ini */}
            <div className="mb-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Template untuk Tahapan Saat Ini: {tahapanState}
              </p>
              <div className="space-y-2">
                {(ORDER_WA_TEMPLATES[tahapanState] || []).length > 0
                  ? (ORDER_WA_TEMPLATES[tahapanState] || []).map(tpl => (
                      <OrderTemplateCard key={tpl.id} template={tpl} orderCtx={orderCtx} onKirim={handleKirimWA} />
                    ))
                  : <p className="text-xs text-gray-400 italic">Tidak ada template khusus untuk tahapan ini.</p>
                }
              </div>
            </div>

            {/* Template tahapan lain (collapsible) */}
            <div>
              <button
                onClick={() => setShowAllWaTemplates(p => !p)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1E1C43] transition-colors mb-2"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  {showAllWaTemplates ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                </svg>
                {showAllWaTemplates ? 'Sembunyikan' : 'Lihat'} semua template
              </button>
              {showAllWaTemplates && (
                <div className="space-y-4 pt-1">
                  {Object.entries(ORDER_WA_TEMPLATES)
                    .filter(([tahapan]) => tahapan !== tahapanState)
                    .map(([tahapan, templates]) => (
                      <div key={tahapan}>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Tahapan: {tahapan}</p>
                        <div className="space-y-2">
                          {templates.map(tpl => (
                            <OrderTemplateCard key={tpl.id} template={tpl} orderCtx={orderCtx} onKirim={handleKirimWA} />
                          ))}
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>

          {/* Log Pengiriman */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Log Pengiriman WA</h3>
              <span className="text-xs text-gray-400">{waLog.length} terkirim</span>
            </div>
            {waLog.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-4">Belum ada WA yang dikirim via EFM untuk order ini.</p>
            ) : (
              <div className="space-y-2">
                {[...waLog].reverse().map((log, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 mt-0.5">
                      <MessageCircle size={12} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-800">{log.judul}</p>
                        <span className="text-xs text-gray-400 shrink-0">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Dikirim oleh {log.kirimOleh} · ke {log.nomorTujuan}
                        {log.tahapan && <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-medium ${TAHAPAN_WA_CLS[log.tahapan] ?? 'bg-gray-200 text-gray-500'}`}>{log.tahapan}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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


      {/* ── Modal Tambah Absensi Manual ───────────────────────────────────────── */}
      {showTambahAbsensiManual && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold text-[#1E1C43]">Tambah Absensi Manual</h3>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

      {/* ── Modal Upload Bukti Honorarium ── */}
      {showUploadHon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUploadHon(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex-shrink-0 p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1E1C43]">Upload Bukti Honorarium</h3>
              <button onClick={() => setShowUploadHon(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Tanggal Bayar</label>
                <input
                  type="date"
                  value={honTglBayar}
                  onChange={e => setHonTglBayar(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#1E1C43]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Foto Bukti Transfer (JPEG / PNG)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  ref={honFileRef}
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) { setHonFile(f); setHonPreview(URL.createObjectURL(f)) }
                  }}
                  className="hidden"
                />
                {honPreview ? (
                  <div className="relative">
                    <img src={honPreview} alt="preview" className="w-full rounded-xl object-contain max-h-52 border border-gray-200" />
                    <button
                      onClick={() => { setHonFile(null); setHonPreview(null) }}
                      className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white hover:bg-black/70"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => honFileRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors"
                  >
                    <Upload size={24} />
                    <span className="text-xs font-medium">Pilih foto dari perangkat</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => { setShowUploadHon(false); setHonFile(null); setHonPreview(null); setHonTglBayar('') }}
                className="h-9 px-4 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                disabled={!honFile || !honTglBayar}
                onClick={() => {
                  const data = (() => { try { return JSON.parse(localStorage.getItem(`rekap-pp-${id}`)) || {} } catch { return {} } })()
                  data.honorariumStatus = 'sudah_bayar'
                  data.buktiBayarNama = honFile.name
                  data.tglBayar = honTglBayar
                  data.buktiBayarUrl = honPreview
                  localStorage.setItem(`rekap-pp-${id}`, JSON.stringify(data))
                  setShowUploadHon(false)
                  setHonFile(null)
                  setHonPreview(null)
                  setHonTglBayar('')
                }}
                className="h-9 px-4 rounded-lg bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Simpan Bukti
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

