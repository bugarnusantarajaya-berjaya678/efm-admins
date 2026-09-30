import { Router } from 'express'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { getRefund, listRefundsByOrder, requestRefund, processRefund, rejectRefund } from './refund.service.js'

export const refundRouter = Router()

refundRouter.get('/refunds/:id', asyncHandler(async (req, res) => {
  const refund = await getRefund(req.params.id)
  res.json({ data: refund })
}))

refundRouter.get('/orders/:orderId/refunds', asyncHandler(async (req, res) => {
  const refunds = await listRefundsByOrder(req.params.orderId)
  res.json({ data: refunds, count: refunds.length })
}))

refundRouter.post('/refunds', asyncHandler(async (req, res) => {
  const refund = await requestRefund(req.body, req.requestId)
  res.status(201).json({ data: refund })
}))

refundRouter.post('/refunds/:id/process', asyncHandler(async (req, res) => {
  const refund = await processRefund(req.params.id, req.body, req.requestId)
  res.json({ data: refund })
}))

refundRouter.post('/refunds/:id/reject', asyncHandler(async (req, res) => {
  const refund = await rejectRefund(req.params.id, req.body, req.requestId)
  res.json({ data: refund })
}))
