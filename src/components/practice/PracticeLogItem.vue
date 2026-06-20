<script setup lang="ts">
import { ref } from 'vue'
import type { PracticeSessionRecord } from '@/types/practice'
import { differenceClass } from '@/utils/differenceClass.ts'

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

function modeLabel(mode: string): string {
  if (mode === 'drill') return 'Drill'
  return 'Gauntlet'
}

function modeBadge(mode: string): string {
  if (mode === 'drill') return 'DRL'
  return 'GNT'
}
</script>

<template>
  <div class="log-item" data-test-id="practice-log-item">
    <div class="log-summary" @click="expanded = !expanded">
      <div class="log-info">
        <span class="mode-badge" :class="'mode-' + session.mode" data-test-id="log-mode-badge">
          {{ modeBadge(session.mode) }}
        </span>
        <div class="log-meta">
          <span class="log-mode-name">{{ modeLabel(session.mode) }}</span>
          <span class="log-date">{{ formatDate(session.created_at) }}</span>
        </div>
      </div>
      <div class="log-stats">
        <span class="log-detail">{{ session.shot_count }} shots</span>
        <span class="log-avg">{{ session.average_difference }} yd avg</span>
        <span class="expand-icon" :class="{ open: expanded }">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      </div>
    </div>

    <div v-if="expanded" class="log-details">
      <table class="detail-table">
        <thead>
          <tr>
            <th class="cell header-cell">#</th>
            <th v-if="session.mode === 'drill'" class="cell header-cell">Combo</th>
            <th class="cell header-cell">Target</th>
            <th class="cell header-cell">Actual</th>
            <th class="cell header-cell">Diff</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shot in session.shots" :key="shot.shot_number">
            <td class="cell shot-number-cell">{{ shot.shot_number }}</td>
            <td v-if="session.mode === 'drill'" class="cell combo-cell">
              {{ shot.club_label ?? '' }}{{ shot.swing_label ? ' · ' + shot.swing_label : '' }}
            </td>
            <td class="cell">{{ shot.target_yards }}</td>
            <td class="cell">{{ shot.actual_carry ?? '-' }}</td>
            <td class="cell diff-cell" :class="differenceClass(shot.difference)">
              {{ shot.difference !== null ? shot.difference : '-' }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="delete-row">
        <button
          type="button"
          class="delete-button"
          data-test-id="delete-practice-session-button"
          @click.stop="emit('delete')"
        >
          Delete session
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.log-item {
  background: linear-gradient(180deg, #10162a, #0c1120);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 14px;
  overflow: hidden;
}

.log-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  cursor: pointer;
  transition: background-color 0.14s;
}

.log-summary:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.log-info {
  display: flex;
  align-items: center;
  gap: 13px;
}

.mode-badge {
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.mode-gauntlet {
  background: rgba(139, 140, 246, 0.16);
  color: #8b8cf6;
}

.mode-drill {
  background: rgba(255, 255, 255, 0.06);
  color: #aab2c5;
}

.log-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.log-mode-name {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.01em;
  color: #f4f6fb;
}

.log-date {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
  color: #828aa0;
}

.log-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.log-detail {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
  color: #aab2c5;
}

.log-avg {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
  font-weight: 700;
  color: #8b8cf6;
}

.expand-icon {
  color: #5b6276;
  display: flex;
  transition: transform 0.16s;
}

.expand-icon.open {
  transform: rotate(90deg);
}

.log-details {
  padding: 0 18px 14px;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
}

.cell {
  padding: 8px;
  text-align: center;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
  color: #cdd3e0;
}

.header-cell {
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #828aa0;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.shot-number-cell {
  color: #5b6276;
}

.combo-cell {
  font-size: 12px;
  white-space: nowrap;
}

.diff-cell {
  font-weight: 700;
}

.diff-good {
  color: #34d399;
}

.diff-ok {
  color: #fbbf24;
}

.diff-poor {
  color: #ef6c6c;
}

.delete-row {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.delete-button {
  background: none;
  border: none;
  color: #6c7488;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.14s;
}

.delete-button:hover {
  color: #ef6c6c;
}
</style>
