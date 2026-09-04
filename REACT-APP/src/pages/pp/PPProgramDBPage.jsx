import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Layers, RotateCcw, ChevronDown, ToggleLeft, ToggleRight } from 'lucide-react'
import { PIC_DB, PIC_OPTS_DB, formatRp } from '../../data/ppProgramDBData'
import { getStoredPrograms, updateStoredProgram } from '../../data/ppProgramStore'
import { getStoredJenis } from '../../data/ppJenisStore'

const ROWS = 10

/* ─── Components ─── */

function StatMini({ label, value, sub, accent }) {
  const borderCls = { orange: 'border-accent', green: 'border-success', red: 'border-danger', yellow: 'border-warning' }[accent] || 'border-border'
  const valueCls  = { orange: 'text-accent', green: 'text-success', red: 'text-danger', yellow: 'text-warning' }[accent] || 'text-text-primary'
  return (
    <div className={`bg-bg-surface rounded-xl border-[1.5px] ${borderCls} px-4 py-3`}>
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${valueCls}`}>{value}</div>
      {sub && <div className="text-[11px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  )
}

function Badge({ status }) {
  return status === 'aktif'
    ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EAFAF1] text-[#1E8449]">Aktif</span>
    : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F2F3F4] text-[#7F8C8D]">Nonaktif</span>
}

function PBtn({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center border transition-colors
        ${active ? 'bg-primary text-white border-primary' : 'bg-white text-text-muted border-border hover:border-primary hover:text-primary'}`}
    >
      {children}
    </button>
  )
}

/* ─── Main Page ─── */

export default function PPProgramDBPage() {
  const navigate = useNavigate()
  const [programs, setPrograms] = useState(() => getStoredPrograms())
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  const [fStatus, setFStatus] = useState('')
  const [fJenis,  setFJenis]  = useState('')
  const [fPIC,    setFPIC]    = useState('')
  const [fSearch, setFSearch] = useState('')
  const [page,    setPage]    = useState(1)

  const filtered = useMemo(() => {
    const q = fSearch.trim().toLowerCase()
    return programs
      .filter(p => {
        if (fStatus && p.status !== fStatus) return false
        if (fJenis  && p.namaLatihan !== fJenis) return false
        if (fPIC    && p.picId !== fPIC) return false
        if (q) {
          const hay = [p.id, p.namaLatihan, p.namaPaket, (PIC_DB[p.picId]?.fullname || '')].join(' ').toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => parseInt(b.id.split('-').pop()) - parseInt(a.id.split('-').pop()))
  }, [programs, fStatus, fJenis, fPIC, fSearch])

  useEffect(() => { setPage(1) }, [fStatus, fJenis, fPIC, fSearch])

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    if (showMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS))
  const slice = filtered.slice((page - 1) * ROWS, page * ROWS)

  const aktifCount = programs.filter(p => p.status === 'aktif').length
  const prices = programs.map(p => p.harga)
  const minHarga = prices.length ? formatRp(Math.min(...prices)) : '—'
  const maxHarga = prices.length ? formatRp(Math.max(...prices)) : '—'

  function reset() { setFStatus(''); setFJenis(''); setFPIC(''); setFSearch('') }

  function handleToggleAktif(id) {
    const current = programs.find(x => x.id === id)
    if (!current) return
    const newStatus = current.status === 'aktif' ? 'inactive' : 'aktif'
    updateStoredProgram(id, { status: newStatus })
    setPrograms(getStoredPrograms())
  }

  const start = (page - 1) * ROWS + 1
  const end   = Math.min(page * ROWS, filtered.length)

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Database Program Private Training</h1>
          <p className="text-sm text-text-muted mt-1">Kelola paket program, harga, dan penugasan PIC trainer</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Dropdown: Jenis Program & Promo */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(v => !v)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Layers size={14} />
              Pengaturan
              <ChevronDown size={13} className={`transition-transform ${showMenu ? 'rotate-180' : ''}`} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-30 overflow-hidden">
                <button
                  onClick={() => { setShowMenu(false); navigate('/pp/program-db/jenis') }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Layers size={14} className="text-gray-400" />
                  Jenis Program
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/pp/program-db/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} />
            Tambah Program
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatMini label="Total Program" value={programs.length} sub="semua terdaftar" />
        <StatMini label="Program Aktif" value={aktifCount} sub="tersedia di form order" accent="green" />
        <StatMini label="Harga Terendah" value={<span className="text-base">{minHarga}</span>} sub="paket terjangkau" />
        <StatMini label="Harga Tertinggi" value={<span className="text-base">{maxHarga}</span>} sub="paket premium" accent="orange" />
      </div>

      {/* Filters */}
      <div className="bg-bg-surface border border-border rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
        <select className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors" value={fStatus} onChange={e => setFStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
        <select className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors" value={fJenis} onChange={e => setFJenis(e.target.value)}>
          <option value="">Semua Jenis</option>
          {getStoredJenis().filter(j => j.status === 'aktif').map(j => <option key={j.nama} value={j.nama}>{j.nama}</option>)}
        </select>
        <select className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors" value={fPIC} onChange={e => setFPIC(e.target.value)}>
          <option value="">Semua PIC</option>
          {PIC_OPTS_DB.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-bg-page border-[1.5px] border-border rounded-lg px-3 py-[7px] focus-within:border-primary focus-within:bg-white transition-colors">
          <Search size={14} className="text-text-muted shrink-0" />
          <input
            className="border-none bg-transparent text-xs outline-none w-full text-text-primary placeholder:text-text-muted"
            placeholder="Cari nama latihan, paket, atau ID program..."
            value={fSearch}
            onChange={e => setFSearch(e.target.value)}
          />
        </div>
        <button onClick={reset} className="px-3.5 py-[7px] bg-primary hover:bg-primary-2 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5"><RotateCcw size={12} /> Reset</button>
      </div>

      {/* Table */}
      <div className="bg-bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 380px)', minHeight: '280px' }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  { h: 'ID Program',         w: 130 },
                  { h: 'Kode Jenis',         w: 90  },
                  { h: 'Nama Latihan/Terapi',w: 170 },
                  { h: 'Nama Paket',         w: 150 },
                  { h: 'Sesi',               w: 55  },
                  { h: 'Pertemuan',          w: 90  },
                  { h: 'Masa Berlaku',       w: 100 },
                  { h: 'Peserta',            w: 80  },
                  { h: 'PIC',                w: 150 },
                  { h: 'Biaya/Sesi',         w: 110 },
                  { h: 'Harga Paket',        w: 130 },
                  { h: 'Status',             w: 80  },
                ].map(({ h, w }) => (
                  <th key={h} style={{ minWidth: `${w}px` }} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr><td colSpan={12} className="py-10 text-center text-sm text-text-muted">Tidak ada program yang sesuai filter</td></tr>
              ) : slice.map((p) => {
                const pic = PIC_DB[p.picId] || {}
                const kodeJenis = p.id.split('-')[1] || '—'
                return (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer" onClick={() => navigate(`/pp/program-db/${p.id}/edit`)}>
                    <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{p.id}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#1E1C43] text-white">{kodeJenis}</span>
                    </td>
                    <td className="text-xs font-semibold text-gray-700 px-3 py-2.5 whitespace-nowrap">{p.namaLatihan}</td>
                    <td className="text-xs font-semibold text-gray-900 px-3 py-2.5 whitespace-nowrap">{p.namaPaket}</td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5 text-center">{p.sesi}</td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5 text-center">{p.pertemuan}x</td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{p.masa}</td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5 text-center">{p.partisipan} org</td>
                    <td className="px-3 py-2.5">
                      <div className="text-xs font-bold text-[#E05945]">{p.picId}</div>
                      <div className="text-xs text-gray-400">{pic.fullname || '—'}</div>
                    </td>
                    <td className="text-xs font-semibold text-gray-500 px-3 py-2.5 text-right whitespace-nowrap">{formatRp(p.biayaSesiPIC)}</td>
                    <td className="text-xs font-bold text-[#1E1C43] px-3 py-2.5 text-right whitespace-nowrap">{formatRp(p.harga)}</td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => handleToggleAktif(p.id)}
                        className="flex items-center gap-1.5"
                        title={p.status === 'aktif' ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                      >
                        {p.status === 'aktif'
                          ? <ToggleRight size={18} className="text-[#1E1C43] shrink-0" />
                          : <ToggleLeft  size={18} className="text-gray-300 shrink-0"  />}
                        <span className={`text-xs font-medium border px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                          p.status === 'aktif'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                          {p.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {filtered.length === 0 ? 'Tidak ada program ditemukan' : `Menampilkan ${start}–${end} dari ${filtered.length} program`}
          </span>
          <div className="flex items-center gap-1.5">
            <PBtn onClick={() => setPage(p => Math.max(1, p - 1))}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </PBtn>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <PBtn key={n} active={n === page} onClick={() => setPage(n)}>{n}</PBtn>
            ))}
            <PBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </PBtn>
          </div>
        </div>
      </div>

    </div>
  )
}
