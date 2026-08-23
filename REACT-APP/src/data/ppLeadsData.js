export const LEADS_INIT = [
  { id: 'LP-0001', nama: 'James Wilson',    noHp: '081234567890',   sumber: 'Website',    sumberIcon: '🌐', program: '12 Sesi - Pro',          status: 'closed-won',  tanggal: '20 Okt 2026', email: 'james.wilson@email.com',   catatan: 'Sudah convert ke Order PP-26-0013' },
  { id: 'LP-0002', nama: 'Emily Chen',      noHp: '082345678901',   sumber: 'Meta Ads',   sumberIcon: '📱', program: '4 Sesi - Starter',        status: 'closed-won',  tanggal: '18 Okt 2026', email: 'emily.chen@email.com',     catatan: 'Sudah convert ke Order PP-26-0012' },
  { id: 'LP-0003', nama: 'Budi Santoso',    noHp: '085678901234',   sumber: 'Walk-in',    sumberIcon: '🚶', program: '12 Sesi - Pro',          status: 'closed-won',  tanggal: '6 Okt 2026',  email: 'budi.santoso@email.com',   catatan: 'Sudah convert ke Order PP-26-0008' },
  { id: 'LP-0004', nama: 'Dewi Ayu',        noHp: '087766554433',   sumber: 'Referral',   sumberIcon: '👥', program: 'Tennis',                 status: 'closed-lost', tanggal: '7 Jun 2026',  email: 'dewi.ayu@email.com',       catatan: '' },
  { id: 'LP-0005', nama: 'Rian Maulana',    noHp: '081298765432',   sumber: 'Meta Ads',   sumberIcon: '📱', program: 'Fatloss & Bodyshape',    status: 'follow-up',   tanggal: '15 Jun 2026', email: 'rian.m@email.com',         catatan: 'Sudah follow up 2x, belum ada keputusan' },
  { id: 'LP-0006', nama: 'Siti Rahayu',     noHp: '082211334455',   sumber: 'WhatsApp',   sumberIcon: '💬', program: 'Yoga',                   status: 'new',         tanggal: '17 Jun 2026', email: '',                         catatan: '' },
  { id: 'LP-0007', nama: 'Kevin Hartanto',  noHp: '081177889900',   sumber: 'Google Ads', sumberIcon: '🔍', program: 'Strength & Muscle',      status: 'follow-up',   tanggal: '16 Jun 2026', email: 'kevin.h@email.com',        catatan: 'Tertarik paket 20 sesi' },
  { id: 'LP-0008', nama: 'Natasha Putri',   noHp: '085566778899',   sumber: 'Referral',   sumberIcon: '👥', program: 'Boxing',                 status: 'new',         tanggal: '18 Jun 2026', email: 'natasha.p@email.com',      catatan: 'Dirujuk oleh Budi Santoso' },
  { id: 'LP-0009', nama: 'Ahmad Fauzi',     noHp: '089900112233',   sumber: 'Walk-in',    sumberIcon: '🚶', program: 'Running',                status: 'closed-lost', tanggal: '5 Jun 2026',  email: '',                         catatan: 'Budget tidak sesuai' },
  { id: 'LP-0010', nama: 'Linda Wijaya',    noHp: '081344556677',   sumber: 'Website',    sumberIcon: '🌐', program: '4 Sesi - Starter',       status: 'new',         tanggal: '19 Jun 2026', email: 'linda.w@email.com',        catatan: '' },
  { id: 'LP-0011', nama: 'Doni Kusuma',     noHp: '082233445566',   sumber: 'Youtube Ads',sumberIcon: '▶️', program: 'Fatloss & Bodyshape',   status: 'follow-up',   tanggal: '14 Jun 2026', email: 'doni.k@email.com',         catatan: 'Minta proposal tertulis' },
  { id: 'LP-0012', nama: 'Fiona Santika',   noHp: '087711223344',   sumber: 'Meta Ads',   sumberIcon: '📱', program: 'Yoga',                   status: 'closed-won',  tanggal: '10 Jun 2026', email: 'fiona.s@email.com',        catatan: 'Sudah bayar DP' },
  { id: 'LP-0013', nama: 'Robert Taylor',   noHp: '083456789012',   sumber: 'Referral',   sumberIcon: '👥', program: '24 Sesi - Elite',        status: 'closed-won',  tanggal: '15 Okt 2026', email: 'robert.taylor@email.com',  catatan: 'Sudah convert ke Order PP-26-0011' },
  { id: 'LP-0014', nama: 'Anita Kumar',     noHp: '084567890123',   sumber: 'Meta Ads',   sumberIcon: '📱', program: '8 Sesi - Base',          status: 'closed-won',  tanggal: '12 Okt 2026', email: 'anita.kumar@email.com',    catatan: 'Sudah convert ke Order PP-26-0010' },
  { id: 'LP-0015', nama: 'Rina Kusuma',     noHp: '086789012345',   sumber: 'Walk-in',    sumberIcon: '🚶', program: '4 Sesi - Starter',       status: 'closed-won',  tanggal: '3 Okt 2026',  email: 'rina.kusuma@email.com',    catatan: 'Sudah convert ke Order PP-26-0007' },
  { id: 'LP-0016', nama: 'Hendra Wijaya',   noHp: '087890123456',   sumber: 'Website',    sumberIcon: '🌐', program: '24 Sesi - Elite',        status: 'closed-won',  tanggal: '28 Sep 2026', email: 'hendra.wijaya@email.com',  catatan: 'Sudah convert ke Order PP-26-0006' },
  { id: 'LP-0017', nama: 'Dewi Rahayu',     noHp: '088901234567',   sumber: 'Referral',   sumberIcon: '👥', program: '8 Sesi - Base',          status: 'closed-won',  tanggal: '22 Sep 2026', email: 'dewi.rahayu@email.com',    catatan: 'Sudah convert ke Order PP-26-0005' },
]

export const STATUS_LABEL = {
  'new':         'New',
  'follow-up':   'Follow Up',
  'closed-won':  'Closed Won',
  'closed-lost': 'Closed Lost',
}

export const SUMBER_OPTS = ['Meta Ads', 'Youtube Ads', 'Google Ads', 'Website', 'Referral', 'Walk-in', 'WhatsApp']
export const PROGRAM_OPTS = ['Fatloss & Bodyshape', 'Strength & Muscle', 'Boxing', 'Yoga', 'Tennis', 'Running', '4 Sesi - Starter', '12 Sesi - Pro', 'Lainnya']

export const SUMBER_ICON = {
  'meta ads': '📱', 'youtube ads': '▶️', 'google ads': '🔍',
  'website': '🌐', 'referral': '👥', 'walk-in': '🚶', 'whatsapp': '💬',
}

const AVATAR_COLORS = ['#E05945','#2980B9','#27AE60','#8E44AD','#F39C12','#16A085','#E67E22','#D35400']
export function avatarColor(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
export function initials(name) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}
