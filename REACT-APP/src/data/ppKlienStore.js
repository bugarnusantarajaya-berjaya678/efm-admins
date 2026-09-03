/**
 * ppKlienStore.js — Global Klien Store (PP Module)
 *
 * CRUD layer atas ppKlienData.js. Digunakan oleh halaman-halaman PP
 * untuk lookup, update, dan tambah data klien latihan.
 *
 * Hubungan entitas:
 *   Lead (LP-xxxx) ← pendaftar/payer, di ppLeadsStore
 *   Klien (KL-xxxx) ← orang yang berlatih, di sini
 *   1 Lead → N Klien (via klienIds di lead, dan leadId di klien)
 */

import { KLIEN_INIT } from './ppKlienData'

// Maps PP Order ID → Klien ID (untuk lookup cepat tanpa iterasi)
export const ORDER_TO_KLIEN_ID = {
  'PP-26-0013': 'KL-0001',  // James Wilson
  'PP-27-0001': 'KL-0001',  // James Wilson (renewal)
  'PP-26-0012': 'KL-0007',  // Emily Chen
  'PP-26-0021': 'KL-0016',  // Sari Dewi Lestari
  'PP-26-0011': 'KL-0014',  // Robert Taylor
  'PP-26-0010': 'KL-0015',  // Anita Suryani
  'PP-26-0008': 'KL-0003',  // Budi Santoso (couple, primary)
  'PP-26-0007': 'KL-0017',  // Rina Kusuma
  'PP-26-0006': 'KL-0018',  // Hendra Wijaya
  'PP-26-0005': 'KL-0019',  // Dewi Anggraini
  'PP-26-0004': 'KL-0008',  // Kevin Hartanto
  'PP-26-0003': 'KL-0013',  // Fiona Santika
  'PP-26-0002': 'KL-0010',  // Ahmad Fauzi
  'PP-26-0001': 'KL-0009',  // Natasha Putri
}

let _klien = KLIEN_INIT.map(k => ({ ...k }))

export function getStoredKlien() {
  return [..._klien]
}

export function getKlienById(klienId) {
  return _klien.find(k => k.id === klienId) || null
}

/** Semua klien yang terhubung ke satu lead */
export function getKlienByLeadId(leadId) {
  return _klien.filter(k => k.leadId === leadId)
}

/** Lookup klien berdasarkan orderId menggunakan ORDER_TO_KLIEN_ID */
export function getKlienByOrderId(orderId) {
  const klienId = ORDER_TO_KLIEN_ID[orderId]
  return klienId ? getKlienById(klienId) : null
}

export function addStoredKlien(klien) {
  _klien = [..._klien, klien]
}

export function updateKlienHealth(klienId, patch) {
  _klien = _klien.map(k =>
    k.id === klienId
      ? { ...k, infoKesehatan: { ...(k.infoKesehatan || {}), ...patch, sudahDiisi: true } }
      : k
  )
}

export function updateKlien(klienId, patch) {
  _klien = _klien.map(k => (k.id === klienId ? { ...k, ...patch } : k))
}

export function getNextKlienId() {
  return 'KL-' + String(_klien.length + 1).padStart(4, '0')
}
