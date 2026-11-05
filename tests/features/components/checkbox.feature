# Copyright 2024 Jean-Baptiste Louvet-Daniel
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

Feature: Checkbox configuration

  Background:
    Given I setup the Foundry Instance
    And I create a actor template named 'AutoTest_Template'

  Scenario: Basic checkbox creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Checkbox' as component type
    And I type 'checkbox_key' as component key
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'checkbox/BasicCheckbox'

    When I click on the 'checkbox_key' checkbox in the 'AutoTest_Character' character
    Then The 'checkbox_key' checkbox is 'checked' in the 'AutoTest_Character' character

  Scenario: Full checkbox creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Checkbox' as component type
    And I type 'checkbox_key' as component key
    And I type 'Checkbox label' as checkbox label
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'checkbox/FullCheckbox'

    When I open the actor 'AutoTest_Template'
    And I edit the component 'checkbox_key' in actor template 'AutoTest_Template'
    And I type 'Checkbox label edited' as checkbox label
    And I click 'Save Component'

    And I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the component 'checkbox_key' of the character 'AutoTest_Character' has HTML 'checkbox/FullCheckboxEdited'  
    
  Scenario: Checkbox checked by default
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Checkbox' as component type
    And I type 'checkbox_key' as component key
    And I 'check' checked by default
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'checkbox/CheckboxCheckedByDefault'

    When I open the actor 'AutoTest_Template'
    And I edit the component 'checkbox_key' in actor template 'AutoTest_Template'
    And I 'uncheck' checked by default
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character_2'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character_2' character

    Then the character 'AutoTest_Character_2' looks like 'checkbox/CheckboxUncheckedByDefault'
