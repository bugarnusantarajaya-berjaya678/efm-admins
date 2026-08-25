import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Download, ScrollText } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { INVOICES_INIT, STATUS_LABEL, formatRp } from '../../data/ppInvoiceData'

const DEFAULT_SYARAT = [
  'Pembayaran dilakukan paling lambat 3 hari setelah invoice diterima.',
  'Program dimulai setelah konfirmasi pembayaran dari Essential Fitness Management.',
  'Sesi yang tidak dihadiri tanpa konfirmasi H-1 tidak dapat dijadwal ulang.',
  'Pembatalan program setelah sesi ke-3 tidak dapat direfund.',
  'Essential Fitness Management berhak mengganti pelatih jika diperlukan dengan pemberitahuan terlebih dahulu.',
  'Untuk pertanyaan terkait invoice, hubungi: essentialfitnessmanagement@gmail.com',
]

function getSyaratList() {
  try {
    const saved = localStorage.getItem('efmInvoiceTemplate')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed.items) && parsed.items.length > 0) return parsed.items
    }
  } catch {}
  return DEFAULT_SYARAT
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
          <h3 className="text-base font-bold text-text-primary">Konfirmasi Pembayaran</h3>
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

  useEffect(() => {
    setCrumbs(['Private Program', 'Invoice', invoice ? '#' + invoice.invNo : id])
    return () => setCrumbs(null)
  }, [invoice?.invNo, id])

  if (!invoice) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <button onClick={() => state?.fromOrderId ? navigate(`/pp/orders/${state.fromOrderId}`, { state: { activeTab: 'kontrak' } }) : navigate('/pp/invoice')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold rounded-lg transition-colors">
            <ArrowLeft size={13} /> {state?.fromOrderId ? `Kembali ke Order #${state.fromOrderId}` : 'Kembali ke Invoice'}
          </button>
        </div>
        <div className="text-center py-20 text-text-muted">Invoice tidak ditemukan.</div>
      </div>
    )
  }

  const subtotalBase   = (invoice.hargaPaket || 0) - (invoice.diskonPaket || 0) + (invoice.biayaLain || 0)
  const statusBadgeCls = { paid: 'bg-green-500', pending: 'bg-yellow-500', overdue: 'bg-red-500', draft: 'bg-gray-400' }[invoice.status] || 'bg-gray-400'
  const syaratList     = getSyaratList()

  function handleMarkPaid({ paidDate, payMethod }) {
    setInvoice(prev => ({ ...prev, status: 'paid', paidDate, payMethod }))
    setModal(null)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Page header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
              <ScrollText size={18} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Invoice Private Training</p>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">Invoice #{invoice.invNo}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{invoice.client}</span>
                <span className="text-gray-300 text-xs">·</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${statusBadgeCls}`}>
                  {STATUS_LABEL[invoice.status] || invoice.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1E1C43] hover:bg-[#2d2b5c] text-white text-xs font-semibold rounded-lg transition-colors">
              <Download size={13} /> Download PDF
            </button>
            {invoice.status === 'paid' && (
              <button
                onClick={() => navigate('/pp/receipt', { state: { filterSearch: invoice.invNo } })}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border-[1.5px] border-primary text-primary text-xs font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                Lihat Receipt
              </button>
            )}
            {(invoice.status === 'pending' || invoice.status === 'overdue') && (
              <button
                onClick={() => setModal('markPaid')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#27AE60] hover:bg-[#1E8449] text-white text-xs font-semibold rounded-lg transition-colors">
                <CheckCircle size={13} /> Konfirmasi Pembayaran
              </button>
            )}
            <button
              onClick={() => state?.fromOrderId ? navigate(`/pp/orders/${state.fromOrderId}`, { state: { activeTab: 'kontrak' } }) : navigate('/pp/invoice')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold rounded-lg transition-colors">
              <ArrowLeft size={13} /> {state?.fromOrderId ? `Kembali ke Order #${state.fromOrderId}` : 'Kembali ke Invoice'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Invoice Document ── */}
      <div className="bg-white rounded-2xl shadow-lg max-w-4xl mx-auto w-full overflow-hidden">

        {/* Header Navy */}
        <div className="bg-[#1E1C43] rounded-t-2xl p-6 sm:p-8 flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-start">
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="w-16 h-16 rounded-full object-cover shrink-0" alt="EFM Logo" />
            <div>
              <div className="text-white font-bold text-sm leading-snug">Essential Fitness Management</div>
              <div className="text-white/60 text-[10.5px] mt-1 leading-relaxed">
                CV. Bugar Nusantara Jaya<br/>
                Jl. Terogong Raya No.18, Jakarta Selatan<br/>
                essentialfitnessmanagement@gmail.com
              </div>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-4xl font-black text-white tracking-widest uppercase">INVOICE</div>
            <div className="text-sm text-gray-300 mt-1">No: {invoice.invNo}</div>
            <div className="border-t border-white/20 my-2" />

            <div className="flex justify-start sm:justify-end items-center gap-2 mb-1">
              <span className="text-xs text-gray-400">Tanggal:</span>
              <span className="text-white font-semibold text-sm">{invoice.tanggal}</span>
            </div>

            <div className="flex justify-start sm:justify-end items-center gap-2 mb-1">
              <span className="text-xs text-gray-400">Jatuh Tempo:</span>
              <span className="text-white font-semibold text-sm">{invoice.due}</span>
            </div>

            <div className="flex justify-start sm:justify-end items-center gap-2">
              <span className="text-xs text-gray-400">Order ID:</span>
              <button
                onClick={() => navigate('/pp/orders/' + invoice.orderId)}
                className="text-white font-semibold text-sm hover:underline">
                #{invoice.orderId}
              </button>
            </div>

            <div className="border-t border-white/20 my-2" />

            <span className={`px-4 py-1 rounded-full text-white text-sm font-semibold inline-block mt-1 ${statusBadgeCls}`}>
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

          <div className="mt-4 bg-[#1E1C43] rounded-xl px-6 py-4 flex justify-between items-center">
            <span className="text-white font-bold text-lg">Total Tagihan</span>
            <span className="text-white font-bold text-lg">{formatRp(subtotalBase)}</span>
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
              {[
                { bank: 'BCA', rek: '1234567890', an: 'CV. Bugar Nusantara Jaya' },
                { bank: 'Mandiri', rek: '1100009876543', an: 'CV. Bugar Nusantara Jaya' },
              ].map(b => (
                <div key={b.bank} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Transfer {b.bank}</p>
                  <p className="text-sm font-bold text-[#1E1C43] font-mono">{b.rek}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">a.n. {b.an}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">Mohon cantumkan nomor invoice (<span className="font-semibold text-gray-600">{invoice.invNo}</span>) sebagai keterangan transfer.</p>
          </div>
        )}

        {/* Catatan Invoice */}
        <div className="px-8 py-4 border-t border-gray-100">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Catatan</div>
          {invoice.catatan ? (
            <p className="text-sm text-gray-600">{invoice.catatan}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Tidak ada catatan</p>
          )}
        </div>

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
          <p className="text-xs font-semibold text-gray-500">Essential Fitness Management</p>
          <p className="text-[11px] text-gray-400">essentialfitnessmanagement@gmail.com · Jl. Terogong Raya No.18, Jakarta Selatan</p>
          <p className="text-[10px] text-gray-300 mt-2">Dokumen ini digenerate oleh sistem EFM V2</p>
        </div>
      </div>

      {modal === 'markPaid' && (
        <MarkPaidModal inv={invoice} onConfirm={handleMarkPaid} onClose={() => setModal(null)} />
      )}

    </div>
  )
}
