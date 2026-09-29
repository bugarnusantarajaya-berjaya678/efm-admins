import { withTransaction } from '../../db/index.js'
import { nextId, DOCTYPE, MODULE } from '../id/id.generator.js'
import { findPicById, findAllPics, insertPic, updatePic, insertPicContext } from './pic.repository.js'
import { recordAuditEvent, AuditEventType, EntityType } from '../audit/audit.service.js'
import { notFound, conflict, validationError } from '../../shared/errors.js'

export async function createPic({ fullName, email, phone, pksExpiryDate, contexts }, requestId) {
  if (!fullName?.trim()) throw validationError('fullName is required')

  return withTransaction(async (client) => {
    const id = await nextId(DOCTYPE.PIC, MODULE.GLOBAL, { client })
    const pic = await insertPic({ id, fullName, email, phone, status: 'active', pksExpiryDate }, client)

    const picContexts = []
    for (const ctx of contexts ?? []) {
      const c = await insertPicContext({ picId: id, ...ctx }, client)
      picContexts.push(c)
    }

    await recordAuditEvent({
      eventType: AuditEventType.PIC_CREATED,
      entityType: EntityType.PIC,
      entityId: id,
      metadata: { fullName, email },
      requestId,
      client,
    })

    return { ...pic, contexts: picContexts }
  })
}

export async function getPic(id) {
  const pic = await findPicById(id)
  if (!pic) throw notFound('PIC', id)
  return pic
}

export async function listPics(filters) {
  return findAllPics(filters)
}

export async function updatePicDetails(id, updates, requestId) {
  const existing = await findPicById(id)
  if (!existing) throw notFound('PIC', id)

  return withTransaction(async (client) => {
    const updated = await updatePic(id, updates, client)
    // Guard against concurrent delete between the existence check above and
    // the UPDATE inside the transaction.
    if (!updated) throw notFound('PIC', id)

    await recordAuditEvent({
      eventType: updates.status ? AuditEventType.PIC_STATUS_CHANGED : AuditEventType.PIC_UPDATED,
      entityType: EntityType.PIC,
      entityId: id,
      metadata: updates,
      requestId,
      client,
    })
    return updated
  })
}

export async function addPicContext(picId, contextData, requestId) {
  const existing = await findPicById(picId)
  if (!existing) throw notFound('PIC', picId)

  return withTransaction(async (client) => {
    let ctx
    try {
      ctx = await insertPicContext({ picId, ...contextData }, client)
    } catch (err) {
      // FK violation on pic_id means the PIC was deleted concurrently
      if (err.code === '23503') throw notFound('PIC', picId)
      throw err
    }
    await recordAuditEvent({
      eventType: AuditEventType.PIC_UPDATED,
      entityType: EntityType.PIC,
      entityId: picId,
      metadata: { addedContext: contextData },
      requestId,
      client,
    })
    return ctx
  })
}
