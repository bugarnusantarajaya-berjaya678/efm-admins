import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Edit2, Save, X, Plus, Trash2, Send } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { initQuotations, getStoredQuotations, addStoredQuotation, getNextQuotationId, QUOTATIONS_INIT } from '../../data/eventQuotationsStore'

/* ── Status badge ── */
const STATUS_CLS = {
  Draft:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  Terkirim:  'bg-blue-50 text-blue-700 border-blue-200',
  Disetujui: 'bg-green-50 text-green-700 border-green-200',
  Revisi:    'bg-red-50 text-red-600 border-red-200',
}

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

export default function EventQuotationDetailPage() {
  useBreadcrumb([
    { label: 'Event', path: '/event/leads' },
    { label: 'Quotation', path: '/event/quotation' },
  ])

  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [toast, setToast] = useState(null)

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
    if (!isNew && existing) return existing
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
      setQuotation(saved)
      setEditing(false)
      showToast('✓ Perubahan disimpan')
    }
  }

  /* ── Send ── */
  function handleSend() {
    setQuotation(prev => ({ ...prev, status: 'Terkirim' }))
    showToast('✓ Quotation ditandai sebagai Terkirim')
  }

  if (!isNew && !existing) {
    return (
      <div className="p-8 text-center text-gray-400 text-sm">
        Quotation tidak ditemukan.
        <button onClick={() => navigate(-1)} className="ml-3 text-[#E05945] underline">Kembali</button>
      </div>
    )
  }

  const statusLabel = quotation.status
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
                <span className={`px-2 py-1 text-xs rounded-full font-medium border ${statusCls}`}>{statusLabel}</span>
                <span className="text-xs text-gray-400">Dibuat {quotation.tanggalDibuat}</span>
                {quotation.tanggalBerlaku && (
                  <span className="text-xs text-gray-400">· Berlaku s/d {quotation.tanggalBerlaku}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {!editing && quotation.status === 'Draft' && (
                <button
                  onClick={handleSend}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                  <Send size={12} /> Tandai Terkirim
                </button>
              )}
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors">
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
                onClick={() => navigate(leadId ? `/event/leads/${leadId}` : '/event/leads')}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                <ArrowLeft size={12} /> Kembali
              </button>
            </div>
          </div>
        </div>

        {/* ── Info singkat ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'PIC EFM', value: quotation.picEFM },
            { label: 'Lead ID', value: quotation.leadId || '-' },
            { label: 'Konsultasi', value: quotation.konsultasiId || '-' },
            { label: 'Status', value: quotation.status },
          ].map(f => (
            <div key={f.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">{f.label}</p>
              <p className="text-sm font-semibold text-[#1E1C43] mt-1">{f.value}</p>
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

                {/* Pajak rows */}
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

      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
