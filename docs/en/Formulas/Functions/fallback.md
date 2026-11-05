# fallback

Returns a fallback value in case `value` is `undefined` or `null`. Useful if you combine it with `find()`

## Signature

```ts
function fallback(value: T, fallback: Primitive): T | Primitive;
```

## Arguments

- `value: T`: Any value
- `fallback: Primitive`: A fallback in case `value` is either `undefined` or `null`

## Return

Either `value`, or `fallback` if `value` is `undefined` or `null`

## Examples

- `fallback(15, 0)`: Returns `15`
- `fallback('Strength', 'Strength')`: Returns `'Strength'`
- `fallback(undefined, 0)`: Returns `0`
