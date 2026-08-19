export const eventStats = {
  eventAktif: 6,
  upcomingEvent: 4,
  revenueEvent: 'Rp 32jt',
  leadsPipeline: 11,
}

export const eventList = [
  { id: 'EV-T001', nama: 'Fun Run 5K',        klien: 'Apt. Green Lake',    tanggal: '15 Jun 2026', peserta: '120 org', status: 'upcoming' },
  { id: 'EV-T002', nama: 'Corporate Yoga Day', klien: 'PT. Maju Bersama',  tanggal: '20 Jun 2026', peserta: '45 org',  status: 'upcoming' },
  { id: 'EV-T003', nama: 'Fitness Workshop',   klien: 'Open Public',       tanggal: '10 Jun 2026', peserta: '80 org',  status: 'ongoing'  },
  { id: 'EV-T004', nama: 'Zumba Festival',     klien: 'Apt. Sudirman Park',tanggal: '5 Jun 2026',  peserta: '200 org', status: 'done'     },
]

export const eventTimeline = [
  { nama: 'Fitness Workshop',        desc: 'Setup venue & registrasi peserta', tanggal: 'Hari ini', warna: '#27AE60' },
  { nama: 'Meeting klien Fun Run',   desc: 'Finalisasi rute & logistik',       tanggal: 'Besok',    warna: '#E05945' },
  { nama: 'Corporate Yoga Day',      desc: 'Konfirmasi instruktur & venue',    tanggal: '13 Jun',   warna: '#2980B9' },
]

export const eventLeadsPipeline = [
  { nama: 'PT. Sinar Abadi',   stage: 'closing'  },
  { nama: 'Apt. Permata Hijau', stage: 'proposal' },
  { nama: 'CV. Global Tech',   stage: 'new'      },
]

export const revenueChart = [
  { bulan: 'Jan', nilai: 50, highlight: false },
  { bulan: 'Feb', nilai: 65, highlight: false },
  { bulan: 'Mar', nilai: 40, highlight: false },
  { bulan: 'Apr', nilai: 80, highlight: true  },
  { bulan: 'Mei', nilai: 60, highlight: false },
  { bulan: 'Jun', nilai: 75, highlight: true  },
]

export const eventLeads = [
  { id: '#EV-001', klien: 'PT. Sinar Abadi',    jenisEvent: 'Fun Run 10K',      estPeserta: '200 org', estNilai: 'Rp 25jt', stage: 'closing',    tanggal: '10 Jun 2026', pic: 'Andi',  noHp: '0812-1111-2222', catatan: 'Siap closing, butuh finalisasi kontrak' },
  { id: '#EV-002', klien: 'Apt. Permata Hijau',  jenisEvent: 'Zumba Festival',   estPeserta: '150 org', estNilai: 'Rp 15jt', stage: 'proposal',   tanggal: '8 Jun 2026',  pic: 'Budi',  noHp: '0813-2222-3333', catatan: 'Menunggu approval manajemen apartemen' },
  { id: '#EV-003', klien: 'CV. Global Tech',     jenisEvent: 'Corporate Yoga',   estPeserta: '60 org',  estNilai: 'Rp 8jt',  stage: 'presentasi', tanggal: '5 Jun 2026',  pic: 'Citra', noHp: '0814-3333-4444', catatan: 'Sudah presentasi, menunggu keputusan' },
  { id: '#EV-004', klien: 'Open Public',         jenisEvent: 'Fitness Workshop', estPeserta: '80 org',  estNilai: 'Rp 6jt',  stage: 'new',        tanggal: '3 Jun 2026',  pic: 'Andi',  noHp: '0815-4444-5555', catatan: 'Lead baru, belum ada meeting' },
  { id: '#EV-005', klien: 'Apt. Green Lake',     jenisEvent: 'Fun Run 5K',       estPeserta: '120 org', estNilai: 'Rp 25jt', stage: 'closing',    tanggal: '1 Jun 2026',  pic: 'Ahmad', noHp: '0816-5555-6666', catatan: 'Kontrak sudah disiapkan' },
  { id: '#EV-006', klien: 'PT. Maju Bersama',   jenisEvent: 'Corporate Yoga',   estPeserta: '45 org',  estNilai: 'Rp 12jt', stage: 'proposal',   tanggal: '28 Mei 2026', pic: 'Budi',  noHp: '0817-6666-7777', catatan: 'Proposal dikirim, menunggu revisi' },
  { id: '#EV-007', klien: 'Apt. Sudirman Park', jenisEvent: 'Zumba Festival',   estPeserta: '200 org', estNilai: 'Rp 20jt', stage: 'closing',    tanggal: '25 Mei 2026', pic: 'Ahmad', noHp: '0818-7777-8888', catatan: 'Event terkonfirmasi' },
  { id: '#EV-008', klien: 'PT. Kreasi Indo',    jenisEvent: 'Fun Run',          estPeserta: '300 org', estNilai: 'Rp 35jt', stage: 'gagal',      tanggal: '20 Mei 2026', pic: 'Citra', noHp: '0819-8888-9999', catatan: 'Budget tidak sesuai ekspektasi klien' },
]

export const eventLeadsStats = {
  totalLeads: 24,
  hotLeads: 6,
  converted: 8,
  gagal: 2,
}

export const eventTrackerCards = [
  {
    id: 'EV-T001',
    nama: 'Fun Run 5K',
    klien: 'Apartemen Green Lake',
    status: 'upcoming',
    tanggal: '15 Jun 2026',
    lokasi: 'Area Apartemen',
    peserta: '120 peserta',
    progress: 70,
    pic: 'Ahmad',
    checklist: [
      { label: 'Konfirmasi venue & rute',         status: 'done'    },
      { label: 'Registrasi peserta open',         status: 'done'    },
      { label: 'Finalisasi logistik & perlengkapan', status: 'urgent' },
      { label: 'Briefing tim EFM',                status: 'pending' },
    ],
  },
  {
    id: 'EV-T002',
    nama: 'Corporate Yoga Day',
    klien: 'PT. Maju Bersama',
    status: 'upcoming',
    tanggal: '20 Jun 2026',
    lokasi: 'Gedung PT. Maju',
    peserta: '45 peserta',
    progress: 40,
    pic: 'Budi',
    checklist: [
      { label: 'Konfirmasi instruktur yoga',           status: 'done'    },
      { label: 'Konfirmasi venue & sound system',      status: 'urgent'  },
      { label: 'Kirim undangan ke peserta',            status: 'pending' },
      { label: 'Siapkan perlengkapan yoga mat',        status: 'pending' },
    ],
  },
  {
    id: 'EV-T003',
    nama: 'Fitness Workshop',
    klien: 'Open Public',
    status: 'ongoing',
    tanggal: '10 Jun 2026',
    lokasi: 'Studio EFM',
    peserta: '80 peserta',
    progress: 95,
    pic: 'Citra',
    checklist: [
      { label: 'Semua persiapan selesai',    status: 'done'   },
      { label: 'Peserta terdaftar: 78/80',   status: 'done'   },
      { label: 'Materi workshop siap',       status: 'done'   },
      { label: 'Sisa 2 slot — tutup registrasi', status: 'urgent' },
    ],
  },
  {
    id: 'EV-T004',
    nama: 'Zumba Festival',
    klien: 'Apartemen Sudirman Park',
    status: 'done',
    tanggal: '5 Jun 2026',
    lokasi: '—',
    peserta: '198 hadir',
    progress: 100,
    pic: 'Ahmad',
    checklist: [
      { label: 'Event berjalan lancar',              status: 'done' },
      { label: 'Laporan post-event dikirim',         status: 'done' },
      { label: 'Invoice sudah lunas',                status: 'done' },
      { label: 'Foto & dokumentasi tersimpan',       status: 'done' },
    ],
  },
]

export const eventDocuments = [
  {
    id: '#EV-DOC-001', klien: 'Apartemen Green Lake',    jenis: 'Kontrak', tglUpload: '1 Jan 2026',  berlakuHingga: '31 Des 2026',
    status: 'signed',
    revisions: [
      { version: 'v1', fileName: 'kontrak-green-lake-ev-v1.pdf', uploadedAt: '1 Jan 2026' },
      { version: 'v2', fileName: 'kontrak-green-lake-ev-v2.pdf', uploadedAt: '8 Jan 2026' },
    ],
    googleDocsUrl: 'https://docs.google.com/document/d/ev-example-001',
  },
  {
    id: '#EV-DOC-002', klien: 'PT. Maju Bersama',        jenis: 'MOU',     tglUpload: '5 Jan 2026',  berlakuHingga: '31 Des 2026',
    status: 'on_review',
    revisions: [
      { version: 'v1', fileName: 'mou-maju-bersama-ev-v1.pdf', uploadedAt: '5 Jan 2026' },
    ],
    googleDocsUrl: '',
  },
  {
    id: '#EV-DOC-003', klien: 'Apartemen Sudirman Park', jenis: 'Kontrak', tglUpload: '10 Jan 2026', berlakuHingga: '5 Jul 2026',
    status: 'signed',
    revisions: [
      { version: 'v1', fileName: 'kontrak-sudirman-park-ev-v1.pdf', uploadedAt: '10 Jan 2026' },
    ],
    googleDocsUrl: '',
  },
  {
    id: '#EV-DOC-004', klien: 'CV. Teknologi Prima',     jenis: 'LOI',     tglUpload: '15 Des 2025', berlakuHingga: '22 Jun 2026',
    status: 'revision',
    revisions: [
      { version: 'v1', fileName: 'loi-teknologi-prima-ev-v1.pdf', uploadedAt: '15 Des 2025' },
      { version: 'v2', fileName: 'loi-teknologi-prima-ev-v2.pdf', uploadedAt: '3 Jan 2026' },
    ],
    googleDocsUrl: 'https://docs.google.com/document/d/ev-example-004',
  },
  {
    id: '#EV-DOC-005', klien: 'PT. Sinar Abadi',         jenis: 'MOU',     tglUpload: '20 Jan 2026', berlakuHingga: '20 Jan 2027',
    status: 'signed',
    revisions: [
      { version: 'v1', fileName: 'mou-sinar-abadi-ev-v1.pdf', uploadedAt: '20 Jan 2026' },
    ],
    googleDocsUrl: '',
  },
  {
    id: '#EV-DOC-006', klien: 'Apartemen Permata Hijau', jenis: 'Kontrak', tglUpload: '3 Feb 2026',  berlakuHingga: '3 Feb 2027',
    status: 'drafting',
    revisions: [],
    googleDocsUrl: 'https://docs.google.com/document/d/ev-example-006',
  },
]

export const EV_DOC_STATUS_CLS = {
  drafting:  'bg-gray-100 text-gray-500 border border-gray-200',
  on_review: 'bg-[#EBF5FB] text-[#1A5276] border border-[#AED6F1]',
  revision:  'bg-[#FEF9E7] text-[#B7770D] border border-[#FAD7A0]',
  signed:    'bg-[#EAFAF1] text-[#1E8449] border border-[#A9DFBF]',
}
export const EV_DOC_STATUS_LABEL = {
  drafting: 'Drafting', on_review: 'On Review', revision: 'Revision', signed: 'Signed',
}

export const eventInvoice = {
  noInvoice: 'INV/EFM/EV/2026/0001',
  tanggal: '10 Jun 2026',
  jatuhTempo: '13 Jun 2026',
  status: 'pending',
  klien: {
    nama: 'Apartemen Green Lake',
    pic: 'Pak Hendra',
    email: 'hendra@greenlake.co.id',
    noHp: '+62 812-1234-5678',
  },
  event: {
    jenis: 'Fun Run 5K',
    tanggal: '15 Jun 2026',
    lokasi: 'Area Apartemen Green Lake',
    peserta: '120 orang',
    picEfm: 'Ahmad',
  },
  items: [
    { desc: 'Jasa Penyelenggaraan Fun Run 5K', note: 'Termasuk: race kit, medali, timing chip, water station x3, finisher area.', qty: '1 event',   harga: 18000000 },
    { desc: 'Kaos Peserta',                   note: '120 pcs kaos event branded',                                                  qty: '120 pcs',  harga: 5400000  },
    { desc: 'Dokumentasi Foto & Video',       note: '1 fotografer + 1 videografer. Hasil dalam 3 hari kerja.',                     qty: '1 paket',  harga: 1600000  },
  ],
  diskon: 0,
  pembayaran: {
    bank: 'BCA',
    noRek: '123-456-7890',
    atas: 'CV. Bugar Nusantara Jaya',
  },
  syarat: 'Pelunasan dilakukan H-2 sebelum event. Pembatalan H-7 dikenakan biaya 50%. Pembatalan H-3 dikenakan biaya 100%.',
}

export const eventRevenueStats = {
  revenueMonth: 'Rp 48jt',
  totalKlien: 24,
  rataRata: 'Rp 2jt',
}

export const eventRevenueChart = [
  { bulan: 'Jan', corporate: 50, apartment: 30 },
  { bulan: 'Feb', corporate: 55, apartment: 35 },
  { bulan: 'Mar', corporate: 45, apartment: 28 },
  { bulan: 'Apr', corporate: 65, apartment: 40 },
  { bulan: 'Mei', corporate: 60, apartment: 38 },
  { bulan: 'Jun', corporate: 72, apartment: 45 },
]

export const eventRevenueKlien = [
  { nama: 'Apartemen Green Lake',     jenis: 'Apartment', nilaiKontrak: 'Rp 8,5jt/bln', statusBayar: 'lunas',   sisaKontrak: '180 hari',      sisaColor: 'green'  },
  { nama: 'PT. Maju Bersama',        jenis: 'Corporate', nilaiKontrak: 'Rp 12jt/bln',  statusBayar: 'cicilan', sisaKontrak: '90 hari',       sisaColor: 'green'  },
  { nama: 'Apartemen Sudirman Park',  jenis: 'Apartment', nilaiKontrak: 'Rp 6jt/bln',   statusBayar: 'lunas',   sisaKontrak: '25 hari ⚠️',   sisaColor: 'yellow' },
  { nama: 'CV. Teknologi Prima',     jenis: 'Corporate', nilaiKontrak: 'Rp 9jt/bln',   statusBayar: 'telat',   sisaKontrak: '12 hari 🔴',    sisaColor: 'red'    },
  { nama: 'Apartemen Permata Hijau',  jenis: 'Apartment', nilaiKontrak: 'Rp 5,5jt/bln', statusBayar: 'lunas',   sisaKontrak: '120 hari',      sisaColor: 'green'  },
]
