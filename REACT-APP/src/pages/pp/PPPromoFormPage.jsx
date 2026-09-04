import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import {
  ArrowLeft, Tag, Lock, Unlock, ToggleLeft, ToggleRight,
  Percent, DollarSign, Gift,
} from 'lucide-react'
import {
  TIPE_LABEL, SUBTIPE_LABEL, SUBTIPE_OPTS_DISKON, SUBTIPE_OPTS_BONUS,
  TEMA_QUICK_OPTS, TEMA_WARNA_CLS,
} from '../../data/ppPromoData'
import { getPromoByKode, addPromo, updatePromo, deletePromo, getAllPromo } from '../../data/ppPromoStore'
import { getStoredPrograms } from '../../data/ppProgramStore'

const TIPE_OPTS = ['diskon', 'bonus']

const TEMA_WARNA_OPTS = [
  { key: 'red',    label: 'Merah'  },
  { key: 'blue',   label: 'Biru'   },
  { key: 'green',  label: 'Hijau'  },
  { key: 'orange', label: 'Oranye' },
  { key: 'yellow', label: 'Kuning' },
  { key: 'purple', label: 'Ungu'   },
]

function emptyForm() {
  return {
    kode: '', label: '', tipe: 'diskon', subTipe: 'persen', nilai: '',
    aktif: true, keterangan: '', benefitBonus: '',
    programIds: null,
    tanggalMulai: '', tanggalBerakhir: '',
    maxPemakaian: null, jumlahPemakaian: 0,
    tema: null,
  }
}

function toFormValues(p) {
  return {
    ...p,
    nilai: p.nilai?.toString() || '',
    benefitBonus: p.benefitBonus || '',
    tanggalMulai: p.tanggalMulai || '',
    tanggalBerakhir: p.tanggalBerakhir || '',
  }
}

export default function PPPromoFormPage() {
  const navigate = useNavigate()
  const { kode: kodeParam } = useParams()
  const isEdit = !!kodeParam
  const existing = isEdit ? getPromoByKode(kodeParam) : null

  useBreadcrumb([
    { label: 'Private Program' },
    { label: 'Promo & Diskon', to: '/pp/promo' },
    { label: isEdit ? `Edit — ${kodeParam}` : 'Promo Baru' },
  ])

  const [form, setForm] = useState(() =>
    isEdit && existing ? toFormValues(existing) : emptyForm()
  )
  const [err, setErr] = useState({})

  const [programMode, setProgramMode] = useState(
    existing?.programIds && existing.programIds.length > 0 ? 'spesifik' : 'semua'
  )
  const [selectedPrograms, setSelectedPrograms] = useState(existing?.programIds || [])

  const [kuotaMode, setKuotaMode] = useState(
    existing?.maxPemakaian != null ? 'terbatas' : 'unlimited'
  )
  const [kuotaInput, setKuotaInput] = useState(existing?.maxPemakaian?.toString() || '')

  const [temaMode, setTemaMode] = useState(!!existing?.tema)
  const [temaForm, setTemaForm] = useState(
    existing?.tema || { nama: '', icon: '⭐', warna: 'orange', berlakuHingga: '' }
  )

  const allPrograms = getStoredPrograms().filter(p => p.status === 'aktif')
  const subTipeOpts = form.tipe === 'diskon' ? SUBTIPE_OPTS_DISKON : SUBTIPE_OPTS_BONUS

  function set(k, v) {
    setForm(f => {
      const next = { ...f, [k]: v }
      if (k === 'tipe') next.subTipe = v === 'diskon' ? 'persen' : 'treatment'
      if (k === 'subTipe' && v !== 'persen' && v !== 'nominal') next.nilai = 0
      return next
    })
    setErr(e => ({ ...e, [k]: undefined }))
  }

  function setTema(k, v) { setTemaForm(f => ({ ...f, [k]: v })) }

  function toggleProgram(id) {
    setSelectedPrograms(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function validate() {
    const e = {}
    if (!form.kode.trim()) e.kode = 'Wajib diisi'
    else if (!isEdit && getAllPromo().some(p => p.kode === form.kode.toUpperCase()))
      e.kode = 'Kode sudah ada'
    if (!form.label.trim()) e.label = 'Wajib diisi'
    if (form.tipe === 'diskon') {
      if (!form.nilai || isNaN(form.nilai) || Number(form.nilai) <= 0) e.nilai = 'Harus > 0'
      if (form.subTipe === 'persen' && Number(form.nilai) > 100) e.nilai = 'Maks 100%'
    }
    if (programMode === 'spesifik' && selectedPrograms.length === 0)
      e.program = 'Pilih minimal 1 program'
    if (kuotaMode === 'terbatas' && (!kuotaInput || isNaN(kuotaInput) || Number(kuotaInput) < 1))
      e.kuota = 'Harus ≥ 1'
    if (temaMode && !temaForm.nama.trim()) e.tema = 'Nama tema wajib diisi'
    setErr(e)
    return Object.keys(e).length === 0
  }

  function handleSimpan() {
    if (!validate()) return
    const payload = {
      ...form,
      kode: form.kode.toUpperCase().replace(/\s/g, ''),
      nilai: form.tipe === 'diskon' ? Number(form.nilai) : 0,
      benefitBonus: form.tipe === 'diskon' && form.benefitBonus?.trim()
        ? form.benefitBonus.trim() : null,
      programIds: programMode === 'semua' ? null : selectedPrograms,
      maxPemakaian: kuotaMode === 'unlimited' ? null : (Number(kuotaInput) || null),
      tema: temaMode
        ? { ...temaForm, berlakuHingga: temaForm.berlakuHingga || null }
        : null,
    }
    if (isEdit) {
      updatePromo(kodeParam, payload)
    } else {
      addPromo(payload)
    }
    navigate('/pp/promo')
  }

  function handleHapus() {
    if (!confirm(`Hapus kode promo "${kodeParam}"? Order & invoice yang sudah menggunakan kode ini tidak terpengaruh.`)) return
    deletePromo(kodeParam)
    navigate('/pp/promo')
  }

  const inputCls = (key) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] transition-colors ${err[key] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`

  const label = 'text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block'

  return (
    <div className="bg-[#F5F5F7] min-h-screen pb-24">

      {/* Header Card — pola 3b */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
              <Tag size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                Private Program — Promo & Diskon
              </p>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">
                {isEdit ? `Edit Promo — ${kodeParam}` : 'Promo Baru'}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                {isEdit ? 'Ubah detail, nilai, periode, dan pembatasan promo' : 'Tambah kode promo baru untuk digunakan di Order & Invoice PP'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/pp/promo')}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={12} /> Kembali
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">

        {/* ── Section 1: Tipe & Identitas ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Tipe & Identitas</h3>
          <div className="space-y-4">

            {/* Tipe toggle */}
            <div>
              <label className={label}>Tipe Promo</label>
              <div className="flex gap-2">
                {TIPE_OPTS.map(t => (
                  <button key={t} onClick={() => set('tipe', t)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                      form.tipe === t
                        ? t === 'diskon' ? 'bg-red-50 text-red-600 border-red-300' : 'bg-blue-50 text-blue-600 border-blue-300'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}>
                    {t === 'diskon' ? '💸 Diskon (potong harga)' : '🎁 Bonus / Free (tidak potong harga)'}
                  </button>
                ))}
              </div>
              {form.tipe === 'bonus' && (
                <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mt-2 leading-relaxed">
                  Promo bonus <strong>tidak mengubah harga invoice</strong>. Klien tetap bayar penuh tapi mendapat benefit tambahan.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Kode */}
              <div>
                <label className={label}>Kode Promo <span className="text-red-500">*</span></label>
                <input
                  value={form.kode}
                  onChange={e => set('kode', e.target.value.toUpperCase().replace(/\s/g, ''))}
                  disabled={isEdit}
                  placeholder="Contoh: HEMAT10"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm font-mono font-semibold tracking-wider focus:outline-none focus:border-[#1E1C43] transition-colors ${
                    isEdit ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100' : 'bg-white border-gray-200'
                  } ${err.kode ? 'border-red-400 bg-red-50' : ''}`}
                />
                {err.kode
                  ? <p className="text-red-500 text-[10px] mt-1">{err.kode}</p>
                  : isEdit && <p className="text-[10px] text-gray-400 mt-1">Kode tidak dapat diubah setelah disimpan</p>
                }
              </div>

              {/* Status */}
              <div>
                <label className={label}>Status Manual</label>
                <button
                  onClick={() => set('aktif', !form.aktif)}
                  className="flex items-center gap-2 mt-1"
                >
                  {form.aktif
                    ? <ToggleRight size={28} className="text-[#1E1C43]" />
                    : <ToggleLeft  size={28} className="text-gray-300" />}
                  <span className="text-sm font-semibold text-gray-700">{form.aktif ? 'Aktif' : 'Nonaktif'}</span>
                </button>
                <p className="text-[10px] text-gray-400 mt-1">Status final juga dipengaruhi periode & kuota</p>
              </div>

              {/* Label / Nama */}
              <div className="sm:col-span-2">
                <label className={label}>Nama / Deskripsi Singkat <span className="text-red-500">*</span></label>
                <input
                  value={form.label}
                  onChange={e => set('label', e.target.value)}
                  placeholder="Contoh: Voucher Hemat 10%"
                  className={inputCls('label')}
                />
                {err.label && <p className="text-red-500 text-[10px] mt-1">{err.label}</p>}
              </div>

            </div>
          </div>
        </div>

        {/* ── Section 2: Sub-tipe & Nilai & Keterangan ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">
            {form.tipe === 'diskon' ? 'Jenis Potongan & Nilai' : 'Jenis Bonus'}
          </h3>
          <div className="space-y-4">

            {/* Sub-tipe */}
            <div>
              <label className={label}>{form.tipe === 'diskon' ? 'Jenis Potongan' : 'Jenis Bonus'}</label>
              <div className="flex gap-2 flex-wrap">
                {subTipeOpts.map(st => (
                  <button key={st} onClick={() => set('subTipe', st)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      form.subTipe === st ? 'bg-[#1E1C43] text-white border-[#1E1C43]' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}>
                    {SUBTIPE_LABEL[st]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Nilai (diskon only) */}
              {form.tipe === 'diskon' && (
                <div>
                  <label className={label}>Nilai {form.subTipe === 'persen' ? '(%)' : '(Rp)'} <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={form.nilai}
                    onChange={e => set('nilai', e.target.value)}
                    placeholder={form.subTipe === 'persen' ? 'Contoh: 10' : 'Contoh: 50000'}
                    min="0"
                    className={inputCls('nilai')}
                  />
                  {err.nilai && <p className="text-red-500 text-[10px] mt-1">{err.nilai}</p>}
                </div>
              )}

              {/* Benefit Bonus tambahan (diskon) */}
              {form.tipe === 'diskon' && (
                <div>
                  <label className={label}>Benefit Bonus Tambahan (Opsional)</label>
                  <input
                    value={form.benefitBonus}
                    onChange={e => set('benefitBonus', e.target.value)}
                    placeholder="Contoh: Free Tote Bag EFM"
                    className={inputCls('benefitBonus')}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Merchandise atau benefit di luar potongan harga</p>
                </div>
              )}

            </div>

            {/* Keterangan */}
            <div>
              <label className={label}>Keterangan / Syarat & Ketentuan (Opsional)</label>
              <textarea
                value={form.keterangan}
                onChange={e => set('keterangan', e.target.value)}
                rows={3}
                placeholder="Syarat & ketentuan, catatan tambahan, dll"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] bg-white resize-none transition-colors"
              />
            </div>

          </div>
        </div>

        {/* ── Section 3: Pembatasan ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Pembatasan & Kuota</h3>
          <div className="space-y-5">

            {/* Program Berlaku */}
            <div>
              <label className={label}>Program yang Berlaku</label>
              <div className="flex gap-2 mb-2">
                {[['semua', 'Semua Program'], ['spesifik', 'Program Tertentu']].map(([mode, lbl]) => (
                  <button key={mode} onClick={() => setProgramMode(mode)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      programMode === mode ? 'bg-[#1E1C43] text-white border-[#1E1C43]' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}>
                    {mode === 'semua'
                      ? <><Unlock size={13} className="inline mr-1.5" />{lbl}</>
                      : <><Lock size={13} className="inline mr-1.5" />{lbl}</>}
                  </button>
                ))}
              </div>
              {programMode === 'semua' && (
                <p className="text-xs text-gray-400">Promo dapat dipakai untuk semua program aktif.</p>
              )}
              {programMode === 'spesifik' && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 mb-2">
                    Pilih program yang boleh menggunakan promo ini.
                  </p>
                  {allPrograms.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Tidak ada program aktif.</p>
                  ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                      {allPrograms.map(prog => {
                        const checked = selectedPrograms.includes(prog.id)
                        return (
                          <button key={prog.id} type="button" onClick={() => toggleProgram(prog.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left border-b border-gray-50 last:border-0 transition-colors ${checked ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${checked ? 'bg-[#1E1C43] border-[#1E1C43]' : 'border-gray-300'}`}>
                              {checked && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                            </div>
                            <span className="text-[10px] font-semibold text-[#1E1C43] shrink-0 bg-[#1E1C43]/10 px-1.5 py-0.5 rounded">{prog.id}</span>
                            <span className="text-xs text-gray-700 flex-1 truncate">{prog.namaLatihan} — {prog.namaPaket}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {err.program && <p className="text-red-500 text-[10px] mt-1">{err.program}</p>}
                  {selectedPrograms.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">{selectedPrograms.length} program dipilih</p>
                  )}
                </div>
              )}
            </div>

            {/* Periode Berlaku */}
            <div>
              <label className={label}>Periode Berlaku (Opsional)</label>
              <p className="text-xs text-gray-400 mb-2">Kosongkan jika tidak ada batas waktu. Sistem otomatis memvalidasi saat promo digunakan.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-400 mb-1 block">Tanggal Mulai</label>
                  <input type="date" value={form.tanggalMulai}
                    onChange={e => set('tanggalMulai', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#1E1C43] bg-white transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 mb-1 block">Tanggal Berakhir</label>
                  <input type="date" value={form.tanggalBerakhir}
                    onChange={e => set('tanggalBerakhir', e.target.value)}
                    min={form.tanggalMulai || undefined}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#1E1C43] bg-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Kuota Pemakaian */}
            <div>
              <label className={label}>Kuota Pemakaian</label>
              <div className="flex gap-2 mb-2">
                {[['unlimited', 'Unlimited'], ['terbatas', 'Terbatas']].map(([mode, lbl]) => (
                  <button key={mode}
                    onClick={() => { setKuotaMode(mode); if (mode === 'unlimited') setKuotaInput('') }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      kuotaMode === mode ? 'bg-[#1E1C43] text-white border-[#1E1C43]' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}>
                    {lbl}
                  </button>
                ))}
              </div>
              {kuotaMode === 'terbatas' && (
                <div>
                  <input type="number" value={kuotaInput} onChange={e => setKuotaInput(e.target.value)}
                    placeholder="Maks jumlah pemakaian (cth: 50)"
                    min={1}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] bg-white transition-colors ${err.kuota ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                  {err.kuota && <p className="text-red-500 text-[10px] mt-1">{err.kuota}</p>}
                  {isEdit && existing?.jumlahPemakaian > 0 && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Sudah terpakai: <span className="font-semibold text-gray-600">{existing.jumlahPemakaian}x</span>. Pastikan batas baru ≥ jumlah yang sudah terpakai.
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Section 4: Promo Tematik ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-bold text-[#1E1C43]">Promo Tematik</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Aktifkan untuk promo bertema (Natal, Kemerdekaan, dll). Ditandai badge khusus di order & invoice.
              </p>
            </div>
            <button onClick={() => setTemaMode(v => !v)}>
              {temaMode
                ? <ToggleRight size={28} className="text-[#1E1C43]" />
                : <ToggleLeft  size={28} className="text-gray-300" />}
            </button>
          </div>

          {temaMode && (
            <div className="mt-4 bg-gray-50 rounded-xl p-4 space-y-4">

              {/* Quick pick */}
              <div>
                <label className={label}>Pilih Cepat</label>
                <div className="flex flex-wrap gap-1.5">
                  {TEMA_QUICK_OPTS.map(opt => (
                    <button key={opt.nama}
                      onClick={() => setTemaForm(f => ({ ...f, nama: opt.nama, icon: opt.icon, warna: opt.warna }))}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        temaForm.nama === opt.nama
                          ? (TEMA_WARNA_CLS[opt.warna] || 'bg-gray-100 text-gray-600 border-gray-200') + ' font-semibold'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}>
                      {opt.icon} {opt.nama}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Tema */}
                <div>
                  <label className={label}>Nama Tema <span className="text-red-500">*</span></label>
                  <input value={temaForm.nama} onChange={e => setTema('nama', e.target.value)}
                    placeholder="Contoh: Natal, Kemerdekaan..."
                    className={`w-full text-sm border rounded-lg px-3 py-2.5 outline-none focus:border-[#1E1C43] bg-white transition-colors ${err.tema ? 'border-red-400' : 'border-gray-200'}`} />
                  {err.tema && <p className="text-red-500 text-[10px] mt-1">{err.tema}</p>}
                </div>

                {/* Icon Emoji */}
                <div>
                  <label className={label}>Icon (Emoji)</label>
                  <input value={temaForm.icon} onChange={e => setTema('icon', e.target.value)}
                    placeholder="Contoh: 🎄"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#1E1C43] bg-white transition-colors" />
                </div>

                {/* Warna Badge */}
                <div>
                  <label className={label}>Warna Badge</label>
                  <select value={temaForm.warna} onChange={e => setTema('warna', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#1E1C43] bg-white transition-colors">
                    {TEMA_WARNA_OPTS.map(w => <option key={w.key} value={w.key}>{w.label}</option>)}
                  </select>
                </div>

                {/* Berlaku Hingga */}
                <div>
                  <label className={label}>Berlaku Hingga (tema saja, opsional)</label>
                  <input type="date" value={temaForm.berlakuHingga || ''}
                    onChange={e => setTema('berlakuHingga', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#1E1C43] bg-white transition-colors" />
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400">Preview badge:</span>
                <span className={`text-xs font-medium border px-2 py-0.5 rounded-full ${TEMA_WARNA_CLS[temaForm.warna] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {temaForm.icon} {temaForm.nama || 'Nama Tema'}
                </span>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white border-t border-gray-100 px-6 py-4 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            {isEdit && (
              <button
                onClick={handleHapus}
                className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Hapus Promo
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/pp/promo')}
              className="border border-gray-200 text-gray-600 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSimpan}
              className="bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              {isEdit ? 'Simpan Perubahan' : 'Simpan Promo'}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
