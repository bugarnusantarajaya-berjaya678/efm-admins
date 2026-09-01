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
