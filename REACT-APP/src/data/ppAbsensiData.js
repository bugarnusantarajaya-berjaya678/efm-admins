// Dummy seed absensi per order — fallback saat state?.absensiSesi & localStorage kosong
// Jumlah entry per order HARUS sama dengan sesiDone di ppOrdersData.js

const D = (id, jadwalId, tanggal, jam, lokasi, device) => ({
  id, jadwalId, tanggal, jam, lokasi, device,
  fotoUrl: `https://drive.google.com/file/d/1Abs${id.replace('-','')}_${jadwalId.replace(/-/g,'')}/view?usp=drive_link`,
  catatanKoreksi: '',
})

const LOC_ELENA  = ['Studio Yoga EFM — Senopati, Jakarta Selatan', 'Rumah Klien — Kemang, Jakarta Selatan', 'EFM Studio — Blok M, Jakarta Selatan']
const LOC_MARCUS = ['EFM Studio — Kemang, Jakarta Selatan', 'Rumah Klien — Kuningan, Jakarta Selatan', 'EFM Studio — TB Simatupang, Jakarta Selatan']
const LOC_SARAH  = ['EFM Studio — Fatmawati, Jakarta Selatan', 'Rumah Klien — Pondok Indah, Jakarta Selatan', 'GOR Cilandak, Jakarta Selatan']
const LOC_DIAN   = ['Cluster Bukit Indah, Cilandak, Jakarta Selatan', 'GOR Cilandak, Jakarta Selatan']
const DEV = ['iPhone 15 Pro - Safari', 'Samsung Galaxy S24 - Chrome', 'iPhone 14 - Safari', 'Samsung Galaxy A54 - Chrome', 'iPhone 13 - Safari', 'Xiaomi 13T - Chrome']
const loc  = (arr, i) => arr[i % arr.length]
const dev  = (i)      => DEV[i % DEV.length]
const jam  = (i)      => ['07:02','06:58','07:05','07:01','07:10','06:45','08:01','08:03','07:08','07:00','06:52','07:15'][i % 12]

export const ABSENSI_SEED = {

  /* ── PP-26-0001 ── Natasha Putri · Elena Rodriguez · 8 Sesi Base · 5 done */
  'PP-26-0001': [
    D('ABS-001','JS-0001-1','2026-09-01', jam(0), loc(LOC_ELENA,0), dev(0)),
    D('ABS-002','JS-0001-2','2026-09-04', jam(1), loc(LOC_ELENA,1), dev(1)),
    D('ABS-003','JS-0001-3','2026-09-08', jam(2), loc(LOC_ELENA,0), dev(2)),
    D('ABS-004','JS-0001-4','2026-09-11', jam(3), loc(LOC_ELENA,2), dev(3)),
    D('ABS-005','JS-0001-5','2026-09-15', jam(4), loc(LOC_ELENA,0), dev(4)),
  ],

  /* ── PP-26-0002 ── Ahmad Fauzi · Marcus Chen · 24 Sesi Elite · 24 done */
  'PP-26-0002': [
    D('ABS-001','JS-0002-01','2026-09-10', jam(0),  loc(LOC_MARCUS,0), dev(0)),
    D('ABS-002','JS-0002-02','2026-09-11', jam(1),  loc(LOC_MARCUS,1), dev(1)),
    D('ABS-003','JS-0002-03','2026-09-14', jam(2),  loc(LOC_MARCUS,0), dev(2)),
    D('ABS-004','JS-0002-04','2026-09-15', jam(3),  loc(LOC_MARCUS,2), dev(3)),
    D('ABS-005','JS-0002-05','2026-09-16', jam(4),  loc(LOC_MARCUS,0), dev(4)),
    D('ABS-006','JS-0002-06','2026-09-17', jam(5),  loc(LOC_MARCUS,1), dev(5)),
    D('ABS-007','JS-0002-07','2026-09-18', jam(6),  loc(LOC_MARCUS,0), dev(0)),
    D('ABS-008','JS-0002-08','2026-09-21', jam(7),  loc(LOC_MARCUS,2), dev(1)),
    D('ABS-009','JS-0002-09','2026-09-22', jam(8),  loc(LOC_MARCUS,0), dev(2)),
    D('ABS-010','JS-0002-10','2026-09-23', jam(9),  loc(LOC_MARCUS,1), dev(3)),
    D('ABS-011','JS-0002-11','2026-09-24', jam(10), loc(LOC_MARCUS,0), dev(4)),
    D('ABS-012','JS-0002-12','2026-09-25', jam(11), loc(LOC_MARCUS,2), dev(5)),
    D('ABS-013','JS-0002-13','2026-09-28', jam(0),  loc(LOC_MARCUS,0), dev(0)),
    D('ABS-014','JS-0002-14','2026-09-29', jam(1),  loc(LOC_MARCUS,1), dev(1)),
    D('ABS-015','JS-0002-15','2026-09-30', jam(2),  loc(LOC_MARCUS,0), dev(2)),
    D('ABS-016','JS-0002-16','2026-10-01', jam(3),  loc(LOC_MARCUS,2), dev(3)),
    D('ABS-017','JS-0002-17','2026-10-02', jam(4),  loc(LOC_MARCUS,0), dev(4)),
    D('ABS-018','JS-0002-18','2026-10-05', jam(5),  loc(LOC_MARCUS,1), dev(5)),
    D('ABS-019','JS-0002-19','2026-10-06', jam(6),  loc(LOC_MARCUS,0), dev(0)),
    D('ABS-020','JS-0002-20','2026-10-07', jam(7),  loc(LOC_MARCUS,2), dev(1)),
    D('ABS-021','JS-0002-21','2026-10-08', jam(8),  loc(LOC_MARCUS,0), dev(2)),
    D('ABS-022','JS-0002-22','2026-10-09', jam(9),  loc(LOC_MARCUS,1), dev(3)),
    D('ABS-023','JS-0002-23','2026-10-12', jam(10), loc(LOC_MARCUS,0), dev(4)),
    D('ABS-024','JS-0002-24','2026-10-13', jam(11), loc(LOC_MARCUS,2), dev(5)),
  ],

  /* ── PP-26-0004 ── Kevin Hartanto · Elena Rodriguez · 12 Sesi Pro · 10 done */
  'PP-26-0004': [
    D('ABS-001','JS-0004-01','2026-09-21', jam(0),  loc(LOC_ELENA,0), dev(2)),
    D('ABS-002','JS-0004-02','2026-09-23', jam(1),  loc(LOC_ELENA,1), dev(3)),
    D('ABS-003','JS-0004-03','2026-09-25', jam(2),  loc(LOC_ELENA,0), dev(4)),
    D('ABS-004','JS-0004-04','2026-09-28', jam(3),  loc(LOC_ELENA,2), dev(5)),
    D('ABS-005','JS-0004-05','2026-09-30', jam(4),  loc(LOC_ELENA,0), dev(0)),
    D('ABS-006','JS-0004-06','2026-10-02', jam(5),  loc(LOC_ELENA,1), dev(1)),
    D('ABS-007','JS-0004-07','2026-10-05', jam(6),  loc(LOC_ELENA,0), dev(2)),
    D('ABS-008','JS-0004-08','2026-10-07', jam(7),  loc(LOC_ELENA,2), dev(3)),
    D('ABS-009','JS-0004-09','2026-10-09', jam(8),  loc(LOC_ELENA,0), dev(4)),
    D('ABS-010','JS-0004-10','2026-10-12', jam(9),  loc(LOC_ELENA,1), dev(5)),
  ],

  /* ── PP-26-0005 ── Dewi Rahayu · Marcus Chen · 8 Sesi Base · 8 done */
  'PP-26-0005': [
    D('ABS-001','JS-0005-1','2026-09-25', jam(0), loc(LOC_MARCUS,0), dev(0)),
    D('ABS-002','JS-0005-2','2026-09-29', jam(1), loc(LOC_MARCUS,1), dev(1)),
    D('ABS-003','JS-0005-3','2026-10-02', jam(2), loc(LOC_MARCUS,0), dev(2)),
    D('ABS-004','JS-0005-4','2026-10-06', jam(3), loc(LOC_MARCUS,2), dev(3)),
    D('ABS-005','JS-0005-5','2026-10-09', jam(4), loc(LOC_MARCUS,0), dev(4)),
    D('ABS-006','JS-0005-6','2026-10-13', jam(5), loc(LOC_MARCUS,1), dev(5)),
    D('ABS-007','JS-0005-7','2026-10-16', jam(6), loc(LOC_MARCUS,0), dev(0)),
    D('ABS-008','JS-0005-8','2026-10-20', jam(7), loc(LOC_MARCUS,2), dev(1)),
  ],

  /* ── PP-26-0006 ── Hendra Wijaya · Sarah Jenkins · 24 Sesi Elite · 3 done */
  'PP-26-0006': [
    D('ABS-001','JS-0006-1','2026-10-01', jam(0), loc(LOC_SARAH,0), dev(0)),
    D('ABS-002','JS-0006-2','2026-10-02', jam(1), loc(LOC_SARAH,1), dev(1)),
    D('ABS-003','JS-0006-3','2026-10-05', jam(2), loc(LOC_SARAH,0), dev(2)),
  ],

  /* ── PP-26-0007 ── Rina Kusuma · Elena Rodriguez · 4 Sesi Starter · 4 done */
  'PP-26-0007': [
    D('ABS-001','JS-0007-1','2026-10-05', jam(0), loc(LOC_ELENA,0), dev(3)),
    D('ABS-002','JS-0007-2','2026-10-08', jam(1), loc(LOC_ELENA,2), dev(4)),
    D('ABS-003','JS-0007-3','2026-10-12', jam(2), loc(LOC_ELENA,0), dev(5)),
    D('ABS-004','JS-0007-4','2026-10-15', jam(3), loc(LOC_ELENA,1), dev(0)),
  ],

  /* ── PP-26-0008 ── Budi Santoso · Marcus Chen · 12 Sesi Pro · 7 done */
  'PP-26-0008': [
    D('ABS-001','JS-0008-1','2026-10-12', jam(0), loc(LOC_MARCUS,0), dev(1)),
    D('ABS-002','JS-0008-2','2026-10-14', jam(1), loc(LOC_MARCUS,2), dev(2)),
    D('ABS-003','JS-0008-3','2026-10-16', jam(2), loc(LOC_MARCUS,0), dev(3)),
    D('ABS-004','JS-0008-4','2026-10-19', jam(3), loc(LOC_MARCUS,1), dev(4)),
    D('ABS-005','JS-0008-5','2026-10-21', jam(4), loc(LOC_MARCUS,0), dev(5)),
    D('ABS-006','JS-0008-6','2026-10-23', jam(5), loc(LOC_MARCUS,2), dev(0)),
    D('ABS-007','JS-0008-7','2026-10-26', jam(6), loc(LOC_MARCUS,0), dev(1)),
  ],

  /* ── PP-26-0011 ── Robert Taylor · Elena Rodriguez · 24 Sesi Elite · 12 done */
  'PP-26-0011': [
    D('ABS-001','JS-0011-01','2026-10-19', jam(0),  loc(LOC_ELENA,0), dev(2)),
    D('ABS-002','JS-0011-02','2026-10-20', jam(1),  loc(LOC_ELENA,1), dev(3)),
    D('ABS-003','JS-0011-03','2026-10-21', jam(2),  loc(LOC_ELENA,0), dev(4)),
    D('ABS-004','JS-0011-04','2026-10-22', jam(3),  loc(LOC_ELENA,2), dev(5)),
    D('ABS-005','JS-0011-05','2026-10-23', jam(4),  loc(LOC_ELENA,0), dev(0)),
    D('ABS-006','JS-0011-06','2026-10-26', jam(5),  loc(LOC_ELENA,1), dev(1)),
    D('ABS-007','JS-0011-07','2026-10-27', jam(6),  loc(LOC_ELENA,0), dev(2)),
    D('ABS-008','JS-0011-08','2026-10-28', jam(7),  loc(LOC_ELENA,2), dev(3)),
    D('ABS-009','JS-0011-09','2026-10-29', jam(8),  loc(LOC_ELENA,0), dev(4)),
    D('ABS-010','JS-0011-10','2026-10-30', jam(9),  loc(LOC_ELENA,1), dev(5)),
    D('ABS-011','JS-0011-11','2026-11-02', jam(10), loc(LOC_ELENA,0), dev(0)),
    D('ABS-012','JS-0011-12','2026-11-03', jam(11), loc(LOC_ELENA,2), dev(1)),
  ],

  /* ── PP-26-0012 ── Emily Chen · Marcus Chen · 4 Sesi Starter · 4 done */
  'PP-26-0012': [
    D('ABS-001','JS-0012-1','2026-10-22', jam(0), loc(LOC_MARCUS,0), dev(2)),
    D('ABS-002','JS-0012-2','2026-10-26', jam(1), loc(LOC_MARCUS,1), dev(3)),
    D('ABS-003','JS-0012-3','2026-10-29', jam(2), loc(LOC_MARCUS,0), dev(4)),
    D('ABS-004','JS-0012-4','2026-11-02', jam(3), loc(LOC_MARCUS,2), dev(5)),
  ],

  /* ── PP-26-0013 ── James Wilson · Sarah Jenkins · 12 Sesi Pro · 4 done */
  'PP-26-0013': [
    D('ABS-001','JS-0013-1','2026-10-26', jam(0), loc(LOC_SARAH,0), dev(0)),
    D('ABS-002','JS-0013-2','2026-10-28', jam(1), loc(LOC_SARAH,1), dev(1)),
    D('ABS-003','JS-0013-3','2026-10-30', jam(2), loc(LOC_SARAH,0), dev(2)),
    D('ABS-004','JS-0013-4','2026-11-02', jam(3), loc(LOC_SARAH,2), dev(3)),
  ],

  /* ── PP-26-0021 ── Sari Dewi Lestari · Dian Kartika · 8 Sesi Base · 3 done */
  'PP-26-0021': [
    D('ABS-001','JS-0021-1','2026-11-02', jam(0), loc(LOC_DIAN,0), dev(4)),
    D('ABS-002','JS-0021-2','2026-11-05', jam(1), loc(LOC_DIAN,1), dev(5)),
    D('ABS-003','JS-0021-3','2026-11-09', jam(2), loc(LOC_DIAN,0), dev(0)),
  ],

  /* ── PP-27-0004 ── Mega Wulandari · Dian Kartika · Grup Zumba 8 Sesi · 3 done */
  'PP-27-0004': [
    D('ABS-001','JS-Z01','2027-01-16', '08:03', loc(LOC_DIAN,0), 'iPhone 15 Pro - Safari'),
    D('ABS-002','JS-Z02','2027-01-17', '08:00', loc(LOC_DIAN,0), 'Samsung Galaxy S24 - Chrome'),
    D('ABS-003','JS-Z03','2027-01-23', '08:01', loc(LOC_DIAN,0), 'iPhone 15 Pro - Safari'),
  ],
}
