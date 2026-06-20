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
    <div v-if="error" class="state-card error-state">
      <p class="error-message">{{ error }}</p>
      <button
        type="button"
        class="retry-button"
        data-test-id="retry-practice-log-button"
        @click="emit('retry')"
      >
        Retry
      </button>
    </div>

    <div
      v-else-if="sessions.length === 0"
      class="state-card empty-state"
      data-test-id="practice-log-empty"
    >
      <div class="empty-mark" aria-hidden="true">
        <div class="empty-ring" />
      </div>
      <div class="empty-title">No sessions yet</div>
      <p class="empty-message">
        Start a session to pressure-test your short game and track how close you finish to every
        target.
      </p>
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
  gap: 10px;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.state-card {
  background: linear-gradient(180deg, #10162a, #0c1120);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 18px;
  text-align: center;
}

.empty-state {
  padding: 56px 32px;
}

.empty-mark {
  width: 54px;
  height: 54px;
  margin: 0 auto 18px;
  border-radius: 50%;
  background: rgba(139, 140, 246, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-ring {
  width: 18px;
  height: 18px;
  border: 2.5px solid #8b8cf6;
  border-radius: 50%;
}

.empty-title {
  font-size: 17px;
  font-weight: 700;
  color: #f4f6fb;
  margin-bottom: 6px;
}

.empty-message {
  font-size: 14.5px;
  color: #828aa0;
  line-height: 1.55;
  margin: 0 auto;
  max-width: 24em;
}

.error-state {
  padding: 32px;
}

.error-message {
  color: #ef6c6c;
  font-size: 14.5px;
  margin: 0 0 14px;
}

.retry-button {
  background: rgba(255, 255, 255, 0.04);
  color: #f4f6fb;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 11px;
  padding: 10px 22px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.14s;
}

.retry-button:hover {
  border-color: rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.06);
}
</style>
