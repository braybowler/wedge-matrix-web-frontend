<script setup lang="ts">
import type { PracticeSessionRecord } from '@/types/practice'
import PracticeLogItem from '@/components/practice/PracticeLogItem.vue'

defineProps<{
  sessions: PracticeSessionRecord[]
  error: string | null
}>()

const emit = defineEmits<{
  delete: [id: number]
  retry: []
}>()
</script>

<template>
  <section class="log-container" data-test-id="practice-log">
    <h2 class="log-title">Practice Log</h2>

    <div v-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button class="retry-button" data-test-id="retry-practice-log-button" @click="emit('retry')">
        Retry
      </button>
    </div>

    <div v-else-if="sessions.length === 0" class="empty-state" data-test-id="practice-log-empty">
      <p class="empty-message">No practice sessions yet. Start one to track your progress!</p>
    </div>

    <div v-else class="log-list">
      <PracticeLogItem
        v-for="session in sessions"
        :key="session.id"
        :session="session"
        @delete="emit('delete', session.id)"
      />
    </div>
  </section>
</template>

<style scoped>
.log-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-title {
  color: #f3f4f6;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 24px 0;
}

.empty-message {
  color: #6b7280;
  font-size: 14px;
}

.error-container {
  text-align: center;
  padding: 16px 0;
}

.error-message {
  color: #f87171;
  font-size: 14px;
  margin-bottom: 8px;
}

.retry-button {
  background-color: #374151;
  color: #9ca3af;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background-color: #4b5563;
  border-color: #818cf8;
}
</style>
