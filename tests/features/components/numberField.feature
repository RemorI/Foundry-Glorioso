# Copyright 2024 Jean-Baptiste Louvet-Daniel
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

Feature: Number field configuration

  Background:
    Given I setup the Foundry Instance
    And I create a actor template named 'AutoTest_Template'

  Scenario: Basic number field creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_key' as component key
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'numberField/BasicNumberField'

    When I type '2' in 'numfield_key' in the 'AutoTest_Character' character
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '2'

    When I type 'azerty' in 'numfield_key' in the 'AutoTest_Character' character
    Then a 'warning' notification is displayed with text 'Value must be numeric'
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '2'


  Scenario: Full number field creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_key' as component key
    And I type 'Number field label' as number field label
    And I 'check' allow decimal number
    And I type '2' as number field minimum value
    And I type '5' as number field maximum value
    And I type '3' as number field default value
    And I 'check' allow relative modification
    And I 'check' show field controls
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'numberField/FullNumberField'

  Scenario: Minimum value checking
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_key' as component key
    And I type '2' as number field minimum value
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type '5' in 'numfield_key' in the 'AutoTest_Character' character
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '5'
    When I type '0' in 'numfield_key' in the 'AutoTest_Character' character
    Then a 'warning' notification is displayed with text 'Value must be greater than 2'
    And the field 'numfield_key' of the character 'AutoTest_Character' has value '2'

  Scenario: Maximum value checking
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_key' as component key
    And I type '5' as number field maximum value
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type '2' in 'numfield_key' in the 'AutoTest_Character' character
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '2'
    When I type '10' in 'numfield_key' in the 'AutoTest_Character' character
    Then a 'warning' notification is displayed with text 'Value must be smaller than 5'
    And the field 'numfield_key' of the character 'AutoTest_Character' has value '5'

  Scenario: Minimum value formula checking
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_ref' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_key' as component key
    And I type '${numfield_ref + 2}$' as number field minimum value
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type '5' in 'numfield_ref' in the 'AutoTest_Character' character
    And I type '10' in 'numfield_key' in the 'AutoTest_Character' character
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '10'
    When I type '5' in 'numfield_key' in the 'AutoTest_Character' character
    Then a 'warning' notification is displayed with text 'Value must be greater than 7'
    And the field 'numfield_key' of the character 'AutoTest_Character' has value '7'

  Scenario: Maximum value formula checking
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_ref' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_key' as component key
    And I type '${numfield_ref + 2}$' as number field maximum value
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type '5' in 'numfield_ref' in the 'AutoTest_Character' character
    And I type '5' in 'numfield_key' in the 'AutoTest_Character' character
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '5'
    When I type '10' in 'numfield_key' in the 'AutoTest_Character' character
    Then a 'warning' notification is displayed with text 'Value must be smaller than 7'
    And the field 'numfield_key' of the character 'AutoTest_Character' has value '7'

  Scenario: Default value checking
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_key' as component key
    And I type '33' as number field default value
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '33'

  Scenario: Allow decimal number checking
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_key' as component key
    And I 'uncheck' allow decimal number
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type '2' in 'numfield_key' in the 'AutoTest_Character' character
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '2'

    When I type '5.6' in 'numfield_key' in the 'AutoTest_Character' character
    Then a 'warning' notification is displayed with text 'Value must be an integer'
    And the field 'numfield_key' of the character 'AutoTest_Character' has value '2'

    When I open the actor 'AutoTest_Template'
    And I edit the component 'numfield_key' in actor template 'AutoTest_Template'
    And I 'check' allow decimal number
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type '5.6' in 'numfield_key' in the 'AutoTest_Character' character
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '5.6'

  Scenario: Allow relative modification checking
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_key' as component key
    And I 'uncheck' allow relative modification
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type '2' in 'numfield_key' in the 'AutoTest_Character' character
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '2'

    When I type '+3' in 'numfield_key' in the 'AutoTest_Character' character
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '3'

    When I type '-4' in 'numfield_key' in the 'AutoTest_Character' character
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '-4'

    When I open the actor 'AutoTest_Template'
    And I edit the component 'numfield_key' in actor template 'AutoTest_Template'
    And I 'check' allow relative modification
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type '2' in 'numfield_key' in the 'AutoTest_Character' character
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '2'
    When I type '+3' in 'numfield_key' in the 'AutoTest_Character' character
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '5'
    When I type '-4' in 'numfield_key' in the 'AutoTest_Character' character
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '1'

  Scenario: Show controls checking
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_key' as component key
    And I 'uncheck' show field controls
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type '2' in 'numfield_key' in the 'AutoTest_Character' character
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '2'

    When I unfocus everything
    And I hover over 'numfield_key' in the character 'AutoTest_Character'
    Then I 'don't see' number field controls for 'numfield_key' in the character 'AutoTest_Character'

    When I open the actor 'AutoTest_Template'
    And I edit the component 'numfield_key' in actor template 'AutoTest_Template'
    And I 'check' show field controls
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    And I hover over 'numfield_key' in the character 'AutoTest_Character'
    Then I 'see' number field controls for 'numfield_key' in the character 'AutoTest_Character'

    When I click on the '+' control button of number field 'numfield_key' in the character 'AutoTest_Character'
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '3'

    When I click on the '-' control button of number field 'numfield_key' in the character 'AutoTest_Character'
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '2'

  Scenario: Control style checking
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_key' as component key
    And I 'check' show field controls
    And I select 'Hover to display' controls style
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type '2' in 'numfield_key' in the 'AutoTest_Character' character

    And I hover over 'numfield_key' in the character 'AutoTest_Character'
    Then I 'see' number field controls for 'numfield_key' in the character 'AutoTest_Character'

    When I click on the '+' control button of number field 'numfield_key' in the character 'AutoTest_Character'
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '3'

    When I click on the '-' control button of number field 'numfield_key' in the character 'AutoTest_Character'
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '2'

    When I open the actor 'AutoTest_Template'
    And I edit the component 'numfield_key' in actor template 'AutoTest_Template'
    And I select 'Full controls' controls style
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then I see full number field controls for 'numfield_key' in the character 'AutoTest_Character'

    When I click on the '+10' control button of number field 'numfield_key' in the character 'AutoTest_Character'
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '12'

    When I click on the '+1' control button of number field 'numfield_key' in the character 'AutoTest_Character'
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '13'

    When I click on the '-10' control button of number field 'numfield_key' in the character 'AutoTest_Character'
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '3'

    When I click on the '-1' control button of number field 'numfield_key' in the character 'AutoTest_Character'
    Then the field 'numfield_key' of the character 'AutoTest_Character' has value '2'

#TODO Size testing
#TODO Advanced configuration