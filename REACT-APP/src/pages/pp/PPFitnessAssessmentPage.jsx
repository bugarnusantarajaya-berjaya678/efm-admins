import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Save, CheckCircle, Edit2 } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { PP_ASSESSMENTS } from '../../data/ppAssessmentsData'

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

// ─── Dummy data moved to src/data/ppAssessmentsData.js ───────────────────────
// PP_ASSESSMENTS is imported at the top of this file.

const _REMOVE_ME = {
  'SCR-26-0001': {
    noIdProgram: 'PP-26-0013',
    cabangWilayah: 'Jakarta Selatan',
    namaFC: 'Sarah Jenkins',
    namaPelatih: 'Ahmad Pratama',
    namaKlien: 'James Wilson',
    usia: '32',
    jenisKelamin: 'Laki-laki',
    tipeBadan: 'Ektomorf',
    detailGoals: 'Penurunan berat badan, target -10kg dalam 3 bulan',
    programLatihan: '12 Sesi - Pro (Fatloss)',
    tanggalPreTest: '2026-10-15',
    tanggalPostTest: '',
    toggles: { bodyMeasurement: true, healthScreening: true, fitnessTest: true },
    statusAssessment: 'Pre-Test Selesai',
    tanita: {
      tinggiBadan_awal: '170', tinggiBadan_awalKet: '',
      totalBodyWeight_awal: '78', totalBodyWeight_awalKet: '',
      totalBodyFat_awal: '24.5', totalBodyFat_awalKet: '',
      water_awal: '53', water_awalKet: '',
      muscleMas_awal: '56', muscleMas_awalKet: '',
      physiqueRating_awal: '4', physiqueRating_awalKet: '',
      basalMetabolicRate_awal: '1820', basalMetabolicRate_awalKet: '',
      metabolicAge_awal: '35', metabolicAge_awalKet: '',
      boneMass_awal: '3.2', boneMass_awalKet: '',
      visceralFat_awal: '9', visceralFat_awalKet: '',
      bodyMassIndex_awal: '27.0', bodyMassIndex_awalKet: '',
    },
    girths: {
      waist_awal: '88', waist_awalKet: '',
      hips_awal: '102', hips_awalKet: '',
      dada_awal: '98', dada_awalKet: '',
    },
    parq: {
      masalahJantung_awalYa: false, masalahJantung_awalTidak: true, masalahJantung_awalKet: '',
      sakitLutut_awalYa: true, sakitLutut_awalTidak: false, sakitLutut_awalKet: 'Pernah cedera lutut kiri 2022',
      tekananDarahTinggi_awalYa: false, tekananDarahTinggi_awalTidak: true, tekananDarahTinggi_awalKet: '',
    },
    alignment: {},
    vitalSigns: {
      pulseRate_awal: '72', pulseRate_awalKet: '',
      bodyTemperature_awal: '36.5', bodyTemperature_awalKet: '',
      respirationRate_awal: '16', respirationRate_awalKet: '',
      bloodPressure_awal: '120/80', bloodPressure_awalKet: '',
    },
    fms: {
      overheadSquat_awal: '2', overheadSquat_awalKet: '',
      inLineLunge_awal: '2', inLineLunge_awalKet: '',
      toeTouch_awal: '1', toeTouch_awalKet: 'Fleksibilitas hamstring kurang',
    },
    cardio: {},
    strength: {},
    endurance: {},
    tanita_catatan_awal: 'Data TANITA diambil sebelum sesi pertama. Klien dalam kondisi perut kosong.',
    tanita_catatan_akhir: '',
    girths_catatan_awal: 'Pengukuran dilakukan pagi hari sebelum makan.',
    girths_catatan_akhir: '',
    parq_catatan_awal: 'Lutut kiri pernah cedera 2022, saat ini tidak ada masalah aktif.',
    parq_catatan_akhir: '',
    align_catatan_awal: '',
    align_catatan_akhir: '',
    vital_catatan_awal: 'Pengukuran dalam kondisi istirahat.',
    vital_catatan_akhir: '',
    fms_catatan_awal: 'Perlu fokus mobilitas hip dan ankle.',
    fms_catatan_akhir: '',
    cardio_catatan_awal: '',
    cardio_catatan_akhir: '',
    strength_catatan_awal: '',
    strength_catatan_akhir: '',
    endurance_catatan_awal: '',
    endurance_catatan_akhir: '',
  },
  'SCR-26-0002': {
    noIdProgram: 'PP-26-0021',
    cabangWilayah: 'Jakarta Pusat',
    namaFC: 'Dian Kartika',
    namaPelatih: 'Rizky Firmansyah',
    namaKlien: 'Sari Dewi Lestari',
    usia: '28',
    jenisKelamin: 'Perempuan',
    tipeBadan: 'Mesomorf',
    detailGoals: 'Pembentukan otot dan peningkatan kebugaran umum',
    programLatihan: '8 Sesi - Basic (Muscle Toning)',
    tanggalPreTest: '2026-11-02',
    tanggalPostTest: '',
    toggles: { bodyMeasurement: true, healthScreening: true, fitnessTest: false },
    statusAssessment: 'Pre-Test Selesai',
    tanita: {
      tinggiBadan_awal: '162', tinggiBadan_awalKet: '',
      totalBodyWeight_awal: '55', totalBodyWeight_awalKet: '',
      totalBodyFat_awal: '22.1', totalBodyFat_awalKet: '',
      water_awal: '58', water_awalKet: '',
      muscleMas_awal: '40', muscleMas_awalKet: '',
      bodyMassIndex_awal: '20.9', bodyMassIndex_awalKet: '',
    },
    girths: {
      waist_awal: '72', waist_awalKet: '',
      hips_awal: '90', hips_awalKet: '',
    },
    parq: {
      masalahJantung_awalYa: false, masalahJantung_awalTidak: true, masalahJantung_awalKet: '',
    },
    alignment: {},
    vitalSigns: {
      pulseRate_awal: '68', pulseRate_awalKet: '',
      bloodPressure_awal: '110/70', bloodPressure_awalKet: '',
    },
    fms: {},
    cardio: {},
    strength: {},
    endurance: {},
    tanita_catatan_awal: '',
    tanita_catatan_akhir: '',
    girths_catatan_awal: '',
    girths_catatan_akhir: '',
    parq_catatan_awal: '',
    parq_catatan_akhir: '',
    align_catatan_awal: '',
    align_catatan_akhir: '',
    vital_catatan_awal: '',
    vital_catatan_akhir: '',
    fms_catatan_awal: '',
    fms_catatan_akhir: '',
    cardio_catatan_awal: '',
    cardio_catatan_akhir: '',
    strength_catatan_awal: '',
    strength_catatan_akhir: '',
    endurance_catatan_awal: '',
    endurance_catatan_akhir: '',
  },
}

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

function MeasTable({ title, fields, data, onChange, readOnly }) {
  return (
    <div>
      <p className="text-sm font-bold text-[#1E1C43] mb-2">{title}</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full" style={{ minWidth: '700px' }}>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide w-48">Item Tes</th>
              <th className="text-center px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide" colSpan={2}>Tes Awal</th>
              <th className="text-center px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide" colSpan={2}>Tes Akhir</th>
            </tr>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-3 py-1"></th>
              <th className="text-center px-3 py-1 text-xs text-gray-400 font-medium">Hasil</th>
              <th className="text-center px-3 py-1 text-xs text-gray-400 font-medium">Keterangan</th>
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
                {['awal', 'akhir'].map(phase => (
                  <>
                    <td key={`${phase}-hasil`} className="px-2 py-1.5">
                      <input
                        type="text"
                        value={data[`${f.key}_${phase}`] || ''}
                        onChange={e => onChange(prev => ({ ...prev, [`${f.key}_${phase}`]: e.target.value }))}
                        disabled={readOnly}
                        placeholder="—"
                        className="w-full text-xs text-center border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#1E1C43] disabled:bg-transparent disabled:border-transparent"
                      />
                    </td>
                    <td key={`${phase}-ket`} className="px-2 py-1.5">
                      <input
                        type="text"
                        value={data[`${f.key}_${phase}Ket`] || ''}
                        onChange={e => onChange(prev => ({ ...prev, [`${f.key}_${phase}Ket`]: e.target.value }))}
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
    </div>
  )
}

function ParqTable({ items, data, onChange, readOnly }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table className="w-full" style={{ minWidth: '800px' }}>
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Pertanyaan</th>
            <th className="text-center px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide" colSpan={3}>Tes Awal</th>
            <th className="text-center px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide" colSpan={3}>Tes Akhir</th>
          </tr>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-3 py-1"></th>
            <th className="text-center px-2 py-1 text-xs text-gray-400 font-medium">Ya</th>
            <th className="text-center px-2 py-1 text-xs text-gray-400 font-medium">Tidak</th>
            <th className="text-center px-2 py-1 text-xs text-gray-400 font-medium">Keterangan</th>
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
  const existing = !isNew ? (PP_ASSESSMENTS[id] || null) : null

  // Personal Detail
  const [noIdProgram, setNoIdProgram] = useState(existing?.noIdProgram || prefill.orderId || '')
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

  // Body Measurement state
  const [tanita, setTanita] = useState(existing?.tanita || {})
  const [girths, setGirths] = useState(existing?.girths || {})
  const [tanitaCatatanAwal, setTanitaCatatanAwal] = useState(existing?.tanita_catatan_awal || '')
  const [tanitaCatatanAkhir, setTanitaCatatanAkhir] = useState(existing?.tanita_catatan_akhir || '')
  const [girthsCatatanAwal, setGirthsCatatanAwal] = useState(existing?.girths_catatan_awal || '')
  const [girthsCatatanAkhir, setGirthsCatatanAkhir] = useState(existing?.girths_catatan_akhir || '')

  // Health Screening state
  const [parq, setParq] = useState(existing?.parq || {})
  const [alignment, setAlignment] = useState(existing?.alignment || {})
  const [vitalSigns, setVitalSigns] = useState(existing?.vitalSigns || {})
  const [parqCatatanAwal, setParqCatatanAwal] = useState(existing?.parq_catatan_awal || '')
  const [parqCatatanAkhir, setParqCatatanAkhir] = useState(existing?.parq_catatan_akhir || '')
  const [alignCatatanAwal, setAlignCatatanAwal] = useState(existing?.align_catatan_awal || '')
  const [alignCatatanAkhir, setAlignCatatanAkhir] = useState(existing?.align_catatan_akhir || '')
  const [vitalCatatanAwal, setVitalCatatanAwal] = useState(existing?.vital_catatan_awal || '')
  const [vitalCatatanAkhir, setVitalCatatanAkhir] = useState(existing?.vital_catatan_akhir || '')

  // Fitness Test state
  const [fms, setFms] = useState(existing?.fms || {})
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

  const [saved, setSaved] = useState(false)
  const [isEditing, setIsEditing] = useState(isNew)

  const statusColors = {
    'Pre-Test Selesai': 'bg-blue-50 text-blue-700 border-blue-200',
    'Selesai': 'bg-green-50 text-green-700 border-green-200',
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
    if (isNew) {
      const newScrId = `SCR-26-${String(Math.floor(Math.random() * 9000) + 1000)}`
      const tanggalLabel = tanggalPreTest
        ? new Date(tanggalPreTest).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      const targetPath = leadId ? `/pp/leads/${leadId}` : '/pp/screening'
      navigate(targetPath, leadId ? {
        state: {
          newScreening: {
            id: newScrId,
            tanggal: tanggalLabel,
            namaKlien,
            statusScreening: 'Draft',
            picScreening: namaFC || '',
          },
          defaultTab: 'kesehatan',
        },
      } : undefined)
      return
    }
    setSaved(true)
    setIsEditing(false)
    setTimeout(() => setSaved(false), 2000)
  }

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
          <div>
            <label className={labelCls}>Tanggal Post-Test</label>
            <input type="date" className={inputCls} value={tanggalPostTest} onChange={e => setTanggalPostTest(e.target.value)} />
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
            <ParqTable items={PARQ_ITEMS} data={parq} onChange={setParq} readOnly={false} />
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
