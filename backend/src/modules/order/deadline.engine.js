/**
 * Deadline Engine — PP Order Urgency Classification
 *
 * NORMAL: start_date is more than H_URGENT_THRESHOLD days away
 * URGENT: start_date is within H_URGENT_THRESHOLD days (or same-day, or past)
 *
 * H_URGENT_THRESHOLD defaults to 1 (H-1), configurable via env PP_URGENT_THRESHOLD_DAYS.
 * No auto-rejection: urgency is operational signal only.
 */

const URGENT_THRESHOLD_DAYS = parseInt(process.env.PP_URGENT_THRESHOLD_DAYS ?? '1', 10)

/**
 * Classify urgency for a given start date.
 * @param {Date|string|null} startDate
 * @param {Date} [referenceDate] - defaults to now (injectable for testing)
 * @returns {'NORMAL'|'URGENT'}
 */
export function classifyUrgency(startDate, referenceDate) {
  if (!startDate) return 'NORMAL'

  const start = startDate instanceof Date ? startDate : new Date(startDate)
  const ref = referenceDate ?? new Date()

  // Normalize to date-only (midnight UTC) for day-level comparison
  const startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  const refDay = Date.UTC(ref.getFullYear(), ref.getMonth(), ref.getDate())

  const diffDays = Math.floor((startDay - refDay) / (1000 * 60 * 60 * 24))

  // Same-day (diffDays === 0), past (diffDays < 0), or within threshold → URGENT
  if (diffDays <= URGENT_THRESHOLD_DAYS) return 'URGENT'
  return 'NORMAL'
}

/**
 * Return days until start date (negative = already started/passed).
 */
export function daysUntilStart(startDate, referenceDate) {
  if (!startDate) return null
  const start = startDate instanceof Date ? startDate : new Date(startDate)
  const ref = referenceDate ?? new Date()
  const startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  const refDay = Date.UTC(ref.getFullYear(), ref.getMonth(), ref.getDate())
  return Math.floor((startDay - refDay) / (1000 * 60 * 60 * 24))
}
