/**
 * Phase 2A — Payment Module Tests
 * Covers: exact/under/over payment, duplicate confirmation, receipt auto-generation
 */
import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../../src/app.js'
import { setupTestDb, teardownTestDb, closeTestDb } from '../helpers/db.js'
import { seedCatalog, seedPic } from '../helpers/seedCatalog.js'

describe('PP Payment Module', () => {
  beforeAll(async () => { await setupTestDb() })
  afterEach(async () => { await teardownTestDb() })
  afterAll(async () => { await closeTestDb() })

  async function createPendingInvoice() {
    const { packageId, baseAmount } = await seedCatalog()
    const picId = await seedPic()
    const clientRes = await request(app).post('/api/pp/clients')
      .send({ fullName: 'Pay Client', email: 'pay@test.com' }).expect(201)
    const clientId = clientRes.body.data.id

    const orderRes = await request(app).post('/api/pp/orders').send({
      clientId, packageId, picId,
    }).expect(201)
    const orderId = orderRes.body.data.id

    await request(app).post(`/api/pp/orders/${orderId}/status`).send({ status: 'PENDING_PAYMENT' }).expect(200)

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14)
    const invoiceRes = await request(app).post('/api/pp/invoices').send({
      orderId,
      dueDate: dueDate.toISOString().split('T')[0],
    }).expect(201)
    const invoiceId = invoiceRes.body.data.id

    await request(app).post(`/api/pp/invoices/${invoiceId}/send`).expect(200)

    return { orderId, invoiceId, finalAmount: baseAmount }
  }

  it('submits a payment in PENDING status', async () => {
    const { invoiceId, finalAmount } = await createPendingInvoice()
    const res = await request(app).post('/api/pp/payments').send({
      invoiceId,
      amount: finalAmount,
      paymentMethod: 'bank_transfer',
    }).expect(201)
    expect(res.body.data.status).toBe('PENDING')
    expect(parseFloat(res.body.data.amount)).toBe(finalAmount)
  })

  it('confirms exact-amount payment and auto-generates receipt', async () => {
    const { invoiceId, finalAmount } = await createPendingInvoice()
    const payRes = await request(app).post('/api/pp/payments').send({
      invoiceId,
      amount: finalAmount,
      paymentMethod: 'bank_transfer',
    }).expect(201)
    const paymentId = payRes.body.data.id

    const confirmRes = await request(app).post(`/api/pp/payments/${paymentId}/confirm`)
      .send({ confirmedBy: 'admin' }).expect(200)

    expect(confirmRes.body.data.payment.status).toBe('CONFIRMED')
    const receipt = confirmRes.body.data.receipt
    expect(receipt).toBeTruthy()
    expect(receipt.id).toMatch(/^RCP-PP-\d{2}-\d{4}$/)
    expect(parseFloat(receipt.amount)).toBe(finalAmount)
  })

  it('marks invoice as PAID after payment confirmation', async () => {
    const { invoiceId, finalAmount } = await createPendingInvoice()
    const payRes = await request(app).post('/api/pp/payments').send({
      invoiceId, amount: finalAmount, paymentMethod: 'cash',
    }).expect(201)
    await request(app).post(`/api/pp/payments/${payRes.body.data.id}/confirm`).send({}).expect(200)

    const invRes = await request(app).get(`/api/pp/invoices/${invoiceId}`).expect(200)
    expect(invRes.body.data.status).toBe('PAID')
  })

  it('activates order after payment confirmation (PENDING_PAYMENT → ACTIVE)', async () => {
    const { orderId, invoiceId, finalAmount } = await createPendingInvoice()
    const payRes = await request(app).post('/api/pp/payments').send({
      invoiceId, amount: finalAmount, paymentMethod: 'transfer',
    }).expect(201)
    await request(app).post(`/api/pp/payments/${payRes.body.data.id}/confirm`).send({}).expect(200)

    const orderRes = await request(app).get(`/api/pp/orders/${orderId}`).expect(200)
    expect(orderRes.body.data.status).toBe('ACTIVE')
  })

  it('rejects under-payment (Gate 03A)', async () => {
    const { invoiceId, finalAmount } = await createPendingInvoice()
    const underAmount = finalAmount - 1000
    const payRes = await request(app).post('/api/pp/payments').send({
      invoiceId, amount: underAmount, paymentMethod: 'transfer',
    }).expect(201)
    const paymentId = payRes.body.data.id

    const confirmRes = await request(app).post(`/api/pp/payments/${paymentId}/confirm`).send({}).expect(422)
    expect(confirmRes.body.error.type).toBe('BUSINESS_RULE_VIOLATION')
    expect(confirmRes.body.error.details.rule).toBe('PAYMENT_AMOUNT_MISMATCH')
  })

  it('rejects over-payment (Gate 03A)', async () => {
    const { invoiceId, finalAmount } = await createPendingInvoice()
    const overAmount = finalAmount + 1000
    const payRes = await request(app).post('/api/pp/payments').send({
      invoiceId, amount: overAmount, paymentMethod: 'transfer',
    }).expect(201)
    const paymentId = payRes.body.data.id

    const confirmRes = await request(app).post(`/api/pp/payments/${paymentId}/confirm`).send({}).expect(422)
    expect(confirmRes.body.error.type).toBe('BUSINESS_RULE_VIOLATION')
  })

  it('rejects duplicate payment submission after confirmation (Gate 03B)', async () => {
    const { invoiceId, finalAmount } = await createPendingInvoice()
    const payRes = await request(app).post('/api/pp/payments').send({
      invoiceId, amount: finalAmount, paymentMethod: 'transfer',
    }).expect(201)
    await request(app).post(`/api/pp/payments/${payRes.body.data.id}/confirm`).send({}).expect(200)

    // Attempt to submit a second payment for the same invoice
    const dupRes = await request(app).post('/api/pp/payments').send({
      invoiceId, amount: finalAmount, paymentMethod: 'cash',
    }).expect(409)
    expect(dupRes.body.error.type).toBe('CONFLICT')
  })

  it('rejects a payment and records audit event', async () => {
    const { invoiceId, finalAmount } = await createPendingInvoice()
    const payRes = await request(app).post('/api/pp/payments').send({
      invoiceId, amount: finalAmount, paymentMethod: 'transfer',
    }).expect(201)
    const paymentId = payRes.body.data.id

    const rejectRes = await request(app).post(`/api/pp/payments/${paymentId}/reject`)
      .send({ rejectedBy: 'admin', rejectionReason: 'Bukti tidak valid' }).expect(200)
    expect(rejectRes.body.data.status).toBe('REJECTED')

    const auditRes = await request(app).get(`/api/v1/audit/entity/Payment/${paymentId}`).expect(200)
    const eventTypes = auditRes.body.data.map(e => e.event_type)
    expect(eventTypes).toContain('PAYMENT_SUBMITTED')
    expect(eventTypes).toContain('PAYMENT_REJECTED')
  })

  it('program readiness is true only when order ACTIVE and invoice PAID', async () => {
    const { orderId, invoiceId, finalAmount } = await createPendingInvoice()

    // Before payment: not ready
    let readiness = await request(app).get(`/api/pp/orders/${orderId}/readiness`).expect(200)
    expect(readiness.body.data.programReady).toBe(false)

    const payRes = await request(app).post('/api/pp/payments').send({
      invoiceId, amount: finalAmount, paymentMethod: 'transfer',
    }).expect(201)
    await request(app).post(`/api/pp/payments/${payRes.body.data.id}/confirm`).send({}).expect(200)

    // After payment: ready
    readiness = await request(app).get(`/api/pp/orders/${orderId}/readiness`).expect(200)
    expect(readiness.body.data.programReady).toBe(true)
  })
})
