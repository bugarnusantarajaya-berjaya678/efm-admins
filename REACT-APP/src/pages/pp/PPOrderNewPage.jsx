import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Plus, Trash2, CheckCircle, XCircle, ChevronDown } from 'lucide-react';

const dummyPPLeads = [
  { id: "L-1001", nama: "James Wilson", noHP: "081234567890", email: "james@email.com", sumber: "Website", programDiminati: "12 Sesi - Pro", statusPipeline: "Closed Won", namaPendaftar: "James Wilson", hpPendaftar: "081234567890", emailPendaftar: "james@email.com" },
  { id: "L-1002", nama: "Emily Chen", noHP: "082345678901", email: "emily@email.com", sumber: "Meta Ads", programDiminati: "4 Sesi - Starter", statusPipeline: "Closed Won", namaPendaftar: "Emily Chen", hpPendaftar: "082345678901", emailPendaftar: "emily@email.com" },
  { id: "L-1003", nama: "Budi Santoso", noHP: "085678901234", email: "budi@email.com", sumber: "Walk-in", programDiminati: "12 Sesi - Pro", statusPipeline: "Closed Won", namaPendaftar: "Budi Santoso", hpPendaftar: "085678901234", emailPendaftar: "budi@email.com" },
  { id: "L-1005", nama: "Rian Maulana", noHP: "081298765432", email: "rian@email.com", sumber: "Meta Ads", programDiminati: "Fatloss & Bodyshape", statusPipeline: "Follow Up", namaPendaftar: "Rian Maulana", hpPendaftar: "081298765432", emailPendaftar: "rian@email.com" },
  { id: "L-1006", nama: "Siti Rahayu", noHP: "082211334455", email: "siti@email.com", sumber: "WhatsApp", programDiminati: "Yoga", statusPipeline: "New", namaPendaftar: "Siti Rahayu", hpPendaftar: "082211334455", emailPendaftar: "siti@email.com" },
];

const dummyPaketDB = [
  {
    id: 'PRG-PP-001',
    namaProgram: 'Private Training',
    namaPaket: '12 Sesi - Pro',
    totalSesi: 12,
    frekuensi: '3x seminggu',
    masaBerlaku: '60 hari',
    hargaPaket: 1600000,
    pic: { nama: 'Sarah Jenkins', spesialisasi: 'Personal Trainer', rate: 'Rp 125.000/sesi' },
    keterangan: 'Include program latihan, evaluasi mingguan'
  },
  {
    id: 'PRG-PP-002',
    namaProgram: 'Private Training',
    namaPaket: '8 Sesi - Base',
    totalSesi: 8,
    frekuensi: '2x seminggu',
    masaBerlaku: '45 hari',
    hargaPaket: 1000000,
    pic: { nama: 'Marcus Chen', spesialisasi: 'Personal Trainer', rate: 'Rp 120.000/sesi' },
    keterangan: 'Paket starter untuk pemula'
  },
  {
    id: 'PRG-PP-003',
    namaProgram: 'Tennis',
    namaPaket: '4 Sesi - Starter',
    totalSesi: 4,
    frekuensi: '1x seminggu',
    masaBerlaku: '30 hari',
    hargaPaket: 600000,
    pic: { nama: 'Elena Rodriguez', spesialisasi: 'Tennis Coach', rate: 'Rp 150.000/sesi' },
    keterangan: 'Include raket dan ballboy'
  },
  {
    id: 'PRG-PP-004',
    namaProgram: 'Tennis',
    namaPaket: '8 Sesi - Pro',
    totalSesi: 8,
    frekuensi: '2x seminggu',
    masaBerlaku: '45 hari',
    hargaPaket: 1400000,
    pic: { nama: 'Budi Wijaya', spesialisasi: 'Tennis Coach', rate: 'Rp 160.000/sesi' },
    keterangan: 'Include raket, ballboy, dan video analisis'
  },
  {
    id: 'PRG-PP-005',
    namaProgram: 'Yoga',
    namaPaket: 'Monthly - 8 Sesi',
    totalSesi: 8,
    frekuensi: '2x seminggu',
    masaBerlaku: '30 hari',
    hargaPaket: 900000,
    pic: { nama: 'Sari Dewi', spesialisasi: 'Yoga Instructor', rate: 'Rp 110.000/sesi' },
    keterangan: 'Include matras yoga'
  },
];

const hariOptions = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

function getPicInitials(nama) {
  return nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function PPOrderNewPage() {
  const navigate = useNavigate();

  // Data Pendaftar — combobox search dari leads
  const [pendaftarSearch, setPendaftarSearch] = useState('');
  const [pendaftarDropdownOpen, setPendaftarDropdownOpen] = useState(false);

  // Section 1: Data Pendaftar
  const [pendaftar, setPendaftar] = useState({
    nama: '', noHP: '', email: '', hubunganDenganKlien: 'Diri Sendiri'
  });

  // Section 2: Data Klien Latihan
  const [klienLatihan, setKlienLatihan] = useState({
    nama: '', noHP: '', usia: '', jenisKelamin: 'Laki-laki'
  });
  const [samadenganPendaftar, setSamadenganPendaftar] = useState(false);

  // Section 3: Program & Paket
  const [selectedPaket, setSelectedPaket] = useState(null);
  const [programSearch, setProgramSearch] = useState('');
  const [programDropdownOpen, setProgramDropdownOpen] = useState(false);

  // Section 4: Jadwal Latihan
  const [jadwal, setJadwal] = useState({
    hariLatihan: [],
    jamLatihan: '',
    tanggalMulai: '',
  });

  // Section 5: Lokasi Latihan
  const [lokasiLatihan, setLokasiLatihan] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [koordinat, setKoordinat] = useState(null); // { lat, lng } | null
  const [validasiError, setValidasiError] = useState(null);

  // Section 6: Rincian Layanan / Invoice Items
  const [items, setItems] = useState([]);

  // Section 7: Catatan
  const [catatanOrder, setCatatanOrder] = useState('');

  // ── Handlers ──────────────────────────────────────
  const handleSelectLead = (lead) => {
    setPendaftar({
      nama: lead.namaPendaftar || lead.nama,
      noHP: lead.hpPendaftar || lead.noHP,
      email: lead.emailPendaftar || lead.email,
      hubunganDenganKlien: 'Diri Sendiri'
    });
    setKlienLatihan(prev => ({ ...prev, nama: lead.nama, noHP: lead.noHP }));
  };

  const handleSelectPaket = (paket) => {
    setSelectedPaket(paket);
    setItems([{
      id: Date.now(),
      namaItem: paket.namaProgram + ' ' + paket.namaPaket,
      satuan: 'Paket',
      jumlah: 1,
      harga: paket.hargaPaket,
      total: paket.hargaPaket,
      isFromProgram: true,
    }]);
  };

  const handleToggleHari = (hari) => {
    setJadwal(prev => ({
      ...prev,
      hariLatihan: prev.hariLatihan.includes(hari)
        ? prev.hariLatihan.filter(h => h !== hari)
        : [...prev.hariLatihan, hari]
    }));
  };

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), namaItem: '', satuan: 'Paket', jumlah: 1, harga: 0, total: 0, isFromProgram: false }]);
  };

  const handleUpdateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'jumlah' || field === 'harga') {
        updated.total = (parseFloat(updated.jumlah) || 0) * (parseFloat(updated.harga) || 0);
      }
      return updated;
    }));
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const parseGoogleMapsLink = (url) => {
    // Coba beberapa pattern umum:
    // Pattern 1: @lat,long (format paling umum, dari address bar)
    // Pattern 2: ?q=lat,long atau &q=lat,long
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng, success: true };
        }
      }
    }

    // Deteksi short link yang tidak bisa diparse
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      return {
        success: false,
        error: 'Link short URL tidak didukung. Buka link tersebut di browser, lalu copy link lengkap dari address bar.'
      };
    }

    return {
      success: false,
      error: 'Format link tidak dikenali. Pastikan link dari Google Maps (klik Share > Copy Link, atau copy dari address bar).'
    };
  };

  const handleValidasiKoordinat = () => {
    const result = parseGoogleMapsLink(mapsLink);
    if (result.success) {
      setKoordinat({ lat: result.lat, lng: result.lng });
      setValidasiError(null);
    } else {
      setKoordinat(null);
      setValidasiError(result.error);
    }
  };

  const calcTanggalBerakhir = () => {
    if (!jadwal.tanggalMulai || !selectedPaket) return null;
    const hari = parseInt(selectedPaket.masaBerlaku);
    if (isNaN(hari)) return null;
    const d = new Date(jadwal.tanggalMulai);
    d.setDate(d.getDate() + hari);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const totalNilai = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const formatRp = (val) => 'Rp ' + (val || 0).toLocaleString('id-ID');

  const handleSimpanOrder = () => {
    navigate('/pp/orders/PP-8042');
  };

  const filteredLeads = pendaftarSearch
    ? dummyPPLeads.filter(l =>
        l.nama.toLowerCase().includes(pendaftarSearch.toLowerCase()) ||
        l.noHP.includes(pendaftarSearch) ||
        l.id.toLowerCase().includes(pendaftarSearch.toLowerCase())
      )
    : dummyPPLeads;

  const tanggalBerakhir = calcTanggalBerakhir();

  const filteredPaket = programSearch
    ? dummyPaketDB.filter(p =>
        p.id.toLowerCase().includes(programSearch.toLowerCase()) ||
        p.namaPaket.toLowerCase().includes(programSearch.toLowerCase()) ||
        p.namaProgram.toLowerCase().includes(programSearch.toLowerCase())
      )
    : dummyPaketDB;

  // ── Render ──────────────────────────────────────
  return (
    <div className="p-6 bg-[#F5F5F7] min-h-screen pb-24">

      {/* Breadcrumb & Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <button onClick={() => navigate('/pp/orders')} className="hover:text-[#1E1C43] transition">Private Program</button>
            <ChevronRight size={12} />
            <button onClick={() => navigate('/pp/orders')} className="hover:text-[#1E1C43] transition">Orders</button>
            <ChevronRight size={12} />
            <span className="text-gray-600 font-medium">Order Baru</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1E1C43]">Order Baru</h1>
          <p className="text-sm text-gray-500 mt-0.5">Buat order Private Program baru</p>
        </div>
        <button onClick={() => navigate('/pp/orders')}
          className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition">
          <ArrowLeft size={15} /> Kembali ke Orders
        </button>
      </div>

      <div className="space-y-4">

        {/* ── SECTION 1: Data Pendaftar ── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#E05945] rounded-full" />
            <h3 className="text-sm font-bold text-gray-800">Data Pendaftar</h3>
            <span className="text-xs text-gray-400">— orang yang mendaftar / membayar</span>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nama Pendaftar *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={pendaftarDropdownOpen ? pendaftarSearch : pendaftar.nama}
                    onChange={e => {
                      setPendaftarSearch(e.target.value)
                      setPendaftar({ ...pendaftar, nama: e.target.value })
                      setPendaftarDropdownOpen(true)
                    }}
                    onFocus={() => { setPendaftarSearch(''); setPendaftarDropdownOpen(true) }}
                    onBlur={() => setTimeout(() => {
                      setPendaftarDropdownOpen(false)
                      setPendaftarSearch('')
                    }, 150)}
                    placeholder="Cari dari leads, atau ketik nama manual..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] pr-9"
                  />
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  {pendaftarDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-52 overflow-y-auto">
                      {filteredLeads.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">Tidak ada leads ditemukan</p>
                      ) : (
                        filteredLeads.map(lead => (
                          <button
                            key={lead.id}
                            type="button"
                            onMouseDown={() => {
                              handleSelectLead(lead)
                              setPendaftarSearch(lead.namaPendaftar || lead.nama)
                              setPendaftarDropdownOpen(false)
                            }}
                            className="w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-blue-50 transition-colors flex items-center gap-2"
                          >
                            <span className="text-[10px] font-semibold text-[#1E1C43] bg-[#1E1C43]/10 px-1.5 py-0.5 rounded shrink-0">{lead.id}</span>
                            <span className="text-sm font-medium text-gray-800 flex-1">{lead.nama}</span>
                            <span className="text-xs text-gray-400 shrink-0">{lead.noHP}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${lead.statusPipeline === 'Closed Won' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {lead.statusPipeline}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Pilih dari data leads untuk auto-isi, atau ketik nama baru</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">No. HP / WhatsApp *</label>
                <input type="text" value={pendaftar.noHP}
                  onChange={e => setPendaftar({ ...pendaftar, noHP: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email</label>
                <input type="email" value={pendaftar.email}
                  onChange={e => setPendaftar({ ...pendaftar, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Hubungan dengan Klien</label>
                <select value={pendaftar.hubunganDenganKlien}
                  onChange={e => setPendaftar({ ...pendaftar, hubunganDenganKlien: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                  <option>Diri Sendiri</option>
                  <option>Orang Tua</option>
                  <option>Pasangan</option>
                  <option>Anak</option>
                  <option>Saudara</option>
                  <option>Lainnya</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: Data Klien Latihan ── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#E05945] rounded-full" />
              <h3 className="text-sm font-bold text-gray-800">Data Klien Latihan</h3>
              <span className="text-xs text-gray-400">— orang yang actual latihan</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={samadenganPendaftar}
                onChange={e => {
                  setSamadenganPendaftar(e.target.checked);
                  if (e.target.checked) {
                    setKlienLatihan(prev => ({
                      ...prev,
                      nama: pendaftar.nama,
                      noHP: pendaftar.noHP,
                    }));
                  }
                }}
                className="w-4 h-4 accent-[#1E1C43]" />
              <span className="text-xs text-gray-600">Sama dengan data pendaftar</span>
            </label>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nama Klien Latihan *</label>
                <input type="text" value={klienLatihan.nama}
                  onChange={e => setKlienLatihan({ ...klienLatihan, nama: e.target.value })}
                  disabled={samadenganPendaftar}
                  placeholder="Nama lengkap klien yang latihan"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] disabled:bg-gray-50 disabled:text-gray-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">No. HP Klien</label>
                <input type="text" value={klienLatihan.noHP}
                  onChange={e => setKlienLatihan({ ...klienLatihan, noHP: e.target.value })}
                  disabled={samadenganPendaftar}
                  placeholder="08xxxxxxxxxx"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] disabled:bg-gray-50 disabled:text-gray-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Usia</label>
                <div className="relative">
                  <input type="number" value={klienLatihan.usia}
                    onChange={e => setKlienLatihan({ ...klienLatihan, usia: e.target.value })}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] pr-16" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">tahun</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Jenis Kelamin</label>
                <select value={klienLatihan.jenisKelamin}
                  onChange={e => setKlienLatihan({ ...klienLatihan, jenisKelamin: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                  <option>Laki-laki</option>
                  <option>Perempuan</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: Program & Paket ── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#E05945] rounded-full" />
            <h3 className="text-sm font-bold text-gray-800">Program & Rincian Biaya</h3>
          </div>

          {selectedPaket === null ? (
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Pilih Program & Paket</label>
              <div className="relative">
                <input
                  type="text"
                  value={programSearch}
                  onChange={e => { setProgramSearch(e.target.value); setProgramDropdownOpen(true) }}
                  onFocus={() => { setProgramSearch(''); setProgramDropdownOpen(true) }}
                  onBlur={() => setTimeout(() => setProgramDropdownOpen(false), 150)}
                  placeholder="Ketik ID program, nama paket, atau jenis latihan..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] pr-9"
                />
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                {programDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-56 overflow-y-auto">
                    {filteredPaket.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">Tidak ada paket ditemukan</p>
                    ) : (
                      filteredPaket.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onMouseDown={() => {
                            handleSelectPaket(p)
                            setProgramDropdownOpen(false)
                            setProgramSearch('')
                          }}
                          className="w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-blue-50 transition-colors flex items-center gap-2"
                        >
                          <span className="text-[10px] font-semibold text-[#1E1C43] bg-[#1E1C43]/10 px-1.5 py-0.5 rounded shrink-0">{p.id}</span>
                          <span className="text-sm text-gray-500 shrink-0">{p.namaProgram}</span>
                          <span className="text-gray-300 shrink-0">—</span>
                          <span className="text-sm font-medium text-gray-700 flex-1">{p.namaPaket}</span>
                          <span className="text-sm font-semibold text-[#E05945] shrink-0">{formatRp(p.hargaPaket)}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Klik kolom di atas untuk melihat semua paket, atau ketik untuk menyaring</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl p-4 relative">
              {/* Tombol Ganti Paket */}
              <button
                onClick={() => { setSelectedPaket(null); setItems([]); }}
                className="absolute top-4 right-4 text-xs border border-gray-200 text-gray-500 rounded-lg px-3 py-1 hover:bg-gray-50 transition">
                Ganti Paket
              </button>

              {/* Row 1: Identitas paket */}
              <div className="mb-3 pr-24">
                <p className="text-xs text-gray-400 font-mono mb-0.5">{selectedPaket.id}</p>
                <p className="text-base font-bold text-[#1E1C43]">{selectedPaket.namaProgram}</p>
                <p className="text-sm text-gray-600">{selectedPaket.namaPaket}</p>
              </div>

              {/* Row 2: Grid 4 kolom detail paket */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  ["Total Sesi", selectedPaket.totalSesi + " sesi"],
                  ["Frekuensi", selectedPaket.frekuensi],
                  ["Masa Berlaku", selectedPaket.masaBerlaku],
                  ["Harga Paket", formatRp(selectedPaket.hargaPaket)],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>

              {/* Row 3: PIC Pelatih */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 mt-2 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#1E1C43] text-white text-sm font-semibold flex items-center justify-center shrink-0">
                  {getPicInitials(selectedPaket.pic.nama)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{selectedPaket.pic.nama}</p>
                  <p className="text-xs text-gray-500">{selectedPaket.pic.spesialisasi}</p>
                </div>
                <p className="text-xs text-[#E05945] font-medium shrink-0">{selectedPaket.pic.rate}</p>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">
                  Auto-assign dari paket
                </span>
              </div>

              {/* Row 4: Keterangan */}
              <p className="text-xs text-gray-500 italic">{selectedPaket.keterangan}</p>
            </div>
          )}

          {/* Divider */}
          <div className="my-5 border-t border-gray-100" />

          {/* Rincian Layanan */}
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Rincian Layanan</h4>
            <span className="text-xs text-gray-400">— akan jadi dasar invoice</span>
          </div>

          {items.length > 0 ? (
            <div className="space-y-2 mb-3">
              {items.map((item) => (
                <div key={item.id} className={`border rounded-xl p-3 ${item.isFromProgram ? 'border-[#1E1C43]/20 bg-[#1E1C43]/5' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {item.isFromProgram && (
                      <span className="text-xs bg-[#1E1C43] text-white px-2 py-0.5 rounded-full">Dari Program</span>
                    )}
                    {!item.isFromProgram && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Biaya Tambahan</span>
                    )}
                    <button onClick={() => handleRemoveItem(item.id)}
                      className="ml-auto text-gray-300 hover:text-red-500 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-2">
                      <label className="text-xs text-gray-400 mb-1 block">Nama Item</label>
                      <input type="text" value={item.namaItem}
                        onChange={e => handleUpdateItem(item.id, 'namaItem', e.target.value)}
                        disabled={item.isFromProgram}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-[#1E1C43] disabled:bg-gray-50 disabled:text-gray-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Jumlah</label>
                      <input type="number" value={item.jumlah}
                        onChange={e => handleUpdateItem(item.id, 'jumlah', e.target.value)}
                        disabled={item.isFromProgram}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-[#1E1C43] disabled:bg-gray-50" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Harga (Rp)</label>
                      <input type="number" value={item.harga}
                        onChange={e => handleUpdateItem(item.id, 'harga', e.target.value)}
                        disabled={item.isFromProgram}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-[#1E1C43] disabled:bg-gray-50" />
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-xs text-gray-400">Total: </span>
                    <span className="text-sm font-bold text-[#1E1C43]">{formatRp(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 text-center mb-3">
              <p className="text-sm text-gray-400">Pilih program terlebih dahulu atau tambah item manual</p>
            </div>
          )}

          <button onClick={handleAddItem}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-xs text-gray-400 hover:border-[#1E1C43] hover:text-[#1E1C43] transition flex items-center justify-center gap-2">
            <Plus size={14} /> Tambah Biaya Lain (Transport, Sewa Alat, dll)
          </button>

          {items.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-semibold">Total Nilai Order</span>
                <span className="text-xl font-bold text-[#1E1C43]">{formatRp(totalNilai)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── SECTION 4: Jadwal Latihan ── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#E05945] rounded-full" />
            <h3 className="text-sm font-bold text-gray-800">Jadwal Latihan</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Hari Latihan</label>
              <div className="flex flex-wrap gap-2">
                {hariOptions.map(hari => (
                  <button key={hari} type="button"
                    onClick={() => handleToggleHari(hari)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition ${
                      jadwal.hariLatihan.includes(hari)
                        ? 'border-[#1E1C43] bg-[#1E1C43] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    {hari}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Jam Latihan</label>
                <input type="time" value={jadwal.jamLatihan}
                  onChange={e => setJadwal({ ...jadwal, jamLatihan: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tanggal Mulai</label>
                <input type="date" value={jadwal.tanggalMulai}
                  onChange={e => setJadwal({ ...jadwal, tanggalMulai: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
            </div>

            {/* Tanggal Berakhir (auto-kalkulasi) */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Estimasi Tanggal Berakhir</label>
              {tanggalBerakhir ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                  <p className="text-sm font-semibold text-[#1E1C43]">{tanggalBerakhir}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Tanggal Mulai + {selectedPaket?.masaBerlaku}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                  <p className="text-sm text-gray-400">— Pilih paket dan tanggal mulai terlebih dahulu</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION 5: Lokasi Latihan ── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#E05945] rounded-full" />
            <h3 className="text-sm font-bold text-gray-800">Lokasi Latihan</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nama / Alamat Lokasi</label>
              <input type="text" value={lokasiLatihan}
                onChange={e => setLokasiLatihan(e.target.value)}
                placeholder="cth. Hampton's Park Tower A, Lt. 3 — Gym Area"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Link Google Maps</label>
              <input type="text" value={mapsLink}
                onChange={e => { setMapsLink(e.target.value); setKoordinat(null); setValidasiError(null); }}
                placeholder="Paste link dari Google Maps (klik Share > Copy Link)"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
            </div>

            {/* Tombol Validasi */}
            <div>
              <button
                type="button"
                onClick={handleValidasiKoordinat}
                className="border border-[#1E1C43] text-[#1E1C43] text-sm rounded-lg px-4 py-2 hover:bg-[#1E1C43] hover:text-white transition">
                Validasi & Deteksi Koordinat
              </button>
            </div>

            {/* Hasil Deteksi Koordinat */}
            {koordinat && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Latitude</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{koordinat.lat}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Longitude</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{koordinat.lng}</p>
                </div>
              </div>
            )}
            {koordinat && (
              <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckCircle size={16} className="text-green-600 mt-0.5 shrink-0" />
                <p className="text-xs text-green-700">
                  Koordinat berhasil dideteksi. Radius geofencing 200m akan aktif saat PIC absen.
                </p>
              </div>
            )}
            {validasiError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-600">
                  {validasiError}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 7: Catatan Order ── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#E05945] rounded-full" />
            <h3 className="text-sm font-bold text-gray-800">Catatan Order</h3>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Catatan Order / Target Klien</label>
            <textarea value={catatanOrder} onChange={e => setCatatanOrder(e.target.value)}
              placeholder="Target klien, catatan khusus, kondisi kesehatan yang perlu diperhatikan, dll..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
          </div>
        </div>

      </div>

      {/* ── Sticky Footer ── */}
      <div
        className="fixed bottom-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-40"
        style={{ left: '224px' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            {items.length > 0 && (
              <p className="text-sm text-gray-600">
                Total: <span className="font-bold text-[#1E1C43] text-base">{formatRp(totalNilai)}</span>
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/pp/orders')}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition flex items-center gap-2">
              <ArrowLeft size={15} /> Batal
            </button>
            <button
              className="px-4 py-2.5 border border-[#1E1C43] text-[#1E1C43] rounded-xl text-sm font-semibold hover:bg-gray-50 transition flex items-center gap-2">
              Simpan Draft
            </button>
            <button onClick={handleSimpanOrder}
              disabled={!pendaftar.nama || !klienLatihan.nama || !selectedPaket}
              className="px-6 py-2.5 bg-[#1E1C43] text-white rounded-xl text-sm font-semibold hover:bg-[#2d2b5e] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              Simpan & Buat Order →
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
