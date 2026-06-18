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
  width: 46px;
  max-width: 46px;
  text-align: center;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 15px;
  font-weight: 500;
  color: #f4f6fb;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9px;
  padding: 8px 0;
  transition: border-color 0.14s;
  -moz-appearance: textfield;
}

.input::-webkit-outer-spin-button,
.input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input::placeholder {
  color: #5b6276;
}

.input:focus {
  outline: none;
  border-color: #8b8cf6;
}

.input:focus::placeholder {
  color: transparent;
}
</style>
