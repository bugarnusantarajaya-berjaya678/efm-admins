import { useState, useRef, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, CheckCircle, ClipboardList, AlertTriangle, Upload, X } from 'lucide-react'
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
      <div className="flex items-center justify-center h-16">
        <svg viewBox="0 0 160 48" width="120" height="36">
          <path d="M8,38 C18,14 28,44 42,22 C52,6 60,40 76,18 C88,4 96,36 112,16 C122,6 132,32 152,20"
            fill="none" stroke="#27AE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M30,42 C40,38 50,44 60,40" fill="none" stroke="#27AE60" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center h-16">
      <p className="text-xs text-gray-400 italic">Menunggu upload</p>
    </div>
  )
}

/* ── EFM Admin TTD visual ── */
function EfmSig() {
  return (
    <div className="flex items-center justify-center h-16">
      <svg viewBox="0 0 160 48" width="120" height="36">
        <path d="M10,36 C20,10 30,40 45,20 C55,6 65,38 80,22 C90,10 100,34 115,18 C125,8 135,30 150,24"
          fill="none" stroke="#1E1C43" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
function fmtWaktu() {
  const d = new Date()
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}

const BADGE_DARK = {
  belum_diajukan:  { label: 'Belum Diajukan',  cls: 'bg-gray-400/30 text-gray-200 border-gray-400/30' },
  pengajuan_masuk: { label: 'Pengajuan Masuk',  cls: 'bg-yellow-400 text-yellow-900 border-yellow-400' },
  dikonfirmasi:    { label: 'Dikonfirmasi',     cls: 'bg-green-400 text-green-900 border-green-400' },
  ditolak:         { label: 'Ditolak',          cls: 'bg-red-400 text-red-900 border-red-400' },
}
const BADGE_LIGHT = {
  belum_diajukan:  { label: 'Belum Diajukan',  cls: 'bg-gray-50 text-gray-500 border-gray-200' },
  pengajuan_masuk: { label: 'Pengajuan Masuk',  cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  dikonfirmasi:    { label: 'Dikonfirmasi',     cls: 'bg-green-50 text-green-700 border-green-200' },
  ditolak:         { label: 'Ditolak',          cls: 'bg-red-50 text-red-700 border-red-200' },
}

export default function PPRekapAbsensiDetailPage() {
  const { orderId } = useParams()
  const { state }   = useLocation()
  const navigate    = useNavigate()
  const { setCrumbs } = useBreadcrumb()

  const order       = getOrderById(orderId)
  const programs    = getStoredPrograms()
  const prog        = programs.find(p => p.id === order?.programId)
  const ratePerSesi = prog ? (prog.biayaSesiPIC || 0) : 0

  const absensiSesi = state?.absensiSesi || []
  const totalHon    = absensiSesi.length * ratePerSesi
  const rekapId     = 'RKP-' + orderId

  const init = loadRekap(orderId)
  const [rekapStatus,   setRekapStatus]   = useState(init.status           || 'pengajuan_masuk')
  const [fileNamaTTD,   setFileNamaTTD]   = useState(init.fileNamaTTD      || `rekap-absensi-${orderId}-nov2026.pdf`)
  const [tglDiajukan]                     = useState(init.tglDiajukan      || '8 Nov 2026')
  const [catatanTolak,  setCatatanTolak]  = useState(init.catatanTolak    || '')
  const [showTolakForm, setShowTolakForm] = useState(false)
  const [honStatus,     setHonStatus]     = useState(init.honorariumStatus || 'menunggu_bayar')
  const [buktiBayar,    setBuktiBayar]    = useState(init.buktiBayarNama   || null)
  const [tglBayar,      setTglBayar]      = useState(init.tglBayar         || null)

  const paymentRef = useRef(null)

  useEffect(() => {
    setCrumbs?.(['Private Program', 'Orders', orderId, 'Rekap Absensi'])
    return () => setCrumbs?.(null)
  }, [orderId])

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

  const badgeDark  = BADGE_DARK[rekapStatus]  || BADGE_DARK.belum_diajukan
  const badgeLight = BADGE_LIGHT[rekapStatus] || BADGE_LIGHT.belum_diajukan

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

      {/* Print CSS — hide admin bar & payment section, isolate document */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #rekap-print-area, #rekap-print-area * { visibility: visible; }
          #rekap-print-area {
            position: absolute; left: 0; top: 0; width: 100%;
            border: none !important; border-radius: 0 !important; box-shadow: none !important;
          }
        }
      `}</style>

      {/* ── Admin Action Bar (non-printable) ── */}
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
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeLight.cls}`}>
                {badgeLight.label}
              </span>
            </div>
          </div>

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

        {/* Tolak form inline */}
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

      {/* ══════════════════════════════════════════════
          DOKUMEN REKAP — print-ready area
      ══════════════════════════════════════════════ */}
      <div id="rekap-print-area" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* ── Document Header (navy — sama pola invoice) ── */}
        <div className="bg-[#1E1C43] px-6 py-5 grid grid-cols-2 gap-4">
          {/* Kiri: EFM info */}
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 36 36" fill="none" width="28" height="28">
                <rect x="3" y="16" width="6" height="4" rx="1" fill="white"/>
                <rect x="27" y="16" width="6" height="4" rx="1" fill="white"/>
                <rect x="7" y="14" width="4" height="8" rx="1.5" fill="white"/>
                <rect x="25" y="14" width="4" height="8" rx="1.5" fill="white"/>
                <rect x="11" y="17" width="14" height="2" rx="1" fill="white"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Essential Fitness Management</p>
              <p className="text-[10px] text-white/60 mt-0.5">CV. Bugar Nusantara Jaya</p>
              <p className="text-[10px] text-white/50 mt-2 leading-relaxed">
                Jl. Terogong Raya No. 18, Hampton&apos;s Park Apartment,<br/>
                Tower A, Cilandak Barat, Jakarta Selatan
              </p>
              <p className="text-[10px] text-white/50 mt-0.5">essentialfitnessmanagement@gmail.com</p>
              <p className="text-[10px] text-white/50">+62 811-1992-0666</p>
            </div>
          </div>

          {/* Kanan: judul dokumen + info */}
          <div className="text-right flex flex-col justify-between">
            <div>
              <p className="text-4xl font-black text-white tracking-widest">REKAP ABSENSI</p>
              <p className="text-xs font-semibold text-white/70 mt-1">{rekapId}</p>
            </div>
            <div className="space-y-0.5 mt-3">
              <p className="text-[10px] text-white/50">
                Tgl Pengajuan: <span className="text-white/85 font-bold">{tglDiajukan}</span>
              </p>
              <p className="text-[10px] text-white/50">
                Order: <span className="text-white/85 font-bold">#{orderId}</span>
              </p>
              <p className="text-[10px] text-white/50">
                Klien: <span className="text-white/85 font-bold">{order.namaKlien}</span>
              </p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${badgeDark.cls}`}>
                  {badgeDark.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Document body ── */}
        <div className="p-6 space-y-6">

          {/* Ditujukan untuk — Pelatih info */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Ditujukan Untuk</p>
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <p className="text-base font-bold text-[#1E1C43]">{prog?.pic?.nama || 'Pelatih'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{prog?.namaPaket || prog?.namaProgram || 'Private Training'}</p>
              <p className="text-xs text-gray-400 mt-1.5">
                Ref Order: <span className="font-semibold text-gray-600">#{orderId}</span>
                <span className="mx-1.5 text-gray-300">·</span>
                Klien: <span className="font-semibold text-gray-600">{order.namaKlien}</span>
              </p>
            </div>
          </div>

          {/* Progress sesi */}
          {prog && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-600 font-medium">{absensiSesi.length} dari {prog.totalSesi || 12} sesi terlaksana</span>
                <span className="text-xs font-bold text-[#1E1C43]">
                  {Math.min(100, Math.round((absensiSesi.length / (prog.totalSesi || 12)) * 100))}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#1E1C43] transition-all"
                  style={{ width: Math.min(100, Math.round((absensiSesi.length / (prog.totalSesi || 12)) * 100)) + '%' }} />
              </div>
            </div>
          )}

          {/* ── Daftar Absensi ── */}
          <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Daftar Absensi</h3>
              <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-2 py-1 rounded font-semibold uppercase tracking-wide">
                Sumber sistem · Read Only
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full" style={{ minWidth: '560px' }}>
                <thead>
                  <tr className="bg-[#1E1C43]">
                    {['No', 'Tanggal', 'Jam Masuk', 'Lokasi', 'Device', 'Foto Bukti'].map(h => (
                      <th key={h} className="text-left text-[10px] font-semibold text-white/70 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {absensiSesi.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">Tidak ada data absensi.</td></tr>
                  )}
                  {absensiSesi.map((a, i) => (
                    <tr key={a.id} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                      <td className="px-4 py-2.5 text-xs font-semibold text-gray-700 whitespace-nowrap">{a.tanggal}</td>
                      <td className="px-4 py-2.5 text-xs font-bold text-[#1E1C43] font-mono whitespace-nowrap">{a.jam}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-600">{a.lokasi || '—'}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{a.device || '—'}</td>
                      <td className="px-4 py-2.5">
                        {a.foto
                          ? <span className="flex items-center gap-1 text-xs text-green-700 font-medium"><CheckCircle size={11} /> Ada</span>
                          : <span className="text-xs text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Rincian Honorarium ── */}
          <div>
            <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-3">Rincian Honorarium</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Deskripsi Layanan', 'Jumlah Sesi', 'Rate / Sesi', 'Total'].map(h => (
                      <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{prog?.namaPaket || prog?.namaProgram || 'Private Training'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">{absensiSesi.length} sesi</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Rp {ratePerSesi.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[#1E1C43]">Rp {totalHon.toLocaleString('id-ID')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-[#1E1C43] rounded-xl mt-2 px-5 py-3 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Total Honorarium</span>
              <span className="text-lg font-black text-white">Rp {totalHon.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* ── Tanda Tangan ── */}
          <div>
            <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Tanda Tangan</h3>
            <div className="grid grid-cols-2 gap-5">

              {/* Pelatih TTD */}
              <div className="border border-gray-100 rounded-xl p-4 text-center">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Pelatih</p>
                <PicSig uploaded={!!fileNamaTTD} />
                <div className="border-t border-gray-100 mt-2 pt-3">
                  <p className="text-xs font-semibold text-gray-700">{prog?.pic?.nama || 'Pelatih'}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Personal Trainer</p>
                </div>
                {!fileNamaTTD ? (
                  <label className="mt-2 cursor-pointer inline-flex items-center gap-1 text-[10px] text-[#1E1C43] font-semibold hover:underline">
                    <Upload size={10} /> Upload TTD
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                      onChange={e => { if (e.target.files[0]) doUploadTTD(e.target.files[0]) }} />
                  </label>
                ) : (
                  <p className="mt-1 text-[10px] text-green-600 font-semibold">✓ Terverifikasi</p>
                )}
              </div>

              {/* Admin EFM TTD */}
              <div className="border border-gray-100 rounded-xl p-4 text-center">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Mengetahui, Admin EFM</p>
                {rekapStatus === 'dikonfirmasi' ? (
                  <EfmSig />
                ) : (
                  <div className="h-16 flex items-center justify-center">
                    <p className="text-xs text-gray-400 italic">Menunggu konfirmasi admin</p>
                  </div>
                )}
                <div className="border-t border-gray-100 mt-2 pt-3">
                  <p className="text-xs font-semibold text-gray-700">Admin EFM</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">CV. Bugar Nusantara Jaya</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alert ditolak */}
          {rekapStatus === 'ditolak' && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <X size={14} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-700">Rekap Ditolak</p>
                {catatanTolak && <p className="text-xs text-red-600 mt-0.5">{catatanTolak}</p>}
              </div>
            </div>
          )}
        </div>

        {/* ── Document footer ── */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex items-center justify-between">
          <p className="text-[10px] text-gray-400">Dokumen rekap ini digunakan sebagai dasar pembayaran honorarium pelatih.</p>
          <p className="text-[10px] font-semibold text-gray-400">#{rekapId} · Order #{orderId}</p>
        </div>
      </div>

      {/* ── Pembayaran Honorarium (admin only, non-printable) ── */}
      <div ref={paymentRef}
        className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${rekapStatus !== 'dikonfirmasi' ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Pembayaran Honorarium</h3>
          {rekapStatus === 'dikonfirmasi' ? (
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${
              honStatus === 'sudah_bayar' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {honStatus === 'sudah_bayar' ? '✓ Sudah Dibayar' : 'Menunggu Bayar'}
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-gray-100 text-gray-400 border border-gray-200">
              Terkunci — selesaikan rekap dulu
            </span>
          )}
        </div>

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
            <div className="bg-[#1E1C43] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wide">Total Honorarium Dibayarkan</span>
              <span className="text-base font-black text-white">Rp {totalHon.toLocaleString('id-ID')}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
