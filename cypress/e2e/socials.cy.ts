describe('Socials Links', () => {
  const loginAndRedirect = () => {
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: {
        user: {
          id: 1,
          email: 'test@example.com',
          has_dismissed_tutorial: true,
          wedge_matrices: [
            {
              id: 1,
              number_of_columns: 3,
              selected_row_display_option: 'Carry',
              column_headers: ['50%', '75%', '100%'],
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
          has_dismissed_tutorial: true,
          wedge_matrices: [
            {
              id: 1,
              number_of_columns: 3,
              selected_row_display_option: 'Carry',
              column_headers: ['50%', '75%', '100%'],
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

  beforeEach(() => {
    loginAndRedirect()
  })

  it('renders X social link in the sidebar', () => {
    cy.get('[data-test-id="social-x-link"]')
      .should('be.visible')
      .should('have.attr', 'href', 'https://x.com/wedgematrixbray')
      .should('have.attr', 'target', '_blank')
      .should('have.attr', 'rel', 'noopener noreferrer')
  })

  it('renders X social link in the mobile drawer', () => {
    cy.viewport(375, 667)

    cy.get('[data-test-id="hamburger-button"]').click()
    cy.get('[data-test-id="mobile-drawer"]').should('be.visible')

    cy.get('[data-test-id="mobile-drawer"] [data-test-id="social-x-link"]')
      .should('be.visible')
      .should('have.attr', 'href', 'https://x.com/wedgematrixbray')
      .should('have.attr', 'target', '_blank')
      .should('have.attr', 'rel', 'noopener noreferrer')
  })

  it('renders buy me a coffee link in the sidebar', () => {
    cy.get('[data-test-id="buy-me-a-coffee-link"]')
      .should('be.visible')
      .should('have.attr', 'href', 'https://buymeacoffee.com/wedgematrix')
      .should('have.attr', 'target', '_blank')
  })
})
