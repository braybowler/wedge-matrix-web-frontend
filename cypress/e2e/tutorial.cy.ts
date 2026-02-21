const userPayload = {
  id: 1,
  email: 'test@example.com',
  has_dismissed_tutorial: false,
  wedge_matrices: [
    {
      id: 1,
      number_of_matrix_columns: 3,
      selected_row_display_option: 'Carry',
      matrix_column_headers: ['50%', '75%', '100%'],
      yardage_values: [[], [], [], []],
    }
  ],
}

function setupApiIntercepts() {
  cy.intercept('POST', '**/login', {
    statusCode: 200,
    body: { user: userPayload, access_token: 'fake-access-token' },
  }).as('loginRequest')

  cy.intercept('GET', '**/user', {
    statusCode: 200,
    body: { user: userPayload },
  }).as('userRequest')

  cy.intercept('PUT', '**/wedge-matrix', {
    statusCode: 200,
    body: { wedge_matrix: userPayload.wedge_matrices },
  }).as('syncRequest')

  cy.intercept('PATCH', '**/user', {
    statusCode: 200,
    body: { user: { ...userPayload, has_dismissed_tutorial: true } },
  }).as('dismissTutorialRequest')
}

function login() {
  cy.visit('/login')
  cy.get('[data-test-id="email-input"]').type('test@example.com')
  cy.get('[data-test-id="password-input"]').type('Password1!')
  cy.get('[data-test-id="login-button"]').click()
  cy.wait('@loginRequest')
  cy.url().should('include', '/matrix')
}

describe('Tutorial Flow', () => {
  beforeEach(() => {
    setupApiIntercepts()
    sessionStorage.clear()
  })

  describe('tutorial modal on matrix page', () => {
    it('shows tutorial modal for new users', () => {
      login()

      cy.get('[data-test-id="tutorial-modal-overlay"]').should('be.visible')
      cy.contains('Welcome to Wedge Matrix!').should('be.visible')
    })

    it('closes modal when Close is clicked', () => {
      login()

      cy.get('[data-test-id="tutorial-dismiss-button"]').click()
      cy.get('[data-test-id="tutorial-modal-overlay"]').should('not.exist')
    })

    it('does not show modal for users who permanently dismissed it', () => {
      const dismissedUser = { ...userPayload, has_dismissed_tutorial: true }

      cy.intercept('GET', '**/user', {
        statusCode: 200,
        body: { user: dismissedUser },
      }).as('userRequest')

      cy.intercept('POST', '**/login', {
        statusCode: 200,
        body: { user: dismissedUser, access_token: 'fake-access-token' },
      }).as('loginRequest')

      login()

      cy.get('[data-test-id="tutorial-modal-overlay"]').should('not.exist')
    })
  })

  describe('tutorial configure flow', () => {
    it('navigates to configure page when Learn More is clicked', () => {
      login()

      cy.get('[data-test-id="tutorial-learn-more-button"]').click()
      cy.url().should('include', '/configure')
    })

    it('walks through all five tutorial steps', () => {
      login()

      cy.get('[data-test-id="tutorial-learn-more-button"]').click()
      cy.url().should('include', '/configure')

      // Step 1: Club selector
      cy.contains('Start by selecting the wedges in your bag.').should('be.visible')
      cy.get('[data-test-id="tutorial-got-it-button"]').should('contain.text', 'Next')
      cy.get('[data-test-id="tutorial-got-it-button"]').click()

      // Step 2: Swing percentage column selector
      cy.contains('Select the number of shots you have, or would like to have, with each wedge.').should('be.visible')
      cy.get('[data-test-id="tutorial-got-it-button"]').should('contain.text', 'Next')
      cy.get('[data-test-id="tutorial-got-it-button"]').click()

      // Step 3: Column header label input
      cy.contains('Set custom column labels.').should('be.visible')
      cy.get('[data-test-id="tutorial-got-it-button"]').should('contain.text', 'Next')
      cy.get('[data-test-id="tutorial-got-it-button"]').click()

      // Step 4: Row display option selector
      cy.contains('Choose whether to track carry distance, total distance, or both.').should(
        'be.visible',
      )
      cy.get('[data-test-id="tutorial-got-it-button"]').should(
        'contain.text',
        'Finish Configuration',
      )
      cy.get('[data-test-id="tutorial-got-it-button"]').click()

      // Should navigate back to matrix page
      cy.url().should('include', '/matrix')

      // Step 5: Matrix highlight
      cy.contains(
        'Enter your yardage values to build your personalized distance chart.',
      ).should('be.visible')
      cy.get('[data-test-id="tutorial-got-it-button"]').should(
        'contain.text',
        'Finish Tutorial',
      )
      cy.get('[data-test-id="tutorial-got-it-button"]').click()

      // Tutorial highlight should be dismissed
      cy.get('[data-test-id="tutorial-got-it-button"]').should('not.exist')
    })
  })
})
