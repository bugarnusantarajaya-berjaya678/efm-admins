import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Plus, Eye, FileText, CheckCircle, Clock, Send, XCircle } from 'lucide-react'

/* ── Dummy data ──────────────────────────────────────────────────────────── */
const INIT = [
  {
    id: 'QEV-2026-001', klien: 'PT. Karya Maju', jenis: 'Corporate Gathering',
    tanggal: '8 Jun 2026', status: 'disetujui', nilai: 25000000,
    catatan: 'Termasuk sound system dan dokumentasi foto.',
    items: [
      { deskripsi: 'MC & Pembawa Acara',      qty: 1, satuan: 'paket', harga: 5000000  },
      { deskripsi: 'Instruktur Senam (3 org)', qty: 3, satuan: 'org',  harga: 3000000  },
      { deskripsi: 'Sound System & Lighting',  qty: 1, satuan: 'paket', harga: 8000000  },
      { deskripsi: 'Dokumentasi Foto & Video', qty: 1, satuan: 'paket', harga: 4000000  },
      { deskripsi: 'Perlengkapan Senam',       qty: 1, satuan: 'paket', harga: 5000000  },
    ],
    diskon: 0,
  },
  {
    id: 'QEV-2026-002', klien: 'Keluarga Besar Suharto', jenis: 'Family Gathering',
    tanggal: '10 Jun 2026', status: 'terkirim', nilai: 15000000,
    catatan: 'Termasuk doorprize dan konsumsi snack.',
    items: [
      { deskripsi: 'Instruktur Senam (2 org)', qty: 2, satuan: 'org',  harga: 2500000  },
      { deskripsi: 'MC & Games Facilitator',   qty: 1, satuan: 'paket', harga: 3500000  },
      { deskripsi: 'Doorprize & Hadiah Lomba', qty: 1, satuan: 'paket', harga: 5000000  },
      { deskripsi: 'Sound System Portable',    qty: 1, satuan: 'paket', harga: 4000000  },
    ],
    diskon: 0,
  },
  {
    id: 'QEV-2026-003', klien: 'SMA Negeri 5 Jakarta', jenis: 'School Event',
    tanggal: '16 Jun 2026', status: 'draft', nilai: 8500000,
    catatan: 'Draft awal, menunggu persetujuan kepala sekolah.',
    items: [
      { deskripsi: 'Instruktur Senam (2 org)', qty: 2, satuan: 'org',  harga: 2000000  },
      { deskripsi: 'Sound System',             qty: 1, satuan: 'paket', harga: 3000000  },
      { deskripsi: 'Perlengkapan Lomba',       qty: 1, satuan: 'paket', harga: 3500000  },
    ],
    diskon: 0,
  },
  {
    id: 'QEV-2026-004', klien: 'PT. Digital Nusantara', jenis: 'Team Building',
    tanggal: '18 Jun 2026', status: 'terkirim', nilai: 32000000,
    catatan: 'Paket 2 hari 1 malam, termasuk akomodasi fasilitator.',
    items: [
      { deskripsi: 'Fasilitator Outbound (4 org)', qty: 4, satuan: 'org',  harga: 5000000  },
      { deskripsi: 'Instruktur Yoga (2 org)',      qty: 2, satuan: 'org',  harga: 3000000  },
      { deskripsi: 'Peralatan Outbound',           qty: 1, satuan: 'paket', harga: 8000000  },
      { deskripsi: 'Dokumentasi Lengkap',          qty: 1, satuan: 'paket', harga: 6000000  },
      { deskripsi: 'Akomodasi Fasilitator',        qty: 4, satuan: 'malam', harga: 2500000  },
    ],
    diskon: 2000000,
  },
  {
    id: 'QEV-2026-005', klien: 'PT. Maju Mandiri', jenis: 'Corporate Health Day',
    tanggal: '20 Jun 2026', status: 'draft', nilai: 18750000,
    catatan: 'Paket setengah hari, tidak termasuk venue.',
    items: [
      { deskripsi: 'Instruktur Senam (3 org)', qty: 3, satuan: 'org',  harga: 2500000  },
      { deskripsi: 'MC & Moderator',          qty: 1, satuan: 'paket', harga: 3750000  },
      { deskripsi: 'Sound System Portable',   qty: 1, satuan: 'paket', harga: 5000000  },
      { deskripsi: 'Konsumsi Fasilitator',    qty: 1, satuan: 'paket', harga: 750000   },
      { deskripsi: 'Perlengkapan Kesehatan',  qty: 1, satuan: 'paket', harga: 6750000  },
    ],
    diskon: 0,
  },
]

/* ── Config ──────────────────────────────────────────────────────────────── */
const STATUS_CFG = {
  draft:     { label: 'Draft',     cls: 'bg-gray-100 text-gray-500 border border-gray-200',     icon: FileText    },
  terkirim:  { label: 'Terkirim',  cls: 'bg-blue-50 text-blue-600 border border-blue-200',      icon: Send        },
  disetujui: { label: 'Disetujui', cls: 'bg-green-50 text-green-600 border border-green-200',   icon: CheckCircle },
  ditolak:   { label: 'Ditolak',   cls: 'bg-red-50 text-red-500 border border-red-200',         icon: XCircle     },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, cls: 'bg-gray-100 text-gray-500', icon: Clock }
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
      <Icon size={11} />{cfg.label}
    </span>
  )
}

function fmt(n) { return 'Rp ' + n.toLocaleString('id-ID') }

/* ── Detail Modal ────────────────────────────────────────────────────────── */
function DetailModal({ item, onClose }) {
  const navigate = useNavigate()
  const subtotal = item.items.reduce((s, i) => s + i.qty * i.harga, 0)
  const total    = subtotal - (item.diskon || 0)

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[620px] shadow-2xl" onClick={e => e.stopPropagation()}>
          {/* Navy header */}
          <div className="px-7 py-5 rounded-t-2xl" style={{ background: 'linear-gradient(135deg,#1E1C43 0%,#2D2B5A 100%)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">EFM Management · Quotation Event</p>
                <h3 className="text-white text-[20px] font-bold mt-0.5">{item.id}</h3>
                <p className="text-white/60 text-[13px] mt-0.5">{item.klien} · {item.jenis}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={item.status} />
                <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                  <X size={13} />
                </button>
              </div>
            </div>
            <p className="text-white/40 text-[11px] mt-3">Tanggal: {item.tanggal}</p>
          </div>

          {/* Body */}
          <div className="px-7 py-5 space-y-4">
            {/* Items table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Item / Layanan', 'Qty', 'Satuan', 'Harga Satuan', 'Subtotal'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {item.items.map((it, i) => (
                    <tr key={i} className={i < item.items.length - 1 ? 'border-b border-gray-50' : ''}>
                      <td className="px-4 py-2.5 font-medium text-text-primary">{it.deskripsi}</td>
                      <td className="px-4 py-2.5 text-text-muted">{it.qty}</td>
                      <td className="px-4 py-2.5 text-text-muted">{it.satuan}</td>
                      <td className="px-4 py-2.5 text-text-muted">{fmt(it.harga)}</td>
                      <td className="px-4 py-2.5 font-semibold text-text-primary">{fmt(it.qty * it.harga)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total calculation */}
            <div className="bg-gray-50 rounded-xl px-5 py-4 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-text-muted">Subtotal</span>
                <span className="font-semibold text-text-primary">{fmt(subtotal)}</span>
              </div>
              {item.diskon > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-text-muted">Diskon</span>
                  <span className="font-semibold text-red-500">- {fmt(item.diskon)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="text-[14px] font-bold text-text-primary">Total</span>
                <span className="text-[16px] font-bold text-accent">{fmt(total)}</span>
              </div>
            </div>

            {item.catatan && (
              <div className="bg-blue-50 rounded-xl px-4 py-3">
                <p className="text-[10.5px] font-bold text-blue-600 uppercase tracking-wide mb-1">Catatan</p>
                <p className="text-[13px] text-text-primary">{item.catatan}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 px-7 py-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-text-muted border border-gray-200 rounded-lg hover:border-text-primary transition-colors">Tutup</button>
            {item.status === 'disetujui' && (
              <button
                onClick={() => { onClose(); navigate('/event/invoice') }}
                className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors"
              >
                <FileText size={13} />Buat Invoice
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function EventQuotationPage() {
  const [list,    setList]    = useState(INIT)
  const [detail,  setDetail]  = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterJenis,  setFilterJenis]  = useState('')
  const [search,       setSearch]       = useState('')

  const filtered = list.filter(r => {
    if (filterStatus && r.status !== filterStatus) return false
    if (filterJenis  && r.jenis  !== filterJenis)  return false
    if (search && !r.klien.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const jenisOptions = [...new Set(list.map(r => r.jenis))]

  const stats = [
    { label: 'Total Quotation', val: list.length,                                         cls: 'text-text-primary', bg: 'bg-[rgba(30,28,67,0.08)]' },
    { label: 'Draft',           val: list.filter(r => r.status === 'draft').length,       cls: 'text-gray-600',     bg: 'bg-gray-100'              },
    { label: 'Terkirim',        val: list.filter(r => r.status === 'terkirim').length,    cls: 'text-blue-600',     bg: 'bg-blue-50'               },
    { label: 'Disetujui',       val: list.filter(r => r.status === 'disetujui').length,   cls: 'text-green-600',    bg: 'bg-green-50'              },
  ]

  return (
    <div className="p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Quotation Event</h1>
          <p className="text-[13px] text-text-muted mt-0.5">Dokumen penawaran harga untuk klien event</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors">
          <Plus size={14} />+ Quotation Baru
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border-[1.5px] border-gray-200 px-5 py-4">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <FileText size={16} className={s.cls} />
            </div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">{s.label}</p>
            <p className={`text-[26px] font-bold ${s.cls}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white">
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="terkirim">Terkirim</option>
          <option value="disetujui">Disetujui</option>
          <option value="ditolak">Ditolak</option>
        </select>
        <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)} className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white">
          <option value="">Semua Jenis</option>
          {jenisOptions.map(j => <option key={j}>{j}</option>)}
        </select>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama klien..."
          className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1E1C43] w-56"
        />
        <p className="ml-auto text-[12px] text-text-muted">{filtered.length} quotation</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {['No. Quotation', 'Klien', 'Jenis Event', 'Nilai Penawaran', 'Tanggal', 'Status', 'Aksi'].map(h => (
                <th key={h} className="bg-gray-50 px-4 py-3 text-[10.5px] font-semibold text-text-muted text-left uppercase tracking-wide whitespace-nowrap border-b border-gray-100">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${i < filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <td className="px-4 py-3.5 font-semibold text-[#1E1C43]">{r.id}</td>
                <td className="px-4 py-3.5 font-semibold text-text-primary whitespace-nowrap">{r.klien}</td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-600">{r.jenis}</span>
                </td>
                <td className="px-4 py-3.5 font-bold text-text-primary whitespace-nowrap">{fmt(r.nilai)}</td>
                <td className="px-4 py-3.5 text-text-muted whitespace-nowrap">{r.tanggal}</td>
                <td className="px-4 py-3.5"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDetail(r)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors">
                      <Eye size={13} />
                    </button>
                    {r.status === 'disetujui' && (
                      <button
                        onClick={() => setDetail(r)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent hover:bg-accent-hover text-white text-[11px] font-semibold transition-colors whitespace-nowrap"
                      >
                        <FileText size={11} />Buat Invoice
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px] text-text-muted">Tidak ada data quotation.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {detail && <DetailModal item={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}
