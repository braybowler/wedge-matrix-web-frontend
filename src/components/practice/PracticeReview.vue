<script setup lang="ts">
import type { PracticeShot } from '@/types/practice'

defineProps<{
  shots: PracticeShot[]
  averageDifference: number
}>()

const emit = defineEmits<{
  save: []
  discard: []
}>()

function differenceClass(diff: number | null): string {
  if (diff === null) return ''
  if (diff <= 3) return 'diff-good'
  if (diff <= 8) return 'diff-ok'
  return 'diff-poor'
}
</script>

<template>
  <section class="review-container" data-test-id="practice-review">
    <h2 class="review-title">Practice Complete</h2>

    <div class="stat-card" data-test-id="practice-avg-diff">
      <span class="stat-label">Average Difference</span>
      <span class="stat-value">{{ averageDifference }} yards</span>
    </div>

    <div class="table-wrapper">
      <table class="review-table">
        <thead>
          <tr>
            <th class="cell header-cell">#</th>
            <th class="cell header-cell">Target</th>
            <th class="cell header-cell">Actual</th>
            <th class="cell header-cell">Diff</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shot in shots" :key="shot.shot_number">
            <td class="cell shot-number-cell">{{ shot.shot_number }}</td>
            <td class="cell">{{ shot.target_yards }}</td>
            <td class="cell">{{ shot.actual_carry ?? '-' }}</td>
            <td class="cell" :class="differenceClass(shot.difference)">
              {{ shot.difference !== null ? shot.difference : '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="button-row">
      <button
        class="button button-secondary"
        data-test-id="discard-practice-button"
        @click="emit('discard')"
      >
        Discard
      </button>
      <button
        class="button button-primary"
        data-test-id="save-practice-button"
        @click="emit('save')"
      >
        Save
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

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  background-color: #374151;
  border-radius: 8px;
}

.stat-label {
  color: #9ca3af;
  font-size: 13px;
  font-weight: 500;
}

.stat-value {
  color: #818cf8;
  font-size: 20px;
  font-weight: 700;
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
  color: #d1d5db;
}

.header-cell {
  color: #9ca3af;
  font-weight: 600;
  border-bottom: 1px solid #4b5563;
}

.shot-number-cell {
  color: #6b7280;
}

.diff-good {
  color: #34d399;
}

.diff-ok {
  color: #fbbf24;
}

.diff-poor {
  color: #f87171;
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
