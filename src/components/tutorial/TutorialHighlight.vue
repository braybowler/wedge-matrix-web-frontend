<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = withDefaults(
  defineProps<{
    visible: boolean
    message: string
    buttonLabel?: string
    tooltipPosition?: 'below' | 'above'
    showBack?: boolean
  }>(),
  {
    buttonLabel: 'Got it',
    tooltipPosition: 'below',
    showBack: false,
  },
)

const emit = defineEmits<{
  dismiss: []
  back: []
}>()

const anchorRef = ref<HTMLElement | null>(null)

watch(
  () => props.visible,
  async (isVisible) => {
    if (isVisible) {
      await nextTick()
      anchorRef.value?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="tutorial-backdrop" @click="emit('dismiss')" />
  </Teleport>
  <div ref="anchorRef" class="tutorial-anchor" :class="{ active: visible }">
    <slot />
    <div v-if="visible" class="tutorial-tooltip" :class="'tutorial-tooltip-' + tooltipPosition">
      <p class="tutorial-tooltip-message">{{ message }}</p>
      <div class="tutorial-tooltip-buttons">
        <button
          v-if="showBack"
          class="tutorial-tooltip-button tutorial-tooltip-button-back"
          data-test-id="tutorial-back-button"
          @click="emit('back')"
        >
          Back
        </button>
        <button
          class="tutorial-tooltip-button"
          data-test-id="tutorial-got-it-button"
          @click="emit('dismiss')"
        >
          {{ buttonLabel }}
        </button>
      </div>
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

.tutorial-tooltip {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  max-width: min(360px, calc(100vw - 32px));
  width: 360px;
  box-sizing: border-box;
  white-space: normal;
  opacity: 1;
  pointer-events: auto;
}

.tutorial-tooltip-below {
  top: calc(100% + 12px);
}

.tutorial-tooltip-above {
  bottom: calc(100% + 12px);
}

.tutorial-tooltip-message {
  color: #f3f4f6;
  font-size: 14px;
  margin: 0 0 12px;
  overflow-wrap: break-word;
  word-break: break-word;
}

.tutorial-tooltip-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.tutorial-tooltip-button {
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

.tutorial-tooltip-button:hover {
  background-color: #a5b4fc;
  transform: translateY(-1px);
}

.tutorial-tooltip-button-back {
  background-color: transparent;
  border: 1px solid #818cf8;
  color: #818cf8;
}

.tutorial-tooltip-button-back:hover {
  background-color: rgba(129, 140, 248, 0.1);
  color: #a5b4fc;
  border-color: #a5b4fc;
}

@media (max-width: 480px) {
  .tutorial-tooltip {
    left: 8px;
    right: 8px;
    transform: none;
    width: auto;
    max-width: none;
  }
}
</style>
