import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, TrendingUp, ClipboardList, AlertCircle, ChevronRight, CreditCard, Calendar, CheckCircle } from 'lucide-react'

/* ═══════════════════════════════════════
   Helpers
═══════════════════════════════════════ */
const formatRp = n => 'Rp ' + (n >= 1_000_000 ? (n / 1_000_000).toLocaleString('id-ID') + 'jt' : n.toLocaleString('id-ID'))

/* ═══════════════════════════════════════
   Dummy Data
═══════════════════════════════════════ */
const KPI = {
  klienAktif:          2,
  leadsAktif:          5,
  hotLeads:            2,
  konsultasiPending:   1,
  invoiceOverdue:      1,
  revenueBulanIni:     85000000,
  mendekatiHday:       1,
  eventSelesaiBulan:   1,
}

const PIPELINE_OUTCOME = { converted: 2, lost: 1 }

const ALERTS = [
  {
    borderColor: '#EF4444', bg: '#FEF2F2',
    judul: 'Invoice DP Overdue Belum Dibayar',
    detail: 'PT. Garuda Nusa Tbk — #EV-26-0002 — DP 50% sudah melewati jatuh tempo',
    url: '/event/orders/EV-26-0002',
  },
  {
    borderColor: '#EF4444', bg: '#FEF2F2',
    judul: 'Pelunasan Event Mendekat',
    detail: 'Yayasan Kanker Indonesia — #EV-26-0001 — Pelunasan jatuh tempo H-7 sebelum event',
    url: '/event/orders/EV-26-0001',
  },
  {
    borderColor: '#F97316', bg: '#FFF7ED',
    judul: 'Quotation Belum Disetujui',
    detail: 'Dinas Pemuda & Olahraga DKI (#EV-26-0003) — Quotation masih Draft',
    url: '/event/orders/EV-26-0003',
  },
  {
    borderColor: '#F97316', bg: '#FFF7ED',
    judul: 'Konsultasi Belum Ditindaklanjuti',
    detail: 'Brand Tropicana Slim (KNS-26-0003) — status Pending sejak 10 Jun 2026',
    url: '/event/leads/LE-0003',
  },
  {
    borderColor: '#EAB308', bg: '#FEFCE8',
    judul: 'Contract Belum Signed',
    detail: 'PT. Garuda Nusa Tbk (#EV-26-0002) — Contract masih On Review',
    url: '/event/orders/EV-26-0002',
  },
]

const ORDERS_AKTIF = [
  { id: 'EV-26-0001', nama: 'Yayasan Kanker Indonesia',   tipe: 'Foundation', namaEvent: 'Health Run for Hope 2026',   tahapan: 'Event Running',  sisaHari: 1,  pic: 'Bagoes', statusInv: 'overdue' },
  { id: 'EV-26-0002', nama: 'PT. Garuda Nusa Tbk',         tipe: 'Corporate',  namaEvent: 'Corporate Fun Run 2026',     tahapan: 'Contract',        sisaHari: 17, pic: 'Emma',   statusInv: 'pending' },
  { id: 'EV-26-0003', nama: 'Dinas Pemuda & Olahraga DKI', tipe: 'Government', namaEvent: 'Hari Olahraga Nasional DKI', tahapan: 'Quotation & LOI', sisaHari: 51, pic: 'Bagoes', statusInv: 'draft'   },
]

const PIPELINE = [
  { stage: 'Closing',      count: 2, color: '#E05945' },
  { stage: 'Proposal',     count: 1, color: '#8B5CF6' },
  { stage: 'Presentation', count: 1, color: '#EAB308' },
  { stage: 'Approach',     count: 1, color: '#3B82F6' },
  { stage: 'New',          count: 1, color: '#9CA3AF' },
]

const MENDEKATI_HDAY = [
  {
    orderId:   'EV-26-0001',
    namaEvent: 'Health Run for Hope 2026',
    klien:     'Yayasan Kanker Indonesia',
    tipe:      'Foundation',
    sisaHari:  1,
    pic:       'Bagoes',
  },
]

const PIC_SUMMARY = [
  { nama: 'Bagoes S.', ordersAktif: 2, leadsAktif: 3, hotLeads: 1, eventBulanIni: 1 },
  { nama: 'Emma R.',   ordersAktif: 1, leadsAktif: 2, hotLeads: 1, eventBulanIni: 0 },
]

const JADWAL = [
  { tgl: '28', bln: 'Jun', nama: 'Health Run for Hope 2026 — H-Day',       klien: 'Yayasan Kanker Indonesia',   pic: 'Bagoes',    tipe: 'Sesi/Class' },
  { tgl: '28', bln: 'Jun', nama: 'Pelunasan #EV-26-0001 Jatuh Tempo',      klien: 'Yayasan Kanker Indonesia',   pic: 'Admin EFM', tipe: 'Penagihan'  },
  { tgl: '29', bln: 'Jun', nama: 'Briefing Tim Lapangan #EV-26-0002',      klien: 'PT. Garuda Nusa Tbk',         pic: 'Emma',      tipe: 'Meeting'    },
  { tgl: '30', bln: 'Jun', nama: 'Penagihan DP #EV-26-0002',               klien: 'PT. Garuda Nusa Tbk',         pic: 'Admin EFM', tipe: 'Penagihan'  },
  { tgl: '01', bln: 'Jul', nama: 'Submit Dokumen Tender #EV-26-0003',      klien: 'Dinas Pemuda & Olahraga DKI', pic: 'Bagoes',    tipe: 'Meeting'    },
  { tgl: '15', bln: 'Jul', nama: 'Corporate Fun Run 2026 — H-Day',         klien: 'PT. Garuda Nusa Tbk',         pic: 'Emma',      tipe: 'Sesi/Class' },
]

const JADWAL_WARNA = {
  Kunjungan:   { dot: '#3B82F6', bg: '#EFF6FF', text: '#1D4ED8' },
  Maintenance: { dot: '#F59E0B', bg: '#FFFBEB', text: '#92400E' },
  Penagihan:   { dot: '#EF4444', bg: '#FEF2F2', text: '#B91C1C' },
  Meeting:     { dot: '#8B5CF6', bg: '#F5F3FF', text: '#6D28D9' },
  'Sesi/Class':{ dot: '#10B981', bg: '#ECFDF5', text: '#065F46' },
  Lainnya:     { dot: '#6B7280', bg: '#F9FAFB', text: '#374151' },
}

const KONSULTASI = [
  { id: 'KNS-26-0001', nama: 'Yayasan Kanker Indonesia',   hasil: 'Lanjut'       },
  { id: 'KNS-26-0002', nama: 'PT. Garuda Nusa Tbk',         hasil: 'Lanjut'       },
  { id: 'KNS-26-0003', nama: 'Brand Tropicana Slim',        hasil: 'Pending'      },
  { id: 'KNS-26-0004', nama: 'Komunitas Pelari Jakarta',    hasil: 'Tidak Lanjut' },
  { id: 'KNS-26-0005', nama: 'Dinas Pemuda & Olahraga DKI', hasil: 'Lanjut'       },
]

/* ═══════════════════════════════════════
   Invoice Status Config
═══════════════════════════════════════ */
const INV_CLS = {
  lunas:   'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-600',
  draft:   'bg-gray-100 text-gray-500',
}
const INV_LBL = { lunas: 'Lunas', pending: 'Pending', overdue: 'Overdue', draft: 'Draft' }

/* ═══════════════════════════════════════
   Components
═══════════════════════════════════════ */
function KpiCard({ label, value, sub, icon: Icon, accent, onClick }) {
  const dotCls = { orange: 'bg-[#E05945]', red: 'bg-red-500', green: 'bg-green-500', blue: 'bg-blue-500' }[accent]
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 relative ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow`}
    >
      {Icon && <Icon size={16} className="absolute top-4 right-4 text-gray-300" />}
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 pr-6">{label}</p>
      <div className="flex items-center gap-1.5">
        <p className="text-xl font-bold text-[#1E1C43]">{value}</p>
        {dotCls && <span className={`w-2 h-2 rounded-full ${dotCls} shrink-0 mb-0.5`} />}
      </div>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

function TipeBadge({ tipe }) {
  const cls = {
    Corporate:  'bg-[#1E1C43] text-white',
    Brand:      'bg-purple-600 text-white',
    Community:  'bg-blue-500 text-white',
    Government: 'bg-green-600 text-white',
    Foundation: 'bg-orange-500 text-white',
    Private:    'bg-pink-500 text-white',
    Individual: 'bg-gray-400 text-white',
  }[tipe] || 'bg-gray-200 text-gray-600'
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>{tipe}</span>
}

function TahapanBadge({ tahapan }) {
  const cls = {
    'Quotation & LOI': 'bg-amber-100 text-amber-700',
    'MOU':             'bg-blue-100 text-blue-700',
    'Contract':        'bg-purple-100 text-purple-700',
    'Event Running':   'bg-green-100 text-green-700',
    'Event Selesai':   'bg-gray-100 text-gray-500',
  }[tahapan] || 'bg-gray-100 text-gray-600'
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>{tahapan}</span>
}

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
const HASIL_FILTER_OPTS = ['Semua', 'Pending', 'Lanjut', 'Tidak Lanjut']

export default function EventDashboardPage() {
  const navigate = useNavigate()
  const totalPipeline = PIPELINE.reduce((s, d) => s + d.count, 0)
  const [filterHasil, setFilterHasil] = useState('Semua')
  const konsultasiFiltered = filterHasil === 'Semua' ? KONSULTASI : KONSULTASI.filter(k => k.hasil === filterHasil)

  return (
    <div className="space-y-4">

      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#1E1C43]">B2B Event Management</h1>
          <p className="text-sm text-gray-500 mt-1">Overview pipeline & operasional event — Corporate, Foundation, Government & Brand</p>
        </div>
      </div>

      {/* ══════════════════════════════════
          SECTION 1: KPI Cards — Row 1
      ══════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Event Aktif"
          value={KPI.klienAktif}
          sub="event berjalan"
          icon={Building2}
          onClick={() => navigate('/event/orders')}
        />
        <KpiCard
          label="Leads Aktif"
          value={KPI.leadsAktif}
          sub={`${KPI.hotLeads} Hot (Proposal & Closing)`}
          icon={TrendingUp}
          accent={KPI.hotLeads > 0 ? 'orange' : undefined}
          onClick={() => navigate('/event/leads')}
        />
        <KpiCard
          label="Konsultasi Pending"
          value={KPI.konsultasiPending}
          sub="menunggu tindak lanjut"
          icon={ClipboardList}
          accent={KPI.konsultasiPending > 0 ? 'orange' : undefined}
          onClick={() => navigate('/event/leads')}
        />
        <KpiCard
          label="Invoice Overdue"
          value={KPI.invoiceOverdue}
          sub="melewati jatuh tempo"
          icon={AlertCircle}
          accent={KPI.invoiceOverdue > 0 ? 'red' : undefined}
          onClick={() => navigate('/event/invoice')}
        />
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Revenue Bulan Ini"
          value={formatRp(KPI.revenueBulanIni)}
          sub="total pembayaran masuk"
          icon={CreditCard}
          accent="green"
          onClick={() => navigate('/event/invoice')}
        />
        <KpiCard
          label="Hot Leads"
          value={KPI.hotLeads}
          sub="Proposal & Closing"
          icon={TrendingUp}
          accent={KPI.hotLeads > 0 ? 'orange' : undefined}
          onClick={() => navigate('/event/leads')}
        />
        <KpiCard
          label="Mendekati H-Day"
          value={KPI.mendekatiHday}
          sub="event ≤ H-14"
          icon={Calendar}
          accent={KPI.mendekatiHday > 0 ? 'red' : undefined}
          onClick={() => navigate('/event/kalender')}
        />
        <KpiCard
          label="Event Selesai Bulan Ini"
          value={KPI.eventSelesaiBulan}
          sub="event berhasil dijalankan"
          icon={CheckCircle}
          accent="green"
          onClick={() => navigate('/event/orders')}
        />
      </div>

      {/* ══════════════════════════════════
          SECTION 2: Alert & Perlu Tindakan
      ══════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-bold text-[#1E1C43] flex items-center gap-2">
            ⚠️ Perlu Tindakan
          </h3>
          <span className="bg-[#E05945] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {ALERTS.length}
          </span>
        </div>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {ALERTS.map((alert, i) => (
            <div
              key={i}
              onClick={() => navigate(alert.url)}
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
          SECTION 3: Orders Aktif + Pipeline
      ══════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Kiri: Orders Aktif */}
        <div className="lg:col-span-2 bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-[13px] font-bold text-[#1E1C43]">Orders Aktif</h3>
            <button
              type="button"
              onClick={() => navigate('/event/orders')}
              className="text-[12px] font-semibold text-[#E05945] hover:underline flex items-center gap-0.5"
            >
              Lihat Semua <ChevronRight size={13} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '680px' }}>
              <thead>
                <tr>
                  {[['Order ID', '120px'], ['Nama Klien', null], ['Nama Event', null], ['Tahapan', null], ['PIC', null], ['Tgl Event', null], ['Invoice', null]].map(([h, mw]) => (
                    <th
                      key={h}
                      style={mw ? { minWidth: mw } : undefined}
                      className="bg-gray-50 px-4 py-2.5 text-[11px] font-semibold text-gray-400 text-left uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ORDERS_AKTIF.map((order, i) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate('/event/orders/' + order.id)}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${i < ORDERS_AKTIF.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-[#1E1C43] whitespace-nowrap">{order.id}</td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-[#1E1C43] whitespace-nowrap">{order.nama}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{order.namaEvent}</td>
                    <td className="px-4 py-3"><TahapanBadge tahapan={order.tahapan} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{order.pic}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${
                        order.sisaHari <= 3  ? 'text-red-600' :
                        order.sisaHari <= 14 ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {order.sisaHari <= 0 ? 'Hari ini' : `H-${order.sisaHari}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${INV_CLS[order.statusInv] ?? 'bg-gray-100 text-gray-500'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {INV_LBL[order.statusInv] ?? order.statusInv}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kanan: Event Mendekati H-Day */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-[#1E1C43]">🏁 Mendekati H-Day</h3>
            <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">≤ H-14</span>
          </div>
          {MENDEKATI_HDAY.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">Tidak ada event mendekati H-Day</p>
          ) : (
            <div className="space-y-3">
              {MENDEKATI_HDAY.map(ev => {
                const urg = ev.sisaHari <= 1 ? 'red' : ev.sisaHari <= 3 ? 'orange' : 'yellow'
                const cfg = {
                  red:    { bg: '#FEF2F2', border: '#EF4444', text: 'text-red-600' },
                  orange: { bg: '#FFF7ED', border: '#F97316', text: 'text-orange-500' },
                  yellow: { bg: '#FEFCE8', border: '#EAB308', text: 'text-yellow-600' },
                }[urg]
                return (
                  <div
                    key={ev.orderId}
                    onClick={() => navigate('/event/orders/' + ev.orderId)}
                    className="p-3 rounded-xl border-l-4 cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ borderColor: cfg.border, backgroundColor: cfg.bg }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1E1C43] truncate">{ev.namaEvent}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{ev.klien}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <TipeBadge tipe={ev.tipe} />
                          <span className="text-[10px] text-gray-400">PIC: {ev.pic}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-lg font-black ${cfg.text}`}>{ev.sisaHari <= 0 ? 'H-Day!' : `H-${ev.sisaHari}`}</p>
                        <p className="text-[10px] text-gray-400">{ev.orderId}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate('/event/kalender')}
            className="mt-4 w-full text-xs text-center text-[#E05945] font-medium hover:underline"
          >
            Lihat Kalender →
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════
          SECTION 4: PIC Summary + Pipeline
      ══════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Kiri: PIC / Tim Performance */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-[#1E1C43]">Performa Tim Event</h3>
            <button
              type="button"
              onClick={() => navigate('/event/orders')}
              className="text-xs text-[#E05945] font-medium hover:underline"
            >
              Detail Order →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '420px' }}>
              <thead>
                <tr className="bg-gray-50">
                  {['PIC', 'Orders Aktif', 'Leads Aktif', 'Hot Leads', 'Event Bulan Ini'].map(h => (
                    <th key={h} className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-left whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PIC_SUMMARY.map((pic, i) => (
                  <tr key={pic.nama} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i === PIC_SUMMARY.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1E1C43] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {pic.nama.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs font-semibold text-gray-800">{pic.nama}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm font-bold text-[#1E1C43]">{pic.ordersAktif}</td>
                    <td className="px-3 py-3 text-sm font-bold text-[#1E1C43]">{pic.leadsAktif}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pic.hotLeads > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                        {pic.hotLeads}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pic.eventBulanIni > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {pic.eventBulanIni}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kanan: Leads Pipeline */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-[#1E1C43]">Leads Pipeline</h3>
            <button
              type="button"
              onClick={() => navigate('/event/leads')}
              className="text-xs text-[#E05945] font-medium hover:underline"
            >
              Lihat Semua →
            </button>
          </div>
          <div>
            {PIPELINE.map(item => (
              <div
                key={item.stage}
                onClick={() => navigate('/event/leads')}
                className="flex items-center gap-3 py-2 border-b border-gray-50 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-700 flex-1">{item.stage}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ backgroundColor: item.color, width: (item.count / (totalPipeline || 1) * 100) + '%' }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-4 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2">
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
          SECTION 5: Jadwal Minggu Ini
      ══════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-bold text-[#1E1C43]">🗓 Jadwal Kegiatan Minggu Ini</h3>
          <button
            type="button"
            onClick={() => navigate('/event/kalender')}
            className="text-xs text-[#E05945] font-medium hover:underline"
          >
            Lihat Kalender →
          </button>
        </div>
        <div>
          {JADWAL.map((item, i) => {
            const w = JADWAL_WARNA[item.tipe] || JADWAL_WARNA['Lainnya']
            return (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className="text-center w-10 flex-shrink-0">
                  <p className="text-[10px] text-gray-400">{item.bln}</p>
                  <p className="text-sm font-bold text-[#1E1C43]">{item.tgl}</p>
                </div>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: w.dot }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{item.nama}</p>
                  <p className="text-[10px] text-gray-400">{item.klien} · {item.pic}</p>
                </div>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: w.bg, color: w.text }}
                >
                  {item.tipe}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ══════════════════════════════════
          SECTION 6: Konsultasi — Semua Klien
      ══════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-bold text-[#1E1C43]">Konsultasi — Semua Klien</h3>
          <button
            type="button"
            onClick={() => navigate('/event/leads')}
            className="text-xs text-[#E05945] font-medium hover:underline"
          >
            Lihat Semua Leads →
          </button>
        </div>
        {/* Filter pills */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {HASIL_FILTER_OPTS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setFilterHasil(opt)}
              className={`text-[10px] font-semibold px-3 py-1 rounded-full border transition-colors ${
                filterHasil === opt
                  ? 'bg-[#1E1C43] text-white border-[#1E1C43]'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              {opt}
              {opt !== 'Semua' && (
                <span className="ml-1 opacity-70">
                  ({KONSULTASI.filter(k => k.hasil === opt).length})
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {['ID', 'Nama Klien', 'Hasil', 'Aksi'].map(h => (
                  <th key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {konsultasiFiltered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-xs text-gray-400">
                    Tidak ada konsultasi dengan status ini.
                  </td>
                </tr>
              ) : konsultasiFiltered.map(kns => (
                <tr key={kns.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2.5 text-xs font-semibold text-[#1E1C43] whitespace-nowrap">{kns.id}</td>
                  <td className="px-3 py-2.5 text-xs font-medium text-gray-900">{kns.nama}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      kns.hasil === 'Lanjut'       ? 'bg-green-100 text-green-700' :
                      kns.hasil === 'Pending'      ? 'bg-yellow-100 text-yellow-700' :
                      kns.hasil === 'Tidak Lanjut' ? 'bg-red-100 text-red-600' :
                                                      'bg-gray-100 text-gray-500'
                    }`}>
                      {kns.hasil}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {kns.hasil === 'Lanjut' && (
                      <button
                        type="button"
                        onClick={() => navigate('/event/orders/new', {
                          state: { fromKonsultasi: true, konsultasiId: kns.id, namaKlien: kns.nama },
                        })}
                        className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[#E05945] text-white hover:bg-[#c94a38] transition-colors"
                      >
                        Buat Order →
                      </button>
                    )}
                    {kns.hasil === 'Pending' && (
                      <button
                        type="button"
                        onClick={() => navigate('/event/konsultasi/' + kns.id)}
                        className="text-[10px] font-medium px-2.5 py-1 rounded-lg border border-yellow-400 text-yellow-700 hover:bg-yellow-50 transition-colors"
                      >
                        Tindak Lanjut →
                      </button>
                    )}
                    {kns.hasil === 'Tidak Lanjut' && (
                      <span className="text-xs text-gray-300">—</span>
                    )}
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
