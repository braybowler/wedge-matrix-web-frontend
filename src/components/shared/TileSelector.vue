<script setup lang="ts" generic="T extends string | number">
defineProps<{
  options: T[]
  modelValue: T | T[]
  testIdPrefix?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

function isActive(option: T, modelValue: T | T[]): boolean {
  if (Array.isArray(modelValue)) {
    return modelValue.includes(option)
  }
  return modelValue === option
}
</script>

<template>
  <section class="selector-section">
    <button
      v-for="option in options"
      :key="String(option)"
      :class="isActive(option, modelValue) ? 'tile-active' : 'tile'"
      :data-test-id="testIdPrefix ? testIdPrefix + option : undefined"
      @click="emit('update:modelValue', option)"
    >
      {{ option }}
    </button>
  </section>
</template>

<style scoped>
.selector-section {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

@media (max-width: 480px) {
  .selector-section {
    margin-top: 4px;
    gap: 6px;
  }
}
</style>
