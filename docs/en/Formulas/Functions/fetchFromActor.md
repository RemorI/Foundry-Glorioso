# fetchFromActor

Get the result of a Formula in the specified actor.

## Signature

```ts
function fetchFromActor(actorName: string, formula: string, fallbackValue?: Primitive): Primitive;
```

## Arguments

- `actorName: string`: The name of the actor to reference. It can also contain special values like:
  - `selected`: Gets the actor-data of the currently selected token
  - `target`: Gets the actor-data of the currently targeted token
  - `attached` (Item only): Gets the actor-data an Item is attached to. **&#x26a0;&#xfe0f; This option is deprecated in favor of `fetchFromParent()` and will be removed with Foundry Version 14!**
- `formula: string`: The formula which should be calculated with the properties of the referenced actor. It can also just be a Component key.
- `fallbackValue: Primitive`: The value to return if the referenced actor couldn't be found or returns no value.

## Return

The result of the formula, which is calculated with the properties of the Actor, which matches `actorName`. If an Actor couldn't be found, it will return `fallbackValue` instead.

## Examples

- Get value of key `Defense` from the current target: `fetchFromActor('target', "Defense")`
- Get value of key `Strength` from the actor `John`: `fetchFromActor('John', "Strength")`
- Get value of key `Intelligence` from the actor `Max`. Return `0` if actor or property is not present: `fetchFromActor('Max', "Intelligence", 0)`
- Get value of key `Skill_Value` from dynamic table `Skills` where `Skill_Name` equals `Lock Picking` from the current target: `fetchFromActor('target', "lookup('Skills', 'Skill_Value', 'Skill_Name', 'Lock Picking')")`
