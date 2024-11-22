Feature: User Registration

  Scenario: User registers through the registration form
    Given I am on the homepage
    When I click on the register button
    And I fill in the registration form
    And I submit the registration form
