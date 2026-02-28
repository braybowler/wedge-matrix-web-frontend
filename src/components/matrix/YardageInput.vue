<script setup lang="ts">
defineProps<{
  value: number | null
  field: 'carry_value' | 'total_value'
  placeholder: string
  dataTestId: string
}>()

const emit = defineEmits<{
  change: [field: 'carry_value' | 'total_value', rawValue: string]
}>()
</script>

<template>
  <input
    name="yardage-input"
    type="number"
    class="input"
    :placeholder="placeholder"
    :data-test-id="dataTestId"
    min="1"
    max="999"
    step="1"
    inputmode="numeric"
    :value="value"
    @change="emit('change', field, ($event.target as HTMLInputElement).value)"
  />
</template>

<style scoped>
.input {
  background-color: #374151;
  padding: 2px 0px;
  color: #f3f4f6;
  border: 1px solid #4b5563;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  max-width: 50px;
}

.input:nth-child(2) {
  margin-top: 4px;
}

.input:focus {
  border-color: #818cf8;
}

.input:focus::placeholder {
  color: transparent;
}
</style>
