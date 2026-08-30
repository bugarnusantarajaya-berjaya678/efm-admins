import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Plus, Trash2, Save } from 'lucide-react'
import { initLeads, getStoredLeads, LEADS_INIT } from '../../data/eventLeadsStore'

/* ═══════════════════════════════════════
   Dummy Konsultasi Data
═══════════════════════════════════════ */
const dummyKonsultasiData = [
  {
    id: 'KNS-26-0001', leadId: 'EL-0001', tanggal: '2026-06-05', status: 'Selesai',
    namaKlien: 'Yayasan Kanker Indonesia', tipeKlien: 'Foundation',
    namaEvent: 'Health Run for Hope 2026', jenisEvent: 'Charity Run',
    peranEFM: 'Main Organizer', estimasiPeserta: '2.000 orang',
    kota: 'Jakarta Selatan', emailUmum: 'info@yayasankanker.or.id', teleponUmum: '021-3334567',
    alamatLengkap: 'Jl. Gatot Subroto No. 55, Jakarta Selatan',
    namaKoordinator: 'Ibu Ratna', jabatanKoordinator: 'Program Director',
    waKoordinator: '081234567890', emailKoordinator: 'ratna@yayasankanker.or.id',
    picSalesEFM: 'Bagoes', programUsulan: 'Main Organizer – Health Run for Hope 2026',
    catatanKonsultasi: 'Event skala besar, estimasi 2.000 peserta. Venue GBK sudah dikonfirmasi.',
  },
  {
    id: 'KNS-26-0002', leadId: 'EL-0002', tanggal: '2026-06-08', status: 'Selesai',
    namaKlien: 'PT. Garuda Nusa Tbk', tipeKlien: 'Corporate',
    namaEvent: 'Corporate Fun Run 2026', jenisEvent: 'Fun Run',
    peranEFM: 'Co-Organizer', estimasiPeserta: '500 orang',
    kota: 'Jakarta Pusat', emailUmum: 'hrd@garudanusa.co.id', teleponUmum: '021-5557890',
    alamatLengkap: 'Jl. Jend. Sudirman Kav. 56, Jakarta Pusat',
    namaKoordinator: 'Bpk. Hendra', jabatanKoordinator: 'HR Director',
    waKoordinator: '082112345678', emailKoordinator: 'hendra.hr@garudanusa.co.id',
    picSalesEFM: 'Emma', programUsulan: 'Co-Organizer – Corporate Fun Run 2026',
    catatanKonsultasi: 'Event internal perusahaan untuk 500 karyawan. Budget sudah disetujui direksi.',
  },
  {
    id: 'KNS-26-0003', leadId: 'EL-0003', tanggal: '2026-06-10', status: 'Pending',
    namaKlien: 'Brand Tropicana Slim', tipeKlien: 'Brand',
    namaEvent: 'Healthy Living Expo', jenisEvent: 'Exhibition',
    peranEFM: 'Fitness Consultant', estimasiPeserta: '1.500 pengunjung',
    kota: 'Tangerang Selatan', emailUmum: 'marketing@tropicanaslim.co.id', teleponUmum: '021-6667890',
    alamatLengkap: 'Kawasan ICE BSD City, Tangerang Selatan',
    namaKoordinator: 'Bpk. Dani', jabatanKoordinator: 'Brand Manager',
    waKoordinator: '081398765432', emailKoordinator: 'dani@tropicanaslim.co.id',
    picSalesEFM: 'Bagoes', programUsulan: 'Fitness Consultant – Healthy Living Expo',
    catatanKonsultasi: 'Expo 3 hari, stand fitness demo dibutuhkan. Masih menunggu approval anggaran.',
  },
  {
    id: 'KNS-26-0005', leadId: 'EL-0005', tanggal: '2026-06-18', status: 'Selesai',
    namaKlien: 'Dinas Pemuda & Olahraga DKI', tipeKlien: 'Government',
    namaEvent: 'Hari Olahraga Nasional DKI', jenisEvent: 'Mass Event',
    peranEFM: 'Main Organizer', estimasiPeserta: '5.000 orang',
    kota: 'Jakarta Pusat', emailUmum: 'info@dinpora.jakarta.go.id', teleponUmum: '021-3451234',
    alamatLengkap: 'Jl. Medan Merdeka Utara No. 14, Jakarta Pusat',
    namaKoordinator: 'Bpk. Eko Prasetyo', jabatanKoordinator: 'Kepala Bidang Olahraga',
    waKoordinator: '087865432100', emailKoordinator: 'eko.prasetyo@dinpora.jakarta.go.id',
    picSalesEFM: 'Bagoes', programUsulan: 'Main Organizer – Hari Olahraga Nasional DKI',
    catatanKonsultasi: 'Event resmi pemerintah provinsi, ribuan peserta. Proses tender APBD.',
  },
]

/* ═══════════════════════════════════════
   Available Leads (untuk dropdown order manual)
═══════════════════════════════════════ */
const availableLeadsForOrder = [
  {
    id: 'EL-0001', namaKlien: 'Yayasan Kanker Indonesia', tipeKlien: 'Foundation', kota: 'Jakarta Selatan',
    emailUmum: 'info@yayasankanker.or.id', teleponUmum: '021-3334567',
    alamatLengkap: 'Jl. Gatot Subroto No. 55, Jakarta Selatan',
    namaKoordinator: 'Ibu Ratna', jabatanKoordinator: 'Program Director',
    waKoordinator: '081234567890', emailKoordinator: 'ratna@yayasankanker.or.id',
    picSalesEFM: 'Bagoes', stage: 'Converted',
  },
  {
    id: 'EL-0002', namaKlien: 'PT. Garuda Nusa Tbk', tipeKlien: 'Corporate', kota: 'Jakarta Pusat',
    emailUmum: 'hrd@garudanusa.co.id', teleponUmum: '021-5557890',
    alamatLengkap: 'Jl. Jend. Sudirman Kav. 56, Jakarta Pusat',
    namaKoordinator: 'Bpk. Hendra', jabatanKoordinator: 'HR Director',
    waKoordinator: '082112345678', emailKoordinator: 'hendra.hr@garudanusa.co.id',
    picSalesEFM: 'Emma', stage: 'Converted',
  },
  {
    id: 'EL-0005', namaKlien: 'Dinas Pemuda & Olahraga DKI', tipeKlien: 'Government', kota: 'Jakarta Pusat',
    emailUmum: 'info@dinpora.jakarta.go.id', teleponUmum: '021-3451234',
    alamatLengkap: 'Jl. Medan Merdeka Utara No. 14, Jakarta Pusat',
    namaKoordinator: 'Bpk. Eko Prasetyo', jabatanKoordinator: 'Kepala Bidang Olahraga',
    waKoordinator: '087865432100', emailKoordinator: 'eko.prasetyo@dinpora.jakarta.go.id',
    picSalesEFM: 'Bagoes', stage: 'Qualified',
  },
  {
    id: 'EL-0006', namaKlien: 'Brand Tropicana Slim', tipeKlien: 'Brand', kota: 'Tangerang Selatan',
    emailUmum: 'marketing@tropicanaslim.co.id', teleponUmum: '021-6667890',
    alamatLengkap: 'Kawasan ICE BSD City, Tangerang Selatan',
    namaKoordinator: 'Bpk. Dani', jabatanKoordinator: 'Brand Manager',
    waKoordinator: '081398765432', emailKoordinator: 'dani@tropicanaslim.co.id',
    picSalesEFM: 'Bagoes', stage: 'Contacted',
  },
]

/* ═══════════════════════════════════════
   ReadOnlyField component
═══════════════════════════════════════ */
function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </label>
      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 min-h-[36px] flex items-center">
        {value || <span className="text-gray-300 italic">—</span>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   Helpers
═══════════════════════════════════════ */
function hitungTotal(jumlah, rate) {
  return (parseFloat(jumlah) || 0) * (parseFloat(rate) || 0)
}

function fmtRp(n) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0)
}

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
export default function EventOrderNewPage() {
  const navigate = useNavigate()
  const location = useLocation()

  /* ── From Quotation state (navigate state, passed by EventQuotationDetailPage) ── */
  const qState = location.state?.fromQuotation ? location.state : null
  const quotationId    = qState?.quotationId   || ''
  const quotationLeadId = qState?.leadId        || ''
  const isFromQuotation = !!quotationId

  /* ── Source tracking ── */
  const [konsultasiId,       setKonsultasiId]       = useState('')
  const [leadId,             setLeadId]             = useState('')
  const [konsultasiDetailData, setKonsultasiDetailData] = useState(null)
  const [toast,      setToast]      = useState(null)

  /* ── Lead selector (order manual) ── */
  const [linkedLeadId,    setLinkedLeadId]    = useState('')
  const [leadSearchQuery, setLeadSearchQuery] = useState('')
  const [showLeadDropdown, setShowLeadDropdown] = useState(false)

  /* ── Data Klien (selalu read-only) ── */
  const [clientData, setClientData] = useState({
    namaKlien: '', tipeKlien: '', kota: '', emailUmum: '', teleponUmum: '',
    alamatLengkap: '', namaKoordinator: '', jabatanKoordinator: '',
    waKoordinator: '', emailKoordinator: '', picSalesEFM: '',
  })

  /* ── Detail Order (editable) ── */
  const [orderData, setOrderData] = useState({
    programNama: '', periodeAwal: '', periodeAkhir: '',
    nilaiKontrak: '', picEFMOps: '', catatan: '',
  })

  /* ── Kategori Layanan ── */
  const [kategori, setKategori] = useState([])
  function toggleKategori(key) {
    setKategori(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key])
  }

  /* ── Rincian Layanan (line items) ── */
  const [rincianLayanan, setRincianLayanan] = useState([
    { id: 1, item: '', satuan: 'Bulan', jumlah: '1', rateUnit: '', total: 0 },
  ])

  /* ── Parse URL params & auto-populate dari konsultasi ── */
  useEffect(() => {
    /* ── Branch A: dari Quotation (navigate state) ── */
    if (isFromQuotation && qState) {
      initLeads(LEADS_INIT)
      const lead = getStoredLeads().find(l => l.id === quotationLeadId)
      if (lead) {
        setClientData({
          namaKlien:          lead.namaKlien          || qState.namaKlien || '',
          tipeKlien:          lead.tipeKlien          || '',
          kota:               lead.kota               || '',
          emailUmum:          lead.emailUmum          || '',
          teleponUmum:        lead.teleponUmum        || '',
          alamatLengkap:      lead.alamatLengkap      || '',
          namaKoordinator:    lead.namaKoordinator    || '',
          jabatanKoordinator: lead.jabatanKoordinator || '',
          waKoordinator:      lead.waKoordinator      || '',
          emailKoordinator:   lead.emailKoordinator   || '',
          picSalesEFM:        lead.picSalesEFM        || '',
        })
      } else {
        // fallback: hanya namaKlien dari state
        setClientData(prev => ({ ...prev, namaKlien: qState.namaKlien || '' }))
      }
      const eventName = qState.namaEvent || ''
      const nilaiQ    = qState.nilaiQuotation || 0
      setOrderData(prev => ({ ...prev, programNama: eventName }))
      setRincianLayanan([
        { id: 1, item: eventName, satuan: 'Paket', jumlah: '1', rateUnit: String(nilaiQ), total: nilaiQ },
      ])
      return
    }

    /* ── Branch B: dari URL params (konsultasi flow lama) ── */
    const params = new URLSearchParams(window.location.search)
    const svId   = params.get('konsultasiId')
    const ldId   = params.get('leadId')

    if (svId) {
      setKonsultasiId(svId)
      const found = dummyKonsultasiData.find(s => s.id === svId)
      if (found) {
        setKonsultasiDetailData(found)
        setClientData({
          namaKlien:          found.namaKlien          || '',
          tipeKlien:          found.tipeKlien          || '',
          kota:               found.kota               || '',
          emailUmum:          found.emailUmum          || '',
          teleponUmum:        found.teleponUmum        || '',
          alamatLengkap:      found.alamatLengkap      || '',
          namaKoordinator:    found.namaKoordinator    || '',
          jabatanKoordinator: found.jabatanKoordinator || '',
          waKoordinator:      found.waKoordinator      || '',
          emailKoordinator:   found.emailKoordinator   || '',
          picSalesEFM:        found.picSalesEFM        || '',
        })
        if (found.programUsulan) {
          setOrderData(prev => ({ ...prev, programNama: found.programUsulan }))
          setRincianLayanan([
            { id: 1, item: found.programUsulan, satuan: 'Paket', jumlah: '1', rateUnit: '', total: 0 },
          ])
        }
      }
    }
    if (ldId) setLeadId(ldId)
  }, [])

  /* ── Close lead dropdown saat klik di luar ── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.lead-selector-wrapper')) {
        setShowLeadDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* ── Subtotal auto-calculate ── */
  const subtotal = rincianLayanan.reduce(
    (sum, row) => sum + hitungTotal(row.jumlah, row.rateUnit), 0
  )

  useEffect(() => {
    setOrderData(prev => ({ ...prev, nilaiKontrak: subtotal.toString() }))
  }, [subtotal])

  /* ── Source flags ── */
  const isFromKonsultasi = !!konsultasiId

  /* ── Lead link/unlink ── */
  function handleLinkLead(lead) {
    setLinkedLeadId(lead.id)
    setClientData({
      namaKlien:          lead.namaKlien          || '',
      tipeKlien:          lead.tipeKlien          || '',
      kota:               lead.kota               || '',
      emailUmum:          lead.emailUmum          || '',
      teleponUmum:        lead.teleponUmum        || '',
      alamatLengkap:      lead.alamatLengkap      || '',
      namaKoordinator:    lead.namaKoordinator    || '',
      jabatanKoordinator: lead.jabatanKoordinator || '',
      waKoordinator:      lead.waKoordinator      || '',
      emailKoordinator:   lead.emailKoordinator   || '',
      picSalesEFM:        lead.picSalesEFM        || '',
    })
    setShowLeadDropdown(false)
    setLeadSearchQuery('')
  }

  function handleUnlinkLead() {
    setLinkedLeadId('')
    setClientData({
      namaKlien: '', tipeKlien: '', kota: '',
      emailUmum: '', teleponUmum: '', alamatLengkap: '',
      namaKoordinator: '', jabatanKoordinator: '',
      waKoordinator: '', emailKoordinator: '', picSalesEFM: '',
    })
  }

  /* ── Rincian layanan helpers ── */
  function updateRincian(id, field, val) {
    setRincianLayanan(prev => prev.map(row =>
      row.id === id
        ? { ...row, [field]: val, total: hitungTotal(field === 'jumlah' ? val : row.jumlah, field === 'rateUnit' ? val : row.rateUnit) }
        : row
    ))
  }
  function tambahItem() {
    setRincianLayanan(prev => [...prev, { id: Date.now(), item: '', satuan: 'Bulan', jumlah: '1', rateUnit: '', total: 0 }])
  }
  function hapusItem(id) {
    setRincianLayanan(prev => prev.filter(row => row.id !== id))
  }

  function showToastMsg(msg) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  /* ── Footer handlers ── */
  function handleSimpanDraft() {
    showToastMsg('Draft order tersimpan.')
  }

  function handleSimpanOrder() {
    if (!isFromKonsultasi && !isFromQuotation && !linkedLeadId) {
      alert('Pilih lead terlebih dahulu untuk mengisi data klien.')
      return
    }
    if (!orderData.programNama || !orderData.periodeAwal || !orderData.periodeAkhir) {
      alert('Lengkapi: Nama Program, Tanggal Mulai, dan Tanggal Selesai.')
      return
    }
    if (kategori.length === 0) {
      alert('Pilih minimal satu Kategori Layanan.')
      return
    }
    const newOrderId = 'EO-' + String(Date.now()).slice(-4)
    navigate('/event/orders/' + newOrderId)
  }

  /* ── Filtered leads for dropdown ── */
  const filteredLeads = availableLeadsForOrder.filter(l =>
    l.namaKlien.toLowerCase().includes(leadSearchQuery.toLowerCase())
  )

  return (
    <div className="pb-24">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#1E1C43] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-4 px-4 sm:px-6 py-4 sm:py-6">

        {/* ── Header Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
                <Save size={18} className="text-white" />
              </div>
              <div>
                <nav className="flex items-center gap-1 text-[10px] text-gray-400 mb-0.5">
                  <button onClick={() => navigate('/event/orders')} className="hover:text-[#1E1C43] transition-colors">B2B Event</button>
                  <ChevronRight size={10} className="text-gray-300" />
                  <button onClick={() => navigate('/event/orders')} className="hover:text-[#1E1C43] transition-colors">Orders</button>
                  <ChevronRight size={10} className="text-gray-300" />
                  <span className="text-[#1E1C43] font-medium">Order Baru</span>
                </nav>
                <h1 className="text-base font-bold text-[#1E1C43] leading-tight">
                  {clientData.namaKlien || 'Order Baru'}
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isFromQuotation
                    ? `Dari Quotation #${quotationId} · ${clientData.tipeKlien || ''}`
                    : isFromKonsultasi
                      ? `Dari Konsultasi #${konsultasiId} · ${clientData.tipeKlien || ''}`
                      : linkedLeadId
                        ? `Lead ${linkedLeadId} · ${clientData.tipeKlien || ''}`
                        : 'Pilih lead event untuk memulai'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/event/orders')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors shrink-0"
            >
              <ArrowLeft size={12} /> Kembali
            </button>
          </div>
        </div>

        {/* ── BANNER: dari quotation ── */}
        {isFromQuotation && (
          <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3">
            <span className="text-purple-600 mt-0.5">📋</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-purple-800">
                Dibuat dari Quotation #{quotationId}
                {quotationLeadId && <span className="text-purple-500 font-normal"> · Lead {quotationLeadId}</span>}
              </p>
              <p className="text-[11px] text-purple-600 mt-0.5">
                Data klien &amp; nilai order diambil dari quotation yang disetujui
              </p>
            </div>
            <button
              onClick={() => navigate(`/event/quotation/${quotationId}`)}
              className="text-[11px] text-purple-700 underline hover:no-underline shrink-0 mt-0.5"
            >
              Lihat
            </button>
          </div>
        )}

        {/* ── BANNER: dari konsultasi ── */}
        {isFromKonsultasi && (
          <div className="flex items-start gap-3 bg-[#1E1C43]/5 border border-[#1E1C43]/15 rounded-2xl px-4 py-3">
            <span className="text-[#1E1C43] mt-0.5">🔗</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1E1C43]">
                Terhubung ke Konsultasi #{konsultasiId}
                {leadId && <span className="text-gray-400 font-normal"> · Lead {leadId}</span>}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Data klien diambil dari hasil konsultasi</p>
            </div>
            <button
              onClick={() => navigate(`/event/konsultasi/${konsultasiId}`)}
              className="text-[11px] text-[#1E1C43] underline hover:no-underline shrink-0 mt-0.5"
            >
              Lihat
            </button>
          </div>
        )}

        {/* ── LEAD SELECTOR (order manual) ── */}
        {!isFromKonsultasi && !isFromQuotation && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Kaitkan Lead Event</h3>
            </div>
            <p className="text-xs text-gray-400 mb-3">Pilih data klien dari daftar leads yang tersedia</p>

            {!linkedLeadId ? (
              <div className="relative lead-selector-wrapper">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#1E1C43]"
                    placeholder="Cari nama perusahaan..."
                    value={leadSearchQuery}
                    onChange={e => { setLeadSearchQuery(e.target.value); setShowLeadDropdown(true) }}
                    onFocus={() => setShowLeadDropdown(true)}
                  />
                </div>
                {showLeadDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-52 overflow-y-auto">
                    {filteredLeads.map(lead => (
                      <button
                        key={lead.id}
                        onClick={() => handleLinkLead(lead)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{lead.namaKlien}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{lead.tipeKlien} · {lead.kota}</p>
                          </div>
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                            {lead.stage}
                          </span>
                        </div>
                      </button>
                    ))}
                    {filteredLeads.length === 0 && (
                      <div className="px-4 py-3 text-xs text-gray-400 italic text-center">Tidak ada leads ditemukan</div>
                    )}
                  </div>
                )}
              </div>
            ) : (() => {
              const linked = availableLeadsForOrder.find(l => l.id === linkedLeadId)
              return linked ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-green-800 truncate">✅ {linked.namaKlien}</p>
                    <p className="text-xs text-green-600 mt-0.5">{linked.tipeKlien} · {linked.id}</p>
                  </div>
                  <button onClick={handleUnlinkLead} className="text-xs text-gray-400 hover:text-red-500 shrink-0 border border-gray-200 bg-white rounded-lg px-2.5 py-1">
                    × Ganti
                  </button>
                </div>
              ) : null
            })()}
          </div>
        )}

        {/* ── SECTION: Data Klien + Detail Order ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

          {/* Sub-bagian A: Data Klien */}
          <div className="flex items-start justify-between gap-2 mb-4 flex-wrap">
            <div>
              <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Data Klien</h3>
              <p className="text-xs text-gray-400 mt-1 pl-0">
                {isFromQuotation
                  ? `Quotation #${quotationId} · Lead ${quotationLeadId}`
                  : isFromKonsultasi
                    ? `Konsultasi #${konsultasiId}`
                    : linkedLeadId
                      ? `Lead ${linkedLeadId}`
                      : 'Pilih lead di atas untuk mengisi data klien'}
              </p>
            </div>
            {(isFromKonsultasi || isFromQuotation || linkedLeadId) && (
              <span className={`text-[10px] px-2 py-1 rounded-full font-medium shrink-0 ${
                isFromQuotation ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                Auto-filled · Read-only
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <ReadOnlyField label="Nama Klien / Penyelenggara" value={clientData.namaKlien} />
            </div>
            <ReadOnlyField label="Tipe Klien"  value={clientData.tipeKlien} />
            <ReadOnlyField label="Kota / Area" value={clientData.kota} />
            <ReadOnlyField label="Email Umum"       value={clientData.emailUmum} />
            <ReadOnlyField label="No. Telepon Umum" value={clientData.teleponUmum} />
            <div className="sm:col-span-2">
              <ReadOnlyField label="Alamat Lengkap" value={clientData.alamatLengkap} />
            </div>

            <p className="sm:col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2">
              Koordinator / PIC Klien
            </p>
            <ReadOnlyField label="Nama Koordinator" value={clientData.namaKoordinator} />
            <ReadOnlyField label="Jabatan"          value={clientData.jabatanKoordinator} />
            <ReadOnlyField label="No. WA Koordinator" value={clientData.waKoordinator} />
            <ReadOnlyField label="Email Koordinator"  value={clientData.emailKoordinator} />
            <ReadOnlyField label="PIC Sales EFM"      value={clientData.picSalesEFM} />
          </div>

          {/* Sub-bagian B: Detail Order */}
          <hr className="border-gray-100 my-5" />
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Detail Order</h3>

          <div className="space-y-3">

            {/* Nama Program */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Nama Program<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                value={orderData.programNama}
                onChange={e => setOrderData(p => ({ ...p, programNama: e.target.value }))}
                placeholder="Corporate Wellness — Yoga & Functional Training"
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43]"
              />
            </div>

            {/* Kategori Layanan */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Kategori Layanan<span className="text-red-500 ml-0.5">*</span>
                <span className="ml-1.5 text-gray-300 font-normal normal-case">Pilih satu atau lebih</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { key: 'kat1', label: 'Kat 1 — Instruktur / Trainer', desc: 'Instruktur/trainer untuk kelas atau program olahraga', color: '#1E1C43' },
                  { key: 'kat2', label: 'Kat 2 — Expert / Speaker',     desc: 'Narasumber, dokter, konsultan wellness, tenaga ahli',   color: '#2980B9' },
                  { key: 'kat3', label: 'Kat 3 — Event Solution (EO)',   desc: 'EO mitra penyelenggara keseluruhan event',              color: '#E05945' },
                ].map(({ key, label, desc, color }) => {
                  const checked = kategori.includes(key)
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleKategori(key)}
                      className={[
                        'text-left p-3 rounded-xl border-2 transition-all duration-150',
                        checked
                          ? 'border-[' + color + '] bg-[' + color + ']/5'
                          : 'border-gray-200 bg-white hover:border-gray-300',
                      ].join(' ')}
                    >
                      <div className="flex items-start gap-2">
                        <div className={[
                          'mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                          checked ? 'border-[' + color + '] bg-[' + color + ']' : 'border-gray-300',
                        ].join(' ')}>
                          {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <div>
                          <p className={['text-[11px] font-semibold leading-tight', checked ? 'text-[' + color + ']' : 'text-gray-700'].join(' ')}>{label}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{desc}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Periode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Periode Awal<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  value={orderData.periodeAwal}
                  onChange={e => setOrderData(p => ({ ...p, periodeAwal: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Periode Akhir<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  value={orderData.periodeAkhir}
                  onChange={e => setOrderData(p => ({ ...p, periodeAkhir: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43]"
                />
              </div>
            </div>

            {/* PIC Ops + Nilai Kontrak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  PIC Operasional EFM
                </label>
                <select
                  value={orderData.picEFMOps}
                  onChange={e => setOrderData(p => ({ ...p, picEFMOps: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1E1C43]"
                >
                  <option value="">-- Pilih PIC --</option>
                  <option>Bagoes</option><option>Emma</option><option>Lainnya</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">PIC yang handle operasional program ini</p>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Nilai Kontrak (Rp)
                </label>
                <div className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 flex items-center font-medium min-h-[42px]">
                  {subtotal > 0 ? fmtRp(subtotal) : <span className="text-gray-400 italic text-xs">Auto dari rincian layanan</span>}
                </div>
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Catatan Order
              </label>
              <textarea
                value={orderData.catatan}
                onChange={e => setOrderData(p => ({ ...p, catatan: e.target.value }))}
                rows={3}
                placeholder="Catatan tambahan, instruksi khusus, atau informasi penting..."
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43] resize-none"
              />
            </div>

          </div>
        </div>

        {/* ── SECTION: Rincian Layanan ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Rincian Layanan</h3>

          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 600 }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Item Layanan', 'Satuan', 'Jumlah', 'Rate / Unit (Rp)', 'Total', ''].map(h => (
                    <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-2.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rincianLayanan.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100">
                    <td className="px-3 py-2.5">
                      <input
                        value={row.item}
                        onChange={e => updateRincian(row.id, 'item', e.target.value)}
                        placeholder="Nama layanan / item..."
                        className="w-full min-w-[160px] border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E1C43]"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={row.satuan}
                        onChange={e => updateRincian(row.id, 'satuan', e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E1C43] min-w-[80px]"
                      >
                        <option>Bulan</option><option>Sesi</option><option>Paket</option>
                        <option>Orang</option><option>Kelas</option><option>Unit</option>
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        value={row.jumlah}
                        onChange={e => updateRincian(row.id, 'jumlah', e.target.value)}
                        placeholder="0"
                        className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#1E1C43]"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        value={row.rateUnit}
                        onChange={e => updateRincian(row.id, 'rateUnit', e.target.value)}
                        placeholder="0"
                        className="w-28 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#1E1C43]"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-xs font-medium text-gray-800 whitespace-nowrap text-right">
                      {fmtRp(hitungTotal(row.jumlah, row.rateUnit))}
                    </td>
                    <td className="px-3 py-2.5">
                      {rincianLayanan.length > 1 && (
                        <button type="button" onClick={() => hapusItem(row.id)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={tambahItem}
            className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#1E1C43] hover:text-[#1E1C43] text-xs font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={13} /> Tambah Item
          </button>

          <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
            <div className="text-right">
              <p className="text-xs text-gray-400">Subtotal (Nilai Kontrak)</p>
              <p className="text-xl font-bold text-[#1E1C43] mt-0.5">{fmtRp(subtotal)}</p>
            </div>
          </div>
        </div>

        {/* ── Konsultasi context card ── */}
        {konsultasiDetailData && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">
              Info dari Konsultasi #{konsultasiId}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Nama Event</p>
                <p className="text-sm font-semibold text-gray-800">{konsultasiDetailData.namaEvent || '—'} · {konsultasiDetailData.jenisEvent || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Peran EFM & Peserta</p>
                <p className="text-sm font-semibold text-gray-800">{konsultasiDetailData.peranEFM || '—'} · Est. {konsultasiDetailData.estimasiPeserta || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Lokasi Event</p>
                <p className="text-sm font-semibold text-gray-800">{konsultasiDetailData.kota || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Catatan Konsultasi</p>
                <p className="text-sm font-semibold text-gray-800">{konsultasiDetailData.catatanKonsultasi || '—'}</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Fixed Footer (sidebar-aware) ── */}
      <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 z-40 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="hidden sm:block min-w-0">
            <p className="text-sm text-gray-700 font-semibold truncate">
              {clientData.namaKlien || 'Order Baru'}
            </p>
            {subtotal > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                Total: <span className="font-semibold text-[#1E1C43]">{fmtRp(subtotal)}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => navigate(-1)}
              className="px-3.5 py-2 text-sm text-gray-500 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSimpanDraft}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-sm border border-[#1E1C43] text-[#1E1C43] rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Save size={13} /> Draft
            </button>
            <button
              onClick={handleSimpanOrder}
              className="px-4 sm:px-5 py-2 text-sm bg-[#1E1C43] text-white rounded-xl hover:bg-[#2d2b5e] font-semibold transition-colors"
            >
              Simpan & Buat Order →
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
