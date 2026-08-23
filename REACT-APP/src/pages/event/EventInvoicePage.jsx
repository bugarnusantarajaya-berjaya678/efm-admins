import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Download, X, Plus, Trash2, Search, RotateCcw } from 'lucide-react'
import { getCompanySettings } from '../../utils/companySettings'

/* ─── Constants ─────────────────────────── */
const BULAN_OPTS  = ['Semua Bulan', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const TAHUN_OPTS  = ['Semua Tahun', '2026', '2025']
const JENIS_OPTS  = ['Semua', 'Corporate Event', 'Government Event', 'Brand Event', 'Community Event', 'School Event', 'Private Event', 'Family Gathering', 'Lainnya']
const STATUS_OPTS = ['Semua', 'Draft', 'Terkirim', 'Lunas', 'Overdue']

const STATUS_CLS = {
  Draft:    'bg-gray-100 text-gray-600',
  Terkirim: 'bg-blue-100 text-blue-700',
  Lunas:    'bg-green-100 text-green-700',
  Overdue:  'bg-red-100 text-red-600',
}

/* ─── Helpers ───────────────────────────── */
function formatRp(n) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0)
}
function formatRpShort(n) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000)     return `Rp ${Math.round(n / 1_000_000)}jt`
  return formatRp(n)
}

/* ─── Dummy data ────────────────────────── */
const INVOICE_INIT = [
  { noInvoice: 'INV-EV-26-0001', orderId: 'EV-26-0003', namaKlien: 'PT. Sinar Abadi',             jenis: 'Corporate Event', namaEvent: 'Fun Run Jakarta 2026',        jenisEvent: 'Fun Run',    periode: 'Jun 2026', total: 42_500_000, status: 'Lunas',    tanggal: '5 Jun 2026',  nilaiKontrak: 85_000_000, alamat: 'Jl. Sudirman No. 99, Jakarta', picKlien: 'Bapak Hendra', jatuhTempo: '20 Jun 2026' },
  { noInvoice: 'INV-EV-26-0002', orderId: 'EV-26-0003', namaKlien: 'PT. Sinar Abadi',             jenis: 'Corporate Event', namaEvent: 'Fun Run Jakarta 2026',        jenisEvent: 'Fun Run',    periode: 'Jul 2026', total: 42_500_000, status: 'Terkirim', tanggal: '1 Jul 2026',  nilaiKontrak: 85_000_000, alamat: 'Jl. Sudirman No. 99, Jakarta', picKlien: 'Bapak Hendra', jatuhTempo: '15 Jul 2026' },
  { noInvoice: 'INV-EV-26-0003', orderId: 'EV-26-0002', namaKlien: 'Komunitas Sehat ID',          jenis: 'Community Event', namaEvent: 'Yoga Festival Senayan 2026',  jenisEvent: 'Yoga Festival', periode: 'Jul 2026', total: 15_000_000, status: 'Draft',    tanggal: '1 Jul 2026',  nilaiKontrak: 30_000_000, alamat: 'Senayan, Jakarta Pusat',       picKlien: 'Ibu Sari',     jatuhTempo: '20 Jul 2026' },
  { noInvoice: 'INV-EV-26-0004', orderId: 'EV-26-0002', namaKlien: 'Komunitas Sehat ID',          jenis: 'Community Event', namaEvent: 'Yoga Festival Senayan 2026',  jenisEvent: 'Yoga Festival', periode: 'Agu 2026', total: 15_000_000, status: 'Overdue',  tanggal: '1 Agu 2026',  nilaiKontrak: 30_000_000, alamat: 'Senayan, Jakarta Pusat',       picKlien: 'Ibu Sari',     jatuhTempo: '15 Agu 2026' },
]

function getDefaultLineItems(inv) {
  if (!inv) return [{ id: 0, nama: '', satuan: 'Paket', jumlah: 1, rate: 0, isExtra: false }]
  if (inv.orderId === 'EV-26-0003') {
    return [
      { id: 0, nama: 'Jasa Event Organizer & Koordinasi',   satuan: 'Paket', jumlah: 1, rate: 35_000_000, isExtra: false },
      { id: 1, nama: 'Instruktur & Tim Lapangan',            satuan: 'Paket', jumlah: 1, rate: 7_500_000,  isExtra: false },
    ]
  }
  return [
    { id: 0, nama: 'Jasa Event Organizer & Koordinasi', satuan: 'Paket', jumlah: 1, rate: Math.round(inv.nilaiKontrak * 0.85), isExtra: false },
    { id: 1, nama: 'Peralatan & Perlengkapan',           satuan: 'Paket', jumlah: 1, rate: Math.round(inv.nilaiKontrak * 0.15), isExtra: false },
  ]
}

/* ─── Data dummy order (sumber invoice) ─────────────── */
const dummyOrdersForInvoice = [
  {
    id: 'EV-26-0003',
    namaKlien: 'PT. Sinar Abadi',
    tipeKlien: 'Corporate',
    namaEvent: 'Fun Run Jakarta 2026',
    jenisEvent: 'Fun Run',
    alamatLengkap: 'Jl. Sudirman No. 99, Jakarta Pusat',
    namaKoordinator: 'Bapak Hendra',
    jabatanKoordinator: 'Event Coordinator',
    waKoordinator: '081234567890',
    emailKoordinator: 'hendra@sinar-abadi.co.id',
    picSalesEFM: 'Bagoes',
    programNama: 'Main Organizer – Fun Run Jakarta 2026',
    periodeAwal: '2026-06-01',
    periodeAkhir: '2026-06-28',
    nilaiKontrak: 85_000_000,
    rincianLayanan: [
      { id: 1, item: 'Jasa Event Organizer & Koordinasi',   satuan: 'Paket', jumlah: 1, rateUnit: 50_000_000, total: 50_000_000 },
      { id: 2, item: 'Instruktur & Tim Lapangan (5 orang)', satuan: 'Paket', jumlah: 1, rateUnit: 25_000_000, total: 25_000_000 },
      { id: 3, item: 'Peralatan & Perlengkapan Fitness',    satuan: 'Paket', jumlah: 1, rateUnit: 10_000_000, total: 10_000_000 },
    ],
  },
  {
    id: 'EV-26-0002',
    namaKlien: 'Komunitas Sehat ID',
    tipeKlien: 'Community',
    namaEvent: 'Yoga Festival Senayan 2026',
    jenisEvent: 'Yoga Festival',
    alamatLengkap: 'GBK Senayan, Jakarta Pusat',
    namaKoordinator: 'Ibu Sari',
    jabatanKoordinator: 'Ketua Komunitas',
    waKoordinator: '081398765432',
    emailKoordinator: 'sari@komunitassehat.id',
    picSalesEFM: 'Emma',
    programNama: 'Co-Organizer – Yoga Festival Senayan 2026',
    periodeAwal: '2026-07-01',
    periodeAkhir: '2026-08-15',
    nilaiKontrak: 30_000_000,
    rincianLayanan: [
      { id: 1, item: 'Jasa Event Organizer & Koordinasi', satuan: 'Paket', jumlah: 1, rateUnit: 20_000_000, total: 20_000_000 },
      { id: 2, item: 'Instruktur Yoga & Pilates',          satuan: 'Paket', jumlah: 1, rateUnit: 10_000_000, total: 10_000_000 },
    ],
  },
]

/* ─── Data Settings EFM (info pembayaran invoice) ────── */
const efmCompanySettings = {
  namaPerusahaan:    'Essential Fitness Management',
  namaLegal:         'CV. Bugar Nusantara Jaya',
  alamat:            "Jl. Terogong Raya No. 18, Hampton's Park Apartment, Tower A, Cilandak Barat, Jakarta Selatan",
  email:             'essentialfitnessmanagement@gmail.com',
  website:           'www.essentialfitnessmanagement.com',
  whatsapp:          '+62 811-1992-0666',
  namaBank:          'BCA',
  nomorRekening:     '1234567890',
  atasNamaRekening:  'CV. Bugar Nusantara Jaya',
}

/* ─── Orders eligible untuk dibuatkan invoice ───────── */
const eligibleOrdersForInvoice = dummyOrdersForInvoice

/* ─── Shared UI ─────────────────────────── */
function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${on ? 'bg-[#1E1C43]' : 'bg-gray-200'}`}
      role="switch"
      aria-checked={on}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${on ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
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

/* ─── Invoice Modal ─────────────────────── */
function InvoiceModal({ inv, initialEdit = false, prefill = null, onClose, onStatusUpdate }) {
  const navigate = useNavigate()
  const printRef = useRef(null)
  const settings = getCompanySettings()
  const [editMode, setEditMode] = useState(initialEdit || !inv)

  // ── State untuk VIEW/EDIT mode (ketika inv ada) ──
  const [form, setForm] = useState({
    noInvoice:      inv?.noInvoice     ?? 'INV-EV-NEW',
    tanggalInvoice: inv?.tanggal       ?? '',
    jatuhTempo:     inv?.jatuhTempo    ?? '',
    namaKlien:      inv?.namaKlien     ?? prefill?.namaKlien ?? '',
    alamat:         inv?.alamat        ?? '',
    picKlien:       inv?.picKlien      ?? '',
    orderId:        inv?.orderId       ?? (prefill?.orderId ? prefill.orderId : ''),
    periode:        inv?.periode       ?? prefill?.periode ?? '',
    catatan:        '',
    noRek:          '123-456-7890',
    bank:           'BCA',
    atasNama:       'CV. Bugar Nusantara Jaya',
  })
  const upForm = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const [lineItems, setLineItems] = useState(() => {
    if (!inv && prefill?.rincianLayanan?.length) {
      return prefill.rincianLayanan.map((li, i) => ({
        id: i, nama: li.item, satuan: li.satuan, jumlah: li.jumlah, rate: li.rate, isExtra: false
      }))
    }
    return getDefaultLineItems(inv)
  })
  const addLineItem    = () => setLineItems(it => [...it, { id: Date.now(), nama: '', satuan: 'Bulan', jumlah: 1, rate: 0, isExtra: true }])
  const removeLineItem = idx => setLineItems(it => it.filter((_, i) => i !== idx))
  const updateLineItem = (idx, field, val) => setLineItems(it => it.map((x, i) => i === idx ? { ...x, [field]: val } : x))

  const [mgmtFeeOn,  setMgmtFeeOn]  = useState(false)
  const [mgmtFeePct, setMgmtFeePct] = useState(4)
  const [taxOn,      setTaxOn]      = useState(true)
  const [taxes, setTaxes] = useState([{ id: 0, name: 'PPN', pct: 11, isDeduction: false }])
  const addTax    = () => setTaxes(t => [...t, { id: Date.now(), name: '', pct: 0, isDeduction: false }])
  const removeTax = idx => setTaxes(t => t.filter((_, i) => i !== idx))
  const updateTax = (idx, field, val) => setTaxes(t => t.map((x, i) => i === idx ? { ...x, [field]: val } : x))

  const [localStatus,     setLocalStatus]     = useState(inv?.status ?? 'Draft')
  const [showBuatReceipt, setShowBuatReceipt] = useState(inv?.status === 'Lunas')

  const subtotal   = lineItems.reduce((s, it) => s + (it.jumlah || 0) * (it.rate || 0), 0)
  const mgmtAmt    = mgmtFeeOn ? Math.round(subtotal * mgmtFeePct / 100) : 0
  const afterMgmt  = subtotal + mgmtAmt
  const taxItems   = taxOn ? taxes.map(t => ({ ...t, amount: Math.round(afterMgmt * t.pct / 100) })) : []
  const totalAdd   = taxItems.filter(t => !t.isDeduction).reduce((s, t) => s + t.amount, 0)
  const totalDed   = taxItems.filter(t => t.isDeduction).reduce((s, t) => s + t.amount, 0)
  const grandTotal = afterMgmt + totalAdd - totalDed

  // ── State untuk CREATE mode (ketika !inv) ──
  const [sourceOrder, setSourceOrder] = useState(
    !inv ? (eligibleOrdersForInvoice.find(o => o.id === (prefill?.orderId || '')) || null) : null
  )
  const [selectedOrderId,   setSelectedOrderId]   = useState(!inv && prefill?.orderId ? prefill.orderId : '')
  const [orderSearchQuery,  setOrderSearchQuery]  = useState('')
  const [showOrderDropdown, setShowOrderDropdown] = useState(false)

  const [invoiceEditableData, setInvoiceEditableData] = useState({
    tanggalInvoice:      new Date().toISOString().split('T')[0],
    tanggalJatuhTempo:   '',
    useManagementFee:    false,
    managementFeePercent: 0,
    pajak:               [{ id: 1, nama: 'PPN', persen: 11, aktif: false }],
    catatanInvoice:      '',
  })

  const subtotalCreate          = sourceOrder?.rincianLayanan?.reduce((sum, item) => sum + item.total, 0) || 0
  const managementFeeAmountCreate = invoiceEditableData.useManagementFee
    ? Math.round(subtotalCreate * invoiceEditableData.managementFeePercent / 100) : 0
  const afterSubtotalCreate     = subtotalCreate + managementFeeAmountCreate
  const pajakAmountCreate       = (p) => Math.round(afterSubtotalCreate * p.persen / 100)
  const totalPajakCreate        = invoiceEditableData.pajak.filter(p => p.aktif).reduce((sum, p) => sum + pajakAmountCreate(p), 0)
  const totalTagihanCreate      = afterSubtotalCreate + totalPajakCreate
  const periodeLabel            = prefill?.periode || '—'

  function handleKonfirmasiLunas() {
    setLocalStatus('Lunas')
    setShowBuatReceipt(true)
    if (inv) onStatusUpdate?.(inv.noInvoice, 'Lunas')
  }

  function handleKirimInvoice() {
    if (!invoiceEditableData.tanggalJatuhTempo) {
      alert('Tanggal jatuh tempo wajib diisi.')
      return
    }
    alert('Invoice berhasil dikirim!')
    onClose()
  }

  function handleSimpanDraftInvoice() {
    alert('Draft invoice tersimpan.')
  }

  function handleSelectOrder(order) {
    setSelectedOrderId(order.id)
    setSourceOrder(order)
    setShowOrderDropdown(false)
    setOrderSearchQuery('')
  }

  function handleClearOrder() {
    setSelectedOrderId('')
    setSourceOrder(null)
    setOrderSearchQuery('')
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.order-selector-wrapper')) setShowOrderDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl my-6 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-[16px] font-bold text-[#1E1C43]">
              {inv
                ? `Invoice ${inv.noInvoice}`
                : sourceOrder
                ? `Buat Invoice — ${sourceOrder.namaKlien}`
                : 'Buat Invoice Baru'}
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {inv
                ? `${inv.namaKlien} · ${inv.periode}`
                : sourceOrder
                ? `Order ${selectedOrderId} · ${prefill?.periode || sourceOrder.programNama}`
                : 'Pilih order terlebih dahulu'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {inv && (
              <button
                onClick={() => setEditMode(v => !v)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-[#1E1C43] text-[#1E1C43] hover:bg-[#1E1C43] hover:text-white transition-colors"
              >
                {editMode ? 'Selesai Edit' : 'Edit Invoice'}
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            CREATE MODE — data dari Order, read-only
        ══════════════════════════════════════════ */}
        {!inv && (
          <div className="overflow-y-auto px-6 py-6 space-y-5" style={{ maxHeight: '74vh' }}>

            {/* ── Order Selector ── */}
            {!selectedOrderId && (
              <div className="mb-6">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-[#1E1C43]">Pilih Order</p>
                  <p className="text-xs text-gray-400 mt-0.5">Invoice hanya bisa dibuat dari order yang sudah aktif</p>
                </div>
                <div className="relative order-selector-wrapper">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E1C43] bg-gray-50 focus:bg-white transition-colors"
                      placeholder="Ketik nama klien atau nomor order (contoh: EO-001)..."
                      value={orderSearchQuery}
                      onChange={e => { setOrderSearchQuery(e.target.value); setShowOrderDropdown(true) }}
                      onFocus={() => setShowOrderDropdown(true)}
                    />
                  </div>
                  {showOrderDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                      {/* Header dropdown */}
                      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                          {eligibleOrdersForInvoice.filter(o =>
                            o.namaKlien.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                            o.id.toLowerCase().includes(orderSearchQuery.toLowerCase())
                          ).length} order tersedia
                        </p>
                      </div>
                      {/* List items */}
                      <div className="max-h-64 overflow-y-auto">
                        {eligibleOrdersForInvoice
                          .filter(o =>
                            o.namaKlien.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                            o.id.toLowerCase().includes(orderSearchQuery.toLowerCase())
                          )
                          .map(order => (
                            <button
                              key={order.id}
                              onClick={() => handleSelectOrder(order)}
                              className="w-full text-left px-4 py-4 hover:bg-[#1E1C43]/5 border-b border-gray-50 last:border-0 transition-colors group"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[11px] font-mono font-bold bg-[#1E1C43] text-white px-2 py-0.5 rounded shrink-0">
                                      {order.id}
                                    </span>
                                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#1E1C43]">
                                      {order.namaKlien}
                                    </p>
                                  </div>
                                  <p className="text-xs text-gray-500 truncate">{order.programNama}</p>
                                  <p className="text-[10px] text-gray-400 mt-1">{order.periodeAwal} — {order.periodeAkhir}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Aktif</span>
                                  <span className="text-gray-300 group-hover:text-[#1E1C43] text-xs">→</span>
                                </div>
                              </div>
                            </button>
                          ))
                        }
                        {eligibleOrdersForInvoice.filter(o =>
                          o.namaKlien.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
                          o.id.toLowerCase().includes(orderSearchQuery.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-8 text-center">
                            <p className="text-sm text-gray-400">Order tidak ditemukan</p>
                            <p className="text-xs text-gray-300 mt-1">Coba ketik nama klien atau nomor order lain</p>
                          </div>
                        )}
                      </div>
                      {/* Footer dropdown */}
                      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400">Hanya order berstatus Aktif yang dapat dibuatkan invoice</p>
                      </div>
                    </div>
                  )}
                </div>
                {!orderSearchQuery && !showOrderDropdown && (
                  <p className="text-xs text-gray-400 mt-2 ml-1">Klik kolom di atas untuk melihat semua order yang tersedia</p>
                )}
              </div>
            )}

            {selectedOrderId && (
              <div className="flex items-center justify-between bg-[#1E1C43]/5 border border-[#1E1C43]/15 rounded-xl px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-[#1E1C43] text-white px-1.5 py-0.5 rounded font-semibold">
                      {selectedOrderId}
                    </span>
                    <p className="text-sm font-semibold text-[#1E1C43]">{sourceOrder?.namaKlien}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{sourceOrder?.programNama}</p>
                </div>
                <button onClick={handleClearOrder} className="text-xs text-gray-400 hover:text-red-500 ml-4 shrink-0 transition-colors">
                  × Ganti Order
                </button>
              </div>
            )}

            {/* Semua section di bawah hanya tampil setelah order dipilih */}
            {selectedOrderId && sourceOrder && (
              <>
                {/* A. Header Invoice */}
                <div className="bg-[#1E1C43] rounded-xl px-6 py-5 flex justify-between items-start gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {settings.logoPerusahaan ? (
                        <img src={settings.logoPerusahaan} alt="EFM Logo" className="w-full h-full object-contain p-0.5" />
                      ) : (
                        <span className="text-white font-bold text-sm">EFM</span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-bold text-[14px]">{settings.namaPerusahaan || efmCompanySettings.namaPerusahaan}</p>
                      <p className="text-white/60 text-[11px]">{settings.namaLegal || efmCompanySettings.namaLegal}</p>
                      <p className="text-white/60 text-[11px]">{settings.alamat || efmCompanySettings.alamat}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[24px] font-bold text-white tracking-widest mb-1">INVOICE</p>
                    <p className="text-[11px] text-white/60 mb-2">
                      No: {selectedOrderId ? `INV-EV-${selectedOrderId.replace('EO-', '')}` : '—'}
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-[11px] text-white/60">Tanggal:</span>
                        <input type="date"
                          className="h-6 px-2 rounded bg-white/10 border border-white/20 text-white text-[11px] outline-none focus:border-white/50"
                          value={invoiceEditableData.tanggalInvoice}
                          onChange={e => setInvoiceEditableData(prev => ({ ...prev, tanggalInvoice: e.target.value }))}
                        />
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-[11px] text-white/60">Jatuh Tempo:</span>
                        <input type="date"
                          className="h-6 px-2 rounded bg-white/10 border border-white/20 text-white text-[11px] outline-none focus:border-white/50"
                          value={invoiceEditableData.tanggalJatuhTempo}
                          onChange={e => setInvoiceEditableData(prev => ({ ...prev, tanggalJatuhTempo: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* B. Informasi Klien — read-only dari Order */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Informasi Klien</p>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                      Read-only · dari Order {selectedOrderId}
                    </span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="pb-3 mb-3 border-b border-gray-200">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Kepada</p>
                      <p className="text-[15px] font-bold text-[#1E1C43]">{sourceOrder.namaKlien}</p>
                      <p className="text-[12px] text-gray-500 mt-0.5">{sourceOrder.alamatLengkap}</p>
                      {sourceOrder.namaKoordinator && (
                        <p className="text-[12px] text-gray-500 mt-0.5">
                          u.p. {sourceOrder.namaKoordinator}
                          {sourceOrder.jabatanKoordinator && ` — ${sourceOrder.jabatanKoordinator}`}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Periode Layanan</p>
                        <p className="text-[12px] font-semibold text-gray-700">{periodeLabel}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Order ID</p>
                        <p className="text-[12px] font-semibold text-gray-700">#{selectedOrderId}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* C. Rincian Layanan — read-only dari Order */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Rincian Layanan</p>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Read-only · dari Order</span>
                  </div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase w-8">No</th>
                          <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase">Deskripsi Layanan</th>
                          <th className="text-right px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase">Satuan</th>
                          <th className="text-right px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase">Jumlah</th>
                          <th className="text-right px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase">Rate (Rp)</th>
                          <th className="text-right px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase">Total (Rp)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(sourceOrder.rincianLayanan || []).map((item, idx) => (
                          <tr key={item.id} className="border-b border-gray-100 last:border-0">
                            <td className="px-4 py-3 text-xs text-gray-500">{idx + 1}</td>
                            <td className="px-4 py-3 text-xs text-gray-800">{item.item}</td>
                            <td className="px-4 py-3 text-xs text-gray-600 text-right">{item.satuan}</td>
                            <td className="px-4 py-3 text-xs text-gray-600 text-right">{item.jumlah}</td>
                            <td className="px-4 py-3 text-xs text-gray-600 text-right">{(item.rateUnit || item.rate || 0).toLocaleString('id-ID')}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-gray-800 text-right">{(item.total || 0).toLocaleString('id-ID')}</td>
                          </tr>
                        ))}
                        {(!sourceOrder.rincianLayanan || sourceOrder.rincianLayanan.length === 0) && (
                          <tr>
                            <td colSpan={6} className="px-4 py-4 text-xs text-gray-400 text-center italic">
                              Tidak ada rincian layanan dari order
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* D. Kalkulasi — editable */}
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Kalkulasi</p>
                  <div className="bg-gray-50 rounded-xl px-5 py-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-semibold text-[#1E1C43]">Subtotal</span>
                      <span className="text-[13px] font-semibold text-gray-800">{formatRp(subtotalCreate)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Toggle
                          on={invoiceEditableData.useManagementFee}
                          onToggle={() => setInvoiceEditableData(prev => ({ ...prev, useManagementFee: !prev.useManagementFee }))}
                        />
                        <span className="text-[13px] font-medium text-gray-700">Management Fee</span>
                        {invoiceEditableData.useManagementFee && (
                          <div className="flex items-center gap-2">
                            <input type="number" min={0} max={100}
                              className="w-16 h-7 px-2 rounded border border-gray-200 text-[12px] outline-none focus:border-[#1E1C43]"
                              value={invoiceEditableData.managementFeePercent}
                              onChange={e => setInvoiceEditableData(prev => ({ ...prev, managementFeePercent: parseFloat(e.target.value) || 0 }))}
                            />
                            <span className="text-[12px] text-gray-500">%</span>
                          </div>
                        )}
                        <span className="ml-auto text-[13px] font-medium text-gray-700">
                          {invoiceEditableData.useManagementFee ? formatRp(managementFeeAmountCreate) : '—'}
                        </span>
                      </div>
                      {invoiceEditableData.useManagementFee && (
                        <div className="flex justify-between text-[13px] font-semibold text-[#1E1C43] pt-1">
                          <span>Total setelah Management Fee</span>
                          <span>{formatRp(afterSubtotalCreate)}</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-200 pt-3 space-y-2">
                      <p className="text-[12px] font-semibold text-gray-600">Pajak / Potongan</p>
                      {invoiceEditableData.pajak.map((p, idx) => (
                        <div key={p.id} className="flex items-center gap-2 flex-wrap">
                          <input type="checkbox" checked={p.aktif}
                            onChange={e => {
                              const updated = invoiceEditableData.pajak.map((x, i) => i === idx ? { ...x, aktif: e.target.checked } : x)
                              setInvoiceEditableData(prev => ({ ...prev, pajak: updated }))
                            }}
                            className="rounded" />
                          <input type="text"
                            className="w-20 h-7 px-2 rounded border border-gray-200 text-[12px] outline-none focus:border-[#1E1C43]"
                            value={p.nama}
                            onChange={e => {
                              const updated = invoiceEditableData.pajak.map((x, i) => i === idx ? { ...x, nama: e.target.value } : x)
                              setInvoiceEditableData(prev => ({ ...prev, pajak: updated }))
                            }}
                          />
                          <input type="number"
                            className="w-14 h-7 px-2 rounded border border-gray-200 text-[12px] outline-none focus:border-[#1E1C43]"
                            value={p.persen}
                            onChange={e => {
                              const updated = invoiceEditableData.pajak.map((x, i) => i === idx ? { ...x, persen: parseFloat(e.target.value) || 0 } : x)
                              setInvoiceEditableData(prev => ({ ...prev, pajak: updated }))
                            }}
                          />
                          <span className="text-[12px] text-gray-500">%</span>
                          <span className="ml-auto text-[13px] font-medium text-gray-700">
                            {p.aktif ? formatRp(pajakAmountCreate(p)) : '—'}
                          </span>
                          <button
                            onClick={() => setInvoiceEditableData(prev => ({ ...prev, pajak: prev.pajak.filter((_, i) => i !== idx) }))}
                            className="text-gray-300 hover:text-red-400 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setInvoiceEditableData(prev => ({
                          ...prev,
                          pajak: [...prev.pajak, { id: Date.now(), nama: 'Pajak', persen: 0, aktif: true }]
                        }))}
                        className="flex items-center gap-1 text-[12px] font-semibold text-[#1E1C43] hover:underline"
                      >
                        <Plus size={12} /> Tambah Pajak / Potongan
                      </button>
                    </div>
                    <div className="border-t-2 border-[#1E1C43] pt-3 flex justify-between items-center">
                      <span className="text-[15px] font-bold text-[#1E1C43]">TOTAL TAGIHAN</span>
                      <span className="text-xl font-bold text-[#E05945]">{formatRp(totalTagihanCreate)}</span>
                    </div>
                  </div>
                </div>

                {/* E + F. Catatan Invoice & Informasi Pembayaran — 2 kolom */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Kiri: Catatan Invoice */}
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Catatan Invoice</p>
                    <textarea rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1E1C43] resize-none bg-gray-50"
                      placeholder="Pesan khusus untuk klien (opsional)..."
                      value={invoiceEditableData.catatanInvoice}
                      onChange={e => setInvoiceEditableData(prev => ({ ...prev, catatanInvoice: e.target.value }))}
                    />
                  </div>
                  {/* Kanan: Informasi Pembayaran */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Informasi Pembayaran</p>
                      <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">dari Settings</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Transfer ke:</p>
                    <p className="text-sm font-bold text-gray-800">{efmCompanySettings.namaBank}</p>
                    <p className="text-sm font-mono font-semibold text-gray-800 mt-1">{efmCompanySettings.nomorRekening}</p>
                    <p className="text-xs text-gray-500 mt-0.5">A/N: {efmCompanySettings.atasNamaRekening}</p>
                    <p className="text-[10px] text-gray-400 mt-3 italic">Sertakan nomor invoice saat transfer.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            VIEW / EDIT MODE — invoice yang sudah ada
        ══════════════════════════════════════════ */}
        {inv && (
          <div ref={printRef} className="overflow-y-auto px-6 py-6 space-y-7" style={{ maxHeight: '74vh' }}>

            {/* ── Invoice Header ── */}
            <div className="bg-[#1E1C43] rounded-xl px-6 py-5 flex justify-between items-start gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {settings.logoPerusahaan ? (
                    <img src={settings.logoPerusahaan} alt="EFM Logo" className="w-full h-full object-contain p-0.5" />
                  ) : (
                    <span className="text-white font-bold text-sm">EFM</span>
                  )}
                </div>
                <div>
                  <p className="text-white font-bold text-[14px]">{settings.namaPerusahaan || 'Essential Fitness Management'}</p>
                  <p className="text-white/60 text-[11px]">{settings.namaLegal || 'CV. Bugar Nusantara Jaya'}</p>
                  <p className="text-white/60 text-[11px]">{settings.alamat || 'Jl. Terogong Raya No.18, Jakarta Selatan'}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[24px] font-bold text-white tracking-widest mb-2">INVOICE</p>
                {editMode ? (
                  <div className="space-y-1.5">
                    {/* No Invoice — read-only di edit mode */}
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-white/50 text-[11px]">No Invoice:</span>
                      <span className="text-white text-[11px] font-bold tracking-wide">{form.noInvoice}</span>
                    </div>
                    {/* Tanggal — editable */}
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-white/50 text-[11px]">Tanggal:</span>
                      <input type="date" value={form.tanggalInvoice} onChange={e => upForm('tanggalInvoice', e.target.value)}
                        className="h-6 px-2 rounded bg-white/10 text-white text-[11px] outline-none border border-white/20 w-36" />
                    </div>
                    {/* Jatuh Tempo — editable */}
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-white/50 text-[11px]">Jatuh Tempo:</span>
                      <input type="date" value={form.jatuhTempo} onChange={e => upForm('jatuhTempo', e.target.value)}
                        className="h-6 px-2 rounded bg-white/10 text-white text-[11px] outline-none border border-white/20 w-36" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0.5 text-[11px]">
                    <p><span className="text-white/50">No: </span><span className="text-white font-semibold">{form.noInvoice}</span></p>
                    <p><span className="text-white/50">Tanggal: </span><span className="text-white font-semibold">{form.tanggalInvoice || '—'}</span></p>
                    <p><span className="text-white/50">Jatuh Tempo: </span><span className="text-white font-semibold">{form.jatuhTempo || '—'}</span></p>
                    <div className="mt-2"><StatusBadge status={localStatus} /></div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Info Klien — selalu READ ONLY ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Informasi Klien</p>
                {editMode && (
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Read-only · dari Order</span>
                )}
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="pb-3 mb-3 border-b border-gray-200">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Kepada</p>
                  <p className="text-[15px] font-bold text-[#1E1C43]">{form.namaKlien}</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">{form.alamat}</p>
                  {form.picKlien && <p className="text-[12px] text-gray-500 mt-0.5">u.p. {form.picKlien}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Periode Layanan</p>
                    <p className="text-[12px] font-semibold text-gray-700">{form.periode || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Order ID</p>
                    <p className="text-[12px] font-semibold text-gray-700">{form.orderId || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Rincian Layanan — selalu READ ONLY ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Rincian Layanan</p>
                {editMode && (
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Read-only · dari Order</span>
                )}
              </div>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-8">No</th>
                      <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Deskripsi Layanan</th>
                      <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-20">Satuan</th>
                      <th className="text-center px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-16">Jumlah</th>
                      <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-36">Rate (Rp)</th>
                      <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-36">Total (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => {
                      const rowTotal = (item.jumlah || 0) * (item.rate || 0)
                      return (
                        <tr key={item.id} className="border-b border-gray-50 last:border-0">
                          <td className="px-3 py-2.5 text-gray-400 text-center text-xs">{idx + 1}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-normal text-gray-700">{item.nama}</span>
                              {item.isExtra && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">Biaya Tambahan</span>}
                            </div>
                          </td>
                          <td className="px-3 py-2.5"><span className="text-xs font-normal text-gray-700">{item.satuan}</span></td>
                          <td className="px-3 py-2.5 text-center"><span className="text-xs font-normal text-gray-700">{item.jumlah}</span></td>
                          <td className="px-3 py-2.5 text-right"><span className="text-xs font-normal text-gray-700">{formatRp(item.rate)}</span></td>
                          <td className="px-3 py-2.5 text-xs font-semibold text-[#1E1C43] text-right whitespace-nowrap">{formatRp(rowTotal)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          {/* ── Kalkulasi ── */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Kalkulasi</p>
            <div className="bg-gray-50 rounded-xl px-5 py-4 space-y-4">

              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-semibold text-[#1E1C43]">Subtotal (A)</span>
                <span className="text-[13px] font-semibold text-gray-800">{formatRp(subtotal)}</span>
              </div>

              {/* Management Fee */}
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex items-center gap-3">
                  <Toggle on={mgmtFeeOn} onToggle={() => setMgmtFeeOn(v => !v)} />
                  <span className="text-[13px] font-medium text-gray-700">Management Fee</span>
                </div>
                {mgmtFeeOn && (
                  <div className="pl-12 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-gray-500">Persentase:</span>
                      <input
                        type="number" value={mgmtFeePct} min={0} max={100}
                        onChange={e => setMgmtFeePct(Number(e.target.value))}
                        className="w-16 h-7 px-2 rounded border border-gray-200 text-[12px] outline-none focus:border-[#1E1C43]"
                      />
                      <span className="text-[12px] text-gray-500">%</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-gray-500">Management Fee {mgmtFeePct}%</span>
                      <span className="font-medium text-gray-700">{formatRp(mgmtAmt)}</span>
                    </div>
                    <div className="flex justify-between text-[13px] font-semibold text-[#1E1C43]">
                      <span>Total setelah Management Fee</span>
                      <span>{formatRp(afterMgmt)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pajak */}
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex items-center gap-3">
                  <Toggle on={taxOn} onToggle={() => setTaxOn(v => !v)} />
                  <span className="text-[13px] font-medium text-gray-700">Tambah Pajak</span>
                </div>
                {taxOn && (
                  <div className="pl-12 space-y-2">
                    {taxes.map((tax, idx) => (
                      <div key={tax.id} className="flex items-center gap-2 flex-wrap">
                        {editMode ? (
                          <input value={tax.name} onChange={e => updateTax(idx, 'name', e.target.value)}
                            placeholder="Nama pajak" className="w-28 h-7 px-2 rounded border border-gray-200 text-[12px] outline-none focus:border-[#1E1C43]" />
                        ) : (
                          <span className="w-28 text-[12px] text-gray-700 font-medium">{tax.name}</span>
                        )}
                        {editMode ? (
                          <input type="number" value={tax.pct} min={0} max={100} onChange={e => updateTax(idx, 'pct', Number(e.target.value))}
                            className="w-14 h-7 px-2 rounded border border-gray-200 text-[12px] outline-none focus:border-[#1E1C43]" />
                        ) : (
                          <span className="text-[12px] text-gray-500">{tax.pct}</span>
                        )}
                        <span className="text-[12px] text-gray-500">%</span>
                        {editMode && (
                          <label className="flex items-center gap-1 text-[11px] text-gray-500 cursor-pointer">
                            <input type="checkbox" checked={tax.isDeduction} onChange={e => updateTax(idx, 'isDeduction', e.target.checked)} className="w-3 h-3" />
                            Potongan
                          </label>
                        )}
                        <span className={`ml-auto text-[13px] font-medium ${tax.isDeduction ? 'text-red-500' : 'text-gray-700'}`}>
                          {tax.isDeduction ? '-' : ''}{formatRp(Math.round(afterMgmt * tax.pct / 100))}
                        </span>
                        {editMode && taxes.length > 1 && (
                          <button onClick={() => removeTax(idx)} className="text-gray-300 hover:text-red-400 transition-colors">
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    {editMode && (
                      <button onClick={addTax} className="flex items-center gap-1 text-[12px] font-semibold text-[#1E1C43] hover:underline">
                        <Plus size={12} /> Tambah Pajak
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="border-t-2 border-[#1E1C43] pt-3 flex justify-between items-center">
                <span className="text-[15px] font-bold text-[#1E1C43]">TOTAL TAGIHAN</span>
                <span className="text-xl font-bold text-[#E05945]">{formatRp(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* ── Catatan & Info Pembayaran ── */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Catatan Invoice</p>
              {editMode ? (
                <textarea value={form.catatan} onChange={e => upForm('catatan', e.target.value)}
                  rows={3} placeholder="Catatan opsional untuk klien..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-[13px] outline-none focus:border-[#1E1C43] resize-none" />
              ) : (
                <p className="text-[13px] text-gray-500 whitespace-pre-line">{form.catatan || '—'}</p>
              )}
            </div>
            {/* Kanan: Informasi Pembayaran — selalu READ ONLY */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Informasi Pembayaran</p>
                <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">dari Settings</span>
              </div>
              <p className="text-xs text-gray-500 mb-1">Transfer ke:</p>
              <p className="text-sm font-bold text-gray-800">{efmCompanySettings.namaBank}</p>
              <p className="text-sm font-mono font-semibold text-gray-800 mt-1">{efmCompanySettings.nomorRekening}</p>
              <p className="text-xs text-gray-500 mt-0.5">A/N: {efmCompanySettings.atasNamaRekening}</p>
              <p className="text-[10px] text-gray-400 mt-3 italic">Sertakan nomor invoice saat transfer.</p>
            </div>
          </div>
        </div>
        )}

        {/* Footer — CREATE mode */}
        {!inv && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
              ✕ Batal
            </button>
            <div className="flex items-center gap-2">
              <button onClick={handleSimpanDraftInvoice} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#1E1C43] border border-[#1E1C43] hover:bg-[#1E1C43] hover:text-white transition-colors">
                Simpan Draft
              </button>
              <button onClick={handleKirimInvoice} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#E05945] hover:bg-[#C94A38] transition-colors">
                Kirim Invoice →
              </button>
            </div>
          </div>
        )}

        {/* Footer — VIEW / EDIT mode */}
        {inv && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
            {/* Left: Konfirmasi / Buat Receipt */}
            <div>
              {!editMode && !showBuatReceipt && localStatus !== 'Lunas' && (
                <button onClick={handleKonfirmasiLunas}
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors">
                  Konfirmasi Lunas
                </button>
              )}
              {(!editMode && showBuatReceipt) && (
                <button onClick={() => navigate('/event/receipt')}
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-1.5">
                  Buat Receipt →
                </button>
              )}
            </div>
            {/* Right: mode-dependent actions */}
            <div className="flex items-center gap-2">
              {editMode ? (
                <>
                  <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
                    Batal
                  </button>
                  <button className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#1E1C43] border border-[#1E1C43] hover:bg-[#1E1C43] hover:text-white transition-colors">
                    Simpan Draft
                  </button>
                  <button className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-[#E05945] hover:bg-[#C94A38] transition-colors">
                    Kirim Invoice →
                  </button>
                </>
              ) : (
                <>
                  <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      const el = printRef.current
                      if (!el) return
                      const win = window.open('', '_blank', 'width=900,height=1000')
                      win.document.write(`<!DOCTYPE html><html><head><title>Invoice</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:sans-serif;font-size:13px;color:#111;}</style></head><body>${el.innerHTML}</body></html>`)
                      win.document.close()
                      win.focus()
                      setTimeout(() => { win.print(); win.close() }, 400)
                    }}
                    className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#1E1C43] border border-[#1E1C43] hover:bg-[#1E1C43] hover:text-white transition-colors flex items-center gap-1.5">
                    <Download size={13} /> Download PDF
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Main Page ─────────────────────────── */
export default function EventInvoicePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const incomingState = location.state

  const [invoices,      setInvoices]      = useState(INVOICE_INIT)
  const [bulan,         setBulan]         = useState('')
  const [tahun,         setTahun]         = useState('')
  const [jenis,         setJenis]         = useState('')
  const [statusF,       setStatusF]       = useState('')
  const [filterOrder,   setFilterOrder]   = useState('')
  const [search,        setSearch]        = useState('')
  const [modalInv,      setModalInv]      = useState(null)
  const [modalOpen,     setModalOpen]     = useState(false)
  const [modalEdit,     setModalEdit]     = useState(false)
  const [modalPrefill,  setModalPrefill]  = useState(null)
  const [filterOrderId, setFilterOrderId] = useState(null)
  const [showBanner,    setShowBanner]    = useState(false)

  function handleReset() {
    setBulan(''); setTahun(''); setJenis(''); setStatusF(''); setFilterOrder(''); setSearch('')
  }
  function handleStatusUpdate(noInvoice, newStatus) {
    setInvoices(list => list.map(inv => inv.noInvoice === noInvoice ? { ...inv, status: newStatus } : inv))
  }
  function openView(inv) { setModalInv(inv); setModalEdit(false); setModalPrefill(null); setModalOpen(true) }
  function openNew(prefill = null) { setModalInv(null); setModalEdit(true); setModalPrefill(prefill); setModalOpen(true) }
  function closeModal()  { setModalOpen(false); setModalInv(null); setModalPrefill(null) }

  useEffect(() => {
    if (!incomingState) return
    if (incomingState.action === 'create') {
      openNew(incomingState)
    }
    if (incomingState.action === 'view') {
      const target = INVOICE_INIT.find(
        inv => inv.noInvoice === incomingState.invoiceId ||
        (inv.orderId === incomingState.orderId && inv.periode === incomingState.periode)
      )
      if (target) openView(target)
    }
    if (incomingState.orderId) {
      setFilterOrderId(incomingState.orderId)
      setShowBanner(true)
    }
  }, [incomingState]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => invoices.filter(inv => {
    if (filterOrderId && inv.orderId !== filterOrderId) return false
    if (filterOrder && inv.orderId !== filterOrder) return false
    if (bulan   && !inv.periode.startsWith(bulan))    return false
    if (tahun   && !inv.periode.includes(tahun))      return false
    if (jenis   && inv.jenis   !== jenis)             return false
    if (statusF && inv.status  !== statusF)           return false
    if (search && !inv.namaKlien.toLowerCase().includes(search.toLowerCase())
               && !inv.noInvoice.toLowerCase().includes(search.toLowerCase())
               && !inv.orderId.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [invoices, bulan, tahun, jenis, statusF, filterOrder, search, filterOrderId])

  const kpiLunas   = invoices.filter(i => i.status === 'Lunas').length
  const kpiKirim   = invoices.filter(i => i.status === 'Terkirim').length
  const kpiOverdue = invoices.filter(i => i.status === 'Overdue').length
  const kpiDraft   = invoices.filter(i => i.status === 'Draft').length

  const selectCls   = 'h-9 px-3 pr-7 rounded-lg border border-gray-200 bg-white text-[13px] outline-none appearance-none cursor-pointer hover:border-gray-300 focus:border-[#1E1C43] transition-colors'
  const selectStyle = { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }

  return (
    <>
      <div className="p-6 space-y-5">

        {/* Back to Order button */}
        {incomingState?.orderId && (
          <button
            onClick={() => navigate('/event/orders/' + incomingState.orderId)}
            className="inline-flex items-center gap-1.5 text-xs text-[#1E1C43] hover:underline"
          >
            ← Kembali ke Order {incomingState.orderId}
          </button>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Invoice Event</h1>
            <p className="text-sm text-text-muted mt-1">Daftar semua invoice event</p>
          </div>
          <button
            onClick={() => openNew()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-accent hover:bg-accent-hover transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> Buat Invoice
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Invoice Lunas</p>
            <p className="text-[28px] font-bold text-green-600 leading-none">{kpiLunas}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Pembayaran diterima</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Menunggu Pembayaran</p>
            <p className="text-[28px] font-bold text-blue-600 leading-none">{kpiKirim}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Invoice terkirim</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Overdue</p>
            <p className="text-[28px] font-bold text-red-500 leading-none">{kpiOverdue}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Melewati jatuh tempo</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Draft</p>
            <p className="text-[28px] font-bold text-gray-500 leading-none">{kpiDraft}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Belum dikirim</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          {/* Baris 1: Dropdowns */}
          <div className="flex items-center gap-2 mb-3">
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
            <select value={jenis} onChange={e => setJenis(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] cursor-pointer min-w-0">
              <option value="">Semua Jenis</option>
              <option value="Corporate Event">Corporate Event</option>
              <option value="Government Event">Government Event</option>
              <option value="Brand Event">Brand Event</option>
              <option value="Community Event">Community Event</option>
              <option value="School Event">School Event</option>
              <option value="Private Event">Private Event</option>
              <option value="Family Gathering">Family Gathering</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            <select value={statusF} onChange={e => setStatusF(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] cursor-pointer min-w-0">
              <option value="">Semua Status</option>
              <option value="Draft">Draft</option>
              <option value="Terkirim">Terkirim</option>
              <option value="Lunas">Lunas</option>
              <option value="Overdue">Overdue</option>
            </select>
            <select value={filterOrder} onChange={e => setFilterOrder(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] cursor-pointer min-w-0">
              <option value="">Semua Order</option>
              <option value="EO-001">EO-001 — PT. Sinar Abadi (Fun Run Jakarta 2026)</option>
              <option value="EO-002">EO-002 — Komunitas Sehat ID (Yoga Festival Senayan)</option>
            </select>
            <div style={{ minWidth: '72px' }} />
          </div>
          {/* Baris 2: Search + Reset */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari klien, No Invoice, Order ID..."
                className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43]" />
            </div>
            <button onClick={handleReset}
              className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs px-3 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors whitespace-nowrap flex-shrink-0">
              <RotateCcw size={12} />
              Reset
            </button>
          </div>
        </div>

        {/* Order filter banner */}
        {showBanner && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between no-print">
            <p className="text-xs text-blue-700">
              Menampilkan invoice untuk order:{' '}
              <span className="font-semibold">
                {incomingState?.orderId} — {incomingState?.namaKlien}
              </span>
            </p>
            <button
              onClick={() => {
                setShowBanner(false)
                setFilterOrderId(null)
                navigate('/event/invoice', { replace: true })
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              Lihat Semua Invoice
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]" style={{ minWidth: '1000px' }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[['No Invoice',165],['Order ID',130],['Nama Klien',160],['Nama Event',160],['Periode',120],['Total',130],['Status',120],['Tanggal',120],['Aksi',100]].map(([h, mw]) => (
                    <th key={h} style={{minWidth:mw}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-[13px] text-gray-400">Tidak ada invoice yang cocok dengan filter.</td></tr>
                ) : filtered.map(inv => (
                  <tr key={inv.noInvoice} onClick={() => openView(inv)} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer">
                    <td className="px-3 py-2.5 text-xs font-semibold text-[#1E1C43]">{inv.noInvoice}</td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600">
                      <button
                        onClick={e => { e.stopPropagation(); navigate('/event/orders/' + inv.orderId) }}
                        className="text-[#1E1C43] font-semibold hover:underline"
                      >{inv.orderId}</button>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <p className="text-xs font-medium text-gray-900">{inv.namaKlien}</p>
                      {inv.jenisEvent && <p className="text-[10px] text-gray-400">{inv.jenisEvent}</p>}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-700 whitespace-nowrap">{inv.namaEvent || '—'}</td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600">{inv.periode}</td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-[#1E1C43] whitespace-nowrap">{formatRp(inv.total)}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={inv.status} /></td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600">{inv.tanggal}</td>
                    <td className="px-3 py-2.5">
                      <button onClick={e => e.stopPropagation()} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors" title="Download PDF">
                        <Download size={14} />
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
              <span className="font-semibold text-text-primary">{invoices.length}</span> invoice
            </p>
          </div>
        </div>
      </div>

      {modalOpen && (
        <InvoiceModal
          inv={modalInv}
          initialEdit={modalEdit}
          prefill={modalPrefill}
          onClose={closeModal}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </>
  )
}
