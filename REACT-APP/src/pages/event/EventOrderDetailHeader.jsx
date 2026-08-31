import { useState } from 'react'
import { Calendar, Edit2, ArrowLeft, X, Save } from 'lucide-react'

const STATUS_CLS = {
  Aktif:   'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Selesai: 'bg-gray-100 text-gray-600',
  Batal:   'bg-red-100 text-red-600',
}

const TIPE_CLS_MAP = {
  Corporate:  'bg-[#1E1C43] text-white',
  Foundation: 'bg-orange-500 text-white',
  Government: 'bg-green-600 text-white',
  Brand:      'bg-purple-600 text-white',
  Community:  'bg-blue-500 text-white',
  Private:    'bg-pink-500 text-white',
  Individual: 'bg-gray-400 text-white',
}

function Badge({ children, cls }) {
  return (
    <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {children}
    </span>
  )
}

function fmtRp(n) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n)
}

function EventTahapanStepper({ currentTahapan }) {
  const steps = ['Quotation', 'MOU', 'Contract', 'Event Running', 'Event Selesai']
  const order = { 'Quotation': 0, 'MOU': 1, 'Contract': 2, 'Event Running': 3, 'Event Selesai': 4 }
  const currentIdx = order[currentTahapan] ?? 0
  return (
    <div className="flex items-start">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIdx
        const isCurrent   = idx === currentIdx
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${isCompleted ? 'bg-[#1E1C43] text-white' : isCurrent ? 'bg-[#E05945] text-white' : 'bg-gray-100 text-gray-400'}`}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <p className={`text-[10px] mt-1 text-center leading-tight
                ${isCurrent ? 'font-bold text-[#E05945]' : isCompleted ? 'font-medium text-[#1E1C43]' : 'text-gray-400'}`}>
                {step}
              </p>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 flex-1 -mt-4 ${isCompleted ? 'bg-[#1E1C43]' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function EventOrderDetailHeader({ isNew, order, subtotal, tahapanState, onTahapanChange, onBack }) {
  const [editingTahapan,    setEditingTahapan]    = useState(false)
  const [newTahapanVal,     setNewTahapanVal]     = useState(tahapanState)
  const [newTahapanCatatan, setNewTahapanCatatan] = useState('')

  const tipeCls  = TIPE_CLS_MAP[order.jenis] ?? 'bg-blue-500 text-white'
  const tipeLabel = order.jenis

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
      <div className="flex items-center gap-2 flex-wrap">

        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
          <Calendar size={16} className="text-white" />
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            B2B Event · {isNew ? 'EV-DRAFT' : order.id}
          </p>
          <h1 className="text-base font-bold text-[#1E1C43] leading-snug truncate">
            {isNew ? 'Order Baru' : (order.namaEvent || order.namaKlien)}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <Badge cls={tipeCls}>{tipeLabel}</Badge>
            <span className="text-gray-300 text-xs">·</span>
            <Badge cls={STATUS_CLS[order.status] ?? 'bg-gray-100 text-gray-600'}>● {order.status}</Badge>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-xs text-gray-500">{order.namaKlien}</span>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-xs font-semibold text-[#1E1C43]">{fmtRp(subtotal)}</span>
            {order.pic && (
              <>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-xs text-gray-400">PIC: {order.pic}</span>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {!isNew && (
          <button
            onClick={() => { setEditingTahapan(p => !p); setNewTahapanVal(tahapanState) }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors shrink-0"
          >
            <Edit2 size={13} /> Update Tahapan
          </button>
        )}

        {/* Back button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors shrink-0"
        >
          <ArrowLeft size={13} /> Kembali
        </button>
      </div>

      {/* Tahapan Stepper — full width below divider */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <EventTahapanStepper currentTahapan={tahapanState} />

        {/* Inline edit form */}
        {editingTahapan && (
          <div className="border-t border-gray-100 pt-4 mt-3">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tahapan Baru</label>
                  <select
                    value={newTahapanVal}
                    onChange={e => setNewTahapanVal(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]"
                  >
                    {['Quotation', 'MOU', 'Contract', 'Event Running', 'Event Selesai'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Catatan</label>
                  <input
                    type="text"
                    value={newTahapanCatatan}
                    onChange={e => setNewTahapanCatatan(e.target.value)}
                    placeholder="Catatan perubahan tahapan..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={() => setEditingTahapan(false)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
                >
                  <X size={12} /> Batal
                </button>
                <button
                  onClick={() => {
                    if (newTahapanVal && newTahapanVal !== tahapanState) onTahapanChange(newTahapanVal)
                    setEditingTahapan(false)
                    setNewTahapanCatatan('')
                  }}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1E1C43] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <Save size={12} /> Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
