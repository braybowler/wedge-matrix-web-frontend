import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  AllowableMatrixColumnNumber,
  RowDisplayOption,
  WedgeMatrix,
  YardageGrid,
} from '@/types/matrix'
import { useAxios } from '@/composables/axios/axios.ts'

const { put } = useAxios()

export const useMatrixConfigurationStore = defineStore('matrixConfiguration', () => {
  const requiresSync = ref(false)
  const selectedMatrixId = ref<number | null>(null)
  const matrixColumns = ref<AllowableMatrixColumnNumber>(4)
  const matrixColumnHeaders = ref<Array<string>>(['', '', '', ''])
  const selectedRowDisplayOption = ref<RowDisplayOption>('Carry')
  const yardageValues = ref<YardageGrid>([
    [
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
    ],
    [
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
    ],
    [
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
    ],
    [
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
    ],
  ])

  function initializeMatrixValues(initialMatrixValues: WedgeMatrix) {
    selectedMatrixId.value = initialMatrixValues.id
    matrixColumns.value = initialMatrixValues.number_of_columns
    selectedRowDisplayOption.value = initialMatrixValues.selected_row_display_option

    if (initialMatrixValues.column_headers) {
      matrixColumnHeaders.value = initialMatrixValues.column_headers
    }

    if (initialMatrixValues.yardage_values) {
      yardageValues.value = initialMatrixValues.yardage_values
    }
  }

  async function synchronizeValues() {
    if (requiresSync.value) {
      await put('/wedge-matrix/' + selectedMatrixId.value, {
        number_of_columns: matrixColumns.value,
        column_headers: matrixColumnHeaders.value,
        selected_row_display_option: selectedRowDisplayOption.value,
        yardage_values: yardageValues.value,
      })

      requiresSync.value = false
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

  return {
    yardageValues,
    matrixColumns,
    matrixColumnHeaders,
    selectedRowDisplayOption,
    requiresSync,
    initializeMatrixValues,
    setYardageValue,
    clearYardageValues,
    setMatrixColumnHeader,
    setNumberOfMatrixColumns,
    setSelectedRowDisplayOption,
    synchronizeValues,
  }
})
