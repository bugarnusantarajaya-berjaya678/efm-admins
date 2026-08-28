import { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, X, Plus, RotateCcw, Search, ExternalLink, Download, Trash2, FileText, Receipt } from 'lucide-react'

/* ═══════════════════════════════════════
   Constants
═══════════════════════════════════════ */
const BULAN_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const BULAN_OPTS   = ['Semua Bulan', ...BULAN_ID]
const TAHUN_OPTS   = ['Semua Tahun', '2026', '2025']
const TIPE_OPTS    = ['Semua', 'Corporate', 'Foundation', 'Government', 'Brand', 'Community', 'Private', 'Individual']
const STATUS_OPTS  = ['Semua', 'Aktif', 'Pending', 'Selesai', 'Batal']
const TAHAPAN_OPTS = ['Semua', 'Quotation & LOI', 'MOU', 'Contract', 'Event Running', 'Event Selesai']
const PAY_TERMS    = ['DP 50% + Pelunasan', 'DP 30% + Termin + Pelunasan', 'Full Payment', 'Custom']
const DOC_STATUS   = ['Drafting', 'On Review', 'Revision', 'Signed']

/* ═══════════════════════════════════════
   Helpers
═══════════════════════════════════════ */
function formatRp(n) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n)
}
function formatRpShort(n) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000)     return `Rp ${Math.round(n / 1_000_000)}jt`
  return formatRp(n)
}

function generatePayRows(startStr, endStr, terms, nilaiNum) {
  if (!startStr || !endStr) return []
  const start = new Date(startStr)
  const end   = new Date(endStr)
  let step = 1
  if (terms === '3 Months Terms') step = 3
  else if (terms === '6 Months Terms') step = 6
  else if (terms === 'Annually') step = 12
  const rows = []
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  const endM = new Date(end.getFullYear(), end.getMonth(), 1)
  let i = 0
  while (cur < endM) {
    let label
    if (step === 1) {
      label = `${BULAN_ID[cur.getMonth()]} ${cur.getFullYear()}`
    } else {
      const pe = new Date(cur.getFullYear(), cur.getMonth() + step - 1, 1)
      label = `${BULAN_ID[cur.getMonth()]} ${cur.getFullYear()} – ${BULAN_ID[pe.getMonth()]} ${pe.getFullYear()}`
    }
    rows.push({
      id: i,
      periode: label,
      nominal: nilaiNum * step,
      status: i === 0 ? 'Lunas' : i === 1 ? 'Invoice Terkirim' : 'Belum Ditagih',
      tanggalBayar: i === 0 ? '2026-06-05' : '',
    })
    cur.setMonth(cur.getMonth() + step)
    i++
  }
  return rows
}

/* ═══════════════════════════════════════
   Dummy data
═══════════════════════════════════════ */
const ORDERS_DATA = [
  {
    id: '#EV-26-0003', namaKlien: 'Yayasan Kanker Indonesia', jenis: 'Foundation',
    namaEvent: 'Health Run for Hope 2026', jenisEvent: 'Charity Run',
    nilaiKontrak: 'Rp 85jt', nilaiNum: 85_000_000,
    tglEvent: '28 Jun 2026', tglOrder: '1 Jun 2026', periode: '28 Jun 2026',
    tanggalMulai: '2026-06-28', tanggalSelesai: '2026-06-28',
    tahapan: 'Event Running', status: 'Aktif', pic: 'Bagoes', catatan: 'Event sudah berjalan.', bulan: 'Jun', tahun: '2026',
  },
  {
    id: '#EV-26-0002', namaKlien: 'PT. Garuda Nusa Tbk', jenis: 'Corporate',
    namaEvent: 'Corporate Fun Run 2026', jenisEvent: 'Fun Run',
    nilaiKontrak: 'Rp 40jt', nilaiNum: 40_000_000,
    tglEvent: '15 Jul 2026', tglOrder: '1 Jun 2026', periode: '15 Jul 2026',
    tanggalMulai: '2026-07-15', tanggalSelesai: '2026-07-15',
    tahapan: 'Contract', status: 'Aktif', pic: 'Emma', catatan: '', bulan: 'Jul', tahun: '2026',
  },
  {
    id: '#EV-26-0001', namaKlien: 'Dinas Pemuda & Olahraga DKI', jenis: 'Government',
    namaEvent: 'Hari Olahraga Nasional DKI', jenisEvent: 'Mass Event',
    nilaiKontrak: 'Rp 120jt', nilaiNum: 120_000_000,
    tglEvent: '17 Agu 2026', tglOrder: '20 Jun 2026', periode: '17 Agu 2026',
    tanggalMulai: '2026-08-17', tanggalSelesai: '2026-08-17',
    tahapan: 'Quotation & LOI', status: 'Pending', pic: 'Bagoes', catatan: 'Proses tender.', bulan: 'Agu', tahun: '2026',
  },
]

const LOG_AKTIVITAS = [
  { waktu: '1 Jun 2026 10:00',  teks: 'Order dibuat oleh Admin EFM' },
  { waktu: '3 Jun 2026 14:30',  teks: 'Quotation & LOI diupload: quotation-v1.pdf' },
  { waktu: '5 Jun 2026 09:00',  teks: 'Status Quotation diubah ke Signed' },
  { waktu: '10 Jun 2026 11:00', teks: 'Contract diupload: contract-final.pdf' },
  { waktu: '15 Jun 2026 08:00', teks: 'Pembayaran bulan Jun 2026 dikonfirmasi Lunas' },
]

/* ── Kegiatan Operasional ──────────────────────────────────────────────────── */
const TIPE_KEGIATAN_OPTS = [
  'Kunjungan/Supervisi', 'Maintenance/Perbaikan', 'Penagihan',
  'Meeting/Konsultasi', 'Sesi/Class', 'Lainnya',
]
const KEGIATAN_STATUS_OPTS = ['Terjadwal', 'Sedang Berjalan', 'Selesai', 'Dibatalkan']
const KEGIATAN_STATUS_CLS = {
  'Terjadwal':       'bg-yellow-100 text-yellow-700',
  'Sedang Berjalan': 'bg-blue-100 text-blue-700',
  'Selesai':         'bg-green-100 text-green-700',
  'Dibatalkan':      'bg-red-100 text-red-600',
}
const KEGIATAN_INIT = {
  '#EV-26-0003': [
    { id: 1, nama: 'Briefing Tim Lapangan',            vendor: 'Bagoes',              tglMulai: '25 Jun 2026', tglSelesai: '25 Jun 2026', tipe: 'Meeting/Konsultasi',  status: 'Selesai'   },
    { id: 2, nama: 'Setup Venue & Sound Check',        vendor: 'CV. Event Pro',        tglMulai: '27 Jun 2026', tglSelesai: '27 Jun 2026', tipe: 'Lainnya',             status: 'Selesai'   },
    { id: 3, nama: 'H-Day Health Run for Hope 2026',   vendor: 'Tim EFM',              tglMulai: '28 Jun 2026', tglSelesai: '28 Jun 2026', tipe: 'Sesi/Class',          status: 'Selesai'   },
    { id: 4, nama: 'Penagihan Pelunasan 50%',          vendor: 'Admin EFM',            tglMulai: '28 Jun 2026', tglSelesai: '28 Jun 2026', tipe: 'Penagihan',           status: 'Terjadwal' },
    { id: 5, nama: 'Laporan & Evaluasi Post-Event',    vendor: 'Bagoes',              tglMulai: '30 Jun 2026', tglSelesai: '30 Jun 2026', tipe: 'Meeting/Konsultasi',  status: 'Terjadwal' },
  ],
}

/* ═══════════════════════════════════════
   Small badge & UI components
═══════════════════════════════════════ */
const TIPE_CLS = {
  Corporate:  'bg-[#1E1C43] text-white',
  Brand:      'bg-purple-600 text-white',
  Community:  'bg-blue-500 text-white',
  Government: 'bg-green-600 text-white',
  Foundation: 'bg-orange-500 text-white',
  Private:    'bg-pink-500 text-white',
  Individual: 'bg-gray-400 text-white',
}
const TAHAPAN_CLS = {
  'Quotation & LOI': 'bg-amber-100 text-amber-700',
  'MOU':             'bg-blue-100 text-blue-700',
  'Contract':        'bg-purple-100 text-purple-700',
  'Event Running':   'bg-green-100 text-green-700',
  'Event Selesai':   'bg-gray-100 text-gray-500',
}
const STATUS_CLS = {
  Aktif:   'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Selesai: 'bg-gray-100 text-gray-600',
  Batal:   'bg-red-100 text-red-600',
}

function TipeBadge({ jenis }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${TIPE_CLS[jenis] ?? 'bg-gray-100 text-gray-600'}`}>
      {jenis}
    </span>
  )
}
function TahapanBadge({ tahapan }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${TAHAPAN_CLS[tahapan] ?? 'bg-gray-100 text-gray-500'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {tahapan}
    </span>
  )
}
function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_CLS[status] ?? 'bg-gray-100 text-gray-600'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {status}
    </span>
  )
}

function FilterSelect({ value, onChange, options, className = '' }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`h-9 px-3 pr-7 rounded-lg border border-gray-200 bg-white text-[13px] text-text-primary outline-none appearance-none cursor-pointer hover:border-gray-300 focus:border-[#1E1C43] transition-colors ${className}`}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function Label({ children }) {
  return <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{children}</label>
}
function FormInput({ value, onChange, type = 'text', placeholder = '', className = '' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-text-primary outline-none focus:border-[#1E1C43] focus:bg-white transition-colors ${className}`}
    />
  )
}
function SectionHeading({ title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h3 className="text-[14px] font-bold text-[#1E1C43] whitespace-nowrap">{title}</h3>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}
function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${on ? 'bg-[#1E1C43]' : 'bg-gray-200'}`}
      style={{ height: 22, width: 40 }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: on ? 'translateX(20px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

/* ═══════════════════════════════════════
   Reusable document section (Q&LOI / MOU / Contract)
═══════════════════════════════════════ */
function DocFields({ status, onStatus, url, onUrl, history }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <FilterSelect value={status} onChange={onStatus} options={DOC_STATUS} className="w-full" />
        </div>
        <div>
          <Label>Google Docs URL</Label>
          <div className="relative">
            <FormInput value={url} onChange={onUrl} placeholder="https://docs.google.com/..." />
            <ExternalLink size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          </div>
        </div>
      </div>
      <div>
        <Label>Upload File PDF</Label>
        <button className="h-9 px-4 rounded-lg border border-dashed border-gray-300 text-[13px] text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors">
          + Pilih File
        </button>
      </div>
      {history.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Riwayat</p>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            {history.map((item, i) => (
              <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${i < history.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div>
                  <p className="text-[13px] font-medium text-text-primary">{item.filename}</p>
                  <p className="text-[11px] text-gray-400">{item.uploadDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">{item.status}</span>
                  <button className="flex items-center gap-1 text-[12px] text-[#1E1C43] hover:underline font-medium">
                    <Download size={12} />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════
   Order Edit Modal
═══════════════════════════════════════ */
function OrderEditModal({ order, onClose }) {
  /* Section 1 */
  const [form, setForm] = useState({
    namaKlien:     order.namaKlien,
    jenis:         order.jenis,
    program:       order.program,
    nilaiNum:      order.nilaiNum,
    tanggalMulai:  order.tanggalMulai,
    tanggalSelesai:order.tanggalSelesai,
    pic:           order.pic,
    catatan:       order.catatan,
  })
  const updateForm = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const navigate = useNavigate()
  const orderId = order.id.replace('#', '')

  /* Section 1 — Rincian Layanan */
  const [lineItems, setLineItems] = useState(() =>
    order.id === '#EV-26-0003'
      ? [
          { id: 0, namaItem: 'Jasa Manajemen Event',             satuan: 'Event', jumlah: 1, rate: 70_000_000 },
          { id: 1, namaItem: 'Biaya Operasional & Transportasi', satuan: 'Event', jumlah: 1, rate: 15_000_000 },
        ]
      : [{ id: 0, namaItem: '', satuan: '', jumlah: 1, rate: 0 }]
  )
  const subtotal = lineItems.reduce((s, it) => s + it.jumlah * it.rate, 0)
  function addLineItem() {
    setLineItems(items => [...items, { id: Date.now(), namaItem: '', satuan: '', jumlah: 1, rate: 0 }])
  }
  function removeLineItem(idx) {
    setLineItems(items => items.filter((_, i) => i !== idx))
  }
  function updateLineItem(idx, field, val) {
    setLineItems(items => items.map((it, i) => i === idx ? { ...it, [field]: val } : it))
  }
  useEffect(() => {
    setForm(f => ({ ...f, nilaiNum: subtotal }))
  }, [subtotal])

  /* Section 2 */
  const [payTerms, setPayTerms] = useState('Monthly')
  const [payRows, setPayRows] = useState(() =>
    generatePayRows(order.tanggalMulai, order.tanggalSelesai, 'Monthly', order.nilaiNum)
  )
  function handleTermsChange(t) {
    setPayTerms(t)
    setPayRows(generatePayRows(form.tanggalMulai, form.tanggalSelesai, t, form.nilaiNum))
  }
  function updatePayRow(idx, field, val) {
    setPayRows(rows => rows.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }

  /* Section 3 */
  const [psOn,  setPsOn]  = useState(false)
  const [psPct, setPsPct] = useState(10)
  const [psRows, setPsRows] = useState([
    { id: 0, periode: 'Jan–Des 2025', totalProfit: 120_000_000, status: 'Sudah Diterima', tanggalTerima: '15 Jan 2026' },
  ])
  function addPsRow() {
    setPsRows(r => [...r, { id: r.length, periode: '', totalProfit: 0, status: 'Belum Diterima', tanggalTerima: '' }])
  }
  function updatePsRow(idx, field, val) {
    setPsRows(rows => rows.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }

  /* Section 4 — Quotation */
  const [qStatus, setQStatus] = useState('Signed')
  const [qUrl,    setQUrl]    = useState('')
  const qHistory = [{ filename: 'quotation-pt-maju-bersama-v1.pdf', uploadDate: 'Uploaded 8 Jun 2026', status: 'Signed' }]

  /* Section 5 — MOU */
  const [mouOn, setMouOn] = useState(false)
  const [mouStatus, setMouStatus] = useState('Drafting')
  const [mouUrl,    setMouUrl]    = useState('')

  /* Section 6 — Contract */
  const [cStatus, setCStatus] = useState('Signed')
  const [cUrl,    setCUrl]    = useState('')
  const cHistory = [{ filename: 'contract-pt-maju-bersama-final.pdf', uploadDate: 'Uploaded 1 Jun 2026', status: 'Signed' }]

  /* Section 7 — Kegiatan Operasional */
  const [kegiatanList, setKegiatanList] = useState(() => KEGIATAN_INIT[order.id] || [])
  const [showAddKegiatan, setShowAddKegiatan] = useState(false)
  const [editKgIdx, setEditKgIdx] = useState(null)
  const [kgForm, setKgForm] = useState({ nama: '', vendor: '', tglMulai: '', tglSelesai: '', tipe: TIPE_KEGIATAN_OPTS[0], status: 'Terjadwal', catatan: '' })
  const [logList, setLogList] = useState([...LOG_AKTIVITAS])

  function addLog(teks) {
    const now = new Date()
    const m = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
    const waktu = `${now.getDate()} ${m[now.getMonth()]} ${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    setLogList(l => [{ waktu, teks }, ...l])
  }
  function openAddKg() {
    setEditKgIdx(null)
    setKgForm({ nama: '', vendor: '', tglMulai: '', tglSelesai: '', tipe: TIPE_KEGIATAN_OPTS[0], status: 'Terjadwal', catatan: '' })
    setShowAddKegiatan(true)
  }
  function openEditKg(idx) {
    const k = kegiatanList[idx]
    setEditKgIdx(idx)
    setKgForm({ nama: k.nama, vendor: k.vendor, tglMulai: k.tglMulai, tglSelesai: k.tglSelesai, tipe: k.tipe || TIPE_KEGIATAN_OPTS[0], status: k.status, catatan: k.catatan || '' })
    setShowAddKegiatan(true)
  }
  function saveKg() {
    if (!kgForm.nama || !kgForm.tglMulai || !kgForm.tglSelesai) return
    if (editKgIdx !== null) {
      const prev = kegiatanList[editKgIdx]
      setKegiatanList(list => list.map((k, i) => i === editKgIdx ? { ...k, ...kgForm } : k))
      if (kgForm.status === 'Selesai' && prev.status !== 'Selesai') {
        addLog(`Kegiatan '${kgForm.nama}' ditandai Selesai`)
      } else {
        addLog(`Kegiatan '${kgForm.nama}' diperbarui`)
      }
    } else {
      setKegiatanList(list => [...list, { id: Date.now(), ...kgForm }])
      addLog(`Kegiatan '${kgForm.nama}' dijadwalkan pada ${kgForm.tglMulai} oleh Admin EFM`)
    }
    setShowAddKegiatan(false)
  }
  function deleteKg(idx) {
    const nama = kegiatanList[idx].nama
    setKegiatanList(list => list.filter((_, i) => i !== idx))
    addLog(`Kegiatan '${nama}' dihapus dari jadwal`)
  }

  return (
    <>
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl my-6 flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-[16px] font-bold text-[#1E1C43]">
              Detail Order: {order.id} — {order.namaKlien}
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5">{order.program} · {order.periode}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto px-6 py-6 space-y-8" style={{ maxHeight: '70vh' }}>

          {/* ── Section 1: Info Deal ── */}
          <section>
            <SectionHeading title="1. Info Deal" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nama Klien</Label>
                <FormInput value={form.namaKlien} onChange={v => updateForm('namaKlien', v)} />
              </div>
              <div>
                <Label>Jenis</Label>
                <FilterSelect value={form.jenis} onChange={v => updateForm('jenis', v)} options={['Corporate', 'Foundation', 'Government', 'Brand', 'Community', 'Private', 'Individual']} className="w-full" />
              </div>
              <div>
                <Label>Program / Layanan</Label>
                <FormInput value={form.program} onChange={v => updateForm('program', v)} />
              </div>
              <div>
                <Label>Nilai Kontrak (Rp/bulan)</Label>
                <FormInput type="number" value={form.nilaiNum} onChange={v => updateForm('nilaiNum', Number(v))} />
              </div>
              <div>
                <Label>Tanggal Mulai</Label>
                <FormInput type="date" value={form.tanggalMulai} onChange={v => updateForm('tanggalMulai', v)} />
              </div>
              <div>
                <Label>Tanggal Selesai</Label>
                <FormInput type="date" value={form.tanggalSelesai} onChange={v => updateForm('tanggalSelesai', v)} />
              </div>
              <div>
                <Label>PIC Sales</Label>
                <FormInput value={form.pic} onChange={v => updateForm('pic', v)} />
              </div>
              <div className="col-span-2">
                <Label>Catatan</Label>
                <textarea
                  value={form.catatan}
                  onChange={e => updateForm('catatan', e.target.value)}
                  rows={3}
                  placeholder="Catatan tambahan..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-text-primary outline-none focus:border-[#1E1C43] focus:bg-white transition-colors resize-none"
                />
              </div>
            </div>

            {/* ── Rincian Layanan ── */}
            <div className="mt-6">
              <div className="mb-3">
                <p className="text-[13px] font-bold text-[#1E1C43]">Rincian Layanan</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Item ini menjadi template invoice untuk setiap periode tagihan</p>
              </div>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase w-8">No</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase">Item Layanan</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase w-24">Satuan</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase w-20">Jumlah</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase w-36">Rate/Unit (Rp)</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase w-36">Total (Rp)</th>
                      <th className="w-8 px-3 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => {
                      const rowTotal = item.jumlah * item.rate
                      return (
                        <tr key={item.id} className="border-b border-gray-50 last:border-0">
                          <td className="px-3 py-2 text-gray-400 text-center">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <input
                              value={item.namaItem}
                              onChange={e => updateLineItem(idx, 'namaItem', e.target.value)}
                              placeholder="Nama item layanan"
                              className="border border-gray-200 rounded px-2 py-1 text-sm w-full outline-none focus:border-[#1E1C43]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={item.satuan}
                              onChange={e => updateLineItem(idx, 'satuan', e.target.value)}
                              placeholder="Bulan"
                              className="border border-gray-200 rounded px-2 py-1 text-sm w-full outline-none focus:border-[#1E1C43]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={item.jumlah}
                              min={0}
                              onChange={e => updateLineItem(idx, 'jumlah', Number(e.target.value))}
                              className="border border-gray-200 rounded px-2 py-1 text-sm w-full outline-none focus:border-[#1E1C43]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={item.rate}
                              min={0}
                              onChange={e => updateLineItem(idx, 'rate', Number(e.target.value))}
                              className="border border-gray-200 rounded px-2 py-1 text-sm w-full outline-none focus:border-[#1E1C43]"
                            />
                          </td>
                          <td className="px-3 py-2 text-xs font-medium text-gray-800 text-right whitespace-nowrap">
                            {formatRp(rowTotal)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => removeLineItem(idx)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    <tr className="bg-gray-50 border-t border-gray-100">
                      <td colSpan={5} className="px-3 py-2.5 text-[13px] font-semibold text-[#1E1C43]">
                        Subtotal Layanan
                      </td>
                      <td className="px-3 py-2.5 text-[13px] font-semibold text-[#1E1C43] text-right whitespace-nowrap">
                        {formatRp(subtotal)}
                      </td>
                      <td />
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>
              <button
                onClick={addLineItem}
                className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-[#1E1C43] hover:underline"
              >
                <Plus size={13} />
                Tambah Item
              </button>
            </div>
          </section>

          {/* ── Section 2: Payment Terms & Tracking ── */}
          <section>
            <SectionHeading title="2. Payment Terms & Tracking" />

            {/* Payment Terms selector */}
            <div className="flex items-center gap-4 mb-5">
              <div>
                <Label>Payment Terms</Label>
                <FilterSelect value={payTerms} onChange={handleTermsChange} options={PAY_TERMS} className="w-52" />
              </div>
              <p className="text-[12px] text-gray-400 mt-5">{payRows.length} periode tagihan</p>
            </div>

            {/* Payment rows table */}
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['No', 'Periode Tagih', 'Nominal', 'Status', 'Tanggal Bayar', 'Aksi'].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 text-[10px] font-semibold text-text-muted uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payRows.slice(0, 12).map((row, idx) => (
                    <tr key={row.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                      <td className="px-3 py-2 text-text-primary">{row.periode}</td>
                      <td className="px-3 py-2 font-semibold text-text-primary">{formatRp(row.nominal)}</td>
                      <td className="px-3 py-2">
                        <select
                          value={row.status}
                          onChange={e => updatePayRow(idx, 'status', e.target.value)}
                          className="h-7 px-2 rounded border border-gray-200 text-[12px] outline-none bg-white"
                        >
                          {['Belum Ditagih', 'Invoice Terkirim', 'Lunas'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        {row.status === 'Lunas' ? (
                          <input
                            type="date"
                            value={row.tanggalBayar}
                            onChange={e => updatePayRow(idx, 'tanggalBayar', e.target.value)}
                            className="h-7 px-2 rounded border border-gray-200 text-[12px] outline-none"
                          />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5 flex-nowrap">
                          {row.status === 'Belum Ditagih' && (
                            <button
                              onClick={() => { onClose(); navigate(`/event/invoice?order=${orderId}&periode=${row.periode.replace(' ', '-')}&action=create`) }}
                              className="bg-[#E05945] text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap hover:bg-[#C94A38] transition-colors"
                            >
                              Buat Invoice
                            </button>
                          )}
                          {row.status === 'Invoice Terkirim' && (
                            <button
                              onClick={() => navigate(`/event/invoice?order=${orderId}&periode=${row.periode.replace(' ', '-')}`)}
                              className="border border-[#1E1C43] text-[#1E1C43] text-xs px-3 py-1 rounded-lg whitespace-nowrap hover:bg-[#1E1C43] hover:text-white transition-colors"
                            >
                              Lihat Invoice
                            </button>
                          )}
                          {row.status === 'Lunas' && (
                            <>
                              <button
                                onClick={() => navigate(`/event/invoice?order=${orderId}&periode=${row.periode.replace(' ', '-')}`)}
                                className="border border-[#1E1C43] text-[#1E1C43] text-xs px-3 py-1 rounded-lg whitespace-nowrap hover:bg-[#1E1C43] hover:text-white transition-colors"
                              >
                                Lihat Invoice
                              </button>
                              <button
                                onClick={() => navigate(`/event/receipt?order=${orderId}&periode=${row.periode.replace(' ', '-')}`)}
                                className="bg-green-600 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap hover:bg-green-700 transition-colors"
                              >
                                Lihat Receipt
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {payRows.length > 12 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-2 text-[11px] text-gray-400 text-center">
                        + {payRows.length - 12} periode lainnya
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </section>

          {/* ── Section 3: Profit Sharing ── */}
          <section>
            <SectionHeading title="3. Profit Sharing" />
            <div className="flex items-center gap-3 mb-4">
              <Toggle on={psOn} onToggle={() => setPsOn(v => !v)} />
              <span className="text-[13px] text-text-primary font-medium">Ada Profit Sharing?</span>
            </div>
            {psOn && (
              <div className="space-y-4">
                <div className="flex items-end gap-4">
                  <div>
                    <Label>Persentase Profit Sharing</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={psPct}
                        onChange={e => setPsPct(Number(e.target.value))}
                        min={0} max={100}
                        className="w-20 h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-text-primary outline-none focus:border-[#1E1C43] focus:bg-white transition-colors"
                      />
                      <span className="text-[13px] text-gray-500 font-medium">%</span>
                    </div>
                  </div>
                  <p className="text-[12px] text-gray-400 mb-2">
                    Persentase dari keuntungan bersih operasional yang dikelola EFM
                  </p>
                </div>

                {/* Profit sharing history table */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Riwayat Realisasi</p>
                  <div className="rounded-xl border border-gray-100 overflow-hidden mb-3">
                    <div className="overflow-x-auto">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {['No', 'Periode', 'Total Profit Klien', '%', 'Hak EFM', 'Status', 'Tanggal Terima'].map(h => (
                            <th key={h} className="text-left px-3 py-2.5 text-[10px] font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {psRows.map((r, idx) => (
                          <tr key={r.id} className="border-b border-gray-50 last:border-0">
                            <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                            <td className="px-3 py-2">
                              <input
                                value={r.periode}
                                onChange={e => updatePsRow(idx, 'periode', e.target.value)}
                                className="w-28 h-7 px-2 rounded border border-gray-200 text-[12px] outline-none"
                                placeholder="Jan–Des 2025"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={r.totalProfit}
                                onChange={e => updatePsRow(idx, 'totalProfit', Number(e.target.value))}
                                className="w-32 h-7 px-2 rounded border border-gray-200 text-[12px] outline-none"
                              />
                            </td>
                            <td className="px-3 py-2 text-gray-500">{psPct}%</td>
                            <td className="px-3 py-2 font-semibold text-[#1E1C43]">
                              {formatRp(Math.round(r.totalProfit * psPct / 100))}
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={r.status}
                                onChange={e => updatePsRow(idx, 'status', e.target.value)}
                                className="h-7 px-2 rounded border border-gray-200 text-[12px] outline-none bg-white"
                              >
                                <option>Belum Diterima</option>
                                <option>Sudah Diterima</option>
                              </select>
                            </td>
                            <td className="px-3 py-2 text-gray-500">{r.tanggalTerima || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                  <button
                    onClick={addPsRow}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1E1C43] hover:underline"
                  >
                    <Plus size={13} />
                    Tambah Periode
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Profit Sharing dicatat sebagai Pendapatan Operasional EFM dan akan tercermin di Laporan &amp; Keuangan.
                </p>
              </div>
            )}
          </section>

          {/* ── Section 4: Quotation & LOI ── */}
          <section>
            <SectionHeading title="4. Quotation & LOI" />
            <DocFields
              status={qStatus} onStatus={setQStatus}
              url={qUrl} onUrl={setQUrl}
              history={qHistory}
            />
          </section>

          {/* ── Section 5: MOU ── */}
          <section>
            <SectionHeading title="5. MOU" />
            <div className="flex items-center gap-3 mb-4">
              <Toggle on={mouOn} onToggle={() => setMouOn(v => !v)} />
              <span className="text-[13px] text-text-primary font-medium">Ada MOU?</span>
            </div>
            {mouOn && (
              <DocFields
                status={mouStatus} onStatus={setMouStatus}
                url={mouUrl} onUrl={setMouUrl}
                history={[]}
              />
            )}
          </section>

          {/* ── Section 6: Contract ── */}
          <section>
            <SectionHeading title="6. Contract" />
            <DocFields
              status={cStatus} onStatus={setCStatus}
              url={cUrl} onUrl={setCUrl}
              history={cHistory}
            />
          </section>

          {/* ── Section 7: Jadwal Kegiatan Operasional ── */}
          <section>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-[14px] font-bold text-[#1E1C43] whitespace-nowrap">7. Jadwal Kegiatan Operasional</h3>
              <div className="flex-1 h-px bg-gray-100" />
              <button
                onClick={openAddKg}
                className="bg-[#E05945] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#C94A38] transition-colors whitespace-nowrap"
              >
                + Tambah Kegiatan
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">Catat semua kegiatan operasional selama masa kontrak — maintenance, kunjungan, penagihan, dan lainnya.</p>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full" style={{ minWidth: 800 }}>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['No', 'Nama Kegiatan', 'Vendor / PIC', 'Tgl Mulai', 'Tgl Selesai', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kegiatanList.length === 0 ? (
                    <tr><td colSpan={7} className="px-3 py-6 text-center text-xs text-gray-400">Belum ada kegiatan. Klik "+ Tambah Kegiatan" untuk menambah.</td></tr>
                  ) : kegiatanList.map((k, idx) => (
                    <tr key={k.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-xs font-normal text-gray-700">{idx + 1}</td>
                      <td className="px-3 py-2.5 text-xs font-normal text-gray-700">{k.nama}</td>
                      <td className="px-3 py-2.5 text-xs font-normal text-gray-700">{k.vendor}</td>
                      <td className="px-3 py-2.5 text-xs font-normal text-gray-700 whitespace-nowrap">{k.tglMulai}</td>
                      <td className="px-3 py-2.5 text-xs font-normal text-gray-700 whitespace-nowrap">{k.tglSelesai}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${KEGIATAN_STATUS_CLS[k.status] || 'bg-gray-100 text-gray-600'}`}>{k.status}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditKg(idx)} className="text-gray-400 hover:text-[#1E1C43] transition-colors text-sm" title="Edit">✏️</button>
                          <button onClick={() => deleteKg(idx)} className="text-gray-400 hover:text-red-500 transition-colors text-sm" title="Hapus">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Section 8: Log Aktivitas ── */}
          <section>
            <SectionHeading title="8. Log Aktivitas" />
            <div className="space-y-0">
              {logList.map((log, i) => (
                <div key={i} className="flex gap-4">
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1E1C43] mt-0.5 shrink-0" />
                    {i < logList.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 my-1" style={{ minHeight: 24 }} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-[11px] text-gray-400 mb-0.5">{log.waktu}</p>
                    <p className="text-[13px] text-text-primary">{log.teks}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Modal Footer ── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#1E1C43] border border-[#1E1C43] hover:bg-[#1E1C43] hover:text-white transition-colors"
          >
            Tutup
          </button>
          <button className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#1E1C43] hover:bg-[#2D2B5A] transition-colors">
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>

    {/* ── Add/Edit Kegiatan Modal ── */}
    {showAddKegiatan && (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.35)' }}
        onClick={e => { if (e.target === e.currentTarget) setShowAddKegiatan(false) }}
      >
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-[16px] font-bold text-[#1E1C43]">{editKgIdx !== null ? 'Edit Kegiatan' : 'Tambah Kegiatan'}</h2>
            <button onClick={() => setShowAddKegiatan(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4 overflow-y-auto" style={{ maxHeight: '65vh' }}>
            <div>
              <Label>Nama Kegiatan *</Label>
              <FormInput value={kgForm.nama} onChange={v => setKgForm(f => ({ ...f, nama: v }))} placeholder="Nama kegiatan" />
            </div>
            <div>
              <Label>Vendor / PIC</Label>
              <FormInput value={kgForm.vendor} onChange={v => setKgForm(f => ({ ...f, vendor: v }))} placeholder="Nama vendor atau PIC internal" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tanggal Mulai *</Label>
                <FormInput type="date" value={kgForm.tglMulai} onChange={v => setKgForm(f => ({ ...f, tglMulai: v }))} />
              </div>
              <div>
                <Label>Tanggal Selesai *</Label>
                <FormInput type="date" value={kgForm.tglSelesai} onChange={v => setKgForm(f => ({ ...f, tglSelesai: v }))} />
              </div>
            </div>
            <div>
              <Label>Tipe Kegiatan</Label>
              <FilterSelect value={kgForm.tipe} onChange={v => setKgForm(f => ({ ...f, tipe: v }))} options={TIPE_KEGIATAN_OPTS} className="w-full" />
            </div>
            <div>
              <Label>Status</Label>
              <FilterSelect value={kgForm.status} onChange={v => setKgForm(f => ({ ...f, status: v }))} options={KEGIATAN_STATUS_OPTS} className="w-full" />
            </div>
            <div>
              <Label>Catatan (opsional)</Label>
              <textarea
                value={kgForm.catatan}
                onChange={e => setKgForm(f => ({ ...f, catatan: e.target.value }))}
                rows={2}
                placeholder="Catatan tambahan..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-[13px] outline-none focus:border-[#1E1C43] focus:bg-white transition-colors resize-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button
              onClick={() => setShowAddKegiatan(false)}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#1E1C43] border border-[#1E1C43] hover:bg-[#1E1C43] hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              onClick={saveKg}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#1E1C43] hover:bg-[#2D2B5A] transition-colors"
            >
              Simpan Kegiatan
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
export default function EventOrdersPage() {
  const navigate = useNavigate()
  const [bulan,    setBulan]    = useState('')
  const [tahun,    setTahun]    = useState('')
  const [tipe,     setTipe]     = useState('')
  const [statusF,  setStatusF]  = useState('')
  const [tahapanF, setTahapanF] = useState('')
  const [search,   setSearch]   = useState('')

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal,     setShowModal]     = useState(false)

  function handleOpenModal(order) {
    setSelectedOrder(order)
    setShowModal(true)
  }
  function handleCloseModal() {
    setShowModal(false)
    setSelectedOrder(null)
  }
  function handleReset() {
    setBulan('')
    setTahun('')
    setTipe('')
    setStatusF('')
    setTahapanF('')
    setSearch('')
  }

  const filtered = useMemo(() => {
    return ORDERS_DATA.filter(o => {
      if (bulan    && o.bulan    !== bulan)    return false
      if (tahun    && o.tahun    !== tahun)    return false
      if (tipe     && o.jenis    !== tipe)     return false
      if (statusF  && o.status   !== statusF)  return false
      if (tahapanF && o.tahapan  !== tahapanF) return false
      if (search && !o.namaKlien.toLowerCase().includes(search.toLowerCase())
                 && !o.id.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [bulan, tahun, tipe, statusF, tahapanF, search])

  /* KPI */
  const kpiAktif     = ORDERS_DATA.filter(o => o.status === 'Aktif').length
  const kpiNilai     = ORDERS_DATA.filter(o => o.status === 'Aktif').reduce((s, o) => s + o.nilaiNum, 0)
  const kpiPending   = ORDERS_DATA.filter(o => !['Contract','Event Running','Selesai'].includes(o.tahapan) && !['Selesai','Batal'].includes(o.status)).length
  const kpiSelesai   = ORDERS_DATA.filter(o => o.status === 'Selesai').length

  return (
    <>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Event Orders</h1>
            <p className="text-sm text-text-muted mt-1">Kelola order & deal event klien aktif</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/event/invoice')}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <FileText size={14} /> Cari Invoice
            </button>
            <button
              onClick={() => navigate('/event/receipt')}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Receipt size={14} /> Cari Receipt
            </button>
            <button
              onClick={() => navigate('/event/orders/new')}
              className="inline-flex items-center gap-2 bg-[#E05945] hover:bg-[#c94a38] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              + Tambah Order
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Total Event Aktif</p>
            <p className="text-[28px] font-bold text-text-primary leading-none">{kpiAktif}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Event berjalan</p>
          </div>
          <div className="bg-white rounded-2xl border-2 border-[#1E1C43] px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Nilai Kontrak Total</p>
            <p className="text-[22px] font-bold text-[#1E1C43] leading-none">{formatRpShort(kpiNilai)}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Total nilai semua event</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Menunggu Dokumen</p>
            <p className="text-[28px] font-bold text-amber-500 leading-none">{kpiPending}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Belum tahap Contract</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Selesai Bulan Ini</p>
            <p className="text-[28px] font-bold text-gray-500 leading-none">{kpiSelesai}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Order ditutup</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          {/* Baris 1: Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <select value={bulan} onChange={e => setBulan(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] cursor-pointer min-w-0">
              <option value="">Semua Bulan</option>
              <option value="Jan">Januari</option>
              <option value="Feb">Februari</option>
              <option value="Mar">Maret</option>
              <option value="Apr">April</option>
              <option value="Mei">Mei</option>
              <option value="Jun">Juni</option>
              <option value="Jul">Juli</option>
              <option value="Agu">Agustus</option>
              <option value="Sep">September</option>
              <option value="Okt">Oktober</option>
              <option value="Nov">November</option>
              <option value="Des">Desember</option>
            </select>
            <select value={tahun} onChange={e => setTahun(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] cursor-pointer min-w-0">
              <option value="">Semua Tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
            <select value={tipe} onChange={e => setTipe(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] cursor-pointer min-w-0">
              <option value="">Semua Tipe</option>
              <option value="Corporate">Corporate</option>
              <option value="Foundation">Foundation</option>
              <option value="Government">Government</option>
              <option value="Brand">Brand</option>
              <option value="Community">Community</option>
              <option value="Private">Private</option>
              <option value="Individual">Individual</option>
            </select>
            <select value={statusF} onChange={e => setStatusF(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] cursor-pointer min-w-0">
              <option value="">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Pending">Pending</option>
              <option value="Selesai">Selesai</option>
              <option value="Batal">Batal</option>
            </select>
            <select value={tahapanF} onChange={e => setTahapanF(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] cursor-pointer min-w-0">
              <option value="">Semua Tahapan</option>
              <option value="Quotation & LOI">Quotation &amp; LOI</option>
              <option value="MOU">MOU</option>
              <option value="Contract">Contract</option>
              <option value="Event Running">Event Running</option>
              <option value="Event Selesai">Event Selesai</option>
            </select>
            <div style={{ minWidth: '72px' }} />
          </div>
          {/* Baris 2: Search + Reset */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama klien atau Order ID..."
                className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43]" />
            </div>
            <button onClick={handleReset}
              className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs px-3 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors whitespace-nowrap flex-shrink-0">
              <RotateCcw size={12} />
              Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full rounded-xl">
          <table className="w-full text-[13px]" style={{ minWidth: '1100px' }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[['Order ID',130],['Nama Klien',160],['Jenis Klien',110],['Nama Event',160],['Jenis Event',110],['Nilai Event',130],['Tgl Event',120],['Tahapan',120],['Status',120],['PIC',130]].map(([h, mw]) => (
                  <th key={h} style={{minWidth:mw}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-[13px] text-gray-400">
                    Tidak ada data yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filtered.map(order => (
                  <tr key={order.id} onClick={() => navigate('/event/orders/' + order.id.replace('#', ''))} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer">
                    <td className="px-3 py-2.5 text-xs font-semibold text-[#1E1C43]">{order.id}</td>
                    <td className="px-3 py-2.5 text-xs font-medium text-gray-900 whitespace-nowrap">{order.namaKlien}</td>
                    <td className="px-3 py-2.5"><TipeBadge jenis={order.jenis} /></td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-800 font-medium">{order.namaEvent}</td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600">{order.jenisEvent}</td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600 whitespace-nowrap">{order.nilaiKontrak}</td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600 whitespace-nowrap">{order.tglEvent}</td>
                    <td className="px-3 py-2.5"><TahapanBadge tahapan={order.tahapan} /></td>
                    <td className="px-3 py-2.5"><StatusBadge status={order.status} /></td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600">{order.pic}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[12px] text-text-muted">
              Menampilkan <span className="font-semibold text-text-primary">{filtered.length}</span> dari{' '}
              <span className="font-semibold text-text-primary">{ORDERS_DATA.length}</span> orders
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && selectedOrder && (
        <OrderEditModal order={selectedOrder} onClose={handleCloseModal} />
      )}

    </>
  )
}
