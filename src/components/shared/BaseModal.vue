<script setup lang="ts">
defineProps<{
  visible: boolean
  label: string
  maxWidth?: string
  testId?: string
}>()

const emit = defineEmits<{
  close: []
}>()

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="overlay"
      :data-test-id="testId"
      @click.self="emit('close')"
      @keydown="handleKeydown"
    >
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        :aria-label="label"
        :style="maxWidth ? { maxWidth } : undefined"
      >
        <slot />
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
  margin: 0 16px;
}
</style>
