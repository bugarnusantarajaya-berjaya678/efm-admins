import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Plus, Search, Users, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { picList, picStats } from '../../data/opsData'

const STATUS_CONFIG = {
  aktif:    { label: 'Aktif',    cls: 'bg-green-50 text-green-600'   },
  cuti:     { label: 'Cuti',     cls: 'bg-yellow-50 text-yellow-600' },
  nonaktif: { label: 'Nonaktif', cls: 'bg-gray-100 text-gray-500'    },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

function DetailModal({ pic, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h3 className="text-[16px] font-bold text-text-primary">Detail PIC</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-text-primary transition-colors">
              <X size={15} />
            </button>
          </div>

          <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
            <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-white text-[20px] font-bold shrink-0" style={{ background: pic.warna }}>
              {pic.inisial}
            </div>
            <div>
              <h4 className="text-[17px] font-bold text-text-primary">{pic.nama}</h4>
              <p className="text-[12px] text-text-muted mt-0.5">{pic.id} · {pic.spesialis}</p>
              <div className="mt-1.5"><StatusBadge status={pic.status} /></div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-3.5">
            {[
              ['No. HP',         pic.noHp],
              ['Area Coverage',  pic.area],
              ['Tgl Mulai PKS',  pic.tglMulaiPks],
              ['Tgl Habis PKS',  pic.tglHabisPks],
              ['Klien Aktif',    `${pic.klienAktif} klien`],
              ['Total Sesi',     `${pic.totalSesi} sesi`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-[13px]">
                <span className="text-text-muted font-medium">{label}</span>
                <span className="text-text-primary font-semibold">{val}</span>
              </div>
            ))}
            <div className="pt-1">
              <p className="text-[12px] font-semibold text-text-muted mb-1">Catatan</p>
              <p className="text-[13px] text-text-primary bg-gray-50 rounded-xl px-3 py-2.5">{pic.catatan}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-text-muted border border-gray-200 rounded-lg hover:border-text-primary transition-colors">Tutup</button>
            <button onClick={onClose} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors">Edit PIC</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddPICModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h3 className="text-[16px] font-bold text-text-primary">Tambah PIC Baru</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-text-primary transition-colors">
              <X size={15} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            {[
              ['Nama Lengkap', 'text', 'Masukkan nama lengkap...'],
              ['No. HP',       'text', '08xx-xxxx-xxxx'],
              ['Spesialisasi', 'text', 'Contoh: Yoga & Pilates'],
              ['Area Coverage','text', 'Contoh: Jakarta Selatan'],
            ].map(([label, type, ph]) => (
              <div key={label}>
                <label className="block text-[12px] font-semibold text-text-primary mb-1.5">{label} <span className="text-accent">*</span></label>
                <input type={type} placeholder={ph} className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Tgl Mulai PKS</label>
                <input type="date" className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Tgl Habis PKS</label>
                <input type="date" className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Status</label>
              <select className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary bg-white">
                <option value="aktif">Aktif</option>
                <option value="cuti">Cuti</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Catatan</label>
              <textarea rows={2} placeholder="Catatan tambahan..." className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-text-muted border border-gray-200 rounded-lg hover:border-text-primary transition-colors">Batal</button>
            <button onClick={onClose} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors">Simpan PIC</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PICCard({ pic }) {
  const navigate = useNavigate()
  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="px-5 py-5 flex items-start gap-4">
        <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white text-[18px] font-bold shrink-0" style={{ background: pic.warna }}>
          {pic.inisial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-text-primary leading-tight truncate">{pic.nama}</h3>
              <p className="text-[11px] text-text-muted mt-0.5">{pic.id}</p>
            </div>
            <StatusBadge status={pic.status} />
          </div>
          <p className="text-[12px] text-text-muted mt-1.5 truncate">{pic.spesialis}</p>
        </div>
      </div>

      <div className="border-t border-gray-100 mx-5" />

      <div className="px-5 py-3.5">
        <div className="flex items-center gap-1.5 text-[12px] text-text-muted mb-2">
          <span className="text-[14px]">📍</span>
          <span>{pic.area}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2.5">
          <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
            <p className="text-[11px] text-text-muted">Klien Aktif</p>
            <p className="text-[18px] font-bold text-text-primary">{pic.klienAktif}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
            <p className="text-[11px] text-text-muted">Total Sesi</p>
            <p className="text-[18px] font-bold text-text-primary">{pic.totalSesi}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-5 pb-5 pt-1">
        <button
          onClick={() => navigate(`/ops/pelatih/${pic.id}`)}
          className="flex-1 py-2 text-[12px] font-semibold text-text-primary border-[1.5px] border-gray-200 rounded-lg hover:border-text-primary hover:bg-gray-50 transition-colors"
        >
          Detail
        </button>
        <button
          onClick={() => navigate(`/ops/pelatih/${pic.id}?tab=kontrak`)}
          className="flex-1 py-2 text-center text-[12px] font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
        >
          Lihat PKS
        </button>
      </div>
    </div>
  )
}

const AREA_LIST = ['Semua Area', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Pusat', 'Jakarta Utara', 'Jakarta Timur']

export default function OPSPICPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [areaFilter, setAreaFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const filtered = picList.filter(p => {
    if (statusFilter && p.status !== statusFilter) return false
    if (areaFilter && areaFilter !== 'Semua Area' && p.area !== areaFilter) return false
    if (search && !p.nama.toLowerCase().includes(search.toLowerCase()) && !p.spesialis.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Database PIC / Pelatih</h1>
          <p className="text-[13px] text-text-muted mt-1">Kelola data trainer dan therapist aktif EFM</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors">
          <Plus size={15} />Tambah PIC
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">PIC Aktif</p>
            <p className="text-[22px] font-bold text-text-primary">{picStats.aktif}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Sedang Cuti</p>
            <p className="text-[22px] font-bold text-text-primary">{picStats.cuti}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[rgba(30,28,67,0.1)] text-text-primary flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Total Klien Aktif</p>
            <p className="text-[22px] font-bold text-text-primary">{picStats.totalKlien}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-accent flex items-center justify-center shrink-0">
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">PKS Akan Habis</p>
            <p className="text-[22px] font-bold text-text-primary">{picStats.pksHabis}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-5">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white"
        >
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="cuti">Cuti</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
        <select
          value={areaFilter}
          onChange={e => setAreaFilter(e.target.value)}
          className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white"
        >
          {AREA_LIST.map(a => <option key={a}>{a}</option>)}
        </select>
        <div className="relative flex-1 max-w-[280px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau spesialisasi..."
            className="w-full pl-8 pr-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary"
          />
        </div>
        <p className="text-[12px] text-text-muted ml-auto">{filtered.length} PIC ditemukan</p>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(pic => (
          <PICCard key={pic.id} pic={pic} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-white rounded-2xl border-[1.5px] border-gray-200 px-6 py-12 text-center text-[13px] text-text-muted">
            Tidak ada PIC yang sesuai filter
          </div>
        )}
      </div>

      {showAdd && <AddPICModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
