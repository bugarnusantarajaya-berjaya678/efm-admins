import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Plus, Trash2, Save } from 'lucide-react'
import { initLeads, getStoredLeads, LEADS_INIT } from '../../data/eventLeadsStore'

/* ═══════════════════════════════════════
   Dummy Konsultasi Data
═══════════════════════════════════════ */
const dummyKonsultasiData = [
  {
    id: 'KNS-001', leadId: 'EL-001', tanggal: '2026-06-05', status: 'Selesai',
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
    id: 'KNS-002', leadId: 'EL-002', tanggal: '2026-06-08', status: 'Selesai',
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
    id: 'KNS-003', leadId: 'EL-003', tanggal: '2026-06-10', status: 'Pending',
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
    id: 'KNS-005', leadId: 'EL-005', tanggal: '2026-06-18', status: 'Selesai',
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
    id: 'EL-001', namaKlien: 'Yayasan Kanker Indonesia', tipeKlien: 'Foundation', kota: 'Jakarta Selatan',
    emailUmum: 'info@yayasankanker.or.id', teleponUmum: '021-3334567',
    alamatLengkap: 'Jl. Gatot Subroto No. 55, Jakarta Selatan',
    namaKoordinator: 'Ibu Ratna', jabatanKoordinator: 'Program Director',
    waKoordinator: '081234567890', emailKoordinator: 'ratna@yayasankanker.or.id',
    picSalesEFM: 'Bagoes', stage: 'Converted',
  },
  {
    id: 'EL-002', namaKlien: 'PT. Garuda Nusa Tbk', tipeKlien: 'Corporate', kota: 'Jakarta Pusat',
    emailUmum: 'hrd@garudanusa.co.id', teleponUmum: '021-5557890',
    alamatLengkap: 'Jl. Jend. Sudirman Kav. 56, Jakarta Pusat',
    namaKoordinator: 'Bpk. Hendra', jabatanKoordinator: 'HR Director',
    waKoordinator: '082112345678', emailKoordinator: 'hendra.hr@garudanusa.co.id',
    picSalesEFM: 'Emma', stage: 'Converted',
  },
  {
    id: 'EL-005', namaKlien: 'Dinas Pemuda & Olahraga DKI', tipeKlien: 'Government', kota: 'Jakarta Pusat',
    emailUmum: 'info@dinpora.jakarta.go.id', teleponUmum: '021-3451234',
    alamatLengkap: 'Jl. Medan Merdeka Utara No. 14, Jakarta Pusat',
    namaKoordinator: 'Bpk. Eko Prasetyo', jabatanKoordinator: 'Kepala Bidang Olahraga',
    waKoordinator: '087865432100', emailKoordinator: 'eko.prasetyo@dinpora.jakarta.go.id',
    picSalesEFM: 'Bagoes', stage: 'Qualified',
  },
  {
    id: 'EL-006', namaKlien: 'Brand Tropicana Slim', tipeKlien: 'Brand', kota: 'Tangerang Selatan',
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
    alert('Draft order tersimpan.')
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
    const newOrderId = 'EO-' + String(Date.now()).slice(-4)
    navigate('/event/orders/' + newOrderId)
  }

  /* ── Filtered leads for dropdown ── */
  const filteredLeads = availableLeadsForOrder.filter(l =>
    l.namaKlien.toLowerCase().includes(leadSearchQuery.toLowerCase())
  )

  return (
    <div className="bg-[#F5F5F7] flex flex-col min-h-screen">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#1E1C43] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex-1 px-6 py-6">

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <nav className="flex items-center gap-1 text-xs text-gray-400">
              <button onClick={() => navigate('/event/orders')} className="hover:text-[#1E1C43] transition-colors">Event Management</button>
              <ChevronRight size={12} className="text-gray-300" />
              <button onClick={() => navigate('/event/orders')} className="hover:text-[#1E1C43] transition-colors">Orders</button>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="text-[#1E1C43] font-medium">Buat Order Baru</span>
            </nav>
            <button
              onClick={() => navigate('/event/orders')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft size={12} /> Kembali ke Orders
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E1C43]">
              {clientData.namaKlien || 'Order Baru'}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {isFromQuotation
                ? `Dibuat dari Quotation #${quotationId} · ${clientData.tipeKlien || ''}`
                : isFromKonsultasi
                  ? `Dibuat dari Konsultasi #${konsultasiId} · ${clientData.tipeKlien || ''}`
                  : linkedLeadId
                    ? `Terhubung ke Lead ${linkedLeadId} · ${clientData.tipeKlien || ''}`
                    : 'Pilih lead event untuk memulai'}
            </p>
          </div>
        </div>

        {/* ══════════════════════════
            BANNER: dari quotation
        ══════════════════════════ */}
        {isFromQuotation && (
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-6">
            <span className="text-purple-600">📋</span>
            <div className="flex-1">
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
              className="text-[11px] text-purple-700 underline hover:no-underline shrink-0"
            >
              Lihat Quotation
            </button>
          </div>
        )}

        {/* ══════════════════════════
            BANNER: dari konsultasi
        ══════════════════════════ */}
        {isFromKonsultasi && (
          <div className="flex items-center gap-3 bg-[#1E1C43]/5 border border-[#1E1C43]/15 rounded-xl px-4 py-3 mb-6">
            <span className="text-[#1E1C43]">🔗</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#1E1C43]">
                Terhubung ke Konsultasi #{konsultasiId}
                {leadId && <span className="text-gray-400 font-normal"> · Lead {leadId}</span>}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Data klien diambil dari hasil konsultasi
              </p>
            </div>
            <button
              onClick={() => navigate(`/event/konsultasi/${konsultasiId}`)}
              className="text-[11px] text-[#1E1C43] underline hover:no-underline"
            >
              Lihat Konsultasi
            </button>
          </div>
        )}

        {/* ══════════════════════════
            LEAD SELECTOR (order manual)
        ══════════════════════════ */}
        {!isFromKonsultasi && !isFromQuotation && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="mb-3">
              <p className="text-sm font-semibold text-[#1E1C43]">Kaitkan dengan Lead Event</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Pilih data klien dari daftar leads yang tersedia
              </p>
            </div>

            {/* Belum ada lead dipilih */}
            {!linkedLeadId && (
              <div className="relative lead-selector-wrapper">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                    placeholder="Cari nama perusahaan..."
                    value={leadSearchQuery}
                    onChange={e => {
                      setLeadSearchQuery(e.target.value)
                      setShowLeadDropdown(true)
                    }}
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
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{lead.namaKlien}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {lead.tipeKlien} · {lead.kota}
                              {lead.namaKoordinator && <span> · {lead.namaKoordinator}</span>}
                            </p>
                          </div>
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium ml-2 shrink-0">
                            {lead.stage}
                          </span>
                        </div>
                      </button>
                    ))}
                    {filteredLeads.length === 0 && (
                      <div className="px-4 py-3 text-xs text-gray-400 italic text-center">
                        Tidak ada leads ditemukan
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Lead sudah dipilih */}
            {linkedLeadId && (() => {
              const linked = availableLeadsForOrder.find(l => l.id === linkedLeadId)
              return linked ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-green-800">✅ {linked.namaKlien}</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      {linked.tipeKlien} · {linked.kota} · {linked.id}
                    </p>
                  </div>
                  <button
                    onClick={handleUnlinkLead}
                    className="text-xs text-gray-400 hover:text-red-500 ml-4 shrink-0"
                  >
                    × Ganti
                  </button>
                </div>
              ) : null
            })()}
          </div>
        )}

        {/* ══════════════════════════
            SECTION: Info Deal
        ══════════════════════════ */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">

          {/* ── Sub-bagian A: Data Klien ── */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Data Klien</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {isFromQuotation
                  ? `Sumber: Quotation #${quotationId} · Lead ${quotationLeadId}`
                  : isFromKonsultasi
                    ? `Sumber: Konsultasi #${konsultasiId}`
                    : linkedLeadId
                      ? `Sumber: Lead ${linkedLeadId}`
                      : 'Pilih lead di atas untuk mengisi data klien'
                }
              </p>
            </div>
            {(isFromKonsultasi || isFromQuotation || linkedLeadId) && (
              <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                isFromQuotation ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                Auto-filled · Read-only
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">

            {/* Baris 1: Nama Klien — full width */}
            <div className="col-span-2">
              <ReadOnlyField label="Nama Klien / Penyelenggara" value={clientData.namaKlien} />
            </div>

            {/* Baris 2: Tipe + Kota */}
            <ReadOnlyField label="Tipe Klien"  value={clientData.tipeKlien} />
            <ReadOnlyField label="Kota / Area" value={clientData.kota} />

            {/* Baris 3: Email + Telepon */}
            <ReadOnlyField label="Email Umum"        value={clientData.emailUmum} />
            <ReadOnlyField label="No. Telepon Umum"  value={clientData.teleponUmum} />

            {/* Baris 4: Alamat — full width */}
            <div className="col-span-2">
              <ReadOnlyField label="Alamat Lengkap" value={clientData.alamatLengkap} />
            </div>

            {/* Sub-header Koordinator */}
            <p className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mt-3 mb-1">
              Koordinator / PIC Klien
            </p>

            {/* Baris 5: Nama + Jabatan */}
            <ReadOnlyField label="Nama Koordinator" value={clientData.namaKoordinator} />
            <ReadOnlyField label="Jabatan"          value={clientData.jabatanKoordinator} />

            {/* Baris 6: WA + Email Koordinator */}
            <ReadOnlyField label="No. WA Koordinator" value={clientData.waKoordinator} />
            <ReadOnlyField label="Email Koordinator"  value={clientData.emailKoordinator} />

            {/* Baris 7: PIC Sales EFM */}
            <ReadOnlyField label="PIC Sales EFM" value={clientData.picSalesEFM} />

            {/* ── Sub-bagian B: Detail Order ── */}
            <hr className="col-span-2 border-gray-100 my-4" />
            <p className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Detail Order
            </p>

            {/* Baris 1: Nama Program — full width */}
            <div className="col-span-2">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Nama Program<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                value={orderData.programNama}
                onChange={e => setOrderData(p => ({ ...p, programNama: e.target.value }))}
                placeholder="Corporate Wellness — Yoga & Functional Training"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43] min-h-[36px]"
              />
            </div>

            {/* Baris 2: Periode Awal + Akhir */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Periode Awal<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="date"
                value={orderData.periodeAwal}
                onChange={e => setOrderData(p => ({ ...p, periodeAwal: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43] min-h-[36px]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Periode Akhir<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="date"
                value={orderData.periodeAkhir}
                onChange={e => setOrderData(p => ({ ...p, periodeAkhir: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43] min-h-[36px]"
              />
            </div>

            {/* Baris 3: PIC Operasional + Nilai Kontrak */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                PIC Operasional EFM
                <span className="ml-1.5 text-gray-300 font-normal normal-case">PIC yang handle operasional program ini</span>
              </label>
              <select
                value={orderData.picEFMOps}
                onChange={e => setOrderData(p => ({ ...p, picEFMOps: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-[#1E1C43] min-h-[36px]"
              >
                <option value="">-- Pilih PIC --</option>
                <option>Bagoes</option><option>Emma</option><option>Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Nilai Kontrak (Rp)
                <span className="ml-1.5 text-gray-300 font-normal normal-case">Auto dari subtotal</span>
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 min-h-[36px] flex items-center font-medium">
                {subtotal > 0 ? fmtRp(subtotal) : <span className="text-gray-300 italic">Akan diisi dari rincian layanan</span>}
              </div>
            </div>

            {/* Baris 4: Catatan — full width */}
            <div className="col-span-2">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Catatan Order
              </label>
              <textarea
                value={orderData.catatan}
                onChange={e => setOrderData(p => ({ ...p, catatan: e.target.value }))}
                rows={3}
                placeholder="Catatan tambahan, instruksi khusus, atau informasi penting..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43] resize-none"
              />
            </div>

          </div>
        </div>

        {/* ══════════════════════════
            SECTION: Rincian Layanan
        ══════════════════════════ */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Rincian Layanan</h3>

          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 700 }}>
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
                        className="w-full min-w-[200px] border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E1C43]"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={row.satuan}
                        onChange={e => updateRincian(row.id, 'satuan', e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E1C43] min-w-[90px]"
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
                        className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#1E1C43]"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        value={row.rateUnit}
                        onChange={e => updateRincian(row.id, 'rateUnit', e.target.value)}
                        placeholder="0"
                        className="w-36 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#1E1C43]"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-xs font-medium text-gray-800 whitespace-nowrap text-right">
                      {fmtRp(hitungTotal(row.jumlah, row.rateUnit))}
                    </td>
                    <td className="px-3 py-2.5">
                      {rincianLayanan.length > 1 && (
                        <button
                          type="button"
                          onClick={() => hapusItem(row.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
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
            className="mt-3 inline-flex items-center gap-1.5 border border-[#1E1C43] text-[#1E1C43] text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus size={13} /> Tambah Item
          </button>

          {/* Subtotal */}
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
            <div className="text-right">
              <p className="text-xs text-gray-400">Subtotal (Nilai Kontrak)</p>
              <p className="text-base font-bold text-[#1E1C43]">
                {fmtRp(subtotal)}
              </p>
            </div>
          </div>
        </div>

        {/* Konsultasi context card — jika ada data konsultasi */}
        {konsultasiDetailData && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Info dari Konsultasi #{konsultasiId}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Nama Event</p>
                <p className="text-xs text-gray-700">{konsultasiDetailData.namaEvent || '—'} · {konsultasiDetailData.jenisEvent || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Peran EFM & Peserta</p>
                <p className="text-xs text-gray-700">{konsultasiDetailData.peranEFM || '—'} · Est. {konsultasiDetailData.estimasiPeserta || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Lokasi Event</p>
                <p className="text-xs text-gray-700">{konsultasiDetailData.kota || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Catatan Konsultasi</p>
                <p className="text-xs text-gray-700">{konsultasiDetailData.catatanKonsultasi || '—'}</p>
              </div>
            </div>
          </div>
        )}

      </div>{/* end px-6 py-6 */}

      {/* ══════════════════════════
          STICKY FOOTER
      ══════════════════════════ */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-10 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Batal
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleSimpanDraft}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-[#1E1C43] text-[#1E1C43] rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Save size={14} /> Simpan Draft
          </button>
          <button
            onClick={handleSimpanOrder}
            className="px-5 py-2 text-sm bg-[#1E1C43] text-white rounded-lg hover:bg-[#2d2b5e] font-medium transition-colors"
          >
            💾 Simpan & Buat Order
          </button>
        </div>
      </div>

    </div>
  )
}
