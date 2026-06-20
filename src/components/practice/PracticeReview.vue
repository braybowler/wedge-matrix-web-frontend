<script setup lang="ts">
import { computed } from 'vue'
import type { PracticeShot } from '@/types/practice'
import { differenceClass } from '@/utils/differenceClass.ts'

const props = defineProps<{
  shots: PracticeShot[]
  averageDifference: number
}>()

const emit = defineEmits<{
  save: []
  discard: []
}>()

const bestShot = computed(() => {
  const diffs = props.shots.map((s) => s.difference).filter((d): d is number => d !== null)
  if (diffs.length === 0) return null
  return Math.min(...diffs)
})
</script>

<template>
  <section class="review-container" data-test-id="practice-review">
    <h2 class="review-title">Practice Complete</h2>

    <div class="stat-grid">
      <div class="stat-card stat-card-accent" data-test-id="practice-avg-diff">
        <span class="stat-label">Average miss</span>
        <span class="stat-value stat-value-accent">{{ averageDifference }} yards</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Best shot</span>
        <span class="stat-value">{{ bestShot !== null ? bestShot + ' yds' : '—' }}</span>
      </div>
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
            <td class="cell diff-cell" :class="differenceClass(shot.difference)">
              {{ shot.difference !== null ? shot.difference : '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="button-row">
      <button
        type="button"
        class="btn btn-secondary"
        data-test-id="discard-practice-button"
        @click="emit('discard')"
      >
        Discard
      </button>
      <button
        type="button"
        class="btn btn-primary"
        data-test-id="save-practice-button"
        @click="emit('save')"
      >
        Save session
      </button>
    </div>
  </section>
</template>

<style scoped>
.review-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: prcStep 0.28s ease both;
}

.review-title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-align: center;
  color: #f4f6fb;
  margin: 0;
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-card-accent {
  background: rgba(139, 140, 246, 0.1);
  border-color: rgba(139, 140, 246, 0.3);
}

.stat-label {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #828aa0;
}

.stat-card-accent .stat-label {
  color: #aab2c5;
}

.stat-value {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #f4f6fb;
}

.stat-value-accent {
  color: #8b8cf6;
}

.table-wrapper {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  overflow: hidden;
}

.review-table {
  width: 100%;
  border-collapse: collapse;
}

.cell {
  padding: 12px 8px;
  text-align: center;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 14px;
  color: #cdd3e0;
}

.header-cell {
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #828aa0;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.02);
}

.review-table tbody tr {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.shot-number-cell {
  color: #5b6276;
}

.diff-cell {
  font-weight: 700;
}

.diff-good {
  color: #34d399;
}

.diff-ok {
  color: #fbbf24;
}

.diff-poor {
  color: #ef6c6c;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn {
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.14s;
}

.btn-primary {
  background: #8b8cf6;
  border: none;
  color: #0a0e1a;
  padding: 13px 32px;
}

.btn-primary:hover {
  transform: translateY(-1px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f4f6fb;
  font-weight: 600;
  padding: 13px 26px;
}

.btn-secondary:hover {
  border-color: rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.06);
}
</style>
