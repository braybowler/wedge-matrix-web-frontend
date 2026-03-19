import { describe, it, expect } from 'vitest'
import { deepCopyYardageGrid } from '@/utils/deepCopyYardageGrid.ts'
import type { YardageGrid } from '@/types/matrix'

describe('deepCopyYardageGrid', () => {
  it('returns a new grid with the same values', () => {
    const grid: YardageGrid = [
      [
        { carry_value: 80, total_value: 90 },
        { carry_value: 60, total_value: 70 },
      ],
      [
        { carry_value: 40, total_value: 50 },
        { carry_value: 30, total_value: 40 },
      ],
    ]

    const copy = deepCopyYardageGrid(grid)

    expect(copy).toEqual(grid)
  })

  it('does not share row array references with the original', () => {
    const grid: YardageGrid = [[{ carry_value: 10, total_value: 20 }]]

    const copy = deepCopyYardageGrid(grid)

    expect(copy[0]).not.toBe(grid[0])
  })

  it('does not share cell object references with the original', () => {
    const grid: YardageGrid = [[{ carry_value: 10, total_value: 20 }]]

    const copy = deepCopyYardageGrid(grid)

    expect(copy[0]![0]).not.toBe(grid[0]![0])
  })

  it('mutations to the copy do not affect the original', () => {
    const grid: YardageGrid = [[{ carry_value: 10, total_value: 20 }]]

    const copy = deepCopyYardageGrid(grid)
    copy[0]![0]!.carry_value = 999

    expect(grid[0]![0]!.carry_value).toBe(10)
  })

  it('handles empty grid', () => {
    const grid: YardageGrid = []

    const copy = deepCopyYardageGrid(grid)

    expect(copy).toEqual([])
    expect(copy).not.toBe(grid)
  })

  it('handles null values in cells', () => {
    const grid: YardageGrid = [[{ carry_value: null, total_value: null }]]

    const copy = deepCopyYardageGrid(grid)

    expect(copy[0]![0]!.carry_value).toBeNull()
    expect(copy[0]![0]!.total_value).toBeNull()
  })
})
