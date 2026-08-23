import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { X, Plus, FileText, AlertCircle, CheckCircle, Clock, ArrowLeft } from 'lucide-react'
import { picList } from '../../data/opsData'

const TODAY = new Date('2026-06-20')

function getPKSStatus(tglHabis) {
  const habis = new Date(tglHabis)
  const diffDays = Math.ceil((habis - TODAY) / (1000 * 60 * 60 * 24))
  if (diffDays < 0)   return 'habis'
  if (diffDays <= 90) return 'akan_habis'
  return 'aktif'
}

const STATUS_CFG = {
  aktif:      { label: 'Aktif',      cls: 'bg-green-50 text-green-600'   },
  akan_habis: { label: 'Akan Habis', cls: 'bg-yellow-50 text-yellow-600' },
  habis:      { label: 'Habis',      cls: 'bg-red-50 text-red-500'       },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

function EditPKSModal({ pic, onClose, onSave }) {
  const [form, setForm] = useState({ tglMulai: pic.tglMulaiPks, tglHabis: pic.tglHabisPks, catatan: pic.catatan })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h3 className="text-[15px] font-bold text-text-primary">Edit Kontrak PKS</h3>
              <p className="text-[12px] text-text-muted mt-0.5">{pic.nama} · {pic.id}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-text-primary transition-colors">
              <X size={15} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Tgl Mulai PKS <span className="text-accent">*</span></label>
                <input type="date" value={form.tglMulai} onChange={set('tglMulai')}
                  className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Tgl Habis PKS <span className="text-accent">*</span></label>
                <input type="date" value={form.tglHabis} onChange={set('tglHabis')}
                  className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Catatan</label>
              <textarea rows={2} value={form.catatan} onChange={set('catatan')}
                className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-text-muted border border-gray-200 rounded-lg hover:border-text-primary transition-colors">Batal</button>
            <button onClick={() => { onSave(pic.id, form); onClose() }} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContractPage() {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const picParam       = searchParams.get('pic')

  const [contracts, setContracts] = useState(
    picList.map(p => ({ ...p, pksStatus: getPKSStatus(p.tglHabisPks) }))
  )
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [editPIC, setEditPIC] = useState(null)

  useEffect(() => {
    if (picParam) {
      const found = picList.find(p => `EFM-${p.id}` === picParam)
      if (found) {
        navigate(`/pic/${found.id}?tab=kontrak`, { replace: true })
      }
    }
  }, [])

  const filtered = contracts.filter(c => {
    if (filterStatus && c.pksStatus !== filterStatus) return false
    if (search && !c.nama.toLowerCase().includes(search.toLowerCase()) && !c.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = {
    aktif:      contracts.filter(c => c.pksStatus === 'aktif').length,
    akan_habis: contracts.filter(c => c.pksStatus === 'akan_habis').length,
    habis:      contracts.filter(c => c.pksStatus === 'habis').length,
  }

  const handleSave = (id, form) => {
    setContracts(prev => prev.map(c =>
      c.id === id
        ? { ...c, tglMulaiPks: form.tglMulai, tglHabisPks: form.tglHabis, catatan: form.catatan, pksStatus: getPKSStatus(form.tglHabis) }
        : c
    ))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-text-primary hover:text-text-primary transition-colors">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Kontrak PIC / PKS</h1>
            <p className="text-[13px] text-text-muted mt-0.5">Kelola kontrak dan masa berlaku PKS semua pelatih</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors">
          <Plus size={15} />Tambah Kontrak
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">PKS Aktif</p>
            <p className="text-[22px] font-bold text-text-primary">{stats.aktif}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Akan Habis (&lt;90 hari)</p>
            <p className="text-[22px] font-bold text-text-primary">{stats.akan_habis}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">PKS Habis</p>
            <p className="text-[22px] font-bold text-text-primary">{stats.habis}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-5">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white"
        >
          <option value="">Semua Status PKS</option>
          <option value="aktif">Aktif</option>
          <option value="akan_habis">Akan Habis</option>
          <option value="habis">Habis</option>
        </select>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama atau ID PIC..."
          className="flex-1 max-w-[280px] px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary"
        />
        <p className="text-[12px] text-text-muted ml-auto">{filtered.length} kontrak</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['ID', 'Nama PIC', 'Spesialisasi', 'Tgl Mulai PKS', 'Tgl Habis PKS', 'Status PKS', 'Aksi'].map(h => (
                  <th key={h} className="bg-gray-50 px-3 py-2.5 text-[10px] font-semibold text-gray-500 text-left uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const border = i < filtered.length - 1 ? 'border-b border-gray-100' : ''
                return (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <td className={`text-xs font-semibold text-[#1E1C43] px-3 py-2.5 ${border}`}>{c.id}</td>
                    <td className={`px-3 py-2.5 ${border}`}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: c.warna }}>
                          {c.inisial}
                        </div>
                        <span className="text-xs font-medium text-gray-900 whitespace-nowrap">{c.nama}</span>
                      </div>
                    </td>
                    <td className={`text-xs font-normal text-gray-600 px-3 py-2.5 ${border}`}>{c.spesialis}</td>
                    <td className={`text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap ${border}`}>{c.tglMulaiPks}</td>
                    <td className={`text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap ${border}`}>{c.tglHabisPks}</td>
                    <td className={`px-3 py-2.5 ${border}`}><StatusBadge status={c.pksStatus} /></td>
                    <td className={`px-3 py-2.5 ${border}`}>
                      <button
                        onClick={() => setEditPIC(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border-[1.5px] border-gray-200 rounded-lg text-[12px] font-semibold text-text-muted hover:border-text-primary hover:text-text-primary transition-colors"
                      >
                        <FileText size={12} />Edit PKS
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-text-muted">Tidak ada kontrak yang sesuai filter</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editPIC && <EditPKSModal pic={editPIC} onClose={() => setEditPIC(null)} onSave={handleSave} />}
    </div>
  )
}
