# consoleLog and consoleTable

Log a message in the Javascript Console

## Signature

```ts
function consoleLog(dataLog: T): T;
```

Renders a console log of the string or object passed to it.

```ts
function consoleTable(dataLog: T): T;
```

Renders a console table of the string or object passed to it.

These functions are intended to be used for debugging during sheet building, and should likely not be used in your final formulas.

## Arguments

- `dataLog: any`: The data to log to the console

## Return

The same as `dataLog` (the input is the same as the output).

## Examples

In an Item Displayer, you can inspect the properties of an item like so: `${consoleTable(item)}$`
