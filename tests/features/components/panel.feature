# Copyright 2024 Jean-Baptiste Louvet-Daniel
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

Feature: Panel configuration

  Background:
    Given I setup the Foundry Instance
    And I create a actor template named 'AutoTest_Template'

  Scenario: Basic panel creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Panel' as component type
    And I type 'panel_key' as component key
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type 'Label text' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/BasicPanel'

  Scenario: Panel layouts
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Panel' as component type
    And I type 'panel_key' as component key
    And I select 'Vertical' as panel layout
    And I click 'Save Component'


    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 1' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 2' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 3' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 4' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 5' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 6' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 7' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 8' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 9' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 10' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 11' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 12' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 13' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 14' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 15' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 16' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 17' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 18' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 19' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 20' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 21' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 22' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 23' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 24' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 25' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 26' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 27' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 28' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 29' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 30' as label text
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 31' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelLayoutVertical'

    When I open the actor 'AutoTest_Template'
    And I edit the container 'panel_key' in actor template 'AutoTest_Template'
    And I select 'Horizontal' as panel layout
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelLayoutHorizontal'


    When I open the actor 'AutoTest_Template'
    And I edit the container 'panel_key' in actor template 'AutoTest_Template'
    And I select 'Grid of 2 columns' as panel layout
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelLayout2'


    When I open the actor 'AutoTest_Template'
    And I edit the container 'panel_key' in actor template 'AutoTest_Template'
    And I select 'Grid of 3 columns' as panel layout
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelLayout3'


    When I open the actor 'AutoTest_Template'
    And I edit the container 'panel_key' in actor template 'AutoTest_Template'
    And I select 'Grid of 4 columns' as panel layout
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelLayout4'


    When I open the actor 'AutoTest_Template'
    And I edit the container 'panel_key' in actor template 'AutoTest_Template'
    And I select 'Grid of 5 columns' as panel layout
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelLayout5'


    When I open the actor 'AutoTest_Template'
    And I edit the container 'panel_key' in actor template 'AutoTest_Template'
    And I select 'Grid of 6 columns' as panel layout
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelLayout6'


    When I open the actor 'AutoTest_Template'
    And I edit the container 'panel_key' in actor template 'AutoTest_Template'
    And I select 'Grid of 7 columns' as panel layout
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelLayout7'


    When I open the actor 'AutoTest_Template'
    And I edit the container 'panel_key' in actor template 'AutoTest_Template'
    And I select 'Grid of 8 columns' as panel layout
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelLayout8'


    When I open the actor 'AutoTest_Template'
    And I edit the container 'panel_key' in actor template 'AutoTest_Template'
    And I select 'Grid of 9 columns' as panel layout
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelLayout9'


    When I open the actor 'AutoTest_Template'
    And I edit the container 'panel_key' in actor template 'AutoTest_Template'
    And I select 'Grid of 10 columns' as panel layout
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelLayout10'


    When I open the actor 'AutoTest_Template'
    And I edit the container 'panel_key' in actor template 'AutoTest_Template'
    And I select 'Grid of 11 columns' as panel layout
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelLayout11'


    When I open the actor 'AutoTest_Template'
    And I edit the container 'panel_key' in actor template 'AutoTest_Template'
    And I select 'Grid of 12 columns' as panel layout
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelLayout12'

  Scenario: Panel alignment
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Panel' as component type
    And I type 'panel_key' as component key
    And I select 'Horizontal' as panel layout
    And I select 'Center' as panel alignment
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 1' as label text
    And I select 'Small' as label size
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 2' as label text
    And I select 'Small' as label size
    And I click 'Save Component'


    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'Label 3' as label text
    And I select 'Small' as label size
    And I click 'Save Component'


    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelAlignCenter'

    When I open the actor 'AutoTest_Template'
    And I edit the container 'panel_key' in actor template 'AutoTest_Template'
    And I select 'Left' as panel alignment
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelAlignLeft'

    When I open the actor 'AutoTest_Template'
    And I edit the container 'panel_key' in actor template 'AutoTest_Template'
    And I select 'Right' as panel alignment
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelAlignRight'

    When I open the actor 'AutoTest_Template'
    And I edit the container 'panel_key' in actor template 'AutoTest_Template'
    And I select 'Justify' as panel alignment
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/PanelAlignJustify'

  Scenario: Collapsible Panels
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Panel' as component type
    And I type 'panel_key' as component key
    And I check 'Yes' on panel collapsible options
    And I check 'No' on panel default collapsed state options
    And I type 'Panel TITLE' as panel title
    And I select 'Default' as panel title style
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type 'Label text' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/CollapsedPanelExpanded'

    When I click on the title for 'panel_key' in the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/CollapsedPanelCollapsed'

    When I click on the title for 'panel_key' in the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/CollapsedPanelExpanded'

  Scenario: Collapsible Panels - Default collapsed
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Panel' as component type
    And I type 'panel_key' as component key
    And I check 'Yes' on panel collapsible options
    And I check 'Yes' on panel default collapsed state options
    And I type 'Panel TITLE' as panel title
    And I select 'Default' as panel title style
    And I click 'Save Component'

    When I click on the title for 'panel_key' in the 'AutoTest_Template' template
    And I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type 'Label text' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/CollapsedPanelCollapsed'

    When I click on the title for 'panel_key' in the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/CollapsedPanelExpanded'

  Scenario: Collapsible Panels - Title style
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Panel' as component type
    And I type 'panel_key' as component key
    And I check 'Yes' on panel collapsible options
    And I check 'No' on panel default collapsed state options
    And I type 'Panel TITLE' as panel title
    And I select 'Default' as panel title style
    And I click 'Save Component'

    When I add a component to the 'panel_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type 'Label text' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/CollapsedPanelExpanded'

    When I open the actor 'AutoTest_Template'
    And I edit the container 'panel_key' in actor template 'AutoTest_Template'
    And I select 'Title' as panel title style
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'panel/CollapsedPanelExpandedTitleStyle'

#TODO Advanced configuration