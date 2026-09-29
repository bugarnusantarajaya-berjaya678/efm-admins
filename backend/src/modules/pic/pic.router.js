import { Router } from 'express'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { createPic, getPic, listPics, updatePicDetails, addPicContext } from './pic.service.js'
import { validationError } from '../../shared/errors.js'

export const picRouter = Router()

picRouter.get('/', asyncHandler(async (req, res) => {
  const pics = await listPics(req.query)
  res.json({ data: pics, count: pics.length })
}))

picRouter.get('/:id', asyncHandler(async (req, res) => {
  const pic = await getPic(req.params.id)
  res.json({ data: pic })
}))

picRouter.post('/', asyncHandler(async (req, res) => {
  const { fullName, email, phone, pksExpiryDate, contexts } = req.body
  if (!fullName) throw validationError('fullName is required')
  const pic = await createPic({ fullName, email, phone, pksExpiryDate, contexts }, req.requestId)
  res.status(201).json({ data: pic })
}))

picRouter.patch('/:id', asyncHandler(async (req, res) => {
  const updated = await updatePicDetails(req.params.id, req.body, req.requestId)
  res.json({ data: updated })
}))

picRouter.post('/:id/contexts', asyncHandler(async (req, res) => {
  const ctx = await addPicContext(req.params.id, req.body, req.requestId)
  res.status(201).json({ data: ctx })
}))
