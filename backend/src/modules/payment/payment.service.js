import { withTransaction } from '../../db/index.js'
import { recordAuditEvent, AuditEventType, EntityType } from '../audit/audit.service.js'
import { validationError, notFound, conflict, businessRuleViolation } from '../../shared/errors.js'
import { findInvoiceById } from '../invoice/invoice.repository.js'
import { markInvoicePaid } from '../invoice/invoice.service.js'
import { transitionOrderStatus } from '../order/order.service.js'
import {
  findPaymentById, findPaymentsByInvoice, findConfirmedPaymentByInvoice,
  insertPayment, updatePaymentStatus,
} from './payment.repository.js'
import { createReceipt } from '../receipt/receipt.service.js'

// Gate 03A tolerance: exact match ± tolerance (default 0)
const PAYMENT_TOLERANCE = parseFloat(process.env.PP_PAYMENT_TOLERANCE ?? '0')

export async function getPayment(id) {
  const payment = await findPaymentById(id)
  if (!payment) throw notFound('Payment', id)
  return payment
}

export async function listPaymentsByInvoice(invoiceId) {
  return findPaymentsByInvoice(invoiceId)
}

export async function submitPayment({ invoiceId, amount, paymentMethod, paymentDate, referenceNo, notes }, requestId) {
  if (!invoiceId) throw validationError('invoiceId is required')
  if (!amount || amount <= 0) throw validationError('amount must be positive')
  if (!paymentMethod) throw validationError('paymentMethod is required')

  const invoice = await findInvoiceById(invoiceId)
  if (!invoice) throw notFound('Invoice', invoiceId)

  // Gate 03B: reject if a CONFIRMED payment already exists (check before status)
  const existing = await findConfirmedPaymentByInvoice(invoiceId)
  if (existing) {
    throw conflict(`Invoice ${invoiceId} already has a confirmed payment (${existing.id})`)
  }

  if (!['SENT', 'OVERDUE'].includes(invoice.status)) {
    throw businessRuleViolation('PAYMENT_INVALID_INVOICE_STATUS',
      `Cannot submit payment for invoice in status ${invoice.status}`)
  }

  return withTransaction(async (client) => {
    const payment = await insertPayment({
      invoiceId,
      orderId: invoice.order_id,
      amount: parseFloat(amount),
      paymentMethod,
      paymentDate,
      referenceNo,
      notes,
    }, client)

    await recordAuditEvent({
      eventType: AuditEventType.PAYMENT_SUBMITTED,
      entityType: EntityType.PAYMENT,
      entityId: payment.id,
      metadata: { invoiceId, amount: payment.amount, paymentMethod },
      requestId,
      client,
    })
    return payment
  })
}

export async function confirmPayment(id, { confirmedBy } = {}, requestId) {
  const payment = await findPaymentById(id)
  if (!payment) throw notFound('Payment', id)
  if (payment.status !== 'PENDING') {
    throw businessRuleViolation('PAYMENT_NOT_PENDING', `Payment is in status ${payment.status}`)
  }

  const invoice = await findInvoiceById(payment.invoice_id)
  if (!invoice) throw notFound('Invoice', payment.invoice_id)

  // Gate 03B: reject duplicate confirmation
  const alreadyConfirmed = await findConfirmedPaymentByInvoice(payment.invoice_id)
  if (alreadyConfirmed && alreadyConfirmed.id !== id) {
    throw conflict(`Invoice ${payment.invoice_id} already has a confirmed payment (${alreadyConfirmed.id})`)
  }

  // Gate 03A: full payment check (amount must equal invoice amount ± tolerance)
  const expectedAmount = parseFloat(invoice.final_amount)
  const paidAmount = parseFloat(payment.amount)
  const diff = Math.abs(paidAmount - expectedAmount)
  if (diff > PAYMENT_TOLERANCE) {
    throw businessRuleViolation('PAYMENT_AMOUNT_MISMATCH',
      `Payment amount ${paidAmount} does not match invoice amount ${expectedAmount} (tolerance: ${PAYMENT_TOLERANCE})`)
  }

  return withTransaction(async (client) => {
    // Confirm the payment
    const confirmed = await updatePaymentStatus(id, 'CONFIRMED', {
      confirmedAt: new Date().toISOString(),
      confirmedBy: confirmedBy ?? 'system',
    }, client)

    await recordAuditEvent({
      eventType: AuditEventType.PAYMENT_CONFIRMED,
      entityType: EntityType.PAYMENT,
      entityId: id,
      metadata: { invoiceId: payment.invoice_id, amount: payment.amount },
      requestId,
      client,
    })

    // Mark invoice as PAID
    await markInvoicePaid(payment.invoice_id, requestId, client)

    // Transition order PENDING_PAYMENT → ACTIVE
    try {
      await transitionOrderStatus(invoice.order_id, 'ACTIVE', requestId)
    } catch {
      // Order may already be ACTIVE if transitioned externally; non-fatal
    }

    // Auto-generate receipt
    const receipt = await createReceipt({
      paymentId: id,
      orderId: invoice.order_id,
      amount: payment.amount,
    }, requestId, client)

    return { payment: confirmed, receipt }
  })
}

export async function rejectPayment(id, { rejectedBy, rejectionReason } = {}, requestId) {
  const payment = await findPaymentById(id)
  if (!payment) throw notFound('Payment', id)
  if (payment.status !== 'PENDING') {
    throw businessRuleViolation('PAYMENT_NOT_PENDING', `Payment is in status ${payment.status}`)
  }

  return withTransaction(async (client) => {
    const rejected = await updatePaymentStatus(id, 'REJECTED', {
      rejectedAt: new Date().toISOString(),
      rejectedBy: rejectedBy ?? 'system',
      rejectionReason: rejectionReason ?? '',
    }, client)

    await recordAuditEvent({
      eventType: AuditEventType.PAYMENT_REJECTED,
      entityType: EntityType.PAYMENT,
      entityId: id,
      metadata: { invoiceId: payment.invoice_id, rejectionReason },
      requestId,
      client,
    })
    return rejected
  })
}
