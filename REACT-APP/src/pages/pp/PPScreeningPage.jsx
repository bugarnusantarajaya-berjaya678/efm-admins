import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Eye, ChevronRight, X, ClipboardList } from 'lucide-react';

const dummyScreeningData = [
  {
    id: "SCR-26-0001",
    tanggal: "2026-10-15",
    namaKlien: "James Wilson",
    usia: 32,
    jenisKelamin: "Laki-laki",
    beratBadan: 78,
    tinggiBadan: 170,
    bmi: 27.0,
    tujuanFitness: "Penurunan Berat Badan",
    levelAktivitas: "Sedang",
    riwayatPenyakit: "Tidak ada",
    alergi: "Tidak ada",
    obatRutin: "Tidak ada",
    catatanKesehatan: "Tekanan darah normal. Lutut kiri pernah cedera 2022.",
    hasilRekomendasi: "Aman untuk semua jenis latihan. Hindari impact tinggi pada lutut.",
    picScreening: "Sarah Jenkins",
    statusScreening: "Selesai",
    orderId: "PP-26-0013",
  },
  {
    id: "SCR-26-0002",
    tanggal: "2026-10-18",
    namaKlien: "Emily Chen",
    usia: 28,
    jenisKelamin: "Perempuan",
    beratBadan: 55,
    tinggiBadan: 162,
    bmi: 20.9,
    tujuanFitness: "Pembentukan Tubuh",
    levelAktivitas: "Aktif",
    riwayatPenyakit: "Asma ringan",
    alergi: "Debu",
    obatRutin: "Inhaler (jika diperlukan)",
    catatanKesehatan: "Asma terkontrol, tidak mengganggu latihan ringan-sedang.",
    hasilRekomendasi: "Hindari latihan intensitas sangat tinggi. Pastikan inhaler tersedia.",
    picScreening: "Marcus Chen",
    statusScreening: "Selesai",
    orderId: "PP-26-0012",
  },
  {
    id: "SCR-26-0003",
    tanggal: "2026-10-20",
    namaKlien: "Rian Maulana",
    usia: 25,
    jenisKelamin: "Laki-laki",
    beratBadan: 70,
    tinggiBadan: 175,
    bmi: 22.9,
    tujuanFitness: "Peningkatan Stamina",
    levelAktivitas: "Rendah",
    riwayatPenyakit: "Tidak ada",
    alergi: "Tidak ada",
    obatRutin: "Tidak ada",
    catatanKesehatan: "Kondisi umum baik.",
    hasilRekomendasi: "Mulai dengan intensitas rendah, tingkatkan bertahap.",
    picScreening: "Sarah Jenkins",
    statusScreening: "Draft",
    orderId: null,
  },
];

const statusColor = {
  "Selesai": "bg-green-100 text-green-700",
  "Draft": "bg-yellow-100 text-yellow-700",
  "Perlu Review": "bg-orange-100 text-orange-700",
};

const AVATAR_COLORS = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777','#0284C7']
function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
function getAvatarColor(name) {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFFFF
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function StatMini({ label, value, sub, accent }) {
  const bCls = { orange:'border-accent', green:'border-success', red:'border-danger', yellow:'border-warning', blue:'border-blue-400' }[accent] || 'border-border'
  const vCls = { orange:'text-accent', green:'text-success', red:'text-danger', yellow:'text-warning', blue:'text-blue-600' }[accent] || 'text-text-primary'
  return (
    <div className={`bg-bg-surface rounded-xl border-[1.5px] ${bCls} px-4 py-3`}>
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${vCls}`}>{value}</div>
      {sub && <div className="text-[11px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  )
}

export default function PPScreeningPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [screeningList, setScreeningList] = useState(dummyScreeningData);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPic, setFilterPic] = useState("");
  const [filterTujuan, setFilterTujuan] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedScreening, setSelectedScreening] = useState(null);

  const emptyForm = {
    namaKlien: "", usia: "", jenisKelamin: "Laki-laki",
    beratBadan: "", tinggiBadan: "",
    tujuanFitness: "", levelAktivitas: "Sedang",
    riwayatPenyakit: "", alergi: "", obatRutin: "",
    catatanKesehatan: "", hasilRekomendasi: "",
    picScreening: "", statusScreening: "Draft",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const openId = location.state?.openScreeningId;
    if (openId) {
      const scr = dummyScreeningData.find(s => s.id === openId);
      if (scr) setSelectedScreening(scr);
    }
    if (location.state?.openNewForm) {
      setForm(prev => ({ ...prev, namaKlien: location.state.prefillNamaKlien || '' }));
      setShowForm(true);
    }
  }, []);

  const filtered = screeningList.filter(s => {
    const matchSearch = s.namaKlien.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? s.statusScreening === filterStatus : true;
    const matchPic = filterPic ? s.picScreening === filterPic : true;
    const matchTujuan = filterTujuan ? s.tujuanFitness === filterTujuan : true;
    return matchSearch && matchStatus && matchPic && matchTujuan;
  });

  const handleSave = () => {
    const bmi = form.tinggiBadan && form.beratBadan
      ? (parseFloat(form.beratBadan) / Math.pow(parseFloat(form.tinggiBadan)/100, 2)).toFixed(1)
      : null;
    const newId = "SCR-26-" + String(screeningList.length + 1).padStart(4, "0");
    setScreeningList([...screeningList, {
      ...form,
      id: newId,
      tanggal: new Date().toISOString().split('T')[0],
      bmi: parseFloat(bmi),
      orderId: null,
    }]);
    setShowForm(false);
    setForm(emptyForm);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Screening Kesehatan Klien</h1>
          <p className="text-sm text-gray-500 mt-0.5">Form screening opsional untuk tracking kesehatan dan kebugaran klien</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-[#E05945] text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#c94a38] transition">
          <Plus size={16} /> Tambah Screening
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatMini label="TOTAL SCREENING" value={screeningList.length} sub="Semua data" />
        <StatMini label="SELESAI" value={screeningList.filter(s => s.statusScreening === "Selesai").length} sub="Hasil lengkap" accent="green" />
        <StatMini label="DRAFT" value={screeningList.filter(s => s.statusScreening === "Draft").length} sub="Belum selesai" accent="yellow" />
        <StatMini label="TERHUBUNG ORDER" value={screeningList.filter(s => s.orderId).length} sub="Sudah digunakan" accent="blue" />
      </div>

      {/* Filter Bar */}
      <div className="bg-bg-surface border border-border rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
          <option value="">Semua Status</option>
          <option>Selesai</option>
          <option>Draft</option>
          <option>Perlu Review</option>
        </select>
        <select value={filterPic} onChange={e => setFilterPic(e.target.value)}
          className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
          <option value="">Semua PIC</option>
          <option>Sarah Jenkins</option>
          <option>Marcus Chen</option>
          <option>Admin EFM</option>
        </select>
        <select value={filterTujuan} onChange={e => setFilterTujuan(e.target.value)}
          className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
          <option value="">Semua Tujuan</option>
          <option>Penurunan Berat Badan</option>
          <option>Pembentukan Tubuh</option>
          <option>Peningkatan Stamina</option>
          <option>Rehabilitasi &amp; Recovery</option>
          <option>Persiapan Kompetisi</option>
          <option>Kesehatan Umum</option>
          <option>Lainnya</option>
        </select>
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-bg-page border-[1.5px] border-border rounded-lg px-3 py-[7px] focus-within:border-primary focus-within:bg-white transition-colors">
          <Search size={14} className="text-text-muted shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama klien atau nomor screening..."
            className="border-none bg-transparent text-xs outline-none w-full text-text-primary placeholder:text-text-muted" />
        </div>
        <button onClick={() => { setSearch(""); setFilterStatus(""); setFilterPic(""); setFilterTujuan(""); }}
          className="px-3.5 py-[7px] bg-primary hover:bg-primary-2 text-white text-xs font-semibold rounded-lg transition-colors shrink-0">
          Reset
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th style={{minWidth:'155px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">No. Screening</th>
                <th style={{minWidth:'120px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">Tanggal</th>
                <th style={{minWidth:'150px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">Nama Klien</th>
                <th style={{minWidth:'70px'}}  className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">Usia</th>
                <th style={{minWidth:'110px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">BB/TB</th>
                <th style={{minWidth:'70px'}}  className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">BMI</th>
                <th style={{minWidth:'180px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">Tujuan Fitness</th>
                <th style={{minWidth:'120px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">PIC</th>
                <th style={{minWidth:'100px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">Status</th>
                <th style={{minWidth:'130px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">Order</th>
                <th style={{minWidth:'70px'}}  className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} onClick={() => setSelectedScreening(s)}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition">
                  <td className="px-3 py-2.5 text-xs font-semibold text-[#1E1C43] whitespace-nowrap">{s.id}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{s.tanggal}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ background: getAvatarColor(s.namaKlien) }}>
                        {getInitials(s.namaKlien)}
                      </div>
                      <p className="text-xs font-medium text-gray-900 whitespace-nowrap">{s.namaKlien}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{s.usia} th</td>
                  <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{s.beratBadan}kg / {s.tinggiBadan}cm</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      s.bmi < 18.5 ? "bg-blue-100 text-blue-700" :
                      s.bmi < 25 ? "bg-green-100 text-green-700" :
                      s.bmi < 30 ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>{s.bmi}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{s.tujuanFitness}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{s.picScreening}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${statusColor[s.statusScreening] || "bg-gray-100 text-gray-600"}`}>
                      {s.statusScreening}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {s.orderId ? (
                      <button onClick={e => { e.stopPropagation(); navigate('/pp/orders/' + s.orderId); }}
                        className="text-xs text-[#1E1C43] hover:underline font-mono flex items-center gap-1">
                        {s.orderId} <ChevronRight size={10} />
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={e => { e.stopPropagation(); setSelectedScreening(s); }}
                      className="text-gray-400 hover:text-[#1E1C43] transition p-1">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-400">Belum ada data screening</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Menampilkan {filtered.length} dari {screeningList.length} screening</p>
        </div>
      </div>

      {/* Modal Detail Screening */}
      {selectedScreening && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedScreening(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-400">{selectedScreening.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[selectedScreening.statusScreening]}`}>
                    {selectedScreening.statusScreening}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-800">{selectedScreening.namaKlien}</h3>
                <p className="text-xs text-gray-400">{selectedScreening.tanggal} · PIC: {selectedScreening.picScreening}</p>
              </div>
              <button onClick={() => setSelectedScreening(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* Data Fisik */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Data Fisik</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    ["Usia", selectedScreening.usia + " tahun"],
                    ["Jenis Kelamin", selectedScreening.jenisKelamin],
                    ["Berat Badan", selectedScreening.beratBadan + " kg"],
                    ["Tinggi Badan", selectedScreening.tinggiBadan + " cm"],
                  ].map(([l,v]) => (
                    <div key={l} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">{l}</p>
                      <p className="text-sm font-bold text-gray-800">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">BMI</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${
                      selectedScreening.bmi < 18.5 ? "text-blue-600" :
                      selectedScreening.bmi < 25 ? "text-green-600" :
                      selectedScreening.bmi < 30 ? "text-yellow-600" : "text-red-600"
                    }`}>{selectedScreening.bmi}</span>
                    <span className="text-xs text-gray-400">
                      {selectedScreening.bmi < 18.5 ? "Kurus" :
                       selectedScreening.bmi < 25 ? "Normal" :
                       selectedScreening.bmi < 30 ? "Overweight" : "Obesitas"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tujuan & Aktivitas */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Tujuan & Aktivitas</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Tujuan Fitness</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedScreening.tujuanFitness}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Level Aktivitas</p>
                    <p className="text-sm font-semibold text-gray-800">{selectedScreening.levelAktivitas}</p>
                  </div>
                </div>
              </div>

              {/* Riwayat Kesehatan */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Riwayat Kesehatan</p>
                <div className="space-y-2">
                  {[
                    ["Riwayat Penyakit", selectedScreening.riwayatPenyakit],
                    ["Alergi", selectedScreening.alergi],
                    ["Obat Rutin", selectedScreening.obatRutin],
                  ].map(([l,v]) => (
                    <div key={l} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{l}</p>
                      <p className="text-sm text-gray-800">{v || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catatan & Rekomendasi */}
              {selectedScreening.catatanKesehatan && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-yellow-700 mb-1">Catatan Kesehatan</p>
                  <p className="text-sm text-gray-700">{selectedScreening.catatanKesehatan}</p>
                </div>
              )}
              {selectedScreening.hasilRekomendasi && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-green-700 mb-1">Hasil & Rekomendasi</p>
                  <p className="text-sm text-gray-700">{selectedScreening.hasilRekomendasi}</p>
                </div>
              )}

              {/* Link Order */}
              {selectedScreening.orderId && (
                <div className="bg-[#1E1C43]/5 border border-[#1E1C43]/10 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#1E1C43] mb-0.5">Terhubung dengan Order</p>
                    <p className="text-sm font-mono text-[#1E1C43]">{selectedScreening.orderId}</p>
                  </div>
                  <button onClick={() => { setSelectedScreening(null); navigate('/pp/orders/' + selectedScreening.orderId); }}
                    className="text-xs bg-[#1E1C43] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#2d2b5e] transition">
                    Lihat Order <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setSelectedScreening(null)}
                className="w-full border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah Screening */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <ClipboardList size={15} className="text-[#E05945]" /> Form Screening Kesehatan
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Opsional — untuk tracking kesehatan klien Private Training</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-5 overflow-y-auto flex-1">

              {/* Identitas Klien */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Identitas Klien</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nama Klien *</label>
                    <input type="text" value={form.namaKlien} onChange={e => setForm({...form, namaKlien: e.target.value})}
                      placeholder="Nama klien yang di-screening"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Usia</label>
                      <input type="number" value={form.usia} onChange={e => setForm({...form, usia: e.target.value})}
                        placeholder="Tahun"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Jenis Kelamin</label>
                      <select value={form.jenisKelamin} onChange={e => setForm({...form, jenisKelamin: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                        <option>Laki-laki</option>
                        <option>Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">PIC Screening</label>
                      <input type="text" value={form.picScreening} onChange={e => setForm({...form, picScreening: e.target.value})}
                        placeholder="Nama PIC"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Fisik */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Data Fisik</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Berat Badan (kg)</label>
                    <input type="number" value={form.beratBadan} onChange={e => setForm({...form, beratBadan: e.target.value})}
                      placeholder="kg"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tinggi Badan (cm)</label>
                    <input type="number" value={form.tinggiBadan} onChange={e => setForm({...form, tinggiBadan: e.target.value})}
                      placeholder="cm"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
                  </div>
                </div>
                {form.beratBadan && form.tinggiBadan && (
                  <div className="mt-2 bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500">BMI Auto-hitung:</span>
                    <span className="text-sm font-bold text-[#1E1C43]">
                      {(parseFloat(form.beratBadan) / Math.pow(parseFloat(form.tinggiBadan)/100, 2)).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Tujuan & Aktivitas */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Tujuan & Aktivitas</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tujuan Fitness</label>
                    <select value={form.tujuanFitness} onChange={e => setForm({...form, tujuanFitness: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                      <option value="">— Pilih —</option>
                      <option>Penurunan Berat Badan</option>
                      <option>Pembentukan Tubuh</option>
                      <option>Peningkatan Stamina</option>
                      <option>Rehabilitasi & Recovery</option>
                      <option>Persiapan Kompetisi</option>
                      <option>Kesehatan Umum</option>
                      <option>Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Level Aktivitas Saat Ini</label>
                    <select value={form.levelAktivitas} onChange={e => setForm({...form, levelAktivitas: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                      <option>Sangat Rendah (tidak pernah olahraga)</option>
                      <option>Rendah (jarang olahraga)</option>
                      <option>Sedang (1-2x seminggu)</option>
                      <option>Aktif (3-4x seminggu)</option>
                      <option>Sangat Aktif (5+ seminggu)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Riwayat Kesehatan */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Riwayat Kesehatan</p>
                <div className="space-y-3">
                  {[
                    ["riwayatPenyakit", "Riwayat Penyakit", "Diabetes, hipertensi, cedera, operasi, dll. Tulis 'Tidak ada' jika tidak ada"],
                    ["alergi", "Alergi", "Alergi makanan, obat, atau lingkungan. Tulis 'Tidak ada' jika tidak ada"],
                    ["obatRutin", "Obat Rutin", "Obat yang dikonsumsi rutin. Tulis 'Tidak ada' jika tidak ada"],
                  ].map(([key, label, placeholder]) => (
                    <div key={key}>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{label}</label>
                      <textarea value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                        placeholder={placeholder} rows={2}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Catatan & Rekomendasi */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Catatan & Rekomendasi Trainer</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Catatan Kesehatan Tambahan</label>
                    <textarea value={form.catatanKesehatan} onChange={e => setForm({...form, catatanKesehatan: e.target.value})}
                      placeholder="Catatan khusus dari trainer atau hasil observasi awal..." rows={2}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Hasil & Rekomendasi Program</label>
                    <textarea value={form.hasilRekomendasi} onChange={e => setForm({...form, hasilRekomendasi: e.target.value})}
                      placeholder="Rekomendasi jenis latihan, intensitas, pantangan, dll..." rows={2}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status Screening</label>
                    <select value={form.statusScreening} onChange={e => setForm({...form, statusScreening: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                      <option>Draft</option>
                      <option>Selesai</option>
                      <option>Perlu Review</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition">
                Batal
              </button>
              <button onClick={handleSave} disabled={!form.namaKlien}
                className="flex-1 bg-[#1E1C43] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#2d2b5e] transition disabled:opacity-50">
                Simpan Screening
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
