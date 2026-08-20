import { useState, useRef, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, Edit, Eye, Download, Upload, FileText,
  ChevronDown, ChevronUp, Star, X, Check, Plus,
  CheckCircle, AlertCircle, Clock,
} from 'lucide-react'
import { picList } from '../../data/opsData'

const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

/* ── Dummy data ───────────────────────────────────────────────────────────── */

const PROFIL_EXTRA = {
  'PIC-001': {
    tglLahir: '15 Mar 1995', jenisKelamin: 'Perempuan',
    email: 'sarah@efm.co.id', alamat: 'Jl. Sudirman No. 12, Jakarta Selatan',
    spesialisasiList: 'Personal Training, Yoga',
    tglBergabung: '1 Jan 2024', rating: 4.8, totalKlien: 12,
    namaBank: 'Bank Central Asia (BCA)',
    cabangBank: 'Cabang Fatmawati Jakarta Selatan',
    noRekening: '1234567890',
    atasNama: 'Sarah Jenkins',
  },
}

const PKS_DATA = {
  'PIC-001': [
    { no: 'PKS-001', mulai: '1 Jan 2024', selesai: '31 Des 2024', status: 'expired',    fileName: 'PKS-001_SarahJane_2024.pdf', size: '1.5 MB' },
    { no: 'PKS-002', mulai: '1 Jan 2025', selesai: '31 Des 2025', status: 'expired',    fileName: 'PKS-002_SarahJane_2025.pdf', size: '1.5 MB' },
    { no: 'PKS-003', mulai: '1 Jan 2026', selesai: '31 Des 2026', status: 'aktif',      fileName: 'PKS-003_SarahJane_2026.pdf', size: '1.6 MB' },
  ],
  'PIC-002': [
    { no: 'PKS-001', mulai: '1 Mar 2024', selesai: '28 Feb 2025', status: 'expired',    fileName: 'PKS-001_BudiSantoso_2024.pdf', size: '1.4 MB' },
    { no: 'PKS-002', mulai: '1 Mar 2025', selesai: '28 Feb 2026', status: 'expired',    fileName: 'PKS-002_BudiSantoso_2025.pdf', size: '1.4 MB' },
    { no: 'PKS-003', mulai: '1 Mar 2026', selesai: '28 Feb 2027', status: 'aktif',      fileName: 'PKS-003_BudiSantoso_2026.pdf', size: '1.5 MB' },
  ],
  'PIC-003': [
    { no: 'PKS-001', mulai: '1 Jun 2023', selesai: '31 Mei 2024', status: 'expired',    fileName: 'PKS-001_Ahmad_2023.pdf', size: '1.3 MB' },
    { no: 'PKS-002', mulai: '1 Jun 2024', selesai: '31 Mei 2025', status: 'expired',    fileName: 'PKS-002_Ahmad_2024.pdf', size: '1.3 MB' },
    { no: 'PKS-003', mulai: '1 Jun 2025', selesai: '31 Mei 2026', status: 'akan_habis', fileName: 'PKS-003_Ahmad_2025.pdf', size: '1.4 MB' },
  ],
}

const DOK_MASTER = [
  { id: 'ktp',     nama: 'KTP',                format: 'PDF/JPG/PNG', maxMB: 5,  accept: 'image/*,.pdf,application/pdf' },
  { id: 'foto',    nama: 'Foto Profil',          format: 'JPG/PNG',     maxMB: 2,  accept: 'image/jpeg,image/png' },
  { id: 'sertif',  nama: 'Sertifikat Keahlian', format: 'PDF',         maxMB: 10, accept: '.pdf,application/pdf' },
  { id: 'npwp',    nama: 'NPWP',                 format: 'PDF/JPG/PNG', maxMB: 5,  accept: 'image/*,.pdf,application/pdf' },
  { id: 'kontrak', nama: 'Kontrak/PKS',           format: 'PDF',         maxMB: 10, accept: '.pdf,application/pdf' },
  { id: 'sertif2', nama: 'Sertifikat Tambahan',  format: 'PDF',         maxMB: 10, accept: '.pdf,application/pdf' },
]

const DOK_STATUS_INIT = {
  'PIC-001': {
    ktp:     { uploaded: true,  fileName: 'KTP_SarahJane.pdf',          size: '1.2 MB', uploadDate: '15 Jan 2024' },
    foto:    { uploaded: true,  fileName: 'Foto_SarahJane.jpg',          size: '0.8 MB', uploadDate: '15 Jan 2024' },
    sertif:  { uploaded: true,  fileName: 'Sertif_PersonalTraining.pdf', size: '2.4 MB', uploadDate: '20 Jan 2024' },
    npwp:    { uploaded: false },
    kontrak: { uploaded: false },
    sertif2: { uploaded: false },
  },
  'PIC-002': {
    ktp:     { uploaded: true,  fileName: 'KTP_BudiSantoso.pdf',         size: '1.1 MB', uploadDate: '1 Mar 2024' },
    foto:    { uploaded: false },
    sertif:  { uploaded: true,  fileName: 'Sertif_Yoga_Budi.pdf',        size: '1.8 MB', uploadDate: '1 Mar 2024' },
    npwp:    { uploaded: false },
    kontrak: { uploaded: false },
    sertif2: { uploaded: false },
  },
  'PIC-003': {
    ktp:     { uploaded: true,  fileName: 'KTP_Ahmad.pdf',               size: '0.9 MB', uploadDate: '1 Jun 2023' },
    foto:    { uploaded: true,  fileName: 'Foto_Ahmad.jpg',               size: '0.7 MB', uploadDate: '1 Jun 2023' },
    sertif:  { uploaded: true,  fileName: 'Sertif_Therapist_Ahmad.pdf',  size: '2.1 MB', uploadDate: '1 Jun 2023' },
    npwp:    { uploaded: true,  fileName: 'NPWP_Ahmad.pdf',              size: '0.3 MB', uploadDate: '15 Jun 2023' },
    kontrak: { uploaded: false },
    sertif2: { uploaded: false },
  },
}

const ASGN_AKTIF = {
  'PIC-001': [
    { id: 'ASG-001', klien: 'Alex Chen',       program: 'PT 10x',      jadwal: 'Sen-Rab 14:00', sesiDone: 7,  sesiTotal: 10 },
    { id: 'ASG-002', klien: 'Lisa Wong',        program: 'Yoga 8x',     jadwal: 'Sel-Kam 16:00', sesiDone: 3,  sesiTotal: 8  },
  ],
  'PIC-002': [
    { id: 'ASG-003', klien: 'The Summit Apt.', program: 'B2B Monthly', jadwal: 'Setiap Hari',   sesiDone: 45, sesiTotal: 96 },
  ],
}

const ASGN_RIWAYAT = {
  'PIC-001': [
    { id: 'ASG-H001', klien: 'Robert Taylor', program: 'PT 48x', periode: 'Jan–Jun 2026', totalSesi: 48, status: 'Selesai' },
    { id: 'ASG-H002', klien: 'Anna Johnson',  program: 'PT 8x',  periode: 'Apr–Mei 2026', totalSesi: 8,  status: 'Selesai' },
  ],
  'PIC-002': [
    { id: 'ASG-H003', klien: 'Tony Stark',    program: 'PT 48x', periode: 'Jan–Jun 2026', totalSesi: 48, status: 'Selesai' },
  ],
}

const ABSENSI_DATA = {
  'PIC-001': [
    { periode: 'Jun 2026', klien: 'Alex Chen',    program: 'PT 10x',  jumlahSesi: 10, tglPengajuan: '18 Jun 2026', status: 'Menunggu Review'  },
    { periode: 'Mei 2026', klien: 'Lisa Wong',    program: 'Yoga 8x', jumlahSesi: 8,  tglPengajuan: '3 Jun 2026',  status: 'Sudah Diapprove' },
    { periode: 'Apr 2026', klien: 'Anna Johnson', program: 'PT 8x',   jumlahSesi: 8,  tglPengajuan: '2 Mei 2026',  status: 'Sudah Diapprove' },
  ],
  'PIC-002': [
    { periode: 'Jun 2026', klien: 'The Summit Apt.', program: 'B2B Monthly', jumlahSesi: 22, tglPengajuan: '20 Jun 2026', status: 'Menunggu Review' },
  ],
}

const BAYAR_DATA = {
  'PIC-001': [
    { periode: 'Mei 2026', program: 'Yoga 8x', jumlahSesi: 8,  honorarium: 600000,  metode: 'Transfer BCA', tglBayar: '5 Jun 2026',  status: 'Sudah Dibayar' },
    { periode: 'Apr 2026', program: 'PT 8x',   jumlahSesi: 8,  honorarium: 600000,  metode: 'Transfer BCA', tglBayar: '2 Mei 2026',  status: 'Sudah Dibayar' },
    { periode: 'Mar 2026', program: 'PT 10x',  jumlahSesi: 10, honorarium: 750000,  metode: 'Transfer BCA', tglBayar: '1 Apr 2026',  status: 'Sudah Dibayar' },
  ],
  'PIC-002': [
    { periode: 'Jun 2026', program: 'B2B Monthly', jumlahSesi: 22, honorarium: 1650000, metode: 'Transfer BNI', tglBayar: '25 Jun 2026', status: 'Sudah Dibayar' },
  ],
}

/* ── Config maps ──────────────────────────────────────────────────────────── */

const STATUS_PIC = {
  aktif:    { label: 'Aktif',    cls: 'bg-green-100 text-green-700 border border-green-200'    },
  nonaktif: { label: 'Nonaktif', cls: 'bg-gray-100 text-gray-500 border border-gray-200'       },
  cuti:     { label: 'Cuti',     cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
}

const PKS_STATUS = {
  aktif:      { label: 'Aktif',      cls: 'bg-green-100 text-green-700'   },
  akan_habis: { label: 'Akan Habis', cls: 'bg-orange-100 text-orange-600' },
  expired:    { label: 'Expired',    cls: 'bg-red-100 text-red-500'       },
}

const ABS_STATUS_CLS = {
  'Menunggu Review': 'bg-yellow-100 text-yellow-700',
  'Sudah Diapprove': 'bg-green-100 text-green-700',
  'Ditolak':         'bg-red-100 text-red-600',
}

const BAYAR_STATUS_CLS = {
  'Sudah Dibayar': 'bg-green-100 text-green-700',
  'Dalam Proses':  'bg-blue-100 text-blue-700',
  'Pending':       'bg-gray-100 text-gray-500',
}

const TOAST_BG = {
  success: 'bg-green-600',
  error:   'bg-red-600',
  info:    'bg-[#1E1C43]',
  warning: 'bg-yellow-500',
}

const TAB_PARAM_MAP = {
  'kontrak':    'Kontrak/PKS',
  'dokumen':    'Dokumen',
  'assignment': 'Assignment',
  'absensi':    'Absensi',
  'pembayaran': 'Pembayaran',
  'profil':     'Profil',
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function fmt(n) {
  if (!n && n !== 0) return '—'
  return 'Rp ' + n.toLocaleString('id-ID')
}

function Badge({ label, cls }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${cls}`}>
      {label}
    </span>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="py-2.5 border-b border-gray-100 last:border-0">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-normal text-gray-700">{value || '—'}</p>
    </div>
  )
}

function InputRow({ label, children }) {
  return (
    <div className="py-2.5 border-b border-gray-100 last:border-0">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      {children}
    </div>
  )
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1 mt-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13} className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
      <span className="text-sm font-semibold text-gray-700 ml-1">{rating}</span>
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      {title && (
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#1E1C43]">{title}</h3>
        </div>
      )}
      {children}
    </div>
  )
}

function TH({ children }) {
  return (
    <th className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-2.5 text-left whitespace-nowrap bg-gray-50">
      {children}
    </th>
  )
}

function TD({ children, className = '' }) {
  return (
    <td className={`text-xs font-normal text-gray-600 px-3 py-2.5 ${className}`}>
      {children}
    </td>
  )
}

/* ── File View Modal ──────────────────────────────────────────────────────── */
function FileModal({ title, fileName, size, uploadDate, onClose, onDownload }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-[15px] font-bold text-[#1E1C43]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-[#1E1C43] transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="px-6 py-8 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <FileText size={28} className="text-[#1E1C43]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[#1E1C43]">{fileName}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {size}{uploadDate ? ` · Diupload ${uploadDate}` : ''}
            </p>
          </div>
          <p className="text-xs text-gray-400 text-center">Preview tidak tersedia. Gunakan tombol Download untuk membuka file.</p>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-gray-500 border border-gray-200 rounded-lg hover:border-[#1E1C43] transition-colors">
            Tutup
          </button>
          {onDownload && (
            <button onClick={onDownload} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E1C43] hover:bg-[#2D2B5A] text-white text-[13px] font-semibold rounded-lg transition-colors">
              <Download size={13} />Download
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const TABS = ['Profil', 'Kontrak/PKS', 'Dokumen', 'Assignment', 'Absensi', 'Pembayaran']

/* ── Tab 1: Profil ────────────────────────────────────────────────────────── */
function TabProfil({ pic, extra, isEditing, editForm, setEditForm, onEditStart, onEditSave, onEditCancel }) {
  const statusCfg = STATUS_PIC[pic.status] ?? { label: pic.status, cls: 'bg-gray-100 text-gray-500' }
  const set = k => e => setEditForm(f => ({ ...f, [k]: e.target.value }))
  const inputCls = 'w-full text-sm text-gray-700 px-2.5 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-[#1E1C43] bg-white'

  return (
    <div className="space-y-4">
      {/* Edit buttons row */}
      <div className="flex justify-end">
        {isEditing ? (
          <div className="flex items-center gap-2.5">
            <button
              onClick={onEditCancel}
              className="inline-flex items-center gap-1.5 border border-gray-300 text-gray-500 text-[13px] font-semibold px-4 py-2 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={onEditSave}
              className="inline-flex items-center gap-1.5 bg-[#E05945] hover:bg-[#c94a38] text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Check size={13} />Simpan Perubahan
            </button>
          </div>
        ) : (
          <button
            onClick={onEditStart}
            className="inline-flex items-center gap-1.5 border border-[#1E1C43] text-[#1E1C43] text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit size={13} />Edit Profil
          </button>
        )}
      </div>

      {/* 2-column info grid */}
      {isEditing ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#1E1C43] mb-3">Informasi Pribadi</h3>
            <InputRow label="Nama Lengkap">
              <input className={inputCls} value={editForm.nama ?? ''} onChange={set('nama')} />
            </InputRow>
            <InfoRow label="ID PIC" value={`EFM-${pic.id}`} />
            <InputRow label="Tanggal Lahir">
              <input className={inputCls} value={editForm.tglLahir ?? ''} onChange={set('tglLahir')} placeholder="cth: 15 Mar 1995" />
            </InputRow>
            <InputRow label="Jenis Kelamin">
              <select className={inputCls} value={editForm.jenisKelamin ?? ''} onChange={set('jenisKelamin')}>
                <option value="">Pilih</option>
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
            </InputRow>
            <InputRow label="No HP">
              <input className={inputCls} value={editForm.noHp ?? ''} onChange={set('noHp')} />
            </InputRow>
            <InputRow label="Email">
              <input className={inputCls} type="email" value={editForm.email ?? ''} onChange={set('email')} />
            </InputRow>
            <InputRow label="Alamat">
              <textarea className={inputCls + ' resize-none'} rows={2} value={editForm.alamat ?? ''} onChange={set('alamat')} />
            </InputRow>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#1E1C43] mb-3">Informasi Profesional</h3>
            <InputRow label="Spesialisasi">
              <input className={inputCls} value={editForm.spesialisasiList ?? ''} onChange={set('spesialisasiList')} />
            </InputRow>
            <InputRow label="Tanggal Bergabung">
              <input className={inputCls} value={editForm.tglBergabung ?? ''} onChange={set('tglBergabung')} placeholder="cth: 1 Jan 2024" />
            </InputRow>
            <div className="py-2.5 border-b border-gray-100">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Status</p>
              <Badge label={statusCfg.label} cls={statusCfg.cls} />
            </div>
            {extra.rating != null && (
              <div className="py-2.5 border-b border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Rating</p>
                <StarRating rating={extra.rating} />
              </div>
            )}
            <InfoRow label="Total Klien Dilayani"
              value={extra.totalKlien != null ? `${extra.totalKlien} klien` : `${pic.klienAktif ?? 0} klien`} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#1E1C43] mb-3">Informasi Pribadi</h3>
            <InfoRow label="Nama Lengkap"  value={extra.nama ?? pic.nama} />
            <InfoRow label="ID PIC"        value={`EFM-${pic.id}`} />
            <InfoRow label="Tanggal Lahir" value={extra.tglLahir} />
            <InfoRow label="Jenis Kelamin" value={extra.jenisKelamin} />
            <InfoRow label="No HP"         value={extra.noHp ?? pic.noHp} />
            <InfoRow label="Email"         value={extra.email} />
            <InfoRow label="Alamat"        value={extra.alamat} />
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#1E1C43] mb-3">Informasi Profesional</h3>
            <InfoRow label="Spesialisasi"       value={extra.spesialisasiList ?? pic.spesialis} />
            <InfoRow label="Tanggal Bergabung"  value={extra.tglBergabung ?? pic.tglMulaiPks} />
            <div className="py-2.5 border-b border-gray-100">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Status</p>
              <Badge label={statusCfg.label} cls={statusCfg.cls} />
            </div>
            {extra.rating != null && (
              <div className="py-2.5 border-b border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Rating</p>
                <StarRating rating={extra.rating} />
              </div>
            )}
            <InfoRow label="Total Klien Dilayani"
              value={extra.totalKlien != null ? `${extra.totalKlien} klien` : `${pic.klienAktif ?? 0} klien`} />
          </div>
        </div>
      )}

      {/* Rekening Bank — full width */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#1E1C43] mb-3">Informasi Rekening Bank</h3>
        {isEditing ? (
          <div className="grid grid-cols-2 gap-x-8">
            <InputRow label="Nama Bank">
              <input className={inputCls} value={editForm.namaBank ?? ''} onChange={set('namaBank')} placeholder="cth: Bank Central Asia (BCA)" />
            </InputRow>
            <InputRow label="Cabang Bank">
              <input className={inputCls} value={editForm.cabangBank ?? ''} onChange={set('cabangBank')} placeholder="cth: Cabang Fatmawati Jakarta Selatan" />
            </InputRow>
            <InputRow label="Nomor Rekening">
              <input className={inputCls} value={editForm.noRekening ?? ''} onChange={set('noRekening')} placeholder="cth: 1234567890" />
            </InputRow>
            <InputRow label="Atas Nama">
              <input className={inputCls} value={editForm.atasNama ?? ''} onChange={set('atasNama')} />
            </InputRow>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-8">
            <InfoRow label="Nama Bank"      value={extra.namaBank} />
            <InfoRow label="Cabang Bank"    value={extra.cabangBank} />
            <InfoRow label="Nomor Rekening" value={extra.noRekening} />
            <InfoRow label="Atas Nama"      value={extra.atasNama} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Tab 2: Kontrak/PKS ───────────────────────────────────────────────────── */
function TabKontrak({ pic, showToast }) {
  const [contracts, setContracts] = useState(PKS_DATA[pic.id] ?? [])
  const [viewPks, setViewPks] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({ tglMulai: '', tglSelesai: '' })
  const [uploadFile, setUploadFile] = useState(null)
  const fileRef = useRef(null)

  const active = contracts.find(c => c.status === 'aktif' || c.status === 'akan_habis')
  const activeCfg = active ? (PKS_STATUS[active.status] ?? PKS_STATUS.aktif) : null

  const kpiAktif     = contracts.filter(c => c.status === 'aktif').length
  const kpiAkanHabis = contracts.filter(c => c.status === 'akan_habis').length
  const kpiExpired   = contracts.filter(c => c.status === 'expired').length

  function handleDownload(pks) {
    const a = document.createElement('a')
    a.href = '#'
    a.download = pks.fileName ?? `${pks.no}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    showToast(`✓ Download ${pks.fileName ?? pks.no} dimulai`)
  }

  function handleUploadSubmit() {
    if (!uploadFile) { showToast('Pilih file PDF terlebih dahulu', 'error'); return }
    if (!uploadForm.tglMulai || !uploadForm.tglSelesai) { showToast('Tanggal mulai dan selesai wajib diisi', 'error'); return }
    if (uploadFile.size > 10 * 1024 * 1024) { showToast('File terlalu besar (maks 10 MB)', 'error'); return }
    if (uploadFile.type !== 'application/pdf' && !uploadFile.name.toLowerCase().endsWith('.pdf')) {
      showToast('Hanya file PDF yang diizinkan', 'error'); return
    }
    const newIdx = contracts.length + 1
    const newNo  = `PKS-${String(newIdx).padStart(3, '0')}`
    const fmtDate = d => {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    }
    setContracts(prev => [
      ...prev.map(c => ({
        ...c,
        status: c.status === 'aktif' || c.status === 'akan_habis' ? 'expired' : c.status,
      })),
      {
        no: newNo,
        mulai: fmtDate(uploadForm.tglMulai),
        selesai: fmtDate(uploadForm.tglSelesai),
        status: 'aktif',
        fileName: uploadFile.name,
        size: (uploadFile.size / (1024 * 1024)).toFixed(1) + ' MB',
      },
    ])
    showToast(`✓ PKS baru ${newNo} berhasil diupload`)
    setShowUploadModal(false)
    setUploadForm({ tglMulai: '', tglSelesai: '' })
    setUploadFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`bg-white border rounded-xl p-4 flex items-center gap-3 ${kpiAktif > 0 ? 'border-green-200' : 'border-red-200'}`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${kpiAktif > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <CheckCircle size={16} className={kpiAktif > 0 ? 'text-green-600' : 'text-red-500'} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">PKS Aktif</p>
            <p className={`text-2xl font-bold ${kpiAktif > 0 ? 'text-green-600' : 'text-red-500'}`}>{kpiAktif}</p>
          </div>
        </div>
        <div className={`bg-white border rounded-xl p-4 flex items-center gap-3 ${kpiAkanHabis > 0 ? 'border-orange-200' : 'border-gray-200'}`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${kpiAkanHabis > 0 ? 'bg-orange-50' : 'bg-gray-100'}`}>
            <AlertCircle size={16} className={kpiAkanHabis > 0 ? 'text-orange-500' : 'text-gray-400'} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Akan Habis ≤90 hari</p>
            <p className={`text-2xl font-bold ${kpiAkanHabis > 0 ? 'text-orange-500' : 'text-gray-500'}`}>{kpiAkanHabis}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <Clock size={16} className="text-gray-400" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">PKS Habis</p>
            <p className="text-2xl font-bold text-gray-500">{kpiExpired}</p>
          </div>
        </div>
      </div>

      {/* Active PKS Detail */}
      {active ? (
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">No PKS Aktif</p>
                <p className="text-base font-semibold text-[#1E1C43]">{active.no}</p>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {[['Tanggal Mulai', active.mulai], ['Tanggal Selesai', active.selesai]].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{l}</p>
                    <p className="text-sm text-gray-700">{v}</p>
                  </div>
                ))}
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Status</p>
                  <Badge label={activeCfg.label} cls={activeCfg.cls} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setViewPks(active)}
                className="inline-flex items-center gap-1.5 border border-[#1E1C43] text-[#1E1C43] text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <Eye size={12} />Lihat File PKS
              </button>
              <button
                onClick={() => handleDownload(active)}
                className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors whitespace-nowrap"
              >
                <Download size={12} />Download PKS
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-5 text-center text-sm text-gray-400">Tidak ada kontrak aktif.</div>
      )}

      {/* Riwayat table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1E1C43]">Riwayat Kontrak</h3>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus size={12} />Upload PKS Baru
          </button>
        </div>
        {contracts.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8 px-5">Belum ada data kontrak.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <TH>No PKS</TH><TH>Periode</TH><TH>File</TH><TH>Status</TH><TH>Aksi</TH>
                </tr>
              </thead>
              <tbody>
                {contracts.map(c => {
                  const cfg   = PKS_STATUS[c.status] ?? { label: c.status, cls: 'bg-gray-100 text-gray-500' }
                  const isAct = c.status === 'aktif' || c.status === 'akan_habis'
                  return (
                    <tr key={c.no} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${isAct ? 'bg-green-50/40' : ''}`}>
                      <TD className="font-semibold text-[#1E1C43] whitespace-nowrap">{c.no}</TD>
                      <TD className="whitespace-nowrap">{c.mulai} – {c.selesai}</TD>
                      <TD className="whitespace-nowrap text-xs text-gray-500">{c.fileName ?? '—'}</TD>
                      <td className="px-3 py-2.5"><Badge label={cfg.label} cls={cfg.cls} /></td>
                      <TD>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setViewPks(c)} className="text-xs text-[#1E1C43] font-medium hover:underline">Lihat</button>
                          <button onClick={() => handleDownload(c)} className="text-xs text-gray-500 font-medium hover:underline">Download</button>
                        </div>
                      </TD>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload PKS Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-[15px] font-bold text-[#1E1C43]">Upload PKS Baru</h3>
                <p className="text-[12px] text-gray-400 mt-0.5">PKS lama aktif akan otomatis ditandai Expired</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-[#1E1C43] transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-[12px] font-semibold text-[#1E1C43] mb-1.5">
                  File PKS <span className="text-[#E05945]">*</span>
                  <span className="text-gray-400 font-normal ml-1">(PDF, maks 10 MB)</span>
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={e => setUploadFile(e.target.files[0] ?? null)}
                  className="w-full text-[13px] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-200 file:text-[12px] file:font-semibold file:text-gray-600 file:bg-gray-50 hover:file:bg-gray-100 outline-none"
                />
                {uploadFile && (
                  <p className="text-[11px] text-gray-400 mt-1">{uploadFile.name} · {(uploadFile.size / (1024*1024)).toFixed(1)} MB</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E1C43] mb-1.5">
                    Tanggal Mulai PKS <span className="text-[#E05945]">*</span>
                  </label>
                  <input
                    type="date"
                    value={uploadForm.tglMulai}
                    onChange={e => setUploadForm(f => ({ ...f, tglMulai: e.target.value }))}
                    className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1E1C43]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#1E1C43] mb-1.5">
                    Tanggal Selesai PKS <span className="text-[#E05945]">*</span>
                  </label>
                  <input
                    type="date"
                    value={uploadForm.tglSelesai}
                    onChange={e => setUploadForm(f => ({ ...f, tglSelesai: e.target.value }))}
                    className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1E1C43]"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-[13px] font-semibold text-gray-500 border border-gray-200 rounded-lg hover:border-[#1E1C43] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUploadSubmit}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E05945] hover:bg-[#c94a38] text-white text-[13px] font-semibold rounded-lg transition-colors"
              >
                <Upload size={13} />Upload & Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {viewPks && (
        <FileModal
          title={`File PKS — ${viewPks.no}`}
          fileName={viewPks.fileName ?? `${viewPks.no}.pdf`}
          size={viewPks.size ?? '—'}
          onClose={() => setViewPks(null)}
          onDownload={() => { handleDownload(viewPks); setViewPks(null) }}
        />
      )}
    </div>
  )
}

/* ── Tab 3: Dokumen ───────────────────────────────────────────────────────── */
function TabDokumen({ picId, showToast }) {
  const [dokStatus, setDokStatus] = useState(() => {
    const base = { ktp:{uploaded:false}, foto:{uploaded:false}, sertif:{uploaded:false}, npwp:{uploaded:false}, kontrak:{uploaded:false}, sertif2:{uploaded:false} }
    return { ...base, ...(DOK_STATUS_INIT[picId] ?? {}) }
  })
  const [viewDoc, setViewDoc] = useState(null)
  const fileRefs = useRef({})

  function isFileValid(file, accept) {
    const types = accept.split(',').map(t => t.trim())
    return types.some(t => {
      if (t === 'image/*') return file.type.startsWith('image/')
      if (t.startsWith('image/')) return file.type === t
      if (t === '.pdf' || t === 'application/pdf') return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      return false
    })
  }

  function handleUpload(dok, file) {
    if (!file) return
    if (file.size > dok.maxMB * 1024 * 1024) {
      showToast(`File terlalu besar (maks ${dok.maxMB} MB)`, 'error'); return
    }
    if (!isFileValid(file, dok.accept)) {
      showToast(`Format tidak valid. Gunakan ${dok.format}`, 'error'); return
    }
    const now = new Date()
    setDokStatus(prev => ({
      ...prev,
      [dok.id]: {
        uploaded: true,
        fileName: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        uploadDate: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      },
    }))
    showToast(`✓ ${dok.nama} berhasil diupload`)
    if (fileRefs.current[dok.id]) fileRefs.current[dok.id].value = ''
  }

  function handleDownload(info) {
    const a = document.createElement('a')
    a.href = '#'
    a.download = info.fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    showToast(`✓ Download ${info.fileName} dimulai`)
  }

  return (
    <>
      <SectionCard title="Dokumen PIC">
        <div className="divide-y divide-gray-100">
          {DOK_MASTER.map(dok => {
            const info    = dokStatus[dok.id] ?? { uploaded: false }
            const lengkap = info.uploaded
            return (
              <div key={dok.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  ref={el => { fileRefs.current[dok.id] = el }}
                  accept={dok.accept}
                  style={{ display: 'none' }}
                  onChange={e => handleUpload(dok, e.target.files[0])}
                />
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${lengkap ? 'bg-green-50' : 'bg-gray-100'}`}>
                    <FileText size={15} className={lengkap ? 'text-green-600' : 'text-gray-400'} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700">{dok.nama}</p>
                    {lengkap ? (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{info.fileName} · {info.size} · {info.uploadDate}</p>
                    ) : (
                      <p className="text-xs font-medium text-amber-600 mt-0.5">⚠️ Belum Upload · {dok.format}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  {lengkap && (
                    <>
                      <button
                        onClick={() => setViewDoc({ dok, info })}
                        className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors"
                      >
                        <Eye size={12} />Lihat
                      </button>
                      <button
                        onClick={() => handleDownload(info)}
                        className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors"
                      >
                        <Download size={12} />Download
                      </button>
                      <button
                        onClick={() => fileRefs.current[dok.id]?.click()}
                        className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors"
                      >
                        <Upload size={12} />Update
                      </button>
                    </>
                  )}
                  {!lengkap && (
                    <button
                      onClick={() => fileRefs.current[dok.id]?.click()}
                      className="inline-flex items-center gap-1.5 border border-[#E05945] text-[#E05945] text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <Upload size={12} />Upload
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>

      {viewDoc && (
        <FileModal
          title={viewDoc.dok.nama}
          fileName={viewDoc.info.fileName}
          size={viewDoc.info.size}
          uploadDate={viewDoc.info.uploadDate}
          onClose={() => setViewDoc(null)}
          onDownload={() => { handleDownload(viewDoc.info); setViewDoc(null) }}
        />
      )}
    </>
  )
}

/* ── Tab 4: Assignment ────────────────────────────────────────────────────── */
function TabAssignment({ picId, navigate }) {
  const [showRiwayat, setShowRiwayat] = useState(false)
  const aktif   = ASGN_AKTIF[picId]   ?? []
  const riwayat = ASGN_RIWAYAT[picId] ?? []
  const totalSesiSelesai = aktif.reduce((s, a) => s + a.sesiDone, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Assignment Aktif',   val: aktif.length,               cls: 'text-[#1E1C43]' },
          { label: 'Total Sesi Selesai', val: `${totalSesiSelesai} sesi`, cls: 'text-green-600'  },
          { label: 'Klien Aktif',        val: aktif.length,               cls: 'text-blue-600'   },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl px-4 py-4 text-center">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.cls}`}>{k.val}</p>
          </div>
        ))}
      </div>

      <SectionCard title="Assignment Aktif">
        {aktif.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8 px-5">Tidak ada assignment aktif.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 780 }}>
              <thead>
                <tr className="border-b border-gray-100">
                  {['ID Assignment','Klien','Program','Jadwal','Sesi Progress','Status','Aksi'].map(h => <TH key={h}>{h}</TH>)}
                </tr>
              </thead>
              <tbody>
                {aktif.map(a => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <TD className="font-medium text-gray-900 whitespace-nowrap">{a.id}</TD>
                    <TD className="font-medium text-gray-900 whitespace-nowrap">{a.klien}</TD>
                    <TD className="whitespace-nowrap">{a.program}</TD>
                    <TD className="whitespace-nowrap">{a.jadwal}</TD>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#1E1C43] rounded-full" style={{ width: `${(a.sesiDone / a.sesiTotal) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-700 whitespace-nowrap">{a.sesiDone}/{a.sesiTotal}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><Badge label="Aktif" cls="bg-green-100 text-green-700" /></td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => navigate(`/pp/orders?highlight=${a.id}`)}
                        className="text-xs font-medium border border-[#1E1C43] text-[#1E1C43] px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowRiwayat(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-semibold text-[#1E1C43]">Lihat Riwayat ({riwayat.length})</span>
          {showRiwayat ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {showRiwayat && (
          <div className="border-t border-gray-100 overflow-x-auto">
            {riwayat.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8 px-5">Tidak ada riwayat.</p>
            ) : (
              <table className="w-full border-collapse" style={{ minWidth: 600 }}>
                <thead>
                  <tr className="border-b border-gray-100">
                    {['ID','Klien','Program','Periode','Total Sesi','Status'].map(h => <TH key={h}>{h}</TH>)}
                  </tr>
                </thead>
                <tbody>
                  {riwayat.map(a => (
                    <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                      <TD className="whitespace-nowrap">{a.id}</TD>
                      <TD className="font-medium text-gray-900 whitespace-nowrap">{a.klien}</TD>
                      <TD className="whitespace-nowrap">{a.program}</TD>
                      <TD className="whitespace-nowrap">{a.periode}</TD>
                      <TD>{a.totalSesi} sesi</TD>
                      <td className="px-3 py-2.5"><Badge label={a.status} cls="bg-blue-100 text-blue-700" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Tab 5: Absensi ───────────────────────────────────────────────────────── */
function TabAbsensi({ picId, navigate }) {
  const [fBulan, setFBulan] = useState('')
  const [fTahun, setFTahun] = useState('')
  const rows = ABSENSI_DATA[picId] ?? []

  const filtered = rows.filter(r =>
    (!fBulan || r.periode.includes(fBulan.slice(0, 3))) &&
    (!fTahun || r.periode.includes(fTahun))
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-2.5">
        <select value={fBulan} onChange={e => setFBulan(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none bg-white focus:border-[#1E1C43]">
          <option value="">Semua Bulan</option>
          {BULAN.map(b => <option key={b}>{b}</option>)}
        </select>
        <select value={fTahun} onChange={e => setFTahun(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none bg-white focus:border-[#1E1C43]">
          <option value="">Semua Tahun</option>
          <option>2025</option><option>2026</option>
        </select>
      </div>

      <SectionCard>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 750 }}>
            <thead>
              <tr className="border-b border-gray-100">
                {['Periode','Klien','Program','Jml Sesi','Tgl Pengajuan','Status','Aksi'].map(h => <TH key={h}>{h}</TH>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">Tidak ada data absensi.</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                  <TD className="whitespace-nowrap">{r.periode}</TD>
                  <TD className="font-medium text-gray-900 whitespace-nowrap">{r.klien}</TD>
                  <TD className="whitespace-nowrap">{r.program}</TD>
                  <TD className="whitespace-nowrap">{r.jumlahSesi} sesi</TD>
                  <TD className="whitespace-nowrap">{r.tglPengajuan}</TD>
                  <td className="px-3 py-2.5">
                    <Badge label={r.status} cls={ABS_STATUS_CLS[r.status] ?? 'bg-gray-100 text-gray-500'} />
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => navigate(`/attendance?pic=EFM-${picId}&periode=${r.periode.replace(' ', '-')}`)}
                      className="text-xs font-medium border border-[#1E1C43] text-[#1E1C43] px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      Lihat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}

/* ── Tab 6: Pembayaran ────────────────────────────────────────────────────── */
function TabPembayaran({ picId, navigate }) {
  const [fBulan, setFBulan] = useState('')
  const [fTahun, setFTahun] = useState('')
  const rows = BAYAR_DATA[picId] ?? []

  const totalAll   = rows.reduce((s, r) => s + r.honorarium, 0)
  const totalBulan = rows.filter(r => r.periode.includes('2026') && r.tglBayar?.includes('Jun')).reduce((s, r) => s + r.honorarium, 0)
  const pending    = rows.filter(r => r.status !== 'Sudah Dibayar').reduce((s, r) => s + r.honorarium, 0)

  const filtered = rows.filter(r =>
    (!fBulan || r.periode.includes(fBulan.slice(0, 3))) &&
    (!fTahun || r.periode.includes(fTahun))
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Dibayar', val: fmt(totalAll),   cls: 'text-[#1E1C43]' },
          { label: 'Bulan Ini',     val: fmt(totalBulan), cls: 'text-green-600'  },
          { label: 'Pending',       val: fmt(pending),    cls: 'text-amber-600'  },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl px-4 py-4 text-center">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{k.label}</p>
            <p className={`text-lg font-bold ${k.cls}`}>{k.val}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2.5">
        <select value={fBulan} onChange={e => setFBulan(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none bg-white focus:border-[#1E1C43]">
          <option value="">Semua Bulan</option>
          {BULAN.map(b => <option key={b}>{b}</option>)}
        </select>
        <select value={fTahun} onChange={e => setFTahun(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none bg-white focus:border-[#1E1C43]">
          <option value="">Semua Tahun</option>
          <option>2025</option><option>2026</option>
        </select>
      </div>

      <SectionCard>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 800 }}>
            <thead>
              <tr className="border-b border-gray-100">
                {['Periode','Program','Jml Sesi','Honorarium','Metode','Tgl Bayar','Status'].map(h => <TH key={h}>{h}</TH>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">Tidak ada data pembayaran.</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                  <TD className="whitespace-nowrap">{r.periode}</TD>
                  <TD className="font-medium text-gray-900 whitespace-nowrap">{r.program}</TD>
                  <TD className="whitespace-nowrap">{r.jumlahSesi} sesi</TD>
                  <TD className="font-semibold whitespace-nowrap">{fmt(r.honorarium)}</TD>
                  <TD className="whitespace-nowrap">{r.metode}</TD>
                  <TD className="whitespace-nowrap">{r.tglBayar}</TD>
                  <td className="px-3 py-2.5">
                    <Badge label={r.status} cls={BAYAR_STATUS_CLS[r.status] ?? 'bg-gray-100 text-gray-500'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-5 py-3.5 flex items-center justify-between">
          <p className="text-xs text-gray-400">Menampilkan {filtered.length} dari {rows.length} data</p>
          <button
            onClick={() => navigate(`/payment?pic=EFM-${picId}`)}
            className="text-sm font-semibold text-[#E05945] hover:underline"
          >
            Lihat Semua di Halaman Pembayaran →
          </button>
        </div>
      </SectionCard>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function PICDetail() {
  const { id }             = useParams()
  const navigate           = useNavigate()
  const [searchParams]     = useSearchParams()
  const [tab, setTab]      = useState('Profil')
  const [toasts, setToasts]     = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [extraData, setExtraData] = useState(PROFIL_EXTRA)
  const [editForm, setEditForm]   = useState({})

  const pic = picList.find(p => p.id === id)

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      const target = TAB_PARAM_MAP[tabParam.toLowerCase()]
      if (target) setTab(target)
    }
  }, [])

  function showToast(message, type = 'success') {
    const tid = Date.now()
    setToasts(prev => [...prev, { id: tid, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== tid)), 3000)
  }

  function handleEditStart() {
    const extra = extraData[pic.id] ?? {}
    setEditForm({
      nama:             extra.nama             ?? pic.nama,
      noHp:             extra.noHp             ?? pic.noHp,
      tglLahir:         extra.tglLahir         ?? '',
      jenisKelamin:     extra.jenisKelamin     ?? '',
      email:            extra.email            ?? '',
      alamat:           extra.alamat           ?? '',
      spesialisasiList: extra.spesialisasiList ?? pic.spesialis ?? '',
      tglBergabung:     extra.tglBergabung     ?? '',
      namaBank:         extra.namaBank         ?? '',
      cabangBank:       extra.cabangBank       ?? '',
      noRekening:       extra.noRekening       ?? '',
      atasNama:         extra.atasNama         ?? '',
    })
    setIsEditing(true)
  }

  function handleEditSave() {
    setExtraData(prev => ({
      ...prev,
      [pic.id]: { ...(prev[pic.id] ?? {}), ...editForm },
    }))
    setIsEditing(false)
    showToast('✓ Profil berhasil disimpan')
  }

  function handleEditCancel() {
    setIsEditing(false)
  }

  if (!pic) {
    return (
      <div className="p-7 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-base font-semibold text-gray-500">Pelatih tidak ditemukan — ID: {id}</p>
        <button onClick={() => navigate('/ops/pelatih')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E05945] text-white text-[13px] font-semibold">
          <ArrowLeft size={14} />Kembali ke Daftar Pelatih
        </button>
      </div>
    )
  }

  const statusCfg = STATUS_PIC[pic.status] ?? { label: pic.status, cls: 'bg-gray-100 text-gray-500' }
  const extra     = extraData[pic.id] ?? {}

  return (
    <div className="p-7 space-y-5">

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`${TOAST_BG[t.type] ?? TOAST_BG.success} text-white text-[13px] font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2`}>
            {t.type === 'success' && <Check size={13} />}
            {t.type === 'error'   && <X    size={13} />}
            {t.message}
          </div>
        ))}
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-gray-500">
        <Link to="/ops/pelatih" className="hover:text-[#1E1C43] transition-colors">Operasional</Link>
        <span className="text-gray-300">/</span>
        <Link to="/ops/pelatih" className="hover:text-[#1E1C43] transition-colors">Pelatih</Link>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-[#1E1C43]">{pic.nama}</span>
      </nav>

      {/* Header + tabs card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        {/* Header — avatar + name + badge only */}
        <div className="px-6 py-5 flex items-center gap-5 border-b border-gray-100">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
            style={{ background: '#1E1C43' }}
          >
            {pic.inisial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-[#1E1C43]">{extra.nama ?? pic.nama}</h1>
              <Badge label={statusCfg.label} cls={statusCfg.cls} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">EFM-{pic.id} · {extra.spesialisasiList ?? pic.spesialis}</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-100 px-6 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3.5 text-[13px] whitespace-nowrap border-b-2 transition-colors ${
                tab === t
                  ? 'border-[#E05945] text-[#E05945] font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {tab === 'Profil'      && (
            <TabProfil
              pic={pic} extra={extra}
              isEditing={isEditing} editForm={editForm} setEditForm={setEditForm}
              onEditStart={handleEditStart} onEditSave={handleEditSave} onEditCancel={handleEditCancel}
            />
          )}
          {tab === 'Kontrak/PKS' && <TabKontrak    pic={pic} showToast={showToast} />}
          {tab === 'Dokumen'     && <TabDokumen    picId={pic.id} showToast={showToast} />}
          {tab === 'Assignment'  && <TabAssignment picId={pic.id} navigate={navigate} />}
          {tab === 'Absensi'     && <TabAbsensi    picId={pic.id} navigate={navigate} />}
          {tab === 'Pembayaran'  && <TabPembayaran picId={pic.id} navigate={navigate} />}
        </div>
      </div>

    </div>
  )
}
