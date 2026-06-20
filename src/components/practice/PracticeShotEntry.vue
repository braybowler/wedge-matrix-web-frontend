<script setup lang="ts">
import type { PracticeShot } from '@/types/practice'
import { differenceClass } from '@/utils/differenceClass.ts'

withDefaults(
  defineProps<{
    shot: PracticeShot
    isFirstShot: boolean
    isLastShot?: boolean
  }>(),
  { isLastShot: false },
)

const emit = defineEmits<{
  'update-carry': [rawValue: string]
  next: []
  back: []
  quit: []
}>()
</script>

<template>
  <section class="entry-container">
    <h2 class="target-label" data-test-id="practice-target-label">
      Hit to <span class="target-accent">{{ shot.target_yards }}</span> yards
    </h2>

    <div class="input-group">
      <label class="input-label" for="practice-carry-input">Carry distance</label>
      <input
        id="practice-carry-input"
        class="carry-input"
        type="number"
        step="0.1"
        min="0"
        max="999"
        inputmode="decimal"
        placeholder="yards"
        data-test-id="practice-carry-input"
        :value="shot.actual_carry ?? ''"
        @input="emit('update-carry', ($event.target as HTMLInputElement).value)"
      />
      <div class="diff-slot">
        <span
          v-if="shot.difference !== null"
          class="diff-preview"
          :class="differenceClass(shot.difference)"
          data-test-id="practice-diff-preview"
        >
          {{ shot.difference }} yard{{ shot.difference !== 1 ? 's' : '' }} off
        </span>
      </div>
    </div>

    <div class="button-row">
      <button
        v-if="!isFirstShot"
        type="button"
        class="btn btn-back"
        data-test-id="practice-back-button"
        @click="emit('back')"
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
        class="btn btn-next"
        data-test-id="practice-next-button"
        @click="emit('next')"
      >
        {{ isLastShot ? 'Finish' : 'Next' }}
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

    <div class="quit-row">
      <button
        type="button"
        class="quit-button"
        data-test-id="quit-practice-button"
        @click="emit('quit')"
      >
        Quit practice
      </button>
    </div>
  </section>
</template>

<style scoped>
.entry-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: prcStep 0.28s ease both;
}

.target-label {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.025em;
  text-align: center;
  color: #f4f6fb;
  margin: 0 0 26px;
}

.target-accent {
  color: #8b8cf6;
}

.input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 280px;
}

.input-label {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #828aa0;
  margin-bottom: 10px;
}

.carry-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  padding: 16px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 24px;
  font-weight: 700;
  color: #f4f6fb;
  text-align: center;
  outline: none;
  transition: all 0.14s;
}

.carry-input:focus {
  border-color: #8b8cf6;
  background: rgba(139, 140, 246, 0.06);
}

.carry-input::placeholder {
  color: #4f566b;
}

.diff-slot {
  height: 26px;
  text-align: center;
  margin-top: 14px;
}

.diff-preview {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 15px;
  font-weight: 700;
}

.diff-good {
  color: #34d399;
}

.diff-ok {
  color: #fbbf24;
}

.diff-poor {
  color: #ef6c6c;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 6px;
}

.btn {
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

.btn-back {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f4f6fb;
  font-weight: 600;
  padding: 13px 24px;
}

.btn-back:hover {
  border-color: rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.06);
}

.btn-next {
  background: #8b8cf6;
  border: none;
  color: #0a0e1a;
  padding: 13px 32px;
}

.btn-next:hover {
  transform: translateY(-1px);
}

.quit-row {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.quit-button {
  background: none;
  border: none;
  color: #6c7488;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.14s;
}

.quit-button:hover {
  color: #aab2c5;
}
</style>
