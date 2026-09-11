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

function DocBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${BADGE_FILLED[status] || 'bg-gray-400 text-white'}`}>
      {STATUS_LABEL[status] || status}
    </span>
  )
}

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
      <div className="h-[72px] flex items-center justify-center mb-2">
        <svg viewBox="0 0 160 48" width="120" height="36">
          <path d="M8,38 C18,14 28,44 42,22 C52,6 60,40 76,18 C88,4 96,36 112,16 C122,6 132,32 152,20" fill="none" stroke="#27AE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M30,42 C40,38 50,44 60,40" fill="none" stroke="#27AE60" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }
  if (status === 'waiting-approval') {
    return (
      <div className="h-[72px] flex items-center justify-center mb-2">
        <svg viewBox="0 0 160 48" width="120" height="36">
          <path d="M8,38 C18,14 28,44 42,22 C52,6 60,40 76,18 C88,4 96,36 112,16 C122,6 132,32 152,20" fill="none" stroke="#2980B9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M30,42 C40,38 50,44 60,40" fill="none" stroke="#2980B9" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }
  if (status === 'expired') {
    return (
      <div className="h-[72px] flex items-center justify-center mb-2">
        <div className="text-center">
          <div className="text-xs font-bold text-[#C0392B]">Agreement Expired</div>
          <div className="text-xs text-[#C0392B] opacity-75 mt-0.5">Perlu pembaharuan dokumen</div>
        </div>
      </div>
    )
  }
  return (
    <div className="h-[72px] flex items-center justify-center mb-2">
      <div className="text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" width="20" height="20" className="mx-auto mb-1"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        <div className="text-[10px] font-semibold text-gray-400">Menunggu TTD Klien</div>
        <div className="text-[9px] text-gray-400 opacity-75">di Perangkat Pelatih</div>
      </div>
    </div>
  )
}

function getTemplatePasal() {
  try {
    const s = localStorage.getItem('efmAgreementTemplate')
    if (s) return JSON.parse(s).pasal
  } catch {}
  return null
}

const DEFAULT_PASAL_DETAIL = [
  { judul: 'Ruang Lingkup Layanan', poin: [
    'PIHAK PERTAMA menyediakan layanan panduan program latihan atau terapi privat secara eksklusif kepada PIHAK KEDUA sesuai dengan detail paket yang dipilih.',
    'Sesi latihan/terapi akan dipandu secara langsung oleh Pelatih atau Terapis resmi yang ditunjuk oleh manajemen PIHAK PERTAMA berdasarkan kualifikasi spesifik yang dibutuhkan oleh program PIHAK KEDUA.',
  ]},
  { judul: 'Masa Berlaku Paket (Validity Period)', poin: [
    'Masa berlaku paket sebagaimana tercantum dalam Lampiran A dihitung mulai dari tanggal sesi pertama yang benar-benar terlaksana dan tercatat dalam sistem EFM ("Tanggal Mulai Aktual"), bukan dari estimasi tanggal mulai yang disepakati pada saat penandatanganan Perjanjian ini. Apabila sesi pertama tidak dapat dilaksanakan sesuai estimasi yang tercantum, masa berlaku paket secara otomatis menyesuaikan mengikuti Tanggal Mulai Aktual tersebut.',
    'Seluruh kuota sesi latihan dalam paket yang telah dibeli wajib diselesaikan sebelum berakhirnya masa berlaku paket, dihitung dari Tanggal Mulai Aktual ditambah durasi masa berlaku sebagaimana tertera pada kolom Masa Berlaku Paket di Lampiran A.',
    'Jika masa berlaku paket telah habis sedangkan PIHAK KEDUA belum menyelesaikan seluruh sesi, maka sisa sesi akan dinyatakan hangus secara otomatis oleh sistem PIHAK PERTAMA, kecuali disebabkan oleh kondisi Force Majeure sebagaimana diatur dalam ketentuan Force Majeure Perjanjian ini.',
  ]},
  { judul: 'Kebijakan Pembatalan dan Penjadwalan Ulang', poin: [
    'Non-Darurat: PIHAK KEDUA wajib melakukan konfirmasi rescheduling atau pembatalan sekurang-kurangnya 24 jam sebelum sesi dimulai.',
    'Darurat/Sakit: Pembatalan mendadak karena sakit wajib disertai bukti pendukung sah (mis. Surat Keterangan Dokter). Tanpa bukti sah, sesi tetap dihitung terpakai.',
    'Sesi Pengganti: Pengaturan jadwal pengganti akibat sakit/izin menjadi tanggung jawab langsung antara PIHAK KEDUA dan Pelatih/Terapis yang ditunjuk.',
    'Pembatalan sepihak oleh PIHAK KEDUA kurang dari 24 jam tanpa alasan darurat yang disetujui akan menyebabkan sesi tersebut hangus otomatis dari total kuota.',
  ]},
  { judul: 'Pembayaran dan Validasi Order', poin: [
    'Seluruh transaksi pemesanan paket dinyatakan sah apabila dilakukan melalui WhatsApp Asisten Virtual / Admin Resmi PIHAK PERTAMA yang terintegrasi dengan payment gateway CV Bugar Nusantara Jaya.',
    'PIHAK KEDUA wajib memastikan detail pesanan sudah sesuai sebelum pelunasan. Pembayaran yang telah divalidasi bersifat final, tidak dapat dibatalkan, dan non-refundable.',
  ]},
  { judul: 'Jaminan Data dan Tanggung Jawab Kesehatan Mandiri', poin: [
    'PIHAK KEDUA menyatakan dan bertanggung jawab penuh bahwa seluruh data pribadi, kondisi fisik, riwayat cedera, dan catatan medis yang diberikan adalah benar, akurat, dan jujur.',
    'PIHAK KEDUA memahami bahwa aktivitas fisik memiliki risiko cedera bawaan dan bertanggung jawab penuh atas keselamatan dirinya selama dan sesudah sesi berlangsung.',
    'PIHAK PERTAMA beserta seluruh manajemen, pelatih, dan terapis dibebaskan dari segala tuntutan hukum atas risiko yang timbul akibat kelalaian PIHAK KEDUA atau adanya kondisi medis tersembunyi.',
  ]},
  { judul: 'Kerjasama dan Etika dengan Pelatih/Terapis', poin: [
    'Setiap Pelatih atau Terapis yang bertugas di PIHAK PERTAMA memiliki kontrak resmi dengan manajemen demi menjaga profesionalitas dan kualitas layanan.',
    'PIHAK KEDUA dilarang keras mempekerjakan atau membuat kesepakatan dengan Pelatih/Terapis PIHAK PERTAMA di luar manajemen tanpa izin tertulis dari Direksi CV Bugar Nusantara Jaya.',
  ]},
  { judul: 'Kerahasiaan dan Perlindungan Data Pribadi', poin: [
    'PIHAK PERTAMA berkomitmen untuk menjaga kerahasiaan seluruh data pribadi dan data kesehatan PIHAK KEDUA, termasuk kondisi fisik, riwayat cedera, dan catatan medis, sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).',
    'Data pribadi PIHAK KEDUA tidak akan dibagikan kepada pihak ketiga tanpa persetujuan tertulis dari PIHAK KEDUA, kecuali diwajibkan oleh ketentuan perundang-undangan yang berlaku.',
    'PIHAK KEDUA memberikan persetujuan kepada PIHAK PERTAMA untuk memproses data pribadi dan data kesehatannya semata-mata dalam rangka pelaksanaan program layanan yang disepakati dalam Perjanjian ini.',
    'PIHAK KEDUA berhak mengajukan permintaan akses, pembaruan, atau penghapusan datanya sesuai mekanisme yang ditetapkan oleh PIHAK PERTAMA.',
  ]},
  { judul: 'Force Majeure', poin: [
    'Force Majeure dalam Perjanjian ini adalah setiap kejadian di luar kendali Para Pihak, termasuk namun tidak terbatas pada: bencana alam, kebakaran, banjir, gempa bumi, pandemi, huru-hara, pemadaman listrik massal, atau kebijakan pemerintah yang melarang kegiatan operasional.',
    'Pihak yang mengalami Force Majeure wajib memberitahukan secara tertulis kepada Pihak lainnya dalam waktu 3 (tiga) hari kerja sejak terjadinya kondisi tersebut, disertai bukti pendukung yang sah.',
    'Sesi yang tidak dapat dilaksanakan selama kondisi Force Majeure berlangsung akan ditangguhkan dan tidak dihitung sebagai sesi terpakai. Masa berlaku paket dapat diperpanjang sebanding dengan durasi Force Majeure yang telah diverifikasi.',
    'Force Majeure tidak membebaskan Para Pihak dari kewajiban pembayaran yang telah jatuh tempo sebelum terjadinya kondisi tersebut.',
  ]},
  { judul: 'Penyelesaian Perselisihan', poin: [
    'Apabila terjadi perselisihan antara Para Pihak sehubungan dengan pelaksanaan Perjanjian ini, Para Pihak sepakat untuk terlebih dahulu menyelesaikannya secara musyawarah untuk mufakat dalam jangka waktu 14 (empat belas) hari kalender sejak perselisihan disampaikan secara tertulis.',
    'Apabila penyelesaian secara musyawarah tidak tercapai, Para Pihak sepakat untuk menyelesaikan perselisihan melalui Badan Penyelesaian Sengketa Konsumen (BPSK) atau Pengadilan Negeri yang berwenang sesuai ketentuan hukum yang berlaku di Republik Indonesia.',
  ]},
  { judul: 'Ketentuan Hukum yang Berlaku', poin: [
    'Perjanjian ini dibuat, ditafsirkan, dan dilaksanakan berdasarkan hukum yang berlaku di Republik Indonesia.',
    'Tanda tangan elektronik dalam Perjanjian ini memiliki kekuatan hukum yang sama dengan tanda tangan basah sesuai Undang-Undang Republik Indonesia Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik (UU ITE) beserta perubahannya.',
    'Setiap pemberitahuan, persetujuan, atau komunikasi resmi antar Para Pihak yang dilakukan melalui WhatsApp atau media elektronik tertulis lainnya dianggap sah dan mengikat secara hukum.',
  ]},
  { judul: 'Perubahan Perjanjian dan Pemisahan Klausul', poin: [
    'Perubahan atau penambahan terhadap ketentuan dalam Perjanjian ini hanya dapat dilakukan berdasarkan kesepakatan tertulis Para Pihak dan merupakan bagian yang tidak terpisahkan dari Perjanjian ini.',
    'Apabila salah satu atau beberapa ketentuan dalam Perjanjian ini dinyatakan tidak sah atau tidak dapat dilaksanakan berdasarkan hukum yang berlaku, maka ketentuan-ketentuan lainnya tetap sah, berlaku, dan mengikat Para Pihak.',
  ]},
  { judul: 'Pernyataan Kesadaran dan Persetujuan', poin: [
    'PIHAK KEDUA menyatakan telah membaca dengan saksama, memahami seluruh isi, serta menerima konsekuensi hukum dari seluruh ketentuan dalam Perjanjian ini.',
    'Perjanjian ini disetujui dan ditandatangani secara elektronik oleh Para Pihak dalam keadaan sadar, sehat jasmani dan rohani, serta tanpa paksaan dari pihak manapun.',
    'PIHAK KEDUA sepakat dan berkomitmen untuk menjalani seluruh rangkaian paket program privat yang telah dibeli sesuai regulasi operasional PIHAK PERTAMA.',
  ]},
]

/* ── Agreement Document ── */
function AgreementDoc({ doc }) {
  const company = getCompanySettings()

  const detailCells = [
    ['Nama Klien',            doc.namaKlien],
    ['Nama Panggilan',        doc.namaPanggilan || '—'],
    ['No. WhatsApp',          doc.noWa || '—'],
    ['Email',                 doc.email || '—'],
    ['Alamat',                doc.alamat || '—'],
    ['Kontak Darurat',        doc.kontakDarurat || '—'],
    ['Order ID',              '#' + doc.orderId],
    ['No. Receipt',           doc.noReceipt || '—'],
    ['Paket Dipilih',         doc.paket],
    ['Total Harga Paket',     doc.harga || '—'],
    ['Masa Berlaku',          doc.masaBerlaku || '—'],
    ['Harga Per Sesi',        doc.hargaPerSesi || 'Rp200.000'],
    ['Durasi Per Sesi',       doc.durasiLatihan || '60 Menit'],
    ['Nama Pelatih',          doc.pic || '—'],
    ['Lokasi Latihan',        doc.lokasiLatihan || '—'],
    ['Hari Latihan',          doc.hariLatihan || '—'],
    ['Jam Latihan',           doc.jamLatihan || '—'],
    ['Estimasi Mulai Program',        doc.tglMulai || '—'],
    ['Estimasi Berakhir Paket (Maks)', doc.tglBerakhir || '—'],
    ['Tanggal Dibuat',                doc.tglDibuat],
  ]

  const sigMeta = () => {
    if (doc.statusTtd === 'signed')
      return (
        <div>
          <span className="text-[#27AE60] text-xs">Ditandatangani secara elektronik</span>
          {doc.ttdMetadata && (
            <div className="mt-1.5 space-y-0.5 text-left">
              <p className="text-[9px] text-gray-400"><span className="font-semibold">Waktu TTD:</span> {doc.ttdMetadata.timestamp}</p>
              <p className="text-[9px] text-gray-400"><span className="font-semibold">Perangkat:</span> {doc.ttdMetadata.device}</p>
              <p className="text-[9px] text-gray-400"><span className="font-semibold">IP:</span> {doc.ttdMetadata.ipAddress}</p>
            </div>
          )}
        </div>
      )
    if (doc.statusTtd === 'waiting-approval')
      return <span className="text-[#2980B9] text-xs">Klien TTD pada: {doc.tglTtd || doc.tglDibuat} — Menunggu approval admin</span>
    if (doc.statusTtd === 'expired')
      return <span className="text-[#C0392B] text-xs">Expired — {doc.tglDibuat}</span>
    return <span className="text-[#B7770D] text-xs">Status: Pending TTD</span>
  }

  const efmTtdContent = () => {
    if (doc.statusTtd === 'signed') {
      return (
        <>
          <div className="h-[72px] flex items-center justify-center">
            {company.tandaTanganCEO
              ? <img src={company.tandaTanganCEO} alt="TTD EFM" className="h-12 object-contain" />
              : <EfmSig />}
          </div>
          <div className="border-t border-gray-100 mt-2 pt-3">
            <p className="text-xs font-semibold text-gray-700">{company.namaPenandatangan || 'Manajemen EFM'}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{company.jabatanPenandatangan || 'Perwakilan Manajemen'}</p>
            {doc.approvalTimestamp && (
              <div className="mt-1.5 space-y-0.5 text-left">
                <p className="text-[9px] text-gray-400"><span className="font-semibold">Disetujui oleh:</span> {doc.approvedBy}</p>
                <p className="text-[9px] text-gray-400"><span className="font-semibold">Waktu:</span> {doc.approvalTimestamp}</p>
              </div>
            )}
          </div>
        </>
      )
    }
    if (doc.statusTtd === 'waiting-approval') {
      return (
        <>
          <div className="h-[72px] flex items-center justify-center">
            <div className="text-center">
              <Clock size={18} className="text-blue-400 mx-auto mb-1" />
              <div className="text-[10px] font-semibold text-blue-500">Menunggu Review Admin</div>
              <div className="text-[9px] text-gray-400 mt-0.5">Klien telah menandatangani</div>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-2 pt-3">
            <p className="text-xs font-semibold text-gray-700">{company.namaPenandatangan || 'Manajemen EFM'}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Belum disetujui</p>
          </div>
        </>
      )
    }
    return (
      <>
        <div className="h-[72px] flex items-center justify-center">
          <div className="text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" width="20" height="20" className="mx-auto mb-1">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <div className="text-[10px] font-semibold text-gray-400">Belum Disetujui</div>
            <div className="text-[9px] text-gray-400 opacity-75">Menunggu TTD Klien</div>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-2 pt-3">
          <p className="text-xs font-semibold text-gray-700">{company.namaPenandatangan || 'Manajemen EFM'}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Belum disetujui</p>
        </div>
      </>
    )
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* Navy header */}
      <div id="agr-hdr" className="bg-[#1E1C43] rounded-t-2xl px-6 py-4 sm:px-8 sm:py-5 grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-4 text-white">
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

        <div id="agr-hdr-right" className="text-left sm:text-right">
          <div id="agr-hdr-title" className="text-2xl sm:text-4xl font-black tracking-widest uppercase leading-tight">PERJANJIAN</div>
          <div className="text-xs text-gray-400 mt-0.5 tracking-wide">Layanan Program Privat</div>
          <div className="text-sm text-gray-300 mt-1">{doc.displayId}</div>
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

      {/* Komparisi — langsung setelah header */}
      <div id="agr-komparisi" className="px-6 py-4">
        <p className="text-xs text-gray-700 leading-relaxed mb-3">Yang bertandatangan di bawah ini:</p>
        <div className="space-y-2.5">
          <div className="border border-gray-200 rounded-xl px-3 py-2.5 bg-white">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">1. Pihak Pertama</p>
            <div className="space-y-0.5">
              <p className="text-xs text-gray-700"><span className="font-semibold inline-block w-32">Nama</span>: {company.namaPenandatangan || 'Manajemen EFM'}</p>
              <p className="text-xs text-gray-700"><span className="font-semibold inline-block w-32">Jabatan</span>: {company.jabatanPenandatangan || 'Perwakilan Manajemen'}</p>
              <p className="text-xs text-gray-700"><span className="font-semibold inline-block w-32">Bertindak untuk</span>: {company.namaPerusahaan} / {company.namaLegal}</p>
              <p className="text-xs text-gray-700"><span className="font-semibold inline-block w-32">Alamat</span>: {company.alamat}</p>
            </div>
            <p className="text-[10px] font-semibold text-[#1E1C43] mt-2">(selanjutnya disebut <strong>"PIHAK PERTAMA"</strong>)</p>
          </div>
          <div className="border border-gray-200 rounded-xl px-3 py-2.5 bg-white">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">2. Pihak Kedua</p>
            <div className="space-y-0.5">
              <p className="text-xs text-gray-700"><span className="font-semibold inline-block w-32">Nama</span>: {doc.sapaan ? doc.sapaan + ' ' : ''}{doc.namaKlien}</p>
              <p className="text-xs text-gray-700"><span className="font-semibold inline-block w-32">No. WhatsApp</span>: {doc.noWa || '—'}</p>
              <p className="text-xs text-gray-700"><span className="font-semibold inline-block w-32">Alamat</span>: {doc.alamat || '—'}</p>
              {doc.pendaftarSamaDenganKlien === false && doc.namaWali && (
                <>
                  <p className="text-xs text-gray-700"><span className="font-semibold inline-block w-32">Diwakili oleh</span>: {doc.namaWali} ({doc.hubunganWali})</p>
                  <p className="text-xs text-gray-700"><span className="font-semibold inline-block w-32">WA Wali</span>: {doc.noWaWali || '—'}</p>
                </>
              )}
            </div>
            <p className="text-[10px] font-semibold text-[#1E1C43] mt-2">(selanjutnya disebut <strong>"PIHAK KEDUA"</strong>)</p>
          </div>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed mt-3">
          Selanjutnya PIHAK PERTAMA dan PIHAK KEDUA secara bersama-sama disebut <strong>"Para Pihak"</strong>. Para Pihak sepakat untuk mengikatkan diri dalam Perjanjian ini dengan ketentuan-ketentuan sebagai berikut:
        </p>
      </div>

      {/* Konsiderans */}
      <div id="agr-konsiderans" className="px-6 pb-4">
        <div className="border border-gray-200 rounded-xl px-4 py-3 bg-white">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Konsiderans</p>
          <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
            <p>Bahwa PIHAK PERTAMA adalah badan usaha yang bergerak di bidang layanan program kebugaran dan pelatihan fisik privat, serta memiliki kapasitas dan kompetensi untuk menyelenggarakan layanan tersebut secara profesional.</p>
            <p>Bahwa PIHAK KEDUA bermaksud menggunakan layanan program latihan atau terapi privat yang disediakan oleh PIHAK PERTAMA sesuai kebutuhan dan kemampuannya.</p>
            <p>Bahwa Para Pihak sepakat untuk saling mengikatkan diri dalam suatu Perjanjian Layanan Program Privat yang diatur dengan ketentuan-ketentuan sebagaimana tersebut di bawah ini.</p>
          </div>
        </div>
      </div>

      {/* Ketentuan-Ketentuan Perjanjian */}
      <div className="px-6 pb-5">
        <div className="bg-[#1E1C43] rounded-lg px-4 py-2 text-center text-xs font-bold text-white uppercase tracking-wide mb-4">Ketentuan-Ketentuan Perjanjian</div>
        <div id="agr-pasals-card" className="border border-gray-200 rounded-xl p-4">
          {(getTemplatePasal() || DEFAULT_PASAL_DETAIL).map(({ judul, poin }, pi) => (
            <div key={pi} className={pi > 0 ? 'mt-4 pt-4 border-t border-gray-100' : ''}>
              <div className="text-center mb-1.5">
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
      </div>

      {/* Pernyataan Klien */}
      <div id="agr-pernyataan" className="px-6 pb-4">
        <div className="border border-gray-200 rounded-xl px-4 py-3.5 bg-white">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Pernyataan Klien</p>
          <div className="space-y-2 text-xs text-gray-700 leading-relaxed text-justify">
            <p>Dengan ini, saya sebagai PIHAK KEDUA dalam Perjanjian ini, dengan penuh kesadaran dan tanpa adanya paksaan dari pihak manapun, menyatakan bahwa saya telah membaca dengan saksama dan memahami sepenuhnya isi dari Perjanjian Layanan Program Privat ini beserta seluruh ketentuan yang berlaku di Essential Fitness Management.</p>
            <p>Saya setuju dan berkomitmen untuk mematuhi segala ketentuan yang tercantum dalam Perjanjian ini, termasuk ketentuan-ketentuan lainnya yang ditetapkan oleh PIHAK PERTAMA.</p>
            <p>Saya mengakui bahwa Perjanjian ini beserta seluruh ketentuan terkait adalah sah dan mengikat secara hukum, dan saya bersedia mematuhi ketentuan tersebut selama berlangsungnya paket program. Perjanjian ini berlaku mulai dari tanggal sesi pertama dimulai hingga berakhirnya seluruh sesi dalam paket yang telah disepakati, kecuali ada ketentuan lain dari PIHAK PERTAMA.</p>
          </div>
        </div>
      </div>

      {/* Tanda Tangan */}
      <div id="agr-ttd-section" className="px-6 pb-6">
        <div className="bg-[#1E1C43] rounded-lg px-4 py-2 text-center text-xs font-bold text-white uppercase tracking-wide mb-3">Tanda Tangan Para Pihak</div>
        <p className="text-xs text-gray-500 text-center mb-4">Jakarta, {doc.tglDibuat}</p>
        <div className="grid grid-cols-2 gap-5">
          {/* Pihak Pertama — EFM */}
          <div className="border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Pihak Pertama</p>
            <p className="text-xs font-bold text-[#1E1C43] mb-3">Essential Fitness Management (EFM)</p>
            {efmTtdContent()}
          </div>
          {/* Pihak Kedua — Klien / Wali */}
          <div className="border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Pihak Kedua</p>
            <p className="text-xs font-bold text-[#1E1C43] mb-3">{doc.pendaftarSamaDenganKlien === false ? 'Wali / Pendaftar' : 'Klien'}</p>
            <ClientSig status={doc.statusTtd} />
            <div className="border-t border-gray-100 mt-2 pt-3">
              <p className="text-xs font-semibold text-gray-700">
                {doc.pendaftarSamaDenganKlien === false && doc.namaWali ? doc.namaWali : doc.namaKlien}
              </p>
              {doc.pendaftarSamaDenganKlien === false && doc.namaWali && (
                <p className="text-[10px] text-gray-400 mt-0.5">Bertindak atas nama: {doc.namaKlien}</p>
              )}
              <div className="mt-0.5">{sigMeta()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Document footer */}
      <div className="px-6 pb-4 border-t border-gray-100 pt-4 text-center space-y-0.5">
        <p className="text-xs text-gray-400">Terima kasih atas kepercayaan Anda. Simpan dokumen ini sebagai bukti perjanjian yang sah.</p>
        <p className="text-xs font-semibold text-gray-500">Powered by {company.namaPerusahaan}&nbsp;&nbsp;|&nbsp;&nbsp;{company.namaLegal}</p>
      </div>

      {/* Lampiran A — Detail Paket & Informasi Order */}
      <div id="agr-lampiran" className="px-6 pb-6 border-t border-dashed border-gray-200 pt-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide text-center mb-3">Lampiran A — Detail Paket &amp; Informasi Order</p>
        <div id="agr-detail-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {detailCells.map(([lbl, val]) => (
            <div key={lbl} className="border border-gray-200 rounded-xl px-3 py-2.5 bg-white min-w-0 overflow-hidden">
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-0.5">{lbl}</div>
              <div className="agr-cell-val text-sm font-semibold text-[#1E1C43] break-words">{val}</div>
            </div>
          ))}
        </div>

        <p className="text-[9px] text-gray-400 mt-2 text-center italic">
          * Estimasi mulai dan berakhir dihitung dari rencana sesi pertama saat penandatanganan. Masa berlaku aktual dihitung dari tanggal sesi pertama yang benar-benar terlaksana (lihat Pasal 2).
        </p>

        {/* Keterangan Tambahan */}
        <div className="mt-3 border border-gray-200 rounded-xl px-4 py-3 bg-white">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Keterangan Tambahan</p>
          <div className="space-y-2.5">
            <div>
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-0.5">Peralatan Latihan Klien</div>
              <div className="text-xs font-semibold text-gray-700">{doc.peralatanLatihan || '—'}</div>
            </div>
            <div className="border-t border-gray-100 pt-2.5">
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-0.5">Catatan Khusus Dari Klien</div>
              <div className="agr-catatan-val text-xs font-semibold text-gray-700">{doc.catatanKhusus || 'Tidak ada'}</div>
            </div>
          </div>
        </div>
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
    const company = getCompanySettings()
    const now = new Date()
    const tglTtd = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    const approvalTimestamp = tglTtd + ', ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    const approvedBy = company.namaPenandatangan || 'Admin EFM'
    updateDoc(doc.id, { statusTtd: 'signed', tglTtd, approvedBy, approvalTimestamp })
    setDoc(prev => ({ ...prev, statusTtd: 'signed', tglTtd, approvedBy, approvalTimestamp }))
  }

  return (
    <div id="agr-page-root" className="flex flex-col gap-4 pb-24">

      {/* Print CSS — isolate agreement document, hide admin chrome */}
      <style>{`
        @media print {
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; height: auto !important; }

          /* Sembunyikan semua konten, lalu tampilkan hanya area cetak */
          body * { visibility: hidden; }
          #agr-print-area, #agr-print-area * { visibility: visible; }

          /* Kolapskan admin chrome dari flow */
          .no-print { display: none !important; }

          /* position:absolute agar area cetak menempel ke pojok kiri atas
             tanpa dipengaruhi layout admin di sekitarnya */
          #agr-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          #agr-print-area > div {
            width: 100% !important;
            min-width: unset !important;
            max-width: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
            background: white !important;
          }
          #agr-print-area > div > * { overflow: visible !important; }

          /* sm: breakpoint tidak aktif di print viewport */
          #agr-hdr {
            grid-template-columns: 1.5fr 1fr !important;
            padding: 1rem 1.25rem !important;
          }
          #agr-hdr-right { text-align: right !important; }
          #agr-hdr-right .agr-date-row { justify-content: flex-end !important; }
          #agr-hdr-title { font-size: 2.25rem !important; line-height: 2.5rem !important; }
          #agr-detail-grid { grid-template-columns: repeat(2, 1fr) !important; }

          /* Page break — tiap pasal, komparisi, TTD, konsiderans, dan pernyataan tidak terpotong */
          #agr-pasals-card > div { break-inside: avoid; page-break-inside: avoid; }
          #agr-ttd-section { break-inside: avoid; page-break-inside: avoid; }
          #agr-komparisi { break-inside: avoid; page-break-inside: avoid; }
          #agr-konsiderans { break-inside: avoid; page-break-inside: avoid; }
          #agr-pernyataan { break-inside: avoid; page-break-inside: avoid; }

          /* Lampiran A — selalu mulai di halaman baru (mandiri)
             Hapus border dashed karena sudah halaman sendiri */
          #agr-lampiran {
            break-before: page;
            page-break-before: always;
            border-top: none !important;
            padding-top: 1rem !important;
          }

          /* Kunci tinggi cell agar tiap klien konsisten */
          .agr-cell-val {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            word-break: break-word;
          }
          /* Catatan khusus boleh sedikit lebih panjang */
          .agr-catatan-val {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
            word-break: break-word;
          }

          .no-print { display: none !important; }
          * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          @page {
            margin: 10mm;
            size: A4 portrait;
            @bottom-right {
              content: "Halaman " counter(page) " dari " counter(pages);
              font-size: 8pt;
              color: #9ca3af;
              font-family: 'Poppins', sans-serif;
            }
          }
        }
      `}</style>

      {/* Page header */}
      <div className="no-print bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
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
                <p className="text-[10px] text-blue-600 mt-1.5 font-semibold flex items-center gap-1">
                  <CheckCircle size={10} /> Notifikasi WhatsApp telah dikirim ke admin.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

    </div>
  )
}
