<script setup lang="ts">
import { CLUB_LABEL_DISPLAY_MODES } from '@/types/matrix'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { storeToRefs } from 'pinia'
import type { ClubLabelDisplayMode } from '@/types/matrix'

const matrixConfigurationStore = useMatrixConfigurationStore()
const { setClubLoft, setClubLabelDisplayMode } = matrixConfigurationStore
const { selectedClubs, clubLofts, clubLabelDisplayMode } = storeToRefs(matrixConfigurationStore)

const modeLabels: Record<ClubLabelDisplayMode, string> = {
  title: 'Title',
  loft: 'Loft',
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
</script>

<template>
  <section>
    <h2 class="section-title">Club Label Display</h2>

    <section class="mode-section">
      <div
        v-for="mode in CLUB_LABEL_DISPLAY_MODES"
        :key="mode"
        :class="clubLabelDisplayMode === mode ? 'tile-active' : 'tile'"
        :data-test-id="'display-mode-' + mode"
        @click="setClubLabelDisplayMode(mode)"
      >
        <div>{{ modeLabels[mode] }}</div>
      </div>
    </section>

    <section class="loft-inputs" data-test-id="loft-inputs-section">
      <div v-for="(club, index) in selectedClubs" :key="club" class="loft-input-group">
        <label class="loft-label">{{ club }}</label>
        <input
          type="number"
          class="loft-input"
          :data-test-id="'loft-input-' + club"
          :value="clubLofts[index] ?? ''"
          min="1"
          max="90"
          placeholder="-"
          @change="handleLoftInput(index, $event)"
        />
        <span class="degree-symbol">&deg;</span>
      </div>
    </section>
  </section>
</template>

<style scoped>
.section-title {
  color: #f3f4f6;
  font-size: 16px;
  font-weight: 700;
}

.mode-section {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.loft-inputs {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}

.loft-input-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
}

.loft-label {
  color: #9ca3af;
  font-size: 13px;
  font-weight: 600;
  min-width: 24px;
}

.loft-input {
  width: 52px;
  padding: 4px 6px;
  border-radius: 6px;
  border: 1px solid #4b5563;
  background-color: #374151;
  color: #f3f4f6;
  font-size: 13px;
  text-align: center;
  -moz-appearance: textfield;
}

.loft-input::-webkit-inner-spin-button,
.loft-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.degree-symbol {
  color: #9ca3af;
  font-size: 13px;
}

@media (max-width: 480px) {
  .mode-section {
    margin-top: 4px;
    gap: 6px;
  }

  .loft-inputs {
    margin-top: 8px;
    gap: 8px;
  }
}
</style>
