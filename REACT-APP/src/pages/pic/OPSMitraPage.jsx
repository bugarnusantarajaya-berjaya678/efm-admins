import { useState } from 'react'
import { X, Plus, Search, Users, Building2, Info, Phone, Mail, MapPin } from 'lucide-react'
import { mitraList, mitraStats } from '../../data/opsData'

const EMOJI_BG = ['#EBF5FB', '#EAFAF1', '#FEF9E7', '#F5EEF8', '#FEF3E2', '#E8F8F5']

const STATUS_CONFIG = {
  aktif:    { label: 'Aktif',    cls: 'bg-green-50 text-green-600'  },
  nonaktif: { label: 'Nonaktif', cls: 'bg-gray-100 text-gray-500'   },
}

const KATEGORI_LIST = [
  'Semua Kategori',
  'Vendor Alat Fitness',
  'Vendor Pakaian & Aksesoris',
  'Jasa Servis Alat',
  'Media & Dokumentasi',
  'Vendor Nutrisi',
  'Media & Promosi',
]

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

function DetailModal({ mitra, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h3 className="text-[16px] font-bold text-text-primary">Detail Mitra</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-text-primary transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Icon + name */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
            <div className="w-[56px] h-[56px] rounded-xl flex items-center justify-center text-[24px] shrink-0" style={{ background: EMOJI_BG[mitraList.indexOf(mitra) % EMOJI_BG.length] }}>
              {mitra.emoji}
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-text-primary">{mitra.nama}</h4>
              <p className="text-[12px] text-text-muted mt-0.5">{mitra.id} · {mitra.kategori}</p>
              <div className="mt-1.5"><StatusBadge status={mitra.status} /></div>
            </div>
          </div>

          {/* Info fields */}
          <div className="px-6 py-5 space-y-3.5">
            {[
              [Phone,   'No. HP / Telp', mitra.noHp],
              [Mail,    'Email',          mitra.email],
              [MapPin,  'Kota',           mitra.kota],
            ].map(([Icon, label, val]) => (
              <div key={label} className="flex items-center gap-3 text-[13px]">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-text-muted" />
                </div>
                <div>
                  <p className="text-[11px] text-text-muted">{label}</p>
                  <p className="text-text-primary font-semibold">{val}</p>
                </div>
              </div>
            ))}
            <div className="pt-1">
              <p className="text-[12px] font-semibold text-text-muted mb-1">Catatan / Layanan</p>
              <p className="text-[13px] text-text-primary bg-gray-50 rounded-xl px-3 py-2.5">{mitra.catatan}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-text-muted border border-gray-200 rounded-lg hover:border-text-primary transition-colors">Tutup</button>
            <button onClick={() => window.open(`tel:${mitra.noHp}`)} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors">Hubungi</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddMitraModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[520px] shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h3 className="text-[16px] font-bold text-text-primary">Tambah Mitra Baru</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-text-primary transition-colors">
              <X size={15} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Nama Mitra <span className="text-accent">*</span></label>
              <input type="text" placeholder="Nama perusahaan / vendor" className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Kategori <span className="text-accent">*</span></label>
                <select className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary bg-white">
                  <option>Pilih...</option>
                  {KATEGORI_LIST.slice(1).map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-primary mb-1.5">No HP / Telp <span className="text-accent">*</span></label>
                <input type="text" placeholder="+62 xxx" className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Email</label>
              <input type="email" placeholder="email@mitra.com" className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Kota</label>
                <input type="text" placeholder="Jakarta" className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Status</label>
                <select className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary bg-white">
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Catatan / Layanan</label>
              <textarea rows={2} placeholder="Produk atau jasa yang disediakan..." className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-text-muted border border-gray-200 rounded-lg hover:border-text-primary transition-colors">Batal</button>
            <button onClick={onClose} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors">Simpan Mitra</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MitraCard({ mitra, idx, onDetail }) {
  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-[22px] flex gap-4 items-start hover:shadow-md transition-shadow cursor-pointer">
      {/* Emoji icon */}
      <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center text-[22px] shrink-0" style={{ background: EMOJI_BG[idx % EMOJI_BG.length] }}>
        {mitra.emoji}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-bold text-text-primary truncate">{mitra.nama}</h3>
        <p className="text-[12px] text-text-muted mb-2">{mitra.kategori}</p>
        <StatusBadge status={mitra.status} />

        {/* Contact info */}
        <div className="flex flex-col gap-1.5 mt-3 mb-3.5">
          <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
            <Phone size={13} className="shrink-0" />{mitra.noHp}
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
            <Mail size={13} className="shrink-0" />{mitra.email}
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
            <MapPin size={13} className="shrink-0" />{mitra.kota}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onDetail(mitra)}
            className="flex-1 py-1.5 text-[12px] font-semibold text-text-primary border-[1.5px] border-text-primary rounded-lg hover:bg-gray-50 transition-colors"
          >
            Detail
          </button>
          <button
            onClick={() => onDetail(mitra)}
            className="flex-1 py-1.5 text-[12px] font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
          >
            Hubungi
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OPSMitraPage() {
  const [kategoriFilter, setKategoriFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedMitra, setSelectedMitra] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const filtered = mitraList.filter(m => {
    if (kategoriFilter && kategoriFilter !== 'Semua Kategori' && m.kategori !== kategoriFilter) return false
    if (statusFilter && m.status !== statusFilter) return false
    if (search && !m.nama.toLowerCase().includes(search.toLowerCase()) && !m.kategori.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Database Mitra</h1>
          <p className="text-[13px] text-text-muted mt-1">Vendor, supplier, dan mitra bisnis EFM</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors">
          <Plus size={15} />Tambah Mitra
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Mitra Aktif</p>
            <p className="text-[22px] font-bold text-text-primary">{mitraStats.mitraAktif}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-accent flex items-center justify-center shrink-0">
            <Building2 size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Vendor Alat</p>
            <p className="text-[22px] font-bold text-text-primary">{mitraStats.vendorAlat}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[rgba(30,28,67,0.1)] text-text-primary flex items-center justify-center shrink-0">
            <Info size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Total Mitra</p>
            <p className="text-[22px] font-bold text-text-primary">{mitraStats.total}</p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 px-5 py-4 flex items-center gap-3 mb-5">
        <select
          value={kategoriFilter}
          onChange={e => setKategoriFilter(e.target.value)}
          className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white"
        >
          {KATEGORI_LIST.map(k => <option key={k}>{k}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white"
        >
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama mitra..."
            className="w-full pl-8 pr-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary"
          />
        </div>
        <p className="text-[12px] text-text-muted whitespace-nowrap">{filtered.length} mitra</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-5">
        {filtered.map((mitra, i) => (
          <MitraCard key={mitra.id} mitra={mitra} idx={i} onDetail={setSelectedMitra} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 bg-white rounded-2xl border-[1.5px] border-gray-200 px-6 py-12 text-center text-[13px] text-text-muted">
            Tidak ada mitra yang sesuai filter
          </div>
        )}
      </div>

      {selectedMitra && <DetailModal mitra={selectedMitra} onClose={() => setSelectedMitra(null)} />}
      {showAdd && <AddMitraModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
