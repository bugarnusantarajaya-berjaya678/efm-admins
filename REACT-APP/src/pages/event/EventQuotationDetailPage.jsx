import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Edit2, Save, X, Plus, Trash2, Send, Mail, MessageCircle, CheckCircle, RotateCcw, FileText, ScrollText } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { initQuotations, getStoredQuotations, addStoredQuotation, updateStoredQuotation, getNextQuotationId, QUOTATIONS_INIT } from '../../data/eventQuotationsStore'
import { getCompanySettings } from '../../utils/companySettings'

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

export default function EventQuotationDetailPage() {
  useBreadcrumb([
    { label: 'B2B Event', path: '/event/leads' },
    { label: 'Quotation', path: '/event/quotation' },
  ])

  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const co = getCompanySettings()
  const [toast, setToast] = useState(null)
  const [showKirimModal, setShowKirimModal] = useState(false)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  initQuotations(QUOTATIONS_INIT)
  const allQuotations = getStoredQuotations()

  const isNew = id === 'new' || !id
  const fromLead = location.state?.fromLead
  const leadId = location.state?.leadId || ''
  const namaKlien = location.state?.namaKlien || ''
  const namaEvent = location.state?.namaEvent || ''
  const konsultasiId = location.state?.konsultasiId || ''

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
      managementFee: { aktif: false, persen: 0 },
      nilaiSubtotal: 0,
      nilaiTotal: 0,
    }
  })

  const [editing, setEditing] = useState(isNew)

  const subtotal = quotation.items.reduce((s, it) => s + (it.qty * it.harga), 0)
  const mgmtFeeAmt = quotation.managementFee?.aktif
    ? Math.round(subtotal * (quotation.managementFee.persen / 100))
    : 0
  const afterMgmt = subtotal + mgmtFeeAmt
  const afterTax = quotation.pajak.reduce((s, p) => {
    const amt = afterMgmt * (p.persentase / 100)
    return p.tipe === '+' ? s + amt : s - amt
  }, afterMgmt)

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

  function getTemplateSyarat() {
    try {
      const saved = localStorage.getItem('efmQuotationTemplate')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed.items) && parsed.items.length > 0) return parsed.items
      }
    } catch {}
    return quotation.syaratKetentuan || DEFAULT_SYARAT
  }

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

  function handleStatusChange(newStatus) {
    setQuotation(prev => {
      const updated = { ...prev, status: newStatus }
      if (!isNew) updateStoredQuotation(prev.id, updated)
      return updated
    })
    showToast(`✓ Status diubah ke ${newStatus}`)
  }

  function handleKirim(email, waNum) {
    handleStatusChange('Terkirim')
    setShowKirimModal(false)
    if (waNum) {
      const msg = [
        `Halo,`,
        '',
        `Berikut kami sampaikan *Quotation #${quotation.id}* untuk *${quotation.namaEvent || quotation.namaKlien}*.`,
        '',
        `📋 Quotation: #${quotation.id}`,
        `📅 Tanggal: ${quotation.tanggalDibuat}`,
        `⏰ Berlaku s/d: ${quotation.tanggalBerlaku || '—'}`,
        `💰 Total: Rp ${(quotation.nilaiTotal || afterTax).toLocaleString('id-ID')}`,
        '',
        `Mohon konfirmasi penerimaan quotation ini. Terima kasih 🙏`,
      ].join('\n')
      const numClean = waNum.replace(/\D/g, '').replace(/^0/, '')
      window.open(`https://wa.me/62${numClean}?text=${encodeURIComponent(msg)}`, '_blank')
    }
    showToast(`✓ Quotation dikirim ke ${email}${waNum ? ' & WA ' + waNum : ''}`)
  }

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
        <button onClick={() => navigate(-1)} className="ml-3 text-[#1E1C43] underline">Kembali</button>
      </div>
    )
  }

  const statusCls = STATUS_CLS[quotation.status] || 'bg-gray-50 text-gray-500 border-gray-200'

  return (
    <>
      <div className="space-y-5 pb-24">

        {/* ── Page header card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">

            {/* Left: icon + title */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0 mt-0.5">
                <ScrollText size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Quotation B2B Event</p>
                <h1 className="text-base font-bold text-[#1E1C43]">
                  {isNew ? 'Buat Quotation Baru' : `Quotation #${quotation.id}`}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {quotation.namaKlien && (
                    <span className="text-sm font-medium text-gray-700">{quotation.namaKlien}</span>
                  )}
                  {quotation.namaEvent && (
                    <span className="text-xs text-gray-400">— {quotation.namaEvent}</span>
                  )}
                  {!isNew && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium border ${statusCls}`}>
                      {quotation.status}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {quotation.picEFM && (
                    <span className="text-[10px] text-gray-400">PIC: <span className="font-medium text-gray-500">{quotation.picEFM}</span></span>
                  )}
                  {quotation.leadId && (
                    <span className="text-[10px] text-gray-400">Lead: <span className="font-medium text-gray-500">{quotation.leadId}</span></span>
                  )}
                  {quotation.konsultasiId && (
                    <span className="text-[10px] text-gray-400">Konsultasi: <span className="font-medium text-gray-500">{quotation.konsultasiId}</span></span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Kirim — Draft or Revisi */}
              {!editing && !isNew && (quotation.status === 'Draft' || quotation.status === 'Revisi') && (
                <button
                  onClick={() => setShowKirimModal(true)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                  <Send size={12} /> Kirim ke Klien
                </button>
              )}

              {/* Terkirim: Setujui | Revisi */}
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

              {/* Buat Order — Disetujui */}
              {!editing && !isNew && quotation.status === 'Disetujui' && (
                <button
                  onClick={handleBuatOrder}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
                  <FileText size={12} /> Buat Order
                </button>
              )}

              {/* Kembali */}
              <button
                onClick={() => navigate(fromLead && leadId ? `/event/leads/${leadId}` : '/event/quotation')}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                <ArrowLeft size={12} /> Kembali
              </button>
            </div>
          </div>
        </div>

        {/* ── Document card ── */}
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

            {/* Navy header */}
            <div className="bg-[#1E1C43] p-6 sm:p-8 grid grid-cols-2 gap-4 text-white">
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
                <div className="mt-3 space-y-1.5 text-xs text-white/70">
                  {editing ? (
                    <>
                      <div className="flex items-center justify-end gap-2">
                        <span>Tanggal:</span>
                        <input
                          type="date"
                          value={quotation.tanggalDibuat}
                          onChange={e => setQuotation(prev => ({ ...prev, tanggalDibuat: e.target.value }))}
                          className="bg-white/10 border border-white/20 rounded px-2 py-0.5 text-white text-xs focus:outline-none" />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span>Berlaku s/d:</span>
                        <input
                          type="date"
                          value={quotation.tanggalBerlaku}
                          onChange={e => setQuotation(prev => ({ ...prev, tanggalBerlaku: e.target.value }))}
                          className="bg-white/10 border border-white/20 rounded px-2 py-0.5 text-white text-xs focus:outline-none" />
                      </div>
                    </>
                  ) : (
                    <>
                      <p>Tanggal: <span className="text-white font-medium">{quotation.tanggalDibuat}</span></p>
                      <p>Berlaku s/d: <span className="text-white font-medium">{quotation.tanggalBerlaku || '—'}</span></p>
                    </>
                  )}
                </div>
                <div className="mt-3">
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
            <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-gray-100">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Ditujukan Kepada</div>
              {editing ? (
                <div className="space-y-2">
                  <input
                    value={quotation.namaKlien}
                    onChange={e => setQuotation(prev => ({ ...prev, namaKlien: e.target.value }))}
                    placeholder="Nama klien / perusahaan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-[#1E1C43] focus:outline-none focus:border-[#1E1C43]" />
                  <input
                    value={quotation.namaEvent}
                    onChange={e => setQuotation(prev => ({ ...prev, namaEvent: e.target.value }))}
                    placeholder="Nama event"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#1E1C43]" />
                  <div className="flex gap-2">
                    <input
                      value={quotation.leadId}
                      onChange={e => setQuotation(prev => ({ ...prev, leadId: e.target.value }))}
                      placeholder="Lead ID (mis. LE-0001)"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-500 focus:outline-none focus:border-[#1E1C43]" />
                    <input
                      value={quotation.picEFM}
                      onChange={e => setQuotation(prev => ({ ...prev, picEFM: e.target.value }))}
                      placeholder="PIC EFM"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-500 focus:outline-none focus:border-[#1E1C43]" />
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[18px] font-bold text-[#1E1C43]">{quotation.namaKlien}</p>
                  {quotation.namaEvent && (
                    <p className="text-sm text-gray-500 mt-0.5">{quotation.namaEvent}</p>
                  )}
                  {quotation.leadId && (
                    <p className="text-xs text-gray-400 mt-1">Lead: {quotation.leadId}</p>
                  )}
                  {quotation.picEFM && (
                    <p className="text-xs text-gray-400 mt-0.5">PIC EFM: {quotation.picEFM}</p>
                  )}
                </>
              )}
            </div>

            {/* Rincian Layanan */}
            <div className="px-6 sm:px-8 pt-6 pb-2">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Rincian Layanan</div>
                {editing && (
                  <button onClick={addItem}
                    className="flex items-center gap-1 text-xs text-[#E05945] hover:underline font-medium">
                    <Plus size={11} /> Tambah Baris
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: '580px' }}>
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Deskripsi</th>
                      <th className="text-right pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap px-3">Qty</th>
                      <th className="text-right pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap px-3">Satuan</th>
                      <th className="text-right pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap px-3">Harga Satuan</th>
                      <th className="text-right pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Total</th>
                      {editing && <th className="pb-2 w-8"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.items.map((it, i) => {
                      const total = it.qty * it.harga
                      return (
                        <tr key={it.id} className={i < quotation.items.length - 1 ? 'border-b border-gray-100' : ''}>
                          <td className="py-2.5">
                            {editing ? (
                              <input value={it.deskripsi} onChange={e => updateItem(it.id, 'deskripsi', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#1E1C43]" />
                            ) : (
                              <span className="text-gray-700">{it.deskripsi}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {editing ? (
                              <input type="number" value={it.qty} onChange={e => updateItem(it.id, 'qty', Number(e.target.value))}
                                className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:border-[#1E1C43]" />
                            ) : (
                              <span className="text-gray-600">{it.qty}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {editing ? (
                              <input value={it.satuan} onChange={e => updateItem(it.id, 'satuan', e.target.value)}
                                className="w-24 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#1E1C43]" />
                            ) : (
                              <span className="text-gray-600">{it.satuan}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {editing ? (
                              <input type="number" value={it.harga} onChange={e => updateItem(it.id, 'harga', Number(e.target.value))}
                                className="w-36 px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:border-[#1E1C43]" />
                            ) : (
                              <span className="text-gray-600">{formatRp(it.harga)}</span>
                            )}
                          </td>
                          <td className="py-2.5 text-right">
                            <span className="font-semibold text-[#1E1C43]">{formatRp(total)}</span>
                          </td>
                          {editing && (
                            <td className="py-2.5 pl-2">
                              <button onClick={() => removeItem(it.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 size={13} />
                              </button>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Kalkulasi */}
            <div className="px-6 sm:px-8 py-5 border-t border-gray-100">
              <div className="flex justify-end">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold text-[#1E1C43]">{formatRp(subtotal)}</span>
                  </div>

                  {/* Management Fee */}
                  <div className="flex justify-between text-sm items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <input type="checkbox"
                        checked={quotation.managementFee?.aktif ?? false}
                        onChange={() => setQuotation(prev => ({
                          ...prev,
                          managementFee: { ...(prev.managementFee ?? { persen: 0 }), aktif: !prev.managementFee?.aktif }
                        }))}
                        disabled={!editing}
                        className="w-3.5 h-3.5 accent-[#1E1C43]" />
                      <span className="text-gray-500">Management Fee</span>
                      {quotation.managementFee?.aktif && editing && (
                        <input type="number" min={0} max={100}
                          value={quotation.managementFee.persen}
                          onChange={e => setQuotation(prev => ({
                            ...prev,
                            managementFee: { ...prev.managementFee, persen: Number(e.target.value) }
                          }))}
                          className="w-14 px-1.5 py-0.5 border border-gray-200 rounded text-xs text-right focus:outline-none" />
                      )}
                      {quotation.managementFee?.aktif && (
                        <span className="text-xs text-gray-400">
                          {editing ? '%' : `${quotation.managementFee.persen}%`}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-gray-700">
                      {quotation.managementFee?.aktif ? `+${formatRp(mgmtFeeAmt)}` : '—'}
                    </span>
                  </div>

                  {/* Pajak */}
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
                            {p.tipe}{formatRp(afterMgmt * (p.persentase / 100))}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-500">{p.tipe === '-' ? '−' : '+'} {p.nama} ({p.persentase}%)</span>
                          <span className="font-medium text-gray-700">{p.tipe}{formatRp(afterMgmt * (p.persentase / 100))}</span>
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

                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center bg-[#1E1C43] rounded-xl px-3 py-2.5">
                      <span className="text-xs font-bold text-white uppercase tracking-wide">Total Tagihan</span>
                      <span className="text-base font-black text-[#E05945]">{formatRp(afterTax)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Catatan */}
            <div className="px-6 sm:px-8 py-5 border-t border-gray-100">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Catatan</div>
              {editing ? (
                <textarea
                  value={quotation.catatan}
                  onChange={e => setQuotation(prev => ({ ...prev, catatan: e.target.value }))}
                  placeholder="Catatan untuk klien..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-[#1E1C43] resize-none" />
              ) : (
                quotation.catatan
                  ? <p className="text-sm text-gray-600 leading-relaxed">{quotation.catatan}</p>
                  : <p className="text-sm text-gray-400 italic">Tidak ada catatan.</p>
              )}
            </div>

            {/* Syarat & Ketentuan */}
            <div className="px-6 sm:px-8 py-6 border-t border-gray-100">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Syarat &amp; Ketentuan</div>
              <ol className="list-decimal list-inside space-y-2">
                {getTemplateSyarat().map((s, i) => (
                  <li key={i} className="text-sm text-gray-600">{s}</li>
                ))}
              </ol>
            </div>

            {/* Document footer */}
            <div className="px-6 sm:px-8 py-5 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-300">Dokumen ini digenerate oleh sistem EFM V2</p>
            </div>

          </div>
        </div>

      </div>

      {/* ── Sticky footer — Edit / Simpan / Batal ── */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 z-40">
        {editing ? (
          <>
            {!isNew && (
              <button
                onClick={() => setEditing(false)}
                className="border border-gray-300 text-gray-600 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Batal
              </button>
            )}
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors">
              <Save size={14} /> {isNew ? 'Buat Quotation' : 'Simpan Perubahan'}
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Edit2 size={14} /> Edit Quotation
          </button>
        )}
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
