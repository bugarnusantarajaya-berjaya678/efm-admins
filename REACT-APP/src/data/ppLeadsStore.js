/**
 * ppLeadsStore.js
 * Shared store for leads health/screening info.
 * Mirrors the infoKesehatan collected in PPLeadDetailPage Tab Kesehatan.
 * Used by PPFitnessAssessmentPage to auto-fill Ringkasan Klien & Data Program.
 */

// Maps PP Order ID → Lead ID
export const ORDER_TO_LEAD_ID = {
  'PP-26-0013': 'LP-0001',  // James Wilson
  'PP-26-0012': 'LP-0002',  // Emily Chen
  'PP-26-0011': 'LP-0013',  // Robert Taylor
  'PP-26-0010': 'LP-0014',  // Anita Kumar
  'PP-26-0008': 'LP-0003',  // Budi Santoso
  'PP-26-0007': 'LP-0015',  // Rina Kusuma
  'PP-26-0006': 'LP-0016',  // Hendra Wijaya
  'PP-26-0005': 'LP-0017',  // Dewi Rahayu (Dewi Anggraini)
  'PP-26-0004': 'LP-0007',  // Kevin Hartanto
  'PP-26-0003': 'LP-0012',  // Fiona Santika
  'PP-26-0002': 'LP-0009',  // Ahmad Fauzi
  'PP-26-0001': 'LP-0008',  // Natasha Putri
}

// Health screening info per lead (synced with PPLeadDetailPage infoKesehatan)
let _healthStore = {
  'LP-0001': {
    kondisiSaatIni: 'Mengeluhkan lemak berlebih di area perut dan pinggul, tidak ada nyeri sendi',
    riwayatCedera: 'Tidak ada riwayat cedera serius',
    tujuanProgram: 'Fatloss 8–10 kg, perbaiki postur, tingkatkan stamina kardio',
    obatanRutin: '-',
    catatanCs: 'Klien aktif, follow up responsif, siap mulai kapan saja',
    sudahDiisi: true,
  },
  'LP-0013': {
    kondisiSaatIni: 'Aktif berolahraga ringan, ingin meningkatkan massa otot dan stamina keseluruhan',
    riwayatCedera: 'Pernah cedera pergelangan kaki kiri (2023), sudah pulih sepenuhnya',
    tujuanProgram: 'Muscle gain 3–5 kg, perbaiki postur punggung, target program 24 sesi Elite',
    obatanRutin: '-',
    catatanCs: 'Klien serius dan disiplin, preferensi jadwal pagi hari',
    sudahDiisi: true,
  },
  'LP-0014': {
    kondisiSaatIni: 'Kurang aktif berolahraga, mudah lelah, ingin meningkatkan kebugaran umum',
    riwayatCedera: 'Tidak ada riwayat cedera',
    tujuanProgram: 'Peningkatan kebugaran umum dan stamina, target 8 sesi Base program',
    obatanRutin: 'Suplemen vitamin D harian',
    catatanCs: 'Klien pemula, perlu pendekatan bertahap dan motivasi ekstra',
    sudahDiisi: true,
  },
  'LP-0003': {
    kondisiSaatIni: 'Kurang aktif beberapa bulan terakhir, ingin meningkatkan daya tahan',
    riwayatCedera: 'Tidak ada riwayat cedera serius',
    tujuanProgram: 'Fatloss ringan dan peningkatan daya tahan, target 12 sesi Pro',
    obatanRutin: '-',
    catatanCs: 'Jadwal weekend lebih fleksibel',
    sudahDiisi: true,
  },
  'LP-0015': {
    kondisiSaatIni: 'Kondisi umum baik, aktif jalan kaki, ingin lebih bugar secara keseluruhan',
    riwayatCedera: 'Tidak ada riwayat cedera',
    tujuanProgram: 'Kebugaran umum dan toning, paket Starter 4 sesi',
    obatanRutin: '-',
    catatanCs: '',
    sudahDiisi: true,
  },
  'LP-0016': {
    kondisiSaatIni: 'Gaya hidup sedentary, sering duduk lama di kantor, keluhan nyeri punggung ringan',
    riwayatCedera: 'Nyeri punggung bawah (lower back) kronis ringan sejak 2022',
    tujuanProgram: 'Penurunan berat badan dan perbaikan postur, target 24 sesi Elite jangka panjang',
    obatanRutin: '-',
    catatanCs: 'Perlu program yang memperhatikan kondisi lower back',
    sudahDiisi: true,
  },
  'LP-0017': {
    kondisiSaatIni: 'Aktif berolahraga ringan (zumba), ingin program lebih terstruktur',
    riwayatCedera: 'Tidak ada',
    tujuanProgram: 'Fatloss dan body shaping, 8 sesi Base',
    obatanRutin: '-',
    catatanCs: '',
    sudahDiisi: true,
  },
  'LP-0012': {
    kondisiSaatIni: 'Kurang aktif, tidak ada keluhan khusus',
    riwayatCedera: 'Tidak ada',
    tujuanProgram: 'Yoga dan fleksibilitas, 4 sesi Starter',
    obatanRutin: '-',
    catatanCs: 'Sudah bayar DP, siap mulai',
    sudahDiisi: true,
  },
}

export function getLeadHealthByOrderId(orderId) {
  const leadId = ORDER_TO_LEAD_ID[orderId]
  if (!leadId) return null
  return _healthStore[leadId] ? { leadId, ..._healthStore[leadId] } : { leadId, sudahDiisi: false }
}

export function getLeadHealthById(leadId) {
  return _healthStore[leadId] ? { leadId, ..._healthStore[leadId] } : null
}

export function updateLeadHealth(leadId, patch) {
  _healthStore = { ..._healthStore, [leadId]: { ...(_healthStore[leadId] || {}), ...patch, sudahDiisi: true } }
}

// ─── Module-level leads store (cross-page state sharing) ─────────────────────
let _leads = null

export function initLeads(initialLeads) {
  if (_leads === null) _leads = [...initialLeads]
}

export function getStoredLeads() {
  return _leads ? [..._leads] : []
}

export function addStoredLead(lead) {
  if (!_leads) _leads = []
  _leads = [..._leads, lead]
}

export function getNextLeadId() {
  const n = _leads ? _leads.length + 1 : 1
  return 'LP-' + String(n).padStart(4, '0')
}
