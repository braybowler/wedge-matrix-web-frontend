<script setup lang="ts">
import BaseModal from '@/components/shared/BaseModal.vue'

defineProps<{
  visible: boolean
  title: string
  message: string
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <BaseModal :visible="visible" :label="title" test-id="modal-overlay" @close="$emit('cancel')">
    <h2 class="modal-title">{{ title }}</h2>
    <p class="modal-message">{{ message }}</p>
    <div class="button-row">
      <button class="button confirm-button" data-test-id="confirm-button" @click="$emit('confirm')">
        Confirm
      </button>
      <button class="button cancel-button" data-test-id="cancel-button" @click="$emit('cancel')">
        Cancel
      </button>
    </div>
  </BaseModal>
</template>

<style scoped>
.modal-title {
  color: #f3f4f6;
  font-weight: 700;
  font-size: 18px;
  margin: 0 0 8px;
  text-align: center;
}

.modal-message {
  color: #9ca3af;
  font-size: 14px;
  margin: 0 0 24px;
  text-align: center;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.button {
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  transform: translateY(-1px);
}

.cancel-button {
  background-color: #374151;
  color: #f3f4f6;
  border: 1px solid #4b5563;
}

.cancel-button:hover {
  background-color: #4b5563;
}

.confirm-button {
  background-color: #dc2626;
  color: #f3f4f6;
  border: 1px solid #dc2626;
}

.confirm-button:hover {
  background-color: #b91c1c;
}
</style>
