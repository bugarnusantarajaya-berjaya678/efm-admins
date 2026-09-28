/**
 * Phase 1 Acceptance — Agreement Immutability Guard
 * Checklist: Phase Gate item "Agreement immutability guard is tested"
 * Authorization: DEC-05
 */

import { describe, it, expect } from '@jest/globals'
import {
  assertAgreementMutable,
  isAgreementMutable,
  AGREEMENT_STATUS,
} from '../../src/modules/agreement/agreement.guard.js'
import { AppError, ErrorType } from '../../src/shared/errors.js'

describe('Agreement immutability guard', () => {
  it('allows mutation of a draft Agreement', () => {
    const agr = { id: 'AGR-26-0001', status: AGREEMENT_STATUS.DRAFT }
    expect(() => assertAgreementMutable(agr)).not.toThrow()
    expect(isAgreementMutable(agr)).toBe(true)
  })

  it('BLOCKS mutation of an issued Agreement', () => {
    const agr = { id: 'AGR-26-0001', status: AGREEMENT_STATUS.ISSUED }
    expect(() => assertAgreementMutable(agr)).toThrow(AppError)
    expect(() => assertAgreementMutable(agr)).toThrow(/issued/)
    expect(isAgreementMutable(agr)).toBe(false)
  })

  it('BLOCKS mutation of a signed Agreement', () => {
    const agr = { id: 'AGR-26-0001', status: AGREEMENT_STATUS.SIGNED }
    expect(() => assertAgreementMutable(agr)).toThrow(AppError)
    expect(() => assertAgreementMutable(agr)).toThrow(/signed/)
    expect(isAgreementMutable(agr)).toBe(false)
  })

  it('allows voided Agreement to be checked (voided is not immutable per guard)', () => {
    const agr = { id: 'AGR-26-0001', status: AGREEMENT_STATUS.VOIDED }
    // Voided is not in IMMUTABLE_STATUSES — administrative operations may still apply
    expect(() => assertAgreementMutable(agr)).not.toThrow()
  })

  it('error type is CONFLICT', () => {
    const agr = { id: 'AGR-26-0001', status: AGREEMENT_STATUS.SIGNED }
    try {
      assertAgreementMutable(agr, 'status')
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect(err.type).toBe(ErrorType.CONFLICT)
      expect(err.message).toMatch('field "status"')
    }
  })

  it('all 4 Agreement statuses are defined', () => {
    expect(Object.values(AGREEMENT_STATUS)).toEqual(
      expect.arrayContaining(['draft', 'issued', 'signed', 'voided'])
    )
  })
})
