## 1. Macro for creating Active Effects for selected Tokens

**Module Dependencies:**

- **Effect Macro:** Allows to trigger Macros on Effect-Events
- **Visual Active Effect:** Allows Effect-Displaying and Live-Settings
- **Core Settings Expanded** and/or **Monk's Little Details:** Allows Effect-Customisation
- **Active Token Effect:** Allows to change Token-Settings via Effects with Presets
- **Simple Calendar:** Allows to use Effect-Timers with Calendar-Time. Works in combat

```js
// How to trigger a customisable effect on targets (while activating all effect modifiers and exepected behaviors in Custom System Builder)
// You can also create new effects that are not set up in your system, or change existing effects in this macro or in the UI after applying it

// Token selections, can select and apply effect on multiple tokens
let selected = canvas.tokens.controlled;
if (selected.length === 0) {
  ui.notifications.warn('Select at least one token !');
} else {
  selected.forEach(async (token) => {
    // Effect settings
    let effectData = {
      changes: [
        {
          key: 'system.props.DEX',
          mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
          priority: 2,
          value: 3
        }, // Multiply DEX by 3
        { key: 'system.props.CONST', mode: CONST.ACTIVE_EFFECT_MODES.ADD, priority: 1, value: 5 }, // Add by 5. Be aware, that it might concat your values instead if your base value is of type string. In this case, use mode OVERRIDE instead
        {
          key: 'system.props.STR',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          priority: 0,
          value: '${DEX + 2}$'
        }, // mode CUSTOM allows the use of CSB-Formulas
        { key: `ATL.preset`, value: 'Torch' } // This is a custom token settings using Active Token Effect preset to create a torch light (see Active Token Effect module)
      ],
      name: 'Invisible', // Display name of the effect on the UI if you use Visual Active Effect, can be customized
      img: 'icons/svg/invisible.svg', // Display icon of the effect on token HUD (and UI if you use Visual Active Effect), can be customized
      tint: '#ff0000', // Coloration of the icon (delete this line for no coloration)
      duration: { seconds: 60 }, // Time in second (delete this line for unlimited), will be converted in combat time automaticaly (only if you use Simple Calendar) and showed in the UI (if you have Visual Active Effect)
      origin: token.document.uuid, // Origin of the effect (the token itself in this exemple) diplay on UI if you have Visual Active Effect
      sourceName: 'Invisibility spell', // The source of the effect (must be a string), diplay on the effect window if you have Visual Active Effect
      disabled: false, // If the effect should be disable when created (boolean)
      description: 'This does that...', // Description of the effect showed in the UI if you have Visual Active Effect
      statuses: ['invisible'] // Actual ID of the effect (IMPORTANT), can be found in Core Settings Expanded and/or Monk's little details, if not set correctly it will not trigger default modifiers and behavior of the system, if you want to create a non-system existing effect, enter a new value here
    };

    // Apply the effect to tokens
    let activeEffect = await token.actor.createEmbeddedDocuments('ActiveEffect', [effectData]);

    // Script when the effect is created
    ui.notifications.warn('Effect created');

    // Special triggering script on specifics events (must have Effect Macro)
    activeEffect.forEach(async (effect) => {
      // Effect is deleted
      effect.setFlag('effectmacro', 'onDelete.script', 'ui.notifications.warn("Effect created");');

      // Effect is toggled (on and off)
      effect.setFlag('effectmacro', 'onToggle.script', 'ui.notifications.warn("Effect toggled on or off");');

      // Effect is toggled on
      effect.setFlag('effectmacro', 'onEnable.script', 'ui.notifications.warn("Effect toggled on");');

      // Effect is toggled off
      effect.setFlag('effectmacro', 'onDisable.script', 'ui.notifications.warn("Effect toggled off");');

      // Fight starts
      effect.setFlag('effectmacro', 'onCombatStart.script', 'ui.notifications.warn("Fight starts");');

      // Fight ends
      effect.setFlag('effectmacro', 'onCombatEnd.script', 'ui.notifications.warn("Fight ends");');

      // End of the turn of the token with the effect
      effect.setFlag(
        'effectmacro',
        'onTurnEnd.script',
        'ui.notifications.warn("End of the turn of the token having this effect");'
      );

      // Every turn start
      effect.setFlag('effectmacro', 'onEachTurn.script', 'ui.notifications.warn("Turn start (of anyone)");');

      // When the token with the effect is defeated
      effect.setFlag(
        'effectmacro',
        'onCombatantDefeated.script',
        'ui.notifications.warn("Token having this effect is defeated");'
      );
    });
  });
}
```

**Author:** masta_gooz (Discord)

## 2. Script for reading Active Effect Stacks

**Module Dependencies:**

- **Status Icon Counters**

**Returns: number**

**Description:** This Script allows to read the current stacks of an Active Effect provided by the
"Status Icon Counter"-Module.

```js
return entity.appliedEffects.find((e) => e.name === 'Dead')?.flags.statuscounter.counter.value ?? 0;
```

If you want to read the duration instead, you can use the following Script:

```js
return entity.appliedEffects.find((e) => e.name === 'Dead')?.duration.remaining ?? 0;
```

Alternative to reading the Stacks by leveraging the API from **Status Icon Counters**:

**Input-Parameters:**

- **effect_name**: The name of the Effect in question
- **token**: The Token in question

```js
const effect = CONFIG.statusEffects.find((e) => e.name === effect_name);
// You can also use EffectCounter.findCounterValue to get the value directly instead of the EffectCounter-Object
let effect_counter = EffectCounter.findCounter(token.document, effect.icon);
```

**Authors:** [Martin1522](https://gitlab.com/martin1522), Nao (Discord)

## 3. Macro to toggle Active Effects

**Module Dependencies:**

- **Status Icon Counters**

**Input-Parameters:**

- **entity: CustomActor**
- **effectId: string** (Hint: You can find the correct effectId under `CONFIG.statusEffects[].id`)

**Description:** This Macro allows to toggle an Active Effect between active / removed.

```js
const statusEffectConfig = CONFIG.statusEffects.find((effect) => effect.id === effectId);
const activeEffect = entity.appliedEffects.find((e) => e.name === statusEffectConfig.name);

if (activeEffect) {
  await activeEffect.delete();
} else {
  await ActiveEffect.create(await ActiveEffect.fromStatusEffect(effectId), { parent: entity });
}
```

**Author:** [Martin1522](https://gitlab.com/martin1522)

## 4. World Script for adding custom Status Effects in the config

**Module Dependencies:**

- **World Scripter**

**Description:** This Macro adds custom Status Effects in the config, which will be used by the system. You have to
add it to the World Scripter Compendium, so that it executes automatically on every reload of the World. Or you use
this guide here: https://foundryvtt.wiki/en/basics/world-scripts

```js
CONFIG.statusEffects = [
  {
    id: 'concentrating',
    name: 'Concentrating',
    img: 'icons/magic/time/hourglass-brown-orange.webp'
  },
  {
    id: 'poisoned',
    name: 'Poisoned',
    img: 'icons/svg/poison.svg'
  }
];
```

**Author:** [Martin1522](https://gitlab.com/martin1522)
