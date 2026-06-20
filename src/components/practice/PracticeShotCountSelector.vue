<script setup lang="ts">
import type { PracticeShotCount } from '@/types/practice'

const shotCounts: PracticeShotCount[] = [5, 10, 15]

defineProps<{
  selected: PracticeShotCount | null
}>()

const emit = defineEmits<{
  select: [shotCount: PracticeShotCount]
}>()
</script>

<template>
  <div class="step-body">
    <h2 class="step-title">How many shots?</h2>
    <p class="step-desc">Set the length of your session.</p>

    <div class="shot-opts">
      <button
        v-for="count in shotCounts"
        :key="count"
        type="button"
        class="shot-opt"
        :class="{ 'is-active': selected === count }"
        :data-test-id="`practice-shot-count-${count}`"
        @click="emit('select', count)"
      >
        {{ count }} Shots
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

.shot-opts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
}

.shot-opt {
  min-width: 128px;
  padding: 22px 24px;
  border-radius: 15px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 18px;
  color: #aab2c5;
  transition: all 0.14s;
}

.shot-opt:hover {
  border-color: rgba(255, 255, 255, 0.28);
}

.shot-opt.is-active {
  background: rgba(139, 140, 246, 0.1);
  border-color: #8b8cf6;
  color: #8b8cf6;
}

@media (max-width: 480px) {
  .shot-opts {
    flex-direction: column;
    align-items: center;
  }
}
</style>
