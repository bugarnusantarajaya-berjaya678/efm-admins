/**
 * Phase 1 Acceptance — ID Generator
 * Checklist items: D-a (one authoritative generator), D-b (uniqueness test passes)
 *
 * Requires a live PostgreSQL database (TEST_DATABASE_URL).
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals'
import { nextId, peekNextId, DOCTYPE, MODULE } from '../../src/modules/id/id.generator.js'
import { setupTestDb, teardownTestDb, closeTestDb } from '../helpers/db.js'

describe('Authoritative ID Generator', () => {
  beforeAll(async () => { await setupTestDb() })
  afterEach(async () => { await teardownTestDb() })
  afterAll(async () => { await closeTestDb() })

  it('generates PP Order ID in correct format: PP-YY-xxxx', async () => {
    const id = await nextId(DOCTYPE.ORDER, MODULE.PP, { year: 2026 })
    expect(id).toBe('PP-26-0001')
  })

  it('generates sequential IDs for the same type/module/year', async () => {
    const a = await nextId(DOCTYPE.ORDER, MODULE.PP, { year: 2026 })
    const b = await nextId(DOCTYPE.ORDER, MODULE.PP, { year: 2026 })
    const c = await nextId(DOCTYPE.ORDER, MODULE.PP, { year: 2026 })
    expect(a).toBe('PP-26-0001')
    expect(b).toBe('PP-26-0002')
    expect(c).toBe('PP-26-0003')
  })

  it('generates Invoice ID: INV-PP-YY-xxxx', async () => {
    const id = await nextId(DOCTYPE.INVOICE, MODULE.PP, { year: 2026 })
    expect(id).toBe('INV-PP-26-0001')
  })

  it('generates Receipt ID: RCP-PP-YY-xxxx', async () => {
    const id = await nextId(DOCTYPE.RECEIPT, MODULE.PP, { year: 2026 })
    expect(id).toBe('RCP-PP-26-0001')
  })

  it('generates Agreement ID: AGR-PP-YY-xxxx', async () => {
    const id = await nextId(DOCTYPE.AGREEMENT, MODULE.PP, { year: 2026 })
    expect(id).toBe('AGR-PP-26-0001')
  })

  it('generates H&S ID: HNA-PP-YY-xxxx', async () => {
    const id = await nextId(DOCTYPE.HNS, MODULE.PP, { year: 2026 })
    expect(id).toBe('HNA-PP-26-0001')
  })

  it('generates Assessment ID: SCR-YY-xxxx (no module prefix)', async () => {
    const id = await nextId(DOCTYPE.ASSESSMENT, MODULE.GLOBAL, { year: 2026 })
    expect(id).toBe('SCR-26-0001')
  })

  it('generates PIC ID: PIC-YY-xxxx', async () => {
    const id = await nextId(DOCTYPE.PIC, MODULE.GLOBAL, { year: 2026 })
    expect(id).toBe('PIC-26-0001')
  })

  it('generates Lead PP ID: LP-xxxx (no year)', async () => {
    const id = await nextId(DOCTYPE.LEAD_PP, MODULE.PP)
    expect(id).toBe('LP-0001')
  })

  it('Lead IDs never reset across years (permanent sequences)', async () => {
    const a = await nextId(DOCTYPE.LEAD_PP, MODULE.PP)
    const b = await nextId(DOCTYPE.LEAD_PP, MODULE.PP)
    expect(a).toBe('LP-0001')
    expect(b).toBe('LP-0002')
  })

  it('different modules have independent sequences', async () => {
    const pp = await nextId(DOCTYPE.ORDER, MODULE.PP, { year: 2026 })
    const b2b = await nextId(DOCTYPE.ORDER, MODULE.B2B, { year: 2026 })
    expect(pp).toBe('PP-26-0001')
    expect(b2b).toBe('B2B-26-0001')
  })

  it('sequences reset to 0001 for a new year', async () => {
    await nextId(DOCTYPE.ORDER, MODULE.PP, { year: 2025 })
    const newYear = await nextId(DOCTYPE.ORDER, MODULE.PP, { year: 2026 })
    expect(newYear).toBe('PP-26-0001')
  })

  it('generates 100 unique IDs with no duplicates', async () => {
    const ids = await Promise.all(
      Array.from({ length: 100 }, () => nextId(DOCTYPE.ORDER, MODULE.PP, { year: 2026 }))
    )
    const unique = new Set(ids)
    expect(unique.size).toBe(100)
  })

  it('peekNextId returns what nextId will generate without consuming sequence', async () => {
    const peek = await peekNextId(DOCTYPE.ORDER, MODULE.PP, { year: 2026 })
    const actual = await nextId(DOCTYPE.ORDER, MODULE.PP, { year: 2026 })
    expect(peek).toBe(actual)
  })

  it('rejects unknown docType', async () => {
    await expect(nextId('UNKNOWN_TYPE', MODULE.PP)).rejects.toThrow('Invalid docType')
  })

  it('rejects unknown module', async () => {
    await expect(nextId(DOCTYPE.ORDER, 'UNKNOWN_MODULE')).rejects.toThrow('Invalid module')
  })
})
