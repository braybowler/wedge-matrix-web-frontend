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

    <div class="stat-card stat-card-accent" data-test-id="drill-avg-diff">
      <span class="stat-label">Overall average dispersion</span>
      <span class="stat-value stat-value-accent">{{ averageDifference }} yards</span>
    </div>

    <div class="combos-list">
      <div
        v-for="(step, i) in steps"
        :key="`${step.combo.clubIndex}-${step.combo.columnIndex}`"
        class="combo-card"
        :data-test-id="`drill-combo-result-${i}`"
      >
        <div class="combo-header">
          <span class="combo-label">{{ step.combo.clubLabel }} · {{ step.combo.swingLabel }}</span>
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
        type="button"
        class="btn btn-secondary"
        data-test-id="discard-drill-button"
        @click="emit('discard')"
      >
        Discard
      </button>
      <button
        type="button"
        class="btn btn-primary"
        data-test-id="save-drill-button"
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
  gap: 20px;
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

.combos-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.combo-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.combo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.combo-label {
  font-weight: 700;
  font-size: 15px;
  color: #f4f6fb;
}

.combo-target {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
  color: #828aa0;
}

.combo-shots {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.shot-badge {
  background: rgba(255, 255, 255, 0.04);
  color: #cdd3e0;
  border-radius: 8px;
  padding: 6px 12px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
  font-weight: 500;
}

.combo-avg {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
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
