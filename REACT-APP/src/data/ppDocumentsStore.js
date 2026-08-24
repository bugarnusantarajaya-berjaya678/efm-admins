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
