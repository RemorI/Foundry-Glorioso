# setPropertyInEntity

Set a value in an entity

## Signature

```ts
function setPropertyInEntity(
  entityName: string,
  propertyName: string | string[],
  formula: string,
  fallbackValue?: Primitive
): Primitive;
```

## Arguments

- `entityName: string`: The name of an actor to reference. It can also contain special values like:
  - `self`: Sets into the current actor (can be used in labels and initiative formula)
  - `selected`: Sets into the actor-data of the currently selected token
  - `target`: Sets into the actor-data of the currently targeted token
  - `attached` (Item only): Sets into the actor-data an Item is attached to
  - `item` (Inside Item Displayers only): Sets into the item-data of the current row of the Item Displayer. Items cannot be referenced by their name.
- `propertyName: string`: The name of the property (or properties) to set. Is either a string or an Array of strings. This must be either a Component key or a data-path from `lookupRef()` or `sameRowRef()`.
- `formula: string`: The formula which should be calculated on the referenced actor or item. It can also just be a key. Inside Item Displayers, item properties should be targeted with the `item.` prefix, just like in other parts of the formulas. If you need to use the properties of the target-actor, you can achieve that by using the `target.`-prefix. **&#x26a0;&#xfe0f;Only these 2 prefixes exist (there's no `attached.`-prefix)!**
- `fallbackValue?: Primitive`: The value to return if the formula returns no value.

## Return

The result of the formula.

## Examples

- Set value of key `HP` to 20 in the current actor: `setPropertyInEntity('self', 'HP', 20)`
- Double value of key `Defense` in the current target: `setPropertyInEntity('target', 'Defense', "target.Defense * 2")`
- Decrease the value of the key `Health` (target) by the value of the key `Damage` (self) in the current target: `setPropertyInEntity('target', 'Health', "target.Health - Damage")`
- Set value of key `Strength` to 5 from the actor `John`: `setPropertyInEntity('John', 'Strength', 5)`
- Decrease the ammunition total by one in the current item in an Item Container : `setPropertyInEntity('item', 'Ammunition', "item.Ammunition - 1")`
- Set value of key `Current_Armor_Value` to the Plate Armor value: `setPropertyInEntity('self', 'Current_Armor_Value', "lookup('Armors', 'Armor_Value', 'Armor_Name', 'Plate Armor')")`
- Decrease value of the field `Uses_left` in the `Spells` Dynamic Table for the spell named `Fireball` : `setPropertyInEntity('self', lookupRef('Spells', 'Uses_left', 'Name', 'Fireball'), "min(first(lookup('Spells', 'Uses_left', 'Name', Fireball')) - 1, 0)")`
- Reset value of the field `Charges` row of a Dynamic Table : `setPropertyInEntity('self', sameRowRef('Charges'), "sameRow('MaxCharges')")`
- Reset all base values within a Dynamic Table column to 0: `setPropertyInEntity('self', lookupRef('Skills', 'Base'), 0)`
