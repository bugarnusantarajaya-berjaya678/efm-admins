/**
 * Phase 3 — Agreement Module Tests
 * Covers: create, update content, issue, sign, void lifecycle
 */
import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../../src/app.js'
import { setupTestDb, teardownTestDb, closeTestDb } from '../helpers/db.js'
import { seedCatalog, seedPic } from '../helpers/seedCatalog.js'

describe('PP Agreement Module', () => {
  beforeAll(async () => { await setupTestDb() })
  afterEach(async () => { await teardownTestDb() })
  afterAll(async () => { await closeTestDb() })

  async function createOrderWithInvoice() {
    const { packageId, baseAmount } = await seedCatalog()
    const picId = await seedPic()
    const clientRes = await request(app).post('/api/pp/clients')
      .send({ fullName: 'Agr Client', email: 'agr@test.com' }).expect(201)
    const clientId = clientRes.body.data.id

    const orderRes = await request(app).post('/api/pp/orders').send({ clientId, packageId, picId }).expect(201)
    const orderId = orderRes.body.data.id

    await request(app).post(`/api/pp/orders/${orderId}/status`).send({ status: 'PENDING_PAYMENT' }).expect(200)

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)
    const invoiceRes = await request(app).post('/api/pp/invoices').send({
      orderId,
      dueDate: dueDate.toISOString().split('T')[0],
    }).expect(201)

    return { orderId, invoiceId: invoiceRes.body.data.id, finalAmount: baseAmount }
  }

  it('creates an agreement for an order that has an invoice', async () => {
    const { orderId } = await createOrderWithInvoice()
    const res = await request(app).post('/api/pp/agreements').send({ orderId }).expect(201)
    expect(res.body.data.id).toMatch(/^AGR-PP-/)
    expect(res.body.data.status).toBe('draft')
    expect(res.body.data.order_id).toBe(orderId)
  })

  it('rejects duplicate agreement for same order', async () => {
    const { orderId } = await createOrderWithInvoice()
    await request(app).post('/api/pp/agreements').send({ orderId }).expect(201)
    const res = await request(app).post('/api/pp/agreements').send({ orderId }).expect(409)
    expect(res.body.error.type).toBe('CONFLICT')
  })

  it('rejects agreement creation if no invoice exists', async () => {
    const { packageId } = await seedCatalog()
    const picId = await seedPic()
    const clientRes = await request(app).post('/api/pp/clients')
      .send({ fullName: 'No Inv', email: 'noinv@test.com' }).expect(201)
    const orderRes = await request(app).post('/api/pp/orders').send({
      clientId: clientRes.body.data.id,
      packageId,
      picId,
    }).expect(201)
    const res = await request(app).post('/api/pp/agreements')
      .send({ orderId: orderRes.body.data.id }).expect(409)
    expect(res.body.error.type).toBe('CONFLICT')
  })

  it('updates content body on a draft agreement', async () => {
    const { orderId } = await createOrderWithInvoice()
    const agr = await request(app).post('/api/pp/agreements').send({ orderId }).expect(201)
    const id = agr.body.data.id
    const res = await request(app).patch(`/api/pp/agreements/${id}`)
      .send({ contentBody: 'Updated content body.' }).expect(200)
    expect(res.body.data.content_body).toBe('Updated content body.')
  })

  it('cannot update content of an issued agreement', async () => {
    const { orderId } = await createOrderWithInvoice()
    const agr = await request(app).post('/api/pp/agreements').send({ orderId }).expect(201)
    const id = agr.body.data.id
    await request(app).post(`/api/pp/agreements/${id}/issue`).expect(200)
    const res = await request(app).patch(`/api/pp/agreements/${id}`)
      .send({ contentBody: 'Should fail.' }).expect(409)
    expect(res.body.error.type).toBe('CONFLICT')
  })

  it('issues an agreement (draft → issued)', async () => {
    const { orderId } = await createOrderWithInvoice()
    const agr = await request(app).post('/api/pp/agreements').send({ orderId }).expect(201)
    const res = await request(app).post(`/api/pp/agreements/${agr.body.data.id}/issue`).expect(200)
    expect(res.body.data.status).toBe('issued')
    expect(res.body.data.issued_at).not.toBeNull()
  })

  it('signs an issued agreement', async () => {
    const { orderId } = await createOrderWithInvoice()
    const agr = await request(app).post('/api/pp/agreements').send({ orderId }).expect(201)
    await request(app).post(`/api/pp/agreements/${agr.body.data.id}/issue`).expect(200)
    const res = await request(app).post(`/api/pp/agreements/${agr.body.data.id}/sign`)
      .send({ signedByName: 'Budi Santoso' }).expect(200)
    expect(res.body.data.status).toBe('signed')
    expect(res.body.data.signed_by_name).toBe('Budi Santoso')
  })

  it('cannot sign a draft agreement', async () => {
    const { orderId } = await createOrderWithInvoice()
    const agr = await request(app).post('/api/pp/agreements').send({ orderId }).expect(201)
    const res = await request(app).post(`/api/pp/agreements/${agr.body.data.id}/sign`)
      .send({ signedByName: 'Test' }).expect(409)
    expect(res.body.error.type).toBe('CONFLICT')
  })

  it('voids a draft agreement', async () => {
    const { orderId } = await createOrderWithInvoice()
    const agr = await request(app).post('/api/pp/agreements').send({ orderId }).expect(201)
    const res = await request(app).post(`/api/pp/agreements/${agr.body.data.id}/void`)
      .send({ voidedBy: 'admin', voidReason: 'Test void' }).expect(200)
    expect(res.body.data.status).toBe('voided')
  })

  it('cannot void a signed agreement', async () => {
    const { orderId } = await createOrderWithInvoice()
    const agr = await request(app).post('/api/pp/agreements').send({ orderId }).expect(201)
    await request(app).post(`/api/pp/agreements/${agr.body.data.id}/issue`).expect(200)
    await request(app).post(`/api/pp/agreements/${agr.body.data.id}/sign`)
      .send({ signedByName: 'Signed' }).expect(200)
    const res = await request(app).post(`/api/pp/agreements/${agr.body.data.id}/void`).expect(403)
    expect(res.body.error.type).toBe('FORBIDDEN')
  })

  it('retrieves agreement by order ID', async () => {
    const { orderId } = await createOrderWithInvoice()
    await request(app).post('/api/pp/agreements').send({ orderId }).expect(201)
    const res = await request(app).get(`/api/pp/orders/${orderId}/agreement`).expect(200)
    expect(res.body.data.order_id).toBe(orderId)
  })
})
