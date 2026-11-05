# CSB-Functions

An overview of all CSB-specific functions you can use in the system.

## Lookup-functions (only for [Extensible Tables](../Component-Library#extensible-tables))

- [lookup()](./Functions/lookup): Returns multiple values by a simple filter
- [lookupRef()](./Functions/lookupRef): Returns multiple property-paths (**not values!**) by a simple filter
- [alookup()](./Functions/alookup): Returns multiple values by multiple filters
- [find()](./Functions/find): Returns a single value by a simple filter
- [sameRow()](./Functions/sameRow): Returns the value of the current row of the given column
- [sameRowRef()](./Functions/sameRowRef): Returns the property-path (**not the value!**) of the current row of the given column
- [sameRowIndex()](./Functions/sameRowIndex): Returns the index (starting from 0 at the top) of the current row

## Fetch-functions

- [fetchFromUuid()](./Functions/fetchFromUuid): Returns the result of the Formula, that is being executed by the entity with the matching UUID
- [fetchFromParent()](./Functions/fetchFromParent): Returns the result of the Formula, that is being executed by the parent-entity
- [fetchFromActor()](./Functions/fetchFromActor): Returns the result of the Formula, that is being executed by the specified Actor

## Set-functions (only for Roll Messages)

- [setPropertyInEntity()](./Functions/setPropertyInEntity): Overrides the value of the key with the result of the Formula
- [setValues()](./Functions/setValues): Overrides multiple values of multiple entities

## Array-functions

- [array()](./Functions/array): Creates an Array of values (the `[]`-syntax is reserved for Roll Formulas)
- [first()](./Functions/first): Returns the first value of the given Array (or fallback if empty)

## String-functions

- [escapeQuotes()](./Functions/escapeQuotes): Escapes single-quotes
- [replace()](./Functions/replace): Same as [String.prototype.replace()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace)
- [replaceAll()](./Functions/replaceAll): Same as [String.prototype.replaceAll()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll)

## Conditional functions

- [fallback()](./Functions/fallback): Same as [?? (Nullish Coalescing Operator)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) (the operator can also be used in CSB)
- [switchCase()](./Functions/switchCase): Tests an expression against a list of cases and returns the corresponding value of the first matching case (same as `SWITCH()` in Excel/Sheets)

## Other functions

- [consoleLog()](./Functions/consoleLog): Logs the result in the console (F12)
- [notify()](./Functions/notify): Displays a notification message at the top of the window when executed
- [printEffects()](./Functions/printEffects): Returns an HTML-string of the filtered effects of the specified entity
- [recalculate()](./Functions/recalculate): Reevaluates the given value as a Formula, executes it as such and returns the result of it
- [ref()](./Functions/ref): Returns the value of the given **property-path**

# Common functions from math.js

An overview of the most commonly used [functions from mathjs](https://mathjs.org/docs/reference/functions.html).

- [sum](https://mathjs.org/docs/reference/functions/sum.html): Sums all numerical input values together
- [round](https://mathjs.org/docs/reference/functions/round.html): Rounds a value towards the nearest rounded value
- [ceil](https://mathjs.org/docs/reference/functions/ceil.html): Like `round()`, but it will always round up
- [floor](https://mathjs.org/docs/reference/functions/floor.html): Like `round()`, but it will always round down
- [and](https://mathjs.org/docs/reference/functions/and.html): If both values are `true`, it will return `true`, otherwise `false`
- [or](https://mathjs.org/docs/reference/functions/or.html): If one of both values is `true`, it will return `true`, otherwise `false`
- [not](https://mathjs.org/docs/reference/functions/not.html): It will convert `true` to `false` and vice versa
- [concat](https://mathjs.org/docs/reference/functions/concat.html): It will concatenate multiple strings together
- [count](https://mathjs.org/docs/reference/functions/count.html): It will count the number of elements in an array (often used together with `lookup()`)
- [equalText](https://mathjs.org/docs/reference/functions/equalText.html): It will compare 2 strings and return `true` if both are equal, otherwise `false`
- [max](https://mathjs.org/docs/reference/functions/max.html): It will output the biggest number of all given values
- [min](https://mathjs.org/docs/reference/functions/min.html): It will output the smallest number of all given values
