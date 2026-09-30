import { Router } from 'express'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { getPayment, listPaymentsByInvoice, submitPayment, confirmPayment, rejectPayment } from './payment.service.js'

export const paymentRouter = Router()

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
