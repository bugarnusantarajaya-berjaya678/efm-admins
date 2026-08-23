import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { X, Search, Clock, CheckCircle, Banknote, TrendingUp, Check } from 'lucide-react'
import { paymentList, paymentStats, picList } from '../../data/opsData'

const STATUS_CONFIG = {
  belum_bayar: { label: 'Belum Bayar', cls: 'bg-red-50 text-red-500'       },
  sudah_bayar: { label: 'Sudah Bayar', cls: 'bg-green-50 text-green-600'   },
  proses:      { label: 'Diproses',    cls: 'bg-yellow-50 text-yellow-600' },
}

const BULAN_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

const PIC_COLORS = ['#E05945','#2980B9','#27AE60','#E67E22','#16A085','#8E44AD','#C0392B']

const initialPengajuanAbsensi = [
  { id: 'PA-001', namaPIC: 'Elena Rodriguez', klien: 'PT. Maju Bersama',   program: 'Corporate Wellness', periode: 'Mei 2026', jumlahSesi: 20, honorarium: 1500000, tglApprove: '5 Jun 2026'  },
  { id: 'PA-002', namaPIC: 'Budi Santoso',    klien: 'Anna Johnson',       program: 'Yoga 12x',          periode: 'Mei 2026', jumlahSesi: 12, honorarium: 900000,  tglApprove: '3 Jun 2026'  },
  { id: 'PA-003', namaPIC: 'Ahmad Pratama',   klien: 'Sudirman Park Apt.', program: 'B2B Monthly',       periode: 'Jun 2026', jumlahSesi: 12, honorarium: 960000,  tglApprove: '18 Jun 2026' },
]

function fmt(n) {
  if (!n) return '—'
  return 'Rp ' + n.toLocaleString('id-ID')
}

function getInisial(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

/* ── Modal: Detail Riwayat ────────────────────────────────────────────────── */
function DetailModal({ pay, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h3 className="text-[16px] font-bold text-text-primary">Detail Pembayaran</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-text-primary transition-colors">
              <X size={15} />
            </button>
          </div>
          <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
            <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white text-[18px] font-bold shrink-0" style={{ background: pay.warna }}>
              {pay.inisial}
            </div>
            <div>
              <h4 className="text-[17px] font-bold text-text-primary">{pay.pic}</h4>
              <p className="text-[12px] text-text-muted mt-0.5">{pay.id} · {pay.periode}</p>
              <div className="mt-1.5"><StatusBadge status={pay.status} /></div>
            </div>
          </div>
          <div className="px-6 py-5 space-y-3.5">
            {[
              ['Periode',          pay.periode],
              ['Total Sesi',       pay.totalSesi ? `${pay.totalSesi} sesi` : '—'],
              ['Rate / Sesi',      fmt(pay.rate)],
              ['Total Honorarium', fmt(pay.total)],
              ['Tgl Pembayaran',   pay.tglBayar],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-[13px]">
                <span className="text-text-muted font-medium">{label}</span>
                <span className={`font-semibold ${label === 'Total Honorarium' ? 'text-accent text-[15px]' : 'text-text-primary'}`}>{val}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-text-muted border border-gray-200 rounded-lg hover:border-text-primary transition-colors">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Modal: Proses Pembayaran (section absensi) ───────────────────────────── */
function ProsesBayarModal({ item, onClose, onConfirm }) {
  const [metodeBayar, setMetodeBayar] = useState('Transfer Bank')
  const [tglBayar,    setTglBayar]    = useState('')
  const [catatan,     setCatatan]     = useState('')

  function handleSubmit() {
    if (!tglBayar) return
    onConfirm(item, { metodeBayar, tglBayar, catatan })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-[15px] font-bold text-[#1E1C43]">Proses Pembayaran</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-[#1E1C43] transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-gray-50 rounded-xl px-4 py-3.5">
            <p className="text-sm text-gray-700">
              Proses pembayaran honorarium{' '}
              <span className="font-semibold text-[#1E1C43]">{item.namaPIC}</span>{' '}
              sebesar <span className="font-bold text-[#E05945]">{fmt(item.honorarium)}</span>?
            </p>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#1E1C43] mb-1.5">
              Metode Bayar <span className="text-[#E05945]">*</span>
            </label>
            <select
              value={metodeBayar}
              onChange={e => setMetodeBayar(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1E1C43] bg-white"
            >
              <option>Transfer Bank</option>
              <option>Cash</option>
              <option>Dompet Digital</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#1E1C43] mb-1.5">
              Tanggal Bayar <span className="text-[#E05945]">*</span>
            </label>
            <input
              type="date"
              value={tglBayar}
              onChange={e => setTglBayar(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1E1C43]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#1E1C43] mb-1.5">Catatan (opsional)</label>
            <textarea
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              rows={2}
              placeholder="Contoh: Transfer BCA 23 Jun 2026"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1E1C43] resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-gray-500 border border-gray-200 rounded-lg hover:border-[#1E1C43] transition-colors">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!tglBayar}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E1C43] hover:bg-[#2D2B5A] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-lg transition-colors"
          >
            <Check size={13} />✓ Konfirmasi Bayar
          </button>
        </div>
      </div>
    </div>
  )
}

const TABLE_HEADERS = ['Nama PIC', 'Periode', 'Total Sesi', 'Rate / Sesi', 'Total Honorarium', 'Status', 'Aksi']

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function PaymentPage() {
  const [searchParams] = useSearchParams()
  const picParam       = searchParams.get('pic')

  const [bulan, setBulan]             = useState('')
  const [tahun, setTahun]             = useState('')
  const [statusFilter, setStatus]     = useState('')
  const [search, setSearch]           = useState('')
  const [selected, setSelected]       = useState(null)
  const [payments, setPayments]       = useState(paymentList)
  const [pengajuanAbsensi, setPengajuanAbsensi] = useState(initialPengajuanAbsensi)
  const [prosesBayarItem,  setProsesBayarItem]  = useState(null)
  const [picName, setPicName] = useState('')

  useEffect(() => {
    if (picParam) {
      const found = picList.find(p => `EFM-${p.id}` === picParam)
      if (found) { setSearch(found.nama); setPicName(found.nama) }
    }
  }, [])

  function handleProsesBayar(item, form) {
    setPengajuanAbsensi(prev => prev.filter(p => p.id !== item.id))
    const colorIdx = item.namaPIC.length % PIC_COLORS.length
    const tglFormatted = new Date(form.tglBayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    setPayments(prev => [{
      id:        `PAY-${Date.now()}`,
      pic:       item.namaPIC,
      inisial:   getInisial(item.namaPIC),
      warna:     PIC_COLORS[colorIdx],
      periode:   item.periode,
      totalSesi: item.jumlahSesi,
      rate:      Math.round(item.honorarium / item.jumlahSesi),
      total:     item.honorarium,
      status:    'sudah_bayar',
      tglBayar:  tglFormatted,
    }, ...prev])
    setProsesBayarItem(null)
  }

  const filtered = payments.filter(p => {
    if (bulan && !(p.periode ?? '').includes(bulan)) return false
    if (tahun && !(p.periode ?? '').includes(tahun)) return false
    if (statusFilter && p.status !== statusFilter) return false
    if (search && !p.pic.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-7">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Rekap Pembayaran PIC</h1>
          <p className="text-[13px] text-text-muted mt-1">Kelola pembayaran honorarium trainer &amp; therapist</p>
        </div>
      </div>

      {picName && (
        <div className="mb-5 flex items-center justify-between gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-[#1E1C43]">
            Menampilkan data untuk PIC: <span className="font-bold">{picName}</span>
          </p>
          <button
            onClick={() => { setSearch(''); setPicName('') }}
            className="text-xs font-semibold text-[#E05945] hover:underline whitespace-nowrap"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* ── Section: Pengajuan Masuk dari Absensi ───────────────────────── */}
      <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <h2 className="text-base font-semibold text-[#1E1C43]">📥 Pengajuan Masuk dari Absensi</h2>
          {pengajuanAbsensi.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#E05945] text-white text-[11px] font-bold leading-none">
              {pengajuanAbsensi.length}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Honorarium PIC yang sudah diapprove dari halaman Absensi — siap diproses pembayaran
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 1000 }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['No', 'Nama PIC', 'Klien', 'Program', 'Periode', 'Jml Sesi', 'Honorarium', 'Tgl Approve', 'Aksi'].map(h => (
                  <th key={h} className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pengajuanAbsensi.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                    Tidak ada pengajuan masuk dari Absensi.
                  </td>
                </tr>
              ) : pengajuanAbsensi.map((item, i) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5">{i + 1}</td>
                  <td className="text-xs font-medium text-gray-900 px-3 py-2.5 whitespace-nowrap">{item.namaPIC}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{item.klien}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{item.program}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{item.periode}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{item.jumlahSesi} sesi</td>
                  <td className="text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap">{fmt(item.honorarium)}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{item.tglApprove}</td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => setProsesBayarItem(item)}
                      className="whitespace-nowrap inline-flex items-center gap-1.5 bg-[#1E1C43] hover:bg-[#2D2B5A] text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Proses Pembayaran
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Menunggu Pembayaran</p>
            <p className="text-[22px] font-bold text-text-primary">{paymentStats.menunggu} PIC</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Sudah Dibayar</p>
            <p className="text-[22px] font-bold text-text-primary">{paymentStats.sudahBayar} PIC</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[rgba(30,28,67,0.1)] text-text-primary flex items-center justify-center shrink-0">
            <Banknote size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Total Dibayar Bln Ini</p>
            <p className="text-[17px] font-bold text-text-primary leading-tight mt-0.5">{fmt(paymentStats.totalBayar)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-accent flex items-center justify-center shrink-0">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Rata-rata per PIC</p>
            <p className="text-[17px] font-bold text-text-primary leading-tight mt-0.5">{fmt(paymentStats.rataRata)}</p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 px-5 py-4 flex items-center gap-3 mb-5 flex-wrap">
        <select value={bulan} onChange={e => setBulan(e.target.value)}
          className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white">
          <option value="">Semua Bulan</option>
          {BULAN_NAMES.map(b => <option key={b}>{b}</option>)}
        </select>
        <select value={tahun} onChange={e => setTahun(e.target.value)}
          className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white">
          <option value="">Semua Tahun</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
        <select value={statusFilter} onChange={e => setStatus(e.target.value)}
          className="px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none bg-white">
          <option value="">Semua Status</option>
          <option value="belum_bayar">Belum Bayar</option>
          <option value="sudah_bayar">Sudah Bayar</option>
          <option value="proses">Diproses</option>
        </select>
        <div className="relative flex-1 max-w-[300px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama PIC..."
            className="w-full pl-8 pr-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary"
          />
        </div>
        <p className="text-[12px] text-text-muted ml-auto">{filtered.length} PIC</p>
      </div>

      {/* ── Riwayat Pembayaran Table ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {TABLE_HEADERS.map(h => (
                  <th key={h} className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((pay) => (
                <tr key={pay.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: pay.warna }}>
                        {pay.inisial}
                      </div>
                      <span className="text-xs font-medium text-gray-900">{pay.pic}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs font-normal text-gray-600">{pay.periode}</td>
                  <td className="px-3 py-2.5 text-xs font-normal text-gray-600">
                    {pay.totalSesi ? `${pay.totalSesi} sesi` : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-xs font-normal text-gray-600">{fmt(pay.rate)}</td>
                  <td className="px-3 py-2.5 text-xs font-semibold text-gray-600">{fmt(pay.total)}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={pay.status} /></td>
                  <td className="px-3 py-2.5">
                    {pay.status === 'belum_bayar' ? (
                      <button
                        onClick={() => setSelected(pay)}
                        className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-[12px] font-semibold rounded-lg transition-colors"
                      >
                        Bayar
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelected(pay)}
                        className="px-3 py-1.5 border-[1.5px] border-gray-200 text-text-primary text-[12px] font-semibold rounded-lg hover:border-text-primary hover:bg-gray-50 transition-colors"
                      >
                        Lihat
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                    Tidak ada data pembayaran yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <p className="text-[12px] text-text-muted">Menampilkan {filtered.length} dari {payments.length} PIC</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg border-[1.5px] border-gray-200 flex items-center justify-center text-text-primary text-[13px] opacity-35">‹</button>
            <button className="w-8 h-8 rounded-lg border-[1.5px] bg-text-primary border-text-primary text-white text-[13px] font-medium">1</button>
            <button className="w-8 h-8 rounded-lg border-[1.5px] border-gray-200 flex items-center justify-center text-text-primary text-[13px]">›</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selected       && <DetailModal       pay={selected}        onClose={() => setSelected(null)} />}
      {prosesBayarItem && <ProsesBayarModal item={prosesBayarItem} onClose={() => setProsesBayarItem(null)} onConfirm={handleProsesBayar} />}
    </div>
  )
}
