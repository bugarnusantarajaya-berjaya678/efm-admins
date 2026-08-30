import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, FileText, Receipt, ChevronDown } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const ROWS_PER_PAGE = 10

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRpShort(n) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000)     return `Rp ${Math.round(n / 1_000_000)}jt`
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n)
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const ORDERS_DATA = [
  {
    id: '#EV-26-0003', namaKlien: 'Yayasan Kanker Indonesia', jenis: 'Foundation',
    namaEvent: 'Health Run for Hope 2026', jenisEvent: 'Charity Run',
    nilaiKontrak: 'Rp 85jt', nilaiNum: 85_000_000,
    tglEvent: '28 Jun 2026', bulan: 'Jun', tahun: '2026',
    tahapan: 'Event Running', status: 'Aktif', pic: 'Bagoes',
  },
  {
    id: '#EV-26-0002', namaKlien: 'PT. Garuda Nusa Tbk', jenis: 'Corporate',
    namaEvent: 'Corporate Fun Run 2026', jenisEvent: 'Fun Run',
    nilaiKontrak: 'Rp 40jt', nilaiNum: 40_000_000,
    tglEvent: '15 Jul 2026', bulan: 'Jul', tahun: '2026',
    tahapan: 'Contract', status: 'Aktif', pic: 'Emma',
  },
  {
    id: '#EV-26-0001', namaKlien: 'Dinas Pemuda & Olahraga DKI', jenis: 'Government',
    namaEvent: 'Hari Olahraga Nasional DKI', jenisEvent: 'Mass Event',
    nilaiKontrak: 'Rp 120jt', nilaiNum: 120_000_000,
    tglEvent: '17 Agu 2026', bulan: 'Agu', tahun: '2026',
    tahapan: 'Quotation & LOI', status: 'Pending', pic: 'Bagoes',
  },
]

// ─── Badge styling ────────────────────────────────────────────────────────────

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

// ─── Stat Mini ────────────────────────────────────────────────────────────────

function StatMini({ label, value, accent }) {
  const ringCls = { orange: 'border-[#E05945]', green: 'border-green-500', amber: 'border-amber-400' }
  const textCls = { orange: 'text-[#E05945]',   green: 'text-green-600',   amber: 'text-amber-500'  }
  return (
    <div className={`bg-white rounded-xl border-[1.5px] px-4 py-3 ${accent ? (ringCls[accent] ?? 'border-[#E05945]') : 'border-gray-200'}`}>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-bold ${accent ? (textCls[accent] ?? 'text-[#E05945]') : 'text-[#1E1C43]'}`}>{value}</p>
    </div>
  )
}

// ─── Pagination button ────────────────────────────────────────────────────────

function PBtn({ label, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={[
        'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors',
        active   ? 'bg-[#1E1C43] text-white border-[#1E1C43]'                        : '',
        disabled ? 'opacity-35 cursor-not-allowed border-gray-200 text-gray-400'     : '',
        !active && !disabled ? 'border-gray-200 text-gray-500 hover:border-[#1E1C43] hover:text-[#1E1C43]' : '',
      ].join(' ')}>
      {label}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventOrdersPage() {
  const navigate = useNavigate()

  const [bulan,       setBulan]       = useState('')
  const [tahun,       setTahun]       = useState('')
  const [tipe,        setTipe]        = useState('')
  const [statusF,     setStatusF]     = useState('')
  const [tahapanF,    setTahapanF]    = useState('')
  const [search,      setSearch]      = useState('')
  const [page,        setPage]        = useState(1)
  const [showDocMenu, setShowDocMenu] = useState(false)
  const docMenuRef = useRef(null)

  useEffect(() => {
    if (!showDocMenu) return
    function handleClickOutside(e) {
      if (docMenuRef.current && !docMenuRef.current.contains(e.target)) setShowDocMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDocMenu])

  function handleReset() {
    setBulan(''); setTahun(''); setTipe(''); setStatusF(''); setTahapanF(''); setSearch(''); setPage(1)
  }

  const filtered = useMemo(() => {
    return ORDERS_DATA.filter(o => {
      if (bulan    && o.bulan   !== bulan)    return false
      if (tahun    && o.tahun   !== tahun)    return false
      if (tipe     && o.jenis   !== tipe)     return false
      if (statusF  && o.status  !== statusF)  return false
      if (tahapanF && o.tahapan !== tahapanF) return false
      if (search && !o.namaKlien.toLowerCase().includes(search.toLowerCase())
                 && !o.id.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }).sort((a, b) => b.id.localeCompare(a.id))
  }, [bulan, tahun, tipe, statusF, tahapanF, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const pageRows   = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE)

  const kpiAktif   = ORDERS_DATA.filter(o => o.status === 'Aktif').length
  const kpiNilai   = ORDERS_DATA.filter(o => o.status === 'Aktif').reduce((s, o) => s + o.nilaiNum, 0)
  const kpiPending = ORDERS_DATA.filter(o => !['Contract','Event Running','Event Selesai'].includes(o.tahapan) && !['Selesai','Batal'].includes(o.status)).length
  const kpiSelesai = ORDERS_DATA.filter(o => o.status === 'Selesai').length

  const SELECT_CLS = 'px-3 py-2 border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors'

  return (
    <div className="flex flex-col gap-4">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">B2B Event Orders</h1>
          <p className="text-sm text-text-muted mt-1">Kelola order & deal event klien aktif</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Dokumen dropdown */}
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
              <div className="absolute left-0 sm:left-auto sm:right-0 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px]">
                {[
                  { icon: FileText, label: 'Invoice', path: '/event/invoice' },
                  { icon: Receipt,  label: 'Receipt', path: '/event/receipt' },
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
            onClick={() => navigate('/event/orders/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#E05945] hover:bg-[#c94a38] transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> Tambah Order
          </button>
        </div>
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatMini label="Total Event Aktif"  value={kpiAktif}                accent="orange" />
        <StatMini label="Nilai Kontrak"      value={formatRpShort(kpiNilai)}                 />
        <StatMini label="Menunggu Dokumen"   value={kpiPending}              accent="amber"  />
        <StatMini label="Selesai"            value={kpiSelesai}              accent="green"  />
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-bg-surface border border-border rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
        <select value={bulan} onChange={e => { setBulan(e.target.value); setPage(1) }} className={SELECT_CLS}>
          <option value="">Semua Bulan</option>
          {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'].map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={tahun} onChange={e => { setTahun(e.target.value); setPage(1) }} className={SELECT_CLS}>
          <option value="">Semua Tahun</option>
          {['2026','2025','2024'].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={tipe} onChange={e => { setTipe(e.target.value); setPage(1) }} className={SELECT_CLS}>
          <option value="">Semua Tipe</option>
          {['Corporate','Foundation','Government','Brand','Community','Private','Individual'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1) }} className={SELECT_CLS}>
          <option value="">Semua Status</option>
          {['Aktif','Pending','Selesai','Batal'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={tahapanF} onChange={e => { setTahapanF(e.target.value); setPage(1) }} className={SELECT_CLS}>
          <option value="">Semua Tahapan</option>
          {['Quotation & LOI','MOU','Contract','Event Running','Event Selesai'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-bg-page border-[1.5px] border-border rounded-lg px-3 py-2 focus-within:border-primary focus-within:bg-white transition-colors">
          <Search size={14} className="text-text-muted shrink-0" />
          <input
            type="text" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari nama klien atau Order ID..."
            className="border-none bg-transparent text-xs outline-none w-full text-text-primary placeholder:text-text-muted"
          />
        </div>
        <button onClick={handleReset} className="px-3.5 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors shrink-0">
          Reset
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm" style={{ minWidth: '1100px' }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  ['Order ID', 130], ['Nama Klien', 160], ['Jenis Klien', 110],
                  ['Nama Event', 160], ['Jenis Event', 110], ['Nilai Event', 130],
                  ['Tgl Event', 120], ['Tahapan', 130], ['Status', 110], ['PIC', 100],
                ].map(([h, mw]) => (
                  <th key={h} style={{ minWidth: mw }} className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm text-gray-400">
                    Tidak ada data yang cocok dengan filter.
                  </td>
                </tr>
              ) : pageRows.map(order => (
                <tr
                  key={order.id}
                  onClick={() => navigate('/event/orders/' + order.id.replace('#', ''))}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <td className="px-3 py-2.5 text-sm font-medium text-[#1E1C43] whitespace-nowrap">{order.id}</td>
                  <td className="px-3 py-2.5 text-sm font-semibold text-gray-800 whitespace-nowrap">{order.namaKlien}</td>
                  <td className="px-3 py-2.5"><TipeBadge jenis={order.jenis} /></td>
                  <td className="px-3 py-2.5 text-sm text-gray-700">{order.namaEvent}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600">{order.jenisEvent}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-700 whitespace-nowrap">{order.nilaiKontrak}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 whitespace-nowrap">{order.tglEvent}</td>
                  <td className="px-3 py-2.5"><TahapanBadge tahapan={order.tahapan} /></td>
                  <td className="px-3 py-2.5"><StatusBadge status={order.status} /></td>
                  <td className="px-3 py-2.5 text-sm text-gray-600">{order.pic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Menampilkan{' '}
            {filtered.length === 0 ? 0 : (safePage - 1) * ROWS_PER_PAGE + 1}–{Math.min(safePage * ROWS_PER_PAGE, filtered.length)}{' '}
            dari {filtered.length} orders
          </p>
          <div className="flex items-center gap-1">
            <PBtn label="‹" onClick={() => setPage(p => Math.max(1, p - 1))}          disabled={safePage === 1}         />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <PBtn key={p} label={p} onClick={() => setPage(p)} active={p === safePage} />
            ))}
            <PBtn label="›" onClick={() => setPage(p => Math.min(totalPages, p + 1))}  disabled={safePage === totalPages} />
          </div>
        </div>
      </div>

    </div>
  )
}
