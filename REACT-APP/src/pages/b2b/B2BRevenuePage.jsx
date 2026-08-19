import { useState, useMemo } from 'react'
import { REVENUE_MONTHLY, REVENUE_BY_CLIENT, formatRp, formatRpShort, PAY_CLS, PAY_LABEL } from '../../data/b2bData'

const PERIOD_OPTS = [
  { value: '6', label: '6 Bulan Terakhir' },
  { value: '12', label: '12 Bulan Terakhir' },
]

function PayBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${PAY_CLS[status] ?? ''}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {PAY_LABEL[status] ?? status}
    </span>
  )
}

function sisaColor(hari) {
  if (hari <= 14) return 'text-[#E74C3C] font-bold'
  if (hari <= 30) return 'text-[#F39C12] font-bold'
  return 'text-[#27AE60] font-bold'
}

/* ── Stacked bar chart ── */
const MAX_BAR_H = 120

function StackedBarChart({ data }) {
  const maxTotal = Math.max(...data.map(d => d.corporate + d.apartment))
  return (
    <div>
      {/* Bars */}
      <div className="flex items-end gap-3" style={{ height: MAX_BAR_H + 'px' }}>
        {data.map(d => {
          const corpH = Math.round((d.corporate / maxTotal) * MAX_BAR_H)
          const aptH  = Math.round((d.apartment  / maxTotal) * MAX_BAR_H)
          return (
            <div key={d.bulan} className="flex-1 flex flex-col justify-end h-full">
              <div style={{ height: corpH + aptH + 'px' }} className="w-full flex flex-col">
                <div
                  className="w-full rounded-t-[3px] hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ height: corpH + 'px', background: '#1E1C43' }}
                  title={`Corporate: ${formatRpShort(d.corporate)}`}
                />
                <div
                  className="w-full hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ height: aptH + 'px', background: '#E05945' }}
                  title={`Apartment: ${formatRpShort(d.apartment)}`}
                />
              </div>
            </div>
          )
        })}
      </div>
      {/* Month labels */}
      <div className="flex gap-3 mt-2">
        {data.map(d => (
          <div key={d.bulan} className="flex-1 text-center">
            <span className="text-[10px] text-text-muted">{d.bulan.split(' ')[0]}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-5 mt-4 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#1E1C43]" />
          <span className="text-[11px] text-text-muted">Corporate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[#E05945]" />
          <span className="text-[11px] text-text-muted">Apartment</span>
        </div>
      </div>
    </div>
  )
}

export default function B2BRevenuePage() {
  const [period, setPeriod] = useState('6')

  const chartData = useMemo(() => {
    const count = parseInt(period)
    return REVENUE_MONTHLY.slice(-count)
  }, [period])

  const latestMonth  = REVENUE_MONTHLY[REVENUE_MONTHLY.length - 1]
  const prevMonth    = REVENUE_MONTHLY[REVENUE_MONTHLY.length - 2]
  const latestTotal  = latestMonth.corporate + latestMonth.apartment
  const prevTotal    = prevMonth.corporate + prevMonth.apartment
  const growthPct    = Math.round(((latestTotal - prevTotal) / prevTotal) * 100)
  const totalClients = REVENUE_BY_CLIENT.length
  const avgPerClient = Math.round(latestTotal / totalClients)

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Revenue Dashboard B2B</h1>
          <p className="text-sm text-text-muted mt-1">Laporan pendapatan Corporate &amp; Apartment</p>
        </div>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none bg-white shadow-sm"
        >
          {PERIOD_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">Total Revenue Bulan Ini</p>
          <p className="text-[26px] font-bold text-text-primary">{formatRpShort(latestTotal)}</p>
          <p className="text-[11px] text-[#27AE60] mt-1">↑ {growthPct}% vs bulan lalu</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">Total Klien Aktif</p>
          <p className="text-[26px] font-bold text-text-primary">{totalClients}</p>
          <p className="text-[11px] text-text-muted mt-1">Corporate + Apartment</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1">Rata-rata per Klien</p>
          <p className="text-[26px] font-bold text-text-primary">{formatRpShort(avgPerClient)}</p>
          <p className="text-[11px] text-text-muted mt-1">Per bulan</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-[14px] font-bold text-text-primary">Revenue per Bulan</h3>
            <p className="text-[11px] text-text-muted mt-0.5">Corporate &amp; Apartment</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-text-muted">Total {chartData.length} bulan</p>
            <p className="text-[14px] font-bold text-text-primary">
              {formatRpShort(chartData.reduce((s, d) => s + d.corporate + d.apartment, 0))}
            </p>
          </div>
        </div>
        <div className="px-6 py-5">
          <StackedBarChart data={chartData} />
        </div>
      </div>

      {/* Revenue per client table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-[14px] font-bold text-text-primary">Revenue per Klien — {latestMonth.bulan}</h3>
            <p className="text-[11px] text-text-muted mt-0.5">Detail pembayaran bulan berjalan</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-text-muted">Total terkumpul</p>
            <p className="text-[14px] font-bold text-[#27AE60]">
              {formatRpShort(REVENUE_BY_CLIENT.filter(c => c.status === 'lunas').reduce((s, c) => s + c.total, 0))}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Nama Klien', 'Jenis', 'Nilai Kontrak', 'Status Bayar', 'Sisa Kontrak'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10.5px] font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REVENUE_BY_CLIENT.map((c, i) => {
                const sisaHari = [180, 90, 25, 120, 145, 12, 210][i] ?? 60
                return (
                  <tr key={c.nama} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-text-primary">{c.nama}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${c.jenis === 'Corporate' ? 'bg-[#EBF5FB] text-[#2980B9]' : 'bg-[#F0FFF4] text-[#27AE60]'}`}>
                        {c.jenis}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-primary">{formatRpShort(c.total)}/bln</td>
                    <td className="px-5 py-3"><PayBadge status={c.status} /></td>
                    <td className={`px-5 py-3 ${sisaColor(sisaHari)}`}>
                      {sisaHari} hari{sisaHari <= 14 ? ' 🔴' : sisaHari <= 30 ? ' ⚠️' : ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
