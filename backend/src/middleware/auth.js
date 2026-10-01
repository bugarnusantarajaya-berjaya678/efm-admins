/**
 * JWT Authentication Middleware — Phase 3.
 *
 * Verifies Supabase-issued JWTs using SUPABASE_JWT_SECRET.
 * Attaches req.user = { id, email, role } on success.
 *
 * In test environment (NODE_ENV=test), JWT verification is bypassed and a
 * synthetic admin user is attached so all existing and new integration tests
 * continue to pass without needing real Supabase credentials.
 *
 * Role extraction: Supabase stores custom roles in app_metadata.role.
 * Supported roles: Admin | Finance | Operations | Coach | PP | B2B | Event
 */

import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

const TEST_USER = {
  id: 'test-user-00000000-0000-0000-0000-000000000001',
  email: 'test-admin@efm.internal',
  role: 'Admin',
}

/**
 * Require a valid JWT. Returns 401 if missing/invalid.
 * Attaches req.user for downstream handlers.
 */
export function requireAuth(req, res, next) {
  if (env.isTest) {
    // Test bypass — allow X-Test-Role header to override role in tests
    const testRole = req.headers['x-test-role']
    req.user = testRole
      ? { ...TEST_USER, role: testRole }
      : { ...TEST_USER }
    return next()
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: { type: 'UNAUTHORIZED', message: 'Authentication required' },
    })
  }

  if (!env.SUPABASE_JWT_SECRET) {
    console.error('[auth] SUPABASE_JWT_SECRET is not configured')
    return res.status(500).json({
      error: { type: 'INTERNAL_ERROR', message: 'Auth not configured' },
    })
  }

  const token = authHeader.slice(7)
  try {
    const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET, {
      algorithms: ['HS256'],
      audience: 'authenticated',
    })
    req.user = {
      id: decoded.sub,
      email: decoded.email ?? null,
      role: decoded.app_metadata?.role ?? 'PP',
    }
    next()
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError'
    return res.status(401).json({
      error: {
        type: 'UNAUTHORIZED',
        message: isExpired ? 'Token expired' : 'Invalid token',
      },
    })
  }
}

/**
 * Require one of the given roles. Must follow requireAuth in middleware chain.
 * @param {...string} roles - allowed roles
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: { type: 'UNAUTHORIZED', message: 'Authentication required' },
      })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          type: 'FORBIDDEN',
          message: `Requires one of: ${roles.join(', ')}`,
        },
      })
    }
    next()
  }
}
