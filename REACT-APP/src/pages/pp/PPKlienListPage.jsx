import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, RotateCcw, AlertCircle, Users, ArrowLeft } from 'lucide-react'
import { getStoredKlien } from '../../data/ppKlienStore'
import { getAllAssessments } from '../../data/ppAssessmentsStore'

/* ═══════════════════════════════════════
   Constants
═══════════════════════════════════════ */
const ROWS = 10

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
  const bCls = { orange: 'border-accent', green: 'border-success', red: 'border-danger', blue: 'border-blue-400' }[accent] || 'border-border'
  const vCls = { orange: 'text-accent', green: 'text-success', red: 'text-danger', blue: 'text-blue-600' }[accent] || 'text-text-primary'
  return (
    <div className={`bg-bg-surface rounded-xl border-[1.5px] ${bCls} px-4 py-3`}>
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${vCls}`}>{value}</div>
      {sub && <div className="text-[11px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  )
}

function PBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center border transition-colors
      ${active ? 'bg-primary text-white border-primary' : 'bg-white text-text-muted border-border hover:border-primary hover:text-primary'}`}>
      {children}
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS))
  const safePage   = Math.min(page, totalPages)
  const pageRows   = filtered.slice((safePage - 1) * ROWS, safePage * ROWS)

  const kpiTotal      = klienAll.length
  const kpiPunyaLead  = klienAll.filter(k =>  k.leadId).length
  const kpiOrphan     = klienAll.filter(k => !k.leadId).length
  const kpiAssessment = klienAll.filter(k => assessmentMap[k.id] > 0).length

  function handleReset() { setSearch(''); setFilterJK(''); setFilterStatus(''); setPage(1) }

  function handleRowClick(klien) {
    navigate(`/pp/klien/${klien.id}`)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">Klien</h1>
              <p className="text-sm text-text-muted mt-0.5">Daftar global semua klien Private Program</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('/pp/leads')}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={12} /> Kembali ke PP Leads
            </button>
          </div>
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
      <div className="bg-bg-surface border border-border rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-bg-page border-[1.5px] border-border rounded-lg px-3 py-2 focus-within:border-primary focus-within:bg-white transition-colors">
          <Search size={14} className="text-text-muted shrink-0" />
          <input
            className="border-none bg-transparent text-xs outline-none w-full text-text-primary placeholder:text-text-muted"
            placeholder="Cari nama klien..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filterJK}
          onChange={e => setFilterJK(e.target.value)}
          className="px-3 py-2 border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors"
        >
          <option value="">Semua JK</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors"
        >
          <option value="">Semua Status</option>
          <option value="punya-lead">Punya Lead</option>
          <option value="orphan">Orphan (tanpa lead)</option>
          <option value="punya-assessment">Punya Assessment</option>
        </select>
        <button
          onClick={handleReset}
          className="px-3.5 py-2 bg-primary hover:bg-primary-2 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 360px)', minHeight: '280px' }}>
          <table className="w-full text-sm" style={{ minWidth: '1100px' }}>
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  ['Klien ID', 120], ['Nama Klien', 200], ['Jenis Kelamin', 130],
                  ['Tgl. Lahir / Usia', 160], ['No HP', 140],
                  ['Lead Terkait', 130], ['Assessment', 130],
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
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-text-muted">
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
                    className="border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50 cursor-pointer"
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
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${JK_CLS[klien.jenisKelamin] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
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
                          <span className="text-xs text-amber-600 font-medium">Orphan</span>
                        </div>
                      )}
                    </td>

                    {/* Assessment Count */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {asmCount > 0 ? (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">
                          {asmCount}×
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-text-muted">
            {filtered.length === 0 ? 'Tidak ada klien ditemukan' : `Menampilkan ${filtered.length === 0 ? 0 : (safePage - 1) * ROWS + 1}–${Math.min(safePage * ROWS, filtered.length)} dari ${filtered.length} klien`}
          </span>
          <div className="flex items-center gap-1.5">
            <PBtn onClick={() => setPage(p => Math.max(1, p - 1))}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </PBtn>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <PBtn key={n} active={n === safePage} onClick={() => setPage(n)}>{n}</PBtn>
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
