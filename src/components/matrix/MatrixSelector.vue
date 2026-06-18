<script setup lang="ts">
import ConfirmationModal from '@/components/matrix/ConfirmationModal.vue'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { useUserStore } from '@/stores/user/userStore.ts'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{ readonly?: boolean; label?: string }>(), {
  readonly: false,
  label: undefined,
})

const userStore = useUserStore()
const matrixConfigurationStore = useMatrixConfigurationStore()
const { selectedMatrixId } = storeToRefs(matrixConfigurationStore)

const matrices = computed(() => userStore.user?.wedge_matrices ?? [])
const canDelete = computed(() => matrices.value.length > 1)

const isRenaming = ref(false)
const renameInput = ref('')
const showDeleteConfirm = ref(false)

function matrixDisplayLabel(matrix: { id: number; label: string | null }, index: number) {
  return matrix.label ?? 'Matrix ' + (index + 1)
}

async function handleMatrixChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const matrixId = Number(target.value)
  await matrixConfigurationStore.switchMatrix(matrixId, matrices.value)
}

async function handleCreate() {
  const label = 'Matrix ' + (matrices.value.length + 1)
  const newMatrix = await matrixConfigurationStore.createMatrix(label)
  if (newMatrix) {
    userStore.addWedgeMatrix(newMatrix)
    await matrixConfigurationStore.switchMatrix(newMatrix.id, matrices.value)
  }
}

function handleDeleteClick() {
  showDeleteConfirm.value = true
}

async function handleDeleteConfirm() {
  showDeleteConfirm.value = false
  if (!selectedMatrixId.value) return
  const matrixId = selectedMatrixId.value
  const success = await matrixConfigurationStore.deleteMatrix(matrixId)
  if (success) {
    userStore.removeWedgeMatrix(matrixId)
    const remaining = matrices.value
    if (remaining.length > 0) {
      await matrixConfigurationStore.switchMatrix(remaining[0]!.id, remaining)
    }
  }
}

function handleDeleteCancel() {
  showDeleteConfirm.value = false
}

function startRename() {
  renameInput.value = matrixConfigurationStore.matrixLabel ?? ''
  isRenaming.value = true
}

async function confirmRename() {
  if (!selectedMatrixId.value) return
  const success = await matrixConfigurationStore.renameMatrix(
    selectedMatrixId.value,
    renameInput.value,
  )
  if (success) {
    userStore.updateWedgeMatrixLabel(selectedMatrixId.value, renameInput.value)
  }
  isRenaming.value = false
}

function cancelRename() {
  isRenaming.value = false
}
</script>

<template>
  <div class="matrix-selector-root" data-test-id="matrix-selector">
    <label v-if="props.label" class="selector-label">{{ props.label }}</label>
    <div class="selector-row">
      <div class="select-wrap">
        <select
          class="matrix-select"
          :value="selectedMatrixId"
          data-test-id="matrix-dropdown"
          @change="handleMatrixChange"
        >
          <option v-for="(matrix, index) in matrices" :key="matrix.id" :value="matrix.id">
            {{ matrixDisplayLabel(matrix, index) }}
          </option>
        </select>
        <svg
          class="select-chevron"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      <div v-if="!props.readonly" class="action-buttons">
        <div class="tooltip-wrapper">
          <button
            class="primary-button"
            aria-label="New Matrix"
            data-test-id="create-matrix-button"
            @click="handleCreate"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.6"
              class="icon"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <span class="tooltip">New Matrix</span>
        </div>

        <div class="tooltip-wrapper">
          <button
            class="ghost-button"
            aria-label="Rename"
            data-test-id="rename-matrix-button"
            @click="startRename"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="icon"
              aria-hidden="true"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
            </svg>
          </button>
          <span class="tooltip">Rename</span>
        </div>

        <div class="tooltip-wrapper">
          <button
            class="ghost-button danger"
            :class="{ disabled: !canDelete }"
            :disabled="!canDelete"
            aria-label="Delete Matrix"
            data-test-id="delete-matrix-button"
            @click="handleDeleteClick"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="icon"
              aria-hidden="true"
            >
              <path
                d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
              />
            </svg>
          </button>
          <span class="tooltip">Delete Matrix</span>
        </div>
      </div>
    </div>

    <div v-if="isRenaming && !props.readonly" class="rename-row" data-test-id="rename-row">
      <input
        v-model="renameInput"
        class="rename-input"
        type="text"
        data-test-id="rename-input"
        @keyup.enter="confirmRename"
        @keyup.escape="cancelRename"
      />
      <button
        class="rename-action-button save-button"
        data-test-id="rename-save"
        @click="confirmRename"
      >
        Save
      </button>
      <button
        class="rename-action-button cancel-button"
        data-test-id="rename-cancel"
        @click="cancelRename"
      >
        Cancel
      </button>
    </div>

    <ConfirmationModal
      v-if="!props.readonly"
      :visible="showDeleteConfirm"
      title="Delete Matrix"
      message="Are you sure you want to delete this matrix? This action cannot be undone."
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />
  </div>
</template>

<style scoped>
.matrix-selector-root {
  font-family: 'Archivo', system-ui, sans-serif;
  color: #f4f6fb;
}

.selector-label {
  display: block;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #828aa0;
  margin-bottom: 10px;
}

.selector-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-wrap {
  position: relative;
  flex: 1;
}

.matrix-select {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  background: #0f1525;
  color: #f4f6fb;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  padding: 14px 44px 14px 18px;
  font-family: inherit;
  font-size: 15.5px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  transition: border-color 0.14s;
}

.matrix-select:hover {
  border-color: rgba(255, 255, 255, 0.24);
}

.matrix-select:focus {
  border-color: #8b8cf6;
}

.select-chevron {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #828aa0;
  pointer-events: none;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.tooltip-wrapper {
  position: relative;
  display: inline-flex;
}

.primary-button,
.ghost-button {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  cursor: pointer;
  font-family: inherit;
  transition:
    border-color 0.14s,
    background 0.14s,
    color 0.14s,
    transform 0.14s;
}

.primary-button {
  background: #8b8cf6;
  color: #0a0e1a;
  border: none;
}

.primary-button:hover {
  transform: translateY(-1px);
}

.ghost-button {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #aab2c5;
}

.ghost-button:hover:not(.disabled) {
  border-color: rgba(255, 255, 255, 0.28);
  color: #f4f6fb;
}

.ghost-button.danger:hover:not(.disabled) {
  border-color: rgba(239, 108, 108, 0.5);
  color: #ef6c6c;
}

.ghost-button.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.icon {
  width: 18px;
  height: 18px;
}

.primary-button .icon {
  width: 20px;
  height: 20px;
}

.rename-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.rename-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.03);
  color: #f4f6fb;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

.rename-input:focus {
  border-color: #8b8cf6;
}

.rename-action-button {
  border-radius: 10px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.14s;
}

.save-button {
  background: #8b8cf6;
  color: #0a0e1a;
  border: 1px solid #8b8cf6;
}

.save-button:hover {
  transform: translateY(-1px);
}

.cancel-button {
  background: rgba(255, 255, 255, 0.04);
  color: #f4f6fb;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-button:hover {
  border-color: rgba(255, 255, 255, 0.28);
}

@media (max-width: 360px) {
  .selector-row {
    flex-wrap: wrap;
  }

  .select-wrap {
    flex-basis: 100%;
  }

  .action-buttons {
    flex: 1;
    justify-content: center;
  }
}
</style>
