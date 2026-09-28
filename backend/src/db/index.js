import pg from 'pg'
import { env } from '../config/env.js'

const { Pool } = pg

const connectionString = env.isTest && env.TEST_DATABASE_URL
  ? env.TEST_DATABASE_URL
  : env.DATABASE_URL

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message)
})

/** Execute a single query, returning pg QueryResult. */
export async function query(sql, params) {
  return pool.query(sql, params)
}

/**
 * Execute a function inside a transaction.
 * Rolls back and rethrows on error.
 */
export async function withTransaction(fn) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    try { await client.query('ROLLBACK') } catch { /* rollback failed; original error is rethrown below */ }
    throw err
  } finally {
    client.release()
  }
}

/** Verify the database connection. Returns true on success, throws on failure. */
export async function checkConnection() {
  const result = await query('SELECT NOW() AS now')
  return result.rows[0].now
}

/** Close all pool connections (used in test teardown). Idempotent. */
let _poolEnded = false
export async function closePool() {
  if (_poolEnded) return
  _poolEnded = true
  await pool.end()
}
