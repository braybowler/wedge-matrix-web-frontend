import { describe, expect, it } from 'vitest'
import { useValidation } from '@/composables/validation/validation.ts'

describe('useValidation Composable', () => {
  describe('Email Validation', () => {
    it.each([
      {
        email: '',
        expectedValid: false,
        expectedMessage: 'Email is required.',
      },
      {
        email: 'test',
        expectedValid: false,
        expectedMessage: 'Email must be valid.',
      },
      {
        email: 'test@domain',
        expectedValid: false,
        expectedMessage: 'Email must be valid.',
      },
      {
        email: 'test@domain.',
        expectedValid: false,
        expectedMessage: 'Email must be valid.',
      },
      {
        email: 'test@.',
        expectedValid: false,
        expectedMessage: 'Email must be valid.',
      },
      {
        email: 'test@@domain.com',
        expectedValid: false,
        expectedMessage: 'Email must be valid.',
      },
      {
        email: 'test @domain.com',
        expectedValid: false,
        expectedMessage: 'Email must be valid.',
      },
      {
        email: 'test@domain.com',
        expectedValid: true,
        expectedMessage: null,
      },
    ])(
      'validates email input: $email and reports: $expectedMessage',
      ({ email, expectedValid, expectedMessage }) => {
        const validation = useValidation()
        const result = validation.validateEmail(email)

        expect(result.isValid).toBe(expectedValid)
        expect(result.message).toBe(expectedMessage)
      },
    )
  })

  describe('Password Validation', () => {
    it.each([
      {
        password: '',
        passwordConfirmation: 'password',
        expectedMessage: 'Password is required.',
        expectedValid: false,
      },
      {
        password: 'password',
        passwordConfirmation: '',
        expectedMessage: 'Password Confirmation is required.',
        expectedValid: false,
      },
      {
        password: 'password',
        passwordConfirmation: 'different',
        expectedMessage: 'Password and Password Confirmation must match.',
        expectedValid: false,
      },
      {
        password: 'different',
        passwordConfirmation: 'password',
        expectedMessage: 'Password and Password Confirmation must match.',
        expectedValid: false,
      },
      {
        password: 'password',
        passwordConfirmation: 'password',
        expectedMessage: null,
        expectedValid: true,
      },
    ])(
      'validates password: $password and password confirmation: $passwordConfirmation input and reports: $expectedMessage',
      ({ password, passwordConfirmation, expectedMessage, expectedValid }) => {
        const validation = useValidation()
        const result = validation.validatePassword(password, passwordConfirmation, true)

        expect(result.isValid).toBe(expectedValid)
        expect(result.message).toBe(expectedMessage)
      },
    )
  })
})
