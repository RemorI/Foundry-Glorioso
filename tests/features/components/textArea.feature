# Copyright 2024 Jean-Baptiste Louvet-Daniel
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

Feature: Rich text area configuration

  Background:
    Given I setup the Foundry Instance
    And I create a actor template named 'AutoTest_Template'

  Scenario: Basic Rich Text Area creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Rich Text Area' as component type
    And I type 'rta_key' as component key
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I unfocus everything

    Then the character 'AutoTest_Character' looks like 'textArea/BasicClosedTextArea'
    And the edit button for the 'rta_key' text area in the 'AutoTest_Character' character is 'not visible'

    When I hover over the 'rta_key' text area in the character 'AutoTest_Character'
    Then the edit button for the 'rta_key' text area in the 'AutoTest_Character' character is 'visible'
    When I open the 'rta_key' text area in the 'AutoTest_Character' character
    Then the character 'AutoTest_Character' looks like 'textArea/BasicOpenTextArea' with '0.07' fidelity

    When I type 'Sample text' in the text area 'rta_key' in the 'AutoTest_Character' character
    And I save the text area 'rta_key' in the 'AutoTest_Character' character
    And I unfocus everything

    Then the edit button for the 'rta_key' text area in the 'AutoTest_Character' character is 'not visible'
    And the field 'rta_key' of the character 'AutoTest_Character' has text 'Sample text'

    When I hover over the 'rta_key' text area in the character 'AutoTest_Character'
    Then the edit button for the 'rta_key' text area in the 'AutoTest_Character' character is 'visible'

  Scenario: Full Rich Text Area creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Rich Text Area' as component type
    And I type 'rta_key' as component key
    And I type 'RTA Label' as rich text area label
    And I type 'RTA Value' as rich text area default value
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'textArea/FullClosedTextArea'

    When I hover over the 'rta_key' text area in the character 'AutoTest_Character'
    Then the edit button for the 'rta_key' text area in the 'AutoTest_Character' character is 'visible'

    When I open the 'rta_key' text area in the 'AutoTest_Character' character
    Then the character 'AutoTest_Character' looks like 'textArea/FullOpenTextArea' with '0.07' fidelity

  Scenario: Dialog Rich Text Area creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Rich Text Area' as component type
    And I type 'rta_key' as component key
    And I select 'Dialog editor' as rich text area style
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I unfocus everything

    Then the character 'AutoTest_Character' looks like 'textArea/DialogClosedTextArea'
    And the edit button for the 'rta_key' text area in the 'AutoTest_Character' character is 'visible'

    When I open the 'rta_key' text area in the 'AutoTest_Character' character
    Then the 'rta_editor' dialog is opened

    When I type 'Sample text' in the text area in the 'rta_editor' dialog
    And I save the text area in the 'rta_editor' dialog
    And I unfocus everything

    Then the edit button for the 'rta_key' text area in the 'AutoTest_Character' character is 'not visible'
    And the field 'rta_key' of the character 'AutoTest_Character' has text 'Sample text'

    When I hover over the 'rta_key' text area in the character 'AutoTest_Character'
    Then the edit button for the 'rta_key' text area in the 'AutoTest_Character' character is 'visible'

    When I open the 'rta_key' text area in the 'AutoTest_Character' character
    Then the 'rta_editor' dialog is opened
    And the text area in the 'rta_editor' dialog has text 'Sample text'

  Scenario: Icon Rich Text Area creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Rich Text Area' as component type
    And I type 'rta_key' as component key
    And I select 'Icon only' as rich text area style
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    And I unfocus everything

    Then the character 'AutoTest_Character' looks like 'textArea/IconTextArea'
    And the edit button for the 'rta_key' text area in the 'AutoTest_Character' character is 'visible'

    When I open the 'rta_key' text area in the 'AutoTest_Character' character
    Then the 'rta_editor' dialog is opened

    When I type 'Sample text' in the text area in the 'rta_editor' dialog
    And I save the text area in the 'rta_editor' dialog
    And I unfocus everything

    Then the edit button for the 'rta_key' text area in the 'AutoTest_Character' character is 'visible'
    And the character 'AutoTest_Character' looks like 'textArea/IconTextArea'
    And the field 'rta_key' of the character 'AutoTest_Character' has text ''

    When I open the 'rta_key' text area in the 'AutoTest_Character' character
    Then the 'rta_editor' dialog is opened
    And the text area in the 'rta_editor' dialog has text 'Sample text'

#TODO Advanced configuration