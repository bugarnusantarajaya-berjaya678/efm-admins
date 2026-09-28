/**
 * Environment configuration loader.
 * Validates required variables at startup — missing required vars throw immediately.
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadDotEnv(filename) {
  try {
    const content = readFileSync(resolve(__dirname, '../../', filename), 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim()
      if (!(key in process.env)) process.env[key] = val
    }
  } catch {
    // file absent — rely on real environment
  }
}

const nodeEnv = process.env.NODE_ENV || 'development'

if (nodeEnv === 'test') {
  loadDotEnv('.env.test')
} else {
  loadDotEnv('.env')
}

function required(key) {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required environment variable: ${key}`)
  return val
}

function optional(key, fallback) {
  return process.env[key] ?? fallback
}

export const env = {
  NODE_ENV: nodeEnv,
  PORT: parseInt(optional('PORT', '3001'), 10),
  DATABASE_URL: required('DATABASE_URL'),
  TEST_DATABASE_URL: optional('TEST_DATABASE_URL', null),
  CORS_ORIGINS: optional('CORS_ORIGINS', 'http://localhost:5173').split(',').map(s => s.trim()),
  LOG_LEVEL: optional('LOG_LEVEL', 'info'),
  isTest: nodeEnv === 'test',
  isDev: nodeEnv === 'development',
  isProd: nodeEnv === 'production',
}
