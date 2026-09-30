import { Router } from 'express'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { listOrders, getOrder, getOrderWithSnapshot, createOrder, transitionOrderStatus, isOrderProgramReady } from './order.service.js'

export const orderRouter = Router()

orderRouter.get('/orders', asyncHandler(async (req, res) => {
  const { clientId, status, limit, offset } = req.query
  const result = await listOrders({
    clientId, status,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
  })
  res.json(result)
}))

orderRouter.get('/orders/:id', asyncHandler(async (req, res) => {
  const order = await getOrderWithSnapshot(req.params.id)
  res.json({ data: order })
}))

orderRouter.post('/orders', asyncHandler(async (req, res) => {
  const order = await createOrder(req.body, req.requestId)
  res.status(201).json({ data: order })
}))

orderRouter.post('/orders/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body
  if (!status) {
    return res.status(400).json({ error: { type: 'VALIDATION_ERROR', message: 'status is required' } })
  }
  const order = await transitionOrderStatus(req.params.id, status, req.requestId)
  res.json({ data: order })
}))

orderRouter.get('/orders/:id/readiness', asyncHandler(async (req, res) => {
  const ready = await isOrderProgramReady(req.params.id)
  res.json({ data: { orderId: req.params.id, programReady: ready } })
}))
