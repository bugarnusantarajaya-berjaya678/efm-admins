import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { ArrowLeft, Dumbbell } from 'lucide-react'
import { PIC_DB, PIC_OPTS_DB, formatRp } from '../../data/ppProgramDBData'
import {
  getProgramById, addStoredProgram, updateStoredProgram,
  deleteStoredProgram, getExistingIds,
} from '../../data/ppProgramStore'
import { getStoredJenis } from '../../data/ppJenisStore'
import { getAllOrders } from '../../data/ppOrdersStore'

// Kode jenis per nama latihan — menentukan segment kedua ID (PRG-[KODE]-[URUT])
const KODE_MAP = {
  'Private Training':        'PP',
  'Semi Private Training':   'SP',
  'Group Training':          'GP',
  'Fisioterapi':             'TH',
  'Yoga Therapy':            'TH',
  'Posture Correction':      'TH',
  'Yoga & Stretching':       'TH',
  'Sports Rehab':            'TH',
  'Strength & Conditioning': 'SC',
  'Nutrition Coaching':      'NC',
  'Kids Fitness':            'KF',
}

function getNextSequence(kode) {
  const prefix = `PRG-${kode}-`
  const maxSeq = getExistingIds()
    .filter(id => id.startsWith(prefix))
    .reduce((max, id) => {
      const seq = parseInt(id.split('-').pop()) || 0
      return seq > max ? seq : max
    }, 0)
  return maxSeq + 1
}

function buildId(kode, urut) {
  return `PRG-${kode}-${String(parseInt(urut) || 1).padStart(3, '0')}`
}

const EMPTY_FORM = {
  id: '', kodeJenis: '', nomorUrut: '',
  namaLatihan: '', namaPaket: '', sesi: '', pertemuan: '', partisipan: '1',
  masa: '', picId: '', biayaSesiPIC: '', hargaPersesi: '', diskonPaket: '0', harga: '', status: 'aktif',
}

function toFormValues(prog) {
  const parts = prog.id.split('-') // ['PRG', 'PP', '001']
  return {
    ...prog,
    kodeJenis: parts[1] || '',
    nomorUrut: parts[2] || '',
    sesi: String(prog.sesi),
    pertemuan: String(prog.pertemuan),
    partisipan: String(prog.partisipan),
    biayaSesiPIC: String(prog.biayaSesiPIC),
    hargaPersesi: String(prog.hargaPersesi),
    diskonPaket: String(prog.diskonPaket),
    harga: String(prog.harga),
  }
}

function calcHarga(f) {
  const sesi = parseInt(f.sesi) || 0
  const rate = parseInt(f.hargaPersesi) || 0
  const disc = parseInt(f.diskonPaket) || 0
  return String(Math.max(0, sesi * rate - disc))
}

export default function PPProgramFormPage() {
  const navigate = useNavigate()
  const { progId } = useParams()
  const isEdit = !!progId
  const existing = isEdit ? getProgramById(progId) : null

  useBreadcrumb([
    { label: 'Private Program' },
    { label: 'Program DB', to: '/pp/program-db' },
    { label: isEdit ? `Edit — ${progId}` : 'Program Baru' },
  ])

  const [form, setForm] = useState(() => isEdit && existing ? toFormValues(existing) : { ...EMPTY_FORM })
  const [errors, setErrors] = useState({})

  const jenisAktif = getStoredJenis().filter(j => j.status === 'aktif').map(j => j.nama)
  const picInfo = PIC_DB[form.picId] || null
  const jenisOptions = jenisAktif.includes(form.namaLatihan) ? form.namaLatihan : (form.namaLatihan ? 'Lainnya' : '')

  function set(key, val) {
    setForm(prev => {
      const next = { ...prev, [key]: val }
      if (['sesi', 'hargaPersesi', 'diskonPaket'].includes(key)) next.harga = calcHarga(next)
      if (key === 'namaLatihan' && !isEdit) {
        const jenisItem = getStoredJenis().find(j => j.nama === val)
        const kode = jenisItem?.kode || KODE_MAP[val] || (val ? 'OT' : '')
        const urut = kode ? String(getNextSequence(kode)) : ''
        next.kodeJenis = kode
        next.nomorUrut = urut
        next.id = kode && urut ? buildId(kode, urut) : ''
      }
      if (key === 'nomorUrut' && !isEdit && prev.kodeJenis) {
        next.id = buildId(prev.kodeJenis, val)
      }
      return next
    })
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }))
  }

  function onPICChange(val) {
    const p = PIC_DB[val]
    setForm(prev => ({
      ...prev,
      picId: val,
      biayaSesiPIC: p && !prev.biayaSesiPIC ? String(p.biayaSesi) : prev.biayaSesiPIC,
    }))
    if (errors.picId) setErrors(p => ({ ...p, picId: '' }))
  }

  function validate() {
    const e = {}
    if (!form.kodeJenis)                                          e.nomorUrut = 'Pilih jenis program terlebih dahulu'
    else if (!form.nomorUrut || parseInt(form.nomorUrut) < 1)    e.nomorUrut = 'Nomor urut tidak valid'
    else if (!isEdit && getExistingIds().includes(form.id))       e.nomorUrut = `ID ${form.id} sudah digunakan`
    if (!form.namaLatihan.trim()) e.namaLatihan = 'Nama latihan wajib dipilih'
    if (!form.namaPaket.trim())   e.namaPaket   = 'Nama paket wajib diisi'
    if (!form.sesi)               e.sesi        = 'Jumlah sesi wajib diisi'
    if (!form.pertemuan)          e.pertemuan   = 'Pertemuan/minggu wajib diisi'
    if (!form.masa.trim())        e.masa        = 'Masa berlaku wajib diisi'
    if (!form.picId)              e.picId       = 'PIC wajib dipilih'
    if (!form.biayaSesiPIC)       e.biayaSesiPIC = 'Biaya sesi PIC wajib diisi'
    if (!form.hargaPersesi)       e.hargaPersesi = 'Harga per sesi wajib diisi'
    return e
  }

  function handleSimpan() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const prog = {
      id:           isEdit ? progId : buildId(form.kodeJenis, form.nomorUrut),
      namaLatihan:  form.namaLatihan.trim(),
      namaPaket:    form.namaPaket.trim(),
      sesi:         parseInt(form.sesi) || 0,
      pertemuan:    parseInt(form.pertemuan) || 0,
      partisipan:   parseInt(form.partisipan) || 1,
      masa:         form.masa.trim(),
      picId:        form.picId,
      biayaSesiPIC: parseInt(form.biayaSesiPIC) || 0,
      hargaPersesi: parseInt(form.hargaPersesi) || 0,
      diskonPaket:  parseInt(form.diskonPaket) || 0,
      harga:        parseInt(form.harga) || 0,
      status:       form.status,
    }

    if (isEdit) {
      updateStoredProgram(progId, prog)
    } else {
      addStoredProgram(prog)
    }
    navigate('/pp/program-db')
  }

  function handleHapus() {
    const linkedOrders = getAllOrders().filter(o => o.programId === progId)
    if (linkedOrders.length > 0) {
      const ids = linkedOrders.map(o => o.id).join(', ')
      alert(`Program "${progId}" tidak dapat dihapus karena terhubung dengan ${linkedOrders.length} order aktif: ${ids}.\n\nNonaktifkan program terlebih dahulu jika tidak ingin program ini tersedia untuk order baru.`)
      return
    }
    if (!confirm(`Hapus program "${progId}"? Tindakan ini tidak dapat dibatalkan.`)) return
    deleteStoredProgram(progId)
    navigate('/pp/program-db')
  }

  const inputCls = (key) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] transition-colors ${errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`

  const label = 'text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block'

  return (
    <div className="bg-[#F5F5F7] min-h-screen pb-24">

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
              <Dumbbell size={22} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Private Program — Database</p>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">
                {isEdit ? `Edit Program — ${progId}` : 'Program Baru'}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                {isEdit ? 'Ubah detail program, harga, dan penugasan PIC' : 'Tambah paket program latihan baru ke database'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/pp/program-db')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors"
          >
            <ArrowLeft size={12} /> Kembali
          </button>
        </div>
      </div>

      <div className="space-y-4">

        {/* Section 1: Identitas Program */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Identitas Program</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Nama Latihan — PERTAMA, karena menentukan Kode Jenis */}
            <div className="sm:col-span-2">
              <label className={label}>Nama Latihan / Terapi <span className="text-red-500">*</span></label>
              <select
                className={inputCls('namaLatihan')}
                value={jenisOptions}
                onChange={e => {
                  if (e.target.value !== 'Lainnya') set('namaLatihan', e.target.value)
                  else set('namaLatihan', '')
                }}
                disabled={isEdit}
              >
                <option value="">— Pilih Jenis Program —</option>
                {jenisAktif.map(j => <option key={j} value={j}>{j}</option>)}
                <option value="Lainnya">Lainnya</option>
              </select>
              {jenisOptions === 'Lainnya' && (
                <input
                  className={`${inputCls('namaLatihan')} mt-2`}
                  placeholder="Tulis nama latihan / terapi..."
                  value={form.namaLatihan}
                  onChange={e => set('namaLatihan', e.target.value)}
                  disabled={isEdit}
                />
              )}
              {errors.namaLatihan && <p className="text-red-500 text-[10px] mt-1">{errors.namaLatihan}</p>}
            </div>

            {/* ID Program — display-only, auto-generated dari jenis program */}
            <div>
              <label className={label}>ID Program</label>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-mono font-semibold text-gray-400 shrink-0">PRG</span>
                <span className="text-gray-300 shrink-0">—</span>
                <div className={`flex items-center justify-center w-12 rounded-lg py-2.5 text-sm font-mono font-bold text-center select-none ${form.kodeJenis ? 'bg-[#1E1C43] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {form.kodeJenis || '??'}
                </div>
                <span className="text-gray-300 shrink-0">—</span>
                <div className={`w-16 rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-center select-none ${form.nomorUrut ? 'bg-gray-100 text-[#1E1C43]' : 'bg-gray-50 text-gray-300'}`}>
                  {form.nomorUrut ? String(parseInt(form.nomorUrut)).padStart(3, '0') : '???'}
                </div>
              </div>
              {errors.nomorUrut
                ? <p className="text-red-500 text-[10px] mt-1">{errors.nomorUrut}</p>
                : <p className="text-[10px] text-gray-400 mt-1">
                    {form.id
                      ? <>ID: <span className="font-mono font-medium text-[#1E1C43]">{form.id}</span> · Auto-generated, tidak dapat diubah manual</>
                      : 'Pilih Nama Latihan / Terapi — ID akan otomatis terbuat'}
                  </p>
              }
            </div>

            <div>
              <label className={label}>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls('status')}>
                <option value="aktif">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={label}>Nama Paket <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.namaPaket}
                onChange={e => set('namaPaket', e.target.value)}
                placeholder="Contoh: 12 Sesi - Pro"
                className={inputCls('namaPaket')}
              />
              {errors.namaPaket && <p className="text-red-500 text-[10px] mt-1">{errors.namaPaket}</p>}
            </div>

            <div>
              <label className={label}>Jumlah Sesi <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={form.sesi}
                onChange={e => set('sesi', e.target.value)}
                placeholder="12"
                min="1"
                className={inputCls('sesi')}
              />
              {errors.sesi && <p className="text-red-500 text-[10px] mt-1">{errors.sesi}</p>}
            </div>

            <div>
              <label className={label}>Pertemuan / Minggu <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={form.pertemuan}
                onChange={e => set('pertemuan', e.target.value)}
                placeholder="3"
                min="1"
                className={inputCls('pertemuan')}
              />
              {errors.pertemuan && <p className="text-red-500 text-[10px] mt-1">{errors.pertemuan}</p>}
            </div>

            <div>
              <label className={label}>Jumlah Partisipan</label>
              <input
                type="number"
                value={form.partisipan}
                onChange={e => set('partisipan', e.target.value)}
                placeholder="1"
                min="1"
                className={inputCls('partisipan')}
              />
            </div>

            <div>
              <label className={label}>Masa Berlaku Paket <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.masa}
                onChange={e => set('masa', e.target.value)}
                placeholder="Contoh: 60 hari"
                className={inputCls('masa')}
              />
              {errors.masa && <p className="text-red-500 text-[10px] mt-1">{errors.masa}</p>}
            </div>

          </div>
        </div>

        {/* Section 2: PIC / Pelatih */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">PIC / Pelatih yang Ditugaskan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className={label}>Pilih PIC <span className="text-red-500">*</span></label>
              <select value={form.picId} onChange={e => onPICChange(e.target.value)} className={inputCls('picId')}>
                <option value="">— Pilih PIC —</option>
                {PIC_OPTS_DB.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
              {errors.picId && <p className="text-red-500 text-[10px] mt-1">{errors.picId}</p>}
            </div>

            <div>
              <label className={label}>Biaya Per Sesi PIC (Rp) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={form.biayaSesiPIC}
                onChange={e => set('biayaSesiPIC', e.target.value)}
                placeholder="75000"
                min="0"
                className={inputCls('biayaSesiPIC')}
              />
              {errors.biayaSesiPIC && <p className="text-red-500 text-[10px] mt-1">{errors.biayaSesiPIC}</p>}
            </div>

          </div>

          {picInfo && (
            <div className="mt-4 bg-gray-50 rounded-xl p-4 border-l-4 border-[#E05945]">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Info PIC</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] text-gray-400">Spesialisasi</p>
                  <p className="text-sm font-semibold text-gray-800">{picInfo.spesialis}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">No. HP</p>
                  <p className="text-sm font-semibold text-gray-800">{picInfo.hp}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Default Biaya / Sesi</p>
                  <p className="text-sm font-semibold text-[#E05945]">{formatRp(picInfo.biayaSesi)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Harga */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Harga Paket</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className={label}>Harga Per Sesi (Rp) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={form.hargaPersesi}
                onChange={e => set('hargaPersesi', e.target.value)}
                placeholder="125000"
                min="0"
                className={inputCls('hargaPersesi')}
              />
              {errors.hargaPersesi && <p className="text-red-500 text-[10px] mt-1">{errors.hargaPersesi}</p>}
            </div>

            <div>
              <label className={label}>Diskon Paket (Rp)</label>
              <input
                type="number"
                value={form.diskonPaket}
                onChange={e => set('diskonPaket', e.target.value)}
                placeholder="0"
                min="0"
                className={inputCls('diskonPaket')}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={label}>Harga Paket / Total (Rp)</label>
              <input
                type="number"
                value={form.harga}
                readOnly
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Auto-hitung: (Harga Per Sesi × Jumlah Sesi) − Diskon Paket
                {form.harga ? ` = ${formatRp(parseInt(form.harga) || 0)}` : ''}
              </p>
            </div>

          </div>
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
                Hapus Program
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/pp/program-db')}
              className="border border-gray-200 text-gray-600 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSimpan}
              className="bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              {isEdit ? 'Simpan Perubahan' : 'Simpan Program'}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
