<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseModal from '@/components/shared/BaseModal.vue'
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
  <BaseModal
    :visible="visible"
    label="Account Settings"
    test-id="account-settings-overlay"
    @close="emit('close')"
  >
    <div class="modal-header">
      <h2 class="modal-title">Account Settings</h2>
      <button
        class="close-button"
        data-test-id="account-settings-close-button"
        @click="emit('close')"
      >
        &times;
      </button>
    </div>

    <div class="danger-zone">
      <h3 class="danger-zone-title">Danger Zone</h3>
      <p class="danger-zone-message">Permanently delete your account and all associated data.</p>
      <p v-if="errorMessage" class="error-message" data-test-id="error-message">
        {{ errorMessage }}
      </p>
      <button
        class="delete-button"
        data-test-id="delete-account-button"
        @click="handleDeleteAccount"
      >
        Delete Account
      </button>
    </div>
  </BaseModal>

  <ConfirmationModal
    :visible="showDeleteConfirmation"
    title="Delete Account"
    message="This action is permanent and cannot be undone. All your data will be deleted."
    @confirm="handleConfirmDelete"
    @cancel="handleCancelDelete"
  />
</template>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-title {
  color: #f3f4f6;
  font-weight: 700;
  font-size: 18px;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-button:hover {
  color: #f3f4f6;
}

.danger-zone {
  border: 1px solid #dc2626;
  border-radius: 8px;
  padding: 16px;
}

.danger-zone-title {
  color: #dc2626;
  font-weight: 700;
  font-size: 16px;
  margin: 0 0 8px;
}

.danger-zone-message {
  color: #9ca3af;
  font-size: 14px;
  margin: 0 0 16px;
}

.error-message {
  color: #dc2626;
  font-size: 14px;
  margin: 0 0 16px;
}

.delete-button {
  background-color: #dc2626;
  color: #f3f4f6;
  border: 1px solid #dc2626;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-button:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
}
</style>
