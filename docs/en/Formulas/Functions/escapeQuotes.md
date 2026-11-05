# escapeQuotes

Escapes simple quotes in a string value.

## Signature

```ts
function escapeQuotes(value: string): string;
```

## Arguments

- `value: string`: The value to escape.

## Return

The escaped value

## Examples

- `escapeQuotes("Test message")` outputs `Test message`.
- `escapeQuotes("Test message with ' a quote")` outputs `Test message with \' a quote`.
