# Copyright 2024 Jean-Baptiste Louvet-Daniel
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

Feature: Template creation

  Background:
    Given I setup the Foundry Instance

  Scenario: Basic template creation
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I click 'Advanced configuration'
    And I type 'Label tooltip' as component tooltip
    And I type 'Label text' as label text
    And I click 'Save Component'

    Then the actor template 'AutoTest_Template' looks like 'template/BasicTemplateLabel'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'label/BasicLabel'
    And the field 'label_key' of the character 'AutoTest_Character' has text 'Label text'

    When I open the actor 'AutoTest_Template'
    And I edit the component 'label_key' in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key_edited' as component key
    And I click 'Advanced configuration'
    And I type 'Label tooltip edited' as component tooltip
    And I type 'Label text edited' as label text
    And I click 'Save Component'

    Then the actor template 'AutoTest_Template' looks like 'template/BasicTemplateLabelEdited'

    When I open the actor 'AutoTest_Character'

    Then the character 'AutoTest_Character' looks like 'label/BasicLabel'
    And the field 'label_key' of the character 'AutoTest_Character' has text 'Label text'

    When I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'label/BasicLabelEdited'
    And the field 'label_key_edited' of the character 'AutoTest_Character' has text 'Label text edited'

  Scenario: Component deletion
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type 'Label text' as label text
    And I click 'Save Component'

    Then the actor template 'AutoTest_Template' looks like 'template/BasicTemplateLabel'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'label/BasicLabel'

    When I open the actor 'AutoTest_Template'
    And I edit the component 'label_key' in actor template 'AutoTest_Template'
    And I click 'Delete Component'

    Then the 'deleteComponent' dialog is opened

    When I 'cancel' the 'deleteComponent' dialog
    Then The component edition dialog is opened

    When I click 'Cancel Component Edition'
    Then the actor template 'AutoTest_Template' looks like 'template/BasicTemplateLabel'

    When I open the actor 'AutoTest_Template'
    And I edit the component 'label_key' in actor template 'AutoTest_Template'
    And I click 'Delete Component'

    Then the 'deleteComponent' dialog is opened
    When I 'accept' the 'deleteComponent' dialog

    Then the actor template 'AutoTest_Template' looks like 'template/BasicTemplateLabelDeleted'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'label/BasicLabelDeleted'

  Scenario: Undo / Redo
    Given I create a actor template named 'AutoTest_Template'
    Then A actor template sheet is opened for 'AutoTest_Template'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type 'Label text' as label text
    And I click 'Save Component'

    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key_2' as component key
    And I type 'Label text 2' as label text
    And I click 'Save Component'

    Then the actor template 'AutoTest_Template' looks like 'template/undoRedo/BaseState'

    When I edit the component 'label_key_2' in actor template 'AutoTest_Template'
    And I type 'Label text 2 Edited' as label text
    And I click 'Save Component'

    Then the actor template 'AutoTest_Template' looks like 'template/undoRedo/EditedState'

    When I click 'undo' in template 'AutoTest_Template'
    Then the actor template 'AutoTest_Template' looks like 'template/undoRedo/BaseUndoState'

    When I click 'undo' in template 'AutoTest_Template'
    Then the actor template 'AutoTest_Template' looks like 'template/undoRedo/OneLabelState'

    When I click 'redo' in template 'AutoTest_Template'
    Then the actor template 'AutoTest_Template' looks like 'template/undoRedo/BaseUndoState'

    When I click 'redo' in template 'AutoTest_Template'
    Then the actor template 'AutoTest_Template' looks like 'template/undoRedo/EditedState'

    When I click 'undo' in template 'AutoTest_Template'
    And I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key_3' as component key
    And I type 'Label text 3' as label text
    And I click 'Save Component'

    Then the actor template 'AutoTest_Template' looks like 'template/undoRedo/3LabelState'


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
