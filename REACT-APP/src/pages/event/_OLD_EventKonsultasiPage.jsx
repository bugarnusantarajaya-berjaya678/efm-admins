import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, ClipboardList, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react'

const dummyKonsultasi = [
  { id: "KNS-001", leadId: "EL-001", namaKlien: "PT. Karya Maju", tipeKlien: "Corporate", namaEvent: "Fun Run Jakarta 2026", jenisEvent: "Corporate Event", tanggal: "2026-06-05", lokasi: "Senayan, Jakarta", lokasiDetail: "GBK Stadion Utama", jumlahPeserta: 500, peranEFM: "Full EO", programKegiatan: ["Fun Run", "Senam Massal", "Pembicara Kesehatan"], picEFM: "Ahmad Pratama", hasilKonsultasi: "Lanjut", catatan: "Klien minta EFM handle full dari konsep sampai hari H" },
  { id: "KNS-002", leadId: "EL-002", namaKlien: "Keluarga Besar Suharto", tipeKlien: "Private/Individual", namaEvent: "Family Gathering Suharto 2026", jenisEvent: "Family Gathering", tanggal: "2026-06-07", lokasi: "Bogor", lokasiDetail: "Villa Kota Hujan, Jl. Raya Puncak No. 88", jumlahPeserta: 150, peranEFM: "Provider Pengisi Acara", programKegiatan: ["Senam Massal", "Zumba"], picEFM: "Rina Indah", hasilKonsultasi: "Lanjut", catatan: "" },
  { id: "KNS-003", leadId: "EL-003", namaKlien: "SMA Negeri 5 Jakarta", tipeKlien: "Community", namaEvent: "School Health Day", jenisEvent: "School Event", tanggal: "2026-06-10", lokasi: "Jakarta Selatan", lokasiDetail: "Lapangan SMA Negeri 5, Jl. Manggis No. 10", jumlahPeserta: 300, peranEFM: "Supporting Team", programKegiatan: ["Senam Massal", "Fun Run", "Zumba"], picEFM: "Sarah Jenkins", hasilKonsultasi: "Pending", catatan: "Menunggu konfirmasi kepala sekolah" },
  { id: "KNS-004", leadId: "EL-004", namaKlien: "RS Cipto Mangunkusumo", tipeKlien: "Government", namaEvent: "Corporate Health Day", jenisEvent: "Corporate Event", tanggal: "2026-06-12", lokasi: "Jakarta Pusat", lokasiDetail: "Auditorium RSCM Lt. 2", jumlahPeserta: 200, peranEFM: "Provider Pengisi Acara", programKegiatan: ["Senam Massal", "Pembicara Kesehatan"], picEFM: "Marcus Chen", hasilKonsultasi: "Tidak Lanjut", catatan: "Budget tidak sesuai" },
  { id: "KNS-005", leadId: "EL-005", namaKlien: "PT. Digital Nusantara", tipeKlien: "Corporate", namaEvent: "Tech & Wellness Day", jenisEvent: "Corporate Event", tanggal: "2026-06-15", lokasi: "Jakarta Barat", lokasiDetail: "Kantor PT. Digital Nusantara, Jl. S. Parman Kav. 12", jumlahPeserta: 250, peranEFM: "Full EO", programKegiatan: ["Yoga", "Team Building", "Pembicara Kesehatan"], picEFM: "Budi Wijaya", hasilKonsultasi: "Lanjut", catatan: "" },
]

const BULAN_OPTS = ["Semua","Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
const BULAN_IDX  = { Januari:"01",Februari:"02",Maret:"03",April:"04",Mei:"05",Juni:"06",Juli:"07",Agustus:"08",September:"09",Oktober:"10",November:"11",Desember:"12" }
const TAHUN_OPTS = ["Semua","2026","2025","2024"]
const JENIS_EVENT_OPTS = ["Semua","Corporate Event","Government Event","Brand Event","Community Event","School Event","Private Event","Family Gathering","Lainnya"]
const HASIL_OPTS = ["Semua","Lanjut","Pending","Tidak Lanjut"]

const hasilColor = (h) => {
  if (h === "Lanjut")       return "bg-green-100 text-green-700"
  if (h === "Pending")      return "bg-yellow-100 text-yellow-700"
  if (h === "Tidak Lanjut") return "bg-red-100 text-red-700"
  return "bg-gray-100 text-gray-500"
}

const jenisEventColor = (j) => {
  const map = {
    "Corporate Event":  "bg-[#1E1C43] text-white",
    "Government Event": "bg-blue-600 text-white",
    "Community Event":  "bg-purple-100 text-purple-700",
    "School Event":     "bg-teal-100 text-teal-700",
    "Family Gathering": "bg-pink-100 text-pink-700",
    "Brand Event":      "bg-orange-100 text-orange-700",
    "Private Event":    "bg-gray-100 text-gray-700",
  }
  return map[j] || "bg-gray-100 text-gray-600"
}

const selectCls = "border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#1E1C43] bg-white"

export default function EventKonsultasiPage() {
  const navigate = useNavigate()
  const [konsultasiList] = useState(dummyKonsultasi)
  const [filterBulan, setFilterBulan] = useState("Semua")
  const [filterTahun, setFilterTahun] = useState("Semua")
  const [filterJenis, setFilterJenis] = useState("Semua")
  const [filterHasil, setFilterHasil] = useState("Semua")
  const [search, setSearch]           = useState("")

  const filtered = konsultasiList.filter(k => {
    if (filterHasil !== "Semua" && k.hasilKonsultasi !== filterHasil) return false
    if (filterJenis !== "Semua" && k.jenisEvent     !== filterJenis)  return false
    if (filterTahun !== "Semua" && !k.tanggal.startsWith(filterTahun)) return false
    if (filterBulan !== "Semua") {
      const bIdx   = BULAN_IDX[filterBulan]
      const tMonth = k.tanggal.split("-")[1]
      if (tMonth !== bIdx) return false
    }
    if (search && !k.namaKlien.toLowerCase().includes(search.toLowerCase()) && !k.namaEvent.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-6 bg-[#F5F5F7] min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1C43]">Konsultasi Event</h1>
          <p className="text-sm text-gray-500 mt-1">Rekap konsultasi dan kebutuhan event klien EFM</p>
        </div>
        <button onClick={() => navigate("/event/konsultasi/new")}
          className="flex items-center gap-2 bg-[#1E1C43] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2d2b5e] transition">
          <Plus size={16} /> Tambah Konsultasi
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1E1C43]/10">
            <ClipboardList size={18} className="text-[#1E1C43]" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Konsultasi</p>
            <p className="text-2xl font-bold text-[#1E1C43]">{konsultasiList.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-50">
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Lanjut ke Order</p>
            <p className="text-2xl font-bold text-[#1E1C43]">{konsultasiList.filter(k => k.hasilKonsultasi === "Lanjut").length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-50">
            <Clock size={18} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-[#1E1C43]">{konsultasiList.filter(k => k.hasilKonsultasi === "Pending").length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50">
            <XCircle size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Tidak Lanjut</p>
            <p className="text-2xl font-bold text-[#1E1C43]">{konsultasiList.filter(k => k.hasilKonsultasi === "Tidak Lanjut").length}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar — 1 baris */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex gap-3">
          <select value={filterBulan} onChange={e => setFilterBulan(e.target.value)} className={`w-36 ${selectCls}`}>
            {BULAN_OPTS.map(o => <option key={o}>{o}</option>)}
          </select>
          <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)} className={`w-32 ${selectCls}`}>
            {TAHUN_OPTS.map(o => <option key={o}>{o}</option>)}
          </select>
          <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)} className={`flex-1 ${selectCls}`}>
            {JENIS_EVENT_OPTS.map(o => <option key={o}>{o}</option>)}
          </select>
          <select value={filterHasil} onChange={e => setFilterHasil(e.target.value)} className={`w-40 ${selectCls}`}>
            {HASIL_OPTS.map(o => <option key={o}>{o}</option>)}
          </select>
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama klien atau event..."
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
          </div>
          <button onClick={() => { setFilterBulan("Semua"); setFilterTahun("Semua"); setFilterJenis("Semua"); setFilterHasil("Semua"); setSearch("") }}
            className="flex-shrink-0 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition">Reset</button>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 mb-3">{filtered.length} konsultasi</p>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["ID Konsultasi","Nama Klien","Nama Event","Jenis Event","Tanggal","Peran EFM","PIC EFM","Hasil","Aksi"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(k => (
                <tr key={k.id} onClick={() => navigate(`/event/konsultasi/${k.id}`)}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition">
                  <td className="px-4 py-4 text-xs font-mono text-gray-400 whitespace-nowrap">{k.id}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-800">{k.namaKlien}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{k.tipeKlien}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#1E1C43] font-medium max-w-[160px] truncate">{k.namaEvent}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${jenisEventColor(k.jenisEvent)}`}>{k.jenisEvent}</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">{k.tanggal}</td>
                  <td className="px-4 py-4 text-xs text-gray-600 max-w-[120px] truncate">{k.peranEFM}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{k.picEFM}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${hasilColor(k.hasilKonsultasi)}`}>{k.hasilKonsultasi}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    {k.hasilKonsultasi === "Lanjut" && (
                      <button onClick={() => navigate(`/event/orders/new?konsultasiId=${k.id}&leadId=${k.leadId}`)}
                        className="bg-[#E05945] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#c94a38] transition whitespace-nowrap">
                        Buat Order →
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">Tidak ada konsultasi yang cocok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
