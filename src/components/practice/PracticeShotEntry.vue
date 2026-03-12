<script setup lang="ts">
import type { PracticeShot } from '@/types/practice'

defineProps<{
  shot: PracticeShot
  isFirstShot: boolean
}>()

const emit = defineEmits<{
  'update-carry': [rawValue: string]
  next: []
  back: []
  quit: []
}>()

function differenceClass(diff: number | null): string {
  if (diff === null) return ''
  if (diff <= 3) return 'diff-good'
  if (diff <= 8) return 'diff-ok'
  return 'diff-poor'
}
</script>

<template>
  <section class="entry-container">
    <h2 class="target-label" data-test-id="practice-target-label">
      Hit to {{ shot.target_yards }} yards
    </h2>

    <div class="input-group">
      <label class="input-label" for="practice-carry-input">Carry Distance</label>
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
    </div>

    <div
      v-if="shot.difference !== null"
      class="diff-preview"
      :class="differenceClass(shot.difference)"
      data-test-id="practice-diff-preview"
    >
      {{ shot.difference }} yard{{ shot.difference !== 1 ? 's' : '' }} off
    </div>

    <div class="button-row">
      <button
        v-if="!isFirstShot"
        class="button button-secondary"
        data-test-id="practice-back-button"
        @click="emit('back')"
      >
        Back
      </button>
      <button
        class="button button-primary"
        data-test-id="practice-next-button"
        @click="emit('next')"
      >
        Next
      </button>
    </div>

    <div class="quit-row">
      <button class="quit-button" data-test-id="quit-practice-button" @click="emit('quit')">
        Quit Practice
      </button>
    </div>
  </section>
</template>

<style scoped>
.entry-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.target-label {
  color: #f3f4f6;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.input-label {
  color: #9ca3af;
  font-size: 13px;
  font-weight: 500;
}

.carry-input {
  background-color: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  color: #f3f4f6;
  padding: 8px 12px;
  font-size: 16px;
  width: 140px;
  text-align: center;
  outline: none;
  transition: border-color 0.2s ease;
}

.carry-input:focus {
  border-color: #818cf8;
}

.carry-input::placeholder {
  color: #6b7280;
}

.diff-preview {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
}

.diff-good {
  color: #34d399;
}

.diff-ok {
  color: #fbbf24;
}

.diff-poor {
  color: #f87171;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
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

.button-secondary {
  background-color: #374151;
  color: #9ca3af;
  border: 1px solid #4b5563;
}

.button-secondary:hover {
  background-color: #4b5563;
  border-color: #818cf8;
}

.quit-row {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}

.quit-button {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s ease;
}

.quit-button:hover {
  color: #dc2626;
}
</style>
