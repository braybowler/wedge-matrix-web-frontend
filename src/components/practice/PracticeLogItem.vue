<script setup lang="ts">
import { ref } from 'vue'
import type { PracticeSessionRecord } from '@/types/practice'

defineProps<{
  session: PracticeSessionRecord
}>()

const emit = defineEmits<{
  delete: []
}>()

const expanded = ref(false)

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function differenceClass(diff: number | null): string {
  if (diff === null) return ''
  if (diff <= 3) return 'diff-good'
  if (diff <= 8) return 'diff-ok'
  return 'diff-poor'
}
</script>

<template>
  <div class="log-item" data-test-id="practice-log-item">
    <div class="log-summary" @click="expanded = !expanded">
      <div class="log-info">
        <span class="log-date">{{ formatDate(session.created_at) }}</span>
        <span class="log-detail">{{ session.shot_count }} shots</span>
        <span class="log-detail">Avg: {{ session.average_difference }} yds</span>
      </div>
      <span class="expand-icon">{{ expanded ? '▾' : '▸' }}</span>
    </div>

    <div v-if="expanded" class="log-details">
      <table class="detail-table">
        <thead>
          <tr>
            <th class="cell header-cell">#</th>
            <th class="cell header-cell">Target</th>
            <th class="cell header-cell">Actual</th>
            <th class="cell header-cell">Diff</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shot in session.shots" :key="shot.shot_number">
            <td class="cell shot-number-cell">{{ shot.shot_number }}</td>
            <td class="cell">{{ shot.target_yards }}</td>
            <td class="cell">{{ shot.actual_carry ?? '-' }}</td>
            <td class="cell" :class="differenceClass(shot.difference)">
              {{ shot.difference !== null ? shot.difference : '-' }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="delete-row">
        <button
          class="delete-button"
          data-test-id="delete-practice-session-button"
          @click.stop="emit('delete')"
        >
          Delete Session
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.log-item {
  background-color: #374151;
  border-radius: 8px;
  overflow: hidden;
}

.log-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.log-summary:hover {
  background-color: #4b5563;
}

.log-info {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.log-date {
  color: #f3f4f6;
  font-size: 14px;
  font-weight: 600;
}

.log-detail {
  color: #9ca3af;
  font-size: 13px;
}

.expand-icon {
  color: #6b7280;
  font-size: 14px;
}

.log-details {
  padding: 0 16px 12px;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
}

.cell {
  padding: 6px 8px;
  text-align: center;
  font-size: 13px;
  color: #d1d5db;
}

.header-cell {
  color: #9ca3af;
  font-weight: 600;
  border-bottom: 1px solid #4b5563;
}

.shot-number-cell {
  color: #6b7280;
}

.diff-good {
  color: #34d399;
}

.diff-ok {
  color: #fbbf24;
}

.diff-poor {
  color: #f87171;
}

.delete-row {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.delete-button {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s ease;
}

.delete-button:hover {
  color: #dc2626;
}
</style>
