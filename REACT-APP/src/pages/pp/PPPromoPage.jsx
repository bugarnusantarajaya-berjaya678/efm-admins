import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Tag, Plus, ToggleLeft, ToggleRight, Gift,
  Percent, DollarSign, Search, RotateCcw, Calendar, Lock, Unlock,
  Sparkles, Info, Copy, Check,
} from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { getAllPromo, toggleAktif } from '../../data/ppPromoStore'
import { TIPE_LABEL, SUBTIPE_LABEL, TEMA_WARNA_CLS } from '../../data/ppPromoData'

const SUBTIPE_ICON = {
  persen: Percent, nominal: DollarSign,
  treatment: Gift, latihan: Gift, produk: Gift,
}

const STATUS_CLS = {
  true:  'bg-green-50 text-green-700 border-green-200',
  false: 'bg-gray-50 text-gray-500 border-gray-200',
}

const TIPE_CLS = {
  diskon: 'bg-red-50 text-red-600 border-red-200',
  bonus:  'bg-blue-50 text-blue-600 border-blue-200',
}

// Derive effective status string for display
function getEffectiveStatus(p) {
  if (!p.aktif) return 'nonaktif'
  const today = new Date(new Date().toDateString())
  if (p.tanggalBerakhir && today > new Date(p.tanggalBerakhir)) return 'kadaluarsa'
  if (p.tanggalMulai && today < new Date(p.tanggalMulai)) return 'belum_mulai'
  if (p.maxPemakaian !== null && p.jumlahPemakaian >= p.maxPemakaian) return 'kuota_habis'
  return 'aktif'
}

// ── Helper: render kuota display ─────────────────────────────────────────────
function KuotaDisplay({ p }) {
  if (p.maxPemakaian === null) {
    return <span className="text-xs text-gray-400">Unlimited</span>
  }
  const habis = p.jumlahPemakaian >= p.maxPemakaian
  const pct   = Math.round((p.jumlahPemakaian / p.maxPemakaian) * 100)
  return (
    <div>
      <span className={`text-xs font-semibold ${habis ? 'text-red-600' : pct >= 80 ? 'text-yellow-600' : 'text-gray-600'}`}>
        {p.jumlahPemakaian}/{p.maxPemakaian}
      </span>
      {habis && (
        <span className="ml-1 text-xs font-medium border px-2 py-1 rounded-full bg-red-50 text-red-600 border-red-200">Habis</span>
      )}
    </div>
  )
}

// ── Helper: render period display ────────────────────────────────────────────
function fmtTgl(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })
}

export default function PPPromoPage() {
  const navigate = useNavigate()
  const { setCrumbs } = useBreadcrumb()
  const [list, setList]     = useState(() => getAllPromo())
  const [copiedKode, setCopiedKode] = useState(null)
  const [fTipe,   setFTipe]   = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fTema,   setFTema]   = useState('')
  const [search,  setSearch]  = useState('')
  useEffect(() => {
    setCrumbs(['Private Program', 'Promo & Diskon'])
    return () => setCrumbs(null)
  }, [])

  function refresh() { setList(getAllPromo()) }

  function copyKode(e, kode) {
    e.stopPropagation()
    navigator.clipboard.writeText(kode).then(() => {
      setCopiedKode(kode)
      setTimeout(() => setCopiedKode(null), 1500)
    })
  }

  function handleToggle(kode) {
    toggleAktif(kode); refresh()
  }

  function reset() { setFTipe(''); setFStatus(''); setFTema(''); setSearch('') }

  const filtered = list.filter(p => {
    if (fTipe   === 'diskon'   && p.tipe !== 'diskon') return false
    if (fTipe   === 'bonus'    && p.tipe !== 'bonus')  return false
    if (fTema   === 'tematik'  && !p.tema)             return false
    if (fTema   === 'biasa'    && p.tema)              return false
    if (fStatus === 'aktif'    && getEffectiveStatus(p) !== 'aktif') return false
    if (fStatus === 'nonaktif' && getEffectiveStatus(p) === 'aktif') return false
    if (search && !p.kode.toLowerCase().includes(search.toLowerCase()) &&
        !p.label.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalDiskon  = list.filter(p => p.tipe === 'diskon').length
  const totalBonus   = list.filter(p => p.tipe === 'bonus').length
  const totalTematik = list.filter(p => p.tema).length
  const totalAktif   = list.filter(p => getEffectiveStatus(p) === 'aktif').length

  return (
    <div className="flex flex-col gap-4">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#1E1C43] leading-tight">Promo &amp; Diskon</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola kode promo yang dapat digunakan di Order &amp; Invoice PP</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/pp/promo/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#E05945] text-white hover:bg-[#c94a38] transition-colors">
            <Plus size={14} /> Tambah Promo
          </button>
        </div>
      </div>

      {/* ── KPI ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Promo',  val: list.length,   sub: 'semua jenis',        icon: Tag      },
          { label: 'Diskon',       val: totalDiskon,   sub: 'potong harga',       icon: Percent  },
          { label: 'Bonus / Free', val: totalBonus,    sub: 'tidak potong harga', icon: Gift     },
          { label: 'Tematik',      val: totalTematik,  sub: 'promo spesial tema', icon: Sparkles },
        ].map(k => {
          const Icon = k.icon
          return (
            <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <Icon size={16} className="text-[#1E1C43] shrink-0 opacity-60" />
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{k.label}</p>
                <p className="text-2xl font-bold text-[#1E1C43] leading-tight">{k.val}</p>
                <p className="text-[10px] text-gray-400">{k.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Filter + Search ── */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
        <select value={fTipe} onChange={e => setFTipe(e.target.value)}
          className="px-3 py-[7px] border-[1.5px] border-gray-200 rounded-lg text-xs text-gray-700 bg-white outline-none focus:border-[#1E1C43] transition-colors">
          <option value="">Semua Tipe</option>
          <option value="diskon">Diskon</option>
          <option value="bonus">Bonus / Free</option>
        </select>
        <select value={fTema} onChange={e => setFTema(e.target.value)}
          className="px-3 py-[7px] border-[1.5px] border-gray-200 rounded-lg text-xs text-gray-700 bg-white outline-none focus:border-[#1E1C43] transition-colors">
          <option value="">Semua Tema</option>
          <option value="tematik">Tematik</option>
          <option value="biasa">Biasa</option>
        </select>
        <select value={fStatus} onChange={e => setFStatus(e.target.value)}
          className="px-3 py-[7px] border-[1.5px] border-gray-200 rounded-lg text-xs text-gray-700 bg-white outline-none focus:border-[#1E1C43] transition-colors">
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif / Expired</option>
        </select>
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-gray-50 border-[1.5px] border-gray-200 rounded-lg px-3 py-[7px] focus-within:border-[#1E1C43] focus-within:bg-white transition-colors">
          <Search size={13} className="text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari kode / nama promo..."
            className="border-none bg-transparent text-xs outline-none w-full text-gray-700 placeholder:text-gray-400" />
        </div>
        <button onClick={reset}
          className="px-3.5 py-[7px] bg-[#1E1C43] hover:bg-[#2D2B5A] text-white text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5">
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* ── Tabel ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 420px)', minHeight: '240px' }}>
          <table className="w-full" style={{ minWidth: '880px' }}>
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  ['Kode Promo',      160],
                  ['Nama / Deskripsi', 220],
                  ['Tipe',            130],
                  ['Nilai / Benefit', 140],
                  ['Program',         120],
                  ['Kuota',           110],
                  ['Status',          150],
                ].map(([h, mw]) => (
                  <th key={h} style={{ minWidth: mw }} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-xs text-gray-400">Tidak ada data promo.</td></tr>
              )}
              {filtered.map(p => {
                const Icon = SUBTIPE_ICON[p.subTipe] || Tag
                const effStatus = getEffectiveStatus(p)
                const isFullyAktif = effStatus === 'aktif'

                // Status badge config
                const statusCfg = {
                  aktif:       { cls: 'bg-green-50 text-green-700 border-green-200', label: 'Aktif' },
                  nonaktif:    { cls: 'bg-gray-50 text-gray-500 border-gray-200',    label: 'Nonaktif' },
                  kadaluarsa:  { cls: 'bg-gray-50 text-gray-400 border-gray-200',    label: 'Kadaluarsa' },
                  belum_mulai: { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Belum Mulai' },
                  kuota_habis: { cls: 'bg-red-50 text-red-600 border-red-200',       label: 'Kuota Habis' },
                }[effStatus]

                // Period display
                const periodeStr = (p.tanggalMulai || p.tanggalBerakhir)
                  ? [fmtTgl(p.tanggalMulai), fmtTgl(p.tanggalBerakhir)].filter(Boolean).join(' – ')
                  : null

                return (
                  <tr key={p.kode} onClick={() => navigate(`/pp/promo/${p.kode}`)} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">

                    {/* Kode + tema badge */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-[#1E1C43] font-mono tracking-wide bg-gray-100 px-2 py-0.5 rounded-md">{p.kode}</span>
                        <button
                          onClick={e => copyKode(e, p.kode)}
                          title="Salin kode"
                          className="shrink-0 p-1 rounded hover:bg-gray-200 transition-colors text-gray-400 hover:text-[#1E1C43]"
                        >
                          {copiedKode === p.kode
                            ? <Check size={12} className="text-green-600" />
                            : <Copy size={12} />}
                        </button>
                      </div>
                      {p.tema && (
                        <div className="mt-1">
                          <span className={`text-xs font-medium border px-2 py-1 rounded-full ${TEMA_WARNA_CLS[p.tema.warna] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {p.tema.icon} {p.tema.nama}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Nama + periode */}
                    <td className="px-3 py-3">
                      <p className="text-xs font-semibold text-gray-800">{p.label}</p>
                      {p.keterangan && <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[190px]">{p.keterangan}</p>}
                      {periodeStr && (
                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Calendar size={9} className="shrink-0" />{periodeStr}
                        </p>
                      )}
                    </td>

                    {/* Tipe */}
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${TIPE_CLS[p.tipe]}`}>
                        {p.tipe === 'diskon' ? '💸 ' : '🎁 '}{TIPE_LABEL[p.tipe]}
                      </span>
                      {p.benefitBonus && (
                        <p className="text-[10px] text-blue-500 mt-0.5 flex items-center gap-1">
                          <Gift size={9} className="shrink-0" />{p.benefitBonus}
                        </p>
                      )}
                    </td>

                    {/* Nilai / Benefit */}
                    <td className="px-3 py-3">
                      {p.tipe === 'diskon' ? (
                        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                          <Icon size={11} className="text-gray-400" />
                          {p.subTipe === 'persen' ? `${p.nilai}%` : `Rp ${(p.nilai || 0).toLocaleString('id-ID')}`}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Gift size={11} className="text-blue-400" />
                          {SUBTIPE_LABEL[p.subTipe]}
                        </span>
                      )}
                    </td>

                    {/* Program */}
                    <td className="px-3 py-3">
                      {p.programIds === null ? (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Unlock size={11} className="text-gray-300 shrink-0" /> Semua
                        </span>
                      ) : (
                        <span
                          className="text-xs font-medium text-blue-600 flex items-center gap-1 cursor-default"
                          title={p.programIds.join(', ')}
                        >
                          <Lock size={11} className="text-blue-400 shrink-0" />
                          {p.programIds.length} Program
                          <Info size={10} className="text-gray-300" />
                        </span>
                      )}
                    </td>

                    {/* Kuota */}
                    <td className="px-3 py-3">
                      <KuotaDisplay p={p} />
                    </td>

                    {/* Status toggle */}
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1">
                        <button onClick={e => { e.stopPropagation(); handleToggle(p.kode) }} className="flex items-center gap-1.5">
                          {p.aktif
                            ? <ToggleRight size={18} className="text-[#1E1C43] shrink-0" />
                            : <ToggleLeft  size={18} className="text-gray-300 shrink-0" />}
                          <span className={`text-xs font-medium border px-2 py-1 rounded-full whitespace-nowrap ${statusCfg.cls}`}>
                            {statusCfg.label}
                          </span>
                        </button>
                        {!isFullyAktif && p.aktif && (
                          <p className="text-[10px] text-gray-400 pl-0.5">toggle = aktif manual</p>
                        )}
                      </div>
                    </td>

                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Info banner ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex gap-3 items-start">
        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-blue-700">Cara penggunaan kode promo</p>
          <p className="text-[10px] text-blue-600 leading-relaxed">
            Promo <strong>Diskon</strong> memotong total harga invoice (persen atau nominal). Promo <strong>Bonus/Free</strong> tidak mengubah harga — klien tetap bayar penuh dan mendapat benefit tambahan yang dicatat di invoice.
          </p>
          <p className="text-[10px] text-blue-600 leading-relaxed">
            Kode dapat dimasukkan saat <strong>membuat order baru</strong> atau di mode edit <strong>Invoice Detail</strong>. Sistem otomatis memvalidasi 5 lapisan: status aktif, periode berlaku, program yang berlaku, dan kuota pemakaian.
          </p>
        </div>
      </div>

    </div>
  )
}
