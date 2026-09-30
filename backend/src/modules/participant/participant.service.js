import { withTransaction } from '../../db/index.js'
import { nextId, DOCTYPE, MODULE } from '../id/id.generator.js'
import { recordAuditEvent, AuditEventType, EntityType } from '../audit/audit.service.js'
import { validationError, notFound, conflict } from '../../shared/errors.js'
import {
  insertParticipant, findParticipantById,
  findParticipantByOrderId, findParticipantsByClientId,
  updateParticipant,
} from './participant.repository.js'
import { findOrderById } from '../order/order.repository.js'

const VALID_GENDERS = ['M', 'F', 'O']
const VALID_FITNESS_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

export async function getParticipant(id) {
  const p = await findParticipantById(id)
  if (!p) throw notFound('Participant', id)
  return p
}

export async function getParticipantByOrder(orderId) {
  const p = await findParticipantByOrderId(orderId)
  if (!p) throw notFound('Participant for order', orderId)
  return p
}

export async function listParticipantsByClient(clientId) {
  return findParticipantsByClientId(clientId)
}

export async function createParticipant(
  { orderId, clientId, fullName, dateOfBirth, gender, initialFitnessLevel, fitnessGoals, healthNotes, trainerNotes },
  requestId
) {
  if (!orderId?.trim()) throw validationError('orderId is required')
  if (!clientId?.trim()) throw validationError('clientId is required')
  if (!fullName?.trim()) throw validationError('fullName is required')
  if (gender && !VALID_GENDERS.includes(gender)) throw validationError(`gender must be one of: ${VALID_GENDERS.join(', ')}`)
  if (initialFitnessLevel && !VALID_FITNESS_LEVELS.includes(initialFitnessLevel)) {
    throw validationError(`initialFitnessLevel must be one of: ${VALID_FITNESS_LEVELS.join(', ')}`)
  }

  return withTransaction(async (client) => {
    // Verify order exists
    const order = await findOrderById(orderId, client)
    if (!order) throw notFound('Order', orderId)

    // ONE participant per order (enforced by DB UNIQUE + app-level guard)
    const existing = await findParticipantByOrderId(orderId, client)
    if (existing) throw conflict(`Participant already exists for order ${orderId}`)

    const id = await nextId(DOCTYPE.PARTICIPANT, MODULE.PP, { client })
    const record = await insertParticipant(
      { id, orderId, clientId, fullName: fullName.trim(), dateOfBirth, gender, initialFitnessLevel, fitnessGoals, healthNotes, trainerNotes },
      client
    )
    await recordAuditEvent({
      eventType: AuditEventType.PARTICIPANT_CREATED,
      entityType: EntityType.PARTICIPANT,
      entityId: id,
      metadata: { orderId, clientId, fullName: record.full_name },
      requestId,
      client,
    })
    return record
  })
}

export async function updateParticipantDetails(id, updates, requestId) {
  const existing = await findParticipantById(id)
  if (!existing) throw notFound('Participant', id)

  const fieldMap = {}
  if (updates.fullName !== undefined) fieldMap.full_name = updates.fullName.trim()
  if (updates.dateOfBirth !== undefined) fieldMap.date_of_birth = updates.dateOfBirth
  if (updates.gender !== undefined) {
    if (!VALID_GENDERS.includes(updates.gender)) throw validationError(`gender must be one of: ${VALID_GENDERS.join(', ')}`)
    fieldMap.gender = updates.gender
  }
  if (updates.initialFitnessLevel !== undefined) {
    if (!VALID_FITNESS_LEVELS.includes(updates.initialFitnessLevel)) {
      throw validationError(`initialFitnessLevel must be one of: ${VALID_FITNESS_LEVELS.join(', ')}`)
    }
    fieldMap.initial_fitness_level = updates.initialFitnessLevel
  }
  if (updates.fitnessGoals !== undefined) fieldMap.fitness_goals = updates.fitnessGoals
  if (updates.healthNotes !== undefined) fieldMap.health_notes = updates.healthNotes
  if (updates.trainerNotes !== undefined) fieldMap.trainer_notes = updates.trainerNotes
  if (updates.status !== undefined) {
    if (!['ACTIVE', 'INACTIVE'].includes(updates.status)) throw validationError('status must be ACTIVE or INACTIVE')
    fieldMap.status = updates.status
  }

  return withTransaction(async (client) => {
    const updated = await updateParticipant(id, fieldMap, client)
    await recordAuditEvent({
      eventType: AuditEventType.PARTICIPANT_UPDATED,
      entityType: EntityType.PARTICIPANT,
      entityId: id,
      metadata: { changes: fieldMap },
      requestId,
      client,
    })
    return updated
  })
}
