/**
 * End-to-End: Full PP Order Lifecycle
 *
 * Simulates the complete realistic journey for a PP client:
 *   Client created → Order created → PENDING_PAYMENT status →
 *   Invoice issued → Invoice sent → Payment submitted →
 *   Payment confirmed (auto-generates Receipt + transitions Order to ACTIVE) →
 *   Agreement created + issued + signed →
 *   Attendance recorded →
 *   Assessment recorded →
 *   Audit trail verified
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../../src/app.js'
import { setupTestDb, teardownTestDb, closeTestDb } from '../helpers/db.js'
import { seedCatalog, seedPic } from '../helpers/seedCatalog.js'

describe('PP Full Lifecycle E2E', () => {
  beforeAll(async () => { await setupTestDb() })
  afterEach(async () => { await teardownTestDb() })
  afterAll(async () => { await closeTestDb() })

  it('runs the complete PP workflow without errors', async () => {
    // ── Step 1: Catalog + PIC setup ──────────────────────────────────────────
    const { packageId, baseAmount, sessionsTotal } = await seedCatalog()
    const picId = await seedPic()

    // ── Step 2: Create a client ───────────────────────────────────────────────
    const clientRes = await request(app).post('/api/pp/clients').send({
      fullName: 'Siti Rahayu',
      email: 'siti.rahayu@example.com',
      phone: '08120000001',
    }).expect(201)
    const clientId = clientRes.body.data.id
    expect(clientId).toMatch(/^KL-\d{4}$/)

    // ── Step 3: Create an order ────────────────────────────────────────────────
    const orderRes = await request(app).post('/api/pp/orders').send({
      clientId, packageId, picId,
      startDate: '2026-11-01',
    }).expect(201)
    const orderId = orderRes.body.data.id
    expect(orderId).toMatch(/^PP-\d{2}-\d{4}$/)
    expect(orderRes.body.data.status).toBe('DRAFT')

    // ── Step 4: Transition order to PENDING_PAYMENT ───────────────────────────
    const statusRes = await request(app)
      .post(`/api/pp/orders/${orderId}/status`)
      .send({ status: 'PENDING_PAYMENT' })
      .expect(200)
    expect(statusRes.body.data.status).toBe('PENDING_PAYMENT')

    // ── Step 5: Issue invoice ─────────────────────────────────────────────────
    const dueDate = '2026-11-15'
    const invoiceRes = await request(app).post('/api/pp/invoices').send({
      orderId, dueDate,
      notes: 'E2E test invoice',
    }).expect(201)
    const invoiceId = invoiceRes.body.data.id
    expect(invoiceId).toMatch(/^INV-PP-\d{2}-\d{4}$/)
    expect(invoiceRes.body.data.status).toBe('DRAFT')
    expect(parseFloat(invoiceRes.body.data.final_amount)).toBe(baseAmount)

    // ── Step 6: Send invoice (DRAFT → SENT) ───────────────────────────────────
    const sentRes = await request(app)
      .post(`/api/pp/invoices/${invoiceId}/send`)
      .expect(200)
    expect(sentRes.body.data.status).toBe('SENT')

    // ── Step 7: Submit payment ────────────────────────────────────────────────
    const paymentRes = await request(app).post('/api/pp/payments').send({
      invoiceId,
      amount: baseAmount,
      paymentMethod: 'transfer',
      paymentDate: '2026-11-10',
      referenceNo: 'TRF-E2E-001',
    }).expect(201)
    const paymentId = paymentRes.body.data.id
    expect(paymentId).toBeTruthy() // payments use UUID internally
    expect(paymentRes.body.data.status).toBe('PENDING')

    // ── Step 8: Confirm payment (auto-generates receipt + sets order ACTIVE) ──
    const confirmRes = await request(app)
      .post(`/api/pp/payments/${paymentId}/confirm`)
      .send({ confirmedBy: 'admin-e2e' })
      .expect(200)
    expect(confirmRes.body.data.payment.status).toBe('CONFIRMED')
    const receiptId = confirmRes.body.data.receipt.id
    expect(receiptId).toMatch(/^RCP-PP-\d{2}-\d{4}$/)

    // Order must be ACTIVE now
    const orderCheckRes = await request(app).get(`/api/pp/orders/${orderId}`).expect(200)
    expect(orderCheckRes.body.data.status).toBe('ACTIVE')

    // Invoice must be PAID
    const invoiceCheckRes = await request(app).get(`/api/pp/invoices/${invoiceId}`).expect(200)
    expect(invoiceCheckRes.body.data.status).toBe('PAID')

    // ── Step 9: Create agreement ──────────────────────────────────────────────
    const agRes = await request(app).post('/api/pp/agreements').send({
      orderId,
    }).expect(201)
    const agId = agRes.body.data.id
    expect(agId).toMatch(/^AGR-PP-\d{2}-\d{4}$/)
    expect(agRes.body.data.status).toBe('draft')
    // Client name must appear in content body (not raw client_id)
    expect(agRes.body.data.content_body).toContain('Siti Rahayu')

    // ── Step 10: Issue agreement (draft → issued) ─────────────────────────────
    const agIssueRes = await request(app)
      .post(`/api/pp/agreements/${agId}/issue`)
      .expect(200)
    expect(agIssueRes.body.data.status).toBe('issued')
    expect(agIssueRes.body.data.issued_at).not.toBeNull()

    // ── Step 11: Sign agreement ────────────────────────────────────────────────
    const agSignRes = await request(app)
      .post(`/api/pp/agreements/${agId}/sign`)
      .send({
        signedByName: 'Siti Rahayu',
        signatureData: null,
      })
      .expect(200)
    expect(agSignRes.body.data.status).toBe('signed')
    expect(agSignRes.body.data.signed_by_name).toBe('Siti Rahayu')

    // Signed agreement must be immutable — cannot void
    await request(app)
      .post(`/api/pp/agreements/${agId}/void`)
      .send({ voidedBy: 'hacker', voidReason: 'attempt' })
      .expect(403)

    // ── Step 12: Record attendance ─────────────────────────────────────────────
    const attRes = await request(app)
      .post(`/api/pp/orders/${orderId}/attendance`)
      .send({
        sessionNumber: 1,
        sessionDate: '2026-11-05',
        trainerName: 'Marcus Trainer',
        clientPresent: true,
        trainerPresent: true,
      }).expect(201)
    const attId = attRes.body.data.id
    expect(attId).toMatch(/^ATT-PP-\d{2}-\d{4}$/)
    expect(attRes.body.data.trainer_name).toBe('Marcus Trainer')

    // Duplicate session number must be rejected
    await request(app)
      .post(`/api/pp/orders/${orderId}/attendance`)
      .send({ sessionNumber: 1, sessionDate: '2026-11-05' })
      .expect(409)

    // ── Step 13: Create assessment ─────────────────────────────────────────────
    const participantRes = await request(app).post('/api/pp/participants').send({
      orderId, clientId, fullName: 'Siti Rahayu',
    }).expect(201)
    const participantId = participantRes.body.data.id

    const asmRes = await request(app).post('/api/pp/assessments').send({
      participantId,
      assessmentType: 'PRE',
      assessmentDate: '2026-11-05',
      heightCm: 165.0,
      weightKg: 65.0,
      notes: 'Initial assessment',
    }).expect(201)
    expect(asmRes.body.data.id).toMatch(/^SCR-\d{2}-\d{4}$/)

    // ── Step 14: Verify receipt is accessible ─────────────────────────────────
    const rcpRes = await request(app).get(`/api/pp/receipts/${receiptId}`).expect(200)
    expect(rcpRes.body.data.id).toBe(receiptId)
    expect(parseFloat(rcpRes.body.data.amount)).toBe(baseAmount)

    // ── Step 15: Verify audit trail has events for key entities ───────────────
    const invoiceAuditRes = await request(app)
      .get(`/api/v1/audit/entity/invoice/${invoiceId}`)
      .expect(200)
    expect(invoiceAuditRes.body.data.length).toBeGreaterThan(0)

    const agAuditRes = await request(app)
      .get(`/api/v1/audit/entity/agreement/${agId}`)
      .expect(200)
    expect(agAuditRes.body.data.length).toBeGreaterThan(0)
    const agEventTypes = agAuditRes.body.data.map(e => e.event_type)
    expect(agEventTypes).toContain('AGREEMENT_ISSUED')
    expect(agEventTypes).toContain('AGREEMENT_SIGNED')
  })

  it('blocks duplicate active invoice for same order', async () => {
    const { packageId } = await seedCatalog()
    const picId = await seedPic()

    const clientRes = await request(app).post('/api/pp/clients')
      .send({ fullName: 'Test Client' }).expect(201)
    const clientId = clientRes.body.data.id

    const orderRes = await request(app).post('/api/pp/orders')
      .send({ clientId, packageId, picId }).expect(201)
    const orderId = orderRes.body.data.id

    await request(app).post(`/api/pp/orders/${orderId}/status`)
      .send({ status: 'PENDING_PAYMENT' }).expect(200)

    const dueDate = '2026-12-01'
    await request(app).post('/api/pp/invoices').send({ orderId, dueDate }).expect(201)
    // Second invoice for same order → 409 Conflict
    await request(app).post('/api/pp/invoices').send({ orderId, dueDate }).expect(409)
  })

  it('blocks payment confirmation when amount mismatches invoice', async () => {
    const { packageId, baseAmount } = await seedCatalog()
    const picId = await seedPic()

    const clientRes = await request(app).post('/api/pp/clients')
      .send({ fullName: 'Mismatch Client' }).expect(201)
    const clientId = clientRes.body.data.id

    const orderRes = await request(app).post('/api/pp/orders')
      .send({ clientId, packageId, picId }).expect(201)
    const orderId = orderRes.body.data.id

    await request(app).post(`/api/pp/orders/${orderId}/status`)
      .send({ status: 'PENDING_PAYMENT' }).expect(200)

    const invoiceRes = await request(app).post('/api/pp/invoices')
      .send({ orderId, dueDate: '2026-12-01' }).expect(201)
    const invoiceId = invoiceRes.body.data.id

    await request(app).post(`/api/pp/invoices/${invoiceId}/send`).expect(200)

    // Submit wrong amount
    const paymentRes = await request(app).post('/api/pp/payments').send({
      invoiceId,
      amount: baseAmount - 50000, // deliberately wrong
      paymentMethod: 'transfer',
      paymentDate: '2026-11-20',
    }).expect(201)
    const paymentId = paymentRes.body.data.id

    // Confirm → must be rejected (PAYMENT_AMOUNT_MISMATCH)
    await request(app).post(`/api/pp/payments/${paymentId}/confirm`)
      .send({ confirmedBy: 'admin' })
      .expect(422)
  })

  it('blocks voiding a signed agreement', async () => {
    const { packageId } = await seedCatalog()
    const picId = await seedPic()

    const clientRes = await request(app).post('/api/pp/clients')
      .send({ fullName: 'Guard Client' }).expect(201)
    const clientId = clientRes.body.data.id

    const orderRes = await request(app).post('/api/pp/orders')
      .send({ clientId, packageId, picId }).expect(201)
    const orderId = orderRes.body.data.id

    await request(app).post(`/api/pp/orders/${orderId}/status`)
      .send({ status: 'PENDING_PAYMENT' }).expect(200)

    const invoiceRes = await request(app).post('/api/pp/invoices')
      .send({ orderId, dueDate: '2026-12-01' }).expect(201)
    const invoiceId = invoiceRes.body.data.id

    await request(app).post(`/api/pp/invoices/${invoiceId}/send`).expect(200)

    const { baseAmount } = await seedCatalog() // re-read amount (catalog already seeded)
    const payRes = await request(app).post('/api/pp/payments').send({
      invoiceId,
      amount: baseAmount,
      paymentMethod: 'transfer',
      paymentDate: '2026-11-25',
    }).expect(201)

    await request(app).post(`/api/pp/payments/${payRes.body.data.id}/confirm`)
      .send({ confirmedBy: 'admin' }).expect(200)

    const agRes = await request(app).post('/api/pp/agreements')
      .send({ orderId }).expect(201)
    const agId = agRes.body.data.id

    await request(app).post(`/api/pp/agreements/${agId}/issue`).expect(200)
    await request(app).post(`/api/pp/agreements/${agId}/sign`)
      .send({ signedByName: 'Guard Client' }).expect(200)

    // Void signed → must be 403
    await request(app).post(`/api/pp/agreements/${agId}/void`)
      .send({ voidedBy: 'test', voidReason: 'e2e' })
      .expect(403)
  })
})
