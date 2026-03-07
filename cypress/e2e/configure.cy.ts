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

function navigateToConfigure() {
  login()
  cy.visit('/configure')
  cy.url().should('include', '/configure')
}

describe('Configure Page', () => {
  beforeEach(() => {
    setupApiIntercepts()
  })

  describe('page rendering', () => {
    it('renders all four configuration sections', () => {
      navigateToConfigure()

      cy.contains('Clubs').should('be.visible')
      cy.contains('Number of Swing Columns').should('be.visible')
      cy.contains('Column Header Labels').should('be.visible')
      cy.contains('Row Display Options').scrollIntoView().should('be.visible')
    })
  })

  describe('club selection', () => {
    it('shows selected clubs as active', () => {
      navigateToConfigure()

      cy.get('[data-test-id="club-selector-LW"]').should('have.class', 'tile-active')
      cy.get('[data-test-id="club-selector-SW"]').should('have.class', 'tile-active')
      cy.get('[data-test-id="club-selector-GW"]').should('have.class', 'tile-active')
      cy.get('[data-test-id="club-selector-PW"]').should('have.class', 'tile-active')
    })

    it('deselects a club when clicked', () => {
      navigateToConfigure()

      cy.get('[data-test-id="club-selector-GW"]').should('have.class', 'tile-active')
      cy.get('[data-test-id="club-selector-GW"]').click()
      cy.get('[data-test-id="club-selector-GW"]').should('have.class', 'tile')
    })

    it('selects a previously unselected club', () => {
      navigateToConfigure()

      cy.get('[data-test-id="club-selector-AW"]').should('have.class', 'tile')
      cy.get('[data-test-id="club-selector-AW"]').click()
      cy.get('[data-test-id="club-selector-AW"]').should('have.class', 'tile-active')
    })
  })

  describe('swing column count', () => {
    it('shows current column count as active', () => {
      navigateToConfigure()

      cy.get('[data-test-id="column-count-3"]').should('have.class', 'tile-active')
    })

    it('changes column count when a tile is clicked', () => {
      navigateToConfigure()

      cy.get('[data-test-id="column-count-2"]').should('have.class', 'tile')
      cy.get('[data-test-id="column-count-2"]').click()
      cy.get('[data-test-id="column-count-2"]').should('have.class', 'tile-active')
      cy.get('[data-test-id="column-count-3"]').should('have.class', 'tile')
    })
  })

  describe('column header labels', () => {
    it('renders correct number of column header dropdowns', () => {
      navigateToConfigure()

      cy.get('[data-test-id="column-label-selector-pair"]').should('have.length', 3)
    })

    it('changes a column header label via dropdown', () => {
      navigateToConfigure()

      cy.get('[data-test-id="column-header-selector"]').first().select('25%')
      cy.get('[data-test-id="column-header-selector"]').first().should('have.value', '25%')
    })

    it('switches to Clock system and shows clock options', () => {
      navigateToConfigure()

      cy.get('[data-test-id="swing-feel-system-Percentage"]').should('have.class', 'tile-active')
      cy.get('[data-test-id="swing-feel-system-Clock"]').click()
      cy.get('[data-test-id="swing-feel-system-Clock"]').should('have.class', 'tile-active')

      cy.get('[data-test-id="column-header-selector"]').first().find('option').first().should('have.value', '7:00')
    })

    it('switches back to Percentage system', () => {
      navigateToConfigure()

      cy.get('[data-test-id="swing-feel-system-Clock"]').click()
      cy.get('[data-test-id="swing-feel-system-Clock"]').should('have.class', 'tile-active')

      cy.get('[data-test-id="swing-feel-system-Percentage"]').click()
      cy.get('[data-test-id="swing-feel-system-Percentage"]').should('have.class', 'tile-active')

      cy.get('[data-test-id="column-header-selector"]').first().find('option').first().should('have.value', '25%')
    })
  })

  describe('row display option', () => {
    it('shows current option as active', () => {
      navigateToConfigure()

      cy.get('[data-test-id="row-display-option-Carry"]').should('have.class', 'tile-active')
    })

    it('changes display option when a tile is clicked', () => {
      navigateToConfigure()

      cy.get('[data-test-id="row-display-option-Both"]').should('have.class', 'tile')
      cy.get('[data-test-id="row-display-option-Both"]').click()
      cy.get('[data-test-id="row-display-option-Both"]').should('have.class', 'tile-active')
      cy.get('[data-test-id="row-display-option-Carry"]').should('have.class', 'tile')
    })
  })

  describe('sync on navigation', () => {
    it('triggers sync PUT when navigating away', () => {
      login()

      // Navigate to configure via sidebar link
      cy.get('.desktop-sidebar').contains('a', 'Configure').click()
      cy.url().should('include', '/configure')

      // Make a change to trigger requiresSync
      cy.get('[data-test-id="club-selector-AW"]').click()

      // Navigate away via sidebar link
      cy.get('.desktop-sidebar').contains('a', 'Wedge Matrix').click()

      cy.wait('@syncRequest')
      cy.url().should('include', '/matrix')
    })
  })
})
