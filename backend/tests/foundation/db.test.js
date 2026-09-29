/**
 * Phase 1 Acceptance — Database Connection + Migration
 * Checklist items: C-a (connection), C-b (migration), C-c (base migration)
 *
 * Requires a live PostgreSQL database (TEST_DATABASE_URL).
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { checkConnection, query, closePool } from '../../src/db/index.js'
import { migrateUp, migrateStatus } from '../../src/db/migrate.js'

afterAll(async () => { await closePool() })

describe('Database connection', () => {
  it('connects to PostgreSQL and returns server time', async () => {
    const time = await checkConnection()
    expect(time).toBeInstanceOf(Date)
  })
})

describe('Migration framework', () => {

  it('runs base migration without error', async () => {
    await expect(migrateUp()).resolves.not.toThrow()
  })

  it('is idempotent — running again does not throw or duplicate', async () => {
    await expect(migrateUp()).resolves.not.toThrow()
  })

  it('creates schema_migrations table', async () => {
    const { rows } = await query(`SELECT name FROM schema_migrations ORDER BY name`)
    expect(rows.length).toBeGreaterThanOrEqual(1)
    expect(rows[0].name).toBe('001_create_schema_foundation.sql')
  })

  it('creates id_sequences table', async () => {
    const { rows } = await query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'id_sequences'
    `)
    expect(rows).toHaveLength(1)
  })

  it('creates audit_events table', async () => {
    const { rows } = await query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'audit_events'
    `)
    expect(rows).toHaveLength(1)
  })

  it('creates pic_master table', async () => {
    const { rows } = await query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'pic_master'
    `)
    expect(rows).toHaveLength(1)
  })

  it('creates pic_contexts table', async () => {
    const { rows } = await query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'pic_contexts'
    `)
    expect(rows).toHaveLength(1)
  })
})
