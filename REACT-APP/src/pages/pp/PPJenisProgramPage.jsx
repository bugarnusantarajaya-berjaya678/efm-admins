import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'

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

function Badge({ status }) {
  return status === 'aktif'
    ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">Aktif</span>
    : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500">Nonaktif</span>
}

function JenisModal({ jenis, onClose, onSave }) {
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {isEdit ? 'Edit Jenis Program' : 'Tambah Jenis Program'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {err && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{err}</p>
          )}
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
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    form.status === 'aktif' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${form.status === 'aktif' ? 'text-[#1E1C43]' : 'text-gray-400'}`}>
                {form.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#E05945] hover:bg-[#c94a38] rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {isEdit ? 'Simpan Perubahan' : 'Tambah Jenis'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteDialog({ nama, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-1">Hapus Jenis Program</h3>
        <p className="text-sm text-gray-500 text-center mb-5">
          Yakin ingin menghapus{' '}
          <strong className="text-gray-700">"{nama}"</strong>?{' '}
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PPJenisProgramPage() {
  const [list, setList] = useState(JENIS_INIT)
  const [modal, setModal] = useState(null)        // null | 'add' | { idx, item }
  const [deleteTarget, setDeleteTarget] = useState(null)  // null | { idx, nama }
  const [nextId, setNextId] = useState(11)

  const aktifCount   = list.filter(j => j.status === 'aktif').length
  const nonaktifCount = list.length - aktifCount

  function handleSave(data) {
    if (modal === 'add') {
      setList(prev => [...prev, { ...data, id: nextId }])
      setNextId(p => p + 1)
    } else {
      setList(prev => prev.map((j, i) => i === modal.idx ? { ...data, id: j.id } : j))
    }
  }

  function confirmDelete() {
    setList(prev => prev.filter((_, i) => i !== deleteTarget.idx))
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Jenis Program</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola jenis-jenis program yang tersedia di Database Program Private Training
          </p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E05945] hover:bg-[#c94a38] text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
        >
          <Plus size={15} strokeWidth={2.5} />
          Tambah Jenis Program
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
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
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: '700px' }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['No', 'Nama Jenis Program', 'Deskripsi', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5 text-xs font-medium text-gray-400 w-12">{idx + 1}</td>
                  <td className="px-4 py-3.5 font-semibold text-[13px] text-gray-900 whitespace-nowrap">{item.nama}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 max-w-xs">{item.deskripsi || '—'}</td>
                  <td className="px-4 py-3.5"><Badge status={item.status} /></td>
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

      {modal && (
        <JenisModal
          jenis={modal === 'add' ? null : modal.item}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteDialog
          nama={deleteTarget.nama}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}
