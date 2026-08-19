import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users } from 'lucide-react'
import { eventTrackerCards } from '../../data/eventData'

const STATUS_CONFIG = {
  upcoming:  { label: 'Upcoming',  cls: 'bg-blue-50 text-blue-600'    },
  ongoing:   { label: 'Ongoing',   cls: 'bg-green-50 text-green-600'   },
  done:      { label: 'Selesai',   cls: 'bg-gray-100 text-gray-500'    },
  cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-500'       },
}

const CHECKLIST_CONFIG = {
  done:    { bg: 'bg-green-500',  text: 'text-white',  char: '✓' },
  urgent:  { bg: 'bg-accent',     text: 'text-white',  char: '!' },
  pending: { bg: 'bg-gray-200',   text: 'text-gray-500',char: '○' },
}

const PROGRESS_COLOR = {
  upcoming: '#1E1C43',
  ongoing:  '#27AE60',
  done:     '#27AE60',
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

function EventCard({ ev }) {
  const progressColor = PROGRESS_COLOR[ev.status] || '#1E1C43'
  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-[15px] font-bold text-text-primary">{ev.nama}</h3>
          <p className="text-[12px] text-text-muted mt-0.5">{ev.klien}</p>
        </div>
        <StatusBadge status={ev.status} />
      </div>
      <div className="px-5 py-4">
        {/* Meta */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
            <Calendar size={14} className="shrink-0" /><strong className="text-text-primary">{ev.tanggal}</strong>
          </div>
          {ev.lokasi !== '—' && (
            <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
              <MapPin size={14} className="shrink-0" /><strong className="text-text-primary">{ev.lokasi}</strong>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
            <Users size={14} className="shrink-0" /><strong className="text-text-primary">{ev.peserta}</strong>
          </div>
        </div>
        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-text-muted">{ev.status === 'done' ? 'Penyelesaian' : 'Progress Persiapan'}</span>
            <strong className="text-text-primary">{ev.progress}%</strong>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${ev.progress}%`, background: progressColor }} />
          </div>
        </div>
        {/* Checklist */}
        <div>
          {ev.checklist.map((item, i) => {
            const cfg = CHECKLIST_CONFIG[item.status]
            const isLast = i === ev.checklist.length - 1
            return (
              <div key={i} className={`flex items-center gap-2 text-[12px] py-1.5 ${!isLast ? 'border-b border-gray-100' : ''}`}>
                <div className={`w-[18px] h-[18px] rounded-full ${cfg.bg} ${cfg.text} flex items-center justify-center shrink-0 text-[10px] font-bold`}>
                  {cfg.char}
                </div>
                <span className={item.status === 'urgent' ? 'text-accent font-semibold' : item.status === 'pending' ? 'text-text-muted' : 'text-text-primary'}>
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
        <span className="text-[12px] text-text-muted">PIC: {ev.pic}</span>
        <Link to="/event/invoice" className="text-[12px] text-accent font-semibold hover:underline">Lihat Invoice →</Link>
      </div>
    </div>
  )
}

export default function EventTrackerPage() {
  const [filter, setFilter] = useState('')

  const filtered = filter
    ? eventTrackerCards.filter(ev => ev.status === filter.toLowerCase())
    : eventTrackerCards

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Event Tracker</h1>
          <p className="text-[13px] text-text-muted mt-1">Monitor progress & checklist semua event aktif</p>
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white"
        >
          <option value="">Semua Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="done">Selesai</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {filtered.map(ev => <EventCard key={ev.id} ev={ev} />)}
        {filtered.length === 0 && (
          <div className="col-span-2 bg-white rounded-2xl border-[1.5px] border-gray-200 px-6 py-12 text-center text-[13px] text-text-muted">
            Tidak ada event dengan status ini
          </div>
        )}
      </div>
    </div>
  )
}
