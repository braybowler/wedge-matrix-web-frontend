type ValidationResult = { isValid: boolean; message: string | null }

export function useValidation() {
  const validateEmail = (email: string): ValidationResult => {
    const presentError = isEmailValuePresent(email)
    if (presentError) return { isValid: false, message: presentError }

    const formatError = isEmailValid(email)
    if (formatError) return { isValid: false, message: formatError }

    return { isValid: true, message: null }
  }

  const isEmailValuePresent = (email: string) => {
    if (email === null || email === '') {
      return 'Email is required.'
    }

    return null
  }

  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

    if (emailRegex.test(email.trim())) {
      return null
    }

    return 'Email must be valid.'
  }

  const validatePassword = (
    password: string,
    passwordConfirmation?: string,
    shouldMatchConfirmation: boolean = false,
  ): ValidationResult => {
    const presentError = isPasswordValuePresent(password)
    if (presentError) return { isValid: false, message: presentError }

    if (shouldMatchConfirmation) {
      if (!passwordConfirmation) {
        return { isValid: false, message: 'Password Confirmation is required.' }
      }

      const confirmPresentError = isPasswordConfirmationValuePresent(passwordConfirmation)
      if (confirmPresentError) return { isValid: false, message: confirmPresentError }

      const matchError = passwordValuesMatch(password, passwordConfirmation)
      if (matchError) return { isValid: false, message: matchError }
    }

    return { isValid: true, message: null }
  }

  const isPasswordValuePresent = (password: string) => {
    if (password === null || password === '') {
      return 'Password is required.'
    }

    return null
  }

  const isPasswordConfirmationValuePresent = (passwordConfirmation: string) => {
    if (passwordConfirmation === null || passwordConfirmation === '') {
      return 'Password Confirmation is required.'
    }

    return null
  }

  const passwordValuesMatch = (password: string, passwordConfirmation: string) => {
    if (passwordConfirmation !== password) {
      return 'Password and Password Confirmation must match.'
    }

    return null
  }

  return {
    validateEmail,
    validatePassword,
  }
}
