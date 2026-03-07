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
      number_of_columns: 3,
      selected_row_display_option: 'Carry',
      column_headers: ['50%', '75%', '100%'],
      yardage_values: [[...emptyRow], [...emptyRow], [...emptyRow], [...emptyRow]],
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

describe('Download PDF', () => {
  beforeEach(() => {
    setupApiIntercepts()
  })

  it('renders the download PDF button on the matrix page', () => {
    login()

    cy.get('[data-test-id="download-pdf-button"]').should('be.visible')
  })

  it('requests the download endpoint when the button is clicked', () => {
    cy.intercept('GET', '**/wedge-matrix/1/download', {
      statusCode: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="wedge-matrix.pdf"',
      },
      body: new Blob(['fake-pdf-content'], { type: 'application/pdf' }),
    }).as('downloadRequest')

    login()

    cy.get('[data-test-id="download-pdf-button"]').click()
    cy.wait('@downloadRequest')
  })

  it('shows an error message when the download fails', () => {
    cy.intercept('GET', '**/wedge-matrix/1/download', {
      statusCode: 500,
      body: { message: 'Failed to generate PDF' },
    }).as('downloadRequest')

    login()

    cy.get('[data-test-id="download-pdf-button"]').click()
    cy.wait('@downloadRequest')

    cy.get('[data-test-id="sync-error-message"]').should('be.visible')
  })

  it('syncs unsaved changes before downloading', () => {
    cy.intercept('PUT', '**/wedge-matrix/1', {
      statusCode: 200,
      body: {},
    }).as('syncRequest')

    cy.intercept('GET', '**/wedge-matrix/1/download', {
      statusCode: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="wedge-matrix.pdf"',
      },
      body: new Blob(['fake-pdf-content'], { type: 'application/pdf' }),
    }).as('downloadRequest')

    login()

    // Make a change to trigger requiresSync
    cy.get('[data-test-id="carry-input"]').first().clear().type('95').trigger('change')

    cy.get('[data-test-id="download-pdf-button"]').click()

    // Sync should fire before the download
    cy.wait('@syncRequest')
    cy.wait('@downloadRequest')
  })
})
