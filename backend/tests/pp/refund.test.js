/**
 * Phase 2A — Refund Module Tests
 * Covers: refund creation, full-refund-only rule, 1-per-payment, process, reject
 */
import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../../src/app.js'
import { setupTestDb, teardownTestDb, closeTestDb } from '../helpers/db.js'
import { seedCatalog, seedPic } from '../helpers/seedCatalog.js'

describe('PP Refund Module', () => {
  beforeAll(async () => { await setupTestDb() })
  afterEach(async () => { await teardownTestDb() })
  afterAll(async () => { await closeTestDb() })

  async function createConfirmedPayment() {
    const { packageId, baseAmount } = await seedCatalog()
    const picId = await seedPic()
    const clientRes = await request(app).post('/api/pp/clients')
      .send({ fullName: 'Refund Client', email: 'refund@test.com' }).expect(201)
    const clientId = clientRes.body.data.id
    const orderRes = await request(app).post('/api/pp/orders').send({
      clientId, packageId, picId,
    }).expect(201)
    const orderId = orderRes.body.data.id
    await request(app).post(`/api/pp/orders/${orderId}/status`).send({ status: 'PENDING_PAYMENT' }).expect(200)
    const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 14)
    const invoiceRes = await request(app).post('/api/pp/invoices').send({
      orderId, dueDate: dueDate.toISOString().split('T')[0],
    }).expect(201)
    const invoiceId = invoiceRes.body.data.id
    await request(app).post(`/api/pp/invoices/${invoiceId}/send`).expect(200)
    const payRes = await request(app).post('/api/pp/payments').send({
      invoiceId, amount: baseAmount, paymentMethod: 'transfer',
    }).expect(201)
    const paymentId = payRes.body.data.id
    await request(app).post(`/api/pp/payments/${paymentId}/confirm`).send({}).expect(200)
    return { orderId, invoiceId, paymentId, finalAmount: baseAmount }
  }

  it('creates a refund for a confirmed payment (full amount)', async () => {
    const { paymentId, finalAmount } = await createConfirmedPayment()
    const res = await request(app).post('/api/pp/refunds').send({
      paymentId, reason: 'Klien membatalkan',
    }).expect(201)
    expect(res.body.data.id).toMatch(/^REF-PP-\d{2}-\d{4}$/)
    expect(res.body.data.status).toBe('PENDING')
    expect(parseFloat(res.body.data.amount)).toBe(finalAmount)
  })

  it('rejects refund for non-confirmed payment', async () => {
    // Submit but don't confirm
    const { packageId, baseAmount } = await seedCatalog()
    const picId = await seedPic()
    const clientRes = await request(app).post('/api/pp/clients')
      .send({ fullName: 'Pending Pay', email: 'pp@test.com' }).expect(201)
    const clientId = clientRes.body.data.id
    const orderRes = await request(app).post('/api/pp/orders').send({ clientId, packageId, picId }).expect(201)
    const orderId = orderRes.body.data.id
    await request(app).post(`/api/pp/orders/${orderId}/status`).send({ status: 'PENDING_PAYMENT' }).expect(200)
    const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 14)
    const invoiceRes = await request(app).post('/api/pp/invoices').send({
      orderId, dueDate: dueDate.toISOString().split('T')[0],
    }).expect(201)
    await request(app).post(`/api/pp/invoices/${invoiceRes.body.data.id}/send`).expect(200)
    const payRes = await request(app).post('/api/pp/payments').send({
      invoiceId: invoiceRes.body.data.id, amount: baseAmount, paymentMethod: 'transfer',
    }).expect(201)
    const paymentId = payRes.body.data.id

    const res = await request(app).post('/api/pp/refunds').send({
      paymentId, reason: 'Test',
    }).expect(422)
    expect(res.body.error.type).toBe('BUSINESS_RULE_VIOLATION')
  })

  it('rejects duplicate refund for same payment (1 per payment rule)', async () => {
    const { paymentId } = await createConfirmedPayment()
    await request(app).post('/api/pp/refunds').send({ paymentId, reason: 'First' }).expect(201)
    const dupRes = await request(app).post('/api/pp/refunds').send({ paymentId, reason: 'Second' }).expect(409)
    expect(dupRes.body.error.type).toBe('CONFLICT')
  })

  it('processes a refund', async () => {
    const { paymentId } = await createConfirmedPayment()
    const refundRes = await request(app).post('/api/pp/refunds').send({
      paymentId, reason: 'Klien tidak jadi',
    }).expect(201)
    const refundId = refundRes.body.data.id

    const processRes = await request(app).post(`/api/pp/refunds/${refundId}/process`)
      .send({ processedBy: 'admin' }).expect(200)
    expect(processRes.body.data.status).toBe('PROCESSED')
  })

  it('rejects a refund and records audit event', async () => {
    const { paymentId } = await createConfirmedPayment()
    const refundRes = await request(app).post('/api/pp/refunds').send({
      paymentId, reason: 'Test',
    }).expect(201)
    const refundId = refundRes.body.data.id

    const rejectRes = await request(app).post(`/api/pp/refunds/${refundId}/reject`)
      .send({ rejectedBy: 'admin', rejectionReason: 'Tidak memenuhi syarat' }).expect(200)
    expect(rejectRes.body.data.status).toBe('REJECTED')

    const auditRes = await request(app).get(`/api/v1/audit/entity/Refund/${refundId}`).expect(200)
    const eventTypes = auditRes.body.data.map(e => e.event_type)
    expect(eventTypes).toContain('REFUND_CREATED')
    expect(eventTypes).toContain('REFUND_REJECTED')
  })
})
