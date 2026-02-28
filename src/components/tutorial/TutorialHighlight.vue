<script setup lang="ts">
withDefaults(
  defineProps<{
    visible: boolean
    message: string
    buttonLabel?: string
    tooltipPosition?: 'below' | 'above'
  }>(),
  {
    buttonLabel: 'Got it',
    tooltipPosition: 'below',
  },
)

const emit = defineEmits<{
  dismiss: []
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="tutorial-backdrop" @click="emit('dismiss')" />
  </Teleport>
  <div class="tutorial-anchor" :class="{ active: visible }">
    <slot />
    <div v-if="visible" class="tooltip" :class="'tooltip-' + tooltipPosition">
      <p class="tooltip-message">{{ message }}</p>
      <button class="tooltip-button" data-test-id="tutorial-got-it-button" @click="emit('dismiss')">
        {{ buttonLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.tutorial-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 40;
}

.tutorial-anchor.active {
  position: relative;
  z-index: 50;
  outline: 2px solid #818cf8;
  outline-offset: 4px;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(129, 140, 248, 0.3);
}

.tooltip {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  max-width: 360px;
  width: max-content;
  opacity: 1;
  pointer-events: auto;
}

.tooltip-below {
  top: calc(100% + 12px);
}

.tooltip-above {
  bottom: calc(100% + 12px);
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

@media (max-width: 480px) {
  .tooltip {
    left: 8px;
    right: 8px;
    transform: none;
    width: auto;
    max-width: none;
  }
}
</style>
