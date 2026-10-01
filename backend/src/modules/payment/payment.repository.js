import { query } from '../../db/index.js'
import { v4 as uuidv4 } from 'uuid'

export async function findPaymentById(id, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(`SELECT * FROM payments_pp WHERE id = $1`, [id])
  return rows[0] ?? null
}

export async function findPaymentsByInvoice(invoiceId, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `SELECT * FROM payments_pp WHERE invoice_id = $1 ORDER BY created_at DESC`,
    [invoiceId]
  )
  return rows
}

export async function findConfirmedPaymentByInvoice(invoiceId, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `SELECT * FROM payments_pp WHERE invoice_id = $1 AND status = 'CONFIRMED' LIMIT 1`,
    [invoiceId]
  )
  return rows[0] ?? null
}

export async function insertPayment({ invoiceId, orderId, amount, paymentMethod, paymentDate, referenceNo, notes }, client) {
  const q = client ? client.query.bind(client) : query
  const id = uuidv4()
  const { rows } = await q(
    `INSERT INTO payments_pp (id, invoice_id, order_id, amount, payment_method, payment_date, reference_no, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [id, invoiceId, orderId, amount, paymentMethod, paymentDate ?? 'today', referenceNo ?? null, notes ?? null]
  )
  return rows[0]
}

export async function updatePaymentProofPath(id, proofPath, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `UPDATE payments_pp SET proof_path=$2, proof_uploaded_at=NOW(), updated_at=NOW() WHERE id=$1 RETURNING *`,
    [id, proofPath]
  )
  return rows[0] ?? null
}

export async function updatePaymentStatus(id, status, extra = {}, client) {
  const q = client ? client.query.bind(client) : query
  const setClauses = ['status = $2', 'updated_at = NOW()']
  const values = [id, status]

  if (extra.confirmedAt) { values.push(extra.confirmedAt); setClauses.push(`confirmed_at = $${values.length}`) }
  if (extra.confirmedBy) { values.push(extra.confirmedBy); setClauses.push(`confirmed_by = $${values.length}`) }
  if (extra.rejectedAt) { values.push(extra.rejectedAt); setClauses.push(`rejected_at = $${values.length}`) }
  if (extra.rejectedBy) { values.push(extra.rejectedBy); setClauses.push(`rejected_by = $${values.length}`) }
  if (extra.rejectionReason) { values.push(extra.rejectionReason); setClauses.push(`rejection_reason = $${values.length}`) }

  const { rows } = await q(
    `UPDATE payments_pp SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
    values
  )
  return rows[0] ?? null
}
