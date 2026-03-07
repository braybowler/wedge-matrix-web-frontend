describe('Logout Flow', () => {
  const loginAndRedirect = () => {
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: {
        user: {
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

    cy.visit('/login')
    cy.get('[data-test-id="email-input"]').type('test@example.com')
    cy.get('[data-test-id="password-input"]').type('Password1!')
    cy.get('[data-test-id="login-button"]').click()
    cy.wait('@loginRequest')
    cy.wait('@userRequest')
    cy.url().should('include', '/matrix')
  }

  it('logs the user out and redirects to login page', () => {
    loginAndRedirect()

    cy.get('[data-test-id="logout-button"]').first().click()

    cy.url().should('include', '/login')
  })

  it('prevents access to protected routes after logout', () => {
    loginAndRedirect()

    cy.get('[data-test-id="logout-button"]').first().click()
    cy.url().should('include', '/login')

    cy.visit('/matrix')
    cy.url().should('include', '/login')
  })

  it('clears user data from localStorage on logout', () => {
    loginAndRedirect()

    cy.window()
      .its('localStorage')
      .invoke('getItem', 'wedge_matrix_token')
      .should('not.be.null')

    cy.get('[data-test-id="logout-button"]').first().click()
    cy.url().should('include', '/login')

    cy.window()
      .its('localStorage')
      .invoke('getItem', 'wedge_matrix_user')
      .should('be.null')
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'wedge_matrix_token')
      .should('be.null')
  })
})
