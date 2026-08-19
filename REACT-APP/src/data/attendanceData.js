export const pengajuanList = [
  { id: 'AJU-001', namaPIC: 'Sarah Jenkins',   klien: 'Alex Chen',          program: 'Personal Training 10x', periode: 'Jun 2026', jumlahSesi: 10, tglPengajuan: '18 Jun 2026', status: 'Menunggu Review',  honorarium: 750000  },
  { id: 'AJU-002', namaPIC: 'Marcus Chen',     klien: 'Lisa Wong',          program: 'Personal Training 8x',  periode: 'Jun 2026', jumlahSesi: 8,  tglPengajuan: '17 Jun 2026', status: 'Menunggu Review',  honorarium: 600000  },
  { id: 'AJU-003', namaPIC: 'Ahmad Pratama',   klien: 'Sudirman Park Apt.', program: 'B2B Monthly',           periode: 'Jun 2026', jumlahSesi: 12, tglPengajuan: '16 Jun 2026', status: 'Menunggu Review',  honorarium: 900000  },
  { id: 'AJU-004', namaPIC: 'Elena Rodriguez', klien: 'PT. Maju Bersama',   program: 'Corporate Wellness',    periode: 'Mei 2026', jumlahSesi: 20, tglPengajuan: '5 Jun 2026',  status: 'Sudah Diapprove', honorarium: 1500000 },
  { id: 'AJU-005', namaPIC: 'Budi Santoso',    klien: 'Anna Johnson',       program: 'Yoga 12x',              periode: 'Mei 2026', jumlahSesi: 12, tglPengajuan: '3 Jun 2026',  status: 'Sudah Diapprove', honorarium: 900000  },
  { id: 'AJU-006', namaPIC: 'Rina Dewi',       klien: 'Michael Chang',      program: 'Pilates 8x',            periode: 'Mei 2026', jumlahSesi: 8,  tglPengajuan: '1 Jun 2026',  status: 'Ditolak',         honorarium: 600000  },
]

export const riwayatList = [
  { id: 'RIW-001', namaPIC: 'Elena Rodriguez', klien: 'PT. Maju Bersama', program: 'Corporate Wellness', periode: 'Mei 2026', jumlahSesi: 20, honorarium: 1500000, tglApprove: '5 Jun 2026',  statusBayar: 'Sudah Dibayar' },
  { id: 'RIW-002', namaPIC: 'Budi Santoso',    klien: 'Anna Johnson',     program: 'Yoga 12x',          periode: 'Mei 2026', jumlahSesi: 12, honorarium: 900000,  tglApprove: '3 Jun 2026',  statusBayar: 'Sudah Dibayar' },
  { id: 'RIW-003', namaPIC: 'Marcus Chen',     klien: 'Robert Taylor',    program: 'PT 10x',            periode: 'Apr 2026', jumlahSesi: 10, honorarium: 750000,  tglApprove: '2 Mei 2026',  statusBayar: 'Sudah Dibayar' },
  { id: 'RIW-004', namaPIC: 'Sarah Jenkins',   klien: 'Lisa Wong',        program: 'PT 8x',             periode: 'Apr 2026', jumlahSesi: 8,  honorarium: 600000,  tglApprove: '1 Mei 2026',  statusBayar: 'Dalam Proses'  },
]

/* ── Legacy exports (used by PPDashboard + DashboardAdmin) ──────────────── */
export const sesiList = [
  { id: 'SES-001', tanggal: '2026-06-21', pic: 'Sarah Jenkins',   klien: 'Robert Taylor',        program: 'PP',    jamMulai: '07:00', jamSelesai: '08:00' },
  { id: 'SES-002', tanggal: '2026-06-21', pic: 'Marcus Chen',     klien: 'The Summit Apartment', program: 'B2B',   jamMulai: '08:30', jamSelesai: '09:30' },
  { id: 'SES-003', tanggal: '2026-06-21', pic: 'Elena Rodriguez', klien: 'Michael Scott',        program: 'PP',    jamMulai: '09:00', jamSelesai: '10:00' },
  { id: 'SES-004', tanggal: '2026-06-21', pic: 'Ahmad Pratama',   klien: 'James Wilson',         program: 'PP',    jamMulai: '10:00', jamSelesai: '11:00' },
  { id: 'SES-005', tanggal: '2026-06-21', pic: 'Rina Indah',      klien: 'Green Lake Apartment', program: 'B2B',   jamMulai: '10:30', jamSelesai: '11:30' },
  { id: 'SES-006', tanggal: '2026-06-21', pic: 'Budi Wijaya',     klien: 'PT. Maju Bersama',     program: 'Event', jamMulai: '13:00', jamSelesai: '15:00' },
  { id: 'SES-007', tanggal: '2026-06-20', pic: 'Sarah Jenkins',   klien: 'Alex Chen',            program: 'PP',    jamMulai: '14:00', jamSelesai: '15:00' },
  { id: 'SES-008', tanggal: '2026-06-20', pic: 'Marcus Chen',     klien: 'Lisa Wong',            program: 'PP',    jamMulai: '15:00', jamSelesai: '16:00' },
  { id: 'SES-009', tanggal: '2026-06-20', pic: 'Elena Rodriguez', klien: 'Anna Johnson',         program: 'PP',    jamMulai: '16:00', jamSelesai: '17:00' },
  { id: 'SES-010', tanggal: '2026-06-20', pic: 'Ahmad Pratama',   klien: 'Sudirman Park Apt.',   program: 'B2B',   jamMulai: '17:00', jamSelesai: '18:00' },
]

export const rekapPIC = [
  { pic: 'Sarah Jenkins',   inisial: 'SJ', warna: '#E05945', totalSesi: 30, hadir: 28, tidakHadir: 2, totalJam: 30, statusBayar: 'belum'    },
  { pic: 'Marcus Chen',     inisial: 'MC', warna: '#2980B9', totalSesi: 22, hadir: 21, tidakHadir: 1, totalJam: 22, statusBayar: 'diajukan' },
  { pic: 'Elena Rodriguez', inisial: 'ER', warna: '#27AE60', totalSesi: 48, hadir: 46, tidakHadir: 2, totalJam: 48, statusBayar: 'belum'    },
  { pic: 'Ahmad Pratama',   inisial: 'AP', warna: '#E67E22', totalSesi: 35, hadir: 33, tidakHadir: 2, totalJam: 35, statusBayar: 'belum'    },
  { pic: 'Rina Indah',      inisial: 'RI', warna: '#16A085', totalSesi: 18, hadir: 17, tidakHadir: 1, totalJam: 18, statusBayar: 'belum'    },
  { pic: 'Budi Wijaya',     inisial: 'BW', warna: '#C0392B', totalSesi: 40, hadir: 38, tidakHadir: 2, totalJam: 80, statusBayar: 'belum'    },
]
