import { DOCS_INIT } from './ppDocumentsData'

let _store = [...DOCS_INIT]

export function getAllDocs() { return _store }

export function getDocById(id) {
  return _store.find(d => d.id === id) || null
}

export function getDocByOrderId(orderId) {
  return _store.find(d => d.orderId === orderId) || null
}

export function updateDoc(id, patch) {
  _store = _store.map(d => d.id === id ? { ...d, ...patch } : d)
}

export function addDoc(doc) {
  if (_store.some(d => d.id === doc.id)) return
  _store = [doc, ..._store]
}

export function getNextAgreementNo() {
  const yy = String(new Date().getFullYear()).slice(-2)
  const prefix = `AGR-PP-${yy}-`
  const maxSeq = _store
    .filter(d => d.id.startsWith(prefix))
    .reduce((max, d) => {
      const n = parseInt(d.id.slice(prefix.length), 10)
      return isNaN(n) ? max : Math.max(max, n)
    }, 0)
  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`
}
