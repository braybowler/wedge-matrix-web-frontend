<script setup lang="ts">
import type { RowDisplayOption } from '@/types/matrix'

defineProps<{
  shotIndex: number
  carryValue: number | null
  totalValue: number | null
  displayOption: RowDisplayOption
}>()

const emit = defineEmits<{
  change: [shotIndex: number, field: 'carry_value' | 'total_value', rawValue: string]
}>()
</script>

<template>
  <div class="shot-row">
    <label class="shot-label">Shot {{ shotIndex + 1 }}</label>
    <div class="inputs">
      <input
        v-if="displayOption === 'Carry' || displayOption === 'Both'"
        type="number"
        class="input"
        placeholder="Carry"
        step="0.1"
        min="0"
        max="999"
        inputmode="decimal"
        :value="carryValue"
        :data-test-id="`shot-carry-input-${shotIndex}`"
        @change="
          emit('change', shotIndex, 'carry_value', ($event.target as HTMLInputElement).value)
        "
      />
      <input
        v-if="displayOption === 'Total' || displayOption === 'Both'"
        type="number"
        class="input"
        placeholder="Total"
        step="0.1"
        min="0"
        max="999"
        inputmode="decimal"
        :value="totalValue"
        :data-test-id="`shot-total-input-${shotIndex}`"
        @change="
          emit('change', shotIndex, 'total_value', ($event.target as HTMLInputElement).value)
        "
      />
    </div>
  </div>
</template>

<style scoped>
.shot-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.shot-label {
  color: #9ca3af;
  font-size: 14px;
  font-weight: 500;
  min-width: 60px;
}

.inputs {
  display: flex;
  gap: 8px;
}

.input {
  background-color: #374151;
  padding: 6px 8px;
  color: #f3f4f6;
  border: 1px solid #4b5563;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  width: 80px;
}

.input:focus {
  border-color: #818cf8;
  outline: none;
}

.input:focus::placeholder {
  color: transparent;
}
</style>
