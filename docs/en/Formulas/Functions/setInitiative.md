# setInitiative

Set the initiative of the actor

## Signature

```ts
function setInitiative(entityHandle: string, formula: string, fallbackValue?: Primitive): Primitive;
```

## Arguments

- `entityHandle: string`: The name or uuid of an actor to reference. It can also contain special values like:
  - `self`: Sets into the current actor (can be used in labels)
  - `selected`: Sets into the actor-data of the currently selected token
  - `target`: Sets into the actor-data of the currently targeted token
  - `attached` (Item only): Sets into the actor-data an Item is attached to
- `formula: string`: The formula which should be calculated on the referenced actor or item. This should return a number. It can also just be a key. Inside Item Displayers, item properties should be targeted with the `item.` prefix, just like in other parts of the formulas. If you need to use the properties of the target-actor, you can achieve that by using the `target.`-prefix. **&#x26a0;&#xfe0f;Only these 2 prefixes exist (there's no `attached.`-prefix)!**.
- `fallbackValue?: Primitive`: The value to return if the formula returns no value.

## Return

The new Initiative.

## Examples

- Set the initiative to 20 in the current actor: `setInitiative('self', 20)`
- Set the initiative to `1d10 + Agi` in the current target: `setInitiative('target', '[1d10]+Agi')`
- Increase the initiative by 10 in the Actor named 'Max': `setInitiative('Max', 'fetchInitiative("Max")+10')`
