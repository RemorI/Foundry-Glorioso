# sameRowRef

Returns the **data-path** of the column with the key `columnName` in the current row in a Dynamic Table.

## Signature

```ts
function sameRowRef(columnName: string): string;
```

## Arguments

- `columnName: string`: The key of the column to target.

## Return

The **data-path** of the column with the key `columnName` in the current row in a Dynamic Table, usable for editing its value with `setPropertyInEntity` or modifiers.
