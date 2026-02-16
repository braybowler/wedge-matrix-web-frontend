<script setup lang="ts">
import { TOS_CONTENT } from '@/components/register/tosContent.ts'

defineProps<{
  visible: boolean
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="overlay"
      data-test-id="tos-modal-overlay"
      @click.self="$emit('close')"
    >
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Terms of Service</h2>
          <button class="close-icon" data-test-id="tos-close-icon" @click="$emit('close')">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <div v-for="(section, index) in TOS_CONTENT" :key="index" class="tos-section">
            <h3 class="tos-heading">{{ section.heading }}</h3>
            <p class="tos-text">{{ section.text }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="button" data-test-id="tos-close-button" @click="$emit('close')">
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: #1f2937;
  border: 1px solid #4b5563;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #4b5563;
}

.modal-title {
  color: #f3f4f6;
  font-weight: 700;
  font-size: 18px;
  margin: 0;
}

.close-icon {
  color: #9ca3af;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}

.close-icon:hover {
  color: #f3f4f6;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.tos-section {
  margin-bottom: 20px;
}

.tos-section:last-child {
  margin-bottom: 0;
}

.tos-heading {
  color: #f3f4f6;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px;
}

.tos-text {
  color: #9ca3af;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #4b5563;
  display: flex;
  justify-content: flex-end;
}

.button {
  background-color: #374151;
  color: #f3f4f6;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.button:hover {
  background-color: #4b5563;
  transform: translateY(-1px);
}
</style>
