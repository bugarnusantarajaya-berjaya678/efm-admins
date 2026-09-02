import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Save, CheckCircle, Edit2, Activity, Info } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { getAllAssessments, getNextAssessmentId, addAssessment, updateAssessment } from '../../data/ppAssessmentsStore'

// ─── Field Definitions ──────────────────────────────────────────────────────

const TANITA_FIELDS = [
  { key: 'tinggiBadan', label: 'Tinggi Badan', unit: 'cm' },
  { key: 'totalBodyWeight', label: 'Total Body Weight', unit: 'kg' },
  { key: 'totalBodyFat', label: 'Total Body Fat', unit: '%' },
  { key: 'water', label: 'Water', unit: '%' },
  { key: 'muscleMas', label: 'Muscle Mas', unit: 'kg' },
  { key: 'physiqueRating', label: 'Physique Rating', unit: '' },
  { key: 'basalMetabolicRate', label: 'Basal Metabolic Rate', unit: 'kcal' },
  { key: 'metabolicAge', label: 'Metabolic Age', unit: 'tahun' },
  { key: 'boneMass', label: 'Bone Mass', unit: 'kg' },
  { key: 'visceralFat', label: 'Visceral Fat', unit: '' },
  { key: 'bodyMassIndex', label: 'Body Mass Index', unit: 'kg/m²' },
]

const GIRTHS_FIELDS = [
  { key: 'waist', label: 'Waist (Pinggang)', unit: 'cm' },
  { key: 'hips', label: 'Hips (Panggul)', unit: 'cm' },
  { key: 'rightThight', label: 'Right-Thight (Paha Kanan)', unit: 'cm' },
  { key: 'leftThight', label: 'Left-Thight (Paha Kiri)', unit: 'cm' },
  { key: 'rightArm', label: 'Right-Arm (Lengan Atas Kanan)', unit: 'cm' },
  { key: 'leftArm', label: 'Left-Arm (Lengan Atas Kiri)', unit: 'cm' },
  { key: 'rightForearm', label: 'Right-Forearm (Lengan Bawah Kanan)', unit: 'cm' },
  { key: 'leftForearm', label: 'Left-Forearm (Lengan Bawah Kiri)', unit: 'cm' },
  { key: 'dada', label: 'Dada (Chest)', unit: 'cm' },
  { key: 'shoulder', label: 'Shoulder (Bahu)', unit: 'cm' },
  { key: 'neck', label: 'Neck (Leher)', unit: 'cm' },
]

const PARQ_ITEMS = [
  { key: 'masalahJantung', label: 'Apakah anda memiliki masalah jantung?' },
  { key: 'rekomendasiDokter', label: 'Apakah dokter pernah merekomendasikan berolahraga?' },
  { key: 'nyeriDada', label: 'Apakah anda pernah merasakan nyeri di dada saat melakukan aktivitas fisik?' },
  { key: 'lemasAtauPusing', label: 'Apakah anda pernah merasakan lemas atau pusing secara tiba-tiba?' },
  { key: 'sakitLutut', label: 'Apakah anda pernah mengalami sakit di lutut?' },
  { key: 'sakitLowerBack', label: 'Apakah anda pernah mengalami sakit dibagian Lower Back?' },
  { key: 'sakitBahu', label: 'Apakah anda pernah merasakan sakit di persendian bahu?' },
  { key: 'sakitPergelangan', label: 'Apakah anda pernah merasakan sakit dibagian pergelangan kaki atau tangan?' },
  { key: 'tekananDarahTinggi', label: 'Apakah anda memiliki tekanan darah tinggi?' },
  { key: 'tekananDarahRendah', label: 'Apakah anda memiliki tekanan darah rendah?' },
  { key: 'terapiPengobatan', label: 'Apakah anda sedang menjalani terapi atau pengobatan tertentu?' },
  { key: 'obatSuplemen', label: 'Apa anda sedang mengkonsumsi obat atau vitamin atau suplemen?' },
  { key: 'kehamilan', label: 'Apakah anda sedang dalam masa kehamilan?' },
  { key: 'masalahKesehatanLain', label: 'Apakah anda memiliki masalah kesehatan lain?' },
  { key: 'berolahraga', label: 'Apakah Anda berolahraga? Jika iya, olahraga apa dan berapa kali seminggu?' },
]

const ALIGNMENT_PARTS = [
  { key: 'head', label: 'Head (Kepala Kanan-Kiri)' },
  { key: 'shoulder', label: 'Shoulder (Bahu Kanan-Kiri)' },
  { key: 'spine', label: 'Spine (Tulang Punggung)' },
  { key: 'hips', label: 'Hips (Panggul Kanan-Kiri)' },
  { key: 'angkle', label: 'Angkle (Pergelangan Kaki)' },
  { key: 'lowerBack', label: 'Lower Back (Punggung Bawah)' },
  { key: 'neck', label: 'Neck (Leher)' },
  { key: 'upperBack', label: 'Upper Back (Punggung)' },
  { key: 'trunk', label: 'Trunk (Batang Tubuh)' },
  { key: 'abdomen', label: 'Abdomen (Perut)' },
]

const VITAL_FIELDS = [
  { key: 'pulseRate', label: 'Pulse Rate / Heart Rate', unit: 'bpm' },
  { key: 'bodyTemperature', label: 'Body Temperature', unit: '°C' },
  { key: 'respirationRate', label: 'Respiration Rate (rate of breathing)', unit: 'menit' },
  { key: 'bloodPressure', label: 'Blood Pressure', unit: 'mmHg' },
]

const FMS_ITEMS = [
  { key: 'overheadSquat', label: 'Overhead Squat', unit: 'Point' },
  { key: 'inLineLunge', label: 'In-Line Lunge', unit: 'Point' },
  { key: 'straightLegRaises', label: 'Straight Leg Raises', unit: 'Point' },
  { key: 'rotaryStability', label: 'Rotary Stability', unit: 'Point' },
  { key: 'trunkStabilityPushUp', label: 'Trunk Stability Push Up', unit: 'Point' },
  { key: 'shoulderMobility', label: 'Shoulder Mobility', unit: 'Point' },
  { key: 'toeTouch', label: 'Toe Touch', unit: 'Point' },
]

const CARDIO_ITEMS = [
  { key: 'ymca', label: 'YMCA 3-Minute Step Test', unit: '' },
  { key: 'chester', label: 'Chester Treadmill Test', unit: '' },
  { key: 'balke', label: 'Balke Treadmill Test', unit: '' },
  { key: 'bruce', label: 'Bruce Protocol Stress Test', unit: '' },
  { key: 'astrand', label: 'Astrand Treadmill Test', unit: '' },
]

const STRENGTH_ITEMS = [
  { key: 'benchPress', label: 'Bench Press', unit: 'Kg' },
  { key: 'legPress', label: 'Leg Press', unit: 'Kg' },
  { key: 'squat', label: 'Squat', unit: 'Kg' },
]

const ENDURANCE_ITEMS = [
  { key: 'pushUp', label: 'Push Up', unit: 'kali' },
  { key: 'sitUp', label: 'Partial Curl Up / Sit-Up', unit: 'kali' },
  { key: 'proneDSLR', label: 'Prone Double Straight Leg Raise', unit: 'detik' },
  { key: 'backUp', label: 'Back Up', unit: 'kali' },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-[#1E1C43]' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function SectionToggleCard({ title, description, icon, checked, onChange }) {
  return (
    <div className={`bg-white rounded-xl border-2 p-4 transition-all ${
      checked ? 'border-[#1E1C43]' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className={`text-sm font-bold ${checked ? 'text-[#1E1C43]' : 'text-gray-400'}`}>{title}</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{description}</p>
        </div>
        <ToggleSwitch checked={checked} onChange={onChange} />
      </div>
    </div>
  )
}

function MeasTable({ title, fields, data, onChange, readOnly, isRenewal }) {
  return (
    <div>
      <p className="text-sm font-bold text-[#1E1C43] mb-2">{title}</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full" style={{ minWidth: '700px' }}>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide w-48">Item Tes</th>
              <th
                className={`text-center px-3 py-2 text-xs font-semibold uppercase tracking-wide ${isRenewal ? 'bg-purple-50 text-purple-600' : 'text-gray-400'}`}
                colSpan={2}
              >
                Tes Awal{isRenewal && <span className="ml-1 text-[10px] font-medium normal-case text-purple-400">(diadopsi)</span>}
              </th>
              <th className="text-center px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide" colSpan={2}>Tes Akhir</th>
            </tr>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-3 py-1"></th>
              <th className={`text-center px-3 py-1 text-xs font-medium ${isRenewal ? 'bg-purple-50 text-purple-400' : 'text-gray-400'}`}>Hasil</th>
              <th className={`text-center px-3 py-1 text-xs font-medium ${isRenewal ? 'bg-purple-50 text-purple-400' : 'text-gray-400'}`}>Keterangan</th>
              <th className="text-center px-3 py-1 text-xs text-gray-400 font-medium">Hasil</th>
              <th className="text-center px-3 py-1 text-xs text-gray-400 font-medium">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f, idx) => (
              <tr key={f.key} className={`border-b border-gray-100 ${idx % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                <td className="px-3 py-2 text-xs font-medium text-gray-700 whitespace-nowrap">
                  {f.label}{f.unit ? <span className="text-gray-400 ml-1">({f.unit})</span> : null}
                </td>
                {['awal', 'akhir'].map(phase => {
                  const adopted = isRenewal && phase === 'awal' && !!data[`${f.key}_${phase}`]
                  return (
                    <>
                      <td key={`${phase}-hasil`} className={`px-2 py-1.5${adopted ? ' bg-purple-50/60' : ''}`}>
                        <input
                          type="text"
                          value={data[`${f.key}_${phase}`] || ''}
                          onChange={e => onChange(prev => ({ ...prev, [`${f.key}_${phase}`]: e.target.value }))}
                          disabled={readOnly}
                          placeholder="—"
                          className={`w-full text-xs text-center border rounded px-2 py-1 focus:outline-none focus:border-[#1E1C43] disabled:bg-transparent disabled:border-transparent ${adopted ? 'border-purple-200 text-purple-700 font-semibold' : 'border-gray-200'}`}
                        />
                      </td>
                      <td key={`${phase}-ket`} className={`px-2 py-1.5${adopted ? ' bg-purple-50/60' : ''}`}>
                        <input
                          type="text"
                          value={data[`${f.key}_${phase}Ket`] || ''}
                          onChange={e => onChange(prev => ({ ...prev, [`${f.key}_${phase}Ket`]: e.target.value }))}
                          disabled={readOnly}
                          placeholder="—"
                          className={`w-full text-xs border rounded px-2 py-1 focus:outline-none focus:border-[#1E1C43] disabled:bg-transparent disabled:border-transparent ${adopted ? 'border-purple-200' : 'border-gray-200'}`}
                        />
                      </td>
                    </>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ParqTable({ items, data, onChange, readOnly, isRenewal }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table className="w-full" style={{ minWidth: '800px' }}>
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Pertanyaan</th>
            <th
              className={`text-center px-3 py-2 text-xs font-semibold uppercase tracking-wide ${isRenewal ? 'bg-purple-50 text-purple-600' : 'text-gray-400'}`}
              colSpan={3}
            >
              Tes Awal{isRenewal && <span className="ml-1 text-[10px] font-medium normal-case text-purple-400">(diadopsi)</span>}
            </th>
            <th className="text-center px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide" colSpan={3}>Tes Akhir</th>
          </tr>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-3 py-1"></th>
            <th className={`text-center px-2 py-1 text-xs font-medium ${isRenewal ? 'bg-purple-50 text-purple-400' : 'text-gray-400'}`}>Ya</th>
            <th className={`text-center px-2 py-1 text-xs font-medium ${isRenewal ? 'bg-purple-50 text-purple-400' : 'text-gray-400'}`}>Tidak</th>
            <th className={`text-center px-2 py-1 text-xs font-medium ${isRenewal ? 'bg-purple-50 text-purple-400' : 'text-gray-400'}`}>Keterangan</th>
            <th className="text-center px-2 py-1 text-xs text-gray-400 font-medium">Ya</th>
            <th className="text-center px-2 py-1 text-xs text-gray-400 font-medium">Tidak</th>
            <th className="text-center px-2 py-1 text-xs text-gray-400 font-medium">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.key} className={`border-b border-gray-100 ${idx % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
              <td className="px-3 py-2 text-xs text-gray-700">{item.label}</td>
              {['awal', 'akhir'].map(phase => (
                <>
                  <td key={`${phase}-ya`} className="px-2 py-2 text-center">
                    <input
                      type="radio"
                      name={`${item.key}_${phase}`}
                      checked={!!data[`${item.key}_${phase}Ya`]}
                      onChange={() => !readOnly && onChange(prev => ({
                        ...prev,
                        [`${item.key}_${phase}Ya`]: true,
                        [`${item.key}_${phase}Tidak`]: false,
                      }))}
                      disabled={readOnly}
                      className="accent-[#E05945]"
                    />
                  </td>
                  <td key={`${phase}-tidak`} className="px-2 py-2 text-center">
                    <input
                      type="radio"
                      name={`${item.key}_${phase}`}
                      checked={!!data[`${item.key}_${phase}Tidak`]}
                      onChange={() => !readOnly && onChange(prev => ({
                        ...prev,
                        [`${item.key}_${phase}Ya`]: false,
                        [`${item.key}_${phase}Tidak`]: true,
                      }))}
                      disabled={readOnly}
                      className="accent-[#1E1C43]"
                    />
                  </td>
                  <td key={`${phase}-ket`} className="px-2 py-1.5">
                    <input
                      type="text"
                      value={data[`${item.key}_${phase}Ket`] || ''}
                      onChange={e => onChange(prev => ({ ...prev, [`${item.key}_${phase}Ket`]: e.target.value }))}
                      disabled={readOnly}
                      placeholder="—"
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#1E1C43] disabled:bg-transparent disabled:border-transparent"
                    />
                  </td>
                </>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CatatanPair({ labelAwal, labelAkhir, awal, akhir, onChangeAwal, onChangeAkhir, readOnly }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{labelAwal || 'Catatan Tes Awal'}</p>
        <textarea
          rows={2}
          value={awal}
          onChange={e => onChangeAwal(e.target.value)}
          disabled={readOnly}
          placeholder="Catatan tes awal..."
          className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1E1C43] resize-none disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{labelAkhir || 'Catatan Tes Akhir'}</p>
        <textarea
          rows={2}
          value={akhir}
          onChange={e => onChangeAkhir(e.target.value)}
          disabled={readOnly}
          placeholder="Catatan tes akhir..."
          className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1E1C43] resize-none disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>
    </div>
  )
}

// Copies _akhir fields from a section data object into corresponding _awal fields
function adoptAkhirAsAwal(sectionData) {
  const result = {}
  for (const [key, value] of Object.entries(sectionData || {})) {
    if (key.includes('_akhir')) {
      result[key.replace('_akhir', '_awal')] = value
    }
  }
  return result
}

function SignaturePad({ onSign, onClear, readOnly, existingSignature }) {
  const canvasRef = useRef(null)
  const isDrawingRef = useRef(false)
  const lastPosRef = useRef(null)

  useEffect(() => {
    if (existingSignature && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      img.src = existingSignature
    }
  }, [existingSignature])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const src = e.touches ? e.touches[0] : e
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    }
  }

  const startDraw = (e) => {
    if (readOnly) return
    e.preventDefault()
    isDrawingRef.current = true
    lastPosRef.current = getPos(e)
  }

  const draw = (e) => {
    if (!isDrawingRef.current || readOnly) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#1E1C43'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPosRef.current = pos
  }

  const endDraw = () => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    onSign?.(canvasRef.current.toDataURL())
  }

  const clear = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    onClear?.()
  }

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className={`w-full h-24 rounded-lg mb-1 touch-none ${
          readOnly
            ? 'border border-gray-200'
            : 'border-2 border-dashed border-gray-300 cursor-crosshair hover:border-[#1E1C43] transition-colors'
        }`}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      {!readOnly && (
        <button
          type="button"
          onClick={clear}
          className="text-[10px] text-gray-400 hover:text-red-500 transition-colors underline"
        >
          Hapus tanda tangan
        </button>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PPFitnessAssessmentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isNew = id === 'new'
  const leadId = location.state?.leadId || null
  const { setCrumbs } = useBreadcrumb()

  const prefill = location.state || {}
  const _allAssessments = getAllAssessments()
  const existing = !isNew ? (_allAssessments[id] || null) : null

  // prevSource: the previous completed assessment whose _akhir values are adopted as _awal for this one.
  // For existing renewals: stored via prevAssessmentId
  // For NEW assessments navigated from an order whose lead has a completed assessment: look it up by leadId
  const prevSource = (() => {
    if (!isNew && existing?.prevAssessmentId) {
      const src = _allAssessments[existing.prevAssessmentId]
      return src ? { id: existing.prevAssessmentId, ...src } : null
    }
    if (isNew && leadId) {
      const entries = Object.entries(_allAssessments)
        .filter(([, a]) => a.leadId === leadId && a.statusAssessment === 'Post-Test Selesai')
      if (!entries.length) return null
      entries.sort((a, b) => (b[1].tanggalPostTest || '').localeCompare(a[1].tanggalPostTest || ''))
      const [key, data] = entries[0]
      return { id: key, ...data }
    }
    return null
  })()

  // Personal Detail
  const [noIdProgram, setNoIdProgram] = useState(existing?.noIdProgram || '')
  const [cabangWilayah, setCabangWilayah] = useState(existing?.cabangWilayah || '')
  const [namaFC, setNamaFC] = useState(existing?.namaFC || '')
  const [namaPelatih, setNamaPelatih] = useState(existing?.namaPelatih || '')
  const [namaKlien, setNamaKlien] = useState(existing?.namaKlien || prefill.namaKlien || '')
  const [usia, setUsia] = useState(existing?.usia || '')
  const [jenisKelamin, setJenisKelamin] = useState(existing?.jenisKelamin || '')
  const [tipeBadan, setTipeBadan] = useState(existing?.tipeBadan || '')
  const [detailGoals, setDetailGoals] = useState(existing?.detailGoals || '')
  const [programLatihan, setProgramLatihan] = useState(existing?.programLatihan || '')
  const [tanggalPreTest, setTanggalPreTest] = useState(existing?.tanggalPreTest || '')
  const [tanggalPostTest, setTanggalPostTest] = useState(existing?.tanggalPostTest || '')

  // Section Toggles
  const [toggles, setToggles] = useState(
    existing?.toggles || { bodyMeasurement: false, healthScreening: false, fitnessTest: false }
  )

  // For new renewal assessments, adopt _akhir from prevSource as _awal baseline
  const adoptedTanita = isNew && prevSource ? adoptAkhirAsAwal(prevSource.tanita) : {}
  const adoptedGirths = isNew && prevSource ? adoptAkhirAsAwal(prevSource.girths) : {}
  const adoptedParq = isNew && prevSource ? adoptAkhirAsAwal(prevSource.parq) : {}
  const adoptedAlignment = isNew && prevSource ? adoptAkhirAsAwal(prevSource.alignment) : {}
  const adoptedVitalSigns = isNew && prevSource ? adoptAkhirAsAwal(prevSource.vitalSigns) : {}
  const adoptedFms = isNew && prevSource ? adoptAkhirAsAwal(prevSource.fms) : {}

  // Body Measurement state
  const [tanita, setTanita] = useState(existing?.tanita || adoptedTanita)
  const [girths, setGirths] = useState(existing?.girths || adoptedGirths)
  const [tanitaCatatanAwal, setTanitaCatatanAwal] = useState(existing?.tanita_catatan_awal || '')
  const [tanitaCatatanAkhir, setTanitaCatatanAkhir] = useState(existing?.tanita_catatan_akhir || '')
  const [girthsCatatanAwal, setGirthsCatatanAwal] = useState(existing?.girths_catatan_awal || '')
  const [girthsCatatanAkhir, setGirthsCatatanAkhir] = useState(existing?.girths_catatan_akhir || '')

  // Health Screening state
  const [parq, setParq] = useState(existing?.parq || adoptedParq)
  const [alignment, setAlignment] = useState(existing?.alignment || adoptedAlignment)
  const [vitalSigns, setVitalSigns] = useState(existing?.vitalSigns || adoptedVitalSigns)
  const [parqCatatanAwal, setParqCatatanAwal] = useState(existing?.parq_catatan_awal || '')
  const [parqCatatanAkhir, setParqCatatanAkhir] = useState(existing?.parq_catatan_akhir || '')
  const [alignCatatanAwal, setAlignCatatanAwal] = useState(existing?.align_catatan_awal || '')
  const [alignCatatanAkhir, setAlignCatatanAkhir] = useState(existing?.align_catatan_akhir || '')
  const [vitalCatatanAwal, setVitalCatatanAwal] = useState(existing?.vital_catatan_awal || '')
  const [vitalCatatanAkhir, setVitalCatatanAkhir] = useState(existing?.vital_catatan_akhir || '')

  // Fitness Test state
  const [fms, setFms] = useState(existing?.fms || adoptedFms)
  const [cardio, setCardio] = useState(existing?.cardio || {})
  const [strength, setStrength] = useState(existing?.strength || {})
  const [endurance, setEndurance] = useState(existing?.endurance || {})
  const [fmsCatatanAwal, setFmsCatatanAwal] = useState(existing?.fms_catatan_awal || '')
  const [fmsCatatanAkhir, setFmsCatatanAkhir] = useState(existing?.fms_catatan_akhir || '')
  const [cardioCatatanAwal, setCardioCatatanAwal] = useState(existing?.cardio_catatan_awal || '')
  const [cardioCatatanAkhir, setCardioCatatanAkhir] = useState(existing?.cardio_catatan_akhir || '')
  const [strengthCatatanAwal, setStrengthCatatanAwal] = useState(existing?.strength_catatan_awal || '')
  const [strengthCatatanAkhir, setStrengthCatatanAkhir] = useState(existing?.strength_catatan_akhir || '')
  const [enduranceCatatanAwal, setEnduranceCatatanAwal] = useState(existing?.endurance_catatan_awal || '')
  const [enduranceCatatanAkhir, setEnduranceCatatanAkhir] = useState(existing?.endurance_catatan_akhir || '')

  // Ringkasan Klien state
  const [kondisiFisik, setKondisiFisik] = useState(existing?.ringkasan?.kondisiFisik || '')
  const [riwayatCedera, setRiwayatCedera] = useState(existing?.ringkasan?.riwayatCedera || '')
  const [obatanRutin, setObatanRutin] = useState(existing?.ringkasan?.obatanRutin || '')
  const [catatanScreening, setCatatanScreening] = useState(existing?.ringkasan?.catatanScreening || '')

  const [signatures, setSignatures] = useState({ klien: null, pelatih: null, fc: null })
  const [saved, setSaved] = useState(false)
  const [isEditing, setIsEditing] = useState(isNew)

  const statusColors = {
    'Pre-Test Selesai': 'bg-blue-50 text-blue-700 border-blue-200',
    'Post-Test Selesai': 'bg-green-50 text-green-700 border-green-200',
    'Draft': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  }
  const statusLabel = existing?.statusAssessment || 'Draft'

  const handleBack = () => {
    if (leadId) {
      navigate(`/pp/leads/${leadId}`, { state: { defaultTab: 'kesehatan' } })
    } else {
      navigate('/pp/screening')
    }
  }

  const handleSave = () => {
    const newStatus = tanggalPostTest
      ? 'Post-Test Selesai'
      : tanggalPreTest
      ? 'Pre-Test Selesai'
      : 'Draft'

    const payload = {
      leadId: leadId || existing?.leadId || null,
      prevAssessmentId: isNew ? (prevSource?.id || null) : (existing?.prevAssessmentId || null),
      noIdProgram, cabangWilayah, namaFC, namaPelatih, namaKlien, usia, jenisKelamin, tipeBadan,
      detailGoals, programLatihan, tanggalPreTest, tanggalPostTest, toggles,
      statusAssessment: newStatus,
      ringkasan: { kondisiFisik, riwayatCedera, obatanRutin, catatanScreening },
      tanita, tanita_catatan_awal: tanitaCatatanAwal, tanita_catatan_akhir: tanitaCatatanAkhir,
      girths, girths_catatan_awal: girthsCatatanAwal, girths_catatan_akhir: girthsCatatanAkhir,
      parq, parq_catatan_awal: parqCatatanAwal, parq_catatan_akhir: parqCatatanAkhir,
      alignment, align_catatan_awal: alignCatatanAwal, align_catatan_akhir: alignCatatanAkhir,
      vitalSigns, vital_catatan_awal: vitalCatatanAwal, vital_catatan_akhir: vitalCatatanAkhir,
      fms, fms_catatan_awal: fmsCatatanAwal, fms_catatan_akhir: fmsCatatanAkhir,
      cardio, cardio_catatan_awal: cardioCatatanAwal, cardio_catatan_akhir: cardioCatatanAkhir,
      strength, strength_catatan_awal: strengthCatatanAwal, strength_catatan_akhir: strengthCatatanAkhir,
      endurance, endurance_catatan_awal: enduranceCatatanAwal, endurance_catatan_akhir: enduranceCatatanAkhir,
    }

    if (isNew) {
      const newId = getNextAssessmentId()
      addAssessment(newId, payload)
      if (leadId) {
        navigate(`/pp/leads/${leadId}`, { state: { defaultTab: 'kesehatan' } })
      } else {
        navigate('/pp/screening')
      }
    } else {
      updateAssessment(id, payload)
      setSaved(true)
      setIsEditing(false)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const isRenewal = !!prevSource

  const inputCls = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1E1C43] bg-white"
  const readOnlyCls = "w-full text-sm border border-gray-100 rounded-lg px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
  const labelCls = "text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block"

  useEffect(() => {
    setCrumbs(['Private Program', 'Kesehatan', isNew ? 'Baru' : id])
    return () => setCrumbs(null)
  }, [isNew, id])

  return (
    <div className="bg-[#F5F5F7] min-h-screen pb-24">

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-10 h-10 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
            <Activity size={16} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Fitness Assessment PP</p>
            <h1 className="text-base font-bold text-[#1E1C43] leading-snug truncate">
              {isNew ? 'Assessment Baru' : id}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              {isNew ? (
                <span className="text-xs text-gray-400">Isi data assessment klien baru</span>
              ) : (
                <>
                  <span className="text-xs text-gray-500">{existing?.namaKlien || '—'}</span>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium border ${statusColors[statusLabel] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {statusLabel}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => handleBack()}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors shrink-0"
          >
            <ArrowLeft size={13} />
            {leadId ? 'Kembali ke Lead' : 'Kembali ke Screening'}
          </button>
        </div>
      </div>

      {/* Renewal Banner */}
      {prevSource && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
          <div className="mt-0.5 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0 text-purple-600 font-bold text-sm">↻</div>
          <div>
            <p className="text-sm font-semibold text-purple-800">
              Renewal dari #{prevSource.id}
            </p>
            <p className="text-xs text-purple-600 mt-0.5">
              {isNew
                ? <>Semua nilai <span className="font-semibold">Tes Awal</span> diadopsi otomatis dari Post-Test assessment <span className="font-semibold">#{prevSource.id}</span> · {prevSource.namaKlien}. Nilai ini menjadi baseline awal untuk sesi pengukuran baru ini.</>
                : <>Assessment ini merupakan renewal dari <span className="font-semibold">#{prevSource.id}</span> · {prevSource.namaKlien}.</>
              }
            </p>
          </div>
        </div>
      )}

      {/* Info: Frekuensi Pengukuran */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
          <Info size={11} className="text-blue-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-blue-700">Pengukuran Melekat pada Leads, Bukan Order</p>
          <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
            Frekuensi pengukuran di lapangan bervariasi — bisa 1x/bulan atau hingga 3x/bulan tergantung kebutuhan klien dan program. Karena itu assessment tidak diikat ke satu order spesifik, melainkan melekat pada <span className="font-semibold">leads klien</span> sebagai rekam medis yang berkelanjutan sepanjang periode program.
          </p>
        </div>
      </div>

      {/* Content wrapper — non-interactive when not editing */}
      <div className={`space-y-4 ${!isEditing ? 'pointer-events-none select-none opacity-80' : ''}`}>

      {/* ── REFERENSI STAGE 1 ── */}
      {leadId && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[10px] font-bold text-blue-600">i</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-blue-700">Informasi Kesehatan Awal sudah direkam di Lead</p>
            <p className="text-xs text-blue-600 mt-0.5">Gunakan sebagai referensi saat mengisi PAR-Q, Goals, dan Riwayat Cedera di bawah.</p>
          </div>
          <button
            onClick={() => navigate(`/pp/leads/${leadId}`, { state: { defaultTab: 'kesehatan' } })}
            className="shrink-0 text-[10px] font-semibold text-blue-700 hover:underline whitespace-nowrap">
            Lihat →
          </button>
        </div>
      )}

      {/* ── PERSONAL DETAIL (always shown) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">
          Data Klien & Program
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelCls}>Referensi Program</label>
            <input className={inputCls} value={noIdProgram} onChange={e => setNoIdProgram(e.target.value)} placeholder="Mis. LP-0001 / PP-26-0001" />
          </div>
          <div>
            <label className={labelCls}>Cabang / Wilayah</label>
            <input className={inputCls} value={cabangWilayah} onChange={e => setCabangWilayah(e.target.value)} placeholder="Jakarta Selatan" />
          </div>
          <div>
            <label className={labelCls}>Nama FC</label>
            <input className={inputCls} value={namaFC} onChange={e => setNamaFC(e.target.value)} placeholder="Fitness Consultant" />
          </div>
          <div>
            <label className={labelCls}>Nama Pelatih</label>
            <input className={inputCls} value={namaPelatih} onChange={e => setNamaPelatih(e.target.value)} placeholder="Personal Trainer" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelCls}>Nama Klien</label>
            <input className={inputCls} value={namaKlien} onChange={e => setNamaKlien(e.target.value)} placeholder="Nama lengkap" />
          </div>
          <div>
            <label className={labelCls}>Usia</label>
            <input className={inputCls} value={usia} onChange={e => setUsia(e.target.value)} placeholder="tahun" />
          </div>
          <div>
            <label className={labelCls}>Jenis Kelamin</label>
            <select className={inputCls} value={jenisKelamin} onChange={e => setJenisKelamin(e.target.value)}>
              <option value="">Pilih...</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Tipe Badan</label>
            <select className={inputCls} value={tipeBadan} onChange={e => setTipeBadan(e.target.value)}>
              <option value="">Pilih...</option>
              <option value="Ektomorf">Ektomorf</option>
              <option value="Mesomorf">Mesomorf</option>
              <option value="Endomorf">Endomorf</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelCls}>Program Latihan</label>
            <input className={inputCls} value={programLatihan} onChange={e => setProgramLatihan(e.target.value)} placeholder="Misal: 12 Sesi - Pro (Fatloss)" />
          </div>
          <div>
            <label className={labelCls}>Detail Goals Klien</label>
            <input className={inputCls} value={detailGoals} onChange={e => setDetailGoals(e.target.value)} placeholder="Deskripsi tujuan klien" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Tanggal Pre-Test</label>
            <input type="date" className={inputCls} value={tanggalPreTest} onChange={e => setTanggalPreTest(e.target.value)} />
          </div>
          {!isNew && (
            <div>
              <label className={labelCls}>Tanggal Post-Test</label>
              <input type="date" className={inputCls} value={tanggalPostTest} onChange={e => setTanggalPostTest(e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {/* ── RINGKASAN KLIEN ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">
            Ringkasan Klien
          </h2>
        </div>

        {/* Progress Order Sebelumnya — hanya untuk renewal */}
        {isRenewal && prevSource && (() => {
          const src = prevSource
          const t = src.tanita || {}
          const g = src.girths || {}
          const metrics = [
            { label: 'Berat Badan',       unit: 'kg',    awal: t.totalBodyWeight_awal, akhir: t.totalBodyWeight_akhir, lowerIsBetter: true  },
            { label: 'Body Fat',           unit: '%',     awal: t.totalBodyFat_awal,    akhir: t.totalBodyFat_akhir,    lowerIsBetter: true  },
            { label: 'Visceral Fat',       unit: '',      awal: t.visceralFat_awal,     akhir: t.visceralFat_akhir,     lowerIsBetter: true  },
            { label: 'BMI',                unit: 'kg/m²', awal: t.bodyMassIndex_awal,   akhir: t.bodyMassIndex_akhir,   lowerIsBetter: true  },
            { label: 'Massa Otot',         unit: 'kg',    awal: t.muscleMas_awal,       akhir: t.muscleMas_akhir,       lowerIsBetter: false },
            { label: 'Lingkar Pinggang',   unit: 'cm',    awal: g.waist_awal,           akhir: g.waist_akhir,           lowerIsBetter: true  },
          ]
          return (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-sm font-semibold text-purple-700">Progress Order Sebelumnya</p>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-600 rounded-full">
                  #{prevSource.id} · {src.noIdProgram}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
                {metrics.map(m => {
                  const awalNum = parseFloat(m.awal)
                  const akhirNum = parseFloat(m.akhir)
                  const hasDelta = !isNaN(awalNum) && !isNaN(akhirNum) && m.akhir !== ''
                  const delta = hasDelta ? (akhirNum - awalNum) : null
                  const improved = hasDelta && (m.lowerIsBetter ? delta < 0 : delta > 0)
                  return (
                    <div key={m.label} className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                      <p className="text-[10px] uppercase tracking-wide text-purple-400 font-semibold leading-tight">{m.label}</p>
                      <div className="mt-1.5 flex items-baseline gap-1">
                        <span className="text-sm font-bold text-purple-900">{m.akhir || '—'}</span>
                        {m.unit && m.akhir && <span className="text-[10px] text-purple-400">{m.unit}</span>}
                      </div>
                      {hasDelta && delta !== 0 && (
                        <p className={`text-[10px] mt-0.5 font-semibold ${improved ? 'text-green-600' : 'text-red-500'}`}>
                          {delta > 0 ? '+' : ''}{parseFloat(delta.toFixed(1))}{m.unit ? ' ' + m.unit : ''}
                        </p>
                      )}
                      {hasDelta && delta === 0 && (
                        <p className="text-[10px] mt-0.5 text-gray-400">Tidak berubah</p>
                      )}
                      {!m.akhir && <p className="text-[10px] mt-0.5 text-gray-300 italic">Post-test —</p>}
                    </div>
                  )
                })}
              </div>
              {src.ringkasan?.catatanScreening && (
                <div className="bg-purple-50/60 rounded-lg px-4 py-3 border border-purple-100">
                  <p className="text-[10px] uppercase tracking-wide text-purple-400 font-semibold mb-1">Catatan Trainer (Program Sebelumnya)</p>
                  <p className="text-xs text-purple-800 leading-relaxed">{src.ringkasan.catatanScreening}</p>
                </div>
              )}
              <div className="mt-4 border-t border-gray-100" />
            </div>
          )
        })()}

        {/* Standard ringkasan fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelCls}>Kondisi Fisik Umum</label>
            <textarea
              rows={2}
              className={`${inputCls} resize-none`}
              value={kondisiFisik}
              onChange={e => setKondisiFisik(e.target.value)}
              placeholder="Deskripsi kondisi fisik klien..."
            />
          </div>
          <div>
            <label className={labelCls}>Riwayat Cedera</label>
            <textarea
              rows={2}
              className={`${inputCls} resize-none`}
              value={riwayatCedera}
              onChange={e => setRiwayatCedera(e.target.value)}
              placeholder="Riwayat cedera yang relevan..."
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Obatan / Suplemen Rutin</label>
            <input
              className={leadsLocked ? readOnlyCls : inputCls}
              readOnly={leadsLocked}
              value={obatanRutin}
              onChange={e => setObatanRutin(e.target.value)}
              placeholder="Obat atau suplemen yang dikonsumsi..."
            />
          </div>
          <div>
            <label className={labelCls}>Catatan Screening</label>
            <textarea
              rows={2}
              className={`${inputCls} resize-none`}
              value={catatanScreening}
              onChange={e => setCatatanScreening(e.target.value)}
              placeholder="Catatan trainer / fitness consultant..."
            />
          </div>
        </div>
      </div>

      {/* ── BODY MEASUREMENT ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">
            Body Measurement
          </h2>
          <ToggleSwitch checked={toggles.bodyMeasurement} onChange={v => setToggles(p => ({ ...p, bodyMeasurement: v }))} />
        </div>
        {toggles.bodyMeasurement && (
        <div className="mt-5">

          {/* TANITA */}
          <div className="mb-5">
            <MeasTable
              title="TANITA Body Composition"
              fields={TANITA_FIELDS}
              data={tanita}
              onChange={setTanita}
              readOnly={false}
              isRenewal={isRenewal}
            />
            <CatatanPair
              awal={tanitaCatatanAwal}
              akhir={tanitaCatatanAkhir}
              onChangeAwal={setTanitaCatatanAwal}
              onChangeAkhir={setTanitaCatatanAkhir}
            />
          </div>

          {/* GIRTHS */}
          <div>
            <MeasTable
              title="Girths Measurement"
              fields={GIRTHS_FIELDS}
              data={girths}
              onChange={setGirths}
              readOnly={false}
              isRenewal={isRenewal}
            />
            <CatatanPair
              awal={girthsCatatanAwal}
              akhir={girthsCatatanAkhir}
              onChangeAwal={setGirthsCatatanAwal}
              onChangeAkhir={setGirthsCatatanAkhir}
            />
          </div>
        </div>
        )}
      </div>

      {/* ── HEALTH SCREENING ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">
            Health Screening
          </h2>
          <ToggleSwitch checked={toggles.healthScreening} onChange={v => setToggles(p => ({ ...p, healthScreening: v }))} />
        </div>
        {toggles.healthScreening && (
        <div className="mt-5">

          {/* PAR-Q */}
          <div className="mb-5">
            <p className="text-sm font-bold text-[#1E1C43] mb-2">PAR-Q (Physical Activity Readiness Questionnaire)</p>
            <ParqTable items={PARQ_ITEMS} data={parq} onChange={setParq} readOnly={false} isRenewal={isRenewal} />
            <CatatanPair
              awal={parqCatatanAwal}
              akhir={parqCatatanAkhir}
              onChangeAwal={setParqCatatanAwal}
              onChangeAkhir={setParqCatatanAkhir}
            />
          </div>

          {/* Postural Alignment */}
          <div className="mb-5">
            <MeasTable
              title="Postural Alignment"
              fields={ALIGNMENT_PARTS}
              data={alignment}
              onChange={setAlignment}
              readOnly={false}
              isRenewal={isRenewal}
            />
            <CatatanPair
              awal={alignCatatanAwal}
              akhir={alignCatatanAkhir}
              onChangeAwal={setAlignCatatanAwal}
              onChangeAkhir={setAlignCatatanAkhir}
            />
          </div>

          {/* Vital Signs */}
          <div>
            <MeasTable
              title="Vital Signs"
              fields={VITAL_FIELDS}
              data={vitalSigns}
              onChange={setVitalSigns}
              readOnly={false}
              isRenewal={isRenewal}
            />
            <CatatanPair
              awal={vitalCatatanAwal}
              akhir={vitalCatatanAkhir}
              onChangeAwal={setVitalCatatanAwal}
              onChangeAkhir={setVitalCatatanAkhir}
            />
          </div>
        </div>
        )}
      </div>

      {/* ── FITNESS TEST ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">
            Fitness Test
          </h2>
          <ToggleSwitch checked={toggles.fitnessTest} onChange={v => setToggles(p => ({ ...p, fitnessTest: v }))} />
        </div>
        {toggles.fitnessTest && (
        <div className="mt-5">

          {/* FMS */}
          <div className="mb-5">
            <MeasTable
              title="FMS (Functional Movement Screen)"
              fields={FMS_ITEMS}
              data={fms}
              onChange={setFms}
              readOnly={false}
              isRenewal={isRenewal}
            />
            <CatatanPair
              awal={fmsCatatanAwal}
              akhir={fmsCatatanAkhir}
              onChangeAwal={setFmsCatatanAwal}
              onChangeAkhir={setFmsCatatanAkhir}
            />
          </div>

          {/* Cardio */}
          <div className="mb-5">
            <MeasTable
              title="Cardiorespiratory Fitness"
              fields={CARDIO_ITEMS}
              data={cardio}
              onChange={setCardio}
              readOnly={false}
              isRenewal={isRenewal}
            />
            <CatatanPair
              awal={cardioCatatanAwal}
              akhir={cardioCatatanAkhir}
              onChangeAwal={setCardioCatatanAwal}
              onChangeAkhir={setCardioCatatanAkhir}
            />
          </div>

          {/* Strength & Endurance side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <MeasTable
                title="Muscle Strength"
                fields={STRENGTH_ITEMS}
                data={strength}
                onChange={setStrength}
                readOnly={false}
                isRenewal={isRenewal}
              />
              <CatatanPair
                awal={strengthCatatanAwal}
                akhir={strengthCatatanAkhir}
                onChangeAwal={setStrengthCatatanAwal}
                onChangeAkhir={setStrengthCatatanAkhir}
              />
            </div>
            <div>
              <MeasTable
                title="Muscle Endurance"
                fields={ENDURANCE_ITEMS}
                data={endurance}
                onChange={setEndurance}
                readOnly={false}
                isRenewal={isRenewal}
              />
              <CatatanPair
                awal={enduranceCatatanAwal}
                akhir={enduranceCatatanAkhir}
                onChangeAwal={setEnduranceCatatanAwal}
                onChangeAkhir={setEnduranceCatatanAkhir}
              />
            </div>
          </div>
        </div>
        )}
      </div>

      {/* ── PERSETUJUAN ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-5">
          Persetujuan
        </h2>
        {!isEditing && (
          <p className="text-xs text-gray-400 mb-4 italic">Mode tampilan — klik Edit untuk menandatangani.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Klien', sublabel: namaKlien || '—', key: 'klien' },
            { label: 'Personal Trainer', sublabel: namaPelatih || '—', key: 'pelatih' },
            { label: 'Fitness Consultant', sublabel: namaFC || '—', key: 'fc' },
          ].map(sig => (
            <div key={sig.label} className="flex flex-col items-center">
              <SignaturePad
                readOnly={!isEditing}
                existingSignature={signatures[sig.key]}
                onSign={(dataUrl) => setSignatures(prev => ({ ...prev, [sig.key]: dataUrl }))}
                onClear={() => setSignatures(prev => ({ ...prev, [sig.key]: null }))}
              />
              <p className="text-xs font-semibold text-[#1E1C43] mt-1">{sig.label}</p>
              <p className="text-xs text-gray-400">{sig.sublabel}</p>
            </div>
          ))}
        </div>
      </div>

      </div>{/* end content wrapper */}

      {/* Footer */}
      <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white border-t border-gray-200 px-6 py-4 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Left: context info */}
          <div className="hidden sm:block min-w-0">
            <p className="text-sm text-gray-700 font-semibold truncate">
              {namaKlien || 'Assessment Baru'}
              {!isNew && <span className="text-gray-400 font-normal ml-1.5">· {id}</span>}
            </p>
            {!isNew && (
              <span className={`text-xs font-medium ${
                statusLabel === 'Post-Test Selesai' ? 'text-green-600' :
                statusLabel === 'Pre-Test Selesai' ? 'text-blue-600' :
                'text-yellow-600'
              }`}>{statusLabel}</span>
            )}
          </div>
          {/* Right: action buttons */}
          <div className="flex items-center gap-3 ml-auto">
            {!isNew && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Edit2 size={14} /> Edit
              </button>
            )}
            {!isNew && isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batalkan
              </button>
            )}
            {isEditing && (
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  saved ? 'bg-green-600 text-white' : 'bg-[#1E1C43] text-white hover:bg-[#2d2a5e]'
                }`}
              >
                {saved ? <CheckCircle size={15} /> : <Save size={15} />}
                {saved ? 'Tersimpan' : isNew ? 'Simpan Assessment' : 'Simpan Perubahan'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
