<script setup lang="ts">
import type { YardageGrid, RowDisplayOption, ClubLabel } from '@/types/matrix'

defineProps<{
  oldValues: YardageGrid
  newValues: YardageGrid
  clubs: ClubLabel[]
  columnHeaders: string[]
  columns: number
  displayOption: RowDisplayOption
}>()

const emit = defineEmits<{
  apply: []
  cancel: []
}>()

function formatValue(val: number | null): string {
  return val !== null ? String(val) : '-'
}
</script>

<template>
  <section class="review-container" data-test-id="calibration-review">
    <h2 class="review-title">Review Calibration</h2>

    <div class="table-wrapper">
      <table class="review-table">
        <thead>
          <tr>
            <th class="cell header-cell">Club</th>
            <th
              v-for="(header, colIdx) in columnHeaders.slice(0, columns)"
              :key="colIdx"
              class="cell header-cell"
            >
              {{ header || `Col ${colIdx + 1}` }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(club, clubIdx) in clubs" :key="club">
            <td class="cell club-cell">{{ club }}</td>
            <td v-for="colIdx in columns" :key="colIdx" class="cell value-cell">
              <template v-if="displayOption === 'Carry' || displayOption === 'Both'">
                <span class="old-value">{{
                  formatValue(oldValues[clubIdx]?.[colIdx - 1]?.carry_value ?? null)
                }}</span>
                <span class="arrow">&rarr;</span>
                <span class="new-value">{{
                  formatValue(newValues[clubIdx]?.[colIdx - 1]?.carry_value ?? null)
                }}</span>
              </template>
              <template v-if="displayOption === 'Both'">
                <span class="separator">/</span>
              </template>
              <template v-if="displayOption === 'Total' || displayOption === 'Both'">
                <span class="old-value">{{
                  formatValue(oldValues[clubIdx]?.[colIdx - 1]?.total_value ?? null)
                }}</span>
                <span class="arrow">&rarr;</span>
                <span class="new-value">{{
                  formatValue(newValues[clubIdx]?.[colIdx - 1]?.total_value ?? null)
                }}</span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="button-row">
      <button
        class="button button-secondary"
        data-test-id="cancel-calibration-button"
        @click="emit('cancel')"
      >
        Cancel
      </button>
      <button
        class="button button-primary"
        data-test-id="apply-calibration-button"
        @click="emit('apply')"
      >
        Apply
      </button>
    </div>
  </section>
</template>

<style scoped>
.review-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-title {
  color: #f3f4f6;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}

.table-wrapper {
  overflow-x: auto;
}

.review-table {
  width: 100%;
  border-collapse: collapse;
}

.cell {
  padding: 8px;
  text-align: center;
  font-size: 13px;
}

.header-cell {
  color: #9ca3af;
  font-weight: 600;
  border-bottom: 1px solid #4b5563;
}

.club-cell {
  color: #f3f4f6;
  font-weight: 600;
}

.value-cell {
  color: #d1d5db;
  white-space: nowrap;
}

.old-value {
  color: #9ca3af;
}

.arrow {
  color: #6b7280;
  margin: 0 4px;
}

.new-value {
  color: #818cf8;
  font-weight: 600;
}

.separator {
  color: #4b5563;
  margin: 0 4px;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.button {
  border-radius: 8px;
  padding: 8px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  transform: translateY(-1px);
}

.button-primary {
  background-color: #818cf8;
  color: #f3f4f6;
  border: 1px solid #818cf8;
}

.button-primary:hover {
  background-color: #6366f1;
}

.button-secondary {
  background-color: #374151;
  color: #9ca3af;
  border: 1px solid #4b5563;
}

.button-secondary:hover {
  background-color: #4b5563;
  border-color: #818cf8;
}
</style>
