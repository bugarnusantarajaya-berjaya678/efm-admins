import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Download, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { getDocById, updateDoc } from '../../data/ppDocumentsStore'
import { STATUS_LABEL } from '../../data/ppDocumentsData'
import { getCompanySettings } from '../../utils/companySettings'

const BADGE_FILLED = {
  signed:             'bg-green-500 text-white',
  pending:            'bg-yellow-500 text-white',
  'waiting-approval': 'bg-blue-500 text-white',
  expired:            'bg-red-500 text-white',
}

/* ── helpers ── */
function DocBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${BADGE_FILLED[status] || 'bg-gray-400 text-white'}`}>
      {STATUS_LABEL[status] || status}
    </span>
  )
}

/* ── EFM Signature SVG ── */
function EfmSig() {
  return (
    <svg viewBox="0 0 160 48" width="120" height="36">
      <path d="M10,36 C20,10 30,40 45,20 C55,6 65,38 80,22 C90,10 100,34 115,18 C125,8 135,30 150,24" fill="none" stroke="#1E1C43" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ClientSig({ status }) {
  if (status === 'signed') {
    return (
      <div className="h-[72px] border border-[#A9DFBF] rounded-xl flex items-center justify-center bg-[#EAFAF1] mb-2">
        <svg viewBox="0 0 160 48" width="120" height="36">
          <path d="M8,38 C18,14 28,44 42,22 C52,6 60,40 76,18 C88,4 96,36 112,16 C122,6 132,32 152,20" fill="none" stroke="#27AE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M30,42 C40,38 50,44 60,40" fill="none" stroke="#27AE60" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }
  if (status === 'waiting-approval') {
    return (
      <div className="h-[72px] border border-[#AED6F1] rounded-xl flex items-center justify-center bg-[#EBF5FB] mb-2">
        <svg viewBox="0 0 160 48" width="120" height="36">
          <path d="M8,38 C18,14 28,44 42,22 C52,6 60,40 76,18 C88,4 96,36 112,16 C122,6 132,32 152,20" fill="none" stroke="#2980B9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M30,42 C40,38 50,44 60,40" fill="none" stroke="#2980B9" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }
  if (status === 'expired') {
    return (
      <div className="h-[72px] border border-[#F5B7B1] rounded-xl flex items-center justify-center bg-[#FDEDEC] mb-2">
        <div className="text-center">
          <div className="text-xs font-bold text-[#C0392B]">Agreement Expired</div>
          <div className="text-xs text-[#C0392B] opacity-75 mt-0.5">Perlu pembaharuan dokumen</div>
        </div>
      </div>
    )
  }
  return (
    <div className="h-[72px] border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 mb-2">
      <div className="text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" width="20" height="20" className="mx-auto mb-1"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        <div className="text-[10px] font-semibold text-gray-400">Menunggu TTD Klien</div>
        <div className="text-[9px] text-gray-400 opacity-75">di Perangkat Pelatih</div>
      </div>
    </div>
  )
}

/* ── Settings helpers ── */
function getTemplatePasal() {
  try {
    const s = localStorage.getItem('efmAgreementTemplate')
    if (s) return JSON.parse(s).pasal
  } catch {}
  return null
}

const DEFAULT_PASAL_DETAIL = [
  { judul: 'Ruang Lingkup Layanan', poin: [
    'Essential Fitness Management (EFM), di bawah naungan CV Bugar Nusantara Jaya, menyediakan layanan panduan program latihan atau terapi privat secara eksklusif kepada Klien sesuai dengan detail paket yang dipilih.',
    'Sesi latihan/terapi akan dipandu secara langsung oleh Pelatih atau Terapis resmi yang ditunjuk oleh manajemen EFM berdasarkan kualifikasi spesifik yang dibutuhkan oleh program Klien.',
  ]},
  { judul: 'Masa Berlaku Paket (Validity Period)', poin: [
    'Seluruh kuota sesi latihan dalam paket yang telah dibeli wajib diselesaikan dalam rentang waktu yang tertera pada kolom Masa Berlaku Paket.',
    'Jika masa berlaku paket telah habis sedangkan Klien belum menyelesaikan seluruh sesi, maka sisa sesi akan dinyatakan hangus secara otomatis oleh sistem backend.',
  ]},
  { judul: 'Kebijakan Pembatalan dan Penjadwalan Ulang', poin: [
    'Non-Darurat: Klien wajib melakukan konfirmasi rescheduling atau pembatalan sekurang-kurangnya 24 jam sebelum sesi dimulai.',
    'Darurat/Sakit: Pembatalan mendadak karena sakit wajib disertai bukti pendukung sah (mis. Surat Keterangan Dokter). Tanpa bukti sah, sesi tetap dihitung terpakai.',
    'Sesi Pengganti: Pengaturan jadwal pengganti akibat sakit/izin menjadi tanggung jawab langsung antara Klien dan Pelatih/Terapis.',
    'Pembatalan sepihak kurang dari 24 jam tanpa alasan darurat yang disetujui akan menyebabkan sesi tersebut hangus otomatis dari total kuota.',
  ]},
  { judul: 'Pembayaran dan Validasi Order', poin: [
    'Seluruh transaksi pemesanan paket dinyatakan sah apabila dilakukan melalui WhatsApp Asisten Virtual / Admin Resmi EFM yang terintegrasi dengan payment gateway CV Bugar Nusantara Jaya.',
    'Klien wajib memastikan detail pesanan sudah sesuai sebelum pelunasan. Pembayaran yang telah divalidasi bersifat final, tidak dapat dibatalkan, dan non-refundable.',
  ]},
  { judul: 'Jaminan Data dan Tanggung Jawab Kesehatan Mandiri', poin: [
    'Klien menyatakan dan bertanggung jawab penuh bahwa seluruh data pribadi, kondisi fisik, riwayat cedera, dan catatan medis yang diberikan adalah benar, akurat, dan jujur.',
    'Klien memahami bahwa aktivitas fisik memiliki risiko cedera bawaan dan bertanggung jawab penuh atas keselamatan dirinya selama dan sesudah sesi berlangsung.',
    'EFM beserta seluruh manajemen, pelatih, dan terapis dibebaskan dari segala tuntutan hukum atas risiko yang timbul akibat kelalaian Klien atau adanya kondisi medis tersembunyi.',
  ]},
  { judul: 'Kerjasama dan Etika dengan Pelatih/Terapis', poin: [
    'Setiap Pelatih atau Terapis yang bertugas di EFM memiliki kontrak resmi dengan manajemen demi menjaga profesionalitas dan kualitas layanan.',
    'Klien dilarang keras mempekerjakan atau membuat kesepakatan dengan Pelatih/Terapis EFM di luar manajemen tanpa izin tertulis dari Direksi CV Bugar Nusantara Jaya.',
  ]},
  { judul: 'Pernyataan Kesadaran dan Persetujuan', poin: [
    'Klien menyatakan telah membaca dengan saksama, memahami seluruh isi, serta menerima konsekuensi hukum dari Syarat dan Ketentuan dalam dokumen ini.',
    'Perjanjian ini disetujui dan ditandatangani secara elektronik dalam keadaan sadar, sehat jasmani dan rohani, tanpa paksaan dari pihak manapun.',
    'Klien sepakat dan berkomitmen untuk menjalani seluruh rangkaian paket program privat yang telah dibeli sesuai regulasi operasional EFM.',
  ]},
]

/* ── Agreement Document ── */
function AgreementDoc({ doc }) {
  const company = getCompanySettings()
  const detailCells = [
    ['Nama Klien',     doc.namaKlien],
    ['Nama Panggilan', doc.namaPanggilan || '—'],
    ['No. WhatsApp',   doc.noWa || '—'],
    ['Email',          doc.email || '—'],
    ['Alamat',         doc.alamat || '—'],
    ['Order ID',       '#' + doc.orderId],
    ['Paket Dipilih',  doc.paket],
    ['Masa Berlaku',   doc.masaBerlaku || '—'],
    ['Nama Pelatih',   doc.pic || '—'],
    ['Tanggal Dibuat', doc.tglDibuat],
  ]

  const sigMeta = () => {
    if (doc.statusTtd === 'signed')
      return <span className="text-[#27AE60] text-xs">✓ Ditandatangani pada: {doc.tglTtd || doc.tglDibuat}</span>
    if (doc.statusTtd === 'waiting-approval')
      return <span className="text-[#2980B9] text-xs">⏳ Klien TTD pada: {doc.tglTtd || doc.tglDibuat} — Menunggu approval admin</span>
    if (doc.statusTtd === 'expired')
      return <span className="text-[#C0392B] text-xs">Expired — {doc.tglDibuat}</span>
    return <span className="text-[#B7770D] text-xs">Status: Pending TTD</span>
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Navy header */}
      <div id="agr-hdr" className="bg-[#1E1C43] rounded-t-2xl px-6 py-4 sm:px-8 sm:py-5 grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-4 text-white">
        {/* Left — logo + company info */}
        <div className="flex items-start gap-3">
          {company.logoPerusahaan ? (
            <img src={company.logoPerusahaan} alt="EFM Logo" className="w-14 h-14 rounded-full object-contain shrink-0" />
          ) : (
            <img src="/logo.png" alt="EFM Logo" className="w-14 h-14 rounded-full object-cover shrink-0" onError={e => { e.target.style.display = 'none' }} />
          )}
          <div className="min-w-0 overflow-hidden">
            <p className="text-base font-bold break-words">{company.namaPerusahaan}</p>
            <p className="text-xs text-white/70 mt-0.5 break-words">{company.namaLegal}</p>
            <p className="text-xs text-white/70 mt-0.5 leading-relaxed break-words">
              {company.alamat
                .replace(', Tower A,', ',\nTower A,')
                .split('\n')
                .map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}
            </p>
            <p className="text-xs text-white/70 mt-0.5 break-words">{company.email}</p>
            <p className="text-xs text-white/70 mt-0.5">{company.telepon}</p>
          </div>
        </div>

        {/* Right — AGREEMENT title + doc info + status */}
        <div id="agr-hdr-right" className="text-left sm:text-right">
          <div id="agr-hdr-title" className="text-2xl sm:text-4xl font-black tracking-widest uppercase">AGREEMENT</div>
          <div className="text-sm text-gray-300 mt-0.5">{doc.displayId}</div>
          <div className="agr-date-row flex justify-start sm:justify-end items-center gap-2 mt-1 mb-0.5">
            <span className="text-xs text-gray-400">Ref. Invoice:</span>
            <span className="font-semibold text-sm">{doc.refInvoice || '—'}</span>
          </div>
          <div className="agr-date-row flex justify-start sm:justify-end items-center gap-2 mb-0.5">
            <span className="text-xs text-gray-400">Order ID:</span>
            <span className="font-semibold text-sm">#{doc.orderId}</span>
          </div>
          <span className={`px-4 py-1 rounded-full text-white text-sm font-semibold inline-block mt-0.5 ${BADGE_FILLED[doc.statusTtd] || 'bg-gray-500'}`}>
            {STATUS_LABEL[doc.statusTtd] || doc.statusTtd}
          </span>
        </div>
      </div>

      {/* Detail grid */}
      <div id="agr-detail-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 px-5 py-5 border-b border-gray-100">
        {detailCells.map(([lbl, val]) => (
          <div key={lbl} className="bg-gray-50 rounded-xl px-3 py-2.5 min-w-0 overflow-hidden">
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-0.5">{lbl}</div>
            <div className="text-sm font-semibold text-[#1E1C43] break-words break-all">{val}</div>
          </div>
        ))}
      </div>

      {/* Syarat & Ketentuan */}
      <div className="px-6 py-5">
        <div className="bg-gray-50 rounded-xl px-4 py-2 text-center text-xs font-bold text-[#1E1C43] uppercase tracking-wide mb-4">Syarat dan Ketentuan Layanan</div>
        {(getTemplatePasal() || DEFAULT_PASAL_DETAIL).map(({ judul, poin }, pi) => (
          <div key={pi} className="mb-3.5">
            <div className="bg-gray-50 rounded-xl px-4 py-2 text-center mb-2">
              <div className="text-[10px] font-bold text-[#1E1C43] uppercase tracking-wide">Pasal {pi + 1}</div>
              <div className="text-xs font-bold text-[#1E1C43] uppercase tracking-wide">{judul}</div>
            </div>
            <ol className="pl-4 space-y-1">
              {poin.map((p, i) => (
                <li key={i} className="text-xs leading-relaxed text-gray-700 text-justify" style={{ listStyleType: 'decimal' }}>{p}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {/* Tanda Tangan */}
      <div className="border-t border-gray-200 pt-5 px-6 pb-6">
        <div className="bg-gray-50 rounded-xl px-4 py-2 text-center text-xs font-bold text-[#1E1C43] uppercase tracking-wide mb-4">Tanda Tangan Para Pihak</div>
        <div className="grid grid-cols-2 gap-5">
          <div className="text-center">
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-0.5">Pihak Pertama</div>
            <div className="text-xs font-bold text-[#1E1C43] mb-2">EFM</div>
            <div className="h-[72px] border border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 mb-2">
              {company.tandaTanganCEO
                ? <img src={company.tandaTanganCEO} alt="TTD EFM" className="h-12 object-contain" />
                : <EfmSig />}
            </div>
            <div className="text-xs text-[#1E1C43] font-semibold">{company.namaPenandatangan || 'Manajemen EFM'}</div>
            <div className="text-[10px] text-text-muted">{company.jabatanPenandatangan || 'Ditandatangani secara digital'}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-0.5">Pihak Kedua</div>
            <div className="text-xs font-bold text-[#1E1C43] mb-2">Klien</div>
            <ClientSig status={doc.statusTtd} />
            <div className="text-xs text-[#1E1C43] font-semibold">{doc.namaKlien}</div>
            <div className="mt-0.5">{sigMeta()}</div>
          </div>
        </div>
      </div>

      {/* Document footer */}
      <div className="px-6 pb-4 border-t border-gray-100 pt-4 text-center space-y-0.5">
        <p className="text-xs text-gray-400">Terima kasih atas kepercayaan Anda. Simpan dokumen ini sebagai bukti perjanjian yang sah.</p>
        <p className="text-xs font-semibold text-gray-500">Powered by {company.namaPerusahaan}&nbsp;&nbsp;|&nbsp;&nbsp;{company.namaLegal}</p>
      </div>
    </div>
  )
}

/* ── Main Page ── */
export default function PPAgreementDetailPage() {
  const { id }    = useParams()
  const { state } = useLocation()
  const navigate  = useNavigate()
  const { setCrumbs } = useBreadcrumb()

  const [doc, setDoc] = useState(() => getDocById(id))

  useEffect(() => {
    setCrumbs(['Private Program', 'Agreement', doc ? doc.displayId : id])
    return () => setCrumbs(null)
  }, [doc?.displayId, id])

  const fromOrderId = state?.fromOrderId

  const handleBack = () => {
    if (fromOrderId) {
      navigate('/pp/orders/' + fromOrderId, { state: { defaultTab: 'keuangan' } })
    } else {
      navigate('/pp/documents')
    }
  }

  if (!doc) {
    return (
      <div className="flex flex-col gap-4">
        <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors font-medium w-fit">
          <ArrowLeft size={16} /> Kembali ke Daftar Agreement
        </button>
        <div className="text-center py-20 text-text-muted">Agreement tidak ditemukan.</div>
      </div>
    )
  }

  const handleApprove = () => {
    const tglTtd = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    updateDoc(doc.id, { statusTtd: 'signed', tglTtd })
    setDoc(prev => ({ ...prev, statusTtd: 'signed', tglTtd }))
  }


  return (
    <div className="flex flex-col gap-4 pb-24">

      {/* Print CSS — isolate agreement document, hide admin chrome */}
      <style>{`
        @media print {
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden; }
          #agr-print-area, #agr-print-area * { visibility: visible; }
          #agr-print-area {
            position: absolute; left: 0; top: 0; width: 100%;
            overflow: visible !important;
            padding: 0 !important;
            background: white !important;
            margin: 0 !important;
          }
          #agr-print-area > div {
            width: 100% !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
            background: white !important;
          }
          #agr-print-area > div * { overflow: visible !important; }

          /* sm: breakpoint tidak aktif di print viewport */
          #agr-hdr {
            grid-template-columns: 1.5fr 1fr !important;
            padding: 1rem 1.25rem !important;
          }
          #agr-hdr-right { text-align: right !important; }
          #agr-hdr-right .agr-date-row { justify-content: flex-end !important; }
          #agr-hdr-title { font-size: 2.25rem !important; line-height: 2.5rem !important; }
          #agr-detail-grid { grid-template-columns: repeat(2, 1fr) !important; }

          .no-print { display: none !important; }
          * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          @page { margin: 5mm; size: A4 portrait; }
        }
      `}</style>

      {/* Page header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-10 h-10 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
            <FileText size={16} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Agreement Klien</p>
            <h1 className="text-base font-bold text-[#1E1C43] leading-snug">{doc.displayId}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-gray-500">{doc.namaKlien}</span>
              <span className="text-gray-300 text-xs">·</span>
              <DocBadge status={doc.statusTtd} />
            </div>
          </div>

          {doc.statusTtd === 'waiting-approval' && (
            <button
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#27AE60] hover:bg-[#1E8449] text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
            >
              <CheckCircle size={13} /> Approve Agreement
            </button>
          )}

          {/* Download PDF */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors shrink-0">
            <Download size={13} /> Download PDF
          </button>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors shrink-0"
          >
            <ArrowLeft size={13} /> {fromOrderId ? `Kembali ke Order #${fromOrderId}` : 'Kembali ke Daftar Agreement'}
          </button>
        </div>
      </div>

      <div id="agr-print-area" className="overflow-x-auto pb-2">
      <div className="bg-white rounded-2xl border border-gray-200 min-w-[660px] max-w-[794px] mx-auto w-full overflow-hidden">
        <AgreementDoc doc={doc} />

        {/* Admin-only status notice — bukan form TTD klien */}
        {doc.statusTtd === 'pending' && (
          <div className="no-print px-5 pb-5 pt-2">
            <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3.5">
              <Clock size={16} className="text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-yellow-800">Menunggu Tanda Tangan Klien</p>
                <p className="text-[11px] text-yellow-700 mt-0.5">Agreement belum ditandatangani. Proses TTD klien dilakukan melalui perangkat pelatih — admin tidak perlu mengambil tindakan saat ini.</p>
              </div>
            </div>
          </div>
        )}

        {doc.statusTtd === 'waiting-approval' && (
          <div className="no-print px-5 pb-5 pt-2">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3.5">
              <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-800">TTD Klien Diterima — Menunggu Approval Admin</p>
                <p className="text-[11px] text-blue-700 mt-0.5">Klien telah menandatangani agreement. Verifikasi TTD di atas, lalu klik <strong>Approve Agreement</strong> di bagian atas halaman untuk mengonfirmasi.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>{/* /overflow-x-auto */}

    </div>
  )
}
