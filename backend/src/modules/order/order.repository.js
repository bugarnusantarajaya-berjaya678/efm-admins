import { query } from '../../db/index.js'

export async function findOrderById(id, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(`SELECT * FROM orders_pp WHERE id = $1`, [id])
  return rows[0] ?? null
}

export async function findAllOrders({ clientId, status, limit = 50, offset = 0 } = {}) {
  const params = []
  const conditions = []
  if (clientId) { params.push(clientId); conditions.push(`client_id = $${params.length}`) }
  if (status) { params.push(status); conditions.push(`status = $${params.length}`) }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  params.push(limit, offset)
  const { rows } = await query(
    `SELECT * FROM orders_pp ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )
  return rows
}

export async function countOrders({ clientId, status } = {}) {
  const params = []
  const conditions = []
  if (clientId) { params.push(clientId); conditions.push(`client_id = $${params.length}`) }
  if (status) { params.push(status); conditions.push(`status = $${params.length}`) }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const { rows } = await query(`SELECT COUNT(*) AS total FROM orders_pp ${where}`, params)
  return parseInt(rows[0].total, 10)
}

export async function insertOrder({ id, clientId, leadId, packageId, picId, startDate, sessionsTotal, notes }, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO orders_pp (id, client_id, lead_id, package_id, pic_id, start_date, sessions_total, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [id, clientId, leadId ?? null, packageId, picId, startDate ?? null, sessionsTotal, notes ?? null]
  )
  return rows[0]
}

export async function updateOrderStatus(id, status, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `UPDATE orders_pp SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, status]
  )
  return rows[0] ?? null
}

export async function updateOrderUrgency(id, urgencyFlag, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `UPDATE orders_pp SET urgency_flag = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, urgencyFlag]
  )
  return rows[0] ?? null
}

export async function insertCommercialSnapshot({
  orderId, packageName, offeringName, programName, sessionsTotal,
  unitPrice, baseAmount, discountCode, discountAmount, finalAmount,
}, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO order_commercial_snapshots
       (order_id, package_name, offering_name, program_name, sessions_total,
        unit_price, base_amount, discount_code, discount_amount, final_amount)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [orderId, packageName, offeringName, programName, sessionsTotal,
     unitPrice, baseAmount, discountCode ?? null, discountAmount ?? 0, finalAmount]
  )
  return rows[0]
}

export async function findSnapshotByOrderId(orderId, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `SELECT * FROM order_commercial_snapshots WHERE order_id = $1`, [orderId]
  )
  return rows[0] ?? null
}
