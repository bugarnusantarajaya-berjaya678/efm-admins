/**
 * Phase 2B — Participant Module Tests
 * Covers: create, one-per-order constraint, get by order, update, audit
 */
import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../../src/app.js'
import { setupTestDb, teardownTestDb, closeTestDb } from '../helpers/db.js'
import { seedCatalog, seedPic } from '../helpers/seedCatalog.js'

describe('PP Participant Module', () => {
  beforeAll(async () => { await setupTestDb() })
  afterEach(async () => { await teardownTestDb() })
  afterAll(async () => { await closeTestDb() })

  async function createOrderWithClient() {
    const { packageId } = await seedCatalog()
    const picId = await seedPic()
    const clientRes = await request(app).post('/api/pp/clients')
      .send({ fullName: 'Peserta Test', email: 'peserta@test.com' }).expect(201)
    const clientId = clientRes.body.data.id
    const orderRes = await request(app).post('/api/pp/orders')
      .send({ clientId, packageId, picId }).expect(201)
    return { orderId: orderRes.body.data.id, clientId }
  }

  it('creates a participant with PTR-PP-YY-xxxx format', async () => {
    const { orderId, clientId } = await createOrderWithClient()
    const res = await request(app).post('/api/pp/participants').send({
      orderId, clientId, fullName: 'Budi Santoso',
      gender: 'M', initialFitnessLevel: 'BEGINNER',
    }).expect(201)
    expect(res.body.data.id).toMatch(/^PTR-PP-\d{2}-\d{4}$/)
    expect(res.body.data.order_id).toBe(orderId)
    expect(res.body.data.client_id).toBe(clientId)
    expect(res.body.data.full_name).toBe('Budi Santoso')
    expect(res.body.data.status).toBe('ACTIVE')
  })

  it('returns 400 if orderId is missing', async () => {
    const res = await request(app).post('/api/pp/participants')
      .send({ clientId: 'KL-0001', fullName: 'Test' }).expect(400)
    expect(res.body.error.type).toBe('VALIDATION_ERROR')
  })

  it('returns 400 if fullName is missing', async () => {
    const { orderId, clientId } = await createOrderWithClient()
    const res = await request(app).post('/api/pp/participants')
      .send({ orderId, clientId }).expect(400)
    expect(res.body.error.type).toBe('VALIDATION_ERROR')
  })

  it('enforces one participant per order (409 on duplicate)', async () => {
    const { orderId, clientId } = await createOrderWithClient()
    await request(app).post('/api/pp/participants')
      .send({ orderId, clientId, fullName: 'Pertama' }).expect(201)
    const dupRes = await request(app).post('/api/pp/participants')
      .send({ orderId, clientId, fullName: 'Kedua' }).expect(409)
    expect(dupRes.body.error.type).toBe('CONFLICT')
  })

  it('retrieves a participant by ID', async () => {
    const { orderId, clientId } = await createOrderWithClient()
    const createRes = await request(app).post('/api/pp/participants')
      .send({ orderId, clientId, fullName: 'Retrieve Test' }).expect(201)
    const id = createRes.body.data.id
    const getRes = await request(app).get(`/api/pp/participants/${id}`).expect(200)
    expect(getRes.body.data.id).toBe(id)
  })

  it('retrieves a participant by order ID', async () => {
    const { orderId, clientId } = await createOrderWithClient()
    await request(app).post('/api/pp/participants')
      .send({ orderId, clientId, fullName: 'Order Lookup' }).expect(201)
    const res = await request(app).get(`/api/pp/orders/${orderId}/participant`).expect(200)
    expect(res.body.data.order_id).toBe(orderId)
  })

  it('returns 404 for unknown participant', async () => {
    const res = await request(app).get('/api/pp/participants/PTR-PP-99-9999').expect(404)
    expect(res.body.error.type).toBe('NOT_FOUND')
  })

  it('updates participant details', async () => {
    const { orderId, clientId } = await createOrderWithClient()
    const createRes = await request(app).post('/api/pp/participants')
      .send({ orderId, clientId, fullName: 'Before Update' }).expect(201)
    const id = createRes.body.data.id
    const patchRes = await request(app).patch(`/api/pp/participants/${id}`)
      .send({ fitnessGoals: 'Menurunkan berat badan', initialFitnessLevel: 'INTERMEDIATE' }).expect(200)
    expect(patchRes.body.data.fitness_goals).toBe('Menurunkan berat badan')
    expect(patchRes.body.data.initial_fitness_level).toBe('INTERMEDIATE')
  })

  it('records PARTICIPANT_CREATED audit event', async () => {
    const { orderId, clientId } = await createOrderWithClient()
    const createRes = await request(app).post('/api/pp/participants')
      .send({ orderId, clientId, fullName: 'Audit Test' }).expect(201)
    const id = createRes.body.data.id
    const auditRes = await request(app).get(`/api/v1/audit/entity/Participant/${id}`).expect(200)
    const eventTypes = auditRes.body.data.map(e => e.event_type)
    expect(eventTypes).toContain('PARTICIPANT_CREATED')
  })
})
