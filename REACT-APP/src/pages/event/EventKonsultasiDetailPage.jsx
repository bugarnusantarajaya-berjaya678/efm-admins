import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Save, Send, Plus, ClipboardList, Link2 } from 'lucide-react'
import { getStoredLeads, initLeads, LEADS_INIT } from '../../data/eventLeadsStore'
import { initKonsultasi, getStoredKonsultasi, KONSULTASI_INIT } from '../../data/eventKonsultasiStore'

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
   Dummy data — KNS-26-0001 s/d KNS-26-0005
═══════════════════════════════════════ */
const KONSULTASI_DETAIL_MAP = {
  'KNS-26-0001': {
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
  'KNS-26-0002': {
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
  'KNS-26-0003': {
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
  'KNS-26-0004': {
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
  'KNS-26-0005': {
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
      <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">{num}. {title}</h3>
      {subtitle && <p className="text-[10px] text-gray-400 mt-1 pl-3">{subtitle}</p>}
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

  // Initialize stores — both are idempotent (only seed once)
  initLeads(LEADS_INIT)
  const LEADS_FOR_SELECTOR = getStoredLeads()
  initKonsultasi(KONSULTASI_INIT)
  const storedKns = !isNew ? getStoredKonsultasi().find(k => k.id === id) : null

  /* ── Lead selector state ── */
  const [selectedLeadId,   setSelectedLeadId]   = useState(() => {
    if (fromState.fromLead && fromState.leadId) return fromState.leadId
    if (storedKns?.leadId) return storedKns.leadId
    return ''
  })
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
    const backPath = selectedLeadId ? `/event/leads/${selectedLeadId}` : '/event/leads'
    setTimeout(() => navigate(backPath), 1000)
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

      <div className="px-4 py-4 md:px-6 md:py-6 pb-24">

      {/* ══════════════════════════════════════════
          HEADER CARD
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
              <ClipboardList size={22} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                B2B Event{selectedLeadId && selectedLead ? ` · ${selectedLead.namaKlien}` : ''}
              </p>
              <h1 className="text-[22px] font-bold text-[#1E1C43] leading-tight">
                {profilKlien.namaKlien || (isNew ? 'Konsultasi Baru' : id)}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {isNew
                  ? 'Isi form konsultasi event klien baru'
                  : [profilKlien.tipeKlien, profilKlien.kota, detailEvent.namaEvent].filter(Boolean).join(' · ')}
              </p>
              {!isNew && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] font-semibold bg-gray-100 text-[#1E1C43] px-2 py-0.5 rounded">{id}</span>
                  {hasilKonsultasi && (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      hasilKonsultasi === 'Lanjut'       ? 'bg-green-50 text-green-700 border-green-200' :
                      hasilKonsultasi === 'Pending'      ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      hasilKonsultasi === 'Tidak Lanjut' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {hasilKonsultasi}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(selectedLeadId ? `/event/leads/${selectedLeadId}` : '/event/leads')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors flex-shrink-0"
          >
            <ArrowLeft size={12} /> Kembali
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          LEAD SELECTOR
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Kaitkan dengan Lead</h3>
          <p className="text-[10px] text-gray-400 mt-1 pl-3">Pilih lead yang sudah ada untuk mengisi data klien secara otomatis</p>
        </div>

        {selectedLeadId ? (
          <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50 flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span>✅</span>
                <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">{selectedLeadId}</span>
                <span className="text-sm font-bold text-green-800">{selectedLead?.namaKlien}</span>
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
          <div className="p-4 rounded-xl border border-gray-200 bg-[#F5F5F7]">
            <div className="flex items-center gap-2 mb-1.5">
              <Link2 size={13} className="text-[#1E1C43]" />
              <p className="text-xs font-bold text-[#1E1C43] uppercase tracking-wide">Pilih Lead Klien</p>
            </div>
            <p className="text-[11px] text-gray-500 mb-3">Hubungkan ke lead untuk auto-fill data klien secara otomatis</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLeadSelector(p => !p)}
                className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-500 hover:border-gray-400 bg-white transition-colors text-left"
              >
                <span>Pilih dari leads yang ada...</span>
                <span className="text-gray-400 ml-2">{showLeadSelector ? '▲' : '▼'}</span>
              </button>

              {showLeadSelector && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
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
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          SECTION 1: Profil Klien
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <SectionHeader num="1" title="Profil Klien" subtitle="Informasi dasar klien dan kontak koordinator" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {selectedLeadId && (
            <div className="col-span-2 flex items-center gap-2 mb-1">
              <span className="text-[10px] text-gray-400">Data dari</span>
              <button onClick={() => navigate(`/event/leads/${selectedLeadId}`)} className="text-[10px] font-semibold text-[#1E1C43] hover:underline">
                Lead {selectedLeadId}
              </button>
              <span className="text-[10px] text-gray-400">— edit data klien di Lead Detail</span>
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <SectionHeader num="2" title="Detail Event" subtitle="Informasi teknis event yang akan diselenggarakan" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
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
          <div className="flex flex-wrap gap-2 mb-3">
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
      </div>{/* close px-4 py-4 wrapper early so footer is outside */}
      <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white border-t border-gray-200 px-6 py-4 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Left — context info */}
          <div className="hidden sm:block min-w-0">
            <p className="text-sm text-gray-700 font-semibold truncate">
              {profilKlien.namaKlien || 'Form Konsultasi'}
              {selectedLeadId && <span className="text-gray-400 font-normal ml-1.5">· {selectedLeadId}</span>}
            </p>
            {hasilKonsultasi && (
              <p className={`text-xs font-medium mt-0.5 ${
                hasilKonsultasi === 'Lanjut'       ? 'text-green-600' :
                hasilKonsultasi === 'Pending'      ? 'text-yellow-600' :
                                                     'text-red-500'
              }`}>{hasilKonsultasi}</p>
            )}
          </div>

          {/* Right — actions */}
          <div className="flex items-center gap-3 ml-auto">
            <button type="button" onClick={handleSimpanDraft}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition flex items-center gap-2">
              <Save size={14} /> Simpan Draft
            </button>
            <button type="button" onClick={handleSimpanSelesai}
              className="px-6 py-2.5 bg-[#1E1C43] hover:bg-[#2d2b5e] text-white rounded-xl text-sm font-semibold transition flex items-center gap-2">
              <Send size={14} /> Simpan & Selesai
            </button>
            {hasilKonsultasi === 'Lanjut' && (
              <button type="button" onClick={handleBuatOrder}
                className="px-6 py-2.5 bg-[#E05945] hover:bg-[#c94a38] text-white rounded-xl text-sm font-semibold transition">
                Buat Order →
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
