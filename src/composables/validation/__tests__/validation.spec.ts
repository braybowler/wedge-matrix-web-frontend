import { describe, expect, it } from 'vitest'
import { useValidation } from '@/composables/validation/validation.ts'

describe('useValidation Composable', () => {
  describe('Email Validation', () => {
    it.each([
      {
        email: '',
        expectedValidation: false,
        expectedErrorMessage: 'Email is required.',
      },
      {
        email: 'test',
        expectedValidation: false,
        expectedErrorMessage: 'Email must be valid.',
      },
      {
        email: 'test@domain',
        expectedValidation: false,
        expectedErrorMessage: 'Email must be valid.',
      },
      {
        email: 'test@domain.',
        expectedValidation: false,
        expectedErrorMessage: 'Email must be valid.',
      },
      {
        email: 'test@.',
        expectedValidation: false,
        expectedErrorMessage: 'Email must be valid.',
      },
      {
        email: 'test@@domain.com',
        expectedValidation: false,
        expectedErrorMessage: 'Email must be valid.',
      },
      {
        email: 'test @domain.com',
        expectedValidation: false,
        expectedErrorMessage: 'Email must be valid.',
      },
      {
        email: 'test@domain.com',
        expectedValidation: true,
        expectedErrorMessage: '',
      },
    ])(
      'validates email input: $email and reports: $expectedErrorMessage',
      ({ email, expectedValidation, expectedErrorMessage }) => {
        const validation = useValidation()
        const emailValidationObject = validation.validateEmail(email)

        expect(emailValidationObject.isEmailValid).toBe(expectedValidation)
        expect(emailValidationObject.errorMessage).toBe(expectedErrorMessage)
      },
    )
  })

  describe('Password Validation', () => {
    it.each([
      {
        password: '',
        passwordConfirmation: 'password',
        expectedErrorMessage: 'Password is required.',
        expectedValidation: false,
      },
      {
        password: 'password',
        passwordConfirmation: '',
        expectedErrorMessage: 'Password Confirmation is required.',
        expectedValidation: false,
      },
      {
        password: 'password',
        passwordConfirmation: 'different',
        expectedErrorMessage: 'Password and Password Confirmation must match.',
        expectedValidation: false,
      },
      {
        password: 'different',
        passwordConfirmation: 'password',
        expectedErrorMessage: 'Password and Password Confirmation must match.',
        expectedValidation: false,
      },
      {
        password: 'password',
        passwordConfirmation: 'password',
        expectedErrorMessage: '',
        expectedValidation: true,
      },
    ])(
      'validates password: $password and password confirmation: $passwordConfirmation input and reports: $expectedErrorMessage',
      ({ password, passwordConfirmation, expectedErrorMessage, expectedValidation }) => {
        const validation = useValidation()
        const passwordValidationObject = validation.validatePassword(
          password,
          passwordConfirmation,
          true,
        )

        expect(passwordValidationObject.isPasswordValid).toBe(expectedValidation)
        expect(passwordValidationObject.errorMessage).toBe(expectedErrorMessage)
      },
    )
  })
})
