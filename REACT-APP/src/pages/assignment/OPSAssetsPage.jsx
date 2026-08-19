import { useState } from 'react'
import { Eye, Edit2, X, Plus, Search, CheckCircle, Wrench, XCircle, Package } from 'lucide-react'
import { assetList, assetStats } from '../../data/opsData'

const KONDISI_CONFIG = {
  baik:     { label: 'Baik',     cls: 'bg-green-50 text-green-600'   },
  servis:   { label: 'Servis',   cls: 'bg-yellow-50 text-yellow-600' },
  rusak:    { label: 'Rusak',    cls: 'bg-red-50 text-red-500'       },
  dipinjam: { label: 'Dipinjam', cls: 'bg-blue-50 text-blue-600'     },
}

const TABS = ['Semua', 'Alat Fitness', 'Perlengkapan', 'Elektronik']
const LOKASI_LIST = ['Semua Lokasi', 'Gudang Utama', 'Dipinjam ke Klien', 'Dalam Servis']

function KondisiBadge({ kondisi }) {
  const cfg = KONDISI_CONFIG[kondisi] || { label: kondisi, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

function DetailModal({ asset, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[440px] shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h3 className="text-[16px] font-bold text-text-primary">Detail Aset</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-text-primary transition-colors">
              <X size={15} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <p className="text-[11px] text-text-muted">{asset.kode}</p>
                <h4 className="text-[17px] font-bold text-text-primary mt-0.5">{asset.nama}</h4>
              </div>
              <KondisiBadge kondisi={asset.kondisi} />
            </div>
            {[
              ['Kategori',         asset.kategori],
              ['Jumlah',           asset.jumlah],
              ['Lokasi',           asset.lokasi],
              ['Tanggal Pembelian',asset.tglBeli],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-[13px]">
                <span className="text-text-muted font-medium">{label}</span>
                <span className="text-text-primary font-semibold">{val}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-text-muted border border-gray-200 rounded-lg hover:border-text-primary transition-colors">Tutup</button>
            <button onClick={onClose} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors">Edit Aset</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddAssetModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[520px] shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h3 className="text-[16px] font-bold text-text-primary">Tambah Aset Baru</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-text-primary transition-colors">
              <X size={15} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Nama Barang <span className="text-accent">*</span></label>
                <input type="text" placeholder="Nama aset..." className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Kategori <span className="text-accent">*</span></label>
                <select className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary bg-white">
                  <option>Pilih...</option>
                  <option>Alat Fitness</option>
                  <option>Perlengkapan</option>
                  <option>Elektronik</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Jumlah <span className="text-accent">*</span></label>
                <input type="number" placeholder="1" className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Satuan</label>
                <select className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary bg-white">
                  <option>unit</option>
                  <option>pcs</option>
                  <option>set</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Kondisi</label>
                <select className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary bg-white">
                  <option value="baik">Baik</option>
                  <option value="servis">Servis</option>
                  <option value="rusak">Rusak</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Lokasi</label>
                <select className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary bg-white">
                  <option>Gudang Utama</option>
                  <option>Dipinjam ke Klien</option>
                  <option>Dalam Servis</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Tanggal Pembelian</label>
              <input type="date" className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Catatan</label>
              <textarea rows={2} placeholder="Keterangan tambahan..." className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-text-muted border border-gray-200 rounded-lg hover:border-text-primary transition-colors">Batal</button>
            <button onClick={onClose} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors">Simpan Aset</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const TABLE_HEADERS = ['Kode Aset', 'Nama Barang', 'Kategori', 'Jumlah', 'Lokasi', 'Kondisi', 'Tgl Beli', 'Actions']

export default function OPSAssetsPage() {
  const [activeTab, setActiveTab]     = useState('Semua')
  const [kondisiFilter, setKondisi]   = useState('')
  const [lokasiFilter, setLokasi]     = useState('')
  const [search, setSearch]           = useState('')
  const [selectedAsset, setSelected]  = useState(null)
  const [showAdd, setShowAdd]         = useState(false)

  const filtered = assetList.filter(a => {
    if (activeTab !== 'Semua' && a.kategori !== activeTab) return false
    if (kondisiFilter && a.kondisi !== kondisiFilter) return false
    if (lokasiFilter && lokasiFilter !== 'Semua Lokasi' && a.lokasi !== lokasiFilter) return false
    if (search && !a.nama.toLowerCase().includes(search.toLowerCase()) && !a.kode.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Barang & Aset</h1>
          <p className="text-[13px] text-text-muted mt-1">Inventaris peralatan fitness dan aset operasional EFM</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors">
          <Plus size={15} />Tambah Aset
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Kondisi Baik</p>
            <p className="text-[22px] font-bold text-text-primary">{assetStats.baik}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
            <Wrench size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Servis / Perbaikan</p>
            <p className="text-[22px] font-bold text-text-primary">{assetStats.servis}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <XCircle size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Rusak</p>
            <p className="text-[22px] font-bold text-text-primary">{assetStats.rusak}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[rgba(30,28,67,0.1)] text-text-primary flex items-center justify-center shrink-0">
            <Package size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Total Aset</p>
            <p className="text-[22px] font-bold text-text-primary">{assetStats.total}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border-[1.5px] border-gray-200 p-1.5 w-fit mb-5">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeTab === tab ? 'bg-text-primary text-white font-semibold' : 'text-text-muted hover:text-text-primary'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 px-5 py-4 flex items-center gap-3 mb-5">
        <select
          value={kondisiFilter}
          onChange={e => setKondisi(e.target.value)}
          className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white"
        >
          <option value="">Semua Kondisi</option>
          <option value="baik">Baik</option>
          <option value="servis">Servis</option>
          <option value="rusak">Rusak</option>
          <option value="dipinjam">Dipinjam</option>
        </select>
        <select
          value={lokasiFilter}
          onChange={e => setLokasi(e.target.value)}
          className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white"
        >
          {LOKASI_LIST.map(l => <option key={l}>{l}</option>)}
        </select>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau kode aset..."
            className="w-full pl-8 pr-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {TABLE_HEADERS.map(h => (
                  <th key={h} className="bg-gray-50 px-4 py-3 text-[11px] font-semibold text-text-muted text-left uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const isLast = i === filtered.length - 1
                const border = isLast ? '' : 'border-b border-gray-100'
                return (
                  <tr key={a.kode} className="hover:bg-gray-50">
                    <td className={`px-4 py-3.5 ${border}`}>
                      <span className="text-[13px] font-bold text-text-primary">{a.kode}</span>
                    </td>
                    <td className={`px-4 py-3.5 text-[13px] text-text-primary ${border}`}>{a.nama}</td>
                    <td className={`px-4 py-3.5 text-[13px] text-text-muted ${border}`}>{a.kategori}</td>
                    <td className={`px-4 py-3.5 text-[13px] text-text-muted ${border}`}>{a.jumlah}</td>
                    <td className={`px-4 py-3.5 text-[13px] text-text-muted ${border}`}>{a.lokasi}</td>
                    <td className={`px-4 py-3.5 ${border}`}><KondisiBadge kondisi={a.kondisi} /></td>
                    <td className={`px-4 py-3.5 text-[13px] text-text-muted ${border}`}>{a.tglBeli}</td>
                    <td className={`px-4 py-3.5 ${border}`}>
                      <button
                        onClick={() => setSelected(a)}
                        className="w-[30px] h-[30px] rounded-lg border-[1.5px] border-gray-200 bg-white inline-flex items-center justify-center text-text-muted hover:border-text-primary hover:text-text-primary transition-colors mr-1.5"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => setSelected(a)}
                        className="w-[30px] h-[30px] rounded-lg border-[1.5px] border-gray-200 bg-white inline-flex items-center justify-center text-text-muted hover:border-text-primary hover:text-text-primary transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[13px] text-text-muted">
                    Tidak ada aset yang sesuai filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <p className="text-[12px] text-text-muted">
            Menampilkan 1–{filtered.length} dari {assetStats.total} aset
          </p>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg border-[1.5px] border-gray-200 flex items-center justify-center text-text-primary text-[13px] opacity-35">‹</button>
            <button className="w-8 h-8 rounded-lg border-[1.5px] bg-text-primary border-text-primary text-white text-[13px] font-medium">1</button>
            <button className="w-8 h-8 rounded-lg border-[1.5px] border-gray-200 flex items-center justify-center text-text-primary text-[13px]">›</button>
          </div>
        </div>
      </div>

      {selectedAsset && <DetailModal asset={selectedAsset} onClose={() => setSelected(null)} />}
      {showAdd && <AddAssetModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
