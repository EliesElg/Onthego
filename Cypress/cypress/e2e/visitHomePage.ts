import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I visit OnTheGo", () => {
  cy.visit("/");
});

Then("I should see a login button in the header", () => {
  cy.get("#header-login-button")
    .should("exist");
});
