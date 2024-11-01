declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<void>;
    logout(): Chainable<void>;
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
});

export {};