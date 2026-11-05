# Copyright 2024 Jean-Baptiste Louvet-Daniel
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

Feature: Select configuration

  Background:
    Given I setup the Foundry Instance
    And I create a actor template named 'AutoTest_Template'

  Scenario: Basic select creation with options
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dropdown' as component type
    And I type 'select_key' as component key
    And I 'uncheck' dynamic table use
    And I add an option with key 'opt1' and label 'Option 1'
    And I add an option with key 'opt2' and label 'Option 2'
    And I add an option with key 'opt3' and label 'Option 3'
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'select/BasicSelect'
    And select 'select_key' in the 'AutoTest_Character' character has options ';_opt1;Option 1_opt2;Option 2_opt3;Option 3'

    When I select option 'Option 2' in select 'select_key' in the 'AutoTest_Character' character
    Then option 'opt2' is selected in select 'select_key' in the 'AutoTest_Character' character

  Scenario: Full select creation with options
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dropdown' as component type
    And I type 'select_key' as component key
    And I click 'Advanced configuration'
    And I type 'Select label' as select label
    And I 'uncheck' dynamic table use
    And I add an option with key 'opt1' and label 'Option 1'
    And I add an option with key 'opt2' and label 'Option 2'
    And I add an option with key 'opt3' and label 'Option 3'
    And I type 'opt2' as select default value
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'select/FullSelect'
    And select 'select_key' in the 'AutoTest_Character' character has options 'opt1;Option 1_opt2;Option 2_opt3;Option 3'
    And option 'opt2' is selected in select 'select_key' in the 'AutoTest_Character' character

    When I select option 'Option 1' in select 'select_key' in the 'AutoTest_Character' character
    Then option 'opt1' is selected in select 'select_key' in the 'AutoTest_Character' character


  Scenario: Update select and remove options
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dropdown' as component type
    And I type 'select_key' as component key
    And I 'uncheck' dynamic table use
    And I add an option with key 'opt1' and label 'Option 1'
    And I add an option with key 'opt2' and label 'Option 2'
    And I add an option with key 'opt3' and label 'Option 3'
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I select option 'Option 2' in select 'select_key' in the 'AutoTest_Character' character
    Then option 'opt2' is selected in select 'select_key' in the 'AutoTest_Character' character
    And select 'select_key' in the 'AutoTest_Character' character has options ';_opt1;Option 1_opt2;Option 2_opt3;Option 3'

    When I open the actor 'AutoTest_Template'
    And I edit the component 'select_key' in actor template 'AutoTest_Template'

    And I remove the option with key 'opt1'
    And I click 'Save Component'

    And I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then select 'select_key' in the 'AutoTest_Character' character has options ';_opt2;Option 2_opt3;Option 3'
    And option 'opt2' is selected in select 'select_key' in the 'AutoTest_Character' character

#TODO Dynamic table populating
#TODO Size testing
#TODO Advanced configuration