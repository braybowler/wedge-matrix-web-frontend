<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { useCalibrationStore } from '@/stores/calibration/calibrationStore.ts'
import { storeToRefs } from 'pinia'
import CalibrationClubSelector from '@/components/calibrate/CalibrationClubSelector.vue'
import CalibrationSwingTypeSelector from '@/components/calibrate/CalibrationSwingTypeSelector.vue'
import ShotCountSelector from '@/components/calibrate/ShotCountSelector.vue'
import ShotEntryStep from '@/components/calibrate/ShotEntryStep.vue'
import CalibrationReview from '@/components/calibrate/CalibrationReview.vue'
import ConfirmationModal from '@/components/matrix/ConfirmationModal.vue'
import type { ShotCount } from '@/stores/calibration/calibrationStore.ts'

const STAGE_LABELS = ['Clubs', 'Swings', 'Shots', 'Enter', 'Review'] as const

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

type SetupPhase = 'clubs' | 'swingTypes' | 'shotCount'
const setupPhase = ref<SetupPhase>('clubs')
const selectedClubIndices = ref<number[]>([])
const selectedColumnIndices = ref<number[]>([])

const currentStageIndex = computed(() => {
  if (isComplete.value) return 4
  if (isActive.value) return 3
  if (setupPhase.value === 'shotCount') return 2
  if (setupPhase.value === 'swingTypes') return 1
  return 0
})

function handleClubsSelected(indices: number[]) {
  selectedClubIndices.value = indices
  setupPhase.value = 'swingTypes'
}

function handleSwingTypesSelected(indices: number[]) {
  selectedColumnIndices.value = indices
  setupPhase.value = 'shotCount'
}

function handleSelectShotCount(shotCount: ShotCount) {
  calibrationStore.startCalibration(
    shotCount,
    selectedClubIndices.value,
    selectedColumnIndices.value,
  )
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
  if (matrixConfigurationStore.syncError) return
  router.push({ name: 'matrix' })
}

function handleCancel() {
  calibrationStore.clearSession()
  router.push({ name: 'matrix' })
}
</script>

<template>
  <main class="calibrate-shell wider-page-content">
    <div class="calibrate-orbit" aria-hidden="true" />

    <div class="calibrate-inner">
      <header class="page-header">
        <div class="eyebrow">Range session</div>
        <h1 class="page-title">Calibrate</h1>
      </header>

      <nav class="stepper" aria-label="Calibration steps">
        <template v-for="(label, i) in STAGE_LABELS" :key="label">
          <div
            class="step"
            :class="{
              'is-current': i === currentStageIndex,
              'is-done': i < currentStageIndex,
            }"
          >
            <span class="step-circle">{{ i < currentStageIndex ? '✓' : i + 1 }}</span>
            <span class="step-label">{{ label }}</span>
          </div>
          <span
            v-if="i < STAGE_LABELS.length - 1"
            class="step-bar"
            :class="{ 'is-done': i < currentStageIndex }"
            aria-hidden="true"
          />
        </template>
      </nav>

      <!-- Setup phases (no session yet) -->
      <template v-if="!session">
        <CalibrationClubSelector
          v-if="setupPhase === 'clubs'"
          :clubs="selectedClubs"
          :display-labels="displayLabels"
          @select="handleClubsSelected"
        />

        <CalibrationSwingTypeSelector
          v-else-if="setupPhase === 'swingTypes'"
          :column-headers="matrixColumnHeaders"
          :columns="matrixColumns"
          @select="handleSwingTypesSelected"
          @back="setupPhase = 'clubs'"
        />

        <ShotCountSelector
          v-else-if="setupPhase === 'shotCount'"
          @select="handleSelectShotCount"
          @back="setupPhase = 'swingTypes'"
        />
      </template>

      <!-- Active session — shot entry -->
      <ShotEntryStep
        v-else-if="isActive && currentStep"
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
        :current-step="currentStepNumber"
        :total-steps="totalSteps"
        :percent="progressPercent"
        @update-shot="handleUpdateShot"
        @next="calibrationStore.advanceStep()"
        @back="calibrationStore.goBackStep()"
        @quit="showQuitModal = true"
      />

      <!-- Completed — review (filtered to selected clubs/columns) -->
      <CalibrationReview
        v-else-if="isComplete && session"
        :old-values="calibrationStore.getFilteredOldValues()"
        :new-values="calibrationStore.getFilteredNewValues()"
        :clubs="session.selectedClubIndices.map((i) => selectedClubs[i]!)"
        :column-headers="session.selectedColumnIndices.map((i) => matrixColumnHeaders[i] ?? '')"
        :columns="session.selectedColumnIndices.length"
        :display-option="selectedRowDisplayOption"
        :display-labels="session.selectedClubIndices.map((i) => displayLabels[i] ?? '')"
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
.calibrate-shell {
  position: relative;
  width: 100%;
  padding: 40px 32px 64px;
  color: #f4f6fb;
  font-family: 'Archivo', system-ui, sans-serif;
  overflow: hidden;
}

.calibrate-inner {
  position: relative;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
}

.calibrate-orbit {
  position: absolute;
  top: -180px;
  right: -160px;
  width: 680px;
  height: 680px;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle,
    transparent 0 52px,
    rgba(139, 140, 246, 0.06) 52px 53px
  );
  -webkit-mask: radial-gradient(circle, #000 24%, transparent 68%);
  mask: radial-gradient(circle, #000 24%, transparent 68%);
  pointer-events: none;
  z-index: 0;
}

.page-header {
  margin-bottom: 24px;
}

.eyebrow {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11.5px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #8b8cf6;
  margin-bottom: 10px;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin: 0;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.step {
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-circle {
  width: 32px;
  height: 32px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12.5px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.05);
  color: #828aa0;
  transition: all 0.16s;
}

.step-label {
  font-size: 13.5px;
  font-weight: 500;
  color: #6c7488;
  white-space: nowrap;
  transition: color 0.16s;
}

.step.is-done .step-circle {
  background: rgba(139, 140, 246, 0.18);
  color: #8b8cf6;
}

.step.is-done .step-label {
  color: #cdd3e0;
}

.step.is-current .step-circle {
  background: #8b8cf6;
  color: #0a0e1a;
  box-shadow: 0 0 0 4px rgba(139, 140, 246, 0.16);
}

.step.is-current .step-label {
  color: #f4f6fb;
  font-weight: 700;
}

.step-bar {
  flex: 1;
  min-width: 14px;
  height: 2px;
  border-radius: 2px;
  margin: 0 12px;
  background: rgba(255, 255, 255, 0.08);
  transition: background 0.16s;
}

.step-bar.is-done {
  background: rgba(139, 140, 246, 0.4);
}

@media (max-width: 640px) {
  .calibrate-shell {
    padding: 24px 16px 48px;
  }

  .page-title {
    font-size: 26px;
  }
}
</style>
