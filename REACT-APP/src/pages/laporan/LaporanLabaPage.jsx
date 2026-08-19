import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

const DATA = [
  { bulan: 'Jan 2026', revenue: 72000000,  honorarium: 18000000, laba: 54000000  },
  { bulan: 'Feb 2026', revenue: 73000000,  honorarium: 19500000, laba: 53500000  },
  { bulan: 'Mar 2026', revenue: 80000000,  honorarium: 21000000, laba: 59000000  },
  { bulan: 'Apr 2026', revenue: 90000000,  honorarium: 22000000, laba: 68000000  },
  { bulan: 'Mei 2026', revenue: 100000000, honorarium: 24500000, laba: 75500000  },
  { bulan: 'Jun 2026', revenue: 127000000, honorarium: 28000000, laba: 99000000  },
]

function fmtRp(n) { return 'Rp ' + n.toLocaleString('id-ID') }
function fmtM(n)  { return 'Rp ' + (n / 1000000).toFixed(1) + 'jt' }

const totalRev  = DATA.reduce((s, d) => s + d.revenue, 0)
const totalHon  = DATA.reduce((s, d) => s + d.honorarium, 0)
const totalLaba = DATA.reduce((s, d) => s + d.laba, 0)

const maxLaba = Math.max(...DATA.map(d => d.laba))

export default function LaporanLabaPage() {
  return (
    <div className="p-7 space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-text-primary">Laba &amp; Biaya</h1>
        <p className="text-[13px] text-text-muted mt-1">Selisih revenue klien vs honorarium PIC</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', val: totalRev,  icon: TrendingUp,   bg: 'bg-green-50',               iconCls: 'text-green-600'    },
          { label: 'Total Honorarium', val: totalHon,  icon: TrendingDown, bg: 'bg-red-50',                 iconCls: 'text-[#C0392B]'    },
          { label: 'Laba Bersih',   val: totalLaba, icon: DollarSign,   bg: 'bg-[rgba(30,28,67,0.08)]',  iconCls: 'text-text-primary' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon size={20} className={s.iconCls} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">{s.label}</p>
                <p className="text-[20px] font-bold text-text-primary">{fmtM(s.val)}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Line chart (CSS-based) */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-text-primary">Tren Laba Bersih per Bulan</h3>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-end gap-4 h-[120px]">
            {DATA.map(d => {
              const h = Math.round((d.laba / maxLaba) * 110)
              return (
                <div key={d.bulan} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-md hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ height: `${h}px`, background: '#1E1C43' }}
                    title={fmtRp(d.laba)}
                  />
                  <span className="text-[10px] text-text-muted whitespace-nowrap">{d.bulan.split(' ')[0]}</span>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-text-muted mt-3">Laba bersih meningkat konsisten — Juni 2026 tertinggi ({fmtRp(DATA[5].laba)})</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-bold text-text-primary">Rincian Per Bulan</h3>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Bulan', 'Revenue Masuk', 'Honorarium Keluar', 'Laba Bersih', 'Margin'].map(h => (
                <th key={h} className="bg-gray-50 px-3 py-2.5 text-[10px] font-semibold text-gray-500 text-left uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DATA.map((d, i) => {
              const margin = Math.round((d.laba / d.revenue) * 100)
              return (
                <tr key={d.bulan} className={`hover:bg-gray-50 transition-colors duration-150 ${i < DATA.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5">{d.bulan}</td>
                  <td className="text-xs font-semibold text-green-600 px-3 py-2.5">{fmtRp(d.revenue)}</td>
                  <td className="text-xs font-normal text-[#C0392B] px-3 py-2.5">{fmtRp(d.honorarium)}</td>
                  <td className="text-xs font-semibold text-gray-600 px-3 py-2.5">{fmtRp(d.laba)}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5">{margin}%</td>
                </tr>
              )
            })}
            <tr className="bg-gray-50 border-t-2 border-gray-200">
              <td className="px-3 py-2.5 text-xs font-bold text-[#1E1C43] uppercase">Total</td>
              <td className="px-3 py-2.5 text-xs font-semibold text-green-600">{fmtRp(totalRev)}</td>
              <td className="px-3 py-2.5 text-xs font-semibold text-[#C0392B]">{fmtRp(totalHon)}</td>
              <td className="px-3 py-2.5 text-xs font-semibold text-accent">{fmtRp(totalLaba)}</td>
              <td className="px-3 py-2.5 text-xs font-semibold text-gray-600">{Math.round((totalLaba/totalRev)*100)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
