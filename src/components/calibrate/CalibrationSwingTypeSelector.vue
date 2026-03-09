<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  columnHeaders: string[]
  columns: number
}>()

const emit = defineEmits<{
  select: [indices: number[]]
  back: []
}>()

const headers = computed(() => props.columnHeaders.slice(0, props.columns))

const selected = ref<Set<number>>(new Set(headers.value.map((_, i) => i)))

const allSelected = computed(() => selected.value.size === headers.value.length)

function toggleAll() {
  if (allSelected.value) {
    selected.value = new Set([0])
  } else {
    selected.value = new Set(headers.value.map((_, i) => i))
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
    <h2 class="section-title">Which swing types to calibrate?</h2>

    <section class="option-section">
      <div
        :class="allSelected ? 'tile-active' : 'tile'"
        data-test-id="swing-select-all"
        @click="toggleAll"
      >
        All
      </div>
      <div
        v-for="(header, i) in headers"
        :key="i"
        :class="selected.has(i) ? 'tile-active' : 'tile'"
        :data-test-id="`swing-select-${i}`"
        @click="toggle(i)"
      >
        {{ header || `Col ${i + 1}` }}
      </div>
    </section>

    <div class="button-row">
      <button
        class="button button-secondary"
        data-test-id="swing-back-button"
        @click="emit('back')"
      >
        Back
      </button>
      <button class="button button-primary" data-test-id="swing-next-button" @click="handleNext">
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
  gap: 12px;
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

.button-secondary {
  background-color: #374151;
  color: #9ca3af;
  border: 1px solid #4b5563;
}

.button-secondary:hover {
  background-color: #4b5563;
  border-color: #818cf8;
}
</style>
