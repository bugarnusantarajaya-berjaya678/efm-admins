import { query } from '../../db/index.js'

export async function findInvoiceById(id, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(`SELECT * FROM invoices_pp WHERE id = $1`, [id])
  return rows[0] ?? null
}

export async function findInvoiceByOrderId(orderId, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(`SELECT * FROM invoices_pp WHERE order_id = $1`, [orderId])
  return rows[0] ?? null
}

export async function findAllInvoices({ status, limit = 50, offset = 0 } = {}) {
  const params = []
  let where = ''
  if (status) { params.push(status); where = `WHERE status = $1` }
  params.push(limit, offset)
  const { rows } = await query(
    `SELECT * FROM invoices_pp ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )
  return rows
}

export async function countInvoices({ status } = {}) {
  const params = []
  let where = ''
  if (status) { params.push(status); where = `WHERE status = $1` }
  const { rows } = await query(`SELECT COUNT(*) AS total FROM invoices_pp ${where}`, params)
  return parseInt(rows[0].total, 10)
}

export async function insertInvoice({ id, orderId, dueDate, finalAmount, notes }, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO invoices_pp (id, order_id, due_date, final_amount, notes)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, orderId, dueDate, finalAmount, notes ?? null]
  )
  return rows[0]
}

export async function updateInvoiceStatus(id, status, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `UPDATE invoices_pp SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, status]
  )
  return rows[0] ?? null
}

export async function findOverdueInvoices() {
  const { rows } = await query(
    `SELECT * FROM invoices_pp WHERE status = 'SENT' AND due_date < CURRENT_DATE`
  )
  return rows
}
