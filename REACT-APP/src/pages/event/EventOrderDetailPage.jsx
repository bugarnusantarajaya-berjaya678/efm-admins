import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { getCompanySettings } from '../../utils/companySettings'
import { ArrowLeft, ChevronRight, Edit2, Save, X, Plus, Trash2, ChevronDown, ExternalLink, Printer, Eye, Download, CheckCircle, MapPin, Users, Calendar, ClipboardList, AlertTriangle, Activity, ImageIcon, FileText, Clock, Upload, MessageCircle } from 'lucide-react'

/* ═══════════════════════════════════════
   WA Templates — Event Order Context
═══════════════════════════════════════ */
const EVENT_ORDER_WA_TEMPLATES = {
  'Quotation': [
    {
      id: 'evowt-quo-1', tahapan: 'Quotation', judul: 'Kirim Penawaran Event',
      teks: (o) => `Halo ${o.contactPerson || o.namaKlien},\n\nSaya ${o.pic || 'tim EFM'} dari Essential Fitness Management.\n\nTerima kasih atas kesempatan untuk berdiskusi mengenai *${o.namaEvent || o.jenisEvent || 'event fitness'}* bersama ${o.namaKlien}.\n\nKami sudah menyiapkan penawaran/quotation yang dapat segera kami kirimkan untuk direview. Apakah kami bisa menghubungi lebih lanjut untuk presentasi penawaran?\n\nTerima kasih 🙏`,
    },
    {
      id: 'evowt-quo-2', tahapan: 'Quotation', judul: 'Follow-up Penawaran',
      teks: (o) => `Halo ${o.contactPerson || o.namaKlien},\n\nKami ingin menindaklanjuti penawaran untuk *${o.namaEvent || 'event fitness'}* yang sudah kami kirimkan sebelumnya.\n\nApakah ada pertanyaan atau hal yang perlu kami klarifikasi dari penawaran tersebut? Kami siap mendiskusikan lebih lanjut 😊\n\nTerima kasih`,
    },
  ],
  'MOU': [
    {
      id: 'evowt-mou-1', tahapan: 'MOU', judul: 'Update Proses MOU',
      teks: (o) => `Halo ${o.contactPerson || o.namaKlien},\n\nKami ingin memberikan update mengenai proses MOU untuk *${o.namaEvent || 'event fitness'}*.\n\nDokumen MOU saat ini sedang dalam proses finalisasi dari pihak kami. Kami akan segera menginformasikan begitu siap untuk ditandatangani.\n\nTerima kasih atas kesabarannya 🙏`,
    },
    {
      id: 'evowt-mou-2', tahapan: 'MOU', judul: 'MOU Siap Ditandatangani',
      teks: (o) => `Halo ${o.contactPerson || o.namaKlien},\n\nMOU untuk *${o.namaEvent || 'event fitness'}* sudah selesai disiapkan dan siap untuk ditandatangani oleh kedua belah pihak.\n\nMohon konfirmasi waktu yang paling tepat untuk proses penandatanganan. Terima kasih!`,
    },
  ],
  'Contract': [
    {
      id: 'evowt-con-1', tahapan: 'Contract', judul: 'Konfirmasi Kontrak Aktif',
      teks: (o) => `Halo ${o.contactPerson || o.namaKlien}! 🎉\n\nKontrak untuk *${o.namaEvent || 'event fitness'}* sudah resmi aktif. Kami sangat antusias untuk menyelenggarakan event ini bersama ${o.namaKlien}!\n\nTim EFM akan segera menghubungi untuk koordinasi persiapan teknis event. Terima kasih atas kepercayaannya 🙏`,
    },
    {
      id: 'evowt-con-2', tahapan: 'Contract', judul: 'Update Persiapan Teknis Event',
      teks: (o) => `Halo ${o.contactPerson || o.namaKlien},\n\nKami ingin berkoordinasi mengenai persiapan teknis *${o.namaEvent || 'event fitness'}*:\n\n📋 Detail lokasi & layout\n🎵 Sound system & peralatan\n👥 Jumlah peserta yang dikonfirmasi\n⏰ Rundown acara\n\nDapat kami jadwalkan meeting koordinasi dalam waktu dekat? Terima kasih!`,
    },
  ],
  'Event Running': [
    {
      id: 'evowt-run-1', tahapan: 'Event Running', judul: 'Update H-1 Event',
      teks: (o) => `Halo ${o.contactPerson || o.namaKlien},\n\nMengingatkan bahwa *${o.namaEvent || 'event fitness'}* akan berlangsung *besok*! 🎉\n\nTim EFM sudah siap dan akan tiba di lokasi sesuai jadwal yang disepakati.\n\nAda hal yang perlu dikonfirmasi atau dipersiapkan terakhir? Silakan hubungi kami. Sampai besok! 💪`,
    },
    {
      id: 'evowt-run-2', tahapan: 'Event Running', judul: 'Pesan Hari-H Event',
      teks: (o) => `Halo ${o.contactPerson || o.namaKlien}! Selamat hari-H *${o.namaEvent || 'event fitness'}*! 🎊\n\nTim EFM sudah siap di lokasi. Semoga event hari ini berjalan lancar dan semua peserta menikmati pengalaman fitness terbaik bersama kami! 💪\n\nSampai jumpa di lokasi!`,
    },
  ],
  'Event Selesai': [
    {
      id: 'evowt-sel-1', tahapan: 'Event Selesai', judul: 'Ucapan Terima Kasih Post-Event',
      teks: (o) => `Halo ${o.contactPerson || o.namaKlien}! 🎉\n\nTerima kasih atas kepercayaan ${o.namaKlien} kepada EFM untuk menyelenggarakan *${o.namaEvent || 'event fitness'}*!\n\nKami berharap event berjalan sesuai harapan dan semua peserta puas dengan pengalaman yang diberikan.\n\nKami akan segera mengirimkan laporan penyelenggaraan. Salam sehat! 🙏`,
    },
    {
      id: 'evowt-sel-2', tahapan: 'Event Selesai', judul: 'Follow-up Laporan & Pelunasan',
      teks: (o) => `Halo ${o.contactPerson || o.namaKlien},\n\nLaporan penyelenggaraan *${o.namaEvent || 'event fitness'}* sudah kami siapkan.\n\nKami juga ingin mengingatkan mengenai proses pelunasan pembayaran sesuai kesepakatan di kontrak.\n\nSilakan konfirmasi jika ada pertanyaan. Terima kasih atas kerjasamanya! 🙏`,
    },
    {
      id: 'evowt-sel-3', tahapan: 'Event Selesai', judul: 'Tawaran Event Berikutnya',
      teks: (o) => `Halo ${o.contactPerson || o.namaKlien},\n\nSenang bisa bekerja sama di *${o.namaEvent || 'event fitness'}*. Semoga hasilnya memuaskan!\n\nJika ${o.namaKlien} berencana mengadakan event fitness serupa di masa mendatang, kami sangat terbuka untuk berdiskusi kembali.\n\nTerima kasih! Salam sehat dari tim EFM 💪`,
    },
  ],
}

const TAHAPAN_WA_EV_CLS = {
  'Quotation':     'bg-amber-100 text-amber-700',
  'MOU':           'bg-blue-100 text-blue-700',
  'Contract':      'bg-purple-100 text-purple-700',
  'Event Running': 'bg-green-100 text-green-700',
  'Event Selesai': 'bg-gray-100 text-gray-500',
}

/* ═══════════════════════════════════════
   Constants
═══════════════════════════════════════ */
const BULAN_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const PAY_TERMS_OPTS = ['Full Payment', '50% DP + Pelunasan', 'Custom']
const PAY_STATUS_OPTS = ['Belum Ditagih','Invoice Terkirim','Lunas','Jatuh Tempo']

const TAHAPAN_CLS = {
  'Quotation':     'bg-amber-100 text-amber-700',
  'MOU':           'bg-blue-100 text-blue-700',
  'Contract':      'bg-purple-100 text-purple-700',
  'Event Running': 'bg-green-100 text-green-700',
  'Event Selesai': 'bg-gray-100 text-gray-500',
}
const STATUS_CLS = {
  Aktif:   'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Selesai: 'bg-gray-100 text-gray-600',
  Batal:   'bg-red-100 text-red-600',
}
const PAY_STATUS_CLS = {
  'Belum Ditagih':   'bg-gray-100 text-gray-500',
  'Invoice Terkirim':'bg-blue-100 text-blue-700',
  'Lunas':           'bg-green-100 text-green-700',
  'Jatuh Tempo':     'bg-red-100 text-red-600',
}

const AVATAR_COLORS = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777','#0284C7']
function getInitials(name) { return (name || '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() }
function getAvatarColor(name) {
  let hash = 0
  for (const c of (name || '')) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFFFF
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function EventTahapanStepper({ currentTahapan }) {
  const steps = ['Quotation', 'MOU', 'Contract', 'Event Running', 'Event Selesai']
  const order = { 'Quotation': 0, 'MOU': 1, 'Contract': 2, 'Event Running': 3, 'Event Selesai': 4 }
  const currentIdx = order[currentTahapan] ?? 0
  return (
    <div className="flex items-start">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIdx
        const isCurrent   = idx === currentIdx
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${isCompleted ? 'bg-[#1E1C43] text-white' : isCurrent ? 'bg-[#E05945] text-white' : 'bg-gray-100 text-gray-400'}`}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <p className={`text-[10px] mt-1 text-center leading-tight
                ${isCurrent ? 'font-bold text-[#E05945]' : isCompleted ? 'font-medium text-[#1E1C43]' : 'text-gray-400'}`}>
                {step}
              </p>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 flex-1 -mt-4 ${isCompleted ? 'bg-[#1E1C43]' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function fmtRp(n) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n)
}
function fmtDate(str) {
  if (!str) return '—'
  const d = new Date(str)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function EventOrderTahapanBadge({ tahapan }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${TAHAPAN_WA_EV_CLS[tahapan] ?? 'bg-gray-100 text-gray-600'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {tahapan}
    </span>
  )
}

function EventOrderTemplateCard({ template, ctx, onKirim }) {
  const [showPreview, setShowPreview] = useState(false)
  const teks = template.teks(ctx)
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
          <button
            onClick={() => setShowPreview(p => !p)}
            className="h-7 px-2.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {showPreview ? 'Tutup' : 'Preview'}
          </button>
          <button
            onClick={() => onKirim(template)}
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[#25D366] hover:bg-[#1DA851] text-white text-xs font-medium transition-colors"
          >
            <MessageCircle size={11} /> Kirim WA
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   Master data (mirrors EventOrdersPage)
═══════════════════════════════════════ */
const dummyEventOrders = [
  {
    id: 'EV-26-0020',
    namaKlien: 'Yayasan Dharma Bhakti',    tipeKlien: 'Foundation', jenis: 'Foundation',
    namaEvent: 'Dharma Fun Run 2026',       jenisEvent: 'Fun Run',   peranEFM: 'Main Organizer',
    lokasiEvent: 'Taman Mini Indonesia Indah, Jakarta Timur',
    tglEvent: '2026-04-22', program: 'Main Organizer – Dharma Fun Run 2026',
    nilaiNum: 60_000_000, periode: 'Apr 2026',
    tanggalMulai: '2026-04-01', tanggalSelesai: '2026-04-22',
    tahapan: 'Quotation', status: 'Pending', pic: 'Dinda',
    contactPerson: 'Ibu Retno Widiastuti', telepon: '0812-3344-5566',
    catatan: '', konsultasiId: 'KNS-26-0020', kategori: ['kat1', 'kat3'],
    payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0019',
    namaKlien: 'PT. Telkom Indonesia Tbk', tipeKlien: 'Corporate',  jenis: 'Corporate',
    namaEvent: 'Telkom Active Life 2026',   jenisEvent: 'Corporate Wellness', peranEFM: 'Main Organizer',
    lokasiEvent: 'Graha Merah Putih, Jakarta Selatan',
    tglEvent: '2026-03-14', program: 'Main Organizer – Telkom Active Life 2026',
    nilaiNum: 135_000_000, periode: 'Mar 2026',
    tanggalMulai: '2026-02-15', tanggalSelesai: '2026-03-14',
    tahapan: 'Event Selesai', status: 'Selesai', pic: 'Bagoes',
    contactPerson: 'Bapak Arif Wicaksono', telepon: '0811-2233-4455',
    catatan: 'Event corporate wellness skala besar. 1.500 karyawan Telkom.', konsultasiId: 'KNS-26-0019',
    kategori: ['kat1', 'kat2'], payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0018',
    namaKlien: 'Komunitas Fitnes Jakarta',  tipeKlien: 'Community',  jenis: 'Community',
    namaEvent: 'Outdoor HIIT Blast Vol.3',  jenisEvent: 'HIIT Event', peranEFM: 'Main Organizer',
    lokasiEvent: 'Lapangan Banteng, Jakarta Pusat',
    tglEvent: '2026-02-07', program: 'Main Organizer – Outdoor HIIT Blast Vol.3',
    nilaiNum: 30_000_000, periode: 'Feb 2026',
    tanggalMulai: '2026-01-15', tanggalSelesai: '2026-02-07',
    tahapan: 'Quotation', status: 'Batal', pic: 'Rudi',
    contactPerson: 'Bapak Yudi Pratama', telepon: '0878-8899-0011',
    catatan: 'Event dibatalkan karena peserta tidak mencukupi target minimum.', konsultasiId: 'KNS-26-0018',
    kategori: ['kat1'], payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0017',
    namaKlien: 'PT. Bank Mandiri Tbk',      tipeKlien: 'Corporate',  jenis: 'Corporate',
    namaEvent: 'Mandiri Marathon Charity 2026', jenisEvent: 'Charity Run', peranEFM: 'Co-Organizer',
    lokasiEvent: 'Monas, Jakarta Pusat',
    tglEvent: '2026-01-25', program: 'Co-Organizer – Mandiri Marathon Charity 2026',
    nilaiNum: 160_000_000, periode: 'Jan 2026',
    tanggalMulai: '2025-12-15', tanggalSelesai: '2026-01-25',
    tahapan: 'Event Selesai', status: 'Selesai', pic: 'Emma',
    contactPerson: 'Ibu Diana Kusuma', telepon: '0812-6677-8899',
    catatan: 'Event charity run bersama Bank Mandiri. Total peserta 5.000 orang.', konsultasiId: 'KNS-26-0017',
    kategori: ['kat1', 'kat3'], payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0016',
    namaKlien: 'Nike Indonesia',             tipeKlien: 'Brand',      jenis: 'Brand',
    namaEvent: 'Nike Run Club Jakarta 2026', jenisEvent: 'Fun Run',   peranEFM: 'Fitness Partner',
    lokasiEvent: 'GBK, Jakarta Selatan',
    tglEvent: '2026-12-12', program: 'Fitness Partner – Nike Run Club Jakarta 2026',
    nilaiNum: 220_000_000, periode: 'Des 2026',
    tanggalMulai: '2026-11-01', tanggalSelesai: '2026-12-12',
    tahapan: 'Contract', status: 'Aktif', pic: 'Bagoes',
    contactPerson: 'Bapak Kevin Santoso', telepon: '0815-9988-7766',
    catatan: 'Partnership dengan Nike. Target 10.000 peserta.', konsultasiId: 'KNS-26-0016',
    kategori: ['kat1', 'kat3'], payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0015',
    namaKlien: 'Yayasan Peduli Gizi',        tipeKlien: 'Foundation', jenis: 'Foundation',
    namaEvent: 'Walk for Nutrition 2026',    jenisEvent: 'Charity Run', peranEFM: 'Main Organizer',
    lokasiEvent: 'Bunderan HI, Jakarta Pusat',
    tglEvent: '2026-04-18', program: 'Main Organizer – Walk for Nutrition 2026',
    nilaiNum: 45_000_000, periode: 'Apr 2026',
    tanggalMulai: '2026-03-20', tanggalSelesai: '2026-04-18',
    tahapan: 'Event Selesai', status: 'Selesai', pic: 'Dinda',
    contactPerson: 'Ibu Amelia Nuraini', telepon: '0822-1122-3344',
    catatan: '', konsultasiId: 'KNS-26-0015', kategori: ['kat1', 'kat3'],
    payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0014',
    namaKlien: 'PT. Unilever Indonesia Tbk', tipeKlien: 'Corporate', jenis: 'Corporate',
    namaEvent: 'Unilever Run for Health 2026', jenisEvent: 'Fun Run', peranEFM: 'Main Organizer',
    lokasiEvent: 'Serpong, Tangerang Selatan',
    tglEvent: '2026-11-08', program: 'Main Organizer – Unilever Run for Health 2026',
    nilaiNum: 95_000_000, periode: 'Nov 2026',
    tanggalMulai: '2026-10-01', tanggalSelesai: '2026-11-08',
    tahapan: 'Quotation', status: 'Pending', pic: 'Emma',
    contactPerson: 'Bapak Reza Permana', telepon: '0813-4455-6677',
    catatan: '', konsultasiId: 'KNS-26-0014', kategori: ['kat1', 'kat3'],
    payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0013',
    namaKlien: 'Pemprov Jawa Barat',         tipeKlien: 'Government', jenis: 'Government',
    namaEvent: 'Jabar Bergerak 2026',         jenisEvent: 'Mass Event', peranEFM: 'Main Organizer',
    lokasiEvent: 'Lapangan Gasibu, Bandung',
    tglEvent: '2026-10-25', program: 'Main Organizer – Jabar Bergerak 2026',
    nilaiNum: 250_000_000, periode: 'Okt 2026',
    tanggalMulai: '2026-09-15', tanggalSelesai: '2026-10-25',
    tahapan: 'MOU', status: 'Aktif', pic: 'Rudi',
    contactPerson: 'Bapak Asep Sudrajat', telepon: '0812-7788-9900',
    catatan: 'Event skala provinsi. Koordinasi dengan Dinas Olahraga Jabar.', konsultasiId: 'KNS-26-0013',
    kategori: ['kat1', 'kat3'], payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0012',
    namaKlien: 'PT. Indofood Sukses Makmur', tipeKlien: 'Corporate', jenis: 'Corporate',
    namaEvent: 'Indofood Corporate Wellness Day', jenisEvent: 'Corporate Wellness', peranEFM: 'Main Organizer',
    lokasiEvent: 'Gedung Ariobimo, Jakarta Selatan',
    tglEvent: '2026-09-19', program: 'Main Organizer – Indofood Corporate Wellness Day',
    nilaiNum: 110_000_000, periode: 'Sep 2026',
    tanggalMulai: '2026-08-15', tanggalSelesai: '2026-09-19',
    tahapan: 'Contract', status: 'Aktif', pic: 'Bagoes',
    contactPerson: 'Ibu Fitri Handayani', telepon: '0811-5566-7788',
    catatan: '', konsultasiId: 'KNS-26-0012', kategori: ['kat1', 'kat2'],
    payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0011',
    namaKlien: 'Komunitas Yoga Nusantara',   tipeKlien: 'Community',  jenis: 'Community',
    namaEvent: 'Sunday Yoga in the Park',    jenisEvent: 'Yoga',      peranEFM: 'Main Organizer',
    lokasiEvent: 'Taman Menteng, Jakarta Pusat',
    tglEvent: '2026-06-21', program: 'Main Organizer – Sunday Yoga in the Park',
    nilaiNum: 22_000_000, periode: 'Jun 2026',
    tanggalMulai: '2026-05-15', tanggalSelesai: '2026-06-21',
    tahapan: 'Event Selesai', status: 'Selesai', pic: 'Dinda',
    contactPerson: 'Ibu Laras Puspita', telepon: '0878-2233-4455',
    catatan: '', konsultasiId: 'KNS-26-0011', kategori: ['kat1'],
    payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0010',
    namaKlien: 'Pocari Sweat Indonesia',     tipeKlien: 'Brand',      jenis: 'Brand',
    namaEvent: 'Pocari Sweat Run 2026',       jenisEvent: 'Charity Run', peranEFM: 'Fitness Partner',
    lokasiEvent: 'Ancol, Jakarta Utara',
    tglEvent: '2026-11-15', program: 'Fitness Partner – Pocari Sweat Run 2026',
    nilaiNum: 180_000_000, periode: 'Nov 2026',
    tanggalMulai: '2026-10-01', tanggalSelesai: '2026-11-15',
    tahapan: 'MOU', status: 'Aktif', pic: 'Emma',
    contactPerson: 'Bapak Hideki Tanaka', telepon: '0812-0099-8877',
    catatan: 'Partnership dengan Pocari Sweat. Target 8.000 peserta.', konsultasiId: 'KNS-26-0010',
    kategori: ['kat1', 'kat3'], payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0009',
    namaKlien: 'PT. Bank Central Asia Tbk',  tipeKlien: 'Corporate',  jenis: 'Corporate',
    namaEvent: 'BCA Fun Fit 2026',            jenisEvent: 'Fun Run',   peranEFM: 'Co-Organizer',
    lokasiEvent: 'Pantai Karnaval, Ancol',
    tglEvent: '2026-10-03', program: 'Co-Organizer – BCA Fun Fit 2026',
    nilaiNum: 55_000_000, periode: 'Okt 2026',
    tanggalMulai: '2026-09-01', tanggalSelesai: '2026-10-03',
    tahapan: 'Quotation', status: 'Pending', pic: 'Rudi',
    contactPerson: 'Ibu Christin Halim', telepon: '0815-6677-8899',
    catatan: '', konsultasiId: 'KNS-26-0009', kategori: ['kat1', 'kat3'],
    payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0008',
    namaKlien: 'Kementerian Kesehatan RI',   tipeKlien: 'Government', jenis: 'Government',
    namaEvent: 'Gerak Indonesia Sehat 2026', jenisEvent: 'Mass Event', peranEFM: 'Main Organizer',
    lokasiEvent: 'Monas, Jakarta Pusat',
    tglEvent: '2026-08-09', program: 'Main Organizer – Gerak Indonesia Sehat 2026',
    nilaiNum: 200_000_000, periode: 'Agu 2026',
    tanggalMulai: '2026-07-01', tanggalSelesai: '2026-08-09',
    tahapan: 'Contract', status: 'Aktif', pic: 'Bagoes',
    contactPerson: 'Bapak Dr. Arman Prasetyo', telepon: '0811-3344-5566',
    catatan: 'Event nasional peringatan HUT RI. Koordinasi intensif dengan Kemenkes.', konsultasiId: 'KNS-26-0008',
    kategori: ['kat1', 'kat2', 'kat3'], payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0007',
    namaKlien: 'Yayasan Jantung Indonesia',  tipeKlien: 'Foundation', jenis: 'Foundation',
    namaEvent: 'Heart Health Run Jakarta',   jenisEvent: 'Fun Run',   peranEFM: 'Main Organizer',
    lokasiEvent: 'Gelanggang Remaja, Jakarta Selatan',
    tglEvent: '2026-05-30', program: 'Main Organizer – Heart Health Run Jakarta',
    nilaiNum: 75_000_000, periode: 'Mei 2026',
    tanggalMulai: '2026-05-01', tanggalSelesai: '2026-05-30',
    tahapan: 'Event Selesai', status: 'Selesai', pic: 'Emma',
    contactPerson: 'Dr. Hartono Wijaya', telepon: '0812-4455-6677',
    catatan: '', konsultasiId: 'KNS-26-0007', kategori: ['kat1', 'kat3'],
    payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0006',
    namaKlien: 'PT. Tokopedia Technology',   tipeKlien: 'Corporate',  jenis: 'Corporate',
    namaEvent: 'Tokopedia Health Fest 2026', jenisEvent: 'HIIT Event', peranEFM: 'Main Organizer',
    lokasiEvent: 'Epiwalk Office Park, Jakarta Selatan',
    tglEvent: '2026-09-26', program: 'Main Organizer – Tokopedia Health Fest 2026',
    nilaiNum: 90_000_000, periode: 'Sep 2026',
    tanggalMulai: '2026-08-15', tanggalSelesai: '2026-09-26',
    tahapan: 'MOU', status: 'Pending', pic: 'Bagoes',
    contactPerson: 'Ibu Grace Tanardi', telepon: '0878-5566-7788',
    catatan: '', konsultasiId: 'KNS-26-0006', kategori: ['kat1'],
    payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0005',
    namaKlien: 'Komunitas Sehat ID',          tipeKlien: 'Community',  jenis: 'Community',
    namaEvent: 'Zumba Sabtu Ceria Vol.7',     jenisEvent: 'Zumba',     peranEFM: 'Main Organizer',
    lokasiEvent: 'Taman Literasi Martha Tiahahu, Jakarta Selatan',
    tglEvent: '2026-08-11', program: 'Main Organizer – Zumba Sabtu Ceria Vol.7',
    nilaiNum: 18_000_000, periode: 'Agu 2026',
    tanggalMulai: '2026-07-15', tanggalSelesai: '2026-08-11',
    tahapan: 'Event Selesai', status: 'Selesai', pic: 'Dinda',
    contactPerson: 'Ibu Nisa Fadilah', telepon: '0822-8899-0011',
    catatan: '', konsultasiId: 'KNS-26-0005', kategori: ['kat1'],
    payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0004',
    namaKlien: 'PT. Astra International Tbk', tipeKlien: 'Corporate', jenis: 'Corporate',
    namaEvent: 'Astra Corporate Wellness Day 2026', jenisEvent: 'Corporate Wellness', peranEFM: 'Main Organizer',
    lokasiEvent: 'Wisma Argo Manunggal, Jakarta Selatan',
    tglEvent: '2026-07-20', program: 'Main Organizer – Astra Corporate Wellness Day 2026',
    nilaiNum: 150_000_000, periode: 'Jul 2026',
    tanggalMulai: '2026-06-15', tanggalSelesai: '2026-07-20',
    tahapan: 'Contract', status: 'Aktif', pic: 'Emma',
    contactPerson: 'Bapak Irfan Halim', telepon: '0812-2233-4455',
    catatan: 'Event wellness karyawan Astra skala besar.', konsultasiId: 'KNS-26-0004',
    kategori: ['kat1', 'kat2'], payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0003',
    namaKlien: 'Yayasan Kanker Indonesia',    tipeKlien: 'Foundation', jenis: 'Foundation',
    namaEvent: 'Health Run for Hope 2026',    jenisEvent: 'Charity Run', peranEFM: 'Main Organizer',
    lokasiEvent: 'GBK, Jakarta Selatan',
    tglEvent: '2026-06-28', program: 'Main Organizer – Health Run for Hope 2026',
    nilaiNum: 85_000_000, periode: 'Jun 2026',
    tanggalMulai: '2026-06-01', tanggalSelesai: '2026-06-28',
    tahapan: 'Event Running', status: 'Aktif', pic: 'Bagoes',
    contactPerson: 'Bapak Hendra Gunawan', telepon: '0812-3456-7890',
    catatan: 'Event skala besar 2.000 peserta. Venue GBK sudah confirmed.', konsultasiId: 'KNS-26-0001',
    kategori: ['kat1', 'kat3'], payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0002',
    namaKlien: 'PT. Garuda Nusa Tbk',         tipeKlien: 'Corporate',  jenis: 'Corporate',
    namaEvent: 'Corporate Fun Run 2026',      jenisEvent: 'Fun Run',   peranEFM: 'Co-Organizer',
    lokasiEvent: 'Lapangan Senayan, Jakarta Pusat',
    tglEvent: '2026-07-15', program: 'Co-Organizer – Corporate Fun Run 2026',
    nilaiNum: 40_000_000, periode: 'Jul 2026',
    tanggalMulai: '2026-07-01', tanggalSelesai: '2026-07-15',
    tahapan: 'Contract', status: 'Aktif', pic: 'Emma',
    contactPerson: 'Ibu Sari Dewi', telepon: '0821-9876-5432',
    catatan: '', konsultasiId: 'KNS-26-0003', kategori: ['kat1'],
    payTerms: '50% DP + Pelunasan',
  },
  {
    id: 'EV-26-0001',
    namaKlien: 'Dinas Pemuda & Olahraga DKI', tipeKlien: 'Government', jenis: 'Government',
    namaEvent: 'Hari Olahraga Nasional DKI',  jenisEvent: 'Mass Event', peranEFM: 'Main Organizer',
    lokasiEvent: 'Monas, Jakarta Pusat',
    tglEvent: '2026-08-17', program: 'Main Organizer – Hari Olahraga Nasional DKI',
    nilaiNum: 120_000_000, periode: 'Agu 2026',
    tanggalMulai: '2026-07-15', tanggalSelesai: '2026-08-17',
    tahapan: 'Quotation', status: 'Pending', pic: 'Bagoes',
    contactPerson: 'Bapak Drs. Wahyu Santosa', telepon: '0812-1122-3344',
    catatan: 'Event Haornas 2026. Koordinasi dengan Dispora DKI Jakarta.', konsultasiId: 'KNS-26-0001',
    kategori: ['kat1', 'kat3'], payTerms: '50% DP + Pelunasan',
  },
]
const ORDERS_MAP = Object.fromEntries(dummyEventOrders.map(o => [o.id, o]))

/* ── Per-order line items ─────────────────────────────────────────────────── */
const LINE_ITEMS_MAP = {
  'EV-26-0003': [
    { id: 1, namaItem: 'Jasa Event Organizer & Koordinasi',   satuan: 'Paket', jumlah: 1, keterangan: 'Main organizer fitness segment' },
    { id: 2, namaItem: 'Instruktur & Tim Lapangan (5 orang)', satuan: 'Hari',  jumlah: 1, keterangan: '5 instruktur + 3 koordinator' },
    { id: 3, namaItem: 'Peralatan & Perlengkapan Fitness',    satuan: 'Paket', jumlah: 1, keterangan: 'Sewa peralatan event' },
  ],
}
function defaultLineItems(order) {
  return LINE_ITEMS_MAP[order?._key] || [
    { id: 1, namaItem: order?.program || '', satuan: 'Bulan', jumlah: 1, keterangan: '' },
  ]
}

/* ── Quotation status styles ──────────────────────────────────────────────── */
const QUOTATION_STATUS_CLS = {
  'Draft':     'bg-gray-100 text-gray-600',
  'Terkirim':  'bg-blue-100 text-blue-700',
  'Disetujui': 'bg-green-100 text-green-700',
  'Ditolak':   'bg-red-100 text-red-600',
  'Revisi':    'bg-yellow-100 text-yellow-700',
}

/* ── Tahapan stepper ─────────────────────────────────────────────────────── */
const TAHAPAN_STEPS = ['Quotation', 'MOU', 'Contract', 'Event Running', 'Event Selesai']
const TAHAPAN_ORDER = { 'Quotation': 0, 'MOU': 1, 'Contract': 2, 'Event Running': 3, 'Event Selesai': 4 }

/* ── Generate payment schedule ────────────────────────────────────────────── */
function generatePayRows(_startStr, _endStr, terms, nilaiNum) {
  if (terms === '50% DP + Pelunasan') {
    const dp = Math.round(nilaiNum * 0.5)
    return [
      { id: 0, periode: 'DP (50%)',        nominal: dp,            status: 'Belum Ditagih', tglBayar: '', jatuhTempo: '' },
      { id: 1, periode: 'Pelunasan (50%)', nominal: nilaiNum - dp, status: 'Belum Ditagih', tglBayar: '', jatuhTempo: '' },
    ]
  }
  if (terms === 'Full Payment') {
    return [{ id: 0, periode: 'Full Payment', nominal: nilaiNum, status: 'Belum Ditagih', tglBayar: '', jatuhTempo: '' }]
  }
  return []
}

/* ── Invoice / Receipt ID lookup maps ────────────────────────────────────── */
const INVOICE_ID_MAP = {
  'EV-26-0003|DP (50%)':        'INV-EV-26-0001',
  'EV-26-0003|Pelunasan (50%)': 'INV-EV-26-0002',
  'EV-26-0002|DP (50%)':        'INV-EV-26-0003',
  'EV-26-0002|Pelunasan (50%)': 'INV-EV-26-0004',
}
const RECEIPT_ID_MAP = {
  'EV-26-0003|DP (50%)': 'RCP-EV-26-0001',
  'EV-26-0002|DP (50%)': 'RCP-EV-26-0002',
}

/* ── EO-001 specific payment rows ─────────────────────────────────────────── */
const PAY_ROWS_EO001 = [
  { id: 0, periode: 'DP (50%)',        nominal: 42_500_000, status: 'Lunas',          tglBayar: '2026-06-05', jatuhTempo: '2026-06-01' },
  { id: 1, periode: 'Pelunasan (50%)', nominal: 42_500_000, status: 'Belum Ditagih',  tglBayar: '',           jatuhTempo: '2026-06-25' },
]

/* ═══════════════════════════════════════
   Small reusable components
═══════════════════════════════════════ */
function Badge({ children, cls }) {
  return (
    <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {children}
    </span>
  )
}

function SectionCard({ title, editing, onEdit, onSave, onCancel, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-[#1E1C43]">{title}</h3>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={onSave}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Save size={12} /> Simpan
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                <X size={12} /> Batal
              </button>
            </>
          ) : (
            onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors"
              >
                <Edit2 size={12} /> Edit
              </button>
            )
          )}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#1E1C43]' : 'bg-gray-200'}`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
export default function EventOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const settings = getCompanySettings()
  const isNew = !id || id === 'new'
  const fromState = location.state || {}

  const order = isNew
    ? {
        id: 'BARU',
        namaKlien: fromState?.namaPerusahaan || '',
        jenis: fromState?.tipe || 'Corporate',
        program: '',
        tanggalMulai: '',
        tanggalSelesai: '',
        pic: '',
        contactPerson: fromState?.picKlien || '',
        telepon: fromState?.noHP || '',
        catatan: fromState?.rekomendasi || '',
        status: 'Draft',
        tahapan: 'Quotation',
        nilaiNum: 0,
        nilai: 'Rp 0',
        periode: '',
        payTerms: '50% DP + Pelunasan',
      }
    : ORDERS_MAP[id]

  /* ── Section state ───────────────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState('keuangan')
  const [editingSection, setEditingSection] = useState(isNew ? 'infoDeal' : null)
  // null | 'infoDeal' | 'quotation' | 'paymentTerms' | 'profitSharing'

  /* Section 1 — Info Deal */
  const initInfo = order
    ? { namaKlien: order.namaKlien, jenis: order.jenis, program: order.program,
        tanggalMulai: order.tanggalMulai, tanggalSelesai: order.tanggalSelesai,
        pic: order.pic, contactPerson: order.contactPerson,
        telepon: order.telepon, catatan: order.catatan }
    : {}
  const [infoDeal, setInfoDeal] = useState(initInfo)
  const [infoDraft, setInfoDraft] = useState(initInfo)

  const initItems = order ? (LINE_ITEMS_MAP[id] || defaultLineItems({ ...order, _key: id })) : []
  const [lineItems, setLineItems] = useState(initItems)
  const [itemsDraft, setItemsDraft] = useState(initItems)

  /* Section Quotation */
  const initQuotationItems = id === 'EV-26-0003'
    ? [
        { id: 1, item: 'Jasa Event Organizer & Koordinasi',   satuan: 'Paket', jumlah: 1, rate: 50_000_000 },
        { id: 2, item: 'Instruktur & Tim Lapangan (5 orang)', satuan: 'Hari',  jumlah: 1, rate: 25_000_000 },
        { id: 3, item: 'Peralatan & Perlengkapan Fitness',    satuan: 'Paket', jumlah: 1, rate: 10_000_000 },
      ]
    : (order ? [{ id: 1, item: order.program, satuan: 'Paket', jumlah: 1, rate: order.nilaiNum }] : [])
  const [quotationData, setQuotationData] = useState({
    nomorQuotation: id === 'EV-26-0003' ? 'QUO-EVENT-001' : `QUO-${id}`,
    tanggal: order?.tanggalMulai || '',
    berlakuSampai: '2026-06-15',
    items: initQuotationItems,
    managementFee: { aktif: false, persen: 0 },
    pajakList: [{ id: 1, nama: 'PPN', persen: 11, aktif: true }],
    catatanSyarat: '',
    status: 'Terkirim',
  })
  const [quotationDraft, setQuotationDraft] = useState(null)

  /* Section 2 — Payment Terms */
  const initPayTerms = order?.payTerms || '50% DP + Pelunasan'
  const initPayRows  = id === 'EV-26-0003'
    ? PAY_ROWS_EO001
    : order ? generatePayRows(order.tanggalMulai, order.tanggalSelesai, order.payTerms, order.nilaiNum) : []
  const [payTerms, setPayTerms] = useState(initPayTerms)
  const [payRows,  setPayRows]  = useState(initPayRows)
  const [payTermsDraft, setPayTermsDraft] = useState(initPayTerms)
  const [payRowsDraft,  setPayRowsDraft]  = useState(initPayRows)

  /* Section 3 — Profit Sharing */
  const [hasPS, setHasPS] = useState(false)
  const initPS = [
    { id: 1, periode: 'Jun 2026', totalProfit: 12_000_000, persen: 15, status: 'Lunas',         tglTerima: '2026-06-10' },
    { id: 2, periode: 'Jul 2026', totalProfit: 12_000_000, persen: 15, status: 'Belum Diterima', tglTerima: '' },
  ]
  const [psRows,      setPsRows]      = useState(initPS)
  const [psRowsDraft, setPsRowsDraft] = useState(initPS)
  const [psPersen, setPsPersen]       = useState(15)
  const [psPersenDraft, setPsPersenDraft] = useState(15)

  /* ── Tab 2: Dokumen ─────────────────────────────────────────────────────── */
  const [expandMOU, setExpandMOU] = useState(false)
  const [expandC,   setExpandC]   = useState(true)
  const [adaMOU,    setAdaMOU]    = useState(false)
  const [editingDoc, setEditingDoc] = useState(null) // null|'quotation'|'mou'|'contract'

  const [mouDoc, setMouDoc] = useState({ status: 'Drafting', gdocsUrl: '', riwayat: [] })
  const [cDoc, setCDoc] = useState({ status: 'Signed', gdocsUrl: 'https://docs.google.com/document/d/xyz789', riwayat: [{ id:1, nama:'contract-yayasan-kanker-final.pdf', tgl:'10 Jun 2026', status:'Signed' }] })
  const [mouDraft, setMouDraft] = useState(null)
  const [cDraft, setCDraft]   = useState(null)

  /* ── Tab 2: Jadwal Kegiatan ──────────────────────────────────────────────── */
  const [editingJadwal, setEditingJadwal] = useState(null)
  const [showTambahKegiatan, setShowTambahKegiatan] = useState(false)
  const [kgForm, setKgForm] = useState({ nama:'', vendor:'', tglMulai:'', tglSelesai:'', status:'Terjadwal' })
  const [kegiatanList, setKegiatanList] = useState([
    { id:1, nama:'Technical Meeting dengan Klien',  vendor:'Bagoes',                 tglMulai:'15 Jun 2026', tglSelesai:'15 Jun 2026', status:'Selesai'    },
    { id:2, nama:'Survei Lokasi Venue GBK',          vendor:'Rudi Hartono',           tglMulai:'18 Jun 2026', tglSelesai:'18 Jun 2026', status:'Selesai'    },
    { id:3, nama:'Produksi Materi Promosi',          vendor:'CV. Event Decoration',   tglMulai:'20 Jun 2026', tglSelesai:'25 Jun 2026', status:'Berlangsung' },
    { id:4, nama:'Konfirmasi Sound System',          vendor:'PT. Sound System Pro',   tglMulai:'26 Jun 2026', tglSelesai:'26 Jun 2026', status:'Terjadwal'  },
    { id:5, nama:'Hari H Event',                     vendor:'Tim EFM',                tglMulai:'28 Jun 2026', tglSelesai:'28 Jun 2026', status:'Terjadwal'  },
  ])
  const [kegiatanDraft, setKegiatanDraft] = useState([])


  /* ── Tab 3: Operasional Lapangan ─────────────────────────────────────────── */
  const dummyPICs = [
    { id: "PIC-001", nama: "Rudi Hartono",  spesialisasi: "Personal Trainer",     wa: "081234567891", status: "Aktif" },
    { id: "PIC-002", nama: "Sari Dewi",     spesialisasi: "Yoga Instructor",       wa: "081234567892", status: "Aktif" },
    { id: "PIC-003", nama: "Bima Prakoso",  spesialisasi: "Zumba Instructor",      wa: "081234567893", status: "Aktif" },
    { id: "PIC-004", nama: "Nia Rahayu",    spesialisasi: "Pilates Instructor",    wa: "081234567894", status: "Aktif" },
    { id: "PIC-005", nama: "Doni Kusuma",   spesialisasi: "Functional Training",   wa: "081234567895", status: "Aktif" },
  ]

  const dummyMitras = [
    { id: "MTR-E01", nama: "PT. Sound System Pro",    tipe: "Vendor",        peran: "Sound System & Stage",     wa: "0211234567",   status: "Aktif" },
    { id: "MTR-E02", nama: "CV. Event Decoration",    tipe: "Vendor",        peran: "Dekorasi, Tenda & Backdrop",wa: "082198765432", status: "Aktif" },
    { id: "MTR-E03", nama: "Creative Visual Studio",  tipe: "Vendor",        peran: "Foto & Videografi",        wa: "081234509876", status: "Aktif" },
    { id: "MTR-E04", nama: "Andi Presenter Pro",      tipe: "Mitra Pelatih", peran: "MC & Host Event",          wa: "087812345678", status: "Aktif" },
  ]

  const dummyKonsultasiRef = [
    { id: "KNS-26-0001", leadId: "LE-0001", namaEvent: "Hari Olahraga Nasional DKI", tanggal: "2026-07-15", lokasi: "Monas, Jakarta Pusat", jumlahPeserta: "5.000", peranEFM: "Main Organizer", programKegiatan: ["Mass Running", "Senam Massal", "Warm-up & Cool-down"] },
    { id: "KNS-26-0002", leadId: "LE-0002", namaEvent: "Corporate Fun Run 2026", tanggal: "2026-06-01", lokasi: "Lapangan Senayan, Jakarta Pusat", jumlahPeserta: "300", peranEFM: "Co-Organizer", programKegiatan: ["Fun Run 5K", "Warm-up Bersama", "Lucky Draw"] },
    { id: "KNS-26-0003", leadId: "LE-0003", namaEvent: "Health Run for Hope 2026", tanggal: "2026-05-10", lokasi: "GBK, Jakarta Selatan", jumlahPeserta: "1.500", peranEFM: "Main Organizer", programKegiatan: ["Charity Run 5K & 10K", "Yoga Outdoor", "Zumba"] },
    { id: "KNS-26-0004", leadId: "LE-0004", namaEvent: "Astra Corporate Wellness Day 2026", tanggal: "2026-06-15", lokasi: "Wisma Argo Manunggal, Jakarta Selatan", jumlahPeserta: "800", peranEFM: "Main Organizer", programKegiatan: ["Senam Massal", "HIIT Circuit", "Nutrition Talk"] },
    { id: "KNS-26-0005", leadId: "LE-0005", namaEvent: "Zumba Sabtu Ceria Vol.7", tanggal: "2026-07-01", lokasi: "Taman Literasi Martha Tiahahu, Jakarta Selatan", jumlahPeserta: "200", peranEFM: "Main Organizer", programKegiatan: ["Zumba", "Cool-down Stretching"] },
    { id: "KNS-26-0006", leadId: "LE-0006", namaEvent: "Tokopedia Health Fest 2026", tanggal: "2026-08-20", lokasi: "Epiwalk Office Park, Jakarta Selatan", jumlahPeserta: "600", peranEFM: "Main Organizer", programKegiatan: ["HIIT Outdoor", "Fun Run 3K", "Health Screening Booth"] },
    { id: "KNS-26-0007", leadId: "LE-0007", namaEvent: "Heart Health Run Jakarta", tanggal: "2026-04-20", lokasi: "Gelanggang Remaja, Jakarta Selatan", jumlahPeserta: "1.200", peranEFM: "Main Organizer", programKegiatan: ["Fun Run 5K", "Zumba", "Edukasi Kesehatan Jantung"] },
    { id: "KNS-26-0008", leadId: "LE-0008", namaEvent: "Gerak Indonesia Sehat 2026", tanggal: "2026-06-30", lokasi: "Monas, Jakarta Pusat", jumlahPeserta: "10.000", peranEFM: "Main Organizer", programKegiatan: ["Senam Nusantara", "Fun Walk", "Pilates Massal"] },
    { id: "KNS-26-0009", leadId: "LE-0009", namaEvent: "BCA Fun Fit 2026", tanggal: "2026-08-15", lokasi: "Pantai Karnaval, Ancol", jumlahPeserta: "500", peranEFM: "Co-Organizer", programKegiatan: ["Fun Run 5K", "Beach Workout", "Lucky Draw"] },
    { id: "KNS-26-0010", leadId: "LE-0010", namaEvent: "Pocari Sweat Run 2026", tanggal: "2026-09-20", lokasi: "Ancol, Jakarta Utara", jumlahPeserta: "3.000", peranEFM: "Fitness Partner", programKegiatan: ["Fun Run 5K & 10K", "Hydration Station", "Post-Run Yoga"] },
    { id: "KNS-26-0011", leadId: "LE-0011", namaEvent: "Sunday Yoga in the Park", tanggal: "2026-05-10", lokasi: "Taman Menteng, Jakarta Pusat", jumlahPeserta: "150", peranEFM: "Main Organizer", programKegiatan: ["Hatha Yoga", "Pranayama", "Meditation"] },
    { id: "KNS-26-0012", leadId: "LE-0012", namaEvent: "Indofood Corporate Wellness Day", tanggal: "2026-08-01", lokasi: "Gedung Ariobimo, Jakarta Selatan", jumlahPeserta: "700", peranEFM: "Main Organizer", programKegiatan: ["Senam Massal", "Functional Fitness", "Health Talk"] },
    { id: "KNS-26-0013", leadId: "LE-0013", namaEvent: "Jabar Bergerak 2026", tanggal: "2026-09-10", lokasi: "Lapangan Gasibu, Bandung", jumlahPeserta: "20.000", peranEFM: "Main Organizer", programKegiatan: ["Senam Massal", "Fun Walk", "HIIT Outdoor"] },
    { id: "KNS-26-0014", leadId: "LE-0014", namaEvent: "Unilever Run for Health 2026", tanggal: "2026-09-15", lokasi: "Serpong, Tangerang Selatan", jumlahPeserta: "1.000", peranEFM: "Main Organizer", programKegiatan: ["Fun Run 5K", "Zumba", "Healthy Living Workshop"] },
    { id: "KNS-26-0015", leadId: "LE-0015", namaEvent: "Walk for Nutrition 2026", tanggal: "2026-03-10", lokasi: "Bunderan HI, Jakarta Pusat", jumlahPeserta: "800", peranEFM: "Main Organizer", programKegiatan: ["Charity Walk 3K", "Edukasi Gizi", "Senam Anak"] },
    { id: "KNS-26-0016", leadId: "LE-0016", namaEvent: "Nike Run Club Jakarta 2026", tanggal: "2026-10-01", lokasi: "GBK, Jakarta Selatan", jumlahPeserta: "2.500", peranEFM: "Fitness Partner", programKegiatan: ["Fun Run 5K & 10K", "Nike Training Session", "Photo Booth"] },
    { id: "KNS-26-0017", leadId: "LE-0017", namaEvent: "Mandiri Marathon Charity 2026", tanggal: "2026-12-01", lokasi: "Monas, Jakarta Pusat", jumlahPeserta: "4.000", peranEFM: "Co-Organizer", programKegiatan: ["Marathon 10K & 21K", "Warm-up Massal", "Award Ceremony"] },
    { id: "KNS-26-0018", leadId: "LE-0018", namaEvent: "Outdoor HIIT Blast Vol.3", tanggal: "2026-01-10", lokasi: "Lapangan Banteng, Jakarta Pusat", jumlahPeserta: "100", peranEFM: "Main Organizer", programKegiatan: ["HIIT Circuit", "Tabata", "Cool-down"] },
    { id: "KNS-26-0019", leadId: "LE-0019", namaEvent: "Telkom Active Life 2026", tanggal: "2026-01-20", lokasi: "Graha Merah Putih, Jakarta Selatan", jumlahPeserta: "1.500", peranEFM: "Main Organizer", programKegiatan: ["Senam Massal", "Fun Run 5K", "Cycling Tour"] },
    { id: "KNS-26-0020", leadId: "LE-0020", namaEvent: "Dharma Fun Run 2026", tanggal: "2026-03-01", lokasi: "Taman Mini Indonesia Indah, Jakarta Timur", jumlahPeserta: "600", peranEFM: "Main Organizer", programKegiatan: ["Fun Run 5K", "Family Walk", "Charity Auction"] },
  ]
  const konsultasiTerkait = order ? dummyKonsultasiRef.find((k) => k.id === order.konsultasiId) : null

  const [timLapangan, setTimLapangan] = useState([
    { id: "TL-001", sourceId: "PIC-001", sourceType: "PIC",   nama: "Rudi Hartono",        tipe: "PIC EFM", peran: "Event Coordinator",  wa: "081234567891", status: "Aktif", spesialisasi: "Personal Trainer", pksStatus: "Signed",    warna: "#E05945" },
    { id: "TL-002", sourceId: "PIC-002", sourceType: "PIC",   nama: "Sari Dewi",           tipe: "PIC EFM", peran: "Fitness Stage Host", wa: "081234567892", status: "Aktif", spesialisasi: "Yoga Instructor",  pksStatus: "Generated", warna: "#2980B9" },
    { id: "TL-003", sourceId: "MTR-001", sourceType: "Mitra", nama: "PT. Sound System Pro", tipe: "Vendor",  peran: "Sound System & Stage", wa: "0211234567", status: "Aktif" },
    { id: "TL-004", sourceId: "PIC-003", sourceType: "PIC",   nama: "Bima Prakoso",        tipe: "PIC EFM", peran: "Instructor",         wa: "081234567893", status: "Aktif", spesialisasi: "Zumba Instructor", pksStatus: "Belum",     warna: "#27AE60" },
  ])

  const [jadwalOperasional, setJadwalOperasional] = useState([
    { id: "JDW-001", tanggal: "2026-06-15", jam: "10:00", kegiatan: "Technical Meeting & Briefing Tim",  pic: "Rudi Hartono", status: "Selesai"      },
    { id: "JDW-002", tanggal: "2026-06-27", jam: "07:00", kegiatan: "Gladi Bersih Event",               pic: "Rudi Hartono", status: "Dijadwalkan"  },
    { id: "JDW-003", tanggal: "2026-06-28", jam: "05:30", kegiatan: "Persiapan Event Hari H",           pic: "Sari Dewi",    status: "Dijadwalkan"  },
  ])

  const [laporanKunjungan, setLaporanKunjungan] = useState([
    { id: "LK-001", tanggal: "2026-06-18", picKunjungan: "Rudi Hartono", kondisiUmum: "Baik", temuan: "Venue GBK siap digunakan. Koordinasi dengan pengelola lancar.", foto: null, status: "Selesai" },
  ])

  const [laporanInsiden, setLaporanInsiden] = useState([
    { id: "INS-001", tanggal: "2026-06-25", jenis: "Koordinasi", severity: "Low", pic: "Rudi Hartono", status: "Resolved", deskripsi: "Perubahan minor pada rundown acara dari klien H-3", foto: null, fotoNama: null, logAktivitas: [
      { waktu: "2026-06-25 14:00", catatan: "Insiden dilaporkan oleh Rudi Hartono", tipe: "laporan" }
    ] },
  ])

  const [showTambahTim,     setShowTambahTim]     = useState(false)
  const [showTambahJadwal,  setShowTambahJadwal]  = useState(false)
  const [showTambahLaporan, setShowTambahLaporan] = useState(false)
  const [showTambahInsiden, setShowTambahInsiden] = useState(false)
  const [newJadwal,        setNewJadwal]        = useState({ tanggal: '', jam: '', kegiatan: '', pic: '', status: 'Dijadwalkan' })
  const [newLaporan,       setNewLaporan]       = useState({ tanggal: '', picKunjungan: '', kondisiUmum: 'Baik', temuan: '', status: 'Selesai', foto: null, fotoNama: null })
  const [newInsiden,       setNewInsiden]       = useState({ tanggal: '', jenis: 'Koordinasi', severity: 'Low', pic: '', deskripsi: '', status: 'Open', foto: null, fotoNama: null, logAktivitas: [] })
  const [editingInsiden,   setEditingInsiden]   = useState(null)
  const [editingLaporan,   setEditingLaporan]   = useState(null)
  const fotoInputRef = useRef(null)
  const fotoInsidenRef = useRef(null)
  const fotoLaporanBaruRef = useRef(null)
  const fotoInsidenBaruRef = useRef(null)
  const [previewFoto, setPreviewFoto] = useState(null)
  const [sumberTim,         setSumberTim]         = useState("PIC")
  const [selectedSource,    setSelectedSource]    = useState("")
  const [newTimPeran,       setNewTimPeran]       = useState("")
  const [newTimStatus,      setNewTimStatus]      = useState("Aktif")
  const [logFilter3,        setLogFilter3]        = useState("semua")

  /* ── Tab 4: Hari-H & PIC ────────────────────────────────────────────────── */
  const orderKategori = order?.kategori || ['kat1', 'kat2']
  const hasKat12 = orderKategori.some(k => k === 'kat1' || k === 'kat2')
  const hasKat3  = orderKategori.includes('kat3')

  const absensiStatusCls = {
    'Hadir':       'bg-green-50 text-green-700 border-green-200',
    'Terlambat':   'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Tidak Hadir': 'bg-red-50 text-red-600 border-red-200',
  }

  const harihPICs = timLapangan.filter(t => t.sourceType === 'PIC')
  const [absensiMode, setAbsensiMode] = useState('onsite')
  const [harihAbsensi, setHarihAbsensi] = useState([
    { picId: 'PIC-001', nama: 'Rudi Hartono', spesialisasi: 'Personal Trainer', status: 'Hadir',     checkIn: '05:45', catatan: '',         linkSent: false },
    { picId: 'PIC-002', nama: 'Sari Dewi',    spesialisasi: 'Yoga Instructor',  status: 'Hadir',     checkIn: '06:00', catatan: '',         linkSent: false },
    { picId: 'PIC-003', nama: 'Bima Prakoso', spesialisasi: 'Zumba Instructor', status: 'Terlambat', checkIn: '06:35', catatan: 'Macet KS', linkSent: false },
  ])
  const [eventSelesai,          setEventSelesai]          = useState(false)
  const [showKonfirmasiSelesai, setShowKonfirmasiSelesai] = useState(false)

  /* ── Tahapan (local state for header UI) ────────────────────────────────── */
  const [tahapanState,      setTahapanState]      = useState(order?.tahapan || 'Quotation')
  const [editingTahapan,    setEditingTahapan]    = useState(false)
  const [newTahapanVal,     setNewTahapanVal]     = useState(order?.tahapan || 'Quotation')
  const [newTahapanCatatan, setNewTahapanCatatan] = useState('')


  /* ── WA Komunikasi ───────────────────────────────────────────────────────── */
  const [waLog,              setWaLog]              = useState(() => {
    try {
      const saved = localStorage.getItem(`event-order-wa-log-${id}`)
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })
  const [showAllWaTemplates, setShowAllWaTemplates] = useState(false)

  const orderEvCtx = {
    namaKlien:     infoDeal.namaKlien     || order?.namaKlien     || '',
    contactPerson: infoDeal.contactPerson || order?.contactPerson || '',
    telepon:       infoDeal.telepon       || order?.telepon       || '',
    namaEvent:     order?.namaEvent       || '',
    jenisEvent:    order?.jenisEvent      || '',
    pic:           infoDeal.pic           || order?.pic           || '',
    tahapan:       tahapanState,
  }

  useEffect(() => {
    try { localStorage.setItem(`event-order-wa-log-${id}`, JSON.stringify(waLog)) } catch {}
  }, [waLog, id])

  function handleKirimWAEv(template) {
    const teks = template.teks(orderEvCtx)
    const nomorBersih = (orderEvCtx.telepon || '').replace(/^0/, '').replace(/\D/g, '')
    window.open(`https://wa.me/62${nomorBersih}?text=${encodeURIComponent(teks)}`, '_blank')
    const now = new Date()
    const timestamp = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    setWaLog(prev => [...prev, {
      id: `WAL-${String(prev.length + 1).padStart(3, '0')}`,
      timestamp,
      judul: template.judul,
      tahapan: template.tahapan,
      kirimOleh: orderEvCtx.pic || 'Admin EFM',
      nomorTujuan: orderEvCtx.telepon,
    }])
  }
  const [showTambahPIC,         setShowTambahPIC]         = useState(false)
  const [newPICForm,            setNewPICForm]            = useState({ picId: '', peran: '' })
  const [showAbsensiHModal,     setShowAbsensiHModal]     = useState(false)
  const [editingAbsensiH,       setEditingAbsensiH]       = useState(null)

  const [eoMitra, setEoMitra] = useState({
    namaEO: 'PT. Kreasi Event Prima', picEO: 'Bapak Andi Wijaya',
    kontakEO: '0812-5678-9012', emailEO: 'andi@kreasi-event.co.id',
    pksBStatus: id === 'EV-26-0003' ? 'Uploaded' : 'Belum',
    pksBFile:   id === 'EV-26-0003' ? 'PKS-EO-EV26-0003.pdf' : null,
    pksBDate:   id === 'EV-26-0003' ? '2026-06-01' : null,
  })
  const [buktiUpload, setBuktiUpload] = useState(
    id === 'EV-26-0003' ? [
      { id: 'BKT-001', namaFile: 'Foto-FunRun-GBK-1.jpg',       tipe: 'Foto',    uploadedAt: '2026-06-28' },
      { id: 'BKT-002', namaFile: 'Laporan-Penyelenggaraan.pdf',  tipe: 'Dokumen', uploadedAt: '2026-06-29' },
    ] : []
  )

  /* ── 404 ─────────────────────────────────────────────────────────────────── */
  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400 text-sm mb-3">Order "{id}" tidak ditemukan.</p>
        <Link to="/event/orders" className="text-[#E05945] text-sm font-medium hover:underline">
          ← Kembali ke daftar order
        </Link>
      </div>
    )
  }

  /* ── Computed values ─────────────────────────────────────────────────────── */
  function calcQuotationTotal(qData) {
    const sub = qData.items.reduce((s, it) => s + it.jumlah * it.rate, 0)
    let after = sub
    if (qData.managementFee.aktif) after = after + Math.round(sub * qData.managementFee.persen / 100)
    const pajak = qData.pajakList.filter(p => p.aktif).reduce((s, p) => s + Math.round(after * p.persen / 100), 0)
    return { sub, after, pajak, total: after + pajak }
  }
  const qCalc      = calcQuotationTotal(quotationData)
  const qCalcDraft = quotationDraft ? calcQuotationTotal(quotationDraft) : qCalc
  const subtotal   = qCalc.total   // "Nilai Kontrak (dari Quotation)"

  const insidenAktif = laporanInsiden.filter(
    (ins) => (ins.severity === "Critical" || ins.severity === "High") && ins.status !== "Resolved"
  )
  // konsultasiTerkait defined above in dummyKonsultasiRef lookup

  /* ── Edit handlers ───────────────────────────────────────────────────────── */
  function startEdit(section) {
    if (editingSection && editingSection !== section) return
    setEditingSection(section)
    if (section === 'infoDeal') {
      setInfoDraft({ ...infoDeal })
      setItemsDraft(lineItems.map(li => ({ ...li })))
    }
    if (section === 'quotation') {
      setQuotationDraft({
        ...quotationData,
        items: quotationData.items.map(it => ({ ...it })),
        managementFee: { ...quotationData.managementFee },
        pajakList: quotationData.pajakList.map(p => ({ ...p })),
      })
    }
    if (section === 'paymentTerms') {
      setPayTermsDraft(payTerms)
      setPayRowsDraft(payRows.map(r => ({ ...r })))
    }
    if (section === 'profitSharing') {
      setPsPersenDraft(psPersen)
      setPsRowsDraft(psRows.map(r => ({ ...r })))
    }
  }

  function cancelEdit() { setEditingSection(null); setQuotationDraft(null) }

  function saveInfoDeal() {
    setInfoDeal({ ...infoDraft })
    setLineItems([...itemsDraft])
    setEditingSection(null)
  }

  function saveQuotation() {
    setQuotationData({ ...quotationDraft })
    setQuotationDraft(null)
    setEditingSection(null)
  }

  function savePaymentTerms() {
    setPayTerms(payTermsDraft)
    setPayRows([...payRowsDraft])
    setEditingSection(null)
  }

  function saveProfitSharing() {
    setPsPersen(psPersenDraft)
    setPsRows([...psRowsDraft])
    setEditingSection(null)
  }

  function regenPayRows(terms) {
    const rows = generatePayRows(order.tanggalMulai, order.tanggalSelesai, terms, subtotal || order.nilaiNum)
    return rows.map((r, i) => ({ ...r, status: 'Belum Ditagih', tglBayar: '' }))
  }

  function updateItemDraft(idx, field, val) {
    setItemsDraft(p => p.map((li, i) => i === idx ? { ...li, [field]: val } : li))
  }
  function updatePayRowDraft(idx, field, val) {
    setPayRowsDraft(p => p.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }
  function updatePsRowDraft(idx, field, val) {
    setPsRowsDraft(p => p.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }
  function updateQItemDraft(idx, field, val) {
    setQuotationDraft(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) }))
  }

  function handleSimpanOrderBaru() {
    navigate('/event/orders')
  }

  /* ── Tab 3 helpers ───────────────────────────────────────────────────────── */
  const formatWA = (wa) => wa.replace(/^0/, "62").replace(/\D/g, "")

  const severityColor = (s) => {
    if (s === "Critical") return "bg-red-100 text-red-700"
    if (s === "High")     return "bg-orange-100 text-orange-700"
    if (s === "Medium")   return "bg-yellow-100 text-yellow-700"
    return "bg-blue-100 text-blue-700"
  }

  const statusJadwalColor = (s) => {
    if (s === "Selesai")     return "bg-green-100 text-green-700"
    if (s === "Berlangsung") return "bg-blue-100 text-blue-700"
    if (s === "Dibatalkan")  return "bg-red-100 text-red-700"
    return "bg-gray-100 text-gray-600"
  }

  const [logTab3, setLogTab3] = useState([
    { id: 1, waktu: "2026-06-28 18:00", kategori: "status",     nomorLaporan: null,      teks: "Event selesai — Rekap final diserahkan ke klien" },
    { id: 2, waktu: "2026-06-25 14:00", kategori: "insiden",    nomorLaporan: "INS-001", teks: "Insiden INS-001 dilaporkan: Koordinasi — Perubahan rundown dari klien H-3" },
    { id: 3, waktu: "2026-06-20 08:00", kategori: "pembayaran", nomorLaporan: null,      teks: "Invoice INV-EV-26-0001 dikirim ke Yayasan Kanker Indonesia" },
    { id: 4, waktu: "2026-06-18 15:30", kategori: "kunjungan",  nomorLaporan: "LK-001", teks: "Laporan kunjungan venue GBK disimpan — Rudi Hartono" },
    { id: 5, waktu: "2026-06-15 11:00", kategori: "tim",        nomorLaporan: null,      teks: "Technical Meeting selesai — Briefing tim EFM dan mitra" },
    { id: 6, waktu: "2026-06-10 10:00", kategori: "status",     nomorLaporan: null,      teks: "Status Contract diubah ke Signed" },
    { id: 7, waktu: "2026-06-10 09:45", kategori: "dokumen",    nomorLaporan: null,      teks: "Contract EV-26-0003 diupload: contract-yayasan-kanker-final.pdf" },
    { id: 8, waktu: "2026-06-05 09:00", kategori: "pembayaran", nomorLaporan: null,      teks: "DP 50% dikonfirmasi Lunas — Rp 42.500.000" },
    { id: 9, waktu: "2026-06-02 14:00", kategori: "status",     nomorLaporan: null,      teks: "Status Quotation diubah ke Signed" },
    { id: 10, waktu: "2026-06-01 08:00", kategori: "tim",       nomorLaporan: null,      teks: "Order #EV-26-0003 dibuat oleh Admin EFM" },
  ])

  /* ── Render ──────────────────────────────────────────────────────────────── */
  const tipeLabel = order.jenis
  const TIPE_CLS_MAP = {
    Corporate: 'bg-[#1E1C43] text-white',
    Foundation: 'bg-orange-500 text-white',
    Government: 'bg-green-600 text-white',
    Brand: 'bg-purple-600 text-white',
    Community: 'bg-blue-500 text-white',
    Private: 'bg-pink-500 text-white',
    Individual: 'bg-gray-400 text-white',
  }
  const tipeCls = TIPE_CLS_MAP[order.jenis] ?? 'bg-blue-500 text-white'

  return (
    <>
      <div className="space-y-5">

      {/* Banner: new order from survei */}
      {isNew && fromState?.fromKonsultasi && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-700 flex items-center gap-2">
            <span>📋</span>
            Order baru dari Konsultasi <span className="font-semibold">{fromState?.konsultasiId}</span> — Data klien sudah pre-filled
          </p>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <div className="flex items-center gap-2 flex-wrap">

          {/* Icon */}
          <div className="w-10 h-10 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
            <Calendar size={16} className="text-white" />
          </div>

          {/* Identity */}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">B2B Event · {isNew ? 'EV-DRAFT' : order.id}</p>
            <h1 className="text-base font-bold text-[#1E1C43] leading-snug truncate">{isNew ? 'Order Baru' : (order.namaEvent || order.namaKlien)}</h1>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <Badge cls={tipeCls}>{tipeLabel}</Badge>
              <span className="text-gray-300 text-xs">·</span>
              <Badge cls={STATUS_CLS[order.status] ?? 'bg-gray-100 text-gray-600'}>● {order.status}</Badge>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-xs text-gray-500">{order.namaKlien}</span>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-xs font-semibold text-[#1E1C43]">{fmtRp(subtotal)}</span>
              {order.pic && <><span className="text-gray-300 text-xs">·</span><span className="text-xs text-gray-400">PIC: {order.pic}</span></>}
            </div>
          </div>

          {/* Action buttons */}
          {!isNew && (
            <button
              onClick={() => { setEditingTahapan(p => !p); setNewTahapanVal(tahapanState) }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors shrink-0"
            >
              <Edit2 size={13} /> Update Tahapan
            </button>
          )}

          {/* Back button */}
          <button
            onClick={() => navigate('/event/orders')}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors shrink-0"
          >
            <ArrowLeft size={13} /> Kembali
          </button>
        </div>

        {/* Tahapan Stepper — full width below divider */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <EventTahapanStepper currentTahapan={tahapanState} />

          {/* Inline edit form */}
          {editingTahapan && (
            <div className="border-t border-gray-100 pt-4 mt-3">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tahapan Baru</label>
                    <select value={newTahapanVal} onChange={e => setNewTahapanVal(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]">
                      {['Quotation','MOU','Contract','Event Running','Event Selesai'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Catatan</label>
                    <input type="text" value={newTahapanCatatan} onChange={e => setNewTahapanCatatan(e.target.value)}
                      placeholder="Catatan perubahan tahapan..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => setEditingTahapan(false)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                    <X size={12} /> Batal
                  </button>
                  <button
                    onClick={() => {
                      if (newTahapanVal && newTahapanVal !== tahapanState) setTahapanState(newTahapanVal)
                      setEditingTahapan(false)
                      setNewTahapanCatatan('')
                    }}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                    <Save size={12} /> Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-nowrap gap-1 bg-white border border-gray-100 rounded-xl shadow-sm p-1 mb-5 overflow-x-auto">
        {[
          { key: 'keuangan',    label: 'Kontrak & Keuangan'  },
          { key: 'dokumen',     label: 'Dokumen Kerjasama'    },
          { key: 'operasional', label: 'Operasional Lapangan' },
          { key: 'kelas',       label: 'Hari-H & PIC'         },
          { key: 'wa',          label: 'Komunikasi WA'         },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab.key
                ? 'bg-[#1E1C43] text-white'
                : 'text-gray-500 hover:text-[#1E1C43]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1 — Kontrak & Keuangan
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'keuangan' && (
        <>

          {/* ── Section 1: Info Deal + Rincian Layanan ───────────────────── */}
          <SectionCard
            title="Info Deal & Rincian Layanan"
            editing={editingSection === 'infoDeal'}
            onEdit={() => startEdit('infoDeal')}
            onSave={saveInfoDeal}
            onCancel={cancelEdit}
          >
            {editingSection === 'infoDeal' ? (
              /* ── EDIT MODE ── */
              <div className="space-y-5">

                {/* Sub-section: Data Klien (read-only) */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs font-semibold text-gray-700">Data Klien</p>
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                      Read-only · Edit dari Leads
                    </span>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg px-3.5 py-2.5 mb-3 flex items-center gap-2">
                    <span className="text-xs text-amber-800">Data klien dikelola di halaman Leads.</span>
                    <Link to="/event/leads" className="text-xs font-semibold text-[#E05945] hover:underline">→ Buka Leads</Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Nama Klien',       value: infoDraft.namaKlien },
                      { label: 'Jenis Klien',       value: infoDraft.jenis },
                      { label: 'Nama Event',        value: order?.namaEvent },
                      { label: 'Jenis Event',       value: order?.jenisEvent },
                      { label: 'Peran EFM',         value: order?.peranEFM },
                      { label: 'Estimasi Peserta',  value: konsultasiTerkait?.jumlahPeserta ? konsultasiTerkait.jumlahPeserta + ' orang' : null },
                      { label: 'Contact Person',    value: infoDraft.contactPerson },
                      { label: 'Telepon',           value: infoDraft.telepon },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</label>
                        <div className="h-9 px-3 flex items-center rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-600 select-none">
                          {value || '—'}
                        </div>
                      </div>
                    ))}
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Lokasi Event</label>
                      <div className="h-9 px-3 flex items-center rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-600 select-none">
                        {order?.lokasiEvent || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-section: Detail Order (editable) */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-3">Detail Order</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Program</label>
                      <input
                        value={infoDraft.program || ''}
                        onChange={e => setInfoDraft(p => ({ ...p, program: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tanggal Mulai</label>
                      <input
                        type="date"
                        value={infoDraft.tanggalMulai || ''}
                        onChange={e => setInfoDraft(p => ({ ...p, tanggalMulai: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tanggal Selesai</label>
                      <input
                        type="date"
                        value={infoDraft.tanggalSelesai || ''}
                        onChange={e => setInfoDraft(p => ({ ...p, tanggalSelesai: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">PIC Sales</label>
                      <input
                        value={infoDraft.pic || ''}
                        onChange={e => setInfoDraft(p => ({ ...p, pic: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Nilai Kontrak (dari Quotation)</label>
                      <div className="h-9 px-3 flex items-center rounded-lg bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-500 select-none">
                        {fmtRp(qCalc.total)}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Catatan</label>
                      <textarea
                        value={infoDraft.catatan || ''}
                        onChange={e => setInfoDraft(p => ({ ...p, catatan: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-section: Rincian Layanan (editable) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-700">Rincian Layanan</p>
                    <button
                      onClick={() => setItemsDraft(p => [...p, { id: Date.now(), namaItem: '', satuan: 'Bulan', jumlah: 1, keterangan: '' }])}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#1E1C43] hover:text-[#E05945] transition-colors"
                    >
                      <Plus size={11} /> Tambah Item
                    </button>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        {['Item Layanan','Satuan','Jumlah','Keterangan',''].map(h => (
                          <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {itemsDraft.map((li, i) => (
                        <tr key={li.id} className="border-b border-gray-100">
                          <td className="px-3 py-2">
                            <input value={li.namaItem} onChange={e => updateItemDraft(i, 'namaItem', e.target.value)}
                              className="w-full h-8 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                          </td>
                          <td className="px-3 py-2 w-24">
                            <input value={li.satuan} onChange={e => updateItemDraft(i, 'satuan', e.target.value)}
                              className="w-full h-8 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                          </td>
                          <td className="px-3 py-2 w-16">
                            <input type="number" min={1} value={li.jumlah} onChange={e => updateItemDraft(i, 'jumlah', Number(e.target.value))}
                              className="w-full h-8 px-2 rounded border border-gray-200 text-xs text-center outline-none focus:border-[#1E1C43]" />
                          </td>
                          <td className="px-3 py-2">
                            <input value={li.keterangan || ''} onChange={e => updateItemDraft(i, 'keterangan', e.target.value)}
                              className="w-full h-8 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                          </td>
                          <td className="px-3 py-2 w-8">
                            <button onClick={() => setItemsDraft(p => p.filter((_, j) => j !== i))}
                              className="text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* ── VIEW MODE ── */
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {[
                    ['Nama Klien',    order.namaKlien],
                    ['Tipe Klien',    order.tipeKlien || order.jenis],
                    ['Nama Event',    order.namaEvent],
                    ['Jenis Event',   order.jenisEvent],
                    ['Peran EFM',     order.peranEFM],
                    ['Lokasi Event',  order.lokasiEvent],
                    ['Tanggal Event', fmtDate(order.tglEvent)],
                    ['PIC Sales',     infoDeal.pic],
                    ['Contact Person',infoDeal.contactPerson],
                    ['Telepon',       infoDeal.telepon],
                    ['Tgl Mulai Kontrak', fmtDate(infoDeal.tanggalMulai)],
                    ['Tgl Selesai Kontrak',fmtDate(infoDeal.tanggalSelesai)],
                    ['Nilai Kontrak (dari Quotation)', fmtRp(qCalc.total)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{k}</p>
                      <p className={`text-sm text-gray-800 font-medium ${k.startsWith('Nilai Kontrak') ? 'text-[#1E1C43] text-base' : ''}`}>{v || '—'}</p>
                    </div>
                  ))}
                  {infoDeal.catatan && (
                    <div className="col-span-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Catatan</p>
                      <p className="text-sm text-gray-700 italic">{infoDeal.catatan}</p>
                    </div>
                  )}
                </div>

                {/* Line items read */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Rincian Layanan</p>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        {['No','Item Layanan','Satuan','Jumlah','Keterangan'].map(h => (
                          <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((li, i) => (
                        <tr key={li.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5">{i + 1}</td>
                          <td className="text-xs font-medium text-gray-800 px-3 py-2.5">{li.namaItem}</td>
                          <td className="text-xs text-gray-600 px-3 py-2.5">{li.satuan}</td>
                          <td className="text-xs text-gray-600 px-3 py-2.5 text-center">{li.jumlah}</td>
                          <td className="text-xs text-gray-600 px-3 py-2.5">{li.keterangan || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── Section Quotation ─────────────────────────────────────────── */}
          {(() => {
            const isEditing = editingSection === 'quotation'
            const qd = isEditing ? quotationDraft : quotationData
            const calc = isEditing ? qCalcDraft : qCalc
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
                <div className="px-5 py-3.5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-[#1E1C43]">Quotation</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Penawaran harga kepada klien — berdasarkan rincian layanan di atas</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge cls={QUOTATION_STATUS_CLS[quotationData.status] ?? 'bg-gray-100 text-gray-500'}>
                        {quotationData.status}
                      </Badge>
                      {isEditing ? (
                        <>
                          <button onClick={saveQuotation}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90">
                            <Save size={12} /> Simpan
                          </button>
                          <button onClick={cancelEdit}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                            <X size={12} /> Batal
                          </button>
                        </>
                      ) : (
                        <button onClick={() => startEdit('quotation')}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors">
                          <Edit2 size={12} /> Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  {/* Info baris */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {[
                      ['No. Quotation', qd.nomorQuotation],
                      ['Tanggal', isEditing
                        ? <input key="tgl" type="date" value={qd.tanggal} onChange={e => setQuotationDraft(p => ({...p, tanggal: e.target.value}))}
                            className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43] w-full" />
                        : fmtDate(qd.tanggal)],
                      ['Berlaku Sampai', isEditing
                        ? <input key="bls" type="date" value={qd.berlakuSampai} onChange={e => setQuotationDraft(p => ({...p, berlakuSampai: e.target.value}))}
                            className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43] w-full" />
                        : fmtDate(qd.berlakuSampai)],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{k}</p>
                        {typeof v === 'string' ? <p className="text-xs font-medium text-gray-700">{v}</p> : v}
                      </div>
                    ))}
                  </div>

                  {/* Tabel items */}
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          {['No','Item Layanan','Satuan','Jumlah','Rate/Unit','Total'].map(h => (
                            <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {qd.items.map((it, i) => (
                          <tr key={it.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5">{i + 1}</td>
                            <td className="text-xs font-medium text-gray-800 px-3 py-2.5">{it.item}</td>
                            <td className="text-xs text-gray-600 px-3 py-2.5">{it.satuan}</td>
                            <td className="text-xs text-gray-600 px-3 py-2.5 text-center">{it.jumlah}</td>
                            <td className="px-3 py-2.5">
                              {isEditing ? (
                                <input type="number" min={0} value={it.rate}
                                  onChange={e => updateQItemDraft(i, 'rate', Number(e.target.value))}
                                  className="w-32 h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                              ) : (
                                <span className="text-xs text-gray-600">{fmtRp(it.rate)}</span>
                              )}
                            </td>
                            <td className="text-xs font-semibold text-gray-800 px-3 py-2.5 whitespace-nowrap">
                              {fmtRp(it.jumlah * it.rate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Kalkulasi */}
                  <div className="flex justify-end">
                    <div className="w-80 space-y-2">
                      {/* Subtotal */}
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">{fmtRp(calc.sub)}</span>
                      </div>

                      {/* Management Fee */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ToggleSwitch
                            checked={qd.managementFee.aktif}
                            onChange={() => {
                              if (isEditing) setQuotationDraft(p => ({...p, managementFee: {...p.managementFee, aktif: !p.managementFee.aktif}}))
                              else setQuotationData(p => ({...p, managementFee: {...p.managementFee, aktif: !p.managementFee.aktif}}))
                            }}
                          />
                          <span className="text-xs text-gray-600">Management Fee</span>
                          {qd.managementFee.aktif && (
                            isEditing ? (
                              <div className="flex items-center gap-0.5">
                                <input type="number" min={0} max={100} value={qd.managementFee.persen}
                                  onChange={e => setQuotationDraft(p => ({...p, managementFee: {...p.managementFee, persen: Number(e.target.value)}}))}
                                  className="w-12 h-6 px-1 rounded border border-gray-200 text-xs text-center outline-none focus:border-[#1E1C43]" />
                                <span className="text-xs text-gray-500">%</span>
                              </div>
                            ) : (
                              <Badge cls="bg-gray-100 text-gray-600">{qd.managementFee.persen}%</Badge>
                            )
                          )}
                        </div>
                        {qd.managementFee.aktif && (
                          <span className="text-xs font-medium text-gray-700">
                            {fmtRp(Math.round(calc.sub * qd.managementFee.persen / 100))}
                          </span>
                        )}
                      </div>

                      {qd.managementFee.aktif && (
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Total stlh Mgmt Fee</span>
                          <span className="font-medium">{fmtRp(calc.after)}</span>
                        </div>
                      )}

                      {/* Pajak */}
                      <div className="space-y-1.5 pt-1">
                        {qd.pajakList.map((pj, pi) => (
                          <div key={pj.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" checked={pj.aktif}
                                onChange={e => {
                                  const toggle = (p) => ({...p, pajakList: p.pajakList.map((x,xi) => xi===pi ? {...x, aktif:e.target.checked} : x)})
                                  isEditing ? setQuotationDraft(toggle) : setQuotationData(toggle)
                                }}
                                className="accent-[#1E1C43] w-3 h-3" />
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <input value={pj.nama} onChange={e => setQuotationDraft(p => ({...p, pajakList: p.pajakList.map((x,xi) => xi===pi ? {...x, nama:e.target.value} : x)}))}
                                    className="w-20 h-6 px-1 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                                  <input type="number" value={pj.persen} onChange={e => setQuotationDraft(p => ({...p, pajakList: p.pajakList.map((x,xi) => xi===pi ? {...x, persen:Number(e.target.value)} : x)}))}
                                    className="w-12 h-6 px-1 rounded border border-gray-200 text-xs text-center outline-none focus:border-[#1E1C43]" />
                                  <span className="text-xs text-gray-400">%</span>
                                  <button onClick={() => setQuotationDraft(p => ({...p, pajakList: p.pajakList.filter((_,xi) => xi!==pi)}))}
                                    className="text-gray-300 hover:text-red-500"><Trash2 size={11} /></button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-600">{pj.nama} {pj.persen}%</span>
                              )}
                            </div>
                            <span className={`text-xs font-medium ${pj.aktif ? 'text-gray-700' : 'text-gray-400'}`}>
                              {fmtRp(Math.round(calc.after * pj.persen / 100))}
                            </span>
                          </div>
                        ))}
                        {isEditing && (
                          <button
                            onClick={() => setQuotationDraft(p => ({...p, pajakList: [...p.pajakList, {id:Date.now(), nama:'PPh', persen:2.5, aktif:true}]}))}
                            className="flex items-center gap-1 text-[11px] font-semibold text-[#1E1C43] hover:text-[#E05945] transition-colors"
                          >
                            <Plus size={11} /> Tambah Pajak
                          </button>
                        )}
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-center pt-2 border-t-2 border-gray-200">
                        <span className="text-sm font-bold text-gray-700">TOTAL PENAWARAN</span>
                        <span className="text-sm font-bold text-[#E05945]">{fmtRp(calc.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Catatan / Syarat */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Catatan & Syarat</p>
                    {isEditing ? (
                      <textarea value={qd.catatanSyarat} onChange={e => setQuotationDraft(p => ({...p, catatanSyarat:e.target.value}))}
                        rows={2} placeholder="Harga sudah termasuk biaya operasional bulanan..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#1E1C43] resize-none" />
                    ) : (
                      <p className="text-xs text-gray-600">
                        {qd.catatanSyarat || 'Harga sudah termasuk biaya operasional bulanan. Pembayaran dilakukan di awal bulan.'}
                      </p>
                    )}
                  </div>

                  {/* Action row */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Status:</span>
                      <select
                        value={quotationData.status}
                        onChange={e => setQuotationData(p => ({...p, status: e.target.value}))}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#1E1C43]"
                      >
                        {['Draft','Terkirim','Disetujui','Ditolak','Revisi'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button className="inline-flex items-center gap-1.5 border border-[#1E1C43] text-[#1E1C43] text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50">
                        <Eye size={13} /> Preview
                      </button>
                      <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 bg-[#1E1C43] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90">
                        <Download size={13} /> Download PDF
                      </button>
                    </div>
                  </div>

                  {/* Approved banner */}
                  {quotationData.status === 'Disetujui' && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-600" />
                        <p className="text-xs text-green-700 font-medium">Quotation telah disetujui klien</p>
                      </div>
                      <button onClick={() => setActiveTab('dokumen')}
                        className="text-xs text-green-700 font-semibold hover:underline flex items-center gap-1">
                        Lanjut ke Dokumen Kerjasama →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* ── Section 2: Payment Terms & Tracking ──────────────────────── */}
          <SectionCard
            title="Payment Terms & Tracking"
            editing={editingSection === 'paymentTerms'}
            onEdit={() => startEdit('paymentTerms')}
            onSave={savePaymentTerms}
            onCancel={cancelEdit}
          >
            {/* Payment terms selector */}
            <div className="flex items-center gap-3 mb-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Metode Pembayaran</p>
              {editingSection === 'paymentTerms' ? (
                <select
                  value={payTermsDraft}
                  onChange={e => {
                    setPayTermsDraft(e.target.value)
                    if (e.target.value !== 'Custom') setPayRowsDraft(regenPayRows(e.target.value))
                  }}
                  className="h-8 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]"
                >
                  {PAY_TERMS_OPTS.map(t => <option key={t}>{t}</option>)}
                </select>
              ) : (
                <Badge cls="bg-[#1E1C43] text-white">{payTerms}</Badge>
              )}
            </div>

            {/* Note from quotation */}
            <p className="text-[10px] text-gray-400 mb-3">
              Nominal tagihan berdasarkan Total Penawaran Quotation:{' '}
              <span className="font-semibold text-[#1E1C43]">{fmtRp(qCalc.total)}/bulan</span>
            </p>

            {/* Payment table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {['No','Periode','Nominal','Status','Jatuh Tempo','Tgl Bayar','Aksi'].map(h => (
                      <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(editingSection === 'paymentTerms' ? payRowsDraft : payRows).map((r, i) => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="text-xs text-gray-400 px-3 py-2.5">{i + 1}</td>
                      <td className="text-xs text-gray-700 px-3 py-2.5 font-medium whitespace-nowrap">{r.periode}</td>
                      <td className="text-xs text-gray-700 px-3 py-2.5 whitespace-nowrap">{fmtRp(r.nominal)}</td>
                      <td className="px-3 py-2.5">
                        {editingSection === 'paymentTerms' ? (
                          <select
                            value={r.status}
                            onChange={e => updatePayRowDraft(i, 'status', e.target.value)}
                            className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]"
                          >
                            {PAY_STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                          </select>
                        ) : (
                          <Badge cls={PAY_STATUS_CLS[r.status] ?? 'bg-gray-100 text-gray-500'}>{r.status}</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {editingSection === 'paymentTerms' ? (
                          <input
                            type="date"
                            value={r.jatuhTempo}
                            onChange={e => updatePayRowDraft(i, 'jatuhTempo', e.target.value)}
                            className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]"
                          />
                        ) : (
                          <span className="text-xs text-gray-700">{r.jatuhTempo || '—'}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {editingSection === 'paymentTerms' ? (
                          <input
                            type="date"
                            value={r.tglBayar}
                            onChange={e => updatePayRowDraft(i, 'tglBayar', e.target.value)}
                            className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]"
                          />
                        ) : (
                          <span className="text-xs text-gray-700">{r.tglBayar || '—'}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {editingSection !== 'paymentTerms' && (
                          <div className="flex items-center gap-1.5 flex-nowrap">
                            {r.status === 'Belum Ditagih' && (
                              <button
                                onClick={() => navigate('/event/invoice', {
                                  state: {
                                    action: 'create',
                                    orderId: id,
                                    namaKlien: order.namaKlien,
                                    jenis: order.jenis,
                                    program: order.program,
                                    periode: r.periode,
                                    nominal: r.nominal,
                                    rincianLayanan: quotationData.items.map(it => ({
                                      item: it.item, satuan: it.satuan, jumlah: it.jumlah,
                                      rate: it.rate, total: it.jumlah * it.rate
                                    }))
                                  }
                                })}
                                className="h-6 px-2.5 rounded text-[10px] font-semibold bg-[#1E1C43] text-white hover:opacity-90 whitespace-nowrap">
                                Buat Invoice
                              </button>
                            )}
                            {(r.status === 'Invoice Terkirim' || r.status === 'Lunas') && (
                              <button
                                onClick={() => navigate('/event/invoice', {
                                  state: {
                                    action: 'view',
                                    orderId: id,
                                    periode: r.periode,
                                    invoiceId: INVOICE_ID_MAP[`${id}|${r.periode}`]
                                  }
                                })}
                                className="h-6 px-2.5 rounded text-[10px] font-semibold border border-blue-300 text-blue-600 hover:bg-blue-50 whitespace-nowrap">
                                Lihat Invoice
                              </button>
                            )}
                            {r.status === 'Lunas' && (
                              <button
                                onClick={() => navigate('/event/receipt', {
                                  state: {
                                    action: 'view',
                                    orderId: id,
                                    periode: r.periode,
                                    receiptId: RECEIPT_ID_MAP[`${id}|${r.periode}`]
                                  }
                                })}
                                className="h-6 px-2.5 rounded text-[10px] font-semibold border border-green-300 text-green-600 hover:bg-green-50 whitespace-nowrap">
                                Lihat Receipt
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* ── Section 3: Profit Sharing ─────────────────────────────────── */}
          <SectionCard
            title="Profit Sharing"
            editing={editingSection === 'profitSharing'}
            onEdit={hasPS ? () => startEdit('profitSharing') : null}
            onSave={saveProfitSharing}
            onCancel={cancelEdit}
          >
            {/* Toggle */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-gray-600 font-medium">Ada Profit Sharing?</span>
              <ToggleSwitch
                checked={hasPS}
                onChange={() => { if (!editingSection) setHasPS(p => !p) }}
              />
              <span className="text-xs text-gray-400">{hasPS ? 'Aktif' : 'Tidak aktif'}</span>
            </div>

            {!hasPS && (
              (order.peranEFM === 'Fitness Partner' || order.peranEFM === 'Co-Organizer') ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">💡</span>
                  <p className="text-xs text-amber-800">
                    Peran EFM sebagai <strong>{order.peranEFM}</strong> umumnya memiliki kesepakatan profit sharing.
                    Aktifkan toggle di atas jika kontrak ini mencakup bagi hasil.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Kontrak ini tidak menggunakan profit sharing.</p>
              )
            )}

            {hasPS && (
              <>
                {/* % input */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-gray-600">% Hak EFM dari Total Profit Klien</span>
                  {editingSection === 'profitSharing' ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number" min={0} max={100}
                        value={psPersenDraft}
                        onChange={e => {
                          const p = Number(e.target.value)
                          setPsPersenDraft(p)
                          setPsRowsDraft(prev => prev.map(r => ({ ...r, persen: p })))
                        }}
                        className="w-16 h-8 px-2 rounded-lg border border-gray-200 text-sm text-center outline-none focus:border-[#1E1C43]"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  ) : (
                    <Badge cls="bg-purple-100 text-purple-700">{psPersen}%</Badge>
                  )}
                </div>

                {/* PS table */}
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      {['No','Periode','Total Profit Klien','%','Hak EFM','Status','Tgl Terima'].map(h => (
                        <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(editingSection === 'profitSharing' ? psRowsDraft : psRows).map((r, i) => (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="text-xs text-gray-400 px-3 py-2.5">{i + 1}</td>
                        <td className="px-3 py-2.5">
                          {editingSection === 'profitSharing' ? (
                            <input value={r.periode} onChange={e => updatePsRowDraft(i, 'periode', e.target.value)}
                              className="w-28 h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                          ) : (
                            <span className="text-xs text-gray-700 font-medium">{r.periode}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          {editingSection === 'profitSharing' ? (
                            <input type="number" value={r.totalProfit} onChange={e => updatePsRowDraft(i, 'totalProfit', Number(e.target.value))}
                              className="w-36 h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                          ) : (
                            <span className="text-xs text-gray-700">{fmtRp(r.totalProfit)}</span>
                          )}
                        </td>
                        <td className="text-xs text-gray-700 px-3 py-2.5">{r.persen}%</td>
                        <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">
                          {fmtRp(Math.round(r.totalProfit * r.persen / 100))}
                        </td>
                        <td className="px-3 py-2.5">
                          {editingSection === 'profitSharing' ? (
                            <select value={r.status} onChange={e => updatePsRowDraft(i, 'status', e.target.value)}
                              className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]">
                              {['Belum Diterima','Sudah Diterima'].map(s => <option key={s}>{s}</option>)}
                            </select>
                          ) : (
                            <Badge cls={r.status === 'Sudah Diterima' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                              {r.status}
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          {editingSection === 'profitSharing' ? (
                            <input type="date" value={r.tglTerima} onChange={e => updatePsRowDraft(i, 'tglTerima', e.target.value)}
                              className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                          ) : (
                            <span className="text-xs text-gray-700">{r.tglTerima || '—'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {editingSection === 'profitSharing' && (
                  <button
                    onClick={() => setPsRowsDraft(p => [...p, { id: Date.now(), periode: '', totalProfit: 0, persen: psPersenDraft, status: 'Belum Diterima', tglTerima: '' }])}
                    className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#1E1C43] hover:text-[#E05945] transition-colors"
                  >
                    <Plus size={12} /> Tambah Periode
                  </button>
                )}
              </>
            )}
          </SectionCard>

        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2 — Dokumen Kerjasama
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'dokumen' && (() => {
        const getStepStatus = (stepKey) => {
          const levelMap = { 'Quotation': 1, 'MOU': 2, 'Contract': 3, 'Event Running': 4, 'Aktif': 4, 'Selesai': 5 }
          const stepIdx  = { quotation: 0, mou: 1, contract: 2, active: 3 }
          const cur = levelMap[order?.tahapan] ?? 0
          const lvl = stepIdx[stepKey] ?? 0
          if (cur > lvl) return 'completed'
          if (cur === lvl) return 'current'
          return 'pending'
        }
        return (
        <div className="space-y-4">

          {/* ── Stepper: Pipeline Dokumen ──────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Progress Dokumen Kerjasama</p>
            <div className="flex items-center">
              {[
                { key: 'quotation', label: 'Quotation', icon: '📋' },
                { key: 'mou',       label: 'MOU',       icon: '🤝' },
                { key: 'contract',  label: 'Kontrak',   icon: '📄' },
                { key: 'active',    label: 'Aktif',     icon: '✅' },
              ].map((step, idx, arr) => {
                const s = getStepStatus(step.key)
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                        s === 'completed' ? 'bg-green-500 border-green-500 text-white'
                          : s === 'current' ? 'bg-[#1E1C43] border-[#1E1C43] text-white'
                          : 'bg-white border-gray-200 text-gray-400'
                      }`}>
                        {s === 'completed' ? '✓' : step.icon}
                      </div>
                      <p className={`text-[10px] mt-1 font-semibold ${
                        s === 'completed' ? 'text-green-600'
                          : s === 'current' ? 'text-[#1E1C43]'
                          : 'text-gray-400'
                      }`}>{step.label}</p>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 ${s === 'completed' ? 'bg-green-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Section 1: MOU ────────────────────────────────────────────── */}
          {(() => {
            const DOC_STATUS_OPTS = ['Drafting','On Review','Revision','Signed']
            const DOC_STATUS_CLS = { Signed:'bg-green-100 text-green-700', 'On Review':'bg-blue-100 text-blue-700', Drafting:'bg-gray-100 text-gray-500', Revision:'bg-yellow-100 text-yellow-700' }
            const isEditing = editingDoc === 'mou'
            const doc = isEditing ? mouDraft : mouDoc
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-[#1E1C43] min-w-[60px]">MOU</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Ada MOU?</span>
                      <ToggleSwitch
                        checked={adaMOU}
                        onChange={val => setAdaMOU(val)}
                      />
                    </div>
                    {adaMOU && <Badge cls={DOC_STATUS_CLS[mouDoc.status] ?? 'bg-gray-100 text-gray-500'}>{mouDoc.status}</Badge>}
                  </div>
                  {adaMOU && (
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={() => { setMouDoc({ ...mouDraft }); setEditingDoc(null) }}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90">
                            <Save size={12} /> Simpan
                          </button>
                          <button onClick={() => setEditingDoc(null)}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                            <X size={12} /> Batal
                          </button>
                        </>
                      ) : (
                        <button onClick={() => { setMouDraft({ ...mouDoc }); setEditingDoc('mou') }}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors">
                          <Edit2 size={12} /> Edit
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {adaMOU ? (
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Status</span>
                      {isEditing ? (
                        <select value={mouDraft.status} onChange={e => setMouDraft(p => ({ ...p, status: e.target.value }))}
                          className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]">
                          {DOC_STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      ) : (
                        <Badge cls={DOC_STATUS_CLS[doc.status] ?? 'bg-gray-100 text-gray-500'}>{doc.status}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Google Docs</span>
                      {isEditing ? (
                        <input value={mouDraft.gdocsUrl} onChange={e => setMouDraft(p => ({ ...p, gdocsUrl: e.target.value }))}
                          placeholder="https://docs.google.com/..."
                          className="flex-1 h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                      ) : doc.gdocsUrl ? (
                        <a href={doc.gdocsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                          Buka Google Docs <ExternalLink size={11} />
                        </a>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </div>
                    {isEditing && (
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Upload File</span>
                        <input type="file" accept=".pdf" className="text-xs text-gray-600" />
                        <span className="text-[10px] text-gray-400">PDF, maks 2MB</span>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Riwayat File</p>
                      {doc.riwayat.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Belum ada file diupload.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {doc.riwayat.map(r => (
                            <div key={r.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-xs font-medium text-gray-700 flex-1">{r.nama}</span>
                              <span className="text-[10px] text-gray-400">{r.tgl}</span>
                              <Badge cls={DOC_STATUS_CLS[r.status] ?? 'bg-gray-100 text-gray-500'}>{r.status}</Badge>
                              <button className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-[#1E1C43] transition-colors"><Download size={11} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })()}

          {/* ── Section 3: Contract ───────────────────────────────────────── */}
          {(() => {
            const DOC_STATUS_OPTS = ['Drafting','On Review','Revision','Signed']
            const DOC_STATUS_CLS = { Signed:'bg-green-100 text-green-700', 'On Review':'bg-blue-100 text-blue-700', Drafting:'bg-gray-100 text-gray-500', Revision:'bg-yellow-100 text-yellow-700' }
            const isEditing = editingDoc === 'contract'
            const doc = isEditing ? cDraft : cDoc
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#1E1C43]">Contract</h3>
                    <Badge cls={DOC_STATUS_CLS[cDoc.status] ?? 'bg-gray-100 text-gray-500'}>{cDoc.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => { setCDoc({ ...cDraft }); setEditingDoc(null) }}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90">
                          <Save size={12} /> Simpan
                        </button>
                        <button onClick={() => setEditingDoc(null)}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
                          <X size={12} /> Batal
                        </button>
                      </>
                    ) : (
                      <button onClick={() => { setCDraft({ ...cDoc }); setEditingDoc('contract') }}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors">
                        <Edit2 size={12} /> Edit
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {cDoc.status === 'Signed' && !isEditing && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                      <p className="text-xs text-green-700 font-medium">Contract telah ditandatangani oleh kedua belah pihak</p>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Status</span>
                    {isEditing ? (
                      <select value={cDraft.status} onChange={e => setCDraft(p => ({ ...p, status: e.target.value }))}
                        className="h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]">
                        {DOC_STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    ) : (
                      <Badge cls={DOC_STATUS_CLS[doc.status] ?? 'bg-gray-100 text-gray-500'}>{doc.status}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Google Docs</span>
                    {isEditing ? (
                      <input value={cDraft.gdocsUrl} onChange={e => setCDraft(p => ({ ...p, gdocsUrl: e.target.value }))}
                        placeholder="https://docs.google.com/..."
                        className="flex-1 h-7 px-2 rounded border border-gray-200 text-xs outline-none focus:border-[#1E1C43]" />
                    ) : doc.gdocsUrl ? (
                      <a href={doc.gdocsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        Buka Google Docs <ExternalLink size={11} />
                      </a>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold w-28 shrink-0">Upload File</span>
                      <input type="file" accept=".pdf" className="text-xs text-gray-600" />
                      <span className="text-[10px] text-gray-400">PDF, maks 2MB</span>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Riwayat File</p>
                    {doc.riwayat.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Belum ada file diupload.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {doc.riwayat.map(r => (
                          <div key={r.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-xs font-medium text-gray-700 flex-1">{r.nama}</span>
                            <span className="text-[10px] text-gray-400">{r.tgl}</span>
                            <Badge cls={DOC_STATUS_CLS[r.status] ?? 'bg-gray-100 text-gray-500'}>{r.status}</Badge>
                            <button className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-[#1E1C43] transition-colors"><Download size={11} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* ── Log Aktivitas ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-[#1E1C43]">Log Aktivitas</h3>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {logTab3.map((l) => {
                  const dotColor = {
                    pembayaran: '#F97316', kunjungan: '#10B981', insiden: '#EF4444',
                    dokumen: '#10B981', status: '#3B82F6', tim: '#8B5CF6', jadwal: '#6B7280',
                  }[l.kategori] ?? '#3B82F6'
                  return (
                    <div key={l.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: dotColor }} />
                      <div className="flex-1">
                        <p className="text-xs text-gray-700">{l.teks}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{l.waktu}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

        </div>
        )
      })()}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3 — Operasional Lapangan
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'operasional' && (
        <div>

          {/* ── SECTION 1: Referensi Konsultasi ── */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <MapPin size={15} className="text-[#1E1C43]" />
                Referensi Konsultasi
                <span className="ml-1 bg-[#1E1C43] text-white text-xs px-2 py-0.5 rounded-full">
                  {konsultasiTerkait ? "Terhubung" : "Belum Ada"}
                </span>
              </h3>
              {konsultasiTerkait && (
                <button
                  onClick={() => navigate(`/event/konsultasi/${order.konsultasiId}`)}
                  className="text-xs text-[#1E1C43] font-medium hover:underline flex items-center gap-1"
                >
                  Lihat Detail Konsultasi <ExternalLink size={12} />
                </button>
              )}
            </div>

            {konsultasiTerkait ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Nama Event</p>
                  <p className="text-sm font-semibold text-gray-800">{konsultasiTerkait.namaEvent}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Tanggal Konsultasi</p>
                  <p className="text-sm font-semibold text-gray-800">{fmtDate(konsultasiTerkait.tanggal)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Lokasi Event</p>
                  <p className="text-sm font-semibold text-gray-800">{konsultasiTerkait.lokasi}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Estimasi Peserta</p>
                  <p className="text-sm font-semibold text-gray-800">{konsultasiTerkait.jumlahPeserta} orang</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Peran EFM</p>
                  <p className="text-sm font-semibold text-[#1E1C43]">{konsultasiTerkait.peranEFM}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-2">Program Kegiatan</p>
                  <div className="flex flex-wrap gap-1">
                    {(konsultasiTerkait.programKegiatan || []).map((p) => (
                      <span key={p} className="bg-[#1E1C43]/10 text-[#1E1C43] text-xs px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <MapPin size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Belum ada konsultasi terkait order ini</p>
                <p className="text-xs mt-1">Konsultasi dapat dibuat dari halaman Leads</p>
              </div>
            )}
          </div>

          {/* ── SECTION 2: Tim Lapangan ── */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Users size={15} className="text-[#1E1C43]" />
                Tim Lapangan
                <span className="ml-1 bg-[#1E1C43] text-white text-xs px-2 py-0.5 rounded-full">{timLapangan.length}</span>
              </h3>
            </div>

            {/* Banner Insiden Aktif */}
            {insidenAktif.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-red-600" />
                  <p className="text-sm font-bold text-red-700">⚠️ Insiden Aktif — Quick Contact Tim</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {timLapangan.map((t) => (
                    <a
                      key={t.id}
                      href={`https://wa.me/${formatWA(t.wa)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 bg-white border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50 transition"
                    >
                      <span className="text-xs font-medium text-gray-800 flex-1">{t.nama}</span>
                      <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">WA</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tabel Tim */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4">Nama</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4">Tipe</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4">Peran</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-4">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {timLapangan.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-3 pr-4">
                        <p className="text-xs font-semibold text-gray-800">{t.nama}</p>
                        <p className="text-xs text-gray-400">{t.sourceType === "PIC" ? "PIC Database" : "Mitra Database"}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs bg-[#1E1C43]/10 text-[#1E1C43] px-2 py-0.5 rounded-full">{t.tipe}</span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-700">{t.peran}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === "Aktif" ? "bg-green-100 text-green-700" : t.status === "Standby" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${formatWA(t.wa)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition"
                          >
                            WA
                          </a>
                          <button
                            onClick={() => setTimLapangan(timLapangan.filter((x) => x.id !== t.id))}
                            className="text-red-400 hover:text-red-600 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowTambahTim(true)}
              className="mt-4 w-full border border-dashed border-gray-300 text-gray-500 hover:border-[#1E1C43] hover:text-[#1E1C43] rounded-xl py-2.5 text-xs font-medium transition flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Tambah Anggota Tim
            </button>
          </div>

          {/* ── SECTION 3: Jadwal Kegiatan Operasional ── */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Calendar size={15} className="text-[#1E1C43]" />
                Jadwal Kegiatan Operasional
                <span className="ml-1 bg-[#1E1C43] text-white text-xs px-2 py-0.5 rounded-full">{jadwalOperasional.length}</span>
              </h3>
              <button
                onClick={() => navigate("/event/kalender")}
                className="text-xs text-[#1E1C43] font-medium hover:underline flex items-center gap-1"
              >
                Lihat di Kalender <ExternalLink size={12} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">No</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">Tanggal</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">Jam</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">Kegiatan</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">PIC</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2 pr-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {jadwalOperasional.map((j, idx) => (
                    <tr key={j.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-3 pr-3 text-xs text-gray-400">{idx + 1}</td>
                      <td className="py-3 pr-3 text-xs text-gray-700">{j.tanggal}</td>
                      <td className="py-3 pr-3 text-xs text-gray-700">{j.jam}</td>
                      <td className="py-3 pr-3 text-xs font-medium text-gray-800">{j.kegiatan}</td>
                      <td className="py-3 pr-3 text-xs text-gray-600">{j.pic}</td>
                      <td className="py-3 pr-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusJadwalColor(j.status)}`}>{j.status}</span>
                      </td>
                      <td className="py-3">
                        <button onClick={() => setEditingJadwal({ ...j })} className="text-gray-400 hover:text-[#1E1C43] transition">
                          <Edit2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowTambahJadwal(true)}
              className="mt-4 w-full border border-dashed border-gray-300 text-gray-500 hover:border-[#1E1C43] hover:text-[#1E1C43] rounded-xl py-2.5 text-xs font-medium transition flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Tambah Jadwal
            </button>
          </div>

          {/* ── SECTION 4: Laporan Kunjungan & Kondisi Aset ── */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <ClipboardList size={15} className="text-[#1E1C43]" />
                Laporan Kunjungan & Kondisi Aset
                <span className="ml-1 bg-[#1E1C43] text-white text-xs px-2 py-0.5 rounded-full">{laporanKunjungan.length}</span>
              </h3>
            </div>

            <div className="space-y-3">
              {laporanKunjungan.map((lk) => (
                <div key={lk.id} className="border border-gray-100 rounded-xl p-4 hover:border-[#1E1C43]/30 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-bold text-gray-800">{lk.tanggal} — {lk.picKunjungan}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Kondisi Umum: <span className="text-green-600 font-medium">{lk.kondisiUmum}</span></p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lk.status === "Selesai" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {lk.status}
                    </span>
                  </div>
                  {lk.temuan && (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2.5 mt-2">
                      <p className="text-xs text-yellow-800"><span className="font-semibold">Temuan:</span> {lk.temuan}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    {lk.foto ? (
                      <button
                        onClick={() => setPreviewFoto({ src: lk.foto, nama: lk.fotoNama, dariNomor: lk.id })}
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition">
                        <ImageIcon size={12} />
                        Lihat Foto Dokumentasi
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <ImageIcon size={12} /> Belum ada foto
                      </span>
                    )}
                    <button onClick={() => setEditingLaporan({ ...lk })} className="ml-auto text-xs text-[#1E1C43] font-medium hover:underline flex items-center gap-1">
                      <Edit2 size={11} /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowTambahLaporan(true)}
              className="mt-4 w-full border border-dashed border-gray-300 text-gray-500 hover:border-[#1E1C43] hover:text-[#1E1C43] rounded-xl py-2.5 text-xs font-medium transition flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Buat Laporan Kunjungan
            </button>
          </div>

          {/* ── SECTION 5: Laporan Insiden ── */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle size={15} className="text-[#E05945]" />
                Laporan Insiden
                <span className="ml-1 bg-[#E05945] text-white text-xs px-2 py-0.5 rounded-full">{laporanInsiden.length}</span>
              </h3>
            </div>

            <div className="space-y-3">
              {laporanInsiden.map((ins) => (
                <div key={ins.id} className={`border rounded-xl p-4 ${ins.severity === "Critical" ? "border-red-300 bg-red-50" : ins.severity === "High" ? "border-orange-200 bg-orange-50" : "border-gray-100"}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-bold text-gray-800">{ins.tanggal} — {ins.jenis}</p>
                      <p className="text-xs text-gray-500 mt-0.5">PIC: {ins.pic}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${severityColor(ins.severity)}`}>{ins.severity}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ins.status === "Resolved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{ins.status}</span>
                    </div>
                  </div>
                  {ins.deskripsi && <p className="text-xs text-gray-600 mt-1">{ins.deskripsi}</p>}
                  {ins.foto && (
                    <button
                      onClick={() => setPreviewFoto({ src: ins.foto, nama: ins.fotoNama, dariNomor: ins.id })}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition mt-2">
                      <ImageIcon size={12} />
                      Lihat Foto Bukti
                    </button>
                  )}
                  <div className="flex items-center gap-2 mt-3 justify-end">
                    <button
                      onClick={() => setEditingInsiden({ ...ins })}
                      className="text-xs text-gray-500 hover:text-[#1E1C43] flex items-center gap-1 transition">
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => setLaporanInsiden(laporanInsiden.filter(x => x.id !== ins.id))}
                      className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition">
                      <Trash2 size={12} /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowTambahInsiden(true)}
              className="mt-4 w-full border border-dashed border-gray-300 text-gray-500 hover:border-[#E05945] hover:text-[#E05945] rounded-xl py-2.5 text-xs font-medium transition flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Laporkan Insiden
            </button>
          </div>

          {/* ── SECTION 6: Log Aktivitas Tab 3 ── */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Activity size={15} className="text-[#1E1C43]" />
                Log Aktivitas Operasional
              </h3>
              <div className="flex gap-1.5 flex-wrap">
                {["semua","jadwal","kunjungan","insiden","tim"].map((k) => (
                  <button
                    key={k}
                    onClick={() => setLogFilter3(k)}
                    className={`text-xs px-2.5 py-1 rounded-full capitalize transition ${logFilter3 === k ? "bg-[#1E1C43] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative pl-4">
              {logTab3
                .filter((l) => logFilter3 === "semua" || l.kategori === logFilter3)
                .map((l, idx, arr) => (
                  <div key={l.id} className="relative mb-4 last:mb-0">
                    <div className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-[#1E1C43]" />
                    {idx < arr.length - 1 && (
                      <div className="absolute -left-[13px] top-3 w-px h-full bg-gray-200" />
                    )}
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs text-gray-400">{l.waktu}</p>
                      {l.nomorLaporan && (
                        <span className="text-xs bg-[#1E1C43]/10 text-[#1E1C43] px-1.5 py-0.5 rounded font-mono">
                          {l.nomorLaporan}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700">{l.teks}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded mt-1 inline-block capitalize ${
                      l.kategori === "insiden"   ? "bg-red-50 text-red-600" :
                      l.kategori === "jadwal"    ? "bg-blue-50 text-blue-600" :
                      l.kategori === "kunjungan" ? "bg-yellow-50 text-yellow-700" :
                      l.kategori === "tim"       ? "bg-purple-50 text-purple-600" :
                      "bg-gray-50 text-gray-500"
                    }`}>{l.kategori}</span>
                  </div>
                ))}
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 4 — Hari-H & PIC
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'kelas' && (
        <div className="space-y-5">

          {/* ── Kat 1 & 2 Block ──────────────────────────────────────────────── */}
          {hasKat12 && (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'PIC Ditugaskan',    value: harihPICs.length,                                                   text: false },
                  { label: 'PKS Ditandatangani', value: harihPICs.filter(p => p.pksStatus === 'Signed').length,             text: false },
                  { label: 'Hadir Hari-H',       value: harihAbsensi.filter(a => a.status === 'Hadir').length,              text: false },
                  { label: 'Status Event',        value: eventSelesai ? 'Selesai' : 'Berlangsung', color: eventSelesai ? 'text-green-600' : 'text-blue-600', text: true },
                ].map(kpi => (
                  <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{kpi.label}</p>
                    {kpi.text
                      ? <p className={`text-base font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                      : <p className="text-2xl font-bold text-[#1E1C43] mt-1">{kpi.value}</p>
                    }
                  </div>
                ))}
              </div>

              {/* PIC yang Ditugaskan */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 flex items-center gap-2">
                    PIC yang Ditugaskan
                    <span className="bg-[#1E1C43] text-white text-xs px-2 py-0.5 rounded-full">{harihPICs.length}</span>
                  </h3>
                  <button
                    onClick={() => { setNewPICForm({ picId: '', peran: '' }); setShowTambahPIC(true) }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
                    <Plus size={13} /> Tambah PIC
                  </button>
                </div>
                {harihPICs.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Users size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Belum ada PIC yang ditugaskan</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {harihPICs.map(pic => {
                      const pksCls = pic.pksStatus === 'Signed'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : pic.pksStatus === 'Generated'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      const initials = pic.nama.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      return (
                        <div key={pic.id} className="flex items-center gap-4 px-5 py-4">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: pic.warna || '#1E1C43' }}>
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{pic.nama}</p>
                            <p className="text-xs text-gray-400">{pic.spesialisasi} · {pic.peran}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">PKS Type A</p>
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${pksCls}`}>
                                {pic.pksStatus}
                              </span>
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                              {pic.pksStatus === 'Belum' && (
                                <button
                                  onClick={() => setTimLapangan(prev => prev.map(p => p.id === pic.id ? { ...p, pksStatus: 'Generated' } : p))}
                                  className="px-2.5 py-1.5 text-xs font-semibold bg-[#1E1C43] text-white rounded-lg hover:bg-[#2d2b5e] transition">
                                  Generate PKS
                                </button>
                              )}
                              {(pic.pksStatus === 'Generated' || pic.pksStatus === 'Signed') && (
                                <button className="px-2.5 py-1.5 text-xs font-semibold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                                  Download
                                </button>
                              )}
                              {pic.pksStatus === 'Generated' && (
                                <button
                                  onClick={() => setTimLapangan(prev => prev.map(p => p.id === pic.id ? { ...p, pksStatus: 'Signed' } : p))}
                                  className="px-2.5 py-1.5 text-xs font-semibold border border-green-200 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition">
                                  Tandai Signed
                                </button>
                              )}
                              <button
                                onClick={() => setTimLapangan(prev => prev.filter(p => p.id !== pic.id))}
                                className="p-1.5 text-gray-300 hover:text-red-500 transition rounded">
                                <X size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Absensi Hari-H */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
                  <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">
                    Absensi Hari-H
                  </h3>
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {[{ key: 'onsite', label: 'On-site' }, { key: 'remote', label: 'Remote / Link' }].map(m => (
                      <button key={m.key}
                        onClick={() => setAbsensiMode(m.key)}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                          absensiMode === m.key ? 'bg-white text-[#1E1C43] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {absensiMode === 'remote' && (
                  <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
                    <p className="text-xs text-blue-700 font-medium">Mode Remote: Sistem mengirim link form absensi ke WhatsApp masing-masing PIC. PIC mengisi kehadiran secara mandiri.</p>
                  </div>
                )}

                {/* Summary pills */}
                {harihAbsensi.length > 0 && (
                  <div className="flex gap-2 flex-wrap px-5 pt-4">
                    {['Hadir', 'Terlambat', 'Tidak Hadir'].map(s => {
                      const count = harihAbsensi.filter(a => a.status === s).length
                      return count > 0 ? (
                        <span key={s} className={`px-2 py-0.5 text-xs rounded-full font-medium border ${absensiStatusCls[s]}`}>
                          {s}: {count}
                        </span>
                      ) : null
                    })}
                  </div>
                )}

                <div className="divide-y divide-gray-50 mt-3">
                  {harihAbsensi.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 px-5">
                      <ClipboardList size={28} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Belum ada data absensi</p>
                    </div>
                  ) : harihAbsensi.map(abs => {
                    const absCls = absensiStatusCls[abs.status] || 'bg-gray-50 text-gray-500 border-gray-200'
                    return (
                      <div key={abs.picId} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{abs.nama}</p>
                          <p className="text-xs text-gray-400">{abs.spesialisasi}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 flex-wrap">
                          {absensiMode === 'remote' && (
                            abs.linkSent
                              ? <span className="text-xs text-green-600 font-medium">✓ Link Terkirim</span>
                              : <button
                                  onClick={() => {
                                    const pic = timLapangan.find(t => t.id === abs.picId)
                                    if (pic?.wa) {
                                      const msg = `Halo *${abs.nama}*, berikut link absensi hari-H untuk event ini. Mohon konfirmasi kehadiran Anda. Terima kasih 🙏`
                                      window.open(`https://wa.me/${formatWA(pic.wa)}?text=${encodeURIComponent(msg)}`, '_blank')
                                    }
                                    setHarihAbsensi(prev => prev.map(a => a.picId === abs.picId ? { ...a, linkSent: true } : a))
                                  }}
                                  className="px-2.5 py-1.5 text-xs font-semibold bg-[#1E1C43] text-white rounded-lg hover:bg-[#2d2b5e] transition">
                                  Kirim Link WA
                                </button>
                          )}
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${absCls}`}>
                            {abs.status}
                          </span>
                          {abs.checkIn && (
                            <span className="text-xs text-gray-400">Check-in: {abs.checkIn}</span>
                          )}
                          <button
                            onClick={() => { setEditingAbsensiH({ ...abs }); setShowAbsensiHModal(true) }}
                            className="text-xs text-[#1E1C43] hover:underline font-medium">
                            Edit
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className={`px-5 py-4 border-t border-gray-100 ${eventSelesai ? 'bg-green-50' : ''}`}>
                  {eventSelesai ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle size={16} />
                      <span className="text-sm font-semibold">Event telah dikonfirmasi selesai — proses pelunasan dapat dilanjutkan</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowKonfirmasiSelesai(true)}
                      className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2">
                      <CheckCircle size={16} /> Konfirmasi Event Selesai
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Divider between blocks */}
          {hasKat12 && hasKat3 && (
            <div className="border-t-2 border-dashed border-gray-200" />
          )}

          {/* ── Kat 3 Block ──────────────────────────────────────────────────── */}
          {hasKat3 && (
            <>
              {/* Mitra EO */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">
                    Mitra EO — Kat 3 Event Solution
                  </h3>
                </div>
                <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Nama EO / Perusahaan', value: eoMitra.namaEO },
                    { label: 'PIC EO',               value: eoMitra.picEO },
                    { label: 'Kontak',                value: eoMitra.kontakEO },
                    { label: 'Email',                 value: eoMitra.emailEO },
                  ].map(f => (
                    <div key={f.label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{f.label}</p>
                      <p className="text-sm font-semibold text-gray-800">{f.value}</p>
                    </div>
                  ))}
                </div>
                {/* PKS Type B */}
                <div className="px-5 pb-5">
                  <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-0.5">PKS Type B — Dokumen Eksternal EO</p>
                      {eoMitra.pksBStatus === 'Uploaded'
                        ? <p className="text-xs text-gray-400">{eoMitra.pksBFile} · Diupload {eoMitra.pksBDate}</p>
                        : <p className="text-xs text-gray-400 italic">Belum ada dokumen PKS</p>
                      }
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {eoMitra.pksBStatus === 'Uploaded' && (
                        <button className="px-3 py-1.5 text-xs font-semibold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition">
                          Download
                        </button>
                      )}
                      <button
                        onClick={() => setEoMitra(prev => ({ ...prev, pksBStatus: 'Uploaded', pksBFile: 'PKS-EO-Updated.pdf', pksBDate: '2026-08-29' }))}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#1E1C43] text-white rounded-lg hover:bg-[#2d2b5e] transition flex items-center gap-1.5">
                        <Upload size={12} />
                        {eoMitra.pksBStatus === 'Uploaded' ? 'Ganti File' : 'Upload PKS'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bukti Penyelenggaraan */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 flex items-center gap-2">
                    Bukti Penyelenggaraan
                    {buktiUpload.length > 0 && (
                      <span className="bg-[#1E1C43] text-white text-xs px-2 py-0.5 rounded-full">{buktiUpload.length}</span>
                    )}
                  </h3>
                  <button
                    onClick={() => setBuktiUpload(prev => [...prev, { id: 'BKT-' + Date.now(), namaFile: 'Dokumen-Baru.pdf', tipe: 'Dokumen', uploadedAt: '2026-08-29' }])}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-xs font-semibold transition-colors">
                    <Upload size={13} /> Upload
                  </button>
                </div>
                {buktiUpload.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Upload size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Belum ada bukti yang diupload</p>
                    <p className="text-xs mt-1">Upload foto atau dokumen bukti penyelenggaraan event</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {buktiUpload.map(bkt => (
                      <div key={bkt.id} className="flex items-center gap-3 px-5 py-3.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bkt.tipe === 'Foto' ? 'bg-blue-50' : 'bg-orange-50'}`}>
                          {bkt.tipe === 'Foto'
                            ? <ImageIcon size={15} className="text-blue-500" />
                            : <FileText size={15} className="text-orange-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{bkt.namaFile}</p>
                          <p className="text-xs text-gray-400">{bkt.tipe} · Diupload {bkt.uploadedAt}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button className="text-xs text-[#1E1C43] hover:underline font-medium">Lihat</button>
                          <button
                            onClick={() => setBuktiUpload(prev => prev.filter(b => b.id !== bkt.id))}
                            className="text-xs text-red-500 hover:underline font-medium">Hapus</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className={`px-5 py-4 border-t border-gray-100 ${eventSelesai ? 'bg-green-50' : ''}`}>
                  {eventSelesai ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle size={16} />
                      <span className="text-sm font-semibold">Event telah dikonfirmasi selesai — proses pelunasan dapat dilanjutkan</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowKonfirmasiSelesai(true)}
                      className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2">
                      <CheckCircle size={16} /> Konfirmasi Event Selesai
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      )}

      {/* ══ MODAL: Tambah PIC Hari-H ══════════════════════════════════════════ */}
      {showTambahPIC && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#1E1C43]">Tambah PIC</h3>
              <button onClick={() => setShowTambahPIC(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Pilih PIC dari Database</label>
                <select
                  value={newPICForm.picId}
                  onChange={e => setNewPICForm(p => ({ ...p, picId: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1E1C43] bg-white">
                  <option value="">— Pilih PIC —</option>
                  {dummyPICs.filter(dp => !harihPICs.find(h => h.id === dp.id)).map(p => (
                    <option key={p.id} value={p.id}>{p.nama} — {p.spesialisasi}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Peran dalam Event</label>
                <input type="text" placeholder="cth. Lead Instructor, Co-Instructor, Support..."
                  value={newPICForm.peran}
                  onChange={e => setNewPICForm(p => ({ ...p, peran: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1E1C43] bg-white" />
              </div>
            </div>
            <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowTambahPIC(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm font-semibold hover:bg-gray-50 transition">
                Batal
              </button>
              <button
                onClick={() => {
                  if (!newPICForm.picId) return
                  const found = dummyPICs.find(p => p.id === newPICForm.picId)
                  if (!found) return
                  const colors = ['#E05945', '#2980B9', '#27AE60', '#8E44AD', '#E67E22']
                  const tlId = 'TL-' + String(Date.now()).slice(-4).padStart(3, '0')
                  setTimLapangan(prev => [...prev, {
                    id: tlId, sourceId: found.id, sourceType: 'PIC',
                    nama: found.nama, tipe: 'PIC EFM',
                    peran: newPICForm.peran || 'Instructor', wa: found.wa || '',
                    status: 'Aktif', spesialisasi: found.spesialisasi,
                    pksStatus: 'Belum',
                    warna: colors[prev.filter(t => t.sourceType === 'PIC').length % colors.length],
                  }])
                  setHarihAbsensi(prev => [...prev, {
                    picId: found.id, nama: found.nama, spesialisasi: found.spesialisasi,
                    status: 'Hadir', checkIn: '', catatan: '', linkSent: false,
                  }])
                  setShowTambahPIC(false)
                }}
                className="flex-1 bg-[#1E1C43] hover:bg-[#2d2b5e] text-white rounded-lg py-2 text-sm font-semibold transition">
                Tambah PIC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Edit Absensi Hari-H ════════════════════════════════════════ */}
      {showAbsensiHModal && editingAbsensiH && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#1E1C43]">Edit Absensi — {editingAbsensiH.nama}</h3>
              <button onClick={() => { setShowAbsensiHModal(false); setEditingAbsensiH(null) }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Status Kehadiran</label>
                <div className="flex gap-2 flex-wrap">
                  {['Hadir', 'Terlambat', 'Tidak Hadir'].map(s => {
                    const isActive = editingAbsensiH.status === s
                    const activeCls = s === 'Hadir' ? 'bg-green-600 text-white border-green-600'
                      : s === 'Terlambat' ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'bg-red-500 text-white border-red-500'
                    return (
                      <button key={s}
                        onClick={() => setEditingAbsensiH(p => ({ ...p, status: s }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${isActive ? activeCls : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Jam Check-in</label>
                <input type="time"
                  value={editingAbsensiH.checkIn}
                  onChange={e => setEditingAbsensiH(p => ({ ...p, checkIn: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1E1C43] bg-white" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Catatan</label>
                <textarea rows={2} placeholder="Catatan kehadiran, penggantian, dll..."
                  value={editingAbsensiH.catatan}
                  onChange={e => setEditingAbsensiH(p => ({ ...p, catatan: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1E1C43] resize-none bg-white" />
              </div>
            </div>
            <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setShowAbsensiHModal(false); setEditingAbsensiH(null) }}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm font-semibold hover:bg-gray-50 transition">
                Batal
              </button>
              <button
                onClick={() => {
                  setHarihAbsensi(prev => prev.map(a => a.picId === editingAbsensiH.picId ? { ...editingAbsensiH } : a))
                  setShowAbsensiHModal(false)
                  setEditingAbsensiH(null)
                }}
                className="flex-1 bg-[#1E1C43] hover:bg-[#2d2b5e] text-white rounded-lg py-2 text-sm font-semibold transition">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Konfirmasi Event Selesai ══════════════════════════════════ */}
      {showKonfirmasiSelesai && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <h3 className="text-base font-bold text-[#1E1C43] mb-2">Konfirmasi Event Selesai</h3>
              <p className="text-sm text-gray-500 mb-6">
                Setelah dikonfirmasi, status event akan berubah menjadi <strong>Selesai</strong> dan proses pelunasan pembayaran dapat dilanjutkan.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowKonfirmasiSelesai(false)}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 transition">
                  Batal
                </button>
                <button
                  onClick={() => { setEventSelesai(true); setShowKonfirmasiSelesai(false) }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl py-2.5 text-sm font-semibold transition">
                  Ya, Konfirmasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 5 — Komunikasi WA
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'wa' && (
        <div className="space-y-4">

          {/* Template Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Komunikasi WhatsApp</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Tahapan:</span>
                <EventOrderTahapanBadge tahapan={orderEvCtx.tahapan} />
              </div>
            </div>

            {/* Nomor tujuan */}
            {orderEvCtx.telepon ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-5">
                <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                  <MessageCircle size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Nomor Tujuan</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {orderEvCtx.contactPerson || orderEvCtx.namaKlien} · {orderEvCtx.telepon}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-5">
                <p className="text-xs text-yellow-700">Nomor telepon contact person belum tercatat. Lengkapi di tab Kontrak & Keuangan → Info Deal.</p>
              </div>
            )}

            {/* Template untuk tahapan saat ini */}
            <div className="mb-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Template untuk Tahapan Saat Ini: {orderEvCtx.tahapan}
              </p>
              <div className="space-y-2">
                {(EVENT_ORDER_WA_TEMPLATES[orderEvCtx.tahapan] || []).length > 0
                  ? (EVENT_ORDER_WA_TEMPLATES[orderEvCtx.tahapan] || []).map(tpl => (
                      <EventOrderTemplateCard key={tpl.id} template={tpl} ctx={orderEvCtx} onKirim={handleKirimWAEv} />
                    ))
                  : <p className="text-xs text-gray-400 italic">Tidak ada template khusus untuk tahapan ini.</p>
                }
              </div>
            </div>

            {/* Template tahapan lain (collapsible) */}
            <div>
              <button
                onClick={() => setShowAllWaTemplates(p => !p)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1E1C43] transition-colors mb-2"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  {showAllWaTemplates ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                </svg>
                {showAllWaTemplates ? 'Sembunyikan' : 'Lihat'} semua template
              </button>
              {showAllWaTemplates && (
                <div className="space-y-4 pt-1">
                  {Object.entries(EVENT_ORDER_WA_TEMPLATES)
                    .filter(([tahapan]) => tahapan !== orderEvCtx.tahapan)
                    .map(([tahapan, templates]) => (
                      <div key={tahapan}>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Tahapan: {tahapan}</p>
                        <div className="space-y-2">
                          {templates.map(tpl => (
                            <EventOrderTemplateCard key={tpl.id} template={tpl} ctx={orderEvCtx} onKirim={handleKirimWAEv} />
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
              <p className="text-xs text-gray-400 italic text-center py-4">Belum ada WA yang dikirim via EFM untuk order ini.</p>
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
                        {log.tahapan && <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${TAHAPAN_WA_EV_CLS[log.tahapan] ?? 'bg-gray-100 text-gray-500'}`}>{log.tahapan}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Footer — hanya untuk mode new order */}
      {isNew && (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] px-6 py-3 mt-4 rounded-b-xl z-10">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              {infoDeal.namaKlien ? (
                <span><span className="font-medium text-[#1E1C43]">{infoDeal.namaKlien}</span>{' · '}Order baru</span>
              ) : (
                <span className="text-gray-300">Isi data order di atas</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/event/orders')} className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <ArrowLeft size={13} /> Batal
              </button>
              <button onClick={handleSimpanOrderBaru} className="inline-flex items-center gap-2 bg-[#E05945] hover:bg-[#c94a38] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                💾 Simpan & Buka Order
              </button>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* ══ MODAL: Tambah Anggota Tim ════════════════════════════════════════════ */}
      {showTambahTim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-800">Tambah Anggota Tim</h3>
              <button onClick={() => { setShowTambahTim(false); setSelectedSource(""); setNewTimPeran("") }} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Toggle PIC / Mitra */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                {["PIC", "Mitra"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSumberTim(s); setSelectedSource(""); setNewTimPeran("") }}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${sumberTim === s ? "bg-white text-[#1E1C43] shadow-sm" : "text-gray-500"}`}
                  >
                    {s === "PIC" ? "Dari PIC Database" : "Dari Mitra Database"}
                  </button>
                ))}
              </div>

              {/* Dropdown pilih */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  {sumberTim === "PIC" ? "Pilih PIC" : "Pilih Mitra"}
                </label>
                <select
                  value={selectedSource}
                  onChange={(e) => {
                    setSelectedSource(e.target.value)
                    const src = sumberTim === "PIC"
                      ? dummyPICs.find((p) => p.id === e.target.value)
                      : dummyMitras.find((m) => m.id === e.target.value)
                    if (src) setNewTimPeran(sumberTim === "PIC" ? src.spesialisasi : src.peran)
                  }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]"
                >
                  <option value="">— Pilih {sumberTim} —</option>
                  {(sumberTim === "PIC" ? dummyPICs : dummyMitras).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama} — {sumberTim === "PIC" ? item.spesialisasi : item.peran}
                    </option>
                  ))}
                </select>
              </div>

              {/* Peran di project */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Peran di Project Ini</label>
                <input
                  type="text"
                  value={newTimPeran}
                  onChange={(e) => setNewTimPeran(e.target.value)}
                  placeholder="cth. Head Trainer, Supervisor Lapangan"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                <select
                  value={newTimStatus}
                  onChange={(e) => setNewTimStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]"
                >
                  <option>Aktif</option>
                  <option>Standby</option>
                  <option>Non-aktif</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => { setShowTambahTim(false); setSelectedSource(""); setNewTimPeran("") }}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!selectedSource || !newTimPeran) return
                  const src = sumberTim === "PIC"
                    ? dummyPICs.find((p) => p.id === selectedSource)
                    : dummyMitras.find((m) => m.id === selectedSource)
                  if (!src) return
                  const newMember = {
                    id: `TL-${Date.now()}`,
                    sourceId: src.id,
                    sourceType: sumberTim,
                    nama: src.nama,
                    tipe: sumberTim === "PIC" ? "PIC EFM" : src.tipe,
                    peran: newTimPeran,
                    wa: src.wa,
                    status: newTimStatus,
                  }
                  setTimLapangan([...timLapangan, newMember])
                  setShowTambahTim(false)
                  setSelectedSource("")
                  setNewTimPeran("")
                  setNewTimStatus("Aktif")
                }}
                disabled={!selectedSource || !newTimPeran}
                className="flex-1 bg-[#1E1C43] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#2d2b5e] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Tambah Jadwal Operasional ════════════════════════════════════ */}
      {showTambahJadwal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-sm font-bold text-[#1E1C43] flex items-center gap-2">
                <Clock size={15} /> Tambah Jadwal Operasional
              </h2>
              <button onClick={() => setShowTambahJadwal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tanggal *</label>
                  <input type="date" value={newJadwal.tanggal} onChange={e => setNewJadwal(p => ({...p, tanggal: e.target.value}))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Jam</label>
                  <input type="time" value={newJadwal.jam} onChange={e => setNewJadwal(p => ({...p, jam: e.target.value}))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Nama Kegiatan *</label>
                <input value={newJadwal.kegiatan} onChange={e => setNewJadwal(p => ({...p, kegiatan: e.target.value}))} placeholder="Nama kegiatan"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">PIC</label>
                <input value={newJadwal.pic} onChange={e => setNewJadwal(p => ({...p, pic: e.target.value}))} placeholder="Nama PIC"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                <select value={newJadwal.status} onChange={e => setNewJadwal(p => ({...p, status: e.target.value}))}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1E1C43] bg-white">
                  {['Dijadwalkan', 'Selesai', 'Dibatalkan'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setShowTambahJadwal(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition">
                Batal
              </button>
              <button onClick={() => {
                if (!newJadwal.tanggal || !newJadwal.kegiatan) return
                setJadwalOperasional(p => [...p, {
                  id: `JDW-${String(Date.now()).slice(-4)}`,
                  tanggal: newJadwal.tanggal,
                  jam: newJadwal.jam || '00:00',
                  kegiatan: newJadwal.kegiatan,
                  pic: newJadwal.pic,
                  status: newJadwal.status,
                }])
                setShowTambahJadwal(false)
                setNewJadwal({ tanggal: '', jam: '', kegiatan: '', pic: '', status: 'Dijadwalkan' })
              }}
                disabled={!newJadwal.tanggal || !newJadwal.kegiatan}
                className="flex-1 bg-[#1E1C43] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#2d2b5e] transition disabled:opacity-50 disabled:cursor-not-allowed">
                Simpan Jadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Edit Jadwal Operasional ═══════════════════════════════════════ */}
      {editingJadwal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Edit2 size={15} className="text-[#1E1C43]" /> Edit Jadwal Kegiatan
              </h3>
              <button onClick={() => setEditingJadwal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tanggal *</label>
                  <input type="date" value={editingJadwal.tanggal}
                    onChange={e => setEditingJadwal({...editingJadwal, tanggal: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Jam</label>
                  <input type="time" value={editingJadwal.jam}
                    onChange={e => setEditingJadwal({...editingJadwal, jam: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nama Kegiatan *</label>
                <input type="text" value={editingJadwal.kegiatan}
                  onChange={e => setEditingJadwal({...editingJadwal, kegiatan: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">PIC</label>
                <input type="text" value={editingJadwal.pic}
                  onChange={e => setEditingJadwal({...editingJadwal, pic: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                <select value={editingJadwal.status}
                  onChange={e => setEditingJadwal({...editingJadwal, status: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                  <option>Dijadwalkan</option>
                  <option>Berlangsung</option>
                  <option>Selesai</option>
                  <option>Dibatalkan</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setEditingJadwal(null)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition">
                Batal
              </button>
              <button
                onClick={() => {
                  if (!editingJadwal.tanggal || !editingJadwal.kegiatan) return;
                  setJadwalOperasional(jadwalOperasional.map(x =>
                    x.id === editingJadwal.id ? { ...editingJadwal } : x
                  ));
                  setEditingJadwal(null);
                }}
                disabled={!editingJadwal.tanggal || !editingJadwal.kegiatan}
                className="flex-1 bg-[#1E1C43] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#2d2b5e] transition disabled:opacity-50 disabled:cursor-not-allowed">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Tambah Laporan Kunjungan (Tab 3) ══════════════════════════════ */}
      {showTambahLaporan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-800">Buat Laporan Kunjungan</h3>
              <button onClick={() => { setShowTambahLaporan(false); setNewLaporan({ tanggal: '', picKunjungan: '', kondisiUmum: 'Baik', temuan: '', status: 'Selesai', foto: null, fotoNama: null }) }}
                className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tanggal Kunjungan *</label>
                  <input type="date" value={newLaporan.tanggal}
                    onChange={e => setNewLaporan({...newLaporan, tanggal: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Kondisi Umum</label>
                  <select value={newLaporan.kondisiUmum}
                    onChange={e => setNewLaporan({...newLaporan, kondisiUmum: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                    <option>Baik</option>
                    <option>Cukup</option>
                    <option>Perlu Perhatian</option>
                    <option>Bermasalah</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">PIC Kunjungan *</label>
                <input type="text" value={newLaporan.picKunjungan}
                  onChange={e => setNewLaporan({...newLaporan, picKunjungan: e.target.value})}
                  placeholder="Nama PIC yang melakukan kunjungan"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Temuan / Catatan</label>
                <textarea value={newLaporan.temuan}
                  onChange={e => setNewLaporan({...newLaporan, temuan: e.target.value})}
                  placeholder="Deskripsikan temuan, kondisi venue, hal yang perlu ditindaklanjuti..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                <select value={newLaporan.status}
                  onChange={e => setNewLaporan({...newLaporan, status: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                  <option>Selesai</option>
                  <option>Draft</option>
                  <option>Perlu Tindak Lanjut</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Foto Dokumentasi</label>
                <input type="file" accept="image/*" ref={fotoLaporanBaruRef} className="hidden"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setNewLaporan({...newLaporan, foto: ev.target.result, fotoNama: file.name});
                    reader.readAsDataURL(file);
                  }} />
                {newLaporan.foto ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <img src={newLaporan.foto} alt="preview" className="w-full h-32 object-cover" />
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                      <p className="text-xs text-gray-500 truncate">{newLaporan.fotoNama}</p>
                      <button onClick={() => setNewLaporan({...newLaporan, foto: null, fotoNama: null})}
                        className="text-xs text-red-400 hover:text-red-600 ml-2 flex-shrink-0">Hapus</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => fotoLaporanBaruRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-xs text-gray-400 hover:border-[#1E1C43] hover:text-[#1E1C43] transition flex flex-col items-center gap-1">
                    <ImageIcon size={20} />
                    <span>Klik untuk upload foto</span>
                    <span className="text-gray-300">JPG, PNG, WEBP — maks 5MB</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => { setShowTambahLaporan(false); setNewLaporan({ tanggal: '', picKunjungan: '', kondisiUmum: 'Baik', temuan: '', status: 'Selesai', foto: null, fotoNama: null }) }}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition">
                Batal
              </button>
              <button
                onClick={() => {
                  if (!newLaporan.tanggal || !newLaporan.picKunjungan) return;
                  const newId = `LK-${Date.now()}`;
                  setLaporanKunjungan([...laporanKunjungan, { id: newId, ...newLaporan }]);
                  const waktuSekarang = new Date().toLocaleString('id-ID', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
                  setLogTab3(prev => [...prev, { id: Date.now(), waktu: waktuSekarang, kategori: 'kunjungan', nomorLaporan: newId, teks: `Laporan kunjungan ${newId} dibuat oleh ${newLaporan.picKunjungan} — Kondisi: ${newLaporan.kondisiUmum}` }]);
                  setShowTambahLaporan(false);
                  setNewLaporan({ tanggal: '', picKunjungan: '', kondisiUmum: 'Baik', temuan: '', status: 'Selesai', foto: null, fotoNama: null });
                }}
                disabled={!newLaporan.tanggal || !newLaporan.picKunjungan}
                className="flex-1 bg-[#1E1C43] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#2d2b5e] transition disabled:opacity-50 disabled:cursor-not-allowed">
                Simpan Laporan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Tambah Laporan Insiden (Tab 3) ════════════════════════════════ */}
      {showTambahInsiden && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-bold text-[#E05945] flex items-center gap-2">
                <AlertTriangle size={15} /> Laporkan Insiden
              </h3>
              <button onClick={() => setShowTambahInsiden(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tanggal *</label>
                  <input type="date" value={newInsiden.tanggal}
                    onChange={e => setNewInsiden({...newInsiden, tanggal: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E05945]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Jenis Insiden *</label>
                  <select value={newInsiden.jenis}
                    onChange={e => setNewInsiden({...newInsiden, jenis: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E05945]">
                    {['Koordinasi', 'Kerusakan Alat', 'Kecelakaan', 'Cuaca', 'Logistik', 'Lainnya'].map(j => <option key={j}>{j}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Severity</label>
                  <select value={newInsiden.severity}
                    onChange={e => setNewInsiden({...newInsiden, severity: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E05945]">
                    {['Low', 'Medium', 'High', 'Critical'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">PIC Pelapor</label>
                  <input value={newInsiden.pic}
                    onChange={e => setNewInsiden({...newInsiden, pic: e.target.value})}
                    placeholder="Nama pelapor"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E05945]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Deskripsi *</label>
                <textarea value={newInsiden.deskripsi}
                  onChange={e => setNewInsiden({...newInsiden, deskripsi: e.target.value})}
                  rows={3}
                  placeholder="Jelaskan detail insiden yang terjadi..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E05945] resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Foto Bukti / Dokumentasi</label>
                <input type="file" accept="image/*" ref={fotoInsidenBaruRef} className="hidden"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setNewInsiden({
                      ...newInsiden, foto: ev.target.result, fotoNama: file.name,
                      logAktivitas: [{ waktu: new Date().toLocaleString('id-ID', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}), catatan: `Foto "${file.name}" dilampirkan saat pelaporan`, tipe: 'foto' }]
                    });
                    reader.readAsDataURL(file);
                  }} />
                {newInsiden.foto ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <img src={newInsiden.foto} alt="preview foto insiden" className="w-full h-32 object-cover" />
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                      <p className="text-xs text-gray-500 truncate">{newInsiden.fotoNama}</p>
                      <button onClick={() => setNewInsiden({...newInsiden, foto: null, fotoNama: null})}
                        className="text-xs text-red-400 hover:text-red-600 ml-2 flex-shrink-0">Hapus</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => fotoInsidenBaruRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-xs text-gray-400 hover:border-[#E05945] hover:text-[#E05945] transition flex flex-col items-center gap-1">
                    <ImageIcon size={20} />
                    <span>Klik untuk upload foto bukti</span>
                    <span className="text-gray-300">JPG, PNG, WEBP</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setShowTambahInsiden(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition">
                Batal
              </button>
              <button
                onClick={() => {
                  if (!newInsiden.tanggal || !newInsiden.jenis || !newInsiden.deskripsi) return;
                  const newInsidenId = `INS-${Date.now()}`;
                  setLaporanInsiden([...laporanInsiden, { id: newInsidenId, ...newInsiden }]);
                  setLogTab3(prev => [...prev, { id: Date.now(), waktu: new Date().toLocaleString('id-ID', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}), kategori: 'insiden', nomorLaporan: newInsidenId, teks: `Insiden ${newInsidenId} dilaporkan: ${newInsiden.jenis} — ${newInsiden.deskripsi.substring(0, 60)}${newInsiden.deskripsi.length > 60 ? '...' : ''}` }]);
                  setShowTambahInsiden(false);
                  setNewInsiden({ tanggal: '', jenis: 'Koordinasi', severity: 'Low', pic: '', deskripsi: '', status: 'Open', foto: null, fotoNama: null, logAktivitas: [] });
                }}
                disabled={!newInsiden.tanggal || !newInsiden.jenis || !newInsiden.deskripsi}
                className="flex-1 bg-[#E05945] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#c94a38] transition disabled:opacity-50 disabled:cursor-not-allowed">
                Simpan Insiden
              </button>
            </div>
          </div>
        </div>
      )}

      {editingInsiden && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Edit2 size={15} className="text-[#1E1C43]" /> Edit Laporan Insiden
              </h3>
              <button onClick={() => setEditingInsiden(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tanggal</label>
                  <input type="date" value={editingInsiden.tanggal}
                    onChange={e => setEditingInsiden({...editingInsiden, tanggal: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Severity</label>
                  <select value={editingInsiden.severity}
                    onChange={e => setEditingInsiden({...editingInsiden, severity: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Jenis Insiden</label>
                <select value={editingInsiden.jenis}
                  onChange={e => setEditingInsiden({...editingInsiden, jenis: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                  <option>Kecelakaan Peserta</option>
                  <option>Kerusakan Peralatan</option>
                  <option>Perubahan Rundown</option>
                  <option>Kendala Cuaca</option>
                  <option>Konflik Tim</option>
                  <option>Masalah Teknis</option>
                  <option>Pembatalan Mendadak</option>
                  <option>Koordinasi</option>
                  <option>Lainnya</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">PIC Pelapor</label>
                <input type="text" value={editingInsiden.pic}
                  onChange={e => setEditingInsiden({...editingInsiden, pic: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Deskripsi</label>
                <textarea value={editingInsiden.deskripsi}
                  onChange={e => setEditingInsiden({...editingInsiden, deskripsi: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                <select value={editingInsiden.status}
                  onChange={e => setEditingInsiden({...editingInsiden, status: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Foto Bukti / Dokumentasi</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fotoInsidenRef}
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setEditingInsiden({
                      ...editingInsiden,
                      foto: ev.target.result,
                      fotoNama: file.name,
                      logAktivitas: [
                        ...(editingInsiden.logAktivitas || []),
                        {
                          waktu: new Date().toLocaleString('id-ID', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }),
                          catatan: `Foto "${file.name}" ditambahkan`,
                          tipe: "foto"
                        }
                      ]
                    });
                    reader.readAsDataURL(file);
                  }}
                />
                {editingInsiden.foto ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <img src={editingInsiden.foto} alt="preview foto insiden" className="w-full h-32 object-cover" />
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                      <p className="text-xs text-gray-500 truncate">{editingInsiden.fotoNama}</p>
                      <button
                        onClick={() => setEditingInsiden({
                          ...editingInsiden,
                          foto: null,
                          fotoNama: null,
                          logAktivitas: [
                            ...(editingInsiden.logAktivitas || []),
                            {
                              waktu: new Date().toLocaleString('id-ID', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }),
                              catatan: "Foto dihapus dari laporan insiden",
                              tipe: "foto"
                            }
                          ]
                        })}
                        className="text-xs text-red-400 hover:text-red-600 ml-2 flex-shrink-0">
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fotoInsidenRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-xs text-gray-400 hover:border-[#E05945] hover:text-[#E05945] transition flex flex-col items-center gap-1">
                    <ImageIcon size={20} />
                    <span>Klik untuk upload foto bukti</span>
                    <span className="text-gray-300">JPG, PNG, WEBP</span>
                  </button>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tambah Catatan Tindak Lanjut</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="catatanLogInsiden"
                    placeholder="cth. Barang ditemukan di lokasi parkir..."
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('catatanLogInsiden');
                      if (!input.value.trim()) return;
                      setEditingInsiden({
                        ...editingInsiden,
                        logAktivitas: [
                          ...(editingInsiden.logAktivitas || []),
                          {
                            waktu: new Date().toLocaleString('id-ID', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }),
                            catatan: input.value.trim(),
                            tipe: "catatan"
                          }
                        ]
                      });
                      input.value = '';
                    }}
                    className="px-3 py-2 bg-[#1E1C43] text-white rounded-xl text-xs font-semibold hover:bg-[#2d2b5e] transition flex-shrink-0">
                    + Tambah
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setEditingInsiden(null)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition">
                Batal
              </button>
              <button
                onClick={() => {
                  setLaporanInsiden(laporanInsiden.map(x =>
                    x.id === editingInsiden.id ? { ...editingInsiden } : x
                  ));
                  setEditingInsiden(null);
                }}
                className="flex-1 bg-[#1E1C43] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#2d2b5e] transition">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {editingLaporan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Edit2 size={15} className="text-[#1E1C43]" /> Edit Laporan Kunjungan
              </h3>
              <button onClick={() => setEditingLaporan(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tanggal Kunjungan</label>
                  <input type="date" value={editingLaporan.tanggal}
                    onChange={e => setEditingLaporan({...editingLaporan, tanggal: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Kondisi Umum</label>
                  <select value={editingLaporan.kondisiUmum}
                    onChange={e => setEditingLaporan({...editingLaporan, kondisiUmum: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                    <option>Baik</option>
                    <option>Cukup</option>
                    <option>Perlu Perhatian</option>
                    <option>Bermasalah</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">PIC Kunjungan</label>
                <input type="text" value={editingLaporan.picKunjungan}
                  onChange={e => setEditingLaporan({...editingLaporan, picKunjungan: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Temuan / Catatan</label>
                <textarea value={editingLaporan.temuan}
                  onChange={e => setEditingLaporan({...editingLaporan, temuan: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                <select value={editingLaporan.status}
                  onChange={e => setEditingLaporan({...editingLaporan, status: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43]">
                  <option>Selesai</option>
                  <option>Draft</option>
                  <option>Perlu Tindak Lanjut</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Foto Dokumentasi</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fotoInputRef}
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setEditingLaporan({
                      ...editingLaporan,
                      foto: ev.target.result,
                      fotoNama: file.name
                    });
                    reader.readAsDataURL(file);
                  }}
                />
                {editingLaporan.foto ? (
                  <div className="border border-gray-200 rounded-xl p-3">
                    <img src={editingLaporan.foto} alt="preview"
                      className="w-full h-32 object-cover rounded-lg mb-2" />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate">{editingLaporan.fotoNama}</p>
                      <button
                        onClick={() => setEditingLaporan({...editingLaporan, foto: null, fotoNama: null})}
                        className="text-xs text-red-400 hover:text-red-600 ml-2 flex-shrink-0">
                        Hapus Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fotoInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-xs text-gray-400 hover:border-[#1E1C43] hover:text-[#1E1C43] transition flex flex-col items-center gap-1">
                    <ImageIcon size={20} />
                    <span>Klik untuk upload foto</span>
                    <span className="text-gray-300">JPG, PNG, WEBP — maks 5MB</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setEditingLaporan(null)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition">
                Batal
              </button>
              <button
                onClick={() => {
                  setLaporanKunjungan(laporanKunjungan.map(x =>
                    x.id === editingLaporan.id ? { ...editingLaporan } : x
                  ));
                  setEditingLaporan(null);
                }}
                className="flex-1 bg-[#1E1C43] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#2d2b5e] transition">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {previewFoto && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          onClick={() => setPreviewFoto(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <p className="text-sm font-bold text-gray-800">Preview Foto</p>
                <p className="text-xs text-gray-400 mt-0.5">{previewFoto.dariNomor} — {previewFoto.nama}</p>
              </div>
              <button onClick={() => setPreviewFoto(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              <img src={previewFoto.src} alt={previewFoto.nama} className="w-full rounded-xl object-contain max-h-[60vh]" />
              <p className="text-xs text-gray-400 text-center mt-2">{previewFoto.nama}</p>
            </div>
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setPreviewFoto(null)}
                className="w-full border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
