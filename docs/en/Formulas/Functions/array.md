# array

Create an array of values

## Signature

```ts
function array(values: string): string[];
function array(...values: Primitive[]): Primitive[];
```

## Arguments

- `...values: Primitive[]`: The values you want to wrap in an Array

## Return

An Array with the values passed to this function. If the only value passed is a string, this function will return an array composed of this string splitted by commas.

## Examples

- `array(1, 2, 3)`=> `[1, 2, 3]`
- `array('a,b,c')`=> `['a', 'b', 'c']`
