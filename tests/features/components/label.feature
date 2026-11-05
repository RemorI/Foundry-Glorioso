# Copyright 2024 Jean-Baptiste Louvet-Daniel
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

Feature: Label configuration

  Background:
    Given I setup the Foundry Instance
    And I create a actor template named 'AutoTest_Template'

  Scenario: Basic label creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type 'Label text' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'label/BasicLabel'

  Scenario: Full label creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I select 'Title' as label style
    And I type 'Label text' as label text
    And I type 'Label prefix' as label prefix
    And I type 'Label suffix' as label suffix
    And I type 'globe-asia' as label icon
    And I type 'Roll message' as label roll message
    And I type 'Alternate roll message' as label alternate roll message
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'label/FullLabel'

  Scenario: Label text referencing
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_ref' as component key
    And I type 'Label text' as label text
    And I type 'Label prefix' as label prefix
    And I type 'Label suffix' as label suffix
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type '${label_ref}$' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the field 'label_key' of the character 'AutoTest_Character' has text 'Label text'

  Scenario: Basic formulas in prefix / suffix
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type '${2+2}$' as label text
    And I type '${1+1}$' as label prefix
    And I type '${3+3}$' as label suffix
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the field 'label_key' of the character 'AutoTest_Character' has text '246'

  Scenario: Basic rolls
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type 'Label text' as label text
    And I type 'Hello world !' as label roll message
    And I type 'This is an alt roll !' as label alternate roll message
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    Then the character 'AutoTest_Character' looks like 'label/BasicLabelRollMessage'

    When I trigger the roll message 'label_key' in the 'AutoTest_Character' character
    Then The last chat message says 'Hello world !'

    When I trigger the alt roll message 'label_key' in the 'AutoTest_Character' character
    Then The last chat message says 'This is an alt roll !'

  Scenario: Basic formulas in rolls
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type 'Label text' as label text
    And I type '${1+1}$' as label roll message
    And I type '${2+2}$' as label alternate roll message
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    And I trigger the roll message 'label_key' in the 'AutoTest_Character' character
    Then The last chat message says '2'

    When I trigger the alt roll message 'label_key' in the 'AutoTest_Character' character
    Then The last chat message says '4'


  Scenario Outline: Basic label creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I select '<style>' as label style
    And I type 'Label text' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'label/BasicLabel<style>'

    Examples:
      | style     |
      | Default   |
      | Title     |
      | Subtitle  |
      | Bold text |

#TODO Size testing
#TODO Advanced configuration