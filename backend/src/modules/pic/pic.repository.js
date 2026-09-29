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
  const params = []
  const where = []
  if (status) { params.push(status); where.push(`p.status = $${params.length}`) }

  // When filtering by module we must keep all contexts for matched PICs, while
  // still preserving PICs that have no contexts in other modules (LEFT JOIN must
  // not collapse to INNER JOIN). We push the module filter into the JOIN
  // condition so the outer query still returns PICs with zero matching contexts.
  let joinCondition = 'c.pic_id = p.id'
  if (module) {
    // Push module param once for the JOIN filter, reuse same index for the
    // IN-subquery. Both references use the same $N placeholder.
    params.push(module)
    const moduleParamIdx = params.length
    joinCondition += ` AND c.module = $${moduleParamIdx}`
    where.push(`p.id IN (SELECT pic_id FROM pic_contexts WHERE module = $${moduleParamIdx})`)
  }

  let sql = `
    SELECT p.*, json_agg(c.*) FILTER (WHERE c.id IS NOT NULL) AS contexts
    FROM pic_master p
    LEFT JOIN pic_contexts c ON ${joinCondition}
  `
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

/**
 * Patch PIC master fields. Only fields explicitly present in the updates object
 * are changed. Passing a field as null clears it (allows un-setting nullable
 * fields like phone). Fields absent from updates are preserved via COALESCE.
 *
 * "Present" means the key exists in the raw updates object — undefined means
 * "omitted", null means "clear to NULL".
 */
export async function updatePic(id, updates, client) {
  const q = client ? client.query.bind(client) : query

  // Build dynamic SET list — only touch fields that were explicitly passed
  const setClauses = []
  const params = [id]

  const field = (key, col) => {
    if (key in updates) {
      params.push(updates[key] ?? null)
      setClauses.push(`${col} = $${params.length}`)
    } else {
      setClauses.push(`${col} = ${col}`)
    }
  }

  field('fullName', 'full_name')
  field('email', 'email')
  field('phone', 'phone')
  field('status', 'status')
  field('pksExpiryDate', 'pks_expiry_date')
  setClauses.push('updated_at = NOW()')

  const { rows } = await q(
    `UPDATE pic_master SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
    params
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
