const JENIS_INIT = [
  { id: 1,  nama: 'Private Training',        deskripsi: 'Latihan personal satu-satu dengan trainer profesional',                   status: 'aktif'    },
  { id: 2,  nama: 'Semi Private Training',   deskripsi: 'Latihan personal dengan 2–3 peserta bersama trainer',                    status: 'aktif'    },
  { id: 3,  nama: 'Group Training',          deskripsi: 'Sesi latihan kelompok untuk komunitas atau korporat',                    status: 'aktif'    },
  { id: 4,  nama: 'Fisioterapi',             deskripsi: 'Terapi fisik untuk pemulihan cedera dan rehabilitasi',                   status: 'aktif'    },
  { id: 5,  nama: 'Yoga Therapy',            deskripsi: 'Terapi berbasis yoga untuk relaksasi dan fleksibilitas tubuh',           status: 'aktif'    },
  { id: 6,  nama: 'Posture Correction',      deskripsi: 'Program koreksi postur tubuh untuk mengatasi nyeri punggung',           status: 'aktif'    },
  { id: 7,  nama: 'Strength & Conditioning', deskripsi: 'Program kekuatan dan kondisi fisik untuk atlet dan umum',               status: 'aktif'    },
  { id: 8,  nama: 'Nutrition Coaching',      deskripsi: 'Panduan nutrisi dan pola makan sehat bersama ahli gizi bersertifikat',  status: 'aktif'    },
  { id: 9,  nama: 'Kids Fitness',            deskripsi: 'Program kebugaran khusus untuk anak-anak usia 6–14 tahun',              status: 'aktif'    },
  { id: 10, nama: 'Elderly Fitness',         deskripsi: 'Program kebugaran yang disesuaikan untuk lansia usia 60 tahun ke atas', status: 'nonaktif' },
]

let _jenis = null

function init() {
  if (!_jenis) _jenis = JENIS_INIT.map(j => ({ ...j }))
}

export function getStoredJenis() {
  init()
  return [..._jenis]
}

export function addStoredJenis(item) {
  init()
  _jenis = [..._jenis, item]
}

export function updateStoredJenis(id, data) {
  init()
  _jenis = _jenis.map(j => j.id === id ? { ...j, ...data } : j)
}

export function deleteStoredJenis(id) {
  init()
  _jenis = _jenis.filter(j => j.id !== id)
}

export function getNextJenisId() {
  init()
  return _jenis.length > 0 ? Math.max(..._jenis.map(j => j.id)) + 1 : 1
}
