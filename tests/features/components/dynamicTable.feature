# Copyright 2024 Jean-Baptiste Louvet-Daniel
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
Feature: Dynamic table configuration

  Background:
    Given I setup the Foundry Instance
    And I create a actor template named 'AutoTest_Template'

  Scenario: Basic Dynamic Table creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type 'Label text' as label text
    And I type 'Label' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'textfield_key' as component key
    And I type 'Text' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_key' as component key
    And I type 'Number' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Checkbox' as component type
    And I type 'checkbox_key' as component key
    And I type 'Check' as component column name
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'dynamicTable/BasicDynamicTable'

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'TextField Value 1' in 'textfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '99' in 'numfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I click on the 'checkbox_key' checkbox in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    And I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'TextField Value 2' in 'textfield_key' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '20' in 'numfield_key' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    And I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'TextField Value 3' in 'textfield_key' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '70' in 'numfield_key' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I click on the 'checkbox_key' checkbox in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'dynamicTable/FilledDynamicTable'

    When I sort 'down' the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    Then the character 'AutoTest_Character' looks like 'dynamicTable/FilledDynamicTable-132'

    When I sort 'up' the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    Then the character 'AutoTest_Character' looks like 'dynamicTable/FilledDynamicTable-312'

    When I delete the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    Then the character 'AutoTest_Character' looks like 'dynamicTable/FilledDynamicTable-RowDeleted'

  Scenario: Dynamic table column name display
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I 'uncheck' make column name bold
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type 'Label text' as label text
    And I type 'Label' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'textfield_key' as component key
    And I type 'Text' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_key' as component key
    And I type 'Number' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Checkbox' as component type
    And I type 'checkbox_key' as component key
    And I type 'Check' as component column name
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'dynamicTable/BasicDynamicTable'

    When I open the actor 'AutoTest_Template'
    And I edit the container 'dynamic_key' in actor template 'AutoTest_Template'
    And I 'check' make column name bold
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'dynamicTable/BoldColumnNames'

  Scenario: Row deletion confirmation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I 'uncheck' show confirmation dialog on row delete
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type 'Label text' as label text
    And I type 'Label' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'textfield_key' as component key
    And I type 'Text' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_key' as component key
    And I type 'Number' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Checkbox' as component type
    And I type 'checkbox_key' as component key
    And I type 'Check' as component column name
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'TextField Value 1' in 'textfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '99' in 'numfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I click on the 'checkbox_key' checkbox in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    When I delete the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    Then the character 'AutoTest_Character' looks like 'dynamicTable/BasicDynamicTable'

    When I open the actor 'AutoTest_Template'
    And I edit the container 'dynamic_key' in actor template 'AutoTest_Template'
    And I 'check' show confirmation dialog on row delete
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'TextField Value 1' in 'textfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '99' in 'numfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I click on the 'checkbox_key' checkbox in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    When I delete the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    Then the 'deleteRow' dialog is opened

    When I 'accept' the 'deleteRow' dialog
    Then the character 'AutoTest_Character' looks like 'dynamicTable/BasicDynamicTable'

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'TextField Value 1' in 'textfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '99' in 'numfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I click on the 'checkbox_key' checkbox in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    When I delete the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    Then the 'deleteRow' dialog is opened

    When I 'cancel' the 'deleteRow' dialog
    Then the character 'AutoTest_Character' looks like 'dynamicTable/DynamicTable1Row'

  Scenario: Column alignment
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I 'uncheck' show confirmation dialog on row delete
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type 'Label text' as label text
    And I type 'Label' as component column name
    And I select 'Left' as column alignment
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'dynamicTable/AlignColumnLeft'

    When I open the actor 'AutoTest_Template'
    And I edit the column 'label_key' in the dynamic table 'dynamic_key' in template 'AutoTest_Template'
    And I select 'Center' as column alignment
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'dynamicTable/AlignColumnCenter'

    When I open the actor 'AutoTest_Template'
    And I edit the column 'label_key' in the dynamic table 'dynamic_key' in template 'AutoTest_Template'
    And I select 'Right' as column alignment
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'dynamicTable/AlignColumnRight'

  Scenario: Column movement & deletion
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I 'uncheck' show confirmation dialog on row delete
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type 'Label text' as label text
    And I type 'Label' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'textfield_key' as component key
    And I type 'Text' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_key' as component key
    And I type 'Number' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Checkbox' as component type
    And I type 'checkbox_key' as component key
    And I type 'Check' as component column name
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'TextField Value 1' in 'textfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '99' in 'numfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I click on the 'checkbox_key' checkbox in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    And I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'TextField Value 2' in 'textfield_key' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '20' in 'numfield_key' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'dynamicTable/2RowsLabelNumberCheckbox'

    When I open the actor 'AutoTest_Template'
    And I move the column 'textfield_key' in the dynamic table 'dynamic_key' in template 'AutoTest_Template' to the 'left'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'dynamicTable/2RowsTextLabelNumberCheckbox'

    When I open the actor 'AutoTest_Template'
    And I move the column 'textfield_key' in the dynamic table 'dynamic_key' in template 'AutoTest_Template' to the 'left'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'dynamicTable/2RowsTextLabelNumberCheckbox'

    When I open the actor 'AutoTest_Template'
    And I move the column 'numfield_key' in the dynamic table 'dynamic_key' in template 'AutoTest_Template' to the 'right'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'dynamicTable/2RowsTextLabelCheckboxNumber'

    When I open the actor 'AutoTest_Template'
    And I move the column 'numfield_key' in the dynamic table 'dynamic_key' in template 'AutoTest_Template' to the 'right'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'dynamicTable/2RowsTextLabelCheckboxNumber'

    When I open the actor 'AutoTest_Template'
    And I edit the column 'checkbox_key' in the dynamic table 'dynamic_key' in template 'AutoTest_Template'
    And I click 'Delete Component'

    Then the 'deleteComponent' dialog is opened
    When I 'accept' the 'deleteComponent' dialog

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'dynamicTable/2RowsTextLabelNumber'

  Scenario: Predefined lines
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Dynamic Table' as component type
    And I type 'dynamic_key' as component key
    And I 'uncheck' show confirmation dialog on row delete
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Label' as component type
    And I type 'label_key' as component key
    And I type 'Label text' as label text
    And I type 'Label' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Text field' as component type
    And I type 'textfield_key' as component key
    And I type 'Text' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Number field' as component type
    And I type 'numfield_key' as component key
    And I type 'Number' as component column name
    And I click 'Save Component'

    When I add a component to the 'dynamic_key' component in actor template 'AutoTest_Template'
    And I choose 'Checkbox' as component type
    And I type 'checkbox_key' as component key
    And I type 'Check' as component column name
    And I click 'Save Component'

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Template' template
    And I type 'TextField Value 1' in 'textfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Template' template
    And I type '99' in 'numfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Template' template
    And I click on the 'checkbox_key' checkbox in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Template' template

    And I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Template' template
    And I type 'TextField Value 2' in 'textfield_key' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Template' template
    And I type '20' in 'numfield_key' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Template' template

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the field 'textfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has value 'TextField Value 1'
    And the field 'numfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has value '99'
    And The 'checkbox_key' checkbox in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character is 'checked'

    And the field 'textfield_key' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has value 'TextField Value 2'
    And the field 'numfield_key' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has value '20'
    And The 'checkbox_key' checkbox in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character is 'not checked'

    When I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type 'TextField Value 3' in 'textfield_key' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I type '33' in 'numfield_key' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I click on the 'checkbox_key' checkbox in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character
    And I delete the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character

    Then the field 'textfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has value 'TextField Value 1'
    And the field 'numfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has value '99'
    And The 'checkbox_key' checkbox in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character is 'checked'

    And the field 'textfield_key' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has value 'TextField Value 3'
    And the field 'numfield_key' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has value '33'
    And The 'checkbox_key' checkbox in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character is 'checked'

    When I open the actor 'AutoTest_Template'
    And I add a row to the 'dynamic_key' dynamic table in the 'AutoTest_Template' template
    And I type 'TextField Value 4' in 'textfield_key' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Template' template
    And I type '44' in 'numfield_key' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Template' template
    And I click on the 'checkbox_key' checkbox in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Template' template

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the field 'textfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has value 'TextField Value 1'
    And the field 'numfield_key' in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has value '99'
    And The 'checkbox_key' checkbox in the row '1' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character is 'checked'

    And the field 'textfield_key' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has value 'TextField Value 3'
    And the field 'numfield_key' in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has value '33'
    And The 'checkbox_key' checkbox in the row '2' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character is 'checked'

    And the field 'textfield_key' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has value 'TextField Value 4'
    And the field 'numfield_key' in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character has value '44'
    And The 'checkbox_key' checkbox in the row '3' of the 'dynamic_key' dynamic table in the 'AutoTest_Character' character is 'checked'
