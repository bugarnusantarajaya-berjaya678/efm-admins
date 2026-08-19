/* ── Shared helpers ── */
export function formatRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}
export function formatRpShort(n) {
  if (n >= 1_000_000_000) return 'Rp ' + (n / 1_000_000_000).toFixed(1).replace('.', ',') + 'M'
  if (n >= 1_000_000)     return 'Rp ' + (n / 1_000_000).toFixed(0) + 'jt'
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}

/* ── Dashboard ── */
export const B2B_STATS = {
  kontrakAktif:     24,
  revenueBulanIni:  48_000_000,
  revenueGrowth:    8,
  leadsPipeline:    18,
  hotLeads:         5,
  kontrakHabis:     3,
}

export const KLIEN_AKTIF = [
  { nama: 'Apartemen Green Lake',       jenis: 'Apartment', nilaiKontrak: '8,5jt/bln', sisaHari: 180, payStatus: 'lunas' },
  { nama: 'PT. Maju Bersama',           jenis: 'Corporate', nilaiKontrak: '12jt/bln',  sisaHari: 90,  payStatus: 'cicilan' },
  { nama: 'Apartemen Sudirman Park',    jenis: 'Apartment', nilaiKontrak: '6jt/bln',   sisaHari: 25,  payStatus: 'lunas' },
  { nama: 'CV. Teknologi Prima',        jenis: 'Corporate', nilaiKontrak: '9jt/bln',   sisaHari: 12,  payStatus: 'telat' },
  { nama: 'PT. Sinar Abadi',            jenis: 'Corporate', nilaiKontrak: '15jt/bln',  sisaHari: 210, payStatus: 'lunas' },
  { nama: 'Apartemen The Residence',    jenis: 'Apartment', nilaiKontrak: '7,5jt/bln', sisaHari: 145, payStatus: 'lunas' },
]

export const EXPIRING_CONTRACTS = [
  { nama: 'Gedung Perkantoran Graha',  tglHabis: '18 Jun 2026', sisaHari: 8  },
  { nama: 'CV. Teknologi Prima',       tglHabis: '22 Jun 2026', sisaHari: 12 },
  { nama: 'Apartemen Sudirman Park',   tglHabis: '5 Jul 2026',  sisaHari: 25 },
]

export const LEADS_PIPELINE_DASH = [
  { nama: 'PT. Sinar Abadi',    stage: 'Proposal'   },
  { nama: 'Apt. Green Valley',  stage: 'New'        },
  { nama: 'PT. Global Tech',    stage: 'Closing'    },
]

export const REVENUE_CHART = [
  { bulan: 'Jan', nilai: 35_000_000 },
  { bulan: 'Feb', nilai: 42_000_000 },
  { bulan: 'Mar', nilai: 30_000_000 },
  { bulan: 'Apr', nilai: 50_000_000, highlight: true },
  { bulan: 'Mei', nilai: 44_000_000 },
  { bulan: 'Jun', nilai: 48_000_000, highlight: true },
]

/* ── Stage labels & colors ── */
export const STAGE_CLS = {
  New:         'bg-[#EBF5FB] text-[#2980B9]',
  Proposal:    'bg-[#F5EEF8] text-[#8E44AD]',
  Presentasi:  'bg-[#FEF9E7] text-[#F39C12]',
  Closing:     'bg-[#EAFAF1] text-[#27AE60]',
  Gagal:       'bg-[#FDEDEC] text-[#E74C3C]',
  Converted:   'bg-[#EBF5FB] text-[#1A5276]',
}

/* ── Pay status ── */
export const PAY_CLS = {
  lunas:   'bg-[#EAFAF1] text-[#27AE60]',
  cicilan: 'bg-[#FEF9E7] text-[#F39C12]',
  telat:   'bg-[#FDEDEC] text-[#E74C3C]',
  pending: 'bg-[#FEF9E7] text-[#F39C12]',
}
export const PAY_LABEL = {
  lunas: 'Lunas', cicilan: 'Cicilan', telat: 'Telat', pending: 'Pending',
}

/* ── Corporate Leads ── */
export const CORP_LEADS_INIT = [
  { id: 'BC-001', nama: 'PT. Maju Bersama',         pic: 'Budi Santoso',   noHp: '0812-1111-2222', nilaiEst: 'Rp 12jt/bln',  stage: 'Closing',    tgl: '10 Jun 2026' },
  { id: 'BC-002', nama: 'CV. Teknologi Prima',       pic: 'Rina Dewi',      noHp: '0813-2222-3333', nilaiEst: 'Rp 9jt/bln',   stage: 'Proposal',   tgl: '8 Jun 2026'  },
  { id: 'BC-003', nama: 'PT. Sinar Abadi',           pic: 'Ahmad Fauzi',    noHp: '0814-3333-4444', nilaiEst: 'Rp 15jt/bln',  stage: 'Presentasi', tgl: '5 Jun 2026'  },
  { id: 'BC-004', nama: 'PT. Global Tech',           pic: 'Sari Indah',     noHp: '0815-4444-5555', nilaiEst: 'Rp 20jt/bln',  stage: 'New',        tgl: '3 Jun 2026'  },
  { id: 'BC-005', nama: 'PT. Nusa Karya',            pic: 'Deni Wahyudi',   noHp: '0816-5555-6666', nilaiEst: 'Rp 18jt/bln',  stage: 'Proposal',   tgl: '1 Jun 2026'  },
  { id: 'BC-006', nama: 'CV. Mitra Sejahtera',       pic: 'Yuni Rahayu',    noHp: '0817-6666-7777', nilaiEst: 'Rp 7jt/bln',   stage: 'Closing',    tgl: '28 Mei 2026' },
  { id: 'BC-007', nama: 'PT. Andalan Utama',         pic: 'Rizki Santoso',  noHp: '0818-7777-8888', nilaiEst: 'Rp 25jt/bln',  stage: 'Presentasi', tgl: '25 Mei 2026' },
  { id: 'BC-008', nama: 'Gedung Perkantoran Graha',  pic: 'Eko Prasetyo',   noHp: '0819-8888-9999', nilaiEst: 'Rp 11jt/bln',  stage: 'Gagal',      tgl: '20 Mei 2026' },
  { id: 'BC-009', nama: 'PT. Kreasi Digital',        pic: 'Fitri Handayani',noHp: '0811-9999-0000', nilaiEst: 'Rp 14jt/bln',  stage: 'New',        tgl: '15 Mei 2026' },
  { id: 'BC-010', nama: 'CV. Sentosa Mandiri',       pic: 'Hendra Wijaya',  noHp: '0812-0000-1111', nilaiEst: 'Rp 8jt/bln',   stage: 'Converted',  tgl: '10 Mei 2026' },
]

/* ── PIC EFM options ── */
export const PIC_EFM_OPTS = [
  'Ahmad — Area Jakarta Selatan',
  'Budi — Area Jakarta Barat',
  'Citra — Area Jakarta Pusat',
  'Diana — Area Jakarta Utara',
]

/* ── Apartment Leads ── */
export const APT_LEADS_INIT = [
  { id: 'BA-001', nama: 'Apartemen Green Lake',      pic: 'Dewi Sartika',   noHp: '0812-2111-3222', nilaiEst: 'Rp 8,5jt/bln', stage: 'Closing',    tgl: '12 Jun 2026' },
  { id: 'BA-002', nama: 'Apartemen Sudirman Park',   pic: 'Rudi Hermawan',  noHp: '0813-3222-4333', nilaiEst: 'Rp 6jt/bln',   stage: 'Closing',    tgl: '9 Jun 2026'  },
  { id: 'BA-003', nama: 'Apartemen The Residence',   pic: 'Anita Lestari',  noHp: '0814-4333-5444', nilaiEst: 'Rp 7,5jt/bln', stage: 'Proposal',   tgl: '6 Jun 2026'  },
  { id: 'BA-004', nama: 'Apartemen Green Valley',    pic: 'Bimo Aji',       noHp: '0815-5444-6555', nilaiEst: 'Rp 5jt/bln',   stage: 'New',        tgl: '4 Jun 2026'  },
  { id: 'BA-005', nama: 'Apartemen Kuningan City',   pic: 'Lina Septiani',  noHp: '0816-6555-7666', nilaiEst: 'Rp 9jt/bln',   stage: 'Presentasi', tgl: '1 Jun 2026'  },
  { id: 'BA-006', nama: 'Apartemen Pakubuwono',      pic: 'Yusuf Ramadan',  noHp: '0817-7666-8777', nilaiEst: 'Rp 12jt/bln',  stage: 'Proposal',   tgl: '28 Mei 2026' },
  { id: 'BA-007', nama: 'Apartemen Casablanca',      pic: 'Mega Wulandari', noHp: '0818-8777-9888', nilaiEst: 'Rp 6,5jt/bln', stage: 'Gagal',      tgl: '22 Mei 2026' },
  { id: 'BA-008', nama: 'Apartemen Thamrin 9',       pic: 'Budi Santoso',   noHp: '0819-9888-0999', nilaiEst: 'Rp 10jt/bln',  stage: 'Converted',  tgl: '15 Mei 2026' },
]

/* ── B2B Documents (Pemberkasan) ── */
export const B2B_DOCS_INIT = [
  {
    id: 'B2B-001', namaKlien: 'Apartemen Green Lake',    jenisKlien: 'Apartment', jenisDoc: 'Kontrak', pic: 'Budi — Area Jakarta Barat',
    tglDibuat: '1 Jan 2026', tglBerlaku: '31 Des 2026', nilaiKontrak: 'Rp 8,5jt/bln', status: 'signed',
    revisions: [
      { version: 'v1', fileName: 'kontrak-green-lake-v1.pdf', uploadedAt: '1 Jan 2026' },
      { version: 'v2', fileName: 'kontrak-green-lake-v2.pdf', uploadedAt: '10 Jan 2026' },
    ],
    googleDocsUrl: 'https://docs.google.com/document/d/example-001',
  },
  {
    id: 'B2B-002', namaKlien: 'PT. Maju Bersama',        jenisKlien: 'Corporate', jenisDoc: 'MOU',     pic: 'Ahmad — Area Jakarta Selatan',
    tglDibuat: '5 Jan 2026', tglBerlaku: '31 Des 2026', nilaiKontrak: 'Rp 12jt/bln', status: 'on_review',
    revisions: [
      { version: 'v1', fileName: 'mou-maju-bersama-v1.pdf', uploadedAt: '5 Jan 2026' },
    ],
    googleDocsUrl: '',
  },
  {
    id: 'B2B-003', namaKlien: 'Apartemen Sudirman Park', jenisKlien: 'Apartment', jenisDoc: 'Kontrak', pic: 'Ahmad — Area Jakarta Selatan',
    tglDibuat: '10 Jan 2026', tglBerlaku: '5 Jul 2026', nilaiKontrak: 'Rp 6jt/bln', status: 'signed',
    revisions: [
      { version: 'v1', fileName: 'kontrak-sudirman-park-v1.pdf', uploadedAt: '10 Jan 2026' },
    ],
    googleDocsUrl: 'https://docs.google.com/document/d/example-003',
  },
  {
    id: 'B2B-004', namaKlien: 'CV. Teknologi Prima',     jenisKlien: 'Corporate', jenisDoc: 'LOI',     pic: 'Citra — Area Jakarta Pusat',
    tglDibuat: '15 Des 2025', tglBerlaku: '22 Jun 2026', nilaiKontrak: 'Rp 9jt/bln', status: 'revision',
    revisions: [
      { version: 'v1', fileName: 'loi-teknologi-prima-v1.pdf', uploadedAt: '15 Des 2025' },
      { version: 'v2', fileName: 'loi-teknologi-prima-v2.pdf', uploadedAt: '5 Jan 2026' },
      { version: 'v3', fileName: 'loi-teknologi-prima-v3.pdf', uploadedAt: '20 Jan 2026' },
    ],
    googleDocsUrl: '',
  },
  {
    id: 'B2B-005', namaKlien: 'PT. Sinar Abadi',         jenisKlien: 'Corporate', jenisDoc: 'Kontrak', pic: 'Diana — Area Jakarta Utara',
    tglDibuat: '5 Jun 2026', tglBerlaku: '5 Jun 2027', nilaiKontrak: 'Rp 15jt/bln', status: 'on_review',
    revisions: [
      { version: 'v1', fileName: 'kontrak-sinar-abadi-v1.pdf', uploadedAt: '5 Jun 2026' },
    ],
    googleDocsUrl: 'https://docs.google.com/document/d/example-005',
  },
  {
    id: 'B2B-006', namaKlien: 'Apartemen The Residence', jenisKlien: 'Apartment', jenisDoc: 'MOU',     pic: 'Budi — Area Jakarta Barat',
    tglDibuat: '6 Jun 2026', tglBerlaku: '6 Jun 2027', nilaiKontrak: 'Rp 7,5jt/bln', status: 'signed',
    revisions: [
      { version: 'v1', fileName: 'mou-the-residence-v1.pdf', uploadedAt: '6 Jun 2026' },
    ],
    googleDocsUrl: '',
  },
  {
    id: 'B2B-007', namaKlien: 'CV. Sentosa Mandiri',     jenisKlien: 'Corporate', jenisDoc: 'LOI',     pic: 'Citra — Area Jakarta Pusat',
    tglDibuat: '10 Mei 2026', tglBerlaku: '10 Mei 2027', nilaiKontrak: 'Rp 8jt/bln', status: 'drafting',
    revisions: [],
    googleDocsUrl: 'https://docs.google.com/document/d/example-007',
  },
  {
    id: 'B2B-008', namaKlien: 'CV. Mitra Sejahtera',     jenisKlien: 'Corporate', jenisDoc: 'Kontrak', pic: 'Citra — Area Jakarta Pusat',
    tglDibuat: '28 Mei 2026', tglBerlaku: '28 Mei 2027', nilaiKontrak: 'Rp 7jt/bln', status: 'drafting',
    revisions: [],
    googleDocsUrl: '',
  },
]

export const DOC_STATUS_CLS = {
  drafting:  'bg-gray-100 text-gray-500 border border-gray-200',
  on_review: 'bg-[#EBF5FB] text-[#1A5276] border border-[#AED6F1]',
  revision:  'bg-[#FEF9E7] text-[#B7770D] border border-[#FAD7A0]',
  signed:    'bg-[#EAFAF1] text-[#1E8449] border border-[#A9DFBF]',
}
export const DOC_STATUS_LABEL = {
  drafting: 'Drafting', on_review: 'On Review', revision: 'Revision', signed: 'Signed',
}

/* ── B2B Invoice ── */
export const B2B_INVOICES_INIT = [
  { invNo: 'INV/EFM/B2B/2026/0042', klien: 'PT. Maju Bersama',       jenis: 'Corporate', periode: 'Jun 2026', nilaiKontrak: 12_000_000, status: 'lunas',   tglInv: '1 Jun 2026',  tglBayar: '3 Jun 2026',  metodeBayar: 'Transfer Bank (BCA)' },
  { invNo: 'INV/EFM/B2B/2026/0041', klien: 'Apartemen Green Lake',   jenis: 'Apartment', periode: 'Jun 2026', nilaiKontrak: 8_500_000,  status: 'lunas',   tglInv: '1 Jun 2026',  tglBayar: '5 Jun 2026',  metodeBayar: 'Transfer Bank (Mandiri)' },
  { invNo: 'INV/EFM/B2B/2026/0040', klien: 'CV. Teknologi Prima',    jenis: 'Corporate', periode: 'Jun 2026', nilaiKontrak: 9_000_000,  status: 'telat',   tglInv: '1 Jun 2026',  tglBayar: null,          metodeBayar: null },
  { invNo: 'INV/EFM/B2B/2026/0039', klien: 'Apartemen Sudirman Park',jenis: 'Apartment', periode: 'Jun 2026', nilaiKontrak: 6_000_000,  status: 'pending', tglInv: '1 Jun 2026',  tglBayar: null,          metodeBayar: null },
  { invNo: 'INV/EFM/B2B/2026/0038', klien: 'PT. Sinar Abadi',        jenis: 'Corporate', periode: 'Jun 2026', nilaiKontrak: 15_000_000, status: 'lunas',   tglInv: '1 Jun 2026',  tglBayar: '2 Jun 2026',  metodeBayar: 'Transfer Bank (BCA)' },
  { invNo: 'INV/EFM/B2B/2026/0037', klien: 'Apartemen The Residence',jenis: 'Apartment', periode: 'Jun 2026', nilaiKontrak: 7_500_000,  status: 'lunas',   tglInv: '1 Jun 2026',  tglBayar: '4 Jun 2026',  metodeBayar: 'Transfer Bank (BCA)' },
  { invNo: 'INV/EFM/B2B/2026/0036', klien: 'PT. Maju Bersama',       jenis: 'Corporate', periode: 'Mei 2026', nilaiKontrak: 12_000_000, status: 'lunas',   tglInv: '1 Mei 2026',  tglBayar: '2 Mei 2026',  metodeBayar: 'Transfer Bank (BCA)' },
  { invNo: 'INV/EFM/B2B/2026/0035', klien: 'Apartemen Green Lake',   jenis: 'Apartment', periode: 'Mei 2026', nilaiKontrak: 8_500_000,  status: 'lunas',   tglInv: '1 Mei 2026',  tglBayar: '3 Mei 2026',  metodeBayar: 'Transfer Bank (Mandiri)' },
  { invNo: 'INV/EFM/B2B/2026/0034', klien: 'CV. Mitra Sejahtera',    jenis: 'Corporate', periode: 'Jun 2026', nilaiKontrak: 7_000_000,  status: 'pending', tglInv: '1 Jun 2026',  tglBayar: null,          metodeBayar: null },
]

export const B2B_INV_STATUS_CLS = {
  lunas:   'bg-[#EAFAF1] text-[#27AE60]',
  pending: 'bg-[#FEF9E7] text-[#D68910]',
  telat:   'bg-[#FDEDEC] text-[#E74C3C]',
}
export const B2B_INV_STATUS_LABEL = {
  lunas: 'Lunas', pending: 'Pending', telat: 'Telat',
}

export const B2B_BULAN_OPTS = [
  { value: 'Jun 2026', label: 'Juni 2026' },
  { value: 'Mei 2026', label: 'Mei 2026'  },
  { value: 'Apr 2026', label: 'April 2026' },
]

/* ── B2B Revenue ── */
export const REVENUE_MONTHLY = [
  { bulan: 'Jan 2026', corporate: 20_000_000, apartment: 15_000_000 },
  { bulan: 'Feb 2026', corporate: 24_000_000, apartment: 18_000_000 },
  { bulan: 'Mar 2026', corporate: 18_000_000, apartment: 12_000_000 },
  { bulan: 'Apr 2026', corporate: 30_000_000, apartment: 20_000_000 },
  { bulan: 'Mei 2026', corporate: 26_000_000, apartment: 18_000_000 },
  { bulan: 'Jun 2026', corporate: 30_000_000, apartment: 18_000_000 },
]

export const REVENUE_BY_CLIENT = [
  { nama: 'PT. Sinar Abadi',          jenis: 'Corporate', total: 15_000_000, bulan: 'Jun 2026', status: 'lunas' },
  { nama: 'PT. Maju Bersama',         jenis: 'Corporate', total: 12_000_000, bulan: 'Jun 2026', status: 'lunas' },
  { nama: 'Apartemen Green Lake',     jenis: 'Apartment', total: 8_500_000,  bulan: 'Jun 2026', status: 'lunas' },
  { nama: 'Apartemen The Residence',  jenis: 'Apartment', total: 7_500_000,  bulan: 'Jun 2026', status: 'lunas' },
  { nama: 'CV. Mitra Sejahtera',      jenis: 'Corporate', total: 7_000_000,  bulan: 'Jun 2026', status: 'pending' },
  { nama: 'Apartemen Sudirman Park',  jenis: 'Apartment', total: 6_000_000,  bulan: 'Jun 2026', status: 'pending' },
  { nama: 'CV. Teknologi Prima',      jenis: 'Corporate', total: 9_000_000,  bulan: 'Jun 2026', status: 'telat'   },
]
