/**
 * Test database helpers.
 * Tests run against the TEST_DATABASE_URL (efm_test_db).
 * Each test file that touches the DB should call setupTestDb / teardownTestDb.
 */

import { pool, closePool, query } from '../../src/db/index.js'
import { migrateUp } from '../../src/db/migrate.js'

export async function setupTestDb() {
  await migrateUp()
}

export async function teardownTestDb() {
  // Truncate all foundation tables between runs
  await query(`
    TRUNCATE id_sequences, audit_events, pic_contexts, pic_master
    RESTART IDENTITY CASCADE
  `)
}

export async function closeTestDb() {
  await closePool()
}
