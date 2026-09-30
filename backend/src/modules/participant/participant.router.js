import { Router } from 'express'
import { asyncHandler } from '../../middleware/errorHandler.js'
import {
  getParticipant, getParticipantByOrder,
  listParticipantsByClient, createParticipant,
  updateParticipantDetails,
} from './participant.service.js'

export const participantRouter = Router()

participantRouter.get('/participants/:id', asyncHandler(async (req, res) => {
  const participant = await getParticipant(req.params.id)
  res.json({ data: participant })
}))

participantRouter.get('/orders/:orderId/participant', asyncHandler(async (req, res) => {
  const participant = await getParticipantByOrder(req.params.orderId)
  res.json({ data: participant })
}))

participantRouter.get('/clients/:clientId/participants', asyncHandler(async (req, res) => {
  const participants = await listParticipantsByClient(req.params.clientId)
  res.json({ data: participants, total: participants.length })
}))

participantRouter.post('/participants', asyncHandler(async (req, res) => {
  const participant = await createParticipant(req.body, req.requestId)
  res.status(201).json({ data: participant })
}))

participantRouter.patch('/participants/:id', asyncHandler(async (req, res) => {
  const participant = await updateParticipantDetails(req.params.id, req.body, req.requestId)
  res.json({ data: participant })
}))
