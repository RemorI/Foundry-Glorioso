# recalculate

This function is used to recalculate a value. This can be used for custom formulas from a Text Field or a Rich Text Area. **BEWARE: It cannot recalculate Roll-Formulas or User Input Dialogs**

## Signature

```ts
function recalculate(formula: string): Primitive;
```

## Arguments

- `formula: string`: The formula which should be recalculated. It needs to contain `${}$` as usual. Can be a key to a field with a formula.

## Return

The result of the calculation.

## Examples

- `recalculate('${Strength + 3}$')` With 'Strength' = `7` => Returns: `10`
- `recalculate(MyInputFieldKey)` With 'MyInputFieldKey' = `${round(Strength / 2)}$` and 'Strength' = `5` => Returns: `3`
