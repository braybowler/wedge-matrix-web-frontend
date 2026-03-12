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

const loginAndSetup = () => {
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

  cy.intercept('GET', '**/practice-session', {
    statusCode: 200,
    body: { data: [] },
  }).as('getPracticeSessions')

  cy.intercept('POST', '**/practice-session', {
    statusCode: 201,
    body: {
      data: {
        id: 42,
        user_id: 1,
        wedge_matrix_id: 1,
        shot_count: 5,
        shots: [],
        average_difference: 3.5,
        created_at: '2026-03-12T10:00:00Z',
      },
    },
  }).as('postPracticeSession')

  cy.intercept('DELETE', '**/practice-session/*', {
    statusCode: 204,
    body: {},
  }).as('deletePracticeSession')

  cy.visit('/login')
  cy.get('[data-test-id="email-input"]').type('test@example.com')
  cy.get('[data-test-id="password-input"]').type('Password1!')
  cy.get('[data-test-id="login-button"]').click()
  cy.wait('@loginRequest')
  cy.wait('@userRequest')
  cy.url().should('include', '/matrix')
}

describe('Practice Flow', () => {
  beforeEach(() => {
    localStorage.clear()
    loginAndSetup()
  })

  it('navigates to practice page from sidebar', () => {
    cy.get('a[href="/practice"]:visible').first().click()
    cy.url().should('include', '/practice')
    cy.wait('@getPracticeSessions')
    cy.get('[data-test-id="new-practice-session-button"]').should('be.visible')
  })

  it('shows shot count selector when New Session is clicked', () => {
    cy.visit('/practice')
    cy.wait('@userRequest')
    cy.wait('@getPracticeSessions')

    cy.get('[data-test-id="new-practice-session-button"]').click()
    cy.get('[data-test-id="practice-shot-count-5"]').should('be.visible')
    cy.get('[data-test-id="practice-shot-count-10"]').should('be.visible')
    cy.get('[data-test-id="practice-shot-count-15"]').should('be.visible')
  })

  it('starts practice session and shows first shot', () => {
    cy.visit('/practice')
    cy.wait('@userRequest')
    cy.wait('@getPracticeSessions')

    cy.get('[data-test-id="new-practice-session-button"]').click()
    cy.get('[data-test-id="practice-shot-count-5"]').click()

    cy.get('[data-test-id="practice-progress-label"]').should('contain.text', 'Shot 1 of 5')
    cy.get('[data-test-id="practice-target-label"]').should('contain.text', 'Hit to')
  })

  it('enters carry and advances through all shots to review', () => {
    cy.visit('/practice')
    cy.wait('@userRequest')
    cy.wait('@getPracticeSessions')

    cy.get('[data-test-id="new-practice-session-button"]').click()
    cy.get('[data-test-id="practice-shot-count-5"]').click()

    for (let i = 0; i < 5; i++) {
      cy.get('[data-test-id="practice-carry-input"]').clear().type(String(50 + i))
      cy.get('[data-test-id="practice-next-button"]').click()
    }

    cy.get('[data-test-id="practice-review"]').should('be.visible')
    cy.get('[data-test-id="practice-avg-diff"]').should('be.visible')
  })

  it('saves practice session and returns to log', () => {
    cy.visit('/practice')
    cy.wait('@userRequest')
    cy.wait('@getPracticeSessions')

    cy.get('[data-test-id="new-practice-session-button"]').click()
    cy.get('[data-test-id="practice-shot-count-5"]').click()

    for (let i = 0; i < 5; i++) {
      cy.get('[data-test-id="practice-carry-input"]').clear().type(String(50 + i))
      cy.get('[data-test-id="practice-next-button"]').click()
    }

    cy.get('[data-test-id="save-practice-button"]').click()
    cy.wait('@postPracticeSession')

    cy.get('[data-test-id="new-practice-session-button"]').should('be.visible')
    cy.get('[data-test-id="practice-log-item"]').should('exist')
  })

  it('back button is hidden on shot 1 and visible on shot 2+', () => {
    cy.visit('/practice')
    cy.wait('@userRequest')
    cy.wait('@getPracticeSessions')

    cy.get('[data-test-id="new-practice-session-button"]').click()
    cy.get('[data-test-id="practice-shot-count-5"]').click()

    cy.get('[data-test-id="practice-back-button"]').should('not.exist')

    cy.get('[data-test-id="practice-next-button"]').click()
    cy.get('[data-test-id="practice-back-button"]').should('be.visible')
  })

  it('back button navigates to previous shot', () => {
    cy.visit('/practice')
    cy.wait('@userRequest')
    cy.wait('@getPracticeSessions')

    cy.get('[data-test-id="new-practice-session-button"]').click()
    cy.get('[data-test-id="practice-shot-count-5"]').click()

    cy.get('[data-test-id="practice-next-button"]').click()
    cy.get('[data-test-id="practice-progress-label"]').should('contain.text', 'Shot 2 of 5')

    cy.get('[data-test-id="practice-back-button"]').click()
    cy.get('[data-test-id="practice-progress-label"]').should('contain.text', 'Shot 1 of 5')
  })

  it('quit mid-session returns to practice log', () => {
    cy.visit('/practice')
    cy.wait('@userRequest')
    cy.wait('@getPracticeSessions')

    cy.get('[data-test-id="new-practice-session-button"]').click()
    cy.get('[data-test-id="practice-shot-count-5"]').click()

    cy.get('[data-test-id="quit-practice-button"]').click()
    cy.get('[data-test-id="confirm-button"]').click()

    cy.get('[data-test-id="new-practice-session-button"]').should('be.visible')
  })

  it('discards completed session and returns to log', () => {
    cy.visit('/practice')
    cy.wait('@userRequest')
    cy.wait('@getPracticeSessions')

    cy.get('[data-test-id="new-practice-session-button"]').click()
    cy.get('[data-test-id="practice-shot-count-5"]').click()

    for (let i = 0; i < 5; i++) {
      cy.get('[data-test-id="practice-carry-input"]').clear().type(String(50 + i))
      cy.get('[data-test-id="practice-next-button"]').click()
    }

    cy.get('[data-test-id="discard-practice-button"]').click()

    cy.get('[data-test-id="new-practice-session-button"]').should('be.visible')
  })

  it('resumes session from localStorage after navigation', () => {
    cy.visit('/practice')
    cy.wait('@userRequest')
    cy.wait('@getPracticeSessions')

    cy.get('[data-test-id="new-practice-session-button"]').click()
    cy.get('[data-test-id="practice-shot-count-5"]').click()

    cy.get('[data-test-id="practice-next-button"]').click()
    cy.get('[data-test-id="practice-progress-label"]').should('contain.text', 'Shot 2 of 5')

    // Navigate away
    cy.get('a[href="/matrix"]:visible').first().click()
    cy.url().should('include', '/matrix')

    // Come back
    cy.get('a[href="/practice"]:visible').first().click()
    cy.url().should('include', '/practice')

    // Should resume at shot 2
    cy.get('[data-test-id="practice-progress-label"]').should('contain.text', 'Shot 2 of 5')
  })

  it('shows empty state when no practice sessions', () => {
    cy.visit('/practice')
    cy.wait('@userRequest')
    cy.wait('@getPracticeSessions')

    cy.get('[data-test-id="practice-log-empty"]').should('be.visible')
  })

  it('shows practice log with existing sessions', () => {
    cy.intercept('GET', '**/practice-session', {
      statusCode: 200,
      body: {
        data: [
          {
            id: 1,
            user_id: 1,
            wedge_matrix_id: 1,
            shot_count: 5,
            shots: [
              { shot_number: 1, target_yards: 50, actual_carry: 48, difference: 2 },
            ],
            average_difference: 2,
            created_at: '2026-03-12T10:00:00Z',
          },
        ],
      },
    }).as('getPracticeSessionsWithData')

    cy.visit('/practice')
    cy.wait('@userRequest')
    cy.wait('@getPracticeSessionsWithData')

    cy.get('[data-test-id="practice-log-item"]').should('exist')
  })
})
