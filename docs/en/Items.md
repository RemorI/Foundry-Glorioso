# Items

Okay, we now know how to build a basic character sheet, and how to enhance it with automatic calculations and generated chat messages. Let's dig more and enter the wonderful world of Items!

An Item in FoundryVTT represents everything that is not a character for which you want to have a sheet. It can be actual items like weaponry or armours, or more abstract concepts like species, classes or spells. Item can be attributed to actors or other items by dragging and dropping them onto other sheets. Caution: This attribution process creates a clone of said item, so any changes to an item's value won't be reported on attributed versions of the item, and vice versa.

## Equippable items

To create items, you need to create a `_equippableItemTemplate` for the item. This works just like the [actor's template creation](./Getting-started#2-creating-your-first-sheet), so I won't be detailing it any further.

Once the template is created, you can create an `equippableItem` and select its template just like you do for actors. The sheet renders, and you can fill the fields in.

On each `equippableItem` sheet, you will find a `Make item unique` checkbox. Checking it will prevent anyone from adding multiple instances of the same item to an actor sheet.

### Item modifiers

> &#x26a0;&#xfe0f; **Starting from version 4.5.0, Item and Status Effect modifiers are deprecated in favor of [Active Effects](./Guides/Active-Effects), and will be removed in 6.0.0 and compatibility with Foundry 14.**

On the `equippableItem` sheet, you can find a `Configure item modifiers` button. This button opens a window allowing you to create modifiers which will be applied to any actor this item is assigned to.

When creating a modifier, you must enter 6 configuration data :

1. **ConditionalGroup**: If specified, it will convert a modifier to a conditional modifier. Conditional modifiers will only be applied, if they are selected in a [Conditional Modifier List](./Component-Library/Conditional-Modifier-List). Modifiers can contain the same group. If a group gets selected, all modifiers from this group will be applied to the actor.
2. **Priority** : This indicates the order in which the modifiers will be applied, should multiple modifiers affect the same property. Lower values will be applied first. If multiple modifiers have the same priority, they are ordered by their operator : set are applied first, then multiplications, then divisions, then addition and finally subtraction. If multiple modifiers share the same priority and operation, their order is irrelevant as the mathematical result will be the same.
3. **Key** : This is the key of the property to modify in the owner actor. **This must be the key of a number containing Label (except for Set-operations).** Modifiers don't work on input-field-components like `number field` or `text field`. It can contain formulas, which will be calculated from the item´s data. To update a field in a Dynamic Table, you need to use a combination of Formula functions like this: `${fetchFromActor('attached', "lookupRef('<DYNAMIC TABLE KEY>', '<TARGET COLUMN KEY>', '<FILTER COLUMN>', '<FILTER VALUE>')")}$`
4. **Operator** : This indicates which operation the modifier should do : Addition (`+`), Subtraction (`-`), Multiplication (`x`), Division (`/`) or Set (`=`). The Set-operation sets the field to the modifier value with no other operation.
5. **Formula** : This is the value of the modifier. This can contain formulas, which will be calculated from the item´s data. This must be a **number** in the end for the computation to work. Text values can only be used with the Set-operation. There is also the possibility to not set a value if the formula result is '' (empty string), meaning that '' (empty string) would leave the referenced key untouched.
6. **Description** (optional): This is the description of the modifier, which will be displayed in the info-icon of the [Conditional Modifier List](./Component-Library/Conditional-Modifier-List), if the modifier has a group. You should provide one if your modifier is conditional, otherwise you can leave it empty. It can contain [Formulas](./Guides/Formula-System).

### Item Template Modifiers

You can define modifiers on the `_equippableItemTemplate` as well. The only difference to `equippableItem`-modifiers is that these are applied to every Item created from this `_equippableItemTemplate`.

**For example:** If you want to sum up the `weight` of all the `Inventory`-Items an Actor has equipped, you´d define the modifier in the Item Template of `_Inventory` instead of on every `Inventory`-Item, because all your `Inventory`-Items would inherit the modifiers of the `_Inventory`-Template.

This leads to less modifier-redundancy and should be used wherever possible (weight/capacity from inventory, min-max-values from races, costs from buyable advantages, etc...).

## Other items types

There are some additional Item types used for various purposes in the system.

### Sub templates

This item type can be used to create reusable template parts that can be added to other templates. The creation of this item is the same as any other templates, except it has no header. It also can not be used to create a definitive item.

When created, it can be dragged and dropped on any other template (actor template, equippable item template and sub templates). When dragging on a sheet, a grey outline will show you where the template can be dropped. Once dropped, each component defined on the subtemplate will be copied to the final template as is.

> &#x26a0;&#xfe0f; **This creates a copy of the elements. Any further modification on the subtemplate will not replicate to the definitive template. You will need to drop it again on the sheet to re-copy the components.**

### User Input Templates

User Input Templates are used to ask for a player's input when triggering a Chat Message. [Its usage is detailed here.](Formulas/Chat-Messages#user-input-templates)
