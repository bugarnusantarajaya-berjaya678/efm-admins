import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/* ── Kode warna per tipe ──────────────────────────────────────────────────── */
const TIPE_COLOR = {
  'Kunjungan/Supervisi':  '#3B82F6',
  'Maintenance/Perbaikan':'#F59E0B',
  'Sesi/Class':           '#10B981',
  'Penagihan':            '#EF4444',
  'Meeting/Konsultasi':   '#8B5CF6',
  'Lainnya':              '#6B7280',
  'Event Day':            '#E05945',
}

const LEGEND = [
  { label: 'Kunjungan/Supervisi',   color: '#3B82F6' },
  { label: 'Maintenance/Perbaikan', color: '#F59E0B' },
  { label: 'Sesi/Class',            color: '#10B981' },
  { label: 'Penagihan',             color: '#EF4444' },
  { label: 'Meeting/Konsultasi',    color: '#8B5CF6' },
  { label: 'Lainnya',               color: '#6B7280' },
  { label: 'Event Day',             color: '#E05945' },
]

const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const BULAN_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

/* ── Dummy data kalender Juli 2026 ────────────────────────────────────────── */
const KALENDER_DATA = [
  { id: 1, tgl: '2026-07-01', nama: 'DP Fun Run diterima',            event: 'Fun Run Jakarta 2026', orderId: '#EO-001', vendor: 'Admin EFM',           tipe: 'Penagihan',             status: 'Selesai'   },
  { id: 2, tgl: '2026-07-18', nama: 'Technical Check Sound System',   event: 'Fun Run Jakarta 2026', orderId: '#EO-001', vendor: 'TechFix Service Center',tipe: 'Maintenance/Perbaikan', status: 'Terjadwal' },
  { id: 3, tgl: '2026-07-19', nama: 'Briefing Instruktur',            event: 'Fun Run Jakarta 2026', orderId: '#EO-001', vendor: 'Sarah Jenkins',        tipe: 'Meeting/Konsultasi',    status: 'Terjadwal' },
  { id: 4, tgl: '2026-07-19', nama: 'Gladi Resik',                    event: 'Fun Run Jakarta 2026', orderId: '#EO-001', vendor: 'Tim EFM',              tipe: 'Lainnya',               status: 'Terjadwal' },
  { id: 5, tgl: '2026-07-20', nama: '🎯 PELAKSANAAN: Fun Run Jakarta 2026', event: 'Fun Run Jakarta 2026', orderId: '#EO-001', vendor: '—', tipe: 'Event Day', status: 'Terjadwal' },
  { id: 6, tgl: '2026-07-22', nama: 'Evaluasi Pasca Event',           event: 'Fun Run Jakarta 2026', orderId: '#EO-001', vendor: 'Ahmad Pratama',        tipe: 'Meeting/Konsultasi',    status: 'Terjadwal' },
]

const EVENT_LIST = ['Semua Event', 'Fun Run Jakarta 2026', 'Yoga Festival Senayan']
const TIPE_LIST  = ['Semua Tipe', 'Kegiatan Operasional', 'Event Day', 'Penagihan', 'Maintenance/Perbaikan']

function resolveTipeFilter(item, filter) {
  if (filter === 'Semua Tipe') return true
  if (filter === 'Event Day') return item.tipe === 'Event Day'
  if (filter === 'Penagihan') return item.tipe === 'Penagihan'
  if (filter === 'Maintenance/Perbaikan') return item.tipe === 'Maintenance/Perbaikan'
  if (filter === 'Kegiatan Operasional') return item.tipe !== 'Event Day'
  return true
}

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

/* ── Popover detail kegiatan ──────────────────────────────────────────────── */
function ItemPopover({ item, onClose }) {
  const navigate = useNavigate()
  const STATUS_CLS = {
    'Terjadwal': 'bg-yellow-100 text-yellow-700',
    'Sedang Berjalan': 'bg-blue-100 text-blue-700',
    'Selesai': 'bg-green-100 text-green-700',
    'Dibatalkan': 'bg-red-100 text-red-600',
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-80 p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: TIPE_COLOR[item.tipe] || '#6B7280' }} />
            <p className="text-[13px] font-bold text-[#1E1C43] leading-tight">{item.nama}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0 ml-2"><X size={14} /></button>
        </div>
        <div className="space-y-1.5 text-[12px] text-gray-600">
          <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Event</span><span className="font-medium text-gray-800">{item.event}</span></div>
          <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Order</span><span className="font-medium text-[#1E1C43]">{item.orderId}</span></div>
          {item.vendor !== '—' && (
            <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Vendor/PIC</span><span>{item.vendor}</span></div>
          )}
          <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Tanggal</span><span>{new Date(item.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
          <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Tipe</span><span>{item.tipe}</span></div>
          <div className="flex gap-2 items-center"><span className="text-gray-400 w-20 shrink-0">Status</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_CLS[item.status] || 'bg-gray-100 text-gray-600'}`}>{item.status}</span>
          </div>
        </div>
        <button
          onClick={() => { onClose(); navigate('/event/orders') }}
          className="mt-4 w-full text-center text-[12px] font-semibold text-[#1E1C43] hover:underline"
        >
          Lihat Order →
        </button>
      </div>
    </div>
  )
}

/* ── Halaman Utama ────────────────────────────────────────────────────────── */
export default function EventKalenderPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1))
  const [selectedItem, setSelectedItem] = useState(null)
  const [filterEvent, setFilterEvent] = useState('Semua Event')
  const [filterTipe,  setFilterTipe]  = useState('Semua Tipe')

  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)) }

  /* ── Kalender grid ── */
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7
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

  /* ── Filter data ── */
  const filtered = useMemo(() => KALENDER_DATA.filter(k => {
    if (filterEvent !== 'Semua Event' && k.event !== filterEvent) return false
    if (!resolveTipeFilter(k, filterTipe)) return false
    return true
  }), [filterEvent, filterTipe])

  function getItemsForDate(date) {
    const ymd = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
    return filtered.filter(k => k.tgl === ymd)
  }

  const today = new Date()

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-text-primary">Kalender Operasional Event</h1>
        <p className="text-sm text-text-muted mt-1">Jadwal kegiatan dan timeline semua event aktif</p>
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
          <FilterSelect value={filterEvent} onChange={setFilterEvent} options={EVENT_LIST} />
          <FilterSelect value={filterTipe}  onChange={setFilterTipe}  options={TIPE_LIST} />
          <button
            onClick={() => { setFilterEvent('Semua Event'); setFilterTipe('Semua Tipe') }}
            className="h-9 flex items-center gap-1.5 px-3 rounded-lg border border-[#1E1C43] text-[13px] font-semibold text-[#1E1C43] hover:bg-[#1E1C43] hover:text-white transition-colors"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white shadow-sm rounded-xl px-6 py-3 flex flex-wrap items-center gap-4">
        {LEGEND.map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
            <span className="text-[11px] text-gray-600">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="bg-white shadow-sm rounded-xl p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {HARI.map(h => (
            <div key={h} className="text-xs font-semibold text-gray-500 uppercase text-center py-2">{h}</div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            const items = getItemsForDate(cell.date)
            const isToday = cell.date.toDateString() === today.toDateString()
            const visible = items.slice(0, 3)
            const extra   = items.length - visible.length

            return (
              <div
                key={i}
                className={[
                  'min-h-[100px] p-1.5 border border-gray-100 rounded-lg',
                  cell.curMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 opacity-50',
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

                {visible.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded mb-0.5 truncate cursor-pointer hover:opacity-80 transition-opacity text-white"
                    style={{ backgroundColor: TIPE_COLOR[item.tipe] || '#6B7280' }}
                    title={item.nama}
                  >
                    {item.nama}
                  </div>
                ))}
                {extra > 0 && (
                  <p className="text-[10px] text-gray-500 px-1">+{extra} lainnya</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Item Popover */}
      {selectedItem && (
        <ItemPopover item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  )
}
