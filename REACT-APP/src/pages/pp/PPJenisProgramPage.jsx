import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit2, Trash2, X, Layers } from 'lucide-react'
import {
  getStoredJenis,
  addStoredJenis,
  updateStoredJenis,
  deleteStoredJenis,
  getNextJenisId,
} from '../../data/ppJenisStore'

const inputCls = 'w-full px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-[#1E1C43] transition-colors bg-white'

function JenisBadge({ status }) {
  return status === 'aktif'
    ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">Aktif</span>
    : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500">Nonaktif</span>
}

function JenisFormModal({ jenis, existingList, onClose, onSave }) {
  const isEdit = !!jenis
  const [form, setForm] = useState(
    isEdit ? { ...jenis } : { kode: '', nama: '', deskripsi: '', status: 'aktif' }
  )
  const [err, setErr] = useState('')

  function handleSave() {
    const kode = form.kode.trim()
    if (!kode) { setErr('Kode Jenis wajib diisi.'); return }
    if (!/^[A-Z]{2,5}$/.test(kode)) { setErr('Kode harus 2–5 huruf kapital (contoh: PP, TH, SC).'); return }
    const duplicate = existingList.find(j => j.kode === kode && (!isEdit || j.id !== jenis.id))
    if (duplicate) { setErr(`Kode "${kode}" sudah digunakan oleh jenis "${duplicate.nama}". Gunakan kode lain.`); return }
    if (!form.nama.trim()) { setErr('Nama Jenis Program wajib diisi.'); return }
    onSave({ ...form, kode, nama: form.nama.trim(), deskripsi: form.deskripsi.trim() })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-[#1E1C43]">
            {isEdit ? 'Edit Jenis Program' : 'Tambah Jenis Program'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {err && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Kode Jenis <span className="text-[#E05945]">*</span>
              <span className="ml-1 font-normal text-gray-400 normal-case">(2–5 huruf kapital, digunakan untuk ID Program)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                className={`${inputCls} w-28 font-mono tracking-widest uppercase`}
                placeholder="PP"
                maxLength={5}
                value={form.kode}
                onChange={e => { setErr(''); setForm(p => ({ ...p, kode: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })) }}
              />
              {form.kode && (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold font-mono bg-[#1E1C43] text-white tracking-widest">
                  PRG-{form.kode}-001
                </span>
              )}
            </div>
          </div>
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
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
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

function JenisDeleteDialog({ nama, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 text-center mb-1">Hapus Jenis Program</h3>
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

export default function PPJenisProgramPage() {
  const navigate = useNavigate()
  const [list,         setList]         = useState(() => getStoredJenis())
  const [modal,        setModal]        = useState(null)   // null | 'add' | { item }
  const [deleteTarget, setDeleteTarget] = useState(null)   // null | { id, nama }

  const aktifCount    = list.filter(j => j.status === 'aktif').length
  const nonaktifCount = list.length - aktifCount

  function handleSave(data) {
    if (modal === 'add') {
      const newItem = { ...data, id: getNextJenisId() }
      addStoredJenis(newItem)
    } else {
      updateStoredJenis(modal.item.id, data)
    }
    setList(getStoredJenis())
    setModal(null)
  }

  function handleDelete() {
    deleteStoredJenis(deleteTarget.id)
    setList(getStoredJenis())
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
              <Layers size={18} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Private Program · Database Program</p>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">Jenis Program</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {list.length} jenis terdaftar · {aktifCount} aktif
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => setModal('add')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1E1C43] hover:bg-[#2d2b5c] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus size={13} strokeWidth={2.5} />
              Tambah Jenis
            </button>
            <button
              onClick={() => navigate('/pp/program-db')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft size={13} />
              Kembali
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Jenis</p>
          <p className="text-2xl font-bold text-[#1E1C43]">{list.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">semua terdaftar</p>
        </div>
        <div className="bg-white border-[1.5px] border-green-200 rounded-xl px-4 py-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Aktif</p>
          <p className="text-2xl font-bold text-green-600">{aktifCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">tersedia di form</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Nonaktif</p>
          <p className="text-2xl font-bold text-gray-400">{nonaktifCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">disembunyikan di form</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: '600px' }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['No', 'Kode', 'Nama Jenis Program', 'Deskripsi', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                    Belum ada jenis program. Klik "+ Tambah Jenis" untuk menambahkan.
                  </td>
                </tr>
              ) : list.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5 text-xs font-medium text-gray-400 w-12">{idx + 1}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#1E1C43] text-white tracking-widest">{item.kode || '—'}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 whitespace-nowrap">{item.nama}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 max-w-xs">{item.deskripsi || '—'}</td>
                  <td className="px-4 py-3.5"><JenisBadge status={item.status} /></td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setModal({ item })}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11.5px] font-medium text-gray-600 hover:border-[#1E1C43] hover:text-[#1E1C43] hover:bg-gray-50 transition-colors"
                      >
                        <Edit2 size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: item.id, nama: item.nama })}
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

      {/* Modals */}
      {modal && (
        <JenisFormModal
          jenis={modal === 'add' ? null : modal.item}
          existingList={list}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <JenisDeleteDialog
          nama={deleteTarget.nama}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
