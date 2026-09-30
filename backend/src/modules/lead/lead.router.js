import { Router } from 'express'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { listLeads, getLead, createLead, updateLeadDetails, convertLead } from './lead.service.js'

export const leadRouter = Router()

leadRouter.get('/leads', asyncHandler(async (req, res) => {
  const { status, limit, offset } = req.query
  const result = await listLeads({
    status,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
  })
  res.json(result)
}))

leadRouter.get('/leads/:id', asyncHandler(async (req, res) => {
  const lead = await getLead(req.params.id)
  res.json({ data: lead })
}))

leadRouter.post('/leads', asyncHandler(async (req, res) => {
  const lead = await createLead(req.body, req.requestId)
  res.status(201).json({ data: lead })
}))

leadRouter.patch('/leads/:id', asyncHandler(async (req, res) => {
  const lead = await updateLeadDetails(req.params.id, req.body, req.requestId)
  res.json({ data: lead })
}))

leadRouter.post('/leads/:id/convert', asyncHandler(async (req, res) => {
  const lead = await convertLead(req.params.id, req.requestId)
  res.json({ data: lead })
}))
