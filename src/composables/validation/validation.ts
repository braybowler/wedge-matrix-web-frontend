export function useValidation() {
  const validateEmail = (email: string) => {
    let errorMessage: string

    errorMessage = isEmailValuePresent(email)
    if (errorMessage) {
      return {
        isEmailValid: false,
        errorMessage: errorMessage,
      }
    }

    errorMessage = isEmailValid(email)
    if (errorMessage) {
      return {
        isEmailValid: false,
        errorMessage: errorMessage,
      }
    }

    return {
      isEmailValid: true,
      errorMessage: errorMessage,
    }
  }

  const isEmailValuePresent = (email: string) => {
    if (email === null || email === '') {
      return 'Email is required.'
    }

    return ''
  }

  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

    if (emailRegex.test(email.trim())) {
      return ''
    }

    return 'Email must be valid.'
  }

  const validatePassword = (
    password: string,
    passwordConfirmation?: string,
    shouldMatchConfirmation: boolean = false,
  ) => {
    let errorMessage: string

    errorMessage = isPasswordValuePresent(password)
    if (errorMessage) {
      return {
        isPasswordValid: false,
        errorMessage: errorMessage,
      }
    }

    if (shouldMatchConfirmation) {
      if (!passwordConfirmation) {
        return {
          isPasswordValid: false,
          errorMessage: 'Password Confirmation is required.',
        }
      }

      errorMessage = isPasswordConfirmationValuePresent(passwordConfirmation)
      if (errorMessage) {
        return {
          isPasswordValid: false,
          errorMessage: errorMessage,
        }
      }

      errorMessage = passwordValuesMatch(password, passwordConfirmation)
      if (errorMessage) {
        return {
          isPasswordValid: false,
          errorMessage: errorMessage,
        }
      }
    }

    return {
      isPasswordValid: true,
      errorMessage: '',
    }
  }

  const isPasswordValuePresent = (password: string) => {
    if (password === null || password === '') {
      return 'Password is required.'
    }

    return ''
  }

  const isPasswordConfirmationValuePresent = (passwordConfirmation: string) => {
    if (passwordConfirmation === null || passwordConfirmation === '') {
      return 'Password Confirmation is required.'
    }

    return ''
  }

  const passwordValuesMatch = (password: string, passwordConfirmation: string) => {
    if (passwordConfirmation !== password) {
      return 'Password and Password Confirmation must match.'
    }

    return ''
  }

  return {
    validateEmail,
    validatePassword,
  }
}
