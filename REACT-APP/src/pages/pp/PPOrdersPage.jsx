import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search, FileText, Receipt, ClipboardList, ChevronDown, RotateCcw } from 'lucide-react'
import { PIC_OPTS, PAKET_OPTS } from '../../data/ppOrdersData'
import { getAllOrders } from '../../data/ppOrdersStore'
import { avatarColor, initials } from '../../data/ppLeadsData'

// ─── Constants ────────────────────────────────────────────────────────────────

const ROWS_PER_PAGE = 10

const ORDER_STYLE = {
  'Aktif':     'bg-[#EAFAF1] text-[#1E8449]',
  'Completed': 'bg-[#EBF5FB] text-[#1A6FA3]',
  'Cancelled': 'bg-[#FDEDEC] text-[#C0392B]',
}
const ORDER_LABEL = { 'Aktif': 'Aktif', 'Completed': 'Selesai', 'Cancelled': 'Dibatalkan' }

const INV_STYLE = {
  paid:    'bg-[#EAFAF1] text-[#1E8449]',
  pending: 'bg-[#FEF9E7] text-[#D68910]',
  overdue: 'bg-[#FDEDEC] text-[#C0392B]',
}
const INV_LABEL = { paid: 'Lunas', pending: 'Menunggu Pembayaran', overdue: 'Jatuh Tempo' }

const TAHAPAN_STYLE = {
  'Invoice':            'bg-amber-50 text-amber-700 border border-amber-200',
  'Agreement':          'bg-blue-50 text-blue-700 border border-blue-200',
  'Program Berjalan':   'bg-green-50 text-green-700 border border-green-200',
  'Program Selesai':    'bg-gray-100 text-gray-600 border border-gray-200',
  'Kontrak Dibatalkan': 'bg-red-50 text-red-600 border border-red-200',
}

const BULAN_NUMS = {
  Januari:1, Februari:2, Maret:3, April:4, Mei:5, Juni:6,
  Juli:7, Agustus:8, September:9, Oktober:10, November:11, Desember:12,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRp(n) {
  return 'Rp ' + (n || 0).toLocaleString('id-ID')
}

function fmtTgl(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function deriveStatusInv(order) {
  const pts = order.paymentTracking || []
  if (pts.length === 0)                        return 'pending'
  if (pts.some(p => p.status === 'Terlambat')) return 'overdue'
  if (pts.every(p => p.status === 'Lunas'))    return 'paid'
  return 'pending'
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
  const label = type === 'order' ? ORDER_LABEL[status] : INV_LABEL[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${style ?? ''}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />{label ?? status}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PPOrdersPage() {
  const navigate          = useNavigate()
  const [searchParams]    = useSearchParams()
  const [orders]          = useState(() => getAllOrders())
  const [filterBulan, setFilterBulan]   = useState('')
  const [filterTahun, setFilterTahun]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterInv, setFilterInv]       = useState('')
  const [filterPIC, setFilterPIC]       = useState('')
  const [filterPaket, setFilterPaket]   = useState('')
  const [search, setSearch]             = useState('')
  const [page, setPage]                 = useState(1)
  const [highlightId, setHighlightId]   = useState('')
  const [showDocMenu, setShowDocMenu]   = useState(false)
  const highlightRef                    = useRef(null)
  const docMenuRef                      = useRef(null)

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
  const active    = orders.filter(o => o.statusOrder === 'Aktif').length
  const completed = orders.filter(o => o.statusOrder === 'Completed').length
  const cancelled = orders.filter(o => o.statusOrder === 'Cancelled').length

  // Filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return orders.filter(o => {
      const tgl = o.tanggalMulai ? new Date(o.tanggalMulai) : null
      const matchBulan  = !filterBulan  || (tgl && tgl.getMonth() + 1 === BULAN_NUMS[filterBulan])
      const matchTahun  = !filterTahun  || (tgl && tgl.getFullYear() === parseInt(filterTahun))
      const matchStatus = !filterStatus || o.statusOrder === filterStatus
      const matchInv    = !filterInv    || deriveStatusInv(o) === filterInv
      const matchPIC    = !filterPIC    || o.picSalesEFM === filterPIC
      const matchPaket  = !filterPaket  || o.paket === filterPaket
      const matchSearch = !q || o.namaKlien.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
      return matchBulan && matchTahun && matchStatus && matchInv && matchPIC && matchPaket && matchSearch
    }).sort((a, b) => b.id.localeCompare(a.id))
  }, [orders, filterBulan, filterTahun, filterStatus, filterInv, filterPIC, filterPaket, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const pageRows   = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE)

  const resetFilter = () => {
    setFilterBulan(''); setFilterTahun('')
    setFilterStatus(''); setFilterInv(''); setFilterPIC(''); setFilterPaket('')
    setSearch(''); setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Page header — first-class entity */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Orders Private Training</h1>
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
              <ChevronDown size={12} className={`transition-transform duration-200 ${showDocMenu ? 'rotate-180' : ''}`} />
            </button>
            {showDocMenu && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[168px]">
                {[
                  { icon: FileText,      label: 'Invoice',    path: '/pp/invoice' },
                  { icon: Receipt,       label: 'Receipt',    path: '/pp/receipt' },
                  { icon: FileText,      label: 'Agreement',  path: '/pp/documents' },
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#E05945] hover:bg-[#c94a38] transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> Tambah Order
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatMini label="Total Order" value={total}     accent="orange" />
        <StatMini label="Aktif"       value={active}    />
        <StatMini label="Selesai"     value={completed} accent="green"  />
        <StatMini label="Dibatalkan"  value={cancelled} accent="red"    />
      </div>

      {/* Filter bar */}
      <div className="bg-bg-surface border border-border rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
        <select value={filterBulan} onChange={e => { setFilterBulan(e.target.value); setPage(1) }}
          className="px-3 py-2 border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
          <option value="">Semua Bulan</option>
          {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map(b => <option key={b}>{b}</option>)}
        </select>
        <select value={filterTahun} onChange={e => { setFilterTahun(e.target.value); setPage(1) }}
          className="px-3 py-2 border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
          <option value="">Semua Tahun</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
        {[
          { value: filterStatus, set: (v) => { setFilterStatus(v); setPage(1) }, opts: [['','Status Order'],['Aktif','Aktif'],['Completed','Selesai'],['Cancelled','Dibatalkan']] },
          { value: filterInv,    set: (v) => { setFilterInv(v);    setPage(1) }, opts: [['','Status Invoice'],['paid','Lunas'],['pending','Menunggu Pembayaran'],['overdue','Jatuh Tempo']] },
          { value: filterPIC,    set: (v) => { setFilterPIC(v);    setPage(1) }, opts: [['','Semua PIC'],    ...PIC_OPTS.map(p => [p, p])] },
          { value: filterPaket,  set: (v) => { setFilterPaket(v);  setPage(1) }, opts: [['','Semua Paket'],  ...PAKET_OPTS.map(p => [p, p])] },
        ].map((f, i) => (
          <select key={i} value={f.value} onChange={(e) => f.set(e.target.value)}
            className="px-3 py-2 border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
            {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-bg-page border-[1.5px] border-border rounded-lg px-3 py-2 focus-within:border-primary focus-within:bg-white transition-colors">
          <Search size={14} className="text-text-muted shrink-0" />
          <input
            type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari nama klien atau order ID..."
            className="border-none bg-transparent text-xs outline-none w-full text-text-primary placeholder:text-text-muted"
          />
        </div>
        <button onClick={resetFilter} className="px-3.5 py-2 bg-primary hover:bg-primary-2 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5">
          <RotateCcw size={12} /> Reset
        </button>
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
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 400px)', minHeight: '280px' }}>
          <table className="w-full text-sm min-w-[1250px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-100">
                <th style={{minWidth:'130px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                <th style={{minWidth:'160px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Nama Klien</th>
                <th style={{minWidth:'150px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Paket</th>
                <th style={{minWidth:'130px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Nilai Kontrak</th>
                <th style={{minWidth:'145px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tahapan</th>
                <th style={{minWidth:'110px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tgl. Mulai</th>
                <th style={{minWidth:'120px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status Order</th>
                <th style={{minWidth:'120px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status Invoice</th>
                <th style={{minWidth:'120px'}} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">PIC</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-text-muted text-sm">Tidak ada order yang sesuai filter.</td></tr>
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
                          style={{ background: avatarColor(order.namaKlien) }}>
                          {initials(order.namaKlien)}
                        </div>
                        <span className="text-xs font-medium text-gray-900 whitespace-nowrap">{order.namaKlien}</span>
                      </div>
                    </td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{order.paket}</td>
                    <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{formatRp(order.nilaiKontrak)}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${TAHAPAN_STYLE[order.tahapan] ?? 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                        {order.tahapan || '—'}
                      </span>
                    </td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{fmtTgl(order.tanggalMulai)}</td>
                    <td className="px-3 py-2.5"><Badge type="order" status={order.statusOrder} /></td>
                    <td className="px-3 py-2.5"><Badge type="inv"   status={deriveStatusInv(order)} /></td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{order.picSalesEFM}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
          <p className="text-xs text-text-muted">
            Menampilkan {filtered.length === 0 ? 0 : (safePage - 1) * ROWS_PER_PAGE + 1}–{Math.min(safePage * ROWS_PER_PAGE, filtered.length)} dari {filtered.length} orders
          </p>
          <div className="flex items-center gap-1">
            <PBtn label="‹" onClick={() => setPage(p => Math.max(1, p - 1))}         disabled={safePage === 1}         />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <PBtn key={p} label={p} onClick={() => setPage(p)} active={p === safePage} />
            ))}
            <PBtn label="›" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} />
          </div>
        </div>
      </div>
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
