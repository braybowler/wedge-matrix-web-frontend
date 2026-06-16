describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('renders the brand name', () => {
    cy.contains('Wedge Matrix').should('be.visible')
  })

  it('renders the hero headline', () => {
    cy.contains('Know your number').should('be.visible')
    cy.contains('on every wedge shot.').should('be.visible')
  })

  it('displays the primary Get Started CTA', () => {
    cy.get('[data-test-id="get-started-button"]').should('be.visible')
  })

  it('displays the Login link', () => {
    cy.get('[data-test-id="login-button"]').should('be.visible')
  })

  it('navigates to /register when Get Started is clicked', () => {
    cy.get('[data-test-id="get-started-button"]').click()

    cy.url().should('include', '/register')
  })

  it('navigates to /login when Login is clicked', () => {
    cy.get('[data-test-id="login-button"]').click()

    cy.url().should('include', '/login')
  })

  it('toggles the matrix between carry and total distances', () => {
    cy.contains('button', 'Carry').should('exist')
    cy.contains('button', 'Total').click()
    cy.contains('total').should('be.visible')
  })
})
