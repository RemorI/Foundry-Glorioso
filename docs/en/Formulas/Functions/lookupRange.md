# lookupRange

This function is used for cases where you have to perform a lookup for a range of values (e.g. `0-2 => A, 3-5 => B, 6-10 => C`) instead of a lookup for exact matches like `find()` does.

## Signature

```ts
function lookupRange(
  extensibleTableKey: string,
  targetColumn: string,
  lookupColumn: string,
  value: number,
  opts: {
    orderBy: 'ASC' | 'DESC';
    isSorted: boolean;
    isInclusive: boolean;
  } = {
    orderBy: 'ASC',
    isSorted: false,
    isInclusive: true
  }
): Primitive;
```

## Arguments

- `extensibleTableKey: string`: The key to the Dynamic Table or Item Displayer to get the values from.
- `targetColumn: string`: The column key from which to get the value. In Item Displayers, the keys `id` and `name` refer respectively to the ID and the name of the item.
- `lookupColumn: string`: The column on which the range-lookup should be performed. **The data within this column must contain numbers!**
- `value: number`: The value to check against
- `opts: {...}`: Additional options
  - `orderBy: 'ASC' | 'DESC'`: The order of the data in your column. **Default: `'ASC'`**
  - `isSorted: boolean`: If the table is already sorted. If `false`, the data will be sorted in the order of `orderBy` right before the range-lookup. **Default: `false`**
  - `isInclusive: true`: Determines if the lookup should be performed inclusively or exclusively. **Default: `true`**

## Return

The value in `targetColumn` where the range-lookup points to.

## Examples

Suppose you have the following lookup table (DnD-Modifier-Table) (key: `modifier_table`):

| Score | Modifier |
| ----- | -------- |
| 1     | -5       |
| 2     | -4       |
| 4     | -3       |
| 6     | -2       |
| 8     | -1       |
| 10    | 0        |
| 12    | 1        |
| 14    | 2        |
| 16    | 3        |
| 18    | 4        |
| 20    | 5        |

- `lookupRange('modifier_table', 'Modifier', 'Score', Score)`: This will return the `Modifier` to a `Score`:
  - If `Score == 4` => `Modifier: -3`
  - If `Score == 12` => `Modifier: 1`
  - If `Score == 13` => `Modifier: 1`
- `lookupRange('modifier_table', 'Modifier', 'Score', Score, {orderBy: 'ASC', isSorted: true, isInclusive: true})`: Does the same as above, but is more verbose
- `lookupRange('modifier_table', 'Modifier', 'Score', Score, {isInclusive: false})`: This will perform a lookup with exclusive ranges, meaning that the predicate will be `Score > value` instead of `Score >= value`:
  - If `Score == 4` => `Modifier: -4`
  - If `Score == 12` => `Modifier: 0`
  - If `Score == 13` => `Modifier: 1`
