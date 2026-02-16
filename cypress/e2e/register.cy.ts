describe('Register Page', () => {
  beforeEach(() => {
    cy.visit('/register')
  })

  describe('page loads', () => {
    it('renders the registration form', () => {
      cy.get('[data-test-id="email-input"]').should('be.visible')
      cy.get('[data-test-id="password-input"]').should('be.visible')
      cy.get('[data-test-id="password-confirmation-input"]').should('be.visible')
      cy.get('[data-test-id="tos-checkbox"]').should('be.visible')
      cy.get('[data-test-id="register-button"]').should('be.visible')
    })
  })

  describe('email validation', () => {
    it('shows error when email is empty', () => {
      cy.get('[data-test-id="password-input"]').type('Password1!')
      cy.get('[data-test-id="password-confirmation-input"]').type('Password1!')
      cy.get('[data-test-id="register-button"]').click()

      cy.get('.error-message').should('contain.text', 'Email is required.')
    })

    it('shows error when email format is invalid', () => {
      cy.get('[data-test-id="email-input"]').type('not-an-email')
      cy.get('[data-test-id="password-input"]').type('Password1!')
      cy.get('[data-test-id="password-confirmation-input"]').type('Password1!')
      cy.get('[data-test-id="register-button"]').click()

      cy.get('.error-message').should('contain.text', 'Email must be valid.')
    })
  })

  describe('password validation', () => {
    it('shows error when password is empty', () => {
      cy.get('[data-test-id="email-input"]').type('test@example.com')
      cy.get('[data-test-id="register-button"]').click()

      cy.get('.error-message').should('contain.text', 'Password is required.')
    })

    it('shows error when password confirmation is empty', () => {
      cy.get('[data-test-id="email-input"]').type('test@example.com')
      cy.get('[data-test-id="password-input"]').type('Password1!')
      cy.get('[data-test-id="register-button"]').click()

      cy.get('.error-message').should('contain.text', 'Password Confirmation is required.')
    })

    it('shows error when passwords do not match', () => {
      cy.get('[data-test-id="email-input"]').type('test@example.com')
      cy.get('[data-test-id="password-input"]').type('Password1!')
      cy.get('[data-test-id="password-confirmation-input"]').type('DifferentPassword1!')
      cy.get('[data-test-id="register-button"]').click()

      cy.get('.error-message').should(
        'contain.text',
        'Password and Password Confirmation must match.',
      )
    })
  })

  describe('TOS validation', () => {
    it('shows error when TOS is not accepted', () => {
      cy.get('[data-test-id="email-input"]').type('test@example.com')
      cy.get('[data-test-id="password-input"]').type('Password1!')
      cy.get('[data-test-id="password-confirmation-input"]').type('Password1!')
      cy.get('[data-test-id="register-button"]').click()

      cy.get('[data-test-id="tos-error-message"]').should(
        'contain.text',
        'You must accept the Terms of Service to register.',
      )
    })
  })

  describe('successful registration', () => {
    it('redirects to login page after successful registration', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 201,
        body: { message: 'Registration successful' },
      }).as('registerRequest')

      cy.get('[data-test-id="email-input"]').type('test@example.com')
      cy.get('[data-test-id="password-input"]').type('Password1!')
      cy.get('[data-test-id="password-confirmation-input"]').type('Password1!')
      cy.get('[data-test-id="tos-checkbox"]').check()
      cy.get('[data-test-id="register-button"]').click()

      cy.wait('@registerRequest')
      cy.url().should('include', '/login')
    })
  })
})
