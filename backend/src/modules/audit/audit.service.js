import { insertAuditEvent, getAuditEventsByEntity, getAuditEventsByRequest } from './audit.repository.js'

export const AuditEventType = Object.freeze({
  // Generic lifecycle
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  // Agreement
  AGREEMENT_ISSUED: 'AGREEMENT_ISSUED',
  AGREEMENT_SIGNED: 'AGREEMENT_SIGNED',
  AGREEMENT_UPDATE_BLOCKED: 'AGREEMENT_UPDATE_BLOCKED',
  // PIC
  PIC_CREATED: 'PIC_CREATED',
  PIC_UPDATED: 'PIC_UPDATED',
  PIC_STATUS_CHANGED: 'PIC_STATUS_CHANGED',
  // Phase 2A — Lead
  LEAD_CREATED: 'LEAD_CREATED',
  LEAD_UPDATED: 'LEAD_UPDATED',
  LEAD_CONVERTED: 'LEAD_CONVERTED',
  LEAD_CLOSED_LOST: 'LEAD_CLOSED_LOST',
  // Phase 2A — Client
  CLIENT_CREATED: 'CLIENT_CREATED',
  CLIENT_UPDATED: 'CLIENT_UPDATED',
  // Phase 2A — Order
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_UPDATED: 'ORDER_UPDATED',
  ORDER_ACTIVATED: 'ORDER_ACTIVATED',
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_URGENCY_FLAGGED: 'ORDER_URGENCY_FLAGGED',
  // Phase 2A — Invoice
  INVOICE_ISSUED: 'INVOICE_ISSUED',
  INVOICE_SENT: 'INVOICE_SENT',
  INVOICE_PAID: 'INVOICE_PAID',
  INVOICE_OVERDUE: 'INVOICE_OVERDUE',
  INVOICE_CANCELLED: 'INVOICE_CANCELLED',
  // Phase 2A — Payment
  PAYMENT_SUBMITTED: 'PAYMENT_SUBMITTED',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  PAYMENT_REJECTED: 'PAYMENT_REJECTED',
  // Phase 2A — Receipt
  RECEIPT_CREATED: 'RECEIPT_CREATED',
  // Phase 2A — Refund
  REFUND_CREATED: 'REFUND_CREATED',
  REFUND_PROCESSED: 'REFUND_PROCESSED',
  REFUND_REJECTED: 'REFUND_REJECTED',
  // Phase 2B — Participant
  PARTICIPANT_CREATED: 'PARTICIPANT_CREATED',
  PARTICIPANT_UPDATED: 'PARTICIPANT_UPDATED',
  // Phase 2B — Assessment
  ASSESSMENT_CREATED: 'ASSESSMENT_CREATED',
  ASSESSMENT_UPDATED: 'ASSESSMENT_UPDATED',
  ASSESSMENT_COMPLETED: 'ASSESSMENT_COMPLETED',
  // Phase 3 — Storage & Attendance
  PROOF_UPLOADED: 'PROOF_UPLOADED',
  PDF_GENERATED: 'PDF_GENERATED',
  ATTENDANCE_CREATED: 'ATTENDANCE_CREATED',
  ATTENDANCE_PHOTO_UPLOADED: 'ATTENDANCE_PHOTO_UPLOADED',
})

export const EntityType = Object.freeze({
  ORDER: 'Order',
  INVOICE: 'Invoice',
  RECEIPT: 'Receipt',
  AGREEMENT: 'Agreement',
  HNS: 'HealthAndSafety',
  ASSESSMENT: 'Assessment',
  PARTICIPANT: 'Participant',
  LEAD: 'Lead',
  PIC: 'PIC',
  ASSIGNMENT: 'Assignment',
  SESSION: 'Session',
  ATTENDANCE: 'Attendance',
  // Phase 2A Commercial Core
  CLIENT: 'Client',
  PAYMENT: 'Payment',
  REFUND: 'Refund',
  CATALOG: 'Catalog',
})

/**
 * Record an audit event.
 * @param {object} params
 * @param {string} params.eventType    - AuditEventType value
 * @param {string} params.entityType   - EntityType value
 * @param {string} params.entityId     - document ID (e.g. "PP-26-0001")
 * @param {string} [params.actorId]    - user/system actor identifier
 * @param {object} [params.metadata]   - additional structured data
 * @param {string} [params.requestId]  - correlation UUID from middleware
 * @param {object} [params.client]     - pg client for transactional context
 */
export async function recordAuditEvent(params) {
  return insertAuditEvent(params, params.client)
}

export async function getEntityHistory(entityType, entityId) {
  return getAuditEventsByEntity(entityType, entityId)
}

export async function getRequestTrace(requestId) {
  return getAuditEventsByRequest(requestId)
}
