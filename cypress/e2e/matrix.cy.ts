const emptyRow = [
  { carry_value: null, total_value: null },
  { carry_value: null, total_value: null },
  { carry_value: null, total_value: null },
]

const populatedRow = [
  { carry_value: 50, total_value: 55 },
  { carry_value: 75, total_value: 80 },
  { carry_value: 100, total_value: 110 },
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
      yardage_values: [[...emptyRow], [...emptyRow]],
      club_labels: ['LW', 'SW'],
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

describe('Matrix Yardage Entry', () => {
  beforeEach(() => {
    setupApiIntercepts()
  })

  describe('matrix rendering', () => {
    it('renders club labels as row headers', () => {
      login()

      cy.contains('LW').should('be.visible')
      cy.contains('SW').should('be.visible')
    })

    it('renders column headers', () => {
      login()

      cy.get('[data-test-id="swing-percentage-container"]').should('have.length', 3)
      cy.get('[data-test-id="swing-percentage-container"]').eq(0).should('contain.text', '50%')
      cy.get('[data-test-id="swing-percentage-container"]').eq(1).should('contain.text', '75%')
      cy.get('[data-test-id="swing-percentage-container"]').eq(2).should('contain.text', '100%')
    })

    it('renders correct number of carry inputs in Carry mode', () => {
      login()

      // 2 clubs × 3 columns = 6 carry inputs
      cy.get('[data-test-id="carry-input"]').should('have.length', 6)
      cy.get('[data-test-id="total-input"]').should('not.exist')
    })

    it('renders only total inputs in Total mode', () => {
      const totalUser = {
        ...userPayload,
        wedge_matrices: [
          {
            ...userPayload.wedge_matrices[0],
            selected_row_display_option: 'Total',
          },
        ],
      }

      cy.intercept('POST', '**/login', {
        statusCode: 200,
        body: { user: totalUser, access_token: 'fake-access-token' },
      }).as('loginRequest')

      cy.intercept('GET', '**/user', {
        statusCode: 200,
        body: { data: totalUser },
      }).as('userRequest')

      login()

      cy.get('[data-test-id="total-input"]').should('have.length', 6)
      cy.get('[data-test-id="carry-input"]').should('not.exist')
    })

    it('renders both carry and total inputs in Both mode', () => {
      const bothUser = {
        ...userPayload,
        wedge_matrices: [
          {
            ...userPayload.wedge_matrices[0],
            selected_row_display_option: 'Both',
          },
        ],
      }

      cy.intercept('POST', '**/login', {
        statusCode: 200,
        body: { user: bothUser, access_token: 'fake-access-token' },
      }).as('loginRequest')

      cy.intercept('GET', '**/user', {
        statusCode: 200,
        body: { data: bothUser },
      }).as('userRequest')

      login()

      cy.get('[data-test-id="carry-input"]').should('have.length', 6)
      cy.get('[data-test-id="total-input"]').should('have.length', 6)
    })

    it('displays pre-existing yardage values', () => {
      const populatedUser = {
        ...userPayload,
        wedge_matrices: [
          {
            ...userPayload.wedge_matrices[0],
            yardage_values: [[...populatedRow], [...populatedRow]],
          },
        ],
      }

      cy.intercept('POST', '**/login', {
        statusCode: 200,
        body: { user: populatedUser, access_token: 'fake-access-token' },
      }).as('loginRequest')

      cy.intercept('GET', '**/user', {
        statusCode: 200,
        body: { data: populatedUser },
      }).as('userRequest')

      login()

      cy.get('[data-test-id="carry-input"]').first().should('have.value', '50')
    })
  })

  describe('yardage value entry', () => {
    it('allows typing a carry yardage value', () => {
      login()

      cy.get('[data-test-id="carry-input"]').first().clear().type('95')
      cy.get('[data-test-id="carry-input"]').first().should('have.value', '95')
    })

    it('allows typing a total yardage value in Both mode', () => {
      const bothUser = {
        ...userPayload,
        wedge_matrices: [
          {
            ...userPayload.wedge_matrices[0],
            selected_row_display_option: 'Both',
          },
        ],
      }

      cy.intercept('POST', '**/login', {
        statusCode: 200,
        body: { user: bothUser, access_token: 'fake-access-token' },
      }).as('loginRequest')

      cy.intercept('GET', '**/user', {
        statusCode: 200,
        body: { data: bothUser },
      }).as('userRequest')

      login()

      cy.get('[data-test-id="total-input"]').first().clear().type('110')
      cy.get('[data-test-id="total-input"]').first().should('have.value', '110')
    })
  })

  describe('clear matrix', () => {
    it('clears all values after confirmation', () => {
      const populatedUser = {
        ...userPayload,
        wedge_matrices: [
          {
            ...userPayload.wedge_matrices[0],
            yardage_values: [[...populatedRow], [...populatedRow]],
          },
        ],
      }

      cy.intercept('POST', '**/login', {
        statusCode: 200,
        body: { user: populatedUser, access_token: 'fake-access-token' },
      }).as('loginRequest')

      cy.intercept('GET', '**/user', {
        statusCode: 200,
        body: { data: populatedUser },
      }).as('userRequest')

      login()

      cy.get('[data-test-id="carry-input"]').first().should('have.value', '50')

      cy.get('[data-test-id="clear-all-button"]').click()
      cy.get('[data-test-id="modal-overlay"]').should('be.visible')
      cy.get('[data-test-id="confirm-button"]').click()

      cy.wait('@syncRequest')
      cy.get('[data-test-id="carry-input"]').first().should('have.value', '')
    })

    it('does not clear when cancelled', () => {
      const populatedUser = {
        ...userPayload,
        wedge_matrices: [
          {
            ...userPayload.wedge_matrices[0],
            yardage_values: [[...populatedRow], [...populatedRow]],
          },
        ],
      }

      cy.intercept('POST', '**/login', {
        statusCode: 200,
        body: { user: populatedUser, access_token: 'fake-access-token' },
      }).as('loginRequest')

      cy.intercept('GET', '**/user', {
        statusCode: 200,
        body: { data: populatedUser },
      }).as('userRequest')

      login()

      cy.get('[data-test-id="carry-input"]').first().should('have.value', '50')

      cy.get('[data-test-id="clear-all-button"]').click()
      cy.get('[data-test-id="modal-overlay"]').should('be.visible')
      cy.get('[data-test-id="cancel-button"]').click()

      cy.get('[data-test-id="modal-overlay"]').should('not.exist')
      cy.get('[data-test-id="carry-input"]').first().should('have.value', '50')
    })
  })
})
