import { query } from '../../db/index.js'

export async function getAllPrograms() {
  const { rows } = await query(
    `SELECT * FROM programs ORDER BY created_at ASC`
  )
  return rows
}

export async function getProgramById(id) {
  const { rows } = await query(`SELECT * FROM programs WHERE id = $1`, [id])
  return rows[0] ?? null
}

export async function insertProgram({ id, module, name, description, isActive }, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO programs (id, module, name, description, is_active)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, module, name, description ?? null, isActive ?? true]
  )
  return rows[0]
}

export async function getOfferingsByProgram(programId) {
  const { rows } = await query(
    `SELECT * FROM offerings WHERE program_id = $1 ORDER BY created_at ASC`,
    [programId]
  )
  return rows
}

export async function getOfferingById(id) {
  const { rows } = await query(`SELECT * FROM offerings WHERE id = $1`, [id])
  return rows[0] ?? null
}

export async function insertOffering({ id, programId, name, description, isActive }, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO offerings (id, program_id, name, description, is_active)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, programId, name, description ?? null, isActive ?? true]
  )
  return rows[0]
}

export async function getPackagesByOffering(offeringId) {
  const { rows } = await query(
    `SELECT p.*, pp.price
     FROM packages p
     LEFT JOIN package_prices pp ON pp.package_id = p.id
       AND pp.effective_from <= NOW()
       AND (pp.effective_to IS NULL OR pp.effective_to > NOW())
     WHERE p.offering_id = $1
     ORDER BY p.session_count ASC`,
    [offeringId]
  )
  return rows
}

export async function getPackageById(id) {
  const { rows } = await query(
    `SELECT p.*, pp.price
     FROM packages p
     LEFT JOIN package_prices pp ON pp.package_id = p.id
       AND pp.effective_from <= NOW()
       AND (pp.effective_to IS NULL OR pp.effective_to > NOW())
     WHERE p.id = $1`,
    [id]
  )
  return rows[0] ?? null
}

export async function insertPackage({ id, offeringId, name, sessionCount, description, isActive }, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO packages (id, offering_id, name, session_count, description, is_active)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [id, offeringId, name, sessionCount, description ?? null, isActive ?? true]
  )
  return rows[0]
}

export async function insertPackagePrice({ id, packageId, price, effectiveFrom, effectiveTo }, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO package_prices (id, package_id, price, effective_from, effective_to)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, packageId, price, effectiveFrom ?? 'NOW()', effectiveTo ?? null]
  )
  return rows[0]
}

export async function getCurrentPrice(packageId) {
  const { rows } = await query(
    `SELECT * FROM package_prices
     WHERE package_id = $1
       AND effective_from <= NOW()
       AND (effective_to IS NULL OR effective_to > NOW())
     ORDER BY effective_from DESC
     LIMIT 1`,
    [packageId]
  )
  return rows[0] ?? null
}
