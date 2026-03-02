import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  CLOCK_OPTIONS,
  MAX_YARDAGE,
  type AllowableMatrixColumnNumber,
  type ClubLabel,
  type RowDisplayOption,
  type SwingFeelSystem,
  type WedgeMatrix,
  type YardageCell,
  type YardageGrid,
} from '@/types/matrix'
import { useAxios } from '@/composables/axios/axios.ts'
import { useUserStore } from '@/stores/user/userStore.ts'

const DEFAULT_CLUBS: ClubLabel[] = ['LW', 'SW', 'GW', 'PW']

function createEmptyRow(columns: number): YardageCell[] {
  return Array.from({ length: columns }, () => ({ carry_value: null, total_value: null }))
}

function createEmptyGrid(rows: number, columns: number): YardageGrid {
  return Array.from({ length: rows }, () => createEmptyRow(columns))
}

export const useMatrixConfigurationStore = defineStore('matrixConfiguration', () => {
  const { put, post, del, getBlob } = useAxios()
  const requiresSync = ref(false)
  const syncError = ref<string | null>(null)
  let isSyncing = false
  const selectedMatrixId = ref<number | null>(null)
  const matrixLabel = ref<string | null>(null)
  const matrixColumns = ref<AllowableMatrixColumnNumber>(4)
  const matrixColumnHeaders = ref<Array<string>>(['', '', '', ''])
  const selectedRowDisplayOption = ref<RowDisplayOption>('Carry')
  const swingFeelSystem = ref<SwingFeelSystem>('Percentage')
  const savedPercentageHeaders = ref<string[]>(['', '', '', ''])
  const savedClockHeaders = ref<string[]>(['', '', '', ''])
  const selectedClubs = ref<ClubLabel[]>([...DEFAULT_CLUBS])
  const yardageValues = ref<YardageGrid>(createEmptyGrid(DEFAULT_CLUBS.length, 4))

  function initializeMatrixValues(wedgeMatrices: WedgeMatrix[], matrixId?: number) {
    const matrix = matrixId ? wedgeMatrices.find((m) => m.id === matrixId) : wedgeMatrices[0]
    if (!matrix) return

    selectedMatrixId.value = matrix.id
    matrixLabel.value = matrix.label
    matrixColumns.value = matrix.number_of_columns ?? 4
    selectedRowDisplayOption.value = matrix.selected_row_display_option ?? 'Both'

    selectedClubs.value =
      matrix.club_labels && matrix.club_labels.length > 0
        ? [...matrix.club_labels]
        : [...DEFAULT_CLUBS]

    const cols = matrixColumns.value
    matrixColumnHeaders.value = matrix.column_headers
      ? [...matrix.column_headers]
      : Array.from({ length: cols }, () => '')

    const clockValues: readonly string[] = CLOCK_OPTIONS
    swingFeelSystem.value = matrixColumnHeaders.value.some((h) => clockValues.includes(h))
      ? 'Clock'
      : 'Percentage'

    const emptyHeaders = Array.from({ length: cols }, () => '')
    if (swingFeelSystem.value === 'Clock') {
      savedClockHeaders.value = [...matrixColumnHeaders.value]
      savedPercentageHeaders.value = emptyHeaders
    } else {
      savedPercentageHeaders.value = [...matrixColumnHeaders.value]
      savedClockHeaders.value = emptyHeaders
    }

    const clubs = selectedClubs.value
    yardageValues.value = matrix.yardage_values
      ? matrix.yardage_values.map((row) => row.map((cell) => ({ ...cell })))
      : createEmptyGrid(clubs.length, cols)
  }

  async function switchMatrix(matrixId: number, wedgeMatrices: WedgeMatrix[]) {
    await synchronizeValues()
    initializeMatrixValues(wedgeMatrices, matrixId)
    requiresSync.value = false
  }

  async function createMatrix(label: string): Promise<WedgeMatrix | null> {
    const response = await post<{ data: WedgeMatrix }>('/wedge-matrix', { label })
    if (response.error || !response.data) {
      syncError.value = response.error ?? 'Failed to create matrix'
      return null
    }
    return response.data.data
  }

  async function deleteMatrix(matrixId: number): Promise<boolean> {
    const response = await del('/wedge-matrix/' + matrixId)
    if (response.error) {
      syncError.value = response.error
      return false
    }
    return true
  }

  async function renameMatrix(matrixId: number, label: string): Promise<boolean> {
    const response = await put('/wedge-matrix/' + matrixId, {
      label,
      number_of_columns: matrixColumns.value,
      column_headers: matrixColumnHeaders.value,
      selected_row_display_option: selectedRowDisplayOption.value,
      yardage_values: yardageValues.value,
      club_labels: selectedClubs.value,
    })
    if (response.error) {
      syncError.value = response.error
      return false
    }
    matrixLabel.value = label
    requiresSync.value = false
    return true
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
        useUserStore().updateWedgeMatrix(selectedMatrixId.value!, {
          number_of_columns: matrixColumns.value,
          column_headers: [...matrixColumnHeaders.value],
          selected_row_display_option: selectedRowDisplayOption.value,
          yardage_values: yardageValues.value.map((row) => row.map((cell) => ({ ...cell }))),
          club_labels: [...selectedClubs.value],
        })
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
    const isValid = Number.isFinite(parsed) && parsed > 0 && parsed <= MAX_YARDAGE

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

  function setSwingFeelSystem(system: SwingFeelSystem) {
    if (swingFeelSystem.value === 'Percentage') {
      savedPercentageHeaders.value = [...matrixColumnHeaders.value]
    } else {
      savedClockHeaders.value = [...matrixColumnHeaders.value]
    }

    swingFeelSystem.value = system

    matrixColumnHeaders.value =
      system === 'Percentage' ? [...savedPercentageHeaders.value] : [...savedClockHeaders.value]

    requiresSync.value = true
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

  async function downloadMatrix() {
    await synchronizeValues()
    if (syncError.value) return

    const response = await getBlob('/wedge-matrix/' + selectedMatrixId.value + '/download')

    if (response.error) {
      syncError.value = response.error
      return
    }

    if (response.data) {
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'wedge-matrix.pdf'
      a.click()
      URL.revokeObjectURL(url)
    }
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
    selectedMatrixId,
    matrixLabel,
    swingFeelSystem,
    initializeMatrixValues,
    switchMatrix,
    createMatrix,
    deleteMatrix,
    renameMatrix,
    setYardageValue,
    clearYardageValues,
    setSwingFeelSystem,
    setMatrixColumnHeader,
    selectedClubs,
    setNumberOfMatrixColumns,
    setSelectedClubs,
    setSelectedRowDisplayOption,
    synchronizeValues,
    downloadMatrix,
  }
})
