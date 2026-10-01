import { Router } from 'express'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import {
  listAgreements, getAgreement, getAgreementByOrder,
  createAgreement, updateAgreement, issueAgreement,
  signAgreement, voidAgreement,
} from './agreement.service.js'

export const agreementRouter = Router()

// All agreement routes require authentication
agreementRouter.use(requireAuth)

agreementRouter.get('/agreements', asyncHandler(async (req, res) => {
  const { status, limit, offset } = req.query
  const data = await listAgreements({
    status,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
  })
  res.json({ data })
}))

agreementRouter.get('/agreements/:id', asyncHandler(async (req, res) => {
  const ag = await getAgreement(req.params.id)
  res.json({ data: ag })
}))

agreementRouter.get('/orders/:orderId/agreement', asyncHandler(async (req, res) => {
  const ag = await getAgreementByOrder(req.params.orderId)
  res.json({ data: ag })
}))

// Create agreement (Admin / Finance / Operations)
agreementRouter.post('/agreements', requireRole('Admin', 'Finance', 'Operations', 'PP'), asyncHandler(async (req, res) => {
  const ag = await createAgreement(req.body, req.requestId)
  res.status(201).json({ data: ag })
}))

// Update content (draft only)
agreementRouter.patch('/agreements/:id', requireRole('Admin', 'Finance', 'Operations', 'PP'), asyncHandler(async (req, res) => {
  const ag = await updateAgreement(req.params.id, req.body, req.requestId)
  res.json({ data: ag })
}))

// Issue agreement (draft → issued, generates PDF)
agreementRouter.post('/agreements/:id/issue', requireRole('Admin', 'Finance', 'Operations'), asyncHandler(async (req, res) => {
  const ag = await issueAgreement(req.params.id, req.requestId)
  res.json({ data: ag })
}))

// Sign agreement (issued → signed)
agreementRouter.post('/agreements/:id/sign', asyncHandler(async (req, res) => {
  const { signedByName, signatureData } = req.body
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? req.socket.remoteAddress
  const clientUa = req.headers['user-agent'] ?? null
  const ag = await signAgreement(req.params.id, { signedByName, signatureData, clientIp, clientUa }, req.requestId)
  res.json({ data: ag })
}))

// Void agreement (Admin only)
agreementRouter.post('/agreements/:id/void', requireRole('Admin'), asyncHandler(async (req, res) => {
  const { voidedBy, voidReason } = req.body
  const ag = await voidAgreement(req.params.id, { voidedBy, voidReason }, req.requestId)
  res.json({ data: ag })
}))
