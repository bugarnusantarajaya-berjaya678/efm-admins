/**
 * BaseRepository — lightweight base for all PP module repositories.
 * Provides standard query helpers. Concrete repositories extend this
 * and define their own table + column mappings.
 */

import { query, withTransaction } from '../db/index.js'

// Allowed table names — any subclass must register its table here.
// This prevents SQL injection from dynamic or mis-configured tableName values.
const ALLOWED_TABLES = new Set([
  'id_sequences',
  'audit_events',
  'pic_master',
  'pic_contexts',
  'schema_migrations',
  // Phase 2A Commercial Core
  'programs',
  'offerings',
  'packages',
  'package_prices',
  'leads_pp',
  'clients_pp',
  'orders_pp',
  'order_commercial_snapshots',
  'invoices_pp',
  'payments_pp',
  'receipts_pp',
  'refunds_pp',
])

export class BaseRepository {
  /** @param {string} tableName - must be listed in ALLOWED_TABLES */
  constructor(tableName) {
    if (!ALLOWED_TABLES.has(tableName)) {
      throw new Error(`BaseRepository: unknown table "${tableName}". Add it to ALLOWED_TABLES.`)
    }
    this.tableName = tableName
  }

  async findById(id, client) {
    const q = client ? client.query.bind(client) : query
    const { rows } = await q(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    )
    return rows[0] ?? null
  }

  async findAll({ limit = 50, offset = 0 } = {}) {
    const { rows } = await query(
      `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    return rows
  }

  async count() {
    const { rows } = await query(`SELECT COUNT(*) AS total FROM ${this.tableName}`)
    return parseInt(rows[0].total, 10)
  }
}
