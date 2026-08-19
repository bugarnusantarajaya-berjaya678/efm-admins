import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Plus, Users, Activity, CheckCircle, XCircle, ChevronRight, ArrowLeft } from 'lucide-react'

const dummyEventLeads = [
  { id: "EL-001", namaKlien: "PT. Sinar Abadi", tipeKlien: "Corporate", namaEvent: "Fun Run Jakarta 2026", jenisEvent: "Corporate Event", picSalesEFM: "Ahmad Pratama", kota: "Jakarta", emailUmum: "info@sinarabadi.com", sumberLead: "Referral", stage: "Converted", tanggal: "2026-01-10", namaKoordinator: "Budi Santoso", jabatanKoordinator: "HR Manager", waKoordinator: "081234567801", logAktivitas: [{ tanggal: "2026-01-10", catatan: "Lead masuk via referral", stage: "New" }, { tanggal: "2026-01-15", catatan: "Presentasi awal via Zoom", stage: "Presentation" }, { tanggal: "2026-02-01", catatan: "Proposal dikirim", stage: "Proposal" }, { tanggal: "2026-02-10", catatan: "Deal closed, lanjut ke Orders", stage: "Converted" }] },
  { id: "EL-002", namaKlien: "Komunitas Sehat ID", tipeKlien: "Community", namaEvent: "Yoga Festival Senayan", jenisEvent: "Community Event", picSalesEFM: "Rina Indah", kota: "Jakarta", emailUmum: "komunitas@sehatid.com", sumberLead: "Instagram", stage: "Proposal", tanggal: "2026-02-05", namaKoordinator: "", jabatanKoordinator: "", waKoordinator: "", logAktivitas: [{ tanggal: "2026-02-05", catatan: "Lead masuk via Instagram", stage: "New" }, { tanggal: "2026-02-12", catatan: "Proposal dikirim via email", stage: "Proposal" }] },
  { id: "EL-003", namaKlien: "Kemenpora RI", tipeKlien: "Government", namaEvent: "HUT RI Fitness Challenge", jenisEvent: "Government Event", picSalesEFM: "Sarah Jenkins", kota: "Jakarta", emailUmum: "humas@kemenpora.go.id", sumberLead: "Cold Email", stage: "Closing", tanggal: "2026-02-20", namaKoordinator: "Drs. Hendra", jabatanKoordinator: "Kepala Bidang", waKoordinator: "081234567803", logAktivitas: [{ tanggal: "2026-02-20", catatan: "Cold email dibalas, tertarik", stage: "Approach" }] },
  { id: "EL-004", namaKlien: "CV. Maju Sejahtera", tipeKlien: "Corporate", namaEvent: "Employee Wellness Day", jenisEvent: "Corporate Event", picSalesEFM: "Marcus Chen", kota: "Tangerang", emailUmum: "info@majusejahtera.com", sumberLead: "Referral", stage: "Presentation", tanggal: "2026-03-01", namaKoordinator: "", jabatanKoordinator: "", waKoordinator: "", logAktivitas: [] },
  { id: "EL-005", namaKlien: "Pemkot Tangerang", tipeKlien: "Government", namaEvent: "Marathon Kota Tangerang", jenisEvent: "Government Event", picSalesEFM: "Budi Wijaya", kota: "Tangerang", emailUmum: "dispora@tangerangkota.go.id", sumberLead: "Google/Web", stage: "New", tanggal: "2026-03-10", namaKoordinator: "", jabatanKoordinator: "", waKoordinator: "", logAktivitas: [] },
  { id: "EL-006", namaKlien: "Keluarga Santoso", tipeKlien: "Private/Individual", namaEvent: "Private Fitness Retreat", jenisEvent: "Private Event", picSalesEFM: "Rina Indah", kota: "Bogor", emailUmum: "santoso.family@gmail.com", sumberLead: "Referral", stage: "Lost", tanggal: "2026-01-25", namaKoordinator: "Pak Santoso", jabatanKoordinator: "Owner", waKoordinator: "081234567806", logAktivitas: [{ tanggal: "2026-01-25", catatan: "Tidak cocok budget", stage: "Lost" }] },
]

const stages = ["New", "Approach", "Presentation", "Proposal", "Closing", "Converted", "Lost"]

const stageColor = (s) => {
  const map = { New: "bg-gray-100 text-gray-600", Approach: "bg-blue-100 text-blue-700", Presentation: "bg-purple-100 text-purple-700", Proposal: "bg-yellow-100 text-yellow-700", Closing: "bg-orange-100 text-orange-700", Converted: "bg-green-100 text-green-700", Lost: "bg-red-100 text-red-700" }
  return map[s] || "bg-gray-100 text-gray-500"
}

const stageDot = (s) => {
  const map = { Converted: "bg-green-500", Closing: "bg-orange-400", Proposal: "bg-yellow-400", Presentation: "bg-purple-400", Approach: "bg-blue-400", Lost: "bg-red-400", New: "bg-gray-400" }
  return map[s] || "bg-gray-400"
}

const stageText = (s) => {
  const map = { Converted: "text-green-700", Closing: "text-orange-600", Proposal: "text-yellow-700", Presentation: "text-purple-600", Approach: "text-blue-600", Lost: "text-red-600", New: "text-gray-600" }
  return map[s] || "text-gray-600"
}

const STAGE_OPTS       = ["Semua", ...stages]
const TIPE_KLIEN_OPTS  = ["Semua", "Corporate", "Brand", "Community", "Government", "Foundation", "Private/Individual"]
const JENIS_EVENT_OPTS = ["Semua", "Corporate Event", "Government Event", "Brand Event", "Community Event", "School Event", "Private Event", "Family Gathering", "Lainnya"]
const SUMBER_LEAD_OPTS = ["Semua", "Referral", "Cold Email", "Google/Web", "LinkedIn", "Instagram", "Walk-in", "Existing Client", "Lainnya"]

const initForm = { namaKlien: "", tipeKlien: "Corporate", namaEvent: "", jenisEvent: "Corporate Event", kota: "", emailUmum: "", sumberLead: "Referral", picSalesEFM: "", namaKoordinator: "", jabatanKoordinator: "", waKoordinator: "" }

const selectCls = "border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#1E1C43] bg-white"
const inputCls  = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]"

export default function EventLeadsPage() {
  const navigate = useNavigate()
  const [leads, setLeads]               = useState(dummyEventLeads)
  const [filterStage, setFilterStage]   = useState("Semua")
  const [filterTipe, setFilterTipe]     = useState("Semua")
  const [filterJenis, setFilterJenis]   = useState("Semua")
  const [filterSumber, setFilterSumber] = useState("Semua")
  const [search, setSearch]             = useState("")
  const [selectedLead, setSelectedLead] = useState(null)
  const [showModal, setShowModal]       = useState(false)
  const [showTambahModal, setShowTambahModal] = useState(false)
  const [showUpdateForm, setShowUpdateForm]   = useState(false)
  const [newStage, setNewStage]               = useState("")
  const [newStageDate, setNewStageDate]       = useState("")
  const [newStageCatatan, setNewStageCatatan] = useState("")
  const [form, setForm] = useState(initForm)

  const filtered = leads.filter(l => {
    if (filterStage  !== "Semua" && l.stage      !== filterStage)  return false
    if (filterTipe   !== "Semua" && l.tipeKlien  !== filterTipe)   return false
    if (filterJenis  !== "Semua" && l.jenisEvent !== filterJenis)  return false
    if (filterSumber !== "Semua" && l.sumberLead !== filterSumber) return false
    if (search && !l.namaKlien.toLowerCase().includes(search.toLowerCase()) && !l.namaEvent.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function openModal(lead) {
    setSelectedLead(lead)
    setShowUpdateForm(false)
    setNewStage(lead.stage)
    setNewStageDate(new Date().toISOString().split("T")[0])
    setNewStageCatatan("")
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setShowUpdateForm(false)
  }

  function handleSimpanUpdate() {
    if (!newStage) return
    const updatedLeads = leads.map(l => {
      if (l.id !== selectedLead.id) return l
      return {
        ...l,
        stage: newStage,
        logAktivitas: [
          { tanggal: newStageDate || new Date().toISOString().split("T")[0], catatan: newStageCatatan || `Stage diubah ke ${newStage}`, stage: newStage },
          ...l.logAktivitas,
        ],
      }
    })
    setLeads(updatedLeads)
    setSelectedLead(updatedLeads.find(l => l.id === selectedLead.id))
    setShowUpdateForm(false)
    setNewStage("")
    setNewStageDate("")
    setNewStageCatatan("")
  }

  function handleTambahLead() {
    if (!form.namaKlien || !form.namaEvent || !form.emailUmum) return
    const newLead = {
      ...form,
      id: `EL-${String(leads.length + 1).padStart(3, "0")}`,
      stage: "New",
      tanggal: new Date().toISOString().split("T")[0],
      logAktivitas: [{ tanggal: new Date().toISOString().split("T")[0], catatan: "Lead baru ditambahkan", stage: "New" }],
    }
    setLeads([...leads, newLead])
    setShowTambahModal(false)
    setForm(initForm)
  }

  function formatWA(wa) { return wa.replace(/^0/, "62").replace(/\D/g, "") }

  return (
    <div className="p-6 bg-[#F5F5F7] min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1C43]">Event Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola prospek dan pipeline event EFM</p>
        </div>
        <button onClick={() => setShowTambahModal(true)}
          className="flex items-center gap-2 bg-[#1E1C43] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2d2b5e] transition">
          <Plus size={16} /> Tambah Lead
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1E1C43]/10">
            <Users size={18} className="text-[#1E1C43]" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Leads</p>
            <p className="text-2xl font-bold text-[#1E1C43]">{leads.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50">
            <Activity size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-2xl font-bold text-[#1E1C43]">{leads.filter(l => !["Converted","Lost"].includes(l.stage)).length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-50">
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Converted</p>
            <p className="text-2xl font-bold text-[#1E1C43]">{leads.filter(l => l.stage === "Converted").length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50">
            <XCircle size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Lost</p>
            <p className="text-2xl font-bold text-[#1E1C43]">{leads.filter(l => l.stage === "Lost").length}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex gap-3 mb-3">
          <select value={filterStage}  onChange={e => setFilterStage(e.target.value)}  className={`flex-1 ${selectCls}`}>{STAGE_OPTS.map(o => <option key={o}>{o}</option>)}</select>
          <select value={filterTipe}   onChange={e => setFilterTipe(e.target.value)}   className={`flex-1 ${selectCls}`}>{TIPE_KLIEN_OPTS.map(o => <option key={o}>{o}</option>)}</select>
          <select value={filterJenis}  onChange={e => setFilterJenis(e.target.value)}  className={`flex-1 ${selectCls}`}>{JENIS_EVENT_OPTS.map(o => <option key={o}>{o}</option>)}</select>
          <select value={filterSumber} onChange={e => setFilterSumber(e.target.value)} className={`flex-1 ${selectCls}`}>{SUMBER_LEAD_OPTS.map(o => <option key={o}>{o}</option>)}</select>
          <div className="w-[72px] flex-shrink-0" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama klien atau nama event..."
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
          </div>
          <button onClick={() => { setFilterStage("Semua"); setFilterTipe("Semua"); setFilterJenis("Semua"); setFilterSumber("Semua"); setSearch("") }}
            className="flex-shrink-0 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition">Reset</button>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 mb-3">{filtered.length} leads</p>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["ID","Nama Klien","Tipe","Nama Event","Jenis Event","PIC EFM","Stage","Tanggal","Aksi"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} onClick={() => openModal(lead)} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition">
                  <td className="px-4 py-4 text-xs font-mono text-gray-400 whitespace-nowrap">{lead.id}</td>
                  <td className="px-4 py-4 min-w-[140px] max-w-[160px]">
                    <p className="text-sm font-semibold text-gray-800 leading-snug">{lead.namaKlien}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{lead.kota}</p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-xs bg-[#1E1C43]/10 text-[#1E1C43] px-2.5 py-1 rounded-full font-medium">{lead.tipeKlien}</span>
                  </td>
                  <td className="px-4 py-4 max-w-[180px] truncate text-sm text-[#1E1C43] font-medium">{lead.namaEvent}</td>
                  <td className="px-4 py-4 text-xs text-gray-600 whitespace-nowrap">{lead.jenisEvent}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{lead.picSalesEFM}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${stageDot(lead.stage)}`} />
                      <span className={`text-xs font-semibold ${stageText(lead.stage)}`}>{lead.stage}</span>
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">{lead.tanggal}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                    {(lead.stage === "Presentation" || lead.stage === "Closing") && (
                      <button onClick={() => navigate(`/event/konsultasi/new?leadId=${lead.id}`)}
                        className="bg-[#1E1C43] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#2d2b5e] transition whitespace-nowrap">
                        Jadwalkan Konsultasi
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">Tidak ada lead yang cocok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: Detail Lead ── */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="relative p-5 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${stageColor(selectedLead.stage)}`}>{selectedLead.stage}</span>
                <span className="text-xs bg-[#1E1C43]/10 text-[#1E1C43] px-2.5 py-1 rounded-full font-medium">{selectedLead.tipeKlien}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800">{selectedLead.namaKlien}</h2>
              <p className="text-sm text-gray-500">{selectedLead.namaEvent} · {selectedLead.jenisEvent}</p>
              <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {/* Body — single scrollable */}
            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* BLOK 1 — Info Kontak Cepat */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">No. WA Koordinator</p>
                  <p className="text-sm font-mono text-gray-800">{selectedLead.waKoordinator || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email Umum</p>
                  <p className="text-sm text-gray-800 truncate">{selectedLead.emailUmum || "—"}</p>
                </div>
              </div>

              {/* BLOK 2 — Status Pipeline */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Status Pipeline</p>
                  <button onClick={() => setShowUpdateForm(v => !v)}
                    className="text-xs text-[#1E1C43] font-semibold hover:underline">
                    {showUpdateForm ? "✕ Batal" : "✏ Update Status"}
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${stageColor(selectedLead.stage)}`}>{selectedLead.stage}</span>
                  <span className="text-xs text-gray-400">sejak {selectedLead.tanggal}</span>
                </div>

                {showUpdateForm && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Stage Baru</label>
                        <select value={newStage} onChange={e => setNewStage(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]">
                          {stages.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Tanggal</label>
                        <input type="date" value={newStageDate} onChange={e => setNewStageDate(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]" />
                      </div>
                    </div>
                    <textarea value={newStageCatatan} onChange={e => setNewStageCatatan(e.target.value)}
                      placeholder="Catatan perubahan status..." rows={2}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
                    <button onClick={handleSimpanUpdate}
                      className="bg-[#1E1C43] text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-[#2d2b5e] transition">
                      Simpan
                    </button>
                  </div>
                )}
              </div>

              {/* BLOK 3 — Log Aktivitas */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Log Aktivitas</p>
                {selectedLead.logAktivitas.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-3">Belum ada aktivitas tercatat</p>
                ) : (
                  <div className="relative pl-4 space-y-4">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-100" />
                    {selectedLead.logAktivitas.map((log, idx) => (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full border-2 border-white ${stageDot(log.stage)}`} />
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-semibold text-gray-700">{log.stage} — {selectedLead.picSalesEFM}</span>
                          <span className="text-xs text-gray-400">{log.tanggal}</span>
                        </div>
                        <p className="text-sm text-gray-600">{log.catatan}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BLOK 4 — Data Lengkap */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Data Lengkap</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Nama Klien",   selectedLead.namaKlien],
                    ["Tipe Klien",   selectedLead.tipeKlien],
                    ["Nama Event",   selectedLead.namaEvent],
                    ["Jenis Event",  selectedLead.jenisEvent],
                    ["Kota",         selectedLead.kota],
                    ["Email Umum",   selectedLead.emailUmum],
                    ["Sumber Lead",  selectedLead.sumberLead],
                    ["PIC Sales EFM",selectedLead.picSalesEFM],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{k}</p>
                      <p className="text-sm font-medium text-gray-800">{v || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* BLOK 5 — Kontak Koordinator */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Kontak Koordinator</p>
                {selectedLead.namaKoordinator ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Nama</p>
                        <p className="text-sm font-medium text-gray-800">{selectedLead.namaKoordinator}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Jabatan</p>
                        <p className="text-sm font-medium text-gray-800">{selectedLead.jabatanKoordinator || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">No. WA</p>
                        <p className="text-sm font-medium text-gray-800">{selectedLead.waKoordinator || "—"}</p>
                      </div>
                      {selectedLead.waKoordinator && (
                        <a href={`https://wa.me/${formatWA(selectedLead.waKoordinator)}`} target="_blank" rel="noreferrer"
                          className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium mt-3 hover:bg-green-600 transition">
                          WA
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-xs text-blue-600">Belum diisi — akan dilengkapi seiring perkembangan hubungan dengan klien</p>
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-5 pt-0 border-t border-gray-100 flex gap-3">
              {(selectedLead.stage === "Presentation" || selectedLead.stage === "Closing") && (
                <button onClick={() => { closeModal(); navigate(`/event/konsultasi/new?leadId=${selectedLead.id}`) }}
                  className="flex-1 bg-[#E05945] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#c94a38] transition">
                  Jadwalkan Konsultasi →
                </button>
              )}
              <button onClick={closeModal}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Tambah Lead ── */}
      {showTambahModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800">Tambah Lead Baru</h3>
              <button onClick={() => { setShowTambahModal(false); setForm(initForm) }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <p className="text-xs font-bold text-gray-700 mb-3">Data Wajib</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Nama Klien *</label>
                    <input value={form.namaKlien} onChange={e => setForm(p => ({ ...p, namaKlien: e.target.value }))} placeholder="Nama perusahaan/individu/instansi" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Tipe Klien *</label>
                    <select value={form.tipeKlien} onChange={e => setForm(p => ({ ...p, tipeKlien: e.target.value }))} className={`w-full ${selectCls}`}>
                      {["Corporate","Brand","Community","Government","Foundation","Private/Individual"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Sumber Lead *</label>
                    <select value={form.sumberLead} onChange={e => setForm(p => ({ ...p, sumberLead: e.target.value }))} className={`w-full ${selectCls}`}>
                      {["Referral","Cold Email","Google/Web","LinkedIn","Instagram","Walk-in","Existing Client","Lainnya"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Nama Event *</label>
                    <input value={form.namaEvent} onChange={e => setForm(p => ({ ...p, namaEvent: e.target.value }))} placeholder="Nama event yang diminta" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Jenis Event *</label>
                    <select value={form.jenisEvent} onChange={e => setForm(p => ({ ...p, jenisEvent: e.target.value }))} className={`w-full ${selectCls}`}>
                      {["Corporate Event","Government Event","Brand Event","Community Event","School Event","Private Event","Family Gathering","Lainnya"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Kota *</label>
                    <input value={form.kota} onChange={e => setForm(p => ({ ...p, kota: e.target.value }))} placeholder="Jakarta, Tangerang, dll" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Email Umum *</label>
                    <input type="email" value={form.emailUmum} onChange={e => setForm(p => ({ ...p, emailUmum: e.target.value }))} placeholder="email@perusahaan.com" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">PIC Sales EFM *</label>
                    <input value={form.picSalesEFM} onChange={e => setForm(p => ({ ...p, picSalesEFM: e.target.value }))} placeholder="Nama PIC" className={inputCls} />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-700 mb-3">Kontak Koordinator <span className="text-gray-400 font-normal">(opsional)</span></p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Nama Koordinator</label>
                    <input value={form.namaKoordinator} onChange={e => setForm(p => ({ ...p, namaKoordinator: e.target.value }))} placeholder="Nama PIC klien" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Jabatan</label>
                    <input value={form.jabatanKoordinator} onChange={e => setForm(p => ({ ...p, jabatanKoordinator: e.target.value }))} placeholder="HR Manager, dll" className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">No. WhatsApp</label>
                    <input value={form.waKoordinator} onChange={e => setForm(p => ({ ...p, waKoordinator: e.target.value }))} placeholder="08xxxxxxxxxx" className={inputCls} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 pt-0">
              <button onClick={() => { setShowTambahModal(false); setForm(initForm) }}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleTambahLead} disabled={!form.namaKlien || !form.namaEvent || !form.emailUmum}
                className="flex-1 bg-[#1E1C43] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#2d2b5e] transition disabled:opacity-50 disabled:cursor-not-allowed">
                Simpan Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
