import { Router } from 'express'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { getEntityHistory, getRequestTrace } from './audit.service.js'
import { validationError } from '../../shared/errors.js'

export const auditRouter = Router()

auditRouter.get('/entity/:entityType/:entityId', asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params
  const events = await getEntityHistory(entityType, entityId)
  res.json({ data: events, count: events.length })
}))

auditRouter.get('/request/:requestId', asyncHandler(async (req, res) => {
  const { requestId } = req.params
  if (!/^[0-9a-f-]{36}$/i.test(requestId)) {
    throw validationError('requestId must be a valid UUID')
  }
  const events = await getRequestTrace(requestId)
  res.json({ data: events, count: events.length })
}))
