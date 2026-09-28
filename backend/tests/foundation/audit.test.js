/**
 * Phase 1 Acceptance — Audit Foundation
 * Checklist items: E-a through E-f
 *
 * Requires a live PostgreSQL database (TEST_DATABASE_URL).
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals'
import { recordAuditEvent, getEntityHistory, getRequestTrace, AuditEventType, EntityType } from '../../src/modules/audit/audit.service.js'
import { setupTestDb, teardownTestDb, closeTestDb } from '../helpers/db.js'
import { v4 as uuidv4 } from 'uuid'

describe('Audit Foundation', () => {
  beforeAll(async () => { await setupTestDb() })
  afterEach(async () => { await teardownTestDb() })
  afterAll(async () => { await closeTestDb() })

  it('creates an audit event with all required fields', async () => {
    const requestId = uuidv4()
    const event = await recordAuditEvent({
      eventType: AuditEventType.CREATED,
      entityType: EntityType.ORDER,
      entityId: 'PP-26-0001',
      actorId: 'user:admin',
      metadata: { source: 'test' },
      requestId,
    })

    expect(event.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(event.event_type).toBe(AuditEventType.CREATED)
    expect(event.entity_type).toBe(EntityType.ORDER)
    expect(event.entity_id).toBe('PP-26-0001')
    expect(event.actor_id).toBe('user:admin')
    expect(event.metadata).toMatchObject({ source: 'test' })
    expect(event.request_id).toBe(requestId)
    expect(event.occurred_at).toBeTruthy()
  })

  it('records actor where available (E-b)', async () => {
    const e = await recordAuditEvent({
      eventType: AuditEventType.UPDATED,
      entityType: EntityType.PIC,
      entityId: 'PIC-26-0001',
      actorId: 'user:bagoes',
      metadata: {},
    })
    expect(e.actor_id).toBe('user:bagoes')
  })

  it('allows null actorId for system events', async () => {
    const e = await recordAuditEvent({
      eventType: AuditEventType.CREATED,
      entityType: EntityType.LEAD,
      entityId: 'LP-0001',
      actorId: null,
      metadata: {},
    })
    expect(e.actor_id).toBeNull()
  })

  it('records entity reference (E-d)', async () => {
    const e = await recordAuditEvent({
      eventType: AuditEventType.CREATED,
      entityType: EntityType.INVOICE,
      entityId: 'INV-PP-26-0001',
      metadata: {},
    })
    expect(e.entity_type).toBe(EntityType.INVOICE)
    expect(e.entity_id).toBe('INV-PP-26-0001')
  })

  it('records correlation/request ID (E-e)', async () => {
    const requestId = uuidv4()
    const e = await recordAuditEvent({
      eventType: AuditEventType.CREATED,
      entityType: EntityType.ORDER,
      entityId: 'PP-26-0002',
      metadata: {},
      requestId,
    })
    expect(e.request_id).toBe(requestId)
  })

  it('audit history is append-only — no update returns on row (E-f)', async () => {
    // There is no updateAuditEvent export — verify by checking the module
    const auditModule = await import('../../src/modules/audit/audit.service.js')
    expect(auditModule.updateAuditEvent).toBeUndefined()
    expect(auditModule.deleteAuditEvent).toBeUndefined()
  })

  it('getEntityHistory returns events for an entity in descending order', async () => {
    await recordAuditEvent({ eventType: AuditEventType.CREATED, entityType: EntityType.ORDER, entityId: 'PP-26-0001', metadata: {} })
    await recordAuditEvent({ eventType: AuditEventType.UPDATED, entityType: EntityType.ORDER, entityId: 'PP-26-0001', metadata: {} })

    const history = await getEntityHistory(EntityType.ORDER, 'PP-26-0001')
    expect(history).toHaveLength(2)
    expect(history[0].event_type).toBe(AuditEventType.UPDATED) // newest first
  })

  it('getRequestTrace returns all events for a correlation ID', async () => {
    const requestId = uuidv4()
    await recordAuditEvent({ eventType: AuditEventType.CREATED, entityType: EntityType.ORDER, entityId: 'PP-26-0001', metadata: {}, requestId })
    await recordAuditEvent({ eventType: AuditEventType.CREATED, entityType: EntityType.INVOICE, entityId: 'INV-PP-26-0001', metadata: {}, requestId })

    const trace = await getRequestTrace(requestId)
    expect(trace).toHaveLength(2)
    expect(trace.every(e => e.request_id === requestId)).toBe(true)
  })
})
