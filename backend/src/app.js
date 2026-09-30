import express from 'express'
import { correlationId } from './middleware/correlationId.js'
import { errorHandler } from './middleware/errorHandler.js'
import { asyncHandler } from './middleware/errorHandler.js'
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
    version: '1.0.0-phase2a',
  })
}))

// Phase 1 routers
app.use('/api/v1/pics', picRouter)
app.use('/api/v1/audit', auditRouter)
// Phase 2A PP Commercial Core
app.use('/api/pp', catalogRouter)
app.use('/api/pp', leadRouter)
app.use('/api/pp', clientRouter)
app.use('/api/pp', orderRouter)
app.use('/api/pp', invoiceRouter)
app.use('/api/pp', paymentRouter)
app.use('/api/pp', receiptRouter)
app.use('/api/pp', refundRouter)

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ error: { type: 'NOT_FOUND', message: `Route not found: ${req.method} ${req.path}` } })
})

// Global error handler — must be last
app.use(errorHandler)

export default app
