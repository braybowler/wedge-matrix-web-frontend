describe('Reset Password Page', () => {
  describe('page loads with params', () => {
    it('renders the reset password form with token and email', () => {
      cy.visit('/reset-password?token=valid-token&email=test@example.com')

      cy.get('[data-test-id="password-input"]').should('be.visible')
      cy.get('[data-test-id="password-confirmation-input"]').should('be.visible')
      cy.get('[data-test-id="reset-password-button"]').should('be.visible')
    })
  })

  describe('missing params', () => {
    it('shows error when params are missing', () => {
      cy.visit('/reset-password')

      cy.get('[data-test-id="missing-params-error"]').should(
        'contain.text',
        'Invalid reset link',
      )
    })
  })

  describe('password validation', () => {
    beforeEach(() => {
      cy.visit('/reset-password?token=valid-token&email=test@example.com')
    })

    it('shows error when password is empty', () => {
      cy.get('[data-test-id="reset-password-button"]').click()

      cy.get('.error-message').should('contain.text', 'Password is required.')
    })

    it('shows error when passwords do not match', () => {
      cy.get('[data-test-id="password-input"]').type('NewPassword1!')
      cy.get('[data-test-id="password-confirmation-input"]').type('DifferentPassword1!')
      cy.get('[data-test-id="reset-password-button"]').click()

      cy.get('.error-message').should(
        'contain.text',
        'Password and Password Confirmation must match.',
      )
    })
  })

  describe('successful reset', () => {
    it('redirects to login page after successful reset', () => {
      cy.visit('/reset-password?token=valid-token&email=test@example.com')

      cy.intercept('POST', '**/reset-password', {
        statusCode: 200,
        body: { message: 'Your password has been reset.' },
      }).as('resetPasswordRequest')

      cy.get('[data-test-id="password-input"]').type('NewPassword1!')
      cy.get('[data-test-id="password-confirmation-input"]').type('NewPassword1!')
      cy.get('[data-test-id="reset-password-button"]').click()

      cy.wait('@resetPasswordRequest')
      cy.url().should('include', '/login')
    })
  })

  describe('invalid token', () => {
    it('shows error on invalid/expired token', () => {
      cy.visit('/reset-password?token=invalid-token&email=test@example.com')

      cy.intercept('POST', '**/reset-password', {
        statusCode: 400,
        body: { message: 'Invalid or expired reset token.' },
      }).as('resetPasswordRequest')

      cy.get('[data-test-id="password-input"]').type('NewPassword1!')
      cy.get('[data-test-id="password-confirmation-input"]').type('NewPassword1!')
      cy.get('[data-test-id="reset-password-button"]').click()

      cy.wait('@resetPasswordRequest')
      cy.get('[data-test-id="error-message"]').should(
        'contain.text',
        'Invalid or expired reset link. Please request a new one.',
      )
    })
  })

  describe('server error', () => {
    it('shows error message on server error', () => {
      cy.visit('/reset-password?token=valid-token&email=test@example.com')

      cy.intercept('POST', '**/reset-password', {
        statusCode: 500,
        body: { message: 'Unexpected error' },
      }).as('resetPasswordRequest')

      cy.get('[data-test-id="password-input"]').type('NewPassword1!')
      cy.get('[data-test-id="password-confirmation-input"]').type('NewPassword1!')
      cy.get('[data-test-id="reset-password-button"]').click()

      cy.wait('@resetPasswordRequest')
      cy.get('[data-test-id="error-message"]').should(
        'contain.text',
        'Something went wrong. Please try again later.',
      )
    })
  })
})
