import { PROMO_INIT } from './ppPromoData'

let _store = [...PROMO_INIT]

export function getAllPromo() { return _store }

export function getPromoByKode(kode) {
  return _store.find(p => p.kode === kode.toUpperCase()) || null
}

export function addPromo(promo) {
  if (_store.some(p => p.kode === promo.kode)) return false
  _store = [promo, ..._store]
  return true
}

export function updatePromo(kode, updates) {
  _store = _store.map(p => p.kode === kode ? { ...p, ...updates } : p)
}

export function deletePromo(kode) {
  _store = _store.filter(p => p.kode !== kode)
}

export function toggleAktif(kode) {
  _store = _store.map(p => p.kode === kode ? { ...p, aktif: !p.aktif } : p)
}

export function incrementPemakaian(kode) {
  _store = _store.map(p =>
    p.kode === kode
      ? { ...p, jumlahPemakaian: (p.jumlahPemakaian || 0) + 1 }
      : p
  )
}

/**
 * Validates a promo code against 5 layers:
 * 1. aktif flag
 * 2. tanggalBerakhir (expired)
 * 3. tanggalMulai (not yet started)
 * 4. programIds restriction
 * 5. maxPemakaian quota
 *
 * @param {string} kode - promo code
 * @param {{ programId?: string|null, tanggal?: string|null }} opts
 * @returns {{ valid: boolean, error?: string, promo?: object }}
 */
export function validatePromo(kode, { programId = null, tanggal = null } = {}) {
  const p = _store.find(x => x.kode === kode.toUpperCase())
  if (!p) return { valid: false, error: 'Kode promo tidak ditemukan.' }

  // Layer 1 — aktif flag
  if (!p.aktif) return { valid: false, error: 'Kode promo ini tidak aktif.' }

  // Determine reference date
  const refDate = tanggal ? new Date(tanggal) : new Date()
  const today = new Date(refDate.toDateString()) // strip time

  // Layer 2 — expired
  if (p.tanggalBerakhir) {
    const expiry = new Date(p.tanggalBerakhir)
    if (today > expiry) {
      return {
        valid: false,
        error: `Kode promo sudah kadaluarsa (berakhir ${formatTgl(p.tanggalBerakhir)}).`,
      }
    }
  }

  // Layer 3 — not yet started
  if (p.tanggalMulai) {
    const start = new Date(p.tanggalMulai)
    if (today < start) {
      return {
        valid: false,
        error: `Kode promo belum berlaku (mulai ${formatTgl(p.tanggalMulai)}).`,
      }
    }
  }

  // Layer 4 — program restriction
  if (p.programIds !== null && programId) {
    if (!p.programIds.includes(programId)) {
      return {
        valid: false,
        error: 'Promo ini tidak berlaku untuk program yang dipilih.',
      }
    }
  }

  // Layer 5 — quota
  if (p.maxPemakaian !== null && p.jumlahPemakaian >= p.maxPemakaian) {
    return {
      valid: false,
      error: `Kuota promo sudah habis (${p.jumlahPemakaian}/${p.maxPemakaian} telah dipakai).`,
    }
  }

  return { valid: true, promo: p }
}

function formatTgl(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
