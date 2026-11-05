# Copyright 2024 Jean-Baptiste Louvet-Daniel
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

Feature: Radio button configuration

  Background:
    Given I setup the Foundry Instance
    And I create a actor template named 'AutoTest_Template'

  Scenario: Basic radio button creation
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
    And I choose 'Radio button' as component type
    And I type 'radio_key_3' as component key
    And I type 'radioGroup' as radio button group
    And I type 'radioValue3' as radio button value
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'radioButton/BasicRadioButton'

    When I click on the 'radio_key_1' radio button in the 'AutoTest_Character' character
    Then The 'radio_key_1' radio button is 'checked' in the 'AutoTest_Character' character
    Then The 'radio_key_2' radio button is 'not checked' in the 'AutoTest_Character' character
    Then The 'radio_key_3' radio button is 'not checked' in the 'AutoTest_Character' character

    When I click on the 'radio_key_2' radio button in the 'AutoTest_Character' character
    Then The 'radio_key_1' radio button is 'not checked' in the 'AutoTest_Character' character
    Then The 'radio_key_2' radio button is 'checked' in the 'AutoTest_Character' character
    Then The 'radio_key_3' radio button is 'not checked' in the 'AutoTest_Character' character

    When I click on the 'radio_key_3' radio button in the 'AutoTest_Character' character
    Then The 'radio_key_1' radio button is 'not checked' in the 'AutoTest_Character' character
    Then The 'radio_key_2' radio button is 'not checked' in the 'AutoTest_Character' character
    Then The 'radio_key_3' radio button is 'checked' in the 'AutoTest_Character' character

  Scenario: Full radio button creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Radio button' as component type
    And I type 'radio_key_1_1' as component key
    And I type 'Radio 1 Label' as radio button label
    And I type 'radioGroup1' as radio button group
    And I type 'radioValue1' as radio button value
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Radio button' as component type
    And I type 'radio_key_1_2' as component key
    And I type 'Radio 2 Label' as radio button label
    And I type 'radioGroup1' as radio button group
    And I type 'radioValue2' as radio button value
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Radio button' as component type
    And I type 'radio_key_1_3' as component key
    And I type 'Radio 3 Label' as radio button label
    And I type 'radioGroup1' as radio button group
    And I type 'radioValue3' as radio button value
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Radio button' as component type
    And I type 'radio_key_2_1' as component key
    And I type 'Radio 4 Label' as radio button label
    And I type 'radioGroup2' as radio button group
    And I type 'radioValue1' as radio button value
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Radio button' as component type
    And I type 'radio_key_2_2' as component key
    And I type 'Radio 5 Label' as radio button label
    And I type 'radioGroup2' as radio button group
    And I type 'radioValue2' as radio button value
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'radioButton/FullRadioButton'

    When I open the actor 'AutoTest_Template'
    And I edit the component 'radio_key_1_1' in actor template 'AutoTest_Template'
    And I type 'Radio 1 Label edited' as radio button label
    And I click 'Save Component'

    And I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'radioButton/FullRadioButtonEdited'

    When I click on the 'radio_key_1_1' radio button in the 'AutoTest_Character' character
    And I click on the 'radio_key_2_1' radio button in the 'AutoTest_Character' character
    Then The 'radio_key_1_1' radio button is 'checked' in the 'AutoTest_Character' character
    Then The 'radio_key_1_2' radio button is 'not checked' in the 'AutoTest_Character' character
    Then The 'radio_key_1_3' radio button is 'not checked' in the 'AutoTest_Character' character
    Then The 'radio_key_2_1' radio button is 'checked' in the 'AutoTest_Character' character
    Then The 'radio_key_2_2' radio button is 'not checked' in the 'AutoTest_Character' character

    When I click on the 'radio_key_1_2' radio button in the 'AutoTest_Character' character
    Then The 'radio_key_1_1' radio button is 'not checked' in the 'AutoTest_Character' character
    Then The 'radio_key_1_2' radio button is 'checked' in the 'AutoTest_Character' character
    Then The 'radio_key_1_3' radio button is 'not checked' in the 'AutoTest_Character' character
    Then The 'radio_key_2_1' radio button is 'checked' in the 'AutoTest_Character' character
    Then The 'radio_key_2_2' radio button is 'not checked' in the 'AutoTest_Character' character

    When I click on the 'radio_key_2_2' radio button in the 'AutoTest_Character' character
    Then The 'radio_key_1_1' radio button is 'not checked' in the 'AutoTest_Character' character
    Then The 'radio_key_1_2' radio button is 'checked' in the 'AutoTest_Character' character
    Then The 'radio_key_1_3' radio button is 'not checked' in the 'AutoTest_Character' character
    Then The 'radio_key_2_1' radio button is 'not checked' in the 'AutoTest_Character' character
    Then The 'radio_key_2_2' radio button is 'checked' in the 'AutoTest_Character' character
