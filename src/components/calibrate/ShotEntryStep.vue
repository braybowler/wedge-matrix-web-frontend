<script setup lang="ts">
import type { CalibrationShot } from '@/stores/calibration/calibrationStore.ts'
import type { RowDisplayOption } from '@/types/matrix'
import CalibrationShotInput from '@/components/calibrate/CalibrationShotInput.vue'

defineProps<{
  clubLabel: string
  swingLabel: string
  shots: CalibrationShot[]
  shotCount: number
  displayOption: RowDisplayOption
  isFirstStep: boolean
}>()

const emit = defineEmits<{
  updateShot: [shotIndex: number, field: 'carry_value' | 'total_value', rawValue: string]
  next: []
  back: []
  quit: []
}>()

function handleShotChange(
  shotIndex: number,
  field: 'carry_value' | 'total_value',
  rawValue: string,
) {
  emit('updateShot', shotIndex, field, rawValue)
}
</script>

<template>
  <section class="step-container">
    <h2 class="step-header" data-test-id="step-header">{{ clubLabel }} @ {{ swingLabel }}</h2>

    <div class="shots-list">
      <CalibrationShotInput
        v-for="(shot, index) in shots"
        :key="index"
        :shot-index="index"
        :carry-value="shot.carry_value"
        :total-value="shot.total_value"
        :display-option="displayOption"
        @change="handleShotChange"
      />
    </div>

    <div class="button-row">
      <button
        v-if="!isFirstStep"
        class="button button-secondary"
        data-test-id="step-back-button"
        @click="emit('back')"
      >
        Back
      </button>
      <button class="button button-primary" data-test-id="step-next-button" @click="emit('next')">
        Next
      </button>
    </div>

    <div class="quit-row">
      <button class="quit-button" data-test-id="quit-calibration-button" @click="emit('quit')">
        Quit Calibration
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

.shots-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
