import { v4 as uuidv4 } from 'uuid'
import { query } from '../../db/index.js'

/**
 * Audit repository — append-only.
 * No update or delete operations are provided.
 */

export async function insertAuditEvent({ eventType, entityType, entityId, actorId, metadata, requestId }, client) {
  const id = uuidv4()
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO audit_events
       (id, event_type, entity_type, entity_id, actor_id, metadata, request_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [id, eventType, entityType, entityId, actorId ?? null, metadata ?? {}, requestId ?? null]
  )
  return rows[0]
}

export async function getAuditEventsByEntity(entityType, entityId, limit = 50) {
  const { rows } = await query(
    `SELECT * FROM audit_events
     WHERE entity_type = $1 AND entity_id = $2
     ORDER BY occurred_at DESC
     LIMIT $3`,
    [entityType, entityId, limit]
  )
  return rows
}

export async function getAuditEventsByRequest(requestId) {
  const { rows } = await query(
    `SELECT * FROM audit_events
     WHERE request_id = $1
     ORDER BY occurred_at ASC`,
    [requestId]
  )
  return rows
}
