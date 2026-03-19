<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePracticeLogStore } from '@/stores/practice/practiceLogStore.ts'
import { usePracticeGauntletStore } from '@/stores/practice/practiceGauntletStore.ts'
import { usePracticeDrillStore } from '@/stores/practice/practiceDrillStore.ts'
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

const logStore = usePracticeLogStore()
const gauntletStore = usePracticeGauntletStore()
const drillStore = usePracticeDrillStore()
const matrixStore = useMatrixConfigurationStore()
const showQuitModal = ref(false)
const showModeSelector = ref(false)
const showShotCountSelector = ref(false)
const showComboSelector = ref(false)

const { practiceLog, logError } = storeToRefs(logStore)

const {
  session,
  isActive,
  isComplete,
  totalShots,
  currentShotNumber,
  currentShot,
  progressPercent,
  averageDifference,
} = storeToRefs(gauntletStore)

const {
  drillSession,
  isDrillActive,
  isDrillComplete,
  drillTotalSteps,
  drillCurrentStepNumber,
  drillCurrentStep,
  drillProgressPercent,
  drillStepAverages,
  drillAverageDifference,
} = storeToRefs(drillStore)

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
    logStore.fetchPracticeLog()
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
  gauntletStore.startPractice(shotCount)
  if (gauntletStore.session) {
    showShotCountSelector.value = false
  }
}

function handleSelectCombos(combos: DrillCombo[]) {
  drillStore.startDrill(combos)
  if (drillStore.drillSession) {
    showComboSelector.value = false
  }
}

function handleComboBack() {
  showComboSelector.value = false
  showModeSelector.value = true
}

function handleQuitConfirm() {
  if (session.value) {
    gauntletStore.clearSession()
  } else if (drillSession.value) {
    drillStore.clearDrillSession()
  }
  showQuitModal.value = false
  logStore.fetchPracticeLog()
}

async function handleSave() {
  await gauntletStore.saveSession()
}

async function handleDrillSave() {
  await drillStore.saveDrillSession()
}

function handleDiscard() {
  gauntletStore.clearSession()
  logStore.fetchPracticeLog()
}

function handleDrillDiscard() {
  drillStore.clearDrillSession()
  logStore.fetchPracticeLog()
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
            @delete="logStore.deleteSession($event)"
            @retry="logStore.fetchPracticeLog()"
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
          @update-carry="gauntletStore.setActualCarry($event)"
          @next="gauntletStore.advanceShot()"
          @back="gauntletStore.goBackShot()"
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
          @update-carry="(idx: number, val: string) => drillStore.setDrillCarry(idx, val)"
          @next="drillStore.advanceDrillStep()"
          @back="drillStore.goBackDrillStep()"
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
