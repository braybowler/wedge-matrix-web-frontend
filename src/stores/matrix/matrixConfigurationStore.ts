import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  AllowableMatrixColumnNumber,
  ClubLabel,
  RowDisplayOption,
  WedgeMatrix,
  YardageCell,
  YardageGrid,
} from '@/types/matrix'
import { useAxios } from '@/composables/axios/axios.ts'

const DEFAULT_CLUBS: ClubLabel[] = ['LW', 'SW', 'GW', 'PW']

function createEmptyRow(columns: number): YardageCell[] {
  return Array.from({ length: columns }, () => ({ carry_value: null, total_value: null }))
}

function createEmptyGrid(rows: number, columns: number): YardageGrid {
  return Array.from({ length: rows }, () => createEmptyRow(columns))
}

export const useMatrixConfigurationStore = defineStore('matrixConfiguration', () => {
  const { put } = useAxios()
  const requiresSync = ref(false)
  const syncError = ref<string | null>(null)
  let isSyncing = false
  const selectedMatrixId = ref<number | null>(null)
  const matrixColumns = ref<AllowableMatrixColumnNumber>(4)
  const matrixColumnHeaders = ref<Array<string>>(['', '', '', ''])
  const selectedRowDisplayOption = ref<RowDisplayOption>('Carry')
  const selectedClubs = ref<ClubLabel[]>([...DEFAULT_CLUBS])
  const yardageValues = ref<YardageGrid>(createEmptyGrid(DEFAULT_CLUBS.length, 4))

  function initializeMatrixValues(initialMatrixValues: WedgeMatrix) {
    selectedMatrixId.value = initialMatrixValues.id
    matrixColumns.value = initialMatrixValues.number_of_columns
    selectedRowDisplayOption.value = initialMatrixValues.selected_row_display_option

    if (initialMatrixValues.club_labels && initialMatrixValues.club_labels.length > 0) {
      selectedClubs.value = initialMatrixValues.club_labels
    } else {
      selectedClubs.value = [...DEFAULT_CLUBS]
    }

    if (initialMatrixValues.column_headers) {
      matrixColumnHeaders.value = initialMatrixValues.column_headers
    }

    if (initialMatrixValues.yardage_values) {
      yardageValues.value = initialMatrixValues.yardage_values
    }
  }

  async function synchronizeValues() {
    if (!requiresSync.value || isSyncing) return

    isSyncing = true
    syncError.value = null
    try {
      const response = await put('/wedge-matrix/' + selectedMatrixId.value, {
        number_of_columns: matrixColumns.value,
        column_headers: matrixColumnHeaders.value,
        selected_row_display_option: selectedRowDisplayOption.value,
        yardage_values: yardageValues.value,
        club_labels: selectedClubs.value,
      })

      if (response.error) {
        syncError.value = response.error
      } else {
        requiresSync.value = false
      }
    } catch {
      syncError.value = 'An unexpected error occurred while saving. Please try again.'
    } finally {
      isSyncing = false
    }
  }

  function setYardageValue(
    field: 'carry_value' | 'total_value',
    rawVal: string,
    clubIndex: number,
    columnIndex: number,
  ) {
    requiresSync.value = true

    const cell = yardageValues.value[clubIndex]?.[columnIndex]
    if (!cell) return

    const trimmed = rawVal.trim()
    if (trimmed === '') {
      cell[field] = null
      return
    }

    const parsed = Number(trimmed)
    const isValid = Number.isFinite(parsed) && parsed > 0 && parsed < 1000

    cell[field] = isValid ? parsed : null
  }

  function clearYardageValues() {
    requiresSync.value = true
    for (const row of yardageValues.value) {
      for (const cell of row) {
        cell.carry_value = null
        cell.total_value = null
      }
    }
  }

  function setMatrixColumnHeader(newVal: string, index: number) {
    requiresSync.value = true
    matrixColumnHeaders.value[index] = newVal
  }

  function setNumberOfMatrixColumns(newVal: AllowableMatrixColumnNumber) {
    requiresSync.value = true
    matrixColumns.value = newVal
  }

  function setSelectedRowDisplayOption(newVal: RowDisplayOption) {
    requiresSync.value = true
    selectedRowDisplayOption.value = newVal
  }

  function setSelectedClubs(clubs: ClubLabel[]) {
    requiresSync.value = true

    const clubRowMap = new Map<ClubLabel, YardageCell[]>()
    selectedClubs.value.forEach((club, index) => {
      const row = yardageValues.value[index]
      if (row) clubRowMap.set(club, row)
    })

    const cols = matrixColumns.value
    yardageValues.value = clubs.map((club) => clubRowMap.get(club) ?? createEmptyRow(cols))
    selectedClubs.value = clubs
  }

  return {
    yardageValues,
    matrixColumns,
    matrixColumnHeaders,
    selectedRowDisplayOption,
    requiresSync,
    syncError,
    initializeMatrixValues,
    setYardageValue,
    clearYardageValues,
    setMatrixColumnHeader,
    selectedClubs,
    setNumberOfMatrixColumns,
    setSelectedClubs,
    setSelectedRowDisplayOption,
    synchronizeValues,
  }
})
