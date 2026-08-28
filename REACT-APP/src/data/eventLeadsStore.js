// Module-level leads store for Event — cross-page state sharing
// Mirrors the pattern in ppLeadsStore.js

const LEADS_INIT = [
  {
    id: 'LE-0001', namaKlien: 'Yayasan Kanker Indonesia', tipeKlien: 'Foundation', kota: 'Jakarta Selatan',
    namaEvent: 'Health Run for Hope 2026', jenisEvent: 'Charity Run',
    emailUmum: 'info@yayasankanker.or.id', sumberLead: 'Referral', picSalesEFM: 'Bagoes',
    stage: 'Converted', tanggal: '2026-05-01', catatanAwal: 'Referral dari jaringan nonprofit kesehatan',
    teleponUmum: '021-3334567', alamatLengkap: 'Jl. Gatot Subroto No. 55, Jakarta Selatan',
    linkGoogleMaps: '', namaKoordinator: 'Ibu Ratna', jabatanKoordinator: 'Program Director',
    waKoordinator: '081234567890', emailKoordinator: 'ratna@yayasankanker.or.id',
    logAktivitas: [
      { tanggal: '2026-05-01', stage: 'New',       catatan: 'Lead masuk via referral komunitas kesehatan', picEFM: 'Bagoes' },
      { tanggal: '2026-05-10', stage: 'Approach',  catatan: 'Kirim company profile event organizer',       picEFM: 'Bagoes' },
      { tanggal: '2026-05-20', stage: 'Closing',   catatan: 'Proposal diterima, jadwalkan konsultasi',     picEFM: 'Bagoes' },
      { tanggal: '2026-06-01', stage: 'Converted', catatan: 'Deal ditandatangani, order dibuat',           picEFM: 'Bagoes' },
    ],
    konsultasiId: 'KNS-26-0001', orderIds: ['EV-26-0001'],
  },
  {
    id: 'LE-0002', namaKlien: 'PT. Garuda Nusa Tbk', tipeKlien: 'Corporate', kota: 'Jakarta Pusat',
    namaEvent: 'Corporate Fun Run 2026', jenisEvent: 'Fun Run',
    emailUmum: 'hrd@garudanusa.co.id', sumberLead: 'Cold Email', picSalesEFM: 'Emma',
    stage: 'Converted', tanggal: '2026-05-15', catatanAwal: 'Cold email ke divisi HRD, dibalas GM HR',
    teleponUmum: '021-5557890', alamatLengkap: 'Jl. Jend. Sudirman Kav. 56, Jakarta Pusat',
    linkGoogleMaps: '', namaKoordinator: 'Bpk. Hendra', jabatanKoordinator: 'HR Director',
    waKoordinator: '082112345678', emailKoordinator: 'hendra.hr@garudanusa.co.id',
    logAktivitas: [
      { tanggal: '2026-05-15', stage: 'New',       catatan: 'Cold email ke HRD Garuda Nusa',              picEFM: 'Emma' },
      { tanggal: '2026-05-22', stage: 'Approach',  catatan: 'Presentasi online ke HR Director',           picEFM: 'Emma' },
      { tanggal: '2026-06-01', stage: 'Converted', catatan: 'Proposal disetujui, kontrak ditandatangani', picEFM: 'Emma' },
    ],
    konsultasiId: 'KNS-26-0002', orderIds: ['EV-26-0002'],
  },
  {
    id: 'LE-0003', namaKlien: 'Brand Tropicana Slim', tipeKlien: 'Brand', kota: 'Tangerang Selatan',
    namaEvent: 'Healthy Living Expo', jenisEvent: 'Exhibition',
    emailUmum: 'marketing@tropicanaslim.co.id', sumberLead: 'LinkedIn', picSalesEFM: 'Bagoes',
    stage: 'Proposal', tanggal: '2026-06-05', catatanAwal: 'Kontak via LinkedIn dari Brand Manager',
    teleponUmum: '021-6667890', alamatLengkap: 'Kawasan ICE BSD City, Tangerang Selatan',
    linkGoogleMaps: '', namaKoordinator: 'Bpk. Dani', jabatanKoordinator: 'Brand Manager',
    waKoordinator: '081398765432', emailKoordinator: 'dani@tropicanaslim.co.id',
    logAktivitas: [
      { tanggal: '2026-06-05', stage: 'New',      catatan: 'Kontak masuk dari LinkedIn',            picEFM: 'Bagoes' },
      { tanggal: '2026-06-10', stage: 'Proposal', catatan: 'Konsultasi selesai, kirim proposal EFM', picEFM: 'Bagoes' },
    ],
    konsultasiId: 'KNS-26-0003', orderIds: [],
  },
  {
    id: 'LE-0004', namaKlien: 'Komunitas Pelari Jakarta', tipeKlien: 'Community', kota: 'Jakarta Pusat',
    namaEvent: 'Jakarta Night Run 2026', jenisEvent: 'Night Run',
    emailUmum: 'info@komunitas-pelari.id', sumberLead: 'Instagram', picSalesEFM: 'Emma',
    stage: 'Lost', tanggal: '2026-06-08', catatanAwal: 'DM Instagram dari ketua komunitas',
    teleponUmum: '', alamatLengkap: 'Monas, Jakarta Pusat', linkGoogleMaps: '',
    namaKoordinator: 'Bpk. Fajar', jabatanKoordinator: 'Ketua Komunitas',
    waKoordinator: '085678901234', emailKoordinator: '',
    logAktivitas: [
      { tanggal: '2026-06-08', stage: 'New',  catatan: 'DM Instagram, budget sangat terbatas',           picEFM: 'Emma' },
      { tanggal: '2026-06-14', stage: 'Lost', catatan: 'Tidak lanjut — margin tidak memenuhi threshold', picEFM: 'Emma' },
    ],
    konsultasiId: 'KNS-26-0004', orderIds: [],
  },
  {
    id: 'LE-0005', namaKlien: 'Dinas Pemuda & Olahraga DKI', tipeKlien: 'Government', kota: 'Jakarta Pusat',
    namaEvent: 'Hari Olahraga Nasional DKI', jenisEvent: 'Mass Event',
    emailUmum: 'info@dinpora.jakarta.go.id', sumberLead: 'Referral', picSalesEFM: 'Bagoes',
    stage: 'Closing', tanggal: '2026-06-10', catatanAwal: 'Referral dari koneksi pemerintah daerah',
    teleponUmum: '021-3451234', alamatLengkap: 'Jl. Medan Merdeka Utara No. 14, Jakarta Pusat',
    linkGoogleMaps: '', namaKoordinator: 'Bpk. Eko Prasetyo', jabatanKoordinator: 'Kepala Bidang Olahraga',
    waKoordinator: '087865432100', emailKoordinator: 'eko.prasetyo@dinpora.jakarta.go.id',
    logAktivitas: [
      { tanggal: '2026-06-10', stage: 'New',          catatan: 'Lead masuk via referral pemerintah',         picEFM: 'Bagoes' },
      { tanggal: '2026-06-15', stage: 'Presentation', catatan: 'Presentasi resmi ke Kepala Bidang Olahraga', picEFM: 'Bagoes' },
      { tanggal: '2026-06-18', stage: 'Closing',      catatan: 'Konsultasi selesai, masuk proses tender',    picEFM: 'Bagoes' },
    ],
    konsultasiId: 'KNS-26-0005', orderIds: ['EV-26-0003'],
  },
  {
    id: 'LE-0006', namaKlien: 'PT. Telkom Indonesia', tipeKlien: 'Corporate', kota: 'Jakarta Selatan',
    namaEvent: 'Telkom SportFest 2026', jenisEvent: 'Corporate Sports Day',
    emailUmum: 'hrd@telkom.co.id', sumberLead: 'Cold Email', picSalesEFM: 'Bagoes',
    stage: 'Approach', tanggal: '2026-06-20', catatanAwal: 'Cold email ke tim HRD Telkom, direspons positif',
    teleponUmum: '021-1234567', alamatLengkap: 'Jl. Japati No. 1, Jakarta Selatan', linkGoogleMaps: '',
    namaKoordinator: '', jabatanKoordinator: '', waKoordinator: '', emailKoordinator: '',
    logAktivitas: [
      { tanggal: '2026-06-20', stage: 'New',      catatan: 'Cold email ke HRD Telkom Indonesia', picEFM: 'Bagoes' },
      { tanggal: '2026-06-25', stage: 'Approach', catatan: 'Balas email — minta meeting awal',   picEFM: 'Bagoes' },
    ],
    konsultasiId: null, orderIds: [],
  },
]

let _leads = null

export function initLeads(seed) {
  if (_leads === null) _leads = [...seed]
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
  return 'LE-' + String(n).padStart(4, '0')
}

export { LEADS_INIT }
