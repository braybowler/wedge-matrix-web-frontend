import type { YardageGrid } from '@/types/matrix'

export function deepCopyYardageGrid(grid: YardageGrid): YardageGrid {
  return grid.map((row) => row.map((cell) => ({ ...cell })))
}
