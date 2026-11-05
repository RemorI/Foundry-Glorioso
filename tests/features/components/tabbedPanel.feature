# Copyright 2024 Jean-Baptiste Louvet-Daniel
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

Feature: Tabbed panel configuration

  Background:
    Given I setup the Foundry Instance
    And I create a actor template named 'AutoTest_Template'

  Scenario: Basic tabbed panel creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Tabbed Panel' as component type
    And I type 'tabbed_panel_key' as component key
    And I click 'Save Component'

    When I add a new tab to the 'tabbed_panel_key' Tabbed Panel in template 'AutoTest_Template'
    And I type 'Tab 1' as tab name
    And I type 'tab_1_key' as tab key
    And I type 'Tab 1 tooltip' as tab tooltip
    And I click 'Save Component'

    When I add a new tab to the 'tabbed_panel_key' Tabbed Panel in template 'AutoTest_Template'
    And I type 'Tab 2' as tab name
    And I type 'tab_2_key' as tab key
    And I type 'Tab 2 tooltip' as tab tooltip
    And I click 'Save Component'

    When I select tab 'tab_1_key' in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template'
    And I add a component to the 'tab_1_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key_1' as component key
    And I type 'Label text 1' as label text
    And I click 'Save Component'

    When I select tab 'tab_2_key' in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template'
    And I add a component to the 'tab_2_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key_2' as component key
    And I type 'Label text 2' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'tabbedPanel/BasicTabbedPanel_Tab1'

    When I select tab 'tab_2_key' in Tabbed Panel 'tabbed_panel_key' in character 'AutoTest_Character'
    Then the character 'AutoTest_Character' looks like 'tabbedPanel/BasicTabbedPanel_Tab2'

  Scenario: Tabbed panel edition
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Tabbed Panel' as component type
    And I type 'tabbed_panel_key' as component key
    And I click 'Save Component'

    When I add a new tab to the 'tabbed_panel_key' Tabbed Panel in template 'AutoTest_Template'
    And I type 'Tab 1' as tab name
    And I type 'tab_1_key' as tab key
    And I type 'Tab 1 tooltip' as tab tooltip
    And I click 'Save Component'

    When I add a new tab to the 'tabbed_panel_key' Tabbed Panel in template 'AutoTest_Template'
    And I type 'Tab 2' as tab name
    And I type 'tab_2_key' as tab key
    And I type 'Tab 2 tooltip' as tab tooltip
    And I click 'Save Component'

    When I add a new tab to the 'tabbed_panel_key' Tabbed Panel in template 'AutoTest_Template'
    And I type 'Tab 3' as tab name
    And I type 'tab_3_key' as tab key
    And I type 'Tab 3 tooltip' as tab tooltip
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'tabbedPanel/SwitchPositions_123'

    When I open the actor 'AutoTest_Template'
    And I switch tab 'tab_2_key' in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template' to the 'right'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    Then the character 'AutoTest_Character' looks like 'tabbedPanel/SwitchPositions_132'

    When I open the actor 'AutoTest_Template'
    And I switch tab 'tab_2_key' in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template' to the 'right'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    Then the character 'AutoTest_Character' looks like 'tabbedPanel/SwitchPositions_132'

    When I open the actor 'AutoTest_Template'
    And I switch tab 'tab_3_key' in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template' to the 'left'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    Then the character 'AutoTest_Character' looks like 'tabbedPanel/SwitchPositions_312'

    When I open the actor 'AutoTest_Template'
    And I switch tab 'tab_3_key' in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template' to the 'left'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    Then the character 'AutoTest_Character' looks like 'tabbedPanel/SwitchPositions_312'

    When I open the actor 'AutoTest_Template'
    And I switch tab 'tab_1_key' in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template' to the 'left'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    Then the character 'AutoTest_Character' looks like 'tabbedPanel/SwitchPositions_132'

    When I open the actor 'AutoTest_Template'
    And I select tab 'tab_2_key' in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template'
    And I edit current tab in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template'
    And I type 'Tab final' as tab name
    And I type 'tab_final_key' as tab key
    And I type '' as tab tooltip
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    Then the character 'AutoTest_Character' looks like 'tabbedPanel/TabEditedFinal'

    When I open the actor 'AutoTest_Template'
    And I select tab 'tab_final_key' in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template'
    And I delete current tab in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template'
    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character
    Then the character 'AutoTest_Character' looks like 'tabbedPanel/TabDeleted'

  Scenario: Nested tabbed panels
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Tabbed Panel' as component type
    And I type 'tabbed_panel_key' as component key
    And I click 'Save Component'

    When I add a new tab to the 'tabbed_panel_key' Tabbed Panel in template 'AutoTest_Template'
    And I type 'Tab 1' as tab name
    And I type 'tab_1_key' as tab key
    And I type 'Tab 1 tooltip' as tab tooltip
    And I click 'Save Component'

    When I add a new tab to the 'tabbed_panel_key' Tabbed Panel in template 'AutoTest_Template'
    And I type 'Tab 2' as tab name
    And I type 'tab_2_key' as tab key
    And I type 'Tab 2 tooltip' as tab tooltip
    And I click 'Save Component'

    When I select tab 'tab_1_key' in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template'
    And I add a component to the 'tab_1_key' component in actor template 'AutoTest_Template'
    And I choose 'Tabbed Panel' as component type
    And I type 'tab_1_nested_panel' as component key
    And I click 'Save Component'

    When I add a new tab to the 'tab_1_nested_panel' Tabbed Panel in template 'AutoTest_Template'
    And I type 'Tab 1 Nested 1' as tab name
    And I type 'tab_1_nested_1' as tab key
    And I click 'Save Component'

    When I add a new tab to the 'tab_1_nested_panel' Tabbed Panel in template 'AutoTest_Template'
    And I type 'Tab 1 Nested 2' as tab name
    And I type 'tab_1_nested_2' as tab key
    And I click 'Save Component'

    When I select tab 'tab_2_key' in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template'
    And I add a component to the 'tab_2_key' component in actor template 'AutoTest_Template'
    And I choose 'Tabbed Panel' as component type
    And I type 'tab_2_nested_panel' as component key
    And I click 'Save Component'

    When I add a new tab to the 'tab_2_nested_panel' Tabbed Panel in template 'AutoTest_Template'
    And I type 'Tab 2 Nested 1' as tab name
    And I type 'tab_2_nested_1' as tab key
    And I click 'Save Component'

    When I add a new tab to the 'tab_2_nested_panel' Tabbed Panel in template 'AutoTest_Template'
    And I type 'Tab 2 Nested 2' as tab name
    And I type 'tab_2_nested_2' as tab key
    And I click 'Save Component'

    When I select tab 'tab_1_key' in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template'
    And I select tab 'tab_1_nested_1' in Tabbed Panel 'tab_1_nested_panel' in template 'AutoTest_Template'
    And I add a component to the 'tab_1_nested_1' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key_1_1' as component key
    And I type 'Label text 1 - 1' as label text
    And I click 'Save Component'

    When I select tab 'tab_1_key' in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template'
    And I select tab 'tab_1_nested_2' in Tabbed Panel 'tab_1_nested_panel' in template 'AutoTest_Template'
    And I add a component to the 'tab_1_nested_2' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key_1_2' as component key
    And I type 'Label text 1 - 2' as label text
    And I click 'Save Component'

    When I select tab 'tab_2_key' in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template'
    And I select tab 'tab_2_nested_1' in Tabbed Panel 'tab_2_nested_panel' in template 'AutoTest_Template'
    And I add a component to the 'tab_2_nested_1' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key_2_1' as component key
    And I type 'Label text 2 - 1' as label text
    And I click 'Save Component'

    When I select tab 'tab_2_key' in Tabbed Panel 'tabbed_panel_key' in template 'AutoTest_Template'
    And I select tab 'tab_2_nested_2' in Tabbed Panel 'tab_2_nested_panel' in template 'AutoTest_Template'
    And I add a component to the 'tab_2_nested_2' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key_2_2' as component key
    And I type 'Label text 2 - 2' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'tabbedPanel/Nested1-1'

    When I select tab 'tab_1_nested_2' in Tabbed Panel 'tabbed_panel_key' in character 'AutoTest_Character'
    Then the character 'AutoTest_Character' looks like 'tabbedPanel/Nested1-2'

    When I select tab 'tab_2_key' in Tabbed Panel 'tabbed_panel_key' in character 'AutoTest_Character'
    And I select tab 'tab_2_nested_1' in Tabbed Panel 'tabbed_panel_key' in character 'AutoTest_Character'
    Then the character 'AutoTest_Character' looks like 'tabbedPanel/Nested2-1'

    And I select tab 'tab_2_nested_2' in Tabbed Panel 'tabbed_panel_key' in character 'AutoTest_Character'
    Then the character 'AutoTest_Character' looks like 'tabbedPanel/Nested2-2'

    When I select tab 'tab_1_key' in Tabbed Panel 'tabbed_panel_key' in character 'AutoTest_Character'
    Then the character 'AutoTest_Character' looks like 'tabbedPanel/Nested1-2'

    When I select tab 'tab_2_key' in Tabbed Panel 'tabbed_panel_key' in character 'AutoTest_Character'
    And I select tab 'tab_2_nested_1' in Tabbed Panel 'tabbed_panel_key' in character 'AutoTest_Character'
    And I close the character 'AutoTest_Character'
    And I open the actor 'AutoTest_Character'
    Then the character 'AutoTest_Character' looks like 'tabbedPanel/Nested2-1'
