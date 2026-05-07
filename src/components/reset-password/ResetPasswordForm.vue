<script setup lang="ts">
import { ref } from 'vue'
import { useAxios } from '@/composables/axios/axios.ts'
import { useRoute, useRouter } from 'vue-router'
import { useValidation } from '@/composables/validation/validation.ts'
import { useLoadingStore } from '@/stores/loading/loadingStore.ts'

const route = useRoute()
const router = useRouter()
const { post } = useAxios()
const { validatePassword } = useValidation()
const { isLoading } = useLoadingStore()

const token = (route.query.token as string) || ''
const email = (route.query.email as string) || ''
const missingParams = !token || !email

const password = ref('')
const passwordConfirmation = ref('')
const showInvalidPasswordErrorMessage = ref(false)
const invalidPasswordErrorMessage = ref('')
const showErrorMessage = ref(false)
const errorMessage = ref('')

const handleResetPasswordSubmission = async () => {
  showInvalidPasswordErrorMessage.value = false
  showErrorMessage.value = false

  const validPassword = validatePassword(password.value, passwordConfirmation.value, true)
  if (!validPassword.isValid) {
    invalidPasswordErrorMessage.value = validPassword.message ?? ''
    showInvalidPasswordErrorMessage.value = true
    return
  }

  const response = await post('/reset-password', {
    token,
    email,
    password: password.value,
    password_confirmation: passwordConfirmation.value,
  })

  if (response?.error) {
    if (response.status === 400) {
      errorMessage.value = 'Invalid or expired reset link. Please request a new one.'
    } else {
      errorMessage.value = 'Something went wrong. Please try again later.'
    }
    showErrorMessage.value = true
    return
  }

  if (response?.status === 200) {
    await router.push({ name: 'login' })
  }
}
</script>

<template>
  <div class="component-container">
    <h2 class="section-title">Reset Password</h2>
    <p class="section-text">Enter your new password.</p>

    <section v-if="missingParams" class="input-container">
      <p class="error-message" data-test-id="missing-params-error">
        Invalid reset link. Please request a new password reset.
      </p>
    </section>

    <section v-else class="input-container">
      <input
        class="input"
        type="password"
        placeholder="New Password"
        v-model="password"
        data-test-id="password-input"
      />
      <input
        class="input"
        type="password"
        placeholder="Confirm New Password"
        v-model="passwordConfirmation"
        data-test-id="password-confirmation-input"
      />

      <p v-if="showInvalidPasswordErrorMessage" class="error-message">
        {{ invalidPasswordErrorMessage }}
      </p>
      <p v-if="showErrorMessage" class="error-message" data-test-id="error-message">
        {{ errorMessage }}
      </p>

      <button
        class="button"
        type="submit"
        :disabled="isLoading"
        @click="handleResetPasswordSubmission"
        data-test-id="reset-password-button"
      >
        Reset Password
      </button>
    </section>

    <p class="section-text">
      <RouterLink to="/login" class="back-link" data-test-id="login-page-link">
        Back to Login
      </RouterLink>
    </p>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.component-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
}

.section-title {
  color: #f3f4f6;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 8px;
}

.section-text {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 300;
}

.input-container {
  background-color: #1f2937;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  margin-top: 12px;
  margin-bottom: 12px;
  gap: 12px;
  align-items: center;
}

.input {
  color: #f3f4f6;
  background-color: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 4px 8px;
  width: 100%;
}

input:focus {
  color: #f3f4f6;
  background-color: #374151;
  border: 1px solid #818cf8;
  border-radius: 8px;
  padding: 4px 8px;
}

.input:focus::placeholder {
  color: transparent;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  font-weight: 300;
}

.button {
  background-color: #374151;
  color: #f3f4f6;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.button:hover:not(:disabled) {
  background-color: #4b5563;
  border-color: #818cf8;
  cursor: pointer;
  transform: translateY(-1px);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.back-link {
  text-decoration: underline;
}

.back-link:hover {
  text-decoration: underline;
  color: #818cf8;
  text-decoration-color: #818cf8;
}
</style>
