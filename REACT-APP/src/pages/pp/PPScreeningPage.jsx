import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, ChevronRight, RotateCcw, ArrowLeft, ClipboardList } from 'lucide-react';
import { getAllAssessments } from '../../data/ppAssessmentsStore';

const statusColor = {
  'Post-Test Selesai': 'bg-green-50 text-green-700 border-green-200',
  'Pre-Test Selesai':  'bg-blue-50 text-blue-700 border-blue-200',
  'Draft':             'bg-yellow-50 text-yellow-700 border-yellow-200',
};

const AVATAR_COLORS = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777','#0284C7'];
function getInitials(name) {
  return (name || '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function getAvatarColor(name) {
  let hash = 0;
  for (const c of (name || '')) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFFFF;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function StatMini({ label, value, sub, accent }) {
  const bCls = { orange:'border-accent', green:'border-green-400', red:'border-red-400', yellow:'border-yellow-400', blue:'border-blue-400' }[accent] || 'border-gray-200';
  const vCls = { orange:'text-[#E05945]', green:'text-green-600', red:'text-red-600', yellow:'text-yellow-600', blue:'text-blue-600' }[accent] || 'text-[#1E1C43]';
  return (
    <div className={`bg-white rounded-xl border-[1.5px] ${bCls} px-4 py-3`}>
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${vCls}`}>{value}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function PPScreeningPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRenewal, setFilterRenewal] = useState('');

  // Build a flat list from store with id injected
  const allAssessments = Object.entries(getAllAssessments()).map(([id, a]) => ({ id, ...a }));

  const filtered = allAssessments.filter(a => {
    const matchSearch = (a.namaKlien || '').toLowerCase().includes(search.toLowerCase())
      || a.id.toLowerCase().includes(search.toLowerCase())
      || (a.orderId || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? a.statusAssessment === filterStatus : true;
    const matchRenewal = filterRenewal === 'renewal'
      ? !!a.prevAssessmentId
      : filterRenewal === 'first'
      ? !a.prevAssessmentId
      : true;
    return matchSearch && matchStatus && matchRenewal;
  });

  const totalPostTest = allAssessments.filter(a => a.statusAssessment === 'Post-Test Selesai').length;
  const totalPreTest  = allAssessments.filter(a => a.statusAssessment === 'Pre-Test Selesai').length;
  const totalRenewal  = allAssessments.filter(a => !!a.prevAssessmentId).length;

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
              <ClipboardList size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">Fitness Assessment PP</h1>
              <p className="text-sm text-text-muted mt-0.5">Data pre-test & post-test seluruh klien Private Program</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('/pp/screening/new')}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors w-full sm:w-auto"
            >
              <Plus size={13} /> Buat Assessment
            </button>
            <button
              onClick={() => navigate('/pp/orders')}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors w-full sm:w-auto"
            >
              <ArrowLeft size={12} /> Kembali ke PP Orders
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatMini label="TOTAL ASSESSMENT" value={allAssessments.length} sub="Semua data" />
        <StatMini label="POST-TEST SELESAI" value={totalPostTest} sub="Program selesai" accent="green" />
        <StatMini label="PRE-TEST SELESAI" value={totalPreTest} sub="Sedang berjalan" accent="blue" />
        <StatMini label="RENEWAL" value={totalRenewal} sub="Order lanjutan" accent="orange" />
      </div>

      {/* Filter Bar */}
      <div className="bg-bg-surface border border-border rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors"
        >
          <option value="">Semua Status</option>
          <option value="Post-Test Selesai">Post-Test Selesai</option>
          <option value="Pre-Test Selesai">Pre-Test Selesai</option>
          <option value="Draft">Draft</option>
        </select>
        <select
          value={filterRenewal}
          onChange={e => setFilterRenewal(e.target.value)}
          className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors"
        >
          <option value="">Semua Tipe</option>
          <option value="first">Order Pertama</option>
          <option value="renewal">Renewal</option>
        </select>
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-bg-page border-[1.5px] border-border rounded-lg px-3 py-[7px] focus-within:border-primary focus-within:bg-white transition-colors">
          <Search size={14} className="text-text-muted shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama klien, ID assessment, atau order..."
            className="border-none bg-transparent text-xs outline-none w-full text-text-primary placeholder:text-text-muted"
          />
        </div>
        <button
          onClick={() => { setSearch(''); setFilterStatus(''); setFilterRenewal(''); }}
          className="px-3.5 py-[7px] bg-primary hover:bg-primary-2 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full" style={{ minWidth: '1100px' }}>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">No. Assessment</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Klien</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Order</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tanggal Pre-Test</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">FC / Screener</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tipe</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr
                key={a.id}
                onClick={() => navigate('/pp/screening/' + a.id)}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              >
                <td className="px-3 py-2.5 text-xs font-semibold text-[#1E1C43] whitespace-nowrap">{a.id}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ background: getAvatarColor(a.namaKlien) }}
                    >
                      {getInitials(a.namaKlien)}
                    </div>
                    <span className="text-xs font-medium text-gray-900 whitespace-nowrap">{a.namaKlien || '—'}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  {a.orderId ? (
                    <button
                      onClick={e => { e.stopPropagation(); navigate('/pp/orders/' + a.orderId); }}
                      className="text-xs font-semibold text-[#1E1C43] hover:underline flex items-center gap-1 whitespace-nowrap"
                    >
                      #{a.orderId} <ChevronRight size={11} />
                    </button>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-xs font-normal text-gray-600 whitespace-nowrap">
                  {a.tanggalPreTest
                    ? new Date(a.tanggalPreTest).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </td>
                <td className="px-3 py-2.5 text-xs font-normal text-gray-600 whitespace-nowrap">{a.namaFC || '—'}</td>
                <td className="px-3 py-2.5">
                  {a.prevAssessmentId ? (
                    <span className="px-2 py-0.5 text-[10px] rounded-full font-medium bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
                      Renewal
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] rounded-full font-medium bg-gray-50 text-gray-500 border border-gray-200 whitespace-nowrap">
                      Order Pertama
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium border whitespace-nowrap ${statusColor[a.statusAssessment] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {a.statusAssessment || '—'}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <button
                    onClick={e => { e.stopPropagation(); navigate('/pp/screening/' + a.id); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#2980B9] border border-[#2980B9] bg-[#EBF5FB] hover:bg-[#2980B9] hover:text-white transition-colors"
                    title="Lihat Assessment"
                  >
                    <Eye size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                  Belum ada data assessment
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Menampilkan {filtered.length} dari {allAssessments.length} assessment</p>
        </div>
      </div>

    </div>
  );
}
