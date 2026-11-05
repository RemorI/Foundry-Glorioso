# first

Returns the first value of an Array.

## Signature

```ts
function first(list: T[], fallbackValue?: Primitive): T | Primitive;
```

## Arguments

- `list: T[]`: An Array containing elements of type T (usually a `Primitive`).
- `fallbackValue: Primitive`: This value will be returned if list is empty or null.

## Return

The first value of `list`, or `fallbackValue` if list is empty or `null`.

## Examples

With the `skills` Dynamic table defined in the previous part.

`first(lookup('skills', 'value', 'name', 'Craft'), 0)` : Will get the value of the first Craft skill if the skills Dynamic Table, or 0 if Craft is not in the table. Here, this will return `5`.

You will need to use `first()` to get values as Numbers, even if the Dynamic Table's filter returns only one row. The function `lookup()` returns an Array, which is not suited for most operations.
