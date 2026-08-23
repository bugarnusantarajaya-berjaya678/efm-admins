import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Save, Send, Plus } from 'lucide-react'

/* ═══════════════════════════════════════
   Constants
═══════════════════════════════════════ */
const ISI_PROGRAM_OPTS = [
  'Warm-up & Stretching', 'Fun Run / Walk', 'Senam Massal', 'Aerobik',
  'Zumba', 'Yoga Outdoor', 'HIIT', 'Body Combat',
  'Dance Performance', 'Functional Training', 'Cool-down', 'Lainnya (isi manual)',
]

const PERAN_EFM_OPTS = ['Main Organizer', 'Co-Organizer', 'Fitness Consultant', 'Vendor']

const ANGGARAN_OPTS = [
  '< Rp 10 juta', 'Rp 10–25 juta', 'Rp 25–50 juta',
  'Rp 50–100 juta', 'Rp 100–250 juta', '> Rp 250 juta', 'Belum Diketahui',
]

/* ═══════════════════════════════════════
   Leads data — untuk selector
═══════════════════════════════════════ */
const LEADS_FOR_SELECTOR = [
  {
    id: 'EL-001', namaKlien: 'Yayasan Kanker Indonesia', tipeKlien: 'Foundation',
    kota: 'Jakarta Selatan', stage: 'Converted',
    namaEvent: 'Health Run for Hope 2026', jenisEvent: 'Charity Run',
    emailUmum: 'info@yayasankankeri.or.id', teleponUmum: '021-5551234',
    alamatLengkap: 'Jl. Sudirman No. 20, Jakarta Selatan',
    namaKoordinator: 'Ibu Ratna', jabatanKoordinator: 'Event Director',
    waKoordinator: '0812-3456-7890', emailKoordinator: 'ratna@yayasankankeri.or.id',
    picSalesEFM: 'Bagoes',
  },
  {
    id: 'EL-002', namaKlien: 'PT. Garuda Nusa Tbk', tipeKlien: 'Corporate',
    kota: 'Jakarta Pusat', stage: 'Converted',
    namaEvent: 'Corporate Fun Run 2026', jenisEvent: 'Fun Run',
    emailUmum: 'ga@garudanusa.co.id', teleponUmum: '021-6661234',
    alamatLengkap: 'Jl. Thamrin No. 5, Jakarta Pusat',
    namaKoordinator: 'Pak Hendra', jabatanKoordinator: 'HR Director',
    waKoordinator: '0821-1234-5678', emailKoordinator: 'hendra.hr@garudanusa.co.id',
    picSalesEFM: 'Emma',
  },
  {
    id: 'EL-003', namaKlien: 'Brand Tropicana Slim', tipeKlien: 'Brand',
    kota: 'Tangerang', stage: 'Proposal',
    namaEvent: 'Healthy Living Expo', jenisEvent: 'Exhibition',
    emailUmum: 'marketing@tropicanaslim.com', teleponUmum: '',
    alamatLengkap: 'ICE BSD, Tangerang',
    namaKoordinator: 'Ibu Sari', jabatanKoordinator: 'Brand Manager',
    waKoordinator: '0815-5678-9012', emailKoordinator: 'sari.brand@tropicanaslim.com',
    picSalesEFM: 'Bagoes',
  },
  {
    id: 'EL-004', namaKlien: 'Komunitas Pelari Jakarta', tipeKlien: 'Community',
    kota: 'Jakarta Pusat', stage: 'Lost',
    namaEvent: 'Jakarta Night Run 2026', jenisEvent: 'Night Run',
    emailUmum: '', teleponUmum: '', alamatLengkap: '',
    namaKoordinator: '', jabatanKoordinator: '',
    waKoordinator: '', emailKoordinator: '', picSalesEFM: 'Emma',
  },
  {
    id: 'EL-005', namaKlien: 'Dinas Pemuda & Olahraga DKI', tipeKlien: 'Government',
    kota: 'Jakarta', stage: 'Closing',
    namaEvent: 'Hari Olahraga Nasional DKI', jenisEvent: 'Mass Event',
    emailUmum: 'info@dispora.jakarta.go.id', teleponUmum: '021-3456789',
    alamatLengkap: 'Jl. Pemuda No. 1, Jakarta Timur',
    namaKoordinator: 'Pak Surya', jabatanKoordinator: 'Kasi Olahraga',
    waKoordinator: '0813-9876-5432', emailKoordinator: 'surya@dispora.jakarta.go.id',
    picSalesEFM: 'Bagoes',
  },
  {
    id: 'EL-006', namaKlien: 'PT. Telkom Indonesia', tipeKlien: 'Corporate',
    kota: 'Jakarta Selatan', stage: 'Approach',
    namaEvent: '', jenisEvent: '',
    emailUmum: 'humas@telkom.co.id', teleponUmum: '021-5235000',
    alamatLengkap: 'Jl. Gatot Subroto No. 52, Jakarta Selatan',
    namaKoordinator: '', jabatanKoordinator: '',
    waKoordinator: '', emailKoordinator: '', picSalesEFM: 'Emma',
  },
]

/* ═══════════════════════════════════════
   Dummy data — KNS-001 s/d KNS-005
═══════════════════════════════════════ */
const KONSULTASI_DETAIL_MAP = {
  'KNS-001': {
    profilKlien: {
      namaKlien: 'Yayasan Kanker Indonesia', tipeKlien: 'Foundation',
      kota: 'Jakarta Selatan', emailUmum: 'info@yayasankankeri.or.id',
      teleponUmum: '021-5551234', alamatLengkap: 'Jl. Sudirman No. 20, Jakarta Selatan',
      namaKoordinator: 'Ibu Ratna', jabatanKoordinator: 'Event Director',
      waKoordinator: '0812-3456-7890', emailKoordinator: 'ratna@yayasankankeri.or.id',
      tanggalKonsultasi: '2026-06-05', picSalesEFM: 'Bagoes',
    },
    detailEvent: {
      namaEvent: 'Health Run for Hope 2026', jenisEvent: 'Charity Run',
      tglEvent: '2026-06-28', lokasiEvent: 'GBK, Jakarta Selatan',
      estimasiPeserta: '2.000 orang', peranEFM: 'Main Organizer',
    },
    isiProgram: ['Warm-up & Stretching', 'Fun Run / Walk', 'Cool-down'],
    estimasiAnggaran: 'Rp 50–100 juta',
    catatanUmum: 'Event skala besar 2.000 peserta. Venue GBK sudah dikonfirmasi. Panitia sangat kooperatif.',
    rekomendasi: 'EFM sebagai main organizer fitness segment. Perlu 5 instruktur dan 3 koordinator lapangan.',
    hasilKonsultasi: 'Lanjut',
    catatanHasil: 'Setuju lanjut ke tahap penawaran. Nilai estimasi Rp 85jt all-in.',
  },
  'KNS-002': {
    profilKlien: {
      namaKlien: 'PT. Garuda Nusa Tbk', tipeKlien: 'Corporate',
      kota: 'Jakarta Pusat', emailUmum: 'ga@garudanusa.co.id',
      teleponUmum: '021-6661234', alamatLengkap: 'Jl. Thamrin No. 5, Jakarta Pusat',
      namaKoordinator: 'Pak Hendra', jabatanKoordinator: 'HR Director',
      waKoordinator: '0821-1234-5678', emailKoordinator: 'hendra.hr@garudanusa.co.id',
      tanggalKonsultasi: '2026-06-08', picSalesEFM: 'Emma',
    },
    detailEvent: {
      namaEvent: 'Corporate Fun Run 2026', jenisEvent: 'Fun Run',
      tglEvent: '2026-07-15', lokasiEvent: 'Sudirman Park, Jakarta Pusat',
      estimasiPeserta: '500 karyawan', peranEFM: 'Co-Organizer',
    },
    isiProgram: ['Warm-up & Stretching', 'Fun Run / Walk', 'Functional Training', 'Cool-down'],
    estimasiAnggaran: 'Rp 25–50 juta',
    catatanUmum: 'Event internal perusahaan untuk 500 karyawan. Budget sudah disetujui direksi. HR sangat antusias.',
    rekomendasi: 'Co-organizer untuk fitness & wellness segment. Perlu 3 instruktur.',
    hasilKonsultasi: 'Lanjut',
    catatanHasil: 'Lanjut ke quotation. Estimasi nilai Rp 40jt.',
  },
  'KNS-003': {
    profilKlien: {
      namaKlien: 'Brand Tropicana Slim', tipeKlien: 'Brand',
      kota: 'Tangerang', emailUmum: 'marketing@tropicanaslim.com',
      teleponUmum: '', alamatLengkap: 'ICE BSD, Tangerang',
      namaKoordinator: 'Ibu Sari', jabatanKoordinator: 'Brand Manager',
      waKoordinator: '0815-5678-9012', emailKoordinator: 'sari.brand@tropicanaslim.com',
      tanggalKonsultasi: '2026-06-10', picSalesEFM: 'Bagoes',
    },
    detailEvent: {
      namaEvent: 'Healthy Living Expo', jenisEvent: 'Exhibition',
      tglEvent: '2026-08-01', lokasiEvent: 'ICE BSD, Tangerang',
      estimasiPeserta: '1.500 pengunjung/hari', peranEFM: 'Fitness Consultant',
    },
    isiProgram: ['Warm-up & Stretching', 'Dance Performance', 'Functional Training'],
    estimasiAnggaran: 'Rp 10–25 juta',
    catatanUmum: 'Expo 3 hari, stand fitness demo dibutuhkan. Masih menunggu approval anggaran brand.',
    rekomendasi: 'EFM sebagai konsultan fitness, sediakan demo area dan instruktur showcase.',
    hasilKonsultasi: 'Pending',
    catatanHasil: 'Menunggu konfirmasi anggaran dari brand manager.',
  },
  'KNS-004': {
    profilKlien: {
      namaKlien: 'Komunitas Pelari Jakarta', tipeKlien: 'Community',
      kota: 'Jakarta Pusat', emailUmum: '',
      teleponUmum: '', alamatLengkap: 'Monas, Jakarta Pusat',
      namaKoordinator: '', jabatanKoordinator: '',
      waKoordinator: '', emailKoordinator: '',
      tanggalKonsultasi: '2026-06-14', picSalesEFM: 'Emma',
    },
    detailEvent: {
      namaEvent: 'Jakarta Night Run 2026', jenisEvent: 'Night Run',
      tglEvent: '2026-09-20', lokasiEvent: 'Monas, Jakarta Pusat',
      estimasiPeserta: '300 pelari', peranEFM: 'Vendor',
    },
    isiProgram: ['Warm-up & Stretching', 'Fun Run / Walk', 'Cool-down'],
    estimasiAnggaran: '< Rp 10 juta',
    catatanUmum: 'Budget komunitas sangat terbatas. Panitia lebih memilih vendor yang lebih murah.',
    rekomendasi: 'Tidak disarankan. Margin terlalu kecil untuk operasional EFM.',
    hasilKonsultasi: 'Tidak Lanjut',
    catatanHasil: 'Ditunda. Arahkan ke komunitas yang lebih besar di Q4 2026.',
  },
  'KNS-005': {
    profilKlien: {
      namaKlien: 'Dinas Pemuda & Olahraga DKI', tipeKlien: 'Government',
      kota: 'Jakarta', emailUmum: 'info@dispora.jakarta.go.id',
      teleponUmum: '021-3456789', alamatLengkap: 'Jl. Pemuda No. 1, Jakarta Timur',
      namaKoordinator: 'Pak Surya', jabatanKoordinator: 'Kasi Olahraga',
      waKoordinator: '0813-9876-5432', emailKoordinator: 'surya@dispora.jakarta.go.id',
      tanggalKonsultasi: '2026-06-18', picSalesEFM: 'Bagoes',
    },
    detailEvent: {
      namaEvent: 'Hari Olahraga Nasional DKI', jenisEvent: 'Mass Event',
      tglEvent: '2026-09-09', lokasiEvent: 'Lapangan Banteng, Jakarta',
      estimasiPeserta: '5.000+ peserta', peranEFM: 'Main Organizer',
    },
    isiProgram: ['Warm-up & Stretching', 'Senam Massal', 'Aerobik', 'Fun Run / Walk', 'Cool-down'],
    estimasiAnggaran: 'Rp 100–250 juta',
    catatanUmum: 'Event resmi pemerintah provinsi, peserta ribuan orang. Anggaran APBD. Proses tender.',
    rekomendasi: 'Ikut tender resmi. Persiapkan dokumen perusahaan dan portofolio event.',
    hasilKonsultasi: 'Lanjut',
    catatanHasil: 'Lanjut proses tender. Submit dokumen sebelum 30 Jun 2026.',
  },
}

const emptyProfilKlien = {
  namaKlien: '', tipeKlien: 'Corporate', kota: '', emailUmum: '', teleponUmum: '',
  alamatLengkap: '', namaKoordinator: '', jabatanKoordinator: '',
  waKoordinator: '', emailKoordinator: '', tanggalKonsultasi: '', picSalesEFM: 'Bagoes',
}

const emptyDetailEvent = {
  namaEvent: '', jenisEvent: '', tglEvent: '', lokasiEvent: '', estimasiPeserta: '', peranEFM: 'Main Organizer',
}

/* ═══════════════════════════════════════
   Small reusable components
═══════════════════════════════════════ */
function SectionHeader({ num, title, subtitle }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-[#1E1C43]">{num}. {title}</h3>
      {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

const inputCls  = 'w-full h-9 px-3 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43] bg-white transition-colors'
const selectCls = 'w-full h-9 px-3 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#1E1C43] bg-white'

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </label>
      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 min-h-[36px] flex items-center">
        {value || <span className="italic text-gray-300">—</span>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
export default function EventKonsultasiDetailPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const location  = useLocation()
  const isNew     = !id || id === 'new'
  const fromState = location.state || {}
  const existing  = !isNew ? KONSULTASI_DETAIL_MAP[id] : null

  /* ── Lead selector state ── */
  const [selectedLeadId,   setSelectedLeadId]   = useState(() =>
    (fromState.fromLead && fromState.leadId) ? fromState.leadId : ''
  )
  const [showLeadSelector, setShowLeadSelector] = useState(false)
  const [leadSearch,       setLeadSearch]       = useState('')

  /* ── Section 1 state ── */
  const [profilKlien, setProfilKlien] = useState(() => {
    if (existing?.profilKlien) return existing.profilKlien
    if (fromState.fromLead && fromState.leadId) {
      const lead = LEADS_FOR_SELECTOR.find(l => l.id === fromState.leadId)
      if (lead) return {
        namaKlien:          lead.namaKlien          || '',
        tipeKlien:          lead.tipeKlien          || 'Corporate',
        kota:               lead.kota               || '',
        emailUmum:          lead.emailUmum          || '',
        teleponUmum:        lead.teleponUmum        || '',
        alamatLengkap:      lead.alamatLengkap      || '',
        namaKoordinator:    lead.namaKoordinator    || '',
        jabatanKoordinator: lead.jabatanKoordinator || '',
        waKoordinator:      lead.waKoordinator      || '',
        emailKoordinator:   lead.emailKoordinator   || '',
        tanggalKonsultasi:  '',
        picSalesEFM:        lead.picSalesEFM        || 'Bagoes',
      }
    }
    return {
      namaKlien:          fromState.namaKlien          || '',
      tipeKlien:          fromState.tipeKlien          || 'Corporate',
      kota:               fromState.kota               || '',
      emailUmum:          fromState.emailUmum          || '',
      teleponUmum:        fromState.teleponUmum        || '',
      alamatLengkap:      fromState.alamatLengkap      || '',
      namaKoordinator:    fromState.namaKoordinator    || '',
      jabatanKoordinator: fromState.jabatanKoordinator || '',
      waKoordinator:      fromState.waKoordinator      || '',
      emailKoordinator:   fromState.emailKoordinator   || '',
      tanggalKonsultasi:  '',
      picSalesEFM:        fromState.picSalesEFM        || 'Bagoes',
    }
  })

  /* ── Section 2 state ── */
  const [detailEvent, setDetailEvent] = useState(() => existing?.detailEvent || {
    ...emptyDetailEvent,
    namaEvent: fromState.namaEvent  || '',
    jenisEvent: fromState.jenisEvent || '',
    peranEFM: fromState.peranEFM     || 'Main Organizer',
  })

  /* ── Section 3 state ── */
  const [isiProgram,    setIsiProgram]    = useState(existing?.isiProgram    || [])
  const [customProgram, setCustomProgram] = useState('')

  /* ── Section 4 state ── */
  const [estimasiAnggaran, setEstimasiAnggaran] = useState(existing?.estimasiAnggaran || '')
  const [catatanUmum,      setCatatanUmum]      = useState(existing?.catatanUmum      || '')
  const [rekomendasi,      setRekomendasi]      = useState(existing?.rekomendasi       || '')
  const [hasilKonsultasi,  setHasilKonsultasi]  = useState(existing?.hasilKonsultasi  || '')
  const [catatanHasil,     setCatatanHasil]     = useState(existing?.catatanHasil     || '')

  const [toast, setToast] = useState(null)

  /* ── Helpers ── */
  function updateProfilKlien(k, v) { setProfilKlien(p => ({ ...p, [k]: v })) }
  function updateDetailEvent(k, v) { setDetailEvent(p => ({ ...p, [k]: v })) }

  function handleSelectLead(lead) {
    setSelectedLeadId(lead.id)
    setShowLeadSelector(false)
    setLeadSearch('')
    setProfilKlien(p => ({
      ...p,
      namaKlien:          lead.namaKlien          || '',
      tipeKlien:          lead.tipeKlien          || 'Corporate',
      kota:               lead.kota               || '',
      emailUmum:          lead.emailUmum          || '',
      teleponUmum:        lead.teleponUmum        || '',
      alamatLengkap:      lead.alamatLengkap      || '',
      namaKoordinator:    lead.namaKoordinator    || '',
      jabatanKoordinator: lead.jabatanKoordinator || '',
      waKoordinator:      lead.waKoordinator      || '',
      emailKoordinator:   lead.emailKoordinator   || '',
      picSalesEFM:        lead.picSalesEFM        || p.picSalesEFM,
    }))
    if (lead.namaEvent) {
      setDetailEvent(p => ({
        ...p,
        namaEvent:  lead.namaEvent  || p.namaEvent,
        jenisEvent: lead.jenisEvent || p.jenisEvent,
      }))
    }
  }

  function handleClearLead() {
    setSelectedLeadId('')
    setProfilKlien({ ...emptyProfilKlien })
  }

  function toggleIsiProgram(item) {
    setIsiProgram(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    )
  }

  function handleAddCustomProgram() {
    const val = customProgram.trim()
    if (val && !isiProgram.includes(val)) {
      setIsiProgram(prev => [...prev, val])
      setCustomProgram('')
    }
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  function validate() {
    if (!profilKlien.namaKlien.trim())        { showToast('⚠️ Nama klien wajib diisi');           return false }
    if (!profilKlien.tanggalKonsultasi)        { showToast('⚠️ Tanggal konsultasi wajib diisi');   return false }
    if (!profilKlien.picSalesEFM.trim())       { showToast('⚠️ Fitness Consultant wajib diisi');   return false }
    return true
  }

  function handleSimpanDraft(e) {
    if (e) { e.preventDefault(); e.stopPropagation() }
    showToast('✓ Draft konsultasi disimpan')
  }

  function handleSimpanSelesai(e) {
    if (e) { e.preventDefault(); e.stopPropagation() }
    if (!validate()) return
    showToast('✓ Konsultasi berhasil disimpan')
    setTimeout(() => navigate('/event/konsultasi'), 1000)
  }

  function handleBuatOrder(e) {
    if (e) { e.preventDefault(); e.stopPropagation() }
    if (!profilKlien.namaKlien) { showToast('⚠️ Lengkapi profil klien dulu'); return }
    const konsultasiId = isNew ? `KNS-NEW-${Date.now()}` : id
    navigate(`/event/orders/new?konsultasiId=${konsultasiId}&leadId=${selectedLeadId}`, {
      state: {
        fromKonsultasi:  true,
        konsultasiId,
        leadId:          selectedLeadId,
        namaKlien:       profilKlien.namaKlien,
        tipeKlien:       profilKlien.tipeKlien,
        kota:            profilKlien.kota,
        namaEvent:       detailEvent.namaEvent,
        jenisEvent:      detailEvent.jenisEvent,
        peranEFM:        detailEvent.peranEFM,
        namaKoordinator: profilKlien.namaKoordinator,
        waKoordinator:   profilKlien.waKoordinator,
        emailUmum:       profilKlien.emailUmum,
        rekomendasi,
        isiProgram,
      },
    })
  }

  /* ── Derived ── */
  const filteredLeads = leadSearch
    ? LEADS_FOR_SELECTOR.filter(l =>
        l.namaKlien.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.id.toLowerCase().includes(leadSearch.toLowerCase())
      )
    : LEADS_FOR_SELECTOR

  const selectedLead = LEADS_FOR_SELECTOR.find(l => l.id === selectedLeadId)

  /* ── Render ── */
  return (
    <div className="bg-[#F5F5F7] min-h-screen">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#1E1C43] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="px-6 py-6">

      {/* ══════════════════════════════════════════
          HEADER CARD
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-5">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-5">
          <nav className="flex items-center gap-1 text-xs text-gray-400">
            <button onClick={() => navigate('/event/konsultasi')} className="hover:text-[#1E1C43] transition-colors">Event Management</button>
            <ChevronRight size={12} className="text-gray-300" />
            <button onClick={() => navigate('/event/konsultasi')} className="hover:text-[#1E1C43] transition-colors">Konsultasi</button>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-[#1E1C43] font-medium">{profilKlien.namaKlien || (isNew ? 'Konsultasi Baru' : id)}</span>
          </nav>
          <button
            onClick={() => navigate('/event/konsultasi')}
            className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={12} /> Kembali ke Konsultasi
          </button>
        </div>

        {/* Info utama + Stepper */}
        <div className="flex items-start justify-between">

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold bg-gray-100 text-[#1E1C43] px-2.5 py-1 rounded-lg">
                {isNew ? 'KNS-NEW' : id}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                hasilKonsultasi === 'Lanjut'       ? 'bg-green-100 text-green-700' :
                hasilKonsultasi === 'Pending'      ? 'bg-yellow-100 text-yellow-700' :
                hasilKonsultasi === 'Tidak Lanjut' ? 'bg-red-100 text-red-600' :
                                                      'bg-gray-100 text-gray-500'
              }`}>
                {hasilKonsultasi || 'Draft'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#1E1C43] mb-1">
              {profilKlien.namaKlien || (isNew ? 'Form Konsultasi Baru' : id)}
            </h1>
            <p className="text-sm text-gray-500">
              {[
                profilKlien.tipeKlien,
                profilKlien.kota,
                detailEvent.namaEvent,
                profilKlien.tanggalKonsultasi ? new Date(profilKlien.tanggalKonsultasi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : null,
                profilKlien.picSalesEFM ? 'FC: ' + profilKlien.picSalesEFM : null,
              ].filter(Boolean).join(' · ')}
            </p>
            {selectedLeadId && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-[10px] text-blue-700">📋 Dikaitkan ke Lead {selectedLeadId} — data klien pre-filled</span>
              </div>
            )}
          </div>

          {/* Stepper */}
          <div className="flex-shrink-0 ml-8">
            {hasilKonsultasi ? (
              <div className="flex flex-col items-end gap-3">
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 ${
                  hasilKonsultasi === 'Lanjut'       ? 'border-green-400 bg-green-50' :
                  hasilKonsultasi === 'Pending'      ? 'border-yellow-400 bg-yellow-50' :
                                                        'border-red-400 bg-red-50'
                }`}>
                  <span className="text-xl">
                    {hasilKonsultasi === 'Lanjut' ? '✅' : hasilKonsultasi === 'Pending' ? '⏳' : '❌'}
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${
                      hasilKonsultasi === 'Lanjut'       ? 'text-green-700' :
                      hasilKonsultasi === 'Pending'      ? 'text-yellow-700' :
                                                            'text-red-600'
                    }`}>{hasilKonsultasi}</p>
                    <p className="text-[10px] text-gray-400">Hasil keputusan konsultasi</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {[
                    { label: 'Profil',   done: !!(profilKlien.namaKlien && profilKlien.tanggalKonsultasi) },
                    { label: 'Event',    done: !!(detailEvent.namaEvent && detailEvent.peranEFM) },
                    { label: 'Program',  done: isiProgram.length > 0 },
                  ].map(({ label, done }) => (
                    <span key={label} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {label} {done ? '✓' : '○'}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3 text-right">
                  Tahapan Pengisian
                </p>
                <div className="flex flex-col gap-0">
                  {[
                    { label: 'Profil Klien',      done: !!(profilKlien.namaKlien && profilKlien.tanggalKonsultasi), active: !profilKlien.namaKlien },
                    { label: 'Detail Event',       done: !!(detailEvent.namaEvent && detailEvent.peranEFM),          active: !!(profilKlien.namaKlien && !detailEvent.namaEvent) },
                    { label: 'Isi Program',        done: isiProgram.length > 0,                                       active: !!(detailEvent.namaEvent && isiProgram.length === 0) },
                    { label: 'Hasil Konsultasi',   done: !!hasilKonsultasi,                                           active: !!(isiProgram.length > 0 && !hasilKonsultasi) },
                  ].map((step, i, arr) => (
                    <div key={step.label} className="flex items-start gap-2.5">
                      <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                          step.done   ? 'bg-green-500 text-white' :
                          step.active ? 'bg-[#E05945] text-white' :
                                        'bg-gray-200 text-gray-500'
                        }`}>
                          {step.done ? '✓' : i + 1}
                        </div>
                        {i < arr.length - 1 && (
                          <div className={`w-px h-5 ${step.done ? 'bg-green-300' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <span className={`text-xs whitespace-nowrap pt-0.5 ${
                        step.done   ? 'text-green-700 font-medium' :
                        step.active ? 'text-[#E05945] font-semibold' :
                                      'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          LEAD SELECTOR
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[#1E1C43]">Kaitkan dengan Lead Event</p>
          {!selectedLeadId && (
            <span className="text-[10px] text-gray-400">Opsional — untuk tracking pipeline Event</span>
          )}
        </div>

        {selectedLeadId ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span>✅</span>
                <span className="text-sm font-bold text-green-800">{selectedLead?.namaKlien}</span>
                <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">{selectedLeadId}</span>
              </div>
              <p className="text-xs text-green-700">
                {[selectedLead?.tipeKlien, selectedLead?.kota, selectedLead?.stage].filter(Boolean).join(' · ')}
              </p>
              <p className="text-[11px] text-green-600 italic mt-1">
                Data klien telah diisi otomatis. Anda tetap dapat mengedit field di bawah jika ada perubahan.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearLead}
              className="text-xs text-gray-500 hover:text-red-500 transition-colors flex-shrink-0 ml-4 whitespace-nowrap"
            >
              × Ganti Lead
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLeadSelector(p => !p)}
              className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 hover:border-gray-300 bg-white transition-colors text-left"
            >
              <span>Pilih dari leads yang ada...</span>
              <span className="text-gray-400 text-xs ml-2">{showLeadSelector ? '▲' : '▼'}</span>
            </button>

            {showLeadSelector && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
                <div className="p-2 border-b border-gray-100">
                  <input
                    type="text"
                    value={leadSearch}
                    onChange={e => setLeadSearch(e.target.value)}
                    placeholder="Cari nama klien atau ID..."
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E1C43]"
                    autoFocus
                  />
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {filteredLeads.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">Tidak ada lead ditemukan</p>
                  ) : filteredLeads.map(lead => (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => handleSelectLead(lead)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-800 truncate">{lead.namaKlien}</span>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">{lead.id}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{lead.tipeKlien} · {lead.kota} · {lead.stage}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          SECTION 1: Profil Klien
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <SectionHeader num="1" title="Profil Klien" subtitle="Informasi dasar klien dan kontak koordinator" />

        <div className="grid grid-cols-2 gap-4">

          {selectedLeadId ? (
            <div className="col-span-2 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-2">
              <span className="text-blue-500 mt-0.5 flex-shrink-0">ℹ️</span>
              <p className="text-xs text-blue-700">
                Data profil klien diisi otomatis dari <strong>Leads {selectedLeadId}</strong> dan tidak dapat diedit di sini.{' '}
                Untuk mengubah data klien, lakukan edit di halaman{' '}
                <button onClick={() => navigate('/event/leads')} className="underline font-semibold hover:text-blue-900">
                  Leads
                </button>.
              </p>
            </div>
          ) : (
            <div className="col-span-2 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2">
              <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠️</span>
              <p className="text-xs text-amber-700">
                Belum ada leads dipilih. Pilih leads terlebih dahulu dari selector di atas agar data klien terisi otomatis.
              </p>
            </div>
          )}

          <div className="col-span-2">
            <ReadOnlyField label="Nama Klien / Penyelenggara" value={profilKlien.namaKlien} />
          </div>

          <ReadOnlyField label="Tipe Klien"  value={profilKlien.tipeKlien} />
          <ReadOnlyField label="Kota / Area" value={profilKlien.kota} />

          <ReadOnlyField label="Email Umum"       value={profilKlien.emailUmum} />
          <ReadOnlyField label="No. Telepon Umum" value={profilKlien.teleponUmum} />

          <div className="col-span-2">
            <ReadOnlyField label="Alamat Lengkap" value={profilKlien.alamatLengkap} />
          </div>

          <p className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2">
            Koordinator / PIC Klien
          </p>

          <ReadOnlyField label="Nama Koordinator Klien" value={profilKlien.namaKoordinator} />
          <ReadOnlyField label="Jabatan Koordinator"    value={profilKlien.jabatanKoordinator} />

          <ReadOnlyField label="No. WA Koordinator" value={profilKlien.waKoordinator} />
          <ReadOnlyField label="Email Koordinator"  value={profilKlien.emailKoordinator} />

          <ReadOnlyField label="Fitness Consultant / PIC EFM" value={profilKlien.picSalesEFM} />
          <div>
            <FieldLabel required>Tanggal Konsultasi</FieldLabel>
            <input
              type="date"
              value={profilKlien.tanggalKonsultasi}
              onChange={e => updateProfilKlien('tanggalKonsultasi', e.target.value)}
              className={inputCls}
            />
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 2: Detail Event
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <SectionHeader num="2" title="Detail Event" subtitle="Informasi teknis event yang akan diselenggarakan" />

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="col-span-2">
            <FieldLabel required>Nama Event</FieldLabel>
            <input
              type="text"
              value={detailEvent.namaEvent}
              onChange={e => updateDetailEvent('namaEvent', e.target.value)}
              placeholder="Contoh: Health Run for Hope 2026"
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel>Jenis Event</FieldLabel>
            <input
              type="text"
              value={detailEvent.jenisEvent}
              onChange={e => updateDetailEvent('jenisEvent', e.target.value)}
              placeholder="Charity Run, Fun Run, Mass Event, Exhibition..."
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel>Tanggal Event</FieldLabel>
            <input
              type="date"
              value={detailEvent.tglEvent}
              onChange={e => updateDetailEvent('tglEvent', e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel>Lokasi Event</FieldLabel>
            <input
              type="text"
              value={detailEvent.lokasiEvent}
              onChange={e => updateDetailEvent('lokasiEvent', e.target.value)}
              placeholder="GBK, Sudirman Park, ICE BSD..."
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel>Estimasi Peserta</FieldLabel>
            <input
              type="text"
              value={detailEvent.estimasiPeserta}
              onChange={e => updateDetailEvent('estimasiPeserta', e.target.value)}
              placeholder="500 karyawan, 2.000 orang, 5.000+ peserta..."
              className={inputCls}
            />
          </div>
        </div>

        {/* Peran EFM — 4 card selector */}
        <div>
          <FieldLabel required>Peran EFM dalam Event</FieldLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PERAN_EFM_OPTS.map(opt => {
              const active = detailEvent.peranEFM === opt
              const desc = {
                'Main Organizer':   'EFM mengelola seluruh penyelenggaraan event',
                'Co-Organizer':     'EFM berkolaborasi bersama penyelenggara utama',
                'Fitness Consultant': 'EFM menyediakan instruktur & program fitness',
                'Vendor':           'EFM sebagai vendor penyedia layanan spesifik',
              }[opt] || ''
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateDetailEvent('peranEFM', opt)}
                  className={`text-left p-3.5 rounded-xl border-2 transition-all ${
                    active
                      ? 'border-[#1E1C43] bg-[#1E1C43]/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <p className={`text-xs font-semibold mb-1 ${active ? 'text-[#1E1C43]' : 'text-gray-700'}`}>{opt}</p>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{desc}</p>
                  {active && <span className="mt-2 inline-block text-[10px] font-semibold text-[#1E1C43]">✓ Dipilih</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 3: Isi Program Event
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <SectionHeader num="3" title="Isi Program Event" subtitle="Pilih kegiatan / segmen fitness yang akan ada di event" />

        <div className="flex flex-wrap gap-2 mb-4">
          {ISI_PROGRAM_OPTS.map(item => {
            if (item === 'Lainnya (isi manual)') return null
            const active = isiProgram.includes(item)
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleIsiProgram(item)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? 'bg-[#1E1C43] text-white border-[#1E1C43]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {item}
              </button>
            )
          })}
        </div>

        {/* Custom / manual input */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={customProgram}
            onChange={e => setCustomProgram(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomProgram())}
            placeholder="Tambah kegiatan lain (tekan Enter atau klik +)..."
            className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#1E1C43] focus:ring-1 focus:ring-[#1E1C43]"
          />
          <button
            type="button"
            onClick={handleAddCustomProgram}
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-[#1E1C43] text-[#1E1C43] hover:bg-gray-50 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Selected program list */}
        {isiProgram.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Program Terpilih ({isiProgram.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {isiProgram.map(item => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 bg-[#1E1C43]/10 text-[#1E1C43] text-xs font-medium px-3 py-1 rounded-full"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => toggleIsiProgram(item)}
                    className="text-[#1E1C43]/60 hover:text-[#1E1C43] ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {isiProgram.length === 0 && (
          <p className="text-xs text-gray-400 italic">Belum ada program dipilih.</p>
        )}
      </div>

      {/* ══════════════════════════════════════════
          SECTION 4: Anggaran & Hasil Konsultasi
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <SectionHeader num="4" title="Anggaran & Hasil Konsultasi" />

        {/* Estimasi anggaran */}
        <div className="mb-5">
          <FieldLabel>Estimasi Anggaran Klien</FieldLabel>
          <select
            value={estimasiAnggaran}
            onChange={e => setEstimasiAnggaran(e.target.value)}
            className={selectCls}
          >
            <option value="">Pilih rentang anggaran...</option>
            {ANGGARAN_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <FieldLabel>Catatan Umum / Temuan Konsultasi</FieldLabel>
            <textarea value={catatanUmum} onChange={e => setCatatanUmum(e.target.value)}
              rows={5} placeholder="Deskripsikan kondisi umum event, temuan, kebutuhan khusus klien, dll..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E1C43] resize-none" />
          </div>
          <div>
            <FieldLabel>Rekomendasi EFM</FieldLabel>
            <textarea value={rekomendasi} onChange={e => setRekomendasi(e.target.value)}
              rows={5} placeholder="Rekomendasi peran EFM, estimasi nilai kontrak, hal yang perlu ditindaklanjuti..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E1C43] resize-none" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            Hasil Keputusan Konsultasi
          </label>
          <div className="flex gap-3 mb-3">
            {[
              { val: 'Lanjut',       borderActive: 'border-green-500',  bgActive: 'bg-green-50',  dot: 'bg-green-500',  textActive: 'text-green-700' },
              { val: 'Pending',      borderActive: 'border-yellow-500', bgActive: 'bg-yellow-50', dot: 'bg-yellow-500', textActive: 'text-yellow-700' },
              { val: 'Tidak Lanjut', borderActive: 'border-red-400',    bgActive: 'bg-red-50',    dot: 'bg-red-400',    textActive: 'text-red-600' },
            ].map(opt => (
              <button key={opt.val} type="button"
                onClick={e => { e.preventDefault(); e.stopPropagation(); setHasilKonsultasi(hasilKonsultasi === opt.val ? '' : opt.val) }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                  hasilKonsultasi === opt.val
                    ? opt.borderActive + ' ' + opt.bgActive
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />
                <span className={`text-sm font-medium ${hasilKonsultasi === opt.val ? opt.textActive : 'text-gray-600'}`}>{opt.val}</span>
              </button>
            ))}
          </div>

          {hasilKonsultasi && (
            <textarea value={catatanHasil} onChange={e => setCatatanHasil(e.target.value)}
              rows={2}
              placeholder={
                hasilKonsultasi === 'Lanjut'       ? 'Estimasi nilai kontrak, langkah berikutnya...' :
                hasilKonsultasi === 'Pending'       ? 'Apa yang perlu ditunggu / ditindaklanjuti...' :
                                                      'Alasan tidak lanjut...'
              }
              className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E1C43] resize-none" />
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] px-6 py-3 mt-4 rounded-b-xl z-10">
        <div className="flex items-center justify-between">

          <p className="text-xs text-gray-400">
            <span className="font-medium text-[#1E1C43]">
              {profilKlien.namaKlien || 'Form Konsultasi'}
            </span>
            {selectedLeadId && (
              <span className="text-blue-500 ml-1.5">· Lead {selectedLeadId}</span>
            )}
            {hasilKonsultasi && (
              <>
                {' · '}
                <span className={
                  hasilKonsultasi === 'Lanjut'  ? 'text-green-600 font-medium' :
                  hasilKonsultasi === 'Pending' ? 'text-yellow-600 font-medium' :
                                                  'text-red-500 font-medium'
                }>
                  {hasilKonsultasi}
                </span>
              </>
            )}
          </p>

          <div className="flex items-center gap-3">
            <button type="button" onClick={handleSimpanDraft}
              className="inline-flex items-center gap-2 border border-[#1E1C43] text-[#1E1C43] text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Save size={14} /> Simpan Draft
            </button>
            <button type="button" onClick={handleSimpanSelesai}
              className="inline-flex items-center gap-2 bg-[#E05945] hover:bg-[#c94a38] text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
              <Send size={14} /> Simpan & Selesai
            </button>
            {hasilKonsultasi === 'Lanjut' && (
              <button type="button" onClick={handleBuatOrder}
                className="inline-flex items-center gap-2 bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                📋 Simpan & Buat Order →
              </button>
            )}
          </div>
        </div>
      </div>

      </div>{/* end px-6 py-6 */}
    </div>
  )
}
