import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronRight, RotateCcw, ArrowLeft, ClipboardList } from 'lucide-react';
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
  const bCls = { orange: 'border-accent', green: 'border-success', red: 'border-danger', yellow: 'border-warning', blue: 'border-blue-400' }[accent] || 'border-border';
  const vCls = { orange: 'text-accent', green: 'text-success', red: 'text-danger', yellow: 'text-warning', blue: 'text-blue-600' }[accent] || 'text-text-primary';
  return (
    <div className={`bg-bg-surface rounded-xl border-[1.5px] ${bCls} px-4 py-3`}>
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${vCls}`}>{value}</div>
      {sub && <div className="text-[11px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

function PBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center border transition-colors
      ${active ? 'bg-primary text-white border-primary' : 'bg-white text-text-muted border-border hover:border-primary hover:text-primary'}`}>
      {children}
    </button>
  );
}

const ROWS = 10;

export default function PPScreeningPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRenewal, setFilterRenewal] = useState('');
  const [page, setPage] = useState(1);

  const allAssessments = useMemo(
    () => Object.entries(getAllAssessments()).map(([id, a]) => ({ id, ...a })),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allAssessments.filter(a => {
      const matchSearch = !q
        || (a.namaKlien || '').toLowerCase().includes(q)
        || a.id.toLowerCase().includes(q)
        || (a.orderId || '').toLowerCase().includes(q);
      const matchStatus = filterStatus ? a.statusAssessment === filterStatus : true;
      const matchRenewal = filterRenewal === 'renewal'
        ? !!a.prevAssessmentId
        : filterRenewal === 'first'
        ? !a.prevAssessmentId
        : true;
      return matchSearch && matchStatus && matchRenewal;
    });
  }, [allAssessments, search, filterStatus, filterRenewal]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS));
  const slice = filtered.slice((page - 1) * ROWS, page * ROWS);

  const totalPostTest = allAssessments.filter(a => a.statusAssessment === 'Post-Test Selesai').length;
  const totalPreTest  = allAssessments.filter(a => a.statusAssessment === 'Pre-Test Selesai').length;
  const totalRenewal  = allAssessments.filter(a => !!a.prevAssessmentId).length;

  const start = (page - 1) * ROWS + 1;
  const end   = Math.min(page * ROWS, filtered.length);

  function reset() { setSearch(''); setFilterStatus(''); setFilterRenewal(''); setPage(1); }

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
              <p className="text-sm text-text-muted mt-0.5">Data pre-test &amp; post-test seluruh klien Private Program</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('/pp/screening/new')}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors"
            >
              <Plus size={13} /> Buat Assessment
            </button>
            <button
              onClick={() => navigate('/pp/orders')}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={12} /> Kembali ke PP Orders
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatMini label="Total Assessment" value={allAssessments.length} sub="Semua data" />
        <StatMini label="Post-Test Selesai" value={totalPostTest} sub="Program selesai" accent="green" />
        <StatMini label="Pre-Test Selesai" value={totalPreTest} sub="Sedang berjalan" accent="blue" />
        <StatMini label="Renewal" value={totalRenewal} sub="Order lanjutan" accent="orange" />
      </div>

      {/* Filter Bar */}
      <div className="bg-bg-surface border border-border rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors"
        >
          <option value="">Semua Status</option>
          <option value="Post-Test Selesai">Post-Test Selesai</option>
          <option value="Pre-Test Selesai">Pre-Test Selesai</option>
          <option value="Draft">Draft</option>
        </select>
        <select
          value={filterRenewal}
          onChange={e => { setFilterRenewal(e.target.value); setPage(1); }}
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
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nama klien, ID assessment, atau order..."
            className="border-none bg-transparent text-xs outline-none w-full text-text-primary placeholder:text-text-muted"
          />
        </div>
        <button
          onClick={reset}
          className="px-3.5 py-[7px] bg-primary hover:bg-primary-2 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 360px)', minHeight: '280px' }}>
          <table className="w-full text-sm" style={{ minWidth: '1000px' }}>
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-100">
                <th style={{minWidth:'165px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">No. Assessment</th>
                <th style={{minWidth:'160px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Klien</th>
                <th style={{minWidth:'130px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Order</th>
                <th style={{minWidth:'120px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tanggal Pre-Test</th>
                <th style={{minWidth:'130px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">FC / Screener</th>
                <th style={{minWidth:'110px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tipe</th>
                <th style={{minWidth:'120px'}} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-text-muted">
                    Belum ada data assessment
                  </td>
                </tr>
              ) : slice.map(a => (
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
                  <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                    {a.tanggalPreTest
                      ? new Date(a.tanggalPreTest).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{a.namaFC || '—'}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {filtered.length === 0
              ? 'Tidak ada assessment ditemukan'
              : `Menampilkan ${start}–${end} dari ${filtered.length} assessment`}
          </span>
          <div className="flex items-center gap-1.5">
            <PBtn onClick={() => setPage(p => Math.max(1, p - 1))}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </PBtn>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <PBtn key={n} active={n === page} onClick={() => setPage(n)}>{n}</PBtn>
            ))}
            <PBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </PBtn>
          </div>
        </div>
      </div>

    </div>
  );
}
