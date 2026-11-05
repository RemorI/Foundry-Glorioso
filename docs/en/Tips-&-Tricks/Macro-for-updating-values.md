This is a Macro, which allows to update the values of multiple selected tokens. If no token is
selected, it will perform the calculations on the character, which is selected in the user-configuration
of the current user (bottom-left corner of the window in Foundry). Code inside `*** ... ***` is meant to be replaced.

**IMPORTANT:** Use `updateProperty(actor, key, formula, additionalProps)` if you want to update your properties!
Also, the keys must be defined (see `const keys = ...`)!

```js
let actors;
const currentProperties = new Map();
const updatedProperties = new Map();

// Get the selected tokens. Default: currentPlayerActor
if (canvas.tokens.controlled.length > 0) {
  actors = canvas.tokens.controlled.map((a) => a.actor);
} else {
  if (!actor) {
    ui.notifications.error('Make sure that you select at least 1 token or that you have a configured actor');
    return;
  }
  actors = [actor];
}

for (const a of actors) {
  const additionalProps = {};

  // ***Define all needed keys here***
  const keys = ['Health', 'Strength', 'Dexterity'];
  // ***Define all needed keys here***

  keys.forEach((key) => currentProperties.set(key, a.system.props[key]));

  // ***Perform all your calculations here***
  // Reduce Health by 1
  updateProperty(a, 'Health', '${Health - 1}$');

  // Raise Strength by 2
  const updatedStrength = currentProperties.get('Strength') + 2;
  updateProperty(a, 'Strength', updatedStrength);

  // Reduce Dexterity by 1 if Strength is over 10
  if (currentProperties.get('Strength') > 10) {
    //This makes 'updatedDexterity' available in the Formula-System
    additionalProps.updatedDexterity = currentProperties.get('Dexterity') - 1;
    updateProperty(a, 'Dexterity', '${updatedDexterity}$', additionalProps);
  }

  // ***Perform all your calculations here***

  for (const element of keys) {
    if (!updatedProperties.get(element)) {
      ui.notifications.info(`${a.name}: ${element} -> unchanged`);
    } else {
      await a.update({ ['system.props.' + element]: updatedProperties.get(element) });
      ui.notifications.info(
        `${a.name}: ${element}: ${currentProperties.get(element)} -> ${updatedProperties.get(element)}`
      );
    }
  }
}

// Use this update-function
function updateProperty(actor, key, formula, additionalProps = {}) {
  updatedProperties.set(
    key,
    ComputablePhrase.computeMessageStatic(formula, {
      ...actor.system.props,
      ...additionalProps
    }).result
  );
}
```
