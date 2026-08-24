const ORDERS_INIT = [
  { id: "PP-27-0001", leadId: "LP-0001", programId: "PRG-PP-003", namaKlien: "James Wilson",
    paket: "12 Sesi - Pro", picSalesEFM: "Sarah Jenkins", picOpsEFM: "Sarah Jenkins",
    tanggalMulai: "2027-01-08", nilaiKontrak: 2400000,
    tahapan: "Program Berjalan", statusOrder: "Aktif",
    paymentTerms: "Per Paket", catatanOrder: "Renewal — fase muscle toning setelah fatloss selesai",
    noHP: "081234567890", email: "james@email.com", hubunganKlien: "Diri Sendiri",
    namaKlienLatihan: "James Wilson", noHPKlien: "081234567890",
    usiaKlien: 33, jenisKelaminKlien: "Laki-laki",
    hariLatihan: ["Senin", "Rabu", "Jumat"], jamLatihan: "07:00",
    lokasiLatihan: "Hampton's Park Tower A, Cilandak Barat",
    rincianLayanan: [{ id:1, namaItem:"Private Training 12 Sesi - Muscle Toning", satuan:"Paket", jumlah:1, total:2400000 }],
    paymentTracking: [{ id:"PT-014", periode:"Full Payment — Jan 2027", nominal:2400000, status:"Lunas", tglBayar:"2027-01-08", invoiceId:"INV-PP-27-0001" }],
    loiStatus:"N/A", mouAda:false, contractStatus:"Active",
    quotation:{ nomor:"QUO/EFM/PP/2027/0001", tanggal:"2027-01-05", manajemenFee:false, manajemenFeePersen:0, pajak:[{nama:"PPN 11%", persen:11, aktif:false}], status:"Approved", catatan:"" }
  },
  { id: "PP-26-0013", leadId: "LP-0001", programId: "PRG-PP-003", namaKlien: "James Wilson",
    paket: "12 Sesi - Pro", picSalesEFM: "Sarah Jenkins", picOpsEFM: "Sarah Jenkins",
    tanggalMulai: "2026-10-24", nilaiKontrak: 2400000,
    tahapan: "Program Berjalan", statusOrder: "Aktif",
    paymentTerms: "Per Paket", catatanOrder: "Klien target penurunan BB 5kg",
    noHP: "081234567890", email: "james@email.com", hubunganKlien: "Diri Sendiri",
    namaKlienLatihan: "James Wilson", noHPKlien: "081234567890",
    usiaKlien: 32, jenisKelaminKlien: "Laki-laki",
    hariLatihan: ["Senin", "Rabu", "Jumat"], jamLatihan: "07:00",
    lokasiLatihan: "Hampton's Park Tower A, Cilandak Barat",
    rincianLayanan: [{ id:1, namaItem:"Private Training 12 Sesi", satuan:"Paket", jumlah:1, total:2400000 }],
    paymentTracking: [{ id:"PT-001", periode:"Full Payment — Okt 2026", nominal:2400000, status:"Lunas", tglBayar:"2026-10-24", invoiceId:"INV-PP-26-0013" }],
    loiStatus:"N/A", mouAda:false, contractStatus:"Active",
    quotation:{ nomor:"QUO/EFM/PP/2026/0013", tanggal:"2026-10-20", manajemenFee:false, manajemenFeePersen:0, pajak:[{nama:"PPN 11%", persen:11, aktif:false}], status:"Approved", catatan:"" }
  },
  { id: "PP-26-0012", leadId: "LP-0006", programId: "PRG-PP-001", namaKlien: "Emily Chen",
    paket: "4 Sesi - Starter", picSalesEFM: "Marcus Chen", picOpsEFM: "Marcus Chen",
    tanggalMulai: "2026-10-22", nilaiKontrak: 600000,
    tahapan: "Program Selesai", statusOrder: "Completed",
    paymentTerms: "Per Paket", catatanOrder: "",
    noHP: "082345678901", email: "emily@email.com", hubunganKlien: "Diri Sendiri",
    namaKlienLatihan: "Emily Chen", noHPKlien: "082345678901",
    usiaKlien: 28, jenisKelaminKlien: "Perempuan",
    hariLatihan: ["Selasa", "Kamis"], jamLatihan: "09:00",
    lokasiLatihan: "Hampton's Park Tower C, Cilandak Barat",
    rincianLayanan: [{ id:1, namaItem:"Private Training 4 Sesi", satuan:"Paket", jumlah:1, total:600000 }],
    paymentTracking: [{ id:"PT-002", periode:"Full Payment — Okt 2026", nominal:600000, status:"Lunas", tglBayar:"2026-10-22", invoiceId:"INV-PP-26-0012" }],
    loiStatus:"N/A", mouAda:false, contractStatus:"Completed",
    quotation:{ nomor:"QUO/EFM/PP/2026/0012", tanggal:"2026-10-18", manajemenFee:false, manajemenFeePersen:0, pajak:[{nama:"PPN 11%", persen:11, aktif:false}], status:"Approved", catatan:"" }
  },
  { id: "PP-26-0021", leadId: "LP-0007", programId: "PRG-PP-002", namaKlien: "Sari Dewi Lestari",
    paket: "8 Sesi - Basic", picSalesEFM: "Dian Kartika", picOpsEFM: "Rizky Firmansyah",
    tanggalMulai: "2026-11-02", nilaiKontrak: 1400000,
    tahapan: "Program Berjalan", statusOrder: "Aktif",
    paymentTerms: "Per Paket", catatanOrder: "Program muscle toning 2x seminggu",
    noHP: "087811223344", email: "sari.dewi@email.com", hubunganKlien: "Diri Sendiri",
    namaKlienLatihan: "Sari Dewi Lestari", noHPKlien: "087811223344",
    usiaKlien: 28, jenisKelaminKlien: "Perempuan",
    hariLatihan: ["Selasa", "Kamis"], jamLatihan: "09:00",
    lokasiLatihan: "Jakarta Pusat",
    rincianLayanan: [{ id:1, namaItem:"Private Training 8 Sesi - Basic", satuan:"Paket", jumlah:1, total:1400000 }],
    paymentTracking: [{ id:"PT-021", periode:"Full Payment — Nov 2026", nominal:1400000, status:"Lunas", tglBayar:"2026-11-02", invoiceId:"INV-PP-26-0021" }],
    loiStatus:"N/A", mouAda:false, contractStatus:"Active",
    quotation:{ nomor:"QUO/EFM/PP/2026/0021", tanggal:"2026-10-30", manajemenFee:false, manajemenFeePersen:0, pajak:[{nama:"PPN 11%", persen:11, aktif:false}], status:"Approved", catatan:"" }
  },
]

let _store = [...ORDERS_INIT]

export function getAllOrders() {
  return _store
}

export function getOrderById(id) {
  return _store.find(o => o.id === id) || null
}

export function getNextOrderId() {
  const yy = String(new Date().getFullYear()).slice(-2)
  const prefix = `PP-${yy}-`
  const maxSeq = _store
    .filter(o => o.id.startsWith(prefix))
    .reduce((max, o) => {
      const n = parseInt(o.id.slice(prefix.length), 10)
      return isNaN(n) ? max : Math.max(max, n)
    }, 0)
  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`
}

export function addOrder(order) {
  _store = [..._store, order]
}

export { ORDERS_INIT }
