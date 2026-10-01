/**
 * Attendance Service — Phase 3.
 *
 * Records per-session attendance for PP orders.
 * Photos are compressed (sharp) and stored in Supabase Storage.
 * Photo storage is optional — attendance record is created even if upload fails.
 */

import { withTransaction } from '../../db/index.js'
import { recordAuditEvent, AuditEventType, EntityType } from '../audit/audit.service.js'
import { validationError, notFound, conflict } from '../../shared/errors.js'
import { findOrderById } from '../order/order.repository.js'
import { nextId, DOCTYPE, MODULE } from '../id/id.generator.js'
import {
  findAttendanceById, findAttendanceByOrder, findAttendanceByOrderAndSession,
  insertAttendance, updateAttendancePhoto, updateAttendanceFields,
} from './attendance.repository.js'
import { uploadFile, replaceFile, getSignedUrl, validateMagicBytes } from '../../services/storage.service.js'
import { env } from '../../config/env.js'

const PHOTO_BUCKET = 'attendance'
const RAW_BUCKET   = 'attendance-raw'

let sharp
async function getSharp() {
  if (!sharp) {
    const mod = await import('sharp')
    sharp = mod.default
  }
  return sharp
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function listAttendanceByOrder(orderId) {
  const rows = await findAttendanceByOrder(orderId)
  return Promise.all(rows.map(enrichWithSignedUrls))
}

export async function getAttendance(id) {
  const row = await findAttendanceById(id)
  if (!row) throw notFound('Attendance', id)
  return enrichWithSignedUrls(row)
}

async function enrichWithSignedUrls(att) {
  if (!att.photo_path && !att.photo_thumb_path) return att
  try {
    const [photoUrl, thumbUrl] = await Promise.all([
      att.photo_path       ? getSignedUrl(PHOTO_BUCKET, att.photo_path, 3600)       : null,
      att.photo_thumb_path ? getSignedUrl(PHOTO_BUCKET, att.photo_thumb_path, 3600) : null,
    ])
    return { ...att, photo_url: photoUrl, photo_thumb_url: thumbUrl }
  } catch {
    return att
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createAttendance(
  { orderId, sessionNumber, sessionDate, clientPresent, trainerPresent, trainerName, notes },
  requestId
) {
  if (!orderId)       throw validationError('orderId is required')
  if (!sessionNumber) throw validationError('sessionNumber is required')
  if (!sessionDate)   throw validationError('sessionDate is required')

  const order = await findOrderById(orderId)
  if (!order) throw notFound('Order', orderId)

  const existing = await findAttendanceByOrderAndSession(orderId, sessionNumber)
  if (existing) {
    throw conflict(`Attendance record already exists for order ${orderId} session ${sessionNumber} (${existing.id})`)
  }

  return withTransaction(async (client) => {
    const id = await nextId(DOCTYPE.ATTENDANCE, MODULE.PP, { client })
    const att = await insertAttendance({
      id, orderId, sessionNumber, sessionDate,
      clientPresent, trainerPresent, trainerName, notes,
    }, client)

    await recordAuditEvent({
      eventType: AuditEventType.ATTENDANCE_CREATED,
      entityType: EntityType.ATTENDANCE,
      entityId: id,
      actorId: requestId,
      metadata: { orderId, sessionNumber, sessionDate },
      requestId,
      client,
    })
    return att
  })
}

// ─── Update Fields ────────────────────────────────────────────────────────────

export async function updateAttendance(id, fields, requestId) {
  const att = await findAttendanceById(id)
  if (!att) throw notFound('Attendance', id)

  const updated = await updateAttendanceFields(id, {
    session_date:     fields.sessionDate,
    client_present:   fields.clientPresent,
    trainer_present:  fields.trainerPresent,
    trainer_name:     fields.trainerName,
    notes:            fields.notes,
  }, null)

  await recordAuditEvent({
    eventType: AuditEventType.UPDATED,
    entityType: EntityType.ATTENDANCE,
    entityId: id,
    metadata: { fields: Object.keys(fields) },
    requestId,
  })
  return updated
}

// ─── Photo Upload ─────────────────────────────────────────────────────────────

const PHOTO_MAX_BYTES = parseInt(env.PHOTO_MAX_BYTES ?? '20971520', 10) // 20 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png']
const THUMB_SIZE   = 300
const COMPRESSED_WIDTH = 1200

export async function uploadAttendancePhoto(id, photoBuffer, requestId) {
  if (!photoBuffer || !photoBuffer.length) throw validationError('Photo file is required')
  if (photoBuffer.length > PHOTO_MAX_BYTES) {
    throw validationError(`Photo too large (${photoBuffer.length} bytes, max ${PHOTO_MAX_BYTES})`)
  }

  const detectedMime = validateMagicBytes(photoBuffer, ALLOWED_MIME)

  const att = await findAttendanceById(id)
  if (!att) throw notFound('Attendance', id)

  const s = await getSharp()

  // Compress to JPEG and generate thumbnail
  const [compressedBuf, thumbBuf] = await Promise.all([
    s(photoBuffer).resize(COMPRESSED_WIDTH, null, { withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer(),
    s(photoBuffer).resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover' }).jpeg({ quality: 70 }).toBuffer(),
  ])

  const prefix    = `${att.order_id}/${att.id}`
  const photoPath = `${prefix}.jpg`
  const thumbPath = `${prefix}_thumb.jpg`
  const rawPath   = `${att.order_id}/${att.id}_raw.${detectedMime === 'image/png' ? 'png' : 'jpg'}`

  const uploadOrReplace = att.photo_path ? replaceFile : uploadFile

  try {
    await Promise.all([
      uploadOrReplace(PHOTO_BUCKET, photoPath, compressedBuf, 'image/jpeg'),
      uploadOrReplace(PHOTO_BUCKET, thumbPath, thumbBuf, 'image/jpeg'),
      uploadOrReplace(RAW_BUCKET, rawPath, photoBuffer, detectedMime),
    ])
  } catch (err) {
    console.warn(`[attendance] Photo upload failed: ${err.message}`)
    return att
  }

  const updated = await updateAttendancePhoto(id, {
    photoPath, photoThumbPath: thumbPath, photoRawPath: rawPath,
  }, null)

  await recordAuditEvent({
    eventType: AuditEventType.ATTENDANCE_PHOTO_UPLOADED,
    entityType: EntityType.ATTENDANCE,
    entityId: id,
    actorId: requestId,
    metadata: { orderId: att.order_id, sessionNumber: att.session_number, photoPath },
    requestId,
  })

  return enrichWithSignedUrls(updated)
}
