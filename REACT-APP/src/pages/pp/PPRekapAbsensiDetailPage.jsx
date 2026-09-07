import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, CheckCircle, ClipboardList, Upload, X, ExternalLink } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { getOrderById } from '../../data/ppOrdersStore'
import { getStoredPrograms } from '../../data/ppProgramStore'
import { getCompanySettings } from '../../utils/companySettings'
import { formatRp } from '../../data/ppInvoiceData'
import { PIC_DB } from '../../data/ppProgramDBData'

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

  const cs        = getCompanySettings()
  const order     = getOrderById(orderId)
  const programs  = getStoredPrograms()
  const prog      = programs.find(p => p.id === order?.programId)
  const picData   = prog ? (PIC_DB[prog.picId] || null) : null
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


  useEffect(() => {
    setCrumbs?.(['Private Program', 'Rekap Absensi', '#' + rekapId])
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
  const badgeDark  = BADGE_DARK[rekapStatus]  || BADGE_DARK.belum_diajukan
  const badgeLight = BADGE_LIGHT[rekapStatus] || BADGE_LIGHT.belum_diajukan
  const BADGE_SOLID_CLS = {
    belum_diajukan:  'bg-gray-500',
    pengajuan_masuk: 'bg-amber-500',
    dikonfirmasi:    'bg-green-600',
    ditolak:         'bg-red-600',
  }
  const badgeSolidCls = BADGE_SOLID_CLS[rekapStatus] || 'bg-gray-500'

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
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white ${badgeSolidCls}`}>
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
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors shrink-0">
            <ArrowLeft size={13} /> Kembali ke Order #{orderId}
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
      <div id="rekap-print-area">
        <div className="overflow-x-auto pb-2">
          <div className="bg-white rounded-2xl shadow-lg min-w-[660px] max-w-4xl mx-auto w-full overflow-hidden">

            {/* ── Document Header (navy) ── */}
            <div className="bg-[#1E1C43] rounded-t-2xl px-6 py-4 sm:px-8 sm:py-5 grid grid-cols-2 gap-4 text-white">
              {/* Kiri: EFM info */}
              <div className="flex items-start gap-3">
                <img
                  src="/logo.png"
                  alt="EFM Logo"
                  className="w-20 h-20 rounded-full object-contain shrink-0"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
                <div>
                  <p className="text-base font-bold text-white break-words leading-tight">{cs.namaPerusahaan}</p>
                  <p className="text-xs text-white/70 mt-0.5">{cs.namaLegal}</p>
                  <p className="text-xs text-white/70 mt-2 leading-relaxed">{cs.alamat}</p>
                  <p className="text-xs text-white/70 mt-0.5">{cs.email}</p>
                  <p className="text-xs text-white/70">{cs.telepon}</p>
                </div>
              </div>

              {/* Kanan: judul dokumen + info */}
              <div className="text-right flex flex-col justify-between">
                <div>
                  <p className="text-4xl font-black text-white tracking-widest uppercase">REKAP ABSENSI</p>
                  <p className="text-sm text-gray-300 mt-1">{rekapId}</p>
                </div>
                <div className="space-y-0.5 mt-3">
                  <p className="text-[10px] text-white/50">Tgl Pengajuan: <span className="text-white font-semibold">{tglDiajukan}</span></p>
                  <div className="mt-2 flex justify-end">
                    <span className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold ${badgeDark.cls}`}>
                      {badgeDark.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Ditujukan Untuk ── */}
            <div className="px-6 sm:px-8 py-4 border-b border-gray-100">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Ditujukan Untuk</div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <p className="text-[18px] font-bold text-[#1E1C43]">{picData?.fullname || 'Pelatih'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{prog?.namaPaket || prog?.namaProgram || 'Private Training'}</p>
                <p className="text-xs text-gray-400 mt-1.5">
                  Ref Order: <span className="font-semibold text-gray-600">#{orderId}</span>
                  <span className="mx-1.5 text-gray-300">·</span>
                  Klien: <span className="font-semibold text-gray-600">{order.namaKlien}</span>
                </p>
              </div>
              {prog && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 mt-3">
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
            </div>

            {/* ── Daftar Absensi ── */}
            <div className="px-6 sm:px-8 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Daftar Absensi</div>
                <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-2 py-1 rounded font-semibold uppercase tracking-wide">
                  Sumber sistem · Read Only
                </span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
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
                          {a.fotoUrl
                            ? <a href={a.fotoUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
                                <ExternalLink size={11} /> Lihat Foto
                              </a>
                            : <span className="text-xs text-gray-400">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Rincian Honorarium ── */}
            <div className="px-6 sm:px-8 py-4 border-b border-gray-100">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Rincian Honorarium</div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      {['Deskripsi Layanan', 'Jumlah Sesi', 'Rate / Sesi', 'Total'].map((h, i) => (
                        <th key={h} className={`text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap ${i > 0 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700">{prog?.namaPaket || prog?.namaProgram || 'Private Training'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">{absensiSesi.length} sesi</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">{formatRp(ratePerSesi)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-[#1E1C43] text-right">{formatRp(totalHon)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-[#1E1C43] rounded-xl mt-3 px-4 py-2.5 flex justify-between items-center">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Total Honorarium</span>
                <span className="text-base font-black text-white">{formatRp(totalHon)}</span>
              </div>
            </div>

            {/* ── Tanda Tangan ── */}
            <div className="px-6 sm:px-8 py-4">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-4">Tanda Tangan</div>
              <div className="grid grid-cols-2 gap-5">

                {/* Pelatih TTD */}
                <div className="border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Pelatih</p>
                  <PicSig uploaded={!!fileNamaTTD} />
                  <div className="border-t border-gray-100 mt-2 pt-3">
                    <p className="text-xs font-semibold text-gray-700">{picData?.fullname || 'Pelatih'}</p>
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
                <div className="border border-gray-200 rounded-xl p-4 text-center">
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
                    <p className="text-[10px] text-gray-400 mt-0.5">{cs.namaLegal}</p>
                  </div>
                </div>
              </div>

              {/* Alert ditolak */}
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

            {/* ── Document footer ── */}
            <div className="px-6 sm:px-8 py-4 border-t border-gray-100 text-center space-y-1">
              <p className="text-xs text-gray-500">Terima kasih atas kepercayaan Anda.</p>
              <p className="text-xs font-semibold text-gray-500">
                Powered by {cs.namaPerusahaan}&nbsp;&nbsp;|&nbsp;&nbsp;{cs.namaLegal}
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
