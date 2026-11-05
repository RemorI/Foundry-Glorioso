# sameRow

Returns the value of the column with the key `columnName` in the current row in a Dynamic Table.

## Signature

```ts
function sameRow(columnName: string, fallbackValue: Primitive): Primitive;
```

## Arguments

- `columnName: string`: The key of the column to target.
- `fallbackValue?: Primitive`: The value to return if the column is not found or does not contain data.

## Return

The value of the column with the key `columnName` in the current row in a Dynamic Table, or `fallbackValue` if the column does not exist or does not contain data.

## Examples

Suppose you have the following Dynamic Table, whose key is `skills` :

| Name (key `name`) | Base (key `base_value`) | Bonus (key `bonus_value`) |
| ----------------- | ----------------------- | ------------------------- |
| Craft             | 5                       | 3                         |
| Lock-pick         | 2                       | 4                         |
| Hide              | 7                       | 2                         |
| Craft             | 7                       | 3                         |

If your skill level is the `base_value` + the `bonus_value`, you can automate this calculation by using `sameRow('base_value', 0) + sameRow('bonus_value', 0)`. These functions will get the value of respectively `base_value` and `bonus_value` in the same row as the Formula being computed, or `0` if the value is undefined. This would get you the following Dynamic Table.

| Name (key `name`) | Base (key `base_value`) | Bonus (key `bonus_value`) | Level (key `skill_level`)                                          |
| ----------------- | ----------------------- | ------------------------- | ------------------------------------------------------------------ |
| Craft             | 5                       | 3                         | `${sameRow('base_value', 0) + sameRow('bonus_value', 0)}$` => `8`  |
| Lock-pick         | 2                       |                           | `${sameRow('base_value', 0) + sameRow('bonus_value', 0)}$` => `2`  |
| Hide              |                         | 5                         | `${sameRow('base_value', 0) + sameRow('bonus_value', 0)}$` => `5`  |
| Craft             | 7                       | 3                         | `${sameRow('base_value', 0) + sameRow('bonus_value', 0)}$` => `10` |
