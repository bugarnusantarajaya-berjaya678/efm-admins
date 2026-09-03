import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { ArrowLeft, Edit2, Save, X, Plus, ChevronRight, FileText, Upload, Eye, MessageCircle, ExternalLink, Download } from 'lucide-react'
import { getAllAssessments } from '../../data/ppAssessmentsStore'
import { getAllOrders } from '../../data/ppOrdersStore'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { PIC_OPTS } from '../../data/ppProgramDBData'
import { getStoredJenis } from '../../data/ppJenisStore'

/* ═══════════════════════════════════════
   Constants
═══════════════════════════════════════ */
const TIPE_CLS = {
  Personal: 'bg-blue-100 text-blue-700',
  Group:    'bg-purple-100 text-purple-700',
  Couple:   'bg-pink-100 text-pink-700',
}

const STAGE_CLS = {
  New:         'bg-gray-100 text-gray-600',
  Approach:    'bg-blue-100 text-blue-600',
  Screening:   'bg-purple-100 text-purple-600',
  Closing:     'bg-orange-100 text-orange-600',
  Lost:        'bg-red-100 text-red-600',
  'Edit Data': 'bg-indigo-50 text-indigo-600',
}

const STAGE_BORDER = {
  Lost:        'border-red-400',
  Closing:     'border-orange-400',
  Screening:   'border-purple-400',
  Approach:    'border-blue-400',
  New:         'border-gray-300',
  'Edit Data': 'border-indigo-300',
}

const PIPELINE_STAGES  = ['New', 'Approach', 'Screening', 'Closing', 'Lost']
const PIPELINE_LINEAR  = ['New', 'Approach', 'Screening', 'Closing']
const SUMBER_OPTS      = ['Website','Referral','Meta Ads','Google Ads','Walk-in','Instagram','LinkedIn','Lainnya']

/* ── Fallback static data (for direct URL access) ── */
const LEADS_FALLBACK = [
  {
    id: 'LP-0001', sapaan: 'Pak', nama: 'James Wilson', tipe: 'Personal',
    jenisKelamin: 'Laki-laki', tanggalLahir: '1985-03-15',
    noHp: '081234567890', sumberLead: 'Website', picEfm: 'Sarah Jenkins',
    programDiminati: '12 Sesi - Pro', emailUmum: 'james.wilson@email.com',
    catatanAwal: 'Tertarik program fatloss, sudah follow up 2x',
    statusPipeline: 'Closing', orderId: 'PP-26-0013',
    tanggalMasuk: '20 Okt 2026', tanggalFollowUp: null,
    catatan: 'Order PP-26-0013 sudah dibuat',
    logAktivitas: [
      { status: 'Closing',   oleh: 'Sarah Jenkins', tanggal: '20 Okt 2026', catatan: 'Order berhasil dibuat — PP-26-0013' },
      { status: 'Closing',   oleh: 'Sarah Jenkins', tanggal: '18 Okt 2026', catatan: 'Klien setuju paket 12 sesi, deal dikonfirmasi' },
      { status: 'Screening', oleh: 'Sarah Jenkins', tanggal: '14 Okt 2026', catatan: 'Screening kesehatan selesai, BMI normal' },
      { status: 'Approach',  oleh: 'Sarah Jenkins', tanggal: '12 Okt 2026', catatan: 'Follow up via WhatsApp, klien tertarik' },
      { status: 'New',       oleh: 'Sarah Jenkins', tanggal: '10 Okt 2026', catatan: 'Lead masuk dari form website' },
    ],
  },
  {
    id: 'LP-0002', sapaan: 'Kak', nama: 'Dewi Ayu', tipe: 'Personal',
    jenisKelamin: 'Perempuan', tanggalLahir: '1993-07-22',
    noHp: '087766554433', sumberLead: 'Referral', picEfm: 'Marcus Chen',
    programDiminati: 'Tennis', emailUmum: 'dewi.ayu@email.com',
    catatanAwal: 'Direferensikan oleh klien lama',
    statusPipeline: 'Approach', tanggalMasuk: '7 Jun 2026',
    tanggalFollowUp: '2026-07-03', catatan: 'Belum respon follow up terakhir',
    logAktivitas: [
      { status: 'Approach', oleh: 'Marcus Chen', tanggal: '1 Jul 2026', catatan: 'Follow up kedua, belum ada respon' },
      { status: 'New',      oleh: 'Marcus Chen', tanggal: '7 Jun 2026', catatan: 'Lead masuk dari referral' },
    ],
  },
  {
    id: 'LP-0003', sapaan: 'Pak', nama: 'Budi & Rina Santoso', tipe: 'Couple',
    jenisKelamin: '', tanggalLahir: '',
    noHp: '085678901234', sumberLead: 'Walk-in', picEfm: 'Sarah Jenkins',
    programDiminati: '12 Sesi - Pro', emailUmum: 'budi.santoso@email.com',
    catatanAwal: 'Datang langsung ke lokasi, tertarik program couple',
    statusPipeline: 'Screening', tanggalMasuk: '6 Okt 2026',
    tanggalFollowUp: '2026-07-05', catatan: 'Menunggu jadwal screening kesehatan',
    logAktivitas: [
      { status: 'Screening', oleh: 'Sarah Jenkins', tanggal: '6 Okt 2026', catatan: 'Dijadwalkan screening minggu depan' },
      { status: 'New',       oleh: 'Sarah Jenkins', tanggal: '6 Okt 2026', catatan: 'Walk-in langsung ke lokasi' },
    ],
  },
  {
    id: 'LP-0004', sapaan: 'Mas', nama: 'Rian Maulana (Group Tennis)', tipe: 'Group',
    jenisKelamin: 'Laki-laki', tanggalLahir: '1990-11-08',
    noHp: '087712345678', sumberLead: 'Meta Ads', picEfm: 'Sarah Jenkins',
    programDiminati: 'Tennis Group', emailUmum: 'rian.maulana@email.com',
    catatanAwal: 'Mau daftar grup 4 orang untuk tennis',
    statusPipeline: 'New', tanggalMasuk: '15 Jun 2026',
    tanggalFollowUp: '2026-07-02', catatan: 'Baru masuk, belum dihubungi',
    logAktivitas: [
      { status: 'New', oleh: 'Sarah Jenkins', tanggal: '15 Jun 2026', catatan: 'Lead masuk dari iklan Meta Ads' },
    ],
  },
  {
    id: 'LP-0005', sapaan: 'Kak', nama: 'Anita Kumar', tipe: 'Personal',
    jenisKelamin: 'Perempuan', tanggalLahir: '1988-05-30',
    noHp: '081298765432', sumberLead: 'Meta Ads', picEfm: 'Sarah Jenkins',
    programDiminati: 'Fatloss & Bodyshape', emailUmum: 'anita.kumar@email.com',
    catatanAwal: 'Tertarik program fatloss',
    statusPipeline: 'Lost', tanggalMasuk: '15 Jun 2026',
    tanggalFollowUp: null, catatan: 'Tidak melanjutkan karena budget',
    logAktivitas: [
      { status: 'Lost',     oleh: 'Sarah Jenkins', tanggal: '20 Jun 2026', catatan: 'Klien menyatakan budget tidak sesuai' },
      { status: 'Approach', oleh: 'Sarah Jenkins', tanggal: '16 Jun 2026', catatan: 'Sudah follow up, masih pertimbangan' },
      { status: 'New',      oleh: 'Sarah Jenkins', tanggal: '15 Jun 2026', catatan: 'Lead masuk dari iklan' },
    ],
  },
  {
    id: 'LP-0006', sapaan: 'Kak', nama: 'Emily Chen', tipe: 'Personal',
    jenisKelamin: 'Perempuan', tanggalLahir: '1991-09-14',
    noHp: '082345678901', sumberLead: 'Instagram', picEfm: 'Marcus Chen',
    programDiminati: '4 Sesi - Starter', emailUmum: 'emily@email.com',
    catatanAwal: 'Tertarik program starter, fokus kebugaran umum',
    statusPipeline: 'Closing', orderId: 'PP-26-0012',
    tanggalMasuk: '15 Okt 2026', tanggalFollowUp: null,
    catatan: 'Order PP-26-0012 sudah dibuat',
    logAktivitas: [
      { status: 'Closing',   oleh: 'Marcus Chen', tanggal: '18 Okt 2026', catatan: 'Order berhasil dibuat — PP-26-0012' },
      { status: 'Approach',  oleh: 'Marcus Chen', tanggal: '15 Okt 2026', catatan: 'Follow up via WhatsApp, klien tertarik' },
      { status: 'New',       oleh: 'Marcus Chen', tanggal: '15 Okt 2026', catatan: 'Lead masuk dari Instagram' },
    ],
  },
  {
    id: 'LP-0007', sapaan: 'Kak', nama: 'Sari Dewi Lestari', tipe: 'Personal',
    jenisKelamin: 'Perempuan', tanggalLahir: '1994-02-10',
    noHp: '087811223344', sumberLead: 'Referral', picEfm: 'Dian Kartika',
    programDiminati: '8 Sesi - Basic', emailUmum: 'sari.dewi@email.com',
    catatanAwal: 'Tertarik muscle toning, direferensikan oleh teman',
    statusPipeline: 'Closing', orderId: 'PP-26-0021',
    tanggalMasuk: '28 Okt 2026', tanggalFollowUp: null,
    catatan: 'Order PP-26-0021 sudah dibuat',
    logAktivitas: [
      { status: 'Closing',   oleh: 'Dian Kartika', tanggal: '30 Okt 2026', catatan: 'Order berhasil dibuat — PP-26-0021' },
      { status: 'Approach',  oleh: 'Dian Kartika', tanggal: '28 Okt 2026', catatan: 'Follow up via WhatsApp, klien tertarik' },
      { status: 'New',       oleh: 'Dian Kartika', tanggal: '28 Okt 2026', catatan: 'Lead masuk dari referral' },
    ],
  },
]



/* ── WA Templates per pipeline stage ── */
const WA_TEMPLATES = {
  New: [
    {
      id: 'tpl-new-1', stage: 'New', judul: 'Perkenalan Awal',
      teks: (l) => `Halo ${l.sapaan || ''} ${l.nama}, saya ${l.picEfm || 'tim EFM'} dari Essential Fitness Management (EFM). Kami menerima informasi bahwa ${l.sapaan || ''} ${l.nama} tertarik dengan program ${l.programDiminati || 'fitness'} kami.\n\nBoleh kami berbagi informasi lebih lanjut tentang program yang sesuai untuk Anda? 😊`,
    },
    {
      id: 'tpl-new-2', stage: 'New', judul: 'Perkenalan — Via Referral',
      teks: (l) => `Halo ${l.sapaan || ''} ${l.nama}, saya ${l.picEfm || 'tim EFM'} dari EFM. Kami mendapat rekomendasi dari klien kami bahwa ${l.sapaan || ''} ${l.nama} tertarik dengan program fitness.\n\nKami dengan senang hati akan membantu menemukan program yang tepat untuk Anda! 💪`,
    },
  ],
  Approach: [
    {
      id: 'tpl-app-1', stage: 'Approach', judul: 'Follow-up Pertemuan',
      teks: (l) => `Halo ${l.sapaan || ''} ${l.nama}, saya ${l.picEfm || 'tim EFM'} dari EFM. Hanya ingin menindaklanjuti percakapan kita sebelumnya.\n\nApakah ${l.sapaan || ''} ${l.nama} sudah sempat mempertimbangkan program ${l.programDiminati || 'fitness'} kami? Kami siap menjawab pertanyaan apapun 😊`,
    },
    {
      id: 'tpl-app-2', stage: 'Approach', judul: 'Kirim Info Program',
      teks: (l) => `Halo ${l.sapaan || ''} ${l.nama}! Berikut info program ${l.programDiminati || 'fitness'} yang sesuai untuk Anda:\n\n🏋️ Program: ${l.programDiminati || '—'}\n📍 Lokasi: Studio EFM\n✅ Sudah termasuk: sesi bersama personal trainer berpengalaman\n\nAda pertanyaan? Kami siap membantu!`,
    },
  ],
  Screening: [
    {
      id: 'tpl-scr-1', stage: 'Screening', judul: 'Konfirmasi Jadwal Screening',
      teks: (l) => `Halo ${l.sapaan || ''} ${l.nama}, kami mengkonfirmasi jadwal sesi screening kesehatan Anda bersama tim EFM.\n\n📅 Tanggal: [isi tanggal]\n⏰ Waktu: [isi waktu]\n📍 Lokasi: Studio EFM\n\nMohon hadir 5–10 menit lebih awal. Sampai jumpa! 👋`,
    },
    {
      id: 'tpl-scr-2', stage: 'Screening', judul: 'Reminder H-1 Screening',
      teks: (l) => `Halo ${l.sapaan || ''} ${l.nama}! Mengingatkan bahwa besok ada sesi screening kesehatan di EFM.\n\n⏰ Hadir tepat waktu\n🚫 Hindari makan berat 2 jam sebelum sesi\n💧 Pastikan hidrasi cukup\n\nSampai jumpa besok! 💪`,
    },
  ],
  Closing: [
    {
      id: 'tpl-clo-1', stage: 'Closing', judul: 'Konfirmasi Deal — Anda Bergabung!',
      teks: (l) => `Halo ${l.sapaan || ''} ${l.nama}! Senang sekali mendengar kabar baik ini! 🎉\n\nKami mengkonfirmasi bahwa ${l.sapaan || ''} ${l.nama} resmi bergabung dengan program *${l.programDiminati || 'fitness'}* EFM.\n\nTim kami akan segera memproses order dan mengirimkan invoice untuk langkah selanjutnya 🙏`,
    },
    {
      id: 'tpl-clo-2', stage: 'Closing', judul: 'Info Langkah Berikutnya',
      teks: (l) => `Halo ${l.sapaan || ''} ${l.nama},\n\nTerima kasih telah memilih program *${l.programDiminati || 'fitness'}* bersama EFM! 💪\n\nBerikut langkah selanjutnya setelah deal ini:\n1️⃣ Tim kami akan membuat invoice resmi\n2️⃣ Setelah pembayaran, agreement disiapkan untuk ditandatangani\n3️⃣ Program latihan segera dijadwalkan\n\nNantikan konfirmasi dari kami. Sampai jumpa!`,
    },
  ],
  Lost: [
    {
      id: 'tpl-lst-1', stage: 'Lost', judul: 'Pesan Perpisahan — Tetap Terhubung',
      teks: (l) => `Halo ${l.sapaan || ''} ${l.nama}, terima kasih sudah meluangkan waktu bersama EFM.\n\nKami sangat menghargai perhatian Anda. Jika di masa mendatang ${l.sapaan || ''} ${l.nama} memiliki kesempatan untuk bergabung, kami selalu terbuka 😊\n\nSemoga sehat selalu!`,
    },
  ],
}


/* ═══════════════════════════════════════
   Helpers
═══════════════════════════════════════ */
const AVATAR_COLORS = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777','#0284C7']
function getInitials(name) { return (name || '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() }
function getAvatarColor(name) {
  let hash = 0
  for (const c of (name || '')) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFFFF
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
function formatFollowUp(dateStr) {
  if (!dateStr) return null
  try { return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return dateStr }
}

/* ═══════════════════════════════════════
   Sub-components
═══════════════════════════════════════ */
function TipeBadge({ tipe }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${TIPE_CLS[tipe] ?? 'bg-gray-100 text-gray-600'}`}>
      {tipe}
    </span>
  )
}

function StageBadge({ stage }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${STAGE_CLS[stage] ?? 'bg-gray-100 text-gray-600'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {stage}
    </span>
  )
}

function ScrBadge({ status }) {
  const cls = status === 'Selesai'
    ? 'bg-green-50 text-green-700'
    : status === 'Draft'
    ? 'bg-gray-100 text-gray-500'
    : 'bg-yellow-50 text-yellow-700'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${cls}`}>{status}</span>
}

function InfoField({ label, children }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 overflow-hidden min-w-0">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="text-sm font-semibold text-gray-800 break-words">{children}</div>
    </div>
  )
}

function Toast({ message, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg bg-green-600 text-white text-[13px] font-medium">
      {message}
      <button onClick={onClose} className="ml-1 text-white/70 hover:text-white"><X size={13} /></button>
    </div>
  )
}

/* ── WA Template Card ── */
function TemplateCard({ template, lead, onKirim }) {
  const [showPreview, setShowPreview] = useState(false)
  const teks = template.teks(lead)
  return (
    <div className="border border-gray-100 rounded-xl p-3.5 hover:border-gray-200 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{template.judul}</p>
          {showPreview
            ? <p className="text-xs text-gray-500 mt-1.5 whitespace-pre-line leading-relaxed">{teks}</p>
            : <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{teks.substring(0, 70)}…</p>
          }
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <button onClick={() => setShowPreview(p => !p)}
            className="h-7 px-2.5 rounded-lg border border-gray-200 text-[10px] font-medium text-gray-500 hover:bg-gray-50 transition-colors">
            {showPreview ? 'Tutup' : 'Preview'}
          </button>
          <button onClick={() => onKirim(template)}
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#25D366] hover:bg-[#1DA851] text-white text-[10px] font-semibold transition-colors">
            <MessageCircle size={11} /> Kirim WA
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Pipeline Stepper ── */
function PipelineStepper({ currentStage }) {
  const isLost = currentStage === 'Lost'
  const currentIdx = PIPELINE_LINEAR.indexOf(currentStage)

  return (
    <div>
      {/* Stepper */}
      <div className="flex items-start">
        {PIPELINE_LINEAR.map((stage, idx) => {
          const isCompleted = !isLost && idx < currentIdx
          const isCurrent   = !isLost && idx === currentIdx
          return (
            <div key={stage} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${isCompleted ? 'bg-[#1E1C43] text-white' : isCurrent ? 'bg-[#E05945] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <p className={`text-[10px] mt-1 text-center leading-tight
                  ${isCurrent ? 'font-bold text-[#E05945]' : isCompleted ? 'font-medium text-[#1E1C43]' : 'text-gray-400'}`}>
                  {stage}
                </p>
              </div>
              {idx < PIPELINE_LINEAR.length - 1 && (
                <div className={`h-0.5 flex-1 -mt-4 ${isCompleted ? 'bg-[#1E1C43]' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
      {/* Lost badge */}
      {isLost && (
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <span className="text-xs font-semibold text-red-600">Lead ditandai Lost — keluar dari pipeline</span>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
export default function PPLeadDetailPage() {
  const { id }         = useParams()
  const navigate       = useNavigate()
  const { state }      = useLocation()
  const { setCrumbs }  = useBreadcrumb()

  const [lead, setLead]             = useState(() => {
    const initial = state?.lead || LEADS_FALLBACK.find(l => l.id === id) || null
    if (!initial) return null
    try {
      const savedLog = localStorage.getItem(`lead-log-${id}`)
      if (savedLog) return { ...initial, logAktivitas: JSON.parse(savedLog) }
    } catch {}
    return initial
  })
  const [activeTab, setActiveTab]   = useState(state?.defaultTab || 'overview')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editForm, setEditForm]     = useState({})
  const [editingPipeline, setEditingPipeline] = useState(false)
  const [newStage, setNewStage]     = useState(lead?.statusPipeline || '')
  const [newStageTanggal, setNewStageTanggal] = useState(new Date().toISOString().split('T')[0])
  const [newStageCatatan, setNewStageCatatan] = useState('')
  const [toast, setToast]           = useState(null)
  const [infoKesehatan, setInfoKesehatan] = useState({
    kondisiSaatIni: id === 'LP-0001' ? 'Mengeluhkan lemak berlebih di area perut dan pinggul, tidak ada nyeri sendi' :
                    id === 'LP-0003' ? 'Budi: nyeri bahu kanan. Rina: kondisi prima, ingin lebih bugar' : '',
    riwayatCedera: id === 'LP-0001' ? 'Tidak ada riwayat cedera serius' :
                   id === 'LP-0003' ? 'Budi: pernah dislokasi bahu kanan (2024), sudah pulih. Rina: tidak ada' : '',
    tujuanProgram: id === 'LP-0001' ? 'Fatloss 8–10 kg, perbaiki postur, tingkatkan stamina kardio' :
                   id === 'LP-0003' ? 'Program couple, keduanya ingin lebih aktif dan sehat bersama' : '',
    obatanRutin: id === 'LP-0001' || id === 'LP-0003' ? '-' : '',
    catatanCs: id === 'LP-0001' ? 'Klien aktif, follow up responsif, siap mulai kapan saja' :
               id === 'LP-0003' ? 'Couple program, jadwal weekend lebih fleksibel' : '',
    sudahDiisi: id === 'LP-0001' || id === 'LP-0003',
  })
  const [editingInfoKesehatan, setEditingInfoKesehatan] = useState(false)
  const [editInfoForm, setEditInfoForm]   = useState({})
  const [dokumenKesehatan, setDokumenKesehatan] = useState(
    id === 'LP-0003' ? [{ id: 'DOK-001', nama: 'Surat Dokter - Budi Santoso.pdf', tipe: 'Surat Dokter', tanggal: '5 Okt 2026' }] : []
  )
  const [waLog, setWaLog] = useState(() => {
    try {
      const saved = localStorage.getItem(`lead-wa-log-${id}`)
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })
  const [showAllWaTemplates, setShowAllWaTemplates] = useState(false)

  useEffect(() => {
    if (lead) setCrumbs(['Private Program', 'Leads', lead.nama])
    return () => setCrumbs(null)
  }, [lead?.nama])

  useEffect(() => {
    if (lead?.logAktivitas) {
      try { localStorage.setItem(`lead-log-${id}`, JSON.stringify(lead.logAktivitas)) } catch {}
    }
  }, [lead?.logAktivitas, id])

  useEffect(() => {
    try { localStorage.setItem(`lead-wa-log-${id}`, JSON.stringify(waLog)) } catch {}
  }, [waLog, id])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <p className="text-gray-500 text-sm">Lead tidak ditemukan.</p>
        <button onClick={() => navigate('/pp/leads')}
          className="flex items-center gap-2 text-sm font-medium text-[#1E1C43] hover:underline">
          <ArrowLeft size={14} /> Kembali ke Leads
        </button>
      </div>
    )
  }

  const leadAssessments = Object.entries(getAllAssessments())
    .filter(([, a]) => a.leadId === lead.id)
    .map(([id, a]) => ({ id, ...a }))
    .sort((a, b) => (b.tanggalPreTest || '').localeCompare(a.tanggalPreTest || ''))

  /* ── Edit info handlers ── */
  function handleStartEdit() { setEditForm({ ...lead }); setIsEditMode(true) }
  function handleCancelEdit() { setIsEditMode(false); setEditForm({}) }
  function handleSaveEdit() {
    if (!editForm.nama || !editForm.tipe || !editForm.noHp) {
      alert('Nama, tipe, dan no HP wajib diisi.'); return
    }
    const fieldLabels = {
      nama: 'Nama Klien', noHp: 'No HP / WhatsApp', emailUmum: 'Email',
      tipe: 'Tipe Klien', programDiminati: 'Program Diminati',
      sumberLead: 'Sumber Lead', picEfm: 'PIC EFM',
      jenisKelamin: 'Jenis Kelamin', tanggalLahir: 'Tanggal Lahir',
      tanggalFollowUp: 'Tanggal Follow Up', catatanAwal: 'Catatan',
    }
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    const newLogEntries = Object.entries(fieldLabels)
      .filter(([key]) => (editForm[key] || '') !== (lead[key] || ''))
      .map(([key, label]) => ({
        status: 'Edit Data',
        tanggal: today,
        oleh: lead.picEfm || 'Admin EFM',
        catatan: `${label} diubah menjadi "${editForm[key] || '—'}"`,
      }))
    setLead({ ...editForm, logAktivitas: [...(lead.logAktivitas || []), ...newLogEntries] })
    setIsEditMode(false); setEditForm({})
    showToast('✓ Data lead berhasil diperbarui')
  }

  /* ── Pipeline update ── */
  function handleUpdatePipeline() {
    if (!newStageTanggal) { alert('Tanggal wajib diisi'); return }
    const updated = {
      ...lead,
      statusPipeline: newStage,
      logAktivitas: [
        ...(lead.logAktivitas || []),
        { tanggal: newStageTanggal, status: newStage, catatan: newStageCatatan || 'Status diperbarui', oleh: lead.picEfm || '' },
      ],
    }
    setLead(updated)
    setEditingPipeline(false)
    setNewStage(updated.statusPipeline)
    setNewStageTanggal(new Date().toISOString().split('T')[0])
    setNewStageCatatan('')
    showToast('✓ Status pipeline diperbarui')
  }

  function handleKirimWA(template) {
    const teks = template.teks(lead)
    const nomorBersih = (lead.noHp || '').replace(/^0/, '').replace(/\D/g, '')
    window.open(`https://wa.me/62${nomorBersih}?text=${encodeURIComponent(teks)}`, '_blank')
    const now = new Date()
    const timestamp = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    setWaLog(prev => [...prev, {
      id: `WAL-${String(prev.length + 1).padStart(3, '0')}`,
      timestamp, judul: template.judul, stage: template.stage,
      kirimOleh: lead.picEfm || 'Admin EFM', nomorTujuan: lead.noHp,
    }])
    showToast('✓ WA dibuka di tab baru')
  }

  const TABS = [
    { key: 'overview',  label: 'Overview'      },
    { key: 'riwayat',   label: 'Riwayat'       },
    { key: 'wa',        label: 'Komunikasi WA' },
  ]

  return (
    <>
      <div className="space-y-5">


        {/* ── Header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
                style={{ background: getAvatarColor(lead.nama) }}>
                {getInitials(lead.nama)}
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{lead.id}</p>
                <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">{lead.sapaan ? lead.sapaan + ' ' : ''}{lead.nama}</h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <TipeBadge tipe={lead.tipe} />
                  <StageBadge stage={lead.statusPipeline} />
                  <span className="text-[10px] text-gray-400">Masuk {lead.tanggalMasuk}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              <button
                onClick={() => { setEditingPipeline(p => !p); setNewStage(lead.statusPipeline) }}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#1E1C43] text-[#1E1C43] text-xs font-semibold hover:bg-[#1E1C43] hover:text-white transition-colors">
                <Edit2 size={12} /> Update Pipeline
              </button>
              {lead.statusPipeline !== 'Lost' && (
                <button
                  onClick={() => navigate('/pp/orders/new', {
                    state: { namaKlien: lead.nama, paket: lead.programDiminati, leadId: lead.id },
                  })}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
                  <Plus size={13} /> Buat Order
                </button>
              )}
              <button
                onClick={() => state?.fromOrderId ? navigate('/pp/orders/' + state.fromOrderId) : navigate('/pp/leads')}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">
                <ArrowLeft size={12} /> Kembali
              </button>
            </div>
          </div>

          {/* Pipeline Stepper — always visible in header */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <PipelineStepper currentStage={lead.statusPipeline} />

            {/* Edit form — expands inline when Update Pipeline clicked */}
            {editingPipeline && (
              <div className="border-t border-gray-100 pt-4 mt-3">
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Status Baru</label>
                      <select value={newStage} onChange={e => setNewStage(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]">
                        {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tanggal</label>
                      <input type="date" value={newStageTanggal} onChange={e => setNewStageTanggal(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Catatan</label>
                    <input type="text" value={newStageCatatan} onChange={e => setNewStageCatatan(e.target.value)}
                      placeholder="Catatan perubahan status..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]" />
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      onClick={() => setEditingPipeline(false)}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                      <X size={12} /> Batal
                    </button>
                    <button
                      onClick={handleUpdatePipeline}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                      <Save size={12} /> Simpan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl shadow-sm p-1 w-fit">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === t.key
                  ? 'bg-[#1E1C43] text-white'
                  : 'text-gray-500 hover:text-[#1E1C43]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════
            TAB 1: OVERVIEW
        ════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-4">

            {/* Info Klien */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Info Klien</h3>
                {!isEditMode ? (
                  <button onClick={handleStartEdit}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
                    <Edit2 size={12} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                      <Save size={12} /> Simpan
                    </button>
                    <button onClick={handleCancelEdit}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                      <X size={12} /> Batal
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5">
                {!isEditMode ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <InfoField label="Sapaan">{lead.sapaan || '—'}</InfoField>
                    <InfoField label="Nama Klien">{lead.nama || '—'}</InfoField>
                    <InfoField label="Jenis Kelamin">{lead.jenisKelamin || '—'}</InfoField>
                    <InfoField label="Tanggal Lahir">
                      {lead.tanggalLahir ? (() => {
                        const d = new Date(lead.tanggalLahir)
                        const today = new Date()
                        const age = today.getFullYear() - d.getFullYear() - (today < new Date(today.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0)
                        return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} (${age} tahun)`
                      })() : '—'}
                    </InfoField>
                    <InfoField label="No HP / WhatsApp">
                      <a href={`https://wa.me/62${lead.noHp.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer"
                        className="text-[#1E1C43] hover:underline">
                        {lead.noHp}
                      </a>
                    </InfoField>
                    <InfoField label="Email">
                      {lead.emailUmum
                        ? <a href={`mailto:${lead.emailUmum}`} className="text-[#1E1C43] hover:underline">{lead.emailUmum}</a>
                        : <span className="text-gray-400 italic">—</span>}
                    </InfoField>
                    <InfoField label="Tipe Klien">{lead.tipe}</InfoField>
                    <InfoField label="Program Diminati">{lead.programDiminati || '—'}</InfoField>
                    <InfoField label="Sumber Lead">{lead.sumberLead || '—'}</InfoField>
                    <InfoField label="PIC EFM">{lead.picEfm || '—'}</InfoField>
                    <InfoField label="Tanggal Masuk">{lead.tanggalMasuk || '—'}</InfoField>
                    <InfoField label="Follow Up Berikutnya">
                      {formatFollowUp(lead.tanggalFollowUp) || <span className="text-gray-400 italic">Tidak ada jadwal</span>}
                    </InfoField>
                    {lead.alamat && (
                      <div className="col-span-1 sm:col-span-2 md:col-span-3 bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Alamat</p>
                        <p className="text-sm text-gray-700">{lead.alamat}</p>
                      </div>
                    )}
                    {(lead.catatan || lead.catatanAwal) && (
                      <div className="col-span-1 sm:col-span-2 md:col-span-3 bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Catatan</p>
                        <p className="text-sm text-gray-700">{lead.catatan || lead.catatanAwal}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Edit form */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Sapaan</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.sapaan || ''} onChange={e => setEditForm(p => ({ ...p, sapaan: e.target.value }))}>
                        {['Kak','Pak','Bu','Mas','Mbak'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-span-full">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Nama Klien <span className="text-red-500">*</span>
                      </label>
                      <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.nama || ''} onChange={e => setEditForm(p => ({ ...p, nama: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Jenis Kelamin</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.jenisKelamin || ''} onChange={e => setEditForm(p => ({ ...p, jenisKelamin: e.target.value }))}>
                        <option value="">Pilih...</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tanggal Lahir</label>
                      <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.tanggalLahir || ''} onChange={e => setEditForm(p => ({ ...p, tanggalLahir: e.target.value || '' }))} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tipe <span className="text-red-500">*</span></label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.tipe || ''} onChange={e => setEditForm(p => ({ ...p, tipe: e.target.value }))}>
                        <option>Personal</option><option>Group</option><option>Couple</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">No HP <span className="text-red-500">*</span></label>
                      <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.noHp || ''} onChange={e => setEditForm(p => ({ ...p, noHp: e.target.value }))} placeholder="08xx-xxxx-xxxx" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                      <input type="email" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.emailUmum || ''} onChange={e => setEditForm(p => ({ ...p, emailUmum: e.target.value }))} />
                    </div>
                    <div className="col-span-full">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Alamat</label>
                      <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.alamat || ''} onChange={e => setEditForm(p => ({ ...p, alamat: e.target.value }))} placeholder="Jl. ..." />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Sumber Lead</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.sumberLead || ''} onChange={e => setEditForm(p => ({ ...p, sumberLead: e.target.value }))}>
                        <option value="">Pilih Sumber...</option>
                        {SUMBER_OPTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Program Diminati</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.programDiminati || ''} onChange={e => setEditForm(p => ({ ...p, programDiminati: e.target.value }))}>
                        <option value="">Pilih Program...</option>
                        {getStoredJenis().filter(j => j.status === 'aktif').map(j => <option key={j.nama}>{j.nama}</option>)}
                        <option>Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">PIC EFM</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.picEfm || ''} onChange={e => setEditForm(p => ({ ...p, picEfm: e.target.value }))}>
                        {PIC_OPTS.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tanggal Follow Up</label>
                      <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editForm.tanggalFollowUp || ''} onChange={e => setEditForm(p => ({ ...p, tanggalFollowUp: e.target.value || null }))} />
                    </div>
                    <div className="col-span-full">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Catatan</label>
                      <textarea rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] resize-none"
                        value={editForm.catatanAwal || ''} onChange={e => setEditForm(p => ({ ...p, catatanAwal: e.target.value }))} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Informasi Kesehatan Awal ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Informasi Kesehatan Awal</h3>
                  <p className="text-xs text-gray-400 pl-4 mt-0.5">Dikumpulkan via WA sebelum pembayaran</p>
                </div>
                {!editingInfoKesehatan ? (
                  <button
                    onClick={() => { setEditInfoForm({ ...infoKesehatan }); setEditingInfoKesehatan(true) }}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
                    <Edit2 size={12} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setInfoKesehatan({ ...editInfoForm, sudahDiisi: true })
                        setEditingInfoKesehatan(false)
                        showToast('✓ Informasi kesehatan berhasil disimpan')
                      }}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                      <Save size={12} /> Simpan
                    </button>
                    <button
                      onClick={() => { setEditingInfoKesehatan(false); setEditInfoForm({}) }}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                      <X size={12} /> Batal
                    </button>
                  </div>
                )}
              </div>
              <div className="p-5">
                {!infoKesehatan.sudahDiisi && !editingInfoKesehatan && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <p className="text-xs text-yellow-700 font-medium">Informasi kesehatan awal belum diisi. Klik Edit untuk mengisi data hasil screening via WhatsApp.</p>
                  </div>
                )}
                {!editingInfoKesehatan ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Kondisi & Keluhan Saat Ini</p>
                      <p className="text-sm text-gray-700">{infoKesehatan.kondisiSaatIni || <span className="text-gray-400 italic">Belum diisi</span>}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Riwayat Cedera / Penyakit</p>
                      <p className="text-sm text-gray-700">{infoKesehatan.riwayatCedera || <span className="text-gray-400 italic">Belum diisi</span>}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tujuan / Goals Program</p>
                      <p className="text-sm text-gray-700">{infoKesehatan.tujuanProgram || <span className="text-gray-400 italic">Belum diisi</span>}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Obat-obatan Rutin</p>
                      <p className="text-sm text-gray-700">{infoKesehatan.obatanRutin || <span className="text-gray-400 italic">Tidak ada</span>}</p>
                    </div>
                    {infoKesehatan.catatanCs && (
                      <div className="col-span-1 md:col-span-2 bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Catatan CS / Admin</p>
                        <p className="text-sm text-gray-700">{infoKesehatan.catatanCs}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Kondisi & Keluhan Saat Ini</label>
                      <textarea rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] resize-none"
                        value={editInfoForm.kondisiSaatIni || ''} onChange={e => setEditInfoForm(p => ({ ...p, kondisiSaatIni: e.target.value }))}
                        placeholder="Deskripsikan kondisi dan keluhan klien..." />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Riwayat Cedera / Penyakit</label>
                      <textarea rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] resize-none"
                        value={editInfoForm.riwayatCedera || ''} onChange={e => setEditInfoForm(p => ({ ...p, riwayatCedera: e.target.value }))}
                        placeholder="Riwayat cedera atau penyakit sebelumnya..." />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tujuan / Goals Program</label>
                      <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editInfoForm.tujuanProgram || ''} onChange={e => setEditInfoForm(p => ({ ...p, tujuanProgram: e.target.value }))}
                        placeholder="Tujuan mengikuti program..." />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Obat-obatan Rutin</label>
                      <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                        value={editInfoForm.obatanRutin || ''} onChange={e => setEditInfoForm(p => ({ ...p, obatanRutin: e.target.value }))}
                        placeholder="Tidak ada / nama obat..." />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Catatan CS / Admin</label>
                      <textarea rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] resize-none"
                        value={editInfoForm.catatanCs || ''} onChange={e => setEditInfoForm(p => ({ ...p, catatanCs: e.target.value }))}
                        placeholder="Catatan tambahan dari CS..." />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Dokumen Kesehatan ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Dokumen Kesehatan</h3>
                <button
                  onClick={() => showToast('Fitur upload akan tersedia setelah koneksi backend')}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">
                  <Upload size={12} /> Upload Dokumen
                </button>
              </div>
              <div className="p-5">
                {dokumenKesehatan.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Belum ada dokumen (MRI, rontgen, surat dokter, hasil lab)</p>
                ) : (
                  <div className="space-y-1.5">
                    {dokumenKesehatan.map(dok => (
                      <div key={dok.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <FileText size={14} className="text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">{dok.nama}</p>
                          <p className="text-[10px] text-gray-400">{dok.tipe} · {dok.tanggal}</p>
                        </div>
                        <button className="text-[10px] text-[#1E1C43] font-semibold hover:underline shrink-0">Lihat</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Riwayat Fitness Assessment ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Riwayat Fitness Assessment</h3>
                  <p className="text-xs text-gray-400 pl-4 mt-0.5">Pre-test & post-test dari semua order klien ini</p>
                </div>
                <button
                  onClick={() => navigate('/pp/screening/new', { state: { leadId: lead.id, namaKlien: lead.nama } })}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
                  <Plus size={12} /> Buat Assessment
                </button>
              </div>
              <div className="p-5">
                {leadAssessments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-6">Belum ada fitness assessment untuk klien ini.</p>
                ) : (
                  <div className="space-y-2">
                    {leadAssessments.map(a => {
                      const statusCls =
                        a.statusAssessment === 'Post-Test Selesai' ? 'bg-green-50 text-green-700 border-green-200' :
                        a.statusAssessment === 'Pre-Test Selesai'  ? 'bg-blue-50 text-blue-700 border-blue-200'   :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      return (
                        <button
                          key={a.id}
                          onClick={() => navigate('/pp/screening/' + a.id)}
                          className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-[#1E1C43] transition-colors text-left group">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-bold text-[#1E1C43]">{a.id}</span>
                              {a.prevAssessmentId && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200">Renewal</span>
                              )}
                              <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${statusCls}`}>{a.statusAssessment || 'Draft'}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {a.tanggalPreTest ? new Date(a.tanggalPreTest).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                              {a.orderId ? ` · Order #${a.orderId}` : ''}
                              {a.namaFC ? ` · FC: ${a.namaFC}` : ''}
                            </p>
                          </div>
                          <Eye size={14} className="text-gray-400 group-hover:text-[#1E1C43] transition-colors ml-3 shrink-0" />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Riwayat Aktivitas */}
            {(lead.logAktivitas || []).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Riwayat Aktivitas</h3>
                  <span className="text-xs text-gray-400">{(lead.logAktivitas || []).length} entri</span>
                </div>
                <div className="p-5">
                  <div className="space-y-0 pl-4 relative">
                    {[...(lead.logAktivitas || [])].reverse().map((log, i, arr) => (
                      <div key={i} className="relative pb-4 last:pb-0">
                        <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-[#E05945]" />
                        {i < arr.length - 1 && <div className="absolute -left-[13px] top-3 w-px bottom-0 bg-gray-200" />}
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${STAGE_CLS[log.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {log.status}
                          </span>
                          {log.oleh && <span className="text-[10px] text-gray-500 font-medium">· {log.oleh}</span>}
                          <span className="text-[10px] text-gray-400">· {log.tanggal}</span>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed break-words">{log.catatan}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ════════════════════════════════
            TAB 2: RIWAYAT
        ════════════════════════════════ */}
        {activeTab === 'riwayat' && (
          <div className="space-y-4">

            {/* Riwayat Order — Related Records Panel */}
            {(() => {
              const leadOrders = getAllOrders()
                .filter(o => o.leadId === lead.id)
                .sort((a, b) => b.tanggalMulai.localeCompare(a.tanggalMulai))
              return (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#1E1C43] flex items-center gap-2">
                      <FileText size={14} /> Riwayat Order
                    </h3>
                    {lead.statusPipeline !== 'Lost' && (
                      <button
                        onClick={() => navigate('/pp/orders/new', { state: { namaKlien: lead.nama, paket: lead.programDiminati, leadId: lead.id } })}
                        className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-[10px] font-semibold transition-colors">
                        <Plus size={10} /> Buat Order
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {leadOrders.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">Belum ada order dari lead ini.</p>
                    ) : (
                      leadOrders.map(order => {
                        const statusCls =
                          order.statusOrder === 'Aktif'     ? 'bg-green-50 text-green-700 border-green-200' :
                          order.statusOrder === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200'   :
                          order.statusOrder === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200'       :
                          'bg-gray-50 text-gray-500 border-gray-200'
                        const statusLabel =
                          order.statusOrder === 'Aktif'     ? 'Aktif'      :
                          order.statusOrder === 'Completed' ? 'Selesai'    :
                          order.statusOrder === 'Cancelled' ? 'Dibatalkan' :
                          order.statusOrder
                        return (
                          <div
                            key={order.id}
                            onClick={() => navigate('/pp/orders/' + order.id, { state: { fromLeadId: lead.id } })}
                            className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-[#1E1C43]/10 flex items-center justify-center shrink-0">
                                <FileText size={14} className="text-[#1E1C43]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#1E1C43] truncate">#{order.id}</p>
                                <p className="text-[10px] text-gray-400 truncate">{order.paket} · Mulai {formatFollowUp(order.tanggalMulai)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-semibold text-[#1E1C43]">Rp {order.nilaiKontrak.toLocaleString('id-ID')}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusCls}`}>{statusLabel}</span>
                              <ExternalLink size={13} className="text-gray-300 group-hover:text-[#1E1C43] transition-colors" />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })()}

          </div>
        )}


        {/* ════════════════════════════════
            TAB 3: KOMUNIKASI WA
        ════════════════════════════════ */}
        {activeTab === 'wa' && (
          <div className="space-y-4">

            {/* Template Panel */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Komunikasi WhatsApp</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Stage:</span>
                  <StageBadge stage={lead.statusPipeline} />
                </div>
              </div>

              {/* Nomor tujuan */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-5">
                <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                  <MessageCircle size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Nomor Tujuan</p>
                  <p className="text-sm font-semibold text-gray-800">{lead.sapaan ? lead.sapaan + ' ' : ''}{lead.nama} · {lead.noHp}</p>
                </div>
              </div>

              {/* Template untuk stage saat ini */}
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Template untuk Stage Saat Ini: {lead.statusPipeline}
                </p>
                <div className="space-y-2">
                  {(WA_TEMPLATES[lead.statusPipeline] || []).length > 0
                    ? (WA_TEMPLATES[lead.statusPipeline] || []).map(tpl => (
                        <TemplateCard key={tpl.id} template={tpl} lead={lead} onKirim={handleKirimWA} />
                      ))
                    : <p className="text-xs text-gray-400 italic">Tidak ada template khusus untuk stage ini.</p>
                  }
                </div>
              </div>

              {/* Template lainnya (collapsible) */}
              <div>
                <button
                  onClick={() => setShowAllWaTemplates(p => !p)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1E1C43] transition-colors mb-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    {showAllWaTemplates ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                  </svg>
                  {showAllWaTemplates ? 'Sembunyikan' : 'Lihat'} semua template
                </button>
                {showAllWaTemplates && (
                  <div className="space-y-4 pt-1">
                    {Object.entries(WA_TEMPLATES)
                      .filter(([stage]) => stage !== lead.statusPipeline)
                      .map(([stage, templates]) => (
                        <div key={stage}>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Stage: {stage}</p>
                          <div className="space-y-2">
                            {templates.map(tpl => (
                              <TemplateCard key={tpl.id} template={tpl} lead={lead} onKirim={handleKirimWA} />
                            ))}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Log Pengiriman */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Log Pengiriman WA</h3>
                <span className="text-xs text-gray-400">{waLog.length} terkirim</span>
              </div>
              {waLog.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-4">Belum ada WA yang dikirim via EFM untuk lead ini.</p>
              ) : (
                <div className="space-y-2">
                  {[...waLog].reverse().map((log, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 mt-0.5">
                        <MessageCircle size={12} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-gray-800">{log.judul}</p>
                          <span className="text-[10px] text-gray-400 shrink-0">{log.timestamp}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Dikirim oleh {log.kirimOleh} · ke {log.nomorTujuan}
                          {log.stage && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500">{log.stage}</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
