# Copyright 2024 Jean-Baptiste Louvet-Daniel
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

Feature: Formulas

  Background:
    Given I setup the Foundry Instance

  Scenario: Basic formula handling
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_2' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_results' as component key
    And I type 'Result : ${floor((field_1 + field_2) / 2) * 10}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type '0' in 'field_1' in the 'AutoTest_Character' character
    And I type '0' in 'field_2' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'Result : 0'

    When I type '85' in 'field_1' in the 'AutoTest_Character' character
    And I type '34' in 'field_2' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'Result : 590'

    When I type 'AZERTY' in 'field_1' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'Result : ERROR'

  Scenario: Radio button formula handling
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Radio button' as component type
    And I type 'radio_key_1' as component key
    And I type 'radioGroup' as radio button group
    And I type 'radioValue1' as radio button value
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Radio button' as component type
    And I type 'radio_key_2' as component key
    And I type 'radioGroup' as radio button group
    And I type 'radioValue2' as radio button value
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_results' as component key
    And I type 'Result : ${radioGroup}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I click on the 'radio_key_1' radio button in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'Result : radioValue1'

    When I click on the 'radio_key_2' radio button in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'Result : radioValue2'

  Scenario: 'ref' function
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_2' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_results' as component key
    And I type '${ref(field_1, 'REPLACEMENT')}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type 'field_2' in 'field_1' in the 'AutoTest_Character' character
    And I type 'THE VALUE' in 'field_2' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'THE VALUE'

    When I type 'unknown_key' in 'field_1' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'REPLACEMENT'

  Scenario: 'replace' function
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_results' as component key
    And I type '${replace(field_1, 'TO REPLACE', 'REPLACEMENT')}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type 'This value is the TO REPLACE, in which TO REPLACE is to be replaced' in 'field_1' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'This value is the REPLACEMENT, in which TO REPLACE is to be replaced'

    When I type 'This value has no replace to do' in 'field_1' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'This value has no replace to do'

  Scenario: 'replaceAll' function
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_results' as component key
    And I type '${replaceAll(field_1, 'TO REPLACE', 'REPLACEMENT')}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type 'This value is the TO REPLACE, in which TO REPLACE is to be replaced' in 'field_1' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'This value is the REPLACEMENT, in which REPLACEMENT is to be replaced'

    When I type 'This value has no replace to do' in 'field_1' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'This value has no replace to do'

  Scenario: 'recalculate' function
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_2' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_results' as component key
    And I type '${recalculate(field_1)}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type 'This is the formula : ${field_2 + 2}$' in 'field_1' in the 'AutoTest_Character' character
    And I type '5' in 'field_2' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'This is the formula : 7'

  Scenario: 'switchCase' function
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_results' as component key
    And I type '${switchCase(field_1, 'a', 1, 'b', 2, 'c', 3, 0)}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type 'a' in 'field_1' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text '1'

    When I type 'c' in 'field_1' in the 'AutoTest_Character' character
    Then the field 'formula_results' of the character 'AutoTest_Character' has text '3'

    When I type '2' in 'field_1' in the 'AutoTest_Character' character
    Then the field 'formula_results' of the character 'AutoTest_Character' has text '0'

  Scenario: 'fetchFromActor' function - field from named actor
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_results' as component key
    And I type '${fetchFromActor('AutoTest_Character_2', 'field_1', 'DEFAULT VALUE')}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'DEFAULT VALUE'

    When I create a character named 'AutoTest_Character_2'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character_2' character
    And I type 'FETCHED VALUE' in 'field_1' in the 'AutoTest_Character_2' character
    Then the field 'formula_results' of the character 'AutoTest_Character_2' has text 'FETCHED VALUE'

    When I open the actor 'AutoTest_Character'
    And I type 'a' in 'field_1' in the 'AutoTest_Character_2' character
    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'FETCHED VALUE'

  Scenario: 'fetchFromActor' function - formula from named actor
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_results' as component key
    And I type '${fetchFromActor('AutoTest_Character_2', 'field_1 + 2', 'DEFAULT VALUE')}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'DEFAULT VALUE'

    When I create a character named 'AutoTest_Character_2'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character_2' character
    And I type '3' in 'field_1' in the 'AutoTest_Character_2' character
    Then the field 'formula_results' of the character 'AutoTest_Character_2' has text '5'

    When I open the actor 'AutoTest_Character'
    And I type 'a' in 'field_1' in the 'AutoTest_Character_2' character
    Then the field 'formula_results' of the character 'AutoTest_Character' has text '5'

  Scenario: 'setPropertyInEntity' function - formula in self
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_results' as component key
    And I type 'CLICK ME' as label text
    And I type 'New value : ${setPropertyInEntity('self', 'field_1', 'field_1 + 1', 0)}$' as label roll message
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type '3' in 'field_1' in the 'AutoTest_Character' character
    And I trigger the roll message 'formula_results' in the 'AutoTest_Character' character
    Then the field 'field_1' of the character 'AutoTest_Character' has value '4'
    And The last chat message says 'New value : 4'

    When I trigger the roll message 'formula_results' in the 'AutoTest_Character' character
    Then the field 'field_1' of the character 'AutoTest_Character' has value '5'
    And The last chat message says 'New value : 5'

  Scenario: 'setPropertyInEntity' function - formula in named actor
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_results' as component key
    And I type 'CLICK ME' as label text
    And I type 'New value : ${setPropertyInEntity('AutoTest_Character_2', 'field_1', 'field_1 + 1', 0)}$' as label roll message
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type '0' in 'field_1' in the 'AutoTest_Character' character

    When I create a character named 'AutoTest_Character_2'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character_2' character
    And I type '3' in 'field_1' in the 'AutoTest_Character_2' character
    And I trigger the roll message 'formula_results' in the 'AutoTest_Character_2' character
    Then the field 'field_1' of the character 'AutoTest_Character_2' has value '4'
    And The last chat message says 'New value : 4'

    When I open the actor 'AutoTest_Character'
    And I trigger the roll message 'formula_results' in the 'AutoTest_Character' character
    Then the field 'field_1' of the character 'AutoTest_Character' has value '0'

    When I open the actor 'AutoTest_Character_2'
    Then the field 'field_1' of the character 'AutoTest_Character_2' has value '1'
    And The last chat message says 'New value : 1'

    When I open the actor 'AutoTest_Character'
    And I trigger the roll message 'formula_results' in the 'AutoTest_Character' character
    Then the field 'field_1' of the character 'AutoTest_Character' has value '0'

    When I open the actor 'AutoTest_Character_2'
    Then the field 'field_1' of the character 'AutoTest_Character_2' has value '1'
    And The last chat message says 'New value : 1'

    When I trigger the roll message 'formula_results' in the 'AutoTest_Character_2' character
    Then the field 'field_1' of the character 'AutoTest_Character_2' has value '2'
    And The last chat message says 'New value : 2'


  Scenario: 'sameRow' function
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I type 'Text' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'field_2' as component key
    And I type 'Number' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_result' as component key
    And I type '${sameRow('field_1') + sameRow('field_2')}$' as label text
    And I type 'Label' as component column name
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '55' in 'field_1' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '99' in 'field_2' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    Then the field 'formula_result' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has text '154'


  Scenario: 'sameRow' function - fallback value
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I type 'Text' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'field_2' as component key
    And I type 'Number' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_result' as component key
    And I type '${sameRow('field_3', 5) + sameRow('field_2', 0)}$' as label text
    And I type 'Label' as component column name
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '55' in 'field_1' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '99' in 'field_2' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    Then the field 'formula_result' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has text '104'


  Scenario: 'sameRowRef' function
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I type 'Text' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'field_2' as component key
    And I type 'Number' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_result' as component key
    And I type '${sameRowRef('field_1')}$' as label text
    And I type 'Label' as component column name
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    Then the field 'formula_result' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has text 'dynamic_key.0.field_1'

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    Then the field 'formula_result' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has text 'dynamic_key.1.field_1'

  
  Scenario: 'lookupRef' function
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I type 'Text' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'field_2' as component key
    And I type 'Number' as component column name
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_result' as component key
    And I type '${lookupRef('dynamic_key', 'field_2', 'field_1', 'FILTER_VALUE')}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'VALUE_1' in 'field_1' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'FILTER_VALUE' in 'field_1' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'VALUE_2' in 'field_1' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    Then the field 'formula_result' of the character 'AutoTest_Character' has text 'dynamic_key.1.field_2'

    When I delete the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    Then the field 'formula_result' of the character 'AutoTest_Character' has text ''

  Scenario: 'lookup' function
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I type 'Text' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'field_2' as component key
    And I type 'Number' as component column name
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_result' as component key
    And I type '${lookup('dynamic_key', 'field_2')}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '10' in 'field_2' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '24' in 'field_2' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '36' in 'field_2' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    Then the field 'formula_result' of the character 'AutoTest_Character' has text '10,24,36'


  Scenario: 'lookup' function - sum
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I type 'Text' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'field_2' as component key
    And I type 'Number' as component column name
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_result' as component key
    And I type '${sum(lookup('dynamic_key', 'field_2'))}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '10' in 'field_2' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '24' in 'field_2' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '36' in 'field_2' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    Then the field 'formula_result' of the character 'AutoTest_Character' has text '70'


  Scenario: 'lookup' function - sum - with filter
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I type 'Text' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'field_2' as component key
    And I type 'Number' as component column name
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_result' as component key
    And I type '${sum(lookup('dynamic_key', 'field_2', 'field_1', 'val_1'))}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'val_1' in 'field_1' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '10' in 'field_2' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'val_1' in 'field_1' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '24' in 'field_2' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'val_2' in 'field_1' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '36' in 'field_2' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    Then the field 'formula_result' of the character 'AutoTest_Character' has text '34'


  Scenario: 'lookup' function - sum - with filter and operator
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I type 'Text' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'field_2' as component key
    And I type 'Number' as component column name
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_result' as component key
    And I type '${sum(lookup('dynamic_key', 'field_2', 'field_2', '15', '<'))}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'val_1' in 'field_1' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '10' in 'field_2' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'val_1' in 'field_1' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '24' in 'field_2' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'val_2' in 'field_1' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '36' in 'field_2' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    Then the field 'formula_result' of the character 'AutoTest_Character' has text '10'


  Scenario: 'first' function
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I type 'Text' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'field_2' as component key
    And I type 'Number' as component column name
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_result' as component key
    And I type '${first(lookup('dynamic_key', 'field_2'))}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '10' in 'field_2' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '24' in 'field_2' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '36' in 'field_2' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    Then the field 'formula_result' of the character 'AutoTest_Character' has text '10'


  Scenario: 'first' function - fallback
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I type 'Text' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'field_2' as component key
    And I type 'Number' as component column name
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_result' as component key
    And I type '${first(lookup('dynamic_key', 'field_2'), 55)}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the field 'formula_result' of the character 'AutoTest_Character' has text '55'

  Scenario: Custom Javascript handling - Javascript inside formula
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_2' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_results' as component key
    And I type 'Result : ${field_2 + %{return game.actors.size - ${field_1}$;}%}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type '1' in 'field_1' in the 'AutoTest_Character' character
    And I type '2' in 'field_2' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'Result : 3'

    When I type '85' in 'field_1' in the 'AutoTest_Character' character
    And I type '34' in 'field_2' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'Result : -49'

    When I type 'AZERTY' in 'field_2' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'Result : ERROR'

  Scenario: Custom Javascript handling - formula inside Javascript
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_1' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'field_2' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_results' as component key
    And I type 'Result : %{return game.actors.size + ${field_1 - field_2}$;}%' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I type '1' in 'field_1' in the 'AutoTest_Character' character
    And I type '2' in 'field_2' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'Result : 1'

    When I type '85' in 'field_1' in the 'AutoTest_Character' character
    And I type '34' in 'field_2' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'Result : 53'

    When I type 'AZERTY' in 'field_2' in the 'AutoTest_Character' character

    Then the field 'formula_results' of the character 'AutoTest_Character' has text 'Result :'

  Scenario: User inputs - Simple prompts
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_results' as component key
    And I type 'CLICK ME' as label text
    And I type '${#concat(?{name:"Character name"[text]|"Your name"},?{age[number]},?{gender:"Character gender"[check]|"m","Male"|"f","Female"|"o","Other, or I don't want to say"},?{month:'What month are you born ?'|"January"|"February"|"March"|"April"|"May"|"June"|"July"|"August"|"September"|"October"|"November"|"December"},?{happy:"Are you happy ?"[check]})}$Result : <br>name: ${name}$ <br>age: ${age}$ <br>gender: ${gender}$ <br>month: ${month}$ <br>happy: ${happy}$' as label roll message
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I trigger the roll message 'formula_results' in the 'AutoTest_Character' character
    Then the 'user_input' dialog is opened

    When I type 'Sample name' in the 'name' field in 'user_input' input dialog
    And I add '10' in the 'age' field in 'user_input' input dialog
    And I subtract '1' in the 'age' field in 'user_input' input dialog
    And I check 'f' in the 'gender' radio buttons in 'user_input' input dialog
    And I select 'January' in the 'month' field in 'user_input' input dialog
    And I check the 'happy' checkbox in 'user_input' input dialog

    And I validate the 'user_input' input dialog
    Then The last chat message says 'Result :\nname: Sample name\nage: 9\ngender: f\nmonth: January\nhappy: true'

  Scenario: User inputs - Simple prompts - number fields
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_results' as component key
    And I type 'CLICK ME' as label text
    And I type '${#?{age[number]}}$Result : ${age}$' as label roll message
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I trigger the roll message 'formula_results' in the 'AutoTest_Character' character
    Then the 'user_input' dialog is opened

    When I add '10' in the 'age' field in 'user_input' input dialog
    And I validate the 'user_input' input dialog
    Then The last chat message says 'Result : 10'

    When I trigger the roll message 'formula_results' in the 'AutoTest_Character' character
    Then the 'user_input' dialog is opened

    When I add '1' in the 'age' field in 'user_input' input dialog
    And I validate the 'user_input' input dialog
    Then The last chat message says 'Result : 1'

    When I trigger the roll message 'formula_results' in the 'AutoTest_Character' character
    Then the 'user_input' dialog is opened

    When I subtract '1' in the 'age' field in 'user_input' input dialog
    And I validate the 'user_input' input dialog
    Then The last chat message says 'Result : -1'

    When I trigger the roll message 'formula_results' in the 'AutoTest_Character' character
    Then the 'user_input' dialog is opened

    When I subtract '10' in the 'age' field in 'user_input' input dialog
    And I validate the 'user_input' input dialog
    Then The last chat message says 'Result : -10'

  Scenario: User inputs - Template
    Given I create a user input template named 'UserInputTpl'
    Then A user input template sheet is opened for 'UserInputTpl'

    When I add a component to the 'custom_body' component in user input template 'UserInputTpl'
    And I choose 'Text field' as component type
    And I type 'textfield_key' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in user input template 'UserInputTpl'
    And I choose 'Checkbox' as component type
    And I type 'checkbox_key' as component key
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in user input template 'UserInputTpl'
    And I choose 'Radio button' as component type
    And I type 'radio_key_1' as component key
    And I type 'radioGroup' as radio button group
    And I type 'radioValue1' as radio button value
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in user input template 'UserInputTpl'
    And I choose 'Radio button' as component type
    And I type 'radio_key_2' as component key
    And I type 'radioGroup' as radio button group
    And I type 'radioValue2' as radio button value
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in user input template 'UserInputTpl'
    And I choose 'Dropdown' as component type
    And I type 'select_key' as component key
    And I 'uncheck' dynamic table use
    And I add an option with key 'opt1' and label 'Option 1'
    And I add an option with key 'opt2' and label 'Option 2'
    And I add an option with key 'opt3' and label 'Option 3'
    And I click 'Save Component'

    When I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'formula_results' as component key
    And I type 'CLICK ME' as label text
    And I type '${#?#{UserInputTpl}}$Result : <br>text : ${textfield_key}$<br>check : ${checkbox_key}$<br>radio : ${radioGroup}$<br>select : ${select_key}$' as label roll message
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I trigger the roll message 'formula_results' in the 'AutoTest_Character' character
    Then the 'user_input' dialog is opened

    When I type 'Sample name' in the 'system.props.textfield_key' field in 'user_input' input dialog
    And I check 'radioValue2' in the 'system.props.radioGroup' radio buttons in 'user_input' input dialog
    And I check the 'system.props.checkbox_key' checkbox in 'user_input' input dialog
    And I select 'Option 2' in the 'system.props.select_key' field in 'user_input' input dialog
    And I validate the 'user_input' input dialog
    Then The last chat message says 'Result :\ntext : Sample name\ncheck : true\nradio : radioValue2\nselect : opt2'
    