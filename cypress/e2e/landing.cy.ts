describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('renders the hero title', () => {
    cy.contains('Wedge Matrix').should('be.visible')
  })

  it('renders the tagline', () => {
    cy.contains('Dial in your short game').should('be.visible')
  })

  it('displays the Get Started button', () => {
    cy.get('[data-test-id="get-started-button"]').should('be.visible')
  })

  it('displays the Login button', () => {
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
})
