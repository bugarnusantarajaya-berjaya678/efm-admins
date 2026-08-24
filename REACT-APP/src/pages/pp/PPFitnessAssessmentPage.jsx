import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Save, CheckCircle, Edit2, Link2 } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { getAllAssessments, getNextAssessmentId, addAssessment, updateAssessment } from '../../data/ppAssessmentsStore'
import { ORDERS_INIT } from '../../data/ppOrdersData'
import { getLeadHealthByOrderId } from '../../data/ppLeadsStore'

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
    <div className="grid grid-cols-2 gap-4 mt-3">
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

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PPFitnessAssessmentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isNew = id === 'new'
  const leadId = location.state?.leadId || null
  const fromOrderId = location.state?.fromOrderId || null
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

  // Order picker (only for new assessments opened without fromOrderId)
  const [pickerOrderId, setPickerOrderId] = useState(fromOrderId || '')
  const [pickerLeadHealth, setPickerLeadHealth] = useState(null)

  function handleOrderPick(orderId) {
    setPickerOrderId(orderId)
    if (!orderId) { setPickerLeadHealth(null); return }
    const o = ORDERS_INIT.find(x => x.id === orderId)
    if (!o) return

    // ── Data Klien & Program ──
    setNoIdProgram(o.id)
    setNamaKlien(o.klien)
    setNamaFC(o.pic)
    setProgramLatihan(o.paket)

    // ── Data kesehatan dari leads store ──
    const health = getLeadHealthByOrderId(orderId)
    setPickerLeadHealth(health)
    if (health?.sudahDiisi) {
      setDetailGoals(health.tujuanProgram || '')
      setKondisiFisik(health.kondisiSaatIni || '')
      setRiwayatCedera(health.riwayatCedera || '')
      setObatanRutin(health.obatanRutin || '')
      setCatatanScreening(health.catatanCs || '')
    }
  }

  // Personal Detail
  const [noIdProgram, setNoIdProgram] = useState(existing?.noIdProgram || fromOrderId || prefill.orderId || '')
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
    existing?.toggles || { bodyMeasurement: true, healthScreening: true, fitnessTest: false }
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

  const [saved, setSaved] = useState(false)
  const [isEditing, setIsEditing] = useState(isNew)

  const statusColors = {
    'Pre-Test Selesai': 'bg-blue-50 text-blue-700 border-blue-200',
    'Post-Test Selesai': 'bg-green-50 text-green-700 border-green-200',
    'Draft': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  }
  const statusLabel = existing?.statusAssessment || 'Draft'

  const handleBack = () => {
    if (fromOrderId) {
      navigate(`/pp/orders/${fromOrderId}`, { state: { defaultTab: 'operasional' } })
    } else if (leadId) {
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
      orderId: noIdProgram || fromOrderId || existing?.orderId || null,
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
      if (fromOrderId) {
        navigate(`/pp/orders/${fromOrderId}`, { state: { defaultTab: 'operasional' } })
      } else if (leadId) {
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

  const inputCls = "w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1E1C43] bg-white"
  const labelCls = "text-xs text-gray-400 uppercase tracking-wide mb-1 block"

  useEffect(() => {
    setCrumbs(['Private Program', 'Kesehatan', isNew ? 'Baru' : id])
    return () => setCrumbs(null)
  }, [isNew, id])

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-4 md:p-6">

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleBack()}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
          >
            <ArrowLeft size={16} className="text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#1E1C43]">
                {isNew ? 'Fitness Assessment Baru' : `Fitness Assessment — ${id}`}
              </h1>
              {!isNew && (
                <span className={`px-2 py-1 text-xs rounded-full font-medium border ${statusColors[statusLabel] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  {statusLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {isNew ? 'Isi data assessment klien baru' : `Klien: ${existing?.namaKlien || '—'} · Program: ${existing?.programLatihan || '—'}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isNew && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#E05945] hover:bg-[#c94a38] text-white transition"
            >
              <Edit2 size={15} /> Edit
            </button>
          )}
          {!isNew && isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              Batalkan
            </button>
          )}
          {isEditing && (
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                saved ? 'bg-green-600 text-white' : 'bg-[#1E1C43] text-white hover:bg-[#2d2a5e]'
              }`}
            >
              {saved ? <CheckCircle size={15} /> : <Save size={15} />}
              {saved ? 'Tersimpan' : isNew ? 'Simpan' : 'Simpan Perubahan'}
            </button>
          )}
        </div>
      </div>

      {/* Renewal Banner */}
      {prevSource && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
          <div className="mt-0.5 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0 text-purple-600 font-bold text-sm">↻</div>
          <div>
            <p className="text-sm font-semibold text-purple-800">
              Renewal dari #{prevSource.id}
            </p>
            <p className="text-xs text-purple-600 mt-0.5">
              {isNew
                ? <>Semua nilai <span className="font-semibold">Tes Awal</span> diadopsi otomatis dari Post-Test assessment <span className="font-semibold">#{prevSource.id}</span> · {prevSource.namaKlien} · Order #{prevSource.orderId}. Nilai ini menjadi baseline awal untuk program baru ini.</>
                : <>Assessment ini merupakan renewal dari <span className="font-semibold">#{prevSource.id}</span> · {prevSource.namaKlien} · Order #{prevSource.orderId}.</>
              }
            </p>
          </div>
        </div>
      )}

      {/* Content wrapper — non-interactive when not editing */}
      <div className={!isEditing ? 'pointer-events-none select-none opacity-80' : ''}>

      {/* Section Toggle Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <SectionToggleCard
          title="Body Measurement"
          description="TANITA Body Composition & Girths Measurement"
          checked={toggles.bodyMeasurement}
          onChange={v => setToggles(p => ({ ...p, bodyMeasurement: v }))}
        />
        <SectionToggleCard
          title="Health Screening"
          description="Verifikasi formal PAR-Q, Postural Alignment & Vital Signs"
          checked={toggles.healthScreening}
          onChange={v => setToggles(p => ({ ...p, healthScreening: v }))}
        />
        <SectionToggleCard
          title="Fitness Test"
          description="FMS, Cardiorespiratory, Strength & Endurance"
          checked={toggles.fitnessTest}
          onChange={v => setToggles(p => ({ ...p, fitnessTest: v }))}
        />
      </div>

      {/* ── REFERENSI STAGE 1 ── */}
      {leadId && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
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
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
        <h2 className="text-base font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">
          Data Klien & Program
        </h2>

        {/* Order picker — hanya tampil saat form baru dibuka dari /pp/screening (bukan dari order detail) */}
        {isNew && !fromOrderId && (
          <div className="mb-5 p-4 rounded-xl border-2 border-dashed border-[#1E1C43]/20 bg-[#F5F5F7]">
            <div className="flex items-center gap-2 mb-2">
              <Link2 size={14} className="text-[#1E1C43]" />
              <p className="text-xs font-bold text-[#1E1C43] uppercase tracking-wide">Link ke Order Klien</p>
            </div>
            <p className="text-[11px] text-gray-500 mb-3">
              Pilih nomor order agar assessment ini terhubung ke klien yang tepat dan muncul di halaman detail order.
            </p>
            <select
              value={pickerOrderId}
              onChange={e => handleOrderPick(e.target.value)}
              className="w-full md:w-auto text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#1E1C43] text-gray-800"
            >
              <option value="">— Pilih Order Klien —</option>
              {ORDERS_INIT.map(o => (
                <option key={o.id} value={o.id}>
                  #{o.id} · {o.klien} · {o.paket}
                </option>
              ))}
            </select>
            {pickerOrderId && (
              <div className="mt-2 space-y-1">
                <p className="text-[11px] text-green-700 font-medium">
                  ✓ Terhubung ke order #{pickerOrderId} — Nama Klien, FC, Program Latihan sudah di-auto-fill.
                </p>
                {pickerLeadHealth?.sudahDiisi ? (
                  <p className="text-[11px] text-blue-700 font-medium">
                    ✓ Data kesehatan dari leads ditemukan — Detail Goals & Ringkasan Klien sudah di-auto-fill.
                  </p>
                ) : pickerLeadHealth ? (
                  <p className="text-[11px] text-yellow-700 font-medium">
                    ⚠ Informasi kesehatan di leads belum diisi — isi manual di bagian Ringkasan Klien.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelCls}>No. ID Program</label>
            <input className={inputCls} value={noIdProgram} onChange={e => setNoIdProgram(e.target.value)} placeholder="PP-26-0001" />
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
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">
            Ringkasan Klien
          </h2>
          {isNew && pickerLeadHealth?.sudahDiisi && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Link2 size={10} /> Data dari Leads
            </span>
          )}
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
              className={inputCls}
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
      {toggles.bodyMeasurement && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
          <h2 className="text-base font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-5">
            Body Measurement
          </h2>

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

      {/* ── HEALTH SCREENING ── */}
      {toggles.healthScreening && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
          <h2 className="text-base font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-5">
            Health Screening
          </h2>

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

      {/* ── FITNESS TEST ── */}
      {toggles.fitnessTest && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
          <h2 className="text-base font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-5">
            Fitness Test
          </h2>

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

      {/* ── PERSETUJUAN ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
        <h2 className="text-base font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-5">
          Persetujuan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Klien', sublabel: namaKlien || '—' },
            { label: 'Personal Trainer', sublabel: namaPelatih || '—' },
            { label: 'Fitness Consultant', sublabel: namaFC || '—' },
          ].map(sig => (
            <div key={sig.label} className="flex flex-col items-center">
              <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg mb-2 flex items-center justify-center">
                <p className="text-xs text-gray-300">Tanda Tangan</p>
              </div>
              <p className="text-xs font-semibold text-[#1E1C43]">{sig.label}</p>
              <p className="text-xs text-gray-400">{sig.sublabel}</p>
            </div>
          ))}
        </div>
      </div>

      </div>{/* end content wrapper */}

      {/* Footer Save */}
      <div className="flex justify-end gap-3 pb-8">
        <button
          onClick={() => handleBack()}
          className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          Kembali
        </button>
        {isEditing && (
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition ${
              saved ? 'bg-green-600 text-white' : 'bg-[#1E1C43] text-white hover:bg-[#2d2a5e]'
            }`}
          >
            {saved ? <CheckCircle size={15} /> : <Save size={15} />}
            {saved ? 'Tersimpan' : 'Simpan Assessment'}
          </button>
        )}
      </div>
    </div>
  )
}
