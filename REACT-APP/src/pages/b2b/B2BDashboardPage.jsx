import { useNavigate } from 'react-router-dom'
import { Building2, TrendingUp, ClipboardList, AlertCircle, ChevronRight } from 'lucide-react'

/* ═══════════════════════════════════════
   Dummy Data
═══════════════════════════════════════ */
const KPI = {
  klienAktif:     4,
  leadsAktif:     6,
  hotLeads:       3,
  surveiPending:  2,
  invoiceOverdue: 1,
}

const ALERTS = [
  {
    borderColor: '#EF4444', bg: '#FEF2F2',
    judul: 'Kontrak B2B Habis HARI INI',
    detail: 'CV. Teknologi Prima — kontrak berakhir 22 Jun 2026',
    url: '/b2b/orders/BO-003',
  },
  {
    borderColor: '#EF4444', bg: '#FEF2F2',
    judul: 'Invoice Overdue Belum Dibayar',
    detail: 'Apartemen Green Lake — Jun 2026 — sudah melewati jatuh tempo',
    url: '/b2b/invoice',
  },
  {
    borderColor: '#F97316', bg: '#FFF7ED',
    judul: 'Contract Belum Signed',
    detail: 'PT. Global Tech (#BO-007) — Contract masih Draft',
    url: '/b2b/orders/BO-007',
  },
  {
    borderColor: '#F97316', bg: '#FFF7ED',
    judul: 'Survei Belum Ditindaklanjuti',
    detail: 'CV. Digital Nusantara (SRV-003) — status Pending sejak 10 Jun 2026',
    url: '/b2b/survei/SRV-003',
  },
  {
    borderColor: '#EAB308', bg: '#FEFCE8',
    judul: 'Quotation Belum Disetujui',
    detail: 'Apartemen Sudirman Park (#BO-004) — Quotation masih Terkirim',
    url: '/b2b/orders/BO-004',
  },
]

const ORDERS_AKTIF = [
  { id: 'BO-001', nama: 'PT. Maju Bersama',   tipe: 'Corporate', program: 'Corporate Wellness', tahapan: 'Class in Progress', sisaHari: 365 },
  { id: 'BO-002', nama: 'Apt. Green Lake',     tipe: 'Apartment', program: 'Apt. Fitness',       tahapan: 'Class in Progress', sisaHari: 180 },
  { id: 'BO-003', nama: 'CV. Teknologi Prima', tipe: 'Corporate', program: 'Corporate Wellness', tahapan: 'MOU',               sisaHari: 270 },
  { id: 'BO-004', nama: 'Apt. Sudirman Park',  tipe: 'Apartment', program: 'Apt. Yoga',          tahapan: 'Quotation & LOI',   sisaHari: 300 },
  { id: 'BO-005', nama: 'PT. Sinar Abadi',     tipe: 'Corporate', program: 'Corporate Wellness', tahapan: 'Class in Progress', sisaHari: 245 },
]

const PIPELINE = [
  { stage: 'Closing',      count: 2, color: '#E05945' },
  { stage: 'Proposal',     count: 1, color: '#8B5CF6' },
  { stage: 'Presentation', count: 1, color: '#EAB308' },
  { stage: 'Approach',     count: 1, color: '#3B82F6' },
  { stage: 'New',          count: 2, color: '#9CA3AF' },
]

const JADWAL = [
  { tgl: '23', bln: 'Jun', nama: 'Kunjungan Supervisor',       klien: 'PT. Maju Bersama',   pic: 'Ahmad Pratama',   tipe: 'Kunjungan'   },
  { tgl: '24', bln: 'Jun', nama: 'Penagihan Invoice Jul 2026', klien: 'Apt. Green Lake',    pic: 'Admin EFM',       tipe: 'Penagihan'   },
  { tgl: '24', bln: 'Jun', nama: 'Perbaikan Treadmill',        klien: 'PT. Sinar Abadi',   pic: 'TechFix Service', tipe: 'Maintenance' },
  { tgl: '25', bln: 'Jun', nama: 'Evaluasi Program Bulanan',   klien: 'PT. Maju Bersama',   pic: 'Sarah Jenkins',   tipe: 'Meeting'     },
  { tgl: '26', bln: 'Jun', nama: 'Kunjungan Supervisor',       klien: 'Apt. Sudirman Park', pic: 'Ahmad Pratama',   tipe: 'Kunjungan'   },
  { tgl: '27', bln: 'Jun', nama: 'Penagihan Invoice Jul 2026', klien: 'PT. Sinar Abadi',   pic: 'Admin EFM',       tipe: 'Penagihan'   },
]

const JADWAL_WARNA = {
  Kunjungan:   { dot: '#3B82F6', bg: '#EFF6FF', text: '#1D4ED8' },
  Maintenance: { dot: '#F59E0B', bg: '#FFFBEB', text: '#92400E' },
  Penagihan:   { dot: '#EF4444', bg: '#FEF2F2', text: '#B91C1C' },
  Meeting:     { dot: '#8B5CF6', bg: '#F5F3FF', text: '#6D28D9' },
  'Sesi/Class':{ dot: '#10B981', bg: '#ECFDF5', text: '#065F46' },
  Lainnya:     { dot: '#6B7280', bg: '#F9FAFB', text: '#374151' },
}

const SURVEI = [
  { id: 'SRV-001', nama: 'PT. Karya Utama',      hasil: 'Lanjut'       },
  { id: 'SRV-002', nama: 'Apt. Bukit Mas',        hasil: 'Lanjut'       },
  { id: 'SRV-003', nama: 'CV. Digital Nusantara', hasil: 'Pending'      },
  { id: 'SRV-004', nama: 'Apt. Grand Orchid',     hasil: 'Tidak Lanjut' },
]

/* ═══════════════════════════════════════
   Helper Badges
═══════════════════════════════════════ */
function TipeBadge({ tipe }) {
  const cls = {
    Corporate: 'bg-[#1E1C43] text-white',
    Apartment: 'bg-blue-500 text-white',
    Residence: 'bg-purple-600 text-white',
  }[tipe] || 'bg-gray-200 text-gray-600'
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>{tipe}</span>
}

function TahapanBadge({ tahapan }) {
  const cls = {
    'Quotation & LOI':   'bg-amber-100 text-amber-700',
    'MOU':               'bg-blue-100 text-blue-700',
    'Contract':          'bg-purple-100 text-purple-700',
    'Class in Progress': 'bg-green-100 text-green-700',
  }[tahapan] || 'bg-gray-100 text-gray-600'
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>{tahapan}</span>
}

/* ═══════════════════════════════════════
   Main Page
═══════════════════════════════════════ */
export default function B2BDashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-4">

      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#1E1C43]">B2B Management</h1>
          <p className="text-sm text-gray-500 mt-1">Overview operasional & pipeline — Corporate & Apartment</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/b2b/leads')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#E05945] hover:bg-[#c94a38] transition-colors"
        >
          + New Lead
        </button>
      </div>

      {/* ══════════════════════════════════
          SECTION 1: KPI Cards
      ══════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Klien Aktif */}
        <div
          onClick={() => navigate('/b2b/orders')}
          className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Klien Aktif</p>
              <p className="text-2xl font-bold text-[#1E1C43] mt-1">{KPI.klienAktif}</p>
              <p className="text-xs text-gray-500 mt-0.5">kontrak berjalan</p>
            </div>
            <Building2 size={18} className="text-gray-300 mt-0.5" />
          </div>
        </div>

        {/* Leads Aktif */}
        <div
          onClick={() => navigate('/b2b/leads')}
          className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Leads Aktif</p>
              <p className="text-2xl font-bold text-[#1E1C43] mt-1">{KPI.leadsAktif}</p>
              <p className={`text-xs mt-0.5 ${KPI.hotLeads > 0 ? 'text-[#E05945] font-medium' : 'text-gray-500'}`}>
                {KPI.hotLeads} Hot (Proposal & Closing)
              </p>
            </div>
            <TrendingUp size={18} className="text-gray-300 mt-0.5" />
          </div>
        </div>

        {/* Survei Pending */}
        <div
          onClick={() => navigate('/b2b/survei')}
          className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Survei Pending</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold text-[#1E1C43]">{KPI.surveiPending}</p>
                {KPI.surveiPending > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">!</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">menunggu tindak lanjut</p>
            </div>
            <ClipboardList size={18} className="text-gray-300 mt-0.5" />
          </div>
        </div>

        {/* Invoice Overdue */}
        <div
          onClick={() => navigate('/b2b/invoice')}
          className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Invoice Overdue</p>
              <p className={`text-2xl font-bold mt-1 ${KPI.invoiceOverdue > 0 ? 'text-red-600' : 'text-[#1E1C43]'}`}>
                {KPI.invoiceOverdue}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">melewati jatuh tempo</p>
            </div>
            <AlertCircle size={18} className="text-gray-300 mt-0.5" />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          SECTION 2: Alert & Perlu Tindakan
      ══════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#1E1C43] flex items-center gap-2">
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
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1E1C43]">Orders Aktif</h3>
            <button
              type="button"
              onClick={() => navigate('/b2b/orders')}
              className="text-xs text-[#E05945] font-medium hover:underline"
            >
              Lihat Semua →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {['Nama Klien', 'Tipe', 'Program', 'Tahapan', 'Kontrak', 'Aksi'].map(h => (
                    <th key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 text-left whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ORDERS_AKTIF.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => navigate('/b2b/orders/' + order.id)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-2.5 text-xs font-medium text-gray-900">{order.nama}</td>
                    <td className="px-3 py-2.5"><TipeBadge tipe={order.tipe} /></td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{order.program}</td>
                    <td className="px-3 py-2.5"><TahapanBadge tahapan={order.tahapan} /></td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs font-medium ${
                        order.sisaHari <= 30 ? 'text-red-600' :
                        order.sisaHari <= 90 ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {order.sisaHari} hari lagi
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <ChevronRight size={14} className="text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kanan: Leads Pipeline */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1E1C43]">Leads Pipeline</h3>
            <button
              type="button"
              onClick={() => navigate('/b2b/leads')}
              className="text-xs text-[#E05945] font-medium hover:underline"
            >
              Lihat Semua →
            </button>
          </div>
          <div>
            {PIPELINE.map(item => (
              <div
                key={item.stage}
                onClick={() => navigate('/b2b/leads')}
                className="flex items-center gap-3 py-2 border-b border-gray-50 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-700 flex-1">{item.stage}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ backgroundColor: item.color, width: (item.count / 8 * 100) + '%' }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-4 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
            <div className="text-center">
              <p className="text-lg font-bold text-[#1E1C43]">8</p>
              <p className="text-[10px] text-gray-400">Total Leads</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">1</p>
              <p className="text-[10px] text-gray-400">Converted</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          SECTION 4: Jadwal Minggu Ini
      ══════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#1E1C43]">🗓 Jadwal Kegiatan Minggu Ini</h3>
          <button
            type="button"
            onClick={() => navigate('/b2b/kalender')}
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
          SECTION 5: Survei Terbaru
      ══════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#1E1C43]">Survei Terbaru</h3>
          <button
            type="button"
            onClick={() => navigate('/b2b/survei')}
            className="text-xs text-[#E05945] font-medium hover:underline"
          >
            Lihat Semua →
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {['ID', 'Nama', 'Hasil', 'Aksi'].map(h => (
                <th key={h} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SURVEI.map(srv => (
              <tr key={srv.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2.5 text-xs font-semibold text-[#1E1C43]">{srv.id}</td>
                <td className="px-3 py-2.5 text-xs font-medium text-gray-900">{srv.nama}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    srv.hasil === 'Lanjut'       ? 'bg-green-100 text-green-700' :
                    srv.hasil === 'Pending'      ? 'bg-yellow-100 text-yellow-700' :
                    srv.hasil === 'Tidak Lanjut' ? 'bg-red-100 text-red-600' :
                                                    'bg-gray-100 text-gray-500'
                  }`}>
                    {srv.hasil}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  {srv.hasil === 'Lanjut' && (
                    <button
                      type="button"
                      onClick={() => navigate('/b2b/orders/new', {
                        state: { fromSurvei: true, surveiId: srv.id, namaPerusahaan: srv.nama },
                      })}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[#E05945] text-white hover:bg-[#c94a38] transition-colors"
                    >
                      Buat Order →
                    </button>
                  )}
                  {srv.hasil === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => navigate('/b2b/survei/' + srv.id)}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-lg border border-yellow-400 text-yellow-700 hover:bg-yellow-50 transition-colors"
                    >
                      Tindak Lanjut →
                    </button>
                  )}
                  {srv.hasil === 'Tidak Lanjut' && (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
