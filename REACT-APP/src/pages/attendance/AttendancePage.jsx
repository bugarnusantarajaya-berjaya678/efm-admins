import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileText, Check, X, Search } from 'lucide-react'
import { pengajuanList as initialPengajuan, riwayatList as initialRiwayat } from '../../data/attendanceData'
import { picList } from '../../data/opsData'

const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const BULAN_SHORT = { Januari:'Jan', Februari:'Feb', Maret:'Mar', April:'Apr', Mei:'Mei', Juni:'Jun', Juli:'Jul', Agustus:'Agu', September:'Sep', Oktober:'Okt', November:'Nov', Desember:'Des' }
const STATUS_TABS = ['Semua', 'Menunggu Review', 'Sudah Diapprove', 'Ditolak']

function fmt(n) { return 'Rp ' + n.toLocaleString('id-ID') }

/* ── Modal: Konfirmasi Approve ────────────────────────────────────────────── */
function ApproveModal({ item, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-[15px] font-bold text-[#1E1C43]">Konfirmasi Approve</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-[#1E1C43] transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="px-6 py-6 space-y-2">
          <p className="text-sm text-gray-700">
            Approve rekap <span className="font-semibold text-[#1E1C43]">{item.namaPIC}</span> — {item.jumlahSesi} sesi — {item.periode}?
          </p>
          <p className="text-sm text-gray-500">Pembayaran honorarium akan diproses otomatis.</p>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-semibold text-gray-500 border border-gray-200 rounded-lg hover:border-[#1E1C43] transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => { onConfirm(item); onClose() }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E05945] hover:bg-[#c94a38] text-white text-[13px] font-semibold rounded-lg transition-colors"
          >
            <Check size={13} />Ya, Approve &amp; Proses
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Modal: Detail Rekap Riwayat ──────────────────────────────────────────── */
function DetailModal({ item, onClose }) {
  const payBadgeCls = item.statusBayar === 'Sudah Dibayar' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[#E05945]" />
            <h3 className="text-[15px] font-bold text-[#1E1C43]">Detail Rekap</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-[#1E1C43] transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-3.5">
          {[
            ['Nama PIC',    item.namaPIC],
            ['Klien',       item.klien],
            ['Program',     item.program],
            ['Periode',     item.periode],
            ['Jumlah Sesi', `${item.jumlahSesi} sesi`],
            ['Honorarium',  fmt(item.honorarium)],
            ['Tgl Approve', item.tglApprove],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-semibold text-[#1E1C43]">{val}</span>
            </div>
          ))}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Status Bayar</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${payBadgeCls}`}>
              {item.statusBayar}
            </span>
          </div>
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-gray-500 border border-gray-200 rounded-lg hover:border-[#1E1C43] transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function AttendancePage() {
  const [searchParams]          = useSearchParams()
  const picParam                = searchParams.get('pic')

  const [pengajuan, setPengajuan] = useState(initialPengajuan)
  const [riwayat,   setRiwayat]   = useState(initialRiwayat)

  const [fBulan1,  setFBulan1]  = useState('')
  const [fTahun1,  setFTahun1]  = useState('')
  const [fStatus,  setFStatus]  = useState('Semua')
  const [fSearch1, setFSearch1] = useState('')

  const [fBulan2,  setFBulan2]  = useState('')
  const [fTahun2,  setFTahun2]  = useState('')
  const [fSearch2, setFSearch2] = useState('')

  const [approveItem, setApproveItem] = useState(null)
  const [detailItem,  setDetailItem]  = useState(null)
  const [picName, setPicName] = useState('')

  useEffect(() => {
    if (picParam) {
      const found = picList.find(p => `EFM-${p.id}` === picParam)
      if (found) { setFSearch1(found.nama); setFSearch2(found.nama); setPicName(found.nama) }
    }
  }, [])

  const menungguCount = pengajuan.filter(p => p.status === 'Menunggu Review').length

  function handleApprove(item) {
    setPengajuan(prev => prev.map(p => p.id === item.id ? { ...p, status: 'Sudah Diapprove' } : p))
    setRiwayat(prev => [{
      id: `RIW-${Date.now()}`,
      namaPIC:    item.namaPIC,
      klien:      item.klien,
      program:    item.program,
      periode:    item.periode,
      jumlahSesi: item.jumlahSesi,
      honorarium: item.honorarium,
      tglApprove: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      statusBayar: 'Dalam Proses',
    }, ...prev])
  }

  const filteredPengajuan = pengajuan.filter(item => {
    const bShort = BULAN_SHORT[fBulan1] ?? fBulan1
    return (
      (!fBulan1  || item.periode.includes(bShort)) &&
      (!fTahun1  || item.periode.includes(fTahun1)) &&
      (fStatus === 'Semua' || item.status === fStatus) &&
      (!fSearch1 || item.namaPIC.toLowerCase().includes(fSearch1.toLowerCase()) ||
                    item.klien.toLowerCase().includes(fSearch1.toLowerCase()))
    )
  })

  const filteredRiwayat = riwayat.filter(item => {
    const bShort = BULAN_SHORT[fBulan2] ?? fBulan2
    return (
      (!fBulan2  || item.periode.includes(bShort)) &&
      (!fTahun2  || item.periode.includes(fTahun2)) &&
      (!fSearch2 || item.namaPIC.toLowerCase().includes(fSearch2.toLowerCase()))
    )
  })

  function statusBadgeCls(status) {
    if (status === 'Menunggu Review') return 'bg-yellow-100 text-yellow-700'
    if (status === 'Sudah Diapprove') return 'bg-green-100 text-green-700'
    if (status === 'Ditolak')         return 'bg-red-100 text-red-600'
    return 'bg-gray-100 text-gray-600'
  }

  function statusBayarCls(status) {
    if (status === 'Sudah Dibayar') return 'bg-green-100 text-green-700'
    if (status === 'Dalam Proses')  return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E1C43]">Absensi &amp; Rekap PIC</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola pengajuan rekap kehadiran dari PIC</p>
      </div>

      {picName && (
        <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-[#1E1C43]">
            Menampilkan data untuk PIC: <span className="font-bold">{picName}</span>
          </p>
          <button
            onClick={() => { setFSearch1(''); setFSearch2(''); setPicName('') }}
            className="text-xs font-semibold text-[#E05945] hover:underline whitespace-nowrap"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* ── Section 1: Pengajuan Masuk ──────────────────────────────────── */}
      <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <h2 className="text-base font-semibold text-[#1E1C43]">📥 Pengajuan Masuk</h2>
          {menungguCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold leading-none">
              {menungguCount}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-4">Rekap kehadiran dari PIC yang menunggu review &amp; approval</p>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <select value={fBulan1} onChange={e => setFBulan1(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none bg-white focus:border-[#1E1C43]">
            <option value="">Filter Bulan</option>
            {BULAN.map(b => <option key={b}>{b}</option>)}
          </select>
          <select value={fTahun1} onChange={e => setFTahun1(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none bg-white focus:border-[#1E1C43]">
            <option value="">Filter Tahun</option>
            <option>2025</option>
            <option>2026</option>
          </select>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {STATUS_TABS.map((s, i) => (
              <button key={s} onClick={() => setFStatus(s)}
                className={`px-3 py-2 text-[12.5px] font-medium whitespace-nowrap transition-colors ${
                  i > 0 ? 'border-l border-gray-200' : ''
                } ${fStatus === s ? 'bg-[#1E1C43] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input value={fSearch1} onChange={e => setFSearch1(e.target.value)}
              placeholder="Cari nama PIC atau klien..."
              className="border-none outline-none text-[13px] w-full bg-transparent placeholder:text-gray-400" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 1100 }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  { label: 'No' },
                  { label: 'Nama PIC' },
                  { label: 'Klien' },
                  { label: 'Program' },
                  { label: 'Periode' },
                  { label: 'Jml Sesi' },
                  { label: 'Tgl Pengajuan' },
                  { label: 'Status' },
                  { label: 'Aksi', minWidth: 280 },
                ].map(({ label, minWidth }) => (
                  <th key={label}
                    className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 text-left whitespace-nowrap"
                    style={minWidth ? { minWidth } : undefined}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPengajuan.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[13px] text-gray-400">
                    Tidak ada data yang sesuai filter.
                  </td>
                </tr>
              ) : filteredPengajuan.map((item, i) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5">{i + 1}</td>
                  <td className="text-xs font-medium text-gray-900 px-3 py-2.5 whitespace-nowrap">{item.namaPIC}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{item.klien}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{item.program}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{item.periode}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{item.jumlahSesi} sesi</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{item.tglPengajuan}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${statusBadgeCls(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5" style={{ minWidth: 280 }}>
                    <div className="flex items-center gap-2 flex-nowrap">
                      <button className="whitespace-nowrap inline-flex items-center gap-1.5 border border-[#1E1C43] text-[#1E1C43] text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                        <FileText size={12} />Lihat PDF Rekap
                      </button>
                      {item.status === 'Menunggu Review' && (
                        <button
                          onClick={() => setApproveItem(item)}
                          className="whitespace-nowrap inline-flex items-center gap-1.5 bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Check size={12} />Approve &amp; Proses Bayar
                        </button>
                      )}
                      {item.status === 'Sudah Diapprove' && (
                        <span className="whitespace-nowrap inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                          ✓ Approved
                        </span>
                      )}
                      {item.status === 'Ditolak' && (
                        <span className="whitespace-nowrap inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-600">
                          ✗ Ditolak
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

      {/* ── Section 2: Riwayat Rekap Diproses ──────────────────────────── */}
      <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
        <h2 className="text-base font-semibold text-[#1E1C43] mb-1">📋 Riwayat Rekap Diproses</h2>
        <p className="text-xs text-gray-500 mb-4">Rekap yang sudah diapprove dan honorarium sudah diproses</p>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <select value={fBulan2} onChange={e => setFBulan2(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none bg-white focus:border-[#1E1C43]">
            <option value="">Bulan</option>
            {BULAN.map(b => <option key={b}>{b}</option>)}
          </select>
          <select value={fTahun2} onChange={e => setFTahun2(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none bg-white focus:border-[#1E1C43]">
            <option value="">Tahun</option>
            <option>2025</option>
            <option>2026</option>
          </select>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input value={fSearch2} onChange={e => setFSearch2(e.target.value)}
              placeholder="Cari nama PIC..."
              className="border-none outline-none text-[13px] w-full bg-transparent placeholder:text-gray-400" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 1000 }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['No', 'Nama PIC', 'Klien', 'Program', 'Periode', 'Jml Sesi', 'Honorarium', 'Tgl Approve', 'Status Bayar', 'Aksi'].map(h => (
                  <th key={h} className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRiwayat.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-[13px] text-gray-400">
                    Belum ada riwayat rekap yang diproses.
                  </td>
                </tr>
              ) : filteredRiwayat.map((item, i) => (
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
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${statusBayarCls(item.statusBayar)}`}>
                      {item.statusBayar}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => setDetailItem(item)}
                      className="whitespace-nowrap inline-flex items-center gap-1.5 border border-[#1E1C43] text-[#1E1C43] text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FileText size={12} />Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {approveItem && (
        <ApproveModal item={approveItem} onClose={() => setApproveItem(null)} onConfirm={handleApprove} />
      )}
      {detailItem && (
        <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      )}
    </div>
  )
}
