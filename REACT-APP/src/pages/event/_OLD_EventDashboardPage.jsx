import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import {
  eventStats, eventList, eventTimeline,
  eventLeadsPipeline,
} from '../../data/eventData'

const STATUS_CONFIG = {
  upcoming:  { label: 'Upcoming',  cls: 'bg-blue-50 text-blue-600'   },
  ongoing:   { label: 'Ongoing',   cls: 'bg-green-50 text-green-600'  },
  done:      { label: 'Selesai',   cls: 'bg-gray-100 text-gray-500'   },
  cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-500'      },
}

const STAGE_CONFIG = {
  closing:  { label: 'Closing',  cls: 'bg-green-50 text-green-600'  },
  proposal: { label: 'Proposal', cls: 'bg-purple-50 text-purple-600' },
  new:      { label: 'New',      cls: 'bg-blue-50 text-blue-600'    },
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

function StageBadge({ stage }) {
  const cfg = STAGE_CONFIG[stage] || { label: stage, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

export default function EventDashboardPage() {
  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Event Management</h1>
          <p className="text-[13px] text-text-muted mt-1">Overview semua event fitness & sport EFM</p>
        </div>
        <Link
          to="/event/leads"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors"
        >
          <Plus size={15} strokeWidth={2.5} />
          New Event Lead
        </Link>
      </div>

      {/* Stats — 3 cards, tanpa revenue */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Link to="/event/orders" className="block">
          <div className="bg-white rounded-2xl p-5 border-[1.5px] border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Event Aktif</p>
            <p className="text-[26px] font-bold mb-1 text-text-primary">{eventStats.eventAktif}</p>
            <p className="text-[11px] text-text-muted">Berjalan bulan ini</p>
          </div>
        </Link>
        <div className="bg-white rounded-2xl p-5 border-[1.5px] border-accent">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Upcoming Event</p>
          <p className="text-[26px] font-bold mb-1 text-accent">{eventStats.upcomingEvent}</p>
          <p className="text-[11px] text-text-muted">30 hari ke depan</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border-[1.5px] border-gray-200">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Leads Pipeline</p>
          <p className="text-[26px] font-bold mb-1 text-text-primary">{eventStats.leadsPipeline}</p>
          <p className="text-[11px] text-text-muted">3 hot leads</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-[1fr_300px] gap-5">
        {/* Event table */}
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-[14px] font-bold text-text-primary">Event Aktif & Upcoming</h3>
              <p className="text-[12px] text-text-muted mt-0.5">Jadwal event terdekat</p>
            </div>
            <Link to="/event/orders" className="text-[12px] text-accent font-semibold hover:underline">Lihat Semua →</Link>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Nama Event', 'Klien', 'Tanggal', 'Peserta', 'Status'].map(h => (
                  <th key={h} className="bg-gray-50 px-4 py-3 text-[11px] font-semibold text-text-muted text-left uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eventList.map(ev => (
                <tr key={ev.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3 text-[13px] border-b border-gray-100 font-semibold text-text-primary">{ev.nama}</td>
                  <td className="px-4 py-3 text-[13px] border-b border-gray-100 text-text-muted">{ev.klien}</td>
                  <td className="px-4 py-3 text-[13px] border-b border-gray-100 text-text-muted">{ev.tanggal}</td>
                  <td className="px-4 py-3 text-[13px] border-b border-gray-100 text-text-muted">{ev.peserta}</td>
                  <td className="px-4 py-3 border-b border-gray-100"><StatusBadge status={ev.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Timeline */}
          <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-[14px] font-bold text-text-primary">Timeline Minggu Ini</h3>
            </div>
            <div className="px-5 py-2">
              {eventTimeline.map((item, i) => (
                <div key={i} className={`flex gap-3.5 py-3 ${i < eventTimeline.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: item.warna }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-text-primary leading-tight">{item.nama}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{item.desc}</p>
                  </div>
                  <span className="text-[11px] text-text-muted whitespace-nowrap">{item.tanggal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leads Pipeline */}
          <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-[14px] font-bold text-text-primary">Leads Pipeline</h3>
              <Link to="/event/leads" className="text-[12px] text-accent font-semibold hover:underline">Lihat →</Link>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-gray-50 px-4 py-2.5 text-[11px] font-semibold text-text-muted text-left uppercase tracking-wide">Nama</th>
                  <th className="bg-gray-50 px-4 py-2.5 text-[11px] font-semibold text-text-muted text-left uppercase tracking-wide">Stage</th>
                </tr>
              </thead>
              <tbody>
                {eventLeadsPipeline.map((lead, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className={`px-4 py-3 text-[13px] text-text-muted ${i < eventLeadsPipeline.length - 1 ? 'border-b border-gray-100' : ''}`}>{lead.nama}</td>
                    <td className={`px-4 py-3 ${i < eventLeadsPipeline.length - 1 ? 'border-b border-gray-100' : ''}`}><StageBadge stage={lead.stage} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
