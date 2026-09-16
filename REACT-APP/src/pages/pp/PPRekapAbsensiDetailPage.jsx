import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, CheckCircle, ClipboardList, Upload, X, ExternalLink } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { getOrderById } from '../../data/ppOrdersStore'
import { getStoredPrograms } from '../../data/ppProgramStore'
import { getCompanySettings } from '../../utils/companySettings'
import { formatRp } from '../../data/ppInvoiceData'
import { PIC_DB } from '../../data/ppProgramDBData'

/* ── Per-order absensi seed (for direct URL access without navigation state) ── */
const ABSENSI_SEED = {
  'PP-27-0004': [
    { id:"ABS-001", jadwalId:"JS-Z01", tanggal:"2027-01-16", jam:"08:03", lokasi:"Cluster Bukit Indah, Cilandak, Jakarta Selatan", device:"iPhone 15 Pro - Safari",        fotoUrl:"https://drive.google.com/file/d/1Z2mKqXRA5nFMdKvBdBZjgm001zumba/view?usp=drive_link", catatanKoreksi:"" },
    { id:"ABS-002", jadwalId:"JS-Z02", tanggal:"2027-01-17", jam:"08:00", lokasi:"Cluster Bukit Indah, Cilandak, Jakarta Selatan", device:"Samsung Galaxy S24 - Chrome", fotoUrl:"https://drive.google.com/file/d/1Z2mKqXRA5nFMdKvBdBZjgm002zumba/view?usp=drive_link", catatanKoreksi:"" },
    { id:"ABS-003", jadwalId:"JS-Z03", tanggal:"2027-01-23", jam:"08:01", lokasi:"Cluster Bukit Indah, Cilandak, Jakarta Selatan", device:"iPhone 15 Pro - Safari",        fotoUrl:"https://drive.google.com/file/d/1Z2mKqXRA5nFMdKvBdBZjgm003zumba/view?usp=drive_link", catatanKoreksi:"" },
  ],
}

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
  const picData   = Object.values(PIC_DB).find(p => p.fullname === order?.picOpsEFM) || null
  const ratePerSesi = picData?.biayaSesi || (prog?.biayaSesiPIC || 0)

  const absensiSesi = state?.absensiSesi || init.absensiSesi || ABSENSI_SEED[orderId] || []
  const totalHon    = absensiSesi.length * ratePerSesi
  const rekapId     = 'RKP-' + orderId

  const init = loadRekap(orderId)
  const [rekapStatus,   setRekapStatus]   = useState(init.status           || 'pengajuan_masuk')
  const [fileNamaTTD,   setFileNamaTTD]   = useState(init.fileNamaTTD      || `rekap-absensi-${orderId}-nov2026.pdf`)
  const [tglDiajukan]                     = useState(init.tglDiajukan      || '8 Nov 2026')
  const [catatanTolak,  setCatatanTolak]  = useState(init.catatanTolak    || '')
  const [showTolakForm, setShowTolakForm] = useState(false)
  const honStatus   = init.honorariumStatus || 'menunggu_bayar'
  const buktiBayar  = init.buktiBayarNama  || null
  const tglBayar    = init.tglBayar        || null
  const metodeBayar = init.metodeBayar     || null

  const [showApproveModal, setShowApproveModal] = useState(false)
  const [tglKonfirmasi,    setTglKonfirmasi]    = useState(init.tglKonfirmasi || null)
  const [efmSignature,     setEfmSignature]     = useState(init.efmSignature  || '')
  const [approvedBy,       setApprovedBy]       = useState(init.approvedBy    || '')


  useEffect(() => {
    setCrumbs?.(['Private Program', 'Rekap Absensi', rekapId])
    return () => setCrumbs?.(null)
  }, [orderId])

  function doApprove() {
    const tgl = fmtWaktu()
    const sig = cs.tandaTanganCEO || ''
    const by  = cs.namaPenandatangan || 'Admin EFM'
    setRekapStatus('dikonfirmasi')
    setTglKonfirmasi(tgl)
    setEfmSignature(sig)
    setApprovedBy(by)
    setShowApproveModal(false)
    saveRekap(orderId, {
      status: 'dikonfirmasi',
      tglKonfirmasi: tgl,
      efmSignature: sig,
      approvedBy: by,
      approvedDevice: 'Web Dashboard EFM',
    })
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
    <div className="flex flex-col gap-4 pb-24">

      {/* Print CSS — isolate rekap document, hide admin chrome */}
      <style>{`
        @media print {
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden; }
          #rkp-print-area, #rkp-print-area * { visibility: visible; }
          #rkp-print-area {
            position: absolute; left: 0; top: 0; width: 100%;
            overflow: visible !important;
            padding: 0 !important;
            background: white !important;
            margin: 0 !important;
          }
          #rkp-print-area > div {
            width: 100% !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
            background: white !important;
          }
          #rkp-print-area > div * { overflow: visible !important; }

          #rkp-hdr {
            grid-template-columns: 1.5fr 1fr !important;
            padding: 1rem 1.25rem !important;
          }
          #rkp-hdr-right { text-align: right !important; }
          .rkp-sec { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
          #rkp-pelatih-grid { grid-template-columns: repeat(4, 1fr) !important; }

          * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          @page { margin: 5mm; size: A4 portrait; }
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
            <h1 className="text-base font-bold text-[#1E1C43] leading-snug">{rekapId}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-gray-500">{order.namaKlien}</span>
              <span className="text-gray-300 text-xs">·</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white ${badgeSolidCls}`}>
                {badgeLight.label}
              </span>
            </div>
          </div>

          {rekapStatus === 'pengajuan_masuk' && (
            <button onClick={() => setShowApproveModal(true)}
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
          <button onClick={() => { const _p = document.title; document.title = `${orderId}_RekapAbsensi_${(order?.namaKlien||'').replace(/\s+/g,'')}`; window.print(); setTimeout(() => { document.title = _p }, 500) }}
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
      <div id="rkp-print-area" className="overflow-x-auto">
        <div className="bg-white rounded-2xl border border-gray-200 min-w-[660px] max-w-[794px] mx-auto w-full overflow-hidden">

            {/* ── Document Header (navy) ── */}
            <div id="rkp-hdr" className="bg-[#1E1C43] rounded-t-2xl px-6 py-4 sm:px-8 sm:py-5 grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-4 text-white">
              {/* Kiri: EFM info */}
              <div className="flex items-start gap-3">
                {cs.logoPerusahaan ? (
                  <img src={cs.logoPerusahaan} alt="EFM Logo" className="w-14 h-14 rounded-full object-contain shrink-0" />
                ) : (
                  <img src="/logo.png" alt="EFM Logo" className="w-14 h-14 rounded-full object-cover shrink-0" onError={e => { e.target.style.display = 'none' }} />
                )}
                <div className="min-w-0 overflow-hidden">
                  <p className="text-base font-bold break-words leading-snug">{cs.namaPerusahaan}</p>
                  <p className="text-xs text-white/70 mt-0.5 break-words">{cs.namaLegal}</p>
                  <p className="text-xs text-white/70 mt-0.5 leading-relaxed break-words">
                    {cs.alamat
                      .replace(', Tower A,', ',\nTower A,')
                      .split('\n')
                      .map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}
                  </p>
                  <p className="text-xs text-white/70 mt-0.5 break-all">{cs.email}</p>
                  <p className="text-xs text-white/70 mt-0.5">{cs.telepon}</p>
                </div>
              </div>

              {/* Kanan: judul dokumen + info */}
              <div id="rkp-hdr-right" className="text-left sm:text-right">
                <div className="text-2xl sm:text-4xl font-black tracking-widest uppercase">REKAP ABSENSI</div>
                <div className="text-sm text-gray-300 mt-0.5">{rekapId}</div>

                <div className="flex justify-start sm:justify-end items-center gap-2 mb-0.5 mt-0.5">
                  <span className="text-xs text-gray-400">Tgl Pengajuan:</span>
                  <span className="font-semibold text-sm">{tglDiajukan}</span>
                </div>

                <span className={`px-4 py-1 rounded-full text-white text-sm font-semibold inline-block mt-0.5 ${badgeSolidCls}`}>
                  {badgeLight.label}
                </span>
              </div>
            </div>

            {/* ── Ditujukan Untuk ── */}
            <div className="rkp-sec px-6 sm:px-8 py-4 border-b border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 pb-2 mb-3">Ditujukan Untuk</p>
              <div id="rkp-pelatih-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Pelatih</p>
                  <p className="text-[11px] font-semibold text-[#1E1C43]">{picData?.fullname || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Program</p>
                  <p className="text-[11px] font-semibold text-[#1E1C43]">{prog?.namaPaket || prog?.namaProgram || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Ref Order</p>
                  <p className="text-[11px] font-semibold text-[#1E1C43]">#{orderId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Klien</p>
                  <p className="text-[11px] font-semibold text-[#1E1C43]">{order.namaKlien}</p>
                </div>
              </div>
              {prog && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 mt-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-gray-600 font-medium">{absensiSesi.length} dari {prog.sesi || order?.sesiTotal || 12} sesi terlaksana</span>
                    <span className="text-xs font-bold text-[#1E1C43]">
                      {Math.min(100, Math.round((absensiSesi.length / (prog.sesi || order?.sesiTotal || 12)) * 100))}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#1E1C43] transition-all"
                      style={{ width: Math.min(100, Math.round((absensiSesi.length / (prog.sesi || order?.sesiTotal || 12)) * 100)) + '%' }} />
                  </div>
                </div>
              )}
            </div>

            {/* ── Daftar Absensi ── */}
            <div className="rkp-sec px-6 sm:px-8 py-4 border-b border-gray-100">
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
            <div className="rkp-sec px-6 sm:px-8 py-4 border-b border-gray-100">
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
            <div className="rkp-sec px-6 sm:px-8 py-4">
              <div className="bg-[#1E1C43] rounded-lg px-4 py-1.5 text-center text-xs font-bold text-white uppercase tracking-wide mb-2.5">Tanda Tangan Para Pihak</div>
              <p className="text-xs text-gray-500 text-center mb-3">Jakarta, {tglDiajukan}</p>
              <div className="grid grid-cols-2 gap-5">

                {/* Kolom Pelatih — Pihak Kedua */}
                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pihak Kedua</p>
                    {fileNamaTTD ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">TTD Diterima</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-200">Belum Upload</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#1E1C43] mb-3">{picData?.fullname || '—'}</p>
                  <PicSig uploaded={!!fileNamaTTD} />
                  <div className="border-t border-gray-100 mt-2 pt-3 space-y-1">
                    <p className="text-[10px] text-gray-400">Personal Trainer</p>
                    {tglDiajukan && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Tgl Pengajuan:</span>
                        <span className="text-[10px] font-semibold text-gray-600">{tglDiajukan}</span>
                      </div>
                    )}
                    {fileNamaTTD && (
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">File TTD: </span>
                        <span className="text-[10px] font-semibold text-gray-600">{fileNamaTTD}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Via:</span>
                      <span className="text-[10px] font-semibold text-gray-600">Perangkat Pelatih</span>
                    </div>
                  </div>
                  {!fileNamaTTD && (
                    <label className="mt-2 cursor-pointer inline-flex items-center gap-1 text-[10px] text-[#1E1C43] font-semibold hover:underline">
                      <Upload size={10} /> Upload TTD
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                        onChange={e => { if (e.target.files[0]) doUploadTTD(e.target.files[0]) }} />
                    </label>
                  )}
                </div>

                {/* Kolom EFM — Pihak Pertama */}
                <div className="border border-[#1E1C43]/20 rounded-xl p-4 bg-[#1E1C43]/[0.04]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-[#1E1C43]/70 uppercase tracking-wider">Pihak Pertama</p>
                    {rekapStatus === 'dikonfirmasi' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">Dikonfirmasi</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">Menunggu Admin</span>
                    )}
                  </div>

                  {/* Cap + Nama */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full border-2 border-[#1E1C43]/30 flex items-center justify-center shrink-0">
                      <span className="text-[8px] font-black text-[#1E1C43]/50 uppercase tracking-tight">EFM</span>
                    </div>
                    <p className="text-xs font-bold text-[#1E1C43]">{cs.namaPerusahaan}</p>
                  </div>

                  {/* TTD area */}
                  {rekapStatus === 'dikonfirmasi' ? (
                    efmSignature ? (
                      <div className="flex items-center justify-center h-16 bg-white/60 rounded-lg">
                        <img src={efmSignature} alt="TTD EFM" className="h-14 object-contain" />
                      </div>
                    ) : (
                      <EfmSig />
                    )
                  ) : (
                    <div className="h-16 flex items-center justify-center bg-white/40 rounded-lg border border-dashed border-[#1E1C43]/20">
                      <p className="text-[10px] text-gray-400 italic text-center px-2">Menunggu konfirmasi<br/>admin</p>
                    </div>
                  )}

                  <div className="border-t border-[#1E1C43]/10 mt-2 pt-3 space-y-1">
                    <p className="text-xs font-semibold text-gray-700">{approvedBy || cs.namaPenandatangan || 'Admin EFM'}</p>
                    <p className="text-[10px] text-gray-500">{cs.jabatanPenandatangan || 'Owner & Co-Founder'}</p>
                    <p className="text-[10px] text-gray-400">{cs.namaLegal}</p>
                    {rekapStatus === 'dikonfirmasi' && tglKonfirmasi && (
                      <>
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Tgl Konfirmasi:</span>
                          <span className="text-[10px] font-semibold text-gray-600">{tglKonfirmasi}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Perangkat:</span>
                          <span className="text-[10px] font-semibold text-gray-600">Web Dashboard EFM</span>
                        </div>
                      </>
                    )}
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
            <div className="rkp-sec px-6 sm:px-8 py-4 border-t border-gray-100 text-center space-y-1">
              <p className="text-xs text-gray-500">Terima kasih atas kepercayaan Anda.</p>
              <p className="text-xs font-semibold text-gray-500">
                Powered by {cs.namaPerusahaan}&nbsp;&nbsp;|&nbsp;&nbsp;{cs.namaLegal}
              </p>
            </div>

        </div>
      </div>{/* /overflow-x-auto */}

      {/* ── Modal Konfirmasi TTD EFM ── */}
      {showApproveModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowApproveModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-shrink-0 p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1E1C43]">Konfirmasi Rekap Absensi</h3>
              <button onClick={() => setShowApproveModal(false)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {/* Ringkasan rekap */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-3">Ringkasan Rekap</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Klien</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{order.namaKlien}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Pelatih</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{picData?.fullname || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Sesi Terlaksana</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{absensiSesi.length} sesi</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Total Honorarium</p>
                    <p className="text-xs font-bold text-[#1E1C43] mt-0.5">{formatRp(totalHon)}</p>
                  </div>
                </div>
              </div>
              {/* Preview TTD */}
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-[#1E1C43] mb-1">TTD Penandatangan</p>
                <p className="text-[10px] text-gray-500 mb-3">{cs.namaPenandatangan} · {cs.jabatanPenandatangan}</p>
                {cs.tandaTanganCEO ? (
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center min-h-[64px]">
                    <img src={cs.tandaTanganCEO} alt="TTD" className="h-14 object-contain" />
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2.5">
                    <p className="text-xs text-yellow-700">TTD founder belum diupload di Pengaturan Perusahaan. Konfirmasi tetap akan dicatat dengan metadata admin.</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 text-center">
                Dengan mengkonfirmasi, rekap ini ditandatangani secara digital atas nama <span className="font-semibold">{cs.namaPenandatangan}</span>.
              </p>
            </div>
            <div className="flex-shrink-0 p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={doApprove}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#1E1C43] hover:bg-[#2d2b5e] text-white transition-colors"
              >
                Konfirmasi &amp; Tandatangani
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status Pembayaran Honorarium (admin only, non-printable) ── */}
      {rekapStatus === 'dikonfirmasi' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Pembayaran Honorarium</h3>
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${
              honStatus === 'sudah_bayar'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {honStatus === 'sudah_bayar' ? '✓ Sudah Dibayar' : 'Menunggu Bayar'}
            </span>
          </div>
          {honStatus === 'sudah_bayar' ? (
            <div className="space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Bukti File</p>
                    <p className="text-xs font-semibold text-gray-800 mt-0.5 truncate">{buktiBayar || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Tanggal Bayar</p>
                    <p className="text-xs font-semibold text-gray-800 mt-0.5">{tglBayar || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Metode</p>
                    <p className="text-xs font-semibold text-gray-800 mt-0.5">{metodeBayar || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Pelatih</p>
                    <p className="text-xs font-semibold text-gray-800 mt-0.5">{picData?.fullname || 'Pelatih'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#1E1C43] rounded-xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Total Honorarium Dibayarkan</span>
                <span className="text-base font-black text-white">{formatRp(totalHon)}</span>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <Upload size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700">Honorarium belum dibayarkan. Catat pembayaran melalui halaman Order.</p>
              </div>
              <button
                onClick={() => navigate(`/pp/orders/${orderId}`, { state: { defaultTab: 'operasional' } })}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E1C43] hover:underline shrink-0 whitespace-nowrap">
                Ke Order <ExternalLink size={11} />
              </button>
            </div>
          )}
        </div>
      )}


    </div>
  )
}
