import { describe, it, expect } from 'vitest'
import { differenceClass } from '@/utils/differenceClass.ts'

describe('differenceClass', () => {
  it('returns empty string for null', () => {
    expect(differenceClass(null)).toBe('')
  })

  it('returns diff-good for 0', () => {
    expect(differenceClass(0)).toBe('diff-good')
  })

  it('returns diff-good for values up to 3', () => {
    expect(differenceClass(1)).toBe('diff-good')
    expect(differenceClass(2.5)).toBe('diff-good')
    expect(differenceClass(3)).toBe('diff-good')
  })

  it('returns diff-ok for values between 3 and 8', () => {
    expect(differenceClass(3.1)).toBe('diff-ok')
    expect(differenceClass(5)).toBe('diff-ok')
    expect(differenceClass(8)).toBe('diff-ok')
  })

  it('returns diff-poor for values above 8', () => {
    expect(differenceClass(8.1)).toBe('diff-poor')
    expect(differenceClass(10)).toBe('diff-poor')
    expect(differenceClass(100)).toBe('diff-poor')
  })

  it('handles negative values as diff-good', () => {
    expect(differenceClass(-1)).toBe('diff-good')
    expect(differenceClass(-5)).toBe('diff-good')
  })
})
