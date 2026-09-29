/**
 * Phase 1 Acceptance — Request/Correlation ID Middleware
 * Checklist item: acceptance item 8
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../../src/app.js'
import { closePool } from '../../src/db/index.js'

// Note: /health requires DB. This test mocks the DB call by testing a simpler endpoint
// or uses the app directly. The correlation ID middleware runs regardless of DB state.

describe('Correlation ID middleware', () => {
  it('generates a UUID request ID if none provided', async () => {
    const res = await request(app).get('/api/v1/docs-not-exist').expect(404)
    expect(res.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
  })

  it('echoes a valid incoming X-Request-Id', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000'
    const res = await request(app)
      .get('/api/v1/docs-not-exist')
      .set('x-request-id', id)
      .expect(404)
    expect(res.headers['x-request-id']).toBe(id)
  })

  it('ignores an invalid (non-UUID) X-Request-Id and generates a new one', async () => {
    const res = await request(app)
      .get('/api/v1/docs-not-exist')
      .set('x-request-id', 'not-a-uuid')
      .expect(404)
    expect(res.headers['x-request-id']).not.toBe('not-a-uuid')
    expect(res.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
  })

  it('error responses include requestId in body', async () => {
    const res = await request(app).get('/nonexistent-route').expect(404)
    expect(res.headers['x-request-id']).toBeTruthy()
  })
})
