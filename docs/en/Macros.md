# Macro support

## `/sheetRoll` and `/sheetAltRoll` commands

> &#x26a0;&#xfe0f; **This feature needs the module \_chatcommands installed and with version at least 1.4.0**

You can roll a predefined roll from a chat message with the `/sheetRoll` chat command. It is used with the key to the label containing the roll you want to trigger. For example : `/sheetRoll str` to trigger the roll associated with the `str` label.

To trigger dynamic table rolls, you must use a filter like the property reference, for example : `/sheetRoll skill(name=Lock picking).score` to trigger the roll associated with the label in the `score` column of the dynamic table `skill`, on the row which `name` is `Lock picking`.

The roll will be triggered for the currently selected character on the map, or the default player's character if no character is selected.

The `/sheetAltRoll` chat command does the same thing with an alternate chat message.

## Roll context menu

When right-clicking on a roll on a Character sheet, a context menu will appear, with options regarding macros. Three options are available :

1. Add as macro
   - This will show a dialog to create the new macro, asking for its name and place in the macro hotbar. When created, the macro configuration window will open for more configuration.
2. Copy chat command
   - This will copy the `/sheetRoll` command for this roll into your clipboard, allowing you to reuse it later.
3. Copy macro script
   - This will copy a basic script into your clipboard to use the roll in a script-type macro. This script is customizable to your needs.

This menu is only available on Labels which have keys.

### Macro API

In a macro, you can use some of this system's features to enhance your game.

#### `actor.roll`

```ts
function roll(
  rollCode: string,
  opts: { alternative: boolean; postMessage: boolean } = { alternative: false, postMessage: true }
): ComputablePhrase;
```

With the `actor` object, which references the current actor, you can use the `roll` method to trigger a chat roll.

- `rollCode` is the code used with `/sheetRoll`
- `alternative`: if `true`, will roll the alternative roll message, if `false`, will roll the main roll message
- `postMessage`: if `true`, will automatically post the message to the chat

The ComputablePhrase object returned by the method is detailed below.

### ComputablePhrase

The `ComputablePhrase` class is the core of this system's formulas. Its purpose is to compute the formulas entered in Labels and Rolls. And it is available in macros !

You can use it like the examples under. For more information, please refer to the [API](https://custom-system-builder.gitlab.io/custom-system-builder/classes/formulas_ComputablePhrase.ComputablePhrase.html).

```javascript
let phrase = new ComputablePhrase("This character's strength is ${str}$ (Mod : ${floor(str-10)/2}$).");
// Computing phrase with only one prop
await phrase.compute({ str: 12 });

// phrase.result returns the fully computed phrase as a String
console.log(phrase.result);
```

```javascript
let phrase = new ComputablePhrase(
  "Rolling for Weapon Skill<br/>Target : ${target:=WS}$<br/>Roll : ${roll:=[1d100]}$ -- ${roll <= target ? (roll % 11 == 0 ? 'Critical success !' : 'Success') : (roll % 11 == 0 ? 'Critical fail !' : 'Fail')}$<br/>Result : ${floor(target/10) - floor(roll/10)}$ SL (${target - roll}$)"
);
// Computing phrase with actor rollData
await phrase.compute(actor.getRollData());

// buildPhrase is a working string in which each formula has been replaced by a unique alphanumeric identifier
let buildPhrase = phrase.buildPhrase;
// values are the computed formulas of the phrase, indexed by the same unique alphanumeric identifier
let values = phrase.values;

// Rebuilding the phrase and setting each computed value bold
for (let key in values) {
  buildPhrase = buildPhrase.replace(key, '<b>' + values[key].result + '</b>');
}

console.log(buildPhrase);
```
