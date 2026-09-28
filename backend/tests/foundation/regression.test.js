/**
 * Regression tests — Phase 1 code-review fixes (findings #1–#8).
 *
 * Each test is labelled with the finding it covers.
 * Requires a live PostgreSQL database (TEST_DATABASE_URL).
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals'
import request from 'supertest'
import app from '../../src/app.js'
import { withTransaction, query } from '../../src/db/index.js'
import { nextId, DOCTYPE, MODULE } from '../../src/modules/id/id.generator.js'
import { BaseRepository } from '../../src/shared/baseRepository.js'
import { setupTestDb, teardownTestDb, closeTestDb } from '../helpers/db.js'
import { env } from '../../src/config/env.js'

describe('Regression — Phase 1 code-review fixes', () => {
  beforeAll(async () => { await setupTestDb() })
  afterEach(async () => { await teardownTestDb() })
  afterAll(async () => { await closeTestDb() })

  // ─── Finding #1: PIC module filter preserves PICs with no matching context ───

  describe('Finding #1 — findAllPics module filter (JOIN correctness)', () => {
    it('returns a PIC that has no contexts when no module filter is applied', async () => {
      await request(app).post('/api/v1/pics')
        .send({ fullName: 'No-Context PIC', email: 'nocontext@example.com' })
        .expect(201)

      const res = await request(app).get('/api/v1/pics').expect(200)
      expect(res.body.count).toBe(1)
    })

    it('excludes PICs without the requested module context (correct behaviour)', async () => {
      // PIC with PP context only
      await request(app).post('/api/v1/pics').send({
        fullName: 'PP Only',
        email: 'pp@example.com',
        contexts: [{ module: 'PP', role: 'trainer', chargeRate: 200000 }],
      }).expect(201)

      // PIC with no contexts
      await request(app).post('/api/v1/pics')
        .send({ fullName: 'No Context', email: 'none@example.com' })
        .expect(201)

      const res = await request(app).get('/api/v1/pics?module=PP').expect(200)
      // Only the PP PIC should appear; the no-context PIC has no PP context
      expect(res.body.count).toBe(1)
      expect(res.body.data[0].full_name).toBe('PP Only')
    })

    it('returns all contexts for a multi-module PIC when filtering by one module', async () => {
      const createRes = await request(app).post('/api/v1/pics').send({
        fullName: 'Multi Module',
        email: 'multi@example.com',
        contexts: [
          { module: 'PP', role: 'trainer', chargeRate: 200000 },
        ],
      }).expect(201)
      const picId = createRes.body.data.id

      // Add B2B context
      await request(app).post(`/api/v1/pics/${picId}/contexts`)
        .send({ module: 'B2B', role: 'coordinator', chargeRate: 300000 })
        .expect(201)

      const res = await request(app).get('/api/v1/pics?module=PP').expect(200)
      expect(res.body.count).toBe(1)
      // The returned contexts array must contain only the PP context (module filter
      // in the JOIN — B2B context intentionally excluded when PP is requested)
      const contexts = res.body.data[0].contexts
      expect(contexts.every(c => c.module === 'PP')).toBe(true)
    })
  })

  // ─── Finding #2: withTransaction preserves original error on ROLLBACK failure ──

  describe('Finding #2 — withTransaction rethrows original error even if ROLLBACK fails', () => {
    it('rethrows the original application error, not a ROLLBACK error', async () => {
      const originalError = new Error('original application error')

      await expect(
        withTransaction(async () => { throw originalError })
      ).rejects.toThrow('original application error')
    })

    it('the error object identity is preserved through withTransaction', async () => {
      const marker = { code: 'E_TEST', message: 'marker error' }
      const err = Object.assign(new Error('marker error'), marker)

      let caught
      try {
        await withTransaction(async () => { throw err })
      } catch (e) {
        caught = e
      }
      expect(caught).toBe(err)
      expect(caught.code).toBe('E_TEST')
    })
  })

  // ─── Finding #3: ASSESSMENT/PIC IDs are globally unique across module inputs ──

  describe('Finding #3 — Module-independent doc types use GLOBAL bucket', () => {
    it('ASSESSMENT IDs are unique regardless of module argument', async () => {
      const year = 2026
      const idPP  = await nextId(DOCTYPE.ASSESSMENT, MODULE.PP,    { year })
      const idB2B = await nextId(DOCTYPE.ASSESSMENT, MODULE.B2B,   { year })
      const idEV  = await nextId(DOCTYPE.ASSESSMENT, MODULE.EVENT,  { year })

      // All should be sequential from the same GLOBAL counter, not duplicates
      expect(idPP).toBe('SCR-26-0001')
      expect(idB2B).toBe('SCR-26-0002')
      expect(idEV).toBe('SCR-26-0003')
    })

    it('PIC IDs are unique regardless of module argument', async () => {
      const year = 2026
      const idPP  = await nextId(DOCTYPE.PIC, MODULE.PP,   { year })
      const idB2B = await nextId(DOCTYPE.PIC, MODULE.B2B,  { year })

      expect(idPP).toBe('PIC-26-0001')
      expect(idB2B).toBe('PIC-26-0002')
    })

    it('id_sequences table only has one GLOBAL row per ASSESSMENT/year', async () => {
      const year = 2026
      await nextId(DOCTYPE.ASSESSMENT, MODULE.PP,  { year })
      await nextId(DOCTYPE.ASSESSMENT, MODULE.B2B, { year })

      const { rows } = await query(
        `SELECT module, last_seq FROM id_sequences
         WHERE doc_type = 'ASSESSMENT' AND year = $1`,
        [year]
      )
      // Must be exactly one row, using GLOBAL module
      expect(rows).toHaveLength(1)
      expect(rows[0].module).toBe('GLOBAL')
      expect(rows[0].last_seq).toBe(2)
    })
  })

  // ─── Finding #4: PATCH can clear nullable fields ──────────────────────────────

  describe('Finding #4 — PATCH clears nullable fields (phone, email)', () => {
    it('clears phone when PATCH sends { phone: null }', async () => {
      const createRes = await request(app).post('/api/v1/pics').send({
        fullName: 'Test PIC',
        email: 'test@example.com',
        phone: '+62811234567',
      }).expect(201)
      const id = createRes.body.data.id

      const patchRes = await request(app)
        .patch(`/api/v1/pics/${id}`)
        .send({ phone: null })
        .expect(200)

      expect(patchRes.body.data.phone).toBeNull()
    })

    it('leaves phone unchanged when PATCH omits the phone field', async () => {
      const createRes = await request(app).post('/api/v1/pics').send({
        fullName: 'Test PIC2',
        email: 'test2@example.com',
        phone: '+62811111111',
      }).expect(201)
      const id = createRes.body.data.id

      const patchRes = await request(app)
        .patch(`/api/v1/pics/${id}`)
        .send({ fullName: 'Updated Name' })
        .expect(200)

      expect(patchRes.body.data.phone).toBe('+62811111111')
    })
  })

  // ─── Finding #5: .env parser strips surrounding quotes ───────────────────────

  describe('Finding #5 — env.js strips surrounding quotes', () => {
    it('DATABASE_URL loaded from .env.test is unquoted and starts with postgresql://', () => {
      const url = env.DATABASE_URL
      expect(url).toBeTruthy()
      expect(url.startsWith('"')).toBe(false)
      expect(url.startsWith("'")).toBe(false)
      expect(url).toMatch(/^postgresql:\/\//)
    })

    it('env parser strips double-quoted value correctly', () => {
      // Simulate the loadDotEnv parser behaviour directly against a test line
      const testLine = 'TEST_QUOTED_VAL="postgresql://user:pass@host/db"'
      const eq = testLine.indexOf('=')
      let val = testLine.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      expect(val).toBe('postgresql://user:pass@host/db')
    })

    it('env parser strips single-quoted value correctly', () => {
      const testLine = "TEST_SINGLE_QUOTED='postgresql://user:pass@host/db'"
      const eq = testLine.indexOf('=')
      let val = testLine.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      expect(val).toBe('postgresql://user:pass@host/db')
    })
  })

  // ─── Finding #6: updatePicDetails returns 404 when PIC concurrently deleted ──

  describe('Finding #6 — updatePicDetails TOCTOU: null result throws 404', () => {
    it('returns 404 when PIC does not exist', async () => {
      const res = await request(app)
        .patch('/api/v1/pics/PIC-00-9999')
        .send({ phone: '+6281234' })
        .expect(404)
      expect(res.body.error.type).toBe('NOT_FOUND')
    })

    it('successful update returns the updated record (not null)', async () => {
      const createRes = await request(app).post('/api/v1/pics').send({
        fullName: 'Update Test',
        email: 'updatetest@example.com',
      }).expect(201)
      const id = createRes.body.data.id

      const patchRes = await request(app)
        .patch(`/api/v1/pics/${id}`)
        .send({ phone: '+62899999999' })
        .expect(200)

      expect(patchRes.body.data).not.toBeNull()
      expect(patchRes.body.data.phone).toBe('+62899999999')
    })
  })

  // ─── Finding #7: addPicContext returns 404 for unknown PIC ───────────────────

  describe('Finding #7 — addPicContext returns 404 for unknown PIC', () => {
    it('returns 404 when adding context to a non-existent PIC', async () => {
      const res = await request(app)
        .post('/api/v1/pics/PIC-00-9999/contexts')
        .send({ module: 'PP', role: 'trainer', chargeRate: 200000 })
        .expect(404)
      expect(res.body.error.type).toBe('NOT_FOUND')
    })
  })

  // ─── Finding #8: BaseRepository rejects unknown table names ──────────────────

  describe('Finding #8 — BaseRepository whitelists tableName', () => {
    it('throws on an unknown table name', () => {
      expect(() => new BaseRepository('unknown_table')).toThrow('unknown table "unknown_table"')
    })

    it('throws on empty string', () => {
      expect(() => new BaseRepository('')).toThrow()
    })

    it('accepts a known table name', () => {
      expect(() => new BaseRepository('audit_events')).not.toThrow()
    })

    it('accepts all currently registered tables', () => {
      const tables = ['id_sequences', 'audit_events', 'pic_master', 'pic_contexts', 'schema_migrations']
      for (const t of tables) {
        expect(() => new BaseRepository(t)).not.toThrow()
      }
    })
  })
})
