## Introduction

Handling dice pools in CSB can be a bit challenging if the sole result of the Foundry Roll API doesn't suffice (e.g. if
you want to know the number of successes and failures in a die pool at the same time). To achieve that, you have to work
quite a bit with the CSB-API. Until CSB implements a nice way to handle such cases with dice pools, you can refer to this
Example here.

### Preconditions

- Label, where you execute the Script
- Label with the Label Roll Message including the Roll Formula and placeholders, which should be replaced with data
  (can be hidden from Users)

### Label with the Label Roll Message

- **Key**: phrase

```html
<p><strong>Successes:</strong>${[10d6cf=1cs>4]}$</p>
<p><strong>Failures: </strong>PLACEHOLDER</p>
```

### Label with the Script

- **Send roll message to chat**: false

```js
// The key to our Label, which holds our original Label Roll Message.
// The Script assumes, that the Label is in the same Entity
const labelKey = 'phrase';

// You can use 'alternative' instead of 'main' if you have an alternative Label Roll Message
const phrase = await entity.getCustomRolls()[labelKey]['main'](false, {
  ...options,
  explanation: false
});

// This might be a different index depending on the amount of phrases you have in your Label Roll Message
// If you're unsure about the index, simply add "console.warn(phrase.values);" in the Script and check the console
const rolls = Object.values(phrase.values)[0].rolls;

const results = rolls[0].roll.terms[0].results;

// Handle all your logic here. It's worth to check the "results"-Array with "console.warn(results);" in the console
const failures = results.filter((result) => result.failure).length;

// We edit the phrase and replace the placeholder with our result before it gets posted
phrase._buildPhrase = phrase.buildPhrase.replace('PLACEHOLDER', failures);

// The rest here is boilerplate, so it should look the same in all cases
const speaker = ChatMessage.getSpeaker({
  actor: entity.entity,
  token: entity.entity.getActiveTokens()?.[0]?.document ?? null,
  scene: game.scenes.current
});

phrase.postMessage({ speaker });
```

The current downside of this Script is that the replaced value doesn't have an explanation (the clickable grey box
around the value in the Chat Message). It might be possible with a different approach, but I'll skip that here. If
someone comes up with a solution to this issue, you're free to share it with me, so I can adjust the example to include
that.
