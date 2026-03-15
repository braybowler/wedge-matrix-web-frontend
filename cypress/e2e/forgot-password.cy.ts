describe('Forgot Password Page', () => {
  beforeEach(() => {
    cy.visit('/forgot-password')
  })

  describe('page loads', () => {
    it('renders the forgot password form', () => {
      cy.get('[data-test-id="email-input"]').should('be.visible')
      cy.get('[data-test-id="forgot-password-button"]').should('be.visible')
    })
  })

  describe('email validation', () => {
    it('shows error when email is empty', () => {
      cy.get('[data-test-id="forgot-password-button"]').click()

      cy.get('.error-message').should('contain.text', 'Email is required.')
    })

    it('shows error when email format is invalid', () => {
      cy.get('[data-test-id="email-input"]').type('not-an-email')
      cy.get('[data-test-id="forgot-password-button"]').click()

      cy.get('.error-message').should('contain.text', 'Email must be valid.')
    })
  })

  describe('successful submission', () => {
    it('shows success message after submitting', () => {
      cy.intercept('POST', '**/forgot-password', {
        statusCode: 200,
        body: {
          message:
            'If an account exists with that email, you will receive a password reset link.',
        },
      }).as('forgotPasswordRequest')

      cy.get('[data-test-id="email-input"]').type('test@example.com')
      cy.get('[data-test-id="forgot-password-button"]').click()

      cy.wait('@forgotPasswordRequest')
      cy.get('[data-test-id="success-message"]').should(
        'contain.text',
        'If an account exists with that email, you will receive a password reset link.',
      )
    })
  })

  describe('server error', () => {
    it('shows error message on server error', () => {
      cy.intercept('POST', '**/forgot-password', {
        statusCode: 500,
        body: { message: 'Unexpected error' },
      }).as('forgotPasswordRequest')

      cy.get('[data-test-id="email-input"]').type('test@example.com')
      cy.get('[data-test-id="forgot-password-button"]').click()

      cy.wait('@forgotPasswordRequest')
      cy.get('[data-test-id="error-message"]').should(
        'contain.text',
        'Something went wrong. Please try again later.',
      )
    })
  })

  describe('navigation', () => {
    it('navigates back to login page', () => {
      cy.get('[data-test-id="login-page-link"]').click()
      cy.url().should('include', '/login')
    })
  })
})
