import { query } from '../../db/index.js'

export async function findAttendanceById(id, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(`SELECT * FROM attendance_pp WHERE id = $1`, [id])
  return rows[0] ?? null
}

export async function findAttendanceByOrder(orderId, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `SELECT * FROM attendance_pp WHERE order_id = $1 ORDER BY session_number ASC`,
    [orderId]
  )
  return rows
}

export async function findAttendanceByOrderAndSession(orderId, sessionNumber, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `SELECT * FROM attendance_pp WHERE order_id = $1 AND session_number = $2`,
    [orderId, sessionNumber]
  )
  return rows[0] ?? null
}

export async function insertAttendance(
  { id, orderId, sessionNumber, sessionDate, clientPresent, trainerPresent, trainerName, notes },
  client
) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO attendance_pp
       (id, order_id, session_number, session_date, client_present, trainer_present, trainer_name, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [id, orderId, sessionNumber, sessionDate, clientPresent ?? true, trainerPresent ?? true,
     trainerName ?? null, notes ?? null]
  )
  return rows[0]
}

export async function updateAttendancePhoto(id, { photoPath, photoThumbPath, photoRawPath }, client) {
  const q = client ? client.query.bind(client) : query
  const setClauses = ['updated_at = NOW()']
  const values = [id]

  if (photoPath      !== undefined) { values.push(photoPath);      setClauses.push(`photo_path=$${values.length}`) }
  if (photoThumbPath !== undefined) { values.push(photoThumbPath); setClauses.push(`photo_thumb_path=$${values.length}`) }
  if (photoRawPath   !== undefined) { values.push(photoRawPath);   setClauses.push(`photo_raw_path=$${values.length}`) }

  const { rows } = await q(
    `UPDATE attendance_pp SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
    values
  )
  return rows[0] ?? null
}

export async function updateAttendanceFields(id, fields, client) {
  const q = client ? client.query.bind(client) : query
  const allowed = ['session_date', 'client_present', 'trainer_present', 'trainer_name', 'notes']
  const setClauses = ['updated_at = NOW()']
  const values = [id]

  for (const [key, val] of Object.entries(fields)) {
    if (allowed.includes(key) && val !== undefined) {
      values.push(val)
      setClauses.push(`${key}=$${values.length}`)
    }
  }

  if (setClauses.length === 1) return findAttendanceById(id, client)

  const { rows } = await q(
    `UPDATE attendance_pp SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
    values
  )
  return rows[0] ?? null
}
