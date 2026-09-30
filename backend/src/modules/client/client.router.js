import { Router } from 'express'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { listClients, getClient, createClient, updateClientDetails } from './client.service.js'

export const clientRouter = Router()

clientRouter.get('/clients', asyncHandler(async (req, res) => {
  const { status, limit, offset } = req.query
  const result = await listClients({
    status,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
  })
  res.json(result)
}))

clientRouter.get('/clients/:id', asyncHandler(async (req, res) => {
  const client = await getClient(req.params.id)
  res.json({ data: client })
}))

clientRouter.post('/clients', asyncHandler(async (req, res) => {
  const client = await createClient(req.body, req.requestId)
  res.status(201).json({ data: client })
}))

clientRouter.patch('/clients/:id', asyncHandler(async (req, res) => {
  const client = await updateClientDetails(req.params.id, req.body, req.requestId)
  res.json({ data: client })
}))
