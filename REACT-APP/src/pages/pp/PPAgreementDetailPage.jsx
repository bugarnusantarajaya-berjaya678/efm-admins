import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Check, Download, CheckCircle } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { getDocById, updateDoc } from '../../data/ppDocumentsStore'
import { STATUS_LABEL, STATUS_CLS } from '../../data/ppDocumentsData'

/* ── helpers ── */
function DocBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_CLS[status] || STATUS_CLS.pending}`}>
      {STATUS_LABEL[status] || status}
    </span>
  )
}

const MONTH_ROMAN = { Jan:'I', Feb:'II', Mar:'III', Apr:'IV', Mei:'V', Jun:'VI', Jul:'VII', Agu:'VIII', Sep:'IX', Okt:'X', Nov:'XI', Des:'XII' }
function docNomor(displayId, tglDibuat) {
  const parts = (tglDibuat || '').split(' ')
  const roman = MONTH_ROMAN[parts[1]] || parts[1] || '—'
  const year  = parts[2] || '—'
  return `${displayId}/EFM/${roman}/${year}`
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
  if (status === 'waiting_approval') {
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
          <div className="text-[11px] font-bold text-[#C0392B]">Agreement Expired</div>
          <div className="text-[10px] text-[#C0392B] opacity-75 mt-0.5">Perlu pembaharuan dokumen</div>
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

/* ── Signature Canvas ── */
function SigCanvas({ onDraw }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const lastPt = useRef(null)

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const src = e.touches ? e.touches[0] : e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }

  const start = useCallback((e) => {
    e.preventDefault()
    drawing.current = true
    lastPt.current = getPos(e, canvasRef.current)
    onDraw(true)
  }, [onDraw])

  const move = useCallback((e) => {
    if (!drawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pt = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(lastPt.current.x, lastPt.current.y)
    ctx.lineTo(pt.x, pt.y)
    ctx.strokeStyle = '#1E1C43'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
    lastPt.current = pt
  }, [])

  const end = useCallback(() => { drawing.current = false }, [])

  const clear = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    onDraw(false)
  }

  return (
    <div>
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl bg-white overflow-hidden" style={{ height: 120 }}>
        <canvas
          ref={canvasRef}
          width={560}
          height={120}
          className="w-full h-full touch-none"
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
          <svg viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" width="24" height="24" className="mb-1"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <span className="text-[11px] text-gray-400 font-medium">Tanda tangan di sini</span>
        </div>
      </div>
      <div className="flex justify-end mt-1.5">
        <button onClick={clear} className="text-[11px] font-semibold text-text-muted border border-gray-200 px-3 py-1 rounded-md hover:bg-gray-50">Hapus</button>
      </div>
    </div>
  )
}

/* ── Confirm Module (for Pending) ── */
function ConfirmModule({ onSubmit }) {
  const [cbx, setCbx] = useState(false)
  const [drawn, setDrawn] = useState(false)
  const ready = cbx && drawn

  return (
    <div className="mt-6">
      <div className="border-t-2 border-dashed border-gray-200 mb-5" />
      <div className="text-[11px] font-bold text-[#1E1C43] uppercase tracking-[.8px] border-l-[3px] border-[#E8781A] pl-2.5 mb-4">
        Konfirmasi &amp; Tanda Tangan Digital Klien
      </div>
      <label className={`flex gap-3 items-start rounded-xl p-4 mb-1.5 cursor-pointer border transition-colors ${cbx ? 'border-[#27AE60] bg-[#EAFAF1]' : 'border-gray-200 bg-white'}`}>
        <input type="checkbox" checked={cbx} onChange={e => setCbx(e.target.checked)}
          className="w-4 h-4 mt-0.5 accent-green-500 flex-shrink-0 cursor-pointer" />
        <div className="text-[11.5px] leading-relaxed text-gray-700">
          Saya yang bertanda tangan di bawah ini menyatakan bahwa <strong>seluruh data yang terlampir dan saya berikan dalam agreement ini adalah benar</strong>. Saya menandatangani dokumen ini dalam keadaan <strong>sadar, sehat walafiat, tanpa paksaan</strong>, dan sepakat menjalani paket program privat yang sudah saya beli. Dengan ini saya juga menyatakan <strong>bertanggung jawab penuh atas kesehatan serta keselamatan diri saya sendiri</strong> selama mengikuti program.
        </div>
      </label>
      {!cbx && <div className="text-[11px] text-red-500 mb-3.5 pl-1">⚠ Wajib dicentang sebelum tanda tangan.</div>}
      <div className="mb-4">
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-2">
          Tanda Tangan Digital <span className="text-red-500">*</span>
        </div>
        <SigCanvas onDraw={setDrawn} />
        {!drawn && <div className="text-[11px] text-red-500 mt-1 pl-1">⚠ Tanda tangan wajib diisi.</div>}
      </div>
      <button
        onClick={() => ready && onSubmit()}
        className="w-full py-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all"
        style={{ background: '#E8781A', color: 'white', opacity: ready ? 1 : 0.45, cursor: ready ? 'pointer' : 'not-allowed' }}
      >
        <Check size={15} strokeWidth={2.5} />
        Submit &amp; Setujui Perjanjian
      </button>
      <div className="text-[10px] text-text-muted text-center mt-2 leading-relaxed">
        Tanda tangan digital Anda berkekuatan hukum setara tanda tangan basah.
      </div>
    </div>
  )
}

/* ── Agreement Document ── */
function AgreementDoc({ doc }) {
  const detailCells = [
    ['Nama Klien',     doc.namaKlien],
    ['Nama Panggilan', doc.namaPanggilan || '—'],
    ['No. WhatsApp',   doc.noWa || '—'],
    ['Email',          doc.email || '—'],
    ['Alamat',         doc.alamat || '—'],
    ['Order ID',       '#' + doc.orderId],
    ['Paket Dipilih',  doc.paket],
    ['Tanggal Dibuat', doc.tglDibuat],
  ]

  const sigMeta = () => {
    if (doc.statusTtd === 'signed')
      return <span className="text-[#27AE60] text-[10px]">✓ Ditandatangani pada: {doc.tglTtd || doc.tglDibuat}</span>
    if (doc.statusTtd === 'waiting_approval')
      return <span className="text-[#2980B9] text-[10px]">⏳ Klien TTD pada: {doc.tglTtd || doc.tglDibuat} — Menunggu approval admin</span>
    if (doc.statusTtd === 'expired')
      return <span className="text-[#C0392B] text-[10px]">Expired — {doc.tglDibuat}</span>
    return <span className="text-[#B7770D] text-[10px]">Status: Pending TTD</span>
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Navy header */}
      <div style={{ background: '#1E1C43', padding: '22px 28px 20px', borderRadius: 0, marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }} alt="EFM" />
            <div style={{ display: 'none', width: 52, height: 52, borderRadius: '50%', background: '#E8781A', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>Essential Fitness Management</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', marginTop: 3, lineHeight: 1.7 }}>CV. Bugar Nusantara Jaya</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', lineHeight: 1.7 }}>Jl. Terogong Raya No.18, Jakarta Selatan</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', lineHeight: 1.7 }}>essentialfitnessmanagement@gmail.com</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>No. Dokumen</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: '.3px' }}>{docNomor(doc.displayId, doc.tglDibuat)}</div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.15)', paddingTop: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'white', letterSpacing: 1.5, textTransform: 'uppercase', lineHeight: 1.35 }}>PERJANJIAN LAYANAN PRIVATE PROGRAM</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', marginTop: 4, letterSpacing: '.5px' }}>EFM — Essential Fitness Management</div>
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-6 mt-0 pt-6 px-6">
        {detailCells.map(([lbl, val]) => (
          <div key={lbl} className="bg-gray-50 rounded-xl px-3.5 py-2.5">
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-0.5">{lbl}</div>
            <div className="text-[13px] font-bold text-[#1E1C43]">{val}</div>
          </div>
        ))}
      </div>

      {/* Syarat & Ketentuan */}
      <div className="mb-6 px-6">
        <div className="text-[11px] font-bold text-[#1E1C43] uppercase tracking-wide mb-3.5 pb-1.5 border-b border-gray-200">Syarat dan Ketentuan Layanan</div>
        {[
          ['Pasal 1 — Ruang Lingkup Layanan', [
            'Essential Fitness Management (EFM), di bawah naungan CV Bugar Nusantara Jaya, menyediakan layanan panduan program latihan atau terapi privat secara eksklusif kepada Klien sesuai dengan detail paket yang dipilih.',
            'Sesi latihan/terapi akan dipandu secara langsung oleh Pelatih atau Terapis resmi yang ditunjuk oleh manajemen EFM berdasarkan kualifikasi spesifik yang dibutuhkan oleh program Klien.',
          ]],
          ['Pasal 2 — Masa Berlaku Paket (Validity Period)', [
            'Seluruh kuota sesi latihan dalam paket yang telah dibeli wajib diselesaikan dalam rentang waktu yang tertera pada kolom Masa Berlaku Paket.',
            'Jika masa berlaku paket telah habis sedangkan Klien belum menyelesaikan seluruh sesi, maka sisa sesi akan dinyatakan hangus secara otomatis oleh sistem backend.',
          ]],
          ['Pasal 3 — Kebijakan Pembatalan dan Penjadwalan Ulang', [
            'Non-Darurat: Klien wajib melakukan konfirmasi rescheduling atau pembatalan sekurang-kurangnya 24 jam sebelum sesi dimulai.',
            'Darurat/Sakit: Pembatalan mendadak karena sakit wajib disertai bukti pendukung sah (mis. Surat Keterangan Dokter). Tanpa bukti sah, sesi tetap dihitung terpakai.',
            'Sesi Pengganti: Pengaturan jadwal pengganti akibat sakit/izin menjadi tanggung jawab langsung antara Klien dan Pelatih/Terapis.',
            'Pembatalan sepihak kurang dari 24 jam tanpa alasan darurat yang disetujui akan menyebabkan sesi tersebut hangus otomatis dari total kuota.',
          ]],
          ['Pasal 4 — Pembayaran dan Validasi Order', [
            'Seluruh transaksi pemesanan paket dinyatakan sah apabila dilakukan melalui WhatsApp Asisten Virtual / Admin Resmi EFM yang terintegrasi dengan payment gateway CV Bugar Nusantara Jaya.',
            'Klien wajib memastikan detail pesanan sudah sesuai sebelum pelunasan. Pembayaran yang telah divalidasi bersifat final, tidak dapat dibatalkan, dan non-refundable.',
          ]],
          ['Pasal 5 — Jaminan Data dan Tanggung Jawab Kesehatan Mandiri', [
            'Klien menyatakan dan bertanggung jawab penuh bahwa seluruh data pribadi, kondisi fisik, riwayat cedera, dan catatan medis yang diberikan adalah benar, akurat, dan jujur.',
            'Klien memahami bahwa aktivitas fisik memiliki risiko cedera bawaan dan bertanggung jawab penuh atas keselamatan dirinya selama dan sesudah sesi berlangsung.',
            'EFM beserta seluruh manajemen, pelatih, dan terapis dibebaskan dari segala tuntutan hukum atas risiko yang timbul akibat kelalaian Klien atau adanya kondisi medis tersembunyi.',
          ]],
          ['Pasal 6 — Kerjasama dan Etika dengan Pelatih/Terapis', [
            'Setiap Pelatih atau Terapis yang bertugas di EFM memiliki kontrak resmi dengan manajemen demi menjaga profesionalitas dan kualitas layanan.',
            'Klien dilarang keras mempekerjakan atau membuat kesepakatan dengan Pelatih/Terapis EFM di luar manajemen tanpa izin tertulis dari Direksi CV Bugar Nusantara Jaya.',
          ]],
          ['Pasal 7 — Pernyataan Kesadaran dan Persetujuan', [
            'Klien menyatakan telah membaca dengan saksama, memahami seluruh isi, serta menerima konsekuensi hukum dari Syarat dan Ketentuan dalam dokumen ini.',
            'Perjanjian ini disetujui dan ditandatangani secara elektronik dalam keadaan sadar, sehat jasmani dan rohani, tanpa paksaan dari pihak manapun.',
            'Klien sepakat dan berkomitmen untuk menjalani seluruh rangkaian paket program privat yang telah dibeli sesuai regulasi operasional EFM.',
          ]],
        ].map(([judul, poin]) => (
          <div key={judul} className="mb-3.5">
            <div className="text-[10.5px] font-bold text-[#1E1C43] uppercase tracking-wide mb-1.5">{judul}</div>
            <ol className="pl-4 space-y-1">
              {poin.map((p, i) => (
                <li key={i} className="text-[11px] leading-relaxed text-gray-700" style={{ listStyleType: 'decimal' }}>{p}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {/* Tanda Tangan */}
      <div className="border-t border-gray-200 pt-5 px-6 pb-6">
        <div className="text-[11px] font-bold text-[#1E1C43] uppercase tracking-wide mb-3.5">Tanda Tangan Para Pihak</div>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">Pihak Pertama — EFM</div>
            <div className="h-[72px] border border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 mb-2">
              <EfmSig />
            </div>
            <div className="text-[11px] text-[#1E1C43] font-semibold">Manajemen EFM</div>
            <div className="text-[10px] text-text-muted">Ditandatangani secara digital</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">Pihak Kedua — Klien</div>
            <ClientSig status={doc.statusTtd} />
            <div className="text-[11px] text-[#1E1C43] font-semibold">{doc.namaKlien}</div>
            <div className="mt-0.5">{sigMeta()}</div>
          </div>
        </div>
      </div>

      {/* Document footer */}
      <div className="px-6 pb-4 border-t border-gray-100 pt-4 text-center">
        <p className="text-[9px] text-gray-300">Dokumen ini digenerate oleh sistem EFM V2</p>
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
      navigate('/pp/orders/' + fromOrderId, { state: { defaultTab: 'kontrak' } })
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

  const handleSubmitSign = () => {
    const tglTtd = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    updateDoc(doc.id, { statusTtd: 'waiting_approval', tglTtd })
    setDoc(prev => ({ ...prev, statusTtd: 'waiting_approval', tglTtd }))
  }

  return (
    <div className="flex flex-col gap-4">
      <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors font-medium w-fit">
        <ArrowLeft size={16} /> {fromOrderId ? `Kembali ke Order #${fromOrderId}` : 'Kembali ke Daftar Agreement'}
      </button>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{doc.displayId}</h1>
          <p className="text-sm text-text-muted mt-1">Agreement klien · {doc.namaKlien}</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {doc.statusTtd === 'waiting_approval' && (
            <button
              onClick={handleApprove}
              className="flex items-center gap-1.5 px-4 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors"
              style={{ background: '#2980B9' }}
            >
              <CheckCircle size={14} /> Approve Agreement
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      <div className="w-fit">
        <DocBadge status={doc.statusTtd} />
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden max-w-[600px] w-full">
        <AgreementDoc doc={doc} />
        {doc.statusTtd === 'pending' && (
          <div className="px-6 pb-6">
            <ConfirmModule onSubmit={handleSubmitSign} />
          </div>
        )}
      </div>
    </div>
  )
}
