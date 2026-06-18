<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { useTutorialStore } from '@/stores/tutorial/tutorialStore.ts'
import { useUserStore } from '@/stores/user/userStore.ts'
import {
  CLUB_LABELS,
  CLOCK_OPTIONS,
  PERCENTAGE_OPTIONS,
  type AllowableMatrixColumnNumber,
  type ClubLabel,
  type RowDisplayOption,
} from '@/types/matrix'

type StepIndex = 0 | 1 | 2 | 3

const STEP_LABELS = ['Clubs', 'Labels', 'Columns', 'Display'] as const
const COLUMN_OPTIONS: AllowableMatrixColumnNumber[] = [1, 2, 3, 4]
const ROW_OPTIONS: { id: RowDisplayOption; label: string; desc: string }[] = [
  { id: 'Carry', label: 'Carry only', desc: 'Distance the ball flies in the air' },
  { id: 'Total', label: 'Total only', desc: 'Carry plus roll-out on landing' },
  { id: 'Both', label: 'Both', desc: 'Track carry and total side by side' },
]
const CLUB_SUBTITLES: Record<ClubLabel, string> = {
  LW: 'Lob',
  SW: 'Sand',
  GW: 'Gap',
  AW: 'Approach',
  UW: 'Utility',
  PW: 'Pitch',
}

const router = useRouter()
const matrixStore = useMatrixConfigurationStore()
const tutorialStore = useTutorialStore()
const userStore = useUserStore()
const {
  setSelectedClubs,
  setClubLoft,
  setClubLabelDisplayMode,
  setNumberOfMatrixColumns,
  setSwingFeelSystem,
  setMatrixColumnHeader,
  setSelectedRowDisplayOption,
  synchronizeValues,
  switchMatrix,
} = matrixStore
const {
  selectedClubs,
  clubLofts,
  clubLabelDisplayMode,
  matrixColumns,
  matrixColumnHeaders,
  swingFeelSystem,
  selectedRowDisplayOption,
  syncError,
  selectedMatrixId,
} = storeToRefs(matrixStore)

const step = ref<StepIndex>(0)
const isSaving = ref(false)

const matrices = computed(() => userStore.user?.wedge_matrices ?? [])

const headerVals = computed(() =>
  swingFeelSystem.value === 'Clock' ? [...CLOCK_OPTIONS] : [...PERCENTAGE_OPTIONS],
)

const previewGrid = computed(() => '60px repeat(' + matrixColumns.value + ', minmax(0, 1fr))')

const previewCols = computed(() =>
  Array.from({ length: matrixColumns.value }, (_, i) => matrixColumnHeaders.value[i] || '—'),
)

const previewRows = computed(() =>
  selectedClubs.value.map((club, clubIndex) => ({
    label:
      clubLabelDisplayMode.value === 'loft' && clubLofts.value[clubIndex] != null
        ? clubLofts.value[clubIndex] + '°'
        : club,
    cells: Array.from({ length: matrixColumns.value }, (_, colIndex) => ({
      carry: matrixStore.yardageValues[clubIndex]?.[colIndex]?.carry_value ?? null,
      total: matrixStore.yardageValues[clubIndex]?.[colIndex]?.total_value ?? null,
    })),
  })),
)

const showCarry = computed(
  () => selectedRowDisplayOption.value === 'Carry' || selectedRowDisplayOption.value === 'Both',
)
const showTotal = computed(
  () => selectedRowDisplayOption.value === 'Total' || selectedRowDisplayOption.value === 'Both',
)

const previewCaption = computed(() => {
  const word =
    selectedRowDisplayOption.value === 'Both'
      ? 'carry + total'
      : selectedRowDisplayOption.value.toLowerCase()
  return selectedClubs.value.length + ' clubs · ' + matrixColumns.value + ' swings · ' + word
})

function goToStep(i: StepIndex) {
  step.value = i
}

function toggleClub(club: ClubLabel) {
  const current = selectedClubs.value
  const idx = current.indexOf(club)
  if (idx >= 0) {
    if (current.length <= 1) return
    setSelectedClubs(current.filter((c) => c !== club))
  } else {
    setSelectedClubs([...current, club])
  }
}

function handleLoftInput(index: number, event: Event) {
  const raw = (event.target as HTMLInputElement).value.trim()
  if (raw === '') {
    setClubLoft(index, null)
    return
  }
  const parsed = parseInt(raw, 10)
  if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 90) {
    setClubLoft(index, parsed)
  }
}

async function handleMatrixSwitch(event: Event) {
  const matrixId = Number((event.target as HTMLSelectElement).value)
  await switchMatrix(matrixId, matrices.value)
}

async function onNext() {
  if (step.value < 3) {
    step.value = (step.value + 1) as StepIndex
    return
  }
  if (isSaving.value) return
  isSaving.value = true
  try {
    await synchronizeValues()
    if (!syncError.value) {
      // Tutorial step 1 = "in configure phase" (no overlay here); jumping to 2
      // is what triggers the multi-matrix highlight on /matrix.
      if (tutorialStore.tutorialStep === 1) {
        tutorialStore.tutorialStep = 2
      }
      await router.push('/matrix')
    }
  } finally {
    isSaving.value = false
  }
}

function onBack() {
  if (step.value > 0) step.value = (step.value - 1) as StepIndex
}

onBeforeUnmount(async () => {
  await synchronizeValues()
})
</script>

<template>
  <main class="configure-shell wider-page-content">
    <div class="configure-orbit" aria-hidden="true" />

    <div class="configure-inner">
      <header class="page-header">
        <div>
          <div class="eyebrow">Guided setup</div>
          <h1 class="page-title">Configure</h1>
        </div>
        <div class="matrix-pill" data-test-id="matrix-selector">
          <span class="pill-label">Editing</span>
          <select
            class="pill-select"
            :value="selectedMatrixId ?? ''"
            data-test-id="matrix-dropdown"
            @change="handleMatrixSwitch"
          >
            <option v-for="(matrix, index) in matrices" :key="matrix.id" :value="matrix.id">
              {{ matrix.label ?? 'Matrix ' + (index + 1) }}
            </option>
          </select>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            class="pill-chevron"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </header>

      <p v-if="syncError" class="error-message" data-test-id="sync-error-message">
        {{ syncError }}
      </p>

      <nav class="stepper" aria-label="Configuration steps">
        <template v-for="(label, i) in STEP_LABELS" :key="label">
          <button
            type="button"
            class="step"
            :class="{
              'is-current': i === step,
              'is-done': i < step,
            }"
            :data-test-id="'step-' + label.toLowerCase()"
            @click="goToStep(i as StepIndex)"
          >
            <span class="step-circle">{{ i < step ? '✓' : i + 1 }}</span>
            <span class="step-label">{{ label }}</span>
          </button>
          <span
            v-if="i < STEP_LABELS.length - 1"
            class="step-bar"
            :class="{ 'is-done': i < step }"
            aria-hidden="true"
          />
        </template>
      </nav>

      <div class="body">
        <div class="step-panel">
          <template v-if="step === 0">
            <div class="step-header-eyebrow">Step 1 of 4</div>
            <h2 class="step-title">Which wedges are in your bag?</h2>
            <p class="step-desc">
              Tap each wedge you carry. You can fine-tune lofts in the next step.
            </p>
            <div class="club-grid">
              <button
                v-for="club in CLUB_LABELS"
                :key="club"
                type="button"
                class="club-tile"
                :class="selectedClubs.includes(club) ? 'tile-active' : 'tile'"
                :data-test-id="'club-selector-' + club"
                @click="toggleClub(club)"
              >
                <span class="club-tile-label">{{ club }}</span>
                <span class="club-tile-sub">{{ CLUB_SUBTITLES[club] }}</span>
              </button>
            </div>
          </template>

          <template v-else-if="step === 1">
            <div class="step-header-eyebrow">Step 2 of 4</div>
            <h2 class="step-title">How should rows be labeled?</h2>
            <p class="step-desc">
              Show the club name, or the loft in degrees. Set each loft below.
            </p>
            <div class="segmented-pill">
              <button
                type="button"
                class="seg-button"
                :class="{ 'is-active': clubLabelDisplayMode === 'title' }"
                data-test-id="display-mode-title"
                @click="setClubLabelDisplayMode('title')"
              >
                Club name
              </button>
              <button
                type="button"
                class="seg-button"
                :class="{ 'is-active': clubLabelDisplayMode === 'loft' }"
                data-test-id="display-mode-loft"
                @click="setClubLabelDisplayMode('loft')"
              >
                Loft
              </button>
            </div>
            <div class="loft-list" data-test-id="loft-inputs-section">
              <div v-for="(club, index) in selectedClubs" :key="club" class="loft-row">
                <span class="loft-club">{{ club }}</span>
                <div class="loft-input-wrap">
                  <input
                    type="number"
                    class="loft-input"
                    :data-test-id="'loft-input-' + club"
                    :value="clubLofts[index] ?? ''"
                    min="1"
                    max="90"
                    placeholder="—"
                    @change="handleLoftInput(index, $event)"
                  />
                  <span class="loft-degree">°</span>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="step === 2">
            <div class="step-header-eyebrow">Step 3 of 4</div>
            <h2 class="step-title">Set your swing lengths.</h2>
            <p class="step-desc">Pick how many swings to track, and how the columns are labeled.</p>
            <div class="subsection-label">Number of columns</div>
            <div class="col-count-row">
              <button
                v-for="n in COLUMN_OPTIONS"
                :key="n"
                type="button"
                class="col-count-tile"
                :class="matrixColumns === n ? 'tile-active' : 'tile'"
                :data-test-id="'column-count-' + n"
                @click="setNumberOfMatrixColumns(n)"
              >
                {{ n }}
              </button>
            </div>

            <div class="subsection-label">Header style</div>
            <div class="segmented-pill">
              <button
                type="button"
                class="seg-button"
                :class="{ 'is-active': swingFeelSystem === 'Percentage' }"
                data-test-id="swing-feel-system-Percentage"
                @click="setSwingFeelSystem('Percentage')"
              >
                Percentage
              </button>
              <button
                type="button"
                class="seg-button"
                :class="{ 'is-active': swingFeelSystem === 'Clock' }"
                data-test-id="swing-feel-system-Clock"
                @click="setSwingFeelSystem('Clock')"
              >
                Clock
              </button>
            </div>

            <div class="header-list">
              <div
                v-for="i in matrixColumns"
                :key="i"
                class="header-row"
                data-test-id="column-label-selector-pair"
              >
                <span class="header-row-label">Column {{ i }}</span>
                <div class="select-wrap">
                  <select
                    class="header-select"
                    data-test-id="column-header-selector"
                    :value="matrixColumnHeaders[i - 1] ?? ''"
                    @change="
                      setMatrixColumnHeader(($event.target as HTMLSelectElement).value, i - 1)
                    "
                  >
                    <option v-for="opt in headerVals" :key="opt" :value="opt">
                      {{ opt }}
                    </option>
                  </select>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    class="select-chevron"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="step-header-eyebrow">Step 4 of 4</div>
            <h2 class="step-title">What goes in each cell?</h2>
            <p class="step-desc">
              Choose whether to record carry distance, total distance, or both.
            </p>
            <div class="row-option-list">
              <button
                v-for="opt in ROW_OPTIONS"
                :key="opt.id"
                type="button"
                class="row-option"
                :class="selectedRowDisplayOption === opt.id ? 'tile-active' : 'tile'"
                :data-test-id="'row-display-option-' + opt.id"
                @click="setSelectedRowDisplayOption(opt.id)"
              >
                <span
                  class="row-option-dot"
                  :class="{ 'is-selected': selectedRowDisplayOption === opt.id }"
                  aria-hidden="true"
                >
                  <span class="row-option-dot-fill" />
                </span>
                <span class="row-option-text">
                  <span class="row-option-label">{{ opt.label }}</span>
                  <span class="row-option-desc">{{ opt.desc }}</span>
                </span>
              </button>
            </div>
          </template>
        </div>

        <aside class="preview-panel" aria-label="Live preview">
          <div class="preview-header">
            <span class="preview-eyebrow">Live preview</span>
            <span class="preview-dot" aria-hidden="true" />
          </div>
          <div class="preview-frame">
            <div class="preview-grid" :style="{ gridTemplateColumns: previewGrid }">
              <div class="preview-cell preview-corner">Club</div>
              <div
                v-for="(headerLabel, i) in previewCols"
                :key="'pc-' + i"
                class="preview-cell preview-col-header"
              >
                {{ headerLabel }}
              </div>
              <template v-for="row in previewRows" :key="row.label">
                <div class="preview-cell preview-row-label">{{ row.label }}</div>
                <div
                  v-for="(cell, i) in row.cells"
                  :key="'cv-' + row.label + '-' + i"
                  class="preview-cell preview-value-cell"
                >
                  <div v-if="showCarry" class="preview-carry">
                    {{ cell.carry ?? '—' }}
                  </div>
                  <div v-if="showTotal" class="preview-total">
                    {{ cell.total ?? '—' }}
                  </div>
                </div>
              </template>
            </div>
          </div>
          <div class="preview-caption">{{ previewCaption }}</div>
        </aside>
      </div>

      <div class="footer-nav">
        <button
          type="button"
          class="footer-button back-button"
          :class="{ 'is-disabled': step === 0 }"
          :disabled="step === 0"
          data-test-id="wizard-back-button"
          @click="onBack"
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
        <div class="dots" aria-hidden="true">
          <span
            v-for="(_, i) in STEP_LABELS"
            :key="'d-' + i"
            class="dot"
            :class="{ 'is-active': i === step }"
          />
        </div>
        <button
          type="button"
          class="footer-button next-button"
          :disabled="isSaving"
          data-test-id="wizard-next-button"
          @click="onNext"
        >
          {{ step === 3 ? 'Save matrix' : 'Continue' }}
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
    </div>
  </main>
</template>

<style scoped>
.configure-shell {
  position: relative;
  width: 100%;
  padding: 40px 32px 64px;
  color: #f4f6fb;
  font-family: 'Archivo', system-ui, sans-serif;
  overflow: hidden;
}

.configure-inner {
  position: relative;
  width: 100%;
  max-width: 1020px;
  margin: 0 auto;
}

.configure-orbit {
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
  margin-bottom: 24px;
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

.matrix-pill {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0f1525;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 11px;
  padding: 11px 16px;
  font-size: 14.5px;
  font-weight: 600;
  color: #f4f6fb;
  transition: border-color 0.14s;
}

.matrix-pill:hover {
  border-color: rgba(255, 255, 255, 0.24);
}

.pill-label {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
  color: #828aa0;
  font-weight: 500;
}

.pill-select {
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  border: none;
  outline: none;
  color: inherit;
  font: inherit;
  padding-right: 18px;
  cursor: pointer;
}

.pill-select option {
  background: #0f1525;
  color: #f4f6fb;
}

.pill-chevron {
  color: #828aa0;
  pointer-events: none;
  margin-left: -8px;
}

.error-message {
  color: #ef6c6c;
  font-size: 14px;
  text-align: center;
  margin: 0 0 12px;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.step {
  display: flex;
  align-items: center;
  gap: 11px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.step-circle {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.05);
  color: #828aa0;
  transition: all 0.16s;
}

.step-label {
  font-size: 14px;
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
  min-width: 18px;
  height: 2px;
  border-radius: 2px;
  margin: 0 14px;
  background: rgba(255, 255, 255, 0.08);
  transition: background 0.16s;
}

.step-bar.is-done {
  background: rgba(139, 140, 246, 0.4);
}

.body {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 22px;
  align-items: start;
}

.step-panel {
  background: linear-gradient(180deg, #10162a, #0c1120);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 20px;
  padding: 32px 34px;
  min-height: 360px;
  box-shadow: 0 30px 70px -34px rgba(0, 0, 0, 0.7);
  animation: stepFade 0.28s ease both;
}

@keyframes stepFade {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-header-eyebrow {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #8b8cf6;
  margin-bottom: 8px;
}

.step-title {
  font-size: 23px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 8px;
}

.step-desc {
  font-size: 15px;
  color: #aab2c5;
  line-height: 1.55;
  margin: 0 0 26px;
}

.subsection-label {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #828aa0;
  margin: 4px 0 10px;
}

/* Clubs step */
.club-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.club-tile {
  position: relative;
  min-width: 84px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  padding: 16px 18px;
  border-radius: 14px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #aab2c5;
  transition: all 0.14s;
}

.club-tile.tile-active {
  background: #8b8cf6;
  border-color: #8b8cf6;
  color: #0a0e1a;
}

.club-tile-label {
  font-weight: 700;
  font-size: 17px;
  letter-spacing: 0.02em;
}

.club-tile-sub {
  font-size: 11px;
  opacity: 0.7;
}

/* Labels step */
.segmented-pill {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 11px;
  padding: 4px;
  gap: 3px;
  margin-bottom: 22px;
}

.seg-button {
  font-family: inherit;
  font-weight: 600;
  font-size: 14px;
  padding: 9px 22px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  color: #aab2c5;
  transition: all 0.14s;
}

.seg-button.is-active {
  background: #8b8cf6;
  color: #0a0e1a;
}

.loft-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
}

.loft-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.loft-club {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 14px;
  font-weight: 700;
  color: #cdd3e0;
}

.loft-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loft-input {
  width: 74px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 12px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 14px;
  color: #f4f6fb;
  text-align: center;
  transition: border-color 0.14s;
  -moz-appearance: textfield;
}

.loft-input::-webkit-inner-spin-button,
.loft-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.loft-input:focus {
  outline: none;
  border-color: #8b8cf6;
}

.loft-degree {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 14px;
  color: #828aa0;
  width: 14px;
}

/* Columns step */
.col-count-row {
  display: flex;
  gap: 10px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.col-count-tile {
  width: 54px;
  height: 54px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 18px;
  border-radius: 13px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #aab2c5;
  transition: all 0.14s;
}

.col-count-tile.tile-active {
  background: #8b8cf6;
  border-color: #8b8cf6;
  color: #0a0e1a;
}

.header-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 360px;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-row-label {
  font-size: 14px;
  font-weight: 600;
  color: #cdd3e0;
}

.select-wrap {
  position: relative;
}

.header-select {
  appearance: none;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 9px 38px 9px 16px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 14px;
  font-weight: 500;
  color: #f4f6fb;
  cursor: pointer;
  transition: border-color 0.14s;
}

.header-select:focus {
  outline: none;
  border-color: #8b8cf6;
}

.header-select option {
  background: #0f1525;
  color: #f4f6fb;
}

.select-chevron {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #828aa0;
  pointer-events: none;
}

/* Display step */
.row-option-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 380px;
}

.row-option {
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
  padding: 16px 18px;
  border-radius: 14px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: inherit;
  transition: all 0.14s;
}

.row-option.tile-active {
  background: rgba(139, 140, 246, 0.1);
  border-color: #8b8cf6;
}

.row-option-dot {
  width: 20px;
  height: 20px;
  flex: none;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.14s;
}

.row-option-dot.is-selected {
  border-color: #8b8cf6;
}

.row-option-dot-fill {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: transparent;
  transition: background 0.14s;
}

.row-option-dot.is-selected .row-option-dot-fill {
  background: #8b8cf6;
}

.row-option-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-option-label {
  font-weight: 700;
  font-size: 15.5px;
  color: #f4f6fb;
}

.row-option-desc {
  font-size: 13px;
  color: #828aa0;
}

/* Preview panel */
.preview-panel {
  position: sticky;
  top: 24px;
  background: #0c1120;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 30px 70px -40px rgba(0, 0, 0, 0.7);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.preview-eyebrow {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 10.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #828aa0;
}

.preview-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #8b8cf6;
  box-shadow: 0 0 0 3px rgba(139, 140, 246, 0.18);
}

.preview-frame {
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  overflow: hidden;
}

.preview-grid {
  display: grid;
}

.preview-cell {
  padding: 10px 6px;
  text-align: center;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 1px solid rgba(255, 255, 255, 0.05);
}

.preview-corner,
.preview-col-header,
.preview-row-label {
  background: rgba(255, 255, 255, 0.02);
}

.preview-corner {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #828aa0;
  text-align: left;
  padding-left: 10px;
  border-top: none;
  border-left: none;
}

.preview-col-header {
  font-size: 12px;
  font-weight: 700;
  color: #8b8cf6;
  border-top: none;
}

.preview-row-label {
  font-family: 'Archivo', system-ui, sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #f4f6fb;
  text-align: left;
  padding-left: 10px;
  border-left: none;
}

.preview-carry {
  font-size: 13px;
  font-weight: 500;
  color: #f4f6fb;
}

.preview-total {
  font-size: 12px;
  color: #7e879c;
}

.preview-caption {
  margin-top: 12px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 10px;
  color: #5b6276;
  letter-spacing: 0.04em;
}

/* Footer nav */
.footer-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 26px;
}

.footer-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 600;
  font-size: 15px;
  padding: 13px 22px;
  border-radius: 12px;
  cursor: pointer;
  transition:
    border-color 0.14s,
    background 0.14s,
    transform 0.14s;
}

.back-button {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f4f6fb;
}

.back-button:hover:not(.is-disabled):not(:disabled) {
  border-color: rgba(255, 255, 255, 0.28);
}

.back-button.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #5b6276;
}

.next-button {
  background: #8b8cf6;
  color: #0a0e1a;
  border: none;
  font-weight: 700;
  padding: 13px 26px;
}

.next-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.next-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dots {
  display: flex;
  gap: 7px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  transition: background 0.16s;
}

.dot.is-active {
  background: #8b8cf6;
}

@media (max-width: 980px) {
  .body {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    position: static;
  }
}

@media (max-width: 640px) {
  .configure-shell {
    padding: 24px 16px 48px;
  }

  .step-panel {
    padding: 24px;
  }

  .page-title {
    font-size: 26px;
  }
}
</style>
