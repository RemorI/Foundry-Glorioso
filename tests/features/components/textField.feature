# Copyright 2024 Jean-Baptiste Louvet-Daniel
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

Feature: Text field configuration

  Background:
    Given I setup the Foundry Instance
    And I create a actor template named 'AutoTest_Template'

  Scenario: Basic text field creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'textfield_key' as component key
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'textField/BasicTextField'

  Scenario: Full text field creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'textfield_key' as component key
    And I type 'Text field label' as text field label
    And I type 'azerty' as text field allowed character list
    And I type '5' as text field maximum length
    And I type 'raet' as text field default value
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'textField/FullTextField'

  Scenario: Allowed character list checking
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'textfield_key' as component key
    And I type 'azerty' as text field allowed character list
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type 'rarety' in 'textfield_key' in the 'AutoTest_Character' character
    Then the field 'textfield_key' of the character 'AutoTest_Character' has value 'rarety'
    When I type 'not allowed' in 'textfield_key' in the 'AutoTest_Character' character
    Then a 'warning' notification is displayed with text 'Value contains unauthorized characters'
    And the field 'textfield_key' of the character 'AutoTest_Character' has value 'rarety'

  Scenario: Maximum length checking
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'textfield_key' as component key
    And I type '5' as text field maximum length
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type 'small' in 'textfield_key' in the 'AutoTest_Character' character
    Then the field 'textfield_key' of the character 'AutoTest_Character' has value 'small'
    When I type 'loooong' in 'textfield_key' in the 'AutoTest_Character' character
    Then the field 'textfield_key' of the character 'AutoTest_Character' has value 'loooo'

  Scenario: Default value checking
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'textfield_key' as component key
    And I type 'VaLuE' as text field default value
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    Then the field 'textfield_key' of the character 'AutoTest_Character' has value 'VaLuE'

  Scenario: Autocompletion
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'dynamic_textfield_key' as component key
    And I type 'Text' as component column name
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'textfield_key' as component key
    And I type '${lookup('dynamic_key', 'dynamic_textfield_key')}$' as text field autocomplete
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'AutoComp 1' in 'dynamic_textfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'AutoComp 2' in 'dynamic_textfield_key' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'AutoComp 3' in 'dynamic_textfield_key' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    Then the field 'textfield_key' of the character 'AutoTest_Character' has 'AutoComp 1' in its autocompletion values
    And the field 'textfield_key' of the character 'AutoTest_Character' has 'AutoComp 2' in its autocompletion values
    And the field 'textfield_key' of the character 'AutoTest_Character' has 'AutoComp 3' in its autocompletion values
#TODO Size testing
#TODO Advanced configuration