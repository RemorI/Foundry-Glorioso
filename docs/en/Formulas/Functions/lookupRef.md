# lookupRef

This function is used to retrieve the **data-paths** of fields in a Dynamic Table or an Item Displayer.

## Signature

```ts
function lookupRef(
  extensibleTableKey: string,
  targetColumn: string,
  filterColumn?: string,
  filterValue?: Primitive
): string[];
```

## Arguments

- `extensibleTableKey: string`: The key to the Dynamic Table or Item Displayer to get the value from
- `targetColumn: string`: The column key from which to get the values. In Item Displayers, the keys `id` and `name` refer respectively to the ID and the name of the item.
- `filterColumn?: string`: The column key to filter the results. In Item Displayers, the keys `id` and `name` refer respectively to the ID and the name of the item.
- `filterValue?: Primitive`: The value to filter the results.

## Return

An Array of strings corresponding to the current data-paths of the fields in the system, usable for keys in Item Modifiers or in `setPropertyInEntity` if you combine it with `first()`.

## Examples

Suppose you have the following Dynamic Table, whose key is `equipment` :

| Name (key `name`) | Weight (key `weight`) | Location (key `location`) |
| ----------------- | --------------------- | ------------------------- |
| Sword             | 50                    | Backpack                  |
| Deck of cards     | 2                     | Pocket                    |
| Shield            | 30                    | Backpack                  |

`lookupRef('equipment', 'weight', ',name', 'Shield')`: Will return the **data path** to the weight property of the `Shield` row, which can be something like this: `['equipment.3.weight']`. Contrary to the `lookup()`-function, this will not return a value within the Extensible Table (like `30` from the column `weight`, which contains the name "Shield")
