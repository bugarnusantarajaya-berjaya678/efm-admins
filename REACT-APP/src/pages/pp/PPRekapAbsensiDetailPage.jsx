import { useState, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, CheckCircle, ClipboardList, AlertTriangle, Upload, X, ExternalLink } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { getOrderById } from '../../data/ppOrdersStore'
import { getStoredPrograms } from '../../data/ppProgramStore'

/* ── localStorage helpers ── */
function loadRekap(orderId) {
  try { return JSON.parse(localStorage.getItem(`rekap-pp-${orderId}`)) || {} } catch { return {} }
}
function saveRekap(orderId, updates) {
  const next = { ...loadRekap(orderId), ...updates }
  localStorage.setItem(`rekap-pp-${orderId}`, JSON.stringify(next))
}

/* ── PIC TTD visual ── */
function PicSig({ uploaded }) {
  if (uploaded) {
    return (
      <div className="h-[72px] border border-green-200 rounded-xl flex items-center justify-center bg-green-50 mb-2">
        <svg viewBox="0 0 160 48" width="120" height="36">
          <path d="M8,38 C18,14 28,44 42,22 C52,6 60,40 76,18 C88,4 96,36 112,16 C122,6 132,32 152,20"
            fill="none" stroke="#27AE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M30,42 C40,38 50,44 60,40" fill="none" stroke="#27AE60" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }
  return (
    <div className="h-[72px] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 mb-2">
      <div className="text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" width="20" height="20" className="mx-auto mb-1">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        <div className="text-[10px] font-semibold text-gray-400">Menunggu Upload File</div>
      </div>
    </div>
  )
}

/* ── EFM Admin TTD ── */
function EfmSig() {
  return (
    <svg viewBox="0 0 160 48" width="120" height="36">
      <path d="M10,36 C20,10 30,40 45,20 C55,6 65,38 80,22 C90,10 100,34 115,18 C125,8 135,30 150,24"
        fill="none" stroke="#1E1C43" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
function fmtWaktu() {
  const d = new Date()
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}

export default function PPRekapAbsensiDetailPage() {
  const { orderId } = useParams()
  const { state }   = useLocation()
  const navigate    = useNavigate()

  const { setCrumbs } = useBreadcrumb()

  const order      = getOrderById(orderId)
  const programs   = getStoredPrograms()
  const prog       = programs.find(p => p.id === order?.programId)
  const ratePerSesi = prog ? (prog.biayaSesiPIC || 0) : 0

  const absensiSesi = state?.absensiSesi || []
  const totalHon    = absensiSesi.length * ratePerSesi
  const rekapId     = 'RKP-' + orderId

  /* ── state dari localStorage ── */
  const init = loadRekap(orderId)
  const [rekapStatus,    setRekapStatus]    = useState(init.status          || 'pengajuan_masuk')
  const [fileNamaTTD,    setFileNamaTTD]    = useState(init.fileNamaTTD     || `rekap-absensi-${orderId}-nov2026.pdf`)
  const [tglDiajukan]                       = useState(init.tglDiajukan     || '8 Nov 2026')
  const [catatanTolak,   setCatatanTolak]   = useState(init.catatanTolak   || '')
  const [showTolakForm,  setShowTolakForm]  = useState(false)
  const [honStatus,      setHonStatus]      = useState(init.honorariumStatus || 'menunggu_bayar')
  const [buktiBayar,     setBuktiBayar]     = useState(init.buktiBayarNama  || null)
  const [tglBayar,       setTglBayar]       = useState(init.tglBayar        || null)

  const paymentRef = useRef(null)

  /* breadcrumb */
  useBreadcrumb && setCrumbs?.(['Private Program', 'Orders', orderId, 'Rekap Absensi'])

  /* ── action helpers ── */
  function doApprove() {
    const tgl = fmtWaktu()
    setRekapStatus('dikonfirmasi')
    saveRekap(orderId, { status: 'dikonfirmasi', tglKonfirmasi: tgl })
  }
  function doTolak() {
    setRekapStatus('ditolak')
    setShowTolakForm(false)
    saveRekap(orderId, { status: 'ditolak', catatanTolak })
  }
  function doKembalikanKePengajuan() {
    setRekapStatus('pengajuan_masuk')
    setCatatanTolak('')
    saveRekap(orderId, { status: 'pengajuan_masuk', catatanTolak: '' })
  }
  function doUploadTTD(file) {
    setFileNamaTTD(file.name)
    saveRekap(orderId, { fileNamaTTD: file.name })
  }
  function doUploadBukti(file) {
    const tgl = fmtWaktu()
    setBuktiBayar(file.name)
    setTglBayar(tgl)
    setHonStatus('sudah_bayar')
    saveRekap(orderId, { honorariumStatus: 'sudah_bayar', buktiBayarNama: file.name, tglBayar: tgl })
  }

  const BADGE = {
    belum_diajukan:  { label: 'Belum Diajukan',  cls: 'bg-gray-50 text-gray-500 border-gray-200' },
    pengajuan_masuk: { label: 'Pengajuan Masuk',  cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    dikonfirmasi:    { label: 'Dikonfirmasi',     cls: 'bg-green-50 text-green-700 border-green-200' },
    ditolak:         { label: 'Ditolak',          cls: 'bg-red-50 text-red-700 border-red-200' },
  }
  const badge = BADGE[rekapStatus] || BADGE.belum_diajukan

  if (!order) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <button onClick={() => navigate('/pp/orders')}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors">
            <ArrowLeft size={13} /> Kembali ke Orders
          </button>
        </div>
        <div className="text-center py-20 text-gray-400">Order tidak ditemukan.</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-8">

      {/* ── Header (pola 3d) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-10 h-10 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
            <ClipboardList size={16} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Rekap Absensi PP</p>
            <h1 className="text-base font-bold text-[#1E1C43] leading-snug">#{rekapId}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-gray-500">{order.namaKlien}</span>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-xs text-gray-500">Order #{orderId}</span>
              <span className="text-gray-300 text-xs">·</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badge.cls}`}>
                {badge.label}
              </span>
            </div>
          </div>

          {/* Tombol aksi — sesuai status */}
          {rekapStatus === 'pengajuan_masuk' && (
            <button onClick={doApprove}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold rounded-lg transition-colors shrink-0">
              <CheckCircle size={13} /> Approve Rekap
            </button>
          )}
          {rekapStatus === 'pengajuan_masuk' && !showTolakForm && (
            <button onClick={() => setShowTolakForm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors shrink-0">
              <X size={13} /> Tolak
            </button>
          )}
          {rekapStatus === 'dikonfirmasi' && honStatus === 'menunggu_bayar' && (
            <button onClick={() => paymentRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold rounded-lg transition-colors shrink-0">
              Bayar Honorarium
            </button>
          )}
          {rekapStatus === 'ditolak' && (
            <button onClick={doKembalikanKePengajuan}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors shrink-0">
              Kembalikan ke Pengajuan
            </button>
          )}
          <button onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors shrink-0">
            <Download size={13} /> Download PDF
          </button>
          <button onClick={() => navigate('/pp/orders/' + orderId, { state: { defaultTab: 'operasional' } })}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors shrink-0">
            <ArrowLeft size={13} /> Kembali ke Order
          </button>
        </div>

        {/* Tolak form inline di bawah header */}
        {showTolakForm && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-red-700">Catatan Penolakan</p>
            <textarea value={catatanTolak} onChange={e => setCatatanTolak(e.target.value)}
              placeholder="Jelaskan alasan penolakan rekap ini..."
              rows={3}
              className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-red-400 resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTolakForm(false)}
                className="h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button onClick={doTolak}
                className="h-8 px-3 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors">
                Kirim Penolakan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 1: Informasi Rekap ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Informasi Rekap</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['Diajukan oleh', prog?.pic?.nama || 'Pelatih'],
            ['Tgl Pengajuan', tglDiajukan],
            ['Total Sesi',    `${absensiSesi.length} sesi`],
            ['Total Honorarium', 'Rp ' + totalHon.toLocaleString('id-ID')],
          ].map(([label, val]) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-sm font-semibold text-gray-800">{val}</p>
            </div>
          ))}
        </div>

        {/* Alert status */}
        {rekapStatus === 'pengajuan_masuk' && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700">Rekap masuk dari pelatih. Verifikasi daftar absensi dan TTD di bawah sebelum approve.</p>
          </div>
        )}
        {rekapStatus === 'dikonfirmasi' && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <CheckCircle size={14} className="text-green-600 shrink-0" />
            <p className="text-xs text-green-700 font-medium">Rekap dikonfirmasi oleh Admin EFM. Lanjutkan proses pembayaran honorarium.</p>
          </div>
        )}
        {rekapStatus === 'ditolak' && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <X size={14} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-700">Rekap Ditolak</p>
              {catatanTolak && <p className="text-xs text-red-600 mt-0.5">{catatanTolak}</p>}
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: Daftar Absensi (read-only) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Daftar Absensi</h3>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 border border-gray-200 px-2 py-1 rounded">
            Sumber: sistem backend pelatih · read only
          </span>
        </div>

        {/* progress */}
        {prog && (
          <div className="mb-4 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-gray-600 font-medium">{absensiSesi.length}/{prog.totalSesi || 12} sesi terlaksana</span>
              <span className="text-xs font-semibold text-gray-700">
                {Math.min(100, Math.round((absensiSesi.length / (prog.totalSesi || 12)) * 100))}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[#1E1C43] transition-all"
                style={{ width: Math.min(100, Math.round((absensiSesi.length / (prog.totalSesi || 12)) * 100)) + '%' }} />
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: '660px' }}>
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['No', 'Tanggal', 'Jam Masuk', 'Lokasi', 'Device', 'Foto Bukti'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {absensiSesi.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">Tidak ada data absensi.</td></tr>
              )}
              {absensiSesi.map((a, i) => (
                <tr key={a.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{a.tanggal}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#1E1C43] font-mono whitespace-nowrap">{a.jam}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{a.lokasi || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{a.device || '—'}</td>
                  <td className="px-4 py-3">
                    {a.foto
                      ? <span className="flex items-center gap-1 text-xs text-green-700 font-medium"><CheckCircle size={12} /> Ada</span>
                      : <span className="text-xs text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 3: File Rekap & TTD Pelatih ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">File Rekap & TTD Pelatih</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Kiri: TTD Pelatih */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Tanda Tangan Pelatih</p>
            <PicSig uploaded={!!fileNamaTTD} />
            <p className="text-[10px] text-gray-400 text-center">
              {prog?.pic?.nama || 'Pelatih'} · {fileNamaTTD ? 'Terverifikasi' : 'Menunggu Upload'}
            </p>
          </div>

          {/* Kanan: TTD Admin EFM */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Konfirmasi Admin EFM</p>
            {rekapStatus === 'dikonfirmasi' ? (
              <>
                <div className="h-[72px] border border-[#1E1C43]/20 rounded-xl flex items-center justify-center bg-[#1E1C43]/5 mb-2">
                  <EfmSig />
                </div>
                <p className="text-[10px] text-gray-400 text-center">Admin EFM · Dikonfirmasi</p>
              </>
            ) : (
              <div className="h-[72px] border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 mb-2">
                <p className="text-[10px] font-semibold text-gray-400">Menunggu Konfirmasi Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* File upload & preview */}
        <div className="mt-5 space-y-3">
          {fileNamaTTD ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <CheckCircle size={15} className="text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-800">File Rekap Terupload</p>
                <p className="text-xs text-green-700 mt-0.5 truncate">{fileNamaTTD} · 8 Nov 2026 14:32</p>
              </div>
              <button className="text-xs text-green-700 font-semibold flex items-center gap-1 hover:underline shrink-0">
                <Download size={12} /> Lihat File
              </button>
            </div>
          ) : (
            <label className="cursor-pointer flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-[#1E1C43]/30 transition-colors">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <Upload size={16} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-[#1E1C43] font-semibold">Upload File Rekap Bertanda Tangan PIC</span>
                <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG · Maks 5MB</p>
              </div>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                onChange={e => { if (e.target.files[0]) doUploadTTD(e.target.files[0]) }} />
            </label>
          )}
        </div>
      </div>

      {/* ── Section 4: Pembayaran Honorarium ── */}
      <div ref={paymentRef}
        className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${rekapStatus !== 'dikonfirmasi' ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Pembayaran Honorarium</h3>
          {rekapStatus === 'dikonfirmasi' && (
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${
              honStatus === 'sudah_bayar' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {honStatus === 'sudah_bayar' ? '✓ Sudah Dibayar' : 'Menunggu Bayar'}
            </span>
          )}
          {rekapStatus !== 'dikonfirmasi' && (
            <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-gray-100 text-gray-400 border border-gray-200">
              Terkunci — selesaikan rekap dulu
            </span>
          )}
        </div>

        {/* Kalkulasi */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {[
            ['Sesi Terkonfirmasi', `${absensiSesi.length} sesi`],
            ['Rate / Sesi',        'Rp ' + ratePerSesi.toLocaleString('id-ID')],
            ['Total Honorarium',   'Rp ' + totalHon.toLocaleString('id-ID')],
          ].map(([label, val]) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</p>
              <p className={`text-sm font-semibold ${label === 'Total Honorarium' ? 'text-[#1E1C43]' : 'text-gray-800'}`}>{val}</p>
            </div>
          ))}
        </div>

        {honStatus === 'menunggu_bayar' ? (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700">Transfer honorarium ke rekening pelatih, lalu upload bukti pembayaran di bawah.</p>
            </div>
            <label className="cursor-pointer flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-[#1E1C43]/30 transition-colors">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <Upload size={16} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <span className="text-xs text-[#1E1C43] font-semibold">Upload Bukti Pembayaran Honorarium</span>
                <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG · Maks 5MB</p>
              </div>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                onChange={e => { if (e.target.files[0]) doUploadBukti(e.target.files[0]) }} />
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <CheckCircle size={15} className="text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-800">Honorarium Sudah Dibayar</p>
                {buktiBayar && <p className="text-xs text-green-700 mt-0.5 truncate">{buktiBayar} · {tglBayar}</p>}
              </div>
              <button className="text-xs text-green-700 font-semibold flex items-center gap-1 hover:underline shrink-0">
                <Download size={12} /> Lihat Bukti
              </button>
            </div>
            {/* Total strip */}
            <div className="bg-[#1E1C43] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wide">Total Honorarium Dibayarkan</span>
              <span className="text-base font-black text-white">Rp {totalHon.toLocaleString('id-ID')}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="text-center space-y-1 py-2">
        <p className="text-xs text-gray-400">Dokumen rekap ini digunakan sebagai dasar pembayaran honorarium pelatih.</p>
        <p className="text-xs font-semibold text-gray-500">#{rekapId} · Order #{orderId}</p>
      </div>

    </div>
  )
}
