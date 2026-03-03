import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import type { WedgeMatrix } from '@/types/matrix'

vi.mock('@/composables/axios/axios.ts', () => {
  const putMock = vi.fn()
  const postMock = vi.fn()
  const delMock = vi.fn()
  return {
    useAxios: () => ({
      put: putMock,
      get: vi.fn(),
      post: postMock,
      del: delMock,
      getBlob: vi.fn(),
    }),
    __putMock: putMock,
    __postMock: postMock,
    __delMock: delMock,
  }
})

type MockMap = {
  __putMock: ReturnType<typeof vi.fn>
  __postMock: ReturnType<typeof vi.fn>
  __delMock: ReturnType<typeof vi.fn>
}

let putMock: ReturnType<typeof vi.fn>
let postMock: ReturnType<typeof vi.fn>
let delMock: ReturnType<typeof vi.fn>

beforeEach(async () => {
  setActivePinia(createPinia())
  const mod = await import('@/composables/axios/axios.ts')
  const mocks = mod as unknown as MockMap
  putMock = mocks.__putMock
  postMock = mocks.__postMock
  delMock = mocks.__delMock
  putMock.mockReset()
  postMock.mockReset()
  delMock.mockReset()
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

      store.initializeMatrixValues([matrix])

      expect(store.matrixColumns).toBe(3)
      expect(store.matrixColumnHeaders).toEqual(['100%', '75%', '50%'])
      expect(store.selectedRowDisplayOption).toBe('Total')
      expect(store.yardageValues).toEqual(matrix.yardage_values)
    })

    it('reads club_labels into selectedClubs', () => {
      const store = useMatrixConfigurationStore()
      const matrix = buildMatrix({ club_labels: ['LW', 'AW', 'PW'] })

      store.initializeMatrixValues([matrix])

      expect(store.selectedClubs).toEqual(['LW', 'AW', 'PW'])
    })

    it('falls back to default clubs when club_labels is absent', () => {
      const store = useMatrixConfigurationStore()
      const matrix = buildMatrix()

      store.initializeMatrixValues([matrix])

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
      store.initializeMatrixValues([buildMatrix()])

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
      store.initializeMatrixValues([buildMatrix()])

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
      store.initializeMatrixValues([
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
      ])

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
      store.initializeMatrixValues([buildMatrix()])
      store.requiresSync = true

      await store.synchronizeValues()

      expect(putMock).toHaveBeenCalledWith('/wedge-matrix/10', expect.any(Object))
      expect(store.requiresSync).toBe(false)
      expect(store.syncError).toBeNull()
    })

    it('includes club_labels in the PUT body', async () => {
      putMock.mockResolvedValue({ data: {}, status: 200 })
      const store = useMatrixConfigurationStore()
      store.initializeMatrixValues([buildMatrix({ club_labels: ['LW', 'AW'] })])
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
      store.initializeMatrixValues([buildMatrix()])
      store.requiresSync = true

      await store.synchronizeValues()

      expect(store.requiresSync).toBe(true)
      expect(store.syncError).toBe('Server error')
    })

    it('clears syncError on next successful sync', async () => {
      putMock.mockResolvedValue({ error: 'Server error', status: 500 })
      const store = useMatrixConfigurationStore()
      store.initializeMatrixValues([buildMatrix()])
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
      store.initializeMatrixValues([buildMatrix()])
      store.requiresSync = true

      const first = store.synchronizeValues()
      const second = store.synchronizeValues()

      resolveRequest({ data: {}, status: 200 })
      await first
      await second

      expect(putMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('initializeMatrixValues with matrixId', () => {
    it('loads the matrix matching the given matrixId', () => {
      const store = useMatrixConfigurationStore()
      const matrix1 = buildMatrix({ id: 10, label: 'First' })
      const matrix2 = buildMatrix({ id: 20, label: 'Second', number_of_columns: 2 })

      store.initializeMatrixValues([matrix1, matrix2], 20)

      expect(store.selectedMatrixId).toBe(20)
      expect(store.matrixLabel).toBe('Second')
      expect(store.matrixColumns).toBe(2)
    })

    it('sets matrixLabel from the matrix', () => {
      const store = useMatrixConfigurationStore()
      const matrix = buildMatrix({ label: 'My Wedges' })

      store.initializeMatrixValues([matrix])

      expect(store.matrixLabel).toBe('My Wedges')
    })

    it('sets matrixLabel to null when label is null', () => {
      const store = useMatrixConfigurationStore()
      const matrix = buildMatrix({ label: null })

      store.initializeMatrixValues([matrix])

      expect(store.matrixLabel).toBeNull()
    })
  })

  describe('switchMatrix', () => {
    it('syncs current values then loads the new matrix', async () => {
      putMock.mockResolvedValue({ data: {}, status: 200 })
      const store = useMatrixConfigurationStore()
      const matrix1 = buildMatrix({ id: 10, label: 'First' })
      const matrix2 = buildMatrix({ id: 20, label: 'Second', number_of_columns: 2 })
      store.initializeMatrixValues([matrix1, matrix2])
      store.requiresSync = true

      await store.switchMatrix(20, [matrix1, matrix2])

      expect(putMock).toHaveBeenCalled()
      expect(store.selectedMatrixId).toBe(20)
      expect(store.matrixLabel).toBe('Second')
    })
  })

  describe('createMatrix', () => {
    it('calls POST /wedge-matrix and returns the new matrix', async () => {
      const newMatrix = buildMatrix({ id: 99, label: 'Matrix 2' })
      postMock.mockResolvedValue({ data: { data: newMatrix }, status: 201 })
      const store = useMatrixConfigurationStore()

      const result = await store.createMatrix('Matrix 2')

      expect(postMock).toHaveBeenCalledWith('/wedge-matrix', { label: 'Matrix 2' })
      expect(result).toEqual(newMatrix)
    })

    it('returns null and sets syncError on failure', async () => {
      postMock.mockResolvedValue({ error: 'Server error' })
      const store = useMatrixConfigurationStore()

      const result = await store.createMatrix('Matrix 2')

      expect(result).toBeNull()
      expect(store.syncError).toBe('Server error')
    })
  })

  describe('deleteMatrix', () => {
    it('calls DELETE /wedge-matrix/{id} and returns true on success', async () => {
      delMock.mockResolvedValue({ data: {}, status: 200 })
      const store = useMatrixConfigurationStore()

      const result = await store.deleteMatrix(10)

      expect(delMock).toHaveBeenCalledWith('/wedge-matrix/10')
      expect(result).toBe(true)
    })

    it('returns false and sets syncError on failure', async () => {
      delMock.mockResolvedValue({ error: 'Not found' })
      const store = useMatrixConfigurationStore()

      const result = await store.deleteMatrix(10)

      expect(result).toBe(false)
      expect(store.syncError).toBe('Not found')
    })
  })

  describe('renameMatrix', () => {
    it('calls PUT with label in payload and updates matrixLabel', async () => {
      putMock.mockResolvedValue({ data: {}, status: 200 })
      const store = useMatrixConfigurationStore()
      store.initializeMatrixValues([buildMatrix()])

      const result = await store.renameMatrix(10, 'New Name')

      expect(putMock).toHaveBeenCalledWith(
        '/wedge-matrix/10',
        expect.objectContaining({ label: 'New Name' }),
      )
      expect(result).toBe(true)
      expect(store.matrixLabel).toBe('New Name')
    })

    it('returns false and sets syncError on failure', async () => {
      putMock.mockResolvedValue({ error: 'Server error' })
      const store = useMatrixConfigurationStore()
      store.initializeMatrixValues([buildMatrix()])

      const result = await store.renameMatrix(10, 'New Name')

      expect(result).toBe(false)
      expect(store.syncError).toBe('Server error')
    })
  })

  describe('setSwingFeelSystem', () => {
    it('updates swingFeelSystem ref and marks requiresSync', () => {
      const store = useMatrixConfigurationStore()
      store.initializeMatrixValues([buildMatrix()])
      expect(store.swingFeelSystem).toBe('Percentage')

      store.setSwingFeelSystem('Clock')

      expect(store.swingFeelSystem).toBe('Clock')
      expect(store.requiresSync).toBe(true)
    })

    it('restores previously saved headers when switching back', () => {
      const store = useMatrixConfigurationStore()
      store.initializeMatrixValues([buildMatrix({ column_headers: ['100%', '75%', '50%'] })])

      store.setSwingFeelSystem('Clock')
      store.setMatrixColumnHeader('8:00', 0)
      store.setMatrixColumnHeader('10:00', 1)

      store.setSwingFeelSystem('Percentage')
      expect(store.matrixColumnHeaders).toEqual(['100%', '75%', '50%'])

      store.setSwingFeelSystem('Clock')
      expect(store.matrixColumnHeaders).toEqual(['8:00', '10:00', '11:00'])
    })

    it('shows default clock headers when switching to Clock with no prior selections', () => {
      const store = useMatrixConfigurationStore()
      store.initializeMatrixValues([buildMatrix({ column_headers: ['100%', '75%', '50%'] })])

      store.setSwingFeelSystem('Clock')

      expect(store.matrixColumnHeaders).toEqual(['9:00', '10:00', '11:00'])
    })

    it('preserves partial clock headers when switching back to Clock', () => {
      const store = useMatrixConfigurationStore()
      store.initializeMatrixValues([buildMatrix({ column_headers: ['100%', '75%', '50%'] })])

      store.setSwingFeelSystem('Clock')
      store.setMatrixColumnHeader('11:00', 0)
      store.setMatrixColumnHeader('', 1)

      store.setSwingFeelSystem('Percentage')
      store.setSwingFeelSystem('Clock')

      expect(store.matrixColumnHeaders).toEqual(['11:00', '', '11:00'])
    })
  })

  describe('initializeMatrixValues swing feel system inference', () => {
    it('infers Clock system from loaded headers', () => {
      const store = useMatrixConfigurationStore()
      const matrix = buildMatrix({ column_headers: ['9:00', '10:00', '12:00'] })

      store.initializeMatrixValues([matrix])

      expect(store.swingFeelSystem).toBe('Clock')
    })

    it('infers Percentage system from loaded headers', () => {
      const store = useMatrixConfigurationStore()
      const matrix = buildMatrix({ column_headers: ['100%', '75%', '50%'] })

      store.initializeMatrixValues([matrix])

      expect(store.swingFeelSystem).toBe('Percentage')
    })

    it('defaults to Percentage when headers are empty strings', () => {
      const store = useMatrixConfigurationStore()
      const matrix = buildMatrix({ column_headers: ['', '', ''] })

      store.initializeMatrixValues([matrix])

      expect(store.swingFeelSystem).toBe('Percentage')
    })
  })
})
