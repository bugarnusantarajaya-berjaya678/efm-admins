import { useState, useEffect } from 'react'
import {
  Tag, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Gift,
  Percent, DollarSign, Search, RotateCcw, Calendar, Lock, Unlock,
  Sparkles, Package, Info,
} from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { getAllPromo, addPromo, updatePromo, deletePromo, toggleAktif } from '../../data/ppPromoStore'
import {
  TIPE_LABEL, SUBTIPE_LABEL, SUBTIPE_OPTS_DISKON, SUBTIPE_OPTS_BONUS,
  TEMA_QUICK_OPTS, TEMA_WARNA_CLS,
} from '../../data/ppPromoData'
import { getStoredPrograms } from '../../data/ppProgramStore'

const TIPE_OPTS = ['diskon', 'bonus']

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
    aktif: true, keterangan: '',
    benefitBonus: '',
    programIds: null,
    tanggalMulai: '', tanggalBerakhir: '',
    maxPemakaian: null, jumlahPemakaian: 0,
    tema: null,
  }
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

function PromoModal({ initial, onSave, onClose, existingKodes }) {
  const isEdit = !!initial?.kode
  const [form, setForm] = useState(() =>
    initial
      ? {
          ...emptyForm(), ...initial,
          nilai: initial.nilai?.toString() || '',
          benefitBonus: initial.benefitBonus || '',
          tanggalMulai: initial.tanggalMulai || '',
          tanggalBerakhir: initial.tanggalBerakhir || '',
        }
      : emptyForm()
  )
  const [err, setErr] = useState({})

  // Program mode
  const [programMode, setProgramMode] = useState(
    initial?.programIds && initial.programIds.length > 0 ? 'spesifik' : 'semua'
  )
  const [selectedPrograms, setSelectedPrograms] = useState(initial?.programIds || [])

  // Kuota mode
  const [kuotaMode, setKuotaMode] = useState(
    initial?.maxPemakaian !== null && initial?.maxPemakaian !== undefined ? 'terbatas' : 'unlimited'
  )
  const [kuotaInput, setKuotaInput] = useState(
    initial?.maxPemakaian?.toString() || ''
  )

  // Tema mode
  const [temaMode, setTemaMode] = useState(!!initial?.tema)
  const [temaForm, setTemaForm] = useState(
    initial?.tema || { nama: '', icon: '⭐', warna: 'orange', berlakuHingga: '' }
  )

  const allPrograms = getStoredPrograms().filter(p => p.status === 'aktif')

  function set(k, v) {
    setForm(f => {
      const next = { ...f, [k]: v }
      if (k === 'tipe') next.subTipe = v === 'diskon' ? 'persen' : 'treatment'
      if (k === 'subTipe' && v !== 'persen' && v !== 'nominal') next.nilai = 0
      return next
    })
    setErr(e => ({ ...e, [k]: undefined }))
  }

  function setTema(k, v) {
    setTemaForm(f => ({ ...f, [k]: v }))
  }

  function toggleProgram(id) {
    setSelectedPrograms(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
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
    if (programMode === 'spesifik' && selectedPrograms.length === 0)
      e.program = 'Pilih minimal 1 program'
    if (kuotaMode === 'terbatas' && (!kuotaInput || isNaN(kuotaInput) || Number(kuotaInput) < 1))
      e.kuota = 'Harus ≥ 1'
    if (temaMode && !temaForm.nama.trim()) e.tema = 'Nama tema wajib diisi'
    setErr(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave({
      ...form,
      kode: form.kode.toUpperCase().replace(/\s/g, ''),
      nilai: form.tipe === 'diskon' ? Number(form.nilai) : 0,
      benefitBonus: form.tipe === 'diskon' && form.benefitBonus.trim()
        ? form.benefitBonus.trim() : null,
      programIds: programMode === 'semua' ? null : selectedPrograms,
      maxPemakaian: kuotaMode === 'unlimited' ? null : (Number(kuotaInput) || null),
      tema: temaMode
        ? { ...temaForm, berlakuHingga: temaForm.berlakuHingga || null }
        : null,
    })
  }

  const subTipeOpts = form.tipe === 'diskon' ? SUBTIPE_OPTS_DISKON : SUBTIPE_OPTS_BONUS

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-[#1E1C43]">{isEdit ? 'Edit Promo' : 'Tambah Kode Promo'}</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* ── A: Tipe ── */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Tipe Promo</label>
            <div className="flex gap-2">
              {TIPE_OPTS.map(t => (
                <button key={t} onClick={() => set('tipe', t)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    form.tipe === t
                      ? t === 'diskon' ? 'bg-red-50 text-red-600 border-red-300' : 'bg-blue-50 text-blue-600 border-blue-300'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}>
                  {t === 'diskon' ? '💸 Diskon (potong harga)' : '🎁 Bonus / Free (tidak potong harga)'}
                </button>
              ))}
            </div>
            {form.tipe === 'bonus' && (
              <p className="text-[10px] text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mt-2 leading-relaxed">
                Promo bonus <strong>tidak mengubah harga invoice</strong>. Klien tetap bayar penuh tapi mendapat benefit tambahan (treatment, sesi, atau produk gratis).
              </p>
            )}
          </div>

          {/* ── B: Kode ── */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Kode Promo</label>
            <input value={form.kode} onChange={e => set('kode', e.target.value.toUpperCase().replace(/\s/g, ''))}
              disabled={isEdit}
              placeholder="Contoh: HEMAT10"
              className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-[#1E1C43] ${
                isEdit ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100' : 'bg-white border-gray-200'
              } ${err.kode ? 'border-red-400' : ''}`} />
            {err.kode && <p className="text-[10px] text-red-500 mt-0.5">{err.kode}</p>}
          </div>

          {/* ── C: Label ── */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Nama / Deskripsi Singkat</label>
            <input value={form.label} onChange={e => set('label', e.target.value)}
              placeholder="Contoh: Voucher Hemat 10%"
              className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-[#1E1C43] bg-white ${err.label ? 'border-red-400' : 'border-gray-200'}`} />
            {err.label && <p className="text-[10px] text-red-500 mt-0.5">{err.label}</p>}
          </div>

          {/* ── D: Sub-tipe ── */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              {form.tipe === 'diskon' ? 'Jenis Potongan' : 'Jenis Bonus'}
            </label>
            <div className="flex gap-2 flex-wrap">
              {subTipeOpts.map(st => (
                <button key={st} onClick={() => set('subTipe', st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    form.subTipe === st ? 'bg-[#1E1C43] text-white border-[#1E1C43]' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}>
                  {SUBTIPE_LABEL[st]}
                </button>
              ))}
            </div>
          </div>

          {/* ── E: Nilai (diskon only) ── */}
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

          {/* ── F: Keterangan ── */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Keterangan (Opsional)</label>
            <textarea value={form.keterangan} onChange={e => set('keterangan', e.target.value)}
              rows={2} placeholder="Syarat & ketentuan, catatan tambahan, dll"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1E1C43] bg-white resize-none" />
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-gray-100 pt-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Pembatasan & Kuota</p>

            {/* ── G: Program Berlaku ── */}
            <div className="space-y-2 mb-4">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">Program yang Berlaku</label>
              <div className="flex gap-2">
                {[['semua', 'Semua Program'], ['spesifik', 'Program Tertentu']].map(([mode, label]) => (
                  <button key={mode} onClick={() => setProgramMode(mode)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                      programMode === mode ? 'bg-[#1E1C43] text-white border-[#1E1C43]' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}>
                    {mode === 'semua' ? <><Unlock size={11} className="inline mr-1" />{label}</> : <><Lock size={11} className="inline mr-1" />{label}</>}
                  </button>
                ))}
              </div>
              {programMode === 'semua' && (
                <p className="text-[10px] text-gray-400">Promo dapat dipakai untuk semua program aktif.</p>
              )}
              {programMode === 'spesifik' && (
                <div>
                  <p className="text-[10px] text-gray-400 mb-2">
                    Pilih program yang boleh menggunakan promo ini. Saat apply kode, sistem otomatis memvalidasi program yang dipilih klien.
                  </p>
                  {allPrograms.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Tidak ada program aktif.</p>
                  ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                      {allPrograms.map(prog => {
                        const checked = selectedPrograms.includes(prog.id)
                        return (
                          <button key={prog.id} type="button" onClick={() => toggleProgram(prog.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left border-b border-gray-50 last:border-0 transition-colors ${
                              checked ? 'bg-blue-50' : 'hover:bg-gray-50'
                            }`}>
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                              checked ? 'bg-[#1E1C43] border-[#1E1C43]' : 'border-gray-300'
                            }`}>
                              {checked && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                            </div>
                            <span className="text-[10px] font-semibold text-[#1E1C43] shrink-0 bg-[#1E1C43]/10 px-1.5 py-0.5 rounded">{prog.id}</span>
                            <span className="text-xs text-gray-700 flex-1 truncate">{prog.namaLatihan} — {prog.namaPaket}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {err.program && <p className="text-[10px] text-red-500 mt-1">{err.program}</p>}
                  {selectedPrograms.length > 0 && (
                    <p className="text-[10px] text-blue-600 mt-1">{selectedPrograms.length} program dipilih</p>
                  )}
                </div>
              )}
            </div>

            {/* ── H: Periode Berlaku ── */}
            <div className="mb-4">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">Periode Berlaku (Opsional)</label>
              <p className="text-[10px] text-gray-400 mb-2">Kosongkan jika tidak ada batas waktu. Jika diisi, sistem otomatis memvalidasi saat promo digunakan.</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 mb-1 block">Mulai</label>
                  <input type="date" value={form.tanggalMulai}
                    onChange={e => set('tanggalMulai', e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 outline-none focus:border-[#1E1C43]" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 mb-1 block">Berakhir</label>
                  <input type="date" value={form.tanggalBerakhir}
                    onChange={e => set('tanggalBerakhir', e.target.value)}
                    min={form.tanggalMulai || undefined}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 outline-none focus:border-[#1E1C43]" />
                </div>
              </div>
            </div>

            {/* ── I: Kuota Pemakaian ── */}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">Kuota Pemakaian</label>
              <div className="flex gap-2 mb-2">
                {[['unlimited', 'Unlimited'], ['terbatas', 'Terbatas']].map(([mode, label]) => (
                  <button key={mode} onClick={() => { setKuotaMode(mode); if (mode === 'unlimited') setKuotaInput('') }}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                      kuotaMode === mode ? 'bg-[#1E1C43] text-white border-[#1E1C43]' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
              {kuotaMode === 'terbatas' && (
                <div>
                  <input type="number" value={kuotaInput} onChange={e => setKuotaInput(e.target.value)}
                    placeholder="Maks jumlah pemakaian (cth: 50)"
                    min={1}
                    className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-[#1E1C43] bg-white ${err.kuota ? 'border-red-400' : 'border-gray-200'}`} />
                  {err.kuota && <p className="text-[10px] text-red-500 mt-0.5">{err.kuota}</p>}
                  {isEdit && form.jumlahPemakaian > 0 && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Sudah terpakai: <span className="font-semibold text-gray-600">{form.jumlahPemakaian}x</span>. Pastikan batas baru ≥ jumlah yang sudah terpakai.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── J: Benefit Bonus Tambahan (diskon only) ── */}
          {form.tipe === 'diskon' && (
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Benefit Bonus Tambahan (Opsional)
              </label>
              <input value={form.benefitBonus} onChange={e => set('benefitBonus', e.target.value)}
                placeholder="Contoh: Free Tote Bag EFM, Free 1 Sachet Protein"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1E1C43] bg-white" />
              <p className="text-[10px] text-gray-400 mt-1">
                Isian ini untuk benefit tambahan di luar potongan harga (mis. merchandise, free treatment). Ditampilkan di invoice sebagai catatan bonus.
              </p>
            </div>
          )}

          {/* ── Divider ── */}
          <div className="border-t border-gray-100 pt-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Promo Tematik</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Aktifkan untuk promo spesial bertema (Natal, Kemerdekaan, dll). Ditandai dengan badge khusus di order & invoice.</p>
              </div>
              <button onClick={() => setTemaMode(v => !v)}>
                {temaMode
                  ? <ToggleRight size={26} className="text-[#1E1C43]" />
                  : <ToggleLeft  size={26} className="text-gray-300" />}
              </button>
            </div>

            {temaMode && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                {/* Quick-pick */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pilih Cepat</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TEMA_QUICK_OPTS.map(opt => (
                      <button key={opt.nama}
                        onClick={() => setTemaForm({ nama: opt.nama, icon: opt.icon, warna: opt.warna, berlakuHingga: temaForm.berlakuHingga })}
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
                {/* Custom nama */}
                <div>
                  <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1 block">Nama Tema</label>
                  <input value={temaForm.nama} onChange={e => setTema('nama', e.target.value)}
                    placeholder="Contoh: Natal, Kemerdekaan, Harbolnas..."
                    className={`w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-[#1E1C43] bg-white ${err.tema ? 'border-red-400' : 'border-gray-200'}`} />
                  {err.tema && <p className="text-[10px] text-red-500 mt-0.5">{err.tema}</p>}
                </div>
                {/* Icon + Warna */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1 block">Icon (Emoji)</label>
                    <input value={temaForm.icon} onChange={e => setTema('icon', e.target.value)}
                      placeholder="Contoh: 🎄"
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1E1C43] bg-white" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1 block">Warna Badge</label>
                    <select value={temaForm.warna} onChange={e => setTema('warna', e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1E1C43] bg-white">
                      {TEMA_WARNA_OPTS.map(w => <option key={w.key} value={w.key}>{w.label}</option>)}
                    </select>
                  </div>
                </div>
                {/* Preview badge */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">Preview badge:</span>
                  <span className={`text-xs font-medium border px-2 py-0.5 rounded-full ${TEMA_WARNA_CLS[temaForm.warna] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {temaForm.icon} {temaForm.nama || 'Nama Tema'}
                  </span>
                </div>
                {/* Berlaku Hingga khusus tema */}
                <div>
                  <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-1 block">Berlaku Hingga (Tema)</label>
                  <input type="date" value={temaForm.berlakuHingga || ''}
                    onChange={e => setTema('berlakuHingga', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1E1C43] bg-white" />
                  <p className="text-[10px] text-gray-400 mt-0.5">Ditampilkan di UI sebagai informasi kampanye tematik.</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-gray-100 pt-1">
            {/* ── L: Status Aktif ── */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <div>
                <p className="text-xs font-semibold text-gray-700">Status Promo</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {form.aktif ? 'Aktif — dapat digunakan di Order & Invoice' : 'Tidak aktif — tidak bisa dipakai'}
                </p>
              </div>
              <button onClick={() => set('aktif', !form.aktif)}>
                {form.aktif
                  ? <ToggleRight size={28} className="text-[#1E1C43]" />
                  : <ToggleLeft  size={28} className="text-gray-300" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button onClick={handleSave} className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#1E1C43] text-white hover:opacity-90 transition-colors">
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
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
        <span className="ml-1 text-[10px] font-medium border px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 border-red-200">Habis</span>
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
  const { setCrumbs } = useBreadcrumb()
  const [list, setList]     = useState(() => getAllPromo())
  const [fTipe,   setFTipe]   = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fTema,   setFTema]   = useState('')
  const [search,  setSearch]  = useState('')
  const [modal,     setModal]     = useState(null)
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

  const existingKodes = list.map(p => p.kode)

  return (
    <div className="flex flex-col gap-4">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#1E1C43] leading-tight">Promo &amp; Diskon</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola kode promo yang dapat digunakan di Order &amp; Invoice PP</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditTarget(null); setModal('add') }}
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
            <div key={k.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
              <Icon size={16} className="text-[#1E1C43] shrink-0 opacity-60" />
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{k.label}</p>
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
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-[#1E1C43] focus-within:bg-white transition-colors">
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
          <table className="w-full" style={{ minWidth: '920px' }}>
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  ['Kode Promo',     150],
                  ['Nama / Deskripsi', 210],
                  ['Tipe',           110],
                  ['Nilai / Benefit', 150],
                  ['Program',         110],
                  ['Kuota',            90],
                  ['Status',          110],
                  ['Aksi',            100],
                ].map(([h, mw]) => (
                  <th key={h} style={{ minWidth: mw }} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-xs text-gray-400">Tidak ada data promo.</td></tr>
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
                  <tr key={p.kode} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">

                    {/* Kode + tema badge */}
                    <td className="px-3 py-3">
                      <span className="text-xs font-semibold text-[#1E1C43] font-mono tracking-wide bg-gray-100 px-2 py-0.5 rounded-md">{p.kode}</span>
                      {p.tema && (
                        <div className="mt-1">
                          <span className={`text-xs font-medium border px-1.5 py-0.5 rounded-full ${TEMA_WARNA_CLS[p.tema.warna] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {p.tema.icon} {p.tema.nama}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Nama + periode */}
                    <td className="px-3 py-3">
                      <p className="text-xs font-medium text-gray-900">{p.label}</p>
                      {p.keterangan && <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[190px]">{p.keterangan}</p>}
                      {periodeStr && (
                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Calendar size={9} className="shrink-0" />{periodeStr}
                        </p>
                      )}
                    </td>

                    {/* Tipe */}
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${TIPE_CLS[p.tipe]}`}>
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
                        <button onClick={() => handleToggle(p.kode)} className="flex items-center gap-1.5">
                          {p.aktif
                            ? <ToggleRight size={18} className="text-[#1E1C43] shrink-0" />
                            : <ToggleLeft  size={18} className="text-gray-300 shrink-0" />}
                          <span className={`text-xs font-medium border px-1.5 py-0.5 rounded-full whitespace-nowrap ${statusCfg.cls}`}>
                            {statusCfg.label}
                          </span>
                        </button>
                        {!isFullyAktif && p.aktif && (
                          <p className="text-[10px] text-gray-400 pl-0.5">toggle = aktif manual</p>
                        )}
                      </div>
                    </td>

                    {/* Aksi */}
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

      {/* ── Modal tambah / edit ── */}
      {(modal === 'add' || modal === 'edit') && (
        <PromoModal
          initial={modal === 'edit' ? editTarget : null}
          existingKodes={existingKodes}
          onSave={modal === 'edit' ? handleEdit : handleAdd}
          onClose={() => { setModal(null); setEditTarget(null) }}
        />
      )}

      {/* ── Konfirmasi hapus ── */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDel(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-bold text-[#1E1C43] mb-1">Hapus kode promo?</p>
            <p className="text-xs text-gray-500 mb-4">
              Kode <span className="font-semibold text-gray-700">{confirmDel}</span> akan dihapus permanen. Order &amp; invoice yang sudah menggunakan kode ini tidak terpengaruh.
            </p>
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
