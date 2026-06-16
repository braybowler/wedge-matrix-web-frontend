<script setup lang="ts">
import { ref } from 'vue'
import { useAxios } from '@/composables/axios/axios.ts'
import { useRouter } from 'vue-router'
import { useValidation } from '@/composables/validation/validation.ts'
import { useLoadingStore } from '@/stores/loading/loadingStore.ts'
import TosModal from '@/components/register/TosModal.vue'

const router = useRouter()

const { post } = useAxios()

const { validateEmail, validatePassword } = useValidation()

const { isLoading } = useLoadingStore()

const email = ref('')
const showInvalidEmailErrorMessage = ref(false)
const invalidEmailErrorMessage = ref('')

const password = ref('')
const passwordConfirmation = ref('')
const showInvalidPasswordErrorMessage = ref(false)
const invalidPasswordErrorMessage = ref('')

const tosAccepted = ref(false)
const showTosModal = ref(false)
const showTosErrorMessage = ref(false)

const handleRegisterSubmission = async () => {
  showInvalidEmailErrorMessage.value = false
  showInvalidPasswordErrorMessage.value = false
  showTosErrorMessage.value = false

  const validEmail = validateEmail(email.value)
  if (!validEmail.isEmailValid) {
    invalidEmailErrorMessage.value = validEmail.errorMessage
    showInvalidEmailErrorMessage.value = true
    return
  }
  showInvalidEmailErrorMessage.value = false

  const validPassword = validatePassword(password.value, passwordConfirmation.value, true)
  if (!validPassword.isPasswordValid) {
    invalidPasswordErrorMessage.value = validPassword.errorMessage
    showInvalidPasswordErrorMessage.value = true
    return
  }
  showInvalidPasswordErrorMessage.value = false

  if (!tosAccepted.value) {
    showTosErrorMessage.value = true
    return
  }

  const response = await post('/register', {
    email: email.value,
    password: password.value,
    password_confirmation: passwordConfirmation.value,
    tos_accepted: tosAccepted.value,
  })

  if (response?.error) {
    invalidEmailErrorMessage.value = response.error
    showInvalidEmailErrorMessage.value = true
    return
  }

  if (response?.status === 201) {
    await router.push({ name: 'login' })
  }
}
</script>

<template>
  <div class="wm-form-panel">
    <div class="wm-form-card">
      <div class="wm-form-head">
        <h1 class="wm-form-title">Create your account</h1>
        <p class="wm-form-sub">Ready to take your short game to the next level?</p>
      </div>

      <form class="wm-form" @submit.prevent="handleRegisterSubmission">
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
          <span class="wm-field-label">Password</span>
          <input
            class="wm-input"
            type="password"
            placeholder="At least 8 characters"
            v-model="password"
            data-test-id="password-input"
          />
        </label>

        <label class="wm-field">
          <span class="wm-field-label">Confirm password</span>
          <input
            class="wm-input"
            type="password"
            placeholder="Re-enter your password"
            v-model="passwordConfirmation"
            data-test-id="password-confirmation-input"
          />
        </label>

        <label class="wm-tos-row">
          <input
            class="wm-check"
            type="checkbox"
            v-model="tosAccepted"
            data-test-id="tos-checkbox"
          />
          <span class="wm-tos-text">
            I agree to the
            <span class="wm-tos-link" data-test-id="tos-link" @click.prevent="showTosModal = true">
              Terms of Service
            </span>
          </span>
        </label>

        <p v-if="showInvalidEmailErrorMessage" class="error-message">
          {{ invalidEmailErrorMessage }}
        </p>
        <p v-if="showInvalidPasswordErrorMessage" class="error-message">
          {{ invalidPasswordErrorMessage }}
        </p>
        <p v-if="showTosErrorMessage" class="error-message" data-test-id="tos-error-message">
          You must accept the Terms of Service to register.
        </p>

        <TosModal :visible="showTosModal" @close="showTosModal = false" />

        <button
          class="wm-submit"
          type="submit"
          :disabled="isLoading"
          @click.prevent="handleRegisterSubmission"
          data-test-id="register-button"
        >
          Create account
        </button>
      </form>

      <p class="wm-form-foot">
        Already have an account?
        <RouterLink to="/login" class="wm-foot-link" data-test-id="login-page-link">
          Log in
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

.wm-field-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #828aa0;
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

.wm-tos-row {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  cursor: pointer;
  margin-top: 4px;
}

.wm-check {
  appearance: none;
  -webkit-appearance: none;
  flex: none;
  width: 20px;
  height: 20px;
  margin: 0;
  border: 1.5px solid rgba(255, 255, 255, 0.22);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  position: relative;
  transition: all 0.15s;
}

.wm-check:checked {
  background: #8b8cf6;
  border-color: #8b8cf6;
}

.wm-check:checked::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid #0a0e1a;
  border-width: 0 2.5px 2.5px 0;
  transform: rotate(45deg);
}

.wm-tos-text {
  font-size: 14.5px;
  color: #aab2c5;
  line-height: 1.5;
}

.wm-tos-link {
  color: #8b8cf6;
  font-weight: 600;
  cursor: pointer;
}

.wm-tos-link:hover {
  text-decoration: underline;
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
