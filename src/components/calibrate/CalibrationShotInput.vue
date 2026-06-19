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
  <div class="cal-shot-row">
    <label class="cal-shot-label">Shot {{ shotIndex + 1 }}</label>
    <input
      v-if="displayOption === 'Carry' || displayOption === 'Both'"
      type="number"
      class="cal-input"
      placeholder="Carry"
      step="0.1"
      min="0"
      max="999"
      inputmode="decimal"
      :value="carryValue"
      :data-test-id="`shot-carry-input-${shotIndex}`"
      @change="emit('change', shotIndex, 'carry_value', ($event.target as HTMLInputElement).value)"
    />
    <input
      v-if="displayOption === 'Total' || displayOption === 'Both'"
      type="number"
      class="cal-input is-total"
      placeholder="Total"
      step="0.1"
      min="0"
      max="999"
      inputmode="decimal"
      :value="totalValue"
      :data-test-id="`shot-total-input-${shotIndex}`"
      @change="emit('change', shotIndex, 'total_value', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
