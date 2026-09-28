/**
 * Agreement Immutability Guard — DEC-05.
 *
 * An Agreement in 'issued' or 'signed' state is a contractual snapshot.
 * The Master Agreement Architecture (source hierarchy Level 2) forbids
 * any mutation of a signed Agreement.
 *
 * This guard must be called by every update path before applying any patch.
 */

import { conflict } from '../../shared/errors.js'

export const AGREEMENT_STATUS = Object.freeze({
  DRAFT: 'draft',
  ISSUED: 'issued',
  SIGNED: 'signed',
  VOIDED: 'voided',
})

const IMMUTABLE_STATUSES = new Set([AGREEMENT_STATUS.ISSUED, AGREEMENT_STATUS.SIGNED])

/**
 * Throws CONFLICT if the agreement is in an immutable state.
 * @param {object} agreement  - must have a `status` field
 * @param {string} [field]    - optional field name being changed (for message)
 */
export function assertAgreementMutable(agreement, field) {
  if (IMMUTABLE_STATUSES.has(agreement.status)) {
    const what = field ? `field "${field}"` : 'Agreement'
    throw conflict(
      `Cannot modify ${what}: Agreement ${agreement.id} is in '${agreement.status}' state and is immutable.`
    )
  }
}

/**
 * Returns true if the agreement may be modified, false otherwise.
 */
export function isAgreementMutable(agreement) {
  return !IMMUTABLE_STATUSES.has(agreement.status)
}
