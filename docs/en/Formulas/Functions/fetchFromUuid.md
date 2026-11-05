# fetchFromUuid

Get the value of a Formula in the entity with the given uuid.

## Signature

```ts
function fetchFromUuid(uuid: string, formula: string, fallback?: Primitive): Primitive;
```

## Arguments

- `uuid`: The UUID of the Item. Can be retrieved with `find('itemDisplayerKey', 'uuid', ...)`. If you use a static UUID, make sure that it isn't an ID, because **IDs and UUIDs are not the same**!
- `formula: string`: The formula, which should be calculated with the properties of the referenced entity. It can also just be a Component key.
- `fallback: Primitive`: The value to return in case the entity couldn't be found or the formula returns `null` or `undefined`

## Return

The result of the formula, which is calculated with the properties of the entity, which matches `uuid`. If an entity couldn't be found or the formula returns `null` or `undefined`, it will return the `fallback` instead.

## Examples

- Get value of key `Attack` from the Item with the UUID `'Item.GU3mQuQJOmd7nFTu'`: `fetchFromUuid('GU3mQuQJOmd7nFTu', 'Attack')`
- Get value of key `Weight` from the Item with the UUID `'Actor.lvY0dry6JyqNG5ym.Item.tGR1MQ0OWL9UTsS1'`. Return `0` if the Item couldn't be found: `fetchFromUuid('Actor.lvY0dry6JyqNG5ym.Item.tGR1MQ0OWL9UTsS1', 'Weight', 0)`
- Get the bigger value of `Attack` and `Defense` from the Item in the Item Displayer `weapons`, which matches the name `'Shield'`. Return `0` if no Item could be found: `fetchFromUuid(find('weapons', 'uuid', 'name', 'Shield'), "max(Attack, Defense)", 0)`
- Get value of key `Strength` from the Actor with the UUID `Actor.lvY0dry6JyqNG5ym`: `fetchFromUuid('Actor.lvY0dry6JyqNG5ym', 'Strength')`
