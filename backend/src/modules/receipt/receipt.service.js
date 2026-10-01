import { withTransaction } from '../../db/index.js'
import { nextId, DOCTYPE, MODULE } from '../id/id.generator.js'
import { recordAuditEvent, AuditEventType, EntityType } from '../audit/audit.service.js'
import { notFound } from '../../shared/errors.js'
import {
  findReceiptById, findReceiptByPaymentId, findReceiptsByOrder,
  insertReceipt, updateReceiptPdfPath,
} from './receipt.repository.js'
import { findPaymentById } from '../payment/payment.repository.js'
import { findOrderById } from '../order/order.repository.js'
import { findSnapshotByOrderId } from '../order/order.repository.js'
import { findClientById } from '../client/client.repository.js'
import { generateReceiptPdf } from '../../services/pdf.service.js'
import { uploadFile, replaceFile, getSignedUrl } from '../../services/storage.service.js'

const PDF_BUCKET = 'receipts'

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

export async function generateAndStoreReceiptPdf(id, requestId) {
  const receipt = await findReceiptById(id)
  if (!receipt) throw notFound('Receipt', id)

  const [payment, snapshot] = await Promise.all([
    findPaymentById(receipt.payment_id),
    findSnapshotByOrderId(receipt.order_id),
  ])

  const clientRec = snapshot ? await findClientById(snapshot.client_id ?? null).catch(() => null) : null
  const clientName = clientRec?.full_name ?? receipt.order_id

  const pdfBuffer = await generateReceiptPdf({
    id: receipt.id,
    orderId: receipt.order_id,
    invoiceId: payment?.invoice_id ?? receipt.order_id,
    clientName,
    packageName:   snapshot?.package_name ?? receipt.order_id,
    amount:        parseFloat(receipt.amount),
    issuedDate:    receipt.created_at,
    paymentMethod: payment?.payment_method ?? '-',
    notes:         receipt.notes,
  })

  const pdfPath = `${receipt.order_id}/${receipt.id}.pdf`
  const uploadFn = receipt.pdf_path ? replaceFile : uploadFile
  try {
    await uploadFn(PDF_BUCKET, pdfPath, pdfBuffer, 'application/pdf')
  } catch (err) {
    console.warn(`[receipt] PDF upload skipped: ${err.message}`)
    return receipt
  }

  const updated = await updateReceiptPdfPath(id, pdfPath, null)

  await recordAuditEvent({
    eventType: AuditEventType.PDF_GENERATED,
    entityType: EntityType.RECEIPT,
    entityId: id,
    metadata: { pdfPath },
    requestId,
  })

  try {
    const pdfUrl = await getSignedUrl(PDF_BUCKET, pdfPath, 3600)
    return { ...updated, pdf_url: pdfUrl }
  } catch {
    return updated
  }
}
