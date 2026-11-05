# setValues

Set multiple values in multiple entities identified by their uuid

## Signature

```ts
function setValues(uuids: string | string[], ...updateArgs: string[]): string;
```

## Arguments

- `uuids: string | string[]`: The UUID(s) of the entities you want to set values
- `...updateArgs: string[]`: The update-arguments, which consist of key-formula-pairs:
  - `key: string`: The key of the entity you want to set a value
  - `formula: string`: The formula, which will resolve with the properties of the **current entity**. If you need values from the entity from the UUID, then use the `target.`-prefix.

## Return

A string, which contains all updates

## Examples

- Set value of key `HP` to 20 in the entity with the UUID `Actor.lvY0dry6JyqNG5ym`: `setValues('Actor.lvY0dry6JyqNG5ym', 'HP', 20)`
- Double the current value of the key `Defense` in the entity with the UUID `Actor.lvY0dry6JyqNG5ym`: `setValues('Actor.lvY0dry6JyqNG5ym', 'Defense', "target.Defense * 2")`
- Decrease the value of the key `uses` by 1 in all Items within the Item Displayer `Spells`: `setValues(lookup('Spells', 'uuid'), 'uses', "target.uses - 1")`
- Decrease `HP` and `SP` by 10 in the entity with the UUID `Actor.lvY0dry6JyqNG5ym`: `setValues('Actor.lvY0dry6JyqNG5ym', 'HP', "target.HP - 10", 'SP', "target.SP - 10")`
