import { query, withTransaction } from '../../db/index.js'

export async function findPicById(id) {
  const { rows } = await query(
    `SELECT p.*, json_agg(c.*) FILTER (WHERE c.id IS NOT NULL) AS contexts
     FROM pic_master p
     LEFT JOIN pic_contexts c ON c.pic_id = p.id
     WHERE p.id = $1
     GROUP BY p.id`,
    [id]
  )
  return rows[0] ?? null
}

export async function findAllPics({ status, module } = {}) {
  let sql = `
    SELECT p.*, json_agg(c.*) FILTER (WHERE c.id IS NOT NULL) AS contexts
    FROM pic_master p
    LEFT JOIN pic_contexts c ON c.pic_id = p.id
  `
  const params = []
  const where = []
  if (status) { params.push(status); where.push(`p.status = $${params.length}`) }
  if (module) { params.push(module); where.push(`c.module = $${params.length}`) }
  if (where.length) sql += ' WHERE ' + where.join(' AND ')
  sql += ' GROUP BY p.id ORDER BY p.full_name'
  const { rows } = await query(sql, params)
  return rows
}

export async function insertPic({ id, fullName, email, phone, status, pksExpiryDate }, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO pic_master (id, full_name, email, phone, status, pks_expiry_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, fullName, email ?? null, phone ?? null, status ?? 'active', pksExpiryDate ?? null]
  )
  return rows[0]
}

export async function updatePic(id, { fullName, email, phone, status, pksExpiryDate }, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `UPDATE pic_master
     SET full_name      = COALESCE($2, full_name),
         email          = COALESCE($3, email),
         phone          = COALESCE($4, phone),
         status         = COALESCE($5, status),
         pks_expiry_date = COALESCE($6, pks_expiry_date),
         updated_at     = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, fullName ?? null, email ?? null, phone ?? null, status ?? null, pksExpiryDate ?? null]
  )
  return rows[0] ?? null
}

export async function insertPicContext({ picId, module, role, costRate, chargeRate, effectiveFrom, effectiveTo }, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO pic_contexts (pic_id, module, role, cost_rate, charge_rate, effective_from, effective_to)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [picId, module, role, costRate ?? null, chargeRate ?? null, effectiveFrom ?? new Date(), effectiveTo ?? null]
  )
  return rows[0]
}
