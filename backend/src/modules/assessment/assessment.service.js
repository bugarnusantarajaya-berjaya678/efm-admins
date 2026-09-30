import { withTransaction } from '../../db/index.js'
import { nextId, DOCTYPE, MODULE } from '../id/id.generator.js'
import { recordAuditEvent, AuditEventType, EntityType } from '../audit/audit.service.js'
import { validationError, notFound, businessRuleViolation } from '../../shared/errors.js'
import {
  insertAssessment, findAssessmentById,
  findAssessmentsByParticipantId, findAssessmentsByOrderId,
  updateAssessment,
} from './assessment.repository.js'
import { findParticipantById } from '../participant/participant.repository.js'

const VALID_ASSESSMENT_TYPES = ['PRE', 'MID', 'POST']
const VALID_STATUSES = ['DRAFT', 'COMPLETED', 'ARCHIVED']

export async function getAssessment(id) {
  const a = await findAssessmentById(id)
  if (!a) throw notFound('Assessment', id)
  return a
}

export async function listAssessmentsByParticipant(participantId) {
  const p = await findParticipantById(participantId)
  if (!p) throw notFound('Participant', participantId)
  return findAssessmentsByParticipantId(participantId)
}

export async function listAssessmentsByOrder(orderId) {
  return findAssessmentsByOrderId(orderId)
}

export async function createAssessment(
  { participantId, assessorId, assessmentDate, assessmentType, heightCm, weightKg, bodyFatPct, fitnessScore, notes },
  requestId
) {
  if (!participantId?.trim()) throw validationError('participantId is required')
  if (!assessmentType) throw validationError('assessmentType is required')
  if (!VALID_ASSESSMENT_TYPES.includes(assessmentType)) {
    throw validationError(`assessmentType must be one of: ${VALID_ASSESSMENT_TYPES.join(', ')}`)
  }
  if (fitnessScore !== undefined && fitnessScore !== null) {
    if (!Number.isInteger(fitnessScore) || fitnessScore < 0 || fitnessScore > 100) {
      throw validationError('fitnessScore must be an integer between 0 and 100')
    }
  }

  return withTransaction(async (client) => {
    const participant = await findParticipantById(participantId, client)
    if (!participant) throw notFound('Participant', participantId)

    const orderId = participant.order_id

    // SCR-YY-xxxx uses ASSESSMENT DOCTYPE + GLOBAL bucket
    const id = await nextId(DOCTYPE.ASSESSMENT, MODULE.GLOBAL, { client })
    const record = await insertAssessment(
      { id, participantId, orderId, assessorId, assessmentDate, assessmentType, heightCm, weightKg, bodyFatPct, fitnessScore, notes },
      client
    )
    await recordAuditEvent({
      eventType: AuditEventType.ASSESSMENT_CREATED,
      entityType: EntityType.ASSESSMENT,
      entityId: id,
      metadata: { participantId, orderId, assessmentType },
      requestId,
      client,
    })
    return record
  })
}

export async function updateAssessmentDetails(id, updates, requestId) {
  const existing = await findAssessmentById(id)
  if (!existing) throw notFound('Assessment', id)

  if (existing.status === 'ARCHIVED') {
    throw businessRuleViolation('ASSESSMENT_ARCHIVED', 'Cannot update an archived assessment')
  }

  const fieldMap = {}
  if (updates.assessorId !== undefined) fieldMap.assessor_id = updates.assessorId
  if (updates.assessmentDate !== undefined) fieldMap.assessment_date = updates.assessmentDate
  if (updates.assessmentType !== undefined) {
    if (!VALID_ASSESSMENT_TYPES.includes(updates.assessmentType)) {
      throw validationError(`assessmentType must be one of: ${VALID_ASSESSMENT_TYPES.join(', ')}`)
    }
    fieldMap.assessment_type = updates.assessmentType
  }
  if (updates.heightCm !== undefined) fieldMap.height_cm = updates.heightCm
  if (updates.weightKg !== undefined) fieldMap.weight_kg = updates.weightKg
  if (updates.bodyFatPct !== undefined) fieldMap.body_fat_pct = updates.bodyFatPct
  if (updates.fitnessScore !== undefined) {
    if (updates.fitnessScore !== null && (!Number.isInteger(updates.fitnessScore) || updates.fitnessScore < 0 || updates.fitnessScore > 100)) {
      throw validationError('fitnessScore must be an integer between 0 and 100')
    }
    fieldMap.fitness_score = updates.fitnessScore
  }
  if (updates.notes !== undefined) fieldMap.notes = updates.notes
  if (updates.status !== undefined) {
    if (!VALID_STATUSES.includes(updates.status)) {
      throw validationError(`status must be one of: ${VALID_STATUSES.join(', ')}`)
    }
    fieldMap.status = updates.status
  }

  return withTransaction(async (client) => {
    const updated = await updateAssessment(id, fieldMap, client)
    const eventType = fieldMap.status === 'COMPLETED'
      ? AuditEventType.ASSESSMENT_COMPLETED
      : AuditEventType.ASSESSMENT_UPDATED
    await recordAuditEvent({
      eventType,
      entityType: EntityType.ASSESSMENT,
      entityId: id,
      metadata: { changes: fieldMap },
      requestId,
      client,
    })
    return updated
  })
}
