# find

This function is used to retrieve a single value from a Dynamic Table or an Item Displayer. The first value, which passes the filter, will be returned.

## Signature

```ts
function find(
  extensibleTableKey: string,
  targetColumn: string,
  filterColumn?: string,
  filterValue?: Primitive,
  comparisonOperator?: string
): Primitive;
```

## Arguments

- `extensibleTableKey: string`: The key to the Dynamic Table or Item Displayer to get the value from
- `targetColumn: string`: The column key from which to get the value. In Item Displayers, the keys `id` and `name` refer respectively to the ID and the name of the item.
- `filterColumn?: string`: An optional column key to filter. In Item Displayers, the keys `id` and `name` refer respectively to the ID and the name of the item.
- `filterValue?: Primitive`: The value to filter after. If not provided and a `filterColumn` is specified, nothing will be returned.
- `comparisonOperator: string`: Compares each `filterColumn` with the `filterValue` by this operator. Default comparison is `===`. You can use every comparisonOperator described in [Conditions](../../Formulas#conditions) together with `===`, `!==` and `~`. The `~` operator performs a RegExp matching with the filterValue.

## Return

The first value, where the `filterValue` matches (according to the `operator`) with the value in the `filterColumn`. The same result is returned with `first(lookup(...))`.
