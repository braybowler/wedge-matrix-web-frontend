<script setup lang="ts">
import { ref } from 'vue'
import { useAxios } from '@/composables/axios/axios.ts'
import { useValidation } from '@/composables/validation/validation.ts'
import { useLoadingStore } from '@/stores/loading/loadingStore.ts'

const { post } = useAxios()
const { validateEmail } = useValidation()
const { isLoading } = useLoadingStore()

const email = ref('')
const showInvalidEmailErrorMessage = ref(false)
const invalidEmailErrorMessage = ref('')
const showErrorMessage = ref(false)
const errorMessage = ref('')
const showSuccessMessage = ref(false)

const handleForgotPasswordSubmission = async () => {
  showInvalidEmailErrorMessage.value = false
  showErrorMessage.value = false
  showSuccessMessage.value = false

  const validEmail = validateEmail(email.value)
  if (!validEmail.isEmailValid) {
    invalidEmailErrorMessage.value = validEmail.errorMessage
    showInvalidEmailErrorMessage.value = true
    return
  }

  const response = await post('/forgot-password', {
    email: email.value,
  })

  if (response?.error) {
    errorMessage.value = 'Something went wrong. Please try again later.'
    showErrorMessage.value = true
    return
  }

  if (response?.status === 200) {
    showSuccessMessage.value = true
  }
}
</script>

<template>
  <div class="component-container">
    <h2 class="section-title">Forgot Password</h2>
    <p class="section-text">Enter your email and we'll send you a reset link.</p>

    <section class="input-container">
      <input
        class="input"
        type="email"
        placeholder="Email"
        v-model="email"
        data-test-id="email-input"
      />

      <p v-if="showInvalidEmailErrorMessage" class="error-message">
        {{ invalidEmailErrorMessage }}
      </p>
      <p v-if="showErrorMessage" class="error-message" data-test-id="error-message">
        {{ errorMessage }}
      </p>
      <p v-if="showSuccessMessage" class="success-message" data-test-id="success-message">
        If an account exists with that email, you will receive a password reset link.
      </p>

      <button
        class="button"
        type="submit"
        :disabled="isLoading"
        @click="handleForgotPasswordSubmission"
        data-test-id="forgot-password-button"
      >
        Send Reset Link
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

.success-message {
  color: #4ade80;
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
