# Weekend-Only Membership Toggle Feature

## Overview
This feature allows administrators to control the availability of weekend-only membership option in the membership application form. When enabled, female members can opt for weekend-only access, and when disabled, this option is not available to any member.

## Feature Specification

```gherkin
Feature: Toggle Weekend-Only Membership Option
  As an administrator of WhyGym
  I want to control the availability of weekend-only membership option
  So that I can manage membership access based on business needs

  Background:
    Given I am logged in as an administrator
    And I am on the admin dashboard
    And I navigate to the membership settings page

  Scenario: View current weekend-only option status
    When I view the membership settings
    Then I should see the current status of weekend-only option
    And the status should be clearly indicated as either "Enabled" or "Disabled"

  Scenario: Enable weekend-only option
    Given the weekend-only option is currently disabled
    When I click the toggle switch for weekend-only option
    Then the status should change to "Enabled"
    And I should see a success message confirming the change
    And the change should be saved in the system
    And female members should be able to select weekend-only option in the membership form
    And male members should not see the weekend-only option

  Scenario: Disable weekend-only option
    Given the weekend-only option is currently enabled
    When I click the toggle switch for weekend-only option
    Then the status should change to "Disabled"
    And I should see a success message confirming the change
    And the change should be saved in the system
    And no members should be able to select weekend-only option in the membership form

  Scenario: Verify weekend-only option in membership form (Enabled)
    Given the weekend-only option is enabled
    When a female member fills out the membership application form
    And selects "Female" as their gender
    Then they should see the weekend-only checkbox option
    And the checkbox should be enabled
    When a male member fills out the membership application form
    And selects "Male" as their gender
    Then they should not see the weekend-only checkbox option

  Scenario: Verify weekend-only option in membership form (Disabled)
    Given the weekend-only option is disabled
    When any member fills out the membership application form
    Then they should not see the weekend-only checkbox option
    Regardless of their gender selection

  Scenario: Persist weekend-only option status
    Given I have changed the weekend-only option status
    When I log out of the admin dashboard
    And log back in as an administrator
    Then the weekend-only option should maintain its previous status
    And the status should be correctly reflected in the membership form

  Scenario: Handle existing weekend-only memberships
    Given there are existing members with weekend-only memberships
    When I disable the weekend-only option
    Then existing weekend-only memberships should remain active
    And their access rights should not be affected
    And only new applications should be affected by the change

  Scenario: System error handling
    Given I am on the membership settings page
    When the system encounters an error while saving the toggle status
    Then I should see an error message
    And the toggle should revert to its previous state
    And the system should log the error for debugging
    And the current membership form behavior should remain unchanged

  Scenario: Unauthorized access prevention
    Given I am not logged in as an administrator
    When I try to access the weekend-only toggle setting
    Then I should be redirected to the login page
    And I should see an unauthorized access message
    And the current weekend-only setting should remain unchanged
```

## Technical Notes
1. The weekend-only option should be stored in a database setting
2. The toggle should be implemented as a boolean flag
3. Changes to the setting should be atomic and transactional
4. The feature should be implemented with proper access control
5. The membership form should dynamically update based on the current setting
6. Existing weekend-only memberships should be grandfathered in when the option is disabled