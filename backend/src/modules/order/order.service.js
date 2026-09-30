import { withTransaction, query } from '../../db/index.js'
import { nextId, DOCTYPE, MODULE } from '../id/id.generator.js'
import { recordAuditEvent, AuditEventType, EntityType } from '../audit/audit.service.js'
import { validationError, notFound, businessRuleViolation } from '../../shared/errors.js'
import { classifyUrgency } from './deadline.engine.js'
import { getPackage, resolvePackagePrice, getOffering, getProgram } from '../catalog/catalog.service.js'
import {
  findOrderById, findAllOrders, countOrders,
  insertOrder, updateOrderStatus, updateOrderUrgency,
  insertCommercialSnapshot, findSnapshotByOrderId,
} from './order.repository.js'

const VALID_STATUS_TRANSITIONS = {
  DRAFT: ['PENDING_PAYMENT', 'CANCELLED'],
  PENDING_PAYMENT: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
}

export async function listOrders({ clientId, status, limit, offset } = {}) {
  const [data, total] = await Promise.all([
    findAllOrders({ clientId, status, limit, offset }),
    countOrders({ clientId, status }),
  ])
  return { data, total }
}

export async function getOrder(id) {
  const order = await findOrderById(id)
  if (!order) throw notFound('Order', id)
  return order
}

export async function getOrderWithSnapshot(id) {
  const order = await getOrder(id)
  const snapshot = await findSnapshotByOrderId(id)
  return { ...order, snapshot }
}

export async function createOrder({ clientId, leadId, packageId, picId, startDate, notes }, requestId) {
  if (!clientId) throw validationError('clientId is required')
  if (!packageId) throw validationError('packageId is required')
  if (!picId) throw validationError('picId is required')

  const pkg = await getPackage(packageId)
  const offering = await getOffering(pkg.offering_id)
  const program = await getProgram(offering.program_id)
  const unitPrice = await resolvePackagePrice(packageId)
  const baseAmount = unitPrice * pkg.session_count
  const finalAmount = baseAmount // no discount at creation

  const urgency = classifyUrgency(startDate)

  return withTransaction(async (client) => {
    const id = await nextId(DOCTYPE.ORDER, MODULE.PP, { client })
    const order = await insertOrder({
      id, clientId, leadId, packageId, picId,
      startDate: startDate ?? null,
      sessionsTotal: pkg.session_count,
      notes,
    }, client)

    // Update urgency flag if URGENT
    let finalOrder = order
    if (urgency === 'URGENT') {
      finalOrder = await updateOrderUrgency(id, 'URGENT', client)
    }

    // Write-once commercial snapshot — store resolved names, not FKs
    await insertCommercialSnapshot({
      orderId: id,
      packageName: pkg.name,
      offeringName: offering.name,
      programName: program.name,
      sessionsTotal: pkg.session_count,
      unitPrice,
      baseAmount,
      discountCode: null,
      discountAmount: 0,
      finalAmount,
    }, client)

    await recordAuditEvent({
      eventType: AuditEventType.ORDER_CREATED,
      entityType: EntityType.ORDER,
      entityId: id,
      metadata: { clientId, packageId, urgency, finalAmount },
      requestId,
      client,
    })

    if (urgency === 'URGENT') {
      await recordAuditEvent({
        eventType: AuditEventType.ORDER_URGENCY_FLAGGED,
        entityType: EntityType.ORDER,
        entityId: id,
        metadata: { urgencyFlag: 'URGENT', startDate },
        requestId,
        client,
      })
    }

    return finalOrder
  })
}

const ORDER_EVENT_MAP = {
  ACTIVE: AuditEventType.ORDER_ACTIVATED,
  COMPLETED: AuditEventType.ORDER_COMPLETED,
  CANCELLED: AuditEventType.ORDER_CANCELLED,
}

/**
 * Transition an order to a new status.
 * Accepts an optional txClient to run within an existing transaction.
 * Idempotent: if already in targetStatus, returns the current order without error.
 */
export async function transitionOrderStatus(id, targetStatus, requestId, txClient) {
  const execute = async (client) => {
    const order = await findOrderById(id, client)
    if (!order) throw notFound('Order', id)

    // Idempotent: already in target state — return gracefully
    if (order.status === targetStatus) return order

    const allowed = VALID_STATUS_TRANSITIONS[order.status] ?? []
    if (!allowed.includes(targetStatus)) {
      throw businessRuleViolation(
        'INVALID_STATUS_TRANSITION',
        `Cannot transition order from ${order.status} to ${targetStatus}`
      )
    }

    const updated = await updateOrderStatus(id, targetStatus, client)
    await recordAuditEvent({
      eventType: ORDER_EVENT_MAP[targetStatus] ?? AuditEventType.ORDER_UPDATED,
      entityType: EntityType.ORDER,
      entityId: id,
      metadata: { from: order.status, to: targetStatus },
      requestId,
      client,
    })
    return updated
  }
  return txClient ? execute(txClient) : withTransaction(execute)
}

/**
 * Program Readiness — derived state, never stored (D-09 / OPEN-2B-04).
 * An order is "program ready" when status = ACTIVE and its invoice = PAID.
 */
export async function isOrderProgramReady(orderId) {
  const { rows } = await query(
    `SELECT o.status AS order_status, i.status AS invoice_status
     FROM orders_pp o
     LEFT JOIN invoices_pp i ON i.order_id = o.id
     WHERE o.id = $1`,
    [orderId]
  )
  if (!rows.length) return false
  const { order_status, invoice_status } = rows[0]
  return order_status === 'ACTIVE' && invoice_status === 'PAID'
}
