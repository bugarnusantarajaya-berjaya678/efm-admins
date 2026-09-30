import { query } from '../../db/index.js'

export async function findRefundById(id, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(`SELECT * FROM refunds_pp WHERE id = $1`, [id])
  return rows[0] ?? null
}

export async function findRefundByPaymentId(paymentId, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(`SELECT * FROM refunds_pp WHERE payment_id = $1`, [paymentId])
  return rows[0] ?? null
}

export async function findRefundsByOrder(orderId) {
  const { rows } = await query(
    `SELECT * FROM refunds_pp WHERE order_id = $1 ORDER BY created_at DESC`,
    [orderId]
  )
  return rows
}

export async function insertRefund({ id, paymentId, orderId, amount, reason }, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO refunds_pp (id, payment_id, order_id, amount, reason)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, paymentId, orderId, amount, reason]
  )
  return rows[0]
}

export async function updateRefundStatus(id, status, extra = {}, client) {
  const q = client ? client.query.bind(client) : query
  const setClauses = ['status = $2', 'updated_at = NOW()']
  const values = [id, status]
  if (extra.processedAt) { values.push(extra.processedAt); setClauses.push(`processed_at = $${values.length}`) }
  if (extra.processedBy) { values.push(extra.processedBy); setClauses.push(`processed_by = $${values.length}`) }
  if (extra.rejectedAt) { values.push(extra.rejectedAt); setClauses.push(`rejected_at = $${values.length}`) }
  if (extra.rejectedBy) { values.push(extra.rejectedBy); setClauses.push(`rejected_by = $${values.length}`) }
  if (extra.rejectionReason) { values.push(extra.rejectionReason); setClauses.push(`rejection_reason = $${values.length}`) }
  const { rows } = await q(
    `UPDATE refunds_pp SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
    values
  )
  return rows[0] ?? null
}
