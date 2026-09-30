import { withTransaction } from '../../db/index.js'
import { nextId, DOCTYPE, MODULE } from '../id/id.generator.js'
import { recordAuditEvent, AuditEventType, EntityType } from '../audit/audit.service.js'
import { notFound } from '../../shared/errors.js'
import { findReceiptById, findReceiptByPaymentId, findReceiptsByOrder, insertReceipt } from './receipt.repository.js'

export async function getReceipt(id) {
  const receipt = await findReceiptById(id)
  if (!receipt) throw notFound('Receipt', id)
  return receipt
}

export async function listReceiptsByOrder(orderId) {
  return findReceiptsByOrder(orderId)
}

/**
 * Create a receipt for a confirmed payment.
 * Called automatically during payment confirmation.
 * Accepts an optional `client` for running inside an existing transaction.
 */
export async function createReceipt({ paymentId, orderId, amount, notes }, requestId, client) {
  const execute = async (txClient) => {
    const id = await nextId(DOCTYPE.RECEIPT, MODULE.PP, { client: txClient })
    const receipt = await insertReceipt({ id, paymentId, orderId, amount, notes }, txClient)
    await recordAuditEvent({
      eventType: AuditEventType.RECEIPT_CREATED,
      entityType: EntityType.RECEIPT,
      entityId: id,
      metadata: { paymentId, orderId, amount },
      requestId,
      client: txClient,
    })
    return receipt
  }
  return client ? execute(client) : withTransaction(execute)
}

export async function getReceiptByPayment(paymentId) {
  const receipt = await findReceiptByPaymentId(paymentId)
  if (!receipt) throw notFound('Receipt', `payment:${paymentId}`)
  return receipt
}
