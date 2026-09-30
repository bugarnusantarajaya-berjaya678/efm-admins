import { query } from '../../db/index.js'

export async function insertParticipant(
  { id, orderId, clientId, fullName, dateOfBirth, gender, initialFitnessLevel, fitnessGoals, healthNotes, trainerNotes },
  client
) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO participants_pp
       (id, order_id, client_id, full_name, date_of_birth, gender,
        initial_fitness_level, fitness_goals, health_notes, trainer_notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      id, orderId, clientId, fullName,
      dateOfBirth ?? null, gender ?? null,
      initialFitnessLevel ?? null, fitnessGoals ?? null,
      healthNotes ?? null, trainerNotes ?? null,
    ]
  )
  return rows[0]
}

export async function findParticipantById(id, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q('SELECT * FROM participants_pp WHERE id = $1', [id])
  return rows[0] ?? null
}

export async function findParticipantByOrderId(orderId, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q('SELECT * FROM participants_pp WHERE order_id = $1', [orderId])
  return rows[0] ?? null
}

export async function findParticipantsByClientId(clientId) {
  const { rows } = await query(
    'SELECT * FROM participants_pp WHERE client_id = $1 ORDER BY created_at DESC',
    [clientId]
  )
  return rows
}

const ALLOWED_PARTICIPANT_FIELDS = [
  'full_name', 'date_of_birth', 'gender', 'initial_fitness_level',
  'fitness_goals', 'health_notes', 'trainer_notes', 'status',
]

export async function updateParticipant(id, fields, client) {
  const q = client ? client.query.bind(client) : query
  const setClauses = []
  const values = []
  for (const [key, val] of Object.entries(fields)) {
    if (ALLOWED_PARTICIPANT_FIELDS.includes(key)) {
      values.push(val)
      setClauses.push(`${key} = $${values.length}`)
    }
  }
  if (!setClauses.length) return findParticipantById(id, client)
  values.push(id)
  const { rows } = await q(
    `UPDATE participants_pp SET ${setClauses.join(', ')}, updated_at = NOW()
     WHERE id = $${values.length} RETURNING *`,
    values
  )
  return rows[0] ?? null
}
