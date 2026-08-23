/**
 * ppAssessmentsData.js — PP Fitness Assessment master data
 *
 * Struktur per assessment:
 *   leadId           — ID lead/klien (dari ppLeadsData), penghubung antar order satu klien
 *   orderId          — order yang assessment ini tempel (= noIdProgram, kept for backward compat)
 *   prevAssessmentId — jika renewal: ID assessment order sebelumnya yang _akhir-nya di-copy
 *                      ke _awal record ini. null = order pertama klien ini.
 *
 * Naming convention field pengukuran:
 *   <metric>_awal      — nilai pre-test
 *   <metric>_awalKet   — keterangan / catatan pre-test
 *   <metric>_akhir     — nilai post-test (kosong jika belum selesai)
 *   <metric>_akhirKet  — keterangan / catatan post-test
 *
 * Mekanisme renewal (auto-copy):
 *   Saat order baru dibuat untuk klien yang sudah punya assessment ber-status
 *   'Post-Test Selesai', semua nilai _akhir dari assessment lama disalin
 *   menjadi _awal assessment baru. prevAssessmentId mencatat asal data tersebut.
 */

export const PP_ASSESSMENTS = {

  // ════════════════════════════════════════════════════════════════════════
  // SCR-26-0001  —  James Wilson  |  Order #PP-26-0013  |  Order pertama
  // ════════════════════════════════════════════════════════════════════════
  'SCR-26-0001': {
    leadId: 'LP-0001',
    orderId: 'PP-26-0013',
    prevAssessmentId: null,

    noIdProgram: 'PP-26-0013',
    cabangWilayah: 'Jakarta Selatan',
    namaFC: 'Sarah Jenkins',
    namaPelatih: 'Ahmad Pratama',
    namaKlien: 'James Wilson',
    usia: '32',
    jenisKelamin: 'Laki-laki',
    tipeBadan: 'Ektomorf',
    detailGoals: 'Penurunan berat badan, target -5 kg dalam 2 bulan',
    programLatihan: '12 Sesi - Pro (Fatloss)',
    tanggalPreTest: '2026-10-15',
    tanggalPostTest: '2026-12-20',
    toggles: { bodyMeasurement: true, healthScreening: true, fitnessTest: true },
    statusAssessment: 'Post-Test Selesai',

    ringkasan: {
      kondisiFisik: 'Normal, sedikit kelebihan berat badan',
      riwayatCedera: 'Pernah cedera lutut kanan (2023), sudah sembuh',
      obatanRutin: 'Tidak ada',
      catatanScreening: 'Klien aktif dan kooperatif. Disarankan program fatloss dengan fokus kardio 3x/minggu dan diet terkontrol.',
    },

    tanita: {
      tinggiBadan_awal: '170',         tinggiBadan_awalKet: '',
      totalBodyWeight_awal: '78',      totalBodyWeight_awalKet: '',
      totalBodyFat_awal: '24.5',       totalBodyFat_awalKet: '',
      water_awal: '53',                water_awalKet: '',
      muscleMas_awal: '56',            muscleMas_awalKet: '',
      physiqueRating_awal: '4',        physiqueRating_awalKet: '',
      basalMetabolicRate_awal: '1820', basalMetabolicRate_awalKet: '',
      metabolicAge_awal: '35',         metabolicAge_awalKet: '',
      boneMass_awal: '3.2',            boneMass_awalKet: '',
      visceralFat_awal: '9',           visceralFat_awalKet: '',
      bodyMassIndex_awal: '27.0',      bodyMassIndex_awalKet: '',

      tinggiBadan_akhir: '170',        tinggiBadan_akhirKet: '',
      totalBodyWeight_akhir: '73.2',   totalBodyWeight_akhirKet: 'Turun 4.8 kg dari baseline',
      totalBodyFat_akhir: '20.8',      totalBodyFat_akhirKet: 'Turun 3.7%, target tercapai',
      water_akhir: '57',               water_akhirKet: 'Hidrasi membaik',
      muscleMas_akhir: '57.3',         muscleMas_akhirKet: 'Massa otot meningkat 1.3 kg',
      physiqueRating_akhir: '5',       physiqueRating_akhirKet: '',
      basalMetabolicRate_akhir: '1850',basalMetabolicRate_akhirKet: '',
      metabolicAge_akhir: '32',        metabolicAge_akhirKet: 'Metabolic age turun 3 tahun',
      boneMass_akhir: '3.2',           boneMass_akhirKet: '',
      visceralFat_akhir: '7',          visceralFat_akhirKet: 'Turun dari 9 ke 7',
      bodyMassIndex_akhir: '25.3',     bodyMassIndex_akhirKet: 'BMI mendekati normal',
    },
    tanita_catatan_awal:  'Data TANITA diambil sebelum sesi pertama. Klien dalam kondisi perut kosong.',
    tanita_catatan_akhir: 'Pengukuran post-test 3 hari setelah sesi terakhir. Kondisi perut kosong, konsisten dengan pre-test.',

    girths: {
      waist_awal: '88',      waist_awalKet: '',
      hips_awal: '102',      hips_awalKet: '',
      dada_awal: '98',       dada_awalKet: '',
      rightArm_awal: '34',   rightArm_awalKet: '',
      leftArm_awal: '33.5',  leftArm_awalKet: '',

      waist_akhir: '83',     waist_akhirKet: 'Turun 5 cm, signifikan',
      hips_akhir: '99',      hips_akhirKet: 'Turun 3 cm',
      dada_akhir: '96',      dada_akhirKet: 'Turun 2 cm',
      rightArm_akhir: '35',  rightArm_akhirKet: 'Naik 1 cm — massa otot bertambah',
      leftArm_akhir: '34.5', leftArm_akhirKet: '',
    },
    girths_catatan_awal:  'Pengukuran dilakukan pagi hari sebelum makan.',
    girths_catatan_akhir: 'Konsisten pagi hari, sebelum makan.',

    parq: {
      masalahJantung_awalYa: false,      masalahJantung_awalTidak: true,      masalahJantung_awalKet: '',
      masalahJantung_akhirYa: false,     masalahJantung_akhirTidak: true,     masalahJantung_akhirKet: '',
      rekomendasiDokter_awalYa: false,   rekomendasiDokter_awalTidak: true,   rekomendasiDokter_awalKet: '',
      rekomendasiDokter_akhirYa: false,  rekomendasiDokter_akhirTidak: true,  rekomendasiDokter_akhirKet: '',
      nyeriDada_awalYa: false,           nyeriDada_awalTidak: true,           nyeriDada_awalKet: '',
      nyeriDada_akhirYa: false,          nyeriDada_akhirTidak: true,          nyeriDada_akhirKet: '',
      sakitLutut_awalYa: true,           sakitLutut_awalTidak: false,         sakitLutut_awalKet: 'Pernah cedera lutut kiri 2022',
      sakitLutut_akhirYa: false,         sakitLutut_akhirTidak: true,         sakitLutut_akhirKet: 'Tidak ada keluhan aktif',
      tekananDarahTinggi_awalYa: false,  tekananDarahTinggi_awalTidak: true,  tekananDarahTinggi_awalKet: '',
      tekananDarahTinggi_akhirYa: false, tekananDarahTinggi_akhirTidak: true, tekananDarahTinggi_akhirKet: '',
      obatSuplemen_awalYa: false,        obatSuplemen_awalTidak: true,        obatSuplemen_awalKet: '',
      obatSuplemen_akhirYa: true,        obatSuplemen_akhirTidak: false,      obatSuplemen_akhirKet: 'Whey protein dan multivitamin',
    },
    parq_catatan_awal:  'Lutut kiri pernah cedera 2022, saat ini tidak ada masalah aktif.',
    parq_catatan_akhir: 'Kondisi lutut baik selama program. Tidak ada keluhan.',

    alignment:          {},
    align_catatan_awal: '', align_catatan_akhir: '',

    vitalSigns: {
      pulseRate_awal: '72',          pulseRate_awalKet: '',
      bodyTemperature_awal: '36.5',  bodyTemperature_awalKet: '',
      respirationRate_awal: '16',    respirationRate_awalKet: '',
      bloodPressure_awal: '120/80',  bloodPressure_awalKet: '',

      pulseRate_akhir: '65',         pulseRate_akhirKet: 'Denyut nadi istirahat membaik',
      bodyTemperature_akhir: '36.4', bodyTemperature_akhirKet: '',
      respirationRate_akhir: '14',   respirationRate_akhirKet: '',
      bloodPressure_akhir: '115/75', bloodPressure_akhirKet: 'Tekanan darah lebih baik',
    },
    vital_catatan_awal:  'Pengukuran dalam kondisi istirahat 10 menit.',
    vital_catatan_akhir: 'Kondisi istirahat 10 menit sebelum pengukuran.',

    fms: {
      overheadSquat_awal: '2',  overheadSquat_awalKet: '',
      inLineLunge_awal: '2',    inLineLunge_awalKet: '',
      toeTouch_awal: '1',       toeTouch_awalKet: 'Fleksibilitas hamstring kurang',

      overheadSquat_akhir: '3', overheadSquat_akhirKet: 'Perbaikan signifikan setelah mobility work',
      inLineLunge_akhir: '2',   inLineLunge_akhirKet: '',
      toeTouch_akhir: '2',      toeTouch_akhirKet: 'Fleksibilitas hamstring membaik',
    },
    fms_catatan_awal:  'Perlu fokus mobilitas hip dan ankle.',
    fms_catatan_akhir: 'Progress mobilitas baik. Lanjutkan stretching rutin.',

    cardio: {}, strength: {}, endurance: {},
    cardio_catatan_awal: '',    cardio_catatan_akhir: '',
    strength_catatan_awal: '',  strength_catatan_akhir: '',
    endurance_catatan_awal: '', endurance_catatan_akhir: '',
  },

  // ════════════════════════════════════════════════════════════════════════
  // SCR-27-0001  —  James Wilson  |  Order #PP-27-0001  |  RENEWAL
  //
  // _awal values di-copy otomatis dari SCR-26-0001 _akhir (post-test)
  // ════════════════════════════════════════════════════════════════════════
  'SCR-27-0001': {
    leadId: 'LP-0001',
    orderId: 'PP-27-0001',
    prevAssessmentId: 'SCR-26-0001',

    noIdProgram: 'PP-27-0001',
    cabangWilayah: 'Jakarta Selatan',
    namaFC: 'Sarah Jenkins',
    namaPelatih: 'Ahmad Pratama',
    namaKlien: 'James Wilson',
    usia: '33',
    jenisKelamin: 'Laki-laki',
    tipeBadan: 'Ektomorf',
    detailGoals: 'Pembentukan otot dan peningkatan kebugaran umum setelah fatloss selesai',
    programLatihan: '12 Sesi - Pro (Muscle Toning)',
    tanggalPreTest: '2027-01-08',
    tanggalPostTest: '',
    toggles: { bodyMeasurement: true, healthScreening: true, fitnessTest: true },
    statusAssessment: 'Pre-Test Selesai',

    ringkasan: {
      kondisiFisik: 'BB sudah turun ke 73 kg, siap program muscle toning',
      riwayatCedera: 'Tidak ada keluhan aktif (lutut kiri sudah pulih)',
      obatanRutin: 'Whey protein dan multivitamin',
      catatanScreening: 'Klien renewal dari program fatloss. Data pre-test diadopsi dari post-test order sebelumnya. Program dialihkan ke muscle toning.',
    },

    tanita: {
      // ── pre-test = copy dari SCR-26-0001 _akhir ─────────────────────
      tinggiBadan_awal: '170',         tinggiBadan_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001',
      totalBodyWeight_awal: '73.2',    totalBodyWeight_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001',
      totalBodyFat_awal: '20.8',       totalBodyFat_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001',
      water_awal: '57',                water_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001',
      muscleMas_awal: '57.3',          muscleMas_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001',
      physiqueRating_awal: '5',        physiqueRating_awalKet: '',
      basalMetabolicRate_awal: '1850', basalMetabolicRate_awalKet: '',
      metabolicAge_awal: '32',         metabolicAge_awalKet: '',
      boneMass_awal: '3.2',            boneMass_awalKet: '',
      visceralFat_awal: '7',           visceralFat_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001',
      bodyMassIndex_awal: '25.3',      bodyMassIndex_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001',
      // ── post-test (belum diisi) ───────────────────────────────────────
      tinggiBadan_akhir: '',  tinggiBadan_akhirKet: '',
      totalBodyWeight_akhir:'', totalBodyWeight_akhirKet: '',
      totalBodyFat_akhir: '', totalBodyFat_akhirKet: '',
      water_akhir: '',        water_akhirKet: '',
      muscleMas_akhir: '',    muscleMas_akhirKet: '',
      physiqueRating_akhir: '',physiqueRating_akhirKet: '',
      basalMetabolicRate_akhir:'', basalMetabolicRate_akhirKet: '',
      metabolicAge_akhir: '', metabolicAge_akhirKet: '',
      boneMass_akhir: '',     boneMass_akhirKet: '',
      visceralFat_akhir: '',  visceralFat_akhirKet: '',
      bodyMassIndex_akhir: '',bodyMassIndex_akhirKet: '',
    },
    tanita_catatan_awal:  'Pre-Test diadopsi otomatis dari Post-Test Order #PP-26-0013 (Des 2026). Pengukuran ulang tidak dilakukan karena jeda renewal < 1 bulan.',
    tanita_catatan_akhir: '',

    girths: {
      waist_awal: '83',      waist_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001',
      hips_awal: '99',       hips_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001',
      dada_awal: '96',       dada_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001',
      rightArm_awal: '35',   rightArm_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001',
      leftArm_awal: '34.5',  leftArm_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001',
      waist_akhir: '',  waist_akhirKet: '',
      hips_akhir: '',   hips_akhirKet: '',
      dada_akhir: '',   dada_akhirKet: '',
      rightArm_akhir: '',rightArm_akhirKet: '',
      leftArm_akhir: '',leftArm_akhirKet: '',
    },
    girths_catatan_awal:  'Diadopsi dari Post-Test #SCR-26-0001.',
    girths_catatan_akhir: '',

    parq: {
      masalahJantung_awalYa: false,  masalahJantung_awalTidak: true,  masalahJantung_awalKet: '',
      sakitLutut_awalYa: false,      sakitLutut_awalTidak: true,      sakitLutut_awalKet: 'Tidak ada keluhan aktif',
      tekananDarahTinggi_awalYa: false, tekananDarahTinggi_awalTidak: true, tekananDarahTinggi_awalKet: '',
      obatSuplemen_awalYa: true,     obatSuplemen_awalTidak: false,   obatSuplemen_awalKet: 'Whey protein dan multivitamin',
    },
    parq_catatan_awal:  'Status kesehatan diadopsi dari Post-Test sebelumnya. Review ulang kondisi terkini di sesi pertama.',
    parq_catatan_akhir: '',

    alignment: {}, align_catatan_awal: '', align_catatan_akhir: '',

    vitalSigns: {
      pulseRate_awal: '65',          pulseRate_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001',
      bodyTemperature_awal: '36.4',  bodyTemperature_awalKet: '',
      respirationRate_awal: '14',    respirationRate_awalKet: '',
      bloodPressure_awal: '115/75',  bloodPressure_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001',
      pulseRate_akhir: '',  pulseRate_akhirKet: '',
      bodyTemperature_akhir: '', bodyTemperature_akhirKet: '',
      respirationRate_akhir: '', respirationRate_akhirKet: '',
      bloodPressure_akhir: '', bloodPressure_akhirKet: '',
    },
    vital_catatan_awal:  'Diadopsi dari Post-Test #SCR-26-0001.',
    vital_catatan_akhir: '',

    fms: {
      overheadSquat_awal: '3',  overheadSquat_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001',
      inLineLunge_awal: '2',    inLineLunge_awalKet: '',
      toeTouch_awal: '2',       toeTouch_awalKet: 'Diadopsi dari Post-Test #SCR-26-0001',
      overheadSquat_akhir: '', overheadSquat_akhirKet: '',
      inLineLunge_akhir: '',   inLineLunge_akhirKet: '',
      toeTouch_akhir: '',      toeTouch_akhirKet: '',
    },
    fms_catatan_awal:  'Nilai FMS diadopsi dari Post-Test sebelumnya.',
    fms_catatan_akhir: '',

    cardio: {}, strength: {}, endurance: {},
    cardio_catatan_awal: '',    cardio_catatan_akhir: '',
    strength_catatan_awal: '',  strength_catatan_akhir: '',
    endurance_catatan_awal: '', endurance_catatan_akhir: '',
  },

  // ════════════════════════════════════════════════════════════════════════
  // SCR-26-0002  —  Sari Dewi Lestari  |  Order #PP-26-0021
  // ════════════════════════════════════════════════════════════════════════
  'SCR-26-0002': {
    leadId: null,
    orderId: 'PP-26-0021',
    prevAssessmentId: null,

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

    ringkasan: {
      kondisiFisik: 'Normal, kebugaran sedang',
      riwayatCedera: 'Tidak ada',
      obatanRutin: 'Tidak ada',
      catatanScreening: 'Klien termotivasi untuk pembentukan tubuh. Program dimulai 2x seminggu.',
    },

    tanita: {
      tinggiBadan_awal: '162',       tinggiBadan_awalKet: '',
      totalBodyWeight_awal: '55',    totalBodyWeight_awalKet: '',
      totalBodyFat_awal: '22.1',     totalBodyFat_awalKet: '',
      water_awal: '58',              water_awalKet: '',
      muscleMas_awal: '40',          muscleMas_awalKet: '',
      bodyMassIndex_awal: '20.9',    bodyMassIndex_awalKet: '',
      tinggiBadan_akhir: '',  tinggiBadan_akhirKet: '',
      totalBodyWeight_akhir:'', totalBodyWeight_akhirKet: '',
      totalBodyFat_akhir: '',  totalBodyFat_akhirKet: '',
      water_akhir: '',         water_akhirKet: '',
      muscleMas_akhir: '',     muscleMas_akhirKet: '',
      bodyMassIndex_akhir: '', bodyMassIndex_akhirKet: '',
    },
    tanita_catatan_awal: '', tanita_catatan_akhir: '',

    girths: {
      waist_awal: '72', waist_awalKet: '',
      hips_awal: '90',  hips_awalKet: '',
      waist_akhir: '', waist_akhirKet: '',
      hips_akhir: '',  hips_akhirKet: '',
    },
    girths_catatan_awal: '', girths_catatan_akhir: '',

    parq: {
      masalahJantung_awalYa: false, masalahJantung_awalTidak: true, masalahJantung_awalKet: '',
    },
    parq_catatan_awal: '', parq_catatan_akhir: '',

    alignment: {}, align_catatan_awal: '', align_catatan_akhir: '',

    vitalSigns: {
      pulseRate_awal: '68',         pulseRate_awalKet: '',
      bloodPressure_awal: '110/70', bloodPressure_awalKet: '',
      pulseRate_akhir: '',  pulseRate_akhirKet: '',
      bloodPressure_akhir: '', bloodPressure_akhirKet: '',
    },
    vital_catatan_awal: '', vital_catatan_akhir: '',

    fms: {}, cardio: {}, strength: {}, endurance: {},
    fms_catatan_awal: '',       fms_catatan_akhir: '',
    cardio_catatan_awal: '',    cardio_catatan_akhir: '',
    strength_catatan_awal: '',  strength_catatan_akhir: '',
    endurance_catatan_awal: '', endurance_catatan_akhir: '',
  },
}

/**
 * Cari assessment berdasarkan orderId.
 * Digunakan di Order Detail page (Section 6) untuk render Fitness Assessment Awal.
 */
export function getAssessmentByOrderId(orderId) {
  return Object.entries(PP_ASSESSMENTS).find(([, a]) => a.orderId === orderId)
    ? { id: Object.keys(PP_ASSESSMENTS).find(k => PP_ASSESSMENTS[k].orderId === orderId),
        ...PP_ASSESSMENTS[Object.keys(PP_ASSESSMENTS).find(k => PP_ASSESSMENTS[k].orderId === orderId)] }
    : null
}
