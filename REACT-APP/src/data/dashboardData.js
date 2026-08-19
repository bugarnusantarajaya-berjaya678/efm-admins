export const kpiData = [
  {
    id: 'pic',
    label: 'Total PIC Aktif',
    value: 24,
    change: '+3 vs bulan lalu',
    changeUp: true,
    color: 'orange',
  },
  {
    id: 'assignment',
    label: 'Assignment Aktif',
    value: 31,
    change: '+5 vs bulan lalu',
    changeUp: true,
    color: 'navy',
  },
  {
    id: 'sesi',
    label: 'Sesi Bulan Ini',
    value: 148,
    change: '↑ 8% vs bulan lalu',
    changeUp: true,
    color: 'green',
  },
  {
    id: 'revenue',
    label: 'Revenue Bulan Ini',
    value: 'Rp 84.500.000',
    change: '↑ 12% vs bulan lalu',
    changeUp: true,
    color: 'blue',
  },
]

export const assignmentData = [
  { no: 1, pic: 'Andi Pratama',    klien: 'Sarah Jenkins',   program: 'Personal Training 10x', status: 'Aktif',     tanggal: '10 Jun 2026' },
  { no: 2, pic: 'Budi Santoso',    klien: 'Michael Chang',   program: 'Monthly Retainer',       status: 'Aktif',     tanggal: '9 Jun 2026' },
  { no: 3, pic: 'Citra Dewi',      klien: 'Amanda Lee',      program: 'Personal Training 5x',   status: 'Pending',   tanggal: '8 Jun 2026' },
  { no: 4, pic: 'Doni Kusuma',     klien: 'Rizky Pratama',   program: 'Yoga & Pilates 10x',     status: 'Aktif',     tanggal: '7 Jun 2026' },
  { no: 5, pic: 'Eka Wijaya',      klien: 'Hana Pertiwi',    program: 'Strength Training 8x',   status: 'Selesai',   tanggal: '6 Jun 2026' },
  { no: 6, pic: 'Fajar Nugroho',   klien: 'PT Maju Bersama', program: 'Corporate Fitness 20x',  status: 'Aktif',     tanggal: '5 Jun 2026' },
  { no: 7, pic: 'Gita Rahma',      klien: 'Dian Anggraini',  program: 'Personal Training 10x',  status: 'Cancelled', tanggal: '4 Jun 2026' },
  { no: 8, pic: 'Hendra Saputra',  klien: 'Kevin Sutanto',   program: 'Functional Fitness 12x', status: 'Pending',   tanggal: '3 Jun 2026' },
]

export const activityData = [
  { id: 1, text: 'Assignment baru dibuat untuk Sarah Jenkins — Personal Training 10x',      time: '2 jam lalu',  type: 'assignment' },
  { id: 2, text: 'PIC Andi Pratama menyelesaikan 3 sesi dengan klien Michael Chang',        time: '3 jam lalu',  type: 'sesi' },
  { id: 3, text: 'Payment request Rp 1.200.000 dari klien Amanda Lee disetujui',            time: '5 jam lalu',  type: 'payment' },
  { id: 4, text: 'Dokumen PKS baru menunggu tanda tangan — PT Maju Bersama',               time: '6 jam lalu',  type: 'dokumen' },
  { id: 5, text: 'Assignment #7 dibatalkan — Dian Anggraini (request klien)',               time: 'Kemarin',     type: 'cancelled' },
  { id: 6, text: 'PIC baru terdaftar: Irfan Hakim — mulai aktif 12 Jun 2026',              time: 'Kemarin',     type: 'pic' },
  { id: 7, text: 'Revenue bulan Juni mencapai Rp 84.500.000 (target: Rp 80jt)',            time: '2 hari lalu', type: 'revenue' },
]
