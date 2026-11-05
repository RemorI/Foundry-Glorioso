# Copyright 2024 Jean-Baptiste Louvet-Daniel
# 
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

Feature: Table configuration

  Background:
    Given I setup the Foundry Instance
    And I create a actor template named 'AutoTest_Template'

   Scenario: Basic table creation
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Table' as component type
    And I type 'table_key' as component key
    And I type '3' as table row count
    And I type '4' as table column count
    And I type 'cccc' as table layout
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'table/BasicTable'

  Scenario: Table layout
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Table' as component type
    And I type 'table_key' as component key
    And I type '3' as table row count
    And I type '4' as table column count
    And I type 'clrc' as table layout
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '1', column '1'
    And I choose 'Label' as component type
    And I type 'Label 1' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '1', column '2'
    And I choose 'Label' as component type
    And I type 'Label 2' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '1', column '3'
    And I choose 'Label' as component type
    And I type 'Label 3' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '1', column '4'
    And I choose 'Label' as component type
    And I type 'Label 4' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '2', column '1'
    And I choose 'Label' as component type
    And I type 'Label 5' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '2', column '2'
    And I choose 'Label' as component type
    And I type 'Label 6' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '2', column '3'
    And I choose 'Label' as component type
    And I type 'Label 7' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '2', column '4'
    And I choose 'Label' as component type
    And I type 'Label 8' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '3', column '1'
    And I choose 'Label' as component type
    And I type 'Label 9' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '3', column '2'
    And I choose 'Label' as component type
    And I type 'Label 10' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '3', column '3'
    And I choose 'Label' as component type
    And I type 'Label 11' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '3', column '4'
    And I choose 'Label' as component type
    And I type 'Label 12' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'table/Layout'

  Scenario: Table size edition
    When I add a component to the 'custom_body' component in actor template 'AutoTest_Template'
    And I choose 'Table' as component type
    And I type 'table_key' as component key
    And I type '3' as table row count
    And I type '4' as table column count
    And I type 'clrc' as table layout
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '1', column '1'
    And I choose 'Label' as component type
    And I type 'Label 1' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '1', column '2'
    And I choose 'Label' as component type
    And I type 'Label 2' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '1', column '3'
    And I choose 'Label' as component type
    And I type 'Label 3' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '1', column '4'
    And I choose 'Label' as component type
    And I type 'Label 4' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '2', column '1'
    And I choose 'Label' as component type
    And I type 'Label 5' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '2', column '2'
    And I choose 'Label' as component type
    And I type 'Label 6' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '2', column '3'
    And I choose 'Label' as component type
    And I type 'Label 7' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '2', column '4'
    And I choose 'Label' as component type
    And I type 'Label 8' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '3', column '1'
    And I choose 'Label' as component type
    And I type 'Label 9' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '3', column '2'
    And I choose 'Label' as component type
    And I type 'Label 10' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '3', column '3'
    And I choose 'Label' as component type
    And I type 'Label 11' as label text
    And I click 'Save Component'

    When I add a component to the 'table_key' table in template 'AutoTest_Template' in row '3', column '4'
    And I choose 'Label' as component type
    And I type 'Label 12' as label text
    And I click 'Save Component'

    When I create a character named 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'table/Table34'

    When I open the actor 'AutoTest_Template'
    And I edit the container 'table_key' in actor template 'AutoTest_Template'
    And I type '4' as table row count
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'table/Table44'

    When I open the actor 'AutoTest_Template'
    And I edit the container 'table_key' in actor template 'AutoTest_Template'
    And I type '5' as table column count
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'table/Table45'


    When I open the actor 'AutoTest_Template'
    And I edit the container 'table_key' in actor template 'AutoTest_Template'
    And I type '2' as table row count
    And I type '2' as table column count
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'table/Table22'

    When I open the actor 'AutoTest_Template'
    And I edit the container 'table_key' in actor template 'AutoTest_Template'
    And I type '3' as table row count
    And I type '4' as table column count
    And I click 'Save Component'

    When I open the actor 'AutoTest_Character'
    And I assign the 'AutoTest_Template' template to the 'AutoTest_Character' character

    Then the character 'AutoTest_Character' looks like 'table/Table34'

#TODO Advanced configuration