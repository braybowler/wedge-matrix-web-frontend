const emptyRow = [
  { carry_value: null, total_value: null },
  { carry_value: null, total_value: null },
  { carry_value: null, total_value: null },
]

const twoMatrixUserPayload = {
  id: 1,
  email: 'test@example.com',
  has_dismissed_tutorial: true,
  wedge_matrices: [
    {
      id: 1,
      label: 'Practice',
      number_of_columns: 3,
      selected_row_display_option: 'Carry',
      column_headers: ['50%', '75%', '100%'],
      yardage_values: [[...emptyRow], [...emptyRow], [...emptyRow], [...emptyRow]],
      club_labels: ['LW', 'SW', 'GW', 'PW'],
    },
    {
      id: 2,
      label: 'Course',
      number_of_columns: 2,
      selected_row_display_option: 'Both',
      column_headers: ['75%', '100%'],
      yardage_values: [
        [
          { carry_value: 60, total_value: 65 },
          { carry_value: 80, total_value: 85 },
        ],
        [
          { carry_value: 70, total_value: 75 },
          { carry_value: 90, total_value: 95 },
        ],
      ],
      club_labels: ['LW', 'SW'],
    },
  ],
}

const singleMatrixUserPayload = {
  id: 1,
  email: 'test@example.com',
  has_dismissed_tutorial: true,
  wedge_matrices: [
    {
      id: 1,
      label: 'Practice',
      number_of_columns: 3,
      selected_row_display_option: 'Carry',
      column_headers: ['50%', '75%', '100%'],
      yardage_values: [[...emptyRow], [...emptyRow], [...emptyRow], [...emptyRow]],
      club_labels: ['LW', 'SW', 'GW', 'PW'],
    },
  ],
}

function setupApiIntercepts(payload = twoMatrixUserPayload) {
  cy.intercept('POST', '**/login', {
    statusCode: 200,
    body: { user: payload, access_token: 'fake-access-token' },
  }).as('loginRequest')

  cy.intercept('GET', '**/user', {
    statusCode: 200,
    body: { data: payload },
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
  cy.wait('@userRequest')
  cy.url().should('include', '/matrix')
}

describe('Matrix Management', () => {
  describe('matrix selector display', () => {
    it('shows dropdown with matrix labels', () => {
      setupApiIntercepts()
      login()

      cy.get('[data-test-id="matrix-dropdown"]').should('be.visible')
      cy.get('[data-test-id="matrix-dropdown"]').find('option').should('have.length', 2)
      cy.get('[data-test-id="matrix-dropdown"]').find('option').eq(0).should('contain.text', 'Practice')
      cy.get('[data-test-id="matrix-dropdown"]').find('option').eq(1).should('contain.text', 'Course')
    })

    it('shows action buttons', () => {
      setupApiIntercepts()
      login()

      cy.get('[data-test-id="create-matrix-button"]').should('be.visible')
      cy.get('[data-test-id="rename-matrix-button"]').should('be.visible')
      cy.get('[data-test-id="delete-matrix-button"]').should('be.visible')
    })
  })

  describe('create matrix', () => {
    it('creates new matrix via POST and adds to dropdown', () => {
      setupApiIntercepts()

      cy.intercept('POST', '**/wedge-matrix', {
        statusCode: 201,
        body: {
          data: {
            id: 3,
            label: 'Matrix 3',
            number_of_columns: 4,
            selected_row_display_option: 'Carry',
            column_headers: ['', '', '', ''],
            yardage_values: [],
            club_labels: ['LW', 'SW', 'GW', 'PW'],
          },
        },
      }).as('createMatrixRequest')

      login()

      cy.get('[data-test-id="create-matrix-button"]').click()
      cy.wait('@createMatrixRequest')

      cy.get('[data-test-id="matrix-dropdown"]').find('option').should('have.length', 3)
    })

    it('shows error when create fails', () => {
      setupApiIntercepts()

      cy.intercept('POST', '**/wedge-matrix', {
        statusCode: 500,
        body: { message: 'Failed to create' },
      }).as('createMatrixRequest')

      login()

      cy.get('[data-test-id="create-matrix-button"]').click()
      cy.wait('@createMatrixRequest')

      cy.get('[data-test-id="sync-error-message"]').should('be.visible')
    })
  })

  describe('rename matrix', () => {
    beforeEach(() => {
      setupApiIntercepts()
    })

    it('shows rename input when button clicked', () => {
      login()

      cy.get('[data-test-id="rename-row"]').should('not.exist')
      cy.get('[data-test-id="rename-matrix-button"]').click()
      cy.get('[data-test-id="rename-row"]').should('be.visible')
    })

    it('populates input with current label', () => {
      login()

      cy.get('[data-test-id="rename-matrix-button"]').click()
      cy.get('[data-test-id="rename-input"]').should('have.value', 'Practice')
    })

    it('saves rename on Save click', () => {
      login()

      cy.get('[data-test-id="rename-matrix-button"]').click()
      cy.get('[data-test-id="rename-input"]').clear().type('Updated Name')
      cy.get('[data-test-id="rename-save"]').click()

      cy.wait('@syncRequest')
      cy.get('[data-test-id="rename-row"]').should('not.exist')
    })

    it('cancels rename without saving', () => {
      login()

      cy.get('[data-test-id="rename-matrix-button"]').click()
      cy.get('[data-test-id="rename-input"]').clear().type('Updated Name')
      cy.get('[data-test-id="rename-cancel"]').click()

      cy.get('[data-test-id="rename-row"]').should('not.exist')
      cy.get('[data-test-id="matrix-dropdown"]')
        .find('option')
        .eq(0)
        .should('contain.text', 'Practice')
    })

    it('saves rename on Enter key', () => {
      login()

      cy.get('[data-test-id="rename-matrix-button"]').click()
      cy.get('[data-test-id="rename-input"]').clear().type('Enter Name{enter}')

      cy.wait('@syncRequest')
      cy.get('[data-test-id="rename-row"]').should('not.exist')
    })

    it('cancels rename on Escape key', () => {
      login()

      cy.get('[data-test-id="rename-matrix-button"]').click()
      cy.get('[data-test-id="rename-input"]').type('{esc}')

      cy.get('[data-test-id="rename-row"]').should('not.exist')
    })
  })

  describe('delete matrix', () => {
    it('shows confirmation modal', () => {
      setupApiIntercepts()
      login()

      cy.get('[data-test-id="delete-matrix-button"]').click()
      cy.get('[data-test-id="modal-overlay"]').should('be.visible')
      cy.contains('Are you sure you want to delete this matrix?').should('be.visible')
    })

    it('deletes matrix when confirmed', () => {
      setupApiIntercepts()

      cy.intercept('DELETE', '**/wedge-matrix/*', {
        statusCode: 200,
        body: {},
      }).as('deleteMatrixRequest')

      login()

      cy.get('[data-test-id="delete-matrix-button"]').click()
      cy.get('[data-test-id="confirm-button"]').click()

      cy.wait('@deleteMatrixRequest')
      cy.get('[data-test-id="matrix-dropdown"]').find('option').should('have.length', 1)
    })

    it('cancels deletion', () => {
      setupApiIntercepts()
      login()

      cy.get('[data-test-id="delete-matrix-button"]').click()
      cy.get('[data-test-id="modal-overlay"]').should('be.visible')
      cy.get('[data-test-id="cancel-button"]').click()

      cy.get('[data-test-id="modal-overlay"]').should('not.exist')
      cy.get('[data-test-id="matrix-dropdown"]').find('option').should('have.length', 2)
    })

    it('disables delete button when only one matrix remains', () => {
      setupApiIntercepts(singleMatrixUserPayload)
      login()

      cy.get('[data-test-id="delete-matrix-button"]').should('be.disabled')
    })
  })

  describe('switch matrix', () => {
    it('switches to another matrix and loads its data', () => {
      setupApiIntercepts()
      login()

      // Currently on matrix 1 (Practice) with Carry mode - 3 columns
      cy.get('[data-test-id="carry-input"]').should('exist')

      // Switch to matrix 2 (Course) which has Both mode - 2 columns
      cy.get('[data-test-id="matrix-dropdown"]').select('2')

      cy.get('[data-test-id="swing-percentage-container"]').should('have.length', 2)
      cy.get('[data-test-id="carry-input"]').should('exist')
      cy.get('[data-test-id="total-input"]').should('exist')
    })
  })
})
