<script setup lang="ts">
withDefaults(
  defineProps<{
    visible: boolean
    message: string
    buttonLabel?: string
  }>(),
  {
    buttonLabel: 'Got it',
  },
)

const emit = defineEmits<{
  dismiss: []
}>()
</script>

<template>
  <div v-if="visible" class="tutorial-overlay" @click.self="emit('dismiss')">
    <div class="highlight-container">
      <div class="highlight-content">
        <slot />
      </div>
      <div class="tooltip">
        <p class="tooltip-message">{{ message }}</p>
        <button class="tooltip-button" data-test-id="tutorial-got-it-button" @click="emit('dismiss')">
          {{ buttonLabel }}
        </button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<style scoped>
.tutorial-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.highlight-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 800px;
  width: 100%;
  padding: 0 16px;
}

.highlight-content {
  background: #1f2937;
  border: 2px solid #818cf8;
  border-radius: 8px;
  padding: 16px;
  width: 100%;
  box-shadow: 0 0 20px rgba(129, 140, 248, 0.3);
}

.tooltip {
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  max-width: 360px;
}

.tooltip-message {
  color: #f3f4f6;
  font-size: 14px;
  margin: 0 0 12px;
}

.tooltip-button {
  background-color: #818cf8;
  color: #1f2937;
  border: none;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tooltip-button:hover {
  background-color: #a5b4fc;
  transform: translateY(-1px);
}
</style>
