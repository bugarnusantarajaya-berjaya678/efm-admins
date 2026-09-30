/**
 * Phase 2A — Client Module Tests
 */
import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../../src/app.js'
import { setupTestDb, teardownTestDb, closeTestDb } from '../helpers/db.js'

describe('PP Client Module', () => {
  beforeAll(async () => { await setupTestDb() })
  afterEach(async () => { await teardownTestDb() })
  afterAll(async () => { await closeTestDb() })

  const validClient = {
    fullName: 'Siti Nurhaliza',
    email: 'siti@example.com',
    phone: '+62812000001',
  }

  it('creates a client with KL-xxxx format', async () => {
    const res = await request(app).post('/api/pp/clients').send(validClient).expect(201)
    expect(res.body.data.id).toMatch(/^KL-\d{4}$/)
    expect(res.body.data.full_name).toBe('Siti Nurhaliza')
    expect(res.body.data.status).toBe('ACTIVE')
  })

  it('returns 400 if fullName is missing', async () => {
    const res = await request(app).post('/api/pp/clients').send({ email: 'x@x.com' }).expect(400)
    expect(res.body.error.type).toBe('VALIDATION_ERROR')
  })

  it('retrieves a client by ID', async () => {
    const createRes = await request(app).post('/api/pp/clients').send(validClient).expect(201)
    const id = createRes.body.data.id
    const getRes = await request(app).get(`/api/pp/clients/${id}`).expect(200)
    expect(getRes.body.data.id).toBe(id)
    expect(getRes.body.data.full_name).toBe('Siti Nurhaliza')
  })

  it('returns 404 for unknown client', async () => {
    const res = await request(app).get('/api/pp/clients/KL-9999').expect(404)
    expect(res.body.error.type).toBe('NOT_FOUND')
  })

  it('updates client details and records audit event', async () => {
    const createRes = await request(app).post('/api/pp/clients').send(validClient).expect(201)
    const id = createRes.body.data.id
    await request(app).patch(`/api/pp/clients/${id}`).send({ phone: '+6289999' }).expect(200)

    const auditRes = await request(app).get(`/api/v1/audit/entity/Client/${id}`).expect(200)
    const eventTypes = auditRes.body.data.map(e => e.event_type)
    expect(eventTypes).toContain('CLIENT_CREATED')
    expect(eventTypes).toContain('CLIENT_UPDATED')
  })
})
