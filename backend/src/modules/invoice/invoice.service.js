import { withTransaction } from '../../db/index.js'
import { nextId, DOCTYPE, MODULE } from '../id/id.generator.js'
import { recordAuditEvent, AuditEventType, EntityType } from '../audit/audit.service.js'
import { validationError, notFound, conflict, businessRuleViolation } from '../../shared/errors.js'
import { findOrderById } from '../order/order.repository.js'
import { findSnapshotByOrderId } from '../order/order.repository.js'
import {
  findInvoiceById, findInvoiceByOrderId, findAllInvoices, countInvoices,
  insertInvoice, updateInvoiceStatus, updateInvoicePdfPath, findOverdueInvoices,
} from './invoice.repository.js'
import { generateInvoicePdf } from '../../services/pdf.service.js'
import { uploadFile, replaceFile, getSignedUrl } from '../../services/storage.service.js'
import { findClientById } from '../client/client.repository.js'

const PDF_BUCKET = 'invoices'

export async function listInvoices({ status, limit, offset } = {}) {
  const [data, total] = await Promise.all([
    findAllInvoices({ status, limit, offset }),
    countInvoices({ status }),
  ])
  return { data, total }
}

export async function getInvoice(id) {
  const invoice = await findInvoiceById(id)
  if (!invoice) throw notFound('Invoice', id)
  return invoice
}

export async function getInvoiceByOrder(orderId) {
  const invoice = await findInvoiceByOrderId(orderId)
  if (!invoice) throw notFound('Invoice', `order:${orderId}`)
  return invoice
}

export async function issueInvoice({ orderId, dueDate, notes }, requestId) {
  if (!orderId) throw validationError('orderId is required')
  if (!dueDate) throw validationError('dueDate is required')

  const order = await findOrderById(orderId)
  if (!order) throw notFound('Order', orderId)

  if (!['DRAFT', 'PENDING_PAYMENT'].includes(order.status)) {
    throw businessRuleViolation('INVOICE_INVALID_ORDER_STATUS',
      `Cannot issue invoice for order in status ${order.status}`)
  }

  const existing = await findInvoiceByOrderId(orderId)
  if (existing && !['CANCELLED'].includes(existing.status)) {
    throw conflict(`An active invoice already exists for order ${orderId}`)
  }

  const snapshot = await findSnapshotByOrderId(orderId)
  if (!snapshot) throw businessRuleViolation('MISSING_SNAPSHOT', 'Order has no commercial snapshot')

  return withTransaction(async (client) => {
    const id = await nextId(DOCTYPE.INVOICE, MODULE.PP, { client })
    const invoice = await insertInvoice({
      id, orderId,
      dueDate,
      finalAmount: snapshot.final_amount,
      notes,
    }, client)

    await recordAuditEvent({
      eventType: AuditEventType.INVOICE_ISSUED,
      entityType: EntityType.INVOICE,
      entityId: id,
      metadata: { orderId, finalAmount: snapshot.final_amount, dueDate },
      requestId,
      client,
    })
    return invoice
  })
}

export async function sendInvoice(id, requestId) {
  const invoice = await findInvoiceById(id)
  if (!invoice) throw notFound('Invoice', id)
  if (invoice.status !== 'DRAFT') {
    throw businessRuleViolation('INVOICE_NOT_DRAFT', `Invoice is in status ${invoice.status}, not DRAFT`)
  }

  return withTransaction(async (client) => {
    const updated = await updateInvoiceStatus(id, 'SENT', client)
    await recordAuditEvent({
      eventType: AuditEventType.INVOICE_SENT,
      entityType: EntityType.INVOICE,
      entityId: id,
      metadata: {},
      requestId,
      client,
    })
    return updated
  })
}

export async function markInvoicePaid(id, requestId, client) {
  const execute = async (txClient) => {
    const updated = await updateInvoiceStatus(id, 'PAID', txClient)
    await recordAuditEvent({
      eventType: AuditEventType.INVOICE_PAID,
      entityType: EntityType.INVOICE,
      entityId: id,
      metadata: {},
      requestId,
      client: txClient,
    })
    return updated
  }
  return client ? execute(client) : withTransaction(execute)
}

export async function cancelInvoice(id, requestId) {
  const invoice = await findInvoiceById(id)
  if (!invoice) throw notFound('Invoice', id)
  if (['PAID', 'CANCELLED'].includes(invoice.status)) {
    throw businessRuleViolation('INVOICE_CANNOT_CANCEL', `Cannot cancel invoice in status ${invoice.status}`)
  }

  return withTransaction(async (client) => {
    const updated = await updateInvoiceStatus(id, 'CANCELLED', client)
    await recordAuditEvent({
      eventType: AuditEventType.INVOICE_CANCELLED,
      entityType: EntityType.INVOICE,
      entityId: id,
      metadata: {},
      requestId,
      client,
    })
    return updated
  })
}

export async function generateAndStoreInvoicePdf(id, requestId) {
  const invoice = await findInvoiceById(id)
  if (!invoice) throw notFound('Invoice', id)

  const snapshot = await findSnapshotByOrderId(invoice.order_id)
  const clientRec = snapshot ? await findClientById(snapshot.client_id ?? null) : null
  const clientName = clientRec?.full_name ?? invoice.order_id

  const pdfBuffer = await generateInvoicePdf({
    id: invoice.id,
    orderId: invoice.order_id,
    clientName,
    packageName:   snapshot?.package_name ?? invoice.order_id,
    sessionsTotal: snapshot?.sessions_total ?? 0,
    unitPrice:     snapshot ? (parseFloat(snapshot.final_amount) / (snapshot.sessions_total || 1)) : 0,
    finalAmount:   parseFloat(invoice.final_amount),
    issuedDate:    invoice.created_at,
    dueDate:       invoice.due_date,
    status:        invoice.status,
    notes:         invoice.notes,
  })

  const pdfPath = `${invoice.order_id}/${invoice.id}.pdf`
  const uploadFn = invoice.pdf_path ? replaceFile : uploadFile
  try {
    await uploadFn(PDF_BUCKET, pdfPath, pdfBuffer, 'application/pdf')
  } catch (err) {
    console.warn(`[invoice] PDF upload skipped: ${err.message}`)
    return invoice
  }

  const updated = await updateInvoicePdfPath(id, pdfPath, null)

  await recordAuditEvent({
    eventType: AuditEventType.PDF_GENERATED,
    entityType: EntityType.INVOICE,
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

/**
 * On-demand overdue check. Marks SENT invoices past due_date as OVERDUE.
 * Returns count of updated invoices.
 */
export async function runOverdueCheck(requestId) {
  const overdueList = await findOverdueInvoices()
  let count = 0
  for (const invoice of overdueList) {
    await withTransaction(async (client) => {
      await updateInvoiceStatus(invoice.id, 'OVERDUE', client)
      await recordAuditEvent({
        eventType: AuditEventType.INVOICE_OVERDUE,
        entityType: EntityType.INVOICE,
        entityId: invoice.id,
        metadata: { dueDate: invoice.due_date },
        requestId,
        client,
      })
    })
    count++
  }
  return count
}
