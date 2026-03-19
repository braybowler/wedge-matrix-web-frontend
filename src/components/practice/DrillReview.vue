<script setup lang="ts">
import type { DrillStep } from '@/types/practice'
import { differenceClass } from '@/utils/differenceClass.ts'

defineProps<{
  steps: DrillStep[]
  stepAverages: (number | null)[]
  averageDifference: number
}>()

const emit = defineEmits<{
  save: []
  discard: []
}>()
</script>

<template>
  <section class="review-container" data-test-id="drill-review">
    <h2 class="review-title">Drill Complete</h2>

    <div class="stat-card" data-test-id="drill-avg-diff">
      <span class="stat-label">Overall Average Dispersion</span>
      <span class="stat-value">{{ averageDifference }} yards</span>
    </div>

    <div class="combos-list">
      <div
        v-for="(step, i) in steps"
        :key="`${step.combo.clubIndex}-${step.combo.columnIndex}`"
        class="combo-card"
        :data-test-id="`drill-combo-result-${i}`"
      >
        <div class="combo-header">
          <span class="combo-label">{{ step.combo.clubLabel }} @ {{ step.combo.swingLabel }}</span>
          <span v-if="step.combo.targetYards !== null" class="combo-target">
            Target: {{ step.combo.targetYards }} yds
          </span>
        </div>
        <div class="combo-shots">
          <span
            v-for="(carry, j) in step.shots"
            :key="j"
            class="shot-badge"
            :data-test-id="`drill-shot-${i}-${j}`"
          >
            {{ carry ?? '-' }}
          </span>
        </div>
        <div
          v-if="stepAverages[i] !== null"
          class="combo-avg"
          :class="differenceClass(stepAverages[i] ?? null)"
        >
          Avg: {{ stepAverages[i] }} yds off
        </div>
      </div>
    </div>

    <div class="button-row">
      <button
        class="button button-secondary"
        data-test-id="discard-drill-button"
        @click="emit('discard')"
      >
        Discard
      </button>
      <button class="button button-primary" data-test-id="save-drill-button" @click="emit('save')">
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

.combos-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.combo-card {
  background-color: #374151;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.combo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.combo-label {
  color: #f3f4f6;
  font-size: 14px;
  font-weight: 600;
}

.combo-target {
  color: #6b7280;
  font-size: 13px;
}

.combo-shots {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.shot-badge {
  background-color: #1f2937;
  color: #d1d5db;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 500;
}

.combo-avg {
  font-size: 13px;
  font-weight: 600;
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
