import { Router } from 'express'
import multer from 'multer'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { requireAuth, requireRole } from '../../middleware/auth.js'
import {
  listAttendanceByOrder, getAttendance, createAttendance,
  updateAttendance, uploadAttendancePhoto,
} from './attendance.service.js'
import { env } from '../../config/env.js'
import { validationError } from '../../shared/errors.js'

export const attendanceRouter = Router()

const PHOTO_MAX_BYTES = parseInt(env.PHOTO_MAX_BYTES ?? '20971520', 10)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: PHOTO_MAX_BYTES },
})

attendanceRouter.use(requireAuth)

attendanceRouter.get('/orders/:orderId/attendance', asyncHandler(async (req, res) => {
  const records = await listAttendanceByOrder(req.params.orderId)
  res.json({ data: records, count: records.length })
}))

attendanceRouter.get('/attendance/:id', asyncHandler(async (req, res) => {
  const att = await getAttendance(req.params.id)
  res.json({ data: att })
}))

// Create attendance record (Admin / Finance / Operations / PP)
attendanceRouter.post(
  '/orders/:orderId/attendance',
  requireRole('Admin', 'Finance', 'Operations', 'PP'),
  asyncHandler(async (req, res) => {
    const att = await createAttendance(
      { orderId: req.params.orderId, ...req.body },
      req.requestId
    )
    res.status(201).json({ data: att })
  })
)

// Update attendance fields
attendanceRouter.patch(
  '/attendance/:id',
  requireRole('Admin', 'Finance', 'Operations', 'PP'),
  asyncHandler(async (req, res) => {
    const att = await updateAttendance(req.params.id, req.body, req.requestId)
    res.json({ data: att })
  })
)

// Upload attendance photo
attendanceRouter.post(
  '/attendance/:id/photo',
  requireRole('Admin', 'Finance', 'Operations', 'PP'),
  upload.single('photo'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw validationError('photo file is required (multipart field: "photo")')
    const att = await uploadAttendancePhoto(req.params.id, req.file.buffer, req.requestId)
    res.json({ data: att })
  })
)
