<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ClubLabel } from '@/types/matrix'

const props = defineProps<{
  clubs: ClubLabel[]
  displayLabels?: string[]
}>()

const emit = defineEmits<{
  select: [indices: number[]]
}>()

const selected = ref<Set<number>>(new Set(props.clubs.map((_, i) => i)))

const allSelected = computed(() => selected.value.size === props.clubs.length)

function toggleAll() {
  if (allSelected.value) {
    selected.value = new Set([0])
  } else {
    selected.value = new Set(props.clubs.map((_, i) => i))
  }
}

function toggle(index: number) {
  const next = new Set(selected.value)
  if (next.has(index)) {
    if (next.size > 1) {
      next.delete(index)
    }
  } else {
    next.add(index)
  }
  selected.value = next
}

function handleNext() {
  emit(
    'select',
    [...selected.value].sort((a, b) => a - b),
  )
}
</script>

<template>
  <section class="component-container">
    <h2 class="section-title">Which clubs to calibrate?</h2>

    <section class="option-section">
      <div
        :class="allSelected ? 'tile-active' : 'tile'"
        data-test-id="club-select-all"
        @click="toggleAll"
      >
        All
      </div>
      <div
        v-for="(club, i) in clubs"
        :key="club"
        :class="selected.has(i) ? 'tile-active' : 'tile'"
        :data-test-id="`club-select-${i}`"
        @click="toggle(i)"
      >
        {{ displayLabels?.[i] ?? club }}
      </div>
    </section>

    <div class="button-row">
      <button class="button button-primary" data-test-id="club-next-button" @click="handleNext">
        Next
      </button>
    </div>
  </section>
</template>

<style scoped>
.section-title {
  color: #f3f4f6;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
}

.option-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.button-row {
  display: flex;
  justify-content: center;
  margin-top: 12px;
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
</style>
