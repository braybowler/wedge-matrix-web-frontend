import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import type { WedgeMatrix } from '@/types/matrix'

vi.mock('@/composables/axios/axios.ts', () => {
  const putMock = vi.fn()
  return {
    useAxios: () => ({
      put: putMock,
      get: vi.fn(),
      post: vi.fn(),
      del: vi.fn(),
    }),
    __putMock: putMock,
  }
})

let putMock: ReturnType<typeof vi.fn>

beforeEach(async () => {
  setActivePinia(createPinia())
  const mod = await import('@/composables/axios/axios.ts')
  putMock = (mod as unknown as { __putMock: ReturnType<typeof vi.fn> }).__putMock
  putMock.mockReset()
})

const buildMatrix = (overrides: Partial<WedgeMatrix> = {}): WedgeMatrix => ({
  id: 10,
  user_id: 1,
  label: null,
  number_of_rows: 4,
  number_of_columns: 3,
  column_headers: ['100%', '75%', '50%'],
  selected_row_display_option: 'Total',
  yardage_values: [
    [
      { carry_value: 100, total_value: 110 },
      { carry_value: 80, total_value: 90 },
      { carry_value: 60, total_value: 70 },
    ],
  ],
  ...overrides,
})

describe('useMatrixConfigurationStore', () => {
  describe('initializeMatrixValues', () => {
    it('populates all store values from a WedgeMatrix object', () => {
      const store = useMatrixConfigurationStore()
      const matrix = buildMatrix()

      store.initializeMatrixValues(matrix)

      expect(store.matrixColumns).toBe(3)
      expect(store.matrixColumnHeaders).toEqual(['100%', '75%', '50%'])
      expect(store.selectedRowDisplayOption).toBe('Total')
      expect(store.yardageValues).toEqual(matrix.yardage_values)
    })

    it('reads club_labels into selectedClubs', () => {
      const store = useMatrixConfigurationStore()
      const matrix = buildMatrix({ club_labels: ['LW', 'AW', 'PW'] })

      store.initializeMatrixValues(matrix)

      expect(store.selectedClubs).toEqual(['LW', 'AW', 'PW'])
    })

    it('falls back to default clubs when club_labels is absent', () => {
      const store = useMatrixConfigurationStore()
      const matrix = buildMatrix()

      store.initializeMatrixValues(matrix)

      expect(store.selectedClubs).toEqual(['LW', 'SW', 'GW', 'PW'])
    })
  })

  describe('setYardageValue', () => {
    it('sets a carry value and marks requiresSync', () => {
      const store = useMatrixConfigurationStore()

      store.setYardageValue('carry_value', '120', 0, 0)

      expect(store.yardageValues[0]![0]!.carry_value).toBe(120)
      expect(store.requiresSync).toBe(true)
    })

    it('sets a total value', () => {
      const store = useMatrixConfigurationStore()

      store.setYardageValue('total_value', '95', 0, 1)

      expect(store.yardageValues[0]![1]!.total_value).toBe(95)
    })

    it('sets cell to null for empty string', () => {
      const store = useMatrixConfigurationStore()
      store.initializeMatrixValues(buildMatrix())

      store.setYardageValue('carry_value', '', 0, 0)

      expect(store.yardageValues[0]![0]!.carry_value).toBeNull()
    })

    it('sets cell to null for invalid numbers', () => {
      const store = useMatrixConfigurationStore()

      store.setYardageValue('carry_value', '-5', 0, 0)
      expect(store.yardageValues[0]![0]!.carry_value).toBeNull()

      store.setYardageValue('carry_value', '1000', 0, 0)
      expect(store.yardageValues[0]![0]!.carry_value).toBeNull()

      store.setYardageValue('carry_value', 'abc', 0, 0)
      expect(store.yardageValues[0]![0]!.carry_value).toBeNull()
    })

    it('does nothing for out-of-bounds indices', () => {
      const store = useMatrixConfigurationStore()
      const before = JSON.stringify(store.yardageValues)

      store.setYardageValue('carry_value', '100', 99, 99)

      expect(JSON.stringify(store.yardageValues)).toBe(before)
    })
  })

  describe('clearYardageValues', () => {
    it('resets all cells to null and marks requiresSync', () => {
      const store = useMatrixConfigurationStore()
      store.initializeMatrixValues(buildMatrix())

      store.clearYardageValues()

      for (const row of store.yardageValues) {
        for (const cell of row) {
          expect(cell.carry_value).toBeNull()
          expect(cell.total_value).toBeNull()
        }
      }
      expect(store.requiresSync).toBe(true)
    })
  })

  describe('setMatrixColumnHeader', () => {
    it('updates the header at the given index and marks requiresSync', () => {
      const store = useMatrixConfigurationStore()

      store.setMatrixColumnHeader('Full', 0)

      expect(store.matrixColumnHeaders[0]).toBe('Full')
      expect(store.requiresSync).toBe(true)
    })
  })

  describe('setNumberOfMatrixColumns', () => {
    it('updates column count and marks requiresSync', () => {
      const store = useMatrixConfigurationStore()

      store.setNumberOfMatrixColumns(2)

      expect(store.matrixColumns).toBe(2)
      expect(store.requiresSync).toBe(true)
    })
  })

  describe('setSelectedRowDisplayOption', () => {
    it('updates the display option and marks requiresSync', () => {
      const store = useMatrixConfigurationStore()

      store.setSelectedRowDisplayOption('Both')

      expect(store.selectedRowDisplayOption).toBe('Both')
      expect(store.requiresSync).toBe(true)
    })
  })

  describe('setSelectedClubs', () => {
    it('updates selectedClubs, sets requiresSync, and resizes yardageValues', () => {
      const store = useMatrixConfigurationStore()

      store.setSelectedClubs(['LW', 'SW'])

      expect(store.selectedClubs).toEqual(['LW', 'SW'])
      expect(store.requiresSync).toBe(true)
      expect(store.yardageValues).toHaveLength(2)
    })

    it('preserves existing row data when reordering or adding clubs', () => {
      const store = useMatrixConfigurationStore()
      store.initializeMatrixValues(
        buildMatrix({
          club_labels: ['LW', 'SW'],
          yardage_values: [
            [
              { carry_value: 100, total_value: 110 },
              { carry_value: 80, total_value: 90 },
              { carry_value: 60, total_value: 70 },
            ],
            [
              { carry_value: 50, total_value: 55 },
              { carry_value: 40, total_value: 45 },
              { carry_value: 30, total_value: 35 },
            ],
          ],
        }),
      )

      store.setSelectedClubs(['AW', 'SW', 'LW'])

      expect(store.selectedClubs).toEqual(['AW', 'SW', 'LW'])
      expect(store.yardageValues).toHaveLength(3)
      // AW is new — empty row
      expect(store.yardageValues[0]!.every((c) => c.carry_value === null)).toBe(true)
      // SW preserved
      expect(store.yardageValues[1]![0]!.carry_value).toBe(50)
      // LW preserved
      expect(store.yardageValues[2]![0]!.carry_value).toBe(100)
    })
  })

  describe('synchronizeValues', () => {
    it('calls PUT and clears requiresSync and syncError on success', async () => {
      putMock.mockResolvedValue({ data: {}, status: 200 })
      const store = useMatrixConfigurationStore()
      store.initializeMatrixValues(buildMatrix())
      store.requiresSync = true

      await store.synchronizeValues()

      expect(putMock).toHaveBeenCalledWith('/wedge-matrix/10', expect.any(Object))
      expect(store.requiresSync).toBe(false)
      expect(store.syncError).toBeNull()
    })

    it('includes club_labels in the PUT body', async () => {
      putMock.mockResolvedValue({ data: {}, status: 200 })
      const store = useMatrixConfigurationStore()
      store.initializeMatrixValues(buildMatrix({ club_labels: ['LW', 'AW'] }))
      store.requiresSync = true

      await store.synchronizeValues()

      expect(putMock).toHaveBeenCalledWith(
        '/wedge-matrix/10',
        expect.objectContaining({ club_labels: ['LW', 'AW'] }),
      )
    })

    it('keeps requiresSync true and sets syncError when PUT returns an error', async () => {
      putMock.mockResolvedValue({ error: 'Server error', status: 500 })
      const store = useMatrixConfigurationStore()
      store.initializeMatrixValues(buildMatrix())
      store.requiresSync = true

      await store.synchronizeValues()

      expect(store.requiresSync).toBe(true)
      expect(store.syncError).toBe('Server error')
    })

    it('clears syncError on next successful sync', async () => {
      putMock.mockResolvedValue({ error: 'Server error', status: 500 })
      const store = useMatrixConfigurationStore()
      store.initializeMatrixValues(buildMatrix())
      store.requiresSync = true

      await store.synchronizeValues()
      expect(store.syncError).toBe('Server error')

      putMock.mockResolvedValue({ data: {}, status: 200 })
      await store.synchronizeValues()

      expect(store.syncError).toBeNull()
      expect(store.requiresSync).toBe(false)
    })

    it('does nothing when requiresSync is false', async () => {
      const store = useMatrixConfigurationStore()
      store.requiresSync = false

      await store.synchronizeValues()

      expect(putMock).not.toHaveBeenCalled()
    })

    it('deduplicates concurrent calls', async () => {
      let resolveRequest!: (value: { data: object; status: number }) => void
      putMock.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveRequest = resolve
          }),
      )
      const store = useMatrixConfigurationStore()
      store.initializeMatrixValues(buildMatrix())
      store.requiresSync = true

      const first = store.synchronizeValues()
      const second = store.synchronizeValues()

      resolveRequest({ data: {}, status: 200 })
      await first
      await second

      expect(putMock).toHaveBeenCalledTimes(1)
    })
  })
})
