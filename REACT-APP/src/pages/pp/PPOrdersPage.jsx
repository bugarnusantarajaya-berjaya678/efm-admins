import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Printer, Search, X, CheckCircle, Receipt, FileText, ClipboardList, ChevronDown } from 'lucide-react'
import {
  ORDERS_INIT, STATUS_ORDER_LABEL, STATUS_INV_LABEL,
  PIC_OPTS, PAKET_OPTS, PAKET_HARGA, formatRp,
} from '../../data/ppOrdersData'
import { avatarColor, initials } from '../../data/ppLeadsData'

// ─── Constants ────────────────────────────────────────────────────────────────

const ROWS_PER_PAGE = 10

const ORDER_STYLE = {
  active:    'bg-[#EAFAF1] text-[#1E8449]',
  completed: 'bg-[#EBF5FB] text-[#1A6FA3]',
  cancelled: 'bg-[#FDEDEC] text-[#C0392B]',
}
const INV_STYLE = {
  paid:    'bg-[#EAFAF1] text-[#1E8449]',
  pending: 'bg-[#FEF9E7] text-[#D68910]',
  overdue: 'bg-[#FDEDEC] text-[#C0392B]',
}

// ─── Session Progress Bar ─────────────────────────────────────────────────────

function SessionBar({ done, total, statusOrder }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const barColor =
    statusOrder === 'cancelled' ? '#E74C3C' :
    pct === 100               ? '#27AE60' :
                                '#E05945'
  return (
    <div className="flex flex-col gap-1">
      <div className="h-[5px] bg-border rounded-full w-28 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <span className="text-[11px] text-text-muted">{done}/{total} sesi</span>
    </div>
  )
}

// ─── Stat Mini ────────────────────────────────────────────────────────────────

function StatMini({ label, value, accent }) {
  const ring = { orange:'border-accent text-accent', green:'border-success text-success', red:'border-danger text-danger' }
  return (
    <div className={`bg-bg-surface rounded-xl border-[1.5px] px-4 py-3 ${accent ? ring[accent] : 'border-border'}`}>
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-bold ${accent ? '' : 'text-text-primary'}`}>{value}</p>
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ type, status }) {
  const style = type === 'order' ? ORDER_STYLE[status] : INV_STYLE[status]
  const label = type === 'order' ? STATUS_ORDER_LABEL[status] : STATUS_INV_LABEL[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${style ?? ''}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />{label}
    </span>
  )
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({ order, onClose, onStatusChange }) {
  const [tab, setTab] = useState('order')
  const [newStatus, setNewStatus] = useState(order.statusInv)

  const tabs = [
    { id:'order',   label:'📋 Detail Order' },
    { id:'invoice', label:'🧾 Invoice'       },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-[640px] max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border shrink-0">
          <div>
            <h3 className="text-base font-bold text-text-primary">Detail Order #{order.id}</h3>
            <p className="text-xs text-text-muted mt-0.5">{order.klien} · {order.paket}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-muted hover:border-primary hover:text-primary transition-colors shrink-0">
            <X size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 px-6 py-2.5 bg-bg-page border-b border-border shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === t.id ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'order' && (
            <div className="space-y-4">
              {/* Client info */}
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: avatarColor(order.klien) }}>
                  {initials(order.klien)}
                </div>
                <div>
                  <p className="font-bold text-text-primary">{order.klien}</p>
                  <p className="text-xs text-text-muted mt-0.5">PIC: {order.pic}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <Badge type="order" status={order.statusOrder} />
                  <Badge type="inv"   status={order.statusInv}   />
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Order ID',       `#${order.id}`],
                  ['Paket',          order.paket],
                  ['Tanggal Mulai',  order.tglMulai],
                  ['Total Harga',    formatRp(order.harga)],
                  ['No. Invoice',    order.invNo],
                  ['Progress Sesi',  `${order.sesiDone}/${order.sesiTotal} sesi selesai`],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="bg-bg-page rounded-xl px-4 py-3">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-1">{lbl}</p>
                    <p className="text-[13px] font-semibold text-text-primary">{val}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar detail */}
              <div className="bg-bg-page rounded-xl px-4 py-3">
                <div className="flex justify-between text-xs font-semibold text-text-muted mb-2">
                  <span>Progress Sesi</span>
                  <span>{Math.round((order.sesiDone / order.sesiTotal) * 100)}%</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${Math.round((order.sesiDone / order.sesiTotal) * 100)}%` }} />
                </div>
                <p className="text-xs text-text-muted mt-1.5">{order.sesiDone} dari {order.sesiTotal} sesi telah selesai</p>
              </div>
            </div>
          )}

          {tab === 'invoice' && (
            <div className="space-y-4">
              {/* Invoice header card */}
              <div className="bg-primary rounded-xl px-5 py-4">
                <p className="text-sm font-bold text-white">{order.invNo}</p>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Klien: {order.klien}<br />
                  PIC: {order.pic}<br />
                  Tanggal: {order.tglMulai}
                </p>
              </div>

              {/* Invoice items */}
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-bg-page">
                      <th className="text-left px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-wide">Deskripsi</th>
                      <th className="text-right px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-wide">Jml Sesi</th>
                      <th className="text-right px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-wide">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="px-3 py-2.5 text-text-primary font-medium">{order.paket}</td>
                      <td className="px-3 py-2.5 text-right text-text-muted">{order.sesiTotal}x</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-text-primary">{formatRp(order.harga)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center px-4 py-3 bg-bg-page rounded-xl">
                <span className="text-sm font-bold text-text-primary">Total Pembayaran</span>
                <span className="text-base font-bold text-accent">{formatRp(order.harga)}</span>
              </div>

              {/* Invoice status */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border">
                <span className="text-sm font-semibold text-text-primary">Status Invoice</span>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-text-primary outline-none focus:border-primary font-[Poppins]"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Awaiting Payment</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-border shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-muted border border-border rounded-lg hover:border-primary hover:text-primary transition-colors">
            Tutup
          </button>
          {tab === 'invoice' && newStatus !== order.statusInv && (
            <button
              onClick={() => { onStatusChange(order.id, newStatus); onClose() }}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-success hover:bg-success/90 rounded-lg transition-colors"
            >
              <CheckCircle size={14} /> Simpan Status
            </button>
          )}
          <button className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors">
            <Printer size={14} /> Print Invoice
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── New Order Modal ──────────────────────────────────────────────────────────

function NewOrderModal({ onClose, onSave }) {
  const [form, setForm] = useState({ klien:'', noHp:'', pic:'', paket:'', tglMulai:'' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const harga = PAKET_HARGA[form.paket] ?? 0
  const total = form.paket ? form.paket.split(' ')[0] : 0
  const sesiTotal = parseInt(total) || 0

  const handleSave = () => {
    if (!form.klien.trim()) { alert('Nama klien wajib diisi.'); return }
    if (!form.pic)          { alert('PIC wajib dipilih.'); return }
    if (!form.paket)        { alert('Paket wajib dipilih.'); return }
    if (!form.tglMulai)     { alert('Tanggal mulai wajib diisi.'); return }
    onSave(form, harga, sesiTotal)
    onClose()
  }

  const tglFormatted = form.tglMulai
    ? new Date(form.tglMulai).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
    : '—'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6 pt-12 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[560px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-text-primary">Buat Order Baru</h3>
            <p className="text-xs text-text-muted mt-0.5">Isi detail order private training</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-muted hover:border-primary transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FField label="Nama Klien *">
              <input value={form.klien} onChange={set('klien')} placeholder="Nama lengkap klien" />
            </FField>
            <FField label="No HP Klien">
              <input value={form.noHp} onChange={set('noHp')} placeholder="08xxxxxxxxxx" />
            </FField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FField label="PIC (Pelatih) *">
              <select value={form.pic} onChange={set('pic')}>
                <option value="">Pilih PIC...</option>
                {PIC_OPTS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </FField>
            <FField label="Paket *">
              <select value={form.paket} onChange={set('paket')}>
                <option value="">Pilih Paket...</option>
                {PAKET_OPTS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </FField>
          </div>
          <FField label="Tanggal Mulai *">
            <input type="date" value={form.tglMulai} onChange={set('tglMulai')} />
          </FField>

          {/* Review */}
          {form.paket && (
            <div className="bg-bg-page rounded-xl p-4 space-y-2 border border-border">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">Ringkasan Order</p>
              {[
                ['Klien',        form.klien || '—'],
                ['PIC',          form.pic   || '—'],
                ['Paket',        form.paket],
                ['Total Sesi',   `${sesiTotal} sesi`],
                ['Tanggal Mulai', tglFormatted],
              ].map(([l,v]) => (
                <div key={l} className="flex justify-between text-sm border-b border-border pb-1.5 last:border-0 last:pb-0">
                  <span className="text-text-muted">{l}</span>
                  <span className="font-medium text-text-primary">{v}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-1 border-t-2 border-primary mt-1">
                <span className="text-text-primary">Total Harga</span>
                <span className="text-accent">{formatRp(harga)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-muted border border-border rounded-lg hover:border-primary hover:text-primary transition-colors">Batal</button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-bold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors">Buat Order</button>
        </div>
      </div>
    </div>
  )
}

function FField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-text-primary mb-1.5">{label}</label>
      <div className="[&>input]:w-full [&>input]:px-3 [&>input]:py-2 [&>input]:border [&>input]:border-border [&>input]:rounded-lg [&>input]:text-sm [&>input]:outline-none [&>input]:font-[Poppins] [&>input:focus]:border-primary [&>select]:w-full [&>select]:px-3 [&>select]:py-2 [&>select]:border [&>select]:border-border [&>select]:rounded-lg [&>select]:text-sm [&>select]:outline-none [&>select]:font-[Poppins] [&>select:focus]:border-primary">
        {children}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PPOrdersPage() {
  const navigate          = useNavigate()
  const [searchParams]    = useSearchParams()
  const [orders, setOrders]           = useState(ORDERS_INIT)
  const [filterBulan, setFilterBulan]   = useState('')
  const [filterTahun, setFilterTahun]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterInv, setFilterInv]     = useState('')
  const [filterPIC, setFilterPIC]     = useState('')
  const [filterPaket, setFilterPaket] = useState('')
  const [search, setSearch]           = useState('')
  const [page, setPage]               = useState(1)
  const [drawerOrder, setDrawerOrder] = useState(null)
  const [showNew, setShowNew]         = useState(false)
  const [highlightId, setHighlightId] = useState('')
  const [showDocMenu, setShowDocMenu] = useState(false)
  const highlightRef                  = useRef(null)
  const docMenuRef                    = useRef(null)

  useEffect(() => {
    const hId = searchParams.get('highlight')
    if (hId) {
      setHighlightId(hId)
      setTimeout(() => {
        if (highlightRef.current) {
          highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 300)
    }
  }, [])

  useEffect(() => {
    if (!showDocMenu) return
    function handleClickOutside(e) {
      if (docMenuRef.current && !docMenuRef.current.contains(e.target)) {
        setShowDocMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDocMenu])

  // Stats
  const total     = orders.length
  const active    = orders.filter((o) => o.statusOrder === 'active').length
  const completed = orders.filter((o) => o.statusOrder === 'completed').length
  const cancelled = orders.filter((o) => o.statusOrder === 'cancelled').length

  // Filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const BSHORT = {Januari:'Jan',Februari:'Feb',Maret:'Mar',April:'Apr',Mei:'Mei',Juni:'Jun',Juli:'Jul',Agustus:'Agu',September:'Sep',Oktober:'Okt',November:'Nov',Desember:'Des'}
    return orders.filter((o) => {
      const matchBulan  = !filterBulan  || (o.tglMulai || '').includes(BSHORT[filterBulan] ?? filterBulan)
      const matchTahun  = !filterTahun  || (o.tglMulai || '').includes(filterTahun)
      const matchStatus = !filterStatus || o.statusOrder === filterStatus
      const matchInv    = !filterInv    || o.statusInv   === filterInv
      const matchPIC    = !filterPIC    || o.pic          === filterPIC
      const matchPaket  = !filterPaket  || o.paket        === filterPaket
      const matchSearch = !q || o.klien.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
      return matchBulan && matchTahun && matchStatus && matchInv && matchPIC && matchPaket && matchSearch
    })
  }, [orders, filterBulan, filterTahun, filterStatus, filterInv, filterPIC, filterPaket, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const pageRows   = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE)

  const resetFilter = () => {
    setFilterBulan(''); setFilterTahun('')
    setFilterStatus(''); setFilterInv(''); setFilterPIC(''); setFilterPaket('')
    setSearch(''); setPage(1)
  }

  // Add order
  const handleAddOrder = (form, harga, sesiTotal) => {
    const idx = orders.length + 1
    const today = new Date().toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
    setOrders((prev) => [{
      id:          `PP-${9000 + idx}`,
      klien:       form.klien,
      pic:         form.pic,
      paket:       form.paket,
      harga,
      sesiDone:    0,
      sesiTotal,
      tglMulai:    form.tglMulai
        ? new Date(form.tglMulai).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
        : today,
      statusOrder: 'active',
      statusInv:   'pending',
      invNo:       `INV/EFM/PP/2026/${String(9000 + idx).padStart(4,'0')}`,
    }, ...prev])
  }

  // Update invoice status
  const handleStatusChange = (id, newInvStatus) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, statusInv: newInvStatus } : o))
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Private Training Orders</h1>
          <p className="text-sm text-text-muted mt-1">Kelola semua order klien private training</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={docMenuRef}>
            <button
              onClick={() => setShowDocMenu(v => !v)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <FileText size={14} />
              Dokumen
              <ChevronDown size={13} className={`transition-transform duration-200 ${showDocMenu ? 'rotate-180' : ''}`} />
            </button>
            {showDocMenu && (
              <div className="absolute right-0 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[168px]">
                {[
                  { icon: FileText,     label: 'Invoice',    path: '/pp/invoice' },
                  { icon: Receipt,      label: 'Receipt',    path: '/pp/receipt' },
                  { icon: FileText,     label: 'Agreement',  path: '/pp/documents' },
                  { icon: ClipboardList, label: 'Assessment', path: '/pp/screening' },
                ].map(({ icon: Icon, label, path }) => (
                  <button
                    key={path}
                    onClick={() => { setShowDocMenu(false); navigate(path) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Icon size={14} className="text-gray-400" /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/pp/orders/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-accent hover:bg-accent-hover transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> Tambah Order
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatMini label="Total Orders" value={total}     accent="orange" />
        <StatMini label="Active"       value={active}    />
        <StatMini label="Completed"    value={completed} accent="green"  />
        <StatMini label="Cancelled"    value={cancelled} accent="red"    />
      </div>

      {/* Filter bar */}
      <div className="bg-bg-surface border border-border rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
        <select value={filterBulan} onChange={e => { setFilterBulan(e.target.value); setPage(1) }}
          className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
          <option value="">Semua Bulan</option>
          {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map(b => <option key={b}>{b}</option>)}
        </select>
        <select value={filterTahun} onChange={e => { setFilterTahun(e.target.value); setPage(1) }}
          className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
          <option value="">Semua Tahun</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
        {[
          { value: filterStatus, set: (v) => { setFilterStatus(v); setPage(1) }, opts: [['','Status Order'],['active','Active'],['completed','Completed'],['cancelled','Cancelled']] },
          { value: filterInv,    set: (v) => { setFilterInv(v);    setPage(1) }, opts: [['','Status Invoice'],['paid','Paid'],['pending','Awaiting Payment'],['overdue','Overdue']] },
          { value: filterPIC,    set: (v) => { setFilterPIC(v);    setPage(1) }, opts: [['','Semua PIC'],    ...PIC_OPTS.map((p) => [p,p])] },
          { value: filterPaket,  set: (v) => { setFilterPaket(v);  setPage(1) }, opts: [['','Semua Paket'],  ...PAKET_OPTS.map((p) => [p,p])] },
        ].map((f, i) => (
          <select key={i} value={f.value} onChange={(e) => f.set(e.target.value)}
            className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
            {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-bg-page border-[1.5px] border-border rounded-lg px-3 py-[7px] focus-within:border-primary focus-within:bg-white transition-colors">
          <Search size={14} className="text-text-muted shrink-0" />
          <input
            type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari nama klien atau order ID..."
            className="border-none bg-transparent text-xs outline-none w-full text-text-primary placeholder:text-text-muted"
          />
        </div>
        <button onClick={resetFilter} className="px-3.5 py-[7px] bg-primary hover:bg-primary-2 text-white text-xs font-semibold rounded-lg transition-colors shrink-0">Reset</button>
      </div>

      {/* Highlight banner */}
      {highlightId && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-[#1E1C43]">
            Menampilkan detail untuk Assignment: <span className="font-bold">{highlightId}</span>
          </p>
          <button
            onClick={() => setHighlightId('')}
            className="text-xs font-semibold text-[#E05945] hover:underline whitespace-nowrap"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 420px)', minHeight: '280px' }}>
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-100">
                <th style={{minWidth:'130px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                <th style={{minWidth:'160px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Nama Klien</th>
                <th style={{minWidth:'160px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Paket</th>
                <th style={{minWidth:'130px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">PIC</th>
                <th style={{minWidth:'120px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Progress Sesi</th>
                <th style={{minWidth:'120px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tgl. Mulai</th>
                <th style={{minWidth:'120px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status Order</th>
                <th style={{minWidth:'120px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status Invoice</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-text-muted text-sm">Tidak ada order yang sesuai filter.</td></tr>
              ) : pageRows.map((order) => {
                const isHighlighted = order.id === highlightId
                return (
                <tr
                  key={order.id}
                  ref={isHighlighted ? highlightRef : null}
                  onClick={() => navigate('/pp/orders/' + order.id)}
                  className={`border-b transition-colors duration-150 cursor-pointer ${
                    isHighlighted
                      ? 'bg-yellow-50 border-l-4 border-l-[#E05945] border-b-gray-100 hover:bg-yellow-100'
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <span className="text-xs font-semibold text-[#1E1C43]">#{order.id}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                        style={{ background: avatarColor(order.klien) }}>
                        {initials(order.klien)}
                      </div>
                      <span className="text-xs font-medium text-gray-900 whitespace-nowrap">{order.klien}</span>
                    </div>
                  </td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{order.paket}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{order.pic}</td>
                  <td className="px-3 py-2.5">
                    <SessionBar done={order.sesiDone} total={order.sesiTotal} statusOrder={order.statusOrder} />
                  </td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{order.tglMulai}</td>
                  <td className="px-3 py-2.5"><Badge type="order" status={order.statusOrder} /></td>
                  <td className="px-3 py-2.5"><Badge type="inv"   status={order.statusInv}   /></td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
          <p className="text-xs text-text-muted">
            Menampilkan {filtered.length === 0 ? 0 : (safePage - 1) * ROWS_PER_PAGE + 1}–{Math.min(safePage * ROWS_PER_PAGE, filtered.length)} dari {filtered.length} orders
          </p>
          <div className="flex items-center gap-1">
            <PBtn label="‹" onClick={() => setPage((p) => Math.max(1, p - 1))}        disabled={safePage === 1}         />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PBtn key={p} label={p} onClick={() => setPage(p)} active={p === safePage} />
            ))}
            <PBtn label="›" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} />
          </div>
        </div>
      </div>

      {/* Drawer — commented out, navigasi ke halaman detail sekarang */}
      {/* {drawerOrder && (
        <DetailDrawer
          order={drawerOrder}
          onClose={() => setDrawerOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )} */}

      {/* New Order Modal — commented out, navigasi ke /pp/orders/new sekarang */}
      {/* {showNew && <NewOrderModal onClose={() => setShowNew(false)} onSave={handleAddOrder} />} */}
    </div>
  )
}

function PBtn({ label, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={[
        'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors',
        active   ? 'bg-primary text-white border-primary'                           : '',
        disabled ? 'opacity-35 cursor-not-allowed border-border text-text-muted'   : '',
        !active && !disabled ? 'border-border text-text-muted hover:border-primary hover:text-primary' : '',
      ].join(' ')}>
      {label}
    </button>
  )
}
