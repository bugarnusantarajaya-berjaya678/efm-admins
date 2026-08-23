import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Clock, CheckCircle, ClipboardList, Search, RotateCcw } from 'lucide-react'

const BULAN_OPTS = ['Semua Bulan','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const TAHUN_OPTS = ['Semua Tahun','2026','2025']
const BSHORT = {Januari:'Jan',Februari:'Feb',Maret:'Mar',April:'Apr',Mei:'Mei',Juni:'Jun',Juli:'Jul',Agustus:'Agu',September:'Sep',Oktober:'Okt',November:'Nov',Desember:'Des'}

const HASIL_CFG = {
  lanjut:       { label: 'Lanjut',       cls: 'bg-green-100 text-green-700'  },
  tidak_lanjut: { label: 'Tidak Lanjut', cls: 'bg-red-100 text-red-600'      },
  pending:      { label: 'Pending',      cls: 'bg-yellow-100 text-yellow-700' },
}

const JENIS_CFG = {
  Corporate: 'bg-[#1E1C43] text-white',
  Apartment: 'bg-[#3B82F6] text-white',
}

const SURVEI_INIT = [
  {
    id: 'SVY-26-0001', nama: 'PT. Karya Utama', jenis: 'Corporate', tanggal: '5 Jun 2026', pic: 'Ahmad Pratama',
    lokasi: 'Jl. Sudirman No. 45, Jakarta Selatan', hasil: 'lanjut',
    temuan: 'Fasilitas gym tersedia namun peralatan sudah tua. Ruang cukup untuk 15 orang. Manajemen antusias.',
    rekomendasi: 'Rekomendasikan paket corporate 3x seminggu dengan 2 PIC. Perlu koordinasi jadwal dengan HR.',
    keputusan: 'Setuju lanjut ke tahap penawaran. Nilai estimasi Rp 18jt/bulan.',
  },
  {
    id: 'SVY-26-0002', nama: 'Apartemen Bukit Mas', jenis: 'Apartment', tanggal: '7 Jun 2026', pic: 'Budi Santoso',
    lokasi: 'Jl. Bukit Mas Raya, Jakarta Timur', hasil: 'lanjut',
    temuan: 'Area gym di lantai 3 dengan luas 80m². Penghuni aktif ±200 unit. Permintaan program yoga dan pilates.',
    rekomendasi: 'Paket apartment 5x seminggu, fokus yoga & pilates. Target 30 penghuni aktif bulan pertama.',
    keputusan: 'Lanjut ke quotation. Estimasi kontrak 12 bulan senilai Rp 12jt/bln.',
  },
  {
    id: 'SVY-26-0003', nama: 'CV. Digital Nusantara', jenis: 'Corporate', tanggal: '10 Jun 2026', pic: 'Elena Rodriguez',
    lokasi: 'Jl. TB Simatupang No. 12, Jakarta Selatan', hasil: 'pending',
    temuan: 'Tidak memiliki fasilitas gym sendiri. Berencana sewa studio terdekat. Karyawan ±80 orang.',
    rekomendasi: 'Perlu diskusi lebih lanjut mengenai lokasi. Bisa pertimbangkan mobile fitness program.',
    keputusan: 'Menunggu konfirmasi dari manajemen terkait lokasi pelaksanaan.',
  },
  {
    id: 'SVY-26-0004', nama: 'Apartemen Grand Orchid', jenis: 'Apartment', tanggal: '12 Jun 2026', pic: 'Marcus Chen',
    lokasi: 'Jl. Puri Indah, Jakarta Barat', hasil: 'tidak_lanjut',
    temuan: 'Gym sudah diisi oleh vendor lain dengan kontrak hingga 2027. Tidak ada ruang alternatif.',
    rekomendasi: 'Tidak disarankan untuk dilanjutkan saat ini. Follow up awal 2027.',
    keputusan: 'Ditunda. Masukkan ke pipeline follow-up Januari 2027.',
  },
  {
    id: 'SVY-26-0005', nama: 'PT. Maju Mandiri', jenis: 'Corporate', tanggal: '15 Jun 2026', pic: 'Rina Indah',
    lokasi: 'Jl. Gatot Subroto, Jakarta Pusat', hasil: 'lanjut',
    temuan: 'Ruang meeting bisa difungsikan sebagai ruang fitness. Kapasitas 20 orang. HR sangat kooperatif.',
    rekomendasi: 'Program wellness corporate 3x/minggu. Perlu pengadaan matras dan peralatan ringan.',
    keputusan: 'Lanjut ke quotation. Diskusikan pengadaan alat tambahan dalam proposal.',
  },
  {
    id: 'SVY-26-0006', nama: 'Apartemen Saphire Park', jenis: 'Apartment', tanggal: '18 Jun 2026', pic: 'Ahmad Pratama',
    lokasi: 'Jl. Raya Serpong, Tangerang Selatan', hasil: 'pending',
    temuan: 'Gym baru direnovasi, peralatan lengkap. Manajemen ingin program mulai Agustus 2026.',
    rekomendasi: 'Ideal untuk program premium. Paket 7x/minggu dengan 3 instruktur berbeda.',
    keputusan: 'Menunggu persetujuan anggaran dari pengelola apartemen.',
  },
]

function HasilBadge({ hasil }) {
  const cfg = HASIL_CFG[hasil] || { label: hasil, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {cfg.label}
    </span>
  )
}

export default function B2BSurveyPage() {
  const navigate = useNavigate()
  const [list, setList] = useState(SURVEI_INIT)
  const [fBulan, setFBulan]       = useState('')
  const [fTahun, setFTahun]       = useState('')
  const [fJenis, setFJenis]       = useState('')
  const [fHasil, setFHasil]       = useState('')
  const [search, setSearch]       = useState('')

  const filtered = list.filter(s => {
    if (fBulan && !(s.tanggal ?? '').includes(BSHORT[fBulan] ?? fBulan)) return false
    if (fTahun && !(s.tanggal ?? '').includes(fTahun)) return false
    if (fJenis && s.jenis !== fJenis) return false
    if (fHasil && s.hasil !== fHasil) return false
    if (search && !s.nama.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalSurvei   = list.length
  const menunggu      = list.filter(s => s.hasil === 'pending').length
  const sudahPenawaran = list.filter(s => s.hasil === 'lanjut').length

  return (
    <div className="p-7 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Survei B2B</h1>
          <p className="text-[13px] text-text-muted mt-1">Hasil survei lapangan sebelum penawaran</p>
        </div>
        <button
          onClick={() => navigate('/b2b/survei/new')}
          className="inline-flex items-center gap-2 bg-[#E05945] hover:bg-[#c94a38] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={15} strokeWidth={2.5} /> Tambah Survei
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Survei',           val: totalSurvei,    bg: 'bg-[rgba(30,28,67,0.08)]', iconCls: 'text-text-primary', icon: ClipboardList },
          { label: 'Menunggu Tindak Lanjut', val: menunggu,       bg: 'bg-yellow-50',             iconCls: 'text-yellow-600',   icon: Clock         },
          { label: 'Sudah Penawaran',        val: sudahPenawaran, bg: 'bg-green-50',              iconCls: 'text-green-600',    icon: CheckCircle   },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon size={18} className={s.iconCls} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">{s.label}</p>
                <p className="text-[24px] font-bold text-text-primary">{s.val}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <select value={fBulan} onChange={e => setFBulan(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
            <option value="">Semua Bulan</option>
            {Object.keys(BSHORT).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={fTahun} onChange={e => setFTahun(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
            <option value="">Semua Tahun</option>
            {TAHUN_OPTS.slice(1).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={fJenis} onChange={e => setFJenis(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43] min-w-[130px] cursor-pointer">
            <option value="">Semua Jenis</option>
            <option>Corporate</option><option>Apartment</option>
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
        <div className="overflow-x-auto w-full rounded-xl">
          <table className="w-full border-collapse" style={{ minWidth: '960px' }}>
            <thead>
              <tr>
                {[['No. Survei',150],['Nama',200],['Tipe',110],['Tanggal',110],['PIC Survei',140],['Hasil',110],['Aksi',120]].map(([h,mw]) => (
                  <th key={h} style={{minWidth:mw}} className="bg-gray-50 px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">Tidak ada data survei.</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} onClick={() => navigate('/b2b/survei/' + s.id)} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer">
                  <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{s.id}</td>
                  <td className="text-xs font-medium text-gray-900 px-3 py-2.5 whitespace-nowrap">{s.nama}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${JENIS_CFG[s.jenis] ?? 'bg-gray-100 text-gray-500'}`}>{s.jenis}</span>
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
                            navigate('/b2b/orders/new', {
                              state: {
                                fromSurvei: true,
                                surveiId: s.id,
                                namaPerusahaan: s.nama,
                                tipe: s.jenis,
                                picKlien: s.pic,
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
