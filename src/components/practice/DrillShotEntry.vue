<script setup lang="ts">
import type { DrillStep } from '@/types/practice'

withDefaults(
  defineProps<{
    step: DrillStep
    isFirstStep: boolean
    isLastStep?: boolean
  }>(),
  { isLastStep: false },
)

const emit = defineEmits<{
  'update-carry': [shotIndex: number, rawValue: string]
  next: []
  back: []
  quit: []
}>()
</script>

<template>
  <section class="step-container">
    <div class="combo-eyebrow" data-test-id="drill-step-header">
      {{ step.combo.clubLabel }} · {{ step.combo.swingLabel }}
    </div>
    <h2
      v-if="step.combo.targetYards !== null"
      class="target-label"
      data-test-id="drill-target-label"
    >
      Hit to <span class="target-accent">{{ step.combo.targetYards }}</span> yards
    </h2>
    <h2 v-else class="target-label" data-test-id="drill-target-label">Hit 5 shots</h2>

    <div class="shots-list">
      <div v-for="(carry, index) in step.shots" :key="index" class="shot-row">
        <label class="shot-label">Shot {{ index + 1 }}</label>
        <input
          type="number"
          class="input"
          placeholder="yards"
          step="0.1"
          min="0"
          max="999"
          inputmode="decimal"
          :value="carry"
          :data-test-id="`drill-carry-input-${index}`"
          @input="emit('update-carry', index, ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <div class="button-row">
      <button
        v-if="!isFirstStep"
        type="button"
        class="btn btn-back"
        data-test-id="drill-back-button"
        @click="emit('back')"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back
      </button>
      <button
        type="button"
        class="btn btn-next"
        data-test-id="drill-next-button"
        @click="emit('next')"
      >
        {{ isLastStep ? 'Finish' : 'Next' }}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>

    <div class="quit-row">
      <button
        type="button"
        class="quit-button"
        data-test-id="quit-drill-button"
        @click="emit('quit')"
      >
        Quit drill
      </button>
    </div>
  </section>
</template>

<style scoped>
.step-container {
  display: flex;
  flex-direction: column;
  animation: prcStep 0.28s ease both;
}

.combo-eyebrow {
  text-align: center;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
  color: #8b8cf6;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

.target-label {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.025em;
  text-align: center;
  color: #f4f6fb;
  margin: 0 0 24px;
}

.target-accent {
  color: #8b8cf6;
}

.shots-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 320px;
  width: 100%;
  margin: 0 auto;
}

.shot-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.shot-label {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
  color: #828aa0;
  min-width: 60px;
}

.input {
  flex: 1;
  max-width: 130px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 11px;
  padding: 12px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 16px;
  font-weight: 700;
  color: #f4f6fb;
  text-align: center;
  outline: none;
  transition: all 0.14s;
}

.input:focus {
  border-color: #8b8cf6;
  background: rgba(139, 140, 246, 0.06);
}

.input::placeholder {
  color: #4f566b;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 26px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.14s;
}

.btn-back {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f4f6fb;
  font-weight: 600;
  padding: 13px 24px;
}

.btn-back:hover {
  border-color: rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.06);
}

.btn-next {
  background: #8b8cf6;
  border: none;
  color: #0a0e1a;
  padding: 13px 32px;
}

.btn-next:hover {
  transform: translateY(-1px);
}

.quit-row {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.quit-button {
  background: none;
  border: none;
  color: #6c7488;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.14s;
}

.quit-button:hover {
  color: #aab2c5;
}
</style>
