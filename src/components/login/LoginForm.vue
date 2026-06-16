<script setup lang="ts">
import { ref } from 'vue'
import { useAxios } from '@/composables/axios/axios.ts'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user/userStore.ts'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import type { User } from '@/types/user'
import { useValidation } from '@/composables/validation/validation.ts'
import { useLoadingStore } from '@/stores/loading/loadingStore.ts'

type LoginResponse = {
  user: User
  access_token: string
}

const router = useRouter()

const { post } = useAxios()

const { validateEmail, validatePassword } = useValidation()

const { initializeUserStoreValues } = useUserStore()
const { initializeMatrixValues } = useMatrixConfigurationStore()

const { isLoading } = useLoadingStore()

const email = ref('')
const showInvalidEmailErrorMessage = ref(false)
const invalidEmailErrorMessage = ref('')

const password = ref('')
const showInvalidPasswordErrorMessage = ref(false)
const invalidPasswordErrorMessage = ref('')

const showLoginErrorMessage = ref(false)
const loginErrorMessage = ref('')

const handleLoginSubmission = async () => {
  showInvalidEmailErrorMessage.value = false
  showInvalidPasswordErrorMessage.value = false
  showLoginErrorMessage.value = false

  const validEmail = validateEmail(email.value)
  if (!validEmail.isEmailValid) {
    invalidEmailErrorMessage.value = validEmail.errorMessage
    showInvalidEmailErrorMessage.value = true
    return
  }
  showInvalidEmailErrorMessage.value = false

  const validPassword = validatePassword(password.value)
  if (!validPassword.isPasswordValid) {
    invalidPasswordErrorMessage.value = validPassword.errorMessage
    showInvalidPasswordErrorMessage.value = true
    return
  }
  showInvalidPasswordErrorMessage.value = false

  const response = await post<LoginResponse>('/login', {
    email: email.value,
    password: password.value,
  })

  if (response?.error) {
    if (response.status === 401 || response.status === 422) {
      loginErrorMessage.value = 'Invalid credentials.'
    } else if (response.status === 0) {
      loginErrorMessage.value = 'Unable to reach the server. Please check your connection.'
    } else {
      loginErrorMessage.value = 'Something went wrong. Please try again later.'
    }
    showLoginErrorMessage.value = true
    return
  }

  if (response?.status === 200 && response?.data) {
    const user: User = response.data.user
    const accessToken: string = response.data.access_token
    initializeStoreValues(user, accessToken)
    await router.push({ name: 'matrix' })
  }
}

const initializeStoreValues = (user: User, accessToken: string) => {
  initializeUserStoreValues(user, accessToken)
  initializeMatrixValues(user.wedge_matrices)
}
</script>

<template>
  <div class="wm-form-panel">
    <div class="wm-form-card">
      <div class="wm-form-head">
        <h1 class="wm-form-title">Log in</h1>
        <p class="wm-form-sub">Let's get dialled in.</p>
      </div>

      <form class="wm-form" @submit.prevent="handleLoginSubmission">
        <label class="wm-field">
          <span class="wm-field-label">Email</span>
          <input
            class="wm-input"
            type="email"
            placeholder="you@example.com"
            v-model="email"
            data-test-id="email-input"
          />
        </label>

        <label class="wm-field">
          <div class="wm-field-row">
            <span class="wm-field-label">Password</span>
            <RouterLink
              to="/forgot-password"
              class="wm-forgot-link"
              data-test-id="forgot-password-link"
            >
              Forgot?
            </RouterLink>
          </div>
          <input
            class="wm-input"
            type="password"
            placeholder="Enter your password"
            v-model="password"
            data-test-id="password-input"
          />
        </label>

        <p v-if="showInvalidEmailErrorMessage" class="error-message">
          {{ invalidEmailErrorMessage }}
        </p>
        <p v-if="showInvalidPasswordErrorMessage" class="error-message">
          {{ invalidPasswordErrorMessage }}
        </p>
        <p v-if="showLoginErrorMessage" class="error-message" data-test-id="login-error-message">
          {{ loginErrorMessage }}
        </p>

        <button
          class="wm-submit"
          type="submit"
          :disabled="isLoading"
          @click.prevent="handleLoginSubmission"
          data-test-id="login-button"
        >
          Log in
        </button>
      </form>

      <p class="wm-form-foot">
        New to Wedge Matrix?
        <RouterLink to="/register" class="wm-foot-link" data-test-id="register-page-link">
          Create an account
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.wm-form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  width: 100%;
}

.wm-form-card {
  width: 100%;
  max-width: 392px;
  animation: wmRise 0.6s ease 0.06s both;
}

@keyframes wmRise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wm-form-head {
  margin-bottom: 30px;
}

.wm-form-title {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #f4f6fb;
  margin: 0 0 8px;
}

.wm-form-sub {
  font-size: 15.5px;
  color: #aab2c5;
  line-height: 1.55;
  margin: 0;
}

.wm-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wm-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wm-field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wm-field-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #828aa0;
}

.wm-forgot-link {
  font-size: 13px;
  color: #8b8cf6;
  font-weight: 600;
}

.wm-forgot-link:hover {
  text-decoration: underline;
}

.wm-input {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 16px;
  font-family: 'Archivo', sans-serif;
  font-size: 15.5px;
  color: #f4f6fb;
  transition:
    border-color 0.15s,
    background 0.15s;
  width: 100%;
}

.wm-input::placeholder {
  color: #6c7488;
}

.wm-input:focus {
  outline: none;
  border-color: #8b8cf6;
  background: rgba(255, 255, 255, 0.04);
}

.error-message {
  color: #ef4444;
  font-size: 13px;
  font-weight: 400;
  margin: 0;
}

.wm-submit {
  margin-top: 8px;
  background: #8b8cf6;
  color: #0a0e1a;
  border: none;
  font-family: 'Archivo', sans-serif;
  font-weight: 700;
  font-size: 16px;
  padding: 15px;
  border-radius: 12px;
  cursor: pointer;
  transition:
    transform 0.15s,
    opacity 0.15s;
}

.wm-submit:hover:not(:disabled) {
  transform: translateY(-1px);
}

.wm-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.wm-form-foot {
  text-align: center;
  font-size: 14.5px;
  color: #828aa0;
  margin: 26px 0 0;
}

.wm-foot-link {
  color: #f4f6fb;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  padding-bottom: 1px;
}

.wm-foot-link:hover {
  border-bottom-color: #8b8cf6;
}
</style>
