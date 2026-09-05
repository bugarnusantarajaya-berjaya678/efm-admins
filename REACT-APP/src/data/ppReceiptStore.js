import { RECEIPTS_INIT } from './ppReceiptData'

let _store = [...RECEIPTS_INIT]

export function getAllReceipts() { return _store }

export function getReceiptByRcpNo(rcpNo) {
  return _store.find(r => r.rcpNo === rcpNo) || null
}

export function getReceiptByOrderId(orderId) {
  return _store.find(r => r.orderId === orderId) || null
}

export function getReceiptByInvNo(invNo) {
  return _store.find(r => r.invNo === invNo) || null
}

export function getNextReceiptNo() {
  const yy = String(new Date().getFullYear()).slice(-2)
  const prefix = `RCP-PP-${yy}-`
  const maxSeq = _store
    .filter(r => r.rcpNo.startsWith(prefix))
    .reduce((max, r) => {
      const n = parseInt(r.rcpNo.slice(prefix.length), 10)
      return isNaN(n) ? max : Math.max(max, n)
    }, 0)
  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`
}

export function addReceipt(receipt) {
  if (_store.some(r => r.rcpNo === receipt.rcpNo)) return
  _store = [receipt, ..._store]
}
