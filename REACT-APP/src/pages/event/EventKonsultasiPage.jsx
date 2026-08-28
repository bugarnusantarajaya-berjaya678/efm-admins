import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Clock, CheckCircle, ClipboardList, Search, RotateCcw } from 'lucide-react'
import { initKonsultasi, getStoredKonsultasi, KONSULTASI_INIT } from '../../data/eventKonsultasiStore'

const BSHORT = {Januari:'Jan',Februari:'Feb',Maret:'Mar',April:'Apr',Mei:'Mei',Juni:'Jun',Juli:'Jul',Agustus:'Agu',September:'Sep',Oktober:'Okt',November:'Nov',Desember:'Des'}

const HASIL_CFG = {
  lanjut:       { label: 'Lanjut',       cls: 'bg-green-100 text-green-700'  },
  tidak_lanjut: { label: 'Tidak Lanjut', cls: 'bg-red-100 text-red-600'      },
  pending:      { label: 'Pending',      cls: 'bg-yellow-100 text-yellow-700' },
}

const JENIS_CFG = {
  Corporate:  'bg-[#1E1C43] text-white',
  Brand:      'bg-purple-600 text-white',
  Community:  'bg-blue-500 text-white',
  Government: 'bg-green-600 text-white',
  Foundation: 'bg-orange-500 text-white',
  Private:    'bg-pink-500 text-white',
  Individual: 'bg-gray-400 text-white',
}

function HasilBadge({ hasil }) {
  const cfg = HASIL_CFG[hasil] || { label: hasil, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {cfg.label}
    </span>
  )
}

export default function EventKonsultasiPage() {
  const navigate = useNavigate()
  const [list] = useState(() => { initKonsultasi(KONSULTASI_INIT); return getStoredKonsultasi() })
  const [fBulan, setFBulan] = useState('')
  const [fTahun, setFTahun] = useState('')
  const [fJenis, setFJenis] = useState('')
  const [fHasil, setFHasil] = useState('')
  const [search, setSearch] = useState('')

  const filtered = list.filter(s => {
    if (fBulan && !(s.tanggal ?? '').includes(BSHORT[fBulan] ?? fBulan)) return false
    if (fTahun && !(s.tanggal ?? '').includes(fTahun)) return false
    if (fJenis && s.jenis !== fJenis) return false
    if (fHasil && s.hasil !== fHasil) return false
    if (search && !s.nama.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalKonsultasi = list.length
  const menunggu        = list.filter(s => s.hasil === 'pending').length
  const sudahPenawaran  = list.filter(s => s.hasil === 'lanjut').length
  const tidakLanjut     = list.filter(s => s.hasil === 'tidak_lanjut').length

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Konsultasi Event</h1>
          <p className="text-[13px] text-text-muted mt-1">Riwayat konsultasi & penawaran event klien</p>
        </div>
        <button
          onClick={() => navigate('/event/konsultasi/new')}
          className="inline-flex items-center gap-2 bg-[#E05945] hover:bg-[#c94a38] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} strokeWidth={2.5} /> Tambah Konsultasi
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Konsultasi',       val: totalKonsultasi, bg: 'bg-[rgba(30,28,67,0.08)]', iconCls: 'text-text-primary', icon: ClipboardList },
          { label: 'Menunggu Tindak Lanjut', val: menunggu,        bg: 'bg-yellow-50',             iconCls: 'text-yellow-600',   icon: Clock         },
          { label: 'Sudah Penawaran',        val: sudahPenawaran,  bg: 'bg-green-50',              iconCls: 'text-green-600',    icon: CheckCircle   },
          { label: 'Tidak Lanjut',           val: tidakLanjut,     bg: 'bg-red-50',                iconCls: 'text-red-600',      icon: ClipboardList },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon size={18} className={s.iconCls} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">{s.label}</p>
                <p className="text-xl font-bold text-[#1E1C43]">{s.val}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter — flat, no shadow wrapper */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={fBulan} onChange={e => setFBulan(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
          <option value="">Semua Bulan</option>
          {Object.keys(BSHORT).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={fTahun} onChange={e => setFTahun(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
          <option value="">Semua Tahun</option>
          <option>2026</option>
          <option>2025</option>
        </select>
        <select value={fJenis} onChange={e => setFJenis(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
          <option value="">Semua Jenis</option>
          <option>Corporate</option><option>Foundation</option>
          <option>Government</option><option>Brand</option>
          <option>Community</option><option>Private</option><option>Individual</option>
        </select>
        <select value={fHasil} onChange={e => setFHasil(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
          <option value="">Semua Hasil</option>
          <option value="lanjut">Lanjut</option>
          <option value="tidak_lanjut">Tidak Lanjut</option>
          <option value="pending">Pending</option>
        </select>
        <div className="flex items-center gap-3 ml-auto">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama perusahaan..."
              className="pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[220px]" />
          </div>
          <button onClick={() => { setFBulan(''); setFTahun(''); setFJenis(''); setFHasil(''); setSearch('') }}
            className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs px-3 py-2 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors">
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
        <div className="overflow-x-auto w-full rounded-xl">
          <table className="w-full border-collapse" style={{ minWidth: '900px' }}>
            <thead>
              <tr>
                {['ID', 'Nama Klien', 'Jenis Klien', 'Nama Event', 'Jenis Event', 'Peran EFM', 'Tanggal', 'PIC', 'Hasil', 'Aksi'].map(h => (
                  <th key={h} className="bg-gray-50 px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-gray-400">Tidak ada data konsultasi.</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} onClick={() => navigate('/event/konsultasi/' + s.id)} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer">
                  <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{s.id}</td>
                  <td className="text-xs font-medium text-gray-900 px-3 py-2.5 whitespace-nowrap">{s.nama}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${JENIS_CFG[s.jenis] ?? 'bg-gray-100 text-gray-500'}`}>{s.jenis}</span>
                  </td>
                  <td className="text-xs font-medium text-gray-800 px-3 py-2.5">{s.namaEvent}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{s.jenisEvent}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1E1C43]/10 text-[#1E1C43]">{s.peranEFM}</span>
                  </td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{s.tanggal}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{s.pic}</td>
                  <td className="px-3 py-2.5"><HasilBadge hasil={s.hasil} /></td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {s.hasil === 'lanjut' && (
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            navigate('/event/orders/new', {
                              state: {
                                fromKonsultasi: true,
                                konsultasiId: s.id,
                                namaKlien: s.nama,
                                jenisKlien: s.jenis,
                                namaEvent: s.namaEvent,
                                jenisEvent: s.jenisEvent,
                                rekomendasi: s.rekomendasi || ''
                              }
                            })
                          }}
                          className="inline-flex items-center gap-1.5 bg-[#E05945] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[#c94a38] whitespace-nowrap"
                        >
                          📋 Buat Order
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
