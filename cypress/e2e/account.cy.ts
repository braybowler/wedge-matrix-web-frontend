const emptyRow = [
  { carry_value: null, total_value: null },
  { carry_value: null, total_value: null },
  { carry_value: null, total_value: null },
]

const userPayload = {
  id: 1,
  email: 'test@example.com',
  has_dismissed_tutorial: true,
  wedge_matrices: [
    {
      id: 1,
      label: null,
      number_of_columns: 3,
      selected_row_display_option: 'Carry',
      column_headers: ['50%', '75%', '100%'],
      yardage_values: [[...emptyRow], [...emptyRow], [...emptyRow], [...emptyRow]],
      club_labels: ['LW', 'SW', 'GW', 'PW'],
    },
  ],
}

function setupApiIntercepts() {
  cy.intercept('POST', '**/login', {
    statusCode: 200,
    body: { user: userPayload, access_token: 'fake-access-token' },
  }).as('loginRequest')

  cy.intercept('GET', '**/user', {
    statusCode: 200,
    body: { data: userPayload },
  }).as('userRequest')

  cy.intercept('PUT', '**/wedge-matrix/*', {
    statusCode: 200,
    body: {},
  }).as('syncRequest')
}

function login() {
  cy.visit('/login')
  cy.get('[data-test-id="email-input"]').type('test@example.com')
  cy.get('[data-test-id="password-input"]').type('Password1!')
  cy.get('[data-test-id="login-button"]').click()
  cy.wait('@loginRequest')
  cy.url().should('include', '/matrix')
}

describe('Account Settings', () => {
  beforeEach(() => {
    setupApiIntercepts()
  })

  describe('opening the modal', () => {
    it('opens modal from sidebar button', () => {
      login()

      cy.get('[data-test-id="account-settings-button"]').first().click()
      cy.get('[data-test-id="account-settings-overlay"]').should('be.visible')
    })

    it('closes modal via close button', () => {
      login()

      cy.get('[data-test-id="account-settings-button"]').first().click()
      cy.get('[data-test-id="account-settings-overlay"]').should('be.visible')

      cy.get('[data-test-id="account-settings-close-button"]').click()
      cy.get('[data-test-id="account-settings-overlay"]').should('not.exist')
    })

    it('closes modal via overlay click', () => {
      login()

      cy.get('[data-test-id="account-settings-button"]').first().click()
      cy.get('[data-test-id="account-settings-overlay"]').should('be.visible')

      cy.get('[data-test-id="account-settings-overlay"]').click('topLeft')
      cy.get('[data-test-id="account-settings-overlay"]').should('not.exist')
    })
  })

  describe('delete account flow', () => {
    it('shows confirmation modal when delete is clicked', () => {
      login()

      cy.get('[data-test-id="account-settings-button"]').first().click()
      cy.get('[data-test-id="delete-account-button"]').click()

      cy.get('[data-test-id="modal-overlay"]').should('be.visible')
      cy.contains('This action is permanent').should('be.visible')
    })

    it('cancels deletion and returns to account settings', () => {
      login()

      cy.get('[data-test-id="account-settings-button"]').first().click()
      cy.get('[data-test-id="delete-account-button"]').click()

      cy.get('[data-test-id="modal-overlay"]').should('be.visible')
      cy.get('[data-test-id="cancel-button"]').click()

      cy.get('[data-test-id="modal-overlay"]').should('not.exist')
      cy.get('[data-test-id="account-settings-overlay"]').should('be.visible')
    })

    it('confirms deletion, calls DELETE /user, redirects to login, clears localStorage', () => {
      cy.intercept('DELETE', '**/user', {
        statusCode: 200,
        body: {},
      }).as('deleteUserRequest')

      login()

      cy.get('[data-test-id="account-settings-button"]').first().click()
      cy.get('[data-test-id="delete-account-button"]').click()
      cy.get('[data-test-id="confirm-button"]').click()

      cy.wait('@deleteUserRequest')
      cy.url().should('include', '/login')

      cy.window().its('localStorage').invoke('getItem', 'wedge_matrix_user').should('be.null')
      cy.window().its('localStorage').invoke('getItem', 'wedge_matrix_token').should('be.null')
    })

    it('shows error message when DELETE /user fails', () => {
      cy.intercept('DELETE', '**/user', {
        statusCode: 500,
        body: { message: 'Server error' },
      }).as('deleteUserRequest')

      login()

      cy.get('[data-test-id="account-settings-button"]').first().click()
      cy.get('[data-test-id="delete-account-button"]').click()
      cy.get('[data-test-id="confirm-button"]').click()

      cy.wait('@deleteUserRequest')
      cy.get('[data-test-id="error-message"]').should('be.visible')
    })
  })
})
