/**
 * Phase 3 — Attendance Module Tests
 * Covers: create record, duplicate prevention, field update, list by order
 */
import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../../src/app.js'
import { setupTestDb, teardownTestDb, closeTestDb } from '../helpers/db.js'
import { seedCatalog, seedPic } from '../helpers/seedCatalog.js'

describe('PP Attendance Module', () => {
  beforeAll(async () => { await setupTestDb() })
  afterEach(async () => { await teardownTestDb() })
  afterAll(async () => { await closeTestDb() })

  async function createOrder() {
    const { packageId } = await seedCatalog()
    const picId = await seedPic()
    const clientRes = await request(app).post('/api/pp/clients')
      .send({ fullName: 'Att Client', email: 'att@test.com' }).expect(201)
    const orderRes = await request(app).post('/api/pp/orders').send({
      clientId: clientRes.body.data.id,
      packageId,
      picId,
    }).expect(201)
    return orderRes.body.data.id
  }

  it('creates an attendance record', async () => {
    const orderId = await createOrder()
    const res = await request(app).post(`/api/pp/orders/${orderId}/attendance`).send({
      sessionNumber: 1,
      sessionDate: '2026-10-10',
      clientPresent: true,
      trainerPresent: true,
      trainerName: 'Marcus Chen',
    }).expect(201)
    expect(res.body.data.id).toMatch(/^ATT-PP-/)
    expect(res.body.data.session_number).toBe(1)
    expect(res.body.data.trainer_name).toBe('Marcus Chen')
  })

  it('prevents duplicate session numbers per order', async () => {
    const orderId = await createOrder()
    await request(app).post(`/api/pp/orders/${orderId}/attendance`).send({
      sessionNumber: 1,
      sessionDate: '2026-10-10',
    }).expect(201)
    const res = await request(app).post(`/api/pp/orders/${orderId}/attendance`).send({
      sessionNumber: 1,
      sessionDate: '2026-10-17',
    }).expect(409)
    expect(res.body.error.type).toBe('CONFLICT')
  })

  it('allows same session number for different orders', async () => {
    const orderId1 = await createOrder()
    const orderId2 = await createOrder()
    await request(app).post(`/api/pp/orders/${orderId1}/attendance`).send({
      sessionNumber: 1, sessionDate: '2026-10-10',
    }).expect(201)
    await request(app).post(`/api/pp/orders/${orderId2}/attendance`).send({
      sessionNumber: 1, sessionDate: '2026-10-10',
    }).expect(201)
  })

  it('lists attendance by order', async () => {
    const orderId = await createOrder()
    await request(app).post(`/api/pp/orders/${orderId}/attendance`).send({ sessionNumber: 1, sessionDate: '2026-10-10' }).expect(201)
    await request(app).post(`/api/pp/orders/${orderId}/attendance`).send({ sessionNumber: 2, sessionDate: '2026-10-17' }).expect(201)
    const res = await request(app).get(`/api/pp/orders/${orderId}/attendance`).expect(200)
    expect(res.body.count).toBe(2)
    expect(res.body.data[0].session_number).toBe(1)
    expect(res.body.data[1].session_number).toBe(2)
  })

  it('returns 404 for unknown attendance ID', async () => {
    const res = await request(app).get('/api/pp/attendance/ATT-PP-99-9999').expect(404)
    expect(res.body.error.type).toBe('NOT_FOUND')
  })
})
