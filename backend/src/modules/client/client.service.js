import { withTransaction } from '../../db/index.js'
import { nextId, DOCTYPE, MODULE } from '../id/id.generator.js'
import { recordAuditEvent, AuditEventType, EntityType } from '../audit/audit.service.js'
import { validationError, notFound } from '../../shared/errors.js'
import { findClientById, findClientByLeadId, findAllClients, countClients, insertClient, updateClient } from './client.repository.js'

export async function listClients({ status, limit, offset } = {}) {
  const [data, total] = await Promise.all([
    findAllClients({ status, limit, offset }),
    countClients({ status }),
  ])
  return { data, total }
}

export async function getClient(id) {
  const client = await findClientById(id)
  if (!client) throw notFound('Client', id)
  return client
}

export async function createClient({ leadId, fullName, email, phone, address, notes }, requestId) {
  if (!fullName?.trim()) throw validationError('fullName is required')

  return withTransaction(async (client) => {
    const id = await nextId(DOCTYPE.CLIENT, MODULE.PP, { client })
    const record = await insertClient({ id, leadId, fullName: fullName.trim(), email, phone, address, notes }, client)
    await recordAuditEvent({
      eventType: AuditEventType.CLIENT_CREATED,
      entityType: EntityType.CLIENT,
      entityId: id,
      metadata: { fullName: record.full_name, leadId },
      requestId,
      client,
    })
    return record
  })
}

export async function updateClientDetails(id, updates, requestId) {
  const existing = await findClientById(id)
  if (!existing) throw notFound('Client', id)

  const fieldMap = {}
  if (updates.fullName !== undefined) fieldMap.full_name = updates.fullName.trim()
  if (updates.email !== undefined) fieldMap.email = updates.email
  if (updates.phone !== undefined) fieldMap.phone = updates.phone
  if (updates.address !== undefined) fieldMap.address = updates.address
  if (updates.notes !== undefined) fieldMap.notes = updates.notes
  if (updates.status !== undefined) {
    if (!['ACTIVE', 'INACTIVE'].includes(updates.status)) throw validationError('status must be ACTIVE or INACTIVE')
    fieldMap.status = updates.status
  }

  return withTransaction(async (client) => {
    const updated = await updateClient(id, fieldMap, client)
    await recordAuditEvent({
      eventType: AuditEventType.CLIENT_UPDATED,
      entityType: EntityType.CLIENT,
      entityId: id,
      metadata: { changes: fieldMap },
      requestId,
      client,
    })
    return updated
  })
}

/**
 * Find or create a client from a lead. Used during order creation.
 */
export async function resolveClientFromLead(leadId, leadData, requestId) {
  const existing = await findClientByLeadId(leadId)
  if (existing) return existing
  return createClient({
    leadId,
    fullName: leadData.full_name,
    email: leadData.email,
    phone: leadData.phone,
  }, requestId)
}
