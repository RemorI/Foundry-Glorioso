<!-- markdownlint-disable MD024 -->

# CHANGELOG

## 6.1.2

### Fixes

- Fixed an issue when computing non-string Formulas

## 6.1.1

### Fixes

- Fixed an issue when computing a Formula consisting only of white spaces
- Fixed an issue on Item Displayers hidden columns computationnot getting computed fields from item

## 6.1.0

### Features

- [#541] [#544] [#534] Rework computation system to compute each property only once, and fix all computation order issues.
- Added the option to set a specific initiative formula in every template
- [#289] Added `fetchInitiative` and `setInitiative` functions to edit initiative with Formulas
- Added the `list-detailed` format in the `print-effects` function

### Fixes

- [#554] [#523] Fixed Active Effects not multiplying when using status effect counters
- [#555] Fixed property initialization for Formulas across the system

## 6.0.2

### Fixes

- [#540] Fixed undo and redo buttons not working
- [#539] Fixed Rich Text Area display in Label configuration
- [#536] Fixed Rich Text Area alignment
- Fixed issue causing errors when a Component Type was not recognized
- Fixed warning in Active Effect definition

## 6.0.1

### Fixes

- Fixed an issue with Active Effects changes on Hidden Attributes

## 6.0.0

### Features

- **BREAKING** - V14 compatibility - System is no longer compatible with v13
- **BREAKING** - Removed Item Modifiers and Status Effect Modifiers - You should now use Active Effects

### Fixes

- Fixed issue where the contextg menu on Dynamic Table Add Rows button would stay indefinitely open
- [#532] Fixed item creation dialog to allow creation ofitems with another template than the default

## 5.2.1

### Fixes

- Added missing translations
- Fixed wiki generation
- Fixed CSS rule which caused horizontal panels to be unbalanced

## 5.2.0

### Features

- Added the `printEffects` function
- Added the ability to select an alternative template when creating an Item from an Item displayer
- [#181] Added Mirror Components

### Fixes

- [#522] Fixed Template Active Effects duplication on Template refresh
- [#442] Fixed direct dice display showing roll when rolling privately

## 5.1.0

### Features

- Changed Component Config Styling to match with UI-changes from Foundry
- Added option to adjust the editable-state of a Component by a Formula
- Added a vertical align option on Panels
- [#384] Added an Item Creation button on Item Containers

### Fixes

- Suppressed computation errors on the first pass of computation of entities
- Fixed display of progress bar when reloading multiple sheets from a template
- Fixed readonly predefined rows in Dynamic Tables, where the first row was editable
- [#512] Fixed custom size not displaying the custom size field right away in some components
- [#515] Fixed Tokenizer compatibility
- [#513] Fixed Title and Subtitle labels not red when clickable

## 5.0.2

### Fixes

- [#503] Fixed CSS classes not applied on the right level on templates
- [#504] Fixed Active Effect creation process to not update multiple times (and not trigger multiple computations)
- Fixed Active Effect application process during computation
- [#498] Added an option in components to display HTML as text in the template view
- Fixed Item Displayer saving when only one template exists in the world

## 5.0.1

### Fixes

- Added a pop-up to disable the compute intensive 4.5.1 migration check
- Fixed Item filtering in case the filter formula ends in error
- Fixed buttons hover color to not be transparent
- Fixed sheet size changing when updating a field

## 5.0.0

### Features

- **BREAKING** - V13 compatibility - System is no longer compatible with v12
- **BREAKING** - Template ID and Document Type CSS classes are now at the root of the Application for AppV2
- **BREAKING** - [#433] The argument `entity` in Formula scripts is now referring directly to the Actor or Item triggering the script. A passthrough property has been added to maintain some compatibility with the `entity.entity` call, but is deprecated and will be removed in CSB 7.0.0 - Foundry v15.
- Added default images for templates
- Added icon preview in Label configuration
- Added a Label to display when an Active Effect Container of a Dynamic Table is empty
- Changed meter default maximum to 100
- Added default picture
- Added the possibility to pass a single string to the `array` function which will be splitted by commas
- Added a shortcut (`CTRL + Enter`) in the Component Settings Editor which saves the component
- Added `throwUncomputableError` as a directly callable function in scripts and deprecated the existing `entity.templateSystem.throwUncomputableError` call

### Fixes

- Fixed issue with Dropdown not showing keys when labels are empty
- Fixed Extensible Table automatic sorting
- Added a default image to status effects
- Fixed multiple functions to allow fallback values to be explicitly undefined, to allow handling by the fallback() function
- Deduplicated dropdown option keys : if multiple of the same key is found, only the first iteration is generated and added to the dropdown
- Fixed handling of multiple statement formulas (separated with a `;`)

## 4.8.5

### Fixes

- [#507] Fixed an error when trying to access token config from various places like the default token config

## 4.8.4

### Fixes

- Fixed isTemplate getter for Items, which causes issues with Item Piles

## 4.8.3

### Fixes

- Fix for a rendering bug triggering a warning notification on any sheet update for players who have no permissions over the sheet
- [#496] Fixed Tiny sized inputs size

## 4.8.2

### Fixes

- Fixed Number field controls display

## 4.8.1

### Fixes

- Fixed radio button incorrectly storing its uncomputed value
- Fixed component editor keeping old forms hidden instead of deleting them, causing collisions
- [#452] Fixed column visibility handling for Dynamic Tables and Item Displayers

## 4.8.0

### Features

- [#320] Added Picture Component
- [#212] Added Edition minimum role
- [#434] Added Readonly mode for predefined lines in Dynamic Tables
- [#162] Added option to span a component on multiple rows or columns
- [#452] Added Hidden Columns for Dynamic Tables and Item Displayers
- Added Template ID as CSS class to User Input Templates windows
- Added Custom Increments settings in Number Fields (Thanks to adorablecoin)

### Fixes

- [#487] Fixed Rich Text Area dialog editor save when HTML editor is opened
- Fixed handlebars templates not including the template ID as a CSS class
- [#490] Fixed id handling for checkboxes and radio buttons + removed unecessary field refocus for sheet v2
- [#491] Closing a user input no longer triggers the rest of the process and instead cancel the message

## 4.7.3

### Fixes

- [#489] Fixed attribute bars not being selectable in the token config

## 4.7.2

### Fixes

- [#484] Fixed unlinked token initialization
- [#485] Fixed Panels always collapsible
- [#486] Fixed component movement causing components to disappear
- Fixed undo / redo buttons

## 4.7.1

### Fixes

- [#483] Fixed Active Effect Container initialization & display

## 4.7.0

### Features

- Switched Typescript to v12 types
- Added AppV2 sheets for Actors & Items
- [#282] Added a Label to display when an Item Container is empty (Thanks to adorablecoin)
- Switched all dialogs to Appv2 (except deprecated modifier dialog)
- Allowed Rich Text Areas in User Input Templates
- [#473] Active effects suggested in Active Effect Containers are now filtered by the tag filter of the Container

## 4.6.7

### Fixes

- [#476] Fixed issue with Active Effect not applying when the final result is 0

## 4.6.6

### Fixes

- [#469] Fix sheetroll sending Label Roll message to chat even if checkbox is unchecked in Label configuration
- [#471] Fix Active Effect Displayer not displaying any effect if no tag is set in the filter

## 4.6.5

### Fixes

- Fixed active effect values using reference
- Fixed Active Effect Displayer losing tags field when an error occured on saving
- [#465] Fixed Active Effect computation when a property is not yet computed in the effect
- [#461] Replaced text inputs by textareas to allow resizing in Active Effect Config
- [#464] Improved Active Effect Displayer Description column 1 sentence mode by keeping only the first bullet in case the description is a list
- [#467] Fixed template active effect reloading - Now deleting active effects from the old template

## 4.6.4

### Fixes

- [#459] Fixed Active Effect upgrade & downgrade modes handling
- [#460] Fixed Convenient Effects Nested & Sub Effects handling with status effects

## 4.6.3

### Fixes

- [#457] Fixed Active Effect side-effect when coming from an Item
- Optimized computation by not computing disabled Active Effect keys unless needed
- Fixed Active Effect application when using a key not present in props

## 4.6.2

### Fixes

- Fixed active effect creation not setting the correct flags

## 4.6.1

### Fixes

- Added missing russian translations

## 4.6.0

### Features

- Added filter system for Active Effect Displayers, based on tags set on Active Effects
- Added special status effects configuration
- Added documentation on the tagging system and special status effects configuration
- Added readonly option to the count column of Active Effect Displayers

### Fixes

- Made Convenient Effects passive by default
- Fixed modifier conversion to include tags by default and disable active effects according to active modifier groups
- Fixed global template reloading to not crash when token references a deleted actor
- Fixed active effect toggling in User Input Template
- [#455] Fixed active effect handling for other modules
- Fixed an issue with ActiveEffect creation triggering an error message on other players screens
- Fixed an issue with transferred ActiveEffect trying to be computed wrongly

## 4.5.1

### Fixes

- Fixed Active Effect computation order
- Fixed Active Effect application when key formula targets multiple fields (using lookupRef or array function)
- Fixed Active Effect key computation not using the right trigger entity
- Added Modifiers to Active Effects conversion
- Added missing RU translations

## 4.5.0

### Potential issues

- Field calculations are now cast into the most fitting type. This means strings 'true' and 'false' are now cast into the corresponding boolean, and numeric string are now cast to numbers. This can potentially break some Formulas which do the casting manually.

### Deprecations

- Deprecated Item modifiers and Status Effect modifiers, to be removed in CSB 6.0.0 - Foundry 14

### Potential issues

- Field calculations are now cast into the most fitting type. This means strings 'true' and 'false' are now cast into the corresponding boolean, and numeric string are now cast to numbers. This can potentially break some Formulas which do the casting manually.

### Deprecations

- Deprecated Item modifiers and Status Effect modifiers, to be removed in CSB 6.0.0 - Foundry 14

### Features

- Added possibility to use formulas in the classes-field of every Component (conditional formatting)
- Added `img`, `uuid` and `id` to the standard-properties of every entity
- Added variable `this` for self-references
- Added russian translation (thanks to Друманин Дрин (Drumanin Drin))
- [#446] Added indentation and removed Template History for Template Exports
- Added progress bar for Template reloads
- Added more Template reload options (e.g. Tokens in Scenes)
- Added a checkbox to activate / deactivate Active Effects from a Character Sheet
- Added Custom Active Effects feature :
  - Added buttons on active effects to manage a predefined list of Active Effects
  - Added a Dropdown in the Active Effect Container to optionally select a predefined Active Effect to add
  - Added full integration of now-recommended module [DFreds Convenient Effects](https://foundryvtt.com/packages/dfreds-convenient-effects)
  - Added full integration of now-recommended module [Status Counter](https://foundryvtt.com/packages/statuscounter)
  - Items can now be modified by an Active Effect
  - [DEPRECATION] Deprecated Item modifiers and Status Effect modifiers, to be removed in CSB 6.0.0 - Foundry 14
  - Added Active, Origin and Description columns to Active Effect Container
  - Added Status Effect Customization
- Added button to open Documentation in Settings Tab

### Fixes

- Fixed an issue with sub templates and user input template not saving correctly
- Changed requirements for module `Chat Commander`, making it optional
- [#439] Fixed Rich Text Area left alignment
- [#448] Fixed Number Field wrongly triggering relative modification when its value is a negative number
- Fixed an issue with Item Displayer auto-sorting not using column keys to sort items. Both column key and item key work when Auto-sorting

## 4.4.2

### Fixes

- [#430] Fixed an issue with the preCreateChatMessage hook
- Fixed add multiple rows dialog to autofocus the row count field and validate on enter key
- Fixed field refocus on update to focus item correctly and not refocus parent actor
- [#431] Fixed roll parsing for dice pools display
- [#404] Reworked delay entity saving to make it manual

## 4.4.1

### Fixes

- Fixed system.json referencing an obsolete script

## 4.4.0

### Features

- Added possibility to add multiple rows at once in a Dynamic Table
- [#138] Added possibility to set a custom width for input fields
- [#207] Added an option to directly display all rolled dice from a roll in the chat message card

### Fixes

- Fixed an issue when dragging an item from a sheet to the items directory
- [#427] Fixed an issue on Mac preventing component duplication on drag & drop
- [#429] Fixed an issue preventing players to add items to their items

## 4.3.2

### Fixes

- [#424] Fixed issue with item duplication

## 4.3.1

### Fixes

- Fixed issue preventing creation of an item inside an item in an actor

## 4.3.0

### Features

- Added ability to add items to other items
- Added function `fetchFromParent()`, which will replace `fetchFromActor('attached', ...)`
- Added new functions `alookup()`, `lookupRange()`, `fallback()`, `fetchFromUuid()`, `setValues()`, `array()`
- Reworked the function `concat()`
- Added the possibility to have multiple keys inside 1 modifier (separated by comma)
- Adjusted `lookupRef()` to return an Array instead of a single value due to the change above
- Adjusted parameter `propertyName` in `setPropertyInEntity()` to also accept an Array due to the change above
- Switched all Rich Text Editors to ProseMirror

### Fixes

- consoleLog() and consoleTable() now actually let values pass through as they should instead of returning `undefined`
- Fixed an issue, where user-defined properties could collide with Token-properties
- [#409] Fixed a bug, where Template IDs wouldn't be exported
- Fixed a bug, where local variables in Label Roll Messages wouldn't be considered when calling user input dialogs
- [#379] Fixed a bug causing undefined values in Item Displayers to be populated with the values of previous items
- [#418] Fixed Dynamic Tables & Item Container sorting system
- [#397] Fixed Dynamic Tables default value handling, correctly computing default values & formulas in default values
- [#417] Fixed an issue with text editors opening too small
- Fixed an issue, where names of Active Effect wouldn't be displayed in ActiveEffectModifiers when using a custom configuration

## 4.2.0

### Features

- Added new Component `ActiveEffectContainer`
- Added function `find()`, which does the same as `first(lookup(...))`
- Added more Icons in component config for easier indication (e.g. if a field allows formulas)
- Added Effect Change Data-handling of Active Effects

### Fixes

- Fixed a bug, where 'See hidden attributes' was missing in Items
- Fixed deprecation warnings
- Fixed Label message style to In Character
- Fixed Item Displayer computation system to compute name and id even if no other column is present
- Fixed performance issue in function importation

## 4.1.1

### Fixes

- Fixed package builder

## 4.1.0

### Technical Features

- Added mandatory `getTechnicalName` method for Component classes. This will output a warning in the console until Foundry v13 compatibility version.
- Allowed Component Registration to only take one argument : the Component Class

### Features

- Added the ability to drag and drop rolls to the Macro Hotbar
- Added translation support
- Added french translation
- Added german translation

### Fixes

- Fixed Dynamic Tables wrongly allowing any type of component as a column - Restrictions are back in place
- Fixed Tabbed Panels not accepting dropped component
- Fixed Macro rolls from ItemContainer

## 4.0.1

### Fixes

- Fixed Dice so Nice! integration
- Fixed `setPropertyInEntity()` for unlinked Actors

## 4.0.0

### Technical Features

- Refactored CSB-specific functions in Formula.js to FormulaFunctionImporter.ts

### Features

- **BREAKING** - V12 compatibility - System is no longer compatible with v11
- **BREAKING** - V12 compatibility - Grid settings have been removed in favor of core Foundry's settings
- **BREAKING** - Removed deprecated fetchFromDynamicTable and getRefFromDynamicTable functions
- Added `TemplateSystem#throwUncomputableError()` to force recomputation when encountering undefined properties in the current computation cycle

## 3.2.5

### Fixes

- Fixed issue with 3.2.4 migration on old Dynamic Tables

## 3.2.4

### Fixes

- Fixed an issue where Item Container were not referencable anymore
- Fixed dynamic table's internal properties adressing
- Fixed issue with lookup erroring when no data was found
- Fixed issue with Label prefix & suffix causing sheet to not render when Formula errors

## 3.2.3

### Fixes

- Fixed an issue with Dynamic Tables when deleting rows
- Fixed issues with 3.2.2 migration not being complete

## 3.2.2

### Fixes

- [#370] Fixed an issue causing lookup to return an empty array when values should be found in keyed Labels
- Fixed an issue causing Item Containers to retain values of deleted Items
- Fixed a performance issue with sheet computations
- Fixed an issue with updates when using fetchFromActor function after setPropertyInEntity
- Fixed API-links in Readme
- Fixed Active Effect config
- Removed 'customProps' from ComputablePhraseOptions

## 3.2.1

### Fixes

- Fixed issue preventing template modifiers edition

## 3.2.0

### Features

- Added button to open the assigned template sheet on a character or item
- Added display of template modifiers in item modifier dialog
- Added display of hidden attributes and attribute bars in actors
- Reworked Meter rendering to allow for value display

### Fixes

- Fixed an issue with Label chat functions
- Fixed an issue with components nested too deep into sheets
- [#361] Fixed issue with rich text editors closing on error in component dialogs
- Fixed an issue with number Field which would not save the value 0 when empty

## 3.1.3

### Fixes

- [#364] Fixed error with lookup function when Table key does not have values
- Fixed error with ConditionalModifierList computing on Templates
- Fixed error on component edition falsely believing being in an extensible table
- Fixed issue with Modifier keys computing in User Input Templates + Local vars editing objects
- [#366] Fixed issue with Predefined Lines sorting & Undo / Redo handling
- [#288] Fixed reference displaying in in-sheet rich text editors

## 3.1.2

### Fixes

- Added item filter migration
- Fixed item container display when bold head and empty column name
- [#336] Fixed arguments for calls to getConfigForm
- Fixed issue with Dropdowns in templates

## 3.1.1

### Fixes

- [#363], [#356] Fixed issue with duplicated keys in templates causing actors not to open
- Fixed issue with lookup computation
- Fixed issue with Dynamic Tables and Item Containers autosorting

## 3.1.0

### Technical Features

- Switched codebase to TypeScript
- Switched formula computation to component's code
- Switched chat message generation to component's code

### Features

- [#280] Labels executing formulas without chat message
- [#228] Added Filtering & Sorting for Item Containers & Dynamic Tables
- Added `sameRowIndex()`
- Added `localVars` & `options` to Script-Expressions
- Added `lookup` and `lookupRef` functions replacing `fetchFromDynamicTable` and `getRefFromDynamicTable`
- [#180] Made Item Containers referençable by the `lookup` and `lookupRef` functions, and the `sameRow` and `sameRowRef` inside Item Containers columns
- Added autocompletion in Text Fields
- Added `range` option to Number Field display
- [#232] Added Collapsible Panels
- [#300] Added Meter element
- Added option in Settings to set minimum Role for Item Modifier Config
- Added option in Settings to set minimum Role for Reloading a Sheet
- Added version switch helper
- Added ability to drag an item from a sheet using all the item button
- Added `escapeQuotes` function

### Fixes

- Fixed a bug where tooltip-formulas would not work when using references (Item / Dynamic Table)
- Fixed a bug where visibility-formulas would not work when using references (Item / Dynamic Table)
- Fixed a bug where dropdown-formulas would not work when using references (Item / Dynamic Table)
- Fixed a bug where visibility-formulas would override role & permission-settings
- Delete-operations in Dynamic Tables now delete rows instead of setting a delete-flag (excluding predefined lines)
- Item Modifiers now have a bigger input-field for keys
- Disabled preselected Item Templates when creating an Item Container
- Fixed a bug where initial Checkbox value wouldn't be set correctly
- Fixed computation of hidden Dynamic Tables when there were changes in the predefined lines
- [#342] Fixed a bug where initial Radio Button Group value wouldn't be set correctly
- [#214] Fixed a bug where Template Filters in Item Containers wouldn't be imported correctly
- [#328] Reworked Filtering for Item Containers (now uses Formulas)
- [#346] Values of Attribute Bars are now Numbers instead of Strings (with numbers)
- [#347] Fixed a bug where sameRow() would always return 0 on empty strings despite having a default-value
- Fixed a bug where deleted Items wouldn't be removed until re-rendering
- Fixed a bug where multiple executions of `setPropertyInEntity()` would cause issues with updates
- [#350] Fixed a bug where updating a Character while an Observer has its sheet opened would cause an error
- Fixed Label computation when Label has more than 10 Formulas
- Fixed issue causing component movement in template to add `_copy` suffix
- Fixed issue with text containing quotes (`'`) in Formulas
- [#208] Fixed issue with unique items preventing adding a duplicated item to the same actor
- Fixed an issue where container duplication caused key duplication in its contents

## 3.0.0

### Features

- **BREAKING** - V11 compatibility - System is no longer compatible with v10
- **BREAKING** - Deprecated formula syntax has been removed
- Added function 'notify()'
- Added formula-support for tooltips
- Added option to use formulas as options in dropdown-lists
- [#211] allow usage of [dice tags] in roll formula
- [#313] Added comparison with match in fetchFromDynamicTable
- [#314] Added option to hide empty ItemContainer
- Added an option to display Item status in Item Containers for GM
- Added the option to disable template filtering in Item Containers
- Added customSystemBuilderInit hook fired after initialization of CSB

### Fixes

- Fixed formula computing when using conditional modifier list in user input template
- Fixed issue with undeletable predefined lines transferring their status to other lines on line movement
- [#319] Fixed issue with modifiers when final computed value should be 0

## 2.4.4

### Fixes

- Fixed slow world loading times

## 2.4.3

### Fixes

- Fixed issue with delayed saving functionality on items

## 2.4.2

### Fixes

- Fixed formula computation inside other formulas
- [#306] Fixed active effect computation
- Fixed issue in Formulas after using fetchFromActor
- [#308] Fixed issue causing button labels to be triggered when typing Enter
- Fixed issue with large sheet saving lags on bulk edition
- Fixed issue adding non assignable templates in item template choices

## 2.4.1

### Fixes

- Fixed speaker on Label rolls
- Fixed Dynamic Table roll issue on deletion
- Added 'linkedEntity' to script-execution as context
- [#302] Fixed some dialogs width

## 2.4.0

### Features

- Added checked by default option to checkboxes
- Added control style option to number fields
- [#155] Added Conditional Modifiers
- Added 'entity' to script-execution as context
- Added Dynamic Table functions to User Input Templates triggered from a Dynamic Table
- Added Formulas to field default values
- Added Formulas to radio buttons values
- Added ability to prevent players from adding rows in Dynamic Tables
- Added ability to prevent players from deleting predefined rows in Dynamic Tables

### Fixes

- Fix NumberField hidden on uneditable, non-template actors
- [#292] Fixed an issue with keyed-labels in user input templates
- Fixed an issue preventing the creation of a component with the same key as a Dynamic Table column or Item Container label
- [#274] Fixed Item image display

## 2.3.1

### Fixes

- Fixed issue with active effects not computing correctly
- Fixed issue with dice so nice integration and chat messages display
- [#275] Fixed issue with legacy templates not displaying correctly in new actors & items
- Fixed issue when using Numbers inside setPropertyInEntity function

## 2.3.0

### Features

- Added consoleLog and consoleTable functions
- Added undo / redo buttons
- Added new function: switchCase()
- Added 'fetchFromActor()' ('getPropertyDataFromActor()' is now deprecated)
- Added option to use formulas for keys in item modifiers
- [#200] Added item template modifiers
- [#126] Added ability to edit properties from Formulas
- [#153] Added ability to apply modifiers to Dynamic Table Fields
- [#166] Added predefined lines to Dynamic Tables
- Updated chat commands library verified version
- [#215] Added delete warning on component deletion
- [#205] Added possibility to retrieve the name of Actors and Items with the key 'name'
- [#233], [#242], [#251] Added possibility to include custom JavaScript
- [#271] Added ability to reference actor's dynamic table in an item's dropdown list
- [#170] Added more options to user inputs
- Added item image display in item containers in place of the briefcase icon
- [#262] Added Radio Button components
- Added button style for Labels
- Added save on close for Rich Text Dialogs
- [#246] Added User Input Templates
- Added v11 compatibility

### Fixes

- [#245] Fixed issue where fetchFromActor wouldn´t work in item modifiers
- [#236] Fixed tabs error when pre-selected or first tab visibility is false
- [#245] Fixed tabs error when pre-selected or first tab permission is not enough
- [#264] Fixed import of Item Templates
- [#201] Fixed dynamic table function usage in Number fields min & max values
- [#209] Fixed Dice Pool display exploding in chat message explanation
- [#270] Fixed issue with Table causing error when trying to add a component in a row after an empty row
- [#216] Fixed issues with default values not added to character from the initial reload
- Fixed issues with Right click on Labels
- Fixed issues with chat message visibility
- Fixed issues with actor & item data handling

## 2.2.7

### Fixes

- Fixed issues with item sub-template edition

## 2.2.6

### Fixes

- Fixed issues with item edition

## 2.2.5

### Fixes

- Fixed issues with drag & drop on tabs
- Fixed issue which prevented reloading template if template was closed
- Fixed issue which prevented tab edition
- Fixed minor HTML generation issues
- Added basic automated tests

## 2.2.4

### Fixes

- Fixed issue which prevented saving components with no key

## 2.2.3

### Fixes

- Fixed issue which prevented saving components in Dynamic Tables & Item Containers
- Fixed issue which modified keys on drag&drop
- Fixed issue which would close component edition window without saving and without any displayed error

## 2.2.2

### Fixes

- Fixed issue which prevented saving components efficiently

## 2.2.1

### Fixes

- [#229] Fixed drag & drop issues
- [#223] Fixed tab window edit title
- Fixed tab deletion issue

## 2.2.0

### Features

- [#82] Added Drag&Drop on components to allow movement everywhere
- [#118] Added possibility to get values of other actors in formulas
- [#152] Hide elements & tabs with a formula condition
- Added optional parameter 'comparisonOperator' in 'fetchFromDynamicTable()'

### Fixes

- [#182] Fixed README links with a repo path change
- [#184] Fixed issue with dialog based Rich Text Area saving in dynamic tables
- [#186] Fixed issue with rolls inside RTA when posted to chat
- Fixed issue with macros called from Roll Message after upgrading Advanced Macros to 1.17+
- Fixed issue preventing import of external actors used as decoration

## 2.1.0

### Features

- Rework attribute bars for full support of Core and Bar Brawl bars
- Added support for text values for ItemModifier 'set'
- Added option for ItemModifier 'set' to not set a value if formula result is ''
- Added new functions: 'replace()', 'replaceAll()' and 'recalculate()'

### Fixes

<!-- markdownlint-disable MD033 -->

- [#168] Fixed issue with map distance measuring
- [#164] Fixed issue causing error message to be displayed on actor and item creation
- [#169] Fixed error in console on item reference click
- [#161] Fixed error on item formula computing
- [#171] Fixed error with @{<actor>|<propertyKey>} in chat messages
- [#177] Fixed error log on chat messages containing only numbers
- [#173] Fixed issue with '$' value in formulas

<!-- markdownlint-enable MD033 -->

## 2.0.1

### Fixes

- Fixed issue with unique items being able to be added to an actor multiple times
- Fixed issue with items lacking some properties
- Added mathjs blacklist to check field keys

## 2.0.0

### Features

- **BREAKING** - V10 compatibility - System is no longer compatible with v9

### Fixes

- Fixed issue with Formula functions not returning booleans when asked a boolean value

## 1.7.3

### Fixes

- Fixed Formula referencing issues with other Computed Labels referencing
- Fixed token data recovering

## 1.7.2

### Fixes

- Fixed user input computation when no default value is entered

## 1.7.1

### Fixes

- Fixed fetchFromDynamicTable to be used with an empty filter
- Fixed Formula handling to allow macro calling from roll
- Fixed Panel display when adding grid panels inside other grid panels

## 1.7.0

### Features

- Reworked formula syntax to use functions, which are more flexible than previous syntax
- Added possibility to use custom formula in Roll Table draws
- Fixed permission level to edit Item Modifiers
- Added option to prevent sheet resizing

### Fixes

- Fixed unnecessary HTML encoding

## 1.6.2

### Fixes

- Fixed 's' present at the bottom of Number Field edit dialog
- Fixed Label display for rollMessage to respect Label style
- Fixed Table alignment display for Labels

## 1.6.1

### Fixes

- Fixed Label icon display (again)
- Fixed Label display in Dynamic Tables when label value is empty
- Fixed issue with Tables being unable to receive any new component

## 1.6.0

### Features

- Added permission system at component level
- Added unique item option
- Added capability to use a dynamic table to populate dropdown list choices
- Added tooltips to components
- Added prefixes and suffixes to labels : text added before or after the label but not kept in props computation
- Add custom label for item container 'Name' column

### Fixes

- Fixed Custom CSS setting hint
- Fixed Label display
- Removed useless 'Grid of 1 column' option from Panel layouts
- Fixed Table error when other container is changed to Table
- Added a check to prevent addition of multiple fields with the same key to a template
- Fixed context menu to only appear for labels with keys
- Fixed issue with Item Containers not working in items

## 1.5.3

### Fixes

- Fixed Label display (yet again)
- Fixed props handling when prop is deleted and recreated
- Fixed Item Container roll properties

## 1.5.2

### Fixes

- Fixed labels display
- Fixed bug with Item container in compact mode when delete button should be shown and no additional column exists
- Added item name to its properties
- Fixed roll explanations for items

## 1.5.1

### Fixes

- Fixed issue with Rich Text Area display

## 1.5.0

### Features

- Added item support !
  - Added equippable items which can be added to actor sheets with property modifiers
  - Added sub templates items which can be used to define reusable template parts
- Added item container element
- Added option to avoid accidental row removal in dynamic tables
- Added alternative roll option with + SHIFT Key
- Changed custom CSS selector to be a FilePicker
- Added full support of documents on Rich text editors
- Reworked export popup to sort templates by folders

### Fixes

- Fixed missing key and additional css classes in Tabbed Panels
- Fixed profile picture aspect ratio display
- Fixed issue when tabbed panels contained another tabbed panel
- Fixed issue creating ghost attribute bars in attribute bar editor
- Fixed lost focus on field update issue
- Fixed issue on Numeric field's minus button trigger on enter press
- Fixed issue with inputs without labels on firefox
- Fixed issue with Rich Text Area display on firefox

## 1.4.0

### Features

- Select first input from start on user input on rolls
- Reset template display size on template reloading
- Added attribute bar edition on token
- Added Tabbed Panel component, allowing users to create their own tabbed panels in the sheet
  - This induced a rework of the basic sheet layout, which is now a simple Panel in which users can add a Tabbed Panel as a root element if they want a standard sheet layout.
  - This removed the display option to display Header below the profile picture. This display can now be obtained by adding components before a Tabbed Panel in the body.
  - Existing sheets will be automatically migrated to this new layout, creating a Tabbed Panel and copying existing tabs to the sheet.
- Added diagonal movement configuration

### Fixes

- Fixed minimum Number Field size for inner display of + and - buttons
- Fixed actor data formula computation
- Fixed attribute bar dialog display
- Fixed chat message formatting in case result is used as parameter in a macro
- Fixed issue in dynamic table referencing with non ASCII characters
- Fixed numeric field buttons to allow for multiple clicks before sheet reloading

### Other

- Added a sheet library to the Gitlab repository, for people to share their templates

## 1.3.0

### Features

- Added RollTable support
- Added foundry permission system support
- Added button to reload all characters linked to a template
- Added more size options for fields
- Added + and - controls on Number Fields

### Fixes

- Fixed issues with template reloading
- Fixed issues with Number Fields missing values
- Fixed issue with Complex attributes bar deleting
- Fixed issue with Rich Text Area display

## 1.2.0

### Features

- Added attributes bar handling
- Added formula handling on Number fields min & max

### Fixes

- Fixed display of some core components
- Fixed issue with Table edition
- Fixed chat commands dependency lib version

## 1.1.2

### Fixes

- Fixed component creation in tables

## 1.1.1

### Fixes

- Fixed roll icon display
- Fixed dialog minimization / maximization issue
- Fixed bug in rolls when no token is on the scene
- Fixed bug in header components edition
- Fixed character creation error
- Removed 0.0.9 Breaking change warning

## 1.1.0

### Features

- Added roll from macro & chat message
- Added property referencing from chat message
- Added default value handling in user inputs
- Added sheet display settings on templates
- Added number fields

### Technical

- Added component extension capabilities
- Refactored component rendering to ES6 classes
- Migrated number-formatted text fields to Number fields

## 1.0.1

- Fixed table alignment display
- Fixed roll icons display
- Fixed component bugs by enforcing use of keys on data-saving components
- Fixed component editor field display bugs
- Fixed component editor bugs by disallowing multiple component editor windows to be openeded

## 1.0.0

- Changed system name to Custom System Builder !

## 0.0.9

- **BREAKING** - Added ability to reference the value of a field in formula outside dynamic tables
  - This feature changed dynamic table referencing system, it now uses a `$` instead of the `@`
- Added more formula explanations on chat messages
- Added context-menu action to reload sheet template
- Disabled sheet reloading for non GM players
- Fixed tab edition bug when tab key was an integer

## 0.0.8

- Fixed an issue with empty string handling in formulas
- Fixed an issue with chat messages without rolls

## 0.0.7

- Added compatibility with the Dice so Nice module
- Fixed issue with actor data calculation leading to errors in sheet display
- Fixed issue with formula calculations and string handling in formulas

## 0.0.6

- Added initiative formula setting
- Added basic text-field formats
- Added user inputs for formulas
- Added field sizing on sheets
- Fixed core version compatibility
- Fixed label HTML display
- Fixed dynamic tables aggregation functions handling
- Fixed minor error with math.js library

## 0.0.5

- Fixed bug on hidden properties calculation
- Fixed rendering of rich text elements in chat messages
- Added possibility to add an icon in front of labels
- Added aggregation capabilities on dynamic table values

## 0.0.4

- Added hidden properties, used for intermediate calculations only
- Added better explanation of rolls & formulas
- Added option to display icon next to rollable labels
- Added CSS class customization on components
- Added edit button float on dialog editors RTF
- Added option to set first line of array 'head'
- Code cleanup - Separate character and \_template sheet codes

## 0.0.3

- Fixed naming errors

## 0.0.2

- Corrected typo in repo name
- Updated README.md & TODO.md

## 0.0.1

- System init
