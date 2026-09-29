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
