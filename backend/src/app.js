import express from 'express'
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

// CORS — allow all origins (auth is via JWT, not cookies)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
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
// Phase 2A PP Commercial Core
app.use('/api/pp', catalogRouter)    // catalog read is public-ish, auth inside service if needed
app.use('/api/pp', leadRouter)
app.use('/api/pp', clientRouter)
app.use('/api/pp', orderRouter)
app.use('/api/pp', invoiceRouter)    // requireAuth applied inside router (Phase 3)
app.use('/api/pp', paymentRouter)    // requireAuth applied inside router (Phase 3)
app.use('/api/pp', receiptRouter)    // requireAuth applied inside router (Phase 3)
app.use('/api/pp', refundRouter)
// Phase 2B PP Participants & Assessments
app.use('/api/pp', participantRouter)
app.use('/api/pp', assessmentRouter)
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
