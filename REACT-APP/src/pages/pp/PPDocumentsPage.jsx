import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Eye, ChevronLeft, ChevronRight, X, Check, Download, CheckCircle, Search } from 'lucide-react'
import { DOCS_INIT, STATUS_LABEL, STATUS_CLS, PAKET_OPTS } from '../../data/ppDocumentsData'

/* ── helpers ── */
function AvatarSm({ initials, color }) {
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: color }}>
      {initials}
    </div>
  )
}

function DocBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_CLS[status] || STATUS_CLS.pending}`}>
      {STATUS_LABEL[status] || status}
    </span>
  )
}

function StatMini({ label, value, color }) {
  const bCls = { yellow:'border-warning', green:'border-success', blue:'border-blue-400', navy:'border-border' }[color] || 'border-border'
  const vCls = { yellow:'text-warning', green:'text-success', blue:'text-blue-600', navy:'text-text-primary' }[color] || 'text-text-primary'
  return (
    <div className={`bg-bg-surface rounded-xl border-[1.5px] ${bCls} px-4 py-3`}>
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${vCls}`}>{value}</div>
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

/* ── EFM Signature SVG ── */
function EfmSig() {
  return (
    <svg viewBox="0 0 160 48" width="120" height="36">
      <path d="M10,36 C20,10 30,40 45,20 C55,6 65,38 80,22 C90,10 100,34 115,18 C125,8 135,30 150,24" fill="none" stroke="#1E1C43" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ClientSig({ status, tglTtd, namaKlien }) {
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
  /* pending */
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

const MONTH_ROMAN = { Jan:'I', Feb:'II', Mar:'III', Apr:'IV', Mei:'V', Jun:'VI', Jul:'VII', Agu:'VIII', Sep:'IX', Okt:'X', Nov:'XI', Des:'XII' }
function docNomor(displayId, tglDibuat) {
  const parts = (tglDibuat || '').split(' ')
  const roman = MONTH_ROMAN[parts[1]] || parts[1] || '—'
  const year  = parts[2] || '—'
  return `${displayId}/EFM/${roman}/${year}`
}

/* ── Agreement Document ── */
function AgreementDoc({ doc }) {
  const detailCells = [
    ['Nama Klien', doc.namaKlien],
    ['Nama Panggilan', doc.namaPanggilan || '—'],
    ['No. WhatsApp', doc.noWa || '—'],
    ['Email', doc.email || '—'],
    ['Alamat', doc.alamat || '—'],
    ['Order ID', '#' + doc.orderId],
    ['Paket Dipilih', doc.paket],
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
      <div className="grid grid-cols-2 gap-2.5 mb-6 mt-0">
        {detailCells.map(([lbl, val]) => (
          <div key={lbl} className="bg-gray-50 rounded-xl px-3.5 py-2.5">
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-0.5">{lbl}</div>
            <div className="text-[13px] font-bold text-[#1E1C43]">{val}</div>
          </div>
        ))}
      </div>

      {/* Syarat & Ketentuan */}
      <div className="mb-6">
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
      <div className="border-t border-gray-200 pt-5">
        <div className="text-[11px] font-bold text-[#1E1C43] uppercase tracking-wide mb-3.5">Tanda Tangan Para Pihak</div>
        <div className="grid grid-cols-2 gap-5">
          {/* EFM side */}
          <div>
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">Pihak Pertama — EFM</div>
            <div className="h-[72px] border border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 mb-2">
              <EfmSig />
            </div>
            <div className="text-[11px] text-[#1E1C43] font-semibold">Manajemen EFM</div>
            <div className="text-[10px] text-text-muted">Ditandatangani secara digital</div>
          </div>
          {/* Client side */}
          <div>
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">Pihak Kedua — Klien</div>
            <ClientSig status={doc.statusTtd} tglTtd={doc.tglTtd} namaKlien={doc.namaKlien} />
            <div className="text-[11px] text-[#1E1C43] font-semibold">{doc.namaKlien}</div>
            <div className="mt-0.5">{sigMeta()}</div>
          </div>
        </div>
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

      {/* Checkbox declaration */}
      <label className={`flex gap-3 items-start rounded-xl p-4 mb-1.5 cursor-pointer border transition-colors ${cbx ? 'border-[#27AE60] bg-[#EAFAF1]' : 'border-gray-200 bg-white'}`}>
        <input type="checkbox" checked={cbx} onChange={e => setCbx(e.target.checked)}
          className="w-4 h-4 mt-0.5 accent-green-500 flex-shrink-0 cursor-pointer" />
        <div className="text-[11.5px] leading-relaxed text-gray-700">
          Saya yang bertanda tangan di bawah ini menyatakan bahwa <strong>seluruh data yang terlampir dan saya berikan dalam agreement ini adalah benar</strong>. Saya menandatangani dokumen ini dalam keadaan <strong>sadar, sehat walafiat, tanpa paksaan</strong>, dan sepakat menjalani paket program privat yang sudah saya beli. Dengan ini saya juga menyatakan <strong>bertanggung jawab penuh atas kesehatan serta keselamatan diri saya sendiri</strong> selama mengikuti program.
        </div>
      </label>
      {!cbx && <div className="text-[11px] text-red-500 mb-3.5 pl-1">⚠ Wajib dicentang sebelum tanda tangan.</div>}

      {/* Sig canvas */}
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
        style={{ background: ready ? '#E8781A' : '#E8781A', color: 'white', opacity: ready ? 1 : 0.45, cursor: ready ? 'pointer' : 'not-allowed' }}
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

/* ── Preview Modal ── */
function PreviewModal({ doc, onClose, onApprove, onSubmitSign }) {
  if (!doc) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[720px] flex flex-col max-h-[90vh]">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[rgba(30,28,67,.08)] flex items-center justify-center">
              <FileText size={15} color="#1E1C43" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#1E1C43] leading-tight">Agreement Klien — {doc.displayId}</div>
              <div className="text-[11px] text-text-muted mt-0.5">{doc.namaKlien} · #{doc.orderId}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={17} color="#666" />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <AgreementDoc doc={doc} />
          {doc.statusTtd === 'pending' && <ConfirmModule onSubmit={() => onSubmitSign(doc.id)} />}
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 flex-shrink-0">
          <DocBadge status={doc.statusTtd} />
          <div className="flex gap-2.5 items-center">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] font-semibold text-text-muted hover:bg-gray-50 transition-colors">
              Tutup
            </button>
            {doc.statusTtd === 'waiting_approval' && (
              <button
                onClick={() => onApprove(doc.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors"
                style={{ background: '#2980B9' }}
              >
                <Check size={14} strokeWidth={2} />
                Approve Agreement
              </button>
            )}
            {doc.statusTtd === 'signed' && (
              <button
                onClick={() => alert('Fitur download PDF akan tersedia setelah integrasi backend.')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors"
                style={{ background: '#1E1C43' }}
              >
                <Download size={14} strokeWidth={2} />
                Download Agreement
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ── */
const ROWS_PER_PAGE = 8

export default function PPDocumentsPage() {
  const navigate = useNavigate()
  const [docs, setDocs] = useState(DOCS_INIT)
  const [previewId, setPreviewId] = useState(null)
  const [fBulan, setFBulan] = useState('')
  const [fTahun, setFTahun] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fPaket, setFPaket] = useState('')
  const [fSearch, setFSearch] = useState('')
  const [page, setPage] = useState(1)

  const BSHORT = {Januari:'Jan',Februari:'Feb',Maret:'Mar',April:'Apr',Mei:'Mei',Juni:'Jun',Juli:'Jul',Agustus:'Agu',September:'Sep',Oktober:'Okt',November:'Nov',Desember:'Des'}
  const filtered = useMemo(() => {
    const q = fSearch.toLowerCase()
    return docs
      .filter(d => {
        const matchBulan  = !fBulan  || (d.tglDibuat ?? '').includes(BSHORT[fBulan] ?? fBulan)
        const matchTahun  = !fTahun  || (d.tglDibuat ?? '').includes(fTahun)
        const matchStatus = !fStatus || d.statusTtd === fStatus
        const matchPaket  = !fPaket  || d.paket === fPaket
        const matchSearch = !q || d.namaKlien.toLowerCase().includes(q) || d.orderId.toLowerCase().includes(q) || (d.leadId || '').toLowerCase().includes(q)
        return matchBulan && matchTahun && matchStatus && matchPaket && matchSearch
      })
      .sort((a, b) => parseInt(b.id.split('-')[3]) - parseInt(a.id.split('-')[3]))
  }, [docs, fBulan, fTahun, fStatus, fPaket, fSearch])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const pageRows   = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE)

  useEffect(() => { setPage(1) }, [fBulan, fTahun, fStatus, fPaket, fSearch])

  const stats = useMemo(() => ({
    pending:  docs.filter(d => d.statusTtd === 'pending').length,
    signed:   docs.filter(d => d.statusTtd === 'signed').length,
    waiting:  docs.filter(d => d.statusTtd === 'waiting_approval').length,
    total:    docs.length,
  }), [docs])

  const previewDoc = docs.find(d => d.id === previewId) || null

  const handleApprove = (id) => {
    setDocs(prev => prev.map(d => d.id === id
      ? { ...d, statusTtd: 'signed', tglTtd: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }
      : d
    ))
    setPreviewId(null)
  }

  const handleSubmitSign = (id) => {
    setDocs(prev => prev.map(d => d.id === id
      ? { ...d, statusTtd: 'waiting_approval', tglTtd: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }
      : d
    ))
    setPreviewId(null)
  }

  const paginationRange = () => {
    const pages = []
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    pages.push(1)
    if (safePage > 3) pages.push('...')
    for (let p = Math.max(2, safePage - 1); p <= Math.min(totalPages - 1, safePage + 1); p++) pages.push(p)
    if (safePage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-bold text-text-primary">Agreement Klien</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EAFAF1] text-[#1E8449] border border-[#A9DFBF]">
              <CheckCircle size={11} />
              Paperless · Sign-on-Glass
            </span>
          </div>
          <p className="text-sm text-text-muted mt-0.5">Kelola dokumen persetujuan dan kontrak klien Private Training</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatMini label="Pending TTD" value={stats.pending} color="yellow" />
        <StatMini label="Sudah TTD" value={stats.signed} color="green" />
        <StatMini label="Menunggu Approval" value={stats.waiting} color="blue" />
        <StatMini label="Total Agreement" value={stats.total} color="navy" />
      </div>

      {/* Filters */}
      <div className="bg-bg-surface border border-border rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
        <select value={fBulan} onChange={e => setFBulan(e.target.value)}
          className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
          <option value="">Semua Bulan</option>
          {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map(b => <option key={b}>{b}</option>)}
        </select>
        <select value={fTahun} onChange={e => setFTahun(e.target.value)}
          className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
          <option value="">Semua Tahun</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
        <select value={fStatus} onChange={e => setFStatus(e.target.value)}
          className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
          <option value="">Semua Status</option>
          <option value="signed">Sudah TTD</option>
          <option value="pending">Pending TTD</option>
          <option value="waiting_approval">Menunggu Approval</option>
          <option value="expired">Expired</option>
        </select>
        <select value={fPaket} onChange={e => setFPaket(e.target.value)}
          className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors">
          <option value="">Semua Paket</option>
          {PAKET_OPTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-bg-page border-[1.5px] border-border rounded-lg px-3 py-[7px] focus-within:border-primary focus-within:bg-white transition-colors">
          <Search size={14} className="text-text-muted shrink-0" />
          <input
            type="text"
            value={fSearch}
            onChange={e => setFSearch(e.target.value)}
            placeholder="Cari nama klien, order ID, atau lead ID..."
            className="border-none bg-transparent text-xs outline-none w-full text-text-primary placeholder:text-text-muted"
          />
        </div>
        <button
          onClick={() => { setFBulan(''); setFTahun(''); setFStatus(''); setFPaket(''); setFSearch('') }}
          className="px-3.5 py-[7px] bg-primary hover:bg-primary-2 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-[13px]" style={{ minWidth: '1540px' }}>
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th style={{minWidth:'160px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">No. Agreement</th>
                <th style={{minWidth:'170px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">No. Receipt</th>
                <th style={{minWidth:'160px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">No. Invoice</th>
                <th style={{minWidth:'130px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">Order ID</th>
                <th style={{minWidth:'110px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">Lead ID</th>
                <th style={{minWidth:'150px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">Nama Klien</th>
                <th style={{minWidth:'140px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">Paket</th>
                <th style={{minWidth:'130px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">PIC</th>
                <th style={{minWidth:'130px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">Tanggal Dibuat</th>
                <th style={{minWidth:'120px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">Status</th>
                <th style={{minWidth:'100px'}} className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-text-muted text-[13px]">Tidak ada data yang sesuai filter.</td>
                </tr>
              ) : pageRows.map((d, idx) => (
                <tr
                  key={d.id}
                  onClick={() => setPreviewId(d.id)}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${idx % 2 === 1 ? 'bg-[#FAFAFA]' : ''}`}
                >
                  <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{d.displayId}</td>
                  <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{d.noReceipt}</td>
                  <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{d.refInvoice}</td>
                  <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">
                    <button onClick={e => { e.stopPropagation(); navigate('/pp/orders/' + d.orderId) }} className="hover:underline">#{d.orderId}</button>
                  </td>
                  <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">
                    {d.leadId
                      ? <button onClick={e => { e.stopPropagation(); navigate('/pp/leads/' + d.leadId) }} className="hover:underline">{d.leadId}</button>
                      : <span className="text-gray-400">—</span>
                    }
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <AvatarSm initials={d.initials} color={d.color} />
                      <span className="text-xs font-medium text-gray-900 whitespace-nowrap">{d.namaKlien}</span>
                    </div>
                  </td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{d.paket}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{d.pic}</td>
                  <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{d.tglDibuat}</td>
                  <td className="px-3 py-2.5">
                    <DocBadge status={d.statusTtd} />
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={e => { e.stopPropagation(); setPreviewId(d.id) }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-text-muted hover:text-[#1E1C43]"
                      title="Lihat Dokumen"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-[12px] text-text-muted">
            Menampilkan {filtered.length === 0 ? 0 : (safePage - 1) * ROWS_PER_PAGE + 1}–{Math.min(safePage * ROWS_PER_PAGE, filtered.length)} dari {filtered.length} agreement
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-35 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={13} />
            </button>
            {paginationRange().map((p, i) =>
              p === '...'
                ? <span key={`el-${i}`} className="px-1.5 text-text-muted text-[13px]">…</span>
                : <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg text-[12px] font-semibold transition-colors ${safePage === p ? 'bg-[#1E1C43] text-white' : 'border border-gray-200 text-text-muted hover:bg-gray-50'}`}
                  >{p}</button>
            )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-35 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewId && (
        <PreviewModal
          doc={previewDoc}
          onClose={() => setPreviewId(null)}
          onApprove={handleApprove}
          onSubmitSign={handleSubmitSign}
        />
      )}
    </div>
  )
}
