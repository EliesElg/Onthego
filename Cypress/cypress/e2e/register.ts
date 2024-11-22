
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given('I am on the homepage', () => {
  cy.visit('/');
});

When('I click on the register button', () => {
  cy.get('#header-register-button').click();
});

When('I fill in the registration form', () => {
  cy.get('#firstname_input_register').type('Vincent');
  cy.get('#lastname_input_register').type('BoisRobert');
  cy.get('#username_input_register').type('vbo');
  cy.get('#mail_input_register').type('vincent.boisrobert@infotel.com');
  cy.get('#password_input_register').type('Password1231');
  cy.get('#passwordConfirm_input_register').type('Password1231');
});

When('I submit the registration form', () => {
  cy.get('#submit_button_register').find('button').click({force:true});
  cy.url().should('include', 'login');

});

// Then('I should be redirected to the registration success page', () => {
//     cy.url().should('include', '/login', { timeout: 10000 });
//     // cy.get("#msg-success")
//     // .should("exist");
// });