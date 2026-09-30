/**
 * Phase 2A — Order Module Tests
 * Covers: order creation, commercial snapshot, urgency classification, status transitions
 */
import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../../src/app.js'
import { setupTestDb, teardownTestDb, closeTestDb } from '../helpers/db.js'
import { seedCatalog, seedPic } from '../helpers/seedCatalog.js'

describe('PP Order Module', () => {
  beforeAll(async () => { await setupTestDb() })
  afterEach(async () => { await teardownTestDb() })
  afterAll(async () => { await closeTestDb() })

  async function createTestClient() {
    const res = await request(app).post('/api/pp/clients').send({ fullName: 'Test Client', email: 'client@test.com' }).expect(201)
    return res.body.data.id
  }

  it('creates an order with PP-YY-xxxx format and DRAFT status', async () => {
    const { packageId } = await seedCatalog()
    const picId = await seedPic()
    const clientId = await createTestClient()

    const res = await request(app).post('/api/pp/orders').send({
      clientId, packageId, picId,
      startDate: '2026-12-31',
    }).expect(201)

    expect(res.body.data.id).toMatch(/^PP-\d{2}-\d{4}$/)
    expect(res.body.data.status).toBe('DRAFT')
    expect(res.body.data.sessions_total).toBe(12)
  })

  it('creates a commercial snapshot at order creation', async () => {
    const { packageId, baseAmount } = await seedCatalog()
    const picId = await seedPic()
    const clientId = await createTestClient()

    const orderRes = await request(app).post('/api/pp/orders').send({
      clientId, packageId, picId, startDate: '2026-12-31',
    }).expect(201)

    const id = orderRes.body.data.id
    const detailRes = await request(app).get(`/api/pp/orders/${id}`).expect(200)
    const snapshot = detailRes.body.data.snapshot
    expect(snapshot).toBeTruthy()
    expect(parseFloat(snapshot.base_amount)).toBe(baseAmount)
    expect(parseFloat(snapshot.final_amount)).toBe(baseAmount)
    expect(parseFloat(snapshot.discount_amount)).toBe(0)
  })

  it('classifies NORMAL urgency for start date > H+1', async () => {
    const { packageId } = await seedCatalog()
    const picId = await seedPic()
    const clientId = await createTestClient()

    const farFuture = new Date()
    farFuture.setDate(farFuture.getDate() + 10)
    const startDate = farFuture.toISOString().split('T')[0]

    const res = await request(app).post('/api/pp/orders').send({
      clientId, packageId, picId, startDate,
    }).expect(201)

    expect(res.body.data.urgency_flag).toBe('NORMAL')
  })

  it('classifies URGENT for same-day start', async () => {
    const { packageId } = await seedCatalog()
    const picId = await seedPic()
    const clientId = await createTestClient()

    const today = new Date().toISOString().split('T')[0]
    const res = await request(app).post('/api/pp/orders').send({
      clientId, packageId, picId, startDate: today,
    }).expect(201)

    expect(res.body.data.urgency_flag).toBe('URGENT')
  })

  it('classifies URGENT for H-1 (tomorrow)', async () => {
    const { packageId } = await seedCatalog()
    const picId = await seedPic()
    const clientId = await createTestClient()

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const startDate = tomorrow.toISOString().split('T')[0]

    const res = await request(app).post('/api/pp/orders').send({
      clientId, packageId, picId, startDate,
    }).expect(201)

    expect(res.body.data.urgency_flag).toBe('URGENT')
  })

  it('transitions order status DRAFT → PENDING_PAYMENT', async () => {
    const { packageId } = await seedCatalog()
    const picId = await seedPic()
    const clientId = await createTestClient()

    const orderRes = await request(app).post('/api/pp/orders').send({
      clientId, packageId, picId,
    }).expect(201)
    const id = orderRes.body.data.id

    const statusRes = await request(app).post(`/api/pp/orders/${id}/status`)
      .send({ status: 'PENDING_PAYMENT' }).expect(200)
    expect(statusRes.body.data.status).toBe('PENDING_PAYMENT')
  })

  it('rejects invalid status transition', async () => {
    const { packageId } = await seedCatalog()
    const picId = await seedPic()
    const clientId = await createTestClient()

    const orderRes = await request(app).post('/api/pp/orders').send({
      clientId, packageId, picId,
    }).expect(201)
    const id = orderRes.body.data.id

    const res = await request(app).post(`/api/pp/orders/${id}/status`)
      .send({ status: 'COMPLETED' }).expect(422)
    expect(res.body.error.type).toBe('BUSINESS_RULE_VIOLATION')
  })

  it('returns 400 if clientId is missing', async () => {
    const { packageId } = await seedCatalog()
    const picId = await seedPic()
    const res = await request(app).post('/api/pp/orders').send({ packageId, picId }).expect(400)
    expect(res.body.error.type).toBe('VALIDATION_ERROR')
  })

  it('records ORDER_CREATED audit event', async () => {
    const { packageId } = await seedCatalog()
    const picId = await seedPic()
    const clientId = await createTestClient()

    const orderRes = await request(app).post('/api/pp/orders').send({
      clientId, packageId, picId,
    }).expect(201)
    const id = orderRes.body.data.id

    const auditRes = await request(app).get(`/api/v1/audit/entity/Order/${id}`).expect(200)
    const eventTypes = auditRes.body.data.map(e => e.event_type)
    expect(eventTypes).toContain('ORDER_CREATED')
  })
})
