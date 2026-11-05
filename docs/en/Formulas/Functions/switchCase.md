# switchCase

Tests an expression against a list of cases and returns the corresponding value of the first matching case, with an optional default value if nothing else is met. The behaviour is identical to the `SWITCH()`-function in Excel or Google Sheets.

## Signature

```ts
function switchCase(expression: Primitive, ...caseArgs: Primitive[]): T;
```

## Arguments

- `expression: Primitive`: Any valid values.
- `...caseArgs: Primitive[]`: The case arguments to check the expression against. These arguments come in packs of 2 (`case` and `value`). At the end of the arguments, you can specify a `defaultValue`
  - `case1: Primitive`: The case to be checked against expression.
  - `value1: T`: The corresponding value to be returned if the previous case matches the expression.
  - `case2?: Primitive`: An additional case to be checked against expression.
  - `value2?: T`: The corresponding value to be returned if the previous case matches the expression.
  - ...
  - `defaultValue?: T`: An optional value, specified as the last parameter, to be returned if none of the cases match the expression.

## Return

The value matching the corresponding case. Otherwise, returns the default value.

## Examples

- `switchCase(DropdownKey, 'a', 1)` Returns `1` if DropdownKey is `a`. Otherwise, it returns null.
- `switchCase(DropdownKey, 'a', 1, 'b', 2, 'c', 3, 0)` Returns `1` for `a`, `2` for `b`, `3` for `c`. If none of the cases match, it returns `0` as default value.
