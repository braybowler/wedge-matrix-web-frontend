<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePracticeStore } from '@/stores/practice/practiceStore.ts'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { storeToRefs } from 'pinia'
import PracticeModeSelector from '@/components/practice/PracticeModeSelector.vue'
import PracticeShotCountSelector from '@/components/practice/PracticeShotCountSelector.vue'
import PracticeProgress from '@/components/practice/PracticeProgress.vue'
import PracticeShotEntry from '@/components/practice/PracticeShotEntry.vue'
import PracticeReview from '@/components/practice/PracticeReview.vue'
import PracticeLog from '@/components/practice/PracticeLog.vue'
import DrillComboSelector from '@/components/practice/DrillComboSelector.vue'
import DrillShotEntry from '@/components/practice/DrillShotEntry.vue'
import DrillReview from '@/components/practice/DrillReview.vue'
import ConfirmationModal from '@/components/matrix/ConfirmationModal.vue'
import type { DrillCombo, PracticeMode, PracticeShotCount } from '@/types/practice'

const practiceStore = usePracticeStore()
const matrixStore = useMatrixConfigurationStore()
const showQuitModal = ref(false)
const showModeSelector = ref(false)
const showShotCountSelector = ref(false)
const showComboSelector = ref(false)

const {
  session,
  drillSession,
  isActive,
  isComplete,
  totalShots,
  currentShotNumber,
  currentShot,
  progressPercent,
  averageDifference,
  isDrillActive,
  isDrillComplete,
  drillTotalSteps,
  drillCurrentStepNumber,
  drillCurrentStep,
  drillProgressPercent,
  drillStepAverages,
  drillAverageDifference,
  practiceLog,
  logError,
} = storeToRefs(practiceStore)

const hasActiveSession = computed(() => session.value !== null || drillSession.value !== null)

const availableCombos = computed<DrillCombo[]>(() => {
  const combos: DrillCombo[] = []
  const clubs = matrixStore.selectedClubs
  const headers = matrixStore.matrixColumnHeaders
  const displayLabels = matrixStore.displayLabels
  const grid = matrixStore.yardageValues
  const cols = matrixStore.matrixColumns

  for (let ci = 0; ci < clubs.length; ci++) {
    for (let hi = 0; hi < cols; hi++) {
      const cell = grid[ci]?.[hi]
      combos.push({
        clubIndex: ci,
        columnIndex: hi,
        clubLabel: displayLabels[ci] ?? clubs[ci] ?? '',
        swingLabel: headers[hi] || `Col ${hi + 1}`,
        targetYards: cell?.carry_value ?? null,
      })
    }
  }
  return combos
})

onMounted(() => {
  if (!hasActiveSession.value) {
    practiceStore.fetchPracticeLog()
  }
})

function handleNewSession() {
  showModeSelector.value = true
}

function handleModeSelect(mode: PracticeMode) {
  showModeSelector.value = false
  if (mode === 'gauntlet') {
    showShotCountSelector.value = true
  } else {
    showComboSelector.value = true
  }
}

function handleSelectShotCount(shotCount: PracticeShotCount) {
  practiceStore.startPractice(shotCount)
  if (practiceStore.session) {
    showShotCountSelector.value = false
  }
}

function handleSelectCombos(combos: DrillCombo[]) {
  practiceStore.startDrill(combos)
  if (practiceStore.drillSession) {
    showComboSelector.value = false
  }
}

function handleComboBack() {
  showComboSelector.value = false
  showModeSelector.value = true
}

function handleQuitConfirm() {
  if (session.value) {
    practiceStore.clearSession()
  } else if (drillSession.value) {
    practiceStore.clearDrillSession()
  }
  showQuitModal.value = false
  practiceStore.fetchPracticeLog()
}

async function handleSave() {
  await practiceStore.saveSession()
}

async function handleDrillSave() {
  await practiceStore.saveDrillSession()
}

function handleDiscard() {
  practiceStore.clearSession()
  practiceStore.fetchPracticeLog()
}

function handleDrillDiscard() {
  practiceStore.clearDrillSession()
  practiceStore.fetchPracticeLog()
}
</script>

<template>
  <main class="practice-wrapper">
    <div class="practice-container">
      <!-- No active session: show setup or log -->
      <template v-if="!hasActiveSession">
        <PracticeModeSelector v-if="showModeSelector" @select="handleModeSelect" />

        <PracticeShotCountSelector
          v-else-if="showShotCountSelector"
          @select="handleSelectShotCount"
        />

        <DrillComboSelector
          v-else-if="showComboSelector"
          :combos="availableCombos"
          @select="handleSelectCombos"
          @back="handleComboBack"
        />

        <template v-else>
          <div class="new-session-row">
            <button
              class="button button-primary"
              data-test-id="new-practice-session-button"
              @click="handleNewSession"
            >
              New Session
            </button>
          </div>

          <PracticeLog
            :sessions="practiceLog"
            :error="logError"
            @delete="practiceStore.deleteSession($event)"
            @retry="practiceStore.fetchPracticeLog()"
          />
        </template>
      </template>

      <!-- Gauntlet: active shot entry -->
      <template v-else-if="isActive && currentShot">
        <PracticeProgress
          :current-shot="currentShotNumber"
          :total-shots="totalShots"
          :percent="progressPercent"
        />
        <PracticeShotEntry
          :shot="currentShot"
          :is-first-shot="session!.currentShotIndex === 0"
          @update-carry="practiceStore.setActualCarry($event)"
          @next="practiceStore.advanceShot()"
          @back="practiceStore.goBackShot()"
          @quit="showQuitModal = true"
        />
      </template>

      <!-- Gauntlet: completed review -->
      <PracticeReview
        v-else-if="isComplete && session"
        :shots="session.shots"
        :average-difference="averageDifference"
        @save="handleSave"
        @discard="handleDiscard"
      />

      <!-- Drill: active step entry -->
      <template v-else-if="isDrillActive && drillCurrentStep">
        <PracticeProgress
          :current-shot="drillCurrentStepNumber"
          :total-shots="drillTotalSteps"
          :percent="drillProgressPercent"
        />
        <DrillShotEntry
          :step="drillCurrentStep"
          :is-first-step="drillSession!.currentStepIndex === 0"
          @update-carry="(idx: number, val: string) => practiceStore.setDrillCarry(idx, val)"
          @next="practiceStore.advanceDrillStep()"
          @back="practiceStore.goBackDrillStep()"
          @quit="showQuitModal = true"
        />
      </template>

      <!-- Drill: completed review -->
      <DrillReview
        v-else-if="isDrillComplete && drillSession"
        :steps="drillSession.steps"
        :step-averages="drillStepAverages"
        :average-difference="drillAverageDifference"
        @save="handleDrillSave"
        @discard="handleDrillDiscard"
      />
    </div>

    <ConfirmationModal
      :visible="showQuitModal"
      title="Quit Practice"
      message="Are you sure you want to quit? All progress will be lost."
      @confirm="handleQuitConfirm"
      @cancel="showQuitModal = false"
    />
  </main>
</template>

<style scoped>
.practice-wrapper {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.practice-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background-color: #1f2937;
  border-radius: 8px;
}

.new-session-row {
  display: flex;
  justify-content: center;
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

@media (max-width: 480px) {
  .practice-container {
    gap: 10px;
    padding: 12px;
  }
}
</style>
