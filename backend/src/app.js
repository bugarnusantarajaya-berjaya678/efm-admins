import express from 'express'
import { env } from './config/env.js'
import { correlationId } from './middleware/correlationId.js'
import { errorHandler } from './middleware/errorHandler.js'
import { asyncHandler } from './middleware/errorHandler.js'
import { requireAuth } from './middleware/auth.js'
import { checkConnection } from './db/index.js'
import { picRouter } from './modules/pic/pic.router.js'
import { auditRouter } from './modules/audit/audit.router.js'
// Phase 2A Commercial Core
import { catalogRouter } from './modules/catalog/catalog.router.js'
import { leadRouter } from './modules/lead/lead.router.js'
import { clientRouter } from './modules/client/client.router.js'
import { orderRouter } from './modules/order/order.router.js'
import { invoiceRouter } from './modules/invoice/invoice.router.js'
import { paymentRouter } from './modules/payment/payment.router.js'
import { receiptRouter } from './modules/receipt/receipt.router.js'
import { refundRouter } from './modules/refund/refund.router.js'
// Phase 2B Participants & Assessments
import { participantRouter } from './modules/participant/participant.router.js'
import { assessmentRouter } from './modules/assessment/assessment.router.js'
// Phase 3 Storage, Agreements & Attendance
import { agreementRouter } from './modules/agreement/agreement.router.js'
import { attendanceRouter } from './modules/attendance/attendance.router.js'

const app = express()

// CORS — restrict to configured origins in production; JWT auth is stateless so wildcard
// is technically safe, but an explicit allowlist is better posture.
app.use((req, res, next) => {
  const origin = req.headers.origin
  const allowed = env.CORS_ORIGINS
  if (allowed.includes('*') || (origin && allowed.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
    if (origin) res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Request-Id,X-Test-Role')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.use(express.json())
app.use(correlationId)

// Health check — public, no auth
app.get('/health', asyncHandler(async (req, res) => {
  const dbTime = await checkConnection()
  res.json({
    status: 'ok',
    requestId: req.requestId,
    db: { connected: true, serverTime: dbTime },
    version: '1.0.0-phase3',
  })
}))

// Phase 1 routers (requireAuth is inside each router for Phase 3 routers;
// Phase 1/2A/2B routers that predate auth middleware get it applied here)
app.use('/api/v1/pics', requireAuth, picRouter)
app.use('/api/v1/audit', requireAuth, auditRouter)
// Phase 2A PP Commercial Core (requireAuth at mount point for all PP routes)
app.use('/api/pp', requireAuth, catalogRouter)
app.use('/api/pp', requireAuth, leadRouter)
app.use('/api/pp', requireAuth, clientRouter)
app.use('/api/pp', requireAuth, orderRouter)
app.use('/api/pp', requireAuth, invoiceRouter)
app.use('/api/pp', requireAuth, paymentRouter)
app.use('/api/pp', requireAuth, receiptRouter)
app.use('/api/pp', requireAuth, refundRouter)
// Phase 2B PP Participants & Assessments
app.use('/api/pp', requireAuth, participantRouter)
app.use('/api/pp', requireAuth, assessmentRouter)
// Phase 3 — Agreements & Attendance (requireAuth inside routers)
app.use('/api/pp', agreementRouter)
app.use('/api/pp', attendanceRouter)

// Multer error handler (file too large, unexpected field, etc.)
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: { type: 'VALIDATION_ERROR', message: 'File too large' } })
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: { type: 'VALIDATION_ERROR', message: `Unexpected field: ${err.field}` } })
  }
  next(err)
})

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ error: { type: 'NOT_FOUND', message: `Route not found: ${req.method} ${req.path}` } })
})

// Global error handler — must be last
app.use(errorHandler)

export default app
