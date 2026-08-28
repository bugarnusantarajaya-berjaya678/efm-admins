import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Layers, X, Edit2, Trash2 } from 'lucide-react'
import { PIC_DB, JENIS_OPTS, PIC_OPTS_DB, formatRp } from '../../data/ppProgramDBData'
import { getStoredPrograms } from '../../data/ppProgramStore'

const ROWS = 10

/* ─── Jenis Program Data ─── */
const JENIS_INIT = [
  { id: 1,  nama: 'Private Training',        deskripsi: 'Latihan personal satu-satu dengan trainer profesional',                   status: 'aktif'    },
  { id: 2,  nama: 'Semi Private Training',   deskripsi: 'Latihan personal dengan 2–3 peserta bersama trainer',                    status: 'aktif'    },
  { id: 3,  nama: 'Group Training',          deskripsi: 'Sesi latihan kelompok untuk komunitas atau korporat',                    status: 'aktif'    },
  { id: 4,  nama: 'Fisioterapi',             deskripsi: 'Terapi fisik untuk pemulihan cedera dan rehabilitasi',                   status: 'aktif'    },
  { id: 5,  nama: 'Yoga Therapy',            deskripsi: 'Terapi berbasis yoga untuk relaksasi dan fleksibilitas tubuh',           status: 'aktif'    },
  { id: 6,  nama: 'Posture Correction',      deskripsi: 'Program koreksi postur tubuh untuk mengatasi nyeri punggung',           status: 'aktif'    },
  { id: 7,  nama: 'Strength & Conditioning', deskripsi: 'Program kekuatan dan kondisi fisik untuk atlet dan umum',               status: 'aktif'    },
  { id: 8,  nama: 'Nutrition Coaching',      deskripsi: 'Panduan nutrisi dan pola makan sehat bersama ahli gizi bersertifikat',  status: 'aktif'    },
  { id: 9,  nama: 'Kids Fitness',            deskripsi: 'Program kebugaran khusus untuk anak-anak usia 6–14 tahun',              status: 'aktif'    },
  { id: 10, nama: 'Elderly Fitness',         deskripsi: 'Program kebugaran yang disesuaikan untuk lansia usia 60 tahun ke atas', status: 'nonaktif' },
]

const inputCls = 'w-full px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-[#1E1C43] transition-colors bg-white'

/* ─── Sub-components ─── */

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

function JenisBadge({ status }) {
  return status === 'aktif'
    ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">Aktif</span>
    : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500">Nonaktif</span>
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

/* ─── Jenis Program Modal (Add/Edit form) ─── */
function JenisFormModal({ jenis, onClose, onSave }) {
  const isEdit = !!jenis
  const [form, setForm] = useState(
    isEdit ? { ...jenis } : { nama: '', deskripsi: '', status: 'aktif' }
  )
  const [err, setErr] = useState('')

  function handleSave() {
    if (!form.nama.trim()) { setErr('Nama Jenis Program wajib diisi.'); return }
    onSave({ ...form, nama: form.nama.trim(), deskripsi: form.deskripsi.trim() })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {isEdit ? 'Edit Jenis Program' : 'Tambah Jenis Program'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {err && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nama Jenis Program <span className="text-[#E05945]">*</span>
            </label>
            <input
              className={inputCls}
              placeholder="Contoh: Private Training"
              value={form.nama}
              onChange={e => { setErr(''); setForm(p => ({ ...p, nama: e.target.value })) }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deskripsi</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Deskripsi singkat jenis program ini..."
              value={form.deskripsi}
              onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Status</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, status: p.status === 'aktif' ? 'nonaktif' : 'aktif' }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.status === 'aktif' ? 'bg-[#1E1C43]' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.status === 'aktif' ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <span className={`text-sm font-medium ${form.status === 'aktif' ? 'text-[#1E1C43]' : 'text-gray-400'}`}>
                {form.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-[#E05945] hover:bg-[#c94a38] rounded-lg flex items-center gap-1.5 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            {isEdit ? 'Simpan Perubahan' : 'Tambah Jenis'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Jenis Program Delete Confirm ─── */
function JenisDeleteDialog({ nama, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-1">Hapus Jenis Program</h3>
        <p className="text-sm text-gray-500 text-center mb-5">
          Yakin ingin menghapus <strong className="text-gray-700">"{nama}"</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-2.5">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Jenis Program Panel Modal ─── */
function JenisPanelModal({ list, onClose, onAdd, onEdit, onDelete }) {
  const [modal,        setModal]        = useState(null)   // null | 'add' | { idx, item }
  const [deleteTarget, setDeleteTarget] = useState(null)

  const aktifCount    = list.filter(j => j.status === 'aktif').length
  const nonaktifCount = list.length - aktifCount
  const nextId        = list.length > 0 ? Math.max(...list.map(j => j.id)) + 1 : 1

  function handleSave(data) {
    if (modal === 'add') {
      onAdd({ ...data, id: nextId })
    } else {
      onEdit(modal.idx, { ...data, id: modal.item.id })
    }
    setModal(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-bold text-[#1E1C43]">Jenis Program</h3>
            <p className="text-xs text-gray-400 mt-0.5">Kelola jenis-jenis program yang tersedia di Database Program Private Training</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModal('add')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus size={13} strokeWidth={2.5} />
              Tambah Jenis
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-shrink-0 grid grid-cols-3 gap-3 px-6 pt-4 pb-2">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Jenis</p>
            <p className="text-xl font-bold text-gray-900">{list.length}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">semua terdaftar</p>
          </div>
          <div className="bg-white border-[1.5px] border-green-200 rounded-xl px-4 py-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Aktif</p>
            <p className="text-xl font-bold text-green-600">{aktifCount}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">tersedia di form</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Nonaktif</p>
            <p className="text-xl font-bold text-gray-400">{nonaktifCount}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">disembunyikan di form</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1 px-6 pb-6 pt-3">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: '600px' }}>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['No', 'Nama Jenis Program', 'Deskripsi', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3.5 text-xs font-medium text-gray-400 w-12">{idx + 1}</td>
                      <td className="px-4 py-3.5 font-semibold text-[13px] text-gray-900 whitespace-nowrap">{item.nama}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 max-w-xs">{item.deskripsi || '—'}</td>
                      <td className="px-4 py-3.5"><JenisBadge status={item.status} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setModal({ idx, item })}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11.5px] font-medium text-gray-600 hover:border-[#1E1C43] hover:text-[#1E1C43] hover:bg-gray-50 transition-colors"
                          >
                            <Edit2 size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ idx, nama: item.nama })}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11.5px] font-medium text-gray-600 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={12} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">{list.length} jenis program terdaftar</span>
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <JenisFormModal
          jenis={modal === 'add' ? null : modal.item}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <JenisDeleteDialog
          nama={deleteTarget.nama}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => { onDelete(deleteTarget.idx); setDeleteTarget(null) }}
        />
      )}
    </div>
  )
}

/* ─── Main Page ─── */

export default function PPProgramDBPage() {
  const navigate = useNavigate()
  const [programs] = useState(() => getStoredPrograms())
  const [fStatus, setFStatus] = useState('')
  const [fJenis,  setFJenis]  = useState('')
  const [fPIC,    setFPIC]    = useState('')
  const [fSearch, setFSearch] = useState('')
  const [page,    setPage]    = useState(1)

  const [showJenisPanel, setShowJenisPanel] = useState(false)
  const [jenisList,      setJenisList]      = useState(JENIS_INIT)

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS))
  const slice = filtered.slice((page - 1) * ROWS, page * ROWS)

  const aktifCount = programs.filter(p => p.status === 'aktif').length
  const prices = programs.map(p => p.harga)
  const minHarga = prices.length ? formatRp(Math.min(...prices)) : '—'
  const maxHarga = prices.length ? formatRp(Math.max(...prices)) : '—'

  function reset() { setFStatus(''); setFJenis(''); setFPIC(''); setFSearch('') }

  const start = (page - 1) * ROWS + 1
  const end   = Math.min(page * ROWS, filtered.length)

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Database Program Private Training</h1>
          <p className="text-sm text-text-muted mt-1">Kelola paket program, harga, dan penugasan PIC — terintegrasi dengan form Buat Order Baru</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowJenisPanel(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors"
          >
            <Layers size={15} strokeWidth={2} />
            Jenis Program
          </button>
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
          {JENIS_OPTS.map(j => <option key={j} value={j}>{j}</option>)}
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
        <button onClick={reset} className="px-3.5 py-[7px] bg-primary hover:bg-primary-2 text-white text-xs font-semibold rounded-lg transition-colors shrink-0">Reset</button>
      </div>

      {/* Table */}
      <div className="bg-bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 380px)', minHeight: '280px' }}>
          <table className="w-full text-sm" style={{ minWidth: '1200px' }}>
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-100">
                {['ID Program','Nama Latihan/ Terapi','Nama Paket','Sesi','Pertemuan','Masa Berlaku','Peserta','PIC','Biaya/Sesi','Harga Paket','Status'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr><td colSpan={11} className="py-10 text-center text-sm text-text-muted">Tidak ada program yang sesuai filter</td></tr>
              ) : slice.map((p) => {
                const pic = PIC_DB[p.picId] || {}
                return (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer" onClick={() => navigate(`/pp/program-db/${p.id}/edit`)}>
                    <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{p.id}</td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5">{p.namaLatihan}</td>
                    <td className="text-xs font-medium text-gray-900 px-3 py-2.5">{p.namaPaket}</td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5 text-center">{p.sesi}</td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5 text-center">{p.pertemuan}x</td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{p.masa}</td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5 text-center">{p.partisipan} org</td>
                    <td className="px-3 py-2.5">
                      <div className="text-[11px] font-bold text-accent">{p.picId}</div>
                      <div className="text-[11px] text-text-muted">{pic.fullname || '—'}</div>
                    </td>
                    <td className="text-xs font-semibold text-gray-600 px-3 py-2.5 text-right whitespace-nowrap">{formatRp(p.biayaSesiPIC)}</td>
                    <td className="text-xs font-semibold text-gray-600 px-3 py-2.5 text-right whitespace-nowrap">{formatRp(p.harga)}</td>
                    <td className="px-3 py-2.5 text-center"><Badge status={p.status} /></td>
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

      {showJenisPanel && (
        <JenisPanelModal
          list={jenisList}
          onClose={() => setShowJenisPanel(false)}
          onAdd={item  => setJenisList(prev => [...prev, item])}
          onEdit={(idx, data) => setJenisList(prev => prev.map((j, i) => i === idx ? data : j))}
          onDelete={idx => setJenisList(prev => prev.filter((_, i) => i !== idx))}
        />
      )}
    </div>
  )
}
