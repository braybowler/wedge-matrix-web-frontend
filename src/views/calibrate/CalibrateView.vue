<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { useCalibrationStore } from '@/stores/calibration/calibrationStore.ts'
import { storeToRefs } from 'pinia'
import ShotCountSelector from '@/components/calibrate/ShotCountSelector.vue'
import ShotEntryStep from '@/components/calibrate/ShotEntryStep.vue'
import CalibrationProgress from '@/components/calibrate/CalibrationProgress.vue'
import CalibrationReview from '@/components/calibrate/CalibrationReview.vue'
import ConfirmationModal from '@/components/matrix/ConfirmationModal.vue'
import type { ShotCount } from '@/stores/calibration/calibrationStore.ts'

const router = useRouter()
const matrixConfigurationStore = useMatrixConfigurationStore()
const calibrationStore = useCalibrationStore()
const showQuitModal = ref(false)

const {
  session,
  isActive,
  isComplete,
  totalSteps,
  currentStepNumber,
  currentStep,
  progressPercent,
} = storeToRefs(calibrationStore)
const {
  selectedClubs,
  matrixColumnHeaders,
  matrixColumns,
  selectedRowDisplayOption,
  displayLabels,
} = storeToRefs(matrixConfigurationStore)

function handleSelectShotCount(shotCount: ShotCount) {
  calibrationStore.startCalibration(shotCount)
}

function handleUpdateShot(
  shotIndex: number,
  field: 'carry_value' | 'total_value',
  rawValue: string,
) {
  calibrationStore.setShotValue(shotIndex, field, rawValue)
}

async function handleApply() {
  calibrationStore.applyCalibration()
  await matrixConfigurationStore.synchronizeValues()
  router.push({ name: 'matrix' })
}

function handleCancel() {
  calibrationStore.clearSession()
  router.push({ name: 'matrix' })
}
</script>

<template>
  <main class="calibrate-wrapper">
    <div class="calibrate-container">
      <!-- Phase 1: No session — select shot count -->
      <ShotCountSelector v-if="!session" @select="handleSelectShotCount" />

      <!-- Phase 2: Active session — shot entry -->
      <template v-else-if="isActive && currentStep">
        <CalibrationProgress
          :current-step="currentStepNumber"
          :total-steps="totalSteps"
          :percent="progressPercent"
        />
        <ShotEntryStep
          :club-label="
            displayLabels[currentStep.clubIndex] ?? selectedClubs[currentStep.clubIndex] ?? ''
          "
          :swing-label="
            matrixColumnHeaders[currentStep.columnIndex] ?? `Col ${currentStep.columnIndex + 1}`
          "
          :shots="currentStep.shots"
          :shot-count="session.shotCount"
          :display-option="selectedRowDisplayOption"
          :is-first-step="session.currentStepIndex === 0"
          @update-shot="handleUpdateShot"
          @next="calibrationStore.advanceStep()"
          @back="calibrationStore.goBackStep()"
          @quit="showQuitModal = true"
        />
      </template>

      <!-- Phase 3: Completed — review -->
      <CalibrationReview
        v-else-if="isComplete"
        :old-values="calibrationStore.getOldValues()"
        :new-values="calibrationStore.computeAverages()"
        :clubs="selectedClubs"
        :column-headers="matrixColumnHeaders"
        :columns="matrixColumns"
        :display-option="selectedRowDisplayOption"
        :display-labels="displayLabels"
        @apply="handleApply"
        @cancel="handleCancel"
      />
    </div>

    <ConfirmationModal
      :visible="showQuitModal"
      title="Quit Calibration"
      message="Are you sure you want to quit? All calibration progress will be lost."
      @confirm="handleCancel"
      @cancel="showQuitModal = false"
    />
  </main>
</template>

<style scoped>
.calibrate-wrapper {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.calibrate-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background-color: #1f2937;
  border-radius: 8px;
}

@media (max-width: 480px) {
  .calibrate-container {
    gap: 10px;
    padding: 12px;
  }
}
</style>
