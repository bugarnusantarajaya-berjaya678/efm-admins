const SEED_VERSION = 'efm-rekap-seed-v1'

export function seedRekapData() {
  if (localStorage.getItem('efm-seed-version') === SEED_VERSION) return

  const seeds = {
    // PP-26-0012 (Emily Chen, 4/4 sesi) — dikonfirmasi + sudah bayar
    'PP-26-0012': {
      status: 'dikonfirmasi',
      tglKonfirmasi: '10 November 2026',
      honorariumStatus: 'sudah_bayar',
      buktiBayarNama: 'transfer-bca-emily-chen.jpg',
      tglBayar: '10 November 2026',
      metodeBayar: 'Transfer Bank (BCA)',
    },
    // PP-26-0007 (Rina Kusuma, 4/4 sesi) — dikonfirmasi, menunggu bayar
    'PP-26-0007': {
      status: 'dikonfirmasi',
      tglKonfirmasi: '8 November 2026',
    },
    // PP-26-0005 (Dewi Rahayu, 8/8 sesi) — pengajuan masuk, menunggu konfirmasi
    'PP-26-0005': {
      status: 'pengajuan_masuk',
    },
    // PP-26-0002 (Ahmad Fauzi, 24/24 sesi) — belum diajukan, clear state
    'PP-26-0002': {
      status: 'belum_diajukan',
    },
  }

  Object.entries(seeds).forEach(([orderId, data]) => {
    localStorage.setItem(`rekap-pp-${orderId}`, JSON.stringify(data))
  })

  localStorage.setItem('efm-seed-version', SEED_VERSION)
}
