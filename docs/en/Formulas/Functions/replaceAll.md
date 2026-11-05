# replaceAll

The `replaceAll()` function replaces all occurrences of the pattern in the text with the replacement.

## Signature

```ts
function replaceAll(text: string, pattern: string, replacement: string): string;
```

## Arguments

- `text: string`: The text you want to modify.
- `pattern: string`: The pattern which will be replaced.
- `replacement: string`: The replacement text, which will replace the pattern.

## Return

The new text with the replacement.

## Examples

- `replaceAll('My test test', 'test', 'dog')` Replaces all occurrences of 'test' with 'dog'. Output: `My dog dog`.
- `replaceAll(MyInputText, 'random', '')` With 'MyInputText' = `This is a random sentence. Very random!` => Returns: `This is a sentence. Very !`
