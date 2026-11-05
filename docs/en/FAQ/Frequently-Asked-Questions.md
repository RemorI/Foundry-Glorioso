### Q: I want to compare if 2 strings are equal, and I tried it with the comparison operator `==`, but it doesn't work.

**A:** Comparison operators don't work with strings, so

```js
DropdownKey == 'Dexterity' ? 1 : 0;
```

for example would throw an error. You should use `equalText()` instead if you want to compare 2 strings for equality:

```js
equalText(DropdownKey, 'Dexterity') ? 1 : 0;
```

### Q: When I drop an Item into an Item Displayer, it also appears in other Item Displayers. How do I prevent that?

**A:** First things first, Item Displayers are only displaying Items, they do not contain them. All Items are stored
in the Actor. Just imagine that your Actor is your actual backpacks carrying your Items while your Item Displayer is
only a window, which shows what your backpack currently contains.

So back to the question... How can we prevent an Item getting displayed in other Item Displayers? **With Filters!** You
are able to configure filters for every Item Displayer. Not only can you limit the Item Templates an Item needs in order to
be displayed, you can also specify a Filter Formula. In this case, your Formula has to resolve to `true` for the Item
to be displayed. For example, an Item has the checkbox with the key `equipped`. In order to display only equipped Items,
your Formula should be `item.equipped` (or `not(item.equipped)` for only unequipped ones). You can construct more
complex logical expressions with `and` and `or`, you only have to make sure that the result is either `true` or `false`.

### Q: I want to get the Label of the option instead of the Key of the option in the Dropdown.

**A:** That's not possible, you can only retrieve the key of an option, that's the only value that is being saved in the system properties.
The label-option is just a visual display.

### Q: My Dropdown contains Keys to other components, how do I get the value of those?

**A:** If your Dropdown-options are referring to other Component-Keys, then you can use `ref(dropdownKey)` to get
their value. What happens internally is the following:

Let's assume we have a Dropdown with the key `Dropdown` and this Dropdown refers to these Components:

```
Strength: 5,
Dexterity: 7,
Constitution: 3
```

If we use the Formula `ref(Dropdown)` and the currently selected value is `Strenght`, then `ref(Dropdown)` becomes
`ref('Strenght')`, which will be interpreted by `ref()` as a Key and resolved to `5`. To keep it short:

- `ref('Strength')` == `Strength`
- `Strength` -> `5`

- `ref(Dropdown)` -> `ref('Strength')`
- `ref('Strength')` -> `5`

### Q: I want to ask the user for input before a roll gets submitted.

**A:** That's easy. Just take a look at this example:

```
${#?{userInput|0}}$
${[1d20] + userInput}$
```

Read [this](../Formulas/Chat-Messages#user-inputs) for more information about
user inputs.

### Q: I want to make my Roll Messages look prettier.

**A:** You can use HTML and CSS to apply some basic formatting to the Roll Message. Here an example with a Roll Message, which
has a table with 2 columns:

```
<table>
<tr>
<th>Custom Roll</th>
</tr>
<tr>
<td>Roll</td>
<td>${Roll:=[1d20]}$</td>
</tr>
<tr>
<td>Roll-Mod</td>
<td>${?{Roll_Mod|0}}$</td>
</tr>
<tr>
<td><strong>Total</strong></td>
<td><strong>${Roll + Roll_Mod}$</strong></td>
</tr>
</table>
```

### Q: Can I fetch from a Table like I do from a Dynamic Table?

**A:** No, `lookup()` only works on Dynamic Tables and Item Displayers.

### Q: I want to create a button, which subtracts my current ammo by 1 when I click on it.

**A:** You have 2 options here: Either you use [one of the set-functions](../Formulas/Functions) or
[Scripts](../Guides/Formula-System) in your Label Roll Message.

### Q: When do I use `:` in a Label Roll Message?

**A:** You only have to use `:` if you want to use CSB-keys or Formulas inside a Roll-Formula. You can recognize
Roll-Formulas by their syntax. Everything inside `[]` in a CSB-Formula is a Roll-Formula:

**Example:**
Let´s consider we have `Strength: 8` and `Dexterity: 6`

- `${Strength}$` will return `8`
- `${[1d6]}$` will roll 1d6 and return the roll-result
- `${[:Strength:d6]}$` will replace `:Strength:` with the result. So we'll get `${[8d6]}$` as an intermediate value,
  which will roll `8d6` and return the roll-result.
- `${[:max(Strength, Dexterity):d6]}$` will replace `:min(Strength, Dexterity):` with the result. Because the
  min-function will take the lowest value of the parameters, we'll get `${[6d6]}$` as an intermediate value, which will
  roll `6d6` and return the roll-result.

### Q: How do I move components?

**A:** You can drag your components wherever you want (even between different sheets).

**Hint:** You can copy a component by holding CTRL while moving it.

### Q: My players want to apply damage to other Tokens, but they can't

**A**: The reason for this is simple: Your players lack the permission to update the values of a Token they don't own.
This is thanks to the permission system of Foundry. **The update must be performed by a GM if the user is not the owner
of the document**. This constraint must be followed in all cases.

So, is there no solution? Well, there is actually. Your players have to send the update-requests **through a GM**. And that
can be automated with [Sockets](https://foundryvtt.wiki/en/development/api/sockets). **Be aware:** This can only be done in
a module! So you have to consider if you want to develop your own module or not. More info about module development can be
found [here](https://foundryvtt.com/article/module-development/).
