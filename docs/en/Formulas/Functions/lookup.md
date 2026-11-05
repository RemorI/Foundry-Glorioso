# lookup

Search for a value in an Extensible Table with a simple filter

## Signature

```ts
function lookup(
  extensibleTableKey: string,
  targetColumn: string,
  filterColumn?: string,
  filterValue?: Primitive,
  comparisonOperator?: string
): Primitive[];
```

## Arguments

- `extensibleTableKey: string`: The key to the Dynamic Table or Item Displayer to get the values from.
- `targetColumn: string`: The column key from which to get the values. In Item Displayers, the keys `id` and `name` refer respectively to the ID and the name of the item.
- `filterColumn?: string`: An optional column key to filter the results. In Item Displayers, the keys `id` and `name` refer respectively to the ID and the name of the item.
- `filterValue?: Primitive`: The value to filter the results. If not provided, nothing will be returned.
- `comparisonOperator?: string`: Compares each `filterColumn` with the `filterValue` by this operator. Default comparison is `===`. You can use every comparison operator described in [Conditions](../../Formulas#conditions) together with `===`, `!==`and `~`. The `~` operator performs a RegExp matching with the filterValue.

## Return

An **Array** containing all the values within the `targetColumn`, which bypass the filter if provided. If no filter is provided, it will return an **Array of all values** within the `targetColumn`.

## Examples

Suppose you have the following Dynamic Table, whose key is `equipment`:

| Name (key `name`) | Weight (key `weight`) | Location (key `location`) |
| ----------------- | --------------------- | ------------------------- |
| Sword             | 50                    | Backpack                  |
| Deck of cards     | 2                     | Pocket                    |
| Shield            | 30                    | Backpack                  |

- Fetch all values

`lookup('equipment', 'weight')` : Will return an Array containing all the weights from the Dynamic Table equipment, here: `[50, 2, 30]`

- Fetch values with filter

With the same table, you can add a filter to get only the Backpack items.

`lookup('equipment', 'weight', 'location', 'Backpack')` : Will return an Array containing all the weights from the Dynamic Table equipment, where `location` is equal to `Backpack`, here: `[50, 30]`

- Fetch values with filter (and comparisonOperator)

With also the same table, you can filter by a specific weight threshold (here: at least 10).

`lookup('equipment', 'weight', 'weight', 10, '>=')` : Will return an Array containing all the weights from the Dynamic Table equipment, where `weight` is greater-equals than 10, here: `[50, 30]`

- Filter values with another field

Suppose you have the following Dynamic Table, whose key is `skills`:

| Name (key `name`) | Level (key `skill_level`) |
| ----------------- | ------------------------- |
| Craft             | 5                         |
| Lock-pick         | 2                         |
| Hide              | 7                         |
| Craft             | 7                         |

`lookup('skills', 'value', 'name', selectSkill)` : Will return an Array containing all the values from the Dynamic Table skills, for the rows which name is equal to the value of the field `selectSKill` (Notice `selectSkill` does not have quotes around it, meaning it is a field in the sheet).

If `selectSkill`'s value is 'Lock-pick', this will return `[2]`.

If `selectSkill`'s value is 'Craft', this will return `[5, 7]`.
