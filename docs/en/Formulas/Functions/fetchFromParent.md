# fetchFromParent

Get the value of a Formula in the parent of the current entity.

## Signature

```ts
function fetchFromParent(formula: string, opts?: { fallback?: Primitive; top?: boolean }): Primitive;
```

## Arguments

- `formula: string`: The formula, which should be calculated on the referenced Actor. It can also just be a key.
- `opts?: {...}`: Additional options
  - `fallback?: Primitive`: A fallback-value in case the parent couldn't be fetched because there's none
  - `top?: boolean`: If `true`, the function will fetch the toplevel parent (Actor) instead of the next parent in the hierarchy

## Return

The result of the formula, which is calculated with the properties of the **parent-entity**. If no parent was found, it
will return the value of `fallback` instead. If no `fallback` is specified, it will return `undefined`.
**&#x26a0;&#xfe0f; This function doesn't work on Actors, only Items, because Actors don't have parents!**

## Examples

Suppose you have these 3 entities with the entity hierarchy `Manfred` -> `Pistol` -> `Scope`:

```json
{
  "name": "Manfred",
  "strength": 9,
  "constitution": 10,
  "weight": 50
}
```

```json
{
  "name": "Pistol",
  "attack": 10,
  "weight": 2
}
```

```json
{
  "name": "Scope",
  "weight": 0.5
}
```

- If we use `fetchFromParent('weight')` in `Pistol`, it would return `50`.
- If we use `fetchFromParent('weight')` in `Scope`, it would return `0.5`.
- If we use `fetchFromParent('weight', {top: true})` in `Scope`, it would return `50`.
- If we use `fetchFromParent('weight')` in `Manfred`, it would throw an error.
- If we use `fetchFromParent('dexterity', {fallback: 5})` in `Pistol`, it would return `5` because of the fallback value.
- If we use `fetchFromParent("max(strength, constitution)")` in `Pistol`, it would return `10`, because
  `max(strength, constitution)` would resolve to `max(9, 10)` -> `10` with the properties of `Manfred`.
