# Copyright 2024 Jean-Baptiste Louvet-Daniel
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

Feature: Item Template creation
  Background:
    Given I setup the Foundry Instance

  Scenario: Basic item template creation
    Given I create a item template named 'AutoTest_Template'
    Then A item template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in item template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I click 'Advanced configuration'
    And I type 'Label tooltip' as component tooltip
    And I type 'Label text' as label text
    And I click 'Save Component'

    Then the item template 'AutoTest_Template' looks like 'template/BasicLabelTemplate'

    When I create an item named 'AutoTest_Item'
    And I assign the 'AutoTest_Template' item template to the 'AutoTest_Item' item

    Then the item 'AutoTest_Item' looks like 'item/BasicLabelItem'
    And the field 'label_key' of the item 'AutoTest_Item' has text 'Label text'

    When I open the item 'AutoTest_Template'
    And I edit the component 'label_key' in item template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key_edited' as component key
    And I click 'Advanced configuration'
    And I type 'Label tooltip edited' as component tooltip
    And I type 'Label text edited' as label text
    And I click 'Save Component'

    Then the item template 'AutoTest_Template' looks like 'template/BasicLabelTemplateEdited'

    When I open the item 'AutoTest_Item'

    Then the item 'AutoTest_Item' looks like 'item/BasicLabelItem'
    And the field 'label_key' of the item 'AutoTest_Item' has text 'Label text'

    When I assign the 'AutoTest_Template' item template to the 'AutoTest_Item' item

    Then the item 'AutoTest_Item' looks like 'item/BasicLabelItemEdited'
    And the field 'label_key_edited' of the item 'AutoTest_Item' has text 'Label text edited'

#  Scenario: Component drag and drop
#    Given I create a actor template named 'AutoTest_Template'
#    Then A actor template sheet is opened for 'AutoTest_Template'
#
#    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
#    And I choose 'Label' as component type
#    And I type 'label_key' as component key
#    And I type 'Label text' as label text
#    And I click 'Save Component'
#
#    Then the actor template 'AutoTest_Template' looks like 'template/BasicTemplateLabel'
#
#    When I move the 'label_key' component to the last position of container 'custom_header' in template 'AutoTest_Template'
#
#    Then the actor template 'AutoTest_Template' looks like 'template/dragDrop/LabelInHeader'
