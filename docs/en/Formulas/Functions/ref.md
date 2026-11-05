# ref

Returns the value of the field with the key in valueRef.

## Signature

```ts
function ref(valueRef: string, fallbackValue: Primitive): Primitive;
```

## Arguments

- `valueRef: string`: The key of the field to get the value from.
- `fallbackValue?: Primitive`: The value to return if the key referenced has no value.

## Return

The value of the field which has the key pointed by `valueRef`, or `fallbackValue` if `valueRef` does not point to a valid field.

## Examples

- `ref('hp')` Returns the value of the field with the key `hp`
- `ref(currentArmor)` Returns the value of the field targeted by `currentArmor`. If `currentArmor` is a field containing `lightArmorProtection` for example, this will return the value of the `lightArmorProtection` field.
- `ref(sameRow('attribute'))` Returns the value of the field targeted by the column `attribute` in the current row of a Dynamic Table.
