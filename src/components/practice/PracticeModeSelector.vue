<script setup lang="ts">
import type { PracticeMode } from '@/types/practice'

defineProps<{
  selected: PracticeMode | null
}>()

const emit = defineEmits<{
  select: [mode: PracticeMode]
}>()
</script>

<template>
  <div class="step-body">
    <h2 class="step-title">Choose a mode</h2>
    <p class="step-desc">How do you want to challenge your short game today?</p>

    <div class="mode-grid">
      <button
        type="button"
        class="mode-card"
        :class="{ 'is-active': selected === 'gauntlet' }"
        data-test-id="mode-gauntlet"
        @click="emit('select', 'gauntlet')"
      >
        <span class="mode-icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4.5" />
            <circle cx="12" cy="12" r="1" />
          </svg>
        </span>
        <span class="mode-name">Gauntlet</span>
        <p class="mode-card-desc">Random target distances across your bag.</p>
      </button>

      <button
        type="button"
        class="mode-card"
        :class="{ 'is-active': selected === 'drill' }"
        data-test-id="mode-drill"
        @click="emit('select', 'drill')"
      >
        <span class="mode-icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 12h4l3 8 4-16 3 8h4" />
          </svg>
        </span>
        <span class="mode-name">Drill</span>
        <p class="mode-card-desc">Repeat specific club and swing combos.</p>
      </button>
    </div>
  </div>
</template>

<style scoped>
.step-body {
  animation: prcStep 0.28s ease both;
}

.step-title {
  font-size: 23px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 8px;
  text-align: center;
  color: #f4f6fb;
}

.step-desc {
  font-size: 15px;
  color: #aab2c5;
  line-height: 1.55;
  margin: 0 0 28px;
  text-align: center;
}

.mode-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  max-width: 520px;
  margin: 0 auto;
}

.mode-card {
  text-align: left;
  padding: 24px;
  border-radius: 16px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.14s;
}

.mode-card:hover {
  border-color: rgba(255, 255, 255, 0.28);
}

.mode-card.is-active {
  background: rgba(139, 140, 246, 0.1);
  border-color: #8b8cf6;
}

.mode-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(139, 140, 246, 0.14);
  color: #8b8cf6;
  margin-bottom: 12px;
}

.mode-card.is-active .mode-icon {
  background: #8b8cf6;
  color: #0a0e1a;
}

.mode-name {
  display: block;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #f4f6fb;
  margin-bottom: 8px;
}

.mode-card-desc {
  font-size: 14px;
  color: #aab2c5;
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 520px) {
  .mode-grid {
    grid-template-columns: 1fr;
  }
}
</style>
