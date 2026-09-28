/**
 * Phase 1 Acceptance — Validation / Error Framework
 * Checklist items: F-a through F-g
 */

import { describe, it, expect } from '@jest/globals'
import {
  AppError, ErrorType,
  validationError, notFound, conflict,
  unauthorized, forbidden, internalError, businessRuleViolation,
} from '../../src/shared/errors.js'

describe('Error categories', () => {
  it('VALIDATION_ERROR maps to HTTP 400', () => {
    const err = validationError('Bad input', [{ field: 'email' }])
    expect(err).toBeInstanceOf(AppError)
    expect(err.type).toBe(ErrorType.VALIDATION_ERROR)
    expect(err.httpStatus).toBe(400)
    expect(err.details).toEqual([{ field: 'email' }])
  })

  it('NOT_FOUND maps to HTTP 404', () => {
    const err = notFound('Order', 'PP-26-0001')
    expect(err.type).toBe(ErrorType.NOT_FOUND)
    expect(err.httpStatus).toBe(404)
    expect(err.message).toMatch('PP-26-0001')
  })

  it('CONFLICT maps to HTTP 409', () => {
    const err = conflict('Already exists')
    expect(err.type).toBe(ErrorType.CONFLICT)
    expect(err.httpStatus).toBe(409)
  })

  it('UNAUTHORIZED maps to HTTP 401', () => {
    const err = unauthorized()
    expect(err.type).toBe(ErrorType.UNAUTHORIZED)
    expect(err.httpStatus).toBe(401)
  })

  it('FORBIDDEN maps to HTTP 403', () => {
    const err = forbidden()
    expect(err.type).toBe(ErrorType.FORBIDDEN)
    expect(err.httpStatus).toBe(403)
  })

  it('INTERNAL_ERROR maps to HTTP 500', () => {
    const err = internalError()
    expect(err.type).toBe(ErrorType.INTERNAL_ERROR)
    expect(err.httpStatus).toBe(500)
  })

  it('BUSINESS_RULE_VIOLATION maps to HTTP 422', () => {
    const err = businessRuleViolation('GATE_01', 'Program catalog required')
    expect(err.type).toBe(ErrorType.BUSINESS_RULE_VIOLATION)
    expect(err.httpStatus).toBe(422)
    expect(err.details).toMatchObject({ rule: 'GATE_01' })
  })

  it('toJSON returns structured body', () => {
    const err = notFound('Invoice', 'INV-PP-26-0001')
    const body = err.toJSON()
    expect(body).toMatchObject({ error: { type: 'NOT_FOUND', message: expect.any(String) } })
  })

  it('all 7 error types are defined', () => {
    const types = Object.values(ErrorType)
    expect(types).toContain('VALIDATION_ERROR')
    expect(types).toContain('NOT_FOUND')
    expect(types).toContain('CONFLICT')
    expect(types).toContain('UNAUTHORIZED')
    expect(types).toContain('FORBIDDEN')
    expect(types).toContain('INTERNAL_ERROR')
    expect(types).toContain('BUSINESS_RULE_VIOLATION')
    expect(types).toHaveLength(7)
  })
})
