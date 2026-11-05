# printEffects

Returns the list of active effects on the provided entity as an HTML string.

## Signature

```ts
function printEffects(opts?: {
  uuid?: string;
  active?: boolean;
  tags?: Array<string>;
  format?: 'list' | 'table' \ 'list-detailed';
}): string;
```

## Arguments

- `opts?: {...}`: Additional options
  - `uuid?: string`: The uuid of the entity to target. The defaults to the current entity uuid.
  - `active?: boolean`: If `true`, the function will only print effects that are currently active. If `false` all effects will be printed. Defaults to `true`.
  - `tags?: Array<string>`: An array of tags to filter the effects. If missing or empty, all effects will be printed.
  - `format?: 'list' | 'table' | 'list-detailed'`: Format `list` will print an unordered list of the effects names. Format `list-detailes` will print an unordered list of the effects names along with their description. Format `table` will print a table containing the names and descriptions of the effects. Defaults to `list`.

## Return

The generated string to print the effects.

## Examples

- `printEffects()` Prints all currently active effects of the current entity, as a list of names.
- `printEffects({active: false, tags: [], uuid: 'MY_CUSTOM_UUID', format: 'table'})` Prints all effects from the entity with UUID 'MY_CUSTOM_UUID', as a table of the names and descriptions of the effects.
- `printEffects({tags: ['passive', 'ultimate'], format: 'table'})` Prints all currently active effects with either the 'passive' or the 'ultimate' tag from the current entity, as a table of the names and descriptions of the effects.
