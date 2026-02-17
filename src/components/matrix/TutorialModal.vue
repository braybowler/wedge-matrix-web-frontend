<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  dismiss: []
  dismissPermanently: []
  learnMore: []
}>()

const doNotShowAgain = ref(false)

function handleDismiss() {
  if (doNotShowAgain.value) {
    emit('dismissPermanently')
  } else {
    emit('dismiss')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="overlay"
      data-test-id="tutorial-modal-overlay"
      @click.self="handleDismiss"
    >
      <div class="modal">
        <h2 class="modal-title">Welcome to Wedge Matrix!</h2>
        <p class="modal-message">
          Would you like to learn how to use Wedge Matrix to track and optimize your wedge yardages?
        </p>
        <label class="checkbox-label">
          <input v-model="doNotShowAgain" type="checkbox" class="checkbox" />
          Do not show me this again
        </label>
        <div class="button-row">
          <button
            class="button learn-more-button"
            data-test-id="tutorial-learn-more-button"
            @click="emit('learnMore')"
          >
            Learn More
          </button>
          <button
            class="button dismiss-button"
            data-test-id="tutorial-dismiss-button"
            @click="handleDismiss"
          >
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
  padding: 24px;
  max-width: 400px;
  width: 100%;
}

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
  margin: 0 0 16px;
  text-align: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #9ca3af;
  font-size: 14px;
  margin: 0 0 24px;
  cursor: pointer;
}

.checkbox {
  accent-color: #4b5563;
  cursor: pointer;
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

.dismiss-button {
  background-color: #374151;
  color: #f3f4f6;
  border: 1px solid #4b5563;
}

.dismiss-button:hover {
  background-color: #4b5563;
}

.learn-more-button {
  background-color: #818cf8;
  color: #1f2937;
  border: 1px solid #818cf8;
}

.learn-more-button:hover {
  background-color: #a5b4fc;
}
</style>
