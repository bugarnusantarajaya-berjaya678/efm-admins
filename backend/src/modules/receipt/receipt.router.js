import { Router } from 'express'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import {
  getReceipt, listReceiptsByOrder, getReceiptByPayment, generateAndStoreReceiptPdf,
} from './receipt.service.js'

export const receiptRouter = Router()

receiptRouter.use(requireAuth)

receiptRouter.get('/receipts/:id', asyncHandler(async (req, res) => {
  const receipt = await getReceipt(req.params.id)
  res.json({ data: receipt })
}))

receiptRouter.get('/orders/:orderId/receipts', asyncHandler(async (req, res) => {
  const receipts = await listReceiptsByOrder(req.params.orderId)
  res.json({ data: receipts, count: receipts.length })
}))

receiptRouter.get('/payments/:paymentId/receipt', asyncHandler(async (req, res) => {
  const receipt = await getReceiptByPayment(req.params.paymentId)
  res.json({ data: receipt })
}))

receiptRouter.post(
  '/receipts/:id/pdf',
  requireRole('Admin', 'Finance', 'Operations'),
  asyncHandler(async (req, res) => {
    const receipt = await generateAndStoreReceiptPdf(req.params.id, req.requestId)
    res.json({ data: receipt })
  })
)
