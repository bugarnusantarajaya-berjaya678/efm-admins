import app from './app.js'
import { env } from './config/env.js'
import { checkConnection } from './db/index.js'

async function start() {
  try {
    await checkConnection()
    console.log('[server] Database connection verified.')
  } catch (err) {
    console.error('[server] Database connection failed:', err.message)
    process.exit(1)
  }

  app.listen(env.PORT, () => {
    console.log(`[server] EFM backend running on port ${env.PORT} (${env.NODE_ENV})`)
  })
}

start()
