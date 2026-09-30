import { query } from '../../db/index.js'

export async function findLeadById(id, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(`SELECT * FROM leads_pp WHERE id = $1`, [id])
  return rows[0] ?? null
}

export async function findAllLeads({ status, limit = 50, offset = 0 } = {}) {
  const params = []
  let where = ''
  if (status) {
    params.push(status)
    where = `WHERE status = $${params.length}`
  }
  params.push(limit, offset)
  const { rows } = await query(
    `SELECT * FROM leads_pp ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )
  return rows
}

export async function countLeads({ status } = {}) {
  const params = []
  let where = ''
  if (status) { params.push(status); where = `WHERE status = $1` }
  const { rows } = await query(`SELECT COUNT(*) AS total FROM leads_pp ${where}`, params)
  return parseInt(rows[0].total, 10)
}

export async function insertLead({ id, fullName, email, phone, source, notes }, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO leads_pp (id, full_name, email, phone, source, notes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [id, fullName, email ?? null, phone ?? null, source ?? null, notes ?? null]
  )
  return rows[0]
}

export async function updateLeadStatus(id, status, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `UPDATE leads_pp SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, status]
  )
  return rows[0] ?? null
}

export async function updateLead(id, fields, client) {
  const q = client ? client.query.bind(client) : query
  const allowed = ['full_name', 'email', 'phone', 'source', 'notes', 'status']
  const setClauses = []
  const values = []
  for (const [key, val] of Object.entries(fields)) {
    if (allowed.includes(key)) {
      values.push(val)
      setClauses.push(`${key} = $${values.length}`)
    }
  }
  if (!setClauses.length) return findLeadById(id, client)
  values.push(id)
  const { rows } = await q(
    `UPDATE leads_pp SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
    values
  )
  return rows[0] ?? null
}
