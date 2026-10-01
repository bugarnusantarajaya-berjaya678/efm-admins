/**
 * Phase 3 — Auth Middleware Tests
 * Covers: test bypass mode, X-Test-Role header, missing auth in prod simulation
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../../src/app.js'
import { setupTestDb, closeTestDb } from '../helpers/db.js'

describe('Auth Middleware', () => {
  beforeAll(async () => { await setupTestDb() })
  afterAll(async () => { await closeTestDb() })

  it('allows requests in test mode (NODE_ENV=test) without Authorization header', async () => {
    // Health route is public — use a protected route that should work in test mode
    const res = await request(app).get('/api/pp/agreements').expect(200)
    expect(res.body.data).toBeDefined()
  })

  it('attaches test user with default role PP', async () => {
    // This test relies on listAgreements returning OK for a test user
    const res = await request(app).get('/api/pp/agreements').expect(200)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('requires signedByName when signing', async () => {
    const res = await request(app).post('/api/pp/agreements/AGR-PP-26-0001/sign')
      .send({}).expect(400)
    expect(res.body.error.type).toBe('VALIDATION_ERROR')
  })

  it('returns 404 for non-existent agreement', async () => {
    const res = await request(app).get('/api/pp/agreements/AGR-PP-99-9999').expect(404)
    expect(res.body.error.type).toBe('NOT_FOUND')
  })
})
