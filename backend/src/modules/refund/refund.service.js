import { withTransaction } from '../../db/index.js'
import { nextId, DOCTYPE, MODULE } from '../id/id.generator.js'
import { recordAuditEvent, AuditEventType, EntityType } from '../audit/audit.service.js'
import { validationError, notFound, conflict, businessRuleViolation } from '../../shared/errors.js'
import { findPaymentById } from '../payment/payment.repository.js'
import { findRefundById, findRefundByPaymentId, findRefundsByOrder, insertRefund, updateRefundStatus } from './refund.repository.js'

export async function getRefund(id) {
  const refund = await findRefundById(id)
  if (!refund) throw notFound('Refund', id)
  return refund
}

export async function listRefundsByOrder(orderId) {
  return findRefundsByOrder(orderId)
}

export async function requestRefund({ paymentId, reason }, requestId) {
  if (!paymentId) throw validationError('paymentId is required')
  if (!reason?.trim()) throw validationError('reason is required')

  const payment = await findPaymentById(paymentId)
  if (!payment) throw notFound('Payment', paymentId)
  if (payment.status !== 'CONFIRMED') {
    throw businessRuleViolation('REFUND_PAYMENT_NOT_CONFIRMED',
      `Can only refund a CONFIRMED payment, got ${payment.status}`)
  }

  // 1 refund per payment (append-only)
  const existing = await findRefundByPaymentId(paymentId)
  if (existing) {
    throw conflict(`A refund already exists for payment ${paymentId} (${existing.id})`)
  }

  return withTransaction(async (client) => {
    const id = await nextId(DOCTYPE.REFUND_PP, MODULE.PP, { client })
    const refund = await insertRefund({
      id,
      paymentId,
      orderId: payment.order_id,
      amount: payment.amount, // full refund only
      reason: reason.trim(),
    }, client)

    await recordAuditEvent({
      eventType: AuditEventType.REFUND_CREATED,
      entityType: EntityType.REFUND,
      entityId: id,
      metadata: { paymentId, orderId: payment.order_id, amount: payment.amount },
      requestId,
      client,
    })
    return refund
  })
}

export async function processRefund(id, { processedBy } = {}, requestId) {
  const refund = await findRefundById(id)
  if (!refund) throw notFound('Refund', id)
  if (refund.status !== 'PENDING') {
    throw businessRuleViolation('REFUND_NOT_PENDING', `Refund is in status ${refund.status}`)
  }

  return withTransaction(async (client) => {
    const updated = await updateRefundStatus(id, 'PROCESSED', {
      processedAt: new Date().toISOString(),
      processedBy: processedBy ?? 'system',
    }, client)

    await recordAuditEvent({
      eventType: AuditEventType.REFUND_PROCESSED,
      entityType: EntityType.REFUND,
      entityId: id,
      metadata: { paymentId: refund.payment_id, amount: refund.amount },
      requestId,
      client,
    })
    return updated
  })
}

export async function rejectRefund(id, { rejectedBy, rejectionReason } = {}, requestId) {
  const refund = await findRefundById(id)
  if (!refund) throw notFound('Refund', id)
  if (refund.status !== 'PENDING') {
    throw businessRuleViolation('REFUND_NOT_PENDING', `Refund is in status ${refund.status}`)
  }

  return withTransaction(async (client) => {
    const updated = await updateRefundStatus(id, 'REJECTED', {
      rejectedAt: new Date().toISOString(),
      rejectedBy: rejectedBy ?? 'system',
      rejectionReason: rejectionReason ?? '',
    }, client)

    await recordAuditEvent({
      eventType: AuditEventType.REFUND_REJECTED,
      entityType: EntityType.REFUND,
      entityId: id,
      metadata: { paymentId: refund.payment_id, rejectionReason },
      requestId,
      client,
    })
    return updated
  })
}
