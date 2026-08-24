import { RECEIPTS_INIT } from './ppReceiptData'

let _store = [...RECEIPTS_INIT]

export function getAllReceipts() { return _store }

export function getReceiptByRcpNo(rcpNo) {
  return _store.find(r => r.rcpNo === rcpNo) || null
}

export function getReceiptByOrderId(orderId) {
  return _store.find(r => r.orderId === orderId) || null
}

export function addReceipt(receipt) {
  if (_store.some(r => r.rcpNo === receipt.rcpNo)) return
  _store = [receipt, ..._store]
}
