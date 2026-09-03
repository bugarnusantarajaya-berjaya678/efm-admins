/**
 * ppLeadsStore.js
 * Shared store for leads health/screening info.
 * Mirrors the infoKesehatan collected in PPLeadDetailPage Tab Kesehatan.
 * Used by PPFitnessAssessmentPage to auto-fill Ringkasan Klien & Data Program.
 */

// Maps PP Order ID → Lead ID (pendaftar)
export const ORDER_TO_LEAD_ID = {
  'PP-26-0013': 'LP-0001',  // James Wilson
  'PP-27-0001': 'LP-0001',  // James Wilson (renewal)
  'PP-26-0012': 'LP-0006',  // Emily Chen (fix: was LP-0002 = Dewi Ayu, bukan Emily Chen)
  'PP-26-0011': 'LP-0013',  // Robert Taylor
  'PP-26-0010': 'LP-0014',  // Anita Suryani
  'PP-26-0008': 'LP-0003',  // Budi Santoso (couple)
  'PP-26-0021': 'LP-0018',  // Sari Dewi Lestari
  'PP-26-0007': 'LP-0015',  // Rina Kusuma
  'PP-26-0006': 'LP-0016',  // Hendra Wijaya
  'PP-26-0005': 'LP-0017',  // Dewi Anggraini
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
    dokumenKesehatan: [],
  },
  'LP-0013': {
    kondisiSaatIni: 'Aktif berolahraga ringan, ingin meningkatkan massa otot dan stamina keseluruhan',
    riwayatCedera: 'Pernah cedera pergelangan kaki kiri (2023), sudah pulih sepenuhnya',
    tujuanProgram: 'Muscle gain 3–5 kg, perbaiki postur punggung, target program 24 sesi Elite',
    obatanRutin: '-',
    catatanCs: 'Klien serius dan disiplin, preferensi jadwal pagi hari',
    sudahDiisi: true,
    dokumenKesehatan: [],
  },
  'LP-0014': {
    kondisiSaatIni: 'Kurang aktif berolahraga, mudah lelah, ingin meningkatkan kebugaran umum',
    riwayatCedera: 'Tidak ada riwayat cedera',
    tujuanProgram: 'Peningkatan kebugaran umum dan stamina, target 8 sesi Base program',
    obatanRutin: 'Suplemen vitamin D harian',
    catatanCs: 'Klien pemula, perlu pendekatan bertahap dan motivasi ekstra',
    sudahDiisi: true,
    dokumenKesehatan: [],
  },
  'LP-0003': {
    kondisiSaatIni: 'Kurang aktif beberapa bulan terakhir, ingin meningkatkan daya tahan',
    riwayatCedera: 'Tidak ada riwayat cedera serius',
    tujuanProgram: 'Fatloss ringan dan peningkatan daya tahan, target 12 sesi Pro',
    obatanRutin: '-',
    catatanCs: 'Jadwal weekend lebih fleksibel',
    sudahDiisi: true,
    dokumenKesehatan: [
      { id: 'DOK-001', nama: 'Surat Dokter - Budi Santoso.pdf', tipe: 'Surat Dokter', tanggal: '5 Okt 2026' },
    ],
  },
  'LP-0015': {
    kondisiSaatIni: 'Kondisi umum baik, aktif jalan kaki, ingin lebih bugar secara keseluruhan',
    riwayatCedera: 'Tidak ada riwayat cedera',
    tujuanProgram: 'Kebugaran umum dan toning, paket Starter 4 sesi',
    obatanRutin: '-',
    catatanCs: '',
    sudahDiisi: true,
    dokumenKesehatan: [],
  },
  'LP-0016': {
    kondisiSaatIni: 'Gaya hidup sedentary, sering duduk lama di kantor, keluhan nyeri punggung ringan',
    riwayatCedera: 'Nyeri punggung bawah (lower back) kronis ringan sejak 2022',
    tujuanProgram: 'Penurunan berat badan dan perbaikan postur, target 24 sesi Elite jangka panjang',
    obatanRutin: '-',
    catatanCs: 'Perlu program yang memperhatikan kondisi lower back',
    sudahDiisi: true,
    dokumenKesehatan: [],
  },
  'LP-0017': {
    kondisiSaatIni: 'Aktif berolahraga ringan (zumba), ingin program lebih terstruktur',
    riwayatCedera: 'Tidak ada',
    tujuanProgram: 'Fatloss dan body shaping, 8 sesi Base',
    obatanRutin: '-',
    catatanCs: '',
    sudahDiisi: true,
    dokumenKesehatan: [],
  },
  'LP-0018': {
    kondisiSaatIni: 'Normal, kebugaran sedang',
    riwayatCedera: 'Tidak ada',
    tujuanProgram: 'Pembentukan otot dan peningkatan kebugaran umum',
    obatanRutin: 'Tidak ada',
    catatanCs: 'Klien termotivasi untuk pembentukan tubuh',
    sudahDiisi: true,
    dokumenKesehatan: [],
  },
  'LP-0012': {
    kondisiSaatIni: 'Kurang aktif, tidak ada keluhan khusus',
    riwayatCedera: 'Tidak ada',
    tujuanProgram: 'Yoga dan fleksibilitas, 4 sesi Starter',
    obatanRutin: '-',
    catatanCs: 'Sudah bayar DP, siap mulai',
    sudahDiisi: true,
    dokumenKesehatan: [],
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

export function getLeadDocumentsById(leadId) {
  return _healthStore[leadId]?.dokumenKesehatan || []
}

export function updateLeadHealth(leadId, patch) {
  _healthStore = { ..._healthStore, [leadId]: { ...(_healthStore[leadId] || {}), ...patch, sudahDiisi: true } }
}

// ─── Module-level leads store (cross-page state sharing) ─────────────────────
const LEADS_INIT = [
  { id:'LP-0001', nama:'James Wilson',          sapaan:'Pak', tipe:'Personal', noHp:'081234567890', jenisKelamin:'Laki-laki', tanggalLahir:'1985-03-15', sumberLead:'Website',    picEfm:'Sarah Jenkins', programDiminati:'12 Sesi - Pro',       emailUmum:'james.wilson@email.com', alamat:'Jl. Senopati Indah No. 12, Kebayoran Baru, Jakarta Selatan',  catatanAwal:'Tertarik program fatloss, sudah follow up 2x',        statusPipeline:'Convert',  orderId:'PP-26-0013', tanggalMasuk:'20 Okt 2026', tanggalFollowUp:null, catatan:'Sudah convert ke Order PP-26-0013', klienIds:['KL-0001'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'Convert',oleh:'Sarah Jenkins',tanggal:'20 Okt 2026',catatan:'Order berhasil dibuat, PP-26-0013'},{status:'Closing',oleh:'Sarah Jenkins',tanggal:'18 Okt 2026',catatan:'Klien setuju paket 12 sesi'},{status:'Invoicing',oleh:'Sarah Jenkins',tanggal:'16 Okt 2026',catatan:'Invoice dikirim, menunggu pembayaran'},{status:'Screening',oleh:'Sarah Jenkins',tanggal:'14 Okt 2026',catatan:'Screening kesehatan selesai, BMI normal'},{status:'Approach',oleh:'Sarah Jenkins',tanggal:'12 Okt 2026',catatan:'Follow up via WhatsApp, klien tertarik'},{status:'New',oleh:'Sarah Jenkins',tanggal:'10 Okt 2026',catatan:'Lead masuk dari form website'}]},
  { id:'LP-0002', nama:'Dewi Ayu',              sapaan:'Kak', tipe:'Personal', noHp:'087766554433', jenisKelamin:'Perempuan', tanggalLahir:'1993-07-22', sumberLead:'Referral',   picEfm:'Marcus Chen',   programDiminati:'Tennis',              emailUmum:'dewi.ayu@email.com', alamat:'Jl. Kemang Raya No. 8, Kemang, Jakarta Selatan',      catatanAwal:'Direferensikan oleh klien lama',                       statusPipeline:'Approach', tanggalMasuk:'7 Jun 2026',  tanggalFollowUp:'2026-07-03', catatan:'Belum respon follow up terakhir',   klienIds:['KL-0002'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'Approach',oleh:'Marcus Chen',tanggal:'1 Jul 2026',catatan:'Follow up kedua, belum ada respon'},{status:'New',oleh:'Marcus Chen',tanggal:'7 Jun 2026',catatan:'Lead masuk dari referral'}]},
  { id:'LP-0003', nama:'Budi & Rina Santoso',   sapaan:'Kak', tipe:'Couple',   noHp:'085678901234', jenisKelamin:'', tanggalLahir:'', sumberLead:'Walk-in',    picEfm:'Sarah Jenkins', programDiminati:'12 Sesi - Pro',       emailUmum:'budi.santoso@email.com', alamat:'Jl. Pesanggrahan No. 45, Pesanggrahan, Jakarta Selatan',  catatanAwal:'Datang langsung ke lokasi, tertarik program couple',   statusPipeline:'Screening',tanggalMasuk:'6 Okt 2026',  tanggalFollowUp:'2026-07-05', catatan:'Menunggu jadwal screening kesehatan', klienIds:['KL-0003','KL-0004'], hubunganDenganKlien: 'Pasangan', logAktivitas:[{status:'Screening',oleh:'Sarah Jenkins',tanggal:'6 Okt 2026',catatan:'Dijadwalkan screening minggu depan'},{status:'New',oleh:'Sarah Jenkins',tanggal:'6 Okt 2026',catatan:'Walk-in langsung ke lokasi'}]},
  { id:'LP-0004', nama:'Rian Maulana (Group Tennis)',sapaan:'Mas',tipe:'Group',noHp:'087712345678', jenisKelamin:'Laki-laki', tanggalLahir:'1990-11-08', sumberLead:'Meta Ads',    picEfm:'Sarah Jenkins', programDiminati:'Tennis Group',         emailUmum:'rian.maulana@email.com', alamat:'Jl. Ciputat Raya No. 77, Bintaro, Tangerang Selatan',  catatanAwal:'Mau daftar grup 4 orang untuk tennis',                statusPipeline:'New',      tanggalMasuk:'15 Jun 2026', tanggalFollowUp:'2026-07-02', catatan:'Baru masuk, belum dihubungi',      klienIds:['KL-0005'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'New',oleh:'Sarah Jenkins',tanggal:'15 Jun 2026',catatan:'Lead masuk dari iklan Meta Ads'}]},
  { id:'LP-0005', nama:'Anita Kumar',           sapaan:'Kak', tipe:'Personal', noHp:'081298765432', jenisKelamin:'Perempuan', tanggalLahir:'1988-05-30', sumberLead:'Meta Ads',    picEfm:'Sarah Jenkins', programDiminati:'Fatloss & Bodyshape', emailUmum:'anita.kumar@email.com', alamat:'Jl. Puri Kencana No. 3, Kembangan, Jakarta Barat',   catatanAwal:'Tertarik program fatloss',                            statusPipeline:'Lost',     tanggalMasuk:'15 Jun 2026', tanggalFollowUp:null, catatan:'Tidak melanjutkan karena budget',  klienIds:['KL-0006'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'Lost',oleh:'Sarah Jenkins',tanggal:'20 Jun 2026',catatan:'Klien menyatakan budget tidak sesuai'},{status:'Approach',oleh:'Sarah Jenkins',tanggal:'16 Jun 2026',catatan:'Sudah follow up, masih pertimbangan'},{status:'New',oleh:'Sarah Jenkins',tanggal:'15 Jun 2026',catatan:'Lead masuk dari iklan'}]},
  { id:'LP-0006', nama:'Emily Chen',            sapaan:'Kak', tipe:'Personal', noHp:'082345678901', jenisKelamin:'Perempuan', tanggalLahir:'1991-09-14', sumberLead:'Meta Ads',    picEfm:'Sarah Jenkins', programDiminati:'Fatloss & Bodyshape', emailUmum:'emily.chen@email.com', alamat:'Jl. SCBD Lot 5, Sudirman, Jakarta Selatan',    catatanAwal:'Tertarik fatloss program, butuh jadwal fleksibel',    statusPipeline:'Convert',  orderId:'PP-26-0012', tanggalMasuk:'12 Mar 2026', tanggalFollowUp:null, catatan:'Sudah convert ke Order PP-26-0012', klienIds:['KL-0007'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'Convert',oleh:'Sarah Jenkins',tanggal:'20 Mar 2026',catatan:'Order berhasil dibuat'},{status:'Closing',oleh:'Sarah Jenkins',tanggal:'18 Mar 2026',catatan:'Klien setuju paket'},{status:'New',oleh:'Sarah Jenkins',tanggal:'12 Mar 2026',catatan:'Lead masuk dari Meta Ads'}]},
  { id:'LP-0007', nama:'Kevin Hartanto',        sapaan:'Mas', tipe:'Personal', noHp:'081345678901', jenisKelamin:'Laki-laki', tanggalLahir:'1987-02-25', sumberLead:'Referral',   picEfm:'Marcus Chen',   programDiminati:'12 Sesi - Pro',       emailUmum:'kevin.hartanto@email.com', alamat:'Jl. Wijaya XI No. 22, Kebayoran Baru, Jakarta Selatan',catatanAwal:'Direferensikan oleh James Wilson',                     statusPipeline:'Convert',  orderId:'PP-26-0004', tanggalMasuk:'18 Apr 2026', tanggalFollowUp:null, catatan:'Sudah convert ke Order PP-26-0004', klienIds:['KL-0008'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'Convert',oleh:'Marcus Chen',tanggal:'25 Apr 2026',catatan:'Order berhasil dibuat'},{status:'Screening',oleh:'Marcus Chen',tanggal:'22 Apr 2026',catatan:'Screening kesehatan selesai'},{status:'New',oleh:'Marcus Chen',tanggal:'18 Apr 2026',catatan:'Lead masuk dari referral'}]},
  { id:'LP-0008', nama:'Natasha Putri',         sapaan:'Kak', tipe:'Personal', noHp:'087811223344', jenisKelamin:'Perempuan', tanggalLahir:'1995-06-18', sumberLead:'Instagram',  picEfm:'Sarah Jenkins', programDiminati:'Tennis',              emailUmum:'natasha.putri@email.com', alamat:'Jl. Cipete Raya No. 55, Cipete, Jakarta Selatan', catatanAwal:'Menemukan EFM dari Instagram, mau coba tennis',      statusPipeline:'Convert',  orderId:'PP-26-0001', tanggalMasuk:'22 Apr 2026', tanggalFollowUp:null, catatan:'Sudah convert ke Order PP-26-0001', klienIds:['KL-0009'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'Convert',oleh:'Sarah Jenkins',tanggal:'30 Apr 2026',catatan:'Order berhasil dibuat'},{status:'New',oleh:'Sarah Jenkins',tanggal:'22 Apr 2026',catatan:'Lead masuk dari Instagram DM'}]},
  { id:'LP-0009', nama:'Ahmad Fauzi',           sapaan:'Pak', tipe:'Personal', noHp:'081122334455', jenisKelamin:'Laki-laki', tanggalLahir:'1982-04-10', sumberLead:'Walk-in',    picEfm:'Marcus Chen',   programDiminati:'12 Sesi - Pro',       emailUmum:'ahmad.fauzi@email.com', alamat:'Jl. Tebet Timur Dalam No. 10, Tebet, Jakarta Selatan',   catatanAwal:'Datang langsung, sudah komitmen mulai bulan depan',   statusPipeline:'Convert',  orderId:'PP-26-0002', tanggalMasuk:'5 Mei 2026',  tanggalFollowUp:null, catatan:'Sudah convert ke Order PP-26-0002', klienIds:['KL-0010'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'Convert',oleh:'Marcus Chen',tanggal:'10 Mei 2026',catatan:'Order berhasil dibuat'},{status:'New',oleh:'Marcus Chen',tanggal:'5 Mei 2026',catatan:'Walk-in langsung ke lokasi'}]},
  { id:'LP-0010', nama:'Yoga Pratama',          sapaan:'Mas', tipe:'Group',    noHp:'087700112233', jenisKelamin:'Laki-laki', tanggalLahir:'1992-08-05', sumberLead:'Google Ads', picEfm:'Sarah Jenkins', programDiminati:'Tennis Group',         emailUmum:'yoga.pratama@email.com', alamat:'Jl. Lebak Bulus No. 88, Cilandak, Jakarta Selatan',  catatanAwal:'Ingin daftar grup 3 orang, jadwal weekend',           statusPipeline:'Invoicing',tanggalMasuk:'2 Jul 2026',  tanggalFollowUp:'2026-07-20', catatan:'Invoice sudah dikirim, menunggu konfirmasi pembayaran', klienIds:['KL-0011'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'Invoicing',oleh:'Sarah Jenkins',tanggal:'12 Jul 2026',catatan:'Invoice dikirim via WhatsApp'},{status:'Screening',oleh:'Sarah Jenkins',tanggal:'8 Jul 2026',catatan:'Screening group selesai'},{status:'New',oleh:'Sarah Jenkins',tanggal:'2 Jul 2026',catatan:'Lead masuk dari Google Ads'}]},
  { id:'LP-0011', nama:'Maya Indriati',         sapaan:'Kak', tipe:'Personal', noHp:'082233445566', jenisKelamin:'Perempuan', tanggalLahir:'1994-12-20', sumberLead:'Website',    picEfm:'Marcus Chen',   programDiminati:'Fatloss & Bodyshape', emailUmum:'maya.indriati@email.com', alamat:'Jl. Radio Dalam No. 34, Kebayoran Baru, Jakarta Selatan', catatanAwal:'Submit form website, tertarik program 8 sesi',        statusPipeline:'Closing',  tanggalMasuk:'10 Jul 2026', tanggalFollowUp:'2026-07-25', catatan:'Negosiasi harga, hampir deal',    klienIds:['KL-0012'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'Closing',oleh:'Marcus Chen',tanggal:'18 Jul 2026',catatan:'Diskusi paket, hampir sepakat'},{status:'Invoicing',oleh:'Marcus Chen',tanggal:'15 Jul 2026',catatan:'Draft invoice dikirim'},{status:'Screening',oleh:'Marcus Chen',tanggal:'13 Jul 2026',catatan:'Screening selesai, hasil baik'},{status:'New',oleh:'Marcus Chen',tanggal:'10 Jul 2026',catatan:'Lead dari form website'}]},
  { id:'LP-0012', nama:'Fiona Santika',         sapaan:'Kak', tipe:'Personal', noHp:'081988776655', jenisKelamin:'Perempuan', tanggalLahir:'1996-03-28', sumberLead:'Referral',   picEfm:'Sarah Jenkins', programDiminati:'Tennis',              emailUmum:'fiona.santika@email.com', alamat:'Jl. Ragunan No. 21, Pasar Minggu, Jakarta Selatan', catatanAwal:'Referral dari teman, minat yoga dan tenis',           statusPipeline:'Convert',  orderId:'PP-26-0003', tanggalMasuk:'15 Agu 2026', tanggalFollowUp:null, catatan:'Sudah convert ke Order PP-26-0003', klienIds:['KL-0013'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'Convert',oleh:'Sarah Jenkins',tanggal:'22 Agu 2026',catatan:'Order berhasil dibuat'},{status:'New',oleh:'Sarah Jenkins',tanggal:'15 Agu 2026',catatan:'Lead masuk dari referral'}]},
  { id:'LP-0013', nama:'Robert Taylor',         sapaan:'Pak', tipe:'Personal', noHp:'081567890123', jenisKelamin:'Laki-laki', tanggalLahir:'1979-01-17', sumberLead:'Website',    picEfm:'Marcus Chen',   programDiminati:'12 Sesi - Pro',       emailUmum:'robert.taylor@email.com', alamat:'Jl. Brawijaya No. 15, Kebayoran Baru, Jakarta Selatan', catatanAwal:'Expat, mencari personal trainer profesional',         statusPipeline:'Convert',  orderId:'PP-26-0011', tanggalMasuk:'22 Sep 2026', tanggalFollowUp:null, catatan:'Sudah convert ke Order PP-26-0011', klienIds:['KL-0014'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'Convert',oleh:'Marcus Chen',tanggal:'28 Sep 2026',catatan:'Order berhasil dibuat'},{status:'New',oleh:'Marcus Chen',tanggal:'22 Sep 2026',catatan:'Lead dari form website'}]},
  { id:'LP-0014', nama:'Anita Suryani',         sapaan:'Kak', tipe:'Personal', noHp:'085599887766', jenisKelamin:'Perempuan', tanggalLahir:'1990-10-02', sumberLead:'Meta Ads',    picEfm:'Sarah Jenkins', programDiminati:'Fatloss & Bodyshape', emailUmum:'anita.suryani@email.com', alamat:'Jl. Fatmawati No. 33, Cilandak, Jakarta Selatan', catatanAwal:'Tertarik fatloss, target 5 kg dalam 2 bulan',         statusPipeline:'Convert',  orderId:'PP-26-0010', tanggalMasuk:'1 Okt 2026',  tanggalFollowUp:null, catatan:'Sudah convert ke Order PP-26-0010', klienIds:['KL-0015'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'Convert',oleh:'Sarah Jenkins',tanggal:'8 Okt 2026',catatan:'Order berhasil dibuat'},{status:'New',oleh:'Sarah Jenkins',tanggal:'1 Okt 2026',catatan:'Lead masuk dari Meta Ads'}]},
  { id:'LP-0015', nama:'Rina Kusuma',           sapaan:'Kak', tipe:'Personal', noHp:'086789012345', jenisKelamin:'Perempuan', tanggalLahir:'1994-03-17', sumberLead:'Walk-in',    picEfm:'Sarah Jenkins', programDiminati:'4 Sesi - Starter',    emailUmum:'rina.kusuma@email.com', alamat:'Jl. Gandaria Tengah No. 7, Kebayoran Baru, Jakarta Selatan', catatanAwal:'Datang langsung, tertarik paket starter',            statusPipeline:'Convert',  orderId:'PP-26-0007', tanggalMasuk:'3 Okt 2026',  tanggalFollowUp:null, catatan:'Sudah convert ke Order PP-26-0007', klienIds:['KL-0017'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'Convert',oleh:'Sarah Jenkins',tanggal:'10 Okt 2026',catatan:'Order berhasil dibuat'},{status:'New',oleh:'Sarah Jenkins',tanggal:'3 Okt 2026',catatan:'Walk-in langsung ke lokasi'}]},
  { id:'LP-0016', nama:'Hendra Wijaya',         sapaan:'Mas', tipe:'Personal', noHp:'087890123456', jenisKelamin:'Laki-laki', tanggalLahir:'1986-11-30', sumberLead:'Website',    picEfm:'Marcus Chen',   programDiminati:'24 Sesi - Elite',     emailUmum:'hendra.wijaya@email.com', alamat:'Jl. Senayan No. 5, Tanah Abang, Jakarta Pusat', catatanAwal:'Submit form website, tertarik paket elite jangka panjang', statusPipeline:'Convert', orderId:'PP-26-0006', tanggalMasuk:'28 Sep 2026', tanggalFollowUp:null, catatan:'Sudah convert ke Order PP-26-0006', klienIds:['KL-0018'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'Convert',oleh:'Marcus Chen',tanggal:'5 Okt 2026',catatan:'Order berhasil dibuat'},{status:'New',oleh:'Marcus Chen',tanggal:'28 Sep 2026',catatan:'Lead dari form website'}]},
  { id:'LP-0017', nama:'Dewi Rahayu',           sapaan:'Kak', tipe:'Personal', noHp:'088901234567', jenisKelamin:'Perempuan', tanggalLahir:'1992-07-04', sumberLead:'Referral',   picEfm:'Sarah Jenkins', programDiminati:'8 Sesi - Base',       emailUmum:'dewi.rahayu@email.com', alamat:'Jl. Melawai Raya No. 12, Blok M, Jakarta Selatan', catatanAwal:'Referral dari teman yang sudah jadi klien',          statusPipeline:'Convert',  orderId:'PP-26-0005', tanggalMasuk:'22 Sep 2026', tanggalFollowUp:null, catatan:'Sudah convert ke Order PP-26-0005', klienIds:['KL-0019'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'Convert',oleh:'Sarah Jenkins',tanggal:'29 Sep 2026',catatan:'Order berhasil dibuat'},{status:'New',oleh:'Sarah Jenkins',tanggal:'22 Sep 2026',catatan:'Lead masuk dari referral'}]},
  { id:'LP-0018', nama:'Sari Dewi Lestari',     sapaan:'Kak', tipe:'Personal', noHp:'081399887766', jenisKelamin:'Perempuan', tanggalLahir:'1998-05-12', sumberLead:'Referral',   picEfm:'Sarah Jenkins', programDiminati:'8 Sesi - Base',       emailUmum:'sari.dewi@email.com', alamat:'Jl. Thamrin No. 18, Menteng, Jakarta Pusat', catatanAwal:'Referral dari teman gym, tertarik pembentukan otot', statusPipeline:'Convert',  orderId:'PP-26-0021', tanggalMasuk:'20 Okt 2026', tanggalFollowUp:null, catatan:'Sudah convert ke Order PP-26-0021', klienIds:['KL-0016'], hubunganDenganKlien: 'Diri Sendiri', logAktivitas:[{status:'Convert',oleh:'Sarah Jenkins',tanggal:'27 Okt 2026',catatan:'Order berhasil dibuat'},{status:'Closing',oleh:'Sarah Jenkins',tanggal:'25 Okt 2026',catatan:'Klien setuju paket 8 sesi Base'},{status:'Screening',oleh:'Sarah Jenkins',tanggal:'23 Okt 2026',catatan:'Screening kesehatan selesai'},{status:'New',oleh:'Sarah Jenkins',tanggal:'20 Okt 2026',catatan:'Lead masuk dari referral teman'}]},
]

let _leads = LEADS_INIT.map(l => ({ ...l }))

export function initLeads(initial) {
  // kept for backward compat — store already pre-loaded; only re-seeds if explicitly needed
  if (initial && initial.length > _leads.length) _leads = initial.map(l => ({ ...l }))
}

export function getStoredLeads() {
  return [..._leads]
}

export function getLeadById(leadId) {
  return _leads.find(l => l.id === leadId) || null
}

export function addStoredLead(lead) {
  _leads = [..._leads, lead]
}

export function getNextLeadId() {
  return 'LP-' + String(_leads.length + 1).padStart(4, '0')
}

export function getNoHpByOrderId(orderId) {
  const leadId = ORDER_TO_LEAD_ID[orderId]
  if (!leadId) return null
  const lead = _leads.find(l => l.id === leadId)
  return lead?.noHp || null
}
