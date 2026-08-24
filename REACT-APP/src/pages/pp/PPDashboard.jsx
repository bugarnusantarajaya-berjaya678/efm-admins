import { useNavigate } from 'react-router-dom'
import { Users, ShoppingBag, CreditCard, TrendingUp, ChevronRight, FileText, ClipboardList, Calendar } from 'lucide-react'
import { ORDERS_INIT } from '../../data/ppOrdersData'

/* ═══════════════════════════════════════
   Dummy Data
═══════════════════════════════════════ */
const KPI_DATA = {
  klienAktif:        11,
  orderBulanIni:     8,
  revenueBulanIni:   24500000,
  invoicePending:    3,
  hotlistLeads:      2,
  agreementPending:  2,
  assessmentPending: 1,
  sesiHariIni:       3,
}

const PERLU_TINDAKAN = [
  {
    borderColor: '#EF4444', bg: '#FEF2F2',
    judul: 'Invoice Overdue Belum Dibayar',
    detail: 'James Wilson — INV-PP-26-0010 — sudah melewati jatuh tempo',
    path: '/pp/invoice',
  },
  {
    borderColor: '#EF4444', bg: '#FEF2F2',
    judul: 'Follow Up Leads Tertunda',
    detail: 'Dewi Ayu — LP-0002 — follow up terjadwal hari ini',
    path: '/pp/leads',
  },
  {
    borderColor: '#F97316', bg: '#FFF7ED',
    judul: 'Screening Belum Selesai',
    detail: 'Rian Maulana — SCR-26-0003 — status masih Draft',
    path: '/pp/screening',
  },
  {
    borderColor: '#F97316', bg: '#FFF7ED',
    judul: 'Agreement Belum TTD',
    detail: 'Robert Taylor — AGR-PP-26-0003 — menunggu tanda tangan klien',
    path: '/pp/documents',
  },
]

const PIC_SUMMARY = [
  { nama: 'Elena Rodriguez', inisial: 'ER', totalKlien: 4, sudahBayar: 3, belumBayar: 1 },
  { nama: 'Budi Wijaya',     inisial: 'BW', totalKlien: 3, sudahBayar: 3, belumBayar: 0 },
  { nama: 'Ahmad Pratama',   inisial: 'AP', totalKlien: 2, sudahBayar: 1, belumBayar: 1 },
  { nama: 'Sarah Jenkins',   inisial: 'SJ', totalKlien: 5, sudahBayar: 4, belumBayar: 1 },
]

const PIC_COLORS = ['#1E1C43', '#2980B9', '#27AE60', '#E05945']

// Funnel aktif: New → Closing (tanpa Convert/Lost — itu outcome terpisah di footer)
const PIPELINE_ACTIVE = [
  { stage: 'New',       color: '#9CA3AF', jumlah: 1 },
  { stage: 'Approach',  color: '#3B82F6', jumlah: 1 },
  { stage: 'Screening', color: '#8B5CF6', jumlah: 1 },
  { stage: 'Invoicing', color: '#EAB308', jumlah: 1 },
  { stage: 'Closing',   color: '#F97316', jumlah: 1 },
]
const PIPELINE_OUTCOME = { converted: 1, lost: 0 }

const KLIEN_MENDEKATI_HABIS = [
  { nama: 'Robert Taylor', orderId: 'PP-26-0011', paket: '24 Sesi - Elite',   sesiTerpakai: 22, totalSesi: 24, sisaSesi: 2, pic: 'Elena Rodriguez', urgency: 'high'   },
  { nama: 'Emily Chen',    orderId: 'PP-26-0012', paket: '4 Sesi - Starter',  sesiTerpakai: 3,  totalSesi: 4,  sisaSesi: 1, pic: 'Marcus Chen',     urgency: 'high'   },
  { nama: 'Anita Kumar',   orderId: 'PP-26-0010', paket: '8 Sesi - Base',     sesiTerpakai: 6,  totalSesi: 8,  sisaSesi: 2, pic: 'Sarah Jenkins',   urgency: 'high'   },
  { nama: 'Budi Santoso',  orderId: 'PP-26-0008', paket: '12 Sesi - Pro',     sesiTerpakai: 9,  totalSesi: 12, sisaSesi: 3, pic: 'Marcus Chen',     urgency: 'medium' },
]

/* ═══════════════════════════════════════
   Computed from ORDERS_INIT
═══════════════════════════════════════ */
const recentOrders = ORDERS_INIT.slice(0, 5)

/* ═══════════════════════════════════════
   Badge config for Order Terbaru
═══════════════════════════════════════ */
const ORDER_CLS = {
  active:    'bg-green-50 text-green-600',
  completed: 'bg-blue-50 text-blue-600',
  cancelled: 'bg-red-50 text-red-500',
}
const INV_CLS = {
  paid:    'bg-green-50 text-green-600',
  pending: 'bg-yellow-50 text-yellow-600',
  overdue: 'bg-red-50 text-red-500',
}
const ORDER_LBL = { active: 'Aktif', completed: 'Selesai', cancelled: 'Batal' }
const INV_LBL   = { paid: 'Lunas', pending: 'Pending', overdue: 'Overdue' }

const formatRp = (n) => 'Rp ' + n.toLocaleString('id-ID')

function KpiCard({ label, value, sub, icon: Icon, accent, onClick }) {
  const border = { orange: 'border-l-[#E05945]', red: 'border-l-red-500', green: 'border-l-green-500', blue: 'border-l-blue-500' }[accent] || 'border-l-gray-200'
  const valCls = { orange: 'text-[#E05945]', red: 'text-red-600', green: 'text-green-600', blue: 'text-blue-600' }[accent] || 'text-[#1E1C43]'
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-100 border-l-4 ${border} p-4 ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-all`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${valCls}`}>{value}</p>
          {sub && <p className={`text-xs mt-0.5 ${accent ? valCls : 'text-gray-500'}`}>{sub}</p>}
        </div>
        {Icon && <Icon size={18} className="text-gray-300 mt-0.5" />}
      </div>
    </div>
  )
}

function StatusBadge({ val, clsMap, lblMap }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${clsMap[val] ?? 'bg-gray-100 text-gray-500'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {lblMap[val] ?? val}
    </span>
  )
}

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
export default function PPDashboard() {
  const navigate = useNavigate()
  const totalPipeline = PIPELINE_ACTIVE.reduce((s, d) => s + d.jumlah, 0)

  return (
    <div className="space-y-4">

      {/* ── Header ─────────────────────────────────── */}
      <div>
        <h1 className="text-[22px] font-bold text-[#1E1C43]">Dashboard Private Program</h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan performa program latihan personal EFM</p>
      </div>

      {/* ══════════════════════════════════
          SECTION 1: KPI Cards (2 rows × 4)
      ══════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Klien Aktif"      value={KPI_DATA.klienAktif}    sub="leads & klien aktif"   icon={Users}        onClick={() => navigate('/pp/leads')} />
        <KpiCard label="Order Bulan Ini"  value={KPI_DATA.orderBulanIni} sub="order masuk bulan ini" icon={ShoppingBag}  onClick={() => navigate('/pp/orders')} />
        <KpiCard label="Revenue Bulan Ini" value={formatRp(KPI_DATA.revenueBulanIni)} sub="total pembayaran masuk" icon={CreditCard} accent="green" onClick={() => navigate('/pp/invoice')} />
        <KpiCard label="Invoice Pending"  value={KPI_DATA.invoicePending} sub={KPI_DATA.invoicePending > 0 ? 'belum dibayar' : 'semua lunas'} icon={FileText} accent={KPI_DATA.invoicePending > 0 ? 'red' : undefined} onClick={() => navigate('/pp/invoice')} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Hotlist Leads"       value={KPI_DATA.hotlistLeads}      sub="Screening & Invoicing"  icon={TrendingUp}    accent={KPI_DATA.hotlistLeads > 0 ? 'orange' : undefined}      onClick={() => navigate('/pp/leads')} />
        <KpiCard label="Agreement Perlu TTD" value={KPI_DATA.agreementPending}  sub="menunggu tanda tangan"  icon={FileText}      accent={KPI_DATA.agreementPending > 0 ? 'orange' : undefined}  onClick={() => navigate('/pp/documents')} />
        <KpiCard label="Assessment Pending"  value={KPI_DATA.assessmentPending} sub="belum selesai"           icon={ClipboardList} accent={KPI_DATA.assessmentPending > 0 ? 'orange' : undefined} onClick={() => navigate('/pp/screening')} />
        <KpiCard label="Sesi Hari Ini"       value={KPI_DATA.sesiHariIni}       sub="jadwal aktif hari ini"  icon={Calendar}      accent="blue"                                                   onClick={() => navigate('/pp/orders')} />
      </div>

      {/* ══════════════════════════════════
          SECTION 2: Perlu Tindakan
      ══════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-bold text-[#1E1C43] flex items-center gap-2">
            ⚠️ Perlu Tindakan
          </h3>
          <span className="bg-[#E05945] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {PERLU_TINDAKAN.length}
          </span>
        </div>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {PERLU_TINDAKAN.map((alert, i) => (
            <div
              key={i}
              onClick={() => navigate(alert.path)}
              className="flex items-start gap-3 p-3 rounded-lg border-l-4 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ borderColor: alert.borderColor, backgroundColor: alert.bg }}
            >
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-800">{alert.judul}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{alert.detail}</p>
              </div>
              <ChevronRight size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════
          SECTION 3: Order Terbaru + Sesi Aktif
      ══════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

        {/* Order Terbaru */}
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-[13px] font-bold text-[#1E1C43]">Order Terbaru</h3>
            <button
              type="button"
              onClick={() => navigate('/pp/orders')}
              className="text-[12px] font-semibold text-[#E05945] hover:underline flex items-center gap-0.5"
            >
              Lihat Semua <ChevronRight size={13} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {[['ID','110px'],['Klien',null],['Paket',null],['PIC',null],['Status Order',null],['Invoice',null]].map(([h, mw]) => (
                    <th key={h} style={mw ? { minWidth: mw } : undefined}
                      className="bg-gray-50 px-4 py-2.5 text-[11px] font-semibold text-gray-400 text-left uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o, i) => (
                  <tr key={o.id} onClick={() => navigate('/pp/orders/' + o.id)} className={`hover:bg-gray-50 cursor-pointer transition-colors ${i < recentOrders.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <td className="px-4 py-3 text-xs font-semibold text-[#1E1C43] whitespace-nowrap">{o.id}</td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-[#1E1C43] whitespace-nowrap">{o.klien}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-500 whitespace-nowrap">{o.paket}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-500 whitespace-nowrap">{o.pic}</td>
                    <td className="px-4 py-3"><StatusBadge val={o.statusOrder} clsMap={ORDER_CLS} lblMap={ORDER_LBL} /></td>
                    <td className="px-4 py-3"><StatusBadge val={o.statusInv}   clsMap={INV_CLS}   lblMap={INV_LBL}   /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sesi Aktif Hari Ini */}
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-[13px] font-bold text-[#1E1C43]">Sesi Aktif Hari Ini</h3>
            <button onClick={() => navigate('/pp/orders')}
              className="text-[12px] font-semibold text-[#E05945] hover:underline">
              Lihat Semua →
            </button>
          </div>
          <div className="px-5 py-4 space-y-3">
            {[
              { klien: 'James Wilson', pelatih: 'Sarah Jenkins', jam: '07:00', lokasi: 'Tower A', sesi: '5/12' },
              { klien: 'Budi Santoso', pelatih: 'Marcus Chen',   jam: '09:00', lokasi: 'Tower C', sesi: '3/12' },
              { klien: 'Siti Rahayu',  pelatih: 'Sari Dewi',     jam: '16:00', lokasi: 'Tower A', sesi: '1/8'  },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#1E1C43] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {s.klien.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-[#1E1C43] truncate" title={s.klien}>{s.klien}</p>
                    <p className="text-[11px] text-gray-400 truncate">{s.pelatih} · {s.lokasi}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-bold text-[#1E1C43]">{s.jam}</p>
                  <p className="text-[11px] text-gray-400">Sesi {s.sesi}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          SECTION 4+5: PIC Summary + Pipeline
      ══════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* PIC Ringkasan Beban & Pembayaran */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-[#1E1C43]">PIC — Ringkasan Beban & Pembayaran</h3>
            <button
              type="button"
              onClick={() => navigate('/pp/orders')}
              className="text-xs text-[#E05945] font-medium hover:underline"
            >
              Lihat Orders →
            </button>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {['PIC', 'Total Klien Dihandle', 'Status Bayar'].map(h => (
                  <th key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PIC_SUMMARY.map((pic, i) => (
                <tr key={pic.nama} className={`hover:bg-gray-50 ${i < PIC_SUMMARY.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: PIC_COLORS[i % PIC_COLORS.length] }}
                      >
                        {pic.inisial}
                      </div>
                      <span className="text-xs font-semibold text-[#1E1C43]">{pic.nama}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs font-bold text-[#1E1C43]">{pic.totalKlien}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                        Sudah: {pic.sudahBayar}
                      </span>
                      {pic.belumBayar > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-700">
                          Belum: {pic.belumBayar}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Leads Pipeline */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-[#1E1C43]">Leads Pipeline</h3>
            <button
              type="button"
              onClick={() => navigate('/pp/leads')}
              className="text-xs text-[#E05945] font-medium hover:underline"
            >
              Lihat Semua →
            </button>
          </div>
          <div>
            {PIPELINE_ACTIVE.map(item => (
              <div
                key={item.stage}
                onClick={() => navigate('/pp/leads')}
                className="flex items-center gap-3 py-2 border-b border-gray-50 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-700 flex-1">{item.stage}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ backgroundColor: item.color, width: (item.jumlah / (totalPipeline || 1) * 100) + '%' }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-4 text-right">{item.jumlah}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-lg font-bold text-[#1E1C43]">{totalPipeline}</p>
              <p className="text-[10px] text-gray-400">Aktif</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{PIPELINE_OUTCOME.converted}</p>
              <p className="text-[10px] text-gray-400">Converted</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold ${PIPELINE_OUTCOME.lost > 0 ? 'text-red-500' : 'text-gray-400'}`}>{PIPELINE_OUTCOME.lost}</p>
              <p className="text-[10px] text-gray-400">Lost</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          SECTION 6: Klien Mendekati Habis Paket
      ══════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-bold text-[#1E1C43]">Klien Mendekati Habis Paket</h3>
          <button
            type="button"
            onClick={() => navigate('/pp/orders')}
            className="text-xs text-[#E05945] font-medium hover:underline"
          >
            Lihat Semua →
          </button>
        </div>
        <div className="space-y-2">
          {KLIEN_MENDEKATI_HABIS.map(k => (
            <div
              key={k.orderId}
              onClick={() => navigate('/pp/orders/' + k.orderId)}
              className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {/* Nama + Order ID */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#1E1C43] truncate">{k.nama}</p>
                <p className="text-[10px] text-gray-400">#{k.orderId} · {k.paket}</p>
              </div>

              {/* Progress bar */}
              <div className="w-32 flex-shrink-0">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>{k.sesiTerpakai}/{k.totalSesi} sesi</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${k.urgency === 'high' ? 'bg-[#E05945]' : 'bg-[#F97316]'}`}
                    style={{ width: `${(k.sesiTerpakai / k.totalSesi) * 100}%` }}
                  />
                </div>
              </div>

              {/* Sisa sesi badge */}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                k.urgency === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
              }`}>
                Sisa {k.sisaSesi} Sesi
              </span>

              {/* PIC */}
              <p className="text-[10px] text-gray-500 flex-shrink-0 hidden xl:block">{k.pic}</p>

              <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
