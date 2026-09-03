import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Edit, Save, X, User, Heart, Link2, ShoppingBag,
  ClipboardList, AlertTriangle, ExternalLink,
} from 'lucide-react'
import { getKlienById, updateKlien } from '../../data/ppKlienStore'
import { getLeadById } from '../../data/ppLeadsStore'
import { getOrderById } from '../../data/ppOrdersStore'
import { getAllAssessments } from '../../data/ppAssessmentsStore'
import { useBreadcrumb } from '../../context/BreadcrumbContext'

/* ─── Helpers ─── */
const AVATAR_COLORS = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777','#0284C7']

function getAvatarColor(name) {
  let hash = 0
  for (const c of (name || '')) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFFFF
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name) {
  return (name || '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
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

const ORDER_STATUS_CLS = {
  active:    'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
}
const ORDER_STATUS_LABEL = { active: 'Aktif', completed: 'Selesai', cancelled: 'Dibatalkan', pending: 'Pending' }

const LEAD_STATUS_CLS = {
  'closed-won':  'bg-green-50 text-green-700 border-green-200',
  'closed-lost': 'bg-red-50 text-red-700 border-red-200',
  'follow-up':   'bg-yellow-50 text-yellow-700 border-yellow-200',
  'new':         'bg-blue-50 text-blue-700 border-blue-200',
}
const LEAD_STATUS_LABEL = { 'closed-won': 'Convert', 'closed-lost': 'Lost', 'follow-up': 'Follow Up', 'new': 'New' }

/* ─── Field display row ─── */
function FieldRow({ label, value, edit, editNode }) {
  if (edit) return (
    <div>
      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">{label}</label>
      {editNode}
    </div>
  )
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-gray-800">{value || '—'}</div>
    </div>
  )
}

const INPUT_CLS = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1E1C43] bg-white'
const TEXTAREA_CLS = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1E1C43] bg-white resize-none'

/* ─── Section card wrapper ─── */
function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-[#1E1C43] flex items-center gap-2 border-l-4 border-[#E05945] pl-3 mb-4">
        <Icon size={14} className="shrink-0" /> {title}
      </h3>
      {children}
    </div>
  )
}

/* ─── Related record card ─── */
function RelatedCard({ onClick, left, right }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group"
    >
      {left}
      <div className="flex items-center gap-2 shrink-0">
        {right}
        <ExternalLink size={13} className="text-gray-300 group-hover:text-[#1E1C43] transition-colors" />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   Main Page
══════════════════════════════════════════ */
export default function PPKlienDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setCrumbs } = useBreadcrumb()

  const [klien, setKlienLocal] = useState(() => getKlienById(id))

  useEffect(() => {
    const k = getKlienById(id)
    setCrumbs(['Private Program', 'Bank Data Klien', k ? k.nama : id])
    return () => setCrumbs(null)
  }, [id])
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState(null)

  if (!klien) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle size={40} className="text-amber-400 mb-3" />
        <p className="text-sm font-semibold text-gray-700">Klien tidak ditemukan</p>
        <p className="text-xs text-gray-400 mt-1">{id}</p>
        <button
          onClick={() => navigate('/pp/klien')}
          className="mt-4 flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={12} /> Kembali ke Daftar Klien
        </button>
      </div>
    )
  }

  /* Build related data */
  const lead = klien.leadId ? getLeadById(klien.leadId) : null
  const orders = (klien.orderIds || []).map(oid => getOrderById(oid)).filter(Boolean)
  const assessments = Object.entries(getAllAssessments())
    .filter(([, a]) => a.klienId === klien.id)
    .map(([scrId, a]) => ({ id: scrId, ...a }))
    .sort((a, b) => b.id.localeCompare(a.id))

  const usia = hitungUsia(klien.tanggalLahir)
  const isOrphan = !klien.leadId
  const avatarColor = getAvatarColor(klien.nama)
  const initials = getInitials(klien.nama)

  function startEdit() {
    setForm({
      nama:       klien.nama       || '',
      sapaan:     klien.sapaan     || '',
      jenisKelamin: klien.jenisKelamin || '',
      tanggalLahir: klien.tanggalLahir || '',
      noHp:       klien.noHp       || '',
      email:      klien.email      || '',
      alamat:     klien.alamat     || '',
      kondisiSaatIni:  klien.infoKesehatan?.kondisiSaatIni  || '',
      riwayatCedera:   klien.infoKesehatan?.riwayatCedera   || '',
      tujuanProgram:   klien.infoKesehatan?.tujuanProgram   || '',
      obatanRutin:     klien.infoKesehatan?.obatanRutin     || '',
      catatanCs:       klien.infoKesehatan?.catatanCs       || '',
    })
    setEditMode(true)
  }

  function cancelEdit() { setForm(null); setEditMode(false) }

  function saveEdit() {
    const patch = {
      nama:        form.nama,
      sapaan:      form.sapaan,
      jenisKelamin: form.jenisKelamin,
      tanggalLahir: form.tanggalLahir,
      noHp:        form.noHp,
      email:       form.email,
      alamat:      form.alamat,
      infoKesehatan: {
        ...(klien.infoKesehatan || {}),
        kondisiSaatIni: form.kondisiSaatIni,
        riwayatCedera:  form.riwayatCedera,
        tujuanProgram:  form.tujuanProgram,
        obatanRutin:    form.obatanRutin,
        catatanCs:      form.catatanCs,
        sudahDiisi: !!(form.kondisiSaatIni || form.riwayatCedera || form.tujuanProgram),
      },
    }
    updateKlien(klien.id, patch)
    setKlienLocal(prev => ({ ...prev, ...patch }))
    setForm(null)
    setEditMode(false)
  }

  function f(key) { return form?.[key] ?? '' }
  function setF(key) { return e => setForm(prev => ({ ...prev, [key]: e.target.value })) }

  return (
    <div className="space-y-5">

      {/* ── Header Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">

          {/* Left: avatar + info */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0"
              style={{ background: avatarColor }}
            >
              {initials}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                Private Program — Profil Klien
              </p>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">
                {klien.sapaan} {klien.nama}
              </h1>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-400">{klien.id}</span>
                {klien.jenisKelamin && (
                  <>
                    <span className="text-gray-300 text-xs">·</span>
                    <span className="text-xs text-gray-400">{klien.jenisKelamin}</span>
                  </>
                )}
                {usia !== null && (
                  <>
                    <span className="text-gray-300 text-xs">·</span>
                    <span className="text-xs text-gray-400">{usia} tahun</span>
                  </>
                )}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${isOrphan ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                  {isOrphan ? 'Orphan' : 'Aktif'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {editMode ? (
              <>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  <X size={12} /> Batal
                </button>
                <button
                  onClick={saveEdit}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-xs font-semibold transition-colors"
                >
                  <Save size={12} /> Simpan
                </button>
              </>
            ) : (
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                <Edit size={12} /> Edit
              </button>
            )}
            <button
              onClick={() => navigate('/pp/klien')}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={12} /> Kembali
            </button>
          </div>
        </div>
      </div>

      {/* ── Content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left column (main info) */}
        <div className="lg:col-span-2 space-y-5">

          {/* Informasi Profil */}
          <SectionCard icon={User} title="Informasi Profil">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FieldRow label="Sapaan" value={klien.sapaan} edit={editMode}
                editNode={
                  <select value={f('sapaan')} onChange={setF('sapaan')} className={INPUT_CLS}>
                    {['Pak','Bu','Mas','Kak','Mbak','Bapak','Ibu'].map(s => <option key={s}>{s}</option>)}
                  </select>
                } />
              <FieldRow label="Nama Lengkap" value={klien.nama} edit={editMode}
                editNode={<input value={f('nama')} onChange={setF('nama')} className={INPUT_CLS} placeholder="Nama lengkap" />} />
              <FieldRow label="Jenis Kelamin" value={klien.jenisKelamin} edit={editMode}
                editNode={
                  <select value={f('jenisKelamin')} onChange={setF('jenisKelamin')} className={INPUT_CLS}>
                    <option value="">Pilih</option>
                    <option>Laki-laki</option>
                    <option>Perempuan</option>
                  </select>
                } />
              <FieldRow label="Tanggal Lahir"
                value={klien.tanggalLahir ? `${formatTanggal(klien.tanggalLahir)}${usia !== null ? ` (${usia} tahun)` : ''}` : '—'}
                edit={editMode}
                editNode={<input type="date" value={f('tanggalLahir')} onChange={setF('tanggalLahir')} className={INPUT_CLS} />} />
              <FieldRow label="No HP / WA" value={klien.noHp} edit={editMode}
                editNode={<input value={f('noHp')} onChange={setF('noHp')} className={INPUT_CLS} placeholder="08xx-xxxx-xxxx" />} />
              <FieldRow label="Email" value={klien.email} edit={editMode}
                editNode={<input type="email" value={f('email')} onChange={setF('email')} className={INPUT_CLS} placeholder="email@domain.com" />} />
              <div className="sm:col-span-2">
                <FieldRow label="Alamat" value={klien.alamat} edit={editMode}
                  editNode={<textarea value={f('alamat')} onChange={setF('alamat')} rows={2} className={TEXTAREA_CLS} placeholder="Alamat lengkap..." />} />
              </div>
            </div>
          </SectionCard>

          {/* Info Kesehatan Awal */}
          <SectionCard icon={Heart} title="Info Kesehatan Awal">
            {!editMode && !klien.infoKesehatan?.sudahDiisi && (
              <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                Informasi kesehatan belum diisi.
              </div>
            )}
            {editMode && (
              <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                Mode edit — isi atau perbarui informasi kesehatan klien.
              </div>
            )}
            <div className="space-y-3">
              <FieldRow label="Kondisi Saat Ini" value={klien.infoKesehatan?.kondisiSaatIni} edit={editMode}
                editNode={<textarea value={f('kondisiSaatIni')} onChange={setF('kondisiSaatIni')} rows={2} className={TEXTAREA_CLS} placeholder="Kondisi fisik / keluhan saat ini..." />} />
              <FieldRow label="Riwayat Cedera" value={klien.infoKesehatan?.riwayatCedera} edit={editMode}
                editNode={<textarea value={f('riwayatCedera')} onChange={setF('riwayatCedera')} rows={2} className={TEXTAREA_CLS} placeholder="Riwayat cedera / operasi..." />} />
              <FieldRow label="Tujuan Program" value={klien.infoKesehatan?.tujuanProgram} edit={editMode}
                editNode={<textarea value={f('tujuanProgram')} onChange={setF('tujuanProgram')} rows={2} className={TEXTAREA_CLS} placeholder="Target / tujuan fitness..." />} />
              <FieldRow label="Obatan Rutin" value={klien.infoKesehatan?.obatanRutin} edit={editMode}
                editNode={<input value={f('obatanRutin')} onChange={setF('obatanRutin')} className={INPUT_CLS} placeholder="Nama obat, atau '-' jika tidak ada" />} />
              <FieldRow label="Catatan CS" value={klien.infoKesehatan?.catatanCs} edit={editMode}
                editNode={<textarea value={f('catatanCs')} onChange={setF('catatanCs')} rows={2} className={TEXTAREA_CLS} placeholder="Catatan internal CS..." />} />
            </div>
          </SectionCard>
        </div>

        {/* Right column (related records) */}
        <div className="space-y-5">

          {/* Lead Terkait */}
          <SectionCard icon={Link2} title="Lead Terkait">
            {lead ? (
              <RelatedCard
                onClick={() => navigate(`/pp/leads/${lead.id}`)}
                left={
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#1E1C43]/10 flex items-center justify-center shrink-0">
                      <User size={14} className="text-[#1E1C43]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1E1C43] truncate">{lead.id}</p>
                      <p className="text-[10px] text-gray-400 truncate">{lead.sapaan} {lead.nama} · {lead.program}</p>
                    </div>
                  </div>
                }
                right={
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${LEAD_STATUS_CLS[lead.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {LEAD_STATUS_LABEL[lead.status] || lead.status}
                  </span>
                }
              />
            ) : (
              <div className="flex items-center gap-2 px-3 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-700">Klien Orphan</p>
                  <p className="text-[10px] text-amber-600 mt-0.5">Tidak terhubung ke lead manapun</p>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Order Terkait */}
          <SectionCard icon={ShoppingBag} title="Order Terkait">
            {orders.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Belum ada order.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {orders.map(ord => (
                  <RelatedCard
                    key={ord.id}
                    onClick={() => navigate(`/pp/orders/${ord.id}`)}
                    left={
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#1E1C43]/10 flex items-center justify-center shrink-0">
                          <ShoppingBag size={14} className="text-[#1E1C43]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1E1C43] truncate">#{ord.id}</p>
                          <p className="text-[10px] text-gray-400 truncate">{ord.paket} · {ord.sesiDone}/{ord.sesiTotal} sesi</p>
                        </div>
                      </div>
                    }
                    right={
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${ORDER_STATUS_CLS[ord.statusOrder] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                        {ORDER_STATUS_LABEL[ord.statusOrder] || ord.statusOrder}
                      </span>
                    }
                  />
                ))}
              </div>
            )}
          </SectionCard>

          {/* Riwayat Assessment */}
          <SectionCard icon={ClipboardList} title="Riwayat Assessment">
            {assessments.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Belum ada assessment.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {assessments.map(a => (
                  <RelatedCard
                    key={a.id}
                    onClick={() => navigate(`/pp/screening/${a.id}`, { state: { klienId: klien.id, leadId: klien.leadId } })}
                    left={
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#1E1C43]/10 flex items-center justify-center shrink-0">
                          <ClipboardList size={14} className="text-[#1E1C43]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1E1C43] truncate">{a.id}</p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {a.programLatihan || a.noIdProgram || '—'} · {a.namaFC || '—'}
                          </p>
                        </div>
                      </div>
                    }
                    right={null}
                  />
                ))}
              </div>
            )}
          </SectionCard>

        </div>
      </div>
    </div>
  )
}
