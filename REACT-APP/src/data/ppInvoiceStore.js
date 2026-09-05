import { INVOICES_INIT } from './ppInvoiceData'

let _store = [...INVOICES_INIT]

export function getAllInvoices() {
  return _store
}

export function getInvoiceByNo(invNo) {
  return _store.find(i => i.invNo === invNo) || null
}

export function getInvoiceByOrderId(orderId) {
  return _store.find(i => i.orderId === orderId) || null
}

export function getNextInvoiceNo() {
  const yy = String(new Date().getFullYear()).slice(-2)
  const prefix = `INV-PP-${yy}-`
  const maxSeq = _store
    .filter(i => i.invNo.startsWith(prefix))
    .reduce((max, i) => {
      const n = parseInt(i.invNo.slice(prefix.length), 10)
      return isNaN(n) ? max : Math.max(max, n)
    }, 0)
  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`
}

export function addInvoice(inv) {
  _store = [..._store, inv]
}

export function updateInvoice(invNo, changes) {
  _store = _store.map(i => i.invNo === invNo ? { ...i, ...changes } : i)
}
