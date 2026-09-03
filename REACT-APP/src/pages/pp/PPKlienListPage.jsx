import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, RotateCcw, AlertCircle } from 'lucide-react'
import { getStoredKlien } from '../../data/ppKlienStore'
import { getAllAssessments } from '../../data/ppAssessmentsStore'

/* ═══════════════════════════════════════
   Constants
═══════════════════════════════════════ */
const ROWS_PER_PAGE = 15

const JK_CLS = {
  'Laki-laki': 'bg-blue-50 text-blue-700 border-blue-200',
  'Perempuan':  'bg-pink-50 text-pink-700 border-pink-200',
}

const AVATAR_COLORS = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777','#0284C7']

function getInitials(name) {
  return (name || '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function getAvatarColor(name) {
  let hash = 0
  for (const c of (name || '')) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFFFF
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function hitungUsia(tanggalLahir) {
  if (!tanggalLahir) return null
  const [y, m, d] = tanggalLahir.split('-').map(Number)
  const today = new Date()
  let age = today.getFullYear() - y
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--
  return age
}

function formatTanggal(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`
}

/* ═══════════════════════════════════════
   Small components
═══════════════════════════════════════ */
function StatMini({ label, value, sub, accent }) {
  const bCls = { orange:'border-[#E05945]', green:'border-green-400', red:'border-red-400', blue:'border-blue-400' }[accent] || 'border-gray-200'
  const vCls = { orange:'text-[#E05945]', green:'text-green-600', red:'text-red-500', blue:'text-blue-600' }[accent] || 'text-[#1E1C43]'
  return (
    <div className={`bg-white rounded-xl border-[1.5px] ${bCls} px-4 py-3`}>
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${vCls}`}>{value}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function PaginBtn({ label, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={[
        'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors',
        active   ? 'bg-[#1E1C43] text-white border-[#1E1C43]'                                       : '',
        disabled ? 'opacity-35 cursor-not-allowed border-gray-200 text-gray-400'                    : '',
        !active && !disabled ? 'border-gray-200 text-gray-600 hover:border-[#1E1C43] hover:text-[#1E1C43]' : '',
      ].join(' ')}>
      {label}
    </button>
  )
}

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
export default function PPKlienListPage() {
  const navigate = useNavigate()

  /* Build assessment count per klienId once */
  const [klienAll] = useState(() => getStoredKlien())
  const [assessmentMap] = useState(() => {
    const map = {}
    Object.values(getAllAssessments()).forEach(a => {
      if (a && a.klienId) map[a.klienId] = (map[a.klienId] || 0) + 1
    })
    return map
  })

  const [search,       setSearch]       = useState('')
  const [filterJK,     setFilterJK]     = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page,         setPage]         = useState(1)

  // routeLabels in Topbar already handles '/pp/klien' breadcrumb — no setCrumbs needed
  useEffect(() => { setPage(1) }, [search, filterJK, filterStatus])

  const filtered = useMemo(() =>
    klienAll
      .filter(k => {
        if (search && !(k.nama || '').toLowerCase().includes(search.toLowerCase())) return false
        if (filterJK && k.jenisKelamin !== filterJK) return false
        if (filterStatus === 'punya-lead' && !k.leadId)                 return false
        if (filterStatus === 'orphan'     &&  k.leadId)                 return false
        if (filterStatus === 'punya-assessment' && !(assessmentMap[k.id] > 0)) return false
        return true
      })
      .sort((a, b) => {
        const na = parseInt(a.id.replace('KL-', ''), 10)
        const nb = parseInt(b.id.replace('KL-', ''), 10)
        return nb - na
      })
  , [klienAll, search, filterJK, filterStatus, assessmentMap])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const pageRows   = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE)

  const kpiTotal      = klienAll.length
  const kpiPunyaLead  = klienAll.filter(k =>  k.leadId).length
  const kpiOrphan     = klienAll.filter(k => !k.leadId).length
  const kpiAssessment = klienAll.filter(k => assessmentMap[k.id] > 0).length

  function handleReset() { setSearch(''); setFilterJK(''); setFilterStatus(''); setPage(1) }

  function handleRowClick(klien) {
    navigate(`/pp/klien/${klien.id}`)
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#1E1C43]">Bank Data Klien</h1>
          <p className="text-sm text-gray-500 mt-1">Daftar global semua klien Private Program</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatMini label="Total Klien"       value={kpiTotal}      sub="Semua klien terdaftar"       />
        <StatMini label="Punya Lead"        value={kpiPunyaLead}  sub="Terhubung ke data lead"      accent="blue"   />
        <StatMini label="Orphan"            value={kpiOrphan}     sub="Tanpa lead terhubung"        accent="red"    />
        <StatMini label="Punya Assessment"  value={kpiAssessment} sub="Min. 1 fitness assessment"   accent="green"  />
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-[7px] focus-within:border-[#1E1C43] focus-within:bg-white transition-colors">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            className="border-none bg-transparent text-xs outline-none w-full text-gray-700 placeholder:text-gray-400"
            placeholder="Cari nama klien..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filterJK}
          onChange={e => setFilterJK(e.target.value)}
          className="px-3 py-[7px] border border-gray-200 rounded-lg text-xs text-gray-700 bg-white outline-none focus:border-[#1E1C43] transition-colors"
        >
          <option value="">Semua JK</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-[7px] border border-gray-200 rounded-lg text-xs text-gray-700 bg-white outline-none focus:border-[#1E1C43] transition-colors"
        >
          <option value="">Semua Status</option>
          <option value="punya-lead">Punya Lead</option>
          <option value="orphan">Orphan (tanpa lead)</option>
          <option value="punya-assessment">Punya Assessment</option>
        </select>
        <button
          onClick={handleReset}
          className="px-3.5 py-[7px] bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 420px)', minHeight: '280px' }}>
          <table className="w-full" style={{ minWidth: '1100px' }}>
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  ['Klien ID', 120], ['Nama Klien', 200], ['Jenis Kelamin', 130],
                  ['Tgl. Lahir / Usia', 160], ['No HP', 140],
                  ['Lead Terkait', 130], ['Assessment', 130], ['Status', 110],
                ].map(([h, mw]) => (
                  <th key={h} style={{ minWidth: mw }}
                    className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                    Tidak ada data yang cocok dengan filter.
                  </td>
                </tr>
              ) : pageRows.map(klien => {
                const isOrphan = !klien.leadId
                const usia     = hitungUsia(klien.tanggalLahir)
                const asmCount = assessmentMap[klien.id] || 0

                return (
                  <tr
                    key={klien.id}
                    onClick={() => handleRowClick(klien)}
                    className="border-b border-gray-100 transition-colors duration-150 hover:bg-blue-50/30 cursor-pointer"
                  >
                    {/* Klien ID */}
                    <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">
                      {klien.id}
                    </td>

                    {/* Nama Klien */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background: getAvatarColor(klien.nama) }}>
                          {getInitials(klien.nama)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900 whitespace-nowrap">
                            {klien.sapaan} {klien.nama}
                          </p>
                          {klien.email && (
                            <p className="text-[10px] text-gray-400 whitespace-nowrap">{klien.email}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Jenis Kelamin */}
                    <td className="px-3 py-2.5">
                      {klien.jenisKelamin ? (
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${JK_CLS[klien.jenisKelamin] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          {klien.jenisKelamin}
                        </span>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>

                    {/* Tgl Lahir / Usia */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <p className="text-xs text-gray-700">{formatTanggal(klien.tanggalLahir)}</p>
                      {usia !== null && (
                        <p className="text-[10px] text-gray-400">{usia} tahun</p>
                      )}
                    </td>

                    {/* No HP */}
                    <td className="text-xs text-gray-600 px-3 py-2.5 whitespace-nowrap">
                      {klien.noHp || '—'}
                    </td>

                    {/* Lead Terkait */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {klien.leadId ? (
                        <span className="text-xs font-semibold text-[#1E1C43]">{klien.leadId}</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <AlertCircle size={12} className="text-amber-500 shrink-0" />
                          <span className="text-[10px] text-amber-600 font-medium">Orphan</span>
                        </div>
                      )}
                    </td>

                    {/* Assessment Count */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {asmCount > 0 ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">
                          {asmCount} assessment
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {isOrphan ? (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Orphan
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Aktif
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Menampilkan {filtered.length === 0 ? 0 : (safePage - 1) * ROWS_PER_PAGE + 1}–{Math.min(safePage * ROWS_PER_PAGE, filtered.length)} dari {filtered.length} klien
          </p>
          <div className="flex items-center gap-1">
            <PaginBtn label="‹" onClick={() => setPage(p => Math.max(1, p - 1))}         disabled={safePage === 1} />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <PaginBtn key={p} label={p} onClick={() => setPage(p)} active={p === safePage} />
            ))}
            <PaginBtn label="›" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} />
          </div>
        </div>
      </div>
    </div>
  )
}
