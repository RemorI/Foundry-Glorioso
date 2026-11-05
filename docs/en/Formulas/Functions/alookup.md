# alookup

Returns an Array of values from an Extensible Table, filtered by multiple filters.

## Signature

```ts
function alookup(extensibleTableKey: string, targetColumn: string, ...filterArgs: Primitive[]): Primitive[];
```

## Arguments

- `extensibleTableKey: string`: The key to the Dynamic Table or Item Displayer to get the values from.
- `targetColumn: string`: The column key from which to get the values. In Item Displayers, the keys `id` and `name` refer respectively to the ID and the name of the item.
- `...filterArgs: Primitive[]`: Arguments, which handle the filtering of the rows. These filters are applied with an AND operator. **The amount of filter arguments must always be a multiple of 3 (0, 3, 6, 9, ...), because they are divided into packs of 3: `filterColumn: string`,
  `operator: string` and `filterValue: Primitive`.**
  - `filterColumn: string`: A column key to filter the results. In Item Displayers, the keys `id` and `name` refer respectively to the ID and the name of the item.
  - `operator: string`: Compares each `filterColumn` with the `filterValue` by this operator. You can use every comparison operator described in [Conditions](../../Formulas#conditions) together with `===`, `!==` and `~`. The `~` operator performs a RegExp matching with the filterValue.
  - `filterValue: Primitive`: The value to filter the results after.

## Return

An **Array** containing all the values within the `targetColumn`, which pass the `filterArgs`.

## Examples

Suppose you have the following Dynamic Table, whose key is `equipment`:

| Name (key `name`) | Weight (key `weight`) | Location (key `location`) | Equipped (key `equipped`) |
| ----------------- | --------------------- | ------------------------- | ------------------------- |
| Sword             | 50                    | Backpack                  | true                      |
| Deck of cards     | 2                     | Pocket                    | false                     |
| Shield            | 30                    | Backpack                  | false                     |
| Marble            | 0.1                   | Pocket                    | true                      |

- If we use `alookup('equipment', 'name')`, it would return `['Sword', 'Deck of cards', 'Shield']`
- If we use `alookup('equipment', 'name', 'location', '===', 'Backpack')`, it would return `['Sword', 'Shield']`
- If we use `alookup('equipment', 'name', 'location', '===', 'Backpack', 'equipped', '===', true)`, it would return
  `['Sword']`
