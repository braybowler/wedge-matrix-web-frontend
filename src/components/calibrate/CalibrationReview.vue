<script setup lang="ts">
import { computed } from 'vue'
import type { YardageGrid, RowDisplayOption, ClubLabel } from '@/types/matrix'

const props = defineProps<{
  oldValues: YardageGrid
  newValues: YardageGrid
  clubs: ClubLabel[]
  columnHeaders: string[]
  columns: number
  displayOption: RowDisplayOption
  displayLabels?: string[]
}>()

const emit = defineEmits<{
  apply: []
  cancel: []
}>()

const gridTemplate = computed(() => `64px repeat(${props.columns}, minmax(0, 1fr))`)

const showCarry = computed(() => props.displayOption === 'Carry' || props.displayOption === 'Both')
const showTotal = computed(() => props.displayOption === 'Total' || props.displayOption === 'Both')

function formatValue(val: number | null): string {
  return val !== null ? String(val) : '-'
}
</script>

<template>
  <section data-test-id="calibration-review">
    <div class="cal-card">
      <h2 class="cal-card-title">Review calibration</h2>
      <p class="cal-card-desc">
        Old &rarr; <span class="accent">new</span> carry / total per cell. Apply to write these to
        your matrix.
      </p>

      <div class="table-wrapper">
        <div class="review-grid" :style="{ gridTemplateColumns: gridTemplate }">
          <div class="header-cell corner">Club</div>
          <div
            v-for="(header, colIdx) in columnHeaders.slice(0, columns)"
            :key="colIdx"
            class="header-cell"
          >
            {{ header || `Col ${colIdx + 1}` }}
          </div>

          <template v-for="(club, clubIdx) in clubs" :key="club">
            <div class="club-cell">{{ displayLabels?.[clubIdx] ?? club }}</div>
            <div v-for="colIdx in columns" :key="colIdx" class="value-cell">
              <div v-if="showCarry" class="value-line">
                <span class="old-value">{{
                  formatValue(oldValues[clubIdx]?.[colIdx - 1]?.carry_value ?? null)
                }}</span>
                <span class="arrow">&rarr;</span>
                <span class="new-value">{{
                  formatValue(newValues[clubIdx]?.[colIdx - 1]?.carry_value ?? null)
                }}</span>
              </div>
              <div v-if="showTotal" class="value-line is-total">
                <span class="old-value">{{
                  formatValue(oldValues[clubIdx]?.[colIdx - 1]?.total_value ?? null)
                }}</span>
                <span class="arrow">&rarr;</span>
                <span class="new-value">{{
                  formatValue(newValues[clubIdx]?.[colIdx - 1]?.total_value ?? null)
                }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="cal-footer">
      <button
        type="button"
        class="cal-btn cal-btn-back"
        data-test-id="cancel-calibration-button"
        @click="emit('cancel')"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Cancel
      </button>
      <button
        type="button"
        class="cal-btn cal-btn-next"
        data-test-id="apply-calibration-button"
        @click="emit('apply')"
      >
        Apply
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
.accent {
  color: #8b8cf6;
}

.table-wrapper {
  overflow-x: auto;
}

.review-grid {
  display: grid;
  min-width: 560px;
}

.header-cell {
  padding: 10px 8px;
  text-align: center;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
  font-weight: 700;
  color: #8b8cf6;
}

.header-cell.corner {
  text-align: left;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #828aa0;
}

.club-cell {
  display: flex;
  align-items: center;
  padding: 14px 12px;
  font-weight: 800;
  font-size: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.value-cell {
  padding: 12px 6px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-left: 1px solid rgba(255, 255, 255, 0.04);
}

.value-line {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12.5px;
}

.value-line.is-total {
  font-size: 11px;
  margin-top: 3px;
}

.old-value {
  color: #7e879c;
}

.value-line.is-total .old-value {
  color: #5b6276;
}

.arrow {
  color: #4f566b;
  margin: 0 4px;
}

.new-value {
  color: #8b8cf6;
  font-weight: 700;
}

.value-line.is-total .new-value {
  color: #9a9ff0;
  font-weight: 500;
}
</style>
