import { Router } from 'express'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { listInvoices, getInvoice, issueInvoice, sendInvoice, cancelInvoice, runOverdueCheck } from './invoice.service.js'

export const invoiceRouter = Router()

invoiceRouter.get('/invoices', asyncHandler(async (req, res) => {
  const { status, limit, offset } = req.query
  const result = await listInvoices({
    status,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
  })
  res.json(result)
}))

invoiceRouter.get('/invoices/:id', asyncHandler(async (req, res) => {
  const invoice = await getInvoice(req.params.id)
  res.json({ data: invoice })
}))

invoiceRouter.post('/invoices', asyncHandler(async (req, res) => {
  const invoice = await issueInvoice(req.body, req.requestId)
  res.status(201).json({ data: invoice })
}))

invoiceRouter.post('/invoices/:id/send', asyncHandler(async (req, res) => {
  const invoice = await sendInvoice(req.params.id, req.requestId)
  res.json({ data: invoice })
}))

invoiceRouter.post('/invoices/:id/cancel', asyncHandler(async (req, res) => {
  const invoice = await cancelInvoice(req.params.id, req.requestId)
  res.json({ data: invoice })
}))

invoiceRouter.post('/invoices/overdue-check', asyncHandler(async (req, res) => {
  const count = await runOverdueCheck(req.requestId)
  res.json({ data: { updated: count } })
}))
