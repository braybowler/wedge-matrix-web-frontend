<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmationModal from '@/components/matrix/ConfirmationModal.vue'
import { useAxios } from '@/composables/axios/axios.ts'
import { useUserStore } from '@/stores/user/userStore.ts'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const userStore = useUserStore()
const { del } = useAxios()

const showDeleteConfirmation = ref(false)
const errorMessage = ref('')

const email = computed(() => userStore.user?.email ?? '')
const username = computed(() => email.value.split('@')[0] ?? '')
const initials = computed(() => {
  const parts = username.value.split(/[._-]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  return username.value.slice(0, 2).toUpperCase()
})

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

const handleDeleteAccount = () => {
  errorMessage.value = ''
  showDeleteConfirmation.value = true
}

const handleConfirmDelete = async () => {
  const response = await del('/user')

  if (response.error) {
    errorMessage.value = response.error
    showDeleteConfirmation.value = false
    return
  }

  userStore.logout()
  await router.push({ name: 'login' })
}

const handleCancelDelete = () => {
  showDeleteConfirmation.value = false
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="overlay"
      data-test-id="account-settings-overlay"
      @click.self="emit('close')"
      @keydown="handleKeydown"
    >
      <div class="modal" role="dialog" aria-modal="true" aria-label="Account Settings">
        <div class="modal-header">
          <div class="modal-heading">
            <span class="modal-icon" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                />
              </svg>
            </span>
            <h2 class="modal-title">Account Settings</h2>
          </div>
          <button
            class="close-button"
            aria-label="Close"
            data-test-id="account-settings-close-button"
            @click="emit('close')"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="account-row">
          <div class="account-identity">
            <div class="avatar" aria-hidden="true">{{ initials }}</div>
            <div class="account-meta">
              <div class="account-name">{{ username }}</div>
              <div class="account-email" data-test-id="account-email">{{ email }}</div>
            </div>
          </div>
        </div>

        <div class="danger-zone">
          <div class="danger-zone-header">
            <span class="danger-dot" aria-hidden="true" />
            <span class="danger-zone-title">Danger zone</span>
          </div>
          <p class="danger-zone-message">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <p v-if="errorMessage" class="error-message" data-test-id="error-message">
            {{ errorMessage }}
          </p>
          <button
            class="delete-button"
            data-test-id="delete-account-button"
            @click="handleDeleteAccount"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
            >
              <path
                d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
              />
            </svg>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <ConfirmationModal
    :visible="showDeleteConfirmation"
    title="Delete Account"
    message="This action is permanent and cannot be undone. All your data will be deleted."
    @confirm="handleConfirmDelete"
    @cancel="handleCancelDelete"
  />
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  /* Sits below BaseModal's overlay (z-index 50) so the delete
     ConfirmationModal stacks on top of the account settings modal. */
  z-index: 40;
  background: rgba(6, 9, 16, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: overlay-fade 0.18s ease both;
}

@keyframes overlay-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  width: 100%;
  max-width: 520px;
  background: linear-gradient(180deg, #10162a, #0c1120);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px 32px;
  box-shadow: 0 40px 100px -30px rgba(0, 0, 0, 0.8);
  font-family: 'Archivo', system-ui, sans-serif;
  animation: modal-pop 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.1) both;
}

@keyframes modal-pop {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.modal-heading {
  display: flex;
  align-items: center;
  gap: 13px;
}

.modal-icon {
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 10px;
  background: rgba(139, 140, 246, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b8cf6;
}

.modal-title {
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  color: #f4f6fb;
}

.close-button {
  width: 34px;
  height: 34px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #aab2c5;
  cursor: pointer;
  transition:
    border-color 0.14s,
    color 0.14s;
}

.close-button:hover {
  border-color: rgba(255, 255, 255, 0.28);
  color: #f4f6fb;
}

.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 16px;
}

.account-identity {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: 50%;
  background: #8b8cf6;
  color: #0a0e1a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
}

.account-meta {
  min-width: 0;
}

.account-name {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.01em;
  color: #f4f6fb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-email {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
  color: #828aa0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.danger-zone {
  border: 1px solid rgba(239, 108, 108, 0.32);
  border-radius: 14px;
  padding: 20px 18px;
  background: rgba(239, 108, 108, 0.05);
}

.danger-zone-header {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 8px;
}

.danger-dot {
  width: 7px;
  height: 7px;
  flex: none;
  border-radius: 50%;
  background: #ef6c6c;
}

.danger-zone-title {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #ef6c6c;
  font-weight: 700;
}

.danger-zone-message {
  font-size: 14.5px;
  color: #aab2c5;
  line-height: 1.55;
  margin: 0 0 16px;
}

.error-message {
  color: #ef6c6c;
  font-size: 14px;
  margin: 0 0 16px;
}

.delete-button {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  background: #ef6c6c;
  color: #1a0a0c;
  border: none;
  font-weight: 700;
  font-size: 14.5px;
  padding: 11px 20px;
  border-radius: 11px;
  cursor: pointer;
  transition:
    transform 0.14s,
    background 0.14s;
}

.delete-button:hover {
  transform: translateY(-1px);
  background: #f07b7b;
}
</style>
