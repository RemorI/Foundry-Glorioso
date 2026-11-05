# fetchInitiative

Fetch the current initiative of an actor

## Signature

```ts
function fetchInitiative(actorHandle: string, fallbackValue?: Primitive): Primitive;
```

## Arguments

- `actorHandle: string`: The name or uuid of the actor to reference. It can also contain special values like:
  - `self`: Fetch from the current actor
  - `selected`: Fetch from the currently selected token
  - `target`: Fetch from the currently targeted token
  - `attached` (Item only): Fetch from the actor Item is attached to
- `fallbackValue: Primitive`: The value to return if the referenced actor couldn't be found or the iniative value is empty.

## Return

The initiative of the actor which matches `actorName`. If an Actor couldn't be found, it will return `fallbackValue` instead.

## Examples

- Get the initiative from the current target: `fetchInitiative('target')`
- Get the initiative from the actor `John`: `fetchInitiative('John')`
- Get the initiative from the actor `Max`. Return `0` if actor or initiative is not present: `fetchInitiative('Max', 0)`
