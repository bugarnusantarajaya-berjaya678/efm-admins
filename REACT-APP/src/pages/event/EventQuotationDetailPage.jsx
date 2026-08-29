import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Edit2, Save, X, Plus, Trash2, Send, Eye, EyeOff, Mail, MessageCircle, CheckCircle, RotateCcw, FileText } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { initQuotations, getStoredQuotations, addStoredQuotation, updateStoredQuotation, getNextQuotationId, QUOTATIONS_INIT } from '../../data/eventQuotationsStore'
import { getCompanySettings } from '../../utils/companySettings'

/* ── Status badge ── */
const STATUS_CLS = {
  Draft:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  Terkirim:  'bg-blue-50 text-blue-700 border-blue-200',
  Disetujui: 'bg-green-50 text-green-700 border-green-200',
  Revisi:    'bg-red-50 text-red-600 border-red-200',
}

const DEFAULT_SYARAT = [
  'Pembayaran 50% di muka dan 50% setelah event selesai.',
  'Pembatalan dalam H-7 sebelum event tidak mendapat pengembalian uang muka.',
  'EFM berhak mengganti instruktur jika terjadi force majeure.',
  'Harga quotation ini berlaku 14 hari sejak tanggal penerbitan.',
]

function formatRp(n) {
  return 'Rp ' + (n || 0).toLocaleString('id-ID')
}

function Toast({ message, onClose }) {
  return (
    <div className="fixed bottom-5 right-5 z-[70] bg-[#1E1C43] text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
    </div>
  )
}

/* ════════════════════════════════
   PREVIEW DOKUMEN QUOTATION
════════════════════════════════ */
function QuotationDocument({ quotation, subtotal, afterTax }) {
  const co = getCompanySettings()
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none">
      {/* Header navy */}
      <div className="bg-[#1E1C43] p-6 grid grid-cols-2 gap-4 text-white">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-1">EFM</p>
          <p className="text-sm font-bold">{co.namaLegal}</p>
          <p className="text-xs text-white/70 mt-1 leading-relaxed max-w-xs">{co.alamat}</p>
          <p className="text-xs text-white/70 mt-1">{co.email}</p>
          <p className="text-xs text-white/70">{co.telepon}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black tracking-tight">QUOTATION</p>
          <p className="text-sm font-semibold mt-1 text-white/80">#{quotation.id}</p>
          <div className="mt-3 space-y-0.5 text-xs text-white/70">
            <p>Tanggal: <span className="text-white font-medium">{quotation.tanggalDibuat}</span></p>
            <p>Berlaku s/d: <span className="text-white font-medium">{quotation.tanggalBerlaku || '—'}</span></p>
          </div>
          <div className="mt-2">
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              quotation.status === 'Disetujui' ? 'bg-green-400 text-green-900' :
              quotation.status === 'Terkirim'  ? 'bg-blue-300 text-blue-900' :
              quotation.status === 'Revisi'    ? 'bg-red-300 text-red-900' :
              'bg-yellow-400 text-yellow-900'
            }`}>{quotation.status}</span>
          </div>
        </div>
      </div>

      {/* Ditujukan Kepada */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Ditujukan Kepada</p>
        <p className="text-sm font-bold text-[#1E1C43]">{quotation.namaKlien}</p>
        {quotation.namaEvent && (
          <p className="text-sm text-gray-500 mt-0.5">{quotation.namaEvent}</p>
        )}
        {quotation.leadId && (
          <p className="text-xs text-gray-400 mt-0.5">Lead: {quotation.leadId}</p>
        )}
      </div>

      {/* Rincian Layanan */}
      <div className="px-6 pt-4 pb-2">
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-3">Rincian Layanan</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Deskripsi</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap px-3">Qty</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap px-3">Satuan</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap px-3">Harga Satuan</th>
              <th className="text-right pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Total</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items.map((it, i) => (
              <tr key={it.id} className={i < quotation.items.length - 1 ? 'border-b border-gray-100' : ''}>
                <td className="py-2.5 text-gray-700">{it.deskripsi}</td>
                <td className="py-2.5 text-right px-3 text-gray-600">{it.qty}</td>
                <td className="py-2.5 text-right px-3 text-gray-600">{it.satuan}</td>
                <td className="py-2.5 text-right px-3 text-gray-600">{formatRp(it.harga)}</td>
                <td className="py-2.5 text-right font-semibold text-[#1E1C43]">{formatRp(it.qty * it.harga)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Kalkulasi */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex justify-end">
          <div className="w-64 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold text-[#1E1C43]">{formatRp(subtotal)}</span>
            </div>
            {quotation.pajak.map(p => (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="text-gray-500">{p.tipe === '-' ? '−' : '+'} {p.nama} ({p.persentase}%)</span>
                <span className="text-gray-600">{p.tipe}{formatRp(subtotal * (p.persentase / 100))}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-1">
              <div className="flex justify-between items-center bg-[#1E1C43] rounded-lg px-3 py-2.5">
                <span className="text-xs font-bold text-white uppercase tracking-wide">Total Tagihan</span>
                <span className="text-base font-black text-[#E05945]">{formatRp(afterTax)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catatan */}
      {quotation.catatan && (
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1.5">Catatan</p>
          <p className="text-sm text-gray-700 leading-relaxed">{quotation.catatan}</p>
        </div>
      )}

      {/* Syarat & Ketentuan */}
      {(quotation.syaratKetentuan || DEFAULT_SYARAT).length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Syarat & Ketentuan</p>
          <ol className="list-decimal list-inside space-y-1">
            {(quotation.syaratKetentuan || DEFAULT_SYARAT).map((s, i) => (
              <li key={i} className="text-xs text-gray-600">{s}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">Dokumen ini digenerate oleh sistem EFM V2</p>
      </div>
    </div>
  )
}

/* ════════════════════════════════
   MODAL KIRIM
════════════════════════════════ */
function KirimModal({ quotation, onClose, onKirim }) {
  const [email, setEmail] = useState('')
  const [waEnabled, setWaEnabled] = useState(false)
  const [waNum, setWaNum] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit() {
    if (!email.trim()) return
    setLoading(true)
    setTimeout(() => {
      onKirim(email, waEnabled ? waNum : null)
      setLoading(false)
    }, 800)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1E1C43]">Kirim Quotation ke Klien</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Mail size={12} /> Email Klien <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@klien.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
            />
          </div>

          {/* WA */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none mb-2">
              <input type="checkbox" checked={waEnabled} onChange={e => setWaEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                <MessageCircle size={12} /> Kirim juga via WhatsApp
              </span>
            </label>
            {waEnabled && (
              <input
                type="tel"
                value={waNum}
                onChange={e => setWaNum(e.target.value)}
                placeholder="+62 81x-xxxx-xxxx"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
              />
            )}
          </div>

          {/* Lampiran info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <FileText size={12} /> Lampiran
            </p>
            <div className="space-y-1.5">
              {[
                { name: `${quotation.id}.pdf`, note: 'Quotation ini' },
                { name: 'Hasil Konsultasi.pdf', note: quotation.konsultasiId || 'Jika tersedia' },
                { name: 'Draft Agreement.pdf', note: 'Template standar EFM' },
              ].map(f => (
                <div key={f.name} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E05945] shrink-0" />
                  <span className="text-xs text-gray-700 font-medium">{f.name}</span>
                  <span className="text-xs text-gray-400">— {f.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 p-4 border-t border-gray-200 flex justify-end gap-2">
          <button onClick={onClose}
            className="h-8 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!email.trim() || loading}
            className="h-8 px-4 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5">
            <Send size={12} />
            {loading ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════
   MAIN PAGE
════════════════════════════════ */
export default function EventQuotationDetailPage() {
  useBreadcrumb([
    { label: 'Event', path: '/event/leads' },
    { label: 'Quotation', path: '/event/quotation' },
  ])

  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [toast, setToast] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showKirimModal, setShowKirimModal] = useState(false)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  initQuotations(QUOTATIONS_INIT)
  const allQuotations = getStoredQuotations()

  /* ── New quotation mode ── */
  const isNew = id === 'new' || !id
  const fromLead = location.state?.fromLead
  const leadId = location.state?.leadId || ''
  const namaKlien = location.state?.namaKlien || ''
  const namaEvent = location.state?.namaEvent || ''
  const konsultasiId = location.state?.konsultasiId || ''

  /* ── Existing quotation ── */
  const existing = !isNew ? allQuotations.find(q => q.id === id) : null

  const [quotation, setQuotation] = useState(() => {
    if (!isNew && existing) return { syaratKetentuan: [...DEFAULT_SYARAT], ...existing }
    return {
      id: getNextQuotationId(),
      leadId,
      konsultasiId,
      namaKlien,
      namaEvent,
      tanggalDibuat: new Date().toISOString().slice(0, 10),
      tanggalBerlaku: '',
      status: 'Draft',
      picEFM: 'Bagoes',
      catatan: '',
      syaratKetentuan: [...DEFAULT_SYARAT],
      items: [
        { id: Date.now(), deskripsi: '', qty: 1, satuan: 'Paket', harga: 0 },
      ],
      pajak: [
        { id: 1, nama: 'PPN', persentase: 11, tipe: '+' },
      ],
      nilaiSubtotal: 0,
      nilaiTotal: 0,
    }
  })

  const [editing, setEditing] = useState(isNew)

  /* ── Calculations ── */
  const subtotal = quotation.items.reduce((s, it) => s + (it.qty * it.harga), 0)
  const afterTax = quotation.pajak.reduce((s, p) => {
    const amt = subtotal * (p.persentase / 100)
    return p.tipe === '+' ? s + amt : s - amt
  }, subtotal)

  /* ── Line item helpers ── */
  function updateItem(itemId, field, value) {
    setQuotation(prev => ({
      ...prev,
      items: prev.items.map(it => it.id === itemId ? { ...it, [field]: value } : it),
    }))
  }

  function addItem() {
    setQuotation(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), deskripsi: '', qty: 1, satuan: 'Paket', harga: 0 }],
    }))
  }

  function removeItem(itemId) {
    setQuotation(prev => ({ ...prev, items: prev.items.filter(it => it.id !== itemId) }))
  }

  /* ── Pajak helpers ── */
  function updatePajak(pajakId, field, value) {
    setQuotation(prev => ({
      ...prev,
      pajak: prev.pajak.map(p => p.id === pajakId ? { ...p, [field]: value } : p),
    }))
  }

  function addPajak() {
    setQuotation(prev => ({
      ...prev,
      pajak: [...prev.pajak, { id: Date.now(), nama: '', persentase: 0, tipe: '+' }],
    }))
  }

  function removePajak(pajakId) {
    setQuotation(prev => ({ ...prev, pajak: prev.pajak.filter(p => p.id !== pajakId) }))
  }

  /* ── Syarat & Ketentuan helpers ── */
  function updateSyarat(idx, value) {
    setQuotation(prev => {
      const arr = [...(prev.syaratKetentuan || DEFAULT_SYARAT)]
      arr[idx] = value
      return { ...prev, syaratKetentuan: arr }
    })
  }

  function addSyarat() {
    setQuotation(prev => ({
      ...prev,
      syaratKetentuan: [...(prev.syaratKetentuan || DEFAULT_SYARAT), ''],
    }))
  }

  function removeSyarat(idx) {
    setQuotation(prev => ({
      ...prev,
      syaratKetentuan: (prev.syaratKetentuan || DEFAULT_SYARAT).filter((_, i) => i !== idx),
    }))
  }

  /* ── Save ── */
  function handleSave() {
    const saved = { ...quotation, nilaiSubtotal: subtotal, nilaiTotal: afterTax }
    if (isNew) {
      addStoredQuotation(saved)
      showToast('✓ Quotation berhasil dibuat')
      setTimeout(() => {
        if (fromLead && leadId) navigate(`/event/leads/${leadId}`, { state: { tab: 'quotation' } })
        else navigate(`/event/quotation/${saved.id}`, { replace: true })
      }, 1000)
    } else {
      updateStoredQuotation(quotation.id, saved)
      setQuotation(saved)
      setEditing(false)
      showToast('✓ Perubahan disimpan')
    }
  }

  /* ── Status changes ── */
  function handleStatusChange(newStatus) {
    setQuotation(prev => {
      const updated = { ...prev, status: newStatus }
      if (!isNew) updateStoredQuotation(prev.id, updated)
      return updated
    })
    showToast(`✓ Status diubah ke ${newStatus}`)
  }

  /* ── Kirim ── */
  function handleKirim(email, waNum) {
    handleStatusChange('Terkirim')
    setShowKirimModal(false)
    showToast(`✓ Quotation dikirim ke ${email}${waNum ? ' & WA ' + waNum : ''}`)
  }

  /* ── Buat Order ── */
  function handleBuatOrder() {
    navigate('/event/orders/new', {
      state: {
        fromQuotation: true,
        quotationId: quotation.id,
        leadId: quotation.leadId,
        namaKlien: quotation.namaKlien,
        namaEvent: quotation.namaEvent,
        nilaiQuotation: afterTax,
      },
    })
  }

  if (!isNew && !existing) {
    return (
      <div className="p-8 text-center text-gray-400 text-sm">
        Quotation tidak ditemukan.
        <button onClick={() => navigate(-1)} className="ml-3 text-[#E05945] underline">Kembali</button>
      </div>
    )
  }

  const statusCls = STATUS_CLS[quotation.status] || 'bg-gray-50 text-gray-500 border-gray-200'

  return (
    <>
      <div className="space-y-5">

        {/* ── Header card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{quotation.id}</p>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">{quotation.namaKlien}</h1>
              <p className="text-xs text-gray-500 mt-0.5">{quotation.namaEvent}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`px-2 py-1 text-xs rounded-full font-medium border ${statusCls}`}>{quotation.status}</span>
                <span className="text-xs text-gray-400">Dibuat {quotation.tanggalDibuat}</span>
                {quotation.tanggalBerlaku && (
                  <span className="text-xs text-gray-400">· Berlaku s/d {quotation.tanggalBerlaku}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Preview toggle */}
              {!isNew && (
                <button
                  onClick={() => setShowPreview(p => !p)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                  {showPreview ? <><EyeOff size={12} /> Tutup Preview</> : <><Eye size={12} /> Preview Dokumen</>}
                </button>
              )}

              {/* Kirim — saat Draft atau Revisi */}
              {!editing && !isNew && (quotation.status === 'Draft' || quotation.status === 'Revisi') && (
                <button
                  onClick={() => setShowKirimModal(true)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                  <Send size={12} /> Kirim ke Klien
                </button>
              )}

              {/* Status action saat Terkirim: Setujui | Revisi */}
              {!editing && !isNew && quotation.status === 'Terkirim' && (
                <>
                  <button
                    onClick={() => handleStatusChange('Disetujui')}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors">
                    <CheckCircle size={12} /> Disetujui
                  </button>
                  <button
                    onClick={() => handleStatusChange('Revisi')}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                    <RotateCcw size={12} /> Perlu Revisi
                  </button>
                </>
              )}

              {/* Buat Order — hanya saat Disetujui */}
              {!editing && !isNew && quotation.status === 'Disetujui' && (
                <button
                  onClick={handleBuatOrder}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
                  <FileText size={12} /> Buat Order
                </button>
              )}

              {/* Edit / Simpan / Batal */}
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] hover:opacity-90 text-white text-xs font-semibold transition-opacity">
                  <Edit2 size={12} /> Edit
                </button>
              )}
              {editing && (
                <>
                  <button onClick={handleSave}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                    <Save size={12} /> Simpan
                  </button>
                  {!isNew && (
                    <button onClick={() => setEditing(false)}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                      <X size={12} /> Batal
                    </button>
                  )}
                </>
              )}

              <button
                onClick={() => navigate(quotation.leadId ? `/event/leads/${quotation.leadId}` : '/event/leads')}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                <ArrowLeft size={12} /> Kembali
              </button>
            </div>
          </div>
        </div>

        {/* ── Preview Dokumen ── */}
        {showPreview && !isNew && (
          <QuotationDocument quotation={quotation} subtotal={subtotal} afterTax={afterTax} />
        )}

        {/* ── Info singkat KPI ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'PIC EFM', value: quotation.picEFM },
            { label: 'Lead ID', value: quotation.leadId || '-' },
            { label: 'Konsultasi', value: quotation.konsultasiId || '-' },
            { label: 'Total Tagihan', value: formatRp(afterTax) },
          ].map(f => (
            <div key={f.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">{f.label}</p>
              <p className="text-sm font-semibold text-[#1E1C43] mt-1 truncate">{f.value}</p>
            </div>
          ))}
        </div>

        {/* ── Rincian Layanan ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Rincian Layanan</h3>
            {editing && (
              <button onClick={addItem}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
                <Plus size={12} /> Tambah Baris
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '700px' }}>
              <thead>
                <tr className="border-b border-gray-200">
                  {['Deskripsi', 'Qty', 'Satuan', 'Harga Satuan', 'Total', editing ? '' : null].filter(Boolean).map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotation.items.map(it => {
                  const total = it.qty * it.harga
                  return (
                    <tr key={it.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3">
                        {editing ? (
                          <input value={it.deskripsi} onChange={e => updateItem(it.id, 'deskripsi', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#1E1C43]" />
                        ) : (
                          <span className="text-sm text-gray-700">{it.deskripsi}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editing ? (
                          <input type="number" value={it.qty} onChange={e => updateItem(it.id, 'qty', Number(e.target.value))}
                            className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:border-[#1E1C43]" />
                        ) : (
                          <span className="text-sm text-gray-700">{it.qty}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editing ? (
                          <input value={it.satuan} onChange={e => updateItem(it.id, 'satuan', e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#1E1C43]" />
                        ) : (
                          <span className="text-sm text-gray-700">{it.satuan}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editing ? (
                          <input type="number" value={it.harga} onChange={e => updateItem(it.id, 'harga', Number(e.target.value))}
                            className="w-36 px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:border-[#1E1C43]" />
                        ) : (
                          <span className="text-sm text-gray-700">{formatRp(it.harga)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-[#1E1C43]">{formatRp(total)}</span>
                      </td>
                      {editing && (
                        <td className="px-4 py-3">
                          <button onClick={() => removeItem(it.id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ── Kalkulasi ── */}
          <div className="px-5 py-4 border-t border-gray-100 space-y-2">
            <div className="flex justify-end">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-[#1E1C43]">{formatRp(subtotal)}</span>
                </div>

                {quotation.pajak.map(p => (
                  <div key={p.id} className="flex justify-between text-sm items-center gap-2">
                    {editing ? (
                      <>
                        <div className="flex items-center gap-1 flex-1">
                          <select value={p.tipe} onChange={e => updatePajak(p.id, 'tipe', e.target.value)}
                            className="px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none">
                            <option value="+">+</option>
                            <option value="-">-</option>
                          </select>
                          <input value={p.nama} onChange={e => updatePajak(p.id, 'nama', e.target.value)}
                            className="flex-1 px-1.5 py-0.5 border border-gray-200 rounded text-xs focus:outline-none" />
                          <input type="number" value={p.persentase} onChange={e => updatePajak(p.id, 'persentase', Number(e.target.value))}
                            className="w-14 px-1.5 py-0.5 border border-gray-200 rounded text-xs text-right focus:outline-none" />
                          <span className="text-xs text-gray-400">%</span>
                          <button onClick={() => removePajak(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                        </div>
                        <span className="text-gray-500 w-28 text-right">
                          {p.tipe}{formatRp(subtotal * (p.persentase / 100))}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-500">{p.tipe === '-' ? '−' : '+'} {p.nama} ({p.persentase}%)</span>
                        <span className="font-medium text-gray-700">{p.tipe}{formatRp(subtotal * (p.persentase / 100))}</span>
                      </>
                    )}
                  </div>
                ))}

                {editing && (
                  <button onClick={addPajak}
                    className="text-xs text-[#E05945] hover:underline flex items-center gap-1">
                    <Plus size={11} /> Tambah Pajak / Potongan
                  </button>
                )}

                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                  <span className="text-sm font-bold text-[#1E1C43]">TOTAL TAGIHAN</span>
                  <span className="text-lg font-bold text-[#E05945]">{formatRp(afterTax)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Catatan ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-3">Catatan</h3>
          {editing ? (
            <textarea rows={3} value={quotation.catatan}
              onChange={e => setQuotation(prev => ({ ...prev, catatan: e.target.value }))}
              placeholder="Catatan untuk klien..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43] resize-none" />
          ) : (
            <p className={`text-sm ${quotation.catatan ? 'text-gray-700' : 'text-gray-400 italic'}`}>
              {quotation.catatan || 'Tidak ada catatan.'}
            </p>
          )}
        </div>

        {/* ── Syarat & Ketentuan ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-3">Syarat &amp; Ketentuan</h3>
          {editing ? (
            <div className="space-y-2">
              {(quotation.syaratKetentuan || DEFAULT_SYARAT).map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs text-gray-400 mt-2 w-4 shrink-0">{i + 1}.</span>
                  <input value={s} onChange={e => updateSyarat(i, e.target.value)}
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]" />
                  <button onClick={() => removeSyarat(i)} className="text-red-400 hover:text-red-600 mt-1.5 shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button onClick={addSyarat}
                className="text-xs text-[#E05945] hover:underline flex items-center gap-1 mt-1">
                <Plus size={11} /> Tambah Baris
              </button>
            </div>
          ) : (
            <ol className="list-decimal list-inside space-y-1.5">
              {(quotation.syaratKetentuan || DEFAULT_SYARAT).map((s, i) => (
                <li key={i} className="text-sm text-gray-700">{s}</li>
              ))}
            </ol>
          )}
        </div>

      </div>

      {/* ── Modal Kirim ── */}
      {showKirimModal && (
        <KirimModal
          quotation={quotation}
          onClose={() => setShowKirimModal(false)}
          onKirim={handleKirim}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
