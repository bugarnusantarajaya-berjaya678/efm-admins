import { eventRevenueStats, eventRevenueChart, eventRevenueKlien } from '../../data/eventData'

const STATUS_CONFIG = {
  lunas:   { label: 'Lunas',   cls: 'bg-green-50 text-green-600'  },
  cicilan: { label: 'Cicilan', cls: 'bg-yellow-50 text-yellow-600' },
  telat:   { label: 'Telat',   cls: 'bg-red-50 text-red-500'       },
}

const SISA_COLOR = {
  green:  'text-green-600',
  yellow: 'text-yellow-600',
  red:    'text-red-500',
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

const maxCorp = Math.max(...eventRevenueChart.map(d => d.corporate))
const maxApt  = Math.max(...eventRevenueChart.map(d => d.apartment))
const maxTotal = Math.max(...eventRevenueChart.map(d => d.corporate + d.apartment))

export default function EventRevenuePage() {
  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Revenue Event</h1>
          <p className="text-[13px] text-text-muted mt-1">Laporan pendapatan event fitness & sport</p>
        </div>
        <select className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white">
          <option>6 Bulan Terakhir</option>
          <option>12 Bulan Terakhir</option>
          <option>Tahun 2026</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-2xl p-5 border-[1.5px] border-gray-200">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Total Revenue Bulan Ini</p>
          <p className="text-[26px] font-bold text-text-primary mb-1">{eventRevenueStats.revenueMonth}</p>
          <p className="text-[11px] text-green-600">↑ 8% vs bulan lalu</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border-[1.5px] border-gray-200">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Total Klien Aktif</p>
          <p className="text-[26px] font-bold text-text-primary mb-1">{eventRevenueStats.totalKlien}</p>
          <p className="text-[11px] text-text-muted">Corporate + Apartment</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border-[1.5px] border-gray-200">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Rata-rata per Klien</p>
          <p className="text-[26px] font-bold text-text-primary mb-1">{eventRevenueStats.rataRata}</p>
          <p className="text-[11px] text-text-muted">Per bulan</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden mb-5">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-text-primary">Revenue per Bulan</h3>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-end gap-3 h-[140px]">
            {eventRevenueChart.map(d => {
              const totalH = ((d.corporate + d.apartment) / maxTotal) * 130
              const corpH  = (d.corporate  / (d.corporate + d.apartment)) * totalH
              const aptH   = (d.apartment  / (d.corporate + d.apartment)) * totalH
              return (
                <div key={d.bulan} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="flex flex-col items-center gap-0.5 w-full">
                    <div className="w-full rounded-t-md hover:opacity-80 transition-opacity cursor-pointer" style={{ height: `${corpH}px`, background: '#1E1C43' }} />
                    <div className="w-full hover:opacity-80 transition-opacity cursor-pointer" style={{ height: `${aptH}px`, background: '#E05945' }} />
                  </div>
                  <span className="text-[10px] text-text-muted">{d.bulan}</span>
                </div>
              )
            })}
          </div>
          <div className="flex gap-5 mt-4 justify-center">
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#1E1C43' }} />Corporate
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#E05945' }} />Apartment
            </div>
          </div>
        </div>
      </div>

      {/* Revenue per klien */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-text-primary">Revenue per Klien — Juni 2026</h3>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Nama Klien', 'Jenis', 'Nilai Kontrak', 'Status Bayar', 'Sisa Kontrak'].map(h => (
                <th key={h} className="bg-gray-50 px-4 py-3 text-[11px] font-semibold text-text-muted text-left uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {eventRevenueKlien.map((klien, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className={`px-4 py-3.5 text-[13px] font-semibold text-text-primary ${i < eventRevenueKlien.length - 1 ? 'border-b border-gray-100' : ''}`}>{klien.nama}</td>
                <td className={`px-4 py-3.5 text-[13px] text-text-muted ${i < eventRevenueKlien.length - 1 ? 'border-b border-gray-100' : ''}`}>{klien.jenis}</td>
                <td className={`px-4 py-3.5 text-[13px] text-text-muted ${i < eventRevenueKlien.length - 1 ? 'border-b border-gray-100' : ''}`}>{klien.nilaiKontrak}</td>
                <td className={`px-4 py-3.5 ${i < eventRevenueKlien.length - 1 ? 'border-b border-gray-100' : ''}`}><StatusBadge status={klien.statusBayar} /></td>
                <td className={`px-4 py-3.5 text-[13px] font-semibold ${SISA_COLOR[klien.sisaColor]} ${i < eventRevenueKlien.length - 1 ? 'border-b border-gray-100' : ''}`}>{klien.sisaKontrak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
