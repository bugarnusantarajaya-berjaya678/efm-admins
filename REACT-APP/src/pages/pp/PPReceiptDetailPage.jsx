import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Download } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { formatRp, sesiCount } from '../../data/ppReceiptData'
import { getAllReceipts } from '../../data/ppReceiptStore'

function QRPlaceholder({ label }) {
  return (
    <div className="bg-bg-page rounded-xl px-5 pt-5 pb-4 text-center border-[1.5px] border-border mb-5">
      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">Barcode Absensi Pelatih</div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-[120px] h-[120px] mx-auto text-primary">
        <rect x="2" y="2" width="9" height="9" rx="1"/><rect x="3.5" y="3.5" width="6" height="6" rx=".5" fill="currentColor" opacity=".15"/>
        <rect x="13" y="2" width="9" height="9" rx="1"/><rect x="14.5" y="3.5" width="6" height="6" rx=".5" fill="currentColor" opacity=".15"/>
        <rect x="2" y="13" width="9" height="9" rx="1"/><rect x="3.5" y="14.5" width="6" height="6" rx=".5" fill="currentColor" opacity=".15"/>
        <rect x="13" y="13" width="3" height="3"/><rect x="17" y="13" width="2" height="2"/><rect x="20" y="13" width="2" height="2"/>
        <rect x="13" y="17" width="2" height="2"/><rect x="16" y="16" width="3" height="3"/><rect x="20" y="17" width="2" height="4"/>
        <rect x="13" y="20" width="6" height="2"/>
      </svg>
      <div className="text-[11px] font-bold text-text-primary uppercase tracking-wider mt-3">{label}</div>
      <div className="text-[11px] text-text-muted mt-1">Scan untuk verifikasi pembayaran</div>
    </div>
  )
}

function ReceiptCard({ rcp, onGoToOrder, onGoToInvoice }) {
  const sesi = sesiCount(rcp.paket)
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden max-w-[560px] w-full">
      <div className="bg-primary px-7 py-6 flex items-center justify-between">
        <div>
          <div className="text-white font-extrabold text-sm tracking-wide">Essential Fitness Management</div>
          <button
            onClick={() => onGoToOrder(rcp.orderId)}
            className="text-white/55 text-[11px] mt-1 hover:text-white hover:underline block">
            Order ID: #{rcp.orderId}
          </button>
        </div>
        <span className="bg-[#27AE60] text-white text-[11px] font-bold px-3.5 py-1 rounded-full tracking-wide">LUNAS</span>
      </div>

      <div className="px-7 py-6">
        <div className="grid grid-cols-2 gap-x-5 gap-y-3 mb-5 pb-5 border-b border-border">
          {[
            ['No. Receipt',    rcp.rcpNo],
            ['Ref. Invoice',   rcp.invNo],
            ['Nama Klien',     rcp.client],
            ['Tgl Pembayaran', rcp.tglBayar],
            ['Metode Bayar',   rcp.metode],
            ['PIC Pelatih',    rcp.pic],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">{l}</div>
              {l === 'Ref. Invoice'
                ? <button onClick={() => onGoToInvoice(v)} className="text-[13px] font-semibold text-[#1E1C43] hover:underline">{v}</button>
                : <div className="text-[13px] font-semibold text-text-primary break-all">{v}</div>
              }
            </div>
          ))}
        </div>

        <QRPlaceholder label={rcp.rcpNo} />

        <div className="border border-border rounded-xl overflow-hidden mb-4">
          <table className="w-full text-xs" style={{ tableLayout: 'fixed', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-bg-page">
                <th className="px-3.5 py-2.5 text-left text-[10px] font-bold text-text-muted uppercase tracking-wider" style={{ width: '55%' }}>Program / Layanan</th>
                <th className="px-3.5 py-2.5 text-right text-[10px] font-bold text-text-muted uppercase tracking-wider" style={{ width: '20%' }}>Sesi</th>
                <th className="px-3.5 py-2.5 text-right text-[10px] font-bold text-text-muted uppercase tracking-wider" style={{ width: '25%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3.5 py-3">
                  <strong>{rcp.paket}</strong>
                  <br/><span className="text-text-muted text-[10px]">Sesi Personal Training EFM</span>
                </td>
                <td className="px-3.5 py-3 text-right">{sesi}</td>
                <td className="px-3.5 py-3 text-right font-semibold">{formatRp(rcp.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center px-3.5 py-3 bg-[#EAFAF1] rounded-xl font-bold text-text-primary">
          <span>Total Pembayaran</span>
          <span className="text-[#27AE60] text-base">{formatRp(rcp.total)}</span>
        </div>

        <div className="text-[11px] text-text-muted text-center mt-4 pt-4 border-t border-dashed border-border leading-[1.7]">
          Terima kasih telah mempercayakan program fitness Anda kepada kami.<br/>
          Simpan receipt ini sebagai bukti pembayaran yang sah.<br/>
          <strong>Essential Fitness Management</strong> — Profesional &amp; Terpercaya
        </div>
      </div>
    </div>
  )
}

export default function PPReceiptDetailPage() {
  const { id }    = useParams()
  const { state } = useLocation()
  const navigate  = useNavigate()

  const { setCrumbs } = useBreadcrumb()
  const [receipt, setReceipt] = useState(state?.receipt || getAllReceipts().find(r => r.rcpNo === id) || null)

  useEffect(() => {
    setCrumbs(['Private Program', 'Receipt', receipt ? '#' + receipt.rcpNo : id])
    return () => setCrumbs(null)
  }, [receipt?.rcpNo, id])

  const fromOrderId = state?.fromOrderId

  if (!receipt) {
    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => fromOrderId ? navigate('/pp/orders/' + fromOrderId, { state: { defaultTab: 'keuangan' } }) : navigate('/pp/receipt')}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors font-medium w-fit">
          <ArrowLeft size={16} /> {fromOrderId ? `Kembali ke Order #${fromOrderId}` : 'Kembali ke Daftar Receipt'}
        </button>
        <div className="text-center py-20 text-text-muted">Receipt tidak ditemukan.</div>
      </div>
    )
  }

  function handleResendWA() {
    setReceipt(prev => ({
      ...prev,
      waStatus: 'sent',
      waTgl: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    }))
    alert(`Receipt ${receipt.rcpNo} berhasil dikirim via WhatsApp!`)
  }

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => fromOrderId ? navigate('/pp/orders/' + fromOrderId, { state: { defaultTab: 'keuangan' } }) : navigate('/pp/receipt')}
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors font-medium w-fit">
        <ArrowLeft size={16} /> {fromOrderId ? `Kembali ke Order #${fromOrderId}` : 'Kembali ke Daftar Receipt'}
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{receipt.rcpNo}</h1>
          <p className="text-sm text-text-muted mt-1">Receipt pembayaran · {receipt.client}</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleResendWA}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white text-sm font-semibold rounded-lg transition-colors">
            <MessageCircle size={14} /> Resend WA
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors">
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      <ReceiptCard
        rcp={receipt}
        onGoToOrder={orderId => navigate('/pp/orders/' + orderId)}
        onGoToInvoice={invNo => navigate('/pp/invoice/' + invNo)}
      />
    </div>
  )
}
