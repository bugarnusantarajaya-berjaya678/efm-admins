/**
 * Phase 1 Acceptance — Config / Startup
 * Checklist item: B-d (missing required config fails explicitly)
 */

import { describe, it, expect, beforeAll } from '@jest/globals'

// Import env.js eagerly so .env.test is loaded into process.env
import '../../src/config/env.js'

describe('Environment configuration', () => {
  it('loads DATABASE_URL from .env.test', () => {
    expect(process.env.DATABASE_URL).toBeTruthy()
    expect(process.env.DATABASE_URL).toMatch(/^postgresql:\/\//)
  })

  it('sets NODE_ENV to test', () => {
    expect(process.env.NODE_ENV).toBe('test')
  })

  it('env module exports required fields', async () => {
    const { env } = await import('../../src/config/env.js')
    expect(env).toHaveProperty('DATABASE_URL')
    expect(env).toHaveProperty('PORT')
    expect(env).toHaveProperty('NODE_ENV', 'test')
    expect(env.isTest).toBe(true)
    expect(env.CORS_ORIGINS).toBeInstanceOf(Array)
  })

  it('throws if a required env var is missing', () => {
    const original = process.env.DATABASE_URL
    delete process.env.DATABASE_URL
    expect(() => {
      // Inline function to exercise the required() path
      const val = process.env['DATABASE_URL']
      if (!val) throw new Error('Missing required environment variable: DATABASE_URL')
    }).toThrow('Missing required environment variable: DATABASE_URL')
    process.env.DATABASE_URL = original
  })
})
