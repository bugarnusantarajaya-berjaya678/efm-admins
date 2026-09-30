import { withTransaction } from '../../db/index.js'
import { nextId, DOCTYPE, MODULE } from '../id/id.generator.js'
import { recordAuditEvent, AuditEventType, EntityType } from '../audit/audit.service.js'
import { validationError, notFound } from '../../shared/errors.js'
import { findLeadById, findAllLeads, countLeads, insertLead, updateLead, updateLeadStatus } from './lead.repository.js'

const VALID_STATUSES = ['NEW', 'APPROACH', 'SCREENING', 'INVOICING', 'CLOSING', 'CONVERTED', 'CLOSED_LOST']

export async function listLeads({ status, limit, offset } = {}) {
  const [data, total] = await Promise.all([
    findAllLeads({ status, limit, offset }),
    countLeads({ status }),
  ])
  return { data, total }
}

export async function getLead(id) {
  const lead = await findLeadById(id)
  if (!lead) throw notFound('Lead', id)
  return lead
}

export async function createLead({ fullName, email, phone, source, notes }, requestId) {
  if (!fullName?.trim()) throw validationError('fullName is required')

  return withTransaction(async (client) => {
    const id = await nextId(DOCTYPE.LEAD_PP, MODULE.PP, { client })
    const lead = await insertLead({ id, fullName: fullName.trim(), email, phone, source, notes }, client)
    await recordAuditEvent({
      eventType: AuditEventType.LEAD_CREATED,
      entityType: EntityType.LEAD,
      entityId: id,
      metadata: { fullName: lead.full_name, source: lead.source },
      requestId,
      client,
    })
    return lead
  })
}

export async function updateLeadDetails(id, updates, requestId) {
  const lead = await findLeadById(id)
  if (!lead) throw notFound('Lead', id)

  const fieldMap = {}
  if (updates.fullName !== undefined) fieldMap.full_name = updates.fullName.trim()
  if (updates.email !== undefined) fieldMap.email = updates.email
  if (updates.phone !== undefined) fieldMap.phone = updates.phone
  if (updates.source !== undefined) fieldMap.source = updates.source
  if (updates.notes !== undefined) fieldMap.notes = updates.notes
  if (updates.status !== undefined) {
    if (!VALID_STATUSES.includes(updates.status)) throw validationError(`Invalid status: ${updates.status}`)
    fieldMap.status = updates.status
  }

  return withTransaction(async (client) => {
    const updated = await updateLead(id, fieldMap, client)
    await recordAuditEvent({
      eventType: AuditEventType.LEAD_UPDATED,
      entityType: EntityType.LEAD,
      entityId: id,
      metadata: { changes: fieldMap },
      requestId,
      client,
    })
    return updated
  })
}

export async function convertLead(id, requestId) {
  const lead = await findLeadById(id)
  if (!lead) throw notFound('Lead', id)
  if (lead.status === 'CONVERTED') throw validationError('Lead is already converted')
  if (lead.status === 'CLOSED_LOST') throw validationError('Cannot convert a closed-lost lead')

  return withTransaction(async (client) => {
    const updated = await updateLeadStatus(id, 'CONVERTED', client)
    await recordAuditEvent({
      eventType: AuditEventType.LEAD_CONVERTED,
      entityType: EntityType.LEAD,
      entityId: id,
      metadata: { previousStatus: lead.status },
      requestId,
      client,
    })
    return updated
  })
}
