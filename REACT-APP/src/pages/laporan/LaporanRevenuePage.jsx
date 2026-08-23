import { useState } from 'react'
import { TrendingUp, DollarSign, Layers } from 'lucide-react'

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const CHART_DATA = [
  { bulan: 'Jan', pp: 32, b2b: 28, event: 12 },
  { bulan: 'Feb', pp: 35, b2b: 30, event: 8  },
  { bulan: 'Mar', pp: 30, b2b: 35, event: 15 },
  { bulan: 'Apr', pp: 38, b2b: 32, event: 20 },
  { bulan: 'Mei', pp: 42, b2b: 40, event: 18 },
  { bulan: 'Jun', pp: 45, b2b: 48, event: 34 },
]

const BREAKDOWN = [
  { bulan: 'Juni 2026',  pp: 45000000, b2b: 48000000, event: 34000000 },
  { bulan: 'Mei 2026',   pp: 42000000, b2b: 40000000, event: 18000000 },
  { bulan: 'April 2026', pp: 38000000, b2b: 32000000, event: 20000000 },
  { bulan: 'Maret 2026', pp: 30000000, b2b: 35000000, event: 15000000 },
  { bulan: 'Feb 2026',   pp: 35000000, b2b: 30000000, event: 8000000  },
  { bulan: 'Jan 2026',   pp: 32000000, b2b: 28000000, event: 12000000 },
]

function fmt(n) { return 'Rp ' + (n / 1000000).toFixed(0) + 'jt' }
function fmtFull(n) { return 'Rp ' + n.toLocaleString('id-ID') }

const maxTotal = Math.max(...CHART_DATA.map(d => d.pp + d.b2b + d.event))

export default function LaporanRevenuePage() {
  const [periode, setPeriode] = useState('6')
  const [divisi,  setDivisi]  = useState('')

  const totalPP    = BREAKDOWN.reduce((s, d) => s + d.pp, 0)
  const totalB2B   = BREAKDOWN.reduce((s, d) => s + d.b2b, 0)
  const totalEvent = BREAKDOWN.reduce((s, d) => s + d.event, 0)
  const totalAll   = totalPP + totalB2B + totalEvent

  const chartRows = CHART_DATA.slice(-Number(periode || 6))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Ringkasan Revenue</h1>
          <p className="text-[13px] text-text-muted mt-1">Laporan pendapatan semua divisi EFM</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={periode} onChange={e => setPeriode(e.target.value)} className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white">
            <option value="3">3 Bulan Terakhir</option>
            <option value="6">6 Bulan Terakhir</option>
            <option value="12">12 Bulan Terakhir</option>
          </select>
          <select value={divisi} onChange={e => setDivisi(e.target.value)} className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white">
            <option value="">Semua Divisi</option>
            <option value="pp">Private Program</option>
            <option value="b2b">B2B</option>
            <option value="event">Event</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', val: totalAll,   icon: TrendingUp,  bg: 'bg-[rgba(30,28,67,0.08)]', iconCls: 'text-text-primary' },
          { label: 'Revenue PP',    val: totalPP,    icon: DollarSign,  bg: 'bg-[rgba(30,28,67,0.08)]', iconCls: 'text-text-primary' },
          { label: 'Revenue B2B',   val: totalB2B,   icon: Layers,      bg: 'bg-orange-50',             iconCls: 'text-accent'       },
          { label: 'Revenue Event', val: totalEvent, icon: TrendingUp,  bg: 'bg-teal-50',               iconCls: 'text-teal-600'     },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                  <Icon size={16} className={s.iconCls} />
                </div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">{s.label}</p>
              </div>
              <p className="text-[22px] font-bold text-text-primary">{fmt(s.val)}</p>
            </div>
          )
        })}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-text-primary">Revenue per Bulan</h3>
          <div className="flex gap-4 text-[11px] text-text-muted">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{background:'#1E1C43'}} />PP</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{background:'#E05945'}} />B2B</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{background:'#16A085'}} />Event</span>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-end gap-4 h-[130px]">
            {chartRows.map(d => {
              const totalH = ((d.pp + d.b2b + d.event) / maxTotal) * 120
              const ppH    = (d.pp    / (d.pp + d.b2b + d.event)) * totalH
              const b2bH   = (d.b2b   / (d.pp + d.b2b + d.event)) * totalH
              const evH    = (d.event / (d.pp + d.b2b + d.event)) * totalH
              return (
                <div key={d.bulan} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="flex flex-col w-full gap-0.5">
                    <div className="w-full rounded-t-md" style={{ height: `${ppH}px`, background: '#1E1C43' }} />
                    <div className="w-full"               style={{ height: `${b2bH}px`, background: '#E05945' }} />
                    <div className="w-full"               style={{ height: `${evH}px`, background: '#16A085' }} />
                  </div>
                  <span className="text-[10px] text-text-muted">{d.bulan}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-text-primary">Breakdown Per Divisi Per Bulan</h3>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Bulan', 'Revenue PP', 'Revenue B2B', 'Revenue Event', 'Total'].map(h => (
                <th key={h} className="bg-gray-50 px-3 py-2.5 text-[10px] font-semibold text-gray-500 text-left uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BREAKDOWN.map((d, i) => (
              <tr key={d.bulan} className={`hover:bg-gray-50 transition-colors duration-150 ${i < BREAKDOWN.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5">{d.bulan}</td>
                <td className="text-xs font-normal text-gray-600 px-3 py-2.5">{fmtFull(d.pp)}</td>
                <td className="text-xs font-normal text-gray-600 px-3 py-2.5">{fmtFull(d.b2b)}</td>
                <td className="text-xs font-normal text-gray-600 px-3 py-2.5">{fmtFull(d.event)}</td>
                <td className="text-xs font-semibold text-gray-600 px-3 py-2.5">{fmtFull(d.pp + d.b2b + d.event)}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 border-t-2 border-gray-200">
              <td className="px-3 py-2.5 text-xs font-bold text-[#1E1C43] uppercase">Total</td>
              <td className="px-3 py-2.5 text-xs font-semibold text-[#1E1C43]">{fmtFull(totalPP)}</td>
              <td className="px-3 py-2.5 text-xs font-semibold text-[#1E1C43]">{fmtFull(totalB2B)}</td>
              <td className="px-3 py-2.5 text-xs font-semibold text-[#1E1C43]">{fmtFull(totalEvent)}</td>
              <td className="px-3 py-2.5 text-xs font-semibold text-accent">{fmtFull(totalAll)}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
