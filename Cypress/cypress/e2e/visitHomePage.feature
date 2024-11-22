Feature: OnTheGo
  Scenario: visiting the frontpage
    When I visit OnTheGo
    Then I should see a login button in the header
