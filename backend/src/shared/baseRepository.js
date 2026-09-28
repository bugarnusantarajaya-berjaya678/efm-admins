/**
 * BaseRepository — lightweight base for all PP module repositories.
 * Provides standard query helpers. Concrete repositories extend this
 * and define their own table + column mappings.
 */

import { query, withTransaction } from '../db/index.js'

export class BaseRepository {
  /** @param {string} tableName */
  constructor(tableName) {
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
