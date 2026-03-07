describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  describe('page loads', () => {
    it('renders the login form', () => {
      cy.get('[data-test-id="email-input"]').should('be.visible')
      cy.get('[data-test-id="password-input"]').should('be.visible')
      cy.get('[data-test-id="login-button"]').should('be.visible')
    })
  })

  describe('email validation', () => {
    it('shows error when email is empty', () => {
      cy.get('[data-test-id="password-input"]').type('Password1!')
      cy.get('[data-test-id="login-button"]').click()

      cy.get('.error-message').should('contain.text', 'Email is required.')
    })

    it('shows error when email format is invalid', () => {
      cy.get('[data-test-id="email-input"]').type('not-an-email')
      cy.get('[data-test-id="password-input"]').type('Password1!')
      cy.get('[data-test-id="login-button"]').click()

      cy.get('.error-message').should('contain.text', 'Email must be valid.')
    })
  })

  describe('password validation', () => {
    it('shows error when password is empty', () => {
      cy.get('[data-test-id="email-input"]').type('test@example.com')
      cy.get('[data-test-id="login-button"]').click()

      cy.get('.error-message').should('contain.text', 'Password is required.')
    })
  })

  describe('successful login', () => {
    it('redirects to matrix page after successful login', () => {
      cy.intercept('POST', '**/login', {
        statusCode: 200,
        body: {
          user: {
            id: 1,
            email: 'test@example.com',
            wedge_matrices: [{
              id: 1,
              number_of_matrix_columns: 3,
              selected_row_display_option: 'Carry',
              matrix_column_headers: ['50%', '75%', '100%'],
              yardage_values: [[], [], [], []],
            }],
          },
          access_token: 'fake-access-token',
        },
      }).as('loginRequest')

      cy.intercept('GET', '**/user', {
        statusCode: 200,
        body: {
          data: {
            id: 1,
            email: 'test@example.com',
            wedge_matrices: [
              {
                id: 1,
                number_of_matrix_columns: 3,
                selected_row_display_option: 'Carry',
                matrix_column_headers: ['50%', '75%', '100%'],
                yardage_values: [[], [], [], []],
              },
            ],
          },
        },
      }).as('userRequest')

      cy.get('[data-test-id="email-input"]').type('test@example.com')
      cy.get('[data-test-id="password-input"]').type('Password1!')
      cy.get('[data-test-id="login-button"]').click()

      cy.wait('@loginRequest')
      cy.wait('@userRequest')
      cy.url().should('include', '/matrix')
    })
  })

  describe('invalid credentials', () => {
    it('shows error when credentials are invalid', () => {
      cy.intercept('POST', '**/login', {
        statusCode: 401,
        body: { message: 'Invalid credentials' },
      }).as('loginRequest')

      cy.get('[data-test-id="email-input"]').type('test@example.com')
      cy.get('[data-test-id="password-input"]').type('WrongPassword1!')
      cy.get('[data-test-id="login-button"]').click()

      cy.wait('@loginRequest')
      cy.get('.error-message').should('contain.text', 'Invalid credentials.')
    })
  })
})
