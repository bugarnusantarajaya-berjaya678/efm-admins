import { query } from '../../db/index.js'

export async function findReceiptById(id, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(`SELECT * FROM receipts_pp WHERE id = $1`, [id])
  return rows[0] ?? null
}

export async function findReceiptByPaymentId(paymentId, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(`SELECT * FROM receipts_pp WHERE payment_id = $1`, [paymentId])
  return rows[0] ?? null
}

export async function findReceiptsByOrder(orderId, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `SELECT * FROM receipts_pp WHERE order_id = $1 ORDER BY created_at DESC`,
    [orderId]
  )
  return rows
}

export async function insertReceipt({ id, paymentId, orderId, amount, notes }, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO receipts_pp (id, payment_id, order_id, amount, notes)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, paymentId, orderId, amount, notes ?? null]
  )
  return rows[0]
}
