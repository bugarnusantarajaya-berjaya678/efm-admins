import { query } from '../../db/index.js'

export async function findAgreementById(id, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(`SELECT * FROM agreements_pp WHERE id = $1`, [id])
  return rows[0] ?? null
}

export async function findAgreementByOrderId(orderId, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(`SELECT * FROM agreements_pp WHERE order_id = $1`, [orderId])
  return rows[0] ?? null
}

export async function insertAgreement(
  { id, orderId, clientName, clientEmail, packageName, sessionsTotal, finalAmount, contentBody },
  client
) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO agreements_pp
       (id, order_id, client_name, client_email, package_name, sessions_total, final_amount, content_body)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [id, orderId, clientName, clientEmail ?? null, packageName, sessionsTotal, finalAmount, contentBody ?? null]
  )
  return rows[0]
}

export async function updateAgreementContent({ id, contentBody }, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `UPDATE agreements_pp SET content_body=$2, updated_at=NOW() WHERE id=$1 RETURNING *`,
    [id, contentBody]
  )
  return rows[0] ?? null
}

export async function updateAgreementStatus(id, status, extra = {}, client) {
  const q = client ? client.query.bind(client) : query
  const setClauses = ['status=$2', 'updated_at=NOW()']
  const values = [id, status]

  if (extra.issuedAt)     { values.push(extra.issuedAt);     setClauses.push(`issued_at=$${values.length}`) }
  if (extra.pdfPath)      { values.push(extra.pdfPath);      setClauses.push(`pdf_path=$${values.length}`) }
  if (extra.signedAt)     { values.push(extra.signedAt);     setClauses.push(`signed_at=$${values.length}`) }
  if (extra.signedByName) { values.push(extra.signedByName); setClauses.push(`signed_by_name=$${values.length}`) }
  if (extra.signedByIp)   { values.push(extra.signedByIp);   setClauses.push(`signed_by_ip=$${values.length}`) }
  if (extra.signedByUa)   { values.push(extra.signedByUa);   setClauses.push(`signed_by_ua=$${values.length}`) }
  if (extra.signatureData){ values.push(extra.signatureData); setClauses.push(`signature_data=$${values.length}`) }
  if (extra.voidedAt)     { values.push(extra.voidedAt);     setClauses.push(`voided_at=$${values.length}`) }
  if (extra.voidedBy)     { values.push(extra.voidedBy);     setClauses.push(`voided_by=$${values.length}`) }
  if (extra.voidReason)   { values.push(extra.voidReason);   setClauses.push(`void_reason=$${values.length}`) }

  const { rows } = await q(
    `UPDATE agreements_pp SET ${setClauses.join(', ')} WHERE id=$1 RETURNING *`,
    values
  )
  return rows[0] ?? null
}

export async function findAllAgreements({ status, limit = 50, offset = 0 } = {}) {
  const params = []
  let where = ''
  if (status) { params.push(status); where = `WHERE status=$1` }
  params.push(limit, offset)
  const { rows } = await query(
    `SELECT * FROM agreements_pp ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )
  return rows
}
