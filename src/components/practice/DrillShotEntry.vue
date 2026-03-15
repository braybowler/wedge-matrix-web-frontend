<script setup lang="ts">
import type { DrillStep } from '@/types/practice'

defineProps<{
  step: DrillStep
  isFirstStep: boolean
}>()

const emit = defineEmits<{
  'update-carry': [shotIndex: number, rawValue: string]
  next: []
  back: []
  quit: []
}>()
</script>

<template>
  <section class="step-container">
    <h2 class="step-header" data-test-id="drill-step-header">
      {{ step.combo.clubLabel }} @ {{ step.combo.swingLabel }}
    </h2>
    <p
      v-if="step.combo.targetYards !== null"
      class="target-label"
      data-test-id="drill-target-label"
    >
      Target: {{ step.combo.targetYards }} yards
    </p>
    <p v-else class="target-label" data-test-id="drill-target-label">Hit 5 shots</p>

    <div class="shots-list">
      <div v-for="(carry, index) in step.shots" :key="index" class="shot-row">
        <label class="shot-label">Shot {{ index + 1 }}</label>
        <input
          type="number"
          class="input"
          placeholder="Carry"
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
        class="button button-secondary"
        data-test-id="drill-back-button"
        @click="emit('back')"
      >
        Back
      </button>
      <button class="button button-primary" data-test-id="drill-next-button" @click="emit('next')">
        Next
      </button>
    </div>

    <div class="quit-row">
      <button class="quit-button" data-test-id="quit-drill-button" @click="emit('quit')">
        Quit Drill
      </button>
    </div>
  </section>
</template>

<style scoped>
.step-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-header {
  color: #f3f4f6;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}

.target-label {
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}

.shots-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.shot-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.shot-label {
  color: #9ca3af;
  font-size: 14px;
  font-weight: 500;
  min-width: 60px;
}

.input {
  background-color: #374151;
  padding: 6px 8px;
  color: #f3f4f6;
  border: 1px solid #4b5563;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  width: 80px;
}

.input:focus {
  border-color: #818cf8;
  outline: none;
}

.input:focus::placeholder {
  color: transparent;
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

.quit-row {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}

.quit-button {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s ease;
}

.quit-button:hover {
  color: #dc2626;
}
</style>
