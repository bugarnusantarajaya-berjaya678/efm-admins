/**
 * Phase 1 Acceptance — PIC Master Foundation
 * Checklist: Phase Gate item "PIC Master foundation is tested"
 * Authorization: DEC-02
 *
 * Requires a live PostgreSQL database (TEST_DATABASE_URL).
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals'
import request from 'supertest'
import app from '../../src/app.js'
import { setupTestDb, teardownTestDb, closeTestDb } from '../helpers/db.js'
import { v4 as uuidv4 } from 'uuid'

describe('PIC Master Foundation', () => {
  beforeAll(async () => { await setupTestDb() })
  afterEach(async () => { await teardownTestDb() })
  afterAll(async () => { await closeTestDb() })

  const validPic = {
    fullName: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    phone: '+62811234567',
    contexts: [{ module: 'PP', role: 'trainer', costRate: 150000, chargeRate: 200000 }],
  }

  it('creates a PIC with correct ID format PIC-YY-xxxx', async () => {
    const res = await request(app)
      .post('/api/v1/pics')
      .send(validPic)
      .expect(201)

    expect(res.body.data.id).toMatch(/^PIC-\d{2}-\d{4}$/)
    expect(res.body.data.full_name).toBe('Marcus Chen')
    expect(res.body.data.status).toBe('active')
  })

  it('creates a PIC audit event on creation', async () => {
    const res = await request(app)
      .post('/api/v1/pics')
      .send(validPic)
      .expect(201)

    const picId = res.body.data.id
    const auditRes = await request(app)
      .get(`/api/v1/audit/entity/PIC/${picId}`)
      .expect(200)

    expect(auditRes.body.data).toHaveLength(1)
    expect(auditRes.body.data[0].event_type).toBe('PIC_CREATED')
  })

  it('assigns PIC to multiple business contexts (DEC-02)', async () => {
    const multi = {
      fullName: 'Dewi Rahayu',
      email: 'dewi@example.com',
      contexts: [
        { module: 'PP', role: 'trainer', costRate: 150000, chargeRate: 200000 },
        { module: 'B2B', role: 'coordinator', costRate: 200000, chargeRate: 300000 },
      ],
    }
    const res = await request(app).post('/api/v1/pics').send(multi).expect(201)
    expect(res.body.data.contexts).toHaveLength(2)
  })

  it('returns 400 if fullName is missing', async () => {
    const res = await request(app)
      .post('/api/v1/pics')
      .send({ email: 'nofullname@example.com' })
      .expect(400)
    expect(res.body.error.type).toBe('VALIDATION_ERROR')
  })

  it('retrieves a PIC by ID', async () => {
    const createRes = await request(app).post('/api/v1/pics').send(validPic).expect(201)
    const id = createRes.body.data.id

    const getRes = await request(app).get(`/api/v1/pics/${id}`).expect(200)
    expect(getRes.body.data.id).toBe(id)
    expect(getRes.body.data.full_name).toBe('Marcus Chen')
  })

  it('returns 404 for unknown PIC ID', async () => {
    const res = await request(app).get('/api/v1/pics/PIC-00-9999').expect(404)
    expect(res.body.error.type).toBe('NOT_FOUND')
  })

  it('lists all PICs', async () => {
    await request(app).post('/api/v1/pics').send(validPic).expect(201)
    await request(app).post('/api/v1/pics').send({ ...validPic, fullName: 'Sarah Jenkins', email: 'sarah@example.com' }).expect(201)

    const res = await request(app).get('/api/v1/pics').expect(200)
    expect(res.body.count).toBe(2)
  })

  it('updates PIC details and records audit event', async () => {
    const createRes = await request(app).post('/api/v1/pics').send(validPic).expect(201)
    const id = createRes.body.data.id

    await request(app).patch(`/api/v1/pics/${id}`).send({ phone: '+62899999999' }).expect(200)

    const auditRes = await request(app).get(`/api/v1/audit/entity/PIC/${id}`).expect(200)
    expect(auditRes.body.data.length).toBeGreaterThanOrEqual(2) // created + updated
  })

  it('adds a context to an existing PIC', async () => {
    const createRes = await request(app).post('/api/v1/pics').send({ fullName: 'Ali Hassan', email: 'ali@example.com' }).expect(201)
    const id = createRes.body.data.id

    const ctxRes = await request(app)
      .post(`/api/v1/pics/${id}/contexts`)
      .send({ module: 'EVENT', role: 'trainer', chargeRate: 250000 })
      .expect(201)

    expect(ctxRes.body.data.module).toBe('EVENT')
    expect(ctxRes.body.data.pic_id).toBe(id)
  })
})
