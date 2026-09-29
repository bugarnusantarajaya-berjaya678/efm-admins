import express from 'express'
import { correlationId } from './middleware/correlationId.js'
import { errorHandler } from './middleware/errorHandler.js'
import { asyncHandler } from './middleware/errorHandler.js'
import { checkConnection } from './db/index.js'
import { picRouter } from './modules/pic/pic.router.js'
import { auditRouter } from './modules/audit/audit.router.js'

const app = express()

app.use(express.json())
app.use(correlationId)

// Health check — verifies DB connectivity
app.get('/health', asyncHandler(async (req, res) => {
  const dbTime = await checkConnection()
  res.json({
    status: 'ok',
    requestId: req.requestId,
    db: { connected: true, serverTime: dbTime },
    version: '1.0.0-phase1',
  })
}))

// Module routers
app.use('/api/v1/pics', picRouter)
app.use('/api/v1/audit', auditRouter)

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ error: { type: 'NOT_FOUND', message: `Route not found: ${req.method} ${req.path}` } })
})

// Global error handler — must be last
app.use(errorHandler)

export default app
