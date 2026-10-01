import { Router } from 'express'
import multer from 'multer'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import {
  getPayment, listPaymentsByInvoice, submitPayment,
  confirmPayment, rejectPayment, uploadPaymentProof,
} from './payment.service.js'
import { env } from '../../config/env.js'
import { validationError } from '../../shared/errors.js'

export const paymentRouter = Router()

const PROOF_MAX_BYTES = parseInt(env.PROOF_MAX_BYTES ?? '10485760', 10)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: PROOF_MAX_BYTES } })

paymentRouter.use(requireAuth)

paymentRouter.get('/payments/:id', asyncHandler(async (req, res) => {
  const payment = await getPayment(req.params.id)
  res.json({ data: payment })
}))

paymentRouter.get('/invoices/:invoiceId/payments', asyncHandler(async (req, res) => {
  const payments = await listPaymentsByInvoice(req.params.invoiceId)
  res.json({ data: payments, count: payments.length })
}))

paymentRouter.post('/payments', asyncHandler(async (req, res) => {
  const payment = await submitPayment(req.body, req.requestId)
  res.status(201).json({ data: payment })
}))

paymentRouter.post('/payments/:id/confirm', asyncHandler(async (req, res) => {
  const result = await confirmPayment(req.params.id, req.body, req.requestId)
  res.json({ data: result })
}))

paymentRouter.post('/payments/:id/reject', asyncHandler(async (req, res) => {
  const payment = await rejectPayment(req.params.id, req.body, req.requestId)
  res.json({ data: payment })
}))

// Upload payment proof (Admin / Finance / Operations / PP)
paymentRouter.post(
  '/payments/:id/proof',
  requireRole('Admin', 'Finance', 'Operations', 'PP'),
  upload.single('proof'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw validationError('proof file is required (multipart field: "proof")')
    const payment = await uploadPaymentProof(req.params.id, req.file.buffer, req.requestId)
    res.json({ data: payment })
  })
)
