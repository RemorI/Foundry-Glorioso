# Formula System

[[_TOC_]]

## Introduction

In many places throughout the system, you can use formulas to enhance your sheets. The formula system is used to perform
calculations, compute sentences, or to trigger actions on the sheets automatically based on the values of the characters.
This is mandatory for all kinds of automations that should happen in your sheets.

## Predefined values

In this guide we'll use some predefined values for the examples for a better explanation. The ones we're using are the
following:

**Actor:**

```json
{
  "Strength": 7,
  "Dexterity": 5,
  "Constitution": 5,
  "Health": 50,
  "WithdrawalResistanceValue": 10,
  "isSitting": true,
  "selectedAttribute": "Strength",
  "name": "TestActor"
}
```

**Item:**

```json
{
  "name": "TestItem",
  "Attack": 10,
  "Damage": "1d20+2"
}
```

So whenever you see a Variable in an example, you can scroll back to this section to check which value it holds.

## Formula types

CSB uses 3 different types of formulas, with each having its own rules:

- CSB-Formula `${}$`: This is the main type you'll use throughout the system
- Roll-Formula:`[]` (only allowed inside `${}$` in Label Roll Messages): This comes in hand when you want to perform rolls,
  e.g. rolling a `1d20`
- Script-Expression: `%{}%`: This type gives you full control over the CSB and Foundry API, but requires knowledge about
  JavaScript

### CSB-Formulas `${}$`

CSB-Formulas are the main part of the system. It's important to understand how CSB-Formulas work to build a good
character sheet, which can keep track of things for you instead of vice versa.

Formulas can be used everywhere, where the field is marked with this icon:

![img.png](../imgs/formula-system/formula-icon.png)

These fields can contain Formulas, but you are not required to use one if you don't need, e.g. if your Label text only
contains a static value:

```
Learned Languages:
```

But if your field is dependent on other values within the sheet, then you have to use a Formula. To do so, use the
delimiters `${` and `}$`. Inside those delimiters, you can use the **component keys** you defined for any component
holding a value, which looks like this:

```js
${Strength}$ // -> 7
```

This would resolve to `7` for our example Actor, because the value of `Strength` of the Actor is `7`.

You can also mix static text with Formulas:

```
Your current Strength is ${Strength}$
```

This would resolve to `Your current Strength is 7`.

You can also use multiple Formulas within a field:

```
Strength: ${Strength}$, Dexterity: ${Dexterity}$
```

This would resolve to `Strength: 7, Dexterity: 5`

There's, of course, more that you can do, but this will be covered later on in the guide.

CSB-Formulas use the [math.js library](https://mathjs.org) to parse your expressions. If you're interested, you can read
through the docs of the library:

- A summary of the syntax: [https://mathjs.org/docs/expressions/syntax.html](https://mathjs.org/docs/expressions/syntax.html)
- A summary of the functions math.js has: [https://mathjs.org/docs/reference/functions.html](https://mathjs.org/docs/reference/functions.html)

#### Data types

The values in CSB-Formulas can contain different data types (like in any other programming languages). The most
important ones are:

- Number: `5`, `0`, `-3`, `0.4`
- String: `'Hello'`, `'World'`, `''`, `'This is a sentence.'`
- Boolean: `true`, `false`
- Array: `[4, 5, 0, 2]`, `['This', 'is', 'spartaaaaaaaaa!']`, `[true, true, false, true]`

If you want to learn more about data types, check this [article](https://www.w3schools.com/js/js_datatypes.asp). For
strings, check the sections "Using Quotes", "Quotes Inside Quotes" and "Escape Characters" of this
[article](https://www.w3schools.com/js/js_strings.asp).

#### Variables

CSB stores the values of (most) Components under `actor.system.props`, where `actor` is the Actor in question. For
example, if you have a Number Field with the key `Strength`, the value of it will be stored under
`actor.system.props.Strength` (there are also Components, which don't store any data in the `props`-Object, e.g. Panels,
so referencing these in other Formulas wouldn't be possible). These stored values can be accessed by other Formulas
by simply using the Component keys instead of the whole path:

```js
${Strength}$ // That's how you do it
${actor.system.props.Strength}$ // And that's how you don't
```

If you want to sum up the values of the Number Field `Strength` and `Dexterity`, then you have to use the `+`-Operator
to do so, which looks like this:

```js
${Strength + Dexterity}$ // -> ${7 + 5}$ -> ${12}$ -> 12
```

If you want to learn more about variables, check this [article](https://www.w3schools.com/js/js_variables.asp). But keep
in mind, that you cannot use the keywords `const`, `let`, `var` or the standard-assignment-operator `=` to declare your
own variables. The only place where you can declare variables are in Label Roll Messages (with the
custom-assignment-operator `:=`):

```js
${foo:= 3}$
${foo + 4}$
```

In this case, a variable `foo` will be declared and initialized with the value `3`, which can be used further down in
the Label Roll Message.

#### Operators

We have some values with certain data types, but that's not enough for us. We also want to **do something** with them
(like adding numerical values together). To achieve that, we need to know how we can use operators and functions. For
that, I suggest reading this [article](https://www.w3schools.com/js/js_operators.asp) to learn more about the different
operators (excluding the assignment-, string- and bitwise-operators). The most common operators in CSB are:

- `+` (plus): Adds 2 values together. Returns a number
- `-` (minus): Subtracts the right value from the left value. Returns a number
- `*` (multiply): Multiplies 2 values together. Returns a number
- `/` (divide): Divides the left value from the right value: Returns a number
- `==` (equal to): Checks if 2 values are equal (doesn't work with strings!). Returns a boolean
- `!=` (not equal): Checks if 2 values are not equal (doesn't work with strings!). Returns a boolean
- `>` (greater than): Checks if the left value is greater than the right value. Returns a boolean
- `>=` (greater equals): Checks if the left value is greater than or equal to the right value. Returns a boolean
- `<` (less than): Checks if the left value is less than the right value. Returns a boolean
- `<=` (less equals): Checks if the left value is less than or equals to the right value. Returns a boolean
- `?` (ternary operator): The only operator with 3 values -> `<if> ? <then> : <else>`. Executes either the `<then>` or
  `<else>`-part (see [Conditions](#conditions) for more info)
- `??` (nullish coalescing operator): Returns the **right side** of the operator if the left side is either `null` or `undefined`

> &#x26a0;&#xfe0f; **Some common syntax in other programming languages won't work**: For example, you cannot use the 'NOT' `!` operator.
> In such cases, you have to use the `not()`-function

An operator is always surrounded by **exactly 2 values** (excluding the ternary operator, that one is special), the value on the **left side** of the
operator and the value on the **right side** of the operator (e.g. `3 + 5`, where `3` is the value on the left side and
`5` the value on the right side). The system will process the values with the operator and return a result in its
place (e.g. `3 + 5` will be computed and replaced by `8`). If we have multiple operators, these will be computed
sequentially (e.g. `3 + 5 + 7` will be computed to `8 + 7` and this will be computed to `15`). Usually, operations are
executed from left to right, but this is not always the case. If one operator in a formula has a higher **precedence**
than the other, then the operator with the higher precedence will be executed first (e.g. multiplications are done
before additions: `3 + 5 * 7` -> `3 + 35` -> `38`).

#### Functions

You can also perform operations with functions (just like with operators), there are just a few differences you have to
take care of. To show them, I'll start with an example: `sum()` is a function, which takes a variable number of
numerical values and computes them together. So `sum(3, 5)` would result to `8`. As you can see here, a function
consists of a name (`sum`), brackets (`()`) and input values, which are separated by comma (`3, 5`). How many input
values a function needs depends on the function itself, it can either take a fixed or a dynamic number of input values.

You can also use multiple functions at once. In this case, the innermost function will always be resolved first. For
example: `sum(3, sum(5, 7))` would resolve to `sum(3, 12)` and that would resolve to `15`.

A full list of functions can be found [here](../Formulas/Functions).

#### Conditions

There are currently only 2 ways to handle conditions with CSB-Formulas: One is with the
[switchCase()](../Formulas/Functions/switchCase)-function and the other one is with the ternary-operator
(see [operators](#operators)).

The ternary-operator has 3 parts:

- The condition to evaluate
- The part, that should be displayed if the condition is truthy
- The part, that should be displayed if the condition is falsy

An example with the ternary-operator:

```js
Strength > 5 ? 'You are strong' : 'You are weak';
```

This will return us the text `Your are strong` if `Strength` is greater than `5`, otherwise it would return
`You are weak`.

If you have a Checkbox, then you only need to use the component key without any comparison operator:

```js
isSitting ? 'Sitting' : 'Not Sitting';
```

The reason is simple: The value of the Checkbox is already a boolean, so there's no need for a comparison

You can also nest conditions if you have multiple ones:

```js
Strength < 3 ? 'Very weak' : Strength > 7 ? 'Very strong' : 'Normal';
```

You have to provide all 3 parts for the ternary-operator at all times, otherwise it will result in a syntax-error.

There are also a few common pitfalls you should avoid when working with conditionals:

1. **Be careful when you combine conditionals with operations**

The ternary operator doesn't have a higher precedence over other operators, so expressions are resolved from left to
right. Use parens if you want to enforce a different order of execution:

```js
Dexterity + Strength > 5 ? 1 : 0; // Will sum up Dexterity and Strength before evaluating the condition
Dexterity + (Strength > 5 ? 1 : 0); // Will evaluate the condition before summing up with Dexterity
```

2. **You cannot compare strings with the `==`-operator**

Comparing string with the `==`-operator will result in an error. If you need to compare strings for equality, use
`equalText()` instead:

```js
selectedAttribute == 'Strength' ? 1 : 0; // ERROR
equalText(selectedAttribute, 'Strength') ? 1 : 0; // 1 or 0
```

3. **Conditionals do not apply correctly for special operations**

Some things like Roll-Formulas are executed before expressions in CSB-Formulas are resolved. This leads to some
unexpected behaviour like Roll-Formulas being executed although the conditional expression would resolve to `false`.

```js
${result:= Strength > 5 ? [2d10] : [1d10]}$ // This will execute both Roll Formulas before the condition gets evaluated
```

The reason behind this is that innermost Formulas are executed prior to outer ones. So if we do 1 step in the execution,
we'll get the following intermediate values (if we assume that all dices roll a `10`):

```js
${result:= Strength > 5 ? 20 : 10}$
```

You see that all Roll-Formulas got resolved before the CSB-Formula got even resolved. And as soon as we resolve a
Roll-Formula, the dices for it will be rolled (if you're using the "Dice So Nice"-module). To circumvent the issue of
rolling unwanted dices, you should **build** a Roll-Formula before **executing** it (so doing 2 steps instead of
only 1). An example:

```js
${rollFormula:= Strenth > 5 ? '2d10' : '1d10'}$
${[:rollFormula:]}$
```

Instead of using RollFormulas directly, we are using strings in the format of a Roll-Formula, which we are supplying
into a Roll-Formula, which is in a **separate CSB-Formula**.

#### Execution-Context

CSB provides the properties of the current entity to the Formula which will be processed. That means that different
entities can yield different results, although the Formula is the same. For example, if we use the Formula `${name}$`,
it would return the current name of the entity.

**Actor-Sheet:**

```js
${name}$ // TestActor
```

**Item-Sheet:**

```js
${name}$ // TestItem
```

So in our **Actor** it would resolve to `TestActor` and in our **Item** to `TestItem`. That's what is called
**execution context**. The result of the Formula depends on **who executes the Formula**. By default, the Formula will
use the properties of the entity the Formula resides in. Meaning that, if the Formula is within an Actor, it will use
the properties in the Actor and if the Formula is within an Item, it will use the properties of the Item.

Some Components (like the Item Container) allow to use a prefix (e.g. `item.`) to use the properties of a different
entity-instance instead of the properties of the actual entity instance. If we take the Item Container again and let it
display our Item, `${name}$` would show the **name of the Actor**, while `${item.name}$` would show the **name of the Item**:

```js
${name}$ // TestActor
${item.name}$ // TestItem
```

This is clearly an exception to the default-case, because the Item Container in the Actor can access the properties of
the Item. That is possible because the Component fetches the Actor-/ & Item-properties and merges them together before
resolving the Formula, so it **modifies the execution context**. If we take the example-data from above, the merged data
would look like this:

```json
{
  "Strength": 7,
  "Dexterity": 5,
  "Constitution": 5,
  "Health": 50,
  "WithdrawalResistanceValue": 10,
  "selectedAttribute": "Strength",
  "name": "TestActor",
  "item": {
    "name": "TestItem",
    "Attack": 10,
    "Damage": "1d20+2"
  }
}
```

Functions, which can take whole formulas like `fetchFromActor()`, are also an exception to the default-case. For
example, if we use `${fetchFromActor('Steven', "Strength")}$`, this would return the `Strength` of the Actor called
`Steven` and not the `Strength` of the entity, who executes the Formula:

**Data of Steven:**

```json
{
  "name": "Steven",
  "selectedAttribute": "Dexterity",
  "Dexterity": 9,
  "Strength": 12,
  "Skills": {
    "0": {
      "Name": "Climbing",
      "Attribute": "Dexterity",
      "Value": 3
    },
    "1": {
      "Name": "Carrying",
      "Attribute": "Strength",
      "Value": 2
    }
  }
}
```

```js
Strength; // 7 (Strength of the current entity)
fetchFromActor('Steven', 'Strength'); // 12 (Strength of Steven)
```

Those functions **change the execution context** of the **passed** Formula. This can lead to variations of execution
contexts, so it is vital to know which part is resolved with which context. Some common variations you'll maybe see or
even use are the following:

```js
selectedAttribute; // 'Strength'
fetchFromActor('Steven', 'selectedAttribute'); // 'Dexterity'
fetchFromActor('Steven', 'ref(selectedAttribute)'); // 9
fetchFromActor('Steven', selectedAttribute); // fetchFromActor('Steven', 'Strength') -> 12
fetchFromActor('Steven', '${selectedAttribute}$'); // 12 (same as above)
fetchFromActor('Steven', "find('Skills', 'Value', 'Name', selectedAttribute)"); // Will filter by selectedAttribute of Steven -> fetchFromActor('Steven', "find('Skills', 'Value', 'Name', 'Dexterity')") -> 3
fetchFromActor('Steven', "find('Skills', 'Value', 'Name', '${selectedAttribute}$')"); // Will filter by selectedAttribute of our Actor -> fetchFromActor('Steven', "find('Skills', 'Value', 'Name', 'Strength')") -> 2
```

#### Reserved keys

There are also reserved keys in the system, which can be used by the user directly without any need for setup. You can
use them like any other component keys in your template. Here's a list of all reserved keys in CSB:

- `name`: Contains the name of the entity (actor name or item name)
- `item` (Item Displayer): Contains all properties of the Item in the Item Container (e.g. `item.name`) returns the name
- `item.id` (Item Displayer): Contains the ID of the Item
- `item.uuid` (Item Displayer): Contains the UUID of the Item

#### Formulas in Label Roll Messages

Formulas in Label Roll Messages have a few differences in comparison to Formulas in other areas (like in a Label text):

- Each Formula will be wrapped in a `<span></span>`. This wrapper will be displayed as a grey box and contains a clickable
  tooltip with the **Formula-Explanation**
- There are additional options in Label Roll Messages (see the detailed list below)

```js
${!name}$ // The ! at the beginning will remove the <span></span>-wrapper, leaving the result as is (like in a Label text)
${#name}$ // The # at the beginning will hide the Formula in the Chat Message. Useful for saving itermediate values
${foo:= name}$ // This will save the value of name in the variable foo, which can be used by other Formulas down below. This is often combined with #
${[1d20]}$ // This will define a Roll-Formula (see section 3.2.)
${[#loot]}$ // This will define a Roll-Table, from which will be rolled
${[!5d20]}$ // This will display all rolled dices in the Chat
${[#loot|selectedAttribute]}$ // This will define a Roll-Table and roll it based on the result of the Formula. A constant value would return the same result of the Roll Table
${?{modifier}}$ // This will define a User Input Dialog. The Dialog will ask the user for input and store the result in modifier
${?{modifier:'Dice Modifier'[number]|0}$ // Same as above, but the Label will be 'Dice Modifier' instead, the input will only accept numbers and the initial value will be 0
${?#{regenTemplate}}$ // This will open a defined User Input Dialog based on the User Input Template (a specific Item Template Type) called 'regenTemplate'
```

- `!<Formula>` at the beginning of a CSB-Formula `${!<Formula>}$`: This will remove the box of the result of the Formula
  making it look like a static text outside a Formula. This will also remove the **HTML-tags** it would usually create.
- `#<Formula>` at the beginning of a CSB-Formula `${#<Formula>}$`: This will hide the result of the Formula. Often used
  together with the assignment-operator `:=`.
- `<variable>:=` at the beginning of a CSB-Formula `${<variable>:= <Formula>}$`. This will create a temporary variable
  in the Label Roll Message, which can be used by other Formulas within the same Label Roll Message.
- `[]` in a CSB-Formula `${[<Roll-Formula>]}$`: This will define a Roll-Formula in a Label Roll Message
  (see [Roll Formulas](#roll-formula-)).
- `[#<rollTableName>]` in a CSB-Formula `${[#<rollTableName>]}$`: This will roll a Roll Table and return the result of
  the Roll Table.
- `[#<rollTableName>|<rollFormula>]` in a CSB-Formula `${[#<rollTableName>|<rollFormula>]}$`: This will roll a Roll
  Table based on the result of the Roll Formula. A constant value in the Roll Formula would draw the same result from the
  Roll Table.
- `[!<Roll-Formula>]` in a CSB-Formula `${[!<Roll-Formula>]}$`: This will display all rolled dices in Chat instead of
  only in the explanation.
- `?{<varName>}` in a CSB-Formula `${?{<varName>}}$`: This will open a Dialog during Formula-Computation which will ask
  the user for input. `<varName>` will be handled like a temporary variable, so it can be used by other Formulas further
  down.
- `?{<varName>:<displayName><varType>|<defaultValueFormula>}` in a CSB-Formula
  `${?{<varName>:'<displayName>'[<varType>]|<defaultValueFormula>}}$`: Same as `?{<varName>}`, but with additional options.
  More information can be found
  [here](https://gitlab.com/custom-system-builder/custom-system-builder/#481-simple-prompts).
- `?#{<userInputTemplateName>}` in a CSB-Formula `${?#{<userInputTemplateName>}}$`: This will open a Dialog during
  Formula-Computation, which will be based on a `UserInputTemplate` (an Item-Template). The component keys in the
  `UserInputTemplate` can be used by other Formulas in the Label Roll Message further down.

For more info, check this article about [Chat Messages](../Formulas/Chat-Messages).

### Roll-Formulas

#### Static Roll Formulas

The Roll-Formula is used to perform rolls in the system. CSB uses the Foundry-Roll-API internally to process your
Roll-Formulas, so you can do everything, what the Foundry-Roll-API already allows you to do. A list of valid Foundry
Roll Formulas can be found [here](https://foundryvtt.com/article/dice/).

We'll take a look at one of Foundrys examples: `/r 5d20`. This is a **Roll Command**, which will roll 5 twenty-sided
dice and output the sum of all rolls. To convert it to a valid Roll-Formula, we just need to remove the `/r`-part and
put our `5d20` into `[]`, so our final Roll Formula should look like this:

```js
${[5d20]}$ // Rolls 5d20
```

**Be aware**, you are only allowed to use Roll-Formulas inside `${}$` in a **Label Roll Message**. If you use it outside
of `${}$` or outside of **Label Roll Messages**, the Roll-Formula will simply not work.

#### Dynamic Roll Formulas

CSB also allows you to use values within the Roll-Formula, which will be resolved **before** they get passed to the
Foundry-Roll-API. To do so, surround the dynamic data with `::`.

We'll take the example above and modify it to use a dynamic count of dice instead of `5`. We'll make it dependent on the
current value of `Strength`. To do so, we define the Roll-Formula as following:

```js
${[:Strength:d20]}$ // Rolls 7d20, because :Strength: resolves to 7
```

It is also possible to define a completely dynamic Roll-Formula. Let´s imagine we have a Text-Input-Component with the
key `Damage_Formula` and it contains `2d10` as value:

```js
${[:Damage_Formula:]}$ // Rolls 2d10, because :Damage_Formula: resolves to 2d10
```

The reason why this is possible is pretty simple. Everything inside `::` in `[]` will be treated as a
CSB-Formula `${}$`. So what CSB does for you is that it will **always** resolve everything inside `::` first before
passing the Roll-Formula further to the Foundry-Roll-API, so that you are able to construct your Roll-Formula on the
get-go:

```js
${[:Dexterity:d10]}$ // Rolls 5d10
${[${!Dexterity}$d10]}$ // Is the equivalent to the Formula above
```

Because `::` are treated as CSB-Formulas, you can also use **functions** like `min()` or `max()` inside those
delimiters:

```js
${[:max(Strength, Dexterity):d20]}$ // resolves to [:max(7, 5):d20], which resolves to [7d20] which will roll 7d20
```

#### Roll Tables

You can also use Roll Tables, using the syntax `[#<rollTableName>]`. Just put a `#` before your roll table name, inside brackets, and the system will roll its default formula and integrate the result in the message.

You can customize the Roll Table formula by adding a Roll formula in this syntax : `[#<rollTableName>|<rollFormula>]`. The formula must follow roll formula syntax, with `::` to delimit the keys. This formula can be a Dice roll or a constant value, the latter will always draw the same result from the Roll Table.

### Script-Expressions

Script-Expressions are a great way to overcome the limits of CSB, because you can use **JavaScript** here. So you are
able to write your own programs, which can call external APIs, Macros, and other stuff, the other Formulas are not
capable of. Script-Expressions are **only recommended for users**, which have some **programming knowledge**; otherwise
you should stick with the other 2 formula types.

There are also guides I recommend reading before you start scripting in CSB:

- https://github.com/GamerFlix/foundryvtt-api-guide/blob/main/README.md: I strongly recommend to read the
  `Beginners Macro Guide` as this explains basic concepts of Foundry infrastructure and how to work with it
- https://gitlab.com/Freeze020/foundry-vtt-scripts/-/tree/master/api-examples: A collection of simple examples
- https://mxzf.gitlab.io/foundry-info/: More detailed guide about the Foundry infrastructure
- https://foundryvtt.com/api/: The official API-documentation of Foundry. This is for those, who want to dig deep

If you need help with Macros and Scripts, then you should ask in the
[#macro-polo](https://discord.com/channels/170995199584108546/699750150674972743)-channel of the Foundry-Discord (as
long as the question is not directly related to CSB).

Some usage examples:

- `%{return game.actors.size + ${Strength}$;}%`: Will add the amount of all actors in the game with the Strength
- `${%{return game.actors.size}% + Strength}$`: Basically does the same
- `%{return await game.macros.getName('YourMacro').execute()}%`: Will execute the macro with the name `YourMacro` and return its result
- `%{return await game.macros.getName('YourMacro').execute({name: '${name}$'})}%`: Will execute the macro with the name`YourMacro`, pass `name` as an argument to the macro, and return its result
- `%{return entity.system.props.Health}%` Will return the value of `Health` in the triggering entity
- `%{linkedEntity.delete()}%` This will delete the Item in the Item Displayer, if the script is executed within the Label Roll Message of the Item Displayer. **ATTENTION: Use delete-operations with care!**
- `%{return localVars.roll}%` This will return the value of `roll` in the local variables of a Label Roll Message
- `%{localVars.something = 5;}%` This will add `something` with the value `5` to the local variables of the Label Roll Message, which can be used by other Formulas further down.
- `%{return options.dynamicRowRef}%` This will return the row-reference of the Dynamic Table the Script was executed in. This can be helpful in Scripts, where the reference of the current row is needed.

If your script depends on values computed elsewhere in your system, race conditions can happen, meaning your script gets
computed before all of its necessary values are computed. To avoid this, you can use the
`throwUncomputableError(message: string, source: string = ''): void` function, which will reschedule the script
computation for a later time, eventually computing it when everything is ready.

#### Sync / Async

Script-Expressions are called **asynchronously** in Label Roll Messages and keyless Labels. In keyed Labels
and other Components they are called **synchronously** (due to limits in the core-functionality). This is important to
know because the `macro.execute()`-function returns a Promise, so the result can only be returned in an asynchronous
context. Besides that, you have all the freedom JavaScript can offer you.

#### entity / linkedEntity / localVars / options

The system provides the context of the triggering entity (either the Actor or the Item) in the `entity`-object,
which is globally available within the Script. In addition to that, `linkedEntity` will also be provided, if the Script
is called from a Label within an Item Displayer. In this case, `linkedEntity` will contain the data of the Item the
Label is linked to (Item-link and Label are in the same row).

The `localVars`-object contains the variables, that are defined from Formulas in a Label Roll Message. You can both access and put
your own variables into this object, so it's possible to save the result of your script within this object and access it
later on with a regular CSB-Formula.

The `options`-object contains all other contextual information, which weren't important enough to put into own variables.

If you want to know which data are provided by these objects, you can log and inspect these in the console:

```js
%{console.warn('entity: ', entity);}%
%{console.warn('linkedEntity: ', linkedEntity);}%
%{console.warn('localVars: ', localVars)}%
%{console.warn('options: ', options)}%
```

#### Transferring data between `%{}%` & `${}$`

If you want to transfer data between CSB-Formulas and Scripts, you can do so by nesting them inside each other. In this
case, the innermost Formulas will be executed first before the outer ones are processed, so it's possible to pass data
to an outer Formula.

##### `${}$` -> `%{}%`

Example: `%{game.actors.size + ${Strength}$;}%`. In this case, `${Strength}$` will be processed first and return its
result to the Script-Expression. So the intermediate result would look like this: `%{game.actors.size + 5;}%`.
**Be careful:** The result of a CSB-Formula is an **untyped text**, so you have to add quotes back to strings if you
want to keep the result as a string. Example: `%{const name = ${name}$;}%` resolves to`%{const name = TestActor}%` ,
which is **invalid** in JavaScript (missing quotes).

##### `%{}%` -> `${}$`

Example: `${Strength + %{return game.actors.size;}%}$`. In this case, `%{return game.actors.size;}%` will be processed
first and return its result to the CSB-Formula. If `game.actors.size` is `7`, it will resolve to `${Strength + 7}$`.
If you pass the result of a Script to a CSB-Formula (or to the Label / Label Roll Message directly), you shouldn't
forget to use `return`, because it is technically a function we are executing. If you forget to add a return, it will
return `undefined`, which will result in an `ERROR`.

### Calling macros

To call a Macro via a Script-Expression, you have to use the `macro.execute()`-function. You can get the context of the
Macro with `game.macros.getName('macroName')`. So a standard Macro-call should look like this:

```js
%{return await game.macros.getName('macroName').execute();}%
```

This will execute the Macro with the name `macroName`, await the execution (asynchronous task) and finally return the
result of the Macro.

If you need to pass arguments to the Macro, you can do it this way:

```js
%{return await game.macros.getName('macroName').execute({name: entity.name, strength: ${Strength}$});}%
```

`entity.name` will be available in the Macro under the variable `name` and `Strength` will be available under the
variable `strength`.

We'll take a look at another example. In this case we have a Macro called `Withdrawal/Loss` in a Compendium called
`Macros`, which will be called from a Label Roll Message. The Label Roll Message has the task to resist
withdrawal-damage (common in Shadowrun 6 if someone casts a spell). The content of the Label Roll Message is the
following:

```js
${#withdrawal:= item.Withdrawal}$
${#successes:= [:WithdrawalResistanceValue:d6cf=1cs>4]}$
${#damage:= withdrawal - successes}$

%{
return await (await fromUuid('Compendium.custom-system-builder-shadowrun-6-compendium.macros.Macro.mU3qeB58kui3tvtq')).execute(entity: entity, type: 'Withdrawal', damage: ${damage}$);
}%
```

The Macro in use:

```js
const props = entity.system.props;
const attribute = type === 'Withdrawal' ? 'Magic' : 'Resonance';
const physicalTotalKey = 'Physical_Total';
const mentalTotalKey = 'Mental_Total';

if (damage <= 0) {
  return `${type} successfully resisted!`;
}

if (damage > entity.system.props[attribute]) {
  props[physicalTotalKey] -= damage;
  entity.update({ 'system.props': props });
  return `You reveive ${damage} physical damage!`;
} else {
  const mentalRemaining = Number(props[mentalTotalKey]) - damage;
  if (mentalRemaining < 0) {
    const mental = Number(props[mentalTotalKey]);
    props[mentalTotalKey] = 0;
    props[physicalTotalKey] -= -mentalRemaining;
    entity.update({ 'system.props': props });
    return `You receive ${mental} mental damage & ${-mentalRemaining} physical damage!`;
  } else {
    props[mentalTotalKey] -= mentalRemaining;
    entity.update({ 'system.props': props });
    return `You receive ${damage} mental damage!`;
  }
}
```

The macro applies damage if the character couldn't resist successfully and returns an appropriate message.
