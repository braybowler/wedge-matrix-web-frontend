<script setup lang="ts">
import { computed } from 'vue'
import type { CalibrationShot } from '@/stores/calibration/calibrationStore.ts'
import type { RowDisplayOption } from '@/types/matrix'
import CalibrationShotInput from '@/components/calibrate/CalibrationShotInput.vue'
import CalibrationProgress from '@/components/calibrate/CalibrationProgress.vue'

const props = defineProps<{
  clubLabel: string
  swingLabel: string
  shots: CalibrationShot[]
  shotCount: number
  displayOption: RowDisplayOption
  isFirstStep: boolean
  currentStep: number
  totalSteps: number
  percent: number
}>()

const emit = defineEmits<{
  updateShot: [shotIndex: number, field: 'carry_value' | 'total_value', rawValue: string]
  next: []
  back: []
  quit: []
}>()

const isLastStep = computed(() => props.currentStep >= props.totalSteps)

function handleShotChange(
  shotIndex: number,
  field: 'carry_value' | 'total_value',
  rawValue: string,
) {
  emit('updateShot', shotIndex, field, rawValue)
}
</script>

<template>
  <section>
    <div class="cal-card">
      <CalibrationProgress
        :current-step="currentStep"
        :total-steps="totalSteps"
        :percent="percent"
      />

      <h2 class="cal-combo" data-test-id="step-header">{{ clubLabel }} @ {{ swingLabel }}</h2>

      <div class="cal-entry-rows">
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

      <div class="cal-quit-row">
        <button class="cal-quit" data-test-id="quit-calibration-button" @click="emit('quit')">
          Quit calibration
        </button>
      </div>
    </div>

    <div class="cal-footer">
      <button
        v-if="!isFirstStep"
        type="button"
        class="cal-btn cal-btn-back"
        data-test-id="step-back-button"
        @click="emit('back')"
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
        Back
      </button>
      <button
        type="button"
        class="cal-btn cal-btn-next"
        data-test-id="step-next-button"
        @click="emit('next')"
      >
        {{ isLastStep ? 'Review' : 'Next' }}
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
