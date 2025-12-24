<script setup lang="ts">
import { ref } from 'vue'
import { useAxios } from '@/composables/axios/axios.ts'
import { useRouter } from 'vue-router'
import { useValidation } from '@/composables/validation/validation.ts'

const router = useRouter()

const { post } = useAxios()

const { validateEmail, validatePassword } = useValidation()

const email = ref('')
const showInvalidEmailErrorMessage = ref(false)
const invalidEmailErrorMessage = ref('')

const password = ref('')
const passwordConfirmation = ref('')
const showInvalidPasswordErrorMessage = ref(false)
const invalidPasswordErrorMessage = ref('')

const handleRegisterSubmission = async () => {
  showInvalidEmailErrorMessage.value = false
  showInvalidPasswordErrorMessage.value = false

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

  const response = await post('/register', {
    email: email.value,
    password: password.value,
    password_confirmation: passwordConfirmation.value,
  })

  if (response?.status === 201) {
    await router.push({ name: 'login' })
  }
}
</script>

<template>
  <div class="component-container">
    <h2 class="section-title">Wedge Matrix</h2>
    <p class="section-text">Ready to take your short game to the next level?</p>

    <section class="input-container">
      <input
        class="input"
        type="text"
        placeholder="Email"
        v-model="email"
        data-test-id="email-input"
      />
      <input
        class="input"
        type="password"
        placeholder="Password"
        v-model="password"
        data-test-id="password-input"
      />
      <input
        class="input"
        type="password"
        placeholder="Confirm Password"
        v-model="passwordConfirmation"
        data-test-id="password-confirmation-input"
      />

      <p v-if="showInvalidEmailErrorMessage" class="error-message">
        {{ invalidEmailErrorMessage }}
      </p>
      <p v-if="showInvalidPasswordErrorMessage" class="error-message">
        {{ invalidPasswordErrorMessage }}
      </p>
      <button
        class="button"
        type="submit"
        @click="handleRegisterSubmission"
        data-test-id="register-button"
      >
        Register
      </button>
    </section>

    <p class="section-text">
      Already have an account?
      <RouterLink to="/login" class="login-link" data-test-id="login-page-link">
        Login here.
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
  color: #818cf8;
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
}

.button:hover {
  background-color: #374151;
  color: #f3f4f6;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.login-link {
  text-decoration: underline;
}

.login-link:hover {
  text-decoration: underline;
  color: #818cf8;
  text-decoration-color: #818cf8;
}
</style>
