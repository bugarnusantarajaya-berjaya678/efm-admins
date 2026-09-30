/**
 * Phase 2B — Assessment Module Tests
 * Covers: create (FK→participants_pp NOT client), list by participant/order,
 *         update, complete, archived guard, audit
 */
import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../../src/app.js'
import { setupTestDb, teardownTestDb, closeTestDb } from '../helpers/db.js'
import { seedCatalog, seedPic } from '../helpers/seedCatalog.js'

describe('PP Assessment Module', () => {
  beforeAll(async () => { await setupTestDb() })
  afterEach(async () => { await teardownTestDb() })
  afterAll(async () => { await closeTestDb() })

  async function createParticipant() {
    const { packageId } = await seedCatalog()
    const picId = await seedPic()
    const clientRes = await request(app).post('/api/pp/clients')
      .send({ fullName: 'Klien Asesmen', email: 'asesmen@test.com' }).expect(201)
    const clientId = clientRes.body.data.id
    const orderRes = await request(app).post('/api/pp/orders')
      .send({ clientId, packageId, picId }).expect(201)
    const orderId = orderRes.body.data.id
    const pRes = await request(app).post('/api/pp/participants')
      .send({ orderId, clientId, fullName: 'Klien Asesmen', gender: 'F' }).expect(201)
    return { participantId: pRes.body.data.id, orderId, clientId }
  }

  it('creates an assessment with SCR-YY-xxxx format', async () => {
    const { participantId } = await createParticipant()
    const res = await request(app).post('/api/pp/assessments').send({
      participantId,
      assessmentType: 'PRE',
      heightCm: 165,
      weightKg: 60,
      fitnessScore: 55,
    }).expect(201)
    expect(res.body.data.id).toMatch(/^SCR-\d{2}-\d{4}$/)
    expect(res.body.data.participant_id).toBe(participantId)
    expect(res.body.data.assessment_type).toBe('PRE')
    expect(res.body.data.status).toBe('DRAFT')
  })

  it('assessment order_id is derived from participant (NOT from request)', async () => {
    const { participantId, orderId } = await createParticipant()
    const res = await request(app).post('/api/pp/assessments').send({
      participantId,
      assessmentType: 'PRE',
    }).expect(201)
    expect(res.body.data.order_id).toBe(orderId)
  })

  it('returns 400 if participantId is missing', async () => {
    const res = await request(app).post('/api/pp/assessments')
      .send({ assessmentType: 'PRE' }).expect(400)
    expect(res.body.error.type).toBe('VALIDATION_ERROR')
  })

  it('returns 400 if assessmentType is missing', async () => {
    const { participantId } = await createParticipant()
    const res = await request(app).post('/api/pp/assessments')
      .send({ participantId }).expect(400)
    expect(res.body.error.type).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for invalid assessmentType', async () => {
    const { participantId } = await createParticipant()
    const res = await request(app).post('/api/pp/assessments')
      .send({ participantId, assessmentType: 'INVALID' }).expect(400)
    expect(res.body.error.type).toBe('VALIDATION_ERROR')
  })

  it('returns 404 when participant does not exist', async () => {
    const res = await request(app).post('/api/pp/assessments')
      .send({ participantId: 'PTR-PP-99-9999', assessmentType: 'PRE' }).expect(404)
    expect(res.body.error.type).toBe('NOT_FOUND')
  })

  it('retrieves an assessment by ID', async () => {
    const { participantId } = await createParticipant()
    const createRes = await request(app).post('/api/pp/assessments')
      .send({ participantId, assessmentType: 'PRE' }).expect(201)
    const id = createRes.body.data.id
    const getRes = await request(app).get(`/api/pp/assessments/${id}`).expect(200)
    expect(getRes.body.data.id).toBe(id)
  })

  it('lists assessments by participant ID', async () => {
    const { participantId } = await createParticipant()
    await request(app).post('/api/pp/assessments').send({ participantId, assessmentType: 'PRE' }).expect(201)
    await request(app).post('/api/pp/assessments').send({ participantId, assessmentType: 'MID' }).expect(201)
    const res = await request(app).get(`/api/pp/participants/${participantId}/assessments`).expect(200)
    expect(res.body.total).toBe(2)
    expect(res.body.data.every(a => a.participant_id === participantId)).toBe(true)
  })

  it('lists assessments by order ID', async () => {
    const { participantId, orderId } = await createParticipant()
    await request(app).post('/api/pp/assessments').send({ participantId, assessmentType: 'PRE' }).expect(201)
    const res = await request(app).get(`/api/pp/orders/${orderId}/assessments`).expect(200)
    expect(res.body.total).toBe(1)
    expect(res.body.data[0].order_id).toBe(orderId)
  })

  it('updates an assessment', async () => {
    const { participantId } = await createParticipant()
    const createRes = await request(app).post('/api/pp/assessments')
      .send({ participantId, assessmentType: 'PRE', weightKg: 60 }).expect(201)
    const id = createRes.body.data.id
    const patchRes = await request(app).patch(`/api/pp/assessments/${id}`)
      .send({ weightKg: 58.5, fitnessScore: 70, notes: 'Progress bagus' }).expect(200)
    expect(parseFloat(patchRes.body.data.weight_kg)).toBe(58.5)
    expect(patchRes.body.data.fitness_score).toBe(70)
  })

  it('completes an assessment (DRAFT → COMPLETED)', async () => {
    const { participantId } = await createParticipant()
    const createRes = await request(app).post('/api/pp/assessments')
      .send({ participantId, assessmentType: 'POST', heightCm: 170, weightKg: 72, fitnessScore: 80 }).expect(201)
    const id = createRes.body.data.id
    const patchRes = await request(app).patch(`/api/pp/assessments/${id}`)
      .send({ status: 'COMPLETED' }).expect(200)
    expect(patchRes.body.data.status).toBe('COMPLETED')
  })

  it('rejects update on archived assessment', async () => {
    const { participantId } = await createParticipant()
    const createRes = await request(app).post('/api/pp/assessments')
      .send({ participantId, assessmentType: 'PRE' }).expect(201)
    const id = createRes.body.data.id
    await request(app).patch(`/api/pp/assessments/${id}`).send({ status: 'ARCHIVED' }).expect(200)
    const res = await request(app).patch(`/api/pp/assessments/${id}`)
      .send({ notes: 'Coba update' }).expect(422)
    expect(res.body.error.type).toBe('BUSINESS_RULE_VIOLATION')
  })

  it('records ASSESSMENT_CREATED audit event', async () => {
    const { participantId } = await createParticipant()
    const createRes = await request(app).post('/api/pp/assessments')
      .send({ participantId, assessmentType: 'PRE' }).expect(201)
    const id = createRes.body.data.id
    const auditRes = await request(app).get(`/api/v1/audit/entity/Assessment/${id}`).expect(200)
    const eventTypes = auditRes.body.data.map(e => e.event_type)
    expect(eventTypes).toContain('ASSESSMENT_CREATED')
  })
})
