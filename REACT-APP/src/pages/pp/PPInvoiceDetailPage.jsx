import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Download, MessageCircle, ScrollText, Receipt, Plus, Edit, X, Tag, ChevronDown } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { INVOICES_INIT, STATUS_LABEL, formatRp } from '../../data/ppInvoiceData'
import { getReceiptByInvNo } from '../../data/ppReceiptStore'
import { getCompanySettings } from '../../utils/companySettings'
import { getNoHpByOrderId } from '../../data/ppLeadsStore'

function getDefaultSyarat() {
  const cs = getCompanySettings()
  return [
    'Pembayaran dilakukan paling lambat 3 hari setelah invoice diterima.',
    `Program dimulai setelah konfirmasi pembayaran dari ${cs.namaPerusahaan}.`,
    'Sesi yang tidak dihadiri tanpa konfirmasi H-1 tidak dapat dijadwal ulang.',
    'Pembatalan program setelah sesi ke-3 tidak dapat direfund.',
    `${cs.namaPerusahaan} berhak mengganti pelatih jika diperlukan dengan pemberitahuan terlebih dahulu.`,
    `Untuk pertanyaan terkait invoice, hubungi: ${cs.email}`,
  ]
}

function getSyaratList() {
  try {
    const saved = localStorage.getItem('efmInvoiceTemplate')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed.items) && parsed.items.length > 0) return parsed.items
    }
  } catch {}
  return getDefaultSyarat()
}

const validKodeDiskon = {
  HEMAT10:   { label: 'Voucher Hemat 10%',    tipe: 'persen',  nilai: 10    },
  HARBOLNAS: { label: 'Hari Belanja Nasional', tipe: 'persen',  nilai: 15    },
  FLAT50K:   { label: 'Flat Diskon Spesial',  tipe: 'nominal', nilai: 50000 },
}

function MarkPaidModal({ inv, onConfirm, onClose }) {
  const [paidDate,  setPaidDate]  = useState('')
  const [payMethod, setPayMethod] = useState('Transfer Bank (BCA)')

  function handleConfirm() {
    if (!paidDate) { alert('Pilih tanggal pembayaran.'); return }
    onConfirm({ paidDate, payMethod })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-border">
          <h3 className="text-sm font-bold text-text-primary">Konfirmasi Pembayaran</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted hover:bg-bg-page">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="px-7 py-6 space-y-4">
          <div className="bg-[#EAFAF1] rounded-xl px-4 py-3.5 border-l-[3px] border-[#27AE60]">
            <div className="text-xs font-bold text-[#27AE60] mb-1 uppercase tracking-wide">Konfirmasi Pembayaran</div>
            <div className="text-sm text-text-primary">{inv.invNo} — {inv.client}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">Tanggal Pembayaran</label>
            <input type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)}
              className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">Metode Pembayaran</label>
            <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
              className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-lg text-sm text-text-primary bg-white outline-none focus:border-primary">
              <option>Transfer Bank (BCA)</option>
              <option>Transfer Bank (Mandiri)</option>
              <option>Cash</option>
              <option>QRIS</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">Upload Bukti Transfer <span className="text-accent">*</span></label>
            <div className="border-2 border-dashed border-border rounded-xl p-5 text-center cursor-pointer hover:border-primary hover:bg-bg-page transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 mx-auto text-text-muted mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div className="text-sm font-semibold text-text-primary mb-0.5">Klik untuk upload bukti</div>
              <div className="text-[11px] text-text-muted">JPG, PNG, atau PDF (Maks. 5MB)</div>
            </div>
          </div>
        </div>
        <div className="px-7 pb-6 flex justify-end gap-2.5 border-t border-border pt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-muted border border-border rounded-lg hover:bg-bg-page">Batal</button>
          <button onClick={handleConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-[#27AE60] hover:bg-[#1E8449] rounded-lg flex items-center gap-1.5">
            <CheckCircle size={14} /> Konfirmasi Paid
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PPInvoiceDetailPage() {
  const { id }    = useParams()
  const { state } = useLocation()
  const navigate  = useNavigate()

  const { setCrumbs } = useBreadcrumb()
  const [invoice, setInvoice] = useState(state?.invoice || INVOICES_INIT.find(i => i.invNo === id) || null)
  const [modal,   setModal]   = useState(null)
  const [cs]                  = useState(() => getCompanySettings())
  const [editing,       setEditing]       = useState(false)
  const [catatanDraft,  setCatatanDraft]  = useState('')
  const [kodeInput,     setKodeInput]     = useState('')
  const [diskonApplied, setDiskonApplied] = useState(null)
  const [diskonError,   setDiskonError]   = useState(false)
  const [showWAMenu,    setShowWAMenu]    = useState(false)

  useEffect(() => {
    setCrumbs(['Private Program', 'Invoice', invoice ? '#' + invoice.invNo : id])
    return () => setCrumbs(null)
  }, [invoice?.invNo, id])

  if (!invoice) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <button onClick={() => state?.fromOrderId ? navigate(`/pp/orders/${state.fromOrderId}`, { state: { activeTab: 'kontrak' } }) : navigate('/pp/invoice')}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">
            <ArrowLeft size={13} /> {state?.fromOrderId ? `Kembali ke Order #${state.fromOrderId}` : 'Kembali ke Invoice'}
          </button>
        </div>
        <div className="text-center py-20 text-text-muted">Invoice tidak ditemukan.</div>
      </div>
    )
  }

  const subtotalBase   = (invoice.hargaPaket || 0) - (invoice.diskonPaket || 0) + (invoice.biayaLain || 0)
  const promoDiskon    = invoice.promoVal || 0
  const totalAkhir     = subtotalBase - promoDiskon
  const statusBadgeCls = { paid: 'bg-green-500', pending: 'bg-yellow-500', overdue: 'bg-red-500', draft: 'bg-gray-400' }[invoice.status] || 'bg-gray-400'

  function startEdit() {
    setCatatanDraft(invoice.catatan || '')
    const existingKode = invoice.promoKode || ''
    setKodeInput(existingKode)
    setDiskonApplied(existingKode && validKodeDiskon[existingKode]
      ? { kode: existingKode, ...validKodeDiskon[existingKode] }
      : null)
    setDiskonError(false)
    setEditing(true)
  }

  function applyKode() {
    const kode = kodeInput.trim().toUpperCase()
    if (validKodeDiskon[kode]) {
      setDiskonApplied({ kode, ...validKodeDiskon[kode] })
      setDiskonError(false)
    } else {
      setDiskonApplied(null)
      setDiskonError(true)
    }
  }

  function removeKode() {
    setDiskonApplied(null)
    setKodeInput('')
    setDiskonError(false)
  }

  function saveEdit() {
    const promoVal = diskonApplied
      ? diskonApplied.tipe === 'persen'
        ? Math.round(subtotalBase * diskonApplied.nilai / 100)
        : diskonApplied.nilai
      : 0
    setInvoice(prev => ({
      ...prev,
      catatan:   catatanDraft,
      promoKode: diskonApplied?.kode  || '',
      promoType: diskonApplied?.tipe  || '',
      promoVal,
    }))
    setEditing(false)
  }

  const editDiskonVal = diskonApplied
    ? diskonApplied.tipe === 'persen'
      ? Math.round(subtotalBase * diskonApplied.nilai / 100)
      : diskonApplied.nilai
    : 0
  const editTotal = subtotalBase - editDiskonVal
  const syaratList     = getSyaratList()
  const existingReceipt = getReceiptByInvNo(invoice.invNo)

  function handleKirimWA() {
    window.print()
    const cs = getCompanySettings()
    const msg = [
      `Halo *${invoice.sapaan} ${invoice.client}*,`,
      '',
      `Berikut kami sampaikan invoice untuk program Private Training Anda di *${cs.namaPerusahaan}* 🏋️`,
      '',
      `📋 *Invoice #${invoice.invNo}*`,
      `📅 Tanggal: ${invoice.tanggal}`,
      `⏰ Jatuh Tempo: ${invoice.due}`,
      `🏃 Program: Private Training — ${invoice.paket}`,
      `👤 Pelatih: ${invoice.pic}`,
      `💰 Total: ${formatRp(subtotalBase)}`,
      '',
      `Mohon lakukan pembayaran sebelum tanggal jatuh tempo ke:`,
      `🏦 ${cs.namaBank}: ${cs.nomorRekening} a.n. ${cs.atasNamaRekening}`,
      '',
      `Cantumkan nomor invoice *(${invoice.invNo})* sebagai keterangan transfer.`,
      '',
      `Terima kasih 🙏`,
      `_${cs.namaPerusahaan}_`,
    ].join('\n')
    const noHP = getNoHpByOrderId(invoice.orderId)
    const waUrl = noHP
      ? `https://wa.me/62${noHP.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(waUrl, '_blank')
  }

  function handleReminderWA() {
    const cs = getCompanySettings()
    const msg = [
      `Halo *${invoice.sapaan} ${invoice.client}*,`,
      '',
      `Kami ingin mengingatkan bahwa invoice berikut masih belum terbayar:`,
      '',
      `📋 *Invoice #${invoice.invNo}*`,
      `⏰ Jatuh Tempo: ${invoice.due}`,
      `💰 Total: ${formatRp(subtotalBase)}`,
      '',
      `Mohon segera lakukan pembayaran ke:`,
      `🏦 ${cs.namaBank}: ${cs.nomorRekening} a.n. ${cs.atasNamaRekening}`,
      '',
      `Cantumkan nomor invoice *(${invoice.invNo})* sebagai keterangan transfer.`,
      '',
      `Jika ada pertanyaan, silakan hubungi kami. Terima kasih 🙏`,
      `_${cs.namaPerusahaan}_`,
    ].join('\n')
    const noHP = getNoHpByOrderId(invoice.orderId)
    const waUrl = noHP
      ? `https://wa.me/62${noHP.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(waUrl, '_blank')
  }

  function handleMarkPaid({ paidDate, payMethod }) {
    setInvoice(prev => ({ ...prev, status: 'paid', paidDate, payMethod }))
    setModal(null)
    navigate('/pp/receipt', {
      state: {
        createNew: true,
        prefill: {
          invNo: invoice.invNo,
          orderId: invoice.orderId,
          client: invoice.client,
          paket: invoice.paket,
          pic: invoice.pic,
          total: subtotalBase,
        }
      }
    })
  }

  return (
    <div className="flex flex-col gap-4 pb-24">

      {/* Page header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-10 h-10 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
            <ScrollText size={16} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Invoice Private Training</p>
            <h1 className="text-base font-bold text-[#1E1C43] leading-snug truncate">Invoice #{invoice.invNo}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-gray-500">{invoice.client}</span>
              <span className="text-gray-300 text-xs">·</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${statusBadgeCls}`}>
                {STATUS_LABEL[invoice.status] || invoice.status}
              </span>
            </div>
          </div>

          {/* Action buttons — hidden during editing */}
          {!editing && (
            <>
              {/* Primary CTA */}
              {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                <button
                  onClick={() => setModal('markPaid')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#27AE60] hover:bg-[#1E8449] text-white text-xs font-semibold rounded-lg transition-colors shrink-0">
                  <CheckCircle size={13} /> Konfirmasi Pembayaran
                </button>
              )}
              {invoice.status === 'paid' && existingReceipt && (
                <button
                  onClick={() => navigate('/pp/receipt/' + existingReceipt.rcpNo, { state: { receipt: existingReceipt } })}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#27AE60] hover:bg-[#1E8449] text-white text-xs font-semibold rounded-lg transition-colors shrink-0">
                  <Receipt size={13} /> Lihat Receipt
                </button>
              )}
              {invoice.status === 'paid' && !existingReceipt && (
                <button
                  onClick={() => navigate('/pp/receipt', { state: { createNew: true, prefill: { invNo: invoice.invNo, orderId: invoice.orderId, client: invoice.client, paket: invoice.paket, pic: invoice.pic, total: subtotalBase } } })}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#27AE60] hover:bg-[#1E8449] text-white text-xs font-semibold rounded-lg transition-colors shrink-0">
                  <Plus size={13} /> Buat Receipt
                </button>
              )}

              {/* WA dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowWAMenu(p => !p)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] hover:bg-[#1DA851] text-white text-xs font-semibold rounded-lg transition-colors">
                  <MessageCircle size={13} /> Kirim WA <ChevronDown size={11} />
                </button>
                {showWAMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[160px]">
                    <button
                      onClick={() => { handleKirimWA(); setShowWAMenu(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                      <MessageCircle size={12} className="text-[#25D366]" /> Kirim Invoice
                    </button>
                    {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                      <button
                        onClick={() => { handleReminderWA(); setShowWAMenu(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-50">
                        <MessageCircle size={12} className="text-orange-400" /> Kirim Reminder
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Download PDF */}
              <button onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors shrink-0">
                <Download size={13} /> Download PDF
              </button>
            </>
          )}

          {/* Back button — always visible */}
          <button
            onClick={() => state?.fromOrderId ? navigate(`/pp/orders/${state.fromOrderId}`, { state: { activeTab: 'kontrak' } }) : navigate('/pp/invoice')}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors shrink-0">
            <ArrowLeft size={13} /> {state?.fromOrderId ? `Order #${state.fromOrderId}` : 'Invoice'}
          </button>
        </div>
      </div>

      {/* ── Invoice Document ── */}
      <div className="bg-white rounded-2xl shadow-lg max-w-4xl mx-auto w-full overflow-hidden">

        {/* Header Navy */}
        <div className="bg-[#1E1C43] rounded-t-2xl px-6 py-4 sm:px-8 sm:py-5 grid grid-cols-2 gap-4 text-white">
          <div className="flex items-start gap-3">
            {cs.logoPerusahaan ? (
              <img src={cs.logoPerusahaan} alt="EFM Logo" className="w-20 h-20 rounded-full object-contain shrink-0" />
            ) : (
              <img src="/logo.png" alt="EFM Logo" className="w-20 h-20 rounded-full object-cover shrink-0" onError={e => { e.target.style.display = 'none' }} />
            )}
            <div>
              <p className="text-base font-bold">{cs.namaPerusahaan}</p>
              <p className="text-xs text-white/70 mt-0.5">{cs.namaLegal}</p>
              <p className="text-xs text-white/70 mt-0.5 leading-relaxed max-w-xs">{cs.alamat}</p>
              <p className="text-xs text-white/70 mt-0.5">{cs.email}</p>
              <p className="text-xs text-white/70 mt-0.5">{cs.telepon}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-4xl font-black tracking-widest uppercase">INVOICE</div>
            <div className="text-sm text-gray-300 mt-0.5">{invoice.invNo}</div>

            <div className="flex justify-end items-center gap-2 mb-0.5 mt-0.5">
              <span className="text-xs text-gray-400">Tanggal:</span>
              <span className="font-semibold text-sm">{invoice.tanggal}</span>
            </div>

            <div className="flex justify-end items-center gap-2 mb-0.5">
              <span className="text-xs text-gray-400">Jatuh Tempo:</span>
              <span className="font-semibold text-sm">{invoice.due}</span>
            </div>

            <span className={`px-4 py-1 rounded-full text-white text-sm font-semibold inline-block mt-0.5 ${statusBadgeCls}`}>
              {STATUS_LABEL[invoice.status]}
            </span>
          </div>
        </div>

        {/* Tagihan Kepada */}
        <div className="px-6 sm:px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2.5">Tagihan Kepada</div>
            <div className="text-[18px] font-bold text-text-primary mb-1">{invoice.client}</div>
            <div className="text-[12px] text-text-muted leading-[1.8]">
              Order ID: <button onClick={() => navigate('/pp/orders/' + invoice.orderId)} className="font-semibold text-[#1E1C43] hover:underline">#{invoice.orderId}</button>
              {invoice.paket && <><br/>Paket: <span className="font-semibold text-text-primary">Private Training — {invoice.paket}</span></>}
              {invoice.pic  && <><br/>PIC Pelatih: <span className="font-semibold text-text-primary">{invoice.pic}</span></>}
            </div>
          </div>
          {invoice.namaLatihan && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 text-right min-w-[160px]">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Program Latihan</div>
              <div className="text-sm font-semibold text-text-primary">{invoice.namaLatihan}</div>
              <div className="text-[11px] text-text-muted mt-0.5">{invoice.sesi} Sesi</div>
            </div>
          )}
        </div>

        {/* Tabel Rincian Layanan */}
        <div className="px-8 pt-6 pb-2 overflow-x-auto">
          <table className="w-full text-xs" style={{ tableLayout: 'fixed', minWidth: '540px', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-[#f8fafc]">
                {['Deskripsi','Harga Persesi','Jumlah Sesi','Harga Paket','Diskon Paket','Total'].map((h, i) => (
                  <th key={h}
                    className="px-2.5 py-3 text-[10px] font-semibold text-text-primary uppercase tracking-wide border-b border-border"
                    style={{ textAlign: i === 0 ? 'left' : i === 2 ? 'center' : 'right' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2.5 py-3 border-b border-border">
                  <div className="font-semibold text-text-primary">Private Training — {invoice.paket}</div>
                  <div className="text-[11px] text-text-muted">{invoice.namaLatihan} · PIC: {invoice.pic}</div>
                </td>
                <td className="px-2.5 py-3 border-b border-border text-right">{formatRp(invoice.hargaPersesi)}</td>
                <td className="px-2.5 py-3 border-b border-border text-center">{invoice.sesi}</td>
                <td className="px-2.5 py-3 border-b border-border text-right">{formatRp(invoice.hargaPaket)}</td>
                <td className="px-2.5 py-3 border-b border-border text-right text-[#27AE60]">
                  {invoice.diskonPaket ? `- ${formatRp(invoice.diskonPaket)}` : '—'}
                </td>
                <td className="px-2.5 py-3 border-b border-border text-right font-semibold">
                  {formatRp(invoice.hargaPaket - (invoice.diskonPaket || 0))}
                </td>
              </tr>
              {invoice.biayaLain > 0 && (
                <tr>
                  <td className="px-2.5 py-3 border-b border-border" colSpan={5}>
                    <div className="font-semibold text-text-primary">Biaya Tambahan</div>
                    <div className="text-[11px] text-text-muted">{invoice.biayaLainKet || 'Biaya lain-lain'}</div>
                  </td>
                  <td className="px-2.5 py-3 border-b border-border text-right font-semibold">{formatRp(invoice.biayaLain)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Kalkulasi */}
        <div className="px-8 py-6 border-t border-gray-100">
          <div className="flex justify-between items-center py-1.5 text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-800">{formatRp(subtotalBase)}</span>
          </div>

          {/* Kode Diskon — edit mode */}
          {editing && (
            <div className="py-2 border-t border-gray-100 mt-1">
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5"><Tag size={11} /> Kode Diskon</p>
              {diskonApplied ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-xs font-semibold text-green-700">{diskonApplied.kode}</span>
                    <span className="text-xs text-green-600 ml-2">— {diskonApplied.label}</span>
                    <span className="text-xs font-bold text-green-700 ml-2">
                      - {formatRp(editDiskonVal)}
                    </span>
                  </div>
                  <button onClick={removeKode} className="text-green-600 hover:text-red-500 transition-colors ml-3">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={kodeInput}
                    onChange={e => { setKodeInput(e.target.value.toUpperCase()); setDiskonError(false) }}
                    onKeyDown={e => e.key === 'Enter' && applyKode()}
                    placeholder="Masukkan kode voucher"
                    className={`flex-1 px-3 py-2 border rounded-lg text-xs outline-none focus:border-[#1E1C43] ${diskonError ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  <button onClick={applyKode}
                    className="px-3 py-2 bg-[#1E1C43] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-colors">
                    Terapkan
                  </button>
                </div>
              )}
              {diskonError && <p className="text-[10px] text-red-500 mt-1">Kode tidak valid atau tidak ditemukan.</p>}
            </div>
          )}

          {/* Kode Diskon — read mode (if applied) */}
          {!editing && promoDiskon > 0 && (
            <div className="flex justify-between items-center py-1.5 text-sm border-t border-gray-100 mt-1">
              <span className="text-green-600 flex items-center gap-1.5"><Tag size={12} /> Diskon ({invoice.promoKode})</span>
              <span className="font-medium text-green-600">- {formatRp(promoDiskon)}</span>
            </div>
          )}

          <div className="mt-4 bg-[#1E1C43] rounded-xl px-6 py-4 flex justify-between items-center">
            <span className="text-white font-bold text-lg">Total Tagihan</span>
            <span className="text-white font-bold text-lg">
              {editing ? formatRp(editTotal) : formatRp(totalAkhir)}
            </span>
          </div>

          {invoice.status === 'paid' && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-start gap-3">
              <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-green-800">Pembayaran Telah Dikonfirmasi — LUNAS</p>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                  {invoice.paidDate && (
                    <>
                      <p className="text-[11px] text-green-700 font-medium">Tanggal Lunas</p>
                      <p className="text-[11px] text-green-800 font-semibold">{invoice.paidDate}</p>
                    </>
                  )}
                  {invoice.payMethod && (
                    <>
                      <p className="text-[11px] text-green-700 font-medium">Metode Pembayaran</p>
                      <p className="text-[11px] text-green-800 font-semibold">{invoice.payMethod}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cara Pembayaran */}
        {invoice.status !== 'paid' && (
          <div className="px-6 sm:px-8 py-6 border-t border-gray-100">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Cara Pembayaran</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(cs.rekeningList || [{ bank: cs.namaBank, rek: cs.nomorRekening, an: cs.atasNamaRekening }]).map(b => (
                <div key={b.bank} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Transfer {b.bank}</p>
                  <p className="text-sm font-bold text-[#1E1C43] font-mono">{b.rek}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">a.n. {b.an}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Catatan Invoice — hidden when empty and not editing */}
        {(editing || invoice.catatan) && (
          <div className="px-8 py-4 border-t border-gray-100">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Catatan</div>
            {editing ? (
              <textarea
                value={catatanDraft}
                onChange={e => setCatatanDraft(e.target.value)}
                placeholder="Tambahkan catatan untuk invoice ini..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:border-[#1E1C43] resize-none"
              />
            ) : (
              <p className="text-sm text-gray-600">{invoice.catatan}</p>
            )}
          </div>
        )}

        {/* Syarat & Ketentuan */}
        <div className="px-8 py-6 border-t border-gray-100">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Syarat &amp; Ketentuan</div>
          <ol className="list-decimal list-inside space-y-2">
            {syaratList.map((item, idx) => (
              <li key={idx} className="text-sm text-gray-600">{item}</li>
            ))}
          </ol>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-5 border-t border-gray-100 text-center space-y-1">
          <p className="text-xs font-semibold text-gray-500">{cs.namaPerusahaan}</p>
          <p className="text-[11px] text-gray-400">{cs.email} · {cs.alamat}</p>
          <p className="text-[10px] text-gray-300 mt-2">Dokumen ini digenerate oleh sistem EFM V2</p>
        </div>
      </div>

      {modal === 'markPaid' && (
        <MarkPaidModal inv={invoice} onConfirm={handleMarkPaid} onClose={() => setModal(null)} />
      )}

      {/* Sticky footer — Edit / Simpan / Batal */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 z-40">
        {editing ? (
          <>
            <button
              onClick={() => setEditing(false)}
              className="border border-gray-300 text-gray-600 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button
              onClick={saveEdit}
              className="inline-flex items-center gap-1.5 bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors">
              <CheckCircle size={14} /> Simpan Perubahan
            </button>
          </>
        ) : (
          <button
            onClick={startEdit}
            className="inline-flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Edit size={14} /> Edit Invoice
          </button>
        )}
      </div>

    </div>
  )
}
