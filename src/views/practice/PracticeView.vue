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

type SetupPhase = 'mode' | 'combos' | 'shots'
type WizardPhase = SetupPhase | 'entry' | 'summary'

const PHASE_LABELS: Record<WizardPhase, string> = {
  mode: 'Mode',
  combos: 'Combos',
  shots: 'Shots',
  entry: 'Play',
  summary: 'Done',
}

const logStore = usePracticeLogStore()
const gauntletStore = usePracticeGauntletStore()
const drillStore = usePracticeDrillStore()
const matrixStore = useMatrixConfigurationStore()

const showQuitModal = ref(false)
const inWizard = ref(false)
const setupPhase = ref<SetupPhase>('mode')
const selectedMode = ref<PracticeMode | null>(null)
const selectedShotCount = ref<PracticeShotCount | null>(null)
const selectedCombos = ref<DrillCombo[]>([])

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
const showWizard = computed(() => inWizard.value || hasActiveSession.value)

const activeMode = computed<PracticeMode | null>(() => {
  if (session.value) return 'gauntlet'
  if (drillSession.value) return 'drill'
  return selectedMode.value
})

const currentPhase = computed<WizardPhase>(() => {
  if (isComplete.value || isDrillComplete.value) return 'summary'
  if (isActive.value || isDrillActive.value) return 'entry'
  return setupPhase.value
})

const phaseSeq = computed<WizardPhase[]>(() =>
  activeMode.value === 'drill'
    ? ['mode', 'combos', 'entry', 'summary']
    : ['mode', 'shots', 'entry', 'summary'],
)

const stages = computed(() => {
  const curIdx = phaseSeq.value.indexOf(currentPhase.value)
  return phaseSeq.value.map((phase, i) => ({
    phase,
    label: PHASE_LABELS[phase],
    num: i + 1,
    isCurrent: i === curIdx,
    isDone: i < curIdx,
    isLast: i === phaseSeq.value.length - 1,
  }))
})

const wizardEyebrow = computed(() => {
  if (activeMode.value === 'drill') return 'Drill mode'
  if (activeMode.value === 'gauntlet') return 'Gauntlet mode'
  return 'Practice'
})

// ===== Log home summary stats =====
const sessionCount = computed(() => practiceLog.value.length)
const bestAvg = computed(() => {
  if (practiceLog.value.length === 0) return '—'
  return Math.min(...practiceLog.value.map((s) => s.average_difference)) + ' yd'
})
const shotsHit = computed(() => practiceLog.value.reduce((sum, s) => sum + s.shot_count, 0))

// ===== Footer navigation =====
const footerVisible = computed(() => ['mode', 'combos', 'shots'].includes(currentPhase.value))
const footerHasBack = computed(() => currentPhase.value !== 'mode')
const footerNextDisabled = computed(() => {
  if (currentPhase.value === 'mode') return selectedMode.value === null
  if (currentPhase.value === 'combos') return selectedCombos.value.length === 0
  if (currentPhase.value === 'shots') return selectedShotCount.value === null
  return true
})

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
  inWizard.value = true
  setupPhase.value = 'mode'
  selectedMode.value = null
  selectedShotCount.value = null
  selectedCombos.value = []
}

function exitWizard() {
  inWizard.value = false
  logStore.fetchPracticeLog()
}

function handleFooterBack() {
  if (currentPhase.value === 'combos' || currentPhase.value === 'shots') {
    setupPhase.value = 'mode'
  }
}

function handleFooterNext() {
  if (footerNextDisabled.value) return
  if (currentPhase.value === 'mode') {
    setupPhase.value = selectedMode.value === 'drill' ? 'combos' : 'shots'
  } else if (currentPhase.value === 'combos') {
    drillStore.startDrill(selectedCombos.value)
  } else if (currentPhase.value === 'shots' && selectedShotCount.value !== null) {
    gauntletStore.startPractice(selectedShotCount.value)
  }
}

function handleQuitConfirm() {
  if (session.value) {
    gauntletStore.clearSession()
  } else if (drillSession.value) {
    drillStore.clearDrillSession()
  }
  showQuitModal.value = false
  inWizard.value = false
  logStore.fetchPracticeLog()
}

async function handleSave() {
  await gauntletStore.saveSession()
  // saveSession unshifts the new record into the log on success and clears the
  // session; exit the wizard without refetching so we don't clobber it.
  if (!gauntletStore.session) {
    inWizard.value = false
  }
}

async function handleDrillSave() {
  await drillStore.saveDrillSession()
  if (!drillStore.drillSession) {
    inWizard.value = false
  }
}

function handleDiscard() {
  gauntletStore.clearSession()
  inWizard.value = false
  logStore.fetchPracticeLog()
}

function handleDrillDiscard() {
  drillStore.clearDrillSession()
  inWizard.value = false
  logStore.fetchPracticeLog()
}
</script>

<template>
  <main class="practice-shell wider-page-content">
    <div class="practice-orbit" aria-hidden="true" />

    <div class="practice-inner">
      <!-- ============ LOG HOME ============ -->
      <template v-if="!showWizard">
        <header class="log-header">
          <div>
            <div class="eyebrow">Practice</div>
            <h1 class="page-title">Practice Log</h1>
          </div>
          <button
            type="button"
            class="new-session-button"
            data-test-id="new-practice-session-button"
            @click="handleNewSession"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.6"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Session
          </button>
        </header>

        <div class="summary-stats">
          <div class="summary-card">
            <div class="summary-label">Sessions</div>
            <div class="summary-value">{{ sessionCount }}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Best avg</div>
            <div class="summary-value summary-value-accent">{{ bestAvg }}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Shots hit</div>
            <div class="summary-value">{{ shotsHit }}</div>
          </div>
        </div>

        <PracticeLog
          :sessions="practiceLog"
          :error="logError"
          @delete="logStore.deleteSession($event)"
          @retry="logStore.fetchPracticeLog()"
        />
      </template>

      <!-- ============ WIZARD ============ -->
      <template v-else>
        <header class="wizard-header">
          <button
            v-if="!hasActiveSession"
            type="button"
            class="back-arrow"
            title="Back to log"
            data-test-id="wizard-exit-button"
            @click="exitWizard"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div class="eyebrow">{{ wizardEyebrow }}</div>
            <h1 class="wizard-title">New Session</h1>
          </div>
        </header>

        <nav class="stepper" aria-label="Practice steps">
          <template v-for="stage in stages" :key="stage.phase">
            <div class="step" :class="{ 'is-current': stage.isCurrent, 'is-done': stage.isDone }">
              <span class="step-circle">{{ stage.isDone ? '✓' : stage.num }}</span>
              <span class="step-label">{{ stage.label }}</span>
            </div>
            <span
              v-if="!stage.isLast"
              class="step-bar"
              :class="{ 'is-done': stage.isDone }"
              aria-hidden="true"
            />
          </template>
        </nav>

        <div class="wizard-card">
          <!-- Setup: mode -->
          <PracticeModeSelector
            v-if="currentPhase === 'mode'"
            :selected="selectedMode"
            @select="selectedMode = $event"
          />

          <!-- Setup: combos (drill) -->
          <DrillComboSelector
            v-else-if="currentPhase === 'combos'"
            :combos="availableCombos"
            @update:selected="selectedCombos = $event"
          />

          <!-- Setup: shots (gauntlet) -->
          <PracticeShotCountSelector
            v-else-if="currentPhase === 'shots'"
            :selected="selectedShotCount"
            @select="selectedShotCount = $event"
          />

          <!-- Active: gauntlet entry -->
          <template v-else-if="isActive && currentShot">
            <PracticeProgress
              :current-shot="currentShotNumber"
              :total-shots="totalShots"
              :percent="progressPercent"
            />
            <PracticeShotEntry
              :shot="currentShot"
              :is-first-shot="session!.currentShotIndex === 0"
              :is-last-shot="session!.currentShotIndex === totalShots - 1"
              @update-carry="gauntletStore.setActualCarry($event)"
              @next="gauntletStore.advanceShot()"
              @back="gauntletStore.goBackShot()"
              @quit="showQuitModal = true"
            />
          </template>

          <!-- Active: drill entry -->
          <template v-else-if="isDrillActive && drillCurrentStep">
            <PracticeProgress
              :current-shot="drillCurrentStepNumber"
              :total-shots="drillTotalSteps"
              :percent="drillProgressPercent"
            />
            <DrillShotEntry
              :step="drillCurrentStep"
              :is-first-step="drillSession!.currentStepIndex === 0"
              :is-last-step="drillSession!.currentStepIndex === drillTotalSteps - 1"
              @update-carry="(idx: number, val: string) => drillStore.setDrillCarry(idx, val)"
              @next="drillStore.advanceDrillStep()"
              @back="drillStore.goBackDrillStep()"
              @quit="showQuitModal = true"
            />
          </template>

          <!-- Complete: gauntlet summary -->
          <PracticeReview
            v-else-if="isComplete && session"
            :shots="session.shots"
            :average-difference="averageDifference"
            @save="handleSave"
            @discard="handleDiscard"
          />

          <!-- Complete: drill summary -->
          <DrillReview
            v-else-if="isDrillComplete && drillSession"
            :steps="drillSession.steps"
            :step-averages="drillStepAverages"
            :average-difference="drillAverageDifference"
            @save="handleDrillSave"
            @discard="handleDrillDiscard"
          />
        </div>

        <!-- Footer nav (setup phases only) -->
        <div v-if="footerVisible" class="wizard-footer">
          <button
            v-if="footerHasBack"
            type="button"
            class="footer-btn footer-btn-back"
            data-test-id="wizard-back-button"
            @click="handleFooterBack"
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
            class="footer-btn footer-btn-next"
            data-test-id="wizard-next-button"
            :disabled="footerNextDisabled"
            @click="handleFooterNext"
          >
            Next
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
      </template>
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
.practice-shell {
  position: relative;
  width: 100%;
  padding: 40px 32px 64px;
  color: #f4f6fb;
  font-family: 'Archivo', system-ui, sans-serif;
  overflow: hidden;
}

.practice-inner {
  position: relative;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
}

.practice-orbit {
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

.eyebrow {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11.5px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #8b8cf6;
  margin-bottom: 10px;
}

/* Log home header */
.log-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin: 0;
}

.new-session-button {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  background: #8b8cf6;
  color: #0a0e1a;
  border: none;
  font-weight: 700;
  font-size: 15px;
  padding: 14px 22px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.14s;
}

.new-session-button:hover {
  transform: translateY(-1px);
}

/* Summary stats */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.summary-card {
  background: #0f1525;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 18px 20px;
}

.summary-label {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #828aa0;
  margin-bottom: 8px;
}

.summary-value {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.summary-value-accent {
  color: #8b8cf6;
}

/* Wizard header */
.wizard-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.back-arrow {
  width: 40px;
  height: 40px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 11px;
  color: #aab2c5;
  cursor: pointer;
  transition: all 0.14s;
}

.back-arrow:hover {
  border-color: rgba(255, 255, 255, 0.28);
  color: #f4f6fb;
}

.wizard-header .eyebrow {
  margin-bottom: 4px;
}

.wizard-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin: 0;
}

/* Stepper */
.stepper {
  display: flex;
  align-items: center;
  margin-bottom: 26px;
  flex-wrap: wrap;
}

.step {
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-circle {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11.5px;
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

/* Wizard card */
.wizard-card {
  background: linear-gradient(180deg, #10162a, #0c1120);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 20px;
  padding: 36px 40px;
  min-height: 320px;
  box-shadow: 0 30px 70px -34px rgba(0, 0, 0, 0.7);
}

/* Wizard footer */
.wizard-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 24px;
}

.footer-btn {
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

.footer-btn-back {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f4f6fb;
  font-weight: 600;
  padding: 13px 24px;
}

.footer-btn-back:hover {
  border-color: rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.06);
}

.footer-btn-next {
  background: #8b8cf6;
  border: none;
  color: #0a0e1a;
  padding: 13px 30px;
}

.footer-btn-next:hover {
  transform: translateY(-1px);
}

.footer-btn-next:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.footer-btn-next:disabled:hover {
  transform: none;
}

@media (max-width: 640px) {
  .practice-shell {
    padding: 24px 16px 48px;
  }

  .page-title {
    font-size: 26px;
  }

  .summary-stats {
    gap: 10px;
  }

  .summary-card {
    padding: 14px 16px;
  }

  .summary-value {
    font-size: 22px;
  }

  .wizard-card {
    padding: 24px 18px;
  }
}
</style>
