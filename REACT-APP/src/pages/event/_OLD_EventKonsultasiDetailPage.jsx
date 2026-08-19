import { useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Info, Calendar, MapPin, Users, ClipboardList, CheckCircle, X } from 'lucide-react'

const LEADS_DATA = [
  { id: "EL-001", namaKlien: "PT. Sinar Abadi",     tipeKlien: "Corporate",        namaEvent: "Fun Run Jakarta 2026",     jenisEvent: "Corporate Event",  picSalesEFM: "Ahmad Pratama", kota: "Jakarta",    emailUmum: "info@sinarabadi.com",          sumberLead: "Referral",   namaKoordinator: "Budi Santoso", waKoordinator: "081234567801" },
  { id: "EL-002", namaKlien: "Komunitas Sehat ID",   tipeKlien: "Community",        namaEvent: "Yoga Festival Senayan",    jenisEvent: "Community Event",  picSalesEFM: "Rina Indah",    kota: "Jakarta",    emailUmum: "komunitas@sehatid.com",        sumberLead: "Instagram",  namaKoordinator: "",             waKoordinator: "" },
  { id: "EL-003", namaKlien: "Kemenpora RI",         tipeKlien: "Government",       namaEvent: "HUT RI Fitness Challenge", jenisEvent: "Government Event", picSalesEFM: "Sarah Jenkins", kota: "Jakarta",    emailUmum: "humas@kemenpora.go.id",        sumberLead: "Cold Email", namaKoordinator: "Drs. Hendra",  waKoordinator: "081234567803" },
  { id: "EL-004", namaKlien: "CV. Maju Sejahtera",   tipeKlien: "Corporate",        namaEvent: "Employee Wellness Day",    jenisEvent: "Corporate Event",  picSalesEFM: "Marcus Chen",   kota: "Tangerang",  emailUmum: "info@majusejahtera.com",        sumberLead: "Referral",   namaKoordinator: "",             waKoordinator: "" },
  { id: "EL-005", namaKlien: "Pemkot Tangerang",     tipeKlien: "Government",       namaEvent: "Marathon Kota Tangerang",  jenisEvent: "Government Event", picSalesEFM: "Budi Wijaya",   kota: "Tangerang",  emailUmum: "dispora@tangerangkota.go.id",  sumberLead: "Google/Web", namaKoordinator: "",             waKoordinator: "" },
  { id: "EL-006", namaKlien: "Keluarga Santoso",     tipeKlien: "Private/Individual",namaEvent: "Private Fitness Retreat", jenisEvent: "Private Event",    picSalesEFM: "Rina Indah",    kota: "Bogor",      emailUmum: "santoso.family@gmail.com",     sumberLead: "Referral",   namaKoordinator: "Pak Santoso",  waKoordinator: "081234567806" },
]

const KONSULTASI_DATA = [
  { id: "KNS-001", leadId: "EL-001", namaKlien: "PT. Karya Maju",          tipeKlien: "Corporate",        namaEvent: "Fun Run Jakarta 2026",      jenisEvent: "Corporate Event",  tanggal: "2026-06-05", lokasi: "Senayan, Jakarta",   lokasiDetail: "GBK Stadion Utama",                                        jumlahPeserta: 500, peranEFM: "Full EO",                programKegiatan: ["Fun Run","Senam Massal","Pembicara Kesehatan"], picEFM: "Ahmad Pratama", hasilKonsultasi: "Lanjut",      catatan: "Klien minta EFM handle full dari konsep sampai hari H", estimasiAnggaran: 50000000 },
  { id: "KNS-002", leadId: "EL-002", namaKlien: "Keluarga Besar Suharto",  tipeKlien: "Private/Individual",namaEvent: "Family Gathering Suharto 2026",jenisEvent: "Family Gathering",tanggal: "2026-06-07", lokasi: "Bogor",              lokasiDetail: "Villa Kota Hujan, Jl. Raya Puncak No. 88",                 jumlahPeserta: 150, peranEFM: "Provider Pengisi Acara",  programKegiatan: ["Senam Massal","Zumba"],                        picEFM: "Rina Indah",    hasilKonsultasi: "Lanjut",      catatan: "",                                                       estimasiAnggaran: 0 },
  { id: "KNS-003", leadId: "EL-003", namaKlien: "SMA Negeri 5 Jakarta",    tipeKlien: "Community",        namaEvent: "School Health Day",         jenisEvent: "School Event",     tanggal: "2026-06-10", lokasi: "Jakarta Selatan",   lokasiDetail: "Lapangan SMA Negeri 5, Jl. Manggis No. 10",               jumlahPeserta: 300, peranEFM: "Supporting Team",       programKegiatan: ["Senam Massal","Fun Run","Zumba"],              picEFM: "Sarah Jenkins", hasilKonsultasi: "Pending",     catatan: "Menunggu konfirmasi kepala sekolah",                     estimasiAnggaran: 0 },
  { id: "KNS-004", leadId: "EL-004", namaKlien: "RS Cipto Mangunkusumo",   tipeKlien: "Government",       namaEvent: "Corporate Health Day",      jenisEvent: "Corporate Event",  tanggal: "2026-06-12", lokasi: "Jakarta Pusat",     lokasiDetail: "Auditorium RSCM Lt. 2",                                    jumlahPeserta: 200, peranEFM: "Provider Pengisi Acara",  programKegiatan: ["Senam Massal","Pembicara Kesehatan"],          picEFM: "Marcus Chen",   hasilKonsultasi: "Tidak Lanjut",catatan: "Budget tidak sesuai",                                    estimasiAnggaran: 0 },
  { id: "KNS-005", leadId: "EL-005", namaKlien: "PT. Digital Nusantara",   tipeKlien: "Corporate",        namaEvent: "Tech & Wellness Day",       jenisEvent: "Corporate Event",  tanggal: "2026-06-15", lokasi: "Jakarta Barat",     lokasiDetail: "Kantor PT. Digital Nusantara, Jl. S. Parman Kav. 12",     jumlahPeserta: 250, peranEFM: "Full EO",                programKegiatan: ["Yoga","Team Building","Pembicara Kesehatan"],  picEFM: "Budi Wijaya",   hasilKonsultasi: "Lanjut",      catatan: "",                                                       estimasiAnggaran: 0 },
]

const PROGRAM_OPTS = ["Zumba","Yoga","Poundfit","Senam Massal","Fun Run","Fitness Class","Pembicara Kesehatan","Host/MC","Juri/Wasit","Team Building","Lainnya"]

const PERAN_EFM_OPTS = [
  { value: "Provider Pengisi Acara", desc: "Instruktur / Speaker / Host / dll" },
  { value: "Supporting Team",        desc: "Support EO klien — konsep, monitoring, evaluasi, juri/wasit" },
  { value: "Full EO",                desc: "EFM sebagai Event Organizer utama" },
]

export default function EventKonsultasiDetailPage() {
  const { id }          = useParams()
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const isNew           = !id || id === "new"
  const leadId          = searchParams.get("leadId")

  const existingKNS = !isNew ? KONSULTASI_DATA.find(k => k.id === id) : null
  const leadData    = leadId  ? LEADS_DATA.find(l => l.id === leadId)  : null

  const buildInit = () => {
    if (!isNew && existingKNS) {
      return {
        namaKlien: existingKNS.namaKlien, tipeKlien: existingKNS.tipeKlien,
        namaEvent: existingKNS.namaEvent, jenisEvent: existingKNS.jenisEvent,
        kota: existingKNS.lokasi, emailUmum: "", picSalesEFM: "", sumberLead: "",
        namaKoordinator: "", waKoordinator: "",
        tanggal: existingKNS.tanggal, lokasi: existingKNS.lokasi,
        lokasiDetail: existingKNS.lokasiDetail,
        jumlahPeserta: existingKNS.jumlahPeserta,
        peranEFM: existingKNS.peranEFM,
        programKegiatan: [...existingKNS.programKegiatan],
        programLainnya: "", catatanProgram: "",
        estimasiAnggaran: existingKNS.estimasiAnggaran || "",
        picEFM: existingKNS.picEFM,
        hasilKonsultasi: existingKNS.hasilKonsultasi,
        catatan: existingKNS.catatan,
      }
    }
    if (leadData) {
      return {
        namaKlien: leadData.namaKlien, tipeKlien: leadData.tipeKlien,
        namaEvent: leadData.namaEvent || "", jenisEvent: leadData.jenisEvent || "Corporate Event",
        kota: leadData.kota, emailUmum: leadData.emailUmum,
        picSalesEFM: leadData.picSalesEFM, sumberLead: leadData.sumberLead,
        namaKoordinator: leadData.namaKoordinator, waKoordinator: leadData.waKoordinator,
        tanggal: "", lokasi: "", lokasiDetail: "", jumlahPeserta: "",
        peranEFM: "Provider Pengisi Acara",
        programKegiatan: [], programLainnya: "", catatanProgram: "",
        estimasiAnggaran: "", picEFM: "", hasilKonsultasi: "Pending", catatan: "",
      }
    }
    return {
      namaKlien: "", tipeKlien: "Corporate", namaEvent: "", jenisEvent: "Corporate Event",
      kota: "", emailUmum: "", picSalesEFM: "", sumberLead: "",
      namaKoordinator: "", waKoordinator: "",
      tanggal: "", lokasi: "", lokasiDetail: "", jumlahPeserta: "",
      peranEFM: "Provider Pengisi Acara",
      programKegiatan: [], programLainnya: "", catatanProgram: "",
      estimasiAnggaran: "", picEFM: "", hasilKonsultasi: "Pending", catatan: "",
    }
  }

  const [form, setForm] = useState(buildInit)

  const isAutoFill     = isNew && !!leadData
  const readOnlyFields = isAutoFill
    ? ["namaKlien","tipeKlien","kota","emailUmum","picSalesEFM","sumberLead","namaKoordinator","waKoordinator"]
    : []

  const autoFillCls = (field) =>
    readOnlyFields.includes(field)
      ? "bg-blue-50 border-blue-200 text-blue-800"
      : "bg-white border-gray-200"

  function toggleProgram(prog) {
    setForm(p => ({
      ...p,
      programKegiatan: p.programKegiatan.includes(prog)
        ? p.programKegiatan.filter(x => x !== prog)
        : [...p.programKegiatan, prog],
    }))
  }

  const displayId   = isNew ? "BARU" : (existingKNS?.id || id)
  const displayNama = form.namaKlien || "Konsultasi Baru"

  return (
    <div className="p-6 bg-[#F5F5F7] min-h-screen pb-28">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <span className="hover:text-[#1E1C43] cursor-pointer transition" onClick={() => navigate('/event/konsultasi')}>Konsultasi</span>
          <ChevronRight size={12} />
          <span className="text-gray-600 font-medium">{displayNama}</span>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
          <button onClick={() => navigate("/event/konsultasi")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1E1C43] transition mb-3">
            <ArrowLeft size={15} /> Kembali ke Konsultasi
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{displayId}</span>
                {!isNew && existingKNS && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    existingKNS.hasilKonsultasi === "Lanjut" ? "bg-green-100 text-green-700" :
                    existingKNS.hasilKonsultasi === "Pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>{existingKNS.hasilKonsultasi}</span>
                )}
                {isNew && <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">Baru</span>}
              </div>
              <h1 className="text-xl font-bold text-[#1E1C43] mt-1">{displayNama}</h1>
              {form.namaEvent && <p className="text-sm text-gray-500">{form.namaEvent}</p>}
              {isAutoFill && (
                <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                  <Info size={13} className="text-blue-500 shrink-0" />
                  <p className="text-xs text-blue-600">Data Profil Klien auto-terisi dari Lead <span className="font-semibold">{leadId}</span>. Field berwarna biru tidak dapat diubah.</p>
                </div>
              )}
            </div>
            {form.hasilKonsultasi === "Lanjut" && !isNew && (
              <button onClick={() => navigate(`/event/orders/new?konsultasiId=${id}`)}
                className="flex items-center gap-2 bg-[#E05945] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#c94a38] transition">
                Buat Order →
              </button>
            )}
          </div>
        </div>

        {/* SECTION 1 — Profil Klien */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#E05945] rounded-full" />
            <h3 className="text-sm font-bold text-gray-800">Profil Klien</h3>
            {isAutoFill && (
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Auto-terisi dari Lead</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Nama Klien */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Nama Klien *</label>
              <input value={form.namaKlien}
                onChange={e => !readOnlyFields.includes("namaKlien") && setForm(p => ({ ...p, namaKlien: e.target.value }))}
                readOnly={readOnlyFields.includes("namaKlien")}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] ${autoFillCls("namaKlien")}`} />
            </div>
            {/* Tipe Klien */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Tipe Klien *</label>
              {readOnlyFields.includes("tipeKlien") ? (
                <div className={`w-full border rounded-xl px-3 py-2.5 text-sm ${autoFillCls("tipeKlien")}`}>{form.tipeKlien}</div>
              ) : (
                <select value={form.tipeKlien} onChange={e => setForm(p => ({ ...p, tipeKlien: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                  {["Corporate","Brand","Community","Government","Foundation","Private/Individual"].map(o => <option key={o}>{o}</option>)}
                </select>
              )}
            </div>
            {/* Nama Event — selalu editable */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Nama Event *</label>
              <input value={form.namaEvent} onChange={e => setForm(p => ({ ...p, namaEvent: e.target.value }))}
                placeholder="Nama event klien"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
            </div>
            {/* Jenis Event — selalu editable */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Jenis Event *</label>
              <select value={form.jenisEvent} onChange={e => setForm(p => ({ ...p, jenisEvent: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                {["Corporate Event","Government Event","Brand Event","Community Event","School Event","Private Event","Family Gathering","Lainnya"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            {/* Kota */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Kota</label>
              <input value={form.kota}
                onChange={e => !readOnlyFields.includes("kota") && setForm(p => ({ ...p, kota: e.target.value }))}
                readOnly={readOnlyFields.includes("kota")} placeholder="Jakarta, Bogor, dll"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] ${autoFillCls("kota")}`} />
            </div>
            {/* Email Umum */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Email Umum</label>
              <input type="email" value={form.emailUmum}
                onChange={e => !readOnlyFields.includes("emailUmum") && setForm(p => ({ ...p, emailUmum: e.target.value }))}
                readOnly={readOnlyFields.includes("emailUmum")} placeholder="email@klien.com"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] ${autoFillCls("emailUmum")}`} />
            </div>
            {/* PIC Sales EFM */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">PIC Sales EFM</label>
              <input value={form.picSalesEFM}
                onChange={e => !readOnlyFields.includes("picSalesEFM") && setForm(p => ({ ...p, picSalesEFM: e.target.value }))}
                readOnly={readOnlyFields.includes("picSalesEFM")} placeholder="Nama PIC"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] ${autoFillCls("picSalesEFM")}`} />
            </div>
            {/* Sumber Lead */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Sumber Lead</label>
              <input value={form.sumberLead}
                onChange={e => !readOnlyFields.includes("sumberLead") && setForm(p => ({ ...p, sumberLead: e.target.value }))}
                readOnly={readOnlyFields.includes("sumberLead")} placeholder="Referral, Instagram, dll"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] ${autoFillCls("sumberLead")}`} />
            </div>
            {/* Nama Koordinator */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Nama Koordinator</label>
              <input value={form.namaKoordinator}
                onChange={e => !readOnlyFields.includes("namaKoordinator") && setForm(p => ({ ...p, namaKoordinator: e.target.value }))}
                readOnly={readOnlyFields.includes("namaKoordinator")} placeholder="Nama PIC klien"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] ${autoFillCls("namaKoordinator")}`} />
            </div>
            {/* No. WA Koordinator */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">No. WA Koordinator</label>
              <input value={form.waKoordinator}
                onChange={e => !readOnlyFields.includes("waKoordinator") && setForm(p => ({ ...p, waKoordinator: e.target.value }))}
                readOnly={readOnlyFields.includes("waKoordinator")} placeholder="08xxxxxxxxxx"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] ${autoFillCls("waKoordinator")}`} />
            </div>
          </div>
        </div>

        {/* SECTION 2 — Detail Event */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#E05945] rounded-full" />
            <h3 className="text-sm font-bold text-gray-800">Detail Event</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Tanggal Event *</label>
              <input type="date" value={form.tanggal} onChange={e => setForm(p => ({ ...p, tanggal: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Estimasi Jumlah Peserta *</label>
              <input type="number" min={1} value={form.jumlahPeserta} onChange={e => setForm(p => ({ ...p, jumlahPeserta: e.target.value }))}
                placeholder="200"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Lokasi / Kota *</label>
              <input value={form.lokasi} onChange={e => setForm(p => ({ ...p, lokasi: e.target.value }))}
                placeholder="Jakarta Selatan, Bogor, dll"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Lokasi Detail / Alamat Lengkap</label>
              <textarea value={form.lokasiDetail} onChange={e => setForm(p => ({ ...p, lokasiDetail: e.target.value }))}
                placeholder="Nama gedung, alamat lengkap, nomor lantai, dll" rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-3 block">Peran EFM dalam Event *</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "Provider Pengisi Acara", desc: "EFM sebagai instruktur, speaker, atau host" },
                  { value: "Supporting Team",        desc: "EFM support EO klien: konsep, monitoring, evaluasi" },
                  { value: "Full EO",                desc: "EFM sebagai Event Organizer utama dari A sampai Z" },
                ].map(opt => (
                  <div key={opt.value} onClick={() => setForm(p => ({ ...p, peranEFM: opt.value }))}
                    className={`border-2 rounded-xl p-3 cursor-pointer transition ${
                      form.peranEFM === opt.value
                        ? "border-[#1E1C43] bg-[#1E1C43]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <p className="text-xs font-semibold text-gray-800">{opt.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — Isi Program & Kegiatan */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-5 bg-[#E05945] rounded-full" />
            <h3 className="text-sm font-bold text-gray-800">Isi Program & Kegiatan</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">Pilih program / kegiatan yang akan disediakan EFM</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {PROGRAM_OPTS.map(prog => (
              <button key={prog} type="button" onClick={() => toggleProgram(prog)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  form.programKegiatan.includes(prog)
                    ? "bg-[#1E1C43] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                {prog}
              </button>
            ))}
          </div>

          {form.programKegiatan.includes("Lainnya") && (
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Kegiatan Lainnya</label>
              <textarea value={form.programLainnya} onChange={e => setForm(p => ({ ...p, programLainnya: e.target.value }))}
                placeholder="Tuliskan kegiatan lainnya..." rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Catatan Detail Program <span className="font-normal text-gray-400">(opsional)</span></label>
            <textarea value={form.catatanProgram} onChange={e => setForm(p => ({ ...p, catatanProgram: e.target.value }))}
              placeholder="Detail teknis, preferensi klien, catatan khusus program..." rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
          </div>
        </div>

        {/* SECTION 4 — Anggaran & Catatan */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#E05945] rounded-full" />
            <h3 className="text-sm font-bold text-gray-800">Anggaran & Catatan</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Estimasi Anggaran Klien</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Rp</span>
                <input type="number" min={0} value={form.estimasiAnggaran}
                  onChange={e => setForm(p => ({ ...p, estimasiAnggaran: e.target.value }))}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">PIC EFM yang Handle</label>
              <input value={form.picEFM} onChange={e => setForm(p => ({ ...p, picEFM: e.target.value }))}
                placeholder="Nama PIC internal EFM"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Hasil Konsultasi *</label>
              <select value={form.hasilKonsultasi} onChange={e => setForm(p => ({ ...p, hasilKonsultasi: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                <option>Pending</option>
                <option>Lanjut</option>
                <option>Tidak Lanjut</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Catatan Tambahan</label>
              <textarea value={form.catatan} onChange={e => setForm(p => ({ ...p, catatan: e.target.value }))}
                placeholder="Catatan khusus, permintaan klien, hal yang perlu diperhatikan..." rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
            </div>
          </div>
        </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg px-6 py-4 z-20">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/event/konsultasi")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1E1C43] transition">
            <ArrowLeft size={15} /> Kembali
          </button>
          <div className="flex items-center gap-3">
            <button className="bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition">
              Simpan Draft
            </button>
            <button className="bg-[#1E1C43] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#2d2b5e] transition">
              Simpan & Selesai
            </button>
            {form.hasilKonsultasi === "Lanjut" && (
              <button onClick={() => navigate(`/event/orders/new?konsultasiId=${id || "new"}&leadId=${leadId || ""}`)}
                className="bg-[#E05945] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#c94a38] transition">
                Simpan & Buat Order →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
