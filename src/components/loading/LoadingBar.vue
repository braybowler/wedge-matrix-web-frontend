<script setup lang="ts">
import { useLoadingStore } from '@/stores/loading/loadingStore.ts'
import { storeToRefs } from 'pinia'

const { isLoading } = storeToRefs(useLoadingStore())
</script>

<template>
  <div v-if="isLoading" class="loading-bar" data-test-id="loading-bar" />
</template>

<style scoped>
.loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  z-index: 9999;
  background: linear-gradient(90deg, #818cf8, #6366f1, #818cf8);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
