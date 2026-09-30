/**
 * Authoritative ID Generator — EFM PP Phase 1 Foundation + Phase 2A Commercial Core.
 *
 * Formats (from Technical Build Specification v1.0):
 *   ORDER      PP-YY-xxxx
 *   INVOICE    INV-PP-YY-xxxx
 *   RECEIPT    RCP-PP-YY-xxxx
 *   AGREEMENT  AGR-PP-YY-xxxx
 *   HNS        HNA-PP-YY-xxxx
 *   ASSESSMENT SCR-YY-xxxx  (module-independent)
 *   ASSIGNMENT ASG-PP-YY-xxxx
 *   SESSION    SES-PP-YY-xxxx
 *   ATTENDANCE ATT-PP-YY-xxxx
 *   PIC        PIC-YY-xxxx
 *   LEAD_PP    LP-xxxx       (no year — permanent, never resets)
 *   LEAD_B2B   LB-xxxx
 *   LEAD_EVENT LE-xxxx
 *   CLIENT     KL-xxxx       (permanent, no year — like Lead IDs)
 *   PAYMENT     PAY-PP-YY-xxxx
 *   REFUND_PP   REF-PP-YY-xxxx
 *   PARTICIPANT PTR-PP-YY-xxxx
 *
 * Sequences are persisted in the id_sequences table.
 * nextId() uses a database transaction with row-level lock to guarantee uniqueness.
 */

import { withTransaction, query } from '../../db/index.js'

const DOCTYPE = Object.freeze({
  ORDER: 'ORDER',
  INVOICE: 'INVOICE',
  RECEIPT: 'RECEIPT',
  AGREEMENT: 'AGREEMENT',
  HNS: 'HNS',
  ASSESSMENT: 'ASSESSMENT',
  ASSIGNMENT: 'ASSIGNMENT',
  SESSION: 'SESSION',
  ATTENDANCE: 'ATTENDANCE',
  PIC: 'PIC',
  LEAD_PP: 'LEAD_PP',
  LEAD_B2B: 'LEAD_B2B',
  LEAD_EVENT: 'LEAD_EVENT',
  // Phase 2A Commercial Core
  CLIENT: 'CLIENT',
  PAYMENT: 'PAYMENT',
  REFUND_PP: 'REFUND_PP',
  // Phase 2B Participants & Assessments
  PARTICIPANT: 'PARTICIPANT',
})

const MODULE = Object.freeze({
  PP: 'PP',
  B2B: 'B2B',
  EVENT: 'EVENT',
  GLOBAL: 'GLOBAL',
})

// Lead and Client IDs: permanent, no year reset
const LEAD_TYPES = new Set([DOCTYPE.LEAD_PP, DOCTYPE.LEAD_B2B, DOCTYPE.LEAD_EVENT, DOCTYPE.CLIENT])

function pad(n, len = 4) {
  return String(n).padStart(len, '0')
}

function formatId(docType, module, year, seq) {
  const yy = String(year).slice(-2)
  switch (docType) {
    case DOCTYPE.ORDER:      return `${module}-${yy}-${pad(seq)}`
    case DOCTYPE.INVOICE:    return `INV-${module}-${yy}-${pad(seq)}`
    case DOCTYPE.RECEIPT:    return `RCP-${module}-${yy}-${pad(seq)}`
    case DOCTYPE.AGREEMENT:  return `AGR-${module}-${yy}-${pad(seq)}`
    case DOCTYPE.HNS:        return `HNA-${module}-${yy}-${pad(seq)}`
    case DOCTYPE.ASSESSMENT: return `SCR-${yy}-${pad(seq)}`
    case DOCTYPE.ASSIGNMENT: return `ASG-${module}-${yy}-${pad(seq)}`
    case DOCTYPE.SESSION:    return `SES-${module}-${yy}-${pad(seq)}`
    case DOCTYPE.ATTENDANCE: return `ATT-${module}-${yy}-${pad(seq)}`
    case DOCTYPE.PIC:        return `PIC-${yy}-${pad(seq)}`
    case DOCTYPE.LEAD_PP:    return `LP-${pad(seq)}`
    case DOCTYPE.LEAD_B2B:   return `LB-${pad(seq)}`
    case DOCTYPE.LEAD_EVENT: return `LE-${pad(seq)}`
    case DOCTYPE.CLIENT:     return `KL-${pad(seq)}`
    case DOCTYPE.PAYMENT:     return `PAY-${module}-${yy}-${pad(seq)}`
    case DOCTYPE.REFUND_PP:   return `REF-${module}-${yy}-${pad(seq)}`
    case DOCTYPE.PARTICIPANT: return `PTR-${module}-${yy}-${pad(seq)}`
    default: throw new Error(`Unknown docType: ${docType}`)
  }
}

/**
 * Generate the next ID for a document type/module combination.
 * Uses SELECT ... FOR UPDATE to prevent concurrent duplicate generation.
 *
 * @param {string} docType  - one of DOCTYPE values
 * @param {string} module   - one of MODULE values
 * @param {object} [options]
 * @param {pg.PoolClient} [options.client]  - existing transaction client
 * @param {number} [options.year]           - override year (for testing)
 */
// Doc types whose IDs are module-independent — always use GLOBAL bucket
// regardless of what the caller passes, preventing duplicate IDs across modules.
const GLOBAL_TYPES = new Set([DOCTYPE.ASSESSMENT, DOCTYPE.PIC])

export async function nextId(docType, module, options = {}) {
  if (!DOCTYPE[docType]) throw new Error(`Invalid docType: ${docType}`)
  if (!MODULE[module]) throw new Error(`Invalid module: ${module}`)

  // Normalize module-independent types to GLOBAL to guarantee uniqueness
  const effectiveModule = GLOBAL_TYPES.has(docType) ? MODULE.GLOBAL : module

  const isLead = LEAD_TYPES.has(docType)
  // Leads use year=0 as a permanent bucket (no year resets)
  const year = isLead ? 0 : (options.year ?? new Date().getFullYear())

  const execute = async (client) => {
    // Upsert the sequence row and increment atomically
    const { rows } = await client.query(
      `INSERT INTO id_sequences (doc_type, module, year, last_seq)
         VALUES ($1, $2, $3, 1)
       ON CONFLICT (doc_type, module, year)
       DO UPDATE SET
         last_seq   = id_sequences.last_seq + 1,
         updated_at = NOW()
       RETURNING last_seq`,
      [docType, effectiveModule, year]
    )
    const seq = rows[0].last_seq
    return formatId(docType, effectiveModule, year, seq)
  }

  if (options.client) {
    return execute(options.client)
  }
  return withTransaction(execute)
}

/**
 * Preview the NEXT id that would be generated without incrementing.
 * Safe for display; not guaranteed — another request may claim it first.
 */
export async function peekNextId(docType, module, options = {}) {
  const effectiveModule = GLOBAL_TYPES.has(docType) ? MODULE.GLOBAL : module
  const isLead = LEAD_TYPES.has(docType)
  const year = isLead ? 0 : (options.year ?? new Date().getFullYear())
  const { rows } = await query(
    `SELECT last_seq FROM id_sequences WHERE doc_type=$1 AND module=$2 AND year=$3`,
    [docType, effectiveModule, year]
  )
  const nextSeq = rows.length ? rows[0].last_seq + 1 : 1
  return formatId(docType, effectiveModule, year, nextSeq)
}

export { DOCTYPE, MODULE }
