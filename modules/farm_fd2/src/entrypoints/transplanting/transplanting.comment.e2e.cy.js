describe('Transplanting: Comment Component', () => {
  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.restoreSessionStorage();

    cy.login('admin', 'admin');
    cy.visit('fd2/transplanting/');
    cy.waitForPage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
    cy.saveSessionStorage();
  });

  it('Comment component exists, is visible, is enabled', () => {
    cy.get('[data-cy="transplanting-comment"]').should('exist');
    cy.get('[data-cy="comment-input"]')
      .should('be.visible')
      .should('be.enabled');
  });

  it('Comment component should be empty', () => {
    cy.get('[data-cy="comment-input"]').should('have.text', '');
  });
});