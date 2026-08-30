import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/* ── Color helpers ──────────────────────────────────────────────────────────── */
function getActivityColor(tipe) {
  switch (tipe) {
    case 'Sesi Rutin':       return 'bg-blue-100 text-blue-800 border-l-2 border-blue-400'
    case 'Evaluasi Bulanan': return 'bg-purple-100 text-purple-800 border-l-2 border-purple-400'
    case 'Sesi Pengganti':   return 'bg-orange-100 text-orange-800 border-l-2 border-orange-400'
    case 'Survei':           return 'bg-cyan-100 text-cyan-800 border-l-2 border-cyan-400'
    default:                 return 'bg-gray-100 text-gray-700 border-l-2 border-gray-300'
  }
}

function getStatusDot(status) {
  switch (status) {
    case 'Selesai':     return 'bg-green-500'
    case 'Dijadwalkan': return 'bg-yellow-400'
    case 'Dibatalkan':  return 'bg-red-400'
    default:            return 'bg-gray-400'
  }
}

/* ── Constants ──────────────────────────────────────────────────────────────── */
const HARI     = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const BULAN_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const KLIEN_LIST = ['Semua Klien', 'PT. Maju Bersama Tbk', 'Apartemen Greenlake Sunter', 'PT. Sinar Nusantara Jaya']
const TIPE_LIST  = ['Semua Tipe', 'Sesi Rutin', 'Evaluasi Bulanan', 'Sesi Pengganti']

/* ── Dummy data aktivitas kalender ─────────────────────────────────────────── */
const dummyKalenderActivities = [
  // BO-001 — PT. Maju Bersama Tbk
  {
    id: 'KAL-001',
    orderId: 'BO-001',
    leadId: 'BL-001',
    surveiId: 'SV-001',
    companyName: 'PT. Maju Bersama Tbk',
    programNama: 'Corporate Wellness — Yoga & Functional Training',
    tipeAktivitas: 'Sesi Rutin',
    tanggal: '2026-06-03',
    jamMulai: '07:00',
    jamSelesai: '08:30',
    lokasi: 'Jl. Sudirman No. 45, Gedung Maju Lt. 12',
    picEFM: 'Bagoes',
    namaKoordinator: 'Budi Santoso',
    waKoordinator: '081234567890',
    status: 'Selesai',
    catatan: 'Sesi perdana, peserta 28 orang',
  },
  {
    id: 'KAL-002',
    orderId: 'BO-001',
    leadId: 'BL-001',
    surveiId: 'SV-001',
    companyName: 'PT. Maju Bersama Tbk',
    programNama: 'Corporate Wellness — Yoga & Functional Training',
    tipeAktivitas: 'Sesi Rutin',
    tanggal: '2026-06-10',
    jamMulai: '07:00',
    jamSelesai: '08:30',
    lokasi: 'Jl. Sudirman No. 45, Gedung Maju Lt. 12',
    picEFM: 'Bagoes',
    namaKoordinator: 'Budi Santoso',
    waKoordinator: '081234567890',
    status: 'Selesai',
    catatan: '',
  },
  {
    id: 'KAL-003',
    orderId: 'BO-001',
    leadId: 'BL-001',
    surveiId: 'SV-001',
    companyName: 'PT. Maju Bersama Tbk',
    programNama: 'Corporate Wellness — Yoga & Functional Training',
    tipeAktivitas: 'Evaluasi Bulanan',
    tanggal: '2026-06-27',
    jamMulai: '09:00',
    jamSelesai: '10:00',
    lokasi: 'Jl. Sudirman No. 45, Gedung Maju Lt. 12',
    picEFM: 'Bagoes',
    namaKoordinator: 'Budi Santoso',
    waKoordinator: '081234567890',
    status: 'Dijadwalkan',
    catatan: 'Review progress bulan pertama',
  },
  // BO-002 — Apartemen Greenlake Sunter
  {
    id: 'KAL-004',
    orderId: 'BO-002',
    leadId: 'BL-002',
    surveiId: 'SV-002',
    companyName: 'Apartemen Greenlake Sunter',
    programNama: 'Apartment Fitness — Cardio & Strength',
    tipeAktivitas: 'Sesi Rutin',
    tanggal: '2026-06-05',
    jamMulai: '06:30',
    jamSelesai: '07:30',
    lokasi: 'Jl. Danau Sunter Selatan, Jakarta Utara',
    picEFM: 'Emma',
    namaKoordinator: 'Dewi Rahayu',
    waKoordinator: '082112345678',
    status: 'Selesai',
    catatan: '',
  },
  {
    id: 'KAL-005',
    orderId: 'BO-002',
    leadId: 'BL-002',
    surveiId: 'SV-002',
    companyName: 'Apartemen Greenlake Sunter',
    programNama: 'Apartment Fitness — Cardio & Strength',
    tipeAktivitas: 'Sesi Rutin',
    tanggal: '2026-06-12',
    jamMulai: '06:30',
    jamSelesai: '07:30',
    lokasi: 'Jl. Danau Sunter Selatan, Jakarta Utara',
    picEFM: 'Emma',
    namaKoordinator: 'Dewi Rahayu',
    waKoordinator: '082112345678',
    status: 'Selesai',
    catatan: '',
  },
  {
    id: 'KAL-006',
    orderId: 'BO-002',
    leadId: 'BL-002',
    surveiId: 'SV-002',
    companyName: 'Apartemen Greenlake Sunter',
    programNama: 'Apartment Fitness — Cardio & Strength',
    tipeAktivitas: 'Sesi Rutin',
    tanggal: '2026-07-03',
    jamMulai: '06:30',
    jamSelesai: '07:30',
    lokasi: 'Jl. Danau Sunter Selatan, Jakarta Utara',
    picEFM: 'Emma',
    namaKoordinator: 'Dewi Rahayu',
    waKoordinator: '082112345678',
    status: 'Dijadwalkan',
    catatan: '',
  },
  // BO-003 — PT. Sinar Nusantara Jaya
  {
    id: 'KAL-007',
    orderId: 'BO-003',
    leadId: 'BL-005',
    surveiId: null,
    companyName: 'PT. Sinar Nusantara Jaya',
    programNama: 'Corporate Pilates & Mobility',
    tipeAktivitas: 'Sesi Rutin',
    tanggal: '2026-06-04',
    jamMulai: '12:00',
    jamSelesai: '13:00',
    lokasi: 'Jl. Thamrin No. 10, Jakarta Pusat',
    picEFM: 'Bagoes',
    namaKoordinator: 'Rina Kusuma',
    waKoordinator: '081398765432',
    status: 'Selesai',
    catatan: '',
  },
  {
    id: 'KAL-008',
    orderId: 'BO-003',
    leadId: 'BL-005',
    surveiId: null,
    companyName: 'PT. Sinar Nusantara Jaya',
    programNama: 'Corporate Pilates & Mobility',
    tipeAktivitas: 'Sesi Rutin',
    tanggal: '2026-06-18',
    jamMulai: '12:00',
    jamSelesai: '13:00',
    lokasi: 'Jl. Thamrin No. 10, Jakarta Pusat',
    picEFM: 'Bagoes',
    namaKoordinator: 'Rina Kusuma',
    waKoordinator: '081398765432',
    status: 'Dibatalkan',
    catatan: 'Klien ada acara internal mendadak',
  },
  {
    id: 'KAL-009',
    orderId: 'BO-003',
    leadId: 'BL-005',
    surveiId: null,
    companyName: 'PT. Sinar Nusantara Jaya',
    programNama: 'Corporate Pilates & Mobility',
    tipeAktivitas: 'Sesi Pengganti',
    tanggal: '2026-07-01',
    jamMulai: '12:00',
    jamSelesai: '13:00',
    lokasi: 'Jl. Thamrin No. 10, Jakarta Pusat',
    picEFM: 'Bagoes',
    namaKoordinator: 'Rina Kusuma',
    waKoordinator: '081398765432',
    status: 'Dijadwalkan',
    catatan: 'Pengganti sesi 18 Jun yang dibatalkan',
  },
]

/* ── Filter select ──────────────────────────────────────────────────────────── */
function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="h-9 px-3 pr-7 rounded-lg border border-gray-200 bg-white text-[13px] outline-none appearance-none cursor-pointer hover:border-gray-300 focus:border-[#1E1C43] transition-colors"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

/* ── Legend ─────────────────────────────────────────────────────────────────── */
const LEGEND = [
  { label: 'Sesi Rutin',       color: 'bg-blue-400' },
  { label: 'Evaluasi Bulanan', color: 'bg-purple-400' },
  { label: 'Sesi Pengganti',   color: 'bg-orange-400' },
]

/* ── Halaman Utama ───────────────────────────────────────────────────────────  */
export default function B2BKalenderPage() {
  const navigate = useNavigate()
  const [currentDate,      setCurrentDate]      = useState(new Date(2026, 5, 1)) // Jun 2026
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [filterKlien,      setFilterKlien]      = useState('Semua Klien')
  const [filterTipe,       setFilterTipe]       = useState('Semua Tipe')

  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)) }

  /* ── Kalender grid ── */
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7 // Mon = 0
  const cells = []
  for (let i = 0; i < startDow; i++) {
    cells.push({ date: new Date(year, month, -startDow + i + 1), curMonth: false })
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push({ date: new Date(year, month, d), curMonth: true })
  }
  const rem = 7 - (cells.length % 7)
  if (rem < 7) {
    for (let d = 1; d <= rem; d++) {
      cells.push({ date: new Date(year, month + 1, d), curMonth: false })
    }
  }

  /* ── Filter ── */
  const filtered = useMemo(() => dummyKalenderActivities.filter(k => {
    if (filterKlien !== 'Semua Klien' && k.companyName   !== filterKlien) return false
    if (filterTipe  !== 'Semua Tipe'  && k.tipeAktivitas !== filterTipe)  return false
    return true
  }), [filterKlien, filterTipe])

  function getItemsForDate(date) {
    const ymd = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return filtered.filter(k => k.tanggal === ymd)
  }

  const today = new Date()

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-text-primary">Kalender Operasional B2B</h1>
        <p className="text-sm text-text-muted mt-1">Jadwal sesi dan kegiatan semua klien B2B aktif</p>
      </div>

      {/* Navigation + Filter Bar */}
      <div className="bg-white shadow-sm rounded-xl px-6 py-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-[17px] font-bold text-[#1E1C43] min-w-[140px] text-center">
            {BULAN_ID[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3 ml-auto flex-wrap">
          <FilterSelect value={filterKlien} onChange={setFilterKlien} options={KLIEN_LIST} />
          <FilterSelect value={filterTipe}  onChange={setFilterTipe}  options={TIPE_LIST} />
          <button
            onClick={() => { setFilterKlien('Semua Klien'); setFilterTipe('Semua Tipe') }}
            className="h-9 flex items-center gap-1.5 px-3 rounded-lg border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white shadow-sm rounded-xl px-6 py-3 flex flex-wrap items-center gap-5">
        {LEGEND.map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${l.color}`} />
            <span className="text-[11px] text-gray-600">{l.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-4">
          {[['bg-green-500', 'Selesai'], ['bg-yellow-400', 'Dijadwalkan'], ['bg-red-400', 'Dibatalkan']].map(([cls, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${cls}`} />
              <span className="text-[11px] text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Layout: kalender + detail panel */}
      <div className={`flex gap-4 items-start ${selectedActivity ? '' : ''}`}>

        {/* Calendar Grid */}
        <div className={`bg-white shadow-sm rounded-xl p-4 ${selectedActivity ? 'flex-1 min-w-0' : 'w-full'}`}>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {HARI.map(h => (
              <div key={h} className="text-xs font-semibold text-gray-500 uppercase text-center py-2">{h}</div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              const items   = getItemsForDate(cell.date)
              const isToday = cell.date.toDateString() === today.toDateString()
              const visible = items.slice(0, 3)
              const extra   = items.length - visible.length

              return (
                <div
                  key={i}
                  className={[
                    'min-h-[100px] p-1.5 border rounded-lg',
                    cell.curMonth
                      ? selectedActivity
                        ? 'bg-white border-gray-100 hover:bg-gray-50'
                        : 'bg-white border-gray-100 hover:bg-gray-50'
                      : 'bg-gray-50 border-gray-100 opacity-50',
                  ].join(' ')}
                >
                  <div className="mb-1">
                    {isToday ? (
                      <span className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1E1C43] text-white text-sm font-medium">
                        {cell.date.getDate()}
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-gray-700 px-1">{cell.date.getDate()}</span>
                    )}
                  </div>

                  {visible.map(activity => (
                    <button
                      key={activity.id}
                      onClick={() => setSelectedActivity(activity)}
                      className={`w-full text-left text-[10px] px-1.5 py-1 rounded mb-0.5 truncate flex items-center gap-1 ${getActivityColor(activity.tipeAktivitas)}`}
                      title={`${activity.companyName} — ${activity.tipeAktivitas}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDot(activity.status)}`} />
                      <span className="truncate font-medium">{activity.companyName}</span>
                    </button>
                  ))}
                  {extra > 0 && (
                    <p className="text-[10px] text-gray-500 px-1">+{extra} lainnya</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Detail Panel — muncul saat aktivitas dipilih */}
        {selectedActivity && (
          <div className="w-72 shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-5">

            {/* Header detail */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 mr-2">
                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    selectedActivity.tipeAktivitas === 'Sesi Rutin'       ? 'bg-blue-100 text-blue-700' :
                    selectedActivity.tipeAktivitas === 'Evaluasi Bulanan' ? 'bg-purple-100 text-purple-700' :
                    selectedActivity.tipeAktivitas === 'Sesi Pengganti'   ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedActivity.tipeAktivitas}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    selectedActivity.status === 'Selesai'     ? 'bg-green-100 text-green-700' :
                    selectedActivity.status === 'Dijadwalkan' ? 'bg-yellow-100 text-yellow-700' :
                    selectedActivity.status === 'Dibatalkan'  ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedActivity.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-800 leading-tight">
                  {selectedActivity.companyName}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                  {selectedActivity.programNama}
                </p>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>

            {/* Waktu & Lokasi */}
            <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-start gap-2">
                <span className="text-gray-400 text-sm mt-0.5">📅</span>
                <div>
                  <p className="text-xs font-semibold text-gray-700">
                    {new Date(selectedActivity.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedActivity.jamMulai} – {selectedActivity.jamSelesai} WIB
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-400 text-sm mt-0.5">📍</span>
                <p className="text-xs text-gray-600 leading-snug">{selectedActivity.lokasi}</p>
              </div>
            </div>

            {/* Kontak klien */}
            <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">👤</span>
                <div>
                  <p className="text-xs font-semibold text-gray-700">{selectedActivity.namaKoordinator}</p>
                  <p className="text-[10px] text-gray-400">Koordinator Klien</p>
                </div>
              </div>
              {selectedActivity.waKoordinator && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">💬</span>
                  <a
                    href={`https://wa.me/62${selectedActivity.waKoordinator.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:underline font-medium"
                  >
                    {selectedActivity.waKoordinator}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">🏃</span>
                <p className="text-xs text-gray-600">
                  PIC EFM: <span className="font-semibold">{selectedActivity.picEFM}</span>
                </p>
              </div>
            </div>

            {/* Catatan */}
            {selectedActivity.catatan && (
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Catatan</p>
                <p className="text-xs text-gray-600 leading-snug">{selectedActivity.catatan}</p>
              </div>
            )}

            {/* Koneksi ke modul lain */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Terhubung ke</p>
              <div className="space-y-1.5">
                {/* Order */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono bg-[#1E1C43]/10 text-[#1E1C43] px-1.5 py-0.5 rounded font-semibold">
                      {selectedActivity.orderId}
                    </span>
                    <span className="text-xs text-gray-500">Order</span>
                  </div>
                  <button
                    onClick={() => navigate(`/b2b/orders/${selectedActivity.orderId}`)}
                    className="text-xs text-[#1E1C43] font-semibold hover:underline flex items-center gap-1"
                  >
                    Lihat →
                  </button>
                </div>
                {/* Survei */}
                {selectedActivity.surveiId && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                        {selectedActivity.surveiId}
                      </span>
                      <span className="text-xs text-gray-500">Survei</span>
                    </div>
                    <button
                      onClick={() => navigate(`/b2b/survei/${selectedActivity.surveiId}`)}
                      className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      Lihat →
                    </button>
                  </div>
                )}
                {/* Lead */}
                {selectedActivity.leadId && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-semibold">
                        {selectedActivity.leadId}
                      </span>
                      <span className="text-xs text-gray-500">Lead</span>
                    </div>
                    <button
                      onClick={() => navigate(`/b2b/leads?highlight=${selectedActivity.leadId}`)}
                      className="text-xs text-gray-500 font-semibold hover:underline flex items-center gap-1"
                    >
                      Lihat →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* CTA utama */}
            <button
              onClick={() => navigate(`/b2b/orders/${selectedActivity.orderId}`)}
              className="w-full py-2.5 bg-[#1E1C43] text-white text-sm font-semibold rounded-xl hover:bg-[#2d2a6e] transition-colors flex items-center justify-center gap-2"
            >
              📋 Buka Detail Order {selectedActivity.orderId}
            </button>

          </div>
        )}
      </div>

    </div>
  )
}
