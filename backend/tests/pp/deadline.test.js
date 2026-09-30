/**
 * Phase 2A — Deadline Engine Unit Tests
 * Covers: NORMAL vs URGENT classification across H-10, H-3, H-1, same-day, past
 */
import { describe, it, expect } from '@jest/globals'
import { classifyUrgency, daysUntilStart } from '../../src/modules/order/deadline.engine.js'

function dateOffset(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

describe('Deadline Engine — Urgency Classification', () => {
  it('classifies H-10 (10 days ahead) as NORMAL', () => {
    expect(classifyUrgency(dateOffset(10))).toBe('NORMAL')
  })

  it('classifies H-5 (5 days ahead) as NORMAL', () => {
    expect(classifyUrgency(dateOffset(5))).toBe('NORMAL')
  })

  it('classifies H-2 (2 days ahead) as NORMAL (above default threshold of 1)', () => {
    expect(classifyUrgency(dateOffset(2))).toBe('NORMAL')
  })

  it('classifies H-1 (tomorrow) as URGENT', () => {
    expect(classifyUrgency(dateOffset(1))).toBe('URGENT')
  })

  it('classifies same-day as URGENT', () => {
    expect(classifyUrgency(new Date())).toBe('URGENT')
  })

  it('classifies past date as URGENT', () => {
    expect(classifyUrgency(dateOffset(-1))).toBe('URGENT')
  })

  it('classifies null start date as NORMAL', () => {
    expect(classifyUrgency(null)).toBe('NORMAL')
  })

  it('accepts string date format', () => {
    const future = dateOffset(10).toISOString().split('T')[0]
    expect(classifyUrgency(future)).toBe('NORMAL')
    const past = dateOffset(-1).toISOString().split('T')[0]
    expect(classifyUrgency(past)).toBe('URGENT')
  })

  it('respects injectable reference date', () => {
    const startDate = new Date('2026-01-15')
    // 10 days before the start — NORMAL
    const ref10Before = new Date('2026-01-05')
    expect(classifyUrgency(startDate, ref10Before)).toBe('NORMAL')
    // 1 day before the start — URGENT
    const ref1Before = new Date('2026-01-14')
    expect(classifyUrgency(startDate, ref1Before)).toBe('URGENT')
    // Same day — URGENT
    const refSameDay = new Date('2026-01-15')
    expect(classifyUrgency(startDate, refSameDay)).toBe('URGENT')
    // Past — URGENT
    const refPast = new Date('2026-01-20')
    expect(classifyUrgency(startDate, refPast)).toBe('URGENT')
  })
})

describe('Deadline Engine — Days Until Start', () => {
  it('returns null for no start date', () => {
    expect(daysUntilStart(null)).toBeNull()
  })

  it('returns positive days for future start', () => {
    expect(daysUntilStart(dateOffset(5))).toBe(5)
  })

  it('returns 0 for same-day start', () => {
    expect(daysUntilStart(new Date())).toBe(0)
  })

  it('returns negative days for past start', () => {
    expect(daysUntilStart(dateOffset(-3))).toBe(-3)
  })
})
