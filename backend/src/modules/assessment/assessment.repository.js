import { query } from '../../db/index.js'

export async function insertAssessment(
  { id, participantId, orderId, assessorId, assessmentDate, assessmentType, heightCm, weightKg, bodyFatPct, fitnessScore, notes },
  client
) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q(
    `INSERT INTO assessments_pp
       (id, participant_id, order_id, assessor_id, assessment_date, assessment_type,
        height_cm, weight_kg, body_fat_pct, fitness_score, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      id, participantId, orderId,
      assessorId ?? null,
      assessmentDate ?? new Date().toISOString().split('T')[0],
      assessmentType,
      heightCm ?? null, weightKg ?? null, bodyFatPct ?? null,
      fitnessScore ?? null, notes ?? null,
    ]
  )
  return rows[0]
}

export async function findAssessmentById(id, client) {
  const q = client ? client.query.bind(client) : query
  const { rows } = await q('SELECT * FROM assessments_pp WHERE id = $1', [id])
  return rows[0] ?? null
}

export async function findAssessmentsByParticipantId(participantId) {
  const { rows } = await query(
    'SELECT * FROM assessments_pp WHERE participant_id = $1 ORDER BY assessment_date DESC, created_at DESC',
    [participantId]
  )
  return rows
}

export async function findAssessmentsByOrderId(orderId) {
  const { rows } = await query(
    'SELECT * FROM assessments_pp WHERE order_id = $1 ORDER BY assessment_date DESC, created_at DESC',
    [orderId]
  )
  return rows
}

const ALLOWED_ASSESSMENT_FIELDS = [
  'assessor_id', 'assessment_date', 'assessment_type',
  'height_cm', 'weight_kg', 'body_fat_pct', 'fitness_score',
  'notes', 'status',
]

export async function updateAssessment(id, fields, client) {
  const q = client ? client.query.bind(client) : query
  const setClauses = []
  const values = []
  for (const [key, val] of Object.entries(fields)) {
    if (ALLOWED_ASSESSMENT_FIELDS.includes(key)) {
      values.push(val)
      setClauses.push(`${key} = $${values.length}`)
    }
  }
  if (!setClauses.length) return findAssessmentById(id, client)
  values.push(id)
  const { rows } = await q(
    `UPDATE assessments_pp SET ${setClauses.join(', ')}, updated_at = NOW()
     WHERE id = $${values.length} RETURNING *`,
    values
  )
  return rows[0] ?? null
}
