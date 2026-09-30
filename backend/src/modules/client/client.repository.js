import { query } from '../../db/index.js'

export async function findClientById(id, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(`SELECT * FROM clients_pp WHERE id = $1`, [id])
  return rows[0] ?? null
}

export async function findClientByLeadId(leadId, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(`SELECT * FROM clients_pp WHERE lead_id = $1`, [leadId])
  return rows[0] ?? null
}

export async function findAllClients({ status, limit = 50, offset = 0 } = {}) {
  const params = []
  let where = ''
  if (status) { params.push(status); where = `WHERE status = $1` }
  params.push(limit, offset)
  const { rows } = await query(
    `SELECT * FROM clients_pp ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )
  return rows
}

export async function countClients({ status } = {}) {
  const params = []
  let where = ''
  if (status) { params.push(status); where = `WHERE status = $1` }
  const { rows } = await query(`SELECT COUNT(*) AS total FROM clients_pp ${where}`, params)
  return parseInt(rows[0].total, 10)
}

export async function insertClient({ id, leadId, fullName, email, phone, address, notes }, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO clients_pp (id, lead_id, full_name, email, phone, address, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [id, leadId ?? null, fullName, email ?? null, phone ?? null, address ?? null, notes ?? null]
  )
  return rows[0]
}

export async function updateClient(id, fields, client) {
  const q = client ? client.query.bind(client) : query
  const allowed = ['full_name', 'email', 'phone', 'address', 'notes', 'status']
  const setClauses = []
  const values = []
  for (const [key, val] of Object.entries(fields)) {
    if (allowed.includes(key)) {
      values.push(val)
      setClauses.push(`${key} = $${values.length}`)
    }
  }
  if (!setClauses.length) return findClientById(id, client)
  values.push(id)
  const { rows } = await q(
    `UPDATE clients_pp SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
    values
  )
  return rows[0] ?? null
}
