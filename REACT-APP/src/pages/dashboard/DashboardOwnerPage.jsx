import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Settings, CheckCircle, X } from 'lucide-react'

/* ── Approval dummy data ── */
const APPROVALS_INIT = [
  { id: 1, type: 'Invoice PP — Perlu Dikirim',       inv: 'INV/EFM/PP/2026/0090',  meta1: 'Robert Taylor • 24 Sesi Elite',      meta2: 'Dibuat oleh Admin • 2 jam lalu',     amount: 'Rp 2.800.000', urgent: true,  kind: 'invoice'  },
  { id: 2, type: 'Konfirmasi Pembayaran',             inv: 'INV/EFM/PP/2026/0088',  meta1: 'James Wilson • 8 Sesi Base',         meta2: 'Bukti transfer diupload Admin',      amount: 'Rp 1.100.000', urgent: true,  kind: 'payment'  },
  { id: 3, type: 'Invoice B2B — Perlu Dikirim',      inv: 'INV/EFM/B2B/2026/0012', meta1: 'Apartemen Green Lake • Juni 2026',   meta2: 'Dibuat oleh Admin • 1 hari lalu',   amount: 'Rp 9.000.000', urgent: false, kind: 'invoice'  },
]

/* ── Revenue stats ── */
const STATS = [
  { label: 'Total Revenue Bulan Ini', value: 'Rp 127jt', sub: '↑ 12% vs bulan lalu', up: true  },
  { label: 'Revenue PP',              value: 'Rp 45jt',  sub: '↑ 8%',                up: true  },
  { label: 'Revenue B2B',             value: 'Rp 48jt',  sub: '↑ 15%',               up: true  },
  { label: 'Revenue Event',           value: 'Rp 34jt',  sub: '↓ 3%',                up: false },
]

/* ── Revenue chart data ── */
const CHART = [
  { bulan: 'Jan', h: 55, highlight: false },
  { bulan: 'Feb', h: 70, highlight: false },
  { bulan: 'Mar', h: 60, highlight: false },
  { bulan: 'Apr', h: 85, highlight: false },
  { bulan: 'Mei', h: 75, highlight: false },
  { bulan: 'Jun', h: 95, highlight: true  },
]

/* ── Recent invoices ── */
const INVOICES = [
  { no: 'INV/PP/0090',  sub: 'Robert Taylor',    total: 'Rp 2,8jt', status: 'waiting' },
  { no: 'INV/PP/0089',  sub: 'Alex Mercer',       total: 'Rp 1,5jt', status: 'paid'    },
  { no: 'INV/B2B/0012', sub: 'Apt. Green Lake',   total: 'Rp 9jt',   status: 'pending' },
]

const INV_STATUS = {
  waiting: { label: 'Waiting', cls: 'bg-yellow-50 text-yellow-600' },
  paid:    { label: 'Paid',    cls: 'bg-green-50 text-green-600'   },
  pending: { label: 'Pending', cls: 'bg-yellow-50 text-yellow-600' },
}

function StatusBadge({ status }) {
  const cfg = INV_STATUS[status] || { label: status, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

/* ── Approval Card ── */
function ApprovalCard({ item, onApprove, onReject, done }) {
  return (
    <div className={`bg-white rounded-2xl border-[1.5px] ${item.urgent ? 'border-accent' : 'border-gray-200'} p-5 flex flex-col gap-4 transition-opacity ${done ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted mb-1">{item.type}</p>
          <p className="text-[14px] font-bold text-text-primary">{item.inv}</p>
          <p className="text-[12px] text-text-muted mt-1">{item.meta1}</p>
          <p className="text-[12px] text-text-muted">{item.meta2}</p>
        </div>
        <p className="text-[16px] font-bold text-accent shrink-0">{item.amount}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onApprove(item)}
          className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white text-[12px] font-semibold rounded-lg transition-colors"
        >
          {item.kind === 'payment' ? '✓ Konfirmasi Lunas' : '✓ Approve & Kirim'}
        </button>
        <button
          onClick={() => onReject(item)}
          className="px-3 py-2 bg-white border-[1.5px] border-red-400 text-red-500 text-[12px] font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-colors"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}

/* ── Main page ── */
export default function DashboardOwnerPage() {
  const [approvals, setApprovals] = useState(APPROVALS_INIT.map(a => ({ ...a, done: false })))

  const act = (id) => setApprovals(prev => prev.map(a => a.id === id ? { ...a, done: true } : a))
  const pending = approvals.filter(a => !a.done).length

  return (
    <div>

      {/* Welcome bar */}
      <div className="bg-text-primary rounded-2xl px-7 py-6 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-white mb-1">Selamat datang, Bagoes! 👑</h2>
          <p className="text-[13px] text-white/60">Owner Dashboard — Semua kendali ada di tangan kamu</p>
        </div>
        <Link
          to="/settings"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors"
        >
          <Settings size={14} />Settings
        </Link>
      </div>

      {/* Approval section */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <CheckCircle size={18} className="text-accent" />
          <h3 className="text-[16px] font-bold text-text-primary">Menunggu Approval Kamu</h3>
          {pending > 0 && (
            <span className="px-2 py-0.5 bg-accent text-white text-[11px] font-bold rounded-full">{pending}</span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {approvals.map(item => (
            <ApprovalCard
              key={item.id}
              item={item}
              done={item.done}
              onApprove={a => act(a.id)}
              onReject={a => act(a.id)}
            />
          ))}
          {approvals.every(a => a.done) && (
            <div className="col-span-1 sm:col-span-2 bg-white rounded-2xl border-[1.5px] border-gray-200 px-6 py-10 text-center text-[13px] text-green-600 font-semibold">
              ✓ Semua approval sudah selesai
            </div>
          )}
        </div>
      </div>

      {/* Revenue stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {STATS.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">{s.label}</p>
            <p className="text-[24px] font-bold text-text-primary">{s.value}</p>
            <p className={`text-[11px] mt-1 font-medium ${s.up ? 'text-green-600' : 'text-red-500'}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart + Invoice table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Bar chart */}
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-[14px] font-bold text-text-primary">Revenue 6 Bulan Terakhir</h3>
          </div>
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-end gap-3 h-[110px]">
              {CHART.map(d => (
                <div key={d.bulan} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-md hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ height: `${d.h}px`, background: d.highlight ? '#E05945' : '#1E1C43' }}
                  />
                  <span className={`text-[10px] font-medium ${d.highlight ? 'text-accent' : 'text-text-muted'}`}>{d.bulan}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-text-muted mt-4">Juni 2026 — tertinggi bulan ini 🎉</p>
          </div>
        </div>

        {/* Recent invoices */}
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-text-primary">Invoice Terbaru</h3>
            <Link to="/pp/invoice" className="text-[12px] text-accent font-semibold hover:underline">Lihat Semua →</Link>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Invoice', 'Total', 'Status'].map(h => (
                  <th key={h} className="bg-gray-50 px-5 py-2.5 text-[11px] font-semibold text-text-muted text-left uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className={`px-5 py-4 ${i < INVOICES.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <p className="text-[13px] font-bold text-text-primary">{inv.no}</p>
                    <p className="text-[11px] text-text-muted">{inv.sub}</p>
                  </td>
                  <td className={`px-5 py-4 text-[13px] text-text-muted ${i < INVOICES.length - 1 ? 'border-b border-gray-100' : ''}`}>{inv.total}</td>
                  <td className={`px-5 py-4 ${i < INVOICES.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <StatusBadge status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
