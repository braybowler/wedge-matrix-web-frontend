const loginAndSetup = () => {
  const matrixData = {
    id: 1,
    user_id: 1,
    label: 'Test Matrix',
    number_of_rows: 2,
    number_of_columns: 2,
    column_headers: ['50%', '100%'],
    selected_row_display_option: 'Carry',
    yardage_values: [
      [
        { carry_value: 100, total_value: 110 },
        { carry_value: 80, total_value: 90 },
      ],
      [
        { carry_value: 60, total_value: 70 },
        { carry_value: 40, total_value: 50 },
      ],
    ],
    club_labels: ['LW', 'SW'],
  }

  cy.intercept('POST', '**/login', {
    statusCode: 200,
    body: {
      user: {
        id: 1,
        email: 'test@example.com',
        wedge_matrices: [matrixData],
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
        wedge_matrices: [matrixData],
      },
    },
  }).as('userRequest')

  cy.intercept('PUT', '**/wedge-matrix/*', {
    statusCode: 200,
    body: { data: matrixData },
  }).as('putMatrix')

  cy.visit('/login')
  cy.get('[data-test-id="email-input"]').type('test@example.com')
  cy.get('[data-test-id="password-input"]').type('Password1!')
  cy.get('[data-test-id="login-button"]').click()
  cy.wait('@loginRequest')
  cy.wait('@userRequest')
  cy.url().should('include', '/matrix')
}

const navigateSetupSteps = () => {
  // Club selection: click Next (all selected by default)
  cy.get('[data-test-id="club-next-button"]').click()
  // Swing type selection: click Next (all selected by default)
  cy.get('[data-test-id="swing-next-button"]').click()
}

describe('Calibrate Flow', () => {
  beforeEach(() => {
    localStorage.clear()
    loginAndSetup()
  })

  it('navigates to calibrate page from sidebar', () => {
    cy.get('a[href="/calibrate"]:visible').click()
    cy.url().should('include', '/calibrate')
    cy.get('[data-test-id="club-select-all"]').should('be.visible')
  })

  it('navigates through club and swing type selection to shot count', () => {
    cy.visit('/calibrate')
    cy.wait('@userRequest')

    // Club selection
    cy.get('[data-test-id="club-select-all"]').should('be.visible')
    cy.get('[data-test-id="club-select-0"]').should('be.visible')
    cy.get('[data-test-id="club-select-1"]').should('be.visible')
    cy.get('[data-test-id="club-next-button"]').click()

    // Swing type selection
    cy.get('[data-test-id="swing-select-all"]').should('be.visible')
    cy.get('[data-test-id="swing-select-0"]').should('be.visible')
    cy.get('[data-test-id="swing-select-1"]').should('be.visible')
    cy.get('[data-test-id="swing-next-button"]').click()

    // Shot count selection
    cy.get('[data-test-id="shot-count-5"]').should('be.visible')
  })

  it('selects shot count and shows first step', () => {
    cy.visit('/calibrate')
    cy.wait('@userRequest')
    navigateSetupSteps()
    cy.get('[data-test-id="shot-count-5"]').click()
    cy.get('[data-test-id="progress-label"]').should('contain.text', 'Step 1 of 4')
    cy.get('[data-test-id="step-header"]').should('contain.text', 'LW @ 50%')
  })

  it('enters shots and advances through all steps', () => {
    cy.visit('/calibrate')
    cy.wait('@userRequest')
    navigateSetupSteps()
    cy.get('[data-test-id="shot-count-5"]').click()

    // Step 1: LW @ 50%
    for (let i = 0; i < 5; i++) {
      cy.get(`[data-test-id="shot-carry-input-${i}"]`).type(String(100 + i))
    }
    cy.get('[data-test-id="step-next-button"]').click()

    // Step 2: LW @ 100%
    cy.get('[data-test-id="step-header"]').should('contain.text', 'LW @ 100%')
    for (let i = 0; i < 5; i++) {
      cy.get(`[data-test-id="shot-carry-input-${i}"]`).type(String(80 + i))
    }
    cy.get('[data-test-id="step-next-button"]').click()

    // Step 3: SW @ 50%
    cy.get('[data-test-id="step-header"]').should('contain.text', 'SW @ 50%')
    for (let i = 0; i < 5; i++) {
      cy.get(`[data-test-id="shot-carry-input-${i}"]`).type(String(60 + i))
    }
    cy.get('[data-test-id="step-next-button"]').click()

    // Step 4: SW @ 100%
    cy.get('[data-test-id="step-header"]').should('contain.text', 'SW @ 100%')
    for (let i = 0; i < 5; i++) {
      cy.get(`[data-test-id="shot-carry-input-${i}"]`).type(String(40 + i))
    }
    cy.get('[data-test-id="step-next-button"]').click()

    // Review screen
    cy.get('[data-test-id="calibration-review"]').should('be.visible')
  })

  it('applies calibration and redirects to matrix', () => {
    cy.visit('/calibrate')
    cy.wait('@userRequest')
    navigateSetupSteps()
    cy.get('[data-test-id="shot-count-5"]').click()

    // Advance through all 4 steps
    for (let step = 0; step < 4; step++) {
      for (let i = 0; i < 5; i++) {
        cy.get(`[data-test-id="shot-carry-input-${i}"]`).type(String(100 + i))
      }
      cy.get('[data-test-id="step-next-button"]').click()
    }

    cy.get('[data-test-id="apply-calibration-button"]').click()
    cy.wait('@putMatrix')
    cy.url().should('include', '/matrix')
  })

  it('back button is hidden on step 1 and visible on step 2+', () => {
    cy.visit('/calibrate')
    cy.wait('@userRequest')
    navigateSetupSteps()
    cy.get('[data-test-id="shot-count-5"]').click()

    // Step 1: back button should not exist
    cy.get('[data-test-id="step-back-button"]').should('not.exist')

    // Advance to step 2
    cy.get('[data-test-id="step-next-button"]').click()

    // Step 2: back button should be visible
    cy.get('[data-test-id="step-back-button"]').should('be.visible')
  })

  it('back button navigates to previous step', () => {
    cy.visit('/calibrate')
    cy.wait('@userRequest')
    navigateSetupSteps()
    cy.get('[data-test-id="shot-count-5"]').click()

    cy.get('[data-test-id="step-next-button"]').click()
    cy.get('[data-test-id="progress-label"]').should('contain.text', 'Step 2 of 4')

    cy.get('[data-test-id="step-back-button"]').click()
    cy.get('[data-test-id="progress-label"]').should('contain.text', 'Step 1 of 4')
  })

  it('cancel from review redirects to matrix', () => {
    cy.visit('/calibrate')
    cy.wait('@userRequest')
    navigateSetupSteps()
    cy.get('[data-test-id="shot-count-5"]').click()

    // Advance through all steps
    for (let step = 0; step < 4; step++) {
      cy.get('[data-test-id="step-next-button"]').click()
    }

    cy.get('[data-test-id="cancel-calibration-button"]').click()
    cy.url().should('include', '/matrix')
  })

  it('persists session and resumes on return', () => {
    cy.visit('/calibrate')
    cy.wait('@userRequest')
    navigateSetupSteps()
    cy.get('[data-test-id="shot-count-5"]').click()

    // Advance to step 2
    cy.get('[data-test-id="step-next-button"]').click()
    cy.get('[data-test-id="progress-label"]').should('contain.text', 'Step 2 of 4')

    // Navigate away
    cy.get('a[href="/matrix"]:visible').click()
    cy.url().should('include', '/matrix')

    // Come back
    cy.get('a[href="/calibrate"]:visible').click()
    cy.url().should('include', '/calibrate')

    // Should resume at step 2
    cy.get('[data-test-id="progress-label"]').should('contain.text', 'Step 2 of 4')
  })

  it('back button on swing type selector returns to club selector', () => {
    cy.visit('/calibrate')
    cy.wait('@userRequest')

    cy.get('[data-test-id="club-next-button"]').click()
    cy.get('[data-test-id="swing-back-button"]').click()

    cy.get('[data-test-id="club-select-all"]').should('be.visible')
  })

  it('back button on shot count selector returns to swing type selector', () => {
    cy.visit('/calibrate')
    cy.wait('@userRequest')
    navigateSetupSteps()

    cy.get('[data-test-id="shot-count-back-button"]').click()
    cy.get('[data-test-id="swing-select-all"]').should('be.visible')
  })
})
