import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Save, Send, Plus, Trash2, Dumbbell, PersonStanding, Waves, CircleDot, TreePine, Building2, Building, Upload } from 'lucide-react'

/* ═══════════════════════════════════════
   Constants
═══════════════════════════════════════ */
const JENIS_KELAS_B2B = [
  'Zumba', 'Pound Fit', 'Hip-Hop Dance', 'K-Pop Dance', 'Hatha Yoga',
  'Pilates Mat', 'Piloxing', 'Salsation', 'Body Combat', 'Strong by Zumba',
  'Belly Dance', 'Dance Mix Indonesia', 'Step Aerobic', 'Zumba Gold',
  'Spinning Class', 'Running Class', 'Prenatal Yoga', 'Bootcamp',
  'Senam Aerobik', 'Personal Training', 'Muaythai', 'Lainnya (isi manual)',
]

const AREA_LIST = [
  { key: 'gym',              label: 'Gym',                    icon: 'Dumbbell',       note: 'Peralatan gym & fitness' },
  { key: 'fitnessStudio',    label: 'Fitness Studio',         icon: 'PersonStanding', note: 'Aerobic, yoga, dance studio' },
  { key: 'kolamRenang',      label: 'Kolam Renang',           icon: 'Waves',          note: 'Swimming pool' },
  { key: 'lapanganTenis',    label: 'Lapangan Tenis',         icon: 'CircleDot',      note: 'Tennis court' },
  { key: 'lapanganBasket',   label: 'Lapangan Basket',        icon: 'CircleDot',      note: 'Basketball court' },
  { key: 'lapanganFutsal',   label: 'Lapangan Futsal/Soccer', icon: 'CircleDot',      note: 'Futsal & soccer field' },
  { key: 'lapanganBadminton',label: 'Lapangan Badminton',     icon: 'CircleDot',      note: 'Badminton court' },
  { key: 'areaOutdoor1',     label: 'Area Outdoor 1',         icon: 'TreePine',       note: 'Area outdoor pertama' },
  { key: 'areaOutdoor2',     label: 'Area Outdoor 2',         icon: 'TreePine',       note: 'Area outdoor kedua' },
  { key: 'areaIndoor1',      label: 'Area Indoor 1',          icon: 'Building2',      note: 'Area indoor pertama' },
  { key: 'areaIndoor2',      label: 'Area Indoor 2',          icon: 'Building2',      note: 'Area indoor kedua' },
  { key: 'rooftop',          label: 'Rooftop',                icon: 'Building',       note: 'Rooftop area' },
  { key: 'lainnya',          label: 'Lainnya',                icon: 'Plus',           note: 'Area atau fasilitas lain' },
]

const ICON_MAP = { Dumbbell, PersonStanding, Waves, CircleDot, TreePine, Building2, Building, Plus }

const emptyProgram = () => ({
  id: Date.now(),
  jenisKelas: '', jenisKelasCustom: '', onlineOffline: 'Offline',
  hari: 'Senin', jam: '', tipePartisipan: 'Karyawan',
  jumlahPeserta: '', masaKontrak: '1 tahun', tanggalMulai: '',
})

/* ═══════════════════════════════════════
   Leads data — untuk selector
═══════════════════════════════════════ */
const LEADS_FOR_SELECTOR = [
  {
    id: 'BL-001', companyName: 'PT. Maju Bersama Tbk', clientType: 'Corporate',
    city: 'Jakarta Selatan', stage: 'Closing', emailUmum: 'info@majubersama.co.id',
    teleponUmum: '021-5551234', alamatLengkap: 'Jl. Sudirman No. 45, Gedung Maju Lt. 12',
    namaKoordinator: 'Budi Santoso', jabatanKoordinator: 'HR Manager',
    waKoordinator: '081234567890', emailKoordinator: 'budi.hr@majubersama.co.id',
    picSalesEFM: 'Bagoes',
  },
  {
    id: 'BL-002', companyName: 'Apartemen Greenlake Sunter', clientType: 'Apartment',
    city: 'Jakarta Utara', stage: 'Presentation', emailUmum: 'management@greenlake.co.id',
    teleponUmum: '021-6661234', alamatLengkap: 'Jl. Danau Sunter Selatan, Jakarta Utara',
    namaKoordinator: 'Dewi Rahayu', jabatanKoordinator: 'Facility Manager',
    waKoordinator: '082112345678', emailKoordinator: 'dewi.facility@greenlake.co.id',
    picSalesEFM: 'Emma',
  },
  {
    id: 'BL-003', companyName: 'CV. Teknologi Prima', clientType: 'Corporate',
    city: 'Tangerang', stage: 'Approach', emailUmum: 'admin@teknologiprima.com',
    teleponUmum: '', alamatLengkap: '', namaKoordinator: '', jabatanKoordinator: '',
    waKoordinator: '', emailKoordinator: '', picSalesEFM: 'Bagoes',
  },
  {
    id: 'BL-004', companyName: 'Perumahan Residence Bintaro', clientType: 'Residence',
    city: 'Tangerang Selatan', stage: 'New', emailUmum: 'hoa@residencebintaro.com',
    teleponUmum: '', alamatLengkap: '', namaKoordinator: '', jabatanKoordinator: '',
    waKoordinator: '', emailKoordinator: '', picSalesEFM: 'Emma',
  },
  {
    id: 'BL-005', companyName: 'PT. Sinar Nusantara Jaya', clientType: 'Corporate',
    city: 'Jakarta Pusat', stage: 'Converted', emailUmum: 'ga@sinarnusantara.co.id',
    teleponUmum: '021-3334455', alamatLengkap: 'Jl. Thamrin No. 10, Jakarta Pusat',
    namaKoordinator: 'Rina Kusuma', jabatanKoordinator: 'GA Head',
    waKoordinator: '081398765432', emailKoordinator: 'rina.ga@sinarnusantara.co.id',
    picSalesEFM: 'Bagoes',
  },
]

/* ═══════════════════════════════════════
   Dummy data — SRV-001
═══════════════════════════════════════ */
const SURVEI_DETAIL_MAP = {
  'SRV-001': {
    profilKlien: {
      companyName: 'PT. Karya Utama', clientType: 'Corporate',
      city: 'Jakarta Selatan', emailUmum: 'info@karyautama.co.id', teleponUmum: '',
      alamatLengkap: 'Jl. Sudirman No. 45',
      namaKoordinator: 'Budi Hartono', jabatanKoordinator: 'HR Manager',
      waKoordinator: '0812-3456-7890', emailKoordinator: 'budi@karyautama.co.id',
      tanggalSurvei: '2026-06-05', picSalesEFM: 'Bagoes',
    },
    area: {
      gym:           { aktif: true,  luas: '60', kapasitas: '15', kondisi: 'Peralatan sudah tua, perlu upgrade treadmill dan alat beban.' },
      studioFitness: { aktif: true,  luas: '40', kapasitas: '20', kondisi: 'Ruangan bersih, lantai parket dalam kondisi baik.' },
      ruangKelas:    { aktif: false, luas: '', kapasitas: '', kondisi: '' },
      outdoor:       { aktif: false, luas: '', kapasitas: '', kondisi: '' },
      kolam:         { aktif: false, luas: '', kapasitas: '', kondisi: '' },
      rooftop:       { aktif: false, luas: '', kapasitas: '', kondisi: '' },
      lainnya:       { aktif: false, luas: '', kapasitas: '', kondisi: '' },
    },
    programList: [
      { id: 1, jenisKelas: 'Zumba',      jenisKelasCustom: '', onlineOffline: 'Offline', hari: 'Rabu',  jam: '17:30', tipePartisipan: 'Karyawan', jumlahPeserta: '35', masaKontrak: '1 tahun', tanggalMulai: '2026-07-01' },
      { id: 2, jenisKelas: 'Hatha Yoga', jenisKelasCustom: '', onlineOffline: 'Offline', hari: 'Jumat', jam: '07:00', tipePartisipan: 'Karyawan', jumlahPeserta: '20', masaKontrak: '1 tahun', tanggalMulai: '2026-07-01' },
    ],
    catatanUmum:  'Fasilitas gym tersedia namun peralatan sudah tua. Ruang aerobik cukup untuk 35 orang. Manajemen antusias.',
    rekomendasi:  'Rekomendasikan paket corporate wellness dengan 2 kelas per minggu. Estimasi nilai Rp 18jt/bulan.',
    hasilSurvei:  'Lanjut',
    catatanHasil: 'Setuju lanjut ke tahap penawaran. Nilai estimasi Rp 18jt/bulan. Klien ingin mulai Juli 2026.',
  },
}

const emptyProfilKlien = {
  companyName: '', clientType: 'Corporate', city: '', emailUmum: '', teleponUmum: '',
  alamatLengkap: '', namaKoordinator: '', jabatanKoordinator: '',
  waKoordinator: '', emailKoordinator: '', tanggalSurvei: '', picSalesEFM: 'Bagoes',
}

/* ═══════════════════════════════════════
   Small reusable components
═══════════════════════════════════════ */
function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${checked ? 'bg-[#1E1C43]' : 'bg-gray-200'}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

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
export default function B2BSurveiDetailPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const location  = useLocation()
  const isNew     = !id || id === 'new'
  const fromState = location.state || {}
  const existing  = !isNew ? SURVEI_DETAIL_MAP[id] : null

  /* ── Lead selector state ── */
  const [selectedLeadId,   setSelectedLeadId]   = useState(() =>
    (fromState.fromLead && fromState.leadId) ? fromState.leadId : ''
  )
  const [showLeadSelector, setShowLeadSelector] = useState(false)
  const [leadSearch,       setLeadSearch]       = useState('')

  /* ── Section 1 state ── */
  const [profilKlien, setProfilKlien] = useState(() => {
    if (existing?.profilKlien) return existing.profilKlien
    // Auto-populate from leads when navigating from B2BLeadsPage
    if (fromState.fromLead && fromState.leadId) {
      const lead = LEADS_FOR_SELECTOR.find(l => l.id === fromState.leadId)
      if (lead) return {
        companyName: lead.companyName || '',
        clientType: lead.clientType || 'Corporate',
        city: lead.city || '',
        emailUmum: lead.emailUmum || '',
        teleponUmum: lead.teleponUmum || '',
        alamatLengkap: lead.alamatLengkap || '',
        namaKoordinator: lead.namaKoordinator || '',
        jabatanKoordinator: lead.jabatanKoordinator || '',
        waKoordinator: lead.waKoordinator || '',
        emailKoordinator: lead.emailKoordinator || '',
        tanggalSurvei: '',
        picSalesEFM: lead.picSalesEFM || 'Bagoes',
      }
    }
    // Fallback: from navigation state (backward compat)
    return {
      companyName: fromState.namaPerusahaan || fromState.companyName || '',
      clientType: fromState.tipe || fromState.clientType || 'Corporate',
      city: fromState.lokasi || fromState.city || '',
      emailUmum: fromState.email || fromState.emailUmum || '',
      teleponUmum: fromState.teleponUmum || '',
      alamatLengkap: fromState.alamatLengkap || '',
      namaKoordinator: fromState.picKlien || fromState.namaKoordinator || '',
      jabatanKoordinator: fromState.jabatanKoordinator || '',
      waKoordinator: fromState.noHP || fromState.waKoordinator || '',
      emailKoordinator: fromState.emailKoordinator || '',
      tanggalSurvei: '',
      picSalesEFM: fromState.picSalesEFM || 'Bagoes',
    }
  })

  /* ── Section 2 state ── */
  const [areas, setAreas] = useState({
    gym: false, fitnessStudio: false, kolamRenang: false,
    lapanganTenis: false, lapanganBasket: false, lapanganFutsal: false,
    lapanganBadminton: false, areaOutdoor1: false, areaOutdoor2: false,
    areaIndoor1: false, areaIndoor2: false, rooftop: false, lainnya: false,
  })
  const [areaPeralatan, setAreaPeralatan] = useState({})
  const [areaFotos,     setAreaFotos]     = useState({})

  /* ── Section 3 state ── */
  const [programList, setProgramList] = useState(existing?.programList || [{
    id: 1, jenisKelas: '', jenisKelasCustom: '', onlineOffline: 'Offline',
    hari: 'Senin', jam: '', tipePartisipan: 'Karyawan',
    jumlahPeserta: '', masaKontrak: '1 tahun', tanggalMulai: '',
  }])

  /* ── Section 4 state ── */
  const [catatanUmum,  setCatatanUmum]  = useState(existing?.catatanUmum  || '')
  const [rekomendasi,  setRekomendasi]  = useState(existing?.rekomendasi   || '')
  const [hasilSurvei,  setHasilSurvei]  = useState(existing?.hasilSurvei  || '')
  const [catatanHasil, setCatatanHasil] = useState(existing?.catatanHasil || '')

  const [toast, setToast] = useState(null)

  /* ── Helpers ── */
  function updateProfilKlien(k, v) { setProfilKlien(p => ({ ...p, [k]: v })) }

  function handleSelectLead(lead) {
    setSelectedLeadId(lead.id)
    setShowLeadSelector(false)
    setLeadSearch('')
    setProfilKlien(p => ({
      ...p,
      companyName:       lead.companyName       || '',
      clientType:        lead.clientType        || 'Corporate',
      city:              lead.city              || '',
      emailUmum:         lead.emailUmum         || '',
      teleponUmum:       lead.teleponUmum       || '',
      alamatLengkap:     lead.alamatLengkap     || '',
      namaKoordinator:   lead.namaKoordinator   || '',
      jabatanKoordinator:lead.jabatanKoordinator|| '',
      waKoordinator:     lead.waKoordinator     || '',
      emailKoordinator:  lead.emailKoordinator  || '',
      picSalesEFM:       lead.picSalesEFM       || p.picSalesEFM,
    }))
  }

  function handleClearLead() {
    setSelectedLeadId('')
    setProfilKlien({ ...emptyProfilKlien })
  }

  function updateProgram(idx, field, val) {
    setProgramList(list => list.map((p, i) => i === idx ? { ...p, [field]: val } : p))
  }
  function tambahProgram() { setProgramList(prev => [...prev, { ...emptyProgram(), id: Date.now() }]) }
  function hapusProgram(idx) { setProgramList(list => list.filter((_, i) => i !== idx)) }

  /* ── Area peralatan helpers ── */
  function tambahPeralatan(areaKey) {
    setAreaPeralatan(prev => ({
      ...prev,
      [areaKey]: [...(prev[areaKey] || [{ id: 1, item: '', catatan: '' }]), { id: Date.now(), item: '', catatan: '' }],
    }))
  }
  function hapusPeralatan(areaKey, index) {
    setAreaPeralatan(prev => ({ ...prev, [areaKey]: (prev[areaKey] || []).filter((_, i) => i !== index) }))
  }
  function updatePeralatan(areaKey, index, field, value) {
    setAreaPeralatan(prev => ({
      ...prev,
      [areaKey]: (prev[areaKey] || [{ id: 1, item: '', catatan: '' }]).map((row, i) => i === index ? { ...row, [field]: value } : row),
    }))
  }
  function handleFotoUpload(areaKey, index, e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Ukuran file maksimal 2MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAreaFotos(prev => {
        const current = prev[areaKey] || Array(5).fill(null)
        const updated = [...current]
        updated[index] = { file, preview: ev.target.result }
        return { ...prev, [areaKey]: updated }
      })
    }
    reader.readAsDataURL(file)
  }
  function hapusFoto(areaKey, index) {
    setAreaFotos(prev => {
      const current = prev[areaKey] || Array(5).fill(null)
      const updated = [...current]
      updated[index] = null
      return { ...prev, [areaKey]: updated }
    })
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  function validate() {
    if (!profilKlien.companyName.trim())  { showToast('⚠️ Nama klien wajib diisi');         return false }
    if (!profilKlien.tanggalSurvei)       { showToast('⚠️ Tanggal survei wajib diisi');      return false }
    if (!profilKlien.picSalesEFM.trim())  { showToast('⚠️ Fitness Consultant wajib diisi'); return false }
    return true
  }

  function handleSimpanDraft(e) {
    if (e) { e.preventDefault(); e.stopPropagation() }
    showToast('✓ Draft survei disimpan')
  }

  function handleSimpanSelesai(e) {
    if (e) { e.preventDefault(); e.stopPropagation() }
    if (!validate()) return
    showToast('✓ Survei berhasil disimpan')
    setTimeout(() => navigate('/b2b/survei'), 1000)
  }

  function handleBuatOrder(e) {
    if (e) { e.preventDefault(); e.stopPropagation() }
    if (!profilKlien.companyName) { showToast('⚠️ Lengkapi profil klien dulu'); return }
    const surveiId = isNew ? `SRV-NEW-${Date.now()}` : id
    navigate(`/b2b/orders/new?surveiId=${surveiId}&leadId=${selectedLeadId}`, {
      state: {
        fromSurvei: true,
        surveiId,
        leadId: selectedLeadId,
        namaPerusahaan: profilKlien.companyName,
        tipe:           profilKlien.clientType,
        picKlien:       profilKlien.namaKoordinator,
        noHP:           profilKlien.waKoordinator,
        emailUmum:      profilKlien.emailUmum,
        rekomendasi,
        programList,
      },
    })
  }

  /* ── Derived ── */
  const filteredLeads = leadSearch
    ? LEADS_FOR_SELECTOR.filter(l =>
        l.companyName.toLowerCase().includes(leadSearch.toLowerCase()) ||
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

      <div className="px-4 py-4 md:px-6 md:py-6">

      {/* ══════════════════════════════════════════
          HEADER CARD
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-5">

        {/* Breadcrumb */}
        <div className="flex items-start justify-between gap-3 mb-4 sm:mb-5">
          <nav className="flex items-center gap-1 text-xs text-gray-400 flex-wrap min-w-0">
            <button onClick={() => navigate('/b2b/survei')} className="hover:text-[#1E1C43] transition-colors whitespace-nowrap">B2B Management</button>
            <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />
            <button onClick={() => navigate('/b2b/survei')} className="hover:text-[#1E1C43] transition-colors whitespace-nowrap">Survei</button>
            <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />
            <span className="text-[#1E1C43] font-medium truncate max-w-[120px] sm:max-w-none">{profilKlien.companyName || (isNew ? 'Survei Baru' : id)}</span>
          </nav>
          <button
            onClick={() => navigate('/b2b/survei')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors flex-shrink-0 whitespace-nowrap"
          >
            <ArrowLeft size={12} /> Kembali
          </button>
        </div>

        {/* Info utama + Stepper */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold bg-gray-100 text-[#1E1C43] px-2.5 py-1 rounded-lg">
                {isNew ? 'SRV-NEW' : id}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                hasilSurvei === 'Lanjut'       ? 'bg-green-100 text-green-700' :
                hasilSurvei === 'Pending'      ? 'bg-yellow-100 text-yellow-700' :
                hasilSurvei === 'Tidak Lanjut' ? 'bg-red-100 text-red-600' :
                                                  'bg-gray-100 text-gray-500'
              }`}>
                {hasilSurvei || 'Draft'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E1C43] mb-1 break-words">
              {profilKlien.companyName || (isNew ? 'Form Survei Baru' : id)}
            </h1>
            <p className="text-sm text-gray-500">
              {[
                profilKlien.clientType,
                profilKlien.city,
                profilKlien.tanggalSurvei ? new Date(profilKlien.tanggalSurvei).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : null,
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
          <div className="flex-shrink-0 sm:ml-8">
            {hasilSurvei ? (
              <div className="flex flex-col items-end gap-3">
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 ${
                  hasilSurvei === 'Lanjut'       ? 'border-green-400 bg-green-50' :
                  hasilSurvei === 'Pending'      ? 'border-yellow-400 bg-yellow-50' :
                                                    'border-red-400 bg-red-50'
                }`}>
                  <span className="text-xl">
                    {hasilSurvei === 'Lanjut' ? '✅' : hasilSurvei === 'Pending' ? '⏳' : '❌'}
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${
                      hasilSurvei === 'Lanjut'       ? 'text-green-700' :
                      hasilSurvei === 'Pending'      ? 'text-yellow-700' :
                                                        'text-red-600'
                    }`}>{hasilSurvei}</p>
                    <p className="text-[10px] text-gray-400">Hasil keputusan survei</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {[
                    { label: 'Profil',    done: !!(profilKlien.companyName && profilKlien.tanggalSurvei) },
                    { label: 'Fasilitas', done: Object.values(areas).some(Boolean) },
                    { label: 'Program',   done: programList.some(p => p.jenisKelas) },
                  ].map(({ label, done }) => (
                    <span key={label} className={`text-xs font-medium px-2 py-0.5 rounded-full ${
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
                    { label: 'Profil Klien',      done: !!(profilKlien.companyName && profilKlien.tanggalSurvei), active: !profilKlien.companyName },
                    { label: 'Kondisi Fasilitas', done: Object.values(areas).some(Boolean),        active: !!(profilKlien.companyName && !Object.values(areas).some(Boolean)) },
                    { label: 'Program / Kelas',   done: programList.some(p => p.jenisKelas),       active: !!(Object.values(areas).some(Boolean) && !programList.some(p => p.jenisKelas)) },
                    { label: 'Hasil Survei',      done: !!hasilSurvei,                             active: !!(programList.some(p => p.jenisKelas) && !hasilSurvei) },
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
          <p className="text-sm font-semibold text-[#1E1C43]">Kaitkan dengan Lead</p>
          {!selectedLeadId && (
            <span className="text-[10px] text-gray-400">Opsional — untuk tracking pipeline B2B</span>
          )}
        </div>

        {selectedLeadId ? (
          /* Selected lead banner */
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span>✅</span>
                <span className="text-sm font-bold text-green-800">{selectedLead?.companyName}</span>
                <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">{selectedLeadId}</span>
              </div>
              <p className="text-xs text-green-700">
                {[selectedLead?.clientType, selectedLead?.city, selectedLead?.stage].filter(Boolean).join(' · ')}
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
          /* Custom lead selector dropdown */
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
                    placeholder="Cari nama perusahaan atau ID..."
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
                          <span className="text-xs font-medium text-gray-800 truncate">{lead.companyName}</span>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">{lead.id}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{lead.clientType} · {lead.city} · {lead.stage}</p>
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
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4">
        <SectionHeader num="1" title="Profil Klien" subtitle="Informasi dasar klien dan kontak koordinator" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Banner info */}
          {selectedLeadId ? (
            <div className="col-span-2 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-2">
              <span className="text-blue-500 mt-0.5 flex-shrink-0">ℹ️</span>
              <p className="text-xs text-blue-700">
                Data profil klien diisi otomatis dari <strong>Leads {selectedLeadId}</strong> dan tidak dapat diedit di sini.{' '}
                Untuk mengubah data klien, lakukan edit di halaman{' '}
                <button onClick={() => navigate('/b2b/leads')} className="underline font-semibold hover:text-blue-900">
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

          {/* Row 1: Nama Klien — full width */}
          <div className="col-span-2">
            <ReadOnlyField label="Nama Klien / Perusahaan" value={profilKlien.companyName} />
          </div>

          {/* Row 2: Tipe + Kota */}
          <ReadOnlyField label="Tipe Klien"  value={profilKlien.clientType} />
          <ReadOnlyField label="Kota / Area" value={profilKlien.city} />

          {/* Row 3: Email + Telepon */}
          <ReadOnlyField label="Email Umum"       value={profilKlien.emailUmum} />
          <ReadOnlyField label="No. Telepon Umum" value={profilKlien.teleponUmum} />

          {/* Row 4: Alamat — full width */}
          <div className="col-span-2">
            <ReadOnlyField label="Alamat Lengkap" value={profilKlien.alamatLengkap} />
          </div>

          {/* Sub-header Koordinator */}
          <p className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2">
            Koordinator / PIC Klien
          </p>

          {/* Row 5: Nama + Jabatan */}
          <ReadOnlyField label="Nama Koordinator Klien" value={profilKlien.namaKoordinator} />
          <ReadOnlyField label="Jabatan Koordinator"    value={profilKlien.jabatanKoordinator} />

          {/* Row 6: WA + Email Koordinator */}
          <ReadOnlyField label="No. WA Koordinator" value={profilKlien.waKoordinator} />
          <ReadOnlyField label="Email Koordinator"  value={profilKlien.emailKoordinator} />

          {/* Row 7: PIC EFM (read-only) + Tanggal Survei (satu-satunya yang editable) */}
          <ReadOnlyField label="Fitness Consultant / PIC EFM" value={profilKlien.picSalesEFM} />
          <div>
            <FieldLabel required>Tanggal Survei</FieldLabel>
            <input
              type="date"
              value={profilKlien.tanggalSurvei}
              onChange={e => updateProfilKlien('tanggalSurvei', e.target.value)}
              className={inputCls}
            />
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 2: Area & Fasilitas
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4">
        <SectionHeader num="2" title="Area & Fasilitas" subtitle="Pilih area yang tersedia, lalu isi kondisi masing-masing" />

        {/* Grid toggle 4 kolom */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {AREA_LIST.map(area => {
            const IconComp = ICON_MAP[area.icon] || CircleDot
            const active = areas[area.key]
            return (
              <button
                key={area.key}
                type="button"
                onClick={e => { e.preventDefault(); e.stopPropagation(); setAreas(prev => ({ ...prev, [area.key]: !prev[area.key] })) }}
                className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all text-left ${
                  active ? 'border-[#1E1C43] bg-[#1E1C43]/5' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${active ? 'bg-[#1E1C43] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <IconComp size={14} />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate ${active ? 'text-[#1E1C43]' : 'text-gray-600'}`}>{area.label}</p>
                  <p className="text-[10px] text-gray-400 truncate">{active ? 'Aktif ✓' : area.note}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Card detail per area yang aktif */}
        {AREA_LIST.filter(area => areas[area.key]).map(area => {
          const peralatan = areaPeralatan[area.key] || [{ id: 1, item: '', catatan: '' }]
          const fotos = areaFotos[area.key] || Array(5).fill(null)
          return (
            <div key={area.key} className="border-l-4 border-[#1E1C43] bg-white rounded-xl shadow-sm p-5 mb-3">

              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-[#1E1C43]">{area.label}</h4>
                <button
                  type="button"
                  onClick={e => { e.preventDefault(); setAreas(prev => ({ ...prev, [area.key]: false })) }}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Nonaktifkan ×
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Jenis Bangunan</label>
                  <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E1C43]">
                    <option>Gedung Bertingkat</option><option>Ruko</option><option>Outdoor</option><option>Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Indoor/Outdoor</label>
                  <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E1C43]">
                    <option>Indoor</option><option>Outdoor</option><option>Semi-outdoor</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Tipe Lantai</label>
                  <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E1C43]">
                    <option>Vinyl</option><option>Rubber Floor</option><option>Epoxy Floor</option>
                    <option>Concrete</option><option>Wooden Floor</option><option>Keramik</option>
                    <option>Rumput Sintetis</option><option>Aspal</option><option>Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {['Luas (m²)', 'Panjang (m)', 'Lebar (m)', 'Tinggi (m)'].map(lbl => (
                  <div key={lbl}>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">{lbl}</label>
                    <input type="number" placeholder="0" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E1C43]" />
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-2">Perlengkapan & Peralatan</label>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-[10px] font-semibold text-gray-400 text-left px-2 py-1.5 w-8">No</th>
                      <th className="text-[10px] font-semibold text-gray-400 text-left px-2 py-1.5">Item / Nama Peralatan</th>
                      <th className="text-[10px] font-semibold text-gray-400 text-left px-2 py-1.5">Catatan Kondisi</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {peralatan.map((row, i) => (
                      <tr key={row.id} className="border-t border-gray-100">
                        <td className="px-2 py-1.5 text-xs text-gray-400">{i + 1}</td>
                        <td className="px-2 py-1.5">
                          <input type="text" value={row.item} onChange={e => updatePeralatan(area.key, i, 'item', e.target.value)} placeholder="Speaker, Treadmill, AC, Mic..." className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E1C43]" />
                        </td>
                        <td className="px-2 py-1.5">
                          <input type="text" value={row.catatan} onChange={e => updatePeralatan(area.key, i, 'catatan', e.target.value)} placeholder="Jumlah, kondisi..." className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E1C43]" />
                        </td>
                        <td className="px-2 py-1.5">
                          <button type="button" onClick={() => hapusPeralatan(area.key, i)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={() => tambahPeralatan(area.key)} className="mt-2 flex items-center gap-1.5 text-[10px] text-[#1E1C43] font-medium hover:underline">
                  <Plus size={11} /> Tambah Perlengkapan
                </button>
              </div>

              <div className="mb-3">
                <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-2">
                  Foto Area <span className="font-normal normal-case text-gray-400">(maks 5, JPG/PNG, 2MB)</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {fotos.map((foto, i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                      {foto ? (
                        <>
                          <img src={foto.preview} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => hapusFoto(area.key, i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">×</button>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                          <Upload size={14} className="text-gray-400 mb-1" />
                          <span className="text-[10px] text-gray-400">Foto</span>
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleFotoUpload(area.key, i, e)} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Catatan Kondisi Area</label>
                <textarea rows={2} placeholder="Catatan khusus kondisi area ini..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E1C43] resize-none" />
              </div>
            </div>
          )
        })}
      </div>

      {/* ══════════════════════════════════════════
          SECTION 3: Data Program / Kelas
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4">
        <SectionHeader num="3" title="Data Program / Kelas" subtitle="Program fitness yang diminta klien" />
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 1100 }}>
            <thead>
              <tr className="bg-gray-50">
                {[
                  'No Program', 'Pilihan Program/Kelas', 'Online/Offline',
                  'Hari', 'Jam', 'Tipe Partisipan',
                  'Est. Peserta', 'Masa Kontrak', 'Tgl Mulai', 'Hapus',
                ].map(h => (
                  <th key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {programList.map((program, i) => (
                <tr key={program.id} className="border-b border-gray-100">
                  <td className="px-3 py-2 text-xs font-medium text-[#1E1C43] whitespace-nowrap">Program {i + 1}</td>

                  <td className="px-3 py-2">
                    <select value={program.jenisKelas} onChange={e => updateProgram(i, 'jenisKelas', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs min-w-[160px] focus:outline-none focus:ring-1 focus:ring-[#1E1C43]">
                      <option value="">Pilih kelas...</option>
                      {JENIS_KELAS_B2B.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                    {program.jenisKelas === 'Lainnya (isi manual)' && (
                      <input type="text" value={program.jenisKelasCustom}
                        onChange={e => updateProgram(i, 'jenisKelasCustom', e.target.value)}
                        placeholder="Nama kelas..."
                        className="mt-1 border border-gray-200 rounded-lg px-2 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-[#1E1C43]" />
                    )}
                  </td>

                  <td className="px-3 py-2">
                    <select value={program.onlineOffline} onChange={e => updateProgram(i, 'onlineOffline', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs">
                      <option>Offline</option><option>Online</option><option>Hybrid</option>
                    </select>
                  </td>

                  <td className="px-3 py-2">
                    <select value={program.hari} onChange={e => updateProgram(i, 'hari', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs min-w-[90px]">
                      {['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu','Fleksibel'].map(h => <option key={h}>{h}</option>)}
                    </select>
                  </td>

                  <td className="px-3 py-2">
                    <input type="time" value={program.jam} onChange={e => updateProgram(i, 'jam', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E1C43]" />
                  </td>

                  <td className="px-3 py-2">
                    <select value={program.tipePartisipan} onChange={e => updateProgram(i, 'tipePartisipan', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs min-w-[120px]">
                      {['Karyawan','Penghuni','Eksekutif','Jajaran Direksi','Orang Umum','Lainnya'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <input type="number" value={program.jumlahPeserta} onChange={e => updateProgram(i, 'jumlahPeserta', e.target.value)}
                        placeholder="15-20"
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-[#1E1C43]" />
                      <span className="text-[10px] text-gray-400">orang</span>
                    </div>
                  </td>

                  <td className="px-3 py-2">
                    <select value={program.masaKontrak} onChange={e => updateProgram(i, 'masaKontrak', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs">
                      {['3 bulan','6 bulan','1 tahun','2 tahun','Lainnya'].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </td>

                  <td className="px-3 py-2">
                    <input type="date" value={program.tanggalMulai} onChange={e => updateProgram(i, 'tanggalMulai', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E1C43]" />
                  </td>

                  <td className="px-3 py-2">
                    {programList.length > 1 && (
                      <button onClick={() => hapusProgram(i)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={tambahProgram}
          className="mt-3 inline-flex items-center gap-1.5 border border-[#1E1C43] text-[#1E1C43] text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
          <Plus size={13} /> Tambah Program
        </button>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 4: Catatan & Hasil Survei
      ══════════════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4">
        <SectionHeader num="4" title="Catatan & Hasil Survei" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <FieldLabel>Catatan Umum / Temuan Lapangan</FieldLabel>
            <textarea value={catatanUmum} onChange={e => setCatatanUmum(e.target.value)}
              rows={5} placeholder="Deskripsikan kondisi umum fasilitas, temuan lapangan, kebutuhan khusus klien, dll..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E1C43] resize-none" />
          </div>
          <div>
            <FieldLabel>Rekomendasi EFM</FieldLabel>
            <textarea value={rekomendasi} onChange={e => setRekomendasi(e.target.value)}
              rows={5} placeholder="Rekomendasi program, estimasi nilai kontrak, hal yang perlu ditindaklanjuti..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E1C43] resize-none" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            Hasil Keputusan Survei
          </label>
          <div className="flex gap-3 mb-3">
            {[
              { val: 'Lanjut',       borderActive: 'border-green-500',  bgActive: 'bg-green-50',  dot: 'bg-green-500',  textActive: 'text-green-700' },
              { val: 'Pending',      borderActive: 'border-yellow-500', bgActive: 'bg-yellow-50', dot: 'bg-yellow-500', textActive: 'text-yellow-700' },
              { val: 'Tidak Lanjut', borderActive: 'border-red-400',    bgActive: 'bg-red-50',    dot: 'bg-red-400',    textActive: 'text-red-600' },
            ].map(opt => (
              <button key={opt.val} type="button"
                onClick={e => { e.preventDefault(); e.stopPropagation(); setHasilSurvei(hasilSurvei === opt.val ? '' : opt.val) }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                  hasilSurvei === opt.val
                    ? opt.borderActive + ' ' + opt.bgActive
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />
                <span className={`text-sm font-medium ${hasilSurvei === opt.val ? opt.textActive : 'text-gray-600'}`}>{opt.val}</span>
              </button>
            ))}
          </div>

          {hasilSurvei && (
            <textarea value={catatanHasil} onChange={e => setCatatanHasil(e.target.value)}
              rows={2}
              placeholder={
                hasilSurvei === 'Lanjut'       ? 'Estimasi nilai kontrak, langkah berikutnya...' :
                hasilSurvei === 'Pending'       ? 'Apa yang perlu ditunggu / ditindaklanjuti...' :
                                                  'Alasan tidak lanjut...'
              }
              className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E1C43] resize-none" />
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] px-4 sm:px-6 py-3 mt-4 z-10">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-gray-400 hidden sm:block">
            <span className="font-medium text-[#1E1C43]">
              {profilKlien.companyName || 'Form Survei'}
            </span>
            {selectedLeadId && (
              <span className="text-blue-500 ml-1.5">· Lead {selectedLeadId}</span>
            )}
            {hasilSurvei && (
              <>
                {' · '}
                <span className={
                  hasilSurvei === 'Lanjut'  ? 'text-green-600 font-medium' :
                  hasilSurvei === 'Pending' ? 'text-yellow-600 font-medium' :
                                              'text-red-500 font-medium'
                }>
                  {hasilSurvei}
                </span>
              </>
            )}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" onClick={handleSimpanDraft}
              className="inline-flex items-center gap-1.5 border border-[#1E1C43] text-[#1E1C43] text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Save size={13} /> Simpan Draft
            </button>
            <button type="button" onClick={handleSimpanSelesai}
              className="inline-flex items-center gap-1.5 bg-[#E05945] hover:bg-[#c94a38] text-white text-xs sm:text-sm font-medium px-3 sm:px-5 py-2 rounded-lg transition-colors">
              <Send size={13} /> Simpan & Selesai
            </button>
            {hasilSurvei === 'Lanjut' && (
              <button type="button" onClick={handleBuatOrder}
                className="inline-flex items-center gap-1.5 bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-xs sm:text-sm font-medium px-3 sm:px-5 py-2 rounded-lg transition-colors">
                📋 Buat Order →
              </button>
            )}
          </div>
        </div>
      </div>

      </div>{/* end px-6 py-6 */}
    </div>
  )
}
