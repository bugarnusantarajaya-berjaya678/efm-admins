import { Link } from 'react-router-dom'
import {
  Calendar, Building2, Star, ClipboardCheck,
  Users, CalendarDays,
} from 'lucide-react'

const HARI_LABEL = 'Minggu'
const TGL_LABEL  = '22 Juni 2026'

/* ── KPI Cards ─────────────────────────────────────────────────────────────── */
const KPI = [
  { label: 'Sesi Aktif Hari Ini',  value: 4,  sub: 'sesi terjadwal',   icon: Calendar,       link: '/pp/orders',    badge: null },
  { label: 'Klien B2B Aktif',       value: 12, sub: 'kontrak berjalan', icon: Building2,      link: '/b2b/orders',   badge: null },
  { label: 'Event Aktif',           value: 3,  sub: 'event berjalan',   icon: Star,           link: '/event/orders', badge: null },
  { label: 'Pengajuan Absensi',     value: 3,  sub: 'menunggu review',  icon: ClipboardCheck, link: '/attendance',   badge: 3   },
]

/* ── Sesi Aktif ─────────────────────────────────────────────────────────────── */
const SESI = [
  { pic: 'Sarah Jenkins',   klien: 'Alex Chen',         program: 'PP',  jam: '14:00–15:00', status: 'Terjadwal' },
  { pic: 'Marcus Chen',     klien: 'Lisa Wong',          program: 'PP',  jam: '15:00–16:00', status: 'Terjadwal' },
  { pic: 'Elena Rodriguez', klien: 'Anna Johnson',       program: 'PP',  jam: '16:00–17:00', status: 'Terjadwal' },
  { pic: 'Ahmad Pratama',   klien: 'Sudirman Park Apt.', program: 'B2B', jam: '17:00–18:00', status: 'Terjadwal' },
]

const PROGRAM_CLS = {
  PP:    'bg-[#1E1C43] text-white',
  B2B:   'bg-blue-600 text-white',
  Event: 'bg-purple-600 text-white',
}
const STATUS_CLS = {
  'Terjadwal':          'bg-gray-100 text-gray-600',
  'Sedang Berlangsung': 'bg-green-100 text-green-700',
  'Selesai':            'bg-blue-100 text-blue-700',
}

/* ── Alert & Perlu Tindakan ─────────────────────────────────────────────────── */
const ALERTS = [
  { judul: 'Kontrak PIC habis 3 hari lagi',     detail: 'Budi Santoso — PKS berakhir 25 Jun 2026', border: '#EF4444', bg: '#FEF2F2', link: '/contract'     },
  { judul: 'Kontrak B2B habis HARI INI',        detail: 'CV. Teknologi Prima — 22 Jun 2026',        border: '#EF4444', bg: '#FEF2F2', link: '/b2b/orders'   },
  { judul: '3 pengajuan absensi menunggu',      detail: 'Klik untuk review & approve',              border: '#F97316', bg: '#FFF7ED', link: '/attendance'   },
  { judul: 'Contract belum Signed',             detail: 'PT. Global Tech — #BO-007',                border: '#F97316', bg: '#FFF7ED', link: '/b2b/orders'   },
  { judul: 'Event H-5 dokumen belum lengkap',   detail: 'Fun Run Jakarta 2026',                     border: '#F97316', bg: '#FFF7ED', link: '/event/orders' },
  { judul: 'Invoice belum Lunas',               detail: 'Apartemen Green Lake — Jul 2026',          border: '#EAB308', bg: '#FEFCE8', link: '/b2b/invoice'  },
  { judul: '2 PIC belum konfirmasi assignment', detail: 'Assignment baru menunggu konfirmasi',      border: '#EAB308', bg: '#FEFCE8', link: '/pic'          },
]

/* ── Aktivitas Terbaru ──────────────────────────────────────────────────────── */
const ACTIVITY = [
  { dot: 'bg-green-500',  text: 'Assignment baru — Sarah Jenkins: Personal Training 10x Alex Chen', time: '2 jam lalu'  },
  { dot: 'bg-blue-500',   text: 'Invoice INV-B2B-002 dikirim ke PT. Maju Bersama',                   time: '3 jam lalu'  },
  { dot: 'bg-orange-500', text: '3 pengajuan rekap absensi menunggu review',                         time: '4 jam lalu'  },
  { dot: 'bg-green-500',  text: 'Order baru #EO-006 Private Fitness Retreat ditambahkan',            time: '1 hari lalu' },
  { dot: 'bg-blue-500',   text: 'Contract B2B #BO-003 CV. Teknologi Prima diupload',                 time: '1 hari lalu' },
]

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function DashboardAdmin() {
  const nama = localStorage.getItem('efm_nama') ?? 'Bagoes'

  return (
    <div className="p-6">

      {/* Welcome Banner */}
      <div className="bg-[#1E1C43] rounded-xl px-6 py-4 mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-white text-lg font-semibold">Selamat datang, {nama}! 👋</h1>
          <p className="text-white/60 text-xs mt-0.5">
            {HARI_LABEL}, {TGL_LABEL} — Ringkasan operasional EFM hari ini
          </p>
        </div>
        <div className="text-white/40 text-xs text-right">EFM Portal v2</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {KPI.map(k => {
          const Icon = k.icon
          return (
            <Link
              key={k.label}
              to={k.link}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative block"
            >
              <Icon size={16} className="absolute top-4 right-4 text-gray-300" />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 pr-6">{k.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#1E1C43]">{k.value}</span>
                {k.badge && (
                  <span className="bg-[#E05945] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {k.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{k.sub}</p>
            </Link>
          )
        })}
      </div>

      {/* Main 3-col layout */}
      <div className="grid grid-cols-3 gap-4">

        {/* Left — col-span-2 */}
        <div className="col-span-2 space-y-4">

          {/* Sesi Aktif Hari Ini */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#1E1C43]">Sesi Aktif Hari Ini</h3>
                <p className="text-[10px] text-gray-400">4 sesi terjadwal</p>
              </div>
              <Link to="/pp/orders" className="text-xs text-[#E05945] font-medium hover:underline">
                Lihat Semua →
              </Link>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['PIC', 'Klien', 'Program', 'Jam', 'Status'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SESI.map((s, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-xs font-medium text-gray-800 whitespace-nowrap">{s.pic}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-700 whitespace-nowrap">{s.klien}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${PROGRAM_CLS[s.program] ?? 'bg-gray-100 text-gray-600'}`}>
                        {s.program}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-700 whitespace-nowrap">{s.jam}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_CLS[s.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ringkasan Operasional — 3 mini cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-2">
                <Users size={13} className="text-[#1E1C43]" />
                <span className="text-[10px] text-gray-500">PIC Aktif</span>
              </div>
              <p className="text-xl font-bold text-[#1E1C43]">6</p>
              <p className="text-[10px] text-gray-500 mt-0.5">2 sedang bertugas</p>
              <Link to="/pic" className="block text-[10px] text-[#E05945] font-medium hover:underline mt-2">
                Kelola PIC →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-2">
                <Building2 size={13} className="text-blue-600" />
                <span className="text-[10px] text-gray-500">Kontrak B2B</span>
              </div>
              <p className="text-xl font-bold text-[#1E1C43]">8</p>
              <p className="text-[10px] text-[#E05945] mt-0.5">2 akan habis ≤30 hari</p>
              <Link to="/b2b/orders" className="block text-[10px] text-[#E05945] font-medium hover:underline mt-2">
                Lihat B2B →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-2">
                <CalendarDays size={13} className="text-purple-600" />
                <span className="text-[10px] text-gray-500">Event Aktif</span>
              </div>
              <p className="text-xl font-bold text-[#1E1C43]">3</p>
              <p className="text-[10px] text-red-500 mt-0.5">1 event H-5</p>
              <Link to="/event/orders" className="block text-[10px] text-[#E05945] font-medium hover:underline mt-2">
                Lihat Event →
              </Link>
            </div>
          </div>

          {/* Aktivitas Terbaru */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-[#1E1C43] mb-3">Aktivitas Terbaru</h3>
            <div className="space-y-2.5">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${a.dot}`} />
                  <span className="text-xs text-gray-700 flex-1">{a.text}</span>
                  <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0 whitespace-nowrap">{a.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right — col-span-1 */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#1E1C43]">⚠️ Perlu Tindakan</h3>
              <span className="bg-[#E05945] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {ALERTS.length}
              </span>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {ALERTS.map((a, i) => (
                <Link
                  key={i}
                  to={a.link}
                  className="block p-3 rounded-lg border-l-4 hover:opacity-90 transition-opacity"
                  style={{ borderColor: a.border, backgroundColor: a.bg }}
                >
                  <p className="text-xs font-medium text-gray-800">{a.judul}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{a.detail}</p>
                </Link>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-3">
              Klik alert untuk navigasi ke halaman terkait
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
