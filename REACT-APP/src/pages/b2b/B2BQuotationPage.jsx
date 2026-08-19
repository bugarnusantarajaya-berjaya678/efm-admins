import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, FileText, Send, CheckCircle, X, CreditCard, ClipboardList } from 'lucide-react'

const STATUS_CFG = {
  draft:      { label: 'Draft',      cls: 'bg-gray-100 text-gray-500 border border-gray-200'          },
  terkirim:   { label: 'Terkirim',   cls: 'bg-blue-50 text-blue-600 border border-blue-200'           },
  disetujui:  { label: 'Disetujui',  cls: 'bg-green-50 text-green-600 border border-green-200'        },
  ditolak:    { label: 'Ditolak',    cls: 'bg-red-50 text-red-500 border border-red-200'              },
}

const JENIS_CFG = {
  Corporate: 'bg-blue-50 text-blue-600',
  Apartment: 'bg-purple-50 text-purple-600',
}

const QUOTATION_INIT = [
  {
    id: 'QUO-2026-001', klien: 'PT. Karya Utama', jenis: 'Corporate', tanggal: '8 Jun 2026',
    status: 'disetujui', catatan: 'Klien setuju mulai 1 Juli 2026. Pembayaran di awal bulan.',
    items: [
      { deskripsi: 'Personal Training Corporate (3x/minggu)', durasi: '12 bulan', rate: 6000000, total: 72000000 },
      { deskripsi: 'Biaya Setup & Konsultasi Awal',           durasi: '1x',       rate: 2000000, total: 2000000  },
    ],
    diskon: 5000000,
  },
  {
    id: 'QUO-2026-002', klien: 'Apartemen Bukit Mas', jenis: 'Apartment', tanggal: '10 Jun 2026',
    status: 'terkirim', catatan: 'Menunggu persetujuan dari pengelola apartemen.',
    items: [
      { deskripsi: 'Yoga & Pilates Program (5x/minggu)', durasi: '6 bulan',  rate: 12000000, total: 72000000 },
      { deskripsi: 'Pelatihan Instruktur Internal',      durasi: '2 sesi',   rate: 1500000,  total: 3000000  },
    ],
    diskon: 0,
  },
  {
    id: 'QUO-2026-003', klien: 'PT. Maju Mandiri', jenis: 'Corporate', tanggal: '16 Jun 2026',
    status: 'draft', catatan: 'Draft belum dikirim. Menunggu konfirmasi detail program dari HR.',
    items: [
      { deskripsi: 'Wellness Program Corporate (3x/minggu)', durasi: '12 bulan', rate: 5500000, total: 66000000 },
      { deskripsi: 'Penyediaan Matras & Alat Fitness',       durasi: '1x',       rate: 3000000, total: 3000000  },
    ],
    diskon: 3000000,
  },
  {
    id: 'QUO-2026-004', klien: 'Apartemen Grand Orchid', jenis: 'Apartment', tanggal: '3 Jun 2026',
    status: 'ditolak', catatan: 'Klien memilih vendor lain dengan harga lebih rendah.',
    items: [
      { deskripsi: 'Fitness Program Apartment (7x/minggu)', durasi: '12 bulan', rate: 15000000, total: 180000000 },
    ],
    diskon: 10000000,
  },
  {
    id: 'QUO-2026-005', klien: 'CV. Digital Nusantara', jenis: 'Corporate', tanggal: '19 Jun 2026',
    status: 'terkirim', catatan: 'Dikirim via email. Menunggu balasan dari pihak manajemen.',
    items: [
      { deskripsi: 'Mobile Fitness Program (2x/minggu)', durasi: '6 bulan', rate: 4000000, total: 24000000 },
    ],
    diskon: 0,
  },
]

function fmtRp(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { label: status, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {cfg.label}
    </span>
  )
}

/* ── Detail Modal ─────────────────────────��───────────────────────────────── */
function DetailModal({ quo, onClose, onBuatInvoice }) {
  const subtotal = quo.items.reduce((s, i) => s + i.total, 0)
  const total    = subtotal - (quo.diskon || 0)

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[600px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

          {/* EFM Navy header */}
          <div className="px-7 py-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1E1C43 0%, #2D2B5A 100%)' }}>
            <div>
              <p className="text-white/60 text-[10.5px] font-semibold tracking-widest uppercase mb-0.5">EFM Management</p>
              <h3 className="text-[17px] font-bold text-white">{quo.id}</h3>
              <p className="text-white/60 text-[12px] mt-0.5">{quo.klien} · {quo.tanggal}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={quo.status} />
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="px-7 py-5 space-y-5">

            {/* Info klien */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10.5px] font-bold text-text-muted uppercase tracking-wide mb-1">Klien</p>
                <p className="text-[13px] font-semibold text-text-primary">{quo.klien}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10.5px] font-bold text-text-muted uppercase tracking-wide mb-1">Jenis</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${JENIS_CFG[quo.jenis] ?? 'bg-gray-100 text-gray-500'}`}>{quo.jenis}</span>
              </div>
            </div>

            {/* Tabel item layanan */}
            <div>
              <p className="text-[12px] font-bold text-text-primary mb-2">Item Layanan</p>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full border-collapse text-[12.5px]">
                  <thead>
                    <tr className="bg-gray-50">
                      {['Deskripsi', 'Durasi', 'Rate', 'Total'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10.5px] font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {quo.items.map((item, i) => (
                      <tr key={i} className={i < quo.items.length - 1 ? 'border-b border-gray-100' : ''}>
                        <td className="px-4 py-3 text-text-primary">{item.deskripsi}</td>
                        <td className="px-4 py-3 text-text-muted whitespace-nowrap">{item.durasi}</td>
                        <td className="px-4 py-3 text-text-muted whitespace-nowrap">{fmtRp(item.rate)}</td>
                        <td className="px-4 py-3 font-semibold text-text-primary whitespace-nowrap">{fmtRp(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subtotal / diskon / total */}
            <div className="bg-gray-50 rounded-xl px-5 py-4 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-text-muted">Subtotal</span>
                <span className="font-semibold text-text-primary">{fmtRp(subtotal)}</span>
              </div>
              {quo.diskon > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-text-muted">Diskon</span>
                  <span className="font-semibold text-red-500">- {fmtRp(quo.diskon)}</span>
                </div>
              )}
              <div className="flex justify-between text-[14px] border-t border-gray-200 pt-2 mt-1">
                <span className="font-bold text-text-primary">Total Penawaran</span>
                <span className="font-bold text-accent text-[16px]">{fmtRp(total)}</span>
              </div>
            </div>

            {/* Catatan */}
            {quo.catatan && (
              <div>
                <p className="text-[12px] font-bold text-text-primary mb-1.5">Catatan</p>
                <p className="text-[13px] text-text-muted bg-gray-50 rounded-xl px-4 py-3 leading-relaxed">{quo.catatan}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end px-7 py-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] font-semibold text-text-muted hover:bg-gray-50">Tutup</button>
            {quo.status === 'disetujui' && (
              <button
                onClick={() => { onClose(); onBuatInvoice() }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover transition-colors"
              >
                <CreditCard size={13} />Buat Invoice
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Tambah Quotation Modal ───────────────────────────────���───────────────── */
function TambahModal({ onClose, onSave }) {
  const [form, setForm] = useState({ klien: '', jenis: 'Corporate', tanggal: '', status: 'draft', catatan: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function handleSubmit() {
    if (!form.klien || !form.tanggal) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h3 className="text-[15px] font-bold text-text-primary">Quotation Baru</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-text-primary"><X size={15} /></button>
          </div>
          <div className="px-6 py-5 space-y-3.5">
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1">Nama Klien *</label>
              <input value={form.klien} onChange={e => set('klien', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1E1C43]" placeholder="Nama perusahaan / apartemen" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-text-primary mb-1">Jenis</label>
                <select value={form.jenis} onChange={e => set('jenis', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none bg-white focus:border-[#1E1C43]">
                  <option>Corporate</option><option>Apartment</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-text-primary mb-1">Tanggal *</label>
                <input type="date" value={form.tanggal} onChange={e => set('tanggal', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1E1C43]" />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none bg-white focus:border-[#1E1C43]">
                {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1">Catatan</label>
              <textarea value={form.catatan} onChange={e => set('catatan', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1E1C43] resize-none" placeholder="Catatan tambahan..." />
            </div>
          </div>
          <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] font-semibold text-text-muted hover:bg-gray-50">Batal</button>
            <button onClick={handleSubmit} className="px-5 py-2 rounded-lg bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover transition-colors">Buat Quotation</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────���─────── */
export default function B2BQuotationPage() {
  const navigate = useNavigate()
  const [list, setList]           = useState(QUOTATION_INIT)
  const [detail, setDetail]       = useState(null)
  const [showTambah, setShowTambah] = useState(false)
  const [fStatus, setFStatus]     = useState('')
  const [fJenis, setFJenis]       = useState('')
  const [search, setSearch]       = useState('')

  const filtered = list.filter(q => {
    if (fStatus && q.status !== fStatus) return false
    if (fJenis  && q.jenis  !== fJenis)  return false
    if (search  && !q.klien.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalQ     = list.length
  const draftQ     = list.filter(q => q.status === 'draft').length
  const terkirimQ  = list.filter(q => q.status === 'terkirim').length
  const disetujuiQ = list.filter(q => q.status === 'disetujui').length

  function handleSave(form) {
    const nextId = `QUO-2026-${String(list.length + 1).padStart(3, '0')}`
    setList(prev => [{ ...form, id: nextId, items: [], diskon: 0 }, ...prev])
    setShowTambah(false)
  }

  return (
    <div className="p-7 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Quotation B2B</h1>
          <p className="text-[13px] text-text-muted mt-1">Dokumen penawaran harga untuk klien B2B</p>
        </div>
        <button
          onClick={() => setShowTambah(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-accent hover:bg-accent-hover transition-colors"
        >
          <Plus size={15} strokeWidth={2.5} />Quotation Baru
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Quotation', val: totalQ,     bg: 'bg-[rgba(30,28,67,0.08)]', iconCls: 'text-text-primary', icon: ClipboardList },
          { label: 'Draft',           val: draftQ,     bg: 'bg-gray-100',              iconCls: 'text-gray-500',     icon: FileText      },
          { label: 'Terkirim',        val: terkirimQ,  bg: 'bg-blue-50',               iconCls: 'text-blue-600',     icon: Send          },
          { label: 'Disetujui',       val: disetujuiQ, bg: 'bg-green-50',              iconCls: 'text-green-600',    icon: CheckCircle   },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon size={18} className={s.iconCls} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">{s.label}</p>
                <p className="text-[24px] font-bold text-text-primary">{s.val}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 px-5 py-3.5 flex flex-wrap items-center gap-3">
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white">
          <option value="">Semua Status</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={fJenis} onChange={e => setFJenis(e.target.value)} className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white">
          <option value="">Semua Jenis</option>
          <option>Corporate</option><option>Apartment</option>
        </select>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama klien..."
          className="flex-1 min-w-[200px] px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary"
        />
        {(fStatus || fJenis || search) && (
          <button onClick={() => { setFStatus(''); setFJenis(''); setSearch('') }} className="px-3 py-2 text-[12px] font-semibold text-accent hover:underline">Reset</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {['No. Quotation', 'Klien', 'Jenis', 'Nilai Penawaran', 'Tanggal', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="bg-gray-50 px-4 py-3 text-[10.5px] font-semibold text-text-muted text-left uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-text-muted">Tidak ada data quotation.</td></tr>
              ) : filtered.map((q, i) => {
                const subtotal = q.items.reduce((s, it) => s + it.total, 0)
                const total    = subtotal - (q.diskon || 0)
                return (
                  <tr key={q.id} className={`hover:bg-gray-50 transition-colors ${i < filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <td className="px-4 py-3.5 font-semibold text-text-primary whitespace-nowrap">{q.id}</td>
                    <td className="px-4 py-3.5 font-semibold text-text-primary whitespace-nowrap">{q.klien}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${JENIS_CFG[q.jenis] ?? 'bg-gray-100 text-gray-500'}`}>{q.jenis}</span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-text-primary whitespace-nowrap">{total > 0 ? fmtRp(total) : '—'}</td>
                    <td className="px-4 py-3.5 text-text-muted whitespace-nowrap">{q.tanggal}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={q.status} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setDetail(q)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors"
                          title="Lihat detail"
                        >
                          <Eye size={14} />
                        </button>
                        {q.status === 'disetujui' && (
                          <button
                            onClick={() => navigate('/b2b/invoice')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1C43] text-white text-[11.5px] font-semibold hover:bg-[#2D2B5A] transition-colors whitespace-nowrap"
                          >
                            <CreditCard size={12} />Buat Invoice
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <DetailModal
          quo={detail}
          onClose={() => setDetail(null)}
          onBuatInvoice={() => navigate('/b2b/invoice')}
        />
      )}
      {showTambah && <TambahModal onClose={() => setShowTambah(false)} onSave={handleSave} />}
    </div>
  )
}
