import { useState } from 'react'
import { Edit2, ArrowLeft, X, Save } from 'lucide-react'

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

const AVATAR_COLORS = [
  '#E05945', '#1E1C43', '#2563EB', '#7C3AED',
  '#0891B2', '#059669', '#D97706', '#DC2626',
]

function getAvatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

function Badge({ children, cls }) {
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {children}
    </span>
  )
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

export default function EventOrderDetailHeader({ isNew, order, tahapanState, onTahapanChange, onBack }) {
  const [editingTahapan,    setEditingTahapan]    = useState(false)
  const [newTahapanVal,     setNewTahapanVal]     = useState(tahapanState)
  const [newTahapanTanggal, setNewTahapanTanggal] = useState('')
  const [newTahapanCatatan, setNewTahapanCatatan] = useState('')

  const avatarName = order.namaKlien || order.namaEvent || ''
  const tipeCls    = TIPE_CLS_MAP[order.jenis] ?? 'bg-blue-500 text-white'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">

        {/* LEFT: Avatar + Info */}
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
            style={{ background: getAvatarColor(avatarName) }}
          >
            {isNew ? 'EV' : getInitials(avatarName)}
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              {isNew ? 'EV-DRAFT' : order.id}
            </p>
            <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">
              {isNew ? 'Order Baru' : (order.namaEvent || order.namaKlien)}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge cls={tipeCls}>{order.jenis}</Badge>
              <Badge cls={STATUS_CLS[order.status] ?? 'bg-gray-100 text-gray-600'}>● {order.status}</Badge>
              <span className="text-[10px] text-gray-400">{order.namaKlien}</span>
              {order.pic && (
                <span className="text-[10px] text-gray-400">PIC: {order.pic}</span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Action buttons */}
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          {!isNew && (
            <button
              onClick={() => { setEditingTahapan(p => !p); setNewTahapanVal(tahapanState) }}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#1E1C43] text-[#1E1C43] text-xs font-semibold hover:bg-[#1E1C43] hover:text-white transition-colors"
            >
              <Edit2 size={12} /> Update Tahapan
            </button>
          )}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={12} /> Kembali
          </button>
        </div>
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
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={newTahapanTanggal}
                    onChange={e => setNewTahapanTanggal(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E1C43]"
                  />
                </div>
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
              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={() => { setEditingTahapan(false); setNewTahapanCatatan(''); setNewTahapanTanggal('') }}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
                >
                  <X size={12} /> Batal
                </button>
                <button
                  onClick={() => {
                    if (newTahapanVal && newTahapanVal !== tahapanState) onTahapanChange(newTahapanVal)
                    setEditingTahapan(false)
                    setNewTahapanCatatan('')
                    setNewTahapanTanggal('')
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
