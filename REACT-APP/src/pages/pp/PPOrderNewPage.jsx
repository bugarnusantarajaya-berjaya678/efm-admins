import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
import { ArrowLeft, ChevronRight, Plus, Trash2, CheckCircle, XCircle, ChevronDown, ClipboardList, Link2, User, Tag, Gift, X, Sparkles } from 'lucide-react';
import { getAllAssessments } from '../../data/ppAssessmentsStore';
import { addOrder, getNextOrderId } from '../../data/ppOrdersStore'
import { addInvoice, getNextInvoiceNo } from '../../data/ppInvoiceStore';
import { getStoredLeads } from '../../data/ppLeadsStore';
import { getKlienByLeadId } from '../../data/ppKlienStore';
import { getStoredPrograms } from '../../data/ppProgramStore';
import { PIC_DB } from '../../data/ppProgramDBData';
import { validatePromo } from '../../data/ppPromoStore';
import { TEMA_WARNA_CLS } from '../../data/ppPromoData';

function toPaket(p) {
  const pic = PIC_DB[p.picId] || {};
  return {
    id: p.id,
    namaProgram: p.namaLatihan,
    namaPaket: p.namaPaket,
    totalSesi: p.sesi,
    frekuensi: `${p.pertemuan}x seminggu`,
    masaBerlaku: p.masa,
    hargaPaket: p.harga,
    pic: {
      nama: pic.fullname || '—',
      spesialisasi: pic.spesialis || '—',
      rate: 'Rp ' + (p.biayaSesiPIC || 0).toLocaleString('id-ID') + '/sesi',
    },
    keterangan: '',
  };
}

const hariOptions = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const AVATAR_COLORS = ['#2980B9', '#8E44AD', '#27AE60', '#E05945', '#F39C12', '#16A085', '#D35400', '#1ABC9C', '#2ECC71', '#3498DB', '#9B59B6', '#E67E22'];
const BULAN_ID = ['jan','feb','mar','apr','mei','jun','jul','agu','sep','okt','nov','des'];

function getInvoiceInitials(nama) {
  return nama.trim().split(/\s+/).slice(0, 2).map(w => (w[0] || '').toUpperCase()).join('');
}
function pickAvatarColor(nama) {
  return AVATAR_COLORS[(nama.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}
function formatTglInv(date) {
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getPicInitials(nama) {
  return nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function PPOrderNewPage() {
  const navigate = useNavigate();
  const { setCrumbs } = useBreadcrumb();

  useEffect(() => {
    setCrumbs(['Private Program', 'Orders', 'Order Baru'])
    return () => setCrumbs(null)
  }, [])

  // Data Pendaftar — combobox search dari leads
  const [pendaftarSearch, setPendaftarSearch] = useState('');
  const [pendaftarDropdownOpen, setPendaftarDropdownOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  // Section 1: Data Pendaftar
  const [pendaftar, setPendaftar] = useState({
    nama: '', sapaan: 'Kak', noHP: '', email: '', hubunganDenganKlien: 'Diri Sendiri'
  });

  // Section 2: Data Klien Latihan
  const [selectedKlienIds, setSelectedKlienIds] = useState([]);

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

  // Section 6: Kode Promo
  const [promoKodeInput, setPromoKodeInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(null); // promo object | null
  const [promoError, setPromoError] = useState('');

  // Section 7: Catatan
  const [catatanOrder, setCatatanOrder] = useState('');

  // ── Handlers ──────────────────────────────────────
  const handleSelectLead = (lead) => {
    setPendaftar({
      nama: lead.namaPendaftar || lead.nama,
      sapaan: lead.sapaan || 'Kak',
      noHP: lead.hpPendaftar || lead.noHP,
      email: lead.emailPendaftar || lead.email,
      hubunganDenganKlien: lead.hubunganDenganKlien || 'Diri Sendiri'
    });
    setSelectedKlienIds([]);
    setSelectedLeadId(lead.id);
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

  const handleApplyPromo = () => {
    const kode = promoKodeInput.trim();
    if (!kode) return;
    const result = validatePromo(kode, { programId: selectedPaket?.id || null });
    if (result.valid) {
      setPromoApplied(result.promo);
      setPromoError('');
    } else {
      setPromoApplied(null);
      setPromoError(result.error);
    }
  };

  const handleClearPromo = () => {
    setPromoApplied(null);
    setPromoKodeInput('');
    setPromoError('');
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

  const paketList = getStoredPrograms().filter(p => p.status === 'aktif').map(toPaket);

  const totalNilai = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const formatRp = (val) => 'Rp ' + (val || 0).toLocaleString('id-ID');

  const nilaiDiskon = (() => {
    if (!promoApplied || promoApplied.tipe !== 'diskon') return 0;
    if (promoApplied.subTipe === 'persen') return Math.round(totalNilai * promoApplied.nilai / 100);
    return Math.min(promoApplied.nilai, totalNilai);
  })();
  const totalSetelahPromo = totalNilai - nilaiDiskon;

  const handleSimpanOrder = () => {
    const newId = getNextOrderId()
    const today = new Date().toISOString().split('T')[0]
    const todayDate = new Date()
    addOrder({
      id: newId,
      leadId: selectedLeadId || null,
      klienIds: selectedKlienIds,
      programId: selectedPaket?.id || null,
      namaKlien: pendaftar.nama,
      sapaan: pendaftar.sapaan,
      noHP: pendaftar.noHP,
      email: pendaftar.email,
      hubunganKlien: pendaftar.hubunganDenganKlien,
      namaKlienLatihan: (() => {
        if (selectedKlienIds.length > 0 && selectedLeadId) {
          const allK = getKlienByLeadId(selectedLeadId)
          const names = selectedKlienIds.map(id => allK.find(k => k.id === id)?.nama).filter(Boolean)
          return names.join(' & ')
        }
        return ''
      })(),
      noHPKlien: (() => {
        if (selectedKlienIds.length > 0 && selectedLeadId) {
          const allK = getKlienByLeadId(selectedLeadId)
          const first = allK.find(k => k.id === selectedKlienIds[0])
          return first?.noHp || ''
        }
        return ''
      })(),
      usiaKlien: (() => {
        if (selectedKlienIds.length === 1 && selectedLeadId) {
          const allK = getKlienByLeadId(selectedLeadId)
          const k = allK.find(kl => kl.id === selectedKlienIds[0])
          if (k?.tanggalLahir) {
            const d = new Date(k.tanggalLahir)
            const today = new Date()
            return today.getFullYear() - d.getFullYear() - (today < new Date(today.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0)
          }
        }
        return null
      })(),
      jenisKelaminKlien: (() => {
        if (selectedKlienIds.length === 1 && selectedLeadId) {
          const allK = getKlienByLeadId(selectedLeadId)
          const k = allK.find(kl => kl.id === selectedKlienIds[0])
          return k?.jenisKelamin || ''
        }
        return ''
      })(),
      paket: selectedPaket?.namaPaket || '',
      picSalesEFM: selectedPaket?.pic?.nama || '',
      picOpsEFM: selectedPaket?.pic?.nama || '',
      tanggalMulai: jadwal.tanggalMulai || today,
      hariLatihan: jadwal.hariLatihan,
      jamLatihan: jadwal.jamLatihan,
      lokasiLatihan,
      nilaiKontrak: totalSetelahPromo,
      nilaiDiskon,
      promoKode: promoApplied?.kode || null,
      promoTipe: promoApplied?.tipe || null,
      promoBenefitBonus: promoApplied?.tipe === 'bonus' ? (promoApplied.keterangan || promoApplied.benefitBonus || null) : null,
      promoTema: promoApplied?.tema || null,
      rincianLayanan: items,
      catatanOrder,
      statusOrder: 'Aktif',
      tahapan: 'Program Berjalan',
      paymentTerms: 'Per Paket',
      paymentTracking: [],
      loiStatus: 'N/A', mouAda: false, contractStatus: 'Active',
      quotation: { manajemenFee: false, manajemenFeePersen: 0, pajak: [{ nama: 'PPN 11%', persen: 11, aktif: false }], status: 'Draft', catatan: '' },
    })

    // Auto-buat invoice untuk order baru
    const dueDate = new Date(todayDate)
    dueDate.setDate(dueDate.getDate() + 14)
    const mm = todayDate.getMonth()
    const bulan = `${BULAN_ID[mm]} ${todayDate.getFullYear()}`
    addInvoice({
      invNo: getNextInvoiceNo(),
      orderId: newId,
      client: pendaftar.nama,
      sapaan: pendaftar.sapaan,
      initials: getInvoiceInitials(pendaftar.nama),
      color: pickAvatarColor(pendaftar.nama),
      alamat: lokasiLatihan || '',
      noHp: pendaftar.noHP,
      paket: selectedPaket?.namaPaket || '',
      namaLatihan: selectedPaket?.namaProgram || 'Private Training',
      pic: selectedPaket?.pic?.nama || '',
      tanggal: formatTglInv(todayDate),
      due: formatTglInv(dueDate),
      status: 'pending',
      hargaPersesi: selectedPaket ? Math.round(selectedPaket.hargaPaket / (selectedPaket.totalSesi || 1)) : 0,
      sesi: selectedPaket?.totalSesi || 0,
      hargaPaket: totalNilai,
      diskonPaket: 0,
      biayaLain: 0, biayaLainKet: '',
      diskon: nilaiDiskon,
      promoKode: promoApplied?.kode || '',
      promoType: promoApplied?.tipe || '',
      promoVal: promoApplied?.nilai || 0,
      pajak: 0,
      total: totalSetelahPromo,
      bulan,
      paidDate: null, payMethod: null,
    })

    navigate('/pp/orders/' + newId)
  };

  const allLeads = getStoredLeads().map(l => ({ ...l, noHP: l.noHp, email: l.emailUmum, sumber: l.sumberLead }));
  const filteredLeads = pendaftarSearch
    ? allLeads.filter(l =>
        l.nama.toLowerCase().includes(pendaftarSearch.toLowerCase()) ||
        (l.noHp || '').includes(pendaftarSearch) ||
        l.id.toLowerCase().includes(pendaftarSearch.toLowerCase())
      )
    : allLeads;

  const tanggalBerakhir = calcTanggalBerakhir();

  const filteredPaket = programSearch
    ? paketList.filter(p =>
        p.id.toLowerCase().includes(programSearch.toLowerCase()) ||
        p.namaPaket.toLowerCase().includes(programSearch.toLowerCase()) ||
        p.namaProgram.toLowerCase().includes(programSearch.toLowerCase())
      )
    : paketList;

  // ── Render ──────────────────────────────────────
  return (
    <div className="bg-[#F5F5F7] min-h-screen pb-24">


      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
              <ClipboardList size={22} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Private Program</p>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">Order Baru</h1>
              <p className="text-xs text-gray-400 mt-1">Buat order Private Program baru</p>
            </div>
          </div>
          <button onClick={() => navigate('/pp/orders')}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">
            <ArrowLeft size={12} /> Kembali
          </button>
        </div>
      </div>

      <div className="space-y-4">

        {/* ── SECTION 1: Data Pendaftar ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Data Pendaftar</h3>
            <span className="text-xs text-gray-400">— orang yang mendaftar / membayar</span>
          </div>
          <div className="space-y-3">
            {/* Lead selector */}
            {selectedLeadId ? (() => {
              const leadAssessments = Object.entries(getAllAssessments())
                .filter(([, a]) => a.leadId === selectedLeadId)
                .map(([id, a]) => ({ id, ...a }))
              const lead = allLeads.find(l => l.id === selectedLeadId)
              return (
                <div className="rounded-xl border-2 border-green-200 bg-green-50 overflow-hidden">
                  {/* Main info row */}
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span>✅</span>
                        <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">{selectedLeadId}</span>
                        <span className="text-sm font-bold text-green-800">{pendaftar.nama}</span>
                      </div>
                      <p className="text-xs text-green-700">{pendaftar.noHP}{pendaftar.email ? ` · ${pendaftar.email}` : ''}</p>
                      {lead?.statusPipeline && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-1 inline-block ${lead.statusPipeline === 'Closed Won' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {lead.statusPipeline}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLeadId(null)
                        setSelectedKlienIds([])
                        setPendaftar({ nama: '', sapaan: 'Kak', noHP: '', email: '', hubunganDenganKlien: '' })
                        setPendaftarDropdownOpen(false)
                        setPendaftarSearch('')
                      }}
                      className="text-xs text-gray-500 hover:text-red-500 transition-colors whitespace-nowrap shrink-0 px-2 py-1 rounded-lg border border-gray-200 bg-white hover:border-red-200"
                    >
                      × Ganti Lead
                    </button>
                  </div>
                  {/* Assessment info row */}
                  <div className="border-t border-green-200 px-4 py-3 flex items-start gap-2">
                    <ClipboardList size={13} className="text-green-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      {leadAssessments.length > 0 ? (
                        <>
                          <p className="text-xs font-semibold text-green-700 mb-1.5">
                            Lead ini sudah memiliki {leadAssessments.length} fitness assessment:
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-1">
                            {leadAssessments.map(a => (
                              <span key={a.id} className="text-[10px] font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded border border-green-200">
                                #{a.id} ({a.statusAssessment})
                              </span>
                            ))}
                          </div>
                          <p className="text-[11px] text-green-600">Order baru akan otomatis ditandai sebagai renewal jika assessment terakhir sudah Post-Test Selesai.</p>
                        </>
                      ) : (
                        <p className="text-xs text-green-600">Lead ini belum memiliki fitness assessment. Assessment dapat dibuat setelah order tersimpan.</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })() : (
              <div className="p-4 rounded-xl border border-gray-200 bg-[#F5F5F7]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Link2 size={13} className="text-[#1E1C43]" />
                  <p className="text-xs font-bold text-[#1E1C43] uppercase tracking-wide">Pilih Lead Pendaftar</p>
                </div>
                <p className="text-[11px] text-gray-500 mb-3">Hubungkan ke data leads untuk auto-fill nama, HP, email, dan info klien secara otomatis</p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPendaftarDropdownOpen(p => !p)}
                    className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2.5 text-xs bg-white hover:border-[#1E1C43] transition-colors"
                  >
                    <span className="text-gray-400">Pilih dari daftar leads...</span>
                    <span className="text-gray-400 ml-2">{pendaftarDropdownOpen ? '▲' : '▼'}</span>
                  </button>
                  {pendaftarDropdownOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30">
                      <div className="p-2 border-b border-gray-100">
                        <input
                          autoFocus
                          value={pendaftarSearch}
                          onChange={e => setPendaftarSearch(e.target.value)}
                          placeholder="Cari nama, ID lead, atau nomor HP..."
                          className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#1E1C43]"
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto">
                        {filteredLeads.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-4">Tidak ada leads ditemukan</p>
                        ) : (
                          filteredLeads.map(lead => (
                            <button
                              key={lead.id}
                              type="button"
                              onClick={() => {
                                handleSelectLead(lead)
                                setPendaftarDropdownOpen(false)
                                setPendaftarSearch('')
                              }}
                              className="w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-blue-50 transition-colors flex items-center gap-2"
                            >
                              <span className="text-[10px] font-semibold text-[#1E1C43] bg-[#1E1C43]/10 px-1.5 py-0.5 rounded shrink-0">{lead.id}</span>
                              <span className="text-xs font-medium text-gray-800 flex-1">{lead.nama}</span>
                              <span className="text-[10px] text-gray-400 shrink-0">{lead.noHP}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${lead.statusPipeline === 'Closed Won' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {lead.statusPipeline}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Hubungan dengan Klien</p>
                {pendaftar.hubunganDenganKlien
                  ? <p className="text-sm font-semibold text-gray-800">{pendaftar.hubunganDenganKlien}</p>
                  : <p className="text-sm text-gray-400 italic">— pilih leads terlebih dahulu</p>
                }
              </div>
              <p className="text-xs text-gray-400 mt-1">Otomatis dari data leads</p>
            </div>

          </div>
        </div>

        {/* ── SECTION 2: Data Klien Latihan ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Data Klien Latihan</h3>
            <span className="text-xs text-gray-400">— orang yang actual latihan</span>
          </div>
          <div className="space-y-3">
            {/* Klien picker — multi-select, shown when lead is selected and has klien in store */}
            {selectedLeadId && (() => {
              const leadKlienList = getKlienByLeadId(selectedLeadId)
              if (leadKlienList.length === 0) return null
              return (
                <div className="p-4 rounded-xl border border-gray-200 bg-[#F5F5F7]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-[#1E1C43]" />
                      <p className="text-xs font-bold text-[#1E1C43] uppercase tracking-wide">Pilih Klien Latihan</p>
                    </div>
                    {selectedKlienIds.length > 0 && (
                      <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        {selectedKlienIds.length} klien dipilih
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mb-3">
                    Pilih satu atau lebih klien — untuk couple/grup, centang semua klien yang ikut latihan
                  </p>
                  <div className="flex flex-col gap-2">
                    {leadKlienList.map(k => {
                      const usiaTahun = k.tanggalLahir ? (() => {
                        const d = new Date(k.tanggalLahir)
                        const today = new Date()
                        return today.getFullYear() - d.getFullYear() - (today < new Date(today.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0)
                      })() : null
                      const isChecked = selectedKlienIds.includes(k.id)
                      return (
                        <button key={k.id} type="button"
                          onClick={() => {
                            setSelectedKlienIds(prev =>
                              prev.includes(k.id)
                                ? prev.filter(id => id !== k.id)
                                : [...prev, k.id]
                            )
                          }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors text-left ${
                            isChecked
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-200 bg-white hover:border-[#1E1C43] hover:bg-blue-50'
                          }`}>
                          {/* Checkbox visual */}
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isChecked ? 'bg-[#1E1C43] border-[#1E1C43]' : 'border-gray-300 bg-white'
                          }`}>
                            {isChecked && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <div className="w-7 h-7 rounded-full bg-[#1E1C43]/10 flex items-center justify-center shrink-0">
                            <User size={12} className="text-[#1E1C43]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${isChecked ? 'text-green-800' : 'text-[#1E1C43]'}`}>{k.id} — {k.nama}</p>
                            <p className="text-[10px] text-gray-400">
                              {k.jenisKelamin || '—'}{usiaTahun !== null ? ` · ${usiaTahun} tahun` : ''}{k.noHp ? ` · ${k.noHp}` : ''}
                            </p>
                          </div>
                          {isChecked && (
                            <span className="text-[10px] font-semibold text-green-600 shrink-0">✓ Dipilih</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* If no lead selected or lead has no klien in store, show a prompt */}
            {!selectedLeadId && (
              <p className="text-xs text-gray-400 italic text-center py-4">Pilih lead pendaftar terlebih dahulu untuk melihat data klien.</p>
            )}
            {selectedLeadId && getKlienByLeadId(selectedLeadId).length === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-4">Lead ini belum memiliki data klien terdaftar.</p>
            )}
          </div>
        </div>

        {/* ── SECTION 3: Program & Paket ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Program & Rincian Biaya</h3>

          {selectedPaket === null ? (
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Pilih Program & Paket</label>
              <div className="relative">
                <input
                  type="text"
                  value={programSearch}
                  onChange={e => { setProgramSearch(e.target.value); setProgramDropdownOpen(true) }}
                  onFocus={() => { setProgramSearch(''); setProgramDropdownOpen(true) }}
                  onBlur={() => setTimeout(() => setProgramDropdownOpen(false), 150)}
                  placeholder="Ketik ID program, nama paket, atau jenis latihan..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] pr-9"
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
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-mono mb-0.5">{selectedPaket.id}</p>
                  <p className="text-sm font-bold text-[#1E1C43]">
                    {selectedPaket.namaProgram}
                    <span className="font-normal text-gray-500"> · {selectedPaket.namaPaket}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-sm font-bold text-[#1E1C43]">{formatRp(selectedPaket.hargaPaket)}</p>
                  <button
                    onClick={() => { setSelectedPaket(null); setItems([]); }}
                    className="text-xs border border-gray-200 text-gray-500 bg-white rounded-lg px-3 py-1 hover:bg-gray-100 transition whitespace-nowrap">
                    Ganti Paket
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {[selectedPaket.totalSesi + ' sesi', selectedPaket.frekuensi, selectedPaket.masaBerlaku].map(v => (
                  <span key={v} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{v}</span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#1E1C43] text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
                  {getPicInitials(selectedPaket.pic.nama)}
                </div>
                <p className="text-xs text-gray-600 flex-1">{selectedPaket.pic.nama} · {selectedPaket.pic.spesialisasi}</p>
                <p className="text-xs text-[#E05945] font-medium shrink-0">{selectedPaket.pic.rate}</p>
              </div>
              {selectedPaket.keterangan && (
                <p className="text-xs text-gray-400 italic mt-2">{selectedPaket.keterangan}</p>
              )}
            </div>
          )}

          {items.filter(i => !i.isFromProgram).length > 0 && (
            <div className="mt-3 space-y-2">
              {items.filter(i => !i.isFromProgram).map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Biaya Tambahan</span>
                    <button onClick={() => handleRemoveItem(item.id)}
                      className="ml-auto text-gray-300 hover:text-red-500 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="col-span-2">
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Nama Item</label>
                      <input type="text" value={item.namaItem}
                        onChange={e => handleUpdateItem(item.id, 'namaItem', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-[#1E1C43]" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Jumlah</label>
                      <input type="number" value={item.jumlah}
                        onChange={e => handleUpdateItem(item.id, 'jumlah', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-[#1E1C43]" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Harga (Rp)</label>
                      <input type="number" value={item.harga}
                        onChange={e => handleUpdateItem(item.id, 'harga', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-[#1E1C43]" />
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-xs text-gray-400">Subtotal: </span>
                    <span className="text-sm font-bold text-[#1E1C43]">{formatRp(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedPaket && (
            <button onClick={handleAddItem}
              className="w-full mt-3 border-2 border-dashed border-gray-200 rounded-xl py-3 text-xs text-gray-400 hover:border-[#1E1C43] hover:text-[#1E1C43] transition flex items-center justify-center gap-2">
              <Plus size={14} /> Tambah Biaya Lain (Transport, Sewa Alat, dll)
            </button>
          )}

          {selectedPaket && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-sm text-gray-600">{formatRp(totalNilai)}</span>
              </div>
              {nilaiDiskon > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Diskon Promo ({promoApplied?.kode})</span>
                  <span className="text-sm font-semibold text-green-600">− {formatRp(nilaiDiskon)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                <span className="text-sm text-gray-700 font-semibold">Total Nilai Order</span>
                <span className="text-xl font-bold text-[#1E1C43]">{formatRp(totalSetelahPromo)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── SECTION 6: Kode Promo ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4 flex items-center gap-2">
            <Tag size={14} /> Kode Promo <span className="text-xs font-normal text-gray-400">(opsional)</span>
          </h3>

          {promoApplied ? (
            <div className="space-y-3">
              {/* Thematic banner */}
              {promoApplied.tema && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium ${TEMA_WARNA_CLS[promoApplied.tema.warna] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  <Sparkles size={13} className="shrink-0" />
                  <span>{promoApplied.tema.icon} Promo Tematik: <strong>{promoApplied.tema.nama}</strong></span>
                </div>
              )}

              {/* Applied promo card */}
              <div className={`rounded-xl border-2 p-4 ${promoApplied.tipe === 'diskon' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${promoApplied.tipe === 'diskon' ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {promoApplied.tipe === 'diskon' ? <Tag size={14} className="text-green-600" /> : <Gift size={14} className="text-blue-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded font-mono ${promoApplied.tipe === 'diskon' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {promoApplied.kode}
                        </span>
                        <span className={`text-xs font-semibold ${promoApplied.tipe === 'diskon' ? 'text-green-800' : 'text-blue-800'}`}>
                          {promoApplied.label}
                        </span>
                      </div>
                      <p className={`text-xs ${promoApplied.tipe === 'diskon' ? 'text-green-700' : 'text-blue-700'}`}>
                        {promoApplied.keterangan}
                      </p>
                      {promoApplied.benefitBonus && (
                        <p className={`text-xs mt-1 font-medium ${promoApplied.tipe === 'diskon' ? 'text-green-600' : 'text-blue-600'}`}>
                          + {promoApplied.benefitBonus}
                        </p>
                      )}
                    </div>
                  </div>
                  <button onClick={handleClearPromo}
                    className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                    <X size={16} />
                  </button>
                </div>

                {/* Diskon preview */}
                {promoApplied.tipe === 'diskon' && totalNilai > 0 && (
                  <div className="mt-3 pt-3 border-t border-green-200 flex justify-between items-center">
                    <span className="text-xs text-green-700">
                      Diskon{promoApplied.subTipe === 'persen' ? ` ${promoApplied.nilai}%` : ''}:
                    </span>
                    <span className="text-sm font-bold text-green-700">− {formatRp(nilaiDiskon)}</span>
                  </div>
                )}
                {promoApplied.tipe === 'diskon' && totalNilai > 0 && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-green-700 font-semibold">Total setelah promo:</span>
                    <span className="text-base font-bold text-[#1E1C43]">{formatRp(totalSetelahPromo)}</span>
                  </div>
                )}
                {promoApplied.tipe === 'bonus' && (
                  <p className="text-xs text-blue-600 mt-3 pt-3 border-t border-blue-200 italic">
                    Promo bonus tidak mengubah harga — benefit dicatat di invoice.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoKodeInput}
                  onChange={e => { setPromoKodeInput(e.target.value.toUpperCase()); setPromoError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                  placeholder="Masukkan kode promo..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43] font-mono uppercase"
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={!promoKodeInput.trim()}
                  className="px-4 py-2 bg-[#1E1C43] text-white rounded-lg text-sm font-semibold hover:bg-[#2d2b5e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Terapkan
                </button>
              </div>
              {promoError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <XCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600">{promoError}</p>
                </div>
              )}
              {!selectedPaket && (
                <p className="text-xs text-gray-400 italic">Pilih paket terlebih dahulu agar validasi program promo akurat.</p>
              )}
            </div>
          )}
        </div>

        {/* ── SECTION 4: Jadwal Latihan ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Jadwal Latihan</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Hari Latihan</label>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Jam Latihan</label>
                <input type="time" value={jadwal.jamLatihan}
                  onChange={e => setJadwal({ ...jadwal, jamLatihan: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Tanggal Mulai</label>
                <input type="date" value={jadwal.tanggalMulai}
                  onChange={e => setJadwal({ ...jadwal, tanggalMulai: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
            </div>

            {/* Tanggal Berakhir (auto-kalkulasi) */}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Estimasi Tanggal Berakhir</label>
              {tanggalBerakhir ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                  <p className="text-sm font-semibold text-[#1E1C43]">{tanggalBerakhir}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Tanggal Mulai + {selectedPaket?.masaBerlaku}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                  <p className="text-sm text-gray-400">— Pilih paket dan tanggal mulai terlebih dahulu</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION 5: Lokasi Latihan ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Lokasi Latihan</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Nama / Alamat Lokasi</label>
              <input type="text" value={lokasiLatihan}
                onChange={e => setLokasiLatihan(e.target.value)}
                placeholder="cth. Hampton's Park Tower A, Lt. 3 — Gym Area"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Link Google Maps</label>
              <input type="text" value={mapsLink}
                onChange={e => { setMapsLink(e.target.value); setKoordinat(null); setValidasiError(null); }}
                placeholder="Paste link dari Google Maps (klik Share > Copy Link)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Catatan Order</h3>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Catatan Order / Target Klien</label>
            <textarea value={catatanOrder} onChange={e => setCatatanOrder(e.target.value)}
              placeholder="Target klien, catatan khusus, kondisi kesehatan yang perlu diperhatikan, dll..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
          </div>
        </div>

      </div>

      {/* ── Sticky Footer ── */}
      <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white border-t border-gray-200 px-6 py-4 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Left: context info */}
          <div className="hidden sm:block min-w-0">
            <p className="text-sm text-gray-700 font-semibold truncate">
              {pendaftar.nama || 'Order Baru'}
              {selectedLeadId && <span className="text-gray-400 font-normal ml-1.5">· {selectedLeadId}</span>}
            </p>
            {items.length > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                Total: <span className="font-semibold text-[#1E1C43]">{formatRp(totalSetelahPromo)}</span>
                {nilaiDiskon > 0 && <span className="text-green-600 ml-1">(hemat {formatRp(nilaiDiskon)})</span>}
              </p>
            )}
          </div>
          {/* Right: action buttons */}
          <div className="flex items-center gap-3 ml-auto">
            <button onClick={handleSimpanOrder}
              disabled={!pendaftar.nama || !selectedPaket}
              className="px-6 py-2.5 bg-[#1E1C43] text-white rounded-xl text-sm font-semibold hover:bg-[#2d2b5e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              Simpan & Buat Order →
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
