import { Router } from 'express'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { getReceipt, listReceiptsByOrder, getReceiptByPayment } from './receipt.service.js'

export const receiptRouter = Router()

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
