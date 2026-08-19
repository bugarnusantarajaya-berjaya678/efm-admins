import { useState, useMemo } from 'react'

const PENJUALAN = [
  { tgl: '20 Jun 2026', klien: 'Robert Taylor',        divisi: 'PP',    pic: 'Sarah Jenkins',   nilai: 4800000, status: 'paid'    },
  { tgl: '19 Jun 2026', klien: 'Apartemen Green Lake', divisi: 'B2B',   pic: 'Marcus Chen',     nilai: 9000000, status: 'pending' },
  { tgl: '18 Jun 2026', klien: 'James Wilson',         divisi: 'PP',    pic: 'Sarah Jenkins',   nilai: 2400000, status: 'paid'    },
  { tgl: '17 Jun 2026', klien: 'PT. Maju Bersama',     divisi: 'Event', pic: 'Budi Wijaya',     nilai: 15000000,status: 'paid'    },
  { tgl: '16 Jun 2026', klien: 'Emily Chen',           divisi: 'PP',    pic: 'Marcus Chen',     nilai: 800000,  status: 'paid'    },
  { tgl: '15 Jun 2026', klien: 'Sudirman Park Apt.',   divisi: 'B2B',   pic: 'Ahmad Pratama',   nilai: 7500000, status: 'overdue' },
  { tgl: '14 Jun 2026', klien: 'Anita Kumar',          divisi: 'PP',    pic: 'Sarah Jenkins',   nilai: 1600000, status: 'paid'    },
  { tgl: '13 Jun 2026', klien: 'CV. Teknologi Prima',  divisi: 'Event', pic: 'Elena Rodriguez', nilai: 10000000,status: 'pending' },
  { tgl: '12 Jun 2026', klien: 'Budi Santoso',         divisi: 'PP',    pic: 'Marcus Chen',     nilai: 2400000, status: 'paid'    },
  { tgl: '11 Jun 2026', klien: 'The Summit Apartment', divisi: 'B2B',   pic: 'Marcus Chen',     nilai: 8000000, status: 'paid'    },
  { tgl: '10 Jun 2026', klien: 'Rina Kusuma',          divisi: 'PP',    pic: 'Elena Rodriguez', nilai: 800000,  status: 'paid'    },
  { tgl: '9 Jun 2026',  klien: 'Kelapa Gading Apt.',   divisi: 'B2B',   pic: 'Rina Indah',      nilai: 6500000, status: 'paid'    },
]

const STATUS_CLS = {
  paid:    'bg-green-50 text-green-600',
  pending: 'bg-yellow-50 text-yellow-600',
  overdue: 'bg-red-50 text-red-500',
}
const STATUS_LBL = { paid: 'Lunas', pending: 'Pending', overdue: 'Overdue' }
const DIVISI_CLS = {
  PP:    'bg-[rgba(30,28,67,0.08)] text-text-primary',
  B2B:   'bg-blue-50 text-blue-600',
  Event: 'bg-purple-50 text-purple-600',
}

function fmtRp(n) { return 'Rp ' + n.toLocaleString('id-ID') }

const PIC_LIST = [...new Set(PENJUALAN.map(r => r.pic))]

export default function LaporanPenjualanPage() {
  const [fDivisi, setDivisi]   = useState('')
  const [fPIC,    setPIC]      = useState('')
  const [fStatus, setStatus]   = useState('')
  const [search,  setSearch]   = useState('')

  const filtered = useMemo(() => PENJUALAN.filter(r => {
    if (fDivisi && r.divisi !== fDivisi) return false
    if (fPIC    && r.pic    !== fPIC)    return false
    if (fStatus && r.status !== fStatus) return false
    if (search  && !r.klien.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [fDivisi, fPIC, fStatus, search])

  const total = filtered.reduce((s, r) => s + r.nilai, 0)

  return (
    <div className="p-7 space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-text-primary">Laporan Penjualan</h1>
        <p className="text-[13px] text-text-muted mt-1">Rekap transaksi penjualan semua divisi</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 px-5 py-3.5 flex flex-wrap items-center gap-3">
        <select value={fDivisi} onChange={e => setDivisi(e.target.value)} className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white">
          <option value="">Semua Divisi</option>
          <option>PP</option><option>B2B</option><option>Event</option>
        </select>
        <select value={fPIC} onChange={e => setPIC(e.target.value)} className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white">
          <option value="">Semua PIC</option>
          {PIC_LIST.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={fStatus} onChange={e => setStatus(e.target.value)} className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white">
          <option value="">Semua Status</option>
          <option value="paid">Lunas</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama klien..." className="flex-1 min-w-[180px] px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
        <button onClick={() => { setDivisi(''); setPIC(''); setStatus(''); setSearch('') }} className="px-3 py-2 bg-[#1E1C43] text-white text-[13px] font-semibold rounded-lg hover:bg-[#2D2B5A] transition-colors">Reset</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Tanggal', 'Klien', 'Divisi', 'PIC', 'Nilai', 'Status'].map(h => (
                  <th key={h} className="bg-gray-50 px-3 py-2.5 text-[10px] font-semibold text-gray-500 text-left uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className={`hover:bg-gray-50 transition-colors duration-150 ${i < filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{r.tgl}</td>
                  <td className="text-xs font-medium text-gray-900 px-3 py-2.5 whitespace-nowrap">{r.klien}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DIVISI_CLS[r.divisi] ?? 'bg-gray-100 text-gray-500'}`}>{r.divisi}</span>
                  </td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{r.pic}</td>
                  <td className="text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap">{fmtRp(r.nilai)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CLS[r.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />{STATUS_LBL[r.status] ?? r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-text-muted">Tidak ada data</td></tr>
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td colSpan={4} className="px-3 py-2.5 text-xs font-bold text-[#1E1C43] uppercase">Total ({filtered.length} transaksi)</td>
                  <td className="px-3 py-2.5 text-xs font-semibold text-accent">{fmtRp(total)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
