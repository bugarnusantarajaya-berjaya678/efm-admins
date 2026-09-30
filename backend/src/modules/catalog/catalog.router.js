import { Router } from 'express'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { listPrograms, getProgram, listOfferings, getOffering, listPackages, getPackage } from './catalog.service.js'

export const catalogRouter = Router()

catalogRouter.get('/catalog/programs', asyncHandler(async (req, res) => {
  const programs = await listPrograms()
  res.json({ data: programs, count: programs.length })
}))

catalogRouter.get('/catalog/programs/:id', asyncHandler(async (req, res) => {
  const program = await getProgram(req.params.id)
  res.json({ data: program })
}))

catalogRouter.get('/catalog/offerings', asyncHandler(async (req, res) => {
  const offerings = await listOfferings(req.query.programId)
  res.json({ data: offerings, count: offerings.length })
}))

catalogRouter.get('/catalog/offerings/:id', asyncHandler(async (req, res) => {
  const offering = await getOffering(req.params.id)
  res.json({ data: offering })
}))

catalogRouter.get('/catalog/packages', asyncHandler(async (req, res) => {
  const packages = await listPackages(req.query.offeringId)
  res.json({ data: packages, count: packages.length })
}))

catalogRouter.get('/catalog/packages/:id', asyncHandler(async (req, res) => {
  const pkg = await getPackage(req.params.id)
  res.json({ data: pkg })
}))
