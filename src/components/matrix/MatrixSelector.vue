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

function matrixDisplayLabel(matrix: { id: number; label: string | null }) {
  return matrix.label ?? 'Matrix ' + matrix.id
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
  <div data-test-id="matrix-selector">
    <label v-if="props.label" class="selector-label">{{ props.label }}</label>
    <div class="selector-row">
      <select
        class="matrix-select"
        :value="selectedMatrixId"
        data-test-id="matrix-dropdown"
        @change="handleMatrixChange"
      >
        <option v-for="matrix in matrices" :key="matrix.id" :value="matrix.id">
          {{ matrixDisplayLabel(matrix) }}
        </option>
      </select>

      <div v-if="!props.readonly" class="action-buttons">
        <div class="tooltip-wrapper">
          <button
            class="icon-button"
            aria-label="New Matrix"
            data-test-id="create-matrix-button"
            @click="handleCreate"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="icon"
              aria-hidden="true"
            >
              <path
                d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"
              />
            </svg>
          </button>
          <span class="tooltip">New Matrix</span>
        </div>

        <div class="tooltip-wrapper">
          <button
            class="icon-button"
            aria-label="Rename"
            data-test-id="rename-matrix-button"
            @click="startRename"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="icon"
              aria-hidden="true"
            >
              <path
                d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z"
              />
              <path
                d="M3.5 5.75c0-.69.56-1.25 1.25-1.25h5.5a.75.75 0 0 0 0-1.5h-5.5A2.75 2.75 0 0 0 2 5.75v8.5A2.75 2.75 0 0 0 4.75 17h8.5A2.75 2.75 0 0 0 16 14.25v-5.5a.75.75 0 0 0-1.5 0v5.5c0 .69-.56 1.25-1.25 1.25h-8.5c-.69 0-1.25-.56-1.25-1.25v-8.5Z"
              />
            </svg>
          </button>
          <span class="tooltip">Rename</span>
        </div>

        <div class="tooltip-wrapper">
          <button
            class="icon-button"
            :class="{ disabled: !canDelete }"
            :disabled="!canDelete"
            aria-label="Delete Matrix"
            data-test-id="delete-matrix-button"
            @click="handleDeleteClick"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="icon"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                clip-rule="evenodd"
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
.selector-label {
  color: #f3f4f6;
  font-size: 16px;
  font-weight: 700;
  display: block;
  margin-bottom: 12px;
}

.selector-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.matrix-select {
  flex: 1;
  background-color: #374151;
  color: #f3f4f6;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 8px 24px 8px 12px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  appearance: auto;
}

.matrix-select:focus {
  border-color: #818cf8;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.icon-button:hover:not(.disabled) {
  background-color: #4b5563;
  border-color: #818cf8;
  color: #f3f4f6;
  cursor: pointer;
  transform: translateY(-1px);
}

.icon-button.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.icon {
  width: 20px;
  height: 20px;
}

.rename-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.rename-input {
  flex: 1;
  background-color: #374151;
  color: #f3f4f6;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 14px;
  outline: none;
}

.rename-input:focus {
  border-color: #818cf8;
}

.rename-action-button {
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-button {
  background-color: #818cf8;
  color: #f3f4f6;
  border: 1px solid #818cf8;
}

.save-button:hover {
  background-color: #6366f1;
}

.cancel-button {
  background-color: #374151;
  color: #f3f4f6;
  border: 1px solid #4b5563;
}

.cancel-button:hover {
  background-color: #4b5563;
}
</style>
