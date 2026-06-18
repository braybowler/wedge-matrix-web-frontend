<script setup lang="ts">
import ConfirmationModal from '@/components/matrix/ConfirmationModal.vue'
import MatrixSelector from '@/components/matrix/MatrixSelector.vue'
import YardageInput from '@/components/matrix/YardageInput.vue'
import TutorialHighlight from '@/components/tutorial/TutorialHighlight.vue'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { useTutorialStore } from '@/stores/tutorial/tutorialStore.ts'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const matrixConfigurationStore = useMatrixConfigurationStore()
const { setYardageValue, clearYardageValues, downloadMatrix, synchronizeValues } =
  matrixConfigurationStore
const {
  matrixColumns,
  matrixColumnHeaders,
  selectedRowDisplayOption,
  yardageValues,
  syncError,
  selectedClubs,
  displayLabels,
  requiresSync,
} = storeToRefs(matrixConfigurationStore)

const showClearConfirm = ref(false)
const isDownloading = ref(false)
const isSyncing = ref(false)

const columnIndices = computed(() => Array.from({ length: matrixColumns.value }, (_, i) => i))
const gridTemplate = computed(() => '88px repeat(' + matrixColumns.value + ', minmax(0, 1fr))')

const handleClearMatrixButtonPress = () => {
  showClearConfirm.value = true
}

const handleClearConfirm = async () => {
  clearYardageValues()
  showClearConfirm.value = false
  await synchronizeValues()
}

const handleClearCancel = () => {
  showClearConfirm.value = false
}

const handleSync = async () => {
  if (isSyncing.value) return
  isSyncing.value = true
  try {
    await synchronizeValues()
  } finally {
    isSyncing.value = false
  }
}

const handleDownload = async () => {
  if (isDownloading.value) return
  isDownloading.value = true
  try {
    await downloadMatrix()
  } finally {
    isDownloading.value = false
  }
}

const emit = defineEmits<{
  finishTutorial: []
}>()

const tutorialStore = useTutorialStore()
const showMultiMatrixHighlight = computed(() => tutorialStore.tutorialStep === 2)
const showMatrixHighlight = computed(() => tutorialStore.tutorialStep === 3)

function handleBackToConfigure() {
  tutorialStore.previousStep()
  router.push('/configure')
}

function handleFinishTutorial() {
  emit('finishTutorial')
}
</script>

<template>
  <div class="matrix-shell">
    <div class="matrix-orbit" aria-hidden="true" />

    <div class="matrix-inner">
      <header class="page-header">
        <div>
          <h1 class="page-title">Wedge Matrix</h1>
        </div>
        <div class="units-control" aria-label="Units">
          <span class="units-label">Units</span>
          <div class="segmented">
            <button type="button" class="segmented-button is-active">YDS</button>
            <button type="button" class="segmented-button" disabled>M</button>
          </div>
        </div>
      </header>

      <TutorialHighlight
        :visible="showMultiMatrixHighlight"
        message="Create multiple matrices to track different setups. Use the buttons to add, rename, or delete matrices."
        button-label="Next"
        show-back
        @dismiss="tutorialStore.nextStep()"
        @back="handleBackToConfigure"
      >
        <MatrixSelector />
      </TutorialHighlight>

      <p v-if="syncError" class="error-message" data-test-id="sync-error-message">
        {{ syncError }}
      </p>

      <TutorialHighlight
        :visible="showMatrixHighlight"
        message="Enter your yardage values to build your personalized distance chart."
        button-label="Finish Tutorial"
        show-back
        @dismiss="handleFinishTutorial"
        @back="tutorialStore.previousStep()"
      >
        <div class="matrix-card">
          <div class="matrix-grid" :style="{ gridTemplateColumns: gridTemplate }">
            <div class="header-cell header-club">
              <span class="cell-eyebrow">Club</span>
            </div>
            <template v-for="colIndex in columnIndices" :key="'h-' + colIndex">
              <div class="header-cell header-swing" data-test-id="swing-percentage-container">
                <div class="swing-percentage">{{ matrixColumnHeaders[colIndex] }}</div>
                <div class="swing-subheaders">
                  <template v-if="selectedRowDisplayOption !== 'Both'">
                    <span class="cell-eyebrow swing-subheader">
                      {{ selectedRowDisplayOption }}
                    </span>
                  </template>
                  <template v-else>
                    <span class="cell-eyebrow swing-subheader">Carry</span>
                    <span class="cell-eyebrow swing-subheader">Total</span>
                  </template>
                </div>
              </div>
            </template>

            <template v-for="(club, clubIndex) in selectedClubs" :key="club">
              <div class="club-cell">
                <span class="club-name">{{ displayLabels[clubIndex] }}</span>
              </div>
              <template v-for="colIndex in columnIndices" :key="club + '-' + colIndex">
                <div class="value-cell">
                  <template v-if="selectedRowDisplayOption === 'Carry'">
                    <div class="value-stack">
                      <span class="value-tag">C</span>
                      <YardageInput
                        field="carry_value"
                        placeholder="C"
                        data-test-id="carry-input"
                        :value="yardageValues[clubIndex]?.[colIndex]?.carry_value ?? null"
                        @change="(field, raw) => setYardageValue(field, raw, clubIndex, colIndex)"
                      />
                    </div>
                  </template>
                  <template v-else-if="selectedRowDisplayOption === 'Total'">
                    <div class="value-stack">
                      <span class="value-tag">T</span>
                      <YardageInput
                        field="total_value"
                        placeholder="T"
                        data-test-id="total-input"
                        :value="yardageValues[clubIndex]?.[colIndex]?.total_value ?? null"
                        @change="(field, raw) => setYardageValue(field, raw, clubIndex, colIndex)"
                      />
                    </div>
                  </template>
                  <template v-else>
                    <div class="value-stack">
                      <span class="value-tag">C</span>
                      <YardageInput
                        field="carry_value"
                        placeholder="C"
                        data-test-id="carry-input"
                        :value="yardageValues[clubIndex]?.[colIndex]?.carry_value ?? null"
                        @change="(field, raw) => setYardageValue(field, raw, clubIndex, colIndex)"
                      />
                    </div>
                    <div class="value-stack">
                      <span class="value-tag">T</span>
                      <YardageInput
                        field="total_value"
                        placeholder="T"
                        data-test-id="total-input"
                        :value="yardageValues[clubIndex]?.[colIndex]?.total_value ?? null"
                        @change="(field, raw) => setYardageValue(field, raw, clubIndex, colIndex)"
                      />
                    </div>
                  </template>
                </div>
              </template>
            </template>
          </div>
        </div>
      </TutorialHighlight>

      <ConfirmationModal
        :visible="showClearConfirm"
        title="Clear Matrix"
        message="Are you sure you want to clear all records?"
        @confirm="handleClearConfirm"
        @cancel="handleClearCancel"
      />

      <div class="actions">
        <button
          type="button"
          class="action-button"
          data-test-id="clear-all-button"
          aria-label="Clear Matrix"
          @click="handleClearMatrixButtonPress"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
            />
          </svg>
          Clear
        </button>
        <button
          type="button"
          class="action-button"
          data-test-id="sync-button"
          aria-label="Sync"
          :disabled="isSyncing || !requiresSync"
          @click="handleSync"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Sync
        </button>
        <button
          type="button"
          class="action-button"
          data-test-id="download-pdf-button"
          aria-label="Export PDF"
          :disabled="isDownloading"
          @click="handleDownload"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.matrix-shell {
  position: relative;
  width: 100%;
  padding: 40px 32px 64px;
  color: #f4f6fb;
  font-family: 'Archivo', system-ui, sans-serif;
  overflow: hidden;
}

.matrix-inner {
  position: relative;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
}

.matrix-orbit {
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
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
  flex-wrap: wrap;
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

.units-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.units-label {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
  color: #828aa0;
}

.segmented {
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9px;
  padding: 3px;
  gap: 2px;
}

.segmented-button {
  background: transparent;
  color: #aab2c5;
  border: none;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.segmented-button.is-active {
  background: #8b8cf6;
  color: #0a0e1a;
  font-weight: 600;
}

.segmented-button[disabled] {
  cursor: not-allowed;
  opacity: 0.6;
}

.error-message {
  color: #ef6c6c;
  font-size: 14px;
  text-align: center;
  margin: 12px 0;
}

.matrix-card {
  margin-top: 18px;
  background: linear-gradient(180deg, #10162a, #0c1120);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 20px;
  padding: 8px;
  box-shadow: 0 30px 70px -34px rgba(0, 0, 0, 0.7);
}

.matrix-grid {
  display: grid;
  width: 100%;
}

.header-cell {
  padding: 16px 8px 14px;
  text-align: center;
}

.header-club {
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding-left: 16px;
}

.header-swing {
  border-left: 1px solid rgba(255, 255, 255, 0.05);
}

.cell-eyebrow {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5b6276;
}

.swing-percentage {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 18px;
  font-weight: 700;
  color: #8b8cf6;
  letter-spacing: -0.01em;
}

.swing-subheaders {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 7px;
}

.swing-subheader {
  color: #5b6276;
}

.club-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 0 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.club-name {
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.01em;
  color: #f4f6fb;
}

.value-cell {
  display: flex;
  gap: 7px;
  justify-content: center;
  padding: 14px 6px;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.value-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.value-tag {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 9px;
  color: #5b6276;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f4f6fb;
  font-family: inherit;
  font-weight: 600;
  font-size: 14.5px;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition:
    border-color 0.14s,
    background 0.14s,
    transform 0.14s;
}

.action-button:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-1px);
}

.action-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .matrix-shell {
    padding: 24px 16px 48px;
  }

  .page-title {
    font-size: 26px;
  }

  .header-club {
    padding-left: 8px;
  }

  .club-cell {
    padding: 0 8px;
  }

  .club-name {
    font-size: 16px;
  }

  .value-cell {
    padding: 12px 4px;
    gap: 4px;
  }

  .swing-percentage {
    font-size: 14px;
  }
}
</style>
