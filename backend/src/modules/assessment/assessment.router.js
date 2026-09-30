import { Router } from 'express'
import { asyncHandler } from '../../middleware/errorHandler.js'
import {
  getAssessment, listAssessmentsByParticipant,
  listAssessmentsByOrder, createAssessment,
  updateAssessmentDetails,
} from './assessment.service.js'

export const assessmentRouter = Router()

assessmentRouter.get('/assessments/:id', asyncHandler(async (req, res) => {
  const assessment = await getAssessment(req.params.id)
  res.json({ data: assessment })
}))

assessmentRouter.get('/participants/:participantId/assessments', asyncHandler(async (req, res) => {
  const assessments = await listAssessmentsByParticipant(req.params.participantId)
  res.json({ data: assessments, total: assessments.length })
}))

assessmentRouter.get('/orders/:orderId/assessments', asyncHandler(async (req, res) => {
  const assessments = await listAssessmentsByOrder(req.params.orderId)
  res.json({ data: assessments, total: assessments.length })
}))

assessmentRouter.post('/assessments', asyncHandler(async (req, res) => {
  const assessment = await createAssessment(req.body, req.requestId)
  res.status(201).json({ data: assessment })
}))

assessmentRouter.patch('/assessments/:id', asyncHandler(async (req, res) => {
  const assessment = await updateAssessmentDetails(req.params.id, req.body, req.requestId)
  res.json({ data: assessment })
}))
