/**
 * Phase 2A — Lead Module Tests
 */
import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../../src/app.js'
import { setupTestDb, teardownTestDb, closeTestDb } from '../helpers/db.js'

describe('PP Lead Module', () => {
  beforeAll(async () => { await setupTestDb() })
  afterEach(async () => { await teardownTestDb() })
  afterAll(async () => { await closeTestDb() })

  const validLead = {
    fullName: 'Ahmad Fauzi',
    email: 'ahmad@example.com',
    phone: '+62812345678',
    source: 'instagram',
  }

  it('creates a lead with LP-xxxx format', async () => {
    const res = await request(app).post('/api/pp/leads').send(validLead).expect(201)
    expect(res.body.data.id).toMatch(/^LP-\d{4}$/)
    expect(res.body.data.full_name).toBe('Ahmad Fauzi')
    expect(res.body.data.status).toBe('NEW')
  })

  it('returns 400 if fullName is missing', async () => {
    const res = await request(app).post('/api/pp/leads').send({ email: 'x@x.com' }).expect(400)
    expect(res.body.error.type).toBe('VALIDATION_ERROR')
  })

  it('retrieves a lead by ID', async () => {
    const createRes = await request(app).post('/api/pp/leads').send(validLead).expect(201)
    const id = createRes.body.data.id
    const getRes = await request(app).get(`/api/pp/leads/${id}`).expect(200)
    expect(getRes.body.data.id).toBe(id)
  })

  it('returns 404 for unknown lead', async () => {
    const res = await request(app).get('/api/pp/leads/LP-9999').expect(404)
    expect(res.body.error.type).toBe('NOT_FOUND')
  })

  it('updates lead details', async () => {
    const createRes = await request(app).post('/api/pp/leads').send(validLead).expect(201)
    const id = createRes.body.data.id
    const patchRes = await request(app).patch(`/api/pp/leads/${id}`).send({ status: 'APPROACH' }).expect(200)
    expect(patchRes.body.data.status).toBe('APPROACH')
  })

  it('converts a lead and records audit event', async () => {
    const createRes = await request(app).post('/api/pp/leads').send(validLead).expect(201)
    const id = createRes.body.data.id
    const convertRes = await request(app).post(`/api/pp/leads/${id}/convert`).expect(200)
    expect(convertRes.body.data.status).toBe('CONVERTED')

    const auditRes = await request(app).get(`/api/v1/audit/entity/Lead/${id}`).expect(200)
    const eventTypes = auditRes.body.data.map(e => e.event_type)
    expect(eventTypes).toContain('LEAD_CREATED')
    expect(eventTypes).toContain('LEAD_CONVERTED')
  })

  it('lists leads with filter by status', async () => {
    await request(app).post('/api/pp/leads').send(validLead).expect(201)
    await request(app).post('/api/pp/leads').send({ ...validLead, fullName: 'Budi', email: 'b@x.com' }).expect(201)
    const res = await request(app).get('/api/pp/leads?status=NEW').expect(200)
    expect(res.body.total).toBe(2)
    expect(res.body.data.every(l => l.status === 'NEW')).toBe(true)
  })
})
