import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Download, X, Plus, Trash2, Search, RotateCcw } from 'lucide-react'

/* ─── Constants ─────────────────────────── */
const BULAN_OPTS  = ['Semua Bulan', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const TAHUN_OPTS  = ['Semua Tahun', '2026', '2025']
const TERMIN_OPTS = ['Semua Termin', 'DP 50%', 'Pelunasan', 'Full Payment']
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
  {
    noInvoice:    'INV-EV-001',
    orderId:      '#EO-001',
    namaEvent:    'Fun Run Jakarta 2026',
    namaKlien:    'Komunitas Lari Jakarta',
    termin:       'DP 50%',
    total:        22_500_000,
    status:       'Lunas',
    tanggal:      '1 Jun 2026',
    tanggalEvent: '15 Jun 2026',
    lokasiEvent:  'GBK, Senayan, Jakarta',
    alamat:       'Jl. Cikini Raya No. 12, Jakarta Pusat',
    picKlien:     'Bapak Rizky',
    jatuhTempo:   '10 Jun 2026',
  },
  {
    noInvoice:    'INV-EV-002',
    orderId:      '#EO-001',
    namaEvent:    'Fun Run Jakarta 2026',
    namaKlien:    'Komunitas Lari Jakarta',
    termin:       'Pelunasan',
    total:        22_500_000,
    status:       'Terkirim',
    tanggal:      '1 Jul 2026',
    tanggalEvent: '15 Jun 2026',
    lokasiEvent:  'GBK, Senayan, Jakarta',
    alamat:       'Jl. Cikini Raya No. 12, Jakarta Pusat',
    picKlien:     'Bapak Rizky',
    jatuhTempo:   '15 Jul 2026',
  },
  {
    noInvoice:    'INV-EV-003',
    orderId:      '#EO-002',
    namaEvent:    'Yoga Festival Senayan',
    namaKlien:    'Yayasan Sehat Indonesia',
    termin:       'DP 50%',
    total:        14_000_000,
    status:       'Lunas',
    tanggal:      '5 Jun 2026',
    tanggalEvent: '20 Jun 2026',
    lokasiEvent:  'GOR Senayan, Jakarta',
    alamat:       'Jl. Hang Tuah No. 8, Jakarta Selatan',
    picKlien:     'Ibu Sari',
    jatuhTempo:   '12 Jun 2026',
  },
  {
    noInvoice:    'INV-EV-004',
    orderId:      '#EO-003',
    namaEvent:    'HUT RI Fitness Challenge',
    namaKlien:    'PT. Nusantara Sejahtera',
    termin:       'DP 50%',
    total:        37_500_000,
    status:       'Draft',
    tanggal:      '10 Jun 2026',
    tanggalEvent: '17 Agu 2026',
    lokasiEvent:  'Lapangan Banteng, Jakarta',
    alamat:       'Jl. Gatot Subroto Kav. 40, Jakarta',
    picKlien:     'Bapak Yudi',
    jatuhTempo:   '20 Jun 2026',
  },
  {
    noInvoice:    'INV-EV-005',
    orderId:      '#EO-004',
    namaEvent:    'Employee Wellness Day',
    namaKlien:    'PT. Tech Innovate Indonesia',
    termin:       'Full Payment',
    total:        32_000_000,
    status:       'Draft',
    tanggal:      '15 Jun 2026',
    tanggalEvent: '5 Jul 2026',
    lokasiEvent:  'Kantor PT. Tech Innovate, SCBD, Jakarta',
    alamat:       'Pacific Place Lt. 20, SCBD, Jakarta',
    picKlien:     'Ibu Wulandari',
    jatuhTempo:   '25 Jun 2026',
  },
]

function getDefaultLineItems(inv) {
  if (!inv) return [{ id: 0, nama: '', satuan: 'Hari', jumlah: 1, rate: 0, isExtra: false }]
  if (inv.orderId === '#EO-001') {
    return [
      { id: 0, nama: 'Koordinasi & Manajemen Event', satuan: 'Hari',  jumlah: 1, rate: 20_000_000, isExtra: false },
      { id: 1, nama: 'Instruktur Fitness (5 orang)', satuan: 'Orang', jumlah: 5, rate: 3_000_000,  isExtra: false },
      { id: 2, nama: 'Peralatan & Perlengkapan',     satuan: 'Paket', jumlah: 1, rate: 5_000_000,  isExtra: false },
    ]
  }
  const base = Math.round(inv.total * 2 * 0.85)
  return [
    { id: 0, nama: 'Koordinasi & Manajemen Event', satuan: 'Hari',  jumlah: 1, rate: Math.round(base * 0.5),      isExtra: false },
    { id: 1, nama: 'Jasa Instruktur Fitness',      satuan: 'Orang', jumlah: 3, rate: Math.round(base * 0.35 / 3), isExtra: false },
    { id: 2, nama: 'Perlengkapan & Logistik',      satuan: 'Paket', jumlah: 1, rate: Math.round(base * 0.15),     isExtra: false },
  ]
}

/* ─── Shared UI ─────────────────────────── */
function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative rounded-full transition-colors duration-200 shrink-0 ${on ? 'bg-[#1E1C43]' : 'bg-gray-200'}`}
      style={{ height: 22, width: 40 }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: on ? 'translateX(20px)' : 'translateX(2px)' }}
      />
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
function InvoiceModal({ inv, initialEdit = false, onClose, onStatusUpdate }) {
  const navigate  = useNavigate()
  const [editMode, setEditMode] = useState(initialEdit || !inv)

  const [form, setForm] = useState({
    noInvoice:      inv?.noInvoice    ?? 'INV-EV-NEW',
    tanggalInvoice: inv?.tanggal      ?? '',
    jatuhTempo:     inv?.jatuhTempo   ?? '',
    namaKlien:      inv?.namaKlien    ?? '',
    alamat:         inv?.alamat       ?? '',
    picKlien:       inv?.picKlien     ?? '',
    orderId:        inv?.orderId      ?? '',
    namaEvent:      inv?.namaEvent    ?? '',
    tanggalEvent:   inv?.tanggalEvent ?? '',
    lokasiEvent:    inv?.lokasiEvent  ?? '',
    termin:         inv?.termin       ?? 'DP 50%',
    catatan:        '',
    noRek:          '123-456-7890',
    bank:           'BCA',
    atasNama:       'CV. Bugar Nusantara Jaya',
  })
  const upForm = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const [lineItems,    setLineItems]    = useState(() => getDefaultLineItems(inv))
  const addLineItem    = () => setLineItems(it => [...it, { id: Date.now(), nama: '', satuan: 'Paket', jumlah: 1, rate: 0, isExtra: true }])
  const removeLineItem = idx => setLineItems(it => it.filter((_, i) => i !== idx))
  const updateLineItem = (idx, field, val) => setLineItems(it => it.map((x, i) => i === idx ? { ...x, [field]: val } : x))

  /* Management Fee: default ON for Event */
  const [mgmtFeeOn,  setMgmtFeeOn]  = useState(true)
  const [mgmtFeePct, setMgmtFeePct] = useState(10)

  /* Taxes: default PPN 11% + PPh Final 2.5% (deduction) */
  const [taxOn,  setTaxOn]  = useState(true)
  const [taxes,  setTaxes]  = useState([
    { id: 0, name: 'PPN',       pct: 11,  isDeduction: false },
    { id: 1, name: 'PPh Final', pct: 2.5, isDeduction: true  },
  ])
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
  const totalDed   = taxItems.filter(t =>  t.isDeduction).reduce((s, t) => s + t.amount, 0)
  const grandTotal = afterMgmt + totalAdd - totalDed
  const isDP       = form.termin === 'DP 50%'
  const dpAmount   = isDP ? Math.round(grandTotal / 2) : 0

  function handleKonfirmasiLunas() {
    setLocalStatus('Lunas')
    setShowBuatReceipt(true)
    if (inv) onStatusUpdate?.(inv.noInvoice, 'Lunas')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl my-6 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-[16px] font-bold text-[#1E1C43]">
              {inv ? `Invoice ${inv.noInvoice}` : 'Buat Invoice Event Baru'}
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {inv ? `${inv.namaEvent} · ${inv.termin}` : 'Isi detail invoice di bawah'}
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

        {/* Body */}
        <div className="overflow-y-auto px-6 py-6 space-y-7" style={{ maxHeight: '74vh' }}>

          {/* ── Invoice Header ── */}
          <div className="bg-[#1E1C43] rounded-xl px-6 py-5 flex justify-between items-start gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="EFM" className="w-11 h-11 rounded-full object-cover" onError={e => { e.target.style.display = 'none' }} />
              </div>
              <div>
                <p className="text-white font-bold text-[14px]">Essential Fitness Management</p>
                <p className="text-white/60 text-[11px]">CV. Bugar Nusantara Jaya</p>
                <p className="text-white/60 text-[11px]">Jl. Terogong Raya No.18, Jakarta Selatan</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[24px] font-bold text-white tracking-widest mb-2">INVOICE</p>
              {editMode ? (
                <div className="space-y-1.5">
                  {[['No Invoice', 'noInvoice', 'text'], ['Tanggal', 'tanggalInvoice', 'date'], ['Jatuh Tempo', 'jatuhTempo', 'date']].map(([label, key, type]) => (
                    <div key={key} className="flex items-center gap-2 justify-end">
                      <span className="text-white/50 text-[11px]">{label}:</span>
                      <input
                        type={type}
                        value={form[key]}
                        onChange={e => upForm(key, e.target.value)}
                        className="h-6 px-2 rounded bg-white/10 text-white text-[11px] outline-none border border-white/20 w-36"
                      />
                    </div>
                  ))}
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

          {/* ── Info Event & Klien ── */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Informasi Event & Klien</p>
            {editMode ? (
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Nama Event',    'namaEvent',    'text'],
                  ['Order ID',      'orderId',      'text'],
                  ['Tanggal Event', 'tanggalEvent', 'date'],
                  ['Termin',        'termin',       'text'],
                ].map(([label, key, type]) => (
                  <div key={key}>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</label>
                    <input type={type} value={form[key]} onChange={e => upForm(key, e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] outline-none focus:border-[#1E1C43] focus:bg-white transition-colors" />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Lokasi Event</label>
                  <input value={form.lokasiEvent} onChange={e => upForm('lokasiEvent', e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] outline-none focus:border-[#1E1C43] focus:bg-white transition-colors" />
                </div>
                {[
                  ['Nama Klien / Organizer', 'namaKlien', 'text'],
                  ['PIC Klien',              'picKlien',  'text'],
                ].map(([label, key, type]) => (
                  <div key={key}>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</label>
                    <input type={type} value={form[key]} onChange={e => upForm(key, e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] outline-none focus:border-[#1E1C43] focus:bg-white transition-colors" />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Alamat</label>
                  <input value={form.alamat} onChange={e => upForm('alamat', e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[13px] outline-none focus:border-[#1E1C43] focus:bg-white transition-colors" />
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-1.5">
                <div>
                  <p className="text-[11px] text-gray-400 mb-0.5">Kepada</p>
                  <p className="text-[15px] font-bold text-[#1E1C43]">{form.namaKlien}</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">{form.alamat}</p>
                  <p className="text-[12px] text-gray-500">PIC: {form.picKlien}</p>
                </div>
                <div className="space-y-1.5 pt-1">
                  {[
                    ['Nama Event',    form.namaEvent],
                    ['Order ID',      form.orderId],
                    ['Tanggal Event', form.tanggalEvent],
                    ['Lokasi Event',  form.lokasiEvent],
                    ['Termin',        form.termin],
                  ].map(([label, val]) => (
                    <div key={label} className="flex gap-2">
                      <span className="text-[12px] text-gray-400 w-32 shrink-0">{label}</span>
                      <span className="text-[12px] font-medium text-gray-700">{val || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Rincian Layanan ── */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Rincian Layanan</p>
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
                    {editMode && <th className="w-8" />}
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => {
                    const rowTotal = (item.jumlah || 0) * (item.rate || 0)
                    return (
                      <tr key={item.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-2.5 text-gray-400 text-center text-xs">{idx + 1}</td>
                        <td className="px-3 py-2.5">
                          {editMode ? (
                            <input value={item.nama} onChange={e => updateLineItem(idx, 'nama', e.target.value)}
                              className="border border-gray-200 rounded px-2 py-1 text-sm w-full outline-none focus:border-[#1E1C43]" />
                          ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-normal text-gray-700">{item.nama}</span>
                              {item.isExtra && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">Biaya Tambahan</span>}
                            </div>
                          )}
                          {editMode && item.isExtra && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 mt-1 inline-block">Biaya Tambahan</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          {editMode ? (
                            <input value={item.satuan} onChange={e => updateLineItem(idx, 'satuan', e.target.value)}
                              className="border border-gray-200 rounded px-2 py-1 text-sm w-full outline-none focus:border-[#1E1C43]" />
                          ) : <span className="text-xs font-normal text-gray-700">{item.satuan}</span>}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {editMode ? (
                            <input type="number" value={item.jumlah} min={0} onChange={e => updateLineItem(idx, 'jumlah', Number(e.target.value))}
                              className="border border-gray-200 rounded px-2 py-1 text-sm w-full outline-none focus:border-[#1E1C43] text-center" />
                          ) : <span className="text-xs font-normal text-gray-700">{item.jumlah}</span>}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {editMode ? (
                            <input type="number" value={item.rate} min={0} onChange={e => updateLineItem(idx, 'rate', Number(e.target.value))}
                              className="border border-gray-200 rounded px-2 py-1 text-sm w-full outline-none focus:border-[#1E1C43] text-right" />
                          ) : <span className="text-xs font-normal text-gray-700">{formatRp(item.rate)}</span>}
                        </td>
                        <td className="px-3 py-2.5 text-xs font-semibold text-[#1E1C43] text-right whitespace-nowrap">{formatRp(rowTotal)}</td>
                        {editMode && (
                          <td className="px-3 py-3 text-center">
                            <button onClick={() => removeLineItem(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {editMode && (
              <button onClick={addLineItem} className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-[#1E1C43] hover:underline">
                <Plus size={13} /> Tambah Item Biaya Lain
              </button>
            )}
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
              <div className="border-t-2 border-[#1E1C43] pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[15px] font-bold text-[#1E1C43]">TOTAL TAGIHAN</span>
                  <span className="text-xl font-bold text-[#E05945]">{formatRp(grandTotal)}</span>
                </div>
                {isDP && dpAmount > 0 && (
                  <div className="flex justify-between items-center bg-blue-50 rounded-lg px-3 py-2">
                    <span className="text-[12px] text-blue-600 font-medium">DP 50% invoice ini</span>
                    <span className="text-[13px] font-bold text-blue-700">{formatRp(dpAmount)}</span>
                  </div>
                )}
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
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Informasi Pembayaran</p>
              {editMode ? (
                <div className="space-y-2">
                  {[['No. Rekening', 'noRek'], ['Bank', 'bank'], ['Atas Nama', 'atasNama']].map(([label, key]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[12px] text-gray-400 w-24 shrink-0">{label}</span>
                      <input value={form[key]} onChange={e => upForm(key, e.target.value)}
                        className="flex-1 h-7 px-2 rounded border border-gray-200 text-[12px] outline-none focus:border-[#1E1C43]" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1 text-[13px]">
                  <p className="text-gray-700">Transfer ke: <strong>{form.bank}</strong></p>
                  <p className="text-gray-700">No. Rekening: <strong>{form.noRek}</strong></p>
                  <p className="text-gray-700">A/N: <strong>{form.atasNama}</strong></p>
                  <p className="text-[11px] text-gray-400 mt-1">Sertakan nomor invoice saat transfer.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
          <div>
            {!editMode && !showBuatReceipt && localStatus !== 'Lunas' && (
              <button onClick={handleKonfirmasiLunas}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors">
                Konfirmasi Lunas
              </button>
            )}
            {!editMode && showBuatReceipt && (
              <button onClick={() => navigate('/event/receipt')}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-1.5">
                Buat Receipt →
              </button>
            )}
          </div>
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
                <button className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#1E1C43] border border-[#1E1C43] hover:bg-[#1E1C43] hover:text-white transition-colors flex items-center gap-1.5">
                  <Download size={13} /> Download PDF
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ─────────────────────────── */
export default function EventInvoicePage() {
  const navigate = useNavigate()

  const [invoices,  setInvoices]  = useState(INVOICE_INIT)
  const [bulan,     setBulan]     = useState('Semua Bulan')
  const [tahun,     setTahun]     = useState('Semua Tahun')
  const [terminF,   setTerminF]   = useState('Semua Termin')
  const [statusF,   setStatusF]   = useState('Semua')
  const [search,    setSearch]    = useState('')
  const [modalInv,  setModalInv]  = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalEdit, setModalEdit] = useState(false)

  const filtered = useMemo(() => invoices.filter(inv => {
    if (bulan   !== 'Semua Bulan'  && !inv.tanggal.includes(bulan))  return false
    if (tahun   !== 'Semua Tahun'  && !inv.tanggal.includes(tahun))  return false
    if (terminF !== 'Semua Termin' && inv.termin  !== terminF)        return false
    if (statusF !== 'Semua'        && inv.status  !== statusF)        return false
    const q = search.toLowerCase()
    if (q && !inv.namaEvent.toLowerCase().includes(q)
          && !inv.noInvoice.toLowerCase().includes(q)
          && !inv.orderId.toLowerCase().includes(q)
          && !inv.namaKlien.toLowerCase().includes(q)) return false
    return true
  }), [invoices, bulan, tahun, terminF, statusF, search])

  function handleStatusUpdate(noInvoice, newStatus) {
    setInvoices(list => list.map(inv => inv.noInvoice === noInvoice ? { ...inv, status: newStatus } : inv))
  }
  function openView(inv) { setModalInv(inv); setModalEdit(false); setModalOpen(true) }
  function openNew()     { setModalInv(null); setModalEdit(true); setModalOpen(true) }
  function closeModal()  { setModalOpen(false); setModalInv(null) }

  const kpiLunas   = invoices.filter(i => i.status === 'Lunas').length
  const kpiKirim   = invoices.filter(i => i.status === 'Terkirim').length
  const kpiOverdue = invoices.filter(i => i.status === 'Overdue').length
  const kpiRevenue = invoices.filter(i => i.status === 'Lunas').reduce((s, i) => s + i.total, 0)

  const selectCls   = 'h-9 px-3 pr-7 rounded-lg border border-gray-200 bg-white text-[13px] outline-none appearance-none cursor-pointer hover:border-gray-300 focus:border-[#1E1C43] transition-colors'
  const selectStyle = { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }

  return (
    <>
      <div className="p-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Invoice Event</h1>
            <p className="text-sm text-text-muted mt-1">Daftar semua invoice event</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-[#E05945] hover:bg-[#C94A38] transition-colors">
            <Plus size={15} strokeWidth={2.5} /> Buat Invoice Manual
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
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
          <div className="bg-white rounded-2xl border-2 border-[#1E1C43] px-5 py-4">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Total Terkumpul</p>
            <p className="text-[20px] font-bold text-[#1E1C43] leading-none">{formatRpShort(kpiRevenue)}</p>
            <p className="text-[11px] text-text-muted mt-1.5">Dari invoice lunas</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5 flex flex-wrap items-center gap-3">
          <select value={bulan}   onChange={e => setBulan(e.target.value)}   className={selectCls} style={selectStyle}>{BULAN_OPTS.map(o => <option key={o}>{o}</option>)}</select>
          <select value={tahun}   onChange={e => setTahun(e.target.value)}   className={selectCls} style={selectStyle}>{TAHUN_OPTS.map(o => <option key={o}>{o}</option>)}</select>
          <select value={terminF} onChange={e => setTerminF(e.target.value)} className={selectCls} style={selectStyle}>{TERMIN_OPTS.map(o => <option key={o}>{o}</option>)}</select>
          <select value={statusF} onChange={e => setStatusF(e.target.value)} className={selectCls} style={selectStyle}>{STATUS_OPTS.map(o => <option key={o}>{o}</option>)}</select>
          <button
            onClick={() => { setBulan('Semua Bulan'); setTahun('Semua Tahun'); setTerminF('Semua Termin'); setStatusF('Semua'); setSearch('') }}
            className="h-9 flex items-center gap-1.5 px-3 rounded-lg border border-[#1E1C43] text-[13px] font-semibold text-[#1E1C43] hover:bg-[#1E1C43] hover:text-white transition-colors"
          >
            <RotateCcw size={13} /> Reset
          </button>
          <div className="relative ml-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari event, No Invoice, Order ID..."
              className="h-9 pl-8 pr-4 rounded-lg border border-gray-200 bg-white text-[13px] outline-none w-64 focus:border-[#1E1C43] transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]" style={{ minWidth: '1000px' }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['No Invoice', 'Order ID', 'Nama Event', 'Termin', 'Total', 'Status', 'Tanggal', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-[13px] text-gray-400">Tidak ada invoice yang cocok dengan filter.</td></tr>
                ) : filtered.map(inv => (
                  <tr key={inv.noInvoice} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-3 py-2.5 text-xs font-semibold text-[#1E1C43]">{inv.noInvoice}</td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600">{inv.orderId}</td>
                    <td className="px-3 py-2.5 text-xs font-medium text-gray-900 whitespace-nowrap">{inv.namaEvent}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        inv.termin === 'DP 50%'    ? 'bg-orange-100 text-orange-700' :
                        inv.termin === 'Pelunasan' ? 'bg-blue-100 text-blue-700'    :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {inv.termin}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-600 whitespace-nowrap">{formatRp(inv.total)}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={inv.status} /></td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600 whitespace-nowrap">{inv.tanggal}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openView(inv)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-[#1E1C43] hover:text-white transition-colors" title="Lihat Invoice">
                          <Eye size={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors" title="Download PDF">
                          <Download size={14} />
                        </button>
                      </div>
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
          onClose={closeModal}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </>
  )
}
