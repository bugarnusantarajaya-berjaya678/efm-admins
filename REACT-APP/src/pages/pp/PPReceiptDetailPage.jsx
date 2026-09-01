import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Download, Receipt, CheckCircle2 } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { formatRp, sesiCount } from '../../data/ppReceiptData'
import { getAllReceipts } from '../../data/ppReceiptStore'
import { getCompanySettings } from '../../utils/companySettings'
import { getNoHpByOrderId } from '../../data/ppLeadsStore'

function QRVerifikasi({ label, size = 72 }) {
  return (
    <div className="flex flex-col items-center justify-center py-2">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
        style={{ width: size, height: size }}
        className="text-[#1E1C43]">
        <rect x="2" y="2" width="9" height="9" rx="1"/>
        <rect x="3.5" y="3.5" width="6" height="6" rx=".5" fill="currentColor" opacity=".15"/>
        <rect x="13" y="2" width="9" height="9" rx="1"/>
        <rect x="14.5" y="3.5" width="6" height="6" rx=".5" fill="currentColor" opacity=".15"/>
        <rect x="2" y="13" width="9" height="9" rx="1"/>
        <rect x="3.5" y="14.5" width="6" height="6" rx=".5" fill="currentColor" opacity=".15"/>
        <rect x="13" y="13" width="3" height="3"/>
        <rect x="17" y="13" width="2" height="2"/>
        <rect x="20" y="13" width="2" height="2"/>
        <rect x="13" y="17" width="2" height="2"/>
        <rect x="16" y="16" width="3" height="3"/>
        <rect x="20" y="17" width="2" height="4"/>
        <rect x="13" y="20" width="6" height="2"/>
      </svg>
      <p className="text-[10px] font-semibold text-[#1E1C43] mt-1.5 text-center tracking-wide">{label}</p>
      <p className="text-[9px] text-gray-400 mt-0.5 text-center">Tunjukkan setiap sesi</p>
    </div>
  )
}

function ReceiptDocument({ rcp, onGoToOrder, onGoToInvoice }) {
  const cs = getCompanySettings()
  const sesi = sesiCount(rcp.paket)
  const matchedBank = cs.rekeningList?.find(b =>
    rcp.metode.toLowerCase().includes(b.bank.toLowerCase())
  )

  return (
    <div className="bg-white rounded-2xl shadow-lg max-w-4xl mx-auto w-full overflow-hidden">

      {/* Navy Header */}
      <div className="bg-[#1E1C43] rounded-t-2xl px-6 py-5 sm:px-8 sm:py-6 grid grid-cols-2 gap-4 text-white">
        {/* Kiri — logo + info perusahaan */}
        <div className="flex items-start gap-3">
          {cs.logoPerusahaan ? (
            <img src={cs.logoPerusahaan} alt="EFM Logo"
              className="w-16 h-16 rounded-full object-contain shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <span className="text-white font-black text-base">EFM</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold leading-snug">{cs.namaPerusahaan}</p>
            <p className="text-xs text-white/60 mt-0.5">{cs.namaLegal}</p>
            <p className="text-xs text-white/60 mt-1 leading-relaxed max-w-xs">{cs.alamat}</p>
            <p className="text-xs text-white/60 mt-0.5">{cs.email}</p>
          </div>
        </div>

        {/* Kanan — RECEIPT title + nomor + meta */}
        <div className="text-right flex flex-col justify-between">
          <div>
            <div className="text-4xl font-black tracking-widest uppercase">RECEIPT</div>
            <div className="text-xs text-white/60 mt-1">{rcp.rcpNo}</div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-end gap-3">
              <span className="text-xs text-white/50">Ref. Invoice</span>
              <button onClick={() => onGoToInvoice(rcp.invNo)}
                className="text-xs font-semibold hover:underline">{rcp.invNo}</button>
            </div>
            <div className="flex items-center justify-end gap-3">
              <span className="text-xs text-white/50">Order ID</span>
              <button onClick={() => onGoToOrder(rcp.orderId)}
                className="text-xs font-semibold hover:underline">#{rcp.orderId}</button>
            </div>
            <div className="pt-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-500 text-white tracking-wide">
                LUNAS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 sm:px-8 py-6 space-y-5">

        {/* Informasi Pembayaran — 4-col single row */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Informasi Pembayaran
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4">
              {[
                ['Nama Klien',     rcp.client],
                ['Metode Bayar',   rcp.metode],
                ['Tgl Pembayaran', rcp.tglBayar],
                ['PIC Pelatih',    rcp.pic],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{l}</p>
                  <p className="text-sm font-semibold text-[#1E1C43]">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rincian Program + Total strip */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Rincian Program
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="border-b border-gray-200">
                  {[['Program / Layanan','55%'],['Jumlah Sesi','20%'],['Total Bayar','25%']].map(([h,w],i) => (
                    <th key={h}
                      style={{ width: w, textAlign: i === 0 ? 'left' : 'right' }}
                      className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold text-[#1E1C43]">{rcp.paket}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Sesi Personal Training EFM</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-right text-gray-600">{sesi} sesi</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-right text-[#1E1C43]">
                    {formatRp(rcp.total)}
                  </td>
                </tr>
              </tbody>
            </table>
            {/* Total strip — navy bottom of card */}
            <div className="bg-[#1E1C43] px-4 py-4 flex items-center justify-between">
              <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">
                Total Pembayaran Diterima
              </p>
              <div className="text-right">
                <p className="text-xl font-bold text-white">{formatRp(rcp.total)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Verifikasi — section besar untuk pelatih */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Kode Verifikasi Pembayaran
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl py-6 px-4 flex flex-col items-center">
            <QRVerifikasi label={rcp.rcpNo} size={160} />
            <p className="text-xs text-gray-400 mt-3 text-center">
              Tunjukkan barcode ini kepada pelatih / terapis di setiap sesi pertemuan berlangsung
            </p>
          </div>
        </div>

        {/* Detail Pembayaran Diterima */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Detail Pembayaran Diterima
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1E1C43]">{rcp.metode}</p>
                {matchedBank ? (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {matchedBank.rek} · a.n. {matchedBank.an}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-0.5">Pembayaran diterima langsung</p>
                )}
              </div>
              <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200 shrink-0">
                Terkonfirmasi
              </span>
            </div>
          </div>
        </div>

        {/* Catatan */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Catatan</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p className="text-sm text-gray-400 italic">Tidak ada catatan.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-dashed border-gray-200 text-center space-y-1">
          <p className="text-xs text-gray-400 leading-relaxed">
            Terima kasih telah mempercayakan program Anda kepada kami.<br />
            Simpan receipt ini sebagai bukti pembayaran yang sah.
          </p>
          <p className="text-xs font-semibold text-gray-500">
            Powered by {cs.namaPerusahaan}
          </p>
          <p className="text-[10px] text-gray-400">
            {cs.namaLegal}
          </p>
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
  const [receipt, setReceipt] = useState(
    state?.receipt || getAllReceipts().find(r => r.rcpNo === id) || null
  )

  useEffect(() => {
    setCrumbs(['Private Program', 'Receipt', receipt ? '#' + receipt.rcpNo : id])
    return () => setCrumbs(null)
  }, [receipt?.rcpNo, id])

  const fromOrderId = state?.fromOrderId

  if (!receipt) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <button
            onClick={() => fromOrderId
              ? navigate('/pp/orders/' + fromOrderId, { state: { defaultTab: 'keuangan' } })
              : navigate('/pp/receipt')
            }
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors">
            <ArrowLeft size={13} /> {fromOrderId ? `Kembali ke Order #${fromOrderId}` : 'Kembali ke Receipt'}
          </button>
        </div>
        <div className="text-center py-20 text-text-muted">Receipt tidak ditemukan.</div>
      </div>
    )
  }

  function handleResendWA() {
    const cs = getCompanySettings()
    const msg = [
      `Halo *${receipt.sapaan} ${receipt.client}*,`,
      '',
      `Pembayaran Anda telah kami terima & dikonfirmasi ✅`,
      '',
      `📄 *Receipt #${receipt.rcpNo}*`,
      `📋 Ref. Invoice: ${receipt.invNo}`,
      `📅 Tanggal Bayar: ${receipt.tglBayar}`,
      `💳 Metode: ${receipt.metode}`,
      `🏃 Program: ${receipt.paket}`,
      `💰 Total: ${formatRp(receipt.total)}`,
      '',
      `Terima kasih telah mempercayakan program fitness Anda kepada kami. Selamat berlatih! 💪`,
      `_${cs.namaPerusahaan}_`,
    ].join('\n')
    const noHP = getNoHpByOrderId(receipt.orderId)
    const waUrl = noHP
      ? `https://wa.me/62${noHP.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(waUrl, '_blank')
    setReceipt(prev => ({
      ...prev,
      waStatus: 'sent',
      waTgl: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    }))
  }

  const backOrderId = fromOrderId || receipt.orderId
  const waSent = receipt.waStatus === 'sent'

  return (
    <div className="flex flex-col gap-4 pb-8">

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-10 h-10 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
            <Receipt size={16} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Receipt Pembayaran PP
            </p>
            <h1 className="text-base font-bold text-[#1E1C43] leading-snug truncate">Receipt #{receipt.rcpNo}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-gray-500">{receipt.client}</span>
              <span className="text-gray-300 text-xs">·</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-green-500">
                LUNAS
              </span>
              {waSent && (
                <>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                    <MessageCircle size={9} />
                    WA Terkirim{receipt.waTgl ? ` · ${receipt.waTgl}` : ''}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={handleResendWA}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] hover:bg-[#1DA851] text-white text-xs font-semibold rounded-lg transition-colors shrink-0">
            <MessageCircle size={13} /> {waSent ? 'Kirim Ulang WA' : 'Kirim WA'}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors shrink-0">
            <Download size={13} /> Download PDF
          </button>
          <button
            onClick={() => navigate('/pp/orders/' + backOrderId, { state: { activeTab: 'kontrak' } })}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors shrink-0">
            <ArrowLeft size={13} /> Order #{backOrderId}
          </button>
        </div>
      </div>

      <ReceiptDocument
        rcp={receipt}
        onGoToOrder={orderId => navigate('/pp/orders/' + orderId)}
        onGoToInvoice={invNo => navigate('/pp/invoice/' + invNo)}
      />
    </div>
  )
}
