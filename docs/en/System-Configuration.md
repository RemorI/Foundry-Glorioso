# System Configuration

## Use your own CSS

You can customize your sheets with your own CSS. For more information, see here: [Use you own CSS](./Tips-&-Tricks/Use-your-own-CSS).

## Initiative formula

In the system settings, you can set your custom initiative formula. This formula must be formatted like a roll formula, returning only an integer. The `${}$` must not be set around the formula.

## Roll visibility

By default, chat messages with rolls will follow FoundryVTT's roll visibility's system, meaning that the messages will always be visible by everyone but

- When Public Roll is selected, the roll & formulas data will be visibile by everyone.
- When Private GM Roll is selected, the roll & formulas data will be visible by the GM and the message's author, other players will see a question mark instead.
- When Blind GM Roll is selected, the roll & formulas data will be visible by the GM only, other players will see a question mark instead.
- When Self Roll is selected, the roll & formulas data will be visible by the author only, other players will see a question mark instead.

In the system's settings, you can expand the roll visibility to the whole messages posted using the sheets. The message will be whispered to its recipients only and not polluting the chat Log. Players will still be able to show the message to everyone using the right-click > Show to everyone option, and the roll and formulas data will follow the rules above.

## Roll Icons

You can add an icon next to rollable labels to make them more visible. To do so, in the system configuration enter a valid [fontawesome](https://fontawesome.com) icon name, like `dice-d20`, to show this icon next to all rollable items.

## Delay entity saving

Activating this setting will disable the default of saving the sheet on each field edition to save only when the user clicks the save button at the top of the sheet. This can be useful if your sheet get large and take some time to reload, especially if you try to input data quickly.
