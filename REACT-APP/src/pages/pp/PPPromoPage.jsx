import { useState, useEffect } from 'react'
import { Tag, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Gift, Percent, DollarSign } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { getAllPromo, addPromo, updatePromo, deletePromo, toggleAktif } from '../../data/ppPromoStore'
import { TIPE_LABEL, SUBTIPE_LABEL, SUBTIPE_OPTS_DISKON, SUBTIPE_OPTS_BONUS } from '../../data/ppPromoData'

const TIPE_OPTS = ['diskon', 'bonus']

const SUBTIPE_ICON = {
  persen: Percent, nominal: DollarSign,
  treatment: Gift, latihan: Gift, produk: Gift,
}

const STATUS_CLS = {
  true:  'bg-green-50 text-green-700 border-green-200',
  false: 'bg-gray-100 text-gray-400 border-gray-200',
}

const TIPE_CLS = {
  diskon: 'bg-red-50 text-red-600 border-red-200',
  bonus:  'bg-blue-50 text-blue-600 border-blue-200',
}

function emptyForm() {
  return { kode: '', label: '', tipe: 'diskon', subTipe: 'persen', nilai: '', aktif: true, keterangan: '' }
}

function PromoModal({ initial, onSave, onClose, existingKodes }) {
  const isEdit = !!initial?.kode
  const [form, setForm] = useState(initial ? { ...initial, nilai: initial.nilai || '' } : emptyForm())
  const [err, setErr] = useState({})

  function set(k, v) {
    setForm(f => {
      const next = { ...f, [k]: v }
      if (k === 'tipe') next.subTipe = v === 'diskon' ? 'persen' : 'treatment'
      if (k === 'subTipe' && v !== 'persen' && v !== 'nominal') next.nilai = 0
      return next
    })
    setErr(e => ({ ...e, [k]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.kode.trim()) e.kode = 'Wajib diisi'
    else if (!isEdit && existingKodes.includes(form.kode.toUpperCase())) e.kode = 'Kode sudah ada'
    if (!form.label.trim()) e.label = 'Wajib diisi'
    if (form.tipe === 'diskon') {
      if (!form.nilai || isNaN(form.nilai) || Number(form.nilai) <= 0) e.nilai = 'Harus > 0'
      if (form.subTipe === 'persen' && Number(form.nilai) > 100) e.nilai = 'Maks 100%'
    }
    setErr(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave({
      ...form,
      kode: form.kode.toUpperCase().replace(/\s/g, ''),
      nilai: form.tipe === 'diskon' ? Number(form.nilai) : 0,
    })
  }

  const subTipeOpts = form.tipe === 'diskon' ? SUBTIPE_OPTS_DISKON : SUBTIPE_OPTS_BONUS

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-[#1E1C43]">{isEdit ? 'Edit Promo' : 'Tambah Kode Promo'}</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"><X size={15} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Tipe */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Tipe Promo</label>
            <div className="flex gap-2">
              {TIPE_OPTS.map(t => (
                <button key={t} onClick={() => set('tipe', t)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${form.tipe === t ? (t === 'diskon' ? 'bg-red-50 text-red-600 border-red-300' : 'bg-blue-50 text-blue-600 border-blue-300') : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}>
                  {t === 'diskon' ? '💸 Diskon (potong harga)' : '🎁 Bonus / Free (tidak potong harga)'}
                </button>
              ))}
            </div>
          </div>

          {/* Kode */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Kode Promo</label>
            <input value={form.kode} onChange={e => set('kode', e.target.value.toUpperCase().replace(/\s/g, ''))}
              disabled={isEdit}
              placeholder="Contoh: HEMAT10"
              className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-[#1E1C43] ${isEdit ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100' : 'bg-white border-gray-200'} ${err.kode ? 'border-red-400' : ''}`} />
            {err.kode && <p className="text-[10px] text-red-500 mt-0.5">{err.kode}</p>}
          </div>

          {/* Label */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Nama / Deskripsi Singkat</label>
            <input value={form.label} onChange={e => set('label', e.target.value)}
              placeholder="Contoh: Voucher Hemat 10%"
              className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-[#1E1C43] bg-white ${err.label ? 'border-red-400' : 'border-gray-200'}`} />
            {err.label && <p className="text-[10px] text-red-500 mt-0.5">{err.label}</p>}
          </div>

          {/* Sub-tipe */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              {form.tipe === 'diskon' ? 'Jenis Potongan' : 'Jenis Bonus'}
            </label>
            <div className="flex gap-2 flex-wrap">
              {subTipeOpts.map(st => (
                <button key={st} onClick={() => set('subTipe', st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.subTipe === st ? 'bg-[#1E1C43] text-white border-[#1E1C43]' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}>
                  {SUBTIPE_LABEL[st]}
                </button>
              ))}
            </div>
          </div>

          {/* Nilai — hanya untuk diskon */}
          {form.tipe === 'diskon' && (
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Nilai {form.subTipe === 'persen' ? '(%)' : '(Rp)'}
              </label>
              <input type="number" value={form.nilai} onChange={e => set('nilai', e.target.value)}
                placeholder={form.subTipe === 'persen' ? 'Contoh: 10' : 'Contoh: 50000'}
                className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-[#1E1C43] bg-white ${err.nilai ? 'border-red-400' : 'border-gray-200'}`} />
              {err.nilai && <p className="text-[10px] text-red-500 mt-0.5">{err.nilai}</p>}
            </div>
          )}

          {/* Keterangan */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Keterangan (Opsional)</label>
            <textarea value={form.keterangan} onChange={e => set('keterangan', e.target.value)}
              rows={2} placeholder="Syarat & ketentuan, masa berlaku, dll"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1E1C43] bg-white resize-none" />
          </div>

          {/* Status aktif */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-700">Status Promo</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{form.aktif ? 'Aktif — dapat digunakan di Invoice' : 'Tidak aktif — tidak bisa dipakai'}</p>
            </div>
            <button onClick={() => set('aktif', !form.aktif)}>
              {form.aktif
                ? <ToggleRight size={28} className="text-[#1E1C43]" />
                : <ToggleLeft  size={28} className="text-gray-300" />}
            </button>
          </div>
        </div>

        <div className="flex-shrink-0 flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
          <button onClick={handleSave} className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#1E1C43] text-white hover:opacity-90 transition-colors">Simpan</button>
        </div>
      </div>
    </div>
  )
}

export default function PPPromoPage() {
  const { setCrumbs } = useBreadcrumb()
  const [list, setList]     = useState(() => getAllPromo())
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal]   = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  useEffect(() => {
    setCrumbs(['Private Program', 'Promo & Diskon'])
    return () => setCrumbs(null)
  }, [])

  function refresh() { setList(getAllPromo()) }

  function handleAdd(data) {
    const ok = addPromo(data)
    if (!ok) { alert('Kode sudah ada.'); return }
    refresh(); setModal(null)
  }

  function handleEdit(data) {
    updatePromo(data.kode, data)
    refresh(); setModal(null); setEditTarget(null)
  }

  function handleDelete() {
    deletePromo(confirmDel)
    refresh(); setConfirmDel(null)
  }

  function handleToggle(kode) {
    toggleAktif(kode); refresh()
  }

  const filtered = list.filter(p => {
    if (filter === 'diskon' && p.tipe !== 'diskon') return false
    if (filter === 'bonus'  && p.tipe !== 'bonus')  return false
    if (filter === 'aktif'  && !p.aktif)             return false
    if (filter === 'nonaktif' && p.aktif)            return false
    if (search && !p.kode.toLowerCase().includes(search.toLowerCase()) &&
        !p.label.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalDiskon = list.filter(p => p.tipe === 'diskon').length
  const totalBonus  = list.filter(p => p.tipe === 'bonus').length
  const totalAktif  = list.filter(p => p.aktif).length

  const existingKodes = list.map(p => p.kode)

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
              <Tag size={22} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Private Program</p>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">Promo &amp; Diskon</h1>
              <p className="text-xs text-gray-400 mt-1">Kelola kode promo yang dapat digunakan di Invoice PP</p>
            </div>
          </div>
          <button onClick={() => { setEditTarget(null); setModal('add') }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#E05945] text-white hover:opacity-90 transition-colors">
            <Plus size={15} /> Tambah Promo
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Promo',    val: list.length,  sub: 'semua jenis' },
          { label: 'Diskon',         val: totalDiskon,  sub: 'potong harga' },
          { label: 'Bonus / Free',   val: totalBonus,   sub: 'tidak potong harga' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">{k.label}</p>
            <p className="text-2xl font-bold text-[#1E1C43] mt-1">{k.val}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 flex-wrap">
          {[['all','Semua'],['diskon','Diskon'],['bonus','Bonus'],['aktif','Aktif'],['nonaktif','Non-Aktif']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === v ? 'bg-[#1E1C43] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {l}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari kode / nama promo..."
          className="ml-auto w-52 text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#1E1C43]" />
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full" style={{ minWidth: '700px' }}>
          <thead>
            <tr className="border-b border-gray-200">
              {[['Kode Promo',140],['Nama / Deskripsi',200],['Tipe',110],['Nilai / Benefit',160],['Status',100],['Aksi',100]].map(([h, mw]) => (
                <th key={h} style={{ minWidth: mw }} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-xs text-gray-400">Tidak ada data promo.</td></tr>
            )}
            {filtered.map(p => {
              const Icon = SUBTIPE_ICON[p.subTipe] || Tag
              return (
                <tr key={p.kode} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3">
                    <span className="text-xs font-semibold text-[#1E1C43] font-mono tracking-wide bg-gray-100 px-2 py-0.5 rounded-md">{p.kode}</span>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-xs font-medium text-gray-900">{p.label}</p>
                    {p.keterangan && <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[180px]">{p.keterangan}</p>}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${TIPE_CLS[p.tipe]}`}>
                      {p.tipe === 'diskon' ? '💸 ' : '🎁 '}{TIPE_LABEL[p.tipe]}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {p.tipe === 'diskon' ? (
                      <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                        <Icon size={11} className="text-gray-400" />
                        {p.subTipe === 'persen' ? `${p.nilai}%` : `Rp ${p.nilai.toLocaleString('id-ID')}`}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Gift size={11} className="text-blue-400" />
                        {SUBTIPE_LABEL[p.subTipe]}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <button onClick={() => handleToggle(p.kode)} className="flex items-center gap-1.5 group">
                      {p.aktif
                        ? <ToggleRight size={18} className="text-[#1E1C43]" />
                        : <ToggleLeft  size={18} className="text-gray-300" />}
                      <span className={`text-xs font-medium border px-1.5 py-0.5 rounded-full ${STATUS_CLS[p.aktif]}`}>
                        {p.aktif ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setEditTarget(p); setModal('edit') }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1">
                        <Pencil size={11} /> Edit
                      </button>
                      <button onClick={() => setConfirmDel(p.kode)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-100 text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1">
                        <Trash2 size={11} /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex gap-3 items-start">
        <Tag size={14} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-blue-700">Cara penggunaan kode promo</p>
          <p className="text-[10px] text-blue-600 mt-0.5 leading-relaxed">
            Kode promo yang <strong>aktif</strong> dapat dimasukkan di section "Kode Diskon" pada PP Invoice Detail saat mode edit.
            Promo tipe <strong>Diskon</strong> memotong total harga tagihan. Promo tipe <strong>Bonus/Free</strong> hanya menampilkan benefit tambahan di invoice tanpa mengubah harga.
          </p>
        </div>
      </div>

      {/* Modal tambah / edit */}
      {(modal === 'add' || modal === 'edit') && (
        <PromoModal
          initial={modal === 'edit' ? editTarget : null}
          existingKodes={existingKodes}
          onSave={modal === 'edit' ? handleEdit : handleAdd}
          onClose={() => { setModal(null); setEditTarget(null) }}
        />
      )}

      {/* Konfirmasi hapus */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDel(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-bold text-[#1E1C43] mb-1">Hapus kode promo?</p>
            <p className="text-xs text-gray-500 mb-4">Kode <span className="font-semibold text-gray-700">{confirmDel}</span> akan dihapus permanen. Invoice yang sudah menggunakan kode ini tidak terpengaruh.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDel(null)} className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
